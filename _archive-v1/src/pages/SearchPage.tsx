import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { useSearch } from '../hooks/useSearch';
import { SEOHead } from '../components/seo/SEOHead';
import type { SearchResult, Difficulty } from '../types/wiki';
import '../styles/pages/search-page.css';

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const categoryDisplayNames: Record<string, string> = {
  'lua-api': 'Lua API',
  'recipes': 'Recipes',
  'items': 'Items',
  'game-mechanics': 'Game Mechanics',
  'weapon-repair': 'Weapon Repair',
  'foraging': 'Foraging',
  'tools': 'Tools',
  'tilezed': 'TileZed',
  'worlded': 'WorldEd',
  'buildings': 'Buildings',
  'terrain': 'Terrain',
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const { searchIndex, loading: indexLoading } = useSearch();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    if (!searchIndex) return null;
    return new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'excerpt', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    });
  }, [searchIndex]);

  // Perform search
  const results: SearchResult[] = useMemo(() => {
    if (!fuse || !debouncedQuery.trim()) return [];

    return fuse.search(debouncedQuery).map((result) => {
      const item = result.item;
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        url: item.url,
        version: item.version,
        section: item.section,
        category: item.category,
        tags: item.tags,
        excerpt: item.excerpt,
        difficulty: item.difficulty,
        score: result.score ?? 1,
        matches: result.matches?.map((m) => ({
          key: m.key || '',
          value: m.value || '',
          indices: m.indices as Array<[number, number]>,
        })),
      };
    });
  }, [fuse, debouncedQuery]);

  return (
    <Layout>
      <SEOHead
        title={debouncedQuery ? `Search: ${debouncedQuery}` : 'Search'}
        description="Search the Project Zomboid Modding Wiki for tutorials, guides, and documentation."
        noIndex={true}
      />
      <WikiLayout>
        <div className="search-page">
          <header className="search-page__header">
            <h1 className="search-page__title">Search Documentation</h1>
            <div className="search-page__input-wrapper">
              <svg
                className="search-page__input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="search-page__input"
                placeholder="Search articles, topics, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  className="search-page__clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </header>

          <div className="search-page__content">
            {indexLoading ? (
              <div className="search-page__loading">
                <p>Loading search index...</p>
              </div>
            ) : !debouncedQuery.trim() ? (
              <div className="search-page__empty">
                <p>Enter a search term to find articles.</p>
                <p className="search-page__hint">
                  Try searching for "events", "recipes", or "tilezed"
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="search-page__no-results">
                <p>No results found for "{debouncedQuery}"</p>
                <p className="search-page__hint">
                  Try different keywords or check your spelling.
                </p>
              </div>
            ) : (
              <>
                <p className="search-page__result-count">
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                </p>
                <ul className="search-page__results">
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link
                        to={result.url}
                        className="search-page__result-card"
                      >
                        <div className="search-page__result-badges">
                          <span className="search-page__result-section">
                            {result.section}
                          </span>
                          <span className="search-page__result-category">
                            {categoryDisplayNames[result.category] || result.category}
                          </span>
                        </div>
                        <h2 className="search-page__result-title">{result.title}</h2>
                        <p className="search-page__result-excerpt">{result.excerpt}</p>
                        <div className="search-page__result-meta">
                          {result.difficulty && (
                            <span className={`search-page__difficulty search-page__difficulty--${result.difficulty}`}>
                              {difficultyLabels[result.difficulty]}
                            </span>
                          )}
                          {result.tags.length > 0 && (
                            <span className="search-page__tags">
                              {result.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="search-page__tag">#{tag}</span>
                              ))}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </WikiLayout>
    </Layout>
  );
}
