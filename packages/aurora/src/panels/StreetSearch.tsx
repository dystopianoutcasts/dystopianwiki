import { useMemo, useState } from 'react'
import type { StreetFeature } from '../layers/transform'

const MAX_RESULTS = 8

/** Case-insensitive substring match, one result per distinct name (a highway can be 15 segments). */
export function matchStreets(streets: StreetFeature[], query: string): StreetFeature[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const seen = new Set<string>()
  const out: StreetFeature[] = []
  for (const s of streets) {
    if (out.length >= MAX_RESULTS) break
    if (seen.has(s.name) || !s.name.toLowerCase().includes(q)) continue
    seen.add(s.name)
    out.push(s)
  }
  return out
}

export function StreetSearch({ streets, onSelect }: {
  streets: StreetFeature[]
  onSelect: (s: StreetFeature) => void
}) {
  const [query, setQuery] = useState('')
  const matches = useMemo(() => matchStreets(streets, query), [streets, query])

  return (
    <div className="panel street-search">
      <label htmlFor="street-search-input">Find a street</label>
      <input
        id="street-search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Main St"
        autoComplete="off"
      />
      {query.trim() ? (
        <ul className="street-results" aria-live="polite">
          {matches.length === 0 ? (
            <li className="note">No match.</li>
          ) : (
            matches.map((s) => (
              <li key={s.key}>
                <button type="button" onClick={() => onSelect(s)}>{s.name}</button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
