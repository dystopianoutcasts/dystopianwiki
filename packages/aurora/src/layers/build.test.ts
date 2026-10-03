// T41 structural checks: build.ts imports Leaflet, which touches `window` at module
// load time and cannot be imported under this suite's node test environment (see
// data/useAuroraData.test.ts's own header note), so its layer builders are asserted on
// as source text, the same approach pages/mapChrome.test.ts already uses for
// MapPage.tsx/MapView.tsx.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
// T67: the symbols' look moved to symbols.ts (no Leaflet), so it is tested directly there.
import { CAR_SVG, LOCK_SVG, npcGroupIconHtml, outpostStyle, vehicleIconHtml } from './symbols'

const buildSrc = readFileSync(fileURLToPath(new URL('./build.ts', import.meta.url)), 'utf8')

describe('T41: player markers and their names own two panes that nothing else uses', () => {
  it('buildPlayers puts the marker itself in PLAYERS_PANE', () => {
    const fn = buildSrc.slice(buildSrc.indexOf('export function buildPlayers'), buildSrc.indexOf('export function buildVehicles'))
    expect(fn).toMatch(/pane:\s*PLAYERS_PANE/)
  })

  it('buildPlayers puts the cluster group in PLAYERS_PANE via clusterPane', () => {
    const fn = buildSrc.slice(buildSrc.indexOf('export function buildPlayers'), buildSrc.indexOf('export function buildVehicles'))
    expect(fn).toMatch(/clusterPane:\s*PLAYERS_PANE/)
  })

  it('buildPlayers binds the permanent tooltip to the name, not the full label', () => {
    const fn = buildSrc.slice(buildSrc.indexOf('export function buildPlayers'), buildSrc.indexOf('export function buildVehicles'))
    expect(fn).toMatch(/bindTooltip\(escapeHtml\(f\.name\)/)
    expect(fn).toMatch(/permanent:\s*true/)
    expect(fn).toMatch(/pane:\s*PLAYER_NAMES_PANE/)
  })

  it('no builder other than buildPlayers references PLAYERS_PANE or PLAYER_NAMES_PANE', () => {
    const afterPlayers = buildSrc.slice(buildSrc.indexOf('export function buildVehicles'))
    expect(afterPlayers).not.toMatch(/PLAYERS_PANE/)
    expect(afterPlayers).not.toMatch(/PLAYER_NAMES_PANE/)
  })
})

describe('A-Life NPC builders', () => {
  const npc = buildSrc.slice(buildSrc.indexOf('export function buildNpcGroups'), buildSrc.indexOf('export function buildZones'))

  it('group markers go in NPC_PANE, not the player panes', () => {
    expect(npc).toMatch(/pane:\s*NPC_PANE/)
    expect(npc).not.toMatch(/PLAYERS_PANE|PLAYER_NAMES_PANE/)
  })

  it('hostile gets a "!" badge and the marker carries the label as its accessible name', () => {
    expect(npc).toMatch(/html: npcGroupIconHtml\(f\)/)
    expect(npcGroupIconHtml({ size: 3, stance: 'hostile', active: true, adminOnly: false })).toMatch(/npc-bang/)
    expect(npcGroupIconHtml({ size: 3, stance: 'neutral', active: true, adminOnly: false })).not.toMatch(/npc-bang/)
    expect(npc).toMatch(/title: f\.label/)
    expect(npc).toMatch(/alt: f\.label/)
  })

  it('outposts are dashed rectangles, heavier when hostile', () => {
    expect(npc).toMatch(/L\.rectangle\(f\.bounds, outpostStyle\(f\.hostile\)\)/)
    expect(outpostStyle(false).dashArray).toBeTruthy()
    expect(outpostStyle(true).dashArray).toBeTruthy()
    expect(outpostStyle(true).weight).toBe(4)
    expect(outpostStyle(false).weight).toBe(2)
  })
})

describe('car glyph, claimed ring and ledger dimming', () => {
  const css = readFileSync(fileURLToPath(new URL('../styles/aurora.css', import.meta.url)), 'utf8')
  const fn = buildSrc.slice(buildSrc.indexOf('export function buildVehicles'), buildSrc.indexOf('export function buildSafehouses'))

  it('every car is the glyph, and only a claimed car also gets the lock', () => {
    expect(fn).toMatch(/html: vehicleIconHtml\(\{ claimed: f\.claimed, ledger: f\.ledger \}\)/)
    expect(vehicleIconHtml({ claimed: false, ledger: false })).toContain(CAR_SVG)
    expect(vehicleIconHtml({ claimed: false, ledger: false })).not.toContain(LOCK_SVG)
    expect(vehicleIconHtml({ claimed: true, ledger: false })).toContain(CAR_SVG + LOCK_SVG)
  })
  it('the claimed flag adds is-claimed (the ring); the ledger flag adds is-ledger', () => {
    expect(vehicleIconHtml({ claimed: false, ledger: false })).toMatch(/class="aurora-vehicle"/)
    expect(vehicleIconHtml({ claimed: true, ledger: false })).toMatch(/class="aurora-vehicle is-claimed"/)
    expect(vehicleIconHtml({ claimed: true, ledger: true })).toMatch(/class="aurora-vehicle is-claimed is-ledger"/)
  })
  it('the ring exists only on .is-claimed, one colour for all owners', () => {
    const rule = css.match(/\.aurora-vehicle\.is-claimed \{[^}]*\}/)?.[0] ?? ''
    expect(rule).toMatch(/border:\s*3px solid #00e5ff/)
    const plain = css.match(/\.aurora-vehicle \{[^}]*\}/)?.[0] ?? ''
    expect(plain).not.toMatch(/border/)
  })
  it('a ledger-only claimed car has its ring dashed and the marker dimmed', () => {
    expect(css).toMatch(/\.aurora-vehicle\.is-ledger \{[^}]*opacity:\s*0\.75/)
    expect(css).toMatch(/\.aurora-vehicle\.is-ledger\.is-claimed \{[^}]*border-style:\s*dashed/)
  })
})
