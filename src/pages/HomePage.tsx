import { HeroSection } from '../components/landing/HeroSection';
import { QuickstartGrid } from '../components/landing/QuickstartGrid';
import { SectionBrowser } from '../components/landing/SectionBrowser';

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <QuickstartGrid />
      <SectionBrowser />
    </main>
  );
}
