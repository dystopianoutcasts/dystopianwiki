-- Migration 037: leaderboard parity - the mod source lists exactly what the game's window lists
-- Created: 2026-10-03
-- Description: when aurora.leaderboard() reads the in-game DystopianQoL table (source
--   "mod"), its three lists are the window's lists, row for row. The window
--   (DystopianQoL client/DQOL_Leaderboard_Window.lua, lines 182-207):
--     * lists every entry of data.players, zeros included (a player with no kills reads
--       0 on Kills; a dead player's Survival reads 0h because liveHours resets at death);
--     * sorts each tab by its number, descending, with table.sort (ties in no defined
--       order);
--     * numbers the rows 1..n by position: no shared ranks;
--     * draws at most 50 rows (MAX_ROWS).
--   036 left zero rows out, kept only alive players on survival and gave ties a shared
--   RANK(). Those rules are right for Aurora's own count and stay there.
--
-- What changes (only aurora.leaderboard, only the source = "mod" branch):
--   kills    every entry of the current world, total = banked_kills + live_kills, zeros kept.
--   deaths   every entry, deaths = banked_deaths, zeros kept.
--   survival every entry, hours = live_hours rounded to 0.1, zeros kept, dead players
--            included (their hours are what the table holds, 0 after a death); `alive`
--            still says whether the player is alive (036's rule).
--   rank     ROW_NUMBER (1..n) over the number DESC, then username ASC. The game's tie
--            order is undefined; username is the deterministic stand-in.
--
-- Unchanged: the source = "aurora" branch (copied from 036 byte for byte: zeros left
-- out, survival alive only, RANK() ties), source selection, seen_at, world_seq, the
-- JSON shape, p_limit (default 10, clamped to 1..100, NULL or out of range means 10;
-- the site asks for 50, the window's MAX_ROWS), grants, and every other 036 object.
--
-- ORDER: after 036. Re-running 036 after 037 puts 036's function back; run 037 again
-- after it. Safe to run twice. Run it as postgres (the SQL editor), then
-- NOTIFY pgrst, 'reload schema'.

CREATE OR REPLACE FUNCTION aurora.leaderboard(p_server TEXT, p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur     TEXT;
  v_seq     INT;
  v_limit   INT;
  v_seen    TIMESTAMPTZ;
  v_mod     BOOLEAN;
  v_kills   JSONB;
  v_deaths  JSONB;
  v_surv    JSONB;
BEGIN
  v_limit := CASE WHEN p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN 10 ELSE p_limit END;

  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server;
  IF v_cur IS NOT NULL THEN
    SELECT w.seq INTO v_seq
      FROM aurora.worlds w
     WHERE w.server_id = p_server AND w.world_id = v_cur;
  END IF;

  SELECT max(e.seen_at) INTO v_seen
    FROM aurora.leaderboard_entries e
   WHERE e.server_id = p_server
     AND e.world_id = v_cur;
  v_mod := v_seen IS NOT NULL;

  IF v_mod THEN
    WITH ent AS (
      SELECT e.username,
             (e.banked_kills + e.live_kills) AS total,
             e.live_kills                    AS live,
             e.banked_deaths                 AS deaths,
             round(e.live_hours::numeric, 1) AS hours
        FROM aurora.leaderboard_entries e
       WHERE e.server_id = p_server
         AND e.world_id = v_cur
    ),
    life AS (
      SELECT l.username, bool_or(l.ended_at IS NULL) AS open_life
        FROM aurora.lives l
       WHERE l.server_id = p_server
         AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
         AND l.username IN (SELECT ent.username FROM ent)
       GROUP BY l.username
    ),
    who AS (
      SELECT ent.*,
             NULLIF(btrim(p.display_name), '') AS display_name,
             (p.is_dead IS NOT TRUE AND COALESCE(life.open_life, p.username IS NOT NULL)) AS alive,
             (p.online IS TRUE) AS online
        FROM ent
        LEFT JOIN life ON life.username = ent.username
        LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = ent.username
    ),
    -- 037: the window's rules. Every entry is listed, zeros included; survival lists
    -- everyone (a dead player's live_hours is 0). rank is the row position, as the
    -- game draws it; equal numbers are ordered by username (the game's order is
    -- undefined).
    k AS (
      SELECT w.*, row_number() OVER (ORDER BY w.total DESC, w.username)::INT AS rk
        FROM who w
       ORDER BY w.total DESC, w.username LIMIT v_limit
    ),
    d AS (
      SELECT w.*, row_number() OVER (ORDER BY w.deaths DESC, w.username)::INT AS rk
        FROM who w
       ORDER BY w.deaths DESC, w.username LIMIT v_limit
    ),
    s AS (
      SELECT w.*, row_number() OVER (ORDER BY w.hours DESC, w.username)::INT AS rk
        FROM who w
       ORDER BY w.hours DESC, w.username LIMIT v_limit
    )
    SELECT
      (SELECT jsonb_agg(jsonb_build_object(
                'rank', k.rk, 'username', k.username, 'display_name', k.display_name,
                'live', k.live, 'total', k.total, 'alive', k.alive, 'online', k.online)
              ORDER BY k.total DESC, k.username) FROM k),
      (SELECT jsonb_agg(jsonb_build_object(
                'rank', d.rk, 'username', d.username, 'display_name', d.display_name,
                'deaths', d.deaths, 'alive', d.alive, 'online', d.online)
              ORDER BY d.deaths DESC, d.username) FROM d),
      (SELECT jsonb_agg(jsonb_build_object(
                'rank', s.rk, 'username', s.username, 'display_name', s.display_name,
                'hours', s.hours, 'alive', s.alive, 'online', s.online)
              ORDER BY s.hours DESC, s.username) FROM s)
      INTO v_kills, v_deaths, v_surv;
  ELSE
    WITH lv AS (
      SELECT l.*
        FROM aurora.lives l
       WHERE l.server_id = p_server
         AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
    ),
    per AS (
      SELECT lv.username,
             sum(lv.kills)::BIGINT                                        AS total,
             COALESCE(sum(lv.kills) FILTER (WHERE lv.ended_at IS NULL), 0)::BIGINT AS live,
             count(*) FILTER (WHERE lv.ended_at IS NOT NULL AND EXISTS (
               SELECT 1 FROM aurora.deaths dd
                WHERE dd.server_id = p_server
                  AND dd.username = lv.username
                  AND dd.t = lv.ended_at
                  AND COALESCE(dd.world_id, v_cur) IS NOT DISTINCT FROM v_cur))::BIGINT AS deaths,
             bool_or(lv.ended_at IS NULL)                                 AS open_life
        FROM lv
       GROUP BY lv.username
    ),
    pl AS (
      SELECT p.username, p.display_name, p.is_dead, p.online, p.hours_survived
        FROM aurora.players p
       WHERE p.server_id = p_server
         AND COALESCE(p.world_id, v_cur) IS NOT DISTINCT FROM v_cur
    ),
    who AS (
      SELECT COALESCE(per.username, pl.username) AS username,
             COALESCE(per.total, 0)  AS total,
             COALESCE(per.live, 0)   AS live,
             COALESCE(per.deaths, 0) AS deaths,
             round(pl.hours_survived::numeric, 1) AS hours,
             NULLIF(btrim(p.display_name), '') AS display_name,
             (p.is_dead IS NOT TRUE AND COALESCE(per.open_life, p.username IS NOT NULL)) AS alive,
             (p.online IS TRUE) AS online
        FROM per
        FULL JOIN pl ON pl.username = per.username
        LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = COALESCE(per.username, pl.username)
    ),
    k AS (
      SELECT w.*, rank() OVER (ORDER BY w.total DESC)::INT AS rk
        FROM who w WHERE w.total > 0
       ORDER BY w.total DESC, w.username LIMIT v_limit
    ),
    d AS (
      SELECT w.*, rank() OVER (ORDER BY w.deaths DESC)::INT AS rk
        FROM who w WHERE w.deaths > 0
       ORDER BY w.deaths DESC, w.username LIMIT v_limit
    ),
    s AS (
      SELECT w.*, rank() OVER (ORDER BY w.hours DESC)::INT AS rk
        FROM who w WHERE w.alive AND w.hours > 0
       ORDER BY w.hours DESC, w.username LIMIT v_limit
    )
    SELECT
      (SELECT jsonb_agg(jsonb_build_object(
                'rank', k.rk, 'username', k.username, 'display_name', k.display_name,
                'live', k.live, 'total', k.total, 'alive', k.alive, 'online', k.online)
              ORDER BY k.total DESC, k.username) FROM k),
      (SELECT jsonb_agg(jsonb_build_object(
                'rank', d.rk, 'username', d.username, 'display_name', d.display_name,
                'deaths', d.deaths, 'alive', d.alive, 'online', d.online)
              ORDER BY d.deaths DESC, d.username) FROM d),
      (SELECT jsonb_agg(jsonb_build_object(
                'rank', s.rk, 'username', s.username, 'display_name', s.display_name,
                'hours', s.hours, 'alive', s.alive, 'online', s.online)
              ORDER BY s.hours DESC, s.username) FROM s)
      INTO v_kills, v_deaths, v_surv;
  END IF;

  RETURN jsonb_build_object(
    'source',    CASE WHEN v_mod THEN 'mod' ELSE 'aurora' END,
    'world_seq', v_seq,
    'seen_at',   v_seen,
    'kills',     COALESCE(v_kills, '[]'::jsonb),
    'deaths',    COALESCE(v_deaths, '[]'::jsonb),
    'survival',  COALESCE(v_surv, '[]'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION aurora.leaderboard(TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.leaderboard(TEXT, INT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.leaderboard(TEXT, INT) IS
  'Public (036, 037): the current world''s leaderboard as one JSON object, every key always present: source ("mod" when the in-game table has rows for the current world, else "aurora"), world_seq, seen_at (newest mod row, null for aurora), kills [{rank, username, display_name, live, total, alive, online}], deaths [{rank, username, display_name, deaths, alive, online}], survival [{rank, username, display_name, hours, alive, online}]. Source "mod" mirrors the game''s leaderboard window (037): every entry in every list, zeros and the dead included, rank = row position 1..n (ROW_NUMBER), ties ordered by username. Source "aurora" (036): zero rows left out, survival alive only, ties share a rank (RANK). Rows ordered by the number DESC then username, at most p_limit per list (1..100, else 10). Rules in migrations 036 and 037.';
