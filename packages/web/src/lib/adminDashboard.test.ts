/**
 * Tests for the admin dashboard's pure logic (adminDashboard.ts).
 * node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  STATUS_MOVES,
  axisTicks,
  barsForRound,
  countedRankings,
  filterBallots,
  filterMembers,
  fromLocalInput,
  memberRole,
  parseAdminBallots,
  parseMembers,
  toLocalInput,
} from './adminDashboard'
import { countRankedChoice } from './rankedChoice'

const IDS = ['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_006']

const memberRow = {
  user_id: 'u1',
  email: 'a@example.invalid',
  providers: ['discord', 'google'],
  discord_username: 'some_user',
  discord_id: '123',
  joined_at: '2026-10-01T10:00:00Z',
  last_sign_in_at: null,
  is_admin: true,
  is_superadmin: false,
}

test('parseMembers reads the member rows and refuses anything malformed', () => {
  const r = parseMembers([memberRow])
  assert.equal(r.ok, true)
  assert.deepEqual(r.ok && r.value[0], {
    userId: 'u1',
    email: 'a@example.invalid',
    providers: ['discord', 'google'],
    discordUsername: 'some_user',
    discordId: '123',
    joinedAt: '2026-10-01T10:00:00Z',
    lastSignInAt: null,
    isAdmin: true,
    isSuperadmin: false,
  })
  assert.deepEqual(parseMembers([]), { ok: true, value: [] })
  assert.equal(parseMembers(null).ok, false)
  assert.equal(parseMembers([{ ...memberRow, is_admin: 'true' }]).ok, false)
  assert.equal(parseMembers([{ ...memberRow, providers: 'google' }]).ok, false)
  assert.equal(parseMembers([{ ...memberRow, joined_at: 'yesterday' }]).ok, false)
  assert.equal(parseMembers([{ ...memberRow, user_id: 7 }]).ok, false)
})

test('memberRole and filterMembers', () => {
  assert.equal(memberRole({ isAdmin: true, isSuperadmin: true }), 'Superadmin')
  assert.equal(memberRole({ isAdmin: true, isSuperadmin: false }), 'Admin')
  assert.equal(memberRole({ isAdmin: false, isSuperadmin: false }), 'Member')
  const members = parseMembers([memberRow, { ...memberRow, user_id: 'u2', discord_username: null, email: 'Other@Example.invalid' }])
  assert.ok(members.ok)
  if (!members.ok) return
  assert.deepEqual(filterMembers(members.value, 'SOME').map((m) => m.userId), ['u1'])
  assert.deepEqual(filterMembers(members.value, 'other@').map((m) => m.userId), ['u2'])
  assert.equal(filterMembers(members.value, '  ').length, 2)
})

const ballotRow = {
  ballot_id: 'b1',
  discord_username: 'voter_one',
  discord_id: '800',
  rankings: ['art_002', 'art_005'],
  created_at: '2026-10-02T12:00:00Z',
  counted: true,
}

test('parseAdminBallots reads ballots and refuses unknown ids, empty rankings and bad fields', () => {
  const r = parseAdminBallots([ballotRow], IDS)
  assert.equal(r.ok, true)
  assert.deepEqual(r.ok && r.value[0], {
    ballotId: 'b1',
    discordUsername: 'voter_one',
    discordId: '800',
    rankings: ['art_002', 'art_005'],
    createdAt: '2026-10-02T12:00:00Z',
    counted: true,
  })
  assert.equal(parseAdminBallots([{ ...ballotRow, discord_username: null }], IDS).ok, true)
  assert.equal(parseAdminBallots([{ ...ballotRow, rankings: ['art_999'] }], IDS).ok, false)
  assert.equal(parseAdminBallots([{ ...ballotRow, rankings: [] }], IDS).ok, false)
  assert.equal(parseAdminBallots([{ ...ballotRow, counted: 1 }], IDS).ok, false)
  assert.equal(parseAdminBallots([{ ...ballotRow, created_at: 'soon' }], IDS).ok, false)
  assert.equal(parseAdminBallots({}, IDS).ok, false)
})

test('filterBallots matches the username; countedRankings drops excluded ballots', () => {
  const parsed = parseAdminBallots(
    [ballotRow, { ...ballotRow, ballot_id: 'b2', discord_username: 'Someone_Else', counted: false, rankings: ['art_001'] }],
    IDS,
  )
  assert.ok(parsed.ok)
  if (!parsed.ok) return
  assert.deepEqual(filterBallots(parsed.value, 'someone').map((b) => b.ballotId), ['b2'])
  assert.deepEqual(countedRankings(parsed.value), [['art_002', 'art_005']])
})

test('STATUS_MOVES matches the moves migration 025 allows, and nothing else', () => {
  const moves = Object.entries(STATUS_MOVES).flatMap(([from, list]) => list.map((m) => `${from}->${m.to}`))
  assert.deepEqual(moves.sort(), ['closed->open', 'closed->published', 'draft->open', 'open->closed', 'published->closed'])
})

test('barsForRound: most votes first, ties in entry order, eliminated entries last as 0', () => {
  const ballots = [
    ...Array.from({ length: 4 }, () => ['art_003']),
    ...Array.from({ length: 3 }, () => ['art_001']),
    ...Array.from({ length: 3 }, () => ['art_005']),
    ['art_006', 'art_001'],
  ]
  const result = countRankedChoice({ entries: IDS, ballots, drawOrder: IDS })
  const r1 = barsForRound(result, 0, IDS)
  assert.deepEqual(r1.map((b) => `${b.id}:${b.votes}${b.eliminated ? 'x' : ''}`), [
    'art_003:4',
    'art_001:3',
    'art_005:3',
    'art_006:1',
    'art_002:0',
    'art_004:0',
  ])
  // Round 2: art_002 (first in the draw order among the zero-vote entries) is out.
  const r2 = barsForRound(result, 1, IDS)
  assert.equal(r2[r2.length - 1].id, 'art_002')
  assert.equal(r2[r2.length - 1].eliminated, true)
  assert.equal(r2[r2.length - 1].votes, 0)
  assert.equal(r2.filter((b) => b.eliminated).length, 1)
})

test('axisTicks: whole-number steps of 1, 2 or 5 reaching the maximum', () => {
  assert.deepEqual(axisTicks(0), [0, 1])
  assert.deepEqual(axisTicks(3), [0, 1, 2, 3])
  assert.deepEqual(axisTicks(14), [0, 5, 10, 15])
  assert.deepEqual(axisTicks(37), [0, 10, 20, 30, 40])
  assert.deepEqual(axisTicks(8), [0, 2, 4, 6, 8])
  for (const max of [1, 2, 7, 19, 63, 140]) {
    const t = axisTicks(max)
    assert.ok(t[t.length - 1] >= max, `top tick for ${max}`)
    assert.ok(t.every((v) => Number.isInteger(v)), `integers for ${max}`)
    assert.ok(t.length <= 8, `few lines for ${max}`)
  }
})

test('closing-time input: local value round-trips; bad input gives null', () => {
  const iso = '2026-10-06T15:30:00.000Z'
  assert.equal(fromLocalInput(toLocalInput(iso)), iso)
  assert.equal(toLocalInput(null), '')
  assert.equal(toLocalInput('nonsense'), '')
  assert.equal(fromLocalInput(''), null)
  assert.equal(fromLocalInput('2026-10-06'), null)
  assert.equal(fromLocalInput('2026-13-45T99:99'), null)
})
