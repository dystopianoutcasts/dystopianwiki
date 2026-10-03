// Extract the in-game map's own vector look (roads, buildings, forest, water) from
// worldmap.xml + worldmap-forest.xml into map/data/worldmap.json, so the map can offer a
// "World map" layer that reads like the one in game.
//
//   npx tsx scripts/tiles/extract-worldmap.ts [<worldmap.xml path>] [--forest <path>]
//     [--out <file>] [--tolerance <squares>] [--forest-tolerance <squares>]
//
// Coordinates: worldmap.xml addresses points as <cell x y> + a point local to that cell,
// where the LOCAL range runs 0..300 (not B42's 256) - this is the game's legacy per-cell
// chunking, unrelated to pzmap2dzi's newer 256-square tiling. Verified here (T22 Do step 1)
// rather than assumed: converting every one of 102,800 sampled points as
// (cellX*300 + localX, cellY*300 + localY) and checking against tiles.json's own cellRects
// (T04's proven populated-cell geometry, in 256-square B42 cells) landed 0 of them outside -
// which would not hold if the legacy 300-square chunking used a different underlying square
// size than B42's tile pyramid. It does not: only the CELL CONTAINER size changed between
// B41 and B42 (300 squares to 256), not the square unit itself.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { simplify, readOwnedCells, mergeByOwnership, mapTag, tagItems, toSpecs } from './extract-streets'
import type { MapSpec } from './extract-streets'

const CELL_SQUARES = 300

const DEFAULT_WORLDMAP_XML =
  'R:/Games/Steam/steamapps/common/ProjectZomboid/media/maps/Muldraugh, KY/worldmap.xml'

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

export type RoadType = 'primary' | 'secondary' | 'tertiary' | 'trail' | 'railway'
export type BuildingType = string
// T50: `m` is the id of the map that owns the shape, absent for vanilla, always last.
export interface RoadFeature { type: RoadType; closed: boolean; points: [number, number][]; m?: string }
export interface BuildingFeature { type: BuildingType; points: [number, number][]; m?: string }
export interface WaterFeature { points: [number, number][]; m?: string }
export interface ForestFeature { points: [number, number][]; m?: string }
export interface WorldMap {
  roads: RoadFeature[]
  buildings: BuildingFeature[]
  water: WaterFeature[]
  forest: ForestFeature[]
}

const CELL_RE = /<cell x="(-?\d+)" y="(-?\d+)">([\s\S]*?)<\/cell>/g
const FEATURE_RE = /<feature>([\s\S]*?)<\/feature>/g
const GEOMETRY_RE = /<geometry type="(Polygon|LineString|Point)">([\s\S]*?)<\/geometry>/
const POINT_RE = /<point x="(-?[\d.]+)" y="(-?[\d.]+)"\/>/g
const PROPERTY_RE = /<property name="([^"]*)" value="([^"]*)"\/>/g

export interface RawFeature {
  geometryType: 'Polygon' | 'LineString' | 'Point'
  points: [number, number][]
  properties: Record<string, string>
  /** T50: the id of the map this feature came from; absent for vanilla. */
  m?: string
}

/** `{ m }` for a tagged feature, nothing for vanilla: spread LAST so key order is fixed. */
function tag(m: string | undefined): { m?: string } {
  return m !== undefined ? { m } : {}
}

/** Parse one worldmap-shaped XML file (worldmap.xml or worldmap-forest.xml). Regex, not a
 *  full XML parser: the schema is flat and fixed (cell > feature > geometry + properties). */
export function parseWorldmap(xml: string): RawFeature[] {
  const out: RawFeature[] = []
  for (const cellMatch of xml.matchAll(CELL_RE)) {
    const cellX = Number(cellMatch[1])
    const cellY = Number(cellMatch[2])
    const cellBody = cellMatch[3]
    for (const featureMatch of cellBody.matchAll(FEATURE_RE)) {
      const featureBody = featureMatch[1]
      const geomMatch = GEOMETRY_RE.exec(featureBody)
      if (!geomMatch) continue
      const geometryType = geomMatch[1] as 'Polygon' | 'LineString' | 'Point'
      const points: [number, number][] = []
      for (const p of geomMatch[2].matchAll(POINT_RE)) {
        points.push([cellX * CELL_SQUARES + Number(p[1]), cellY * CELL_SQUARES + Number(p[2])])
      }
      if (points.length === 0) continue
      const properties: Record<string, string> = {}
      for (const prop of featureBody.matchAll(PROPERTY_RE)) properties[prop[1]] = prop[2]
      out.push({ geometryType, points, properties })
    }
  }
  return out
}

/** Roads and buildings from worldmap.xml; water is the same file's `water` property. */
export function classifyMain(features: RawFeature[]): { roads: RoadFeature[]; buildings: BuildingFeature[]; water: WaterFeature[] } {
  const roads: RoadFeature[] = []
  const buildings: BuildingFeature[] = []
  const water: WaterFeature[] = []
  for (const f of features) {
    if (f.geometryType === 'Point') continue // place labels etc.: out of Part B's scope
    const closed = f.geometryType === 'Polygon'
    if (f.properties.highway) {
      roads.push({ type: f.properties.highway as RoadType, closed, points: f.points, ...tag(f.m) })
    } else if (f.properties.railway) {
      roads.push({ type: 'railway', closed, points: f.points, ...tag(f.m) })
    } else if (f.properties.building) {
      buildings.push({ type: f.properties.building, points: f.points, ...tag(f.m) })
    } else if (f.properties.water) {
      water.push({ points: f.points, ...tag(f.m) })
    }
  }
  return { roads, buildings, water }
}

/** Bounding-box area in square-squares. Cheap and rotation-agnostic; exact polygon area
 *  is not worth computing just to decide whether a patch is background-layer-visible. */
function bboxArea(points: [number, number][]): number {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys))
}

/**
 * worldmap-forest.xml: every feature is `natural=forest`, so the type is not repeated.
 * `minArea` drops patches too small to read as forest at any zoom this layer is meant for
 * (a background cover indicator, not a per-tree map) - half of the 105,764 raw features
 * are under 50 square-squares, roughly a 7x7-square fleck.
 */
export function classifyForest(features: RawFeature[], minArea = 0): ForestFeature[] {
  return features
    .filter((f) => f.geometryType === 'Polygon' && bboxArea(f.points) >= minArea)
    .map((f) => ({ points: f.points, ...tag(f.m) }))
}

/**
 * Douglas-Peucker on a ring: close it first (append the start point) so the algorithm can
 * see the closing edge, then drop the duplicate it leaves behind. Open lines pass straight
 * through to `simplify`, which already handles tolerance <= 0 and under-3-point lists
 * correctly on its own (extract-streets.ts). Fewer than 3 points is never a real ring
 * (nothing left to close) - closing one anyway would make the appended start point BE the
 * whole ring's `last`, degenerating the middle point to a point-to-point distance from
 * itself and losing a real point at a large tolerance, so that case is left untouched too.
 */
export function simplifyRing(points: [number, number][], closed: boolean, tolerance: number): [number, number][] {
  if (!closed || points.length < 3) return simplify(points, tolerance)
  const ring = simplify([...points, points[0]], tolerance)
  return ring.slice(0, -1)
}

// --- T45 Part EXTRACT: merging several map folders, Map= order (see extract-streets.ts
// for the shared cell-ownership rule this reuses rather than duplicates) ------------
// worldmap.xml and worldmap-forest.xml are each optional per map folder (a mod map need
// not ship either - the sd_cc trial map has forest but no worldmap.xml at all).

/** Read one map folder's worldmap.xml raw features, or none when it does not ship one. */
export function readMapFolderWorldmapMain(mapFolder: string): RawFeature[] {
  try {
    return parseWorldmap(readFileSync(join(mapFolder, 'worldmap.xml'), 'utf8'))
  } catch (e) {
    console.warn(`no worldmap.xml in ${mapFolder} (${e instanceof Error ? e.message : String(e)}); it contributes no roads, buildings or water`)
    return []
  }
}

/** Read one map folder's worldmap-forest.xml raw features, or none when it does not
 *  ship one. */
export function readMapFolderForest(mapFolder: string): RawFeature[] {
  try {
    return parseWorldmap(readFileSync(join(mapFolder, 'worldmap-forest.xml'), 'utf8'))
  } catch (e) {
    console.warn(`no worldmap-forest.xml in ${mapFolder} (${e instanceof Error ? e.message : String(e)}); it contributes no forest`)
    return []
  }
}

/** Merge worldmap.xml and worldmap-forest.xml raw features from several map folders, in
 *  Map= order. Classification (classifyMain/classifyForest) runs once on the merged
 *  lists afterward, same as the single-map path. */
export function mergeWorldmapRaw(maps: (string | MapSpec)[]): { main: RawFeature[]; forest: RawFeature[] } {
  const specs = toSpecs(maps)
  const cellSets = specs.map((s) => readOwnedCells(s.folder))
  // T50: each feature tagged with its map (vanilla untagged) before the merge.
  const main = mergeByOwnership(specs.map((s) => tagItems(readMapFolderWorldmapMain(s.folder), mapTag(s))), cellSets, (f) => f.points)
  const forest = mergeByOwnership(specs.map((s) => tagItems(readMapFolderForest(s.folder), mapTag(s))), cellSets, (f) => f.points)
  return { main, forest }
}

function main() {
  const mapFolders = args('--map')
  const input = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : DEFAULT_WORLDMAP_XML
  const forestInput = arg('--forest') ?? join(dirname(input), 'worldmap-forest.xml')
  const out = resolve(arg('--out') ?? 'packages/aurora/public/data/worldmap.json')
  const tolerance = Number(arg('--tolerance') ?? '0')
  const forestTolerance = Number(arg('--forest-tolerance') ?? '0')
  const forestMinArea = Number(arg('--forest-min-area') ?? '0')

  let mainRaw: RawFeature[]
  let forestRawAll: RawFeature[]
  if (mapFolders.length > 0) {
    const merged = mergeWorldmapRaw(mapFolders)
    mainRaw = merged.main
    forestRawAll = merged.forest
    console.log(`merged worldmap from ${mapFolders.length} map folder(s) (Map= order): ${mapFolders.join(', ')}`)
  } else {
    mainRaw = parseWorldmap(readFileSync(input, 'utf8'))
    forestRawAll = parseWorldmap(readFileSync(forestInput, 'utf8'))
  }
  const { roads, buildings, water } = classifyMain(mainRaw)
  const forestRaw = classifyForest(forestRawAll, forestMinArea)

  const simplified: WorldMap = {
    roads: roads.map((r) => ({ ...r, points: simplifyRing(r.points, r.closed, tolerance) })),
    buildings: buildings.map((b) => ({ ...b, points: simplifyRing(b.points, true, tolerance) })),
    water: water.map((w) => ({ points: simplifyRing(w.points, true, tolerance), ...tag(w.m) })),
    forest: forestRaw.map((f) => ({ points: simplifyRing(f.points, true, forestTolerance), ...tag(f.m) })),
  }

  const sumPoints = (lists: { points: [number, number][] }[][]) =>
    lists.reduce((n, list) => n + list.reduce((m, f) => m + f.points.length, 0), 0)
  const beforePoints = sumPoints([roads, buildings, water, forestRaw])
  const afterPoints = sumPoints([simplified.roads, simplified.buildings, simplified.water, simplified.forest])

  const json = JSON.stringify(simplified)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, json)

  console.log(`wrote ${out}`)
  console.log(
    `roads ${simplified.roads.length}, buildings ${simplified.buildings.length}, ` +
    `water ${simplified.water.length}, forest ${simplified.forest.length}`,
  )
  console.log(`points: ${beforePoints} before simplification, ${afterPoints} after`)
  console.log(`${json.length} bytes (${(json.length / 1024 / 1024).toFixed(2)} MiB)`)
}

if (process.argv[1] && process.argv[1].endsWith('extract-worldmap.ts')) {
  main()
}
