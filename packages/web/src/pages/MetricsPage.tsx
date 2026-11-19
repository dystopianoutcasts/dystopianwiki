/**
 * MetricsPage (/metrics) - "Outcast Metrics": how the server is doing, from our own records.
 *
 * Top to bottom: headline tiles, one range picker for the whole page (7 days / 30 days /
 * Season 1, Season 1 by default), players online, hours played, different and first-time
 * players, busiest hours in the viewer's time zone, the three races (the only charts that
 * move), deaths and kills, and the BattleMetrics rank card. Every chart has a written
 * summary, an aria-label that states the data, and an empty state that says why it is empty
 * and when it fills. Numbers come from aurora.metrics_summary and aurora.metrics_races
 * (migration 052); the rollup runs every hour.
 */
import { useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { SEOHead } from '../components/seo/SEOHead'
import { BattleMetricsCard } from '../components/landing/BattleMetricsCard'
import { ChartCard, Heatmap, SvgBars, SvgLines } from '../components/metrics/charts'
import { RacesSection } from '../components/metrics/RacesSection'
import { useBattleMetrics } from '../hooks/useBattleMetrics'
import { useHomeSummary } from '../hooks/useHomeSummary'
import { useMetricsRaces, useMetricsSummary } from '../hooks/useMetrics'
import { formatRank } from '../lib/battlemetrics'
import { TBD } from '../lib/homeSummary'
import {
  busiestSlot,
  dayLabel,
  DEFAULT_METRICS_RANGE,
  formatCount,
  formatHoursPlayed,
  hourName,
  localHeatmap,
  METRICS_RANGES,
  rangePhrase,
  trackedFromNote,
  viewerZone,
  WEEKDAY_NAMES,
  type MetricsRange,
  type MetricsSummary,
} from '../lib/metrics'
import '../styles/components/home-sections.css'
import '../styles/pages/metrics.css'

function emptyReason(loading: boolean, failed: boolean, hasData: boolean, whenItFills: string): string | null {
  if (hasData) return null
  if (loading) return 'Loading...'
  if (failed) return 'These numbers could not load just now. Reload the page to try again.'
  return whenItFills
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <li className={value === TBD ? 'metrics-tile metrics-tile--tbd' : 'metrics-tile'}>
      <span className="metrics-tile__value">{value}</span>
      <span className="metrics-tile__label">{label}</span>
    </li>
  )
}

function average(values: readonly (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null)
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
}

const round1 = (n: number) => Math.round(n * 10) / 10

function Charts({
  range,
  summary,
  loading,
  failed,
  children,
}: {
  range: MetricsRange
  summary: MetricsSummary | null
  loading: boolean
  failed: boolean
  /** Rendered between the player charts and the deaths and kills (the races). */
  children: ReactNode
}) {
  const zone = useMemo(() => viewerZone(), [])
  const phrase = rangePhrase(range)
  const daily = summary?.daily ?? []
  const lastDay = daily.length ? dayLabel(daily[daily.length - 1].day) : ''
  const firstDay = daily.length ? dayLabel(daily[0].day) : ''
  const dayNames = (i: number) => (daily[i] ? dayLabel(daily[i].day) : '')

  // Players online: hourly for 7 days, daily beyond.
  const hourly = summary?.hourly ?? []
  const useHourly = range === '7' && hourly.length > 0
  const onlineAvg = useHourly ? hourly.map((h) => h.avg) : daily.map((d) => d.avg)
  const onlinePeak = useHourly ? hourly.map((h) => h.peak) : daily.map((d) => d.peak)
  const hasOnline = onlineAvg.some((v) => v !== null)
  const avgOverall = average(onlineAvg)
  const peakOverall = Math.max(0, ...onlinePeak.map((v) => v ?? 0))
  const onlineLabel = (i: number) =>
    useHourly ? `${hourly[i].t.toLocaleString(undefined, { weekday: 'short', hour: 'numeric' })}` : dayNames(i)

  // Hours played per day.
  const hours = daily.map((d) => d.hoursPlayed)
  const hasHours = hours.some((v) => v !== null)
  const hoursTotal = summary?.totals.hoursPlayed ?? null

  // Different and first-time players.
  const unique = daily.map((d) => d.uniquePlayers)
  const fresh = daily.map((d) => (d.uniquePlayers !== null || d.newPlayers > 0 ? d.newPlayers : null))
  const hasPlayers = unique.some((v) => v !== null) || fresh.some((v) => v !== null && v > 0)

  // Busiest hours.
  const heat = useMemo(() => (summary ? localHeatmap(summary.heatmap, zone, new Date()) : null), [summary, zone])
  const busiest = heat ? busiestSlot(heat) : null
  const hasHeat = !!busiest

  // Deaths and kills.
  const kills = daily.map((d) => d.kills)
  const deaths = daily.map((d) => d.deaths)
  const hasEvents = (summary?.totals.kills ?? 0) > 0 || (summary?.totals.deaths ?? 0) > 0

  const trackedNote = (label: string, since: Date | null) => {
    const note = summary ? trackedFromNote(summary.since, since) : null
    return note ? `${label}: ${note}.` : null
  }

  return (
    <>
      <div className="metrics-grid">
        <ChartCard
          className="metrics-card--wide"
          title="Players online"
          summary={
            avgOverall === null
              ? ''
              : `About ${round1(avgOverall)} players online on average, and ${peakOverall} at the busiest moment, over ${phrase}.`
          }
          note={[trackedNote('Player counts', summary?.playersSince ?? null), useHourly ? 'One point per hour.' : 'One point per day; days are counted in UTC.'].filter(Boolean).join(' ')}
          empty={emptyReason(loading, failed, hasOnline, 'Player counts have not been recorded for this range yet. They fill in hour by hour, starting when the server first reported in.')}
        >
          <SvgLines
            series={[
              { name: 'Average players online', className: 'metrics-line--avg', values: onlineAvg },
              { name: 'Most players online at once', className: 'metrics-line--peak', values: onlinePeak },
            ]}
            labelFor={onlineLabel}
            unit="players"
            startLabel={useHourly ? 'last 7 days' : firstDay}
            endLabel={useHourly ? 'now' : lastDay}
            ariaLabel={`Line chart of players online over ${phrase}. Average ${avgOverall === null ? 'unknown' : round1(avgOverall)}, highest ${peakOverall}.`}
          />
        </ChartCard>

        <ChartCard
          title="Hours played per day"
          summary={hoursTotal === null ? '' : `${formatHoursPlayed(hoursTotal)} played over ${phrase}, all players together.`}
          note={trackedNote('Hours played', summary?.trackingSince ?? null)}
          empty={emptyReason(loading, failed, hasHours, 'Play time has not been counted for this range yet. It fills in as the server records who is online, and the server logs fill in the earlier days.')}
        >
          <SvgBars
            values={hours}
            labelFor={dayNames}
            unit="hours played"
            startLabel={firstDay}
            endLabel={lastDay}
            ariaLabel={`Bar chart of hours played per day over ${phrase}. Total ${hoursTotal === null ? 'unknown' : round1(hoursTotal)} hours.`}
          />
        </ChartCard>

        <ChartCard
          title="Different and first-time players per day"
          summary={`${formatCount(summary?.totals.uniquePlayers ?? null)} different players and ${formatCount(summary?.totals.newPlayers ?? 0)} first-time players over ${phrase}.`}
          note={trackedNote('Different players', summary?.trackingSince ?? null)}
          empty={emptyReason(loading, failed, hasPlayers, 'Player counts per day have not been recorded for this range yet. They fill in day by day.')}
        >
          <SvgLines
            series={[
              { name: 'Different players that day', className: 'metrics-line--avg', values: unique },
              { name: 'First-time players that day', className: 'metrics-line--new', values: fresh },
            ]}
            labelFor={dayNames}
            unit="players"
            startLabel={firstDay}
            endLabel={lastDay}
            ariaLabel={`Line chart of different players and first-time players per day over ${phrase}. ${formatCount(summary?.totals.uniquePlayers ?? null)} different, ${formatCount(summary?.totals.newPlayers ?? 0)} first-time.`}
          />
        </ChartCard>

        <ChartCard
          className="metrics-card--wide"
          title="Busiest hours"
          summary={busiest ? `Busiest around ${WEEKDAY_NAMES[busiest.weekday]} ${hourName(busiest.hour)} to ${hourName(busiest.hour + 1)} your time (${round1(busiest.average)} players on average).` : ''}
          note={null}
          empty={emptyReason(loading, failed, hasHeat, 'The busiest hours show here once the server has reported a few days of player counts.')}
        >
          {heat ? (
            <Heatmap
              grid={heat}
              zone={zone}
              ariaLabel={`Heatmap of average players by weekday and hour in your time zone, ${zone}. Busiest ${busiest ? `${WEEKDAY_NAMES[busiest.weekday]} ${hourName(busiest.hour)}` : 'unknown'}.`}
            />
          ) : null}
        </ChartCard>
      </div>

      {children}

      <div className="metrics-grid">
        <ChartCard
          title="Zombies killed per day"
          summary={`${formatCount(summary?.totals.kills ?? 0)} zombies killed over ${phrase}.`}
          note="Recorded kills. Days are counted in UTC."
          empty={emptyReason(loading, failed, hasEvents, 'No zombie kills have been recorded for this range yet. This fills in as players kill zombies.')}
        >
          <SvgBars
            values={kills}
            labelFor={dayNames}
            unit="zombies killed"
            startLabel={firstDay}
            endLabel={lastDay}
            ariaLabel={`Bar chart of zombies killed per day over ${phrase}. Total ${formatCount(summary?.totals.kills ?? 0)}.`}
          />
        </ChartCard>
        <ChartCard
          title="Deaths per day"
          summary={`${formatCount(summary?.totals.deaths ?? 0)} deaths over ${phrase}.`}
          note="Days are counted in UTC."
          empty={emptyReason(loading, failed, hasEvents, 'No deaths have been recorded for this range yet.')}
        >
          <SvgBars
            values={deaths}
            labelFor={dayNames}
            unit="deaths"
            startLabel={firstDay}
            endLabel={lastDay}
            barClass="metrics-bar metrics-bar--red"
            ariaLabel={`Bar chart of deaths per day over ${phrase}. Total ${formatCount(summary?.totals.deaths ?? 0)}.`}
          />
        </ChartCard>
      </div>
    </>
  )
}

export function MetricsPage() {
  const rangeId = useId()
  const [range, setRange] = useState<MetricsRange>(DEFAULT_METRICS_RANGE)
  const week = useMetricsSummary('7')
  const chosen = useMetricsSummary(range)
  const races = useMetricsRaces()
  const { summary: home } = useHomeSummary()
  const { summary: bm } = useBattleMetrics()

  const tiles = week.data
  return (
    <Layout>
      <SEOHead
        title="Outcast Metrics"
        description="How the Dystopian Outcasts server is doing: players online, hours played, new players, the busiest hours, deaths and zombie kills, and three races through Season 1."
      />
      <main className="metrics">
        <header className="metrics__header">
          <p className="metrics__kicker">Dystopian Outcasts</p>
          <h1 className="metrics__title">Outcast Metrics</h1>
          <p className="metrics__lead">
            How the server is doing, from our own records, updated every hour. Pick a range below and every chart changes with it.
          </p>
          <p className="metrics__back">
            <Link to="/">Back to the home page</Link>
          </p>
        </header>

        <ul className="metrics-tiles" aria-label="This week at a glance">
          <Tile value={home ? String(home.onlineNow) : TBD} label="online now" />
          <Tile value={tiles?.totals.peak != null ? String(tiles.totals.peak) : TBD} label="most online at once this week" />
          <Tile value={tiles?.totals.hoursPlayed != null ? formatHoursPlayed(tiles.totals.hoursPlayed) : TBD} label="played this week" />
          <Tile value={tiles ? formatCount(tiles.totals.newPlayers) : TBD} label="first-time players this week" />
          <Tile value={formatRank(bm?.rank) ?? TBD} label="BattleMetrics rank" />
        </ul>

        <div className="metrics-range" role="group" aria-labelledby={rangeId}>
          <span className="metrics-range__label" id={rangeId}>
            Show
          </span>
          {METRICS_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={r.id === range ? 'metrics-btn metrics-btn--on' : 'metrics-btn'}
              aria-pressed={r.id === range}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
          <span className="metrics-range__now" aria-live="polite">
            Showing {rangePhrase(range)}
          </span>
        </div>

        <Charts range={range} summary={chosen.data} loading={chosen.loading} failed={chosen.failed}>
          <RacesSection feed={races.data} loading={races.loading} />
        </Charts>

        <section className="metrics-section" aria-labelledby="metrics-bm-title">
          <h2 className="metrics-section__title" id="metrics-bm-title">
            BattleMetrics
          </h2>
          <BattleMetricsCard summary={bm} />
        </section>
      </main>
    </Layout>
  )
}
