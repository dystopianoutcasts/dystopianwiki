import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { QuickstartGrid } from '../components/landing/QuickstartGrid';
import { SectionBrowser } from '../components/landing/SectionBrowser';
import { CommunityBanner } from '../components/landing/CommunityBanner';
import { WhyThisWiki } from '../components/landing/WhyThisWiki';

export function HomePage() {
  return (
    <Layout>
      <main>
        <HeroSection />
        <QuickstartGrid />
        <SectionBrowser />
        <CommunityBanner />
        <WhyThisWiki />
      </main>
    </Layout>
  );
}
