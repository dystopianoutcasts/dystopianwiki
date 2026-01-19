import { useState, useEffect } from 'react';
import type { SearchEntry } from '../types/wiki';

/**
 * Hook to load and provide the search index
 */
export function useSearchIndex() {
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSearchIndex() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/search-index.json');
        if (!response.ok) {
          throw new Error(`Failed to load search index: ${response.status}`);
        }
        const data = await response.json();
        if (mounted) {
          setSearchIndex(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          // If search index doesn't exist yet, use empty array
          console.warn('Search index not found, using empty index');
          setSearchIndex([]);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSearchIndex();

    return () => {
      mounted = false;
    };
  }, []);

  return { searchIndex, loading: isLoading, error };
}

// Alias for convenience
export const useSearch = useSearchIndex;
