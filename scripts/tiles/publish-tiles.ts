// Publish a rendered tile pyramid and regenerate tiles.json from it.
//
//   npx tsx scripts/tiles/publish-tiles.ts --from <out>/html/map_data/base_top \
//     --to map/tiles [--budgetGB 0.9] [--dry-run]
//
// T45 Part PUBLISH: publish base plus mod-map overlays together, in Map= order (first
// entry on top), each `--overlay <id>=<from dir>` repeatable:
//
//   npx tsx scripts/tiles/publish-tiles.ts --from <out>/html/map_data/base_top --to map/tiles \
//     --overlay sd_cc=<out>/html/map_data/mod_maps/sd_cc/base_top \
//     [--overlay other_mod=<out>/html/map_data/mod_maps/other_mod/base_top]
//
// An overlay publishes to <to>/mod_maps/<id>/base_top (map/MapView.tsx's overlayTileUrl
// template names this path). The byte budget covers base PLUS every overlay together, as
// one combined check before anything is copied - two pyramids that individually fit under
// budget but together do not must refuse as a whole, not publish partially. Order is the
// sequence the `--overlay` flags are given in, forwarded to make-tiles-json.ts's --order
// so tiles.json's overlays array matches what was actually published.
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
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { mkdirSync, copyFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

// Empty, not an absolute host: the app's own default (config.ts,
// DEFAULT_TILES_BASE_URL) is what actually resolves tile URLs at runtime, so
// tiles.json's own baseUrl only matters as a fallback and stays relative here
// too - a domain change must never require re-running this script.
const DEFAULT_BASE_URL = ''

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
function flag(name: string): boolean {
  return process.argv.includes(name)
}
/** Every occurrence of a repeatable flag, in the order given (--overlay is repeatable). */
function allArgs(name: string): string[] {
  const out: string[] = []
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === name) out.push(process.argv[i + 1])
  }
  return out
}

export interface OverlaySource {
  id: string
  from: string
}

/** Parses `--overlay <id>=<from dir>` into {id, from}, in the order the flags were given. */
export function parseOverlayArgs(values: string[]): OverlaySource[] {
  return values.map((v) => {
    const eq = v.indexOf('=')
    if (eq <= 0) throw new Error(`--overlay expects <id>=<from dir>, got: ${v}`)
    return { id: v.slice(0, eq), from: v.slice(eq + 1) }
  })
}

/** layer0.dzi + everything under layer0_files, relative to `dir`. */
export function listPyramidFiles(dir: string): string[] {
  function listFiles(sub: string, base = sub): string[] {
    const out: string[] = []
    for (const entry of readdirSync(sub, { withFileTypes: true })) {
      const full = join(sub, entry.name)
      if (entry.isDirectory()) out.push(...listFiles(full, base))
      else out.push(relative(base, full))
    }
    return out
  }
  return ['layer0.dzi', ...listFiles(join(dir, 'layer0_files')).map((p) => join('layer0_files', p))]
}

export function pyramidBytes(dir: string, files: string[]): number {
  return files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0)
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

/**
 * Throws when the combined byte total (base plus every overlay, computed by the caller
 * BEFORE any copy happens) exceeds the budget - T45 Part PUBLISH: two pyramids that each
 * individually fit under budget but together do not must refuse as a whole, never publish
 * part of the batch. A plain function (not inline in main()) so a test can call it without
 * going through `main()`'s `process.exit`, which would kill the test runner.
 */
export function checkBudget(totalBytes: number, budgetGB: number): void {
  const totalGB = totalBytes / 1024 ** 3
  if (totalGB > budgetGB) {
    throw new Error(`refusing to publish: ${totalGB.toFixed(2)} GB exceeds --budgetGB ${budgetGB}`)
  }
}

/** Copy one pyramid's files into `destRoot`, skipping any whose content hash is unchanged. */
export function publishDir(fromDir: string, files: string[], destRoot: string, dryRun: boolean) {
  let added = 0, changed = 0, skipped = 0
  for (const rel of files) {
    const src = join(fromDir, rel)
    const dest = join(destRoot, rel)
    if (!existsSync(dest)) {
      added++
      if (!dryRun) { mkdirSync(join(dest, '..'), { recursive: true }); copyFileSync(src, dest) }
    } else if (sha256(src) !== sha256(dest)) {
      changed++
      if (!dryRun) copyFileSync(src, dest)
    } else {
      skipped++
    }
  }
  return { added, changed, skipped }
}

function main() {
  const from = arg('--from')
  const to = arg('--to')
  if (!from || !to) {
    console.error(
      'usage: publish-tiles.ts --from <rendered layer dir> --to <dir, tiles land at <dir>/<layer>>|r2:<bucket> ' +
      '[--layer <name>] [--budgetGB n] [--dry-run] [--overlay <id>=<from dir> ...]',
    )
    process.exit(1)
  }
  // T22 Part C: zombie_top publishes beside base_top using the same copy/hash-skip logic,
  // under its own top-level folder. base_top stays the default so every pre-existing call
  // (and the tiles.json regen below, which only base_top owns) is unaffected.
  const layer = arg('--layer') ?? 'base_top'
  const budgetGB = Number(arg('--budgetGB') ?? (to.startsWith('r2:') ? '9.5' : '0.9'))
  const dryRun = flag('--dry-run')
  const baseUrl = arg('--baseUrl') ?? DEFAULT_BASE_URL
  const overlays = parseOverlayArgs(allArgs('--overlay'))

  if (!existsSync(join(from, 'layer0.dzi'))) throw new Error(`not a rendered ${layer} dir (no layer0.dzi): ${from}`)
  for (const o of overlays) {
    if (!existsSync(join(o.from, 'layer0.dzi'))) throw new Error(`not a rendered overlay dir (no layer0.dzi): ${o.from} (--overlay ${o.id})`)
  }

  // --- collect every source file up front: the budget covers base PLUS overlays
  // together, checked once before anything is copied (T45 Part PUBLISH).
  const baseFiles = listPyramidFiles(from)
  const overlayFiles = overlays.map((o) => ({ ...o, files: listPyramidFiles(o.from) }))
  const totalBytes = pyramidBytes(from, baseFiles) + overlayFiles.reduce((sum, o) => sum + pyramidBytes(o.from, o.files), 0)
  try {
    checkBudget(totalBytes, budgetGB)
  } catch (err) {
    console.error(`${(err as Error).message} (base + ${overlays.length} overlay(s))`)
    process.exit(2)
  }

  if (to.startsWith('r2:')) {
    const bucket = to.slice('r2:'.length)
    function rcloneSync(fromDir: string, destPath: string) {
      const args = [
        'sync', fromDir, `:s3:${bucket}/tiles/${destPath}`,
        '--header-upload', 'Cache-Control: public, max-age=31536000, immutable',
        '--stats-one-line', '--stats=0',
      ]
      if (dryRun) args.push('--dry-run')
      console.log(`rclone ${args.join(' ')}`)
      execFileSync('rclone', args, { stdio: 'inherit', shell: true })
    }
    rcloneSync(from, layer)
    for (const o of overlayFiles) rcloneSync(o.from, `mod_maps/${o.id}/base_top`)
  } else {
    const destRoot = join(to, layer)
    const baseResult = publishDir(from, baseFiles, destRoot, dryRun)
    console.log(`from ${from}`)
    console.log(`to   ${destRoot}`)
    console.log(`files: added ${baseResult.added}, changed ${baseResult.changed}, skipped ${baseResult.skipped} (${baseFiles.length} total, ${(pyramidBytes(from, baseFiles) / 1024 ** 2).toFixed(1)} MiB)`)

    let overlayAdded = 0, overlayChanged = 0
    for (const o of overlayFiles) {
      const overlayDestRoot = join(to, 'mod_maps', o.id, 'base_top')
      const result = publishDir(o.from, o.files, overlayDestRoot, dryRun)
      overlayAdded += result.added
      overlayChanged += result.changed
      console.log(`from ${o.from}`)
      console.log(`to   ${overlayDestRoot}`)
      console.log(`files: added ${result.added}, changed ${result.changed}, skipped ${result.skipped} (${o.files.length} total, ${(pyramidBytes(o.from, o.files) / 1024 ** 2).toFixed(1)} MiB)`)
    }

    // No git action here (T20): `to` lives inside this same wiki checkout now,
    // and the task executor commits map/ deliberately, by name, as its own step.
    const totalAdded = baseResult.added + overlayAdded
    const totalChanged = baseResult.changed + overlayChanged
    if (dryRun) {
      console.log('dry run: no files copied')
    } else if (totalAdded + totalChanged > 0) {
      console.log(`copied ${totalAdded + totalChanged} file(s); nothing committed - commit map/ yourself`)
    } else {
      console.log('nothing changed')
    }
  }

  // tiles.json describes base_top's own pyramid (dimensions, format, tileUrlTemplate) and
  // only base_top owns it. zombie_top is the same tile geometry (T22 Part C Facts) reached
  // through zombieTileUrl(), which is built directly from tiles.json's existing fields
  // rather than a template naming the layer - so a second layer publish must not overwrite
  // the primary config with a different render's map_info.json/sources.json.
  if (layer !== 'base_top') {
    console.log(`layer '${layer}' does not own tiles.json; skipped (only base_top regenerates it)`)
  } else if (!dryRun) {
    // An empty --baseUrl value vanishes on the way through the shell, and the next flag
    // then became the value ("baseUrl": "--order", T45). make-tiles-json's own default is
    // already empty, so the flag is passed only when it carries something.
    const genArgs = ['tsx', 'scripts/tiles/make-tiles-json.ts', from]
    if (baseUrl) genArgs.push('--baseUrl', baseUrl)
    if (overlays.length > 0) genArgs.push('--order', overlays.map((o) => o.id).join(','))
    console.log(`npx ${genArgs.join(' ')}`)
    execFileSync('npx', genArgs, { stdio: 'inherit', shell: true })
  } else {
    console.log(`dry run: would regenerate packages/aurora/public/tiles.json with --baseUrl ${baseUrl}`)
  }
}

if (process.argv[1] && process.argv[1].endsWith('publish-tiles.ts')) {
  main()
}
