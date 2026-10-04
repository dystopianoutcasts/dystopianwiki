/**
 * AdminDashboardPage (/admin) - docs/planning/MascotVote/PLAN.md, Task 9.
 *
 * Not linked anywhere except the account menu, which shows "Admin dashboard" only to
 * admins. The page itself is a convenience: every section's data comes from database
 * functions that refuse anyone without the right flag (migrations 024 and 025).
 *
 * Sections: the live map link; members (superadmin only); the vote's controls; the
 * results so far (chart, round table); every ballot with a Counted checkbox.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { SEOHead } from '../components/seo/SEOHead'
import { MascotDialog } from '../components/mascot/MascotDialog'
import { ArtImage } from '../components/mascot/ArtImage'
import { RoundTable } from '../components/mascot/RoundTable'
import { BallotsTable, MembersTable, TilesTable, WorldsTable, formatWhen, nameOfMember } from '../components/admin/AdminTables'
import { useAuth } from '../context/AuthContext'
import { MASCOT_ENTRIES, getMascotEntry } from '../data/mascotEntries'
import { loginUrlFor } from '../utils/loginNext'
import { fetchElection, effectiveStatus, type Election, type ElectionStatus } from '../lib/mascotVote'
import { countRankedChoice, formatPercent, type CountResult } from '../lib/rankedChoice'
import {
  STATUS_MOVES,
  STATUS_TEXT,
  axisTicks,
  barsForRound,
  countedRankings,
  filterBallots,
  filterMembers,
  fromLocalInput,
  toLocalInput,
  type AdminBallot,
  type Member,
  type StatusMove,
} from '../lib/adminDashboard'
import {
  FAILURE_TEXT,
  fetchAdminBallots,
  fetchMembers,
  fetchRoles,
  setAdmin,
  setClosesAt,
  setCounted,
  setStatus,
  type ApiResult,
} from '../lib/adminApi'
import { AURORA_SERVER_ID } from '../lib/aurora'
import { worldsApi } from '../lib/worldsClient'
import { mapRebuildApi } from '../lib/mapRebuildClient'
import type { MapRebuildResult, RebuildRequest } from '../lib/mapRebuildApi'
import {
  MAP_MISSING_TEXT,
  classifyMaps,
  isOpen,
  parseTilesInfo,
  renderedLine,
  requestLine,
  requestPhase,
  type TilesInfo,
} from '../lib/mapPanel'
import type { Leftovers, World, WorldsResult } from '../lib/worldsApi'
import {
  MISSING_TEXT,
  canUndo,
  currentWorld,
  leftoversText,
  pendingText,
  statusLine,
  worldCountText,
} from '../lib/worldsPanel'
import '../styles/pages/mascot-vote.css'
import '../styles/pages/admin.css'
import '../styles/pages/admin-worlds.css'
import '../styles/pages/admin-map.css'

const ENTRY_IDS = MASCOT_ENTRIES.map((e) => e.id)

/** On the dashboard entries go by their file id (art_00N), as asked; the public page says "Entry N". */
const idOf = (id: string) => id

type Load<T> = { state: 'loading' } | { state: 'error'; text: string } | { state: 'ready'; value: T }

function toLoad<T>(r: ApiResult<T>): Load<T> {
  return r.ok ? { state: 'ready', value: r.value } : { state: 'error', text: FAILURE_TEXT[r.reason] }
}

// ---------------------------------------------------------------------------
// Page shell: who is looking
// ---------------------------------------------------------------------------

export function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const [roles, setRoles] = useState<{ admin: boolean; superadmin: boolean } | null>(null)
  const userId = user?.id ?? null

  useEffect(() => {
    setRoles(null)
    if (!userId) return
    let cancelled = false
    void fetchRoles().then((r) => {
      if (!cancelled) setRoles(r)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  let body: JSX.Element
  if (loading || (user && roles === null)) {
    body = (
      <p className="mascot-vote__loading" role="status">
        Checking your account...
      </p>
    )
  } else if (!user) {
    body = (
      <section className="mascot-vote__panel" aria-labelledby="ad-gate">
        <h2 id="ad-gate" className="mascot-vote__panel-title">
          Log in to continue
        </h2>
        <p>This page is for admins.</p>
        <Link className="mascot-vote__btn mascot-vote__btn--primary" to={loginUrlFor('/admin')}>
          Log in
        </Link>
      </section>
    )
  } else if (!roles?.admin) {
    body = (
      <section className="mascot-vote__panel" aria-labelledby="ad-gate">
        <h2 id="ad-gate" className="mascot-vote__panel-title">
          This page is for admins
        </h2>
        <p>
          You are logged in{user.email ? <> as {user.email}</> : null}, but this account is not an admin. If it should be,
          ask the owner to make it one.
        </p>
      </section>
    )
  } else {
    body = <Dashboard superadmin={roles.superadmin} selfId={user.id} />
  }

  return (
    <Layout>
      <SEOHead title="Admin dashboard" description="Dystopian Outcasts admin dashboard." noIndex={true} />
      <main className="mascot-vote admin">
        <div className="mascot-vote__intro">
          <h1 className="mascot-vote__title">Admin dashboard</h1>
        </div>
        {body}
      </main>
    </Layout>
  )
}

// ---------------------------------------------------------------------------
// The dashboard (admins only)
// ---------------------------------------------------------------------------

function Dashboard({ superadmin, selfId }: { superadmin: boolean; selfId: string }) {
  const [election, setElection] = useState<Load<Election | null>>({ state: 'loading' })
  const [ballots, setBallots] = useState<Load<AdminBallot[]>>({ state: 'loading' })
  const [key, setKey] = useState(0)
  const reload = useCallback(() => setKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    void fetchElection().then((r) => {
      if (cancelled) return
      setElection(r.ok ? { state: 'ready', value: r.value } : { state: 'error', text: FAILURE_TEXT[r.reason] })
    })
    void fetchAdminBallots().then((r) => {
      if (!cancelled) setBallots(toLoad(r))
    })
    return () => {
      cancelled = true
    }
  }, [key])

  return (
    <>
      <section className="mascot-vote__panel" aria-labelledby="ad-map">
        <h2 id="ad-map" className="mascot-vote__panel-title">
          Live map
        </h2>
        <p>The server map, with the admin panel for admins.</p>
        <a className="mascot-vote__btn mascot-vote__btn--secondary" href="/map/">
          Open the live map
        </a>
      </section>

      <WorldSection />

      <MapSection />

      {superadmin && <MembersSection selfId={selfId} />}

      {election.state === 'loading' && (
        <p className="mascot-vote__loading" role="status">
          Loading the mascot vote...
        </p>
      )}
      {election.state === 'error' && <ErrorPanel id="ad-vote-error" title="The mascot vote could not be loaded" text={election.text} onRetry={reload} />}
      {election.state === 'ready' && election.value === null && (
        <section className="mascot-vote__panel" aria-labelledby="ad-novote">
          <h2 id="ad-novote" className="mascot-vote__panel-title">
            Mascot vote
          </h2>
          <p>There is no election in the database yet. Apply migration 025.</p>
        </section>
      )}
      {election.state === 'ready' && election.value !== null && (
        <>
          <VoteControls election={election.value} onChanged={reload} />
          {ballots.state === 'loading' && (
            <p className="mascot-vote__loading" role="status">
              Loading the ballots...
            </p>
          )}
          {ballots.state === 'error' && <ErrorPanel id="ad-ballots-error" title="The ballots could not be loaded" text={ballots.text} onRetry={reload} />}
          {ballots.state === 'ready' && (
            <>
              <VoteResults election={election.value} ballots={ballots.value} />
              <BallotsSection election={election.value} ballots={ballots.value} onChanged={reload} />
            </>
          )}
        </>
      )}
    </>
  )
}

function ErrorPanel({ id, title, text, onRetry }: { id: string; title: string; text: string; onRetry: () => void }) {
  return (
    <section className="mascot-vote__panel" aria-labelledby={id}>
      <h2 id={id} className="mascot-vote__panel-title">
        {title}
      </h2>
      <p role="alert">{text}</p>
      <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={onRetry}>
        Try again
      </button>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Confirmation dialog
// ---------------------------------------------------------------------------

function Confirm({
  open,
  title,
  children,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  confirmLabel: string
  busy: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  const titleId = useId()
  return (
    <MascotDialog open={open} onClose={onCancel} labelledBy={titleId} locked={busy}>
      <h2 id={titleId} className="mascot-dialog__title">
        {title}
      </h2>
      {children}
      {error && (
        <p className="mascot-vote__notice" role="alert">
          {error}
        </p>
      )}
      {busy && (
        <p className="mascot-vote__hint" role="status">
          Saving...
        </p>
      )}
      <div className="mascot-dialog__actions">
        <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" disabled={busy} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </MascotDialog>
  )
}

/** Runs one change behind a confirmation; reports the database's refusal in the dialog. */
function useConfirmedAction<T>(run: (target: T) => Promise<ApiResult<null>>, onDone: () => void) {
  const [target, setTarget] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ask = (t: T) => {
    setError(null)
    setTarget(t)
  }
  const cancel = () => {
    if (!busy) setTarget(null)
  }
  const confirm = async () => {
    if (target === null) return
    setBusy(true)
    setError(null)
    const r = await run(target)
    setBusy(false)
    if (r.ok) {
      setTarget(null)
      onDone()
    } else {
      setError(FAILURE_TEXT[r.reason])
    }
  }
  return { target, busy, error, ask, cancel, confirm }
}

// ---------------------------------------------------------------------------
// Aurora world (T49)
// ---------------------------------------------------------------------------

type WorldLoad =
  | { state: 'loading' }
  | { state: 'unconfigured' }
  | { state: 'missing' }
  | { state: 'error'; text: string }
  | { state: 'ready'; worlds: World[]; leftovers: Leftovers | null }

function worldFailureText(r: Extract<WorldsResult<unknown>, { ok: false }>): string {
  if (r.reason === 'refused') return r.detail ?? 'The database refused that change. Reload the dashboard and try again.'
  if (r.reason === 'missing') return MISSING_TEXT
  return FAILURE_TEXT[r.reason]
}

/** Like useConfirmedAction, for the world functions: refusals show the server's own message. */
function useWorldAction<T>(run: (target: T) => Promise<WorldsResult<null>>, onDone: () => void) {
  const [target, setTarget] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ask = (t: T) => {
    setError(null)
    setTarget(t)
  }
  const cancel = () => {
    if (!busy) setTarget(null)
  }
  const confirm = async () => {
    if (target === null) return
    setBusy(true)
    setError(null)
    const r = await run(target)
    setBusy(false)
    if (r.ok) {
      setTarget(null)
      onDone()
    } else {
      setError(worldFailureText(r))
    }
  }
  return { target, busy, error, ask, cancel, confirm }
}

function WorldSection() {
  const [load, setLoad] = useState<WorldLoad>({ state: 'loading' })
  const [key, setKey] = useState(0)
  const [note, setNote] = useState('')
  const noteId = useId()
  const reload = useCallback(() => setKey((k) => k + 1), [])

  // One try per load (and one more after each action); a missing function is an answer, not a retry.
  useEffect(() => {
    let cancelled = false
    if (!worldsApi) {
      setLoad({ state: 'unconfigured' })
      return
    }
    const api = worldsApi
    void (async () => {
      const w = await api.fetchWorlds(AURORA_SERVER_ID)
      if (cancelled) return
      if (!w.ok) {
        setLoad(w.reason === 'missing' ? { state: 'missing' } : { state: 'error', text: worldFailureText(w) })
        return
      }
      const l = await api.fetchLeftovers(AURORA_SERVER_ID)
      if (cancelled) return
      if (!l.ok && l.reason === 'missing') {
        setLoad({ state: 'missing' })
        return
      }
      setLoad({ state: 'ready', worlds: w.value, leftovers: l.ok ? l.value : null })
    })()
    return () => {
      cancelled = true
    }
  }, [key])

  const start = useWorldAction<true>(
    () => worldsApi!.startNewWorld(AURORA_SERVER_ID, note.trim()),
    () => {
      setNote('')
      reload()
    },
  )
  const undo = useWorldAction<true>(() => worldsApi!.undoNewWorld(AURORA_SERVER_ID), reload)
  const confirmPending = useWorldAction<string>((id) => worldsApi!.confirmPendingWorld(AURORA_SERVER_ID, id), reload)
  const dismissPending = useWorldAction<string>((id) => worldsApi!.dismissPendingWorld(AURORA_SERVER_ID, id), reload)

  const ready = load.state === 'ready' ? load : null
  const current = ready ? currentWorld(ready.worlds) : null
  const pending = ready?.leftovers?.pending ?? null
  // Read once per render; the section reloads after every action, so this is current enough.
  const showUndo = canUndo(current, Date.now())

  return (
    <section className="mascot-vote__panel" aria-labelledby="ad-world">
      <h2 id="ad-world" className="mascot-vote__panel-title">
        Aurora world
      </h2>
      {load.state === 'loading' && <p role="status">Loading the world record...</p>}
      {load.state === 'unconfigured' && <p>Live data is not configured.</p>}
      {load.state === 'missing' && <p>{MISSING_TEXT}</p>}
      {load.state === 'error' && (
        <>
          <p role="alert">{load.text}</p>
          <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {ready && (
        <>
          <p>
            <strong>{current ? statusLine(current) : 'No current world is recorded yet.'}</strong>
          </p>
          <p className="mascot-vote__meta">{worldCountText(ready.worlds.length)}</p>

          {pending && (
            <div className="mascot-vote__notice" role="alert">
              <p>{pendingText(pending)}</p>
              <div className="admin__actions">
                <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={() => confirmPending.ask(pending.worldId)}>
                  Confirm new world
                </button>
                <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" onClick={() => dismissPending.ask(pending.worldId)}>
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <p>{ready.leftovers ? leftoversText(ready.leftovers) : 'Leftovers could not be read.'}</p>

          <div className="admin__actions">
            <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" onClick={() => start.ask(true)}>
              Start a new world
            </button>
            {showUndo && (
              <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" onClick={() => undo.ask(true)}>
                This was not a wipe
              </button>
            )}
          </div>

          <WorldsTable worlds={ready.worlds} labelledBy="ad-world" />
        </>
      )}

      <Confirm
        open={start.target !== null}
        title="Start a new world?"
        confirmLabel="Start a new world"
        busy={start.busy}
        error={start.error}
        onConfirm={() => void start.confirm()}
        onCancel={start.cancel}
      >
        <p>Use after a wipe the server did not detect. Public data switches to the new world at once; the old world stays as history.</p>
        <div className="admin__closing">
          <label htmlFor={noteId}>Note (optional)</label>
          <input id={noteId} type="text" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
        </div>
      </Confirm>
      <Confirm
        open={undo.target !== null}
        title="This was not a wipe?"
        confirmLabel="Restore the previous world"
        busy={undo.busy}
        error={undo.error}
        onConfirm={() => void undo.confirm()}
        onCancel={undo.cancel}
      >
        <p>This restores the previous world and hides the new one.</p>
      </Confirm>
      <Confirm
        open={confirmPending.target !== null}
        title="Confirm the new world?"
        confirmLabel="Confirm new world"
        busy={confirmPending.busy}
        error={confirmPending.error}
        onConfirm={() => void confirmPending.confirm()}
        onCancel={confirmPending.cancel}
      >
        <p>Public data switches to the new world at once; the old world stays as history.</p>
      </Confirm>
      <Confirm
        open={dismissPending.target !== null}
        title="Dismiss the pending world?"
        confirmLabel="Dismiss"
        busy={dismissPending.busy}
        error={dismissPending.error}
        onConfirm={() => void dismissPending.confirm()}
        onCancel={dismissPending.cancel}
      >
        <p>The current world stays as it is and the report is set aside.</p>
      </Confirm>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Live map tiles (T51)
// ---------------------------------------------------------------------------

type MapLoad =
  | { state: 'loading' }
  | { state: 'unconfigured' }
  | { state: 'missing' }
  | { state: 'error'; text: string }
  | { state: 'ready'; maps: string[]; tiles: TilesInfo | null; requests: RebuildRequest[]; now: number }

const MAP_REFRESH_MS = 30_000

function mapFailureText(r: Extract<MapRebuildResult<unknown>, { ok: false }>): string {
  if (r.reason === 'refused') return r.detail ?? 'The database refused that change. Reload the dashboard and try again.'
  if (r.reason === 'missing') return MAP_MISSING_TEXT
  return FAILURE_TEXT[r.reason]
}

/** The site's own tiles.json (same origin). null when it cannot be read; the panel then says so. */
async function fetchTilesInfo(): Promise<TilesInfo | null> {
  try {
    const res = await fetch('/map/tiles.json', { cache: 'no-store' })
    if (!res.ok) return null
    return parseTilesInfo(await res.json())
  } catch {
    return null
  }
}

function MapSection() {
  const [load, setLoad] = useState<MapLoad>({ state: 'loading' })
  const [key, setKey] = useState(0)
  const [rebuildOpen, setRebuildOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const reload = useCallback(() => setKey((k) => k + 1), [])

  // One try per load; the first load shows "loading", later ones keep the panel as it is.
  useEffect(() => {
    let cancelled = false
    if (!mapRebuildApi) {
      setLoad({ state: 'unconfigured' })
      return
    }
    const api = mapRebuildApi
    void (async () => {
      const [maps, requests, tiles] = await Promise.all([
        api.fetchServerMaps(AURORA_SERVER_ID),
        api.fetchRequests(AURORA_SERVER_ID, 5),
        fetchTilesInfo(),
      ])
      if (cancelled) return
      if (!requests.ok) {
        setLoad(requests.reason === 'missing' ? { state: 'missing' } : { state: 'error', text: mapFailureText(requests) })
        return
      }
      if (!maps.ok) {
        setLoad(maps.reason === 'missing' ? { state: 'missing' } : { state: 'error', text: mapFailureText(maps) })
        return
      }
      setLoad({ state: 'ready', maps: maps.value, tiles, requests: requests.value, now: Date.now() })
    })()
    return () => {
      cancelled = true
    }
  }, [key])

  const ready = load.state === 'ready' ? load : null
  const latest = ready?.requests[0] ?? null
  const open = isOpen(latest)

  // Refresh every 30 seconds while a request is queued or running.
  useEffect(() => {
    if (!open) return
    const timer = window.setInterval(reload, MAP_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [open, reload])

  const classified = ready ? classifyMaps(ready.maps, ready.tiles?.overlays ?? []) : null
  const phase = ready && latest ? requestPhase(latest, ready.now) : null

  const askRebuild = () => {
    setError(null)
    setRebuildOpen(true)
  }
  const confirmRebuild = async () => {
    if (!mapRebuildApi) return
    setBusy(true)
    setError(null)
    const r = await mapRebuildApi.requestRebuild(AURORA_SERVER_ID, '')
    setBusy(false)
    if (r.ok) {
      setRebuildOpen(false)
      reload()
    } else {
      setError(mapFailureText(r))
    }
  }
  const cancelRequest = async (id: number) => {
    if (!mapRebuildApi) return
    setCancelBusy(true)
    setCancelError(null)
    const r = await mapRebuildApi.cancelRebuild(id)
    setCancelBusy(false)
    if (!r.ok) setCancelError(mapFailureText(r))
    else if (!r.value) setCancelError('That request was already picked up by the render PC, so it could not be cancelled.')
    reload()
  }

  return (
    <section className="mascot-vote__panel" aria-labelledby="ad-tiles">
      <h2 id="ad-tiles" className="mascot-vote__panel-title">
        Live map tiles
      </h2>
      {load.state === 'loading' && <p role="status">Loading the map tiles...</p>}
      {load.state === 'unconfigured' && <p>Live data is not configured.</p>}
      {load.state === 'missing' && <p>{MAP_MISSING_TEXT}</p>}
      {load.state === 'error' && (
        <>
          <p role="alert">{load.text}</p>
          <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {ready && classified && (
        <>
          <p className="mascot-vote__meta">{renderedLine(ready.tiles?.renderedAt ?? null)}</p>
          {!ready.tiles && <p className="mascot-vote__notice">The tile list (tiles.json) could not be read, so tile status is unknown.</p>}

          {classified.rows.length === 0 ? (
            <p>The server has not reported its map list yet.</p>
          ) : (
            <TilesTable rows={classified.rows} tilesKnown={Boolean(ready.tiles)} labelledBy="ad-tiles" />
          )}
          {classified.hidden.length > 0 && (
            <p className="mascot-vote__meta">Hidden; tiles kept (the server no longer runs): {classified.hidden.join(', ')}</p>
          )}

          <div className="admin__actions">
            <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" disabled={open} onClick={askRebuild}>
              Rebuild map
            </button>
          </div>

          {latest && phase && (
            <div className="admin__maprequest" aria-live="polite">
              <p>
                <strong>{requestLine(latest, ready.now)}</strong>
              </p>
              {latest.status === 'queued' && (
                <div className="admin__actions">
                  <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={cancelBusy} onClick={() => void cancelRequest(latest.id)}>
                    Cancel
                  </button>
                </div>
              )}
              {cancelError && (
                <p className="mascot-vote__notice" role="alert">
                  {cancelError}
                </p>
              )}
              {(latest.status === 'running' || latest.status === 'failed') && latest.log && (
                <details className="admin__maplog">
                  <summary>{latest.status === 'running' ? 'Log so far' : 'Log'}</summary>
                  <pre>{latest.log}</pre>
                </details>
              )}
              {latest.status === 'failed' && (
                <div className="admin__actions">
                  <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" onClick={askRebuild}>
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Confirm
        open={rebuildOpen}
        title="Rebuild the map?"
        confirmLabel="Rebuild map"
        busy={busy}
        error={error}
        onConfirm={() => void confirmRebuild()}
        onCancel={() => {
          if (!busy) setRebuildOpen(false)
        }}
      >
        <p>The render PC rebuilds tiles for every map the server runs, publishes them and pushes. About 45 minutes when a new map needs rendering, a few minutes otherwise.</p>
      </Confirm>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Members (superadmin only)
// ---------------------------------------------------------------------------

function MembersSection({ selfId }: { selfId: string }) {
  const [members, setMembers] = useState<Load<Member[]>>({ state: 'loading' })
  const [key, setKey] = useState(0)
  const [query, setQuery] = useState('')
  const filterId = useId()

  useEffect(() => {
    let cancelled = false
    void fetchMembers().then((r) => {
      if (!cancelled) setMembers(toLoad(r))
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const action = useConfirmedAction<Member>((m) => setAdmin(m.userId, !m.isAdmin), () => setKey((k) => k + 1))
  const shown = members.state === 'ready' ? filterMembers(members.value, query) : []

  return (
    <section className="mascot-vote__panel" aria-labelledby="ad-members">
      <h2 id="ad-members" className="mascot-vote__panel-title">
        Members
      </h2>
      <p>Only you see this section. Admins can open this dashboard and the live map&apos;s admin panel.</p>
      {members.state === 'loading' && <p role="status">Loading members...</p>}
      {members.state === 'error' && (
        <>
          <p role="alert">{members.text}</p>
          <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={() => setKey((k) => k + 1)}>
            Try again
          </button>
        </>
      )}
      {members.state === 'ready' && (
        <>
          <div className="admin__filter">
            <label htmlFor={filterId}>Filter by Discord username or email</label>
            <input id={filterId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <p className="mascot-vote__meta" role="status">
            {shown.length} of {members.value.length} {members.value.length === 1 ? 'account' : 'accounts'}
          </p>
          <MembersTable members={shown} selfId={selfId} onAsk={action.ask} labelledBy="ad-members" />
        </>
      )}
      <Confirm
        open={action.target !== null}
        title={action.target?.isAdmin ? 'Remove admin?' : 'Make admin?'}
        confirmLabel={action.target?.isAdmin ? 'Remove admin' : 'Make admin'}
        busy={action.busy}
        error={action.error}
        onConfirm={() => void action.confirm()}
        onCancel={action.cancel}
      >
        {action.target && (
          <p>
            {action.target.isAdmin
              ? `${nameOfMember(action.target)} will lose this dashboard and the live map's admin panel straight away.`
              : `${nameOfMember(action.target)} will be able to open this dashboard, see every ballot with its Discord username, run the vote, and use the live map's admin panel.`}
          </p>
        )}
      </Confirm>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Vote controls
// ---------------------------------------------------------------------------

function VoteControls({ election, onChanged }: { election: Election; onChanged: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  // The button that was pressed may not exist after the change, so focus lands on the heading.
  const done = () => {
    onChanged()
    window.setTimeout(() => headingRef.current?.focus(), 0)
  }
  const move = useConfirmedAction<StatusMove>((m) => setStatus(m.to), done)
  const closing = useConfirmedAction<{ iso: string | null }>((t) => setClosesAt(t.iso), done)
  const [draft, setDraft] = useState(toLocalInput(election.closesAt))
  const [fieldError, setFieldError] = useState<string | null>(null)
  const inputId = useId()
  const hintId = useId()

  useEffect(() => setDraft(toLocalInput(election.closesAt)), [election.closesAt])

  const pastClosing = election.status === 'open' && effectiveStatus(election, Date.now()) === 'closed'

  const saveClosing = () => {
    const iso = fromLocalInput(draft)
    if (!iso) {
      setFieldError('Enter a date and time, or use "Remove closing time".')
      return
    }
    setFieldError(null)
    closing.ask({ iso })
  }

  return (
    <section className="mascot-vote__panel" aria-labelledby="ad-controls">
      <h2 id="ad-controls" className="mascot-vote__panel-title" ref={headingRef} tabIndex={-1}>
        Mascot vote: controls
      </h2>
      <p>
        <strong>Status:</strong> {STATUS_TEXT[election.status]}
      </p>
      {pastClosing && (
        <p className="mascot-vote__notice">The closing time has passed, so ballots are already refused. Close voting to move on to publishing.</p>
      )}
      <div className="admin__actions">
        {STATUS_MOVES[election.status].map((m) => (
          <button
            key={m.to}
            type="button"
            className={`mascot-vote__btn ${m.to === 'published' || m.to === 'open' ? 'mascot-vote__btn--primary' : 'mascot-vote__btn--secondary'}`}
            onClick={() => move.ask(m)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="admin__closing">
        <label htmlFor={inputId}>Closing time</label>
        <p id={hintId} className="mascot-vote__meta">
          {election.closesAt ? `Ballots are refused from ${formatWhen(election.closesAt)}.` : 'No closing time: voting stays open until you close it.'} Times are in
          your own time zone.
        </p>
        <div className="admin__closing-row">
          <input
            id={inputId}
            type="datetime-local"
            value={draft}
            aria-describedby={hintId}
            aria-invalid={fieldError ? true : undefined}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" onClick={saveClosing}>
            Save closing time
          </button>
          {election.closesAt && (
            <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" onClick={() => closing.ask({ iso: null })}>
              Remove closing time
            </button>
          )}
        </div>
        {fieldError && (
          <p className="mascot-vote__notice" role="alert">
            {fieldError}
          </p>
        )}
      </div>

      <Confirm
        open={move.target !== null}
        title={move.target ? `${move.target.label}?` : ''}
        confirmLabel={move.target?.label ?? ''}
        busy={move.busy}
        error={move.error}
        onConfirm={() => void move.confirm()}
        onCancel={move.cancel}
      >
        <p>{move.target?.effect}</p>
      </Confirm>
      <Confirm
        open={closing.target !== null}
        title={closing.target?.iso ? 'Set the closing time?' : 'Remove the closing time?'}
        confirmLabel={closing.target?.iso ? 'Set closing time' : 'Remove closing time'}
        busy={closing.busy}
        error={closing.error}
        onConfirm={() => void closing.confirm()}
        onCancel={closing.cancel}
      >
        <p>
          {closing.target?.iso
            ? Date.parse(closing.target.iso) <= Date.now()
              ? `${formatWhen(closing.target.iso)} has already passed: ballots will be refused from the moment you confirm.`
              : `Ballots will be refused from ${formatWhen(closing.target.iso)}. The vote page shows this time to everyone.`
            : 'Voting will stay open until an admin closes it.'}
        </p>
      </Confirm>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Results so far
// ---------------------------------------------------------------------------

function VoteResults({ election, ballots }: { election: Election; ballots: AdminBallot[] }) {
  const counted = useMemo(() => countedRankings(ballots), [ballots])
  const result = useMemo<CountResult | null>(() => {
    try {
      return countRankedChoice({ entries: ENTRY_IDS, ballots: counted, drawOrder: election.drawOrder })
    } catch {
      return null
    }
  }, [counted, election.drawOrder])
  const [roundIndex, setRoundIndex] = useState(0)
  const selectId = useId()


  // Clamped here, not in an effect: excluding a ballot can shorten the count, and the
  // chart must never read a round that no longer exists.
  const shownRound = result ? Math.min(roundIndex, result.rounds.length - 1) : 0
  const excluded = ballots.length - counted.length
  const status: ElectionStatus = effectiveStatus(election, Date.now())

  return (
    <section className="mascot-vote__panel" aria-labelledby="ad-results">
      <h2 id="ad-results" className="mascot-vote__panel-title">
        Mascot vote: results so far
      </h2>
      <p>
        {ballots.length} {ballots.length === 1 ? 'ballot' : 'ballots'} cast: {counted.length} counted, {excluded} excluded.
        {status !== 'published' && ' Only admins see these figures until the results are published.'}
      </p>

      {result === null ? (
        <p role="alert">The ballots could not be counted. Reload the dashboard.</p>
      ) : (
        <>
          {result.winner ? (
            <p className="admin__leader">
              <strong>{status === 'published' || status === 'closed' ? 'Winner' : 'Leading now'}:</strong> {result.winner.id}, with{' '}
              {result.winner.votes} of {result.winner.active} active ballots ({formatPercent(result.winner.percentOfActive)}) in round{' '}
              {result.rounds.length}, which is {formatPercent(result.winner.percentOfTotal)} of all {result.winner.totalBallots} counted.
            </p>
          ) : (
            <p className="admin__leader">No counted ballots yet.</p>
          )}

          <div className="admin__filter">
            <label htmlFor={selectId}>Counting round shown in the chart</label>
            <select id={selectId} value={shownRound} onChange={(e) => setRoundIndex(Number(e.target.value))}>
              {result.rounds.map((r, i) => (
                <option key={r.round} value={i}>
                  Round {r.round}
                  {i === 0 ? ' (first choices)' : ''}
                </option>
              ))}
            </select>
          </div>

          <ResultsChart result={result} roundIndex={shownRound} />

          <h3 id="ad-rounds" className="admin__subtitle">
            Round by round
          </h3>
          <RoundTable
            result={result}
            labelledBy="ad-rounds"
            nameOf={idOf}
            winnerLabel={status === 'published' || status === 'closed' ? 'Winner' : 'Leading'}
            fit
          />
        </>
      )}
    </section>
  )
}

/**
 * One bar per entry, most votes left. Single series: one colour, no legend; the title
 * names it. The number is printed on every bar (asked for: there are only six), and the
 * same figures are in the round table below for screen readers, so the plot itself is
 * hidden from them.
 */
function ResultsChart({ result, roundIndex }: { result: CountResult; roundIndex: number }) {
  const round = result.rounds[roundIndex]
  const bars = barsForRound(result, roundIndex, ENTRY_IDS)
  const ticks = axisTicks(Math.max(...bars.map((b) => b.votes)))
  const top = ticks[ticks.length - 1]
  const titleId = useId()

  return (
    <figure className="admin-chart" aria-labelledby={titleId}>
      <figcaption id={titleId} className="admin-chart__title">
        Votes per entry, round {round.round}
        {roundIndex === 0 ? ' (first choices)' : ''}
        <span className="admin-chart__sub">
          {round.active} active, {round.exhausted} exhausted. The figures are in the round-by-round table below.
        </span>
      </figcaption>
      <div className="admin-chart__plot" aria-hidden="true">
        <div className="admin-chart__axis-label">Votes</div>
        <div className="admin-chart__ticks">
          {ticks.map((t) => (
            <span key={t} className="admin-chart__tick" style={{ bottom: `${(t / top) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="admin-chart__area">
          {ticks.map((t) => (
            <span key={t} className="admin-chart__grid" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <ol className="admin-chart__bars" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}>
            {bars.map((b) => {
              const pct = (b.votes / top) * 100
              return (
                <li key={b.id} className={`admin-chart__col${b.eliminated ? ' admin-chart__col--out' : ''}`}>
                  <span className="admin-chart__value" style={{ bottom: `${pct}%` }}>
                    {b.eliminated ? '-' : b.votes}
                  </span>
                  {!b.eliminated && <span className="admin-chart__bar" style={{ height: `${pct}%` }} />}
                  <span className="admin-chart__tip" role="tooltip">
                    {b.id}: {b.eliminated ? 'eliminated' : `${b.votes} ${b.votes === 1 ? 'vote' : 'votes'}`}, round {round.round}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
      <ol className="admin-chart__labels" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}>
        {bars.map((b) => {
          const entry = getMascotEntry(b.id)
          return (
            <li key={b.id} className="admin-chart__label">
              {entry && (
                <span className="admin-chart__thumb">
                  <ArtImage entry={entry} alt="" />
                </span>
              )}
              <span className="admin-chart__id">{b.id}</span>
              {b.eliminated && <span className="admin-chart__out">Eliminated</span>}
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Ballots
// ---------------------------------------------------------------------------

function BallotsSection({ election, ballots, onChanged }: { election: Election; ballots: AdminBallot[]; onChanged: () => void }) {
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const filterId = useId()
  const frozen = election.status === 'published'
  const shown = filterBallots(ballots, query)

  const toggle = async (b: AdminBallot) => {
    // One change at a time. The boxes stay enabled (and focused) while it saves.
    if (pending !== null) return
    setPending(b.ballotId)
    setError(null)
    const r = await setCounted(b.ballotId, !b.counted)
    setPending(null)
    if (r.ok) onChanged()
    else setError(FAILURE_TEXT[r.reason])
  }

  return (
    <section className="mascot-vote__panel" aria-labelledby="ad-ballots">
      <h2 id="ad-ballots" className="mascot-vote__panel-title">
        Mascot vote: ballots
      </h2>
      <p>
        Untick a ballot whose Discord account is not on the Dystopian Outcasts server. It stays listed here and is left out of every
        count.
      </p>
      {frozen && <p className="mascot-vote__notice">Results are published, so ballots cannot be changed. Unpublish first.</p>}
      {error && (
        <p className="mascot-vote__notice" role="alert">
          {error}
        </p>
      )}
      <div className="admin__filter">
        <label htmlFor={filterId}>Filter by Discord username</label>
        <input id={filterId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <p className="mascot-vote__meta" role="status">
        {shown.length} of {ballots.length} {ballots.length === 1 ? 'ballot' : 'ballots'}
      </p>
      {ballots.length === 0 ? (
        <p>No ballots yet.</p>
      ) : (
        <BallotsTable ballots={shown} frozen={frozen} pending={pending} onToggle={(b) => void toggle(b)} labelledBy="ad-ballots" />
      )}
    </section>
  )
}
