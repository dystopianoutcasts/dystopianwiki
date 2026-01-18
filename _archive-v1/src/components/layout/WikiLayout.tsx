import { Breadcrumbs } from './Breadcrumbs';
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
        {showBreadcrumbs && <Breadcrumbs />}
        <div className="wiki-layout__content">
          {children}
        </div>
      </div>
    </div>
  );
}
