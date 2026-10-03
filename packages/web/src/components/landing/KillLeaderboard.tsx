import { useId } from 'react';
import { useKillLeaderboard } from '../../hooks/useKillLeaderboard';
import {
  boardTitle,
  EMPTY_LINE,
  footerLine,
  formatKills,
  LEAD_LINE,
  leaderboardRows,
  livesText,
  UNAVAILABLE_LINE,
} from '../../lib/killLeaderboard';
import '../../styles/components/home-sections.css';
import '../../styles/components/kill-leaderboard.css';

// "Season <n> kill leaderboard": zombies killed per player (T57's kill_leaderboard()).
// Before the function exists the section shows the empty state and a quiet line.

export function KillLeaderboard() {
  const { data, unavailable } = useKillLeaderboard();
  const titleId = useId();
  const rows = leaderboardRows(data);
  const footer = footerLine(data);

  return (
    <section className="home-section" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          {boardTitle(data?.worldSeq)}
        </h2>
        <p className="home-section__lead">{LEAD_LINE}</p>
        {rows.length > 0 ? (
          <ol className="kill-board">
            {rows.map((r) => (
              <li key={r.key} className="kill-row">
                <span className="kill-row__rank">{r.rank}</span>
                <span className="kill-row__name">{r.name}</span>
                <span className="kill-row__kills">{formatKills(r.kills)}</span>
                <span className="kill-row__meta">
                  <span>best life {formatKills(r.bestLife)}</span>
                  <span>{livesText(r.lives)}</span>
                  <span>{r.status === 'alive' ? 'still alive' : 'ended'}</span>
                  {r.online && <span className="kill-row__online">online</span>}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="home-section__empty">{EMPTY_LINE}</p>
        )}
        {footer !== '' && rows.length > 0 && <p className="home-section__note">{footer}</p>}
        {unavailable && <p className="home-section__note">{UNAVAILABLE_LINE}</p>}
      </div>
    </section>
  );
}
