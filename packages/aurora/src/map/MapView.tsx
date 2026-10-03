import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { TileOverlay, TilesConfig } from './tiles'
import { overlayTileUrl, tileUrl } from './tiles'
import { reconcileOverlays } from './followMaps'
import { sizedTileLayer } from './sizedTileLayer'
import { latLngToSquare, overlayBounds, squareToLatLng, worldBounds } from './coords'
import { makeCrs } from './crs'
import type { MapView as View } from '../state/url'
import type { LayerPrefs } from '../state/layerPrefs'
import {
  buildAreas,
  measureAreaLabel,
  buildHeat,
  buildDeaths,
  buildNpcGroups,
  buildNpcOutposts,
  buildObjects,
  buildPlayers,
  buildSafehouses,
  buildStreets,
  buildVehicles,
  buildWatchedVehicles,
  buildWorldMap,
  buildZombieDensityLayer,
  buildZones,
} from '../layers/build'
import type {
  AreaFeature,
  DeathFeature,
  NpcGroupFeature,
  NpcOutpostFeature,
  ObjectFeature,
  PlayerFeature,
  RectFeature,
  StreetFeature,
  VehicleFeature,
  WorldMapFeatures,
  ZoneFeature,
} from '../layers/transform'
import { DEATH_PANE, DEATH_PANE_Z_INDEX, MAP_KEY_PANE, MAP_KEY_PANE_Z_INDEX, NPC_PANE, NPC_PANE_Z_INDEX, PLAYERS_PANE, PLAYERS_PANE_Z_INDEX, PLAYER_NAMES_PANE, PLAYER_NAMES_PANE_Z_INDEX, WATCHED_PANE, WATCHED_PANE_Z_INDEX } from './panes'

// T41: re-exported so a consumer of this module sees them here, next to the map that
// creates them; layers/build.ts imports the same constants from ./panes directly
// instead, to avoid a circular import between this file and layers/build.ts.
export { PLAYERS_PANE, PLAYERS_PANE_Z_INDEX, PLAYER_NAMES_PANE, PLAYER_NAMES_PANE_Z_INDEX }

/** Zoom below this shows the whole 19968-square world smaller than a phone screen. */
export const MIN_ZOOM = 3

/**
 * Below this, 1,098 street lines are mostly noise and cost more to draw than the tiles
 * underneath them. Two levels above MIN_ZOOM: roughly "a town is legible" (T22 Part A).
 */
export const STREETS_MIN_ZOOM = MIN_ZOOM + 2

/**
 * T42 (2026-09-29): a street search result flies here - a fixed, comfortable zoom
 * rather than the current one or a number derived from STREETS_MIN_ZOOM, so a result
 * always lands close enough to read the street whatever zoom the visitor started at.
 * Owner's own number. The pyramid's native levels stop at 15 (one pixel per square);
 * 16 and 17 stretch the zoom-15 tiles rather than showing sharper ones.
 */
export const SEARCH_STREET_ZOOM = 15

/**
 * T38: a "find a player" result flies here - the map's own maximum (owner's number).
 * Above the pyramid's native levels (15), so 16 and 17 both stretch the zoom-15 tiles
 * rather than showing sharper ones; the owner asked for 17 anyway, close enough to
 * read a single marker clearly without needing a new native render level.
 */
export const SEARCH_PLAYER_ZOOM = 17

interface Props {
  cfg: TilesConfig
  /** T50: the mod-map overlays to draw, in Map= order (first on top): cfg.overlays less
   *  the maps the server does not run (map/followMaps.ts overlaysToDraw). */
  overlays: TileOverlay[]
  tilesBase?: string
  initialView: View
  onViewChange: (v: View) => void
  prefs: LayerPrefs
  ownUsernames: ReadonlySet<string>
  streets: StreetFeature[]
  worldMap: WorldMapFeatures
  areas: AreaFeature[]
  players: PlayerFeature[]
  vehicles: VehicleFeature[]
  /** T72: cars the signed-in viewer is watching for; drawn whether or not the Vehicles layer is on.
   *  `vehicles` never holds them too (vehicleCatalog.ts splitWatched). */
  watched: VehicleFeature[]
  safehouses: RectFeature[]
  npcGroups: NpcGroupFeature[]
  npcOutposts: NpcOutpostFeature[]
  deaths: DeathFeature[]
  zones: ZoneFeature[]
  heat: [number, number, number][]
  objects: ObjectFeature[]
  /** Set by the street search box to recentre the map; consumed once, then left alone. */
  flyTo: { x: number; y: number; zoom: number } | null
  /** T68: drawn ON the map, top left beside the zoom buttons (the map key). It renders
   *  nothing while its toggle is off. */
  overlay?: ReactNode
}

/** Gap between the zoom buttons and the overlay, and between the overlay and the map's edges. */
const OVERLAY_GAP = 10

/**
 * T68: the pane holding the overlay sits inside Leaflet's map pane (so its z-index orders it
 * against markers, tooltips and popups, map/panes.ts), and the map pane is moved on every pan.
 * Moving this pane back by the same amount keeps the overlay still on screen. Leaflet sets the
 * map pane's position and then fires 'move' in the same tick (drag, pan animation, inertia,
 * keyboard pan, setView), so the two never paint apart.
 */
function pinOverlayPane(map: L.Map, pane: HTMLElement): void {
  const mapPane = map.getPane('mapPane')
  if (!mapPane) return
  L.DomUtil.setPosition(pane, L.DomUtil.getPosition(mapPane).multiplyBy(-1))
}

/** Place the overlay just right of the zoom buttons and hand CSS the map's size, so the
 *  overlay's height is capped to the map and its width leaves the map visible. */
function fitOverlayHost(map: L.Map, host: HTMLElement): void {
  const size = map.getSize()
  let left = OVERLAY_GAP
  const zoom = map.zoomControl?.getContainer()
  if (zoom) {
    const c = map.getContainer().getBoundingClientRect()
    const z = zoom.getBoundingClientRect()
    if (z.width > 0) left = Math.round(z.right - c.left) + OVERLAY_GAP
  }
  host.style.left = `${left}px`
  host.style.top = `${OVERLAY_GAP}px`
  host.style.setProperty('--map-w', `${size.x}px`)
  host.style.setProperty('--map-h', `${size.y}px`)
  host.style.setProperty('--key-left', `${left}px`)
}

/** Replace the layer held in `ref`: remove the old one, add the new one if the toggle is on. */
function swap(map: L.Map | null, ref: { current: L.Layer | null }, next: L.Layer | null): void {
  if (!map) return
  if (ref.current) map.removeLayer(ref.current)
  ref.current = next
  if (next) map.addLayer(next)
}

export function MapView(props: Props) {
  const { cfg, overlays, tilesBase, initialView, onViewChange, prefs, ownUsernames, flyTo } = props
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange
  const [zoom, setZoom] = useState(initialView.zoom)
  /** T68: where the overlay is portalled to, inside its own pane; set once the map exists. */
  const [overlayHost, setOverlayHost] = useState<HTMLElement | null>(null)

  const streetsLayer = useRef<L.Layer | null>(null)
  const worldMapLayer = useRef<L.Layer | null>(null)
  const areasLayer = useRef<L.Layer | null>(null)
  const playersLayer = useRef<L.Layer | null>(null)
  const vehiclesLayer = useRef<L.Layer | null>(null)
  const watchedLayer = useRef<L.Layer | null>(null)
  const safehousesLayer = useRef<L.Layer | null>(null)
  const npcGroupsLayer = useRef<L.Layer | null>(null)
  const npcOutpostsLayer = useRef<L.Layer | null>(null)
  const deathsLayer = useRef<L.Layer | null>(null)
  const zonesLayer = useRef<L.Layer | null>(null)
  const heatLayer = useRef<L.Layer | null>(null)
  const zombieDensityLayer = useRef<L.Layer | null>(null)
  const objectsLayer = useRef<L.Layer | null>(null)
  /** T50: the overlay layers on the map, by overlay id, and their ids in Map= order. */
  const overlayLayers = useRef(new Map<string, L.Layer>())
  const overlayOrder = useRef<string[]>([])

  // Create the map once. Tiles, view and the URL callback are set here and never rebuilt.
  useEffect(() => {
    if (!container.current || mapRef.current) return
    const map = L.map(container.current, {
      crs: makeCrs(cfg),
      minZoom: MIN_ZOOM,
      maxZoom: cfg.maxLevel + 2,
      zoomSnap: 0.5,
      maxBounds: worldBounds(cfg),
      maxBoundsViscosity: 0.8,
      attributionControl: false,
    })
    // T41: player markers and their permanent name labels get panes of their own, above
    // every other overlay and its hover text, below only a popup. See ./panes.ts.
    // A-Life NPC markers: above the marker pane (vehicles), below tooltips and every player pane.
    // Death markers: above the marker pane (vehicles), below the NPC groups.
    map.createPane(DEATH_PANE).style.zIndex = String(DEATH_PANE_Z_INDEX)
    map.createPane(NPC_PANE).style.zIndex = String(NPC_PANE_Z_INDEX)
    // T72: watched cars above every other car, deaths and NPC groups; below tooltips and players.
    map.createPane(WATCHED_PANE).style.zIndex = String(WATCHED_PANE_Z_INDEX)
    map.createPane(PLAYERS_PANE).style.zIndex = String(PLAYERS_PANE_Z_INDEX)
    map.createPane(PLAYER_NAMES_PANE).style.zIndex = String(PLAYER_NAMES_PANE_Z_INDEX)
    // T68: the map key overlay. Clicks, drags, double clicks and the wheel over it stay
    // with it (its content scrolls) and never reach the map; anywhere else the map gets them.
    const keyPane = map.createPane(MAP_KEY_PANE)
    keyPane.style.zIndex = String(MAP_KEY_PANE_Z_INDEX)
    const keyHost = L.DomUtil.create('div', 'map-overlay-host', keyPane)
    L.DomEvent.disableClickPropagation(keyHost)
    L.DomEvent.disableScrollPropagation(keyHost)
    // sizedTileLayer (./sizedTileLayer.ts): every tile drawn at its own size, so the
    // pyramid's cut edge tiles are not stretched. The pyramid is sparse, so a 404 is normal.
    sizedTileLayer((coords) => tileUrl(cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase), {
      tileSize: cfg.tileSize,
      minNativeZoom: 0,
      maxNativeZoom: cfg.maxLevel,
      bounds: worldBounds(cfg),
      noWrap: true,
    }).addTo(map)

    map.setView(squareToLatLng({ x: initialView.x, y: initialView.y }), initialView.zoom)
    map.on('moveend', () => {
      const c = latLngToSquare(map.getCenter())
      onViewChangeRef.current({ x: c.x, y: c.y, zoom: map.getZoom() })
    })
    map.on('zoomend', () => setZoom(map.getZoom()))
    map.on('move zoom viewreset moveend zoomend resize', () => pinOverlayPane(map, keyPane))
    map.on('resize', () => fitOverlayHost(map, keyHost))
    pinOverlayPane(map, keyPane)
    fitOverlayHost(map, keyHost)
    setOverlayHost(keyHost)
    mapRef.current = map
    return () => {
      setOverlayHost(null)
      map.remove()
      mapRef.current = null
      // The overlay layers went with the map: forget them, so a new map gets them all.
      overlayLayers.current.clear()
      overlayOrder.current = []
    }
    // The map is created exactly once for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // T45 Part PUBLISH, T50: mod-map overlays share the base pyramid's exact geometry (Part
  // RENDER's all_mod_maps rule), so each is just another TileLayer in the SAME default
  // tile pane as the base layer (no `pane:` override here) - never the vector overlayPane
  // that streets/areas/safehouses use, nor the players panes: an overlay must sit above
  // the base and below every data layer, never cover a street, an area label or a marker.
  // `overlays` is in Map= order, first entry on top; within one pane a later-added layer
  // paints over an earlier one, so reconcileOverlays (./followMaps.ts) hands back the ids
  // to add bottom first - the last Map= entry first, the first entry last. T50: the list
  // follows the server's Map= line, so a map the server stops running is removed and one
  // it starts running is added while the page is open, keeping that order. This effect is
  // declared after the mount-once effect above, so the map exists when it first runs.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const byId = new Map(overlays.map((o) => [o.id, o]))
    const { remove, add } = reconcileOverlays(overlayOrder.current, overlays.map((o) => o.id))
    for (const id of remove) {
      const layer = overlayLayers.current.get(id)
      if (layer) map.removeLayer(layer)
      overlayLayers.current.delete(id)
    }
    for (const id of add) {
      const overlay = byId.get(id)
      if (!overlay) continue
      // A mod pyramid has tiles only where that mod has cells, so the layer is bounded to
      // the box around them (coords.ts overlayBounds): a whole-world bound made every
      // overlay ask for every tile on screen, nearly all 404s. A 404 inside the box (a
      // corner its cells do not fill) is still normal, not an error.
      const bounds = overlayBounds(cfg, overlay)
      if (!bounds) continue
      const layer = sizedTileLayer((coords) => overlayTileUrl(overlay, cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase), {
        tileSize: cfg.tileSize,
        minNativeZoom: 0,
        maxNativeZoom: cfg.maxLevel,
        bounds,
        noWrap: true,
      }).addTo(map)
      overlayLayers.current.set(id, layer)
    }
    overlayOrder.current = overlays.map((o) => o.id).filter((id) => overlayLayers.current.has(id))
  }, [overlays, cfg, tilesBase])

  // Added before every other overlay (first swap effect to run) so it sits beneath
  // markers and the streets layer, the way the in-game map sits beneath both too.
  useEffect(() => {
    swap(mapRef.current, worldMapLayer, prefs.worldMap ? buildWorldMap(props.worldMap) : null)
  }, [prefs.worldMap, props.worldMap])

  useEffect(() => {
    const show = prefs.streets && zoom >= STREETS_MIN_ZOOM
    swap(mapRef.current, streetsLayer, show ? buildStreets(props.streets, zoom, STREETS_MIN_ZOOM, cfg.maxLevel + 2) : null)
  }, [prefs.streets, props.streets, zoom, cfg.maxLevel])

  // Town labels are always shown while the layer is on (readable even zoomed out, per
  // the task); landmark labels are held back below STREETS_MIN_ZOOM the same way
  // streets themselves are, so a low zoom isn't crowded by 17 small POI names.
  useEffect(() => {
    // Rebuilt on every zoom: label placement (vanilla first, mod names step aside) is
    // worked out in screen pixels, which change with the zoom.
    const map = mapRef.current
    swap(
      map,
      areasLayer,
      prefs.areas && map
        ? buildAreas(props.areas, zoom, STREETS_MIN_ZOOM, (latlng) => map.project(latlng, zoom), measureAreaLabel)
        : null,
    )
  }, [prefs.areas, props.areas, zoom])

  useEffect(() => {
    swap(mapRef.current, playersLayer, prefs.players ? buildPlayers(props.players, ownUsernames) : null)
  }, [prefs.players, props.players, ownUsernames])

  useEffect(() => {
    swap(mapRef.current, vehiclesLayer, prefs.vehicles ? buildVehicles(props.vehicles) : null)
  }, [prefs.vehicles, props.vehicles])

  // T72: not a user toggle. It exists while the account watches a car that is on the map.
  useEffect(() => {
    swap(mapRef.current, watchedLayer, props.watched.length > 0 ? buildWatchedVehicles(props.watched) : null)
  }, [props.watched])

  useEffect(() => {
    swap(mapRef.current, safehousesLayer, prefs.safehouses ? buildSafehouses(props.safehouses) : null)
  }, [prefs.safehouses, props.safehouses])

  useEffect(() => {
    swap(mapRef.current, npcOutpostsLayer, prefs.npcOutposts ? buildNpcOutposts(props.npcOutposts) : null)
  }, [prefs.npcOutposts, props.npcOutposts])

  useEffect(() => {
    swap(mapRef.current, deathsLayer, prefs.deaths ? buildDeaths(props.deaths) : null)
  }, [prefs.deaths, props.deaths])

  useEffect(() => {
    swap(mapRef.current, npcGroupsLayer, prefs.npcGroups ? buildNpcGroups(props.npcGroups) : null)
  }, [prefs.npcGroups, props.npcGroups])

  useEffect(() => {
    swap(mapRef.current, zonesLayer, prefs.zones ? buildZones(props.zones) : null)
  }, [prefs.zones, props.zones])

  useEffect(() => {
    swap(mapRef.current, heatLayer, prefs.zombieHeat ? buildHeat(props.heat) : null)
  }, [prefs.zombieHeat, props.heat])

  // A second, independent tile layer (static spawn density) - toggled and swapped the
  // same way as the live zombieHeat layer above, but it never depends on `props.heat`.
  useEffect(() => {
    swap(mapRef.current, zombieDensityLayer, prefs.zombieDensity ? buildZombieDensityLayer(cfg, tilesBase) : null)
  }, [prefs.zombieDensity, cfg, tilesBase])

  useEffect(() => {
    swap(mapRef.current, objectsLayer, prefs.mapObjects ? buildObjects(props.objects) : null)
  }, [prefs.mapObjects, props.objects])

  // The search box passes a new object on every selection (even re-picking the same
  // street), so React's own dependency check is exactly the "did this change" test needed.
  useEffect(() => {
    if (!mapRef.current || !flyTo) return
    mapRef.current.setView(squareToLatLng({ x: flyTo.x, y: flyTo.y }), flyTo.zoom)
  }, [flyTo])

  return (
    <>
      <div
        ref={container}
        className="aurora-map"
        role="application"
        aria-label="Server map. Use the roster panel for a text list of players."
      />
      {overlayHost && props.overlay ? createPortal(props.overlay, overlayHost) : null}
    </>
  )
}
