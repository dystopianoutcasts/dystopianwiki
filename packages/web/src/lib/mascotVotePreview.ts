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
  'published-tie',
  'runoff-draft',
  'runoff-out',
  'runoff-open',
  'runoff-voted',
  'runoff-closed',
  'runoff-published',
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
    entries: IDS,
    runoffOf: null,
    drawOrder: DRAW_ORDER,
    publishedAt: status === 'published' ? '2026-10-20T18:00:00Z' : null,
  }
}

/** Election 2, settling election 1's tie between Entry 2 and Entry 4. */
function runoff(status: Election['status'], closesAt: string | null = null): Election {
  return {
    id: 2,
    status,
    closesAt,
    entries: ['art_002', 'art_004'],
    runoffOf: 1,
    drawOrder: ['art_004', 'art_002'],
    publishedAt: status === 'published' ? '2026-11-10T18:00:00Z' : null,
  }
}

/** The first vote's real ten ballots (rankings only, as published): a 5 to 5 tie. */
const TIED_BALLOTS: string[][] = [
  ['art_002'],
  ['art_002', 'art_004', 'art_003', 'art_005', 'art_006', 'art_001'],
  ['art_002', 'art_004', 'art_005', 'art_003', 'art_006'],
  ['art_002', 'art_006', 'art_003', 'art_001', 'art_004'],
  ['art_004', 'art_002', 'art_006', 'art_003', 'art_001'],
  ['art_004', 'art_003'],
  ['art_004', 'art_006', 'art_003', 'art_001', 'art_005', 'art_002'],
  ['art_004', 'art_006', 'art_003', 'art_002', 'art_001'],
  ['art_005', 'art_006', 'art_004', 'art_003', 'art_001', 'art_002'],
  ['art_006', 'art_002', 'art_004', 'art_005', 'art_003', 'art_001'],
]

/** A made-up runoff result: 23 to 18. */
const RUNOFF_BALLOTS: string[][] = [...Array.from({ length: 23 }, () => ['art_004']), ...Array.from({ length: 18 }, () => ['art_002'])]

const ok = <T,>(value: T): FetchResult<T> => ({ ok: true, value })

export function previewSource(state: string, cast: string | null): VoteSource | null {
  if (!(PREVIEW_STATES as readonly string[]).includes(state)) return null
  const name = state as PreviewState
  const wanted: CastOutcome = (CAST_OUTCOMES as readonly string[]).includes(cast ?? '') ? (cast as CastOutcome) : 'ok'

  let myBallot: MyBallot | null =
    name === 'voted' || name === 'closed-voted'
      ? { rankings: ['art_002', 'art_005', 'art_004', 'art_001', 'art_006'], createdAt: '2026-10-08T15:30:00Z' }
      : name === 'runoff-voted'
        ? { rankings: ['art_004'], createdAt: '2026-11-05T15:30:00Z' }
        : null

  const isRunoffState = name.startsWith('runoff-')
  let current: Election | null
  switch (name) {
    case 'runoff-draft':
      current = runoff('draft')
      break
    case 'runoff-out':
    case 'runoff-open':
    case 'runoff-voted':
      current = runoff('open', closesInDays(4))
      break
    case 'runoff-closed':
      current = runoff('closed', closesInDays(-1))
      break
    case 'runoff-published':
      current = runoff('published', closesInDays(-2))
      break
    case 'published-tie':
      current = election('published', closesInDays(-10))
      break
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
    async fetchElections() {
      if (name === 'loading') return never
      if (name === 'error') return { ok: false, reason: 'network' }
      if (!current) return ok([])
      return ok(isRunoffState ? [election('published', closesInDays(-10)), current] : [current])
    },
    async fetchMyBallot() {
      return ok(myBallot)
    },
    async fetchPublicBallots(electionId: number): Promise<FetchResult<PublicBallots | null>> {
      if (name === 'published-error') return { ok: false, reason: 'malformed' }
      if (name === 'published-empty') return ok({ ballots: [], excluded: 0 })
      if (isRunoffState || name === 'published-tie') {
        if (electionId === 1) return ok({ ballots: TIED_BALLOTS, excluded: 0 })
        return ok(name === 'runoff-published' ? { ballots: RUNOFF_BALLOTS, excluded: 1 } : null)
      }
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
