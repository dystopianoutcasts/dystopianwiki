import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useIsAdmin } from '../auth/useIsAdmin'
import { getAurora } from '../lib/supabase'
import { MapView, MIN_ZOOM } from '../map/MapView'
import type { TilesConfig } from '../map/tiles'
import { parseView, writeView } from '../state/url'
import type { MapView as View } from '../state/url'
import { loadLayerPrefs, saveLayerPrefs } from '../state/layerPrefs'
import type { LayerKey } from '../state/layerPrefs'
import { loadNameMode, saveNameMode } from '../state/nameMode'
import type { NameMode } from '../state/nameMode'
import { useAuroraData } from '../data/useAuroraData'
import { useServerMaps } from '../data/serverMaps'
import { allowedMapIds, filterByServerMaps, mapsWithoutTiles, overlaysToDraw } from '../map/followMaps'
import {
  areaFeatures,
  findablePlayers,
  heatPoints,
  objectFeatures,
  playerFeatures,
  deathFeatures,
  npcGroupFeatures,
  npcOutpostFeatures,
  safehouseFeatures,
  streetFeatures,
  vehicleFeatures,
  worldMapFeatures,
  zoneFeatures,
} from '../layers/transform'
import type { AreaRaw, StreetRaw, WorldMapRaw } from '../layers/transform'
import { HealthPanel } from '../panels/Health'
import { RosterPanel } from '../panels/Roster'
import { NameModeToggle } from '../panels/NameModeToggle'
import { LayerToggles } from '../panels/LayerToggles'
import { StreetSearch } from '../panels/StreetSearch'
import { FindPlayer } from '../panels/FindPlayer'
import { MapNotices } from '../panels/MapNotices'
import { LINK_FEATURE_ENABLED } from '../config'
import { playersNote } from './playersNote'
import { SEARCH_STREET_ZOOM, SEARCH_PLAYER_ZOOM } from '../map/MapView'

// Rosewood (public/data/areas.json: x 8350, y 11750) at zoom 15, one pixel per square:
// the owner's opening view (T39). A position in the link (?x=&y=&zoom=) still wins.
const DEFAULT_VIEW: View = { x: 8350, y: 11750, zoom: 15 }

function useStreets(): { streets: StreetRaw[]; error: string | null } {
  const [streets, setStreets] = useState<StreetRaw[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/streets.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`streets.json: HTTP ${r.status}`)
        return r.json() as Promise<StreetRaw[]>
      })
      .then((j) => !cancelled && setStreets(j))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      cancelled = true
    }
  }, [])
  return { streets, error }
}

/** Small and always useful (2.3 KB, 26 rows), so it is fetched unconditionally on load -
 * the same choice as streets.json, not the lazy-on-toggle one worldmap.json needs at 3.7 MB. */
function useAreas(): { areas: AreaRaw[]; error: string | null } {
  const [areas, setAreas] = useState<AreaRaw[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/areas.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`areas.json: HTTP ${r.status}`)
        return r.json() as Promise<AreaRaw[]>
      })
      .then((j) => !cancelled && setAreas(j))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      cancelled = true
    }
  }, [])
  return { areas, error }
}

const EMPTY_WORLD_MAP: WorldMapRaw = { roads: [], buildings: [], water: [], forest: [] }

/**
 * Fetched only once the layer is switched on: it is off by default and, at about 3.7 MB,
 * downloading it for every visitor regardless would work against the very reason the
 * public map polls instead of subscribing (T19) - cost should scale with who actually
 * wants it, not with every page load.
 */
function useWorldMap(enabled: boolean): { worldMap: WorldMapRaw; error: string | null } {
  const [worldMap, setWorldMap] = useState<WorldMapRaw>(EMPTY_WORLD_MAP)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)
  useEffect(() => {
    if (!enabled || fetchedRef.current) return
    fetchedRef.current = true
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/worldmap.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`worldmap.json: HTTP ${r.status}`)
        return r.json() as Promise<WorldMapRaw>
      })
      .then((j) => !cancelled && setWorldMap(j))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      cancelled = true
    }
  }, [enabled])
  return { worldMap, error }
}

function useTilesConfig(): { cfg: TilesConfig | null; error: string | null } {
  const [cfg, setCfg] = useState<TilesConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}tiles.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`tiles.json: HTTP ${r.status}`)
        return r.json() as Promise<TilesConfig>
      })
      .then((j) => !cancelled && setCfg(j))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      cancelled = true
    }
  }, [])
  return { cfg, error }
}

export function MapPage() {
  const { client, config } = getAurora()
  const serverId = config.serverId
  const { user } = useAuth()
  const isAdmin = useIsAdmin(client, user)
  const { cfg, error: cfgError } = useTilesConfig()
  const { streets: rawStreets, error: streetsError } = useStreets()
  const { areas: rawAreas, error: areasError } = useAreas()

  const [prefs, setPrefs] = useState(() => loadLayerPrefs())
  const [nameMode, setNameMode] = useState<NameMode>(() => loadNameMode())
  const { worldMap: rawWorldMap, error: worldMapError } = useWorldMap(prefs.worldMap)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [flyTo, setFlyTo] = useState<{ x: number; y: number; zoom: number } | null>(null)

  const {
    profiles,
    positions,
    vehicles,
    vehicleNames,
    safehouses,
    npcGroups,
    npcOutposts,
    deaths,
    zones,
    grid,
    objects,
    visibility,
    healthError,
    samples,
    latest,
    own,
    now,
    statusText,
  } = useAuroraData(client, serverId, prefs, user, isAdmin)

  // T50: only the maps the server runs. Unknown list (no migration 033 yet): everything,
  // as before. Streets, areas and world-map shapes of other maps are dropped before any
  // layer or the street search sees them.
  const serverMaps = useServerMaps(client, serverId, isAdmin)
  const allowed = useMemo(() => allowedMapIds(serverMaps.list), [serverMaps.list])
  const shown = useMemo(
    () => filterByServerMaps({ streets: rawStreets, areas: rawAreas, worldMap: rawWorldMap }, allowed),
    [rawStreets, rawAreas, rawWorldMap, allowed],
  )
  const overlays = useMemo(() => overlaysToDraw(cfg?.overlays ?? [], allowed), [cfg, allowed])
  // Admins only, and only from a list read without error: a notice never comes from a guess.
  const noTiles = useMemo(
    () => (isAdmin && serverMaps.error === null ? mapsWithoutTiles(serverMaps.list, cfg?.overlays ?? []) : []),
    [isAdmin, serverMaps.error, serverMaps.list, cfg],
  )

  const streets = useMemo(() => streetFeatures(shown.streets), [shown.streets])
  const worldMap = useMemo(() => worldMapFeatures(shown.worldMap), [shown.worldMap])
  const areas = useMemo(() => areaFeatures(shown.areas), [shown.areas])
  const players = useMemo(() => playerFeatures(positions.data, profiles.data, nameMode), [positions.data, profiles.data, nameMode])
  const findable = useMemo(() => findablePlayers(positions.data, profiles.data, nameMode), [positions.data, profiles.data, nameMode])
  const vehicleList = useMemo(() => vehicleFeatures(vehicles.data, profiles.data, nameMode, vehicleNames), [vehicles.data, profiles.data, nameMode, vehicleNames])
  const safehouseList = useMemo(() => safehouseFeatures(safehouses.data, profiles.data, nameMode), [safehouses.data, profiles.data, nameMode])
  const npcGroupList = useMemo(() => npcGroupFeatures(npcGroups.data), [npcGroups.data])
  const npcOutpostList = useMemo(() => npcOutpostFeatures(npcOutposts.data), [npcOutposts.data])
  const deathList = useMemo(() => deathFeatures(deaths.data, profiles.data, nameMode, isAdmin, now), [deaths.data, profiles.data, nameMode, isAdmin, now])
  const zoneList = useMemo(() => zoneFeatures(zones.data), [zones.data])
  const objectList = useMemo(() => objectFeatures(objects.data), [objects.data])
  const heat = useMemo(() => (cfg ? heatPoints(grid.data, cfg, now) : []), [grid.data, cfg, now])

  const setLayer = useCallback((key: LayerKey, on: boolean) => {
    setPrefs((p) => {
      const next = { ...p, [key]: on }
      saveLayerPrefs(next)
      return next
    })
  }, [])

  const onNameModeChange = useCallback((mode: NameMode) => {
    saveNameMode(mode)
    setNameMode(mode)
  }, [])

  const initialView = useMemo<View | null>(() => {
    if (!cfg) return null
    return parseView(window.location.search, DEFAULT_VIEW, {
      minX: cfg.originSquare.x,
      maxX: cfg.originSquare.x + cfg.world.squares.w,
      minY: cfg.originSquare.y,
      maxY: cfg.originSquare.y + cfg.world.squares.h,
      minZoom: MIN_ZOOM,
      maxZoom: cfg.maxLevel + 2,
    })
  }, [cfg])

  const onViewChange = useCallback((v: View) => {
    const search = writeView(window.location.search, v)
    window.history.replaceState(null, '', `${window.location.pathname}?${search}`)
  }, [])

  // `center` (extract-streets.ts, T42) is a point ON the road near its middle, not an
  // end of it - unlike the old `latlngs[0]`, which was always the first vertex of the
  // first piece. SEARCH_STREET_ZOOM is a fixed, comfortable zoom rather than the
  // current one: a search result should always land close enough to read the street,
  // whether the visitor started zoomed out or in.
  const onSelectStreet = useCallback((s: { center: [number, number] }) => {
    const [x, y] = s.center
    setFlyTo({ x, y, zoom: SEARCH_STREET_ZOOM })
  }, [])

  const vis = visibility.data[0]
  const notes: Partial<Record<LayerKey, string>> = {
    streets: streetsError ?? undefined,
    worldMap: worldMapError ?? undefined,
    areas: areasError ?? (areas.length === 0 ? 'No named areas loaded.' : undefined),
    players: playersNote({ signedIn: !!user, positionCount: positions.data.length, vis, linkEnabled: LINK_FEATURE_ENABLED }),
    vehicles: vehicles.error ? vehicles.error : vehicles.data.length === 0 ? 'None visible to you right now.' : undefined,
    safehouses: safehouses.error ?? undefined,
    deaths: deaths.error ?? undefined,
    zones: zones.error ?? undefined,
    zombieHeat: grid.error ?? (grid.data.length === 0 ? 'No zombie counts reported yet.' : undefined),
    mapObjects: objects.error ?? (objects.data.length === 0 ? 'No map objects reported yet.' : undefined),
  }

  if (cfgError) return <p className="page-note error" role="alert">Could not load the map settings. {cfgError}</p>
  if (!cfg || !initialView) return <p className="page-note" role="status">Loading map...</p>

  return (
    <div className="aurora-shell">
      <MapView
        cfg={cfg}
        overlays={overlays}
        tilesBase={config.tilesBaseUrl}
        initialView={initialView}
        onViewChange={onViewChange}
        prefs={prefs}
        ownUsernames={own}
        streets={streets}
        worldMap={worldMap}
        areas={areas}
        players={players}
        vehicles={vehicleList}
        safehouses={safehouseList}
        npcGroups={npcGroupList}
        npcOutposts={npcOutpostList}
        deaths={deathList}
        zones={zoneList}
        heat={heat}
        objects={objectList}
        flyTo={flyTo}
      />
      <button
        type="button"
        className="sheet-toggle"
        aria-expanded={sheetOpen}
        aria-controls="aurora-side"
        onClick={() => setSheetOpen((o) => !o)}
      >
        {sheetOpen ? 'Hide panels' : 'Show panels'}
      </button>
      <aside id="aurora-side" className={sheetOpen ? 'aurora-side open' : 'aurora-side'} aria-label="Server information">
        <div className="side-head">
          <span className="brand">Live Map</span>
        </div>
        <p className="rt-status" role="status">{statusText}</p>
        <NameModeToggle mode={nameMode} onChange={onNameModeChange} />
        <StreetSearch streets={streets} onSelect={onSelectStreet} />
        <FindPlayer players={findable} onSelect={(pos) => setFlyTo({ x: pos.x, y: pos.y, zoom: SEARCH_PLAYER_ZOOM })} />
        <RosterPanel profiles={profiles.data} error={profiles.error} mode={nameMode} />
        {isAdmin ? <HealthPanel latest={latest} samples={samples} error={healthError} now={now} /> : null}
        {isAdmin ? <MapNotices noTiles={noTiles} pendingWorld={serverMaps.pendingWorld} /> : null}
        <LayerToggles prefs={prefs} onChange={setLayer} notes={notes} />
      </aside>
    </div>
  )
}
