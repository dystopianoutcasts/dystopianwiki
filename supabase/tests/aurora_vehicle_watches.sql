-- Tests for migration 038: "Watch for a car" (aurora.vehicle_watches, the account's
-- own watch list; aurora.vehicle_scripts and its public view
-- aurora.vehicle_scripts_visible, the server's script list).
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It asserts and ROLLS
-- BACK. It prints "PASS ..." notices ending in "ALL VEHICLE WATCH TESTS PASSED", or
-- stops at the first failure.
--
-- The client calls are written the way PostgREST sends them (schema aurora, role
-- authenticated, the JWT's claims in request.jwt.claims):
--   read:   GET    vehicle_watches?select=script_name&server_id=eq.<server>
--   add:    POST   vehicle_watches?on_conflict=user_id,server_id,script_name
--                  Prefer: resolution=ignore-duplicates, body [{server_id, script_name}, ...]
--           -> INSERT INTO aurora.vehicle_watches (server_id, script_name)
--              SELECT ... FROM json_to_recordset(<body>)
--              ON CONFLICT (user_id, server_id, script_name) DO NOTHING
--   remove: DELETE vehicle_watches?server_id=eq.<server>&script_name=in.(...)
--
-- "Running 038 twice is fine" cannot be asserted from inside this file; the run
-- script applies the migration twice before running it.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES (as postgres)
-- ============================================================================
-- A and B are ordinary accounts, C is an Aurora admin.

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-0000000000a1',
   'authenticated', 'authenticated', 'watch-a@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{"username":"t71_watch_a"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-0000000000b2',
   'authenticated', 'authenticated', 'watch-b@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{"username":"t71_watch_b"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-0000000000c3',
   'authenticated', 'authenticated', 'watch-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{"username":"t71_watch_admin"}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen) VALUES
  ('test-watch',  'Watch Test Server', NOW()),
  ('test-watch2', 'Watch Limit Server', NOW()),
  ('test-scr',    'Script Server',     NOW()),
  ('test-scr2',   'Script Server 2',   NOW());

-- ============================================================================
-- 1. ACCOUNT A ADDS AND READS ITS WATCHES (the PostgREST calls)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000a1","role":"authenticated"}', TRUE);

-- add: POST vehicle_watches?on_conflict=user_id,server_id,script_name, ignore-duplicates
INSERT INTO aurora.vehicle_watches (server_id, script_name)
SELECT pgrst_body.server_id, pgrst_body.script_name
  FROM (SELECT '[{"server_id":"test-watch","script_name":"Base.CarTaxi"},
                 {"server_id":"test-watch","script_name":"Base.76chevyK20"},
                 {"server_id":"test-watch","script_name":"Base.MRAPMC"}]'::json AS json_data) pgrst_payload,
       LATERAL (SELECT * FROM json_to_recordset(pgrst_payload.json_data) AS _(server_id text, script_name text)) pgrst_body
ON CONFLICT (user_id, server_id, script_name) DO NOTHING;

DO $$
DECLARE
  got text;
BEGIN
  -- read: GET vehicle_watches?select=script_name&server_id=eq.test-watch
  SELECT string_agg(script_name, ',' ORDER BY script_name) INTO got
    FROM aurora.vehicle_watches WHERE server_id = 'test-watch';
  IF got IS DISTINCT FROM 'Base.76chevyK20,Base.CarTaxi,Base.MRAPMC' THEN
    RAISE EXCEPTION 'FAIL: A reads % instead of its three watches', got;
  END IF;
  RAISE NOTICE 'PASS PostgREST add (INSERT ... ON CONFLICT DO NOTHING, no user_id) and read as authenticated';
END $$;

-- The same add again (the client re-sends a watched car): ignored, no error.
INSERT INTO aurora.vehicle_watches (server_id, script_name)
SELECT pgrst_body.server_id, pgrst_body.script_name
  FROM (SELECT '[{"server_id":"test-watch","script_name":"Base.CarTaxi"},
                 {"server_id":"test-watch","script_name":"Base.CarNormal"}]'::json AS json_data) pgrst_payload,
       LATERAL (SELECT * FROM json_to_recordset(pgrst_payload.json_data) AS _(server_id text, script_name text)) pgrst_body
ON CONFLICT (user_id, server_id, script_name) DO NOTHING;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.vehicle_watches WHERE server_id = 'test-watch') <> 4 THEN
    RAISE EXCEPTION 'FAIL: the duplicate add did not leave exactly 4 rows';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicle_watches
              WHERE user_id IS DISTINCT FROM 'eeeeeeee-0000-4000-8000-0000000000a1') THEN
    RAISE EXCEPTION 'FAIL: user_id was not filled with auth.uid()';
  END IF;
  RAISE NOTICE 'PASS user_id comes from the DEFAULT auth.uid(); a re-add is ignored, a new one added';
END $$;

-- ============================================================================
-- 2. ACCOUNT B: ITS OWN ROWS ONLY
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000b2","role":"authenticated"}', TRUE);

INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch', 'Base.CarTaxi')
ON CONFLICT (user_id, server_id, script_name) DO NOTHING;

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.vehicle_watches;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: B sees % rows, expected only its own 1', n; END IF;
  IF EXISTS (SELECT 1 FROM aurora.vehicle_watches WHERE user_id = 'eeeeeeee-0000-4000-8000-0000000000a1') THEN
    RAISE EXCEPTION 'FAIL: B reads A''s watches';
  END IF;
  RAISE NOTICE 'PASS B reads only its own row (A watches the same car; B does not see A)';

  -- B tries to delete A's rows: the delete policy hides them, nothing is removed.
  DELETE FROM aurora.vehicle_watches
   WHERE user_id = 'eeeeeeee-0000-4000-8000-0000000000a1';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: B deleted % of A''s rows', n; END IF;
  DELETE FROM aurora.vehicle_watches
   WHERE server_id = 'test-watch' AND script_name = ANY (ARRAY['Base.76chevyK20', 'Base.MRAPMC']);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: B''s DELETE by script removed % rows it does not own', n; END IF;
  RAISE NOTICE 'PASS B cannot delete A''s rows';

  -- B names a user_id (A's, or its own): no INSERT grant on that column.
  BEGIN
    INSERT INTO aurora.vehicle_watches (user_id, server_id, script_name)
    VALUES ('eeeeeeee-0000-4000-8000-0000000000a1', 'test-watch', 'Base.Hacked');
    RAISE EXCEPTION 'FAIL: B inserted a row naming A''s user_id';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_watches (user_id, server_id, script_name)
    VALUES ('eeeeeeee-0000-4000-8000-0000000000b2', 'test-watch', 'Base.Own');
    RAISE EXCEPTION 'FAIL: an insert naming user_id (even its own) was accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS an insert that names user_id is refused (column grant)';

  BEGIN
    UPDATE aurora.vehicle_watches SET script_name = 'Base.Changed' WHERE script_name = 'Base.CarTaxi';
    RAISE EXCEPTION 'FAIL: authenticated updated a watch';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS no UPDATE for authenticated';
END $$;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.vehicle_watches WHERE user_id = 'eeeeeeee-0000-4000-8000-0000000000a1') <> 4 THEN
    RAISE EXCEPTION 'FAIL: A''s rows did not survive B''s attempts';
  END IF;
  RAISE NOTICE 'PASS A''s four rows are intact after B''s attempts';
END $$;

-- The INSERT policy's WITH CHECK is the second line behind the column grant: give
-- authenticated the user_id column for a moment and B still cannot write A's row.
GRANT INSERT (user_id) ON aurora.vehicle_watches TO authenticated;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000b2","role":"authenticated"}', TRUE);
DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.vehicle_watches (user_id, server_id, script_name)
    VALUES ('eeeeeeee-0000-4000-8000-0000000000a1', 'test-watch', 'Base.Planted');
    RAISE EXCEPTION 'FAIL: the INSERT policy let B write a row for A';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS the INSERT policy (WITH CHECK user_id = auth.uid()) refuses a row for another account';
END $$;
RESET ROLE;
REVOKE INSERT (user_id) ON aurora.vehicle_watches FROM authenticated;

-- ============================================================================
-- 3. ANON HAS NOTHING
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  BEGIN
    PERFORM script_name FROM aurora.vehicle_watches WHERE server_id = 'test-watch';
    RAISE EXCEPTION 'FAIL: anon read vehicle_watches';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch', 'Base.CarTaxi')
    ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
    RAISE EXCEPTION 'FAIL: anon inserted a watch';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM aurora.vehicle_watches WHERE server_id = 'test-watch';
    RAISE EXCEPTION 'FAIL: anon deleted watches';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon cannot read, insert or delete watches';
END $$;

RESET ROLE;

-- ============================================================================
-- 4. THE 100-ROW LIMIT (per account and server)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000a1","role":"authenticated"}', TRUE);

-- 99 rows in one statement.
INSERT INTO aurora.vehicle_watches (server_id, script_name)
SELECT 'test-watch2', 'Mod.Car' || lpad(g::text, 3, '0') FROM generate_series(1, 99) g
ON CONFLICT (user_id, server_id, script_name) DO NOTHING;

DO $$
DECLARE
  n int;
  st text;
  msg text;
BEGIN
  SELECT count(*) INTO n FROM aurora.vehicle_watches WHERE server_id = 'test-watch2';
  IF n <> 99 THEN RAISE EXCEPTION 'FAIL: expected 99 rows, have %', n; END IF;

  -- A two-row insert that would make 101: raises, inserts neither.
  BEGIN
    INSERT INTO aurora.vehicle_watches (server_id, script_name)
    VALUES ('test-watch2', 'Mod.Car100'), ('test-watch2', 'Mod.Car101')
    ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
    RAISE EXCEPTION 'FAIL: a multi-row insert crossed 100';
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
    IF st <> '23514' OR msg <> 'vehicle_watches_limit' THEN
      RAISE EXCEPTION 'FAIL: limit raised % "%" instead of 23514 vehicle_watches_limit', st, msg;
    END IF;
  END;
  SELECT count(*) INTO n FROM aurora.vehicle_watches WHERE server_id = 'test-watch2';
  IF n <> 99 THEN RAISE EXCEPTION 'FAIL: the refused multi-row insert left % rows (expected 99)', n; END IF;
  RAISE NOTICE 'PASS a multi-row insert that would cross 100 raises 23514 vehicle_watches_limit and inserts none';

  -- The 100th row is allowed.
  INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch2', 'Mod.Car100')
  ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
  SELECT count(*) INTO n FROM aurora.vehicle_watches WHERE server_id = 'test-watch2';
  IF n <> 100 THEN RAISE EXCEPTION 'FAIL: the 100th row was not added (% rows)', n; END IF;
  RAISE NOTICE 'PASS the 100th watch is allowed';

  -- The 101st single row is refused.
  BEGIN
    INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch2', 'Mod.Car101')
    ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
    RAISE EXCEPTION 'FAIL: a 101st watch was accepted';
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
    IF st <> '23514' OR msg <> 'vehicle_watches_limit' THEN
      RAISE EXCEPTION 'FAIL: limit raised % "%" instead of 23514 vehicle_watches_limit', st, msg;
    END IF;
  END;
  RAISE NOTICE 'PASS a single 101st row raises 23514 vehicle_watches_limit';

  -- Re-adding watched scripts at exactly 100 (one row, then several): no error.
  INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch2', 'Mod.Car050')
  ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
  INSERT INTO aurora.vehicle_watches (server_id, script_name)
  VALUES ('test-watch2', 'Mod.Car001'), ('test-watch2', 'Mod.Car100'), ('test-watch2', 'Mod.Car001')
  ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
  SELECT count(*) INTO n FROM aurora.vehicle_watches WHERE server_id = 'test-watch2';
  IF n <> 100 THEN RAISE EXCEPTION 'FAIL: re-adds at 100 changed the count to %', n; END IF;
  RAISE NOTICE 'PASS re-adding watched scripts at exactly 100 (single and multi-row, ignore-duplicates) does not raise';

  -- A batch mixing re-adds and one new script at 100: refused as a whole.
  BEGIN
    INSERT INTO aurora.vehicle_watches (server_id, script_name)
    VALUES ('test-watch2', 'Mod.Car002'), ('test-watch2', 'Mod.CarNew')
    ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
    RAISE EXCEPTION 'FAIL: a new script slipped in beside a re-add at 100';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS a batch of re-adds plus one new script at 100 is refused';

  -- The limit is per server: A still adds on another server.
  INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch', 'Base.PickUpTruck')
  ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicle_watches WHERE server_id = 'test-watch' AND script_name = 'Base.PickUpTruck') THEN
    RAISE EXCEPTION 'FAIL: 100 rows on one server blocked another server';
  END IF;
  RAISE NOTICE 'PASS the limit counts per (account, server)';
END $$;

RESET ROLE;

-- Per account: B at 0 rows on test-watch2 adds freely although A holds 100 there.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000b2","role":"authenticated"}', TRUE);
INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch2', 'Mod.CarNew')
ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicle_watches WHERE server_id = 'test-watch2' AND script_name = 'Mod.CarNew') THEN
    RAISE EXCEPTION 'FAIL: A''s 100 rows blocked B';
  END IF;
  RAISE NOTICE 'PASS the limit counts per account (B adds where A is full)';
END $$;
RESET ROLE;

-- ============================================================================
-- 5. DELETE (the PostgREST remove call)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000a1","role":"authenticated"}', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  -- remove: DELETE vehicle_watches?server_id=eq.test-watch&script_name=in.(Base.76chevyK20,Base.MRAPMC)
  DELETE FROM aurora.vehicle_watches
   WHERE server_id = 'test-watch' AND script_name = ANY (ARRAY['Base.76chevyK20', 'Base.MRAPMC']);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 2 THEN RAISE EXCEPTION 'FAIL: A''s delete removed % rows, expected 2', n; END IF;
  IF (SELECT string_agg(script_name, ',' ORDER BY script_name) FROM aurora.vehicle_watches WHERE server_id = 'test-watch')
     IS DISTINCT FROM 'Base.CarNormal,Base.CarTaxi,Base.PickUpTruck' THEN
    RAISE EXCEPTION 'FAIL: A''s list after the delete is wrong';
  END IF;
  RAISE NOTICE 'PASS PostgREST remove (DELETE ... server_id = and script_name in (...)) as authenticated';

  -- After freeing a slot on the full server, a new watch fits again.
  DELETE FROM aurora.vehicle_watches WHERE server_id = 'test-watch2' AND script_name = 'Mod.Car001';
  INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch2', 'Mod.Car101')
  ON CONFLICT (user_id, server_id, script_name) DO NOTHING;
  IF (SELECT count(*) FROM aurora.vehicle_watches WHERE server_id = 'test-watch2') <> 100 THEN
    RAISE EXCEPTION 'FAIL: delete one, add one at the limit did not land on 100';
  END IF;
  RAISE NOTICE 'PASS deleting a watch frees its slot under the limit';
END $$;

RESET ROLE;

-- B's own row is still there (A's delete touched only A's rows).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM aurora.vehicle_watches
                  WHERE user_id = 'eeeeeeee-0000-4000-8000-0000000000b2' AND script_name = 'Base.CarTaxi') THEN
    RAISE EXCEPTION 'FAIL: A''s delete removed B''s row';
  END IF;
  RAISE NOTICE 'PASS A''s delete left B''s rows alone';
END $$;

-- ============================================================================
-- 6. AN ADMIN SEES ONLY ITS OWN LIST
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000c3","role":"authenticated"}', TRUE);

INSERT INTO aurora.vehicle_watches (server_id, script_name) VALUES ('test-watch', 'Base.Van')
ON CONFLICT (user_id, server_id, script_name) DO NOTHING;

DO $$
DECLARE
  n int;
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'FAIL (fixture): account C is not an Aurora admin';
  END IF;
  SELECT count(*) INTO n FROM aurora.vehicle_watches;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: the admin sees % rows, expected only its own 1', n; END IF;
  DELETE FROM aurora.vehicle_watches WHERE server_id IN ('test-watch', 'test-watch2') AND script_name <> 'Base.Van';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: the admin deleted % rows of other accounts', n; END IF;
  RAISE NOTICE 'PASS an Aurora admin reads and deletes only its own watches';

  -- A DELETE with no WHERE reads no column, so only the DELETE policy filters it
  -- (a WHERE clause would also bring in the SELECT policy). It removes the
  -- admin's own row and nothing else.
  DELETE FROM aurora.vehicle_watches;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: an unfiltered DELETE removed % rows, expected only the caller''s 1', n; END IF;
  RAISE NOTICE 'PASS an unfiltered DELETE removes only the caller''s own rows (the DELETE policy alone)';
END $$;

RESET ROLE;

-- ============================================================================
-- 7. DELETING THE ACCOUNT REMOVES ITS WATCHES
-- ============================================================================

DELETE FROM auth.users WHERE id = 'eeeeeeee-0000-4000-8000-0000000000b2';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM aurora.vehicle_watches WHERE user_id = 'eeeeeeee-0000-4000-8000-0000000000b2') THEN
    RAISE EXCEPTION 'FAIL: B''s watches outlived B''s account';
  END IF;
  IF (SELECT count(*) FROM aurora.vehicle_watches WHERE user_id = 'eeeeeeee-0000-4000-8000-0000000000a1') <> 103 THEN
    RAISE EXCEPTION 'FAIL: deleting B touched A''s rows';
  END IF;
  RAISE NOTICE 'PASS deleting the auth user removes its watches (ON DELETE CASCADE), and only its own';
END $$;

-- ============================================================================
-- 8. THE SCRIPT LIST AND ITS PUBLIC VIEW
-- ============================================================================
-- What the ingest sends: one upsert per batch, merge-duplicates on (server_id, script_name).
-- test-scr: an old pass at 10:00 (Base.A, Base.B, Mod.Gone), then a new pass whose
-- records carry 12:00 (Base.A, Base.B, Mod.New) plus a stray record of the same pass a
-- few minutes earlier (Base.C, 11:55). test-scr2 has only one pass, at 08:00.

SET LOCAL ROLE service_role;

INSERT INTO aurora.vehicle_scripts (server_id, script_name, seen_at) VALUES
  ('test-scr',  'Base.A',   TIMESTAMPTZ '2026-10-03 10:00:00+00'),
  ('test-scr',  'Base.B',   TIMESTAMPTZ '2026-10-03 10:00:00+00'),
  ('test-scr',  'Mod.Gone', TIMESTAMPTZ '2026-10-03 10:00:00+00'),
  ('test-scr2', 'Base.A',   TIMESTAMPTZ '2026-10-03 08:00:00+00'),
  ('test-scr2', 'Mod.Only2', TIMESTAMPTZ '2026-10-03 08:00:00+00')
ON CONFLICT (server_id, script_name) DO UPDATE
  SET server_id = EXCLUDED.server_id, script_name = EXCLUDED.script_name, seen_at = EXCLUDED.seen_at;

INSERT INTO aurora.vehicle_scripts (server_id, script_name, seen_at) VALUES
  ('test-scr', 'Base.A',   TIMESTAMPTZ '2026-10-03 12:00:00+00'),
  ('test-scr', 'Base.B',   TIMESTAMPTZ '2026-10-03 12:00:00+00'),
  ('test-scr', 'Mod.New',  TIMESTAMPTZ '2026-10-03 12:00:00+00'),
  ('test-scr', 'Base.C',   TIMESTAMPTZ '2026-10-03 11:55:00+00')
ON CONFLICT (server_id, script_name) DO UPDATE
  SET server_id = EXCLUDED.server_id, script_name = EXCLUDED.script_name, seen_at = EXCLUDED.seen_at;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT seen_at FROM aurora.vehicle_scripts WHERE server_id = 'test-scr' AND script_name = 'Base.A')
     <> TIMESTAMPTZ '2026-10-03 12:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: the merge upsert did not move seen_at forward';
  END IF;
  IF (SELECT seen_at FROM aurora.vehicle_scripts WHERE server_id = 'test-scr' AND script_name = 'Mod.Gone')
     <> TIMESTAMPTZ '2026-10-03 10:00:00+00' THEN
    RAISE EXCEPTION 'FAIL: a script missing from the new pass lost its old seen_at';
  END IF;
  RAISE NOTICE 'PASS the ingest upsert moves seen_at forward and leaves a removed script at its old seen_at';
END $$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  got text;
BEGIN
  SELECT string_agg(script_name, ',' ORDER BY script_name) INTO got
    FROM aurora.vehicle_scripts_visible WHERE server_id = 'test-scr';
  IF got IS DISTINCT FROM 'Base.A,Base.B,Base.C,Mod.New' THEN
    RAISE EXCEPTION 'FAIL: anon reads "%" for test-scr, expected the newest pass only (Base.A,Base.B,Base.C,Mod.New)', got;
  END IF;
  RAISE NOTICE 'PASS vehicle_scripts_visible returns the newest pass only (Mod.Gone, old pass only, is absent) and anon reads it';

  SELECT string_agg(script_name, ',' ORDER BY script_name) INTO got
    FROM aurora.vehicle_scripts_visible WHERE server_id = 'test-scr2';
  IF got IS DISTINCT FROM 'Base.A,Mod.Only2' THEN
    RAISE EXCEPTION 'FAIL: test-scr2 reads "%"; each server''s newest pass is its own', got;
  END IF;
  RAISE NOTICE 'PASS the newest pass is judged per server';

  IF (SELECT string_agg(column_name, ',' ORDER BY ordinal_position)
        FROM information_schema.columns
       WHERE table_schema = 'aurora' AND table_name = 'vehicle_scripts_visible') IS DISTINCT FROM 'server_id,script_name' THEN
    RAISE EXCEPTION 'FAIL: the view columns are not exactly server_id, script_name';
  END IF;
  RAISE NOTICE 'PASS the view has exactly server_id and script_name';

  BEGIN
    INSERT INTO aurora.vehicle_scripts (server_id, script_name, seen_at) VALUES ('test-scr', 'Mod.Hack', now());
    RAISE EXCEPTION 'FAIL: anon inserted a script';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE aurora.vehicle_scripts SET seen_at = now() WHERE server_id = 'test-scr';
    RAISE EXCEPTION 'FAIL: anon updated a script';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM aurora.vehicle_scripts WHERE server_id = 'test-scr';
    RAISE EXCEPTION 'FAIL: anon deleted a script';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_scripts_visible (server_id, script_name) VALUES ('test-scr', 'Mod.Hack');
    RAISE EXCEPTION 'FAIL: anon inserted through the view';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS anon cannot write vehicle_scripts or its view';
END $$;

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-0000000000a1","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.vehicle_scripts_visible WHERE server_id = 'test-scr') <> 4 THEN
    RAISE EXCEPTION 'FAIL: a signed-in user does not read the newest pass';
  END IF;
  BEGIN
    INSERT INTO aurora.vehicle_scripts (server_id, script_name, seen_at) VALUES ('test-scr', 'Mod.Hack', now());
    RAISE EXCEPTION 'FAIL: authenticated inserted a script';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE aurora.vehicle_scripts SET seen_at = now() WHERE server_id = 'test-scr';
    RAISE EXCEPTION 'FAIL: authenticated updated a script';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM aurora.vehicle_scripts WHERE server_id = 'test-scr';
    RAISE EXCEPTION 'FAIL: authenticated deleted a script';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a signed-in user reads the script list but cannot write it';
END $$;

RESET ROLE;

-- ============================================================================
-- 9. CONSTRAINTS, GRANTS AND SHAPE
-- ============================================================================

DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.vehicle_scripts (server_id, script_name, seen_at) VALUES ('test-scr', '', now());
    RAISE EXCEPTION 'FAIL: an empty script name was accepted (vehicle_scripts)';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_scripts (server_id, script_name, seen_at) VALUES ('test-scr', repeat('x', 121), now());
    RAISE EXCEPTION 'FAIL: a 121-character script name was accepted (vehicle_scripts)';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_watches (user_id, server_id, script_name)
    VALUES ('eeeeeeee-0000-4000-8000-0000000000a1', 'test-watch', '');
    RAISE EXCEPTION 'FAIL: an empty script name was accepted (vehicle_watches)';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_watches (user_id, server_id, script_name)
    VALUES ('eeeeeeee-0000-4000-8000-0000000000a1', 'test-watch', repeat('x', 121));
    RAISE EXCEPTION 'FAIL: a 121-character script name was accepted (vehicle_watches)';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO aurora.vehicle_watches (user_id, server_id, script_name)
    VALUES ('eeeeeeee-0000-4000-8000-0000000000a1', 'no-such-server', 'Base.CarTaxi');
    RAISE EXCEPTION 'FAIL: a watch on an unknown server was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS empty and over-long script names, and unknown servers, are refused';

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'aurora.vehicle_watches'::regclass)
     OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'aurora.vehicle_scripts'::regclass) THEN
    RAISE EXCEPTION 'FAIL: RLS is off on a 038 table';
  END IF;
  IF NOT COALESCE((SELECT reloptions @> ARRAY['security_invoker=true'] FROM pg_class WHERE oid = 'aurora.vehicle_scripts_visible'::regclass), FALSE) THEN
    RAISE EXCEPTION 'FAIL: vehicle_scripts_visible must be security_invoker';
  END IF;

  IF has_table_privilege('anon', 'aurora.vehicle_watches', 'SELECT')
     OR has_table_privilege('anon', 'aurora.vehicle_watches', 'INSERT')
     OR has_table_privilege('anon', 'aurora.vehicle_watches', 'UPDATE')
     OR has_table_privilege('anon', 'aurora.vehicle_watches', 'DELETE')
     OR has_any_column_privilege('anon', 'aurora.vehicle_watches', 'SELECT')
     OR has_any_column_privilege('anon', 'aurora.vehicle_watches', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: anon holds a privilege on vehicle_watches';
  END IF;
  IF NOT has_table_privilege('authenticated', 'aurora.vehicle_watches', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'aurora.vehicle_watches', 'DELETE')
     OR has_table_privilege('authenticated', 'aurora.vehicle_watches', 'UPDATE')
     OR has_any_column_privilege('authenticated', 'aurora.vehicle_watches', 'UPDATE')
     OR has_table_privilege('authenticated', 'aurora.vehicle_watches', 'INSERT')
     OR has_column_privilege('authenticated', 'aurora.vehicle_watches', 'user_id', 'INSERT')
     OR has_column_privilege('authenticated', 'aurora.vehicle_watches', 'created_at', 'INSERT')
     OR NOT has_column_privilege('authenticated', 'aurora.vehicle_watches', 'server_id', 'INSERT')
     OR NOT has_column_privilege('authenticated', 'aurora.vehicle_watches', 'script_name', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: authenticated grants on vehicle_watches are not SELECT, INSERT (server_id, script_name), DELETE';
  END IF;
  IF NOT (has_table_privilege('service_role', 'aurora.vehicle_watches', 'INSERT')
          AND has_table_privilege('service_role', 'aurora.vehicle_watches', 'DELETE')
          AND has_table_privilege('service_role', 'aurora.vehicle_scripts', 'INSERT')
          AND has_table_privilege('service_role', 'aurora.vehicle_scripts', 'UPDATE')) THEN
    RAISE EXCEPTION 'FAIL: service_role cannot write a 038 table';
  END IF;
  IF has_table_privilege('anon', 'aurora.vehicle_scripts', 'INSERT')
     OR has_table_privilege('anon', 'aurora.vehicle_scripts', 'UPDATE')
     OR has_table_privilege('anon', 'aurora.vehicle_scripts', 'DELETE')
     OR has_table_privilege('authenticated', 'aurora.vehicle_scripts', 'INSERT')
     OR has_table_privilege('authenticated', 'aurora.vehicle_scripts', 'UPDATE')
     OR has_table_privilege('authenticated', 'aurora.vehicle_scripts', 'DELETE') THEN
    RAISE EXCEPTION 'FAIL: a client role holds a write privilege on vehicle_scripts';
  END IF;
  IF has_function_privilege('authenticated', 'aurora.vehicle_watches_limit()', 'EXECUTE')
     OR has_function_privilege('anon', 'aurora.vehicle_watches_limit()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: a client role may call the trigger function';
  END IF;
  RAISE NOTICE 'PASS RLS on, view security_invoker, client grants exactly as the contract, service_role writes';

  -- The three policies, by command and expression.
  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'aurora' AND tablename = 'vehicle_watches') <> 3
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'aurora' AND tablename = 'vehicle_watches'
                     AND cmd = 'SELECT' AND qual = '(user_id = auth.uid())' AND roles = '{authenticated}')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'aurora' AND tablename = 'vehicle_watches'
                     AND cmd = 'INSERT' AND with_check = '(user_id = auth.uid())' AND roles = '{authenticated}')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'aurora' AND tablename = 'vehicle_watches'
                     AND cmd = 'DELETE' AND qual = '(user_id = auth.uid())' AND roles = '{authenticated}') THEN
    RAISE EXCEPTION 'FAIL: vehicle_watches does not have exactly the select, insert (WITH CHECK) and delete own-row policies';
  END IF;
  RAISE NOTICE 'PASS vehicle_watches has exactly three own-row policies (select, insert WITH CHECK, delete), all TO authenticated';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL VEHICLE WATCH TESTS PASSED'; END $$;

ROLLBACK;
