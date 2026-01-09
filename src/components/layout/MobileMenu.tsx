import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/components/mobile-menu.css';

// Icons
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  version?: string;
}

const moddingCategories = [
  { id: 'lua-api', name: 'Lua API', icon: '📜' },
  { id: 'recipes', name: 'Recipes', icon: '🔧' },
  { id: 'items', name: 'Items', icon: '🎮' },
  { id: 'game-mechanics', name: 'Game Mechanics', icon: '🩹' },
  { id: 'weapon-repair', name: 'Weapon Repair', icon: '⚔️' },
  { id: 'foraging', name: 'Foraging', icon: '🌿' },
  { id: 'tools', name: 'Tools', icon: '🛠️' },
];

const mappingCategories = [
  { id: 'tilezed', name: 'TileZed', icon: '🏗️' },
  { id: 'worlded', name: 'WorldEd', icon: '🌍' },
  { id: 'buildings', name: 'Buildings', icon: '🏠' },
  { id: 'terrain', name: 'Terrain', icon: '⛰️' },
];

export function MobileMenu({ isOpen, onClose, version = 'build-41' }: MobileMenuProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-menu__backdrop ${isOpen ? 'mobile-menu__backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <nav
        className={`mobile-menu ${isOpen ? 'mobile-menu--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu__content">
          {/* Main Nav */}
          <div className="mobile-menu__nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
              }
              onClick={onClose}
              end
            >
              <span className="mobile-menu__nav-icon">🏠</span>
              Home
            </NavLink>
            <NavLink
              to={`/${version}/modding`}
              className={({ isActive }) =>
                `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="mobile-menu__nav-icon">🔌</span>
              Modding
            </NavLink>
            <NavLink
              to={`/${version}/mapping`}
              className={({ isActive }) =>
                `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="mobile-menu__nav-icon">🗺️</span>
              Mapping
            </NavLink>
          </div>

          <div className="mobile-menu__divider" />

          {/* Modding Section */}
          <div className="mobile-menu__section">
            <div className="mobile-menu__section-title">Modding</div>
            <div className="mobile-menu__section-links">
              {moddingCategories.map((cat) => (
                <NavLink
                  key={cat.id}
                  to={`/${version}/modding/${cat.id}`}
                  className="mobile-menu__section-link"
                  onClick={onClose}
                >
                  <span role="img" aria-hidden="true">{cat.icon}</span>
                  {cat.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Mapping Section */}
          <div className="mobile-menu__section">
            <div className="mobile-menu__section-title">Mapping</div>
            <div className="mobile-menu__section-links">
              {mappingCategories.map((cat) => (
                <NavLink
                  key={cat.id}
                  to={`/${version}/mapping/${cat.id}`}
                  className="mobile-menu__section-link"
                  onClick={onClose}
                >
                  <span role="img" aria-hidden="true">{cat.icon}</span>
                  {cat.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mobile-menu__divider" />

          {/* Theme Toggle */}
          <div className="mobile-menu__theme">
            <span className="mobile-menu__theme-label">Theme</span>
            <button className="mobile-menu__theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
