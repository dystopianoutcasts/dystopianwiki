import { useId } from 'react';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { formatHoursSurvived, TBD } from '../../lib/homeSummary';

// "Longest survivors": the five living characters with the most in-game hours,
// from aurora.home_summary() (027). Dead characters never appear.

export function SurvivorsBoard() {
  const { summary } = useHomeSummary();
  const titleId = useId();
  const list = summary?.longest ?? [];

  return (
    <section className="home-section" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          Longest survivors
        </h2>
        <p className="home-section__lead">Living characters, by time survived in game.</p>
        {list.length > 0 ? (
          <ol className="home-survivors">
            {list.map((s, i) => (
              <li key={`${s.name}-${i}`} className="home-survivor">
                <span className="home-survivor__rank" aria-hidden="true">{i + 1}</span>
                <span className="home-survivor__name">{s.name}</span>
                <span className="home-survivor__hours">{formatHoursSurvived(s.hours)}</span>
                {s.online && <span className="home-survivor__online">on now</span>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="home-section__empty">
            Survivor times: {TBD}. They appear once the server has reported them.
          </p>
        )}
      </div>
    </section>
  );
}
