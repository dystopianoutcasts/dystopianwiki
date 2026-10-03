-- Tests for migration 033: aurora.server_maps and aurora.pending_world_exists.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL SERVER MAPS TESTS PASSED", or stops at the first failure.
--
-- "Running 033 twice is fine" cannot be asserted from inside this file (the SQL
-- editor has no \i); the run script applies the migration twice before running this.
--
-- Every server's map list is public, as on the home page (027 publishes settings->'Map'
-- in home_summary already): anon reading ANOTHER server's list is intended, and is
-- asserted below as allowed, not refused.
--
-- pending_world_exists reads aurora.worlds (migration 032). When 032 is not applied on
-- the database this runs against, the pending-world block prints SKIP and checks only
-- that the function answers FALSE rather than raising.

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
   'authenticated', 'authenticated', 'sm-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'sm-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen) VALUES
  ('sm-mods',    'Mods',    NOW()),
  ('sm-vanilla', 'Vanilla', NOW()),
  ('sm-noconf',  'NoConf',  NOW()),
  ('sm-nokey',   'NoKey',   NOW()),
  ('sm-odd',     'Odd',     NOW()),
  ('sm-scalar',  'Scalar',  NOW());

-- Map= order as on the owner's servers: mods first, vanilla LAST, with the two helper
-- "maps" in between. The order is deliberately not alphabetical.
INSERT INTO aurora.server_config (server_id, settings) VALUES
  ('sm-mods', jsonb_build_object('Map', jsonb_build_array(
     'Raven Creek B42', 'RaccoonCity', 'Constown, KY', 'Lawnmower', 'Vehicle Spawn Zones', 'Muldraugh, KY'),
     'PublicName', 'Mods')),
  ('sm-vanilla', '{"Map": ["Muldraugh, KY"]}'::jsonb),
  ('sm-nokey',   '{"PublicName": "no map key"}'::jsonb),
  -- Non-strings inside the array are skipped; order of the strings is kept.
  ('sm-odd',     '{"Map": ["B", 7, null, "A", {"x": 1}, "C"]}'::jsonb),
  -- A scalar instead of an array is not a list.
  ('sm-scalar',  '{"Map": "Muldraugh, KY"}'::jsonb);

-- ============================================================================
-- 1. ANON READS THE LIST, IN Map= ORDER
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  l text[];
BEGIN
  l := aurora.server_maps('sm-mods');
  IF l IS DISTINCT FROM ARRAY['Raven Creek B42', 'RaccoonCity', 'Constown, KY', 'Lawnmower', 'Vehicle Spawn Zones', 'Muldraugh, KY']::text[] THEN
    RAISE EXCEPTION 'FAIL: sm-mods list is %, expected Map= order with vanilla last', l;
  END IF;
  RAISE NOTICE 'PASS anon reads the list, in Map= order (not sorted), helpers included as written';

  l := aurora.server_maps('sm-vanilla');
  IF l IS DISTINCT FROM ARRAY['Muldraugh, KY']::text[] THEN
    RAISE EXCEPTION 'FAIL: sm-vanilla list is %', l;
  END IF;
  RAISE NOTICE 'PASS a vanilla-only server lists only vanilla';

  l := aurora.server_maps('sm-noconf');
  IF l IS DISTINCT FROM '{}'::text[] THEN RAISE EXCEPTION 'FAIL: no config gave %, expected {}', l; END IF;
  l := aurora.server_maps('sm-nokey');
  IF l IS DISTINCT FROM '{}'::text[] THEN RAISE EXCEPTION 'FAIL: no Map key gave %, expected {}', l; END IF;
  l := aurora.server_maps('no-such-server');
  IF l IS DISTINCT FROM '{}'::text[] THEN RAISE EXCEPTION 'FAIL: unknown server gave %, expected {}', l; END IF;
  l := aurora.server_maps(NULL);
  IF l IS DISTINCT FROM '{}'::text[] THEN RAISE EXCEPTION 'FAIL: NULL server gave %, expected {}', l; END IF;
  l := aurora.server_maps('sm-scalar');
  IF l IS DISTINCT FROM '{}'::text[] THEN RAISE EXCEPTION 'FAIL: a scalar Map gave %, expected {}', l; END IF;
  RAISE NOTICE 'PASS no config, no key, unknown server, NULL and a non-array all give {} (never NULL)';

  l := aurora.server_maps('sm-odd');
  IF l IS DISTINCT FROM ARRAY['B', 'A', 'C']::text[] THEN
    RAISE EXCEPTION 'FAIL: mixed array gave %, expected {B,A,C}', l;
  END IF;
  RAISE NOTICE 'PASS strings only, order kept';

  -- Every server's list is public (stated in the header): anon reads a second server too.
  IF array_length(aurora.server_maps('sm-vanilla'), 1) <> 1 OR array_length(aurora.server_maps('sm-mods'), 1) <> 6 THEN
    RAISE EXCEPTION 'FAIL: anon could not read every server''s list';
  END IF;
  RAISE NOTICE 'PASS every server''s list is public (intended, as on the home page)';

  -- The list is all anon gets: the table itself stays closed.
  BEGIN
    PERFORM 1 FROM aurora.server_config;
    RAISE EXCEPTION 'FAIL: anon could read aurora.server_config';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon still cannot read server_config itself';

  BEGIN
    PERFORM aurora.pending_world_exists('sm-mods');
    RAISE EXCEPTION 'FAIL: anon could execute pending_world_exists';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon cannot execute pending_world_exists';
END $$;

RESET ROLE;

-- ============================================================================
-- 2. FUNCTION SHAPE
-- ============================================================================

DO $$
DECLARE
  r record;
BEGIN
  SELECT p.prosecdef, p.provolatile, pg_get_function_result(p.oid) AS res, p.proconfig
    INTO r
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'aurora' AND p.proname = 'server_maps';
  IF NOT r.prosecdef OR r.provolatile <> 's' OR r.res <> 'text[]' OR NOT ('search_path=""' = ANY (r.proconfig)) THEN
    RAISE EXCEPTION 'FAIL: server_maps shape %', r;
  END IF;
  SELECT p.prosecdef, p.provolatile, pg_get_function_result(p.oid) AS res, p.proconfig
    INTO r
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'aurora' AND p.proname = 'pending_world_exists';
  IF NOT r.prosecdef OR r.provolatile <> 's' OR r.res <> 'boolean' OR NOT ('search_path=""' = ANY (r.proconfig)) THEN
    RAISE EXCEPTION 'FAIL: pending_world_exists shape %', r;
  END IF;
  IF NOT has_function_privilege('authenticated', 'aurora.server_maps(text)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'aurora.server_maps(text)', 'EXECUTE')
     OR NOT has_function_privilege('anon', 'aurora.server_maps(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: server_maps EXECUTE grants';
  END IF;
  IF has_function_privilege('anon', 'aurora.pending_world_exists(text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'aurora.pending_world_exists(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: pending_world_exists EXECUTE grants';
  END IF;
  RAISE NOTICE 'PASS both functions: STABLE SECURITY DEFINER, empty search_path, the agreed return types and grants';
END $$;

-- ============================================================================
-- 3. PENDING WORLD (admins only; skipped without 032)
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('aurora.worlds') IS NULL THEN
    RAISE NOTICE 'SKIP pending-world rows: aurora.worlds (032) is not applied on this database';
    PERFORM set_config('sm.has_worlds', 'false', TRUE);
  ELSE
    PERFORM set_config('sm.has_worlds', 'true', TRUE);
    -- The contract's columns (T47). The current world first, then a pending one on
    -- sm-mods only. Dynamic SQL, so this file still parses where the table is absent.
    EXECUTE $q$
      INSERT INTO aurora.worlds (server_id, world_id, seq, exporter_world_id, status, detected_by)
      VALUES ('sm-mods', 'w901', 901, 'sm-cur', 'current', 'migration'),
             ('sm-mods', 'w902', 902, 'sm-new', 'pending', 'exporter'),
             ('sm-vanilla', 'w901', 901, 'sm-v', 'current', 'migration')
    $q$;
  END IF;
END $$;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF aurora.pending_world_exists('sm-mods') IS DISTINCT FROM FALSE THEN
    RAISE EXCEPTION 'FAIL: a signed-in member was told a pending world exists';
  END IF;
  IF aurora.server_maps('sm-mods') IS DISTINCT FROM ARRAY['Raven Creek B42', 'RaccoonCity', 'Constown, KY', 'Lawnmower', 'Vehicle Spawn Zones', 'Muldraugh, KY']::text[] THEN
    RAISE EXCEPTION 'FAIL: a member reads a different list';
  END IF;
  RAISE NOTICE 'PASS a member gets FALSE from pending_world_exists and the same public list';
END $$;

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF current_setting('sm.has_worlds') = 'true' THEN
    IF aurora.pending_world_exists('sm-mods') IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'FAIL: an admin was not told about sm-mods''s pending world';
    END IF;
    IF aurora.pending_world_exists('sm-vanilla') IS DISTINCT FROM FALSE THEN
      RAISE EXCEPTION 'FAIL: sm-vanilla has only a current world, pending_world_exists said otherwise';
    END IF;
    IF aurora.pending_world_exists('sm-noconf') IS DISTINCT FROM FALSE THEN
      RAISE EXCEPTION 'FAIL: a server with no worlds reported a pending one';
    END IF;
    RAISE NOTICE 'PASS an admin sees TRUE only for the server holding a pending world';
  ELSE
    IF aurora.pending_world_exists('sm-mods') IS DISTINCT FROM FALSE THEN
      RAISE EXCEPTION 'FAIL: without 032 the admin answer must be FALSE, not an error or NULL';
    END IF;
    RAISE NOTICE 'PASS without 032 an admin gets FALSE (no error)';
  END IF;
END $$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL SERVER MAPS TESTS PASSED'; END $$;

ROLLBACK;
