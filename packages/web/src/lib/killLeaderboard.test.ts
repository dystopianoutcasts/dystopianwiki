import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import {
  KILL_LEADERBOARD_FN,
  KILL_RETRY_MS,
  MAX_ROWS,
  boardTitle,
  callKillLeaderboard,
  footerLine,
  formatKills,
  leaderboardRows,
  livesText,
  parseKillLeaderboard,
  resetKillProbe,
} from './killLeaderboard'
import type { RpcResult } from './homeSummaryRpc'

const FULL = {
  world_seq: 1,
  players: 9,
  total_kills: 1234,
  rows: [
    { rank: 1, name: 'Skye', kills: 412, best_life: 311, lives: 3, alive: true, online: true },
    { rank: 2, name: 'Rax', kills: 300, best_life: 300, lives: 1, alive: false, online: false },
    { rank: 2, name: 'Fanare', kills: 300, best_life: 120, lives: 2, alive: true, online: false },
    { rank: 4, name: 'Hokalt', kills: 12, best_life: 12, lives: 1, alive: false, online: true },
  ],
}

beforeEach(() => resetKillProbe())

test('parse: a full answer keeps every row and figure', () => {
  const d = parseKillLeaderboard(FULL)
  assert.ok(d)
  assert.equal(d.worldSeq, 1)
  assert.equal(d.players, 9)
  assert.equal(d.totalKills, 1234)
  assert.equal(d.rows.length, 4)
  assert.deepEqual(d.rows[0], { rank: 1, name: 'Skye', kills: 412, bestLife: 311, lives: 3, alive: true, online: true })
})

test('parse: a partial answer defaults what is missing and drops bad rows', () => {
  const d = parseKillLeaderboard({
    players: '5',
    rows: [
      { rank: 1, name: ' Skye ', kills: '40' },
      { rank: 2, name: '', kills: 10 },
      { rank: 3, name: 'NoKills' },
      { rank: 4, name: 'Neg', kills: -1 },
      { rank: 5, name: 'Inf', kills: Infinity },
      { rank: -1, name: 'BadRank', kills: 3 },
      null,
      'x',
    ],
  })
  assert.ok(d)
  assert.equal(d.worldSeq, null)
  assert.equal(d.players, 5)
  assert.equal(d.totalKills, null)
  assert.equal(d.rows.length, 1)
  assert.deepEqual(d.rows[0], { rank: 1, name: 'Skye', kills: 40, bestLife: 0, lives: 0, alive: false, online: false })
})

test('parse: garbage is null or an empty board', () => {
  assert.equal(parseKillLeaderboard(null), null)
  assert.equal(parseKillLeaderboard('x'), null)
  assert.equal(parseKillLeaderboard([1, 2]), null)
  const d = parseKillLeaderboard({ rows: 'nope', world_seq: 'abc', players: -4, total_kills: NaN })
  assert.ok(d)
  assert.deepEqual(d, { worldSeq: null, players: null, totalKills: null, rows: [] })
})

test('parse: rows are capped at 100', () => {
  const rows = Array.from({ length: 250 }, (_, i) => ({ rank: i + 1, name: `P${i}`, kills: 1000 - i }))
  const d = parseKillLeaderboard({ rows })
  assert.ok(d)
  assert.equal(MAX_ROWS, 100)
  assert.equal(d.rows.length, 100)
  assert.equal(d.rows[99].name, 'P99')
})

test('formatKills: thousands separators', () => {
  assert.equal(formatKills(0), '0')
  assert.equal(formatKills(999), '999')
  assert.equal(formatKills(1000), '1,000')
  assert.equal(formatKills(1234567), '1,234,567')
})

test('rows: shared rank, ended and alive, online, in the given order', () => {
  const rows = leaderboardRows(parseKillLeaderboard(FULL))
  assert.deepEqual(
    rows.map((r) => [r.rank, r.name, r.status, r.online]),
    [
      [1, 'Skye', 'alive', true],
      [2, 'Rax', 'ended', false],
      [2, 'Fanare', 'alive', false],
      [4, 'Hokalt', 'ended', true],
    ],
  )
  assert.equal(rows[1].kills, 300)
  assert.equal(rows[0].bestLife, 311)
  assert.equal(rows[0].lives, 3)
  assert.equal(new Set(rows.map((r) => r.key)).size, 4)
})

test('rows: at most ten are shown', () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({ rank: i + 1, name: `P${i}`, kills: 100 - i }))
  assert.equal(leaderboardRows(parseKillLeaderboard({ rows })).length, 10)
})

test('rows: an empty or missing payload gives no rows', () => {
  assert.deepEqual(leaderboardRows(null), [])
  assert.deepEqual(leaderboardRows(parseKillLeaderboard({ world_seq: 2, players: 0, total_kills: 0, rows: [] })), [])
})

test('title, lives and footer wording', () => {
  assert.equal(boardTitle(3), 'Season 3 kill leaderboard')
  assert.equal(boardTitle(null), 'Kill leaderboard')
  assert.equal(boardTitle(undefined), 'Kill leaderboard')
  assert.equal(livesText(1), '1 life')
  assert.equal(livesText(3), '3 lives')
  assert.equal(footerLine(parseKillLeaderboard(FULL)), '9 players, 1,234 kills this season')
  assert.equal(footerLine(parseKillLeaderboard({ players: 1, total_kills: 1 })), '1 player, 1 kill this season')
  assert.equal(footerLine(parseKillLeaderboard({ players: 1 })), '')
  assert.equal(footerLine(null), '')
})

const missing: RpcResult = { data: null, error: { message: 'Could not find the function aurora.kill_leaderboard', code: 'PGRST202' } }

test('call: sends the name and both arguments', async () => {
  const seen: Array<[string, Record<string, unknown>]> = []
  const r = await callKillLeaderboard(async (fn, args) => {
    seen.push([fn, args])
    return { data: FULL, error: null }
  }, 'outcasts-main')
  assert.deepEqual(seen, [[KILL_LEADERBOARD_FN, { p_server: 'outcasts-main', p_limit: 10 }]])
  assert.equal(r.unavailable, false)
  assert.equal(r.data?.rows.length, 4)
})

test('call: a missing function rests for five minutes, then asks again and recovers', async () => {
  let calls = 0
  let answer: RpcResult = missing
  const rpc = async () => {
    calls++
    return answer
  }
  const t0 = 1_000_000
  assert.deepEqual(await callKillLeaderboard(rpc, 's', t0), { data: null, unavailable: true })
  assert.equal(calls, 1)
  assert.equal((await callKillLeaderboard(rpc, 's', t0 + KILL_RETRY_MS - 1)).unavailable, true)
  assert.equal(calls, 1)
  answer = { data: FULL, error: null }
  const r = await callKillLeaderboard(rpc, 's', t0 + KILL_RETRY_MS)
  assert.equal(calls, 2)
  assert.equal(r.unavailable, false)
  assert.equal(r.data?.players, 9)
})

test('call: any other error is a plain null result', async () => {
  const r = await callKillLeaderboard(async () => ({ data: null, error: { message: 'boom', code: '500' } }), 's')
  assert.deepEqual(r, { data: null, unavailable: false })
})
