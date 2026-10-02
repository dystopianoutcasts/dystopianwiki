import { describe, expect, it } from 'vitest'
import { DEATH_PANE, DEATH_PANE_Z_INDEX, NPC_PANE, NPC_PANE_Z_INDEX, PLAYERS_PANE, PLAYERS_PANE_Z_INDEX, PLAYER_NAMES_PANE, PLAYER_NAMES_PANE_Z_INDEX } from './panes'

// T41 (owner): player markers and their names must draw above every other layer. This
// is the pure module map/MapView.tsx imports its pane names and z-indices from and
// re-exports - see panes.ts's own header comment for why the numeric assertions live
// here rather than on an import of MapView.tsx itself (which cannot be imported under
// this suite's node test environment; Leaflet touches `window` at module load time).
describe('panes (T41): player panes sit above every other layer, below only a popup', () => {
  it('PLAYERS_PANE_Z_INDEX is above the tooltip pane (650) and below a popup (700)', () => {
    expect(PLAYERS_PANE_Z_INDEX).toBeGreaterThan(650)
    expect(PLAYERS_PANE_Z_INDEX).toBeLessThan(700)
  })

  it('PLAYER_NAMES_PANE_Z_INDEX is also between 650 and 700, and above the players pane itself', () => {
    expect(PLAYER_NAMES_PANE_Z_INDEX).toBeGreaterThan(650)
    expect(PLAYER_NAMES_PANE_Z_INDEX).toBeLessThan(700)
    expect(PLAYER_NAMES_PANE_Z_INDEX).toBeGreaterThan(PLAYERS_PANE_Z_INDEX)
  })

  it('the two pane names are distinct, non-empty strings', () => {
    expect(PLAYERS_PANE).not.toBe(PLAYER_NAMES_PANE)
    expect(PLAYERS_PANE.length).toBeGreaterThan(0)
    expect(PLAYER_NAMES_PANE.length).toBeGreaterThan(0)
  })
})

describe('panes: A-Life NPC markers sit above vehicles and below players', () => {
  it('NPC_PANE_Z_INDEX is above the marker pane (600) and below every player pane', () => {
    expect(NPC_PANE_Z_INDEX).toBeGreaterThan(600)
    expect(NPC_PANE_Z_INDEX).toBeLessThan(PLAYERS_PANE_Z_INDEX)
    expect(NPC_PANE_Z_INDEX).toBeLessThan(PLAYER_NAMES_PANE_Z_INDEX)
  })

  it('NPC_PANE is its own pane', () => {
    expect(NPC_PANE).not.toBe(PLAYERS_PANE)
    expect(NPC_PANE).not.toBe(PLAYER_NAMES_PANE)
  })
})

describe('panes: death markers sit above vehicles, below NPC groups and players', () => {
  it('DEATH_PANE_Z_INDEX is above the marker pane (600) and below the NPC pane', () => {
    expect(DEATH_PANE_Z_INDEX).toBeGreaterThan(600)
    expect(DEATH_PANE_Z_INDEX).toBeLessThan(NPC_PANE_Z_INDEX)
    expect(DEATH_PANE_Z_INDEX).toBeLessThan(PLAYERS_PANE_Z_INDEX)
  })

  it('DEATH_PANE is its own pane', () => {
    expect(new Set([DEATH_PANE, NPC_PANE, PLAYERS_PANE, PLAYER_NAMES_PANE]).size).toBe(4)
  })
})
