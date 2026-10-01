/**
 * LoginPage - one page, two modes. /login is the default, /register opens register mode.
 *
 * Both modes call the same OAuth sign-in: with Discord and Google the first login creates
 * the account, so someone who presses "Log in" without an account is simply registered.
 * Returns the member to `?next=` (same-site paths only), or the home page.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { SEOHead } from '../components/seo/SEOHead'
import { useAuth } from '../context/AuthContext'
import { safeNext } from '../utils/safeNext'
import { goTo, takeRememberedNext } from '../utils/loginNext'
import '../styles/pages/login.css'

type Mode = 'login' | 'register'

interface LoginPageProps {
  mode?: Mode
}

const COPY = {
  login: {
    heading: 'Log in',
    verb: 'Log in',
    switchText: "Don't have an account?",
    switchLink: 'Register',
    switchTo: '/register',
  },
  register: {
    heading: 'Create your account',
    verb: 'Register',
    switchText: 'Already have an account?',
    switchLink: 'Log in',
    switchTo: '/login',
  },
} as const

export function LoginPage({ mode = 'login' }: LoginPageProps) {
  const { user, loading, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  const copy = COPY[mode]
  // Re-validated here: the value came back through a URL we do not control.
  const next = safeNext(params.get('next'))

  // A provider that refuses or fails returns here with an error in the URL.
  const providerFailed =
    params.has('error') || params.has('error_description') || /[#&]error(_description)?=/.test(location.hash)

  // Already logged in (or just returned from the provider): send them on at once.
  useEffect(() => {
    if (loading || !user) return
    const remembered = takeRememberedNext()
    goTo(next ?? remembered ?? '/', navigate)
  }, [loading, user, next, navigate])

  // Move focus to the heading when the mode switches, so a keyboard or screen reader user
  // lands on the new content. Not on first load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [mode])

  const handleProvider = async (provider: 'discord' | 'google') => {
    setError(null)
    setBusy(true)
    try {
      await signInWithOAuth(provider, next)
      // The browser is now on its way to the provider.
    } catch {
      setError('We could not start the sign-in. Please try again in a moment.')
      setBusy(false)
    }
  }

  const switchUrl = `${copy.switchTo}${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <Layout>
      <SEOHead
        title={copy.heading}
        description="Log in or register for a Dystopian Outcasts account with Discord or Google."
        noIndex={true}
      />
      <main className="login-page">
        <div className="login-page__card">
          <h1 className="login-page__title" ref={headingRef} tabIndex={-1}>
            {copy.heading}
          </h1>

          {user ? (
            <p className="login-page__status" role="status">
              You are logged in. Taking you on...
            </p>
          ) : (
            <>
              {mode === 'register' && (
                <div className="login-page__about">
                  <p>
                    Members can vote for the community mascot now, and more member features will
                    arrive as the site grows.
                  </p>
                  <p>
                    We keep your email address and, for Discord, your username, id and avatar.
                  </p>
                </div>
              )}

              {(providerFailed || error) && (
                <p className="login-page__error" role="alert">
                  {error ?? 'The sign-in did not complete. Please try again.'}
                </p>
              )}

              <div className="login-page__buttons">
                <button
                  type="button"
                  className="login-page__provider login-page__provider--discord"
                  onClick={() => void handleProvider('discord')}
                  disabled={busy}
                >
                  {copy.verb} with Discord
                </button>
                <button
                  type="button"
                  className="login-page__provider login-page__provider--google"
                  onClick={() => void handleProvider('google')}
                  disabled={busy}
                >
                  {copy.verb} with Google
                </button>
              </div>

              <p className="login-page__switch">
                {copy.switchText}{' '}
                <Link to={switchUrl} className="login-page__switch-link">
                  {copy.switchLink}
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </Layout>
  )
}
