// The account control in the map's site header. The wiki and the map share one login
// session (same origin, same Supabase project, same default storage key), so sign-in
// happens on the wiki's /login page and the map only reflects it.
//
// Signed out: a generic avatar and a "Log in" link to /login?next=/map/. Signed in: the
// member's avatar, their name, and "Sign out" (which signs out of the shared session).
// Loading renders nothing, same as before. The old "Admin sign in" dialog is no longer
// opened from here.
import { useState } from 'react'
import { useAuth } from './AuthContext'

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function memberName(meta: Record<string, unknown>, email: string | undefined): string {
  const claims = typeof meta.custom_claims === 'object' && meta.custom_claims !== null
    ? (meta.custom_claims as Record<string, unknown>)
    : {}
  return (
    str(claims.global_name) ?? str(meta.full_name) ?? str(meta.name) ?? str(meta.user_name) ??
    email?.split('@')[0] ?? 'Member'
  )
}

function GenericAvatar() {
  return (
    <span className="account__avatar account__avatar--generic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
      </svg>
    </span>
  )
}

export function AccountControl() {
  const { user, loading, signOut } = useAuth()
  // A dead avatar URL falls back to the initial instead of a broken image.
  const [avatarFailed, setAvatarFailed] = useState(false)

  if (loading) return null

  if (user) {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const name = memberName(meta, user.email)
    const avatar = str(meta.avatar_url) ?? str(meta.picture)
    return (
      <div className="account">
        {avatar && !avatarFailed && /^https:\/\//i.test(avatar) ? (
          <img
            className="account__avatar"
            src={avatar}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span className="account__avatar account__avatar--initial" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="who">{name}</span>
        <button type="button" onClick={() => void signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div className="account">
      <GenericAvatar />
      <a className="account__login" href="/login?next=/map/">Log in</a>
    </div>
  )
}
