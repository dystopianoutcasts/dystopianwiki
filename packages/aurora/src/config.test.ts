import { describe, expect, it } from 'vitest'
import { INGEST_INTERVAL_MS, SLOW_POLL_MS, VERY_SLOW_POLL_MS } from './config'

describe('poll intervals derive from the ingest cadence', () => {
  it('matches the pg_cron schedule (one batch a minute)', () => {
    expect(INGEST_INTERVAL_MS).toBe(60_000)
  })

  it('safehouses poll at 5x the ingest interval', () => {
    expect(SLOW_POLL_MS).toBe(5 * INGEST_INTERVAL_MS)
    expect(SLOW_POLL_MS).toBe(300_000)
  })

  it('zones and map objects poll at 10x the ingest interval', () => {
    expect(VERY_SLOW_POLL_MS).toBe(10 * INGEST_INTERVAL_MS)
    expect(VERY_SLOW_POLL_MS).toBe(600_000)
  })
})
