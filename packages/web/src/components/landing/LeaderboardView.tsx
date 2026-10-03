import type { KeyboardEvent } from 'react';
import {
  boardTitle,
  EMPTY_LINES,
  LOADING_LINE,
  nextTab,
  sourceLine,
  TAB_HELP,
  TAB_IDS,
  TAB_LABELS,
  tabRows,
  UNAVAILABLE_LINE,
  VALUE_HEADINGS,
  type DisplayRow,
  type Leaderboard,
  type TabId,
} from '../../lib/leaderboard';
import type { NameMode } from '../../lib/nameMode';

// The home page leaderboard as DystopianQoL's in-game window shows it (T66): Kills,
// Deaths and Survival tabs over one table each. No hooks, so it renders in a test;
// Leaderboard.tsx owns the data, the selected tab, focus and the name mode.
//
// Tabs follow the WAI-ARIA tabs pattern: role tablist/tab/tabpanel, aria-selected,
// roving tabindex, Left/Right (wrapping), Home and End. All three panels are in the
// page; the two not selected are `hidden`. Ranks 1-3 get a crown drawn here (never the
// mod's PNGs) whose text alternative is the rank in words ("1st").

export const LEAD_LINE =
  'Ranked as the in-game Leaderboard window ranks them. Names follow the Survivor name / Username switch above.';

export function tabDomId(prefix: string, tab: TabId): string {
  return `${prefix}-tab-${tab}`;
}

export function panelDomId(prefix: string, tab: TabId): string {
  return `${prefix}-panel-${tab}`;
}

function Crown() {
  return (
    <svg className="lb-medal__crown" viewBox="0 0 24 20" width="24" height="20" aria-hidden="true" focusable="false">
      <path d="M2 6l5 4 5-8 5 8 5-4-2 12H4L2 6z" />
    </svg>
  );
}

function RankCell({ row }: { row: DisplayRow }) {
  if (row.medal === null) return <td className="lb-rank">{row.rank}</td>;
  return (
    <td className="lb-rank">
      <span className={`lb-medal lb-medal--${row.medal}`} role="img" aria-label={row.rankText}>
        <Crown />
        <span className="lb-medal__num" aria-hidden="true">
          {row.rank}
        </span>
      </span>
    </td>
  );
}

function Panel({ tab, prefix, selected, rows }: { tab: TabId; prefix: string; selected: boolean; rows: DisplayRow[] }) {
  const helpId = `${prefix}-help-${tab}`;
  return (
    <div
      className="lb-panel"
      role="tabpanel"
      id={panelDomId(prefix, tab)}
      aria-labelledby={tabDomId(prefix, tab)}
      aria-describedby={helpId}
      tabIndex={0}
      hidden={!selected}
    >
      <p className="lb-help" id={helpId}>
        {TAB_HELP[tab]}
      </p>
      {rows.length > 0 ? (
        <table className="lb-table">
          <thead>
            <tr>
              <th scope="col" className="lb-rank">
                Rank
              </th>
              <th scope="col">Name</th>
              <th scope="col" className="lb-value">
                {VALUE_HEADINGS[tab]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <RankCell row={r} />
                <td className="lb-name">{r.name}</td>
                <td className="lb-value">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="home-section__empty">{EMPTY_LINES[tab]}</p>
      )}
    </div>
  );
}

export interface LeaderboardViewProps {
  titleId: string;
  /** Prefix for the tab and panel ids (a useId value in the page). */
  prefix: string;
  data: Leaderboard | null;
  unavailable: boolean;
  /** The first answer has not come back yet: one quiet line, so no tab claims "no kills" early. */
  loading?: boolean;
  mode: NameMode;
  tab: TabId;
  /** A tab was chosen: by click (viaKey false) or by an arrow, Home or End key (true: move focus too). */
  onSelect: (tab: TabId, viaKey: boolean) => void;
  now: Date;
}

export function LeaderboardView({ titleId, prefix, data, unavailable, loading = false, mode, tab, onSelect, now }: LeaderboardViewProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = nextTab(tab, e.key);
    if (next === null) return;
    e.preventDefault();
    onSelect(next, true);
  };
  const footer = sourceLine(data, now);

  return (
    <section className="home-section" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          {boardTitle(data?.worldSeq)}
        </h2>
        <p className="home-section__lead">{LEAD_LINE}</p>
        {unavailable || (loading && data === null) ? (
          <p className="home-section__note" role="status">
            {unavailable ? UNAVAILABLE_LINE : LOADING_LINE}
          </p>
        ) : (
          <div className="lb">
            <div className="lb-tabs" role="tablist" aria-labelledby={titleId} onKeyDown={onKeyDown}>
              {TAB_IDS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  className="lb-tab"
                  id={tabDomId(prefix, t)}
                  aria-selected={t === tab}
                  aria-controls={panelDomId(prefix, t)}
                  tabIndex={t === tab ? 0 : -1}
                  onClick={() => onSelect(t, false)}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
            {TAB_IDS.map((t) => (
              <Panel key={t} tab={t} prefix={prefix} selected={t === tab} rows={tabRows(data, t, mode)} />
            ))}
            {footer !== '' && <p className="home-section__note lb-source">{footer}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
