/**
 * ConnectDiscord - links a Discord identity to the signed-in member.
 *
 * Shows the connected Discord username once linked, otherwise a "Connect Discord" button
 * (Supabase identity linking). Used on /settings and reusable on the vote page.
 * linkIdentity needs "manual linking" enabled in the Supabase Auth settings.
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/supabase'
import { getDiscordUsername, hasDiscordIdentity } from '../../utils/memberProfile'
import '../../styles/components/connect-discord.css'

interface ConnectDiscordProps {
  /** Same-site path to come back to after Discord. Defaults to the current page. */
  returnPath?: string
}

export function ConnectDiscord({ returnPath }: ConnectDiscordProps) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  if (hasDiscordIdentity(user)) {
    const username = getDiscordUsername(user)
    return (
      <p className="connect-discord connect-discord--linked">
        Discord connected{username ? <>: <strong>{username}</strong></> : null}
      </p>
    )
  }

  const handleConnect = async () => {
    setBusy(true)
    setError(null)
    try {
      const path = returnPath ?? window.location.pathname + window.location.search
      const { error: linkError } = await api.getClient().auth.linkIdentity({
        provider: 'discord',
        options: { redirectTo: `${window.location.origin}${path}` },
      })
      if (linkError) throw linkError
      // On success the browser is sent to Discord; nothing more to do here.
    } catch {
      setError('We could not connect Discord right now. Please try again in a moment.')
      setBusy(false)
    }
  }

  return (
    <div className="connect-discord">
      <button type="button" className="connect-discord__button" onClick={handleConnect} disabled={busy}>
        {busy ? 'Opening Discord...' : 'Connect Discord'}
      </button>
      {error && (
        <p className="connect-discord__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
