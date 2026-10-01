import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FuzzySearchBar } from '../search/FuzzySearchBar';
import { AuthButton } from '../auth/AuthButton';
import { VERSIONS, DEFAULT_VERSION, getVersion } from '../../config/versions.generated';
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
  const location = useLocation();
  const navigate = useNavigate();
  const { version, section, category, slug } = useParams<{
    version?: string;
    section?: string;
    category?: string;
    slug?: string;
  }>();

  // Check if we're on homepage or game-specific pages
  const isHomePage = location.pathname === '/';
  const isInPZContext = location.pathname.startsWith('/pz') ||
                        location.pathname.startsWith(`/${DEFAULT_VERSION}`) ||
                        location.pathname.startsWith('/learning-path');

  const currentVersion = version || DEFAULT_VERSION;

  // Section links follow the current version's sections from the generated
  // navigation module, in displayOrder, skipping sections with no articles.
  // The learning path is Build 41 content, so its link shows only there.
  const navSections = [...(getVersion(currentVersion)?.sections ?? [])]
    .filter((s) => s.categories.some((c) => c.articleCount > 0))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const showLearningPath = currentVersion === 'build-41';

  // Version switcher: preserve as much of the current location as the plan
  // allows. Only /pz/{version}/... URLs get their section/category/slug
  // carried over; every other location just lands on the version page.
  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = event.target.value;
    const pathParts = location.pathname.split('/').filter(Boolean);
    const isPzPrefixed = pathParts[0] === 'pz';

    if (isPzPrefixed && section && category && slug) {
      navigate(`/pz/${newVersion}/${section}/${category}/${slug}`);
    } else if (isPzPrefixed && section) {
      navigate(`/pz/${newVersion}/${section}${category ? `/${category}` : ''}`);
    } else {
      navigate(`/pz/${newVersion}`);
    }
  };

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

        {/* Navigation - changes based on context */}
        <nav className="header__nav">
          {isHomePage ? (
            // Homepage: Show game options
            <NavLink
              to={`/pz/${DEFAULT_VERSION}/modding`}
              className="header__nav-link"
            >
              Project Zomboid
            </NavLink>
          ) : isInPZContext ? (
            // PZ context: Show section links
            <>
              {showLearningPath && (
                <NavLink
                  to="/learning-path"
                  className={({ isActive }) =>
                    `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                  }
                >
                  Learning Path
                </NavLink>
              )}
              {navSections.map((s) => (
                <NavLink
                  key={s.id}
                  to={`/pz/${currentVersion}/${s.id}`}
                  className={({ isActive }) =>
                    `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                  }
                >
                  {s.name}
                </NavLink>
              ))}
            </>
          ) : (
            // Other contexts: placeholder
            <NavLink
                to="/"
                className="header__nav-link"
              >
                All Games
              </NavLink>
          )}
          {/*
            Plain <a>, not react-router's Link/NavLink (T20, 2026-09-29):
            /map/ is a separately built static app committed at map/, not a
            route inside this SPA. A client-side Link would hijack the click
            and try to virtually route somewhere this app has no match for,
            instead of letting the browser actually request map/index.html.
            Always rendered, unlike the branches above, so it survives
            whichever context the visitor is in.
          */}
          <a href="/map/" className="header__nav-link">Map</a>
        </nav>

        {/* Search Bar */}
        <div className="header__search">
          <FuzzySearchBar placeholder="Search docs..." />
        </div>

        {/* Actions */}
        <div className="header__actions">
          <AuthButton />

          {/* Version Selector */}
          <select
            className="header__version-select"
            value={currentVersion}
            onChange={handleVersionChange}
            aria-label="Select documentation version"
          >
            {VERSIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.status === 'legacy' ? ' (legacy)' : ''}
              </option>
            ))}
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
