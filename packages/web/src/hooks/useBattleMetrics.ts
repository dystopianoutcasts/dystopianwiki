/**
 * The home page's BattleMetrics rank: one call to aurora.battlemetrics_summary(p_server)
 * (migration 051). The database refreshes it hourly, so asking every 10 minutes is plenty.
 * `summary` is null while loading or when the call fails; the tile then reads "TBD".
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { callBattleMetrics, type BattleMetricsSummary } from '../lib/battlemetrics'

async function fetchSummary(): Promise<BattleMetricsSummary | null> {
  if (!auroraClient) return null
  try {
    const client = auroraClient
    return await callBattleMetrics((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID)
  } catch {
    return null
  }
}

export function useBattleMetrics(): { summary: BattleMetricsSummary | null } {
  const query = useQuery({
    queryKey: ['battlemetrics-summary', AURORA_SERVER_ID],
    queryFn: fetchSummary,
    refetchInterval: 10 * 60_000,
    refetchOnWindowFocus: true,
  })
  return { summary: query.data ?? null }
}
