import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { useCategories, useArticlesList } from '../hooks/useWikiData';
import type { Difficulty } from '../types/wiki';
import '../styles/pages/category-page.css';

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

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function CategoryPage() {
  const { version = 'build-41', section = '', category = '' } = useParams<{
    version: string;
    section: string;
    category: string;
  }>();

  const { data: categories } = useCategories(version, section);
  const { data: articles, loading, error } = useArticlesList(version, section, category);

  const categoryInfo = categories?.find((c) => c.id === category);

  if (loading) {
    return (
      <Layout>
        <WikiLayout>
          <div className="category-page">
            <div className="category-page__loading">Loading articles...</div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  if (error || !articles) {
    return (
      <Layout>
        <WikiLayout>
          <div className="category-page">
            <div className="category-page__error">
              <h1>Category Not Found</h1>
              <p>The requested category "{category}" could not be found.</p>
              <Link to={`/${version}/${section}`} className="category-page__back-link">
                Return to {section}
              </Link>
            </div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <WikiLayout>
        <div className="category-page">
          <header className="category-page__header">
            <span className="category-page__icon">
              {categoryIcons[category] || '📁'}
            </span>
            <h1 className="category-page__title">
              {categoryInfo?.name || category}
            </h1>
            {categoryInfo?.description && (
              <p className="category-page__description">{categoryInfo.description}</p>
            )}
            <span className="category-page__count">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </span>
          </header>

          {articles.length > 0 ? (
            <section className="category-page__articles">
              <ul className="category-page__articles-list">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/${version}/${section}/${category}/${article.slug}`}
                      className="category-page__article-card"
                    >
                      <div className="category-page__article-content">
                        <h2 className="category-page__article-title">{article.title}</h2>
                        <p className="category-page__article-excerpt">{article.excerpt}</p>
                        <div className="category-page__article-meta">
                          {article.difficulty && (
                            <span className={`category-page__difficulty category-page__difficulty--${article.difficulty}`}>
                              {difficultyLabels[article.difficulty]}
                            </span>
                          )}
                          {article.tags.length > 0 && (
                            <span className="category-page__tags">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="category-page__tag">#{tag}</span>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="category-page__article-arrow">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="category-page__empty">
              <p>No articles found in this category yet.</p>
              <p>Check back later for new content!</p>
            </div>
          )}
        </div>
      </WikiLayout>
    </Layout>
  );
}
