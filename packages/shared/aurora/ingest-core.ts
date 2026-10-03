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

import { inList } from './rest.ts';
import type {
  AuroraRecord,
  BootRecord,
  CatalogRecord,
  DeathRecord,
  FacsRecord,
  FactionEntry,
  HbRecord,
  KillRecord,
  LinkRecord,
  NpcOutpostRecord,
  NpcRecord,
  PosRecord,
  ShRecord,
  StatTables,
  VehRecord,
  VnameRecord,
  ZgridRecord,
  ZoneRecord,
} from './parser.ts';

export type Row = Record<string, unknown>;

export interface TableUpsert {
  table: string;
  /** Comma-separated primary key columns, for PostgREST's on_conflict. */
  onConflict: string;
  rows: Row[];
  /**
   * The table comes from a migration that may not be applied yet (029). A
   * "table does not exist" answer is skipped and counted, not thrown, so a new
   * ingest deployed ahead of its migration cannot stall the cursor.
   */
  optional?: boolean;
  /**
   * Written by the LIVE ingest only. A replay of an old log (the backfill) must
   * skip it: the row carries `seen_at`, the ingest's own clock, and a replay would
   * make an old state look freshly seen.
   */
  liveOnly?: boolean;
  /**
   * Conflicts on `onConflict` are skipped, never merged (PostgREST
   * resolution=ignore-duplicates): for append-only rows whose key is the event
   * itself (kill_events), so a replay leaves the stored row alone.
   */
  ignoreDuplicates?: boolean;
}

/** A PATCH against `table?filter`, run after every upsert in the plan. */
export interface TablePatch {
  table: string;
  /** PostgREST filter query string, already encoded. */
  filter: string;
  body: Row;
  why: string;
}

/** A call to `aurora.<fn>(args)`, run after every upsert and before the patches. */
export interface TableRpc {
  fn: string;
  args: Row;
  /** Rows the call writes, for the totals. */
  rows: number;
  why: string;
  /** As TableUpsert.optional: a missing function is skipped, not thrown. */
  optional?: boolean;
  /** As TableUpsert.liveOnly: the backfill does not replay it. */
  liveOnly?: boolean;
}

/** A DELETE against `table?filter`, run after every upsert and patch in the plan. */
export interface TableDelete {
  table: string;
  /** PostgREST filter query string, already encoded. */
  filter: string;
  why: string;
  /** As TableUpsert.optional: a missing table is skipped, not thrown. */
  optional?: boolean;
}

export interface IngestPlan {
  /** Dependency-ordered. Execute sequentially. */
  upserts: TableUpsert[];
  /** Run after the upserts (servers exists by then), before the patches. */
  rpcs: TableRpc[];
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
  /**
   * The ingest's own clock for `seen_at` on the NPC rows (ISO). The live ingest
   * passes the moment of the write; defaults to the current time.
   */
  seenAt?: string;
  /**
   * The world every row of this batch belongs to (032, aurora.worlds). A string
   * puts `world_id` on EVERY row of every table in WORLD_TAGGED_TABLES. null or
   * absent sends no world key at all: before 032, or with 032 applied but no world
   * registered yet, when the column default NULL keeps the rows visible (NULL
   * counts as current). upsert_vehicles takes no world argument: 032 kept its
   * signature (p_server, p_rows) and it stamps servers.current_world_id itself,
   * which register_world has already set for this batch.
   */
  worldId?: string | null;
  /**
   * Which pos samples go to aurora.observe_lives (034). 'newest' (the live ingest,
   * the default): the newest sample per username that carries hs or zk. 'replay'
   * (the backfill, one plan per whole log file): every sample where a life can
   * change, in time order, so a file that spans a new character reproduces it.
   */
  lifeSamples?: 'newest' | 'replay';
}

/**
 * Tables whose rows carry `world_id` (032). vehicles is tagged inside
 * aurora.upsert_vehicles (it reads the server's current world), vehicle_claims by
 * claims.ts's rows, map_objects is not written by the importer. servers, item_catalog and vehicle_names are not
 * per world.
 */
export const WORLD_TAGGED_TABLES: ReadonlySet<string> = new Set([
  'health_samples',
  'players',
  'player_positions',
  'player_position_history',
  'safehouses',
  'zones',
  'zombie_grid',
  'deaths',
  'npc_groups',
  'npc_outposts',
  'vehicle_claims',
  'kill_events',
]);

/**
 * `rows` with `world_id: worldId` on every row, or the rows untouched when
 * worldId is not a string. Every row or none: PostgREST rejects a bulk upsert
 * whose rows have different key sets.
 */
export function tagRows(rows: Row[], worldId: string | null | undefined): Row[] {
  if (typeof worldId !== 'string' || worldId === '') return rows;
  return rows.map((r) => ({ ...r, world_id: worldId }));
}

/**
 * Put the batch's world on every tagged upsert. Mutates the plan. The rpcs are
 * left alone on purpose: an argument upsert_vehicles does not declare would make
 * PostgREST answer "could not find the function" and stall the cursor.
 */
function applyWorld(upserts: TableUpsert[], worldId: string | null | undefined): void {
  if (typeof worldId !== 'string' || worldId === '') return;
  for (const u of upserts) {
    if (WORLD_TAGGED_TABLES.has(u.table)) u.rows = tagRows(u.rows, worldId);
  }
}

/** A player seen this recently in a `pos` record is online. */
export const ONLINE_WINDOW_MS = 2 * 60_000;

/**
 * True when a PostgREST failure says the table or function does not exist: what
 * a write to an object from a migration that has not been applied answers
 * (PGRST205 / PGRST202 / 42P01 / 42883, HTTP 404). The AuroraRest message is
 * "<what>: <status> <body>", so the text is all there is to read.
 */
export function isMissingObjectError(err: unknown): boolean {
  const text = String(err);
  return /\b(PGRST205|PGRST202|42P01|42883)\b/.test(text)
    || /could not find the (table|function)/i.test(text)
    || /relation "[^"]*" does not exist/i.test(text);
}

/**
 * The HTTP status in an AuroraRest failure ("<what>: <status> <body>"), or null
 * when there is none (a network error, a timeout, anything thrown before an
 * answer came back).
 */
export function httpStatusOf(err: unknown): number | null {
  const text = err instanceof Error ? err.message : String(err);
  const m = /: ([1-5]\d\d)(?: |$)/.exec(text);
  return m ? Number(m[1]) : null;
}

/** The PostgREST / SQLSTATE code in a failure's body ({"code":"PGRST204",...}), or null. */
export function postgrestCodeOf(err: unknown): string | null {
  const m = /"code"\s*:\s*"([^"]+)"/.exec(String(err instanceof Error ? err.message : err));
  return m ? m[1] : null;
}

/**
 * True when the database answered and refused the request: an HTTP 4xx, or a
 * PostgREST error code with no status at all. False for a 5xx and for a failure
 * with neither (a network error), which may succeed on the next run.
 */
export function isClientSideError(err: unknown): boolean {
  const status = httpStatusOf(err);
  if (status !== null) return status >= 400 && status < 500;
  return postgrestCodeOf(err) !== null;
}

/** One skipped optional write, as the run summary reports it. */
export interface OptionalError {
  what: string;
  status: number | null;
  code: string | null;
  message: string;
}

/** The run summary keeps at most this many optionalErrors; the count goes on in skippedOptional. */
export const OPTIONAL_ERRORS_CAP = 20;

/** Append a skipped optional write's error to `list`, up to OPTIONAL_ERRORS_CAP entries. */
export function noteOptionalError(list: OptionalError[], what: string, err: unknown): void {
  if (list.length >= OPTIONAL_ERRORS_CAP) return;
  list.push({
    what,
    status: httpStatusOf(err),
    code: postgrestCodeOf(err),
    message: String(err instanceof Error ? err.message : err).slice(0, 300),
  });
}

/**
 * Run one write of a plan. An `optional` write (a side feature: NPCs, deaths,
 * vehicle names, the season records) that the database refuses is skipped:
 * `onSkipped` is told and the result is false. That covers a missing object (a
 * migration not applied) and every other client-side answer, any HTTP 4xx or
 * PostgREST code (a stale schema cache, a grant, a Prefer header, an exception
 * inside the function): the same request would be refused on every run, so
 * throwing would hold the cursor forever and stall ALL ingest for a side feature.
 * An optional write still throws on a 5xx or a network error (worth a retry: the
 * cursor holds and the next run tries again). A non-optional write throws on any
 * failure, as before. Returns true when the write happened.
 */
export async function runPlanStep(
  optional: boolean | undefined,
  op: () => Promise<unknown>,
  onSkipped?: (err: unknown) => void,
): Promise<boolean> {
  try {
    await op();
    return true;
  } catch (err) {
    if (optional !== true) throw err;
    if (!isMissingObjectError(err) && !isClientSideError(err)) throw err;
    onSkipped?.(err);
    return false;
  }
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
  const rpcs: TableRpc[] = [];
  const patches: TablePatch[] = [];
  const deletes: TableDelete[] = [];

  // --- servers -------------------------------------------------------------
  // Always present so the foreign keys below resolve on a cold database. The
  // exporter's boot record carries no version or stamp (observed shape); the
  // launch stamp is the file name, supplied by the caller. game_version comes from
  // the newest boot record that carries `gv` (exporter 0.5.0) and is left untouched
  // when none does.
  const serverRow: Row = { id: serverId, last_seen: toIso(newestT ?? now) };
  if (opts.launchStamp) serverRow.last_launch_stamp = opts.launchStamp;
  const gvBoot = newestOf(byKind(records, 'boot').filter((b) => typeof b.gv === 'string' && b.gv.trim() !== ''));
  if (gvBoot !== undefined) serverRow.game_version = (gvBoot.gv as string).trim().slice(0, 40);
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
  // Only these columns are sent, so an upsert never clobbers linked_user_id or
  // the players.db columns. hours_survived and access_level come from the
  // record when it carries them (exporter 0.2's hs and al); a record without
  // them leaves the stored values alone. PostgREST wants every row of one
  // request to have the same keys, so the two kinds go in separate upserts.
  const newestPositions = dedupe(positions, (p) => p.u, (p) => p.t);
  const withStats: Row[] = [];
  const withoutStats: Row[] = [];
  for (const p of newestPositions) {
    const row: Row = {
      server_id: serverId,
      username: p.u,
      last_seen: toIso(p.t),
      online: now - p.t <= ONLINE_WINDOW_MS,
    };
    if (typeof p.hs === 'number' && Number.isFinite(p.hs) && p.hs >= 0) {
      row.hours_survived = p.hs;
      row.access_level = typeof p.al === 'string' && p.al !== '' ? p.al : null;
      withStats.push(row);
    } else {
      withoutStats.push(row);
    }
  }
  for (const rows of [withStats, withoutStats]) {
    if (rows.length > 0) upserts.push({ table: 'players', onConflict: 'server_id,username', rows });
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
  // Written through aurora.upsert_vehicles (028), not a PostgREST upsert: the
  // engine reassigns net ids on every restart, so a car can take over an id
  // another row still holds and two cars can swap ids inside one batch, which no
  // single INSERT ... ON CONFLICT can do. The key is the persistent save id `q`
  // when the record has one (ONE row per car across restarts), else the net id.
  const vehicleRows = buildVehicleRows(vehicles);
  if (vehicleRows.length > 0) {
    rpcs.push({
      fn: 'upsert_vehicles',
      args: { p_server: serverId, p_rows: vehicleRows },
      rows: vehicleRows.length,
      why: `${vehicleRows.length} vehicles`,
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
    // The exporter's JSON writer (OA_Json.lua isArray) encodes an empty Lua table as
    // {} rather than [], so a safehouse with no members besides its owner arrives as
    // "p":{}. The column is TEXT[]: PostgREST rejects the object (22P02, "expected
    // JSON array") and with it the whole batch, so the ingest retried the same batch
    // every run and the site froze (2026-10-03, from 08:19 UTC). Anything that is not
    // an array is no members.
    players: Array.isArray(s.p) ? s.p.map(String) : [],
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

  // --- NPC groups and outposts (029) ----------------------------------------
  // Latest word per id across the batch, npc and npcgone together, in log order:
  // a group seen and then gone in one batch is gone, one gone and then seen again
  // is seen. Optional (029 may not be applied): see TableUpsert.optional.
  const seenAt = opts.seenAt ?? new Date().toISOString();
  const groupFinal = finalStates(records, 'npc', 'npcgone');
  const groupRows = [...groupFinal.values()]
    .filter((s) => s.rec !== undefined)
    .map((s) => buildNpcGroupRow(s.rec as NpcRecord, serverId, seenAt));
  if (groupRows.length > 0) {
    upserts.push({ table: 'npc_groups', onConflict: 'server_id,group_id', rows: groupRows, optional: true, liveOnly: true });
  }
  pushGoneDeletes(deletes, 'npc_groups', 'group_id', serverId, groupFinal);

  const outpostFinal = finalStates(records, 'npco', 'npcogone');
  const outpostRows = [...outpostFinal.values()]
    .filter((s) => s.rec !== undefined)
    .map((s) => buildNpcOutpostRow(s.rec as NpcOutpostRecord, serverId, seenAt));
  if (outpostRows.length > 0) {
    upserts.push({ table: 'npc_outposts', onConflict: 'server_id,outpost_id', rows: outpostRows, optional: true, liveOnly: true });
  }
  pushGoneDeletes(deletes, 'npc_outposts', 'outpost_id', serverId, outpostFinal);

  // --- deaths (030) -----------------------------------------------------------
  // One row per (username, t), the table's unique key, so a replay (the backfill)
  // upserts the same rows and never doubles a death. Not liveOnly: a death carries
  // its own time and replays safely. Optional: 030 may not be applied yet, and a
  // missing table must not stall the cursor.
  const deathRows = dedupe(byKind(records, 'death'), (d) => `${d.u}\u0000${d.t}`, (d) => d.t)
    .map((d) => buildDeathRow(d, serverId));
  if (deathRows.length > 0) {
    upserts.push({ table: 'deaths', onConflict: 'server_id,username,t', rows: deathRows, optional: true });
  }

  // --- vehicle names (031) ----------------------------------------------------
  // Global, not per server: a script name means the same car everywhere. The newest
  // record per script wins, and the rows OVERWRITE the 031 seed (the vanilla English
  // names), which is the point of sending them. Not liveOnly: a name carries the
  // record's own time and a replay writes the same values. Optional: 031 may not be
  // applied yet, and a missing table must not stall the cursor.
  const vnameRows = buildVehicleNameRows(byKind(records, 'vname'));
  if (vnameRows.length > 0) {
    upserts.push({ table: 'vehicle_names', onConflict: 'script_name', rows: vnameRows, optional: true });
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

  // --- season records (034) ----------------------------------------------------
  // kill_events: append-only, keyed by the event itself, so a replay inserts nothing
  // twice (ignoreDuplicates) and is not liveOnly. observe_lives: after the players
  // upsert (every rpc runs after every upsert), with the batch's world. Factions:
  // the newest full list, stamped with the ingest's clock, so liveOnly (a replay
  // would make an old list look current and delete newer factions). All three are
  // optional: 034 may not be applied yet, and a missing object must not stall the
  // cursor.
  const killRows = dedupe(byKind(records, 'kill'), (k) => `${k.u}\u0000${k.t}\u0000${k.x}\u0000${k.y}`, (k) => k.t)
    .map((k) => buildKillRow(k, serverId));
  if (killRows.length > 0) {
    upserts.push({
      table: 'kill_events',
      onConflict: 'server_id,username,t,x,y',
      rows: killRows,
      optional: true,
      ignoreDuplicates: true,
    });
  }
  const pWorld = typeof opts.worldId === 'string' && opts.worldId !== '' ? opts.worldId : null;
  const lifeRows = buildLifeSampleRows(positions, opts.lifeSamples ?? 'newest');
  if (lifeRows.length > 0) {
    rpcs.push({
      fn: 'observe_lives',
      args: { p_server: serverId, p_world: pWorld, p_rows: lifeRows },
      rows: lifeRows.length,
      why: `${lifeRows.length} life samples`,
      optional: true,
    });
  }
  const facs = newestOf(byKind(records, 'facs'));
  if (facs !== undefined) {
    const factionRows = buildFactionRows(facs);
    rpcs.push({
      fn: 'replace_factions',
      args: { p_server: serverId, p_world: pWorld, p_rows: factionRows, p_seen_at: opts.seenAt ?? new Date().toISOString() },
      rows: factionRows.length,
      why: `${factionRows.length} factions (the full list)`,
      optional: true,
      liveOnly: true,
    });
  }

  applyWorld(upserts, opts.worldId);

  return { upserts, rpcs, patches, deletes, links, counts };
}

// ---------------------------------------------------------------------------
// veh -> vehicles
// ---------------------------------------------------------------------------

/** A usable persistent save id: a positive whole number. */
function saveId(v: VehRecord): number | null {
  return typeof v.q === 'number' && Number.isSafeInteger(v.q) && v.q > 0 ? v.q : null;
}

/**
 * Rows for aurora.upsert_vehicles. Every row carries every key (sql_id and
 * claimed_by null for a record without `q`), the shape jsonb_to_recordset reads.
 *
 * Deduped twice. First to the newest record per car (by `q`, else by net id), so
 * a car seen under two net ids in one batch, which happens when the log spans a
 * restart, keeps its newest. Then to one record per net id, because two cars can
 * hold the same net id across that restart and the function parks rows by id.
 *
 * claimed_by is the record's `o`, null when empty or absent: a record with `q`
 * always states the car's current claim, and the exporter sends the empty owner
 * in the record that reports a release. A record without `q` says nothing about
 * claims and sends null, which the function does not write.
 */
export function buildVehicleRows(vehicles: VehRecord[]): Row[] {
  const perCar = dedupe(
    vehicles,
    (v: VehRecord) => (saveId(v) !== null ? `q${saveId(v)}` : `i${v.id}`),
    (v) => v.t,
  );
  return dedupe(perCar, (v: VehRecord) => String(v.id), (v) => v.t).map((v): Row => {
    const q = saveId(v);
    return {
      vehicle_id: v.id,
      sql_id: q,
      // The exporter writes `s`; `sc` was this contract's name before exporter 0.2.
      script_name: v.s ?? v.sc ?? null,
      x: v.x,
      y: v.y,
      z: v.z ?? 0,
      t: toIso(v.t),
      driver_username: v.d ?? null,
      claimed_by: q !== null && typeof v.o === 'string' && v.o !== '' ? v.o : null,
    };
  });
}

// ---------------------------------------------------------------------------
// npc, npcgone, npco, npcogone -> npc_groups, npc_outposts (029)
// ---------------------------------------------------------------------------

interface FinalState<T> {
  t: number;
  /** The record that is the latest word; undefined when the latest word is a `gone`. */
  rec?: T;
}

/**
 * The latest word per id among `kind` and `goneKind` records. Later records win
 * ties, matching log order. Groups and outposts are separate calls: their ids are
 * different namespaces.
 */
function finalStates<K extends 'npc' | 'npco'>(
  records: AuroraRecord[],
  kind: K,
  goneKind: 'npcgone' | 'npcogone',
): Map<string, FinalState<Extract<AuroraRecord, { k: K }>>> {
  const out = new Map<string, FinalState<Extract<AuroraRecord, { k: K }>>>();
  for (const r of records) {
    if (r.k !== kind && r.k !== goneKind) continue;
    const id = (r as { id: string }).id;
    const prev = out.get(id);
    if (prev !== undefined && r.t < prev.t) continue;
    out.set(id, r.k === kind ? { t: r.t, rec: r as Extract<AuroraRecord, { k: K }> } : { t: r.t });
  }
  return out;
}

/** Ids per DELETE: the filter rides in the URL, which has a length limit. */
const GONE_DELETE_IDS = 100;

/**
 * One DELETE per GONE_DELETE_IDS ids whose latest word is `gone`. The `t` guard
 * (not newer than the newest gone record of the chunk) keeps an old replayed
 * `gone` from deleting a row a later record has since refreshed.
 */
function pushGoneDeletes<T>(
  deletes: TableDelete[],
  table: string,
  idColumn: string,
  serverId: string,
  final: Map<string, FinalState<T>>,
): void {
  const gone = [...final.entries()].filter(([, s]) => s.rec === undefined);
  for (const part of chunk(gone, GONE_DELETE_IDS)) {
    const newest = Math.max(...part.map(([, s]) => s.t));
    const ids = part.map(([id]) => id);
    deletes.push({
      table,
      filter: `server_id=eq.${encodeURIComponent(serverId)}`
        + `&${idColumn}=in.${encodeURIComponent(inList(ids))}`
        + `&t=lte.${encodeURIComponent(toIso(newest))}`,
      why: `${ids.length} ${table} row(s) reported gone`,
      optional: true,
    });
  }
}

/** A kill event's row; every column present (PostgREST bulk-insert rule), z 0 when absent. */
export function buildKillRow(r: KillRecord, serverId: string): Row {
  return {
    server_id: serverId,
    username: r.u.slice(0, 100),
    x: r.x,
    y: r.y,
    z: typeof r.z === 'number' && Number.isFinite(r.z) ? r.z : 0,
    t: toIso(r.t),
  };
}

/** One observe_lives row: username and t always, hs and zk only when usable. */
function lifeRow(p: PosRecord): Row {
  const row: Row = { username: p.u, t: toIso(p.t) };
  if (typeof p.hs === 'number' && Number.isFinite(p.hs) && p.hs >= 0) row.hs = p.hs;
  if (typeof p.zk === 'number' && Number.isSafeInteger(p.zk) && p.zk >= 0) row.zk = p.zk;
  return row;
}

/**
 * Rows for aurora.observe_lives (034), in time order. Only samples that carry hs or
 * zk count. 'newest': one per username, the newest. 'replay': per username, the first
 * and the last sample, the first positive zk after a zero, and both sides of every
 * drop in zk or hs (where a new character can start), so the SQL sees every change
 * of life and every life's maxima without the whole file.
 */
export function buildLifeSampleRows(positions: PosRecord[], mode: 'newest' | 'replay'): Row[] {
  const usable = positions.filter((p) => {
    const row = lifeRow(p);
    return p.u !== '' && ('hs' in row || 'zk' in row);
  });
  if (mode === 'newest') {
    return dedupe(usable, (p) => p.u, (p) => p.t)
      .sort((a, b) => a.t - b.t)
      .map(lifeRow);
  }
  const byUser = new Map<string, PosRecord[]>();
  for (const p of usable) {
    const list = byUser.get(p.u) ?? [];
    list.push(p);
    byUser.set(p.u, list);
  }
  const kept: PosRecord[] = [];
  for (const list of byUser.values()) {
    const ordered = [...list].sort((a, b) => a.t - b.t);
    const keep = new Set<number>([0, ordered.length - 1]);
    let lastZk: number | undefined;
    let lastHs: number | undefined;
    for (let i = 0; i < ordered.length; i++) {
      const row = lifeRow(ordered[i]);
      const zk = row.zk as number | undefined;
      const hs = row.hs as number | undefined;
      const drop = (zk !== undefined && lastZk !== undefined && zk < lastZk) ||
        (hs !== undefined && lastHs !== undefined && hs < lastHs);
      if (drop && i > 0) {
        keep.add(i - 1);
        keep.add(i);
      }
      if (zk !== undefined && zk > 0 && lastZk === 0) keep.add(i);
      if (zk !== undefined) lastZk = zk;
      if (hs !== undefined) lastHs = hs;
    }
    for (const i of [...keep].sort((a, b) => a - b)) kept.push(ordered[i]);
  }
  return kept.sort((a, b) => a.t - b.t).map(lifeRow);
}

/** Longest faction name and tag kept, in characters; most members kept per faction. */
const FACTION_TEXT_MAX = 64;
const FACTION_MEMBERS_MAX = 64;

/**
 * Rows for aurora.replace_factions (034): the record's whole list, one row per name
 * (the last one wins), an empty tag as null. An empty list is an empty array, which
 * the function reads as "every faction is disbanded".
 *
 * Guarded against the shapes the parser already rejects (checkShape 'facs'), so a
 * future loosening of the parser cannot throw here: the exporter's JSON writer
 * encodes an empty Lua table as {} (the 2026-10-03 safehouse freeze), and a
 * TypeError inside the tail step holds the cursor exactly like a refused write.
 * A list that is not an array is no factions; a member list that is not an array
 * is no members; a member that is not a string is dropped.
 */
export function buildFactionRows(r: FacsRecord): Row[] {
  const byName = new Map<string, Row>();
  if (!Array.isArray(r.f)) return [];
  for (const f of r.f as unknown[]) {
    if (typeof f !== 'object' || f === null) continue;
    const e = f as Partial<Record<keyof FactionEntry, unknown>>;
    if (typeof e.n !== 'string') continue;
    const name = e.n.trim().slice(0, FACTION_TEXT_MAX);
    if (name === '') continue;
    const tag = typeof e.g === 'string' ? e.g.trim().slice(0, FACTION_TEXT_MAX) : '';
    const owner = typeof e.o === 'string' ? e.o.trim() : '';
    const members: unknown[] = Array.isArray(e.m) ? e.m : [];
    byName.set(name, {
      name,
      tag: tag === '' ? null : tag,
      owner: owner === '' ? null : owner,
      members: members
        .filter((m): m is string => typeof m === 'string' && m.trim() !== '')
        .slice(0, FACTION_MEMBERS_MAX),
    });
  }
  return [...byName.values()];
}

const DEATH_SOURCES = ['isdead', 'chardeath', 'dodeathlog', 'cosmicmap'];

/** A death's row; every column present, null when unknown (PostgREST bulk-insert rule). */
export function buildDeathRow(r: DeathRecord, serverId: string): Row {
  return {
    server_id: serverId,
    username: r.u.slice(0, 100),
    x: r.x,
    y: r.y,
    z: typeof r.z === 'number' && Number.isFinite(r.z) ? r.z : 0,
    t: toIso(r.t),
    src: typeof r.src === 'string' && DEATH_SOURCES.includes(r.src) ? r.src : null,
    hours_survived: typeof r.hs === 'number' && Number.isFinite(r.hs) && r.hs >= 0 ? r.hs : null,
  };
}

/** Longest script or display name kept, in characters. */
const VNAME_MAX = 120;

/**
 * Rows for aurora.vehicle_names from `vname` records. A pair is kept only when both
 * halves are non-empty strings; a display name equal to the script name or still
 * carrying the translation prefix is the engine's "no translation" answer and is
 * dropped (the exporter filters it too, this is the second line). Deduped to the
 * newest record per script; later records of one pass win a tie.
 */
export function buildVehicleNameRows(records: VnameRecord[]): Row[] {
  const best = new Map<string, { name: string; t: number }>();
  for (const r of records) {
    if (!Array.isArray(r.n)) continue;
    for (const pair of r.n as unknown[]) {
      if (!Array.isArray(pair) || pair.length < 2) continue;
      const [script, display] = pair as [unknown, unknown];
      if (typeof script !== 'string' || typeof display !== 'string') continue;
      const s = script.trim().slice(0, VNAME_MAX);
      const d = display.trim().slice(0, VNAME_MAX);
      if (s === '' || d === '' || d === s || d.includes('IGUI_VehicleName')) continue;
      const prev = best.get(s);
      if (prev === undefined || r.t >= prev.t) best.set(s, { name: d, t: r.t });
    }
  }
  return [...best.entries()].map(([script, v]): Row => ({
    script_name: script,
    display_name: v.name,
    updated_at: toIso(v.t),
  }));
}

function text(v: unknown, max = 120): string | null {
  return typeof v === 'string' && v !== '' ? v.slice(0, max) : null;
}

/**
 * A group's row. Every row carries every column (PostgREST rejects a bulk insert
 * whose objects differ in keys). FAILS CLOSED: a record without an explicit
 * `sen: false` is stored sensitive, so only a record that says it is safe can
 * reach the public view.
 */
export function buildNpcGroupRow(r: NpcRecord, serverId: string, seenAt: string = new Date().toISOString()): Row {
  return {
    server_id: serverId,
    group_id: r.id,
    faction_id: text(r.f),
    faction_name: text(r.fn),
    stance: text(r.st, 20),
    size: typeof r.n === 'number' && Number.isFinite(r.n) && r.n >= 1 ? Math.round(r.n) : 1,
    x: r.x,
    y: r.y,
    z: typeof r.z === 'number' && Number.isFinite(r.z) ? r.z : 0,
    source: r.src === 'squad' ? 'squad' : 'actor',
    active: r.act === 'active',
    encounter: text(r.enc, 40),
    sensitive: r.sen !== false,
    t: toIso(r.t),
    // The ingest's clock, not the game's: freshness in the views is judged on this.
    seen_at: seenAt,
  };
}

/** An outpost's row. FAILS CLOSED the same way: a record without an explicit `hid: false` is hidden. */
export function buildNpcOutpostRow(r: NpcOutpostRecord, serverId: string, seenAt: string = new Date().toISOString()): Row {
  return {
    server_id: serverId,
    outpost_id: r.id,
    faction_id: text(r.f),
    faction_name: text(r.fn),
    stance: text(r.st, 20),
    hostile: r.hp === true,
    x1: r.x1,
    y1: r.y1,
    x2: r.x2,
    y2: r.y2,
    z: typeof r.z === 'number' && Number.isFinite(r.z) ? r.z : 0,
    state: text(r.state, 40) ?? 'unknown',
    hidden: r.hid !== false,
    t: toIso(r.t),
    seen_at: seenAt,
  };
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
  /** The saved character is dead (players.db isDead). */
  isDead?: boolean;
}

/**
 * Rows for aurora.players from the server's players.db. Only the columns the
 * save file owns are sent: the character name and the last saved square, which
 * is what the map shows for an offline character. Coordinates are stored as
 * whole squares (the columns are INT). Rows without a username are skipped,
 * and a username that appears twice keeps its last occurrence (parsePlayersDb
 * reads in id order, so that is the newest character). is_dead is the save
 * file's flag for that character; the map hides dead characters and the home
 * page leaves them off the longest-survivor list.
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
      is_dead: p.isDead === true,
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
