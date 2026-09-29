import { useNavigate } from 'react-router-dom';
import { FuzzySearchBar } from '../search/FuzzySearchBar';
import '../../styles/components/hero.css';

export function HeroSection() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero__gradient" />

      {/* Decorative blurs */}
      <div className="hero__decoration hero__decoration--left" />
      <div className="hero__decoration hero__decoration--right" />

      <div className="hero__content">
        {/* Banner Logo - Links to Discord */}
        <a
          href="https://discord.gg/KgNBWyfcvZ"
          target="_blank"
          rel="noopener noreferrer"
          className="hero__logo-link"
          aria-label="Join Dystopian Outcasts Discord"
        >
          <img
            src="/assets/banners/dystopian-outcasts-banner-1024.png"
            alt="Dystopian Outcasts"
            className="hero__logo"
          />
        </a>

        {/* Title */}
        <h1 className="hero__title">Dystopian Outcasts</h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          A <em>Project Zomboid</em> community. We play together, build mods, and write down what we learn.
        </p>

        {/* Search Bar */}
        <div className="hero__search">
          <FuzzySearchBar
            placeholder="Search all documentation..."
            onSearch={handleSearch}
            autoFocus={false}
            size="large"
          />
        </div>

        {/*
          Plain <a>, not react-router's Link (T43, 2026-09-29): /map/ is a
          separately built static app committed at map/, not a route inside
          this SPA, same reason as the header's Map link (T20).
        */}
        <div className="hero__actions hero__actions--split">
          <a href="/map/" className="hero__learn-btn">
            See the live map
          </a>
          <a
            href="https://discord.gg/KgNBWyfcvZ"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__learn-btn hero__learn-btn--secondary"
          >
            Join the Discord
          </a>
        </div>
      </div>
    </section>
  );
}
