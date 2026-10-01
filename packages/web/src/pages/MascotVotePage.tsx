/**
 * MascotVotePage - /vote. The community mascot election: gallery, ranked ballot,
 * confirmation, and published round-by-round results.
 *
 * What shows under the gallery depends on the election status and on the visitor
 * (docs/planning/MascotVote/PLAN.md, Task 7). The server is the record: nothing is kept
 * in the browser, and the count is rankedChoice.ts, the same module the dashboard uses.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { SEOHead } from '../components/seo/SEOHead'
import { ConnectDiscord } from '../components/auth/ConnectDiscord'
import { MascotDialog } from '../components/mascot/MascotDialog'
import { ArtImage } from '../components/mascot/ArtImage'
import { RoundTable } from '../components/mascot/RoundTable'
import { useAuth } from '../context/AuthContext'
import { MASCOT_ENTRIES, getMascotEntry } from '../data/mascotEntries'
import { hasDiscordIdentity } from '../utils/memberProfile'
import { loginUrlFor } from '../utils/loginNext'
import { liveVoteApi, type VoteApi, type VoteSource, type Viewer } from '../lib/mascotVote'
import {
  MAX_RANKS,
  RECOMMENDED_RANKS,
  announceAdded,
  announceMoved,
  announceRemoved,
  canSubmit,
  drawOrderText,
  effectiveStatus,
  isShortBallot,
  moveDown,
  moveUp,
  ordinal,
  removeEntry,
  shortBallotWarning,
  toggleEntry,
  type CastOutcome,
  type Election,
  type MyBallot,
  type PublicBallots,
} from '../lib/mascotVoteLogic'
import { ballotsToCsv, countRankedChoice, winnerSentence } from '../lib/rankedChoice'
import '../styles/pages/mascot-vote.css'

const ENTRY_IDS = MASCOT_ENTRIES.map((e) => e.id)

function nameOf(id: string): string {
  return getMascotEntry(id)?.label ?? id
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })
}

type Load<T> = { state: 'loading' } | { state: 'error'; reason: string } | { state: 'ready'; value: T }

// ---------------------------------------------------------------------------
// Page shell: picks the data source (live, or the dev preview) and the viewer
// ---------------------------------------------------------------------------

export function MascotVotePage() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()
  const previewName = import.meta.env.DEV ? params.get('preview') : null
  const previewCast = import.meta.env.DEV ? params.get('cast') : null
  const [source, setSource] = useState<VoteSource | null>(previewName ? null : { api: liveVoteApi })

  // Development only: Vite drops this block, and the module it loads, from the production build.
  useEffect(() => {
    if (!import.meta.env.DEV || !previewName) return
    let cancelled = false
    void import('../lib/mascotVotePreview').then((m) => {
      if (!cancelled) setSource(m.previewSource(previewName, previewCast) ?? { api: liveVoteApi })
    })
    return () => {
      cancelled = true
    }
  }, [previewName, previewCast])

  const viewer: Viewer | 'loading' =
    source?.viewer ?? (loading ? 'loading' : !user ? 'out' : hasDiscordIdentity(user) ? 'ready' : 'nodiscord')

  return (
    <Layout>
      <SEOHead
        title="Choose the community mascot"
        description="Six mascot entries, one winner. Members with a Discord account rank their favourites and the results are published round by round."
      />
      <main className="mascot-vote">
        <header className="mascot-vote__intro">
          <h1 className="mascot-vote__title">Choose our mascot</h1>
          <p className="mascot-vote__lead">
            Six entries, one mascot. Members with a Discord account rank their favourites. The count is an instant
            runoff, and once it is published you can read every round and download the ballots to check it yourself.
          </p>
        </header>
        {source === null ? (
          <p className="mascot-vote__loading" role="status">
            Loading the vote...
          </p>
        ) : (
          <VoteContent key={previewName ?? 'live'} source={source} viewer={viewer} />
        )}
      </main>
    </Layout>
  )
}

// ---------------------------------------------------------------------------
// Content: loads the election, then shows whichever situation applies
// ---------------------------------------------------------------------------

function VoteContent({ source, viewer: viewerIn }: { source: VoteSource; viewer: Viewer | 'loading' }) {
  const { api } = source
  const [electionLoad, setElectionLoad] = useState<Load<Election | null>>({ state: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [zoomId, setZoomId] = useState<string | null>(null)
  const [, forceRender] = useState(0)

  useEffect(() => {
    let cancelled = false
    void api.fetchElection().then((r) => {
      if (cancelled) return
      setElectionLoad(r.ok ? { state: 'ready', value: r.value } : { state: 'error', reason: r.reason })
    })
    return () => {
      cancelled = true
    }
  }, [api, reloadKey])

  const election = electionLoad.state === 'ready' ? electionLoad.value : null
  const status = election ? effectiveStatus(election, Date.now()) : null

  // Flip an open election to closed at its closing time without waiting for a reload.
  useEffect(() => {
    if (!election || election.status !== 'open' || election.closesAt === null) return
    const delay = Date.parse(election.closesAt) - Date.now()
    if (!(delay > 0) || delay > 2 ** 31 - 1) return
    const id = window.setTimeout(() => forceRender((n) => n + 1), delay + 250)
    return () => window.clearTimeout(id)
  }, [election])

  // The member's own ballot matters while voting is open or closed.
  const needsMyBallot = viewerIn === 'ready' && (status === 'open' || status === 'closed')
  const [myBallotLoad, setMyBallotLoad] = useState<Load<MyBallot | null>>({ state: 'loading' })
  const [myBallotKey, setMyBallotKey] = useState(0)
  const [justVoted, setJustVoted] = useState(false)

  useEffect(() => {
    if (!needsMyBallot) return
    let cancelled = false
    setMyBallotLoad({ state: 'loading' })
    void api.fetchMyBallot().then((r) => {
      if (cancelled) return
      setMyBallotLoad(r.ok ? { state: 'ready', value: r.value } : { state: 'error', reason: r.reason })
    })
    return () => {
      cancelled = true
    }
  }, [api, needsMyBallot, myBallotKey])

  // A signed-out answer from the server means the session ended: treat the visitor as logged out.
  const viewer: Viewer | 'loading' =
    viewerIn === 'ready' && needsMyBallot && myBallotLoad.state === 'error' && myBallotLoad.reason === 'login' ? 'out' : viewerIn

  const handleVoted = useCallback((rankings: string[] | null) => {
    setJustVoted(true)
    if (rankings) {
      setMyBallotLoad({ state: 'ready', value: { rankings, createdAt: new Date().toISOString() } })
    } else {
      setMyBallotLoad({ state: 'loading' })
      setMyBallotKey((k) => k + 1)
    }
  }, [])

  const handleNotOpen = useCallback(() => {
    setNotice('Voting is not open any more, so your ballot was not recorded.')
    setReloadKey((k) => k + 1)
  }, [])

  const zoomEntry = zoomId ? getMascotEntry(zoomId) : undefined

  let body: React.ReactNode
  if (electionLoad.state === 'loading') {
    body = (
      <p className="mascot-vote__loading" role="status">
        Loading the vote...
      </p>
    )
  } else if (electionLoad.state === 'error') {
    body = (
      <>
        <Gallery onZoom={setZoomId} />
        <section className="mascot-vote__panel" aria-labelledby="mv-error">
          <h2 id="mv-error" className="mascot-vote__panel-title">
            The vote could not be loaded
          </h2>
          <p role="alert">
            {electionLoad.reason === 'malformed'
              ? 'The vote page got an answer it could not understand. Please try again later.'
              : 'We could not reach the server. Check your connection and try again.'}
          </p>
          <button
            type="button"
            className="mascot-vote__btn mascot-vote__btn--primary"
            onClick={() => {
              setElectionLoad({ state: 'loading' })
              setReloadKey((k) => k + 1)
            }}
          >
            Try again
          </button>
        </section>
      </>
    )
  } else if (election === null || status === null) {
    body = (
      <>
        <Gallery onZoom={setZoomId} />
        <section className="mascot-vote__panel" aria-labelledby="mv-none">
          <h2 id="mv-none" className="mascot-vote__panel-title">
            There is no vote right now
          </h2>
          <p>Check back soon.</p>
        </section>
      </>
    )
  } else if (status === 'published') {
    body = (
      <>
        <Gallery onZoom={setZoomId} />
        <Results election={election} api={api} />
      </>
    )
  } else if (status === 'open' && viewer === 'ready' && myBallotLoad.state === 'ready' && myBallotLoad.value === null) {
    body = (
      <BallotSection
        key="ballot"
        election={election}
        api={api}
        initialRanking={source.initialRanking}
        notice={notice}
        onVoted={handleVoted}
        onNotOpen={handleNotOpen}
        onZoom={setZoomId}
      />
    )
  } else {
    body = (
      <>
        <Gallery onZoom={setZoomId} />
        {notice && (
          <p className="mascot-vote__notice" role="alert">
            {notice}
          </p>
        )}
        <StatusPanel
          election={election}
          status={status}
          viewer={viewer}
          myBallotLoad={needsMyBallot ? myBallotLoad : null}
          justVoted={justVoted}
          onRetryMyBallot={() => setMyBallotKey((k) => k + 1)}
        />
        <HowItWorks drawOrder={election.drawOrder} />
      </>
    )
  }

  return (
    <>
      {body}
      <MascotDialog open={zoomEntry !== undefined} onClose={() => setZoomId(null)} labelledBy="mv-zoom-title" className="mascot-dialog--zoom">
        {zoomEntry && (
          <>
            <h2 id="mv-zoom-title" className="mascot-dialog__title">
              {zoomEntry.label}
            </h2>
            <img
              className={`mascot-dialog__img${zoomEntry.pixelArt ? ' mascot-vote__pixel' : ''}`}
              src={zoomEntry.image}
              alt={zoomEntry.alt}
            />
            <form method="dialog" className="mascot-dialog__actions">
              <button className="mascot-vote__btn mascot-vote__btn--secondary">Close</button>
            </form>
          </>
        )}
      </MascotDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

interface GalleryProps {
  onZoom: (id: string) => void
  /** Present on the ballot: the art is the control. */
  ranking?: readonly string[]
  onToggle?: (id: string) => void
}

function Gallery({ onZoom, ranking, onToggle }: GalleryProps) {
  const baseId = useId()
  const interactive = onToggle !== undefined && ranking !== undefined
  return (
    <ul className="mascot-vote__gallery" aria-label="The six entries">
      {MASCOT_ENTRIES.map((entry) => {
        const position = ranking ? ranking.indexOf(entry.id) + 1 : 0
        const ranked = position > 0
        const descId = `${baseId}-${entry.id}`
        return (
          <li key={entry.id} className={`mascot-vote__card${ranked ? ' mascot-vote__card--ranked' : ''}`}>
            <div className="mascot-vote__frame">
              {interactive ? (
                <>
                  <button
                    type="button"
                    className="mascot-vote__art"
                    aria-label={
                      ranked
                        ? `Remove ${entry.label} from your ranking (currently ${ordinal(position)} choice)`
                        : `Rank ${entry.label} as your ${ordinal(ranking.length + 1)} choice`
                    }
                    aria-describedby={descId}
                    onClick={() => onToggle(entry.id)}
                  >
                    <ArtImage entry={entry} alt="" />
                  </button>
                  <span id={descId} className="sr-only">
                    {entry.alt}
                  </span>
                </>
              ) : (
                <ArtImage entry={entry} alt={entry.alt} />
              )}
              {ranked && (
                <span className="mascot-vote__badge" aria-hidden="true">
                  {ordinal(position)} choice
                </span>
              )}
            </div>
            <p className="mascot-vote__card-label">{entry.label}</p>
            <button
              type="button"
              className="mascot-vote__btn mascot-vote__btn--link"
              onClick={(e) => {
                e.currentTarget.focus()
                onZoom(entry.id)
              }}
            >
              View larger<span className="sr-only"> {entry.label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}


// ---------------------------------------------------------------------------
// Shared explanation
// ---------------------------------------------------------------------------

function HowItWorks({ drawOrder }: { drawOrder: readonly string[] }) {
  return (
    <section className="mascot-vote__panel" aria-labelledby="mv-how">
      <h2 id="mv-how" className="mascot-vote__panel-title">
        How the count works
      </h2>
      <ol className="mascot-vote__steps">
        <li>Every ballot counts for its highest choice that is still in the running.</li>
        <li>If an entry has more than half of the counted ballots, it wins.</li>
        <li>If not, the entry with the fewest ballots is eliminated and its ballots move to their next choice.</li>
        <li>This repeats until there is a winner.</li>
      </ol>
      <p className="mascot-vote__draw">
        <strong>Draw order:</strong> {drawOrderText(drawOrder, nameOf)}
      </p>
      <p>
        If two entries are tied for last place in every round, the one that comes first in this list is eliminated. It
        was drawn at random when the vote was set up.
      </p>
    </section>
  )
}

function ClosingLine({ election }: { election: Election }) {
  if (!election.closesAt) return null
  return (
    <p className="mascot-vote__closing">
      Voting closes <time dateTime={election.closesAt}>{formatWhen(election.closesAt)}</time>.
    </p>
  )
}

// ---------------------------------------------------------------------------
// Status panel: every situation that is not the ballot and not the results
// ---------------------------------------------------------------------------

interface StatusPanelProps {
  election: Election
  status: 'draft' | 'open' | 'closed'
  viewer: Viewer | 'loading'
  myBallotLoad: Load<MyBallot | null> | null
  justVoted: boolean
  onRetryMyBallot: () => void
}

function StatusPanel({ election, status, viewer, myBallotLoad, justVoted, onRetryMyBallot }: StatusPanelProps) {
  // Already voted: open or closed, read-only.
  if (myBallotLoad?.state === 'ready' && myBallotLoad.value) {
    return <VotedPanel ballot={myBallotLoad.value} status={status} focusOnMount={justVoted} />
  }

  if (myBallotLoad?.state === 'error' && myBallotLoad.reason !== 'login') {
    return (
      <section className="mascot-vote__panel" aria-labelledby="mv-status">
        <h2 id="mv-status" className="mascot-vote__panel-title">
          We could not check your ballot
        </h2>
        <p role="alert">We could not find out whether you have already voted. Please try again.</p>
        <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={onRetryMyBallot}>
          Try again
        </button>
      </section>
    )
  }

  if (myBallotLoad?.state === 'loading') {
    return (
      <section className="mascot-vote__panel" aria-labelledby="mv-status">
        <h2 id="mv-status" className="mascot-vote__panel-title">
          Checking your ballot
        </h2>
        <p role="status">One moment...</p>
      </section>
    )
  }

  if (status === 'closed') {
    return (
      <section className="mascot-vote__panel" aria-labelledby="mv-status">
        <h2 id="mv-status" className="mascot-vote__panel-title">
          Voting has closed
        </h2>
        <p>Voting has closed. Results will be published here.</p>
      </section>
    )
  }

  if (status === 'draft') {
    return (
      <section className="mascot-vote__panel" aria-labelledby="mv-status">
        <h2 id="mv-status" className="mascot-vote__panel-title">
          Voting opens soon.
        </h2>
        <p>The entries are on show above. Voting is not open yet.</p>
        <ViewerPrompt viewer={viewer} readyText="You are signed in with Discord and ready to vote when it opens." />
      </section>
    )
  }

  // open, and the visitor cannot vote yet (ready visitors with no ballot get the ballot itself)
  return (
    <section className="mascot-vote__panel" aria-labelledby="mv-status">
      <h2 id="mv-status" className="mascot-vote__panel-title">
        {viewer === 'nodiscord' ? 'Connect your Discord account to vote' : viewer === 'loading' ? 'Voting is open' : 'Log in to vote'}
      </h2>
      <ViewerPrompt viewer={viewer} readyText="" />
      <ClosingLine election={election} />
    </section>
  )
}

function ViewerPrompt({ viewer, readyText }: { viewer: Viewer | 'loading'; readyText: string }) {
  if (viewer === 'loading') return <p role="status">Checking your sign-in...</p>
  if (viewer === 'out') {
    return (
      <>
        <p>Members vote with a Discord account. Log in, or register, to take part.</p>
        <Link className="mascot-vote__btn mascot-vote__btn--primary" to={loginUrlFor('/vote')}>
          Log in to vote
        </Link>
      </>
    )
  }
  if (viewer === 'nodiscord') {
    return (
      <>
        <p>
          Votes are tied to a Discord account, and we check that voters are members of the Dystopian Outcasts Discord.
          Connect yours to continue.
        </p>
        <ConnectDiscord returnPath="/vote" />
      </>
    )
  }
  return readyText ? <p>{readyText}</p> : null
}

function VotedPanel({ ballot, status, focusOnMount }: { ballot: MyBallot; status: 'draft' | 'open' | 'closed'; focusOnMount: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus()
  }, [focusOnMount])
  return (
    <section className="mascot-vote__panel mascot-vote__panel--voted" aria-labelledby="mv-status">
      <h2 id="mv-status" className="mascot-vote__panel-title" ref={headingRef} tabIndex={-1}>
        Your vote is in
      </h2>
      <p>Thank you. Your ballot is final and cannot be changed. This is how you ranked the entries:</p>
      <ol className="mascot-vote__voted-list">
        {ballot.rankings.map((id, i) => (
          <li key={id}>
            <span className="mascot-vote__voted-rank">{ordinal(i + 1)} choice</span> {nameOf(id)}
          </li>
        ))}
      </ol>
      <p>
        {status === 'open'
          ? 'Voting is still open for others. Results are published here once voting has closed and the ballots have been checked.'
          : 'Voting has closed. Results will be published here.'}
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// The ballot
// ---------------------------------------------------------------------------

interface BallotSectionProps {
  election: Election
  api: VoteApi
  initialRanking?: string[]
  notice: string | null
  onVoted: (rankings: string[] | null) => void
  onNotOpen: () => void
  onZoom: (id: string) => void
}

type Retryable = Extract<CastOutcome, 'login' | 'network' | 'unexpected'>

const CAST_MESSAGES: Record<Retryable, string> = {
  network: 'We could not reach the server. Your ranking is kept. Check your connection and try again.',
  unexpected: 'The server gave an answer we did not expect. Your ranking is kept. Try again in a moment.',
  login: 'You are not logged in any more. Log in again, then come back and lock in your vote.',
}

function BallotSection({ election, api, initialRanking, notice, onVoted, onNotOpen, onZoom }: BallotSectionProps) {
  const [ranking, setRanking] = useState<string[]>(() => initialRanking ?? [])
  const [announcement, setAnnouncement] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retryable, setRetryable] = useState<Retryable | null>(null)
  const [localNotice, setLocalNotice] = useState<'no_discord' | 'invalid' | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<string | null>(null)

  const say = (text: string) => setAnnouncement(text)

  // Once the list has re-rendered, put keyboard focus somewhere sensible.
  useEffect(() => {
    const target = pendingFocus.current
    if (target === null) return
    pendingFocus.current = null
    if (target === 'heading') headingRef.current?.focus()
    else buttonRefs.current.get(target)?.focus()
  }, [ranking])

  const handleToggle = (id: string) => {
    setLocalNotice(null)
    if (ranking.includes(id)) {
      say(announceRemoved(nameOf(id), ranking, id, nameOf))
      setRanking(removeEntry(ranking, id))
    } else {
      const next = toggleEntry(ranking, id)
      setRanking(next)
      say(announceAdded(nameOf(id), next.indexOf(id) + 1))
    }
  }

  const handleRemove = (id: string) => {
    const i = ranking.indexOf(id)
    const next = removeEntry(ranking, id)
    say(announceRemoved(nameOf(id), ranking, id, nameOf))
    // Focus the Remove button that now sits where this one was, else the one above, else the heading.
    const neighbour = next[i] ?? next[i - 1]
    pendingFocus.current = neighbour ? `${neighbour}:remove` : 'heading'
    setRanking(next)
  }

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const next = direction === 'up' ? moveUp(ranking, id) : moveDown(ranking, id)
    if (next.join() === ranking.join()) return
    say(announceMoved(nameOf(id), direction, next.indexOf(id) + 1))
    pendingFocus.current = `${id}:${direction}`
    setRanking(next)
  }

  const submit = async () => {
    setSubmitting(true)
    setRetryable(null)
    const outcome = await api.castBallot(ranking)
    setSubmitting(false)
    switch (outcome) {
      case 'ok':
        setConfirmOpen(false)
        onVoted(ranking)
        break
      case 'already_voted':
        setConfirmOpen(false)
        onVoted(null)
        break
      case 'not_open':
        setConfirmOpen(false)
        onNotOpen()
        break
      case 'no_discord':
      case 'invalid':
        setConfirmOpen(false)
        setLocalNotice(outcome)
        break
      default:
        setRetryable(outcome)
    }
  }

  const short = isShortBallot(ranking)
  const empty = !canSubmit(ranking)

  return (
    <>
      <section className="mascot-vote__panel" aria-labelledby="mv-ballot">
        <h2 id="mv-ballot" className="mascot-vote__panel-title">
          Your ballot
        </h2>
        <p>
          Press an entry&apos;s art to add it to your ranking, in the order you press. Press it again to take it out;
          the entries below it move up. Rank at least {RECOMMENDED_RANKS} if you can.
        </p>
        <ClosingLine election={election} />
        {notice && (
          <p className="mascot-vote__notice" role="alert">
            {notice}
          </p>
        )}
      </section>

      <Gallery onZoom={onZoom} ranking={ranking} onToggle={handleToggle} />

      <section className="mascot-vote__panel" aria-labelledby="mv-ranking">
        <h2 id="mv-ranking" className="mascot-vote__panel-title" ref={headingRef} tabIndex={-1}>
          Your ranking
        </h2>
        {ranking.length === 0 ? (
          <p className="mascot-vote__empty">You have not ranked anything yet. Press an entry above to start.</p>
        ) : (
          <ol className="mascot-vote__ranking">
            {ranking.map((id, i) => {
              const entry = getMascotEntry(id)
              if (!entry) return null
              const refFor = (action: string) => (el: HTMLButtonElement | null) => {
                if (el) buttonRefs.current.set(`${id}:${action}`, el)
                else buttonRefs.current.delete(`${id}:${action}`)
              }
              return (
                <li key={id} className="mascot-vote__rank-row">
                  <span className="mascot-vote__rank-pos">{ordinal(i + 1)}</span>
                  <span className="mascot-vote__rank-thumb">
                    <ArtImage entry={entry} alt="" />
                  </span>
                  <span className="mascot-vote__rank-name">{entry.label}</span>
                  <span className="mascot-vote__rank-actions">
                    <button
                      type="button"
                      ref={refFor('up')}
                      className="mascot-vote__btn mascot-vote__btn--secondary"
                      aria-disabled={i === 0}
                      onClick={() => handleMove(id, 'up')}
                    >
                      Move up<span className="sr-only"> {entry.label}</span>
                    </button>
                    <button
                      type="button"
                      ref={refFor('down')}
                      className="mascot-vote__btn mascot-vote__btn--secondary"
                      aria-disabled={i === ranking.length - 1}
                      onClick={() => handleMove(id, 'down')}
                    >
                      Move down<span className="sr-only"> {entry.label}</span>
                    </button>
                    <button
                      type="button"
                      ref={refFor('remove')}
                      className="mascot-vote__btn mascot-vote__btn--secondary"
                      onClick={() => handleRemove(id)}
                    >
                      Remove<span className="sr-only"> {entry.label}</span>
                    </button>
                  </span>
                </li>
              )
            })}
          </ol>
        )}
        {short && (
          <p className="mascot-vote__hint">
            You have ranked {ranking.length} of {MAX_RANKS}. If every entry you ranked is eliminated, your ballot stops
            counting. Rank at least {RECOMMENDED_RANKS} and it counts to the end.
          </p>
        )}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </section>

      <HowItWorks drawOrder={election.drawOrder} />

      <section className="mascot-vote__panel" aria-labelledby="mv-before">
        <h2 id="mv-before" className="mascot-vote__panel-title">
          Before you lock in
        </h2>
        <ul className="mascot-vote__facts">
          <li>
            We check that voters are members of the Dystopian Outcasts Discord. If your Discord account is not on our
            server, your vote will not be counted.
          </li>
          <li>Admins can see how you voted. Published results never include names.</li>
          <li>Your vote is final. You cannot change it after you lock it in.</li>
          {election.closesAt && (
            <li>
              Voting closes <time dateTime={election.closesAt}>{formatWhen(election.closesAt)}</time>.
            </li>
          )}
        </ul>
        {localNotice === 'no_discord' && (
          <div className="mascot-vote__notice" role="alert">
            <p>
              We could not find a Discord account connected to your login, so your ballot was not recorded. Connect
              Discord, then lock in your vote again. Your ranking is kept.
            </p>
            <ConnectDiscord returnPath="/vote" />
          </div>
        )}
        {localNotice === 'invalid' && (
          <p className="mascot-vote__notice" role="alert">
            The server could not accept that ranking, so your ballot was not recorded. Check your ranking and try again.
          </p>
        )}
        <button
          type="button"
          className="mascot-vote__btn mascot-vote__btn--primary mascot-vote__submit"
          aria-disabled={empty}
          aria-describedby={empty ? 'mv-submit-why' : undefined}
          onClick={() => {
            if (!empty) {
              setRetryable(null)
              setConfirmOpen(true)
            }
          }}
        >
          Lock in my vote
        </button>
        {empty && (
          <p id="mv-submit-why" className="mascot-vote__hint">
            Rank at least one entry to lock in your vote.
          </p>
        )}
      </section>

      <MascotDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        labelledBy="mv-confirm-title"
        initialFocusRef={backRef}
        locked={submitting}
      >
        <h2 id="mv-confirm-title" className="mascot-dialog__title">
          Lock in your vote?
        </h2>
        {short && <p className="mascot-vote__warning">{shortBallotWarning(ranking.length, MAX_RANKS)}</p>}
        <p>You are about to submit this ranking:</p>
        <ol className="mascot-vote__voted-list">
          {ranking.map((id, i) => (
            <li key={id}>
              <span className="mascot-vote__voted-rank">{ordinal(i + 1)} choice</span> {nameOf(id)}
            </li>
          ))}
        </ol>
        <p>
          <strong>Your vote cannot be changed once you lock it in.</strong>
        </p>
        {retryable && (
          <p className="mascot-vote__notice" role="alert">
            {CAST_MESSAGES[retryable]}
            {retryable === 'login' && (
              <>
                {' '}
                <Link to={loginUrlFor('/vote')}>Log in</Link>
              </>
            )}
          </p>
        )}
        {submitting && (
          <p role="status" className="mascot-vote__hint">
            Submitting your vote...
          </p>
        )}
        <div className="mascot-dialog__actions">
          {short ? (
            <>
              <button
                ref={backRef}
                type="button"
                className="mascot-vote__btn mascot-vote__btn--primary"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                Go back and rank more
              </button>
              <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={submitting} onClick={() => void submit()}>
                {retryable ? 'Try again' : 'Submit anyway'}
              </button>
            </>
          ) : (
            <>
              <button ref={backRef} type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={submitting} onClick={() => setConfirmOpen(false)}>
                Go back
              </button>
              <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" disabled={submitting} onClick={() => void submit()}>
                {retryable ? 'Try again' : 'Lock in my vote'}
              </button>
            </>
          )}
        </div>
      </MascotDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

function Results({ election, api }: { election: Election; api: VoteApi }) {
  const [load, setLoad] = useState<Load<PublicBallots | null>>({ state: 'loading' })
  const [key, setKey] = useState(0)
  const [downloadError, setDownloadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoad({ state: 'loading' })
    void api.fetchPublicBallots().then((r) => {
      if (cancelled) return
      setLoad(r.ok ? { state: 'ready', value: r.value } : { state: 'error', reason: r.reason })
    })
    return () => {
      cancelled = true
    }
  }, [api, key])

  const data = load.state === 'ready' ? load.value : null
  // The one count: rankedChoice.ts, with the draw order the election published.
  const counted = useMemo(() => {
    if (!data) return null
    try {
      return { result: countRankedChoice({ entries: ENTRY_IDS, ballots: data.ballots, drawOrder: election.drawOrder }) }
    } catch {
      return { error: true as const }
    }
  }, [data, election.drawOrder])

  const download = () => {
    if (!data) return
    setDownloadError(false)
    try {
      const csv = ballotsToCsv(data.ballots, MAX_RANKS)
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'mascot-vote-ballots.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setDownloadError(true)
    }
  }

  if (load.state === 'loading') {
    return (
      <p className="mascot-vote__loading" role="status">
        Loading the results...
      </p>
    )
  }

  if (load.state === 'error' || data === null || counted === null || 'error' in counted) {
    return (
      <section className="mascot-vote__panel" aria-labelledby="mv-results-error">
        <h2 id="mv-results-error" className="mascot-vote__panel-title">
          The results could not be shown
        </h2>
        <p role="alert">
          {load.state === 'error' && load.reason === 'network'
            ? 'We could not reach the server. Check your connection and try again.'
            : 'The results came back in a form this page could not read. Please try again later.'}
        </p>
        <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={() => setKey((k) => k + 1)}>
          Try again
        </button>
      </section>
    )
  }

  const { result } = counted
  const winnerEntry = result.winner ? getMascotEntry(result.winner.id) : undefined

  return (
    <>
      <section className="mascot-vote__panel mascot-vote__panel--winner" aria-labelledby="mv-winner">
        <h2 id="mv-winner" className="mascot-vote__panel-title">
          {result.winner ? `The winner: ${nameOf(result.winner.id)}` : 'No winner'}
        </h2>
        {result.winner && winnerEntry ? (
          <div className="mascot-vote__winner">
            <div className="mascot-vote__frame mascot-vote__frame--winner">
              <ArtImage entry={winnerEntry} alt={winnerEntry.alt} />
            </div>
            <p className="mascot-vote__winner-text">{winnerSentence(result.winner, winnerEntry.label)}</p>
          </div>
        ) : (
          <p>No ballots were counted, so there is no winner.</p>
        )}
        {election.publishedAt && (
          <p className="mascot-vote__meta">
            Published <time dateTime={election.publishedAt}>{formatWhen(election.publishedAt)}</time>.
          </p>
        )}
      </section>

      <section className="mascot-vote__panel" aria-labelledby="mv-rounds">
        <h2 id="mv-rounds" className="mascot-vote__panel-title">
          Round by round
        </h2>
        <RoundTable result={result} labelledBy="mv-rounds" nameOf={nameOf} />
      </section>

      <section className="mascot-vote__panel" aria-labelledby="mv-ballots">
        <h2 id="mv-ballots" className="mascot-vote__panel-title">
          The ballots
        </h2>
        <p>
          {result.totalBallots} {result.totalBallots === 1 ? 'ballot was' : 'ballots were'} counted.{' '}
          {data.excluded} {data.excluded === 1 ? 'ballot was' : 'ballots were'} excluded and are not in any figure on this
          page. Admins exclude ballots from accounts that are not members of the Dystopian Outcasts Discord.
        </p>
        <p>
          The ballots below have no names, accounts or times: only each voter&apos;s ranking. Anyone can download them and
          recount.
        </p>
        <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={download}>
          Download the ballots
        </button>
        {downloadError && (
          <p className="mascot-vote__notice" role="alert">
            The file could not be made. Please try again.
          </p>
        )}
      </section>

      <HowItWorks drawOrder={election.drawOrder} />
    </>
  )
}
