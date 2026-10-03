/**
 * The home page's "Kill leaderboard": the shape of aurora.kill_leaderboard(p_server, p_limit)
 * (T57, migration 035), read defensively, and the display rows built from it.
 *
 * Pure of the Supabase client and the browser (the caller passes `rpc`), so all of it is
 * tested without either (killLeaderboard.test.ts). Every key is optional; a row that
 * fails is dropped rather than failing the board.
 */
import { isMissingFunction, type RpcCall } from './homeSummaryRpc'

/** The function name: auroraClient.rpc('kill_leaderboard', { p_server, p_limit }). */
export const KILL_LEADERBOARD_FN = 'kill_leaderboard'

/** Rows asked for, and the most a payload may carry. */
export const KILL_LEADERBOARD_LIMIT = 10
export const MAX_ROWS = 100

/** How long a missing function is left alone before it is asked for again. */
export const KILL_RETRY_MS = 5 * 60_000

export interface KillRow {
  rank: number
  name: string
  kills: number
  bestLife: number
  lives: number
  alive: boolean
  online: boolean
}

export interface KillLeaderboard {
  worldSeq: number | null
  players: number | null
  totalKills: number | null
  rows: KillRow[]
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

function parseRow(v: unknown): KillRow | null {
  if (!isRecord(v)) return null
  const name = str(v.name)
  const kills = count(v.kills)
  const rank = count(v.rank)
  if (name === null || kills === null || rank === null) return null
  return {
    rank,
    name,
    kills,
    bestLife: count(v.best_life) ?? 0,
    lives: count(v.lives) ?? 0,
    alive: v.alive === true,
    online: v.online === true,
  }
}

/** The RPC's JSON as a KillLeaderboard, or null when it is not an object at all. */
export function parseKillLeaderboard(raw: unknown): KillLeaderboard | null {
  if (!isRecord(raw)) return null
  const rows: KillRow[] = []
  if (Array.isArray(raw.rows)) {
    for (const r of raw.rows) {
      const row = parseRow(r)
      if (row !== null) rows.push(row)
      if (rows.length >= MAX_ROWS) break
    }
  }
  return {
    worldSeq: count(raw.world_seq),
    players: count(raw.players),
    totalKills: count(raw.total_kills),
    rows,
  }
}

/** 1234567 -> "1,234,567" (hand-built so the locale cannot change the separator). */
export function formatKills(n: number): string {
  const whole = Math.round(n)
  return String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export interface DisplayRow {
  key: string
  rank: number
  name: string
  kills: number
  bestLife: number
  lives: number
  status: 'alive' | 'ended'
  online: boolean
}

/** The rows to show, in the order given (the database ranks them), at most ten. */
export function leaderboardRows(data: KillLeaderboard | null, limit: number = KILL_LEADERBOARD_LIMIT): DisplayRow[] {
  if (!data) return []
  return data.rows.slice(0, limit).map((r, i) => ({
    key: `${r.rank}-${r.name}-${i}`,
    rank: r.rank,
    name: r.name,
    kills: r.kills,
    bestLife: r.bestLife,
    lives: r.lives,
    status: r.alive ? 'alive' : 'ended',
    online: r.online,
  }))
}

function plural(n: number, one: string, many: string): string {
  return `${formatKills(n)} ${n === 1 ? one : many}`
}

/** "Season 3 kill leaderboard", or plain "Kill leaderboard" when the season is not known. */
export function boardTitle(worldSeq: number | null | undefined): string {
  return typeof worldSeq === 'number' && Number.isFinite(worldSeq) ? `Season ${worldSeq} kill leaderboard` : 'Kill leaderboard'
}

export function livesText(lives: number): string {
  return plural(lives, 'life', 'lives')
}

/** "9 players, 1,234 kills this season"; '' when either figure is missing. */
export function footerLine(data: KillLeaderboard | null): string {
  if (!data || data.players === null || data.totalKills === null) return ''
  return `${plural(data.players, 'player', 'players')}, ${plural(data.totalKills, 'kill', 'kills')} this season`
}

export const LEAD_LINE = 'Zombies killed this season, counted on each character and summed per player.'
export const EMPTY_LINE = 'No kills recorded yet this season.'
export const UNAVAILABLE_LINE = 'The leaderboard starts counting when the season tracker goes live.'

export interface KillResult {
  data: KillLeaderboard | null
  /** The function does not exist yet (035 not applied). */
  unavailable: boolean
}

/** Epoch ms before which the function is not asked for again. */
let closedUntil = 0

/** Test seam: forget that the function was found missing. */
export function resetKillProbe(): void {
  closedUntil = 0
}

/**
 * Ask for the board. A missing function (PGRST202) closes the call for KILL_RETRY_MS and
 * answers `unavailable` without asking; any other error is a plain null result.
 */
export async function callKillLeaderboard(rpc: RpcCall, serverId: string, now: number = Date.now()): Promise<KillResult> {
  if (now < closedUntil) return { data: null, unavailable: true }
  const { data, error } = await rpc(KILL_LEADERBOARD_FN, { p_server: serverId, p_limit: KILL_LEADERBOARD_LIMIT })
  if (error) {
    if (isMissingFunction(error)) {
      closedUntil = now + KILL_RETRY_MS
      return { data: null, unavailable: true }
    }
    return { data: null, unavailable: false }
  }
  closedUntil = 0
  return { data: parseKillLeaderboard(data), unavailable: false }
}
