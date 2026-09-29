import { describe, expect, it } from 'vitest'
import { classifyForest, classifyMain, parseWorldmap, simplifyRing } from './extract-worldmap'

const MAIN_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<world version="1.0">
 <cell x="1" y="2">
  <feature>
   <geometry type="Polygon">
    <coordinates>
     <point x="10" y="10"/>
     <point x="20" y="10"/>
     <point x="20" y="20"/>
     <point x="10" y="20"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="highway" value="secondary"/>
   </properties>
  </feature>
  <feature>
   <geometry type="LineString">
    <coordinates>
     <point x="1" y="1"/>
     <point x="2" y="2"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="highway" value="trail"/>
   </properties>
  </feature>
  <feature>
   <geometry type="Polygon">
    <coordinates>
     <point x="30" y="30"/>
     <point x="40" y="30"/>
     <point x="40" y="40"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="railway" value="*"/>
   </properties>
  </feature>
  <feature>
   <geometry type="Polygon">
    <coordinates>
     <point x="50" y="50"/>
     <point x="60" y="50"/>
     <point x="60" y="60"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="building" value="Residential"/>
   </properties>
  </feature>
  <feature>
   <geometry type="Polygon">
    <coordinates>
     <point x="70" y="70"/>
     <point x="80" y="70"/>
     <point x="80" y="80"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="water" value="river"/>
   </properties>
  </feature>
  <feature>
   <geometry type="Point">
    <coordinates>
     <point x="90" y="90"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="place" value="town"/>
    <property name="name_en" value="Example"/>
   </properties>
  </feature>
 </cell>
</world>`

const FOREST_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<world version="1.0">
 <cell x="0" y="0">
  <feature>
   <geometry type="Polygon">
    <coordinates>
     <point x="0" y="0"/>
     <point x="3" y="0"/>
     <point x="3" y="3"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="natural" value="forest"/>
   </properties>
  </feature>
  <feature>
   <geometry type="Polygon">
    <coordinates>
     <point x="10" y="10"/>
     <point x="110" y="10"/>
     <point x="110" y="110"/>
     <point x="10" y="110"/>
    </coordinates>
   </geometry>
   <properties>
    <property name="natural" value="forest"/>
   </properties>
  </feature>
 </cell>
</world>`

describe('parseWorldmap', () => {
  it('converts cell + local point into a global square via cellIndex * 300 + local', () => {
    const [first] = parseWorldmap(MAIN_FIXTURE)
    expect(first.points[0]).toEqual([1 * 300 + 10, 2 * 300 + 10])
  })

  it('reads every feature kind: Polygon, LineString and Point', () => {
    const features = parseWorldmap(MAIN_FIXTURE)
    expect(features).toHaveLength(6)
    expect(features.map((f) => f.geometryType)).toEqual([
      'Polygon', 'LineString', 'Polygon', 'Polygon', 'Polygon', 'Point',
    ])
  })

  it('reads every property on a feature, not just the first', () => {
    const town = parseWorldmap(MAIN_FIXTURE).find((f) => f.geometryType === 'Point')
    expect(town?.properties).toEqual({ place: 'town', name_en: 'Example' })
  })
})

describe('classifyMain', () => {
  const { roads, buildings, water } = classifyMain(parseWorldmap(MAIN_FIXTURE))

  it('routes highway features to roads, closed for Polygon and open for LineString', () => {
    expect(roads).toHaveLength(3)
    expect(roads[0]).toMatchObject({ type: 'secondary', closed: true })
    expect(roads[1]).toMatchObject({ type: 'trail', closed: false })
  })

  it('folds railway into roads under a fixed type, translating the placeholder value', () => {
    expect(roads[2]).toMatchObject({ type: 'railway', closed: true })
  })

  it('routes building features with their subtype kept', () => {
    expect(buildings).toEqual([{ type: 'Residential', points: buildings[0].points }])
  })

  it('routes water features, dropping the always-"river" type field', () => {
    expect(water).toEqual([{ points: water[0].points }])
  })

  it('drops Point features (place labels): out of Part B scope, handled elsewhere', () => {
    const total = roads.length + buildings.length + water.length
    expect(total).toBe(5) // 6 parsed features minus the one Point
  })
})

describe('classifyForest', () => {
  it('keeps every feature with no minimum area', () => {
    const forest = classifyForest(parseWorldmap(FOREST_FIXTURE))
    expect(forest).toHaveLength(2)
  })

  it('drops a bounding-box area below the minimum, keeps one above it', () => {
    const forest = classifyForest(parseWorldmap(FOREST_FIXTURE), 50)
    expect(forest).toHaveLength(1)
    expect(forest[0].points[0]).toEqual([10, 10])
  })

  it('never carries a type field: it would repeat the same value 105,764 times in the real file', () => {
    const [f] = classifyForest(parseWorldmap(FOREST_FIXTURE))
    expect(Object.keys(f)).toEqual(['points'])
  })
})

describe('simplifyRing', () => {
  // A clean square, plus a point exactly on the CLOSING edge (0,100) back to (0,0) - only
  // visible as redundant once the ring is actually closed.
  const square: [number, number][] = [[0, 0], [100, 0], [100, 100], [0, 100], [0, 50]]

  it('drops a point that is only collinear once the ring wraps back to its start', () => {
    expect(simplifyRing(square, true, 0)).toEqual([[0, 0], [100, 0], [100, 100], [0, 100]])
  })

  it('does not leave a duplicated closing point in the output', () => {
    const out = simplifyRing(square, true, 0)
    expect(out[0]).not.toEqual(out[out.length - 1])
  })

  it('an open line never sees the wrap-around: the same point survives', () => {
    expect(simplifyRing(square, false, 0)).toEqual(square)
  })

  it('fewer than 3 points pass through unchanged either way', () => {
    const two: [number, number][] = [[0, 0], [5, 5]]
    expect(simplifyRing(two, true, 100)).toEqual(two)
  })
})
