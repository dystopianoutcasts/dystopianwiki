/**
 * Tests for where the header's section links give way to the menu button (KB14).
 *
 * With six Build 42 sections and Live Map the links measure about 800 px; beside the logo,
 * the search box and the account control the header needs about 1,170 px (headless Edge,
 * 2026-10-04). At 768 px, the old breakpoint, the links wrapped onto three and four lines
 * between 769 and 1,200 px and pushed Log in off screen below about 1,000 px. The nav
 * therefore hides at the documented xl breakpoint, and the menu button and the slide-out
 * menu must appear at exactly the same width, or a width exists with no way to navigate.
 * The closed menu sits off screen at those widths, so it must also be visibility: hidden,
 * or keyboard users Tab through its invisible links before reaching the page.
 * node:test, run with `npx tsx --test src/components/layout/headerNav.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated'

const STYLES = fileURLToPath(new URL('../../styles/components/', import.meta.url))
const css = (file: string) => readFileSync(join(STYLES, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** The max-width (px) of every @media block whose body sets `selector { ... decl ... }`. */
function maxWidthsFor(source: string, selector: string, decl: RegExp): number[] {
  const found: number[] = []
  const media = /@media\s*\(max-width:\s*(\d+)px\)\s*\{/g
  let m: RegExpExecArray | null
  while ((m = media.exec(source))) {
    let depth = 1
    let i = media.lastIndex
    while (i < source.length && depth > 0) {
      if (source[i] === '{') depth++
      else if (source[i] === '}') depth--
      i++
    }
    const body = source.slice(media.lastIndex, i - 1)
    const rule = new RegExp(`(^|[\\s}])${selector.replace(/[.]/g, '\\.')}\\s*\\{([^}]*)\\}`)
    const r = rule.exec(body)
    if (r && decl.test(r[2])) found.push(Number(m[1]))
  }
  return found
}

const navHidden = maxWidthsFor(css('header.css'), '.header__nav', /display:\s*none/)
const buttonShown = maxWidthsFor(css('header.css'), '.header__mobile-menu-btn', /display:\s*flex/)
const menuShown = maxWidthsFor(css('mobile-menu.css'), '.mobile-menu', /display:\s*block/)

test('the header carries the seven links the 1280 px breakpoint was measured for', () => {
  const sections = (getVersion(DEFAULT_VERSION)?.sections ?? []).filter((s) => s.categories.some((c) => c.articleCount > 0))
  assert.equal(
    sections.length + 1,
    7,
    `header links: ${sections.length} sections + Live Map. A section was added or removed: re-measure the width the header needs and move the breakpoint below (and in mobile-menu.css) to match`,
  )
})

test('the nav hides, the menu button shows and the menu exists at the same single width', () => {
  assert.equal(navHidden.length, 1, `nav hidden in ${navHidden.length} @media blocks`)
  assert.equal(buttonShown.length, 1, `button shown in ${buttonShown.length} @media blocks`)
  assert.equal(menuShown.length, 1, `menu shown in ${menuShown.length} @media blocks`)
  assert.equal(buttonShown[0], navHidden[0])
  assert.equal(menuShown[0], navHidden[0])
})

test('that width is the xl breakpoint, 1280 px', () => {
  assert.equal(navHidden[0], 1280)
})

test('the current page in the menu gets its dark-theme colour without a data-theme attribute', () => {
  // useTheme removes data-theme for dark, the default, so [data-theme="dark"] never matches
  // and the link kept --color-primary-600 on the dark background (2:1).
  const source = css('mobile-menu.css')
  assert.match(source, /:root:not\(\[data-theme="light"\]\) \.mobile-menu__nav-link--active \{\s*color: var\(--color-accent-400\);/)
  assert.doesNotMatch(source, /\[data-theme="dark"\] \.mobile-menu__nav-link--active/)
})

test('the closed menu is hidden, not only moved off screen, so Tab cannot reach its links', () => {
  const closed = maxWidthsFor(css('mobile-menu.css'), '.mobile-menu', /visibility:\s*hidden/)
  const open = maxWidthsFor(css('mobile-menu.css'), '.mobile-menu--open', /visibility:\s*visible/)
  assert.deepEqual(closed, [navHidden[0]])
  assert.deepEqual(open, [navHidden[0]])
})
