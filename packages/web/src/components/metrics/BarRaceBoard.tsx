/**
 * The board for the time-played and zombie-kill races: one row per player, ranked, a bar
 * that grows with the running total, and (kills only) a "+N" tag that lingers and fades.
 * Rows move by a CSS transition on `top`; with reduced motion the CSS turns that off.
 */
import { burstAt, standingsAt, type RaceTrack } from '../../lib/metricsRaces'

export const RACE_COLORS = ['#9cc56b', '#c792ea', '#e8884a', '#e5c07b', '#7fb2e5', '#f28b82', '#e6dcc6', '#56b6c2', '#d19a66', '#98c379']

export function BarRaceBoard({
  tracks,
  step,
  msPerStep,
  valueText,
  ariaLabel,
  showBursts,
  nothingYet,
}: {
  tracks: readonly RaceTrack[]
  step: number
  msPerStep: number
  valueText: (total: number) => string
  ariaLabel: string
  showBursts: boolean
  nothingYet: string
}) {
  const order = standingsAt(tracks, step)
  const place = new Map(order.map((trackIndex, k) => [trackIndex, k]))
  const leaderTotal = Math.max(1, tracks[order[0]]?.cumulative[step] ?? 1)
  return (
    <div className="metrics-board" role="img" aria-label={ariaLabel} style={{ ['--rows' as string]: tracks.length }}>
      {tracks.map((track, i) => {
        const total = track.cumulative[step]
        const rank = place.get(i) ?? i
        const fraction = total > 0 ? Math.max(0.006, total / leaderTotal) : 0
        const burst = showBursts ? burstAt(track, step, msPerStep) : null
        return (
          <div
            key={track.username}
            className={total > 0 ? 'metrics-row' : 'metrics-row metrics-row--idle'}
            style={{
              ['--rank' as string]: rank,
              ['--fraction' as string]: fraction,
              ['--color' as string]: RACE_COLORS[i % RACE_COLORS.length],
            }}
          >
            <span className="metrics-row__place">{total > 0 ? rank + 1 : '-'}</span>
            <span className="metrics-row__name">{track.displayName}</span>
            <span className="metrics-row__track">
              <span className="metrics-row__bar" />
              <span className="metrics-row__value">{total > 0 ? valueText(total) : nothingYet}</span>
              {burst ? (
                <span
                  className={burst.amount >= 250 ? 'metrics-row__burst metrics-row__burst--big' : 'metrics-row__burst'}
                  style={{ opacity: 1 - burst.fade * 0.7 }}
                >
                  +{burst.amount.toLocaleString('en-US')}
                </span>
              ) : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}
