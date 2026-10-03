// T52: rebuild the live map for one admin request, on the owner's PC.
//
//   npx tsx scripts/tiles/rebuild-map.ts --request-file <file> --worker <name>
//   npx tsx scripts/tiles/rebuild-map.ts --request '<json row>' --worker <name>
//   npx tsx scripts/tiles/rebuild-map.ts --dry-run --maps "<a>;<b>" --workshop "<id>;<id>"
//
// The request row is what aurora.claim_map_rebuild returned (T51): `id`, `maps` (Map=
// order, helpers already removed) and `workshop_items`. watch-rebuild.ps1 claims it and
// runs this script; the service role key arrives in the AURORA_SERVICE_KEY environment
// variable, is removed from this process's environment at once (no child inherits it),
// and is scrubbed from every log line.
//
// Steps (each logged with a timestamp; the log tail goes out in a heartbeat every 60 s
// and in the final finish_map_rebuild):
//   preflight  on main, the watcher's own paths clean, `git pull --ff-only`, and local
//              main not ahead of origin (the watcher pushes only its own commit)
//   a. normalise the maps: vanilla and the two helpers dropped, each slugged with mapId
//   b. describe the map mods (describe-mod-maps.ts) and write server-maps.txt
//   c. decide whether a render is needed (renderDecision below)
//   d. render.ps1 into R:\tmp\pzmap2dzi\out-latest (never ...\out); exit 3/4 -> failed
//   e. publish-tiles.ts with one --overlay per map, Map= order (first on top)
//   f. git rm the published overlays of maps no longer in the list
//   g. the three extractors, every map folder in Map= order, vanilla LAST
//   h. rm -rf map/assets, npm run aurora:build
//   i. verify the build output and run the aurora test suite
//   j. git pull --ff-only, stage the exact paths, commit, push origin main
//   k. finish_map_rebuild(id, 'done', log, sha); any failure: 'failed', no push
//
// --dry-run runs the same orchestrator with runners that only print: no command runs,
// no file is written or removed, no request is touched. Reads (map folders, the last
// render's manifest, tiles.json) are real, so the plan it prints is the real plan.
//
// Every side effect goes through `Runners`, so rebuild-map.test.ts drives the whole
// orchestrator with fakes and asserts the literal command list.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describeModMaps, formatModMapsFile, mapId, type DescribeOptions, type ModMapEntry } from './describe-mod-maps'

// --- fixed facts (T52 task, measured 2026-09-30 and 2026-10-02) -------------------------
export const SUPABASE_URL = 'https://gwubcipchkwthsorhcky.supabase.co'
export const GAME_PATH = 'R:\\Games\\Steam\\steamapps\\common\\ProjectZomboid'
export const VANILLA_MAP = 'Muldraugh, KY'
export const VANILLA_FOLDER = `${GAME_PATH}\\media\\maps\\${VANILLA_MAP}`
export const MOD_ROOT = 'R:\\Games\\Steam\\steamapps\\workshop\\content\\108600'
/** The one rolling render output the watcher owns. */
export const OUT = 'R:\\tmp\\pzmap2dzi\\out-latest'
/** The original render output; nothing here may ever write into it. */
export const FORBIDDEN_OUT = 'R:\\tmp\\pzmap2dzi\\out'
export const MANIFEST = `${OUT}\\aurora-render.json`
/** Map= entries that are not places (packages/aurora/src/map/mapId.ts NOT_REAL_MAPS). */
export const HELPER_MAPS: ReadonlySet<string> = new Set(['lawnmower', 'vehicle spawn zones'])

export const TILES_JSON = 'packages/aurora/public/tiles.json'
export const DATA_FILES = [
  'packages/aurora/public/data/areas.json',
  'packages/aurora/public/data/streets.json',
  'packages/aurora/public/data/worldmap.json',
] as const
export const SERVER_MAPS_TXT = 'scripts/tiles/mod-maps/server-maps.txt'
export const SERVER_TOWNS_JSON = 'scripts/tiles/mod-maps/server-towns.json'

/** Everything the watcher may stage, and nothing else. Deletions under these are staged too
 *  (git 2.x `git add -- <dir>` records removals). */
export const STAGE_PATHS = [
  'map/tiles',
  TILES_JSON,
  ...DATA_FILES,
  SERVER_MAPS_TXT,
  'map/index.html',
  'map/tiles.json',
  'map/assets',
] as const

/** Streets count gate: vanilla alone, and any run with map mods (wide, logged). */
export const STREETS_RANGE_VANILLA: [number, number] = [950, 1050]
export const STREETS_RANGE_MODS: [number, number] = [900, 3000]

const LOG_KEEP_CHARS = 1_000_000
/** The tail sent in a heartbeat and in finish (T51 keeps the last 20000 chars). */
export const LOG_TAIL_CHARS = 20_000

// --- runners ---------------------------------------------------------------------------
export interface ExecResult {
  code: number
  output: string
}
export interface ExecOptions {
  cwd?: string
  signal?: AbortSignal
}
export interface FsRunner {
  exists(path: string): boolean
  readText(path: string): string
  writeText(path: string, text: string): void
  listDirs(path: string): string[]
  /** rm -rf; a missing path is not an error. */
  remove(path: string): void
}
export interface RestRunner {
  heartbeat(id: number, logTail: string): Promise<boolean>
  finish(id: number, status: 'done' | 'failed', log: string, sha: string | null): Promise<boolean>
}
export interface Runners {
  exec(cmd: string, args: string[], opts?: ExecOptions): Promise<ExecResult>
  git(args: string[], opts?: ExecOptions): Promise<ExecResult>
  fs: FsRunner
  rest: RestRunner
  describe(opts: DescribeOptions): ModMapEntry[]
  now(): Date
  print(line: string): void
}

// --- pure pieces -----------------------------------------------------------------------
export interface ModMap {
  name: string
  slug: string
}

/**
 * Step a. The mod maps in Map= order: trimmed, empty entries, vanilla and the two helpers
 * dropped, a repeated entry kept once (first wins, as in the game). Vanilla is never an
 * overlay: it is the base layer, and the extractors always add it last.
 */
export function normaliseMaps(maps: readonly string[]): ModMap[] {
  const out: ModMap[] = []
  const seen = new Set<string>()
  for (const raw of maps) {
    const name = String(raw).trim()
    if (!name) continue
    if (name.toLowerCase() === VANILLA_MAP.toLowerCase()) continue
    if (HELPER_MAPS.has(name.toLowerCase())) continue
    const slug = mapId(name)
    if (seen.has(slug)) continue
    seen.add(slug)
    out.push({ name, slug })
  }
  return out
}

export interface Geometry {
  w: number
  h: number
  x0: number
  y0: number
}

export interface RenderFacts {
  /** The slugs the last successful render in OUT was made with; null when none is recorded. */
  lastRenderMaps: string[] | null
  baseExists: boolean
  pyramidExists(slug: string): boolean
  /** OUT's base_top map_info.json geometry. */
  outGeometry: Geometry | null
  /** The committed tiles.json's geometry. */
  committedGeometry: Geometry | null
}

export function sameGeometry(a: Geometry | null, b: Geometry | null): boolean {
  return !!a && !!b && a.w === b.w && a.h === b.h && a.x0 === b.x0 && a.y0 === b.y0
}

/**
 * Step c. A render is skipped only when the last render in OUT already holds every map
 * (the requested maps are a subset of its set, each with its pyramid) AND its base
 * geometry is the one the committed tiles.json describes. Anything else renders.
 */
export function renderDecision(slugs: readonly string[], facts: RenderFacts): { needed: boolean; reason: string } {
  if (!facts.lastRenderMaps) return { needed: true, reason: `no recorded render in ${OUT}` }
  if (!facts.baseExists) return { needed: true, reason: `${OUT} has no base_top pyramid` }
  const last = new Set(facts.lastRenderMaps)
  for (const s of slugs) {
    if (!last.has(s)) return { needed: true, reason: `map ${s} is not in the last render (${facts.lastRenderMaps.join(', ') || 'vanilla only'})` }
    if (!facts.pyramidExists(s)) return { needed: true, reason: `map ${s} has no pyramid in ${OUT}` }
  }
  if (!sameGeometry(facts.outGeometry, facts.committedGeometry)) {
    return { needed: true, reason: 'the last render\'s base geometry differs from the committed tiles.json' }
  }
  return { needed: false, reason: 'every map is in the last render and its geometry matches the committed tiles.json' }
}

/** `--map` value for the extractors: the folder, then the id after the last colon. */
export function extractorMapArgs(mods: readonly { slug: string; mapPath: string }[]): string[] {
  const args: string[] = []
  for (const m of mods) args.push('--map', `${m.mapPath}:${m.slug}`)
  args.push('--map', VANILLA_FOLDER)
  return args
}

export function commitMessage(maps: readonly string[], id: number | null): string {
  const names = maps.map((m) => String(m).trim()).filter((m) => m && !HELPER_MAPS.has(m.toLowerCase()))
  return `chore(tiles): rebuild the live map for ${names.join('; ') || VANILLA_MAP} (admin request #${id ?? 'dry-run'})`
}

/** Removes the key from any text. A short or empty key is not a key. */
export function redact(text: string, key: string | undefined): string {
  if (!key || key.length < 8) return text
  return text.split(key).join('[redacted]')
}

function winJoin(...parts: string[]): string {
  return parts.join('\\')
}
function norm(p: string): string {
  return p.replace(/\//g, '\\').replace(/\\+$/, '').toLowerCase()
}
/** Refuses any write target inside R:\tmp\pzmap2dzi\out (the original render). */
export function assertNotForbidden(path: string): void {
  const p = norm(path)
  const f = norm(FORBIDDEN_OUT)
  if (p === f || p.startsWith(f + '\\')) throw new StepError(`refusing to write under ${FORBIDDEN_OUT}: ${path}`)
}

function psQuote(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

export function renderCommand(slugs: readonly string[]): { cmd: string; args: string[] } {
  const modMaps = `@(${slugs.map(psQuote).join(',')})`
  return {
    cmd: 'powershell.exe',
    args: [
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
      `& ${psQuote('scripts\\tiles\\render.ps1')} -GamePath ${psQuote(GAME_PATH)} -Out ${psQuote(OUT)} -ModMaps ${modMaps}; exit $LASTEXITCODE`,
    ],
  }
}

// --- the orchestrator ------------------------------------------------------------------
export class StepError extends Error {}
class Stopped extends Error {}

export interface RebuildRequest {
  id: number | null
  maps: string[]
  workshopItems: string[]
}

export interface RebuildOptions {
  dryRun: boolean
  worker: string
  key?: string
  heartbeatMs?: number
}

export interface RebuildResult {
  status: 'done' | 'failed' | 'stopped' | 'dry-run'
  sha: string | null
  log: string
}

export async function runRebuild(req: RebuildRequest, run: Runners, opts: RebuildOptions): Promise<RebuildResult> {
  let log = ''
  const abort = new AbortController()
  let stopped = false
  const write = (line: string) => {
    const clean = redact(line, opts.key)
    const stamped = `[${run.now().toISOString()}] ${clean}`
    log += stamped + '\n'
    if (log.length > LOG_KEEP_CHARS) log = log.slice(log.length - LOG_KEEP_CHARS)
    run.print(stamped)
  }
  const tail = () => log.slice(-LOG_TAIL_CHARS)

  const beat = async () => {
    if (opts.dryRun || req.id === null || stopped) return
    try {
      const ok = await run.rest.heartbeat(req.id, tail())
      if (!ok) {
        stopped = true
        write('heartbeat refused: the request was cancelled or expired; stopping')
        abort.abort()
      }
    } catch (e) {
      write(`heartbeat failed (will retry): ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  const checkStop = () => {
    if (stopped) throw new Stopped('stopped')
  }

  const exec = async (cmd: string, args: string[], cwd?: string): Promise<ExecResult> => {
    checkStop()
    write(`$ ${cmd} ${args.map(showArg).join(' ')}${cwd ? `   (in ${cwd})` : ''}`)
    const r = await run.exec(cmd, args, { cwd, signal: abort.signal })
    for (const line of r.output.split(/\r?\n|\r/)) if (line.trim()) write(`  ${line}`)
    checkStop()
    return r
  }
  const git = async (args: string[]): Promise<ExecResult> => {
    checkStop()
    write(`$ git ${args.map(showArg).join(' ')}`)
    const r = await run.git(args, { signal: abort.signal })
    for (const line of r.output.split(/\r?\n|\r/)) if (line.trim()) write(`  ${line}`)
    checkStop()
    return r
  }
  const mustGit = async (args: string[], why: string) => {
    const r = await git(args)
    if (r.code !== 0) throw new StepError(`${why} (git ${args[0]} exit ${r.code})`)
    return r
  }
  const fsWrite = (path: string, text: string) => {
    assertNotForbidden(path)
    if (opts.dryRun) write(`would write ${path}`)
    else run.fs.writeText(path, text)
  }
  const fsRemove = (path: string) => {
    assertNotForbidden(path)
    if (opts.dryRun) write(`would remove ${path}`)
    else run.fs.remove(path)
  }

  let timer: ReturnType<typeof setInterval> | undefined
  let sha: string | null = null
  let pushed = false
  try {
    write(`rebuild ${req.id === null ? '(dry run)' : `request #${req.id}`} on ${opts.worker}${opts.dryRun ? ' -- DRY RUN: nothing runs, nothing is written' : ''}`)
    write(`maps (Map= order): ${req.maps.join('; ') || '(none)'}`)
    await beat()
    checkStop()
    timer = setInterval(() => void beat(), opts.heartbeatMs ?? 60_000)

    // --- preflight -----------------------------------------------------------------
    write('== preflight')
    const branch = await mustGit(['rev-parse', '--abbrev-ref', 'HEAD'], 'cannot read the current branch')
    if (!opts.dryRun && branch.output.trim() !== 'main') throw new StepError(`the checkout is on '${branch.output.trim()}', not main`)
    const dirty = await mustGit(['status', '--porcelain', '--', ...STAGE_PATHS], 'cannot read git status')
    if (dirty.output.trim()) throw new StepError('the watcher\'s own paths have uncommitted changes; commit or discard them first')
    await mustGit(['pull', '--ff-only', 'origin', 'main'], 'git pull --ff-only failed: origin/main has diverged from local main; not pushing')
    const ahead = await mustGit(['rev-list', '--count', 'origin/main..HEAD'], 'cannot compare main with origin/main')
    const aheadCount = Number(ahead.output.trim() || '0')
    if (aheadCount > 0) throw new StepError(`local main is ${aheadCount} commit(s) ahead of origin/main; the watcher pushes only its own commit, so push or drop those first`)

    // --- a. normalise --------------------------------------------------------------
    write('== a. normalise maps')
    const mods = normaliseMaps(req.maps)
    const slugs = mods.map((m) => m.slug)
    write(`map mods: ${mods.map((m) => `${m.name} -> ${m.slug}`).join(', ') || 'none (vanilla only)'}`)

    // --- b. describe -----------------------------------------------------------------
    write('== b. describe map mods')
    let described: ModMapEntry[] = []
    if (mods.length > 0) {
      const ids = req.workshopItems.map((s) => String(s).trim()).filter(Boolean)
      const missing = ids.filter((id) => !run.fs.exists(winJoin(MOD_ROOT, id)))
      for (const id of missing) write(`Workshop item ${id} is not on disk under ${MOD_ROOT} (never subscribed to or joined with on this PC)`)
      const present = ids.filter((id) => !missing.includes(id))
      try {
        described = run.describe({ modRoot: MOD_ROOT, steamIds: present, wantedMaps: mods.map((m) => m.name) })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        throw new StepError(`describe-mod-maps refused: ${msg}${missing.length ? `; Workshop items not on disk: ${missing.join(', ')}` : ''}`)
      }
      for (const d of described) write(`  ${mapId(d.mapName)} <- ${d.mapPath} (Workshop ${d.steamId})`)
    }
    fsWrite(SERVER_MAPS_TXT, formatModMapsFile(described))
    const modFolders = mods.map((m) => {
      const d = described.find((e) => mapId(e.mapName) === m.slug)
      if (!d) throw new StepError(`map ${m.name} was not described`)
      return { slug: m.slug, mapPath: d.mapPath.replace(/\//g, '\\') }
    })

    // --- c. render needed? ----------------------------------------------------------
    write('== c. render decision')
    const facts = readRenderFacts(run.fs)
    const decision = renderDecision(slugs, facts)
    write(`render ${decision.needed ? 'NEEDED' : 'skipped'}: ${decision.reason}`)

    // --- d. render -----------------------------------------------------------------
    if (decision.needed) {
      write('== d. render')
      assertNotForbidden(OUT)
      fsRemove(MANIFEST)
      const rc = renderCommand(slugs)
      const r = await exec(rc.cmd, rc.args)
      if (r.code === 3) throw new StepError('render refused: a mod pyramid does not share the base grid (exit 3)')
      if (r.code === 4) throw new StepError('render refused: the cell union is over the 128-cell gate (exit 4)')
      if (r.code !== 0) throw new StepError(`render failed (exit ${r.code})`)
      fsWrite(MANIFEST, JSON.stringify({ maps: slugs, renderedAt: run.now().toISOString() }) + '\n')
      if (!opts.dryRun) {
        const g = readRenderFacts(run.fs)
        if (!sameGeometry(g.outGeometry, g.committedGeometry)) {
          write('warning: the base geometry changed; map/tiles/zombie_top was rendered for the old geometry and needs a by-hand re-render (deploy.md, Re-render)')
        }
      }
    }
    // Pyramids of maps not in this request are dropped from OUT, so make-tiles-json (which
    // refuses a mod_maps folder without --order) and the next decision see only this set.
    const outModMaps = winJoin(OUT, 'html', 'map_data', 'mod_maps')
    for (const extra of run.fs.listDirs(outModMaps).filter((d) => !slugs.includes(d))) fsRemove(winJoin(outModMaps, extra))
    if (slugs.length === 0 && run.fs.exists(outModMaps)) fsRemove(outModMaps)

    // --- e. publish ----------------------------------------------------------------
    write('== e. publish tiles')
    const publishArgs = ['tsx', 'scripts/tiles/publish-tiles.ts', '--from', winJoin(OUT, 'html', 'map_data', 'base_top'), '--to', 'map/tiles']
    for (const s of slugs) publishArgs.push('--overlay', `${s}=${winJoin(OUT, 'html', 'map_data', 'mod_maps', s, 'base_top')}`)
    if ((await exec('npx', publishArgs)).code !== 0) throw new StepError('publish-tiles failed')

    // --- f. drop overlays no longer listed ----------------------------------------------
    write('== f. remove overlays of maps no longer listed')
    const published = run.fs.listDirs('map/tiles/mod_maps')
    for (const extra of published.filter((d) => !slugs.includes(d))) {
      await mustGit(['rm', '-r', '-q', `map/tiles/mod_maps/${extra}`], `git rm of map/tiles/mod_maps/${extra} failed`)
    }

    // --- g. extract ----------------------------------------------------------------
    write('== g. extract data (Map= order, vanilla last)')
    const mapArgs = extractorMapArgs(modFolders)
    warnMissingTowns(run.fs, slugs, write)
    if ((await exec('npx', ['tsx', 'scripts/tiles/extract-objects.ts', ...mapArgs, '--towns', SERVER_TOWNS_JSON])).code !== 0) {
      throw new StepError('extract-objects failed')
    }
    const range = slugs.length === 0 ? STREETS_RANGE_VANILLA : STREETS_RANGE_MODS
    const streets = await exec('npx', ['tsx', 'scripts/tiles/extract-streets.ts', ...mapArgs, '--expect-range', `${range[0]},${range[1]}`])
    if (streets.code !== 0) throw new StepError('extract-streets failed (or the street count is out of range)')
    const count = /entries after: (\d+)/.exec(streets.output)?.[1]
    if (count) write(`streets: ${count} entries (range ${range[0]}-${range[1]})`)
    if ((await exec('npx', ['tsx', 'scripts/tiles/extract-worldmap.ts', ...mapArgs, '--forest-min-area', '200', '--forest-tolerance', '20'])).code !== 0) {
      throw new StepError('extract-worldmap failed')
    }

    // --- h. build ------------------------------------------------------------------
    write('== h. build')
    fsRemove('map/assets')
    if ((await exec('npm', ['run', 'aurora:build'])).code !== 0) throw new StepError('npm run aurora:build failed')

    // --- i. verify -----------------------------------------------------------------
    write('== i. verify')
    if (opts.dryRun) write('would verify tiles.json, overlay tiles, map/index.html assets, the three data files and the streets range')
    else verifyOutput(run.fs, slugs, range, write)
    if ((await exec('npx', ['vitest', 'run'], 'packages/aurora')).code !== 0) throw new StepError('the aurora test suite failed')

    // --- j. git ----------------------------------------------------------------------
    write('== j. commit and push')
    await mustGit(['pull', '--ff-only', 'origin', 'main'], 'git pull --ff-only failed: origin/main has diverged from local main; not pushing')
    await mustGit(['add', '--', ...STAGE_PATHS], 'git add failed')
    const staged = await git(['diff', '--cached', '--quiet', '--', ...STAGE_PATHS])
    if (!opts.dryRun && staged.code === 0) {
      write('nothing changed: the live map already matches this request; no commit, no push')
    } else {
      await mustGit(['commit', '-m', commitMessage(req.maps, req.id), '--', ...STAGE_PATHS], 'git commit failed')
      const head = await mustGit(['rev-parse', 'HEAD'], 'cannot read the new commit')
      sha = head.output.trim() || null
      write(`committed ${sha ?? '(dry run)'}`)
      const push = await git(['push', 'origin', 'main'])
      if (push.code !== 0) throw new StepError(`git push failed (exit ${push.code}); commit ${sha} is local only: push it by hand`)
      pushed = true
    }

    // --- k. finish -----------------------------------------------------------------
    if (opts.dryRun) {
      write('dry run complete: nothing ran')
      return { status: 'dry-run', sha: null, log }
    }
    write(`done${pushed ? `: pushed ${sha}` : ''}`)
    clearInterval(timer)
    timer = undefined
    if (req.id !== null) await safeFinish(run, req.id, 'done', tail(), sha, write)
    return { status: 'done', sha, log }
  } catch (e) {
    if (timer) clearInterval(timer)
    timer = undefined
    if (e instanceof Stopped || stopped) {
      write('stopped; nothing pushed')
      return { status: 'stopped', sha: null, log }
    }
    write(`FAILED: ${e instanceof Error ? e.message : String(e)}`)
    if (!opts.dryRun && req.id !== null) await safeFinish(run, req.id, 'failed', tail(), null, write)
    return { status: 'failed', sha: null, log }
  } finally {
    if (timer) clearInterval(timer)
  }
}

async function safeFinish(run: Runners, id: number, status: 'done' | 'failed', log: string, sha: string | null, write: (l: string) => void) {
  try {
    const ok = await run.rest.finish(id, status, log, sha)
    if (!ok) write(`finish_map_rebuild returned false: request #${id} was no longer running`)
  } catch (e) {
    write(`finish_map_rebuild failed: ${e instanceof Error ? e.message : String(e)}`)
  }
}

function showArg(a: string): string {
  return /^[\w.:\\/=,@-]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`
}

function readJson<T>(fs: FsRunner, path: string): T | null {
  try {
    return fs.exists(path) ? (JSON.parse(fs.readText(path)) as T) : null
  } catch {
    return null
  }
}

export function readRenderFacts(fs: FsRunner): RenderFacts {
  const manifest = readJson<{ maps?: unknown }>(fs, MANIFEST)
  const lastRenderMaps = manifest && Array.isArray(manifest.maps) ? manifest.maps.map(String) : null
  const baseDir = winJoin(OUT, 'html', 'map_data', 'base_top')
  const info = readJson<{ w: number; h: number; x0: number; y0: number }>(fs, winJoin(baseDir, 'map_info.json'))
  const tiles = readJson<{ world?: { pixels?: { w: number; h: number } }; originSquare?: { x: number; y: number } }>(fs, TILES_JSON)
  return {
    lastRenderMaps,
    baseExists: fs.exists(winJoin(baseDir, 'layer0.dzi')),
    pyramidExists: (slug) => fs.exists(winJoin(OUT, 'html', 'map_data', 'mod_maps', slug, 'base_top', 'layer0.dzi')),
    outGeometry: info ? { w: info.w, h: info.h, x0: info.x0, y0: info.y0 } : null,
    committedGeometry:
      tiles?.world?.pixels && tiles.originSquare
        ? { w: tiles.world.pixels.w, h: tiles.world.pixels.h, x0: tiles.originSquare.x, y0: tiles.originSquare.y }
        : null,
  }
}

function warnMissingTowns(fs: FsRunner, slugs: readonly string[], write: (l: string) => void) {
  const towns = readJson<{ towns?: { map?: string }[] }>(fs, SERVER_TOWNS_JSON)
  const have = new Set((towns?.towns ?? []).map((t) => t.map))
  for (const s of slugs) {
    if (!have.has(s)) {
      write(`warning: ${s} has no entry in ${SERVER_TOWNS_JSON}; if the map ships no named regions it gets no town label until one is added by hand (the rebuild continues)`)
    }
  }
}

/** Step i, the file checks. Throws StepError on the first problem. */
export function verifyOutput(fs: FsRunner, slugs: readonly string[], range: [number, number], write: (l: string) => void): void {
  let tiles: { overlays?: { id: string }[] }
  try {
    tiles = JSON.parse(fs.readText(TILES_JSON))
  } catch (e) {
    throw new StepError(`${TILES_JSON} does not parse: ${e instanceof Error ? e.message : String(e)}`)
  }
  const ids = (tiles.overlays ?? []).map((o) => o.id)
  if (ids.join(',') !== slugs.join(',')) throw new StepError(`tiles.json overlays are [${ids.join(', ')}], expected [${slugs.join(', ')}]`)
  for (const id of ids) {
    if (!fs.exists(`map/tiles/mod_maps/${id}/base_top/layer0.dzi`)) throw new StepError(`overlay ${id} has no published tiles`)
  }
  if (!fs.exists('map/tiles.json') || fs.readText('map/tiles.json') !== fs.readText(TILES_JSON)) {
    throw new StepError('map/tiles.json is not the fresh tiles.json (did the build run?)')
  }
  const html = fs.exists('map/index.html') ? fs.readText('map/index.html') : ''
  const refs = [...html.matchAll(/(?:src|href)="\/map\/(assets\/[^"]+)"/g)].map((m) => m[1])
  if (refs.length === 0) throw new StepError('map/index.html references no built assets')
  for (const ref of refs) if (!fs.exists(`map/${ref}`)) throw new StepError(`map/index.html references map/${ref}, which does not exist`)
  for (const f of DATA_FILES) {
    try {
      JSON.parse(fs.readText(f))
    } catch (e) {
      throw new StepError(`${f} does not parse: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  const streets = JSON.parse(fs.readText(DATA_FILES[1])) as unknown[]
  if (streets.length < range[0] || streets.length > range[1]) {
    throw new StepError(`streets.json has ${streets.length} entries, outside ${range[0]}-${range[1]}`)
  }
  write(`verified: ${ids.length} overlay(s), ${refs.length} asset reference(s), ${streets.length} streets`)
}

// --- real runners ----------------------------------------------------------------------
function realRunners(repo: string, key: string | undefined, dryRun: boolean): Runners {
  const tsxCli = resolve(repo, 'node_modules/tsx/dist/cli.mjs')
  const at = (p: string) => resolve(repo, p)
  const execReal = (cmd: string, args: string[], opts: ExecOptions = {}): Promise<ExecResult> =>
    new Promise((done) => {
      const cwd = opts.cwd ? at(opts.cwd) : repo
      let child
      if (cmd === 'npx' && args[0] === 'tsx') {
        child = spawn(process.execPath, [tsxCli, ...args.slice(1)], { cwd, windowsHide: true })
      } else if (cmd === 'npx' || cmd === 'npm') {
        // .cmd shims need a shell on Windows; these argument lists are fixed words only.
        if (!args.every((a) => /^[\w.:-]+$/.test(a))) throw new Error(`unsafe argument for ${cmd}: ${args.join(' ')}`)
        child = spawn(`${cmd} ${args.join(' ')}`, { cwd, shell: true, windowsHide: true })
      } else {
        child = spawn(cmd, args, { cwd, windowsHide: true })
      }
      let output = ''
      child.stdout?.on('data', (d) => { output += d.toString() })
      child.stderr?.on('data', (d) => { output += d.toString() })
      const onAbort = () => {
        if (child.pid) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true })
      }
      opts.signal?.addEventListener('abort', onAbort, { once: true })
      child.on('error', (e) => { output += `\n${e.message}`; done({ code: 127, output }) })
      child.on('close', (code) => {
        opts.signal?.removeEventListener('abort', onAbort)
        done({ code: code ?? 1, output })
      })
    })
  const printOnly = async (): Promise<ExecResult> => ({ code: 0, output: '' })

  const rpc = async (fn: string, body: Record<string, unknown>): Promise<unknown> => {
    if (!key) throw new Error('no service role key')
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'aurora',
        'Accept-Profile': 'aurora',
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`${fn}: HTTP ${res.status} ${text.slice(0, 300)}`)
    return text ? JSON.parse(text) : null
  }

  return {
    exec: dryRun ? printOnly : execReal,
    git: dryRun ? printOnly : (args, opts) => execReal('git', args, opts),
    fs: {
      exists: (p) => existsSync(at(p)),
      readText: (p) => readFileSync(at(p), 'utf8'),
      writeText: (p, text) => {
        if (dryRun) throw new Error('dry run must not write')
        mkdirSync(dirname(at(p)), { recursive: true })
        writeFileSync(at(p), text)
      },
      listDirs: (p) => {
        try {
          return statSync(at(p)).isDirectory()
            ? readdirSync(at(p), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
            : []
        } catch {
          return []
        }
      },
      remove: (p) => {
        if (dryRun) throw new Error('dry run must not remove')
        rmSync(at(p), { recursive: true, force: true })
      },
    },
    rest: {
      heartbeat: async (id, logTail) => (await rpc('heartbeat_map_rebuild', { p_id: id, p_log_tail: logTail })) === true,
      finish: async (id, status, log, sha) =>
        (await rpc('finish_map_rebuild', { p_id: id, p_status: status, p_log: log, p_commit_sha: sha })) === true,
    },
    describe: describeModMaps,
    now: () => new Date(),
    print: (line) => console.log(line),
  }
}

function argValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : undefined
}

function splitList(v: string | undefined): string[] {
  return (v ?? '').split(';').map((s) => s.trim()).filter(Boolean)
}

/** The claimed row (T51 columns) or the dry-run flags, as a RebuildRequest. */
export function parseRequest(argv: string[]): RebuildRequest {
  const file = argValue(argv, '--request-file')
  const json = file ? readFileSync(file, 'utf8') : argValue(argv, '--request')
  if (json) {
    const raw = JSON.parse(json.replace(/^\uFEFF/, ''))
    const row = Array.isArray(raw) ? raw[0] : raw
    if (!row || typeof row !== 'object') throw new Error('the request is not a row')
    const id = Number(row.id)
    if (!Number.isInteger(id)) throw new Error('the request row has no integer id')
    return {
      id,
      maps: Array.isArray(row.maps) ? row.maps.map(String) : [],
      workshopItems: Array.isArray(row.workshop_items) ? row.workshop_items.map(String) : splitList(row.workshop_items),
    }
  }
  return { id: null, maps: splitList(argValue(argv, '--maps')), workshopItems: splitList(argValue(argv, '--workshop')) }
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const worker = argValue(argv, '--worker') ?? process.env.COMPUTERNAME ?? 'unknown'
  const key = process.env.AURORA_SERVICE_KEY?.trim()
  delete process.env.AURORA_SERVICE_KEY
  let req: RebuildRequest
  try {
    req = parseRequest(argv)
  } catch (e) {
    console.error(`bad request: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(2)
  }
  if (!dryRun && (req.id === null || !key)) {
    console.error('usage: rebuild-map.ts --request-file <file> | --request <json> --worker <name> (AURORA_SERVICE_KEY set by watch-rebuild.ps1), or --dry-run --maps "<a>;<b>" --workshop "<id>;<id>"')
    process.exit(2)
  }
  // This file is scripts/tiles/rebuild-map.ts; the repo root is two folders up.
  const repo = resolve(process.argv[1], '..', '..', '..')
  const result = await runRebuild(req, realRunners(repo, key, dryRun), { dryRun, worker, key })
  process.exit(result.status === 'done' || result.status === 'dry-run' ? 0 : result.status === 'stopped' ? 3 : 1)
}

if (process.argv[1] && (process.argv[1].endsWith('rebuild-map.ts') || process.argv[1].endsWith('rebuild-map.js'))) {
  void main()
}
