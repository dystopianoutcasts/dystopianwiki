import L from 'leaflet'
import type { TilesConfig } from './tiles'

/**
 * Leaflet CRS whose map units are world squares: latlng.lng is square x and latlng.lat
 * is square y. L.CRS.Simple negates y, which would make latitude increase upward against
 * a tile grid that increases downward. This transformation keeps y downward, so there is
 * no sign flip anywhere between the database and the tile the browser asks for.
 *
 * The CRS stays `infinite` (Simple's default). Leaflet's finite-world tile check takes its
 * limits from the projection bounds of +-180, which are meaningless in square units and
 * would reject every tile. The tile layer's own `bounds` option keeps requests inside the
 * populated world instead.
 */
export function makeCrs(cfg: TilesConfig): L.CRS {
  const k = 1 / (cfg.squaresPerPixelAtMax * Math.pow(2, cfg.maxLevel))
  return L.Util.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(k, 0, k, 0),
  }) as L.CRS
}
