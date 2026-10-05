/**
 * Tests for generateBreadcrumbs (WEBFIX, after KB14): the section and category crumbs carry
 * the names from the generated navigation, not the folder ids ("Server", "Gameplay").
 * node:test, run with `npx tsx --test src/lib/breadcrumbs.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { getSection } from '../config/versions.generated'
import { generateBreadcrumbs } from './breadcrumbs'

const labels = (path: string) => generateBreadcrumbs(path).map((b) => b.label)

test('an article in the server section names the section and the category', () => {
  assert.deepEqual(labels('/pz/build-42/server/getting-started/running-a-server'), [
    'Home', 'Project Zomboid', 'Build 42', 'Running a Server', 'Start Here', 'Running A Server',
  ])
})

test('an article in the gameplay section names the section and the category', () => {
  assert.deepEqual(labels('/pz/build-42/gameplay/the-real-numbers/how-infection-works'), [
    'Home', 'Project Zomboid', 'Build 42', 'How the Game Works', 'The Real Numbers', 'How Infection Works',
  ])
})

test('a category id two sections share takes the name of the section in the path', () => {
  assert.equal(labels('/pz/build-42/server/getting-started')[4], getSection('build-42', 'server')?.categories.find((c) => c.id === 'getting-started')?.name)
  assert.equal(labels('/pz/build-42/modding/getting-started')[4], getSection('build-42', 'modding')?.categories.find((c) => c.id === 'getting-started')?.name)
  assert.notEqual(labels('/pz/build-42/server/getting-started')[4], labels('/pz/build-42/modding/getting-started')[4])
})

test('every section and category crumb of every version is its navigation name', () => {
  for (const version of ['build-41', 'build-42']) {
    for (const id of ['modding', 'mapping', 'vehicles', 'outcast-mods', 'gameplay', 'server']) {
      const section = getSection(version, id)
      if (!section) continue
      assert.equal(labels(`/pz/${version}/${id}`)[3], section.name, `${version}/${id}`)
      for (const category of section.categories) {
        assert.equal(labels(`/pz/${version}/${id}/${category.id}`)[4], category.name, `${version}/${id}/${category.id}`)
      }
    }
  }
})

test('the legacy routes without /pz are named the same way', () => {
  assert.deepEqual(labels('/build-42/server/admin-commands'), ['Home', 'Build 42', 'Running a Server', 'Admin Commands'])
})

test('segments the navigation does not know keep the old fallbacks, and only the last is current', () => {
  const crumbs = generateBreadcrumbs('/pz/build-42/no-such-section/some-category')
  assert.deepEqual(crumbs.map((b) => b.label), ['Home', 'Project Zomboid', 'Build 42', 'No Such Section', 'Some Category'])
  assert.deepEqual(crumbs.map((b) => b.href), ['/', '/pz', '/pz/build-42', '/pz/build-42/no-such-section', '/pz/build-42/no-such-section/some-category'])
  assert.deepEqual(crumbs.map((b) => b.isCurrent), [false, false, false, false, true])
  assert.deepEqual(generateBreadcrumbs('/').map((b) => b.isCurrent), [true])
})

test('segments named like Object properties get text labels, not the properties', () => {
  // A plain object lookup returned Object.prototype for __proto__, which React cannot render.
  assert.deepEqual(labels('/pz/build-42/__proto__/constructor/toString'), [
    'Home', 'Project Zomboid', 'Build 42', '__proto__', 'Constructor', 'ToString',
  ])
  assert.deepEqual(labels('/hasOwnProperty').map((l) => typeof l), ['string', 'string'])
})

test('the Breadcrumbs component builds its trail with generateBreadcrumbs', () => {
  const src = readFileSync(join(fileURLToPath(new URL('../components/layout/', import.meta.url)), 'Breadcrumbs.tsx'), 'utf8')
  assert.match(src, /import \{ generateBreadcrumbs, type BreadcrumbItem \} from '\.\.\/\.\.\/lib\/breadcrumbs'/)
  assert.match(src, /customItems \|\| generateBreadcrumbs\(location\.pathname\)/)
  assert.doesNotMatch(src, /function generateBreadcrumbs/)
})
