import { useCallback, useState } from 'react'
import type { LayerKey, LayerPrefs } from '../state/layerPrefs'
import { loadCollapsed, toggleCollapsed } from '../state/mapKeySections'
import { LAYER_LABELS } from './LayerToggles'
import { visibleKey } from './mapKeyRows'
import type { KeySwatch, KeyViewer } from './mapKeyRows'

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
 * T67, T68: the map key. An overlay on the map, top left beside the zoom buttons
 * (map/MapView.tsx places it), shown while the "Map key" toggle in the layer list is on;
 * renders nothing when it is off. The close button switches that toggle off.
 *
 * Lists only the layers that are switched on (layers that are off are left out, not
 * dimmed), and only the symbols this viewer can see (VISIBILITY.md). Each layer is a
 * section whose heading button collapses it; which sections are collapsed is remembered
 * (state/mapKeySections.ts). Every section starts expanded.
 */
export function MapKey({ prefs, viewer, onClose }: { prefs: LayerPrefs; viewer: KeyViewer; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(() => loadCollapsed())
  const onToggleSection = useCallback((layer: LayerKey) => setCollapsed((c) => toggleCollapsed(c, layer)), [])
  return <MapKeyView prefs={prefs} viewer={viewer} collapsed={collapsed} onToggleSection={onToggleSection} onClose={onClose} />
}

/** The key itself, without state (MapKey holds it), so tests can render it directly. */
export function MapKeyView({ prefs, viewer, collapsed, onToggleSection, onClose }: {
  prefs: LayerPrefs
  viewer: KeyViewer
  collapsed: ReadonlySet<LayerKey>
  onToggleSection: (layer: LayerKey) => void
  onClose: () => void
}) {
  if (!prefs.mapKey) return null
  const entries = visibleKey(prefs, viewer)
  return (
    <section className="map-key-overlay" aria-labelledby="map-key-h">
      <div className="map-key-top">
        <h2 id="map-key-h" className="map-key-title">Map key</h2>
        <button type="button" className="map-key-close" aria-label="Close map key" onClick={onClose}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="map-key-body">
        <p className="note">Only layers that are switched on are listed.</p>
        {entries.length === 0 ? <p className="note">No layers are switched on.</p> : null}
        {entries.map((entry) => {
          const shut = collapsed.has(entry.layer)
          const rowsId = `map-key-rows-${entry.layer}`
          return (
            <div key={entry.layer} className="map-key-group">
              <h3 className="map-key-group-head">
                <button type="button" className="map-key-section" aria-expanded={!shut} aria-controls={rowsId} onClick={() => onToggleSection(entry.layer)}>
                  <span className="map-key-chevron" aria-hidden="true">{shut ? '+' : '-'}</span>
                  {LAYER_LABELS[entry.layer]}
                </button>
              </h3>
              <ul id={rowsId} className="map-key-rows" hidden={shut}>
                {entry.rows.map((r) => (
                  <li key={r.id} className="map-key-row">
                    <Swatch swatch={r.swatch} />
                    <span className="map-key-label">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
