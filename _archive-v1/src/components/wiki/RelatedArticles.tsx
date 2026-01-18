import { Link } from 'react-router-dom';
import type { Difficulty } from '../../types/wiki';
import '../../styles/components/related-articles.css';

interface RelatedArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  section: string;
  version: string;
  difficulty?: Difficulty;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  title?: string;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function RelatedArticles({
  articles,
  title = 'Related Articles',
}: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="related-articles">
      <h2 className="related-articles__title">{title}</h2>
      <div className="related-articles__grid">
        {articles.map((article) => (
          <Link
            key={article.slug}
            to={`/${article.version}/${article.section}/${article.category}/${article.slug}`}
            className="related-article"
          >
            <span className="related-article__category">
              {article.category.replace(/-/g, ' ')}
            </span>
            <h3 className="related-article__title">{article.title}</h3>
            <p className="related-article__excerpt">{article.excerpt}</p>
            {article.difficulty && (
              <div className="related-article__meta">
                <span
                  className={`related-article__difficulty related-article__difficulty--${article.difficulty}`}
                >
                  {difficultyLabels[article.difficulty]}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
