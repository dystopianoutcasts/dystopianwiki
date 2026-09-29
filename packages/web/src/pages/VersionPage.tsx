import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { getVersion, DEFAULT_VERSION } from '../config/versions.generated';
import '../styles/pages/version-page.css';

// Icon words come from _section.json (contract C2) and are the same short
// words the sidebar understands. Kept small here on purpose: this page only
// ever renders section-level icons, never category ones.
const sectionIconMap: Record<string, string> = {
  plug: '🔌',
  map: '🗺️',
  car: '🚗',
  gear: '⚙️',
  book: '📖',
};

function resolveSectionIcon(icon: string): string {
  return sectionIconMap[icon] || sectionIconMap.book;
}

const statusLabels: Record<string, string> = {
  current: 'Current',
  legacy: 'Legacy',
  upcoming: 'Upcoming',
};

export function VersionPage() {
  const { version = DEFAULT_VERSION } = useParams<{ version: string }>();

  const versionInfo = getVersion(version);

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
            {versionInfo.sections.length === 0 ? (
              <p className="version-page__empty">
                No sections yet for {versionInfo.name}. Check back soon.
              </p>
            ) : (
              <div className="version-page__sections-grid">
                {versionInfo.sections.map((section) => {
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
                      <span className="version-page__section-icon">
                        {resolveSectionIcon(section.icon)}
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
