/**
 * Pure logic for the admin dashboard (docs/planning/MascotVote/PLAN.md, Task 9): reading
 * what the admin functions return (migrations 024 and 025), the vote's status moves,
 * and the bar order for the results chart. No network, no React.
 *
 * Tests: adminDashboard.test.ts (`npm test` in packages/web).
 */
import type { ElectionStatus } from './mascotVoteLogic'
import type { CountResult } from './rankedChoice'

export type Parsed<T> = { ok: true; value: T } | { ok: false }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
const isString = (v: unknown): v is string => typeof v === 'string'
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === 'string'
const isTime = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v))
const isNullableTime = (v: unknown): v is string | null => v === null || isTime(v)

// ---------------------------------------------------------------------------
// Members (public.site_superadmin_members, migration 024)
// ---------------------------------------------------------------------------

export interface Member {
  userId: string
  email: string | null
  providers: string[]
  discordUsername: string | null
  discordId: string | null
  joinedAt: string
  lastSignInAt: string | null
  isAdmin: boolean
  isSuperadmin: boolean
}

export function parseMembers(raw: unknown): Parsed<Member[]> {
  if (!Array.isArray(raw)) return { ok: false }
  const out: Member[] = []
  for (const row of raw) {
    if (!isRecord(row)) return { ok: false }
    const { user_id, email, providers, discord_username, discord_id, joined_at, last_sign_in_at, is_admin, is_superadmin } = row
    if (!isString(user_id) || !isNullableString(email)) return { ok: false }
    if (!Array.isArray(providers) || !providers.every(isString)) return { ok: false }
    if (!isNullableString(discord_username) || !isNullableString(discord_id)) return { ok: false }
    if (!isTime(joined_at) || !isNullableTime(last_sign_in_at)) return { ok: false }
    if (typeof is_admin !== 'boolean' || typeof is_superadmin !== 'boolean') return { ok: false }
    out.push({
      userId: user_id,
      email,
      providers: [...providers],
      discordUsername: discord_username,
      discordId: discord_id,
      joinedAt: joined_at,
      lastSignInAt: last_sign_in_at,
      isAdmin: is_admin,
      isSuperadmin: is_superadmin,
    })
  }
  return { ok: true, value: out }
}

export function memberRole(m: Pick<Member, 'isAdmin' | 'isSuperadmin'>): 'Superadmin' | 'Admin' | 'Member' {
  return m.isSuperadmin ? 'Superadmin' : m.isAdmin ? 'Admin' : 'Member'
}

/** Case-insensitive match on Discord username or email. */
export function filterMembers(members: readonly Member[], query: string): Member[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...members]
  return members.filter((m) => (m.discordUsername ?? '').toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q))
}

// ---------------------------------------------------------------------------
// Ballots (public.mascot_admin_ballots, migration 025)
// ---------------------------------------------------------------------------

export interface AdminBallot {
  ballotId: string
  discordUsername: string | null
  discordId: string
  rankings: string[]
  createdAt: string
  counted: boolean
}

export function parseAdminBallots(raw: unknown, knownIds: readonly string[]): Parsed<AdminBallot[]> {
  if (!Array.isArray(raw)) return { ok: false }
  const out: AdminBallot[] = []
  for (const row of raw) {
    if (!isRecord(row)) return { ok: false }
    const { ballot_id, discord_username, discord_id, rankings, created_at, counted } = row
    if (!isString(ballot_id) || !isNullableString(discord_username) || !isString(discord_id)) return { ok: false }
    if (!Array.isArray(rankings) || rankings.length === 0 || !rankings.every((id) => isString(id) && knownIds.includes(id))) {
      return { ok: false }
    }
    if (!isTime(created_at) || typeof counted !== 'boolean') return { ok: false }
    out.push({ ballotId: ballot_id, discordUsername: discord_username, discordId: discord_id, rankings: [...rankings], createdAt: created_at, counted })
  }
  return { ok: true, value: out }
}

/** Case-insensitive match on the Discord username. */
export function filterBallots(ballots: readonly AdminBallot[], query: string): AdminBallot[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...ballots]
  return ballots.filter((b) => (b.discordUsername ?? '').toLowerCase().includes(q))
}

export function countedRankings(ballots: readonly AdminBallot[]): string[][] {
  return ballots.filter((b) => b.counted).map((b) => b.rankings)
}

// ---------------------------------------------------------------------------
// Status moves (public.mascot_admin_set_status, migration 025)
// ---------------------------------------------------------------------------

export interface StatusMove {
  to: ElectionStatus
  /** The button. */
  label: string
  /** The confirmation: what changes for the public. */
  effect: string
}

/** The moves the database allows from each status, in the order the buttons appear. */
export const STATUS_MOVES: Readonly<Record<ElectionStatus, readonly StatusMove[]>> = {
  draft: [{ to: 'open', label: 'Open voting', effect: 'Members with Discord can start casting ballots on /vote straight away.' }],
  open: [{ to: 'closed', label: 'Close voting', effect: 'No more ballots are accepted. Nothing is published yet.' }],
  closed: [
    { to: 'open', label: 'Reopen voting', effect: 'Members can cast ballots again. Ballots already cast stay as they are.' },
    {
      to: 'published',
      label: 'Publish results',
      effect:
        'Anyone can see the results on /vote and download the counted ballots (rankings only, no names). Ballots cannot be included or excluded while published.',
    },
  ],
  published: [{ to: 'closed', label: 'Unpublish', effect: 'The results and the ballot file disappear from /vote until you publish again.' }],
}

export const STATUS_TEXT: Readonly<Record<ElectionStatus, string>> = {
  draft: 'Not open yet. The vote page shows the entries and says voting opens soon.',
  open: 'Open. Members with Discord can vote.',
  closed: 'Closed. No ballots are accepted and nothing is public yet.',
  published: 'Published. The results and anonymized ballots are public on /vote.',
}

// ---------------------------------------------------------------------------
// The chart
// ---------------------------------------------------------------------------

export interface Bar {
  id: string
  votes: number
  /** Already out of the race in the chosen round (shown as 0 and marked "Eliminated"). */
  eliminated: boolean
}

/**
 * One bar per entry for a counting round (0-based index), most votes first, left to
 * right. Entries already eliminated in that round come last. Equal votes keep the entry
 * list's order, so the chart does not reshuffle between equal bars.
 */
export function barsForRound(result: CountResult, roundIndex: number, entryIds: readonly string[]): Bar[] {
  const round = result.rounds[roundIndex]
  const bars = entryIds.map((id, order) => {
    const v = round?.votes[id]
    return { id, votes: v ?? 0, eliminated: v === undefined, order }
  })
  bars.sort((a, b) => Number(a.eliminated) - Number(b.eliminated) || b.votes - a.votes || a.order - b.order)
  return bars.map(({ id, votes, eliminated }) => ({ id, votes, eliminated }))
}

/**
 * Gridline values for a vertical axis from 0 to at least `max`: whole numbers on a
 * 1, 2 or 5 step, about four lines. Votes are counts, so never a fraction.
 */
export function axisTicks(max: number): number[] {
  if (!(max > 0)) return [0, 1]
  const rough = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude)
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return ticks
}

// ---------------------------------------------------------------------------
// The closing-time field (<input type="datetime-local"> works in local time)
// ---------------------------------------------------------------------------

/** An ISO time as the value of a datetime-local input, in the viewer's time zone. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** A datetime-local value (viewer's time zone) as an ISO time; null when empty or invalid. */
export function fromLocalInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
