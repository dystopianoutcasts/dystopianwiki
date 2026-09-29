/**
 * Cached Supabase client for the `aurora` schema, used only by the read-only
 * "server right now" panel on the home page (components/landing/ServerNow.tsx).
 *
 * This is deliberately a second, separate client from lib/supabase.ts: that one
 * talks to the public wiki schema with VITE_SUPABASE_ANON_KEY, this one talks to
 * the aurora schema. The aurora Supabase project has legacy API keys disabled
 * (see packages/aurora/src/config.ts), so the publishable key is required there;
 * this client tries VITE_SUPABASE_PUBLISHABLE_KEY first and falls back to
 * VITE_SUPABASE_ANON_KEY in case the two wiki/aurora projects are actually the
 * same project sharing one key name.
 *
 * Source referenced: packages/aurora/src/config.ts (env var names, DEFAULT_SERVER_ID).
 *
 * Never throws at module load: a missing URL or key exports `auroraClient = null`
 * and useServerNow.ts surfaces an error state instead of crashing the home page.
 */
import { createClient } from '@supabase/supabase-js'

export const DEFAULT_AURORA_SERVER_ID = 'outcasts-main'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const AURORA_SERVER_ID = import.meta.env.VITE_AURORA_SERVER_ID?.trim() || DEFAULT_AURORA_SERVER_ID

/**
 * null when the URL or key is missing; callers must check before using it.
 * Left un-annotated so the schema-scoped ('aurora') type that createClient infers
 * from the `db.schema` option is preserved instead of widened to the default 'public'.
 */
export const auroraClient =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { db: { schema: 'aurora' } }) : null
