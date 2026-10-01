/**
 * Instant-runoff count for the mascot vote (docs/planning/MascotVote/PLAN.md,
 * "The voting rules"). Pure functions: no network, no React. The public
 * results and the admin dashboard both count with this module, and nothing
 * else counts - not the database, not a second copy in a component.
 *
 * Tests: rankedChoice.test.ts, run with `npx tsx --test src/lib/rankedChoice.test.ts`
 * from packages/web.
 */

/** A ballot as stored: entry ids, first choice first, no gaps, no repeats. */
export type Ballot = readonly string[]

/** How a tie for last place was settled. */
export type TieBreak =
  | { kind: 'none' }
  /** The tied entries differed in an earlier round; `round` is the round that decided it. */
  | { kind: 'earlier-round'; round: number; tied: string[] }
  /** Every earlier round left them level; the first of them in the draw order went. */
  | { kind: 'draw-order'; tied: string[] }

export interface Round {
  /** 1-based. */
  round: number
  /** Votes for each entry still in the race this round. Eliminated entries are absent. */
  votes: Record<string, number>
  /** Ballots with no ranked entry left in the race. */
  exhausted: number
  /** Ballots that still count toward an entry: total minus exhausted. */
  active: number
  /** The entry eliminated at the end of this round, or null when the count stopped here. */
  eliminated: string | null
  /** How the elimination was decided; null when nothing was eliminated. */
  tieBreak: TieBreak | null
}

export interface Winner {
  id: string
  votes: number
  active: number
  totalBallots: number
  /** votes / active * 100 */
  percentOfActive: number
  /** votes / totalBallots * 100 */
  percentOfTotal: number
}

export interface CountResult {
  totalBallots: number
  rounds: Round[]
  /** Null when there are no active ballots (for example, zero ballots). */
  winner: Winner | null
}

export interface CountInput {
  /** Every entry in the race at the start. */
  entries: readonly string[]
  ballots: readonly Ballot[]
  /**
   * A fixed random order of the entries, drawn when the election was created and
   * published in advance. When a tie for last place survives every earlier round,
   * the tied entry that comes first in this order is eliminated.
   */
  drawOrder: readonly string[]
}

/**
 * The ordered list a voter meant: empty slots removed (so ranks 1 and 3 become
 * 1 and 2) and any repeat after its first appearance dropped.
 */
export function normalizeBallot(ranks: readonly (string | null | undefined)[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ranks) {
    if (typeof id !== 'string') continue
    const trimmed = id.trim()
    if (trimmed === '' || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/**
 * Count by instant runoff:
 * 1. Each ballot counts for its highest-ranked entry still in the race; a ballot
 *    with none left is exhausted.
 * 2. An entry with strictly more than half the active ballots wins.
 * 3. Otherwise the entry with the fewest votes is eliminated (one per round),
 *    ties settled by `breakTie`, and the count repeats.
 */
export function countRankedChoice({ entries, ballots, drawOrder }: CountInput): CountResult {
  const drawSet = new Set(drawOrder)
  if (new Set(entries).size !== entries.length) throw new Error('Entries must not repeat')
  if (drawOrder.length !== entries.length || drawSet.size !== entries.length || !entries.every((id) => drawSet.has(id))) {
    // A tie could otherwise be settled by an order nobody published.
    throw new Error('The draw order must list every entry exactly once')
  }
  // An id the race does not know is never in `inRace`, so it is skipped like an
  // eliminated entry; a ballot holding only such ids is exhausted from round 1.
  const cleaned = ballots.map((b) => normalizeBallot(b))
  const totalBallots = cleaned.length
  const inRace = new Set(entries)
  const rounds: Round[] = []

  for (let roundNo = 1; inRace.size > 0; roundNo++) {
    const votes: Record<string, number> = {}
    for (const id of entries) if (inRace.has(id)) votes[id] = 0
    let exhausted = 0
    for (const ballot of cleaned) {
      const choice = ballot.find((id) => inRace.has(id))
      if (choice === undefined) exhausted++
      else votes[choice]++
    }
    const active = totalBallots - exhausted
    const round: Round = { round: roundNo, votes, exhausted, active, eliminated: null, tieBreak: null }
    rounds.push(round)

    if (active === 0) return { totalBallots, rounds, winner: null }

    const leader = Object.keys(votes).find((id) => votes[id] * 2 > active)
    if (leader !== undefined) {
      return {
        totalBallots,
        rounds,
        winner: {
          id: leader,
          votes: votes[leader],
          active,
          totalBallots,
          percentOfActive: (votes[leader] / active) * 100,
          percentOfTotal: (votes[leader] / totalBallots) * 100,
        },
      }
    }

    const fewest = Math.min(...Object.values(votes))
    const tied = Object.keys(votes).filter((id) => votes[id] === fewest)
    const { eliminated, tieBreak } = breakTie(tied, rounds, drawOrder)
    round.eliminated = eliminated
    round.tieBreak = tieBreak
    inRace.delete(eliminated)
  }

  // Unreachable: with any active ballot, the last entry in the race holds all of
  // them and wins above. Kept so the function always returns.
  return { totalBallots, rounds, winner: null }
}

/**
 * Pick which of the entries tied for fewest votes is eliminated.
 * Walk the earlier rounds from round 1: in the first round where the tied entries
 * did not all have the same count, keep only those with the lowest count there.
 * One left: it goes. Several left: keep walking with that smaller set. Still
 * several after every earlier round: the first of them in the draw order goes.
 */
export function breakTie(
  tied: readonly string[],
  rounds: readonly Round[],
  drawOrder: readonly string[],
): { eliminated: string; tieBreak: TieBreak } {
  if (tied.length === 1) return { eliminated: tied[0], tieBreak: { kind: 'none' } }

  let remaining = [...tied]
  // The last round is the one that produced the tie, so only earlier ones can split it.
  for (const r of rounds.slice(0, -1)) {
    const counts = remaining.map((id) => r.votes[id] ?? 0)
    const low = Math.min(...counts)
    if (counts.every((c) => c === low)) continue
    remaining = remaining.filter((id) => (r.votes[id] ?? 0) === low)
    if (remaining.length === 1) {
      return { eliminated: remaining[0], tieBreak: { kind: 'earlier-round', round: r.round, tied: [...tied] } }
    }
  }

  // countRankedChoice checks the draw order holds every entry, so this always finds one.
  const byDraw = drawOrder.find((id) => remaining.includes(id))
  if (byDraw === undefined) throw new Error('No tied entry is in the draw order')
  return { eliminated: byDraw, tieBreak: { kind: 'draw-order', tied: [...tied] } }
}

/** One decimal place, with a trailing ".0" dropped: 51.47 -> "51.5%", 35 -> "35%". */
export function formatPercent(value: number): string {
  const fixed = value.toFixed(1)
  return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}%`
}

/**
 * The winner's share stated both ways, e.g.
 * "art_002 won with 35 of 68 active ballots (51.5%), which is 35% of all 100 ballots counted."
 */
export function winnerSentence(winner: Winner, name: string = winner.id): string {
  return (
    `${name} won with ${winner.votes} of ${winner.active} active ballots (${formatPercent(winner.percentOfActive)}), ` +
    `which is ${formatPercent(winner.percentOfTotal)} of all ${winner.totalBallots} ballots counted.`
  )
}

/**
 * The anonymized ballots as CSV, for anyone to recount: one row per ballot,
 * columns rank_1 .. rank_N. Ids are plain `art_00N` strings, so no quoting is needed;
 * anything else is rejected rather than escaped, including a leading '-' that a
 * spreadsheet could read as a formula. A ballot longer than `maxRanks` is an error,
 * not silently cut.
 */
export function ballotsToCsv(ballots: readonly Ballot[], maxRanks: number): string {
  const header = Array.from({ length: maxRanks }, (_, i) => `rank_${i + 1}`).join(',')
  const rows = ballots.map((b) => {
    if (b.length > maxRanks) throw new Error(`A ballot has ${b.length} ranks; the file has ${maxRanks} columns`)
    for (const id of b) {
      if (!/^[A-Za-z0-9_][A-Za-z0-9_-]*$/.test(id)) throw new Error(`Unexpected entry id in ballot: ${JSON.stringify(id)}`)
    }
    return Array.from({ length: maxRanks }, (_, i) => b[i] ?? '').join(',')
  })
  return [header, ...rows].join('\n') + '\n'
}
