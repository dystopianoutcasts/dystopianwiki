-- Migration 009: OutcastAurora Row Level Security
-- Created: 2026-09-28
-- Description: RLS on every aurora table, plus the only client-facing grants.
--              Depends on the helper functions at the bottom of 008.
--
-- The model, in one paragraph:
--   A client role only ever gets SELECT, and only on the columns named here. RLS
--   then narrows the rows. A table with a grant but no policy for a role returns
--   ZERO ROWS for that role - that is how `player_positions` stays invisible to
--   anon while still being readable by the security-invoker view in 010. Writes
--   have no policies at all: the ingest Edge Function uses service_role, which
--   carries BYPASSRLS. The one exception is aurora.link_codes, where a signed-in
--   user may insert a row for themselves.

-- ============================================================================
-- ENABLE RLS ON EVERY TABLE
-- ============================================================================

ALTER TABLE aurora.servers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.health_samples          ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.players                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.player_positions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.player_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.vehicles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.safehouses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.zones                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.zombie_grid             ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.map_objects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.item_catalog            ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.link_codes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.settings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.ingest_cursor           ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLICLY READABLE TABLES
-- ============================================================================

GRANT SELECT ON aurora.servers        TO anon, authenticated;
GRANT SELECT ON aurora.health_samples TO anon, authenticated;
GRANT SELECT ON aurora.safehouses     TO anon, authenticated;
GRANT SELECT ON aurora.zones          TO anon, authenticated;
GRANT SELECT ON aurora.zombie_grid    TO anon, authenticated;
GRANT SELECT ON aurora.map_objects    TO anon, authenticated;
GRANT SELECT ON aurora.item_catalog   TO anon, authenticated;

CREATE POLICY "aurora servers are publicly readable"
  ON aurora.servers FOR SELECT USING (TRUE);

CREATE POLICY "aurora health samples are publicly readable"
  ON aurora.health_samples FOR SELECT USING (TRUE);

CREATE POLICY "aurora safehouses are publicly readable"
  ON aurora.safehouses FOR SELECT USING (TRUE);

CREATE POLICY "aurora zones are publicly readable"
  ON aurora.zones FOR SELECT USING (TRUE);

CREATE POLICY "aurora zombie grid is publicly readable"
  ON aurora.zombie_grid FOR SELECT USING (TRUE);

CREATE POLICY "aurora map objects are publicly readable"
  ON aurora.map_objects FOR SELECT USING (TRUE);

CREATE POLICY "aurora item catalog is publicly readable"
  ON aurora.item_catalog FOR SELECT USING (TRUE);

-- ============================================================================
-- PLAYERS - public rows, restricted columns
-- ============================================================================
-- Column-level grants, not a view, are what actually hide the private columns:
-- a security-invoker view over this table would still need the underlying column
-- privilege, so `aurora.players_public` in 010 works precisely because the grant
-- below covers exactly its column list and nothing more.
--
-- linked_user_id is withheld for the obvious reason. last_saved_x and
-- last_saved_y are withheld too, which is a deliberate departure from the T07
-- task text ("all columns except linked_user_id"): they are the exact,
-- undelayed, un-rounded coordinates of a character's last save, so publishing
-- them would defeat the entire visibility design that 010 implements. Reversible
-- with one GRANT if the owner wants them public.

GRANT SELECT (
  server_id, username, display_name, first_seen, last_seen,
  online, hours_survived, access_level, is_dead
) ON aurora.players TO anon, authenticated;

CREATE POLICY "aurora players are publicly readable"
  ON aurora.players FOR SELECT USING (TRUE);

COMMENT ON POLICY "aurora players are publicly readable" ON aurora.players
  IS 'All rows; column grants restrict which columns anon and authenticated may read.';

-- ============================================================================
-- PLAYER POSITIONS - live, narrow
-- ============================================================================
-- SELECT is granted to anon so that the security-invoker view in 010 does not
-- error for anonymous visitors; anon has no policy here, so it reads zero rows.
-- Realtime honours the same policies, so an anonymous subscriber gets nothing.

GRANT SELECT ON aurora.player_positions TO anon, authenticated;

CREATE POLICY "aurora admins see all live positions"
  ON aurora.player_positions FOR SELECT
  USING (aurora.is_aurora_admin());

CREATE POLICY "aurora users see own and safehouse live positions"
  ON aurora.player_positions FOR SELECT
  TO authenticated
  USING (
    (server_id, username) IN (
      SELECT v.server_id, v.username FROM aurora.visible_live_usernames() v
    )
  );

COMMENT ON POLICY "aurora users see own and safehouse live positions" ON aurora.player_positions
  IS 'Own linked characters plus anyone sharing a safehouse with them. Everyone else arrives rounded and delayed through aurora.player_positions_visible.';

-- ============================================================================
-- PLAYER POSITION HISTORY - admins only, directly
-- ============================================================================
-- No grant to anon at all: anonymous access is not merely filtered, it is absent.
-- authenticated gets the grant so the admin policy below can apply, and nothing
-- else: the delayed public feed reaches clients only through the SECURITY DEFINER
-- function aurora.positions_delayed() in 010, which rounds before returning. That
-- indirection is the point - a direct grant here would hand out exact coordinates
-- 30 minutes late, which is not what the visibility rule says.

GRANT SELECT ON aurora.player_position_history TO authenticated;

CREATE POLICY "aurora admins see all position history"
  ON aurora.player_position_history FOR SELECT
  USING (aurora.is_aurora_admin());

-- ============================================================================
-- VEHICLES
-- ============================================================================
-- Same live-visibility rule as player_positions, keyed on the driver. A vehicle
-- with no driver is admin-only: a parked car still marks a base, so the
-- conservative default is to hide it. See the open question in STATUS.md.

GRANT SELECT ON aurora.vehicles TO authenticated;

CREATE POLICY "aurora admins see all vehicles"
  ON aurora.vehicles FOR SELECT
  USING (aurora.is_aurora_admin());

CREATE POLICY "aurora users see vehicles driven by visible characters"
  ON aurora.vehicles FOR SELECT
  TO authenticated
  USING (
    driver_username IS NOT NULL
    AND (server_id, driver_username) IN (
      SELECT v.server_id, v.username FROM aurora.visible_live_usernames() v
    )
  );

-- ============================================================================
-- SETTINGS - allowlisted keys only
-- ============================================================================
-- Deny-by-default on a key/value table: a future key holding anything sensitive
-- must not become public because someone inserted it. Add keys to this list
-- consciously.

GRANT SELECT ON aurora.settings TO anon, authenticated;

CREATE POLICY "aurora public settings are readable"
  ON aurora.settings FOR SELECT
  USING (key IN ('visibility'));

COMMENT ON POLICY "aurora public settings are readable" ON aurora.settings
  IS 'Allowlist. New settings keys are private until added here.';

-- ============================================================================
-- LINK CODES - a user manages only their own
-- ============================================================================
-- INSERT is granted on user_id only, so `code` must come from its DEFAULT
-- (aurora.gen_link_code()) and a client cannot choose its own code. No UPDATE or
-- DELETE policy exists: consumption happens in aurora.consume_link_code(), which
-- only service_role may execute.

GRANT SELECT             ON aurora.link_codes TO authenticated;
GRANT INSERT (user_id)   ON aurora.link_codes TO authenticated;

CREATE POLICY "aurora users read own link codes"
  ON aurora.link_codes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "aurora users create own link codes"
  ON aurora.link_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- INGEST CURSOR - service role only
-- ============================================================================
-- RLS is enabled and no policy or grant exists for anon or authenticated.
