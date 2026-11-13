-- Admin tools bucket tests (migration 047)
-- Created: 2026-11-13
--
-- Run the whole file as `postgres` (after 024 and 047 are applied), NOT inside a
-- single transaction wrapper of your own (no psql -1): it manages its own.
--   psql "<connection string>" -X -v ON_ERROR_STOP=1 -f supabase/tests/admin_tools_bucket.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind. Every
-- assertion RAISEs on failure, so the script either prints a run of "PASS ..."
-- notices and then "ALL ADMIN TOOLS BUCKET TESTS PASSED", or stops at the first failure.
--
-- Fixture accounts:
--   member  ...01  no flags
--   admin   ...02  aurora_admin
--   super   ...03  superadmin only (site_is_admin() counts it as an admin)

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a7000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'admin-tools-member@example.invalid', '', NOW(), NOW() - INTERVAL '3 minutes', NOW(), '{}'::jsonb,
   '{"username":"admin_tools_member"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a7000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'admin-tools-admin@example.invalid', '', NOW(), NOW() - INTERVAL '2 minutes', NOW(), '{"aurora_admin": true}'::jsonb,
   '{"username":"admin_tools_admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a7000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'admin-tools-super@example.invalid', '', NOW(), NOW() - INTERVAL '1 minute', NOW(), '{"superadmin": true}'::jsonb,
   '{"username":"admin_tools_super"}'::jsonb);

INSERT INTO storage.objects (bucket_id, name, metadata)
VALUES ('admin-tools', 'serverbuddy/ServerBuddy-test.exe', '{"size": 3, "mimetype": "application/octet-stream"}'::jsonb);

-- ============================================================================
-- 1. THE BUCKET
-- ============================================================================

DO $$
DECLARE
  v_public boolean;
  v_limit  bigint;
  v_n      int;
BEGIN
  SELECT public, file_size_limit INTO v_public, v_limit FROM storage.buckets WHERE id = 'admin-tools';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: bucket admin-tools does not exist'; END IF;
  IF v_public IS DISTINCT FROM false THEN RAISE EXCEPTION 'FAIL: bucket admin-tools is public'; END IF;
  IF v_limit IS DISTINCT FROM 104857600 THEN RAISE EXCEPTION 'FAIL: file size limit is %, expected 104857600', v_limit; END IF;
  RAISE NOTICE 'PASS admin-tools exists, is private, and takes files up to 100 MB';

  -- Our policy is SELECT only. No policy of ours writes to the bucket.
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins read admin tools'
     AND cmd = 'SELECT' AND roles = '{authenticated}';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL: the read policy is missing or not SELECT-to-authenticated only'; END IF;
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd <> 'SELECT'
     AND (coalesce(qual, '') LIKE '%admin-tools%' OR coalesce(with_check, '') LIKE '%admin-tools%');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL: % write policy(s) name the admin-tools bucket', v_n; END IF;
  RAISE NOTICE 'PASS one read policy, no write policy names the bucket';
END;
$$;

-- ============================================================================
-- 2. ANON sees nothing
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'admin-tools';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees % admin-tools object(s)', v_n; END IF;
  RAISE NOTICE 'PASS anon sees no admin-tools object';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 3. A MEMBER sees nothing
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"a7000000-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'admin-tools';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL: a member sees % admin-tools object(s)', v_n; END IF;
  RAISE NOTICE 'PASS a member sees no admin-tools object';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 4. AN ADMIN reads it and cannot write
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"a7000000-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM storage.objects
   WHERE bucket_id = 'admin-tools' AND name = 'serverbuddy/ServerBuddy-test.exe';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL: an admin sees % copies of the fixture, expected 1', v_n; END IF;
  RAISE NOTICE 'PASS an admin reads the admin-tools object';

  BEGIN
    INSERT INTO storage.objects (bucket_id, name) VALUES ('admin-tools', 'serverbuddy/planted.exe');
    RAISE EXCEPTION 'FAIL: an admin uploaded into admin-tools';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS an admin cannot add a file';

  -- No UPDATE policy: the row is invisible to UPDATE, so nothing changes.
  UPDATE storage.objects SET name = 'serverbuddy/renamed.exe'
   WHERE bucket_id = 'admin-tools' AND name = 'serverbuddy/ServerBuddy-test.exe';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL: an admin renamed % admin-tools object(s)', v_n; END IF;
  RAISE NOTICE 'PASS an admin cannot replace or rename a file';

  -- No DELETE policy. Newer Storage versions also refuse any direct DELETE with an
  -- error; either way, nothing may be removed.
  BEGIN
    DELETE FROM storage.objects WHERE bucket_id = 'admin-tools';
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL: an admin deleted % admin-tools object(s)', v_n; END IF;
  EXCEPTION WHEN raise_exception OR insufficient_privilege THEN
    IF SQLERRM LIKE 'FAIL:%' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'PASS an admin cannot delete a file';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 5. A SUPERADMIN (no aurora_admin flag) reads it too
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"a7000000-0000-4000-8000-000000000003","role":"authenticated"}', TRUE);

DO $$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'admin-tools';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL: the superadmin sees % admin-tools object(s), expected 1', v_n; END IF;
  RAISE NOTICE 'PASS the superadmin reads the admin-tools object';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 6. A DEMOTED admin loses access on the next request
-- ============================================================================

UPDATE auth.users SET raw_app_meta_data = '{}'::jsonb WHERE id = 'a7000000-0000-4000-8000-000000000002';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"a7000000-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'admin-tools';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL: a demoted admin still sees % admin-tools object(s)', v_n; END IF;
  RAISE NOTICE 'PASS a demoted admin sees nothing on the next request';
END;
$$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL ADMIN TOOLS BUCKET TESTS PASSED'; END; $$;

ROLLBACK;
