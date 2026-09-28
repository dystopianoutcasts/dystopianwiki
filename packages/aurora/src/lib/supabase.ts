import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { readConfig } from '../config'
import type { AuroraConfig } from '../config'

let cached: { config: AuroraConfig; client: SupabaseClient } | null = null

/**
 * One shared client. `aurora` is not the default schema, so it is set here once: without
 * it PostgREST looks in `public` and answers 404 "Could not find the table".
 */
export function getAurora(): { config: AuroraConfig; client: SupabaseClient } {
  if (!cached) {
    const config = readConfig(import.meta.env)
    // Typed with the default schema generic on purpose: every query in data/ names its own
    // table, and this keeps one client type across the app instead of a schema-specific one.
    const client = createClient(config.supabaseUrl, config.supabaseKey, {
      db: { schema: 'aurora' },
    }) as unknown as SupabaseClient
    cached = { config, client }
  }
  return cached
}
