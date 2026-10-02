/**
 * Tests for homeSummary: reading aurora.home_summary() defensively and turning it
 * into the figures the home page shows, with TBD for anything not reported.
 *
 * node:test, run with `npx tsx --test src/lib/homeSummary.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  busiestHours,
  cleanWelcome,
  formatDuration,
  formatHour,
  formatHoursSurvived,
  isServerOnline,
  joiningText,
  modeBadge,
  parseHomeSummary,
  settingRows,
  TBD,
} from './homeSummary'

const RAW = {
  server_name: 'Dystopian Outcasts',
  last_seen: '2026-10-02T12:00:00+00:00',
  up_since: '2026-10-01T05:13:00+00:00',
  online_now: 3,
  survivors_total: 40,
  survivors_7d: 12,
  peak_7d: 9,
  hourly_7d: [[1759406400, 4], [1759410000, 6], ['bad', 1], [1759413600]],
  zombies_killed_today: 1234,
  players_killed_today: null,
  longest_survivors: [
    { name: 'Ann', hours: 300.5, online: true },
    { name: '', hours: 9 },
    { name: 'Bob', hours: 'x' },
    { name: 'Cy', hours: 12, online: 'yes' },
  ],
  safehouses: 5,
  vehicles: 120,
  settings: { PVP: false, MaxPlayers: 32, Open: false, HasPassword: true, Map: ['Muldraugh, KY'], WorkshopItems: ['1', '2', '3'] },
  sandbox: {
    Zombies: { v: 4, label: 'Normal' },
    'ZombieLore.Speed': { v: 2, label: 'Fast Shamblers' },
    'MultiplierConfig.Global': { v: 1.5 },
    Broken: { v: { nested: true } },
    AlsoBroken: 7,
  },
  config_updated_at: '2026-10-02T11:59:00+00:00',
}

test('parses the summary and drops malformed parts', () => {
  const s = parseHomeSummary(RAW)
  assert.ok(s)
  assert.equal(s.onlineNow, 3)
  assert.equal(s.peak7d, 9)
  assert.equal(s.hourly.length, 2, 'bad hourly points are dropped')
  assert.equal(s.hourly[1].peak, 6)
  assert.equal(s.hourly[0].hour.toISOString(), '2025-10-02T12:00:00.000Z')
  assert.equal(s.playersKilledToday, null)
  assert.deepEqual(s.longest.map((x) => x.name), ['Ann', 'Cy'], 'blank names and bad hours are dropped')
  assert.equal(s.longest[1].online, false, 'only true counts as online')
  assert.deepEqual(Object.keys(s.sandbox).sort(), ['MultiplierConfig.Global', 'ZombieLore.Speed', 'Zombies'])
  assert.equal(s.upSince?.toISOString(), '2026-10-01T05:13:00.000Z')
})

test('anything that is not the summary is null', () => {
  assert.equal(parseHomeSummary(null), null)
  assert.equal(parseHomeSummary([]), null)
  assert.equal(parseHomeSummary({ message: 'function not found' }), null)
})

test('an empty server parses to zeros and empty lists', () => {
  const s = parseHomeSummary({ online_now: 0, hourly_7d: [], settings: {}, sandbox: {} })
  assert.ok(s)
  assert.equal(s.serverName, null)
  assert.equal(s.lastSeen, null)
  assert.deepEqual(s.longest, [])
  assert.equal(s.vehicles, 0)
})

test('online means heard from in the last five minutes', () => {
  const s = parseHomeSummary(RAW)
  assert.equal(isServerOnline(s, new Date('2026-10-02T12:04:59Z')), true)
  assert.equal(isServerOnline(s, new Date('2026-10-02T12:05:01Z')), false)
  assert.equal(isServerOnline(null, new Date()), null, 'unknown, not offline, when there is no summary')
})

test('durations and hours read naturally', () => {
  assert.equal(formatDuration(12 * 60000), '12 min')
  assert.equal(formatDuration((5 * 60 + 3) * 60000), '5 h 3 min')
  assert.equal(formatDuration((26 * 60) * 60000), '1 day 2 h')
  assert.equal(formatDuration(-5), '0 min')
  assert.equal(formatHoursSurvived(300.5), '12 days 12 h')
  assert.equal(formatHoursSurvived(5.9), '5 h')
  assert.equal(formatHoursSurvived(24), '1 day 0 h')
  assert.equal(formatHour(0), '12 am')
  assert.equal(formatHour(12), '12 pm')
  assert.equal(formatHour(19), '7 pm')
  assert.equal(formatHour(25), '1 am')
})

test('the busiest three hours are averaged per local hour and wrap past midnight', () => {
  const at = (h: number, peak: number) => ({ hour: new Date(Date.UTC(2026, 9, 1, h)), peak })
  const utc = (d: Date) => d.getUTCHours()
  const points = [at(22, 6), at(23, 8), at(0, 7), at(1, 1), at(12, 2)]
  const b = busiestHours(points, utc)
  assert.deepEqual(b, { start: 22, average: 7 })
  assert.equal(busiestHours([], utc), null)
  assert.equal(busiestHours([at(3, 0)], utc), null, 'nobody ever online is no answer, not 3 am')
})

test('the welcome text loses the game tags', () => {
  assert.equal(cleanWelcome('Welcome <RGB:1,0,0> to <LINE> the  Outcasts'), 'Welcome to the Outcasts')
  assert.equal(cleanWelcome('<LINE>'), null)
  assert.equal(cleanWelcome(7), null)
})

test('settings read in plain words, and TBD where unknown', () => {
  const s = parseHomeSummary(RAW)
  assert.equal(modeBadge(s), 'PvE')
  assert.equal(joiningText(s), 'Whitelist: ask in Discord, password from Discord')
  const rows = Object.fromEntries(settingRows(s).map((r) => [r.label, r.value]))
  assert.equal(rows['Player slots'], '32')
  assert.equal(rows['Zombie population'], 'Normal')
  assert.equal(rows['Zombie speed'], 'Fast Shamblers')
  assert.equal(rows['XP rate'], '1.5x')
  assert.equal(rows['Workshop mods'], '3')
  assert.equal(rows['Zombie toughness'], TBD)
  assert.equal(rows['World age'], TBD)
  assert.equal(rows['Game version'], TBD)
})

test('with no summary at all, every setting is TBD', () => {
  for (const row of settingRows(null)) assert.equal(row.value, TBD, row.label)
  assert.equal(modeBadge(null), TBD)
  assert.equal(joiningText(null), TBD)
})

test('PvP and an open server without a password', () => {
  const s = parseHomeSummary({ ...RAW, settings: { PVP: true, Open: true, HasPassword: false } })
  assert.equal(modeBadge(s), 'PvP')
  assert.equal(joiningText(s), 'Open to everyone, no password')
})
