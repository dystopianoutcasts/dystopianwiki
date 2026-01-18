-- Migration 004: Database Functions
-- Created: 2026-01-18
-- Description: Helper functions for rate limiting, search, and utilities

-- ============================================================================
-- RATE LIMITING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- Count requests in the time window
  SELECT COUNT(*)
  INTO request_count
  FROM request_log
  WHERE identifier = p_identifier
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Log this request
  INSERT INTO request_log (identifier, endpoint)
  VALUES (p_identifier, current_setting('request.headers', true)::json->>'path');

  -- Return true if under limit
  RETURN request_count < p_limit;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs (e.g., JSON parsing), allow the request
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEARCH FUNCTION (Wrapper for Full-Text Search)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_articles(
  p_query TEXT,
  p_game TEXT DEFAULT NULL,
  p_version TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  id TEXT,
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  game TEXT,
  version TEXT,
  section TEXT,
  category TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.game,
    a.version,
    a.section,
    a.category,
    ts_rank(a.search_vector, websearch_to_tsquery('english', p_query)) AS rank
  FROM articles a
  WHERE a.search_vector @@ websearch_to_tsquery('english', p_query)
    AND (p_game IS NULL OR a.game = p_game)
    AND (p_version IS NULL OR a.version = p_version)
  ORDER BY rank DESC, a.last_updated DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- UPDATE CATEGORY ARTICLE COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update article count for the category
  UPDATE categories
  SET article_count = (
    SELECT COUNT(*)
    FROM articles
    WHERE game = NEW.game
      AND section = NEW.section
      AND category = NEW.category
  )
  WHERE game = NEW.game
    AND section = NEW.section
    AND id = NEW.category;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update category counts when articles are added
CREATE TRIGGER update_category_count_on_insert
  AFTER INSERT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_category_article_count();

CREATE TRIGGER update_category_count_on_update
  AFTER UPDATE ON articles
  FOR EACH ROW
  WHEN (OLD.category IS DISTINCT FROM NEW.category)
  EXECUTE FUNCTION update_category_article_count();

CREATE TRIGGER update_category_count_on_delete
  AFTER DELETE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_category_article_count();

-- ============================================================================
-- AUTO-UPDATE UPDATED_AT TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CLEANUP FUNCTIONS (Scheduled Tasks)
-- ============================================================================

-- Cleanup old request logs (keep 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_request_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM request_log
  WHERE created_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET RELATED ARTICLES (Simple recommendation)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_articles(
  p_article_id TEXT,
  p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
  id TEXT,
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH current_article AS (
    SELECT a.game, a.version, a.section, a.category, a.tags
    FROM articles a
    WHERE a.id = p_article_id
  )
  SELECT
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    -- Relevance score based on matching attributes
    (
      CASE WHEN a.category = ca.category THEN 3 ELSE 0 END +
      CASE WHEN a.section = ca.section THEN 2 ELSE 0 END +
      CASE WHEN a.tags && ca.tags THEN 1 ELSE 0 END
    ) AS relevance_score
  FROM articles a, current_article ca
  WHERE a.id != p_article_id
    AND a.game = ca.game
    AND a.version = ca.version
    AND (
      a.category = ca.category
      OR a.section = ca.section
      OR a.tags && ca.tags
    )
  ORDER BY relevance_score DESC, a.last_updated DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION check_rate_limit IS 'Check and enforce rate limits for API requests';
COMMENT ON FUNCTION search_articles IS 'Full-text search with optional game/version filtering';
COMMENT ON FUNCTION update_category_article_count IS 'Auto-update article counts in categories table';
COMMENT ON FUNCTION cleanup_old_request_logs IS 'Remove request logs older than 24 hours';
COMMENT ON FUNCTION get_related_articles IS 'Find related articles based on category, section, and tags';
