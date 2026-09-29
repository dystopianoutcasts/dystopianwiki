// All of the map's data: what to fetch, how often, and the small amount of
// client-side shaping (the health window, "updated HH:MM:SS") that isn't a database
// query. No realtime channel is opened here (T19): polling costs REST's per-byte
// price instead of realtime's per-row-times-viewer price. Since T23 the ingest writes
// a batch every ~5 s, so the live datasets (positions, roster, vehicles, health) poll
// every LIVE_POLL_MS, incrementally, with a full fetch every INGEST_INTERVAL_MS.
import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { INGEST_INTERVAL_MS, LIVE_POLL_MS, SLOW_POLL_MS, VERY_SLOW_POLL_MS, LINK_FEATURE_ENABLED } from '../config'
import { useDataset } from './useDataset'
import { useLiveDataset } from './useLiveDataset'
import { newestT } from './live'
import {
  fetchHealthAfter,
  fetchHealthSince,
  fetchLatestHealth,
  fetchMapObjects,
  fetchMyLinkCodes,
  fetchPlayerProfiles,
  fetchPositions,
  fetchSafehouses,
  fetchVehicles,
  fetchVisibility,
  fetchZombieGrid,
  fetchZones,
} from './queries'
import { appendSample } from './health'
import type { LayerPrefs } from '../state/layerPrefs'

// T22 Part D item 5: the panel now lets the visitor pick a 10 min / 1 h / 6 h display
// window (Health.tsx), so the data actually held has to cover the widest of the three -
// the full fetch pulls 6 h and appendSample's own trim uses the same figure; picking a
// narrower window is then just Health.tsx plotting a subset of what is already held,
// with no extra fetch. HealthWindowMinutes is a subset of numbers a plain `number`
// widens to fine here - the constant only ever needs to be the single largest option.
const HEALTH_WINDOW_MINUTES = 360

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function useAuroraData(client: SupabaseClient, serverId: string, prefs: LayerPrefs, user: User | null) {
  const [now, setNow] = useState(() => Date.now())
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const live = { liveMs: LIVE_POLL_MS, fullMs: INGEST_INTERVAL_MS }
  const profiles = useLiveDataset({
    enabled: true,
    fetchFull: () => fetchPlayerProfiles(client, serverId),
    fetchSince: (since) => fetchPlayerProfiles(client, serverId, since),
    keyOf: (p) => p.username,
    tOf: (p) => p.last_seen,
    ...live,
  })
  const positions = useLiveDataset({
    enabled: true,
    fetchFull: () => fetchPositions(client, serverId),
    fetchSince: (since) => fetchPositions(client, serverId, since),
    keyOf: (p) => p.username,
    tOf: (p) => p.t,
    ...live,
  })
  // Vehicles are readable only when signed in (RLS: authenticated); an anonymous
  // request is refused, and the panel already says "Sign in to see vehicles.", so an
  // anonymous viewer does not ask at all.
  const vehicles = useLiveDataset({
    enabled: prefs.vehicles && user !== null,
    fetchFull: () => fetchVehicles(client, serverId),
    fetchSince: (since) => fetchVehicles(client, serverId, since),
    keyOf: (v) => String(v.vehicle_id),
    tOf: (v) => v.t,
    ...live,
  })
  const safehouses = useDataset(prefs.safehouses, () => fetchSafehouses(client, serverId), SLOW_POLL_MS)
  const zones = useDataset(prefs.zones, () => fetchZones(client, serverId), VERY_SLOW_POLL_MS)
  // The zombie grid changes once a minute (the exporter's zgrid cadence), so it stays at the ingest interval.
  const grid = useDataset(prefs.zombieHeat, () => fetchZombieGrid(client, serverId), INGEST_INTERVAL_MS)
  const objects = useDataset(prefs.mapObjects, () => fetchMapObjects(client, serverId), VERY_SLOW_POLL_MS)
  const visibility = useDataset(
    true,
    async () => {
      const v = await fetchVisibility(client)
      return v ? [v] : []
    },
    null,
  )
  // Dormant with the link feature (T21): no linked characters can exist, so a signed-in
  // viewer polling link_codes every minute would only ever read nothing.
  const myCodes = useDataset(LINK_FEATURE_ENABLED && user !== null, () => fetchMyLinkCodes(client), INGEST_INTERVAL_MS)
  const healthSince = useLiveDataset({
    enabled: true,
    fetchFull: () => fetchHealthSince(client, serverId, HEALTH_WINDOW_MINUTES),
    fetchSince: (since) => fetchHealthAfter(client, serverId, since),
    keyOf: (s) => s.t,
    tOf: (s) => s.t,
    // Samples are only ever appended, so after the load there is nothing to self-heal;
    // the window trim happens client-side in appendSample.
    liveMs: LIVE_POLL_MS,
    fullMs: null,
  })
  // Only for "last report N minutes ago" once the series is empty; the series' own
  // newest sample supersedes it whenever it is newer (below), so this stays at 60 s.
  const healthLatest = useDataset(
    true,
    async () => {
      const l = await fetchLatestHealth(client, serverId)
      return l ? [l] : []
    },
    INGEST_INTERVAL_MS,
  )

  // What the caller may see depends on who they are, so reload when they sign in or out.
  const uid = user?.id ?? null
  useEffect(() => {
    positions.refresh()
    vehicles.refresh()
    // refresh functions are stable; only the identity change should trigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Health series: filled entirely by polling health_samples (no push events). The
  // full fetch returns the whole window and each delta appends to it, so the held rows
  // only ever grow between full fetches; `appendSample` orders them and trims what
  // has slid out of the window.
  const samples = useMemo(
    () => healthSince.data.reduce((acc, row) => appendSample(acc, row, HEALTH_WINDOW_MINUTES, now), [] as typeof healthSince.data),
    [healthSince.data, now],
  )
  const latest = useMemo(() => {
    const candidates = [samples.at(-1), healthLatest.data[0]].filter((s) => s !== undefined)
    const t = newestT(candidates, (s) => s.t)
    return candidates.find((s) => s.t === t) ?? null
  }, [samples, healthLatest.data])

  const own = useMemo(
    () => new Set(myCodes.data.filter((c) => c.consumed_at && c.username).map((c) => c.username as string)),
    [myCodes.data],
  )

  // "Updated HH:MM:SS" from the last successful poll; positions is the dataset every
  // viewer polls regardless of sign-in state, so it stands in for "the map is current".
  useEffect(() => {
    setLastUpdated(Date.now())
  }, [positions.data])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const statusText = positions.error
    ? `Updates paused: ${positions.error}`
    : lastUpdated
      ? `Updated ${formatClock(lastUpdated)}`
      : 'Loading...'

  return {
    profiles,
    positions,
    vehicles,
    safehouses,
    zones,
    grid,
    objects,
    visibility,
    myCodes,
    healthError: healthLatest.error ?? healthSince.error,
    samples,
    latest,
    own,
    now,
    statusText,
  }
}
