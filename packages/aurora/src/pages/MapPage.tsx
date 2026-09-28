import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getAurora } from '../lib/supabase'
import { MapView, MIN_ZOOM } from '../map/MapView'
import type { TilesConfig } from '../map/tiles'
import { parseView, writeView } from '../state/url'
import type { MapView as View } from '../state/url'
import { loadLayerPrefs, saveLayerPrefs } from '../state/layerPrefs'
import type { LayerKey, LayerPrefs } from '../state/layerPrefs'
import { useDataset } from '../data/useDataset'
import {
  fetchLatestHealth,
  fetchHealthSince,
  fetchMapObjects,
  fetchMyLinkCodes,
  fetchPlayerProfiles,
  fetchPositions,
  fetchSafehouses,
  fetchVehicles,
  fetchVisibility,
  fetchZombieGrid,
  fetchZones,
} from '../data/queries'
import { subscribeAurora } from '../data/realtime'
import type { RealtimeState } from '../data/realtime'
import { appendSample, newest } from '../data/health'
import type { HealthSample } from '../data/types'
import {
  heatPoints,
  objectFeatures,
  playerFeatures,
  safehouseFeatures,
  vehicleFeatures,
  zoneFeatures,
} from '../layers/transform'
import { HealthPanel } from '../panels/Health'
import { RosterPanel } from '../panels/Roster'
import { LayerToggles } from '../panels/LayerToggles'

const DEFAULT_VIEW: View = { x: 10770, y: 10271, zoom: 9 }
const HEALTH_WINDOW_MINUTES = 60

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
  const { cfg, error: cfgError } = useTilesConfig()

  const [prefs, setPrefs] = useState<LayerPrefs>(() => loadLayerPrefs())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [rt, setRt] = useState<RealtimeState>('connecting')
  const [now, setNow] = useState(() => Date.now())

  const profiles = useDataset(true, () => fetchPlayerProfiles(client, serverId), 30_000)
  const positions = useDataset(true, () => fetchPositions(client, serverId), 30_000)
  const vehicles = useDataset(prefs.vehicles, () => fetchVehicles(client, serverId), 60_000)
  const safehouses = useDataset(prefs.safehouses, () => fetchSafehouses(client, serverId), 60_000)
  const zones = useDataset(prefs.zones, () => fetchZones(client, serverId), 300_000)
  const grid = useDataset(prefs.zombieHeat, () => fetchZombieGrid(client, serverId), 60_000)
  const objects = useDataset(prefs.mapObjects, () => fetchMapObjects(client, serverId), 300_000)
  const visibility = useDataset(true, async () => {
    const v = await fetchVisibility(client)
    return v ? [v] : []
  }, null)
  const myCodes = useDataset(user !== null, () => fetchMyLinkCodes(client), 60_000)
  const healthSince = useDataset(true, () => fetchHealthSince(client, serverId, HEALTH_WINDOW_MINUTES), 60_000)
  const healthLatest = useDataset(true, async () => {
    const l = await fetchLatestHealth(client, serverId)
    return l ? [l] : []
  }, 60_000)
  const [live, setLive] = useState<HealthSample[]>([])

  // What the caller may see depends on who they are, so reload when they sign in or out.
  const uid = user?.id ?? null
  useEffect(() => {
    positions.refresh()
    vehicles.refresh()
    // refresh functions are stable; only the identity change should trigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Realtime: only says "something changed"; the database decides what this caller may see.
  const vehiclesOnRef = useRef(prefs.vehicles)
  vehiclesOnRef.current = prefs.vehicles
  const refreshPositions = positions.refresh
  const refreshVehicles = vehicles.refresh
  useEffect(() => {
    return subscribeAurora(client, serverId, {
      onPositionsChanged: refreshPositions,
      onVehiclesChanged: () => {
        if (vehiclesOnRef.current) refreshVehicles()
      },
      onHealthSample: (row) => setLive((prev) => appendSample(prev, row, HEALTH_WINDOW_MINUTES)),
      onState: setRt,
    })
  }, [client, serverId, refreshPositions, refreshVehicles])

  // Tick once a minute so "reported N min ago" stays honest without a new sample.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const samples = useMemo(
    () => live.reduce((acc, row) => appendSample(acc, row, HEALTH_WINDOW_MINUTES, now), healthSince.data),
    [healthSince.data, live, now],
  )
  const latest = useMemo(
    () => newest(healthLatest.data[0] ?? null, live.length ? live[live.length - 1] : null),
    [healthLatest.data, live],
  )

  const own = useMemo(
    () => new Set(myCodes.data.filter((c) => c.consumed_at && c.username).map((c) => c.username as string)),
    [myCodes.data],
  )

  const players = useMemo(() => playerFeatures(positions.data, profiles.data), [positions.data, profiles.data])
  const vehicleList = useMemo(() => vehicleFeatures(vehicles.data), [vehicles.data])
  const safehouseList = useMemo(() => safehouseFeatures(safehouses.data), [safehouses.data])
  const zoneList = useMemo(() => zoneFeatures(zones.data), [zones.data])
  const objectList = useMemo(() => objectFeatures(objects.data), [objects.data])
  const heat = useMemo(() => (cfg ? heatPoints(grid.data, cfg) : []), [grid.data, cfg])

  const setLayer = useCallback((key: LayerKey, on: boolean) => {
    setPrefs((p) => {
      const next = { ...p, [key]: on }
      saveLayerPrefs(next)
      return next
    })
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

  const vis = visibility.data[0]
  const notes: Partial<Record<LayerKey, string>> = {
    players: !user && positions.data.length === 0
      ? 'Sign in to see approximate player positions.'
      : vis
        ? `Other players are shown about ${vis.delayMinutes} minutes late${vis.roundToCell ? ' and rounded to a map cell' : ''}. Your own and safehouse members show live.`
        : undefined,
    vehicles: !user ? 'Sign in to see vehicles.' : vehicles.error ? vehicles.error : vehicles.data.length === 0 ? 'None visible to you right now.' : undefined,
    safehouses: safehouses.error ?? undefined,
    zones: zones.error ?? undefined,
    zombieHeat: grid.error ?? (grid.data.length === 0 ? 'No zombie counts reported yet.' : undefined),
    mapObjects: objects.error ?? (objects.data.length === 0 ? 'No map objects reported yet.' : undefined),
  }

  if (cfgError) return <p className="page-note error" role="alert">Could not load the map settings. {cfgError}</p>
  if (!cfg || !initialView) return <p className="page-note" role="status">Loading map...</p>

  const rtText = rt === 'live' ? 'Live updates on' : rt === 'connecting' ? 'Connecting to live updates' : 'Live updates paused; refreshing every 30 seconds'

  return (
    <div className="aurora-shell">
      <MapView
        cfg={cfg}
        tilesBase={config.tilesBaseUrl}
        initialView={initialView}
        onViewChange={onViewChange}
        prefs={prefs}
        ownUsernames={own}
        players={players}
        vehicles={vehicleList}
        safehouses={safehouseList}
        zones={zoneList}
        heat={heat}
        objects={objectList}
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
        <p className="rt-status" role="status">{rtText}</p>
        <RosterPanel profiles={profiles.data} error={profiles.error} />
        <HealthPanel latest={latest} samples={samples} error={healthLatest.error ?? healthSince.error} now={now} />
        <LayerToggles prefs={prefs} onChange={setLayer} notes={notes} />
      </aside>
    </div>
  )
}
