-- Migration 026: Discord and Google sign-ups can create an account
-- Created: 2026-10-01
-- Description: Every new account fires public.handle_new_user() (trigger
--              on_auth_user_created, migration 001), which copies
--              raw_user_meta_data->>'username' into public.user_profiles.username.
--              Migration 006 made that column NOT NULL and 3-20 characters, but a
--              Discord or Google sign-up carries no `username`, so the insert fails
--              and Supabase refuses the whole account with "Database error saving
--              new user". Nobody could register with Discord or Google (nor with the
--              site's email sign-up, which sends no username either); it went
--              unnoticed because the login UI was switched off until the member
--              accounts work (docs/planning/MascotVote/PLAN.md, Task 4).
--
-- After this migration:
--   - username is optional. NULL means "not chosen yet". The two CHECK constraints
--     from 006 still hold for every username that is set (a CHECK passes on NULL),
--     and the unique index on username_lower allows any number of NULLs.
--   - handle_new_user() stores a username only when one was supplied, is valid and
--     is not taken; otherwise the profile gets NULL. A profile problem never blocks
--     the account itself.
--   - display_name keeps its 006 meaning: the supplied display_name, else the
--     stored username. Nothing new is copied from the provider.
--
-- Safe to run twice. Tests: supabase/tests/new_user_profile.sql

ALTER TABLE public.user_profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN username DROP DEFAULT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text := nullif(btrim(NEW.raw_user_meta_data ->> 'username'), '');
  v_display  text := nullif(btrim(NEW.raw_user_meta_data ->> 'display_name'), '');
BEGIN
  IF v_username IS NOT NULL
     AND (char_length(v_username) NOT BETWEEN 3 AND 20
          OR v_username !~ '^[a-zA-Z][a-zA-Z0-9_]*$') THEN
    v_username := NULL;
  END IF;

  BEGIN
    INSERT INTO public.user_profiles (id, username, display_name)
    VALUES (NEW.id, v_username, coalesce(v_display, v_username))
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN unique_violation THEN
    -- The username is taken (case-insensitively). Keep the account; leave it unset.
    INSERT INTO public.user_profiles (id, username, display_name)
    VALUES (NEW.id, NULL, v_display)
    ON CONFLICT (id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Trigger on auth.users (migrations 001, 006, 026): creates the account''s user_profiles row. Stores a username only when one was supplied, is valid and is free; Discord and Google sign-ups get NULL. Never blocks the account.';
COMMENT ON COLUMN public.user_profiles.username IS
  'Optional since migration 026 (NULL = not chosen). When set: 3-20 characters, starts with a letter, letters, digits and underscores, unique ignoring case.';
