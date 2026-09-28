import { describe, expect, it } from 'vitest'
import { parseView, roundView, writeView } from './url'
import type { MapView, ViewLimits } from './url'

const limits: ViewLimits = { minX: 0, maxX: 19968, minY: 0, maxY: 16128, minZoom: 0, maxZoom: 17 }
const fallback: MapView = { x: 9984, y: 8064, zoom: 10 }

describe('view state in the URL', () => {
  it('round-trips a view: write, then parse gives the same view', () => {
    const view: MapView = { x: 10770, y: 10271, zoom: 14 }
    const search = writeView('', view)
    expect(search).toBe('x=10770&y=10271&zoom=14')
    expect(parseView(`?${search}`, fallback, limits)).toEqual(view)
  })

  it('round-trips after rounding, so what is written is what is read back', () => {
    const raw: MapView = { x: 10770.4, y: 10271.6, zoom: 13.456 }
    const back = parseView(writeView('', raw), fallback, limits)
    expect(back).toEqual(roundView(raw))
    expect(back).toEqual({ x: 10770, y: 10272, zoom: 13.46 })
  })

  it('is idempotent: writing a parsed view again changes nothing', () => {
    const once = writeView('', { x: 7976, y: 11402, zoom: 12.5 })
    const twice = writeView('', parseView(once, fallback, limits))
    expect(twice).toBe(once)
  })

  it('uses the fallback for missing or garbage values', () => {
    expect(parseView('', fallback, limits)).toEqual(fallback)
    expect(parseView('?x=abc&y=&zoom=NaN', fallback, limits)).toEqual(fallback)
    expect(parseView('?x=Infinity', fallback, limits).x).toBe(fallback.x)
  })

  it('keeps a valid value next to an invalid one', () => {
    expect(parseView('?x=5739&y=oops', fallback, limits)).toEqual({ x: 5739, y: 8064, zoom: 10 })
  })

  it('clamps values that fall outside the world and the zoom range', () => {
    expect(parseView('?x=-50&y=99999&zoom=40', fallback, limits)).toEqual({ x: 0, y: 16128, zoom: 17 })
  })

  it('preserves other query parameters when writing', () => {
    const out = new URLSearchParams(writeView('?floor=2&x=1', { x: 5, y: 6, zoom: 7 }))
    expect(out.get('floor')).toBe('2')
    expect(out.get('x')).toBe('5')
    expect(out.get('y')).toBe('6')
    expect(out.get('zoom')).toBe('7')
  })
})
