import { Breadcrumbs } from './Breadcrumbs';
import { VersionSelect } from './VersionSelect';
import '../../styles/components/wiki-layout.css';

interface WikiLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export function WikiLayout({
  children,
  showBreadcrumbs = true,
}: WikiLayoutProps) {
  return (
    <div className="wiki-layout">
      <div className="wiki-layout__main">
        {/* The game build switch lives here since the top bar became the same as the live map's. */}
        <div className="wiki-layout__bar">
          {showBreadcrumbs && <Breadcrumbs />}
          <div className="wiki-layout__version">
            <VersionSelect inline />
          </div>
        </div>
        <div className="wiki-layout__content">
          {children}
        </div>
      </div>
    </div>
  );
}
