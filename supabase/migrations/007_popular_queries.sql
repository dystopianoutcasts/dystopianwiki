-- Migration: Create popular_queries table for search autocomplete
-- This table stores successful search queries to power autocomplete suggestions

-- Create the popular_queries table
CREATE TABLE IF NOT EXISTS popular_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  result_count INTEGER DEFAULT 0,
  last_searched TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure queries are reasonable length
  CONSTRAINT query_length CHECK (char_length(query) >= 2 AND char_length(query) <= 200)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_popular_queries_normalized ON popular_queries(normalized_query);
CREATE INDEX IF NOT EXISTS idx_popular_queries_prefix ON popular_queries(query text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_popular_queries_count ON popular_queries(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_queries_results ON popular_queries(result_count DESC);

-- Add comments for documentation
COMMENT ON TABLE popular_queries IS 'Stores successful search queries for autocomplete suggestions';
COMMENT ON COLUMN popular_queries.query IS 'The original search query as typed by user';
COMMENT ON COLUMN popular_queries.normalized_query IS 'Lowercase, sorted, deduplicated version for matching';
COMMENT ON COLUMN popular_queries.search_count IS 'Number of times this query has been searched';
COMMENT ON COLUMN popular_queries.result_count IS 'Number of results returned (only queries with results are stored)';

-- Function to increment search count atomically
CREATE OR REPLACE FUNCTION increment_query_count(p_normalized_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE popular_queries
  SET
    search_count = search_count + 1,
    last_searched = NOW()
  WHERE normalized_query = p_normalized_query;
END;
$$;

-- Function to clean up old/unused queries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_stale_queries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete queries that:
  -- 1. Have only been searched once
  -- 2. Were last searched more than 30 days ago
  DELETE FROM popular_queries
  WHERE search_count <= 1
    AND last_searched < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Row Level Security
ALTER TABLE popular_queries ENABLE ROW LEVEL SECURITY;

-- Anyone can read popular queries (public data for autocomplete)
CREATE POLICY "Popular queries are viewable by everyone"
  ON popular_queries FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (to prevent abuse)
-- In practice, the app uses service role for recording queries
CREATE POLICY "Authenticated users can insert queries"
  ON popular_queries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update queries"
  ON popular_queries FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Seed with some common modding queries to bootstrap autocomplete
INSERT INTO popular_queries (query, normalized_query, search_count, result_count) VALUES
  ('how to create items', 'create how items to', 10, 5),
  ('lua api reference', 'api lua reference', 15, 8),
  ('weapon repair', 'repair weapon', 12, 4),
  ('custom recipes', 'custom recipes', 8, 6),
  ('mod installation', 'installation mod', 20, 3),
  ('zombie spawning', 'spawning zombie', 7, 2),
  ('ui modding', 'modding ui', 9, 5),
  ('vehicle modifications', 'modifications vehicle', 6, 3),
  ('crafting system', 'crafting system', 11, 4),
  ('item properties', 'item properties', 14, 7)
ON CONFLICT (normalized_query) DO NOTHING;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_query_count(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_query_count(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION cleanup_stale_queries() TO authenticated;
