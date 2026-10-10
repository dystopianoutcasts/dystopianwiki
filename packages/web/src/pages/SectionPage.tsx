import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { useGameContext } from '../hooks/useGameContext';
import { DEFAULT_VERSION, getSection } from '../config/versions.generated';
import { resolveIcon } from '../components/icons/Icon';
import '../styles/pages/section-page.css';

export function SectionPage() {
  const { version = DEFAULT_VERSION, section = '' } = useParams<{ version: string; section: string }>();
  const { buildPath, gameName } = useGameContext();

  // Section and category data come from the generated navigation module
  // (contract C1), the same source the sidebar reads. Empty categories are hidden.
  const sectionInfo = getSection(version, section);
  const categories = (sectionInfo?.categories ?? []).filter((category) => category.articleCount > 0);

  if (!sectionInfo) {
    return (
      <Layout>
        <WikiLayout>
          <div className="section-page">
            <div className="section-page__error">
              <h1>Section Not Found</h1>
              <p>The requested section "{section}" could not be found.</p>
              <Link to={buildPath(version)} className="section-page__back-link">
                Return to {version}
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
        title={`${sectionInfo.name} - ${gameName || 'Dystopian Outcasts'} ${version}`}
        description={sectionInfo.description || `Browse ${sectionInfo.name} documentation. Tutorials and guides for modders.`}
      />
      <WikiLayout>
        <div className="section-page">
          <header className="section-page__header">
            <span className="section-page__icon" aria-hidden="true">
              {resolveIcon(sectionInfo.icon)}
            </span>
            <h1 className="section-page__title">{sectionInfo.name}</h1>
            <p className="section-page__description">{sectionInfo.description}</p>
          </header>

          {categories.length > 0 && (
            <section className="section-page__categories">
              <h2 className="section-page__categories-title">Categories</h2>
              <div className="section-page__categories-grid">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={buildPath(version, section, category.id)}
                    className="section-page__category-card"
                  >
                    <span className="section-page__category-icon" aria-hidden="true">
                      {resolveIcon(category.icon)}
                    </span>
                    <div className="section-page__category-content">
                      <h3 className="section-page__category-name">{category.name}</h3>
                      <p className="section-page__category-description">{category.description}</p>
                      <span className="section-page__category-count">
                        {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </WikiLayout>
    </Layout>
  );
}
