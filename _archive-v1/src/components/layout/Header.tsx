import { Link, NavLink } from 'react-router-dom';
import { FuzzySearchBar } from '../search/FuzzySearchBar';
import '../../styles/components/header.css';

// Icons
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <img
            src="/assets/branding/benny/benny-512.png"
            alt="Benny - Dystopian Outcasts mascot"
            className="header__logo-image"
          />
          <span className="header__logo-text">PZ Modding Wiki</span>
        </Link>

        {/* Navigation */}
        <nav className="header__nav">
          <NavLink
            to="/learning-path"
            className={({ isActive }) =>
              `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
            }
          >
            Learning Path
          </NavLink>
          <NavLink
            to="/build-41/modding"
            className={({ isActive }) =>
              `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
            }
          >
            Modding
          </NavLink>
          <NavLink
            to="/build-41/mapping"
            className={({ isActive }) =>
              `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
            }
          >
            Mapping
          </NavLink>
        </nav>

        {/* Search Bar */}
        <div className="header__search">
          <FuzzySearchBar placeholder="Search docs..." />
        </div>

        {/* Actions */}
        <div className="header__actions">
          {/* Version Selector */}
          <select className="header__version-select" defaultValue="build-41">
            <option value="build-41">Build 41</option>
          </select>

          {/* Mobile Menu Button */}
          <button
            className="header__mobile-menu-btn"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
