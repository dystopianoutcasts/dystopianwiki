// Derive tiles.json from a rendered pyramid so it is never written by hand.
//
//   npx tsx scripts/tiles/make-tiles-json.ts <base_top dir> [--baseUrl <url>] [--out <file>]
//     [--order <map1,map2,...>]
//
// <base_top dir> is <render out>/html/map_data/base_top (holds layer0.dzi,
// map_info.json and sources.json). Run twice on the same render: the second
// run must produce a byte-identical file, so every field below is derived
// from render artifacts, never from wall-clock "now" or hand-editing.
//
// T45 Part PUBLISH: when <render out>/html/map_data/mod_maps/ exists (Part RENDER's
// dzi_cell_range: all_mod_maps output), `--order` names which of its subfolders to
// publish as tiles.json `overlays`, in Map= order (first entry drawn on top - see
// map/MapView.tsx). Each entry's own map_info.json must describe the exact same
// pyramid geometry as the base's (same rule Part RENDER's render.ps1 enforces at
// render time): a mismatch refuses rather than shipping a misaligned overlay.
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

// --- map_info.json: world geometry -----------------------------------------
export interface MapInfo {
  w: number; h: number; cell_size: number; pz_version: string;
  pzmap2dzi_version: string; git_commit: string;
  cell_rects: [number, number, number, number][];
  x0: number; y0: number; sqr: number;
  minlayer: number; maxlayer: number;
}

export interface TileOverlayEntry {
  id: string
  title: string
  tileUrlTemplate: string
  cellRects: [number, number, number, number][]
}

export interface TilesJson {
  _comment: string
  coordinateSpace: string
  tileSize: number
  maxLevel: number
  format: string
  cellSize: number
  originSquare: { x: number; y: number }
  squaresPerPixelAtMax: number
  world: {
    pixels: { w: number; h: number }
    cells: { w: number; h: number }
    squares: { w: number; h: number }
  }
  cellRects: [number, number, number, number][]
  layers: { min: number; max: number; ground: number; populated: number }
  baseUrl: string
  tileUrlTemplate: string
  sparse: boolean
  renderedWithMapMods: boolean
  source: {
    tool: string
    version: string
    commit: string
    renderedAt: string | null
    renderSeconds: number | null
  }
  _mapModsNote: string
  overlays?: TileOverlayEntry[]
}

/**
 * Compare an overlay pyramid's map_info.json geometry against the base's. Same rule Part
 * RENDER's render.ps1 enforces right after rendering (width, height, cell origin, level
 * count) plus cell_size: a mismatched cell_size would make the width/height comparison
 * meaningless, since the two pyramids would no longer even agree on what a "square" is.
 * Throws with every mismatch listed, not just the first, so one bad render surfaces every
 * problem in a single run.
 */
export function checkOverlayGeometry(id: string, base: MapInfo, overlay: MapInfo): void {
  const mismatches: string[] = []
  if (overlay.w !== base.w || overlay.h !== base.h) {
    mismatches.push(`size ${overlay.w}x${overlay.h} != base ${base.w}x${base.h}`)
  }
  if (overlay.x0 !== base.x0 || overlay.y0 !== base.y0) {
    mismatches.push(`cell origin (${overlay.x0},${overlay.y0}) != base (${base.x0},${base.y0})`)
  }
  if (overlay.minlayer !== base.minlayer || overlay.maxlayer !== base.maxlayer) {
    mismatches.push(`levels ${overlay.minlayer}..${overlay.maxlayer} != base ${base.minlayer}..${base.maxlayer}`)
  }
  if (overlay.cell_size !== base.cell_size) {
    mismatches.push(`cell_size ${overlay.cell_size} != base ${base.cell_size}`)
  }
  if (mismatches.length > 0) {
    throw new Error(`overlay '${id}' geometry differs from the base pyramid: ${mismatches.join('; ')}`)
  }
}

/**
 * Build one tiles.json overlay entry from a mod map's own `mod_maps/<id>/base_top/
 * map_info.json`. `id` is the mod map's folder name under `mod_maps/` - both the overlay's
 * stable id and, absent any richer source of a display name at this stage of the pipeline,
 * its `title` too (Part FINAL or a later task can replace this with a friendlier name).
 * `cellRects` is the OVERLAY's own populated-cell rectangles, not the base's.
 */
export function buildOverlay(id: string, modMapsDir: string, base: MapInfo): TileOverlayEntry {
  const infoPath = join(modMapsDir, id, 'base_top', 'map_info.json')
  if (!existsSync(infoPath)) {
    throw new Error(`overlay '${id}' has no map_info.json at ${infoPath}`)
  }
  const overlayInfo: MapInfo = JSON.parse(readFileSync(infoPath, 'utf8'))
  checkOverlayGeometry(id, base, overlayInfo)
  return {
    id,
    title: id,
    tileUrlTemplate: `{baseUrl}/mod_maps/${id}/base_top/layer{layer}_files/{z}/{x}_{y}.webp`,
    cellRects: overlayInfo.cell_rects,
  }
}

/**
 * Build the tiles.json object from a rendered `base_top` dir. Exported (rather than only
 * run as a CLI script) so tests can point it at a small fixture render folder instead of
 * the real multi-gigabyte output - see make-tiles-json.test.ts.
 */
export function generateTilesJson(dir: string, opts: { baseUrl?: string; order?: string[] } = {}): TilesJson {
  // --- layer0.dzi: pixel dimensions and tile format -------------------------
  const dzi = readFileSync(join(dir, 'layer0.dzi'), 'utf8')
  const tileSize = Number(/TileSize="(\d+)"/.exec(dzi)?.[1])
  const format = /Format="(\w+)"/.exec(dzi)?.[1]
  const width = Number(/Width="(\d+)"/.exec(dzi)?.[1])
  const height = Number(/Height="(\d+)"/.exec(dzi)?.[1])
  if (!tileSize || !format || !width || !height) throw new Error(`could not parse ${join(dir, 'layer0.dzi')}`)
  const maxLevel = Math.ceil(Math.log2(Math.max(width, height)))

  const mapInfo: MapInfo = JSON.parse(readFileSync(join(dir, 'map_info.json'), 'utf8'))
  const cellsWide = mapInfo.w / mapInfo.cell_size
  const cellsHigh = mapInfo.h / mapInfo.cell_size

  // --- sources.json: per-cell provenance --------------------------------------
  // [[cellX, cellY], [mtime, modSourceNames[]]] per populated cell, plus one
  // trailing ["__metadata__", {...}] entry that is not a cell.
  type SourcesEntry = [[number, number] | '__metadata__', [number, string[]] | Record<string, unknown>]
  const sourcesRaw: SourcesEntry[] = JSON.parse(readFileSync(join(dir, 'sources.json'), 'utf8'))
  const cellEntries = sourcesRaw.filter((e): e is [[number, number], [number, string[]]] => e[0] !== '__metadata__')
  const populatedCells = cellEntries.length
  // This is the reliable signal for map-mod content: unlike the out/texture/
  // folder list (populated for every declared mod regardless of whether its
  // cells were rendered, because use_depend_texture_only=false), each cell's
  // own mod-source list only names a mod when that cell actually drew from it.
  const sourcesNameAMod = cellEntries.some(([, [, mods]]) => mods.length > 0)
  const sparse = populatedCells < cellsWide * cellsHigh

  // --- populated floor layers: base_top/layer<N>_files with >=1 tile file ----
  function hasAnyFile(path: string): boolean {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const full = join(path, entry.name)
      if (entry.isFile()) return true
      if (entry.isDirectory() && hasAnyFile(full)) return true
    }
    return false
  }
  const layerDirPattern = /^layer(-?\d+)_files$/
  const populatedLayers = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && layerDirPattern.test(e.name))
    .filter((e) => hasAnyFile(join(dir, e.name))).length

  // --- render timing: optional render-start.txt / render-end.txt, written by
  // render.ps1 at the render root (four levels above <base_top dir>: base_top
  // -> map_data -> html -> <Out> -> render root). Older renders may not have
  // them; the fields are then omitted rather than guessed.
  const renderRoot = resolve(dir, '..', '..', '..', '..')
  const startFile = join(renderRoot, 'render-start.txt')
  const endFile = join(renderRoot, 'render-end.txt')
  let renderedAt: string | null = null
  let renderSeconds: number | null = null
  if (existsSync(startFile) && existsSync(endFile)) {
    const startEpoch = Number(readFileSync(startFile, 'utf8').trim())
    const endEpoch = Number(readFileSync(endFile, 'utf8').trim())
    if (Number.isFinite(startEpoch) && Number.isFinite(endEpoch)) {
      renderSeconds = endEpoch - startEpoch
      renderedAt = new Date(endEpoch * 1000).toISOString().slice(0, 10)
    }
  }

  // --- T45 Part PUBLISH: mod-map overlays -------------------------------------
  // `mod_maps/` is a sibling of `base_top` under map_data (Part RENDER Facts: pzmap2dzi
  // renders each mod map as a separate pyramid at .../mod_maps/<map name>/base_top).
  const modMapsDir = join(dir, '..', 'mod_maps')
  let overlays: TileOverlayEntry[] = []
  if (existsSync(modMapsDir)) {
    if (!opts.order || opts.order.length === 0) {
      throw new Error(
        `${modMapsDir} exists but no --order was given; list the mod maps to publish in ` +
        `Map= order (first entry drawn on top), e.g. --order sd_cc,other_mod`,
      )
    }
    overlays = opts.order.map((id) => buildOverlay(id, modMapsDir, mapInfo))
  }
  const renderedWithMapMods = sourcesNameAMod || overlays.length > 0

  const mapModsNote = renderedWithMapMods
    ? `Rendered WITH map mods: sources.json names a mod source for at least one of the ${populatedCells} populated cells, or ${overlays.length} overlay(s) are published.`
    : `Vanilla ${mapInfo.pz_version} only: sources.json names no mod source for any of the ${populatedCells} populated cells. Mod texture folders under out/texture/ can appear anyway as a side effect of use_depend_texture_only=false and do NOT mean those maps were rendered - sources.json's per-cell provenance is the reliable signal, not the texture folder listing.`

  const tiles: TilesJson = {
    _comment: 'Generated by scripts/tiles/make-tiles-json.ts from map_info.json and sources.json. Do not hand-edit.',
    coordinateSpace: 'b42-square',
    tileSize,
    maxLevel,
    format,
    cellSize: mapInfo.cell_size,
    originSquare: { x: mapInfo.x0, y: mapInfo.y0 },
    squaresPerPixelAtMax: mapInfo.sqr,
    world: {
      pixels: { w: mapInfo.w, h: mapInfo.h },
      cells: { w: cellsWide, h: cellsHigh },
      squares: { w: mapInfo.w / mapInfo.sqr, h: mapInfo.h / mapInfo.sqr },
    },
    cellRects: mapInfo.cell_rects,
    layers: { min: mapInfo.minlayer, max: mapInfo.maxlayer, ground: 0, populated: populatedLayers },
    baseUrl: opts.baseUrl ?? '',
    tileUrlTemplate: '{baseUrl}/base_top/layer{layer}_files/{z}/{x}_{y}.webp',
    sparse,
    renderedWithMapMods,
    source: {
      tool: 'pzmap2dzi',
      version: mapInfo.pzmap2dzi_version,
      commit: mapInfo.git_commit,
      renderedAt,
      renderSeconds,
    },
    _mapModsNote: mapModsNote,
    ...(overlays.length > 0 ? { overlays } : {}),
  }
  return tiles
}

function main() {
  const dir = process.argv[2]
  if (!dir || dir.startsWith('--')) {
    console.error('usage: make-tiles-json.ts <base_top dir> [--baseUrl <url>] [--out <file>] [--order <map1,map2,...>]')
    process.exit(1)
  }
  const out = resolve(arg('--out') ?? 'packages/aurora/public/tiles.json')
  const orderArg = arg('--order')
  const order = orderArg ? orderArg.split(',').map((s) => s.trim()).filter((s) => s.length > 0) : undefined

  const tiles = generateTilesJson(dir, { baseUrl: arg('--baseUrl'), order })

  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(tiles, null, 2) + '\n')
  console.log(`wrote ${out}`)
  console.log(JSON.stringify(tiles))
}

if (process.argv[1] && process.argv[1].endsWith('make-tiles-json.ts')) {
  main()
}
