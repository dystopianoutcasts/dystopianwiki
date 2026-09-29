// Pure record -> row mapping for the aurora schema. No I/O: the Edge Function and
// the backfill CLI both build a plan here and then execute it against PostgREST.
//
// Three things in here are correctness-critical and easy to get wrong:
//
// 1. ORDER. aurora.player_positions has a composite foreign key into
//    aurora.players, which in turn references aurora.servers, and vehicles /
//    safehouses / zones / zombie_grid / item_catalog / health_samples all
//    reference servers. So the plan is an ORDERED list, servers first, and the
//    executor must not parallelise it. Patches run AFTER the upserts.
//
// 2. DEDUPE. Postgres rejects an INSERT ... ON CONFLICT DO UPDATE whose payload
//    touches the same key twice ("cannot affect row a second time"), and a 50 s
//    ingest window routinely contains many `pos` lines for one player. Every
//    keyed table is therefore deduped to the newest record per key before it is
//    sent. player_position_history is the deliberate exception: it is append-only
//    and keeps every sample.
//
// 3. HEALTH COMES FROM THE EXPORTER, NOT RCON. RCON was retired (STATUS "RCON
//    OPEN QUESTION ANSWERED"): it is plaintext over the public internet and every
//    counter it offered is in the heartbeat's `st` tables. Nothing in this file
//    knows how to talk to RCON and nothing should be added that does.

import type {
  AuroraRecord,
  BootRecord,
  CatalogRecord,
  HbRecord,
  LinkRecord,
  ShRecord,
  StatTables,
  VehRecord,
  ZgridRecord,
  ZoneRecord,
} from './parser.ts';

export type Row = Record<string, unknown>;

export interface TableUpsert {
  table: string;
  /** Comma-separated primary key columns, for PostgREST's on_conflict. */
  onConflict: string;
  rows: Row[];
}

/** A PATCH against `table?filter`, run after every upsert in the plan. */
export interface TablePatch {
  table: string;
  /** PostgREST filter query string, already encoded. */
  filter: string;
  body: Row;
  why: string;
}

/** A DELETE against `table?filter`, run after every upsert and patch in the plan. */
export interface TableDelete {
  table: string;
  /** PostgREST filter query string, already encoded. */
  filter: string;
  why: string;
}

export interface IngestPlan {
  /** Dependency-ordered. Execute sequentially. */
  upserts: TableUpsert[];
  /** Run after the upserts, in order. */
  patches: TablePatch[];
  /** Run after the upserts and patches, in order. */
  deletes: TableDelete[];
  /** Consumed via the consume_link_code RPC, not an upsert. */
  links: LinkRecord[];
  counts: Record<string, number>;
}

export interface PlanOptions {
  /** From the log file name (parser.launchStampFromFileName). Written to servers.last_launch_stamp. */
  launchStamp?: string | null;
  /**
   * "Now" for the online reconcile, in server epoch ms. Defaults to the newest
   * `t` in the batch, because the log is the clock: a backfill of an old bundle
   * must not mark everyone offline just because the replay happens later.
   */
  now?: number;
}

/** A player seen this recently in a `pos` record is online. */
export const ONLINE_WINDOW_MS = 2 * 60_000;

/** Server epoch milliseconds -> Postgres timestamptz. */
export function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

/** Keep the newest record per key. Later ties win, matching log order. */
function dedupe<T>(items: T[], key: (i: T) => string, stamp: (i: T) => number): T[] {
  const best = new Map<string, T>();
  for (const item of items) {
    const k = key(item);
    const prev = best.get(k);
    if (prev === undefined || stamp(item) >= stamp(prev)) best.set(k, item);
  }
  return [...best.values()];
}

function byKind<K extends AuroraRecord['k']>(
  records: AuroraRecord[],
  kind: K,
): Extract<AuroraRecord, { k: K }>[] {
  return records.filter((r) => r.k === kind) as Extract<AuroraRecord, { k: K }>[];
}

function newestOf<T extends { t: number }>(items: T[]): T | undefined {
  return items.length > 0 ? items.reduce((a, b) => (b.t >= a.t ? b : a)) : undefined;
}

/**
 * Build the ordered upsert plan for one batch of records.
 *
 * `serverId` comes from the caller, never from the log, so a log file copied
 * between servers cannot write into the wrong server's rows.
 */
export function buildPlan(records: AuroraRecord[], serverId: string, opts: PlanOptions = {}): IngestPlan {
  const counts: Record<string, number> = {};
  for (const r of records) counts[r.k] = (counts[r.k] ?? 0) + 1;

  const positions = byKind(records, 'pos');
  const vehicles = byKind(records, 'veh');
  const safehouses = byKind(records, 'sh');
  const zones = byKind(records, 'zone');
  const zgrid = byKind(records, 'zgrid');
  const catalog = byKind(records, 'catalog');
  const heartbeats = byKind(records, 'hb');
  const links = byKind(records, 'link');

  const newestT = records.length > 0 ? Math.max(...records.map((r) => r.t)) : undefined;
  const now = opts.now ?? newestT ?? Date.now();

  const upserts: TableUpsert[] = [];
  const patches: TablePatch[] = [];
  const deletes: TableDelete[] = [];

  // --- servers -------------------------------------------------------------
  // Always present so the foreign keys below resolve on a cold database. The
  // exporter's boot record carries no version or stamp (observed shape); the
  // launch stamp is the file name, supplied by the caller. game_version is left
  // untouched until the exporter emits one.
  const serverRow: Row = { id: serverId, last_seen: toIso(newestT ?? now) };
  if (opts.launchStamp) serverRow.last_launch_stamp = opts.launchStamp;
  upserts.push({ table: 'servers', onConflict: 'id', rows: [serverRow] });

  // --- health_samples ------------------------------------------------------
  // Right after servers: nothing else depends on it and it must not wait behind
  // a large position batch.
  const healthRows = buildHealthRows(heartbeats, serverId);
  if (healthRows.length > 0) {
    upserts.push({ table: 'health_samples', onConflict: 'server_id,t', rows: healthRows });
  }

  // --- players -------------------------------------------------------------
  // Derived from position lines. A player whose newest position is within the
  // online window is online; one seen in this batch but not that recently is
  // offline (they were online earlier in the window and have since stopped
  // producing positions, which is what logging off looks like).
  // Only these columns are sent, so an upsert never clobbers hours_survived,
  // access_level, linked_user_id or the players.db columns.
  const newestPositions = dedupe(positions, (p) => p.u, (p) => p.t);
  const playerRows = newestPositions.map((p): Row => ({
    server_id: serverId,
    username: p.u,
    last_seen: toIso(p.t),
    online: now - p.t <= ONLINE_WINDOW_MS,
  }));
  if (playerRows.length > 0) {
    upserts.push({ table: 'players', onConflict: 'server_id,username', rows: playerRows });
  }

  // When the newest heartbeat says nobody is online AND it is the latest word
  // in the batch (no position is newer than it), everyone on the server is
  // offline, including players this batch never saw. Applied after the upserts
  // so the heartbeat overrides positions older than itself.
  const newestHb = newestOf(heartbeats);
  const newestPosT = newestOf(positions)?.t ?? -Infinity;
  if (newestHb !== undefined && onlineCount(newestHb) === 0 && newestHb.t >= newestPosT) {
    patches.push({
      table: 'players',
      filter: `server_id=eq.${encodeURIComponent(serverId)}&online=is.true`,
      body: { online: false },
      why: `heartbeat at ${toIso(newestHb.t)} reports 0 players online`,
    });
  }

  // --- player_positions ----------------------------------------------------
  const positionRows = newestPositions.map((p): Row => ({
    server_id: serverId,
    username: p.u,
    x: p.x,
    y: p.y,
    z: p.z ?? 0,
    t: toIso(p.t),
    vehicle_id: p.v ?? null,
  }));
  if (positionRows.length > 0) {
    upserts.push({
      table: 'player_positions',
      onConflict: 'server_id,username',
      rows: positionRows,
    });
  }

  // --- player_position_history --------------------------------------------
  // Every sample, not just the newest: this table IS the delayed public feed.
  const historyRows = positions.map((p): Row => ({
    server_id: serverId,
    username: p.u,
    x: p.x,
    y: p.y,
    z: p.z ?? 0,
    t: toIso(p.t),
  }));
  if (historyRows.length > 0) {
    upserts.push({ table: 'player_position_history', onConflict: '', rows: historyRows });
  }

  // --- vehicles ------------------------------------------------------------
  const vehicleRows = dedupe(vehicles, (v: VehRecord) => String(v.id), (v) => v.t).map(
    (v): Row => ({
      server_id: serverId,
      vehicle_id: v.id,
      script_name: v.sc ?? null,
      x: v.x,
      y: v.y,
      z: v.z ?? 0,
      t: toIso(v.t),
      driver_username: v.d ?? null,
    }),
  );
  if (vehicleRows.length > 0) {
    upserts.push({
      table: 'vehicles',
      onConflict: 'server_id,vehicle_id',
      rows: vehicleRows,
    });
  }

  // --- safehouses ----------------------------------------------------------
  const safehouseRows = dedupe(safehouses, (s: ShRecord) => String(s.id), (s) => s.t).map((s): Row => ({
    server_id: serverId,
    id: String(s.id),
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
    owner: s.o ?? null,
    title: s.ti ?? null,
    players: s.p ?? [],
    last_visited: s.lv === undefined ? null : toIso(s.lv),
    created_at: s.cr === undefined ? null : toIso(s.cr),
  }));
  if (safehouseRows.length > 0) {
    upserts.push({ table: 'safehouses', onConflict: 'server_id,id', rows: safehouseRows });
  }

  // --- zones ---------------------------------------------------------------
  const zoneRows = dedupe(
    zones,
    (z: ZoneRecord) => `${z.kind}\u0000${z.ti}\u0000${z.x1}\u0000${z.y1}`,
    (z) => z.t,
  ).map((z): Row => ({
    server_id: serverId,
    kind: z.kind,
    title: z.ti,
    x1: z.x1,
    y1: z.y1,
    x2: z.x2 ?? null,
    y2: z.y2 ?? null,
  }));
  if (zoneRows.length > 0) {
    upserts.push({
      table: 'zones',
      onConflict: 'server_id,kind,title,x1,y1',
      rows: zoneRows,
    });
  }

  // --- zombie_grid ---------------------------------------------------------
  const zgridRows = dedupe(zgrid, (g: ZgridRecord) => `${g.cx}\u0000${g.cy}`, (g) => g.t).map(
    (g): Row => ({
      server_id: serverId,
      cell_x: g.cx,
      cell_y: g.cy,
      count: g.c,
      t: toIso(g.t),
    }),
  );
  if (zgridRows.length > 0) {
    upserts.push({
      table: 'zombie_grid',
      onConflict: 'server_id,cell_x,cell_y',
      rows: zgridRows,
    });
  }

  // --- zombie_grid staleness -------------------------------------------------
  // zombie_grid is upsert-only on (server_id, cell_x, cell_y): the exporter emits
  // one zgrid line per NON-EMPTY cell each minute, so a cell that unloads, or a
  // server with zero loaded zombies, writes nothing and its old row lives
  // forever (5 rows aged 02:23-12:33 UTC seen at 13:28 while health read 0
  // zombies). Two rules retire stale rows; at most one fires per batch:
  //
  //   1. A batch WITH zgrid records deletes every row for this server older
  //      than the newest zgrid `t` in that same batch - cells reported now win,
  //      cells absent from this pass are stale.
  //   2. A batch with NO zgrid record fresher than (newest tick heartbeat's `t`
  //      minus 90 s), where that heartbeat's st.game loaded-zombie count reads
  //      0, means every zombie has despawned: clear the whole grid for this
  //      server. This subsumes rule 1 (it deletes a superset of what rule 1
  //      would), so it takes priority when both conditions hold.
  const newestZgridT = zgrid.length > 0 ? Math.max(...zgrid.map((g) => g.t)) : undefined;
  const newestTickHb = newestOf(heartbeats.filter(isHealthHeartbeat));
  const zeroZombieHb =
    newestTickHb !== undefined && newestTickHb.st?.game?.['zombies-loaded'] === 0 ? newestTickHb : undefined;

  if (zeroZombieHb !== undefined && (newestZgridT === undefined || newestZgridT < zeroZombieHb.t - 90_000)) {
    deletes.push({
      table: 'zombie_grid',
      filter: `server_id=eq.${encodeURIComponent(serverId)}`,
      why: `tick heartbeat at ${toIso(zeroZombieHb.t)} reports 0 loaded zombies and no zgrid record within 90 s of it`,
    });
  } else if (newestZgridT !== undefined) {
    deletes.push({
      table: 'zombie_grid',
      filter: `server_id=eq.${encodeURIComponent(serverId)}&t=lt.${encodeURIComponent(toIso(newestZgridT))}`,
      why: `zombie_grid rows older than the newest zgrid record in this batch (${toIso(newestZgridT)})`,
    });
  }

  // --- item_catalog --------------------------------------------------------
  const catalogRows = dedupe(catalog, (c: CatalogRecord) => c.ft, (c) => c.t).map((c): Row => ({
    server_id: serverId,
    full_type: c.ft,
    display_name: c.dn ?? null,
    category: c.cat ?? null,
    weight: c.w ?? null,
    catalog_version: c.cv ?? null,
  }));
  if (catalogRows.length > 0) {
    upserts.push({
      table: 'item_catalog',
      onConflict: 'server_id,full_type',
      rows: catalogRows,
    });
  }

  return { upserts, patches, deletes, links, counts };
}

// ---------------------------------------------------------------------------
// hb -> health_samples
// ---------------------------------------------------------------------------

/**
 * Statistics key -> health_samples column, per table. The engine's names are
 * kept verbatim on the left. Two traps recorded in migration 014:
 *
 * - `fps` in the perf table is the main-loop cycle DURATION in ms (~104 on the
 *   10 Hz server loop), not a frame rate. It is the tick time.
 * - `avg-update-period` is ~5% of the cycle time after a perishable reset, not
 *   an average of anything. It is deliberately NOT mapped and must never be
 *   stored as a tick figure; it survives only inside `raw`.
 */
export const HEALTH_COLUMNS: { readonly [T in keyof StatTables]-?: Readonly<Record<string, string>> } = {
  game: {
    'zombies-total': 'zombies_total',
    'zombies-loaded': 'zombies_loaded',
    'zombies-simulated': 'zombies_simulated',
    'zombies-culled': 'zombies_culled',
    'loaded-cells': 'loaded_cells',
  },
  perf: {
    'memory-used': 'memory_used',
    'memory-max': 'memory_max',
    'fps': 'tick_ms',
    'min-update-period': 'tick_min_ms',
    'max-update-period': 'tick_max_ms',
  },
  net: {
    'sent-bps': 'sent_bps',
    'received-bps': 'received_bps',
  },
};

/** Heartbeat sources that become health samples. */
export const HEALTH_SOURCES: ReadonlySet<string> = new Set(['tick']);

/** Per-object-pool counters: ~200 keys of allocator noise, dropped from raw. */
export function isPoolKey(key: string): boolean {
  return key.startsWith('Pool<');
}

function onlineCount(hb: HbRecord): number | undefined {
  const fromTables = hb.st?.game?.players;
  if (typeof fromTables === 'number' && Number.isFinite(fromTables)) return fromTables;
  if (typeof hb.players === 'number' && Number.isFinite(hb.players)) return hb.players;
  if (typeof hb.np === 'number' && Number.isFinite(hb.np)) return hb.np;
  return undefined;
}

/**
 * Whether a heartbeat is a health sample. Revision 2 heartbeats say which clock
 * fired them; only the wall-clock ("tick") ones count, because game-time ones
 * stop on an empty server and would read as gaps. A heartbeat with no `src` at
 * all is a v0.0 record from before the field existed and is kept, so the logs
 * already on the host still yield their (players-only) samples.
 */
export function isHealthHeartbeat(hb: HbRecord): boolean {
  return hb.src === undefined || HEALTH_SOURCES.has(hb.src);
}

function stripPools(table: Record<string, number> | undefined): Record<string, number> | undefined {
  if (table === undefined) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(table)) if (!isPoolKey(k)) out[k] = v;
  return out;
}

/**
 * One health_samples row from one heartbeat. Exported for the tests; buildPlan calls it.
 *
 * EVERY row carries EVERY column, null where the heartbeat had no value. PostgREST
 * rejects a bulk insert whose objects do not all have the same keys (PGRST102 "All
 * object keys must match"), and one batch routinely mixes heartbeats with and without
 * a given table. That rejection threw the whole tail and stalled the ingest from
 * 05:13 UTC on 2026-09-29 (the first v0.2.1 log) until this fix.
 */
export function buildHealthRow(hb: HbRecord, serverId: string): Row {
  const st = hb.st ?? {};
  const row: Row = {
    server_id: serverId,
    t: toIso(hb.t),
    players: onlineCount(hb) ?? null,
  };

  for (const tableName of ['game', 'perf', 'net'] as const) {
    const table = st[tableName];
    for (const [statKey, column] of Object.entries(HEALTH_COLUMNS[tableName])) {
      const value = table?.[statKey];
      row[column] = typeof value === 'number' && Number.isFinite(value) ? value : null;
    }
  }

  // Everything else survives in raw, minus the pool counters. The tables keep
  // their names so a key that appears in two of them stays distinguishable.
  const raw: Row = {};
  if (hb.src !== undefined) raw.src = hb.src;
  for (const tableName of ['game', 'perf', 'net'] as const) {
    const stripped = stripPools(st[tableName]);
    if (stripped !== undefined) raw[tableName] = stripped;
  }
  row.raw = raw;
  return row;
}

/** Health rows for a batch: only tick-sourced heartbeats, one row per timestamp. */
export function buildHealthRows(heartbeats: HbRecord[], serverId: string): Row[] {
  const eligible = heartbeats.filter(isHealthHeartbeat);
  return dedupe(eligible, (h) => String(h.t), (h) => h.t).map((h) => buildHealthRow(h, serverId));
}

// ---------------------------------------------------------------------------
// players.db -> players
// ---------------------------------------------------------------------------

export interface SavedPlayer {
  /** Account name: the key of aurora.players. */
  username: string;
  /** Character name, shown on the site. */
  name: string;
  x: number;
  y: number;
}

/**
 * Rows for aurora.players from the server's players.db. Only the columns the
 * save file owns are sent: the character name and the last saved square, which
 * is what the map shows for an offline character. Coordinates are stored as
 * whole squares (the columns are INT). Rows without a username are skipped,
 * and a username that appears twice keeps its last occurrence.
 */
export function buildSavedPlayerRows(players: SavedPlayer[], serverId: string): Row[] {
  const byName = new Map<string, Row>();
  for (const p of players) {
    if (!p.username) continue;
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    byName.set(p.username, {
      server_id: serverId,
      username: p.username,
      display_name: p.name || null,
      last_saved_x: Math.round(p.x),
      last_saved_y: Math.round(p.y),
    });
  }
  return [...byName.values()];
}

// ---------------------------------------------------------------------------
// Batching, cursor
// ---------------------------------------------------------------------------

/** Split rows into batches. PostgREST is given at most `size` rows per call. */
export function chunk<T>(rows: T[], size: number): T[][] {
  if (size <= 0) throw new Error('chunk: size must be positive');
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

/**
 * Decide the read window for the next tail, given the cursor and a fresh stat.
 *
 * Rotation: the exporter truncates in place above 10,000 KiB, so a file SHORTER
 * than the cursor means the file restarted and the offset must go back to 0.
 * A different file name is likewise a fresh start. Both cases also drop the
 * carry, because a half-line from the old file cannot be completed by the new.
 */
export interface CursorState {
  file_name?: string | null;
  byte_offset?: number | null;
}

export interface ReadWindow {
  offset: number;
  length: number;
  reset: boolean;
}

export function planRead(
  cursor: CursorState | null,
  fileName: string,
  fileSize: number,
  maxBytes: number,
): ReadWindow {
  const sameFile = cursor?.file_name === fileName;
  const prev = sameFile ? (cursor?.byte_offset ?? 0) : 0;
  const rotated = sameFile && fileSize < prev;
  const offset = rotated || !sameFile ? 0 : prev;
  const length = Math.max(0, Math.min(fileSize - offset, maxBytes));
  return { offset, length, reset: rotated || !sameFile };
}

// Referenced for the type only; keeps the import honest if BootRecord grows.
export type { BootRecord };
