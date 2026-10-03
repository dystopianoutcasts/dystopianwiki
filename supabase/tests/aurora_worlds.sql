-- Tests for migration 032: worlds, the current-world filter, admin world controls.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL WORLD TESTS PASSED", or stops at the first failure.
--
-- "Running 032 twice is fine" cannot be asserted from inside this file; the run
-- script applies the migration twice, with committed rows in between, before running
-- this. The migration's own bootstrap ran before these fixtures existed, so the file
-- calls aurora.world_bootstrap() itself after seeding (the same function the
-- migration runs).
--
-- The story, on server 'test-w' (server 'test-w2' must never be touched or leak in):
--   bootstrap w1 -> exporter id A (age 500) ADOPTED by w1 -> id B (age 0.5) switches
--   to w2 -> B again is a no-op -> C (age 100) pends as w3, dismissed -> D (age 100)
--   pends as w4, confirmed -> undo to w2 -> undo refused after 24 h -> undo to w1 ->
--   start_new_world w5 -> id E adopted by w5 -> prune w1 after 30 days.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'ffffffff-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'world-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'ffffffff-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'world-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('test-w',  'World Test Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW()),
  ('test-w2', 'Other Server',      TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());

-- Anonymous visitors get positions, live and exact, so the delayed half has rows.
UPDATE aurora.settings
   SET value = '{"anonPositions": true, "delayMinutes": 0, "roundToCell": false}'::jsonb
 WHERE key = 'visibility';

INSERT INTO aurora.players
  (server_id, username, display_name, first_seen, last_seen, online, hours_survived, is_dead, last_saved_x, last_saved_y) VALUES
  ('test-w',  'alice', 'Alice', TIMESTAMPTZ '2026-01-02 00:00:00+00', NOW(), TRUE, 50.5, FALSE, 10, 20),
  ('test-w',  'bob',   'Bob',   TIMESTAMPTZ '2026-01-03 00:00:00+00', NOW(), TRUE, 7.25, TRUE,  30, 40),
  ('test-w2', 'zed',   'Zed',   TIMESTAMPTZ '2026-01-04 00:00:00+00', NOW(), TRUE, 3,    FALSE, 1,  2);

INSERT INTO aurora.player_positions (server_id, username, x, y, z, t) VALUES
  ('test-w',  'alice', 100, 200, 0, NOW()),
  ('test-w2', 'zed',   1,   2,   0, NOW());

INSERT INTO aurora.player_position_history (server_id, username, x, y, z, t) VALUES
  ('test-w',  'alice', 101, 201, 0, NOW() - INTERVAL '1 minute'),
  ('test-w2', 'zed',   1,   2,   0, NOW() - INTERVAL '1 minute');

INSERT INTO aurora.vehicles (server_id, vehicle_id, sql_id, script_name, x, y, z, t, claimed_by) VALUES
  ('test-w',  1, 11, 'Base.CarNormal', 300, 300, 0, NOW(), 'alice'),
  ('test-w',  2, 13, 'Base.Pickup',    310, 310, 0, NOW(), NULL),
  ('test-w2', 1, 11, 'Base.CarNormal', 1,   1,   0, NOW(), NULL);

INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner, script, name, x, y, claimed_at, last_seen) VALUES
  ('test-w',  11, 'alice', 'Base.CarNormal', 'Car',  300, 300, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
  ('test-w',  12, 'bob',   'Base.Van',       'Van',  5,   6,   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
  ('test-w2', 11, 'zed',   'Base.CarNormal', 'Car',  1,   1,   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour');

INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, players) VALUES
  ('test-w',  'sh1', 10, 10, 5, 5, 'alice', 'Alice Base', ARRAY['bob']),
  ('test-w2', 'sh9', 1,  1,  5, 5, 'zed',   'Zed Base',   ARRAY[]::TEXT[]);

INSERT INTO aurora.zones (server_id, kind, title, x1, y1, x2, y2) VALUES
  ('test-w',  'pvp', 'Zone A', 1, 1, 2, 2),
  ('test-w2', 'pvp', 'Zone Z', 1, 1, 2, 2);
-- A leftover of test-w2 tagged 'w2' (world ids are per server): an undo on test-w from
-- w2 back to w1 must not re-tag it.
INSERT INTO aurora.zones (server_id, kind, title, x1, y1, x2, y2, world_id) VALUES
  ('test-w2', 'pvp', 'Zone Z old', 3, 3, 4, 4, 'w2');

INSERT INTO aurora.zombie_grid (server_id, cell_x, cell_y, count, t) VALUES
  ('test-w',  1, 1, 5, NOW()),
  ('test-w2', 1, 1, 9, NOW());

INSERT INTO aurora.map_objects (server_id, kind, x, y, label, meta) VALUES
  ('test-w',  'marker', 1, 1, 'Old Marker', '{"secret": 1}'::jsonb),
  ('test-w2', 'marker', 1, 1, 'Zed Marker', '{}'::jsonb);

INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived) VALUES
  ('test-w',  'alice', 111, 111, 0, NOW() - INTERVAL '1 second', 'isdead', 50),
  ('test-w',  'bob',   112, 112, 0, NOW() - INTERVAL '1 second', 'isdead', 7),
  ('test-w2', 'zed',   1,   1,   0, NOW() - INTERVAL '1 second', 'isdead', 3);

INSERT INTO aurora.npc_groups (server_id, group_id, faction_name, stance, size, x, y, z, active, sensitive) VALUES
  ('test-w',  'squad:1', 'Road Raiders', 'hostile', 3, 1, 1, 0, TRUE, FALSE),
  ('test-w2', 'squad:9', 'Other Folk',   'neutral', 1, 1, 1, 0, TRUE, FALSE);

INSERT INTO aurora.npc_outposts (server_id, outpost_id, faction_name, stance, hostile, x1, y1, x2, y2, z, state, hidden) VALUES
  ('test-w',  'site:1', 'Road Raiders', 'hostile', TRUE,  1, 1, 2, 2, 0, 'built', FALSE),
  ('test-w2', 'site:9', 'Other Folk',   'neutral', FALSE, 1, 1, 2, 2, 0, 'built', FALSE);

INSERT INTO aurora.health_samples (server_id, t, players, raw) VALUES
  ('test-w',  NOW() - INTERVAL '10 seconds', 3,
   '{"game": {"zombies-killed": 100, "world-age-hours": 500}}'::jsonb),
  ('test-w2', NOW() - INTERVAL '10 seconds', 1,
   '{"game": {"zombies-killed": 1, "world-age-hours": 9}}'::jsonb);

-- A schema of test helpers, rolled back with everything else. snap() runs with the
-- CALLER's privileges and counts what that caller sees of one server on every public
-- surface.
CREATE SCHEMA t47;
CREATE FUNCTION t47.snap(p_server TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT format('sh=%s zo=%s zg=%s mo=%s vc=%s pl=%s pp=%s vv=%s ng=%s no=%s de=%s',
    (SELECT count(*) FROM aurora.safehouses WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.zones WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.zombie_grid WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.map_objects WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.players_public WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.player_positions_visible WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.npc_groups_visible WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.npc_outposts_visible WHERE server_id = p_server),
    (SELECT count(*) FROM aurora.deaths_visible WHERE server_id = p_server));
$$;
GRANT USAGE ON SCHEMA t47 TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION t47.snap(TEXT) TO anon, authenticated, service_role;

-- Rows of one server per world, across all 13 tagged tables (postgres only).
CREATE FUNCTION t47.tagged(p_server TEXT, p_world TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_t TEXT;
  v_n BIGINT;
  v_total BIGINT := 0;
BEGIN
  FOREACH v_t IN ARRAY aurora.world_tagged_tables() LOOP
    IF p_world IS NULL THEN
      EXECUTE format('SELECT count(*) FROM aurora.%I WHERE server_id = $1 AND world_id IS NULL', v_t) INTO v_n USING p_server;
    ELSE
      EXECUTE format('SELECT count(*) FROM aurora.%I WHERE server_id = $1 AND world_id = $2', v_t) INTO v_n USING p_server, p_world;
    END IF;
    v_total := v_total + v_n;
  END LOOP;
  RETURN v_total;
END $$;

-- ============================================================================
-- 0. SHAPE: new objects exist; the public views' column lists are unchanged
-- ============================================================================

DO $$
DECLARE
  cols text;
  v_t text;
BEGIN
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.worlds'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,world_id,seq,exporter_world_id,status,detected_by,started_at,ended_at,world_age_hours_at_start,exporter_started_ms,note,created_at' THEN
    RAISE EXCEPTION 'FAIL: aurora.worlds columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.player_history'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,world_id,username,display_name,hours_survived,is_dead,first_seen,last_seen,last_saved_x,last_saved_y,archived_at' THEN
    RAISE EXCEPTION 'FAIL: aurora.player_history columns are %', cols;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'aurora' AND table_name = 'servers' AND column_name = 'current_world_id') THEN
    RAISE EXCEPTION 'FAIL: servers.current_world_id missing';
  END IF;
  FOREACH v_t IN ARRAY ARRAY['health_samples','players','player_positions','player_position_history','vehicles',
                             'vehicle_claims','safehouses','zones','zombie_grid','map_objects','deaths',
                             'npc_groups','npc_outposts'] LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'aurora' AND table_name = v_t AND column_name = 'world_id') THEN
      RAISE EXCEPTION 'FAIL: %.world_id missing', v_t;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'aurora' AND tablename = v_t
                    AND indexdef LIKE '%(server_id, world_id%') THEN
      RAISE EXCEPTION 'FAIL: no (server_id, world_id) index on %', v_t;
    END IF;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'aurora' AND tablename = 'worlds'
                  AND indexdef LIKE '%UNIQUE%(server_id)%WHERE%current%') THEN
    RAISE EXCEPTION 'FAIL: no partial unique index for one current world per server';
  END IF;
  RAISE NOTICE 'PASS worlds, player_history, current_world_id, world_id and its index on all 13 tables';

  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.players_public'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,username,display_name,last_seen,online,hours_survived,is_dead' THEN
    RAISE EXCEPTION 'FAIL: players_public columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.player_positions_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,username,x,y,z,t,vehicle_id,is_delayed,is_rounded' THEN
    RAISE EXCEPTION 'FAIL: player_positions_visible columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.vehicles_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,vehicle_id,script_name,x,y,z,t,claimed_by,sql_id,from_ledger' THEN
    RAISE EXCEPTION 'FAIL: vehicles_visible columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.npc_groups_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,group_id,faction_name,stance,size,x,y,z,active,t' THEN
    RAISE EXCEPTION 'FAIL: npc_groups_visible columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.npc_outposts_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,outpost_id,faction_name,stance,hostile,x1,y1,x2,y2,t' THEN
    RAISE EXCEPTION 'FAIL: npc_outposts_visible columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols FROM pg_attribute
   WHERE attrelid = 'aurora.deaths_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,username,x,y,z,t,hours_survived' THEN
    RAISE EXCEPTION 'FAIL: deaths_visible columns are %', cols;
  END IF;
  RAISE NOTICE 'PASS the six public views keep their column lists';

  IF to_regprocedure('aurora.deaths_admin(text)') IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the one-argument deaths_admin overload still exists';
  END IF;
  IF to_regprocedure('aurora.deaths_admin(text,text)') IS NULL THEN
    RAISE EXCEPTION 'FAIL: deaths_admin(text, text) missing';
  END IF;
  RAISE NOTICE 'PASS deaths_admin has exactly one form, (p_server, p_world_id DEFAULT NULL)';
END $$;

-- ============================================================================
-- 1. GRANTS: anon reaches no admin or service function; clients read no new table
-- ============================================================================

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'aurora.register_world(text,text,boolean,real,bigint)',
    'aurora.world_switch(text,text,text,real,bigint,text,text)',
    'aurora.prune_old_worlds(integer,integer)',
    'aurora.world_retag(text,text,text)',
    'aurora.world_bootstrap()',
    'aurora.worlds_admin(text)', 'aurora.start_new_world(text,text)',
    'aurora.confirm_pending_world(text,text)', 'aurora.dismiss_pending_world(text,text)',
    'aurora.undo_new_world(text)', 'aurora.world_leftovers(text)',
    'aurora.player_history_admin(text,text)', 'aurora.deaths_admin(text,text)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: anon may execute %', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    'aurora.register_world(text,text,boolean,real,bigint)',
    'aurora.world_switch(text,text,text,real,bigint,text,text)',
    'aurora.prune_old_worlds(integer,integer)',
    'aurora.world_retag(text,text,text)', 'aurora.world_bootstrap()'] LOOP
    IF has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: authenticated may execute %', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    'aurora.register_world(text,text,boolean,real,bigint)',
    'aurora.world_switch(text,text,text,real,bigint,text,text)',
    'aurora.prune_old_worlds(integer,integer)'] LOOP
    IF NOT has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: service_role cannot execute %', f;
    END IF;
  END LOOP;
  IF NOT has_function_privilege('anon', 'aurora.current_world(text)', 'EXECUTE')
     OR NOT has_function_privilege('anon', 'aurora.is_current_world(text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon cannot execute current_world / is_current_world';
  END IF;
  IF has_table_privilege('anon', 'aurora.worlds', 'SELECT') OR has_table_privilege('authenticated', 'aurora.worlds', 'SELECT')
     OR has_table_privilege('anon', 'aurora.player_history', 'SELECT')
     OR has_table_privilege('authenticated', 'aurora.player_history', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: a client role can read worlds or player_history';
  END IF;
  IF has_column_privilege('anon', 'aurora.players', 'world_id', 'SELECT')
     OR has_column_privilege('anon', 'aurora.safehouses', 'world_id', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: the column grants were widened to world_id';
  END IF;
  RAISE NOTICE 'PASS anon reaches no admin or service function, clients read neither new table, column grants unchanged';
END $$;

-- ============================================================================
-- 2. BOOTSTRAP: w1 for every server, untagged rows stamped
-- ============================================================================

DO $$
DECLARE
  n int;
  w aurora.worlds;
BEGIN
  IF t47.tagged('test-w', NULL) = 0 THEN RAISE EXCEPTION 'FAIL: fixture rows were not untagged'; END IF;
  n := aurora.world_bootstrap();
  IF n < 2 THEN RAISE EXCEPTION 'FAIL: bootstrap made % worlds, expected at least 2', n; END IF;
  SELECT * INTO w FROM aurora.worlds WHERE server_id = 'test-w';
  IF w.world_id <> 'w1' OR w.seq <> 1 OR w.status <> 'current' OR w.detected_by <> 'migration'
     OR w.started_at <> TIMESTAMPTZ '2026-01-01 00:00:00+00' OR w.exporter_world_id IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: bootstrap world is %', row_to_json(w);
  END IF;
  IF (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') IS DISTINCT FROM 'w1'
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w2') IS DISTINCT FROM 'w1' THEN
    RAISE EXCEPTION 'FAIL: servers.current_world_id not set';
  END IF;
  IF t47.tagged('test-w', NULL) <> 0 OR t47.tagged('test-w', 'w1') <> 17 THEN
    RAISE EXCEPTION 'FAIL: bootstrap stamped % rows w1 and left % untagged (expected 17 and 0)',
      t47.tagged('test-w', 'w1'), t47.tagged('test-w', NULL);
  END IF;
  IF t47.tagged('test-w2', 'w1') <> 13 THEN
    RAISE EXCEPTION 'FAIL: test-w2 has % w1 rows, expected 14', t47.tagged('test-w2', 'w1');
  END IF;
  IF aurora.world_bootstrap() <> 0 OR (SELECT count(*) FROM aurora.worlds WHERE server_id IN ('test-w', 'test-w2')) <> 2 THEN
    RAISE EXCEPTION 'FAIL: a second bootstrap changed something';
  END IF;
  RAISE NOTICE 'PASS bootstrap created w1 (migration, started at first_seen), stamped every row, and is idempotent';
END $$;

-- ============================================================================
-- 3. is_current_world
-- ============================================================================

DO $$
BEGIN
  IF aurora.is_current_world('test-w', NULL) IS NOT TRUE THEN RAISE EXCEPTION 'FAIL: NULL tag is not current'; END IF;
  IF aurora.is_current_world('test-w', 'w1') IS NOT TRUE THEN RAISE EXCEPTION 'FAIL: w1 is not current'; END IF;
  IF aurora.is_current_world('test-w', 'w9') IS NOT FALSE THEN RAISE EXCEPTION 'FAIL: w9 is current'; END IF;
  IF aurora.is_current_world('no-such-server', 'w1') IS NOT FALSE THEN RAISE EXCEPTION 'FAIL: an unknown server is not FALSE'; END IF;
  RAISE NOTICE 'PASS is_current_world: NULL counts as current, another world does not, never NULL';
END $$;

-- ============================================================================
-- 4. ANON BASELINE: everything of w1 is visible
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  s text := t47.snap('test-w');
BEGIN
  IF s <> 'sh=1 zo=1 zg=1 mo=1 vc=2 pl=2 pp=1 vv=3 ng=1 no=1 de=2' THEN
    RAISE EXCEPTION 'FAIL: anon baseline on test-w is %', s;
  END IF;
  IF t47.snap('test-w2') <> 'sh=1 zo=1 zg=1 mo=1 vc=1 pl=1 pp=1 vv=1 ng=1 no=1 de=1' THEN
    RAISE EXCEPTION 'FAIL: anon baseline on test-w2 is %', t47.snap('test-w2');
  END IF;
  IF (SELECT count(*) FROM aurora.current_world('test-w')) <> 1
     OR (SELECT world_id FROM aurora.current_world('test-w')) <> 'w1' THEN
    RAISE EXCEPTION 'FAIL: anon cannot read current_world';
  END IF;
  RAISE NOTICE 'PASS anon sees the bootstrap world on every public surface, and reads current_world';
END $$;

RESET ROLE;

-- ============================================================================
-- 5. register_world: validation and ADOPT
-- ============================================================================

SET LOCAL ROLE service_role;

DO $$
DECLARE
  bad text;
  r jsonb;
  ok boolean;
BEGIN
  FOREACH bad IN ARRAY ARRAY['short', 'has space-123', repeat('a', 65), 'semi;colon-1', 'under_score1'] LOOP
    ok := FALSE;
    BEGIN
      PERFORM aurora.register_world('test-w', bad, TRUE, 1, 1);
    EXCEPTION WHEN invalid_parameter_value THEN ok := TRUE;
    END;
    IF NOT ok THEN RAISE EXCEPTION 'FAIL: register_world accepted the id %', bad; END IF;
  END LOOP;
  ok := FALSE;
  BEGIN
    PERFORM aurora.register_world('test-w', NULL, TRUE, 1, 1);
  EXCEPTION WHEN invalid_parameter_value THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: register_world accepted a NULL id'; END IF;
  ok := FALSE;
  BEGIN
    PERFORM aurora.register_world('no-such-server', '11111111-aaaa-4bbb-8ccc-000000000001', TRUE, 1, 1);
  EXCEPTION WHEN invalid_parameter_value THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: register_world accepted an unknown server'; END IF;
  RAISE NOTICE 'PASS register_world refuses a malformed id, a NULL id and an unknown server';

  -- The exporter's first report after 032: a UUID, a long-running world.
  r := aurora.register_world('test-w', '11111111-aaaa-4bbb-8ccc-000000000001', FALSE, 500, 1700000000000);
  IF r <> '{"world_id": "w1", "status": "current", "switched": false, "adopted": true}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: first report returned %', r;
  END IF;
  RAISE NOTICE 'PASS a 36-character UUID with dashes is accepted';
END $$;

RESET ROLE;

DO $$
DECLARE
  w aurora.worlds;
BEGIN
  SELECT * INTO w FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w1';
  IF w.status <> 'current' OR w.exporter_world_id <> '11111111-aaaa-4bbb-8ccc-000000000001'
     OR w.exporter_started_ms <> 1700000000000 OR w.world_age_hours_at_start <> 500 THEN
    RAISE EXCEPTION 'FAIL: adopted world is %', row_to_json(w);
  END IF;
  IF (SELECT count(*) FROM aurora.worlds WHERE server_id = 'test-w') <> 1 THEN
    RAISE EXCEPTION 'FAIL: adoption created a world (pending or switched)';
  END IF;
  IF t47.tagged('test-w', 'w1') <> 17 THEN RAISE EXCEPTION 'FAIL: adoption moved rows'; END IF;
  RAISE NOTICE 'PASS an unknown id with age 500 is ADOPTED by the id-less bootstrap world: still w1, nothing pending';
END $$;

-- Rows written untagged before the switch (an importer that does not tag yet).
INSERT INTO aurora.zones (server_id, kind, title, x1, y1) VALUES ('test-w', 'pvp', 'Zone Untagged', 5, 5);

SET LOCAL ROLE anon;
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.zones WHERE server_id = 'test-w') <> 2 THEN
    RAISE EXCEPTION 'FAIL: an untagged zone is not visible (NULL must count as current)';
  END IF;
  RAISE NOTICE 'PASS an untagged row is visible to anon';
END $$;
RESET ROLE;

-- ============================================================================
-- 6. A NEW WORLD (age 0.5) SWITCHES; the same id again is a no-op
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
DECLARE
  r jsonb;
BEGIN
  r := aurora.register_world('test-w', '22222222-aaaa-4bbb-8ccc-000000000002', TRUE, 0.5, 1700000100000);
  IF r <> '{"world_id": "w2", "status": "current", "switched": true}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: a new id with age 0.5 returned %', r;
  END IF;
  r := aurora.register_world('test-w', '22222222-aaaa-4bbb-8ccc-000000000002', TRUE, 0.6, 1700000100000);
  IF r <> '{"world_id": "w2", "status": "current", "switched": false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the same id again returned %', r;
  END IF;
  RAISE NOTICE 'PASS a new id with age 0.5 switches to w2; the same id twice is a no-op';
END $$;
RESET ROLE;

DO $$
DECLARE
  h aurora.player_history;
  p aurora.players;
BEGIN
  IF (SELECT count(*) FROM aurora.worlds WHERE server_id = 'test-w') <> 2 THEN
    RAISE EXCEPTION 'FAIL: the no-op created a world';
  END IF;
  IF (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w1') <> 'ended'
     OR (SELECT ended_at FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w1') IS NULL
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') <> 'w2'
     OR (SELECT detected_by FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w2') <> 'exporter' THEN
    RAISE EXCEPTION 'FAIL: w1 not ended or w2 not current';
  END IF;
  IF t47.tagged('test-w', NULL) <> 0 OR t47.tagged('test-w', 'w1') <> 18 THEN
    RAISE EXCEPTION 'FAIL: the switch did not stamp the untagged zone with w1 (untagged %, w1 %)',
      t47.tagged('test-w', NULL), t47.tagged('test-w', 'w1');
  END IF;
  RAISE NOTICE 'PASS w1 ended, w2 current, untagged rows stamped with the ENDING world';

  SELECT * INTO h FROM aurora.player_history WHERE server_id = 'test-w' AND world_id = 'w1' AND username = 'alice';
  IF h.username IS NULL OR h.display_name <> 'Alice' OR h.hours_survived <> 50.5 OR h.is_dead IS NOT FALSE
     OR h.last_saved_x <> 10 OR h.last_saved_y <> 20 OR h.first_seen <> TIMESTAMPTZ '2026-01-02 00:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: alice archive is %', row_to_json(h);
  END IF;
  IF (SELECT count(*) FROM aurora.player_history WHERE server_id = 'test-w' AND world_id = 'w1') <> 2 THEN
    RAISE EXCEPTION 'FAIL: player_history does not hold both w1 players';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.player_history WHERE server_id = 'test-w2') THEN
    RAISE EXCEPTION 'FAIL: the other server''s players were archived';
  END IF;
  RAISE NOTICE 'PASS player_history holds the w1 archive of both players, and nothing of the other server';

  SELECT * INTO p FROM aurora.players WHERE server_id = 'test-w' AND username = 'alice';
  IF p.hours_survived IS NOT NULL OR p.is_dead IS NOT NULL OR p.last_saved_x IS NOT NULL OR p.last_saved_y IS NOT NULL
     OR p.online OR p.display_name <> 'Alice' OR p.first_seen <> TIMESTAMPTZ '2026-01-02 00:00:00+00'
     OR p.last_seen IS NULL THEN
    RAISE EXCEPTION 'FAIL: alice after the switch is %', row_to_json(p);
  END IF;
  IF (SELECT hours_survived FROM aurora.players WHERE server_id = 'test-w2' AND username = 'zed') <> 3
     OR NOT (SELECT online FROM aurora.players WHERE server_id = 'test-w2' AND username = 'zed')
     OR t47.tagged('test-w2', 'w1') <> 13 THEN
    RAISE EXCEPTION 'FAIL: the switch touched the other server';
  END IF;
  RAISE NOTICE 'PASS per-world player fields cleared (display_name, first_seen, last_seen kept); other server untouched';
END $$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.safehouses WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world safehouse'; END IF;
  IF (SELECT count(*) FROM aurora.zones WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world zone'; END IF;
  IF (SELECT count(*) FROM aurora.zombie_grid WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world zombie_grid cell'; END IF;
  IF (SELECT count(*) FROM aurora.map_objects WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world map object'; END IF;
  IF (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world vehicle claim'; END IF;
  IF (SELECT count(*) FROM aurora.players_public WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world player'; END IF;
  IF (SELECT count(*) FROM aurora.player_positions_visible WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world position'; END IF;
  IF (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world car'; END IF;
  IF (SELECT count(*) FROM aurora.npc_groups_visible WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world NPC group'; END IF;
  IF (SELECT count(*) FROM aurora.npc_outposts_visible WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world outpost'; END IF;
  IF (SELECT count(*) FROM aurora.deaths_visible WHERE server_id = 'test-w') <> 0 THEN RAISE EXCEPTION 'FAIL: anon sees an old-world death'; END IF;
  RAISE NOTICE 'PASS after the switch anon sees no old-world row in any public view or direct-read table';
  IF t47.snap('test-w2') <> 'sh=1 zo=1 zg=1 mo=1 vc=1 pl=1 pp=1 vv=1 ng=1 no=1 de=1' THEN
    RAISE EXCEPTION 'FAIL: the other server lost rows: %', t47.snap('test-w2');
  END IF;
  RAISE NOTICE 'PASS the other server still shows everything';
END $$;
RESET ROLE;

-- ============================================================================
-- 7. THE NEW WORLD FILLS UP
-- ============================================================================
-- alice plays w2; her only position history is w1 so far. A new car reuses sql id 11
-- (sql ids restart with a new save) while w1's claim on 11 and claim 12 are still in
-- the ledger file. bob dies in w2 at an EARLIER game time than his w1 death.

UPDATE aurora.players
   SET world_id = 'w2', online = TRUE, hours_survived = 1.5, is_dead = FALSE, last_saved_x = 55, last_saved_y = 66
 WHERE server_id = 'test-w' AND username = 'alice';

SET LOCAL ROLE anon;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM aurora.player_positions_visible WHERE server_id = 'test-w' AND username = 'alice') THEN
    RAISE EXCEPTION 'FAIL: positions_delayed returns alice''s old-world position';
  END IF;
  RAISE NOTICE 'PASS an online player of the new world is not drawn at an old-world position';
END $$;
RESET ROLE;

INSERT INTO aurora.player_position_history (server_id, username, x, y, z, t, world_id) VALUES
  ('test-w', 'alice', 777, 778, 0, NOW() - INTERVAL '30 minutes', 'w2');

SET LOCAL ROLE service_role;
SELECT aurora.upsert_vehicles('test-w',
  '[{"vehicle_id": 5, "sql_id": 11, "script_name": "Base.CarNormal", "x": 900, "y": 900, "z": 0, "t": "2026-10-02T00:00:00Z", "driver_username": null, "claimed_by": null}]'::jsonb);
UPDATE aurora.vehicles SET t = NOW() WHERE server_id = 'test-w' AND sql_id = 11;
-- The claim mod's file still lists both old claims: nothing is released.
SELECT aurora.release_missing_claims('test-w', ARRAY[11, 12]::BIGINT[]);
RESET ROLE;

INSERT INTO aurora.deaths (server_id, username, x, y, z, t, src, hours_survived, world_id) VALUES
  ('test-w', 'bob', 222, 222, 0, NOW() - INTERVAL '2 seconds', 'isdead', 1, 'w2');
INSERT INTO aurora.health_samples (server_id, t, players, raw, world_id) VALUES
  ('test-w', NOW() - INTERVAL '20 seconds', 1, '{"game": {"zombies-killed": 5, "world-age-hours": 0.6}}'::jsonb, 'w2');

SET LOCAL ROLE anon;
DO $$
DECLARE
  r record;
BEGIN
  SELECT * INTO r FROM aurora.player_positions_visible WHERE server_id = 'test-w' AND username = 'alice';
  IF r.x IS DISTINCT FROM 777::real THEN RAISE EXCEPTION 'FAIL: alice''s w2 position is not drawn (x %)', r.x; END IF;
  RAISE NOTICE 'PASS positions_delayed draws the new-world position';

  IF (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = 'test-w') <> 1 THEN
    RAISE EXCEPTION 'FAIL: vehicles_visible has % rows for test-w, expected only the new car',
      (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = 'test-w');
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-w' AND sql_id = 12) THEN
    RAISE EXCEPTION 'FAIL: an old-world ledger claim is on the map (the claim file still lists it)';
  END IF;
  IF (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-w' AND sql_id = 11) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the new car inherited the old world''s claim on its sql id';
  END IF;
  RAISE NOTICE 'PASS vehicles_rows hides old-world claims although the claim file still lists them; a reused sql id inherits nothing';

  SELECT * INTO r FROM aurora.deaths_visible WHERE server_id = 'test-w';
  IF (SELECT count(*) FROM aurora.deaths_visible WHERE server_id = 'test-w') <> 1 OR r.username <> 'bob' OR r.x <> 222 THEN
    RAISE EXCEPTION 'FAIL: deaths_visible is not bob''s w2 death only';
  END IF;
  RAISE NOTICE 'PASS deaths_visible: latest death per player within the current world only';
END $$;
RESET ROLE;

-- home summary as anon
SET LOCAL ROLE anon;
DO $$
DECLARE
  j jsonb := aurora.home_summary_tz('test-w', 'UTC');
BEGIN
  IF (j->>'survivors_total')::int <> 1 THEN RAISE EXCEPTION 'FAIL: survivors_total %', j->'survivors_total'; END IF;
  IF (j->>'survivors_7d')::int <> 1 THEN RAISE EXCEPTION 'FAIL: survivors_7d %', j->'survivors_7d'; END IF;
  IF (j->>'online_now')::int <> 1 THEN RAISE EXCEPTION 'FAIL: online_now %', j->'online_now'; END IF;
  IF j->'longest_survivors' <> '[{"name": "Alice", "hours": 1.5, "online": true}]'::jsonb THEN
    RAISE EXCEPTION 'FAIL: longest_survivors %', j->'longest_survivors';
  END IF;
  IF (j->>'players_killed_today')::int <> 1 THEN RAISE EXCEPTION 'FAIL: players_killed_today %', j->'players_killed_today'; END IF;
  IF (j->>'zombies_killed_today')::numeric <> 5 THEN RAISE EXCEPTION 'FAIL: zombies_killed_today %', j->'zombies_killed_today'; END IF;
  IF (j->>'world_age_hours')::numeric <> 0.6 THEN RAISE EXCEPTION 'FAIL: world_age_hours %', j->'world_age_hours'; END IF;
  IF (j->>'safehouses')::int <> 0 THEN RAISE EXCEPTION 'FAIL: safehouses %', j->'safehouses'; END IF;
  IF (j->>'vehicles')::int <> 1 THEN RAISE EXCEPTION 'FAIL: vehicles %', j->'vehicles'; END IF;
  IF (j->>'peak_7d')::int <> 3 THEN RAISE EXCEPTION 'FAIL: peak_7d % (server activity stays unfiltered)', j->'peak_7d'; END IF;
  IF (j->>'world_seq')::int <> 2 OR j->'world_pending' <> 'false'::jsonb OR j->'world_started_at' IS NULL
     OR jsonb_typeof(j->'world_started_at') <> 'string' THEN
    RAISE EXCEPTION 'FAIL: world keys % % %', j->'world_seq', j->'world_pending', j->'world_started_at';
  END IF;
  IF NOT (j ?& ARRAY['server_name','last_seen','up_since','online_now','survivors_total','survivors_7d','peak_7d',
                     'hourly_7d','zombies_killed_today','players_killed_today','world_age_hours','game_version',
                     'day_tz','longest_survivors','safehouses','vehicles','settings','sandbox','config_updated_at',
                     'world_seq','world_started_at','world_pending']) THEN
    RAISE EXCEPTION 'FAIL: a home summary key is missing: %', (SELECT string_agg(k, ',') FROM jsonb_object_keys(j) k);
  END IF;
  RAISE NOTICE 'PASS home_summary_tz counts current-world players, deaths, kills, age and safehouses; peak_7d unfiltered; world keys present';
END $$;
RESET ROLE;

-- ============================================================================
-- 8. ADMIN AND MEMBER READS
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
DECLARE
  j jsonb;
BEGIN
  IF (SELECT count(*) FROM aurora.player_positions WHERE server_id = 'test-w') <> 0 THEN
    RAISE EXCEPTION 'FAIL: the admin live-positions policy shows an old-world position';
  END IF;
  IF (SELECT count(*) FROM aurora.player_positions WHERE server_id = 'test-w2') <> 1 THEN
    RAISE EXCEPTION 'FAIL: the admin cannot see the other server''s live position';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_groups_admin('test-w')) <> 0 OR (SELECT count(*) FROM aurora.npc_outposts_admin('test-w')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: npc admin functions return old-world rows';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_groups_admin('test-w2')) <> 1 THEN
    RAISE EXCEPTION 'FAIL: npc_groups_admin lost the other server''s current row';
  END IF;
  IF (SELECT count(*) FROM aurora.vehicles_admin('test-w')) <> 1 THEN
    RAISE EXCEPTION 'FAIL: vehicles_admin returns % rows', (SELECT count(*) FROM aurora.vehicles_admin('test-w'));
  END IF;
  IF (SELECT count(*) FROM aurora.deaths_admin('test-w')) <> 1 THEN RAISE EXCEPTION 'FAIL: deaths_admin current is not 1'; END IF;
  IF (SELECT count(*) FROM aurora.deaths_admin('test-w', 'w1')) <> 2 THEN RAISE EXCEPTION 'FAIL: deaths_admin w1 history is not 2'; END IF;
  IF (SELECT count(*) FROM aurora.deaths_admin('test-w2')) <> 1 THEN RAISE EXCEPTION 'FAIL: deaths_admin other server'; END IF;
  IF EXISTS (SELECT 1 FROM aurora.safehouses_admin() WHERE server_id = 'test-w')
     OR EXISTS (SELECT 1 FROM aurora.map_objects_admin() WHERE server_id = 'test-w') THEN
    RAISE EXCEPTION 'FAIL: safehouses_admin / map_objects_admin return old-world rows';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses_admin() WHERE server_id = 'test-w2') THEN
    RAISE EXCEPTION 'FAIL: safehouses_admin lost the other server';
  END IF;
  IF (SELECT count(*) FROM aurora.player_history_admin('test-w', 'w1')) <> 2 THEN
    RAISE EXCEPTION 'FAIL: player_history_admin w1';
  END IF;
  IF (SELECT string_agg(world_id, ',') FROM aurora.worlds_admin('test-w')) <> 'w2,w1' THEN
    RAISE EXCEPTION 'FAIL: worlds_admin order is %', (SELECT string_agg(world_id, ',') FROM aurora.worlds_admin('test-w'));
  END IF;
  j := aurora.world_leftovers('test-w');
  IF (j->>'safehouses')::int <> 1 OR (j->>'vehicle_claims')::int <> 2 OR (j->>'players')::int <> 1
     OR (j->>'deaths')::int <> 2 OR (j->>'vehicles')::int <> 1 OR (j->>'zones')::int <> 2
     OR (j->>'vehicle_claims_stale')::int <> 0 OR j->'pending' <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FAIL: world_leftovers %', j;
  END IF;
  RAISE NOTICE 'PASS admin reads: live positions, npc, vehicles, deaths (current and w1 history), safehouses/map_objects, history, worlds, leftovers';
END $$;
RESET ROLE;

-- A current-world claim whose car has no current-world row is stale.
INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner, script, x, y, world_id) VALUES ('test-w', 99, 'alice', 'Base.Van', 1, 1, 'w2');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (aurora.world_leftovers('test-w')->>'vehicle_claims_stale')::int <> 1 THEN
    RAISE EXCEPTION 'FAIL: vehicle_claims_stale does not count a current claim without a current car';
  END IF;
  RAISE NOTICE 'PASS world_leftovers counts stale current-world claims';
END $$;
RESET ROLE;
DELETE FROM aurora.vehicle_claims WHERE server_id = 'test-w' AND sql_id = 99;

-- A member: no rows, no writes.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);
DO $$
DECLARE
  ok boolean;
  fn text;
BEGIN
  IF (SELECT count(*) FROM aurora.worlds_admin('test-w')) <> 0 THEN RAISE EXCEPTION 'FAIL: worlds_admin returns rows to a member'; END IF;
  IF (SELECT count(*) FROM aurora.player_history_admin('test-w', 'w1')) <> 0 THEN RAISE EXCEPTION 'FAIL: player_history_admin returns rows to a member'; END IF;
  IF aurora.world_leftovers('test-w') IS NOT NULL THEN RAISE EXCEPTION 'FAIL: world_leftovers answers a member'; END IF;
  IF (SELECT count(*) FROM aurora.deaths_admin('test-w', 'w1')) <> 0 THEN RAISE EXCEPTION 'FAIL: deaths_admin answers a member'; END IF;
  FOREACH fn IN ARRAY ARRAY['start', 'confirm', 'dismiss', 'undo'] LOOP
    ok := FALSE;
    BEGIN
      CASE fn
        WHEN 'start'   THEN PERFORM aurora.start_new_world('test-w', 'member');
        WHEN 'confirm' THEN PERFORM aurora.confirm_pending_world('test-w', 'w1');
        WHEN 'dismiss' THEN PERFORM aurora.dismiss_pending_world('test-w', 'w1');
        WHEN 'undo'    THEN PERFORM aurora.undo_new_world('test-w');
      END CASE;
    EXCEPTION WHEN insufficient_privilege THEN
      ok := SQLERRM LIKE '%aurora admins only%';
    END;
    IF NOT ok THEN RAISE EXCEPTION 'FAIL: a member ran the % world button', fn; END IF;
  END LOOP;
  RAISE NOTICE 'PASS a member gets zero rows from the admin readers and is refused by every world button';
END $$;
RESET ROLE;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
DECLARE
  ok boolean := FALSE;
BEGIN
  BEGIN
    PERFORM aurora.start_new_world('test-w', 'anon');
  EXCEPTION WHEN insufficient_privilege THEN
    ok := SQLERRM LIKE 'permission denied for function%';
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: anon was not denied start_new_world'; END IF;
  ok := FALSE;
  BEGIN
    PERFORM aurora.register_world('test-w', '99999999-aaaa-4bbb-8ccc-000000000009', TRUE, 0, 0);
  EXCEPTION WHEN insufficient_privilege THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: anon was not denied register_world'; END IF;
  IF (SELECT world_id FROM aurora.current_world('test-w')) <> 'w2' THEN RAISE EXCEPTION 'FAIL: current_world is not w2'; END IF;
  RAISE NOTICE 'PASS anon is denied start_new_world and register_world, and reads current_world';
END $$;
RESET ROLE;

-- ============================================================================
-- 9. PENDING (age 100): nothing public changes; dismiss voids it
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('t47.snap', t47.snap('test-w') || '|' || t47.snap('test-w2'), TRUE);
RESET ROLE;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  r jsonb;
BEGIN
  r := aurora.register_world('test-w', '33333333-aaaa-4bbb-8ccc-000000000003', TRUE, 100, 1700000200000);
  IF r <> '{"world_id": "w2", "status": "pending", "switched": false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: age 100 returned %', r;
  END IF;
  r := aurora.register_world('test-w', '33333333-aaaa-4bbb-8ccc-000000000003', TRUE, 100.1, 1700000200000);
  IF r <> '{"world_id": "w2", "status": "pending", "switched": false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the pending id again returned %', r;
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w3') IS DISTINCT FROM 'pending'
     OR (SELECT count(*) FROM aurora.worlds WHERE server_id = 'test-w') <> 3
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') <> 'w2'
     OR (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w2') <> 'current' THEN
    RAISE EXCEPTION 'FAIL: the pending world is not w3 pending beside w2 current';
  END IF;
  IF (SELECT hours_survived FROM aurora.players WHERE server_id = 'test-w' AND username = 'alice') <> 1.5 THEN
    RAISE EXCEPTION 'FAIL: pending touched the players';
  END IF;
END $$;

SET LOCAL ROLE anon;
DO $$
BEGIN
  IF t47.snap('test-w') || '|' || t47.snap('test-w2') <> current_setting('t47.snap') THEN
    RAISE EXCEPTION 'FAIL: a pending world changed the public map: % -> %', current_setting('t47.snap'),
      t47.snap('test-w') || '|' || t47.snap('test-w2');
  END IF;
  IF (aurora.home_summary_tz('test-w', 'UTC')->>'world_pending')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: world_pending is not true';
  END IF;
  RAISE NOTICE 'PASS a new id with age 100 is held pending as w3: nothing public changes, world_pending is true';
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
DECLARE
  ok boolean := FALSE;
BEGIN
  IF (aurora.world_leftovers('test-w')->'pending'->>'world_id') <> 'w3' THEN
    RAISE EXCEPTION 'FAIL: world_leftovers does not carry the pending world';
  END IF;
  IF aurora.dismiss_pending_world('test-w', 'w3') <> 'w3' THEN RAISE EXCEPTION 'FAIL: dismiss did not return w3'; END IF;
  BEGIN
    PERFORM aurora.dismiss_pending_world('test-w', 'w2');
  EXCEPTION WHEN invalid_parameter_value THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: dismissing the current world was accepted'; END IF;
END $$;
RESET ROLE;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  r jsonb;
BEGIN
  r := aurora.register_world('test-w', '33333333-aaaa-4bbb-8ccc-000000000003', TRUE, 100.2, 1700000200000);
  IF r <> '{"world_id": "w2", "status": "current", "switched": false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: a dismissed id returned %', r;
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w3') <> 'void'
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') <> 'w2'
     OR (SELECT count(*) FROM aurora.worlds WHERE server_id = 'test-w') <> 3 THEN
    RAISE EXCEPTION 'FAIL: dismiss did not void w3, or its id re-registered';
  END IF;
  IF (aurora.home_summary_tz('test-w', 'UTC')->>'world_pending')::boolean THEN
    RAISE EXCEPTION 'FAIL: world_pending still true after dismiss';
  END IF;
  RAISE NOTICE 'PASS dismiss_pending_world voids w3; its id is then answered with the current world, never re-adopted or re-pended';
END $$;

-- ============================================================================
-- 10. PENDING CONFIRMED, then UNDO twice
-- ============================================================================

SET LOCAL ROLE service_role;
SELECT aurora.register_world('test-w', '44444444-aaaa-4bbb-8ccc-000000000004', TRUE, 100, 1700000300000);
RESET ROLE;

-- alice's w2 record as it stands, to compare after the undo
SELECT set_config('t47.alice_w2',
  (SELECT row(hours_survived, is_dead, last_saved_x, last_saved_y, display_name, first_seen)::text
     FROM aurora.players WHERE server_id = 'test-w' AND username = 'alice'), TRUE);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF aurora.confirm_pending_world('test-w', 'w4') <> 'w4' THEN RAISE EXCEPTION 'FAIL: confirm did not return w4'; END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w4') <> 'current'
     OR (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w2') <> 'ended'
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') <> 'w4'
     OR (SELECT count(*) FROM aurora.player_history WHERE server_id = 'test-w' AND world_id = 'w2') <> 1
     OR (SELECT hours_survived FROM aurora.players WHERE server_id = 'test-w' AND username = 'alice') IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: confirm_pending_world did not switch to w4 through the switch body';
  END IF;
END $$;

SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF aurora.register_world('test-w', '44444444-aaaa-4bbb-8ccc-000000000004', TRUE, 100, 1)
     <> '{"world_id": "w4", "status": "current", "switched": false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the confirmed id is not answered as current';
  END IF;
END $$;
RESET ROLE;

SET LOCAL ROLE anon;
DO $$
BEGIN
  IF t47.snap('test-w') <> 'sh=0 zo=0 zg=0 mo=0 vc=0 pl=0 pp=0 vv=0 ng=0 no=0 de=0' THEN
    RAISE EXCEPTION 'FAIL: after confirm anon sees %', t47.snap('test-w');
  END IF;
  RAISE NOTICE 'PASS confirm_pending_world switches to w4 through the same switch body; the public map is empty for the new world';
END $$;
RESET ROLE;

-- A row of w4, to prove the undo re-tags it.
INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, world_id) VALUES
  ('test-w', 'sh4', 40, 40, 5, 5, 'alice', 'Made in w4', 'w4');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF aurora.undo_new_world('test-w') <> 'w2' THEN RAISE EXCEPTION 'FAIL: undo did not return w2'; END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w4') <> 'void'
     OR (SELECT status FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w2') <> 'current'
     OR (SELECT ended_at FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w2') IS NOT NULL
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') <> 'w2' THEN
    RAISE EXCEPTION 'FAIL: undo did not void w4 and reopen w2';
  END IF;
  IF t47.tagged('test-w', 'w4') <> 0 OR (SELECT world_id FROM aurora.safehouses WHERE server_id = 'test-w' AND id = 'sh4') <> 'w2' THEN
    RAISE EXCEPTION 'FAIL: undo left rows in w4';
  END IF;
  IF (SELECT row(hours_survived, is_dead, last_saved_x, last_saved_y, display_name, first_seen)::text
        FROM aurora.players WHERE server_id = 'test-w' AND username = 'alice') <> current_setting('t47.alice_w2') THEN
    RAISE EXCEPTION 'FAIL: alice after undo is not her w2 record (%)', current_setting('t47.alice_w2');
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.player_history WHERE server_id = 'test-w' AND world_id = 'w2') THEN
    RAISE EXCEPTION 'FAIL: the w2 archive rows were not deleted by the undo';
  END IF;
  RAISE NOTICE 'PASS undo_new_world reopens w2: w4 void, its rows re-tagged, players restored byte for byte, archive rows gone';
END $$;

-- Refused after 24 hours
UPDATE aurora.worlds SET started_at = NOW() - INTERVAL '25 hours' WHERE server_id = 'test-w' AND world_id = 'w2';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
DECLARE
  ok boolean := FALSE;
BEGIN
  BEGIN
    PERFORM aurora.undo_new_world('test-w');
  EXCEPTION WHEN invalid_parameter_value THEN ok := SQLERRM LIKE '%24 hours%';
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: undo was allowed for a world that started 25 hours ago'; END IF;
  RAISE NOTICE 'PASS undo_new_world refuses once the current world is 24 hours old';
END $$;
RESET ROLE;
UPDATE aurora.worlds SET started_at = NOW() - INTERVAL '23 hours' WHERE server_id = 'test-w' AND world_id = 'w2';

-- Undo again: back to w1, the fixture values exactly.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF aurora.undo_new_world('test-w') <> 'w1' THEN RAISE EXCEPTION 'FAIL: the second undo did not return w1'; END IF;
END $$;
RESET ROLE;

-- w1 started on 2026-01-01; make it young so the refusal below is for the missing
-- earlier world, not for the 24-hour window.
UPDATE aurora.worlds SET started_at = NOW() - INTERVAL '1 hour' WHERE server_id = 'test-w' AND world_id = 'w1';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
DECLARE
  ok boolean := FALSE;
BEGIN
  BEGIN
    PERFORM aurora.undo_new_world('test-w');
  EXCEPTION WHEN invalid_parameter_value THEN ok := SQLERRM LIKE '%no earlier world%';
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL: undo with no earlier ended world was allowed'; END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT row(hours_survived, is_dead, last_saved_x, last_saved_y, display_name, first_seen, online)::text
        FROM aurora.players WHERE server_id = 'test-w' AND username = 'alice')
     <> row(50.5::real, FALSE, 10, 20, 'Alice'::text, TIMESTAMPTZ '2026-01-02 00:00:00+00', FALSE)::text THEN
    RAISE EXCEPTION 'FAIL: alice after the second undo is %',
      (SELECT row_to_json(p) FROM aurora.players p WHERE server_id = 'test-w' AND username = 'alice');
  END IF;
  IF (SELECT row(hours_survived, is_dead, last_saved_x, last_saved_y, display_name, first_seen)::text
        FROM aurora.players WHERE server_id = 'test-w' AND username = 'bob')
     <> row(7.25::real, TRUE, 30, 40, 'Bob'::text, TIMESTAMPTZ '2026-01-03 00:00:00+00')::text THEN
    RAISE EXCEPTION 'FAIL: bob after the second undo';
  END IF;
  IF t47.tagged('test-w', 'w2') <> 0 OR t47.tagged('test-w', 'w4') <> 0
     OR EXISTS (SELECT 1 FROM aurora.player_history WHERE server_id = 'test-w')
     OR (SELECT current_world_id FROM aurora.servers WHERE id = 'test-w') <> 'w1' THEN
    RAISE EXCEPTION 'FAIL: the second undo left rows outside w1 or archive rows';
  END IF;
  RAISE NOTICE 'PASS a second undo reopens w1 with the original player fields; with no earlier world, undo is refused';
END $$;

SET LOCAL ROLE anon;
DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.safehouses WHERE server_id = 'test-w') <> 2
     OR (SELECT count(*) FROM aurora.deaths_visible WHERE server_id = 'test-w') <> 2 THEN
    RAISE EXCEPTION 'FAIL: after undo anon does not see w1 again: %', t47.snap('test-w');
  END IF;
  RAISE NOTICE 'PASS after the undo the public map shows the reopened world';
END $$;
RESET ROLE;

-- ============================================================================
-- 11. start_new_world, then the exporter's id is adopted by the admin world
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF aurora.start_new_world('test-w', 'Wipe announced on Discord') <> 'w5' THEN RAISE EXCEPTION 'FAIL: start_new_world did not make w5'; END IF;
END $$;
RESET ROLE;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  r jsonb;
BEGIN
  r := aurora.register_world('test-w', '55555555-aaaa-4bbb-8ccc-000000000005', TRUE, 500, 1700000400000);
  IF r <> '{"world_id": "w5", "status": "current", "switched": false, "adopted": true}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the report after start_new_world returned %', r;
  END IF;
  -- an id of an ENDED world is never re-adopted or switched to
  r := aurora.register_world('test-w', '11111111-aaaa-4bbb-8ccc-000000000001', TRUE, 0.1, 1);
  IF r <> '{"world_id": "w5", "status": "current", "switched": false}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: the ended world''s id returned %', r;
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT detected_by || '/' || exporter_world_id || '/' || note FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w5')
     <> 'admin/55555555-aaaa-4bbb-8ccc-000000000005/Wipe announced on Discord'
     OR (SELECT count(*) FROM aurora.worlds WHERE server_id = 'test-w') <> 5
     OR (SELECT exporter_world_id FROM aurora.worlds WHERE server_id = 'test-w' AND world_id = 'w1') <> '11111111-aaaa-4bbb-8ccc-000000000001' THEN
    RAISE EXCEPTION 'FAIL: w5 adoption';
  END IF;
  IF (SELECT count(*) FROM aurora.player_history WHERE server_id = 'test-w' AND world_id = 'w1') <> 2 THEN
    RAISE EXCEPTION 'FAIL: start_new_world did not archive w1';
  END IF;
  RAISE NOTICE 'PASS start_new_world makes w5 (admin), the next unknown id is adopted by it, an ended world''s id changes nothing';
END $$;

-- ============================================================================
-- 12. prune_old_worlds
-- ============================================================================

INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, world_id) VALUES
  ('test-w', 'sh5', 50, 50, 5, 5, 'alice', 'Made in w5', 'w5');

SELECT set_config('t47.keep',
  (SELECT format('de=%s hs=%s pl=%s ph=%s',
     (SELECT count(*) FROM aurora.deaths WHERE server_id = 'test-w'),
     (SELECT count(*) FROM aurora.health_samples WHERE server_id = 'test-w'),
     (SELECT count(*) FROM aurora.players WHERE server_id = 'test-w'),
     (SELECT count(*) FROM aurora.player_history WHERE server_id = 'test-w'))), TRUE);

SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF aurora.prune_old_worlds(30, 5000) <> 0 THEN RAISE EXCEPTION 'FAIL: prune took rows of a world that ended today'; END IF;
END $$;
RESET ROLE;

UPDATE aurora.worlds SET ended_at = NOW() - INTERVAL '31 days' WHERE server_id = 'test-w' AND world_id = 'w1';

SET LOCAL ROLE service_role;
DO $$
DECLARE
  n int;
BEGIN
  n := aurora.prune_old_worlds(30, 1);
  IF n <> 10 THEN RAISE EXCEPTION 'FAIL: prune(30, 1) deleted %, expected one row from each of 10 tables', n; END IF;
  n := aurora.prune_old_worlds(30, 5000);
  IF n <> 5 THEN RAISE EXCEPTION 'FAIL: prune(30) then deleted %, expected the 5 remaining live rows', n; END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.safehouses WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.zones WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.zombie_grid WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.map_objects WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.vehicles WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.player_positions WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.player_position_history WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.npc_groups WHERE server_id = 'test-w' AND world_id = 'w1')
     + (SELECT count(*) FROM aurora.npc_outposts WHERE server_id = 'test-w' AND world_id = 'w1') <> 0 THEN
    RAISE EXCEPTION 'FAIL: old-world live rows survived the prune';
  END IF;
  IF (SELECT format('de=%s hs=%s pl=%s ph=%s',
        (SELECT count(*) FROM aurora.deaths WHERE server_id = 'test-w'),
        (SELECT count(*) FROM aurora.health_samples WHERE server_id = 'test-w'),
        (SELECT count(*) FROM aurora.players WHERE server_id = 'test-w'),
        (SELECT count(*) FROM aurora.player_history WHERE server_id = 'test-w'))) <> current_setting('t47.keep') THEN
    RAISE EXCEPTION 'FAIL: prune touched deaths, health_samples, players or player_history (% before)', current_setting('t47.keep');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-w' AND id = 'sh5') THEN
    RAISE EXCEPTION 'FAIL: prune took a current-world row';
  END IF;
  IF t47.tagged('test-w2', 'w1') <> 13 THEN
    RAISE EXCEPTION 'FAIL: prune or a switch touched the other server (its w1 is current): % rows', t47.tagged('test-w2', 'w1');
  END IF;
  RAISE NOTICE 'PASS prune_old_worlds: only ended-world rows older than p_days, bounded per table, never deaths/health_samples/players/history, other server untouched';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL WORLD TESTS PASSED'; END $$;

ROLLBACK;
