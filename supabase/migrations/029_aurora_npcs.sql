-- Migration 029: A-Life NPC groups and outposts on the live map
-- Created: 2026-10-02
-- Description: owner decisions, 2026-10-02: the NPCs of Project A-Life are PUBLIC
--              but spoiler-safe. The map shows ONE MARKER PER NPC GROUP and each
--              OUTPOST as an AREA; admins see everything. Never public: raid
--              scouts, raid / full-scale raid / assassination parties, any group
--              hunting a named player, squad destinations and routes, and
--              outposts the mod hides from its own map. Depends on 008 (servers)
--              and 019 (aurora.is_aurora_admin()). Needs exporter 0.4.0 to have
--              anything to show; applying it first is harmless.
--
-- What is stored and what is public (VISIBILITY.md):
--
--   aurora.npc_groups      one row per group, as the exporter last reported it:
--                          faction, stance, size, centroid, whether any member is
--                          active, the most common encounter, and `sensitive`.
--                          NO client role can read the table.
--   aurora.npc_outposts    one row per outpost: faction, stance, hostile flag, the
--                          area, state, and `hidden`. Same.
--
--   aurora.npc_groups_visible     the public view: groups that are NOT sensitive,
--                                 seen in the last 3 minutes, without faction_id,
--                                 encounter or the sensitive flag.
--   aurora.npc_outposts_visible   the public view: outposts that are not hidden and
--                                 not expired, seen in the last 30 minutes.
--   aurora.npc_groups_admin(server)    every group seen in the last 3 minutes,
--   aurora.npc_outposts_admin(server)  sensitive ones included (and every outpost).
--                                      Zero rows for anyone who is not an admin.
--   aurora.prune_npcs()    the ingest's cleanup, service_role only.
--
-- FAILS CLOSED: `sensitive` defaults to TRUE and `hidden` to TRUE, and the ingest
-- stores a record that does not say otherwise as sensitive and hidden, so a row
-- reaches the public views only when the exporter said, explicitly, that it may.
--
-- Freshness. A group is shown for 3 minutes after the ingest last wrote it: the
-- exporter re-sends a live group at least every 60 s and says `npcgone` when one
-- disappears (the ingest deletes the row), so a stale row means the exporter
-- stopped, and the map should not keep drawing it. An outpost is re-sent every 10
-- minutes, hence 30 minutes. Freshness is judged on `seen_at`, the time the LIVE
-- ingest wrote the row (its own clock, set in the upsert payload), NOT on `t`,
-- which is the game server's clock and can be skewed against the database's.
-- `t` is kept (it orders `gone` deletes, and the public view still carries it).
-- A replayed old log never writes these tables (the backfill skips them), so it
-- cannot make an old state look fresh.
--
-- Same pattern as 022 and 028: a SECURITY DEFINER function answers the public
-- columns and a security_invoker view sits on it, because the tables have no client
-- grant at all. Safe to run twice. Run it as postgres (the SQL editor). ORDER:
-- apply this BEFORE deploying the new aurora-ingest (it would still run without
-- it, see supabase/README.md, but nothing would be stored).

-- ============================================================================
-- 1. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.npc_groups (
  server_id    TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  group_id     TEXT NOT NULL,
  faction_id   TEXT,
  faction_name TEXT,
  stance       TEXT,
  size         INT NOT NULL DEFAULT 1,
  x            REAL,
  y            REAL,
  z            REAL,
  source       TEXT,
  active       BOOLEAN NOT NULL DEFAULT FALSE,
  encounter    TEXT,
  sensitive    BOOLEAN NOT NULL DEFAULT TRUE,
  t            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (server_id, group_id)
);

-- An earlier copy of 029 had no seen_at: add it (existing rows take NOW(), and the
-- prune retires them within minutes).
ALTER TABLE aurora.npc_groups ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP INDEX IF EXISTS aurora.npc_groups_seen_idx;
CREATE INDEX IF NOT EXISTS npc_groups_seen_at_idx ON aurora.npc_groups (server_id, seen_at);

COMMENT ON TABLE aurora.npc_groups IS
  'One row per A-Life NPC group as aurora-ingest last saw it (029). No client role can read it: the public map uses npc_groups_visible, admins use npc_groups_admin(). sensitive defaults to TRUE.';
COMMENT ON COLUMN aurora.npc_groups.t IS
  'The record''s own time, from the game server''s clock. Orders gone deletes; NOT used for freshness.';
COMMENT ON COLUMN aurora.npc_groups.seen_at IS
  'When the live ingest last wrote the row, from the ingest''s clock, set in the upsert payload. Freshness (views, admin function, prune) is judged on this, so a skewed game clock cannot hide or resurrect rows.';
COMMENT ON COLUMN aurora.npc_groups.group_id IS
  'The exporter''s group key: squad:<id>, group:<id> or actor:<uid>.';
COMMENT ON COLUMN aurora.npc_groups.encounter IS
  'The most common encounter of the group (roamer, patrol, raid, ...). Never public.';
COMMENT ON COLUMN aurora.npc_groups.sensitive IS
  'TRUE when any member is on a raid, a full-scale raid, an assassination or is hunting a named player (this includes raid scouts). Such a group is never public. A record that does not say FALSE is stored TRUE.';

CREATE TABLE IF NOT EXISTS aurora.npc_outposts (
  server_id    TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  outpost_id   TEXT NOT NULL,
  faction_id   TEXT,
  faction_name TEXT,
  stance       TEXT,
  hostile      BOOLEAN NOT NULL DEFAULT FALSE,
  x1           REAL,
  y1           REAL,
  x2           REAL,
  y2           REAL,
  z            REAL,
  state        TEXT NOT NULL DEFAULT 'unknown',
  hidden       BOOLEAN NOT NULL DEFAULT TRUE,
  t            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (server_id, outpost_id)
);

ALTER TABLE aurora.npc_outposts ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP INDEX IF EXISTS aurora.npc_outposts_seen_idx;
CREATE INDEX IF NOT EXISTS npc_outposts_seen_at_idx ON aurora.npc_outposts (server_id, seen_at);

COMMENT ON TABLE aurora.npc_outposts IS
  'One row per A-Life outpost as aurora-ingest last saw it (029). No client role can read it: the public map uses npc_outposts_visible, admins use npc_outposts_admin(). hidden defaults to TRUE.';
COMMENT ON COLUMN aurora.npc_outposts.seen_at IS
  'When the live ingest last wrote the row (the ingest''s clock). Freshness is judged on this, not on t.';
COMMENT ON COLUMN aurora.npc_outposts.hidden IS
  'The mod''s own mapHidden flag. A hidden outpost is never public. A record that does not say FALSE is stored TRUE.';
COMMENT ON COLUMN aurora.npc_outposts.state IS
  'The mod''s site state (proposed, built, ..., expired). An expired outpost is never public.';

-- RLS on, no policy, no client grant: a client role cannot read or write either
-- table. service_role (aurora-ingest) bypasses RLS and owns every write.
ALTER TABLE aurora.npc_groups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.npc_outposts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.npc_groups   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON aurora.npc_outposts FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.npc_groups   TO service_role;
GRANT ALL ON aurora.npc_outposts TO service_role;

-- ============================================================================
-- 2. THE PUBLIC SURFACE
-- ============================================================================
-- The views are dropped before the functions they read and recreated after, so a
-- re-run (or a later change to a column list) never meets "cannot change return
-- type". All four happen in the one transaction the SQL editor runs.

DROP VIEW IF EXISTS aurora.npc_groups_visible;
DROP VIEW IF EXISTS aurora.npc_outposts_visible;
DROP FUNCTION IF EXISTS aurora.npc_groups_public();
DROP FUNCTION IF EXISTS aurora.npc_outposts_public();
DROP FUNCTION IF EXISTS aurora.npc_groups_admin(TEXT);
DROP FUNCTION IF EXISTS aurora.npc_outposts_admin(TEXT);

CREATE FUNCTION aurora.npc_groups_public()
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
     AND g.seen_at > now() - interval '3 minutes';
$$;

REVOKE ALL ON FUNCTION aurora.npc_groups_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.npc_groups_public() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.npc_groups_public() IS
  'The public NPC groups (029): not sensitive, seen in the last 3 minutes, and without faction_id, encounter or the sensitive flag. SECURITY DEFINER so anon can read it although aurora.npc_groups has no client grant.';

CREATE VIEW aurora.npc_groups_visible
WITH (security_invoker = TRUE) AS
  SELECT server_id, group_id, faction_name, stance, size, x, y, z, active, t
    FROM aurora.npc_groups_public();

REVOKE ALL ON aurora.npc_groups_visible FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.npc_groups_visible TO anon, authenticated, service_role;

COMMENT ON VIEW aurora.npc_groups_visible IS
  'The map reads this for NPC markers (029): one row per non-sensitive group seen in the last 3 minutes. security_invoker so the caller''s own EXECUTE grant on npc_groups_public() is what is checked, as in 022 and 028.';

CREATE FUNCTION aurora.npc_outposts_public()
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
     AND o.seen_at > now() - interval '30 minutes';
$$;

REVOKE ALL ON FUNCTION aurora.npc_outposts_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.npc_outposts_public() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.npc_outposts_public() IS
  'The public outposts (029): not hidden, not expired, seen in the last 30 minutes, without faction_id, state or the hidden flag.';

CREATE VIEW aurora.npc_outposts_visible
WITH (security_invoker = TRUE) AS
  SELECT server_id, outpost_id, faction_name, stance, hostile, x1, y1, x2, y2, t
    FROM aurora.npc_outposts_public();

REVOKE ALL ON aurora.npc_outposts_visible FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.npc_outposts_visible TO anon, authenticated, service_role;

COMMENT ON VIEW aurora.npc_outposts_visible IS
  'The map reads this for outpost areas (029): outposts that are not hidden and not expired, seen in the last 30 minutes.';

-- ============================================================================
-- 3. THE ADMIN PATH
-- ============================================================================
-- Modelled on 023's safehouses_admin() and 028's vehicles_admin(): the WHERE
-- clause is the gate, so a non-admin gets zero rows rather than an error. EXECUTE
-- for authenticated only; anon cannot run it at all.

CREATE FUNCTION aurora.npc_groups_admin(p_server TEXT)
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
     AND g.seen_at > now() - interval '3 minutes';
$$;

REVOKE ALL ON FUNCTION aurora.npc_groups_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.npc_groups_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.npc_groups_admin(TEXT) IS
  'Every NPC group of one server seen in the last 3 minutes, sensitive ones included, with faction_id, source and encounter (029). Empty for anyone who is not an aurora admin. SECURITY DEFINER; the WHERE clause is the gate.';

CREATE FUNCTION aurora.npc_outposts_admin(p_server TEXT)
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
     AND o.server_id = p_server;
$$;

REVOKE ALL ON FUNCTION aurora.npc_outposts_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.npc_outposts_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.npc_outposts_admin(TEXT) IS
  'Every outpost row of one server, hidden ones included, with every column (029). Empty for anyone who is not an aurora admin.';

-- ============================================================================
-- 4. PRUNE
-- ============================================================================
-- Groups unseen for p_group_minutes and outposts unseen for p_outpost_minutes go.
-- The exporter re-sends a live group every 60 s and an outpost every 10 minutes,
-- so a row older than the defaults (10 minutes, 2 hours) is a group or outpost
-- that is gone (a restart, a lost `npcgone`). aurora-ingest calls it once per run.
-- Both limits are floored at 1 minute so a bad argument cannot empty the tables.
-- Returns the rows deleted.

CREATE OR REPLACE FUNCTION aurora.prune_npcs(p_group_minutes INT DEFAULT 10, p_outpost_minutes INT DEFAULT 120)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n_groups   INT;
  n_outposts INT;
BEGIN
  p_group_minutes   := GREATEST(COALESCE(p_group_minutes, 10), 1);
  p_outpost_minutes := GREATEST(COALESCE(p_outpost_minutes, 120), 1);

  DELETE FROM aurora.npc_groups g
   WHERE g.seen_at < now() - make_interval(mins => p_group_minutes);
  GET DIAGNOSTICS n_groups = ROW_COUNT;

  DELETE FROM aurora.npc_outposts o
   WHERE o.seen_at < now() - make_interval(mins => p_outpost_minutes);
  GET DIAGNOSTICS n_outposts = ROW_COUNT;

  RETURN n_groups + n_outposts;
END;
$$;

REVOKE ALL ON FUNCTION aurora.prune_npcs(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.prune_npcs(INT, INT) TO service_role;

COMMENT ON FUNCTION aurora.prune_npcs(INT, INT) IS
  'Deletes NPC groups not seen for p_group_minutes (10) and outposts not seen for p_outpost_minutes (120); both floored at 1 (029). Called by aurora-ingest once per run. service_role only.';
