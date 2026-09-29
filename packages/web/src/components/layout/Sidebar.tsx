import { useMemo, useState } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { getVersion, DEFAULT_VERSION } from '../../config/versions.generated';
import '../../styles/components/sidebar.css';

// Chevron icon
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Icon mapping from the short icon words written into _section.json /
// _category.json (contract C2) to the emoji the sidebar renders. Keeps every
// word that has ever appeared in build-41 or build-42 content-tree metadata
// so neither version regresses to showing a raw word.
const iconMap: Record<string, string> = {
  book: '📖',
  box: '🎮',
  cog: '🩹',
  database: '🗄️',
  'file-text': '📄',
  hammer: '⚔️',
  layout: '🖥️',
  leaf: '🌿',
  scroll: '📜',
  settings: '⚙️',
  sparkles: '✨',
  tool: '🛠️',
  video: '🎬',
  wrench: '🔧',
  zap: '⚡',
  plug: '🔌',
  car: '🚗',
  gear: '⚙️',
  map: '🗺️',
  grid: '🏗️',
  globe: '🌍',
  building: '🏠',
  mountain: '⛰️',
};

function resolveIcon(icon: string): string {
  return iconMap[icon] || iconMap.book;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ isOpen = false, onClose, collapsed = false }: SidebarProps) {
  const { version = DEFAULT_VERSION, section: currentSection, category: currentCategory } = useParams();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['modding']);

  // Determine game prefix from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  const gamePrefix = pathParts[0] === 'pz' ? `/${pathParts[0]}` : '';

  // Sections and categories come from the generated module (contract C1),
  // written by scripts/build-nav.ts. No network fetch needed.
  const sections = useMemo(() => {
    const versionInfo = getVersion(version);
    if (!versionInfo) return [];

    return versionInfo.sections
      .map((section) => ({
        ...section,
        categories: section.categories.filter((category) => category.articleCount > 0),
      }))
      .filter((section) => section.categories.length > 0);
  }, [version]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

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
            to={`${gamePrefix}/learning-path`}
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
                    {resolveIcon(section.icon)}
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
                        to={`${gamePrefix}/${version}/${section.id}/${category.id}`}
                        className={`sidebar__category-link ${isActive ? 'sidebar__category-link--active' : ''}`}
                        onClick={onClose}
                      >
                        <span className="sidebar__category-icon" role="img" aria-hidden="true">
                          {resolveIcon(category.icon)}
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
