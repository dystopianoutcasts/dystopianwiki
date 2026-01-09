import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/cards.css';

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
}

interface SectionData {
  id: string;
  icon: string;
  title: string;
  description: string;
  categories: Category[];
  color: 'primary' | 'accent';
  totalArticles: number;
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

export function SectionBrowser({ version = 'build-41' }: SectionBrowserProps) {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        // Fetch sections list
        const sectionsRes = await fetch('/data/sections.json');
        const sectionsData = await sectionsRes.json();

        // For each section, fetch categories to get article counts
        const sectionsWithCategories: SectionData[] = await Promise.all(
          sectionsData.sections.map(async (section: { id: string; name: string; description: string; icon: string }) => {
            try {
              const categoriesRes = await fetch(`/data/${version}/${section.id}/categories.json`);
              const categoriesData = await categoriesRes.json();
              const categories = categoriesData.categories || [];
              const totalArticles = categories.reduce((sum: number, cat: Category) => sum + (cat.articleCount || 0), 0);

              return {
                id: section.id,
                icon: section.icon,
                title: section.name,
                description: sectionMeta[section.id]?.description || section.description,
                categories,
                color: sectionMeta[section.id]?.color || 'primary',
                totalArticles,
              };
            } catch {
              return {
                id: section.id,
                icon: section.icon,
                title: section.name,
                description: sectionMeta[section.id]?.description || section.description,
                categories: [],
                color: sectionMeta[section.id]?.color || 'primary',
                totalArticles: 0,
              };
            }
          })
        );

        // Filter out sections with zero articles
        const visibleSections = sectionsWithCategories.filter(s => s.totalArticles > 0);
        setSections(visibleSections);
      } catch (error) {
        console.error('Failed to load sections:', error);
        setSections([]);
      } finally {
        setLoading(false);
      }
    }

    loadSections();
  }, [version]);

  if (loading) {
    return (
      <section className="section-browser">
        <h2 className="section-browser__title">Browse by Section</h2>
        <div className="section-browser__loading">Loading sections...</div>
      </section>
    );
  }

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
              {section.categories
                .filter(cat => cat.articleCount > 0)
                .map((cat) => (
                  <li key={cat.id}>{cat.name}</li>
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
