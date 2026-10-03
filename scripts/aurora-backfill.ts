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
 * Worlds (032): a replay never creates or switches a world. Each file's newest
 * `world` record is looked up in aurora.worlds and its rows are tagged with that
 * world (an ended one too); a file with no `world` record or an id the live
 * ingest never registered is SKIPPED and listed. See backfill-core.ts.
 *
 * Season records (034): kill events and character lives replay, in file-name
 * order (the files are sorted, so lives are rebuilt in time order); a replay over
 * existing rows changes nothing (the kill key ignores duplicates, a replayed
 * sample never opens a life). Factions are live state and are not replayed; the
 * summary marks them "(live only)".
 *
 * Exit code is 1 if any A1 line failed to parse, which is the T08 acceptance
 * check. Lines without the A1 marker are other people's log output and are
 * counted separately, not treated as errors.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import { emptyStats, type SplitStats } from '../packages/shared/aurora/parser.ts';
import { replayFile } from '../packages/shared/aurora/backfill-core.ts';
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
  // Optional writes the database refused (a migration not applied, or any other 4xx), skipped as the live ingest skips them.
  let skippedOptional = 0;
  const optionalErrors: string[] = [];
  let linksOk = 0;
  let linksFailed = 0;
  const skippedFiles: string[] = [];

  for (const name of names) {
    const text = await readFile(join(args.dir, name), 'utf8');
    const r = await replayFile(rest ?? null, args.server, name, text, BATCH_ROWS);
    const { stats, plan } = r;

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
    rowsWritten += r.rowsWritten;
    skippedOptional += r.skippedOptional;
    for (const e of r.optionalErrors) {
      if (optionalErrors.length < 20) optionalErrors.push(`${e.what}: ${e.code ?? e.status ?? '?'} ${e.message}`);
    }
    linksOk += r.linksOk;
    linksFailed += r.linksFailed;
    if (r.skipped !== null) skippedFiles.push(`${name}: ${r.skipped}`);

    const planned = [
      ...plan.upserts.map((u) => `${u.table}=${u.rows.length}`),
      ...plan.rpcs.map((c) => `${c.fn}=${c.rows}${c.liveOnly ? '(live only)' : ''}`),
    ].join(' ');
    const world = r.skipped !== null ? `SKIPPED (${r.skipped})` : r.worldId !== null ? `world=${r.worldId}` : 'world=(dry run)';
    console.log(`${name}  ${summarise(stats)}  ${world}  rows[${planned}] patches=${plan.patches.length}`);
  }

  console.log('');
  console.log(`files            ${names.length}`);
  console.log(`totals           ${summarise(totals)}`);
  console.log(`records by kind  ${JSON.stringify(kindTotals)}`);
  console.log(`rows written     ${args.dryRun ? '(dry run)' : rowsWritten}`);
  if (skippedOptional > 0) {
    console.log(`skipped writes   ${skippedOptional} (optional writes the database refused; the first ones:)`);
    for (const e of optionalErrors) console.log(`  ${e.slice(0, 300)}`);
  }
  console.log(`link codes       ok=${linksOk} failed=${linksFailed}`);
  if (skippedFiles.length > 0) {
    console.log(`skipped files    ${skippedFiles.length} (no world record, or a world the live ingest never registered)`);
    for (const f of skippedFiles) console.log(`  ${f}`);
  }

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
