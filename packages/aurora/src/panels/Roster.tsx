import type { PlayerPublic } from '../data/types'
import type { NameMode } from '../state/nameMode'

/** Same rule as layers/transform.ts's pickName - kept local since this is the only
 * non-map-layer place a name is picked. `account` always shows the username; `character`
 * shows the display name and falls back to the username only when there is none. */
function pickName(mode: NameMode, displayName: string | null, username: string): string {
  return mode === 'account' ? username : displayName || username
}

/** Text list of who is online. Also the accessible alternative to the map markers. Sorted
 * by whichever name is currently shown (T44), so the list reads alphabetically in either
 * mode rather than jumping to a username order while account mode is off. */
export function RosterPanel({ profiles, error, mode }: { profiles: PlayerPublic[]; error: string | null; mode: NameMode }) {
  const online = profiles
    .filter((p) => p.online)
    .map((p) => ({ p, name: pickName(mode, p.display_name, p.username) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return (
    <section className="panel" aria-labelledby="roster-h">
      <h2 id="roster-h">Online now <span className="count">({online.length})</span></h2>
      {error ? <p className="note error">{error}</p> : null}
      {!error && online.length === 0 ? <p className="note">Nobody is online.</p> : null}
      <ul className="roster">
        {online.map(({ p, name }) => (
          <li key={`${p.server_id}/${p.username}`}>
            <span className="name">{name}</span>
            {p.hours_survived != null ? <span className="meta">{Math.floor(p.hours_survived)} h survived</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
