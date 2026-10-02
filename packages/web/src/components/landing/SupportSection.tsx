import { SUPPORT_URL } from '../../lib/links';
import '../../styles/components/support-section.css';

export function SupportSection() {
  return (
    <section className="support-section" aria-labelledby="support-section-title">
      <div className="support-section__content">
        <div className="support-section__text">
          <h2 id="support-section-title" className="support-section__title">
            Help keep the server running
          </h2>
          <p className="support-section__description">
            Dystopian Outcasts is hosted by Indifferent Broccoli, who run all of our servers.
            A donation goes straight to them, and all of it pays for Dystopian Outcasts
            servers, nothing else. Even $0.50 helps. We hope to keep the server going for
            years, and that is easier with the whole community behind it.
          </p>
        </div>
        <div className="support-section__action">
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="support-section__button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Support Dystopian Outcasts</span>
            <span className="sr-only">
              {' '}(opens the Indifferent Broccoli payment page in a new tab)
            </span>
          </a>
          <p className="support-section__note" aria-hidden="true">Opens the Indifferent Broccoli payment page.</p>
        </div>
      </div>
    </section>
  );
}
