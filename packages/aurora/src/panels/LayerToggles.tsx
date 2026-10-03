import { TOGGLE_KEYS } from '../state/layerPrefs'
import type { LayerKey, LayerPrefs, ToggleKey } from '../state/layerPrefs'

/** The toggle names, shared with the map key (T67) so both read the same. */
export const LAYER_LABELS: Record<ToggleKey, string> = {
  mapKey: 'Map key',
  streets: 'Streets',
  worldMap: 'World map',
  areas: 'Areas',
  players: 'Players',
  vehicles: 'Vehicles',
  safehouses: 'Safehouses',
  npcGroups: 'NPC groups',
  npcOutposts: 'NPC outposts',
  deaths: 'Deaths',
  zones: 'Zones',
  zombieHeat: 'Zombies now',
  zombieDensity: 'Zombie density (spawn)',
  mapObjects: 'Map objects',
}

/** The checkbox's id, so the map key's close button can hand focus back to it (T68). */
export const toggleInputId = (key: ToggleKey): string => `layer-toggle-${key}`

export function LayerToggles({ prefs, onChange, notes }: {
  prefs: LayerPrefs
  onChange: (key: ToggleKey, on: boolean) => void
  /** Per-layer status shown under the checkbox, e.g. "Sign in to see vehicles". */
  notes: Partial<Record<LayerKey, string>>
}) {
  return (
    <fieldset className="panel layers">
      <legend>Map layers</legend>
      {TOGGLE_KEYS.map((key) => (
        <div key={key} className="layer-row">
          <label>
            <input id={toggleInputId(key)} type="checkbox" checked={prefs[key]} onChange={(e) => onChange(key, e.target.checked)} />
            {LAYER_LABELS[key]}
          </label>
          {key !== 'mapKey' && prefs[key] && notes[key] ? <span className="note">{notes[key]}</span> : null}
        </div>
      ))}
    </fieldset>
  )
}
