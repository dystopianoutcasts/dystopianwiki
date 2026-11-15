-- Article report read and archive tests (migration 050)
-- Created: 2026-11-15
--
-- Needs 024, 048, 049 and 050 applied. Run the whole file as `postgres`: the SQL editor, or
--   psql "<connection string>" -v ON_ERROR_STOP=1 -f supabase/tests/article_reports_read_archive.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind. Every assertion RAISEs on
-- failure: the script either ends with "ALL READ AND ARCHIVE TESTS PASSED" or stops at the first
-- failure. (Not run by the session that wrote it: no database was available.)
--
-- Fixture accounts: member ...31 (username ra_member), admin ...33 (aurora_admin, username ra_admin).
-- Fixture reports (inserted directly, as postgres): three 'new' (ra...01-03) and one 'fixed' (ra...04).

BEGIN;

SET LOCAL client_min_messages = NOTICE;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000031', 'authenticated', 'authenticated',
   'ra-member@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"ra_member"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000033', 'authenticated', 'authenticated',
   'ra-admin@example.invalid', '', NOW(), NOW(), NOW(), '{"aurora_admin": true}'::jsonb, '{"username":"ra_admin"}'::jsonb);

-- Live reports may exist; these tests count rows, so start from an empty table (this transaction only).
DELETE FROM public.article_reports;

INSERT INTO public.article_reports (id, created_at, article_id, article_slug, article_title, article_url, kind, message, reporter_hash, status, reviewed_at)
VALUES
  ('d0000000-0000-4000-8000-0000000000a1', now() - interval '4 hours', 'ra-1', 'ra-one', 'One', '/pz/ra-one', 'other', 'first fixture report', 'h', 'new', NULL),
  ('d0000000-0000-4000-8000-0000000000a2', now() - interval '3 hours', 'ra-2', 'ra-two', 'Two', '/pz/ra-two', 'other', 'second fixture report', 'h', 'new', NULL),
  ('d0000000-0000-4000-8000-0000000000a3', now() - interval '2 hours', 'ra-3', 'ra-three', 'Three', '/pz/ra-three', 'other', 'third fixture report', 'h', 'new', NULL),
  ('d0000000-0000-4000-8000-0000000000a4', now() - interval '1 hour', 'ra-4', 'ra-four', 'Four', '/pz/ra-four', 'other', 'fourth fixture report', 'h', 'fixed', now() - interval '30 minutes');

-- ============================================================================
-- 1. GRANTS
-- ============================================================================

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['public.article_reports_admin(text, integer, text)', 'public.article_reports_new_count()',
                           'public.article_reports_box_counts()', 'public.article_report_mark_read(uuid, boolean)',
                           'public.article_reports_mark_all_read(uuid[])', 'public.article_report_archive(uuid, boolean)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon or service_role can execute %', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated cannot execute %', f;
    END IF;
  END LOOP;
  IF to_regprocedure('public.article_reports_admin(text, integer)') IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the old two-argument list function still exists';
  END IF;
  RAISE NOTICE 'PASS grants: the 050 functions are for authenticated only; the old list function is gone';
END;
$$;

-- ============================================================================
-- 2. COLUMNS (the backfill ran once, inside the migration, on the rows that existed then)
-- ============================================================================

-- The backfill: the same statement the migration runs once when it adds the columns, applied to
-- rows that start with read_at NULL (as old rows did). Triaged (status not new) start read, new ones
-- start unread. These rows are removed again before the real fixtures are used.
INSERT INTO public.article_reports (id, created_at, article_id, article_slug, article_title, article_url, kind, message, reporter_hash, status, reviewed_at)
VALUES
  ('d0000000-0000-4000-8000-0000000000b1', now() - interval '9 hours', 'ra-b1', 'ra-b-one', 'B1', '/pz/ra-b-one', 'other', 'old new report', 'h', 'new', NULL),
  ('d0000000-0000-4000-8000-0000000000b2', now() - interval '8 hours', 'ra-b2', 'ra-b-two', 'B2', '/pz/ra-b-two', 'other', 'old triaged report', 'h', 'fixed', now() - interval '7 hours');
UPDATE public.article_reports
   SET read_at = coalesce(reviewed_at, created_at),
       read_by = reviewed_by
 WHERE status <> 'new' AND read_at IS NULL;
DO $$
BEGIN
  IF (SELECT read_at FROM public.article_reports WHERE id = 'd0000000-0000-4000-8000-0000000000b1') IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the backfill marked a new report read';
  END IF;
  IF (SELECT read_at FROM public.article_reports WHERE id = 'd0000000-0000-4000-8000-0000000000b2') IS DISTINCT FROM
     (SELECT reviewed_at FROM public.article_reports WHERE id = 'd0000000-0000-4000-8000-0000000000b2') THEN
    RAISE EXCEPTION 'FAIL: the backfill did not set read_at = reviewed_at on a triaged report';
  END IF;
  RAISE NOTICE 'PASS backfill: triaged reports start read, new ones unread';
END;
$$;
DELETE FROM public.article_reports WHERE id IN ('d0000000-0000-4000-8000-0000000000b1', 'd0000000-0000-4000-8000-0000000000b2');

DO $$
BEGIN
  IF (SELECT count(*) FROM public.article_reports WHERE archived_at IS NOT NULL) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a fixture starts archived';
  END IF;
  RAISE NOTICE 'PASS columns exist and nothing starts archived';
END;
$$;

-- ============================================================================
-- 3. NON-ADMINS: denied, zero rows, zero counts, nothing changed
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000031","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF public.article_report_mark_read('d0000000-0000-4000-8000-0000000000a1', true) <> 'denied' THEN RAISE EXCEPTION 'FAIL: a member marked a report read'; END IF;
  IF public.article_reports_mark_all_read(ARRAY['d0000000-0000-4000-8000-0000000000a1']::uuid[]) <> -1 THEN RAISE EXCEPTION 'FAIL: a member marked reports read in bulk'; END IF;
  IF public.article_report_archive('d0000000-0000-4000-8000-0000000000a1', true) <> 'denied' THEN RAISE EXCEPTION 'FAIL: a member archived a report'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100, 'inbox')) <> 0 THEN RAISE EXCEPTION 'FAIL: a member read the inbox'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100, 'archived')) <> 0 THEN RAISE EXCEPTION 'FAIL: a member read the archive'; END IF;
  IF public.article_reports_new_count() <> 0 THEN RAISE EXCEPTION 'FAIL: a member saw a count'; END IF;
  IF (SELECT count(*) FROM public.article_reports_box_counts()) <> 0 THEN RAISE EXCEPTION 'FAIL: a member saw the box counts'; END IF;
  RAISE NOTICE 'PASS a non-admin gets denied, zero rows and zero counts';
END;
$$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.article_reports WHERE read_at IS NOT NULL OR archived_at IS NOT NULL) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a refused call still changed a report';
  END IF;
  RAISE NOTICE 'PASS the refused calls changed nothing';
END;
$$;

-- ============================================================================
-- 4. ADMIN
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000033","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_a1 uuid := 'd0000000-0000-4000-8000-0000000000a1';
  v_a2 uuid := 'd0000000-0000-4000-8000-0000000000a2';
  v_a3 uuid := 'd0000000-0000-4000-8000-0000000000a3';
  v_row record;
BEGIN
  -- Counts at the start: four in the inbox, all unread (the fixed one was inserted unread; only the
  -- migration's backfill marks old triaged reports read).
  SELECT * INTO v_row FROM public.article_reports_box_counts();
  IF v_row.unread <> 4 OR v_row.inbox <> 4 OR v_row.archived <> 0 THEN
    RAISE EXCEPTION 'FAIL: starting counts were % / % / %', v_row.unread, v_row.inbox, v_row.archived;
  END IF;
  IF public.article_reports_new_count() <> 4 THEN RAISE EXCEPTION 'FAIL: the starting unread count is not 4'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100, 'inbox') WHERE read_at IS NOT NULL) <> 0 THEN RAISE EXCEPTION 'FAIL: a report starts read'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100)) <> 4 THEN RAISE EXCEPTION 'FAIL: the default box is not the inbox'; END IF;
  IF (SELECT count(*) FROM public.article_reports_admin('all', 100, 'nonsense')) <> 0 THEN RAISE EXCEPTION 'FAIL: an unknown box returned rows'; END IF;
  RAISE NOTICE 'PASS admin: starting counts and list boxes';

  -- Mark read and unread.
  IF public.article_report_mark_read(v_a1, true) <> 'ok' THEN RAISE EXCEPTION 'FAIL: mark read refused'; END IF;
  SELECT * INTO v_row FROM public.article_reports_admin('all', 100, 'inbox') WHERE id = v_a1;
  IF v_row.read_at IS NULL THEN RAISE EXCEPTION 'FAIL: read_at not set'; END IF;
  RESET ROLE;
  IF (SELECT r.read_by FROM public.article_reports r WHERE r.id = v_a1) IS NULL THEN RAISE EXCEPTION 'FAIL: read_by not set'; END IF;
  SET LOCAL ROLE authenticated;
  IF public.article_reports_new_count() <> 3 THEN RAISE EXCEPTION 'FAIL: the count did not drop to 3 after mark read'; END IF;
  IF public.article_report_mark_read(v_a1, false) <> 'ok' THEN RAISE EXCEPTION 'FAIL: mark unread refused'; END IF;
  RESET ROLE;
  IF (SELECT r.read_at FROM public.article_reports r WHERE r.id = v_a1) IS NOT NULL
     OR (SELECT r.read_by FROM public.article_reports r WHERE r.id = v_a1) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: mark unread did not clear read_at and read_by';
  END IF;
  SET LOCAL ROLE authenticated;
  IF public.article_reports_new_count() <> 4 THEN RAISE EXCEPTION 'FAIL: the count did not return to 4'; END IF;
  RAISE NOTICE 'PASS admin: mark read and unread, with the count';

  -- Mark several read: only unread ones change; unknown ids are skipped.
  PERFORM public.article_report_mark_read(v_a3, true);
  -- a1 and a2 are unread, a3 is read, the last id does not exist: two change.
  IF public.article_reports_mark_all_read(ARRAY[v_a1, v_a2, v_a3, 'd0000000-0000-4000-8000-0000000000ff']::uuid[]) <> 2 THEN RAISE EXCEPTION 'FAIL: mark all did not report 2 changed'; END IF;
  IF public.article_reports_mark_all_read(ARRAY[v_a1, v_a2]::uuid[]) <> 0 THEN RAISE EXCEPTION 'FAIL: marking already-read reports changed some'; END IF;
  IF public.article_reports_new_count() <> 1 THEN RAISE EXCEPTION 'FAIL: after mark all the count is not 1 (the fourth report was not listed)'; END IF;
  IF public.article_reports_mark_all_read(NULL) <> -2 THEN RAISE EXCEPTION 'FAIL: a null list was accepted'; END IF;
  IF public.article_reports_mark_all_read(ARRAY[[v_a1, v_a2], [v_a3, v_a1]]) <> -2 THEN RAISE EXCEPTION 'FAIL: a two-dimensional list was accepted'; END IF;
  IF public.article_reports_mark_all_read(ARRAY[v_a1, NULL]::uuid[]) <> -2 THEN RAISE EXCEPTION 'FAIL: a list with a null id was accepted'; END IF;
  RAISE NOTICE 'PASS admin: mark all read changes only the listed unread reports';

  -- Archive and unarchive.
  IF public.article_report_archive(v_a2, true) <> 'ok' THEN RAISE EXCEPTION 'FAIL: archive refused'; END IF;
  IF EXISTS (SELECT 1 FROM public.article_reports_admin('all', 100, 'inbox') WHERE id = v_a2) THEN RAISE EXCEPTION 'FAIL: an archived report is still in the inbox'; END IF;
  SELECT * INTO v_row FROM public.article_reports_admin('all', 100, 'archived') WHERE id = v_a2;
  IF NOT FOUND OR v_row.archived_at IS NULL THEN RAISE EXCEPTION 'FAIL: an archived report is not in the archive list'; END IF;
  RESET ROLE;
  IF (SELECT r.archived_by FROM public.article_reports r WHERE r.id = v_a2) IS NULL THEN RAISE EXCEPTION 'FAIL: archived_by not set'; END IF;
  SET LOCAL ROLE authenticated;
  SELECT * INTO v_row FROM public.article_reports_box_counts();
  IF v_row.inbox <> 3 OR v_row.archived <> 1 THEN RAISE EXCEPTION 'FAIL: box counts after archive were % / %', v_row.inbox, v_row.archived; END IF;
  -- a2 was read above, so the unread count is still 1; archiving an UNREAD report lowers it.
  PERFORM public.article_report_mark_read(v_a2, false);
  IF public.article_reports_new_count() <> 1 THEN RAISE EXCEPTION 'FAIL: an archived unread report still counts as unread'; END IF;
  IF public.article_report_archive(v_a2, false) <> 'ok' THEN RAISE EXCEPTION 'FAIL: move back refused'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.article_reports_admin('all', 100, 'inbox') WHERE id = v_a2) THEN RAISE EXCEPTION 'FAIL: the report did not come back to the inbox'; END IF;
  RESET ROLE;
  IF (SELECT r.archived_at FROM public.article_reports r WHERE r.id = v_a2) IS NOT NULL
     OR (SELECT r.archived_by FROM public.article_reports r WHERE r.id = v_a2) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: unarchive did not clear archived_at and archived_by';
  END IF;
  SET LOCAL ROLE authenticated;
  IF public.article_reports_new_count() <> 2 THEN RAISE EXCEPTION 'FAIL: the unread count did not return after moving back'; END IF;
  RAISE NOTICE 'PASS admin: archive and move back, lists, box counts and the unread count';

  -- Invalid and not_found are answered, not raised.
  IF public.article_report_mark_read(v_a1, NULL) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a null read flag was accepted'; END IF;
  IF public.article_report_archive(v_a1, NULL) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a null archive flag was accepted'; END IF;
  IF public.article_report_mark_read('d0000000-0000-4000-8000-0000000000ff', true) <> 'not_found' THEN RAISE EXCEPTION 'FAIL: mark read on an unknown id'; END IF;
  IF public.article_report_archive('d0000000-0000-4000-8000-0000000000ff', true) <> 'not_found' THEN RAISE EXCEPTION 'FAIL: archive on an unknown id'; END IF;
  RAISE NOTICE 'PASS admin: invalid and not_found are answered';

  -- Archive is never a delete: all four rows are still there after all of the above.
  PERFORM public.article_report_archive(v_a1, true);
  PERFORM public.article_report_archive(v_a2, true);
  PERFORM public.article_report_archive(v_a3, true);
  RESET ROLE;
  IF (SELECT count(*) FROM public.article_reports) <> 4 THEN RAISE EXCEPTION 'FAIL: archiving removed a row'; END IF;
  SET LOCAL ROLE authenticated;
  RAISE NOTICE 'PASS admin: archive deletes nothing';
END;
$$;
RESET ROLE;

-- The SQL editor shows only the last result, and not the notices: this row is the pass mark.
SELECT 'ALL READ AND ARCHIVE TESTS PASSED' AS result;

ROLLBACK;
