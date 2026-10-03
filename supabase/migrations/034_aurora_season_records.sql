-- Migration 034: season records - kill events, character lives and factions
-- Created: 2026-10-02
-- Description: the home page's "Season records" (T55) read one public function,
--   aurora.season_records(server). A season is the server's current world (032). The
--   exporter (0.7.0, T53) reports three things this migration stores:
--     pos.zk  the character's own zombie kill counter (resets on a new character);
--             the importer sends the newest sample per player to observe_lives().
--     kill    one record per attributed zombie kill (capped at 20 per second, so it
--             may undercount): the exact time and place of the first kill.
--     facs    the full faction list (every 10 minutes and on change).
--   Totals come from zk; kill events only answer "who killed first, and where".
--   Depends on 008 (servers, players), 019 (aurora.is_aurora_admin()), 030 (deaths)
--   and 032 (worlds, world_id, aurora.is_current_world).
--
-- What it adds:
--
--   aurora.kill_events   append-only, one row per kill record. No client grant.
--   aurora.lives         one row per character life: life_no counts up per player;
--                        kills and hours are running maxima; ended_at is the death
--                        (or the start of the next life when no death was recorded).
--                        No client grant.
--   aurora.factions      the newest full faction list. No client grant.
--   aurora.observe_lives(server, world, rows)             service_role (the importer)
--   aurora.replace_factions(server, world, rows, seen_at) service_role (the importer)
--   aurora.season_records(server)                         public, current world only
--   kill_events_admin, lives_admin, factions_admin        admins only
--   An AFTER INSERT trigger on aurora.deaths closes the player's open life, so a
--   backfilled death behaves exactly like a live one.
--
-- Worlds, beyond the 032 list: the three tables carry world_id but are NOT in
-- aurora.world_tagged_tables() (032's tests pin that list at 13, and re-running 032
-- would undo a redefinition). Two triggers stand in for it instead:
--   * a BEFORE INSERT trigger stamps a NULL world_id with the server's current world,
--     so no row of these tables stays untagged across a switch;
--   * an AFTER UPDATE trigger on aurora.worlds moves these tables' rows of a world that
--     undo_new_world() voids back to the world the undo reopens, as world_retag()
--     does for the 13 tables.
--   A life belongs to one world: a sample in a world other than the open life's
--   closes that life and opens the next.
--
-- ORDER: after 032. The importer does not stall without 034: its kill_events upsert
-- and both RPCs are optional (a missing table or function is skipped and counted).
--
-- Safe to run twice. Run it as postgres (the SQL editor).

-- ============================================================================
-- 1. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.kill_events (
  id        BIGSERIAL PRIMARY KEY,
  server_id TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  world_id  TEXT NULL,
  username  TEXT NOT NULL,
  x         REAL,
  y         REAL,
  z         REAL,
  t         TIMESTAMPTZ NOT NULL,
  CONSTRAINT kill_events_server_username_t_x_y_key UNIQUE (server_id, username, t, x, y)
);

CREATE INDEX IF NOT EXISTS kill_events_server_world_t_idx ON aurora.kill_events (server_id, world_id, t);

ALTER TABLE aurora.kill_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.kill_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.kill_events TO service_role;
REVOKE ALL ON SEQUENCE aurora.kill_events_id_seq FROM PUBLIC, anon, authenticated;
GRANT ALL ON SEQUENCE aurora.kill_events_id_seq TO service_role;

COMMENT ON TABLE aurora.kill_events IS
  'One row per attributed zombie kill the exporter reported (034, exporter 0.7.0 `kill`). Capped at 20 per second at the source, so it undercounts: totals come from aurora.lives (the zk counter). The unique key makes a replay idempotent. No client grant: the public reads aurora.season_records(), admins kill_events_admin().';

CREATE TABLE IF NOT EXISTS aurora.lives (
  server_id     TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  world_id      TEXT NULL,
  username      TEXT NOT NULL,
  life_no       INT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL,
  ended_at      TIMESTAMPTZ NULL,
  kills         INT NOT NULL DEFAULT 0,
  hours         REAL NOT NULL DEFAULT 0,
  first_kill_at TIMESTAMPTZ NULL,
  PRIMARY KEY (server_id, username, life_no)
);

CREATE INDEX IF NOT EXISTS lives_server_world_kills_idx ON aurora.lives (server_id, world_id, kills DESC);
CREATE INDEX IF NOT EXISTS lives_server_world_hours_idx ON aurora.lives (server_id, world_id, hours DESC);

ALTER TABLE aurora.lives ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.lives FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.lives TO service_role;

COMMENT ON TABLE aurora.lives IS
  'One row per character life (034). Opened by aurora.observe_lives() when a player is first seen or a new character is detected (zk dropped, hours dropped by more than 0.5, or a new world); closed by a death row (trigger on aurora.deaths) or by the next life. kills and hours are running maxima. No client grant.';

CREATE TABLE IF NOT EXISTS aurora.factions (
  server_id TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  world_id  TEXT NULL,
  name      TEXT NOT NULL,
  tag       TEXT,
  owner     TEXT,
  members   TEXT[] NOT NULL DEFAULT '{}',
  seen_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (server_id, name)
);

ALTER TABLE aurora.factions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.factions FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.factions TO service_role;

COMMENT ON TABLE aurora.factions IS
  'The newest full faction list per server (034, exporter 0.7.0 `facs`), written only by aurora.replace_factions(). members includes the owner (the exporter adds it once). No client grant: season_records() publishes the biggest faction''s member COUNT only.';

-- ============================================================================
-- 2. WORLD STAMPING (see the header)
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.season_stamp_world()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.world_id IS NULL THEN
    NEW.world_id := (SELECT s.current_world_id FROM aurora.servers s WHERE s.id = NEW.server_id);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION aurora.season_stamp_world() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.season_stamp_world() IS
  'Internal (034): BEFORE INSERT on kill_events, lives and factions; a NULL world_id becomes the server''s current world (still NULL when it has none).';

DROP TRIGGER IF EXISTS kill_events_stamp_world ON aurora.kill_events;
CREATE TRIGGER kill_events_stamp_world BEFORE INSERT ON aurora.kill_events
  FOR EACH ROW EXECUTE FUNCTION aurora.season_stamp_world();
DROP TRIGGER IF EXISTS lives_stamp_world ON aurora.lives;
CREATE TRIGGER lives_stamp_world BEFORE INSERT ON aurora.lives
  FOR EACH ROW EXECUTE FUNCTION aurora.season_stamp_world();
DROP TRIGGER IF EXISTS factions_stamp_world ON aurora.factions;
CREATE TRIGGER factions_stamp_world BEFORE INSERT ON aurora.factions
  FOR EACH ROW EXECUTE FUNCTION aurora.season_stamp_world();

-- undo_new_world() (032) voids the current world, then reopens the most recently
-- ended one. This fires on the void, before the reopen, and picks the world the undo
-- will reopen with the same rule (status ended, newest ended_at, then seq).
CREATE OR REPLACE FUNCTION aurora.season_world_voided()
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
  IF v_prev IS NOT NULL THEN
    UPDATE aurora.kill_events SET world_id = v_prev WHERE server_id = NEW.server_id AND world_id = NEW.world_id;
    UPDATE aurora.lives       SET world_id = v_prev WHERE server_id = NEW.server_id AND world_id = NEW.world_id;
    UPDATE aurora.factions    SET world_id = v_prev WHERE server_id = NEW.server_id AND world_id = NEW.world_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION aurora.season_world_voided() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.season_world_voided() IS
  'Internal (034): when a CURRENT world becomes void (undo_new_world), moves kill_events, lives and factions rows of that world to the world the undo reopens.';

DROP TRIGGER IF EXISTS worlds_season_voided ON aurora.worlds;
CREATE TRIGGER worlds_season_voided AFTER UPDATE OF status ON aurora.worlds
  FOR EACH ROW
  WHEN (OLD.status = 'current' AND NEW.status = 'void')
  EXECUTE FUNCTION aurora.season_world_voided();

-- ============================================================================
-- 3. LIVES
-- ============================================================================
-- Rows {username, t, hs, zk}, applied in array order. hs (hours survived) and zk (kill
-- counter) are each optional; a row with neither is skipped. For each row, against the
-- player's latest life L:
--   * no L, or L open and (zk < L.kills, hs < L.hours - 0.5, L in another world, or a
--     stored death of the player between L's start and t): a new character. L (if
--     open) is closed at that death, else at t; life L.life_no + 1 opens at t with
--     kills = zk, hours = hs. (The death case is the backfill: one file's deaths are
--     written before its samples, so the death trigger found no life to close.)
--   * L open otherwise: kills and hours take the GREATEST; first_kill_at = t when it is
--     NULL and zk > 0.
--   * t at or before L's death (L closed, ended_at >= t): the sample belongs to L; fold
--     it in as maxima. A sample after the death opens the next life.
--   * t before L started (a replay over newer lives): fold it into the life whose span
--     holds t, never open one. So replaying a log never invents lives.

CREATE OR REPLACE FUNCTION aurora.observe_lives(p_server TEXT, p_world TEXT, p_rows JSONB)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_world TEXT;
  r       RECORD;
  v_last  aurora.lives%ROWTYPE;
  v_has   BOOLEAN;
  v_death_t  TIMESTAMPTZ;
  v_death_hs REAL;
  v_n     INT := 0;
BEGIN
  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN 0;
  END IF;
  v_world := COALESCE(p_world, (SELECT s.current_world_id FROM aurora.servers s WHERE s.id = p_server));

  FOR r IN
    SELECT NULLIF(btrim(e->>'username'), '') AS username,
           CASE WHEN jsonb_typeof(e->'t') = 'string' THEN (e->>'t')::timestamptz END AS t,
           CASE WHEN jsonb_typeof(e->'hs') = 'number' AND (e->>'hs')::numeric >= 0
                THEN (e->>'hs')::real END AS hs,
           CASE WHEN jsonb_typeof(e->'zk') = 'number' AND (e->>'zk')::numeric >= 0
                     AND (e->>'zk')::numeric = trunc((e->>'zk')::numeric)
                     AND (e->>'zk')::numeric < 2147483647
                THEN (e->>'zk')::numeric::int END AS zk
      FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS a(e, i)
     WHERE jsonb_typeof(e) = 'object'
     ORDER BY a.i
  LOOP
    CONTINUE WHEN r.username IS NULL OR r.t IS NULL OR (r.hs IS NULL AND r.zk IS NULL);

    SELECT l.* INTO v_last
      FROM aurora.lives l
     WHERE l.server_id = p_server AND l.username = r.username
     ORDER BY l.life_no DESC
     LIMIT 1
     FOR UPDATE;
    v_has := FOUND;

    -- A death already stored between the open life's start and this sample (a
    -- backfill writes a file's deaths before its samples) ended that life.
    v_death_t := NULL;
    v_death_hs := NULL;
    IF v_has AND v_last.ended_at IS NULL AND r.t > v_last.started_at THEN
      SELECT d.t, d.hours_survived INTO v_death_t, v_death_hs
        FROM aurora.deaths d
       WHERE d.server_id = p_server
         AND d.username = r.username
         AND d.t >= v_last.started_at
         AND d.t < r.t
       ORDER BY d.t
       LIMIT 1;
    END IF;

    IF v_has AND r.t < v_last.started_at THEN
      UPDATE aurora.lives l
         SET kills = GREATEST(l.kills, COALESCE(r.zk, l.kills)),
             hours = GREATEST(l.hours, COALESCE(r.hs, l.hours))
       WHERE l.server_id = p_server
         AND l.username = r.username
         AND l.life_no = (SELECT max(m.life_no) FROM aurora.lives m
                           WHERE m.server_id = p_server AND m.username = r.username AND m.started_at <= r.t)
         AND (l.ended_at IS NULL OR l.ended_at >= r.t);
    ELSIF v_has AND v_last.ended_at IS NOT NULL AND v_last.ended_at >= r.t THEN
      UPDATE aurora.lives l
         SET kills = GREATEST(l.kills, COALESCE(r.zk, l.kills)),
             hours = GREATEST(l.hours, COALESCE(r.hs, l.hours)),
             first_kill_at = CASE WHEN l.first_kill_at IS NULL AND r.zk > 0 THEN r.t ELSE l.first_kill_at END
       WHERE l.server_id = p_server AND l.username = r.username AND l.life_no = v_last.life_no;
    ELSIF v_has AND v_last.ended_at IS NULL
          AND v_death_t IS NULL
          AND v_last.world_id IS NOT DISTINCT FROM v_world
          AND (r.zk IS NULL OR r.zk >= v_last.kills)
          AND (r.hs IS NULL OR r.hs >= v_last.hours - 0.5) THEN
      UPDATE aurora.lives l
         SET kills = GREATEST(l.kills, COALESCE(r.zk, l.kills)),
             hours = GREATEST(l.hours, COALESCE(r.hs, l.hours)),
             first_kill_at = CASE WHEN l.first_kill_at IS NULL AND r.zk > 0 THEN r.t ELSE l.first_kill_at END
       WHERE l.server_id = p_server AND l.username = r.username AND l.life_no = v_last.life_no;
    ELSE
      IF v_has AND v_last.ended_at IS NULL THEN
        UPDATE aurora.lives l
           SET ended_at = COALESCE(v_death_t, r.t),
               hours    = GREATEST(l.hours, COALESCE(v_death_hs, l.hours))
         WHERE l.server_id = p_server AND l.username = r.username AND l.life_no = v_last.life_no;
      END IF;
      INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, kills, hours, first_kill_at)
      VALUES (p_server, v_world, r.username,
              CASE WHEN v_has THEN v_last.life_no + 1 ELSE 1 END,
              r.t, COALESCE(r.zk, 0), COALESCE(r.hs, 0),
              CASE WHEN r.zk > 0 THEN r.t END);
    END IF;
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.observe_lives(TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.observe_lives(TEXT, TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION aurora.observe_lives(TEXT, TEXT, JSONB) IS
  'Importer (034): applies pos samples {username, t, hs, zk} in array order to aurora.lives (rules in the migration). p_world NULL means the server''s current world. Returns the number of rows applied. service_role.';

-- A death closes the life it ends: the latest life that started at or before the
-- death and is still open (or was closed later, by inference from the next life).
CREATE OR REPLACE FUNCTION aurora.lives_close_on_death()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE aurora.lives l
     SET ended_at = NEW.t,
         hours    = GREATEST(l.hours, COALESCE(NEW.hours_survived, l.hours))
   WHERE l.server_id = NEW.server_id
     AND l.username = NEW.username
     AND l.life_no = (SELECT max(m.life_no) FROM aurora.lives m
                       WHERE m.server_id = NEW.server_id AND m.username = NEW.username
                         AND m.started_at <= NEW.t)
     AND (l.ended_at IS NULL OR l.ended_at > NEW.t);
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION aurora.lives_close_on_death() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.lives_close_on_death() IS
  'Internal (034): AFTER INSERT on aurora.deaths; ends the player''s life at the death time and keeps the greater of its hours and the death''s hours_survived.';

DROP TRIGGER IF EXISTS deaths_close_life ON aurora.deaths;
CREATE TRIGGER deaths_close_life AFTER INSERT ON aurora.deaths
  FOR EACH ROW EXECUTE FUNCTION aurora.lives_close_on_death();

-- ============================================================================
-- 4. FACTIONS
-- ============================================================================
-- Rows {name, tag, owner, members}. The record is the full list, so every row is
-- upserted with seen_at = p_seen_at and the server's rows older than that go; an empty
-- list deletes every faction.

CREATE OR REPLACE FUNCTION aurora.replace_factions(p_server TEXT, p_world TEXT, p_rows JSONB, p_seen_at TIMESTAMPTZ)
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

  WITH src AS (
    SELECT DISTINCT ON (left(btrim(e->>'name'), 64))
           left(btrim(e->>'name'), 64) AS name,
           NULLIF(left(btrim(COALESCE(e->>'tag', '')), 64), '') AS tag,
           NULLIF(btrim(COALESCE(e->>'owner', '')), '') AS owner,
           CASE WHEN jsonb_typeof(e->'members') = 'array'
                THEN ARRAY(SELECT m FROM jsonb_array_elements_text(e->'members') AS mm(m)
                            WHERE btrim(m) <> '' LIMIT 64)
                ELSE '{}'::TEXT[] END AS members,
           a.i
      FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS a(e, i)
     WHERE jsonb_typeof(e) = 'object'
       AND jsonb_typeof(e->'name') = 'string'
       AND btrim(e->>'name') <> ''
     ORDER BY left(btrim(e->>'name'), 64), a.i DESC
  )
  INSERT INTO aurora.factions AS f (server_id, world_id, name, tag, owner, members, seen_at)
  SELECT p_server, v_world, src.name, src.tag, src.owner, src.members, p_seen_at
    FROM src
  ON CONFLICT (server_id, name) DO UPDATE
     SET world_id = EXCLUDED.world_id,
         tag      = EXCLUDED.tag,
         owner    = EXCLUDED.owner,
         members  = EXCLUDED.members,
         seen_at  = EXCLUDED.seen_at
   WHERE f.seen_at <= EXCLUDED.seen_at;
  GET DIAGNOSTICS v_n = ROW_COUNT;

  DELETE FROM aurora.factions f
   WHERE f.server_id = p_server
     AND f.seen_at < p_seen_at;
  RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.replace_factions(TEXT, TEXT, JSONB, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.replace_factions(TEXT, TEXT, JSONB, TIMESTAMPTZ) TO service_role;

COMMENT ON FUNCTION aurora.replace_factions(TEXT, TEXT, JSONB, TIMESTAMPTZ) IS
  'Importer (034): the full faction list {name, tag, owner, members} as of p_seen_at (the ingest clock). Upserts every row, then deletes the server''s rows seen before p_seen_at; an empty list deletes all. Returns the rows written. service_role.';

-- ============================================================================
-- 5. PUBLIC: season_records
-- ============================================================================
-- Current world only; the world id is read once and compared as a value. Every key is
-- always present, null when nobody holds the record. Names are players.display_name,
-- else the username. A holder needs a positive value (0 kills is nobody). Ties: the
-- earlier time, then the username (deaths, kills, lives); the faction name.

CREATE OR REPLACE FUNCTION aurora.season_records(p_server TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur     TEXT;
  v_seq     INT;
  v_started TIMESTAMPTZ;
  v_kill    JSONB;
BEGIN
  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server;
  IF v_cur IS NOT NULL THEN
    SELECT w.seq, w.started_at INTO v_seq, v_started
      FROM aurora.worlds w
     WHERE w.server_id = p_server AND w.world_id = v_cur;
  END IF;

  -- The earliest kill event: one index probe per tag (the world, and untagged).
  SELECT jsonb_build_object(
           'name', COALESCE(NULLIF(btrim(p.display_name), ''), e.username),
           't', e.t, 'x', e.x, 'y', e.y)
    INTO v_kill
    FROM (
      (SELECT k.username, k.t, k.x, k.y FROM aurora.kill_events k
        WHERE k.server_id = p_server AND k.world_id = v_cur
        ORDER BY k.t, k.username LIMIT 1)
      UNION ALL
      (SELECT k.username, k.t, k.x, k.y FROM aurora.kill_events k
        WHERE k.server_id = p_server AND k.world_id IS NULL
        ORDER BY k.t, k.username LIMIT 1)
    ) e
    LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = e.username
   ORDER BY e.t, e.username
   LIMIT 1;

  IF v_kill IS NULL THEN
    SELECT jsonb_build_object(
             'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
             't', l.first_kill_at, 'x', NULL, 'y', NULL)
      INTO v_kill
      FROM aurora.lives l
      LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username
     WHERE l.server_id = p_server
       AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
       AND l.first_kill_at IS NOT NULL
     ORDER BY l.first_kill_at, l.username
     LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'world_seq', v_seq,
    'world_started_at', v_started,
    'first_death', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), d.username),
               't', d.t, 'x', d.x, 'y', d.y,
               'hours_survived', round(d.hours_survived::numeric, 1))
        FROM aurora.deaths d
        LEFT JOIN aurora.players p ON p.server_id = d.server_id AND p.username = d.username
       WHERE d.server_id = p_server
         AND COALESCE(d.world_id, v_cur) IS NOT DISTINCT FROM v_cur
       ORDER BY d.t, d.username
       LIMIT 1),
    'first_kill', v_kill,
    'most_kills_season', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), s.username),
               'kills', s.kills)
        FROM (SELECT l.username, sum(l.kills)::BIGINT AS kills
                FROM aurora.lives l
               WHERE l.server_id = p_server
                 AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
               GROUP BY l.username
              HAVING sum(l.kills) > 0
               ORDER BY 2 DESC, 1
               LIMIT 1) s
        LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = s.username),
    -- The top life is picked from the (server_id, world_id, kills|hours DESC) index,
    -- one probe per tag, and only that row is joined to players.
    'most_kills_one_life', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
               'kills', l.kills,
               'life_no', l.life_no,
               'alive', (l.ended_at IS NULL AND p.is_dead IS NOT TRUE))
        FROM (SELECT c.* FROM (
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id = v_cur AND x.kills > 0
                  ORDER BY x.kills DESC, x.started_at, x.username LIMIT 1)
                UNION ALL
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id IS NULL AND x.kills > 0
                  ORDER BY x.kills DESC, x.started_at, x.username LIMIT 1)) c
              ORDER BY c.kills DESC, c.started_at, c.username
              LIMIT 1) l
        LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username),
    'longest_life', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
               'hours', round(l.hours::numeric, 1),
               'alive', (l.ended_at IS NULL AND p.is_dead IS NOT TRUE),
               'started_at', l.started_at)
        FROM (SELECT c.* FROM (
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id = v_cur AND x.hours > 0
                  ORDER BY x.hours DESC, x.started_at, x.username LIMIT 1)
                UNION ALL
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id IS NULL AND x.hours > 0
                  ORDER BY x.hours DESC, x.started_at, x.username LIMIT 1)) c
              ORDER BY c.hours DESC, c.started_at, c.username
              LIMIT 1) l
        LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username),
    'biggest_faction', (
      SELECT jsonb_build_object(
               'name', f.name,
               'tag', f.tag,
               'owner_name', COALESCE(NULLIF(btrim(p.display_name), ''), f.owner),
               'members', f.n)
        FROM (SELECT x.name, x.tag, x.owner,
                     (SELECT count(DISTINCT m) FROM unnest(x.members || ARRAY[x.owner]) AS u(m)
                       WHERE m IS NOT NULL AND btrim(m) <> '') AS n
                FROM aurora.factions x
               WHERE x.server_id = p_server
                 AND COALESCE(x.world_id, v_cur) IS NOT DISTINCT FROM v_cur) f
        LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = f.owner
       ORDER BY f.n DESC, f.name
       LIMIT 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION aurora.season_records(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.season_records(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.season_records(TEXT) IS
  'Public (034): the current world''s records as one JSON object, every key always present (null when nobody holds it): world_seq, world_started_at, first_death {name, t, x, y, hours_survived}, first_kill {name, t, x, y} (x, y null when it comes from the zk counter), most_kills_season {name, kills}, most_kills_one_life {name, kills, life_no, alive}, longest_life {name, hours, alive, started_at}, biggest_faction {name, tag, owner_name, members (a count, owner once)}. No member list, no username beyond the display name fallback.';

-- ============================================================================
-- 6. ADMIN READS (current world; zero rows to non-admins)
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.kill_events_admin(p_server TEXT, p_limit INT DEFAULT 500)
RETURNS SETOF aurora.kill_events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT k.*
    FROM aurora.kill_events k
   WHERE aurora.is_aurora_admin()
     AND k.server_id = p_server
     AND aurora.is_current_world(k.server_id, k.world_id)
   ORDER BY k.t DESC, k.id DESC
   LIMIT LEAST(GREATEST(COALESCE(p_limit, 500), 1), 5000);
$$;

REVOKE ALL ON FUNCTION aurora.kill_events_admin(TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.kill_events_admin(TEXT, INT) TO authenticated;

COMMENT ON FUNCTION aurora.kill_events_admin(TEXT, INT) IS
  'Admins (034): the current world''s kill events, newest first, at most p_limit (500, capped at 5000). Empty for anyone who is not an aurora admin.';

CREATE OR REPLACE FUNCTION aurora.lives_admin(p_server TEXT)
RETURNS SETOF aurora.lives
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT l.*
    FROM aurora.lives l
   WHERE aurora.is_aurora_admin()
     AND l.server_id = p_server
     AND aurora.is_current_world(l.server_id, l.world_id)
   ORDER BY l.username, l.life_no;
$$;

REVOKE ALL ON FUNCTION aurora.lives_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.lives_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.lives_admin(TEXT) IS
  'Admins (034): the current world''s character lives, by username and life_no. Empty for anyone who is not an aurora admin.';

CREATE OR REPLACE FUNCTION aurora.factions_admin(p_server TEXT)
RETURNS SETOF aurora.factions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT f.*
    FROM aurora.factions f
   WHERE aurora.is_aurora_admin()
     AND f.server_id = p_server
     AND aurora.is_current_world(f.server_id, f.world_id)
   ORDER BY f.name;
$$;

REVOKE ALL ON FUNCTION aurora.factions_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.factions_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.factions_admin(TEXT) IS
  'Admins (034): the current world''s factions with members and seen_at. Empty for anyone who is not an aurora admin.';
