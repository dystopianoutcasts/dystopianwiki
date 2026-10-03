// Extract named areas (towns and landmarks) into map/data/areas.json, so the map can
// label towns and points of interest the way the in-game map does.
//
//   npx tsx scripts/tiles/extract-objects.ts [<regions.lua path>] [--out <file>]
//
// SOURCE CORRECTION (T22 Part D, 2026-09-29): the task's own Facts describe objects.lua
// as holding "named areas". Measured directly against the real install, that is wrong
// for this file: objects.lua's TownZone rows are always name="" (32,941 of them), and
// the handful of other rows that DO carry a name (Farm/Ranch/LootZone) are population
// or loot-density labels ("poultry", "cow", "Rich"), never place names - confirmed by
// grep, not assumed. regions.lua, in the same map folder, holds the actual named
// rectangles in the identical { name, type, x, y, z, width, height } shape: `type =
// "Region"` rows are the towns (Muldraugh, WestPoint, Riverside, Rosewood, Louisville,
// Jefferson, MarchRidge, ValleyStation, LAA - each split into many small tiles, hence
// the merge-by-name below), and `type = "BuildingName"` rows are named landmarks
// (KnoxBank, CrossRoadsMall, BensCabin, ...). This script keeps the filename FINISH.md
// specifies (extract-objects.ts) but reads regions.lua. Coordinate space verified here
// against a known place (T22 Do step, same standard as Parts A/B): every merged area's
// centroid falls inside one of tiles.json's own cellRects, and the Muldraugh centroid
// (10500, 10250) lands almost exactly on the map's own default view (10770, 10271) -
// which would not hold if this file used a different coordinate space.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { readOwnedCells, mergeByOwnership, mapTag, tagItems, toSpecs } from './extract-streets'
import type { MapSpec } from './extract-streets'

const DEFAULT_REGIONS_LUA =
  'R:/Games/Steam/steamapps/common/ProjectZomboid/media/maps/Muldraugh, KY/regions.lua'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

/** Every value passed after a repeatable flag, e.g. several `--map <folder>` pairs, in
 *  the order they appear on the command line. */
function args(name: string): string[] {
  const out: string[] = []
  for (let i = 0; i < process.argv.length - 1; i++) {
    if (process.argv[i] === name) out.push(process.argv[i + 1])
  }
  return out
}

export interface RegionRow {
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  /** T50: the id of the map this row came from; absent for vanilla. */
  m?: string
}

export type AreaKind = 'town' | 'landmark'

export interface Area {
  name: string
  kind: AreaKind
  /** Area-weighted centroid in world squares, across every rectangle sharing this name. */
  x: number
  y: number
  /** Summed width*height across every merged rectangle: bigger names (towns) read bigger on the map. */
  areaSquares: number
  /** How many regions.lua rows share this name. */
  count: number
  /** True for a map-mod town from the towns file (T45): the map draws vanilla names
   *  first and moves a mod name aside when the two would overlap. */
  mod?: boolean
  /** T50: the map that owns this area (a map id); absent for vanilla. Written last. */
  m?: string
}

const ROW_RE =
  /\{\s*name\s*=\s*"([^"]*)"\s*,\s*type\s*=\s*"([^"]*)"\s*,\s*x\s*=\s*(-?[\d.]+)\s*,\s*y\s*=\s*(-?[\d.]+)\s*,\s*z\s*=\s*(-?[\d.]+)\s*,\s*width\s*=\s*(-?[\d.]+)\s*,\s*height\s*=\s*(-?[\d.]+)\s*,?\s*\}/g

/** Parse regions.lua. Regex, not a full Lua parser: the schema is flat and fixed (see the header). */
export function parseRegions(lua: string): RegionRow[] {
  const rows: RegionRow[] = []
  for (const m of lua.matchAll(ROW_RE)) {
    const [, name, type, x, y, , width, height] = m
    rows.push({ name, type, x: Number(x), y: Number(y), width: Number(width), height: Number(height) })
  }
  return rows
}

const NAMED_TYPES: Record<string, AreaKind> = { Region: 'town', BuildingName: 'landmark' }

/**
 * One rectangle per name becomes one labelled area: an area-weighted centroid (so a
 * few oversized tiles don't drag a town's label off its own middle, the way a plain
 * average of the tile centres would) and the summed area, so a town reads bigger than
 * a landmark at the same zoom (build.ts). Rows whose type isn't a named-area type, or
 * whose name is blank, carry nothing to label and are dropped.
 */
export function groupAreas(rows: RegionRow[]): Area[] {
  // T50: keyed by map and name, so one area never mixes two maps' rows and is dropped
  // with its map. Vanilla alone: every key is the name, as before.
  const byName = new Map<string, RegionRow[]>()
  for (const r of rows) {
    if (!r.name || !NAMED_TYPES[r.type]) continue
    const key = r.m === undefined ? r.name : `${r.m}\u0000${r.name}`
    const list = byName.get(key) ?? []
    list.push(r)
    byName.set(key, list)
  }
  const out: Area[] = []
  for (const list of byName.values()) {
    const name = list[0].name
    let weightSum = 0
    let sumX = 0
    let sumY = 0
    let totalArea = 0
    for (const r of list) {
      const weight = Math.max(1, r.width * r.height) // a zero-area row still counts as one point
      sumX += (r.x + r.width / 2) * weight
      sumY += (r.y + r.height / 2) * weight
      weightSum += weight
      totalArea += r.width * r.height
    }
    out.push({
      name,
      kind: NAMED_TYPES[list[0].type],
      x: Math.round(sumX / weightSum),
      y: Math.round(sumY / weightSum),
      areaSquares: totalArea,
      count: list.length,
      ...(list[0].m !== undefined ? { m: list[0].m } : {}),
    })
  }
  return out.sort((a, b) => b.areaSquares - a.areaSquares)
}

// --- T45 Part EXTRACT: merging several map folders, Map= order (see extract-streets.ts
// for the shared cell-ownership rule this reuses rather than duplicates) ------------

/** The four corners of a regions.lua rectangle - the "points" the merge rule checks for
 *  cell ownership, since a region row carries no vertex list of its own. */
function rectCorners(r: RegionRow): [number, number][] {
  return [
    [r.x, r.y],
    [r.x + r.width, r.y],
    [r.x, r.y + r.height],
    [r.x + r.width, r.y + r.height],
  ]
}

/** Read one map folder's regions.lua rows, or none when it does not ship one. */
export function readMapFolderRegions(mapFolder: string): RegionRow[] {
  try {
    return parseRegions(readFileSync(join(mapFolder, 'regions.lua'), 'utf8'))
  } catch (e) {
    console.warn(`no regions.lua in ${mapFolder} (${e instanceof Error ? e.message : String(e)}); it contributes no areas`)
    return []
  }
}

/** Merge regions.lua rows from several map folders, in Map= order, each row tagged with
 *  its map (T50; vanilla untagged). */
export function mergeRegionRows(maps: (string | MapSpec)[]): RegionRow[] {
  const specs = toSpecs(maps)
  const cellSets = specs.map((s) => readOwnedCells(s.folder))
  const perMap = specs.map((s) => tagItems(readMapFolderRegions(s.folder), mapTag(s)))
  return mergeByOwnership(perMap, cellSets, rectCorners)
}

/** One town label for a map mod that ships no named regions (T45): the committed
 *  scripts/tiles/mod-maps/server-towns.json, whose names the owner may edit. */
export interface ModTown {
  name: string
  x: number
  y: number
  areaSquares: number
  /** T50: the map id the town belongs to (the file's `map`), emitted as the area's `m`. */
  map?: string
}

/** Read and check a towns file: `{ towns: [{ map?, name, x, y, areaSquares }] }`. Throws on a
 *  malformed entry, so a typo in a hand-edited name file stops the run. */
export function parseModTowns(json: string): ModTown[] {
  const data: unknown = JSON.parse(json)
  const list = (data as { towns?: unknown }).towns
  if (!Array.isArray(list)) throw new Error('towns file: expected { "towns": [...] }')
  return list.map((t, i) => {
    const o = t as Record<string, unknown>
    if (typeof o.name !== 'string' || o.name.trim() === '') throw new Error(`towns file: entry ${i} has no name`)
    for (const k of ['x', 'y', 'areaSquares'] as const) {
      if (typeof o[k] !== 'number' || !Number.isFinite(o[k])) throw new Error(`towns file: entry ${i} (${o.name}) has no numeric ${k}`)
    }
    if (o.map !== undefined && (typeof o.map !== 'string' || o.map.trim() === '')) throw new Error(`towns file: entry ${i} (${o.name}) has a map that is not a map id`)
    const town: ModTown = { name: o.name.trim(), x: o.x as number, y: o.y as number, areaSquares: o.areaSquares as number }
    if (typeof o.map === 'string') town.map = o.map.trim()
    return town
  })
}

/** Add the mod towns to the areas as towns (count 0: no regions.lua row names them).
 *  A town whose name is already an area keeps the regions.lua one. The result keeps
 *  groupAreas's order, biggest first. */
export function addModTowns(areas: Area[], towns: ModTown[]): Area[] {
  const have = new Set(areas.map((a) => a.name))
  const added: Area[] = towns
    .filter((t) => !have.has(t.name))
    .map((t) => ({ name: t.name, kind: 'town' as const, x: t.x, y: t.y, areaSquares: t.areaSquares, count: 0, mod: true, ...(t.map !== undefined ? { m: t.map } : {}) }))
  return [...areas, ...added].sort((a, b) => b.areaSquares - a.areaSquares)
}

function main() {
  const mapFolders = args('--map')
  const input = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : DEFAULT_REGIONS_LUA
  const out = resolve(arg('--out') ?? 'packages/aurora/public/data/areas.json')

  let rows: RegionRow[]
  if (mapFolders.length > 0) {
    rows = mergeRegionRows(mapFolders)
    console.log(`merged areas from ${mapFolders.length} map folder(s) (Map= order): ${mapFolders.join(', ')}`)
  } else {
    rows = parseRegions(readFileSync(input, 'utf8'))
  }
  const townsFile = arg('--towns')
  const areas = townsFile ? addModTowns(groupAreas(rows), parseModTowns(readFileSync(townsFile, 'utf8'))) : groupAreas(rows)
  if (townsFile) console.log(`added mod towns from ${townsFile}`)

  const json = JSON.stringify(areas)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, json)

  const towns = areas.filter((a) => a.kind === 'town').length
  console.log(`wrote ${out}`)
  console.log(`${areas.length} named areas (${towns} towns, ${areas.length - towns} landmarks), ${json.length} bytes`)
}

if (process.argv[1] && process.argv[1].endsWith('extract-objects.ts')) {
  main()
}
