-- Article report tests (migration 048, docs/planning/REPORT-FORM-SPEC.md)
-- Created: 2026-11-15
--
-- Needs 024 and 048 applied. Run the whole file as `postgres`: the SQL editor, or
--   psql "<connection string>" -v ON_ERROR_STOP=1 -f supabase/tests/article_reports.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind. Every assertion RAISEs on
-- failure: the script either ends with "ALL ARTICLE REPORT TESTS PASSED" or stops at the first
-- failure. (Not run by the session that wrote it: no database was available. Run it once
-- after applying 048.)
--
-- Fixture accounts:
--   reader  ...21  an ordinary member (username rp_reader)
--   other   ...22  a second member (rate limit is per account)
--   admin   ...23  aurora_admin (username rp_admin)

BEGIN;

SET LOCAL client_min_messages = NOTICE;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000021', 'authenticated', 'authenticated',
   'rp-reader@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"rp_reader"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000022', 'authenticated', 'authenticated',
   'rp-other@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"rp_other"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000023', 'authenticated', 'authenticated',
   'rp-admin@example.invalid', '', NOW(), NOW(), NOW(), '{"aurora_admin": true}'::jsonb, '{"username":"rp_admin"}'::jsonb);

-- Live reports may exist; these tests count rows, so start from an empty table (this transaction only).
DELETE FROM public.article_reports;

-- ============================================================================
-- 1. GRANTS
-- ============================================================================

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['public.article_reports_admin(text, integer)', 'public.article_report_update(uuid, text, text)',
                           'public.article_report_delete(uuid)', 'public.article_reports_new_count()'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon or service_role can execute %', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated cannot execute %', f;
    END IF;
  END LOOP;
  f := 'public.submit_article_report(text, text, text, text, text, text, text, text, text)';
  IF NOT has_function_privilege('anon', f, 'EXECUTE') OR NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon and authenticated must be able to send a report';
  END IF;
  IF has_function_privilege('service_role', f, 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: service_role can execute the submit function';
  END IF;
  IF has_table_privilege('anon', 'public.article_reports', 'SELECT')
     OR has_table_privilege('anon', 'public.article_reports', 'INSERT')
     OR has_table_privilege('authenticated', 'public.article_reports', 'SELECT')
     OR has_table_privilege('authenticated', 'public.article_reports', 'INSERT')
     OR has_table_privilege('authenticated', 'public.article_reports', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.article_reports', 'DELETE')
     OR has_table_privilege('anon', 'public.article_report_config', 'SELECT')
     OR has_table_privilege('authenticated', 'public.article_report_config', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: a client role holds a table grant';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.article_reports'::regclass) THEN
    RAISE EXCEPTION 'FAIL: RLS is off on article_reports';
  END IF;
  RAISE NOTICE 'PASS grants: submit to anon and authenticated; admin functions to authenticated only; no table grants; RLS on';
END;
$$;

-- ============================================================================
-- 2. ANON: send, validate, rate limit
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
SELECT set_config('request.headers', '{"x-forwarded-for":"203.0.113.7, 10.0.0.1"}', TRUE);

DO $$
DECLARE
  r text;
  i integer;
BEGIN
  r := public.submit_article_report('a1', 'sample-article', '2026-11-15T10:00:00Z', 'A sample article', '/pz/build-42/modding/lua/sample-article',
                                    'Setup', 'wrong_fact', 'The page says 5 but the game uses 7.', 'Build 42.13, file X line 9');
  IF r <> 'ok' THEN RAISE EXCEPTION 'FAIL: a good report from a signed-out reader got %', r; END IF;
  RAISE NOTICE 'PASS a signed-out reader can send a report';

  -- Every invalid field is refused without raising.
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'wrong_fact', 'short', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a 5-character message was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'wrong_fact', repeat('x', 2001), '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a 2001-character message was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'wrong_fact', 'a long enough message', repeat('x', 1001)) <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a 1001-character evidence was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'bogus', 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: an unknown kind was accepted'; END IF;
  IF public.submit_article_report('a1', 'Bad Slug!', NULL, 'T', '/p/a', NULL, 'other', 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a bad slug was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', 'https://evil.example/x', NULL, 'other', 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: an absolute URL was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '//evil.example/x', NULL, 'other', 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a protocol-relative URL was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'other', 'a long enough' || chr(7) || ' message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a control character was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, '  ', '/p/a', NULL, 'other', 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a blank title was accepted'; END IF;
  IF public.submit_article_report(NULL, 'sample-article', NULL, 'T', '/p/a', NULL, 'other', 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a NULL article id was accepted'; END IF;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, NULL, 'a long enough message', '') <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a NULL kind was accepted'; END IF;
  -- A line break and a tab are fine.
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'other', E'line one\n\tline two here', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a message with a line break and a tab was refused'; END IF;
  RAISE NOTICE 'PASS invalid fields are refused as invalid, never raised; line breaks are allowed';

  -- Two reports are stored so far from this address. Three more reach the limit of 5; the sixth is refused.
  FOR i IN 1..3 LOOP
    IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'other', 'rate limit report number ' || i, '') <> 'ok' THEN
      RAISE EXCEPTION 'FAIL: report % of 5 from one address was refused', i + 2;
    END IF;
  END LOOP;
  IF public.submit_article_report('a1', 'sample-article', NULL, 'T', '/p/a', NULL, 'other', 'the sixth report in an hour', '') <> 'rate_limited' THEN
    RAISE EXCEPTION 'FAIL: the sixth signed-out report in an hour was not rate limited';
  END IF;
  RAISE NOTICE 'PASS signed out: 5 an hour per address, the sixth is rate_limited';
END;
$$;

-- A different address is not limited by the first.
SELECT set_config('request.headers', '{"x-forwarded-for":"198.51.100.9"}', TRUE);
DO $$
BEGIN
  IF public.submit_article_report('a2', 'second-article', NULL, 'Second', '/pz/build-42/x/y/second-article', NULL, 'unclear', 'This part is hard to follow.', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a different address was rate limited by the first';
  END IF;
  RAISE NOTICE 'PASS another address has its own limit';
END;
$$;

-- anon cannot read, update or delete.
DO $$
BEGIN
  BEGIN
    PERFORM * FROM public.article_reports;
    RAISE EXCEPTION 'FAIL: anon read the table';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.article_reports_admin('all', 10);
    RAISE EXCEPTION 'FAIL: anon called the admin list';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon cannot read the table or call the admin functions';
END;
$$;
RESET ROLE;

-- The stored hash is not the raw address and the reporter is empty for anon.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.article_reports WHERE reporter_hash LIKE '%203.0.113.7%' OR reporter_hash = '203.0.113.7') THEN
    RAISE EXCEPTION 'FAIL: the raw address is stored';
  END IF;
  IF EXISTS (SELECT 1 FROM public.article_reports WHERE reporter_hash !~ '^[0-9a-f]{64}$') THEN
    RAISE EXCEPTION 'FAIL: reporter_hash is not a SHA-256 hex digest';
  END IF;
  IF EXISTS (SELECT 1 FROM public.article_reports WHERE reporter_id IS NOT NULL) THEN
    RAISE EXCEPTION 'FAIL: a signed-out report carries a reporter';
  END IF;
  RAISE NOTICE 'PASS the address is stored only as a SHA-256 digest; signed-out reports have no reporter';
END;
$$;

-- ============================================================================
-- 3. SIGNED IN: the reporter comes from the session; the limit is per account
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000021","role":"authenticated"}', TRUE);
SELECT set_config('request.headers', '{"x-forwarded-for":"203.0.113.7"}', TRUE);

DO $$
DECLARE
  i integer;
BEGIN
  -- Same address as the exhausted anon one: the account has its own limit.
  FOR i IN 1..5 LOOP
    IF public.submit_article_report('a3', 'third-article', NULL, 'Third', '/pz/build-42/x/y/third-article', NULL, 'broken_link', 'Link number ' || i || ' is dead.', '') <> 'ok' THEN
      RAISE EXCEPTION 'FAIL: signed-in report % was refused', i;
    END IF;
  END LOOP;
  IF public.submit_article_report('a3', 'third-article', NULL, 'Third', '/pz/build-42/x/y/third-article', NULL, 'other', 'One more than the limit.', '') <> 'rate_limited' THEN
    RAISE EXCEPTION 'FAIL: the sixth signed-in report was not rate limited';
  END IF;
  RAISE NOTICE 'PASS signed in: 5 an hour per account, counted apart from the address';
END;
$$;

SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000022","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.submit_article_report('a3', 'third-article', NULL, 'Third', '/pz/build-42/x/y/third-article', NULL, 'other', 'A different account is not limited.', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a second account was limited by the first';
  END IF;
  -- A non-admin gets nothing from the admin functions.
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100)) <> 0 THEN RAISE EXCEPTION 'FAIL: a member read the reports'; END IF;
  IF public.article_reports_new_count() <> 0 THEN RAISE EXCEPTION 'FAIL: a member got a count'; END IF;
  IF public.article_report_update((SELECT 'd0000000-0000-4000-8000-0000000000ff'::uuid), 'fixed', 'x') <> 'denied' THEN
    RAISE EXCEPTION 'FAIL: a member could update a report';
  END IF;
  IF public.article_report_delete('d0000000-0000-4000-8000-0000000000ff') <> 'denied' THEN
    RAISE EXCEPTION 'FAIL: a member could delete a report';
  END IF;
  RAISE NOTICE 'PASS a member gets no rows, a zero count, and denied on update and delete';
END;
$$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.article_reports WHERE reporter_id = 'd0000000-0000-4000-8000-000000000021') <> 5 THEN
    RAISE EXCEPTION 'FAIL: the reporter id was not taken from the session';
  END IF;
  RAISE NOTICE 'PASS the reporter id is the session account';
END;
$$;

-- ============================================================================
-- 4. ADMIN: list, filter, update, delete, count
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000023","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_total integer;
  v_id uuid;
  v_row record;
BEGIN
  SELECT count(*) INTO v_total FROM public.article_reports_admin('all', 500);
  -- 5 from the first address, 1 from the second, 5 from the reader, 1 from the other member.
  IF v_total <> 12 THEN
    RAISE EXCEPTION 'FAIL: expected 12 reports, the admin list has %', v_total;
  END IF;
  IF public.article_reports_new_count() <> v_total THEN RAISE EXCEPTION 'FAIL: new count % differs from all % while all are new', public.article_reports_new_count(), v_total; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('fixed', 10)) <> 0 THEN RAISE EXCEPTION 'FAIL: nothing is fixed yet'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('bogus', 10)) <> 0 THEN RAISE EXCEPTION 'FAIL: an unknown status returned rows'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 2)) <> 2 THEN RAISE EXCEPTION 'FAIL: the limit was ignored'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 0)) <> 1 THEN RAISE EXCEPTION 'FAIL: a limit of 0 must clamp to 1'; END IF;
  RAISE NOTICE 'PASS admin: list, status filter, unknown status, limit clamp, new count';

  SELECT * INTO v_row FROM public.article_reports_admin('all', 500) WHERE reporter_name = 'rp_reader' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: the reporter username is not shown'; END IF;
  IF EXISTS (SELECT 1 FROM public.article_reports_admin('all', 500) WHERE reporter_name IS NULL) IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: a signed-out report must show a NULL reporter';
  END IF;

  v_id := v_row.id;
  IF public.article_report_update(v_id, 'confirmed', '  Checked against the engine.  ') <> 'ok' THEN RAISE EXCEPTION 'FAIL: update refused'; END IF;
  SELECT * INTO v_row FROM public.article_reports_admin('confirmed', 10) WHERE id = v_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: the updated report is not under confirmed'; END IF;
  IF v_row.admin_note <> 'Checked against the engine.' THEN RAISE EXCEPTION 'FAIL: the note was not trimmed and saved: [%]', v_row.admin_note; END IF;
  IF v_row.reviewed_by_name <> 'rp_admin' OR v_row.reviewed_at IS NULL THEN RAISE EXCEPTION 'FAIL: who and when were not recorded'; END IF;
  IF public.article_reports_new_count() <> v_total - 1 THEN RAISE EXCEPTION 'FAIL: the new count did not drop'; END IF;

  -- Saving the same status with a new note keeps the first reviewer time.
  PERFORM pg_sleep(0.01);
  IF public.article_report_update(v_id, 'confirmed', 'A second note.') <> 'ok' THEN RAISE EXCEPTION 'FAIL: note-only update refused'; END IF;
  IF (SELECT reviewed_at FROM public.article_reports_admin('confirmed', 10) WHERE id = v_id) <> v_row.reviewed_at THEN
    RAISE EXCEPTION 'FAIL: a note-only change moved reviewed_at';
  END IF;
  RAISE NOTICE 'PASS admin: update trims the note, records who and when on a status change only';

  IF public.article_report_update(v_id, 'nonsense', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a bad status was accepted'; END IF;
  IF public.article_report_update(v_id, 'fixed', repeat('x', 2001)) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a 2001-character note was accepted'; END IF;
  IF public.article_report_update('d0000000-0000-4000-8000-0000000000ff', 'fixed', '') <> 'not_found' THEN RAISE EXCEPTION 'FAIL: an unknown id was not not_found'; END IF;
  RAISE NOTICE 'PASS admin: invalid and not_found are answered, not raised';

  IF public.article_report_delete(v_id) <> 'ok' THEN RAISE EXCEPTION 'FAIL: delete refused'; END IF;
  IF public.article_report_delete(v_id) <> 'not_found' THEN RAISE EXCEPTION 'FAIL: a second delete was not not_found'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 500)) <> v_total - 1 THEN RAISE EXCEPTION 'FAIL: the report is still listed'; END IF;
  RAISE NOTICE 'PASS admin: delete removes the report once';
END;
$$;
RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL ARTICLE REPORT TESTS PASSED'; END; $$;

ROLLBACK;
