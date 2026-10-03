-- Tests for migration 034: season records, lives, kill events and factions.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f) after 032 and 034. It
-- seeds fixtures, asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL SEASON RECORD TESTS PASSED", or stops at the first failure.
--
-- "Running 034 twice is fine" cannot be asserted from inside this file; the run script
-- applies the migration twice before running it.
--
-- Server 'test-s' has two worlds: w1 (ended) and w2 (current). Every old-world row
-- holds a record far beyond the current world's (bob: 999 kills, 999 hours, the
-- earliest death and kill, a 10-member faction), so a leak shows as bob or Ancients.
-- Server 'test-s2' is only touched by the undo check and must never leak in.
-- Times are minutes after 2026-10-01 12:00 UTC (t54.ts).

BEGIN;

SET LOCAL client_min_messages = NOTICE;

CREATE SCHEMA t54;
CREATE FUNCTION t54.ts(p_min NUMERIC) RETURNS TIMESTAMPTZ LANGUAGE sql IMMUTABLE AS $$
  SELECT TIMESTAMPTZ '2026-10-01 12:00:00+00' + make_interval(secs => p_min * 60);
$$;
-- One pos sample as observe_lives reads it. NULL hs or zk is left out of the object.
CREATE FUNCTION t54.s(p_user TEXT, p_min NUMERIC, p_zk INT, p_hs REAL) RETURNS JSONB LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_strip_nulls(jsonb_build_object('username', p_user, 't', t54.ts(p_min), 'zk', p_zk, 'hs', p_hs));
$$;
-- One life as text: life_no:kills:hours:ended(min or -):first_kill(min or -):world
CREATE FUNCTION t54.lives(p_server TEXT, p_user TEXT) RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(string_agg(
           l.life_no || ':' || l.kills || ':' || l.hours || ':'
           || COALESCE((extract(epoch FROM l.ended_at - t54.ts(0)) / 60)::numeric(10,1)::text, '-') || ':'
           || COALESCE((extract(epoch FROM l.first_kill_at - t54.ts(0)) / 60)::numeric(10,1)::text, '-') || ':'
           || COALESCE(l.world_id, 'NULL'), ' ' ORDER BY l.life_no), '')
    FROM aurora.lives l
   WHERE l.server_id = p_server AND l.username = p_user;
$$;
GRANT USAGE ON SCHEMA t54 TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA t54 TO anon, authenticated, service_role;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'season-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'season-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('test-s',  'Season Test Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('test-s2', 'Other Server',       TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());

INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at, ended_at) VALUES
  ('test-s',  'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00'),
  ('test-s',  'w2', 2, 'current', 'exporter',  TIMESTAMPTZ '2026-09-30 00:00:00+00', NULL),
  ('test-s2', 'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-09-30 00:00:00+00'),
  ('test-s2', 'w2', 2, 'current', 'exporter',  NOW() - INTERVAL '1 hour', NULL);
UPDATE aurora.servers SET current_world_id = 'w2' WHERE id IN ('test-s', 'test-s2');

INSERT INTO aurora.players (server_id, username, display_name, is_dead, world_id) VALUES
  ('test-s', 'alice', 'Alice', FALSE, 'w2'),
  ('test-s', 'carol', '',      FALSE, 'w2'),
  ('test-s', 'fay',   'Fay',   FALSE, 'w2'),
  ('test-s', 'bob',   'Bob',   FALSE, 'w2');

-- ============================================================================
-- 1. GRANTS: tables closed, functions as intended
-- ============================================================================

DO $$
DECLARE
  tb text;
  f  text;
BEGIN
  FOREACH tb IN ARRAY ARRAY['aurora.kill_events', 'aurora.lives', 'aurora.factions'] LOOP
    IF has_table_privilege('anon', tb, 'SELECT') OR has_table_privilege('authenticated', tb, 'SELECT')
       OR has_table_privilege('anon', tb, 'INSERT') OR has_table_privilege('authenticated', tb, 'INSERT') THEN
      RAISE EXCEPTION 'FAIL: a client role has a grant on %', tb;
    END IF;
    IF NOT has_table_privilege('service_role', tb, 'INSERT') THEN
      RAISE EXCEPTION 'FAIL: service_role cannot write %', tb;
    END IF;
    IF NOT (SELECT c.relrowsecurity FROM pg_class c WHERE c.oid = tb::regclass) THEN
      RAISE EXCEPTION 'FAIL: RLS is off on %', tb;
    END IF;
  END LOOP;
  IF NOT has_sequence_privilege('service_role', 'aurora.kill_events_id_seq', 'USAGE') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot use the kill_events sequence';
  END IF;
  FOREACH f IN ARRAY ARRAY['aurora.observe_lives(text,text,jsonb)',
                           'aurora.replace_factions(text,text,jsonb,timestamp with time zone)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: a client role may execute %', f;
    END IF;
    IF NOT has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: service_role cannot execute %', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY ARRAY['aurora.kill_events_admin(text,integer)', 'aurora.lives_admin(text)',
                           'aurora.factions_admin(text)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon may execute %', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated cannot execute %', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY ARRAY['aurora.season_stamp_world()', 'aurora.season_world_voided()',
                           'aurora.lives_close_on_death()'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('authenticated', f, 'EXECUTE')
       OR has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: the internal function % is executable by a client role', f;
    END IF;
  END LOOP;
  FOREACH tb IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF NOT has_function_privilege(tb, 'aurora.season_records(text)', 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: % cannot execute season_records', tb;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS grants: three closed tables with RLS, importer RPCs service_role only, admin reads authenticated only, season_records public';
END $$;

-- ============================================================================
-- 2. LIVES: open, maxima, close on a zk drop, an hs drop and a death
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
DECLARE
  n int;
BEGIN
  n := aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 0, 0, 1)));
  IF n <> 1 OR t54.lives('test-s', 'alice') <> '1:0:1:-:-:w2' THEN
    RAISE EXCEPTION 'FAIL: first sample: % -> %', n, t54.lives('test-s', 'alice');
  END IF;
  -- Two samples in one call, applied in array order.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 1, 3, 2), t54.s('alice', 2, 5, 3)));
  IF t54.lives('test-s', 'alice') <> '1:5:3:-:1.0:w2' THEN
    RAISE EXCEPTION 'FAIL: zk 0 -> 3 -> 5: % (first_kill_at must stay at minute 1)', t54.lives('test-s', 'alice');
  END IF;
  -- No zk, hours 0.2 lower (within the 0.5 tolerance): same life, maxima kept.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 3, NULL, 2.8)));
  IF t54.lives('test-s', 'alice') <> '1:5:3:-:1.0:w2' THEN
    RAISE EXCEPTION 'FAIL: kills and hours are not running maxima: %', t54.lives('test-s', 'alice');
  END IF;
  RAISE NOTICE 'PASS lives: first sample opens life 1; kills and hours are maxima; first_kill_at set once, at the 0 -> positive sample';
END $$;

DO $$
BEGIN
  -- zk dropped from 5 to 2: a new character.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 4, 2, 4)));
  IF t54.lives('test-s', 'alice') <> '1:5:3:4.0:1.0:w2 2:2:4:-:4.0:w2' THEN
    RAISE EXCEPTION 'FAIL: zk drop: %', t54.lives('test-s', 'alice');
  END IF;
  -- hours dropped from 4 to 0.5 (more than 0.5), zk equal: a new character.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 5, 2, 0.5)));
  IF t54.lives('test-s', 'alice') <> '1:5:3:4.0:1.0:w2 2:2:4:5.0:4.0:w2 3:2:0.5:-:5.0:w2' THEN
    RAISE EXCEPTION 'FAIL: hs drop: %', t54.lives('test-s', 'alice');
  END IF;
  RAISE NOTICE 'PASS lives: a zk drop and an hs drop each close the open life at the sample time and open the next';
END $$;
RESET ROLE;

-- A death row closes the open life (the trigger on aurora.deaths).
INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived, world_id)
VALUES ('test-s', 'alice', 500, 600, 0, t54.ts(6), 'isdead', 9, 'w2');

SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF t54.lives('test-s', 'alice') <> '1:5:3:4.0:1.0:w2 2:2:4:5.0:4.0:w2 3:2:9:6.0:5.0:w2' THEN
    RAISE EXCEPTION 'FAIL: death: %', t54.lives('test-s', 'alice');
  END IF;
  -- A sample from before the death, arriving after it: folded into life 3.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 5.5, 4, 1)));
  IF t54.lives('test-s', 'alice') <> '1:5:3:4.0:1.0:w2 2:2:4:5.0:4.0:w2 3:4:9:6.0:5.0:w2' THEN
    RAISE EXCEPTION 'FAIL: a pre-death sample: %', t54.lives('test-s', 'alice');
  END IF;
  -- After the death: the next life.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 7, 0, 0.1)));
  -- A replay of the first sample: no new life, nothing changes.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 0, 0, 1)));
  IF t54.lives('test-s', 'alice') <> '1:5:3:4.0:1.0:w2 2:2:4:5.0:4.0:w2 3:4:9:6.0:5.0:w2 4:0:0.1:-:-:w2' THEN
    RAISE EXCEPTION 'FAIL: after the death / replay: %', t54.lives('test-s', 'alice');
  END IF;
  RAISE NOTICE 'PASS lives: a death row closes the life (hours from the death); a pre-death sample folds in; a replayed old sample opens nothing';
END $$;

DO $$
DECLARE
  n int;
BEGIN
  -- Rows without hs and zk, a negative or fractional zk, no username, no t: skipped.
  n := aurora.observe_lives('test-s', 'w2', jsonb_build_array(
         jsonb_build_object('username', 'ghost', 't', t54.ts(1)),
         jsonb_build_object('username', 'ghost', 't', t54.ts(1), 'zk', -1),
         jsonb_build_object('username', 'ghost', 't', t54.ts(1), 'zk', 1.5),
         jsonb_build_object('t', t54.ts(1), 'zk', 1),
         jsonb_build_object('username', 'ghost', 'zk', 1),
         '"not an object"'::jsonb));
  IF n <> 0 OR EXISTS (SELECT 1 FROM aurora.lives WHERE username = 'ghost') THEN
    RAISE EXCEPTION 'FAIL: invalid rows were applied (%)', n;
  END IF;
  IF aurora.observe_lives('test-s', 'w2', '{}'::jsonb) <> 0 OR aurora.observe_lives('test-s', 'w2', NULL) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a non-array is not a no-op';
  END IF;
  RAISE NOTICE 'PASS lives: rows with neither hs nor zk, a negative or fractional zk, or no username or time are skipped';
END $$;

DO $$
BEGIN
  -- fay: life 1, then a new life inferred from an hs drop at minute 2 ...
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('fay', 0, NULL, 1), t54.s('fay', 2, NULL, 0.1)));
  IF t54.lives('test-s', 'fay') <> '1:0:1:2.0:-:w2 2:0:0.1:-:-:w2' THEN
    RAISE EXCEPTION 'FAIL: fay inferred: %', t54.lives('test-s', 'fay');
  END IF;
END $$;
RESET ROLE;
-- ... then her death at minute 1 arrives late: life 1 ends at the death, not the inference.
INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived, world_id)
VALUES ('test-s', 'fay', 111, 222, 0, t54.ts(1), 'chardeath', 1.5, 'w2');
-- The same death again (a replayed log): ON CONFLICT, no second close.
INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived, world_id)
VALUES ('test-s', 'fay', 111, 222, 0, t54.ts(1), 'chardeath', 1.5, 'w2')
ON CONFLICT DO NOTHING;
DO $$
BEGIN
  IF t54.lives('test-s', 'fay') <> '1:0:1.5:1.0:-:w2 2:0:0.1:-:-:w2' THEN
    RAISE EXCEPTION 'FAIL: a late death does not end the inferred life at the death: %', t54.lives('test-s', 'fay');
  END IF;
  RAISE NOTICE 'PASS lives: a late death ends the life it falls in at the death time; the open next life is untouched';
END $$;

-- gus: the backfill order. A file's death is written BEFORE its samples (the trigger
-- finds no life), and the sample after the death shows no drop at all: the stored
-- death alone ends life 1 at the death, with the death's hours.
INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived, world_id)
VALUES ('test-s', 'gus', 5, 5, 0, t54.ts(3), 'isdead', 2.5, 'w2');
SET LOCAL ROLE service_role;
DO $$
BEGIN
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(
    t54.s('gus', 0, 0, 1), t54.s('gus', 2, 2, 2), t54.s('gus', 4, 2, 3)));
  IF t54.lives('test-s', 'gus') <> '1:2:2.5:3.0:2.0:w2 2:2:3:-:4.0:w2' THEN
    RAISE EXCEPTION 'FAIL: a stored death does not end the life on replay: %', t54.lives('test-s', 'gus');
  END IF;
  -- The same samples again: nothing changes.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(
    t54.s('gus', 0, 0, 1), t54.s('gus', 2, 2, 2), t54.s('gus', 4, 2, 3)));
  IF t54.lives('test-s', 'gus') <> '1:2:2.5:3.0:2.0:w2 2:2:3:-:4.0:w2' THEN
    RAISE EXCEPTION 'FAIL: replaying the samples changed gus: %', t54.lives('test-s', 'gus');
  END IF;
  RAISE NOTICE 'PASS lives: a death stored before its samples (the backfill order) ends the life at the death; a second replay changes nothing';
END $$;
RESET ROLE;

-- ============================================================================
-- 3. THE TWO WORLDS
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
BEGIN
  -- bob's old-world life: huge numbers, never a current record.
  PERFORM aurora.observe_lives('test-s', 'w1', jsonb_build_array(t54.s('bob', -100, 999, 999)));
  -- bob in the current world with HIGHER zk and hours (no drop at all): still a new
  -- life, because a life is one world.
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('bob', 9, 1000, 1000)));
  IF t54.lives('test-s', 'bob') <> '1:999:999:9.0:-100.0:w1 2:1000:1000:-:9.0:w2' THEN
    RAISE EXCEPTION 'FAIL: world change: %', t54.lives('test-s', 'bob');
  END IF;
  -- A NULL p_world means the server's current world.
  PERFORM aurora.observe_lives('test-s', NULL, jsonb_build_array(t54.s('bob', 10, 0, 0.1)));
  IF t54.lives('test-s', 'bob') <> '1:999:999:9.0:-100.0:w1 2:1000:1000:10.0:9.0:w2 3:0:0.1:-:-:w2' THEN
    RAISE EXCEPTION 'FAIL: NULL p_world: %', t54.lives('test-s', 'bob');
  END IF;
  RAISE NOTICE 'PASS lives: a sample in another world closes the open life and opens the next; NULL p_world is the current world';
END $$;
RESET ROLE;
-- bob's w2 lives are removed again: the old world (w1) is his only record.
DELETE FROM aurora.lives WHERE server_id = 'test-s' AND username = 'bob' AND world_id = 'w2';
UPDATE aurora.lives SET ended_at = t54.ts(-50) WHERE server_id = 'test-s' AND username = 'bob';
INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived, world_id)
VALUES ('test-s', 'bob', 1, 1, 0, t54.ts(-50), 'isdead', 999, 'w1');
INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t) VALUES
  ('test-s', 'w1', 'bob', 1, 1, 0, t54.ts(-99));
-- An untagged kill row is stamped with the current world.
INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t) VALUES
  ('test-s', NULL, 'alice', 300, 400, 0, t54.ts(0.5));
DO $$
BEGIN
  IF (SELECT world_id FROM aurora.kill_events WHERE server_id = 'test-s' AND username = 'alice') IS DISTINCT FROM 'w2' THEN
    RAISE EXCEPTION 'FAIL: an untagged kill_events row is not stamped with the current world';
  END IF;
  -- The unique key: the same kill twice is one row.
  INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t) VALUES
    ('test-s', 'w2', 'alice', 300, 400, 0, t54.ts(0.5))
  ON CONFLICT (server_id, username, t, x, y) DO NOTHING;
  IF (SELECT count(*) FROM aurora.kill_events WHERE server_id = 'test-s' AND username = 'alice') <> 1 THEN
    RAISE EXCEPTION 'FAIL: a duplicate kill event was stored';
  END IF;
  RAISE NOTICE 'PASS kill_events: an untagged row gets the current world; the unique key holds a replay to one row';
END $$;

-- ============================================================================
-- 4. FACTIONS
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
DECLARE
  n int;
BEGIN
  n := aurora.replace_factions('test-s', 'w2', '[
      {"name":"Bears","tag":"","owner":"kim","members":["kim","lou"]},
      {"name":"Wolves","tag":"WLF","owner":"zed","members":["abe","mia","zed"]},
      {"name":"Gone","tag":"G","owner":"x","members":["x"]}]'::jsonb, t54.ts(0));
  IF n <> 3 OR (SELECT count(*) FROM aurora.factions WHERE server_id = 'test-s') <> 3 THEN
    RAISE EXCEPTION 'FAIL: the first list wrote % rows', n;
  END IF;
  IF (SELECT tag FROM aurora.factions WHERE server_id = 'test-s' AND name = 'Bears') IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: an empty tag is not NULL';
  END IF;
  -- The second list drops Gone: it is deleted.
  PERFORM aurora.replace_factions('test-s', 'w2', '[
      {"name":"Bears","tag":"","owner":"kim","members":["kim","lou"]},
      {"name":"Wolves","tag":"WLF","owner":"zed","members":["abe","mia","zed"]}]'::jsonb, t54.ts(10));
  IF (SELECT string_agg(name, ',' ORDER BY name) FROM aurora.factions WHERE server_id = 'test-s') <> 'Bears,Wolves' THEN
    RAISE EXCEPTION 'FAIL: replace_factions kept a stale row: %',
      (SELECT string_agg(name, ',' ORDER BY name) FROM aurora.factions WHERE server_id = 'test-s');
  END IF;
  -- An empty list: every faction disbanded.
  PERFORM aurora.replace_factions('test-s', 'w2', '[]'::jsonb, t54.ts(20));
  IF EXISTS (SELECT 1 FROM aurora.factions WHERE server_id = 'test-s') THEN
    RAISE EXCEPTION 'FAIL: an empty list did not delete every faction';
  END IF;
  -- The fixture for the records: Owls' owner is not in its member list (counted once).
  PERFORM aurora.replace_factions('test-s', 'w2', '[
      {"name":"Bears","tag":"","owner":"kim","members":["kim","lou"]},
      {"name":"Wolves","tag":"WLF","owner":"zed","members":["abe","mia","zed"]},
      {"name":"Owls","tag":"OWL","owner":"ann","members":["bo","cy"]}]'::jsonb, t54.ts(30));
  IF (SELECT count(*) FROM aurora.factions WHERE server_id = 'test-s' AND world_id = 'w2' AND seen_at = t54.ts(30)) <> 3 THEN
    RAISE EXCEPTION 'FAIL: the fixture list';
  END IF;
  RAISE NOTICE 'PASS replace_factions: full-list upsert, stale rows deleted, an empty list deletes all, empty tag is NULL';
END $$;
RESET ROLE;
-- The old world's giant faction (seen in the future so no replace removes it).
INSERT INTO aurora.factions (server_id, world_id, name, tag, owner, members, seen_at) VALUES
  ('test-s', 'w1', 'Ancients', 'OLD', 'bob', ARRAY['a','b','c','d','e','f','g','h','i','bob'], t54.ts(100000));

-- ============================================================================
-- 5. THE RECORD FIXTURE (current world w2)
-- ============================================================================
-- alice: lives 5 + 2 + 4 + 0 = 11 kills; life 3 lasted 9 hours (dead).
-- carol: one open life, 6 kills at her first sample (minute 0), 2 hours.
-- aaron: one life of 6 kills and 9 hours that started LATER than carol's and alice's
--        life 3: the ties go to the earlier start, though 'aaron' sorts first.
-- erin:  lives 5 + 6 = 11 kills, the season tie with alice: the name decides (alice).
-- fay:   the earliest current-world death (minute 1).

SET LOCAL ROLE service_role;
DO $$
BEGIN
  PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(
    t54.s('carol', 0, 6, 2),
    t54.s('aaron', 8, 6, 9),
    t54.s('erin', 11, 5, 1),
    t54.s('erin', 12, 6, 0.1)));
  IF t54.lives('test-s', 'erin') <> '1:5:1:12.0:11.0:w2 2:6:0.1:-:12.0:w2' THEN
    RAISE EXCEPTION 'FAIL: erin fixture: %', t54.lives('test-s', 'erin');
  END IF;
END $$;
RESET ROLE;
-- A later kill event for carol; alice's (minute 0.5) stays the first.
INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t) VALUES
  ('test-s', 'w2', 'carol', 700, 800, 0, t54.ts(2));

-- ============================================================================
-- 6. season_records (as anon)
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
DECLARE
  j jsonb := aurora.season_records('test-s');
  k text;
BEGIN
  FOREACH k IN ARRAY ARRAY['world_seq', 'world_started_at', 'first_death', 'first_kill', 'most_kills_season',
                           'most_kills_one_life', 'longest_life', 'biggest_faction'] LOOP
    IF NOT j ? k THEN RAISE EXCEPTION 'FAIL: key % missing in %', k, j; END IF;
  END LOOP;
  IF (j->>'world_seq')::int <> 2 OR (j->>'world_started_at')::timestamptz <> TIMESTAMPTZ '2026-09-30 00:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: world: %', j;
  END IF;
  IF j->'first_death' <> jsonb_build_object('name', 'Fay', 't', t54.ts(1), 'x', 111, 'y', 222, 'hours_survived', 1.5) THEN
    RAISE EXCEPTION 'FAIL: first_death %', j->'first_death';
  END IF;
  IF j->'first_kill' <> jsonb_build_object('name', 'Alice', 't', t54.ts(0.5), 'x', 300, 'y', 400) THEN
    RAISE EXCEPTION 'FAIL: first_kill %', j->'first_kill';
  END IF;
  IF j->'most_kills_season' <> '{"name":"Alice","kills":11}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: most_kills_season %', j->'most_kills_season';
  END IF;
  IF j->'most_kills_one_life' <> '{"name":"carol","kills":6,"life_no":1,"alive":true}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: most_kills_one_life %', j->'most_kills_one_life';
  END IF;
  IF j->'longest_life' <> jsonb_build_object('name', 'Alice', 'hours', 9.0, 'alive', false, 'started_at', t54.ts(5)) THEN
    RAISE EXCEPTION 'FAIL: longest_life %', j->'longest_life';
  END IF;
  IF j->'biggest_faction' <> '{"name":"Owls","tag":"OWL","owner_name":"ann","members":3}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: biggest_faction % (Owls 3 and Wolves 3 tie; the name decides; owners counted once)', j->'biggest_faction';
  END IF;
  IF j::text LIKE '%bob%' OR j::text LIKE '%Bob%' OR j::text LIKE '%Ancients%' OR j::text LIKE '%999%' THEN
    RAISE EXCEPTION 'FAIL: an old-world holder leaks: %', j;
  END IF;
  IF j::text LIKE '%lou%' OR j::text LIKE '%"bo"%' THEN
    RAISE EXCEPTION 'FAIL: faction members leak: %', j;
  END IF;
  RAISE NOTICE 'PASS season_records: every key, the current world''s holders only, ties (earlier start, then name; faction by name), owner counted once, no member names';
END $$;

DO $$
DECLARE
  tb text;
  ok boolean;
BEGIN
  FOREACH tb IN ARRAY ARRAY['aurora.kill_events', 'aurora.lives', 'aurora.factions'] LOOP
    ok := FALSE;
    BEGIN
      EXECUTE 'SELECT count(*) FROM ' || tb;
    EXCEPTION WHEN insufficient_privilege THEN ok := TRUE;
    END;
    IF NOT ok THEN RAISE EXCEPTION 'FAIL: anon can read %', tb; END IF;
  END LOOP;
  ok := FALSE;
  BEGIN
    PERFORM aurora.observe_lives('test-s', 'w2', jsonb_build_array(t54.s('alice', 50, 0, 0)));
  EXCEPTION WHEN insufficient_privilege THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: anon can call observe_lives'; END IF;
  RAISE NOTICE 'PASS anon: season_records answers, the three tables and observe_lives refuse';
END $$;
RESET ROLE;

-- The first kill falls back to the zk counter when there is no kill event.
DELETE FROM aurora.kill_events WHERE server_id = 'test-s' AND world_id = 'w2';
SET LOCAL ROLE anon;
DO $$
DECLARE
  j jsonb := aurora.season_records('test-s');
BEGIN
  IF j->'first_kill' <> jsonb_build_object('name', 'carol', 't', t54.ts(0), 'x', NULL, 'y', NULL) THEN
    RAISE EXCEPTION 'FAIL: first_kill from lives %', j->'first_kill';
  END IF;
  RAISE NOTICE 'PASS season_records: without a kill event, first_kill is the earliest first_kill_at with x, y null';
END $$;
RESET ROLE;

-- carol's character is dead (players.is_dead) while her life is still open: not alive.
UPDATE aurora.players SET is_dead = TRUE WHERE server_id = 'test-s' AND username = 'carol';
DO $$
BEGIN
  IF (aurora.season_records('test-s')->'most_kills_one_life'->>'alive')::boolean IS DISTINCT FROM FALSE THEN
    RAISE EXCEPTION 'FAIL: alive ignores players.is_dead';
  END IF;
  RAISE NOTICE 'PASS season_records: alive needs an open life AND players.is_dead not true';
END $$;

-- An empty server and an unknown server: every key present, every value null.
DO $$
DECLARE
  j jsonb;
  s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['test-s2', 'no-such-server'] LOOP
    j := aurora.season_records(s);
    IF s = 'test-s2' THEN j := j - 'world_seq' - 'world_started_at'; END IF;
    IF (SELECT count(*) FROM jsonb_each(j) e WHERE e.value <> 'null'::jsonb) <> 0
       OR (s = 'no-such-server' AND (SELECT count(*) FROM jsonb_object_keys(j)) <> 8) THEN
      RAISE EXCEPTION 'FAIL: empty server % gives %', s, j;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS season_records: a server with no records gives every key as null';
END $$;

-- ============================================================================
-- 7. ADMIN READS
-- ============================================================================

INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t) VALUES
  ('test-s', 'w2', 'carol', 1, 2, 0, t54.ts(40)),
  ('test-s', 'w2', 'carol', 3, 4, 0, t54.ts(41));

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.kill_events_admin('test-s')) <> 0
     OR (SELECT count(*) FROM aurora.lives_admin('test-s')) <> 0
     OR (SELECT count(*) FROM aurora.factions_admin('test-s')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a member reads the admin functions';
  END IF;
  RAISE NOTICE 'PASS admin reads: a member gets zero rows';
END $$;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.kill_events_admin('test-s')) <> 2
     OR (SELECT count(*) FROM aurora.kill_events_admin('test-s', 1)) <> 1
     OR (SELECT t FROM aurora.kill_events_admin('test-s', 1)) <> t54.ts(41) THEN
    RAISE EXCEPTION 'FAIL: kill_events_admin (current world, newest first, limit)';
  END IF;
  -- alice 4, carol 1, fay 2, gus 2, aaron 1, erin 2; bob's w1 life is history.
  IF (SELECT count(*) FROM aurora.lives_admin('test-s')) <> 12
     OR EXISTS (SELECT 1 FROM aurora.lives_admin('test-s') WHERE username = 'bob') THEN
    RAISE EXCEPTION 'FAIL: lives_admin % rows', (SELECT count(*) FROM aurora.lives_admin('test-s'));
  END IF;
  IF (SELECT string_agg(name, ',' ORDER BY name) FROM aurora.factions_admin('test-s')) <> 'Bears,Owls,Wolves'
     OR (SELECT members FROM aurora.factions_admin('test-s') WHERE name = 'Wolves') <> ARRAY['abe','mia','zed'] THEN
    RAISE EXCEPTION 'FAIL: factions_admin';
  END IF;
  RAISE NOTICE 'PASS admin reads: kill events (limit, newest first), lives and factions of the current world only';
END $$;
RESET ROLE;

-- ============================================================================
-- 8. UNDO: rows of a voided world follow the world the undo reopens
-- ============================================================================

INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, kills, hours) VALUES
  ('test-s2', 'w2', 'zed', 1, NOW(), 3, 1);
INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t) VALUES
  ('test-s2', 'w2', 'zed', 1, 1, 0, NOW());
INSERT INTO aurora.factions (server_id, world_id, name, owner, members, seen_at) VALUES
  ('test-s2', 'w2', 'Zeds', 'zed', ARRAY['zed'], NOW());
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
SELECT aurora.undo_new_world('test-s2');
RESET ROLE;
DO $$
BEGIN
  IF (SELECT current_world_id FROM aurora.servers WHERE id = 'test-s2') <> 'w1'
     OR (SELECT world_id FROM aurora.lives WHERE server_id = 'test-s2') <> 'w1'
     OR (SELECT world_id FROM aurora.kill_events WHERE server_id = 'test-s2') <> 'w1'
     OR (SELECT world_id FROM aurora.factions WHERE server_id = 'test-s2') <> 'w1' THEN
    RAISE EXCEPTION 'FAIL: undo left season rows in the voided world';
  END IF;
  IF (aurora.season_records('test-s2')->'most_kills_one_life'->>'kills')::int IS DISTINCT FROM 3 THEN
    RAISE EXCEPTION 'FAIL: after undo the records lost the moved life';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.lives WHERE server_id = 'test-s' AND world_id NOT IN ('w1', 'w2')) THEN
    RAISE EXCEPTION 'FAIL: the undo touched the other server';
  END IF;
  RAISE NOTICE 'PASS undo_new_world: kill events, lives and factions of the voided world move to the reopened world';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL SEASON RECORD TESTS PASSED'; END $$;

ROLLBACK;
