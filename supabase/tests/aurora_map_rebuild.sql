-- Tests for migration 033 section 3: map rebuild requests (T51).
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL MAP REBUILD TESTS PASSED", or stops at the first failure.
--
-- "Applying 033 twice is fine" cannot be asserted from inside this file (the SQL editor
-- has no \i); the run script applies the migration twice, with a request row in between,
-- and checks the row survived. "Two workers never get the same request" needs two
-- sessions; the run script's concurrency step holds one claim's row lock open in one
-- session and claims from another. Here the sequential half is asserted (a second claim
-- finds nothing, the oldest comes first) and the function's text must say SKIP LOCKED.

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
   'authenticated', 'authenticated', 'mr-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'ffffffff-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'mr-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen) VALUES
  ('mr-a',     'A',     NOW()),
  ('mr-b',     'B',     NOW()),
  ('mr-nomap', 'NoMap', NOW()),
  ('mr-c',     'C',     NOW());

-- A finished request on mr-c, seeded directly: the reader must show it to an admin and
-- to nobody else.
INSERT INTO aurora.map_rebuild_requests (server_id, maps, status, finished_at, log)
VALUES ('mr-c', ARRAY['Muldraugh, KY'], 'done', NOW(), 'seeded');

INSERT INTO aurora.server_config (server_id, settings) VALUES
  ('mr-a', jsonb_build_object(
     'Map', jsonb_build_array('Raven Creek B42', 'Lawnmower', 'Vehicle Spawn Zones', 'Muldraugh, KY'),
     'WorkshopItems', jsonb_build_array('111', '222', 333))),
  ('mr-b', '{"Map": ["Muldraugh, KY"]}'::jsonb);

-- ============================================================================
-- 1. SHAPE, GRANTS, RLS (as postgres)
-- ============================================================================

DO $$
DECLARE
  f text;
  d text;
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'aurora.map_rebuild_requests'::regclass) THEN
    RAISE EXCEPTION 'FAIL: RLS is not enabled on map_rebuild_requests';
  END IF;
  IF has_table_privilege('anon', 'aurora.map_rebuild_requests', 'SELECT')
     OR has_table_privilege('authenticated', 'aurora.map_rebuild_requests', 'SELECT')
     OR has_table_privilege('authenticated', 'aurora.map_rebuild_requests', 'INSERT')
     OR has_table_privilege('authenticated', 'aurora.map_rebuild_requests', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'aurora.map_rebuild_requests', 'INSERT') THEN
    RAISE EXCEPTION 'FAIL: table grants (clients none, service_role all)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'aurora' AND indexname = 'map_rebuild_requests_server_status_idx') THEN
    RAISE EXCEPTION 'FAIL: the (server_id, status) index is missing';
  END IF;
  RAISE NOTICE 'PASS table: RLS on, no client grant, service_role all, (server_id, status) index';

  -- admin functions: authenticated yes, anon no; service functions: service_role only
  FOREACH f IN ARRAY ARRAY[
    'aurora.request_map_rebuild(text,text)', 'aurora.cancel_map_rebuild(bigint)',
    'aurora.map_rebuild_requests_admin(text,integer)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: admin function % must be authenticated-only', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    'aurora.claim_map_rebuild(text)', 'aurora.heartbeat_map_rebuild(bigint,text)',
    'aurora.finish_map_rebuild(bigint,text,text,text)', 'aurora.expire_map_rebuilds(integer)'] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR has_function_privilege('authenticated', f, 'EXECUTE')
       OR NOT has_function_privilege('service_role', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'FAIL: service function % must be service_role-only', f;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS grants: admin functions authenticated-only, service functions service_role-only, anon none';

  -- every function is SECURITY DEFINER with an empty search_path
  IF EXISTS (
    SELECT 1 FROM pg_proc p
     WHERE p.pronamespace = 'aurora'::regnamespace
       AND p.proname IN ('request_map_rebuild', 'cancel_map_rebuild', 'map_rebuild_requests_admin',
                         'claim_map_rebuild', 'heartbeat_map_rebuild', 'finish_map_rebuild', 'expire_map_rebuilds')
       AND (NOT p.prosecdef OR p.proconfig IS NULL OR NOT ('search_path=""' = ANY (p.proconfig)))
  ) THEN
    RAISE EXCEPTION 'FAIL: a map rebuild function is not SECURITY DEFINER with an empty search_path';
  END IF;
  SELECT pg_get_functiondef('aurora.claim_map_rebuild(text)'::regprocedure) INTO d;
  IF d NOT LIKE '%FOR UPDATE SKIP LOCKED%' THEN
    RAISE EXCEPTION 'FAIL: claim_map_rebuild must lock with FOR UPDATE SKIP LOCKED';
  END IF;
  RAISE NOTICE 'PASS every function is SECURITY DEFINER with an empty search_path; claim uses FOR UPDATE SKIP LOCKED';
END $$;

-- ============================================================================
-- 2. ANON IS DENIED EVERY FUNCTION
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  n int := 0;
  calls text[] := ARRAY[
    $c$SELECT aurora.request_map_rebuild('mr-a', 'x')$c$,
    $c$SELECT aurora.cancel_map_rebuild(1)$c$,
    $c$SELECT * FROM aurora.map_rebuild_requests_admin('mr-a', 5)$c$,
    $c$SELECT * FROM aurora.claim_map_rebuild('w')$c$,
    $c$SELECT aurora.heartbeat_map_rebuild(1, 'x')$c$,
    $c$SELECT aurora.finish_map_rebuild(1, 'done', 'x', 'abc')$c$,
    $c$SELECT aurora.expire_map_rebuilds(5)$c$,
    $c$SELECT * FROM aurora.map_rebuild_requests$c$];
  c text;
BEGIN
  FOREACH c IN ARRAY calls LOOP
    BEGIN
      EXECUTE c;
      RAISE EXCEPTION 'FAIL: anon was allowed: %', c;
    EXCEPTION WHEN insufficient_privilege THEN
      n := n + 1;
    END;
  END LOOP;
  RAISE NOTICE 'PASS anon is denied all % calls (7 functions and the table)', n;
END $$;

RESET ROLE;

-- ============================================================================
-- 3. A MEMBER CANNOT REQUEST, CANCEL, READ OR CLAIM
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  BEGIN
    PERFORM aurora.request_map_rebuild('mr-a', 'member');
    RAISE EXCEPTION 'FAIL: a member filed a rebuild request';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM aurora.cancel_map_rebuild(1);
    RAISE EXCEPTION 'FAIL: a member cancelled a request';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  SELECT count(*) INTO n FROM aurora.map_rebuild_requests_admin('mr-c', 20);
  IF n <> 0 THEN
    RAISE EXCEPTION 'FAIL: a member read % rows from the admin reader', n;
  END IF;
  BEGIN
    PERFORM * FROM aurora.claim_map_rebuild('member');
    RAISE EXCEPTION 'FAIL: a member called claim_map_rebuild';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM aurora.finish_map_rebuild(1, 'done', '', '');
    RAISE EXCEPTION 'FAIL: a member called finish_map_rebuild';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS a member cannot request, cancel, claim or finish, and reads zero rows';
END $$;

RESET ROLE;

-- ============================================================================
-- 4. AN ADMIN FILES ONE REQUEST AT A TIME
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE
  id1 bigint;
  r aurora.map_rebuild_requests;
  st text;
  msg text;
BEGIN
  id1 := aurora.request_map_rebuild('mr-a', '  fix the picture  ');
  PERFORM set_config('mr.id1', id1::text, TRUE);
  IF (SELECT count(*) FROM aurora.map_rebuild_requests_admin('mr-c', 20)) <> 1 THEN
    RAISE EXCEPTION 'FAIL: the admin reader did not show the seeded row';
  END IF;
  SELECT * INTO r FROM aurora.map_rebuild_requests_admin('mr-a', 20) WHERE id = id1;
  IF r.status <> 'queued' OR r.server_id <> 'mr-a' OR r.note <> 'fix the picture'
     OR r.requested_by IS DISTINCT FROM 'ffffffff-0000-4000-8000-000000000002'::uuid THEN
    RAISE EXCEPTION 'FAIL: stored request is %', to_jsonb(r);
  END IF;
  IF r.maps IS DISTINCT FROM ARRAY['Raven Creek B42', 'Muldraugh, KY']::text[] THEN
    RAISE EXCEPTION 'FAIL: maps are % (expected Map= order, helpers removed)', r.maps;
  END IF;
  IF r.workshop_items IS DISTINCT FROM ARRAY['111', '222', '333']::text[] THEN
    RAISE EXCEPTION 'FAIL: workshop_items are %', r.workshop_items;
  END IF;
  IF r.claimed_at IS NOT NULL OR r.heartbeat_at IS NOT NULL OR r.finished_at IS NOT NULL OR r.log IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: a fresh request carries claim or finish fields: %', to_jsonb(r);
  END IF;
  RAISE NOTICE 'PASS an admin files a request: queued, maps without the two helpers in order, workshop ids, requested_by, trimmed note';

  -- a second one while the first is queued is refused with the readable message
  BEGIN
    PERFORM aurora.request_map_rebuild('mr-a', 'again');
    RAISE EXCEPTION 'FAIL: a second request was accepted while one is queued';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
    IF st <> 'P0001' OR msg NOT LIKE '%already queued or running%' THEN
      RAISE EXCEPTION 'FAIL: duplicate refusal was % / % (expected P0001 with the readable text)', st, msg;
    END IF;
  END;
  RAISE NOTICE 'PASS a second request while one is queued is refused (P0001, readable message)';

  -- another server is independent
  PERFORM aurora.request_map_rebuild('mr-b', NULL);
  RAISE NOTICE 'PASS the guard is per server';

  -- no Map= list on record, unknown server: refused, not stored
  BEGIN
    PERFORM aurora.request_map_rebuild('mr-nomap', 'x');
    RAISE EXCEPTION 'FAIL: a server with no map list was accepted';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE;
    IF st <> 'P0001' THEN RAISE EXCEPTION 'FAIL: no-map refusal state %', st; END IF;
  END;
  BEGIN
    PERFORM aurora.request_map_rebuild('mr-ghost', 'x');
    RAISE EXCEPTION 'FAIL: an unknown server was accepted';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE;
    IF st <> 'P0001' THEN RAISE EXCEPTION 'FAIL: unknown-server refusal state %', st; END IF;
  END;
  RAISE NOTICE 'PASS a server with no map list, and an unknown server, are refused';

  -- the table is not readable directly even for an admin
  BEGIN
    PERFORM * FROM aurora.map_rebuild_requests;
    RAISE EXCEPTION 'FAIL: an admin read the table directly';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS the table is closed to clients; admins read through the function';
END $$;

RESET ROLE;

-- ============================================================================
-- 5. THE RENDER PC: CLAIM, HEARTBEAT, FINISH (service role)
-- ============================================================================

-- mr-b's request is made newer so the oldest is unambiguous (now() is one value inside
-- this transaction; ties would fall to id, which this makes explicit).
UPDATE aurora.map_rebuild_requests SET requested_at = now() - interval '10 minutes' WHERE server_id = 'mr-a';
UPDATE aurora.map_rebuild_requests SET requested_at = now() - interval '5 minutes'  WHERE server_id = 'mr-b';

SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', TRUE);

DO $$
DECLARE
  r aurora.map_rebuild_requests;
  n int;
  ok boolean;
  st text;
BEGIN
  SELECT count(*) INTO n FROM aurora.claim_map_rebuild('pc-1');
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: claim returned % rows, expected exactly 1', n; END IF;
  -- the claimed row is the oldest (mr-a)
  PERFORM set_config('mr.claimed', (SELECT id::text FROM aurora.map_rebuild_requests WHERE server_id = 'mr-a'), TRUE);
  SELECT * INTO r FROM aurora.map_rebuild_requests WHERE id = current_setting('mr.claimed')::bigint;
  IF r.status <> 'running' OR r.claimed_by <> 'pc-1' OR r.claimed_at IS NULL OR r.heartbeat_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: the claimed row is %', to_jsonb(r);
  END IF;
  IF (SELECT status FROM aurora.map_rebuild_requests WHERE server_id = 'mr-b') <> 'queued' THEN
    RAISE EXCEPTION 'FAIL: claim took the newer request, or more than one';
  END IF;
  RAISE NOTICE 'PASS claim returns one row, the oldest, now running with claimed_by, claimed_at, heartbeat_at';

  -- the next claim gets mr-b's; then nothing is left
  SELECT count(*) INTO n FROM aurora.claim_map_rebuild('pc-2');
  IF n <> 1 OR (SELECT claimed_by FROM aurora.map_rebuild_requests WHERE server_id = 'mr-b') <> 'pc-2' THEN
    RAISE EXCEPTION 'FAIL: the second claim did not take the other request';
  END IF;
  SELECT count(*) INTO n FROM aurora.claim_map_rebuild('pc-3');
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: a claim with nothing queued returned % rows', n; END IF;
  IF (SELECT claimed_by FROM aurora.map_rebuild_requests WHERE id = current_setting('mr.claimed')::bigint) <> 'pc-1' THEN
    RAISE EXCEPTION 'FAIL: a later claim overwrote the first claimant';
  END IF;
  RAISE NOTICE 'PASS a second claim takes the other request, a third returns nothing, the first claim is untouched';

  -- heartbeat
  UPDATE aurora.map_rebuild_requests SET heartbeat_at = now() - interval '1 hour' WHERE id = current_setting('mr.claimed')::bigint;
  ok := aurora.heartbeat_map_rebuild(current_setting('mr.claimed')::bigint, 'step 3 of 9');
  SELECT * INTO r FROM aurora.map_rebuild_requests WHERE id = current_setting('mr.claimed')::bigint;
  IF ok IS NOT TRUE OR r.log <> 'step 3 of 9' OR r.heartbeat_at < now() - interval '1 minute' THEN
    RAISE EXCEPTION 'FAIL: heartbeat did not refresh the row: % %', ok, to_jsonb(r);
  END IF;
  ok := aurora.heartbeat_map_rebuild(-1, 'x');
  IF ok IS NOT FALSE THEN RAISE EXCEPTION 'FAIL: heartbeat on an unknown id returned %', ok; END IF;
  RAISE NOTICE 'PASS heartbeat refreshes the time and the log tail; false for an unknown id';

  -- finish: an invalid status raises, nothing changes
  BEGIN
    PERFORM aurora.finish_map_rebuild(current_setting('mr.claimed')::bigint, 'cancelled', 'x', 'abc');
    RAISE EXCEPTION 'FAIL: finish accepted status cancelled';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE;
    IF st <> '22023' THEN RAISE EXCEPTION 'FAIL: invalid finish status raised % (expected 22023)', st; END IF;
  END;
  BEGIN
    PERFORM aurora.finish_map_rebuild(current_setting('mr.claimed')::bigint, 'queued', 'x', 'abc');
    RAISE EXCEPTION 'FAIL: finish accepted status queued';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE;
    IF st <> '22023' THEN RAISE EXCEPTION 'FAIL: invalid finish status raised % (expected 22023)', st; END IF;
  END;
  BEGIN
    PERFORM aurora.finish_map_rebuild(current_setting('mr.claimed')::bigint, NULL, 'x', 'abc');
    RAISE EXCEPTION 'FAIL: finish accepted a NULL status';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE;
    IF st <> '22023' THEN RAISE EXCEPTION 'FAIL: NULL finish status raised % (expected 22023)', st; END IF;
  END;
  IF (SELECT status FROM aurora.map_rebuild_requests WHERE id = current_setting('mr.claimed')::bigint) <> 'running' THEN
    RAISE EXCEPTION 'FAIL: a refused finish changed the row';
  END IF;
  RAISE NOTICE 'PASS finish with an invalid or NULL status raises 22023 and changes nothing';

  ok := aurora.finish_map_rebuild(current_setting('mr.claimed')::bigint, 'done', 'all maps ok', 'abc1234');
  SELECT * INTO r FROM aurora.map_rebuild_requests WHERE id = current_setting('mr.claimed')::bigint;
  IF ok IS NOT TRUE OR r.status <> 'done' OR r.commit_sha <> 'abc1234' OR r.log <> 'all maps ok' OR r.finished_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: finish done left %', to_jsonb(r);
  END IF;
  ok := aurora.finish_map_rebuild(current_setting('mr.claimed')::bigint, 'failed', 'late', NULL);
  IF ok IS NOT FALSE OR (SELECT status FROM aurora.map_rebuild_requests WHERE id = current_setting('mr.claimed')::bigint) <> 'done' THEN
    RAISE EXCEPTION 'FAIL: a finished request was finished again';
  END IF;
  ok := aurora.heartbeat_map_rebuild(current_setting('mr.claimed')::bigint, 'zombie');
  IF ok IS NOT FALSE THEN RAISE EXCEPTION 'FAIL: heartbeat on a finished request returned %', ok; END IF;
  RAISE NOTICE 'PASS finish done stores sha, log and time; a second finish and a late heartbeat return false';
END $$;

RESET ROLE;

-- ============================================================================
-- 6. CANCEL ONLY WORKS ON QUEUED; A NEW REQUEST WORKS AFTER A FINISH
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE
  idq bigint;
  idr bigint;
  ok boolean;
BEGIN
  -- mr-b is still running (pc-2 claimed it): cannot cancel
  idr := (SELECT id FROM aurora.map_rebuild_requests_admin('mr-b', 5) LIMIT 1);
  ok := aurora.cancel_map_rebuild(idr);
  IF ok IS NOT FALSE OR (SELECT status FROM aurora.map_rebuild_requests_admin('mr-b', 5) LIMIT 1) <> 'running' THEN
    RAISE EXCEPTION 'FAIL: a running request was cancelled (returned %)', ok;
  END IF;
  -- a finished one: cannot cancel
  ok := aurora.cancel_map_rebuild(current_setting('mr.claimed')::bigint);
  IF ok IS NOT FALSE THEN RAISE EXCEPTION 'FAIL: a done request was cancelled'; END IF;
  -- mr-b running blocks a new request
  BEGIN
    PERFORM aurora.request_map_rebuild('mr-b', 'x');
    RAISE EXCEPTION 'FAIL: a request was accepted while one is running';
  EXCEPTION WHEN SQLSTATE 'P0001' THEN NULL;
  END;
  -- mr-a finished: a new request is accepted, then cancelled while queued
  idq := aurora.request_map_rebuild('mr-a', 'second');
  IF idq = current_setting('mr.claimed')::bigint THEN RAISE EXCEPTION 'FAIL: new request reused an id'; END IF;
  ok := aurora.cancel_map_rebuild(idq);
  IF ok IS NOT TRUE OR (SELECT status FROM aurora.map_rebuild_requests_admin('mr-a', 5) WHERE id = idq) <> 'cancelled'
     OR (SELECT finished_at FROM aurora.map_rebuild_requests_admin('mr-a', 5) WHERE id = idq) IS NULL THEN
    RAISE EXCEPTION 'FAIL: cancelling a queued request did not cancel it (returned %)', ok;
  END IF;
  ok := aurora.cancel_map_rebuild(idq);
  IF ok IS NOT FALSE THEN RAISE EXCEPTION 'FAIL: a cancelled request was cancelled twice'; END IF;
  -- after the cancel the server is free again
  PERFORM aurora.request_map_rebuild('mr-a', 'third');
  RAISE NOTICE 'PASS cancel works only on queued; running and done refuse; a finished or cancelled request frees the server';
END $$;

RESET ROLE;

-- ============================================================================
-- 7. EXPIRE: A STALE RUNNING ROW FAILS, A FRESH ONE DOES NOT
-- ============================================================================

-- mr-b's row is running with a fresh heartbeat; mr-a's third request is queued.
UPDATE aurora.map_rebuild_requests SET claimed_at = now() - interval '5 hours' WHERE server_id = 'mr-b' AND status = 'running';
SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', TRUE);

DO $$
DECLARE
  n int;
  st text;
BEGIN
  n := aurora.expire_map_rebuilds(120);
  IF n <> 0 OR (SELECT status FROM aurora.map_rebuild_requests WHERE server_id = 'mr-b' AND status IN ('running', 'failed')) <> 'running' THEN
    RAISE EXCEPTION 'FAIL: expire touched a running row with a fresh heartbeat (changed %)', n;
  END IF;
  BEGIN
    PERFORM aurora.expire_map_rebuilds(0);
    RAISE EXCEPTION 'FAIL: expire accepted 0 minutes';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS st = RETURNED_SQLSTATE;
    IF st <> '22023' THEN RAISE EXCEPTION 'FAIL: expire(0) raised %', st; END IF;
  END;
  RAISE NOTICE 'PASS expire leaves a fresh running row alone and rejects a non-positive window';
END $$;

RESET ROLE;

-- Make mr-b's running row stale, give it a long log, and add a queued row on mr-nomap's
-- sibling to prove queued rows are never expired.
UPDATE aurora.map_rebuild_requests
   SET heartbeat_at = now() - interval '3 hours', log = repeat('x', 10000) || 'THE-END'
 WHERE server_id = 'mr-b' AND status = 'running';
-- A queued row that is very old: must stay queued.
UPDATE aurora.map_rebuild_requests SET requested_at = now() - interval '9 hours' WHERE server_id = 'mr-a' AND status = 'queued';

SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', TRUE);

DO $$
DECLARE
  n int;
  r aurora.map_rebuild_requests;
BEGIN
  -- a window longer than the staleness leaves it running
  n := aurora.expire_map_rebuilds(240);
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: expire(240) changed % rows for a 3 hour old heartbeat', n; END IF;
  n := aurora.expire_map_rebuilds(120);
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: expire(120) changed % rows, expected the one stale running row', n; END IF;
  SELECT * INTO r FROM aurora.map_rebuild_requests WHERE server_id = 'mr-b';
  IF r.status <> 'failed' OR r.log <> 'no heartbeat' OR r.finished_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: expired row is %', to_jsonb(r);
  END IF;
  IF (SELECT status FROM aurora.map_rebuild_requests WHERE server_id = 'mr-a' AND status IN ('queued', 'failed')) <> 'queued' THEN
    RAISE EXCEPTION 'FAIL: expire touched a queued row';
  END IF;
  RAISE NOTICE 'PASS expire fails only the stale running row (log "no heartbeat", finished_at set) and never a queued one';
END $$;

RESET ROLE;

-- ============================================================================
-- 8. THE ADMIN READER: NEWEST FIRST, LOG TRUNCATED, EXPIRES A DEAD RENDER FIRST
-- ============================================================================

-- Rebuild the stale scenario so the reader itself must do the expiring.
UPDATE aurora.map_rebuild_requests
   SET status = 'running', claimed_by = 'pc-9', claimed_at = now() - interval '4 hours',
       heartbeat_at = now() - interval '3 hours', finished_at = NULL,
       log = repeat('x', 10000) || 'THE-END'
 WHERE server_id = 'mr-b';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE
  rows_ aurora.map_rebuild_requests[];
  r aurora.map_rebuild_requests;
BEGIN
  SELECT array_agg(x) INTO rows_ FROM aurora.map_rebuild_requests_admin('mr-b', 20) x;
  r := rows_[1];
  IF r.status <> 'failed' OR r.log <> 'no heartbeat' THEN
    RAISE EXCEPTION 'FAIL: the reader did not expire the dead render first: %', to_jsonb(r);
  END IF;

  -- truncation: put a long log on a finished row and read it
  RESET ROLE;
  UPDATE aurora.map_rebuild_requests SET log = repeat('x', 10000) || 'THE-END' WHERE server_id = 'mr-b';
  SET LOCAL ROLE authenticated;
  SELECT array_agg(x) INTO rows_ FROM aurora.map_rebuild_requests_admin('mr-b', 20) x;
  r := rows_[1];
  IF length(r.log) <> 4000 OR r.log NOT LIKE '%THE-END' THEN
    RAISE EXCEPTION 'FAIL: reader log length % (expected the last 4000 characters)', length(r.log);
  END IF;
  RAISE NOTICE 'PASS the reader expires a dead render first and cuts the log to its last 4000 characters';

  -- newest first, and the limit
  SELECT array_agg(x ORDER BY (x).requested_at DESC) INTO rows_ FROM aurora.map_rebuild_requests_admin('mr-a', 20) x;
  IF array_length(rows_, 1) <> 3 THEN RAISE EXCEPTION 'FAIL: mr-a has % rows in the reader, expected 3', array_length(rows_, 1); END IF;
  IF (SELECT array_agg(x.id) FROM aurora.map_rebuild_requests_admin('mr-a', 20) x) IS DISTINCT FROM
     (SELECT array_agg(y.id ORDER BY y.requested_at DESC, y.id DESC) FROM aurora.map_rebuild_requests_admin('mr-a', 20) y) THEN
    RAISE EXCEPTION 'FAIL: the reader is not newest first';
  END IF;
  IF (SELECT count(*) FROM aurora.map_rebuild_requests_admin('mr-a', 2)) <> 2 THEN
    RAISE EXCEPTION 'FAIL: the reader ignored p_limit';
  END IF;
  IF (SELECT count(*) FROM aurora.map_rebuild_requests_admin('mr-ghost', 20)) <> 0 THEN
    RAISE EXCEPTION 'FAIL: the reader returned rows for another server';
  END IF;
  RAISE NOTICE 'PASS the reader is newest first, honours the limit and is scoped to the server';
END $$;

RESET ROLE;

-- ============================================================================
-- 9. A DEAD RENDER DOES NOT BLOCK THE NEXT REQUEST
-- ============================================================================

UPDATE aurora.map_rebuild_requests SET status = 'cancelled', finished_at = now() WHERE server_id = 'mr-a' AND status = 'queued';
UPDATE aurora.map_rebuild_requests
   SET status = 'running', claimed_by = 'pc-9', claimed_at = now() - interval '5 hours',
       heartbeat_at = now() - interval '4 hours', finished_at = NULL
 WHERE server_id = 'mr-b';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ffffffff-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  PERFORM aurora.request_map_rebuild('mr-b', 'after the PC died');
  RAISE NOTICE 'PASS a request is accepted when the only open one is a dead render';
END $$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL MAP REBUILD TESTS PASSED'; END $$;

ROLLBACK;
