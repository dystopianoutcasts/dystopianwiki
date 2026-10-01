/**
 * DEV ONLY. Canned data so every state of /vote can be seen before the database
 * functions exist: http://localhost:5173/vote?preview=<state>[&cast=<outcome>]
 *
 * The page imports this with a dynamic import behind `import.meta.env.DEV`, so Vite
 * removes both the branch and this module from the production build. The marker string
 * below is what the build is grepped for to prove that.
 */
import type { CastOutcome, Election, FetchResult, MyBallot, PublicBallots, VoteApi, VoteSource, Viewer } from './mascotVote'

export const MASCOT_PREVIEW_MARKER = 'mascot-vote-dev-preview-marker'

export const PREVIEW_STATES = [
  'loading',
  'error',
  'draft-out',
  'draft-nodiscord',
  'draft-ready',
  'open-out',
  'open-nodiscord',
  'open-ready',
  'open-ranked',
  'open-ranked-five',
  'voted',
  'closed',
  'closed-voted',
  'published',
  'published-empty',
  'published-error',
] as const
export type PreviewState = (typeof PREVIEW_STATES)[number]

export const CAST_OUTCOMES: readonly CastOutcome[] = ['ok', 'already_voted', 'not_open', 'no_discord', 'invalid', 'login', 'network', 'unexpected']

const DRAW_ORDER = ['art_004', 'art_001', 'art_006', 'art_002', 'art_005', 'art_003']
const IDS = ['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_006']

/** A closing time a few days ahead of whenever the preview is opened. */
function closesInDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

/** Small deterministic generator so the canned ballots are the same on every load. */
function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** About sixty plausible ballots: a favourite or two, most people ranking five or six. */
export function cannedBallots(count = 64): string[][] {
  const rand = lcg(42)
  const weight: Record<string, number> = { art_001: 9, art_002: 14, art_003: 6, art_004: 12, art_005: 11, art_006: 5 }
  const ballots: string[][] = []
  for (let i = 0; i < count; i++) {
    const pool = [...IDS]
    const ballot: string[] = []
    const length = rand() < 0.2 ? 1 + Math.floor(rand() * 3) : rand() < 0.5 ? 5 : 6
    while (ballot.length < length) {
      const total = pool.reduce((sum, id) => sum + weight[id], 0)
      let pick = rand() * total
      let k = 0
      for (; k < pool.length - 1; k++) {
        pick -= weight[pool[k]]
        if (pick < 0) break
      }
      ballot.push(pool.splice(k, 1)[0])
    }
    ballots.push(ballot)
  }
  return ballots
}

function election(status: Election['status'], closesAt: string | null = null): Election {
  return {
    id: 1,
    status,
    closesAt,
    drawOrder: DRAW_ORDER,
    publishedAt: status === 'published' ? '2026-10-20T18:00:00Z' : null,
  }
}

const ok = <T,>(value: T): FetchResult<T> => ({ ok: true, value })

export function previewSource(state: string, cast: string | null): VoteSource | null {
  if (!(PREVIEW_STATES as readonly string[]).includes(state)) return null
  const name = state as PreviewState
  const wanted: CastOutcome = (CAST_OUTCOMES as readonly string[]).includes(cast ?? '') ? (cast as CastOutcome) : 'ok'

  let myBallot: MyBallot | null =
    name === 'voted' || name === 'closed-voted'
      ? { rankings: ['art_002', 'art_005', 'art_004', 'art_001', 'art_006'], createdAt: '2026-10-08T15:30:00Z' }
      : null

  let current: Election | null
  switch (name) {
    case 'draft-out':
    case 'draft-nodiscord':
    case 'draft-ready':
      current = election('draft')
      break
    case 'closed':
    case 'closed-voted':
      current = election('closed', closesInDays(-1))
      break
    case 'published':
    case 'published-empty':
    case 'published-error':
      current = election('published', closesInDays(-10))
      break
    default:
      current = election('open', closesInDays(5))
  }

  const viewer: Viewer = name.endsWith('-out') ? 'out' : name.endsWith('-nodiscord') ? 'nodiscord' : 'ready'
  const never = new Promise<never>(() => {})

  const api: VoteApi = {
    async fetchElection() {
      if (name === 'loading') return never
      if (name === 'error') return { ok: false, reason: 'network' }
      return ok(current)
    },
    async fetchMyBallot() {
      return ok(myBallot)
    },
    async fetchPublicBallots(): Promise<FetchResult<PublicBallots | null>> {
      if (name === 'published-error') return { ok: false, reason: 'malformed' }
      if (name === 'published-empty') return ok({ ballots: [], excluded: 0 })
      return ok({ ballots: cannedBallots(), excluded: 3 })
    },
    async castBallot(rankings) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      if (wanted === 'ok' || wanted === 'already_voted') {
        myBallot = { rankings: [...rankings], createdAt: new Date().toISOString() }
      }
      if (wanted === 'not_open' && current) current = { ...current, status: 'closed' }
      return wanted
    },
  }

  return {
    api,
    viewer,
    initialRanking:
      name === 'open-ranked' ? ['art_003', 'art_005', 'art_002'] : name === 'open-ranked-five' ? ['art_002', 'art_005', 'art_004', 'art_001', 'art_006'] : undefined,
  }
}
