import '../../styles/components/about-section.css';

export function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-section__content">
        <h2 className="about-section__title">About Dystopian Outcasts</h2>
        <div className="about-section__text">
          <p>
            <strong>Dystopian Outcasts</strong> is a community of modders, server operators,
            and survival game enthusiasts. We create mods, host servers, and share knowledge
            to help others get the most out of their favorite games.
          </p>
          <p>
            This wiki serves as our central knowledge base - documenting everything from
            modding APIs and server configuration to gameplay guides and community projects.
            Whether you're a complete beginner or an experienced developer, you'll find
            resources here to help you on your journey.
          </p>
        </div>
        <div className="about-section__stats">
          <div className="about-section__stat">
            <span className="about-section__stat-icon">📝</span>
            <span className="about-section__stat-value">100+</span>
            <span className="about-section__stat-label">Articles</span>
          </div>
          <div className="about-section__stat">
            <span className="about-section__stat-icon">🎮</span>
            <span className="about-section__stat-value">2</span>
            <span className="about-section__stat-label">Games</span>
          </div>
          <div className="about-section__stat">
            <span className="about-section__stat-icon">🤝</span>
            <span className="about-section__stat-value">Open</span>
            <span className="about-section__stat-label">Source</span>
          </div>
        </div>
      </div>
    </section>
  );
}
