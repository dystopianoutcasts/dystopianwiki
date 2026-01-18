import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { GameCards } from '../components/landing/GameCards';
import { AboutSection } from '../components/landing/AboutSection';
import { CommunityBanner } from '../components/landing/CommunityBanner';
import { SEOHead } from '../components/seo/SEOHead';

export function HomePage() {
  return (
    <Layout>
      <SEOHead
        title="Dystopian Outcasts Wiki"
        description="The Dystopian Outcasts wiki - modding guides, server documentation, and community resources for Project Zomboid, Vintage Story, and more survival games."
      />
      <main>
        <HeroSection />
        <GameCards />
        <AboutSection />
        <CommunityBanner />
      </main>
    </Layout>
  );
}
