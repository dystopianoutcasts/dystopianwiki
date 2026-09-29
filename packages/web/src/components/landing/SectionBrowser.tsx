import { Link } from 'react-router-dom';
import { getVersion, DEFAULT_VERSION } from '../../config/versions.generated';
import '../../styles/components/cards.css';

// Section icon words (contract C2) mapped to the emoji this page renders.
const sectionIconMap: Record<string, string> = {
  plug: '🔌',
  map: '🗺️',
  car: '🚗',
  gear: '⚙️',
  book: '📖',
};

function resolveSectionIcon(icon: string): string {
  return sectionIconMap[icon] || sectionIconMap.book;
}

// Static section metadata (colors, extended descriptions)
const sectionMeta: Record<string, { color: 'primary' | 'accent'; description: string }> = {
  modding: {
    color: 'primary',
    description: 'Learn to create mods for Project Zomboid. From basic Lua scripts to complex game mechanics.',
  },
  mapping: {
    color: 'accent',
    description: 'Create custom maps, buildings, and terrain for Project Zomboid using official tools.',
  },
};

interface SectionBrowserProps {
  version?: string;
}

export function SectionBrowser({ version = DEFAULT_VERSION }: SectionBrowserProps) {
  const versionInfo = getVersion(version);

  const sections = (versionInfo?.sections ?? [])
    .map((section) => {
      const categories = section.categories.filter((category) => category.articleCount > 0);
      const totalArticles = categories.reduce((sum, category) => sum + category.articleCount, 0);

      return {
        id: section.id,
        icon: resolveSectionIcon(section.icon),
        title: section.name,
        description: sectionMeta[section.id]?.description || section.description,
        categories,
        color: sectionMeta[section.id]?.color || ('primary' as const),
        totalArticles,
      };
    })
    // Filter out sections with zero articles
    .filter((section) => section.totalArticles > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="section-browser">
      <h2 className="section-browser__title">Browse by Section</h2>
      <div className="section-browser__grid">
        {sections.map((section) => (
          <article
            key={section.id}
            className={`section-card section-card--${section.color}`}
          >
            <div className="section-card__header">
              <span className="section-card__icon" role="img" aria-hidden="true">
                {section.icon}
              </span>
              <h3 className="section-card__title">{section.title}</h3>
            </div>
            <p className="section-card__description">{section.description}</p>
            <ul className="section-card__categories">
              {section.categories.map((category) => (
                <li key={category.id}>{category.name}</li>
              ))}
            </ul>
            <Link to={`/${version}/${section.id}`} className="section-card__link">
              Browse {section.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
