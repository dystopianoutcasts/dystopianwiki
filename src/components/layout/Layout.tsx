import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileMenu } from './MobileMenu';

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
        <Header onMobileMenuToggle={handleMobileMenuToggle} />
      )}
      <MobileMenu isOpen={mobileMenuOpen} onClose={handleMobileMenuClose} />
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
}
