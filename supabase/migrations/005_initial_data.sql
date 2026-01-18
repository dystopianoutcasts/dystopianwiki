-- Migration 005: Initial Data / Seed Data
-- Created: 2026-01-18
-- Description: Initial categories and example data

-- ============================================================================
-- SEED CATEGORIES (Project Zomboid Build 41)
-- ============================================================================

INSERT INTO categories (id, game, section, name, description, icon, display_order) VALUES
  ('fundamentals', 'pz', 'modding', 'Fundamentals', 'Essential modding concepts and file types', '📚', 1),
  ('items', 'pz', 'modding', 'Items', 'Creating and modifying items', '🔧', 2),
  ('recipes', 'pz', 'modding', 'Recipes', 'Crafting recipes and evolved recipes', '📝', 3),
  ('lua-api', 'pz', 'modding', 'Lua API', 'Lua programming reference', '💻', 4),
  ('game-mechanics', 'pz', 'modding', 'Game Mechanics', 'Understanding game systems', '⚙️', 5),
  ('weapon-repair', 'pz', 'modding', 'Weapon Repair', 'Weapon repair system', '🔨', 6),
  ('foraging', 'pz', 'modding', 'Foraging', 'Foraging system', '🌿', 7),
  ('reference', 'pz', 'modding', 'Reference', 'Quick reference guides', '📖', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- EXAMPLE ARTICLE (You can delete this after importing real articles)
-- ============================================================================

INSERT INTO articles (
  id,
  slug,
  title,
  content,
  excerpt,
  game,
  version,
  section,
  category,
  difficulty,
  tags,
  last_updated
) VALUES (
  'welcome-to-wiki',
  'welcome',
  'Welcome to Dystopian Outcasts Wiki',
  E'# Welcome!\n\nThis is an example article. Real articles will be imported via the Python script.\n\n## Features\n\n- Full-text search\n- User authentication\n- Bookmarks\n- Reading progress tracking',
  'Welcome to the new wiki! This article demonstrates the database structure.',
  'pz',
  'build-41',
  'modding',
  'fundamentals',
  'beginner',
  ARRAY['welcome', 'introduction'],
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE categories IS 'Initial categories populated, article counts will auto-update';
