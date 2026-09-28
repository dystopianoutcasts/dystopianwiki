// aurora-ingest - tails the exporter log over SFTP, reads players.db, and
// upserts into the `aurora` schema. Health data comes from the exporter's
// heartbeat records; RCON is retired (STATUS "RCON OPEN QUESTION ANSWERED":
// plaintext over the public internet) and this function opens no socket other
// than SSH on the SFTP port and HTTPS to PostgREST. Invoked once a minute by
// pg_cron (migration 012) or by hand with the same bearer token.
//
// Budget: the platform allows 150 s wall and 2 s CPU. One SSH handshake costs
// ~2 s (T02), so the log tail and the players.db download share ONE session.
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

import { connect as sftpConnect, type SftpSession } from '../../../packages/shared/aurora/sftp.ts';
import { parsePins } from '../../../packages/shared/aurora/hostkey.ts';
import {
  emptyStats,
  launchStampFromFileName,
  splitChunkBytes,
  type SplitStats,
} from '../../../packages/shared/aurora/parser.ts';
import {
  buildPlan,
  buildSavedPlayerRows,
  chunk,
  planRead,
} from '../../../packages/shared/aurora/ingest-core.ts';
import { parsePlayersDb, type SqlJsStatic } from '../../../packages/shared/aurora/playersdb.ts';
import { AuroraRest } from '../../../packages/shared/aurora/rest.ts';

const BATCH_ROWS = 500;
const DEFAULT_MAX_READ = 262_144; // 256 KiB: CPU, not bandwidth, is the limit
const PLAYERS_DB_MAX_BYTES = 8 * 1024 * 1024; // the real file is ~250 KB

interface Config {
  supabaseUrl: string;
  serviceKey: string;
  ingestKey: string;
  serverId: string;
  sftp: { host: string; port: number; username: string; password: string; hostKeySha256: string[] };
  logDir: string;
  savesDir: string;
  /** Explicit save folder name; discovered by listing savesDir when unset. */
  saveName: string | null;
  maxReadBytes: number;
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
    saveName: Deno.env.get('AURORA_SAVE_NAME') ?? null,
    maxReadBytes: Number(Deno.env.get('AURORA_MAX_READ_BYTES') ?? String(DEFAULT_MAX_READ)),
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
// SFTP tail
// ---------------------------------------------------------------------------

interface TailResult {
  file: string | null;
  launchStamp: string | null;
  bytes: number;
  records: number;
  /** Records by kind, as parsed. */
  kinds: Record<string, number>;
  /** Rows sent per table. */
  rows: Record<string, number>;
  patches: number;
  stats: SplitStats;
  linksOk: number;
  linksFailed: number;
  rotated: boolean;
  ms: number;
}

async function tailLog(session: SftpSession, db: AuroraRest, cfg: Config): Promise<TailResult> {
  const started = Date.now();
  const empty: TailResult = {
    file: null,
    launchStamp: null,
    bytes: 0,
    records: 0,
    kinds: {},
    rows: {},
    patches: 0,
    stats: emptyStats(),
    linksOk: 0,
    linksFailed: 0,
    rotated: false,
    ms: 0,
  };

  const entries = await session.list(cfg.logDir);
  // Names are <yyyy-MM-dd_HH-mm>_Aurora.txt, so lexical order is chronological.
  const candidates = entries
    .filter((e) => !e.isDir && e.name.endsWith('_Aurora.txt'))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const newest = candidates.at(-1);
  if (!newest) return { ...empty, ms: Date.now() - started };

  const cursorRows = (await db.select(
    `ingest_cursor?select=file_name,byte_offset&server_id=eq.${encodeURIComponent(cfg.serverId)}`,
  )) as { file_name: string | null; byte_offset: number | null }[];

  const path = `${cfg.logDir}/${newest.name}`;
  const { size } = await session.stat(path);
  const window = planRead(cursorRows[0] ?? null, newest.name, size, cfg.maxReadBytes);
  const launchStamp = launchStampFromFileName(newest.name);

  if (window.length === 0) {
    return { ...empty, file: newest.name, launchStamp, rotated: window.reset, ms: Date.now() - started };
  }

  const bytes = await session.readRange(path, window.offset, window.length);
  const parsed = splitChunkBytes(bytes);
  // Only complete lines count; the trailing fragment is re-read next minute.
  const consumed = bytes.length - parsed.carry.length;

  const plan = buildPlan(parsed.records, cfg.serverId, { launchStamp });
  const rows: Record<string, number> = {};
  for (const upsert of plan.upserts) {
    for (const batch of chunk(upsert.rows, BATCH_ROWS)) {
      await db.upsert(upsert.table, batch, upsert.onConflict);
      rows[upsert.table] = (rows[upsert.table] ?? 0) + batch.length;
    }
  }
  for (const patch of plan.patches) {
    await db.patch(`${patch.table}?${patch.filter}`, patch.body);
    console.log(JSON.stringify({ at: 'patch', table: patch.table, why: patch.why }));
  }

  let linksOk = 0;
  let linksFailed = 0;
  for (const link of plan.links) {
    try {
      await db.rpc('consume_link_code', {
        p_code: link.c,
        p_username: link.u,
        p_server_id: cfg.serverId,
      });
      linksOk++;
    } catch (err) {
      // An expired, unknown or already-used code is normal, not a run failure.
      linksFailed++;
      console.warn(JSON.stringify({ at: 'link', code: link.c, error: String(err).slice(0, 200) }));
    }
  }

  await db.upsert('ingest_cursor', [{
    server_id: cfg.serverId,
    file_name: newest.name,
    byte_offset: window.offset + consumed,
    file_size: size,
    updated_at: new Date().toISOString(),
  }], 'server_id');

  return {
    file: newest.name,
    launchStamp,
    bytes: consumed,
    records: parsed.records.length,
    kinds: plan.counts,
    rows,
    patches: plan.patches.length,
    stats: parsed.stats,
    linksOk,
    linksFailed,
    rotated: window.reset,
    ms: Date.now() - started,
  };
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

async function readPlayersDb(session: SftpSession, db: AuroraRest, cfg: Config): Promise<PlayersDbResult> {
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
  const rows = buildSavedPlayerRows(parsed.players, cfg.serverId);

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

  const summary = {
    server: cfg.serverId,
    tail: null as TailResult | null,
    playersDb: null as PlayersDbResult | null,
    errors: [] as string[],
    ms: 0,
  };

  const db = new AuroraRest({ url: cfg.supabaseUrl, serviceKey: cfg.serviceKey });
  let session: SftpSession | null = null;
  try {
    session = await sftpConnect(cfg.sftp);
  } catch (err) {
    summary.errors.push(`sftp: ${String(err).slice(0, 300)}`);
    console.error(JSON.stringify({ at: 'sftp', error: String(err) }));
  }

  if (session) {
    try {
      summary.tail = await tailLog(session, db, cfg);
      console.log(JSON.stringify({ at: 'tail', ...summary.tail }));
    } catch (err) {
      summary.errors.push(`tail: ${String(err).slice(0, 300)}`);
      console.error(JSON.stringify({ at: 'tail', error: String(err) }));
    }
    try {
      summary.playersDb = await readPlayersDb(session, db, cfg);
      console.log(JSON.stringify({ at: 'playersdb', ...summary.playersDb }));
    } catch (err) {
      summary.errors.push(`playersdb: ${String(err).slice(0, 300)}`);
      console.error(JSON.stringify({ at: 'playersdb', error: String(err) }));
    } finally {
      session.close();
    }
  }

  summary.ms = Date.now() - started;
  console.log(JSON.stringify({ at: 'done', server: summary.server, errors: summary.errors, ms: summary.ms }));
  return new Response(JSON.stringify(summary), {
    status: summary.errors.length > 0 ? 207 : 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
