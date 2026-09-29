/// <reference types="vitest" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One website (T20, 2026-09-29): the map is served from /map/ on the wiki's own
// domain, not a subdomain of its own. The build therefore lands directly in the
// wiki repo's root map/ folder rather than this package's own dist/, so a plain
// `git push` of the wiki repo deploys both the wiki and the map together.
const repoRoot = fileURLToPath(new URL('../../', import.meta.url))

// envDir is the monorepo root, the same as packages/web, so both apps read one set of variables.
export default defineConfig({
  plugins: [react()],
  base: '/map/',
  envDir: '../../',
  build: {
    outDir: `${repoRoot}map`,
    // map/tiles/ is committed separately (scripts/tiles/publish-tiles.ts) and must
    // survive an app rebuild. Vite already leaves an outDir outside the project
    // root untouched by default, but this is stated explicitly rather than relied
    // on implicitly: delete map/assets/ yourself before each build instead (see
    // deploy.md), so a renamed or removed asset doesn't linger next to the new one.
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // Vendor code changes far less often than the app, so keep it in separately cached chunks.
        manualChunks: {
          leaflet: ['leaflet', 'leaflet.markercluster', 'leaflet.heat'],
          supabase: ['@supabase/supabase-js'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
