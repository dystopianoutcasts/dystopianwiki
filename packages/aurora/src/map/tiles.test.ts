// T45 Part PUBLISH: tiles.ts had no test file before this task (see coords.test.ts:72 for
// the pre-existing tileUrl coverage, which this file does not duplicate). MapView.tsx
// imports Leaflet, which touches `window` at module load time and cannot be imported
// under this suite's node test environment (mapChrome.test.ts's own header note) - its
// overlay-layering code is asserted as source text here, the same approach that file
// already uses for the rest of MapView.tsx.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { TileOverlay, TilesConfig } from './tiles'
import { overlayTileUrl } from './tiles'

const mapViewSrc = readFileSync(fileURLToPath(new URL('./MapView.tsx', import.meta.url)), 'utf8')

const cfg: TilesConfig = {
  coordinateSpace: 'b42-square',
  tileSize: 256,
  maxLevel: 15,
  format: 'webp',
  cellSize: 256,
  originSquare: { x: 0, y: 0 },
  squaresPerPixelAtMax: 1,
  world: { pixels: { w: 19968, h: 16128 }, squares: { w: 19968, h: 16128 } },
  layers: { min: -32, max: 32, ground: 0 },
  baseUrl: '',
  tileUrlTemplate: '{baseUrl}/base_top/layer{layer}_files/{z}/{x}_{y}.webp',
}

const overlay: TileOverlay = {
  id: 'sd_cc',
  title: 'sd_cc',
  tileUrlTemplate: '{baseUrl}/mod_maps/sd_cc/base_top/layer{layer}_files/{z}/{x}_{y}.webp',
  cellRects: [[10, 10, 1, 1]],
}

describe('overlayTileUrl', () => {
  it('resolves the OVERLAY\'s own template, not cfg.tileUrlTemplate', () => {
    expect(overlayTileUrl(overlay, cfg, 0, 15, 42, 40)).toBe('/mod_maps/sd_cc/base_top/layer0_files/15/42_40.webp')
  })

  it('substitutes baseUrl from cfg.baseUrl when no override is given', () => {
    const withBase: TilesConfig = { ...cfg, baseUrl: 'https://tiles.example.com' }
    expect(overlayTileUrl(overlay, withBase, 0, 15, 42, 40)).toBe(
      'https://tiles.example.com/mod_maps/sd_cc/base_top/layer0_files/15/42_40.webp',
    )
  })

  it('a baseOverride wins over cfg.baseUrl, same as tileUrl', () => {
    expect(overlayTileUrl(overlay, cfg, 0, 15, 42, 40, 'http://localhost:8000/')).toBe(
      'http://localhost:8000/mod_maps/sd_cc/base_top/layer0_files/15/42_40.webp',
    )
  })

  it('two different overlays with two different ids resolve to two different URLs', () => {
    const other: TileOverlay = { ...overlay, id: 'other_mod', tileUrlTemplate: overlay.tileUrlTemplate.replace('sd_cc', 'other_mod') }
    expect(overlayTileUrl(overlay, cfg, 0, 15, 42, 40)).not.toBe(overlayTileUrl(other, cfg, 0, 15, 42, 40))
  })
})

describe('MapView.tsx: mod-map overlays (source text - see header note)', () => {
  // Captures the exact loop this task requires: reverse index order over cfg.overlays,
  // each overlay added straight to the map (no `pane:` override, so it lands in the
  // default tile pane, above the base tile layer and below every vector/marker layer).
  const overlayBlock = mapViewSrc.match(
    /for \(let i = overlays\.length - 1; i >= 0; i--\) \{[\s\S]*?\.addTo\(map\)\s*\}/,
  )

  it('imports overlayTileUrl from ./tiles', () => {
    expect(mapViewSrc).toMatch(/import\s*\{[^}]*overlayTileUrl[^}]*\}\s*from\s*'\.\/tiles'/)
  })

  it('MUTATION - overlay order reversed: iterates overlays in REVERSE list order (last added first), so the first overlay (Map= winner) paints on top', () => {
    expect(overlayBlock).not.toBeNull()
  })

  it('reads cfg.overlays with a safe fallback, so today\'s tiles.json (no overlays field) still works', () => {
    expect(mapViewSrc).toMatch(/const overlays = cfg\.overlays \?\? \[\]/)
  })

  it('MUTATION - overlay drawn above the street layer: the overlay TileLayer sets no explicit `pane`, so it never escapes the default tile pane into the vector/marker panes streets and players use', () => {
    expect(overlayBlock![0]).not.toMatch(/pane:/)
  })

  it('the overlay block runs before map.setView (inside the mount-once effect, alongside the base tile layer)', () => {
    const overlayIndex = mapViewSrc.indexOf('for (let i = overlays.length - 1; i >= 0; i--)')
    const setViewIndex = mapViewSrc.indexOf('map.setView(squareToLatLng({ x: initialView.x')
    expect(overlayIndex).toBeGreaterThan(-1)
    expect(setViewIndex).toBeGreaterThan(-1)
    expect(overlayIndex).toBeLessThan(setViewIndex)
  })

  it('each overlay layer resolves its tile URL through overlayTileUrl, not tileUrl', () => {
    expect(overlayBlock![0]).toMatch(/overlayTileUrl\(overlay, cfg,/)
  })
})
