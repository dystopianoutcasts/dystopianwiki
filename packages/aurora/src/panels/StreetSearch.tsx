import { useMemo, useState } from 'react'
import type { StreetFeature } from '../layers/transform'

const MAX_RESULTS = 8

/**
 * Case-insensitive substring match against `label`, which extract-streets.ts (T42) has
 * already made unique across the file - a merged road is one label, and two roads that
 * share a name get two different labels - so this no longer needs to de-duplicate by
 * name itself. Labels that start with the query sort first, then the rest, each group
 * alphabetical, so typing the start of a name puts the likeliest match on top even when
 * a substring match elsewhere in the file would otherwise come first.
 */
export function matchStreets(streets: StreetFeature[], query: string): StreetFeature[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches = streets.filter((s) => s.label.toLowerCase().includes(q))
  matches.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(q)
    const bStarts = b.label.toLowerCase().startsWith(q)
    if (aStarts !== bStarts) return aStarts ? -1 : 1
    return a.label.localeCompare(b.label)
  })
  return matches.slice(0, MAX_RESULTS)
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
                <button type="button" onClick={() => onSelect(s)}>{s.label}</button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
