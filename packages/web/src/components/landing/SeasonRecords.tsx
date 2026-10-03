import { useId } from 'react';
import { useSeasonRecords } from '../../hooks/useSeasonRecords';
import { awardCards, NO_ONE, sectionTitle, UNAVAILABLE_LINE } from '../../lib/seasonRecords';
import '../../styles/components/home-sections.css';
import '../../styles/components/season-records.css';

// "Season <n> records": six awards for the current world (T54's season_records()).
// Before the function exists every card reads "No one yet".

export function SeasonRecords() {
  const { records, unavailable } = useSeasonRecords();
  const titleId = useId();
  const cards = awardCards(records);

  return (
    <section className="home-section home-section--alt" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          {sectionTitle(records?.worldSeq)}
        </h2>
        <p className="home-section__lead">Records for the current season; a wipe starts a new one.</p>
        <ul className="season-records">
          {cards.map((card) => (
            <li key={card.key} className={card.holder === NO_ONE ? 'season-card season-card--empty' : 'season-card'}>
              <h3 className="season-card__title">
                <svg className="season-card__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm-1 4v1a2 2 0 0 0 1.2 1.8A5 5 0 0 1 7 8V7H6Zm12 0h-1v1c0 .6-.1 1.2-.2 1.8A2 2 0 0 0 18 8V7Z"
                  />
                </svg>
                {card.title}
              </h3>
              <p className="season-card__holder">{card.holder}</p>
              {card.value && <p className="season-card__value">{card.value}</p>}
              {card.detail && <p className="season-card__detail">{card.detail}</p>}
              {card.mapHref && (
                <a className="season-card__link" href={card.mapHref}>
                  See on the map
                </a>
              )}
            </li>
          ))}
        </ul>
        {unavailable && <p className="home-section__note">{UNAVAILABLE_LINE}</p>}
      </div>
    </section>
  );
}
