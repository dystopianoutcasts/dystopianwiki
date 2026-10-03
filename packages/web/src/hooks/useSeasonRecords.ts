/**
 * The home page's season records: one call to aurora.season_records(p_server) (T54,
 * migration 034), on load and every minute. Before 034 is live the function is missing
 * (PGRST202): `unavailable` is true and the call rests for five minutes (lib/seasonRecords.ts).
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { callSeasonRecords, type SeasonRecords, type SeasonResult } from '../lib/seasonRecords'

async function fetchRecords(): Promise<SeasonResult> {
  if (!auroraClient) return { records: null, unavailable: false }
  try {
    const client = auroraClient
    return await callSeasonRecords((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID)
  } catch {
    return { records: null, unavailable: false }
  }
}

export function useSeasonRecords(): { records: SeasonRecords | null; unavailable: boolean } {
  const query = useQuery({
    queryKey: ['season-records', AURORA_SERVER_ID],
    queryFn: fetchRecords,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  return { records: query.data?.records ?? null, unavailable: query.data?.unavailable ?? false }
}
