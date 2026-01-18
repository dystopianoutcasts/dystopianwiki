# Migration Plan: Wiki to Mobile App

## Overview

This document outlines the step-by-step process to evolve from the current static wiki to a full cross-platform app with backend.

---

## Phase 0: Current State (Where We Are Now)

```
✅ React + TypeScript wiki
✅ Static JSON content
✅ GitHub Pages hosting
✅ Game-agnostic architecture (/pz/, /vs/)
✅ 16 vanilla-reference articles
✅ IndexedDB caching
```

---

## Phase 1: Backend Setup

**Goal:** Get Supabase running with our content

### 1.1 Create Supabase Project

```bash
# Sign up at supabase.com
# Create new project: "dystopian-wiki"
# Save credentials:
#   - Project URL
#   - Anon key (safe for frontend)
#   - Service key (admin only, never expose)
```

### 1.2 Database Schema

```sql
-- Articles table
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  game TEXT NOT NULL,           -- 'pz', 'vs'
  version TEXT NOT NULL,        -- 'build-41', 'build-42'
  section TEXT NOT NULL,        -- 'modding', 'mapping'
  category TEXT NOT NULL,       -- 'items', 'recipes'
  difficulty TEXT,              -- 'beginner', 'intermediate', 'advanced'
  tags TEXT[],
  related_articles TEXT[],
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX articles_fts ON articles
USING gin(to_tsvector('english', title || ' ' || content));

-- Users table (auto-created by Supabase Auth, we just add profile)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  preferred_game TEXT DEFAULT 'pz',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  article_id TEXT REFERENCES articles NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Reading progress
CREATE TABLE reading_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  article_id TEXT REFERENCES articles NOT NULL,
  scroll_position FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_read TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Rate limiting
CREATE TABLE request_log (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_log_lookup
ON request_log (identifier, created_at DESC);
```

### 1.3 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Articles: Anyone can read
CREATE POLICY "Articles are public" ON articles
FOR SELECT USING (true);

-- Bookmarks: Users see only their own
CREATE POLICY "Users can view own bookmarks" ON bookmarks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
FOR DELETE USING (auth.uid() = user_id);

-- Reading progress: Users see only their own
CREATE POLICY "Users can manage own progress" ON reading_progress
FOR ALL USING (auth.uid() = user_id);

-- Profiles: Users see only their own
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);
```

### 1.4 Import Existing Content

```python
# scripts/import_to_supabase.py

import json
import os
from supabase import create_client

SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_SERVICE_KEY']

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_articles():
    """Import all JSON articles to Supabase"""
    content_dir = 'public/api/pz/v1/build-41/modding'

    for category in os.listdir(content_dir):
        category_path = os.path.join(content_dir, category)
        if not os.path.isdir(category_path):
            continue

        for filename in os.listdir(category_path):
            if not filename.endswith('.json') or filename == 'index.json':
                continue

            with open(os.path.join(category_path, filename)) as f:
                article = json.load(f)

            # Transform to database schema
            db_article = {
                'id': article['id'],
                'slug': article['slug'],
                'title': article['title'],
                'content': article['content'],
                'excerpt': article.get('excerpt', ''),
                'game': 'pz',
                'version': article.get('version', 'build-41'),
                'section': article.get('section', 'modding'),
                'category': article.get('category', category),
                'difficulty': article.get('difficulty'),
                'tags': article.get('tags', []),
                'related_articles': article.get('relatedArticles', []),
            }

            # Upsert (insert or update)
            supabase.table('articles').upsert(db_article).execute()
            print(f"Imported: {article['title']}")

if __name__ == '__main__':
    import_articles()
```

### 1.5 Verification Checklist

```
⬜ Supabase project created
⬜ Database schema applied
⬜ RLS policies in place
⬜ All articles imported
⬜ Test queries working
⬜ Auth providers configured (email, Google, Discord)
```

---

## Phase 2: Web App Migration

**Goal:** Update current wiki to use Supabase instead of static JSON

### 2.1 Install Supabase Client

```bash
cd packages/web  # or current wiki root
npm install @supabase/supabase-js
```

### 2.2 Create Supabase Client

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2.3 Update Data Fetching Hooks

```typescript
// src/hooks/useArticle.ts

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useArticle(slug: string) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) throw error
        setArticle(data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  return { article, loading, error }
}
```

### 2.4 Add Authentication UI

```typescript
// src/components/AuthButton.tsx

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthButton() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div>
        <span>{user.email}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    )
  }

  return <button onClick={handleLogin}>Login with Discord</button>
}
```

### 2.5 Verification Checklist

```
⬜ Supabase client installed and configured
⬜ Environment variables set in Vercel
⬜ Data fetching hooks updated
⬜ Auth UI added
⬜ Bookmarks feature working
⬜ All pages loading from Supabase
⬜ Old static JSON fetching removed
⬜ Search updated to use Supabase
```

---

## Phase 3: Mobile App Development

**Goal:** Build React Native app with Expo

### 3.1 Initialize Project

```bash
# Create monorepo structure
mkdir packages
mv src packages/web/src
mv public packages/web/public

# Initialize mobile app
cd packages
npx create-expo-app mobile --template tabs
cd mobile
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### 3.2 Set Up Shared Code

```bash
# Create shared package
mkdir packages/shared
cd packages/shared
npm init -y
```

```typescript
// packages/shared/types/article.ts

export interface Article {
  id: string
  slug: string
  title: string
  content: string
  excerpt?: string
  game: 'pz' | 'vs'
  version: string
  section: string
  category: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  relatedArticles: string[]
  lastUpdated: string
}
```

### 3.3 Build Core Screens

Priority order:
1. Home screen (game selector)
2. Article list (browse by category)
3. Article view (markdown renderer)
4. Search
5. Bookmarks
6. Settings

### 3.4 Implement Offline Support

```typescript
// packages/mobile/services/cache.ts

import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_PREFIX = '@article_cache_'

export async function cacheArticle(article: Article) {
  await AsyncStorage.setItem(
    CACHE_PREFIX + article.slug,
    JSON.stringify(article)
  )
}

export async function getCachedArticle(slug: string): Promise<Article | null> {
  const cached = await AsyncStorage.getItem(CACHE_PREFIX + slug)
  return cached ? JSON.parse(cached) : null
}

export async function getArticle(slug: string): Promise<Article> {
  // Try cache first
  const cached = await getCachedArticle(slug)

  // If online, fetch fresh and update cache
  if (navigator.onLine) {
    try {
      const fresh = await fetchFromSupabase(slug)
      await cacheArticle(fresh)
      return fresh
    } catch (e) {
      // If fetch fails but we have cache, use it
      if (cached) return cached
      throw e
    }
  }

  // Offline: return cache or throw
  if (cached) return cached
  throw new Error('Article not available offline')
}
```

### 3.5 Verification Checklist

```
⬜ Expo project initialized
⬜ Shared types package created
⬜ Supabase client working in React Native
⬜ Home screen with game selector
⬜ Article browsing working
⬜ Article rendering (markdown)
⬜ Search working
⬜ Authentication working
⬜ Bookmarks syncing
⬜ Offline caching working
⬜ Works on iOS simulator
⬜ Works on Android emulator
⬜ Works on physical devices
```

---

## Phase 4: Vector Search (Semantic Search)

**Goal:** Add "smart" search that understands meaning

### 4.1 Enable pgvector

```sql
-- In Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to articles
ALTER TABLE articles
ADD COLUMN embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX ON articles
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 4.2 Generate Embeddings

```python
# scripts/generate_embeddings.py

import openai
from supabase import create_client

openai.api_key = os.environ['OPENAI_API_KEY']

def get_embedding(text: str) -> list[float]:
    """Get embedding from OpenAI (or use free alternative)"""
    response = openai.Embedding.create(
        model="text-embedding-3-small",
        input=text
    )
    return response['data'][0]['embedding']

def embed_all_articles():
    """Generate embeddings for all articles"""
    articles = supabase.table('articles').select('id, title, content').execute()

    for article in articles.data:
        # Combine title and content for embedding
        text = f"{article['title']}\n\n{article['content']}"

        # Truncate if too long (8191 tokens max)
        if len(text) > 30000:
            text = text[:30000]

        embedding = get_embedding(text)

        supabase.table('articles').update({
            'embedding': embedding
        }).eq('id', article['id']).execute()

        print(f"Embedded: {article['title']}")

# Cost estimate: ~$0.50 for 500 articles
```

### 4.3 Semantic Search Function

```sql
-- Function to search by meaning
CREATE OR REPLACE FUNCTION search_articles(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  slug text,
  title text,
  excerpt text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    articles.id,
    articles.slug,
    articles.title,
    articles.excerpt,
    1 - (articles.embedding <=> query_embedding) AS similarity
  FROM articles
  WHERE 1 - (articles.embedding <=> query_embedding) > match_threshold
  ORDER BY articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 4.4 Search in App

```typescript
// Hybrid search: combines full-text and semantic

async function searchArticles(query: string) {
  // Get query embedding (one API call)
  const embedding = await getEmbedding(query)

  // Search both ways in parallel
  const [textResults, semanticResults] = await Promise.all([
    // Full-text search
    supabase
      .from('articles')
      .select('id, slug, title, excerpt')
      .textSearch('title, content', query)
      .limit(10),

    // Semantic search
    supabase.rpc('search_articles', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10
    })
  ])

  // Combine and dedupe results
  return combineResults(textResults.data, semanticResults.data)
}
```

### 4.5 Verification Checklist

```
⬜ pgvector extension enabled
⬜ Embedding column added
⬜ All articles embedded
⬜ Search function created
⬜ Hybrid search working in app
⬜ Search feels "smart" (finds related even without exact keywords)
```

---

## Phase 5: App Store Publishing

**Goal:** Get the app live on iOS and Android

### 5.1 Prepare Assets

```
Required for both stores:
⬜ App icon (1024x1024 PNG)
⬜ Feature graphic (1024x500 for Android)
⬜ Screenshots (phone + tablet)
⬜ Short description (80 chars)
⬜ Full description (4000 chars)
⬜ Privacy policy URL
⬜ Support email

Additional for iOS:
⬜ App Store screenshots (6.7", 6.5", 5.5")
⬜ iPad screenshots (if supporting)
```

### 5.2 Configure EAS

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 5.3 Build and Submit

```bash
# Build for both platforms
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### 5.4 Store Listing Content

**Short Description:**
> Modding wiki for Project Zomboid and Vintage Story. Browse guides, search documentation, save bookmarks.

**Full Description:**
> The Dystopian Outcasts Wiki is a comprehensive modding resource for survival game enthusiasts.
>
> Features:
> • Browse 500+ modding articles
> • Smart search that understands what you're looking for
> • Save bookmarks for offline reading
> • Dark mode for late-night modding sessions
> • Covers Project Zomboid (with more games coming)
>
> Whether you're learning to create your first mod or looking up vanilla item stats, this wiki has you covered.
>
> Built by the Dystopian Outcasts community.

### 5.5 Verification Checklist

```
⬜ Google Play Console account set up
⬜ Apple Developer account set up
⬜ App icons and screenshots created
⬜ Privacy policy published
⬜ EAS configured
⬜ Production build successful
⬜ Android app submitted to Play Store
⬜ iOS app submitted to App Store
⬜ Both apps approved and live
```

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Backend Setup | 1-2 days | None |
| Phase 2: Web Migration | 3-5 days | Phase 1 |
| Phase 3: Mobile App | 2-4 weeks | Phase 1 |
| Phase 4: Vector Search | 2-3 days | Phase 1 |
| Phase 5: Publishing | 1-2 weeks | Phase 3 |

**Total: 4-8 weeks** depending on pace and complexity encountered.

---

## Rollback Plans

### If Supabase Migration Fails

- Keep static JSON files as backup
- Can revert web app to fetch from /api/ paths
- Mobile app can use static JSON endpoint as fallback

### If Mobile App Has Critical Bugs

- Use OTA updates for JS fixes (no store review)
- Worst case: Pull from stores, fix, resubmit

### If We Outgrow Free Tiers

- Supabase Pro: $25/month (immediate upgrade path)
- Vercel Pro: $20/month (immediate upgrade path)
- No migration needed, just payment
