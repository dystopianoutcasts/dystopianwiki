/**
 * Tests for lib/leaderboard.ts (T66): the contract of aurora.leaderboard (T65's file),
 * a broken payload, the game's value formats, the source line, the missing-function rule.
 * node:test, run with `npx tsx --test src/lib/leaderboard.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import type { RpcResult } from './homeSummaryRpc'
import {
  LEADERBOARD_FN,
  LEADERBOARD_LIMIT,
  LEADERBOARD_RETRY_MS,
  MAX_ROWS,
  boardTitle,
  callLeaderboard,
  killsValue,
  nextTab,
  ordinal,
  parseLeaderboard,
  relativeTime,
  resetLeaderboardProbe,
  sourceLine,
  survivalValue,
  tabRows,
} from './leaderboard'
import { CONTRACT } from './leaderboard.fixture'

beforeEach(() => resetLeaderboardProbe())

test('parse: the contract keeps every list, row and top-level figure', () => {
  const d = parseLeaderboard(CONTRACT)
  assert.ok(d)
  assert.equal(d.source, 'mod')
  assert.equal(d.worldSeq, 1)
  assert.equal(d.seenAt?.toISOString(), '2026-10-03T12:00:00.000Z')
  assert.equal(d.kills.length, 4)
  assert.equal(d.deaths.length, 2)
  assert.equal(d.survival.length, 3)
  assert.deepEqual(d.kills[1], { rank: 2, username: 'rax', displayName: 'fisher man', live: 3, total: 214, alive: true, online: false })
  assert.deepEqual(d.deaths[0], { rank: 1, username: 'skye', displayName: null, deaths: 4, alive: false, online: false })
  assert.deepEqual(d.survival[0], { rank: 1, username: 'Pootard', displayName: 'Pete Tard', hours: 176.3, alive: true, online: true })
})

test('parse: a broken payload drops bad rows and unknown keys, never the board', () => {
  const d = parseLeaderboard({
    source: 'elsewhere',
    world_seq: -1,
    seen_at: 'yesterday',
    kills: [
      { rank: 1, username: ' rax ', total: '40', live: '5' },
      { rank: 2, username: '', total: 10 },
      { rank: 3, username: 'NoTotal', live: 3 },
      { rank: 4, username: 'Neg', total: -1 },
      { rank: 5, username: 'Inf', total: Infinity },
      { rank: -1, username: 'BadRank', total: 3 },
      { rank: 6, username: 'LiveTooBig', live: 50, total: 9 },
      { rank: 7, username: 'NoLive', total: 8 },
      null,
      'x',
      [1, 2],
    ],
    deaths: { rank: 1, username: 'notalist', deaths: 1 },
    survival: [{ rank: 1, username: 'NoHours' }, { rank: 2, username: 'ok', hours: '3' }],
  })
  assert.ok(d)
  assert.equal(d.source, null)
  assert.equal(d.worldSeq, null)
  assert.equal(d.seenAt, null)
  assert.deepEqual(
    d.kills.map((r) => [r.username, r.live, r.total]),
    [
      ['rax', 5, 40],
      ['LiveTooBig', 9, 9],
      ['NoLive', 8, 8],
    ],
  )
  assert.deepEqual(d.deaths, [])
  assert.deepEqual(d.survival.map((r) => [r.username, r.hours]), [['ok', 3]])
})

test('parse: not an object is null; an empty object is an empty board; a list stops at MAX_ROWS', () => {
  assert.equal(parseLeaderboard(null), null)
  assert.equal(parseLeaderboard([CONTRACT]), null)
  assert.equal(parseLeaderboard('x'), null)
  assert.deepEqual(parseLeaderboard({}), { source: null, worldSeq: null, seenAt: null, kills: [], deaths: [], survival: [] })
  const many = Array.from({ length: MAX_ROWS + 20 }, (_, i) => ({ rank: i + 1, username: `p${i}`, deaths: 1 }))
  assert.equal(parseLeaderboard({ deaths: many })?.deaths.length, MAX_ROWS)
})

test('kills value: "live / total" once kills are on dead characters, else the total alone', () => {
  assert.equal(killsValue({ live: 3, total: 214 }), '3 / 214')
  assert.equal(killsValue({ live: 0, total: 214 }), '0 / 214')
  assert.equal(killsValue({ live: 181, total: 181 }), '181')
  assert.equal(killsValue({ live: 0, total: 0 }), '0')
  assert.equal(killsValue({ live: 1200, total: 15000 }), '1,200 / 15,000')
})

test('survival value: the game\'s Nd Nh from a day up, Nh under a day', () => {
  assert.equal(survivalValue(176.3), '7d 8h')
  assert.equal(survivalValue(24), '1d 0h')
  assert.equal(survivalValue(47.99), '1d 23h')
  assert.equal(survivalValue(5.4), '5h')
  assert.equal(survivalValue(5.5), '6h')
  assert.equal(survivalValue(0), '0h')
  assert.equal(survivalValue(-2), '0h')
})

test('rank words: ordinals for the crowns\' text alternatives', () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal), [
    '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st', '111th',
  ])
})

test('tab rows: each tab formats its value, ranks 1-3 get medals (ties share), names follow the mode', () => {
  const d = parseLeaderboard(CONTRACT)
  const kills = tabRows(d, 'kills', 'character')
  assert.deepEqual(
    kills.map((r) => [r.rank, r.medal, r.rankText, r.name, r.value]),
    [
      [1, 'gold', '1st', 'Pete Tard', '181'],
      [2, 'silver', '2nd', 'fisher man', '3 / 214'],
      [2, 'silver', '2nd', 'skye', '0 / 214'],
      [4, null, '4th', 'Hokalt', '12'],
    ],
  )
  assert.deepEqual(tabRows(d, 'kills', 'account').map((r) => r.name), ['Pootard', 'rax', 'skye', 'hok'])
  assert.deepEqual(tabRows(d, 'deaths', 'character').map((r) => [r.name, r.value]), [['skye', '4'], ['fisher man', '1']])
  assert.deepEqual(tabRows(d, 'survival', 'character').map((r) => [r.medal, r.value]), [['gold', '7d 8h'], ['silver', '24h'], ['bronze', '5h']])
  assert.deepEqual(tabRows(null, 'kills', 'character'), [])
  assert.equal(new Set(kills.map((r) => r.key)).size, kills.length)
  assert.equal(tabRows(d, 'kills', 'character', 2).length, 2)
})

test('title carries the season (world_seq)', () => {
  assert.equal(boardTitle(1), 'Season 1 leaderboard')
  assert.equal(boardTitle(12), 'Season 12 leaderboard')
  assert.equal(boardTitle(null), 'Leaderboard')
  assert.equal(boardTitle(undefined), 'Leaderboard')
  assert.equal(boardTitle(parseLeaderboard(CONTRACT)?.worldSeq), 'Season 1 leaderboard')
})

test('source line: Aurora\'s own count, or the game\'s table with how long ago it was seen', () => {
  const now = new Date('2026-10-03T12:05:30Z')
  const d = parseLeaderboard(CONTRACT)
  assert.equal(sourceLine(d, now), 'As shown in game, updated 5 minutes ago.')
  assert.equal(sourceLine(parseLeaderboard({ ...CONTRACT, seen_at: null }), now), 'As shown in game.')
  assert.equal(sourceLine(parseLeaderboard({ ...CONTRACT, source: 'aurora' }), now), 'Counted by Aurora; the in-game board may differ by a few kills.')
  assert.equal(sourceLine(parseLeaderboard({ ...CONTRACT, source: 'x' }), now), '')
  assert.equal(sourceLine(null, now), '')
})

test('relative time', () => {
  const t = new Date('2026-10-03T12:00:00Z')
  const at = (ms: number) => relativeTime(t, new Date(t.getTime() + ms))
  assert.equal(at(-5000), 'just now')
  assert.equal(at(59_000), 'just now')
  assert.equal(at(60_000), '1 minute ago')
  assert.equal(at(59 * 60_000), '59 minutes ago')
  assert.equal(at(60 * 60_000), '1 hour ago')
  assert.equal(at(5 * 3600_000), '5 hours ago')
  assert.equal(at(24 * 3600_000), '1 day ago')
  assert.equal(at(72 * 3600_000), '3 days ago')
})

test('arrow keys move across the tabs and wrap; Home and End jump; other keys do nothing', () => {
  assert.equal(nextTab('kills', 'ArrowRight'), 'deaths')
  assert.equal(nextTab('survival', 'ArrowRight'), 'kills')
  assert.equal(nextTab('kills', 'ArrowLeft'), 'survival')
  assert.equal(nextTab('deaths', 'ArrowLeft'), 'kills')
  assert.equal(nextTab('deaths', 'Home'), 'kills')
  assert.equal(nextTab('kills', 'End'), 'survival')
  assert.equal(nextTab('kills', 'Enter'), null)
  assert.equal(nextTab('kills', 'ArrowDown'), null)
})

function rpcOf(results: RpcResult[]) {
  const calls: { fn: string; args: Record<string, unknown> }[] = []
  const rpc = async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args })
    return results.shift() ?? { data: null, error: null }
  }
  return { rpc, calls }
}

test('call: asks leaderboard(p_server, p_limit) and parses the answer', async () => {
  const { rpc, calls } = rpcOf([{ data: CONTRACT, error: null }])
  const r = await callLeaderboard(rpc, 'outcasts-main', 1000)
  assert.equal(r.unavailable, false)
  assert.equal(r.data?.kills.length, 4)
  assert.deepEqual(calls, [{ fn: LEADERBOARD_FN, args: { p_server: 'outcasts-main', p_limit: LEADERBOARD_LIMIT } }])
  assert.equal(LEADERBOARD_FN, 'leaderboard')
})

test('call: a missing function (036 not applied) is unavailable and rests before asking again', async () => {
  const missing = { data: null, error: { code: 'PGRST202', message: 'Could not find the function aurora.leaderboard' } }
  const { rpc, calls } = rpcOf([missing, { data: CONTRACT, error: null }])
  assert.deepEqual(await callLeaderboard(rpc, 's', 1000), { data: null, unavailable: true })
  assert.deepEqual(await callLeaderboard(rpc, 's', 1000 + LEADERBOARD_RETRY_MS - 1), { data: null, unavailable: true })
  assert.equal(calls.length, 1)
  const later = await callLeaderboard(rpc, 's', 1000 + LEADERBOARD_RETRY_MS)
  assert.equal(later.unavailable, false)
  assert.equal(later.data?.source, 'mod')
  assert.equal(calls.length, 2)
})

test('call: any other error is a plain empty result, not unavailable', async () => {
  const { rpc } = rpcOf([{ data: null, error: { code: '500', message: 'boom' } }])
  assert.deepEqual(await callLeaderboard(rpc, 's', 1000), { data: null, unavailable: false })
})
