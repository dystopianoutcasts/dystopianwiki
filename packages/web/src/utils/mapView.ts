/**
 * Pure geometry for the home page map viewport (components/landing/ServerNow.tsx).
 *
 * World squares run 0..19968 (x) and 0..16128 (y), origin top left, y grows
 * downward. A zoom level's picture has `squaresPerPixel = 2 ** (15 - zoom)`
 * world squares per CSS pixel (zoom 15 is one pixel per square).
 *
 * No React, no DOM: kept free of both so they can be unit-tested directly
 * with node's own test runner (packages/web has no test framework - see
 * mapView.test.ts, run with `npx tsx --test`).
 */

export interface WorldPoint {
  x: number
  y: number
}

export interface PixelPoint {
  x: number
  y: number
}

export interface ViewportSize {
  width: number
  height: number
}

export const WORLD_WIDTH = 19968
export const WORLD_HEIGHT = 16128

export function squaresPerPixel(zoom: number): number {
  return 2 ** (15 - zoom)
}

/** The stitched picture's size in CSS pixels at a given zoom. */
export function imageSize(zoom: number): { width: number; height: number } {
  const spp = squaresPerPixel(zoom)
  return { width: Math.ceil(WORLD_WIDTH / spp), height: Math.ceil(WORLD_HEIGHT / spp) }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/**
 * How the home page map is drawn at a given viewport width: which tile level to
 * load, and the size of the whole picture in CSS pixels.
 *
 * The picture always spans at least the viewport's width (the owner's banner,
 * 2026-10-02): on a wide screen the whole world's width is visible and the map
 * only pans up and down. It is never narrower than zoom 11 (1,248 px), so on a
 * phone it pans both ways instead of shrinking to a smear. The tile level is the
 * smallest whose own width covers the drawn width, so tiles are only ever scaled
 * down (sharp), up to zoom 13 for very wide screens.
 */
export interface MapScale {
  tileZoom: number
  /** CSS pixels per world square. */
  pixelsPerSquare: number
  width: number
  height: number
}

export const MIN_TILE_ZOOM = 11
export const MAX_TILE_ZOOM = 13

export function fitScale(viewportWidth: number): MapScale {
  const width = Math.max(viewportWidth, imageSize(MIN_TILE_ZOOM).width)
  let tileZoom = MIN_TILE_ZOOM
  while (tileZoom < MAX_TILE_ZOOM && imageSize(tileZoom).width < width) tileZoom++
  const pixelsPerSquare = width / WORLD_WIDTH
  return { tileZoom, pixelsPerSquare, width: Math.round(width), height: Math.round(WORLD_HEIGHT * pixelsPerSquare) }
}

/** The scale of one tile level drawn at its natural size. */
export function zoomScale(zoom: number): MapScale {
  const { width, height } = imageSize(zoom)
  return { tileZoom: zoom, pixelsPerSquare: 1 / squaresPerPixel(zoom), width, height }
}

/**
 * scrollLeft/scrollTop that centre `center` (world squares) in a viewport of
 * `viewportSize` CSS pixels on a picture drawn at `scale`, clamped so the picture
 * always fills the viewport (never a margin of empty space past an edge, and never
 * a negative scroll when the viewport is bigger than the picture).
 */
export function scrollAt(center: WorldPoint, viewportSize: ViewportSize, scale: MapScale): PixelPoint {
  const px = center.x * scale.pixelsPerSquare
  const py = center.y * scale.pixelsPerSquare
  const maxX = Math.max(0, scale.width - viewportSize.width)
  const maxY = Math.max(0, scale.height - viewportSize.height)
  return {
    x: clamp(px - viewportSize.width / 2, 0, maxX),
    y: clamp(py - viewportSize.height / 2, 0, maxY),
  }
}

/** The world square at the centre of the viewport. Inverse of scrollAt away from the clamp. */
export function centerAt(scroll: PixelPoint, viewportSize: ViewportSize, scale: MapScale): WorldPoint {
  const px = scroll.x + viewportSize.width / 2
  const py = scroll.y + viewportSize.height / 2
  return {
    x: Math.round(px / scale.pixelsPerSquare),
    y: Math.round(py / scale.pixelsPerSquare),
  }
}

/** scrollAt for one tile level at its natural size. */
export function scrollFor(center: WorldPoint, viewportSize: ViewportSize, zoom: number): PixelPoint {
  return scrollAt(center, viewportSize, zoomScale(zoom))
}

/**
 * centerOf for one tile level at its natural size:
 * `centerOf(scrollFor(c, v, z), v, z)` equals `c` whenever `c` is not past an edge.
 */
export function centerOf(scroll: PixelPoint, viewportSize: ViewportSize, zoom: number): WorldPoint {
  return centerAt(scroll, viewportSize, zoomScale(zoom))
}

/** Names over 24 characters end in an ellipsis, so a long name never breaks the one-line layout. */
export function truncateName(name: string): string {
  return name.length > 24 ? `${name.slice(0, 24).trimEnd()}…` : name
}
