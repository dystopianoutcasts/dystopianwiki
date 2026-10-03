-- Migration 035: kill leaderboard
-- Created: 2026-10-02
-- Description: the site's "Kill leaderboard" (T57 backend, T58 section) reads one public function,
--   aurora.kill_leaderboard(server, limit). It ranks players by the sum of their lives'
--   kills in the server's current world (the season). aurora.lives.kills is a running
--   maximum of the exporter's zk counter per life (034), so the sum over a player's
--   lives is the season total, a death or a new character never takes kills away.
--   Depends on 032 (worlds, aurora.is_current_world semantics) and 034 (aurora.lives
--   and its (server_id, world_id, kills DESC) index).
--
-- Contract (every key always present):
--   {"world_seq": 1, "players": 9, "total_kills": 1234,
--    "rows": [{"rank": 1, "name": "Skye", "kills": 412, "best_life": 311,
--              "lives": 3, "alive": true, "online": true}, ...]}
--   * Current world only; an untagged life (world_id NULL) counts as current, as in
--     aurora.is_current_world. world_seq is NULL when the server has no current world.
--   * One row per username with SUM(kills) > 0. best_life is the largest single life,
--     lives the count of that player's lives in the world (zero-kill lives included),
--     alive = an open life and players.is_dead IS NOT TRUE, online = players.online.
--   * rank = RANK() over kills, so equal totals share a rank; rows are ordered by
--     kills DESC, name. p_limit is clamped to 1..100 (NULL or out of range: 10).
--     players and total_kills cover the whole world, not only the returned rows.
--   * Public surface: the display name (else the username), no faction members, no
--     coordinates.
--
-- ORDER: after 034. Until it is applied the site shows a quiet fallback.
-- Safe to run twice. Run it as postgres (the SQL editor).

CREATE OR REPLACE FUNCTION aurora.kill_leaderboard(p_server TEXT, p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur   TEXT;
  v_seq   INT;
  v_limit INT;
  v_out   JSONB;
BEGIN
  v_limit := CASE WHEN p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN 10 ELSE p_limit END;

  -- The world id is read once and compared as a value (the 034 pattern; it keeps the
  -- (server_id, world_id, kills) index usable).
  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server;
  IF v_cur IS NOT NULL THEN
    SELECT w.seq INTO v_seq
      FROM aurora.worlds w
     WHERE w.server_id = p_server AND w.world_id = v_cur;
  END IF;

  WITH per_player AS (
    SELECT l.username,
           sum(l.kills)::BIGINT AS kills,
           max(l.kills)         AS best_life,
           count(*)::INT        AS lives,
           bool_or(l.ended_at IS NULL) AS open_life
      FROM aurora.lives l
     WHERE l.server_id = p_server
       AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
     GROUP BY l.username
    HAVING sum(l.kills) > 0
  ),
  named AS (
    SELECT COALESCE(NULLIF(btrim(p.display_name), ''), g.username) AS name,
           g.kills, g.best_life, g.lives,
           (g.open_life AND p.is_dead IS NOT TRUE) AS alive,
           (p.online IS TRUE) AS online,
           rank() OVER (ORDER BY g.kills DESC)::INT AS rank
      FROM per_player g
      LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = g.username
  ),
  top AS (
    SELECT * FROM named ORDER BY kills DESC, name LIMIT v_limit
  )
  SELECT jsonb_build_object(
           'world_seq', v_seq,
           'players', (SELECT count(*) FROM named),
           'total_kills', (SELECT COALESCE(sum(n.kills), 0)::BIGINT FROM named n),
           'rows', COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'rank', t.rank, 'name', t.name, 'kills', t.kills,
                        'best_life', t.best_life, 'lives', t.lives,
                        'alive', t.alive, 'online', t.online)
                      ORDER BY t.kills DESC, t.name) FROM top t), '[]'::jsonb))
    INTO v_out;
  RETURN v_out;
END;
$$;

REVOKE ALL ON FUNCTION aurora.kill_leaderboard(TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.kill_leaderboard(TEXT, INT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.kill_leaderboard(TEXT, INT) IS
  'Public (035): the current world''s kill leaderboard as one JSON object, every key always present: world_seq (null without a current world), players and total_kills (whole world), rows [{rank, name, kills, best_life, lives, alive, online}] ordered by kills DESC then name, ties share a rank, at most p_limit (1..100, else 10). Players with no kills are absent. Display name else username only.';
