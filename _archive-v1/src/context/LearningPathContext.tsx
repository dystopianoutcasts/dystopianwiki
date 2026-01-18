import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useLearningProgress } from '../hooks/useLearningProgress';

interface LearningPathArticle {
  id: string;
  step: string;
  title: string;
  url: string;
  description: string;
}

interface LearningPathSection {
  id: string;
  title: string;
  description: string;
  articles: Array<{
    id: string;
    step: string;
    title: string;
    slug: string;
    url?: string;
    description: string;
    difficulty: string;
    estimatedMinutes: number;
  }>;
}

interface LearningPathData {
  sections: LearningPathSection[];
}

interface LearningPathContextType {
  // Data
  articles: LearningPathArticle[];
  totalArticles: number;
  loading: boolean;

  // Current article info (based on current URL)
  currentLearningArticle: LearningPathArticle | null;
  nextLearningArticle: LearningPathArticle | null;
  prevLearningArticle: LearningPathArticle | null;

  // Progress
  isCompleted: (articleId: string) => boolean;
  markComplete: (articleId: string) => void;
  markIncomplete: (articleId: string) => void;
  completedCount: number;
  progressPercent: number;

  // Helpers
  getLearningArticleByUrl: (url: string) => LearningPathArticle | null;
}

const LearningPathContext = createContext<LearningPathContextType | null>(null);

interface LearningPathProviderProps {
  children: ReactNode;
}

export function LearningPathProvider({ children }: LearningPathProviderProps) {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const {
    markComplete,
    markIncomplete,
    isCompleted,
    getProgressPercentage,
    completedCount,
  } = useLearningProgress();

  // Load learning path data once on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/build-41/learning-path/index.json');
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData);
        }
      } catch (err) {
        console.error('Failed to load learning path data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Flatten all sections into a single articles array with full URLs
  const articles = useMemo<LearningPathArticle[]>(() => {
    if (!data) return [];

    return data.sections.flatMap((section) =>
      section.articles.map((article) => ({
        id: article.id,
        step: article.step,
        title: article.title,
        description: article.description,
        url: article.url || `/learning-path/${article.slug}`,
      }))
    );
  }, [data]);

  // Build URL lookup map for fast detection
  const urlToArticleMap = useMemo(() => {
    const map = new Map<string, LearningPathArticle>();
    articles.forEach((article) => {
      // Normalize URL (remove trailing slash)
      const normalizedUrl = article.url.replace(/\/$/, '');
      map.set(normalizedUrl, article);
    });
    return map;
  }, [articles]);

  // Get article by URL
  const getLearningArticleByUrl = useCallback(
    (url: string): LearningPathArticle | null => {
      const normalizedUrl = url.replace(/\/$/, '');
      return urlToArticleMap.get(normalizedUrl) || null;
    },
    [urlToArticleMap]
  );

  // Get current article based on current location
  const currentLearningArticle = useMemo(() => {
    return getLearningArticleByUrl(location.pathname);
  }, [location.pathname, getLearningArticleByUrl]);

  // Get prev/next articles relative to current
  const { prevLearningArticle, nextLearningArticle } = useMemo(() => {
    if (!currentLearningArticle) {
      return { prevLearningArticle: null, nextLearningArticle: null };
    }

    const currentIndex = articles.findIndex((a) => a.id === currentLearningArticle.id);

    return {
      prevLearningArticle: currentIndex > 0 ? articles[currentIndex - 1] : null,
      nextLearningArticle: currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null,
    };
  }, [currentLearningArticle, articles]);

  // Calculate progress
  const totalArticles = articles.length;
  const progressPercent = getProgressPercentage(totalArticles);

  const value: LearningPathContextType = {
    articles,
    totalArticles,
    loading,
    currentLearningArticle,
    nextLearningArticle,
    prevLearningArticle,
    isCompleted,
    markComplete,
    markIncomplete,
    completedCount,
    progressPercent,
    getLearningArticleByUrl,
  };

  return (
    <LearningPathContext.Provider value={value}>
      {children}
    </LearningPathContext.Provider>
  );
}

export function useLearningPathContext(): LearningPathContextType {
  const context = useContext(LearningPathContext);
  if (!context) {
    throw new Error('useLearningPathContext must be used within a LearningPathProvider');
  }
  return context;
}

// Optional hook that doesn't throw if used outside provider
export function useLearningPath(): LearningPathContextType | null {
  return useContext(LearningPathContext);
}
