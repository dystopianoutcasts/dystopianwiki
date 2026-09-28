-- Migration 010: OutcastAurora Views and Functions
-- Created: 2026-09-28
-- Description: players_public, the player_positions_visible visibility view,
--              consume_link_code(), prune_history().
--              Depends on 008 (tables, helpers) and 009 (grants, policies).

-- ============================================================================
-- players_public
-- ============================================================================
-- Convenience view over the columns anon and authenticated were granted in 009.
-- It is SECURITY INVOKER, so it is not a privilege escalation: it works only
-- because the caller already holds those exact column privileges.

CREATE OR REPLACE VIEW aurora.players_public
WITH (security_invoker = TRUE) AS
  SELECT p.server_id,
         p.username,
         p.display_name,
         p.first_seen,
         p.last_seen,
         p.online,
         p.hours_survived,
         p.access_level,
         p.is_dead
    FROM aurora.players p;

GRANT SELECT ON aurora.players_public TO anon, authenticated;

COMMENT ON VIEW aurora.players_public IS
  'Player roster without linked_user_id or last_saved_x/y. Security invoker.';

-- ============================================================================
-- positions_delayed()
-- ============================================================================
-- The delayed, cell-rounded feed. SECURITY DEFINER because 009 grants no client
-- role direct read of aurora.player_position_history - and that is the whole
-- design: this function is the ONLY path from history to a client, and it rounds
-- before it returns, so exact coordinates cannot escape through it no matter what
-- the caller asks for.
--
-- Fail-closed properties worth keeping if this is ever edited:
--   * no settings row named 'visibility' -> `vis` is empty -> zero rows.
--   * anonymous caller and anonPositions false -> `gate` is empty -> zero rows.
--   * every column reference is alias-qualified, so no RETURNS TABLE output name
--     can be mistaken for a column of the same name.

CREATE OR REPLACE FUNCTION aurora.positions_delayed()
RETURNS TABLE (server_id TEXT, username TEXT, x REAL, y REAL, z REAL, t TIMESTAMPTZ)
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
     WHERE h.t <= NOW() - make_interval(mins => g.delay_minutes)
     ORDER BY h.server_id, h.username, h.t DESC
  )
  SELECT l.server_id,
         l.username,
         CASE WHEN g.round_cell THEN aurora.round_to_cell(l.x) ELSE l.x END,
         CASE WHEN g.round_cell THEN aurora.round_to_cell(l.y) ELSE l.y END,
         l.z,
         l.t
    FROM latest l
    CROSS JOIN gate g;
$$;

REVOKE ALL ON FUNCTION aurora.positions_delayed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.positions_delayed() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.positions_delayed() IS
  'Latest position per character, older than settings.visibility.delayMinutes and rounded to cell. The only client-reachable path to player_position_history.';

-- ============================================================================
-- player_positions_visible
-- ============================================================================
-- The view the map application reads. SECURITY INVOKER, so the 009 policies on
-- aurora.player_positions decide the live half, and auth.uid() resolves to the
-- caller in both halves.
--
--   admin                -> every character, live and exact (live half)
--   own linked character -> live and exact                  (live half)
--   same-safehouse peer  -> live and exact                  (live half)
--   everyone else        -> rounded to cell, delayed        (delayed half)
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
         TRUE AS is_delayed,
         TRUE AS is_rounded
    FROM aurora.positions_delayed() d
   WHERE NOT EXISTS (
     SELECT 1
       FROM aurora.player_positions pp2
      WHERE pp2.server_id = d.server_id
        AND pp2.username  = d.username
   );

GRANT SELECT ON aurora.player_positions_visible TO anon, authenticated;

COMMENT ON VIEW aurora.player_positions_visible IS
  'Per-caller player positions: live for own characters, safehouse peers and admins; rounded to cell and delayed for everyone else.';

-- ============================================================================
-- consume_link_code()
-- ============================================================================
-- Binds an in-game username to the website account that generated the code. The
-- ingest Edge Function calls this with service_role after it sees the code in
-- chat, so EXECUTE is granted to service_role only - a client must never be able
-- to bind an arbitrary username to itself.
--
-- The third parameter is an addition to the T07 signature: aurora.players is keyed
-- on (server_id, username), so a two-argument call has to resolve the server. It
-- defaults to NULL and resolves automatically when exactly one server has that
-- username, which keeps `consume_link_code(code, username)` working as specified
-- and raises rather than guessing when it is ambiguous.

CREATE OR REPLACE FUNCTION aurora.consume_link_code(
  p_code      TEXT,
  p_username  TEXT,
  p_server_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
DECLARE
  -- Codes are read aloud in chat and typed by hand; a short life is the point.
  c_ttl_minutes CONSTANT INT := 30;
  v_user_id   UUID;
  v_created   TIMESTAMPTZ;
  v_consumed  TIMESTAMPTZ;
  v_server_id TEXT := p_server_id;
  v_matches   INT;
BEGIN
  IF p_code IS NULL OR p_username IS NULL THEN
    RAISE EXCEPTION 'consume_link_code: code and username are both required';
  END IF;

  SELECT lc.user_id, lc.created_at, lc.consumed_at
    INTO v_user_id, v_created, v_consumed
    FROM aurora.link_codes lc
   WHERE lc.code = upper(trim(p_code))
   FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'consume_link_code: unknown code';
  END IF;

  IF v_consumed IS NOT NULL THEN
    RAISE EXCEPTION 'consume_link_code: code was already used';
  END IF;

  IF v_created < NOW() - make_interval(mins => c_ttl_minutes) THEN
    RAISE EXCEPTION 'consume_link_code: code expired after % minutes', c_ttl_minutes;
  END IF;

  IF v_server_id IS NULL THEN
    SELECT count(*), min(p.server_id)
      INTO v_matches, v_server_id
      FROM aurora.players p
     WHERE p.username = p_username;

    IF v_matches = 0 THEN
      RAISE EXCEPTION 'consume_link_code: no player named % on any server', p_username;
    ELSIF v_matches > 1 THEN
      RAISE EXCEPTION 'consume_link_code: % exists on % servers, pass p_server_id', p_username, v_matches;
    END IF;
  END IF;

  UPDATE aurora.players p
     SET linked_user_id = v_user_id
   WHERE p.server_id = v_server_id
     AND p.username  = p_username;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'consume_link_code: no player % on server %', p_username, v_server_id;
  END IF;

  UPDATE aurora.link_codes lc
     SET consumed_at = NOW(),
         username    = p_username
   WHERE lc.code = upper(trim(p_code));

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION aurora.consume_link_code(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.consume_link_code(TEXT, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION aurora.consume_link_code(TEXT, TEXT, TEXT) IS
  'Service role only. Binds an in-game username to the account that generated the code. Codes expire 30 minutes after creation and are single use.';

-- ============================================================================
-- prune_history()
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.prune_history(p_days INT DEFAULT 30)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
DECLARE
  v_deleted BIGINT;
BEGIN
  IF p_days IS NULL OR p_days < 1 THEN
    RAISE EXCEPTION 'prune_history: p_days must be at least 1, got %', p_days;
  END IF;

  DELETE FROM aurora.player_position_history h
   WHERE h.t < NOW() - make_interval(days => p_days);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION aurora.prune_history(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.prune_history(INT) TO service_role;

COMMENT ON FUNCTION aurora.prune_history(INT) IS
  'Delete player_position_history rows older than p_days. Returns the row count. Scoped to history only; health_samples are kept.';
