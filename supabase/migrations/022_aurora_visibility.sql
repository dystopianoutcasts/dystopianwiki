-- Migration 022: Admin-only data, and a public vehicle surface without the driver
-- Created: 2026-09-29
-- Description: T35 / the owner's visibility rule, 2026-09-29: "The map and the
--              map info like players, cars, streets, and those things should
--              be public. The rest let's have as admin-only (private)." See
--              VISIBILITY.md for the full matrix; this migration implements
--              exactly the two rows marked T35 there:
--                1. aurora.health_samples, aurora.servers, aurora.item_catalog
--                   go from "public, USING (TRUE)" to admin-only.
--                2. aurora.vehicles gains a public surface (type and position,
--                   never the driver) through a new function and view, the
--                   same SECURITY DEFINER pattern 018 uses for positions.
--              Depends on 008 (tables), 009 (the policies being swapped, the
--              vehicles table and its existing grants/policies, untouched),
--              019 (aurora.is_aurora_admin()).
--
-- Grants on health_samples/servers/item_catalog are kept exactly as 009 left
-- them (GRANT SELECT ... TO anon, authenticated): only the POLICY changes, from
-- "USING (TRUE)" to "USING (aurora.is_aurora_admin())". A kept grant with a
-- narrowed policy returns zero rows and HTTP 200 to a non-admin; a revoked
-- grant would instead return HTTP 400/403 to every map build that still names
-- the column, which is exactly the mistake VISIBILITY.md's "order that cannot
-- be changed" warns against. Revoking columns nobody draws is T36, applied
-- only after the T34 build (which stops asking for them) is live.
--
-- One transaction; every statement is its own DROP-then-CREATE or
-- CREATE-OR-REPLACE, so this file is safe to run twice and safe whether or not
-- 020/021 have been applied yet (neither is referenced here).

-- ============================================================================
-- 1. HEALTH SAMPLES, SERVERS, ITEM CATALOG -> ADMIN ONLY
-- ============================================================================
-- No client reads aurora.servers or aurora.item_catalog today; the map reads
-- aurora.health_samples in three queries, all now gated behind T34's
-- `enabled: isAdmin`, so a pre-T34 build simply sees zero rows where it used
-- to see live ones ("No health data has been reported yet.", not an error).

DROP POLICY IF EXISTS "aurora health samples are publicly readable" ON aurora.health_samples;
DROP POLICY IF EXISTS "aurora admins read health samples"           ON aurora.health_samples;
CREATE POLICY "aurora admins read health samples"
  ON aurora.health_samples FOR SELECT
  USING (aurora.is_aurora_admin());

DROP POLICY IF EXISTS "aurora servers are publicly readable" ON aurora.servers;
DROP POLICY IF EXISTS "aurora admins read servers"           ON aurora.servers;
CREATE POLICY "aurora admins read servers"
  ON aurora.servers FOR SELECT
  USING (aurora.is_aurora_admin());

DROP POLICY IF EXISTS "aurora item catalog is publicly readable" ON aurora.item_catalog;
DROP POLICY IF EXISTS "aurora admins read item catalog"          ON aurora.item_catalog;
CREATE POLICY "aurora admins read item catalog"
  ON aurora.item_catalog FOR SELECT
  USING (aurora.is_aurora_admin());

-- ============================================================================
-- 2. VEHICLES -> A PUBLIC SURFACE WITHOUT THE DRIVER
-- ============================================================================
-- aurora.vehicles itself, its two existing policies ("aurora admins see all
-- vehicles", "aurora users see vehicles driven by visible characters") and its
-- GRANT SELECT to `authenticated` (no grant to `anon`) are left exactly as 009
-- made them: admins and the driver's own linked/safehouse viewers keep reading
-- the full table, driver included, the same way they always have. This adds a
-- second, narrower path anyone - including anon - may read from instead.

CREATE OR REPLACE FUNCTION aurora.vehicles_public()
RETURNS TABLE (
  server_id   TEXT,
  vehicle_id  INT,
  script_name TEXT,
  x           REAL,
  y           REAL,
  z           REAL,
  t           TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT v.server_id,
         v.vehicle_id,
         v.script_name,
         v.x,
         v.y,
         v.z,
         v.t
    FROM aurora.vehicles v;
$$;

REVOKE ALL ON FUNCTION aurora.vehicles_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.vehicles_public() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.vehicles_public() IS
  'Every vehicle''s type and position, no driver_username and no way to filter by it. SECURITY DEFINER so anon and authenticated can read it despite aurora.vehicles itself having no anon grant. The public half of VISIBILITY.md''s vehicles row (T35); the admin half is still the full aurora.vehicles table via its own 009 policies.';

CREATE OR REPLACE VIEW aurora.vehicles_visible
WITH (security_invoker = TRUE) AS
  SELECT * FROM aurora.vehicles_public();

GRANT SELECT ON aurora.vehicles_visible TO anon, authenticated;

COMMENT ON VIEW aurora.vehicles_visible IS
  'The map reads this, not aurora.vehicles directly: every vehicle''s type and position, never the driver. security_invoker so the caller''s own EXECUTE grant on vehicles_public() is what is actually being checked, same as 018''s player_positions_visible.';
