// Leaflet layer builders. Each takes plain features (see transform.ts) and returns a layer
// the map component adds and removes. No data access happens here.
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.heat'
import type { AreaFeature, ObjectFeature, PlayerFeature, RectFeature, StreetFeature, VehicleFeature, WorldMapFeatures, ZoneFeature } from './transform'
import { streetWeight } from './transform'
import type { TilesConfig } from '../map/tiles'
import { zombieTileUrl } from '../map/tiles'
import { worldBounds } from '../map/coords'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Players, clustered. A live position is a filled dot; a delayed, cell-rounded one is a
 * hollow dot with a dashed outline. The tooltip and the marker's accessible name also say
 * "approximate position, delayed", so the state never rests on colour or shape alone.
 * Characters linked to the signed-in account get a ring.
 */
export function buildPlayers(features: PlayerFeature[], own: ReadonlySet<string>): L.Layer {
  const group = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40 })
  for (const f of features) {
    const cls = ['aurora-dot', f.delayed ? 'is-delayed' : 'is-live', own.has(f.username) ? 'is-own' : ''].join(' ').trim()
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: `<span class="${cls}"></span>`, iconSize: [18, 18] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
    })
    marker.bindTooltip(escapeHtml(f.label), { direction: 'top', offset: [0, -8] })
    group.addLayer(marker)
  }
  return group
}

export function buildVehicles(features: VehicleFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: '<span class="aurora-vehicle"></span>', iconSize: [14, 14] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
    })
    marker.bindTooltip(escapeHtml(f.label), { direction: 'top', offset: [0, -6] })
    group.addLayer(marker)
  }
  return group
}

export function buildSafehouses(features: RectFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    L.rectangle(f.bounds, { color: '#e0a030', weight: 2, fillOpacity: 0.15, dashArray: '4 3' })
      .bindTooltip(escapeHtml(f.label), { sticky: true })
      .addTo(group)
  }
  return group
}

export function buildZones(features: ZoneFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const shape = f.point
      ? L.circleMarker(f.bounds[0], { radius: 5, color: '#5aa0ff', weight: 2, fillOpacity: 0.3 })
      : L.rectangle(f.bounds, { color: '#5aa0ff', weight: 1, fillOpacity: 0.1 })
    shape.bindTooltip(escapeHtml(f.label), { sticky: true }).addTo(group)
  }
  return group
}

export function buildHeat(points: [number, number, number][]): L.Layer {
  return L.heatLayer(points, { radius: 45, blur: 35, max: 1, minOpacity: 0.25 })
}

/**
 * The static spawn-density pyramid (T22 Part C): a second tile layer, not a vector
 * feature builder like the rest of this file, so it takes `cfg`/`tilesBase` instead of
 * a `Feature[]`. Same pyramid geometry as the base tile layer (MapView's own `Layer`
 * extend), drawn semi-transparent above it when the toggle is on.
 */
export function buildZombieDensityLayer(cfg: TilesConfig, tilesBase?: string): L.Layer {
  const Layer = L.TileLayer.extend({
    getTileUrl(coords: L.Coords) {
      return zombieTileUrl(cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase)
    },
  })
  // The pyramid is sparse (only populated cells have tiles), so a 404 is normal, not an error.
  return new (Layer as unknown as new (u: string, o: L.TileLayerOptions) => L.TileLayer)('', {
    tileSize: cfg.tileSize,
    minNativeZoom: 0,
    maxNativeZoom: cfg.maxLevel,
    bounds: worldBounds(cfg),
    noWrap: true,
    opacity: 0.6,
    errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  })
}

const STREET_COLOR = '#9aa0a8'
const STREET_OPACITY = 0.55
const STREET_HOVER_COLOR = '#ffffff'
const STREET_HOVER_BOOST = 3
/** The invisible line's own weight: how wide a pointer target every street gets, whatever
 * its visible line looks like at the current zoom (T22 Part D item 6, owner request: the
 * visible line alone was too thin to hover reliably). */
const STREET_HIT_WEIGHT = 16

/**
 * Two lines per street (T22 Part D item 6): a visible one whose weight follows the zoom
 * (streetWeight above) and, drawn above it, an invisible one at a constant, generous
 * weight that owns hover, the tooltip and click - so the pointer target is always 16 px
 * wide, whatever the visible line looks like at the current zoom. Rebuilt on every zoom
 * change (MapView's own effect dependency), so the visible weight is never stale.
 */
export function buildStreets(features: StreetFeature[], zoom: number, minZoom: number, maxZoom: number): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const weight = streetWeight(zoom, minZoom, maxZoom, f.width)
    const visible = L.polyline(f.latlngs, { color: STREET_COLOR, weight, opacity: STREET_OPACITY, interactive: false })
    const hit = L.polyline(f.latlngs, { color: '#000000', weight: STREET_HIT_WEIGHT, opacity: 0 })
    hit.bindTooltip(escapeHtml(f.name), { sticky: true })
    hit.on('mouseover', () => {
      visible.setStyle({ color: STREET_HOVER_COLOR, weight: weight + STREET_HOVER_BOOST, opacity: 1 })
      visible.bringToFront()
    })
    hit.on('mouseout', () => visible.setStyle({ color: STREET_COLOR, weight, opacity: STREET_OPACITY }))
    group.addLayer(visible)
    group.addLayer(hit)
  }
  return group
}

const ROAD_STYLE: Record<string, L.PathOptions> = {
  primary: { color: '#e8a33d', weight: 3 },
  secondary: { color: '#d9c98a', weight: 2 },
  tertiary: { color: '#c9c9c9', weight: 1.5 },
  trail: { color: '#8b6b4a', weight: 1, dashArray: '3 3' },
  railway: { color: '#333333', weight: 1.5, dashArray: '1 4' },
}

/**
 * The in-game map's own look, at 11,000+ buildings and tens of thousands of forest and
 * road shapes: everything shares ONE canvas renderer so the browser paints one <canvas>
 * element rather than a DOM node per feature, and every shape is `interactive: false` -
 * this layer is a static backdrop, not something to hover or click.
 */
export function buildWorldMap(features: WorldMapFeatures): L.Layer {
  const renderer = L.canvas({ padding: 0.5 })
  const group = L.layerGroup()
  for (const f of features.forest) {
    L.polygon(f.latlngs, { renderer, interactive: false, stroke: false, fillColor: '#2f4a2f', fillOpacity: 0.55 }).addTo(group)
  }
  for (const f of features.water) {
    L.polygon(f.latlngs, { renderer, interactive: false, stroke: false, fillColor: '#2f5d7c', fillOpacity: 0.6 }).addTo(group)
  }
  for (const f of features.buildings) {
    L.polygon(f.latlngs, { renderer, interactive: false, stroke: false, fillColor: '#4a4640', fillOpacity: 0.7 }).addTo(group)
  }
  for (const f of features.roads) {
    const style = ROAD_STYLE[f.type] ?? ROAD_STYLE.tertiary
    const shape = f.closed
      ? L.polygon(f.latlngs, { renderer, interactive: false, fill: false, ...style })
      : L.polyline(f.latlngs, { renderer, interactive: false, ...style })
    shape.addTo(group)
  }
  return group
}

export function buildObjects(features: ObjectFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    L.circleMarker(f.latlng, { radius: 4, color: '#b070e0', weight: 2, fillOpacity: 0.6 })
      .bindTooltip(escapeHtml(`${f.label} (${f.kind})`), { sticky: true })
      .addTo(group)
  }
  return group
}

/**
 * Named areas (T22 Part D item 2): a permanent text label at each area's centroid, no
 * icon, no hover needed - "labelled" means the name is just sitting on the map. Towns
 * are always shown (readable even zoomed out, styled bigger and bolder); landmarks are
 * held back below `landmarkMinZoom` so 17 small labels clustered around Muldraugh don't
 * crowd a low zoom the way the town names are meant to own.
 */
export function buildAreas(features: AreaFeature[], zoom: number, landmarkMinZoom: number): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    if (f.kind === 'landmark' && zoom < landmarkMinZoom) continue
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({
        className: f.kind === 'town' ? 'aurora-area-label is-town' : 'aurora-area-label is-landmark',
        html: escapeHtml(f.name),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
      interactive: false,
      keyboard: false,
    })
    group.addLayer(marker)
  }
  return group
}
