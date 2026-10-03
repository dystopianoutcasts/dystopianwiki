import { describe, expect, it } from 'vitest'
import tilesJson from '../../public/tiles.json'
import type { TilesConfig } from './tiles'
import { tileUrl } from './tiles'
import { cellCentre, cellOf, latLngToSquare, overlayBounds, pixelToSquare, squareToLatLng, squareToPixel, tileOf, worldBounds } from './coords'

const cfg = tilesJson as unknown as TilesConfig

// Landmark squares from the game's own vanilla spawnpoints.lua files. T04 rendered the
// pyramid and looked at each of these pixels: every one sits inside a house footprint.
// The cell and tile numbers below are worked out by hand from the 256-square cell size.
const landmarks = [
  { name: 'Muldraugh', x: 10770, y: 10271, cell: [42, 40], local: [18, 31] },
  { name: 'Rosewood', x: 7976, y: 11402, cell: [31, 44], local: [40, 138] },
  { name: 'Riverside', x: 5739, y: 5258, cell: [22, 20], local: [107, 138] },
]

describe('coordinates at the maximum level (one pixel per square, origin 0,0)', () => {
  it.each(landmarks)('$name: pixel equals square', ({ x, y }) => {
    expect(squareToPixel(cfg, { x, y })).toEqual({ px: x, py: y })
    expect(pixelToSquare(cfg, x, y)).toEqual({ x, y })
  })

  it.each(landmarks)('$name: cell and tile index', ({ x, y, cell }) => {
    expect(cellOf(cfg, { x, y })).toEqual({ cx: cell[0], cy: cell[1] })
    // tile size equals cell size, so at the maximum level tile (col,row) is cell (col,row)
    expect(tileOf(cfg, { x, y })).toEqual({ tx: cell[0], ty: cell[1] })
  })

  it.each(landmarks)('$name: position inside its cell', ({ x, y, cell, local }) => {
    expect(x - cell[0] * cfg.cellSize).toBe(local[0])
    expect(y - cell[1] * cfg.cellSize).toBe(local[1])
  })
})

describe('lower levels halve per step', () => {
  it('level 14 is half, level 13 a quarter', () => {
    expect(squareToPixel(cfg, { x: 10770, y: 10271 }, 14)).toEqual({ px: 5385, py: 5135.5 })
    expect(squareToPixel(cfg, { x: 10770, y: 10271 }, 13)).toEqual({ px: 2692.5, py: 2567.75 })
  })

  it('round-trips at every level', () => {
    for (let z = 0; z <= cfg.maxLevel; z++) {
      const p = squareToPixel(cfg, { x: 7976, y: 11402 }, z)
      const back = pixelToSquare(cfg, p.px, p.py, z)
      expect(back.x).toBeCloseTo(7976, 6)
      expect(back.y).toBeCloseTo(11402, 6)
    }
  })

  it('the whole world fits in one tile at level 0 to 7', () => {
    // 19968 px / 2^8 = 78 px, well inside one 256 px tile; at level 7 it is 156 px.
    expect(tileOf(cfg, { x: 19967, y: 16127 }, 7)).toEqual({ tx: 0, ty: 0 })
  })
})

describe('latlng mapping keeps y downward with no sign flip', () => {
  it('is [y, x] and inverts', () => {
    expect(squareToLatLng({ x: 10770, y: 10271 })).toEqual([10271, 10770])
    expect(latLngToSquare({ lat: 10271, lng: 10770 })).toEqual({ x: 10770, y: 10271 })
  })
})

describe('cell centres', () => {
  it('is the middle of the cell', () => {
    expect(cellCentre(cfg, 42, 40)).toEqual({ x: 42 * 256 + 128, y: 40 * 256 + 128 })
  })
})

describe('tile URL template', () => {
  it('fills layer, level and tile, and a base override wins over tiles.json', () => {
    expect(tileUrl(cfg, 0, 15, 42, 40, 'http://localhost:8000/')).toBe(
      'http://localhost:8000/base_top/layer0_files/15/42_40.webp',
    )
  })
})

describe('tiles.json is the shape the app assumes', () => {
  it('is B42 square space, 256 cells, one pixel per square, origin 0,0', () => {
    expect(cfg.coordinateSpace).toBe('b42-square')
    expect(cfg.cellSize).toBe(256)
    expect(cfg.tileSize).toBe(256)
    expect(cfg.squaresPerPixelAtMax).toBe(1)
    expect(cfg.originSquare).toEqual({ x: 0, y: 0 })
    expect(cfg.maxLevel).toBe(15)
  })
})

describe('overlayBounds (2026-09-30: an overlay asks only for its own tiles)', () => {
  const overlay = (cellRects: [number, number, number, number][]) => ({ id: 'm', title: 'm', tileUrlTemplate: '', cellRects })

  it('one rectangle: its own cells in squares, [top-left, bottom-right] as latlng', () => {
    expect(overlayBounds(cfg, overlay([[38, 38, 3, 4]]))).toEqual([
      [38 * 256, 38 * 256],
      [42 * 256, 41 * 256],
    ])
  })

  it('two rectangles: the box around both', () => {
    expect(overlayBounds(cfg, overlay([[16, 59, 8, 11], [24, 56, 2, 14]]))).toEqual([
      [56 * 256, 16 * 256],
      [70 * 256, 26 * 256],
    ])
  })

  it('no cells: null, so no layer is added', () => {
    expect(overlayBounds(cfg, overlay([]))).toBeNull()
  })

  it('every live overlay (none, on a vanilla-only map) is bounded inside the world, and none of them covers Rosewood, the opening view', () => {
    const [[wy0, wx0], [wy1, wx1]] = worldBounds(cfg)
    const overlays = cfg.overlays ?? []
    for (const o of overlays) {
      const b = overlayBounds(cfg, o)
      expect(b).not.toBeNull()
      const [[y0, x0], [y1, x1]] = b!
      expect(x0 >= wx0 && y0 >= wy0 && x1 <= wx1 && y1 <= wy1).toBe(true)
      expect(8350 >= x0 && 8350 <= x1 && 11750 >= y0 && 11750 <= y1).toBe(false)
    }
  })
})
