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
 * mirrors playerFeatures in packages/aurora/src/layers/transform.ts. The "Who is on
 * now" list is every online player (buildOnlineList, T77), dead or without a
 * position included, so it counts what the counter and the map's roster count. Each dot carries
 * the username and the survivor's name (T62); components/landing/ServerNow.tsx picks
 * which one to show from the Survivor name / Username toggle (lib/nameMode.ts).
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import {
  buildDots,
  buildOnlineList,
  type MapDot,
  type OnlinePlayer,
  type PlayerRow,
  type PositionRow,
} from '../lib/serverNowDots'

export type { MapDot, OnlinePlayer }

/** The map's dots and the "Who is on now" list, from the same two requests. */
export interface ServerNowData {
  dots: MapDot[]
  online: OnlinePlayer[]
}

const EMPTY: ServerNowData = { dots: [], online: [] }

async function fetchServerNow(): Promise<ServerNowData> {
  if (!auroraClient) return EMPTY

  try {
    const [playersRes, positionsRes] = await Promise.all([
      auroraClient
        .from('players_public')
        .select('username,display_name,online,is_dead')
        .eq('server_id', AURORA_SERVER_ID)
        .eq('online', true),
      auroraClient.from('player_positions_visible').select('username,x,y').eq('server_id', AURORA_SERVER_ID),
    ])

    if (playersRes.error) return EMPTY

    const players = (playersRes.data ?? []) as PlayerRow[]
    // A failed positions request costs the dots, not the list: everyone is still listed,
    // without a map position.
    const positions = positionsRes.error ? [] : ((positionsRes.data ?? []) as PositionRow[])

    const dots = buildDots(players, positions)
    return { dots, online: buildOnlineList(players, dots) }
  } catch {
    return EMPTY
  }
}

/** Dots to draw and players to list. Both empty while loading or when nobody is online;
 * dots also empty when positions are hidden. */
export function useServerNow(): ServerNowData {
  const query = useQuery({
    queryKey: ['server-now', 'online', AURORA_SERVER_ID],
    queryFn: fetchServerNow,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  return query.data ?? EMPTY
}
