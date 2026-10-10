import { WikiHeader } from './WikiHeader';
import { Footer } from './Footer';
import { AuthErrorFlash } from '../auth/AuthErrorFlash';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function Layout({ children, hideHeader = false, hideFooter = false }: LayoutProps) {
  return (
    <div className="layout">
      {/* The shared site header (KB15); its folding menu replaces the old slide-out menu. */}
      {!hideHeader && <WikiHeader />}
      <AuthErrorFlash />
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
}
