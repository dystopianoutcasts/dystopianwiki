-- Tests for migration 028: claimed cars, one row per car, stale-car cleanup.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL VEHICLE CLAIM TESTS PASSED", or stops at the first failure.
--
-- "Running 028 twice is fine" cannot be asserted from inside this file (the SQL
-- editor has no \i); the run script applies the migration twice, with rows in
-- between, before running this.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES (server 'test-veh', and a second server that must never leak in)
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'veh-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'veh-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen) VALUES
  ('test-veh',  'Vehicle Test Server', NOW()),
  ('test-veh2', 'Other Server',        NOW()),
  ('test-rel',  'Release Server',      NOW()),
  ('test-rel2', 'Release Server 2',    NOW()),
  ('test-empty', 'Empty Read Server',  NOW()),
  ('test-floor', 'Floor Server',       NOW());

-- Ledger fixtures for the release counter (section 5d).
INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner, script, name, x, y) VALUES
  ('test-rel', 1, 'r1', 'Base.Van', 'Van', 1, 1),
  ('test-rel', 2, 'r2', 'Base.Van', 'Van', 2, 2),
  ('test-rel', 3, 'r3', 'Base.Van', 'Van', 3, 3),
  ('test-rel2', 1, 's1', 'Base.Van', 'Van', 1, 1),
  ('test-rel2', 2, 's2', 'Base.Van', 'Van', 2, 2),
  ('test-empty', 1, 'e1', 'Base.Van', 'Van', 1, 1),
  ('test-empty', 2, 'e2', 'Base.Van', 'Van', 2, 2),
  ('test-floor', 1, 'f1', 'Base.Van', 'Van', 1, 1),
  ('test-floor', 2, 'f2', 'Base.Van', 'Van', 2, 2);

-- Rows in aurora.vehicles. "fresh" = seen now, "stale" = seen 30-50 hours ago.
--   id 1  sql 101  fresh,  unclaimed, has a driver                 -> shown
--   id 2  sql 102  stale,  unclaimed                               -> HIDDEN
--   id 3  sql 103  stale,  claimed in the ledger, vehicles row is
--                  fresher than the ledger                         -> shown, vehicles position
--   id 4  sql 104  stale,  claimed in the ledger, ledger is
--                  fresher than the vehicles row                   -> shown, ledger position;
--                  the row still names a previous owner, the ledger wins
--   id 6  no sql   stale,  an old-style row                        -> HIDDEN
--   id 7  no sql   fresh,  an old-style row                        -> shown
--   id 9  sql 109  stale,  claimed_by on the row, not in the ledger -> shown
--   id 10 sql 110  fresh,  a CarNormal that inherited the sql id of
--                  a claimed Van (recycled id)                     -> shown, unclaimed
--   id 11 sql 111  stale,  unclaimed (a ninth row, so a count of every row differs
--                  from a count of the cars the map shows)          -> HIDDEN
INSERT INTO aurora.vehicles (server_id, vehicle_id, sql_id, script_name, x, y, z, t, driver_username, claimed_by) VALUES
  ('test-veh', 1,  101,  'Base.CarNormal', 100, 100, 0, NOW(),                      'secretdriver', NULL),
  ('test-veh', 2,  102,  'Base.Van',       200, 200, 0, NOW() - INTERVAL '30 hours', NULL,           NULL),
  ('test-veh', 3,  103,  'Base.Van',       300, 300, 0, NOW() - INTERVAL '30 hours', NULL,           'alice'),
  ('test-veh', 4,  104,  'Base.Van',       400, 400, 0, NOW() - INTERVAL '50 hours', NULL,           'old-owner'),
  ('test-veh', 6,  NULL, 'Base.Van',       600, 600, 0, NOW() - INTERVAL '30 hours', NULL,           NULL),
  ('test-veh', 7,  NULL, 'Base.Van',       700, 700, 0, NOW(),                      NULL,           NULL),
  ('test-veh', 9,  109,  'Base.Van',       900, 900, 0, NOW() - INTERVAL '30 hours', NULL,           'carol'),
  ('test-veh', 10, 110,  'Base.CarNormal', 1000, 1000, 0, NOW(),                    NULL,           NULL),
  ('test-veh', 11, 111,  'Base.Van',       1100, 1100, 0, NOW() - INTERVAL '31 hours', NULL,           NULL),
  ('test-veh2', 1, 101,  'Base.CarNormal', 5, 5, 0, NOW(), NULL, NULL);

INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner, script, name, x, y, claimed_at, last_seen) VALUES
  ('test-veh', 103, 'alice', 'Base.Van', 'Van', 333, 333, NOW() - INTERVAL '5 days', NOW() - INTERVAL '40 hours'),
  ('test-veh', 104, 'dana',  'Base.Van', 'Van', 444, 444, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour'),
  ('test-veh', 105, 'bob',   'Base.PickUpTruck', 'PickUp', 555, 555, NOW() - INTERVAL '9 days', NOW() - INTERVAL '3 days'),
  ('test-veh', 110, 'erin',  'Base.Van', 'Van', 1110, 1110, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('test-veh2', 101, 'frank', 'Base.CarNormal', 'CarNormal', 5, 5, NOW() - INTERVAL '7 minutes', NOW() - INTERVAL '7 minutes');

-- ============================================================================
-- 1. ANON: what the public map reads
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.vehicles_visible WHERE server_id = 'test-veh';
  -- v1, v3, v4, v7, v9, v10 + ledger-only claims 105 and 110 (the Van that lost its id to a CarNormal).
  IF n <> 8 THEN RAISE EXCEPTION 'FAIL: anon sees % cars, expected 8', n; END IF;
  RAISE NOTICE 'PASS anon sees exactly the loaded-recently cars plus every claimed car (8)';

  IF EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 102) THEN
    RAISE EXCEPTION 'FAIL: an unclaimed car unseen for 30 hours is on the public map';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND vehicle_id = 6) THEN
    RAISE EXCEPTION 'FAIL: a stale old-style row is on the public map';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND vehicle_id = 7) THEN
    RAISE EXCEPTION 'FAIL: a fresh old-style row (no sql_id) is missing';
  END IF;
  RAISE NOTICE 'PASS an unclaimed car older than 24 hours is hidden, a fresh old-style row is not';

  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 103) THEN
    RAISE EXCEPTION 'FAIL: a claimed car with a 30-hour-old row is hidden';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 104) THEN
    RAISE EXCEPTION 'FAIL: a claimed car with a 50-hour-old row is hidden';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 105) THEN
    RAISE EXCEPTION 'FAIL: a claimed car that is not in vehicles at all is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 109) THEN
    RAISE EXCEPTION 'FAIL: a car claimed only on its row (ledger down) is hidden';
  END IF;
  RAISE NOTICE 'PASS anon sees claimed cars that are stale, absent from vehicles, or claimed only on the row';

  IF (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 103) <> 'alice'
     OR (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 104) <> 'dana'
     OR (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 105) <> 'bob'
     OR (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 109) <> 'carol' THEN
    RAISE EXCEPTION 'FAIL: claimed_by does not show the owner';
  END IF;
  IF (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 101) IS NOT NULL
     OR (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND vehicle_id = 7) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: an unclaimed car has a claimed_by';
  END IF;
  RAISE NOTICE 'PASS claimed_by shows the owner, and is null for an unclaimed car';

  -- Position and from_ledger: the fresher of the vehicles row and the ledger wins.
  IF (SELECT x FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 103) <> 300
     OR (SELECT from_ledger FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 103) THEN
    RAISE EXCEPTION 'FAIL: the fresher vehicles row should have won for sql 103';
  END IF;
  IF (SELECT x FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 104) <> 444
     OR NOT (SELECT from_ledger FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 104) THEN
    RAISE EXCEPTION 'FAIL: the fresher ledger should have won for sql 104';
  END IF;
  IF (SELECT x FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 105) <> 555
     OR NOT (SELECT from_ledger FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 105)
     OR (SELECT script_name FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 105) <> 'Base.PickUpTruck' THEN
    RAISE EXCEPTION 'FAIL: a ledger-only car should be drawn at the ledger position';
  END IF;
  IF (SELECT vehicle_id FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 105) >= 0 THEN
    RAISE EXCEPTION 'FAIL: a ledger-only car should carry a negative stand-in vehicle_id';
  END IF;
  RAISE NOTICE 'PASS the fresher of vehicles and ledger gives the position; ledger-only cars are flagged';

  -- One row per car: the claimed Van (103) is in both tables and appears once; sql 110 is two cars.
  IF (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 103) <> 1 THEN
    RAISE EXCEPTION 'FAIL: a car in both vehicles and the ledger appears more than once';
  END IF;
  IF (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 110) <> 2 THEN
    RAISE EXCEPTION 'FAIL: a recycled sql id (CarNormal over a claimed Van) should be two cars';
  END IF;
  IF (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 110 AND script_name = 'Base.CarNormal') IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: the CarNormal that recycled the Van''s sql id inherited its claim';
  END IF;
  RAISE NOTICE 'PASS one row per car; a recycled sql id does not hand its claim to a different script';

  IF (SELECT claimed_by FROM aurora.vehicles_visible WHERE server_id = 'test-veh' AND sql_id = 101) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: another server''s claim for the same sql id marked this server''s car as claimed';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicles_visible WHERE server_id = 'test-veh2' AND sql_id <> 101) THEN
    RAISE EXCEPTION 'FAIL: another server''s rows leaked';
  END IF;
  RAISE NOTICE 'PASS servers stay separate';
END $$;

-- ============================================================================
-- 2. ANON: what stays private
-- ============================================================================

DO $$
BEGIN
  BEGIN
    EXECUTE 'SELECT driver_username FROM aurora.vehicles_visible';
    RAISE EXCEPTION 'FAIL: anon selected driver_username from vehicles_visible';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS vehicles_visible has no driver_username column';
  END;

  BEGIN
    EXECUTE 'SELECT driver_username FROM aurora.vehicles_public()';
    RAISE EXCEPTION 'FAIL: anon selected driver_username from vehicles_public()';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS vehicles_public() has no driver_username column';
  END;

  BEGIN
    EXECUTE 'SELECT driver_username FROM aurora.vehicles';
    RAISE EXCEPTION 'FAIL: anon read aurora.vehicles';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read aurora.vehicles (driver_username lives there)';
  END;

  IF EXISTS (SELECT 1 FROM aurora.vehicles_visible v WHERE to_jsonb(v)::text LIKE '%secretdriver%') THEN
    RAISE EXCEPTION 'FAIL: a driver username appears in the public rows';
  END IF;
  RAISE NOTICE 'PASS no driver username appears anywhere in the public rows';

  -- The columns the live map names are all still there, with their types.
  PERFORM server_id, vehicle_id, script_name, x, y, z, t FROM aurora.vehicles_visible LIMIT 1;
  RAISE NOTICE 'PASS the seven columns the live map already reads are unchanged';

  -- vehicle_claims: drawn columns yes, the rest no.
  PERFORM server_id, sql_id, owner, script, name, x, y FROM aurora.vehicle_claims;
  RAISE NOTICE 'PASS anon reads the drawn vehicle_claims columns';

  BEGIN
    EXECUTE 'SELECT claimed_at FROM aurora.vehicle_claims';
    RAISE EXCEPTION 'FAIL: anon read vehicle_claims.claimed_at';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read vehicle_claims.claimed_at';
  END;
  BEGIN
    EXECUTE 'SELECT last_seen FROM aurora.vehicle_claims';
    RAISE EXCEPTION 'FAIL: anon read vehicle_claims.last_seen';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read vehicle_claims.last_seen';
  END;
  BEGIN
    EXECUTE 'SELECT * FROM aurora.vehicle_claims';
    RAISE EXCEPTION 'FAIL: anon ran SELECT * on vehicle_claims';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot SELECT * from vehicle_claims';
  END;
  BEGIN
    EXECUTE 'INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner) VALUES (''test-veh'', 999, ''mallory'')';
    RAISE EXCEPTION 'FAIL: anon wrote to vehicle_claims';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot write vehicle_claims';
  END;

  BEGIN
    PERFORM aurora.upsert_vehicles('test-veh', '[]'::jsonb);
    RAISE EXCEPTION 'FAIL: anon ran upsert_vehicles';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run upsert_vehicles';
  END;
  BEGIN
    PERFORM aurora.prune_vehicles();
    RAISE EXCEPTION 'FAIL: anon ran prune_vehicles';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run prune_vehicles';
  END;
  BEGIN
    PERFORM aurora.release_missing_claims('test-veh', ARRAY[1]::bigint[], 3);
    RAISE EXCEPTION 'FAIL: anon ran release_missing_claims';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run release_missing_claims';
  END;
  BEGIN
    PERFORM * FROM aurora.vehicles_rows();
    RAISE EXCEPTION 'FAIL: anon ran the internal vehicles_rows()';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run the internal vehicles_rows()';
  END;
  BEGIN
    PERFORM * FROM aurora.vehicles_admin('test-veh');
    RAISE EXCEPTION 'FAIL: anon ran vehicles_admin';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run vehicles_admin';
  END;

  -- The ledger's own times are not columns of the public view or function.
  BEGIN
    EXECUTE 'SELECT claimed_at FROM aurora.vehicles_visible';
    RAISE EXCEPTION 'FAIL: vehicles_visible has a claimed_at column';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS vehicles_visible has no claimed_at column';
  END;
  BEGIN
    EXECUTE 'SELECT last_seen FROM aurora.vehicles_public()';
    RAISE EXCEPTION 'FAIL: vehicles_public() has a last_seen column';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS vehicles_public() has no last_seen column';
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- 3. AUTHENTICATED (not an admin): same public surface
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.vehicles_visible WHERE server_id = 'test-veh') <> 8 THEN
    RAISE EXCEPTION 'FAIL: a signed-in user should see the same 8 cars';
  END IF;
  BEGIN
    EXECUTE 'SELECT last_seen FROM aurora.vehicle_claims';
    RAISE EXCEPTION 'FAIL: authenticated read vehicle_claims.last_seen';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  RAISE NOTICE 'PASS a signed-in user sees the same cars and not the private claim columns';
END $$;

RESET ROLE;

-- ============================================================================
-- 4. HOME SUMMARY counts what the map shows
-- ============================================================================

DO $$
DECLARE
  shown int := (SELECT count(*) FROM aurora.vehicles_public() WHERE server_id = 'test-veh');
  counted int := (aurora.home_summary('test-veh')->>'vehicles')::int;
BEGIN
  IF shown <> counted THEN
    RAISE EXCEPTION 'FAIL: home_summary counts % vehicles, the map shows %', counted, shown;
  END IF;
  IF counted <> 8 THEN RAISE EXCEPTION 'FAIL: expected 8, got %', counted; END IF;
  RAISE NOTICE 'PASS home_summary vehicles equals the number of cars on the map';
END $$;

-- ============================================================================
-- 4b. `t` NEVER CARRIES THE LEDGER'S claimed_at OR last_seen
-- ============================================================================
-- Both are admin only. And `t` must never lead the log (the client delta-polls
-- `t > newest t held`): a ledger-only car is at the epoch, a car where the ledger
-- wins the position keeps its vehicles row's own t.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM aurora.vehicles_public() p
      JOIN aurora.vehicle_claims c ON c.server_id = p.server_id AND c.sql_id = p.sql_id
     WHERE p.t IN (c.claimed_at, c.last_seen)
  ) THEN
    RAISE EXCEPTION 'FAIL: a public t equals a claim''s claimed_at or last_seen';
  END IF;
  IF (SELECT p.t FROM aurora.vehicles_public() p WHERE p.server_id = 'test-veh' AND p.sql_id = 105)
     IS DISTINCT FROM to_timestamp(0) THEN
    RAISE EXCEPTION 'FAIL: a ledger-only row''s t is not the epoch';
  END IF;
  IF (SELECT p.t FROM aurora.vehicles_public() p WHERE p.server_id = 'test-veh' AND p.sql_id = 104)
     IS DISTINCT FROM (SELECT v.t FROM aurora.vehicles v WHERE v.server_id = 'test-veh' AND v.sql_id = 104) THEN
    RAISE EXCEPTION 'FAIL: a row where the ledger wins the position lost its vehicles row''s t';
  END IF;
  IF (SELECT max(p.t) FROM aurora.vehicles_public() p WHERE p.server_id = 'test-veh')
     > (SELECT max(v.t) FROM aurora.vehicles v WHERE v.server_id = 'test-veh') THEN
    RAISE EXCEPTION 'FAIL: a public t leads the newest vehicles row (the delta cursor would jump ahead of the log)';
  END IF;
  IF (SELECT p.t FROM aurora.vehicles_public() p WHERE p.server_id = 'test-veh' AND p.sql_id = 103)
     IS DISTINCT FROM (SELECT v.t FROM aurora.vehicles v WHERE v.server_id = 'test-veh' AND v.sql_id = 103) THEN
    RAISE EXCEPTION 'FAIL: a row the vehicles table wins lost its own t';
  END IF;
  RAISE NOTICE 'PASS t never leads the log and never carries claimed_at or last_seen';
END $$;

-- ============================================================================
-- 4c. THE ADMIN PATH: aurora.vehicles_admin(server)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"dddddddd-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.vehicles_admin('test-veh')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a non-admin member got rows from vehicles_admin';
  END IF;
  RAISE NOTICE 'PASS a signed-in non-admin gets nothing from vehicles_admin';
  BEGIN
    PERFORM * FROM aurora.vehicles_rows();
    RAISE EXCEPTION 'FAIL: authenticated ran the internal vehicles_rows()';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS authenticated cannot run the internal vehicles_rows()';
  END;
END $$;

SELECT set_config('request.jwt.claims', '{"sub":"dddddddd-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.vehicles_admin('test-veh')) <> 8 THEN
    RAISE EXCEPTION 'FAIL: the admin sees % cars, expected the same 8 as the map',
      (SELECT count(*) FROM aurora.vehicles_admin('test-veh'));
  END IF;
  IF EXISTS (
    (SELECT server_id, vehicle_id, script_name, x, y, z, t, claimed_by, sql_id, from_ledger FROM aurora.vehicles_admin('test-veh')
     EXCEPT SELECT server_id, vehicle_id, script_name, x, y, z, t, claimed_by, sql_id, from_ledger FROM aurora.vehicles_public() WHERE server_id = 'test-veh')
    UNION ALL
    (SELECT server_id, vehicle_id, script_name, x, y, z, t, claimed_by, sql_id, from_ledger FROM aurora.vehicles_public() WHERE server_id = 'test-veh'
     EXCEPT SELECT server_id, vehicle_id, script_name, x, y, z, t, claimed_by, sql_id, from_ledger FROM aurora.vehicles_admin('test-veh'))
  ) THEN
    RAISE EXCEPTION 'FAIL: vehicles_admin and vehicles_public() are not the same rows';
  END IF;
  RAISE NOTICE 'PASS an admin gets exactly the public rows (same set, same values) plus the private columns';

  IF (SELECT driver_username FROM aurora.vehicles_admin('test-veh') WHERE sql_id = 101) IS DISTINCT FROM 'secretdriver' THEN
    RAISE EXCEPTION 'FAIL: the admin cannot see the driver';
  END IF;
  IF (SELECT claimed_at FROM aurora.vehicles_admin('test-veh') WHERE sql_id = 105) IS NULL
     OR (SELECT last_seen FROM aurora.vehicles_admin('test-veh') WHERE sql_id = 105) IS NULL THEN
    RAISE EXCEPTION 'FAIL: the admin cannot see the ledger times of a ledger-only claim';
  END IF;
  IF (SELECT count(*) FROM aurora.vehicles_admin('test-veh2')) <> 1 OR (SELECT count(*) FROM aurora.vehicles_admin('no-such')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: vehicles_admin does not filter by server';
  END IF;
  RAISE NOTICE 'PASS an admin reads driver_username, claimed_at and last_seen, per server';
END $$;

RESET ROLE;

-- ============================================================================
-- 5. SERVICE ROLE: the ingest's writes
-- ============================================================================

SET LOCAL ROLE service_role;

-- 5a. A restart: the same cars under new net ids, one of them swapping ids with
-- another, one taking the id of an old-style row. sql 101 moves id 1 -> 8, so
-- its row must be updated, not duplicated.
DO $$
BEGIN
  PERFORM aurora.upsert_vehicles('test-veh', jsonb_build_array(
    jsonb_build_object('vehicle_id', 8, 'sql_id', 101, 'script_name', 'Base.CarNormal', 'x', 111, 'y', 111, 'z', 0,
                       't', NOW(), 'driver_username', 'secretdriver', 'claimed_by', NULL),
    jsonb_build_object('vehicle_id', 3, 'sql_id', 104, 'script_name', 'Base.Van', 'x', 441, 'y', 441, 'z', 0,
                       't', NOW(), 'driver_username', NULL, 'claimed_by', 'dana'),
    jsonb_build_object('vehicle_id', 4, 'sql_id', 103, 'script_name', 'Base.Van', 'x', 331, 'y', 331, 'z', 0,
                       't', NOW(), 'driver_username', NULL, 'claimed_by', 'alice'),
    jsonb_build_object('vehicle_id', 7, 'sql_id', 107, 'script_name', 'Base.Van', 'x', 771, 'y', 771, 'z', 0,
                       't', NOW(), 'driver_username', NULL, 'claimed_by', NULL)));

  IF (SELECT count(*) FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 101) <> 1 THEN
    RAISE EXCEPTION 'FAIL: a restart left more than one row for sql 101';
  END IF;
  IF (SELECT vehicle_id FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 101) <> 8
     OR (SELECT x FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 101) <> 111 THEN
    RAISE EXCEPTION 'FAIL: the row for sql 101 did not move to its new net id and position';
  END IF;
  RAISE NOTICE 'PASS a restart duplicate (same sql_id, new vehicle_id) updates the one row';

  IF (SELECT vehicle_id FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 103) <> 4
     OR (SELECT vehicle_id FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 104) <> 3 THEN
    RAISE EXCEPTION 'FAIL: two cars swapping net ids were not both written';
  END IF;
  RAISE NOTICE 'PASS two cars swapping net ids inside one batch both land';

  IF EXISTS (SELECT 1 FROM aurora.vehicles WHERE server_id = 'test-veh' AND vehicle_id = 7 AND sql_id IS NULL) THEN
    RAISE EXCEPTION 'FAIL: the old-style row holding net id 7 survived the car that now owns it';
  END IF;
  IF (SELECT sql_id FROM aurora.vehicles WHERE server_id = 'test-veh' AND vehicle_id = 7) <> 107 THEN
    RAISE EXCEPTION 'FAIL: net id 7 is not held by sql 107';
  END IF;
  RAISE NOTICE 'PASS an old-style row in the way is replaced by the car that owns the id now';

  -- sql 102 (no incoming record) kept its row; nothing else was parked or lost.
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 102 AND vehicle_id = 2) THEN
    RAISE EXCEPTION 'FAIL: an untouched car lost its row';
  END IF;
  RAISE NOTICE 'PASS cars not in the batch are left alone';

  -- A car whose id was taken by another is parked, not lost.
  PERFORM aurora.upsert_vehicles('test-veh', jsonb_build_array(
    jsonb_build_object('vehicle_id', 2, 'sql_id', 150, 'script_name', 'Base.Van', 'x', 1, 'y', 1, 'z', 0,
                       't', NOW(), 'driver_username', NULL, 'claimed_by', NULL)));
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 102 AND vehicle_id < 0) THEN
    RAISE EXCEPTION 'FAIL: the car whose net id was taken should be parked on a negative id';
  END IF;
  RAISE NOTICE 'PASS a car whose net id was taken is parked, with its position kept';

  -- The old path: a record with no sql_id, on (server_id, vehicle_id), never writes claimed_by.
  PERFORM aurora.upsert_vehicles('test-veh', jsonb_build_array(
    jsonb_build_object('vehicle_id', 8, 'sql_id', NULL, 'script_name', 'Base.Old', 'x', 1, 'y', 1, 'z', 0,
                       't', NOW(), 'driver_username', NULL, 'claimed_by', 'mallory'),
    jsonb_build_object('vehicle_id', 70, 'sql_id', NULL, 'script_name', 'Base.Old', 'x', 2, 'y', 2, 'z', 0,
                       't', NOW(), 'driver_username', NULL, 'claimed_by', 'mallory')));
  IF EXISTS (SELECT 1 FROM aurora.vehicles WHERE claimed_by = 'mallory') THEN
    RAISE EXCEPTION 'FAIL: an old-style record wrote claimed_by';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles WHERE server_id = 'test-veh' AND vehicle_id = 70 AND sql_id IS NULL) THEN
    RAISE EXCEPTION 'FAIL: an old-style record did not land';
  END IF;
  RAISE NOTICE 'PASS old-style records still land and cannot claim a car';
END $$;

-- 5b. The key itself: a second row for one sql_id is impossible.
DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.vehicles (server_id, vehicle_id, sql_id, t) VALUES ('test-veh', 9999, 109, NOW());
    RAISE EXCEPTION 'FAIL: a second vehicles row for sql 109 was accepted';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS the database refuses a second row for one (server, sql_id)';
  END;
  -- NULL sql_ids do not collide with each other.
  INSERT INTO aurora.vehicles (server_id, vehicle_id, sql_id, t) VALUES ('test-veh', 9998, NULL, NOW()), ('test-veh', 9997, NULL, NOW());
  RAISE NOTICE 'PASS rows without a sql_id may coexist';
END $$;

-- 5c. The ledger upsert the ingest sends, then the grace-window delete.
DO $$
BEGIN
  INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner, script, name, x, y, claimed_at, last_seen, synced_at)
  VALUES ('test-veh', 105, 'bob2', 'Base.PickUpTruck', 'PickUp', 560, 560, NOW(), NOW(), NOW())
  ON CONFLICT (server_id, sql_id) DO UPDATE
     SET owner = EXCLUDED.owner, x = EXCLUDED.x, y = EXCLUDED.y, last_seen = EXCLUDED.last_seen, synced_at = EXCLUDED.synced_at;
  IF (SELECT owner FROM aurora.vehicle_claims WHERE server_id = 'test-veh' AND sql_id = 105) <> 'bob2' THEN
    RAISE EXCEPTION 'FAIL: service_role could not upsert vehicle_claims';
  END IF;
  RAISE NOTICE 'PASS service_role upserts vehicle_claims on (server_id, sql_id)';

  -- A release: deleting a claim clears claimed_by on the car, so the stale row cannot keep it on the map.
  DELETE FROM aurora.vehicle_claims WHERE server_id = 'test-veh' AND sql_id = 103;
  IF (SELECT claimed_by FROM aurora.vehicles WHERE server_id = 'test-veh' AND sql_id = 103) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: a released claim left claimed_by on the car';
  END IF;
  RAISE NOTICE 'PASS a claim leaving the ledger clears claimed_by on the car';
END $$;

-- 5d. The release counter: consecutive complete misses, not minutes.
DO $$
DECLARE
  n int;
BEGIN
  -- NULL is "no read": nothing moves.
  SELECT aurora.release_missing_claims('test-rel', NULL, 3) INTO n;
  IF n <> 0 OR (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-rel') <> 3
     OR (SELECT sum(miss_count) FROM aurora.vehicle_claims WHERE server_id = 'test-rel') <> 0 THEN
    RAISE EXCEPTION 'FAIL: a NULL read changed the claims';
  END IF;
  RAISE NOTICE 'PASS a NULL (no read) changes nothing';

  -- An empty list is a read with nothing present: one and two of them release nothing.
  SELECT aurora.release_missing_claims('test-empty', ARRAY[]::bigint[], 3) INTO n;
  IF n <> 0 OR (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-empty') <> 2
     OR (SELECT min(miss_count) FROM aurora.vehicle_claims WHERE server_id = 'test-empty') <> 1 THEN
    RAISE EXCEPTION 'FAIL: one empty read should count one miss and release nothing (released %)', n;
  END IF;
  SELECT aurora.release_missing_claims('test-empty', ARRAY[]::bigint[], 3) INTO n;
  IF n <> 0 OR (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-empty') <> 2
     OR (SELECT min(miss_count) FROM aurora.vehicle_claims WHERE server_id = 'test-empty') <> 2 THEN
    RAISE EXCEPTION 'FAIL: two empty reads must not release (released %)', n;
  END IF;
  RAISE NOTICE 'PASS one and two empty reads count misses and release nothing';

  -- A non-empty read in between starts the count over.
  PERFORM aurora.release_missing_claims('test-empty', ARRAY[1, 2]::bigint[], 3);
  IF (SELECT max(miss_count) FROM aurora.vehicle_claims WHERE server_id = 'test-empty') <> 0 THEN
    RAISE EXCEPTION 'FAIL: a read containing the claims did not reset them';
  END IF;
  SELECT aurora.release_missing_claims('test-empty', ARRAY[]::bigint[], 3) INTO n;
  SELECT aurora.release_missing_claims('test-empty', ARRAY[]::bigint[], 3) INTO n;
  IF n <> 0 OR (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-empty') <> 2 THEN
    RAISE EXCEPTION 'FAIL: two empty reads after a reset released something';
  END IF;
  RAISE NOTICE 'PASS a non-empty read between empty reads resets the counter';

  -- Three consecutive empty reads release everything (the last claim on a server can go).
  SELECT aurora.release_missing_claims('test-empty', ARRAY[]::bigint[], 3) INTO n;
  IF n <> 2 OR EXISTS (SELECT 1 FROM aurora.vehicle_claims WHERE server_id = 'test-empty') THEN
    RAISE EXCEPTION 'FAIL: three consecutive empty reads should release both claims (released %)', n;
  END IF;
  RAISE NOTICE 'PASS three consecutive empty reads release every claim';

  -- Claim 1 stays in the file; 2 and 3 are missing.
  SELECT aurora.release_missing_claims('test-rel', ARRAY[1]::bigint[], 3) INTO n;
  IF n <> 0 OR (SELECT miss_count FROM aurora.vehicle_claims WHERE server_id = 'test-rel' AND sql_id = 2) <> 1 THEN
    RAISE EXCEPTION 'FAIL: the first miss should count 1 and release nothing (released %)', n;
  END IF;
  SELECT aurora.release_missing_claims('test-rel', ARRAY[1]::bigint[], 3) INTO n;
  IF n <> 0 OR (SELECT miss_count FROM aurora.vehicle_claims WHERE server_id = 'test-rel' AND sql_id = 2) <> 2 THEN
    RAISE EXCEPTION 'FAIL: two misses must not release (released %)', n;
  END IF;
  RAISE NOTICE 'PASS one and two complete misses do not release';

  SELECT aurora.release_missing_claims('test-rel', ARRAY[1]::bigint[], 3) INTO n;
  IF n <> 2 OR EXISTS (SELECT 1 FROM aurora.vehicle_claims WHERE server_id = 'test-rel' AND sql_id IN (2, 3)) THEN
    RAISE EXCEPTION 'FAIL: the third complete miss should release claims 2 and 3 (released %)', n;
  END IF;
  IF (SELECT miss_count FROM aurora.vehicle_claims WHERE server_id = 'test-rel' AND sql_id = 1) <> 0 THEN
    RAISE EXCEPTION 'FAIL: the claim that stayed in the file has a miss count';
  END IF;
  RAISE NOTICE 'PASS three complete misses release, and a present claim keeps 0';

  -- A claim seen again starts over.
  PERFORM aurora.release_missing_claims('test-rel2', ARRAY[1]::bigint[], 3);
  PERFORM aurora.release_missing_claims('test-rel2', ARRAY[1]::bigint[], 3);
  IF (SELECT miss_count FROM aurora.vehicle_claims WHERE server_id = 'test-rel2' AND sql_id = 2) <> 2 THEN
    RAISE EXCEPTION 'FAIL: expected 2 misses before the claim returns';
  END IF;
  PERFORM aurora.release_missing_claims('test-rel2', ARRAY[1, 2]::bigint[], 3);
  IF (SELECT miss_count FROM aurora.vehicle_claims WHERE server_id = 'test-rel2' AND sql_id = 2) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a claim seen again did not reset its counter';
  END IF;
  SELECT aurora.release_missing_claims('test-rel2', ARRAY[1]::bigint[], 3) INTO n;
  IF n <> 0 OR NOT EXISTS (SELECT 1 FROM aurora.vehicle_claims WHERE server_id = 'test-rel2' AND sql_id = 2) THEN
    RAISE EXCEPTION 'FAIL: a claim that was seen again was released after one more miss';
  END IF;
  RAISE NOTICE 'PASS a claim seen again resets its counter';

  -- A limit below 1 is floored at 1: the missing claim goes after its first miss, the present one stays.
  SELECT aurora.release_missing_claims('test-floor', ARRAY[1]::bigint[], 0) INTO n;
  IF n <> 1 OR EXISTS (SELECT 1 FROM aurora.vehicle_claims WHERE server_id = 'test-floor' AND sql_id = 2)
     OR NOT EXISTS (SELECT 1 FROM aurora.vehicle_claims WHERE server_id = 'test-floor' AND sql_id = 1) THEN
    RAISE EXCEPTION 'FAIL: p_misses 0 should act as 1: release only the missing claim (released %)', n;
  END IF;
  SELECT aurora.release_missing_claims('test-floor', ARRAY[1]::bigint[], -5) INTO n;
  IF n <> 0 OR NOT EXISTS (SELECT 1 FROM aurora.vehicle_claims WHERE server_id = 'test-floor' AND sql_id = 1) THEN
    RAISE EXCEPTION 'FAIL: p_misses -5 released a claim that was present (released %)', n;
  END IF;
  RAISE NOTICE 'PASS p_misses below 1 is floored at 1';

  -- Other servers are untouched by a call for one.
  IF (SELECT count(*) FROM aurora.vehicle_claims WHERE server_id = 'test-veh') <> 3 THEN
    RAISE EXCEPTION 'FAIL: release_missing_claims touched another server';
  END IF;
  RAISE NOTICE 'PASS release_missing_claims stays inside its server';
END $$;

RESET ROLE;

-- Car 103 is now unclaimed and fresh (just upserted): still shown. Age it: hidden.
UPDATE aurora.vehicles SET t = NOW() - INTERVAL '30 hours' WHERE server_id = 'test-veh' AND sql_id = 103;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM aurora.vehicles_public() WHERE server_id = 'test-veh' AND sql_id = 103) THEN
    RAISE EXCEPTION 'FAIL: a released car that is 30 hours stale is still on the map';
  END IF;
  RAISE NOTICE 'PASS a released car goes back to the 24-hour rule';
END $$;

-- ============================================================================
-- 6. PRUNE
-- ============================================================================

INSERT INTO aurora.vehicles (server_id, vehicle_id, sql_id, script_name, x, y, z, t, claimed_by) VALUES
  ('test-veh', 8001, NULL, 'Base.Old',  1, 1, 0, NOW() - INTERVAL '20 days', NULL),   -- unclaimed, old: goes
  ('test-veh', 8002, NULL, 'Base.Old',  1, 1, 0, NOW() - INTERVAL '15 days', NULL),   -- unclaimed, old: goes
  ('test-veh', 8003, NULL, 'Base.Old',  1, 1, 0, NOW() - INTERVAL '13 days', NULL),   -- inside 14 days: stays
  ('test-veh', 8004, 8004, 'Base.Van',  1, 1, 0, NOW() - INTERVAL '40 days', NULL),   -- in the ledger: stays
  ('test-veh', 8005, 8005, 'Base.Van',  1, 1, 0, NOW() - INTERVAL '40 days', 'zed');  -- claimed on the row: stays
INSERT INTO aurora.vehicle_claims (server_id, sql_id, owner, script, x, y) VALUES ('test-veh', 8004, 'yan', 'Base.Van', 1, 1);

DO $$
DECLARE
  n int;
BEGIN
  SELECT aurora.prune_vehicles(14, 1) INTO n;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: p_limit 1 deleted % rows', n; END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicles WHERE vehicle_id = 8002) THEN
    RAISE EXCEPTION 'FAIL: prune did not take the oldest first';
  END IF;
  RAISE NOTICE 'PASS prune is bounded by p_limit and takes the oldest first';

  SELECT aurora.prune_vehicles(14, 5000) INTO n;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: the second prune deleted % rows, expected 1', n; END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicles WHERE vehicle_id IN (8001, 8002)) THEN
    RAISE EXCEPTION 'FAIL: an unclaimed 15-day-old row survived';
  END IF;
  IF (SELECT count(*) FROM aurora.vehicles WHERE vehicle_id IN (8003, 8004, 8005)) <> 3 THEN
    RAISE EXCEPTION 'FAIL: prune took a recent, ledger-claimed or row-claimed car';
  END IF;
  RAISE NOTICE 'PASS prune takes unclaimed cars older than 14 days and never a claimed one';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL VEHICLE CLAIM TESTS PASSED'; END $$;

ROLLBACK;
