import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { useVersionInfo, useSections } from '../hooks/useWikiData';
import '../styles/pages/version-page.css';

export function VersionPage() {
  const { version = 'build-41' } = useParams<{ version: string }>();
  const { data: versionInfo, loading: versionLoading, error: versionError } = useVersionInfo(version);
  const { data: sections, loading: sectionsLoading } = useSections();

  const isLoading = versionLoading || sectionsLoading;

  if (isLoading) {
    return (
      <Layout>
        <WikiLayout showSidebar={false}>
          <div className="version-page">
            <div className="version-page__loading">Loading version information...</div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  if (versionError || !versionInfo) {
    return (
      <Layout>
        <WikiLayout showSidebar={false}>
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

  const availableSections = sections?.filter(s =>
    versionInfo.sections.includes(s.id)
  ) || [];

  return (
    <Layout>
      <WikiLayout showSidebar={false}>
        <div className="version-page">
          <header className="version-page__header">
            <div className="version-page__badge">
              {versionInfo.status === 'current' && (
                <span className="version-page__status version-page__status--current">Current</span>
              )}
              {versionInfo.status === 'legacy' && (
                <span className="version-page__status version-page__status--legacy">Legacy</span>
              )}
              {versionInfo.status === 'upcoming' && (
                <span className="version-page__status version-page__status--upcoming">Upcoming</span>
              )}
            </div>
            <h1 className="version-page__title">{versionInfo.name}</h1>
            {versionInfo.description && (
              <p className="version-page__description">{versionInfo.description}</p>
            )}
          </header>

          <section className="version-page__sections">
            <h2 className="version-page__sections-title">Browse Documentation</h2>
            <div className="version-page__sections-grid">
              {availableSections.map((section) => (
                <Link
                  key={section.id}
                  to={`/${version}/${section.id}`}
                  className="version-page__section-card"
                >
                  <span className="version-page__section-icon">
                    {section.id === 'modding' ? '🔌' : '🗺️'}
                  </span>
                  <div className="version-page__section-content">
                    <h3 className="version-page__section-name">{section.name}</h3>
                    <p className="version-page__section-description">{section.description}</p>
                  </div>
                  <span className="version-page__section-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>

          {versionInfo.features && versionInfo.features.length > 0 && (
            <section className="version-page__features">
              <h2 className="version-page__features-title">Version Features</h2>
              <ul className="version-page__features-list">
                {versionInfo.features.map((feature, index) => (
                  <li key={index} className="version-page__feature">
                    <span className="version-page__feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </WikiLayout>
    </Layout>
  );
}
