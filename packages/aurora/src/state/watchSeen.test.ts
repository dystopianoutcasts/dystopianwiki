// T72: the announced-cars store, per account, guarded like layerPrefs.
import { describe, expect, it } from 'vitest'
import { SEEN_CAP, SEEN_STORAGE_KEY, loadSeen, saveSeen } from './watchSeen'

function memoryStorage(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial }
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v
    },
  }
}

describe('T72: aurora.watch.seen.v1', () => {
  it('round-trips one account and keeps the others', () => {
    const s = memoryStorage({ [SEEN_STORAGE_KEY]: JSON.stringify({ other: ['q9'] }) })
    saveSeen('me', new Set(['q1', 'q2']), s)
    expect([...loadSeen('me', s)]).toEqual(['q1', 'q2'])
    expect([...loadSeen('other', s)]).toEqual(['q9'])
    expect(JSON.parse(s.data[SEEN_STORAGE_KEY])).toEqual({ other: ['q9'], me: ['q1', 'q2'] })
  })

  it('corrupt JSON, a wrong shape or junk entries read as empty, never throw', () => {
    expect(loadSeen('me', memoryStorage({ [SEEN_STORAGE_KEY]: '{not json' })).size).toBe(0)
    expect(loadSeen('me', memoryStorage({ [SEEN_STORAGE_KEY]: '[1,2]' })).size).toBe(0)
    expect([...loadSeen('me', memoryStorage({ [SEEN_STORAGE_KEY]: JSON.stringify({ me: ['q1', 5, null] }) }))]).toEqual(['q1'])
    expect(loadSeen('me', memoryStorage({ [SEEN_STORAGE_KEY]: JSON.stringify({ me: 'q1' }) })).size).toBe(0)
  })

  it('a quota error or blocked storage is swallowed', () => {
    const full = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(() => saveSeen('me', new Set(['q1']), full)).not.toThrow()
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {},
    }
    expect(loadSeen('me', blocked).size).toBe(0)
    expect(loadSeen('me', null).size).toBe(0)
    expect(() => saveSeen('me', new Set(['q1']), null)).not.toThrow()
  })

  it(`keeps at most ${SEEN_CAP} keys per account, the newest`, () => {
    const s = memoryStorage()
    const keys = Array.from({ length: SEEN_CAP + 5 }, (_, i) => `q${i}`)
    saveSeen('me', new Set(keys), s)
    const saved = JSON.parse(s.data[SEEN_STORAGE_KEY]).me as string[]
    expect(saved).toHaveLength(SEEN_CAP)
    expect(saved[0]).toBe('q5')
    expect(saved.at(-1)).toBe(`q${SEEN_CAP + 4}`)
  })
})
