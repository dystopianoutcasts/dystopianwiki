import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileMenu } from './MobileMenu';
import { AuthErrorFlash } from '../auth/AuthErrorFlash';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function Layout({ children, hideHeader = false, hideFooter = false }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {!hideHeader && (
        <Header onMobileMenuToggle={handleMobileMenuToggle} mobileMenuOpen={mobileMenuOpen} />
      )}
      <MobileMenu isOpen={mobileMenuOpen} onClose={handleMobileMenuClose} />
      <AuthErrorFlash />
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
}
