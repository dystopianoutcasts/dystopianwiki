import { shownName, type NameMode } from '../../lib/nameMode';
import type { MapDot, NoDotReason, OnlinePlayer } from '../../lib/serverNowDots';

// "Who is on now" under the home page counters (ServerNow.tsx): the heading, the
// Survivor name / Username switch beside it (T62), and every online player (T77): a
// button that centres the map when they have a dot, plain text with the reason when
// they do not (dead, or no visible position). The heading carries the count. No hooks, so it renders in a test; ServerNow owns the mode
// and saves it (lib/nameMode.ts, the same localStorage key as the live map).
//
// The switch is a radio pair in a fieldset, the same pattern as the map's
// NameModeToggle. Labels are the owner's words ("Survivor name", "Username"); the
// map says "Character names" and "Account usernames".

const MODES: { mode: NameMode; label: string }[] = [
  { mode: 'character', label: 'Survivor name' },
  { mode: 'account', label: 'Username' },
];

export function NameModeSwitch({ mode, onChange }: { mode: NameMode; onChange: (mode: NameMode) => void }) {
  return (
    <fieldset className="home-namemode">
      <legend className="sr-only">Show names as</legend>
      {MODES.map((m) => (
        <label key={m.mode} className="home-namemode__option">
          <input
            type="radio"
            className="home-namemode__input"
            name="home-name-mode"
            value={m.mode}
            checked={mode === m.mode}
            onChange={() => onChange(m.mode)}
          />
          <span className="home-namemode__text">{m.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** Secondary text for a listed player who has no dot (T77). Words, not a colour. */
export const NO_DOT_TEXT: Record<NoDotReason, string> = {
  dead: '(between characters)',
  'no-position': '(no map position)',
};

/** The list in reading order: by the name being shown, so it reads alphabetically in
 * either mode (the map's "Online now" roster sorts the same way). */
export function sortOnline(players: OnlinePlayer[], mode: NameMode): { player: OnlinePlayer; name: string }[] {
  return players
    .map((player) => ({ player, name: shownName(player, mode) }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.player.username.localeCompare(b.player.username));
}

export function WhoIsOnNow({
  players,
  mode,
  onModeChange,
  onShow,
  emptyText,
}: {
  /** Every online player (buildOnlineList), so the count matches the counter. */
  players: OnlinePlayer[];
  mode: NameMode;
  onModeChange: (mode: NameMode) => void;
  onShow: (dot: MapDot) => void;
  emptyText: string;
}) {
  const rows = sortOnline(players, mode);
  return (
    <>
      <div className="home-onnow__head">
        <h3 className="home-onnow__title">Who is on now ({rows.length})</h3>
        <NameModeSwitch mode={mode} onChange={onModeChange} />
      </div>
      {rows.length > 0 ? (
        <ul className="home-onnow__list">
          {rows.map(({ player, name }) => {
            const dot = player.dot;
            return (
              <li key={player.id} className="home-onnow__item">
                {dot ? (
                  <button
                    type="button"
                    className="home-onnow__name"
                    aria-label={`Show ${name} on the map`}
                    onClick={() => onShow(dot)}
                  >
                    {name}
                  </button>
                ) : (
                  <span className="home-onnow__plain">
                    {name} <span className="home-onnow__note">{NO_DOT_TEXT[player.noDot ?? 'no-position']}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-onnow__empty">{emptyText}</p>
      )}
    </>
  );
}
