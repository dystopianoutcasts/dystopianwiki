-- Migration 008: OutcastAurora Schema
-- Created: 2026-09-28
-- Description: `aurora` schema - live server state for the map application.
--              Tables, indexes, helper functions, and grants. RLS lands in 009.
--
-- Ordering note: the RLS policies in 009 call helper functions defined at the
-- bottom of this file, so 008 must be applied before 009.

-- ============================================================================
-- SCHEMA
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS aurora;

COMMENT ON SCHEMA aurora IS
  'OutcastAurora: live Project Zomboid server state (positions, health, safehouses, catalog).';

-- The schema is reachable, but every table denies by default: 009 enables RLS on
-- all of them and issues the only client-facing grants, column by column.
-- Deny-by-default is deliberate; add narrow grants, never blanket ones.
GRANT USAGE ON SCHEMA aurora TO anon, authenticated, service_role;

-- ============================================================================
-- ADMIN FLAG (public.user_profiles)
-- ============================================================================
-- No admin flag existed on user_profiles before this migration.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_aurora_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.user_profiles.is_aurora_admin IS
  'Aurora map administrator: sees every player position live, un-rounded and un-delayed.';

-- ============================================================================
-- LINK CODE GENERATOR
-- ============================================================================
-- Defined before the tables because aurora.link_codes uses it as a DEFAULT.

CREATE OR REPLACE FUNCTION aurora.gen_link_code()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = pg_catalog, pg_temp
AS $$
  -- 8 uppercase hex characters (~4.3e9 codes). A collision raises a primary-key
  -- violation and the caller retries; codes are short-lived by design.
  SELECT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- ============================================================================
-- COORDINATE HELPERS
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.round_to_cell(v REAL)
RETURNS REAL
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = pg_catalog, pg_temp
AS $$
  -- A B42 cell is 256 squares. Round to the centre of the containing cell.
  SELECT (floor(v / 256.0) * 256.0 + 128.0)::REAL;
$$;

COMMENT ON FUNCTION aurora.round_to_cell(REAL) IS
  'Snap a world coordinate to the centre of its 256-square B42 cell.';

-- ============================================================================
-- SERVERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.servers (
  id                TEXT PRIMARY KEY,          -- stable slug, e.g. outcasts-main
  name              TEXT,
  first_seen        TIMESTAMPTZ DEFAULT NOW(),
  last_seen         TIMESTAMPTZ,
  last_launch_stamp TEXT,                      -- changes when the server restarts
  game_version      TEXT
);

-- ============================================================================
-- HEALTH SAMPLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.health_samples (
  server_id             TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  t                     TIMESTAMPTZ NOT NULL,
  players               INT,
  zombies_total         INT,
  zombies_loaded        INT,
  zombies_simulated     INT,
  zombies_culled        INT,
  loaded_cells          INT,
  memory_used           BIGINT,
  memory_max            BIGINT,
  avg_update_period_ms  REAL,
  sent_bps              REAL,
  received_bps          REAL,
  raw                   JSONB,
  PRIMARY KEY (server_id, t)
);

-- ============================================================================
-- PLAYERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.players (
  server_id      TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  username       TEXT NOT NULL,
  display_name   TEXT,
  first_seen     TIMESTAMPTZ DEFAULT NOW(),
  last_seen      TIMESTAMPTZ,
  online         BOOLEAN NOT NULL DEFAULT FALSE,
  hours_survived REAL,
  access_level   TEXT,
  is_dead        BOOLEAN,
  last_saved_x   INT,
  last_saved_y   INT,
  linked_user_id UUID NULL REFERENCES auth.users ON DELETE SET NULL,
  PRIMARY KEY (server_id, username)
);

COMMENT ON COLUMN aurora.players.linked_user_id IS
  'Set by aurora.consume_link_code(). Never granted to anon or authenticated.';
COMMENT ON COLUMN aurora.players.last_saved_x IS
  'Exact saved coordinate. Not granted to anon or authenticated - see 009.';

-- ============================================================================
-- PLAYER POSITIONS (live, one row per character)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.player_positions (
  server_id  TEXT NOT NULL,
  username   TEXT NOT NULL,
  x          REAL,
  y          REAL,
  z          REAL,
  t          TIMESTAMPTZ,
  vehicle_id INT NULL,
  seq        BIGINT GENERATED ALWAYS AS IDENTITY,
  PRIMARY KEY (server_id, username),
  FOREIGN KEY (server_id, username)
    REFERENCES aurora.players(server_id, username) ON DELETE CASCADE
);

COMMENT ON COLUMN aurora.player_positions.seq IS
  'Identity value assigned on INSERT only; an upsert that updates a row leaves seq unchanged.';

-- ============================================================================
-- PLAYER POSITION HISTORY (append-only; source of the delayed public view)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.player_position_history (
  server_id TEXT NOT NULL,
  username  TEXT NOT NULL,
  x         REAL,
  y         REAL,
  z         REAL,
  t         TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS player_position_history_lookup_idx
  ON aurora.player_position_history (server_id, username, t DESC);

CREATE INDEX IF NOT EXISTS player_position_history_t_idx
  ON aurora.player_position_history (t);   -- aurora.prune_history()

-- ============================================================================
-- VEHICLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.vehicles (
  server_id       TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  vehicle_id      INT NOT NULL,
  script_name     TEXT,
  x               REAL,
  y               REAL,
  z               REAL,
  t               TIMESTAMPTZ,
  driver_username TEXT NULL,
  PRIMARY KEY (server_id, vehicle_id)
);

CREATE INDEX IF NOT EXISTS vehicles_driver_idx
  ON aurora.vehicles (server_id, driver_username)
  WHERE driver_username IS NOT NULL;

-- ============================================================================
-- SAFEHOUSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.safehouses (
  server_id    TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  id           TEXT NOT NULL,
  x            INT,
  y            INT,
  w            INT,
  h            INT,
  owner        TEXT,
  title        TEXT,
  players      TEXT[] DEFAULT '{}',
  last_visited TIMESTAMPTZ,
  created_at   TIMESTAMPTZ,
  PRIMARY KEY (server_id, id)
);

CREATE INDEX IF NOT EXISTS safehouses_players_idx
  ON aurora.safehouses USING GIN (players);

CREATE INDEX IF NOT EXISTS safehouses_owner_idx
  ON aurora.safehouses (server_id, owner);

-- ============================================================================
-- ZONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.zones (
  server_id TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  kind      TEXT NOT NULL,
  title     TEXT NOT NULL,
  x1        INT NOT NULL,
  y1        INT NOT NULL,
  x2        INT,
  y2        INT,
  PRIMARY KEY (server_id, kind, title, x1, y1)
);

-- ============================================================================
-- ZOMBIE GRID (per-cell counts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.zombie_grid (
  server_id TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  cell_x    INT NOT NULL,
  cell_y    INT NOT NULL,
  count     INT,
  t         TIMESTAMPTZ,
  PRIMARY KEY (server_id, cell_x, cell_y)
);

-- ============================================================================
-- MAP OBJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.map_objects (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  kind      TEXT,
  x         INT,
  y         INT,
  label     TEXT,
  meta      JSONB
);

CREATE INDEX IF NOT EXISTS map_objects_kind_idx
  ON aurora.map_objects (server_id, kind);

-- ============================================================================
-- ITEM CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.item_catalog (
  server_id       TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  full_type       TEXT NOT NULL,
  display_name    TEXT,
  category        TEXT,
  weight          REAL,
  catalog_version TEXT,
  PRIMARY KEY (server_id, full_type)
);

CREATE INDEX IF NOT EXISTS item_catalog_category_idx
  ON aurora.item_catalog (server_id, category);

-- ============================================================================
-- LINK CODES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.link_codes (
  code        TEXT PRIMARY KEY DEFAULT aurora.gen_link_code(),
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ NULL,
  username    TEXT NULL
);

CREATE INDEX IF NOT EXISTS link_codes_user_idx
  ON aurora.link_codes (user_id, created_at DESC);

-- ============================================================================
-- SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

INSERT INTO aurora.settings (key, value) VALUES
  ('visibility', '{"anonPositions": false, "delayMinutes": 30, "roundToCell": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE aurora.settings IS
  'Runtime knobs. Only the keys listed in the 009 SELECT policy are publicly readable; new keys are private by default.';

-- ============================================================================
-- INGEST CURSOR (service role only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.ingest_cursor (
  server_id   TEXT PRIMARY KEY REFERENCES aurora.servers(id) ON DELETE CASCADE,
  file_name   TEXT,
  byte_offset BIGINT,
  file_size   BIGINT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLAYER INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS players_online_idx
  ON aurora.players (server_id, online) WHERE online;

CREATE INDEX IF NOT EXISTS players_linked_user_idx
  ON aurora.players (linked_user_id) WHERE linked_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS players_last_seen_idx
  ON aurora.players (server_id, last_seen DESC);

-- ============================================================================
-- HELPER FUNCTIONS USED BY THE 009 POLICIES
-- ============================================================================
-- All three are SECURITY DEFINER and owned by the migration role (postgres), so
-- they bypass RLS and column grants on purpose. Each is narrow: it answers a
-- question about the calling user and returns nothing the caller is not already
-- entitled to. search_path is pinned on every one.

CREATE OR REPLACE FUNCTION aurora.is_aurora_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT up.is_aurora_admin FROM public.user_profiles up WHERE up.id = auth.uid()),
    FALSE
  );
$$;

COMMENT ON FUNCTION aurora.is_aurora_admin() IS
  'True when the calling user has user_profiles.is_aurora_admin. False for anonymous.';

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
     AND p.linked_user_id = auth.uid();
$$;

COMMENT ON FUNCTION aurora.my_usernames() IS
  'Characters linked to the calling user. Reads players.linked_user_id, which is not granted to clients.';

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
   WHERE peer.username IS NOT NULL;
$$;

COMMENT ON FUNCTION aurora.visible_live_usernames() IS
  'Characters the calling user may see live: own characters plus everyone sharing a safehouse with them.';

REVOKE ALL ON FUNCTION aurora.is_aurora_admin()        FROM PUBLIC;
REVOKE ALL ON FUNCTION aurora.my_usernames()           FROM PUBLIC;
REVOKE ALL ON FUNCTION aurora.visible_live_usernames() FROM PUBLIC;
REVOKE ALL ON FUNCTION aurora.round_to_cell(REAL)      FROM PUBLIC;
REVOKE ALL ON FUNCTION aurora.gen_link_code()          FROM PUBLIC;

GRANT EXECUTE ON FUNCTION aurora.is_aurora_admin()        TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.my_usernames()           TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.visible_live_usernames() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.round_to_cell(REAL)      TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.gen_link_code()          TO authenticated, service_role;

-- ============================================================================
-- SERVICE ROLE
-- ============================================================================
-- The ingest Edge Function is the only writer. service_role also carries
-- BYPASSRLS in a Supabase project, so 009 defines no write policies.

GRANT ALL ON ALL TABLES    IN SCHEMA aurora TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA aurora TO service_role;
