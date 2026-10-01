/**
 * Calls to the mascot vote functions and table (migration 025), with every answer
 * validated by mascotVoteLogic.ts. The vote page uses this through the `VoteApi`
 * interface; the admin dashboard can import the same functions and types.
 *
 * Nothing here throws: a failure comes back as a value, so a page can show an error
 * state instead of crashing.
 */
import { api } from './supabase'
import { MASCOT_ENTRIES } from '../data/mascotEntries'
import {
  classifyRpcError,
  parseCastResult,
  parseElection,
  parseMyBallot,
  parsePublicBallots,
  type CastOutcome,
  type Election,
  type MyBallot,
  type PublicBallots,
} from './mascotVoteLogic'

export * from './mascotVoteLogic'

/** A read that worked, or the reason it did not. `login` means the caller is not signed in. */
export type FetchResult<T> = { ok: true; value: T } | { ok: false; reason: 'login' | 'network' | 'malformed' }

/** Everything the vote page needs from the server. Tests and the dev preview swap it out. */
export interface VoteApi {
  /** The election with the highest id, or null when none exists. */
  fetchElection(): Promise<FetchResult<Election | null>>
  /** The signed-in member's own ballot, or null when they have not voted. */
  fetchMyBallot(): Promise<FetchResult<MyBallot | null>>
  /** Counted ballots, rankings only; null until the election is published. */
  fetchPublicBallots(): Promise<FetchResult<PublicBallots | null>>
  castBallot(rankings: readonly string[]): Promise<CastOutcome>
}

/** Who is looking at the page, as far as the vote is concerned. */
export type Viewer = 'out' | 'nodiscord' | 'ready'

/** Where the page gets its data. Production uses `liveVoteApi`; the dev preview swaps in canned data. */
export interface VoteSource {
  api: VoteApi
  /** Set only by the dev preview; the live page works this out from the signed-in user. */
  viewer?: Viewer
  /** Set only by the dev preview, to show a half-built ballot. */
  initialRanking?: string[]
}

const ENTRY_IDS = MASCOT_ENTRIES.map((e) => e.id)

export async function fetchElection(): Promise<FetchResult<Election | null>> {
  try {
    const { data, error } = await api
      .getClient()
      .from('mascot_elections')
      .select('id,status,closes_at,draw_order,published_at')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return { ok: false, reason: 'network' }
    const parsed = parseElection(data, ENTRY_IDS)
    return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export async function fetchMyBallot(): Promise<FetchResult<MyBallot | null>> {
  try {
    const { data, error } = await api.getClient().rpc('mascot_my_ballot')
    if (error) return { ok: false, reason: classifyRpcError(error) }
    const parsed = parseMyBallot(data)
    return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export async function fetchPublicBallots(): Promise<FetchResult<PublicBallots | null>> {
  try {
    const { data, error } = await api.getClient().rpc('mascot_public_ballots')
    if (error) return { ok: false, reason: 'network' }
    const parsed = parsePublicBallots(data, ENTRY_IDS)
    return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export async function castBallot(rankings: readonly string[]): Promise<CastOutcome> {
  try {
    const { data, error } = await api.getClient().rpc('mascot_cast_ballot', { p_rankings: [...rankings] })
    if (error) return classifyRpcError(error)
    return parseCastResult(data) ?? 'unexpected'
  } catch {
    return 'network'
  }
}

export const liveVoteApi: VoteApi = { fetchElection, fetchMyBallot, fetchPublicBallots, castBallot }
