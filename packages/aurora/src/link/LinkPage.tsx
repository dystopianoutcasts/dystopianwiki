import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getAurora } from '../lib/supabase'
import { createLinkCode, fetchMyLinkCodes } from '../data/queries'
import { useDataset } from '../data/useDataset'
import { describeAge } from '../layers/transform'
import { SignInButtons } from '../auth/SignInButtons'
import type { LinkCode } from '../data/types'

/** Codes expire 30 minutes after creation (aurora.consume_link_code). */
const CODE_TTL_MIN = 30

function codeState(c: LinkCode, now: number): string {
  if (c.consumed_at) return c.username ? `used for ${c.username}` : 'used'
  return now - Date.parse(c.created_at) > CODE_TTL_MIN * 60_000 ? 'expired' : 'not used yet'
}

export function LinkPage() {
  const { client } = getAurora()
  const { user, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fresh, setFresh] = useState<LinkCode | null>(null)
  const recent = useDataset(user !== null, () => fetchMyLinkCodes(client), null)

  if (loading) return <p className="page-note" role="status">Loading...</p>

  if (!user) {
    return (
      <div className="page">
        <h1>Link your character</h1>
        <p>Sign in first. Linking lets the map show your own character live instead of delayed.</p>
        <SignInButtons />
      </div>
    )
  }

  const generate = async () => {
    setBusy(true)
    setError(null)
    try {
      const code = await createLinkCode(client, user.id)
      setFresh(code)
      recent.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const now = Date.now()
  return (
    <div className="page">
      <h1>Link your character</h1>
      <p>
        Make a code here, then in the game open the Aurora panel and enter it. Each code works once and expires {CODE_TTL_MIN} minutes
        after it is made.
      </p>
      <button type="button" className="primary" onClick={() => void generate()} disabled={busy}>
        {busy ? 'Making code...' : 'Make a link code'}
      </button>
      {error ? <p className="note error" role="alert">{error}</p> : null}
      {fresh ? (
        <div className="code-box" role="status" aria-live="polite">
          <span className="code-label">Your code</span>
          <strong className="code" aria-label={`Link code ${fresh.code.split('').join(' ')}`}>{fresh.code}</strong>
        </div>
      ) : null}
      {recent.data.length > 0 ? (
        <section aria-labelledby="codes-h">
          <h2 id="codes-h">Recent codes</h2>
          <ul className="codes">
            {recent.data.map((c) => (
              <li key={c.code}>
                <span className="code-small">{c.code}</span>
                <span className="meta">{describeAge(c.created_at, now)} - {codeState(c, now)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
