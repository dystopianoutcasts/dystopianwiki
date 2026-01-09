import { Link } from 'react-router-dom';
import type { QuickstartCard } from '../../types/wiki';
import '../../styles/components/quickstart.css';

const defaultCards: QuickstartCard[] = [
  {
    id: 'lua-api',
    icon: '📜',
    title: 'Lua API',
    description: 'Events, callbacks, and core API reference',
    url: '/build-41/modding/lua-api',
    section: 'modding',
  },
  {
    id: 'recipes',
    icon: '🔧',
    title: 'Recipes',
    description: 'Create custom crafting recipes',
    url: '/build-41/modding/recipes',
    section: 'modding',
  },
  {
    id: 'items',
    icon: '🎮',
    title: 'Items',
    description: 'Define new items and equipment',
    url: '/build-41/modding/items',
    section: 'modding',
  },
  {
    id: 'weapon-repair',
    icon: '⚔️',
    title: 'Weapon Repair',
    description: 'Implement weapon repair systems',
    url: '/build-41/modding/weapon-repair',
    section: 'modding',
  },
  {
    id: 'foraging',
    icon: '🌿',
    title: 'Foraging',
    description: 'Customize the foraging system',
    url: '/build-41/modding/foraging',
    section: 'modding',
  },
  {
    id: 'game-mechanics',
    icon: '🩹',
    title: 'Game Mechanics',
    description: 'Injury, XP, and core systems',
    url: '/build-41/modding/game-mechanics',
    section: 'modding',
  },
  {
    id: 'tools',
    icon: '🛠️',
    title: 'Tools',
    description: 'Debugging and dev utilities',
    url: '/build-41/modding/tools',
    section: 'modding',
  },
];

interface QuickstartGridProps {
  cards?: QuickstartCard[];
}

export function QuickstartGrid({ cards = defaultCards }: QuickstartGridProps) {
  return (
    <section className="quickstart">
      <h2 className="quickstart__title">Quickstart Guides</h2>
      <div className="quickstart__grid">
        {cards.map((card) => (
          <Link
            key={card.id}
            to={card.url}
            className="quickstart-card"
          >
            <span className="quickstart-card__icon" role="img" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="quickstart-card__title">{card.title}</h3>
            <p className="quickstart-card__description">{card.description}</p>
            <span className={`quickstart-card__section quickstart-card__section--${card.section}`}>
              {card.section}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
