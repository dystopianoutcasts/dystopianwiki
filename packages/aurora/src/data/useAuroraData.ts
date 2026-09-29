// All of the map's data: what to fetch, how often, and the small amount of
// client-side shaping (the health window, "updated HH:MM:SS") that isn't a database
// query. No realtime channel is opened here (T19): the ingest writes one batch a
// minute, so a poll at that same interval sees exactly what a realtime subscriber
// would have, at REST's per-byte cost instead of realtime's per-row-times-viewer cost.
import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { INGEST_INTERVAL_MS, SLOW_POLL_MS, VERY_SLOW_POLL_MS, LINK_FEATURE_ENABLED } from '../config'
import { useDataset } from './useDataset'
import {
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

const HEALTH_WINDOW_MINUTES = 60

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function useAuroraData(client: SupabaseClient, serverId: string, prefs: LayerPrefs, user: User | null) {
  const [now, setNow] = useState(() => Date.now())
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const profiles = useDataset(true, () => fetchPlayerProfiles(client, serverId), INGEST_INTERVAL_MS)
  const positions = useDataset(true, () => fetchPositions(client, serverId), INGEST_INTERVAL_MS)
  const vehicles = useDataset(prefs.vehicles, () => fetchVehicles(client, serverId), INGEST_INTERVAL_MS)
  const safehouses = useDataset(prefs.safehouses, () => fetchSafehouses(client, serverId), SLOW_POLL_MS)
  const zones = useDataset(prefs.zones, () => fetchZones(client, serverId), VERY_SLOW_POLL_MS)
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
  const healthSince = useDataset(true, () => fetchHealthSince(client, serverId, HEALTH_WINDOW_MINUTES), INGEST_INTERVAL_MS)
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

  // Health series: filled entirely by polling health_samples (no push events). Each
  // poll already returns the whole window, so the series is the fetch result as-is;
  // `appendSample`'s only remaining job is trimming as the window slides between polls.
  const samples = useMemo(
    () => healthSince.data.reduce((acc, row) => appendSample(acc, row, HEALTH_WINDOW_MINUTES, now), [] as typeof healthSince.data),
    [healthSince.data, now],
  )
  const latest = healthLatest.data[0] ?? null

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
