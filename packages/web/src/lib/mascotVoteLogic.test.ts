/**
 * Tests for the vote page's pure logic (mascotVoteLogic.ts): ranking list operations,
 * ordinals, the rank-at-least-5 check, announcements, validation of what the database
 * sends back, and the per-round note text (checked against real countRankedChoice output).
 *
 * node:test, run by `npm test` in packages/web (tsx --test "src/**\/*.test.ts").
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countRankedChoice } from './rankedChoice'
import {
  addEntry,
  announceAdded,
  announceMoved,
  announceRemoved,
  canSubmit,
  classifyRpcError,
  drawOrderText,
  effectiveStatus,
  isShortBallot,
  joinNames,
  moveDown,
  moveUp,
  ordinal,
  parseCastResult,
  parseElection,
  parseMyBallot,
  parsePublicBallots,
  removeEntry,
  roundNote,
  shortBallotWarning,
  toggleEntry,
} from './mascotVoteLogic'

const IDS = ['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_006']
const nameOf = (id: string) => `Entry ${Number(id.slice(4))}`

// ---- ranking operations ---------------------------------------------------

test('ordinal: 1st to 6th, and the teens', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(ordinal), ['1st', '2nd', '3rd', '4th', '5th', '6th'])
  assert.deepEqual([11, 12, 13, 21, 22, 23, 101, 111].map(ordinal), ['11th', '12th', '13th', '21st', '22nd', '23rd', '101st', '111th'])
})

test('addEntry: appends, never repeats, never exceeds the limit, never mutates', () => {
  const start = ['a', 'b']
  assert.deepEqual(addEntry(start, 'c'), ['a', 'b', 'c'])
  assert.deepEqual(start, ['a', 'b'])
  assert.deepEqual(addEntry(start, 'a'), ['a', 'b'])
  assert.deepEqual(addEntry(['a', 'b'], 'c', 2), ['a', 'b'])
  assert.deepEqual(addEntry([], 'a'), ['a'])
})

test('removeEntry: everything below moves up one place, order kept', () => {
  assert.deepEqual(removeEntry(['a', 'b', 'c', 'd'], 'b'), ['a', 'c', 'd'])
  assert.deepEqual(removeEntry(['a', 'b'], 'a'), ['b'])
  assert.deepEqual(removeEntry(['a', 'b'], 'z'), ['a', 'b'])
})

test('moveUp and moveDown swap neighbours; the ends stay put', () => {
  assert.deepEqual(moveUp(['a', 'b', 'c'], 'c'), ['a', 'c', 'b'])
  assert.deepEqual(moveUp(['a', 'b', 'c'], 'a'), ['a', 'b', 'c'])
  assert.deepEqual(moveDown(['a', 'b', 'c'], 'a'), ['b', 'a', 'c'])
  assert.deepEqual(moveDown(['a', 'b', 'c'], 'c'), ['a', 'b', 'c'])
  assert.deepEqual(moveUp(['a', 'b'], 'zzz'), ['a', 'b'])
  assert.deepEqual(moveDown(['a', 'b'], 'zzz'), ['a', 'b'])
})

test('toggleEntry: first press ranks, second press removes', () => {
  const once = toggleEntry([], 'a')
  assert.deepEqual(once, ['a'])
  assert.deepEqual(toggleEntry(toggleEntry(once, 'b'), 'a'), ['b'])
})

test('building a ballot with any sequence of operations never gives a repeat or a gap', () => {
  let ranking: string[] = []
  const steps: Array<(r: string[]) => string[]> = [
    (r) => toggleEntry(r, 'art_003'),
    (r) => toggleEntry(r, 'art_001'),
    (r) => toggleEntry(r, 'art_003'),
    (r) => toggleEntry(r, 'art_003'),
    (r) => moveUp(r, 'art_003'),
    (r) => toggleEntry(r, 'art_006'),
    (r) => moveDown(r, 'art_003'),
    (r) => removeEntry(r, 'art_001'),
  ]
  for (const step of steps) {
    ranking = step(ranking)
    assert.equal(new Set(ranking).size, ranking.length)
  }
  assert.deepEqual(ranking, ['art_003', 'art_006'])
})

test('rank-at-least-5 check: warns for 1 to 4, not for 0 or 5 or 6', () => {
  assert.equal(isShortBallot([]), false)
  assert.equal(isShortBallot(['a']), true)
  assert.equal(isShortBallot(['a', 'b', 'c', 'd']), true)
  assert.equal(isShortBallot(['a', 'b', 'c', 'd', 'e']), false)
  assert.equal(isShortBallot(['a', 'b', 'c', 'd', 'e', 'f']), false)
})

test('canSubmit needs at least one rank', () => {
  assert.equal(canSubmit([]), false)
  assert.equal(canSubmit(['a']), true)
})

test('shortBallotWarning uses the owner-approved wording', () => {
  assert.equal(
    shortBallotWarning(3),
    'You ranked 3 of 6. If all your picks are eliminated, your ballot stops counting. Rank at least 5 and it counts to the end.',
  )
})

// ---- announcements --------------------------------------------------------

test('announcements say what changed and the new places', () => {
  assert.equal(announceAdded('Entry 3', 2), 'Entry 3 ranked 2nd')
  assert.equal(announceMoved('Entry 3', 'up', 1), 'Entry 3 moved up to 1st')
  assert.equal(announceMoved('Entry 3', 'down', 4), 'Entry 3 moved down to 4th')
  const before = ['art_001', 'art_003', 'art_005']
  assert.equal(announceRemoved('Entry 3', before, 'art_003', nameOf), 'Entry 3 removed; Entry 5 is now 2nd')
  assert.equal(announceRemoved('Entry 1', before, 'art_001', nameOf), 'Entry 1 removed; Entry 3 is now 1st, Entry 5 is now 2nd')
  assert.equal(announceRemoved('Entry 5', before, 'art_005', nameOf), 'Entry 5 removed')
})

// ---- validating the database's answers -----------------------------------

const goodElection = {
  id: 1,
  status: 'open',
  closes_at: '2026-11-01T12:00:00+00:00',
  draw_order: ['art_004', 'art_001', 'art_006', 'art_002', 'art_005', 'art_003'],
  published_at: null,
}

test('parseElection accepts a good row and converts the names', () => {
  const r = parseElection(goodElection, IDS)
  assert.equal(r.ok, true)
  if (r.ok) {
    assert.equal(r.value?.status, 'open')
    assert.equal(r.value?.closesAt, '2026-11-01T12:00:00+00:00')
    assert.equal(r.value?.publishedAt, null)
    assert.deepEqual(r.value?.drawOrder, goodElection.draw_order)
  }
})

test('parseElection: no row is fine, null closing time is fine', () => {
  assert.deepEqual(parseElection(null, IDS), { ok: true, value: null })
  const r = parseElection({ ...goodElection, closes_at: null }, IDS)
  assert.equal(r.ok && r.value?.closesAt, null)
})

test('parseElection rejects every malformed shape', () => {
  const bad: unknown[] = [
    'open',
    [],
    { ...goodElection, id: '1' },
    { ...goodElection, id: 1.5 },
    { ...goodElection, status: 'finished' },
    { ...goodElection, status: 5 },
    { ...goodElection, closes_at: 'soon' },
    { ...goodElection, closes_at: undefined },
    { ...goodElection, published_at: 'never' },
    { ...goodElection, draw_order: 'art_001' },
    { ...goodElection, draw_order: ['art_001'] },
    { ...goodElection, draw_order: ['art_001', 'art_001', 'art_002', 'art_003', 'art_004', 'art_005'] },
    { ...goodElection, draw_order: ['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_999'] },
    { ...goodElection, draw_order: ['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 7] },
  ]
  for (const raw of bad) assert.equal(parseElection(raw, IDS).ok, false, JSON.stringify(raw))
})

test('parseElection accepts all four statuses', () => {
  for (const status of ['draft', 'open', 'closed', 'published']) {
    assert.equal(parseElection({ ...goodElection, status }, IDS).ok, true, status)
  }
})

test('parseMyBallot: empty set is "has not voted"; one row is the ballot; anything else is malformed', () => {
  assert.deepEqual(parseMyBallot([]), { ok: true, value: null })
  assert.deepEqual(parseMyBallot(null), { ok: true, value: null })
  const row = { rankings: ['art_002', 'art_001'], created_at: '2026-10-05T10:00:00Z' }
  assert.deepEqual(parseMyBallot([row]), { ok: true, value: { rankings: ['art_002', 'art_001'], createdAt: '2026-10-05T10:00:00Z' } })
  assert.equal(parseMyBallot([row, row]).ok, false)
  assert.equal(parseMyBallot([{ rankings: 'art_002', created_at: row.created_at }]).ok, false)
  assert.equal(parseMyBallot([{ rankings: [1, 2], created_at: row.created_at }]).ok, false)
  assert.equal(parseMyBallot([{ rankings: [], created_at: row.created_at }]).ok, false)
  assert.equal(parseMyBallot([{ rankings: ['art_002'], created_at: 'x' }]).ok, false)
  assert.equal(parseMyBallot('nope').ok, false)
})

test('parsePublicBallots: null before publication; rankings plus excluded after; rest is malformed', () => {
  assert.deepEqual(parsePublicBallots(null, IDS), { ok: true, value: null })
  const good = { ballots: [['art_001', 'art_002'], ['art_003']], excluded: 2 }
  assert.deepEqual(parsePublicBallots(good, IDS), { ok: true, value: good })
  assert.deepEqual(parsePublicBallots({ ballots: [], excluded: 0 }, IDS), { ok: true, value: { ballots: [], excluded: 0 } })
  assert.equal(parsePublicBallots({ ballots: [['a'], 'b'], excluded: 0 }, IDS).ok, false)
  assert.equal(parsePublicBallots({ ballots: [[1]], excluded: 0 }, IDS).ok, false)
  assert.equal(parsePublicBallots({ ballots: [], excluded: -1 }, IDS).ok, false)
  assert.equal(parsePublicBallots({ ballots: [], excluded: '0' }, IDS).ok, false)
  assert.equal(parsePublicBallots({ excluded: 0 }, IDS).ok, false)
  assert.equal(parsePublicBallots([], IDS).ok, false)
  assert.equal(parsePublicBallots({ ballots: [['art_001', 'art_999']], excluded: 0 }, IDS).ok, false)
  assert.equal(parsePublicBallots({ ballots: [[]], excluded: 0 }, IDS).ok, false)
})

test('parseCastResult accepts the five contract strings only', () => {
  for (const s of ['ok', 'already_voted', 'not_open', 'no_discord', 'invalid']) assert.equal(parseCastResult(s), s)
  assert.equal(parseCastResult('OK'), null)
  assert.equal(parseCastResult(null), null)
  assert.equal(parseCastResult(true), null)
})

test('classifyRpcError: permission errors mean log in, anything else is the network', () => {
  assert.equal(classifyRpcError({ code: '42501', message: 'permission denied for function mascot_cast_ballot' }), 'login')
  assert.equal(classifyRpcError({ message: 'permission denied for function x' }), 'login')
  assert.equal(classifyRpcError({ status: 401 }), 'login')
  assert.equal(classifyRpcError({ message: 'JWT expired' }), 'login')
  assert.equal(classifyRpcError({ message: 'TypeError: Failed to fetch' }), 'network')
  assert.equal(classifyRpcError({ code: '500', status: 500 }), 'network')
  assert.equal(classifyRpcError(null), 'network')
})

test('effectiveStatus: an open election past its closing time reads as closed', () => {
  const closes = '2026-11-01T12:00:00Z'
  const t = Date.parse(closes)
  assert.equal(effectiveStatus({ status: 'open', closesAt: closes }, t - 1), 'open')
  assert.equal(effectiveStatus({ status: 'open', closesAt: closes }, t), 'closed')
  assert.equal(effectiveStatus({ status: 'open', closesAt: null }, t + 1e12), 'open')
  assert.equal(effectiveStatus({ status: 'draft', closesAt: closes }, t + 1), 'draft')
  assert.equal(effectiveStatus({ status: 'published', closesAt: closes }, t + 1), 'published')
})

// ---- words ----------------------------------------------------------------

test('joinNames and drawOrderText', () => {
  assert.equal(joinNames(['A']), 'A')
  assert.equal(joinNames(['A', 'B']), 'A and B')
  assert.equal(joinNames(['A', 'B', 'C']), 'A, B and C')
  assert.equal(drawOrderText(['art_004', 'art_001'], nameOf), 'Entry 4, Entry 1')
})

function noteLines(drawOrder: string[], ballots: string[][], entries: string[] = IDS) {
  const result = countRankedChoice({ entries, ballots, drawOrder })
  return { result, notes: result.rounds.map((r) => roundNote(r, nameOf, result.winner)) }
}

test('roundNote: plain elimination, then the winning round', () => {
  // Entry 1 and Entry 2 on 3 each, Entry 3 on 1 with Entry 1 next: Entry 3 goes, Entry 1 then has 4 of 7.
  const ids = ['art_001', 'art_002', 'art_003']
  const ballots = [...Array(3).fill(['art_001']), ...Array(3).fill(['art_002']), ['art_003', 'art_001']]
  const { notes } = noteLines(['art_001', 'art_002', 'art_003'], ballots, ids)
  assert.equal(notes[0], 'Entry 3 had the fewest votes (1) and was eliminated.')
  assert.equal(notes[notes.length - 1], 'Entry 1 has 4 of 7 active ballots, which is more than half, and wins.')
})

test('roundNote: a tie settled by an earlier round names both entries and the round', () => {
  // Plan test case 3: A 4, B 3, C 2, D 1 [D, C]. Round 2 tie B/C on 3; C had fewer in round 1.
  const ids = ['art_001', 'art_002', 'art_003', 'art_004']
  const ballots = [
    ...Array(4).fill(['art_001']),
    ...Array(3).fill(['art_002']),
    ...Array(2).fill(['art_003']),
    ['art_004', 'art_003'],
  ]
  const { notes } = noteLines(ids, ballots, ids)
  assert.equal(notes[1], 'Entry 2 and Entry 3 were tied on 3; Entry 3 had fewer in round 1, so it was eliminated.')
})

test('roundNote: a tie settled by the draw order says so, and the draw order decides who goes', () => {
  // Plan test case 4: A 3 [A,B], B 2, C 2.
  const ids = ['art_001', 'art_002', 'art_003']
  const ballots = [...Array(3).fill(['art_001', 'art_002']), ...Array(2).fill(['art_002']), ...Array(2).fill(['art_003'])]
  const cFirst = noteLines(['art_003', 'art_002', 'art_001'], ballots, ids).notes[0]
  assert.equal(cFirst, 'Entry 2 and Entry 3 were tied on 2, and no earlier round separated them; Entry 3 comes first in the tie-breaker order, so it was eliminated.')
  const bFirst = noteLines(['art_002', 'art_003', 'art_001'], ballots, ids).notes[0]
  assert.match(bFirst, /Entry 2 comes first in the tie-breaker order/)
})

test('roundNote: zero ballots', () => {
  const { notes } = noteLines(IDS, [])
  assert.equal(notes[0], 'No ballots were left to count.')
})

test('roundNote: names the round that settled the tie, whichever round it was', () => {
  const round = {
    round: 3,
    votes: { art_001: 9, art_004: 6, art_002: 6 },
    exhausted: 0,
    active: 21,
    eliminated: 'art_004',
    tieBreak: { kind: 'earlier-round' as const, round: 2, tied: ['art_002', 'art_004'] },
  }
  assert.equal(roundNote(round, nameOf, null), 'Entry 2 and Entry 4 were tied on 6; Entry 4 had fewer in round 2, so it was eliminated.')
})

test('classifyRpcError: the 42501 code alone is enough to mean log in', () => {
  assert.equal(classifyRpcError({ code: '42501', message: 'something else entirely' }), 'login')
  assert.equal(classifyRpcError({ code: '42P01', message: 'something else entirely' }), 'network')
})
