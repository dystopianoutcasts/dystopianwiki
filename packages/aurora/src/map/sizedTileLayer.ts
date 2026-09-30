// Every tile layer on the map is built here, so every tile is drawn at its own size.
//
// A Deep Zoom pyramid cuts each level's last row and last column to the world's edge:
// at zoom 12 the world is 2,496 x 2,240 px, so the bottom row of tiles is 256 x 192.
// Leaflet sizes every tile image to the full tile size, which stretched those edge tiles
// (the owner saw Raven Creek, which fills the bottom row since T45, stretch at zoom 13
// and below; vanilla's own bottom row and right column had the same fault, unnoticed
// because they were mostly empty). Here each tile is resized to its own pixels once it
// has loaded, scaled the way Leaflet scales tiles past the native zoom range.
import L from 'leaflet'
import { tileCssSize } from './tiles'

/** The pyramid is sparse (only populated cells have tiles), so a 404 is normal, not an
 *  error: it shows this 1 x 1 transparent image instead. */
export const BLANK_TILE = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

export function sizedTileLayer(getUrl: (coords: L.Coords) => string, options: L.TileLayerOptions): L.TileLayer {
  const Sized = L.TileLayer.extend({
    getTileUrl(coords: L.Coords) {
      return getUrl(coords)
    },
    createTile(coords: L.Coords, done: L.DoneCallback) {
      const layer = this as L.TileLayer
      // createTile is protected in Leaflet's type definitions; this is the documented way
      // to extend it (call the parent's own implementation, then adjust the element).
      const parent = L.TileLayer.prototype as unknown as { createTile(c: L.Coords, d: L.DoneCallback): HTMLElement }
      const tile = parent.createTile.call(layer, coords, done) as HTMLImageElement
      tile.addEventListener('load', () => {
        if (!tile.naturalWidth || !tile.naturalHeight) return
        const size = tileCssSize(tile.naturalWidth, tile.naturalHeight, layer.getTileSize().x, Number(layer.options.tileSize))
        tile.style.width = `${size.w}px`
        tile.style.height = `${size.h}px`
      })
      return tile
    },
  })
  return new (Sized as unknown as new (u: string, o: L.TileLayerOptions) => L.TileLayer)('', {
    errorTileUrl: BLANK_TILE,
    ...options,
  })
}
