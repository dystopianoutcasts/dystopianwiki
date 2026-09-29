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

-- Migration 019 moved the admin fact off user_profiles (a column
-- `authenticated` could write on its own row) and onto auth.users, which only
-- the service role/postgres may write. Section 11 below is the negative proof
-- that a non-admin gains nothing by writing user_profiles.
UPDATE auth.users
   SET raw_app_meta_data = raw_app_meta_data || '{"aurora_admin": true}'::jsonb
 WHERE id = 'bbbbbbbb-0000-4000-8000-000000000002';

-- Pin the visibility setting to the 008 default this file's assertions are written
-- against. The live row is the owner's to change (T21 set anonPositions true, then
-- delayMinutes 0 and roundToCell false), and on 2026-09-29 section 1 failed on the
-- live value, not on a policy defect. Inside this transaction, so the ROLLBACK at the
-- bottom restores whatever the owner has set.
INSERT INTO aurora.settings (key, value)
VALUES ('visibility', '{"anonPositions": false, "delayMinutes": 30, "roundToCell": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

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
  -- Scoped to the fixture server: the live database has real rows on other servers.
  SELECT count(*) INTO v_count FROM aurora.player_positions_visible WHERE server_id = 'test-aurora';
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'FAIL: expected 3 rows in the view for the linked user, got %', v_count;
  END IF;
  RAISE NOTICE 'PASS the view returns one row per character (3)';

  -- The live table itself leaks nothing beyond alice and bob.
  SELECT count(*) INTO v_count FROM aurora.player_positions WHERE server_id = 'test-aurora';
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
  RAISE NOTICE 'PASS admin flag is read from auth.users.raw_app_meta_data';

  SELECT count(*) INTO v_count FROM aurora.player_positions WHERE server_id = 'test-aurora';
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'FAIL: admin read % rows from aurora.player_positions, expected 3', v_count;
  END IF;
  RAISE NOTICE 'PASS admin reads every row of aurora.player_positions';

  -- Every row live and exact, including carol.
  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible v
   WHERE v.is_delayed AND v.server_id = 'test-aurora';
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

  SELECT count(*) INTO v_count FROM aurora.player_position_history WHERE server_id = 'test-aurora';
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

-- ============================================================================
-- 8. INGEST BEARER (migration 015)
-- ============================================================================
--
-- On 2026-09-28 the cron ran green while every HTTP call 401'd, because the
-- Vault secret held an empty string and 'Bearer ' || '' produced a header with
-- no token. 015 wraps the secret read in aurora.ingest_bearer(), which RAISEs
-- on a missing, NULL, empty, or wrong-shaped value.
--
-- VARIANT USED: "rename the real secret inside a transaction that is rolled
-- back", per T18's fallback - this file cannot assume it may create Vault
-- secrets, and the whole file is already one BEGIN ... ROLLBACK, so the
-- negative proof below never needs its own transaction: the outer ROLLBACK at
-- the bottom of this file is what makes it safe. The rename is restored
-- before the block ends anyway, so a reader stepping through with
-- client_min_messages = NOTICE never sees the secret missing for longer than
-- this one DO block, and a failure partway through still leaves the outer
-- ROLLBACK as the backstop.
--
-- This section runs as the role that started the transaction (postgres, per
-- the file header), which is also aurora.ingest_bearer()'s and
-- aurora.enable_ingest_cron()'s owner - the same role pg_cron would execute
-- the scheduled command as, since cron.schedule() was called from inside that
-- SECURITY DEFINER function.

DO $$
DECLARE
  v_bearer     TEXT;
  v_secret_id  UUID;
  v_raised     BOOLEAN;
BEGIN
  -- The positive case first: with the real secret in place, the function
  -- returns a plausible value rather than raising.
  BEGIN
    v_bearer := aurora.ingest_bearer();
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'FAIL: aurora.ingest_bearer() raised with the real secret in place: %', SQLERRM;
  END;
  IF v_bearer IS NULL OR length(v_bearer) < 20 OR left(v_bearer, 10) <> 'sb_secret_' THEN
    RAISE EXCEPTION 'FAIL: aurora.ingest_bearer() returned an unexpected value shape';
  END IF;
  RAISE NOTICE 'PASS aurora.ingest_bearer() resolves the live secret';

  SELECT id INTO v_secret_id FROM vault.secrets WHERE name = 'aurora_service_role_key';
  IF v_secret_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: vault secret aurora_service_role_key does not exist - the negative proof needs it present';
  END IF;

  -- Rename it out from under the resolver's WHERE clause. new_secret is left
  -- NULL (the function's default), which vault.update_secret treats as "keep
  -- the existing value" - the secret itself is never touched, only its name.
  PERFORM vault.update_secret(v_secret_id, new_name := 'aurora_service_role_key_t18_negative_proof');

  BEGIN
    PERFORM aurora.ingest_bearer();
    -- Reached only if ingest_bearer() did NOT raise. Force our own exception
    -- with a sentinel message so the handler below can tell the two cases
    -- apart: our sentinel means the function under test stayed silent, any
    -- other message means it raised on its own, which is the pass condition.
    RAISE EXCEPTION 'T18_SENTINEL_DID_NOT_RAISE';
  EXCEPTION
    WHEN OTHERS THEN
      v_raised := (SQLERRM <> 'T18_SENTINEL_DID_NOT_RAISE');
  END;

  -- Restore the name before any assertion below can stop the block early -
  -- the outer ROLLBACK is the real safety net, but a reader should never see
  -- the rename outlive this DO block even if something above misbehaves.
  PERFORM vault.update_secret(v_secret_id, new_name := 'aurora_service_role_key');

  IF NOT v_raised THEN
    RAISE EXCEPTION 'FAIL: aurora.ingest_bearer() did NOT raise with the secret renamed out from under it';
  END IF;
  RAISE NOTICE 'PASS aurora.ingest_bearer() raises when the secret cannot be found (negative proof, rolled back)';

  -- Confirm the restore worked and a normal call succeeds again - proves the
  -- rename-then-restore round trip did not leave anything broken for the
  -- cron's next real run.
  v_bearer := aurora.ingest_bearer();
  IF v_bearer IS NULL THEN
    RAISE EXCEPTION 'FAIL: aurora.ingest_bearer() did not recover after the secret name was restored';
  END IF;
  RAISE NOTICE 'PASS aurora.ingest_bearer() recovers once the secret name is restored';
END;
$$;

-- ============================================================================
-- 9. INGEST LOCK AND CRON TIMEOUT (migration 016)
-- ============================================================================
--
-- T23 runs hold the SFTP session for ~55 s and re-read every 5 s, so two
-- overlapping runs would read the same bytes twice and duplicate the
-- append-only player_position_history. aurora.ingest_lock() must refuse a
-- second holder, let a claim expire, and release only for its holder.
--
-- The live ingest may hold the lock while this file runs, so the row is
-- deleted first. That DELETE is inside this file's one transaction and is
-- undone by the ROLLBACK at the bottom; a live run calling ingest_lock()
-- meanwhile waits on the row lock for the few seconds this takes, then carries
-- on as if nothing happened.
--
-- now() is frozen for the whole transaction, so expiry is simulated by
-- back-dating expires_at as postgres, not by waiting.

DELETE FROM aurora.ingest_lock;

SET LOCAL ROLE service_role;

DO $$
BEGIN
  IF NOT aurora.ingest_lock('t23-run-a', 90) THEN
    RAISE EXCEPTION 'FAIL: a free lock was refused to run a';
  END IF;
  IF aurora.ingest_lock('t23-run-b', 90) THEN
    RAISE EXCEPTION 'FAIL: run b was granted the lock while run a holds it';
  END IF;
  IF NOT aurora.ingest_lock('t23-run-a', 90) THEN
    RAISE EXCEPTION 'FAIL: the holder could not renew its own claim';
  END IF;
  IF aurora.ingest_unlock('t23-run-b') THEN
    RAISE EXCEPTION 'FAIL: run b released a lock it does not hold';
  END IF;
  IF (SELECT run_id FROM aurora.ingest_lock) IS DISTINCT FROM 't23-run-a' THEN
    RAISE EXCEPTION 'FAIL: the lock row does not name run a after the refusals';
  END IF;
  RAISE NOTICE 'PASS ingest_lock refuses a second holder while the first holds it';
END;
$$;

RESET ROLE;
UPDATE aurora.ingest_lock SET expires_at = now() - INTERVAL '1 second';
SET LOCAL ROLE service_role;

DO $$
BEGIN
  IF NOT aurora.ingest_lock('t23-run-b', 90) THEN
    RAISE EXCEPTION 'FAIL: an expired claim was not taken over';
  END IF;
  -- Run a outlived its claim; on the way out it must not free run b's lock.
  IF aurora.ingest_unlock('t23-run-a') THEN
    RAISE EXCEPTION 'FAIL: the expired former holder released its successor''s lock';
  END IF;
  IF NOT aurora.ingest_unlock('t23-run-b') THEN
    RAISE EXCEPTION 'FAIL: the holder could not release';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.ingest_lock) THEN
    RAISE EXCEPTION 'FAIL: the lock row survived its release';
  END IF;
  IF NOT aurora.ingest_lock('t23-run-c', 90) THEN
    RAISE EXCEPTION 'FAIL: a released lock was refused';
  END IF;
  RAISE NOTICE 'PASS ingest_lock expires, is taken over, and releases only for its holder';
END;
$$;

RESET ROLE;

DO $$
DECLARE
  v_raised BOOLEAN := FALSE;
BEGIN
  BEGIN
    PERFORM aurora.ingest_lock('bad', 0);
  EXCEPTION WHEN OTHERS THEN
    v_raised := TRUE;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION 'FAIL: ingest_lock accepted a zero TTL';
  END IF;
  RAISE NOTICE 'PASS ingest_lock rejects a zero TTL';
END;
$$;

SET LOCAL ROLE anon;

DO $$
DECLARE
  v_denied BOOLEAN := FALSE;
BEGIN
  BEGIN
    PERFORM aurora.ingest_lock('anon-run', 90);
  EXCEPTION WHEN insufficient_privilege THEN
    v_denied := TRUE;
  END;
  IF NOT v_denied THEN
    RAISE EXCEPTION 'FAIL: anon can call aurora.ingest_lock';
  END IF;
  RAISE NOTICE 'PASS anon cannot take the ingest lock';
END;
$$;

RESET ROLE;

DO $$
BEGIN
  IF pg_get_functiondef('aurora.enable_ingest_cron(text)'::regprocedure)
       NOT LIKE '%timeout_milliseconds := 58000%' THEN
    RAISE EXCEPTION 'FAIL: enable_ingest_cron does not schedule the 58 s pg_net timeout';
  END IF;
  IF pg_get_functiondef('aurora.enable_ingest_cron(text)'::regprocedure)
       NOT LIKE '%aurora.ingest_bearer()%' THEN
    RAISE EXCEPTION 'FAIL: enable_ingest_cron lost the 015 bearer resolver';
  END IF;
  RAISE NOTICE 'PASS enable_ingest_cron schedules timeout 58000 with the 015 bearer';
END;
$$;

-- ============================================================================
-- 10. POSITIONS ONLINE-ONLY, HONEST FLAGS (migration 018)
-- ============================================================================
--
-- dave is offline with a 90-minute-old history row; positions_delayed() must
-- never return him no matter who is asking (T16 P0-2). frank is online with a
-- single history row and no live aurora.player_positions row of his own, so he
-- arrives ONLY through the delayed half - the row whose is_delayed/is_rounded
-- must follow settings.visibility, not the two constants 010 hard-coded
-- (T16 P2-1). Both are added here rather than to the shared fixture block
-- above so sections 1-9 (already asserted against that fixture set) are
-- untouched.

INSERT INTO aurora.players
  (server_id, username, display_name, last_seen, online, access_level, is_dead)
VALUES
  ('test-aurora', 'dave',  'Dave',  NOW(), FALSE, 'none', FALSE),
  ('test-aurora', 'frank', 'Frank', NOW(), TRUE,  'none', FALSE);

INSERT INTO aurora.player_position_history (server_id, username, x, y, z, t)
VALUES
  ('test-aurora', 'dave',  300.0, 300.0, 0, NOW() - INTERVAL '90 minutes'),
  ('test-aurora', 'frank', 400.0, 400.0, 0, NOW() - INTERVAL '90 minutes');

-- Make anon eligible for the delayed feed too, so the "offline character never
-- appears" assertion below actually exercises the online filter for anon
-- rather than trivially passing behind anonPositions=false.
UPDATE aurora.settings
   SET value = '{"anonPositions": true, "delayMinutes": 30, "roundToCell": true}'::jsonb
 WHERE key = 'visibility';

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible
   WHERE server_id = 'test-aurora' AND username = 'dave';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon saw % rows for offline dave, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS anon never sees an offline character (dave)';

  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible
   WHERE server_id = 'test-aurora' AND username = 'frank';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL: anon saw % rows for online frank, expected 1', v_count;
  END IF;
  RAISE NOTICE 'PASS anon sees exactly one row for an online character (frank)';
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count   BIGINT;
  v_delayed BOOLEAN;
  v_rounded BOOLEAN;
  v_x       REAL;
BEGIN
  -- (a) an offline character with history returns no row, to the linked user either.
  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible
   WHERE server_id = 'test-aurora' AND username = 'dave';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: linked user saw % rows for offline dave, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS the linked user never sees an offline character (dave)';

  -- (b) an online character (frank, a stranger to this user) returns one row.
  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible
   WHERE server_id = 'test-aurora' AND username = 'frank';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL: linked user saw % rows for online frank, expected 1', v_count;
  END IF;
  RAISE NOTICE 'PASS the linked user sees exactly one row for an online character (frank)';

  -- (c) flags follow the pinned settings: delay 30 / rounding on -> TRUE/TRUE.
  SELECT v.is_delayed, v.is_rounded, v.x INTO v_delayed, v_rounded, v_x
    FROM aurora.player_positions_visible v
   WHERE v.server_id = 'test-aurora' AND v.username = 'frank';
  IF v_delayed IS NOT TRUE OR v_rounded IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: with delayMinutes=30/roundToCell=true frank should read delayed=TRUE rounded=TRUE, got delayed=% rounded=%', v_delayed, v_rounded;
  END IF;
  RAISE NOTICE 'PASS is_delayed/is_rounded read TRUE/TRUE under delayed, rounded settings';
END;
$$;

RESET ROLE;

-- Flip to the setting the owner actually runs live: no delay, no rounding.
-- Fixture setup, not part of what is being tested, so it runs as the migration
-- owner: `authenticated` holds only SELECT on aurora.settings (009), and this
-- UPDATE raised 42501 permission denied when first rehearsed against a local
-- Postgres (PGlite, T26) inside the `authenticated` DO block above - this
-- section had never actually been executed before that rehearsal. Splitting
-- the privileged write out into its own statement, between two authenticated
-- DO blocks, fixes it without changing any assertion.
UPDATE aurora.settings
   SET value = '{"anonPositions": true, "delayMinutes": 0, "roundToCell": false}'::jsonb
 WHERE key = 'visibility';

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count   BIGINT;
  v_delayed BOOLEAN;
  v_rounded BOOLEAN;
  v_x       REAL;
BEGIN
  SELECT v.is_delayed, v.is_rounded, v.x INTO v_delayed, v_rounded, v_x
    FROM aurora.player_positions_visible v
   WHERE v.server_id = 'test-aurora' AND v.username = 'frank';
  IF v_delayed IS NOT FALSE OR v_rounded IS NOT FALSE THEN
    RAISE EXCEPTION 'FAIL: with delayMinutes=0/roundToCell=false frank should read delayed=FALSE rounded=FALSE, got delayed=% rounded=%', v_delayed, v_rounded;
  END IF;
  IF v_x IS DISTINCT FROM 400.0::REAL THEN
    RAISE EXCEPTION 'FAIL: with roundToCell=false frank''s x should be the exact history value 400, got %', v_x;
  END IF;
  RAISE NOTICE 'PASS is_delayed/is_rounded read FALSE/FALSE and x is exact under the live settings';

  -- The online filter still holds under the new settings too.
  SELECT count(*) INTO v_count
    FROM aurora.player_positions_visible
   WHERE server_id = 'test-aurora' AND username = 'dave';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: linked user saw % rows for offline dave under delay=0, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS the online filter holds with delayMinutes=0 too';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 11. ADMIN FLAG CANNOT BE SELF-GRANTED (migration 019)
-- ============================================================================
--
-- Before 019, aurora.is_aurora_admin() read public.user_profiles.is_aurora_admin,
-- a column the "Users can update own profile" policy (003) let any signed-in
-- user overwrite on their own row (T16 P0-1). 019 moves the fact to
-- auth.users.raw_app_meta_data (service-role-only) and drops the column
-- outright. This proves a non-admin gains nothing by updating their own
-- profile, that the column is truly gone rather than merely unread, and that
-- the admin fixture (section 3) still reads TRUE from its new source.

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count  BIGINT;
  v_caught BOOLEAN := FALSE;
  v_rows   INT;
BEGIN
  -- The column is gone, not merely unread: naming it raises undefined_column.
  BEGIN
    UPDATE public.user_profiles SET is_aurora_admin = TRUE WHERE id = auth.uid();
  EXCEPTION WHEN undefined_column THEN
    v_caught := TRUE;
  END;
  IF NOT v_caught THEN
    RAISE EXCEPTION 'FAIL: public.user_profiles.is_aurora_admin still exists and accepted a write';
  END IF;
  RAISE NOTICE 'PASS public.user_profiles.is_aurora_admin no longer exists';

  -- A non-admin may still update their own profile through a column that DOES
  -- exist - the policy itself is unchanged, only the admin fact moved off it.
  UPDATE public.user_profiles SET display_name = 'Alice Hacker' WHERE id = auth.uid();
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows <> 1 THEN
    RAISE EXCEPTION 'FAIL: alice could not update her own display_name, got % rows', v_rows;
  END IF;

  IF aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'FAIL: updating her own profile made alice an aurora admin';
  END IF;
  RAISE NOTICE 'PASS updating own profile does not touch aurora.is_aurora_admin()';

  -- Non-admin numbers, unchanged by the attempt: own + safehouse-peer live
  -- positions only (section 2), zero history rows.
  SELECT count(*) INTO v_count FROM aurora.player_positions WHERE server_id = 'test-aurora';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: expected 2 live positions for a non-admin, got %', v_count;
  END IF;

  SELECT count(*) INTO v_count FROM aurora.player_position_history;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: expected 0 history rows for a non-admin, got %', v_count;
  END IF;
  RAISE NOTICE 'PASS non-admin position/history counts are unchanged by the profile update attempt';
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-4000-8000-000000000002","role":"authenticated"}',
  TRUE
);

DO $$
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'FAIL: the admin fixture is not reported as an aurora admin under its new source';
  END IF;
  RAISE NOTICE 'PASS the admin fixture still reads TRUE, from auth.users.raw_app_meta_data';
END;
$$;

RESET ROLE;

-- ============================================================================
-- 12. ADMIN-ONLY DATA, PUBLIC VEHICLES WITHOUT THE DRIVER (migration 022)
-- ============================================================================
--
-- health_samples, servers and item_catalog move from "public, USING (TRUE)" to
-- admin-only (VISIBILITY.md, the owner's rule of 2026-09-29). vehicles gains a
-- public surface (type and position, never the driver) alongside the
-- untouched admin/safehouse-peer policies and grant on the table itself.

INSERT INTO aurora.health_samples (server_id, t, players, zombies_total)
VALUES
  ('test-aurora', NOW() - INTERVAL '2 minutes', 3, 100),
  ('test-aurora', NOW() - INTERVAL '1 minutes', 3, 105);

INSERT INTO aurora.item_catalog (server_id, full_type, display_name, category)
VALUES ('test-aurora', 'Base.Axe', 'Axe', 'Weapon');

INSERT INTO aurora.vehicles (server_id, vehicle_id, script_name, x, y, z, t, driver_username)
VALUES
  ('test-aurora', 1, 'Base.PickUpTruck', 100.0, 100.0, 0, NOW(), 'alice'),
  ('test-aurora', 2, 'Base.Van',         300.0, 300.0, 0, NOW(), NULL);

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  v_count BIGINT;
  v_cols  BIGINT;
BEGIN
  SELECT count(*) INTO v_count FROM aurora.health_samples WHERE server_id = 'test-aurora';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon read % rows from aurora.health_samples, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS anon reads zero rows from aurora.health_samples';

  SELECT count(*) INTO v_count FROM aurora.servers;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon read % rows from aurora.servers, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS anon reads zero rows from aurora.servers';

  SELECT count(*) INTO v_count FROM aurora.item_catalog;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon read % rows from aurora.item_catalog, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS anon reads zero rows from aurora.item_catalog';

  SELECT count(*) INTO v_count FROM aurora.vehicles_visible WHERE server_id = 'test-aurora';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: anon read % rows from aurora.vehicles_visible, expected 2', v_count;
  END IF;
  RAISE NOTICE 'PASS anon reads exactly 2 rows from aurora.vehicles_visible';

  SELECT count(*) INTO v_cols
    FROM information_schema.columns
   WHERE table_schema = 'aurora' AND table_name = 'vehicles_visible'
     AND column_name = 'driver_username';
  IF v_cols <> 0 THEN
    RAISE EXCEPTION 'FAIL: aurora.vehicles_visible has a driver_username column';
  END IF;
  RAISE NOTICE 'PASS aurora.vehicles_visible has no driver_username column';

  -- anon still has no grant on aurora.vehicles itself (009): direct access is
  -- refused outright, exactly as before 022.
  BEGIN
    PERFORM count(*) FROM aurora.vehicles;
    RAISE EXCEPTION 'FAIL: anon was able to select from aurora.vehicles directly';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon is denied aurora.vehicles directly, same as before 022';
  END;
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT count(*) INTO v_count FROM aurora.health_samples WHERE server_id = 'test-aurora';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: non-admin read % rows from aurora.health_samples, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS non-admin reads zero rows from aurora.health_samples';

  SELECT count(*) INTO v_count FROM aurora.servers;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: non-admin read % rows from aurora.servers, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS non-admin reads zero rows from aurora.servers';

  SELECT count(*) INTO v_count FROM aurora.item_catalog;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: non-admin read % rows from aurora.item_catalog, expected 0', v_count;
  END IF;
  RAISE NOTICE 'PASS non-admin reads zero rows from aurora.item_catalog';

  SELECT count(*) INTO v_count FROM aurora.vehicles_visible WHERE server_id = 'test-aurora';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: non-admin read % rows from aurora.vehicles_visible, expected 2', v_count;
  END IF;
  RAISE NOTICE 'PASS non-admin reads exactly 2 rows from aurora.vehicles_visible';
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-4000-8000-000000000002","role":"authenticated"}',
  TRUE
);

DO $$
DECLARE
  v_count  BIGINT;
  v_driver TEXT;
BEGIN
  SELECT count(*) INTO v_count FROM aurora.health_samples WHERE server_id = 'test-aurora';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: admin read % rows from aurora.health_samples, expected 2', v_count;
  END IF;
  RAISE NOTICE 'PASS admin reads the seeded aurora.health_samples rows';

  SELECT count(*) INTO v_count FROM aurora.servers WHERE id = 'test-aurora';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL: admin read % rows from aurora.servers, expected 1', v_count;
  END IF;
  RAISE NOTICE 'PASS admin reads the seeded aurora.servers row';

  SELECT count(*) INTO v_count FROM aurora.item_catalog WHERE server_id = 'test-aurora';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL: admin read % rows from aurora.item_catalog, expected 1', v_count;
  END IF;
  RAISE NOTICE 'PASS admin reads the seeded aurora.item_catalog row';

  SELECT count(*) INTO v_count FROM aurora.vehicles WHERE server_id = 'test-aurora';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: admin read % rows from aurora.vehicles, expected 2', v_count;
  END IF;

  SELECT driver_username INTO v_driver
    FROM aurora.vehicles WHERE server_id = 'test-aurora' AND vehicle_id = 1;
  IF v_driver IS DISTINCT FROM 'alice' THEN
    RAISE EXCEPTION 'FAIL: admin should read driver_username alice on vehicle 1, got %', v_driver;
  END IF;
  RAISE NOTICE 'PASS admin reads aurora.vehicles directly, driver_username included';
END;
$$;

RESET ROLE;

SET LOCAL ROLE service_role;

DO $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT count(*) INTO v_count FROM aurora.health_samples WHERE server_id = 'test-aurora';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: service_role read % rows from aurora.health_samples, expected 2', v_count;
  END IF;
  RAISE NOTICE 'PASS service_role reads the seeded aurora.health_samples rows (bypasses RLS)';
END;
$$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL AURORA POLICY TESTS PASSED'; END; $$;

ROLLBACK;
