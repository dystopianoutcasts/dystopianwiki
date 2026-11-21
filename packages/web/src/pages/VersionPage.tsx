import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { getVersion, DEFAULT_VERSION } from '../config/versions.generated';
import { resolveIcon } from '../components/icons/Icon';
import { panelCode, StencilCode } from '../components/details/PageDetails';
import { sectionArticleCount, topicsFor } from '../lib/topics';
import '../styles/pages/version-page.css';
import '../styles/components/page-details.css';

// Section icons resolve through the shared resolveIcon (the drawn icon set keyed by
// the icon words written into _section.json and _category.json, contract C2), so a
// new section's icon shows here as it does in the sidebar and the menu.

const statusLabels: Record<string, string> = {
  current: 'Current',
  legacy: 'Legacy',
  upcoming: 'Upcoming',
};

export function VersionPage() {
  const { version = DEFAULT_VERSION } = useParams<{ version: string }>();

  const versionInfo = getVersion(version);
  // The build's big topics (lib/topics.ts); null means show the plain section list.
  const topics = versionInfo ? topicsFor(versionInfo) : null;
  // The stenciled panel code keeps each section's place in the build's full list ("MOD-01").
  const sectionIndexOf = (sectionId: string) =>
    Math.max(0, versionInfo?.sections.findIndex((s) => s.id === sectionId) ?? 0);

  if (!versionInfo) {
    return (
      <Layout>
        <WikiLayout>
          <div className="version-page">
            <div className="version-page__error">
              <h1>Version Not Found</h1>
              <p>The requested version "{version}" could not be found.</p>
              <Link to="/" className="version-page__back-link">
                Return to Home
              </Link>
            </div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${versionInfo.name} Documentation - Project Zomboid Modding`}
        description={versionInfo.description || `Project Zomboid ${versionInfo.name} modding documentation. Tutorials, guides, and API reference.`}
      />
      <WikiLayout>
        <div className="version-page">
          <header className="version-page__header">
            <StencilCode code={`FLIGHT MANUAL | ${versionInfo.name.toUpperCase()}`} />
            <div className="version-page__badge">
              <span className={`version-page__status version-page__status--${versionInfo.status}`}>
                {statusLabels[versionInfo.status] || versionInfo.status}
              </span>
            </div>
            <h1 className="version-page__title">{versionInfo.name}</h1>
            {versionInfo.description && (
              <p className="version-page__description">{versionInfo.description}</p>
            )}
          </header>

          <section className="version-page__sections">
            <h2 className="version-page__sections-title">Browse Documentation</h2>
            {topics ? (
              <div className="version-page__sections-grid">
                {topics.map((topic) => {
                  const only = topic.sections.length === 1 ? topic.sections[0] : null;
                  const count = (
                    <span className="version-page__section-count">
                      {topic.articleCount} {topic.articleCount === 1 ? 'article' : 'articles'}
                    </span>
                  );

                  // A topic with one section is one big link to that section.
                  if (only) {
                    return (
                      <Link
                        key={topic.id}
                        to={`/pz/${version}/${only.id}`}
                        className="version-page__section-card"
                      >
                        <span className="version-page__section-icon" aria-hidden="true">
                          {resolveIcon(topic.icon)}
                        </span>
                        <div className="version-page__section-content">
                          <h3 className="version-page__section-name">{topic.name}</h3>
                          <p className="version-page__section-description">{topic.description}</p>
                          {count}
                        </div>
                        <span className="version-page__section-arrow" aria-hidden="true">→</span>
                        <StencilCode code={panelCode(only.id, sectionIndexOf(only.id))} small />
                      </Link>
                    );
                  }

                  // A topic with several sections: its heading, then one link per section.
                  const headingId = `topic-${topic.id}`;
                  return (
                    <section key={topic.id} className="version-page__topic" aria-labelledby={headingId}>
                      <div className="version-page__topic-header">
                        <span className="version-page__section-icon" aria-hidden="true">
                          {resolveIcon(topic.icon)}
                        </span>
                        <div className="version-page__section-content">
                          <h3 id={headingId} className="version-page__section-name">{topic.name}</h3>
                          <p className="version-page__section-description">{topic.description}</p>
                          {count}
                        </div>
                      </div>
                      <ul className="version-page__topic-sections">
                        {topic.sections.map((section) => {
                          const articles = sectionArticleCount(section);
                          return (
                            <li key={section.id}>
                              <Link to={`/pz/${version}/${section.id}`} className="version-page__topic-section">
                                <span className="version-page__topic-section-icon" aria-hidden="true">
                                  {resolveIcon(section.icon)}
                                </span>
                                <span className="version-page__topic-section-content">
                                  <span className="version-page__topic-section-name">
                                    {section.navName ?? section.name}
                                  </span>
                                  <span className="version-page__topic-section-description">
                                    {section.description}
                                  </span>
                                  <span className="version-page__section-count">
                                    {articles} {articles === 1 ? 'article' : 'articles'}
                                  </span>
                                </span>
                                <span className="version-page__section-arrow" aria-hidden="true">→</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            ) : versionInfo.sections.length === 0 ? (
              <p className="version-page__empty">
                No sections yet for {versionInfo.name}. Check back soon.
              </p>
            ) : (
              <div className="version-page__sections-grid">
                {versionInfo.sections.map((section, sectionIndex) => {
                  const totalArticles = section.categories.reduce(
                    (sum, category) => sum + category.articleCount,
                    0
                  );

                  return (
                    <Link
                      key={section.id}
                      to={`/pz/${version}/${section.id}`}
                      className="version-page__section-card"
                    >
                      <span className="version-page__section-icon" aria-hidden="true">
                        {resolveIcon(section.icon)}
                      </span>
                      <div className="version-page__section-content">
                        <h3 className="version-page__section-name">{section.name}</h3>
                        <p className="version-page__section-description">{section.description}</p>
                        {section.categories.length > 0 && (
                          <ul className="version-page__section-categories">
                            {section.categories
                              .filter((category) => category.articleCount > 0)
                              .map((category) => (
                                <li key={category.id}>
                                  {category.name} ({category.articleCount})
                                </li>
                              ))}
                          </ul>
                        )}
                        <span className="version-page__section-count">
                          {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                      <span className="version-page__section-arrow">→</span>
                      <StencilCode code={panelCode(section.id, sectionIndex)} small />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </WikiLayout>
    </Layout>
  );
}
