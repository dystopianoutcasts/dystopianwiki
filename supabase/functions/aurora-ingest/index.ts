// aurora-ingest - tails the exporter log over SFTP, reads players.db, the
// server's own settings files and the vehicle-claim ledger, and upserts into the
// `aurora` schema. Health data comes from the exporter's
// heartbeat records; RCON is retired (STATUS "RCON OPEN QUESTION ANSWERED":
// plaintext over the public internet) and this function opens no socket other
// than SSH on the SFTP port and HTTPS to PostgREST. Invoked once a minute by
// pg_cron (migration 012) or by hand with the same bearer token.
//
// Budget: the platform allows 150 s wall and 2 s CPU. One SSH handshake costs
// ~2 s (T02), so the log tail and the players.db download share ONE session.
//
// Near-live (T23): that one session is held open for most of the minute. After
// the first read and players.db, the log is re-read every 5 s and each batch is
// written as it arrives (packages/shared/aurora/tail.ts), until a DEADLINE of
// AURORA_RUN_BUDGET_MS (default 55 s) measured from this function's first
// instruction. The cron's pg_net timeout is 58 s (migration 016), so pg_net
// waits for the whole run. A run first takes aurora.ingest_lock (016); a run
// that cannot get it exits 200 {skipped:"locked"} without connecting, because
// two runs reading the same bytes would duplicate the append-only history.
//
// ---------------------------------------------------------------------------
// Three things about this project that are easy to trip over
// ---------------------------------------------------------------------------
// 1. Legacy API keys are DISABLED here. The auto-injected SUPABASE_SERVICE_ROLE_KEY
//    is a legacy JWT and is rejected with "Legacy API keys are disabled".
//    AURORA_SERVICE_KEY must hold the project's secret key (sb_secret_...).
// 2. `aurora` is NOT the default PostgREST schema. rest.ts sends
//    Accept-Profile / Content-Profile: aurora on every request. Without it
//    PostgREST looks in `public` and answers 404 "Could not find the table".
// 3. Host-key pinning is MANDATORY. AURORA_SFTP_HOSTKEYS holds the comma-
//    separated SHA256 fingerprints (STATUS "REVIEW" block); with it unset or
//    empty the function refuses to connect at all rather than send the SFTP
//    password to whatever answers on the host.
//
// ---------------------------------------------------------------------------
// Cursor and carry
// ---------------------------------------------------------------------------
// aurora.ingest_cursor has nowhere to store a half-read trailing line, so the
// cursor is only ever advanced to the last COMPLETE line: byte_offset lands on
// the byte after the final newline consumed. A partial line is simply re-read
// next minute. That keeps the ingest stateless between invocations and makes a
// crash mid-batch harmless - at worst some rows are upserted twice, and every
// upsert is idempotent.
//
// Season records (034, exporter 0.7.0)
// ---------------------------------------------------------------------------
// tailStep also writes kill_events (ignore-duplicates), rpc/observe_lives (the
// newest pos per player carrying hs or zk) and rpc/replace_factions (the newest
// full faction list, p_seen_at = this run's clock). All three are optional: before
// 034 they are skipped and counted in tail.skippedOptional and the cursor still
// advances. Their row counts appear in tail.rows under kill_events, observe_lives
// and replace_factions.

import { connect as sftpConnect, type SftpSession } from '../../../packages/shared/aurora/sftp.ts';
import { parsePins } from '../../../packages/shared/aurora/hostkey.ts';
import { buildSavedPlayerRows, chunk, isMissingObjectError, tagRows } from '../../../packages/shared/aurora/ingest-core.ts';
import {
  disabledWorlds,
  probeWorlds,
  pruneOldWorlds,
  summarizeWorlds,
  type WorldState,
} from '../../../packages/shared/aurora/worlds.ts';
import {
  buildClaimRows,
  CLAIMS_MISS_LIMIT,
  claimsReadTrusted,
  isLedgerMissing,
  parseClaimsLedger,
  shouldPrune,
} from '../../../packages/shared/aurora/claims.ts';
import { parsePlayersDb, type SqlJsStatic } from '../../../packages/shared/aurora/playersdb.ts';
import { parseSandboxVars, parseServerIni } from '../../../packages/shared/aurora/serverconfig.ts';
import { AuroraRest } from '../../../packages/shared/aurora/rest.ts';
import {
  emptyTotals,
  findTarget,
  LOCK_TTL_S,
  type LoopResult,
  resolveRunBudget,
  runTailLoop,
  type TailConfig,
  type TailTarget,
  type TailTotals,
  tailStep,
} from '../../../packages/shared/aurora/tail.ts';

const BATCH_ROWS = 500;
const DEFAULT_MAX_READ = 262_144; // 256 KiB: CPU, not bandwidth, is the limit
const PLAYERS_DB_MAX_BYTES = 8 * 1024 * 1024; // the real file is ~250 KB
const CONFIG_MAX_BYTES = 1024 * 1024; // the .ini is ~10 KB, SandboxVars ~60 KB
const CLAIMS_MAX_BYTES = 1024 * 1024; // a ledger line is ~150 bytes; this is thousands of claims

interface Config {
  supabaseUrl: string;
  serviceKey: string;
  ingestKey: string;
  serverId: string;
  sftp: { host: string; port: number; username: string; password: string; hostKeySha256: string[] };
  logDir: string;
  savesDir: string;
  /** Where the server keeps <name>.ini and <name>_SandboxVars.lua. */
  configDir: string;
  /** DystopianVehicleClaim's ledger file (028). */
  claimsFile: string;
  /** Explicit save folder name; discovered by listing savesDir when unset. */
  saveName: string | null;
  maxReadBytes: number;
  /** Deadline for the whole run, from the first instruction (T23). */
  runBudgetMs: number;
}

function required(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`missing required environment variable ${name}`);
  return v;
}

function readConfig(): Config {
  const serviceKey = required('AURORA_SERVICE_KEY');
  if (!serviceKey.startsWith('sb_secret_')) {
    throw new Error('AURORA_SERVICE_KEY must be the project secret key (sb_secret_...); legacy keys are disabled');
  }
  const hostKeys = parsePins(Deno.env.get('AURORA_SFTP_HOSTKEYS'));
  if (hostKeys.length === 0) {
    // Fail closed. See point 3 in the header.
    throw new Error('AURORA_SFTP_HOSTKEYS is unset or empty; refusing to connect without host-key pins');
  }
  return {
    supabaseUrl: required('SUPABASE_URL'),
    serviceKey,
    // The bearer the caller must present. Defaults to the service key so the
    // pg_cron job in 012 works with no extra configuration.
    ingestKey: Deno.env.get('AURORA_INGEST_KEY') ?? serviceKey,
    serverId: Deno.env.get('AURORA_SERVER_ID') ?? 'outcasts-main',
    sftp: {
      host: required('AURORA_SFTP_HOST'),
      port: Number(Deno.env.get('AURORA_SFTP_PORT') ?? '22'),
      username: required('AURORA_SFTP_USER'),
      password: required('AURORA_SFTP_PASSWORD'),
      hostKeySha256: hostKeys,
    },
    logDir: Deno.env.get('AURORA_LOG_DIR') ?? 'server-data/Logs',
    savesDir: Deno.env.get('AURORA_SAVES_DIR') ?? 'server-data/Saves/Multiplayer',
    configDir: Deno.env.get('AURORA_CONFIG_DIR') ?? 'server-data/Server',
    // Zomboid/Lua/DVC/Claims/vehicles.txt, a sibling of Logs, Saves and Server
    // under the same data root. Assumed, not observed: set it if the host differs.
    claimsFile: Deno.env.get('AURORA_CLAIMS_FILE') ?? 'server-data/Lua/DVC/Claims/vehicles.txt',
    saveName: Deno.env.get('AURORA_SAVE_NAME') ?? null,
    maxReadBytes: Number(Deno.env.get('AURORA_MAX_READ_BYTES') ?? String(DEFAULT_MAX_READ)),
    runBudgetMs: resolveRunBudget(Deno.env.get('AURORA_RUN_BUDGET_MS')),
  };
}

/** Length-independent comparison, so a wrong token leaks nothing by timing. */
function secretEquals(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  let diff = ab.length ^ bb.length;
  const n = Math.max(ab.length, bb.length);
  for (let i = 0; i < n; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

// ---------------------------------------------------------------------------
// players.db
// ---------------------------------------------------------------------------

interface PlayersDbResult {
  saveName: string;
  table: string;
  bytes: number;
  players: number;
  rows: number;
  ms: number;
}

let sqlJs: SqlJsStatic | null = null;

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJs) {
    // Loaded lazily, like ssh2 in sftp.ts, so a load failure is a catchable
    // error with its message rather than a dead function at boot.
    const mod = await import('npm:sql.js@1.14.2');
    const init = (mod.default ?? mod) as (cfg?: unknown) => Promise<SqlJsStatic>;
    sqlJs = await init();
  }
  return sqlJs;
}

async function discoverSaveName(session: SftpSession, cfg: Config): Promise<string> {
  if (cfg.saveName) return cfg.saveName;
  const dirs = (await session.list(cfg.savesDir)).filter((e) => e.isDir).map((e) => e.name).sort();
  if (dirs.length === 1) return dirs[0];
  if (dirs.length === 0) throw new Error(`no save folder under ${cfg.savesDir}`);
  throw new Error(
    `${dirs.length} save folders under ${cfg.savesDir} (${dirs.join(', ')}); set AURORA_SAVE_NAME`,
  );
}

async function readPlayersDb(
  session: SftpSession,
  db: AuroraRest,
  cfg: Config,
  worlds: WorldState,
): Promise<PlayersDbResult> {
  const started = Date.now();
  const saveName = await discoverSaveName(session, cfg);
  const path = `${cfg.savesDir}/${saveName}/players.db`;
  const { size } = await session.stat(path);
  if (size > PLAYERS_DB_MAX_BYTES) {
    throw new Error(`${path} is ${size} bytes, over the ${PLAYERS_DB_MAX_BYTES} byte limit`);
  }
  const bytes = await session.readRange(path, 0, size);
  const SQL = await loadSqlJs();
  const parsed = parsePlayersDb(SQL, bytes);
  // world_id (032) on every row when the run has a current world; read once per
  // run, so after a switch the first tagged write lands with the next run.
  const rows = tagRows(buildSavedPlayerRows(parsed.players, cfg.serverId), worlds.enabled ? worlds.currentWorldId : null);

  // The tail may have found no log yet; the players rows still need a server.
  await db.upsert('servers', [{ id: cfg.serverId }], 'id');
  for (const batch of chunk(rows, BATCH_ROWS)) {
    await db.upsert('players', batch, 'server_id,username');
  }
  return {
    saveName,
    table: parsed.table,
    bytes: size,
    players: parsed.players.length,
    rows: rows.length,
    ms: Date.now() - started,
  };
}

// ---------------------------------------------------------------------------
// Server settings (027)
// ---------------------------------------------------------------------------
// The server is named after its save folder, and its settings files carry the
// same name. Only the keys serverconfig.ts keeps are stored: the .ini holds the
// join password, the RCON password and the Discord token, and none of them ever
// leaves this function. The row lands in aurora.server_config, which no client
// role can read; aurora.home_summary() publishes a fixed subset of it.

interface ServerConfigResult {
  name: string;
  settings: number;
  sandbox: number;
  ms: number;
}

async function readText(session: SftpSession, path: string, maxBytes = CONFIG_MAX_BYTES): Promise<string> {
  const { size } = await session.stat(path);
  if (size > maxBytes) throw new Error(`${path} is ${size} bytes, over the ${maxBytes} byte limit`);
  return new TextDecoder().decode(await session.readRange(path, 0, size));
}

async function readServerConfig(
  session: SftpSession,
  db: AuroraRest,
  cfg: Config,
  saveName: string,
): Promise<ServerConfigResult> {
  const started = Date.now();
  const settings = parseServerIni(await readText(session, `${cfg.configDir}/${saveName}.ini`));
  // A server without a sandbox file still has its .ini worth publishing.
  let sandbox = {};
  try {
    sandbox = parseSandboxVars(await readText(session, `${cfg.configDir}/${saveName}_SandboxVars.lua`));
  } catch (err) {
    console.error(JSON.stringify({ at: 'sandboxvars', error: String(err).slice(0, 300) }));
  }
  const publicName = typeof settings.PublicName === 'string' && settings.PublicName.trim() !== ''
    ? settings.PublicName.trim()
    : saveName;
  await db.upsert('servers', [{ id: cfg.serverId, name: publicName }], 'id');
  await db.upsert('server_config', [{
    server_id: cfg.serverId,
    settings,
    sandbox,
    updated_at: new Date().toISOString(),
  }], 'server_id');
  return {
    name: publicName,
    settings: Object.keys(settings).length,
    sandbox: Object.keys(sandbox).length,
    ms: Date.now() - started,
  };
}

// ---------------------------------------------------------------------------
// Vehicle claims (028)
// ---------------------------------------------------------------------------
// DystopianVehicleClaim keeps its ledger in Zomboid/Lua/DVC/Claims/vehicles.txt
// and rewrites the whole file on every change, so a read can land mid-write. The
// rules (claims.ts): a read that fails changes nothing; every claim found is
// upserted with miss_count 0; a claim is deleted only after CLAIMS_MISS_LIMIT
// consecutive TRUSTED reads missed it (any complete read, an empty file included,
// which is one miss for every claim). Reads are counted, not minutes, so an
// outage followed by one bad read releases nothing. The prune is skipped in a run
// whose claims step failed, was not trusted, or released anything. A ledger file
// that does not exist is the exception: no claims information, nothing is
// released, and the prune still runs (it never deletes a claimed car).

interface ClaimsResult {
  claims: number;
  skipped: number;
  complete: boolean;
  trusted: boolean;
  released: number;
  pruned: number | null;
  ms: number;
}

async function readClaims(session: SftpSession, db: AuroraRest, cfg: Config, worlds: WorldState): Promise<ClaimsResult> {
  const started = Date.now();
  const parsed = parseClaimsLedger(await readText(session, cfg.claimsFile, CLAIMS_MAX_BYTES));
  const rows = buildClaimRows(
    parsed.claims,
    cfg.serverId,
    new Date(started).toISOString(),
    worlds.enabled ? worlds.currentWorldId : null,
  );

  await db.upsert('servers', [{ id: cfg.serverId }], 'id');
  const trusted = claimsReadTrusted(parsed);
  for (const batch of chunk(rows, BATCH_ROWS)) {
    await db.upsert('vehicle_claims', batch, 'server_id,sql_id');
  }
  // Only a trusted read counts misses; the function resets the claims it was
  // given and releases those at the limit.
  let released = 0;
  if (trusted) {
    const n = await db.rpc('release_missing_claims', {
      p_server: cfg.serverId,
      p_present: rows.map((r) => r.sql_id),
      p_misses: CLAIMS_MISS_LIMIT,
    });
    released = typeof n === 'number' ? n : 0;
  }

  return {
    claims: rows.length,
    skipped: parsed.skipped,
    complete: parsed.complete,
    trusted,
    released,
    pruned: null,
    ms: Date.now() - started,
  };
}

/** Old restart duplicates and scrapped cars: unclaimed rows unseen for 14 days. Bounded in SQL. */
async function pruneVehicles(db: AuroraRest): Promise<number> {
  const n = await db.rpc('prune_vehicles', { p_days: 14, p_limit: 5000 });
  return typeof n === 'number' ? n : 0;
}

// ---------------------------------------------------------------------------
// NPC prune (029)
// ---------------------------------------------------------------------------
// NPC groups unseen for 10 minutes and outposts unseen for 2 hours. The exporter
// re-sends a live group every 60 s and an outpost every 10 minutes, so a row older
// than that belongs to something that is gone (a restart, a missed `npcgone`). The
// public view hides a group after 3 minutes anyway; this is the cleanup. Bounded in
// SQL, and a missing function (029 not applied yet) is a note, never an error.

const NPC_GROUP_PRUNE_MINUTES = 10;
const NPC_OUTPOST_PRUNE_MINUTES = 120;

async function pruneNpcs(db: AuroraRest): Promise<number | null> {
  try {
    const n = await db.rpc('prune_npcs', {
      p_group_minutes: NPC_GROUP_PRUNE_MINUTES,
      p_outpost_minutes: NPC_OUTPOST_PRUNE_MINUTES,
    });
    return typeof n === 'number' ? n : 0;
  } catch (err) {
    if (isMissingObjectError(err)) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  const started = Date.now();

  // Bearer check first, against the one variable it needs, so an unauthenticated
  // caller neither triggers any work nor learns which other variables are unset.
  const expectedBearer = Deno.env.get('AURORA_INGEST_KEY') ?? Deno.env.get('AURORA_SERVICE_KEY') ?? '';
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (expectedBearer === '' || !secretEquals(token, expectedBearer)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let cfg: Config;
  try {
    cfg = readConfig();
  } catch (err) {
    console.error(JSON.stringify({ at: 'config', error: String(err) }));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deadline = started + cfg.runBudgetMs;
  const runId = crypto.randomUUID();
  const db = new AuroraRest({ url: cfg.supabaseUrl, serviceKey: cfg.serviceKey });
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  // The lock comes before the SSH connect, so a refused run costs the host
  // nothing. It fails CLOSED: without 016 applied, or with the database
  // unreachable, no run may proceed, because an unguarded overlap duplicates
  // player_position_history rows.
  let locked = false;
  try {
    locked = (await db.rpc('ingest_lock', { p_run_id: runId, p_ttl_s: LOCK_TTL_S })) === true;
  } catch (err) {
    console.error(JSON.stringify({ at: 'lock', run: runId, error: String(err) }));
    return json({ error: `lock: ${String(err).slice(0, 300)}` }, 503);
  }
  if (!locked) {
    console.log(JSON.stringify({ at: 'skipped', run: runId, reason: 'locked', ms: Date.now() - started }));
    return json({ skipped: 'locked', run: runId }, 200);
  }

  const tailCfg: TailConfig = {
    serverId: cfg.serverId,
    logDir: cfg.logDir,
    maxReadBytes: cfg.maxReadBytes,
    batchRows: BATCH_ROWS,
  };
  const summary = {
    server: cfg.serverId,
    run: runId,
    budgetMs: cfg.runBudgetMs,
    connects: 0,
    tail: null as (TailTotals & { file: string | null; launchStamp: string | null }) | null,
    loop: null as LoopResult | null,
    playersDb: null as PlayersDbResult | null,
    serverConfig: null as ServerConfigResult | null,
    claims: null as ClaimsResult | null,
    /** Informational: the ledger file does not exist on this host. Not an error. */
    claimsNote: null as { missing: boolean; path: string } | null,
    /** 032: `disabled` before the migration, else the current world and this run's registrations. */
    worlds: null as unknown,
    /** Why worlds are disabled, or a note from this run (a missing function). */
    worldsNote: null as string | null,
    /** Rows prune_old_worlds deleted this run; null when it did not run. */
    worldsPruned: null as number | null,
    errors: [] as string[],
    ms: 0,
  };
  let worlds: WorldState = disabledWorlds();

  try {
    let session: SftpSession | null = null;
    try {
      session = await sftpConnect(cfg.sftp);
      summary.connects++;
      console.log(JSON.stringify({ at: 'connect', run: runId, ms: Date.now() - started }));
    } catch (err) {
      summary.errors.push(`sftp: ${String(err).slice(0, 300)}`);
      console.error(JSON.stringify({ at: 'sftp', error: String(err) }));
    }

    if (session) {
      try {
        // First read-parse-write: as before T23, one read from the cursor.
        let target: TailTarget | null = null;
        const totals = emptyTotals();
        const firstStepAt = Date.now();
        // The world probe (032), once per run, before any row is written. Disabled
        // (no column, no table) is today's behaviour. Any other failure skips the
        // tail this run: rows written untagged across a world switch would be
        // stamped with the OLD world at the next switch, so the cursor waits.
        let probed = false;
        try {
          worlds = await probeWorlds(db, cfg.serverId);
          probed = true;
        } catch (err) {
          worlds = disabledWorlds('probe failed; tail skipped this run');
          summary.errors.push(`worlds: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'worlds', error: String(err) }));
        }
        try {
          target = probed ? await findTarget(session, db, tailCfg) : null;
          if (target) await tailStep(session, db, tailCfg, target, totals, Date.now, worlds);
          summary.tail = { file: target?.file ?? null, launchStamp: target?.launchStamp ?? null, ...totals };
        } catch (err) {
          target = null; // no loop after a failed first read
          summary.errors.push(`tail: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'tail', error: String(err) }));
        }

        // players.db once per run, never per loop.
        try {
          summary.playersDb = await readPlayersDb(session, db, cfg, worlds);
          console.log(JSON.stringify({ at: 'playersdb', ...summary.playersDb }));
        } catch (err) {
          summary.errors.push(`playersdb: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'playersdb', error: String(err) }));
        }

        // The server's settings, once per run, after players.db (same save name).
        try {
          const saveName = summary.playersDb?.saveName ?? await discoverSaveName(session, cfg);
          summary.serverConfig = await readServerConfig(session, db, cfg, saveName);
          console.log(JSON.stringify({ at: 'serverconfig', ...summary.serverConfig }));
        } catch (err) {
          summary.errors.push(`serverconfig: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'serverconfig', error: String(err) }));
        }

        // The vehicle claim ledger, once per run, then the stale-vehicle prune.
        // Separate steps so neither stops the other or the tail loop below. The
        // prune runs after a trusted read that released nothing, and also when
        // the ledger file does not exist (claimsMissing: no claims information,
        // nothing was released). It does NOT run after any other claims failure.
        let claimsMissing = false;
        try {
          summary.claims = await readClaims(session, db, cfg, worlds);
          console.log(JSON.stringify({ at: 'claims', ...summary.claims }));
        } catch (err) {
          claimsMissing = isLedgerMissing(err);
          if (claimsMissing) {
            // No ledger on this host: a note, not an error (an error is a 207 every minute).
            summary.claimsNote = { missing: true, path: cfg.claimsFile };
            console.log(JSON.stringify({ at: 'claims', missing: true, path: cfg.claimsFile }));
          } else {
            summary.errors.push(`claims: ${String(err).slice(0, 300)}`);
            console.error(JSON.stringify({ at: 'claims', error: String(err) }));
          }
        }
        try {
          if (shouldPrune(summary.claims, claimsMissing)) {
            const pruned = await pruneVehicles(db);
            if (summary.claims) summary.claims.pruned = pruned;
            if (pruned > 0) console.log(JSON.stringify({ at: 'prune', table: 'vehicles', rows: pruned }));
          } else {
            console.log(JSON.stringify({ at: 'prune', skipped: 'claims step failed (not a missing file), was cut, or released claims' }));
          }
        } catch (err) {
          summary.errors.push(`prune: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'prune', error: String(err) }));
        }

        // The NPC prune, after the claims steps and independent of them.
        try {
          const pruned = await pruneNpcs(db);
          if (pruned === null) {
            console.log(JSON.stringify({ at: 'prune', table: 'npc', skipped: 'prune_npcs does not exist yet (029 not applied)' }));
          } else if (pruned > 0) {
            console.log(JSON.stringify({ at: 'prune', table: 'npc', rows: pruned }));
          }
        } catch (err) {
          summary.errors.push(`npcprune: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'npcprune', error: String(err) }));
        }

        // Old worlds' live-state rows, once per run, after the NPC prune. Only with
        // worlds enabled; a missing function is a note, never an error.
        try {
          summary.worldsPruned = await pruneOldWorlds(db, worlds);
          if ((summary.worldsPruned ?? 0) > 0) {
            console.log(JSON.stringify({ at: 'prune', table: 'worlds', rows: summary.worldsPruned }));
          }
        } catch (err) {
          summary.errors.push(`worldprune: ${String(err).slice(0, 300)}`);
          console.error(JSON.stringify({ at: 'worldprune', error: String(err) }));
        }

        if (target) {
          const t = target;
          summary.loop = await runTailLoop({
            deadline,
            lastStepAt: firstStepAt,
            step: () => tailStep(session!, db, tailCfg, t, totals, Date.now, worlds),
          });
          summary.tail = { file: t.file, launchStamp: t.launchStamp, ...totals };
          if (summary.loop.error) {
            summary.errors.push(`loop: ${summary.loop.error}`);
            console.error(JSON.stringify({ at: 'loop', error: summary.loop.error }));
          }
        }
        console.log(JSON.stringify({ at: 'tail', loops: summary.loop?.loops ?? 0, ...summary.tail }));
        summary.worlds = summarizeWorlds(worlds);
        summary.worldsNote = worlds.note;
        console.log(JSON.stringify({ at: 'worlds', worlds: summary.worlds, note: worlds.note }));
      } finally {
        session.close();
      }
    }
  } finally {
    try {
      await db.rpc('ingest_unlock', { p_run_id: runId });
    } catch (err) {
      // The 90 s TTL releases it anyway; the next minute's run may be skipped once.
      summary.errors.push(`unlock: ${String(err).slice(0, 300)}`);
      console.error(JSON.stringify({ at: 'unlock', run: runId, error: String(err) }));
    }
  }

  summary.ms = Date.now() - started;
  console.log(JSON.stringify({
    at: 'done',
    server: summary.server,
    run: runId,
    connects: summary.connects,
    loops: summary.loop?.loops ?? 0,
    bytes: summary.tail?.bytes ?? 0,
    lagMaxMs: summary.tail?.lagMaxMs ?? null,
    worlds: summary.worlds ?? 'disabled',
    errors: summary.errors,
    ms: summary.ms,
  }));
  return json(summary, summary.errors.length > 0 ? 207 : 200);
});
