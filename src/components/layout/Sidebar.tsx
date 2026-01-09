import { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import '../../styles/components/sidebar.css';

// Chevron icon
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  articleCount: number;
}

interface CategoriesData {
  categories: Category[];
}

interface SectionData {
  id: string;
  name: string;
  icon: string;
  categories: Category[];
}

// Icon mapping from categories.json icon names to emojis
const iconMap: Record<string, string> = {
  scroll: '📜',
  wrench: '🔧',
  box: '🎮',
  cog: '🩹',
  hammer: '⚔️',
  leaf: '🌿',
  tool: '🛠️',
  grid: '🏗️',
  globe: '🌍',
  building: '🏠',
  mountain: '⛰️',
};

// Section definitions (static, but categories loaded dynamically)
const sectionDefinitions = [
  { id: 'modding', name: 'Modding', icon: '🔌' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ isOpen = false, onClose, collapsed = false }: SidebarProps) {
  const { version = 'build-41', section: currentSection, category: currentCategory } = useParams();
  const [expandedSections, setExpandedSections] = useState<string[]>(['modding']);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const loadedSections: SectionData[] = [];

        for (const sectionDef of sectionDefinitions) {
          try {
            const response = await fetch(`/data/${version}/${sectionDef.id}/categories.json`);
            if (response.ok) {
              const data: CategoriesData = await response.json();

              // Filter out categories with 0 articles and map icons
              const categoriesWithArticles = data.categories
                .filter(cat => cat.articleCount > 0)
                .map(cat => ({
                  ...cat,
                  icon: iconMap[cat.icon] || cat.icon,
                }));

              if (categoriesWithArticles.length > 0) {
                loadedSections.push({
                  ...sectionDef,
                  categories: categoriesWithArticles,
                });
              }
            }
          } catch (err) {
            console.warn(`Failed to load categories for ${sectionDef.id}`);
          }
        }

        setSections(loadedSections);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [version]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (loading) {
    return (
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        <div className="sidebar__loading">Loading...</div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar__backdrop ${isOpen ? 'sidebar__backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${collapsed ? 'sidebar--collapsed' : ''}`}
        role="navigation"
        aria-label="Wiki navigation"
      >
        {/* Learning Path Link */}
        <div className="sidebar__learning-path">
          <NavLink
            to="/learning-path"
            className={({ isActive }) =>
              `sidebar__learning-link ${isActive ? 'sidebar__learning-link--active' : ''}`
            }
            onClick={onClose}
          >
            <span className="sidebar__learning-icon" role="img" aria-hidden="true">
              &#128218;
            </span>
            <span>Learning Path</span>
          </NavLink>
        </div>

        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const isActiveSection = currentSection === section.id;

          return (
            <div
              key={section.id}
              className={`sidebar__section ${isExpanded ? 'sidebar__section--expanded' : ''}`}
            >
              {/* Section Header */}
              <div
                className="sidebar__section-header"
                onClick={() => toggleSection(section.id)}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleSection(section.id)}
              >
                <span className="sidebar__section-title">
                  <span className="sidebar__section-icon" role="img" aria-hidden="true">
                    {section.icon}
                  </span>
                  <span>{section.name}</span>
                </span>
                <span className="sidebar__section-chevron">
                  <ChevronIcon />
                </span>
              </div>

              {/* Category List */}
              <ul className="sidebar__categories" role="list">
                {section.categories.map((category) => {
                  const isActive = isActiveSection && currentCategory === category.id;

                  return (
                    <li key={category.id} className="sidebar__category">
                      <NavLink
                        to={`/${version}/${section.id}/${category.id}`}
                        className={`sidebar__category-link ${isActive ? 'sidebar__category-link--active' : ''}`}
                        onClick={onClose}
                      >
                        <span className="sidebar__category-icon" role="img" aria-hidden="true">
                          {category.icon}
                        </span>
                        <span>{category.name}</span>
                        <span className="sidebar__category-count">{category.articleCount}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </aside>
    </>
  );
}
