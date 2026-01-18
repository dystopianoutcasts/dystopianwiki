import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import type { SearchResult } from '../../types/wiki';
import { useSearchIndex } from '../../hooks/useSearch';
import '../../styles/components/search-bar.css';

// Icons as inline SVG for simplicity
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface FuzzySearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  size?: 'normal' | 'large';
}

export function FuzzySearchBar({
  placeholder = 'Search...',
  onSearch,
  autoFocus = false,
  size = 'normal',
}: FuzzySearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { searchIndex, loading: isLoading } = useSearchIndex();

  // Initialize Fuse.js with search index
  const fuse = useMemo(() => {
    if (!searchIndex.length) return null;
    return new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'tags', weight: 0.3 },
        { name: 'excerpt', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.3,
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }, [searchIndex]);

  // Debounced search
  useEffect(() => {
    if (!fuse || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const results = fuse.search(query, { limit: 8 });
      const mappedResults: SearchResult[] = results.map((r) => ({
        ...r.item,
        score: r.score ?? 0,
        matches: r.matches?.map((m) => ({
          key: m.key ?? '',
          value: m.value ?? '',
          indices: m.indices as Array<[number, number]>,
        })),
      }));
      setSuggestions(mappedResults);
      setIsOpen(mappedResults.length > 0);
      setSelectedIndex(-1);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, fuse]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      setIsOpen(false);
      setQuery('');
      navigate(result.url);
    },
    [navigate]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          navigateToResult(suggestions[selectedIndex]);
        } else if (onSearch) {
          onSearch(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, matchKey: string, matches?: SearchResult['matches']) => {
    const match = matches?.find((m) => m.key === matchKey);
    if (!match || !match.indices.length) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    match.indices.forEach(([start, end], i) => {
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      parts.push(<mark key={i}>{text.slice(start, end + 1)}</mark>);
      lastIndex = end + 1;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  };

  return (
    <div className={`search-bar ${size === 'large' ? 'search-bar--large' : ''}`}>
      <div className="search-bar__input-wrapper">
        <span className="search-bar__icon">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          autoFocus={autoFocus}
          aria-label="Search documentation"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          role="combobox"
          autoComplete="off"
        />
        {query && (
          <button
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="search-bar__dropdown"
          id="search-suggestions"
          role="listbox"
        >
          {isLoading ? (
            <div className="search-bar__loading">
              <span className="search-bar__spinner" />
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((result, index) => (
                <div
                  key={result.id}
                  className={`search-suggestion ${
                    index === selectedIndex ? 'search-suggestion--selected' : ''
                  }`}
                  onClick={() => navigateToResult(result)}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <span className="search-suggestion__title">
                    {highlightMatch(result.title, 'title', result.matches)}
                  </span>
                  <span className="search-suggestion__meta">
                    <span className="search-suggestion__badge">{result.section}</span>
                    <span>{result.category}</span>
                  </span>
                  {result.excerpt && (
                    <span className="search-suggestion__excerpt">{result.excerpt}</span>
                  )}
                </div>
              ))}
              <div className="search-bar__footer">
                <span><kbd>↑↓</kbd> navigate</span>
                <span><kbd>↵</kbd> select</span>
                <span><kbd>esc</kbd> close</span>
              </div>
            </>
          ) : (
            <div className="search-bar__no-results">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
