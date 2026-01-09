import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { QuickstartGrid } from '../components/landing/QuickstartGrid';
import { SectionBrowser } from '../components/landing/SectionBrowser';
import { CommunityBanner } from '../components/landing/CommunityBanner';
import { WhyThisWiki } from '../components/landing/WhyThisWiki';
import { SEOHead } from '../components/seo/SEOHead';

export function HomePage() {
  return (
    <Layout>
      <SEOHead
        title="Project Zomboid Modding Wiki"
        description="The ultimate Project Zomboid modding wiki. Free tutorials for Lua scripting, custom items, recipes, weapons, and game mechanics. Start modding today!"
      />
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
