import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYERS, loadLayerPrefs, saveLayerPrefs } from './layerPrefs'

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

describe('layer toggles persisted in storage', () => {
  it('starts from the defaults when nothing is saved', () => {
    expect(loadLayerPrefs(memoryStorage())).toEqual(DEFAULT_LAYERS)
  })

  it('round-trips a saved choice', () => {
    const s = memoryStorage()
    const chosen = { ...DEFAULT_LAYERS, zombieHeat: true, players: false }
    saveLayerPrefs(chosen, s)
    expect(loadLayerPrefs(s)).toEqual(chosen)
  })

  it('ignores corrupt JSON, wrong types and unknown keys', () => {
    expect(loadLayerPrefs(memoryStorage({ 'aurora.layers.v1': '{not json' }))).toEqual(DEFAULT_LAYERS)
    expect(loadLayerPrefs(memoryStorage({ 'aurora.layers.v1': '42' }))).toEqual(DEFAULT_LAYERS)
    const mixed = memoryStorage({ 'aurora.layers.v1': JSON.stringify({ players: 'yes', zones: true, bogus: true }) })
    expect(loadLayerPrefs(mixed)).toEqual({ ...DEFAULT_LAYERS, zones: true })
  })

  it('works with no storage at all', () => {
    expect(loadLayerPrefs(null)).toEqual(DEFAULT_LAYERS)
    expect(() => saveLayerPrefs(DEFAULT_LAYERS, null)).not.toThrow()
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
    expect(loadLayerPrefs(throwing)).toEqual(DEFAULT_LAYERS)
    expect(() => saveLayerPrefs(DEFAULT_LAYERS, throwing)).not.toThrow()
  })
})
