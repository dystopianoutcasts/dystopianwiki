/**
 * The longest-alive board. Each bar is a character's days survived; when a life ends the bar
 * shakes, breaks into pieces that fall and fade, dust puffs up and a red "DIED after N days"
 * tag shows, then the player starts over from zero. A thin line marks their best life so far.
 * The crumble is CSS (metrics.css); with reduced motion the pieces are not drawn.
 */
import { crumbleSteps, formatDaysSurvived, type Life, type LifeState } from '../../lib/metricsRaces'
import { RACE_COLORS } from './BarRaceBoard'

export interface LivedRow {
  username: string
  displayName: string
  lives: Life[]
  state: LifeState
}

const PIECES = 14
const KINDS = ['a', 'b', 'c', 'd']

export function LivedRaceBoard({
  rows,
  hour,
  msPerStep,
  ariaLabel,
  big,
}: {
  rows: readonly LivedRow[]
  /** The race's time, in hours since the season start. */
  hour: number
  msPerStep: number
  ariaLabel: string
  /** A life of 10 days or more has just ended: the board's edge pulses red. */
  big: boolean
}) {
  const scale = Math.max(1, ...rows.map((r) => r.state.best))
  const order = rows.map((_, i) => i).sort((a, b) => rows[b].state.current - rows[a].state.current || a - b)
  const place = new Map(order.map((rowIndex, k) => [rowIndex, k]))
  const windowSteps = crumbleSteps(msPerStep)
  return (
    <div
      className={big ? 'metrics-board metrics-board--big-death' : 'metrics-board'}
      role="img"
      aria-label={ariaLabel}
      style={{ ['--rows' as string]: rows.length }}
    >
      {rows.map((row, i) => {
        const s = row.state
        const rank = place.get(i) ?? i
        const died = s.lastDeath && s.lastDeath.endHour !== null ? s.lastDeath : null
        const crumbling = !!(died && hour > 0 && hour >= (died.endHour as number) && hour - (died.endHour as number) < windowSteps)
        return (
          <div
            key={row.username}
            className="metrics-row"
            style={{
              ['--rank' as string]: rank,
              ['--fraction' as string]: s.current / scale,
              ['--best' as string]: s.best / scale,
              ['--dead-fraction' as string]: crumbling && died ? Math.max(0.015, died.days / scale) : 0,
              ['--color' as string]: RACE_COLORS[i % RACE_COLORS.length],
            }}
          >
            <span className="metrics-row__place">{s.alive ? rank + 1 : '-'}</span>
            <span className="metrics-row__name">{row.displayName}</span>
            <span className="metrics-row__track">
              {s.best > 0 ? <span className="metrics-row__best" title={`Best life so far: ${formatDaysSurvived(s.best)}`} /> : null}
              <span className="metrics-row__bar" />
              <span className="metrics-row__value">{s.alive ? formatDaysSurvived(s.current) : 'dead'}</span>
              {crumbling && died ? (
                <>
                  <span className="metrics-wreck" aria-hidden="true">
                    <span className="metrics-wreck__shake">
                      {Array.from({ length: PIECES }, (_, j) => (
                        <span
                          key={j}
                          className={`metrics-wreck__piece metrics-wreck__piece--${KINDS[j % 4]}`}
                          style={{
                            left: `${((j / PIECES) * 100).toFixed(2)}%`,
                            top: j % 2 === 0 ? 0 : 14,
                            width: `${(100 / PIECES + (j % 3 === 0 ? 2 : 0)).toFixed(2)}%`,
                            animationDelay: `${j * 45}ms`,
                          }}
                        />
                      ))}
                    </span>
                    <span className="metrics-wreck__dust" />
                  </span>
                  <span className="metrics-row__died">DIED after {formatDaysSurvived(died.days)}</span>
                </>
              ) : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}
