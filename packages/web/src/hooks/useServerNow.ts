/**
 * Data for the read-only "Server right now" panel on the home page
 * (components/landing/ServerNow.tsx). No realtime, no interaction: a snapshot
 * refetched on a 60s interval, following the useSupabase.ts TanStack Query pattern.
 *
 * describeAge and the stale-after-5-minutes rule are copied, not imported, from
 * packages/aurora/src/layers/transform.ts (describeAge) and
 * packages/aurora/src/data/health.ts (STALE_AFTER_MS, isStale): aurora is not a
 * dependency of the web package and packages/shared/aurora is Deno code. See
 * docs/planning/BUILD42_CONTENT_PLAN.md section 2.
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'

export type ServerNowStatus = 'ok' | 'stale' | 'nodata' | 'error'

export interface ServerNowPlayer {
  name: string
  hasPosition: boolean
}

export interface ServerNowPosition {
  username: string
  name: string
  x: number
  y: number
}

export interface WorldSize {
  w: number
  h: number
}

export interface ServerNowData {
  status: ServerNowStatus
  onlineCount: number
  players: ServerNowPlayer[]
  positions: ServerNowPosition[]
  lastReportAgeText: string | null
  lastReportAt: string | null
  worldSize: WorldSize
}

// Copied from packages/aurora/src/data/health.ts.
const STALE_AFTER_MS = 5 * 60_000

function isStale(t: string, now: number = Date.now()): boolean {
  return now - Date.parse(t) > STALE_AFTER_MS
}

// Copied from packages/aurora/src/layers/transform.ts (describeAge).
function describeAge(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - Date.parse(iso))
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.floor(h / 24)} d ago`
}

// map/tiles.json world.squares as of 2026-09-29 (packages/aurora/src/map/coords.ts,
// docs/planning/BUILD42_CONTENT_PLAN.md section 2). Used when the file cannot be
// fetched, which is always true under `npm run web` since the Vite dev server does
// not serve /map/ (it is a separate build copied to the repo root).
const FALLBACK_WORLD_SIZE: WorldSize = { w: 19968, h: 16128 }

interface PlayerRow {
  username: string
  display_name: string | null
  online: boolean
  is_dead: boolean | null
}

interface PositionRow {
  username: string
  x: number
  y: number
  t: string | null
  is_delayed: boolean
  is_rounded: boolean
}

interface HealthRow {
  players: number | null
  t: string
}

async function fetchWorldSize(): Promise<WorldSize> {
  try {
    const res = await fetch('/map/tiles.json')
    if (!res.ok) return FALLBACK_WORLD_SIZE
    const json = (await res.json()) as { world?: { squares?: { w?: number; h?: number } } }
    const w = json.world?.squares?.w
    const h = json.world?.squares?.h
    return typeof w === 'number' && typeof h === 'number' ? { w, h } : FALLBACK_WORLD_SIZE
  } catch {
    return FALLBACK_WORLD_SIZE
  }
}

type Snapshot = Omit<ServerNowData, 'worldSize'>

const ERROR_SNAPSHOT: Snapshot = {
  status: 'error',
  onlineCount: 0,
  players: [],
  positions: [],
  lastReportAgeText: null,
  lastReportAt: null,
}

async function fetchSnapshot(): Promise<Snapshot> {
  if (!auroraClient) return ERROR_SNAPSHOT

  try {
    const [playersRes, positionsRes, healthRes] = await Promise.all([
      auroraClient
        .from('players_public')
        .select('username,display_name,online,is_dead')
        .eq('server_id', AURORA_SERVER_ID)
        .eq('online', true),
      // May legitimately return zero rows for anonymous viewers; not an error.
      auroraClient
        .from('player_positions_visible')
        .select('username,x,y,t,is_delayed,is_rounded')
        .eq('server_id', AURORA_SERVER_ID),
      auroraClient
        .from('health_samples')
        .select('players,t')
        .eq('server_id', AURORA_SERVER_ID)
        .order('t', { ascending: false })
        .limit(1),
    ])

    if (playersRes.error || positionsRes.error || healthRes.error) return ERROR_SNAPSHOT

    const players = (playersRes.data ?? []) as PlayerRow[]
    const positionRows = (positionsRes.data ?? []) as PositionRow[]
    const health = ((healthRes.data ?? []) as HealthRow[])[0]

    const byUsername = new Map(players.map((p) => [p.username, p]))
    const positionUsernames = new Set(positionRows.map((pos) => pos.username))

    const rosterPlayers: ServerNowPlayer[] = players.map((p) => ({
      name: p.display_name || p.username,
      hasPosition: positionUsernames.has(p.username),
    }))

    // Joined to online players only; dead characters are dropped (mirrors
    // packages/aurora/src/layers/transform.ts playerFeatures).
    const positions: ServerNowPosition[] = positionRows.reduce<ServerNowPosition[]>((out, pos) => {
      const profile = byUsername.get(pos.username)
      if (!profile || profile.is_dead) return out
      out.push({ username: pos.username, name: profile.display_name || pos.username, x: pos.x, y: pos.y })
      return out
    }, [])

    const lastReportAt = health?.t ?? null
    const lastReportAgeText = lastReportAt ? describeAge(lastReportAt) : null

    let status: ServerNowStatus
    if (!health) status = 'nodata'
    else if (isStale(health.t)) status = 'stale'
    else status = 'ok'

    return {
      status,
      onlineCount: rosterPlayers.length,
      players: rosterPlayers,
      positions,
      lastReportAgeText,
      lastReportAt,
    }
  } catch {
    return ERROR_SNAPSHOT
  }
}

export function useServerNow(): { data: ServerNowData | undefined; isLoading: boolean } {
  const worldSizeQuery = useQuery({
    queryKey: ['server-now', 'world-size'],
    queryFn: fetchWorldSize,
    staleTime: Infinity,
  })

  const snapshotQuery = useQuery({
    queryKey: ['server-now', 'snapshot', AURORA_SERVER_ID],
    queryFn: fetchSnapshot,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  const worldSize = worldSizeQuery.data ?? FALLBACK_WORLD_SIZE
  const data: ServerNowData | undefined = snapshotQuery.data ? { ...snapshotQuery.data, worldSize } : undefined

  return { data, isLoading: snapshotQuery.isLoading }
}
