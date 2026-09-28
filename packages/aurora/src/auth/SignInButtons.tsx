import { useState } from 'react'
import { useAuth } from './AuthContext'
import type { OAuthProvider } from './AuthContext'

const PROVIDERS: { id: OAuthProvider; label: string }[] = [
  { id: 'discord', label: 'Sign in with Discord' },
  { id: 'google', label: 'Sign in with Google' },
]

export function SignInButtons() {
  const { signInWithOAuth } = useAuth()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="signin">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => {
            setError(null)
            signInWithOAuth(p.id).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
          }}
        >
          {p.label}
        </button>
      ))}
      {error ? <p className="note error" role="alert">{error}</p> : null}
    </div>
  )
}
