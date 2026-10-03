// T68: the map key as a layer toggle and an overlay on the map, with collapsible sections.
// The hook-free panels (LayerToggles, MapKeyView) are rendered to markup by the small static
// renderer below: react-dom/server cannot run here (the monorepo root's react-dom resolves the
// root's React 19 while this package uses React 18). MapView.tsx cannot be imported either
// (Leaflet touches `window` at load), so its wiring and MapKey's state are asserted on as
// source text, as pages/mapChrome.test.ts does.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createElement, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYERS, TOGGLE_KEYS, loadLayerPrefs, saveLayerPrefs } from '../state/layerPrefs'
import type { LayerPrefs } from '../state/layerPrefs'
import { COLLAPSED_STORAGE_KEY, loadCollapsed, saveCollapsed, toggleCollapsed } from '../state/mapKeySections'
import { MAP_KEY_PANE, MAP_KEY_PANE_Z_INDEX, PLAYER_NAMES_PANE, PLAYERS_PANE, PLAYERS_PANE_Z_INDEX, PLAYER_NAMES_PANE_Z_INDEX, NPC_PANE, DEATH_PANE } from '../map/panes'
import { LayerToggles, toggleInputId } from './LayerToggles'
import { MapKeyView } from './MapKey'
import { MAP_KEY } from './mapKeyRows'

function memoryStorage(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial }
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v
    },
  }
}

const ANON = { isAdmin: false, hasLinked: false }

const VOID = new Set(['input', 'br', 'img', 'path', 'circle', 'rect', 'line'])
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

/** Markup for a tree of host elements and hook-free function components, attributes in prop
 * order the way React writes them (className as class, true booleans as ="", handlers left out). */
function toMarkup(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return esc(String(node))
  if (Array.isArray(node)) return node.map(toMarkup).join('')
  if (!isValidElement(node)) throw new Error('unexpected node')
  const props = node.props as Record<string, unknown>
  if (typeof node.type === 'function') return toMarkup((node.type as (p: unknown) => ReactNode)(props))
  if (typeof node.type !== 'string') return toMarkup(props.children as ReactNode)
  let attrs = ''
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children' || k === 'dangerouslySetInnerHTML' || k === 'style' || /^on[A-Z]/.test(k)) continue
    if (v === false && !k.startsWith('aria-')) continue
    if (v === null || v === undefined) continue
    const name = k === 'className' ? 'class' : k === 'viewBox' || k.startsWith('aria-') ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    attrs += ` ${name}="${v === true && !k.startsWith('aria-') ? '' : esc(String(v))}"`
  }
  if (VOID.has(node.type)) return `<${node.type}${attrs}/>`
  const html = props.dangerouslySetInnerHTML as { __html: string } | undefined
  return `<${node.type}${attrs}>${html ? html.__html : toMarkup(props.children as ReactNode)}</${node.type}>`
}
const noop = () => {}

/** The key as the page shows it after a reload: collapsed sections read back from `storage`. */
const renderKey = (prefs: LayerPrefs, storage: ReturnType<typeof memoryStorage> | null = memoryStorage()) =>
  toMarkup(createElement(MapKeyView, { prefs, viewer: ANON, collapsed: loadCollapsed(storage), onToggleSection: noop, onClose: noop }))

const renderToggles = (prefs: LayerPrefs) => toMarkup(createElement(LayerToggles, { prefs, onChange: noop, notes: {} }))

/** The markup of one layer's section: from its heading button to the end of its row list. */
function section(html: string, layer: string): string {
  const start = html.indexOf(`aria-controls="map-key-rows-${layer}"`)
  expect(start).toBeGreaterThan(-1)
  const end = html.indexOf('</ul>', start)
  return html.slice(html.lastIndexOf('<button', start), end)
}

describe('T68: "Map key" is a toggle in the layer list', () => {
  it('is listed with the other layers, first, as a real checkbox', () => {
    expect(TOGGLE_KEYS[0]).toBe('mapKey')
    const html = renderToggles(DEFAULT_LAYERS)
    expect(html).toMatch(new RegExp(`<label><input id="${toggleInputId('mapKey')}" type="checkbox" checked=""/>Map key</label>`))
  })

  it('is on by default, for a first-time visitor and for one whose saved choices predate it', () => {
    expect(DEFAULT_LAYERS.mapKey).toBe(true)
    expect(loadLayerPrefs(memoryStorage()).mapKey).toBe(true)
    const older = memoryStorage({ 'aurora.layers.v1': JSON.stringify({ streets: false }) })
    expect(loadLayerPrefs(older).mapKey).toBe(true)
  })

  it('switched off, it stays off across a reload (the same guarded storage as the layers)', () => {
    const s = memoryStorage()
    saveLayerPrefs({ ...DEFAULT_LAYERS, mapKey: false }, s)
    expect(loadLayerPrefs(s).mapKey).toBe(false)
    expect(loadLayerPrefs(s).players).toBe(DEFAULT_LAYERS.players)
    const throwing = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    expect(loadLayerPrefs(throwing).mapKey).toBe(true)
  })

  it('the unchecked toggle renders unchecked', () => {
    expect(renderToggles({ ...DEFAULT_LAYERS, mapKey: false })).toMatch(/<input id="layer-toggle-mapKey" type="checkbox"\/>Map key/)
  })
})

describe('T68: the key is an overlay that only exists while its toggle is on', () => {
  it('toggle off: nothing is rendered', () => {
    expect(renderKey({ ...DEFAULT_LAYERS, mapKey: false })).toBe('')
  })

  it('toggle on: a region named "Map key" with a close button', () => {
    const html = renderKey(DEFAULT_LAYERS)
    expect(html).toMatch(/^<section class="map-key-overlay" aria-labelledby="map-key-h">/)
    expect(html).toContain('<h2 id="map-key-h" class="map-key-title">Map key</h2>')
    expect(html).toMatch(/<button type="button" class="map-key-close" aria-label="Close map key">/)
  })

  it('every swatch and icon inside is aria-hidden', () => {
    const html = renderKey({ ...DEFAULT_LAYERS, worldMap: true, zombieHeat: true, areas: true })
    const swatches = html.match(/<span class="key-swatch[^"]*"[^>]*>/g) ?? []
    expect(swatches.length).toBeGreaterThan(5)
    for (const s of swatches) expect(s).toContain('aria-hidden="true"')
    // the close button's icon is decorative too: its name is the aria-label
    expect(html).toMatch(/aria-label="Close map key"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"/)
  })

  it('MapPage draws the key on the map, not in the side panel, and its close turns the toggle off', () => {
    const page = readFileSync(fileURLToPath(new URL('../pages/MapPage.tsx', import.meta.url)), 'utf8')
    // T72: the overlay slot holds a fragment, the "Spotted" notice first and the key below it.
    expect(page).toMatch(/overlay=\{\s*<>[\s\S]*<WatchNotice [\s\S]*<MapKey prefs=\{prefs\} viewer=\{\{ isAdmin, hasLinked: own\.size > 0, watching: user !== null && watches\.watching\.size > 0 \}\} onClose=\{closeMapKey\} \/>\s*<\/>\s*\}/)
    expect(page.match(/<MapKey /g)?.length).toBe(1)
    expect(page).toMatch(/const closeMapKey = useCallback\(\(\) => \{\s*setLayer\('mapKey', false\)/)
    const aside = page.slice(page.indexOf('<aside'), page.indexOf('</aside>'))
    expect(aside).not.toContain('MapKey')
  })

  it('MapView portals it into a pane of its own that holds still and keeps the pointer off the map', () => {
    const view = readFileSync(fileURLToPath(new URL('../map/MapView.tsx', import.meta.url)), 'utf8')
    expect(view).toContain('createPortal(props.overlay, overlayHost)')
    expect(view).toContain('map.createPane(MAP_KEY_PANE)')
    expect(view).toContain('L.DomEvent.disableClickPropagation(keyHost)')
    expect(view).toContain('L.DomEvent.disableScrollPropagation(keyHost)')
    expect(view).toMatch(/map\.on\('move [^']*', \(\) => pinOverlayPane\(map, keyPane\)\)/)
    expect(view).toContain('L.DomUtil.setPosition(pane, L.DomUtil.getPosition(mapPane).multiplyBy(-1))')
    expect(view).toContain("map.on('resize', () => fitOverlayHost(map, keyHost))")
    expect(view).toContain('map.zoomControl?.getContainer()')
  })

  it('its pane sits above every marker, tooltip and player pane and below a popup (700)', () => {
    expect(MAP_KEY_PANE_Z_INDEX).toBeGreaterThan(PLAYER_NAMES_PANE_Z_INDEX)
    expect(MAP_KEY_PANE_Z_INDEX).toBeGreaterThan(PLAYERS_PANE_Z_INDEX)
    expect(MAP_KEY_PANE_Z_INDEX).toBeLessThan(700)
    expect(new Set([MAP_KEY_PANE, PLAYERS_PANE, PLAYER_NAMES_PANE, NPC_PANE, DEATH_PANE]).size).toBe(5)
  })
})

describe('T68: key sections collapse, and the choice is remembered', () => {
  it('every section starts expanded, its heading a button with aria-expanded', () => {
    const html = renderKey(DEFAULT_LAYERS)
    for (const layer of ['streets', 'players', 'vehicles', 'safehouses', 'npcGroups', 'npcOutposts', 'deaths']) {
      const sec = section(html, layer)
      expect(sec).toMatch(/^<button type="button" class="map-key-section" aria-expanded="true"/)
      expect(sec).toMatch(new RegExp(`<ul id="map-key-rows-${layer}" class="map-key-rows">`))
    }
    expect(loadCollapsed(memoryStorage()).size).toBe(0)
  })

  it('collapsing a section hides its rows and leaves the others', () => {
    const s = memoryStorage()
    const collapsed = toggleCollapsed(new Set(), 'vehicles', s)
    expect(collapsed.has('vehicles')).toBe(true)
    const html = renderKey(DEFAULT_LAYERS, s)
    const vehicles = section(html, 'vehicles')
    expect(vehicles).toMatch(/aria-expanded="false"/)
    expect(vehicles).toMatch(/<ul id="map-key-rows-vehicles" class="map-key-rows" hidden="">/)
    for (const r of MAP_KEY.vehicles) expect(vehicles).toContain(r.label.replace(/'/g, '&#x27;'))
    expect(section(html, 'players')).toMatch(/aria-expanded="true"/)
    expect(section(html, 'players')).not.toContain('hidden=""')
  })

  it('the collapse is saved and survives a reload; expanding again is saved too', () => {
    const s = memoryStorage()
    let c = toggleCollapsed(new Set(), 'deaths', s)
    expect(JSON.parse(s.data[COLLAPSED_STORAGE_KEY])).toEqual(['deaths'])
    expect([...loadCollapsed(s)]).toEqual(['deaths'])
    c = toggleCollapsed(c, 'deaths', s)
    expect(c.has('deaths')).toBe(false)
    expect(loadCollapsed(s).size).toBe(0)
  })

  it('the heading button flips the section, and MapKey saves that through toggleCollapsed', () => {
    const src = readFileSync(fileURLToPath(new URL('./MapKey.tsx', import.meta.url)), 'utf8')
    expect(src).toContain('onClick={() => onToggleSection(entry.layer)}')
    expect(src).toContain('const [collapsed, setCollapsed] = useState(() => loadCollapsed())')
    expect(src).toContain('const onToggleSection = useCallback((layer: LayerKey) => setCollapsed((c) => toggleCollapsed(c, layer)), [])')
    expect(src).toContain('<MapKeyView prefs={prefs} viewer={viewer} collapsed={collapsed} onToggleSection={onToggleSection} onClose={onClose} />')
  })

  it('storage that is blocked, corrupt or holds junk means everything expanded, and never throws', () => {
    const throwing = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    expect(loadCollapsed(throwing).size).toBe(0)
    expect(() => saveCollapsed(new Set(['players']), throwing)).not.toThrow()
    expect(loadCollapsed(null).size).toBe(0)
    expect(loadCollapsed(memoryStorage({ [COLLAPSED_STORAGE_KEY]: '{not json' })).size).toBe(0)
    expect([...loadCollapsed(memoryStorage({ [COLLAPSED_STORAGE_KEY]: JSON.stringify(['nope', 'zones', 3]) }))]).toEqual(['zones'])
    expect(renderKey(DEFAULT_LAYERS, null)).toContain('aria-expanded="true"')
  })
})
