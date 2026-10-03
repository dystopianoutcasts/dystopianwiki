import { useState } from 'react'
import type { LayerPrefs } from '../state/layerPrefs'
import { LAYER_LABELS } from './LayerToggles'
import { visibleKey } from './mapKeyRows'
import type { KeySwatch, KeyViewer } from './mapKeyRows'

const OPEN_KEY = 'aurora.mapKey.open'

/** Closed by default; whether it was left open is remembered per browser. Storage can be
 * blocked, so every access is guarded and the key works without it. */
function loadOpen(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(OPEN_KEY) === '1'
  } catch {
    return false
  }
}

function saveOpen(open: boolean): void {
  try {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0')
  } catch {
    // blocked or full: the toggle still works for this visit
  }
}

function rampCss(stops: readonly [number, string][]): string {
  return `linear-gradient(to right, ${stops.map(([at, c]) => `${c} ${Math.round(at * 100)}%`).join(', ')})`
}

/** One swatch, drawn from the same marker HTML or path style the layer itself uses.
 * Decorative: the row's text is the label. */
function Swatch({ swatch }: { swatch: KeySwatch }) {
  switch (swatch.kind) {
    case 'marker':
      // The HTML is a fixed string from layers/symbols.ts (no data in it), the same one the
      // map's marker is built from, so the key shows the real marker.
      return <span className="key-swatch" aria-hidden="true" dangerouslySetInnerHTML={{ __html: swatch.html }} />
    case 'area': {
      const s = swatch.style
      return (
        <span className="key-swatch" aria-hidden="true">
          <svg viewBox="0 0 30 20" width="30" height="20" focusable="false">
            <rect x="3" y="3" width="24" height="14" stroke={s.color} strokeWidth={s.weight} strokeDasharray={s.dashArray} fill={s.color} fillOpacity={s.fillOpacity ?? 0.2} />
          </svg>
        </span>
      )
    }
    case 'dot': {
      const s = swatch.style
      return (
        <span className="key-swatch" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="20" height="20" focusable="false">
            <circle cx="10" cy="10" r={s.radius} stroke={s.color} strokeWidth={s.weight} fill={s.color} fillOpacity={s.fillOpacity ?? 0.2} />
          </svg>
        </span>
      )
    }
    case 'line': {
      const s = swatch.style
      return (
        <span className="key-swatch" aria-hidden="true">
          <svg viewBox="0 0 30 20" width="30" height="20" focusable="false">
            <line x1="2" y1="10" x2="28" y2="10" stroke={s.color} strokeWidth={s.weight} strokeOpacity={s.opacity ?? 1} strokeDasharray={s.dashArray} strokeLinecap="round" />
          </svg>
        </span>
      )
    }
    case 'fill':
      return (
        <span className="key-swatch" aria-hidden="true">
          <svg viewBox="0 0 30 20" width="30" height="20" focusable="false">
            <rect x="3" y="3" width="24" height="14" fill={swatch.fillColor} fillOpacity={swatch.fillOpacity} />
          </svg>
        </span>
      )
    case 'ramp':
      return (
        <span className="key-swatch" aria-hidden="true">
          <span className="key-ramp" style={{ backgroundImage: rampCss(swatch.stops), opacity: swatch.opacity }} />
        </span>
      )
    case 'label':
      return (
        <span className="key-swatch is-text" aria-hidden="true">
          <span className={swatch.variant === 'town' ? 'aurora-area-label is-town' : 'aurora-area-label is-landmark'}>
            {swatch.variant === 'town' ? 'Town' : 'Place'}
          </span>
        </span>
      )
  }
}

/**
 * T67: the map key. A collapsible section under the layer toggles, closed by default.
 * Lists only the layers that are switched on (layers that are off are left out, not
 * dimmed), and only the symbols this viewer can see (VISIBILITY.md).
 */
export function MapKey({ prefs, viewer }: { prefs: LayerPrefs; viewer: KeyViewer }) {
  const [open, setOpen] = useState(loadOpen)
  const entries = visibleKey(prefs, viewer)
  const toggle = () => {
    setOpen((o) => {
      saveOpen(!o)
      return !o
    })
  }
  return (
    <section className="panel map-key" aria-labelledby="map-key-h">
      <h2 id="map-key-h" className="map-key-head">
        <button type="button" className="map-key-toggle" aria-expanded={open} aria-controls="map-key-body" onClick={toggle}>
          <span className="map-key-chevron" aria-hidden="true">{open ? '-' : '+'}</span>
          Map key
        </button>
      </h2>
      <div id="map-key-body" hidden={!open}>
        <p className="note">What each symbol means. Only layers that are switched on are listed.</p>
        {entries.length === 0 ? <p className="note">No layers are switched on.</p> : null}
        {entries.map((entry) => (
          <div key={entry.layer} className="map-key-group">
            <h3>{LAYER_LABELS[entry.layer]}</h3>
            <ul className="map-key-rows">
              {entry.rows.map((r) => (
                <li key={r.id} className="map-key-row">
                  <Swatch swatch={r.swatch} />
                  <span className="map-key-label">{r.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
