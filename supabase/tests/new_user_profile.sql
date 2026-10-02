-- New-account profile tests (migration 026)
-- Created: 2026-10-01
--
-- Needs 026 applied. Run the whole file as `postgres`: the SQL editor, or
--   psql "<connection string>" -v ON_ERROR_STOP=1 -f supabase/tests/new_user_profile.sql
--
-- It creates accounts the way Supabase Auth does (an INSERT into auth.users, which
-- fires on_auth_user_created), asserts, and ROLLS BACK. Nothing is left behind. Every
-- assertion RAISEs on failure: the script either ends with "ALL NEW USER PROFILE
-- TESTS PASSED" or stops at the first failure.
--
-- Accounts (raw_user_meta_data as each provider sends it):
--   discord  ...21  Discord: full_name, name, custom_claims - no username
--   google   ...22  Google: full_name, name, picture - no username
--   chosen   ...23  email sign-up with a valid username "Chosen_Name"
--   bad      ...24  email sign-up with an invalid username "1bad name"
--   clash    ...25  email sign-up with "chosen_name", taken ignoring case
--   blank    ...26  empty metadata
--   long     ...27  email sign-up with a 21-character username (one over the limit)

BEGIN;

SET LOCAL client_min_messages = NOTICE;

DO $$
DECLARE
  v_nullable text;
BEGIN
  SELECT is_nullable INTO v_nullable
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'username';
  IF v_nullable IS DISTINCT FROM 'YES' THEN
    RAISE EXCEPTION 'FAIL: user_profiles.username must be optional; is_nullable = %', v_nullable;
  END IF;
  RAISE NOTICE 'PASS username is optional';
END;
$$;

DO $$
DECLARE
  v_definer boolean;
  v_config  text[];
BEGIN
  SELECT p.prosecdef, p.proconfig INTO v_definer, v_config
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';
  IF v_definer IS DISTINCT FROM true OR NOT (coalesce(v_config, '{}') @> ARRAY['search_path=""']) THEN
    RAISE EXCEPTION 'FAIL: handle_new_user must be SECURITY DEFINER with search_path ''''; got definer %, config %', v_definer, v_config;
  END IF;
  RAISE NOTICE 'PASS handle_new_user is SECURITY DEFINER with an empty search_path';
END;
$$;

-- Each insert is its own statement: before 026, the first one fails with the error
-- Supabase reports as "Database error saving new user".
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000021', 'authenticated', 'authenticated',
        'new-profile-discord@example.invalid', '', NOW(), NOW(), NOW(),
        '{"provider":"discord","providers":["discord"]}'::jsonb,
        '{"iss":"https://discord.com/api","sub":"700000000000000021","name":"disc_user#0","full_name":"disc_user","email":"new-profile-discord@example.invalid","avatar_url":"https://cdn.discordapp.com/avatars/x.png","custom_claims":{"global_name":"Disc User"},"email_verified":true,"provider_id":"700000000000000021"}'::jsonb);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000022', 'authenticated', 'authenticated',
        'new-profile-google@example.invalid', '', NOW(), NOW(), NOW(),
        '{"provider":"google","providers":["google"]}'::jsonb,
        '{"iss":"https://accounts.google.com","sub":"g-new-profile","name":"Real Person","full_name":"Real Person","email":"new-profile-google@example.invalid","picture":"https://lh3.googleusercontent.com/x","email_verified":true}'::jsonb);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000023', 'authenticated', 'authenticated',
        'new-profile-chosen@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb,
        '{"username":"Chosen_Name"}'::jsonb);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000024', 'authenticated', 'authenticated',
        'new-profile-bad@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb,
        '{"username":"1bad name","display_name":"Bad Name"}'::jsonb);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000025', 'authenticated', 'authenticated',
        'new-profile-clash@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb,
        '{"username":"chosen_name"}'::jsonb);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000026', 'authenticated', 'authenticated',
        'new-profile-blank@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{}'::jsonb);

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000027', 'authenticated', 'authenticated',
        'new-profile-long@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb,
        '{"username":"abcdefghijklmnopqrstu"}'::jsonb);

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('e0000000-0000-4000-8000-000000000021'::uuid, NULL::text, NULL::text, 'Discord sign-up'),
      ('e0000000-0000-4000-8000-000000000022', NULL, NULL, 'Google sign-up (its real name is not copied)'),
      ('e0000000-0000-4000-8000-000000000023', 'Chosen_Name', 'Chosen_Name', 'a valid username'),
      ('e0000000-0000-4000-8000-000000000024', NULL, 'Bad Name', 'an invalid username'),
      ('e0000000-0000-4000-8000-000000000025', NULL, NULL, 'a username taken ignoring case'),
      ('e0000000-0000-4000-8000-000000000026', NULL, NULL, 'empty metadata'),
      ('e0000000-0000-4000-8000-000000000027', NULL, NULL, 'a username one character too long')
    ) AS t(id, want_username, want_display, label)
  LOOP
    PERFORM 1 FROM public.user_profiles p
     WHERE p.id = r.id
       AND p.username IS NOT DISTINCT FROM r.want_username
       AND p.display_name IS NOT DISTINCT FROM r.want_display;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FAIL: % - want profile (username %, display_name %), got %', r.label,
        coalesce(r.want_username, 'NULL'), coalesce(r.want_display, 'NULL'),
        coalesce((SELECT format('(username %s, display_name %s)', coalesce(p.username, 'NULL'), coalesce(p.display_name, 'NULL'))
                    FROM public.user_profiles p WHERE p.id = r.id), 'no profile row');
    END IF;
    RAISE NOTICE 'PASS % creates the account and its profile', r.label;
  END LOOP;
END;
$$;

DO $$ BEGIN RAISE NOTICE 'ALL NEW USER PROFILE TESTS PASSED'; END; $$;

ROLLBACK;
