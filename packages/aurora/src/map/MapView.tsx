import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { TilesConfig } from './tiles'
import { tileUrl } from './tiles'
import { latLngToSquare, squareToLatLng, worldBounds } from './coords'
import { makeCrs } from './crs'
import type { MapView as View } from '../state/url'
import type { LayerPrefs } from '../state/layerPrefs'
import { buildHeat, buildObjects, buildPlayers, buildSafehouses, buildVehicles, buildZones } from '../layers/build'
import type { ObjectFeature, PlayerFeature, RectFeature, VehicleFeature, ZoneFeature } from '../layers/transform'

/** Zoom below this shows the whole 19968-square world smaller than a phone screen. */
export const MIN_ZOOM = 3

interface Props {
  cfg: TilesConfig
  tilesBase?: string
  initialView: View
  onViewChange: (v: View) => void
  prefs: LayerPrefs
  ownUsernames: ReadonlySet<string>
  players: PlayerFeature[]
  vehicles: VehicleFeature[]
  safehouses: RectFeature[]
  zones: ZoneFeature[]
  heat: [number, number, number][]
  objects: ObjectFeature[]
}

/** Replace the layer held in `ref`: remove the old one, add the new one if the toggle is on. */
function swap(map: L.Map | null, ref: { current: L.Layer | null }, next: L.Layer | null): void {
  if (!map) return
  if (ref.current) map.removeLayer(ref.current)
  ref.current = next
  if (next) map.addLayer(next)
}

export function MapView(props: Props) {
  const { cfg, tilesBase, initialView, onViewChange, prefs, ownUsernames } = props
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange

  const playersLayer = useRef<L.Layer | null>(null)
  const vehiclesLayer = useRef<L.Layer | null>(null)
  const safehousesLayer = useRef<L.Layer | null>(null)
  const zonesLayer = useRef<L.Layer | null>(null)
  const heatLayer = useRef<L.Layer | null>(null)
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
    const Layer = L.TileLayer.extend({
      getTileUrl(coords: L.Coords) {
        return tileUrl(cfg, cfg.layers.ground, coords.z, coords.x, coords.y, tilesBase)
      },
    })
    // The pyramid is sparse (only populated cells have tiles), so a 404 is normal, not an error.
    new (Layer as unknown as new (u: string, o: L.TileLayerOptions) => L.TileLayer)('', {
      tileSize: cfg.tileSize,
      minNativeZoom: 0,
      maxNativeZoom: cfg.maxLevel,
      bounds: worldBounds(cfg),
      noWrap: true,
      errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    }).addTo(map)

    map.setView(squareToLatLng({ x: initialView.x, y: initialView.y }), initialView.zoom)
    map.on('moveend', () => {
      const c = latLngToSquare(map.getCenter())
      onViewChangeRef.current({ x: c.x, y: c.y, zoom: map.getZoom() })
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // The map is created exactly once for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEffect(() => {
    swap(mapRef.current, objectsLayer, prefs.mapObjects ? buildObjects(props.objects) : null)
  }, [prefs.mapObjects, props.objects])

  return (
    <div
      ref={container}
      className="aurora-map"
      role="application"
      aria-label="Server map. Use the roster panel for a text list of players."
    />
  )
}
