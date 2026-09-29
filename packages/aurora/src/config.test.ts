import { describe, expect, it } from 'vitest'
import { DEFAULT_TILES_BASE_URL, INGEST_INTERVAL_MS, readConfig, SLOW_POLL_MS, VERY_SLOW_POLL_MS } from './config'

const REQUIRED_ENV = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
}

describe('readConfig tiles base URL (T20: one site, map at /map/)', () => {
  it('defaults to a relative /map/tiles path when unset', () => {
    expect(readConfig(REQUIRED_ENV).tilesBaseUrl).toBe('/map/tiles')
  })

  it('the default carries no scheme or host, so a domain change needs no code edit', () => {
    expect(DEFAULT_TILES_BASE_URL).not.toMatch(/^https?:\/\//)
    expect(DEFAULT_TILES_BASE_URL).not.toContain('dystopianoutcasts')
  })

  it('an explicit VITE_AURORA_TILES_BASE_URL still overrides the default', () => {
    const cfg = readConfig({ ...REQUIRED_ENV, VITE_AURORA_TILES_BASE_URL: 'https://example.test/tiles' })
    expect(cfg.tilesBaseUrl).toBe('https://example.test/tiles')
  })

  it('a blank override falls back to the default rather than an empty base', () => {
    const cfg = readConfig({ ...REQUIRED_ENV, VITE_AURORA_TILES_BASE_URL: '   ' })
    expect(cfg.tilesBaseUrl).toBe('/map/tiles')
  })
})

describe('readConfig required Supabase values', () => {
  it('throws when the URL is missing', () => {
    expect(() => readConfig({ VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' })).toThrow(/VITE_SUPABASE_URL/)
  })

  it('throws when the publishable key is missing', () => {
    expect(() => readConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co' })).toThrow(/VITE_SUPABASE_PUBLISHABLE_KEY/)
  })
})

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
