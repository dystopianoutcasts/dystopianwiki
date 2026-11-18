/**
 * The home page's BattleMetrics rank: the shape of aurora.battlemetrics_summary(p_server)
 * (migration 051), read defensively, and the words the rank tile and card show.
 *
 * The database asks the BattleMetrics API every hour (pg_cron + pg_net, token in
 * Vault) and stores the rank and its last 7 days; the browser never talks to
 * BattleMetrics. Pure of the Supabase client (the caller passes `rpc`), so it is
 * tested without it (battlemetrics.test.ts). Anything missing is null.
 */
import type { RpcCall } from './homeSummaryRpc'

export const BATTLEMETRICS_FN = 'battlemetrics_summary'
export const BATTLEMETRICS_SERVER_URL = 'https://www.battlemetrics.com/servers/zomboid/41858330'

export interface RankPoint {
  t: Date
  rank: number
}

export interface BattleMetricsSummary {
  rank: number | null
  players: number | null
  maxPlayers: number | null
  status: string | null
  fetchedAt: Date | null
  rank7dAgo: number | null
  bestRank7d: number | null
  history: RankPoint[]
}

function positiveInt(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : null
}

function count(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : null
}

function date(v: unknown): Date | null {
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Null when the answer is not an object; otherwise every field, null where odd. */
export function parseBattleMetrics(raw: unknown): BattleMetricsSummary | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const history: RankPoint[] = []
  if (Array.isArray(r.history)) {
    for (const p of r.history) {
      if (!p || typeof p !== 'object') continue
      const t = date((p as Record<string, unknown>).t)
      const rank = positiveInt((p as Record<string, unknown>).rank)
      if (t && rank !== null) history.push({ t, rank })
    }
    history.sort((a, b) => a.t.getTime() - b.t.getTime())
  }
  return {
    rank: positiveInt(r.rank),
    players: count(r.players),
    maxPlayers: count(r.max_players),
    status: typeof r.status === 'string' && r.status ? r.status : null,
    fetchedAt: date(r.fetched_at),
    rank7dAgo: positiveInt(r.rank_7d_ago),
    bestRank7d: positiveInt(r.best_rank_7d),
    history,
  }
}

export async function callBattleMetrics(rpc: RpcCall, server: string): Promise<BattleMetricsSummary | null> {
  const { data, error } = await rpc(BATTLEMETRICS_FN, { p_server: server })
  if (error) return null
  return parseBattleMetrics(data)
}

const NUMBER = new Intl.NumberFormat('en-US')

/** "#1,903", or null when there is no rank. */
export function formatRank(rank: number | null | undefined): string | null {
  return typeof rank === 'number' && rank > 0 ? `#${NUMBER.format(rank)}` : null
}

/**
 * How the rank moved over the week, in words. A lower rank number is better, so
 * going from 2,100 to 1,903 is "up 197 places".
 */
export function rankChange(now: number | null, weekAgo: number | null): string | null {
  if (now === null || weekAgo === null) return null
  const d = weekAgo - now
  if (d === 0) return 'Same place as a week ago'
  const places = `${NUMBER.format(Math.abs(d))} ${Math.abs(d) === 1 ? 'place' : 'places'}`
  return d > 0 ? `Up ${places} this week` : `Down ${places} this week`
}
