import { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useArticleTOC } from '../../context/ArticleContext';
import '../../styles/components/mobile-menu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  version?: string;
}

export function MobileMenu({ isOpen, onClose, version = 'build-41' }: MobileMenuProps) {
  const tocItems = useArticleTOC();

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
