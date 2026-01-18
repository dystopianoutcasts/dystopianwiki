import { Link } from 'react-router-dom';
import '../../styles/components/game-cards.css';

interface GameCard {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Path to game icon/logo
  color: string; // Primary color for the card
  url: string; // Link to game's TOC
  comingSoon?: boolean;
}

const games: GameCard[] = [
  {
    id: 'project-zomboid',
    name: 'Project Zomboid',
    shortName: 'PZ',
    description: 'Modding guides, Lua API reference, and vanilla documentation for the ultimate zombie survival sandbox.',
    icon: '/assets/games/pz-icon.png',
    color: '#4a7c59', // Zombie green
    url: '/pz/build-41/modding',
  },
  {
    id: 'vintage-story',
    name: 'Vintage Story',
    shortName: 'VS',
    description: 'Coming soon: modding documentation, server guides, and gameplay tips for the wilderness survival game.',
    icon: '/assets/games/vs-icon.png',
    color: '#8b6914', // Vintage amber/brown
    url: '/vs',
    comingSoon: true,
  },
];

export function GameCards() {
  return (
    <section className="game-cards">
      <h2 className="game-cards__title">Choose Your Game</h2>
      <p className="game-cards__subtitle">
        Select a game to access documentation, guides, and resources
      </p>
      <div className="game-cards__grid">
        {games.map((game) => (
          game.comingSoon ? (
            <div
              key={game.id}
              className="game-card game-card--coming-soon"
              style={{ '--game-color': game.color } as React.CSSProperties}
            >
              <div className="game-card__icon-wrapper">
                <img
                  src={game.icon}
                  alt={game.name}
                  className="game-card__icon"
                  onError={(e) => {
                    // Fallback to text if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="game-card__icon-fallback">{game.shortName}</span>
              </div>
              <div className="game-card__content">
                <h3 className="game-card__name">{game.name}</h3>
                <p className="game-card__description">{game.description}</p>
              </div>
              <span className="game-card__badge">Coming Soon</span>
            </div>
          ) : (
            <Link
              key={game.id}
              to={game.url}
              className="game-card"
              style={{ '--game-color': game.color } as React.CSSProperties}
            >
              <div className="game-card__icon-wrapper">
                <img
                  src={game.icon}
                  alt={game.name}
                  className="game-card__icon"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="game-card__icon-fallback">{game.shortName}</span>
              </div>
              <div className="game-card__content">
                <h3 className="game-card__name">{game.name}</h3>
                <p className="game-card__description">{game.description}</p>
              </div>
              <span className="game-card__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          )
        ))}
      </div>
    </section>
  );
}
