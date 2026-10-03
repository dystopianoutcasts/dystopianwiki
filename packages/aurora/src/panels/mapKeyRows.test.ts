// T67: the map key. The data (mapKeyRows.ts) is pure and tested directly; the component and its
// wiring are asserted on as source text, as pages/mapChrome.test.ts does (no React render
// setup in this repo).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYERS, LAYER_KEYS } from '../state/layerPrefs'
import type { LayerPrefs } from '../state/layerPrefs'
import { MAP_KEY, visibleKey } from './mapKeyRows'
import { SAFEHOUSE_STYLE, deathIconHtml, npcGroupIconHtml, outpostStyle, playerIconHtml, vehicleIconHtml } from '../layers/symbols'

const ALL_ON = Object.fromEntries(LAYER_KEYS.map((k) => [k, true])) as LayerPrefs
const ALL_OFF = Object.fromEntries(LAYER_KEYS.map((k) => [k, false])) as LayerPrefs
const ANON = { isAdmin: false, hasLinked: false }
const ADMIN = { isAdmin: true, hasLinked: false }

const rowIds = (entries: ReturnType<typeof visibleKey>) => entries.flatMap((e) => e.rows.map((r) => r.id))

describe('T67: every layer has a key entry', () => {
  it.each(LAYER_KEYS)('%s has at least one row', (layer) => {
    expect(MAP_KEY[layer]?.length ?? 0).toBeGreaterThan(0)
  })

  it('the key has no entry for a layer that does not exist', () => {
    expect(Object.keys(MAP_KEY).sort()).toEqual([...LAYER_KEYS].sort())
  })

  it('row ids are unique and every label is plain words', () => {
    const ids = Object.values(MAP_KEY).flat().map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const r of Object.values(MAP_KEY).flat()) expect(r.label.trim().length).toBeGreaterThan(3)
  })
})

describe('T67: the key lists only layers that are on', () => {
  it('nothing on, nothing listed', () => {
    expect(visibleKey(ALL_OFF, ADMIN)).toEqual([])
  })

  it('one layer on lists that layer alone', () => {
    const entries = visibleKey({ ...ALL_OFF, deaths: true }, ANON)
    expect(entries.map((e) => e.layer)).toEqual(['deaths'])
  })

  it('the defaults list exactly the default-on layers, in toggle order', () => {
    const on = LAYER_KEYS.filter((k) => DEFAULT_LAYERS[k])
    expect(visibleKey(DEFAULT_LAYERS, ANON).map((e) => e.layer)).toEqual(on)
  })

  it('switching a layer off removes its rows; on again brings them back', () => {
    expect(rowIds(visibleKey({ ...DEFAULT_LAYERS, vehicles: false }, ANON))).not.toContain('vehicle')
    expect(rowIds(visibleKey({ ...DEFAULT_LAYERS, vehicles: true }, ANON))).toContain('vehicle')
  })
})

describe('T67: admin-only symbols are never described to anyone else (VISIBILITY.md)', () => {
  it('an anonymous viewer sees no admin row, with every layer on', () => {
    const rows = visibleKey(ALL_ON, ANON).flatMap((e) => e.rows)
    expect(rows.filter((r) => r.audience === 'admin')).toEqual([])
    expect(rows.map((r) => r.id)).not.toContain('npc-admin')
    for (const r of rows) expect(r.label).not.toMatch(/admin/i)
  })

  it('an admin sees the hidden NPC group symbol', () => {
    expect(rowIds(visibleKey(ALL_ON, ADMIN))).toContain('npc-admin')
  })

  it('the linked-character ring is listed only for a viewer who has one', () => {
    expect(rowIds(visibleKey(ALL_ON, ANON))).not.toContain('player-own')
    expect(rowIds(visibleKey(ALL_ON, { isAdmin: false, hasLinked: true }))).toContain('player-own')
  })

  it('there is an admin-only row to hide (so the tests above are not vacuous)', () => {
    expect(Object.values(MAP_KEY).flat().some((r) => r.audience === 'admin')).toBe(true)
  })
})

describe('T67: swatches are the map\'s own symbols', () => {
  const find = (id: string) => Object.values(MAP_KEY).flat().find((r) => r.id === id)

  it('marker swatches are the builders\' own HTML', () => {
    expect(find('player-live')?.swatch).toEqual({ kind: 'marker', html: playerIconHtml({ delayed: false, own: false }) })
    expect(find('player-delayed')?.swatch).toEqual({ kind: 'marker', html: playerIconHtml({ delayed: true, own: false }) })
    expect(find('vehicle-claimed')?.swatch).toEqual({ kind: 'marker', html: vehicleIconHtml({ claimed: true, ledger: false }) })
    expect(find('death')?.swatch).toEqual({ kind: 'marker', html: deathIconHtml() })
    expect(find('npc-hostile')?.swatch).toEqual({ kind: 'marker', html: npcGroupIconHtml({ size: 4, stance: 'hostile', active: true, adminOnly: false }) })
  })

  it('area swatches are the builders\' own path styles', () => {
    expect(find('safehouse')?.swatch).toEqual({ kind: 'area', style: SAFEHOUSE_STYLE })
    expect(find('outpost-hostile')?.swatch).toEqual({ kind: 'area', style: outpostStyle(true) })
  })

  it('build.ts draws with those same symbol functions', () => {
    const buildSrc = readFileSync(fileURLToPath(new URL('../layers/build.ts', import.meta.url)), 'utf8')
    for (const fn of ['playerIconHtml(', 'vehicleIconHtml(', 'deathIconHtml(', 'npcGroupIconHtml(', 'outpostStyle(', 'SAFEHOUSE_STYLE', 'ZONE_AREA_STYLE', 'ZONE_POINT_STYLE', 'OBJECT_STYLE', 'WORLD_FILL.forest', 'ROAD_STYLE']) {
      expect(buildSrc).toContain(fn)
    }
  })
})

describe('T67: the MapKey panel', () => {
  const src = readFileSync(fileURLToPath(new URL('./MapKey.tsx', import.meta.url)), 'utf8')
  const mapPageSrc = readFileSync(fileURLToPath(new URL('../pages/MapPage.tsx', import.meta.url)), 'utf8')

  it('the toggle is a real button with aria-expanded and aria-controls', () => {
    expect(src).toMatch(/<button type="button" className="map-key-toggle" aria-expanded=\{open\} aria-controls="map-key-body"/)
    expect(src).toMatch(/Map key/)
    expect(src).toMatch(/id="map-key-body" hidden=\{!open\}/)
  })

  it('closed by default', () => {
    expect(src).toMatch(/=== '1'/)
  })

  it('every swatch is decorative', () => {
    const swatches = src.match(/className="key-swatch[^"]*"[^>]*/g) ?? []
    expect(swatches.length).toBeGreaterThan(0)
    for (const s of swatches) expect(s).toMatch(/aria-hidden="true"/)
  })

  it('MapPage renders it under the layer toggles with the viewer\'s admin flag', () => {
    expect(mapPageSrc).toMatch(/<LayerToggles[^\n]*\n\s*<MapKey prefs=\{prefs\} viewer=\{\{ isAdmin, hasLinked: own\.size > 0 \}\} \/>/)
  })
})
