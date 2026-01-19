import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { useCategories } from '../hooks/useSupabase';
import { useGameContext } from '../hooks/useGameContext';
import '../styles/pages/section-page.css';

const categoryIcons: Record<string, string> = {
  'lua-api': '📜',
  'recipes': '🔧',
  'items': '🎮',
  'game-mechanics': '🩹',
  'weapon-repair': '⚔️',
  'foraging': '🌿',
  'tools': '🛠️',
  'tilezed': '🏗️',
  'worlded': '🌍',
  'buildings': '🏠',
  'terrain': '⛰️',
};

export function SectionPage() {
  const { version = 'build-41', section = '', game } = useParams<{ version: string; section: string; game?: string }>();
  const { buildPath, gameName } = useGameContext();

  // For section info, we'll use hardcoded data since it's static
  const sectionInfo = section === 'modding'
    ? { name: 'Modding', description: 'Learn to create mods for Project Zomboid' }
    : { name: 'Mapping', description: 'Create custom maps and worlds' };

  const { data: categories = [], isLoading, isError } = useCategories(game || 'pz', section);

  if (isLoading) {
    return (
      <Layout>
        <WikiLayout>
          <div className="section-page">
            <div className="section-page__loading">Loading section...</div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  if (isError || !sectionInfo) {
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
            <span className="section-page__icon">
              {section === 'modding' ? '🔌' : '🗺️'}
            </span>
            <h1 className="section-page__title">{sectionInfo.name}</h1>
            <p className="section-page__description">{sectionInfo.description}</p>
          </header>

          {categories && categories.length > 0 && (
            <section className="section-page__categories">
              <h2 className="section-page__categories-title">Categories</h2>
              <div className="section-page__categories-grid">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={buildPath(version, section, category.id)}
                    className="section-page__category-card"
                  >
                    <span className="section-page__category-icon">
                      {categoryIcons[category.id] || '📁'}
                    </span>
                    <div className="section-page__category-content">
                      <h3 className="section-page__category-name">{category.name}</h3>
                      <p className="section-page__category-description">{category.description}</p>
                      {category.article_count !== undefined && (
                        <span className="section-page__category-count">
                          {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
                        </span>
                      )}
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
