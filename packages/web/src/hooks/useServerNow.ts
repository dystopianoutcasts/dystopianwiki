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
 * The join to online, living players is lib/serverNowDots.ts (buildDots), which
 * mirrors playerFeatures in packages/aurora/src/layers/transform.ts. Each dot carries
 * the username and the survivor's name (T62); components/landing/ServerNow.tsx picks
 * which one to show from the Survivor name / Username toggle (lib/nameMode.ts).
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { buildDots, type MapDot, type PlayerRow, type PositionRow } from '../lib/serverNowDots'

export type { MapDot }

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

    return buildDots(players, positions)
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
