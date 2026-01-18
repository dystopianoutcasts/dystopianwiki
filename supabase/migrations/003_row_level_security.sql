-- Migration 003: Row Level Security (RLS) Policies
-- Created: 2026-01-18
-- Description: Security policies for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Note: request_log is internal, no RLS needed (only server-side access)

-- ============================================================================
-- ARTICLES POLICIES
-- ============================================================================

-- Public read access for all articles
CREATE POLICY "Articles are publicly readable"
  ON articles
  FOR SELECT
  USING (true);

-- Only admins can write articles (for now)
-- TODO: Add community editing with approval workflow in Phase 2

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================

-- Public read access for categories
CREATE POLICY "Categories are publicly readable"
  ON categories
  FOR SELECT
  USING (true);

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (auto-created by trigger, but allow manual creation)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- BOOKMARKS POLICIES
-- ============================================================================

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookmarks (with rate limit enforced at DB level)
CREATE POLICY "Users can create own bookmarks"
  ON bookmarks
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Rate limit: max 10 bookmarks per minute
      SELECT COUNT(*)
      FROM bookmarks
      WHERE user_id = auth.uid()
        AND created_at > NOW() - INTERVAL '1 minute'
    ) < 10
  );

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- READING PROGRESS POLICIES
-- ============================================================================

-- Users manage only their own reading progress
CREATE POLICY "Users manage own reading progress"
  ON reading_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECURITY HARDENING
-- ============================================================================

-- Prevent banned users from modifying data
CREATE POLICY "Banned users cannot update profiles"
  ON user_profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    AND NOT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND (raw_user_meta_data->>'is_banned')::boolean = true
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Articles are publicly readable" ON articles
  IS 'All users (authenticated and anonymous) can read articles';

COMMENT ON POLICY "Users can create own bookmarks" ON bookmarks
  IS 'Rate limited to 10 bookmarks per minute per user';

COMMENT ON POLICY "Users manage own reading progress" ON reading_progress
  IS 'Full CRUD access to own reading progress';
