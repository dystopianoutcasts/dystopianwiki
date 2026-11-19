import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BIG_DEATH_HOLD_MS,
  bigDeathBetween,
  bigDeaths,
  biggestThisStep,
  buildLives,
  burstAt,
  burstHoldSteps,
  clockAtStep,
  crumbleSteps,
  easternAt,
  expandSparse,
  formatDaysSurvived,
  leadership,
  lifeStateAt,
  makeTrack,
  parseRaces,
  raceHeadline,
  standingsAt,
  totalsByEasternDay,
  totalsByEasternHour,
  type LivesEntry,
  type RaceTrack,
} from './metricsRaces'

// Season start Oct 3, 2026, 00:00 UTC (8 PM Oct 2 in New York).
const START = new Date('2026-10-03T00:00:00Z')

test('sparse pairs expand to one number per step; odd pairs are skipped', () => {
  assert.deepEqual(expandSparse([0, 2, 3, 5, 3, 1], 5), [2, 0, 0, 6, 0])
  assert.deepEqual(expandSparse([-1, 4, 9, 4, 1.5, 4, 2, -3, 'x', 1], 5), [0, 0, 0, 0, 0])
  assert.deepEqual(expandSparse(null, 3), [0, 0, 0])
})

test('the Eastern clock follows daylight saving: Nov 1 has two 1 AMs', () => {
  const edt = easternAt(new Date('2026-11-01T05:00:00Z'))
  const est = easternAt(new Date('2026-11-01T06:00:00Z'))
  assert.equal(edt.hourLabel, '1 AM')
  assert.equal(est.hourLabel, '1 AM')
  assert.equal(edt.dayKey, '2026-11-01')
  assert.equal(est.dayKey, '2026-11-01')
  assert.equal(edt.dayLabel, 'Sun, Nov 1')
  assert.equal(easternAt(new Date('2026-11-01T07:00:00Z')).hourLabel, '2 AM')
  assert.equal(easternAt(new Date('2026-11-02T05:00:00Z')).dayKey, '2026-11-02')
  // The season's first hour is 8 PM on Oct 2, Eastern.
  const first = clockAtStep(START, 0)
  assert.equal(first.dayLabel, 'Fri, Oct 2')
  assert.equal(first.hourLabel, '8 PM')
  // The step whose hour starts at Nov 1 06:00 UTC and the one before it both read 1 AM.
  const repeat = (new Date('2026-11-01T06:00:00Z').getTime() - START.getTime()) / 3600000
  assert.equal(clockAtStep(START, repeat).hourLabel, '1 AM')
  assert.equal(clockAtStep(START, repeat - 1).hourLabel, '1 AM')
})

test('per day and per hour of the day use the Eastern clock; Nov 1 has 25 hours', () => {
  const steps = (new Date('2026-11-03T00:00:00Z').getTime() - START.getTime()) / 3600000
  const ones = new Array<number>(steps).fill(1)
  const days = totalsByEasternDay(START, ones)
  const nov1 = days.find((d) => d.dayKey === '2026-11-01')
  assert.ok(nov1)
  assert.equal(nov1.total, 25)
  assert.equal(nov1.label, 'Nov 1')
  assert.equal(days[0].dayKey, '2026-10-02')
  assert.equal(days[0].total, 4)
  const byHour = totalsByEasternHour(START, ones)
  assert.equal(byHour.length, 24)
  assert.equal(byHour.reduce((a, b) => a + b, 0), steps)
  // 1 AM is the hour that happens twice on Nov 1, so it has one more than 2 AM.
  assert.equal(byHour[1], byHour[2] + 1)
})

function tracks(): RaceTrack[] {
  // A: 5 at step 1, 1 at step 4.  B: 3 at step 2, 4 at step 3.  C: nothing.
  return [
    makeTrack('a', 'Alpha', [0, 5, 0, 0, 1, 0]),
    makeTrack('b', 'Bravo', [0, 0, 3, 4, 0, 0]),
    makeTrack('c', 'Charlie', [0, 0, 0, 0, 0, 0]),
  ]
}

test('standings, leader and the last lead change', () => {
  const t = tracks()
  assert.deepEqual(standingsAt(t, 3), [1, 0, 2])
  assert.deepEqual(standingsAt(t, 0), [0, 1, 2])
  const lead = leadership(t, 5)
  // Nobody at 0; Alpha leads from 1; Bravo (3 vs 5) trails at 2; Bravo (7 vs 5) passes at 3.
  assert.deepEqual(lead.leader, [-1, 0, 0, 1, 1, 1])
  assert.deepEqual(lead.lastChange, [-1, -1, -1, 3, 3, 3])
})

test('the first player to score is not a lead change; a tie keeps the earlier player', () => {
  const t = [makeTrack('a', 'Alpha', [0, 2, 0]), makeTrack('b', 'Bravo', [0, 2, 1])]
  const lead = leadership(t, 2)
  assert.deepEqual(lead.leader, [-1, 0, 1])
  assert.deepEqual(lead.lastChange, [-1, -1, 2])
})

const words = { total: (track: RaceTrack, step: number) => `${track.cumulative[step]} kills` }

test('the headline names a lead change, otherwise who leads', () => {
  const t = tracks()
  const lead = leadership(t, 5)
  // Step 3 is 03:00 UTC, which is 11 PM on Oct 2 in New York.
  assert.equal(raceHeadline(t, lead, 3, START, words), 'Oct 2, 11 PM: Bravo takes first place from Alpha.')
  assert.equal(raceHeadline(t, lead, 1, START, words), 'Alpha leads with 5 kills.')
  assert.equal(raceHeadline(t, lead, 0, START, words), 'Nobody has scored yet.')
})

test('a lead change is named for 36 steps, then the headline goes back to who leads', () => {
  const per = new Array<number>(60).fill(0)
  const a = makeTrack('a', 'Alpha', per.map((_, i) => (i === 1 ? 5 : 0)))
  const b = makeTrack('b', 'Bravo', per.map((_, i) => (i === 2 ? 9 : 0)))
  const lead = leadership([a, b], 59)
  assert.match(raceHeadline([a, b], lead, 2 + 35, START, words), /takes first place from Alpha/)
  assert.equal(raceHeadline([a, b], lead, 2 + 36, START, words), 'Bravo leads with 9 kills.')
})

test('an hour of 250 kills or more is called out in front', () => {
  const big = [makeTrack('a', 'Alpha', [0, 300, 0]), makeTrack('b', 'Bravo', [10, 0, 0])]
  const lead = leadership(big, 2)
  assert.equal(
    raceHeadline(big, lead, 1, START, words, 'kills'),
    'Alpha kills 300 in one hour. Oct 2, 9 PM: Alpha takes first place from Bravo.',
  )
  assert.equal(raceHeadline(big, lead, 1, START, words), 'Oct 2, 9 PM: Alpha takes first place from Bravo.')
  assert.deepEqual(biggestThisStep(big, 1), { name: 'Alpha', amount: 300 })
  assert.equal(biggestThisStep(big, 2), null)
  const small = [makeTrack('a', 'Alpha', [0, 249, 0])]
  assert.doesNotMatch(raceHeadline(small, leadership(small, 2), 1, START, words, 'kills'), /in one hour/)
})

test('a +N tag is held about 2.5 seconds at any speed, never under 3 steps, and fades', () => {
  assert.equal(burstHoldSteps(160), 16)
  assert.equal(burstHoldSteps(70), 36)
  assert.equal(burstHoldSteps(25), 100)
  assert.equal(burstHoldSteps(2000), 3)
  const per = new Array<number>(21).fill(0)
  per[1] = 7
  const t = makeTrack('a', 'Alpha', per)
  assert.deepEqual(burstAt(t, 1, 160), { amount: 7, fade: 0 })
  assert.deepEqual(burstAt(t, 9, 160), { amount: 7, fade: 8 / 16 })
  assert.equal(burstAt(t, 17, 160), null)
  assert.equal(burstAt(t, 0, 160), null)
})

const entry = (over: Partial<LivesEntry>): LivesEntry => ({
  username: 'p',
  displayName: 'P',
  isDead: false,
  hoursSurvived: 48,
  firstSeenHour: 10,
  deaths: [],
  ...over,
})

test('lives are built from deaths: each death starts the next life, the last is open unless dead', () => {
  const lives = buildLives(entry({ hoursSurvived: 100, deaths: [{ atHour: 30, survivedHours: 24 }, { atHour: 100, survivedHours: 240 }] }))
  assert.deepEqual(lives, [
    { startHour: 10, endHour: 30, days: 1 },
    { startHour: 30, endHour: 100, days: 10 },
    { startHour: 100, endHour: null, days: 100 / 24 },
  ])
  assert.equal(buildLives(entry({ isDead: true, deaths: [{ atHour: 30, survivedHours: 24 }] })).length, 1)
  assert.deepEqual(buildLives(entry({ firstSeenHour: null }))[0], { startHour: 0, endHour: null, days: 2 })
})

test('life state: growth between start and death, best life, death count', () => {
  const lives = buildLives(entry({ hoursSurvived: 24, firstSeenHour: 0, deaths: [{ atHour: 20, survivedHours: 48 }] }))
  const at10 = lifeStateAt(lives, 10, 100)
  assert.equal(at10.alive, true)
  assert.equal(at10.current, 1)
  assert.equal(at10.deaths, 0)
  const at20 = lifeStateAt(lives, 20, 100)
  assert.equal(at20.deaths, 1)
  assert.equal(at20.best, 2)
  assert.equal(at20.lastDeath?.days, 2)
  // The new life starts at the death, so just after it the bar is near zero and the best stays 2.
  const at21 = lifeStateAt(lives, 21, 100)
  assert.ok(at21.current < 0.02)
  assert.equal(at21.best, 2)
  assert.equal(lifeStateAt(lives, 100, 100).current, 1)
})

test('big deaths are lives of 10 days or more; the race holds when one ends in the next step', () => {
  const players = [
    { name: 'A', lives: buildLives(entry({ deaths: [{ atHour: 50, survivedHours: 240 }, { atHour: 60, survivedHours: 239 }] })) },
    { name: 'B', lives: buildLives(entry({ deaths: [{ atHour: 70, survivedHours: 100 }] })) },
  ]
  const bigs = bigDeaths(players)
  assert.deepEqual(bigs.map((b) => [b.name, b.endHour, b.days]), [['A', 50, 10]])
  assert.equal(bigDeathBetween(bigs, 49, 50)?.name, 'A')
  assert.equal(bigDeathBetween(bigs, 50, 51), null)
  assert.equal(bigDeathBetween(bigs, 40, 49), null)
  assert.equal(BIG_DEATH_HOLD_MS, 3200)
})

test('a crumbling bar stays about 3.6 seconds at any speed', () => {
  assert.equal(crumbleSteps(160), 23)
  assert.equal(crumbleSteps(25), 144)
  assert.equal(crumbleSteps(5000), 3)
})

test('days survived in words', () => {
  assert.equal(formatDaysSurvived(0.01), '1 hour')
  assert.equal(formatDaysSurvived(0.3), '7 hours')
  assert.equal(formatDaysSurvived(3.25), '3.3 days')
  assert.equal(formatDaysSurvived(42.4), '42 days')
})

test('the feed parses: steps from the season start to now, sparse series, lives with hours', () => {
  const feed = parseRaces({
    season_start: '2026-10-03T00:00:00+00:00',
    now: '2026-10-03T05:30:00+00:00',
    sessions_imported: true,
    kills: {
      players: [{ username: 'a', display_name: 'Alpha', total: 7, series: [1, 3, 4, 4] }, { username: '', series: [] }, 'x'],
      hourly_totals: [1, 3, 4, 4, 5, 9],
    },
    lives: {
      players: [
        {
          username: 'a',
          display_name: 'Alpha',
          best_hours: 30,
          hours_survived: 12.5,
          is_dead: false,
          first_seen: '2026-10-03T01:00:00Z',
          deaths: [['2026-10-03T03:00:00Z', 6], ['bad', 1], ['2026-10-03T02:00:00Z', 4]],
        },
      ],
    },
    time: { players: [{ username: 'a', display_name: 'Alpha', minutes: 90, series: [0, 60, 2, 30] }] },
  })
  assert.ok(feed)
  assert.equal(feed.lastStep, 5)
  assert.equal(feed.sessionsImported, true)
  assert.equal(feed.kills.length, 1)
  assert.deepEqual(feed.kills[0].perStep, [0, 3, 0, 0, 4, 0])
  assert.deepEqual(feed.killTotals, [0, 3, 0, 0, 4, 9])
  assert.deepEqual(feed.time[0].cumulative, [60, 60, 90, 90, 90, 90])
  assert.deepEqual(feed.lives[0].deaths.map((d) => [d.atHour, d.survivedHours]), [[2, 4], [3, 6]])
  assert.equal(feed.lives[0].firstSeenHour, 1)
  assert.equal(feed.lives[0].hoursSurvived, 12.5)
})

test('an answer with no season start is not a feed; an empty feed has empty races', () => {
  assert.equal(parseRaces(null), null)
  assert.equal(parseRaces({ kills: {} }), null)
  const empty = parseRaces({ season_start: '2026-10-03T00:00:00Z', now: '2026-10-03T00:10:00Z' })
  assert.ok(empty)
  assert.equal(empty.lastStep, 0)
  assert.equal(empty.sessionsImported, false)
  assert.deepEqual(empty.kills, [])
  assert.deepEqual(empty.lives, [])
  assert.deepEqual(empty.time, [])
})
