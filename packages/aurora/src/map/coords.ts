// World squares <-> Leaflet coordinates <-> pixels <-> cells and tiles. Pure maths, no
// Leaflet import, so it runs under plain Node in the tests.
//
// Every number here is a B42 world square (tiles.json coordinateSpace "b42-square").
// The pyramid is one pixel per square at the maximum level with the origin at square
// (0, 0), so at level z a square sits at pixel (square - origin) * 2^(z - maxLevel)
// / squaresPerPixelAtMax. The map CRS (crs.ts) uses squares themselves as its units.
import type { TileOverlay, TilesConfig } from './tiles'

export interface Square {
  x: number
  y: number
}

/** Pixel position of a square at a pyramid level. */
export function squareToPixel(
  cfg: TilesConfig,
  sq: Square,
  z: number = cfg.maxLevel,
): { px: number; py: number } {
  const scale = Math.pow(2, z - cfg.maxLevel) / cfg.squaresPerPixelAtMax
  return { px: (sq.x - cfg.originSquare.x) * scale, py: (sq.y - cfg.originSquare.y) * scale }
}

/** Inverse of squareToPixel. */
export function pixelToSquare(cfg: TilesConfig, px: number, py: number, z: number = cfg.maxLevel): Square {
  const scale = Math.pow(2, z - cfg.maxLevel) / cfg.squaresPerPixelAtMax
  return { x: px / scale + cfg.originSquare.x, y: py / scale + cfg.originSquare.y }
}

/** Cell (cellSize x cellSize squares) that holds a square. */
export function cellOf(cfg: TilesConfig, sq: Square): { cx: number; cy: number } {
  return { cx: Math.floor(sq.x / cfg.cellSize), cy: Math.floor(sq.y / cfg.cellSize) }
}

/** Centre of a cell in squares. Used to place zombie-grid heat. */
export function cellCentre(cfg: TilesConfig, cx: number, cy: number): Square {
  return { x: cx * cfg.cellSize + cfg.cellSize / 2, y: cy * cfg.cellSize + cfg.cellSize / 2 }
}

/** Tile that holds a square at a pyramid level. */
export function tileOf(cfg: TilesConfig, sq: Square, z: number = cfg.maxLevel): { tx: number; ty: number } {
  const { px, py } = squareToPixel(cfg, sq, z)
  return { tx: Math.floor(px / cfg.tileSize), ty: Math.floor(py / cfg.tileSize) }
}

/** Leaflet latlng for a square: [lat, lng] = [y, x]. */
export function squareToLatLng(sq: Square): [number, number] {
  return [sq.y, sq.x]
}

export function latLngToSquare(ll: { lat: number; lng: number }): Square {
  return { x: ll.lng, y: ll.lat }
}

/** World bounds as [top-left, bottom-right] in latlng (y first). */
export function worldBounds(cfg: TilesConfig): [[number, number], [number, number]] {
  return [
    [cfg.originSquare.y, cfg.originSquare.x],
    [cfg.originSquare.y + cfg.world.squares.h, cfg.originSquare.x + cfg.world.squares.w],
  ]
}

/**
 * The box around a mod-map overlay's own cells (its cellRects, [x, y, w, h] in cells), as
 * [top-left, bottom-right] in latlng: the overlay layer's Leaflet `bounds`, so it asks only
 * for tiles its map can have. With the whole world as its bounds, each of the six overlays
 * asked for every tile on screen: the opening view made 245 tile requests for 35 tiles,
 * 210 of them 404s (measured 2026-09-30, the day a visitor hit GitHub Pages' rate limit).
 * Null when the overlay has no cells, so it has no tiles to ask for.
 */
export function overlayBounds(cfg: TilesConfig, overlay: TileOverlay): [[number, number], [number, number]] | null {
  if (overlay.cellRects.length === 0) return null
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const [x, y, w, h] of overlay.cellRects) {
    x0 = Math.min(x0, x)
    y0 = Math.min(y0, y)
    x1 = Math.max(x1, x + w)
    y1 = Math.max(y1, y + h)
  }
  return [
    [y0 * cfg.cellSize, x0 * cfg.cellSize],
    [y1 * cfg.cellSize, x1 * cfg.cellSize],
  ]
}
