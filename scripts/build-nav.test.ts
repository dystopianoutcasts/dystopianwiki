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
