// aurora-ingest - polls RCON for health, tails the exporter log over SFTP, and
// upserts both into the `aurora` schema. Invoked once a minute by pg_cron (see
// migration 012) or by hand with the same bearer token.
//
// Budget: the platform allows 150 s wall and 2 s CPU. This runs a 50 s loop,
// polling RCON every 10 s (about five health samples a minute), and tails the
// log ONCE per invocation because the SSH handshake alone costs ~2 s (T02).
//
// ---------------------------------------------------------------------------
// Two things about this project that are easy to trip over
// ---------------------------------------------------------------------------
// 1. Legacy API keys are DISABLED here. The auto-injected SUPABASE_SERVICE_ROLE_KEY
//    is a legacy JWT and will be rejected with "Legacy API keys are disabled".
//    Set AURORA_SERVICE_KEY to the project's secret key (sb_secret_...) instead;
//    the legacy variable is only a fallback for a project where it still works.
// 2. `aurora` is NOT the default PostgREST schema. Every request below sends
//    Accept-Profile / Content-Profile: aurora. Without it PostgREST looks in
//    `public` and answers 404 "Could not find the table".
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

import {
  connect as rconConnect,
  parsePlayers,
  parseStats,
} from '../../../packages/shared/aurora/rcon.ts';
import { connect as sftpConnect } from '../../../packages/shared/aurora/sftp.ts';
import { emptyStats, splitChunkBytes, type SplitStats } from '../../../packages/shared/aurora/parser.ts';
import {
  buildHealthSample,
  buildPlan,
  chunk,
  planRead,
} from '../../../packages/shared/aurora/ingest-core.ts';
import { AuroraRest, inList, type Row } from '../../../packages/shared/aurora/rest.ts';

const LOOP_BUDGET_MS = 50_000;
const POLL_INTERVAL_MS = 10_000;
const BATCH_ROWS = 500;
const DEFAULT_MAX_READ = 262_144; // 256 KiB: CPU, not bandwidth, is the limit

interface Config {
  supabaseUrl: string;
  serviceKey: string;
  ingestKey: string;
  serverId: string;
  rcon: { host: string; port: number; password: string };
  sftp: { host: string; port: number; username: string; password: string };
  logDir: string;
  maxReadBytes: number;
}

function required(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`missing required environment variable ${name}`);
  return v;
}

function readConfig(): Config {
  const serviceKey = Deno.env.get('AURORA_SERVICE_KEY') ??
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) {
    throw new Error('missing AURORA_SERVICE_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY');
  }
  return {
    supabaseUrl: required('SUPABASE_URL'),
    serviceKey,
    // The bearer the caller must present. Defaults to the service key so the
    // pg_cron job in 012 works with no extra configuration.
    ingestKey: Deno.env.get('AURORA_INGEST_KEY') ?? serviceKey,
    serverId: Deno.env.get('AURORA_SERVER_ID') ?? 'outcasts-main',
    rcon: {
      host: required('AURORA_RCON_HOST'),
      port: Number(Deno.env.get('AURORA_RCON_PORT') ?? '27015'),
      password: required('AURORA_RCON_PASSWORD'),
    },
    sftp: {
      host: required('AURORA_SFTP_HOST'),
      port: Number(Deno.env.get('AURORA_SFTP_PORT') ?? '22'),
      username: required('AURORA_SFTP_USER'),
      password: required('AURORA_SFTP_PASSWORD'),
    },
    logDir: Deno.env.get('AURORA_LOG_DIR') ?? 'server-data/Logs',
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
// RCON
// ---------------------------------------------------------------------------

interface HealthPoll {
  roster: string[];
  stats: Record<string, number>;
}

async function pollRcon(client: { exec(c: string): Promise<string> }): Promise<HealthPoll> {
  const roster = parsePlayers(await client.exec('players'));
  const stats: Record<string, number> = {};
  for (const family of ['game', 'performance', 'network']) {
    Object.assign(stats, parseStats(await client.exec(`stats ${family} all`)));
  }
  return { roster, stats };
}

/**
 * Mark the roster online and anyone previously online but now absent offline.
 *
 * The offline half is computed by reading the currently-online usernames and
 * diffing in memory, rather than a `not.in` filter: a PZ username is free text
 * and building a negative filter out of it is the sort of quoting that fails
 * quietly on one unusual name.
 */
async function reconcileOnline(db: AuroraRest, serverId: string, roster: string[]): Promise<number> {
  if (roster.length > 0) {
    await db.upsert(
      'players',
      roster.map((u) => ({
        server_id: serverId,
        username: u,
        online: true,
        last_seen: new Date().toISOString(),
      })),
      'server_id,username',
    );
  }

  const online = (await db.select(
    `players?select=username&server_id=eq.${encodeURIComponent(serverId)}&online=is.true`,
  )) as { username: string }[];

  const present = new Set(roster);
  const stale = online.map((r) => r.username).filter((u) => !present.has(u));
  if (stale.length === 0) return 0;

  await db.patch(
    `players?server_id=eq.${encodeURIComponent(serverId)}&username=in.${
      encodeURIComponent(inList(stale))
    }`,
    { online: false },
  );
  return stale.length;
}

// ---------------------------------------------------------------------------
// SFTP tail
// ---------------------------------------------------------------------------

interface TailResult {
  file: string | null;
  bytes: number;
  records: number;
  stats: SplitStats;
  linksOk: number;
  linksFailed: number;
  rotated: boolean;
}

async function tailLog(db: AuroraRest, cfg: Config): Promise<TailResult> {
  const empty: TailResult = {
    file: null,
    bytes: 0,
    records: 0,
    stats: emptyStats(),
    linksOk: 0,
    linksFailed: 0,
    rotated: false,
  };

  const session = await sftpConnect(cfg.sftp);
  try {
    const entries = await session.list(cfg.logDir);
    // Names are <yyyy-MM-dd_HH-mm>_Aurora.txt, so lexical order is chronological.
    const candidates = entries
      .filter((e) => !e.isDir && e.name.endsWith('_Aurora.txt'))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    const newest = candidates.at(-1);
    if (!newest) return empty;

    const cursorRows = (await db.select(
      `ingest_cursor?select=file_name,byte_offset&server_id=eq.${
        encodeURIComponent(cfg.serverId)
      }`,
    )) as { file_name: string | null; byte_offset: number | null }[];

    const path = `${cfg.logDir}/${newest.name}`;
    const { size } = await session.stat(path);
    const window = planRead(cursorRows[0] ?? null, newest.name, size, cfg.maxReadBytes);

    if (window.length === 0) {
      return { ...empty, file: newest.name, rotated: window.reset };
    }

    const bytes = await session.readRange(path, window.offset, window.length);
    const parsed = splitChunkBytes(bytes);
    // Only complete lines count; the trailing fragment is re-read next minute.
    const consumed = bytes.length - parsed.carry.length;

    const plan = buildPlan(parsed.records, cfg.serverId);
    for (const upsert of plan.upserts) {
      for (const batch of chunk(upsert.rows, BATCH_ROWS)) {
        await db.upsert(upsert.table, batch, upsert.onConflict);
      }
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
      bytes: consumed,
      records: parsed.records.length,
      stats: parsed.stats,
      linksOk,
      linksFailed,
      rotated: window.reset,
    };
  } finally {
    session.close();
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req: Request) => {
  const started = Date.now();
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

  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!secretEquals(token, cfg.ingestKey)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const summary = {
    server: cfg.serverId,
    polls: 0,
    healthRows: 0,
    wentOffline: 0,
    tail: null as TailResult | null,
    errors: [] as string[],
    ms: 0,
  };

  let rcon: Awaited<ReturnType<typeof rconConnect>> | undefined;
  try {
    rcon = await rconConnect(cfg.rcon);
    const db = new AuroraRest({ url: cfg.supabaseUrl, serviceKey: cfg.serviceKey });

    // First poll immediately, so a health sample lands even if the tail fails.
    const first = await pollRcon(rcon);
    await db.upsert(
      'health_samples',
      [buildHealthSample(cfg.serverId, new Date(), first.stats, first.roster.length)],
      'server_id,t',
    );
    summary.polls++;
    summary.healthRows++;
    summary.wentOffline += await reconcileOnline(db, cfg.serverId, first.roster);

    try {
      summary.tail = await tailLog(db, cfg);
    } catch (err) {
      summary.errors.push(`tail: ${String(err).slice(0, 300)}`);
      console.error(JSON.stringify({ at: 'tail', error: String(err) }));
    }

    while (Date.now() - started < LOOP_BUDGET_MS) {
      await sleep(POLL_INTERVAL_MS);
      if (Date.now() - started >= LOOP_BUDGET_MS) break;
      try {
        const poll = await pollRcon(rcon);
        await db.upsert(
          'health_samples',
          [buildHealthSample(cfg.serverId, new Date(), poll.stats, poll.roster.length)],
          'server_id,t',
        );
        summary.polls++;
        summary.healthRows++;
        summary.wentOffline += await reconcileOnline(db, cfg.serverId, poll.roster);
      } catch (err) {
        summary.errors.push(`poll: ${String(err).slice(0, 200)}`);
        console.error(JSON.stringify({ at: 'poll', error: String(err) }));
      }
    }
  } catch (err) {
    summary.errors.push(`fatal: ${String(err).slice(0, 300)}`);
    console.error(JSON.stringify({ at: 'fatal', error: String(err) }));
  } finally {
    rcon?.close();
  }

  summary.ms = Date.now() - started;
  console.log(JSON.stringify({ at: 'done', ...summary }));
  return new Response(JSON.stringify(summary), {
    status: summary.errors.length > 0 ? 207 : 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
