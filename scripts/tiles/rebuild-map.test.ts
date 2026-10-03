import { describe, expect, it } from 'vitest'
import type { DescribeOptions, ModMapEntry } from './describe-mod-maps'
import {
  FORBIDDEN_OUT,
  MANIFEST,
  MOD_ROOT,
  OUT,
  SERVER_MAPS_TXT,
  STAGE_PATHS,
  TILES_JSON,
  VANILLA_FOLDER,
  assertNotForbidden,
  commitMessage,
  normaliseMaps,
  parseRequest,
  redact,
  renderDecision,
  runRebuild,
  type ExecResult,
  type RebuildRequest,
  type RenderFacts,
  type Runners,
} from './rebuild-map'

// T52: the orchestrator runs against fake runners only. Nothing here starts a process,
// touches git, the network, the render output or the repo's files.

const KEY = 'sb_secret_THIS-IS-THE-SERVICE-ROLE-KEY-0123456789'
const RC = 'R:/Games/Steam/steamapps/workshop/content/108600/3484263516/mods/Raven Creek B42/common/media/maps/Raven Creek B42'
const CT = 'R:/Games/Steam/steamapps/workshop/content/108600/3480990544/mods/Constown/common/media/maps/Constown, KY'
const RC_WIN = RC.replace(/\//g, '\\')
const CT_WIN = CT.replace(/\//g, '\\')
const GEOM = { world: { pixels: { w: 19968, h: 17920 } }, originSquare: { x: 0, y: 0 } }
const PATHS = STAGE_PATHS.join(' ')
const BASE = `${OUT}\\html\\map_data\\base_top`
const MODS = `${OUT}\\html\\map_data\\mod_maps`

const REQUEST: RebuildRequest = {
  id: 42,
  maps: ['Raven Creek B42', 'Lawnmower', 'Muldraugh, KY', 'Constown, KY', 'Vehicle Spawn Zones'],
  workshopItems: ['3484263516', '3480990544', '2200148440'],
}

interface World {
  run: Runners
  calls: string[]
  printed: string[]
  heartbeats: string[]
  finishes: { status: string; log: string; sha: string | null }[]
  writes: string[]
  removes: string[]
}

interface WorldOptions {
  files?: Record<string, string>
  dirs?: Record<string, string[]>
  exec?: (line: string) => ExecResult | undefined
  git?: (line: string) => ExecResult | undefined
  heartbeat?: boolean
  describe?: (o: DescribeOptions) => ModMapEntry[]
  onDisk?: string[]
}

/** The files the verify step reads, for a successful run publishing `slugs`. */
function builtFiles(slugs: string[], streets = 1100): Record<string, string> {
  const tiles = JSON.stringify({ ...GEOM, ...(slugs.length ? { overlays: slugs.map((id) => ({ id })) } : {}) })
  const files: Record<string, string> = {
    [TILES_JSON]: tiles,
    'map/tiles.json': tiles,
    'map/index.html': '<script type="module" crossorigin src="/map/assets/index-A.js"></script><link rel="stylesheet" href="/map/assets/index-B.css">',
    'map/assets/index-A.js': '',
    'map/assets/index-B.css': '',
    'packages/aurora/public/data/areas.json': '[]',
    'packages/aurora/public/data/streets.json': JSON.stringify(Array.from({ length: streets }, () => ({}))),
    'packages/aurora/public/data/worldmap.json': '{}',
    'scripts/tiles/mod-maps/server-towns.json': JSON.stringify({ towns: [{ map: 'raven-creek-b42' }, { map: 'constown-ky' }] }),
  }
  for (const s of slugs) files[`map/tiles/mod_maps/${s}/base_top/layer0.dzi`] = ''
  return files
}

function describeFake(o: DescribeOptions): ModMapEntry[] {
  const known: Record<string, ModMapEntry> = {
    'Raven Creek B42': { mapName: 'Raven Creek B42', modName: 'Raven Creek B42', steamId: '3484263516', mapPath: RC, texture: false },
    'Constown, KY': { mapName: 'Constown, KY', modName: 'Constown', steamId: '3480990544', mapPath: CT, texture: false },
  }
  return (o.wantedMaps ?? []).map((n) => {
    const e = known[n]
    if (!e || !o.steamIds.includes(e.steamId)) throw new Error(`map '${n}' not found under any given steam id in ${o.modRoot}`)
    return e
  })
}

function world(o: WorldOptions = {}): World {
  const files = new Map(Object.entries({ ...builtFiles(['raven-creek-b42', 'constown-ky']), ...(o.files ?? {}) }))
  const dirs = new Map(Object.entries(o.dirs ?? {}))
  const onDisk = new Set((o.onDisk ?? ['3484263516', '3480990544']).map((id) => `${MOD_ROOT}\\${id}`))
  const w: World = { calls: [], printed: [], heartbeats: [], finishes: [], writes: [], removes: [], run: undefined as unknown as Runners }
  w.run = {
    exec: async (cmd, args) => {
      const line = `${cmd} ${args.join(' ')}`
      w.calls.push(line)
      return o.exec?.(line) ?? { code: 0, output: line.includes('extract-streets') ? 'entries after: 1100' : '' }
    },
    git: async (args) => {
      const line = `git ${args.join(' ')}`
      w.calls.push(line)
      const custom = o.git?.(line)
      if (custom) return custom
      if (line === 'git rev-parse --abbrev-ref HEAD') return { code: 0, output: 'main\n' }
      if (line === 'git rev-list --count origin/main..HEAD') return { code: 0, output: '0\n' }
      if (line.startsWith('git diff --cached --quiet')) return { code: 1, output: '' }
      if (line === 'git rev-parse HEAD') return { code: 0, output: 'abc1234\n' }
      return { code: 0, output: '' }
    },
    fs: {
      exists: (p) => files.has(p) || dirs.has(p) || onDisk.has(p),
      readText: (p) => {
        const t = files.get(p)
        if (t === undefined) throw new Error(`ENOENT ${p}`)
        return t
      },
      writeText: (p, t) => {
        w.writes.push(p)
        files.set(p, t)
      },
      listDirs: (p) => dirs.get(p) ?? [],
      remove: (p) => {
        w.removes.push(p)
        files.delete(p)
        dirs.delete(p)
      },
    },
    rest: {
      heartbeat: async (_id, tail) => {
        w.heartbeats.push(tail)
        return o.heartbeat ?? true
      },
      finish: async (_id, status, log, sha) => {
        w.finishes.push({ status, log, sha })
        return true
      },
    },
    describe: o.describe ?? describeFake,
    now: () => new Date('2026-10-02T12:00:00Z'),
    print: (l) => w.printed.push(l),
  }
  return w
}

const OPTS = { dryRun: false, worker: 'TESTPC', key: KEY, heartbeatMs: 1e9 }

const RENDER_LINE =
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command & 'scripts\\tiles\\render.ps1' -GamePath 'R:\\Games\\Steam\\steamapps\\common\\ProjectZomboid' ` +
  `-Out '${OUT}' -ModMaps @('raven-creek-b42','constown-ky'); exit $LASTEXITCODE`
const MAP_ARGS = `--map ${RC_WIN}:raven-creek-b42 --map ${CT_WIN}:constown-ky --map ${VANILLA_FOLDER}`
const PUBLISH_LINE =
  `npx tsx scripts/tiles/publish-tiles.ts --from ${BASE} --to map/tiles ` +
  `--overlay raven-creek-b42=${MODS}\\raven-creek-b42\\base_top --overlay constown-ky=${MODS}\\constown-ky\\base_top`
const PREFLIGHT = [
  'git rev-parse --abbrev-ref HEAD',
  `git status --porcelain -- ${PATHS}`,
  'git pull --ff-only origin main',
  'git rev-list --count origin/main..HEAD',
]
const AFTER_PUBLISH = [
  `npx tsx scripts/tiles/extract-objects.ts ${MAP_ARGS} --towns scripts/tiles/mod-maps/server-towns.json`,
  `npx tsx scripts/tiles/extract-streets.ts ${MAP_ARGS} --expect-range 900,3000`,
  `npx tsx scripts/tiles/extract-worldmap.ts ${MAP_ARGS} --forest-min-area 200 --forest-tolerance 20`,
  'npm run aurora:build',
  'npx vitest run',
  'git pull --ff-only origin main',
  `git add -- ${PATHS}`,
  `git diff --cached --quiet -- ${PATHS}`,
  `git commit -m chore(tiles): rebuild the live map for Raven Creek B42; Muldraugh, KY; Constown, KY (admin request #42) -- ${PATHS}`,
  'git rev-parse HEAD',
  'git push origin main',
]

describe('normaliseMaps', () => {
  it('drops vanilla and both helpers, keeps Map= order, slugs each map', () => {
    expect(normaliseMaps(REQUEST.maps)).toEqual([
      { name: 'Raven Creek B42', slug: 'raven-creek-b42' },
      { name: 'Constown, KY', slug: 'constown-ky' },
    ])
  })
  it('trims, ignores case for vanilla and helpers, keeps the first of a repeated map', () => {
    expect(normaliseMaps([' muldraugh, ky ', 'LAWNMOWER', '', 'New Hartburg, KY', 'New Hartburg, KY ', 'vehicle spawn zones']).map((m) => m.slug)).toEqual([
      'new-hartburg-ky',
    ])
  })
})

describe('renderDecision', () => {
  const geom = { w: 19968, h: 17920, x0: 0, y0: 0 }
  const facts = (over: Partial<RenderFacts> = {}): RenderFacts => ({
    lastRenderMaps: ['raven-creek-b42', 'constown-ky', 'havenfall'],
    baseExists: true,
    pyramidExists: () => true,
    outGeometry: geom,
    committedGeometry: geom,
    ...over,
  })
  const ALL = ['raven-creek-b42', 'constown-ky', 'havenfall']
  it('skips only for exactly the last render set (any order) at the committed geometry', () => {
    expect(renderDecision(ALL, facts()).needed).toBe(false)
    expect(renderDecision(['havenfall', 'raven-creek-b42', 'constown-ky'], facts()).needed).toBe(false)
    expect(renderDecision([], facts({ lastRenderMaps: [] })).needed).toBe(false)
  })
  it('renders for a subset of the last render (a dropped map)', () => {
    const d = renderDecision(['constown-ky'], facts())
    expect(d.needed).toBe(true)
    expect(d.reason).toContain('raven-creek-b42, havenfall dropped')
    expect(renderDecision([], facts()).needed).toBe(true)
  })
  it('renders for a map the last render did not have', () => {
    const d = renderDecision([...ALL, 'anruisitown'], facts())
    expect(d.needed).toBe(true)
    expect(d.reason).toContain('anruisitown')
  })
  it('renders when the geometry differs from the committed tiles.json', () => {
    expect(renderDecision(ALL, facts({ committedGeometry: { ...geom, w: 20224 } })).needed).toBe(true)
    expect(renderDecision(ALL, facts({ outGeometry: null })).needed).toBe(true)
  })
  it('renders with no recorded render, no base, or a missing pyramid', () => {
    expect(renderDecision([], facts({ lastRenderMaps: null })).needed).toBe(true)
    expect(renderDecision(ALL, facts({ baseExists: false })).needed).toBe(true)
    expect(renderDecision(ALL, facts({ pyramidExists: () => false })).needed).toBe(true)
  })
})

describe('runRebuild: the command plan', () => {
  it('renders, publishes and extracts in Map= order, stages exact paths, commits and pushes', async () => {
    const w = world()
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('done')
    expect(r.sha).toBe('abc1234')
    expect(w.calls).toEqual([...PREFLIGHT, RENDER_LINE, PUBLISH_LINE, ...AFTER_PUBLISH])
    expect(w.finishes).toEqual([expect.objectContaining({ status: 'done', sha: 'abc1234' })])
    expect(w.writes).toEqual([SERVER_MAPS_TXT, MANIFEST])
    expect(w.removes).toEqual([MANIFEST, 'map/assets'])
    expect(w.heartbeats.length).toBe(1)
  })

  it('never stages anything but the watcher\'s own paths', async () => {
    const w = world()
    await runRebuild(REQUEST, w.run, OPTS)
    const adds = w.calls.filter((c) => c.startsWith('git add') || c.startsWith('git commit'))
    expect(adds).toHaveLength(2)
    for (const c of adds) {
      expect(c).not.toMatch(/ -A\b| --all\b| \.( |$)/)
      expect(c.split(' -- ')[1]).toBe(PATHS)
    }
    expect([...STAGE_PATHS]).toEqual([
      'map/tiles',
      'packages/aurora/public/tiles.json',
      'packages/aurora/public/data/areas.json',
      'packages/aurora/public/data/streets.json',
      'packages/aurora/public/data/worldmap.json',
      'scripts/tiles/mod-maps/server-maps.txt',
      'map/index.html',
      'map/tiles.json',
      'map/assets',
    ])
  })

  const SKIP_FILES = {
    [`${BASE}\\layer0.dzi`]: '',
    [`${BASE}\\map_info.json`]: JSON.stringify({ w: 19968, h: 17920, x0: 0, y0: 0 }),
    [`${MODS}\\raven-creek-b42\\base_top\\layer0.dzi`]: '',
    [`${MODS}\\constown-ky\\base_top\\layer0.dzi`]: '',
  }

  it('renders for a request that drops a map from the last render', async () => {
    const w = world({ files: { ...SKIP_FILES, [MANIFEST]: JSON.stringify({ maps: ['raven-creek-b42', 'constown-ky', 'havenfall'] }) } })
    expect((await runRebuild(REQUEST, w.run, OPTS)).status).toBe('done')
    expect(w.calls).toContain(RENDER_LINE)
    expect(w.printed.join('\n')).toContain('render NEEDED: map(s) havenfall dropped since the last render')
  })

  it('skips the render when the last render had exactly this map set at the committed geometry', async () => {
    const w = world({
      files: {
        [MANIFEST]: JSON.stringify({ maps: ['constown-ky', 'raven-creek-b42'] }),
        [`${BASE}\\layer0.dzi`]: '',
        [`${BASE}\\map_info.json`]: JSON.stringify({ w: 19968, h: 17920, x0: 0, y0: 0 }),
        [`${MODS}\\raven-creek-b42\\base_top\\layer0.dzi`]: '',
        [`${MODS}\\constown-ky\\base_top\\layer0.dzi`]: '',
      },
      dirs: { [MODS]: ['raven-creek-b42', 'constown-ky', 'havenfall'] },
    })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('done')
    expect(w.calls).toEqual([...PREFLIGHT, PUBLISH_LINE, ...AFTER_PUBLISH])
    expect(w.removes).toEqual([`${MODS}\\havenfall`, 'map/assets'])
  })

  it('renders when a map is new to the last render', async () => {
    const w = world({
      files: {
        [MANIFEST]: JSON.stringify({ maps: ['raven-creek-b42'] }),
        [`${BASE}\\layer0.dzi`]: '',
        [`${BASE}\\map_info.json`]: JSON.stringify({ w: 19968, h: 17920, x0: 0, y0: 0 }),
        [`${MODS}\\raven-creek-b42\\base_top\\layer0.dzi`]: '',
      },
    })
    await runRebuild(REQUEST, w.run, OPTS)
    expect(w.calls).toContain(RENDER_LINE)
  })

  it('git rm\'s the published overlay of a map no longer listed', async () => {
    const w = world({ dirs: { 'map/tiles/mod_maps': ['raven-creek-b42', 'havenfall', 'constown-ky'] } })
    await runRebuild(REQUEST, w.run, OPTS)
    expect(w.calls.filter((c) => c.startsWith('git rm'))).toEqual(['git rm -r -q map/tiles/mod_maps/havenfall'])
    expect(w.calls.indexOf('git rm -r -q map/tiles/mod_maps/havenfall')).toBe(w.calls.indexOf(PUBLISH_LINE) + 1)
  })

  it('vanilla only: no overlays, vanilla street range, the stale mod_maps folder of the render output dropped', async () => {
    const w = world({ files: builtFiles([], 1000), dirs: { [MODS]: ['raven-creek-b42'], 'map/tiles/mod_maps': ['raven-creek-b42'] } })
    const r = await runRebuild({ id: 7, maps: ['Muldraugh, KY', 'Lawnmower'], workshopItems: [] }, w.run, OPTS)
    expect(r.status).toBe('done')
    expect(w.calls).toContain(`npx tsx scripts/tiles/publish-tiles.ts --from ${BASE} --to map/tiles`)
    expect(w.calls).toContain(`npx tsx scripts/tiles/extract-streets.ts --map ${VANILLA_FOLDER} --expect-range 950,1050`)
    expect(w.calls).toContain('git rm -r -q map/tiles/mod_maps/raven-creek-b42')
    expect(w.removes).toContain(`${MODS}\\raven-creek-b42`)
  })
})

describe('runRebuild: never push after a failure', () => {
  const noPush = (w: World) => {
    expect(w.calls.some((c) => c.startsWith('git push'))).toBe(false)
    expect(w.calls.some((c) => c.startsWith('git commit'))).toBe(false)
  }

  it('render exit 4 fails with the 128-cell reason', async () => {
    const w = world({ exec: (l) => (l.startsWith('powershell.exe') ? { code: 4, output: 'cell union is 130 x 70 cells' } : undefined) })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('failed')
    noPush(w)
    expect(w.finishes).toEqual([expect.objectContaining({ status: 'failed', sha: null })])
    expect(w.finishes[0].log).toContain('128-cell gate (exit 4)')
    expect(w.writes).not.toContain(MANIFEST)
  })

  it('render exit 3 fails with the geometry reason', async () => {
    const w = world({ exec: (l) => (l.startsWith('powershell.exe') ? { code: 3, output: '' } : undefined) })
    expect((await runRebuild(REQUEST, w.run, OPTS)).status).toBe('failed')
    noPush(w)
    expect(w.finishes[0].log).toContain('exit 3')
  })

  it.each([
    ['publish-tiles.ts', 'publish-tiles failed'],
    ['extract-objects.ts', 'extract-objects failed'],
    ['extract-streets.ts', 'extract-streets failed'],
    ['extract-worldmap.ts', 'extract-worldmap failed'],
    ['aurora:build', 'aurora:build failed'],
    ['vitest', 'test suite failed'],
  ])('a failing %s step fails the request and pushes nothing', async (needle, reason) => {
    const w = world({ exec: (l) => (l.includes(needle) ? { code: 1, output: 'boom' } : undefined) })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('failed')
    noPush(w)
    expect(w.finishes[0].log).toContain(reason)
  })

  it('a failed verify (stale map/tiles.json) pushes nothing', async () => {
    const w = world({ files: { 'map/tiles.json': '{}' } })
    expect((await runRebuild(REQUEST, w.run, OPTS)).status).toBe('failed')
    noPush(w)
  })

  it('a pull that fails at the start pushes nothing and runs nothing else', async () => {
    const w = world({ git: (l) => (l.startsWith('git pull') ? { code: 128, output: 'fatal: Not possible to fast-forward, aborting.' } : undefined) })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('failed')
    expect(w.calls).toEqual(PREFLIGHT.slice(0, 3))
    expect(w.finishes[0].log).toContain('diverged')
  })

  it('a pull that fails before the commit pushes nothing', async () => {
    let pulls = 0
    const w = world({ git: (l) => (l.startsWith('git pull') && ++pulls === 2 ? { code: 1, output: 'diverged' } : undefined) })
    expect((await runRebuild(REQUEST, w.run, OPTS)).status).toBe('failed')
    noPush(w)
    expect(w.calls.some((c) => c.startsWith('git add'))).toBe(false)
  })

  it('a failed push reports failed with the local sha in the log', async () => {
    const w = world({ git: (l) => (l.startsWith('git push') ? { code: 1, output: 'rejected' } : undefined) })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('failed')
    expect(w.finishes[0]).toEqual(expect.objectContaining({ status: 'failed', sha: null }))
    expect(w.finishes[0].log).toContain('abc1234 is local only')
  })

  it('refuses when local main is ahead of origin (it would push someone else\'s commits)', async () => {
    const w = world({ git: (l) => (l.startsWith('git rev-list') ? { code: 0, output: '2\n' } : undefined) })
    expect((await runRebuild(REQUEST, w.run, OPTS)).status).toBe('failed')
    expect(w.calls).toEqual(PREFLIGHT)
  })

  it('refuses when its own paths are dirty, or the branch is not main', async () => {
    const dirty = world({ git: (l) => (l.startsWith('git status') ? { code: 0, output: ' M map/tiles.json\n' } : undefined) })
    expect((await runRebuild(REQUEST, dirty.run, OPTS)).status).toBe('failed')
    expect(dirty.calls).toEqual(PREFLIGHT.slice(0, 2))
    const branch = world({ git: (l) => (l === 'git rev-parse --abbrev-ref HEAD' ? { code: 0, output: 'feature\n' } : undefined) })
    expect((await runRebuild(REQUEST, branch.run, OPTS)).status).toBe('failed')
    expect(branch.calls).toEqual(PREFLIGHT.slice(0, 1))
  })

  it('a map not on disk fails before any render and names the missing Workshop item', async () => {
    const w = world({ onDisk: ['3484263516'] })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('failed')
    expect(w.calls).toEqual(PREFLIGHT)
    expect(w.finishes[0].log).toContain('Workshop item 3480990544 is not on disk')
    expect(w.finishes[0].log).toContain("map 'Constown, KY' not found")
    expect(w.writes).toEqual([])
  })

  it('nothing changed: no commit, no push, done', async () => {
    const w = world({ git: (l) => (l.startsWith('git diff --cached') ? { code: 0, output: '' } : undefined) })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('done')
    expect(r.sha).toBeNull()
    expect(w.calls.some((c) => c.startsWith('git commit') || c.startsWith('git push'))).toBe(false)
  })

  it('a refused heartbeat stops at once: nothing runs, no finish', async () => {
    const w = world({ heartbeat: false })
    const r = await runRebuild(REQUEST, w.run, OPTS)
    expect(r.status).toBe('stopped')
    expect(w.calls).toEqual([])
    expect(w.finishes).toEqual([])
  })
})

describe('the key never reaches a log', () => {
  it('is scrubbed from command output, heartbeats, finish and printed lines', async () => {
    const w = world({ exec: (l) => (l.includes('vitest') ? { code: 1, output: `leak ${KEY} leak` } : undefined) })
    await runRebuild(REQUEST, w.run, OPTS)
    const everything = [...w.printed, ...w.heartbeats, ...w.finishes.map((f) => f.log)].join('\n')
    expect(everything).toContain('leak [redacted] leak')
    expect(everything).not.toContain(KEY)
  })
  it('redact leaves text alone without a real key', () => {
    expect(redact('abc', undefined)).toBe('abc')
    expect(redact('abc', 'ab')).toBe('abc')
  })
})

describe('dry run', () => {
  it('prints the plan and touches nothing', async () => {
    const w = world()
    const r = await runRebuild({ id: null, maps: ['Raven Creek B42', 'Muldraugh, KY'], workshopItems: ['3484263516'] }, w.run, { ...OPTS, dryRun: true })
    expect(r.status).toBe('dry-run')
    expect(w.writes).toEqual([])
    expect(w.removes).toEqual([])
    expect(w.heartbeats).toEqual([])
    expect(w.finishes).toEqual([])
    expect(w.printed.join('\n')).toContain(`would write ${SERVER_MAPS_TXT}`)
  })
})

describe('guards and parsing', () => {
  it('refuses to write under the original render output', () => {
    expect(() => assertNotForbidden(FORBIDDEN_OUT)).toThrow()
    expect(() => assertNotForbidden('r:/tmp/pzmap2dzi/out/html/x')).toThrow()
    expect(() => assertNotForbidden(OUT)).not.toThrow()
    expect(() => assertNotForbidden(`${OUT}\\html`)).not.toThrow()
  })
  it('reads a claimed row, array or object, and the dry-run flags', () => {
    const row = { id: 9, maps: ['Raven Creek B42'], workshop_items: ['1', '2'] }
    expect(parseRequest(['--request', JSON.stringify([row])])).toEqual({ id: 9, maps: ['Raven Creek B42'], workshopItems: ['1', '2'] })
    expect(parseRequest(['--request', JSON.stringify(row)]).id).toBe(9)
    expect(parseRequest(['--dry-run', '--maps', 'Raven Creek B42;Muldraugh, KY', '--workshop', '3484263516'])).toEqual({
      id: null,
      maps: ['Raven Creek B42', 'Muldraugh, KY'],
      workshopItems: ['3484263516'],
    })
    expect(() => parseRequest(['--request', '{"maps":[]}'])).toThrow()
  })
  it('names the maps and the request in the commit message', () => {
    expect(commitMessage(['Raven Creek B42', 'Lawnmower', 'Muldraugh, KY'], 12)).toBe(
      'chore(tiles): rebuild the live map for Raven Creek B42; Muldraugh, KY (admin request #12)',
    )
  })
})
