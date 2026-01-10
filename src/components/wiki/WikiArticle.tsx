import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { WikiArticle as WikiArticleType, Difficulty } from '../../types/wiki';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TableOfContents, extractTOCFromMarkdown } from './TableOfContents';
import { RelatedArticles } from './RelatedArticles';
import { ArticleCTA } from './ArticleCTA';
import { useArticleContext } from '../../context/ArticleContext';
import '../../styles/components/wiki-article.css';

interface RelatedArticleData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  section: string;
  version: string;
  difficulty?: Difficulty;
}

interface LearningPathNav {
  current: { id: string; step: string; title: string };
  next: { id: string; step: string; title: string; url: string } | null;
  prev: { id: string; step: string; title: string; url: string } | null;
  isCompleted: boolean;
  onMarkComplete: () => void;
  completedCount: number;
  totalArticles: number;
}

interface WikiArticleProps {
  article: WikiArticleType;
  relatedArticles?: RelatedArticleData[];
  prevArticle?: { slug: string; title: string; url: string };
  nextArticle?: { slug: string; title: string; url: string };
  learningPath?: LearningPathNav;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const categoryDisplayNames: Record<string, string> = {
  'lua-api': 'Lua API',
  recipes: 'Recipes',
  items: 'Items',
  'game-mechanics': 'Game Mechanics',
  'weapon-repair': 'Weapon Repair',
  foraging: 'Foraging',
  tools: 'Tools',
  tilezed: 'TileZed',
  worlded: 'WorldEd',
  buildings: 'Buildings',
  terrain: 'Terrain',
};

export function WikiArticle({
  article,
  relatedArticles = [],
  prevArticle,
  nextArticle,
  learningPath,
}: WikiArticleProps) {
  const { setTocItems, clearTocItems } = useArticleContext();

  // Extract TOC from markdown content
  const tocItems = useMemo(
    () => article.tableOfContents.length > 0
      ? article.tableOfContents
      : extractTOCFromMarkdown(article.content),
    [article.content, article.tableOfContents]
  );

  // Set TOC items in context for mobile menu access
  useEffect(() => {
    setTocItems(tocItems);
    return () => clearTocItems();
  }, [tocItems, setTocItems, clearTocItems]);

  // Format last updated date
  const formattedDate = useMemo(() => {
    try {
      return new Date(article.lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return article.lastUpdated;
    }
  }, [article.lastUpdated]);

  return (
    <article className="wiki-article">
      {/* Main Content */}
      <div className="wiki-article__main">
        {/* Header */}
        <header className="wiki-article__header">
          <div className="wiki-article__meta">
            <span className="wiki-article__category">
              {categoryDisplayNames[article.category] || article.category}
            </span>
            {article.difficulty && (
              <span
                className={`wiki-article__difficulty wiki-article__difficulty--${article.difficulty}`}
              >
                {difficultyLabels[article.difficulty]}
              </span>
            )}
          </div>

          <h1 className="wiki-article__title">{article.title}</h1>

          {article.excerpt && (
            <p className="wiki-article__excerpt">{article.excerpt}</p>
          )}

          <p className="wiki-article__updated">Last updated: {formattedDate}</p>

          {article.tags.length > 0 && (
            <div className="wiki-article__tags">
              {article.tags.map((tag) => (
                <span key={tag} className="wiki-article__tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Mobile TOC */}
        {tocItems.length > 0 && (
          <TableOfContents items={tocItems} className="toc--mobile" />
        )}

        {/* Content */}
        <div className="wiki-article__content">
          <MarkdownRenderer content={article.content} />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}

        {/* Discord Community CTA */}
        <ArticleCTA />

        {/* Learning Path Navigation */}
        {learningPath && (
          <div className="wiki-article__learning-path">
            <div className="wiki-article__learning-header">
              <div className="wiki-article__learning-info">
                <span className="wiki-article__learning-badge">
                  Learning Path - Step {learningPath.current.step}
                </span>
                <span className="wiki-article__learning-progress">
                  {learningPath.completedCount} of {learningPath.totalArticles} completed
                </span>
              </div>
              <Link to="/learning-path" className="wiki-article__learning-overview">
                View Full Path
              </Link>
            </div>

            <div className="wiki-article__learning-actions">
              <button
                className={`wiki-article__complete-btn ${learningPath.isCompleted ? 'wiki-article__complete-btn--completed' : ''}`}
                onClick={learningPath.onMarkComplete}
                disabled={learningPath.isCompleted}
              >
                {learningPath.isCompleted ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>

            <nav className="wiki-article__learning-nav" aria-label="Learning path navigation">
              {learningPath.prev && (
                <Link
                  to={learningPath.prev.url}
                  className="wiki-article__learning-link wiki-article__learning-link--prev"
                >
                  <span className="wiki-article__learning-link-label">Previous Lesson</span>
                  <span className="wiki-article__learning-link-step">
                    {learningPath.prev.step}: {learningPath.prev.title}
                  </span>
                </Link>
              )}
              {learningPath.next && (
                <Link
                  to={learningPath.next.url}
                  className="wiki-article__learning-link wiki-article__learning-link--next"
                >
                  <span className="wiki-article__learning-link-label">Next Lesson</span>
                  <span className="wiki-article__learning-link-step">
                    {learningPath.next.step}: {learningPath.next.title}
                  </span>
                </Link>
              )}
              {!learningPath.next && (
                <Link
                  to="/learning-path"
                  className="wiki-article__learning-link wiki-article__learning-link--next"
                >
                  <span className="wiki-article__learning-link-label">Congratulations!</span>
                  <span className="wiki-article__learning-link-step">
                    Return to Learning Path
                  </span>
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Navigation */}
        {(prevArticle || nextArticle) && (
          <footer className="wiki-article__footer">
            <nav className="wiki-article__nav" aria-label="Article navigation">
              {prevArticle && (
                <Link
                  to={prevArticle.url}
                  className="wiki-article__nav-link wiki-article__nav-link--prev"
                >
                  <span className="wiki-article__nav-label">← Previous</span>
                  <span className="wiki-article__nav-title">{prevArticle.title}</span>
                </Link>
              )}
              {nextArticle && (
                <Link
                  to={nextArticle.url}
                  className="wiki-article__nav-link wiki-article__nav-link--next"
                >
                  <span className="wiki-article__nav-label">Next →</span>
                  <span className="wiki-article__nav-title">{nextArticle.title}</span>
                </Link>
              )}
            </nav>
          </footer>
        )}
      </div>

      {/* Desktop TOC */}
      {tocItems.length > 0 && (
        <aside className="wiki-article__toc">
          <TableOfContents items={tocItems} />
        </aside>
      )}
    </article>
  );
}
