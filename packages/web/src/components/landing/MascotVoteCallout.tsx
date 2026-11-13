import { Fragment, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MASCOT_ENTRIES, previewOf, type MascotEntry } from '../../data/mascotEntries';
import { calloutKind, fetchElection, fetchPublicBallots, type Election, type FetchResult } from '../../lib/mascotVote';
import { isRunoff, winnerAnnouncement } from '../../lib/mascotVoteLogic';
import { countRankedChoice, tieForFirst } from '../../lib/rankedChoice';
import '../../styles/components/mascot-vote-callout.css';

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ready'; election: Election | null };

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
}

export function MascotVoteCallout() {
  // The newest election decides what the band says (calloutKind). Nothing shows until it
  // loads, so a visitor never sees an invitation that the real state then takes back.
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [params] = useSearchParams();
  // Development only (/?callout=runoff-open, any /vote preview state): Vite drops this branch,
  // and the canned data it loads, from the production build.
  const previewName = import.meta.env.DEV ? params.get('callout') : null;
  useEffect(() => {
    let cancelled = false;
    const done = (r: FetchResult<Election | null>) => {
      if (!cancelled) setLoad(r.ok ? { state: 'ready', election: r.value } : { state: 'error' });
    };
    if (import.meta.env.DEV && previewName) {
      void import('../../lib/mascotVotePreview').then(async (m) => {
        const api = m.previewSource(previewName, null)?.api;
        if (!api) return done(await fetchElection());
        const all = await api.fetchElections();
        done(all.ok ? { ok: true, value: all.value.reduce<Election | null>((a, e) => (a && a.id > e.id ? a : e), null) } : all);
      });
    } else {
      void fetchElection().then(done);
    }
    return () => {
      cancelled = true;
    };
  }, [previewName]);

  if (load.state === 'loading') return null;
  if (load.state === 'error') {
    return <Band title="Our mascot vote" description="Entries, rules and results." button="Go to the vote" />;
  }
  const election = load.election;
  if (election === null) return null;

  const kind = calloutKind(election, Date.now());
  const inVote = MASCOT_ENTRIES.filter((entry) => election.entries.includes(entry.id));

  switch (kind) {
    case 'runoff-open':
    case 'runoff-soon':
      return <RunoffBanner contenders={inVote} open={kind === 'runoff-open'} closesAt={election.closesAt} />;
    case 'open':
      return (
        <Band
          title="Help choose our new mascot"
          description="Six entries from the community. Rank your favorites and lock in your vote."
          button="See the entries and vote"
          thumbs={inVote}
        />
      );
    case 'counting':
      return (
        <Band
          title="The mascot vote has closed"
          description="The ballots are being checked. The full count goes up on the vote page next."
          button="See the vote"
          thumbs={inVote}
        />
      );
    case 'results':
      return <ResultsBanner election={election} inVote={inVote} previewName={previewName} />;
    case 'none':
      return null;
  }
}

type Named = { entry: MascotEntry; named: NonNullable<MascotEntry['winner']>; sentence: string };

/**
 * Published results: name the winner when the count has one and that entry has been named
 * (data/mascotEntries.ts `winner`). Counted from the published ballots, the same count as
 * /vote, so the two never disagree. Anything else (a tie, no ballots, a fetch that fails,
 * an unnamed winner) shows the plain results band.
 */
function ResultsBanner({
  election,
  inVote,
  previewName,
}: {
  election: Election;
  inVote: readonly MascotEntry[];
  previewName: string | null;
}) {
  const [named, setNamed] = useState<Named | null | 'loading'>('loading');
  useEffect(() => {
    let cancelled = false;
    // Development previews (/?callout=runoff-published) count the preview's canned ballots.
    const ballots =
      import.meta.env.DEV && previewName
        ? import('../../lib/mascotVotePreview').then(
            (m) => m.previewSource(previewName, null)?.api.fetchPublicBallots(election.id) ?? fetchPublicBallots(election.id),
          )
        : fetchPublicBallots(election.id);
    void ballots.then((r) => {
      if (cancelled) return;
      if (!r.ok || r.value === null) return setNamed(null);
      try {
        const result = countRankedChoice({ entries: election.entries, ballots: r.value.ballots, drawOrder: election.drawOrder });
        const entry = result.winner && !tieForFirst(result) ? MASCOT_ENTRIES.find((e) => e.id === result.winner!.id) : undefined;
        if (!result.winner || !entry?.winner) return setNamed(null);
        setNamed({ entry, named: entry.winner, sentence: winnerAnnouncement(entry.winner.name, entry.winner.artist, result.winner, isRunoff(election)) });
      } catch {
        setNamed(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [election, previewName]);

  if (named === 'loading') return null;
  if (named === null) {
    return (
      <Band
          title="The mascot vote results are in"
          description="See every round of the count, and download every ballot to check it yourself."
          button="See the results"
          thumbs={inVote}
        />
    );
  }
  return (
    <section className="mascot-callout mascot-callout--winner" aria-labelledby="mascot-callout-title">
      <div className="mascot-callout__inner mascot-callout__inner--winner">
        <img src={named.named.image} alt={named.named.alt} className="mascot-callout__winner-art" width={512} height={512} />
        <div className="mascot-callout__text">
          <p className="mascot-callout__kicker">Our new mascot</p>
          <h2 id="mascot-callout-title" className="mascot-callout__title">
            Meet {named.named.name}
          </h2>
          <p className="mascot-callout__description">{named.sentence} Thank you to everyone who drew and everyone who voted.</p>
          <Link to="/vote" className="mascot-callout__button">
            See the full count
          </Link>
        </div>
      </div>
    </section>
  );
}

function Band({
  title,
  description,
  button,
  thumbs = [],
}: {
  title: string;
  description: string;
  button: string;
  thumbs?: readonly MascotEntry[];
}) {
  return (
    <section className="mascot-callout" aria-labelledby="mascot-callout-title">
      <div className="mascot-callout__inner dim-lights dim-lights--right">
        <div className="mascot-callout__text">
          <h2 id="mascot-callout-title" className="mascot-callout__title">
            {title}
          </h2>
          <p className="mascot-callout__description">{description}</p>
          <Link to="/vote" className="mascot-callout__button">
            {button}
          </Link>
        </div>
        {thumbs.length > 0 && (
          <div className="mascot-callout__thumbs" aria-hidden="true">
            {/* Every entry in the vote, in entry order and the same size, so the home page favors none. */}
            {thumbs.map((entry) => (
              <img key={entry.id} src={previewOf(entry)} alt="" className={thumbClass(entry)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RunoffBanner({
  contenders,
  open,
  closesAt,
}: {
  contenders: readonly MascotEntry[];
  open: boolean;
  closesAt: string | null;
}) {
  return (
    <section className="mascot-callout mascot-callout--runoff" aria-labelledby="mascot-callout-title">
      <div className="mascot-callout__inner mascot-callout__inner--runoff dim-lights dim-lights--right">
        <p className="mascot-callout__kicker">Mascot runoff</p>
        <h2 id="mascot-callout-title" className="mascot-callout__title mascot-callout__title--runoff">
          {open ? 'Vote now!' : 'The runoff opens soon'}
        </h2>
        <p className="mascot-callout__description">
          The first vote ended in a tie, so it comes down to these {contenders.length === 2 ? 'two' : contenders.length}. One pick each, and everyone in
          the community can vote.
        </p>
        {/* Entry order, same size, so the banner favors neither. */}
        <div className="mascot-callout__faceoff">
          {contenders.map((entry, i) => (
            <Fragment key={entry.id}>
              {i > 0 && (
                <span className="mascot-callout__vs" aria-hidden="true">
                  vs
                </span>
              )}
              <figure className="mascot-callout__contender">
                <img src={previewOf(entry)} alt={entry.alt} className={thumbClass(entry, 'mascot-callout__contender-art')} />
                <figcaption className="mascot-callout__contender-label">{entry.label}</figcaption>
              </figure>
            </Fragment>
          ))}
        </div>
        <Link to="/vote" className="mascot-callout__button mascot-callout__button--runoff">
          {open ? 'Vote now' : 'See the runoff'}
        </Link>
        {open && closesAt && (
          <p className="mascot-callout__closes">
            Voting closes <time dateTime={closesAt}>{formatWhen(closesAt)}</time>.
          </p>
        )}
      </div>
    </section>
  );
}

function thumbClass(entry: MascotEntry, base = 'mascot-callout__thumb'): string {
  return entry.pixelArt ? `${base} mascot-callout__thumb--pixel` : base;
}
