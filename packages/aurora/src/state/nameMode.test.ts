import { describe, expect, it } from 'vitest'
import { DEFAULT_NAME_MODE, loadNameMode, saveNameMode } from './nameMode'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v
    },
  }
}

describe('name mode persisted in storage', () => {
  it('starts from the default (character) when nothing is saved', () => {
    expect(loadNameMode(memoryStorage())).toBe('character')
    expect(DEFAULT_NAME_MODE).toBe('character')
  })

  it('round-trips a saved choice', () => {
    const s = memoryStorage()
    saveNameMode('account', s)
    expect(loadNameMode(s)).toBe('account')
    saveNameMode('character', s)
    expect(loadNameMode(s)).toBe('character')
  })

  it('ignores corrupt JSON and an unrecognised value', () => {
    expect(loadNameMode(memoryStorage({ 'aurora.nameMode.v1': '{not json' }))).toBe('character')
    expect(loadNameMode(memoryStorage({ 'aurora.nameMode.v1': '"nickname"' }))).toBe('character')
    expect(loadNameMode(memoryStorage({ 'aurora.nameMode.v1': '42' }))).toBe('character')
    expect(loadNameMode(memoryStorage({ 'aurora.nameMode.v1': 'null' }))).toBe('character')
  })

  it('works with no storage at all', () => {
    expect(loadNameMode(null)).toBe('character')
    expect(() => saveNameMode('account', null)).not.toThrow()
  })

  it('survives storage that throws', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('full')
      },
    }
    expect(loadNameMode(throwing)).toBe('character')
    expect(() => saveNameMode('account', throwing)).not.toThrow()
  })
})
