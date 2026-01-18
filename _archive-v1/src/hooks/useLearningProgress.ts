import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, StorageKeys } from '../utils/storage';

interface LearningProgress {
  completedArticles: string[];
  currentArticle: string | null;
  lastVisited: string | null;
}

const DEFAULT_PROGRESS: LearningProgress = {
  completedArticles: [],
  currentArticle: null,
  lastVisited: null,
};

/**
 * Hook for managing learning path progress
 * Stores progress in localStorage for persistence
 */
export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(() => {
    return getStorageItem<LearningProgress>(StorageKeys.LEARNING_PROGRESS, DEFAULT_PROGRESS);
  });

  // Sync to localStorage when progress changes
  useEffect(() => {
    setStorageItem(StorageKeys.LEARNING_PROGRESS, progress);
  }, [progress]);

  // Mark an article as completed
  const markComplete = useCallback((articleId: string) => {
    setProgress((prev) => {
      if (prev.completedArticles.includes(articleId)) {
        return prev;
      }
      return {
        ...prev,
        completedArticles: [...prev.completedArticles, articleId],
        lastVisited: new Date().toISOString(),
      };
    });
  }, []);

  // Mark an article as incomplete (remove from completed)
  const markIncomplete = useCallback((articleId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedArticles: prev.completedArticles.filter((id) => id !== articleId),
    }));
  }, []);

  // Set the current article being viewed
  const setCurrentArticle = useCallback((articleId: string | null) => {
    setProgress((prev) => ({
      ...prev,
      currentArticle: articleId,
      lastVisited: new Date().toISOString(),
    }));
  }, []);

  // Check if an article is completed
  const isCompleted = useCallback(
    (articleId: string) => progress.completedArticles.includes(articleId),
    [progress.completedArticles]
  );

  // Calculate progress percentage
  const getProgressPercentage = useCallback(
    (totalArticles: number) => {
      if (totalArticles === 0) return 0;
      return Math.round((progress.completedArticles.length / totalArticles) * 100);
    },
    [progress.completedArticles.length]
  );

  // Reset all progress
  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return {
    progress,
    completedCount: progress.completedArticles.length,
    currentArticle: progress.currentArticle,
    lastVisited: progress.lastVisited,
    markComplete,
    markIncomplete,
    setCurrentArticle,
    isCompleted,
    getProgressPercentage,
    resetProgress,
  };
}
