/**
 * useWikiData Hook
 * Fetches wiki data with IndexedDB caching support
 */

import { useState, useEffect, useCallback } from 'react';
import { CacheManager, getCacheKey, CACHE_TTLS } from '../managers/CacheManager';
import type { Version, Section, Category, WikiArticle } from '../types/wiki';

interface UseWikiDataOptions {
  skipCache?: boolean;
}

interface UseWikiDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Generic data fetcher with caching
 */
async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  ttl: number,
  skipCache: boolean = false
): Promise<T> {
  // Try cache first (unless skipped)
  if (!skipCache) {
    const cached = await CacheManager.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch from network
  const response = await fetch(`${BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const data = await response.json();

  // Store in cache
  await CacheManager.set(cacheKey, data, ttl);

  return data;
}

/**
 * Hook to fetch versions list
 */
export function useVersions(options: UseWikiDataOptions = {}): UseWikiDataState<Version[]> {
  const [data, setData] = useState<Version[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      interface VersionsResponse {
        versions: Version[];
      }
      const response = await fetchWithCache<VersionsResponse>(
        'data/versions.json',
        getCacheKey('versions'),
        CACHE_TTLS.versions,
        options.skipCache
      );
      setData(response.versions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch sections
 */
export function useSections(options: UseWikiDataOptions = {}): UseWikiDataState<Section[]> {
  const [data, setData] = useState<Section[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      interface SectionsResponse {
        sections: Section[];
      }
      const response = await fetchWithCache<SectionsResponse>(
        'data/sections.json',
        getCacheKey('sections'),
        CACHE_TTLS.sections,
        options.skipCache
      );
      setData(response.sections);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch categories for a section
 */
export function useCategories(
  version: string,
  section: string,
  options: UseWikiDataOptions = {}
): UseWikiDataState<Category[]> {
  const [data, setData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!version || !section) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      interface CategoriesResponse {
        categories: Category[];
      }
      const response = await fetchWithCache<CategoriesResponse>(
        `data/${version}/${section}/categories.json`,
        getCacheKey('categories', version, section),
        CACHE_TTLS.categories,
        options.skipCache
      );
      setData(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [version, section, options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch articles list for a category
 */
export function useArticlesList(
  version: string,
  section: string,
  category: string,
  options: UseWikiDataOptions = {}
): UseWikiDataState<WikiArticle[]> {
  const [data, setData] = useState<WikiArticle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!version || !section || !category) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      interface ArticlesResponse {
        articles: WikiArticle[];
      }
      const response = await fetchWithCache<ArticlesResponse>(
        `data/${version}/${section}/${category}/index.json`,
        getCacheKey('articles-list', version, section, category),
        CACHE_TTLS.articles,
        options.skipCache
      );
      setData(response.articles);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [version, section, category, options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch a single article
 */
export function useArticle(
  version: string,
  section: string,
  category: string,
  slug: string,
  options: UseWikiDataOptions = {}
): UseWikiDataState<WikiArticle> {
  const [data, setData] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!version || !section || !category || !slug) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const article = await fetchWithCache<WikiArticle>(
        `data/${version}/${section}/${category}/${slug}.json`,
        getCacheKey('article', version, section, category, slug),
        CACHE_TTLS.articles,
        options.skipCache
      );
      setData(article);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [version, section, category, slug, options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch section info
 */
export function useSectionInfo(
  version: string,
  section: string,
  options: UseWikiDataOptions = {}
): UseWikiDataState<Section> {
  const [data, setData] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!version || !section) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sectionInfo = await fetchWithCache<Section>(
        `data/${version}/${section}/section-info.json`,
        getCacheKey('section-info', version, section),
        CACHE_TTLS.sections,
        options.skipCache
      );
      setData(sectionInfo);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [version, section, options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch version info
 */
export function useVersionInfo(
  version: string,
  options: UseWikiDataOptions = {}
): UseWikiDataState<Version> {
  const [data, setData] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!version) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const versionInfo = await fetchWithCache<Version>(
        `data/${version}/version-info.json`,
        getCacheKey('version-info', version),
        CACHE_TTLS.versions,
        options.skipCache
      );
      setData(versionInfo);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [version, options.skipCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Prefetch data for better UX
 */
export async function prefetchArticle(
  version: string,
  section: string,
  category: string,
  slug: string
): Promise<void> {
  const cacheKey = getCacheKey('article', version, section, category, slug);
  const cached = await CacheManager.get(cacheKey);

  if (!cached) {
    try {
      const response = await fetch(`${BASE_URL}data/${version}/${section}/${category}/${slug}.json`);
      if (response.ok) {
        const data = await response.json();
        await CacheManager.set(cacheKey, data, CACHE_TTLS.articles);
      }
    } catch {
      // Silently fail prefetch
    }
  }
}
