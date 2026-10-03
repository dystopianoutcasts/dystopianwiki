-- Migration 032: worlds, the current-world filter, and admin world controls
-- Created: 2026-10-02
-- Description: owner decisions, 2026-10-02:
--   * A new world (a wipe) is detected from the exporter's `world` record (exporter
--     0.6.0, T46). It switches automatically when the reported world age is under
--     24 hours; otherwise it is held as PENDING for an admin to confirm.
--   * Old-world data is KEPT as admin-only history: deaths, health samples, and an
--     archive of each player's record per world (aurora.player_history). Old live
--     state is hidden at once and pruned after 30 days (aurora.prune_old_worlds).
--   * Any Aurora admin may press the world buttons, and "this was not a wipe" must be
--     possible, so a switch never deletes anything and can be undone for 24 hours.
--   Depends on 008, 009, 018, 019, 022, 023, 027-030.
--
-- What it adds:
--
--   aurora.worlds            one row per world per server: w1, w2, ... (world_id is
--                            always 'w' || seq). status current / ended / pending / void.
--                            At most one current per server. No client grant.
--   aurora.servers.current_world_id
--   world_id on every per-server table (13 of them, see aurora.world_tagged_tables()).
--                            NULL means "not tagged yet" and counts as CURRENT, so an
--                            importer that does not tag yet keeps working; every switch
--                            first stamps the NULL rows with the world that is ending,
--                            so the tolerance never leaks old rows after a switch.
--   aurora.player_history    each player's record archived per world. No client grant.
--   aurora.is_current_world(server, world)      the filter every public path uses.
--   aurora.current_world(server)                public: the current world or no row.
--   aurora.register_world(...)                  service_role: the importer reports the
--                                               exporter's world id; adopt, switch,
--                                               pend or nothing.
--   aurora.world_switch(...)                    service_role: the one switch body.
--   aurora.prune_old_worlds(days, limit)        service_role: old live state goes.
--   worlds_admin, start_new_world, confirm_pending_world, dismiss_pending_world,
--   undo_new_world, world_leftovers, player_history_admin   admins only.
--
-- What changes: every public view and direct-read table returns current-world rows
-- only (the policies on safehouses, zones, zombie_grid, map_objects, vehicle_claims,
-- players and player_positions; positions_delayed, vehicles_rows, the npc and deaths
-- functions; the admin read functions; the home summary). No view's column list
-- changes. deaths_admin gains an optional second argument and a world_id column.
--
-- ORDER: apply 032 BEFORE deploying T48's importer. That importer calls
-- rpc/register_world; it does not stall without 032 (see supabase/README.md), but no
-- world is tracked until 032 is applied.
--
-- Safe to run twice. Run it as postgres (the SQL editor).

-- ============================================================================
-- 1. WORLDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.worlds (
  server_id                TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  world_id                 TEXT NOT NULL,
  seq                      INT NOT NULL,
  exporter_world_id        TEXT NULL,
  status                   TEXT NOT NULL CHECK (status IN ('current', 'ended', 'pending', 'void')),
  detected_by              TEXT NOT NULL CHECK (detected_by IN ('exporter', 'admin', 'migration')),
  started_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at                 TIMESTAMPTZ NULL,
  world_age_hours_at_start REAL NULL,
  exporter_started_ms      BIGINT NULL,
  note                     TEXT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (server_id, world_id),
  UNIQUE (server_id, seq),
  UNIQUE (server_id, exporter_world_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS worlds_one_current_idx
  ON aurora.worlds (server_id) WHERE status = 'current';

ALTER TABLE aurora.worlds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.worlds FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.worlds TO service_role;

COMMENT ON TABLE aurora.worlds IS
  'One row per game world (save) per server (032). world_id is ''w'' || seq. status: current (at most one per server), ended, pending (detected, waiting for an admin), void (dismissed or undone). No client grant: the public reads aurora.current_world(), admins aurora.worlds_admin().';
COMMENT ON COLUMN aurora.worlds.exporter_world_id IS
  'The exporter''s own id for the save (the `w` of its world record, a UUID). NULL for a world made by the migration or by an admin until the exporter''s first report adopts it.';
COMMENT ON COLUMN aurora.worlds.started_at IS
  'When the world became current on the site (for a confirmed pending world, the confirmation time; created_at keeps the detection time). The 24-hour undo window counts from here.';
COMMENT ON COLUMN aurora.worlds.world_age_hours_at_start IS
  'The game''s world age the exporter reported when the world was detected or adopted.';

ALTER TABLE aurora.servers ADD COLUMN IF NOT EXISTS current_world_id TEXT NULL;

COMMENT ON COLUMN aurora.servers.current_world_id IS
  'The current world (032). aurora.is_current_world() compares against it. Maintained only by the world functions.';

-- ============================================================================
-- 2. world_id ON EVERY PER-SERVER TABLE
-- ============================================================================

ALTER TABLE aurora.health_samples          ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.players                 ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.player_positions        ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.player_position_history ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.vehicles                ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.vehicle_claims          ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.safehouses              ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.zones                   ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.zombie_grid             ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.map_objects             ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.deaths                  ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.npc_groups              ADD COLUMN IF NOT EXISTS world_id TEXT NULL;
ALTER TABLE aurora.npc_outposts            ADD COLUMN IF NOT EXISTS world_id TEXT NULL;

CREATE INDEX IF NOT EXISTS health_samples_world_idx          ON aurora.health_samples (server_id, world_id);
CREATE INDEX IF NOT EXISTS players_world_idx                 ON aurora.players (server_id, world_id);
CREATE INDEX IF NOT EXISTS player_positions_world_idx        ON aurora.player_positions (server_id, world_id);
CREATE INDEX IF NOT EXISTS player_position_history_world_idx ON aurora.player_position_history (server_id, world_id);
CREATE INDEX IF NOT EXISTS vehicles_world_idx                ON aurora.vehicles (server_id, world_id);
CREATE INDEX IF NOT EXISTS vehicle_claims_world_idx          ON aurora.vehicle_claims (server_id, world_id);
CREATE INDEX IF NOT EXISTS safehouses_world_idx              ON aurora.safehouses (server_id, world_id);
CREATE INDEX IF NOT EXISTS zones_world_idx                   ON aurora.zones (server_id, world_id);
CREATE INDEX IF NOT EXISTS zombie_grid_world_idx             ON aurora.zombie_grid (server_id, world_id);
CREATE INDEX IF NOT EXISTS map_objects_world_idx             ON aurora.map_objects (server_id, world_id);
CREATE INDEX IF NOT EXISTS deaths_world_idx                  ON aurora.deaths (server_id, world_id);
CREATE INDEX IF NOT EXISTS deaths_world_user_t_idx           ON aurora.deaths (server_id, world_id, username, t DESC);
CREATE INDEX IF NOT EXISTS npc_groups_world_idx              ON aurora.npc_groups (server_id, world_id);
CREATE INDEX IF NOT EXISTS npc_outposts_world_idx            ON aurora.npc_outposts (server_id, world_id);

COMMENT ON COLUMN aurora.players.world_id IS
  'The world this row was last written in (032). One row per username per server: a player seen in a new world is the same row re-tagged. NULL = not tagged yet, counts as current.';
COMMENT ON COLUMN aurora.deaths.world_id IS
  'The world the death happened in (032). Deaths are never pruned: old worlds'' deaths are admin history (deaths_admin(server, world)).';
COMMENT ON COLUMN aurora.health_samples.world_id IS
  'The world the sample was taken in (032). Never pruned.';

-- ============================================================================
-- 3. PLAYER HISTORY (the per-world archive)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.player_history (
  server_id      TEXT NOT NULL,
  world_id       TEXT NOT NULL,
  username       TEXT NOT NULL,
  display_name   TEXT,
  hours_survived REAL,
  is_dead        BOOLEAN,
  first_seen     TIMESTAMPTZ,
  last_seen      TIMESTAMPTZ,
  last_saved_x   INT,
  last_saved_y   INT,
  archived_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (server_id, world_id, username)
);

ALTER TABLE aurora.player_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.player_history FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.player_history TO service_role;

COMMENT ON TABLE aurora.player_history IS
  'Each player''s record as it stood when their world ended (032), written by aurora.world_switch(). Admin history only, through aurora.player_history_admin(); no client grant. undo_new_world() restores from it and deletes the rows it restored.';

-- ============================================================================
-- 4. HELPERS
-- ============================================================================

-- The filter. NULL counts as current (see the header). A server with no current
-- world has only NULL-tagged rows current. Never NULL itself.
CREATE OR REPLACE FUNCTION aurora.is_current_world(p_server TEXT, p_world TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p_world IS NULL
      OR COALESCE(p_world = (SELECT s.current_world_id FROM aurora.servers s WHERE s.id = p_server), FALSE);
$$;

REVOKE ALL ON FUNCTION aurora.is_current_world(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.is_current_world(TEXT, TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.is_current_world(TEXT, TEXT) IS
  'TRUE when p_world is the server''s current world, or NULL (an untagged row counts as current) (032). The row policies call it, hence EXECUTE to anon. SECURITY DEFINER because aurora.servers is admin-only to clients.';

-- The tables that carry world_id, in one place.
CREATE OR REPLACE FUNCTION aurora.world_tagged_tables()
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT ARRAY['health_samples', 'players', 'player_positions', 'player_position_history', 'vehicles',
               'vehicle_claims', 'safehouses', 'zones', 'zombie_grid', 'map_objects', 'deaths',
               'npc_groups', 'npc_outposts']::TEXT[];
$$;

REVOKE ALL ON FUNCTION aurora.world_tagged_tables() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.world_tagged_tables() IS
  'Internal (032): the 13 per-server tables that carry world_id.';

-- Re-tag one server's rows in every tagged table: p_from NULL stamps the untagged
-- rows, otherwise rows of world p_from move to p_to. The table names come from the
-- fixed list above (format %I); no argument is interpolated.
CREATE OR REPLACE FUNCTION aurora.world_retag(p_server TEXT, p_from TEXT, p_to TEXT)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SET search_path = ''
AS $$
DECLARE
  v_table TEXT;
  v_n     INT;
  v_total INT := 0;
BEGIN
  IF p_to IS NULL THEN
    RETURN 0;
  END IF;
  FOREACH v_table IN ARRAY aurora.world_tagged_tables() LOOP
    IF p_from IS NULL THEN
      EXECUTE format('UPDATE aurora.%I SET world_id = $2 WHERE server_id = $1 AND world_id IS NULL', v_table)
        USING p_server, p_to;
    ELSE
      EXECUTE format('UPDATE aurora.%I SET world_id = $3 WHERE server_id = $1 AND world_id = $2', v_table)
        USING p_server, p_from, p_to;
    END IF;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_total := v_total + v_n;
  END LOOP;
  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION aurora.world_retag(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.world_retag(TEXT, TEXT, TEXT) IS
  'Internal (032): sets world_id = p_to on one server''s rows of every tagged table that are untagged (p_from NULL) or in world p_from. Called only by the SECURITY DEFINER world functions.';

-- ============================================================================
-- 5. THE SWITCH
-- ============================================================================
-- One transaction (the caller's). Never deletes anything:
--   1. stamp the server's untagged rows with the current world;
--   2. archive the current world's players into player_history (upsert);
--   3. clear their per-world fields (hours_survived, is_dead, last_saved_x/y, online);
--      display_name, first_seen, last_seen and linked_user_id stay;
--   4. end the current world;
--   5. make the new world current: an existing PENDING row (p_pending_world_id), or a
--      new row w<max seq + 1>;
--   6. point servers.current_world_id at it.
-- With no current world, steps 1-4 do nothing and untagged rows stay NULL.

CREATE OR REPLACE FUNCTION aurora.world_switch(
  p_server            TEXT,
  p_exporter_world_id TEXT,
  p_detected_by       TEXT,
  p_age               REAL,
  p_started_ms        BIGINT,
  p_note              TEXT,
  p_pending_world_id  TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur TEXT;
  v_seq INT;
  v_new TEXT;
BEGIN
  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'world_switch: unknown server %', p_server USING ERRCODE = '22023';
  END IF;
  IF p_pending_world_id IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM aurora.worlds w
        WHERE w.server_id = p_server AND w.world_id = p_pending_world_id AND w.status = 'pending') THEN
    RAISE EXCEPTION 'world_switch: % is not a pending world of %', p_pending_world_id, p_server;
  END IF;

  IF v_cur IS NOT NULL THEN
    PERFORM aurora.world_retag(p_server, NULL, v_cur);

    INSERT INTO aurora.player_history AS h
           (server_id, world_id, username, display_name, hours_survived, is_dead,
            first_seen, last_seen, last_saved_x, last_saved_y, archived_at)
    SELECT p.server_id, v_cur, p.username, p.display_name, p.hours_survived, p.is_dead,
           p.first_seen, p.last_seen, p.last_saved_x, p.last_saved_y, now()
      FROM aurora.players p
     WHERE p.server_id = p_server
       AND p.world_id = v_cur
    ON CONFLICT (server_id, world_id, username) DO UPDATE
       SET display_name   = EXCLUDED.display_name,
           hours_survived = EXCLUDED.hours_survived,
           is_dead        = EXCLUDED.is_dead,
           first_seen     = EXCLUDED.first_seen,
           last_seen      = EXCLUDED.last_seen,
           last_saved_x   = EXCLUDED.last_saved_x,
           last_saved_y   = EXCLUDED.last_saved_y,
           archived_at    = EXCLUDED.archived_at;

    UPDATE aurora.players p
       SET hours_survived = NULL,
           is_dead        = NULL,
           last_saved_x   = NULL,
           last_saved_y   = NULL,
           online         = FALSE
     WHERE p.server_id = p_server
       AND p.world_id = v_cur;

    UPDATE aurora.worlds w
       SET status = 'ended', ended_at = now()
     WHERE w.server_id = p_server
       AND w.world_id = v_cur;
  END IF;

  IF p_pending_world_id IS NOT NULL THEN
    UPDATE aurora.worlds w
       SET status = 'current', started_at = now(), ended_at = NULL, note = COALESCE(p_note, w.note)
     WHERE w.server_id = p_server
       AND w.world_id = p_pending_world_id;
    v_new := p_pending_world_id;
  ELSE
    SELECT COALESCE(max(w.seq), 0) + 1 INTO v_seq FROM aurora.worlds w WHERE w.server_id = p_server;
    v_new := 'w' || v_seq;
    INSERT INTO aurora.worlds
           (server_id, world_id, seq, exporter_world_id, status, detected_by, started_at,
            world_age_hours_at_start, exporter_started_ms, note)
    VALUES (p_server, v_new, v_seq, p_exporter_world_id, 'current', p_detected_by, now(),
            p_age, p_started_ms, p_note);
  END IF;

  UPDATE aurora.servers s SET current_world_id = v_new WHERE s.id = p_server;
  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION aurora.world_switch(TEXT, TEXT, TEXT, REAL, BIGINT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.world_switch(TEXT, TEXT, TEXT, REAL, BIGINT, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION aurora.world_switch(TEXT, TEXT, TEXT, REAL, BIGINT, TEXT, TEXT) IS
  'The one switch body (032): stamps untagged rows with the ending world, archives its players to player_history, clears their per-world fields, ends it, makes the new world (or the pending row p_pending_world_id) current. Never deletes. Returns the new world_id. service_role only; the admin functions call it as definer.';

-- ============================================================================
-- 6. register_world: what the importer calls with the exporter's world record
-- ============================================================================
--   0. validate the id: 8-64 characters of [A-Za-z0-9-] (the exporter sends a UUID).
--   1. the id is known (a world of ANY status has it):
--        current          -> that world, switched false;
--        ended or void    -> the server's current world (an admin moved on);
--        pending          -> the current world, status 'pending'.
--   2. no current world   -> create w<seq> current, stamp untagged rows to it.
--   3. ADOPT: the current world has no exporter id (made by this migration or by
--      start_new_world) -> it takes the reported id. No switch. (Contract amendment,
--      2026-10-02: otherwise the first report after 032 would look like a wipe.)
--   4. otherwise a new world: age NULL or under 24 hours -> switch; else PENDING.
-- p_new (the exporter's own "new save" flag) is accepted for the record and not used:
-- the owner's rule is the world age.

CREATE OR REPLACE FUNCTION aurora.register_world(
  p_server            TEXT,
  p_exporter_world_id TEXT,
  p_new               BOOLEAN,
  p_world_age_hours   REAL,
  p_started_ms        BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur     TEXT;
  v_status  TEXT;
  v_cur_exp TEXT;
  v_seq     INT;
  v_new     TEXT;
BEGIN
  IF p_exporter_world_id IS NULL
     OR length(p_exporter_world_id) NOT BETWEEN 8 AND 64
     OR p_exporter_world_id !~ '^[A-Za-z0-9-]+$' THEN
    RAISE EXCEPTION 'register_world: the exporter world id must be 8-64 characters of A-Z, a-z, 0-9 and -'
      USING ERRCODE = '22023';
  END IF;

  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'register_world: unknown server %', p_server USING ERRCODE = '22023';
  END IF;

  -- 1. known id (any status)
  SELECT w.status INTO v_status
    FROM aurora.worlds w
   WHERE w.server_id = p_server
     AND w.exporter_world_id = p_exporter_world_id;
  IF FOUND THEN
    IF v_status = 'current' THEN
      RETURN jsonb_build_object('world_id', v_cur, 'status', 'current', 'switched', FALSE);
    ELSIF v_status = 'pending' THEN
      RETURN jsonb_build_object('world_id', v_cur, 'status', 'pending', 'switched', FALSE);
    END IF;
    RETURN jsonb_build_object('world_id', v_cur, 'status', CASE WHEN v_cur IS NULL THEN NULL ELSE 'current' END,
                              'switched', FALSE);
  END IF;

  -- 2. first world of the server
  IF v_cur IS NULL THEN
    v_new := aurora.world_switch(p_server, p_exporter_world_id, 'exporter', p_world_age_hours, p_started_ms, NULL);
    PERFORM aurora.world_retag(p_server, NULL, v_new);
    RETURN jsonb_build_object('world_id', v_new, 'status', 'current', 'switched', TRUE);
  END IF;

  -- 3. adopt
  SELECT w.exporter_world_id INTO v_cur_exp
    FROM aurora.worlds w
   WHERE w.server_id = p_server
     AND w.world_id = v_cur;
  IF v_cur_exp IS NULL THEN
    UPDATE aurora.worlds w
       SET exporter_world_id        = p_exporter_world_id,
           exporter_started_ms      = p_started_ms,
           world_age_hours_at_start = COALESCE(w.world_age_hours_at_start, p_world_age_hours)
     WHERE w.server_id = p_server
       AND w.world_id = v_cur;
    RETURN jsonb_build_object('world_id', v_cur, 'status', 'current', 'switched', FALSE, 'adopted', TRUE);
  END IF;

  -- 4. a new world
  IF p_world_age_hours IS NULL OR p_world_age_hours < 24 THEN
    v_new := aurora.world_switch(p_server, p_exporter_world_id, 'exporter', p_world_age_hours, p_started_ms, NULL);
    RETURN jsonb_build_object('world_id', v_new, 'status', 'current', 'switched', TRUE);
  END IF;

  SELECT COALESCE(max(w.seq), 0) + 1 INTO v_seq FROM aurora.worlds w WHERE w.server_id = p_server;
  INSERT INTO aurora.worlds
         (server_id, world_id, seq, exporter_world_id, status, detected_by, started_at,
          world_age_hours_at_start, exporter_started_ms)
  VALUES (p_server, 'w' || v_seq, v_seq, p_exporter_world_id, 'pending', 'exporter', now(),
          p_world_age_hours, p_started_ms);
  RETURN jsonb_build_object('world_id', v_cur, 'status', 'pending', 'switched', FALSE);
END;
$$;

REVOKE ALL ON FUNCTION aurora.register_world(TEXT, TEXT, BOOLEAN, REAL, BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.register_world(TEXT, TEXT, BOOLEAN, REAL, BIGINT) TO service_role;

COMMENT ON FUNCTION aurora.register_world(TEXT, TEXT, BOOLEAN, REAL, BIGINT) IS
  'The importer reports the exporter''s world id (032). Returns {world_id, status, switched} (plus adopted: true when an id-less current world takes the id). Known id: no change. No current world: create one. Current world without an exporter id: adopt. New id: switch when the world age is NULL or under 24 h, else hold it pending. service_role only.';

-- ============================================================================
-- 7. PRUNE OLD WORLDS
-- ============================================================================
-- Live state of worlds that ended more than p_days ago goes, at most p_limit rows per
-- table per call. Never deaths, health_samples, players or player_history (history).

CREATE OR REPLACE FUNCTION aurora.prune_old_worlds(p_days INT DEFAULT 30, p_limit INT DEFAULT 5000)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_table TEXT;
  v_n     INT;
  v_total INT := 0;
BEGIN
  p_days  := GREATEST(COALESCE(p_days, 30), 1);
  p_limit := GREATEST(COALESCE(p_limit, 5000), 0);
  FOREACH v_table IN ARRAY ARRAY['player_positions', 'player_position_history', 'vehicles', 'vehicle_claims',
                                 'safehouses', 'zones', 'zombie_grid', 'map_objects', 'npc_groups',
                                 'npc_outposts']::TEXT[] LOOP
    EXECUTE format(
      'WITH doomed AS (
         SELECT x.ctid AS rid
           FROM aurora.%I x
           JOIN aurora.worlds w ON w.server_id = x.server_id AND w.world_id = x.world_id
           JOIN aurora.servers s ON s.id = x.server_id
          WHERE x.world_id IS NOT NULL
            AND x.world_id IS DISTINCT FROM s.current_world_id
            AND w.ended_at < now() - make_interval(days => $1)
          LIMIT $2
       ), gone AS (
         DELETE FROM aurora.%I y USING doomed d WHERE y.ctid = d.rid RETURNING 1
       )
       SELECT count(*)::int FROM gone', v_table, v_table)
      INTO v_n
      USING p_days, p_limit;
    v_total := v_total + v_n;
  END LOOP;
  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION aurora.prune_old_worlds(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.prune_old_worlds(INT, INT) TO service_role;

COMMENT ON FUNCTION aurora.prune_old_worlds(INT, INT) IS
  'Deletes live-state rows of worlds that ended more than p_days (30) ago from the 10 live tables, at most p_limit (5000) per table per call (032). Never deaths, health_samples, players or player_history. service_role; T48 calls it once per run.';

-- ============================================================================
-- 8. PUBLIC: the current world
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.current_world(p_server TEXT)
RETURNS TABLE (world_id TEXT, seq INT, started_at TIMESTAMPTZ, detected_by TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT w.world_id, w.seq, w.started_at, w.detected_by
    FROM aurora.worlds w
    JOIN aurora.servers s ON s.id = w.server_id AND s.current_world_id = w.world_id
   WHERE w.server_id = p_server
     AND w.status = 'current';
$$;

REVOKE ALL ON FUNCTION aurora.current_world(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.current_world(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.current_world(TEXT) IS
  'Public (032): the server''s current world (world_id, seq, started_at, detected_by), or no row.';

-- ============================================================================
-- 9. ADMIN WORLD CONTROLS
-- ============================================================================
-- Readers: the WHERE clause (or an early RETURN NULL) is the gate, a non-admin gets
-- nothing. Writers: RAISE for a non-admin (SQLSTATE 42501). A refused button (not
-- pending, undo window passed, nothing to go back to) RAISEs with the default SQLSTATE
-- P0001 and a readable message, which the admin page shows as a refusal (T49).
-- EXECUTE to authenticated only.

CREATE OR REPLACE FUNCTION aurora.worlds_admin(p_server TEXT)
RETURNS SETOF aurora.worlds
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT w.*
    FROM aurora.worlds w
   WHERE aurora.is_aurora_admin()
     AND w.server_id = p_server
   ORDER BY w.seq DESC;
$$;

REVOKE ALL ON FUNCTION aurora.worlds_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.worlds_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.worlds_admin(TEXT) IS
  'Every world of one server, newest first (032). Empty for anyone who is not an aurora admin.';

CREATE OR REPLACE FUNCTION aurora.start_new_world(p_server TEXT, p_note TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'start_new_world: aurora admins only' USING ERRCODE = '42501';
  END IF;
  RETURN aurora.world_switch(p_server, NULL, 'admin', NULL, NULL, p_note);
END;
$$;

REVOKE ALL ON FUNCTION aurora.start_new_world(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.start_new_world(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.start_new_world(TEXT, TEXT) IS
  'Admin (032): end the current world and start a new one with no exporter id (the exporter''s next report adopts it). Undo within 24 hours with undo_new_world(). Returns the new world_id.';

CREATE OR REPLACE FUNCTION aurora.confirm_pending_world(p_server TEXT, p_world_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'confirm_pending_world: aurora admins only' USING ERRCODE = '42501';
  END IF;
  RETURN aurora.world_switch(p_server, NULL, 'exporter', NULL, NULL, NULL, p_world_id);
END;
$$;

REVOKE ALL ON FUNCTION aurora.confirm_pending_world(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.confirm_pending_world(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.confirm_pending_world(TEXT, TEXT) IS
  'Admin (032): the pending world becomes current through the same switch as any other. RAISEs when p_world_id is not pending. Returns it.';

CREATE OR REPLACE FUNCTION aurora.dismiss_pending_world(p_server TEXT, p_world_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'dismiss_pending_world: aurora admins only' USING ERRCODE = '42501';
  END IF;
  UPDATE aurora.worlds w
     SET status = 'void'
   WHERE w.server_id = p_server
     AND w.world_id = p_world_id
     AND w.status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'dismiss_pending_world: % is not a pending world of %', p_world_id, p_server;
  END IF;
  RETURN p_world_id;
END;
$$;

REVOKE ALL ON FUNCTION aurora.dismiss_pending_world(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.dismiss_pending_world(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.dismiss_pending_world(TEXT, TEXT) IS
  'Admin (032): "this was not a wipe" for a pending world: it becomes void, and the exporter id stays known so it never pends again. Returns it.';

-- Undo the last switch within 24 hours: the current world's rows go back to the most
-- recently ended world, players get their archived fields back (and the archive rows
-- are deleted), the current world becomes void and the previous one current again.
CREATE OR REPLACE FUNCTION aurora.undo_new_world(p_server TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur     TEXT;
  v_started TIMESTAMPTZ;
  v_prev    TEXT;
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RAISE EXCEPTION 'undo_new_world: aurora admins only' USING ERRCODE = '42501';
  END IF;

  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server FOR UPDATE;
  IF v_cur IS NULL THEN
    RAISE EXCEPTION 'undo_new_world: % has no current world', p_server;
  END IF;
  SELECT w.started_at INTO v_started FROM aurora.worlds w WHERE w.server_id = p_server AND w.world_id = v_cur;
  IF v_started IS NULL OR v_started <= now() - INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'undo_new_world: world % started more than 24 hours ago and can no longer be undone', v_cur;
  END IF;
  SELECT w.world_id INTO v_prev
    FROM aurora.worlds w
   WHERE w.server_id = p_server
     AND w.status = 'ended'
   ORDER BY w.ended_at DESC NULLS LAST, w.seq DESC
   LIMIT 1;
  IF v_prev IS NULL THEN
    RAISE EXCEPTION 'undo_new_world: % has no earlier world to go back to', p_server;
  END IF;

  PERFORM aurora.world_retag(p_server, v_cur, v_prev);

  UPDATE aurora.players p
     SET hours_survived = h.hours_survived,
         is_dead        = h.is_dead,
         last_saved_x   = h.last_saved_x,
         last_saved_y   = h.last_saved_y
    FROM aurora.player_history h
   WHERE h.server_id = p_server
     AND h.world_id = v_prev
     AND p.server_id = p_server
     AND p.username = h.username;

  DELETE FROM aurora.player_history h
   WHERE h.server_id = p_server
     AND h.world_id = v_prev;

  UPDATE aurora.worlds w
     SET status = 'void', ended_at = now()
   WHERE w.server_id = p_server
     AND w.world_id = v_cur;
  UPDATE aurora.worlds w
     SET status = 'current', ended_at = NULL
   WHERE w.server_id = p_server
     AND w.world_id = v_prev;
  UPDATE aurora.servers s SET current_world_id = v_prev WHERE s.id = p_server;
  RETURN v_prev;
END;
$$;

REVOKE ALL ON FUNCTION aurora.undo_new_world(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.undo_new_world(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.undo_new_world(TEXT) IS
  'Admin (032): undo the last switch while the current world is under 24 hours old. Rows re-tagged to the previous world, player fields restored from player_history (those archive rows deleted), current world void, previous current. RAISEs otherwise. Returns the reopened world_id.';

-- Counts for the admin notice "New world detected on <date>. Leftovers: ...".
CREATE OR REPLACE FUNCTION aurora.world_leftovers(p_server TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur     TEXT;
  v_table   TEXT;
  v_n       BIGINT;
  v_out     JSONB := '{}'::jsonb;
  v_pending JSONB;
BEGIN
  IF NOT aurora.is_aurora_admin() THEN
    RETURN NULL;
  END IF;
  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server;
  FOREACH v_table IN ARRAY aurora.world_tagged_tables() LOOP
    EXECUTE format('SELECT count(*) FROM aurora.%I WHERE server_id = $1 AND world_id IS NOT NULL AND world_id IS DISTINCT FROM $2',
                   v_table)
      INTO v_n
      USING p_server, v_cur;
    v_out := v_out || jsonb_build_object(v_table, v_n);
  END LOOP;

  SELECT count(*) INTO v_n
    FROM aurora.vehicle_claims c
   WHERE c.server_id = p_server
     AND (c.world_id IS NULL OR c.world_id = v_cur)
     AND NOT EXISTS (
           SELECT 1 FROM aurora.vehicles v
            WHERE v.server_id = c.server_id
              AND v.sql_id = c.sql_id
              AND (v.world_id IS NULL OR v.world_id = v_cur));

  SELECT to_jsonb(w) INTO v_pending
    FROM aurora.worlds w
   WHERE w.server_id = p_server
     AND w.status = 'pending'
   ORDER BY w.seq DESC
   LIMIT 1;

  RETURN v_out || jsonb_build_object('vehicle_claims_stale', v_n, 'pending', v_pending);
END;
$$;

REVOKE ALL ON FUNCTION aurora.world_leftovers(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.world_leftovers(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.world_leftovers(TEXT) IS
  'Admin (032): {<table>: rows not in the current world, ..., vehicle_claims_stale: current-world claims whose car has no current-world vehicles row, pending: the newest pending world row or null}. NULL for anyone who is not an aurora admin.';

CREATE OR REPLACE FUNCTION aurora.player_history_admin(p_server TEXT, p_world_id TEXT)
RETURNS SETOF aurora.player_history
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT h.*
    FROM aurora.player_history h
   WHERE aurora.is_aurora_admin()
     AND h.server_id = p_server
     AND h.world_id = p_world_id
   ORDER BY h.username;
$$;

REVOKE ALL ON FUNCTION aurora.player_history_admin(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.player_history_admin(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.player_history_admin(TEXT, TEXT) IS
  'Admin (032): the archived player records of one world. Empty for anyone who is not an aurora admin.';

-- ============================================================================
-- 10. THE FILTER ON EVERY PUBLIC PATH
-- ============================================================================

-- 10a. Direct-read tables (009, 028): the same policy name, current world only. The
-- column grants are unchanged; the policy reads world_id itself.

DROP POLICY IF EXISTS "aurora safehouses are publicly readable" ON aurora.safehouses;
CREATE POLICY "aurora safehouses are publicly readable"
  ON aurora.safehouses FOR SELECT
  USING (aurora.is_current_world(server_id, world_id));

DROP POLICY IF EXISTS "aurora zones are publicly readable" ON aurora.zones;
CREATE POLICY "aurora zones are publicly readable"
  ON aurora.zones FOR SELECT
  USING (aurora.is_current_world(server_id, world_id));

DROP POLICY IF EXISTS "aurora zombie grid is publicly readable" ON aurora.zombie_grid;
CREATE POLICY "aurora zombie grid is publicly readable"
  ON aurora.zombie_grid FOR SELECT
  USING (aurora.is_current_world(server_id, world_id));

DROP POLICY IF EXISTS "aurora map objects are publicly readable" ON aurora.map_objects;
CREATE POLICY "aurora map objects are publicly readable"
  ON aurora.map_objects FOR SELECT
  USING (aurora.is_current_world(server_id, world_id));

DROP POLICY IF EXISTS "aurora vehicle claims are publicly readable" ON aurora.vehicle_claims;
CREATE POLICY "aurora vehicle claims are publicly readable"
  ON aurora.vehicle_claims FOR SELECT
  USING (aurora.is_current_world(server_id, world_id));

DROP POLICY IF EXISTS "aurora players are publicly readable" ON aurora.players;
CREATE POLICY "aurora players are publicly readable"
  ON aurora.players FOR SELECT
  USING (aurora.is_current_world(server_id, world_id));

COMMENT ON POLICY "aurora players are publicly readable" ON aurora.players
  IS 'Current-world rows (032); column grants restrict which columns anon and authenticated may read.';

-- 10b. Live positions (009): both policies AND the filter.

DROP POLICY IF EXISTS "aurora admins see all live positions" ON aurora.player_positions;
CREATE POLICY "aurora admins see all live positions"
  ON aurora.player_positions FOR SELECT
  USING (aurora.is_aurora_admin() AND aurora.is_current_world(server_id, world_id));

DROP POLICY IF EXISTS "aurora users see own and safehouse live positions" ON aurora.player_positions;
CREATE POLICY "aurora users see own and safehouse live positions"
  ON aurora.player_positions FOR SELECT
  TO authenticated
  USING (
    aurora.is_current_world(server_id, world_id)
    AND (server_id, username) IN (
      SELECT v.server_id, v.username FROM aurora.visible_live_usernames() v
    )
  );

COMMENT ON POLICY "aurora users see own and safehouse live positions" ON aurora.player_positions
  IS 'Own linked characters plus anyone sharing a safehouse with them, current world only (032). Everyone else arrives rounded and delayed through aurora.player_positions_visible.';

-- 10c. The policy helpers (008): current-world players and safehouses only.

CREATE OR REPLACE FUNCTION aurora.my_usernames()
RETURNS TABLE (server_id TEXT, username TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT p.server_id, p.username
    FROM aurora.players p
   WHERE auth.uid() IS NOT NULL
     AND p.linked_user_id = auth.uid()
     AND aurora.is_current_world(p.server_id, p.world_id);
$$;

COMMENT ON FUNCTION aurora.my_usernames() IS
  'The caller''s linked characters, current world only (008, world filter 032).';

CREATE OR REPLACE FUNCTION aurora.visible_live_usernames()
RETURNS TABLE (server_id TEXT, username TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  WITH mine AS (
    SELECT m.server_id AS server_id, m.username AS username FROM aurora.my_usernames() m
  )
  SELECT mine.server_id, mine.username FROM mine
  UNION
  SELECT s.server_id, peer.username
    FROM aurora.safehouses s
    JOIN mine
      ON mine.server_id = s.server_id
     AND (mine.username = s.owner OR mine.username = ANY (s.players))
   CROSS JOIN LATERAL unnest(
     COALESCE(s.players, ARRAY[]::TEXT[]) || ARRAY[s.owner]
   ) AS peer(username)
   WHERE peer.username IS NOT NULL
     AND aurora.is_current_world(s.server_id, s.world_id);
$$;

COMMENT ON FUNCTION aurora.visible_live_usernames() IS
  'The caller''s own characters plus their current-world safehouse peers (008, world filter 032).';

-- 10d. positions_delayed (018): same shape, current-world history and players only.

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
      JOIN aurora.servers sv
        ON sv.id = h.server_id
      JOIN aurora.players p
        ON p.server_id = h.server_id
       AND p.username  = h.username
       AND p.online
     WHERE h.t <= NOW() - make_interval(mins => g.delay_minutes)
       AND (h.world_id IS NULL OR h.world_id = sv.current_world_id)
       AND (p.world_id IS NULL OR p.world_id = sv.current_world_id)
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
  'Latest position per ONLINE character in the CURRENT world (032), older than settings.visibility.delayMinutes, rounded to cell, with is_delayed/is_rounded reflecting the live settings. Offline characters are never returned. The only client-reachable path to player_position_history.';

-- 10e. vehicles_rows (028): same shape; vehicles and claims of the current world only,
-- in the join, in the ledger-only half, and in that half's "has a vehicles row" test.
-- An old world's claim never reaches the map, even while the claim mod's file still
-- lists it, and never lends its owner to a new car that reuses its sql id.

CREATE OR REPLACE FUNCTION aurora.vehicles_rows()
RETURNS TABLE (
  server_id       TEXT,
  vehicle_id      INT,
  script_name     TEXT,
  x               REAL,
  y               REAL,
  z               REAL,
  t               TIMESTAMPTZ,
  claimed_by      TEXT,
  sql_id          BIGINT,
  from_ledger     BOOLEAN,
  driver_username TEXT,
  claimed_at      TIMESTAMPTZ,
  last_seen       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  WITH cw AS (
    SELECT s.id AS server_id, s.current_world_id AS world_id FROM aurora.servers s
  ),
  matched AS (
    SELECT v.server_id    AS v_server,
           v.vehicle_id   AS v_id,
           v.script_name  AS v_script,
           v.x            AS v_x,
           v.y            AS v_y,
           v.z            AS v_z,
           v.t            AS v_t,
           v.sql_id       AS v_sql,
           v.claimed_by   AS v_owner,
           v.driver_username AS v_driver,
           c.sql_id       AS c_sql,
           c.owner        AS c_owner,
           c.x            AS c_x,
           c.y            AS c_y,
           c.last_seen    AS c_seen,
           c.claimed_at   AS c_claimed
      FROM aurora.vehicles v
      JOIN cw
        ON cw.server_id = v.server_id
       AND (v.world_id IS NULL OR v.world_id = cw.world_id)
      LEFT JOIN aurora.vehicle_claims c
        ON c.server_id = v.server_id
       AND c.sql_id = v.sql_id
       AND (c.world_id IS NULL OR c.world_id = cw.world_id)
       AND (COALESCE(c.script, '') = ''
            OR COALESCE(v.script_name, '') = ''
            OR lower(regexp_replace(c.script, '^.*\.', '')) = lower(regexp_replace(v.script_name, '^.*\.', '')))
  )
  SELECT m.v_server,
         m.v_id,
         m.v_script,
         CASE WHEN m.c_seen IS NOT NULL AND (m.v_t IS NULL OR m.c_seen > m.v_t) THEN m.c_x::real ELSE m.v_x END,
         CASE WHEN m.c_seen IS NOT NULL AND (m.v_t IS NULL OR m.c_seen > m.v_t) THEN m.c_y::real ELSE m.v_y END,
         m.v_z,
         m.v_t,
         COALESCE(m.c_owner, m.v_owner),
         m.v_sql,
         (m.c_seen IS NOT NULL AND (m.v_t IS NULL OR m.c_seen > m.v_t)),
         m.v_driver,
         m.c_claimed,
         m.c_seen
    FROM matched m
   WHERE m.v_t > NOW() - INTERVAL '24 hours'
      OR m.c_sql IS NOT NULL
      OR m.v_owner IS NOT NULL
  UNION ALL
  SELECT c.server_id,
         aurora.vehicle_park_id(c.sql_id),
         c.script,
         c.x::real,
         c.y::real,
         0::real,
         to_timestamp(0),
         c.owner,
         c.sql_id,
         TRUE,
         NULL::text,
         c.claimed_at,
         c.last_seen
    FROM aurora.vehicle_claims c
    JOIN cw
      ON cw.server_id = c.server_id
     AND (c.world_id IS NULL OR c.world_id = cw.world_id)
   WHERE NOT EXISTS (
           SELECT 1
             FROM aurora.vehicles v
            WHERE v.server_id = c.server_id
              AND v.sql_id = c.sql_id
              AND (v.world_id IS NULL OR v.world_id = cw.world_id)
              AND (COALESCE(c.script, '') = ''
                   OR COALESCE(v.script_name, '') = ''
                   OR lower(regexp_replace(c.script, '^.*\.', '')) = lower(regexp_replace(v.script_name, '^.*\.', ''))));
$$;

REVOKE ALL ON FUNCTION aurora.vehicles_rows() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.vehicles_rows() TO service_role;

COMMENT ON FUNCTION aurora.vehicles_rows() IS
  'Internal (028, world filter 032): every current-world car the map may show, with every column including the private ones. Called only by vehicles_public() and vehicles_admin(), both SECURITY DEFINER; no client role can execute it.';

-- The ingest's vehicle writer (028) stamps the server's current world on every row it
-- inserts or updates: a car of a new world that reuses an old row's sql id takes that
-- row over, and must not stay tagged with the old world (it would vanish from the map).
-- Signature, grants and the four statements are otherwise unchanged.
CREATE OR REPLACE FUNCTION aurora.upsert_vehicles(p_server TEXT, p_rows JSONB)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n_keyed  INT;
  n_legacy INT;
  v_world  TEXT;
BEGIN
  SELECT s.current_world_id INTO v_world FROM aurora.servers s WHERE s.id = p_server;

  UPDATE aurora.vehicles v
     SET vehicle_id = aurora.vehicle_park_id(v.sql_id)
    FROM jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT)
   WHERE v.server_id = p_server
     AND v.sql_id IS NOT NULL
     AND v.vehicle_id <> aurora.vehicle_park_id(v.sql_id)
     AND ((i.sql_id = v.sql_id AND i.vehicle_id <> v.vehicle_id)
          OR (i.vehicle_id = v.vehicle_id AND i.sql_id IS DISTINCT FROM v.sql_id));

  DELETE FROM aurora.vehicles v
   USING jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT)
   WHERE v.server_id = p_server
     AND v.sql_id IS NULL
     AND i.sql_id IS NOT NULL
     AND v.vehicle_id = i.vehicle_id;

  INSERT INTO aurora.vehicles AS v
         (server_id, vehicle_id, sql_id, script_name, x, y, z, t, driver_username, claimed_by, world_id)
  SELECT p_server, i.vehicle_id, i.sql_id, i.script_name, i.x, i.y, i.z, i.t, i.driver_username, i.claimed_by, v_world
    FROM jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT, script_name TEXT, x REAL, y REAL,
                                         z REAL, t TIMESTAMPTZ, driver_username TEXT, claimed_by TEXT)
   WHERE i.sql_id IS NOT NULL
  ON CONFLICT (server_id, sql_id) DO UPDATE
     SET vehicle_id      = EXCLUDED.vehicle_id,
         script_name     = EXCLUDED.script_name,
         x               = EXCLUDED.x,
         y               = EXCLUDED.y,
         z               = EXCLUDED.z,
         t               = EXCLUDED.t,
         driver_username = EXCLUDED.driver_username,
         claimed_by      = EXCLUDED.claimed_by,
         world_id        = EXCLUDED.world_id;
  GET DIAGNOSTICS n_keyed = ROW_COUNT;

  INSERT INTO aurora.vehicles AS v
         (server_id, vehicle_id, script_name, x, y, z, t, driver_username, world_id)
  SELECT p_server, i.vehicle_id, i.script_name, i.x, i.y, i.z, i.t, i.driver_username, v_world
    FROM jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT, script_name TEXT, x REAL, y REAL,
                                         z REAL, t TIMESTAMPTZ, driver_username TEXT, claimed_by TEXT)
   WHERE i.sql_id IS NULL
  ON CONFLICT (server_id, vehicle_id) DO UPDATE
     SET script_name     = EXCLUDED.script_name,
         x               = EXCLUDED.x,
         y               = EXCLUDED.y,
         z               = EXCLUDED.z,
         t               = EXCLUDED.t,
         driver_username = EXCLUDED.driver_username,
         world_id        = EXCLUDED.world_id;
  GET DIAGNOSTICS n_legacy = ROW_COUNT;

  RETURN n_keyed + n_legacy;
END;
$$;

REVOKE ALL ON FUNCTION aurora.upsert_vehicles(TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.upsert_vehicles(TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION aurora.upsert_vehicles(TEXT, JSONB) IS
  'aurora-ingest''s vehicle writer (028): one row per car across restarts, ids that moved are parked or replaced instead of colliding. Every row written is tagged with the server''s current world (032). service_role only.';

-- A released claim clears claimed_by only on a car of the same world (028 cleared it
-- on any car with the sql id): pruning an old world's claim must not unclaim a new
-- world's car that reuses the id.
CREATE OR REPLACE FUNCTION aurora.vehicle_claim_released()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE aurora.vehicles v
     SET claimed_by = NULL
   WHERE v.server_id = OLD.server_id
     AND v.sql_id = OLD.sql_id
     AND v.claimed_by IS NOT NULL
     AND (OLD.world_id IS NULL OR v.world_id IS NULL OR v.world_id = OLD.world_id);
  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION aurora.vehicle_claim_released() IS
  'Trigger (028, world rule 032): a claim leaving the ledger clears claimed_by on its car, only when the car is in the claim''s world.';

-- prune_vehicles (028): also takes cars of a non-current world older than p_days,
-- claimed or not, and an old world's claim no longer protects a current car.
CREATE OR REPLACE FUNCTION aurora.prune_vehicles(p_days INT DEFAULT 14, p_limit INT DEFAULT 5000)
RETURNS INT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH doomed AS (
    SELECT v.ctid AS row_id
      FROM aurora.vehicles v
     WHERE COALESCE(v.t, '-infinity'::timestamptz) < NOW() - make_interval(days => p_days)
       AND ((v.claimed_by IS NULL
             AND NOT EXISTS (
                   SELECT 1
                     FROM aurora.vehicle_claims c
                    WHERE c.server_id = v.server_id
                      AND c.sql_id = v.sql_id
                      AND aurora.is_current_world(c.server_id, c.world_id)))
            OR NOT aurora.is_current_world(v.server_id, v.world_id))
     ORDER BY v.t NULLS FIRST
     LIMIT p_limit
  ),
  gone AS (
    DELETE FROM aurora.vehicles v
     USING doomed d
     WHERE v.ctid = d.row_id
    RETURNING 1
  )
  SELECT count(*)::int FROM gone;
$$;

REVOKE ALL ON FUNCTION aurora.prune_vehicles(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.prune_vehicles(INT, INT) TO service_role;

COMMENT ON FUNCTION aurora.prune_vehicles(INT, INT) IS
  'Deletes vehicle rows not seen for p_days days that are unclaimed in the current world, or belong to a world that is not current (claimed or not), at most p_limit per call (028, world rule 032). Called by aurora-ingest once per run.';

-- vehicles_admin (028) reads vehicles_rows(), so it is current-world already.
COMMENT ON FUNCTION aurora.vehicles_admin(TEXT) IS
  'The same cars as vehicles_public() for one server (028; current world only through vehicles_rows(), 032), plus driver_username and the ledger''s claimed_at and last_seen. Empty for anyone who is not an aurora admin.';

-- 10f. NPCs (029): same shapes, current world only.

CREATE OR REPLACE FUNCTION aurora.npc_groups_public()
RETURNS TABLE (
  server_id    TEXT,
  group_id     TEXT,
  faction_name TEXT,
  stance       TEXT,
  size         INT,
  x            REAL,
  y            REAL,
  z            REAL,
  active       BOOLEAN,
  t            TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT g.server_id, g.group_id, g.faction_name, g.stance, g.size, g.x, g.y, g.z, g.active, g.t
    FROM aurora.npc_groups g
   WHERE NOT g.sensitive
     AND g.seen_at > now() - interval '3 minutes'
     AND aurora.is_current_world(g.server_id, g.world_id);
$$;

COMMENT ON FUNCTION aurora.npc_groups_public() IS
  'The public NPC groups (029, world filter 032): current world, not sensitive, seen in the last 3 minutes, and without faction_id, encounter or the sensitive flag.';

CREATE OR REPLACE FUNCTION aurora.npc_outposts_public()
RETURNS TABLE (
  server_id    TEXT,
  outpost_id   TEXT,
  faction_name TEXT,
  stance       TEXT,
  hostile      BOOLEAN,
  x1           REAL,
  y1           REAL,
  x2           REAL,
  y2           REAL,
  t            TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT o.server_id, o.outpost_id, o.faction_name, o.stance, o.hostile, o.x1, o.y1, o.x2, o.y2, o.t
    FROM aurora.npc_outposts o
   WHERE NOT o.hidden
     AND o.state IS DISTINCT FROM 'expired'
     AND o.seen_at > now() - interval '30 minutes'
     AND aurora.is_current_world(o.server_id, o.world_id);
$$;

COMMENT ON FUNCTION aurora.npc_outposts_public() IS
  'The public outposts (029, world filter 032): current world, not hidden, not expired, seen in the last 30 minutes.';

CREATE OR REPLACE FUNCTION aurora.npc_groups_admin(p_server TEXT)
RETURNS TABLE (
  server_id    TEXT,
  group_id     TEXT,
  faction_id   TEXT,
  faction_name TEXT,
  stance       TEXT,
  size         INT,
  x            REAL,
  y            REAL,
  z            REAL,
  source       TEXT,
  active       BOOLEAN,
  encounter    TEXT,
  sensitive    BOOLEAN,
  t            TIMESTAMPTZ,
  seen_at      TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT g.server_id, g.group_id, g.faction_id, g.faction_name, g.stance, g.size, g.x, g.y, g.z,
         g.source, g.active, g.encounter, g.sensitive, g.t, g.seen_at
    FROM aurora.npc_groups g
   WHERE aurora.is_aurora_admin()
     AND g.server_id = p_server
     AND g.seen_at > now() - interval '3 minutes'
     AND aurora.is_current_world(g.server_id, g.world_id);
$$;

COMMENT ON FUNCTION aurora.npc_groups_admin(TEXT) IS
  'Every current-world NPC group of one server seen in the last 3 minutes, sensitive ones included (029, world filter 032). Empty for anyone who is not an aurora admin.';

CREATE OR REPLACE FUNCTION aurora.npc_outposts_admin(p_server TEXT)
RETURNS TABLE (
  server_id    TEXT,
  outpost_id   TEXT,
  faction_id   TEXT,
  faction_name TEXT,
  stance       TEXT,
  hostile      BOOLEAN,
  x1           REAL,
  y1           REAL,
  x2           REAL,
  y2           REAL,
  z            REAL,
  state        TEXT,
  hidden       BOOLEAN,
  t            TIMESTAMPTZ,
  seen_at      TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT o.server_id, o.outpost_id, o.faction_id, o.faction_name, o.stance, o.hostile,
         o.x1, o.y1, o.x2, o.y2, o.z, o.state, o.hidden, o.t, o.seen_at
    FROM aurora.npc_outposts o
   WHERE aurora.is_aurora_admin()
     AND o.server_id = p_server
     AND aurora.is_current_world(o.server_id, o.world_id);
$$;

COMMENT ON FUNCTION aurora.npc_outposts_admin(TEXT) IS
  'Every current-world outpost row of one server, hidden ones included (029, world filter 032). Empty for anyone who is not an aurora admin.';

-- 10g. Deaths (030). The public function keeps its shape: each player's latest death
-- IN THE CURRENT WORLD. deaths_admin gains p_world_id (NULL = current; a world id =
-- that world's deaths, the history) and a world_id column, so the one-argument form is
-- dropped (two overloads would make PostgREST's choice ambiguous).

CREATE OR REPLACE FUNCTION aurora.deaths_public()
RETURNS TABLE (
  server_id      TEXT,
  username       TEXT,
  x              REAL,
  y              REAL,
  z              REAL,
  t              TIMESTAMPTZ,
  hours_survived REAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT ON (d.server_id, d.username)
         d.server_id, d.username, d.x, d.y, d.z, d.t, d.hours_survived
    FROM aurora.deaths d
    JOIN aurora.servers s
      ON s.id = d.server_id
   WHERE d.world_id IS NULL OR d.world_id = s.current_world_id
   ORDER BY d.server_id, d.username, d.t DESC;
$$;

COMMENT ON FUNCTION aurora.deaths_public() IS
  'The public deaths (030, world filter 032): each player''s most recent death in the current world only, without src or id.';

DROP FUNCTION IF EXISTS aurora.deaths_admin(TEXT);
DROP FUNCTION IF EXISTS aurora.deaths_admin(TEXT, TEXT);

CREATE FUNCTION aurora.deaths_admin(p_server TEXT, p_world_id TEXT DEFAULT NULL)
RETURNS TABLE (
  id             BIGINT,
  server_id      TEXT,
  username       TEXT,
  x              REAL,
  y              REAL,
  z              REAL,
  t              TIMESTAMPTZ,
  src            TEXT,
  hours_survived REAL,
  world_id       TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT d.id, d.server_id, d.username, d.x, d.y, d.z, d.t, d.src, d.hours_survived, d.world_id
    FROM aurora.deaths d
   WHERE aurora.is_aurora_admin()
     AND d.server_id = p_server
     AND CASE WHEN p_world_id IS NULL THEN aurora.is_current_world(d.server_id, d.world_id)
              ELSE d.world_id = p_world_id END
   ORDER BY d.t DESC;
$$;

REVOKE ALL ON FUNCTION aurora.deaths_admin(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.deaths_admin(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.deaths_admin(TEXT, TEXT) IS
  'Deaths of one server, newest first, with src and world_id (030, worlds 032). p_world_id NULL = the current world; a world id = that world''s deaths (history). Empty for anyone who is not an aurora admin.';

-- 10h. The admin full-row functions (023): current world only.

CREATE OR REPLACE FUNCTION aurora.safehouses_admin()
RETURNS SETOF aurora.safehouses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT * FROM aurora.safehouses s
   WHERE aurora.is_aurora_admin()
     AND aurora.is_current_world(s.server_id, s.world_id);
$$;

COMMENT ON FUNCTION aurora.safehouses_admin() IS
  'Full current-world safehouse rows (players, last_visited, created_at included) for aurora admins only (023, world filter 032). Empty for anyone else.';

CREATE OR REPLACE FUNCTION aurora.map_objects_admin()
RETURNS SETOF aurora.map_objects
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT * FROM aurora.map_objects m
   WHERE aurora.is_aurora_admin()
     AND aurora.is_current_world(m.server_id, m.world_id);
$$;

COMMENT ON FUNCTION aurora.map_objects_admin() IS
  'Full current-world map_objects rows (meta included) for aurora admins only (023, world filter 032). Empty for anyone else.';

-- 10i. Home summary (030). Same signature, SECURITY DEFINER, empty search_path, every
-- key kept. Current-world rows only for online_now, survivors_total, survivors_7d,
-- longest_survivors, safehouses, players_killed_today, zombies_killed_today and
-- world_age_hours. peak_7d and hourly_7d stay UNFILTERED on purpose: they describe the
-- server's activity (players online), not the world's. vehicles counts
-- vehicles_public(), which is current-world already. New keys: world_seq,
-- world_started_at, world_pending. The current world is read once (srv, one indexed
-- row) and compared as a value, never a per-row function call. On health_samples the
-- test is written COALESCE(world_id, cur) IS NOT DISTINCT FROM cur (same meaning as
-- "NULL or cur") on purpose: the OR form is indexable on (server_id, world_id), and the
-- planner then preferred a bitmap scan of a whole world over the (server_id, t) key
-- range, which made the summary about 20% slower on 100k samples.

CREATE OR REPLACE FUNCTION aurora.home_summary_tz(p_server TEXT, p_tz TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH tz AS (
    SELECT aurora.safe_tz(p_tz) AS name
  ),
  dy AS (
    SELECT (date_trunc('day', now() AT TIME ZONE tz.name) AT TIME ZONE tz.name) AS start_t,
           tz.name AS name
      FROM tz
  ),
  srv AS (
    SELECT s.name, s.last_seen, s.last_launch_stamp, s.game_version, s.current_world_id
      FROM aurora.servers s
     WHERE s.id = p_server
  ),
  wld AS (
    SELECT w.seq, w.started_at
      FROM aurora.worlds w
     WHERE w.server_id = p_server
       AND w.world_id = (SELECT current_world_id FROM srv)
  ),
  ply AS (
    SELECT p.*
      FROM aurora.players p
     WHERE p.server_id = p_server
       AND (p.world_id IS NULL OR p.world_id = (SELECT current_world_id FROM srv))
  ),
  week AS (
    SELECT date_trunc('hour', h.t) AS hr, max(h.players) AS peak
      FROM aurora.health_samples h
     WHERE h.server_id = p_server
       AND h.t > NOW() - INTERVAL '7 days'
     GROUP BY 1
  ),
  latest AS (
    SELECT h.raw
      FROM aurora.health_samples h
     WHERE h.server_id = p_server
       AND COALESCE(h.world_id, (SELECT current_world_id FROM srv)) IS NOT DISTINCT FROM (SELECT current_world_id FROM srv)
     ORDER BY h.t DESC
     LIMIT 1
  ),
  kill_series AS (
    (SELECT h.t, (h.raw #>> '{game,zombies-killed}')::numeric AS v
       FROM aurora.health_samples h
      WHERE h.server_id = p_server
        AND h.t < (SELECT start_t FROM dy)
        AND h.t >= (SELECT start_t FROM dy) - INTERVAL '2 days'
        AND COALESCE(h.world_id, (SELECT current_world_id FROM srv)) IS NOT DISTINCT FROM (SELECT current_world_id FROM srv)
        AND jsonb_typeof(h.raw #> '{game,zombies-killed}') = 'number'
      ORDER BY h.t DESC
      LIMIT 1)
    UNION ALL
    (SELECT h.t, (h.raw #>> '{game,zombies-killed}')::numeric AS v
       FROM aurora.health_samples h
      WHERE h.server_id = p_server
        AND h.t >= (SELECT start_t FROM dy)
        AND COALESCE(h.world_id, (SELECT current_world_id FROM srv)) IS NOT DISTINCT FROM (SELECT current_world_id FROM srv)
        AND jsonb_typeof(h.raw #> '{game,zombies-killed}') = 'number')
  ),
  kill_deltas AS (
    SELECT t, v, lag(v) OVER (ORDER BY t) AS pv FROM kill_series
  ),
  kills_today AS (
    SELECT CASE WHEN count(*) FILTER (WHERE d.t >= dy.start_t) = 0 THEN NULL
                ELSE COALESCE(sum(
                       CASE WHEN d.t < dy.start_t THEN 0
                            WHEN d.pv IS NULL THEN d.v
                            WHEN d.v >= d.pv THEN d.v - d.pv
                            ELSE d.v
                       END), 0)
           END AS n
      FROM kill_deltas d, dy
  ),
  cfg AS (
    SELECT c.settings, c.sandbox, c.updated_at
      FROM aurora.server_config c
     WHERE c.server_id = p_server
  )
  SELECT jsonb_build_object(
    'server_name', (SELECT name FROM srv),
    'last_seen', (SELECT last_seen FROM srv),
    'up_since', (
      SELECT (to_timestamp(last_launch_stamp, 'YYYY-MM-DD_HH24-MI')::timestamp AT TIME ZONE 'UTC')
        FROM srv
       WHERE last_launch_stamp ~ '^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$'
    ),
    'online_now', (
      SELECT count(*) FROM ply p WHERE p.online
    ),
    'survivors_total', (
      SELECT count(*) FROM ply p
    ),
    'survivors_7d', (
      SELECT count(*) FROM ply p WHERE p.last_seen > NOW() - INTERVAL '7 days'
    ),
    'peak_7d', (SELECT max(peak) FROM week),
    'hourly_7d', COALESCE((
      SELECT jsonb_agg(jsonb_build_array(extract(epoch FROM hr)::bigint, peak) ORDER BY hr)
        FROM week
    ), '[]'::jsonb),
    'zombies_killed_today', (SELECT n FROM kills_today),
    'players_killed_today', (
      SELECT count(*) FROM aurora.deaths d, dy
       WHERE d.server_id = p_server AND d.t >= dy.start_t
         AND (d.world_id IS NULL OR d.world_id = (SELECT current_world_id FROM srv))
    ),
    'world_age_hours', (
      SELECT CASE WHEN jsonb_typeof(raw #> '{game,world-age-hours}') = 'number'
                  THEN (raw #>> '{game,world-age-hours}')::numeric END
        FROM latest
    ),
    'game_version', (SELECT game_version FROM srv),
    'day_tz', (SELECT name FROM dy),
    'world_seq', (SELECT seq FROM wld),
    'world_started_at', (SELECT started_at FROM wld),
    'world_pending', EXISTS (
      SELECT 1 FROM aurora.worlds w WHERE w.server_id = p_server AND w.status = 'pending'
    ),
    'longest_survivors', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'hours', hours, 'online', online) ORDER BY hours DESC, name)
        FROM (SELECT COALESCE(NULLIF(btrim(p.display_name), ''), p.username) AS name,
                     round(p.hours_survived::numeric, 1) AS hours,
                     p.online
                FROM ply p
               WHERE p.hours_survived IS NOT NULL
                 AND p.hours_survived > 0
                 AND p.is_dead IS NOT TRUE
               ORDER BY p.hours_survived DESC, p.username
               LIMIT 5) top
    ), '[]'::jsonb),
    'safehouses', (
      SELECT count(*) FROM aurora.safehouses s
       WHERE s.server_id = p_server
         AND (s.world_id IS NULL OR s.world_id = (SELECT current_world_id FROM srv))
    ),
    'vehicles', (SELECT count(*) FROM aurora.vehicles_public() vp WHERE vp.server_id = p_server),
    'settings', COALESCE((
      SELECT jsonb_object_agg(e.key, e.value)
        FROM cfg, jsonb_each(cfg.settings) e
       WHERE e.key = ANY (ARRAY[
         'PublicName', 'PublicDescription', 'ServerWelcomeMessage', 'MaxPlayers', 'PVP',
         'Open', 'Public', 'HasPassword', 'PauseEmpty', 'Mods', 'WorkshopItems', 'Map',
         'SafetySystem', 'PlayerSafehouse', 'SafehouseDaySurvivedToClaim', 'Faction',
         'SleepAllowed', 'SleepNeeded', 'AnnounceDeath', 'DropOffWhiteListAfterDeath',
         'VoiceEnable', 'War'
       ])
    ), '{}'::jsonb),
    'sandbox', COALESCE((
      SELECT jsonb_object_agg(e.key, e.value)
        FROM cfg, jsonb_each(cfg.sandbox) e
       WHERE e.key = ANY (ARRAY[
         'Zombies', 'Distribution', 'ZombieRespawn', 'DayLength', 'StartMonth', 'TimeSinceApo',
         'WaterShut', 'ElecShut', 'Helicopter', 'EnableVehicles', 'CarSpawnRate',
         'HoursForLootRespawn', 'ZombieLore.Speed', 'ZombieLore.SprinterPercentage',
         'ZombieLore.Strength', 'ZombieLore.Toughness', 'ZombieLore.Transmission',
         'ZombieLore.Mortality', 'ZombieLore.Reanimate', 'ZombieLore.Cognition',
         'ZombieLore.Sight', 'ZombieLore.Hearing', 'MultiplierConfig.Global',
         'MultiplierConfig.GlobalToggle'
       ])
    ), '{}'::jsonb),
    'config_updated_at', (SELECT updated_at FROM cfg)
  );
$$;

REVOKE ALL ON FUNCTION aurora.home_summary_tz(TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.home_summary_tz(TEXT, TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.home_summary_tz(TEXT, TEXT) IS
  'Public (030, worlds 032): the home page''s server totals, "today" from midnight in p_tz. Player, safehouse, death, kill and world-age figures count the current world only; peak_7d and hourly_7d are server activity and stay unfiltered. world_seq, world_started_at, world_pending describe the world. Aggregates only.';

-- ============================================================================
-- 11. BOOTSTRAP: every existing server gets w1
-- ============================================================================
-- A server with no current world gets w<next seq> (w1 on a first run), detected_by
-- 'migration', started at the server's first_seen, and its untagged rows stamped to
-- it. A server that already has a current world is skipped, so a second run changes
-- nothing. A server created later gets its first world from register_world (branch 2),
-- and the exporter's first report adopts a migration world (branch 3).

CREATE OR REPLACE FUNCTION aurora.world_bootstrap()
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SET search_path = ''
AS $$
DECLARE
  v_srv RECORD;
  v_seq INT;
  v_id  TEXT;
  v_n   INT := 0;
BEGIN
  FOR v_srv IN
    SELECT sv.id, sv.first_seen
      FROM aurora.servers sv
     WHERE NOT EXISTS (SELECT 1 FROM aurora.worlds w WHERE w.server_id = sv.id AND w.status = 'current')
     ORDER BY sv.id
       FOR UPDATE
  LOOP
    SELECT COALESCE(max(w.seq), 0) + 1 INTO v_seq FROM aurora.worlds w WHERE w.server_id = v_srv.id;
    v_id := 'w' || v_seq;
    INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at, note)
    VALUES (v_srv.id, v_id, v_seq, 'current', 'migration', COALESCE(v_srv.first_seen, now()),
            'The world that was running when migration 032 introduced worlds.');
    UPDATE aurora.servers s SET current_world_id = v_id WHERE s.id = v_srv.id;
    PERFORM aurora.world_retag(v_srv.id, NULL, v_id);
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.world_bootstrap() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.world_bootstrap() IS
  'Internal (032): gives every server without a current world its first world and stamps its untagged rows. Idempotent. Run by this migration as postgres.';

SELECT aurora.world_bootstrap();
