// KB15: the map mounts the ONE shared site header (packages/shared/site-header), the same
// component as the wiki, and passes only what is the map's own. The header's behaviour is
// tested beside it (packages/shared/site-header/*.test.ts, run by this vitest project);
// this file pins the wiring. No React render setup here (see data/useAuroraData.test.ts),
// so the component is asserted on as source text.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { mapPagePath } from './mapPagePath'
import { sectionsFrom } from './useSiteNav'

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url))
/** Source without comments, so a comment cannot satisfy or break a check. */
const code = (p: string) =>
  readFileSync(here(p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const src = code('./MapHeader.tsx')
const app = code('../App.tsx')

describe('KB15: the map mounts the shared site header', () => {
  it('imports SiteHeader from the shared folder, not a copy of its own', () => {
    expect(src).toMatch(/import \{[^}]*\bSiteHeader\b[^}]*\} from '\.\.\/\.\.\/\.\.\/shared\/site-header'/)
    expect(existsSync(here('./SiteHeader.tsx'))).toBe(false)
    expect(existsSync(here('../auth/AccountControl.tsx'))).toBe(false)
  })

  it('App.tsx renders it once, between the skip link and <main>', () => {
    expect(app).toMatch(/className="skip-link"[\s\S]*<MapHeader \/>[\s\S]*<main id="main"/)
    expect(app.match(/<MapHeader \/>/g)).toHaveLength(1)
    expect(app).not.toMatch(/AccountControl/)
  })

  it('passes the published sections, Live Map as current, and this page for Log in', () => {
    expect(src).toMatch(/const sections = useSiteNav\(\)/)
    expect(src).toMatch(/sections=\{sections\}/)
    expect(src).toMatch(/current=\{LIVE_MAP_ID\}/)
    expect(src).toMatch(/currentPath=\{mapPagePath\(location\.pathname\)\}/)
  })

  it('maps the shared session to the header: loading, signed in with the shared member reading, signed out', () => {
    expect(src).toMatch(/if \(loading\) account = \{ status: 'loading' \}/)
    expect(src).toMatch(/account = \{ status: 'signed-in', userId: user\.id, member: memberDisplay\(user\), signOut \}/)
    expect(src).toMatch(/else account = \{ status: 'signed-out' \}/)
  })

  it('asks site_is_admin on the public schema (this client defaults to aurora), from a stable function', () => {
    expect(src).toMatch(/^const checkSiteAdmin = \(\) => getAurora\(\)\.client\.schema\('public'\)\.rpc\('site_is_admin'\)/m)
    expect(src).toMatch(/siteAdminCheck=\{checkSiteAdmin\}/)
  })

  it('passes no account options, links or search of its own, so the menu is the shared one', () => {
    expect(src).not.toMatch(/\b(options|search|onLinkClick)=/)
    expect(src).not.toMatch(/from 'react-router-dom'[\s\S]*\bLink\b/)
  })

  it('"Log in" returns to the map page the visitor is on', () => {
    expect(mapPagePath('/')).toBe('/map/')
    expect(mapPagePath('')).toBe('/map/')
    expect(mapPagePath('/link')).toBe('/map/#/link')
  })

  it('the published navigation still has the seven header links the 1280 px breakpoint was measured for', () => {
    // The file the header reads at runtime, /data/versions.json (repo root data/).
    const published = JSON.parse(readFileSync(here('../../../../data/versions.json'), 'utf8'))
    expect(
      (sectionsFrom(published) ?? []).length + 1,
      'sections + Live Map. A section was added or removed: re-measure the header and move the breakpoint',
    ).toBe(7)
  })
})
