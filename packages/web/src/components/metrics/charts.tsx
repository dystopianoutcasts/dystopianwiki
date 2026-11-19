/**
 * Small still charts for the Outcast Metrics page: bars, lines and a heatmap, in the home
 * page's SVG style (components/landing/ActivitySection.tsx). Every chart sits in a ChartCard
 * that gives it a heading, a one-line written summary, an optional note, and, when there is
 * nothing to draw, a plain sentence saying why and when it will fill. Nothing here animates.
 */
import { useId, type ReactNode } from 'react'
import { hourName, WEEKDAY_NAMES } from '../../lib/metrics'

export function ChartCard({
  title,
  summary,
  note,
  empty,
  children,
  className,
}: {
  title: string
  /** One line stating the data, e.g. "312 hours played in the last 30 days". */
  summary: string
  /** A smaller line under the chart, e.g. where tracking starts. */
  note?: string | null
  /** The sentence to show instead of the chart; null when there is data. */
  empty: string | null
  children: ReactNode
  className?: string
}) {
  const titleId = useId()
  return (
    <section className={`metrics-card ${className ?? ''}`.trim()} aria-labelledby={titleId}>
      <h3 className="metrics-card__title" id={titleId}>
        {title}
      </h3>
      <p className="metrics-card__summary">{empty ? 'No data to show yet.' : summary}</p>
      {empty ? <p className="metrics-card__empty">{empty}</p> : children}
      {note && !empty ? <p className="metrics-card__note">{note}</p> : null}
    </section>
  )
}

const W = 600
const H = 160

function niceMax(values: readonly (number | null)[]): number {
  const m = Math.max(0, ...values.map((v) => v ?? 0))
  return m <= 0 ? 1 : m
}

export function SvgBars({
  values,
  labelFor,
  ariaLabel,
  startLabel,
  endLabel,
  middleLabel,
  highlight,
  unit,
  barClass = 'metrics-bar',
}: {
  values: readonly (number | null)[]
  labelFor: (index: number) => string
  ariaLabel: string
  startLabel: string
  endLabel: string
  middleLabel?: string
  /** An index drawn in the highlight color (the race's day or hour). */
  highlight?: number
  /** "kills", "hours": the tooltip reads "<label>: <value> <unit>". */
  unit: string
  barClass?: string
}) {
  const max = niceMax(values)
  const slot = W / Math.max(1, values.length)
  const width = Math.max(1, slot * 0.78)
  return (
    <div className="metrics-plot">
      <span className="metrics-plot__axis metrics-plot__axis--top" aria-hidden="true">
        {Math.round(max).toLocaleString('en-US')}
      </span>
      <span className="metrics-plot__axis metrics-plot__axis--bottom" aria-hidden="true">
        0
      </span>
      <svg className="metrics-plot__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
        <line x1="0" y1="0.5" x2={W} y2="0.5" className="home-chart__grid" />
        <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} className="home-chart__baseline" />
        {values.map((v, i) => {
          if (v === null) return null
          const h = v <= 0 ? 1 : Math.max(2, (v / max) * (H - 4))
          const cls = i === highlight ? `${barClass} metrics-bar--highlight` : v <= 0 ? `${barClass} metrics-bar--zero` : barClass
          return (
            <rect key={i} x={i * slot + (slot - width) / 2} y={H - h} width={width} height={h} className={cls} rx="1">
              <title>{`${labelFor(i)}: ${v.toLocaleString('en-US')} ${unit}`}</title>
            </rect>
          )
        })}
      </svg>
      <div className="metrics-plot__ends" aria-hidden="true">
        <span>{startLabel}</span>
        {middleLabel ? <span>{middleLabel}</span> : null}
        <span>{endLabel}</span>
      </div>
    </div>
  )
}

export interface LineSeries {
  name: string
  className: string
  values: readonly (number | null)[]
}

export function SvgLines({
  series,
  ariaLabel,
  startLabel,
  endLabel,
  labelFor,
  unit,
}: {
  series: readonly LineSeries[]
  ariaLabel: string
  startLabel: string
  endLabel: string
  labelFor: (index: number) => string
  unit: string
}) {
  const length = Math.max(1, ...series.map((s) => s.values.length))
  const max = niceMax(series.flatMap((s) => s.values))
  const x = (i: number) => (length <= 1 ? W / 2 : (i / (length - 1)) * W)
  const y = (v: number) => 6 + (1 - v / max) * (H - 12)
  return (
    <div className="metrics-plot">
      <span className="metrics-plot__axis metrics-plot__axis--top" aria-hidden="true">
        {Math.round(max * 10) / 10}
      </span>
      <span className="metrics-plot__axis metrics-plot__axis--bottom" aria-hidden="true">
        0
      </span>
      <svg className="metrics-plot__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
        <line x1="0" y1="0.5" x2={W} y2="0.5" className="home-chart__grid" />
        <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} className="home-chart__baseline" />
        {series.map((s) => {
          // One polyline per unbroken run, so a gap in the data is a gap in the line.
          const runs: { i: number; v: number }[][] = []
          let run: { i: number; v: number }[] = []
          s.values.forEach((v, i) => {
            if (v === null) {
              if (run.length) runs.push(run)
              run = []
            } else run.push({ i, v })
          })
          if (run.length) runs.push(run)
          return (
            <g key={s.name} className={s.className}>
              {runs.map((r, k) =>
                r.length === 1 ? (
                  <circle key={k} cx={x(r[0].i)} cy={y(r[0].v)} r="3" className="metrics-line__dot">
                    <title>{`${labelFor(r[0].i)}: ${r[0].v} ${unit} (${s.name})`}</title>
                  </circle>
                ) : (
                  <polyline
                    key={k}
                    points={r.map((p) => `${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')}
                    className="metrics-line__path"
                    vectorEffect="non-scaling-stroke"
                  />
                ),
              )}
            </g>
          )
        })}
      </svg>
      <div className="metrics-plot__ends" aria-hidden="true">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
      <ul className="metrics-legend">
        {series.map((s) => (
          <li key={s.name} className="metrics-legend__item">
            <svg className={`metrics-legend__swatch ${s.className}`} viewBox="0 0 24 8" aria-hidden="true">
              <line x1="0" y1="4" x2="24" y2="4" className="metrics-line__path" />
            </svg>
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Weekday rows by hour columns; the strongest color is the busiest slot. */
export function Heatmap({ grid, zone, ariaLabel }: { grid: readonly (readonly (number | null)[])[]; zone: string; ariaLabel: string }) {
  const max = niceMax(grid.flat())
  return (
    <div className="metrics-heat">
      <div className="metrics-heat__grid" role="img" aria-label={ariaLabel}>
        <div className="metrics-heat__row" aria-hidden="true">
          <span className="metrics-heat__day" />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="metrics-heat__hour">
              {h % 6 === 0 ? hourName(h).replace(' ', '') : ''}
            </span>
          ))}
        </div>
        {grid.map((row, d) => (
          <div key={d} className="metrics-heat__row">
            <span className="metrics-heat__day" aria-hidden="true">
              {WEEKDAY_NAMES[d].slice(0, 3)}
            </span>
            {row.map((v, h) => {
              const level = v === null || v <= 0 ? 0 : Math.max(1, Math.ceil((v / max) * 4))
              return (
                <span
                  key={h}
                  className={`metrics-heat__cell metrics-heat__cell--${level}`}
                  title={`${WEEKDAY_NAMES[d]} ${hourName(h)}: ${v === null ? 'no data' : `${v} players on average`}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <p className="metrics-card__note">
        Times are in your time zone ({zone}). Darker means more players on average; the scale tops out at {Math.round(max * 10) / 10}.
      </p>
    </div>
  )
}
