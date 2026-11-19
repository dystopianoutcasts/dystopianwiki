import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { feedWithNames, makeTrack, type RaceFeed } from './metricsRaces'

function feed(): RaceFeed {
  return {
    seasonStart: new Date('2026-10-03T00:00:00Z'),
    now: new Date('2026-10-03T02:30:00Z'),
    lastStep: 2,
    kills: [makeTrack('pootard', 'Pete Tard', [1, 2, 3])],
    killTotals: [1, 2, 3],
    time: [makeTrack('kitten', 'Kit Ten', [60, 60, 30])],
    lives: [{ username: 'boom', displayName: 'Bea Boom', isDead: false, hoursSurvived: 5, firstSeenHour: 0, deaths: [] }],
    sessionsImported: true,
  }
}

test('Survivor name mode shows each character name in all three races', () => {
  const f = feedWithNames(feed(), 'character')
  assert.equal(f.kills[0].displayName, 'Pete Tard')
  assert.equal(f.time[0].displayName, 'Kit Ten')
  assert.equal(f.lives[0].displayName, 'Bea Boom')
})

test('Username mode shows each username in all three races, and keeps the numbers', () => {
  const original = feed()
  const f = feedWithNames(original, 'account')
  assert.equal(f.kills[0].displayName, 'pootard')
  assert.equal(f.time[0].displayName, 'kitten')
  assert.equal(f.lives[0].displayName, 'boom')
  assert.deepEqual(f.kills[0].cumulative, original.kills[0].cumulative)
  assert.equal(f.kills[0].username, 'pootard')
  // The feed it was given is left alone.
  assert.equal(original.kills[0].displayName, 'Pete Tard')
})

test('the races section shows the shared switch and renames the feed by its choice', () => {
  const source = readFileSync(new URL('../components/metrics/RacesSection.tsx', import.meta.url), 'utf8')
  assert.match(source, /<NameModeSwitch mode=\{nameMode\} onChange=\{setNameMode\} \/>/)
  assert.match(source, /feedWithNames\(rawFeed, nameMode\)/)
  assert.match(source, /NAME_MODE_STORAGE_KEY/)
})
