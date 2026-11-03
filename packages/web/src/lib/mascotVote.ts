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
  parseElections,
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
  /** Every election, oldest first; the last is the current one (a runoff, once there is one). */
  fetchElections(): Promise<FetchResult<Election[]>>
  /** The signed-in member's own ballot in the current election, or null when they have not voted. */
  fetchMyBallot(): Promise<FetchResult<MyBallot | null>>
  /** One election's counted ballots, rankings only; null until that election is published. */
  fetchPublicBallots(electionId: number): Promise<FetchResult<PublicBallots | null>>
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

export async function fetchElections(): Promise<FetchResult<Election[]>> {
  try {
    const { data, error } = await api
      .getClient()
      .from('mascot_elections')
      .select('id,status,closes_at,draw_order,published_at,entries,runoff_of')
      .order('id', { ascending: true })
    if (error) return { ok: false, reason: 'network' }
    const parsed = parseElections(data, ENTRY_IDS)
    return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

/** The election with the highest id, or null when none exists: the one every action reaches. */
export async function fetchElection(): Promise<FetchResult<Election | null>> {
  const r = await fetchElections()
  return r.ok ? { ok: true, value: r.value[r.value.length - 1] ?? null } : r
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

export async function fetchPublicBallots(electionId: number): Promise<FetchResult<PublicBallots | null>> {
  try {
    const { data, error } = await api.getClient().rpc('mascot_public_ballots_of', { p_election: electionId })
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

export const liveVoteApi: VoteApi = { fetchElections, fetchMyBallot, fetchPublicBallots, castBallot }
