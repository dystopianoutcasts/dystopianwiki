import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { WikiArticle } from '../components/wiki/WikiArticle';
import { useArticle, useArticlesList } from '../hooks/useWikiData';
import '../styles/pages/article-page.css';

export function ArticlePage() {
  const { version = 'build-41', section = '', category = '', slug = '' } = useParams<{
    version: string;
    section: string;
    category: string;
    slug: string;
  }>();

  const { data: article, loading, error } = useArticle(version, section, category, slug);
  const { data: articlesList } = useArticlesList(version, section, category);

  // Find prev/next articles for navigation
  const currentIndex = articlesList?.findIndex((a) => a.slug === slug) ?? -1;
  const prevArticle = currentIndex > 0 && articlesList
    ? {
        slug: articlesList[currentIndex - 1].slug,
        title: articlesList[currentIndex - 1].title,
        url: `/${version}/${section}/${category}/${articlesList[currentIndex - 1].slug}`,
      }
    : undefined;
  const nextArticle = currentIndex >= 0 && articlesList && currentIndex < articlesList.length - 1
    ? {
        slug: articlesList[currentIndex + 1].slug,
        title: articlesList[currentIndex + 1].title,
        url: `/${version}/${section}/${category}/${articlesList[currentIndex + 1].slug}`,
      }
    : undefined;

  // Get related articles (same category, different article)
  const relatedArticles = articlesList
    ?.filter((a) => a.slug !== slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category,
      section,
      version,
      difficulty: a.difficulty,
    }));

  if (loading) {
    return (
      <Layout>
        <WikiLayout>
          <div className="article-page">
            <div className="article-page__loading">
              <div className="article-page__loading-spinner" />
              <p>Loading article...</p>
            </div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <WikiLayout>
          <div className="article-page">
            <div className="article-page__error">
              <h1>Article Not Found</h1>
              <p>The requested article "{slug}" could not be found.</p>
              <Link to={`/${version}/${section}/${category}`} className="article-page__back-link">
                Return to {category}
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
        <div className="article-page">
          <WikiArticle
            article={article}
            relatedArticles={relatedArticles}
            prevArticle={prevArticle}
            nextArticle={nextArticle}
          />
        </div>
      </WikiLayout>
    </Layout>
  );
}
