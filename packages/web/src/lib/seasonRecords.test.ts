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
  most_kills_alive: { name: 'Fanare', kills: 120, life_no: 1 },
  longest_life: { name: 'Hokalt', hours: 96.4, alive: false, started_at: '2026-10-03T00:10:00+00:00' },
  longest_life_alive: { name: 'Skye', hours: 50.2, started_at: '2026-10-04T00:10:00+00:00' },
  most_skills_one_life: { name: 'Hokalt', skills: 157, life_no: 1, alive: false },
  most_skills_alive: { name: 'Skye', skills: 92, life_no: 2 },
  biggest_faction: { name: 'The Outcasts', tag: 'OUT', owner_name: 'Rax', members: 7 },
}

const EMPTY = {
  world_seq: null,
  first_death: null,
  first_kill: null,
  most_kills_season: null,
  most_kills_one_life: null,
  most_kills_alive: null,
  longest_life: null,
  longest_life_alive: null,
  most_skills_one_life: null,
  most_skills_alive: null,
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
  assert.deepEqual(r.mostKillsAlive, { name: 'Fanare', kills: 120, lifeNo: 1 })
  assert.deepEqual(r.longestLifeAlive, { name: 'Skye', hours: 50.2 })
  assert.deepEqual(r.mostSkillsOneLife, { name: 'Hokalt', skills: 157, lifeNo: 1, alive: false })
  assert.deepEqual(r.mostSkillsAlive, { name: 'Skye', skills: 92, lifeNo: 2 })
})

test('parse: a broken skills or living award is dropped alone', () => {
  const r = parseSeasonRecords({
    ...FULL,
    most_skills_one_life: { name: 'Hokalt', skills: 'lots' },
    most_skills_alive: { name: ' ', skills: 3 },
    most_kills_alive: { kills: 4 },
    longest_life_alive: { name: 'Skye', hours: '7.5' },
  })
  assert.ok(r)
  assert.equal(r.mostSkillsOneLife, null)
  assert.equal(r.mostSkillsAlive, null)
  assert.equal(r.mostKillsAlive, null)
  assert.deepEqual(r.longestLifeAlive, { name: 'Skye', hours: 7.5 })
  assert.equal(r.mostKillsOneLife?.kills, 311)
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

test('cards: a full fixture, ten cards, each all-time record beside its living one', () => {
  const cards = awardCards(parseSeasonRecords(FULL))
  assert.deepEqual(
    cards.map((c) => c.title),
    [
      'First death of the season',
      'First kill of the season',
      'Most kills in one life',
      'Most kills, alive now',
      'Longest life this season',
      'Longest living survivor',
      'Most skill levels in one life',
      'Most skill levels, alive now',
      'Most kills this season',
      'Biggest faction',
    ],
  )
  assert.deepEqual(
    cards.map((c) => [c.holder, c.value, c.detail]),
    [
      ['Rax', 'survived 2 h', 'Oct 3'],
      ['Fanare', 'Oct 3, 12:10 AM', ''],
      ['Skye', '311 kills', 'life 2, still alive'],
      ['Fanare', '120 kills', 'life 1'],
      ['Hokalt', '4 days 0 h', 'ended'],
      ['Skye', '2 days 2 h', ''],
      ['Hokalt', '157 skill levels', 'life 1, ended'],
      ['Skye', '92 skill levels', 'life 2'],
      ['Skye', '412 kills', ''],
      ['The Outcasts', '7 members', 'tag OUT, led by Rax'],
    ],
  )
  assert.equal(cards[0].mapHref, '/map/?x=8350&y=11750&zoom=15')
  assert.equal(cards[1].mapHref, '/map/?x=8300&y=11700&zoom=15')
  assert.deepEqual(cards.slice(2).map((c) => c.mapHref), [null, null, null, null, null, null, null, null])
})

test('cards: an empty fixture and a missing answer give ten "No one yet" cards', () => {
  for (const r of [parseSeasonRecords(EMPTY), null]) {
    const cards = awardCards(r)
    assert.equal(cards.length, 10)
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
      most_skills_alive: { name: 'Newbie', skills: 1, life_no: 1 },
    }),
  )
  const byKey = (k: string) => cards.find((c) => c.key === k)
  assert.equal(cards[0].mapHref, null)
  assert.equal(byKey('most-kills-season')?.value, '1 kill')
  assert.equal(byKey('biggest-faction')?.value, '1 member')
  assert.equal(byKey('most-skills-alive')?.value, '1 skill level')
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
