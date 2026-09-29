import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseStreets, simplify, clusterStreets, JOIN_DISTANCE } from './extract-streets'
import type { StreetPiece, AreaRaw } from './extract-streets'

const FIXTURE = `<streets version="1">
    <street name="Elm St" width="8">
        <points>
            <point x="100.0" y="200.0"/>
            <point x="150.0" y="210.0"/>
            <point x="200.0" y="200.0"/>
        </points>
    </street>
    <street name="Oak Ave" width="6">
        <points>
            <point x="500.5" y="300.0"/>
            <point x="600.5" y="300.0"/>
        </points>
    </street>
    <street name="Elm St" width="10">
        <points>
            <point x="900.0" y="900.0"/>
            <point x="950.0" y="950.0"/>
        </points>
    </street>
</streets>`

describe('parseStreets', () => {
  it('reads all three streets with name, width and points', () => {
    const streets = parseStreets(FIXTURE)
    expect(streets).toHaveLength(3)
    expect(streets[0]).toEqual({
      name: 'Elm St',
      width: 8,
      points: [[100, 200], [150, 210], [200, 200]],
    })
  })

  it('parses width and coordinates as numbers, half-squares included', () => {
    const streets = parseStreets(FIXTURE)
    const oak = streets[1]
    expect(oak.width).toBe(6)
    expect(oak.points[0]).toEqual([500.5, 300])
    for (const [x, y] of oak.points) {
      expect(typeof x).toBe('number')
      expect(typeof y).toBe('number')
    }
  })

  it('keeps duplicate-named streets as separate polylines rather than merging them', () => {
    const streets = parseStreets(FIXTURE)
    const named = streets.filter((s) => s.name === 'Elm St')
    expect(named).toHaveLength(2)
    expect(named[0].points).not.toEqual(named[1].points)
  })

  it('returns an empty list for a file with no streets', () => {
    expect(parseStreets('<streets version="1"></streets>')).toEqual([])
  })
})

describe('simplify', () => {
  const jogged: [number, number][] = [[100, 200], [150, 210], [200, 200]]

  it('leaves points alone at tolerance 0', () => {
    expect(simplify(jogged, 0)).toEqual(jogged)
  })

  it('leaves points alone below three points regardless of tolerance', () => {
    const two: [number, number][] = [[0, 0], [100, 100]]
    expect(simplify(two, 1000)).toEqual(two)
  })

  it('drops a middle point within tolerance of the straight line between its neighbours', () => {
    // The midpoint's perpendicular distance from (100,200)-(200,200) is 10 squares.
    expect(simplify(jogged, 20)).toEqual([[100, 200], [200, 200]])
  })

  it('keeps a middle point outside the tolerance', () => {
    expect(simplify(jogged, 5)).toEqual(jogged)
  })

  it('drops an exactly collinear point even at tolerance 0 (distance 0 <= tolerance 0)', () => {
    const collinear: [number, number][] = [[0, 0], [50, 0], [100, 0]]
    expect(simplify(collinear, 0)).toEqual([[0, 0], [100, 0]])
  })

  it('never removes a point once a real bend is present, negative tolerance included', () => {
    expect(simplify(jogged, -5)).toEqual(jogged)
  })
})

function piece(over: Partial<StreetPiece> = {}): StreetPiece {
  return { name: 'Loop Rd', width: 8, points: [[0, 0], [100, 0]], ...over }
}

const NO_AREAS: AreaRaw[] = []
const ONE_AREA: AreaRaw[] = [{ name: 'Center Town', kind: 'town', x: 0, y: 0, areaSquares: 100, count: 1 }]

describe('clusterStreets', () => {
  it('exports the measured join distance', () => {
    expect(JOIN_DISTANCE).toBe(60)
  })

  it('merges two pieces of the same name whose ends are within JOIN_DISTANCE (touching)', () => {
    const a = piece({ points: [[0, 0], [100, 0]] })
    const b = piece({ points: [[130, 0], [200, 0]] }) // 30 squares from a's end
    const out = clusterStreets([a, b], NO_AREAS)
    expect(out).toHaveLength(1)
    expect(out[0].lines).toHaveLength(2)
    expect(out[0].label).toBe('Loop Rd')
  })

  it('keeps two pieces of the same name as separate roads when they are 300+ squares apart', () => {
    const a = piece({ points: [[0, 0], [100, 0]] })
    const b = piece({ points: [[500, 0], [600, 0]] }) // 400 squares from a's end
    const out = clusterStreets([a, b], NO_AREAS)
    expect(out).toHaveLength(2)
  })

  it('merges a chain A-B-C transitively even though A and C never touch directly', () => {
    const a = piece({ points: [[0, 0], [100, 0]] })
    const b = piece({ points: [[130, 0], [230, 0]] }) // 30 from a
    const c = piece({ points: [[260, 0], [360, 0]] }) // 30 from b, 160 from a
    const out = clusterStreets([a, b, c], NO_AREAS)
    expect(out).toHaveLength(1)
    expect(out[0].lines).toHaveLength(3)
  })

  it('places center on a segment, weighted by segment length rather than a simple average or the first vertex', () => {
    // One street, two segments of very different length: [0,0]-[10,0] (length 10) and
    // [10,0]-[110,0] (length 100). The length-weighted centroid is (5*10+60*100)/110 = 55,
    // which sits on the long segment - nowhere near the first vertex (0,0) or a plain
    // unweighted average of the three points (40).
    const s = piece({ points: [[0, 0], [10, 0], [110, 0]] })
    const out = clusterStreets([s], NO_AREAS)
    expect(out[0].center).toEqual([55, 0])
    expect(out[0].center).not.toEqual(out[0].lines[0][0])
  })

  it('labels a single-cluster street with the bare name and no area suffix', () => {
    const out = clusterStreets([piece()], ONE_AREA)
    expect(out[0].label).toBe('Loop Rd')
    expect(out[0].area).toBe('Center Town')
  })

  it('tells apart two same-named clusters near different areas by area name', () => {
    const twoAreas: AreaRaw[] = [
      { name: 'North Town', kind: 'town', x: 0, y: -1000, areaSquares: 100, count: 1 },
      { name: 'South Town', kind: 'town', x: 0, y: 1000, areaSquares: 100, count: 1 },
    ]
    const north = piece({ points: [[-50, -1000], [50, -1000]] })
    const south = piece({ points: [[-50, 1000], [50, 1000]] })
    const out = clusterStreets([north, south], twoAreas)
    const labels = out.map((s) => s.label).sort()
    expect(labels).toEqual(['Loop Rd, North Town', 'Loop Rd, South Town'])
  })

  it('appends the compass side when two clusters share the nearest area on different sides of it', () => {
    const north = piece({ points: [[90, -1010], [110, -990]] }) // north of (0,0)
    const south = piece({ points: [[90, 990], [110, 1010]] }) // south of (0,0)
    const out = clusterStreets([north, south], ONE_AREA)
    const labels = out.map((s) => s.label).sort()
    expect(labels).toEqual(['Loop Rd, Center Town (north)', 'Loop Rd, Center Town (south)'])
  })

  it('falls back to a stable ordinal when area and compass side both tie (measured: Wilson Road)', () => {
    // Both pieces sit west of the one area and neither is close enough to merge with
    // the other, so name+area+compass alone cannot tell them apart - the real gap
    // measured against Wilson Road in the live streets.xml.
    const westA = piece({ points: [[-1010, 100], [-990, 100]] })
    const westB = piece({ points: [[-2010, 50], [-1990, 50]] })
    const out = clusterStreets([westA, westB], ONE_AREA)
    const labels = out.map((s) => s.label).sort()
    expect(labels).toEqual(['Loop Rd, Center Town (west)', 'Loop Rd, Center Town (west) (2)'])
  })

  it('leaves area null when areas.json has no entries, and still produces unique labels', () => {
    const a = piece({ points: [[0, 0], [100, 0]] })
    const b = piece({ points: [[500, 0], [600, 0]] })
    const out = clusterStreets([a, b], NO_AREAS)
    expect(out.every((s) => s.area === null)).toBe(true)
    expect(new Set(out.map((s) => s.label)).size).toBe(out.length)
  })
})

describe('clusterStreets against the real streets.xml', () => {
  // Absolute (the live game install) and resolved from this file's own location (not
  // cwd, which differs between `npm run aurora:test` and a root-level vitest run).
  const STREETS_XML_PATH = 'R:/Games/Steam/steamapps/common/ProjectZomboid/media/maps/Muldraugh, KY/streets.xml'
  const AREAS_JSON_PATH = fileURLToPath(new URL('../../packages/aurora/public/data/areas.json', import.meta.url))
  const haveRealFile = existsSync(STREETS_XML_PATH) && existsSync(AREAS_JSON_PATH)

  it.skipIf(!haveRealFile)('produces between 950 and 1,050 entries from the live world, all labels unique', () => {
    const pieces = parseStreets(readFileSync(STREETS_XML_PATH, 'utf8'))
    const areas = JSON.parse(readFileSync(AREAS_JSON_PATH, 'utf8')) as AreaRaw[]
    const streets = clusterStreets(pieces, areas)
    expect(streets.length).toBeGreaterThanOrEqual(950)
    expect(streets.length).toBeLessThanOrEqual(1050)
    expect(new Set(streets.map((s) => s.label)).size).toBe(streets.length)
    expect(new Set(streets.map((s) => s.id)).size).toBe(streets.length)
  })

  it.skipIf(!haveRealFile)('merges Tioga Road into exactly one entry with 6 lines', () => {
    const pieces = parseStreets(readFileSync(STREETS_XML_PATH, 'utf8'))
    const areas = JSON.parse(readFileSync(AREAS_JSON_PATH, 'utf8')) as AreaRaw[]
    const streets = clusterStreets(pieces, areas)
    const tioga = streets.filter((s) => s.name === 'Tioga Road')
    expect(tioga).toHaveLength(1)
    expect(tioga[0].lines).toHaveLength(6)
  })

  it.skipIf(!haveRealFile)('keeps Main St as 5 entries with 5 different labels', () => {
    const pieces = parseStreets(readFileSync(STREETS_XML_PATH, 'utf8'))
    const areas = JSON.parse(readFileSync(AREAS_JSON_PATH, 'utf8')) as AreaRaw[]
    const streets = clusterStreets(pieces, areas)
    const main = streets.filter((s) => s.name === 'Main St')
    expect(main).toHaveLength(5)
    expect(new Set(main.map((s) => s.label)).size).toBe(5)
  })
})
