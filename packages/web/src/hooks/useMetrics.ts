/**
 * The Outcast Metrics page's data: aurora.metrics_summary(p_server, p_range) once per
 * range, and aurora.metrics_races(p_server) once (migration 052). The database rolls the
 * numbers up every hour, so asking every five or ten minutes is plenty.
 * `data` is null while loading or when the call fails; every chart then says why it is empty.
 */
import { useQuery } from '@tanstack/react-query'
import { auroraClient, AURORA_SERVER_ID } from '../lib/aurora'
import { callMetricsSummary, type MetricsRange, type MetricsSummary } from '../lib/metrics'
import { callRaces, type RaceFeed } from '../lib/metricsRaces'

export interface MetricsResult<T> {
  data: T | null
  loading: boolean
  failed: boolean
}

export function useMetricsSummary(range: MetricsRange): MetricsResult<MetricsSummary> {
  const query = useQuery({
    queryKey: ['metrics-summary', AURORA_SERVER_ID, range],
    queryFn: async (): Promise<MetricsSummary | null> => {
      if (!auroraClient) return null
      const client = auroraClient
      return callMetricsSummary((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID, range)
    },
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })
  return { data: query.data ?? null, loading: query.isLoading, failed: query.isError || (query.isSuccess && query.data == null) }
}

export function useMetricsRaces(): MetricsResult<RaceFeed> {
  const query = useQuery({
    queryKey: ['metrics-races', AURORA_SERVER_ID],
    queryFn: async (): Promise<RaceFeed | null> => {
      if (!auroraClient) return null
      const client = auroraClient
      return callRaces((fn, args) => client.rpc(fn, args), AURORA_SERVER_ID)
    },
    // The races replay from the start when the data changes under them, so keep this slow.
    refetchInterval: 15 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  return { data: query.data ?? null, loading: query.isLoading, failed: query.isError || (query.isSuccess && query.data == null) }
}
