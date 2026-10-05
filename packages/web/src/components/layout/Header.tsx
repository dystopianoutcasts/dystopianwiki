import { Link, NavLink } from 'react-router-dom';
import { FuzzySearchBar } from '../search/FuzzySearchBar';
import { AuthButton } from '../auth/AuthButton';
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated';
import '../../styles/components/header.css';

/** The top links: a version's sections that have articles, in displayOrder. Shared with MobileMenu. */
export function siteSections(versionId: string) {
  return [...(getVersion(versionId)?.sections ?? [])]
    .filter((s) => s.categories.some((c) => c.articleCount > 0))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * The id of the slide-out menu (MobileMenu), which the header's menu button controls.
 * Prefixed so an article heading's generated id (rehype-slug) cannot collide with it.
 */
export const MOBILE_MENU_ID = 'site-mobile-menu';

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
  /** Whether the slide-out menu is open, announced on the menu button as aria-expanded. */
  mobileMenuOpen?: boolean;
}

export function Header({ onMobileMenuToggle, mobileMenuOpen = false }: HeaderProps) {
  // The same links on every page, matching the live map's copy of this header
  // (packages/aurora/src/site/SiteHeader.tsx): the default version's sections in
  // displayOrder, skipping sections with no articles, then Live Map. Older builds
  // are reached through VersionSelect, in the guide sidebar and the phone menu.
  const navSections = siteSections(DEFAULT_VERSION);

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <img
            src="/assets/branding/mascot-placeholder/placeholder-512.png"
            alt="Mascot placeholder"
            className="header__logo-image"
          />
          <span className="header__logo-text">Dystopian Outcasts</span>
        </Link>

        <nav className="header__nav" aria-label="Site">
          {navSections.map((s) => (
            <NavLink
              key={s.id}
              to={`/pz/${DEFAULT_VERSION}/${s.id}`}
              className={({ isActive }) =>
                `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
              }
            >
              {s.name}
            </NavLink>
          ))}
          {/*
            Plain <a>, not react-router's Link/NavLink (T20, 2026-09-29):
            /map/ is a separately built static app committed at map/, not a
            route inside this SPA. A client-side Link would hijack the click
            and try to virtually route somewhere this app has no match for,
            instead of letting the browser actually request map/index.html.
          */}
          <a href="/map/" className="header__nav-link">Live Map</a>
        </nav>

        {/* Search Bar */}
        <div className="header__search">
          <FuzzySearchBar placeholder="Search docs..." />
        </div>

        {/* Actions */}
        <div className="header__actions">
          <AuthButton />

          {/* Mobile Menu Button */}
          <button
            className="header__mobile-menu-btn"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls={MOBILE_MENU_ID}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
