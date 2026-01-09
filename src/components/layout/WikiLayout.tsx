import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import '../../styles/components/wiki-layout.css';

interface WikiLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBreadcrumbs?: boolean;
}

export function WikiLayout({
  children,
  showSidebar = true,
  showBreadcrumbs = true,
}: WikiLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`wiki-layout ${!showSidebar ? 'wiki-layout--full-width' : ''}`}>
      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <div className="wiki-layout__main">
        {showBreadcrumbs && <Breadcrumbs />}
        <div className="wiki-layout__content">
          {children}
        </div>
      </div>
    </div>
  );
}
