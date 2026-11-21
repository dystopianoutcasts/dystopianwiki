/**
 * Tests for the wiki's big topics and section groups (lib/topics.ts), against both small
 * fixtures and the real generated navigation. node:test, run with
 * `npx tsx --test src/lib/topics.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSection, getVersion } from '../config/versions.generated'
import type { CategoryInfo, SectionInfo, VersionInfo } from '../config/versions.generated'
import { groupCategories, topicsFor } from './topics'

function category(id: string, articleCount: number, group?: string): CategoryInfo {
  return { id, name: id, description: '', icon: 'book', articleCount, displayOrder: 1, ...(group ? { group } : {}) }
}

function section(id: string, categories: CategoryInfo[], groups?: SectionInfo['groups']): SectionInfo {
  return { id, name: id, description: '', icon: 'book', displayOrder: 1, categories, ...(groups ? { groups } : {}) }
}

function version(sections: SectionInfo[], topics?: VersionInfo['topics']): VersionInfo {
  return { id: 'v', name: 'V', releaseDate: '', status: 'current', description: '', sections, ...(topics ? { topics } : {}) }
}

test('a build with no topics gets null, so its page shows the plain section list', () => {
  assert.equal(topicsFor(version([section('a', [category('x', 1)])])), null)
  assert.equal(topicsFor(version([section('a', [category('x', 1)])], [])), null)
})

test('topics keep their order and their sections order, and add up their articles', () => {
  const v = version(
    [section('a', [category('x', 2)]), section('b', [category('y', 3)]), section('c', [category('z', 4)])],
    [
      { id: 'two', name: 'Two', description: '', icon: 'plug', sections: ['c', 'a'] },
      { id: 'one', name: 'One', description: '', icon: 'box', sections: ['b'] },
    ],
  )
  const topics = topicsFor(v)
  assert.deepEqual(
    topics?.map((t) => [t.id, t.sections.map((s) => s.id), t.articleCount]),
    [['two', ['c', 'a'], 6], ['one', ['b'], 3]],
  )
})

test('sections with no articles, unknown sections, and topics left empty are skipped', () => {
  const v = version(
    [section('a', [category('x', 0)]), section('b', [category('y', 1)])],
    [
      { id: 'empty', name: 'Empty', description: '', icon: 'box', sections: ['a', 'gone'] },
      { id: 'full', name: 'Full', description: '', icon: 'box', sections: ['a', 'b'] },
    ],
  )
  assert.deepEqual(topicsFor(v)?.map((t) => [t.id, t.sections.map((s) => s.id)]), [['full', ['b']]])
})

test('a section with no groups gets null, so its page shows the plain grid', () => {
  const s = section('a', [category('x', 1)])
  assert.equal(groupCategories(s, s.categories), null)
})

test('categories go under their groups in the groups order; ungrouped ones go last under More', () => {
  const cats = [category('p', 1, 'second'), category('q', 1), category('r', 1, 'first'), category('s', 1, 'unknown')]
  const s = section('a', cats, [
    { id: 'first', name: 'First', description: 'f' },
    { id: 'empty', name: 'Empty', description: '' },
    { id: 'second', name: 'Second', description: '' },
  ])
  assert.deepEqual(
    groupCategories(s, cats)?.map((g) => [g.id, g.name, g.categories.map((c) => c.id)]),
    [['first', 'First', ['r']], ['second', 'Second', ['p']], ['more', 'More', ['q', 's']]],
  )
})

test('the live Build 42 navigation: four topics, every section with articles in exactly one', () => {
  const v = getVersion('build-42')
  assert.ok(v)
  const topics = topicsFor(v)
  assert.deepEqual(topics?.map((t) => t.name), ['Playing the Game', 'Running a Server', 'Making Mods', 'Outcast Mods'])
  const shown = topics!.flatMap((t) => t.sections.map((s) => s.id)).sort()
  const withArticles = v.sections.filter((s) => s.categories.some((c) => c.articleCount > 0)).map((s) => s.id).sort()
  assert.deepEqual(shown, withArticles)
})

test('the live Modding, Engine and Outcast Mods sections: every category is under a named group, none under More', () => {
  for (const [id, count] of [['modding', 3], ['engine', 3], ['outcast-mods', 4]] as const) {
    const s = getSection('build-42', id)
    assert.ok(s, id)
    const groups = groupCategories(s, s.categories)
    assert.equal(groups?.length, count, id)
    assert.ok(groups!.every((g) => g.id !== 'more'), `${id} has ungrouped categories`)
    assert.equal(groups!.reduce((n, g) => n + g.categories.length, 0), s.categories.length, id)
  }
})
