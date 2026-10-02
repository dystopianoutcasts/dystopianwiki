import { Link } from 'react-router-dom';
import { MASCOT_ENTRIES } from '../../data/mascotEntries';
import '../../styles/components/mascot-vote-callout.css';

export function MascotVoteCallout() {
  return (
    <section className="mascot-callout" aria-labelledby="mascot-callout-title">
      <div className="mascot-callout__inner">
        <div className="mascot-callout__text">
          <h2 id="mascot-callout-title" className="mascot-callout__title">
            Help choose our new mascot
          </h2>
          <p className="mascot-callout__description">
            Six entries from the community. Rank your favourites and lock in your vote.
          </p>
          <Link to="/vote" className="mascot-callout__button">
            See the entries and vote
          </Link>
        </div>
        <div className="mascot-callout__thumbs" aria-hidden="true">
          {/* Every entry, in entry order and uncropped, so the home page favours none. */}
          {MASCOT_ENTRIES.map((entry) => (
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
