/**
 * The three races on /metrics, as pure math (metricsRaces.test.ts): the feed from
 * aurora.metrics_races(p_server) (migration 052), the hourly clock in US Eastern time,
 * who leads and when the lead last changed, how long a "+N" tag lingers, lives built from
 * deaths, and the moments the longest-alive race holds for a big death.
 *
 * A race has one step per hour from the season's start to now. Step 0 is the first hour;
 * the last step is the hour now is in. Times inside a race are hours since the season start,
 * so every number is the same in every time zone; only the labels are Eastern.
 */
import type { RpcCall } from './homeSummaryRpc'
import { shownName, type NameMode } from './nameMode'

export const METRICS_RACES_FN = 'metrics_races'

/** Milliseconds per hour of the season at Slow, Normal and Fast. Normal plays a season in about 80 seconds. */
export const SPEED_MS: readonly number[] = [160, 70, 25]
export const SPEED_LABELS: readonly string[] = ['Slow', 'Normal', 'Fast']
export const DEFAULT_SPEED = 1

/** How long a "+N" kill tag stays up, at any speed. */
export const BURST_HOLD_MS = 2500
/** How long a crumbling bar stays on screen, at any speed. */
export const CRUMBLE_MS = 3600
/** How long the longest-alive race holds when a life of BIG_LIFE_DAYS or more ends. */
export const BIG_DEATH_HOLD_MS = 3200
export const BIG_LIFE_DAYS = 10
/** An hour with this many kills or more gets its own headline. */
export const BIG_HOUR_KILLS = 250

const HOUR_MS = 3600000

// ---------------------------------------------------------------------------
// The feed
// ---------------------------------------------------------------------------

export interface RaceTrack {
  username: string
  displayName: string
  /** The race's number in each step (kills in the hour, minutes in the hour). */
  perStep: number[]
  /** The running total after each step. */
  cumulative: number[]
  /** For each step, the latest step at or before it with anything in it (-1 before the first). */
  lastActiveStep: number[]
}

export interface Death {
  /** Hours since the season start. */
  atHour: number
  /** In-game hours the character had survived when it died. */
  survivedHours: number
}

export interface LivesEntry {
  username: string
  displayName: string
  isDead: boolean
  hoursSurvived: number
  /** Hours since the season start; null when not known. */
  firstSeenHour: number | null
  deaths: Death[]
}

export interface RaceFeed {
  seasonStart: Date
  now: Date
  /** The last step: the hour now is in. */
  lastStep: number
  kills: RaceTrack[]
  /** Every player's kills together, per step. */
  killTotals: number[]
  time: RaceTrack[]
  lives: LivesEntry[]
  /** play_sessions (the server logs) has rows: time played reaches back to the season start. */
  sessionsImported: boolean
}

/**
 * The feed with every player's shown name set from the Survivor name / Username switch
 * (lib/nameMode.ts, the same saved choice as the home page and the live map). Only
 * displayName changes; username stays the key, so a switch never reorders or restarts a race.
 */
export function feedWithNames(feed: RaceFeed, mode: NameMode): RaceFeed {
  const rename = <T extends { username: string; displayName: string }>(p: T): T => ({ ...p, displayName: shownName(p, mode) })
  return { ...feed, kills: feed.kills.map(rename), time: feed.time.map(rename), lives: feed.lives.map(rename) }
}

function record(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function isoDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function finiteNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

/** [hour, n, hour, n, ...] into one number per step; odd, negative or out-of-range pairs are skipped. */
export function expandSparse(pairs: unknown, length: number): number[] {
  const out = new Array<number>(length).fill(0)
  if (!Array.isArray(pairs)) return out
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const hour = pairs[i]
    const n = pairs[i + 1]
    if (typeof hour !== 'number' || typeof n !== 'number' || !Number.isInteger(hour) || n < 0) continue
    if (hour >= 0 && hour < length) out[hour] += n
  }
  return out
}

export function runningTotal(perStep: readonly number[]): number[] {
  let run = 0
  return perStep.map((n) => (run += n))
}

export function lastActive(perStep: readonly number[]): number[] {
  let last = -1
  return perStep.map((n, i) => {
    if (n > 0) last = i
    return last
  })
}

export function makeTrack(username: string, displayName: string, perStep: number[]): RaceTrack {
  return { username, displayName, perStep, cumulative: runningTotal(perStep), lastActiveStep: lastActive(perStep) }
}

function parseTracks(list: unknown, length: number): RaceTrack[] {
  const tracks: RaceTrack[] = []
  if (!Array.isArray(list)) return tracks
  for (const p of list) {
    const o = record(p)
    if (!o || typeof o.username !== 'string' || o.username === '') continue
    const name = typeof o.display_name === 'string' && o.display_name ? o.display_name : o.username
    tracks.push(makeTrack(o.username, name, expandSparse(o.series, length)))
  }
  return tracks
}

/** Null when the answer has no usable season start; otherwise every race, empty where there is nothing. */
export function parseRaces(raw: unknown): RaceFeed | null {
  const r = record(raw)
  if (!r) return null
  const seasonStart = isoDate(r.season_start)
  const now = isoDate(r.now)
  if (!seasonStart || !now) return null
  const lastStep = Math.max(0, Math.floor((now.getTime() - seasonStart.getTime()) / HOUR_MS))
  const length = lastStep + 1

  const kills = record(r.kills)
  const lives = record(r.lives)
  const time = record(r.time)

  const entries: LivesEntry[] = []
  if (lives && Array.isArray(lives.players)) {
    for (const p of lives.players) {
      const o = record(p)
      if (!o || typeof o.username !== 'string' || o.username === '') continue
      const deaths: Death[] = []
      if (Array.isArray(o.deaths)) {
        for (const d of o.deaths) {
          const at = Array.isArray(d) ? isoDate(d[0]) : null
          const hours = Array.isArray(d) ? finiteNumber(d[1]) : null
          if (at && hours !== null && hours >= 0) {
            deaths.push({ atHour: (at.getTime() - seasonStart.getTime()) / HOUR_MS, survivedHours: hours })
          }
        }
        deaths.sort((a, b) => a.atHour - b.atHour)
      }
      const first = isoDate(o.first_seen)
      entries.push({
        username: o.username,
        displayName: typeof o.display_name === 'string' && o.display_name ? o.display_name : o.username,
        isDead: o.is_dead === true,
        hoursSurvived: Math.max(0, finiteNumber(o.hours_survived) ?? 0),
        firstSeenHour: first ? (first.getTime() - seasonStart.getTime()) / HOUR_MS : null,
        deaths,
      })
    }
  }

  return {
    seasonStart,
    now,
    lastStep,
    kills: parseTracks(kills?.players, length),
    killTotals: expandSparse(kills?.hourly_totals, length),
    time: parseTracks(time?.players, length),
    lives: entries,
    sessionsImported: r.sessions_imported === true,
  }
}

export async function callRaces(rpc: RpcCall, server: string): Promise<RaceFeed | null> {
  const { data, error } = await rpc(METRICS_RACES_FN, { p_server: server })
  if (error) return null
  return parseRaces(data)
}

// ---------------------------------------------------------------------------
// The clock: US Eastern, following the clock changes
// ---------------------------------------------------------------------------

const EASTERN = 'America/New_York'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const clockParts = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  weekday: 'short',
})

export interface EasternClock {
  /** Local calendar day, YYYY-MM-DD. */
  dayKey: string
  /** "Thu, Oct 22". */
  dayLabel: string
  /** "Oct 22". */
  shortDay: string
  /** 0..23, on the Eastern wall clock. */
  hourOfDay: number
  /** "1 PM". */
  hourLabel: string
}

export function hourLabel(hourOfDay: number): string {
  const h = ((hourOfDay % 24) + 24) % 24
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`
}

/** The Eastern wall clock at an instant. On the night the clocks fall back, 1 AM happens twice. */
export function easternAt(instant: Date): EasternClock {
  const parts = clockParts.formatToParts(instant)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const year = get('year')
  const month = Number(get('month'))
  const day = Number(get('day'))
  const hourOfDay = Number(get('hour')) % 24
  return {
    dayKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    dayLabel: `${get('weekday')}, ${MONTHS[month - 1]} ${day}`,
    shortDay: `${MONTHS[month - 1]} ${day}`,
    hourOfDay,
    hourLabel: hourLabel(hourOfDay),
  }
}

export function stepInstant(seasonStart: Date, step: number): Date {
  return new Date(seasonStart.getTime() + step * HOUR_MS)
}

export function clockAtStep(seasonStart: Date, step: number): EasternClock {
  return easternAt(stepInstant(seasonStart, step))
}

export interface DayBucket {
  dayKey: string
  label: string
  total: number
}

/** Kills (or anything per step) added up by Eastern calendar day, in order, every day present. */
export function totalsByEasternDay(seasonStart: Date, perStep: readonly number[]): DayBucket[] {
  const out: DayBucket[] = []
  const index = new Map<string, DayBucket>()
  perStep.forEach((n, step) => {
    const c = clockAtStep(seasonStart, step)
    let bucket = index.get(c.dayKey)
    if (!bucket) {
      bucket = { dayKey: c.dayKey, label: c.shortDay, total: 0 }
      index.set(c.dayKey, bucket)
      out.push(bucket)
    }
    bucket.total += n
  })
  return out
}

/** Added up by Eastern hour of the day, 24 numbers (the repeated 1 AM of a fall-back night counts in the 1 AM slot). */
export function totalsByEasternHour(seasonStart: Date, perStep: readonly number[]): number[] {
  const out = new Array<number>(24).fill(0)
  perStep.forEach((n, step) => {
    out[clockAtStep(seasonStart, step).hourOfDay] += n
  })
  return out
}

// ---------------------------------------------------------------------------
// Who leads
// ---------------------------------------------------------------------------

/** Player indexes in race order at a step: most first, ties by their order in the feed. */
export function standingsAt(tracks: readonly RaceTrack[], step: number): number[] {
  return tracks
    .map((_, i) => i)
    .sort((a, b) => tracks[b].cumulative[step] - tracks[a].cumulative[step] || a - b)
}

export interface Leadership {
  /** The index leading at each step, -1 while nobody has anything. */
  leader: number[]
  /** For each step, the latest step at which the lead changed hands (-1 if never). */
  lastChange: number[]
}

/**
 * Who leads at each step and when the lead last changed. A change counts only when someone
 * already led before it (the first player to score is not a "lead change").
 */
export function leadership(tracks: readonly RaceTrack[], lastStep: number): Leadership {
  const leader: number[] = []
  const lastChange: number[] = []
  for (let step = 0; step <= lastStep; step++) {
    let best = -1
    tracks.forEach((t, i) => {
      if (t.cumulative[step] > 0 && (best < 0 || t.cumulative[step] > tracks[best].cumulative[step])) best = i
    })
    leader.push(best)
    if (step > 0 && best !== leader[step - 1] && leader[step - 1] >= 0) lastChange.push(step)
    else lastChange.push(step > 0 ? lastChange[step - 1] : -1)
  }
  return { leader, lastChange }
}

/** How many steps a "+N" tag stays up at a speed: about BURST_HOLD_MS, never fewer than 3 steps. */
export function burstHoldSteps(msPerStep: number): number {
  return Math.max(3, Math.ceil(BURST_HOLD_MS / msPerStep))
}

export interface Burst {
  /** The number in the tag, e.g. kills in the hour it happened. */
  amount: number
  /** 0 when fresh, up to 1 as it fades out. */
  fade: number
}

/** The tag a track shows at a step, or null: its latest active step, while it is younger than the hold. */
export function burstAt(track: RaceTrack, step: number, msPerStep: number): Burst | null {
  const hit = track.lastActiveStep[step]
  if (hit < 0) return null
  const hold = burstHoldSteps(msPerStep)
  const age = step - hit
  if (age >= hold) return null
  return { amount: track.perStep[hit], fade: age / hold }
}

/** The biggest single-step number happening right now (age 0), or null when nobody scored this step. */
export function biggestThisStep(tracks: readonly RaceTrack[], step: number): { name: string; amount: number } | null {
  let top: { name: string; amount: number } | null = null
  for (const t of tracks) {
    const n = t.perStep[step]
    if (n > 0 && (!top || n > top.amount)) top = { name: t.displayName, amount: n }
  }
  return top
}

export interface HeadlineWords {
  /** "kills" or similar, used in "X leads with 12 kills." */
  total: (track: RaceTrack, step: number) => string
}

/**
 * The line above a race. In order of priority: the start prompt, a lead change in the last
 * 36 steps, who leads. A step of BIG_HOUR_KILLS or more is called out in front when
 * `bigHourVerb` is given (the kill race).
 */
export function raceHeadline(
  tracks: readonly RaceTrack[],
  lead: Leadership,
  step: number,
  seasonStart: Date,
  words: HeadlineWords,
  bigHourVerb?: string,
): string {
  const who = lead.leader[step]
  let line = who >= 0 ? `${tracks[who].displayName} leads with ${words.total(tracks[who], step)}.` : 'Nobody has scored yet.'
  const change = lead.lastChange[step]
  if (change >= 0 && step - change < 36 && lead.leader[change] >= 0 && lead.leader[change - 1] >= 0) {
    const clock = clockAtStep(seasonStart, change)
    line = `${clock.shortDay}, ${clock.hourLabel}: ${tracks[lead.leader[change]].displayName} takes first place from ${tracks[lead.leader[change - 1]].displayName}.`
  }
  if (bigHourVerb) {
    const big = biggestThisStep(tracks, step)
    if (big && big.amount >= BIG_HOUR_KILLS) line = `${big.name} ${bigHourVerb} ${NUMBER.format(big.amount)} in one hour. ${line}`
  }
  return line
}

const NUMBER = new Intl.NumberFormat('en-US')

// ---------------------------------------------------------------------------
// Longest alive: lives built from deaths
// ---------------------------------------------------------------------------

export interface Life {
  /** Hours since the season start; may be negative for a character from before the season. */
  startHour: number
  /** The death's hour, or null while the character lives. */
  endHour: number | null
  /** Days survived, in game days (in-game hours / 24). */
  days: number
}

/**
 * Lives from the death records: each death ends a life and the next life starts at that death;
 * the last life is open when the player is not dead, and runs to now. A first life starts when
 * the player was first seen (the season start when that is not known). Lives are never taken
 * from aurora.lives, which also splits on reconnects and would hide short lives.
 */
export function buildLives(entry: LivesEntry): Life[] {
  const lives: Life[] = []
  let start = entry.firstSeenHour ?? 0
  for (const d of entry.deaths) {
    lives.push({ startHour: start, endHour: d.atHour, days: d.survivedHours / 24 })
    start = d.atHour
  }
  if (!entry.isDead) lives.push({ startHour: start, endHour: null, days: entry.hoursSurvived / 24 })
  return lives
}

/** Days survived by one life at hour `t`: grows evenly from its start to its end (or to nowHour for an open life). */
export function lifeDaysAt(life: Life, t: number, nowHour: number): number {
  if (t < life.startHour) return 0
  if (life.endHour !== null && t >= life.endHour) return life.days
  const end = life.endHour === null ? nowHour : life.endHour
  const span = Math.max(0.0001, end - life.startHour)
  return life.days * Math.min(1, Math.max(0, (t - life.startHour) / span))
}

export interface LifeState {
  /** Days survived by the current life (0 when dead right now). */
  current: number
  /** Best life so far, in days. */
  best: number
  alive: boolean
  /** The latest life that has ended by `t`, or null. */
  lastDeath: Life | null
  /** Deaths so far. */
  deaths: number
}

export function lifeStateAt(lives: readonly Life[], t: number, nowHour: number): LifeState {
  let current = 0
  let best = 0
  let alive = false
  let lastDeath: Life | null = null
  let deaths = 0
  for (const life of lives) {
    if (life.startHour > t) continue
    if (life.endHour !== null && life.endHour <= t) {
      deaths += 1
      best = Math.max(best, life.days)
      if (!lastDeath || (life.endHour as number) > (lastDeath.endHour as number)) lastDeath = life
    } else {
      current = lifeDaysAt(life, t, nowHour)
      alive = true
      best = Math.max(best, current)
    }
  }
  return { current, best, alive, lastDeath, deaths }
}

export interface BigDeath {
  endHour: number
  name: string
  days: number
}

/** Every death of a life of BIG_LIFE_DAYS or more. */
export function bigDeaths(players: readonly { name: string; lives: readonly Life[] }[]): BigDeath[] {
  const out: BigDeath[] = []
  for (const p of players) {
    for (const l of p.lives) {
      if (l.endHour !== null && l.days >= BIG_LIFE_DAYS) out.push({ endHour: l.endHour, name: p.name, days: l.days })
    }
  }
  return out.sort((a, b) => a.endHour - b.endHour)
}

/** The big death that happened after `fromHour` up to and including `toHour`, if any. */
export function bigDeathBetween(bigs: readonly BigDeath[], fromHour: number, toHour: number): BigDeath | null {
  return bigs.find((d) => d.endHour > fromHour && d.endHour <= toHour) ?? null
}

/** How many steps a dying bar stays on screen so its crumble can play at a speed (never fewer than 3). */
export function crumbleSteps(msPerStep: number): number {
  return Math.max(3, Math.ceil(CRUMBLE_MS / msPerStep))
}

// ---------------------------------------------------------------------------
// Days survived in words
// ---------------------------------------------------------------------------

/** 0.3 -> "7 hours", 3.25 -> "3.3 days", 42.4 -> "42 days". */
export function formatDaysSurvived(days: number): string {
  const hours = Math.max(1, Math.round(days * 24))
  if (days >= 10) return `${Math.round(days)} days`
  if (days >= 1) return `${days.toFixed(1)} days`
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
}
