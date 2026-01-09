import { Link } from 'react-router-dom';
import '../../styles/components/cards.css';

interface SectionData {
  id: string;
  icon: string;
  title: string;
  description: string;
  categories: string[];
  color: 'primary' | 'accent';
}

const sections: SectionData[] = [
  {
    id: 'modding',
    icon: '🔌',
    title: 'Modding',
    description: 'Learn to create mods for Project Zomboid. From basic Lua scripts to complex game mechanics.',
    categories: ['Lua API', 'Recipes', 'Items', 'Game Mechanics', 'Weapon Repair', 'Foraging', 'Tools'],
    color: 'primary',
  },
  {
    id: 'mapping',
    icon: '🗺️',
    title: 'Mapping',
    description: 'Create custom maps, buildings, and terrain for Project Zomboid using official tools.',
    categories: ['TileZed', 'WorldEd', 'Buildings', 'Terrain'],
    color: 'accent',
  },
];

interface SectionBrowserProps {
  version?: string;
}

export function SectionBrowser({ version = 'build-41' }: SectionBrowserProps) {
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
              {section.categories.map((cat) => (
                <li key={cat}>{cat}</li>
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
