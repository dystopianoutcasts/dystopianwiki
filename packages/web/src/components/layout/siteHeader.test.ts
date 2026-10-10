/**
 * KB15: the wiki mounts the ONE shared site header (packages/shared/site-header), the same
 * component as the live map, and passes only what is the wiki's own. The header's behaviour
 * (account menu, theme, folding menu, breakpoints, contrast) is tested beside it and run by
 * the map's vitest; this file pins the wiring. WikiHeader imports stylesheets and React
 * components that cannot load in node:test, so the tests read its source.
 * node:test, run with `npx tsx --test src/components/layout/siteHeader.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated'

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url))
/** Source without comments, so a comment cannot satisfy or break a check. */
const code = (p: string) =>
  readFileSync(here(p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')

const layout = code('./Layout.tsx')
const wiki = code('./WikiHeader.tsx')

test('Layout mounts the wiki header once, and nothing of the old header or slide-out menu', () => {
  assert.match(layout, /import \{ WikiHeader \} from '\.\/WikiHeader';/)
  assert.equal(layout.match(/<WikiHeader \/>/g)?.length, 1)
  assert.doesNotMatch(layout, /\b(Header|MobileMenu)\b(?!\w)/)
})

test('the replaced files are gone', () => {
  for (const p of [
    './Header.tsx',
    './MobileMenu.tsx',
    '../auth/AuthButton.tsx',
    '../auth/UserMenu.tsx',
    '../../hooks/useTheme.ts',
    '../../styles/components/header.css',
    '../../styles/components/mobile-menu.css',
    '../../styles/components/auth-button.css',
    '../../styles/components/user-menu.css',
  ]) {
    assert.equal(existsSync(here(p)), false, `${p} still exists`)
  }
})

test('WikiHeader renders the shared SiteHeader, not a copy', () => {
  assert.match(wiki, /import \{[^}]*\bSiteHeader\b[^}]*\} from '\.\.\/\.\.\/\.\.\/\.\.\/shared\/site-header'/)
  assert.equal(wiki.match(/<SiteHeader\b/g)?.length, 1)
})

test('it passes the default version\'s sections, the current one and this page for Log in', () => {
  assert.match(wiki, /const sections = siteSections\(DEFAULT_VERSION\)/)
  assert.match(wiki, /sections=\{sections\}/)
  assert.match(wiki, /current=\{currentFor\(location\.pathname, sections\)\}/)
  assert.match(wiki, /currentPath=\{location\.pathname \+ location\.search\}/)
  assert.match(wiki, /href: `\/pz\/\$\{versionId\}\/\$\{s\.id\}`/)
})

test('the sign-in state maps the same way as on the map: loading, signed in with the shared member reading, signed out', () => {
  assert.match(wiki, /if \(loading\) account = \{ status: 'loading' \}/)
  assert.match(wiki, /account = \{ status: 'signed-in', userId: user\.id, member: memberDisplay\(user\), signOut \}/)
  assert.match(wiki, /else account = \{ status: 'signed-out' \}/)
})

test('site admin comes from public.site_is_admin, through a stable module-level function', () => {
  assert.match(wiki, /^const checkSiteAdmin = \(\) => api\.getClient\(\)\.rpc\('site_is_admin'\)/m)
  assert.match(wiki, /siteAdminCheck=\{checkSiteAdmin\}/)
})

test('the wiki adds its live search and menu extras, and no account options of its own', () => {
  assert.match(wiki, /search=\{<FuzzySearchBar placeholder="Search docs\.\.\." \/>\}/)
  assert.match(wiki, /menuExtras=\{menuExtras\}/)
  assert.match(wiki, /<VersionSelect onChange=\{onClose\} \/>/)
  assert.doesNotMatch(wiki, /\boptions=/)
})

test('header links to wiki pages route in the app; the map and modified clicks are page loads', () => {
  assert.match(wiki, /onLinkClick=\{onLinkClick\}/)
  const handler = /const onLinkClick = useCallback\(([\s\S]*?)\[navigate\],?\s*\)/.exec(wiki)
  assert.ok(handler, 'onLinkClick not found')
  const body = handler[1]
  assert.match(body, /event\.button !== 0 \|\| event\.metaKey \|\| event\.ctrlKey \|\| event\.shiftKey \|\| event\.altKey\) return/)
  assert.match(body, /if \(isMapPath\(href\)\) return/)
  assert.ok(body.indexOf('isMapPath(href)') < body.indexOf('event.preventDefault()'), 'the map check must come before preventDefault')
  assert.match(body, /navigate\(href\)/)
})

test('the header carries the seven links the 1280 px breakpoint was measured for', () => {
  const sections = (getVersion(DEFAULT_VERSION)?.sections ?? []).filter((s) => s.categories.some((c) => c.articleCount > 0))
  assert.equal(
    sections.length + 1,
    7,
    `header links: ${sections.length} sections + Live Map. A section was added or removed: re-measure the header and move the breakpoint in packages/shared/site-header/site-header.css`,
  )
})
