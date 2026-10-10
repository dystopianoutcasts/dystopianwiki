/**
 * The site's drawn icon set (KB16): line icons on a 24 x 24 grid, stroked with the text colour.
 *
 * Section and category icons are named by the short words the generated navigation carries
 * (`icon` in _section.json and _category.json, contract C2); a few more names serve the UI.
 * Each icon is a list of SVG path data strings, drawn for this site. Plain data, no React, so
 * tests can read it.
 */

/** A circle as path data (two half arcs). */
function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`
}

/** Short teeth around a centre, for the gear and cog. */
function teeth(count: number, offsetDeg: number, inner: number, outer: number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const a = ((offsetDeg + (360 / count) * i) * Math.PI) / 180
    const p = (r: number) => `${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`
    out.push(`M${p(inner)}L${p(outer)}`)
  }
  return out
}

export const ICON_SHAPES = {
  book: ['M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z', 'M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z'],
  box: ['M21 8l-9-5-9 5v8l9 5 9-5z', 'M3 8l9 5 9-5', 'M12 13v8'],
  gear: [circle(12, 12, 3), circle(12, 12, 6.5), ...teeth(8, 0, 6.5, 9.5)],
  cog: [circle(12, 12, 2.5), circle(12, 12, 6.5), ...teeth(6, 30, 6.5, 9.5)],
  settings: ['M4 6h3', 'M11 6h9', circle(9, 6, 2), 'M4 12h9', 'M17 12h3', circle(15, 12, 2), 'M4 18h1', 'M9 18h11', circle(7, 18, 2)],
  database: ['M4 5c0 1.7 3.6 3 8 3s8-1.3 8-3-3.6-3-8-3-8 1.3-8 3z', 'M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  'file-text': ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8', 'M8 9h2'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  hammer: ['M10 8l5-5 6 6-5 5z', 'M4 20l8.5-8.5'],
  layout: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M3 9h18', 'M9 21V9'],
  leaf: ['M4 20c0-10 6-16 16-16 0 10-6 16-16 16z', 'M4 20l9-9'],
  scroll: ['M15 20H6a2 2 0 0 1-2-2V4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 4 0v-3h-4', 'M8 9h5', 'M8 13h5'],
  sparkles: ['M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8z', 'M18 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z'],
  tool: ['M3 19l5-5 3 3-5 5z', 'M9.5 15.5L19 6', 'M18 4l2 2'],
  video: ['M4 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'M15 10l7-4v12l-7-4z'],
  wrench: ['M20.5 6.5a5 5 0 0 1-6.6 4.9L6 19.3a1.95 1.95 0 0 1-2.7-2.7l7.9-7.9A5 5 0 0 1 17.5 3.5L15 6l.5 2.5L18 9z'],
  zap: ['M13 2L4 14h7l-1 8 9-12h-7z'],
  plug: ['M9 2v6', 'M15 2v6', 'M6 8h12v3a6 6 0 0 1-12 0z', 'M12 17v5'],
  car: ['M5 17H3v-5l2-5h14l2 5v5h-2', 'M5 12h14', 'M9.5 17h5', circle(7.5, 17, 2), circle(16.5, 17, 2)],
  map: ['M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z', 'M9 3v15', 'M15 6v15'],
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  globe: [circle(12, 12, 9), 'M3 12h18', 'M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z'],
  building: ['M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M16 9h2a2 2 0 0 1 2 2v10', 'M2 21h20', 'M8 7h4', 'M8 11h4', 'M8 15h4'],
  mountain: ['M2 20L9 7l5 8 2-3 6 8z'],
  home: ['M3 11l9-8 9 8', 'M5 9v12h14V9', 'M10 21v-6h4v6'],
  path: [circle(6, 19, 2), circle(18, 7, 2), 'M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8'],
  return: ['M9 14L4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
} as const satisfies Record<string, readonly string[]>

export type IconName = keyof typeof ICON_SHAPES

/** The neutral icon an unknown name falls back to: a plain page. */
export const FALLBACK_ICON: IconName = 'file'

export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(ICON_SHAPES, name)
}

/** The path data for a name; unknown names get the neutral fallback. */
export function iconShape(name: string): readonly string[] {
  return ICON_SHAPES[isIconName(name) ? name : FALLBACK_ICON]
}
