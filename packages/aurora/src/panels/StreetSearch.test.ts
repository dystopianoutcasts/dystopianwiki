import { describe, expect, it } from 'vitest'
import { matchStreets } from './StreetSearch'
import type { StreetFeature } from '../layers/transform'

function street(over: Partial<StreetFeature> = {}): StreetFeature {
  return { key: '0/Main St', name: 'Main St', label: 'Main St', width: 8, center: [200, 100], latlngs: [[[100, 200]]], ...over }
}

describe('matchStreets', () => {
  it('finds a real street by a case-insensitive substring of its label', () => {
    const streets = [street({ key: 'muldraugh-rd', name: 'Muldraugh Rd', label: 'Muldraugh Rd' }), street({ key: 'oak-st', name: 'Oak St', label: 'Oak St' })]
    expect(matchStreets(streets, 'muldraugh')).toEqual([streets[0]])
  })

  it('returns nothing for a blank or whitespace-only query', () => {
    const streets = [street()]
    expect(matchStreets(streets, '')).toEqual([])
    expect(matchStreets(streets, '   ')).toEqual([])
  })

  it('returns nothing when no street label matches', () => {
    expect(matchStreets([street({ label: 'Oak St' })], 'zzz')).toEqual([])
  })

  it('a merged road (T42) is one result, not one per source piece', () => {
    // extract-streets.ts has already merged Tioga Road's 6 touching pieces into one
    // Street entry before this file ever sees it, so there is only one feature to match.
    const tioga = street({ key: 'tioga-road', name: 'Tioga Road', label: 'Tioga Road', latlngs: [[[1, 1]], [[2, 2]], [[3, 3]], [[4, 4]], [[5, 5]], [[6, 6]]] })
    expect(matchStreets([tioga], 'tioga')).toHaveLength(1)
  })

  it('same-named roads in different areas (T42) are separate results with different labels', () => {
    const main1 = street({ key: 'main-st-westpoint', name: 'Main St', label: 'Main St, WestPoint' })
    const main2 = street({ key: 'main-st-riverside', name: 'Main St', label: 'Main St, Riverside' })
    const results = matchStreets([main1, main2], 'main st')
    expect(results).toHaveLength(2)
    expect(results.map((s) => s.label).sort()).toEqual(['Main St, Riverside', 'Main St, WestPoint'])
  })

  it('caps results at 8 even with more matches', () => {
    const many = Array.from({ length: 12 }, (_, i) => street({ key: `street-${i}`, name: `Street ${i}`, label: `Street ${i}` }))
    expect(matchStreets(many, 'street')).toHaveLength(8)
  })

  it('orders labels that start with the query before labels that only contain it, then alphabetically within each group', () => {
    const streets = [
      street({ key: 'a', name: 'Old Main St', label: 'Old Main St' }),
      street({ key: 'b', name: 'Main St East', label: 'Main St East' }),
      street({ key: 'c', name: 'Main St', label: 'Main Ave' }),
    ]
    const results = matchStreets(streets, 'main')
    expect(results.map((s) => s.label)).toEqual(['Main Ave', 'Main St East', 'Old Main St'])
  })
})
