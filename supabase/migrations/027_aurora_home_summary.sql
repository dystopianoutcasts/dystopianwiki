-- Migration 027: the home page's server summary
-- Created: 2026-10-02
-- Description: aurora.server_config (the server's own settings, admin only), the
--              public aurora.home_summary() the home page reads, and the two
--              player columns VISIBILITY.md always said were not public.
--              Depends on 008, 009, 010, 019 and 022.
--
-- The owner approved, on 2026-10-02, publishing these TOTALS on the home page:
-- players online over the last 7 days and peak hours, "up since" the last
-- restart, zombies killed and players lost today, and the longest-living
-- survivors. The rows behind them stay admin only (022): home_summary() is a
-- SECURITY DEFINER function that returns aggregates and a fixed list of settings,
-- never a raw health row, a position, an account link or a setting that is not on
-- its list. Run it as postgres (the SQL editor). Safe to run twice.

-- ============================================================================
-- 1. SERVER SETTINGS (written by the ingest, read by admins and home_summary)
-- ============================================================================
-- settings: the .ini keys packages/shared/aurora/serverconfig.ts keeps. Never
--           a password, token or id: the parser drops those before the row is
--           written, and only says whether a join password is set (HasPassword).
-- sandbox:  SandboxVars flattened to "Section.Key" -> {"v": value, "label": text}.

CREATE TABLE IF NOT EXISTS aurora.server_config (
  server_id  TEXT PRIMARY KEY REFERENCES aurora.servers(id) ON DELETE CASCADE,
  settings   JSONB NOT NULL DEFAULT '{}'::jsonb,
  sandbox    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE aurora.server_config ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.server_config FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.server_config TO authenticated;
GRANT ALL ON aurora.server_config TO service_role;

DROP POLICY IF EXISTS "aurora admins read server config" ON aurora.server_config;
CREATE POLICY "aurora admins read server config"
  ON aurora.server_config FOR SELECT
  USING (aurora.is_aurora_admin());

COMMENT ON TABLE aurora.server_config IS
  'The game server''s own settings, written by aurora-ingest (027). Admin only; aurora.home_summary() publishes a fixed subset.';

-- ============================================================================
-- 2. PLAYERS: access_level and first_seen are not public
-- ============================================================================
-- VISIBILITY.md (Player: access_level, first_seen) has said NO since 2026-09-29;
-- 009's column grant was never narrowed. Nothing on the site reads either column.
-- The view goes first: it is security invoker and names both columns.

DROP VIEW IF EXISTS aurora.players_public;

REVOKE SELECT (access_level, first_seen) ON aurora.players FROM anon, authenticated;

CREATE VIEW aurora.players_public
WITH (security_invoker = TRUE) AS
  SELECT p.server_id,
         p.username,
         p.display_name,
         p.last_seen,
         p.online,
         p.hours_survived,
         p.is_dead
    FROM aurora.players p;

GRANT SELECT ON aurora.players_public TO anon, authenticated;

COMMENT ON VIEW aurora.players_public IS
  'Player roster without linked_user_id, last_saved_x/y, access_level or first_seen (027). Security invoker.';

-- ============================================================================
-- 3. THE HOME PAGE SUMMARY
-- ============================================================================
-- One call, one JSON object. Every key is always present; a figure the server has
-- not reported is null (the page shows "TBD"). Times are UTC; the page converts.
--
--   server_name        servers.name (the ingest sets it from PublicName)
--   last_seen          newest record from the server; the page calls it online
--                      when this is recent
--   up_since           the launch stamp (the exporter log's file name, UTC)
--   online_now         players marked online
--   survivors_total    every account that has played here
--   survivors_7d       accounts seen in the last 7 days
--   peak_7d            most players online at once in the last 7 days
--   hourly_7d          [[epoch seconds of the hour, most online that hour], ...]
--   zombies_killed_today, players_killed_today   the server's own daily counters
--   longest_survivors  top 5 living characters by hours survived
--   safehouses, vehicles  counts
--   settings, sandbox  the public subsets of server_config
--   config_updated_at  when the ingest last read the settings files

CREATE OR REPLACE FUNCTION aurora.home_summary(p_server TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH srv AS (
    SELECT s.name, s.last_seen, s.last_launch_stamp
      FROM aurora.servers s
     WHERE s.id = p_server
  ),
  week AS (
    SELECT h.t, h.players, h.raw
      FROM aurora.health_samples h
     WHERE h.server_id = p_server
       AND h.t > NOW() - INTERVAL '7 days'
  ),
  latest AS (
    SELECT h.raw
      FROM aurora.health_samples h
     WHERE h.server_id = p_server
     ORDER BY h.t DESC
     LIMIT 1
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
      SELECT count(*) FROM aurora.players p WHERE p.server_id = p_server AND p.online
    ),
    'survivors_total', (
      SELECT count(*) FROM aurora.players p WHERE p.server_id = p_server
    ),
    'survivors_7d', (
      SELECT count(*) FROM aurora.players p
       WHERE p.server_id = p_server AND p.last_seen > NOW() - INTERVAL '7 days'
    ),
    'peak_7d', (SELECT max(players) FROM week),
    'hourly_7d', COALESCE((
      SELECT jsonb_agg(jsonb_build_array(extract(epoch FROM hr)::bigint, peak) ORDER BY hr)
        FROM (SELECT date_trunc('hour', t) AS hr, max(players) AS peak
                FROM week
               GROUP BY 1) b
    ), '[]'::jsonb),
    'zombies_killed_today', (
      SELECT CASE WHEN jsonb_typeof(raw #> '{game,zombies-killed-today}') = 'number'
                  THEN (raw #>> '{game,zombies-killed-today}')::numeric END
        FROM latest
    ),
    'players_killed_today', (
      SELECT CASE WHEN jsonb_typeof(raw #> '{game,players-killed-by-zombie-today}') = 'number'
                  THEN (raw #>> '{game,players-killed-by-zombie-today}')::numeric END
        FROM latest
    ),
    'longest_survivors', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'hours', hours, 'online', online) ORDER BY hours DESC, name)
        FROM (SELECT COALESCE(NULLIF(btrim(p.display_name), ''), p.username) AS name,
                     round(p.hours_survived::numeric, 1) AS hours,
                     p.online
                FROM aurora.players p
               WHERE p.server_id = p_server
                 AND p.hours_survived IS NOT NULL
                 AND p.hours_survived > 0
                 AND p.is_dead IS NOT TRUE
               ORDER BY p.hours_survived DESC, p.username
               LIMIT 5) top
    ), '[]'::jsonb),
    'safehouses', (SELECT count(*) FROM aurora.safehouses s WHERE s.server_id = p_server),
    'vehicles', (SELECT count(*) FROM aurora.vehicles v WHERE v.server_id = p_server),
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

REVOKE ALL ON FUNCTION aurora.home_summary(TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.home_summary(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.home_summary(TEXT) IS
  'Public (027): the home page''s server totals and a fixed list of server settings. Aggregates only; the rows behind them stay admin only.';
