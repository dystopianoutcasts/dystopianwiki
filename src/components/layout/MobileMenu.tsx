import { NavLink } from 'react-router-dom';
import '../../styles/components/mobile-menu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  version?: string;
}

export function MobileMenu({ isOpen, onClose, version = 'build-41' }: MobileMenuProps) {
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
              to="/learning-path"
              className={({ isActive }) =>
                `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="mobile-menu__nav-icon">📚</span>
              Learning Path
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
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="mobile-menu__nav-icon">🔍</span>
              Search
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
}
