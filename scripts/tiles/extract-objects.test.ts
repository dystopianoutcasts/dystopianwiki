import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { groupAreas, parseRegions, mergeRegionRows, parseModTowns, addModTowns } from './extract-objects'

const FIXTURE = `regions = {
  { name = "Jefferson", type = "Region", x = 12400, y = 4500, z = 0, width = 600, height = 600, },
  { name = "Jefferson", type = "Region", x = 13000, y = 4500, z = 0, width =300, height = 600, },
  { name = "", type = "Region", x = 0, y = 0, z = 0, width = 100, height = 100, },
  { name = "KnoxBank", type = "BuildingName", x = 10623, y = 9685, z = 0, width = 9, height = 20 },
  { name = "ParkingSpotA", type = "ParkingStall", x = 100, y = 100, z = 0, width = 3, height = 3 },
}`

describe('parseRegions', () => {
  it('reads name, type, x, y, width, height for every row, blank names included', () => {
    const rows = parseRegions(FIXTURE)
    expect(rows).toHaveLength(5)
    expect(rows[0]).toEqual({ name: 'Jefferson', type: 'Region', x: 12400, y: 4500, width: 600, height: 600 })
    expect(rows[2].name).toBe('')
  })

  it('parses a row with no space after the equals sign (the real file has both)', () => {
    const rows = parseRegions(FIXTURE)
    expect(rows[1].width).toBe(300)
  })

  it('returns an empty list for a file with no rows', () => {
    expect(parseRegions('regions = {\n}')).toEqual([])
  })
})

describe('groupAreas', () => {
  it('merges same-named Region rows into one town, weighted by tile area', () => {
    const areas = groupAreas(parseRegions(FIXTURE))
    const jefferson = areas.find((a) => a.name === 'Jefferson')
    expect(jefferson).toBeDefined()
    expect(jefferson?.kind).toBe('town')
    expect(jefferson?.count).toBe(2)
    // Both tiles are the same 600x600 (well, 300x600) area weight, both centred at y=4800;
    // the x centroid sits between the two tile centres (12700, 13150), weighted by area.
    expect(jefferson?.y).toBe(4800)
    expect(jefferson?.x).toBeGreaterThan(12700)
    expect(jefferson?.x).toBeLessThan(13150)
    expect(jefferson?.areaSquares).toBe(600 * 600 + 300 * 600)
  })

  it('keeps a single BuildingName row as a landmark, not a town', () => {
    const areas = groupAreas(parseRegions(FIXTURE))
    const bank = areas.find((a) => a.name === 'KnoxBank')
    expect(bank).toEqual({ name: 'KnoxBank', kind: 'landmark', x: Math.round(10623 + 9 / 2), y: 9685 + 10, areaSquares: 9 * 20, count: 1 })
  })

  it('drops rows with a blank name and rows whose type is not a named-area type', () => {
    const areas = groupAreas(parseRegions(FIXTURE))
    expect(areas.some((a) => a.name === '')).toBe(false)
    expect(areas.some((a) => a.name === 'ParkingSpotA')).toBe(false)
    expect(areas).toHaveLength(2)
  })

  it('sorts biggest area first', () => {
    const areas = groupAreas(parseRegions(FIXTURE))
    expect(areas[0].name).toBe('Jefferson')
    expect(areas[0].areaSquares).toBeGreaterThan(areas[1].areaSquares)
  })

  it('returns an empty list when nothing is named', () => {
    expect(groupAreas(parseRegions('regions = {\n  { name = "", type = "Region", x = 0, y = 0, z = 0, width = 1, height = 1 },\n}'))).toEqual([])
  })
})

describe('mergeRegionRows (T45 Part EXTRACT: real map folders on disk, first in Map= order wins a cell)', () => {
  function makeMapFolder(cells: string[], regionsLua: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'aurora-t45-objects-'))
    for (const cell of cells) writeFileSync(join(dir, `${cell}.lotheader`), '')
    writeFileSync(join(dir, 'regions.lua'), regionsLua)
    return dir
  }

  it('drops the vanilla area in a cell a mod replaced, keeps the mod area there, keeps a vanilla area outside it', () => {
    // B42 cells are 256 squares: (0,0) covers 0-255, (1,0) covers 256-511.
    const modDir = makeMapFolder(
      ['0_0'],
      'regions = {\n  { name = "ModTown", type = "Region", x = 20, y = 20, z = 0, width = 10, height = 10, },\n}',
    )
    const vanillaDir = makeMapFolder(
      ['0_0', '1_0'],
      'regions = {\n' +
        '  { name = "OldTown", type = "Region", x = 10, y = 10, z = 0, width = 20, height = 20, },\n' +
        '  { name = "FarTown", type = "Region", x = 300, y = 10, z = 0, width = 20, height = 20, },\n' +
        '}',
    )
    try {
      const merged = mergeRegionRows([modDir, vanillaDir])
      expect(merged.map((r) => r.name).sort()).toEqual(['FarTown', 'ModTown'])
    } finally {
      rmSync(modDir, { recursive: true, force: true })
      rmSync(vanillaDir, { recursive: true, force: true })
    }
  })

  it('contributes no areas from a map folder that has no regions.lua', () => {
    const dir = mkdtempSync(join(tmpdir(), 'aurora-t45-objects-'))
    writeFileSync(join(dir, '0_0.lotheader'), '')
    try {
      expect(mergeRegionRows([dir])).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('T45: mod towns from the committed towns file', () => {
  const areas = [
    { name: 'Muldraugh', kind: 'town' as const, x: 10500, y: 10250, areaSquares: 21000000, count: 31 },
    { name: 'Gas Station', kind: 'landmark' as const, x: 1, y: 1, areaSquares: 100, count: 1 },
  ]

  it('adds each town as a town with count 0, biggest first', () => {
    const towns = parseModTowns(JSON.stringify({ towns: [{ name: 'Raven Creek', x: 5376, y: 16128, areaSquares: 7602176 }] }))
    const out = addModTowns(areas, towns)
    expect(out.map((a) => a.name)).toEqual(['Muldraugh', 'Raven Creek', 'Gas Station'])
    expect(out[1]).toEqual({ name: 'Raven Creek', kind: 'town', x: 5376, y: 16128, areaSquares: 7602176, count: 0, mod: true })
  })

  it('keeps the regions.lua area when a town has the same name', () => {
    const towns = parseModTowns(JSON.stringify({ towns: [{ name: 'Muldraugh', x: 0, y: 0, areaSquares: 1 }] }))
    const out = addModTowns(areas, towns)
    expect(out.filter((a) => a.name === 'Muldraugh')).toEqual([areas[0]])
  })

  it('refuses a malformed towns file', () => {
    expect(() => parseModTowns('{}')).toThrow()
    expect(() => parseModTowns(JSON.stringify({ towns: [{ name: '', x: 1, y: 1, areaSquares: 1 }] }))).toThrow()
    expect(() => parseModTowns(JSON.stringify({ towns: [{ name: 'A', x: '1', y: 1, areaSquares: 1 }] }))).toThrow()
  })

  it('the committed towns file parses and names six towns', () => {
    const file = fileURLToPath(new URL('./mod-maps/server-towns.json', import.meta.url))
    const towns = parseModTowns(readFileSync(file, 'utf8'))
    expect(towns).toHaveLength(6)
  })
})

describe('T50: areas name the map that owns them', () => {
  it('a mod town carries its file entry\'s map as m, written last', () => {
    const towns = parseModTowns(JSON.stringify({ towns: [{ map: 'raven-creek-b42', name: 'Raven Creek', x: 5376, y: 16128, areaSquares: 7602176 }] }))
    const [town] = addModTowns([], towns)
    expect(town).toEqual({ name: 'Raven Creek', kind: 'town', x: 5376, y: 16128, areaSquares: 7602176, count: 0, mod: true, m: 'raven-creek-b42' })
    expect(Object.keys(town).at(-1)).toBe('m')
  })

  it('every town in the committed towns file carries a map id', () => {
    const file = fileURLToPath(new URL('./mod-maps/server-towns.json', import.meta.url))
    const towns = parseModTowns(readFileSync(file, 'utf8'))
    // addModTowns sorts biggest first, so compare as sorted lists.
    expect(addModTowns([], towns).map((a) => a.m).sort()).toEqual(towns.map((t) => t.map).sort())
    expect(towns.every((t) => typeof t.map === 'string' && t.map.length > 0)).toBe(true)
  })

  it('refuses a towns entry whose map is not a string', () => {
    expect(() => parseModTowns(JSON.stringify({ towns: [{ map: 7, name: 'A', x: 1, y: 1, areaSquares: 1 }] }))).toThrow()
  })

  it('mergeRegionRows + groupAreas: the mod area carries m, the vanilla area has no m key', () => {
    const make = (cells: string[], lua: string) => {
      const dir = mkdtempSync(join(tmpdir(), 'aurora-t50-objects-'))
      for (const cell of cells) writeFileSync(join(dir, `${cell}.lotheader`), '')
      writeFileSync(join(dir, 'regions.lua'), lua)
      return dir
    }
    const modDir = make(['0_0'], 'regions = {\n  { name = "ModTown", type = "Region", x = 20, y = 20, z = 0, width = 10, height = 10, },\n}')
    const vanillaDir = make(['1_0'], 'regions = {\n  { name = "FarTown", type = "Region", x = 300, y = 10, z = 0, width = 20, height = 20, },\n}')
    try {
      const areas = groupAreas(mergeRegionRows([`${modDir}:havenfall`, `${vanillaDir}:muldraugh-ky`]))
      expect(areas.find((a) => a.name === 'ModTown')!.m).toBe('havenfall')
      expect('m' in areas.find((a) => a.name === 'FarTown')!).toBe(false)
    } finally {
      rmSync(modDir, { recursive: true, force: true })
      rmSync(vanillaDir, { recursive: true, force: true })
    }
  })

  it('one name in two maps is two areas, one per map (vanilla alone: unchanged grouping)', () => {
    const rows = [
      { name: 'Twin', type: 'Region', x: 0, y: 0, width: 10, height: 10 },
      { name: 'Twin', type: 'Region', x: 100, y: 0, width: 10, height: 10, m: 'havenfall' },
    ]
    expect(groupAreas(rows).map((a) => a.m)).toEqual([undefined, 'havenfall'])
    expect(groupAreas(rows.map((r) => ({ name: r.name, type: r.type, x: r.x, y: r.y, width: r.width, height: r.height })))).toHaveLength(1)
  })

  it('a vanilla-only grouping writes no m key anywhere', () => {
    expect(JSON.stringify(groupAreas(parseRegions(FIXTURE)))).not.toContain('"m"')
  })
})
