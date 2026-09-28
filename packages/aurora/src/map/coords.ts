// World squares <-> Leaflet coordinates <-> pixels <-> cells and tiles. Pure maths, no
// Leaflet import, so it runs under plain Node in the tests.
//
// Every number here is a B42 world square (tiles.json coordinateSpace "b42-square").
// The pyramid is one pixel per square at the maximum level with the origin at square
// (0, 0), so at level z a square sits at pixel (square - origin) * 2^(z - maxLevel)
// / squaresPerPixelAtMax. The map CRS (crs.ts) uses squares themselves as its units.
import type { TilesConfig } from './tiles'

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
