-- Article report tests (migration 048, docs/planning/REPORT-FORM-SPEC.md)
-- Created: 2026-11-15
--
-- Needs 024, 048, 049 and 050 applied. Run the whole file as `postgres`: the SQL editor, or
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
-- Fixture articles: rp-art-1 (slug rp-sample-article), rp-art-camel (slug rp-Camel-Slug)

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

INSERT INTO public.articles (id, slug, title, content, game, version, section, category)
VALUES
  ('rp-art-1', 'rp-sample-article', 'A sample article', 'x', 'pz', 'build-42', 'modding', 'lua'),
  ('rp-art-camel', 'rp-Camel-Slug', 'A camel-case slug', 'x', 'pz', 'build-41', 'modding', 'vanilla-reference');

-- Live reports may exist; these tests count rows, so start from an empty table (this transaction only).
DELETE FROM public.article_reports;

-- ============================================================================
-- 1. GRANTS
-- ============================================================================

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['public.article_reports_admin(text, integer, text)', 'public.article_report_update(uuid, text, text)',
                           'public.article_report_delete(uuid)', 'public.article_reports_new_count()'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon or service_role can execute %', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated cannot execute %', f;
    END IF;
  END LOOP;
  f := 'public.submit_article_report(text, text, text, text, text, text)';
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
-- 2. ANON: send, validate, the page is read from the table, rate limit
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
SELECT set_config('request.headers', '{"x-forwarded-for":"203.0.113.7, 10.0.0.1"}', TRUE);

DO $$
DECLARE
  r text;
  i integer;
  u constant text := '/pz/build-42/modding/lua/rp-sample-article';
  m constant text := 'a long enough message';
BEGIN
  r := public.submit_article_report('rp-art-1', u, 'Setup', 'wrong_fact', 'The page says 5 but the game uses 7.', 'Build 42.13, file X line 9');
  IF r <> 'ok' THEN RAISE EXCEPTION 'FAIL: a good report from a signed-out reader got %', r; END IF;
  RAISE NOTICE 'PASS a signed-out reader can send a report';

  -- Every invalid field is refused without raising.
  IF public.submit_article_report('rp-art-1', u, NULL, 'wrong_fact', 'short', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a 5-character message was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'wrong_fact', repeat('x', 2001), '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a 2001-character message was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'wrong_fact', m, repeat('x', 1001)) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a 1001-character evidence was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'bogus', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: an unknown kind was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', 'https://evil.example/x', NULL, 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: an absolute URL was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', '//evil.example/x', NULL, 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a protocol-relative URL was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', '/' || repeat('a', 300) || '/rp-sample-article', NULL, 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a URL over 300 characters was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', '/pz/other-article', NULL, 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a path that does not end in the article slug was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'a long enough' || chr(7) || ' message', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a control character was accepted'; END IF;
  IF public.submit_article_report(NULL, u, NULL, 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a NULL article id was accepted'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, NULL, m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a NULL kind was accepted'; END IF;
  -- A line break and a tab are fine.
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', E'line one\n\tline two here', '') <> 'ok' THEN RAISE EXCEPTION 'FAIL: a message with a line break and a tab was refused'; END IF;
  RAISE NOTICE 'PASS invalid fields are refused as invalid, never raised; line breaks are allowed';

  -- The page is looked up by id: an unknown id is invalid, and a slug with capitals works.
  IF public.submit_article_report('no-such-article', u, NULL, 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: an unknown article id was accepted'; END IF;
  IF public.submit_article_report('rp-art-camel', '/pz/build-41/modding/vanilla-reference/rp-Camel-Slug', NULL, 'other', 'A real article with a capital in its slug.', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: an article whose slug has a capital letter was refused';
  END IF;
  RAISE NOTICE 'PASS the article is looked up by id; unknown ids are invalid; rp-Camel-Slug is accepted';

  -- Input cleaning: padding is trimmed before the length check, and format or bidi characters are refused.
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', E'\t\r\n   short   \n\t', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: tabs and line breaks counted toward the length'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'a message with a zero width' || chr(8203) || ' space', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: U+200B was accepted in the message'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'a message with a bidi override' || chr(8238) || ' inside', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: U+202E was accepted in the message'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'a message with an isolate' || chr(8294) || ' inside', '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: U+2066 was accepted in the message'; END IF;
  IF public.submit_article_report('rp-art-1', u, 'Set' || chr(8207) || 'up', 'other', m, '') <> 'invalid' THEN RAISE EXCEPTION 'FAIL: U+200F was accepted in the section'; END IF;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', m, 'evidence' || chr(8206)) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: U+200E was accepted in the evidence'; END IF;
  RAISE NOTICE 'PASS padding is trimmed; zero-width and bidi characters are refused in the message, section and evidence';

  -- This address has stored 3 reports so far (the good one, the line-break one, the camel one).
  FOR i IN 1..2 LOOP
    IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'rate limit report number ' || i, '') <> 'ok' THEN
      RAISE EXCEPTION 'FAIL: report % of 5 from one address was refused', i + 3;
    END IF;
  END LOOP;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'the sixth report in an hour', '') <> 'rate_limited' THEN
    RAISE EXCEPTION 'FAIL: the sixth signed-out report in an hour was not rate limited';
  END IF;
  RAISE NOTICE 'PASS signed out: 5 an hour per address, the sixth is rate_limited';
END;
$$;

-- A different address is not limited by the first.
SELECT set_config('request.headers', '{"x-forwarded-for":"198.51.100.9"}', TRUE);
DO $$
BEGIN
  IF public.submit_article_report('rp-art-1', '/pz/build-42/modding/lua/rp-sample-article', NULL, 'unclear', 'This part is hard to follow.', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a different address was rate limited by the first';
  END IF;
  RAISE NOTICE 'PASS another address has its own limit';
END;
$$;

-- Spoofing: the sender is cf-connecting-ip, else the RIGHTMOST x-forwarded-for entry, never the leftmost.
DO $$
DECLARE
  i integer;
  u constant text := '/pz/build-42/modding/lua/rp-sample-article';
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM set_config('request.headers', format('{"x-forwarded-for":"10.9.9.%s, 192.0.2.50"}', i), TRUE);
    IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'spoof attempt number ' || i, '') <> 'ok' THEN
      RAISE EXCEPTION 'FAIL: spoof report % was refused too early', i;
    END IF;
  END LOOP;
  -- A sixth with yet another leftmost value and the same rightmost hop shares the bucket.
  PERFORM set_config('request.headers', '{"x-forwarded-for":"10.9.9.99, 192.0.2.50"}', TRUE);
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'spoof attempt number six', '') <> 'rate_limited' THEN
    RAISE EXCEPTION 'FAIL: changing the leftmost x-forwarded-for entry escaped the limit';
  END IF;
  -- Naming another address first (198.51.100.9 is in use above) does not spend that address's bucket.
  PERFORM set_config('request.headers', '{"x-forwarded-for":"198.51.100.9, 192.0.2.77"}', TRUE);
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'naming a victim address first does not spend its bucket', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a caller used up another address bucket by naming it';
  END IF;
  -- cf-connecting-ip wins over x-forwarded-for (192.0.2.50 is exhausted; the cf address is not).
  PERFORM set_config('request.headers', '{"cf-connecting-ip":"192.0.2.60","x-forwarded-for":"10.1.1.1, 192.0.2.50"}', TRUE);
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'cf-connecting-ip is a separate bucket', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: cf-connecting-ip did not take precedence over x-forwarded-for';
  END IF;
  RAISE NOTICE 'PASS spoofed leftmost x-forwarded-for values share the rightmost hop bucket; cf-connecting-ip wins';
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

-- The stored hash is not the raw address, and the page columns come from the article row.
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
  IF EXISTS (SELECT 1 FROM public.article_reports WHERE article_id = 'rp-art-1' AND (article_slug <> 'rp-sample-article' OR article_title <> 'A sample article')) THEN
    RAISE EXCEPTION 'FAIL: the slug or title was not taken from the article row';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.article_reports WHERE article_slug = 'rp-Camel-Slug' AND article_version ~ '^\d{4}-\d\d-\d\dT') THEN
    RAISE EXCEPTION 'FAIL: the camel-case slug or the version was not stored';
  END IF;
  RAISE NOTICE 'PASS the address is stored only as a SHA-256 digest; signed-out reports have no reporter; the page columns come from the table';
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
  u constant text := '/pz/build-42/modding/lua/rp-sample-article';
BEGIN
  -- Same address as an exhausted anon one: the account has its own limit.
  FOR i IN 1..5 LOOP
    IF public.submit_article_report('rp-art-1', u, NULL, 'broken_link', 'Link number ' || i || ' is dead.', '') <> 'ok' THEN
      RAISE EXCEPTION 'FAIL: signed-in report % was refused', i;
    END IF;
  END LOOP;
  IF public.submit_article_report('rp-art-1', u, NULL, 'other', 'One more than the limit.', '') <> 'rate_limited' THEN
    RAISE EXCEPTION 'FAIL: the sixth signed-in report was not rate limited';
  END IF;
  RAISE NOTICE 'PASS signed in: 5 an hour per account, counted apart from the address';
END;
$$;

SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000022","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.submit_article_report('rp-art-1', '/pz/build-42/modding/lua/rp-sample-article', NULL, 'other', 'A different account is not limited.', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a second account was limited by the first';
  END IF;
  -- A non-admin gets nothing from the admin functions.
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100)) <> 0 THEN RAISE EXCEPTION 'FAIL: a member read the reports'; END IF;
  IF public.article_reports_new_count() <> 0 THEN RAISE EXCEPTION 'FAIL: a member got a count'; END IF;
  IF public.article_report_update('d0000000-0000-4000-8000-0000000000ff'::uuid, 'fixed', 'x') <> 'denied' THEN
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
  v_first_review timestamptz;
BEGIN
  SELECT count(*) INTO v_total FROM public.article_reports_admin('all', 500);
  -- 5 from the first address, 1 from the second, 7 from the spoofing tests, 5 from the reader, 1 from the other member.
  IF v_total <> 19 THEN
    RAISE EXCEPTION 'FAIL: expected 19 reports, the admin list has %', v_total;
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
  IF public.article_report_update(v_id, 'confirmed', E'  \tChecked against the engine.  \n') <> 'ok' THEN RAISE EXCEPTION 'FAIL: update refused'; END IF;
  SELECT * INTO v_row FROM public.article_reports_admin('confirmed', 10) WHERE id = v_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: the updated report is not under confirmed'; END IF;
  IF v_row.admin_note <> 'Checked against the engine.' THEN RAISE EXCEPTION 'FAIL: the note was not trimmed and saved: [%]', v_row.admin_note; END IF;
  IF v_row.reviewed_by_name <> 'rp_admin' OR v_row.reviewed_at IS NULL THEN RAISE EXCEPTION 'FAIL: who and when were not recorded'; END IF;
  IF v_row.note_updated_by_name <> 'rp_admin' OR v_row.note_updated_at IS NULL THEN RAISE EXCEPTION 'FAIL: who and when the note changed were not recorded'; END IF;
  -- Since 050 the count is unread inbox reports; a status change does not mark a report read.
  IF public.article_reports_new_count() <> v_total THEN RAISE EXCEPTION 'FAIL: a status change moved the unread count'; END IF;
  v_first_review := v_row.reviewed_at;

  -- A note-only change keeps the status review time and records the note edit. (now() is the
  -- transaction start, so the times are equal here; the assertion is that reviewed_at did not move
  -- and that the note edit set note_updated_at.)
  IF public.article_report_update(v_id, 'confirmed', 'A second note.') <> 'ok' THEN RAISE EXCEPTION 'FAIL: note-only update refused'; END IF;
  SELECT * INTO v_row FROM public.article_reports_admin('confirmed', 10) WHERE id = v_id;
  IF v_row.reviewed_at <> v_first_review THEN RAISE EXCEPTION 'FAIL: a note-only change moved reviewed_at'; END IF;
  IF v_row.admin_note <> 'A second note.' OR v_row.note_updated_at IS NULL OR v_row.note_updated_by_name <> 'rp_admin' THEN
    RAISE EXCEPTION 'FAIL: a note-only change was not recorded in note_updated_by and note_updated_at';
  END IF;
  RAISE NOTICE 'PASS admin: update trims the note, records who and when for a status change and for a note change';

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

-- ============================================================================
-- 5. THE GLOBAL CAP ON SIGNED-OUT REPORTS
-- ============================================================================

-- 60 signed-out reports in the last hour, from 60 different senders.
INSERT INTO public.article_reports (article_id, article_slug, article_title, article_url, kind, message, reporter_hash)
SELECT 'rp-art-1', 'rp-sample-article', 'A sample article', '/pz/build-42/modding/lua/rp-sample-article', 'other',
       'filler report number ' || g, encode(sha256(convert_to('filler-' || g, 'UTF8')), 'hex')
  FROM generate_series(1, 60) g;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
SELECT set_config('request.headers', '{"x-forwarded-for":"192.0.2.200"}', TRUE);
DO $$
BEGIN
  IF public.submit_article_report('rp-art-1', '/pz/build-42/modding/lua/rp-sample-article', NULL, 'other', 'a brand new sender, but the cap is global', '') <> 'busy' THEN
    RAISE EXCEPTION 'FAIL: the global signed-out cap did not refuse';
  END IF;
  RAISE NOTICE 'PASS 60 signed-out reports an hour in all: the next one is busy';
END;
$$;
RESET ROLE;

-- A signed-in member is not held by the global cap.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000022","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.submit_article_report('rp-art-1', '/pz/build-42/modding/lua/rp-sample-article', NULL, 'other', 'signed in is not held by the anonymous cap', '') <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: a signed-in member was refused by the signed-out cap';
  END IF;
  RAISE NOTICE 'PASS the global cap does not apply to signed-in members';
END;
$$;
RESET ROLE;

-- The SQL editor shows only the last result, and not the notices: this row is the pass mark.
SELECT 'ALL ARTICLE REPORT TESTS PASSED' AS result;

ROLLBACK;
