-- Migration 001: Create Core Tables
-- Created: 2026-01-18
-- Description: Articles, Categories, User Profiles, Bookmarks, Reading Progress

-- ============================================================================
-- ARTICLES TABLE
-- ============================================================================
CREATE TABLE articles (
  id TEXT PRIMARY KEY,                    -- "vanilla-weapons-reference"
  slug TEXT NOT NULL UNIQUE,              -- URL-friendly slug
  title TEXT NOT NULL,
  content TEXT NOT NULL,                  -- Full markdown content
  excerpt TEXT,                           -- First ~200 chars for preview

  -- Hierarchy
  game TEXT NOT NULL,                     -- 'pz', 'vs'
  version TEXT NOT NULL,                  -- 'build-41', 'build-42'
  section TEXT NOT NULL,                  -- 'modding', 'mapping'
  category TEXT NOT NULL,                 -- 'items', 'recipes', etc.
  subcategory TEXT,                       -- Optional

  -- Metadata
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',               -- Array of tags

  -- Relationships (stored as JSON for flexibility)
  related_articles TEXT[] DEFAULT '{}',   -- Array of slugs
  table_of_contents JSONB DEFAULT '[]',   -- TOC items
  next_steps JSONB DEFAULT '[]',          -- Suggested next articles

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- ETag for cache validation (auto-updates on changes)
  etag UUID DEFAULT gen_random_uuid(),

  -- Full-text search (auto-updated)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED
);

-- Trigger to update etag on article changes
CREATE OR REPLACE FUNCTION update_article_etag()
RETURNS TRIGGER AS $$
BEGIN
  NEW.etag = gen_random_uuid();
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_etag_trigger
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_article_etag();

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  section TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  preferred_game TEXT DEFAULT 'pz',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- BOOKMARKS TABLE
-- ============================================================================
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  article_id TEXT REFERENCES articles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================================================
-- READING PROGRESS TABLE
-- ============================================================================
CREATE TABLE reading_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  article_id TEXT REFERENCES articles(id) NOT NULL,
  scroll_position FLOAT DEFAULT 0,     -- 0.0 to 1.0
  completed BOOLEAN DEFAULT FALSE,
  last_read TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================================================
-- REQUEST LOG TABLE (Rate Limiting)
-- ============================================================================
CREATE TABLE request_log (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,              -- IP address or user_id
  endpoint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-cleanup old logs (keep 24 hours only)
CREATE OR REPLACE FUNCTION cleanup_old_request_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM request_log WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE articles IS 'Wiki articles with full-text search';
COMMENT ON COLUMN articles.etag IS 'ETag for cache validation - auto-updates on changes';
COMMENT ON COLUMN articles.search_vector IS 'Auto-generated tsvector for full-text search';
COMMENT ON TABLE categories IS 'Article categories organized by game/section';
COMMENT ON TABLE user_profiles IS 'Extended user profile data';
COMMENT ON TABLE bookmarks IS 'User bookmarks for articles';
COMMENT ON TABLE reading_progress IS 'User reading progress tracking';
COMMENT ON TABLE request_log IS 'Rate limiting request log';
