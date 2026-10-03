/**
 * The home page leaderboard: one call to aurora.leaderboard(p_server, p_limit) (T65,
 * migration 036), on load and every minute. Before 036 is live the function is missing
 * (PGRST202): `unavailable` is true and the call rests for five minutes (lib/leaderboard.ts).
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { callLeaderboard, type Leaderboard, type LeaderboardResult } from '../lib/leaderboard'

async function fetchBoard(): Promise<LeaderboardResult> {
  if (!auroraClient) return { data: null, unavailable: false }
  try {
    const client = auroraClient
    return await callLeaderboard((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID)
  } catch {
    return { data: null, unavailable: false }
  }
}

export function useLeaderboard(): { data: Leaderboard | null; unavailable: boolean; loading: boolean } {
  const query = useQuery({
    queryKey: ['leaderboard', AURORA_SERVER_ID],
    queryFn: fetchBoard,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  return { data: query.data?.data ?? null, unavailable: query.data?.unavailable ?? false, loading: query.isPending }
}
