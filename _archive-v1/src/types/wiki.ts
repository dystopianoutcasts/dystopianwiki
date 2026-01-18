/**
 * Wiki Data Types
 */

// ═══════════════════════════════════════════════════════════════════
// VERSION & SECTIONS
// ═══════════════════════════════════════════════════════════════════

export interface Version {
  id: string;           // "build-41"
  name: string;         // "Build 41"
  releaseDate?: string; // "2021-12-20"
  status: 'current' | 'legacy' | 'upcoming';
  sections: string[];   // ["modding", "mapping"]
  description?: string; // Version description
  features?: string[];  // Version features list
}

export interface VersionsIndex {
  defaultVersion: string;
  versions: Version[];
}

export interface Section {
  id: string;           // "modding"
  name: string;         // "Modding"
  description: string;  // "Learn to create mods for Project Zomboid"
  icon: string;         // Emoji or icon identifier
}

export interface SectionsIndex {
  sections: Section[];
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════

export interface Category {
  id: string;           // "lua-api"
  name: string;         // "Lua API"
  description: string;
  icon: string;
  articleCount?: number;
}

export interface CategoriesIndex {
  categories: Category[];
}

// ═══════════════════════════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════════════════════════

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TOCItem {
  id: string;
  text: string;
  level: number;  // 1-6 for h1-h6
}

export interface NextStep {
  title: string;
  url: string;
  description?: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  version: string;
  section: string;
  category: string;
  subcategory?: string;
  tags: string[];
  content: string;        // Markdown content
  excerpt: string;        // First ~200 chars for preview
  relatedArticles: string[];  // Slugs of related articles
  lastUpdated: string;    // ISO date string
  difficulty?: Difficulty;
  tableOfContents: TOCItem[];
  nextSteps?: NextStep[]; // Suggested next articles (shown outside learning path)
}

export interface ArticleIndex {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  difficulty?: Difficulty;
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════

export interface SearchEntry {
  id: string;
  title: string;
  slug: string;
  url: string;
  version: string;
  section: string;
  category: string;
  tags: string[];
  excerpt: string;
  difficulty?: Difficulty;
}

export interface SearchResult extends SearchEntry {
  score: number;
  matches?: Array<{
    key: string;
    value: string;
    indices: Array<[number, number]>;
  }>;
}

// ═══════════════════════════════════════════════════════════════════
// QUICKSTART CARDS (Landing Page)
// ═══════════════════════════════════════════════════════════════════

export interface QuickstartCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  url: string;
  section: 'modding' | 'mapping';
}

// ═══════════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════════

export type Theme = 'light' | 'dark' | 'system';
