// Extract named streets from streets.xml into map/data/streets.json, so the map can
// label and search real street names instead of drawing an unnamed road layer.
//
//   npx tsx scripts/tiles/extract-streets.ts [<streets.xml path>] [--out <file>] [--areas <file>] [--tolerance <squares>]
//
// Coordinates in streets.xml are already B42 world squares - WorldEd's street editor
// "follow[s] the project cell geometry and world origin" (B42_Mapping/02-world-and-cells.md,
// [VERIFIED]) - the same space the tile pyramid uses (T04), so no projection or B41
// conversion is needed. Verified here against the render's own populated cells (T22 Do
// step 1): every extracted point falls inside one of tiles.json's cellRects, and none
// would if the coordinate spaces did not agree.
//
// T42 (2026-09-29): the source XML cuts a single real road into many same-named
// <street> pieces (Tioga Road is 6, KY-79 is 15). One entry per piece meant only the
// first was ever searchable or hoverable, and a search result landed on that piece's
// first vertex - an end of the road, not a point a visitor would recognise. This file
// now groups pieces by exact name, merges the ones that are really one road (touching
// pieces), and tells apart the ones that are not (the same name reused in a different
// town) by the nearest named area. See `clusterStreets` below for the measured facts
// this is built on.
//
// T50 (2026-10-02): every merged feature carries `m`, the map id (describe-mod-maps.ts
// `mapId`) of the map that owns it, so the live map can drop the features of a map the
// server stopped running. Vanilla ("Muldraugh, KY" -> muldraugh-ky) is never tagged, so a
// vanilla-only run writes the same bytes as before. `--map` takes an optional id after
// the last colon (`--map "<folder>:<id>"`); without one the id is mapId(folder name).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { mapId } from './describe-mod-maps'

const DEFAULT_STREETS_XML =
  'R:/Games/Steam/steamapps/common/ProjectZomboid/media/maps/Muldraugh, KY/streets.xml'
const DEFAULT_AREAS_JSON = 'packages/aurora/public/data/areas.json'

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

/** One `<street>` tag as parsed from the source XML - the source cuts a real road into
 * several of these; `clusterStreets` below is what turns them back into one road. */
export interface StreetPiece {
  name: string
  width: number
  points: [number, number][]
  /** T50: the id of the map this piece came from; absent for vanilla. */
  m?: string
}

/** Shape of one entry in packages/aurora/public/data/areas.json (extract-objects.ts). */
export interface AreaRaw {
  name: string
  kind: 'town' | 'landmark'
  x: number
  y: number
  areaSquares: number
  count: number
}

/** One road, after grouping same-named pieces into connected clusters. */
export interface Street {
  /** Stable: slug of label. */
  id: string
  /** As in the source. */
  name: string
  /** What search shows; unique across the file. */
  label: string
  /** Nearest area name, null only if areas.json is unavailable. */
  area: string | null
  /** The widest piece's width. */
  width: number
  /** Every piece, source order kept inside a piece. */
  lines: [number, number][][]
  /** A point ON the road, nearest to the length-weighted centroid of its segments. */
  center: [number, number]
  /** T50: the map that owns this road; absent for vanilla. Always written LAST, so an
   *  untagged entry is byte-identical to the pre-T50 shape. */
  m?: string
}

const STREET_RE = /<street\s+name="([^"]*)"\s+width="([\d.]+)"\s*>([\s\S]*?)<\/street>/g
const POINT_RE = /<point\s+x="(-?[\d.]+)"\s+y="(-?[\d.]+)"\s*\/>/g

/** Parse streets.xml. Regex, not a full XML parser: the schema is flat and fixed (see the header). */
export function parseStreets(xml: string): StreetPiece[] {
  const streets: StreetPiece[] = []
  for (const m of xml.matchAll(STREET_RE)) {
    const [, name, width, body] = m
    const points: [number, number][] = []
    for (const p of body.matchAll(POINT_RE)) {
      points.push([Number(p[1]), Number(p[2])])
    }
    if (points.length > 0) streets.push({ name, width: Number(width), points })
  }
  return streets
}

/**
 * Perpendicular-distance simplification (Douglas-Peucker). A point is dropped only when
 * its distance from the line between its neighbours is at most `tolerance` squares, so
 * tolerance 0 or below only ever drops an exactly-redundant (already collinear) point -
 * there is no separate early-out for a non-positive tolerance because none is needed: a
 * distance is never negative, so `maxDist <= tolerance` is already always false there.
 * Likewise no separate under-3-points early-out: `reduce` below already returns a
 * shorter list unchanged on its own first line, so a second copy of that check here
 * would just be the same guard twice.
 */
export function simplify(points: [number, number][], tolerance: number): [number, number][] {
  function reduce(pts: [number, number][]): [number, number][] {
    if (pts.length < 3) return pts
    let maxDist = -1
    let index = 0
    const first = pts[0]
    const last = pts[pts.length - 1]
    for (let i = 1; i < pts.length - 1; i++) {
      const d = pointSegDist(pts[i], first, last)
      if (d > maxDist) {
        maxDist = d
        index = i
      }
    }
    if (maxDist <= tolerance) return [first, last]
    const left = reduce(pts.slice(0, index + 1))
    const right = reduce(pts.slice(index))
    return [...left.slice(0, -1), ...right]
  }

  return reduce(points)
}

/** Perpendicular distance from `p` to the segment `a`-`b`, clamped to the segment's ends. */
export function pointSegDist(p: [number, number], a: [number, number], b: [number, number]): number {
  const [px, py] = p
  const [ax, ay] = a
  const [bx, by] = b
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** The point on the segment `a`-`b` nearest to `p`, and the distance to it. */
export function projectOntoSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number],
): { point: [number, number]; dist: number } {
  const [px, py] = p
  const [ax, ay] = a
  const [bx, by] = b
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return { point: a, dist: Math.hypot(px - ax, py - ay) }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  const point: [number, number] = [ax + t * dx, ay + t * dy]
  return { point, dist: Math.hypot(px - point[0], py - point[1]) }
}

/** Smallest distance from any vertex of `vertices` to any segment of `line`. A one-point
 * line (degenerate, should not occur in real data) is treated as a single segment of
 * length zero, which `pointSegDist` already handles as a plain point distance. */
export function minVertexToLineDist(vertices: [number, number][], line: [number, number][]): number {
  let min = Infinity
  if (line.length === 1) {
    for (const v of vertices) min = Math.min(min, Math.hypot(v[0] - line[0][0], v[1] - line[0][1]))
    return min
  }
  for (const v of vertices) {
    for (let i = 0; i < line.length - 1; i++) {
      min = Math.min(min, pointSegDist(v, line[i], line[i + 1]))
    }
  }
  return min
}

/**
 * Two pieces are connected when the smallest distance between any vertex of one and any
 * segment of the other is at most `joinDistance` - checked both ways round since "one"
 * and "the other" are interchangeable.
 */
export function piecesConnected(a: StreetPiece, b: StreetPiece, joinDistance: number): boolean {
  return (
    minVertexToLineDist(a.points, b.points) <= joinDistance ||
    minVertexToLineDist(b.points, a.points) <= joinDistance
  )
}

/**
 * Union-find over one name's pieces, so a chain A-B-C where A and C do not touch but
 * both touch B is still one cluster (connection is transitive).
 */
export function clusterPiecesByProximity(pieces: StreetPiece[], joinDistance: number): StreetPiece[][] {
  const n = pieces.length
  const parent = Array.from({ length: n }, (_, i) => i)
  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  function union(a: number, b: number): void {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[ra] = rb
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (piecesConnected(pieces[i], pieces[j], joinDistance)) union(i, j)
    }
  }
  const groups = new Map<number, StreetPiece[]>()
  for (let i = 0; i < n; i++) {
    const r = find(i)
    if (!groups.has(r)) groups.set(r, [])
    groups.get(r)!.push(pieces[i])
  }
  return [...groups.values()]
}

function segmentLength(a: [number, number], b: [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1])
}

/** Centroid of every segment in `lines`, weighted by each segment's own length, so a
 * cluster with one long piece and one short piece is not pulled toward the short one. */
export function weightedCentroid(lines: [number, number][][]): [number, number] {
  let sx = 0
  let sy = 0
  let total = 0
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const len = segmentLength(line[i], line[i + 1])
      if (len === 0) continue
      sx += ((line[i][0] + line[i + 1][0]) / 2) * len
      sy += ((line[i][1] + line[i + 1][1]) / 2) * len
      total += len
    }
  }
  if (total > 0) return [sx / total, sy / total]
  // Degenerate: every segment has zero length (single-point lines). Fall back to a
  // plain average of every point so `center` is still defined.
  let n = 0
  let ax = 0
  let ay = 0
  for (const line of lines) {
    for (const p of line) {
      ax += p[0]
      ay += p[1]
      n++
    }
  }
  return n > 0 ? [ax / n, ay / n] : [0, 0]
}

/** The point across every segment of `lines` nearest to `target` - always ON a segment,
 * never a bounding-box centre (which can land off a curved road). */
export function nearestPointOnLines(lines: [number, number][][], target: [number, number]): [number, number] {
  let best: [number, number] | null = null
  let bestDist = Infinity
  for (const line of lines) {
    if (line.length === 1) {
      const d = Math.hypot(line[0][0] - target[0], line[0][1] - target[1])
      if (d < bestDist) {
        bestDist = d
        best = line[0]
      }
      continue
    }
    for (let i = 0; i < line.length - 1; i++) {
      const { point, dist } = projectOntoSegment(target, line[i], line[i + 1])
      if (dist < bestDist) {
        bestDist = dist
        best = point
      }
    }
  }
  return best ?? target
}

export function nearestArea(point: [number, number], areas: AreaRaw[]): AreaRaw | null {
  if (areas.length === 0) return null
  let best = areas[0]
  let bestDist = Infinity
  for (const a of areas) {
    const d = Math.hypot(a.x - point[0], a.y - point[1])
    if (d < bestDist) {
      bestDist = d
      best = a
    }
  }
  return best
}

/** North/south wins when the cluster is further from the area vertically than
 * horizontally; the coordinate space is the same one the tile pyramid and pixel maths
 * use throughout this codebase (map/coords.ts): x increases east, y increases south. */
export function compassSide(point: [number, number], area: AreaRaw): 'north' | 'south' | 'east' | 'west' {
  const dx = point[0] - area.x
  const dy = point[1] - area.y
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'north' : 'south'
  return dx > 0 ? 'east' : 'west'
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Group pieces by exact name, split each group's pieces into connected clusters
 * (`JOIN_DISTANCE` apart or closer counts as touching), and build one `Street` per
 * cluster. Measured 2026-09-29 against the live streets.xml: 1,098 pieces, 959 distinct
 * names; 74 names have more than one piece. Of those, 46 have every piece within 50
 * squares of its nearest same-named neighbour (one real road, cut up by the source data
 * - Tioga Road is 6 touching pieces, KY-79 is 15) and 28 have pieces 300 squares or more
 * apart, 22 of them more than 3,000 (the same name reused in a different town - Main St
 * has 5, West St's pieces are 15,639 squares apart). No name has a gap between 50 and
 * 300 squares, so JOIN_DISTANCE = 60 sits in the middle of that gap with room on both
 * sides for the source data to drift without flipping a road from one bucket to the
 * other.
 */
export const JOIN_DISTANCE = 60

export function clusterStreets(pieces: StreetPiece[], areas: AreaRaw[], joinDistance: number = JOIN_DISTANCE): Street[] {
  const byName = new Map<string, StreetPiece[]>()
  for (const p of pieces) {
    if (!byName.has(p.name)) byName.set(p.name, [])
    byName.get(p.name)!.push(p)
  }

  const out: Street[] = []
  for (const [name, group] of byName) {
    // T50: pieces of one name from different maps never join, so every road belongs to
    // exactly one map and is dropped with it. Same-named roads of two maps are then told
    // apart below like any other same-named roads. One map (vanilla alone): one partition,
    // the same clusters in the same order as before.
    const byMap = new Map<string | undefined, StreetPiece[]>()
    for (const p of group) {
      const list = byMap.get(p.m)
      if (list) list.push(p)
      else byMap.set(p.m, [p])
    }
    const clusters = [...byMap.values()].flatMap((pieces) => clusterPiecesByProximity(pieces, joinDistance))
    const built = clusters.map((cluster) => {
      const lines = cluster.map((c) => c.points)
      const width = Math.max(...cluster.map((c) => c.width))
      const centroid = weightedCentroid(lines)
      const center = nearestPointOnLines(lines, centroid)
      const area = nearestArea(center, areas)
      return { name, width, lines, center, area, m: cluster[0].m }
    })
    const tag = (m: string | undefined) => (m !== undefined ? { m } : {})

    if (built.length === 1) {
      out.push({ id: slug(name), name, label: name, area: built[0].area?.name ?? null, width: built[0].width, lines: built[0].lines, center: built[0].center, ...tag(built[0].m) })
      continue
    }

    // More than one real road shares this name: tell them apart by area, then by
    // compass side if two clusters land nearest the same area.
    const baseLabels = built.map((b) => (b.area ? `${name}, ${b.area.name}` : name))
    const counts = new Map<string, number>()
    for (const l of baseLabels) counts.set(l, (counts.get(l) ?? 0) + 1)
    const labels = baseLabels.map((l, i) => {
      if ((counts.get(l) ?? 0) <= 1) return l
      const b = built[i]
      return b.area ? `${l} (${compassSide(b.center, b.area)})` : l
    })

    // Real data has at least one name where even that is not enough (measured
    // 2026-09-29: "Wilson Road" is two clusters roughly 1,200 squares apart, both
    // nearest Riverside, both on its west side - neither area nor compass side was
    // designed to reach this far past a town's own footprint). Not a redesign of the
    // rule above, just its last-resort completion: a stable ordinal, the same pattern
    // T38's findablePlayers uses for two players sharing a display name. The first
    // occurrence of a still-tied label keeps it as written; the second and later get
    // " (2)", " (3)" in cluster order.
    const finalCounts = new Map<string, number>()
    for (const l of labels) finalCounts.set(l, (finalCounts.get(l) ?? 0) + 1)
    const seenOrdinal = new Map<string, number>()
    const disambiguated = labels.map((l) => {
      if ((finalCounts.get(l) ?? 0) <= 1) return l
      const n = (seenOrdinal.get(l) ?? 0) + 1
      seenOrdinal.set(l, n)
      return n === 1 ? l : `${l} (${n})`
    })

    const seen = new Set<string>()
    for (const l of disambiguated) {
      if (seen.has(l)) {
        // Truly unreachable given the ordinal fallback above (it always produces a
        // fresh string), kept as the loud failure the task specifies for the case it
        // is meant to cover: a bug that broke uniqueness some other way.
        throw new Error(`extract-streets: cannot make a unique label for "${name}" - "${l}" is used by more than one cluster`)
      }
      seen.add(l)
    }
    built.forEach((b, i) => {
      out.push({ id: slug(disambiguated[i]), name, label: disambiguated[i], area: b.area?.name ?? null, width: b.width, lines: b.lines, center: b.center, ...tag(b.m) })
    })
  }

  const seenLabels = new Set<string>()
  for (const s of out) {
    if (seenLabels.has(s.label)) {
      throw new Error(`extract-streets: duplicate label "${s.label}" across different street names`)
    }
    seenLabels.add(s.label)
  }
  return out
}

// --- T45 Part EXTRACT: merging several map folders, Map= order (first listed wins a
// cell) -----------------------------------------------------------------------------
// A B42 map folder's own cells are named by its `<x>_<y>.lotheader` files (256-square
// cells - a different space from streets.xml/worldmap.xml/regions.lua coordinates,
// which are already plain world squares; see extract-worldmap.ts's own 300-square
// per-cell addressing for the file format this is NOT). A feature (street piece, area
// rectangle, world-map shape) is kept only from the map that owns the cell at least one
// of its points falls in - the game's own rule is that the FIRST map listed for a cell
// wins, so a later map's same-named piece inside a cell an earlier map already claims
// never gets a chance to claim it too, and a vanilla piece entirely inside a cell a mod
// replaced is dropped. extract-worldmap.ts and extract-objects.ts import these exports
// rather than duplicating them.

export const B42_CELL_SQUARES = 256

/** Which B42 cell (256 world squares) a point falls in. */
export function cellOf(point: [number, number], cellSquares: number = B42_CELL_SQUARES): [number, number] {
  return [Math.floor(point[0] / cellSquares), Math.floor(point[1] / cellSquares)]
}

const LOTHEADER_RE = /^(-?\d+)_(-?\d+)\.lotheader$/

/** Every B42 cell a map folder owns, read from its own `<x>_<y>.lotheader` file names
 *  (parsed from the name, not the file's contents). A folder that cannot be listed
 *  (missing, not a directory) owns no cells rather than failing the whole run - the
 *  caller decides whether that is fatal. */
export function readOwnedCells(mapFolder: string): Set<string> {
  const owned = new Set<string>()
  let entries: string[]
  try {
    entries = readdirSync(mapFolder)
  } catch (e) {
    console.warn(`could not list ${mapFolder} for .lotheader cell files (${e instanceof Error ? e.message : String(e)}); treating it as owning no cells`)
    return owned
  }
  for (const entry of entries) {
    const m = LOTHEADER_RE.exec(entry)
    if (m) owned.add(`${m[1]},${m[2]}`)
  }
  return owned
}

/** Cell ownership across several maps' cell sets, in Map= order: a cell goes to the
 *  first set (map) that claims it, exactly like the game's own Map= precedence. */
export function buildCellOwnership(cellSetsInOrder: Set<string>[]): Map<string, number> {
  const owner = new Map<string, number>()
  cellSetsInOrder.forEach((cells, index) => {
    for (const cell of cells) {
      if (!owner.has(cell)) owner.set(cell, index)
    }
  })
  return owner
}

/** True when at least one of `points` lies in a cell `ownership` assigns to `mapIndex` -
 *  the merge rule for a feature that may cross a cell boundary: kept if any of its
 *  points is in a cell its own map owns, dropped only when every point's cell belongs
 *  to some other (earlier-listed) map. */
export function ownsAnyPoint(points: [number, number][], mapIndex: number, ownership: Map<string, number>): boolean {
  for (const p of points) {
    const [cx, cy] = cellOf(p)
    if (ownership.get(`${cx},${cy}`) === mapIndex) return true
  }
  return false
}

/** Merge one parsed list per map (already in Map= order) into a single list, keeping an
 *  item only when `pointsOf` finds it a point in a cell its own map owns. Shared by all
 *  three extractors: `pointsOf` is the only per-shape difference (a street piece or
 *  world-map shape already has `.points`; an area rectangle does not, so
 *  extract-objects.ts passes its four corners instead). */
export function mergeByOwnership<T>(
  perMapItems: T[][],
  cellSetsInOrder: Set<string>[],
  pointsOf: (item: T) => [number, number][],
): T[] {
  const ownership = buildCellOwnership(cellSetsInOrder)
  const merged: T[] = []
  perMapItems.forEach((items, index) => {
    for (const item of items) {
      if (ownsAnyPoint(pointsOf(item), index, ownership)) merged.push(item)
    }
  })
  return merged
}

// --- T50: which map a feature came from ------------------------------------------------

/** The vanilla map's id. Its features are never tagged: the live map always draws them. */
export const VANILLA_MAP_ID = mapId('Muldraugh, KY')

/** One `--map` value: the map folder, and the id its features are tagged with. */
export interface MapSpec {
  folder: string
  id: string
}

/**
 * Parse `--map "<folder>"` or `--map "<folder>:<id>"`. The id is what follows the LAST
 * colon when that colon is not a drive letter's ("R:/...") and what follows it looks like
 * an id (lower case letters, digits, "_" and "-"); otherwise the whole value is the folder
 * and the id is mapId(folder name), the same id the tile overlay gets.
 */
export function parseMapArg(value: string): MapSpec {
  const i = value.lastIndexOf(':')
  if (i > 1) {
    const rest = value.slice(i + 1)
    if (/^[a-z0-9_-]*$/.test(rest)) {
      const folder = value.slice(0, i)
      return { folder, id: rest || mapId(basename(folder)) }
    }
  }
  return { folder: value, id: mapId(basename(value)) }
}

/** The `m` a map's features carry: its id, or none for vanilla. */
export function mapTag(spec: MapSpec): string | undefined {
  return spec.id === VANILLA_MAP_ID ? undefined : spec.id
}

/** `items` with `m` added last on each, or `items` unchanged for an untagged (vanilla) map. */
export function tagItems<T extends object>(items: T[], m: string | undefined): (T & { m?: string })[] {
  return m === undefined ? items : items.map((item) => ({ ...item, m }))
}

/** `--map` values (strings, parsed) or ready specs, as one list of specs. */
export function toSpecs(maps: (string | MapSpec)[]): MapSpec[] {
  return maps.map((m) => (typeof m === 'string' ? parseMapArg(m) : m))
}

/** Read one map folder's streets.xml, or no streets at all when it does not ship one
 *  (a mod map need not add streets). */
export function readMapFolderStreets(mapFolder: string): StreetPiece[] {
  try {
    return parseStreets(readFileSync(join(mapFolder, 'streets.xml'), 'utf8'))
  } catch (e) {
    console.warn(`no streets.xml in ${mapFolder} (${e instanceof Error ? e.message : String(e)}); it contributes no streets`)
    return []
  }
}

/** Merge street pieces from several map folders, in Map= order, each piece tagged with
 *  its map (T50; vanilla untagged). */
export function mergeStreetPieces(maps: (string | MapSpec)[]): StreetPiece[] {
  const specs = toSpecs(maps)
  const cellSets = specs.map((s) => readOwnedCells(s.folder))
  const perMap = specs.map((s) => tagItems(readMapFolderStreets(s.folder), mapTag(s)))
  return mergeByOwnership(perMap, cellSets, (p) => p.points)
}

function main() {
  const mapFolders = args('--map')
  const input = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : DEFAULT_STREETS_XML
  const out = resolve(arg('--out') ?? 'packages/aurora/public/data/streets.json')
  const areasPath = resolve(arg('--areas') ?? DEFAULT_AREAS_JSON)
  const tolerance = Number(arg('--tolerance') ?? '0')

  let pieces: StreetPiece[]
  if (mapFolders.length > 0) {
    pieces = mergeStreetPieces(mapFolders)
    console.log(`merged streets from ${mapFolders.length} map folder(s) (Map= order): ${mapFolders.join(', ')}`)
  } else {
    pieces = parseStreets(readFileSync(input, 'utf8'))
  }
  if (tolerance > 0) {
    pieces = pieces.map((s) => ({ ...s, points: simplify(s.points, tolerance) }))
  }

  let areas: AreaRaw[] = []
  try {
    areas = JSON.parse(readFileSync(areasPath, 'utf8')) as AreaRaw[]
  } catch (e) {
    console.warn(`could not read ${areasPath} (${e instanceof Error ? e.message : String(e)}); every street's area will be null`)
  }

  const distinctNamesBefore = new Set(pieces.map((p) => p.name)).size
  const streets = clusterStreets(pieces, areas)

  const namesWithMultiplePieces = [...new Set(pieces.map((p) => p.name))].filter(
    (name) => pieces.filter((p) => p.name === name).length > 1,
  )
  const namesMerged = namesWithMultiplePieces.filter(
    (name) => streets.filter((s) => s.name === name).length === 1,
  )
  const namesDisambiguated = namesWithMultiplePieces.filter(
    (name) => streets.filter((s) => s.name === name).length > 1,
  )
  const compassLabels = streets.filter((s) => /\((north|south|east|west)\)$/.test(s.label)).map((s) => s.label)

  console.log(`entries before: ${pieces.length} (${distinctNamesBefore} distinct names)`)
  console.log(`entries after: ${streets.length}`)
  console.log(`names merged (touching pieces -> one road): ${namesMerged.length} - ${namesMerged.join(', ')}`)
  console.log(`names disambiguated (same name, different roads): ${namesDisambiguated.length} - ${namesDisambiguated.join(', ')}`)
  console.log(`labels needing a compass side: ${compassLabels.length}${compassLabels.length ? ' - ' + compassLabels.join(', ') : ''}`)

  // A parser break shows up as a count far from the known one, so the run refuses to
  // write outside the expected range. 950-1050 is vanilla's (T42 measured 1,005). A
  // merge with mod maps adds their streets, so that run names its own range with
  // --expect-range <min>,<max> (T45).
  const [expectMin, expectMax] = (arg('--expect-range') ?? '950,1050').split(',').map(Number)
  if (!Number.isFinite(expectMin) || !Number.isFinite(expectMax) || expectMin > expectMax) {
    console.error(`--expect-range must be <min>,<max>; got '${arg('--expect-range')}'`)
    process.exitCode = 1
    return
  }
  if (streets.length < expectMin || streets.length > expectMax) {
    console.error(`entries after (${streets.length}) is outside the expected ${expectMin}-${expectMax} range; stopping without writing ${out}`)
    process.exitCode = 1
    return
  }

  const json = JSON.stringify(streets)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, json)
  console.log(`wrote ${out} (${json.length} bytes)`)
}

if (process.argv[1] && process.argv[1].endsWith('extract-streets.ts')) {
  main()
}
