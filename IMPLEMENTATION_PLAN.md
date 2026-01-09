# Project Zomboid Modding Wiki - Implementation Plan

## Overview

A React + TypeScript wiki for Project Zomboid modding documentation, hosted statically on GitHub Pages. The architecture adapts patterns from your existing personal website (manager classes, localStorage wrapper, CSS custom properties theming) into a modern React application.

### Key Constraints

- **GitHub Pages** = static files only (no Node.js runtime)
- **React** builds to static HTML/JS/CSS, so it works perfectly
- **JSON files** serve as the "database"
- **IndexedDB** provides client-side caching

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18 + TypeScript | Type-safe UI components |
| Build Tool | Vite | Fast builds, simple GitHub Pages deployment |
| Routing | React Router DOM | Client-side navigation |
| Markdown | react-markdown + remark-gfm + rehype-highlight | Wiki content rendering |
| Search | Fuse.js | Fuzzy full-text search |
| Caching | IndexedDB (via idb library) | Client-side data persistence |
| Styling | CSS Custom Properties | Dark/light theming |

---

## Landing Page Design

### Design Philosophy

Inspired by the Untitled UI support page, our landing page will serve as a welcoming entry point that:
- Immediately surfaces the search functionality
- Showcases popular/essential topics via card grid
- Establishes the Dystopian Outcasts brand identity
- Provides clear navigation paths into the wiki

### Color Palette (Derived from Branding)

```css
:root {
  /* Primary - Teal/Dark Cyan from logo background */
  --color-primary-900: #1a3a3a;
  --color-primary-800: #234d4d;
  --color-primary-700: #2d6363;
  --color-primary-600: #387a7a;
  --color-primary-500: #4a9494;  /* Main brand teal */
  --color-primary-400: #6aadad;
  --color-primary-300: #8fc4c4;
  --color-primary-200: #b8dbdb;
  --color-primary-100: #e0f0f0;

  /* Accent - Warm Brown/Tan from mascot */
  --color-accent-900: #5c3d1e;
  --color-accent-800: #7a5228;
  --color-accent-700: #996833;
  --color-accent-600: #b87f3e;
  --color-accent-500: #c99555;  /* Main warm accent */
  --color-accent-400: #d4aa73;
  --color-accent-300: #e0c091;
  --color-accent-200: #ebd6b0;
  --color-accent-100: #f5ecd0;

  /* Neutrals */
  --color-neutral-900: #1a1a1a;
  --color-neutral-800: #2d2d2d;
  --color-neutral-700: #404040;
  --color-neutral-600: #525252;
  --color-neutral-500: #6b6b6b;
  --color-neutral-400: #8a8a8a;
  --color-neutral-300: #a8a8a8;
  --color-neutral-200: #d4d4d4;
  --color-neutral-100: #f0f0f0;
  --color-neutral-50: #fafafa;

  /* Semantic */
  --color-background: var(--color-neutral-50);
  --color-surface: #ffffff;
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-background: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-100);
  --color-text-secondary: var(--color-neutral-400);
}
```

### Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  [Logo] [Modding] [Mapping] [Build 41 ▼]    [Search] [🌙]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░  HERO SECTION (gradient bg)  ░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░                                                         ░░ │
│  ░░               [WOMBAT MASCOT IMAGE]                     ░░ │
│  ░░                                                         ░░ │
│  ░░            Project Zomboid Modding Wiki                 ░░ │
│  ░░       Your guide to surviving the apocalypse           ░░ │
│  ░░                  ...with code                           ░░ │
│  ░░                                                         ░░ │
│  ░░    ┌─────────────────────────────────────────┐         ░░ │
│  ░░    │  🔍  Search documentation...            │         ░░ │
│  ░░    └─────────────────────────────────────────┘         ░░ │
│  ░░                                                         ░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  QUICKSTART GUIDES                                              │
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │  📜       │ │  🔧       │ │  🎮       │ │  🗺️       │       │
│  │ Lua API   │ │ Recipes   │ │ Items     │ │ TileZed   │       │
│  │ Events,   │ │ Create    │ │ Define    │ │ Build     │       │
│  │ callbacks │ │ recipes   │ │ items     │ │ maps      │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │  ⚔️       │ │  🌿       │ │ 🩹        │ │  🛠️       │       │
│  │ Weapons   │ │ Foraging  │ │ Mechanics │ │ Tools     │       │
│  │ Repair    │ │ System    │ │ Injury/XP │ │ Debug     │       │
│  │ system    │ │ guide     │ │ systems   │ │ utilities │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BROWSE BY SECTION                                              │
│                                                                 │
│  ┌─────────────────────────┐ ┌─────────────────────────┐       │
│  │ 🔌 MODDING              │ │ 🗺️ MAPPING              │       │
│  │                         │ │                         │       │
│  │ Learn to create mods    │ │ Create custom maps      │       │
│  │ for Project Zomboid     │ │ and buildings           │       │
│  │                         │ │                         │       │
│  │ • Lua API               │ │ • TileZed               │       │
│  │ • Recipes               │ │ • WorldEd               │       │
│  │ • Items                 │ │ • Buildings             │       │
│  │ • Game Mechanics        │ │ • Terrain               │       │
│  │                         │ │                         │       │
│  │ [Browse Modding →]      │ │ [Browse Mapping →]      │       │
│  └─────────────────────────┘ └─────────────────────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RECENTLY UPDATED                                               │
│                                                                 │
│  • Lua Events Reference - Updated 2 days ago                   │
│  • Recipe System Guide - Updated 5 days ago                    │
│  • TileZed Setup - Updated 1 week ago                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  [GitHub] [Discord]  •  Dystopian Outcasts  •  Build 41        │
└─────────────────────────────────────────────────────────────────┘
```

### Hero Section Component

```tsx
// src/components/landing/HeroSection.tsx
interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  return (
    <section className="hero">
      <div className="hero__gradient-bg" />
      <div className="hero__content">
        <img
          src="/assets/branding/logo.png"
          alt="Dystopian Outcasts"
          className="hero__mascot"
        />
        <h1 className="hero__title">Project Zomboid Modding Wiki</h1>
        <p className="hero__subtitle">
          Your guide to surviving the apocalypse... with code
        </p>
        <div className="hero__search">
          <FuzzySearchBar
            placeholder="Search documentation..."
            value={query}
            onChange={setQuery}
            onSearch={onSearch}
            suggestions={suggestions}
            autoFocus
          />
        </div>
      </div>
    </section>
  );
};
```

### Hero Section Styling

```css
/* src/styles/components/hero.css */
.hero {
  position: relative;
  padding: 4rem 2rem 6rem;
  text-align: center;
  overflow: hidden;
}

.hero__gradient-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-primary-100) 0%,
    var(--color-accent-100) 50%,
    var(--color-primary-200) 100%
  );
  opacity: 0.7;
  z-index: -1;
}

[data-theme="dark"] .hero__gradient-bg {
  background: linear-gradient(
    135deg,
    var(--color-primary-900) 0%,
    var(--color-neutral-800) 50%,
    var(--color-primary-800) 100%
  );
  opacity: 1;
}

.hero__mascot {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.hero__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.hero__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.hero__search {
  max-width: 600px;
  margin: 0 auto;
}
```

### Fuzzy Search Implementation

```tsx
// src/components/search/FuzzySearchBar.tsx
import Fuse from 'fuse.js';
import { useEffect, useState, useRef } from 'react';

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  section: string;
  excerpt: string;
  url: string;
  score: number;
}

interface FuzzySearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: SearchSuggestion[];
  autoFocus?: boolean;
}

const FuzzySearchBar: React.FC<FuzzySearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchIndex } = useSearchIndex();

  // Initialize Fuse.js with search index
  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'tags', weight: 0.3 },
      { name: 'excerpt', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ],
    threshold: 0.3,        // Lower = stricter matching
    distance: 100,         // How far to search within text
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2
  }), [searchIndex]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        const results = fuse.search(value, { limit: 8 });
        setSuggestions(results.map(r => ({
          ...r.item,
          score: r.score || 0
        })));
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [value, fuse]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigateToSuggestion(suggestions[selectedIndex]);
        } else {
          onSearch(value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="search-bar">
      <div className="search-bar__input-wrapper">
        <SearchIcon className="search-bar__icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          autoFocus={autoFocus}
        />
        {value && (
          <button
            className="search-bar__clear"
            onClick={() => onChange('')}
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="search-bar__dropdown">
          {suggestions.map((suggestion, index) => (
            <SearchSuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              isSelected={index === selectedIndex}
              onClick={() => navigateToSuggestion(suggestion)}
              query={value}
            />
          ))}
          <div className="search-bar__footer">
            <kbd>↑↓</kbd> to navigate <kbd>↵</kbd> to select <kbd>esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
};
```

### Search Bar Styling

```css
/* src/styles/components/search-bar.css */
.search-bar {
  position: relative;
  width: 100%;
}

.search-bar__input-wrapper {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 2px solid var(--color-neutral-200);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar__input-wrapper:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px rgba(74, 148, 148, 0.15);
}

.search-bar__icon {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-bar__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--color-text-primary);
  outline: none;
}

.search-bar__input::placeholder {
  color: var(--color-neutral-400);
}

.search-bar__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-neutral-200);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
}

.search-suggestion {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-neutral-100);
  transition: background-color 0.15s;
}

.search-suggestion:hover,
.search-suggestion--selected {
  background: var(--color-primary-100);
}

.search-suggestion__title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.search-suggestion__title mark {
  background: var(--color-accent-200);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

.search-suggestion__meta {
  font-size: 0.813rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.search-bar__footer {
  padding: 0.5rem 1rem;
  background: var(--color-neutral-100);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.search-bar__footer kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  background: var(--color-surface);
  border: 1px solid var(--color-neutral-300);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.688rem;
  margin: 0 0.25rem;
}
```

### Quickstart Cards Component

```tsx
// src/components/landing/QuickstartGrid.tsx
interface QuickstartCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  url: string;
  section: 'modding' | 'mapping';
}

const defaultCards: QuickstartCard[] = [
  {
    id: 'lua-api',
    icon: '📜',
    title: 'Lua API',
    description: 'Events, callbacks, and core API reference',
    url: '/build-41/modding/lua-api',
    section: 'modding'
  },
  {
    id: 'recipes',
    icon: '🔧',
    title: 'Recipes',
    description: 'Create custom crafting recipes',
    url: '/build-41/modding/recipes',
    section: 'modding'
  },
  {
    id: 'items',
    icon: '🎮',
    title: 'Items',
    description: 'Define new items and equipment',
    url: '/build-41/modding/items',
    section: 'modding'
  },
  {
    id: 'tilezed',
    icon: '🗺️',
    title: 'TileZed',
    description: 'Build custom maps and tilesets',
    url: '/build-41/mapping/tilezed',
    section: 'mapping'
  },
  {
    id: 'weapon-repair',
    icon: '⚔️',
    title: 'Weapon Repair',
    description: 'Implement weapon repair systems',
    url: '/build-41/modding/weapon-repair',
    section: 'modding'
  },
  {
    id: 'foraging',
    icon: '🌿',
    title: 'Foraging',
    description: 'Customize the foraging system',
    url: '/build-41/modding/foraging',
    section: 'modding'
  },
  {
    id: 'game-mechanics',
    icon: '🩹',
    title: 'Game Mechanics',
    description: 'Injury, XP, and core systems',
    url: '/build-41/modding/game-mechanics',
    section: 'modding'
  },
  {
    id: 'tools',
    icon: '🛠️',
    title: 'Tools',
    description: 'Debugging and development utilities',
    url: '/build-41/modding/tools',
    section: 'modding'
  }
];

const QuickstartGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="quickstart">
      <h2 className="quickstart__title">Quickstart Guides</h2>
      <div className="quickstart__grid">
        {defaultCards.map(card => (
          <article
            key={card.id}
            className="quickstart-card"
            onClick={() => navigate(card.url)}
          >
            <span className="quickstart-card__icon">{card.icon}</span>
            <h3 className="quickstart-card__title">{card.title}</h3>
            <p className="quickstart-card__description">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
```

### Quickstart Cards Styling

```css
/* src/styles/components/quickstart.css */
.quickstart {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.quickstart__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

.quickstart__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .quickstart__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .quickstart__grid {
    grid-template-columns: 1fr;
  }
}

.quickstart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-neutral-200);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.quickstart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-300);
}

.quickstart-card__icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.quickstart-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.375rem;
}

.quickstart-card__description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
```

### Section Browser Component

```tsx
// src/components/landing/SectionBrowser.tsx
const SectionBrowser: React.FC = () => {
  const { version } = useVersion();

  const sections = [
    {
      id: 'modding',
      icon: '🔌',
      title: 'Modding',
      description: 'Learn to create mods for Project Zomboid',
      categories: ['Lua API', 'Recipes', 'Items', 'Game Mechanics', 'Weapon Repair', 'Foraging', 'Tools'],
      color: 'primary'
    },
    {
      id: 'mapping',
      icon: '🗺️',
      title: 'Mapping',
      description: 'Create custom maps and buildings',
      categories: ['TileZed', 'WorldEd', 'Buildings', 'Terrain'],
      color: 'accent'
    }
  ];

  return (
    <section className="section-browser">
      <h2 className="section-browser__title">Browse by Section</h2>
      <div className="section-browser__grid">
        {sections.map(section => (
          <article
            key={section.id}
            className={`section-card section-card--${section.color}`}
          >
            <div className="section-card__header">
              <span className="section-card__icon">{section.icon}</span>
              <h3 className="section-card__title">{section.title}</h3>
            </div>
            <p className="section-card__description">{section.description}</p>
            <ul className="section-card__categories">
              {section.categories.map(cat => (
                <li key={cat}>• {cat}</li>
              ))}
            </ul>
            <Link
              to={`/${version}/${section.id}`}
              className="section-card__link"
            >
              Browse {section.title} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};
```

---

## Project Structure

### Top-Level Organization: Version → Section → Category → Articles

```
pz-modding-wiki/
├── .github/workflows/deploy.yml    # GitHub Actions deployment
├── public/
│   ├── assets/                     # Static media assets
│   │   ├── branding/               # Logo, wordmark, favicons
│   │   │   ├── logo.png            # Main logo (DO_Discord_Avatar.png)
│   │   │   ├── logo-dark.png       # Logo variant for dark theme
│   │   │   ├── favicon.ico         # Browser tab icon
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon-16x16.png
│   │   │   ├── apple-touch-icon.png
│   │   │   └── og-image.png        # Social media preview (1200x630)
│   │   ├── banners/                # Page headers, hero images
│   │   │   ├── hero-banner.png
│   │   │   └── category-headers/   # Per-category banner images
│   │   ├── icons/                  # UI icons, category icons
│   │   │   ├── categories/         # Icons for each wiki category
│   │   │   ├── sections/           # Icons for Modding, Mapping, etc.
│   │   │   └── ui/                 # Search, menu, theme toggle icons
│   │   └── screenshots/            # PZ game screenshots for articles
│   │
│   └── data/                       # JSON "database" files
│       ├── versions.json           # List of supported versions
│       ├── sections.json           # List of sections (Modding, Mapping, etc.)
│       ├── search-index.json       # Global search index (all versions)
│       │
│       └── build-41/               # ══════ VERSION: Build 41 ══════
│           ├── version-info.json   # Version metadata, release date, notes
│           │
│           ├── modding/            # ══════ SECTION: Modding ══════
│           │   ├── section-info.json
│           │   ├── categories.json # Categories within this section
│           │   ├── lua-api/        # Vanilla Lua API docs
│           │   │   ├── index.json
│           │   │   └── *.json      # Individual articles
│           │   ├── recipes/        # Vanilla recipe creation guides
│           │   ├── items/          # Vanilla item creation guides
│           │   ├── game-mechanics/ # Vanilla systems (injury, XP, etc.)
│           │   ├── weapon-repair/  # Vanilla weapon repair system
│           │   ├── foraging/       # Vanilla foraging system
│           │   └── tools/          # Debugging, utilities
│           │
│           └── mapping/            # ══════ SECTION: Mapping ══════
│               ├── section-info.json
│               ├── categories.json
│               ├── tilezed/        # TileZed tutorials
│               ├── worlded/        # WorldEd tutorials
│               ├── buildings/      # Building creation
│               └── terrain/        # Terrain editing
│
│       # Future versions would be added as siblings:
│       # └── build-42/
│       #     ├── modding/
│       #     └── mapping/
├── scripts/
│   ├── build-search-index.ts       # Generates search index at build time
│   └── migrate-markdown.ts         # Converts OutcastTESTING_DOCS to wiki format
├── src/
│   ├── components/
│   │   ├── layout/                 # Layout, Header, Sidebar, Footer, Breadcrumbs
│   │   ├── landing/                # HeroSection, QuickstartGrid, SectionBrowser
│   │   ├── wiki/                   # WikiArticle, MarkdownRenderer, CodeBlock
│   │   ├── search/                 # FuzzySearchBar, SearchResults, SearchSuggestionItem
│   │   └── ui/                     # ThemeToggle, Toast, Button, Tag
│   ├── hooks/                      # useWikiData, useSearch, useTheme, useIndexedDB, useVersion
│   ├── managers/                   # CacheManager, ThemeManager, SearchManager
│   ├── pages/                      # HomePage, VersionPage, SectionPage, CategoryPage, ArticlePage, SearchPage
│   ├── types/                      # TypeScript interfaces
│   ├── utils/                      # storage.ts, markdown.ts, helpers.ts
│   ├── config/                     # App configuration, category definitions
│   ├── context/                    # VersionContext provider
│   └── styles/                     # CSS with custom properties for theming
│       ├── variables.css           # Color palette, spacing, typography
│       ├── base.css                # Reset, global styles
│       ├── components/             # Component-specific styles
│       │   ├── hero.css
│       │   ├── search-bar.css
│       │   ├── quickstart.css
│       │   └── ...
│       └── pages/                  # Page-specific styles
├── vite.config.ts
└── package.json
```

---

## Data Schema

### Top-Level Structures

```typescript
// versions.json
interface VersionsIndex {
  defaultVersion: string;         // "build-41"
  versions: Version[];
}

interface Version {
  id: string;                     // "build-41"
  name: string;                   // "Build 41"
  releaseDate: string;            // "2021-12-20"
  status: 'current' | 'legacy' | 'upcoming';
  sections: string[];             // ["modding", "mapping"]
}

// sections.json
interface SectionsIndex {
  sections: Section[];
}

interface Section {
  id: string;                     // "modding"
  name: string;                   // "Modding"
  description: string;            // "Learn to create mods for Project Zomboid"
  icon: string;                   // Icon identifier
}
```

### WikiArticle

```typescript
interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  version: string;              // "build-41"
  section: string;              // "modding" or "mapping"
  category: string;
  subcategory?: string;
  tags: string[];
  content: string;              // Markdown content
  excerpt: string;              // First 200 chars for preview
  relatedArticles: string[];    // Slugs of related articles
  lastUpdated: string;          // ISO date
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tableOfContents: { id: string; text: string; level: number }[];
}
```

### Search Index Entry

```typescript
interface SearchIndexEntry {
  id: string;
  title: string;
  slug: string;
  version: string;
  section: string;
  category: string;
  tags: string[];
  excerpt: string;
  url: string;
}
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Fuzzy Search** | Fuse.js-powered search with typo tolerance, instant suggestions |
| **Version Selector** | Dropdown to switch between Build 41, Build 42, etc. |
| **Section Tabs** | Top-level tabs for Modding, Mapping (expandable) |
| **Category Navigation** | Sidebar with collapsible category tree per section |
| **Markdown Rendering** | GFM support, Lua syntax highlighting |
| **Code Blocks** | Copy-to-clipboard, language labels |
| **Dark/Light Theme** | CSS custom properties, persisted preference |
| **IndexedDB Caching** | Fast repeat visits, 24-hour cache duration |
| **Lazy Loading** | Only fetch data when needed |
| **Mobile Responsive** | Hamburger menu, responsive grid |

---

## URL Structure

```
/                                    # Home - hero + quickstart + sections
/build-41/                           # Version landing page
/build-41/modding/                   # Section landing page
/build-41/modding/lua-api/           # Category listing
/build-41/modding/lua-api/events     # Individual article
/build-41/mapping/tilezed/           # Mapping section category
/search?q=recipe&version=build-41    # Search with filters
```

---

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript in `Dystopian_Wiki/`
- [ ] Configure `vite.config.ts` for GitHub Pages (`base: '/repo-name/'`)
- [ ] Install dependencies (`react-router-dom`, `react-markdown`, `fuse.js`, `idb`)
- [ ] Set up project folder structure
- [ ] Create `public/assets/` directory structure:
  - [ ] `branding/` - logo.png (from DO_Discord_Avatar.png), favicons
  - [ ] `banners/` - hero images, category headers
  - [ ] `icons/` - category icons, UI icons
  - [ ] `screenshots/` - PZ game screenshots for articles
- [ ] Create CSS custom properties for theming (`variables.css`)
- [ ] Implement `storage.ts` utility (adapted from personal site)

### Phase 2: Landing Page & Search
- [ ] Create `HeroSection.tsx` with gradient background and mascot
- [ ] Implement `FuzzySearchBar.tsx` with Fuse.js integration
- [ ] Build `SearchSuggestionItem.tsx` with match highlighting
- [ ] Create `QuickstartGrid.tsx` with 8 topic cards
- [ ] Build `SectionBrowser.tsx` for Modding/Mapping sections
- [ ] Create `RecentlyUpdated.tsx` component
- [ ] Assemble `HomePage.tsx` with all landing components
- [ ] Style all landing page components

### Phase 3: Core Layout
- [ ] Create `Layout.tsx` wrapper component
- [ ] Build `Header.tsx` with logo, search bar, theme toggle, version selector
- [ ] Build `Sidebar.tsx` with category navigation
- [ ] Create `Breadcrumbs.tsx` component
- [ ] Implement `ThemeManager.ts` and `useTheme` hook
- [ ] Add mobile responsive styles and `MobileMenu.tsx`

### Phase 4: Wiki Components
- [ ] Create `MarkdownRenderer.tsx` with syntax highlighting
- [ ] Build `CodeBlock.tsx` with copy-to-clipboard
- [ ] Create `WikiArticle.tsx` main article component
- [ ] Build `TableOfContents.tsx` for in-page navigation
- [ ] Create `RelatedArticles.tsx` component

### Phase 5: Data Layer
- [ ] Define TypeScript interfaces (`types/wiki.ts`)
- [ ] Create sample JSON data files in `public/data/`
- [ ] Implement `CacheManager.ts` for IndexedDB
- [ ] Create `useWikiData` hook for data fetching with caching
- [ ] Add loading states and error boundaries

### Phase 6: Pages & Routing
- [ ] Set up React Router with nested routes for version/section/category/article
- [ ] Create `VersionPage.tsx` for version landing (shows sections)
- [ ] Create `SectionPage.tsx` for section landing (shows categories)
- [ ] Create `CategoryPage.tsx` for article listings
- [ ] Create `ArticlePage.tsx` for individual articles
- [ ] Create `SearchPage.tsx` with version/section filters
- [ ] Create `NotFoundPage.tsx` (404)
- [ ] Implement `VersionContext` provider for global version state

### Phase 7: Content Migration (Vanilla PZ Only)
- [ ] Write `migrate-markdown.ts` script with exclusion filters
- [ ] Map ONLY vanilla PZ files to wiki categories:
  - [ ] `01-04` vanilla recipe guides → `recipes/`
  - [ ] `05-06` vanilla item guides → `items/`
  - [ ] `API_Research/` → `lua-api/`
  - [ ] `Weapon_Repair_Research/` → `weapon-repair/`
  - [ ] `FORAGING_RESEARCH/` (vanilla notes only) → `foraging/`
  - [ ] `PZ_Injury_System_Reference.md`, `PZ_Literature_System_Complete_Guide.md` → `game-mechanics/`
  - [ ] `ANIMATION_REFERENCE.md`, `SOUND_REFERENCE.md` → `game-mechanics/`
  - [ ] `TILEZED_SETUP_GUIDE.md`, `STEAM_MOD_FETCHER_README.md` → `tools/`
- [ ] Exclude all DO proprietary content (blacksmith, bullet-factory, techblade, outcast_*, etc.)
- [ ] Run migration to generate JSON files
- [ ] Build search index (`build-search-index.ts`)
- [ ] Verify content renders correctly

### Phase 8: Deployment
- [ ] Create GitHub Actions workflow (`.github/workflows/deploy.yml`)
- [ ] Add `404.html` for SPA routing on GitHub Pages
- [ ] Create new GitHub account/organization for anonymity
- [ ] Push and deploy to GitHub Pages
- [ ] Test production deployment

---

## Wiki Structure (Build 41 - Vanilla PZ Research Only)

### Section: MODDING

| Category | Content Source | Articles Est. |
|----------|---------------|---------------|
| Lua API | `API_Research/` (vanilla bridge, events, patterns) | 8-10 |
| Recipes | `01-04` vanilla recipe guides, vanilla-recipe-anatomy | 5-8 |
| Items | `05-06` vanilla item guides, vanilla-item-anatomy, vanilla-ammunition | 5-8 |
| Game Mechanics | Injury system, literature system, XP system, animations, sounds | 8-10 |
| Weapon Repair | `Weapon_Repair_Research/` (complete vanilla system) | 8-10 |
| Foraging | `FORAGING_RESEARCH/` (vanilla foraging notes) | 3-5 |
| Tools | Debugging guides, Steam mod fetcher | 2-3 |

**Modding subtotal: 40-55 articles**

### Section: MAPPING

| Category | Content Source | Articles Est. |
|----------|---------------|---------------|
| TileZed | `TILEZED_SETUP_GUIDE.md`, general TileZed tutorials | 3-5 |
| WorldEd | WorldEd documentation (to be created) | 2-4 |
| Buildings | Building creation guides (to be created) | 2-4 |
| Terrain | Terrain editing guides (to be created) | 2-3 |

**Mapping subtotal: 9-16 articles** (some to be created)

**Total estimated articles: 50-70** (vanilla PZ content only)

---

## Content EXCLUDED (Proprietary Dystopian Outcasts)

- `blacksmith-guide/`, `bullet-factory-system/`, `outcast_smithing_master/`
- `cross-skill-synergies/`, `all_metal_items/`
- `Techblade_System/`, `Techblade_EndUserDoc/`, `techblade/`
- `Achievement_Research/` (OutcastAchievements)
- `Prestige/`, `SkillRecoveryJournal_Docs/`
- `DO_*` folders, any "Outcast" named files
- Custom Python scripts for DO mod generation
- Iron/slag/smelting balancing documents

---

## Answers to Your Questions

### Should sections be able to differ between versions?

**Yes.** The current schema supports this. Each version entry has a `sections` array:

```json
{
  "id": "build-41",
  "sections": ["modding", "mapping"]
}
// vs
{
  "id": "build-42",
  "sections": ["modding", "mapping", "crafting"]  // New section!
}
```

The `sections.json` defines all possible sections, but each version only enables what applies to it.

### Do you want a "compare versions" feature later?

**Recommendation: Plan for it, don't build it yet.**

Architecture support (already in place):
- Articles have `version` field
- Slugs can be consistent across versions
- Search index includes version metadata

Future implementation would be:
- Side-by-side diff view
- "Changed in Build 42" badges
- Migration guides between versions

This is a Phase 9+ feature that doesn't require architectural changes now.

---

## Verification Plan

### Local Development
- Run `npm run dev` and verify hot reload works
- Test all routes load correctly
- Test fuzzy search returns relevant results with typo tolerance
- Verify theme toggle persists across page refresh
- Test landing page on mobile viewport

### Build Validation
- Run `npm run build` successfully
- Verify `dist/` folder contains all data files
- Run `npm run preview` and test production build locally

### GitHub Pages Deployment
- Push to main branch triggers GitHub Actions
- Verify site loads at `https://[username].github.io/[repo]/`
- Test deep links work (e.g., `/build-41/modding/recipes/`)
- Verify 404 redirect handles client-side routing

### Content Verification
- Markdown renders correctly with code highlighting
- Internal links navigate properly
- Images load (if any)
- Search finds articles by title, tags, and content
- Fuzzy matching works for typos (e.g., "recipie" finds "recipe")

---

## Files to Create First

1. `package.json` - Dependencies and scripts
2. `vite.config.ts` - Build configuration
3. `src/styles/variables.css` - CSS custom properties (color palette)
4. `src/utils/storage.ts` - localStorage wrapper
5. `src/config/index.ts` - App configuration
6. `src/App.tsx` - Root component with router
7. `src/components/landing/HeroSection.tsx` - Landing page hero
8. `src/components/search/FuzzySearchBar.tsx` - Search with Fuse.js

---

## Notes

- **No Node.js runtime** - Everything runs in the browser
- **Contributions via GitHub PRs** - Edit JSON/markdown files, submit PR
- **No gamification** - Pure information wiki
- **Separate GitHub account recommended** for anonymity
