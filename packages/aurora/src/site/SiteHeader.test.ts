// T39 structural checks on the map's site header. No React render setup in this repo
// (see data/useAuroraData.test.ts's header comment), so the component is asserted on as
// source text, the same approach as pages/mapChrome.test.ts.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { sectionsFrom } from './useSiteNav'

const src = readFileSync(fileURLToPath(new URL('./SiteHeader.tsx', import.meta.url)), 'utf8')

describe('T39: the site header on the map', () => {
  it('the logo is a plain <a href="/"> page load to the home page', () => {
    expect(src).toMatch(/<a href="\/" className="site-header__logo"/)
  })

  it('never uses a react-router Link: under the map\'s HashRouter "/" would become "#/"', () => {
    expect(src).not.toMatch(/from 'react-router/)
    expect(src).not.toMatch(/<Link\b/)
    expect(src).not.toMatch(/<NavLink\b/)
  })

  it('the home link\'s accessible name contains the visible site name', () => {
    expect(src).toMatch(/const SITE_NAME = 'Dystopian Outcasts'/)
    expect(src).toMatch(/aria-label=\{`\$\{SITE_NAME\}, home`\}/)
  })

  it('the search box is a real GET form to the wiki\'s search page, field q, with a label', () => {
    expect(src).toMatch(/<form className="site-header__search" action="\/search" method="get"/)
    expect(src).toMatch(/name="q"/)
    expect(src).toMatch(/<label htmlFor="site-search-q"[^>]*>\s*Search the wiki\s*<\/label>/)
    expect(src).toMatch(/id="site-search-q"/)
  })

  it('"Live Map" is the current page, and is a plain link to /map/', () => {
    expect(src).toMatch(/<a href="\/map\/"[^>]*aria-current="page"[^>]*>\s*Live Map\s*<\/a>/)
  })

  it('section links come from the published navigation', () => {
    expect(src).toMatch(/useSiteNav\(\)/)
    expect(src).toMatch(/href=\{s\.href\}/)
  })

  it('the navigation is labelled "Site"', () => {
    expect(src).toMatch(/<nav className="site-header__nav" aria-label="Site">/)
  })

  it('carries the admin sign-in at the right', () => {
    expect(src).toMatch(/<div className="site-header__actions">\s*<AccountControl \/>/)
  })
})

describe('the site header styles', () => {
  const css = readFileSync(fileURLToPath(new URL('../styles/aurora.css', import.meta.url)), 'utf8')

  // A token the header uses but the map never defines makes the rule fall back silently:
  // "Log in" rendered as plain text instead of the wiki's orange button until 2026-10-02.
  it('defines every wiki token the header rules use', () => {
    const headerRules = css.match(/\.site-header[^{]*\{[^}]*\}/g) ?? []
    const used = new Set(headerRules.join('\n').match(/--color-[a-z0-9-]+/g) ?? [])
    expect(used.size).toBeGreaterThan(0)
    const missing = [...used].filter((name) => !new RegExp(`${name}\\s*:`).test(css))
    expect(missing).toEqual([])
  })
})

// Where the section links give way to the menu (MAPNAV, after KB14 fixed the wiki's own
// header at the same width, packages/web commit 9784bff). With six Build 42 sections and
// Live Map the old 768px switch left the links on two to four lines up to 1,200px and
// pushed the header 121px past an 800px window (headless Edge, 2026-10-04). The nav must
// hide, the menu must show and its closed panel must be hidden at exactly the same width,
// or a width exists with no way to navigate, or with links Tab reaches but no one sees.
describe('the site header breakpoint', () => {
  const css = readFileSync(fileURLToPath(new URL('../styles/aurora.css', import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  )
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  /** The max-width (px) of every @media block holding a rule `selector { ... decl ... }`. */
  function maxWidthsFor(selector: string, decl: RegExp): number[] {
    const found: number[] = []
    const media = /@media\s*\(max-width:\s*(\d+)px\)\s*\{/g
    let m: RegExpExecArray | null
    while ((m = media.exec(css))) {
      let depth = 1
      let i = media.lastIndex
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++
        else if (css[i] === '}') depth--
        i++
      }
      const body = css.slice(media.lastIndex, i - 1)
      const rule = new RegExp(`(?:^|\\})\\s*${escape(selector)}\\s*\\{([^}]*)\\}`, 'g')
      if ([...body.matchAll(rule)].some((r) => decl.test(r[1]))) found.push(Number(m[1]))
    }
    return found
  }

  const navHidden = maxWidthsFor('.site-header__nav', /display:\s*none/)
  const menuShown = maxWidthsFor('.site-header__menu', /display:\s*block/)
  const panelHidden = maxWidthsFor('.site-header__menu-panel', /visibility:\s*hidden/)
  const panelOpen = maxWidthsFor('.site-header__menu[open] .site-header__menu-panel', /visibility:\s*visible/)

  it('the header carries the seven links the 1280px breakpoint was measured for', () => {
    // The file the header reads at runtime, /data/versions.json (repo root data/).
    const published = JSON.parse(readFileSync(fileURLToPath(new URL('../../../../data/versions.json', import.meta.url)), 'utf8'))
    const sections = sectionsFrom(published) ?? []
    expect(
      sections.length + 1,
      'sections + Live Map. A section was added or removed: re-measure the header and move the breakpoint',
    ).toBe(7)
  })

  it('the nav hides and the menu shows at one single width', () => {
    expect(navHidden).toHaveLength(1)
    expect(menuShown).toEqual(navHidden)
  })

  it('that width is the wiki\'s xl breakpoint, 1280px', () => {
    expect(navHidden).toEqual([1280])
  })

  it('above it the menu is not displayed at all, so only one "Site" navigation is exposed', () => {
    expect(css).toMatch(/(?:^|\})\s*\.site-header__menu\s*\{[^}]*display:\s*none/)
  })

  it('the default nav and menu rules come before the 1280px block, so the block wins', () => {
    // Same specificity: a default placed after the @media block would override it, and the
    // menu would never show (or the nav never hide) at any width.
    const block = css.indexOf('@media (max-width: 1280px)')
    const menuDefault = /(?:^|\})\s*\.site-header__menu\s*\{[^}]*display:\s*none/
    const navDefault = /(?:^|\})\s*\.site-header__nav\s*\{[^}]*display:\s*flex/
    expect(block).toBeGreaterThan(-1)
    expect(css.slice(0, block)).toMatch(menuDefault)
    expect(css.slice(0, block)).toMatch(navDefault)
    expect(css.slice(block)).not.toMatch(menuDefault)
    expect(css.slice(block)).not.toMatch(navDefault)
  })

  it('the closed menu panel is hidden, not only unopened, so Tab cannot reach its links', () => {
    expect(panelHidden).toEqual(navHidden)
    expect(panelOpen).toEqual(navHidden)
  })

  it('the menu stays a native <details>, whose summary exposes expanded state without aria-expanded', () => {
    expect(src).toMatch(/<details className="site-header__menu">\s*<summary className="site-header__menu-btn">/)
    // ARIA in HTML: a details element's summary takes only global attributes,
    // aria-disabled and aria-haspopup. The browser maps the open state onto it.
    expect(src).not.toMatch(/<summary[^>]*aria-expanded/)
  })
})
