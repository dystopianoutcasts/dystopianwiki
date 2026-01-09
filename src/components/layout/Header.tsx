import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/components/header.css';

// Icons
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <img
            src="/assets/branding/benny_transparentBg_512.png"
            alt="Benny - Dystopian Outcasts mascot"
            className="header__logo-image"
          />
          <span className="header__logo-text">PZ Modding Wiki</span>
        </Link>

        {/* Navigation */}
        <nav className="header__nav">
          <NavLink
            to="/build-41/modding"
            className={({ isActive }) =>
              `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
            }
          >
            Modding
          </NavLink>
          {/* Mapping link hidden until section has content */}
        </nav>

        {/* Actions */}
        <div className="header__actions">
          {/* Version Selector */}
          <select className="header__version-select" defaultValue="build-41">
            <option value="build-41">Build 41</option>
          </select>

          {/* Theme Toggle */}
          <button
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

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
