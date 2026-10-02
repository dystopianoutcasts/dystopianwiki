/**
 * Pure logic for the mascot vote page (docs/planning/MascotVote/PLAN.md, Task 7).
 * No network, no React, no Supabase import, so node can test it. The fetch and cast
 * functions that use these types live in mascotVote.ts; the count itself lives in
 * rankedChoice.ts and nowhere else.
 *
 * Tests: mascotVoteLogic.test.ts
 */
import type { Round, Winner } from './rankedChoice'

/** The most entries a ballot can hold: all six. */
export const MAX_RANKS = 6
/** A ballot with this many ranks can never run out before the final round. */
export const RECOMMENDED_RANKS = 5

// --------------------------------------------------------------------------
// Types shared with the database contract (migration 025)
// --------------------------------------------------------------------------

export const ELECTION_STATUSES = ['draft', 'open', 'closed', 'published'] as const
export type ElectionStatus = (typeof ELECTION_STATUSES)[number]

export interface Election {
  id: number
  status: ElectionStatus
  closesAt: string | null
  /** The six entry ids in the published random order. */
  drawOrder: string[]
  publishedAt: string | null
}

export interface MyBallot {
  rankings: string[]
  createdAt: string
}

export interface PublicBallots {
  ballots: string[][]
  /** Ballots admins marked as not counted. The ballots above are counted ones only. */
  excluded: number
}

export const CAST_RESULTS = ['ok', 'already_voted', 'not_open', 'no_discord', 'invalid'] as const
export type CastResult = (typeof CAST_RESULTS)[number]

/** What the page learns from one attempt to lock in a vote. */
export type CastOutcome = CastResult | 'login' | 'network' | 'unexpected'

export type Parsed<T> = { ok: true; value: T } | { ok: false }

// --------------------------------------------------------------------------
// Ranking list operations. Each returns a new array; none can produce a repeat
// or a gap, which is what makes an invalid ballot impossible to build.
// --------------------------------------------------------------------------

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th", 21 -> "21st". */
export function ordinal(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

/** Adds an entry at the end. Unchanged if it is already ranked or the list is full. */
export function addEntry(ranking: readonly string[], id: string, max: number = MAX_RANKS): string[] {
  if (ranking.includes(id) || ranking.length >= max) return [...ranking]
  return [...ranking, id]
}

/** Removes an entry; everything below it moves up one place. */
export function removeEntry(ranking: readonly string[], id: string): string[] {
  return ranking.filter((x) => x !== id)
}

/** Swaps an entry with the one above it. The first entry stays where it is. */
export function moveUp(ranking: readonly string[], id: string): string[] {
  const i = ranking.indexOf(id)
  if (i <= 0) return [...ranking]
  const next = [...ranking]
  ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
  return next
}

/** Swaps an entry with the one below it. The last entry stays where it is. */
export function moveDown(ranking: readonly string[], id: string): string[] {
  const i = ranking.indexOf(id)
  if (i < 0 || i >= ranking.length - 1) return [...ranking]
  const next = [...ranking]
  ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
  return next
}

/** Pressing an entry's art: rank it if it is not ranked, unrank it if it is. */
export function toggleEntry(ranking: readonly string[], id: string, max: number = MAX_RANKS): string[] {
  return ranking.includes(id) ? removeEntry(ranking, id) : addEntry(ranking, id, max)
}

/** A ballot needs at least one rank. */
export function canSubmit(ranking: readonly string[]): boolean {
  return ranking.length >= 1
}

/** True when the voter should be nudged to rank more (fewer than 5, but at least one). */
export function isShortBallot(ranking: readonly string[]): boolean {
  return ranking.length >= 1 && ranking.length < RECOMMENDED_RANKS
}

/** The lead line of the confirmation when fewer than five are ranked. */
export function shortBallotWarning(count: number, total: number = MAX_RANKS): string {
  return (
    `You ranked ${count} of ${total}. If all your picks are eliminated, your ballot stops counting. ` +
    `Rank at least ${RECOMMENDED_RANKS} and it counts to the end.`
  )
}

// --------------------------------------------------------------------------
// Screen reader announcements
// --------------------------------------------------------------------------

/** "Entry 3 ranked 2nd". */
export function announceAdded(name: string, position: number): string {
  return `${name} ranked ${ordinal(position)}`
}

/**
 * "Entry 3 removed" or, when others moved up, "Entry 3 removed; Entry 5 is now 3rd".
 * `before` is the ranking before the removal; the new places are worked out from it.
 */
export function announceRemoved(name: string, before: readonly string[], id: string, nameOf: (id: string) => string): string {
  const i = before.indexOf(id)
  if (i < 0) return `${name} removed`
  const moved = before.slice(i + 1)
  if (moved.length === 0) return `${name} removed`
  const parts = moved.map((m, k) => `${nameOf(m)} is now ${ordinal(i + 1 + k)}`)
  return `${name} removed; ${parts.join(', ')}`
}

/** "Entry 3 moved up to 1st". */
export function announceMoved(name: string, direction: 'up' | 'down', newPosition: number): string {
  return `${name} moved ${direction} to ${ordinal(newPosition)}`
}

// --------------------------------------------------------------------------
// Validating what the database sends back. Anything malformed is an error state
// for the page, never a crash.
// --------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === 'string')
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && value !== '' && !Number.isNaN(Date.parse(value))
}

/**
 * One row of mascot_elections. `null` (no election exists yet) is a valid answer.
 * The draw order must list every known entry exactly once, because the count refuses
 * anything else.
 */
export function parseElection(raw: unknown, knownIds: readonly string[]): Parsed<Election | null> {
  if (raw === null || raw === undefined) return { ok: true, value: null }
  if (!isRecord(raw)) return { ok: false }
  const { id, status, closes_at, draw_order, published_at } = raw
  if (typeof id !== 'number' || !Number.isInteger(id)) return { ok: false }
  if (typeof status !== 'string' || !(ELECTION_STATUSES as readonly string[]).includes(status)) return { ok: false }
  if (closes_at !== null && !isDateString(closes_at)) return { ok: false }
  if (published_at !== null && published_at !== undefined && !isDateString(published_at)) return { ok: false }
  if (!isStringArray(draw_order)) return { ok: false }
  const known = new Set(knownIds)
  if (draw_order.length !== known.size || new Set(draw_order).size !== draw_order.length) return { ok: false }
  if (!draw_order.every((x) => known.has(x))) return { ok: false }
  return {
    ok: true,
    value: {
      id,
      status: status as ElectionStatus,
      closesAt: closes_at,
      drawOrder: [...draw_order],
      publishedAt: typeof published_at === 'string' ? published_at : null,
    },
  }
}

/** mascot_my_ballot returns zero or one row; PostgREST sends an array. */
export function parseMyBallot(raw: unknown): Parsed<MyBallot | null> {
  if (raw === null || raw === undefined) return { ok: true, value: null }
  const rows: unknown[] = Array.isArray(raw) ? raw : [raw]
  if (rows.length === 0) return { ok: true, value: null }
  if (rows.length > 1) return { ok: false }
  const row = rows[0]
  if (!isRecord(row) || !isStringArray(row.rankings) || row.rankings.length === 0) return { ok: false }
  if (!isDateString(row.created_at)) return { ok: false }
  return { ok: true, value: { rankings: [...row.rankings], createdAt: row.created_at } }
}

/** mascot_public_ballots: null until published, then rankings only plus the excluded count. */
export function parsePublicBallots(raw: unknown, knownIds: readonly string[]): Parsed<PublicBallots | null> {
  if (raw === null || raw === undefined) return { ok: true, value: null }
  if (!isRecord(raw)) return { ok: false }
  const { ballots, excluded } = raw
  if (!Array.isArray(ballots) || !ballots.every(isStringArray)) return { ok: false }
  // Every id must be one of the real entries: an unknown id would silently count as exhausted.
  if (!ballots.every((b) => b.length > 0 && b.every((id) => knownIds.includes(id)))) return { ok: false }
  if (typeof excluded !== 'number' || !Number.isInteger(excluded) || excluded < 0) return { ok: false }
  return { ok: true, value: { ballots: ballots.map((b) => [...b]), excluded } }
}

export function parseCastResult(raw: unknown): CastResult | null {
  return typeof raw === 'string' && (CAST_RESULTS as readonly string[]).includes(raw) ? (raw as CastResult) : null
}

/**
 * Tells "you are not signed in" from "the network failed" in an error returned by
 * supabase-js. A logged-out caller gets a permission error (code 42501 or HTTP 401/403).
 */
export function classifyRpcError(error: { code?: unknown; message?: unknown; status?: unknown } | null | undefined): 'login' | 'network' {
  if (!error) return 'network'
  if (error.code === '42501') return 'login'
  if (error.status === 401 || error.status === 403) return 'login'
  const message = typeof error.message === 'string' ? error.message : ''
  return /permission denied|not authenticated|jwt/i.test(message) ? 'login' : 'network'
}

/**
 * The status the page acts on. An open election whose closing time has passed is
 * closed for the visitor, even before an admin moves it, because the server refuses
 * ballots after that moment.
 */
export function effectiveStatus(election: Pick<Election, 'status' | 'closesAt'>, now: number): ElectionStatus {
  if (election.status === 'open' && election.closesAt !== null) {
    const closes = Date.parse(election.closesAt)
    if (!Number.isNaN(closes) && now >= closes) return 'closed'
  }
  return election.status
}

// --------------------------------------------------------------------------
// Words for the results
// --------------------------------------------------------------------------

/** "A", "A and B", "A, B and C". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** "Entry 4, Entry 1, Entry 6". */
export function drawOrderText(drawOrder: readonly string[], nameOf: (id: string) => string): string {
  return drawOrder.map(nameOf).join(', ')
}

/**
 * One sentence for what happened at the end of a round, including how a tie was settled.
 * `winner` is only used for the round where counting stopped.
 */
export function roundNote(round: Round, nameOf: (id: string) => string, winner: Winner | null): string {
  if (round.eliminated === null) {
    if (winner === null) return 'No ballots were left to count.'
    return `${nameOf(winner.id)} has ${winner.votes} of ${winner.active} active ballots, which is more than half, and wins.`
  }
  const out = nameOf(round.eliminated)
  const n = round.votes[round.eliminated] ?? 0
  const tb = round.tieBreak
  if (tb === null || tb.kind === 'none') {
    return `${out} had the fewest votes (${n}) and was eliminated.`
  }
  const tied = joinNames(tb.tied.map(nameOf))
  if (tb.kind === 'earlier-round') {
    return `${tied} were tied on ${n}; ${out} had fewer in round ${tb.round}, so it was eliminated.`
  }
  return `${tied} were tied on ${n}, and no earlier round separated them; ${out} comes first in the tie-breaker order, so it was eliminated.`
}
