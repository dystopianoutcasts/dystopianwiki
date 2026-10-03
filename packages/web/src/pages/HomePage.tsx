import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { ServerNow } from '../components/landing/ServerNow';
import { ActivitySection } from '../components/landing/ActivitySection';
import { ServerSettings } from '../components/landing/ServerSettings';
import { JoinSteps } from '../components/landing/JoinSteps';
import { SurvivorsBoard } from '../components/landing/SurvivorsBoard';
import { SeasonRecords } from '../components/landing/SeasonRecords';
import { KillLeaderboard } from '../components/landing/KillLeaderboard';
import { OutcastModsShowcase } from '../components/landing/OutcastModsShowcase';
import { AboutSection } from '../components/landing/AboutSection';
import { MascotVoteCallout } from '../components/landing/MascotVoteCallout';
import { CommunityBanner } from '../components/landing/CommunityBanner';
import { SupportSection } from '../components/landing/SupportSection';
import { SEOHead } from '../components/seo/SEOHead';

// Top to bottom: the server and how to get in, proof it is alive (the map, who is
// on, when people play, who has lasted), how it plays, what we build, who we are.
// Live figures come from aurora.home_summary() (migration 027); anything not
// reported yet reads "TBD".
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
        <ActivitySection />
        <JoinSteps />
        <ServerSettings />
        <SurvivorsBoard />
        <SeasonRecords />
        <KillLeaderboard />
        <OutcastModsShowcase />
        <AboutSection />
        <CommunityBanner />
        <SupportSection />
      </main>
    </Layout>
  );
}
