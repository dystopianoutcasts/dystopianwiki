import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  parseStreets,
  simplify,
  clusterStreets,
  JOIN_DISTANCE,
  cellOf,
  buildCellOwnership,
  ownsAnyPoint,
  mergeByOwnership,
  mergeStreetPieces,
  parseMapArg,
  mapTag,
  VANILLA_MAP_ID,
} from './extract-streets'
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

describe('cellOf (T45 Part EXTRACT: B42 256-square cell ownership)', () => {
  it('maps a world-square point to its 256-square cell', () => {
    expect(cellOf([0, 0])).toEqual([0, 0])
    expect(cellOf([255, 255])).toEqual([0, 0])
    expect(cellOf([256, 511])).toEqual([1, 1])
    expect(cellOf([300, 10])).toEqual([1, 0])
  })
})

describe('buildCellOwnership', () => {
  it('gives a cell to the first set in the list that claims it (Map= order)', () => {
    const owner = buildCellOwnership([new Set(['0,0']), new Set(['0,0', '1,0'])])
    expect(owner.get('0,0')).toBe(0)
    expect(owner.get('1,0')).toBe(1)
  })

  it('leaves a cell no map claims out of the ownership map entirely', () => {
    const owner = buildCellOwnership([new Set(['0,0'])])
    expect(owner.has('9,9')).toBe(false)
  })
})

describe('ownsAnyPoint', () => {
  const ownership = buildCellOwnership([new Set(['0,0']), new Set(['0,0', '1,0'])])

  it('is true when at least one point falls in a cell owned by that map index', () => {
    expect(ownsAnyPoint([[1000, 1000], [10, 10]], 0, ownership)).toBe(true)
  })

  it('is false when every point falls in a cell some other map owns', () => {
    expect(ownsAnyPoint([[10, 10]], 1, ownership)).toBe(false) // cell 0,0 belongs to map 0, not map 1
  })
})

describe('mergeByOwnership (generic merge, shared by all three T45 extractors)', () => {
  it('keeps an item only from the map that owns a cell one of its points falls in - a mod street replaces a vanilla one in a shared cell, a vanilla street outside it survives', () => {
    const modPiece = piece({ name: 'New Elm St', points: [[20, 20], [60, 20]] }) // B42 cell 0,0
    const vanillaSameCell = piece({ name: 'Old Elm St', points: [[10, 10], [50, 10]] }) // B42 cell 0,0
    const vanillaOtherCell = piece({ name: 'Far Oak Ave', points: [[300, 10], [350, 10]] }) // B42 cell 1,0
    // Map= order: mod first, vanilla second - mod's lone cell (0,0) beats vanilla's claim on it.
    const cellSets = [new Set(['0,0']), new Set(['0,0', '1,0'])]
    const merged = mergeByOwnership([[modPiece], [vanillaSameCell, vanillaOtherCell]], cellSets, (p) => p.points)
    expect(merged.map((p) => p.name).sort()).toEqual(['Far Oak Ave', 'New Elm St'])
  })
})

describe('mergeStreetPieces (T45 Part EXTRACT: real map folders on disk, first in Map= order wins a cell)', () => {
  function makeMapFolder(cells: string[], streetsXml: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'aurora-t45-streets-'))
    for (const cell of cells) writeFileSync(join(dir, `${cell}.lotheader`), '')
    writeFileSync(join(dir, 'streets.xml'), streetsXml)
    return dir
  }

  it('drops the vanilla street in a cell a mod replaced, keeps the mod street there, keeps a vanilla street outside it', () => {
    const modDir = makeMapFolder(
      ['0_0'],
      '<streets version="1"><street name="New Elm St" width="8"><points><point x="20.0" y="20.0"/><point x="60.0" y="20.0"/></points></street></streets>',
    )
    const vanillaDir = makeMapFolder(
      ['0_0', '1_0'],
      '<streets version="1">' +
        '<street name="Old Elm St" width="8"><points><point x="10.0" y="10.0"/><point x="50.0" y="10.0"/></points></street>' +
        '<street name="Far Oak Ave" width="8"><points><point x="300.0" y="10.0"/><point x="350.0" y="10.0"/></points></street>' +
        '</streets>',
    )
    try {
      const merged = mergeStreetPieces([modDir, vanillaDir])
      expect(merged.map((p) => p.name).sort()).toEqual(['Far Oak Ave', 'New Elm St'])
    } finally {
      rmSync(modDir, { recursive: true, force: true })
      rmSync(vanillaDir, { recursive: true, force: true })
    }
  })

  it('contributes no streets from a map folder that has no streets.xml', () => {
    const dir = mkdtempSync(join(tmpdir(), 'aurora-t45-streets-'))
    writeFileSync(join(dir, '0_0.lotheader'), '')
    try {
      expect(mergeStreetPieces([dir])).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
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

// ---- T50: every merged feature names the map that owns it ---------------------------

describe('T50: --map ids and tags', () => {
  it('parseMapArg: the id after the last colon, else mapId of the folder name; a drive letter is not an id', () => {
    expect(parseMapArg('R:/maps/Muldraugh, KY')).toEqual({ folder: 'R:/maps/Muldraugh, KY', id: 'muldraugh-ky' })
    expect(parseMapArg('R:/maps/Raven Creek B42:rc')).toEqual({ folder: 'R:/maps/Raven Creek B42', id: 'rc' })
    expect(parseMapArg('C:\\maps\\Constown, KY')).toEqual({ folder: 'C:\\maps\\Constown, KY', id: 'constown-ky' })
    expect(parseMapArg('maps/New Hartburg, KY:')).toEqual({ folder: 'maps/New Hartburg, KY', id: 'new-hartburg-ky' })
  })

  it('vanilla is never tagged; any other map is tagged with its id', () => {
    expect(VANILLA_MAP_ID).toBe('muldraugh-ky')
    expect(mapTag({ folder: 'x', id: 'muldraugh-ky' })).toBeUndefined()
    expect(mapTag({ folder: 'x', id: 'raven-creek-b42' })).toBe('raven-creek-b42')
  })

  function makeMapFolder(cells: string[], streetsXml: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'aurora-t50-streets-'))
    for (const cell of cells) writeFileSync(join(dir, `${cell}.lotheader`), '')
    writeFileSync(join(dir, 'streets.xml'), streetsXml)
    return dir
  }

  it('mergeStreetPieces: the mod-owned piece carries m, the vanilla piece has no m key at all', () => {
    const modDir = makeMapFolder(
      ['0_0'],
      '<streets version="1"><street name="New Elm St" width="8"><points><point x="20.0" y="20.0"/><point x="60.0" y="20.0"/></points></street></streets>',
    )
    const vanillaDir = makeMapFolder(
      ['0_0', '1_0'],
      '<streets version="1"><street name="Far Oak Ave" width="8"><points><point x="300.0" y="10.0"/><point x="350.0" y="10.0"/></points></street></streets>',
    )
    try {
      const merged = mergeStreetPieces([`${modDir}:raven-creek-b42`, { folder: vanillaDir, id: 'muldraugh-ky' }])
      const mod = merged.find((p) => p.name === 'New Elm St')!
      const vanilla = merged.find((p) => p.name === 'Far Oak Ave')!
      expect(mod.m).toBe('raven-creek-b42')
      expect('m' in vanilla).toBe(false)
      const streets = clusterStreets(merged, [])
      expect(streets.find((s) => s.name === 'New Elm St')!.m).toBe('raven-creek-b42')
      expect(Object.keys(streets.find((s) => s.name === 'Far Oak Ave')!)).toEqual(['id', 'name', 'label', 'area', 'width', 'lines', 'center'])
    } finally {
      rmSync(modDir, { recursive: true, force: true })
      rmSync(vanillaDir, { recursive: true, force: true })
    }
  })

  it('clusterStreets: touching same-named pieces of two maps stay two roads, each with its own map, labels kept unique', () => {
    const areas: AreaRaw[] = [
      { name: 'Westtown', kind: 'town', x: 0, y: 0, areaSquares: 1, count: 1 },
      { name: 'Easttown', kind: 'town', x: 200, y: 0, areaSquares: 1, count: 1 },
    ]
    const pieces: StreetPiece[] = [
      { name: 'Bridge St', width: 8, points: [[0, 0], [100, 0]] },
      { name: 'Bridge St', width: 8, points: [[100, 0], [200, 0]], m: 'raven-creek-b42' },
    ]
    const out = clusterStreets(pieces, areas)
    expect(out).toHaveLength(2)
    expect(out.map((s) => s.m)).toEqual([undefined, 'raven-creek-b42'])
    expect(new Set(out.map((s) => s.label)).size).toBe(2)
    // Untagged, the same two pieces are one road, as before T50.
    expect(clusterStreets(pieces.map((p) => ({ name: p.name, width: p.width, points: p.points })), areas)).toHaveLength(1)
  })

  it('a vanilla-only clustering writes no m key anywhere', () => {
    const json = JSON.stringify(clusterStreets(parseStreets(FIXTURE), []))
    expect(json).not.toContain('"m"')
  })
})
