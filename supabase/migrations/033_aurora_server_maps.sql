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
-- Safe to run twice. Run it as postgres (the SQL editor). It creates functions only.

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
