/**
 * Tests for the header's menu button state (WEBFIX, after KB14; WCAG 4.1.2 Name, Role, Value).
 *
 * The button opens and closes the slide-out menu but did not say so: no aria-expanded, no
 * aria-controls. It now carries aria-expanded from the same state that opens the menu, and
 * aria-controls with the menu's id.
 *
 * Header, MobileMenu and Layout import stylesheets and the auth and search components, which
 * cannot load in node:test, so the tests read their source. node:test, run with
 * `npx tsx --test src/components/layout/menuButton.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const HERE = fileURLToPath(new URL('./', import.meta.url))
/** Source without comments, so a comment cannot satisfy or break a check. */
const code = (file: string) =>
  readFileSync(join(HERE, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')

/** The attributes of the first opening tag `<tag` whose text matches `marker`. */
function openingTag(src: string, tag: string, marker: RegExp): string {
  for (const m of src.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))) if (marker.test(m[1])) return m[1]
  assert.fail(`no <${tag}> matching ${marker}`)
}

const header = code('Header.tsx')
const menu = code('MobileMenu.tsx')
const layout = code('Layout.tsx')

test('the menu id is one exported constant', () => {
  assert.match(header, /export const MOBILE_MENU_ID = '[a-z][a-z-]*';/)
  assert.match(menu, /import \{[^}]*\bMOBILE_MENU_ID\b[^}]*\} from '\.\/Header'/)
})

test('the menu button carries aria-expanded from its prop and aria-controls with the menu id', () => {
  const button = openingTag(header, 'button', /className="header__mobile-menu-btn"/)
  assert.match(button, /\baria-expanded=\{mobileMenuOpen\}/)
  assert.match(button, /\baria-controls=\{MOBILE_MENU_ID\}/)
  // Defaulted, so the attribute is always "true" or "false" and never left off.
  assert.match(header, /export function Header\(\{[^}]*\bmobileMenuOpen = false\b[^}]*\}: HeaderProps\)/)
})

test('the slide-out menu carries that id, once', () => {
  const nav = openingTag(menu, 'nav', /className=\{`mobile-menu /)
  assert.match(nav, /\bid=\{MOBILE_MENU_ID\}/)
  assert.equal((menu + header + layout).match(/\bid=\{MOBILE_MENU_ID\}/g)?.length, 1)
})

test('Layout feeds the button and the menu from the same state', () => {
  const state = /const \[(\w+), set\w+\] = useState\(false\);/.exec(layout)
  assert.ok(state, 'menu state not found in Layout')
  const open = state[1]
  assert.match(openingTag(layout, 'Header', /onMobileMenuToggle/), new RegExp(`\\bmobileMenuOpen=\\{${open}\\}`))
  assert.match(openingTag(layout, 'MobileMenu', /isOpen/), new RegExp(`\\bisOpen=\\{${open}\\}`))
})
