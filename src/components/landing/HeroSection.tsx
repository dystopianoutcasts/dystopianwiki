import { useNavigate } from 'react-router-dom';
import { FuzzySearchBar } from '../search/FuzzySearchBar';
import '../../styles/components/hero.css';

interface HeroSectionProps {
  defaultVersion?: string;
}

export function HeroSection({ defaultVersion = 'build-41' }: HeroSectionProps) {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&version=${defaultVersion}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero__gradient" />

      {/* Decorative blurs */}
      <div className="hero__decoration hero__decoration--left" />
      <div className="hero__decoration hero__decoration--right" />

      <div className="hero__content">
        {/* Banner Logo */}
        <img
          src="/assets/banners/dystopian-outcasts-banner-1024.png"
          alt="Dystopian Outcasts"
          className="hero__logo"
        />

        {/* Title */}
        <h1 className="hero__title">Project Zomboid Modding Wiki</h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          Your guide to surviving the apocalypse... <em>with code</em>
        </p>

        {/* Search Bar */}
        <div className="hero__search">
          <FuzzySearchBar
            placeholder="Search documentation..."
            onSearch={handleSearch}
            autoFocus={false}
            size="large"
          />
        </div>
      </div>
    </section>
  );
}
