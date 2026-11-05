import { Fragment, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MASCOT_ENTRIES, type MascotEntry } from '../../data/mascotEntries';
import { calloutKind, fetchElection, type Election, type FetchResult } from '../../lib/mascotVote';
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
      return (
        <Band
          title="The mascot vote results are in"
          description="See every round of the count, and download every ballot to check it yourself."
          button="See the results"
          thumbs={inVote}
        />
      );
    case 'none':
      return null;
  }
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
      <div className="mascot-callout__inner">
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
            {/* Every entry in the vote, in entry order and uncropped, so the home page favors none. */}
            {thumbs.map((entry) => (
              <img key={entry.id} src={entry.image} alt="" className={thumbClass(entry)} />
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
      <div className="mascot-callout__inner mascot-callout__inner--runoff">
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
                <img src={entry.image} alt={entry.alt} className={thumbClass(entry, 'mascot-callout__contender-art')} />
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
