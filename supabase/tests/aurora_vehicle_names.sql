-- Tests for migration 031: vehicle display names (aurora.vehicle_names and its
-- public view aurora.vehicle_names_visible), including the vanilla seed.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It asserts and ROLLS
-- BACK. It prints "PASS ..." notices ending in "ALL VEHICLE NAME TESTS PASSED", or
-- stops at the first failure.
--
-- "Running 031 twice is fine" cannot be asserted from inside this file (the SQL
-- editor has no \i); the run script applies the migration twice, with an exporter
-- row changed in between, and checks that the second apply left it alone.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- 1. THE SEED EXISTS (read as postgres, before any role switch)
-- ============================================================================

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.vehicle_names;
  IF n < 200 THEN RAISE EXCEPTION 'FAIL: the seed has % rows, expected the ~231 vanilla cars', n; END IF;
  RAISE NOTICE 'PASS the seed exists (% rows)', n;

  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.CarTaxi') IS DISTINCT FROM 'Taxi' THEN
    RAISE EXCEPTION 'FAIL: Base.CarTaxi is not "Taxi"';
  END IF;
  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.CarNormal') IS DISTINCT FROM 'Chevalier Nyala' THEN
    RAISE EXCEPTION 'FAIL: Base.CarNormal is not "Chevalier Nyala"';
  END IF;
  -- carModelName: a profession van is named for its model, not its own key.
  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.StepVan') IS DISTINCT FROM 'Chevalier Step Van' THEN
    RAISE EXCEPTION 'FAIL: Base.StepVan is not "Chevalier Step Van"';
  END IF;
  -- The Burnt rule: "Burnt %1" around the unburnt name.
  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.AmbulanceBurnt') IS DISTINCT FROM 'Burnt Ambulance' THEN
    RAISE EXCEPTION 'FAIL: Base.AmbulanceBurnt is not "Burnt Ambulance"';
  END IF;
  RAISE NOTICE 'PASS seed spot checks: plain, shared model name, burnt';

  IF EXISTS (SELECT 1 FROM aurora.vehicle_names WHERE display_name LIKE 'IGUI\_VehicleName%') THEN
    RAISE EXCEPTION 'FAIL: a seed row carries an untranslated key as its name';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicle_names WHERE script_name NOT LIKE '%.%') THEN
    RAISE EXCEPTION 'FAIL: a seed row is not a full "Module.Name" script name';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicle_names WHERE script_name = 'Base.ModernCar_Martin') THEN
    RAISE EXCEPTION 'FAIL: a script with no English name (vanilla shows the key) must have no row';
  END IF;
  RAISE NOTICE 'PASS no seed row is an untranslated key, a short name, or a nameless script';

  IF EXISTS (SELECT 1 FROM aurora.vehicle_names WHERE updated_at <> TIMESTAMPTZ '1970-01-01 00:00:00+00' AND script_name LIKE 'Base.%') THEN
    RAISE NOTICE 'NOTE some Base rows are newer than the epoch: an exporter has already written here';
  END IF;
END $$;

-- ============================================================================
-- 2. ANON READS THE NAMES
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.vehicle_names_visible;
  IF n < 200 THEN RAISE EXCEPTION 'FAIL: anon sees % names through the view', n; END IF;
  IF (SELECT display_name FROM aurora.vehicle_names_visible WHERE script_name = 'Base.CarTaxi') IS DISTINCT FROM 'Taxi' THEN
    RAISE EXCEPTION 'FAIL: anon cannot read Base.CarTaxi through the view';
  END IF;
  RAISE NOTICE 'PASS anon reads the names through aurora.vehicle_names_visible (% rows)', n;

  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.CarTaxi') IS DISTINCT FROM 'Taxi' THEN
    RAISE EXCEPTION 'FAIL: anon cannot read the two granted columns of the table';
  END IF;
  RAISE NOTICE 'PASS anon reads script_name and display_name from the table too';

  -- The view exposes exactly the two columns.
  IF (SELECT string_agg(column_name, ',' ORDER BY ordinal_position)
        FROM information_schema.columns
       WHERE table_schema = 'aurora' AND table_name = 'vehicle_names_visible') IS DISTINCT FROM 'script_name,display_name' THEN
    RAISE EXCEPTION 'FAIL: the view columns are not exactly script_name, display_name';
  END IF;
  RAISE NOTICE 'PASS the view has exactly script_name and display_name';

  BEGIN
    PERFORM updated_at FROM aurora.vehicle_names LIMIT 1;
    RAISE EXCEPTION 'FAIL: anon read updated_at';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM aurora.vehicle_names LIMIT 1;
    RAISE EXCEPTION 'FAIL: anon SELECT * on the table succeeded (updated_at is not granted)';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS updated_at is not readable by anon';
END $$;

-- ============================================================================
-- 3. ANON CANNOT WRITE
-- ============================================================================

DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.vehicle_names (script_name, display_name) VALUES ('Mod.Hacked', 'Hacked');
    RAISE EXCEPTION 'FAIL: anon inserted a name';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE aurora.vehicle_names SET display_name = 'Hacked' WHERE script_name = 'Base.CarTaxi';
    RAISE EXCEPTION 'FAIL: anon updated a name';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM aurora.vehicle_names WHERE script_name = 'Base.CarTaxi';
    RAISE EXCEPTION 'FAIL: anon deleted a name';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_names_visible (script_name, display_name) VALUES ('Mod.Hacked', 'Hacked');
    RAISE EXCEPTION 'FAIL: anon inserted through the view';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon cannot insert, update, delete, or write through the view';
END $$;

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"dddddddd-0000-4000-8000-0000000000aa","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT display_name FROM aurora.vehicle_names_visible WHERE script_name = 'Base.CarTaxi') IS DISTINCT FROM 'Taxi' THEN
    RAISE EXCEPTION 'FAIL: a signed-in user cannot read the names';
  END IF;
  BEGIN
    UPDATE aurora.vehicle_names SET display_name = 'Hacked' WHERE script_name = 'Base.CarTaxi';
    RAISE EXCEPTION 'FAIL: a signed-in user updated a name';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_names (script_name, display_name) VALUES ('Mod.Hacked', 'Hacked');
    RAISE EXCEPTION 'FAIL: a signed-in user inserted a name';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a signed-in user reads but cannot write';
END $$;

RESET ROLE;

-- ============================================================================
-- 4. AN EXPORTER UPSERT OVERWRITES THE SEED
-- ============================================================================
-- What PostgREST sends for `Prefer: resolution=merge-duplicates` with on_conflict=script_name:
-- INSERT ... ON CONFLICT (script_name) DO UPDATE SET <every column> = EXCLUDED.<column>.
-- Run as service_role, the role the ingest uses.

SET LOCAL ROLE service_role;

INSERT INTO aurora.vehicle_names (script_name, display_name, updated_at) VALUES
  ('Base.CarTaxi', 'Cab', TIMESTAMPTZ '2026-10-02 12:00:00+00'),
  ('Mod.91range',  '''91 RANGE ROVER 4-door', TIMESTAMPTZ '2026-10-02 12:00:00+00')
ON CONFLICT (script_name) DO UPDATE
  SET script_name = EXCLUDED.script_name, display_name = EXCLUDED.display_name, updated_at = EXCLUDED.updated_at;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.CarTaxi') IS DISTINCT FROM 'Cab' THEN
    RAISE EXCEPTION 'FAIL: the exporter row did not overwrite the seed';
  END IF;
  IF (SELECT updated_at FROM aurora.vehicle_names WHERE script_name = 'Base.CarTaxi') <> TIMESTAMPTZ '2026-10-02 12:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: updated_at did not move with the overwrite';
  END IF;
  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Base.CarNormal') IS DISTINCT FROM 'Chevalier Nyala' THEN
    RAISE EXCEPTION 'FAIL: the upsert disturbed a seed row it did not name';
  END IF;
  IF (SELECT display_name FROM aurora.vehicle_names WHERE script_name = 'Mod.91range') IS DISTINCT FROM '''91 RANGE ROVER 4-door' THEN
    RAISE EXCEPTION 'FAIL: a modded car (not in the seed) was not added';
  END IF;
  RAISE NOTICE 'PASS an exporter upsert overwrites the seed, adds a modded car, and leaves the rest';
END $$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);
DO $$
BEGIN
  IF (SELECT display_name FROM aurora.vehicle_names_visible WHERE script_name = 'Base.CarTaxi') IS DISTINCT FROM 'Cab'
     OR (SELECT display_name FROM aurora.vehicle_names_visible WHERE script_name = 'Mod.91range') IS DISTINCT FROM '''91 RANGE ROVER 4-door' THEN
    RAISE EXCEPTION 'FAIL: anon does not see the exporter''s names';
  END IF;
  RAISE NOTICE 'PASS anon sees the overwritten and the new name';
END $$;
RESET ROLE;

-- ============================================================================
-- 5. CONSTRAINTS, GRANTS AND SHAPE
-- ============================================================================

DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.vehicle_names (script_name, display_name) VALUES ('Mod.Empty', '');
    RAISE EXCEPTION 'FAIL: an empty display name was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_names (script_name, display_name) VALUES ('', 'No script');
    RAISE EXCEPTION 'FAIL: an empty script name was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_names (script_name, display_name) VALUES ('Mod.Long', repeat('x', 121));
    RAISE EXCEPTION 'FAIL: a 121-character display name was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS empty and over-long names are refused';

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'aurora.vehicle_names'::regclass) THEN
    RAISE EXCEPTION 'FAIL: RLS is off on aurora.vehicle_names';
  END IF;
  IF NOT COALESCE((SELECT reloptions @> ARRAY['security_invoker=true'] FROM pg_class WHERE oid = 'aurora.vehicle_names_visible'::regclass), FALSE) THEN
    RAISE EXCEPTION 'FAIL: vehicle_names_visible must be security_invoker';
  END IF;
  IF has_table_privilege('anon', 'aurora.vehicle_names', 'INSERT')
     OR has_table_privilege('anon', 'aurora.vehicle_names', 'UPDATE')
     OR has_table_privilege('anon', 'aurora.vehicle_names', 'DELETE')
     OR has_table_privilege('authenticated', 'aurora.vehicle_names', 'INSERT')
     OR has_table_privilege('authenticated', 'aurora.vehicle_names', 'UPDATE')
     OR has_table_privilege('authenticated', 'aurora.vehicle_names', 'DELETE') THEN
    RAISE EXCEPTION 'FAIL: a client role holds a write privilege on aurora.vehicle_names';
  END IF;
  IF has_column_privilege('anon', 'aurora.vehicle_names', 'updated_at', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: anon holds SELECT on updated_at';
  END IF;
  IF NOT (has_column_privilege('anon', 'aurora.vehicle_names', 'script_name', 'SELECT')
          AND has_column_privilege('anon', 'aurora.vehicle_names', 'display_name', 'SELECT')) THEN
    RAISE EXCEPTION 'FAIL: anon lacks SELECT on the two public columns';
  END IF;
  IF NOT (has_table_privilege('service_role', 'aurora.vehicle_names', 'INSERT')
          AND has_table_privilege('service_role', 'aurora.vehicle_names', 'UPDATE')) THEN
    RAISE EXCEPTION 'FAIL: service_role cannot write aurora.vehicle_names';
  END IF;
  IF has_table_privilege('anon', 'aurora.vehicle_names_visible', 'INSERT')
     OR has_table_privilege('anon', 'aurora.vehicle_names_visible', 'UPDATE')
     OR has_table_privilege('anon', 'aurora.vehicle_names_visible', 'DELETE') THEN
    RAISE EXCEPTION 'FAIL: anon holds a write privilege on the view';
  END IF;
  RAISE NOTICE 'PASS RLS on, view security_invoker, no client write, updated_at ungranted, service_role writes';
END $$;

-- The home summary shows no vehicle name, so 031 must not have touched it.
DO $$
BEGIN
  IF pg_get_functiondef('aurora.home_summary_tz(text,text)'::regprocedure) ILIKE '%vehicle_names%' THEN
    RAISE EXCEPTION 'FAIL: home_summary_tz reads vehicle_names; 031 was meant to leave it alone';
  END IF;
  RAISE NOTICE 'PASS the home summary does not read vehicle_names';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL VEHICLE NAME TESTS PASSED'; END $$;

ROLLBACK;
