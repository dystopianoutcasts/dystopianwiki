import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CASING_EXTRA_WEIGHT,
  HIGHLIGHT_EXTRA_WEIGHT,
  STREET_COLOR,
  STREET_HIGHLIGHTS,
  STREET_OPACITY,
  casingStyle,
  highlightFor,
  highlightedLast,
  styleForStreet,
} from './streetHighlights'
import { streetWeight } from './transform'

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('street highlights', () => {
  it('highlights Kitten Road, and only a listed id', () => {
    expect(highlightFor('kitten-road')).toEqual(STREET_HIGHLIGHTS['kitten-road'])
    expect(highlightFor('kitten-road')?.color).toBe('#e53935')
    expect(highlightFor('main-street')).toBeUndefined()
    expect(highlightFor('toString')).toBeUndefined()
  })

  it('kitten-road is a real street id in streets.json', () => {
    const streets = JSON.parse(readFileSync(fileURLToPath(new URL('../../public/data/streets.json', import.meta.url)), 'utf8')) as { id: string; name: string }[]
    expect(streets.find((s) => s.id === 'kitten-road')?.name).toBe('Kitten Road')
  })

  it('a highlighted street takes the colour and is exactly 2 px wider at every zoom', () => {
    const h = highlightFor('kitten-road')
    for (let zoom = 10; zoom <= 16; zoom++) {
      const base = streetWeight(zoom, 10, 16, 5)
      const style = styleForStreet(base, h)
      expect(style.color).toBe('#e53935')
      expect(style.weight).toBeCloseTo(base + 2, 9)
      expect(style.weight - styleForStreet(base).weight).toBeCloseTo(HIGHLIGHT_EXTRA_WEIGHT, 9)
    }
  })

  it('a plain street keeps the grey line and has no casing', () => {
    expect(styleForStreet(4)).toEqual({ color: STREET_COLOR, weight: 4, opacity: STREET_OPACITY })
    expect(casingStyle(4)).toBeUndefined()
  })

  it('the casing is the dark colour and wider than the coloured line', () => {
    const h = highlightFor('kitten-road')
    const line = styleForStreet(4, h)
    const casing = casingStyle(4, h)
    expect(casing?.color).toBe('#1a0000')
    expect(casing!.weight).toBe(line.weight + CASING_EXTRA_WEIGHT)
  })

  it('the red keeps at least 3:1 against its casing', () => {
    expect(contrast('#e53935', '#1a0000')).toBeGreaterThanOrEqual(3)
  })

  it('highlightedLast keeps the order within each group and moves the highlighted street to the end', () => {
    const ordered = highlightedLast([{ key: 'a' }, { key: 'kitten-road' }, { key: 'b' }])
    expect(ordered.map((f) => f.key)).toEqual(['a', 'b', 'kitten-road'])
  })
})

// build.ts imports Leaflet and cannot load under the node test environment (see
// build.test.ts), so the layer wiring is asserted as source text.
describe('buildStreets applies the highlights', () => {
  const src = readFileSync(fileURLToPath(new URL('./build.ts', import.meta.url)), 'utf8')
  const fn = src.slice(src.indexOf('export function buildStreets'), src.indexOf('const ROAD_STYLE'))

  it('iterates highlightedLast(features) so highlighted roads are added after plain ones', () => {
    expect(fn).toMatch(/for \(const f of highlightedLast\(features\)\)/)
  })

  it('draws the visible line from styleForStreet and the casing from casingStyle, casing added first', () => {
    expect(fn).toMatch(/styleForStreet\(weight, highlight\)/)
    expect(fn).toMatch(/L\.polyline\(f\.latlngs, \{ \.\.\.rest, interactive: false \}\)/)
    expect(fn.indexOf('{ ...casing, interactive: false }')).toBeGreaterThan(-1)
    expect(fn.indexOf('{ ...casing, interactive: false }')).toBeLessThan(fn.indexOf('group.addLayer(visible)'))
  })

  it('the tooltip still shows the street label for a highlighted road', () => {
    expect(fn).toMatch(/hit\.bindTooltip\(escapeHtml\(f\.label\)/)
  })
})
