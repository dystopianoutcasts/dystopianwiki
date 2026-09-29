/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Publishable key for the aurora schema client (lib/aurora.ts). Preferred over the anon key there. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  /** Aurora server id; defaults to 'outcasts-main' when unset (lib/aurora.ts). */
  readonly VITE_AURORA_SERVER_ID?: string
  /** "true" shows the header's Log In / user menu. Unset (the default) hides it, as the January 2026 deploy did. */
  readonly VITE_ENABLE_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
