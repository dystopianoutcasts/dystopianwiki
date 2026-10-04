-- Migration 040: safehouses and zones follow the game - removed in game, removed from the map
-- Created: 2026-10-04
-- Description: exporter 0.7.4 ends every safehouse and zone pass with one `wpass`
--              marker whose `t` is the `t` of every `sh` and `zone` record of that
--              pass. The importer stamps each row with that `t` (seen_at) and, after
--              the batch's upserts, calls aurora.apply_world_pass(server, t): every
--              current-world safehouse and zone the pass did not list goes. A
--              read-time guard hides rows a lost marker would leave behind. Depends
--              on 008, 009, 023, 032 and 039 (latest home_summary_tz). Safe to run
--              twice. Run it as postgres.
--
-- Why (2026-10-04): the map showed two safehouses claimed by kitten near
-- Rosewood. Safehouse and zone rows were only ever upserted; nothing deleted
-- one, so a safehouse released, removed by an admin or replaced stayed on the
-- map for good. The map mirrors the game and enforces no rule: if the game
-- lists two safehouses for one player, the map shows two.
--
-- What it adds:
--   aurora.safehouses.seen_at, aurora.zones.seen_at   the `t` of the pass that last
--                                     listed the row (NULL: written before 0.7.4).
--   aurora.world_passes              one row per server: the newest complete pass.
--                                     service_role only; no client grant.
--   aurora.apply_world_pass(server, seen_at)   service_role: delete what the pass
--                                     did not list (current world only); an older
--                                     pass than the stored one changes nothing.
--   aurora.seen_in_recent_pass(table, server, seen_at)   the read-time rule: a row
--                                     shows only if its seen_at is within 25 minutes
--                                     of the server's newest seen_at in that table,
--                                     or the server has no seen_at there at all yet.
--                                     The only place the 25 minutes lives.
--
-- The read-time rule is applied in: the public select policies on safehouses and
-- zones (032's world rule kept), safehouses_admin(), home_summary_tz's safehouse
-- count (039's body otherwise byte for byte), and visible_live_usernames() (a
-- safehouse the game no longer lists must not share live positions).
--
-- The window: passes run every 600 s and on every safehouse change, so a listed
-- row is at most 10 minutes behind the newest. 25 minutes = two missed passes and
-- margin. If one marker is lost, the next pass (10 minutes) deletes the rows.
--
-- Rows of an ended world are never touched here; aurora.prune_old_worlds (032)
-- takes them. seen_at is stamped by the game host's clock, like every other `t`.

-- ============================================================================
-- 1. COLUMNS
-- ============================================================================

ALTER TABLE aurora.safehouses ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ NULL;
ALTER TABLE aurora.zones      ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN aurora.safehouses.seen_at IS
  'The t of the exporter pass that last listed this safehouse (040). NULL: written before exporter 0.7.4; deleted by the server''s first world pass.';
COMMENT ON COLUMN aurora.zones.seen_at IS
  'The t of the exporter pass that last listed this zone (040). NULL: written before exporter 0.7.4; deleted by the server''s first world pass.';

CREATE INDEX IF NOT EXISTS safehouses_seen_idx ON aurora.safehouses (server_id, seen_at);
CREATE INDEX IF NOT EXISTS zones_seen_idx      ON aurora.zones (server_id, seen_at);

-- ============================================================================
-- 2. THE NEWEST PASS PER SERVER
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.world_passes (
  server_id  TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  seen_at    TIMESTAMPTZ NOT NULL,
  safehouses INT,
  zones      INT,
  PRIMARY KEY (server_id)
);

ALTER TABLE aurora.world_passes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.world_passes FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.world_passes TO service_role;

COMMENT ON TABLE aurora.world_passes IS
  'The newest complete safehouse and zone pass per server (040), written by aurora.apply_world_pass(). safehouses and zones: current-world rows left after that pass. service_role only.';

-- ============================================================================
-- 3. THE READ-TIME RULE
-- ============================================================================
-- SECURITY DEFINER: the policies below call it, and it reads the table it guards;
-- as the owner it bypasses that table's row security (no recursion) and sees the
-- seen_at column, which anon may not select on safehouses.

CREATE OR REPLACE FUNCTION aurora.seen_in_recent_pass(p_table TEXT, p_server TEXT, p_seen_at TIMESTAMPTZ)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH newest AS (
    SELECT CASE p_table
             WHEN 'safehouses' THEN (SELECT max(s.seen_at) FROM aurora.safehouses s WHERE s.server_id = p_server)
             WHEN 'zones'      THEN (SELECT max(z.seen_at) FROM aurora.zones z WHERE z.server_id = p_server)
           END AS t
  )
  SELECT CASE
           WHEN p_table IS NULL OR p_table NOT IN ('safehouses', 'zones') THEN FALSE
           WHEN n.t IS NULL THEN TRUE
           ELSE COALESCE(p_seen_at >= n.t - INTERVAL '25 minutes', FALSE)
         END
    FROM newest n;
$$;

REVOKE ALL ON FUNCTION aurora.seen_in_recent_pass(TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.seen_in_recent_pass(TEXT, TEXT, TIMESTAMPTZ) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.seen_in_recent_pass(TEXT, TEXT, TIMESTAMPTZ) IS
  'The read-time rule for safehouses and zones (040): TRUE when p_seen_at is within 25 minutes of the server''s newest seen_at in p_table, or the server has no seen_at there yet. A NULL p_seen_at on a server that has one is FALSE. Any other p_table is FALSE. The only place the 25 minutes lives. The row policies call it, hence EXECUTE to anon.';

-- ============================================================================
-- 4. APPLY A PASS
-- ============================================================================
-- One call, one transaction. The upsert on world_passes locks the server's row, so
-- two calls for one server run one after the other; its WHERE refuses an older
-- pass, which then deletes nothing (an out-of-order replay never removes rows a
-- newer pass listed). The same pass twice deletes nothing the first call left.

CREATE OR REPLACE FUNCTION aurora.apply_world_pass(p_server TEXT, p_seen_at TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_taken BOOLEAN;
  v_sh    INT := 0;
  v_zn    INT := 0;
BEGIN
  IF p_server IS NULL OR p_seen_at IS NULL
     OR NOT EXISTS (SELECT 1 FROM aurora.servers s WHERE s.id = p_server) THEN
    RETURN jsonb_build_object('safehouses_removed', 0, 'zones_removed', 0);
  END IF;

  INSERT INTO aurora.world_passes AS wp (server_id, seen_at)
  VALUES (p_server, p_seen_at)
  ON CONFLICT (server_id) DO UPDATE
    SET seen_at = EXCLUDED.seen_at
  WHERE wp.seen_at <= EXCLUDED.seen_at
  RETURNING TRUE INTO v_taken;

  IF v_taken IS NULL THEN
    RETURN jsonb_build_object('safehouses_removed', 0, 'zones_removed', 0);
  END IF;

  WITH gone AS (
    DELETE FROM aurora.safehouses s
     WHERE s.server_id = p_server
       AND (s.seen_at IS NULL OR s.seen_at < p_seen_at)
       AND aurora.is_current_world(s.server_id, s.world_id)
    RETURNING 1
  )
  SELECT count(*)::int INTO v_sh FROM gone;

  WITH gone AS (
    DELETE FROM aurora.zones z
     WHERE z.server_id = p_server
       AND (z.seen_at IS NULL OR z.seen_at < p_seen_at)
       AND aurora.is_current_world(z.server_id, z.world_id)
    RETURNING 1
  )
  SELECT count(*)::int INTO v_zn FROM gone;

  UPDATE aurora.world_passes wp
     SET safehouses = (SELECT count(*)::int FROM aurora.safehouses s
                        WHERE s.server_id = p_server AND aurora.is_current_world(s.server_id, s.world_id)),
         zones      = (SELECT count(*)::int FROM aurora.zones z
                        WHERE z.server_id = p_server AND aurora.is_current_world(z.server_id, z.world_id))
   WHERE wp.server_id = p_server;

  RETURN jsonb_build_object('safehouses_removed', v_sh, 'zones_removed', v_zn);
END;
$$;

REVOKE ALL ON FUNCTION aurora.apply_world_pass(TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.apply_world_pass(TEXT, TIMESTAMPTZ) TO service_role;

COMMENT ON FUNCTION aurora.apply_world_pass(TEXT, TIMESTAMPTZ) IS
  'Apply one complete exporter pass (040): unless p_seen_at is older than the stored newest pass, delete the server''s current-world safehouses and zones with seen_at NULL or older than p_seen_at, and store the pass in aurora.world_passes. Returns {safehouses_removed, zones_removed} (both 0 when ignored). Ended worlds are left to prune_old_worlds. service_role only; the importer calls it after the batch''s upserts.';

-- ============================================================================
-- 5. READ-TIME GUARD: the public select policies (032's world rule kept)
-- ============================================================================
-- Same names, same command, same roles (none named: PUBLIC). Column and table
-- grants are untouched: anon still selects the 023 safehouse columns only (not
-- seen_at); zones keep 009's table grant.

DROP POLICY IF EXISTS "aurora safehouses are publicly readable" ON aurora.safehouses;
CREATE POLICY "aurora safehouses are publicly readable"
  ON aurora.safehouses FOR SELECT
  USING (aurora.is_current_world(server_id, world_id)
         AND aurora.seen_in_recent_pass('safehouses', server_id, seen_at));

COMMENT ON POLICY "aurora safehouses are publicly readable" ON aurora.safehouses
  IS 'Current-world rows (032) that the game still lists: aurora.seen_in_recent_pass (040).';

DROP POLICY IF EXISTS "aurora zones are publicly readable" ON aurora.zones;
CREATE POLICY "aurora zones are publicly readable"
  ON aurora.zones FOR SELECT
  USING (aurora.is_current_world(server_id, world_id)
         AND aurora.seen_in_recent_pass('zones', server_id, seen_at));

COMMENT ON POLICY "aurora zones are publicly readable" ON aurora.zones
  IS 'Current-world rows (032) that the game still lists: aurora.seen_in_recent_pass (040).';

-- ============================================================================
-- 6. READ-TIME GUARD: the functions that list safehouses
-- ============================================================================

-- 6a. safehouses_admin (023, world filter 032).
CREATE OR REPLACE FUNCTION aurora.safehouses_admin()
RETURNS SETOF aurora.safehouses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT * FROM aurora.safehouses s
   WHERE aurora.is_aurora_admin()
     AND aurora.is_current_world(s.server_id, s.world_id)
     AND aurora.seen_in_recent_pass('safehouses', s.server_id, s.seen_at);
$$;

COMMENT ON FUNCTION aurora.safehouses_admin() IS
  'Full current-world safehouse rows (players, last_visited, created_at, seen_at included) that the game still lists, for aurora admins only (023, world filter 032, read-time rule 040). Empty for anyone else.';

-- 6b. visible_live_usernames (008, world filter 032): a safehouse the game no
-- longer lists does not share live positions.
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
     AND aurora.is_current_world(s.server_id, s.world_id)
     AND aurora.seen_in_recent_pass('safehouses', s.server_id, s.seen_at);
$$;

COMMENT ON FUNCTION aurora.visible_live_usernames() IS
  'The caller''s own characters plus their current-world safehouse peers, from safehouses the game still lists (008, world filter 032, read-time rule 040).';

-- ============================================================================
-- 7. READ-TIME GUARD: home_summary_tz's safehouse count
-- ============================================================================
-- 039's definition (the latest), byte for byte, except the safehouses expression.

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
      SELECT count(*) FROM ply p WHERE p.online AND p.last_seen IS NOT NULL AND p.last_seen > now() - aurora.presence_window()
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
    'world_pending', aurora.is_aurora_admin() AND EXISTS (
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
         AND aurora.seen_in_recent_pass('safehouses', s.server_id, s.seen_at)
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
  'Public (030, worlds 032, presence 039, passes 040): the home page''s server totals, "today" from midnight in p_tz. Player, safehouse, death, kill and world-age figures count the current world only; peak_7d and hourly_7d are server activity and stay unfiltered. online_now counts players flagged online with a position within aurora.presence_window() (039). safehouses counts only rows aurora.seen_in_recent_pass() shows (040). world_seq, world_started_at, world_pending describe the world (world_pending is admin-only: false for everyone else). Aggregates only.';
