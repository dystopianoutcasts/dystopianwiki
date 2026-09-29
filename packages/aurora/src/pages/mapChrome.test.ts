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

  it('the side panel keeps its own title head', () => {
    expect(mapPageSrc).toMatch(/side-head/)
  })
})

describe('T39: the site header replaces the account control in the side panel', () => {
  it('MapPage.tsx no longer renders or imports AccountControl (it lives in the site header)', () => {
    expect(mapPageSrc).not.toMatch(/AccountControl/)
  })

  it('App.tsx renders SiteHeader after the skip link and before <main>', () => {
    expect(appSrc).toMatch(/className="skip-link"[\s\S]*<SiteHeader \/>[\s\S]*<main id="main"/)
  })

  it('the skip link moves focus itself instead of changing the HashRouter route to "main"', () => {
    expect(appSrc).toMatch(/onClick=\{skipToMain\}/)
    expect(appSrc).toMatch(/e\.preventDefault\(\)/)
    expect(appSrc).toMatch(/<main id="main" tabIndex=\{-1\}>/)
  })
})

describe('T43 Part MAP: visitors see one name, Dystopian Outcasts, never Aurora', () => {
  const indexHtml = readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8')

  it('the browser tab reads "Live Map - Dystopian Outcasts"', () => {
    expect(indexHtml).toMatch(/<title>Live Map - Dystopian Outcasts<\/title>/)
  })

  it('the side panel title reads "Live Map"', () => {
    expect(mapPageSrc).toMatch(/<span className="brand">Live Map<\/span>/)
  })

  it('neither shows the internal project name', () => {
    expect(indexHtml).not.toMatch(/<title>[^<]*Aurora/)
    expect(mapPageSrc).not.toMatch(/className="brand">[^<]*Aurora/)
  })
})

describe('T39: the map opens on Rosewood at zoom 15', () => {
  const m = mapPageSrc.match(/const DEFAULT_VIEW: View = \{ x: (\d+), y: (\d+), zoom: (\d+) \}/)

  it('DEFAULT_VIEW is a literal the test can read', () => {
    expect(m).not.toBeNull()
  })

  it('is Rosewood from areas.json (x 8350, y 11750)', () => {
    expect(Number(m?.[1])).toBe(8350)
    expect(Number(m?.[2])).toBe(11750)
  })

  it('is zoom 15, the owner\'s number', () => {
    expect(Number(m?.[3])).toBe(15)
  })

  it('a position in the link still wins: DEFAULT_VIEW is only parseView\'s fallback', () => {
    expect(mapPageSrc).toMatch(/parseView\(window\.location\.search, DEFAULT_VIEW,/)
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

describe('T41: players and their names draw above everything else', () => {
  it('MapView.tsx creates both player panes when the map is created', () => {
    expect(mapViewSrc).toMatch(/map\.createPane\(PLAYERS_PANE\)/)
    expect(mapViewSrc).toMatch(/map\.createPane\(PLAYER_NAMES_PANE\)/)
  })

  it('MapView.tsx imports the pane constants from the pure ./panes module, not by redefining them', () => {
    expect(mapViewSrc).toMatch(/from '\.\/panes'/)
  })
})
