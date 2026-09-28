#!/usr/bin/env tsx
/**
 * Backfill downloaded OutcastAurora logs into the `aurora` schema.
 *
 * Runs every *_Aurora.txt in a directory through the SAME parser and mapping the
 * live ingest function uses, so a bundle replayed here produces byte-identical
 * rows to one tailed over SFTP. That shared path is the point: a backfill that
 * drifted from the ingest would quietly rewrite history.
 *
 *   npx tsx scripts/aurora-backfill.ts --dir ./logs --server outcasts-main
 *   npx tsx scripts/aurora-backfill.ts --dir ./logs --server outcasts-main --dry-run
 *
 * Environment:
 *   SUPABASE_URL         project URL
 *   AURORA_SERVICE_KEY   secret key (sb_secret_...). Legacy API keys are
 *                        disabled on this project, so the old service_role JWT
 *                        in SUPABASE_SERVICE_ROLE_KEY will be rejected; it is
 *                        only read as a fallback.
 *
 * Exit code is 1 if any A1 line failed to parse, which is the T08 acceptance
 * check. Lines without the A1 marker are other people's log output and are
 * counted separately, not treated as errors.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import {
  emptyStats,
  launchStampFromFileName,
  splitLines,
  type SplitStats,
} from '../packages/shared/aurora/parser.ts';
import { buildPlan, chunk } from '../packages/shared/aurora/ingest-core.ts';
import { AuroraRest } from '../packages/shared/aurora/rest.ts';

const BATCH_ROWS = 500;

interface Args {
  dir: string;
  server: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const dir = get('--dir');
  const server = get('--server');
  if (!dir || !server) {
    console.error(
      'usage: aurora-backfill.ts --dir <directory> --server <server-id> [--dry-run]',
    );
    process.exit(2);
  }
  return { dir, server, dryRun: argv.includes('--dry-run') };
}

function summarise(stats: SplitStats): string {
  const unknown = Object.entries(stats.unknownKind)
    .map(([k, n]) => `${k}x${n}`)
    .join(' ');
  return [
    `lines=${stats.lines}`,
    `parsed=${stats.parsed}`,
    `other=${stats.notAurora}`,
    `badJson=${stats.badJson}`,
    `badShape=${stats.badShape}`,
    unknown ? `unknown=[${unknown}]` : '',
  ].filter(Boolean).join(' ');
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));

  let rest: AuroraRest | undefined;
  if (!args.dryRun) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.AURORA_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('SUPABASE_URL and AURORA_SERVICE_KEY must be set (or use --dry-run)');
      return 2;
    }
    rest = new AuroraRest({ url, serviceKey: key });
  }

  const names = (await readdir(args.dir))
    .filter((n) => n.endsWith('_Aurora.txt'))
    .sort();

  if (names.length === 0) {
    console.error(`no *_Aurora.txt files in ${args.dir}`);
    return 1;
  }

  const totals = emptyStats();
  const kindTotals: Record<string, number> = {};
  let rowsWritten = 0;
  let linksOk = 0;
  let linksFailed = 0;

  for (const name of names) {
    const stats = emptyStats();
    let text = await readFile(join(args.dir, name), 'utf8');
    // A log that ends without a newline would otherwise lose its final line to
    // the carry, which matters here because the file will never be extended.
    if (!text.endsWith('\n')) text += '\n';

    const { records } = splitLines(text, '', stats);
    // The file name is the launch stamp; "now" for the online reconcile is the
    // newest record in the file (buildPlan's default), not the replay time.
    const plan = buildPlan(records, args.server, { launchStamp: launchStampFromFileName(name) });

    for (const [kind, n] of Object.entries(plan.counts)) {
      kindTotals[kind] = (kindTotals[kind] ?? 0) + n;
    }
    totals.lines += stats.lines;
    totals.parsed += stats.parsed;
    totals.notAurora += stats.notAurora;
    totals.badJson += stats.badJson;
    totals.badShape += stats.badShape;
    for (const [k, n] of Object.entries(stats.unknownKind)) {
      totals.unknownKind[k] = (totals.unknownKind[k] ?? 0) + n;
    }

    if (rest) {
      // Ordered, never parallel: player_positions has a foreign key into
      // players, which references servers.
      for (const upsert of plan.upserts) {
        for (const batch of chunk(upsert.rows, BATCH_ROWS)) {
          await rest.upsert(upsert.table, batch, upsert.onConflict);
          rowsWritten += batch.length;
        }
      }
      for (const patch of plan.patches) {
        await rest.patch(`${patch.table}?${patch.filter}`, patch.body);
      }
      for (const link of plan.links) {
        try {
          await rest.rpc('consume_link_code', {
            p_code: link.c,
            p_username: link.u,
            p_server_id: args.server,
          });
          linksOk++;
        } catch {
          // Expired or already-consumed codes are expected in a replay.
          linksFailed++;
        }
      }
    }

    const planned = plan.upserts.map((u) => `${u.table}=${u.rows.length}`).join(' ');
    console.log(`${name}  ${summarise(stats)}  rows[${planned}] patches=${plan.patches.length}`);
  }

  console.log('');
  console.log(`files            ${names.length}`);
  console.log(`totals           ${summarise(totals)}`);
  console.log(`records by kind  ${JSON.stringify(kindTotals)}`);
  console.log(`rows written     ${args.dryRun ? '(dry run)' : rowsWritten}`);
  console.log(`link codes       ok=${linksOk} failed=${linksFailed}`);

  const parseErrors = totals.badJson + totals.badShape;
  if (parseErrors > 0) {
    console.error(`\nFAIL: ${parseErrors} A1 line(s) failed to parse`);
    return 1;
  }
  console.log('\nOK: zero parse errors on A1 lines');
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
