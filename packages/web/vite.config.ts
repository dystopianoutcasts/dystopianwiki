import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Dev-only: serve the repo-root map/ folder (the separately built Aurora map
// app) at /map/, so the home page map and the Map link work under `vite`.
// apply: 'serve' keeps it out of `vite build` and `vite preview`; production
// serves map/ from the repo root on GitHub Pages as before.
const MAP_ROOT = fileURLToPath(new URL('../../map/', import.meta.url))
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pbf': 'application/x-protobuf',
}

function serveRepoMap(): Plugin {
  return {
    name: 'dev-serve-repo-map',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (url === '/map' || url.startsWith('/map?')) {
          res.statusCode = 301
          res.setHeader('Location', '/map/' + url.slice(4))
          res.end()
          return
        }
        if (!url.startsWith('/map/')) return next()
        let rel: string
        try {
          rel = decodeURIComponent(url.slice('/map/'.length).split('?')[0])
        } catch {
          return next()
        }
        const root = path.resolve(MAP_ROOT)
        let file = path.resolve(root, rel)
        if (file !== root && !file.startsWith(root + path.sep)) return next()
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
          // A missing file (a tile past the edge, say) is a 404; an extensionless
          // path is a route inside the map app and falls back to its index.
          if (path.extname(file) !== '') {
            res.statusCode = 404
            res.end()
            return
          }
          file = path.join(root, 'index.html')
          if (!fs.existsSync(file)) return next()
        }
        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveRepoMap()],
  // Use '/' for custom domain, or '/repo-name/' for GitHub Pages subdirectory
  base: '/',
  // Load .env from monorepo root
  envDir: '../../',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
    },
  },
})
