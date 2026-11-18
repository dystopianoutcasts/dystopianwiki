import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BATTLEMETRICS_FN, callBattleMetrics, formatRank, parseBattleMetrics, rankChange } from './battlemetrics'

const FULL = {
  rank: 1903,
  players: 0,
  max_players: 16,
  status: 'online',
  fetched_at: '2026-11-18T08:05:03+00:00',
  rank_7d_ago: 2100,
  best_rank_7d: 1800,
  history: [
    { t: '2026-11-17T08:00:00+00:00', rank: 1950 },
    { t: '2026-11-11T09:00:00+00:00', rank: 2100 },
    { t: 'not a date', rank: 5 },
    { t: '2026-11-12T09:00:00+00:00', rank: 0 },
  ],
}

test('a full answer parses, history sorted oldest first, bad points dropped', () => {
  const s = parseBattleMetrics(FULL)
  assert.ok(s)
  assert.equal(s.rank, 1903)
  assert.equal(s.players, 0)
  assert.equal(s.maxPlayers, 16)
  assert.equal(s.status, 'online')
  assert.equal(s.fetchedAt?.toISOString(), '2026-11-18T08:05:03.000Z')
  assert.equal(s.rank7dAgo, 2100)
  assert.equal(s.bestRank7d, 1800)
  assert.deepEqual(s.history.map((p) => p.rank), [2100, 1950])
})

test('the empty answer (no data yet) parses to nulls and no history', () => {
  const s = parseBattleMetrics({ rank: null, players: null, max_players: null, status: null, fetched_at: null, rank_7d_ago: null, best_rank_7d: null, history: [] })
  assert.ok(s)
  assert.equal(s.rank, null)
  assert.equal(s.fetchedAt, null)
  assert.deepEqual(s.history, [])
})

test('odd values become null rather than showing as a rank', () => {
  const s = parseBattleMetrics({ rank: '1903', players: -1, max_players: 1.5, status: '', history: 'x' })
  assert.ok(s)
  assert.equal(s.rank, null)
  assert.equal(s.players, null)
  assert.equal(s.maxPlayers, null)
  assert.equal(s.status, null)
  assert.deepEqual(s.history, [])
})

test('a non-object answer is null', () => {
  assert.equal(parseBattleMetrics(null), null)
  assert.equal(parseBattleMetrics([]), null)
  assert.equal(parseBattleMetrics('x'), null)
})

test('callBattleMetrics asks for the right function and server, and is null on error', async () => {
  let seen: [string, Record<string, unknown>] | null = null
  const ok = await callBattleMetrics(async (fn, args) => {
    seen = [fn, args]
    return { data: FULL, error: null }
  }, 'outcasts-main')
  assert.deepEqual(seen, [BATTLEMETRICS_FN, { p_server: 'outcasts-main' }])
  assert.equal(ok?.rank, 1903)
  const failed = await callBattleMetrics(async () => ({ data: null, error: { message: 'Could not find the function', code: 'PGRST202' } }), 'outcasts-main')
  assert.equal(failed, null)
})

test('formatRank', () => {
  assert.equal(formatRank(1903), '#1,903')
  assert.equal(formatRank(7), '#7')
  assert.equal(formatRank(null), null)
  assert.equal(formatRank(0), null)
})

test('rankChange: a lower number is better', () => {
  assert.equal(rankChange(1903, 2100), 'Up 197 places this week')
  assert.equal(rankChange(2101, 2100), 'Down 1 place this week')
  assert.equal(rankChange(1903, 1903), 'Same place as a week ago')
  assert.equal(rankChange(null, 2100), null)
  assert.equal(rankChange(1903, null), null)
})
