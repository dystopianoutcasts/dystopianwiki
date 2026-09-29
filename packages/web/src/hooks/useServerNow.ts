/**
 * Online player positions for the home page map (components/landing/ServerNow.tsx).
 *
 * A snapshot refetched every 60 seconds. No realtime, no interaction, and no
 * server health: health is for Aurora admins only, so this hook never reads it.
 *
 * What a visitor receives is decided by the database, not here. The view
 * aurora.player_positions_visible returns rows to anonymous visitors only when
 * the Aurora visibility setting allows it, already delayed and rounded as that
 * setting says. Zero rows is a normal answer, not an error.
 *
 * The join to online, living players mirrors playerFeatures in
 * packages/aurora/src/layers/transform.ts. It is copied rather than imported:
 * aurora is not a dependency of the web package.
 *
 * `name` is `display_name`, falling back to `username` only when there is no
 * display name. T27 removes that fallback everywhere at once; this is the one
 * place in packages/web that decides it, per VISIBILITY.md note 3.
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'

export interface MapDot {
  /** Stable key for React. Never rendered. */
  id: string
  /** Shown next to the dot. */
  name: string
  /** World squares. */
  x: number
  y: number
}

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
}

async function fetchDots(): Promise<MapDot[]> {
  if (!auroraClient) return []

  try {
    const [playersRes, positionsRes] = await Promise.all([
      auroraClient
        .from('players_public')
        .select('username,display_name,online,is_dead')
        .eq('server_id', AURORA_SERVER_ID)
        .eq('online', true),
      auroraClient.from('player_positions_visible').select('username,x,y').eq('server_id', AURORA_SERVER_ID),
    ])

    if (playersRes.error || positionsRes.error) return []

    const players = (playersRes.data ?? []) as PlayerRow[]
    const positions = (positionsRes.data ?? []) as PositionRow[]

    // Only players who are online now and alive. The positions view does not
    // filter on online by itself, so a logged-off player can still have a row.
    const drawable = new Map(
      players.filter((p) => !p.is_dead).map((p) => [p.username, p.display_name || p.username]),
    )

    return positions
      .filter((pos) => drawable.has(pos.username) && Number.isFinite(pos.x) && Number.isFinite(pos.y))
      .map((pos) => ({ id: pos.username, name: drawable.get(pos.username) as string, x: pos.x, y: pos.y }))
  } catch {
    return []
  }
}

/** Dots to draw. Empty while loading, when nobody is online, or when positions are hidden. */
export function useServerNow(): MapDot[] {
  const query = useQuery({
    queryKey: ['server-now', 'dots', AURORA_SERVER_ID],
    queryFn: fetchDots,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  return query.data ?? []
}
