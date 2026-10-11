-- Site executive and EYES ONLY tests (migration 041)
-- Created: 2026-10-11
--
-- Run the whole file as `postgres` (after 024 and 041 are applied), NOT inside a
-- single transaction wrapper of your own (no psql -1): it manages its own.
--   psql "<connection string>" -X -v ON_ERROR_STOP=1 -f supabase/tests/site_executive.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind. Every
-- assertion RAISEs on failure, so the script either prints a run of "PASS ..."
-- notices and then "ALL SITE EXECUTIVE TESTS PASSED", or stops at the first failure.
--
-- Fixture accounts:
--   member  ...01  no flags
--   exec    ...02  executive
--   admin   ...03  aurora_admin
--   super   ...04  superadmin + aurora_admin
--   member2 ...05  no flags (the account that gets promoted and demoted)
--   admin2  ...06  aurora_admin (a second admin, to prove admins cannot be targeted)

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'site-exec-member@example.invalid', '', NOW(), NOW() - INTERVAL '6 minutes', NOW(), '{}'::jsonb,
   '{"username":"site_exec_member"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'site-exec-exec@example.invalid', '', NOW(), NOW() - INTERVAL '5 minutes', NOW(), '{"executive": true}'::jsonb,
   '{"username":"site_exec_exec"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'site-exec-admin@example.invalid', '', NOW(), NOW() - INTERVAL '4 minutes', NOW(), '{"aurora_admin": true}'::jsonb,
   '{"username":"site_exec_admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'site-exec-super@example.invalid', '', NOW(), NOW() - INTERVAL '3 minutes', NOW(), '{"superadmin": true, "aurora_admin": true}'::jsonb,
   '{"username":"site_exec_super"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated',
   'site-exec-member2@example.invalid', '', NOW(), NOW() - INTERVAL '2 minutes', NOW(), '{}'::jsonb,
   '{"username":"site_exec_member2"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'e0000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated',
   'site-exec-admin2@example.invalid', '', NOW(), NOW() - INTERVAL '1 minute', NOW(), '{"aurora_admin": true}'::jsonb,
   '{"username":"site_exec_admin2"}'::jsonb);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
  ('910000000000000003', 'e0000000-0000-4000-8000-000000000003',
   '{"sub":"910000000000000003","email":"site-exec-admin@example.invalid","full_name":"exec_admin_user"}'::jsonb,
   'discord', NOW(), NOW());

-- ============================================================================
-- 1. GRANTS
-- ============================================================================

DO $$
DECLARE
  f text;
  t text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.site_is_executive()', 'public.site_admin_members()',
    'public.site_admin_set_executive(uuid, boolean)',
    'public.eyes_only_list()', 'public.eyes_only_get(text)',
    'public.site_superadmin_put_eyes_only(text, text, text, text)',
    'public.site_superadmin_delete_eyes_only(text)'
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
  RAISE NOTICE 'PASS the seven client functions are executable by authenticated only';

  FOREACH t IN ARRAY ARRAY['public.site_role_events', 'public.eyes_only_documents'] LOOP
    IF has_table_privilege('anon', t, 'SELECT,INSERT,UPDATE,DELETE')
       OR has_table_privilege('authenticated', t, 'SELECT,INSERT,UPDATE,DELETE') THEN
      RAISE EXCEPTION 'FAIL: a client role has table privileges on %', t;
    END IF;
    IF NOT (SELECT c.relrowsecurity FROM pg_class c WHERE c.oid = t::regclass) THEN
      RAISE EXCEPTION 'FAIL: row level security is off on %', t;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = split_part(t, '.', 2)) THEN
      RAISE EXCEPTION 'FAIL: % has a policy; access must go through the functions only', t;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS both tables have RLS on, no policies and no client privileges';
END;
$$;

-- ============================================================================
-- 2. ANON
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  BEGIN
    PERFORM * FROM public.eyes_only_list();
    RAISE EXCEPTION 'FAIL: anon listed the documents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.eyes_only_get('anything');
    RAISE EXCEPTION 'FAIL: anon read a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_is_executive();
    RAISE EXCEPTION 'FAIL: anon called site_is_executive()';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon is refused by list, get and the role check';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 3. SUPERADMIN uploads the fixture documents (also: put/delete rules)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000004","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_hash   text;
  v_expect text;
  v_big    text;
  v_rows   bigint;
BEGIN
  v_hash := public.site_superadmin_put_eyes_only('alpha-brief', 'Alpha Brief', 'First document', '<html><body>alpha secret</body></html>');
  v_expect := encode(sha256(convert_to('<html><body>alpha secret</body></html>', 'UTF8')), 'hex');
  IF v_hash IS DISTINCT FROM v_expect THEN
    RAISE EXCEPTION 'FAIL: put returned % but the sha256 of the HTML is %', v_hash, v_expect;
  END IF;
  RAISE NOTICE 'PASS put stores a document and returns the sha256 of its HTML';

  -- Replace: same slug, new content, one row.
  v_hash := public.site_superadmin_put_eyes_only('alpha-brief', 'Alpha Brief v2', '', '<html><body>alpha v2</body></html>');
  SELECT count(*) INTO v_rows FROM public.eyes_only_list() WHERE slug = 'alpha-brief';
  IF v_rows <> 1 THEN RAISE EXCEPTION 'FAIL: replacing a slug left % rows', v_rows; END IF;
  IF (SELECT g.title FROM public.eyes_only_get('alpha-brief') g) IS DISTINCT FROM 'Alpha Brief v2' THEN
    RAISE EXCEPTION 'FAIL: put did not replace the title';
  END IF;
  IF (SELECT g.sha256 FROM public.eyes_only_get('alpha-brief') g) IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'FAIL: the stored sha256 does not match the one put returned';
  END IF;
  RAISE NOTICE 'PASS put on an existing slug replaces it';

  PERFORM public.site_superadmin_put_eyes_only('beta-brief', 'Beta Brief', 'Second document', '<p>beta</p>');

  -- Slug rules.
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('Bad Slug', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: a slug with a capital and a space was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('trailing-', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: a slug ending in a hyphen was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('double--hyphen', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: a slug with a double hyphen was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: an empty slug was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only(repeat('a', 81), 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: an 81 character slug was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  PERFORM public.site_superadmin_put_eyes_only(repeat('a', 80), 't', '', '<p>x</p>');
  RAISE NOTICE 'PASS the slug rule: lowercase words joined by single hyphens, 80 characters at most';

  -- Title and summary limits.
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('no-title', '', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: an empty title was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('long-title', repeat('t', 201), '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: a 201 character title was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('long-summary', 't', repeat('s', 501), '<p>x</p>');
    RAISE EXCEPTION 'FAIL: a 501 character summary was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS title (1..200) and summary (0..500) limits';

  -- Size limit: exactly 8 MiB passes, one byte more is refused.
  v_big := repeat('a', 8388608);
  PERFORM public.site_superadmin_put_eyes_only('exactly-eight-mib', 'Big', '', v_big);
  IF (SELECT l.size_bytes FROM public.eyes_only_list() l WHERE l.slug = 'exactly-eight-mib') <> 8388608 THEN
    RAISE EXCEPTION 'FAIL: size_bytes is wrong for an 8 MiB document';
  END IF;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('too-big', 'Big', '', v_big || 'a');
    RAISE EXCEPTION 'FAIL: a document over 8 MiB was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  PERFORM public.site_superadmin_delete_eyes_only('exactly-eight-mib');
  RAISE NOTICE 'PASS the 8 MiB size limit (exact limit accepted, one byte over refused)';

  -- Nulls.
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only(NULL, 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: put accepted a null slug';
  EXCEPTION WHEN null_value_not_allowed THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('null-html', 't', '', NULL);
    RAISE EXCEPTION 'FAIL: put accepted a null document';
  EXCEPTION WHEN null_value_not_allowed THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_delete_eyes_only(NULL);
    RAISE EXCEPTION 'FAIL: delete accepted a null slug';
  EXCEPTION WHEN null_value_not_allowed THEN NULL;
  END;
  RAISE NOTICE 'PASS put and delete refuse nulls (22004)';

  -- Delete.
  PERFORM public.site_superadmin_put_eyes_only('to-delete', 'Temp', '', '<p>x</p>');
  PERFORM public.site_superadmin_delete_eyes_only('to-delete');
  BEGIN
    PERFORM public.site_superadmin_delete_eyes_only('to-delete');
    RAISE EXCEPTION 'FAIL: deleting a missing document did not raise';
  EXCEPTION WHEN no_data_found THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.eyes_only_get('to-delete');
    RAISE EXCEPTION 'FAIL: a deleted document can still be read';
  EXCEPTION WHEN no_data_found THEN NULL;
  END;
  RAISE NOTICE 'PASS delete removes the document and a second delete raises P0002';

  BEGIN
    PERFORM * FROM public.eyes_only_get('no-such-document');
    RAISE EXCEPTION 'FAIL: get on a missing slug did not raise';
  EXCEPTION WHEN no_data_found THEN NULL;
  END;
  RAISE NOTICE 'PASS get on a missing slug raises P0002';

  -- The superadmin is an executive by inheritance.
  IF NOT public.site_is_executive() THEN RAISE EXCEPTION 'FAIL: the superadmin is not reported as executive'; END IF;
  PERFORM * FROM public.eyes_only_list();
  PERFORM * FROM public.eyes_only_get('alpha-brief');
  RAISE NOTICE 'PASS the superadmin is executive by inheritance and can list and read';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 4. PLAIN MEMBER
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF public.site_is_executive() THEN RAISE EXCEPTION 'FAIL: a plain member is reported as executive'; END IF;

  BEGIN
    PERFORM * FROM public.eyes_only_list();
    RAISE EXCEPTION 'FAIL: a plain member listed the documents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.eyes_only_get('alpha-brief');
    RAISE EXCEPTION 'FAIL: a plain member read a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.site_admin_members();
    RAISE EXCEPTION 'FAIL: a plain member listed the members';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000005', true);
    RAISE EXCEPTION 'FAIL: a plain member granted executive';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('member-doc', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: a plain member uploaded a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_delete_eyes_only('alpha-brief');
    RAISE EXCEPTION 'FAIL: a plain member deleted a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM 1 FROM public.eyes_only_documents;
    RAISE EXCEPTION 'FAIL: a plain member selected from eyes_only_documents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM 1 FROM public.site_role_events;
    RAISE EXCEPTION 'FAIL: a plain member selected from site_role_events';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.eyes_only_documents (slug, title, html, sha256, updated_by)
    VALUES ('direct-insert', 't', '<p>x</p>', 'x', 'e0000000-0000-4000-8000-000000000001');
    RAISE EXCEPTION 'FAIL: a plain member inserted directly into eyes_only_documents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a plain member is refused everywhere, including direct table access';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 5. EXECUTIVE (flag only)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF NOT public.site_is_executive() THEN RAISE EXCEPTION 'FAIL: the executive is not reported as executive'; END IF;
  IF public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: an executive is reported as admin'; END IF;

  IF (SELECT count(*) FROM public.eyes_only_list()) < 2 THEN
    RAISE EXCEPTION 'FAIL: the executive does not see the uploaded documents';
  END IF;
  IF (SELECT g.html FROM public.eyes_only_get('alpha-brief') g) IS DISTINCT FROM '<html><body>alpha v2</body></html>' THEN
    RAISE EXCEPTION 'FAIL: the executive did not receive the stored HTML';
  END IF;
  RAISE NOTICE 'PASS an executive can list and read documents';

  -- The list never carries the body.
  IF EXISTS (SELECT 1
               FROM pg_proc p
               JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = 'public'
              WHERE p.proname = 'eyes_only_list'
                AND ('html' = ANY (p.proargnames) OR 'sha256' = ANY (p.proargnames))) THEN
    RAISE EXCEPTION 'FAIL: eyes_only_list returns the html or sha256 column';
  END IF;
  RAISE NOTICE 'PASS eyes_only_list has no html column';

  BEGIN
    PERFORM * FROM public.site_admin_members();
    RAISE EXCEPTION 'FAIL: an executive listed the members';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000005', true);
    RAISE EXCEPTION 'FAIL: an executive granted executive to someone else';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('exec-doc', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: an executive uploaded a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_delete_eyes_only('alpha-brief');
    RAISE EXCEPTION 'FAIL: an executive deleted a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM 1 FROM public.eyes_only_documents;
    RAISE EXCEPTION 'FAIL: an executive selected directly from eyes_only_documents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS an executive cannot list members, grant, upload, delete or read the table directly';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 6. ADMIN (inherits executive; grants and removes executives)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000003","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_row record;
BEGIN
  IF NOT public.site_is_executive() THEN RAISE EXCEPTION 'FAIL: an admin is not reported as executive'; END IF;
  PERFORM * FROM public.eyes_only_list();
  PERFORM * FROM public.eyes_only_get('alpha-brief');
  RAISE NOTICE 'PASS an admin inherits executive and can list and read documents';

  BEGIN
    PERFORM public.site_superadmin_put_eyes_only('admin-doc', 't', '', '<p>x</p>');
    RAISE EXCEPTION 'FAIL: an admin uploaded a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_superadmin_delete_eyes_only('alpha-brief');
    RAISE EXCEPTION 'FAIL: an admin deleted a document';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS an admin cannot upload or delete documents';

  -- Member list: emails visible, flags correct.
  IF (SELECT count(*) FROM public.site_admin_members() m WHERE m.user_id::text LIKE 'e0000000-%') <> 6 THEN
    RAISE EXCEPTION 'FAIL: expected 6 fixture members in the admin member list';
  END IF;
  SELECT m.email, m.discord_username, m.is_admin, m.is_executive INTO v_row
    FROM public.site_admin_members() m WHERE m.user_id = 'e0000000-0000-4000-8000-000000000003';
  IF v_row.email IS DISTINCT FROM 'site-exec-admin@example.invalid'
     OR v_row.discord_username IS DISTINCT FROM 'exec_admin_user'
     OR NOT v_row.is_admin OR v_row.is_executive THEN
    RAISE EXCEPTION 'FAIL: the admin row should show email, Discord name, is_admin and no executive flag, got %', v_row;
  END IF;
  IF NOT (SELECT m.is_executive FROM public.site_admin_members() m WHERE m.user_id = 'e0000000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'FAIL: the executive fixture is not marked is_executive';
  END IF;
  RAISE NOTICE 'PASS site_admin_members shows emails, Discord names and the executive flag to an admin';

  -- Refusals.
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000003', true);
    RAISE EXCEPTION 'FAIL: an admin changed their own account';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000006', true);
    RAISE EXCEPTION 'FAIL: an admin targeted another admin';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000004', false);
    RAISE EXCEPTION 'FAIL: an admin targeted the superadmin';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-0000000000ff', true);
    RAISE EXCEPTION 'FAIL: set_executive accepted an account that does not exist';
  EXCEPTION WHEN no_data_found THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive(NULL, true);
    RAISE EXCEPTION 'FAIL: set_executive accepted a null account';
  EXCEPTION WHEN null_value_not_allowed THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000005', NULL);
    RAISE EXCEPTION 'FAIL: set_executive accepted a null value';
  EXCEPTION WHEN null_value_not_allowed THEN NULL;
  END;
  RAISE NOTICE 'PASS set_executive refuses self, admin and superadmin targets, unknown accounts and nulls';

  -- Grant.
  PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000005', true);
END;
$$;

RESET ROLE;

-- The grant is visible on the target's very next call.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000005","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF NOT public.site_is_executive() THEN RAISE EXCEPTION 'FAIL: the granted member is not executive on the next call'; END IF;
  PERFORM * FROM public.eyes_only_list();
  IF public.site_is_admin() THEN RAISE EXCEPTION 'FAIL: granting executive made an admin'; END IF;
  RAISE NOTICE 'PASS a grant takes effect on the next call and does not make an admin';
END;
$$;
RESET ROLE;

-- Remove (this time as the superadmin, who may also do it).
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000004","role":"authenticated"}', TRUE);
DO $$
BEGIN
  PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000005', false);
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000004', true);
    RAISE EXCEPTION 'FAIL: the superadmin changed their own account';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.site_admin_set_executive('e0000000-0000-4000-8000-000000000003', true);
    RAISE EXCEPTION 'FAIL: the superadmin targeted an admin';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS the superadmin can remove an executive, and is refused on self and admin targets';
END;
$$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000005","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.site_is_executive() THEN RAISE EXCEPTION 'FAIL: the removed executive is still executive'; END IF;
  BEGIN
    PERFORM * FROM public.eyes_only_list();
    RAISE EXCEPTION 'FAIL: the removed executive can still list documents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a removal takes effect on the next call';
END;
$$;
RESET ROLE;

-- ============================================================================
-- 7. AS POSTGRES: flags untouched, audit rows, key deleted
-- ============================================================================

DO $$
DECLARE
  v_rows bigint;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'e0000000-0000-4000-8000-000000000005'
                  AND NOT (raw_app_meta_data ? 'executive')) THEN
    RAISE EXCEPTION 'FAIL: removing executive should delete the key rather than leave a stale value';
  END IF;

  -- aurora_admin and superadmin were never altered on any fixture.
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'e0000000-0000-4000-8000-000000000003'
                  AND raw_app_meta_data -> 'aurora_admin' = 'true'::jsonb
                  AND NOT (raw_app_meta_data ? 'superadmin') AND NOT (raw_app_meta_data ? 'executive')) THEN
    RAISE EXCEPTION 'FAIL: the admin fixture''s flags changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'e0000000-0000-4000-8000-000000000004'
                  AND raw_app_meta_data -> 'aurora_admin' = 'true'::jsonb
                  AND raw_app_meta_data -> 'superadmin' = 'true'::jsonb AND NOT (raw_app_meta_data ? 'executive')) THEN
    RAISE EXCEPTION 'FAIL: the superadmin fixture''s flags changed';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE id IN ('e0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000005')
                AND (raw_app_meta_data ? 'aurora_admin' OR raw_app_meta_data ? 'superadmin')) THEN
    RAISE EXCEPTION 'FAIL: set_executive wrote an admin or superadmin flag';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'e0000000-0000-4000-8000-000000000002'
                  AND raw_app_meta_data -> 'executive' = 'true'::jsonb) THEN
    RAISE EXCEPTION 'FAIL: the executive fixture''s flag changed';
  END IF;
  RAISE NOTICE 'PASS set_executive never alters aurora_admin or superadmin';

  -- One audit row per successful change (grant by admin, removal by superadmin); refusals write none.
  SELECT count(*) INTO v_rows FROM public.site_role_events WHERE target = 'e0000000-0000-4000-8000-000000000005';
  IF v_rows <> 2 THEN RAISE EXCEPTION 'FAIL: expected 2 audit rows for the target, got %', v_rows; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.site_role_events
                  WHERE actor = 'e0000000-0000-4000-8000-000000000003' AND target = 'e0000000-0000-4000-8000-000000000005'
                    AND role = 'executive' AND granted) THEN
    RAISE EXCEPTION 'FAIL: the admin''s grant has no audit row';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.site_role_events
                  WHERE actor = 'e0000000-0000-4000-8000-000000000004' AND target = 'e0000000-0000-4000-8000-000000000005'
                    AND role = 'executive' AND NOT granted) THEN
    RAISE EXCEPTION 'FAIL: the superadmin''s removal has no audit row';
  END IF;
  SELECT count(*) INTO v_rows FROM public.site_role_events
   WHERE actor::text LIKE 'e0000000-%' OR target::text LIKE 'e0000000-%';
  IF v_rows <> 2 THEN RAISE EXCEPTION 'FAIL: refused calls wrote audit rows (% in total)', v_rows; END IF;
  RAISE NOTICE 'PASS exactly one audit row per successful change, none for refusals';

  -- The audit table only accepts the executive role.
  BEGIN
    INSERT INTO public.site_role_events (actor, target, role, granted)
    VALUES ('e0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000005', 'superadmin', true);
    RAISE EXCEPTION 'FAIL: the audit table accepted a role other than executive';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS the audit table accepts only the executive role';
END;
$$;

DO $$ BEGIN RAISE NOTICE 'ALL SITE EXECUTIVE TESTS PASSED'; END; $$;

ROLLBACK;
