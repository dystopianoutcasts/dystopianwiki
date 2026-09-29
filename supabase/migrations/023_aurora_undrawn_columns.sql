-- Migration 023: Columns the map never draws stop being public
-- Created: 2026-09-29
-- Description: T36 / VISIBILITY.md's rule: a column that is fetched but never
--              drawn is "the rest", and the rest is admin-only. Two tables
--              still hand such columns to everyone:
--                - aurora.safehouses: players (member list), last_visited,
--                  created_at.
--                - aurora.map_objects: meta.
--              VISIBILITY.md rows implemented: "Safehouse: member list, last
--              visited, created" and "Map objects: meta", both "NO" for
--              PUBLIC, "yes" for ADMIN. Depends on 008 (tables), 009 (the
--              grants being narrowed), 019 (aurora.is_aurora_admin()).
--
-- PRECONDITION (VISIBILITY.md, "Order that cannot be changed" - a swapped
-- policy returns zero rows, harmless; a revoked column fails every request
-- that names it): this migration must not be applied until the T34 map build
-- is the one `/map/` serves. The build live on 2026-09-29 selected
-- `server_id,id,x,y,w,h,owner,title,players` from safehouses; the T34 build
-- selects `server_id,id,x,y,w,h,owner,title` (no `players`) and never selects
-- `meta` from map_objects at all. Applying this against the OLD build would
-- make every safehouse request from an anonymous or ordinary signed-in client
-- fail with Postgres error 42501 ("permission denied for table safehouses"),
-- which PostgREST returns as HTTP 403 with body
-- {"code":"42501","details":null,"hint":null,"message":"permission denied for
-- table safehouses"} - the safehouse layer would disappear from the public
-- map entirely, not just lose one column. T36's own precondition check
-- (`supabase/tests/aurora_policies.sql` is not the place for it; the executing
-- session proves it against the live built JS bundle before applying) is what
-- gates this.
--
-- One transaction; every statement is its own REVOKE/GRANT or
-- CREATE-OR-REPLACE, so this file is safe to run twice.

-- ============================================================================
-- 1. SAFEHOUSES - drop the member list and the two timestamps
-- ============================================================================
-- Row policy is untouched ("aurora safehouses are publicly readable", USING
-- (TRUE), from 009): everyone still sees every safehouse row, just not the
-- three columns nobody draws. aurora.visible_live_usernames() (008) reads
-- s.players and s.owner directly, but it is SECURITY DEFINER, so it runs with
-- the privileges of the function's owner, not the caller's - this REVOKE does
-- not touch it.

REVOKE SELECT ON aurora.safehouses FROM anon, authenticated;

GRANT SELECT (server_id, id, x, y, w, h, owner, title)
  ON aurora.safehouses TO anon, authenticated;

-- ============================================================================
-- 2. MAP OBJECTS - drop meta
-- ============================================================================
-- Row policy is untouched ("aurora map objects are publicly readable", USING
-- (TRUE), from 009).

REVOKE SELECT ON aurora.map_objects FROM anon, authenticated;

GRANT SELECT (id, server_id, kind, x, y, label)
  ON aurora.map_objects TO anon, authenticated;

-- ============================================================================
-- 3. ADMIN ACCESS TO THE FULL ROWS
-- ============================================================================
-- A table-level column grant cannot be narrowed for `authenticated` while an
-- admin who is also `authenticated` keeps the wide grant - it is the same
-- database role. So the admin path to the full row (players/last_visited/
-- created_at, meta) is a SECURITY DEFINER function, the same pattern 018's
-- aurora.positions_delayed() and 022's aurora.vehicles_public() use: it reads
-- with the function owner's privileges, then gates the result on
-- aurora.is_aurora_admin() itself rather than relying on a column grant. No
-- client calls either function yet; they exist so the admin's access to the
-- full row is not lost when the column grant above is narrowed.

CREATE OR REPLACE FUNCTION aurora.safehouses_admin()
RETURNS SETOF aurora.safehouses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT * FROM aurora.safehouses WHERE aurora.is_aurora_admin();
$$;

REVOKE ALL ON FUNCTION aurora.safehouses_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.safehouses_admin() TO authenticated, service_role;

COMMENT ON FUNCTION aurora.safehouses_admin() IS
  'Full safehouse rows (players, last_visited, created_at included) for aurora admins only. Empty for anyone else, since the WHERE clause is the gate, not a grant. SECURITY DEFINER so it is unaffected by the narrowed column grant above.';

CREATE OR REPLACE FUNCTION aurora.map_objects_admin()
RETURNS SETOF aurora.map_objects
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT * FROM aurora.map_objects WHERE aurora.is_aurora_admin();
$$;

REVOKE ALL ON FUNCTION aurora.map_objects_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.map_objects_admin() TO authenticated, service_role;

COMMENT ON FUNCTION aurora.map_objects_admin() IS
  'Full map_objects rows (meta included) for aurora admins only. Empty for anyone else, since the WHERE clause is the gate, not a grant. SECURITY DEFINER so it is unaffected by the narrowed column grant above.';
