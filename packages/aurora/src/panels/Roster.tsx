import type { PlayerPublic } from '../data/types'

/** Text list of who is online. Also the accessible alternative to the map markers. */
export function RosterPanel({ profiles, error }: { profiles: PlayerPublic[]; error: string | null }) {
  const online = profiles.filter((p) => p.online).sort((a, b) => a.username.localeCompare(b.username))
  return (
    <section className="panel" aria-labelledby="roster-h">
      <h2 id="roster-h">Online now <span className="count">({online.length})</span></h2>
      {error ? <p className="note error">{error}</p> : null}
      {!error && online.length === 0 ? <p className="note">Nobody is online.</p> : null}
      <ul className="roster">
        {online.map((p) => (
          <li key={`${p.server_id}/${p.username}`}>
            <span className="name">{p.display_name || p.username}</span>
            {p.hours_survived != null ? <span className="meta">{Math.floor(p.hours_survived)} h survived</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
