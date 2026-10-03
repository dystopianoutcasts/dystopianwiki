-- Tests for migration 035: aurora.kill_leaderboard(server, limit).
--
-- Run the whole file as `postgres` (SQL editor, or psql -f) after 032, 034 and 035. It
-- seeds fixtures, asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL KILL LEADERBOARD TESTS PASSED", or stops at the first failure.
--
-- "Running 035 twice is fine" cannot be asserted from inside this file; the run script
-- applies the migration twice before running it.
--
-- Server k-s has two worlds: w1 (ended) and w2 (current). Old-world lives hold huge
-- counts (dave 999, eve 999) so a leak shows at once. Server k-s2 must never leak in.
-- Server k-none has no current world.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('k-s',    'Kill Test Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('k-s2',   'Other Server',     TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('k-none', 'No World Server',  TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());

INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at, ended_at) VALUES
  ('k-s',  'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00'),
  ('k-s',  'w2', 2, 'current', 'exporter',  TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL),
  ('k-s2', 'w2', 1, 'current', 'exporter',  TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL),
  ('k-none', 'w1', 1, 'ended', 'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00');
UPDATE aurora.servers SET current_world_id = 'w2' WHERE id IN ('k-s', 'k-s2');

INSERT INTO aurora.players (server_id, username, display_name, is_dead, online, world_id) VALUES
  ('k-s', 'skye',  'Skye', FALSE, TRUE,  'w2'),
  ('k-s', 'rax',   'Rax',  TRUE,  FALSE, 'w2'),
  ('k-s', 'ann',   'Ann',  FALSE, FALSE, 'w2'),
  ('k-s', 'bea',   'Bea',  FALSE, TRUE,  'w2'),
  ('k-s', 'carol', '   ',  FALSE, FALSE, 'w2'),
  ('k-s', 'dave',  'Dave', FALSE, TRUE,  'w2'),
  ('k-s', 'eve',   'Eve',  FALSE, FALSE, 'w2'),
  ('k-s', 'fay',   'Fay',  TRUE,  FALSE, 'w2');
-- gus has no players row at all.

INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, ended_at, kills) VALUES
  ('k-s', 'w2', 'skye',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 05:00:00+00', 300),
  ('k-s', 'w2', 'skye',  2, TIMESTAMPTZ '2026-10-01 06:00:00+00', NULL, 112),
  ('k-s', 'w2', 'rax',   1, TIMESTAMPTZ '2026-10-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 09:00:00+00', 300),
  ('k-s', 'w2', 'ann',   1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 100),
  ('k-s', 'w2', 'bea',   1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 100),
  ('k-s', 'w2', 'carol', 1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 90),
  ('k-s', 'w1', 'dave',  1, TIMESTAMPTZ '2026-09-10 00:00:00+00', TIMESTAMPTZ '2026-09-11 00:00:00+00', 999),
  ('k-s', 'w2', 'dave',  2, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 0),
  ('k-s', 'w1', 'eve',   1, TIMESTAMPTZ '2026-09-10 00:00:00+00', TIMESTAMPTZ '2026-09-11 00:00:00+00', 999),
  ('k-s', 'w2', 'eve',   2, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 50),
  ('k-s', 'w2', 'fay',   1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 40),
  ('k-s', 'w2', 'gus',   1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 30),
  ('k-s2', 'w2', 'zed',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 777),
  ('k-none', 'w1', 'old', 1, TIMESTAMPTZ '2026-09-10 00:00:00+00', NULL, 555);
-- Twelve fillers, 5 kills each (a tie that is wider than the limit).
INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, ended_at, kills)
SELECT 'k-s', 'w2', 'f' || lpad(g::text, 2, '0'), 1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 5
  FROM generate_series(1, 12) g;

-- k-none has no current world and an untagged life (the stamp trigger leaves it NULL).
INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, ended_at, kills) VALUES
  ('k-none', NULL, 'nul', 1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 7);

-- ============================================================================
-- 1. GRANTS
-- ============================================================================

DO $$
BEGIN
  IF NOT has_function_privilege('anon', 'aurora.kill_leaderboard(text,int)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'aurora.kill_leaderboard(text,int)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'aurora.kill_leaderboard(text,int)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: kill_leaderboard must be executable by anon, authenticated and service_role';
  END IF;
  IF has_table_privilege('anon', 'aurora.lives', 'SELECT') OR has_table_privilege('authenticated', 'aurora.lives', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: a client role can read aurora.lives';
  END IF;
  IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'aurora' AND p.proname = 'kill_leaderboard') <> 1 THEN
    RAISE EXCEPTION 'FAIL: kill_leaderboard must exist exactly once';
  END IF;
  IF NOT (SELECT p.prosecdef AND p.provolatile = 's' AND p.proconfig::text LIKE '%search_path%'
            FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'aurora' AND p.proname = 'kill_leaderboard') THEN
    RAISE EXCEPTION 'FAIL: kill_leaderboard must be STABLE SECURITY DEFINER with a fixed search_path';
  END IF;
  RAISE NOTICE 'PASS grants and shape';
END $$;

-- ============================================================================
-- 2. THE CONTRACT, EXACTLY (as anon)
-- ============================================================================

SET LOCAL ROLE anon;

DO $$
DECLARE
  v_got  JSONB;
  v_want JSONB := $j${
    "world_seq": 2,
    "players": 20,
    "total_kills": 1182,
    "rows": [
      {"rank": 1, "name": "Skye",  "kills": 412, "best_life": 300, "lives": 2, "alive": true,  "online": true},
      {"rank": 2, "name": "Rax",   "kills": 300, "best_life": 300, "lives": 1, "alive": false, "online": false},
      {"rank": 3, "name": "Ann",   "kills": 100, "best_life": 100, "lives": 1, "alive": true,  "online": false},
      {"rank": 3, "name": "Bea",   "kills": 100, "best_life": 100, "lives": 1, "alive": true,  "online": true},
      {"rank": 5, "name": "carol", "kills": 90,  "best_life": 90,  "lives": 1, "alive": true,  "online": false},
      {"rank": 6, "name": "Eve",   "kills": 50,  "best_life": 50,  "lives": 1, "alive": true,  "online": false},
      {"rank": 7, "name": "Fay",   "kills": 40,  "best_life": 40,  "lives": 1, "alive": false, "online": false},
      {"rank": 8, "name": "gus",   "kills": 30,  "best_life": 30,  "lives": 1, "alive": true,  "online": false},
      {"rank": 9, "name": "f01",   "kills": 5,   "best_life": 5,   "lives": 1, "alive": true,  "online": false},
      {"rank": 9, "name": "f02",   "kills": 5,   "best_life": 5,   "lives": 1, "alive": true,  "online": false}
    ]
  }$j$;
BEGIN
  v_got := aurora.kill_leaderboard('k-s', 10);
  IF v_got IS DISTINCT FROM v_want THEN
    RAISE EXCEPTION 'FAIL: contract mismatch: %', v_got;
  END IF;
  IF aurora.kill_leaderboard('k-s') IS DISTINCT FROM v_want THEN
    RAISE EXCEPTION 'FAIL: default limit is not 10';
  END IF;
  RAISE NOTICE 'PASS exact contract (ranking, tie ranks, old world and zero-kill excluded, best_life, lives, alive, online, name fallback)';
  RAISE NOTICE 'JSON %', v_got;
END $$;

-- ============================================================================
-- 3. LIMIT CLAMP; players / total_kills beyond the limit
-- ============================================================================

DO $$
DECLARE
  v JSONB;
BEGIN
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', 0)->'rows') <> 10 THEN RAISE EXCEPTION 'FAIL: limit 0 is not 10'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', -5)->'rows') <> 10 THEN RAISE EXCEPTION 'FAIL: limit -5 is not 10'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', 500)->'rows') <> 10 THEN RAISE EXCEPTION 'FAIL: limit 500 is not 10'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', 101)->'rows') <> 10 THEN RAISE EXCEPTION 'FAIL: limit 101 is not 10'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', NULL)->'rows') <> 10 THEN RAISE EXCEPTION 'FAIL: limit NULL is not 10'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', 1)->'rows') <> 1 THEN RAISE EXCEPTION 'FAIL: limit 1'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', 3)->'rows') <> 3 THEN RAISE EXCEPTION 'FAIL: limit 3'; END IF;
  IF jsonb_array_length(aurora.kill_leaderboard('k-s', 100)->'rows') <> 20 THEN RAISE EXCEPTION 'FAIL: limit 100 should return all 20'; END IF;
  RAISE NOTICE 'PASS limit clamp (0, -5, 101, 500, NULL -> 10; 1, 3, 100 honoured)';

  v := aurora.kill_leaderboard('k-s', 1);
  IF (v->>'players')::int <> 20 OR (v->>'total_kills')::int <> 1182 THEN
    RAISE EXCEPTION 'FAIL: players/total_kills must cover the whole world, got % %', v->>'players', v->>'total_kills';
  END IF;
  IF (v->'rows'->0->>'name') <> 'Skye' THEN RAISE EXCEPTION 'FAIL: limit 1 must return the leader'; END IF;
  RAISE NOTICE 'PASS players and total_kills counted beyond the limit';
END $$;

-- ============================================================================
-- 4. OTHER SERVERS, NO WORLD, EMPTY
-- ============================================================================

DO $$
DECLARE
  v JSONB;
BEGIN
  v := aurora.kill_leaderboard('k-s2', 10);
  IF v IS DISTINCT FROM '{"world_seq": 1, "players": 1, "total_kills": 777, "rows": [{"rank": 1, "name": "zed", "kills": 777, "best_life": 777, "lives": 1, "alive": true, "online": false}]}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: k-s2 leaked or is wrong: %', v;
  END IF;

  v := aurora.kill_leaderboard('k-none', 10);
  IF v IS DISTINCT FROM '{"world_seq": null, "players": 1, "total_kills": 7, "rows": [{"rank": 1, "name": "nul", "kills": 7, "best_life": 7, "lives": 1, "alive": true, "online": false}]}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: k-none wrong: %', v;
  END IF;

  v := aurora.kill_leaderboard('nope', 10);
  IF v IS DISTINCT FROM '{"world_seq": null, "players": 0, "total_kills": 0, "rows": []}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: unknown server wrong: %', v;
  END IF;
  IF aurora.kill_leaderboard(NULL, 10) IS DISTINCT FROM '{"world_seq": null, "players": 0, "total_kills": 0, "rows": []}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: NULL server wrong';
  END IF;
  RAISE NOTICE 'PASS other server, no current world, unknown and NULL server';
END $$;

-- ============================================================================
-- 5. anon cannot read the table behind it
-- ============================================================================

DO $$
BEGIN
  BEGIN
    PERFORM count(*) FROM aurora.lives;
    RAISE EXCEPTION 'FAIL: anon read aurora.lives';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read aurora.lives';
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- 6. A DEATH AND A WORLD SWITCH MOVE THE BOARD
-- ============================================================================

DO $$
DECLARE
  v JSONB;
BEGIN
  UPDATE aurora.lives SET ended_at = NOW() WHERE server_id = 'k-s' AND username = 'ann';
  v := aurora.kill_leaderboard('k-s', 10);
  IF (v->'rows'->2->>'name') <> 'Ann' OR (v->'rows'->2->>'alive')::boolean THEN
    RAISE EXCEPTION 'FAIL: a closed life must read alive=false: %', v->'rows'->2;
  END IF;
  UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 'k-s';
  v := aurora.kill_leaderboard('k-s', 10);
  IF (v->>'players')::int <> 2 OR (v->>'total_kills')::int <> 1998 THEN
    RAISE EXCEPTION 'FAIL: switching the current world must switch the board: %', v;
  END IF;
  RAISE NOTICE 'PASS death flips alive; the current world decides the board';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL KILL LEADERBOARD TESTS PASSED'; END $$;

ROLLBACK;
