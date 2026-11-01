-- Tests for migration 044: housekeeping.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL HOUSEKEEPING TESTS PASSED", or stops at the first failure.
--
-- On a database with real rows the file first runs the cleanup once (rolled back with
-- everything else), so the counts below are the fixtures' alone. Where pg_cron is
-- missing, a stand-in cron.job_run_details is created inside the transaction.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

SELECT aurora.housekeeping() AS pre_run_on_existing_rows;

DO $$
BEGIN
  IF to_regclass('cron.job_run_details') IS NULL THEN
    CREATE SCHEMA IF NOT EXISTS cron;
    CREATE TABLE cron.job_run_details (runid BIGSERIAL PRIMARY KEY, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ);
    RAISE NOTICE 'NOTE no pg_cron here: a stand-in cron.job_run_details is used';
  END IF;
END $$;

-- ============================================================================
-- FIXTURES
--   server hk-a: samples at 10 d, 9 d (old, deleted), 5 d (slimmed), 4 d (slimmed, its
--     kill count is not a number), 1 d and 1 h (kept whole).
--   server hk-b: one sample, 30 days old: its newest, so kept whole.
--   history: alice at 10 d and 1 d; bob only at 20 d (his newest, kept); carol at 9 d
--     and 8 d on hk-a (both old; only the 8 d one is her newest).
--   cron: rows ended 5 d, 3 d and 1 h ago.
-- ============================================================================

INSERT INTO aurora.servers (id, name, last_seen) VALUES ('hk-a', 'Housekeeping A', NOW()), ('hk-b', 'Housekeeping B', NOW());

INSERT INTO aurora.health_samples (server_id, t, players, raw) VALUES
  ('hk-a', NOW() - INTERVAL '10 days', 1, '{"game": {"zombies-killed": 10, "days": 1}, "net": {"x": 1}}'),
  ('hk-a', NOW() - INTERVAL '9 days',  1, '{"game": {"zombies-killed": 11}}'),
  ('hk-a', NOW() - INTERVAL '5 days',  2, '{"game": {"zombies-killed": 50, "days": 4}, "net": {"x": 2}}'),
  ('hk-a', NOW() - INTERVAL '4 days',  2, '{"game": {"zombies-killed": "n/a"}, "net": {"x": 3}}'),
  ('hk-a', NOW() - INTERVAL '1 day',   3, '{"game": {"zombies-killed": 90, "days": 8}, "net": {"x": 4}}'),
  ('hk-a', NOW() - INTERVAL '1 hour',  3, '{"game": {"zombies-killed": 95, "days": 9}, "net": {"x": 5}}'),
  ('hk-b', NOW() - INTERVAL '30 days', 0, '{"game": {"zombies-killed": 7, "days": 2}, "net": {"x": 6}}');

INSERT INTO aurora.player_position_history (server_id, username, x, y, z, t) VALUES
  ('hk-a', 'alice', 1, 1, 0, NOW() - INTERVAL '10 days'),
  ('hk-a', 'alice', 2, 2, 0, NOW() - INTERVAL '1 day'),
  ('hk-a', 'bob',   3, 3, 0, NOW() - INTERVAL '20 days'),
  ('hk-a', 'carol', 4, 4, 0, NOW() - INTERVAL '9 days'),
  ('hk-a', 'carol', 5, 5, 0, NOW() - INTERVAL '8 days');

INSERT INTO cron.job_run_details (start_time, end_time) VALUES
  (NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- ============================================================================
-- 1. SHAPE AND GRANTS
-- ============================================================================

DO $$
DECLARE
  f REGPROCEDURE := 'aurora.housekeeping(int, int, int, int)'::regprocedure;
BEGIN
  IF NOT (SELECT prosecdef FROM pg_proc WHERE oid = f) THEN
    RAISE EXCEPTION 'FAIL: housekeeping() is not SECURITY DEFINER';
  END IF;
  IF NOT (SELECT 'search_path=""' = ANY (proconfig) FROM pg_proc WHERE oid = f) THEN
    RAISE EXCEPTION 'FAIL: housekeeping() search_path is not pinned empty';
  END IF;
  IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('authenticated', f, 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon or authenticated may run housekeeping()';
  END IF;
  IF NOT has_function_privilege('service_role', f, 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: service_role may not run housekeeping()';
  END IF;
  RAISE NOTICE 'PASS housekeeping() is SECURITY DEFINER, empty search_path, service_role only';
END $$;

-- Windows that would cut into what the site reads are refused.
DO $$
DECLARE
  bad INT[];
  ok BOOLEAN;
BEGIN
  FOREACH bad SLICE 1 IN ARRAY ARRAY[[7, 3, 7, 2], [8, 2, 7, 2], [8, 9, 7, 2], [8, 3, 0, 2], [8, 3, 7, 0]] LOOP
    ok := FALSE;
    BEGIN
      PERFORM aurora.housekeeping(bad[1], bad[2], bad[3], bad[4]);
    EXCEPTION WHEN raise_exception THEN ok := TRUE;
    END;
    IF NOT ok THEN RAISE EXCEPTION 'FAIL: housekeeping(%) was accepted', bad; END IF;
  END LOOP;
  BEGIN
    PERFORM aurora.housekeeping(NULL, 3, 7, 2);
    RAISE EXCEPTION 'FAIL: a NULL window was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'FAIL%' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'PASS windows shorter than the readers need are refused';
END $$;

-- ============================================================================
-- 2. THE RUN
-- ============================================================================

DO $$
DECLARE
  r JSONB := aurora.housekeeping();
BEGIN
  IF (r->>'health_deleted')::INT <> 2 THEN RAISE EXCEPTION 'FAIL: health_deleted %, expected 2', r; END IF;
  IF (r->>'health_slimmed')::INT <> 2 THEN RAISE EXCEPTION 'FAIL: health_slimmed %, expected 2', r; END IF;
  IF (r->>'history_deleted')::INT <> 2 THEN RAISE EXCEPTION 'FAIL: history_deleted %, expected 2', r; END IF;
  IF (r->>'cron_deleted')::INT <> 2 THEN RAISE EXCEPTION 'FAIL: cron_deleted %, expected 2', r; END IF;
  RAISE NOTICE 'PASS the run reports 2 deleted, 2 slimmed, 2 history and 2 cron rows: %', r;
END $$;

DO $$
DECLARE
  n INT;
  v JSONB;
BEGIN
  SELECT count(*) INTO n FROM aurora.health_samples WHERE server_id = 'hk-a' AND t < NOW() - INTERVAL '8 days';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: % hk-a samples older than 8 days remain', n; END IF;

  SELECT raw INTO v FROM aurora.health_samples WHERE server_id = 'hk-a' AND t = NOW() - INTERVAL '5 days';
  IF v IS DISTINCT FROM '{"game": {"zombies-killed": 50}}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the 5-day sample is %, expected only its kill count', v;
  END IF;
  SELECT raw INTO v FROM aurora.health_samples WHERE server_id = 'hk-a' AND t = NOW() - INTERVAL '4 days';
  IF v IS NOT NULL THEN RAISE EXCEPTION 'FAIL: the 4-day sample with no numeric kill count is %, expected NULL', v; END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.health_samples WHERE server_id = 'hk-a' AND t = NOW() - INTERVAL '5 days' AND players = 2) THEN
    RAISE EXCEPTION 'FAIL: slimming touched the sample''s other columns';
  END IF;
  RAISE NOTICE 'PASS samples older than 3 days keep only raw.game.zombies-killed, other columns untouched';

  SELECT raw INTO v FROM aurora.health_samples WHERE server_id = 'hk-a' AND t = NOW() - INTERVAL '1 day';
  IF v->'net' IS NULL OR v #>> '{game,days}' IS NULL THEN RAISE EXCEPTION 'FAIL: the 1-day sample lost its raw: %', v; END IF;
  RAISE NOTICE 'PASS samples within 3 days keep their whole raw';

  SELECT raw INTO v FROM aurora.health_samples WHERE server_id = 'hk-b';
  IF v->'net' IS NULL THEN RAISE EXCEPTION 'FAIL: hk-b''s only (newest) sample was deleted or slimmed: %', v; END IF;
  RAISE NOTICE 'PASS a server''s newest sample is kept whole at any age';

  SELECT count(*) INTO n FROM aurora.player_position_history WHERE server_id = 'hk-a' AND username = 'alice';
  IF n <> 1 OR NOT EXISTS (SELECT 1 FROM aurora.player_position_history WHERE username = 'alice' AND x = 2) THEN
    RAISE EXCEPTION 'FAIL: alice has % rows, expected only the 1-day one', n;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.player_position_history WHERE username = 'bob') THEN
    RAISE EXCEPTION 'FAIL: bob''s only (newest) row was deleted';
  END IF;
  SELECT count(*) INTO n FROM aurora.player_position_history WHERE username = 'carol';
  IF n <> 1 OR NOT EXISTS (SELECT 1 FROM aurora.player_position_history WHERE username = 'carol' AND x = 5) THEN
    RAISE EXCEPTION 'FAIL: carol has % rows, expected only her newest (8 days)', n;
  END IF;
  RAISE NOTICE 'PASS history older than 7 days is deleted, each player''s newest row kept';

  SELECT count(*) INTO n FROM cron.job_run_details WHERE end_time < NOW() - INTERVAL '2 days';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: % cron rows older than 2 days remain', n; END IF;
  IF NOT EXISTS (SELECT 1 FROM cron.job_run_details WHERE end_time > NOW() - INTERVAL '2 hours') THEN
    RAISE EXCEPTION 'FAIL: the recent cron row was deleted';
  END IF;
  RAISE NOTICE 'PASS cron.job_run_details older than 2 days is deleted';
END $$;

-- A second run changes nothing: already-slim rows are not rewritten.
DO $$
DECLARE
  r JSONB := aurora.housekeeping();
BEGIN
  IF r <> '{"health_deleted": 0, "health_slimmed": 0, "history_deleted": 0, "cron_deleted": 0}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the second run reported %', r;
  END IF;
  RAISE NOTICE 'PASS a second run changes nothing';
END $$;

-- ============================================================================
-- 3. REALTIME AND THE JOB
-- ============================================================================

DO $$
DECLARE
  n INT;
BEGIN
  SELECT count(*) INTO n FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime' AND schemaname = 'aurora'
     AND tablename IN ('player_positions', 'vehicles', 'health_samples');
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: % aurora tables still in supabase_realtime', n; END IF;
  RAISE NOTICE 'PASS player_positions, vehicles and health_samples are out of supabase_realtime';

  IF to_regclass('cron.job') IS NULL THEN
    RAISE NOTICE 'NOTE no pg_cron here: the aurora-housekeeping job is not checked';
  ELSE
    EXECUTE $q$SELECT count(*) FROM cron.job
                WHERE jobname = 'aurora-housekeeping' AND schedule = '23 9 * * *'
                  AND command LIKE '%aurora.housekeeping()%'$q$ INTO n;
    IF n <> 1 THEN RAISE EXCEPTION 'FAIL: % aurora-housekeeping jobs (expected 1)', n; END IF;
    RAISE NOTICE 'PASS exactly one aurora-housekeeping job, daily at 09:23 UTC';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL HOUSEKEEPING TESTS PASSED'; END $$;

ROLLBACK;
