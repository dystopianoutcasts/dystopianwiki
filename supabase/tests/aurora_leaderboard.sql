-- Tests for migrations 036 and 037: aurora.leaderboard_entries, replace_leaderboard,
-- leaderboard, leaderboard_admin and the two world triggers. The mod-source lists follow
-- 037 (the game window's rules: every entry, zeros and the dead included, ROW_NUMBER
-- ranks, ties by username); the aurora-source assertions are 036's, unchanged.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f) after 032, 034, 035, 036
-- and 037. It seeds fixtures, asserts, and ROLLS BACK. It prints "PASS ..." notices
-- ending in "ALL LEADERBOARD TESTS PASSED", or stops at the first failure.
--
-- "Running 036 / 037 twice is fine" cannot be asserted from inside this file; the run
-- script applies each migration twice before running it.
--
-- Server l-s has two worlds: w1 (ended) and w2 (current). Old-world rows hold huge
-- numbers (dave: 999 kills in lives, 9999 in the mod table) so a leak shows at once.
-- Server l-many holds 12 mod rows for the limit checks. Server l-none has no current
-- world. Server l-u is only touched by the undo check. Server l-p is the owner's
-- screenshot shape (037 parity); server l-big holds 60 mod rows for the 50-row limit.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000361',
   'authenticated', 'authenticated', 'lb-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000362',
   'authenticated', 'authenticated', 'lb-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('l-s',    'Leaderboard Test Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('l-many', 'Many Rows Server',        TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('l-none', 'No World Server',         TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('l-u',    'Undo Server',             TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());

INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at, ended_at) VALUES
  ('l-s',    'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00'),
  ('l-s',    'w2', 2, 'current', 'exporter',  TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL),
  ('l-many', 'w1', 1, 'current', 'exporter',  TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL),
  ('l-none', 'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00'),
  ('l-u',    'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00'),
  ('l-u',    'w2', 2, 'current', 'exporter',  NOW() - INTERVAL '1 hour', NULL);
UPDATE aurora.servers SET current_world_id = 'w2' WHERE id IN ('l-s', 'l-u');
UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 'l-many';

-- bea's display name is blank and gus has no players row: both read display_name null.
INSERT INTO aurora.players (server_id, username, display_name, is_dead, online, hours_survived, world_id) VALUES
  ('l-s', 'skye', 'Skye', FALSE, TRUE,  50.3, 'w2'),
  ('l-s', 'rax',  'Rax',  TRUE,  FALSE, 80,   'w2'),
  ('l-s', 'ann',  'Ann',  FALSE, FALSE, 20,   'w2'),
  ('l-s', 'bea',  '   ',  FALSE, TRUE,  20,   'w2'),
  ('l-s', 'eve',  'Eve',  FALSE, FALSE, 0,    'w2'),
  ('l-s', 'dave', 'Dave', FALSE, FALSE, 999,  'w1');

-- Lives. skye and rax each have a life that ended in a death; eve's first life was
-- closed by inference (the next life began, no death). hal has both: life 1 closed by
-- inference, life 2 by a death, so he counts ONE death. hal never killed anything and
-- has no players row. dave's lives are all in w1.
INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, ended_at, kills) VALUES
  ('l-s', 'w2', 'skye', 1, TIMESTAMPTZ '2026-10-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 05:00:00+00', 300),
  ('l-s', 'w2', 'skye', 2, TIMESTAMPTZ '2026-10-01 06:00:00+00', NULL, 112),
  ('l-s', 'w2', 'rax',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 09:00:00+00', 300),
  ('l-s', 'w2', 'ann',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 100),
  ('l-s', 'w2', 'bea',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 100),
  ('l-s', 'w2', 'gus',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL, 30),
  ('l-s', 'w2', 'eve',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 04:00:00+00', 10),
  ('l-s', 'w2', 'eve',  2, TIMESTAMPTZ '2026-10-01 04:00:00+00', NULL, 5),
  ('l-s', 'w2', 'hal',  1, TIMESTAMPTZ '2026-10-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 02:00:00+00', 0),
  ('l-s', 'w2', 'hal',  2, TIMESTAMPTZ '2026-10-01 02:00:00+00', TIMESTAMPTZ '2026-10-01 03:00:00+00', 0),
  ('l-s', 'w2', 'hal',  3, TIMESTAMPTZ '2026-10-01 03:30:00+00', NULL, 0),
  ('l-s', 'w1', 'dave', 1, TIMESTAMPTZ '2026-09-10 00:00:00+00', TIMESTAMPTZ '2026-09-11 00:00:00+00', 999),
  ('l-s', 'w1', 'dave', 2, TIMESTAMPTZ '2026-09-11 00:00:00+00', TIMESTAMPTZ '2026-09-12 00:00:00+00', 999);

INSERT INTO aurora.deaths (server_id, world_id, username, x, y, t, hours_survived) VALUES
  ('l-s', 'w2', 'skye', 1, 1, TIMESTAMPTZ '2026-10-01 05:00:00+00', 5),
  ('l-s', 'w2', 'rax',  1, 1, TIMESTAMPTZ '2026-10-01 09:00:00+00', 9),
  ('l-s', 'w2', 'hal',  1, 1, TIMESTAMPTZ '2026-10-01 03:00:00+00', 3),
  ('l-s', 'w1', 'dave', 1, 1, TIMESTAMPTZ '2026-09-11 00:00:00+00', 24),
  ('l-s', 'w1', 'dave', 1, 1, TIMESTAMPTZ '2026-09-12 00:00:00+00', 24);

-- A previous world's mod table: must never show while w2 is current.
INSERT INTO aurora.leaderboard_entries (server_id, world_id, username, banked_kills, banked_deaths, live_kills, live_hours, seen_at) VALUES
  ('l-s', 'w1', 'dave', 9999, 99, 9999, 999, TIMESTAMPTZ '2026-09-29 00:00:00+00');

-- 037 parity fixture, the shape of the owner's in-game screenshot: payo has 0 on every
-- tab; moss has banked kills and 0 live; gone is dead, so the game shows 0 hours;
-- ash and bob tie on kills (31) and on hours (5); crusty leads with banked + live.
INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('l-p',   'Parity Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('l-big', 'Sixty Rows',    TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());
INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at, ended_at) VALUES
  ('l-p',   'w1', 1, 'current', 'exporter', TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL),
  ('l-big', 'w1', 1, 'current', 'exporter', TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL);
UPDATE aurora.servers SET current_world_id = 'w1' WHERE id IN ('l-p', 'l-big');
INSERT INTO aurora.players (server_id, username, display_name, is_dead, online, hours_survived, world_id) VALUES
  ('l-p', 'crusty', 'Crusty', FALSE, TRUE,  30, 'w1'),
  ('l-p', 'moss',   'Moss',   FALSE, FALSE, 12, 'w1'),
  ('l-p', 'ash',    'Ash',    FALSE, FALSE, 5,  'w1'),
  ('l-p', 'bob',    'Bob',    FALSE, TRUE,  5,  'w1'),
  ('l-p', 'gone',   'Gone',   TRUE,  FALSE, 0,  'w1'),
  ('l-p', 'payo',   'Payo',   FALSE, TRUE,  2,  'w1');
INSERT INTO aurora.leaderboard_entries (server_id, world_id, username, banked_kills, banked_deaths, live_kills, live_hours, seen_at) VALUES
  ('l-p', 'w1', 'crusty', 53, 2, 23, 30.5, TIMESTAMPTZ '2026-10-03 15:00:00+00'),
  ('l-p', 'w1', 'moss',   40, 1, 0,  12,   TIMESTAMPTZ '2026-10-03 15:00:00+00'),
  ('l-p', 'w1', 'bob',    10, 0, 21, 5,    TIMESTAMPTZ '2026-10-03 15:00:00+00'),
  ('l-p', 'w1', 'ash',    0,  0, 31, 5,    TIMESTAMPTZ '2026-10-03 15:00:00+00'),
  ('l-p', 'w1', 'gone',   15, 3, 0,  0,    TIMESTAMPTZ '2026-10-03 15:00:00+00'),
  ('l-p', 'w1', 'payo',   0,  0, 0,  2.4,  TIMESTAMPTZ '2026-10-03 15:00:00+00');
-- Sixty rows, all different totals (r01 the most), for p_limit 50.
INSERT INTO aurora.leaderboard_entries (server_id, world_id, username, banked_kills, banked_deaths, live_kills, live_hours, seen_at)
SELECT 'l-big', 'w1', 'r' || lpad(g::text, 2, '0'), 1000 - g, 0, 0, 0, TIMESTAMPTZ '2026-10-03 15:00:00+00'
  FROM generate_series(1, 60) g;

-- ============================================================================
-- 1. GRANTS AND SHAPE
-- ============================================================================

DO $$
DECLARE
  r text;
BEGIN
  IF has_table_privilege('anon', 'aurora.leaderboard_entries', 'SELECT')
     OR has_table_privilege('authenticated', 'aurora.leaderboard_entries', 'SELECT')
     OR has_table_privilege('anon', 'aurora.leaderboard_entries', 'INSERT')
     OR has_table_privilege('authenticated', 'aurora.leaderboard_entries', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: a client role has a grant on aurora.leaderboard_entries';
  END IF;
  IF NOT has_table_privilege('service_role', 'aurora.leaderboard_entries', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot write aurora.leaderboard_entries';
  END IF;
  IF NOT (SELECT c.relrowsecurity FROM pg_class c WHERE c.oid = 'aurora.leaderboard_entries'::regclass) THEN
    RAISE EXCEPTION 'FAIL: RLS is off on aurora.leaderboard_entries';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'aurora' AND tablename = 'leaderboard_entries') THEN
    RAISE EXCEPTION 'FAIL: aurora.leaderboard_entries must have no policy';
  END IF;
  IF has_function_privilege('anon', 'aurora.replace_leaderboard(text,text,jsonb,timestamp with time zone)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'aurora.replace_leaderboard(text,text,jsonb,timestamp with time zone)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'aurora.replace_leaderboard(text,text,jsonb,timestamp with time zone)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: replace_leaderboard must be service_role only';
  END IF;
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF NOT has_function_privilege(r, 'aurora.leaderboard(text,int)', 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: % cannot execute leaderboard', r;
    END IF;
  END LOOP;
  IF has_function_privilege('anon', 'aurora.leaderboard_admin(text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'aurora.leaderboard_admin(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: leaderboard_admin must be authenticated, not anon';
  END IF;
  IF has_function_privilege('anon', 'aurora.leaderboard_world_voided()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'aurora.leaderboard_world_voided()', 'EXECUTE')
     OR has_function_privilege('service_role', 'aurora.leaderboard_world_voided()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: the internal leaderboard_world_voided() is executable by a client role';
  END IF;
  IF NOT (SELECT p.prosecdef AND p.provolatile = 's' AND 'search_path=""' = ANY(p.proconfig)
            FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'aurora' AND p.proname = 'leaderboard') THEN
    RAISE EXCEPTION 'FAIL: leaderboard must be STABLE SECURITY DEFINER with search_path ''''';
  END IF;
  IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'aurora' AND p.proname IN ('leaderboard', 'replace_leaderboard', 'leaderboard_admin')) <> 3 THEN
    RAISE EXCEPTION 'FAIL: each 036 function must exist exactly once';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leaderboard_entries_stamp_world')
     OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'worlds_leaderboard_voided') THEN
    RAISE EXCEPTION 'FAIL: a 036 world trigger is missing';
  END IF;
  IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'aurora' AND p.proname = 'kill_leaderboard') <> 1 THEN
    RAISE EXCEPTION 'FAIL: 035''s kill_leaderboard must still exist';
  END IF;
  RAISE NOTICE 'PASS grants and shape: closed table with RLS and no policy, importer service_role only, public function, admin read, internal trigger function';
END $$;

-- ============================================================================
-- 2. AURORA SOURCE (the mod table of the current world is empty), as anon
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  v_got  JSONB;
  v_want JSONB := $j${
    "source": "aurora", "world_seq": 2, "seen_at": null,
    "kills": [
      {"rank": 1, "username": "skye", "display_name": "Skye", "live": 112, "total": 412, "alive": true,  "online": true},
      {"rank": 2, "username": "rax",  "display_name": "Rax",  "live": 0,   "total": 300, "alive": false, "online": false},
      {"rank": 3, "username": "ann",  "display_name": "Ann",  "live": 100, "total": 100, "alive": true,  "online": false},
      {"rank": 3, "username": "bea",  "display_name": null,   "live": 100, "total": 100, "alive": true,  "online": true},
      {"rank": 5, "username": "gus",  "display_name": null,   "live": 30,  "total": 30,  "alive": true,  "online": false},
      {"rank": 6, "username": "eve",  "display_name": "Eve",  "live": 5,   "total": 15,  "alive": true,  "online": false}
    ],
    "deaths": [
      {"rank": 1, "username": "hal",  "display_name": null,   "deaths": 1, "alive": true,  "online": false},
      {"rank": 1, "username": "rax",  "display_name": "Rax",  "deaths": 1, "alive": false, "online": false},
      {"rank": 1, "username": "skye", "display_name": "Skye", "deaths": 1, "alive": true,  "online": true}
    ],
    "survival": [
      {"rank": 1, "username": "skye", "display_name": "Skye", "hours": 50.3, "alive": true, "online": true},
      {"rank": 2, "username": "ann",  "display_name": "Ann",  "hours": 20.0, "alive": true, "online": false},
      {"rank": 2, "username": "bea",  "display_name": null,   "hours": 20.0, "alive": true, "online": true}
    ]
  }$j$;
BEGIN
  v_got := aurora.leaderboard('l-s', 10);
  IF v_got IS DISTINCT FROM v_want THEN
    RAISE EXCEPTION 'FAIL: aurora-source contract mismatch: %', v_got;
  END IF;
  IF aurora.leaderboard('l-s') IS DISTINCT FROM v_want THEN
    RAISE EXCEPTION 'FAIL: default limit is not 10';
  END IF;
  RAISE NOTICE 'PASS aurora source, exact (kills live split, deaths only lives that ended in a death, survival alive only, old world excluded, ties share a rank, display_name null falls through)';
  RAISE NOTICE 'JSON %', v_got;
END $$;

-- Same fixture, 035's totals: the aurora-source kills list is 035's board.
DO $$
DECLARE
  a JSONB := aurora.leaderboard('l-s', 100)->'kills';
  b JSONB := aurora.kill_leaderboard('l-s', 100)->'rows';
BEGIN
  IF (SELECT jsonb_agg(jsonb_build_array(x->'rank', x->'total') ORDER BY i) FROM jsonb_array_elements(a) WITH ORDINALITY q(x, i))
     IS DISTINCT FROM
     (SELECT jsonb_agg(jsonb_build_array(x->'rank', x->'kills') ORDER BY i) FROM jsonb_array_elements(b) WITH ORDINALITY q(x, i)) THEN
    RAISE EXCEPTION 'FAIL: aurora-source kills differ from 035: % vs %', a, b;
  END IF;
  IF (SELECT sum((x->>'total')::int) FROM jsonb_array_elements(a) x) <> (aurora.kill_leaderboard('l-s', 100)->>'total_kills')::int THEN
    RAISE EXCEPTION 'FAIL: aurora-source kill total differs from 035';
  END IF;
  RAISE NOTICE 'PASS aurora source matches 035''s ranks and totals for the same fixture';
END $$;

-- anon cannot read the table behind the function.
DO $$
BEGIN
  BEGIN
    PERFORM count(*) FROM aurora.leaderboard_entries;
    RAISE EXCEPTION 'FAIL: anon read aurora.leaderboard_entries';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read aurora.leaderboard_entries but can call the function';
  END;
END $$;

-- anon cannot write through the importer function.
DO $$
BEGIN
  BEGIN
    PERFORM aurora.replace_leaderboard('l-s', NULL, '[]'::jsonb, NOW());
    RAISE EXCEPTION 'FAIL: anon ran replace_leaderboard';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run replace_leaderboard';
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- 3. replace_leaderboard (as service_role)
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
DECLARE
  n int;
BEGIN
  -- p_world NULL: the trigger stamps w2. ann appears twice (the last one wins), one row
  -- has no username, one a blank one, one a negative number (reads 0).
  n := aurora.replace_leaderboard('l-s', NULL, $j$[
    {"username": "skye",   "banked_kills": 300, "banked_deaths": 1, "live_kills": 181, "live_hours": 176.33},
    {"username": "rax",    "banked_kills": 300, "banked_deaths": 4, "live_kills": 0,   "live_hours": 0},
    {"username": "ann",    "banked_kills": 999, "banked_deaths": 9, "live_kills": 999, "live_hours": 999},
    {"username": "ann",    "banked_kills": 0,   "banked_deaths": 0, "live_kills": 181, "live_hours": 10},
    {"username": "bea",    "banked_kills": 100, "banked_deaths": 0, "live_kills": 81,  "live_hours": 10},
    {"username": "newbie", "banked_kills": 0,   "banked_deaths": 2, "live_kills": 0,   "live_hours": 5},
    {"username": "zero",   "banked_kills": 0,   "banked_deaths": 0, "live_kills": -7,  "live_hours": 0},
    {"banked_kills": 50},
    {"username": "  ",     "banked_kills": 50},
    "not an object"
  ]$j$::jsonb, TIMESTAMPTZ '2026-10-03 12:00:00+00');
  IF n <> 6 THEN
    RAISE EXCEPTION 'FAIL: replace_leaderboard wrote % rows, want 6', n;
  END IF;
  IF (SELECT count(*) FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w2') <> 6
     OR (SELECT live_kills FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND username = 'ann' AND world_id = 'w2') <> 181
     OR (SELECT live_kills FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND username = 'zero') <> 0
     OR (SELECT count(*) FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w1') <> 1 THEN
    RAISE EXCEPTION 'FAIL: stored rows wrong (stamp, last duplicate wins, negative reads 0, old world kept)';
  END IF;
  RAISE NOTICE 'PASS replace_leaderboard: NULL world stamped current, duplicates keep the last, bad rows skipped, negatives 0';

  -- No current world: nothing written (world_id is part of the key).
  IF aurora.replace_leaderboard('l-none', NULL, '[{"username": "x", "banked_kills": 1}]'::jsonb, NOW()) <> 0
     OR EXISTS (SELECT 1 FROM aurora.leaderboard_entries WHERE server_id = 'l-none') THEN
    RAISE EXCEPTION 'FAIL: a server with no world must get no rows';
  END IF;
  -- Not an array, NULL seen_at: no-op.
  IF aurora.replace_leaderboard('l-s', NULL, '{}'::jsonb, NOW()) <> 0
     OR aurora.replace_leaderboard('l-s', NULL, '[]'::jsonb, NULL) <> 0
     OR (SELECT count(*) FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w2') <> 6 THEN
    RAISE EXCEPTION 'FAIL: a non-array or NULL seen_at must change nothing';
  END IF;
  RAISE NOTICE 'PASS replace_leaderboard: no world, a non-array and a NULL seen_at write nothing';

  -- Twelve rows on l-many for the limit checks; ranks 1..12 by total (f01 the most).
  PERFORM aurora.replace_leaderboard('l-many', 'w1',
    (SELECT jsonb_agg(jsonb_build_object('username', 'f' || lpad(g::text, 2, '0'),
                                         'banked_kills', 100 - g, 'banked_deaths', 1,
                                         'live_kills', 0, 'live_hours', 1))
       FROM generate_series(1, 12) g),
    TIMESTAMPTZ '2026-10-03 12:00:00+00');
END $$;
RESET ROLE;

-- ============================================================================
-- 4. MOD SOURCE, as anon
-- ============================================================================

SET LOCAL ROLE anon;
DO $$
DECLARE
  v_got  JSONB;
  v_want JSONB := $j${
    "source": "mod", "world_seq": 2,
    "kills": [
      {"rank": 1, "username": "skye",   "display_name": "Skye", "live": 181, "total": 481, "alive": true,  "online": true},
      {"rank": 2, "username": "rax",    "display_name": "Rax",  "live": 0,   "total": 300, "alive": false, "online": false},
      {"rank": 3, "username": "ann",    "display_name": "Ann",  "live": 181, "total": 181, "alive": true,  "online": false},
      {"rank": 4, "username": "bea",    "display_name": null,   "live": 81,  "total": 181, "alive": true,  "online": true},
      {"rank": 5, "username": "newbie", "display_name": null,   "live": 0,   "total": 0,   "alive": false, "online": false},
      {"rank": 6, "username": "zero",   "display_name": null,   "live": 0,   "total": 0,   "alive": false, "online": false}
    ],
    "deaths": [
      {"rank": 1, "username": "rax",    "display_name": "Rax",  "deaths": 4, "alive": false, "online": false},
      {"rank": 2, "username": "newbie", "display_name": null,   "deaths": 2, "alive": false, "online": false},
      {"rank": 3, "username": "skye",   "display_name": "Skye", "deaths": 1, "alive": true,  "online": true},
      {"rank": 4, "username": "ann",    "display_name": "Ann",  "deaths": 0, "alive": true,  "online": false},
      {"rank": 5, "username": "bea",    "display_name": null,   "deaths": 0, "alive": true,  "online": true},
      {"rank": 6, "username": "zero",   "display_name": null,   "deaths": 0, "alive": false, "online": false}
    ],
    "survival": [
      {"rank": 1, "username": "skye",   "display_name": "Skye", "hours": 176.3, "alive": true,  "online": true},
      {"rank": 2, "username": "ann",    "display_name": "Ann",  "hours": 10.0,  "alive": true,  "online": false},
      {"rank": 3, "username": "bea",    "display_name": null,   "hours": 10.0,  "alive": true,  "online": true},
      {"rank": 4, "username": "newbie", "display_name": null,   "hours": 5.0,   "alive": false, "online": false},
      {"rank": 5, "username": "rax",    "display_name": "Rax",  "hours": 0.0,   "alive": false, "online": false},
      {"rank": 6, "username": "zero",   "display_name": null,   "hours": 0.0,   "alive": false, "online": false}
    ]
  }$j$;
BEGIN
  v_got := aurora.leaderboard('l-s', 10);
  IF (v_got->>'seen_at')::timestamptz IS DISTINCT FROM TIMESTAMPTZ '2026-10-03 12:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: seen_at %', v_got->>'seen_at';
  END IF;
  IF (v_got - 'seen_at') IS DISTINCT FROM v_want THEN
    RAISE EXCEPTION 'FAIL: mod-source contract mismatch: %', v_got;
  END IF;
  RAISE NOTICE 'PASS mod source, exact (037: kills rank on banked + live with the live split, deaths banked, survival live hours of everyone, zero rows and the dead listed, ties get consecutive row ranks by username, previous world never shows)';
  RAISE NOTICE 'JSON %', v_got;
END $$;

-- ============================================================================
-- 5. LIMIT CLAMP (l-many: 12 rows in every list)
-- ============================================================================

DO $$
DECLARE
  v JSONB;
BEGIN
  IF jsonb_array_length(aurora.leaderboard('l-many', 0)->'kills') <> 10 THEN RAISE EXCEPTION 'FAIL: limit 0 is not 10'; END IF;
  IF jsonb_array_length(aurora.leaderboard('l-many', -5)->'kills') <> 10 THEN RAISE EXCEPTION 'FAIL: limit -5 is not 10'; END IF;
  IF jsonb_array_length(aurora.leaderboard('l-many', 101)->'kills') <> 10 THEN RAISE EXCEPTION 'FAIL: limit 101 is not 10'; END IF;
  IF jsonb_array_length(aurora.leaderboard('l-many', NULL)->'kills') <> 10 THEN RAISE EXCEPTION 'FAIL: limit NULL is not 10'; END IF;
  v := aurora.leaderboard('l-many', 1);
  IF jsonb_array_length(v->'kills') <> 1 OR jsonb_array_length(v->'deaths') <> 1 OR jsonb_array_length(v->'survival') <> 1 THEN
    RAISE EXCEPTION 'FAIL: limit 1 (037: survival lists everyone, alive or not, so it has one row too): %', v;
  END IF;
  IF v->'kills'->0->>'username' <> 'f01' OR (v->'kills'->0->>'total')::int <> 99 THEN
    RAISE EXCEPTION 'FAIL: limit 1 must return the leader';
  END IF;
  v := aurora.leaderboard('l-many', 100);
  IF jsonb_array_length(v->'kills') <> 12 OR jsonb_array_length(v->'deaths') <> 12 THEN
    RAISE EXCEPTION 'FAIL: limit 100 should return all 12';
  END IF;
  -- Twelve equal death counts (mod source, 037): ranks 1..12 by row, ordered by username.
  IF (SELECT string_agg((x->>'rank') || ':' || (x->>'username'), ',' ORDER BY i)
        FROM jsonb_array_elements(v->'deaths') WITH ORDINALITY q(x, i))
     <> '1:f01,2:f02,3:f03,4:f04,5:f05,6:f06,7:f07,8:f08,9:f09,10:f10,11:f11,12:f12' THEN
    RAISE EXCEPTION 'FAIL: a 12-way tie must get ranks 1..12 in username order: %', v->'deaths';
  END IF;
  RAISE NOTICE 'PASS limit clamp (0, -5, 101, NULL -> 10; 1 and 100 honoured) and a wide tie numbered by row';
END $$;

-- ============================================================================
-- 5b. PARITY WITH THE GAME'S WINDOW (037; l-p, the screenshot shape; l-big, 60 rows)
-- ============================================================================

DO $$
DECLARE
  v_got  JSONB;
  v_want JSONB := $j${
    "source": "mod", "world_seq": 1,
    "kills": [
      {"rank": 1, "username": "crusty", "display_name": "Crusty", "live": 23, "total": 76, "alive": true,  "online": true},
      {"rank": 2, "username": "moss",   "display_name": "Moss",   "live": 0,  "total": 40, "alive": true,  "online": false},
      {"rank": 3, "username": "ash",    "display_name": "Ash",    "live": 31, "total": 31, "alive": true,  "online": false},
      {"rank": 4, "username": "bob",    "display_name": "Bob",    "live": 21, "total": 31, "alive": true,  "online": true},
      {"rank": 5, "username": "gone",   "display_name": "Gone",   "live": 0,  "total": 15, "alive": false, "online": false},
      {"rank": 6, "username": "payo",   "display_name": "Payo",   "live": 0,  "total": 0,  "alive": true,  "online": true}
    ],
    "deaths": [
      {"rank": 1, "username": "gone",   "display_name": "Gone",   "deaths": 3, "alive": false, "online": false},
      {"rank": 2, "username": "crusty", "display_name": "Crusty", "deaths": 2, "alive": true,  "online": true},
      {"rank": 3, "username": "moss",   "display_name": "Moss",   "deaths": 1, "alive": true,  "online": false},
      {"rank": 4, "username": "ash",    "display_name": "Ash",    "deaths": 0, "alive": true,  "online": false},
      {"rank": 5, "username": "bob",    "display_name": "Bob",    "deaths": 0, "alive": true,  "online": true},
      {"rank": 6, "username": "payo",   "display_name": "Payo",   "deaths": 0, "alive": true,  "online": true}
    ],
    "survival": [
      {"rank": 1, "username": "crusty", "display_name": "Crusty", "hours": 30.5, "alive": true,  "online": true},
      {"rank": 2, "username": "moss",   "display_name": "Moss",   "hours": 12.0, "alive": true,  "online": false},
      {"rank": 3, "username": "ash",    "display_name": "Ash",    "hours": 5.0,  "alive": true,  "online": false},
      {"rank": 4, "username": "bob",    "display_name": "Bob",    "hours": 5.0,  "alive": true,  "online": true},
      {"rank": 5, "username": "payo",   "display_name": "Payo",   "hours": 2.4,  "alive": true,  "online": true},
      {"rank": 6, "username": "gone",   "display_name": "Gone",   "hours": 0.0,  "alive": false, "online": false}
    ]
  }$j$;
  v JSONB;
BEGIN
  v_got := aurora.leaderboard('l-p', 50);
  IF (v_got->>'seen_at')::timestamptz IS DISTINCT FROM TIMESTAMPTZ '2026-10-03 15:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: parity seen_at %', v_got->>'seen_at';
  END IF;
  IF (v_got - 'seen_at') IS DISTINCT FROM v_want THEN
    RAISE EXCEPTION 'FAIL: parity contract mismatch: %', v_got;
  END IF;
  RAISE NOTICE 'PASS parity, exact (payo 0 on every tab is listed; moss banked with live 0; gone dead, on survival with 0 hours and alive false; ash and bob tied on kills and hours get consecutive ranks, ash first)';

  -- Individual claims, so a failure names the rule it breaks.
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v_got->'kills') x WHERE x->>'username' = 'payo' AND (x->>'total')::int = 0) THEN
    RAISE EXCEPTION 'FAIL: zero-row: payo (0 kills) missing from the mod-source kills list';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v_got->'survival') x
                  WHERE x->>'username' = 'gone' AND (x->>'hours')::numeric = 0 AND (x->>'alive')::boolean = FALSE) THEN
    RAISE EXCEPTION 'FAIL: the dead player is not on survival with 0 hours and alive false';
  END IF;
  IF (SELECT string_agg((x->>'rank') || ':' || (x->>'username'), ',' ORDER BY i)
        FROM jsonb_array_elements(v_got->'kills') WITH ORDINALITY q(x, i) WHERE x->>'total' = '31') <> '3:ash,4:bob' THEN
    RAISE EXCEPTION 'FAIL: tie: equal totals must get distinct consecutive ranks by username: %', v_got->'kills';
  END IF;
  RAISE NOTICE 'PASS parity rules: zero row present, dead player on survival, ties numbered by row';

  -- p_limit 50 returns 50 of 60; the default stays 10; 100 returns all 60.
  v := aurora.leaderboard('l-big', 50);
  IF jsonb_array_length(v->'kills') <> 50 OR jsonb_array_length(v->'deaths') <> 50 OR jsonb_array_length(v->'survival') <> 50 THEN
    RAISE EXCEPTION 'FAIL: p_limit 50 must return 50 rows per list: % % %',
      jsonb_array_length(v->'kills'), jsonb_array_length(v->'deaths'), jsonb_array_length(v->'survival');
  END IF;
  IF v->'kills'->0->>'username' <> 'r01' OR (v->'kills'->49->>'rank')::int <> 50 OR v->'kills'->49->>'username' <> 'r50' THEN
    RAISE EXCEPTION 'FAIL: p_limit 50 must be the top 50, ranked 1..50: %', v->'kills'->49;
  END IF;
  IF jsonb_array_length(aurora.leaderboard('l-big')->'kills') <> 10
     OR jsonb_array_length(aurora.leaderboard('l-big', 100)->'kills') <> 60
     OR jsonb_array_length(aurora.leaderboard('l-p', 50)->'kills') <> 6 THEN
    RAISE EXCEPTION 'FAIL: default 10, limit 100 = all 60, limit 50 on 6 rows = 6';
  END IF;
  RAISE NOTICE 'PASS p_limit 50 returns up to 50 (50 of 60, 6 of 6), the default stays 10';
  RAISE NOTICE 'JSON %', v_got;
END $$;

-- ============================================================================
-- 6. NO WORLD, UNKNOWN SERVER
-- ============================================================================

DO $$
DECLARE
  v_empty JSONB := '{"source": "aurora", "world_seq": null, "seen_at": null, "kills": [], "deaths": [], "survival": []}';
BEGIN
  IF aurora.leaderboard('nope', 10) IS DISTINCT FROM v_empty
     OR aurora.leaderboard(NULL, 10) IS DISTINCT FROM v_empty
     OR aurora.leaderboard('l-none', 10) IS DISTINCT FROM v_empty THEN
    RAISE EXCEPTION 'FAIL: unknown / NULL / worldless server: % %', aurora.leaderboard('nope', 10), aurora.leaderboard('l-none', 10);
  END IF;
  RAISE NOTICE 'PASS unknown, NULL and worldless servers return every key, empty';
END $$;
RESET ROLE;

-- ============================================================================
-- 7. ADMIN READ
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000361","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.leaderboard_admin('l-s')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a member reads leaderboard_admin';
  END IF;
  RAISE NOTICE 'PASS leaderboard_admin: a member gets zero rows';
END $$;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000362","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (SELECT string_agg(username || ':' || banked_kills || ':' || live_kills, ',' ORDER BY username) FROM aurora.leaderboard_admin('l-s'))
     <> 'ann:0:181,bea:100:81,newbie:0:0,rax:300:0,skye:300:181,zero:0:0' THEN
    RAISE EXCEPTION 'FAIL: leaderboard_admin rows: %', (SELECT string_agg(username, ',') FROM aurora.leaderboard_admin('l-s'));
  END IF;
  RAISE NOTICE 'PASS leaderboard_admin: an admin gets the current world''s raw rows (the zero row included, the old world not)';
END $$;
RESET ROLE;

-- ============================================================================
-- 8. A SMALLER TABLE DELETES; AN EMPTY ONE FALLS BACK TO AURORA
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
BEGIN
  PERFORM aurora.replace_leaderboard('l-s', 'w2',
    '[{"username": "skye", "banked_kills": 1, "banked_deaths": 0, "live_kills": 2, "live_hours": 3}]'::jsonb,
    TIMESTAMPTZ '2026-10-03 13:00:00+00');
  IF (SELECT string_agg(username, ',') FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w2') <> 'skye'
     OR (SELECT count(*) FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w1') <> 1 THEN
    RAISE EXCEPTION 'FAIL: a smaller table must delete the missing rows of this world only';
  END IF;
  IF (aurora.leaderboard('l-s', 10)->'kills'->0->>'total')::int <> 3 THEN
    RAISE EXCEPTION 'FAIL: the board must follow the new table';
  END IF;
  PERFORM aurora.replace_leaderboard('l-s', NULL, '[]'::jsonb, TIMESTAMPTZ '2026-10-03 14:00:00+00');
  IF EXISTS (SELECT 1 FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w2')
     OR (SELECT count(*) FROM aurora.leaderboard_entries WHERE server_id = 'l-s' AND world_id = 'w1') <> 1 THEN
    RAISE EXCEPTION 'FAIL: an empty table must empty this world only';
  END IF;
  IF aurora.leaderboard('l-s', 10)->>'source' <> 'aurora'
     OR (aurora.leaderboard('l-s', 10)->'kills'->0->>'total')::int <> 412 THEN
    RAISE EXCEPTION 'FAIL: an empty mod table (with an old world''s rows stored) must fall back to aurora: %', aurora.leaderboard('l-s', 10);
  END IF;
  RAISE NOTICE 'PASS a smaller table deletes the missing rows, an empty one empties the world and the board falls back to aurora';
END $$;
RESET ROLE;

-- ============================================================================
-- 9. WORLD SWITCH: the current world decides
-- ============================================================================

DO $$
BEGIN
  UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 'l-s';
  IF aurora.leaderboard('l-s', 10)->>'source' <> 'mod'
     OR aurora.leaderboard('l-s', 10)->'kills'->0->>'username' <> 'dave'
     OR (aurora.leaderboard('l-s', 10)->>'world_seq')::int <> 1 THEN
    RAISE EXCEPTION 'FAIL: switching the current world must switch the board: %', aurora.leaderboard('l-s', 10);
  END IF;
  UPDATE aurora.servers SET current_world_id = 'w2' WHERE id = 'l-s';
  RAISE NOTICE 'PASS the current world decides which table shows';
END $$;

-- ============================================================================
-- 10. UNDO: the voided world's table replaces the reopened world's
-- ============================================================================

INSERT INTO aurora.leaderboard_entries (server_id, world_id, username, banked_kills, seen_at) VALUES
  ('l-u', 'w1', 'zed', 1, NOW() - INTERVAL '2 days'),
  ('l-u', 'w1', 'old', 1, NOW() - INTERVAL '2 days'),
  ('l-u', 'w2', 'zed', 7, NOW());
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000362","role":"authenticated"}', TRUE);
SELECT aurora.undo_new_world('l-u');
RESET ROLE;
DO $$
BEGIN
  IF (SELECT current_world_id FROM aurora.servers WHERE id = 'l-u') <> 'w1'
     OR (SELECT string_agg(world_id || ':' || username || ':' || banked_kills, ',') FROM aurora.leaderboard_entries WHERE server_id = 'l-u') <> 'w1:zed:7' THEN
    RAISE EXCEPTION 'FAIL: undo must move the voided world''s table onto the reopened world: %',
      (SELECT string_agg(world_id || ':' || username || ':' || banked_kills, ',') FROM aurora.leaderboard_entries WHERE server_id = 'l-u');
  END IF;
  IF (SELECT count(*) FROM aurora.leaderboard_entries WHERE server_id = 'l-s') <> 1 THEN
    RAISE EXCEPTION 'FAIL: the undo touched another server';
  END IF;
  RAISE NOTICE 'PASS undo_new_world: the voided world''s table replaces the reopened world''s';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL LEADERBOARD TESTS PASSED'; END $$;

ROLLBACK;
