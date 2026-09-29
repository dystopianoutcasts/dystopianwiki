import { useEffect, useState } from 'react'
import type { FindablePlayer } from '../layers/transform'

/**
 * T38: a native `<select>` listing who is online and on the map right now. A native
 * select is keyboard and screen-reader operable without any extra code, so this file
 * builds no custom dropdown. `players` already carries everything to show (`name`) and
 * everything needed to fly to them (`x`, `y`) - see `layers/transform.ts`
 * `findablePlayers` - so this component never needs to care what `key` is built from
 * (a login id today, a public id after T27); it only ever uses it as an opaque option
 * value and a React key, never as displayed text.
 */
export function FindPlayer({ players, onSelect }: {
  players: FindablePlayer[]
  onSelect: (pos: { x: number; y: number }) => void
}) {
  const [selected, setSelected] = useState('')

  // If the chosen player goes offline (or otherwise drops out of `players`) on the next
  // data refresh, the control resets to "Choose a player" - the map itself does not move.
  useEffect(() => {
    if (selected && !players.some((p) => p.key === selected)) setSelected('')
  }, [players, selected])

  const empty = players.length === 0

  return (
    <div className="panel find-player">
      <label htmlFor="find-player-select">Find a player</label>
      <select
        id="find-player-select"
        value={selected}
        disabled={empty}
        onChange={(e) => {
          const key = e.target.value
          setSelected(key)
          const player = players.find((p) => p.key === key)
          if (player) onSelect({ x: player.x, y: player.y })
        }}
      >
        <option value="">Choose a player</option>
        {players.map((p) => (
          <option key={p.key} value={p.key}>{p.name}</option>
        ))}
      </select>
      {empty ? <p className="note">Nobody is on the map right now.</p> : null}
    </div>
  )
}
