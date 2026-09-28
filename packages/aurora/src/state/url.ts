// Map view state carried in the URL: ?x=<square>&y=<square>&zoom=<level>.
// Pure functions so they can be tested without a browser.

export interface MapView {
  x: number
  y: number
  zoom: number
}

export interface ViewLimits {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZoom: number
  maxZoom: number
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function num(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Read the view from a query string, falling back to `fallback` for anything missing or invalid. */
export function parseView(search: string, fallback: MapView, limits: ViewLimits): MapView {
  const q = new URLSearchParams(search)
  const x = num(q.get('x'))
  const y = num(q.get('y'))
  const zoom = num(q.get('zoom'))
  return {
    x: clamp(x ?? fallback.x, limits.minX, limits.maxX),
    y: clamp(y ?? fallback.y, limits.minY, limits.maxY),
    zoom: clamp(zoom ?? fallback.zoom, limits.minZoom, limits.maxZoom),
  }
}

/** Squares to whole numbers, zoom to two decimals, so the URL stays short and stable. */
export function roundView(v: MapView): MapView {
  return { x: Math.round(v.x), y: Math.round(v.y), zoom: Math.round(v.zoom * 100) / 100 }
}

/**
 * Write the view into a query string, keeping every other parameter the URL already has.
 * Returns the string without a leading "?".
 */
export function writeView(currentSearch: string, view: MapView): string {
  const r = roundView(view)
  const q = new URLSearchParams(currentSearch)
  q.set('x', String(r.x))
  q.set('y', String(r.y))
  q.set('zoom', String(r.zoom))
  return q.toString()
}
