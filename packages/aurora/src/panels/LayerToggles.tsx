import { LAYER_KEYS } from '../state/layerPrefs'
import type { LayerKey, LayerPrefs } from '../state/layerPrefs'

const LABELS: Record<LayerKey, string> = {
  streets: 'Streets',
  players: 'Players',
  vehicles: 'Vehicles',
  safehouses: 'Safehouses',
  zones: 'Zones',
  zombieHeat: 'Zombie heat',
  mapObjects: 'Map objects',
}

export function LayerToggles({ prefs, onChange, notes }: {
  prefs: LayerPrefs
  onChange: (key: LayerKey, on: boolean) => void
  /** Per-layer status shown under the checkbox, e.g. "Sign in to see vehicles". */
  notes: Partial<Record<LayerKey, string>>
}) {
  return (
    <fieldset className="panel layers">
      <legend>Map layers</legend>
      {LAYER_KEYS.map((key) => (
        <div key={key} className="layer-row">
          <label>
            <input type="checkbox" checked={prefs[key]} onChange={(e) => onChange(key, e.target.checked)} />
            {LABELS[key]}
          </label>
          {prefs[key] && notes[key] ? <span className="note">{notes[key]}</span> : null}
        </div>
      ))}
    </fieldset>
  )
}
