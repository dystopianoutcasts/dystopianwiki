import { Link } from 'react-router-dom';
import { CURRENT_SOTS } from '../../data/sots';
import '../../styles/components/sots-callout.css';

/**
 * A small band under the home page map that points to the current issue of State of the
 * Server (/sots). The cover is decorative here: the heading already names the issue.
 */
export function SotsCallout() {
  const issue = CURRENT_SOTS;
  return (
    <section className="sots-callout" aria-labelledby="sots-callout-title">
      <div className="sots-callout__inner dim-lights dim-lights--brand-left">
        <img
          className="sots-callout__cover"
          src={issue.cover}
          alt=""
          width={480}
          height={621}
          loading="lazy"
          decoding="async"
        />
        <div className="sots-callout__text">
          <p className="sots-callout__kicker">New &middot; {issue.season}</p>
          <h2 id="sots-callout-title" className="sots-callout__title">
            {issue.title}, Issue {issue.issue}
          </h2>
          <p className="sots-callout__description">
            The server's newsletter. Everything we counted from {issue.covers}: the numbers, the hall
            of fame, most wanted, the danger map and more. Read it right here on the site.
          </p>
          <Link to="/sots" className="sots-callout__button">
            Read Issue {issue.issue}
          </Link>
        </div>
      </div>
    </section>
  );
}
