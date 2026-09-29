import { describe, expect, it } from 'vitest'
import { parseStreets, simplify } from './extract-streets'

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
