export interface AuroraConfig {
  supabaseUrl: string
  supabaseKey: string
  serverId: string
  tilesBaseUrl?: string
}

export const DEFAULT_SERVER_ID = 'outcasts-main'

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
    tilesBaseUrl: env.VITE_AURORA_TILES_BASE_URL?.trim() || undefined,
  }
}
