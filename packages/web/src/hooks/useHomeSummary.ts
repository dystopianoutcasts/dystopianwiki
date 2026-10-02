/**
 * The home page's server summary: one call to aurora.home_summary() (migration 027; 030 adds the viewer's time zone, see lib/homeSummaryRpc.ts),
 * refetched every minute. Totals and a fixed list of settings only; the database
 * decides what is public, this hook never reads a raw table.
 *
 * `summary` is null while loading, when the call fails (for instance before 027 is
 * applied), or when the answer is not the expected shape. Every section of the home
 * page renders with null and shows "TBD" for what it lacks.
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { parseHomeSummary, type HomeSummary } from '../lib/homeSummary'
import { callHomeSummary, viewerTimeZone } from '../lib/homeSummaryRpc'

async function fetchSummary(): Promise<HomeSummary | null> {
  if (!auroraClient) return null
  try {
    const client = auroraClient
    const data = await callHomeSummary((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID, viewerTimeZone())
    return parseHomeSummary(data)
  } catch {
    return null
  }
}

export function useHomeSummary(): { summary: HomeSummary | null; loading: boolean } {
  const query = useQuery({
    queryKey: ['home-summary', AURORA_SERVER_ID],
    queryFn: fetchSummary,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  return { summary: query.data ?? null, loading: query.isLoading }
}
