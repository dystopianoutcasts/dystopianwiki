-- OutcastAurora policy tests (T07 step 3)
-- Created: 2026-09-28
--
-- Run the whole file as `postgres`: the SQL editor in the dashboard, or
--   psql "<connection string>" -f supabase/tests/aurora_policies.sql
--
-- It seeds fixtures, asserts, and ROLLS BACK. Nothing is left behind.
-- Every assertion RAISEs on failure, so the script either prints a run of
-- "PASS ..." notices and then "ALL AURORA POLICY TESTS PASSED", or it stops at
-- the first failure and the transaction unwinds. There is no partial success.
--
-- Fixture world (server 'test-aurora'):
--   alice  - linked to the regular test user, shares safehouse SH1 with bob
--   bob    - unlinked, shares safehouse SH1 with alice
--   carol  - unlinked, no safehouse in common with anyone
-- History holds a 90-minute-old row for each, so the delayed feed has something
-- to return under the default delayMinutes of 30, plus one 5-minute-old row for
-- carol that must NOT be returned - that row is what makes delayMinutes
-- load-bearing rather than decorative.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES
-- ============================================================================

-- raw_user_meta_data MUST carry a distinct `username`: the on_auth_user_created
-- trigger copies it into public.user_profiles.username, which is NOT NULL and
-- carries a unique index on lower(username). An empty metadata object makes the
-- trigger insert NULL and the fixture dies on a not-null violation.
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000',
   'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'aurora-test-user@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb,
   '{"username":"aurora_test_user","display_name":"Aurora Test User"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000',
   'bbbbbbbb-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'aurora-test-admin@example.invalid', '', NOW(), NOW(), NOW(), '{}'::jsonb,
   '{"username":"aurora_test_admin","display_name":"Aurora Test Admin"}'::jsonb);

-- The trigger above already created both profiles; this is a belt-and-braces
-- fallback that supplies username explicitly for the same reason.
INSERT INTO public.user_profiles (id, username, display_name)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', 'aurora_test_user',  'Aurora Test User'),
       ('bbbbbbbb-0000-4000-8000-000000000002', 'aurora_test_admin', 'Aurora Test Admin')
ON CONFLICT (id) DO NOTHING;

UPDATE public.user_profiles
   SET is_aurora_admin = TRUE
 WHERE id = 'bbbbbbbb-0000-4000-8000-000000000002';

INSERT INTO aurora.servers (id, name, last_seen, game_version)
VALUES ('test-aurora', 'Policy Test Server', NOW(), '42.15.0');

INSERT INTO aurora.players
  (server_id, username, display_name, last_seen, online, access_level, is_dead,
   last_saved_x, last_saved_y, linked_user_id)
VALUES
  ('test-aurora', 'alice', 'Alice', NOW(), TRUE, 'none', FALSE, 100, 100,
   'aaaaaaaa-0000-4000-8000-000000000001'),
  ('test-aurora', 'bob',   'Bob',   NOW(), TRUE, 'none', FALSE, 200, 200, NULL),
  ('test-aurora', 'carol', 'Carol', NOW(), TRUE, 'none', FALSE, 1234, 5678, NULL);

INSERT INTO aurora.player_positions (server_id, username, x, y, z, t)
VALUES
  ('test-aurora', 'alice',  100.0,  100.0, 0, NOW()),
  ('test-aurora', 'bob',    200.0,  200.0, 0, NOW()),
  ('test-aurora', 'carol', 1234.0, 5678.0, 0, NOW());

INSERT INTO aurora.player_position_history (server_id, username, x, y, z, t)
VALUES
  ('test-aurora', 'alice',  100.0,  100.0, 0, NOW() - INTERVAL '90 minutes'),
  ('test-aurora', 'bob',    200.0,  200.0, 0, NOW() - INTERVAL '90 minutes'),
  ('test-aurora', 'carol', 1000.0, 2000.0, 0, NOW() - INTERVAL '90 minutes'),
  -- Inside the 30 minute window, so it must NOT be the row the view returns.
  -- This is the only fixture row that makes delayMinutes load-bearing.
  ('test-aurora', 'carol', 5000.0, 6000.0, 0, NOW() - INTERVAL '5 minutes');

INSERT INTO aurora.safehouses (server_id, id, x, y, w, h, owner, title, players)
VALUES ('test-aurora', 'SH1', 90, 90, 20, 20, 'alice', 'Alice and Bob',
        ARRAY['alice', 'bob']);

-- ============================================================================
-- 1. ANONYMOUS
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  v_count   BIGINT;
  v_blocked BOOLEAN;
BEGIN
  -- player_positions: the grant exists so the security-invoker view resolves,
  -- but with no policy for anon the table yields nothing.
  SELECT count(*) INTO v_count FROM aurora.player_positions;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon read % rows from aurora.player_positions, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS anon reads zero rows from aurora.player_positions';

  -- player_position_history: not granted to anon at all.
  v_blocked := FALSE;
  BEGIN
    PERFORM 1 FROM aurora.player_position_history LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN
    v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: anon was allowed to query aurora.player_position_history';
  END IF;
  RAISE NOTICE 'PASS anon is denied aurora.player_position_history outright';

  -- vehicles: not granted to anon at all.
  v_blocked := FALSE;
  BEGIN
    PERFORM 1 FROM aurora.vehicles LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN
    v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: anon was allowed to query aurora.vehicles';
  END IF;
  RAISE NOTICE 'PASS anon is denied aurora.vehicles outright';

  -- players.linked_user_id is withheld by column grant.
  v_blocked := FALSE;
  BEGIN
    PERFORM p.linked_user_id FROM aurora.players p LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN
    v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: anon was allowed to read aurora.players.linked_user_id';
  END IF;
  RAISE NOTICE 'PASS anon is denied the aurora.players.linked_user_id column';

  -- last_saved_x is withheld too (deliberate departure from the task text).
  v_blocked := FALSE;
  BEGIN
    PERFORM p.last_saved_x FROM aurora.players p LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN
    v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: anon was allowed to read aurora.players.last_saved_x';
  END IF;
  RAISE NOTICE 'PASS anon is denied the aurora.players.last_saved_x column';

  -- The public roster still works.
  SELECT count(*) INTO v_count FROM aurora.players_public WHERE server_id = 'test-aurora';
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'FAIL: anon saw % rows in aurora.players_public, expected 3', v_count;
  END IF;
  RAISE NOTICE 'PASS anon reads the aurora.players_public roster';

  -- The visibility view is empty for anon while anonPositions is false.
  SELECT count(*) INTO v_count FROM aurora.player_positions_visible;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon saw % rows in player_positions_visible, expected 0 (anonPositions=false)', v_count;
  END IF;
  RAISE NOTICE 'PASS anon sees zero rows in aurora.player_positions_visible';

  -- settings: the visibility key is readable, nothing else would be.
  SELECT count(*) INTO v_count FROM aurora.settings WHERE key = 'visibility';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL: anon could not read the visibility settings row';
  END IF;
  RAISE NOTICE 'PASS anon reads aurora.settings visibility';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 2. LINKED USER (non-admin)
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count   BIGINT;
  v_x       REAL;
  v_delayed BOOLEAN;
  v_blocked BOOLEAN;
BEGIN
  IF aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'FAIL: the regular test user is reported as an aurora admin';
  END IF;
  RAISE NOTICE 'PASS regular user is not an aurora admin';

  -- Own character, live and exact.
  SELECT v.x, v.is_delayed INTO v_x, v_delayed
    FROM aurora.player_positions_visible v
   WHERE v.username = 'alice';
  IF v_x IS DISTINCT FROM 100.0::REAL OR v_delayed IS NOT FALSE THEN
    RAISE EXCEPTION 'FAIL: alice should be live at x=100 for her own user, got x=% delayed=%', v_x, v_delayed;
  END IF;
  RAISE NOTICE 'PASS linked user sees own character live and exact';

  -- Safehouse peer, live and exact.
  SELECT v.x, v.is_delayed INTO v_x, v_delayed
    FROM aurora.player_positions_visible v
   WHERE v.username = 'bob';
  IF v_x IS DISTINCT FROM 200.0::REAL OR v_delayed IS NOT FALSE THEN
    RAISE EXCEPTION 'FAIL: bob shares safehouse SH1 and should be live at x=200, got x=% delayed=%', v_x, v_delayed;
  END IF;
  RAISE NOTICE 'PASS linked user sees a safehouse peer live and exact';

  -- Stranger: delayed, rounded to cell. carol history x=1000 -> cell centre 896.
  SELECT v.x, v.is_delayed INTO v_x, v_delayed
    FROM aurora.player_positions_visible v
   WHERE v.username = 'carol';
  IF v_delayed IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: carol should arrive delayed, got delayed=%', v_delayed;
  END IF;
  IF v_x IS DISTINCT FROM 896.0::REAL THEN
    RAISE EXCEPTION 'FAIL: carol should be rounded to cell centre 896, got %', v_x;
  END IF;
  RAISE NOTICE 'PASS a stranger arrives delayed and rounded to the cell centre (896)';

  -- The delay window itself. carol has a 5-minute-old history row at x=5000
  -- (cell centre 4992). With delayMinutes=30 it is too recent to be shown, so
  -- the 90-minute-old row must win. If the delay were ignored, the fresher row
  -- would surface instead -- which is the leak the whole design exists to stop.
  IF v_x IS NOT DISTINCT FROM 4992.0::REAL THEN
    RAISE EXCEPTION 'FAIL: the delay window was ignored - carol''s 5-minute-old position leaked';
  END IF;
  RAISE NOTICE 'PASS a position newer than delayMinutes is withheld';

  -- Exactly one row per character, no duplicate between the two halves.
  SELECT count(*) INTO v_count FROM aurora.player_positions_visible;
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'FAIL: expected 3 rows in the view for the linked user, got %', v_count;
  END IF;
  RAISE NOTICE 'PASS the view returns one row per character (3)';

  -- The live table itself leaks nothing beyond alice and bob.
  SELECT count(*) INTO v_count FROM aurora.player_positions;
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: linked user read % rows from aurora.player_positions, expected 2', v_count;
  END IF;
  RAISE NOTICE 'PASS linked user reads only own and safehouse rows from aurora.player_positions';

  -- History is admin-only, so a non-admin sees zero rows despite the grant.
  SELECT count(*) INTO v_count FROM aurora.player_position_history;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: non-admin read % history rows, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS non-admin reads zero rows from aurora.player_position_history';

  -- linked_user_id stays hidden from authenticated as well.
  v_blocked := FALSE;
  BEGIN
    PERFORM p.linked_user_id FROM aurora.players p LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN
    v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: authenticated was allowed to read aurora.players.linked_user_id';
  END IF;
  RAISE NOTICE 'PASS authenticated is denied the aurora.players.linked_user_id column';

  -- A user may create a link code for themselves.
  INSERT INTO aurora.link_codes (user_id)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001');
  RAISE NOTICE 'PASS a user may create a link code for themselves';

  -- ... and not for anybody else.
  v_blocked := FALSE;
  BEGIN
    INSERT INTO aurora.link_codes (user_id)
    VALUES ('bbbbbbbb-0000-4000-8000-000000000002');
  EXCEPTION WHEN insufficient_privilege THEN
    v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: a user was allowed to create a link code for another account';
  END IF;
  RAISE NOTICE 'PASS a user may not create a link code for another account';

  -- ... and sees only their own.
  SELECT count(*) INTO v_count FROM aurora.link_codes;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL: user saw % link codes, expected 1', v_count;
  END IF;
  RAISE NOTICE 'PASS a user sees only their own link codes';

  -- consume_link_code is service-role only.
  v_blocked := FALSE;
  BEGIN
    PERFORM aurora.consume_link_code('ABCD1234', 'carol');
  EXCEPTION
    WHEN insufficient_privilege THEN v_blocked := TRUE;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: authenticated was allowed to execute aurora.consume_link_code';
  END IF;
  RAISE NOTICE 'PASS authenticated may not execute aurora.consume_link_code';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 3. ADMIN
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-4000-8000-000000000002","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count BIGINT;
  v_x     REAL;
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'FAIL: the admin test user is not reported as an aurora admin';
  END IF;
  RAISE NOTICE 'PASS admin flag is read from user_profiles.is_aurora_admin';

  SELECT count(*) INTO v_count FROM aurora.player_positions;
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'FAIL: admin read % rows from aurora.player_positions, expected 3', v_count;
  END IF;
  RAISE NOTICE 'PASS admin reads every row of aurora.player_positions';

  -- Every row live and exact, including carol.
  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible v
   WHERE v.is_delayed;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: admin got % delayed rows, expected 0', v_count;
  END IF;

  SELECT v.x INTO v_x
    FROM aurora.player_positions_visible v
   WHERE v.username = 'carol';
  IF v_x IS DISTINCT FROM 1234.0::REAL THEN
    RAISE EXCEPTION 'FAIL: admin should see carol exact at x=1234, got %', v_x;
  END IF;
  RAISE NOTICE 'PASS admin sees every character live, exact and un-rounded';

  SELECT count(*) INTO v_count FROM aurora.player_position_history;
  IF v_count <> 4 THEN
    RAISE EXCEPTION 'FAIL: admin read % history rows, expected 4', v_count;
  END IF;
  RAISE NOTICE 'PASS admin reads aurora.player_position_history';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 4. REALTIME PUBLICATION
-- ============================================================================

DO $$
DECLARE
  v_tables TEXT[];
BEGIN
  SELECT array_agg(c.relname ORDER BY c.relname) INTO v_tables
    FROM pg_publication_rel pr
    JOIN pg_publication  p ON p.oid = pr.prpubid
    JOIN pg_class        c ON c.oid = pr.prrelid
    JOIN pg_namespace    n ON n.oid = c.relnamespace
   WHERE p.pubname = 'supabase_realtime'
     AND n.nspname = 'aurora';

  IF v_tables IS DISTINCT FROM ARRAY['health_samples', 'player_positions', 'vehicles'] THEN
    RAISE EXCEPTION
      'FAIL: supabase_realtime publishes aurora tables %, expected exactly {health_samples,player_positions,vehicles}',
      COALESCE(v_tables::TEXT, 'none');
  END IF;
  RAISE NOTICE 'PASS supabase_realtime publishes exactly the three aurora tables';
END;
$$;

-- ============================================================================
-- 5. RLS IS ENABLED EVERYWHERE
-- ============================================================================

DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(c.relname, ', ' ORDER BY c.relname) INTO v_missing
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'aurora'
     AND c.relkind = 'r'
     AND NOT c.relrowsecurity;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: RLS is not enabled on aurora tables: %', v_missing;
  END IF;
  RAISE NOTICE 'PASS RLS is enabled on every aurora table';
END;
$$;

-- ============================================================================
-- 6. SERVICE ROLE CAN WRITE
-- ============================================================================

SET LOCAL ROLE service_role;

DO $$
BEGIN
  INSERT INTO aurora.player_positions (server_id, username, x, y, z, t)
  VALUES ('test-aurora', 'alice', 111.0, 111.0, 0, NOW())
  ON CONFLICT (server_id, username) DO UPDATE
    SET x = EXCLUDED.x, y = EXCLUDED.y, t = EXCLUDED.t;

  INSERT INTO aurora.ingest_cursor (server_id, file_name, byte_offset, file_size)
  VALUES ('test-aurora', 'chat.txt', 0, 0)
  ON CONFLICT (server_id) DO UPDATE SET byte_offset = EXCLUDED.byte_offset;

  RAISE NOTICE 'PASS service_role writes positions and the ingest cursor';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 7. HEALTH SAMPLE TICK COLUMNS (migration 014)
-- ============================================================================
--
-- 014 renamed avg_update_period_ms to tick_ms and added tick_min_ms/tick_max_ms.
-- Two separate things are checked, because either can regress on its own: that
-- the rename happened at all, and that anon can still read the columns. The
-- second is not implied by the first - 009 grants SELECT on the whole table
-- today, but aurora.players is already column-granted, so this table changing
-- shape the same way later is a live possibility, and it would hide the new
-- columns without any error at migration time.

DO $$
DECLARE
  v_cols TEXT[];
BEGIN
  SELECT array_agg(attname ORDER BY attname) INTO v_cols
    FROM pg_attribute
   WHERE attrelid = 'aurora.health_samples'::REGCLASS
     AND attnum > 0
     AND NOT attisdropped
     AND attname IN ('tick_ms', 'tick_min_ms', 'tick_max_ms', 'avg_update_period_ms');

  IF v_cols IS DISTINCT FROM ARRAY['tick_max_ms', 'tick_min_ms', 'tick_ms'] THEN
    RAISE EXCEPTION
      'FAIL: aurora.health_samples tick columns are %, expected exactly {tick_max_ms,tick_min_ms,tick_ms} and no avg_update_period_ms',
      COALESCE(v_cols::TEXT, 'none');
  END IF;
  RAISE NOTICE 'PASS health_samples carries tick_ms/tick_min_ms/tick_max_ms and avg_update_period_ms is gone';
END;
$$;

SET LOCAL ROLE anon;

DO $$
BEGIN
  -- A column the role cannot read raises insufficient_privilege at plan time,
  -- so this proves the grant regardless of how many rows the table holds.
  PERFORM h.tick_ms, h.tick_min_ms, h.tick_max_ms
     FROM aurora.health_samples h
    LIMIT 1;
  RAISE NOTICE 'PASS anon reads the three tick columns of aurora.health_samples';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE EXCEPTION
    'FAIL: anon cannot read the tick columns of aurora.health_samples - 014 added columns that the grant in 009 does not cover';
END;
$$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL AURORA POLICY TESTS PASSED'; END; $$;

ROLLBACK;
