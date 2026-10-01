/**
 * AuthButton - the account control at the top right of every page.
 *
 * Logged out: a generic avatar and a "Log in" link to /login?next=<current path>.
 * Logged in: the member's avatar, opening the account menu (UserMenu).
 */
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUrlFor } from '../../utils/loginNext'
import { UserMenu } from './UserMenu'
import '../../styles/components/auth-button.css'

export function AuthButton() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // Reserve the space so the header does not jump when the session resolves.
    return <div className="auth-button auth-button--loading" aria-hidden="true" />
  }

  if (user) {
    return <UserMenu user={user} />
  }

  return (
    <div className="auth-button">
      {/* Decorative: the "Log in" link beside it carries the meaning. */}
      <span className="auth-button__avatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
        </svg>
      </span>
      <Link to={loginUrlFor(location.pathname + location.search)} className="auth-button__login">
        Log in
      </Link>
    </div>
  )
}
