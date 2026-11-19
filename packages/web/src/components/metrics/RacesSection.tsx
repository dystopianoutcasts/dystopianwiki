/**
 * The three races on /metrics: time played, zombie kills (with its two still charts) and
 * longest alive. They are the only charts on the page that move; every one has Pause, Start
 * over, Slow / Normal / Fast and an Hour slider. Behavior follows the design boards in
 * _DEV\_CANVASES\2026-11-18-outcast-metrics (KillRace, LivedRace, RaceSeason): hourly steps
 * on the Eastern clock, a lingering "+N" tag, lead-change and big-hour headlines, the
 * crumble and a hold for a big death, and no motion at all with reduced motion.
 * The numbers are real: kills from kill_events, deaths from deaths, time played from the
 * rollup (aurora.metrics_races, migration 052); the math is in lib/metricsRaces.ts.
 */
import { useCallback, useMemo } from 'react'
import { formatMinutes } from '../../lib/metrics'
import {
  BIG_DEATH_HOLD_MS,
  bigDeathBetween,
  bigDeaths,
  buildLives,
  clockAtStep,
  formatDaysSurvived,
  leadership,
  lifeStateAt,
  raceHeadline,
  standingsAt,
  type RaceFeed,
  type RaceTrack,
} from '../../lib/metricsRaces'
import { BarRaceBoard } from './BarRaceBoard'
import { KillStills } from './KillStills'
import { LivedRaceBoard, type LivedRow } from './LivedRaceBoard'
import { RaceShell, type HeadlineTone } from './RaceShell'
import { usePrefersReducedMotion, useRacePlayback } from './useRacePlayback'

const HOUR_MS = 3600000
const fmt = (n: number) => n.toLocaleString('en-US')

function clockWords(feed: RaceFeed, step: number): { day: string; hour: string } {
  const c = clockAtStep(feed.seasonStart, step)
  if (step >= feed.lastStep) return { day: 'Now', hour: `${c.dayLabel}, ${c.hourLabel}` }
  return { day: c.dayLabel, hour: `${c.hourLabel} to ${clockAtStep(feed.seasonStart, step + 1).hourLabel}` }
}

function EmptyRace({ title, reason }: { title: string; reason: string }) {
  return (
    <section className="metrics-race">
      <h3 className="metrics-race__title">{title}</h3>
      <p className="metrics-card__empty">{reason}</p>
    </section>
  )
}

/** The first step at which any track has something; null when none does. */
function firstActiveStep(tracks: readonly RaceTrack[]): number | null {
  let first: number | null = null
  for (const t of tracks) {
    const i = t.perStep.findIndex((n) => n > 0)
    if (i >= 0 && (first === null || i < first)) first = i
  }
  return first
}

function standingsAria(tracks: readonly RaceTrack[], step: number, valueText: (n: number) => string): string {
  return standingsAt(tracks, step)
    .map((ti, k) => `${k + 1}. ${tracks[ti].displayName} ${valueText(tracks[ti].cumulative[step])}`)
    .join(', ')
}

/** The line above a bar race: the opening prompt, the end-of-season summary, or the live headline. */
function barHeadline(
  feed: RaceFeed,
  tracks: readonly RaceTrack[],
  lead: ReturnType<typeof leadership>,
  step: number,
  playing: boolean,
  valueText: (n: number) => string,
  opening: string,
  bigHourVerb?: string,
): string {
  const words = { total: (t: RaceTrack, s: number) => valueText(t.cumulative[s]) }
  if (step === 0) {
    const c = clockAtStep(feed.seasonStart, 0)
    return `${c.shortDay}, ${c.hourLabel}: ${opening} Press Play.`
  }
  if (step >= feed.lastStep && !playing) {
    const order = standingsAt(tracks, step)
    const first = tracks[order[0]]
    const second = tracks[order[1]]
    if (!first || first.cumulative[step] === 0) return 'Nobody has scored yet this season.'
    return `Now: ${first.displayName} leads the season with ${valueText(first.cumulative[step])}${
      second && second.cumulative[step] > 0 ? `, ${second.displayName} close behind with ${valueText(second.cumulative[step])}` : ''
    }.`
  }
  return raceHeadline(tracks, lead, step, feed.seasonStart, words, bigHourVerb)
}

function TimeRace({ feed }: { feed: RaceFeed }) {
  const tracks = feed.time
  const playback = useRacePlayback(feed.lastStep)
  const lead = useMemo(() => leadership(tracks, feed.lastStep), [tracks, feed.lastStep])
  if (tracks.length === 0) {
    return (
      <EmptyRace
        title="Race to the top: time played"
        reason="No play time has been counted yet. This fills in as the server's join and leave records are counted, hour by hour."
      />
    )
  }
  const step = playback.step
  const clock = clockWords(feed, step)
  const first = firstActiveStep(tracks)
  // Never present partial data as the whole season: say so when the server logs are not in yet.
  const startNote =
    first !== null && (first > 24 || !feed.sessionsImported)
      ? `Play time is counted from ${clockAtStep(feed.seasonStart, first).shortDay}${feed.sessionsImported ? '' : ', when the server began tracking positions'}; earlier play is not counted yet.`
      : null
  return (
    <RaceShell
      title="Race to the top: time played"
      badge="REAL TIME from our server, hour by hour"
      intro="Each bar is a player's time played this season, added up hour by hour. Press Play to watch them pass each other."
      clockDay={clock.day}
      clockHour={clock.hour}
      playback={playback}
      lastStep={feed.lastStep}
      headline={barHeadline(feed, tracks, lead, step, playback.playing, formatMinutes, 'the server opens.')}
      board={
        <BarRaceBoard
          tracks={tracks}
          step={step}
          msPerStep={playback.msPerStep}
          valueText={formatMinutes}
          showBursts={false}
          nothingYet="not yet"
          ariaLabel={`Bar chart of time played this season as of ${clock.day} ${clock.hour}: ${standingsAria(tracks, step, formatMinutes)}.`}
        />
      }
      footnote={startNote}
    />
  )
}

function KillRace({ feed }: { feed: RaceFeed }) {
  const tracks = feed.kills
  const playback = useRacePlayback(feed.lastStep)
  const lead = useMemo(() => leadership(tracks, feed.lastStep), [tracks, feed.lastStep])
  const total = useMemo(() => feed.killTotals.reduce((a, b) => a + b, 0), [feed])
  if (tracks.length === 0) {
    return (
      <EmptyRace
        title="Zombie kill race"
        reason="No zombie kills have been recorded this season yet. This fills in as players kill zombies."
      />
    )
  }
  const step = playback.step
  const clock = clockWords(feed, step)
  const valueText = (n: number) => fmt(n)
  const players = new Set(tracks.map((t) => t.username)).size
  return (
    <RaceShell
      title="Zombie kill race"
      badge="REAL NUMBERS from our server, hour by hour"
      intro={`${fmt(total)} zombies killed this season. Each bar is a player's kills so far; the green tag is the kills they made in the latest hour. Top ${players} players shown.`}
      clockDay={clock.day}
      clockHour={clock.hour}
      playback={playback}
      lastStep={feed.lastStep}
      headline={barHeadline(feed, tracks, lead, step, playback.playing, (n) => `${fmt(n)} kills`, 'the first night of the season.', 'kills')}
      board={
        <BarRaceBoard
          tracks={tracks}
          step={step}
          msPerStep={playback.msPerStep}
          valueText={valueText}
          showBursts
          nothingYet="none yet"
          ariaLabel={`Bar chart of zombie kills this season as of ${clock.day} ${clock.hour}: ${standingsAria(tracks, step, (n) => `${fmt(n)}`)}.`}
        />
      }
    >
      <KillStills feed={feed} step={step} />
    </RaceShell>
  )
}

function LivedRace({ feed }: { feed: RaceFeed }) {
  const reduced = usePrefersReducedMotion()
  const nowHour = (feed.now.getTime() - feed.seasonStart.getTime()) / HOUR_MS
  const players = useMemo(
    () => feed.lives.map((entry) => ({ username: entry.username, displayName: entry.displayName, name: entry.displayName, lives: buildLives(entry) })),
    [feed],
  )
  const bigs = useMemo(() => bigDeaths(players), [players])
  // A big death makes the race hold for a moment so the fall can be watched; not with reduced motion.
  const holdAfter = useCallback((from: number, to: number) => (!reduced && bigDeathBetween(bigs, from, to) ? BIG_DEATH_HOLD_MS : 0), [bigs, reduced])
  const playback = useRacePlayback(feed.lastStep, holdAfter)
  if (players.length === 0) {
    return (
      <EmptyRace
        title="Longest alive"
        reason="No lives have been recorded this season yet. This fills in as players join and, sooner or later, die."
      />
    )
  }
  const step = playback.step
  // At the last step the race ends at the real now (a partial hour), not the last whole hour.
  const t = step >= feed.lastStep ? nowHour : Math.min(nowHour, step)
  const clock = clockWords(feed, step)
  const rows: LivedRow[] = players.map((p) => ({ username: p.username, displayName: p.displayName, lives: p.lives, state: lifeStateAt(p.lives, t, nowHour) }))
  const deaths = rows.reduce((n, r) => n + r.state.deaths, 0)
  const order = rows.map((_, i) => i).sort((a, b) => rows[b].state.current - rows[a].state.current || a - b)
  const leader = rows[order[0]]
  let latest: { endHour: number; days: number; name: string } | null = null
  for (const r of rows) {
    const d = r.state.lastDeath
    if (d && d.endHour !== null && (!latest || d.endHour > latest.endHour)) latest = { endHour: d.endHour, days: d.days, name: r.displayName }
  }
  const windowSteps = Math.max(3, Math.ceil(3600 / playback.msPerStep))
  let headline = `${leader.displayName} has been alive the longest: ${formatDaysSurvived(leader.state.current)}.`
  let tone: HeadlineTone = 'normal'
  let big = false
  if (latest && t - latest.endHour < windowSteps * 2) {
    tone = 'alert'
    big = latest.days >= 10 && t - latest.endHour < windowSteps && !reduced
    if (big) tone = 'big'
    const c = clockAtStep(feed.seasonStart, latest.endHour)
    headline = `${big ? 'A BIG ONE FALLS. ' : ''}${c.shortDay}, ${c.hourLabel}: ${latest.name} died after ${formatDaysSurvived(latest.days)} and starts over.`
  }
  if (step === 0) {
    const c = clockAtStep(feed.seasonStart, 0)
    headline = `${c.shortDay}, ${c.hourLabel}: the server opens and everyone spawns. Press Play.`
    tone = 'normal'
  }
  if (step >= feed.lastStep && !playback.playing) {
    headline = `Today: ${leader.displayName} has survived ${formatDaysSurvived(leader.state.current)} without dying.`
    tone = 'normal'
  }
  const aria = `Bar chart of days survived by each character as of ${clock.day} ${clock.hour}: ${order
    .map((i, k) => `${k + 1}. ${rows[i].displayName} ${rows[i].state.alive ? formatDaysSurvived(rows[i].state.current) : 'dead'}`)
    .join(', ')}. ${deaths} ${deaths === 1 ? 'death' : 'deaths'} so far.`
  return (
    <RaceShell
      title="Longest alive"
      badge="REAL LIVES from our server"
      intro="Each bar is a character's days survived, in game days. When a character dies, their bar crumbles and the player starts over from zero. The thin line marks their best life so far."
      clockDay={clock.day}
      clockHour={clock.hour}
      clockExtra={`${deaths} ${deaths === 1 ? 'death' : 'deaths'} so far among these ${rows.length}`}
      playback={playback}
      lastStep={feed.lastStep}
      headline={headline}
      tone={tone}
      board={<LivedRaceBoard rows={rows} hour={t} msPerStep={playback.msPerStep} ariaLabel={aria} big={big} />}
      footnote="The top players by their longest life. Deaths come from the server's death records, each at its exact hour with the days it survived. How fast a bar grows between a life's start and its death is spread evenly."
    />
  )
}

export function RacesSection({ feed, loading }: { feed: RaceFeed | null; loading: boolean }) {
  return (
    <section className="metrics-section" aria-labelledby="metrics-races-title">
      <h2 className="metrics-section__title" id="metrics-races-title">
        The races <span className="metrics-section__always">Always the whole season</span>
      </h2>
      <p className="metrics-section__lead">
        Season 1, hour by hour, on the Eastern clock. These three are the only charts that move: press Pause, change the speed or drag the
        Hour slider whenever you like.
      </p>
      {loading && !feed ? <p className="metrics-card__empty">Loading the races...</p> : null}
      {!loading && !feed ? (
        <p className="metrics-card__empty">
          The races could not load just now. Reload the page to try again. They come from the server&apos;s own records and fill in as people play.
        </p>
      ) : null}
      {feed ? (
        <>
          <TimeRace feed={feed} />
          <KillRace feed={feed} />
          <LivedRace feed={feed} />
        </>
      ) : null}
    </section>
  )
}
