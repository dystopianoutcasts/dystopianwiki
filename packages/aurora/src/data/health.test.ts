import { describe, expect, it } from 'vitest'
import { appendSample, isStale, memoryPercent, newest } from './health'
import type { HealthSample } from './types'

function sample(t: string, over: Partial<HealthSample> = {}): HealthSample {
  return {
    server_id: 's', t, players: 1, zombies_total: null, zombies_loaded: null, zombies_simulated: null,
    avg_update_period_ms: 5, memory_used: null, memory_max: null, ...over,
  }
}
const now = Date.parse('2026-09-28T12:00:00Z')

describe('appendSample keeps a sliding window', () => {
  it('appends a new sample in time order', () => {
    const out = appendSample([sample('2026-09-28T11:58:00Z')], sample('2026-09-28T11:59:00Z'), 60, now)
    expect(out.map((s) => s.t)).toEqual(['2026-09-28T11:58:00Z', '2026-09-28T11:59:00Z'])
  })

  it('replaces a sample with the same timestamp rather than duplicating it', () => {
    const out = appendSample([sample('2026-09-28T11:58:00Z', { players: 1 })], sample('2026-09-28T11:58:00Z', { players: 4 }), 60, now)
    expect(out).toHaveLength(1)
    expect(out[0].players).toBe(4)
  })

  it('drops samples older than the window', () => {
    const out = appendSample([sample('2026-09-28T10:30:00Z')], sample('2026-09-28T11:59:00Z'), 60, now)
    expect(out.map((s) => s.t)).toEqual(['2026-09-28T11:59:00Z'])
  })

  it('sorts an out-of-order arrival', () => {
    const out = appendSample([sample('2026-09-28T11:59:00Z')], sample('2026-09-28T11:57:00Z'), 60, now)
    expect(out.map((s) => s.t)).toEqual(['2026-09-28T11:57:00Z', '2026-09-28T11:59:00Z'])
  })
})

describe('newest', () => {
  it('picks the later sample and handles nulls', () => {
    const a = sample('2026-09-28T11:00:00Z')
    const b = sample('2026-09-28T11:30:00Z')
    expect(newest(a, b)).toBe(b)
    expect(newest(b, a)).toBe(b)
    expect(newest(null, a)).toBe(a)
    expect(newest(a, null)).toBe(a)
    expect(newest(null, null)).toBeNull()
  })
})

describe('memoryPercent and staleness', () => {
  it('rounds and refuses to divide by nothing', () => {
    expect(memoryPercent(sample('2026-09-28T11:00:00Z', { memory_used: 1826, memory_max: 6442 }))).toBe(28)
    expect(memoryPercent(sample('2026-09-28T11:00:00Z', { memory_used: 5, memory_max: 0 }))).toBeNull()
    expect(memoryPercent(sample('2026-09-28T11:00:00Z'))).toBeNull()
  })

  it('a sample older than five minutes is stale', () => {
    expect(isStale(sample('2026-09-28T11:56:00Z'), now)).toBe(false)
    expect(isStale(sample('2026-09-28T11:54:00Z'), now)).toBe(true)
  })
})
