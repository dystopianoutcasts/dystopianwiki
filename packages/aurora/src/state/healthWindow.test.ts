import { describe, expect, it } from 'vitest'
import { DEFAULT_HEALTH_WINDOW, HEALTH_WINDOW_OPTIONS, loadHealthWindow, saveHealthWindow } from './healthWindow'

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

describe('health window persisted in storage', () => {
  it('starts from the default (1 h) when nothing is saved', () => {
    expect(loadHealthWindow(memoryStorage())).toBe(DEFAULT_HEALTH_WINDOW)
    expect(DEFAULT_HEALTH_WINDOW).toBe(60)
  })

  it('offers exactly 10 min / 1 h / 6 h', () => {
    expect(HEALTH_WINDOW_OPTIONS).toEqual([10, 60, 360])
  })

  it('round-trips each saved choice', () => {
    for (const minutes of HEALTH_WINDOW_OPTIONS) {
      const s = memoryStorage()
      saveHealthWindow(minutes, s)
      expect(loadHealthWindow(s)).toBe(minutes)
    }
  })

  it('falls back to the default for a value that is not one of the three options', () => {
    expect(loadHealthWindow(memoryStorage({ 'aurora.health-window.v1': '45' }))).toBe(DEFAULT_HEALTH_WINDOW)
    expect(loadHealthWindow(memoryStorage({ 'aurora.health-window.v1': 'not a number' }))).toBe(DEFAULT_HEALTH_WINDOW)
  })

  it('works with no storage at all', () => {
    expect(loadHealthWindow(null)).toBe(DEFAULT_HEALTH_WINDOW)
    expect(() => saveHealthWindow(10, null)).not.toThrow()
  })

  it('survives storage that throws (the page must still work)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('full')
      },
    }
    expect(loadHealthWindow(throwing)).toBe(DEFAULT_HEALTH_WINDOW)
    expect(() => saveHealthWindow(360, throwing)).not.toThrow()
  })
})
