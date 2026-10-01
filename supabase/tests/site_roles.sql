-- Site role tests (migration 024, docs/planning/MascotVote/PLAN.md Task 3)
-- Created: 2026-10-01
--
-- Run the whole file as `postgres`: the SQL editor in the dashboard, or
--   psql "<connection string>" -v ON_ERROR_STOP=1 -f supabase/tests/site_roles.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind. Every
-- assertion RAISEs on failure, so the script either prints a run of "PASS ..."
-- notices and then "ALL SITE ROLE TESTS PASSED", or stops at the first failure.
--
-- Fixture accounts:
--   member  ...01  Google only, no flags
--   admin   ...02  Discord only, aurora_admin
--   owner   ...03  dystopianoutcasts@gmail.com; starts with Discord only, gains Google
--   decoy   ...04  Google identity claiming the owner's address, different account email
--   super2  ...05  a second superadmin (to prove one cannot be demoted from the dashboard)
--   legacy  ...06  Discord identity with only `name` ("user#0"), no full_name

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'site-role-member@example.invalid', '', NOW(), NOW() - INTERVAL '6 minutes', NOW(), '{}'::jsonb,
   '{"username":"site_role_member"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'site-role-admin@example.invalid', '', NOW(), NOW() - INTERVAL '5 minutes', NOW(), '{"aurora_admin": true}'::jsonb,
   '{"username":"site_role_admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'DystopianOutcasts@gmail.com', '', NOW(), NOW() - INTERVAL '4 minutes', NOW(), '{}'::jsonb,
   '{"username":"site_role_owner"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'site-role-decoy@example.invalid', '', NOW(), NOW() - INTERVAL '3 minutes', NOW(), '{}'::jsonb,
   '{"username":"site_role_decoy"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated',
   'site-role-super2@example.invalid', '', NOW(), NOW() - INTERVAL '2 minutes', NOW(), '{"superadmin": true, "aurora_admin": true}'::jsonb,
   '{"username":"site_role_super2"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated',
   'site-role-legacy@example.invalid', '', NOW(), NOW() - INTERVAL '1 minute', NOW(), '{}'::jsonb,
   '{"username":"site_role_legacy"}'::jsonb);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
  ('g-member', 'c0000000-0000-4000-8000-000000000001',
   '{"sub":"g-member","email":"site-role-member@example.invalid"}'::jsonb, 'google', NOW(), NOW()),
  ('900000000000000002', 'c0000000-0000-4000-8000-000000000002',
   '{"sub":"900000000000000002","email":"site-role-admin@example.invalid","full_name":"admin_user","name":"admin_user#0","custom_claims":{"global_name":"Admin Display Name"}}'::jsonb,
   'discord', NOW(), NOW()),
  ('900000000000000003', 'c0000000-0000-4000-8000-000000000003',
   '{"sub":"900000000000000003","email":"dystopianoutcasts@gmail.com","full_name":"owner_user","name":"owner_user#0"}'::jsonb,
   'discord', NOW(), NOW()),
  ('g-decoy', 'c0000000-0000-4000-8000-000000000004',
   '{"sub":"g-decoy","email":"dystopianoutcasts@gmail.com"}'::jsonb, 'google', NOW(), NOW()),
  ('900000000000000006', 'c0000000-0000-4000-8000-000000000006',
   '{"sub":"900000000000000006","name":"legacy_user#0","custom_claims":{"global_name":"Legacy Display"}}'::jsonb,
   'discord', NOW(), NOW());

-- ============================================================================
-- 1. GRANTS: Supabase's default privileges must not survive on these functions
-- ============================================================================

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.site_is_admin()', 'public.site_is_superadmin()',
    'public.site_superadmin_members()', 'public.site_superadmin_set_admin(uuid, boolean)'
  ] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon can execute %', f;
    END IF;
    IF has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: service_role can execute % (not needed, not granted)', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated cannot execute %', f;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS the four client functions are executable by authenticated only';

  FOREACH f IN ARRAY ARRAY['public.site_discord_identity(uuid)', 'public.site_grant_superadmin()'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE')
       OR has_function_privilege('authenticated', f, 'EXECUTE')
       OR has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: a client role can execute internal function %', f;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS site_discord_identity and site_grant_superadmin are callable by no client role';
END;
$$;

-- ============================================================================
-- 2. THE SUPERADMIN GRANT (as postgres)
-- ============================================================================

DO $$
DECLARE
  v_changed int;
BEGIN
  -- The owner's account exists but has no Google identity yet: a Discord identity
  -- carrying the same address does not qualify.
  v_changed := public.site_grant_superadmin();
  IF v_changed <> 0 THEN
    RAISE EXCEPTION 'FAIL: superadmin granted to % account(s) with no Google identity', v_changed;
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE raw_app_meta_data -> 'superadmin' = 'true'::jsonb
                                       AND id <> 'c0000000-0000-4000-8000-000000000005') THEN
    RAISE EXCEPTION 'FAIL: a superadmin flag appeared before the owner had a Google identity';
  END IF;
  RAISE NOTICE 'PASS no superadmin without a Google identity for the address (decoy and Discord-only refused)';

  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES ('g-owner', 'c0000000-0000-4000-8000-000000000003',
          '{"sub":"g-owner","email":"dystopianoutcasts@gmail.com"}'::jsonb, 'google', NOW(), NOW());

  -- A pre-registered email/password identity on the row disqualifies it.
  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES ('c0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003',
          '{"sub":"c0000000-0000-4000-8000-000000000003","email":"dystopianoutcasts@gmail.com"}'::jsonb, 'email', NOW(), NOW());
  IF public.site_grant_superadmin() <> 0 THEN
    RAISE EXCEPTION 'FAIL: superadmin granted to an account with an email/password identity';
  END IF;
  DELETE FROM auth.identities WHERE user_id = 'c0000000-0000-4000-8000-000000000003' AND provider = 'email';

  -- So does a password on the account.
  UPDATE auth.users SET encrypted_password = '$2a$10$pre.registered.hash' WHERE id = 'c0000000-0000-4000-8000-000000000003';
  IF public.site_grant_superadmin() <> 0 THEN
    RAISE EXCEPTION 'FAIL: superadmin granted to an account with a password set';
  END IF;
  UPDATE auth.users SET encrypted_password = '' WHERE id = 'c0000000-0000-4000-8000-000000000003';
  RAISE NOTICE 'PASS an account with an email/password identity or a password never gets superadmin';

  v_changed := public.site_grant_superadmin();
  IF v_changed <> 1 THEN
    RAISE EXCEPTION 'FAIL: expected the grant to change 1 account, it changed %', v_changed;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users
                  WHERE id = 'c0000000-0000-4000-8000-000000000003'
                    AND raw_app_meta_data -> 'superadmin' = 'true'::jsonb
                    AND raw_app_meta_data -> 'aurora_admin' = 'true'::jsonb) THEN
    RAISE EXCEPTION 'FAIL: the owner did not get both flags';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'c0000000-0000-4000-8000-000000000004'
                                       AND raw_app_meta_data ? 'superadmin') THEN
    RAISE EXCEPTION 'FAIL: the decoy got the superadmin flag';
  END IF;
  RAISE NOTICE 'PASS the owner''s Google-verified account gets superadmin and aurora_admin (case-insensitive email)';

  v_changed := public.site_grant_superadmin();
  IF v_changed <> 0 THEN
    RAISE EXCEPTION 'FAIL: running the grant again changed % account(s)', v_changed;
  END IF;
  RAISE NOTICE 'PASS running the grant again changes nothing';
END;
$$;

-- ============================================================================
-- 3. ANON
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  BEGIN
    PERFORM public.site_is_admin();
    RAISE EXCEPTION 'FAIL: anon called site_is_admin()';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_members();
    RAISE EXCEPTION 'FAIL: anon called site_superadmin_members()';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon is denied the role functions';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 4. STANDARD MEMBER
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: a standard member is reported as admin'; END IF;
  IF public.site_is_superadmin() THEN RAISE EXCEPTION 'FAIL: a standard member is reported as superadmin'; END IF;
  RAISE NOTICE 'PASS a standard member is neither admin nor superadmin';

  BEGIN
    PERFORM * FROM public.site_superadmin_members();
    RAISE EXCEPTION 'FAIL: a standard member listed the members';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-000000000001', true);
    RAISE EXCEPTION 'FAIL: a standard member made themselves admin';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a standard member is refused by both superadmin functions';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 5. ADMIN (not superadmin)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF NOT public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: an aurora_admin account is not reported as admin'; END IF;
  IF public.site_is_superadmin() THEN RAISE EXCEPTION 'FAIL: an admin is reported as superadmin'; END IF;
  RAISE NOTICE 'PASS an admin is admin and not superadmin';

  BEGIN
    PERFORM * FROM public.site_superadmin_members();
    RAISE EXCEPTION 'FAIL: an admin listed the members';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-000000000001', true);
    RAISE EXCEPTION 'FAIL: an admin made another account admin';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS an admin who is not superadmin is refused by both superadmin functions';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 6. SUPERADMIN (the owner)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000003","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_count    bigint;
  v_name     text;
  v_id       text;
  v_providers text[];
BEGIN
  IF NOT public.site_is_superadmin() THEN RAISE EXCEPTION 'FAIL: the owner is not superadmin'; END IF;
  IF NOT public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: the superadmin is not reported as admin'; END IF;
  RAISE NOTICE 'PASS the owner is superadmin and admin';

  SELECT count(*) INTO v_count FROM public.site_superadmin_members()
   WHERE user_id::text LIKE 'c0000000-%';
  IF v_count <> 6 THEN RAISE EXCEPTION 'FAIL: expected 6 fixture members, got %', v_count; END IF;

  SELECT discord_username, discord_id INTO v_name, v_id FROM public.site_superadmin_members()
   WHERE user_id = 'c0000000-0000-4000-8000-000000000002';
  IF v_name IS DISTINCT FROM 'admin_user' OR v_id IS DISTINCT FROM '900000000000000002' THEN
    RAISE EXCEPTION 'FAIL: Discord username/id should be admin_user / 900000000000000002 (the username, not the display name), got % / %', v_name, v_id;
  END IF;

  SELECT discord_username INTO v_name FROM public.site_superadmin_members()
   WHERE user_id = 'c0000000-0000-4000-8000-000000000006';
  IF v_name IS DISTINCT FROM 'legacy_user' THEN
    RAISE EXCEPTION 'FAIL: with no full_name the username comes from name minus "#0"; got %', v_name;
  END IF;

  SELECT discord_username, providers INTO v_name, v_providers FROM public.site_superadmin_members()
   WHERE user_id = 'c0000000-0000-4000-8000-000000000001';
  IF v_name IS NOT NULL OR v_providers IS DISTINCT FROM ARRAY['google'] THEN
    RAISE EXCEPTION 'FAIL: a Google-only member should list providers {google} and no Discord name, got % / %', v_providers, v_name;
  END IF;

  SELECT providers INTO v_providers FROM public.site_superadmin_members()
   WHERE user_id = 'c0000000-0000-4000-8000-000000000003';
  IF v_providers IS DISTINCT FROM ARRAY['discord', 'google'] THEN
    RAISE EXCEPTION 'FAIL: the owner should list providers {discord,google}, got %', v_providers;
  END IF;
  RAISE NOTICE 'PASS the member list carries the Discord username (not display name), id and sign-in methods';

  BEGIN
    PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-000000000003', false);
    RAISE EXCEPTION 'FAIL: the superadmin changed their own account';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS the superadmin cannot demote their own account';

  BEGIN
    PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-000000000005', false);
    RAISE EXCEPTION 'FAIL: the superadmin changed another superadmin account';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a superadmin account cannot be changed from the dashboard';

  BEGIN
    PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-0000000000ff', true);
    RAISE EXCEPTION 'FAIL: set_admin accepted an account that does not exist';
  EXCEPTION WHEN no_data_found THEN NULL;
  END;
  RAISE NOTICE 'PASS set_admin refuses an unknown account';

  PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-000000000001', true);
  PERFORM public.site_superadmin_set_admin('c0000000-0000-4000-8000-000000000002', false);
END;
$$;

RESET ROLE;

-- Promotion and demotion take effect for the accounts themselves, on the site and the map.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF NOT public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: the promoted member is not admin'; END IF;
  IF NOT aurora.is_aurora_admin() THEN RAISE EXCEPTION 'FAIL: the promoted member is not a map admin'; END IF;
  IF public.site_is_superadmin() THEN RAISE EXCEPTION 'FAIL: promotion made a superadmin'; END IF;
  RAISE NOTICE 'PASS make admin: the member is admin on the site and the map, not superadmin';
END;
$$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: the demoted admin is still admin'; END IF;
  IF aurora.is_aurora_admin() THEN RAISE EXCEPTION 'FAIL: the demoted admin is still a map admin'; END IF;
  RAISE NOTICE 'PASS remove admin: takes effect at once on the site and the map';
END;
$$;
RESET ROLE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'c0000000-0000-4000-8000-000000000002'
                  AND NOT (raw_app_meta_data ? 'aurora_admin')) THEN
    RAISE EXCEPTION 'FAIL: remove admin should delete the aurora_admin key';
  END IF;
  RAISE NOTICE 'PASS remove admin deletes the key rather than leaving a stale value';
END;
$$;

DO $$ BEGIN RAISE NOTICE 'ALL SITE ROLE TESTS PASSED'; END; $$;

ROLLBACK;
