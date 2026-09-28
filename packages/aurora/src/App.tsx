import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { SignInButtons } from './auth/SignInButtons'
import { MapPage } from './pages/MapPage'
import { LinkPage } from './link/LinkPage'

function Header() {
  const { user, loading, signOut } = useAuth()
  return (
    <header className="aurora-header">
      <Link to="/" className="brand">Aurora</Link>
      <nav aria-label="Main">
        <Link to="/">Map</Link>
        <Link to="/link">Link character</Link>
      </nav>
      <div className="account">
        {loading ? null : user ? (
          <>
            <span className="who">{user.email ?? 'Signed in'}</span>
            <button type="button" onClick={() => void signOut()}>Sign out</button>
          </>
        ) : (
          <SignInButtons />
        )}
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="*" element={<p className="page-note">Page not found. <Link to="/">Back to the map</Link></p>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
