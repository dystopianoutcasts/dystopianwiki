-- Migration 036: leaderboard - the in-game mod's table, with Aurora's own count as fallback
-- Created: 2026-10-03
-- Description: the site's three-tab leaderboard (T65 backend, T66 section) reads one public
--   function, aurora.leaderboard(server, limit). Exporter 0.7.2 (T64) sends the
--   DystopianQoL leaderboard table as the game shows it:
--     lb  {"k":"lb","src":"DQOL","e":[{"u","bk","bd","lk","lh"}, ...],"t"}
--         u username, bk banked kills, bd banked deaths, lk live kills, lh live hours.
--         `e` is the FULL table (at most 200 entries); an empty `e` means it is empty.
--   The importer sends the newest lb of a batch to aurora.replace_leaderboard().
--   Depends on 008 (servers, players), 019 (aurora.is_aurora_admin()), 030 (deaths),
--   032 (worlds, world_id, aurora.is_current_world) and 034 (aurora.lives and
--   aurora.season_stamp_world()). 035's aurora.kill_leaderboard is left untouched: it is
--   the site's source until T66 switches to this function.
--
-- What it adds:
--
--   aurora.leaderboard_entries   the mod's table per world, one row per username.
--                                RLS on, no client grant.
--   aurora.replace_leaderboard(server, world, rows, seen_at)   service_role (the importer)
--   aurora.leaderboard(server, limit)                          public, current world only
--   aurora.leaderboard_admin(server)                           admins only, raw rows
--
-- Contract of aurora.leaderboard (every key always present):
--   {"source": "mod" | "aurora", "world_seq": 1, "seen_at": "<iso or null>",
--    "kills":    [{"rank", "username", "display_name", "live", "total", "alive", "online"}],
--    "deaths":   [{"rank", "username", "display_name", "deaths", "alive", "online"}],
--    "survival": [{"rank", "username", "display_name", "hours", "alive", "online"}]}
--   * Current world only: the world id is read once and compared as a value; an
--     untagged row (world_id NULL) counts as current, as in aurora.is_current_world.
--     world_seq is NULL when the server has no current world.
--   * source "mod" when aurora.leaderboard_entries holds a row of the current world;
--     seen_at is then the newest seen_at of those rows (the ingest clock). Lists:
--       kills    total = banked_kills + live_kills, live = live_kills; total > 0 only.
--       deaths   deaths = banked_deaths; deaths > 0 only.
--       survival hours = live_hours, alive players only, hours > 0 only.
--   * source "aurora" otherwise; seen_at is null. Lists:
--       kills    total = SUM(lives.kills) in the world (as 035), live = the kills of the
--                player's open life(s) in the world, else 0; total > 0 only.
--       deaths   the number of the player's lives in the world that ENDED WITH A DEATH:
--                a life L counts when a row d of aurora.deaths exists with the same
--                server and username, d.t = L.ended_at, and d in the current world
--                (COALESCE(d.world_id, current) = current). 034 closes a life at
--                exactly the death's t (the deaths trigger and observe_lives' backfill
--                rule), so this is one count per recorded death that ended a life; a
--                life closed by inference (the next life began, no death) does not
--                count. deaths > 0 only.
--       survival hours = players.hours_survived for alive players whose players row is
--                in the current world (COALESCE(world_id, current) = current); > 0 only.
--   * alive = players.is_dead IS NOT TRUE and, when the player has a life in the world,
--     one of those lives is open (035's rule); a username with neither a players row
--     nor a life in the world is not alive. online = players.online IS TRUE.
--   * hours are rounded to 0.1 before ranking, so what the site shows is what ties.
--   * rank = RANK() over the list's number, so equal numbers share a rank; rows are
--     ordered by that number DESC, then username. p_limit is clamped to 1..100 (NULL
--     or out of range: 10), per list.
--   * username is public (owner decision 2026-09-29, T44); display_name is the players
--     row's display name, NULL when absent or blank (the site falls back to username).
--     No coordinates, no faction members, nothing of another world.
--
-- Worlds: like 034's tables, leaderboard_entries carries world_id but is NOT in
-- aurora.world_tagged_tables() (032's tests pin that list). A BEFORE INSERT trigger
-- (034's aurora.season_stamp_world()) stamps a NULL world_id with the current world,
-- and an AFTER UPDATE trigger on aurora.worlds moves the rows of a world that
-- undo_new_world() voids to the world the undo reopens (the voided world's table is
-- the newer one, so it replaces the reopened world's rows).
--
-- ORDER: after 034. The importer does not stall without 036: replace_leaderboard is an
-- optional RPC (a missing function is skipped and counted, the cursor advances).
--
-- Safe to run twice. Run it as postgres (the SQL editor), then NOTIFY pgrst, 'reload schema'.

-- ============================================================================
-- 1. TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.leaderboard_entries (
  server_id     TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  world_id      TEXT NOT NULL,
  username      TEXT NOT NULL,
  banked_kills  BIGINT NOT NULL DEFAULT 0,
  banked_deaths BIGINT NOT NULL DEFAULT 0,
  live_kills    BIGINT NOT NULL DEFAULT 0,
  live_hours    REAL NOT NULL DEFAULT 0,
  seen_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (server_id, world_id, username)
);

ALTER TABLE aurora.leaderboard_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.leaderboard_entries FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.leaderboard_entries TO service_role;

COMMENT ON TABLE aurora.leaderboard_entries IS
  'The DystopianQoL leaderboard table as the game shows it (036, exporter 0.7.2 `lb`), one row per username per world, written only by aurora.replace_leaderboard(). world_id is part of the key, so a row always has a world: replace_leaderboard writes nothing while the server has none. No client grant: the public reads aurora.leaderboard(), admins leaderboard_admin().';

-- ============================================================================
-- 2. WORLD STAMPING (see the header)
-- ============================================================================

-- 034's stamp function: a NULL world_id becomes the server's current world.
DROP TRIGGER IF EXISTS leaderboard_entries_stamp_world ON aurora.leaderboard_entries;
CREATE TRIGGER leaderboard_entries_stamp_world BEFORE INSERT ON aurora.leaderboard_entries
  FOR EACH ROW EXECUTE FUNCTION aurora.season_stamp_world();

-- undo_new_world() (032) voids the current world, then reopens the most recently ended
-- one; this fires on the void and picks that world with the same rule as 034's
-- season_world_voided (status ended, newest ended_at, then seq).
CREATE OR REPLACE FUNCTION aurora.leaderboard_world_voided()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prev TEXT;
BEGIN
  SELECT w.world_id INTO v_prev
    FROM aurora.worlds w
   WHERE w.server_id = NEW.server_id
     AND w.status = 'ended'
   ORDER BY w.ended_at DESC NULLS LAST, w.seq DESC
   LIMIT 1;
  IF v_prev IS NOT NULL AND EXISTS (
       SELECT 1 FROM aurora.leaderboard_entries e
        WHERE e.server_id = NEW.server_id AND e.world_id = NEW.world_id) THEN
    -- The voided world's table is the newest word; the key includes world_id, so the
    -- reopened world's rows go first or the move would collide.
    DELETE FROM aurora.leaderboard_entries e
     WHERE e.server_id = NEW.server_id AND e.world_id = v_prev;
    UPDATE aurora.leaderboard_entries e
       SET world_id = v_prev
     WHERE e.server_id = NEW.server_id AND e.world_id = NEW.world_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION aurora.leaderboard_world_voided() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.leaderboard_world_voided() IS
  'Internal (036): when a CURRENT world becomes void (undo_new_world), its leaderboard_entries replace those of the world the undo reopens.';

DROP TRIGGER IF EXISTS worlds_leaderboard_voided ON aurora.worlds;
CREATE TRIGGER worlds_leaderboard_voided AFTER UPDATE OF status ON aurora.worlds
  FOR EACH ROW
  WHEN (OLD.status = 'current' AND NEW.status = 'void')
  EXECUTE FUNCTION aurora.leaderboard_world_voided();

-- ============================================================================
-- 3. IMPORTER: replace_leaderboard
-- ============================================================================
-- Rows {username, banked_kills, banked_deaths, live_kills, live_hours}. The record is the
-- full table, so the world's rows whose username is not in p_rows are deleted and the
-- rest upserted with seen_at = p_seen_at; an empty array empties the world's table.
-- p_world NULL means the server's current world (the insert leaves it to the stamp
-- trigger). A row without a non-blank username is skipped; a number that is missing,
-- not a number or negative reads 0; a repeated username keeps its last row.

CREATE OR REPLACE FUNCTION aurora.replace_leaderboard(p_server TEXT, p_world TEXT, p_rows JSONB, p_seen_at TIMESTAMPTZ)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_world TEXT;
  v_n     INT := 0;
BEGIN
  IF p_seen_at IS NULL OR p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN 0;
  END IF;
  v_world := COALESCE(p_world, (SELECT s.current_world_id FROM aurora.servers s WHERE s.id = p_server));
  IF v_world IS NULL THEN
    RETURN 0;
  END IF;

  -- One statement: the delete and the upsert see the same snapshot and touch disjoint
  -- usernames (gone vs present), so neither can see the other's rows.
  WITH src AS (
  SELECT DISTINCT ON (u) u AS username, bk, bd, lk, lh
    FROM (
      SELECT left(btrim(e->>'username'), 100) AS u,
             CASE WHEN jsonb_typeof(e->'banked_kills') = 'number' AND (e->>'banked_kills')::numeric >= 0
                  THEN LEAST(trunc((e->>'banked_kills')::numeric), 9e15)::BIGINT ELSE 0 END AS bk,
             CASE WHEN jsonb_typeof(e->'banked_deaths') = 'number' AND (e->>'banked_deaths')::numeric >= 0
                  THEN LEAST(trunc((e->>'banked_deaths')::numeric), 9e15)::BIGINT ELSE 0 END AS bd,
             CASE WHEN jsonb_typeof(e->'live_kills') = 'number' AND (e->>'live_kills')::numeric >= 0
                  THEN LEAST(trunc((e->>'live_kills')::numeric), 9e15)::BIGINT ELSE 0 END AS lk,
             CASE WHEN jsonb_typeof(e->'live_hours') = 'number' AND (e->>'live_hours')::numeric >= 0
                  THEN LEAST((e->>'live_hours')::numeric, 1e9)::REAL ELSE 0 END AS lh,
             a.i
        FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS a(e, i)
       WHERE jsonb_typeof(e) = 'object'
         AND jsonb_typeof(e->'username') = 'string'
         AND btrim(e->>'username') <> ''
    ) x
   ORDER BY u, i DESC
  ),
  gone AS (
    DELETE FROM aurora.leaderboard_entries le
     WHERE le.server_id = p_server
       AND le.world_id = v_world
       AND NOT EXISTS (SELECT 1 FROM src s WHERE s.username = le.username)
  )
  INSERT INTO aurora.leaderboard_entries AS le
         (server_id, world_id, username, banked_kills, banked_deaths, live_kills, live_hours, seen_at)
  SELECT p_server, p_world, s.username, s.bk, s.bd, s.lk, s.lh, p_seen_at
    FROM src s
  ON CONFLICT (server_id, world_id, username) DO UPDATE
     SET banked_kills  = EXCLUDED.banked_kills,
         banked_deaths = EXCLUDED.banked_deaths,
         live_kills    = EXCLUDED.live_kills,
         live_hours    = EXCLUDED.live_hours,
         seen_at       = EXCLUDED.seen_at;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.replace_leaderboard(TEXT, TEXT, JSONB, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.replace_leaderboard(TEXT, TEXT, JSONB, TIMESTAMPTZ) TO service_role;

COMMENT ON FUNCTION aurora.replace_leaderboard(TEXT, TEXT, JSONB, TIMESTAMPTZ) IS
  'Importer (036): the mod''s full leaderboard table {username, banked_kills, banked_deaths, live_kills, live_hours} as of p_seen_at (the ingest clock). Deletes the world''s rows not in p_rows, upserts the rest; an empty array empties the world''s table. p_world NULL means the server''s current world; with no world nothing is written. Returns the rows written. service_role.';

-- ============================================================================
-- 4. PUBLIC: leaderboard
-- ============================================================================

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
  'Public (036): the current world''s leaderboard as one JSON object, every key always present: source ("mod" when the in-game table has rows for the current world, else "aurora"), world_seq, seen_at (newest mod row, null for aurora), kills [{rank, username, display_name, live, total, alive, online}], deaths [{rank, username, display_name, deaths, alive, online}], survival [{rank, username, display_name, hours, alive, online}] (alive only). Ties share a rank (RANK), rows ordered by the number DESC then username, at most p_limit per list (1..100, else 10). Rules in migration 036''s header.';

-- ============================================================================
-- 5. ADMIN READ (current world; zero rows to non-admins)
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.leaderboard_admin(p_server TEXT)
RETURNS SETOF aurora.leaderboard_entries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT e.*
    FROM aurora.leaderboard_entries e
   WHERE aurora.is_aurora_admin()
     AND e.server_id = p_server
     AND aurora.is_current_world(e.server_id, e.world_id)
   ORDER BY e.username;
$$;

REVOKE ALL ON FUNCTION aurora.leaderboard_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.leaderboard_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.leaderboard_admin(TEXT) IS
  'Admins (036): the current world''s raw leaderboard_entries rows, by username. Empty for anyone who is not an aurora admin.';
