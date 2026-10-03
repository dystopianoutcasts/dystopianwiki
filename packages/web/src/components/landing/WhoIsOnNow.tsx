import { shownName, type NameMode } from '../../lib/nameMode';
import type { MapDot } from '../../lib/serverNowDots';

// "Who is on now" under the home page counters (ServerNow.tsx): the heading, the
// Survivor name / Username switch beside it (T62), and one button per player that
// centres the map on them. No hooks, so it renders in a test; ServerNow owns the mode
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

export function WhoIsOnNow({
  dots,
  mode,
  onModeChange,
  onShow,
  emptyText,
}: {
  dots: MapDot[];
  mode: NameMode;
  onModeChange: (mode: NameMode) => void;
  onShow: (dot: MapDot) => void;
  emptyText: string;
}) {
  return (
    <>
      <div className="home-onnow__head">
        <h3 className="home-onnow__title">Who is on now</h3>
        <NameModeSwitch mode={mode} onChange={onModeChange} />
      </div>
      {dots.length > 0 ? (
        <ul className="home-onnow__list">
          {dots.map((dot) => {
            const name = shownName(dot, mode);
            return (
              <li key={dot.id} className="home-onnow__item">
                <button
                  type="button"
                  className="home-onnow__name"
                  aria-label={`Show ${name} on the map`}
                  onClick={() => onShow(dot)}
                >
                  {name}
                </button>
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
