import { useState, useEffect } from 'react';
import { LearningPathCard } from '../components/learning/LearningPathCard';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { SEOHead } from '../components/seo/SEOHead';
import { Layout } from '../components/layout/Layout';
import type { Difficulty } from '../types/wiki';
import '../styles/components/learning-path.css';

interface LearningArticle {
  id: string;
  step: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
}

interface LearningSection {
  id: string;
  title: string;
  description: string;
  articles: LearningArticle[];
}

interface LearningPathData {
  sections: LearningSection[];
}

// Chunk articles into rows of specified size
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function LearningPathPage() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isCompleted,
    currentArticle,
    getProgressPercentage,
    resetProgress,
    completedCount,
  } = useLearningProgress();

  // Load learning path data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/build-41/learning-path/index.json');
        if (!response.ok) {
          throw new Error('Failed to load learning path data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="learning-path">
          <div className="learning-path__hero">
            <div className="learning-path__hero-content">
              <h1 className="learning-path__title">Loading...</h1>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="learning-path">
          <div className="learning-path__hero">
            <div className="learning-path__hero-content">
              <h1 className="learning-path__title">Your Modding Journey</h1>
              <p className="learning-path__subtitle">
                Learning path content coming soon! Check back later for our guided curriculum.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate total articles for progress
  const totalArticles = data.sections.reduce(
    (sum, section) => sum + section.articles.length,
    0
  );
  const progressPercent = getProgressPercentage(totalArticles);

  // Flatten all articles to find current position
  const allArticles = data.sections.flatMap((section) => section.articles);
  const firstIncompleteIndex = allArticles.findIndex(
    (article) => !isCompleted(article.id)
  );
  const activeArticleId =
    currentArticle || (firstIncompleteIndex >= 0 ? allArticles[firstIncompleteIndex].id : null);

  return (
    <Layout>
      <div className="learning-path">
        <SEOHead
          title="Learning Path - Start Your Modding Journey"
          description="Complete beginner's guide to Project Zomboid modding. Step-by-step tutorials from your first mod to advanced Lua scripting. No coding experience required."
        />
        {/* Hero Section */}
        <header className="learning-path__hero">
        <div className="learning-path__hero-content">
          <h1 className="learning-path__title">Your Modding Journey</h1>
          <p className="learning-path__subtitle">
            Start from scratch and become a Project Zomboid modder. Follow the cards in
            order - each builds on the last.
          </p>

          {/* Progress Bar */}
          <div className="learning-path__progress">
            <div className="learning-path__progress-bar">
              <div
                className="learning-path__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="learning-path__progress-text">
              {completedCount} of {totalArticles} completed ({progressPercent}%)
            </p>
          </div>

          {completedCount > 0 && (
            <button
              className="learning-path__reset"
              onClick={() => {
                if (window.confirm('Reset all progress? This cannot be undone.')) {
                  resetProgress();
                }
              }}
            >
              Reset Progress
            </button>
          )}
        </div>
      </header>

      {/* Content Sections */}
      <main className="learning-path__content">
        {data.sections.map((section) => {
          // Chunk articles into rows of 4
          const rows = chunkArray(section.articles, 4);

          return (
            <section key={section.id} className="learning-path__section">
              <div className="learning-path__section-header">
                <h2 className="learning-path__section-title">{section.title}</h2>
                <p className="learning-path__section-description">
                  {section.description}
                </p>
              </div>

              <div className="learning-path__grid">
                {rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`learning-path__row ${
                      rowIndex % 2 === 1 ? 'learning-path__row--even' : ''
                    }`}
                  >
                    {row.map((article) => (
                      <LearningPathCard
                        key={article.id}
                        stepNumber={article.step}
                        title={article.title}
                        description={article.description}
                        difficulty={article.difficulty}
                        isCompleted={isCompleted(article.id)}
                        isActive={activeArticleId === article.id}
                        url={`/learning-path/${article.slug}`}
                        estimatedMinutes={article.estimatedMinutes}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      </div>
    </Layout>
  );
}
