// T72: "Watch for a car". The hook-free views are rendered to markup by the small static renderer
// below (a copy of panels/MapKey.test.ts's: react-dom/server cannot run here). MapView and MapPage
// cannot be imported under node, so their wiring is asserted on as source text.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createElement, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYERS } from '../state/layerPrefs'
import type { LayerKey } from '../state/layerPrefs'
import { buildCatalog, watchingEntries } from '../data/vehicleCatalog'
import { spottedGroups } from '../data/sightings'
import { vehicleKey } from '../data/live'
import { car } from '../data/watchFixtures'
import type { WatchStatus } from '../data/useWatches'
import { WATCHED_CAR_COLOR, watchedVehicleIconHtml } from '../layers/symbols'
import { MAP_KEY, WATCHED_KEY_ROW } from './mapKeyRows'
import { MapKeyView } from './MapKey'
import { DEFAULT_SHOW_WRECKS, WatchCarsView, matchCountText, showButtonText, shownEntries } from './WatchCars'
import type { WatchCarsViewProps } from './WatchCars'
import { WatchNoticeView } from './WatchNotice'
import { WATCHED_PANE_Z_INDEX, PLAYERS_PANE_Z_INDEX, NPC_PANE_Z_INDEX } from '../map/panes'

const VOID = new Set(['input', 'br', 'img', 'path', 'circle', 'rect', 'line'])
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

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
    const name = k === 'className' ? 'class' : k === 'htmlFor' ? 'for' : k === 'viewBox' || k.startsWith('aria-') ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    attrs += ` ${name}="${v === true && !k.startsWith('aria-') ? '' : esc(String(v))}"`
  }
  if (VOID.has(node.type)) return `<${node.type}${attrs}/>`
  const html = props.dangerouslySetInnerHTML as { __html: string } | undefined
  return `<${node.type}${attrs}>${html ? html.__html : toMarkup(props.children as ReactNode)}</${node.type}>`
}
const noop = () => {}

const NAMES = new Map([
  ['Base.CarNormal', 'Chevalier Nyala'],
  ['Base.CarNormalBurnt', 'Wrecked Chevalier Nyala'],
  ['Base.Van', 'Franklin Valuline'],
  ['Base.StepVanSmashed', 'Wrecked Chevalier Step Van'],
])
const CARS = [car('Base.CarNormal'), car('Base.CarNormal'), car('Base.Van', { claimed_by: 'ann' })]
const CATALOG = buildCatalog([], NAMES, CARS)

function view(over: Partial<WatchCarsViewProps> = {}): string {
  const watchedSet = over.watchedSet ?? new Set<string>()
  const props: WatchCarsViewProps = {
    status: 'ready',
    watching: watchingEntries(watchedSet, CATALOG, NAMES, CARS),
    watchedSet,
    shown: shownEntries(CATALOG, over.query ?? '', over.showWrecks ?? DEFAULT_SHOW_WRECKS),
    open: false,
    query: '',
    showWrecks: DEFAULT_SHOW_WRECKS,
    message: null,
    shownAt: {},
    onToggleOpen: noop,
    onQuery: noop,
    onSearchEscape: noop,
    onShowWrecks: noop,
    onCheck: noop,
    onWatchAll: noop,
    onClearAll: noop,
    onShow: noop,
    onRetry: noop,
    ...over,
  }
  return toMarkup(createElement(WatchCarsView, props))
}

describe('T72: the panel, signed out', () => {
  it('shows only the title and the log-in line, with the same link as the account control', () => {
    const html = view({ status: 'signed-out' })
    expect(html).toContain('Watch for a car')
    expect(html).toContain('<a href="/login?next=/map/">Log in</a> to pick cars to watch for.')
    expect(html).not.toContain('<input')
    expect(html).not.toContain('<button')
    expect(html).not.toContain('Watching (')
  })
})

describe('T72: the panel, not switched on yet (038 not applied)', () => {
  it('is one .note line and nothing else to operate', () => {
    const html = view({ status: 'off' as WatchStatus })
    expect(html).toContain('<p class="note">Watching for cars is not switched on yet.</p>')
    expect(html).not.toContain('<input')
    expect(html).not.toContain('<button')
  })

  it('an add/remove failure is a role="alert" message', () => {
    expect(view({ message: 'You can watch up to 100 cars.' })).toContain('<p class="note error" role="alert">You can watch up to 100 cars.</p>')
  })
})

describe('T72: the panel, signed in', () => {
  it('watched cars are real, checked checkboxes with "N on the map" and a Show button', () => {
    const html = view({ watchedSet: new Set(['Base.CarNormal']) })
    expect(html).toContain('Watching (1)')
    expect(html).toMatch(/<input id="watching-Base\.CarNormal" type="checkbox" checked=""\/>/)
    expect(html).toContain('<span class="watch-onmap">2 on the map</span>')
    expect(html).toMatch(/<button type="button" class="watch-small" aria-label="Show: Chevalier Nyala">Show<\/button>/)
  })

  it('Show steps through the matches: "Show 2 of 5" after the first', () => {
    expect(showButtonText(5, undefined)).toBe('Show')
    expect(showButtonText(5, 0)).toBe('Show 2 of 5')
    expect(showButtonText(5, 4)).toBe('Show 1 of 5')
    expect(showButtonText(1, 0)).toBe('Show')
  })

  it('a claimed car is not "on the map" for watching: no Show button for a watched Valuline that is claimed', () => {
    const html = view({ watchedSet: new Set(['Base.Van']) })
    expect(html).toContain('Franklin Valuline')
    expect(html).not.toContain('on the map</span>')
    expect(html).not.toContain('watch-small')
  })

  it('the disclosure button says whether the dropdown is open and what it controls', () => {
    const shut = view()
    expect(shut).toMatch(/<button type="button" class="watch-disclosure" aria-expanded="false" aria-controls="watch-cars-choose">/)
    expect(shut).toMatch(/<div id="watch-cars-choose" class="watch-choose" hidden="">/)
    expect(shut).not.toContain('type="search"')
    const open = view({ open: true, query: 'nyala' })
    expect(open).toMatch(/aria-expanded="true"/)
    expect(open).toMatch(/<label for="watch-cars-search" class="watch-search-label">Search cars<\/label><input id="watch-cars-search" type="search"/)
    expect(open).toMatch(/<p id="watch-cars-count" class="note" aria-live="polite">1 car matches<\/p>/)
  })

  it('wrecks are hidden by default and listed once "Show wrecks" is on', () => {
    expect(DEFAULT_SHOW_WRECKS).toBe(false)
    const hidden = view({ open: true })
    expect(hidden).not.toContain('Wrecked Chevalier Nyala')
    expect(hidden).toContain('Chevalier Nyala')
    const shown = view({ open: true, showWrecks: true })
    expect(shown).toContain('Wrecked Chevalier Nyala')
    expect(shown).toContain('Wrecked Chevalier Step Van')
  })

  it('a watched wreck is still listed under Watching with wrecks hidden', () => {
    const html = view({ watchedSet: new Set(['Base.CarNormalBurnt']) })
    expect(html).toMatch(/<input id="watching-Base\.CarNormalBurnt" type="checkbox" checked=""\/>/)
  })

  it('"Watch all shown" only for a typed query showing 2 to 40 rows; "Clear all" only while watching', () => {
    expect(view({ open: true })).not.toContain('Watch all shown')
    expect(view({ open: true, query: 'chev', showWrecks: true })).toContain('Watch all shown')
    expect(view({ open: true, query: 'valuline' })).not.toContain('Watch all shown')
    expect(view({ open: true })).not.toContain('Clear all')
    expect(view({ open: true, watchedSet: new Set(['Base.Van']) })).toContain('Clear all')
  })

  it('the count reads in words', () => {
    expect(matchCountText(0)).toBe('No cars match')
    expect(matchCountText(1)).toBe('1 car matches')
    expect(matchCountText(12)).toBe('12 cars match')
  })
})

describe('T72: the "Spotted" notice', () => {
  const nyalas = [car('Base.CarNormal'), car('Base.CarNormal'), car('Base.CarNormal')]
  const groups = spottedGroups(nyalas.map(vehicleKey), nyalas, NAMES)

  it('is a polite status region that reads "Spotted: Chevalier Nyala (3)" with Show and Dismiss', () => {
    const html = toMarkup(createElement(WatchNoticeView, { groups, shownAt: undefined, onShow: noop, onDismiss: noop }))
    expect(html).toMatch(/^<div class="watch-notice-live" role="status" aria-live="polite">/)
    expect(html).toContain('Spotted: Chevalier Nyala (3)')
    expect(html).toContain('>Show</button>')
    expect(html).toContain('>Dismiss</button>')
  })

  it('with nothing spotted the region stays mounted and empty', () => {
    expect(toMarkup(createElement(WatchNoticeView, { groups: [], shownAt: undefined, onShow: noop, onDismiss: noop }))).toBe(
      '<div class="watch-notice-live" role="status" aria-live="polite"></div>',
    )
  })
})

describe('T72: the map key row', () => {
  const ANON = { isAdmin: false, hasLinked: false }
  const key = (watching: boolean) => toMarkup(createElement(MapKeyView, { prefs: DEFAULT_LAYERS, viewer: { ...ANON, watching }, collapsed: new Set<LayerKey>(), onToggleSection: noop, onClose: noop }))

  it('appears only for a viewer who watches at least one car', () => {
    expect(key(true)).toContain('Car you are watching for (magenta, pulsing ring)')
    expect(key(false)).not.toContain('watching for')
  })

  it('is drawn from the same marker HTML as the watched layer', () => {
    expect(WATCHED_KEY_ROW.swatch).toEqual({ kind: 'marker', html: watchedVehicleIconHtml() })
    expect(watchedVehicleIconHtml()).toContain(WATCHED_CAR_COLOR)
    expect(watchedVehicleIconHtml()).toContain('watch-ping')
  })

  it('is not in MAP_KEY: the watched layer is not a LayerKey (no toggle), so the coverage test does not bind it', () => {
    const ids = Object.values(MAP_KEY).flat().map((r) => r.id)
    expect(ids).not.toContain(WATCHED_KEY_ROW.id)
  })
})

describe('T72: colours and stacking', () => {
  it('magenta is none of amber, cyan or pink', () => {
    expect(WATCHED_CAR_COLOR.toLowerCase()).not.toMatch(/^#(f0b050|00e5ff|ff5fa2)$/)
  })

  it('watched cars sit above other cars and NPC groups, below players', () => {
    expect(WATCHED_PANE_Z_INDEX).toBeGreaterThan(600)
    expect(WATCHED_PANE_Z_INDEX).toBeGreaterThan(NPC_PANE_Z_INDEX)
    expect(WATCHED_PANE_Z_INDEX).toBeLessThan(PLAYERS_PANE_Z_INDEX)
  })
})

describe('T72: wiring (source text)', () => {
  const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
  const page = read('../pages/MapPage.tsx')
  const data = read('../data/useAuroraData.ts')
  const mapView = read('../map/MapView.tsx')
  const css = read('../styles/aurora.css')
  const wrapper = read('./WatchCars.tsx')

  it('useAuroraData fetches vehicles while watching, even with the Vehicles layer off', () => {
    expect(data).toMatch(/enabled: prefs\.vehicles \|\| watching\.size > 0,/)
  })

  it('MapPage mounts the panel after "Find a player" and the notice in the map overlay', () => {
    const aside = page.slice(page.indexOf('<aside'), page.indexOf('</aside>'))
    expect(aside).toMatch(/<FindPlayer [\s\S]*\/>\s*<WatchCars\b/)
    expect(page).toMatch(/overlay=\{\s*<>[\s\S]*<WatchNotice /)
    expect(aside).not.toContain('WatchNotice')
  })

  it('no realtime channel is added (T19)', () => {
    for (const src of [page, data, read('../data/useWatches.ts'), read('../data/watches.ts')]) expect(src).not.toMatch(/\.channel\(/)
  })

  it('the wrapper starts with wrecks hidden', () => {
    expect(wrapper).toMatch(/useState\(DEFAULT_SHOW_WRECKS\)/)
  })

  it('MapView draws the watched layer whether or not the Vehicles layer is on', () => {
    expect(mapView).toMatch(/swap\(mapRef\.current, watchedLayer, props\.watched\.length > 0 \? buildWatchedVehicles\(props\.watched\) : null\)/)
    expect(mapView).toContain('map.createPane(WATCHED_PANE)')
  })

  it('the ping animates only transform and opacity, and reduced motion stops it for a static ring', () => {
    const frames = css.slice(css.indexOf('@keyframes watch-ping'), css.indexOf('}', css.indexOf('100%', css.indexOf('@keyframes watch-ping'))))
    const props = [...frames.matchAll(/([a-z-]+):/g)].map((m) => m[1])
    expect(new Set(props)).toEqual(new Set(['transform', 'opacity']))
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/\.aurora-watched \.watch-ping \{ animation: none !important;/)
  })
})
