// One file of the backfill (scripts/aurora-backfill.ts), runtime-neutral so the
// world rules are tested against a fake database. The CLI keeps the directory
// walk, the environment and the console output.
//
// Worlds (032): a replay never creates or switches a world. The file's newest
// `world` record is looked up in aurora.worlds; a world the live ingest already
// registered tags every row (an ended world too: that is history being replayed).
// A file with no `world` record, an id nobody registered, or no worlds table at
// all is SKIPPED and the reason reported, because untagged replayed rows would
// count as the current world.

import { emptyStats, launchStampFromFileName, splitLines, type SplitStats } from './parser.ts';
import { buildPlan, chunk, isMissingObjectError, type IngestPlan, runPlanStep } from './ingest-core.ts';
import { lookupWorld, newestWorldRecord } from './worlds.ts';
import type { Row } from './rest.ts';

export interface BackfillDb {
  select<T = unknown>(path: string): Promise<T[]>;
  upsert(table: string, rows: Row[], onConflict: string): Promise<void>;
  patch(path: string, body: Row): Promise<void>;
  rpc(fn: string, args: Row): Promise<unknown>;
}

export interface FileResult {
  name: string;
  stats: SplitStats;
  plan: IngestPlan;
  /** Why the file was not written, or null. */
  skipped: string | null;
  /** The world the rows were tagged with. */
  worldId: string | null;
  rowsWritten: number;
  skippedOptional: number;
  linksOk: number;
  linksFailed: number;
}

/** The world a file's rows belong to, or the reason to skip it. Never registers one. */
export async function resolveFileWorld(
  db: BackfillDb,
  serverId: string,
  records: Parameters<typeof newestWorldRecord>[0],
): Promise<{ worldId: string; status: string } | { skip: string }> {
  const rec = newestWorldRecord(records);
  if (rec === undefined) return { skip: 'no world record in the file' };
  let found: { world_id: string; status: string } | null;
  try {
    found = await lookupWorld(db, serverId, rec.w);
  } catch (err) {
    if (isMissingObjectError(err)) return { skip: 'aurora.worlds does not exist (032 not applied)' };
    throw err;
  }
  if (found === null) return { skip: `world ${rec.w} is not registered for ${serverId}` };
  return { worldId: found.world_id, status: found.status };
}

/**
 * Parse one log and, with a database, write it. `db` null is the dry run: the
 * plan is built untagged and nothing is looked up or written.
 */
export async function replayFile(
  db: BackfillDb | null,
  serverId: string,
  name: string,
  rawText: string,
  batchRows = 500,
): Promise<FileResult> {
  const stats = emptyStats();
  // A log that ends without a newline would otherwise lose its final line to
  // the carry, which matters here because the file will never be extended.
  const text = rawText.endsWith('\n') ? rawText : rawText + '\n';
  const { records } = splitLines(text, '', stats);

  const result: FileResult = {
    name, stats, plan: buildPlan([], serverId), skipped: null, worldId: null,
    rowsWritten: 0, skippedOptional: 0, linksOk: 0, linksFailed: 0,
  };

  if (db !== null) {
    const world = await resolveFileWorld(db, serverId, records);
    if ('skip' in world) {
      result.skipped = world.skip;
      result.plan = buildPlan(records, serverId, { launchStamp: launchStampFromFileName(name) });
      return result;
    }
    result.worldId = world.worldId;
  }

  // The file name is the launch stamp; "now" for the online reconcile is the
  // newest record in the file (buildPlan's default), not the replay time.
  const plan = buildPlan(records, serverId, { launchStamp: launchStampFromFileName(name), worldId: result.worldId });
  result.plan = plan;
  if (db === null) return result;

  const onSkipped = () => {
    result.skippedOptional++;
  };
  // Ordered, never parallel: player_positions has a foreign key into players,
  // which references servers.
  for (const upsert of plan.upserts) {
    // NPC groups and outposts are live state stamped with the ingest's clock
    // (seen_at); replaying an old log would make old states look freshly seen.
    // (deaths are NOT liveOnly: they carry their own time and the unique key
    // (server_id, username, t) makes a replay idempotent. Vehicle names are not
    // either: a replay writes the same pairs and the newest record per script wins.)
    if (upsert.liveOnly) continue;
    for (const batch of chunk(upsert.rows, batchRows)) {
      const wrote = await runPlanStep(upsert.optional, () => db.upsert(upsert.table, batch, upsert.onConflict), onSkipped);
      if (wrote) result.rowsWritten += batch.length;
    }
  }
  // aurora.upsert_vehicles and the like: after the upserts (servers exists), as tail.ts does.
  for (const call of plan.rpcs) {
    const wrote = await runPlanStep(call.optional, () => db.rpc(call.fn, call.args), onSkipped);
    if (wrote) result.rowsWritten += call.rows;
  }
  // plan.deletes (zombie_grid staleness, `npcgone` and `npcogone` removals) are not
  // replayed: a historic bundle must not delete what the live ingest has since
  // written. With the npc upserts skipped there is nothing for them to undo.
  for (const patch of plan.patches) {
    await db.patch(`${patch.table}?${patch.filter}`, patch.body);
  }
  for (const link of plan.links) {
    try {
      await db.rpc('consume_link_code', { p_code: link.c, p_username: link.u, p_server_id: serverId });
      result.linksOk++;
    } catch {
      // Expired or already-consumed codes are expected in a replay.
      result.linksFailed++;
    }
  }
  return result;
}
