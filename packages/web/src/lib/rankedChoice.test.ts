/**
 * Tests for the instant-runoff count (rankedChoice.ts). Every case from
 * docs/planning/MascotVote/PLAN.md, "Test cases the count must pass", and the
 * check that the total equals the ballot count in every round.
 *
 * packages/web has no test framework (see mapView.test.ts); this is node:test,
 * run with `npx tsx --test src/lib/rankedChoice.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ballotsToCsv,
  countRankedChoice,
  formatPercent,
  normalizeBallot,
  winnerSentence,
  type Ballot,
  type CountResult,
} from './rankedChoice'

function repeat(n: number, ballot: Ballot): Ballot[] {
  return Array.from({ length: n }, () => ballot)
}

/** Every round: entry votes plus exhausted equals the number of ballots. */
function assertTotals(result: CountResult) {
  for (const r of result.rounds) {
    const sum = Object.values(r.votes).reduce((a, b) => a + b, 0) + r.exhausted
    assert.equal(sum, result.totalBallots, `round ${r.round} total`)
    assert.equal(r.active, result.totalBallots - r.exhausted, `round ${r.round} active`)
  }
}

test('1. first-round majority: 55 of 100 rank Fox first, Fox wins in round 1 with nothing eliminated', () => {
  const ballots = [...repeat(55, ['Fox', 'Wolf']), ...repeat(30, ['Wolf', 'Fox']), ...repeat(15, ['Owl'])]
  const result = countRankedChoice({ entries: ['Fox', 'Wolf', 'Owl'], ballots, drawOrder: ['Owl', 'Wolf', 'Fox'] })
  assertTotals(result)
  assert.equal(result.rounds.length, 1)
  assert.equal(result.rounds[0].eliminated, null)
  assert.equal(result.winner?.id, 'Fox')
  assert.equal(result.winner?.votes, 55)
})

test('2. exhausted ballots: Owl, Bear, Eagle, Coyote go; Fox wins round 5 with 35 of 68 active', () => {
  const entries = ['Fox', 'Wolf', 'Coyote', 'Bear', 'Eagle', 'Owl']
  const ballots = [
    ...repeat(35, ['Fox']),
    ...repeat(33, ['Wolf']),
    ...repeat(10, ['Coyote', 'Bear', 'Eagle']),
    ...repeat(9, ['Bear', 'Owl', 'Coyote']),
    ...repeat(7, ['Eagle', 'Bear', 'Owl']),
    ...repeat(6, ['Owl', 'Eagle', 'Bear']),
  ]
  const result = countRankedChoice({ entries, ballots, drawOrder: entries })
  assertTotals(result)

  const expected = [
    { Fox: 35, Wolf: 33, Coyote: 10, Bear: 9, Eagle: 7, Owl: 6, exhausted: 0, out: 'Owl' },
    { Fox: 35, Wolf: 33, Coyote: 10, Bear: 9, Eagle: 13, exhausted: 0, out: 'Bear' },
    { Fox: 35, Wolf: 33, Coyote: 19, Eagle: 13, exhausted: 0, out: 'Eagle' },
    { Fox: 35, Wolf: 33, Coyote: 19, exhausted: 13, out: 'Coyote' },
    { Fox: 35, Wolf: 33, exhausted: 32, out: null },
  ]
  assert.equal(result.rounds.length, expected.length)
  expected.forEach(({ exhausted, out, ...votes }, i) => {
    const r = result.rounds[i]
    assert.deepEqual(r.votes, votes, `round ${i + 1} votes`)
    assert.equal(r.exhausted, exhausted, `round ${i + 1} exhausted`)
    assert.equal(r.eliminated, out, `round ${i + 1} eliminated`)
  })

  assert.equal(result.winner?.id, 'Fox')
  assert.equal(result.winner?.votes, 35)
  assert.equal(result.winner?.active, 68)
  assert.equal(formatPercent(result.winner!.percentOfActive), '51.5%')
  assert.equal(
    winnerSentence(result.winner!),
    'Fox won with 35 of 68 active ballots (51.5%), which is 35% of all 100 ballots counted.',
  )
})

test('3. tie for last settled by an earlier round: B and C level in round 2, C had fewer in round 1', () => {
  const ballots = [...repeat(4, ['A']), ...repeat(3, ['B']), ...repeat(2, ['C']), ['D', 'C']]
  const result = countRankedChoice({ entries: ['A', 'B', 'C', 'D'], ballots, drawOrder: ['B', 'C', 'A', 'D'] })
  assertTotals(result)

  assert.deepEqual(result.rounds[0].votes, { A: 4, B: 3, C: 2, D: 1 })
  assert.equal(result.rounds[0].eliminated, 'D')
  assert.deepEqual(result.rounds[0].tieBreak, { kind: 'none' })

  assert.deepEqual(result.rounds[1].votes, { A: 4, B: 3, C: 3 })
  // The draw order puts B first; C must still go, because round 1 decides it.
  assert.equal(result.rounds[1].eliminated, 'C')
  assert.deepEqual(result.rounds[1].tieBreak, { kind: 'earlier-round', round: 1, tied: ['B', 'C'] })

  assert.deepEqual(result.rounds[2].votes, { A: 4, B: 3 })
  assert.equal(result.rounds[2].exhausted, 3)
  assert.equal(result.winner?.id, 'A')
  assert.equal(result.winner?.votes, 4)
  assert.equal(result.winner?.active, 7)
})

test('3b. votes moved by earlier eliminations, then a later tie settled by round 1 against the draw order', () => {
  const ballots = [
    ...repeat(9, ['W']),
    ...repeat(3, ['X']),
    ...repeat(3, ['Y']),
    ...repeat(2, ['Z']),
    ['V', 'Z'],
    ...repeat(2, ['U', 'X']),
  ]
  // R1: W 9, X 3, Y 3, Z 2, V 1, U 2 -> V (fewest, alone) goes, its ballot to Z.
  // R2: W 9, X 3, Y 3, Z 3, U 2 -> U goes, both ballots to X.
  // R3: W 9, X 5, Y 3, Z 3 -> Y and Z tie; R1 had Y 3, Z 2 -> Z goes by round 1,
  // although the draw order puts Y first.
  const result = countRankedChoice({ entries: ['W', 'X', 'Y', 'Z', 'V', 'U'], ballots, drawOrder: ['Y', 'Z', 'X', 'W', 'V', 'U'] })
  assertTotals(result)
  assert.equal(result.rounds[0].eliminated, 'V')
  assert.equal(result.rounds[1].eliminated, 'U')
  assert.deepEqual(result.rounds[2].votes, { W: 9, X: 5, Y: 3, Z: 3 })
  assert.equal(result.rounds[2].eliminated, 'Z')
  assert.deepEqual(result.rounds[2].tieBreak, { kind: 'earlier-round', round: 1, tied: ['Y', 'Z'] })
})

test('3c. a three-way tie in round 1, then a tie level in every earlier round: both settled by the draw order', () => {
  // R1: P 4, Q 2, R 1, S 1, T 1 (9 ballots, P short of a majority) -> R, S, T tie
  // at 1 with no earlier round: draw order.
  const entries = ['P', 'Q', 'R', 'S', 'T']
  const ballots = [...repeat(4, ['P']), ...repeat(2, ['Q']), ['R'], ['S'], ['T', 'Q']]
  const result = countRankedChoice({ entries, ballots, drawOrder: ['S', 'T', 'R', 'Q', 'P'] })
  assertTotals(result)
  assert.equal(result.rounds[0].eliminated, 'S')
  assert.deepEqual(result.rounds[0].tieBreak, { kind: 'draw-order', tied: ['R', 'S', 'T'] })
  // R2: P 6, Q 2, R 1, T 1 -> R and T tie; round 1 had them level too -> draw order: T before R.
  assert.deepEqual(result.rounds[1].votes, { P: 4, Q: 2, R: 1, T: 1 })
  assert.equal(result.rounds[1].eliminated, 'T')
  assert.deepEqual(result.rounds[1].tieBreak, { kind: 'draw-order', tied: ['R', 'T'] })
})

test('3d. the EARLIEST differing round decides, not the latest: Y lower in round 1, Z lower in round 2', () => {
  const ballots = [
    ...repeat(10, ['W']),
    ...repeat(3, ['Y']),
    ...repeat(4, ['Z']),
    ...repeat(2, ['E', 'Y']),
    ['G', 'Z'],
    ...repeat(2, ['G']),
  ]
  // R1: W 10, Y 3, Z 4, E 2, G 3 -> E goes, both ballots to Y.
  // R2: W 10, Y 5, Z 4, G 3     -> G goes, one ballot to Z, two exhausted.
  // R3: W 10, Y 5, Z 5 (20 active, W exactly half) -> Y and Z tie.
  //     Round 1 had Y 3, Z 4 -> Y goes. Round 2 alone would say Z; so would the draw order.
  const result = countRankedChoice({ entries: ['W', 'Y', 'Z', 'E', 'G'], ballots, drawOrder: ['Z', 'Y', 'W', 'E', 'G'] })
  assertTotals(result)
  assert.equal(result.rounds[0].eliminated, 'E')
  assert.equal(result.rounds[1].eliminated, 'G')
  assert.deepEqual(result.rounds[2].votes, { W: 10, Y: 5, Z: 5 })
  assert.equal(result.rounds[2].exhausted, 2)
  assert.equal(result.rounds[2].eliminated, 'Y')
  assert.deepEqual(result.rounds[2].tieBreak, { kind: 'earlier-round', round: 1, tied: ['Y', 'Z'] })
  assert.equal(result.winner?.id, 'W')
})

test('3e. round 1 narrows a three-way tie to two, round 2 settles those two (the draw order would pick the other)', () => {
  const ballots = [
    ...repeat(10, ['W']),
    ...repeat(4, ['A']),
    ...repeat(4, ['B']),
    ...repeat(5, ['C']),
    ['E', 'A'],
    ['F', 'B'],
    ['F'],
  ]
  // R1: W 10, A 4, B 4, C 5, E 1, F 2 -> E goes, its ballot to A.
  // R2: W 10, A 5, B 4, C 5, F 2     -> F goes, one ballot to B, one exhausted.
  // R3: W 10, A 5, B 5, C 5 (25 active) -> A, B, C tie.
  //     Round 1 (A 4, B 4, C 5) narrows to A and B; round 2 (A 5, B 4) sends B.
  //     The draw order alone, or stopping after round 1 and drawing, would send A.
  const result = countRankedChoice({
    entries: ['W', 'A', 'B', 'C', 'E', 'F'],
    ballots,
    drawOrder: ['A', 'C', 'B', 'W', 'E', 'F'],
  })
  assertTotals(result)
  assert.equal(result.rounds[0].eliminated, 'E')
  assert.equal(result.rounds[1].eliminated, 'F')
  assert.deepEqual(result.rounds[2].votes, { W: 10, A: 5, B: 5, C: 5 })
  assert.equal(result.rounds[2].eliminated, 'B')
  assert.deepEqual(result.rounds[2].tieBreak, { kind: 'earlier-round', round: 2, tied: ['A', 'B', 'C'] })
})

test('the draw order must list every entry exactly once', () => {
  const ballots = [['A']]
  assert.throws(() => countRankedChoice({ entries: ['A', 'B'], ballots, drawOrder: ['A'] }))
  assert.throws(() => countRankedChoice({ entries: ['A', 'B'], ballots, drawOrder: ['A', 'A'] }))
  assert.throws(() => countRankedChoice({ entries: ['A', 'B'], ballots, drawOrder: ['A', 'C'] }))
  assert.throws(() => countRankedChoice({ entries: ['A', 'A'], ballots, drawOrder: ['A', 'A'] }))
  assert.doesNotThrow(() => countRankedChoice({ entries: ['A', 'B'], ballots, drawOrder: ['B', 'A'] }))
})

test('4. tie settled by the draw order: B and C level with no earlier round', () => {
  const ballots = [...repeat(3, ['A', 'B']), ...repeat(2, ['B']), ...repeat(2, ['C'])]
  const entries = ['A', 'B', 'C']

  const cFirst = countRankedChoice({ entries, ballots, drawOrder: ['C', 'B', 'A'] })
  assertTotals(cFirst)
  assert.deepEqual(cFirst.rounds[0].votes, { A: 3, B: 2, C: 2 })
  assert.equal(cFirst.rounds[0].eliminated, 'C')
  assert.deepEqual(cFirst.rounds[0].tieBreak, { kind: 'draw-order', tied: ['B', 'C'] })
  assert.equal(cFirst.winner?.id, 'A')
  assert.equal(cFirst.winner?.votes, 3)
  assert.equal(cFirst.winner?.active, 5)

  const bFirst = countRankedChoice({ entries, ballots, drawOrder: ['B', 'C', 'A'] })
  assertTotals(bFirst)
  assert.equal(bFirst.rounds[0].eliminated, 'B')
  assert.deepEqual(bFirst.rounds[0].tieBreak, { kind: 'draw-order', tied: ['B', 'C'] })
})

test('5. final-round tie: exactly half is not a majority; the draw order eliminates one, the other wins', () => {
  const ballots = [...repeat(2, ['A']), ...repeat(2, ['B'])]
  const result = countRankedChoice({ entries: ['A', 'B'], ballots, drawOrder: ['A', 'B'] })
  assertTotals(result)
  assert.equal(result.rounds.length, 2)
  assert.equal(result.rounds[0].eliminated, 'A')
  assert.deepEqual(result.rounds[0].tieBreak, { kind: 'draw-order', tied: ['A', 'B'] })
  assert.equal(result.winner?.id, 'B')
  assert.equal(result.winner?.votes, 2)
  assert.equal(result.winner?.active, 2)
  assert.equal(result.winner?.totalBallots, 4)
})

test('5b. one vote over half wins; exactly half does not', () => {
  // 3 of 5 active is a majority in round 1.
  const win = countRankedChoice({ entries: ['A', 'B', 'C'], ballots: [['A'], ['A'], ['A'], ['B'], ['C']], drawOrder: ['A', 'B', 'C'] })
  assert.equal(win.rounds.length, 1)
  assert.equal(win.winner?.id, 'A')
  // 3 of 6 active is not.
  const noWin = countRankedChoice({
    entries: ['A', 'B', 'C'],
    ballots: [['A'], ['A'], ['A'], ['B'], ['B'], ['C']],
    drawOrder: ['A', 'B', 'C'],
  })
  assert.equal(noWin.rounds[0].eliminated, 'C')
  assert.ok(noWin.rounds.length > 1)
})

test('6. gaps: a ballot given as rank 1 and rank 3 only is stored and counted as a two-entry list', () => {
  assert.deepEqual(normalizeBallot(['art_002', null, 'art_005']), ['art_002', 'art_005'])
  assert.deepEqual(normalizeBallot(['art_002', '', undefined, '  ', 'art_005']), ['art_002', 'art_005'])
  assert.deepEqual(normalizeBallot(['art_002', 'art_005', 'art_002']), ['art_002', 'art_005'])

  // Counted: the gap ballot moves straight to its second pick when the first goes.
  const result = countRankedChoice({
    entries: ['A', 'B', 'C'],
    ballots: [['C', null, 'B'] as unknown as Ballot, ['A'], ['A'], ['B']],
    // B and C tie on 1 in round 1; the draw order sends C, so the gap ballot has to move.
    drawOrder: ['C', 'B', 'A'],
  })
  assertTotals(result)
  assert.equal(result.rounds[0].eliminated, 'C')
  assert.deepEqual(result.rounds[1].votes, { A: 2, B: 2 })
  assert.equal(result.rounds[1].exhausted, 0)
})

test('7. zero ballots: one empty round, no winner, no crash', () => {
  const result = countRankedChoice({ entries: ['A', 'B'], ballots: [], drawOrder: ['A', 'B'] })
  assertTotals(result)
  assert.equal(result.totalBallots, 0)
  assert.equal(result.rounds.length, 1)
  assert.deepEqual(result.rounds[0].votes, { A: 0, B: 0 })
  assert.equal(result.rounds[0].eliminated, null)
  assert.equal(result.winner, null)
})

test('an id the race does not know is ignored; a ballot of only unknown ids is exhausted', () => {
  const result = countRankedChoice({
    entries: ['A', 'B'],
    ballots: [['X', 'A'], ['A'], ['Y'], ['B']],
    drawOrder: ['A', 'B'],
  })
  assertTotals(result)
  assert.deepEqual(result.rounds[0].votes, { A: 2, B: 1 })
  assert.equal(result.rounds[0].exhausted, 1)
  assert.equal(result.winner?.id, 'A')
})

test('formatPercent: one decimal place, trailing .0 dropped', () => {
  assert.equal(formatPercent(51.470588), '51.5%')
  assert.equal(formatPercent(35), '35%')
  assert.equal(formatPercent(100), '100%')
  assert.equal(formatPercent(66.6666), '66.7%')
})

test('ballotsToCsv: header plus one padded row per ballot, refuses an id that would need escaping', () => {
  assert.equal(
    ballotsToCsv([['art_002', 'art_005'], ['art_001']], 3),
    'rank_1,rank_2,rank_3\nart_002,art_005,\nart_001,,\n',
  )
  assert.throws(() => ballotsToCsv([['a,b']], 1))
  assert.throws(() => ballotsToCsv([['=cmd']], 1))
  assert.throws(() => ballotsToCsv([['-A1']], 1))
  assert.throws(() => ballotsToCsv([['art_001', 'art_002']], 1))
})
