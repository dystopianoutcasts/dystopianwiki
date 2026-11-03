import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MASCOT_ENTRIES } from '../../data/mascotEntries';
import { fetchElection, isRunoff, joinNames, type Election } from '../../lib/mascotVote';
import '../../styles/components/mascot-vote-callout.css';

export function MascotVoteCallout() {
  // The current election decides the wording: during a runoff (migration 045) the callout
  // names the two entries and shows only their art. Until it loads, or if it cannot, the
  // general wording stands.
  const [current, setCurrent] = useState<Election | null>(null);
  useEffect(() => {
    let cancelled = false;
    void fetchElection().then((r) => {
      if (!cancelled && r.ok) setCurrent(r.value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runoff = current && isRunoff(current) ? current : null;
  const shown = MASCOT_ENTRIES.filter((entry) => runoff === null || runoff.entries.includes(entry.id));

  return (
    <section className="mascot-callout" aria-labelledby="mascot-callout-title">
      <div className="mascot-callout__inner">
        <div className="mascot-callout__text">
          <h2 id="mascot-callout-title" className="mascot-callout__title">
            {runoff ? 'Our mascot vote went to a runoff' : 'Help choose our new mascot'}
          </h2>
          <p className="mascot-callout__description">
            {runoff
              ? `The first vote ended in a tie. Pick between ${joinNames(shown.map((e) => e.label))}: everyone in the community can vote.`
              : 'Six entries from the community. Rank your favorites and lock in your vote.'}
          </p>
          <Link to="/vote" className="mascot-callout__button">
            {runoff ? 'See the runoff and vote' : 'See the entries and vote'}
          </Link>
        </div>
        <div className="mascot-callout__thumbs" aria-hidden="true">
          {/* Every entry in the vote, in entry order and uncropped, so the home page favors none. */}
          {shown.map((entry) => (
            <img
              key={entry.id}
              src={entry.image}
              alt=""
              className={
                entry.pixelArt
                  ? 'mascot-callout__thumb mascot-callout__thumb--pixel'
                  : 'mascot-callout__thumb'
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
