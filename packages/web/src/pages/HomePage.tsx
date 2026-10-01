import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { ServerNow } from '../components/landing/ServerNow';
import { AboutSection } from '../components/landing/AboutSection';
import { MascotVoteCallout } from '../components/landing/MascotVoteCallout';
import { CommunityBanner } from '../components/landing/CommunityBanner';
import { SEOHead } from '../components/seo/SEOHead';

export function HomePage() {
  return (
    <Layout>
      <SEOHead
        title="Dystopian Outcasts"
        description="Dystopian Outcasts is a Project Zomboid community: a multiplayer server with a live map, our own mods, and free modding guides for Lua scripting, items, recipes and game mechanics."
      />
      <main>
        <HeroSection />
        <MascotVoteCallout />
        <ServerNow />
        <AboutSection />
        <CommunityBanner />
      </main>
    </Layout>
  );
}
