import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  busiestSlot,
  callMetricsSummary,
  dayLabel,
  formatHoursPlayed,
  formatMinutes,
  hourName,
  localHeatmap,
  METRICS_SUMMARY_FN,
  parseMetricsSummary,
  rangePhrase,
  trackedFromNote,
} from './metrics'

const FULL = {
  range: 'season',
  since: '2026-10-03',
  season_start: '2026-10-03T00:00:00+00:00',
  tracking_since: '2026-11-11T12:00:00+00:00',
  players_since: '2026-11-10T09:00:00+00:00',
  hourly: [
    { t: '2026-11-18T10:00:00Z', avg: 1.5, peak: 3 },
    { t: '2026-11-18T09:00:00Z', avg: null, peak: null },
    { t: 'nope', avg: 1, peak: 1 },
  ],
  daily: [
    { day: '2026-11-18', hours_played: 12.5, unique_players: 6, new_players: 1, avg: 1.2, peak: 4, deaths: 2, kills: 300 },
    { day: '2026-10-03', hours_played: null, unique_players: null, new_players: 5, avg: null, peak: null, deaths: 0, kills: 40 },
    { day: 'bad', kills: 5 },
  ],
  heatmap: [[0.5, ...new Array(23).fill(null)]],
  top_time: [
    { rank: 1, username: 'one', display_name: 'One', minutes: 190 },
    { rank: 2, username: 'two', display_name: null, minutes: 90 },
    { rank: 3, username: 'three', minutes: 'x' },
  ],
  totals: { hours_played: 99.5, unique_players: 20, new_players: 7, peak: 9, deaths: 12, kills: 1234 },
}

test('a full answer parses: hourly and daily sorted, bad rows dropped, nulls kept', () => {
  const s = parseMetricsSummary(FULL)
  assert.ok(s)
  assert.equal(s.range, 'season')
  assert.equal(s.since, '2026-10-03')
  assert.equal(s.seasonStart?.toISOString(), '2026-10-03T00:00:00.000Z')
  assert.equal(s.trackingSince?.toISOString(), '2026-11-11T12:00:00.000Z')
  assert.equal(s.hourly.length, 2)
  assert.equal(s.hourly[0].t.toISOString(), '2026-11-18T09:00:00.000Z')
  assert.equal(s.hourly[0].avg, null)
  assert.deepEqual(s.daily.map((d) => d.day), ['2026-10-03', '2026-11-18'])
  assert.equal(s.daily[0].hoursPlayed, null)
  assert.equal(s.daily[0].kills, 40)
  assert.equal(s.daily[1].avg, 1.2)
  assert.equal(s.topTime.length, 2)
  assert.equal(s.topTime[1].displayName, 'two')
  assert.deepEqual(s.totals, { hoursPlayed: 99.5, uniquePlayers: 20, newPlayers: 7, peak: 9, deaths: 12, kills: 1234 })
})

test('the heatmap is always 7 x 24', () => {
  const s = parseMetricsSummary(FULL)
  assert.ok(s)
  assert.equal(s.heatmap.length, 7)
  assert.ok(s.heatmap.every((row) => row.length === 24))
  assert.equal(s.heatmap[0][0], 0.5)
  assert.equal(s.heatmap[6][23], null)
})

test('anything that is not an object is not a summary; an empty object is all empty', () => {
  assert.equal(parseMetricsSummary(null), null)
  assert.equal(parseMetricsSummary([]), null)
  assert.equal(parseMetricsSummary('x'), null)
  const e = parseMetricsSummary({})
  assert.ok(e)
  assert.deepEqual(e.hourly, [])
  assert.deepEqual(e.daily, [])
  assert.deepEqual(e.topTime, [])
  assert.equal(e.totals.hoursPlayed, null)
  assert.equal(e.totals.kills, 0)
  assert.equal(e.heatmap.length, 7)
})

test('the call passes the server and range, and returns null on an error', async () => {
  const calls: [string, Record<string, unknown>][] = []
  const ok = await callMetricsSummary(
    async (fn, args) => {
      calls.push([fn, args])
      return { data: FULL, error: null }
    },
    'outcasts-main',
    '30',
  )
  assert.ok(ok)
  assert.deepEqual(calls, [[METRICS_SUMMARY_FN, { p_server: 'outcasts-main', p_range: '30' }]])
  assert.equal(await callMetricsSummary(async () => ({ data: null, error: { message: 'x' } }), 'a', '7'), null)
})

test('words: counts, hours, minutes, days, ranges', () => {
  assert.equal(formatHoursPlayed(1), '1 hour')
  assert.equal(formatHoursPlayed(12.46), '12.5 hours')
  assert.equal(formatHoursPlayed(null), 'TBD')
  assert.equal(formatMinutes(125), '2h 05m')
  assert.equal(formatMinutes(0), '0h 00m')
  assert.equal(dayLabel('2026-11-18'), 'Nov 18')
  assert.equal(dayLabel('garbage'), 'garbage')
  assert.equal(rangePhrase('7'), 'the last 7 days')
  assert.equal(rangePhrase('1'), 'the last 1 day')
  assert.equal(rangePhrase('season'), 'Season 1')
  assert.equal(hourName(0), '12 AM')
  assert.equal(hourName(13), '1 PM')
})

test('tracked-from note appears only when the data starts after the range does', () => {
  assert.equal(trackedFromNote('2026-10-03', new Date('2026-11-11T12:00:00Z')), 'tracked from Nov 11')
  assert.equal(trackedFromNote('2026-11-11', new Date('2026-11-11T12:00:00Z')), null)
  assert.equal(trackedFromNote('2026-10-03', null), null)
})

test('the heatmap is shifted into the viewer time zone: Thursday 15:00 UTC is Thursday 11 AM in New York (summer)', () => {
  const grid = Array.from({ length: 7 }, () => new Array<number | null>(24).fill(null))
  grid[4][15] = 3
  // A reference in October, when New York is 4 hours behind UTC.
  const ny = localHeatmap(grid, 'America/New_York', new Date('2026-10-14T12:00:00Z'))
  assert.equal(ny[4][11], 3)
  assert.equal(ny[4][15], null)
  // Winter: 5 hours behind, so the same UTC cell is 10 AM.
  const winter = localHeatmap(grid, 'America/New_York', new Date('2026-12-09T12:00:00Z'))
  assert.equal(winter[4][10], 3)
  // Crossing midnight moves the weekday: Thursday 02:00 UTC is Wednesday 10 PM in New York (summer).
  const late = Array.from({ length: 7 }, () => new Array<number | null>(24).fill(null))
  late[4][2] = 2
  assert.equal(localHeatmap(late, 'America/New_York', new Date('2026-10-14T12:00:00Z'))[3][22], 2)
  // UTC stays as it is.
  assert.equal(localHeatmap(grid, 'UTC', new Date('2026-10-14T12:00:00Z'))[4][15], 3)
})

test('cells landing on the same local slot are averaged; unknown zone falls back to UTC', () => {
  const grid = Array.from({ length: 7 }, () => new Array<number | null>(24).fill(null))
  grid[0][0] = 2
  grid[0][1] = 4
  // Kolkata is 5.5 hours ahead: 00:00 UTC is 5:30 and 01:00 UTC is 6:30 (different slots).
  const india = localHeatmap(grid, 'Asia/Kolkata', new Date('2026-10-14T12:00:00Z'))
  assert.equal(india[0][5], 2)
  assert.equal(india[0][6], 4)
  assert.equal(localHeatmap(grid, 'Not/AZone', new Date('2026-10-14T12:00:00Z'))[0][1], 4)
})

test('the busiest slot is the highest average, earliest on a tie, and null when empty', () => {
  const grid = Array.from({ length: 7 }, () => new Array<number | null>(24).fill(null))
  assert.equal(busiestSlot(grid), null)
  grid[5][20] = 4
  grid[2][9] = 4
  grid[6][1] = 1
  assert.deepEqual(busiestSlot(grid), { weekday: 2, hour: 9, average: 4 })
})
