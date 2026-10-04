/**
 * Tests for inSection: a category page and an article page list only the articles of the
 * section in the URL, although the articles query filters by category id alone (KB14).
 *
 * CategoryPage and ArticlePage use the router, react-query and the Supabase client, which
 * cannot load in node:test here, so where they are concerned the tests read their source.
 * node:test, run with `npx tsx --test src/lib/sectionArticles.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { VERSIONS } from '../config/versions.generated'
import { inSection } from './sectionArticles'

const SRC = fileURLToPath(new URL('../', import.meta.url))
/** Source without line comments, so a comment cannot satisfy or break a check. */
const code = (rel: string) => readFileSync(join(SRC, rel), 'utf8').replace(/^\s*\/\/.*$/gm, '')

/** What getArticlesByCategory('getting-started', 'pz', 'build-42') returns: both sections' rows. */
const gettingStarted = [
  { slug: 'install-and-first-mod', section: 'modding' },
  { slug: 'reading-the-servers-numbers', section: 'server' },
  { slug: 'mod-folder-layout', section: 'modding' },
  { slug: 'running-a-server', section: 'server' },
]

test('the generated navigation has category ids that two sections share', () => {
  const shared: string[] = []
  for (const version of VERSIONS) {
    const seen = new Map<string, string>()
    for (const section of version.sections) {
      for (const category of section.categories) {
        const first = seen.get(category.id)
        if (first && first !== section.id) shared.push(`${version.id}/${category.id}`)
        else seen.set(category.id, section.id)
      }
    }
  }
  assert.ok(shared.includes('build-42/getting-started'), `shared ids: ${shared.join(', ')}`)
})

test('inSection keeps only the rows of the given section, in their order', () => {
  assert.deepEqual(
    inSection(gettingStarted, 'server').map((a) => a.slug),
    ['reading-the-servers-numbers', 'running-a-server'],
  )
  assert.deepEqual(
    inSection(gettingStarted, 'modding').map((a) => a.slug),
    ['install-and-first-mod', 'mod-folder-layout'],
  )
  assert.deepEqual(inSection(gettingStarted, 'gameplay'), [])
})

test('inSection without a section keeps every row and returns a new array', () => {
  const all = inSection(gettingStarted, '')
  assert.deepEqual(all, gettingStarted)
  assert.notEqual(all, gettingStarted)
})

for (const [page, rows, kept] of [
  ['pages/CategoryPage.tsx', 'categoryArticles', 'articles'],
  ['pages/ArticlePage.tsx', 'categoryArticles', 'articlesList'],
] as const) {
  test(`${page} passes the category rows through inSection with the route's section`, () => {
    const src = code(page)
    assert.match(src, /import \{ inSection \} from '\.\.\/lib\/sectionArticles'/)
    assert.match(src, new RegExp(`data: ${rows} = \\[\\]`))
    assert.match(src, new RegExp(`const ${kept} = inSection\\(${rows}, section\\)`))
    // The unfiltered rows are named twice only: where the hook returns them and in inSection.
    assert.equal(src.match(new RegExp(`\\b${rows}\\b`, 'g'))?.length, 2)
  })
}
