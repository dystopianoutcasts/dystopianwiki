import { describe, expect, it } from 'vitest'
import { appendSample, describeTick, isStale, memoryPercent } from './health'
import type { HealthSample } from './types'

function sample(t: string, over: Partial<HealthSample> = {}): HealthSample {
  return {
    server_id: 's', t, players: 1, zombies_total: null, zombies_loaded: null, zombies_simulated: null,
    tick_ms: 104, tick_min_ms: 98, tick_max_ms: 131, memory_used: null, memory_max: null, ...over,
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

describe('memoryPercent and staleness', () => {
  it('rounds and refuses to divide by nothing', () => {
    expect(memoryPercent(sample('2026-09-28T11:00:00Z', { memory_used: 1826, memory_max: 6442 }))).toBe(28)
    expect(memoryPercent(sample('2026-09-28T11:00:00Z', { memory_used: 5, memory_max: 0 }))).toBeNull()
    expect(memoryPercent(sample('2026-09-28T11:00:00Z'))).toBeNull()
  })

  it('a sample older than three minutes is stale (T22 Part D item 3)', () => {
    expect(isStale(sample('2026-09-28T11:58:00Z'), now)).toBe(false)
    expect(isStale(sample('2026-09-28T11:56:00Z'), now)).toBe(true)
  })
})

describe('describeTick', () => {
  it('shows the cycle time with the one-second min and max when all three are present', () => {
    expect(describeTick(sample('2026-09-28T11:00:00Z'))).toBe('104 ms (98 to 131)')
  })

  it('shows only the cycle time when either bound is missing', () => {
    expect(describeTick(sample('2026-09-28T11:00:00Z', { tick_min_ms: null }))).toBe('104 ms')
    expect(describeTick(sample('2026-09-28T11:00:00Z', { tick_max_ms: null }))).toBe('104 ms')
  })

  it('is a dash when no tick was reported, even if bounds are present', () => {
    expect(describeTick(sample('2026-09-28T11:00:00Z', { tick_ms: null }))).toBe('-')
  })

  it('keeps one decimal for fractional readings', () => {
    expect(describeTick(sample('2026-09-28T11:00:00Z', { tick_ms: 104.25, tick_min_ms: 97.5, tick_max_ms: 131 }))).toBe('104.3 ms (97.5 to 131)')
  })
})
