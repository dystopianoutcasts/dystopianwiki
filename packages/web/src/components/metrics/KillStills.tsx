/**
 * The two still charts under the kill race: kills per day (the race's day in orange) and
 * kills by hour of the day in Eastern Time for the whole season (the race's hour in orange).
 * Both are counted on the Eastern clock, so they follow the Nov 1 clock change.
 */
import { useMemo } from 'react'
import { clockAtStep, hourLabel, totalsByEasternDay, totalsByEasternHour, type RaceFeed } from '../../lib/metricsRaces'
import { ChartCard, SvgBars } from './charts'

const fmt = (n: number) => n.toLocaleString('en-US')

export function KillStills({ feed, step }: { feed: RaceFeed; step: number }) {
  const days = useMemo(() => totalsByEasternDay(feed.seasonStart, feed.killTotals), [feed])
  const hours = useMemo(() => totalsByEasternHour(feed.seasonStart, feed.killTotals), [feed])
  const total = feed.killTotals.reduce((a, b) => a + b, 0)
  const clock = clockAtStep(feed.seasonStart, step)
  const dayIndex = Math.max(0, days.findIndex((d) => d.dayKey === clock.dayKey))
  const dayPeak = Math.max(0, ...days.map((d) => d.total))
  const hourPeak = Math.max(0, ...hours)
  const busiestDay = days.find((d) => d.total === dayPeak)
  const emptyReason = total === 0 ? 'No zombie kills have been recorded yet. This fills in as players kill zombies.' : null
  const quietest = hours.indexOf(Math.min(...hours))

  return (
    <div className="metrics-stills">
      <ChartCard
        className="metrics-card--wide"
        title="Zombie kills per day"
        summary={`Busiest day: ${busiestDay?.label ?? 'none'}, ${fmt(dayPeak)} kills. On ${days[dayIndex]?.label ?? 'the first day'}: ${fmt(days[dayIndex]?.total ?? 0)}.`}
        note="The orange bar is the day the race is on. Days run on the Eastern clock. A run of days with no kills is a quiet server or a gap in recording."
        empty={emptyReason}
      >
        <SvgBars
          values={days.map((d) => d.total)}
          labelFor={(i) => days[i]?.label ?? ''}
          ariaLabel={`Bar chart of zombie kills per day from ${days[0]?.label ?? ''} to ${days[days.length - 1]?.label ?? ''}. Busiest ${busiestDay?.label ?? 'none'} with ${fmt(dayPeak)}.`}
          startLabel={days[0]?.label ?? ''}
          middleLabel={days[Math.floor(days.length / 2)]?.label}
          endLabel={days[days.length - 1]?.label ?? ''}
          highlight={dayIndex}
          unit="zombies killed"
        />
      </ChartCard>
      <ChartCard
        title="Kills by hour of the day"
        summary={`Most kills at ${hourLabel(hours.indexOf(hourPeak))} (${fmt(hourPeak)}); fewest at ${hourLabel(quietest)}.`}
        note="Eastern Time, the whole season added up. The orange bar is the race's hour."
        empty={emptyReason}
      >
        <SvgBars
          values={hours}
          labelFor={(i) => hourLabel(i)}
          ariaLabel="Bar chart of zombie kills by hour of the day in Eastern Time, the whole season added up."
          startLabel="12 AM"
          middleLabel="12 PM"
          endLabel="11 PM"
          highlight={clock.hourOfDay}
          unit="kills"
          barClass="metrics-bar metrics-bar--blue"
        />
      </ChartCard>
    </div>
  )
}
