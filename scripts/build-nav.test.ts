/**
 * Tests for scripts/build-nav.ts --exclude.
 *
 * Runs the real CLI against a small content tree in a temp folder (the script
 * reads and writes relative to its working directory), so nothing in the repo is
 * read or written. Run: npm run nav:test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SCRIPT = path.join(HERE, 'build-nav.ts')
// The tsx CLI from this repo, so the child resolves it whatever its working directory.
const TSX_CLI = path.join(HERE, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs')
const KEPT = 'content/articles/pz/build-42/modding/fluids/kept.md'
const LEFT_OUT = 'content/articles/pz/build-42/modding/fluids/left-out.md'

function article(slug: string): string {
  return `---\ntitle: ${slug}\nslug: ${slug}\ngame: pz\nversion: build-42\nsection: modding\ncategory: fluids\n---\n\nBody of ${slug}.\n`
}

function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-nav-test-'))
  fs.mkdirSync(path.join(root, 'content/articles/pz/build-42/modding/fluids'), { recursive: true })
  fs.writeFileSync(
    path.join(root, 'content/versions.config.json'),
    JSON.stringify({
      game: 'pz',
      defaultVersion: 'build-42',
      versions: [{ id: 'build-42', name: 'Build 42', releaseDate: '2024-12-17', status: 'current', description: 'd' }],
    }),
  )
  fs.writeFileSync(path.join(root, KEPT), article('kept'))
  fs.writeFileSync(path.join(root, LEFT_OUT), article('left-out'))
  return root
}

function run(root: string, args: string[]) {
  const result = spawnSync(process.execPath, [TSX_CLI, SCRIPT, ...args], {
    cwd: root,
    encoding: 'utf-8',
  })
  return result
}

function readOutputs(root: string) {
  const data = path.join(root, 'packages/web/public/data')
  const search = JSON.parse(fs.readFileSync(path.join(data, 'search-index.json'), 'utf-8')) as Array<{ slug: string }>
  const cats = JSON.parse(fs.readFileSync(path.join(data, 'build-42/modding/categories.json'), 'utf-8')) as {
    categories: Array<{ id: string; articleCount: number }>
  }
  const ts = fs.readFileSync(path.join(root, 'packages/web/src/config/versions.generated.ts'), 'utf-8')
  return { slugs: search.map(s => s.slug), count: cats.categories.find(c => c.id === 'fluids')?.articleCount, ts }
}

test('without --exclude every article is listed', () => {
  const root = fixture()
  try {
    const r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    const out = readOutputs(root)
    assert.deepEqual(out.slugs, ['kept', 'left-out'])
    assert.equal(out.count, 2)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('--exclude leaves the file out of the search index and the counts', () => {
  const root = fixture()
  try {
    const r = run(root, ['--exclude', LEFT_OUT])
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stdout, /\[EXCLUDE\] content\/articles\/pz\/build-42\/modding\/fluids\/left-out\.md/)
    const out = readOutputs(root)
    assert.deepEqual(out.slugs, ['kept'])
    assert.equal(out.count, 1)
    assert.match(out.ts, /articleCount: 1,/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('--exclude accepts backslashes and the = form', () => {
  const root = fixture()
  try {
    const r = run(root, [`--exclude=${LEFT_OUT.split('/').join('\\')}`])
    assert.equal(r.status, 0, r.stderr)
    assert.deepEqual(readOutputs(root).slugs, ['kept'])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('an --exclude that matches no article fails and writes nothing', () => {
  const root = fixture()
  try {
    const r = run(root, ['--exclude', 'content/articles/pz/build-42/modding/fluids/typo.md'])
    assert.equal(r.status, 1)
    assert.match(r.stderr, /--exclude matched no article/)
    assert.equal(fs.existsSync(path.join(root, 'packages/web/public/data/search-index.json')), false)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('a section navName is passed through to the generated data; name is unchanged', () => {
  const root = fixture()
  try {
    fs.writeFileSync(
      path.join(root, 'content/articles/pz/build-42/modding/_section.json'),
      JSON.stringify({ name: 'The Engine, System by System', navName: 'Engine', description: 'd', icon: 'gear', displayOrder: 1 }),
    )
    const r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    const data = path.join(root, 'packages/web/public/data')
    const info = JSON.parse(fs.readFileSync(path.join(data, 'build-42/modding/section-info.json'), 'utf-8')) as {
      name: string
      navName?: string
    }
    assert.equal(info.name, 'The Engine, System by System')
    assert.equal(info.navName, 'Engine')
    const versions = JSON.parse(fs.readFileSync(path.join(data, 'versions.json'), 'utf-8')) as {
      versions: Array<{ sections: Array<{ name: string; navName?: string }> }>
    }
    assert.equal(versions.versions[0].sections[0].navName, 'Engine')
    assert.equal(versions.versions[0].sections[0].name, 'The Engine, System by System')
    assert.match(readOutputs(root).ts, /navName: 'Engine',/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('a section without navName has none in the output, and a blank navName is ignored', () => {
  const root = fixture()
  try {
    const r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    const data = path.join(root, 'packages/web/public/data')
    assert.doesNotMatch(fs.readFileSync(path.join(data, 'build-42/modding/section-info.json'), 'utf-8'), /navName/)
    fs.writeFileSync(
      path.join(root, 'content/articles/pz/build-42/modding/_section.json'),
      JSON.stringify({ name: 'Modding', navName: '  ', description: 'd', icon: 'plug', displayOrder: 1 }),
    )
    assert.equal(run(root, []).status, 0)
    assert.doesNotMatch(fs.readFileSync(path.join(data, 'build-42/modding/section-info.json'), 'utf-8'), /navName/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

// ---------------------------------------------------------------------------
// Topics (versions.config.json) and section groups (_section.json / _category.json)
// ---------------------------------------------------------------------------

const VERSION = { id: 'build-42', name: 'Build 42', releaseDate: '2024-12-17', status: 'current', description: 'd' }

function writeConfig(root: string, topics: unknown): void {
  fs.writeFileSync(
    path.join(root, 'content/versions.config.json'),
    JSON.stringify({ game: 'pz', defaultVersion: 'build-42', versions: [{ ...VERSION, topics }] }),
  )
}

/** A second section, "server", with one article in category "options". */
function addServerSection(root: string): void {
  const dir = path.join(root, 'content/articles/pz/build-42/server/options')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'one.md'),
    '---\ntitle: one\nslug: one\ngame: pz\nversion: build-42\nsection: server\ncategory: options\n---\n\nBody.\n',
  )
}

function readVersions(root: string) {
  const file = path.join(root, 'packages/web/public/data/versions.json')
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as {
    versions: Array<{
      topics?: Array<{ id: string; name: string; icon: string; sections: string[] }>
      sections: Array<{ id: string; groups?: Array<{ id: string; name: string }>; categories: Array<{ id: string; group?: string }> }>
    }>
  }
}

test('a version without topics has no topics in the output', () => {
  const root = fixture()
  try {
    assert.equal(run(root, []).status, 0)
    assert.equal(readVersions(root).versions[0].topics, undefined)
    assert.doesNotMatch(readOutputs(root).ts, /topics:/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('topics are passed through in order, with their sections in the listed order', () => {
  const root = fixture()
  try {
    addServerSection(root)
    writeConfig(root, [
      { id: 'servers', name: 'Running a Server', description: 'd', icon: 'database', sections: ['server'] },
      { id: 'making-mods', name: 'Making Mods', description: 'd', icon: 'plug', sections: ['modding'] },
    ])
    const r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    assert.doesNotMatch(r.stderr, /WARN/)
    const topics = readVersions(root).versions[0].topics
    assert.deepEqual(topics?.map(t => [t.id, t.sections]), [['servers', ['server']], ['making-mods', ['modding']]])
    assert.match(readOutputs(root).ts, /name: 'Running a Server',/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('a section in no topic goes in a final "More" topic, with a warning; a missing section is dropped', () => {
  const root = fixture()
  try {
    addServerSection(root)
    writeConfig(root, [{ id: 'making-mods', name: 'Making Mods', description: 'd', sections: ['modding', 'nope'] }])
    const r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stderr, /names section "nope", which has no folder/)
    assert.match(r.stderr, /sections server are in no topic/)
    const topics = readVersions(root).versions[0].topics
    assert.deepEqual(topics?.map(t => [t.id, t.sections]), [['making-mods', ['modding']], ['more', ['server']]])
    assert.equal(topics?.[0].icon, 'book', 'a topic without an icon gets "book"')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('a section listed in two topics, or a topic with no sections, fails and writes nothing', () => {
  for (const topics of [
    [
      { id: 'a', name: 'A', description: 'd', sections: ['modding'] },
      { id: 'b', name: 'B', description: 'd', sections: ['modding'] },
    ],
    [{ id: 'a', name: 'A', description: 'd', sections: [] }],
    [{ id: 'A b', name: 'A', description: 'd', sections: ['modding'] }],
  ]) {
    const root = fixture()
    try {
      writeConfig(root, topics)
      const r = run(root, [])
      assert.equal(r.status, 1, JSON.stringify(topics))
      assert.equal(fs.existsSync(path.join(root, 'packages/web/public/data/versions.json')), false)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  }
})

test('section groups and category groups are passed through; an unknown group is dropped with a warning', () => {
  const root = fixture()
  try {
    const sectionDir = path.join(root, 'content/articles/pz/build-42/modding')
    fs.writeFileSync(
      path.join(sectionDir, '_section.json'),
      JSON.stringify({
        name: 'Modding',
        description: 'd',
        icon: 'plug',
        displayOrder: 1,
        groups: [
          { id: 'start-here', name: 'Start Here', description: 'Begin.' },
          { id: 'start-here', name: 'Twice' },
          { id: 'Bad Id', name: 'Bad' },
        ],
      }),
    )
    fs.writeFileSync(path.join(sectionDir, 'fluids/_category.json'), JSON.stringify({ name: 'Fluids', group: 'start-here' }))
    let r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stderr, /group "start-here" is listed twice/)
    assert.match(r.stderr, /needs an "id"/)
    let section = readVersions(root).versions[0].sections[0]
    assert.deepEqual(section.groups, [{ id: 'start-here', name: 'Start Here', description: 'Begin.' }])
    assert.equal(section.categories[0].group, 'start-here')
    assert.match(readOutputs(root).ts, /group: 'start-here',/)

    fs.writeFileSync(path.join(sectionDir, 'fluids/_category.json'), JSON.stringify({ name: 'Fluids', group: 'nowhere' }))
    r = run(root, [])
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stderr, /group "nowhere" is not one of modding's groups/)
    section = readVersions(root).versions[0].sections[0]
    assert.equal(section.categories[0].group, undefined)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
