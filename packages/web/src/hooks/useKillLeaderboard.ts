/**
 * The home page's kill leaderboard: one call to aurora.kill_leaderboard(p_server, p_limit)
 * (T57, migration 035), on load and every minute. Before 035 is live the function is missing
 * (PGRST202): `unavailable` is true and the call rests for five minutes (lib/killLeaderboard.ts).
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { callKillLeaderboard, type KillLeaderboard, type KillResult } from '../lib/killLeaderboard'

async function fetchBoard(): Promise<KillResult> {
  if (!auroraClient) return { data: null, unavailable: false }
  try {
    const client = auroraClient
    return await callKillLeaderboard((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID)
  } catch {
    return { data: null, unavailable: false }
  }
}

export function useKillLeaderboard(): { data: KillLeaderboard | null; unavailable: boolean } {
  const query = useQuery({
    queryKey: ['kill-leaderboard', AURORA_SERVER_ID],
    queryFn: fetchBoard,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  return { data: query.data?.data ?? null, unavailable: query.data?.unavailable ?? false }
}
