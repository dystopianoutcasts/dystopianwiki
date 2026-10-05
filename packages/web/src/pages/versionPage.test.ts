/**
 * Tests for the version page's section icons (WEBFIX, after KB14).
 *
 * The version page kept its own five-word icon map, so the sections added in KB10 and KB12
 * ("Running a Server", icon `database`; "How the Game Works", icon `box`) fell back to the
 * book there while the section page and the menu showed their own icons. It now resolves
 * every section icon with the sidebar's resolveIcon, the one map of icon words.
 *
 * VersionPage and Sidebar import stylesheets, which cannot load in node:test, so the map and
 * the page are read as source. node:test, run with
 * `npx tsx --test src/pages/versionPage.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { VERSIONS } from '../config/versions.generated'

const SRC = fileURLToPath(new URL('../', import.meta.url))
/** Source without comments, so a comment cannot satisfy or break a check. */
const code = (rel: string) =>
  readFileSync(join(SRC, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** The word -> icon pairs of the shared map in Sidebar.tsx. */
function sharedIconMap(): Map<string, string> {
  const src = code('components/layout/Sidebar.tsx')
  const body = /const iconMap: Record<string, string> = \{([\s\S]*?)\};/.exec(src)
  assert.ok(body, 'iconMap not found in Sidebar.tsx')
  const map = new Map<string, string>()
  for (const m of body[1].matchAll(/^\s*'?([\w-]+)'?\s*:\s*'([^']*)'/gm)) map.set(m[1], m[2])
  return map
}

const icons = sharedIconMap()

test('every section and category icon word in the navigation is a word the shared map knows', () => {
  const unknown: string[] = []
  for (const version of VERSIONS) {
    for (const section of version.sections) {
      if (!icons.has(section.icon)) unknown.push(`${version.id}/${section.id}: ${section.icon}`)
      for (const category of section.categories) {
        if (!icons.has(category.icon)) unknown.push(`${version.id}/${section.id}/${category.id}: ${category.icon}`)
      }
    }
  }
  assert.deepEqual(unknown, [], 'these words would show the fallback book')
})

test('the server and gameplay sections have icons of their own, not the book', () => {
  const b42 = VERSIONS.find((v) => v.id === 'build-42')
  for (const id of ['server', 'gameplay']) {
    const section = b42?.sections.find((s) => s.id === id)
    assert.ok(section, `build-42 has no section ${id}`)
    const icon = icons.get(section.icon)
    assert.ok(icon, `${id}: icon word ${section.icon} is not in the shared map`)
    assert.notEqual(icon, icons.get('book'), `${id}: resolves to the fallback book`)
  }
})

// The icon is decoration beside the section name, so it is hidden from screen readers (as in the sidebar).
test('the version page resolves section icons with the shared resolveIcon and keeps no map', () => {
  const src = code('pages/VersionPage.tsx')
  assert.match(src, /import \{ resolveIcon \} from '\.\.\/components\/layout\/Sidebar'/)
  assert.match(src, /<span className="version-page__section-icon" aria-hidden="true">\s*\{resolveIcon\(section\.icon\)\}/)
  assert.doesNotMatch(src, /^\s*'?(plug|map|car|gear|book|box|database)'?\s*:\s*'/m, 'a local icon map is back')
  assert.doesNotMatch(src, /function resolveSectionIcon/)
})
