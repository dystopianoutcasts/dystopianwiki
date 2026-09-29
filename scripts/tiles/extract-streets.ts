// Extract named streets from streets.xml into map/data/streets.json, so the map can
// label and search real street names instead of drawing an unnamed road layer.
//
//   npx tsx scripts/tiles/extract-streets.ts [<streets.xml path>] [--out <file>] [--tolerance <squares>]
//
// Coordinates in streets.xml are already B42 world squares - WorldEd's street editor
// "follow[s] the project cell geometry and world origin" (B42_Mapping/02-world-and-cells.md,
// [VERIFIED]) - the same space the tile pyramid uses (T04), so no projection or B41
// conversion is needed. Verified here against the render's own populated cells (T22 Do
// step 1): every extracted point falls inside one of tiles.json's cellRects, and none
// would if the coordinate spaces did not agree.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const DEFAULT_STREETS_XML =
  'R:/Games/Steam/steamapps/common/ProjectZomboid/media/maps/Muldraugh, KY/streets.xml'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

export interface Street {
  name: string
  width: number
  points: [number, number][]
}

const STREET_RE = /<street\s+name="([^"]*)"\s+width="([\d.]+)"\s*>([\s\S]*?)<\/street>/g
const POINT_RE = /<point\s+x="(-?[\d.]+)"\s+y="(-?[\d.]+)"\s*\/>/g

/** Parse streets.xml. Regex, not a full XML parser: the schema is flat and fixed (see the header). */
export function parseStreets(xml: string): Street[] {
  const streets: Street[] = []
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
  function distToSegment(p: [number, number], a: [number, number], b: [number, number]): number {
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

  function reduce(pts: [number, number][]): [number, number][] {
    if (pts.length < 3) return pts
    let maxDist = -1
    let index = 0
    const first = pts[0]
    const last = pts[pts.length - 1]
    for (let i = 1; i < pts.length - 1; i++) {
      const d = distToSegment(pts[i], first, last)
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

function main() {
  const input = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : DEFAULT_STREETS_XML
  const out = resolve(arg('--out') ?? 'packages/aurora/public/data/streets.json')
  const tolerance = Number(arg('--tolerance') ?? '0')

  const xml = readFileSync(input, 'utf8')
  let streets = parseStreets(xml)
  if (tolerance > 0) {
    streets = streets.map((s) => ({ ...s, points: simplify(s.points, tolerance) }))
  }

  const json = JSON.stringify(streets)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, json)

  const pointCount = streets.reduce((n, s) => n + s.points.length, 0)
  console.log(`wrote ${out}`)
  console.log(`${streets.length} streets, ${pointCount} points, ${json.length} bytes`)
}

if (process.argv[1] && process.argv[1].endsWith('extract-streets.ts')) {
  main()
}
