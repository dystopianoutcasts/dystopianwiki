// Publish a rendered tile pyramid and regenerate tiles.json from it.
//
//   npx tsx scripts/tiles/publish-tiles.ts --from <out>/html/map_data/base_top \
//     --to map/tiles [--budgetGB 0.9] [--dry-run]
//
// T20 (2026-09-29, one website): --to is a plain directory inside THIS wiki
// checkout - the wiki's own map/tiles, beside the app map/ itself builds into
// - not a second repo. This script only copies files; it never runs git
// itself. Commit map/ yourself afterward, by name, alongside the rest of that
// deploy's changes (deploy.md's Do step 6).
//
// Also accepts --to r2:<bucket> for the Cloudflare alternative (rclone sync);
// unaffected by the one-website decision, since R2 would still be a separate
// storage backend for tiles even if the app itself has one home.
// Files are skipped by content hash, so a re-render that changed nothing
// publishes nothing.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { mkdirSync, copyFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

// Empty, not an absolute host: the app's own default (config.ts,
// DEFAULT_TILES_BASE_URL) is what actually resolves tile URLs at runtime, so
// tiles.json's own baseUrl only matters as a fallback and stays relative here
// too - a domain change must never require re-running this script.
const DEFAULT_BASE_URL = '';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(name);
}

const from = arg('--from');
const to = arg('--to');
if (!from || !to) {
  console.error('usage: publish-tiles.ts --from <base_top dir> --to <dir, tiles land at <dir>/base_top>|r2:<bucket> [--budgetGB n] [--dry-run]');
  process.exit(1);
}
const budgetGB = Number(arg('--budgetGB') ?? (to.startsWith('r2:') ? '9.5' : '0.9'));
const dryRun = flag('--dry-run');
const baseUrl = arg('--baseUrl') ?? DEFAULT_BASE_URL;

if (!existsSync(join(from, 'layer0.dzi'))) throw new Error(`not a rendered base_top dir (no layer0.dzi): ${from}`);

// --- collect source files: layer0.dzi + everything under layer0_files -----
function listFiles(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(relative(base, full));
  }
  return out;
}
const files = ['layer0.dzi', ...listFiles(join(from, 'layer0_files')).map((p) => join('layer0_files', p))];
const totalBytes = files.reduce((sum, f) => sum + statSync(join(from, f)).size, 0);
const totalGB = totalBytes / 1024 ** 3;
if (totalGB > budgetGB) {
  console.error(`refusing to publish: ${totalGB.toFixed(2)} GB exceeds --budgetGB ${budgetGB}`);
  process.exit(2);
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

if (to.startsWith('r2:')) {
  const bucket = to.slice('r2:'.length);
  const args = [
    'sync', from, `:s3:${bucket}/tiles/base_top`,
    '--header-upload', 'Cache-Control: public, max-age=31536000, immutable',
    '--stats-one-line', '--stats=0',
  ];
  if (dryRun) args.push('--dry-run');
  console.log(`rclone ${args.join(' ')}`);
  execFileSync('rclone', args, { stdio: 'inherit', shell: true });
} else {
  const destRoot = join(to, 'base_top');
  let added = 0, changed = 0, skipped = 0;
  for (const rel of files) {
    const src = join(from, rel);
    const dest = join(destRoot, rel);
    if (!existsSync(dest)) {
      added++;
      if (!dryRun) { mkdirSync(join(dest, '..'), { recursive: true }); copyFileSync(src, dest); }
    } else if (sha256(src) !== sha256(dest)) {
      changed++;
      if (!dryRun) copyFileSync(src, dest);
    } else {
      skipped++;
    }
  }
  console.log(`from ${from}`);
  console.log(`to   ${destRoot}`);
  console.log(`files: added ${added}, changed ${changed}, skipped ${skipped} (${files.length} total, ${(totalBytes / 1024 ** 2).toFixed(1)} MiB)`);

  // No git action here (T20): `to` lives inside this same wiki checkout now,
  // and the task executor commits map/ deliberately, by name, as its own step.
  if (dryRun) {
    console.log('dry run: no files copied');
  } else if (added + changed > 0) {
    console.log(`copied ${added + changed} file(s); nothing committed - commit map/ yourself`);
  } else {
    console.log('nothing changed');
  }
}

if (!dryRun) {
  const genArgs = ['tsx', 'scripts/tiles/make-tiles-json.ts', from, '--baseUrl', baseUrl];
  console.log(`npx ${genArgs.join(' ')}`);
  execFileSync('npx', genArgs, { stdio: 'inherit', shell: true });
} else {
  console.log(`dry run: would regenerate packages/aurora/public/tiles.json with --baseUrl ${baseUrl}`);
}
