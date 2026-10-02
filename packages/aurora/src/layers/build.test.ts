// T41 structural checks: build.ts imports Leaflet, which touches `window` at module
// load time and cannot be imported under this suite's node test environment (see
// data/useAuroraData.test.ts's own header note), so its layer builders are asserted on
// as source text, the same approach pages/mapChrome.test.ts already uses for
// MapPage.tsx/MapView.tsx.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

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
    expect(npc).toMatch(/npc-bang/)
    expect(npc).toMatch(/title: f\.label/)
    expect(npc).toMatch(/alt: f\.label/)
  })

  it('outposts are dashed rectangles, heavier when hostile', () => {
    expect(npc).toMatch(/L\.rectangle\(f\.bounds/)
    expect(npc).toMatch(/dashArray/)
    expect(npc).toMatch(/weight: f\.hostile \? 4 : 2/)
  })
})

describe('car glyph, claimed ring and ledger dimming', () => {
  const css = readFileSync(fileURLToPath(new URL('../styles/aurora.css', import.meta.url)), 'utf8')
  const fn = buildSrc.slice(buildSrc.indexOf('export function buildVehicles'), buildSrc.indexOf('export function buildSafehouses'))

  it('every car is the glyph, and only a claimed car also gets the lock', () => {
    expect(fn).toMatch(/\$\{CAR_SVG\}\$\{f\.claimed \? LOCK_SVG : ''\}/)
  })
  it('the claimed flag adds is-claimed (the ring); the ledger flag adds is-ledger', () => {
    expect(fn).toMatch(/f\.claimed \? 'is-claimed' : ''/)
    expect(fn).toMatch(/f\.ledger \? 'is-ledger' : ''/)
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
