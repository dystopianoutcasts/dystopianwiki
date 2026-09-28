import { buildSparkline, describeAge, toSparkPoints } from '../layers/transform'
import { isStale, memoryPercent } from '../data/health'
import type { HealthSample } from '../data/types'

const WINDOW_MINUTES = 60
const W = 220
const H = 36

function Spark({ label, unit, samples, pick, now }: {
  label: string
  unit: string
  samples: HealthSample[]
  pick: (s: HealthSample) => number | null
  now: number
}) {
  const s = buildSparkline(toSparkPoints(samples, pick), W, H, now - WINDOW_MINUTES * 60_000, now)
  const summary = s.count === 0
    ? `${label}: no data in the last hour`
    : `${label} over the last hour: low ${round(s.min)}${unit}, high ${round(s.max)}${unit}, ${s.count} samples`
  return (
    <figure className="spark">
      <figcaption>{label}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} preserveAspectRatio="none">
        {s.path ? <path d={s.path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /> : null}
      </svg>
      <span className="spark-range">{s.count === 0 ? 'no data' : `${round(s.min)} to ${round(s.max)}${unit}`}</span>
    </figure>
  )
}

function round(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function HealthPanel({ latest, samples, error, now }: {
  latest: HealthSample | null
  samples: HealthSample[]
  error: string | null
  now: number
}) {
  if (error) return <section className="panel" aria-labelledby="health-h"><h2 id="health-h">Server health</h2><p className="note error">{error}</p></section>
  if (!latest) {
    return (
      <section className="panel" aria-labelledby="health-h">
        <h2 id="health-h">Server health</h2>
        <p className="note">No health data has been reported yet.</p>
      </section>
    )
  }
  const mem = memoryPercent(latest)
  const stale = isStale(latest, now)
  return (
    <section className="panel" aria-labelledby="health-h">
      <h2 id="health-h">Server health</h2>
      <p className={stale ? 'note warn' : 'note'} role="status">
        {stale ? `Server may be offline. Last report ${describeAge(latest.t, now)}.` : `Reported ${describeAge(latest.t, now)}.`}
      </p>
      <dl className="stats">
        <div><dt>Players</dt><dd>{latest.players ?? '-'}</dd></div>
        <div><dt>Tick time</dt><dd>{latest.avg_update_period_ms != null ? `${round(latest.avg_update_period_ms)} ms` : '-'}</dd></div>
        <div><dt>Zombies</dt><dd>{latest.zombies_total ?? '-'}</dd></div>
        <div><dt>Loaded</dt><dd>{latest.zombies_loaded ?? '-'}</dd></div>
        <div><dt>Memory</dt><dd>{mem != null ? `${mem}%` : '-'}</dd></div>
      </dl>
      <Spark label="Tick time (ms)" unit=" ms" samples={samples} pick={(s) => s.avg_update_period_ms} now={now} />
      <Spark label="Players" unit="" samples={samples} pick={(s) => s.players} now={now} />
    </section>
  )
}
