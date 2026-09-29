import type { MouseEvent } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { MapPage } from './pages/MapPage'
import { SiteHeader } from './site/SiteHeader'
import { LinkPage } from './link/LinkPage'
import { LINK_FEATURE_ENABLED } from './config'

function skipToMain(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  document.getElementById('main')?.focus()
}

export default function App() {
  // HashRouter, not BrowserRouter (T20, 2026-09-29): the map now lives at /map/
  // on the wiki's own domain, and the wiki's 404.html is the spa-github-pages
  // redirect trick built for the WIKI's own SPA - it rewrites an unknown path
  // into a query string for the wiki's index.html, not the map's. A path-based
  // deep link under /map/ would 404 for real. A hash fragment is never sent to
  // the server at all, so /map/#/link always resolves to the same static
  // map/index.html regardless of what follows the #, and it survives a future
  // domain change with no server-side configuration whatsoever.
  return (
    <HashRouter>
      <AuthProvider>
        {/* A plain "#main" jump would change the HashRouter's route to "main" and show
            "Page not found", so the link moves focus itself (T39: the site header now
            sits in front of the map, which makes this link worth having). */}
        <a href="#main" className="skip-link" onClick={skipToMain}>Skip to content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<MapPage />} />
            {LINK_FEATURE_ENABLED ? <Route path="/link" element={<LinkPage />} /> : null}
            <Route path="*" element={<p className="page-note">Page not found. <Link to="/">Back to the map</Link></p>} />
          </Routes>
        </main>
      </AuthProvider>
    </HashRouter>
  )
}
