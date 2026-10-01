-- Mascot vote tests (migration 025, docs/planning/MascotVote/PLAN.md Task 6)
-- Created: 2026-10-01
--
-- Needs 024 and 025 applied. Run the whole file as `postgres`: the SQL editor, or
--   psql "<connection string>" -v ON_ERROR_STOP=1 -f supabase/tests/mascot_vote.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind. Every
-- assertion RAISEs on failure: the script either ends with "ALL MASCOT VOTE TESTS
-- PASSED" or stops at the first failure.
--
-- It moves election 1 through draft -> open -> closed -> published inside the
-- transaction; the rollback puts the live election back exactly as it was.
--
-- Fixture accounts:
--   voter1  ...11  Discord (full_name voter_one)
--   voter2  ...12  Discord (full_name voter_two)
--   google  ...13  Google only
--   admin   ...14  Discord, aurora_admin
--   late    ...15  Discord, votes after the closing time

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000011', 'authenticated', 'authenticated',
   'mv-voter1@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"mv_voter1"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000012', 'authenticated', 'authenticated',
   'mv-voter2@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"mv_voter2"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000013', 'authenticated', 'authenticated',
   'mv-google@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"mv_google"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000014', 'authenticated', 'authenticated',
   'mv-admin@example.invalid', '', NOW(), NOW(), NOW(), '{"aurora_admin": true}'::jsonb, '{"username":"mv_admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000015', 'authenticated', 'authenticated',
   'mv-late@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"mv_late"}'::jsonb);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
  ('800000000000000011', 'd0000000-0000-4000-8000-000000000011',
   '{"sub":"800000000000000011","full_name":"voter_one","name":"voter_one#0","custom_claims":{"global_name":"Voter One"}}'::jsonb, 'discord', NOW(), NOW()),
  ('800000000000000012', 'd0000000-0000-4000-8000-000000000012',
   '{"sub":"800000000000000012","full_name":"voter_two","name":"voter_two#0"}'::jsonb, 'discord', NOW(), NOW()),
  ('g-mv-google', 'd0000000-0000-4000-8000-000000000013',
   '{"sub":"g-mv-google","email":"mv-google@example.invalid"}'::jsonb, 'google', NOW(), NOW()),
  ('800000000000000014', 'd0000000-0000-4000-8000-000000000014',
   '{"sub":"800000000000000014","full_name":"admin_mv"}'::jsonb, 'discord', NOW(), NOW()),
  ('800000000000000015', 'd0000000-0000-4000-8000-000000000015',
   '{"sub":"800000000000000015","full_name":"late_voter"}'::jsonb, 'discord', NOW(), NOW());

-- The live election may hold real ballots; these tests need election 1 empty and in
-- draft. Inside this transaction only.
DELETE FROM public.mascot_ballots WHERE election_id = 1;
UPDATE public.mascot_elections SET status = 'draft', closes_at = NULL, published_at = NULL WHERE id = 1;

-- ============================================================================
-- 1. SEED, DRAW ORDER, GRANTS
-- ============================================================================

DO $$
DECLARE
  v_draw text[];
  f text;
BEGIN
  IF (SELECT count(*) FROM public.mascot_entries) <> 6 THEN
    RAISE EXCEPTION 'FAIL: expected 6 mascot entries';
  END IF;
  SELECT draw_order INTO v_draw FROM public.mascot_elections WHERE id = 1;
  IF (SELECT array_agg(d ORDER BY d) FROM unnest(v_draw) d) IS DISTINCT FROM
     ARRAY['art_001','art_002','art_003','art_004','art_005','art_006'] THEN
    RAISE EXCEPTION 'FAIL: the draw order is not a permutation of the six entries: %', v_draw;
  END IF;
  RAISE NOTICE 'PASS six entries; election 1 has a draw order holding each entry once';

  BEGIN
    UPDATE public.mascot_elections SET draw_order = ARRAY['art_001','art_002','art_003','art_004','art_006','art_005'] WHERE id = 1;
    RAISE EXCEPTION 'FAIL: the draw order was changed';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  BEGIN
    INSERT INTO public.mascot_elections (id, draw_order) VALUES (99, ARRAY['art_001','art_001','art_002','art_003','art_004','art_005']);
    RAISE EXCEPTION 'FAIL: an election with a bad draw order was created';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS the draw order cannot change, and a new election needs a full permutation';

  FOREACH f IN ARRAY ARRAY['public.mascot_cast_ballot(text[])', 'public.mascot_my_ballot()',
                           'public.mascot_admin_ballots()', 'public.mascot_admin_set_counted(uuid, boolean)',
                           'public.mascot_admin_set_status(text)', 'public.mascot_admin_set_closes_at(timestamptz)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon or service_role can execute %', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated cannot execute %', f;
    END IF;
  END LOOP;
  IF NOT has_function_privilege('anon', 'public.mascot_public_ballots()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon cannot read the published ballots';
  END IF;
  IF has_function_privilege('authenticated', 'public.mascot_guard_draw_order()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: the trigger function is callable by clients';
  END IF;
  IF has_table_privilege('anon', 'public.mascot_ballots', 'SELECT')
     OR has_table_privilege('authenticated', 'public.mascot_ballots', 'SELECT')
     OR has_table_privilege('authenticated', 'public.mascot_ballots', 'INSERT')
     OR has_table_privilege('authenticated', 'public.mascot_ballots', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.mascot_elections', 'UPDATE')
     OR has_table_privilege('anon', 'public.mascot_entries', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: a client role holds a write grant or ballot read grant';
  END IF;
  RAISE NOTICE 'PASS grants: functions to the right roles only; no client grant on ballots, no client writes';
END;
$$;

-- ============================================================================
-- 2. ANON
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM public.mascot_entries) <> 6 THEN RAISE EXCEPTION 'FAIL: anon cannot read the entries'; END IF;
  IF (SELECT status FROM public.mascot_elections WHERE id = 1) <> 'draft' THEN RAISE EXCEPTION 'FAIL: anon cannot read the election'; END IF;
  BEGIN
    PERFORM count(*) FROM public.mascot_ballots;
    RAISE EXCEPTION 'FAIL: anon read mascot_ballots';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.mascot_cast_ballot(ARRAY['art_001']);
    RAISE EXCEPTION 'FAIL: anon cast a ballot';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.mascot_my_ballot();
    RAISE EXCEPTION 'FAIL: anon called mascot_my_ballot';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  IF public.mascot_public_ballots() IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: ballots are public before publication';
  END IF;
  RAISE NOTICE 'PASS anon reads entries and the election, cannot read or cast ballots, sees nothing before publication';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 3. DRAFT: nobody can vote; members cannot move the status
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000011","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF public.mascot_cast_ballot(ARRAY['art_001']) <> 'not_open' THEN
    RAISE EXCEPTION 'FAIL: a ballot was accepted while the vote is in draft';
  END IF;
  BEGIN
    PERFORM count(*) FROM public.mascot_ballots;
    RAISE EXCEPTION 'FAIL: a member read mascot_ballots directly';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.mascot_admin_set_status('open');
    RAISE EXCEPTION 'FAIL: a member opened the vote';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.mascot_admin_ballots();
    RAISE EXCEPTION 'FAIL: a member read the admin ballot list';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.mascot_admin_set_closes_at(now());
    RAISE EXCEPTION 'FAIL: a member set the closing time';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS draft refuses ballots (not_open); a member is refused every admin function and the table';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 4. ADMIN OPENS; illegal moves refused
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000014","role":"authenticated"}', TRUE);

DO $$
BEGIN
  BEGIN
    PERFORM public.mascot_admin_set_status('published');
    RAISE EXCEPTION 'FAIL: draft moved straight to published';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  BEGIN
    PERFORM public.mascot_admin_set_status('bogus');
    RAISE EXCEPTION 'FAIL: an unknown status was accepted';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  BEGIN
    PERFORM public.mascot_admin_set_status(NULL);
    RAISE EXCEPTION 'FAIL: a NULL status was accepted';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  IF public.mascot_admin_set_status('open') <> 'open' THEN RAISE EXCEPTION 'FAIL: admin could not open the vote'; END IF;
  RAISE NOTICE 'PASS an admin opens the vote; draft to published and unknown statuses are refused';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 5. VOTING
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000011","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_rank text[];
BEGIN
  IF public.mascot_cast_ballot(ARRAY['art_002', NULL, 'art_005']) <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: voter1''s ballot was refused';
  END IF;
  SELECT rankings INTO v_rank FROM public.mascot_my_ballot();
  IF v_rank IS DISTINCT FROM ARRAY['art_002', 'art_005'] THEN
    RAISE EXCEPTION 'FAIL: a ballot with a gap should be stored closed up, got %', v_rank;
  END IF;
  RAISE NOTICE 'PASS a ballot is accepted and its gap closed (ranks 1 and 3 become 1 and 2)';

  IF public.mascot_cast_ballot(ARRAY['art_001']) <> 'already_voted' THEN
    RAISE EXCEPTION 'FAIL: a second ballot from the same account was not refused';
  END IF;
  SELECT rankings INTO v_rank FROM public.mascot_my_ballot();
  IF v_rank IS DISTINCT FROM ARRAY['art_002', 'art_005'] THEN
    RAISE EXCEPTION 'FAIL: the second attempt changed the first ballot';
  END IF;
  RAISE NOTICE 'PASS a second ballot is refused (already_voted) and the first is untouched';
END;
$$;

RESET ROLE;

-- The Discord identity was copied by the database, from the account.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.mascot_ballots
                  WHERE user_id = 'd0000000-0000-4000-8000-000000000011'
                    AND discord_id = '800000000000000011' AND discord_username = 'voter_one') THEN
    RAISE EXCEPTION 'FAIL: the ballot does not carry the account''s Discord id and username';
  END IF;
  RAISE NOTICE 'PASS the ballot carries the Discord id and username from the account (username, not display name)';
END;
$$;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000012","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF public.mascot_cast_ballot(ARRAY['art_001', 'art_001']) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a repeated entry was accepted'; END IF;
  IF public.mascot_cast_ballot(ARRAY['art_001', 'art_999']) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: an unknown entry was accepted'; END IF;
  IF public.mascot_cast_ballot(ARRAY[]::text[]) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: an empty ballot was accepted'; END IF;
  IF public.mascot_cast_ballot(ARRAY[NULL, '  ']::text[]) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a ballot of blanks was accepted'; END IF;
  IF public.mascot_cast_ballot(NULL) <> 'invalid' THEN RAISE EXCEPTION 'FAIL: a NULL ballot was accepted'; END IF;
  IF public.mascot_cast_ballot(ARRAY['art_001','art_002','art_003','art_004','art_005','art_006','art_001']) <> 'invalid' THEN
    RAISE EXCEPTION 'FAIL: a seven-rank ballot was accepted';
  END IF;
  IF EXISTS (SELECT 1 FROM public.mascot_my_ballot()) THEN RAISE EXCEPTION 'FAIL: an invalid ballot was stored'; END IF;
  RAISE NOTICE 'PASS repeats, unknown ids, empty, blank, NULL and over-long ballots are refused (invalid) and nothing is stored';

  IF public.mascot_cast_ballot(ARRAY['art_004','art_001','art_002','art_003','art_005','art_006']) <> 'ok' THEN
    RAISE EXCEPTION 'FAIL: voter2''s full ballot was refused';
  END IF;
  RAISE NOTICE 'PASS a full six-rank ballot is accepted';
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000013","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.mascot_cast_ballot(ARRAY['art_001']) <> 'no_discord' THEN RAISE EXCEPTION 'FAIL: a member without Discord voted'; END IF;
  RAISE NOTICE 'PASS a member without a Discord identity is refused (no_discord)';
END;
$$;
RESET ROLE;

-- One ballot per Discord identity, even if the identity moved to another account.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.mascot_ballots (election_id, user_id, discord_id, discord_username, rankings)
    VALUES (1, 'd0000000-0000-4000-8000-000000000013', '800000000000000011', 'voter_one', ARRAY['art_001']);
    RAISE EXCEPTION 'FAIL: two ballots carry the same Discord id';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS the table allows one ballot per Discord id per election';
END;
$$;

-- The closing time.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000014","role":"authenticated"}', TRUE);
DO $$ BEGIN PERFORM public.mascot_admin_set_closes_at(now() - INTERVAL '1 minute'); END; $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000015","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF public.mascot_cast_ballot(ARRAY['art_003']) <> 'not_open' THEN
    RAISE EXCEPTION 'FAIL: a ballot was accepted after the closing time';
  END IF;
  RAISE NOTICE 'PASS a ballot after the closing time is refused although the status is still open';
END;
$$;
RESET ROLE;

-- ============================================================================
-- 6. ADMIN REVIEW, CLOSE, PUBLISH
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000014","role":"authenticated"}', TRUE);

DO $$
DECLARE
  v_count  bigint;
  v_ballot uuid;
  v_pub    jsonb;
BEGIN
  PERFORM public.mascot_admin_set_closes_at(NULL);

  SELECT count(*) INTO v_count FROM public.mascot_admin_ballots();
  IF v_count <> 2 THEN RAISE EXCEPTION 'FAIL: the admin should see 2 ballots, saw %', v_count; END IF;
  SELECT ballot_id INTO v_ballot FROM public.mascot_admin_ballots() WHERE discord_username = 'voter_two';
  IF v_ballot IS NULL THEN RAISE EXCEPTION 'FAIL: the admin list does not name voter_two'; END IF;
  RAISE NOTICE 'PASS an admin sees every ballot with its Discord username';

  PERFORM public.mascot_admin_set_counted(v_ballot, false);

  BEGIN
    PERFORM public.mascot_admin_set_counted('d0000000-0000-4000-8000-0000000000ff', false);
    RAISE EXCEPTION 'FAIL: set_counted accepted an unknown ballot';
  EXCEPTION WHEN no_data_found THEN NULL;
  END;

  BEGIN
    PERFORM public.mascot_admin_set_status('published');
    RAISE EXCEPTION 'FAIL: open moved straight to published';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  PERFORM public.mascot_admin_set_status('closed');
  PERFORM public.mascot_admin_set_status('open');
  PERFORM public.mascot_admin_set_status('closed');
  PERFORM public.mascot_admin_set_status('published');
  RAISE NOTICE 'PASS open -> closed -> open -> closed -> published; open to published refused';

  BEGIN
    PERFORM public.mascot_admin_set_counted(v_ballot, true);
    RAISE EXCEPTION 'FAIL: a ballot was changed while results are published';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  BEGIN
    PERFORM public.mascot_admin_set_status('open');
    RAISE EXCEPTION 'FAIL: published moved straight back to open';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  RAISE NOTICE 'PASS while published, ballots are frozen and the vote cannot reopen directly';
END;
$$;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT published_at FROM public.mascot_elections WHERE id = 1) IS NULL THEN
    RAISE EXCEPTION 'FAIL: publishing did not set published_at';
  END IF;
  RAISE NOTICE 'PASS publishing sets published_at';
END;
$$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  v_pub jsonb;
BEGIN
  v_pub := public.mascot_public_ballots();
  IF v_pub IS NULL THEN RAISE EXCEPTION 'FAIL: nothing public after publication'; END IF;
  IF (SELECT array_agg(k ORDER BY k) FROM jsonb_object_keys(v_pub) k) IS DISTINCT FROM ARRAY['ballots', 'excluded'] THEN
    RAISE EXCEPTION 'FAIL: the public object has keys other than ballots and excluded: %', v_pub;
  END IF;
  IF v_pub -> 'ballots' IS DISTINCT FROM '[["art_002", "art_005"]]'::jsonb THEN
    RAISE EXCEPTION 'FAIL: expected only the counted ballot''s rankings, got %', v_pub -> 'ballots';
  END IF;
  IF (v_pub ->> 'excluded')::int <> 1 THEN RAISE EXCEPTION 'FAIL: expected excluded 1, got %', v_pub ->> 'excluded'; END IF;
  IF v_pub::text ~ '(voter_|8000000000000|d0000000|@)' THEN
    RAISE EXCEPTION 'FAIL: the public ballots leak an identity: %', v_pub;
  END IF;
  RAISE NOTICE 'PASS after publication anyone gets the counted rankings and the excluded count, and nothing else';
END;
$$;

RESET ROLE;

-- Unpublish clears published_at and hides the ballots again.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000014","role":"authenticated"}', TRUE);
DO $$
BEGIN
  PERFORM public.mascot_admin_set_status('closed');
  IF public.mascot_public_ballots() IS NOT NULL THEN RAISE EXCEPTION 'FAIL: ballots stayed public after unpublishing'; END IF;
  IF (SELECT published_at FROM public.mascot_elections WHERE id = 1) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: unpublishing left published_at set';
  END IF;
  RAISE NOTICE 'PASS unpublish hides the ballots again and clears published_at';
END;
$$;
RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL MASCOT VOTE TESTS PASSED'; END; $$;

ROLLBACK;
