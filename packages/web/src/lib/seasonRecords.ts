/**
 * The home page's "Season records": the shape of aurora.season_records(p_server)
 * (T54, migration 034), read defensively, and the six award cards built from it.
 *
 * Pure of the Supabase client and the browser (the caller passes `rpc`), so all of it
 * is tested without either (seasonRecords.test.ts). Anything missing is null and the
 * card reads "No one yet".
 */
import { formatHoursSurvived } from './homeSummary'
import { isMissingFunction, type RpcCall } from './homeSummaryRpc'

/** The function name and its one argument: auroraClient.rpc('season_records', { p_server }). */
export const SEASON_RECORDS_FN = 'season_records'

/** How long a missing function is left alone before it is asked for again. */
export const SEASON_RETRY_MS = 5 * 60_000

export const NO_ONE = 'No one yet'

export interface FirstEvent {
  name: string
  t: string | null
  x: number | null
  y: number | null
  hoursSurvived: number | null
}
export interface MostKillsSeason { name: string; kills: number }
export interface MostKillsLife { name: string; kills: number; lifeNo: number | null; alive: boolean | null }
export interface LongestLife { name: string; hours: number; alive: boolean | null }
export interface BiggestFaction { name: string; tag: string | null; ownerName: string | null; members: number }

export interface SeasonRecords {
  worldSeq: number | null
  firstDeath: FirstEvent | null
  firstKill: FirstEvent | null
  mostKillsSeason: MostKillsSeason | null
  mostKillsOneLife: MostKillsLife | null
  longestLife: LongestLife | null
  biggestFaction: BiggestFaction | null
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function num(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function bool(v: unknown): boolean | null {
  return typeof v === 'boolean' ? v : null
}

function when(v: unknown): string | null {
  const s = str(v)
  return s !== null && !Number.isNaN(new Date(s).getTime()) ? s : null
}

function firstEvent(v: unknown): FirstEvent | null {
  if (!isRecord(v)) return null
  const name = str(v.name)
  if (name === null) return null
  return { name, t: when(v.t), x: num(v.x), y: num(v.y), hoursSurvived: num(v.hours_survived) }
}

function mostKillsSeason(v: unknown): MostKillsSeason | null {
  if (!isRecord(v)) return null
  const name = str(v.name)
  const kills = num(v.kills)
  return name === null || kills === null ? null : { name, kills }
}

function mostKillsLife(v: unknown): MostKillsLife | null {
  if (!isRecord(v)) return null
  const name = str(v.name)
  const kills = num(v.kills)
  if (name === null || kills === null) return null
  return { name, kills, lifeNo: num(v.life_no), alive: bool(v.alive) }
}

function longestLife(v: unknown): LongestLife | null {
  if (!isRecord(v)) return null
  const name = str(v.name)
  const hours = num(v.hours)
  return name === null || hours === null ? null : { name, hours, alive: bool(v.alive) }
}

function biggestFaction(v: unknown): BiggestFaction | null {
  if (!isRecord(v)) return null
  const name = str(v.name)
  const members = num(v.members)
  if (name === null || members === null) return null
  return { name, tag: str(v.tag), ownerName: str(v.owner_name), members }
}

/** The RPC's JSON as SeasonRecords, or null when it is not an object at all. */
export function parseSeasonRecords(raw: unknown): SeasonRecords | null {
  if (!isRecord(raw)) return null
  return {
    worldSeq: num(raw.world_seq),
    firstDeath: firstEvent(raw.first_death),
    firstKill: firstEvent(raw.first_kill),
    mostKillsSeason: mostKillsSeason(raw.most_kills_season),
    mostKillsOneLife: mostKillsLife(raw.most_kills_one_life),
    longestLife: longestLife(raw.longest_life),
    biggestFaction: biggestFaction(raw.biggest_faction),
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** The viewer's local date, "Oct 3"; '' when the value is not a date. */
export function formatDate(t: string | null | undefined): string {
  if (!t) return ''
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return ''
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** The viewer's local date and time, "Oct 3, 12:10 AM"; '' when the value is not a date. */
export function formatWhen(t: string | null | undefined): string {
  const date = formatDate(t)
  if (date === '') return ''
  const d = new Date(t as string)
  const h = d.getHours()
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${date}, ${hour12}:${minutes} ${h < 12 ? 'AM' : 'PM'}`
}

export interface AwardCard {
  key: string
  title: string
  holder: string
  value: string
  detail: string
  /** "See on the map" target, only for cards with a position. */
  mapHref: string | null
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

function aliveWord(alive: boolean | null): string | null {
  if (alive === null) return null
  return alive ? 'still alive' : 'ended'
}

function join(parts: Array<string | null>): string {
  return parts.filter((p): p is string => p !== null && p !== '').join(', ')
}

function mapLink(e: FirstEvent): string | null {
  if (e.x === null || e.y === null) return null
  return `/map/?x=${Math.round(e.x)}&y=${Math.round(e.y)}&zoom=15`
}

function empty(key: string, title: string): AwardCard {
  return { key, title, holder: NO_ONE, value: '', detail: '', mapHref: null }
}

/** The six awards in the owner's order. A missing holder reads "No one yet". */
export function awardCards(r: SeasonRecords | null): AwardCard[] {
  const d = r?.firstDeath ?? null
  const k = r?.firstKill ?? null
  const ms = r?.mostKillsSeason ?? null
  const ml = r?.mostKillsOneLife ?? null
  const ll = r?.longestLife ?? null
  const bf = r?.biggestFaction ?? null
  return [
    d
      ? {
          key: 'first-death',
          title: 'First death of the season',
          holder: d.name,
          value: d.hoursSurvived === null ? '' : `survived ${formatHoursSurvived(d.hoursSurvived)}`,
          detail: formatDate(d.t),
          mapHref: mapLink(d),
        }
      : empty('first-death', 'First death of the season'),
    k
      ? {
          key: 'first-kill',
          title: 'First kill of the season',
          holder: k.name,
          value: formatWhen(k.t),
          detail: '',
          mapHref: mapLink(k),
        }
      : empty('first-kill', 'First kill of the season'),
    ms
      ? {
          key: 'most-kills-season',
          title: 'Most kills this season',
          holder: ms.name,
          value: plural(ms.kills, 'kill', 'kills'),
          detail: '',
          mapHref: null,
        }
      : empty('most-kills-season', 'Most kills this season'),
    ml
      ? {
          key: 'most-kills-life',
          title: 'Most kills in one life',
          holder: ml.name,
          value: plural(ml.kills, 'kill', 'kills'),
          detail: join([ml.lifeNo === null ? null : `life ${ml.lifeNo}`, aliveWord(ml.alive)]),
          mapHref: null,
        }
      : empty('most-kills-life', 'Most kills in one life'),
    ll
      ? {
          key: 'longest-life',
          title: 'Longest living survivor',
          holder: ll.name,
          value: formatHoursSurvived(ll.hours),
          detail: aliveWord(ll.alive) ?? '',
          mapHref: null,
        }
      : empty('longest-life', 'Longest living survivor'),
    bf
      ? {
          key: 'biggest-faction',
          title: 'Biggest faction',
          holder: bf.name,
          value: plural(bf.members, 'member', 'members'),
          detail: join([bf.tag === null ? null : `tag ${bf.tag}`, bf.ownerName === null ? null : `led by ${bf.ownerName}`]),
          mapHref: null,
        }
      : empty('biggest-faction', 'Biggest faction'),
  ]
}

/** "Season 3 records", or plain "Season records" when the season is not known. */
export function sectionTitle(worldSeq: number | null | undefined): string {
  return typeof worldSeq === 'number' && Number.isFinite(worldSeq) ? `Season ${worldSeq} records` : 'Season records'
}

export const UNAVAILABLE_LINE = 'Records start counting when the season tracker goes live.'

export interface SeasonResult {
  records: SeasonRecords | null
  /** The function does not exist yet (034 not applied). */
  unavailable: boolean
}

/** Epoch ms before which the function is not asked for again. */
let closedUntil = 0

/** Test seam: forget that the function was found missing. */
export function resetSeasonProbe(): void {
  closedUntil = 0
}

/**
 * Ask for the records. A missing function (PGRST202) closes the call for SEASON_RETRY_MS
 * and answers `unavailable` without asking; any other error is a plain null result.
 */
export async function callSeasonRecords(rpc: RpcCall, serverId: string, now: number = Date.now()): Promise<SeasonResult> {
  if (now < closedUntil) return { records: null, unavailable: true }
  const { data, error } = await rpc(SEASON_RECORDS_FN, { p_server: serverId })
  if (error) {
    if (isMissingFunction(error)) {
      closedUntil = now + SEASON_RETRY_MS
      return { records: null, unavailable: true }
    }
    return { records: null, unavailable: false }
  }
  closedUntil = 0
  return { records: parseSeasonRecords(data), unavailable: false }
}
