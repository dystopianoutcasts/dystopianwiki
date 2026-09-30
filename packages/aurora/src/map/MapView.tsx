import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { TilesConfig } from './tiles'
import { overlayTileUrl, tileUrl } from './tiles'
import { sizedTileLayer } from './sizedTileLayer'
import { latLngToSquare, squareToLatLng, worldBounds } from './coords'
import { makeCrs } from './crs'
import type { MapView as View } from '../state/url'
import type { LayerPrefs } from '../state/layerPrefs'
import {
  buildAreas,
  buildHeat,
  buildObjects,
  buildPlayers,
  buildSafehouses,
  buildStreets,
  buildVehicles,
  buildWorldMap,
  buildZombieDensityLayer,
  buildZones,
} from '../layers/build'
import type {
  AreaFeature,
  ObjectFeature,
  PlayerFeature,
  RectFeature,
  StreetFeature,
  VehicleFeature,
  WorldMapFeatures,
  ZoneFeature,
} from '../layers/transform'
import { PLAYERS_PANE, PLAYERS_PANE_Z_INDEX, PLAYER_NAMES_PANE, PLAYER_NAMES_PANE_Z_INDEX } from './panes'

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
  safehouses: RectFeature[]
  zones: ZoneFeature[]
  heat: [number, number, number][]
  objects: ObjectFeature[]
  /** Set by the street search box to recentre the map; consumed once, then left alone. */
  flyTo: { x: number; y: number; zoom: number } | null
}

/** Replace the layer held in `ref`: remove the old one, add the new one if the toggle is on. */
function swap(map: L.Map | null, ref: { current: L.Layer | null }, next: L.Layer | null): void {
  if (!map) return
  if (ref.current) map.removeLayer(ref.current)
  ref.current = next
  if (next) map.addLayer(next)
}

export function MapView(props: Props) {
  const { cfg, tilesBase, initialView, onViewChange, prefs, ownUsernames, flyTo } = props
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange
  const [zoom, setZoom] = useState(initialView.zoom)

  const streetsLayer = useRef<L.Layer | null>(null)
  const worldMapLayer = useRef<L.Layer | null>(null)
  const areasLayer = useRef<L.Layer | null>(null)
  const playersLayer = useRef<L.Layer | null>(null)
  const vehiclesLayer = useRef<L.Layer | null>(null)
  const safehousesLayer = useRef<L.Layer | null>(null)
  const zonesLayer = useRef<L.Layer | null>(null)
  const heatLayer = useRef<L.Layer | null>(null)
  const zombieDensityLayer = useRef<L.Layer | null>(null)
  const objectsLayer = useRef<L.Layer | null>(null)

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
    map.createPane(PLAYERS_PANE).style.zIndex = String(PLAYERS_PANE_Z_INDEX)
    map.createPane(PLAYER_NAMES_PANE).style.zIndex = String(PLAYER_NAMES_PANE_Z_INDEX)
    // sizedTileLayer (./sizedTileLayer.ts): every tile drawn at its own size, so the
    // pyramid's cut edge tiles are not stretched. The pyramid is sparse, so a 404 is normal.
    sizedTileLayer((coords) => tileUrl(cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase), {
      tileSize: cfg.tileSize,
      minNativeZoom: 0,
      maxNativeZoom: cfg.maxLevel,
      bounds: worldBounds(cfg),
      noWrap: true,
    }).addTo(map)

    // T45 Part PUBLISH: mod-map overlays share the base pyramid's exact geometry (Part
    // RENDER's all_mod_maps rule), so each is just another TileLayer in the SAME default
    // tile pane as the base layer above (no `pane:` override here) - never the vector
    // overlayPane that streets/areas/safehouses use, nor the players panes: an overlay
    // must sit above the base and below every data layer, never cover a street, an area
    // label or a marker. cfg.overlays is in Map= order, first entry on top; within one
    // pane a later-added DOM node paints over an earlier one, so overlays are added in
    // REVERSE list order - the last entry first, the first entry last - so the first
    // entry (the Map= winner) ends up painted on top of the rest.
    const overlays = cfg.overlays ?? []
    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i]
      // Sparse the same way the base layer is: a mod pyramid has tiles only where that
      // mod has cells, so a 404 elsewhere is normal, not an error.
      sizedTileLayer((coords) => overlayTileUrl(overlay, cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase), {
        tileSize: cfg.tileSize,
        minNativeZoom: 0,
        maxNativeZoom: cfg.maxLevel,
        bounds: worldBounds(cfg),
        noWrap: true,
      }).addTo(map)
    }

    map.setView(squareToLatLng({ x: initialView.x, y: initialView.y }), initialView.zoom)
    map.on('moveend', () => {
      const c = latLngToSquare(map.getCenter())
      onViewChangeRef.current({ x: c.x, y: c.y, zoom: map.getZoom() })
    })
    map.on('zoomend', () => setZoom(map.getZoom()))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // The map is created exactly once for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    swap(mapRef.current, areasLayer, prefs.areas ? buildAreas(props.areas, zoom, STREETS_MIN_ZOOM) : null)
  }, [prefs.areas, props.areas, zoom])

  useEffect(() => {
    swap(mapRef.current, playersLayer, prefs.players ? buildPlayers(props.players, ownUsernames) : null)
  }, [prefs.players, props.players, ownUsernames])

  useEffect(() => {
    swap(mapRef.current, vehiclesLayer, prefs.vehicles ? buildVehicles(props.vehicles) : null)
  }, [prefs.vehicles, props.vehicles])

  useEffect(() => {
    swap(mapRef.current, safehousesLayer, prefs.safehouses ? buildSafehouses(props.safehouses) : null)
  }, [prefs.safehouses, props.safehouses])

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
    <div
      ref={container}
      className="aurora-map"
      role="application"
      aria-label="Server map. Use the roster panel for a text list of players."
    />
  )
}
