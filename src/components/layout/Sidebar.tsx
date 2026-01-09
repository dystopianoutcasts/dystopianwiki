import { useState } from 'react';
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
  articleCount?: number;
}

interface SectionData {
  id: string;
  name: string;
  icon: string;
  categories: Category[];
}

// Default sidebar data
const sidebarSections: SectionData[] = [
  {
    id: 'modding',
    name: 'Modding',
    icon: '🔌',
    categories: [
      { id: 'lua-api', name: 'Lua API', icon: '📜', articleCount: 8 },
      { id: 'recipes', name: 'Recipes', icon: '🔧', articleCount: 6 },
      { id: 'items', name: 'Items', icon: '🎮', articleCount: 5 },
      { id: 'game-mechanics', name: 'Game Mechanics', icon: '🩹', articleCount: 8 },
      { id: 'weapon-repair', name: 'Weapon Repair', icon: '⚔️', articleCount: 9 },
      { id: 'foraging', name: 'Foraging', icon: '🌿', articleCount: 4 },
      { id: 'tools', name: 'Tools', icon: '🛠️', articleCount: 3 },
    ],
  },
  {
    id: 'mapping',
    name: 'Mapping',
    icon: '🗺️',
    categories: [
      { id: 'tilezed', name: 'TileZed', icon: '🏗️', articleCount: 4 },
      { id: 'worlded', name: 'WorldEd', icon: '🌍', articleCount: 3 },
      { id: 'buildings', name: 'Buildings', icon: '🏠', articleCount: 3 },
      { id: 'terrain', name: 'Terrain', icon: '⛰️', articleCount: 2 },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ isOpen = false, onClose, collapsed = false }: SidebarProps) {
  const { version = 'build-41', section: currentSection, category: currentCategory } = useParams();
  const [expandedSections, setExpandedSections] = useState<string[]>(['modding', 'mapping']);

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
        {sidebarSections.map((section) => {
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
                        {category.articleCount !== undefined && (
                          <span className="sidebar__category-count">{category.articleCount}</span>
                        )}
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
