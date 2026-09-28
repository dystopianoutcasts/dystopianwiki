/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  /** The project's publishable key. Legacy anon keys are disabled on this project. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_AURORA_SERVER_ID?: string
  /** Overrides tiles.json baseUrl, e.g. http://localhost:8000 while no host is chosen. */
  readonly VITE_AURORA_TILES_BASE_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
