// T34 structural checks: no working React render setup in this repo (see
// data/useAuroraData.test.ts's header comment for why), so components are asserted on
// as source text, the same approach that file already uses for T19/T23.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appSrc = readFileSync(fileURLToPath(new URL('../App.tsx', import.meta.url)), 'utf8')
const mapPageSrc = readFileSync(fileURLToPath(new URL('./MapPage.tsx', import.meta.url)), 'utf8')
const useAuroraDataSrc = readFileSync(fileURLToPath(new URL('../data/useAuroraData.ts', import.meta.url)), 'utf8')
const signInDialogSrc = readFileSync(fileURLToPath(new URL('../auth/SignInDialog.tsx', import.meta.url)), 'utf8')
// MapView.tsx imports leaflet, which touches `window` at module load time and cannot
// be imported under this suite's node environment (see data/useAuroraData.test.ts's
// header comment) - its exported numeric constants are asserted on as source text too.
const mapViewSrc = readFileSync(fileURLToPath(new URL('../map/MapView.tsx', import.meta.url)), 'utf8')
const findPlayerSrc = readFileSync(fileURLToPath(new URL('../panels/FindPlayer.tsx', import.meta.url)), 'utf8')

describe('T34: the top bar is gone', () => {
  it('App.tsx has no aurora-header and does not import SignInButtons', () => {
    expect(appSrc).not.toMatch(/aurora-header/)
    expect(appSrc).not.toMatch(/SignInButtons/)
  })

  it('the brand and account control now live in the side panel head instead', () => {
    expect(mapPageSrc).toMatch(/side-head/)
    expect(mapPageSrc).toMatch(/<AccountControl/)
  })
})

describe('T34: server health is for admins only', () => {
  it('MapPage renders HealthPanel only inside the isAdmin conditional, with no fallback', () => {
    expect(mapPageSrc).toMatch(/\{isAdmin \? <HealthPanel[\s\S]*?: null\}/)
  })

  it('MapPage no longer tells a signed-out visitor to sign in to see vehicles', () => {
    expect(mapPageSrc).not.toMatch(/Sign in to see vehicles/)
  })

  it('useAuroraData gates both health datasets on isAdmin, not on being merely signed in', () => {
    expect(useAuroraDataSrc).toMatch(/enabled: isAdmin/)
    expect(useAuroraDataSrc).toMatch(/const healthLatest = useDataset\(\s*isAdmin,/)
  })

  it('useAuroraData keeps vehicles available to everyone, only gated on the layer toggle', () => {
    expect(useAuroraDataSrc).toMatch(/enabled: prefs\.vehicles,/)
    expect(useAuroraDataSrc).not.toMatch(/enabled: prefs\.vehicles && user/)
  })
})

describe('T34: the admin sign-in dialog', () => {
  it('is a native <dialog> opened with showModal()', () => {
    expect(signInDialogSrc).toMatch(/<dialog/)
    expect(signInDialogSrc).toMatch(/showModal\(\)/)
  })

  it('is labelled by its own heading', () => {
    expect(signInDialogSrc).toMatch(/aria-labelledby="signin-h"/)
    expect(signInDialogSrc).toMatch(/id="signin-h"/)
  })
})

describe('T42: a street search result uses the fixed search zoom, not the old broken formula', () => {
  it('MapPage.tsx uses SEARCH_STREET_ZOOM and not the old STREETS_MIN_ZOOM + 3', () => {
    expect(mapPageSrc).toMatch(/SEARCH_STREET_ZOOM/)
    expect(mapPageSrc).not.toMatch(/STREETS_MIN_ZOOM \+ 3/)
  })

  it('MapView.tsx defines SEARCH_STREET_ZOOM as 15, the owner\'s number, not the old formula\'s 8', () => {
    const m = mapViewSrc.match(/export const SEARCH_STREET_ZOOM = (\d+)/)
    expect(m).not.toBeNull()
    expect(Number(m?.[1])).toBe(15)
  })
})

describe('T38: find a player', () => {
  it('FindPlayer.tsx labels its select with a <label htmlFor> tied to the select\'s id', () => {
    expect(findPlayerSrc).toMatch(/<label htmlFor="find-player-select">/)
    expect(findPlayerSrc).toMatch(/id="find-player-select"/)
  })

  it('FindPlayer.tsx never renders a raw username - only `name` and the opaque `key`', () => {
    expect(findPlayerSrc).not.toMatch(/username/)
  })

  it('each option shows the player\'s name, never the opaque key, as its visible text', () => {
    expect(findPlayerSrc).toMatch(/<option key=\{p\.key\} value=\{p\.key\}>\{p\.name\}<\/option>/)
  })

  it('MapPage.tsx wires FindPlayer to SEARCH_PLAYER_ZOOM', () => {
    expect(mapPageSrc).toMatch(/<FindPlayer/)
    expect(mapPageSrc).toMatch(/SEARCH_PLAYER_ZOOM/)
  })

  it('MapView.tsx defines SEARCH_PLAYER_ZOOM as 17, the owner\'s number', () => {
    const m = mapViewSrc.match(/export const SEARCH_PLAYER_ZOOM = (\d+)/)
    expect(m).not.toBeNull()
    expect(Number(m?.[1])).toBe(17)
  })
})
