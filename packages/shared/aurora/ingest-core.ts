// Pure record -> row mapping for the aurora schema. No I/O: the Edge Function and
// the backfill CLI both build a plan here and then execute it against PostgREST.
//
// Two things in here are correctness-critical and easy to get wrong:
//
// 1. ORDER. aurora.player_positions has a composite foreign key into
//    aurora.players, which in turn references aurora.servers, and vehicles /
//    safehouses / zones / zombie_grid / item_catalog all reference servers. So
//    the plan is an ORDERED list, servers first, and the executor must not
//    parallelise it.
//
// 2. DEDUPE. Postgres rejects an INSERT ... ON CONFLICT DO UPDATE whose payload
//    touches the same key twice ("cannot affect row a second time"), and a 50 s
//    ingest window routinely contains many `pos` lines for one player. Every
//    keyed table is therefore deduped to the newest record per key before it is
//    sent. player_position_history is the deliberate exception: it is append-only
//    and keeps every sample.

import type {
  AuroraRecord,
  BootRecord,
  CatalogRecord,
  LinkRecord,
  PosRecord,
  ShRecord,
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

export interface IngestPlan {
  /** Dependency-ordered. Execute sequentially. */
  upserts: TableUpsert[];
  /** Consumed via the consume_link_code RPC, not an upsert. */
  links: LinkRecord[];
  counts: Record<string, number>;
}

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

/**
 * Build the ordered upsert plan for one batch of records.
 *
 * `serverId` comes from the caller, never from the log, so a log file copied
 * between servers cannot write into the wrong server's rows.
 */
export function buildPlan(records: AuroraRecord[], serverId: string): IngestPlan {
  const counts: Record<string, number> = {};
  for (const r of records) counts[r.k] = (counts[r.k] ?? 0) + 1;

  const positions = byKind(records, 'pos');
  const vehicles = byKind(records, 'veh');
  const safehouses = byKind(records, 'sh');
  const zones = byKind(records, 'zone');
  const zgrid = byKind(records, 'zgrid');
  const catalog = byKind(records, 'catalog');
  const boots = byKind(records, 'boot');
  const links = byKind(records, 'link');

  const upserts: TableUpsert[] = [];

  // --- servers -------------------------------------------------------------
  // Always present so the foreign keys below resolve on a cold database. The
  // newest boot line, if any, supplies the launch stamp and version.
  const newestBoot = boots.length > 0
    ? boots.reduce((a: BootRecord, b: BootRecord) => (b.t >= a.t ? b : a))
    : undefined;
  const lastSeen = records.length > 0 ? Math.max(...records.map((r) => r.t)) : Date.now();
  const serverRow: Row = { id: serverId, last_seen: toIso(lastSeen) };
  if (newestBoot?.gv !== undefined) serverRow.game_version = newestBoot.gv;
  if (newestBoot?.ls !== undefined) serverRow.last_launch_stamp = newestBoot.ls;
  upserts.push({ table: 'servers', onConflict: 'id', rows: [serverRow] });

  // --- players -------------------------------------------------------------
  // Derived from position lines: seeing a player move is proof they are online.
  // Only these columns are sent, so an upsert never clobbers hours_survived,
  // access_level or linked_user_id, which come from other sources.
  const playerRows = dedupe(positions, (p) => p.u, (p) => p.t).map((p): Row => ({
    server_id: serverId,
    username: p.u,
    last_seen: toIso(p.t),
    online: true,
  }));
  if (playerRows.length > 0) {
    upserts.push({ table: 'players', onConflict: 'server_id,username', rows: playerRows });
  }

  // --- player_positions ----------------------------------------------------
  const positionRows = dedupe(positions, (p) => p.u, (p) => p.t).map((p): Row => ({
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
  const safehouseRows = dedupe(safehouses, (s: ShRecord) => s.id, (s) => s.t).map((s): Row => ({
    server_id: serverId,
    id: s.id,
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
    owner: s.o ?? null,
    title: s.ti ?? null,
    players: s.p ?? [],
    last_visited: s.lv === undefined ? null : toIso(s.lv),
    created_at: s.c === undefined ? null : toIso(s.c),
  }));
  if (safehouseRows.length > 0) {
    upserts.push({ table: 'safehouses', onConflict: 'server_id,id', rows: safehouseRows });
  }

  // --- zones ---------------------------------------------------------------
  const zoneRows = dedupe(
    zones,
    (z: ZoneRecord) => `${z.kd}\u0000${z.ti}\u0000${z.x1}\u0000${z.y1}`,
    (z) => z.t,
  ).map((z): Row => ({
    server_id: serverId,
    kind: z.kd,
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
      count: g.n,
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

  // --- item_catalog --------------------------------------------------------
  const catalogRows = dedupe(catalog, (c: CatalogRecord) => c.ft, (c) => c.t).map((c): Row => ({
    server_id: serverId,
    full_type: c.ft,
    display_name: c.dn ?? null,
    category: c.cat ?? null,
    weight: c.wt ?? null,
    catalog_version: c.cv ?? null,
  }));
  if (catalogRows.length > 0) {
    upserts.push({
      table: 'item_catalog',
      onConflict: 'server_id,full_type',
      rows: catalogRows,
    });
  }

  return { upserts, links, counts };
}

// ---------------------------------------------------------------------------
// RCON -> health_samples
// ---------------------------------------------------------------------------

/**
 * RCON stat key -> health_samples column.
 *
 * Unit note: avg-update-period lands in avg_update_period_ms on the assumption
 * that the server already reports milliseconds. T01 recorded the key names but
 * not their units, so if the dashboard shows an implausible figure this mapping
 * is the first thing to check.
 */
export const HEALTH_KEYS: Record<string, string> = {
  'players': 'players',
  'zombies-total': 'zombies_total',
  'zombies-loaded': 'zombies_loaded',
  'zombies-simulated': 'zombies_simulated',
  'zombies-culled': 'zombies_culled',
  'loaded-cells': 'loaded_cells',
  'memory-used': 'memory_used',
  'memory-max': 'memory_max',
  'avg-update-period': 'avg_update_period_ms',
  'sent-bps': 'sent_bps',
  'received-bps': 'received_bps',
};

/**
 * Build one health_samples row. Every stat goes into `raw`; the eleven mapped
 * keys are additionally promoted to typed columns.
 *
 * `playerCount` comes from the `players` roster rather than the stats block,
 * because the roster is what the site's online list is built from and the two
 * must not disagree.
 */
export function buildHealthSample(
  serverId: string,
  at: Date,
  stats: Record<string, number>,
  playerCount: number,
): Row {
  const row: Row = {
    server_id: serverId,
    t: at.toISOString(),
    players: playerCount,
    raw: stats,
  };
  for (const [statKey, column] of Object.entries(HEALTH_KEYS)) {
    if (column === 'players') continue; // roster wins
    const value = stats[statKey];
    if (value !== undefined && Number.isFinite(value)) row[column] = value;
  }
  return row;
}

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
