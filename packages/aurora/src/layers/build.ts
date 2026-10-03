// Leaflet layer builders. Each takes plain features (see transform.ts) and returns a layer
// the map component adds and removes. No data access happens here.
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.heat'
import type { AreaFeature, DeathFeature, NpcGroupFeature, NpcOutpostFeature, ObjectFeature, PlayerFeature, RectFeature, StreetFeature, VehicleFeature, WorldMapFeatures, ZoneFeature } from './transform'
import { streetWeight } from './transform'
import type { TilesConfig } from '../map/tiles'
import { zombieTileUrl } from '../map/tiles'
import { worldBounds } from '../map/coords'
import { sizedTileLayer } from '../map/sizedTileLayer'
import { placeLabels } from './labelPlacement'
// T41: imported from ./panes directly (not from map/MapView.tsx, which imports this
// very file) to avoid a circular import - see panes.ts's own header comment.
import { DEATH_PANE, NPC_PANE, PLAYERS_PANE, PLAYER_NAMES_PANE } from '../map/panes'
// T67: every symbol's look lives in symbols.ts (no Leaflet), shared with the map key.
import {
  OBJECT_STYLE,
  ROAD_STYLE,
  SAFEHOUSE_STYLE,
  STREET_COLOR,
  STREET_OPACITY,
  WORLD_FILL,
  ZONE_AREA_STYLE,
  ZONE_POINT_STYLE,
  deathIconHtml,
  escapeHtml,
  npcGroupIconHtml,
  outpostStyle,
  playerIconHtml,
  vehicleIconHtml,
  vehicleIconSize,
} from './symbols'

/**
 * Players, clustered. A live position is a filled dot; a delayed, cell-rounded one is a
 * hollow dot with a dashed outline. The marker's accessible name (`title`/`alt`) says
 * "approximate position, delayed", so the state never rests on colour or shape alone.
 * Characters linked to the signed-in account get a ring.
 *
 * T41 (owner): player markers, and the names beside them, must draw above every other
 * layer - both get a pane of their own (PLAYERS_PANE, PLAYER_NAMES_PANE; see
 * map/panes.ts), the only builder in this file that uses either. Leaflet only supports
 * one bound tooltip per marker, so the permanent name label (`f.name`, always visible)
 * takes that slot; the full label (name + hours survived + the delayed note) that used
 * to be the hover tooltip is still available as the marker's own `title`/`alt`, which
 * already carried it.
 */
export function buildPlayers(features: PlayerFeature[], own: ReadonlySet<string>): L.Layer {
  const group = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40, clusterPane: PLAYERS_PANE })
  for (const f of features) {
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: playerIconHtml({ delayed: f.delayed, own: own.has(f.username) }), iconSize: [18, 18] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
      pane: PLAYERS_PANE,
    })
    marker.bindTooltip(escapeHtml(f.name), {
      permanent: true,
      direction: 'right',
      offset: [10, 0],
      className: 'player-name',
      pane: PLAYER_NAMES_PANE,
    })
    group.addLayer(marker)
  }
  return group
}

/** Every car is the glyph; claimed and ledger-only variants are drawn by vehicleIconHtml (symbols.ts). */
export function buildVehicles(features: VehicleFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const size = vehicleIconSize(f.claimed)
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: vehicleIconHtml({ claimed: f.claimed, ledger: f.ledger }), iconSize: [size, size] }),
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
    L.rectangle(f.bounds, { ...SAFEHOUSE_STYLE })
      .bindTooltip(escapeHtml(f.label), { sticky: true })
      .addTo(group)
  }
  return group
}

/** One cross per player, at their latest death, in its own pane above vehicles and below NPC groups and players. */
export function buildDeaths(features: DeathFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: deathIconHtml(), iconSize: [20, 20] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
      pane: DEATH_PANE,
    })
    marker.bindTooltip(escapeHtml(f.label), { direction: 'top', offset: [0, -10] })
    group.addLayer(marker)
  }
  return group
}

/** A-Life NPC groups, one marker per group, in their own pane above vehicles and below
 * players. Hostile: a heavier outline and a "!" badge. Dormant: muted and dashed (both drawn
 * by npcGroupIconHtml, symbols.ts). Neither rests on colour; the tooltip states the stance
 * and dormancy in words, and the marker carries the label as its accessible name. */
export function buildNpcGroups(features: NpcGroupFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: npcGroupIconHtml(f), iconSize: [30, 30] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
      pane: NPC_PANE,
    })
    marker.bindTooltip(escapeHtml(f.label), { direction: 'top', offset: [0, -12] })
    group.addLayer(marker)
  }
  return group
}

/** Outposts are areas like safehouses: dashed and outlined, heavier when hostile. */
export function buildNpcOutposts(features: NpcOutpostFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    L.rectangle(f.bounds, outpostStyle(f.hostile))
      .bindTooltip(escapeHtml(f.label), { sticky: true })
      .addTo(group)
  }
  return group
}

export function buildZones(features: ZoneFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const shape = f.point
      ? L.circleMarker(f.bounds[0], { ...ZONE_POINT_STYLE })
      : L.rectangle(f.bounds, { ...ZONE_AREA_STYLE })
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
  // sizedTileLayer: edge tiles at their own size (T45). Sparse, so a 404 is normal.
  return sizedTileLayer((coords) => zombieTileUrl(cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase), {
    tileSize: cfg.tileSize,
    minNativeZoom: 0,
    maxNativeZoom: cfg.maxLevel,
    bounds: worldBounds(cfg),
    noWrap: true,
    opacity: 0.6,
    // T50: mod-map overlays can be added after this layer (the server's Map= list changed
    // while the page was open); a z-index above theirs (Leaflet's default 1) keeps the
    // density shading on top of them, as it is when everything is added on load.
    zIndex: 2,
  })
}

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
 *
 * T42: `f.latlngs` is one array per source piece rather than one flat array - Leaflet's
 * `L.polyline` draws an array of arrays as a single multi-polyline object, so a road
 * that extract-streets.ts merged from several touching pieces still hovers, highlights
 * and shows its tooltip as the one road it is, whichever piece the pointer is over.
 */
export function buildStreets(features: StreetFeature[], zoom: number, minZoom: number, maxZoom: number): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const weight = streetWeight(zoom, minZoom, maxZoom, f.width)
    const visible = L.polyline(f.latlngs, { color: STREET_COLOR, weight, opacity: STREET_OPACITY, interactive: false })
    const hit = L.polyline(f.latlngs, { color: '#000000', weight: STREET_HIT_WEIGHT, opacity: 0 })
    hit.bindTooltip(escapeHtml(f.label), { sticky: true })
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
    L.polygon(f.latlngs, { renderer, interactive: false, stroke: false, ...WORLD_FILL.forest }).addTo(group)
  }
  for (const f of features.water) {
    L.polygon(f.latlngs, { renderer, interactive: false, stroke: false, ...WORLD_FILL.water }).addTo(group)
  }
  for (const f of features.buildings) {
    L.polygon(f.latlngs, { renderer, interactive: false, stroke: false, ...WORLD_FILL.buildings }).addTo(group)
  }
  for (const f of features.roads) {
    const style = (ROAD_STYLE as Record<string, L.PathOptions>)[f.type] ?? ROAD_STYLE.tertiary
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
    L.circleMarker(f.latlng, { ...OBJECT_STYLE })
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
let measureContext: CanvasRenderingContext2D | null | undefined

/** Width and height of an area label as the stylesheet draws it (aurora.css
 *  .aurora-area-label: towns 700 0.95rem with 0.02em letter spacing, landmarks 400
 *  0.7rem), measured with a canvas in the page's own font. */
export function measureAreaLabel(text: string, kind: 'town' | 'landmark'): { w: number; h: number } {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const size = (kind === 'town' ? 0.95 : 0.7) * rem
  if (measureContext === undefined) measureContext = document.createElement('canvas').getContext('2d')
  let w = text.length * size * 0.6
  if (measureContext) {
    measureContext.font = `${kind === 'town' ? 700 : 400} ${size}px ${getComputedStyle(document.body).fontFamily || 'sans-serif'}`
    w = measureContext.measureText(text).width
  }
  if (kind === 'town') w += text.length * 0.02 * size
  return { w: Math.ceil(w), h: Math.ceil(size * 1.3) }
}

/**
 * Area labels, each centred on its point. Vanilla names are placed first and never move;
 * a map-mod town name that would cover one steps aside, left first (see
 * labelPlacement.ts). `project` turns a latlng into map pixels at `zoom`, `measure` gives a
 * label's size; both come from the live map, so this stays testable as source text.
 */
export function buildAreas(
  features: AreaFeature[],
  zoom: number,
  landmarkMinZoom: number,
  project: (latlng: [number, number]) => { x: number; y: number },
  measure: (text: string, kind: 'town' | 'landmark') => { w: number; h: number },
): L.Layer {
  const group = L.layerGroup()
  const shown = features.filter((f) => !(f.kind === 'landmark' && zoom < landmarkMinZoom))
  const placements = placeLabels(
    shown.map((f) => {
      const p = project(f.latlng)
      const size = measure(f.name, f.kind)
      return { key: f.key, x: p.x, y: p.y, w: size.w, h: size.h, mod: f.mod, areaSquares: f.areaSquares }
    }),
  )
  for (const f of shown) {
    const placement = placements.get(f.key)
    if (!placement) continue
    // The marker itself is a zero-size box at the point (Leaflet positions it with its
    // own inline transform, which is why a transform on the marker never centred the
    // text). The inner span centres the text on the point, plus the placement offset.
    const style = `transform: translate(calc(-50% + ${placement.dx}px), calc(-50% + ${placement.dy}px))`
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({
        className: f.kind === 'town' ? 'aurora-area-label is-town' : 'aurora-area-label is-landmark',
        html: `<span class="aurora-area-text" style="${style}">${escapeHtml(f.name)}</span>`,
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
