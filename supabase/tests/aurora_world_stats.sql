-- Tests for migration 030: death markers, and the home summary's world stats
-- (zombies killed today, players killed today, world age, game version, day_tz).
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL WORLD STATS TESTS PASSED", or stops at the first failure.
--
-- "Running 030 twice is fine" cannot be asserted from inside this file (the SQL
-- editor has no \i); the run script applies the migration twice, with a row in
-- between, before running this.
--
-- Time. The function reads now(), so the fixtures are laid out relative to the
-- zone's own local midnight, computed here the same way the function must. The
-- samples may land in the future of now(); the function has no upper bound, so that
-- does not matter.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'ws-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'ws-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen, game_version) VALUES
  ('ws-restart', 'Restart',  NOW(), '42.20.0'),
  ('ws-mid',     'Midnight', NOW(), NULL),
  ('ws-tz',      'Zones',    NOW(), NULL),
  ('ws-deaths',  'Deaths',   NOW(), NULL),
  ('ws-empty',   'Empty',    NOW(), NULL),
  ('ws-prior',   'PriorOnly', NOW(), NULL),
  ('ws-nokey',   'NoKey',    NOW(), NULL),
  ('ws-other',   'Other',    NOW(), NULL);

-- Local midnight "today" in a zone, the way the function computes it.
CREATE FUNCTION pg_temp.midnight(z text) RETURNS timestamptz LANGUAGE sql STABLE AS $$
  SELECT date_trunc('day', now() AT TIME ZONE z) AT TIME ZONE z
$$;

-- ---- ws-restart: deltas and a restart. Midnight is New York's.
--   M-1h  50   baseline (before midnight: counts nothing)
--   M+1h  60   +10
--   M+2h  75   +15
--   M+3h   5   a drop: a restart, adds 5
--   M+4h  12   +7                       -> 10 + 15 + 5 + 7 = 37
INSERT INTO aurora.health_samples (server_id, t, players, raw)
SELECT 'ws-restart', pg_temp.midnight('America/New_York') + o, 1,
       jsonb_build_object('game', jsonb_build_object('zombies-killed', v, 'world-age-hours', a))
  FROM (VALUES (INTERVAL '-1 hour', 50, 100.0),
               (INTERVAL '1 hour',  60, 110.5),
               (INTERVAL '2 hours', 75, 120.25),
               (INTERVAL '3 hours',  5, 130.0),
               (INTERVAL '4 hours', 12, 140.75)) AS s(o, v, a);

-- ---- ws-mid: a sample one second before and one second after New York midnight.
INSERT INTO aurora.health_samples (server_id, t, players, raw)
SELECT 'ws-mid', pg_temp.midnight('America/New_York') + o, 1,
       jsonb_build_object('game', jsonb_build_object('zombies-killed', v))
  FROM (VALUES (INTERVAL '-1 second', 1000), (INTERVAL '1 second', 1003)) AS s(o, v);

-- ---- ws-tz: three samples that two zones' midnights split differently.
--   lo = the earlier of the Los Angeles and London midnights, hi = the later.
--   lo-1h 100 | lo+1h 110 | hi+1h 130
--   a zone whose midnight is lo counts 10 + 20 = 30; a zone whose midnight is hi counts 20.
INSERT INTO aurora.health_samples (server_id, t, players, raw)
SELECT 'ws-tz', LEAST(pg_temp.midnight('America/Los_Angeles'), pg_temp.midnight('Europe/London')) + o, 1,
       jsonb_build_object('game', jsonb_build_object('zombies-killed', v))
  FROM (VALUES (INTERVAL '-1 hour', 100), (INTERVAL '1 hour', 110)) AS s(o, v);
INSERT INTO aurora.health_samples (server_id, t, players, raw)
VALUES ('ws-tz', GREATEST(pg_temp.midnight('America/Los_Angeles'), pg_temp.midnight('Europe/London')) + INTERVAL '1 hour', 1,
        '{"game": {"zombies-killed": 130}}'::jsonb);

-- ---- ws-prior: only a sample from before midnight carries the key -> NULL today.
INSERT INTO aurora.health_samples (server_id, t, players, raw)
VALUES ('ws-prior', pg_temp.midnight('America/New_York') - INTERVAL '2 hours', 1, '{"game": {"zombies-killed": 500}}'::jsonb);

-- ---- ws-nokey: samples since midnight, none with the key -> NULL.
INSERT INTO aurora.health_samples (server_id, t, players, raw)
VALUES ('ws-nokey', pg_temp.midnight('America/New_York') + INTERVAL '1 hour', 1, '{"game": {"zombies-total": 10}}'::jsonb);

-- ---- ws-other: a lot of kills that must never reach another server's figure.
INSERT INTO aurora.health_samples (server_id, t, players, raw)
VALUES ('ws-other', pg_temp.midnight('America/New_York') + INTERVAL '1 hour', 1, '{"game": {"zombies-killed": 99999}}'::jsonb);

-- ---- deaths. ws-deaths, New York midnight M:
--   alice  M-1h   (yesterday)   x=1
--   alice  M+1s   (today)       x=2   <- her latest: the public marker
--   bob    M-1s   (yesterday)   x=3   <- his only death, still public (no age limit)
--   cara   M+2s   (today)       x=4
-- Today (New York): alice's and cara's = 2.
INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived)
SELECT 'ws-deaths', u, x, 10, 0, pg_temp.midnight('America/New_York') + o, s, h
  FROM (VALUES ('alice', INTERVAL '-1 hour',   1, 'isdead',     5.0),
               ('alice', INTERVAL '1 second',  2, 'chardeath', 20.5),
               ('bob',   INTERVAL '-1 second', 3, 'dodeathlog', 7.0),
               ('cara',  INTERVAL '2 seconds', 4, 'cosmicmap', NULL)) AS d(u, o, x, s, h);
INSERT INTO aurora.deaths (server_id, username, x, y, t, src)
VALUES ('ws-other', 'zoe', 9, 9, pg_temp.midnight('America/New_York') + INTERVAL '1 second', 'isdead');

-- ============================================================================
-- 1. THE ONE-ARGUMENT SUMMARY AND THE KEYS
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  s jsonb := aurora.home_summary('ws-restart');
  k text;
BEGIN
  FOREACH k IN ARRAY ARRAY['server_name','last_seen','up_since','online_now','survivors_total',
    'survivors_7d','peak_7d','hourly_7d','zombies_killed_today','players_killed_today',
    'world_age_hours','game_version','day_tz','longest_survivors','safehouses','vehicles',
    'settings','sandbox','config_updated_at'] LOOP
    IF NOT s ? k THEN RAISE EXCEPTION 'FAIL: key % missing', k; END IF;
  END LOOP;
  RAISE NOTICE 'PASS every key is present, old and new';

  IF jsonb_typeof(s->'zombies_killed_today') <> 'number' THEN RAISE EXCEPTION 'FAIL: zombies_killed_today type'; END IF;
  IF jsonb_typeof(s->'players_killed_today') <> 'number' THEN RAISE EXCEPTION 'FAIL: players_killed_today type'; END IF;
  IF jsonb_typeof(s->'world_age_hours') <> 'number' THEN RAISE EXCEPTION 'FAIL: world_age_hours type'; END IF;
  IF jsonb_typeof(s->'game_version') <> 'string' THEN RAISE EXCEPTION 'FAIL: game_version type'; END IF;
  IF jsonb_typeof(s->'day_tz') <> 'string' THEN RAISE EXCEPTION 'FAIL: day_tz type'; END IF;
  RAISE NOTICE 'PASS new keys have their documented types';

  IF s->>'day_tz' <> 'America/New_York' THEN RAISE EXCEPTION 'FAIL: the 1-arg summary answered for %', s->>'day_tz'; END IF;
  RAISE NOTICE 'PASS the one-argument summary still answers, for America/New_York';
END $$;

-- ============================================================================
-- 2. ZOMBIES KILLED TODAY: deltas, and a restart
-- ============================================================================

DO $$
DECLARE
  s jsonb := aurora.home_summary('ws-restart');
BEGIN
  IF (s->>'zombies_killed_today')::numeric <> 37 THEN
    RAISE EXCEPTION 'FAIL: delta sum across a restart is %, expected 37', s->>'zombies_killed_today';
  END IF;
  RAISE NOTICE 'PASS sum of positive deltas, a drop adds the new value (restart)';

  IF (s->>'world_age_hours')::numeric <> 140.75 THEN
    RAISE EXCEPTION 'FAIL: world_age_hours %, expected the newest sample''s 140.75', s->>'world_age_hours';
  END IF;
  IF s->>'game_version' <> '42.20.0' THEN RAISE EXCEPTION 'FAIL: game_version %', s->>'game_version'; END IF;
  RAISE NOTICE 'PASS world_age_hours from the newest sample, game_version from servers';
END $$;

DO $$
DECLARE
  s jsonb;
BEGIN
  s := aurora.home_summary('ws-prior');
  IF s->'zombies_killed_today' <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FAIL: only a pre-midnight sample, expected null, got %', s->'zombies_killed_today';
  END IF;
  s := aurora.home_summary('ws-nokey');
  IF s->'zombies_killed_today' <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FAIL: samples without the key, expected null, got %', s->'zombies_killed_today';
  END IF;
  IF s->'world_age_hours' <> 'null'::jsonb OR s->'game_version' <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FAIL: absent world age or version should be null: %', s;
  END IF;
  s := aurora.home_summary('ws-empty');
  IF s->'zombies_killed_today' <> 'null'::jsonb THEN RAISE EXCEPTION 'FAIL: no samples at all, expected null'; END IF;
  IF s->'players_killed_today' <> '0'::jsonb THEN
    RAISE EXCEPTION 'FAIL: no deaths must read 0, not null: %', s->'players_killed_today';
  END IF;
  RAISE NOTICE 'PASS null when nothing carries the key, 0 deaths when there are none';

  s := aurora.home_summary('ws-other');
  IF (s->>'zombies_killed_today')::numeric <> 99999 OR (aurora.home_summary('ws-restart')->>'zombies_killed_today')::numeric <> 37 THEN
    RAISE EXCEPTION 'FAIL: servers leak into each other';
  END IF;
  RAISE NOTICE 'PASS servers are separate';
END $$;

-- ============================================================================
-- 3. THE MIDNIGHT BOUNDARY IN NEW YORK
-- ============================================================================

DO $$
DECLARE
  s jsonb := aurora.home_summary('ws-mid');
BEGIN
  IF (s->>'zombies_killed_today')::numeric <> 3 THEN
    RAISE EXCEPTION 'FAIL: a sample 1 s before New York midnight and one 1 s after gave %, expected 3 (UTC midnight would give a different figure)',
      s->>'zombies_killed_today';
  END IF;
  RAISE NOTICE 'PASS the sample just before midnight is the baseline, the one after counts only its delta';
END $$;

-- ============================================================================
-- 4. DEATHS: counted today, latest per user, and what anon can see
-- ============================================================================

DO $$
DECLARE
  s jsonb := aurora.home_summary('ws-deaths');
BEGIN
  IF (s->>'players_killed_today')::int <> 2 THEN
    RAISE EXCEPTION 'FAIL: players_killed_today %, expected 2 (alice and cara; yesterday''s two and ws-other''s one excluded)', s->>'players_killed_today';
  END IF;
  RAISE NOTICE 'PASS deaths since midnight New York are counted';
END $$;

DO $$
DECLARE
  n int;
  cols text;
BEGIN
  SELECT count(*) INTO n FROM aurora.deaths_visible WHERE server_id = 'ws-deaths';
  IF n <> 3 THEN RAISE EXCEPTION 'FAIL: % public rows for ws-deaths, expected 3 (one per user)', n; END IF;
  IF (SELECT x FROM aurora.deaths_visible WHERE server_id = 'ws-deaths' AND username = 'alice') <> 2 THEN
    RAISE EXCEPTION 'FAIL: alice''s marker is not her latest death';
  END IF;
  IF (SELECT hours_survived FROM aurora.deaths_visible WHERE server_id = 'ws-deaths' AND username = 'alice') <> 20.5 THEN
    RAISE EXCEPTION 'FAIL: hours_survived is not the latest death''s';
  END IF;
  IF (SELECT count(*) FROM aurora.deaths_visible WHERE server_id = 'ws-deaths' AND username = 'bob') <> 1 THEN
    RAISE EXCEPTION 'FAIL: bob''s only death (yesterday) must still be public: there is no age limit';
  END IF;
  RAISE NOTICE 'PASS deaths_visible: one row per player, the latest, no age limit';

  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols
    FROM pg_attribute WHERE attrelid = 'aurora.deaths_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,username,x,y,z,t,hours_survived' THEN
    RAISE EXCEPTION 'FAIL: deaths_visible columns are %', cols;
  END IF;
  RAISE NOTICE 'PASS deaths_visible has exactly the agreed columns';
END $$;

DO $$
BEGIN
  BEGIN
    PERFORM src FROM aurora.deaths_visible;
    RAISE EXCEPTION 'FAIL: anon could select src from deaths_visible';
  EXCEPTION WHEN undefined_column THEN NULL;
  END;
  BEGIN
    PERFORM 1 FROM aurora.deaths;
    RAISE EXCEPTION 'FAIL: anon could read aurora.deaths';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.deaths (server_id, username, x, y, t) VALUES ('ws-deaths', 'evil', 0, 0, now());
    RAISE EXCEPTION 'FAIL: anon could insert into aurora.deaths';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    IF EXISTS (SELECT 1 FROM aurora.deaths_public() p WHERE to_jsonb(p) ? 'src') THEN
      RAISE EXCEPTION 'FAIL: deaths_public() exposes src';
    END IF;
  END;
  RAISE NOTICE 'PASS anon cannot read src, the table, or write to it';

  BEGIN
    PERFORM aurora.deaths_admin('ws-deaths');
    RAISE EXCEPTION 'FAIL: anon could execute deaths_admin';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon cannot execute the admin function';
END $$;

RESET ROLE;

-- ============================================================================
-- 5. ADMIN GATE
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"dddddddd-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.deaths_admin('ws-deaths');
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: a signed-in non-admin got % rows from deaths_admin', n; END IF;
  BEGIN
    PERFORM 1 FROM aurora.deaths;
    RAISE EXCEPTION 'FAIL: authenticated could read aurora.deaths';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a member gets zero rows from deaths_admin and no table access';
END $$;

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"dddddddd-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.deaths_admin('ws-deaths');
  IF n <> 4 THEN RAISE EXCEPTION 'FAIL: admin got % deaths, expected all 4', n; END IF;
  IF (SELECT src FROM aurora.deaths_admin('ws-deaths') WHERE username = 'cara') <> 'cosmicmap' THEN
    RAISE EXCEPTION 'FAIL: admin does not see src';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.deaths_admin('ws-deaths') WHERE username = 'zoe') THEN
    RAISE EXCEPTION 'FAIL: deaths_admin crossed servers';
  END IF;
  RAISE NOTICE 'PASS an admin sees every death with src, scoped to the server';
END $$;

RESET ROLE;

-- ============================================================================
-- 6. TIME ZONES
-- ============================================================================

-- The pg_temp helper is not callable by anon, so its answer goes through a setting.
SELECT set_config('ws.la_first',
  (pg_temp.midnight('America/Los_Angeles') < pg_temp.midnight('Europe/London'))::text, TRUE);

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  la jsonb := aurora.home_summary_tz('ws-tz', 'America/Los_Angeles');
  lon jsonb := aurora.home_summary_tz('ws-tz', 'Europe/London');
  la_first boolean;
  la_n numeric;
  lon_n numeric;
  exp_la numeric;
  exp_lon numeric;
BEGIN
  -- Whichever midnight comes first sees both deltas (30); the later one only the last (20).
  la_first := current_setting('ws.la_first')::boolean;
  la_n := (la->>'zombies_killed_today')::numeric;
  lon_n := (lon->>'zombies_killed_today')::numeric;
  IF la_n = lon_n THEN
    RAISE EXCEPTION 'FAIL: Los Angeles and London gave the same figure % for samples laid across their midnights', la_n;
  END IF;
  exp_la := CASE WHEN la_first THEN 30 ELSE 20 END;
  exp_lon := CASE WHEN la_first THEN 20 ELSE 30 END;
  IF la_n <> exp_la OR lon_n <> exp_lon THEN
    RAISE EXCEPTION 'FAIL: LA % London %, expected % and %', la_n, lon_n, exp_la, exp_lon;
  END IF;
  IF la->>'day_tz' <> 'America/Los_Angeles' OR lon->>'day_tz' <> 'Europe/London' THEN
    RAISE EXCEPTION 'FAIL: day_tz not echoed: % %', la->>'day_tz', lon->>'day_tz';
  END IF;
  RAISE NOTICE 'PASS the same samples are counted differently around two zones'' midnights';
END $$;

DO $$
DECLARE
  ny jsonb := aurora.home_summary_tz('ws-restart', 'America/New_York');
  bad text;
  s jsonb;
BEGIN
  FOREACH bad IN ARRAY ARRAY['Not/AZone', '', 'Foo', repeat('A', 200), 'UTC; DROP TABLE aurora.deaths', E'x''); DELETE FROM aurora.deaths; --', 'EST5EDT garbage', '<+03>-3', 'America//New_York'] LOOP
    s := aurora.home_summary_tz('ws-restart', bad);
    IF s->>'day_tz' IS DISTINCT FROM 'America/New_York' THEN RAISE EXCEPTION 'FAIL: invalid zone % gave day_tz %', bad, s->>'day_tz'; END IF;
    IF s->'zombies_killed_today' <> ny->'zombies_killed_today' THEN RAISE EXCEPTION 'FAIL: invalid zone % changed the figure', bad; END IF;
  END LOOP;
  RAISE NOTICE 'PASS an invalid zone falls back to America/New_York and never raises';

  s := aurora.home_summary_tz('ws-restart', NULL);
  IF s->>'day_tz' IS DISTINCT FROM 'America/New_York' OR (s->>'zombies_killed_today')::numeric IS DISTINCT FROM 37 THEN
    RAISE EXCEPTION 'FAIL: a NULL zone did not fall back: %', s->>'day_tz';
  END IF;
  RAISE NOTICE 'PASS a NULL zone falls back';

  -- Case is PostgreSQL's business: a differently cased real zone is accepted and counted the same.
  s := aurora.home_summary_tz('ws-restart', 'america/new_york');
  IF (s->>'zombies_killed_today')::numeric <> 37 THEN RAISE EXCEPTION 'FAIL: a lower-case real zone gave %', s->>'zombies_killed_today'; END IF;
  s := aurora.home_summary_tz('ws-restart', 'UTC');
  IF s->>'day_tz' <> 'UTC' THEN RAISE EXCEPTION 'FAIL: UTC is a valid zone name, got %', s->>'day_tz'; END IF;
  RAISE NOTICE 'PASS a valid zone name from the catalog is used as given';

  IF aurora.home_summary('ws-restart') - 'last_seen' - 'hourly_7d' <> ny - 'last_seen' - 'hourly_7d' THEN
    RAISE EXCEPTION 'FAIL: the 1-argument form differs from the 2-argument form for America/New_York';
  END IF;
  RAISE NOTICE 'PASS the one-argument form equals the New York answer';
END $$;

-- The injection attempts did not run.
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.deaths WHERE server_id = 'ws-deaths') <> 4 THEN
    RAISE EXCEPTION 'FAIL: a time zone argument was executed as SQL';
  END IF;
  RAISE NOTICE 'PASS the zone argument is never interpolated';
END $$;

-- ============================================================================
-- 7. GRANTS AND SHAPE
-- ============================================================================

DO $$
BEGIN
  IF NOT (has_function_privilege('anon', 'aurora.home_summary_tz(text, text)', 'EXECUTE')
      AND has_function_privilege('authenticated', 'aurora.home_summary_tz(text, text)', 'EXECUTE')
      AND has_function_privilege('service_role', 'aurora.home_summary_tz(text, text)', 'EXECUTE')) THEN
    RAISE EXCEPTION 'FAIL: home_summary_tz must be executable by anon, authenticated and service_role';
  END IF;
  IF NOT (has_function_privilege('anon', 'aurora.home_summary(text)', 'EXECUTE')
      AND has_function_privilege('authenticated', 'aurora.home_summary(text)', 'EXECUTE')) THEN
    RAISE EXCEPTION 'FAIL: home_summary lost a grant';
  END IF;
  IF has_function_privilege('anon', 'aurora.safe_tz(text)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'aurora.safe_tz(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: safe_tz is internal and must not be client-callable';
  END IF;
  IF has_function_privilege('anon', 'aurora.deaths_admin(text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'aurora.deaths_admin(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: deaths_admin must be authenticated only';
  END IF;
  IF has_table_privilege('anon', 'aurora.deaths', 'SELECT') OR has_table_privilege('authenticated', 'aurora.deaths', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: a client role has SELECT on aurora.deaths';
  END IF;
  IF NOT has_table_privilege('service_role', 'aurora.deaths', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot write aurora.deaths';
  END IF;
  IF NOT COALESCE((SELECT reloptions @> ARRAY['security_invoker=true'] FROM pg_class WHERE oid = 'aurora.deaths_visible'::regclass), FALSE) THEN
    RAISE EXCEPTION 'FAIL: deaths_visible must be security_invoker, so the caller''s own grant on deaths_public() is checked';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'aurora.deaths'::regclass) THEN
    RAISE EXCEPTION 'FAIL: RLS is off on aurora.deaths';
  END IF;
  IF (SELECT prosecdef FROM pg_proc WHERE oid = 'aurora.home_summary(text)'::regprocedure) IS NOT TRUE
     OR (SELECT prosecdef FROM pg_proc WHERE oid = 'aurora.home_summary_tz(text,text)'::regprocedure) IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: the summaries must be SECURITY DEFINER';
  END IF;
  IF NOT (SELECT proconfig @> ARRAY['search_path=""'] FROM pg_proc WHERE oid = 'aurora.home_summary(text)'::regprocedure)
     OR NOT (SELECT proconfig @> ARRAY['search_path=""'] FROM pg_proc WHERE oid = 'aurora.home_summary_tz(text,text)'::regprocedure) THEN
    RAISE EXCEPTION 'FAIL: search_path must be empty on both summaries';
  END IF;
  RAISE NOTICE 'PASS grants, RLS, SECURITY DEFINER and search_path';
END $$;

-- The upsert key: replaying the same death is one row.
DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.deaths (server_id, username, x, y, t, src)
    SELECT server_id, username, x, y, t, src FROM aurora.deaths WHERE server_id = 'ws-deaths' AND username = 'cara';
    RAISE EXCEPTION 'FAIL: the same (server, username, t) was inserted twice';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS (server_id, username, t) is unique, so a replay cannot double a death';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL WORLD STATS TESTS PASSED'; END $$;

ROLLBACK;
