-- Migration 018: Positions online-only, honest delayed/rounded flags
-- Created: 2026-09-29
-- Description: T25 / T16 P0-2, P2-1. aurora.positions_delayed() stops returning
--              a character's last known spot after they log off, and the
--              delayed half of aurora.player_positions_visible stops claiming
--              every such row is delayed and rounded when the live settings say
--              otherwise. Depends on 008 (tables), 009 (grants, policies),
--              010 (the function and view being replaced here).
--
-- Before this migration, aurora.positions_delayed() took the newest history row
-- per character older than delayMinutes with NO check on aurora.players.online:
-- a character who logged off hours ago was still returned at their exact last
-- logout spot forever (T16 finding P0-2). The view also hard-coded
-- is_delayed/is_rounded TRUE on that half regardless of settings.visibility, so
-- with the live settings (delayMinutes 0, roundToCell false) the map drew a
-- live, exact position as if it were stale and fuzzed (T16 finding P2-1).
--
-- The RETURNS TABLE shape changes (two new columns), so the function must be
-- dropped before it can be recreated; the view depends on the function, so it
-- must be dropped first, in this order: DROP VIEW, DROP FUNCTION, CREATE
-- FUNCTION, CREATE VIEW, re-grant, re-comment.

DROP VIEW IF EXISTS aurora.player_positions_visible;
DROP FUNCTION IF EXISTS aurora.positions_delayed();

-- ============================================================================
-- positions_delayed()
-- ============================================================================
-- Same fail-closed properties as 010, plus a third:
--   * no settings row named 'visibility' -> `vis` is empty -> zero rows.
--   * anonymous caller and anonPositions false -> `gate` is empty -> zero rows.
--   * a character whose aurora.players.online is not TRUE -> excluded by the
--     JOIN below, no matter how recent their history is.
--   * every column reference is alias-qualified, so no RETURNS TABLE output name
--     can be mistaken for a column of the same name.

CREATE OR REPLACE FUNCTION aurora.positions_delayed()
RETURNS TABLE (
  server_id  TEXT,
  username   TEXT,
  x          REAL,
  y          REAL,
  z          REAL,
  t          TIMESTAMPTZ,
  is_delayed BOOLEAN,
  is_rounded BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  WITH vis AS (
    SELECT COALESCE((s.value->>'delayMinutes')::INT, 30)       AS delay_minutes,
           COALESCE((s.value->>'roundToCell')::BOOLEAN, TRUE)  AS round_cell,
           COALESCE((s.value->>'anonPositions')::BOOLEAN, FALSE) AS anon_ok
      FROM aurora.settings s
     WHERE s.key = 'visibility'
  ),
  gate AS (
    SELECT v.delay_minutes, v.round_cell
      FROM vis v
     WHERE auth.uid() IS NOT NULL OR v.anon_ok
  ),
  latest AS (
    SELECT DISTINCT ON (h.server_id, h.username)
           h.server_id AS server_id,
           h.username  AS username,
           h.x         AS x,
           h.y         AS y,
           h.z         AS z,
           h.t         AS t
      FROM aurora.player_position_history h
      CROSS JOIN gate g
      JOIN aurora.players p
        ON p.server_id = h.server_id
       AND p.username  = h.username
       AND p.online
     WHERE h.t <= NOW() - make_interval(mins => g.delay_minutes)
     ORDER BY h.server_id, h.username, h.t DESC
  )
  SELECT l.server_id,
         l.username,
         CASE WHEN g.round_cell THEN aurora.round_to_cell(l.x) ELSE l.x END,
         CASE WHEN g.round_cell THEN aurora.round_to_cell(l.y) ELSE l.y END,
         l.z,
         l.t,
         g.delay_minutes > 0 AS is_delayed,
         g.round_cell        AS is_rounded
    FROM latest l
    CROSS JOIN gate g;
$$;

REVOKE ALL ON FUNCTION aurora.positions_delayed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.positions_delayed() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.positions_delayed() IS
  'Latest position per ONLINE character, older than settings.visibility.delayMinutes, rounded to cell, with is_delayed/is_rounded reflecting the live settings rather than fixed constants. Offline characters (aurora.players.online = false) are never returned. The only client-reachable path to player_position_history.';

-- ============================================================================
-- player_positions_visible
-- ============================================================================
-- Unchanged shape and rule set from 010 except the delayed half now carries
-- through positions_delayed()'s own is_delayed/is_rounded instead of the two
-- hard-coded TRUE constants, and positions_delayed() itself now excludes
-- offline characters.
--
--   admin                -> every character, live and exact (live half)
--   own linked character -> live and exact                  (live half)
--   same-safehouse peer  -> live and exact                  (live half)
--   everyone else, ONLINE -> reflects settings.visibility    (delayed half)
--   offline characters   -> never returned, either half
--   anonymous            -> nothing, unless anonPositions is true
--
-- The NOT EXISTS guard is itself RLS-filtered, so it suppresses the delayed row
-- only for characters this caller can already see live.

CREATE OR REPLACE VIEW aurora.player_positions_visible
WITH (security_invoker = TRUE) AS
  SELECT pp.server_id,
         pp.username,
         pp.x,
         pp.y,
         pp.z,
         pp.t,
         pp.vehicle_id,
         FALSE AS is_delayed,
         FALSE AS is_rounded
    FROM aurora.player_positions pp
  UNION ALL
  SELECT d.server_id,
         d.username,
         d.x,
         d.y,
         d.z,
         d.t,
         NULL::INT AS vehicle_id,
         d.is_delayed,
         d.is_rounded
    FROM aurora.positions_delayed() d
   WHERE NOT EXISTS (
     SELECT 1
       FROM aurora.player_positions pp2
      WHERE pp2.server_id = d.server_id
        AND pp2.username  = d.username
   );

GRANT SELECT ON aurora.player_positions_visible TO anon, authenticated;

COMMENT ON VIEW aurora.player_positions_visible IS
  'Per-caller player positions: live for own characters, safehouse peers and admins; for everyone else, online only, with is_delayed/is_rounded reflecting settings.visibility rather than fixed constants. Offline characters never appear.';
