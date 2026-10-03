// Owner request (2026-10-02): "find kitten road on the live map and make the line red
// just for that road." A data-driven street highlight: add one line to STREET_HIGHLIGHTS,
// keyed by the street's `id` in public/data/streets.json, and that road is drawn in the
// given colour. A pure module with no Leaflet import (build.ts cannot be imported under
// this repo's node test environment), so the style maths is asserted on directly.

export interface StreetHighlight {
  /** The road's line colour. */
  color: string
  /** A dark line drawn under the coloured one, so the road still reads on light terrain. */
  casing: string
  note?: string
}

/**
 * Contrast (WCAG relative luminance): #e53935 on the #1a0000 casing is 4.8:1, and the
 * casing is near-black, so the pair keeps at least 3:1 against both the light and the dark
 * terrain of the base map. Colour is never the only cue: a highlighted road is also drawn
 * HIGHLIGHT_EXTRA_WEIGHT px thicker than it would be, at every zoom, and its tooltip is
 * unchanged.
 */
export const STREET_HIGHLIGHTS: Record<string, StreetHighlight> = {
  'kitten-road': { color: '#e53935', casing: '#1a0000', note: 'Owner request, 2026-10-02' },
}

/** Extra visible-line weight a highlighted street gets over its normal weight, at every zoom. */
export const HIGHLIGHT_EXTRA_WEIGHT = 2
/** How much wider than the coloured line its casing is (1.5 px showing on each side). */
export const CASING_EXTRA_WEIGHT = 3

export const STREET_COLOR = '#9aa0a8'
export const STREET_OPACITY = 0.55

export function highlightFor(streetId: string): StreetHighlight | undefined {
  return Object.prototype.hasOwnProperty.call(STREET_HIGHLIGHTS, streetId) ? STREET_HIGHLIGHTS[streetId] : undefined
}

export interface StreetStyle {
  color: string
  weight: number
  opacity: number
}

/** The visible line's resting style. `baseWeight` is streetWeight() for the zoom. */
export function styleForStreet(baseWeight: number, highlight?: StreetHighlight): StreetStyle {
  if (!highlight) return { color: STREET_COLOR, weight: baseWeight, opacity: STREET_OPACITY }
  return { color: highlight.color, weight: baseWeight + HIGHLIGHT_EXTRA_WEIGHT, opacity: 1 }
}

/** The casing's style, or undefined for a plain street. */
export function casingStyle(baseWeight: number, highlight?: StreetHighlight): StreetStyle | undefined {
  if (!highlight) return undefined
  return { color: highlight.casing, weight: baseWeight + HIGHLIGHT_EXTRA_WEIGHT + CASING_EXTRA_WEIGHT, opacity: 1 }
}

/** Plain streets first, highlighted last, so a highlighted road is added (and drawn) above the rest. */
export function highlightedLast<T extends { key: string }>(features: T[]): T[] {
  return [...features.filter((f) => !highlightFor(f.key)), ...features.filter((f) => highlightFor(f.key))]
}
