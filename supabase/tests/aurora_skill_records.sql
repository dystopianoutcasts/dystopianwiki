-- Tests for migration 042: skill level records, and the living form of every per-character record.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f) after 032, 034 and 042. It seeds
-- fixtures, asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL SKILL RECORD TESTS PASSED", or stops at the first failure.
--
-- Server 't80-s' has two worlds: w1 (ended) and w2 (current). The old world's life holds 999 of
-- everything, so a leak shows as "Olden". Times are minutes after 2026-10-19 12:00 UTC (t80.ts).

BEGIN;

SET LOCAL client_min_messages = NOTICE;

CREATE SCHEMA t80;
CREATE FUNCTION t80.ts(p_min NUMERIC) RETURNS TIMESTAMPTZ LANGUAGE sql IMMUTABLE AS $$
  SELECT TIMESTAMPTZ '2026-10-19 12:00:00+00' + make_interval(secs => p_min * 60);
$$;
-- One pos sample as observe_lives reads it; a NULL field is left out of the object.
CREATE FUNCTION t80.s(p_user TEXT, p_min NUMERIC, p_zk INT, p_hs REAL, p_sk JSONB) RETURNS JSONB
LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_strip_nulls(jsonb_build_object('username', p_user, 't', t80.ts(p_min), 'zk', p_zk, 'hs', p_hs,
                                              'sk', p_sk));
$$;
-- One life as text: life_no:skills:skills_now:skills_at(min or -)
CREATE FUNCTION t80.lives(p_user TEXT) RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(string_agg(
           l.life_no || ':' || COALESCE(l.skills::text, '-') || ':' || COALESCE(l.skills_now::text, '-') || ':'
           || COALESCE((extract(epoch FROM l.skills_at - t80.ts(0)) / 60)::numeric(10,1)::text, '-'),
           ' ' ORDER BY l.life_no), '')
    FROM aurora.lives l
   WHERE l.server_id = 't80-s' AND l.username = p_user;
$$;
GRANT USAGE ON SCHEMA t80 TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA t80 TO anon, authenticated, service_role;

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('t80-s',     'Skill Test Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('t80-empty', 'Empty Server',      TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());
INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at, ended_at) VALUES
  ('t80-s',     'w1', 1, 'ended',   'migration', TIMESTAMPTZ '2026-09-01 00:00:00+00', TIMESTAMPTZ '2026-10-01 00:00:00+00'),
  ('t80-s',     'w2', 2, 'current', 'exporter',  TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL),
  ('t80-empty', 'w1', 1, 'current', 'exporter',  TIMESTAMPTZ '2026-10-01 00:00:00+00', NULL);
UPDATE aurora.servers SET current_world_id = 'w2' WHERE id = 't80-s';
UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 't80-empty';

-- ============================================================================
-- 1. SCHEMA AND GRANTS
-- ============================================================================

DO $$
BEGIN
  IF (SELECT count(*) FROM information_schema.columns
       WHERE table_schema = 'aurora' AND table_name = 'lives'
         AND column_name IN ('skills', 'skills_now', 'skills_at')) <> 3 THEN
    RAISE EXCEPTION 'FAIL: lives lacks a skills column';
  END IF;
  IF has_table_privilege('anon', 'aurora.lives', 'SELECT') OR has_table_privilege('authenticated', 'aurora.lives', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: a client role can read aurora.lives';
  END IF;
  IF has_function_privilege('anon', 'aurora.observe_lives(text,text,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'aurora.observe_lives(text,text,jsonb)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'aurora.observe_lives(text,text,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: observe_lives is not service_role only';
  END IF;
  IF NOT has_function_privilege('anon', 'aurora.season_records(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon cannot execute season_records';
  END IF;
  RAISE NOTICE 'PASS schema and grants: three skills columns, lives closed, observe_lives service_role, season_records public';
END $$;

-- ============================================================================
-- 2. observe_lives: sk is a maximum and a newest value, and never opens a life
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
BEGIN
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('alice', 0, 1, 1, '20')));
  IF t80.lives('alice') <> '1:20:20:0.0' THEN
    RAISE EXCEPTION 'FAIL: the first sample opens a life with its skills, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('alice', 10, 1, 2, '30')));
  IF t80.lives('alice') <> '1:30:30:10.0' THEN
    RAISE EXCEPTION 'FAIL: a higher total raises both, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('alice', 20, 1, 3, '27')));
  IF t80.lives('alice') <> '1:30:27:20.0' THEN
    RAISE EXCEPTION 'FAIL: a fall (decay) keeps the best and moves now, and opens no life, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('alice', 5, NULL, NULL, '29')));
  IF t80.lives('alice') <> '1:30:27:20.0' THEN
    RAISE EXCEPTION 'FAIL: an older sample must not replace now, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(
    t80.s('alice', 21, NULL, NULL, '-1'), t80.s('alice', 22, NULL, NULL, '1.5'),
    t80.s('alice', 23, NULL, NULL, '"40"'), t80.s('alice', 24, NULL, NULL, '1e12')));
  IF t80.lives('alice') <> '1:30:27:20.0' THEN
    RAISE EXCEPTION 'FAIL: unusable sk values must be ignored, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('alice', 30, 1, 4, NULL)));
  IF t80.lives('alice') <> '1:30:27:20.0' THEN
    RAISE EXCEPTION 'FAIL: a sample without sk leaves the skills alone, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('alice', 40, 0, 0.1, '12')));
  IF t80.lives('alice') <> '1:30:27:20.0 2:12:12:40.0' THEN
    RAISE EXCEPTION 'FAIL: a new character (zk and hs drop) starts a life with its own skills, got %', t80.lives('alice');
  END IF;
  PERFORM aurora.observe_lives('t80-s', 'w2', jsonb_build_array(t80.s('carol', 0, NULL, NULL, '5')));
  IF t80.lives('carol') <> '1:5:5:0.0' THEN
    RAISE EXCEPTION 'FAIL: a sample carrying only sk counts, got %', t80.lives('carol');
  END IF;
  RAISE NOTICE 'PASS observe_lives: sk is a running maximum and a newest value; decay, old and bad samples handled; sk never opens a life';
END $$;
RESET ROLE;

-- ============================================================================
-- 3. season_records: all-time and alive
-- ============================================================================

DELETE FROM aurora.lives WHERE server_id = 't80-s';
INSERT INTO aurora.players (server_id, username, display_name, is_dead, world_id) VALUES
  ('t80-s', 'alice', 'Alice', FALSE, 'w2'),
  ('t80-s', 'bob',   'Bob',   TRUE,  'w2'),
  ('t80-s', 'carol', '',      FALSE, 'w2'),
  ('t80-s', 'olden', 'Olden', FALSE, 'w1');
INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, ended_at, kills, hours, skills, skills_now, skills_at) VALUES
  -- the old world: 999 of everything, must never show
  ('t80-s', 'w1', 'olden', 1, t80.ts(-9000), NULL,          999, 999, 999, 999, t80.ts(-8000)),
  -- alice: her best life is over; her current one is modest
  ('t80-s', 'w2', 'alice', 1, t80.ts(0),     t80.ts(600),   50,  100, 80,  78,  t80.ts(590)),
  -- her current life peaked at 65 (above carol's 60) but has decayed to 35: alive reads now
  ('t80-s', 'w2', 'alice', 2, t80.ts(700),   NULL,          10,  5,   65,  35,  t80.ts(800)),
  -- bob: an open life, but the player is marked dead: not alive
  ('t80-s', 'w2', 'bob',   1, t80.ts(100),   NULL,          60,  90,  70,  70,  t80.ts(800)),
  -- carol: the best of the living (display name blank: the username shows)
  ('t80-s', 'w2', 'carol', 1, t80.ts(200),   NULL,          20,  30,  60,  60,  t80.ts(800));

DO $$
DECLARE
  j jsonb;
BEGIN
  SET LOCAL ROLE anon;
  j := aurora.season_records('t80-s');
  RESET ROLE;
  IF j->'most_skills_one_life' IS DISTINCT FROM '{"name":"Alice","skills":80,"life_no":1,"alive":false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: most_skills_one_life, got %', j->'most_skills_one_life';
  END IF;
  IF j->'most_skills_alive' IS DISTINCT FROM '{"name":"carol","skills":60,"life_no":1}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: most_skills_alive (bob is dead, alice is at 35 now), got %', j->'most_skills_alive';
  END IF;
  IF j->'most_kills_alive' IS DISTINCT FROM '{"name":"carol","kills":20,"life_no":1}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: most_kills_alive (bob 60 is dead), got %', j->'most_kills_alive';
  END IF;
  IF j->'longest_life_alive' IS DISTINCT FROM jsonb_build_object('name', 'carol', 'hours', 30.0, 'started_at', t80.ts(200)) THEN
    RAISE EXCEPTION 'FAIL: longest_life_alive (bob 90 is dead), got %', j->'longest_life_alive';
  END IF;
  -- 034's keys still there and still all-time
  IF (j->'most_kills_one_life'->>'kills')::int IS DISTINCT FROM 60 OR (j->'longest_life'->>'hours')::numeric IS DISTINCT FROM 100.0 THEN
    RAISE EXCEPTION 'FAIL: 034''s all-time records changed, got % and %', j->'most_kills_one_life', j->'longest_life';
  END IF;
  IF j::text LIKE '%Olden%' OR j::text LIKE '%999%' THEN
    RAISE EXCEPTION 'FAIL: the old world leaked: %', j;
  END IF;
  RAISE NOTICE 'PASS season_records: all-time skills, and the living forms of skills, kills and survival; dead and old-world lives left out';
END $$;

-- Ties go to the earlier time; an untagged life (world_id NULL) counts as the current world.
INSERT INTO aurora.players (server_id, username, display_name, is_dead, world_id) VALUES
  ('t80-s', 'dan', 'Dan', FALSE, 'w2'),
  ('t80-s', 'eve', 'Eve', FALSE, 'w2');
INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, ended_at, kills, hours, skills, skills_now, skills_at) VALUES
  ('t80-s', 'w2', 'eve', 1, t80.ts(300), NULL, 1, 1, 65, 65, t80.ts(850)),
  ('t80-s', 'w2', 'dan', 1, t80.ts(300), NULL, 1, 1, 65, 65, t80.ts(820));
UPDATE aurora.lives SET world_id = NULL, skills = 85 WHERE server_id = 't80-s' AND username = 'carol';
DO $$
DECLARE
  j jsonb := aurora.season_records('t80-s');
BEGIN
  IF j->'most_skills_alive'->>'name' IS DISTINCT FROM 'Dan' THEN
    RAISE EXCEPTION 'FAIL: a tie in skills_now goes to the earlier skills_at (Dan), got %', j->'most_skills_alive';
  END IF;
  IF j->'most_skills_one_life'->>'name' IS DISTINCT FROM 'carol' OR (j->'most_skills_one_life'->>'skills')::int <> 85 THEN
    RAISE EXCEPTION 'FAIL: an untagged life counts as the current world, got %', j->'most_skills_one_life';
  END IF;
  RAISE NOTICE 'PASS season_records: ties by the earlier time; untagged lives count as current';
END $$;

-- Every key is present, null when nobody holds it.
DO $$
DECLARE
  j jsonb := aurora.season_records('t80-empty');
  k text;
BEGIN
  FOREACH k IN ARRAY ARRAY['most_skills_one_life', 'most_skills_alive', 'most_kills_alive', 'longest_life_alive',
                           'first_death', 'first_kill', 'most_kills_season', 'most_kills_one_life', 'longest_life',
                           'biggest_faction'] LOOP
    IF NOT (j ? k) OR j->k <> 'null'::jsonb THEN
      RAISE EXCEPTION 'FAIL: key % must be present and null on an empty server, got %', k, j->k;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS season_records: every key present and null when nobody holds it';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL SKILL RECORD TESTS PASSED'; END $$;

ROLLBACK;
