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
        <h1 className="hero__title">Dystopian Outcasts Wiki</h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          Modding guides, server docs, and community resources for <em>survival games</em>
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
      </div>
    </section>
  );
}
