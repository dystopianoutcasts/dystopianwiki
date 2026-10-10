import { Link } from 'react-router-dom';
import type { QuickstartCard } from '../../types/wiki';
import { getSection, DEFAULT_VERSION } from '../../config/versions.generated';
import { Icon } from '../icons/Icon';
import '../../styles/components/quickstart.css';

// Hand-picked category ids for the quickstart row (not every modding
// category, just the ones a brand-new modder is most likely to want first).
const QUICKSTART_CATEGORY_IDS = ['lua-api', 'recipes', 'items', 'tools'];

const QUICKSTART_DESCRIPTIONS: Record<string, string> = {
  'lua-api': 'Events, callbacks, and core API reference',
  recipes: 'Create custom crafting recipes',
  items: 'Define new items and equipment',
  tools: 'Debugging and dev utilities',
};

function buildDefaultCards(version: string): QuickstartCard[] {
  const modding = getSection(version, 'modding');
  if (!modding) return [];

  return QUICKSTART_CATEGORY_IDS.map((id) => modding.categories.find((category) => category.id === id))
    .filter((category): category is NonNullable<typeof category> => !!category && category.articleCount > 0)
    .map((category) => ({
      id: category.id,
      icon: category.icon,
      title: category.name,
      description: QUICKSTART_DESCRIPTIONS[category.id] || category.description,
      url: `/${version}/modding/${category.id}`,
      section: 'modding' as const,
    }));
}

interface QuickstartGridProps {
  cards?: QuickstartCard[];
  version?: string;
}

export function QuickstartGrid({ cards, version = DEFAULT_VERSION }: QuickstartGridProps) {
  const resolvedCards = cards ?? buildDefaultCards(version);

  if (resolvedCards.length === 0) {
    return null;
  }

  return (
    <section className="quickstart">
      <h2 className="quickstart__title">Quickstart Guides</h2>
      <div className="quickstart__grid">
        {resolvedCards.map((card) => (
          <Link
            key={card.id}
            to={card.url}
            className="quickstart-card"
          >
            <span className="quickstart-card__icon" aria-hidden="true">
              <Icon name={card.icon} />
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
