import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import {
  NO_ONE,
  SEASON_RECORDS_FN,
  SEASON_RETRY_MS,
  awardCards,
  callSeasonRecords,
  formatDate,
  formatWhen,
  parseSeasonRecords,
  resetSeasonProbe,
  sectionTitle,
} from './seasonRecords'
import type { RpcResult } from './homeSummaryRpc'

const FULL = {
  world_seq: 1,
  world_started_at: '2026-10-03T00:10:00+00:00',
  first_death: { name: 'Rax', t: new Date(2026, 9, 3, 14, 5).toISOString(), x: 8350.4, y: 11750, hours_survived: 2.5 },
  first_kill: { name: 'Fanare', t: new Date(2026, 9, 3, 0, 10).toISOString(), x: 8300, y: 11700 },
  most_kills_season: { name: 'Skye', kills: 412 },
  most_kills_one_life: { name: 'Skye', kills: 311, life_no: 2, alive: true },
  longest_life: { name: 'Hokalt', hours: 96.4, alive: false, started_at: '2026-10-03T00:10:00+00:00' },
  biggest_faction: { name: 'The Outcasts', tag: 'OUT', owner_name: 'Rax', members: 7 },
}

const EMPTY = {
  world_seq: null,
  first_death: null,
  first_kill: null,
  most_kills_season: null,
  most_kills_one_life: null,
  longest_life: null,
  biggest_faction: null,
}

beforeEach(() => resetSeasonProbe())

test('parse: a full answer keeps every award', () => {
  const r = parseSeasonRecords(FULL)
  assert.ok(r)
  assert.equal(r.worldSeq, 1)
  assert.equal(r.firstDeath?.name, 'Rax')
  assert.equal(r.firstDeath?.hoursSurvived, 2.5)
  assert.equal(r.mostKillsSeason?.kills, 412)
  assert.equal(r.mostKillsOneLife?.lifeNo, 2)
  assert.equal(r.mostKillsOneLife?.alive, true)
  assert.equal(r.longestLife?.alive, false)
  assert.equal(r.biggestFaction?.members, 7)
})

test('parse: partial answers drop only the broken award', () => {
  const r = parseSeasonRecords({
    world_seq: 'x',
    first_death: { name: '   ', t: 'whenever' },
    first_kill: { name: 'Fanare', t: 'not a date', x: 'NaN', y: 5 },
    most_kills_season: { name: 'Skye' },
    most_kills_one_life: { name: 'Skye', kills: '9' },
    longest_life: { name: 'Hokalt', hours: Infinity },
    biggest_faction: { name: 'Gang', members: 3 },
  })
  assert.ok(r)
  assert.equal(r.worldSeq, null)
  assert.equal(r.firstDeath, null)
  assert.deepEqual(r.firstKill, { name: 'Fanare', t: null, x: null, y: 5, hoursSurvived: null })
  assert.equal(r.mostKillsSeason, null)
  assert.deepEqual(r.mostKillsOneLife, { name: 'Skye', kills: 9, lifeNo: null, alive: null })
  assert.equal(r.longestLife, null)
  assert.deepEqual(r.biggestFaction, { name: 'Gang', tag: null, ownerName: null, members: 3 })
})

test('parse: garbage is null or all-empty', () => {
  for (const g of [null, undefined, 5, 'x', [], [1]]) assert.equal(parseSeasonRecords(g), null)
  const r = parseSeasonRecords({ first_death: 'x', first_kill: [], most_kills_season: 7 })
  assert.ok(r)
  assert.equal(r.firstDeath, null)
  assert.equal(r.firstKill, null)
  assert.equal(r.mostKillsSeason, null)
})

test('formatWhen and formatDate: local date and 12-hour time', () => {
  assert.equal(formatDate(new Date(2026, 9, 3, 0, 10).toISOString()), 'Oct 3')
  assert.equal(formatWhen(new Date(2026, 9, 3, 0, 10).toISOString()), 'Oct 3, 12:10 AM')
  assert.equal(formatWhen(new Date(2026, 9, 3, 12, 5).toISOString()), 'Oct 3, 12:05 PM')
  assert.equal(formatWhen(new Date(2026, 11, 25, 23, 59).toISOString()), 'Dec 25, 11:59 PM')
  assert.equal(formatWhen('nope'), '')
  assert.equal(formatWhen(null), '')
  assert.equal(formatDate(undefined), '')
})

test('cards: a full fixture, six cards in the owner order with their text', () => {
  const cards = awardCards(parseSeasonRecords(FULL))
  assert.deepEqual(
    cards.map((c) => c.title),
    [
      'First death of the season',
      'First kill of the season',
      'Most kills this season',
      'Most kills in one life',
      'Longest living survivor',
      'Biggest faction',
    ],
  )
  assert.deepEqual(
    cards.map((c) => [c.holder, c.value, c.detail]),
    [
      ['Rax', 'survived 2 h', 'Oct 3'],
      ['Fanare', 'Oct 3, 12:10 AM', ''],
      ['Skye', '412 kills', ''],
      ['Skye', '311 kills', 'life 2, still alive'],
      ['Hokalt', '4 days 0 h', 'ended'],
      ['The Outcasts', '7 members', 'tag OUT, led by Rax'],
    ],
  )
  assert.equal(cards[0].mapHref, '/map/?x=8350&y=11750&zoom=15')
  assert.equal(cards[1].mapHref, '/map/?x=8300&y=11700&zoom=15')
  assert.deepEqual(cards.slice(2).map((c) => c.mapHref), [null, null, null, null])
})

test('cards: an empty fixture and a missing answer give six "No one yet" cards', () => {
  for (const r of [parseSeasonRecords(EMPTY), null]) {
    const cards = awardCards(r)
    assert.equal(cards.length, 6)
    for (const c of cards) {
      assert.equal(c.holder, NO_ONE)
      assert.equal(c.value, '')
      assert.equal(c.detail, '')
      assert.equal(c.mapHref, null)
    }
  }
  assert.equal(NO_ONE, 'No one yet')
})

test('cards: singular words, and no map link without a position', () => {
  const cards = awardCards(
    parseSeasonRecords({
      first_death: { name: 'Rax', t: null, x: 1 },
      most_kills_season: { name: 'Skye', kills: 1 },
      biggest_faction: { name: 'Solo', members: 1 },
    }),
  )
  assert.equal(cards[0].mapHref, null)
  assert.equal(cards[2].value, '1 kill')
  assert.equal(cards[5].value, '1 member')
})

test('sectionTitle: numbered when the season is known', () => {
  assert.equal(sectionTitle(3), 'Season 3 records')
  assert.equal(sectionTitle(null), 'Season records')
  assert.equal(sectionTitle(undefined), 'Season records')
})

const MISSING: RpcResult = { data: null, error: { message: 'Could not find the function aurora.season_records(p_server)', code: 'PGRST202' } }

test('call: PGRST202 is unavailable and rests five minutes; success clears it', async () => {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = []
  let answer: RpcResult = MISSING
  const rpc = async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args })
    return answer
  }
  const t0 = 1_000_000
  assert.deepEqual(await callSeasonRecords(rpc, 'outcasts-main', t0), { records: null, unavailable: true })
  assert.deepEqual(calls, [{ fn: SEASON_RECORDS_FN, args: { p_server: 'outcasts-main' } }])
  assert.equal(SEASON_RECORDS_FN, 'season_records')
  // Inside the rest: still unavailable, no new call.
  assert.equal((await callSeasonRecords(rpc, 'outcasts-main', t0 + 60_000)).unavailable, true)
  assert.equal(calls.length, 1)
  // After the rest it asks again, and a real answer is parsed.
  answer = { data: FULL, error: null }
  const r = await callSeasonRecords(rpc, 'outcasts-main', t0 + SEASON_RETRY_MS)
  assert.equal(calls.length, 2)
  assert.equal(r.unavailable, false)
  assert.equal(r.records?.mostKillsSeason?.name, 'Skye')
})

test('call: another error is a plain null, not a rest', async () => {
  let n = 0
  const rpc = async () => {
    n += 1
    return { data: null, error: { message: 'boom', code: '500' } } as RpcResult
  }
  assert.deepEqual(await callSeasonRecords(rpc, 's', 1), { records: null, unavailable: false })
  await callSeasonRecords(rpc, 's', 2)
  assert.equal(n, 2)
})
