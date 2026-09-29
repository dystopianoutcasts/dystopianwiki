import { describe, expect, it } from 'vitest'
import { groupAreas, parseRegions } from './extract-objects'

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
