import type { NameMode } from '../state/nameMode'

/**
 * T44: usernames are intentionally public (owner decision, reversing T27). This is the
 * first panel in the side sheet, above everything it affects (markers, roster, find a
 * player, safehouse owner, an admin's vehicle driver line) and the map itself.
 */
export function NameModeToggle({ mode, onChange }: { mode: NameMode; onChange: (mode: NameMode) => void }) {
  return (
    <fieldset className="panel name-mode">
      <legend>Show names as</legend>
      <label>
        <input
          type="radio"
          name="name-mode"
          value="character"
          checked={mode === 'character'}
          onChange={() => onChange('character')}
        />
        Character names
      </label>
      <label>
        <input
          type="radio"
          name="name-mode"
          value="account"
          checked={mode === 'account'}
          onChange={() => onChange('account')}
        />
        Account usernames
      </label>
    </fieldset>
  )
}
