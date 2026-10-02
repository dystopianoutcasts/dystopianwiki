-- Tests for migration 027: aurora.home_summary(), aurora.server_config and the
-- narrowed player columns.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL HOME SUMMARY TESTS PASSED", or stops at the first failure.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES (server 'test-home')
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'home-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'home-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen, last_launch_stamp)
VALUES ('test-home', 'Home Test Server', NOW(), '2026-10-01_05-13');

-- Seven living characters with hours (five must be listed), one dead with the
-- most hours (never listed), one with no hours (never listed), one blank display
-- name (listed under the account name), one last seen 10 days ago.
INSERT INTO aurora.players (server_id, username, display_name, first_seen, last_seen, online, hours_survived, access_level, is_dead)
VALUES
  ('test-home', 'u1', 'Ann',  NOW(), NOW(),                     TRUE,  300.04, 'admin', FALSE),
  ('test-home', 'u2', 'Bob',  NOW(), NOW() - INTERVAL '1 day',  FALSE, 250,    'None',  FALSE),
  ('test-home', 'u3', '  ',   NOW(), NOW() - INTERVAL '2 days', FALSE, 200,    'None',  NULL),
  ('test-home', 'u4', 'Dee',  NOW(), NOW() - INTERVAL '3 days', FALSE, 150,    'None',  FALSE),
  ('test-home', 'u5', 'Eve',  NOW(), NOW() - INTERVAL '4 days', FALSE, 100,    'None',  FALSE),
  ('test-home', 'u6', 'Fay',  NOW(), NOW() - INTERVAL '10 days',FALSE, 50,     'None',  FALSE),
  ('test-home', 'u7', 'Gus',  NOW(), NOW(),                     TRUE,  10,     'None',  FALSE),
  ('test-home', 'dead', 'Zed', NOW(), NOW(),                    FALSE, 9999,   'None',  TRUE),
  ('test-home', 'nohours', 'Nil', NOW(), NOW(),                 FALSE, NULL,   'None',  FALSE);

-- Two hours inside the week (peaks 4 and 6), one sample 8 days old with 99 players
-- (outside the week, must not count). The newest sample carries the daily counters.
INSERT INTO aurora.health_samples (server_id, t, players, raw) VALUES
  ('test-home', date_trunc('hour', NOW()) - INTERVAL '2 hours' + INTERVAL '5 minutes', 3, '{}'::jsonb),
  ('test-home', date_trunc('hour', NOW()) - INTERVAL '2 hours' + INTERVAL '25 minutes', 4, '{}'::jsonb),
  ('test-home', date_trunc('hour', NOW()) - INTERVAL '1 hour' + INTERVAL '5 minutes', 6, '{}'::jsonb),
  ('test-home', NOW() - INTERVAL '8 days', 99, '{}'::jsonb),
  ('test-home', NOW() - INTERVAL '1 minute', 2,
   '{"game": {"zombies-killed-today": 1234, "players-killed-by-zombie-today": 3}}'::jsonb);

INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title) VALUES
  ('test-home', 'S1', 0, 0, 5, 5, 'u1', 'Home'),
  ('test-home', 'S2', 9, 9, 5, 5, 'u2', 'Fort');

INSERT INTO aurora.vehicles (server_id, vehicle_id, script_name, x, y, z, t) VALUES
  ('test-home', 1, 'Base.CarNormal', 1, 1, 0, NOW()),
  ('test-home', 2, 'Base.Van', 2, 2, 0, NOW()),
  ('test-home', 3, NULL, 3, 3, 0, NOW());

-- settings as the ingest writes them, plus keys home_summary must NOT publish.
INSERT INTO aurora.server_config (server_id, settings, sandbox) VALUES (
  'test-home',
  '{"PublicName": "Outcasts", "PVP": false, "MaxPlayers": 32, "HasPassword": true,
    "Mods": ["OutcastLib"], "DefaultPort": 16261, "UDPPort": 16262,
    "server_browser_announced_ip": "203.0.113.7", "MaxAccountsPerUser": 2}'::jsonb,
  '{"Zombies": {"v": 4, "label": "Normal"}, "ZombieLore.Speed": {"v": 2, "label": "Fast Shamblers"},
    "MultiplierConfig.Global": {"v": 1.5}, "LootItemRemovalList": {"v": "x"}}'::jsonb
);

-- ============================================================================
-- 1. ANON: the summary
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  s jsonb := aurora.home_summary('test-home');
  k text;
BEGIN
  FOREACH k IN ARRAY ARRAY['server_name','last_seen','up_since','online_now','survivors_total',
    'survivors_7d','peak_7d','hourly_7d','zombies_killed_today','players_killed_today',
    'longest_survivors','safehouses','vehicles','settings','sandbox','config_updated_at'] LOOP
    IF NOT s ? k THEN RAISE EXCEPTION 'FAIL: key % missing', k; END IF;
  END LOOP;
  RAISE NOTICE 'PASS every key is present';

  IF s->>'server_name' <> 'Home Test Server' THEN RAISE EXCEPTION 'FAIL: server_name %', s->>'server_name'; END IF;
  IF (s->>'up_since')::timestamptz <> '2026-10-01 05:13:00+00'::timestamptz THEN
    RAISE EXCEPTION 'FAIL: up_since %', s->>'up_since';
  END IF;
  RAISE NOTICE 'PASS name and up_since (launch stamp read as UTC)';

  IF (s->>'online_now')::int <> 2 THEN RAISE EXCEPTION 'FAIL: online_now %', s->>'online_now'; END IF;
  IF (s->>'survivors_total')::int <> 9 THEN RAISE EXCEPTION 'FAIL: survivors_total %', s->>'survivors_total'; END IF;
  IF (s->>'survivors_7d')::int <> 8 THEN RAISE EXCEPTION 'FAIL: survivors_7d %', s->>'survivors_7d'; END IF;
  RAISE NOTICE 'PASS online, total and 7-day survivor counts';

  IF (s->>'peak_7d')::int <> 6 THEN RAISE EXCEPTION 'FAIL: peak_7d % (the 8-day-old 99 must not count)', s->>'peak_7d'; END IF;
  IF jsonb_array_length(s->'hourly_7d') <> 3 THEN
    RAISE EXCEPTION 'FAIL: hourly_7d has % hours, expected 3', jsonb_array_length(s->'hourly_7d');
  END IF;
  IF (s->'hourly_7d'->0->>1)::int <> 4 OR (s->'hourly_7d'->1->>1)::int <> 6 THEN
    RAISE EXCEPTION 'FAIL: hourly peaks or order wrong: %', s->'hourly_7d';
  END IF;
  RAISE NOTICE 'PASS peak and hourly series (max per hour, oldest first, week only)';

  IF (s->>'zombies_killed_today')::int <> 1234 OR (s->>'players_killed_today')::int <> 3 THEN
    RAISE EXCEPTION 'FAIL: daily counters % %', s->>'zombies_killed_today', s->>'players_killed_today';
  END IF;
  RAISE NOTICE 'PASS daily counters from the newest sample';

  IF jsonb_array_length(s->'longest_survivors') <> 5 THEN
    RAISE EXCEPTION 'FAIL: % survivors listed, expected 5', jsonb_array_length(s->'longest_survivors');
  END IF;
  IF s->'longest_survivors'->0->>'name' <> 'Ann' OR (s->'longest_survivors'->0->>'hours')::numeric <> 300.0 THEN
    RAISE EXCEPTION 'FAIL: first survivor %', s->'longest_survivors'->0;
  END IF;
  IF s->'longest_survivors'->2->>'name' <> 'u3' THEN
    RAISE EXCEPTION 'FAIL: a blank display name should fall back to the account name, got %', s->'longest_survivors'->2;
  END IF;
  IF (s->'longest_survivors')::text LIKE '%Zed%' OR (s->'longest_survivors')::text LIKE '%Nil%' THEN
    RAISE EXCEPTION 'FAIL: a dead character or one without hours was listed';
  END IF;
  IF (s->'longest_survivors')::text LIKE '%admin%' THEN
    RAISE EXCEPTION 'FAIL: the access level leaked into the survivor list';
  END IF;
  RAISE NOTICE 'PASS longest survivors: top 5 living, rounded, dead excluded';

  IF (s->>'safehouses')::int <> 2 OR (s->>'vehicles')::int <> 3 THEN
    RAISE EXCEPTION 'FAIL: counts % %', s->>'safehouses', s->>'vehicles';
  END IF;
  RAISE NOTICE 'PASS safehouse and vehicle counts';

  IF s->'settings'->>'PVP' <> 'false' OR (s->'settings'->>'MaxPlayers')::int <> 32
     OR s->'settings'->>'HasPassword' <> 'true' THEN
    RAISE EXCEPTION 'FAIL: listed settings missing: %', s->'settings';
  END IF;
  IF s->'settings' ?| ARRAY['DefaultPort', 'UDPPort', 'server_browser_announced_ip', 'MaxAccountsPerUser'] THEN
    RAISE EXCEPTION 'FAIL: an unlisted setting was published: %', s->'settings';
  END IF;
  IF s->'sandbox'->'ZombieLore.Speed'->>'label' <> 'Fast Shamblers' OR s->'sandbox' ? 'LootItemRemovalList' THEN
    RAISE EXCEPTION 'FAIL: sandbox subset wrong: %', s->'sandbox';
  END IF;
  RAISE NOTICE 'PASS only the listed settings and sandbox values are published';
END $$;

DO $$
DECLARE
  s jsonb := aurora.home_summary('no-such-server');
BEGIN
  IF s->>'online_now' <> '0' OR s->'hourly_7d' <> '[]'::jsonb OR s->'settings' <> '{}'::jsonb
     OR s->'longest_survivors' <> '[]'::jsonb OR s->'server_name' <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FAIL: an unknown server should give zeros, empty lists and nulls: %', s;
  END IF;
  RAISE NOTICE 'PASS an unknown server gives zeros, empty lists and nulls';
END $$;

-- ============================================================================
-- 2. ANON: what stays private
-- ============================================================================

DO $$
BEGIN
  BEGIN
    PERFORM 1 FROM aurora.server_config;
    RAISE EXCEPTION 'FAIL: anon read aurora.server_config';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read aurora.server_config';
  END;

  BEGIN
    PERFORM access_level FROM aurora.players;
    RAISE EXCEPTION 'FAIL: anon read players.access_level';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read players.access_level';
  END;

  BEGIN
    PERFORM first_seen FROM aurora.players;
    RAISE EXCEPTION 'FAIL: anon read players.first_seen';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read players.first_seen';
  END;

  PERFORM hours_survived, is_dead, display_name FROM aurora.players_public WHERE server_id = 'test-home';
  IF (SELECT count(*) FROM aurora.players_public WHERE server_id = 'test-home') <> 9 THEN
    RAISE EXCEPTION 'FAIL: anon should still read the roster';
  END IF;
  RAISE NOTICE 'PASS anon still reads the roster with hours survived and the dead flag';
END $$;

RESET ROLE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'aurora' AND table_name = 'players_public'
                AND column_name IN ('access_level', 'first_seen')) THEN
    RAISE EXCEPTION 'FAIL: players_public still has access_level or first_seen';
  END IF;
  RAISE NOTICE 'PASS players_public no longer has access_level or first_seen';
END $$;

-- ============================================================================
-- 3. SIGNED IN: members see nothing more, admins read the settings
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.server_config) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a member read aurora.server_config';
  END IF;
  RAISE NOTICE 'PASS a member reads no server_config rows';
  BEGIN
    PERFORM access_level FROM aurora.players;
    RAISE EXCEPTION 'FAIL: a member read players.access_level';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS a member cannot read players.access_level';
  END;
  IF (aurora.home_summary('test-home')->>'online_now')::int <> 2 THEN
    RAISE EXCEPTION 'FAIL: a member could not read the summary';
  END IF;
  RAISE NOTICE 'PASS a member reads the summary';
END $$;

SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.server_config WHERE server_id = 'test-home') <> 1 THEN
    RAISE EXCEPTION 'FAIL: an admin could not read aurora.server_config';
  END IF;
  RAISE NOTICE 'PASS an admin reads aurora.server_config';
END $$;

RESET ROLE;

-- ============================================================================
-- 4. SERVICE ROLE: the ingest can write the settings
-- ============================================================================

SET LOCAL ROLE service_role;

DO $$
BEGIN
  INSERT INTO aurora.server_config (server_id, settings) VALUES ('test-home', '{"PVP": true}'::jsonb)
  ON CONFLICT (server_id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW();
  IF (SELECT settings->>'PVP' FROM aurora.server_config WHERE server_id = 'test-home') <> 'true' THEN
    RAISE EXCEPTION 'FAIL: service_role upsert did not land';
  END IF;
  RAISE NOTICE 'PASS service_role upserts aurora.server_config';
END $$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL HOME SUMMARY TESTS PASSED'; END $$;

ROLLBACK;
