import { useId, useMemo } from 'react';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { busiestHours, formatDuration, formatHour, TBD, type HourlyPoint } from '../../lib/homeSummary';

// "When people play": the most players online in each hour of the last 7 days, from
// aurora.home_summary() (027), with the busiest stretch in the viewer's own time
// zone. One series, so no legend; the heading names it. Each bar has a hover
// tooltip, and the same figures are in a table under "Show the numbers".

const HOURS = 7 * 24;
const BAR = 5; // px per hour in the viewBox, 1 px of it is the gap
const HEIGHT = 140;

interface Slot {
  start: Date;
  peak: number | null;
}

function slots(hourly: HourlyPoint[], now: Date): Slot[] {
  const byHour = new Map(hourly.map((p) => [Math.floor(p.hour.getTime() / 3600000), p.peak]));
  const last = Math.floor(now.getTime() / 3600000);
  const out: Slot[] = [];
  for (let h = last - HOURS + 1; h <= last; h++) {
    out.push({ start: new Date(h * 3600000), peak: byHour.has(h) ? (byHour.get(h) as number) : null });
  }
  return out;
}

const DAY = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const DAY_LONG = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <li className={value === TBD ? 'home-tile home-tile--tbd' : 'home-tile'}>
      <span className="home-tile__value">{value}</span>
      <span className="home-tile__label">{label}</span>
    </li>
  );
}

export function ActivitySection() {
  const { summary } = useHomeSummary();
  const titleId = useId();
  const now = useMemo(() => new Date(), [summary]);
  const data = useMemo(() => slots(summary?.hourly ?? [], now), [summary, now]);
  const max = Math.max(1, ...data.map((s) => s.peak ?? 0));
  const busy = summary ? busiestHours(summary.hourly) : null;
  const hasData = data.some((s) => s.peak !== null);

  // Day labels sit under the first hour of each local day that is in range. The
  // partial first day is labelled only when at least half of it is shown, so its
  // label never crowds the next one.
  const days = data
    .map((s, i) => ({ i, s }))
    .filter(({ s, i }) => (i === 0 ? s.start.getHours() <= 12 : s.start.getHours() === 0));

  // Table: one row per local day, with that day's busiest hour.
  const table = useMemo(() => {
    const rows = new Map<string, { label: string; peak: number }>();
    for (const s of data) {
      if (s.peak === null) continue;
      const key = s.start.toDateString();
      const row = rows.get(key) ?? { label: DAY_LONG.format(s.start), peak: 0 };
      row.peak = Math.max(row.peak, s.peak);
      rows.set(key, row);
    }
    return [...rows.values()];
  }, [data]);

  return (
    <section className="home-section home-section--alt" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          When people play
        </h2>
        <p className="home-section__lead">
          {busy
            ? `Busiest around ${formatHour(busy.start)} to ${formatHour(busy.start + 3)} your time.`
            : 'The busiest hours show here once the server has reported a few days of play.'}
        </p>

        <ul className="home-tiles">
          <Tile value={summary ? String(summary.survivors7d) : TBD} label="survivors this week" />
          <Tile value={summary?.peak7d != null ? String(summary.peak7d) : TBD} label="most online at once this week" />
          <Tile value={summary ? String(summary.survivorsTotal) : TBD} label="survivors since the map began" />
          <Tile
            value={summary?.upSince ? formatDuration(now.getTime() - summary.upSince.getTime()) : TBD}
            label="since the last restart"
          />
          <Tile value={TBD} label="BattleMetrics rank" />
        </ul>

        {hasData ? (
          <figure className="home-chart">
            <figcaption className="home-chart__caption">
              Most survivors online in each hour, last 7 days (peak {max})
            </figcaption>
            <div className="home-chart__plot">
              <span className="home-chart__axis home-chart__axis--top" aria-hidden="true">{max}</span>
              <span className="home-chart__axis home-chart__axis--bottom" aria-hidden="true">0</span>
              <svg
                className="home-chart__svg"
                viewBox={`0 0 ${HOURS * BAR} ${HEIGHT}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`Bar chart of the most survivors online per hour over the last 7 days. Highest: ${max}. The numbers are in the table below.`}
              >
                <line x1="0" y1={HEIGHT - 0.5} x2={HOURS * BAR} y2={HEIGHT - 0.5} className="home-chart__baseline" />
                <line x1="0" y1="0.5" x2={HOURS * BAR} y2="0.5" className="home-chart__grid" />
                {data.map((s, i) => {
                  if (s.peak === null) return null;
                  const h = s.peak === 0 ? 1 : Math.max(2, (s.peak / max) * (HEIGHT - 4));
                  return (
                    <rect
                      key={i}
                      x={i * BAR}
                      y={HEIGHT - h}
                      width={BAR - 1}
                      height={h}
                      className={s.peak === 0 ? 'home-chart__bar home-chart__bar--zero' : 'home-chart__bar'}
                    >
                      <title>{`${DAY.format(s.start)} ${formatHour(s.start.getHours())}: ${s.peak} online`}</title>
                    </rect>
                  );
                })}
              </svg>
            </div>
            <div className="home-chart__days" aria-hidden="true">
              {days.map(({ i, s }) => (
                <span key={i} style={{ left: `${(i / HOURS) * 100}%` }}>
                  {DAY.format(s.start)}
                </span>
              ))}
            </div>
            <details className="home-chart__table">
              <summary>Show the numbers</summary>
              <table>
                <caption className="sr-only">Most survivors online on each day of the last week</caption>
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Most online at once</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td>{r.peak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </figure>
        ) : (
          <p className="home-section__empty">Player history: {TBD}. It appears here once the server has reported in.</p>
        )}
      </div>
    </section>
  );
}
