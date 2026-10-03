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
import { overlayTileUrl, tileCssSize } from './tiles'

const mapViewSrc = readFileSync(fileURLToPath(new URL('./MapView.tsx', import.meta.url)), 'utf8')
const mapPageSrc = readFileSync(fileURLToPath(new URL('../pages/MapPage.tsx', import.meta.url)), 'utf8')

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
  // T50: overlays are no longer created once in the mount effect. A separate effect over
  // the `overlays` prop (cfg.overlays less the maps the server does not run) asks
  // reconcileOverlays (./followMaps.ts, unit-tested in followMaps.test.ts) what to remove
  // and what to add, and adds in the order it returns: bottom first, so the first Map=
  // entry ends on top. Each is added straight to the map (no `pane:` override, so it lands
  // in the default tile pane, above the base tile layer and below every vector/marker layer).
  const overlayBlock = mapViewSrc.match(/for \(const id of add\) \{[\s\S]*?overlayLayers\.current\.set\(id, layer\)\s*\}/)

  it('imports overlayTileUrl from ./tiles and reconcileOverlays from ./followMaps', () => {
    expect(mapViewSrc).toMatch(/import\s*\{[^}]*overlayTileUrl[^}]*\}\s*from\s*'\.\/tiles'/)
    expect(mapViewSrc).toMatch(/import\s*\{[^}]*reconcileOverlays[^}]*\}\s*from\s*'\.\/followMaps'/)
  })

  it('MUTATION - overlay order reversed: adds exactly the ids reconcileOverlays returns, in the order it returns them (bottom first), never re-sorted', () => {
    expect(mapViewSrc).toMatch(/const \{ remove, add \} = reconcileOverlays\(overlayOrder\.current, overlays\.map\(\(o\) => o\.id\)\)/)
    expect(overlayBlock).not.toBeNull()
    expect(mapViewSrc).not.toMatch(/add\.reverse\(\)|\[\.\.\.add\]\.reverse\(\)|add\.sort\(/)
  })

  it('removes what reconcileOverlays says to remove, and remembers the ids on the map in Map= order', () => {
    expect(mapViewSrc).toMatch(/for \(const id of remove\) \{[\s\S]*?map\.removeLayer\(layer\)/)
    expect(mapViewSrc).toMatch(/overlayOrder\.current = overlays\.map\(\(o\) => o\.id\)\.filter\(\(id\) => overlayLayers\.current\.has\(id\)\)/)
  })

  it('re-runs when the drawn overlay list changes (the server Map= list changed while the page is open)', () => {
    expect(mapViewSrc).toMatch(/\}, \[overlays, cfg, tilesBase\]\)/)
  })

  it('MapPage feeds it cfg.overlays with a safe fallback, so a tiles.json with no overlays field still works', () => {
    expect(mapPageSrc).toMatch(/overlaysToDraw\(cfg\?\.overlays \?\? \[\], allowed\)/)
    expect(mapPageSrc).toMatch(/overlays=\{overlays\}/)
  })

  it('MUTATION - overlay drawn above the street layer: the overlay TileLayer sets no explicit `pane`, so it never escapes the default tile pane into the vector/marker panes streets and players use', () => {
    expect(overlayBlock![0]).not.toMatch(/pane:/)
  })

  it('the overlay effect is declared after the mount-once effect, so the map exists when it first runs, and the unmount forgets the layers', () => {
    const mountIndex = mapViewSrc.indexOf('const map = L.map(container.current')
    const overlayIndex = mapViewSrc.indexOf('reconcileOverlays(overlayOrder.current')
    expect(mountIndex).toBeGreaterThan(-1)
    expect(overlayIndex).toBeGreaterThan(mountIndex)
    expect(mapViewSrc).toMatch(/overlayLayers\.current\.clear\(\)\s*overlayOrder\.current = \[\]/)
  })

  it('each overlay layer resolves its tile URL through overlayTileUrl, not tileUrl', () => {
    expect(overlayBlock![0]).toMatch(/overlayTileUrl\(overlay, cfg,/)
  })

  it('MUTATION - overlay asks for the whole world: each overlay layer is bounded by overlayBounds, never worldBounds (2026-09-30)', () => {
    expect(overlayBlock![0]).toMatch(/const bounds = overlayBounds\(cfg, overlay\)/)
    expect(overlayBlock![0]).toMatch(/^\s*bounds,$/m)
    expect(overlayBlock![0]).not.toMatch(/worldBounds/)
  })
})

describe('tileCssSize (T45 edge tiles)', () => {
  it('draws a full tile at the tile size inside the native zoom range', () => {
    expect(tileCssSize(256, 256, 256, 256)).toEqual({ w: 256, h: 256 })
  })

  it('draws a cut edge tile at its own size, not stretched to a full tile', () => {
    expect(tileCssSize(256, 192, 256, 256)).toEqual({ w: 256, h: 192 })
    expect(tileCssSize(128, 256, 256, 256)).toEqual({ w: 128, h: 256 })
  })

  it('scales with Leaflet past the native range (zoom 17 over level 15 tiles)', () => {
    expect(tileCssSize(256, 192, 1024, 256)).toEqual({ w: 1024, h: 768 })
  })
})
