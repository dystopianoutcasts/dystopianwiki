/**
 * Outcast Metrics (/metrics): the shape of aurora.metrics_summary(p_server, p_range)
 * (migration 052), read defensively, and the words and small calculations the page's
 * tiles and charts use. Pure of the Supabase client (the caller passes `rpc`), so it is
 * tested without it (metrics.test.ts). Anything missing is null or empty, never a throw.
 *
 * Days in the summary are UTC days; the page says so. The busiest-hours heatmap arrives
 * as UTC weekday x hour and is shifted into the viewer's time zone here.
 */
import type { RpcCall } from './homeSummaryRpc'

export const METRICS_SUMMARY_FN = 'metrics_summary'

export type MetricsRange = '7' | '30' | 'season'
export const METRICS_RANGES: readonly { id: MetricsRange; label: string }[] = [
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: 'season', label: 'Season 1' },
]
export const DEFAULT_METRICS_RANGE: MetricsRange = 'season'

export interface MetricsHourPoint {
  t: Date
  avg: number | null
  peak: number | null
}

export interface MetricsDay {
  /** UTC day, YYYY-MM-DD. */
  day: string
  hoursPlayed: number | null
  uniquePlayers: number | null
  newPlayers: number
  avg: number | null
  peak: number | null
  deaths: number
  kills: number
}

export interface MetricsTopPlayer {
  rank: number
  username: string
  displayName: string
  minutes: number
}

export interface MetricsTotals {
  hoursPlayed: number | null
  uniquePlayers: number | null
  newPlayers: number
  peak: number | null
  deaths: number
  kills: number
}

export interface MetricsSummary {
  range: string
  /** First UTC day shown, YYYY-MM-DD. */
  since: string
  seasonStart: Date | null
  /** First hour with minutes played, and first hour with a player count. */
  trackingSince: Date | null
  playersSince: Date | null
  hourly: MetricsHourPoint[]
  daily: MetricsDay[]
  /** 7 UTC weekdays (0 = Sunday) x 24 UTC hours of average players; null = no sample. */
  heatmap: (number | null)[][]
  topTime: MetricsTopPlayer[]
  totals: MetricsTotals
}

function whole(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null
}

function zero(v: unknown): number {
  return whole(v) ?? 0
}

function date(v: unknown): Date | null {
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function record(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

/** Null when the answer is not an object; otherwise every field, empty or null where odd. */
export function parseMetricsSummary(raw: unknown): MetricsSummary | null {
  const r = record(raw)
  if (!r) return null

  const hourly: MetricsHourPoint[] = []
  if (Array.isArray(r.hourly)) {
    for (const p of r.hourly) {
      const o = record(p)
      const t = o ? date(o.t) : null
      if (o && t) hourly.push({ t, avg: whole(o.avg), peak: whole(o.peak) })
    }
    hourly.sort((a, b) => a.t.getTime() - b.t.getTime())
  }

  const daily: MetricsDay[] = []
  if (Array.isArray(r.daily)) {
    for (const p of r.daily) {
      const o = record(p)
      if (!o || typeof o.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.day)) continue
      daily.push({
        day: o.day,
        hoursPlayed: whole(o.hours_played),
        uniquePlayers: whole(o.unique_players),
        newPlayers: zero(o.new_players),
        avg: whole(o.avg),
        peak: whole(o.peak),
        deaths: zero(o.deaths),
        kills: zero(o.kills),
      })
    }
    daily.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
  }

  const heatmap: (number | null)[][] = []
  if (Array.isArray(r.heatmap)) {
    for (const row of r.heatmap.slice(0, 7)) {
      const cells: (number | null)[] = []
      for (let h = 0; h < 24; h++) cells.push(Array.isArray(row) ? whole(row[h]) : null)
      heatmap.push(cells)
    }
  }
  while (heatmap.length < 7) heatmap.push(new Array<number | null>(24).fill(null))

  const topTime: MetricsTopPlayer[] = []
  if (Array.isArray(r.top_time)) {
    for (const p of r.top_time) {
      const o = record(p)
      if (!o || typeof o.username !== 'string') continue
      const minutes = whole(o.minutes)
      if (minutes === null) continue
      topTime.push({
        rank: zero(o.rank) || topTime.length + 1,
        username: o.username,
        displayName: typeof o.display_name === 'string' && o.display_name ? o.display_name : o.username,
        minutes,
      })
    }
  }

  const t = record(r.totals) ?? {}
  return {
    range: typeof r.range === 'string' ? r.range : DEFAULT_METRICS_RANGE,
    since: typeof r.since === 'string' ? r.since : '',
    seasonStart: date(r.season_start),
    trackingSince: date(r.tracking_since),
    playersSince: date(r.players_since),
    hourly,
    daily,
    heatmap,
    topTime,
    totals: {
      hoursPlayed: whole(t.hours_played),
      uniquePlayers: whole(t.unique_players),
      newPlayers: zero(t.new_players),
      peak: whole(t.peak),
      deaths: zero(t.deaths),
      kills: zero(t.kills),
    },
  }
}

export async function callMetricsSummary(rpc: RpcCall, server: string, range: MetricsRange): Promise<MetricsSummary | null> {
  const { data, error } = await rpc(METRICS_SUMMARY_FN, { p_server: server, p_range: range })
  if (error) return null
  return parseMetricsSummary(data)
}

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------

const NUMBER = new Intl.NumberFormat('en-US')

export function formatCount(n: number | null | undefined): string {
  return typeof n === 'number' && Number.isFinite(n) ? NUMBER.format(n) : 'TBD'
}

/** 1.5 -> "1.5 hours", 1 -> "1 hour". */
export function formatHoursPlayed(h: number | null | undefined): string {
  if (typeof h !== 'number' || !Number.isFinite(h)) return 'TBD'
  const rounded = Math.round(h * 10) / 10
  return `${NUMBER.format(rounded)} ${rounded === 1 ? 'hour' : 'hours'}`
}

/** 125 minutes -> "2h 05m". */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes))
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-11-18" -> "Nov 18" (the date as written; no time zone shifts it). */
export function dayLabel(day: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!m) return day
  return `${MONTHS[Number(m[2]) - 1] ?? m[2]} ${Number(m[3])}`
}

/** "Nov 11" for a date, in UTC (the same day the summary counts). */
export function utcDayLabel(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** The range's name in a sentence: "the last 7 days", "the season". */
export function rangePhrase(range: string): string {
  if (range === 'season') return 'Season 1'
  return `the last ${range} ${range === '1' ? 'day' : 'days'}`
}

// ---------------------------------------------------------------------------
// The busiest-hours heatmap in the viewer's time zone
// ---------------------------------------------------------------------------

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Shifts the UTC weekday x hour grid into `timeZone`. Each UTC cell is placed where its
 * hour falls in the zone during the week of `reference` (so daylight saving is the one
 * in force now); cells that land on the same local slot are averaged. A slot no cell
 * reached stays null. A zone that is not whole hours ahead (India) spreads over the hour
 * it lands in.
 */
export function localHeatmap(utcGrid: (number | null)[][], timeZone: string | undefined, reference: Date): (number | null)[][] {
  const out: { sum: number; n: number }[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ sum: 0, n: 0 })))
  let fmt: Intl.DateTimeFormat
  try {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: 'numeric', hourCycle: 'h23' })
  } catch {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', hour: 'numeric', hourCycle: 'h23' })
  }
  // The Sunday 00:00 UTC that starts the reference's week.
  const sunday = Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate() - reference.getUTCDay())
  for (let dow = 0; dow < 7; dow++) {
    for (let hr = 0; hr < 24; hr++) {
      const v = utcGrid[dow]?.[hr]
      if (typeof v !== 'number') continue
      const parts = fmt.formatToParts(new Date(sunday + (dow * 24 + hr) * 3600000))
      const wd = WEEKDAY_INDEX[parts.find((p) => p.type === 'weekday')?.value ?? '']
      const hour = Number(parts.find((p) => p.type === 'hour')?.value) % 24
      if (wd === undefined || Number.isNaN(hour)) continue
      const slot = out[wd][hour]
      slot.sum += v
      slot.n += 1
    }
  }
  return out.map((row) => row.map((c) => (c.n > 0 ? Math.round((c.sum / c.n) * 100) / 100 : null)))
}

/** "1 PM" for an hour 0..23. */
export function hourName(h: number): string {
  const n = ((h % 24) + 24) % 24
  return `${n % 12 === 0 ? 12 : n % 12} ${n < 12 ? 'AM' : 'PM'}`
}

export interface BusiestSlot {
  weekday: number
  hour: number
  average: number
}

/** The weekday-and-hour with the most players, or null when the grid is empty. Ties go to the earlier slot. */
export function busiestSlot(grid: (number | null)[][]): BusiestSlot | null {
  let best: BusiestSlot | null = null
  for (let d = 0; d < grid.length; d++) {
    for (let h = 0; h < 24; h++) {
      const v = grid[d]?.[h]
      if (typeof v === 'number' && v > 0 && (!best || v > best.average)) best = { weekday: d, hour: h, average: v }
    }
  }
  return best
}

/** The viewer's time zone name for captions, e.g. "America/New_York"; "UTC" when unknown. */
export function viewerZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return typeof tz === 'string' && tz ? tz : 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Where a chart's own data starts later than the range, in words ("tracked from Nov 11"),
 * or null when it covers the whole range. `since` is the range's first UTC day (YYYY-MM-DD).
 */
export function trackedFromNote(since: string, firstData: Date | null): string | null {
  if (!firstData) return null
  const first = `${firstData.getUTCFullYear()}-${String(firstData.getUTCMonth() + 1).padStart(2, '0')}-${String(firstData.getUTCDate()).padStart(2, '0')}`
  return first > since ? `tracked from ${utcDayLabel(firstData)}` : null
}

/**
 * The Nov 1 to 4 kill gap: the server logs show players online those days, but no zombie kills
 * were recorded. Given each day's kills (YYYY-MM-DD, any calendar), returns the plain sentence
 * when all four days are present with no kills, else null.
 */
export function killGapNote(days: readonly { day: string; kills: number }[]): string | null {
  const wanted = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']
  const found = wanted.map((w) => days.find((d) => d.day === w))
  if (found.some((d) => !d || d.kills !== 0)) return null
  return 'Nov 1 to 4: players were on, but their zombie kills were not recorded those days.'
}
