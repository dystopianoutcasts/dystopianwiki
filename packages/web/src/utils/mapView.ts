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
 * scrollLeft/scrollTop that centre `center` (world squares) in a viewport of
 * `viewportSize` CSS pixels at `zoom`, clamped so the picture always fills
 * the viewport (never a margin of empty space past an edge, and never a
 * negative scroll when the viewport is bigger than the picture).
 */
export function scrollFor(center: WorldPoint, viewportSize: ViewportSize, zoom: number): PixelPoint {
  const spp = squaresPerPixel(zoom)
  const { width: imgW, height: imgH } = imageSize(zoom)
  const px = center.x / spp
  const py = center.y / spp
  const maxX = Math.max(0, imgW - viewportSize.width)
  const maxY = Math.max(0, imgH - viewportSize.height)
  return {
    x: clamp(px - viewportSize.width / 2, 0, maxX),
    y: clamp(py - viewportSize.height / 2, 0, maxY),
  }
}

/**
 * The world square at the centre of the viewport, given its current scroll
 * position. Inverse of scrollFor away from the clamp:
 * `centerOf(scrollFor(c, v, z), v, z)` equals `c` whenever `c` is not past
 * an edge of the picture for that viewport size.
 */
export function centerOf(scroll: PixelPoint, viewportSize: ViewportSize, zoom: number): WorldPoint {
  const spp = squaresPerPixel(zoom)
  const px = scroll.x + viewportSize.width / 2
  const py = scroll.y + viewportSize.height / 2
  return {
    x: Math.round(px * spp),
    y: Math.round(py * spp),
  }
}

/** Names over 24 characters end in an ellipsis, so a long name never breaks the one-line layout. */
export function truncateName(name: string): string {
  return name.length > 24 ? `${name.slice(0, 24).trimEnd()}…` : name
}
