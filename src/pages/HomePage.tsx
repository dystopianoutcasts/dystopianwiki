import { HeroSection } from '../components/landing/HeroSection';
import { QuickstartGrid } from '../components/landing/QuickstartGrid';
import { SectionBrowser } from '../components/landing/SectionBrowser';
import { CommunityBanner } from '../components/landing/CommunityBanner';

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <QuickstartGrid />
      <SectionBrowser />
      <CommunityBanner />
    </main>
  );
}
