-- Migration 006: Add Username Support
-- Created: 2026-01-19
-- Description: Add username field with case-insensitive uniqueness

-- ============================================================================
-- ADD USERNAME COLUMNS
-- ============================================================================

-- Add username column (required, 3-20 chars, alphanumeric + underscore)
ALTER TABLE user_profiles
  ADD COLUMN username TEXT NOT NULL DEFAULT '',
  ADD COLUMN username_lower TEXT GENERATED ALWAYS AS (LOWER(username)) STORED;

-- Add constraints for username validation
ALTER TABLE user_profiles
  ADD CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z][a-zA-Z0-9_]*$');

-- Create unique index on lowercase username for case-insensitive uniqueness
-- This ensures "CoolGamer" and "coolgamer" cannot both exist
CREATE UNIQUE INDEX idx_user_profiles_username_lower ON user_profiles(username_lower);

-- Create regular index on username for display queries
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- Add helpful comment
COMMENT ON COLUMN user_profiles.username_lower IS 'Lowercase version for case-insensitive uniqueness checks. Auto-generated.';

-- ============================================================================
-- UPDATE TRIGGER FOR AUTO-PROFILE CREATION
-- ============================================================================

-- Update the handle_new_user() function to extract username from metadata
-- and auto-fill display_name from username if not provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username'  -- Auto-fill from username
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Trigger on_auth_user_created already exists from migration 001
-- It will automatically use the updated function

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
--
-- Username Requirements (enforced by constraints):
-- - Must be 3-20 characters long
-- - Must start with a letter (a-z, A-Z)
-- - Can contain letters, numbers, and underscores
-- - Case-insensitive uniqueness (via username_lower generated column)
--
-- Examples:
-- - Valid: "CoolGamer", "user_123", "Alice"
-- - Invalid: "ab" (too short), "1user" (starts with number), "user-name" (hyphen)
--
-- Display Behavior:
-- - username stores user's original capitalization: "CoolGamer"
-- - username_lower auto-generates lowercase version: "coolgamer"
-- - Uniqueness checks use username_lower
-- - Display uses username (preserves capitalization)
--
-- OAuth Users:
-- - OAuth users (Discord, Google) will NOT have a username by default
-- - They can set a username later via settings page
-- - For now, username is required only for email/password signups
--
