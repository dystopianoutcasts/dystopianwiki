import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { ServerNow } from '../components/landing/ServerNow';
import { AboutSection } from '../components/landing/AboutSection';
import { CommunityBanner } from '../components/landing/CommunityBanner';
import { SEOHead } from '../components/seo/SEOHead';

export function HomePage() {
  return (
    <Layout>
      <SEOHead
        title="Dystopian Outcasts Wiki"
        description="The Dystopian Outcasts wiki - modding guides, server documentation, and community resources for Project Zomboid."
      />
      <main>
        <HeroSection />
        <ServerNow />
        <AboutSection />
        <CommunityBanner />
      </main>
    </Layout>
  );
}
