// The near-live tail (T23): one SFTP session per ingest run, held open for most
// of the minute, reading the new bytes every TAIL_INTERVAL_MS and writing each
// batch as it arrives. The game cannot push (B42 server Lua reaches no socket;
// STATUS 2026-09-29 05:20), so the exporter's log file IS the push and this is
// the listener getting faster, with the same one SSH handshake per minute.
//
// Runtime-neutral like rest.ts: no Deno or Node APIs, so the loop and the step
// are tested with a fake clock, a fake session and a fake database.
//
// ---------------------------------------------------------------------------
// The run is a DEADLINE, not a duration
// ---------------------------------------------------------------------------
// The deadline is measured from the run's first instruction, setup included.
// A step never begins with fewer than MIN_STEP_MS left, and an error stops the
// loop with everything before it already committed: each step advances the
// cursor only after its own rows are written, so a failed step is re-read by
// the next step or the next run, never skipped.
//
// ---------------------------------------------------------------------------
// Why the budget is capped below the lock TTL
// ---------------------------------------------------------------------------
// Overlapping runs would read the same bytes twice, and
// player_position_history is append-only, so the rows WOULD duplicate. The
// aurora.ingest_lock row (migration 016) keeps a second run out, but only
// until its TTL expires. A run allowed to outlive the TTL could be joined by
// the next minute's run, so resolveRunBudget refuses any budget within
// LOCK_MARGIN_MS of LOCK_TTL_S.

import { emptyStats, launchStampFromFileName, splitChunkBytes, type SplitStats } from './parser.ts';
import {
  buildPlan,
  chunk,
  noteOptionalError,
  type OptionalError,
  planRead,
  runPlanStep,
  type CursorState,
  type Row,
} from './ingest-core.ts';
import { activeWorldId, newestWorldRecord, registerBatchWorld, type WorldState } from './worlds.ts';
import type { UpsertOptions } from './rest.ts';

/** Time between the starts of two reads inside one run. */
export const TAIL_INTERVAL_MS = 5_000;
/** A read-parse-write step never begins with less than this left before the deadline. */
export const MIN_STEP_MS = 5_000;
/** Default run length, handshake to close. The cron's pg_net timeout is 58 s (016). */
export const DEFAULT_RUN_BUDGET_MS = 55_000;
/** aurora.ingest_lock expiry, covering a run that crashed without releasing. */
export const LOCK_TTL_S = 90;
/** The budget must end at least this long before the lock expires. */
export const LOCK_MARGIN_MS = 10_000;
/** Below this there is no room for even one tail step after setup. */
export const MIN_RUN_BUDGET_MS = 10_000;

/**
 * AURORA_RUN_BUDGET_MS -> milliseconds. Unset or blank is the default; a value
 * that is not a whole number, or lies outside [MIN_RUN_BUDGET_MS,
 * LOCK_TTL_S * 1000 - LOCK_MARGIN_MS], throws, because a silently clamped
 * budget is how a mistyped secret would turn into overlapping runs.
 */
export function resolveRunBudget(raw: string | undefined | null): number {
  if (raw == null || raw.trim() === '') return DEFAULT_RUN_BUDGET_MS;
  const n = Number(raw.trim());
  const max = LOCK_TTL_S * 1000 - LOCK_MARGIN_MS;
  if (!Number.isInteger(n) || n < MIN_RUN_BUDGET_MS || n > max) {
    throw new Error(`AURORA_RUN_BUDGET_MS must be a whole number of ms between ${MIN_RUN_BUDGET_MS} and ${max}`);
  }
  return n;
}

// ---------------------------------------------------------------------------
// The loop
// ---------------------------------------------------------------------------

export interface LoopClock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

export const realClock: LoopClock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export interface LoopOptions {
  /** Absolute epoch ms by which the loop must have stopped. */
  deadline: number;
  /** When the previous (first, out-of-loop) step began; the cadence counts from it. */
  lastStepAt: number;
  intervalMs?: number;
  minStepMs?: number;
  clock?: LoopClock;
  step: () => Promise<void>;
}

export interface LoopResult {
  /** Steps that completed. A step that threw is not counted. */
  loops: number;
  stoppedBy: 'deadline' | 'error';
  error: string | null;
}

export async function runTailLoop(opts: LoopOptions): Promise<LoopResult> {
  const interval = opts.intervalMs ?? TAIL_INTERVAL_MS;
  const minStep = opts.minStepMs ?? MIN_STEP_MS;
  const clock = opts.clock ?? realClock;

  let loops = 0;
  let next = opts.lastStepAt + interval;
  for (;;) {
    const startAt = Math.max(next, clock.now());
    if (opts.deadline - startAt < minStep) return { loops, stoppedBy: 'deadline', error: null };
    const wait = startAt - clock.now();
    if (wait > 0) await clock.sleep(wait);
    const began = clock.now();
    try {
      await opts.step();
    } catch (err) {
      return { loops, stoppedBy: 'error', error: String(err).slice(0, 300) };
    }
    loops++;
    next = began + interval;
  }
}

// ---------------------------------------------------------------------------
// One step: read from the cursor, parse, write, advance
// ---------------------------------------------------------------------------

export interface TailSession {
  list(dir: string): Promise<{ name: string; isDir: boolean }[]>;
  stat(path: string): Promise<{ size: number }>;
  readRange(path: string, offset: number, length: number): Promise<Uint8Array>;
}

export interface TailDb {
  select<T = unknown>(path: string): Promise<T[]>;
  upsert(table: string, rows: Row[], onConflict: string, opts?: UpsertOptions): Promise<void>;
  patch(path: string, body: Row): Promise<void>;
  delete(path: string): Promise<void>;
  rpc(fn: string, args: Row): Promise<unknown>;
}

export interface TailConfig {
  serverId: string;
  logDir: string;
  maxReadBytes: number;
  batchRows: number;
}

/**
 * The file a run tails and its cursor, resolved once per run. The directory is
 * listed only here: a rotation to a new file (a server restart) is picked up by
 * the next run, at most a minute later, and the old file stops growing anyway.
 */
export interface TailTarget {
  file: string;
  path: string;
  launchStamp: string | null;
  /** In memory after the first step; the lock makes this run the only writer. */
  cursor: CursorState | null;
}

export async function findTarget(session: TailSession, db: TailDb, cfg: TailConfig): Promise<TailTarget | null> {
  const entries = await session.list(cfg.logDir);
  // Names are <yyyy-MM-dd_HH-mm>_Aurora.txt, so lexical order is chronological.
  const newest = entries
    .filter((e) => !e.isDir && e.name.endsWith('_Aurora.txt'))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .at(-1);
  if (!newest) return null;
  const cursorRows = await db.select<CursorState>(
    `ingest_cursor?select=file_name,byte_offset&server_id=eq.${encodeURIComponent(cfg.serverId)}`,
  );
  return {
    file: newest.name,
    path: `${cfg.logDir}/${newest.name}`,
    launchStamp: launchStampFromFileName(newest.name),
    cursor: cursorRows[0] ?? null,
  };
}

export interface TailTotals {
  bytes: number;
  records: number;
  /** Records by kind, as parsed. */
  kinds: Record<string, number>;
  /** Rows sent per table. */
  rows: Record<string, number>;
  patches: number;
  deletes: number;
  /**
   * Optional writes skipped because the database refused them: a table or
   * function that does not exist yet (a migration not applied) or any other
   * client-side error (runPlanStep). The cursor still advanced. A non-zero count
   * is the signal to read optionalErrors.
   */
  skippedOptional: number;
  /** Why, for the first OPTIONAL_ERRORS_CAP skips of the run: the code and message. */
  optionalErrors: OptionalError[];
  stats: SplitStats;
  linksOk: number;
  linksFailed: number;
  rotated: boolean;
  /** Steps that read at least one complete line. */
  batches: number;
  /**
   * Log-to-row latency, per batch: the moment the batch's cursor write returned
   * minus the newest record's `t` (the exporter's wall clock). The tables carry no
   * insert time, so this is where T23's "in the database within 15 s" is measured.
   */
  lagMinMs: number | null;
  lagMaxMs: number | null;
  lagSumMs: number;
}

export function emptyTotals(): TailTotals {
  return {
    bytes: 0, records: 0, kinds: {}, rows: {}, patches: 0, deletes: 0, skippedOptional: 0, optionalErrors: [], stats: emptyStats(),
    linksOk: 0, linksFailed: 0, rotated: false, batches: 0,
    lagMinMs: null, lagMaxMs: null, lagSumMs: 0,
  };
}

const warnedOptional = new Set<string>();

/**
 * Count a skipped optional write, keep its error for the run summary (capped),
 * and say so once per object per isolate.
 */
function skipNote(totals: TailTotals, what: string): (err: unknown) => void {
  return (err) => {
    totals.skippedOptional++;
    noteOptionalError(totals.optionalErrors, what, err);
    if (warnedOptional.has(what)) return;
    warnedOptional.add(what);
    console.warn(JSON.stringify({ at: 'optional-skipped', what, error: String(err).slice(0, 200) }));
  };
}

function addCounts(into: Record<string, number>, from: Record<string, number>): void {
  for (const [k, n] of Object.entries(from)) into[k] = (into[k] ?? 0) + n;
}

function addStats(into: SplitStats, from: SplitStats): void {
  into.lines += from.lines;
  into.parsed += from.parsed;
  into.notAurora += from.notAurora;
  into.badJson += from.badJson;
  into.badShape += from.badShape;
  addCounts(into.unknownKind, from.unknownKind);
}

/**
 * Read the bytes after the cursor, write them, advance the cursor. Mutates
 * `target.cursor` and `totals`. The cursor is written LAST, after every row of
 * this step, and only ever to the byte after the final complete line: a partial
 * trailing line is re-read by the next step.
 *
 * `worlds` (032) is the run's world state from probeWorlds; absent or disabled,
 * the step sends exactly what it sent before 032 (no world key, no RPC). Enabled,
 * the batch's newest `world` record is registered BEFORE any data row is written
 * and every row is tagged with the answer; a batch without a record keeps the
 * run's current world. A failed registration throws, so the cursor never passes
 * rows that could not be tagged.
 */
export async function tailStep(
  session: TailSession,
  db: TailDb,
  cfg: TailConfig,
  target: TailTarget,
  totals: TailTotals,
  now: () => number = Date.now,
  worlds?: WorldState,
): Promise<void> {
  const { size } = await session.stat(target.path);
  const window = planRead(target.cursor, target.file, size, cfg.maxReadBytes);
  if (window.reset) totals.rotated = true;
  if (window.length === 0) return;

  const bytes = await session.readRange(target.path, window.offset, window.length);
  const parsed = splitChunkBytes(bytes);
  const consumed = bytes.length - parsed.carry.length;
  addStats(totals.stats, parsed.stats);
  if (consumed === 0) return;

  // The world first. aurora.worlds references servers, so on a cold database the
  // server row must exist before register_world can create the first world; the
  // bare-id upsert is the one write that precedes it and carries no world data.
  const worldRec = worlds?.enabled ? newestWorldRecord(parsed.records) : undefined;
  if (worlds !== undefined && worldRec !== undefined) {
    await db.upsert('servers', [{ id: cfg.serverId }], 'id');
    await registerBatchWorld(db, cfg.serverId, worldRec, worlds);
  }

  // seenAt is the ingest's own clock at the moment of the write (NPC rows, 029).
  const plan = buildPlan(parsed.records, cfg.serverId, {
    launchStamp: target.launchStamp,
    seenAt: new Date(now()).toISOString(),
    worldId: activeWorldId(worlds),
  });
  // An `optional` write the database refuses (a missing table, or any other 4xx)
  // is skipped and counted, not thrown: a side feature must never stall the
  // cursor. A 5xx or a network error still throws and the cursor holds.
  for (const upsert of plan.upserts) {
    for (const batch of chunk(upsert.rows, cfg.batchRows)) {
      const wrote = await runPlanStep(
        upsert.optional,
        () =>
          upsert.ignoreDuplicates === true
            ? db.upsert(upsert.table, batch, upsert.onConflict, { ignoreDuplicates: true })
            : db.upsert(upsert.table, batch, upsert.onConflict),
        skipNote(totals, upsert.table),
      );
      if (wrote) totals.rows[upsert.table] = (totals.rows[upsert.table] ?? 0) + batch.length;
    }
  }
  for (const call of plan.rpcs) {
    const wrote = await runPlanStep(call.optional, () => db.rpc(call.fn, call.args), skipNote(totals, call.fn));
    if (wrote) totals.rows[call.fn] = (totals.rows[call.fn] ?? 0) + call.rows;
  }
  for (const patch of plan.patches) {
    await db.patch(`${patch.table}?${patch.filter}`, patch.body);
    console.log(JSON.stringify({ at: 'patch', table: patch.table, why: patch.why }));
  }
  let deleted = 0;
  for (const del of plan.deletes) {
    const done = await runPlanStep(
      del.optional,
      () => db.delete(`${del.table}?${del.filter}`),
      skipNote(totals, `delete ${del.table}`),
    );
    if (done) {
      deleted++;
      console.log(JSON.stringify({ at: 'delete', table: del.table, why: del.why }));
    }
  }
  for (const link of plan.links) {
    try {
      await db.rpc('consume_link_code', { p_code: link.c, p_username: link.u, p_server_id: cfg.serverId });
      totals.linksOk++;
    } catch (err) {
      // An expired, unknown or already-used code is normal, not a run failure.
      totals.linksFailed++;
      console.warn(JSON.stringify({ at: 'link', code: link.c, error: String(err).slice(0, 200) }));
    }
  }

  const byteOffset = window.offset + consumed;
  await db.upsert('ingest_cursor', [{
    server_id: cfg.serverId,
    file_name: target.file,
    byte_offset: byteOffset,
    file_size: size,
    updated_at: new Date().toISOString(),
  }], 'server_id');
  target.cursor = { file_name: target.file, byte_offset: byteOffset };

  if (parsed.records.length > 0) {
    const lag = now() - Math.max(...parsed.records.map((r) => r.t));
    totals.lagMinMs = totals.lagMinMs === null ? lag : Math.min(totals.lagMinMs, lag);
    totals.lagMaxMs = totals.lagMaxMs === null ? lag : Math.max(totals.lagMaxMs, lag);
    totals.lagSumMs += lag;
  }

  totals.bytes += consumed;
  totals.records += parsed.records.length;
  totals.patches += plan.patches.length;
  totals.deletes += deleted;
  totals.batches++;
  addCounts(totals.kinds, plan.counts);
}
