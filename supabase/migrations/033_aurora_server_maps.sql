-- Migration 033: the live map follows the server's Map= list (T50)
-- Created: 2026-10-02
-- Description: owner request, 2026-10-02 ("we had a soft wipe yesterday, but I still
--   see Raven's Creek on the live map"). The map picture, streets, areas and world-map
--   shapes are static files built from the maps the server ran on render day; nothing on
--   the site followed the server's Map= line. The map app now asks for that list and
--   draws only the maps the server runs.
--
--   aurora.server_maps(p_server)            PUBLIC. The server's Map= entries, in Map=
--                                           order, as TEXT[]. Every server's map list
--                                           is public, the same as on the home page
--                                           (027 already publishes settings->'Map'); an
--                                           anonymous visitor may read any server's.
--   aurora.pending_world_exists(p_server)   ADMINS ONLY (the gate is in the body: anyone
--                                           else gets FALSE). Whether migration 032's
--                                           aurora.worlds holds a 'pending' world for
--                                           the server. FALSE when 032 is not applied.
--
--   Depends on 008 (servers), 019 (aurora.is_aurora_admin()) and 027 (server_config).
--   Uses 032 (aurora.worlds) when it is there; applying 033 before 032 is safe:
--   pending_world_exists answers FALSE until the table exists, and starts answering for
--   real the moment 032 is applied, with no re-run of this file.
--
-- server_config.settings->'Map' is written by aurora-ingest from the .ini
-- (packages/shared/aurora/serverconfig.ts): a JSON array of strings, split on ";",
-- trimmed, a leading backslash stripped, order kept. Anything that is not a string in
-- that array is skipped; a missing row, a missing key or a non-array value is '{}'.
--
-- Safe to run twice. Run it as postgres (the SQL editor). It creates functions and,
-- from T51 (section 3), the map_rebuild_requests table.

-- ============================================================================
-- 1. THE SERVER'S MAP LIST (public)
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.server_maps(p_server TEXT)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((
    SELECT array_agg(a.v #>> '{}' ORDER BY a.ord)
      FROM aurora.server_config c
     CROSS JOIN LATERAL jsonb_array_elements(
             CASE WHEN jsonb_typeof(c.settings -> 'Map') = 'array'
                  THEN c.settings -> 'Map'
                  ELSE '[]'::jsonb END
           ) WITH ORDINALITY AS a(v, ord)
     WHERE c.server_id = p_server
       AND jsonb_typeof(a.v) = 'string'
  ), '{}'::text[]);
$$;

REVOKE ALL ON FUNCTION aurora.server_maps(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.server_maps(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.server_maps(TEXT) IS
  'Public (033): the server''s Map= entries in Map= order (first wins a cell; vanilla is last on the owner''s servers), read from aurora.server_config.settings->''Map''. Strings only; ''{}'' when the server has no config. Every server''s list is public, as on the home page. SECURITY DEFINER because server_config is admin only.';

-- ============================================================================
-- 2. A PENDING WORLD (admins only)
-- ============================================================================
-- plpgsql, not sql: a sql function's body is checked when it is created, and
-- aurora.worlds (032) may not exist yet. The existence test makes it answer FALSE
-- rather than raise until 032 is applied. The gate is the first line: a non-admin
-- (or anon, who has no EXECUTE at all) never learns whether a pending world exists.

CREATE OR REPLACE FUNCTION aurora.pending_world_exists(p_server TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $f$
DECLARE
  found BOOLEAN;
BEGIN
  IF NOT COALESCE(aurora.is_aurora_admin(), FALSE) THEN
    RETURN FALSE;
  END IF;
  IF pg_catalog.to_regclass('aurora.worlds') IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM aurora.worlds w
     WHERE w.server_id = p_server
       AND w.status = 'pending'
  ) INTO found;
  RETURN COALESCE(found, FALSE);
END;
$f$;

REVOKE ALL ON FUNCTION aurora.pending_world_exists(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.pending_world_exists(TEXT) TO authenticated, service_role;

COMMENT ON FUNCTION aurora.pending_world_exists(TEXT) IS
  'Admins only (033): TRUE when aurora.worlds (032) holds a pending world for the server. FALSE for anyone who is not an aurora admin, and FALSE until 032 is applied. The map shows admins a notice from it.';

-- ============================================================================
-- 3. MAP REBUILD REQUESTS (T51)
-- ============================================================================
-- Owner request, 2026-10-02: "If I see the map being wrong I need to have it rebuilt
-- right away". An aurora admin presses Rebuild map on the admin page, which files a row
-- here. The render runs on the owner's PC (T52), which polls with the service role:
-- claim_map_rebuild -> heartbeat_map_rebuild ... -> finish_map_rebuild. A PC that dies
-- mid-render leaves a 'running' row with a stale heartbeat; expire_map_rebuilds marks it
-- failed (the admin reader calls it first, so the panel shows the truth).
--
--   Admin (authenticated, gated by aurora.is_aurora_admin() in the body):
--     request_map_rebuild(p_server, p_note) -> BIGINT        refused while one is open
--     cancel_map_rebuild(p_id)              -> BOOLEAN       only a 'queued' request
--     map_rebuild_requests_admin(p_server, p_limit)          newest first, log tail only
--   Service role only (no client EXECUTE at all):
--     claim_map_rebuild(p_worker)           -> SETOF request (the oldest queued, or none)
--     heartbeat_map_rebuild(p_id, p_log_tail)  -> BOOLEAN    false when no longer running
--     finish_map_rebuild(p_id, p_status, p_log, p_commit_sha) -> BOOLEAN  done|failed
--     expire_map_rebuilds(p_minutes)        -> INT           rows marked failed
--
-- One open (queued or running) request per server is held by the function AND by a
-- partial unique index, so two admins pressing the button at once cannot both win.

CREATE TABLE IF NOT EXISTS aurora.map_rebuild_requests (
  id             BIGSERIAL PRIMARY KEY,
  server_id      TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  requested_by   UUID NULL,
  requested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  maps           TEXT[] NOT NULL,
  workshop_items TEXT[] NOT NULL DEFAULT '{}',
  note           TEXT NULL,
  status         TEXT NOT NULL CHECK (status IN ('queued', 'running', 'done', 'failed', 'cancelled')),
  claimed_at     TIMESTAMPTZ NULL,
  claimed_by     TEXT NULL,
  heartbeat_at   TIMESTAMPTZ NULL,
  finished_at    TIMESTAMPTZ NULL,
  commit_sha     TEXT NULL,
  log            TEXT NULL
);

CREATE INDEX IF NOT EXISTS map_rebuild_requests_server_status_idx
  ON aurora.map_rebuild_requests (server_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS map_rebuild_requests_one_open_idx
  ON aurora.map_rebuild_requests (server_id)
  WHERE status IN ('queued', 'running');

ALTER TABLE aurora.map_rebuild_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.map_rebuild_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.map_rebuild_requests TO service_role;
REVOKE ALL ON SEQUENCE aurora.map_rebuild_requests_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE aurora.map_rebuild_requests_id_seq TO service_role;

COMMENT ON TABLE aurora.map_rebuild_requests IS
  'Map rebuild requests (033, T51): filed by an admin, claimed and finished by the render PC (service role). One queued or running row per server. No client grant; admins read through map_rebuild_requests_admin.';

-- ---------------------------------------------------------------------------
-- 3a. Expire a dead render (service role; the admin reader calls it too)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION aurora.expire_map_rebuilds(p_minutes INT DEFAULT 120)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n INT;
BEGIN
  IF p_minutes IS NULL OR p_minutes < 1 THEN
    RAISE EXCEPTION 'p_minutes must be at least 1' USING ERRCODE = '22023';
  END IF;
  UPDATE aurora.map_rebuild_requests r
     SET status = 'failed',
         finished_at = now(),
         log = 'no heartbeat'
   WHERE r.status = 'running'
     AND COALESCE(r.heartbeat_at, r.claimed_at, r.requested_at)
         < now() - make_interval(mins => p_minutes);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.expire_map_rebuilds(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.expire_map_rebuilds(INT) TO service_role;

COMMENT ON FUNCTION aurora.expire_map_rebuilds(INT) IS
  'Service role (033): a running map rebuild whose last heartbeat is older than p_minutes (default 120) becomes failed with log ''no heartbeat''. Returns the number of rows changed.';

-- ---------------------------------------------------------------------------
-- 3b. Admin: file, cancel, read
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION aurora.request_map_rebuild(p_server TEXT, p_note TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_maps  TEXT[];
  v_items TEXT[];
  v_id    BIGINT;
BEGIN
  IF NOT COALESCE(aurora.is_aurora_admin(), FALSE) THEN
    RAISE EXCEPTION 'map rebuilds: aurora admins only' USING ERRCODE = '42501';
  END IF;
  IF p_server IS NULL OR NOT EXISTS (SELECT 1 FROM aurora.servers s WHERE s.id = p_server) THEN
    RAISE EXCEPTION 'unknown server' USING ERRCODE = 'P0001';
  END IF;

  -- A render that died must not block the next request for ever.
  PERFORM aurora.expire_map_rebuilds(120);

  IF EXISTS (SELECT 1 FROM aurora.map_rebuild_requests r
              WHERE r.server_id = p_server AND r.status IN ('queued', 'running')) THEN
    RAISE EXCEPTION 'A map rebuild is already queued or running for this server.' USING ERRCODE = 'P0001';
  END IF;

  -- The server's maps in Map= order; the two helper entries are not places.
  SELECT COALESCE(array_agg(m.v ORDER BY m.ord), '{}'::text[])
    INTO v_maps
    FROM unnest(aurora.server_maps(p_server)) WITH ORDINALITY AS m(v, ord)
   WHERE m.v NOT IN ('Lawnmower', 'Vehicle Spawn Zones');
  IF cardinality(v_maps) = 0 THEN
    RAISE EXCEPTION 'This server has no Map= list on record yet.' USING ERRCODE = 'P0001';
  END IF;

  -- WorkshopItems is a JSON array of strings (a ;-separated string is tolerated).
  SELECT COALESCE(array_agg(i.v ORDER BY i.ord), '{}'::text[])
    INTO v_items
    FROM (
      SELECT btrim(e.v #>> '{}') AS v, e.ord
        FROM aurora.server_config c
       CROSS JOIN LATERAL jsonb_array_elements(
               CASE WHEN jsonb_typeof(c.settings -> 'WorkshopItems') = 'array'
                    THEN c.settings -> 'WorkshopItems'
                    WHEN jsonb_typeof(c.settings -> 'WorkshopItems') = 'string'
                    THEN to_jsonb(string_to_array(c.settings ->> 'WorkshopItems', ';'))
                    ELSE '[]'::jsonb END
             ) WITH ORDINALITY AS e(v, ord)
       WHERE c.server_id = p_server
         AND jsonb_typeof(e.v) IN ('string', 'number')
    ) i
   WHERE i.v <> '';

  INSERT INTO aurora.map_rebuild_requests (server_id, requested_by, maps, workshop_items, note, status)
  VALUES (p_server, auth.uid(), v_maps, v_items, left(NULLIF(btrim(p_note), ''), 200), 'queued')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION aurora.request_map_rebuild(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.request_map_rebuild(TEXT, TEXT) TO authenticated, service_role;

COMMENT ON FUNCTION aurora.request_map_rebuild(TEXT, TEXT) IS
  'Admins only (033): queue a map rebuild for the server. Stores the Map= list (helpers removed) and the WorkshopItems at request time. Refuses (P0001, readable message) while a queued or running request exists. Returns the request id.';

CREATE OR REPLACE FUNCTION aurora.cancel_map_rebuild(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT COALESCE(aurora.is_aurora_admin(), FALSE) THEN
    RAISE EXCEPTION 'map rebuilds: aurora admins only' USING ERRCODE = '42501';
  END IF;
  UPDATE aurora.map_rebuild_requests r
     SET status = 'cancelled', finished_at = now()
   WHERE r.id = p_id AND r.status = 'queued';
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION aurora.cancel_map_rebuild(BIGINT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.cancel_map_rebuild(BIGINT) TO authenticated, service_role;

COMMENT ON FUNCTION aurora.cancel_map_rebuild(BIGINT) IS
  'Admins only (033): cancel a request that is still queued. TRUE when one was cancelled; FALSE for a request already claimed, finished or unknown.';

CREATE OR REPLACE FUNCTION aurora.map_rebuild_requests_admin(p_server TEXT, p_limit INT DEFAULT 20)
RETURNS SETOF aurora.map_rebuild_requests
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT COALESCE(aurora.is_aurora_admin(), FALSE) THEN
    RETURN;
  END IF;
  PERFORM aurora.expire_map_rebuilds(120);
  RETURN QUERY
    SELECT r.id, r.server_id, r.requested_by, r.requested_at, r.maps, r.workshop_items, r.note,
           r.status, r.claimed_at, r.claimed_by, r.heartbeat_at, r.finished_at, r.commit_sha,
           right(r.log, 4000)
      FROM aurora.map_rebuild_requests r
     WHERE r.server_id = p_server
     ORDER BY r.requested_at DESC, r.id DESC
     LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
END;
$$;

REVOKE ALL ON FUNCTION aurora.map_rebuild_requests_admin(TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.map_rebuild_requests_admin(TEXT, INT) TO authenticated, service_role;

COMMENT ON FUNCTION aurora.map_rebuild_requests_admin(TEXT, INT) IS
  'Admins only (033): the server''s rebuild requests, newest first (p_limit 1..100, default 20), log cut to its last 4000 characters. Expires dead renders first. Zero rows for anyone who is not an admin.';

-- ---------------------------------------------------------------------------
-- 3c. Service role: the render PC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION aurora.claim_map_rebuild(p_worker TEXT)
RETURNS SETOF aurora.map_rebuild_requests
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE aurora.map_rebuild_requests r
     SET status = 'running',
         claimed_by = p_worker,
         claimed_at = now(),
         heartbeat_at = now()
   WHERE r.id = (
           SELECT q.id
             FROM aurora.map_rebuild_requests q
            WHERE q.status = 'queued'
            ORDER BY q.requested_at, q.id
            LIMIT 1
              FOR UPDATE SKIP LOCKED
         )
  RETURNING r.*;
$$;

REVOKE ALL ON FUNCTION aurora.claim_map_rebuild(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.claim_map_rebuild(TEXT) TO service_role;

COMMENT ON FUNCTION aurora.claim_map_rebuild(TEXT) IS
  'Service role (033): the oldest queued rebuild becomes running (claimed_by, claimed_at, heartbeat_at) and is returned; no row when nothing is queued. FOR UPDATE SKIP LOCKED, so two workers never get the same request.';

CREATE OR REPLACE FUNCTION aurora.heartbeat_map_rebuild(p_id BIGINT, p_log_tail TEXT)
RETURNS BOOLEAN
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH u AS (
    UPDATE aurora.map_rebuild_requests r
       SET heartbeat_at = now(),
           log = COALESCE(right(p_log_tail, 20000), r.log)
     WHERE r.id = p_id AND r.status = 'running'
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM u);
$$;

REVOKE ALL ON FUNCTION aurora.heartbeat_map_rebuild(BIGINT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.heartbeat_map_rebuild(BIGINT, TEXT) TO service_role;

COMMENT ON FUNCTION aurora.heartbeat_map_rebuild(BIGINT, TEXT) IS
  'Service role (033): refresh heartbeat_at and keep the last 20000 characters of the render log. TRUE while the request is still running; FALSE when it was expired or is otherwise no longer running (the worker should stop).';

CREATE OR REPLACE FUNCTION aurora.finish_map_rebuild(p_id BIGINT, p_status TEXT, p_log TEXT, p_commit_sha TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('done', 'failed') THEN
    RAISE EXCEPTION 'finish_map_rebuild: status must be done or failed' USING ERRCODE = '22023';
  END IF;
  UPDATE aurora.map_rebuild_requests r
     SET status = p_status,
         finished_at = now(),
         log = COALESCE(right(p_log, 20000), r.log),
         commit_sha = left(p_commit_sha, 64)
   WHERE r.id = p_id AND r.status = 'running';
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION aurora.finish_map_rebuild(BIGINT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.finish_map_rebuild(BIGINT, TEXT, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION aurora.finish_map_rebuild(BIGINT, TEXT, TEXT, TEXT) IS
  'Service role (033): close a running rebuild as done or failed (any other status raises 22023), with the log tail and the commit sha. TRUE when a running row was closed.';
