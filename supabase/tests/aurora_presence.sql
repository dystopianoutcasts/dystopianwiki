-- Tests for migration 039: presence expires by itself.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL PRESENCE TESTS PASSED", or stops at the first failure.
--
-- now() is fixed for the whole transaction, so "4 minutes ago" stays 4 minutes
-- ago through every check. On a database with real players the file first runs
-- the sweep once (rolled back with everything else) so the sweep's return value
-- below counts the fixtures only.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

SELECT aurora.expire_presence() AS pre_sweep_of_existing_rows;

-- ============================================================================
-- FIXTURES (server 'test-presence', current world w1, ended world w0)
-- ============================================================================

INSERT INTO aurora.servers (id, name, last_seen) VALUES ('test-presence', 'Presence Test', NOW());
INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by)
VALUES ('test-presence', 'w0', 1, 'ended', 'migration'),
       ('test-presence', 'w1', 2, 'current', 'migration');
UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 'test-presence';

INSERT INTO aurora.players (server_id, username, world_id, last_seen, online, is_dead)
VALUES
  ('test-presence', 'fresh',       'w1', NOW() - INTERVAL '30 seconds', TRUE,  FALSE),
  ('test-presence', 'stale',       'w1', NOW() - INTERVAL '4 minutes',  TRUE,  FALSE),
  ('test-presence', 'neverseen',   'w1', NULL,                          TRUE,  FALSE),
  ('test-presence', 'deadfresh',   'w1', NOW() - INTERVAL '20 seconds', TRUE,  TRUE),
  ('test-presence', 'offline',     'w1', NOW() - INTERVAL '1 day',      FALSE, FALSE),
  ('test-presence', 'nullw_stale', NULL, NOW() - INTERVAL '10 minutes', TRUE,  FALSE),
  ('test-presence', 'nullw_fresh', NULL, NOW() - INTERVAL '1 minute',   TRUE,  FALSE),
  ('test-presence', 'oldw_stale',  'w0', NOW() - INTERVAL '2 hours',    TRUE,  FALSE);

-- ============================================================================
-- 1. THE WINDOW AND THE SHAPE OF THE FUNCTIONS
-- ============================================================================

DO $$
BEGIN
  IF aurora.presence_window() <> INTERVAL '3 minutes' THEN
    RAISE EXCEPTION 'FAIL: presence_window() is %', aurora.presence_window();
  END IF;
  IF (SELECT provolatile FROM pg_proc WHERE oid = 'aurora.presence_window()'::regprocedure) <> 'i' THEN
    RAISE EXCEPTION 'FAIL: presence_window() is not IMMUTABLE';
  END IF;
  RAISE NOTICE 'PASS presence_window() is an immutable 3 minutes';

  IF NOT (SELECT prosecdef FROM pg_proc WHERE oid = 'aurora.expire_presence()'::regprocedure) THEN
    RAISE EXCEPTION 'FAIL: expire_presence() is not SECURITY DEFINER';
  END IF;
  IF NOT (SELECT 'search_path=""' = ANY (proconfig) FROM pg_proc WHERE oid = 'aurora.expire_presence()'::regprocedure) THEN
    RAISE EXCEPTION 'FAIL: expire_presence() search_path is not pinned empty';
  END IF;
  RAISE NOTICE 'PASS expire_presence() is SECURITY DEFINER with an empty search_path';
END $$;

-- ============================================================================
-- 2. PRIVILEGES
-- ============================================================================

DO $$
BEGIN
  IF has_function_privilege('anon', 'aurora.expire_presence()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon can execute expire_presence()';
  END IF;
  IF has_function_privilege('authenticated', 'aurora.expire_presence()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: authenticated can execute expire_presence()';
  END IF;
  IF NOT has_function_privilege('service_role', 'aurora.expire_presence()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot execute expire_presence()';
  END IF;
  RAISE NOTICE 'PASS expire_presence(): service_role only';

  IF NOT (has_function_privilege('anon', 'aurora.presence_window()', 'EXECUTE')
      AND has_function_privilege('authenticated', 'aurora.presence_window()', 'EXECUTE')
      AND has_function_privilege('service_role', 'aurora.presence_window()', 'EXECUTE')) THEN
    RAISE EXCEPTION 'FAIL: presence_window() is not executable by anon, authenticated and service_role';
  END IF;
  RAISE NOTICE 'PASS presence_window(): anon, authenticated, service_role';

  IF has_function_privilege('anon', 'aurora.enable_presence_cron()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'aurora.enable_presence_cron()', 'EXECUTE')
     OR has_function_privilege('anon', 'aurora.disable_presence_cron()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'aurora.disable_presence_cron()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: a client role can (un)schedule the presence job';
  END IF;
  RAISE NOTICE 'PASS enable/disable_presence_cron(): no client role';

  IF NOT (has_table_privilege('anon', 'aurora.players_public', 'SELECT')
      AND has_table_privilege('authenticated', 'aurora.players_public', 'SELECT')) THEN
    RAISE EXCEPTION 'FAIL: players_public lost its SELECT grant';
  END IF;
  IF has_table_privilege('anon', 'aurora.players_public', 'INSERT')
     OR has_table_privilege('anon', 'aurora.players_public', 'UPDATE') THEN
    RAISE EXCEPTION 'FAIL: anon can write players_public';
  END IF;
  RAISE NOTICE 'PASS players_public grants survive (SELECT for anon and authenticated, no writes)';

  IF (SELECT string_agg(column_name || ':' || data_type, ',' ORDER BY ordinal_position)
        FROM information_schema.columns
       WHERE table_schema = 'aurora' AND table_name = 'players_public')
     <> 'server_id:text,username:text,display_name:text,last_seen:timestamp with time zone,online:boolean,hours_survived:real,is_dead:boolean' THEN
    RAISE EXCEPTION 'FAIL: players_public columns changed: %',
      (SELECT string_agg(column_name || ':' || data_type, ',' ORDER BY ordinal_position)
         FROM information_schema.columns
        WHERE table_schema = 'aurora' AND table_name = 'players_public');
  END IF;
  RAISE NOTICE 'PASS players_public has the same columns in the same order';
END $$;

-- ============================================================================
-- 3. ANON, BEFORE ANY SWEEP: the read-time guard alone
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  got text;
  s jsonb;
BEGIN
  SELECT string_agg(username || '=' || online::text, ',' ORDER BY username) INTO got
    FROM aurora.players_public WHERE server_id = 'test-presence';
  IF got <> 'deadfresh=true,fresh=true,neverseen=false,nullw_fresh=true,nullw_stale=false,offline=false,stale=false' THEN
    RAISE EXCEPTION 'FAIL: players_public online before the sweep: %', got;
  END IF;
  RAISE NOTICE 'PASS players_public: 4 minutes old, never seen and 10 minutes old (world NULL) read offline before any sweep; fresh read online (the ended world w0 is hidden by 032''s policy)';

  s := aurora.home_summary_tz('test-presence', 'UTC');
  IF (s->>'online_now')::int <> 3 THEN
    RAISE EXCEPTION 'FAIL: online_now % (expected 3: fresh, deadfresh, nullw_fresh)', s->>'online_now';
  END IF;
  RAISE NOTICE 'PASS online_now counts only fresh players (3; dead-but-connected still counted; 6 flagged in the current world)';

  BEGIN
    PERFORM aurora.expire_presence();
    RAISE EXCEPTION 'FAIL: anon executed expire_presence()';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot execute expire_presence()';
  END;
END $$;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.players WHERE server_id = 'test-presence' AND online) <> 7 THEN
    RAISE EXCEPTION 'FAIL: stored flags changed before the sweep';
  END IF;
  RAISE NOTICE 'PASS the stored flag is untouched until the sweep (7 flagged)';
END $$;

-- ============================================================================
-- 4. THE SWEEP (service_role, as the ingest or a caller would)
-- ============================================================================

SET LOCAL ROLE service_role;

DO $$
DECLARE
  n int;
  got text;
BEGIN
  n := aurora.expire_presence();
  IF n <> 4 THEN
    RAISE EXCEPTION 'FAIL: first sweep changed % rows (expected 4: stale, neverseen, nullw_stale, oldw_stale)', n;
  END IF;
  RAISE NOTICE 'PASS the sweep returns the number of rows it changed (4)';

  SELECT string_agg(username, ',' ORDER BY username) INTO got
    FROM aurora.players WHERE server_id = 'test-presence' AND online;
  IF got <> 'deadfresh,fresh,nullw_fresh' THEN
    RAISE EXCEPTION 'FAIL: online after the sweep: %', got;
  END IF;
  RAISE NOTICE 'PASS fresh players stay online; stale, never-seen, world NULL and ended-world rows are swept';

  n := aurora.expire_presence();
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: second sweep changed % rows', n; END IF;
  RAISE NOTICE 'PASS a second sweep changes 0 rows';
END $$;

RESET ROLE;

-- ============================================================================
-- 5. THE SCHEDULE (only where pg_cron is installed)
-- ============================================================================

DO $$
DECLARE
  n int;
BEGIN
  IF to_regclass('cron.job') IS NULL THEN
    RAISE NOTICE 'NOTE no cron schema here: the aurora-presence job is not checked';
  ELSE
    EXECUTE $q$SELECT count(*) FROM cron.job
                WHERE jobname = 'aurora-presence' AND schedule = '* * * * *'
                  AND command LIKE '%aurora.expire_presence()%'$q$ INTO n;
    IF n <> 1 THEN RAISE EXCEPTION 'FAIL: % aurora-presence jobs (expected 1)', n; END IF;
    RAISE NOTICE 'PASS exactly one aurora-presence job, every minute';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL PRESENCE TESTS PASSED'; END $$;

ROLLBACK;
