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
import { dirname, resolve } from 'node:path'

const DEFAULT_REGIONS_LUA =
  'R:/Games/Steam/steamapps/common/ProjectZomboid/media/maps/Muldraugh, KY/regions.lua'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

export interface RegionRow {
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
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
  const byName = new Map<string, RegionRow[]>()
  for (const r of rows) {
    if (!r.name || !NAMED_TYPES[r.type]) continue
    const list = byName.get(r.name) ?? []
    list.push(r)
    byName.set(r.name, list)
  }
  const out: Area[] = []
  for (const [name, list] of byName) {
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
    })
  }
  return out.sort((a, b) => b.areaSquares - a.areaSquares)
}

function main() {
  const input = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : DEFAULT_REGIONS_LUA
  const out = resolve(arg('--out') ?? 'packages/aurora/public/data/areas.json')

  const lua = readFileSync(input, 'utf8')
  const areas = groupAreas(parseRegions(lua))

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
