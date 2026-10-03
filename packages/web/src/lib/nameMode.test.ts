/**
 * Tests for lib/nameMode.ts (T62): the home page's Survivor name / Username choice,
 * shared with the live map through one localStorage key.
 *
 * node:test, run with `npx tsx --test src/lib/nameMode.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  chooseNameMode,
  DEFAULT_NAME_MODE,
  loadNameMode,
  NAME_MODE_STORAGE_KEY,
  saveNameMode,
  shownName,
  type NameMode,
  type StorageLike,
} from './nameMode'

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) }
}

const blocked: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('SecurityError')
  },
}

test('the map and the home page share the key, the two modes and the default', () => {
  const map = readFileSync(new URL('../../../aurora/src/state/nameMode.ts', import.meta.url), 'utf8')
  assert.ok(map.includes(`const STORAGE_KEY = '${NAME_MODE_STORAGE_KEY}'`), 'map key differs from ' + NAME_MODE_STORAGE_KEY)
  assert.ok(map.includes("export type NameMode = 'character' | 'account'"), 'map mode names differ')
  assert.ok(map.includes(`DEFAULT_NAME_MODE: NameMode = '${DEFAULT_NAME_MODE}'`), 'map default differs')
  assert.ok(map.includes('JSON.stringify(mode)') && map.includes('JSON.parse(raw)'), 'map stores the value differently')
  assert.equal(NAME_MODE_STORAGE_KEY, 'aurora.nameMode.v1')
})

test('default is the survivor name', () => {
  assert.equal(DEFAULT_NAME_MODE, 'character')
  assert.equal(loadNameMode(memory()), 'character')
  assert.equal(loadNameMode(null), 'character')
})

test('a click saves: after a reload the choice is still there, stored as the map stores it', () => {
  const storage = memory()
  const applied: NameMode[] = []
  chooseNameMode('account', (m) => applied.push(m), storage)
  assert.deepEqual(applied, ['account'])
  assert.equal(storage.data.get('aurora.nameMode.v1'), '"account"')
  assert.equal(loadNameMode(storage), 'account')
  chooseNameMode('character', () => {}, storage)
  assert.equal(loadNameMode(storage), 'character')
})

test('a choice saved by the map is read back here', () => {
  const storage = memory()
  storage.setItem('aurora.nameMode.v1', JSON.stringify('account'))
  assert.equal(loadNameMode(storage), 'account')
})

test('blocked or corrupt storage falls back to the default and never throws', () => {
  assert.equal(loadNameMode(blocked), 'character')
  assert.doesNotThrow(() => saveNameMode('account', blocked))
  const applied: NameMode[] = []
  assert.doesNotThrow(() => chooseNameMode('account', (m) => applied.push(m), blocked))
  assert.deepEqual(applied, ['account'])
  const junk = memory()
  junk.setItem('aurora.nameMode.v1', 'not json')
  assert.equal(loadNameMode(junk), 'character')
  junk.setItem('aurora.nameMode.v1', '"somebody"')
  assert.equal(loadNameMode(junk), 'character')
})

test('a localStorage whose getter throws (blocked site data) still loads the default', () => {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError')
    },
  })
  try {
    assert.equal(loadNameMode(), 'character')
    assert.doesNotThrow(() => saveNameMode('account'))
  } finally {
    if (desc) Object.defineProperty(globalThis, 'localStorage', desc)
    else delete (globalThis as { localStorage?: unknown }).localStorage
  }
})

test('shownName: survivor name falls back to the username; username mode is always the username', () => {
  assert.equal(shownName({ username: 'rax', displayName: 'fisher man' }, 'character'), 'fisher man')
  assert.equal(shownName({ username: 'rax', displayName: 'fisher man' }, 'account'), 'rax')
  assert.equal(shownName({ username: 'rax', displayName: null }, 'character'), 'rax')
  assert.equal(shownName({ username: 'rax', displayName: '' }, 'character'), 'rax')
})
