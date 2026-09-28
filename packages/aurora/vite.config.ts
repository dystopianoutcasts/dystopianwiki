/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// envDir is the monorepo root, the same as packages/web, so both apps read one set of variables.
export default defineConfig({
  plugins: [react()],
  base: '/',
  envDir: '../../',
  build: {
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
