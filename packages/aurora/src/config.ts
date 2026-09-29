export interface AuroraConfig {
  supabaseUrl: string
  supabaseKey: string
  serverId: string
  tilesBaseUrl: string
}

export const DEFAULT_SERVER_ID = 'outcasts-main'

/** Owner decision 2026-09-29 (T21): the link-character feature is dormant; nothing about it renders. */
export const LINK_FEATURE_ENABLED = false

/**
 * T20 (2026-09-29): the map is served from /map/ on the wiki's own domain, and
 * the tile pyramid is committed alongside it at map/tiles. A relative default -
 * no scheme, no host - means the map keeps finding its tiles after a future
 * domain change with zero code or config edits; VITE_AURORA_TILES_BASE_URL still
 * overrides this for a one-off local render pointed elsewhere.
 */
export const DEFAULT_TILES_BASE_URL = '/map/tiles'

/**
 * The ingest writes one batch a minute (aurora.enable_ingest_cron's pg_cron schedule,
 * '* * * * *', supabase/migrations/012/015). Polling faster than this reads the same
 * rows again for no benefit, so every dataset's interval is a multiple of this one
 * constant: a later cron cadence change is then one edit here.
 */
export const INGEST_INTERVAL_MS = 60_000
/**
 * T23: each ingest run now holds its SFTP session for ~55 s and writes a batch every
 * 5 s, so positions, the roster, vehicles and health poll at this instead. Those polls
 * are incremental (data/live.ts) with a full fetch every INGEST_INTERVAL_MS, which
 * must stay a whole multiple of this.
 */
export const LIVE_POLL_MS = 10_000
/** Safehouses change rarely; polled at 5x the ingest interval. */
export const SLOW_POLL_MS = INGEST_INTERVAL_MS * 5
/** Zones and map objects change rarer still; polled at 10x the ingest interval. */
export const VERY_SLOW_POLL_MS = INGEST_INTERVAL_MS * 10

/** Pure so it can be tested; main code passes import.meta.env. */
export function readConfig(env: {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
  VITE_AURORA_SERVER_ID?: string
  VITE_AURORA_TILES_BASE_URL?: string
}): AuroraConfig {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. The project has legacy API keys disabled, ' +
        'so the publishable key is required; the old anon key will be rejected with a 401.',
    )
  }
  return {
    supabaseUrl,
    supabaseKey,
    serverId: env.VITE_AURORA_SERVER_ID?.trim() || DEFAULT_SERVER_ID,
    tilesBaseUrl: env.VITE_AURORA_TILES_BASE_URL?.trim() || DEFAULT_TILES_BASE_URL,
  }
}
