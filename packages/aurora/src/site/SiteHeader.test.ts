// T39 structural checks on the map's site header. No React render setup in this repo
// (see data/useAuroraData.test.ts's header comment), so the component is asserted on as
// source text, the same approach as pages/mapChrome.test.ts.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

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
