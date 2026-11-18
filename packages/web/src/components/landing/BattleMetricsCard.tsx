import { useId } from 'react';
import type { BattleMetricsSummary } from '../../lib/battlemetrics';
import { BATTLEMETRICS_SERVER_URL, formatRank, rankChange } from '../../lib/battlemetrics';

// Our own BattleMetrics card (owner 2026-11-18), in place of BattleMetrics' embedded
// banner, whose graphs overlapped and which scrolled inside its box. The rank and its
// last 7 days come from aurora.battlemetrics_summary() (migration 051), which the
// database refreshes hourly from the BattleMetrics API. Players and the player graph
// are already above, from our own server data, so this card is about the rank.

const W = 600;
const H = 150;

const WHEN = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric' });

function ago(t: Date, now: Date): string {
  const min = Math.max(0, Math.round((now.getTime() - t.getTime()) / 60000));
  if (min < 2) return 'just now';
  if (min < 90) return `${min} minutes ago`;
  return `${Math.round(min / 60)} hours ago`;
}

function RankChart({ summary }: { summary: BattleMetricsSummary }) {
  const pts = summary.history;
  const best = Math.min(...pts.map((p) => p.rank));
  const worst = Math.max(...pts.map((p) => p.rank));
  const span = Math.max(1, worst - best);
  const t0 = pts[0].t.getTime();
  const t1 = Math.max(t0 + 1, pts[pts.length - 1].t.getTime());
  // A better (smaller) rank sits higher; 6 px of room above and below the line.
  const xy = pts.map((p) => {
    const x = ((p.t.getTime() - t0) / (t1 - t0)) * W;
    const y = 6 + ((p.rank - best) / span) * (H - 12);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = pts[0];
  const last = pts[pts.length - 1];
  return (
    <figure className="home-bm__chart">
      <figcaption className="home-chart__caption">Rank over the last 7 days (higher on the chart is better)</figcaption>
      <div className="home-bm__plot">
        <span className="home-bm__axis home-bm__axis--top" aria-hidden="true">{formatRank(best)}</span>
        <span className="home-bm__axis home-bm__axis--bottom" aria-hidden="true">{formatRank(worst)}</span>
        <svg
          className="home-bm__svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Line chart of the server's BattleMetrics rank over the last 7 days: ${formatRank(first.rank)} on ${WHEN.format(first.t)}, ${formatRank(last.rank)} on ${WHEN.format(last.t)}, best ${formatRank(best)}.`}
        >
          <line x1="0" y1="0.5" x2={W} y2="0.5" className="home-chart__grid" />
          <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} className="home-chart__baseline" />
          {pts.length === 1 ? (
            <circle cx={W} cy={H / 2} r="4" className="home-bm__dot" />
          ) : (
            <polyline points={xy.join(' ')} className="home-bm__line" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </div>
      <div className="home-bm__ends" aria-hidden="true">
        <span>{WHEN.format(first.t)}</span>
        <span>now</span>
      </div>
    </figure>
  );
}

export function BattleMetricsCard({ summary }: { summary: BattleMetricsSummary | null }) {
  const titleId = useId();
  const now = new Date();
  const rank = formatRank(summary?.rank);
  const change = summary ? rankChange(summary.rank, summary.rank7dAgo) : null;
  const hasChart = (summary?.history.length ?? 0) > 0;

  return (
    <div className="home-bm" role="group" aria-labelledby={titleId}>
      <div className="home-bm__text">
        <h3 className="home-bm__title" id={titleId}>
          Our BattleMetrics rank
        </h3>
        {rank ? (
          <>
            <p className="home-bm__rank">
              <span className="home-bm__rank-value">{rank}</span>
              <span className="home-bm__rank-label">among Project Zomboid servers</span>
            </p>
            {change && <p className="home-bm__line-text">{change}.</p>}
            {summary?.bestRank7d && summary.rank && summary.bestRank7d < summary.rank && (
              <p className="home-bm__line-text">Best this week: {formatRank(summary.bestRank7d)}.</p>
            )}
            {summary?.fetchedAt && (
              <p className="home-bm__updated">Updated {ago(summary.fetchedAt, now)}, from BattleMetrics.</p>
            )}
          </>
        ) : (
          <p className="home-bm__line-text">
            The rank shows here once BattleMetrics has reported in. It refreshes every hour.
          </p>
        )}
        <a className="home-bm__link" href={BATTLEMETRICS_SERVER_URL} target="_blank" rel="noopener noreferrer">
          Open our server page on BattleMetrics
        </a>
      </div>
      {hasChart && summary ? <RankChart summary={summary} /> : null}
    </div>
  );
}
