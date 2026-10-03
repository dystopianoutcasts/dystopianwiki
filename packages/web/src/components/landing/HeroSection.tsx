import { useNavigate } from 'react-router-dom';
import { FuzzySearchBar } from '../search/FuzzySearchBar';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import {
  formatDuration,
  isServerOnline,
  modeBadge,
  settingRows,
  TBD,
  type HomeSummary,
} from '../../lib/homeSummary';
import { SERVER_ADDRESS } from '../../lib/links';
import { homeWorldLine } from '../../lib/worldsPanel';
import '../../styles/components/hero.css';
import '../../styles/components/home-sections.css';

/**
 * The live line under the title: online or offline, survivors on now, time since
 * the last restart. Words carry the state, the dot only repeats it.
 */
function ServerStatus({ summary }: { summary: HomeSummary | null }) {
  const online = isServerOnline(summary, new Date());
  if (online === null || !summary) {
    return (
      <p className="home-status">
        <span className="home-status__dot home-status__dot--unknown" aria-hidden="true" />
        Server status: {TBD}
      </p>
    );
  }
  const people = summary.onlineNow === 1 ? '1 survivor' : `${summary.onlineNow} survivors`;
  return (
    <p className="home-status">
      <span
        className={`home-status__dot ${online ? 'home-status__dot--online' : 'home-status__dot--offline'}`}
        aria-hidden="true"
      />
      <strong>{online ? 'Online' : 'Offline'}</strong>
      {online ? <span>{people} on now</span> : <span>restarting or down</span>}
      {online && summary.upSince && (
        <span>up {formatDuration(Date.now() - summary.upSince.getTime())}</span>
      )}
    </p>
  );
}

/** Which world this is and since when: a quiet line under the badges, nothing until the server says. */
function WorldLine({ summary }: { summary: HomeSummary | null }) {
  const text = summary ? homeWorldLine(summary.worldSeq, summary.worldStartedAt) : null;
  return text ? <p className="home-world">{text}</p> : null;
}

/** The few settings a player decides on first. TBD until the server reports them. */
function HeroBadges({ summary }: { summary: HomeSummary | null }) {
  const rows = Object.fromEntries(settingRows(summary).map((r) => [r.label, r.value]));
  const badges = [
    { label: 'Mode', value: modeBadge(summary) },
    { label: 'Slots', value: rows['Player slots'] },
    { label: 'Zombies', value: rows['Zombie population'] },
    { label: 'Speed', value: rows['Zombie speed'] },
    { label: 'XP', value: rows['XP rate'] },
    { label: 'World age', value: rows['World age'] },
  ];
  return (
    <ul className="home-badges" aria-label="Server at a glance">
      {badges.map((b) => (
        <li key={b.label} className={b.value === TBD ? 'home-badge home-badge--tbd' : 'home-badge'}>
          <span className="home-badge__label">{b.label}</span>
          <span className="home-badge__value">{b.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const { summary } = useHomeSummary();
  const description = typeof summary?.settings.PublicDescription === 'string'
    ? summary.settings.PublicDescription.trim()
    : '';

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

        <ServerStatus summary={summary} />

        {/* The server's own browser description when it has one. */}
        <p className="hero__subtitle">
          {description !== '' ? (
            description
          ) : (
            <>
              A <em>Project Zomboid</em> community. We play together, build mods, and write down what we learn.
            </>
          )}
        </p>

        <HeroBadges summary={summary} />
        <WorldLine summary={summary} />

        {/*
          Plain <a>, not react-router's Link (T43, 2026-09-29): /map/ is a
          separately built static app committed at map/, not a route inside
          this SPA, same reason as the header's Map link (T20).
        */}
        <div className="hero__actions hero__actions--split">
          <a
            href="https://discord.gg/KgNBWyfcvZ"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__learn-btn"
          >
            Join our Discord
          </a>
          <a href="/map/" className="hero__learn-btn hero__learn-btn--secondary">
            See the live map
          </a>
        </div>
        <p className="home-address">
          Server address: <code className="home-address__value">{SERVER_ADDRESS}</code>
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
