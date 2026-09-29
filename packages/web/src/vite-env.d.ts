/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Publishable key for the aurora schema client (lib/aurora.ts). Preferred over the anon key there. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  /** Aurora server id; defaults to 'outcasts-main' when unset (lib/aurora.ts). */
  readonly VITE_AURORA_SERVER_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
