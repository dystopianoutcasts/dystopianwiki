import { VERSIONS } from '../../config/versions.generated';
import '../../styles/components/about-section.css';

// Real counts read from the generated navigation data (scripts/build-nav.ts),
// not guessed (T43, 2026-09-29). Sum of every category's articleCount across
// every version, and the number of build versions documented.
const ARTICLE_COUNT = VERSIONS.reduce(
  (total, version) =>
    total +
    version.sections.reduce(
      (sectionTotal, section) =>
        sectionTotal + section.categories.reduce((catTotal, cat) => catTotal + cat.articleCount, 0),
      0
    ),
  0
);
const BUILD_COUNT = VERSIONS.length;

export function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-section__content">
        <h2 className="about-section__title">About Dystopian Outcasts</h2>
        <div className="about-section__text">
          <p>
            <strong>Dystopian Outcasts</strong> is a Project Zomboid community. We run a
            multiplayer server, build the mods it runs on, and share what we learn so others
            can do the same.
          </p>
          <p>
            This site holds all of it: the live map of our server, the mods we publish, and a
            wiki of modding guides from a first Lua script to engine internals. Come to play
            and stay to build, or come to learn and stay to play.
          </p>
        </div>
        <div className="about-section__stats">
          <div className="about-section__stat">
            <span className="about-section__stat-value">{ARTICLE_COUNT}+</span>
            <span className="about-section__stat-label">Articles</span>
          </div>
          <div className="about-section__stat">
            <span className="about-section__stat-value">{BUILD_COUNT}</span>
            <span className="about-section__stat-label">Builds</span>
          </div>
          <div className="about-section__stat">
            <span className="about-section__stat-value">Open</span>
            <span className="about-section__stat-label">Source</span>
          </div>
        </div>
      </div>
    </section>
  );
}
