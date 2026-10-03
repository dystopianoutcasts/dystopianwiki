// Worlds (032): which save a row belongs to. The exporter (0.6.0) sends a `world`
// record with the save's own id once per boot and every 6 h; the live ingest hands
// it to aurora.register_world, which answers the world every row of the batch is
// tagged with. Runtime-neutral like rest.ts and tail.ts: the probe, the
// registration and the backfill lookup take a minimal database interface, so they
// are tested against a fake.
//
// Before 032 is applied none of this does anything: the probe finds no
// servers.current_world_id column, worlds are disabled for the run, and the
// importer sends exactly what it sent before (no world_id key, no RPC).

import type { AuroraRecord, WorldRecord } from './parser.ts';
import { isMissingObjectError, type Row } from './ingest-core.ts';

export interface WorldEvent {
  /** The exporter's id (`w`) the batch carried. */
  exporterWorldId: string;
  /** The world the batch was tagged with (register_world's answer); null = no current world, untagged. */
  worldId: string | null;
  status: string;
  switched: boolean;
  /** register_world adopted a current world that had no exporter id yet (amendment 2026-10-02). */
  adopted: boolean;
  /** The record's `t`. */
  t: number;
}

export interface WorldState {
  /** 032 is applied: tag rows, call register_world and prune_old_worlds. */
  enabled: boolean;
  /** The world rows are tagged with; null sends no world_id key at all. */
  currentWorldId: string | null;
  /** One entry per register_world call this run. */
  events: WorldEvent[];
  /** Why worlds are disabled, or a note worth reading in the summary. */
  note: string | null;
}

export function disabledWorlds(note: string | null = null): WorldState {
  return { enabled: false, currentWorldId: null, events: [], note };
}

/**
 * True when a PostgREST failure says a COLUMN does not exist: 42703 from
 * Postgres, PGRST204 from PostgREST's schema cache. isMissingObjectError does
 * not cover this on purpose: elsewhere an unknown column is a real failure.
 */
export function isMissingColumnError(err: unknown): boolean {
  const text = String(err);
  return /\b(42703|PGRST204)\b/.test(text) || /column "?[^"\s]*"? (of relation "[^"]*" )?does not exist/i.test(text);
}

export interface WorldDb {
  select<T = unknown>(path: string): Promise<T[]>;
  rpc(fn: string, args: Row): Promise<unknown>;
}

/** The probe's read, exported so the report and the tests name the same call. */
export function probePath(serverId: string): string {
  return `servers?select=id,current_world_id&id=eq.${encodeURIComponent(serverId)}`;
}

/**
 * Once per run, before the first tail step. A missing column (032 not applied)
 * or a missing table disables worlds; any other failure throws, because tagging
 * on a guess would mis-tag rows forever. No server row yet (a cold database)
 * is enabled with no current world: register_world creates the first one.
 */
export async function probeWorlds(db: WorldDb, serverId: string): Promise<WorldState> {
  let rows: { id: string; current_world_id?: string | null }[];
  try {
    rows = await db.select(probePath(serverId));
  } catch (err) {
    if (isMissingColumnError(err) || isMissingObjectError(err)) {
      return disabledWorlds('servers.current_world_id does not exist (032 not applied)');
    }
    throw err;
  }
  const current = rows[0]?.current_world_id;
  return { enabled: true, currentWorldId: typeof current === 'string' ? current : null, events: [], note: null };
}

/** The note a run carries when its probe failed and the current world is unknown. */
export const PROBE_FAILED_NOTE =
  'probe failed: current world unknown this run; rows without a world record are written untagged (NULL counts as current)';

/**
 * The run's probe, as the live ingest calls it. probeWorlds' answer when it has
 * one. Any failure it throws (a transient read error) leaves the current world
 * UNKNOWN for this run instead of skipping the tail: worlds stay enabled with no
 * current world, so a batch without a `world` record is written untagged and a
 * batch with one still registers it and is tagged with register_world's answer.
 * Untagged is correct: NULL counts as current, and the next switch stamps NULL
 * rows with the world that is ending, which is the world they were written in.
 * What would be wrong, consuming a world record without registering it, cannot
 * happen, because registration does not depend on the probe.
 */
export async function probeWorldsForRun(
  db: WorldDb,
  serverId: string,
): Promise<{ worlds: WorldState; error: string | null }> {
  try {
    return { worlds: await probeWorlds(db, serverId), error: null };
  } catch (err) {
    return {
      worlds: { enabled: true, currentWorldId: null, events: [], note: PROBE_FAILED_NOTE },
      error: String(err).slice(0, 300),
    };
  }
}

/** The newest `world` record of a batch (later records win a tie, matching log order). */
export function newestWorldRecord(records: AuroraRecord[]): WorldRecord | undefined {
  let best: WorldRecord | undefined;
  for (const r of records) {
    if (r.k === 'world' && (best === undefined || r.t >= best.t)) best = r;
  }
  return best;
}

/** register_world's arguments for one record. */
export function registerWorldArgs(serverId: string, rec: WorldRecord): Row {
  return {
    p_server: serverId,
    p_exporter_world_id: rec.w,
    p_new: rec.wn === true,
    p_world_age_hours: typeof rec.wa === 'number' ? rec.wa : null,
    p_started_ms: typeof rec.ws === 'number' ? Math.trunc(rec.ws) : null,
  };
}

/**
 * Register the batch's world and make it the run's current world. Returns the
 * event, or null when there is nothing to do (worlds disabled, no record). A
 * missing function disables worlds for the run (the batch then writes untagged);
 * any other failure, and an answer without a world_id, throws so the caller does
 * not advance the cursor past rows it could not tag.
 */
export async function registerBatchWorld(
  db: WorldDb,
  serverId: string,
  rec: WorldRecord | undefined,
  worlds: WorldState,
): Promise<WorldEvent | null> {
  if (!worlds.enabled || rec === undefined) return null;
  let answer: unknown;
  try {
    answer = await db.rpc('register_world', registerWorldArgs(serverId, rec));
  } catch (err) {
    if (isMissingObjectError(err)) {
      worlds.enabled = false;
      worlds.currentWorldId = null;
      worlds.note = 'register_world does not exist; worlds disabled for this run';
      return null;
    }
    throw err;
  }
  // world_id is a string, or null when the server has no current world (a known
  // id whose world an admin ended with nothing current after it). Null tags
  // nothing, which is what NULL-is-current means. Anything else is not an answer.
  const a = (typeof answer === 'object' && answer !== null ? answer : {}) as Record<string, unknown>;
  const ok = (typeof a.world_id === 'string' && a.world_id !== '') || (a.world_id === null && 'world_id' in a);
  if (!ok) {
    throw new Error(`register_world answered without a world_id: ${JSON.stringify(answer).slice(0, 200)}`);
  }
  const event: WorldEvent = {
    exporterWorldId: rec.w,
    worldId: a.world_id as string | null,
    status: typeof a.status === 'string' ? a.status : 'unknown',
    switched: a.switched === true,
    adopted: a.adopted === true,
    t: rec.t,
  };
  worlds.currentWorldId = event.worldId;
  worlds.events.push(event);
  return event;
}

/**
 * For the run summary: the string `disabled` (the reason is worlds.note, logged
 * beside it), or the current world and this run's registrations.
 */
export function summarizeWorlds(worlds: WorldState): unknown {
  if (!worlds.enabled) return 'disabled';
  return { state: 'enabled', current: worlds.currentWorldId, events: worlds.events, note: worlds.note };
}

/** The backfill's read: a world the live ingest already registered, by exporter id. */
export function worldLookupPath(serverId: string, exporterWorldId: string): string {
  return `worlds?select=world_id,status&server_id=eq.${encodeURIComponent(serverId)}`
    + `&exporter_world_id=eq.${encodeURIComponent(exporterWorldId)}`;
}

/** The registered world for an exporter id, or null. Never creates one. */
export async function lookupWorld(
  db: WorldDb,
  serverId: string,
  exporterWorldId: string,
): Promise<{ world_id: string; status: string } | null> {
  const rows = await db.select<{ world_id: string; status: string }>(worldLookupPath(serverId, exporterWorldId));
  const row = rows[0];
  return row !== undefined && typeof row.world_id === 'string' ? row : null;
}

/** prune_old_worlds arguments: worlds ended more than 30 days ago, at most 5000 rows per table per call. */
export const OLD_WORLD_PRUNE_DAYS = 30;
export const OLD_WORLD_PRUNE_LIMIT = 5000;

/**
 * Once per run, after prune_npcs: delete live-state rows of worlds that ended
 * more than OLD_WORLD_PRUNE_DAYS ago. Only with worlds enabled (null otherwise).
 * A missing function is a note on the state and null, never an error.
 */
export async function pruneOldWorlds(db: WorldDb, worlds: WorldState): Promise<number | null> {
  if (!worlds.enabled) return null;
  try {
    const n = await db.rpc('prune_old_worlds', { p_days: OLD_WORLD_PRUNE_DAYS, p_limit: OLD_WORLD_PRUNE_LIMIT });
    return typeof n === 'number' ? n : 0;
  } catch (err) {
    if (!isMissingObjectError(err)) throw err;
    worlds.note = 'prune_old_worlds does not exist';
    return null;
  }
}
