import { describe, expect, it } from 'vitest'
import { matchStreets } from './StreetSearch'
import type { StreetFeature } from '../layers/transform'

function street(over: Partial<StreetFeature> = {}): StreetFeature {
  return { key: '0/Main St', name: 'Main St', width: 8, latlngs: [[100, 200]], ...over }
}

describe('matchStreets', () => {
  it('finds a real street by a case-insensitive substring', () => {
    const streets = [street({ key: '0/Muldraugh Rd', name: 'Muldraugh Rd' }), street({ key: '1/Oak St', name: 'Oak St' })]
    expect(matchStreets(streets, 'muldraugh')).toEqual([streets[0]])
  })

  it('returns nothing for a blank or whitespace-only query', () => {
    const streets = [street()]
    expect(matchStreets(streets, '')).toEqual([])
    expect(matchStreets(streets, '   ')).toEqual([])
  })

  it('returns nothing when no street name matches', () => {
    expect(matchStreets([street({ name: 'Oak St' })], 'zzz')).toEqual([])
  })

  it('collapses a highway into one result per distinct name, not one per segment', () => {
    const segments = [
      street({ key: '0/KY-79', name: 'KY-79' }),
      street({ key: '1/KY-79', name: 'KY-79' }),
      street({ key: '2/KY-79', name: 'KY-79' }),
    ]
    expect(matchStreets(segments, 'ky-79')).toHaveLength(1)
  })

  it('caps results at 8 even with more distinct matches', () => {
    const many = Array.from({ length: 12 }, (_, i) => street({ key: `${i}/Street ${i}`, name: `Street ${i}` }))
    expect(matchStreets(many, 'street')).toHaveLength(8)
  })
})
