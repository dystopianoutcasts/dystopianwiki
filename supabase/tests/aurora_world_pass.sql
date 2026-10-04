-- Tests for migration 040: safehouses and zones follow the game.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL WORLD PASS TESTS PASSED", or stops at the first failure.
--
-- now() is fixed for the whole transaction. The passes in sections 3-6 run at
-- T1 = now() - 50 min, T2 = now() - 40 min, T3 = now() - 30 min; the read-time
-- guard in section 7 uses rows stamped relative to now() - 1 min.
--
-- Server 'test-pass' (current world w1, ended world w0) takes the passes. Server
-- 'test-pass-old' has no seen_at anywhere (an exporter before 0.7.4) and must
-- never lose or hide a row.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'pass-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'pass-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen) VALUES
  ('test-pass',     'Pass Test',     NOW()),
  ('test-pass-old', 'Pass Old Test', NOW());
INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by)
VALUES ('test-pass', 'w0', 1, 'ended',   'migration'),
       ('test-pass', 'w1', 2, 'current', 'migration');
UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 'test-pass';

-- Rows written before exporter 0.7.4: no seen_at.
INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, world_id, seen_at) VALUES
  ('test-pass', 'sh-old',   10, 10, 5, 5, 'kitten', 'Old',          'w1', NULL),
  ('test-pass', 'sh-nullw', 20, 20, 5, 5, 'kitten', 'Untagged',     NULL, NULL),
  ('test-pass', 'sh-ended', 30, 30, 5, 5, 'kitten', 'Ended world',  'w0', NULL),
  ('test-pass-old', 'sh-a', 40, 40, 5, 5, 'zed',    'Old server A', NULL, NULL),
  ('test-pass-old', 'sh-b', 50, 50, 5, 5, 'zed',    'Old server B', NULL, NULL);
INSERT INTO aurora.zones (server_id, kind, title, x1, y1, x2, y2, world_id, seen_at) VALUES
  ('test-pass', 'nonpvp', 'Z old',   1, 1, 9, 9, 'w1', NULL),
  ('test-pass', 'nonpvp', 'Z ended', 2, 2, 9, 9, 'w0', NULL),
  ('test-pass-old', 'nonpvp', 'Z a', 3, 3, 9, 9, NULL, NULL);

-- ============================================================================
-- 1. SHAPE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'aurora' AND table_name = 'safehouses' AND column_name = 'seen_at'
                    AND data_type = 'timestamp with time zone' AND is_nullable = 'YES')
     OR NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'aurora' AND table_name = 'zones' AND column_name = 'seen_at'
                    AND data_type = 'timestamp with time zone' AND is_nullable = 'YES') THEN
    RAISE EXCEPTION 'FAIL: seen_at TIMESTAMPTZ NULL missing on safehouses or zones';
  END IF;
  RAISE NOTICE 'PASS safehouses.seen_at and zones.seen_at are nullable timestamptz';

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'aurora.world_passes'::regclass) THEN
    RAISE EXCEPTION 'FAIL: world_passes has no row level security';
  END IF;
  IF (SELECT array_agg(a.attname ORDER BY a.attname) FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
       WHERE i.indrelid = 'aurora.world_passes'::regclass AND i.indisprimary) <> ARRAY['server_id']::name[] THEN
    RAISE EXCEPTION 'FAIL: world_passes primary key is not server_id';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                  WHERE conrelid = 'aurora.world_passes'::regclass AND contype = 'f'
                    AND confrelid = 'aurora.servers'::regclass) THEN
    RAISE EXCEPTION 'FAIL: world_passes.server_id does not reference aurora.servers';
  END IF;
  RAISE NOTICE 'PASS world_passes: RLS on, primary key server_id, FK to servers';

  IF NOT (SELECT prosecdef FROM pg_proc WHERE oid = 'aurora.apply_world_pass(text, timestamptz)'::regprocedure)
     OR NOT (SELECT 'search_path=""' = ANY (proconfig) FROM pg_proc WHERE oid = 'aurora.apply_world_pass(text, timestamptz)'::regprocedure) THEN
    RAISE EXCEPTION 'FAIL: apply_world_pass is not SECURITY DEFINER with an empty search_path';
  END IF;
  IF (SELECT prorettype FROM pg_proc WHERE oid = 'aurora.apply_world_pass(text, timestamptz)'::regprocedure) <> 'jsonb'::regtype THEN
    RAISE EXCEPTION 'FAIL: apply_world_pass does not return jsonb';
  END IF;
  RAISE NOTICE 'PASS apply_world_pass(text, timestamptz) returns jsonb, SECURITY DEFINER, empty search_path';
END $$;

-- ============================================================================
-- 2. PRIVILEGES
-- ============================================================================

DO $$
BEGIN
  IF has_function_privilege('anon', 'aurora.apply_world_pass(text, timestamptz)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon can execute apply_world_pass';
  END IF;
  IF has_function_privilege('authenticated', 'aurora.apply_world_pass(text, timestamptz)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: authenticated can execute apply_world_pass';
  END IF;
  IF NOT has_function_privilege('service_role', 'aurora.apply_world_pass(text, timestamptz)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot execute apply_world_pass';
  END IF;
  RAISE NOTICE 'PASS apply_world_pass: service_role only';

  IF has_table_privilege('anon', 'aurora.world_passes', 'SELECT')
     OR has_table_privilege('authenticated', 'aurora.world_passes', 'SELECT')
     OR has_table_privilege('anon', 'aurora.world_passes', 'INSERT')
     OR has_table_privilege('authenticated', 'aurora.world_passes', 'DELETE') THEN
    RAISE EXCEPTION 'FAIL: a client role has a privilege on world_passes';
  END IF;
  IF NOT has_table_privilege('service_role', 'aurora.world_passes', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot read world_passes';
  END IF;
  RAISE NOTICE 'PASS world_passes: no client grant, service_role reads';

  IF NOT (has_function_privilege('anon', 'aurora.seen_in_recent_pass(text, text, timestamptz)', 'EXECUTE')
      AND has_function_privilege('authenticated', 'aurora.seen_in_recent_pass(text, text, timestamptz)', 'EXECUTE')) THEN
    RAISE EXCEPTION 'FAIL: the policies'' guard is not executable by anon and authenticated';
  END IF;
  RAISE NOTICE 'PASS seen_in_recent_pass is executable by the roles its policies serve';
END $$;

-- Calling it as anon is refused, not merely unlisted.
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
BEGIN
  BEGIN
    PERFORM aurora.apply_world_pass('test-pass', now());
    RAISE EXCEPTION 'FAIL: anon executed apply_world_pass';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon calling apply_world_pass is refused (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- Grants on the changed policies are unchanged: same policies, roles and command;
-- anon selects the 023 safehouse columns and not seen_at; zones keep 009's grant.
DO $$
BEGIN
  IF (SELECT count(*) FROM pg_policies
       WHERE schemaname = 'aurora' AND tablename = 'safehouses'
         AND policyname = 'aurora safehouses are publicly readable'
         AND cmd = 'SELECT' AND roles = ARRAY['public']::name[]
         AND qual LIKE '%is_current_world%' AND qual LIKE '%seen_in_recent_pass%') <> 1 THEN
    RAISE EXCEPTION 'FAIL: the safehouse select policy changed name, role or command, or lost a rule';
  END IF;
  IF (SELECT count(*) FROM pg_policies
       WHERE schemaname = 'aurora' AND tablename = 'zones'
         AND policyname = 'aurora zones are publicly readable'
         AND cmd = 'SELECT' AND roles = ARRAY['public']::name[]
         AND qual LIKE '%is_current_world%' AND qual LIKE '%seen_in_recent_pass%') <> 1 THEN
    RAISE EXCEPTION 'FAIL: the zone select policy changed name, role or command, or lost a rule';
  END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'aurora' AND tablename IN ('safehouses', 'zones')) <> 2 THEN
    RAISE EXCEPTION 'FAIL: safehouses and zones carry % policies, expected 2',
      (SELECT count(*) FROM pg_policies WHERE schemaname = 'aurora' AND tablename IN ('safehouses', 'zones'));
  END IF;
  IF NOT (has_column_privilege('anon', 'aurora.safehouses', 'owner', 'SELECT')
      AND has_column_privilege('authenticated', 'aurora.safehouses', 'title', 'SELECT')) THEN
    RAISE EXCEPTION 'FAIL: anon or authenticated lost a 023 safehouse column';
  END IF;
  IF has_column_privilege('anon', 'aurora.safehouses', 'seen_at', 'SELECT')
     OR has_column_privilege('anon', 'aurora.safehouses', 'players', 'SELECT')
     OR has_table_privilege('anon', 'aurora.safehouses', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: anon gained a safehouse column grant';
  END IF;
  IF NOT (has_table_privilege('anon', 'aurora.zones', 'SELECT')
      AND has_table_privilege('authenticated', 'aurora.zones', 'SELECT'))
     OR has_table_privilege('anon', 'aurora.zones', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: zone grants changed';
  END IF;
  RAISE NOTICE 'PASS policies keep name, role and command; safehouse and zone grants unchanged';
END $$;

-- ============================================================================
-- 3. THE FIRST PASS: listed rows stay, NULL seen_at rows go, ended world untouched
-- ============================================================================

-- What the importer does with pass T1: upsert the listed rows, then call.
INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, world_id, seen_at) VALUES
  ('test-pass', 'sh-kept', 60, 60, 5, 5, 'kitten', 'Kept', 'w1', NOW() - INTERVAL '50 minutes'),
  ('test-pass', 'sh-gone', 70, 70, 5, 5, 'kitten', 'Gone', 'w1', NOW() - INTERVAL '50 minutes');
INSERT INTO aurora.zones (server_id, kind, title, x1, y1, x2, y2, world_id, seen_at) VALUES
  ('test-pass', 'nonpvp', 'Z kept', 4, 4, 9, 9, 'w1', NOW() - INTERVAL '50 minutes'),
  ('test-pass', 'nonpvp', 'Z gone', 5, 5, 9, 9, 'w1', NOW() - INTERVAL '50 minutes');

SET LOCAL ROLE service_role;
DO $$
DECLARE
  j jsonb;
BEGIN
  j := aurora.apply_world_pass('test-pass', NOW() - INTERVAL '50 minutes');
  IF j IS DISTINCT FROM '{"safehouses_removed": 2, "zones_removed": 1}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: first pass returned %', j;
  END IF;
  RAISE NOTICE 'PASS first pass returns {safehouses_removed: 2, zones_removed: 1}';
END $$;
RESET ROLE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id IN ('sh-old', 'sh-nullw'))
     OR EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND title = 'Z old') THEN
    RAISE EXCEPTION 'FAIL: a NULL seen_at row of the current world survived the first pass';
  END IF;
  RAISE NOTICE 'PASS NULL seen_at rows go on the first pass (world w1 and world NULL)';

  IF (SELECT count(*) FROM aurora.safehouses WHERE server_id = 'test-pass' AND id IN ('sh-kept', 'sh-gone')) <> 2
     OR (SELECT count(*) FROM aurora.zones WHERE server_id = 'test-pass' AND title IN ('Z kept', 'Z gone')) <> 2 THEN
    RAISE EXCEPTION 'FAIL: the first pass deleted a row it listed';
  END IF;
  RAISE NOTICE 'PASS the first pass keeps every row it listed';

  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-ended')
     OR NOT EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND title = 'Z ended') THEN
    RAISE EXCEPTION 'FAIL: the pass deleted a row of the ended world';
  END IF;
  IF (SELECT count(*) FROM aurora.safehouses WHERE server_id = 'test-pass-old') <> 2
     OR (SELECT count(*) FROM aurora.zones WHERE server_id = 'test-pass-old') <> 1 THEN
    RAISE EXCEPTION 'FAIL: the pass touched another server';
  END IF;
  RAISE NOTICE 'PASS ended-world rows and other servers are untouched';

  IF (SELECT row(seen_at, safehouses, zones)::text FROM aurora.world_passes WHERE server_id = 'test-pass')
     IS DISTINCT FROM row(NOW() - INTERVAL '50 minutes', 2, 2)::text THEN
    RAISE EXCEPTION 'FAIL: world_passes holds %',
      (SELECT row(seen_at, safehouses, zones)::text FROM aurora.world_passes WHERE server_id = 'test-pass');
  END IF;
  RAISE NOTICE 'PASS world_passes stores the pass (seen_at T1, 2 safehouses, 2 zones)';
END $$;

-- ============================================================================
-- 4. A LATER PASS removes what it does not list
-- ============================================================================

UPDATE aurora.safehouses SET seen_at = NOW() - INTERVAL '40 minutes' WHERE server_id = 'test-pass' AND id = 'sh-kept';
UPDATE aurora.zones      SET seen_at = NOW() - INTERVAL '40 minutes' WHERE server_id = 'test-pass' AND title = 'Z kept';

SET LOCAL ROLE service_role;
DO $$
DECLARE
  j jsonb;
BEGIN
  j := aurora.apply_world_pass('test-pass', NOW() - INTERVAL '40 minutes');
  IF j IS DISTINCT FROM '{"safehouses_removed": 1, "zones_removed": 1}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: second pass returned %', j;
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-gone')
     OR EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND title = 'Z gone') THEN
    RAISE EXCEPTION 'FAIL: an unlisted safehouse or zone survived the pass';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-kept')
     OR NOT EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND title = 'Z kept') THEN
    RAISE EXCEPTION 'FAIL: a listed safehouse or zone was deleted';
  END IF;
  RAISE NOTICE 'PASS a pass removes the unlisted safehouse and zone and keeps the listed ones';
END $$;

-- ============================================================================
-- 5. OUT OF ORDER: an older pass after a newer one deletes nothing
-- ============================================================================
-- A row stamped between T1 and the replayed pass's time would go if the replay
-- were applied.

INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, world_id, seen_at) VALUES
  ('test-pass', 'sh-between', 80, 80, 5, 5, 'kitten', 'Between', 'w1', NOW() - INTERVAL '49 minutes');
INSERT INTO aurora.zones (server_id, kind, title, x1, y1, x2, y2, world_id, seen_at) VALUES
  ('test-pass', 'nonpvp', 'Z between', 6, 6, 9, 9, 'w1', NOW() - INTERVAL '49 minutes');

SET LOCAL ROLE service_role;
DO $$
DECLARE
  j jsonb;
BEGIN
  j := aurora.apply_world_pass('test-pass', NOW() - INTERVAL '45 minutes');
  IF j IS DISTINCT FROM '{"safehouses_removed": 0, "zones_removed": 0}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: an out-of-order pass returned %', j;
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-between')
     OR NOT EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND title = 'Z between') THEN
    RAISE EXCEPTION 'FAIL: an older pass after a newer one deleted rows';
  END IF;
  IF (SELECT seen_at FROM aurora.world_passes WHERE server_id = 'test-pass') <> NOW() - INTERVAL '40 minutes' THEN
    RAISE EXCEPTION 'FAIL: an older pass replaced the stored newest pass';
  END IF;
  RAISE NOTICE 'PASS an older pass after a newer one deletes nothing and keeps the stored pass';
END $$;

DELETE FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-between';
DELETE FROM aurora.zones      WHERE server_id = 'test-pass' AND title = 'Z between';

-- The same pass again (a replay at the stored time) finds nothing more to delete.
SET LOCAL ROLE service_role;
DO $$
DECLARE
  j jsonb;
BEGIN
  j := aurora.apply_world_pass('test-pass', NOW() - INTERVAL '40 minutes');
  IF j IS DISTINCT FROM '{"safehouses_removed": 0, "zones_removed": 0}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: replaying the stored pass returned %', j;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-kept') THEN
    RAISE EXCEPTION 'FAIL: replaying the stored pass deleted a listed row';
  END IF;
  -- Unknown server and NULL time: nothing, and no error.
  IF aurora.apply_world_pass('no-such-server', NOW()) IS DISTINCT FROM '{"safehouses_removed": 0, "zones_removed": 0}'::jsonb
     OR aurora.apply_world_pass('test-pass', NULL) IS DISTINCT FROM '{"safehouses_removed": 0, "zones_removed": 0}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: an unknown server or a NULL time changed something';
  END IF;
  RAISE NOTICE 'PASS replaying the stored pass, an unknown server and a NULL time delete nothing';
END $$;
RESET ROLE;

-- ============================================================================
-- 6. AN EMPTY PASS (0 rows listed) removes every current-world row
-- ============================================================================

SET LOCAL ROLE service_role;
DO $$
DECLARE
  j jsonb;
BEGIN
  j := aurora.apply_world_pass('test-pass', NOW() - INTERVAL '30 minutes');
  IF j IS DISTINCT FROM '{"safehouses_removed": 1, "zones_removed": 1}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: empty pass returned %', j;
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND aurora.is_current_world(server_id, world_id))
     OR EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND aurora.is_current_world(server_id, world_id)) THEN
    RAISE EXCEPTION 'FAIL: a current-world row survived an empty pass';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.safehouses WHERE server_id = 'test-pass' AND id = 'sh-ended')
     OR NOT EXISTS (SELECT 1 FROM aurora.zones WHERE server_id = 'test-pass' AND title = 'Z ended') THEN
    RAISE EXCEPTION 'FAIL: an empty pass deleted a row of the ended world';
  END IF;
  IF (SELECT row(seen_at, safehouses, zones)::text FROM aurora.world_passes WHERE server_id = 'test-pass')
     IS DISTINCT FROM row(NOW() - INTERVAL '30 minutes', 0, 0)::text THEN
    RAISE EXCEPTION 'FAIL: world_passes after the empty pass holds %',
      (SELECT row(seen_at, safehouses, zones)::text FROM aurora.world_passes WHERE server_id = 'test-pass');
  END IF;
  RAISE NOTICE 'PASS an empty pass removes every current-world row and leaves the ended world';
END $$;

-- ============================================================================
-- 7. THE READ-TIME GUARD
-- ============================================================================
-- Newest seen_at on test-pass is now() - 1 min. 24 and exactly 25 minutes behind
-- show; 26 minutes behind and NULL hide. The ended-world row is fresh but stays
-- hidden by 032's world rule. test-pass-old has no seen_at: everything shows.

INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, players, world_id, seen_at) VALUES
  ('test-pass', 'g-fresh', 1, 1, 5, 5, 'kitten', 'Fresh', ARRAY['member', 'peerfresh'], 'w1', NOW() - INTERVAL '1 minute'),
  ('test-pass', 'g-24',    2, 2, 5, 5, 'kitten', 'B24',   '{}',                        'w1', NOW() - INTERVAL '25 minutes'),
  ('test-pass', 'g-25',    3, 3, 5, 5, 'kitten', 'B25',   '{}',                        'w1', NOW() - INTERVAL '26 minutes'),
  ('test-pass', 'g-26',    4, 4, 5, 5, 'kitten', 'B26',   ARRAY['member', 'peerstale'], 'w1', NOW() - INTERVAL '27 minutes'),
  ('test-pass', 'g-null',  5, 5, 5, 5, 'kitten', 'BNull', '{}',                        'w1', NULL);
INSERT INTO aurora.zones (server_id, kind, title, x1, y1, x2, y2, world_id, seen_at) VALUES
  ('test-pass', 'nonpvp', 'G fresh', 11, 11, 19, 19, 'w1', NOW() - INTERVAL '1 minute'),
  ('test-pass', 'nonpvp', 'G 24',    12, 12, 19, 19, 'w1', NOW() - INTERVAL '25 minutes'),
  ('test-pass', 'nonpvp', 'G 26',    13, 13, 19, 19, 'w1', NOW() - INTERVAL '27 minutes'),
  ('test-pass', 'nonpvp', 'G null',  14, 14, 19, 19, 'w1', NULL),
  ('test-pass', 'nonpvp', 'G ended', 15, 15, 19, 19, 'w0', NOW() - INTERVAL '1 minute');

DO $$
BEGIN
  IF aurora.seen_in_recent_pass('safehouses', 'test-pass', NOW() - INTERVAL '26 minutes') IS NOT TRUE
     OR aurora.seen_in_recent_pass('safehouses', 'test-pass', NOW() - INTERVAL '27 minutes') IS NOT FALSE
     OR aurora.seen_in_recent_pass('safehouses', 'test-pass', NULL) IS NOT FALSE
     OR aurora.seen_in_recent_pass('safehouses', 'test-pass-old', NULL) IS NOT TRUE
     OR aurora.seen_in_recent_pass('players', 'test-pass', NOW()) IS NOT FALSE THEN
    RAISE EXCEPTION 'FAIL: seen_in_recent_pass boundaries (25 min shows, 26 hides, NULL hides once a seen_at exists, other tables FALSE)';
  END IF;
  RAISE NOTICE 'PASS seen_in_recent_pass: exactly 25 minutes shows, 26 hides, NULL hides once the server has a seen_at';
END $$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
DECLARE
  j jsonb;
BEGIN
  IF (SELECT array_agg(id ORDER BY id) FROM aurora.safehouses WHERE server_id = 'test-pass')
     IS DISTINCT FROM ARRAY['g-24', 'g-25', 'g-fresh'] THEN
    RAISE EXCEPTION 'FAIL: anon sees safehouses %', (SELECT array_agg(id ORDER BY id) FROM aurora.safehouses WHERE server_id = 'test-pass');
  END IF;
  RAISE NOTICE 'PASS anon: the safehouse 26 minutes behind the newest and the NULL one are hidden, 24 and 25 shown';

  IF (SELECT array_agg(title ORDER BY title) FROM aurora.zones WHERE server_id = 'test-pass')
     IS DISTINCT FROM ARRAY['G 24', 'G fresh'] THEN
    RAISE EXCEPTION 'FAIL: anon sees zones %', (SELECT array_agg(title ORDER BY title) FROM aurora.zones WHERE server_id = 'test-pass');
  END IF;
  RAISE NOTICE 'PASS anon: the zone 26 minutes behind, the NULL one and the ended-world one are hidden';

  IF (SELECT count(*) FROM aurora.safehouses WHERE server_id = 'test-pass-old') <> 2
     OR (SELECT count(*) FROM aurora.zones WHERE server_id = 'test-pass-old') <> 1 THEN
    RAISE EXCEPTION 'FAIL: anon lost rows of a server with no seen_at';
  END IF;
  RAISE NOTICE 'PASS anon: every row of a server with no seen_at yet is shown';

  j := aurora.home_summary_tz('test-pass', 'UTC');
  IF (j->>'safehouses')::int <> 3 THEN
    RAISE EXCEPTION 'FAIL: home_summary_tz counts % safehouses, expected 3', j->>'safehouses';
  END IF;
  j := aurora.home_summary_tz('test-pass-old', 'UTC');
  IF (j->>'safehouses')::int <> 2 THEN
    RAISE EXCEPTION 'FAIL: home_summary_tz counts % safehouses on the old server, expected 2', j->>'safehouses';
  END IF;
  RAISE NOTICE 'PASS home_summary_tz counts only visible safehouses (3 of 5 current; 2 on the old server)';
END $$;
RESET ROLE;

-- Admin: safehouses_admin applies the same rule.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (SELECT array_agg(id ORDER BY id) FROM aurora.safehouses_admin() WHERE server_id = 'test-pass')
     IS DISTINCT FROM ARRAY['g-24', 'g-25', 'g-fresh'] THEN
    RAISE EXCEPTION 'FAIL: safehouses_admin returns %',
      (SELECT array_agg(id ORDER BY id) FROM aurora.safehouses_admin() WHERE server_id = 'test-pass');
  END IF;
  IF (SELECT count(*) FROM aurora.safehouses_admin() WHERE server_id = 'test-pass-old') <> 2 THEN
    RAISE EXCEPTION 'FAIL: safehouses_admin lost rows of a server with no seen_at';
  END IF;
  RAISE NOTICE 'PASS safehouses_admin returns only the rows the read-time rule shows';
END $$;
RESET ROLE;

-- Member: a stale safehouse shares no live positions (visible_live_usernames).
INSERT INTO aurora.players (server_id, username, world_id, last_seen, online, linked_user_id)
VALUES ('test-pass', 'member', 'w1', NOW(), TRUE, 'eeeeeeee-0000-4000-8000-000000000001');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);
DO $$
BEGIN
  IF (SELECT array_agg(username ORDER BY username) FROM aurora.visible_live_usernames() WHERE server_id = 'test-pass')
     IS DISTINCT FROM ARRAY['kitten', 'member', 'peerfresh'] THEN
    RAISE EXCEPTION 'FAIL: visible_live_usernames returns %',
      (SELECT array_agg(username ORDER BY username) FROM aurora.visible_live_usernames() WHERE server_id = 'test-pass');
  END IF;
  RAISE NOTICE 'PASS visible_live_usernames: peers of the listed safehouse, not of the one 26 minutes behind';
END $$;
RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL WORLD PASS TESTS PASSED'; END $$;

ROLLBACK;
