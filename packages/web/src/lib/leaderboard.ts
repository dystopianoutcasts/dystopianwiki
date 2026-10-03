/**
 * The home page leaderboard (T66): the shape of aurora.leaderboard(p_server, p_limit)
 * (T65, migration 036), read defensively, and the display text for its three tabs.
 *
 * Contract (tasks/T65-leaderboard-backend-036.md), every key always present on a good answer:
 *   { source: "mod" | "aurora", world_seq, seen_at,
 *     kills:    [{ rank, username, display_name, live, total, alive, online }],
 *     deaths:   [{ rank, username, display_name, deaths, alive, online }],
 *     survival: [{ rank, username, display_name, hours, alive, online }] }
 * Here every key is optional all the same: a row that fails is dropped, never the board.
 *
 * The values are drawn as DystopianQoL's in-game window draws them
 * (client/DQOL_Leaderboard_Window.lua, tabValue and formatSurvival), so the site and the
 * game read the same. Pure of the Supabase client and the browser (the caller passes
 * `rpc`), so all of it is tested without either (leaderboard.test.ts).
 *
 * Replaces lib/killLeaderboard.ts (035's kill_leaderboard): Aurora's own count is now the
 * fallback inside the SQL function, so the site asks one function only.
 */
import { isMissingFunction, type RpcCall } from './homeSummaryRpc'
import { shownName, type NameMode } from './nameMode'

/** The function name: auroraClient.rpc('leaderboard', { p_server, p_limit }). */
export const LEADERBOARD_FN = 'leaderboard'

/** Rows asked for per tab, and the most a payload may carry per tab. */
export const LEADERBOARD_LIMIT = 10
export const MAX_ROWS = 100

/** How long a missing function is left alone before it is asked for again. */
export const LEADERBOARD_RETRY_MS = 5 * 60_000

export type TabId = 'kills' | 'deaths' | 'survival'
export const TAB_IDS: readonly TabId[] = ['kills', 'deaths', 'survival']

export type BoardSource = 'mod' | 'aurora'

interface RowBase {
  rank: number
  username: string
  displayName: string | null
  alive: boolean
  online: boolean
}
export interface KillsRow extends RowBase {
  live: number
  total: number
}
export interface DeathsRow extends RowBase {
  deaths: number
}
export interface SurvivalRow extends RowBase {
  hours: number
}

export interface Leaderboard {
  source: BoardSource | null
  worldSeq: number | null
  seenAt: Date | null
  kills: KillsRow[]
  deaths: DeathsRow[]
  survival: SurvivalRow[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** A finite, non-negative number (numeric strings accepted), else null. */
function count(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function base(v: Record<string, unknown>): RowBase | null {
  const username = str(v.username)
  const rank = count(v.rank)
  if (username === null || rank === null) return null
  return { rank, username, displayName: str(v.display_name), alive: v.alive === true, online: v.online === true }
}

function parseKills(v: unknown): KillsRow | null {
  if (!isRecord(v)) return null
  const b = base(v)
  const total = count(v.total)
  if (b === null || total === null) return null
  // live is part of total; a missing or impossible live reads as the whole total (one number).
  const live = count(v.live)
  return { ...b, total, live: live === null || live > total ? total : live }
}

function parseDeaths(v: unknown): DeathsRow | null {
  if (!isRecord(v)) return null
  const b = base(v)
  const deaths = count(v.deaths)
  return b === null || deaths === null ? null : { ...b, deaths }
}

function parseSurvival(v: unknown): SurvivalRow | null {
  if (!isRecord(v)) return null
  const b = base(v)
  const hours = count(v.hours)
  return b === null || hours === null ? null : { ...b, hours }
}

function list<T>(raw: unknown, parse: (v: unknown) => T | null): T[] {
  const out: T[] = []
  if (!Array.isArray(raw)) return out
  for (const r of raw) {
    const row = parse(r)
    if (row !== null) out.push(row)
    if (out.length >= MAX_ROWS) break
  }
  return out
}

function date(v: unknown): Date | null {
  if (typeof v !== 'string' || v.trim() === '') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/** The RPC's JSON as a Leaderboard, or null when it is not an object at all. */
export function parseLeaderboard(raw: unknown): Leaderboard | null {
  if (!isRecord(raw)) return null
  return {
    source: raw.source === 'mod' || raw.source === 'aurora' ? raw.source : null,
    worldSeq: count(raw.world_seq),
    seenAt: date(raw.seen_at),
    kills: list(raw.kills, parseKills),
    deaths: list(raw.deaths, parseDeaths),
    survival: list(raw.survival, parseSurvival),
  }
}

/** 1234567 -> "1,234,567" (hand-built so the locale cannot change the separator). */
export function formatCount(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** The game's Kills value: "live / total" once some kills are on dead characters, else the total. */
export function killsValue(row: { live: number; total: number }): string {
  return row.total > row.live ? `${formatCount(row.live)} / ${formatCount(row.total)}` : formatCount(row.total)
}

/**
 * The game's Survival value (formatSurvival): "Nd Nh" from a day up, hours floored;
 * under a day "Nh", hours rounded half up as DQOL.Utils.round does.
 */
export function survivalValue(hours: number): string {
  const h = Math.max(0, hours)
  const days = Math.floor(h / 24)
  if (days > 0) return `${days}d ${Math.floor(h % 24)}h`
  return `${Math.floor(h + 0.5)}h`
}

/** "1st", "2nd", "3rd", "4th" ... "11th", "12th", "13th", "21st". */
export function ordinal(n: number): string {
  const whole = Math.round(n)
  const mod100 = whole % 100
  if (mod100 >= 11 && mod100 <= 13) return `${whole}th`
  switch (whole % 10) {
    case 1:
      return `${whole}st`
    case 2:
      return `${whole}nd`
    case 3:
      return `${whole}rd`
    default:
      return `${whole}th`
  }
}

export interface DisplayRow {
  key: string
  rank: number
  /** 'gold' | 'silver' | 'bronze' for ranks 1-3 (ties share), else null. */
  medal: 'gold' | 'silver' | 'bronze' | null
  /** The rank as words for the medal's text alternative: "1st". */
  rankText: string
  name: string
  value: string
}

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' } as const

function medal(rank: number): DisplayRow['medal'] {
  return rank === 1 || rank === 2 || rank === 3 ? MEDALS[rank] : null
}

function display(row: RowBase, value: string, mode: NameMode, i: number): DisplayRow {
  return {
    key: `${row.rank}-${row.username}-${i}`,
    rank: row.rank,
    medal: medal(row.rank),
    rankText: ordinal(row.rank),
    name: shownName(row, mode),
    value,
  }
}

/** One tab's rows, in the order given (the database ranks them), at most `limit`. */
export function tabRows(data: Leaderboard | null, tab: TabId, mode: NameMode, limit: number = LEADERBOARD_LIMIT): DisplayRow[] {
  if (!data) return []
  if (tab === 'kills') return data.kills.slice(0, limit).map((r, i) => display(r, killsValue(r), mode, i))
  if (tab === 'deaths') return data.deaths.slice(0, limit).map((r, i) => display(r, formatCount(r.deaths), mode, i))
  return data.survival.slice(0, limit).map((r, i) => display(r, survivalValue(r.hours), mode, i))
}

export const TAB_LABELS: Record<TabId, string> = { kills: 'Kills', deaths: 'Deaths', survival: 'Survival' }

/** The value column's heading per tab. */
export const VALUE_HEADINGS: Record<TabId, string> = { kills: 'Kills', deaths: 'Deaths', survival: 'Survived' }

/** The game's tab tooltip, shown as visible text under the tab (a tooltip alone fails on touch). */
export const TAB_HELP: Record<TabId, string> = {
  kills:
    'Zombie kills, ranked by lifetime total. Once a player has kills carried over from characters that have died, the value reads as current life / all lives. A single number means every kill is on their current character.',
  deaths: 'Deaths, ranked by how many characters each player has lost this season.',
  survival: 'Time the current character has survived, in game days and hours. Living characters only.',
}

export const EMPTY_LINES: Record<TabId, string> = {
  kills: 'No kills recorded yet this season.',
  deaths: 'No deaths recorded yet this season.',
  survival: 'Nobody has survived long enough to rank yet this season.',
}

export const UNAVAILABLE_LINE = 'The leaderboard starts counting when the season tracker goes live.'
export const LOADING_LINE = 'Loading the leaderboard.'

/** "Season 3 leaderboard", or plain "Leaderboard" when the season is not known. */
export function boardTitle(worldSeq: number | null | undefined): string {
  return typeof worldSeq === 'number' && Number.isFinite(worldSeq) ? `Season ${worldSeq} leaderboard` : 'Leaderboard'
}

/** "just now", "1 minute ago", "5 minutes ago", "2 hours ago", "3 days ago". */
export function relativeTime(then: Date, now: Date): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 60_000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

/** The line under the table: where the numbers come from. '' when the source is unknown. */
export function sourceLine(data: Leaderboard | null, now: Date): string {
  if (!data) return ''
  if (data.source === 'aurora') return 'Counted by Aurora; the in-game board may differ by a few kills.'
  if (data.source === 'mod') {
    return data.seenAt ? `As shown in game, updated ${relativeTime(data.seenAt, now)}.` : 'As shown in game.'
  }
  return ''
}

/** Arrow-key movement across the tabs (WAI-ARIA tabs pattern): wraps; Home and End jump; any other key: null. */
export function nextTab(current: TabId, key: string): TabId | null {
  const i = TAB_IDS.indexOf(current)
  const n = TAB_IDS.length
  if (key === 'ArrowRight') return TAB_IDS[(i + 1) % n]
  if (key === 'ArrowLeft') return TAB_IDS[(i - 1 + n) % n]
  if (key === 'Home') return TAB_IDS[0]
  if (key === 'End') return TAB_IDS[n - 1]
  return null
}

export interface LeaderboardResult {
  data: Leaderboard | null
  /** The function does not exist yet (036 not applied). */
  unavailable: boolean
}

/** Epoch ms before which the function is not asked for again. */
let closedUntil = 0

/** Test seam: forget that the function was found missing. */
export function resetLeaderboardProbe(): void {
  closedUntil = 0
}

/**
 * Ask for the board. A missing function (PGRST202) closes the call for LEADERBOARD_RETRY_MS
 * and answers `unavailable` without asking; any other error is a plain null result.
 */
export async function callLeaderboard(rpc: RpcCall, serverId: string, now: number = Date.now()): Promise<LeaderboardResult> {
  if (now < closedUntil) return { data: null, unavailable: true }
  const { data, error } = await rpc(LEADERBOARD_FN, { p_server: serverId, p_limit: LEADERBOARD_LIMIT })
  if (error) {
    if (isMissingFunction(error)) {
      closedUntil = now + LEADERBOARD_RETRY_MS
      return { data: null, unavailable: true }
    }
    return { data: null, unavailable: false }
  }
  closedUntil = 0
  return { data: parseLeaderboard(data), unavailable: false }
}
