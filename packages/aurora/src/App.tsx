import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { MapPage } from './pages/MapPage'
import { LinkPage } from './link/LinkPage'
import { LINK_FEATURE_ENABLED } from './config'

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
        <a href="#main" className="skip-link">Skip to content</a>
        <main id="main">
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
