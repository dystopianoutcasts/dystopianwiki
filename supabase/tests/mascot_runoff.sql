-- Mascot runoff tests (migration 045)
-- Created: 2026-11-03
--
-- Needs 024, 025 and 045 applied. Run the whole file as `postgres`: the SQL editor, or
--   psql "<connection string>" -v ON_ERROR_STOP=1 -f supabase/tests/mascot_runoff.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Every assertion RAISEs on failure: the
-- script either ends with "ALL MASCOT RUNOFF TESTS PASSED" or stops at the first failure.
-- Inside the transaction it empties election 1, removes any later election, and moves
-- election 1 to published; the rollback puts everything back.
--
-- Fixture accounts:
--   voter1  ...21  Discord
--   voter2  ...22  Discord
--   voter3  ...23  Discord
--   admin   ...24  Discord, aurora_admin

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000021', 'authenticated', 'authenticated',
   'ro-voter1@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"ro_voter1"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000022', 'authenticated', 'authenticated',
   'ro-voter2@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"ro_voter2"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000023', 'authenticated', 'authenticated',
   'ro-voter3@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{"username":"ro_voter3"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-000000000024', 'authenticated', 'authenticated',
   'ro-admin@example.invalid', '', NOW(), NOW(), NOW(), '{"aurora_admin": true}'::jsonb, '{"username":"ro_admin"}'::jsonb);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
  ('800000000000000021', 'd0000000-0000-4000-8000-000000000021', '{"sub":"800000000000000021","full_name":"ro_one"}'::jsonb, 'discord', NOW(), NOW()),
  ('800000000000000022', 'd0000000-0000-4000-8000-000000000022', '{"sub":"800000000000000022","full_name":"ro_two"}'::jsonb, 'discord', NOW(), NOW()),
  ('800000000000000023', 'd0000000-0000-4000-8000-000000000023', '{"sub":"800000000000000023","full_name":"ro_three"}'::jsonb, 'discord', NOW(), NOW()),
  ('800000000000000024', 'd0000000-0000-4000-8000-000000000024', '{"sub":"800000000000000024","full_name":"ro_admin"}'::jsonb, 'discord', NOW(), NOW());

DELETE FROM public.mascot_ballots WHERE election_id > 1;
DELETE FROM public.mascot_elections WHERE id > 1;
DELETE FROM public.mascot_ballots WHERE election_id = 1;
UPDATE public.mascot_elections SET status = 'closed', closes_at = NULL, published_at = NULL WHERE id = 1;

-- Election 1's ballots: a 2 to 2 tie between art_002 and art_004, and one excluded ballot.
INSERT INTO public.mascot_ballots (election_id, user_id, discord_id, discord_username, rankings, counted) VALUES
  (1, 'd0000000-0000-4000-8000-000000000021', '800000000000000021', 'ro_one',   ARRAY['art_002', 'art_004'], true),
  (1, 'd0000000-0000-4000-8000-000000000022', '800000000000000022', 'ro_two',   ARRAY['art_004'],            true),
  (1, 'd0000000-0000-4000-8000-000000000023', '800000000000000023', 'ro_three', ARRAY['art_002'],            true),
  (1, 'd0000000-0000-4000-8000-000000000024', '800000000000000024', 'ro_admin', ARRAY['art_004', 'art_001'], true);

-- ============================================================================
-- ELECTION 1 IS UNCHANGED BY 045
-- ============================================================================

DO $$
BEGIN
  IF (SELECT entries FROM public.mascot_elections WHERE id = 1) IS NOT NULL
     OR (SELECT runoff_of FROM public.mascot_elections WHERE id = 1) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: election 1 gained entries or runoff_of';
  END IF;
  IF public.mascot_election_entries(1) <> ARRAY['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_006'] THEN
    RAISE EXCEPTION 'FAIL: election 1 does not hold all six entries in gallery order: %', public.mascot_election_entries(1);
  END IF;
  RAISE NOTICE 'PASS election 1 holds every entry';
END $$;

-- ============================================================================
-- START A RUNOFF: who, and when
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
BEGIN
  BEGIN
    PERFORM public.mascot_admin_start_runoff(ARRAY['art_002', 'art_004']);
    RAISE EXCEPTION 'FAIL: anon started a runoff';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot start a runoff';
  END;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000021","role":"authenticated"}', TRUE);
DO $$
BEGIN
  BEGIN
    PERFORM public.mascot_admin_start_runoff(ARRAY['art_002', 'art_004']);
    RAISE EXCEPTION 'FAIL: a member started a runoff';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS a member cannot start a runoff';
  END;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000024","role":"authenticated"}', TRUE);
DO $$
BEGIN
  BEGIN
    PERFORM public.mascot_admin_start_runoff(ARRAY['art_002', 'art_004']);
    RAISE EXCEPTION 'FAIL: a runoff started from an unpublished vote';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    RAISE NOTICE 'PASS no runoff before the results are published';
  END;
END $$;
RESET ROLE;

UPDATE public.mascot_elections SET status = 'published', published_at = NOW() WHERE id = 1;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000024","role":"authenticated"}', TRUE);
DO $$
DECLARE
  v_bad text[];
BEGIN
  FOREACH v_bad SLICE 1 IN ARRAY ARRAY[[ 'art_002', 'art_002' ], [ 'art_002', '' ], [ 'art_002', 'art_999' ]] LOOP
    BEGIN
      PERFORM public.mascot_admin_start_runoff(v_bad);
      RAISE EXCEPTION 'FAIL: a runoff started with %', v_bad;
    EXCEPTION WHEN SQLSTATE '22023' THEN
      NULL;
    END;
  END LOOP;
  RAISE NOTICE 'PASS a runoff needs two or more real entries from the vote it settles';
END $$;

DO $$
DECLARE
  v_new integer;
BEGIN
  v_new := public.mascot_admin_start_runoff(ARRAY['art_004', 'art_002']);
  IF v_new <> 2 THEN
    RAISE EXCEPTION 'FAIL: the runoff is election %, not 2', v_new;
  END IF;
  RAISE NOTICE 'PASS an admin starts the runoff as election 2';
END $$;

DO $$
BEGIN
  BEGIN
    PERFORM public.mascot_admin_start_runoff(ARRAY['art_002', 'art_004']);
    RAISE EXCEPTION 'FAIL: a second runoff started';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    RAISE NOTICE 'PASS a second press makes no second runoff';
  END;
END $$;
RESET ROLE;

DO $$
DECLARE
  e public.mascot_elections%ROWTYPE;
BEGIN
  SELECT * INTO e FROM public.mascot_elections WHERE id = 2;
  IF e.status <> 'draft' OR e.runoff_of IS DISTINCT FROM 1 OR e.closes_at IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the runoff is not a draft settling election 1';
  END IF;
  IF e.entries <> ARRAY['art_002', 'art_004'] THEN
    RAISE EXCEPTION 'FAIL: runoff entries are %, not art_002 and art_004 in gallery order', e.entries;
  END IF;
  IF (SELECT array_agg(d ORDER BY d) FROM unnest(e.draw_order) d) <> ARRAY['art_002', 'art_004'] THEN
    RAISE EXCEPTION 'FAIL: the runoff draw order % is not its two entries', e.draw_order;
  END IF;
  IF (SELECT status FROM public.mascot_elections WHERE id = 1) <> 'published' THEN
    RAISE EXCEPTION 'FAIL: election 1 is no longer published';
  END IF;
  RAISE NOTICE 'PASS the runoff holds the two entries, a draw order of them, and settles election 1';
END $$;

-- ============================================================================
-- THE GUARD
-- ============================================================================

DO $$
BEGIN
  BEGIN
    UPDATE public.mascot_elections SET entries = ARRAY['art_001', 'art_002'] WHERE id = 2;
    RAISE EXCEPTION 'FAIL: runoff entries changed';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
  BEGIN
    UPDATE public.mascot_elections SET runoff_of = NULL WHERE id = 2;
    RAISE EXCEPTION 'FAIL: runoff_of changed';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
  BEGIN
    INSERT INTO public.mascot_elections (id, status, entries, draw_order) VALUES (90, 'draft', ARRAY['art_001'], ARRAY['art_001']);
    RAISE EXCEPTION 'FAIL: a one-entry election was created';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
  BEGIN
    INSERT INTO public.mascot_elections (id, status, entries, draw_order)
    VALUES (91, 'draft', ARRAY['art_001', 'art_003'], ARRAY['art_001', 'art_002']);
    RAISE EXCEPTION 'FAIL: a draw order of other entries was accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
  BEGIN
    INSERT INTO public.mascot_elections (id, status, runoff_of, draw_order)
    VALUES (92, 'draft', 1, ARRAY['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_006']);
    RAISE EXCEPTION 'FAIL: a runoff without entries was accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
  RAISE NOTICE 'PASS entries and runoff_of are fixed, and a draw order must match the entries';
END $$;

-- ============================================================================
-- VOTING IN THE RUNOFF
-- ============================================================================

UPDATE public.mascot_elections SET status = 'open' WHERE id = 2;

-- voter1 voted in election 1 and may vote again in the runoff.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000021","role":"authenticated"}', TRUE);
DO $$
DECLARE
  r text;
BEGIN
  r := public.mascot_cast_ballot(ARRAY['art_001']);
  IF r <> 'invalid' THEN RAISE EXCEPTION 'FAIL: an entry outside the runoff gave %', r; END IF;
  r := public.mascot_cast_ballot(ARRAY['art_002', 'art_004', 'art_003']);
  IF r <> 'invalid' THEN RAISE EXCEPTION 'FAIL: three ranks in a two-entry runoff gave %', r; END IF;
  r := public.mascot_cast_ballot(ARRAY['art_004']);
  IF r <> 'ok' THEN RAISE EXCEPTION 'FAIL: a runoff ballot gave %', r; END IF;
  r := public.mascot_cast_ballot(ARRAY['art_002']);
  IF r <> 'already_voted' THEN RAISE EXCEPTION 'FAIL: a second runoff ballot gave %', r; END IF;
  IF (SELECT rankings FROM public.mascot_my_ballot()) <> ARRAY['art_004'] THEN
    RAISE EXCEPTION 'FAIL: my ballot is not the runoff ballot';
  END IF;
  RAISE NOTICE 'PASS a first-round voter votes once in the runoff, for a runoff entry only';
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000022","role":"authenticated"}', TRUE);
DO $$
DECLARE
  r text;
BEGIN
  r := public.mascot_cast_ballot(ARRAY['art_002', 'art_004']);
  IF r <> 'ok' THEN RAISE EXCEPTION 'FAIL: ranking both runoff entries gave %', r; END IF;
  RAISE NOTICE 'PASS ranking both runoff entries is accepted';
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.mascot_ballots WHERE election_id = 2) <> 2
     OR (SELECT count(*) FROM public.mascot_ballots WHERE election_id = 1) <> 4 THEN
    RAISE EXCEPTION 'FAIL: runoff ballots landed in the wrong election';
  END IF;
  RAISE NOTICE 'PASS runoff ballots are stored against the runoff';
END $$;

-- ============================================================================
-- WHAT THE PUBLIC SEES
-- ============================================================================

UPDATE public.mascot_ballots SET counted = false WHERE election_id = 1 AND discord_id = '800000000000000024';

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
DECLARE
  v jsonb;
BEGIN
  v := public.mascot_public_ballots_of(1);
  IF v IS NULL OR jsonb_array_length(v -> 'ballots') <> 3 OR (v ->> 'excluded')::int <> 1 THEN
    RAISE EXCEPTION 'FAIL: election 1 ballots as anon: %', v;
  END IF;
  IF v::text ~ 'ro_one|800000000000000021|d0000000' THEN
    RAISE EXCEPTION 'FAIL: the public ballots carry a name or an id';
  END IF;
  IF public.mascot_public_ballots_of(2) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the open runoff''s ballots are public';
  END IF;
  IF public.mascot_public_ballots() IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: 025''s function shows the open runoff';
  END IF;
  IF public.mascot_public_ballots_of(99) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: a missing election returned ballots';
  END IF;
  RAISE NOTICE 'PASS the first vote stays public while the runoff runs, and the runoff stays hidden';
END $$;
RESET ROLE;

DO $$
BEGIN
  IF has_function_privilege('anon', 'public.mascot_election_entries(integer)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.mascot_admin_start_runoff(text[])', 'EXECUTE') IS NOT TRUE
     OR has_function_privilege('anon', 'public.mascot_admin_start_runoff(text[])', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: function grants are wrong';
  END IF;
  RAISE NOTICE 'PASS grants: helper private, runoff start for signed-in callers only (admin checked inside)';
END $$;

-- ============================================================================
-- THE RUNOFF IS NOW THE ONE THE STATUS MOVES REACH
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000024","role":"authenticated"}', TRUE);
DO $$
BEGIN
  PERFORM public.mascot_admin_set_status('closed');
  PERFORM public.mascot_admin_set_status('published');
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT status FROM public.mascot_elections WHERE id = 2) <> 'published'
     OR (SELECT status FROM public.mascot_elections WHERE id = 1) <> 'published' THEN
    RAISE EXCEPTION 'FAIL: the status moves did not act on the runoff alone';
  END IF;
  RAISE NOTICE 'PASS status moves act on the runoff, and election 1 stays published';
END $$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
BEGIN
  IF jsonb_array_length(public.mascot_public_ballots_of(2) -> 'ballots') <> 2
     OR jsonb_array_length(public.mascot_public_ballots() -> 'ballots') <> 2 THEN
    RAISE EXCEPTION 'FAIL: the published runoff ballots are not public';
  END IF;
  RAISE NOTICE 'PASS the published runoff''s ballots are public';
END $$;
RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL MASCOT RUNOFF TESTS PASSED'; END $$;

ROLLBACK;
