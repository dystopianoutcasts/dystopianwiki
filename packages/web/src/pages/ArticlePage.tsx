import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { WikiArticle } from '../components/wiki/WikiArticle';
import { SEOHead } from '../components/seo/SEOHead';
import { useArticle as useSupabaseArticle, useArticlesByCategory } from '../hooks/useSupabase';
import { useGameContext } from '../hooks/useGameContext';
import { useLearningPathContext } from '../context/LearningPathContext';
import type { Article } from '@dystopianwiki/shared';
import type { WikiArticle as WikiArticleType } from '../types/wiki';
import '../styles/pages/article-page.css';

// Helper to convert Supabase Article to WikiArticle format
function toWikiArticle(article: Article): WikiArticleType {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt || '',
    version: article.version,
    section: article.section,
    category: article.category,
    subcategory: article.subcategory || undefined,
    tags: article.tags,
    relatedArticles: article.related_articles,
    lastUpdated: article.last_updated,
    difficulty: article.difficulty || undefined,
    tableOfContents: article.table_of_contents,
    nextSteps: article.next_steps || undefined,
  };
}

export function ArticlePage() {
  const { version = 'build-41', section = '', category = '', slug = '' } = useParams<{
    version: string;
    section: string;
    category: string;
    slug: string;
  }>();
  const { buildPath, gameName } = useGameContext();

  const { game } = useParams<{ game?: string }>();
  const { data: article, isLoading: loading, isError: error } = useSupabaseArticle(slug || '');
  const { data: articlesList = [] } = useArticlesByCategory(category, game || 'pz', version);

  // Learning Path integration
  const {
    currentLearningArticle,
    nextLearningArticle,
    prevLearningArticle,
    isCompleted,
    markComplete,
    completedCount,
    totalArticles,
  } = useLearningPathContext();

  // Build learning path props if current article is part of learning path
  const learningPath = useMemo(() => {
    if (!currentLearningArticle) return undefined;

    return {
      current: {
        id: currentLearningArticle.id,
        step: currentLearningArticle.step,
        title: currentLearningArticle.title,
      },
      next: nextLearningArticle
        ? {
            id: nextLearningArticle.id,
            step: nextLearningArticle.step,
            title: nextLearningArticle.title,
            url: nextLearningArticle.url,
          }
        : null,
      prev: prevLearningArticle
        ? {
            id: prevLearningArticle.id,
            step: prevLearningArticle.step,
            title: prevLearningArticle.title,
            url: prevLearningArticle.url,
          }
        : null,
      isCompleted: isCompleted(currentLearningArticle.id),
      onMarkComplete: () => markComplete(currentLearningArticle.id),
      completedCount,
      totalArticles,
    };
  }, [
    currentLearningArticle,
    nextLearningArticle,
    prevLearningArticle,
    isCompleted,
    markComplete,
    completedCount,
    totalArticles,
  ]);

  // Find prev/next articles for navigation
  const currentIndex = articlesList?.findIndex((a) => a.slug === slug) ?? -1;
  const prevArticle = currentIndex > 0 && articlesList
    ? {
        slug: articlesList[currentIndex - 1].slug,
        title: articlesList[currentIndex - 1].title,
        url: buildPath(version, section, category, articlesList[currentIndex - 1].slug),
      }
    : undefined;
  const nextArticle = currentIndex >= 0 && articlesList && currentIndex < articlesList.length - 1
    ? {
        slug: articlesList[currentIndex + 1].slug,
        title: articlesList[currentIndex + 1].title,
        url: buildPath(version, section, category, articlesList[currentIndex + 1].slug),
      }
    : undefined;

  // Get related articles (same category, different article)
  const relatedArticles = articlesList
    ?.filter((a) => a.slug !== slug)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || '',
      category,
      section,
      version,
      difficulty: a.difficulty || undefined,
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
              <Link to={buildPath(version, section, category)} className="article-page__back-link">
                Return to {category}
              </Link>
            </div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  // Convert article to WikiArticle format
  const wikiArticle = toWikiArticle(article);

  return (
    <Layout>
      <SEOHead
        title={article.title}
        description={article.excerpt || `Learn about ${article.title} in ${gameName || 'game'} modding.`}
        ogType="article"
        article={{
          publishedTime: article.last_updated,
          modifiedTime: article.last_updated,
          section: category,
          tags: article.tags,
        }}
      />
      <WikiLayout>
        <div className="article-page">
          <WikiArticle
            article={wikiArticle}
            relatedArticles={relatedArticles}
            prevArticle={prevArticle}
            nextArticle={nextArticle}
            learningPath={learningPath}
          />
        </div>
      </WikiLayout>
    </Layout>
  );
}
