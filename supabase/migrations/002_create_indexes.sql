-- Migration 002: Create Indexes for Performance
-- Created: 2026-01-18
-- Description: Indexes for common queries and searches

-- ============================================================================
-- ARTICLES INDEXES
-- ============================================================================

-- Fast lookups by game/version/section/category
CREATE INDEX idx_articles_game_version
  ON articles(game, version);

CREATE INDEX idx_articles_section_category
  ON articles(section, category);

CREATE INDEX idx_articles_game_version_section
  ON articles(game, version, section);

-- Fast slug lookups (unique index created automatically with UNIQUE constraint)
-- CREATE INDEX idx_articles_slug ON articles(slug); -- Already covered by UNIQUE

-- Tag searches using GIN index (faster for array containment queries)
CREATE INDEX idx_articles_tags
  ON articles USING GIN(tags);

-- Full-text search index (GIN index for tsvector)
CREATE INDEX idx_articles_search
  ON articles USING GIN(search_vector);

-- Recent articles
CREATE INDEX idx_articles_last_updated
  ON articles(last_updated DESC);

CREATE INDEX idx_articles_created
  ON articles(created_at DESC);

-- Difficulty filtering
CREATE INDEX idx_articles_difficulty
  ON articles(difficulty) WHERE difficulty IS NOT NULL;

-- ============================================================================
-- CATEGORIES INDEXES
-- ============================================================================

CREATE INDEX idx_categories_game_section
  ON categories(game, section);

CREATE INDEX idx_categories_display_order
  ON categories(display_order);

-- ============================================================================
-- BOOKMARKS INDEXES
-- ============================================================================

-- User's bookmarks (unique index created automatically with UNIQUE constraint)
CREATE INDEX idx_bookmarks_user
  ON bookmarks(user_id);

-- Find all users who bookmarked an article
CREATE INDEX idx_bookmarks_article
  ON bookmarks(article_id);

-- Recent bookmarks
CREATE INDEX idx_bookmarks_created
  ON bookmarks(created_at DESC);

-- ============================================================================
-- READING PROGRESS INDEXES
-- ============================================================================

CREATE INDEX idx_reading_progress_user
  ON reading_progress(user_id);

-- Recent reading activity
CREATE INDEX idx_reading_progress_last_read
  ON reading_progress(last_read DESC);

-- Completed articles
CREATE INDEX idx_reading_progress_completed
  ON reading_progress(completed) WHERE completed = true;

-- ============================================================================
-- REQUEST LOG INDEXES (Rate Limiting)
-- ============================================================================

-- Fast rate limit checks (last 5 minutes of requests)
CREATE INDEX idx_request_log_identifier
  ON request_log(identifier, created_at DESC);

-- Cleanup index
CREATE INDEX idx_request_log_created
  ON request_log(created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_articles_game_version IS 'Fast filtering by game and version';
COMMENT ON INDEX idx_articles_search IS 'GIN index for full-text search';
COMMENT ON INDEX idx_articles_tags IS 'GIN index for tag containment queries';
COMMENT ON INDEX idx_request_log_identifier IS 'Rate limiting lookups';
