/**
 * The home page's server summary: the shape of aurora.home_summary() (migration 027),
 * read defensively, and the plain-language figures the home page shows from it.
 *
 * Pure functions only, so they can be tested without a browser (homeSummary.test.ts).
 * Anything the server has not reported comes back as null, and the page shows "TBD".
 */

export interface SandboxEntry {
  v: string | number | boolean
  label?: string
}

export interface Survivor {
  name: string
  hours: number
  online: boolean
}

export interface HourlyPoint {
  /** Start of the hour. */
  hour: Date
  /** Most players online at once during that hour. */
  peak: number
}

export interface HomeSummary {
  serverName: string | null
  lastSeen: Date | null
  upSince: Date | null
  onlineNow: number
  survivorsTotal: number
  survivors7d: number
  peak7d: number | null
  hourly: HourlyPoint[]
  zombiesKilledToday: number | null
  playersKilledToday: number | null
  longest: Survivor[]
  safehouses: number
  vehicles: number
  settings: Record<string, unknown>
  sandbox: Record<string, SandboxEntry>
  configUpdatedAt: Date | null
  /** In-game hours since the world began (migration 030). */
  worldAgeHours: number | null
  /** The server's version, e.g. "42.21.0" (030). */
  gameVersion: string | null
  /** The time zone the "today" counters were counted in (030); null from the one-argument form. */
  dayTz: string | null
  /** Which world this is (032); null from a database without 032 or before a world is recorded. */
  worldSeq: number | null
  /** When that world began (032). */
  worldStartedAt: Date | null
  /** A new world is waiting for an admin's confirmation (032); false when absent. */
  worldPending: boolean
}

/** Shown wherever a figure is not available yet. */
export const TBD = 'TBD'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function num(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function date(v: unknown): Date | null {
  if (typeof v !== 'string' || v === '') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

/** The RPC's JSON as a HomeSummary, or null when it is not that shape at all. */
export function parseHomeSummary(raw: unknown): HomeSummary | null {
  if (!isRecord(raw)) return null
  if (!('online_now' in raw) || !('hourly_7d' in raw)) return null

  const hourly: HourlyPoint[] = []
  if (Array.isArray(raw.hourly_7d)) {
    for (const p of raw.hourly_7d) {
      if (!Array.isArray(p) || p.length < 2) continue
      const t = num(p[0])
      const peak = num(p[1])
      if (t === null || peak === null) continue
      hourly.push({ hour: new Date(t * 1000), peak })
    }
  }

  const longest: Survivor[] = []
  if (Array.isArray(raw.longest_survivors)) {
    for (const s of raw.longest_survivors) {
      if (!isRecord(s)) continue
      const name = str(s.name)
      const hours = num(s.hours)
      if (name === null || hours === null) continue
      longest.push({ name, hours, online: s.online === true })
    }
  }

  const sandbox: Record<string, SandboxEntry> = {}
  if (isRecord(raw.sandbox)) {
    for (const [key, entry] of Object.entries(raw.sandbox)) {
      if (!isRecord(entry)) continue
      const v = entry.v
      if (typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'boolean') continue
      sandbox[key] = typeof entry.label === 'string' ? { v, label: entry.label } : { v }
    }
  }

  return {
    serverName: str(raw.server_name),
    lastSeen: date(raw.last_seen),
    upSince: date(raw.up_since),
    onlineNow: num(raw.online_now) ?? 0,
    survivorsTotal: num(raw.survivors_total) ?? 0,
    survivors7d: num(raw.survivors_7d) ?? 0,
    peak7d: num(raw.peak_7d),
    hourly,
    zombiesKilledToday: num(raw.zombies_killed_today),
    playersKilledToday: num(raw.players_killed_today),
    longest,
    safehouses: num(raw.safehouses) ?? 0,
    vehicles: num(raw.vehicles) ?? 0,
    settings: isRecord(raw.settings) ? raw.settings : {},
    sandbox,
    configUpdatedAt: date(raw.config_updated_at),
    worldAgeHours: num(raw.world_age_hours),
    gameVersion: str(raw.game_version),
    dayTz: str(raw.day_tz),
    worldSeq: num(raw.world_seq),
    worldStartedAt: date(raw.world_started_at),
    worldPending: raw.world_pending === true,
  }
}

/**
 * The server reports in every few seconds while it runs (the ingest reads it each
 * minute), so a last word older than five minutes means it is down or restarting.
 */
export const ONLINE_WITHIN_MS = 5 * 60 * 1000

export function isServerOnline(summary: HomeSummary | null, now: Date): boolean | null {
  if (!summary || !summary.lastSeen) return null
  return now.getTime() - summary.lastSeen.getTime() <= ONLINE_WITHIN_MS
}

/** "3 days 4 h", "5 h 12 min", "12 min". */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ${hours} h`
  if (hours > 0) return `${hours} h ${mins} min`
  return `${mins} min`
}

/** In-game hours survived as days and hours: "12 days 3 h", "5 h". */
export function formatHoursSurvived(hours: number): string {
  const whole = Math.max(0, Math.floor(hours))
  const days = Math.floor(whole / 24)
  const rest = whole % 24
  if (days === 0) return `${rest} h`
  return `${days} ${days === 1 ? 'day' : 'days'} ${rest} h`
}

/** In-game world age as days and hours, minutes dropped: "0 days 0 hours", "1 day 1 hour", "28 days 17 hours". */
export function formatWorldAge(hours: number): string {
  const whole = Math.max(0, Math.floor(hours))
  const days = Math.floor(whole / 24)
  const rest = whole % 24
  return `${days} ${days === 1 ? 'day' : 'days'} ${rest} ${rest === 1 ? 'hour' : 'hours'}`
}

/** A counter's text: 0 is a real answer ("0"); only a figure the server has not reported is TBD. */
export function counterText(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en-US') : TBD
}

/** "7 pm", "12 am". */
export function formatHour(h: number): string {
  const hour = ((h % 24) + 24) % 24
  const suffix = hour < 12 ? 'am' : 'pm'
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  return `${twelve} ${suffix}`
}

export interface BusiestHours {
  /** First hour of the busiest three-hour stretch, in the viewer's local time. */
  start: number
  /** Average of the hourly peaks across those three hours, over the week. */
  average: number
}

/**
 * The busiest three-hour stretch of the day in the viewer's time zone, averaged over
 * the week. `hourOf` maps a point to its local hour (0-23); the page passes
 * Date#getHours, the tests pass a fixed zone. Null when there is no data or nobody
 * played.
 */
export function busiestHours(hourly: HourlyPoint[], hourOf: (d: Date) => number = (d) => d.getHours()): BusiestHours | null {
  if (hourly.length === 0) return null
  const sums = new Array<number>(24).fill(0)
  const counts = new Array<number>(24).fill(0)
  for (const p of hourly) {
    const h = hourOf(p.hour)
    sums[h] += p.peak
    counts[h] += 1
  }
  const avg = sums.map((s, h) => (counts[h] > 0 ? s / counts[h] : 0))
  let best: BusiestHours | null = null
  for (let start = 0; start < 24; start++) {
    const average = (avg[start] + avg[(start + 1) % 24] + avg[(start + 2) % 24]) / 3
    if (best === null || average > best.average) best = { start, average }
  }
  return best && best.average > 0 ? best : null
}

/** The server's welcome text without Project Zomboid's <RGB:...> and <LINE> tags. */
export function cleanWelcome(text: unknown): string | null {
  if (typeof text !== 'string') return null
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean === '' ? null : clean
}

export interface SettingRow {
  label: string
  value: string
}

function label(summary: HomeSummary | null, key: string): string {
  const e = summary?.sandbox[key]
  if (!e) return TBD
  if (e.label) return e.label
  return String(e.v)
}

/** The one-word game mode, for the hero badges. */
export function modeBadge(summary: HomeSummary | null): string {
  const pvp = summary?.settings.PVP
  if (pvp === true) return 'PvP'
  if (pvp === false) return 'PvE'
  return TBD
}

/** How someone gets in: open, whitelist, and whether there is a password. */
export function joiningText(summary: HomeSummary | null): string {
  const open = summary?.settings.Open
  const password = summary?.settings.HasPassword
  if (open === undefined && password === undefined) return TBD
  const parts: string[] = []
  if (open === true) parts.push('Open to everyone')
  else if (open === false) parts.push('Whitelist: ask in Discord')
  if (password === true) parts.push('password from Discord')
  else if (password === false) parts.push('no password')
  return parts.length > 0 ? parts.join(', ') : TBD
}

/** Map= entries that are mod helpers, not places to play (owner, 2026-10-02). Compared lower-case. */
const NOT_REAL_MAPS = new Set(['lawnmower', 'vehicle spawn zones'])

/** The settings list on the home page, in reading order, with TBD where unknown. */
export function settingRows(summary: HomeSummary | null): SettingRow[] {
  const s = summary?.settings ?? {}
  const maxPlayers = num(s.MaxPlayers)
  const maps = Array.isArray(s.Map)
    ? (s.Map as unknown[]).filter(
        (m): m is string => typeof m === 'string' && !NOT_REAL_MAPS.has(m.trim().toLowerCase()),
      )
    : []
  const workshop = Array.isArray(s.WorkshopItems) ? (s.WorkshopItems as unknown[]).length : null
  const xp = summary?.sandbox['MultiplierConfig.Global']
  return [
    { label: 'Mode', value: modeBadge(summary) },
    { label: 'Player slots', value: maxPlayers !== null ? String(maxPlayers) : TBD },
    { label: 'Joining', value: joiningText(summary) },
    { label: 'Map', value: maps.length > 0 ? maps.join(', ') : TBD },
    { label: 'Workshop mods', value: workshop !== null ? String(workshop) : TBD },
    { label: 'Zombie population', value: label(summary, 'Zombies') },
    { label: 'Zombie speed', value: label(summary, 'ZombieLore.Speed') },
    { label: 'Zombie strength', value: label(summary, 'ZombieLore.Strength') },
    { label: 'Zombie toughness', value: label(summary, 'ZombieLore.Toughness') },
    { label: 'Infection', value: label(summary, 'ZombieLore.Transmission') },
    { label: 'Zombie respawn', value: label(summary, 'ZombieRespawn') },
    { label: 'Day length', value: label(summary, 'DayLength') },
    { label: 'XP rate', value: xp && typeof xp.v === 'number' ? `${xp.v}x` : TBD },
    { label: 'World age', value: summary?.worldAgeHours != null ? formatWorldAge(summary.worldAgeHours) : TBD },
    { label: 'Game version', value: summary?.gameVersion ?? TBD },
  ]
}
