import { useCallback } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useArticleTOC } from '../../context/ArticleContext';
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated';
import { resolveIcon } from './Sidebar';
import '../../styles/components/mobile-menu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  version?: string;
}

export function MobileMenu({ isOpen, onClose, version: versionProp }: MobileMenuProps) {
  const tocItems = useArticleTOC();
  const params = useParams<{ version?: string }>();
  const version = versionProp || params.version || DEFAULT_VERSION;

  // Same rule as the header: sections of the current version in displayOrder,
  // and the Build 41 learning path only on build-41.
  const navSections = [...(getVersion(version)?.sections ?? [])]
    .filter((s) => s.categories.some((c) => c.articleCount > 0))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const showLearningPath = version === 'build-41';

  const handleTocClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      onClose();
    }
  }, [onClose]);

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
            {showLearningPath && (
              <NavLink
                to="/learning-path"
                className={({ isActive }) =>
                  `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
                }
                onClick={onClose}
              >
                <span className="mobile-menu__nav-icon">{resolveIcon('book')}</span>
                Learning Path
              </NavLink>
            )}
            {navSections.map((s) => (
              <NavLink
                key={s.id}
                to={`/pz/${version}/${s.id}`}
                className={({ isActive }) =>
                  `mobile-menu__nav-link ${isActive ? 'mobile-menu__nav-link--active' : ''}`
                }
                onClick={onClose}
              >
                <span className="mobile-menu__nav-icon">{resolveIcon(s.icon)}</span>
                {s.name}
              </NavLink>
            ))}
            {/* Plain <a>, not NavLink (T20): /map/ is a separately built
                static app at map/, not a route inside this SPA. */}
            <a href="/map/" className="mobile-menu__nav-link" onClick={onClose}>
              Map
            </a>
          </div>

          {/* Article TOC (only shown when viewing an article) */}
          {tocItems.length > 0 && (
            <>
              <div className="mobile-menu__divider" />
              <div className="mobile-menu__section">
                <div className="mobile-menu__section-title">On This Page</div>
                <div className="mobile-menu__toc">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`mobile-menu__toc-link mobile-menu__toc-link--level-${item.level}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
