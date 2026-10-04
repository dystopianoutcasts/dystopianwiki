-- Migration 039: presence expires by itself - no position for 3 minutes means offline
-- Created: 2026-10-04
-- Description: a player is online only if aurora.players.online says so AND a
--              position arrived within the presence window (3 minutes). The rule
--              is enforced twice: a sweep (aurora.expire_presence) that clears the
--              stored flag every minute on its own pg_cron job, and a read-time
--              guard in aurora.players_public and home_summary_tz's online_now, so
--              the public is never shown a stale "online" between sweeps or if cron
--              itself stops. Depends on 008, 010, 027, 030 and 032 (latest
--              home_summary_tz). Safe to run twice. Run it as postgres.
--
-- Why (2026-10-04): the home page said 21 online while the host panel listed 7;
-- 13 players had a last position 10 to 466 minutes old and were still drawn on
-- the map. The exporter writes NO record when a player leaves. Before this
-- migration the flag fell only on the 0.7.1+ roster reconcile, a heartbeat
-- reporting exactly 0 players, or a world switch, and nothing was time based: a
-- stopped game server, a broken feed or a failed importer froze the last state.
--
-- The window: the exporter writes a `pos` for every online player on movement or
-- at least every 60 s (OA_Players.lua HEARTBEAT_MS = 60000); the importer runs
-- once a minute. 3 minutes = the 60 s keep-alive + one missed ingest run +
-- margin. aurora.presence_window() is the only place the number lives.
--
-- Clocks: last_seen is the `pos` record's own time, stamped by the GAME HOST's
-- clock; now() is the database's. On 2026-10-04 an active player's last_seen
-- tracked the database clock within a minute, so the comparison is sound. If
-- the host clock ever runs more than about 2 minutes slow, live players read
-- offline (and the sweep clears them until their next `pos`); if it runs fast,
-- leavers stay online that much longer.
--
-- The only writer of players.last_seen is the importer's `pos` upsert
-- (packages/shared/aurora/ingest-core.ts); the roster, the 0-player heartbeat,
-- the world switch and the players.db rows never touch it. If another writer
-- ever moves last_seen, this rule would keep a departed player online.
--
-- Not changed on purpose: positions_delayed() and the leaderboards (035-037)
-- read the stored flag. The map draws a position only when the profile
-- (players_public) says online, and the sweep corrects the stored flag they read
-- within a minute. home_summary_tz's longest_survivors.online is also the stored
-- flag (only online_now is guarded at read time).

-- ============================================================================
-- 1. THE WINDOW
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.presence_window()
RETURNS INTERVAL
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT INTERVAL '3 minutes';
$$;

REVOKE ALL ON FUNCTION aurora.presence_window() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.presence_window() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.presence_window() IS
  'How recent a player''s last position must be for them to count as online (039): 3 minutes. The only place the number lives. A constant; public.';

-- ============================================================================
-- 2. THE SWEEP
-- ============================================================================
-- Every server, every world (world_id NULL included). A swept player who is in
-- fact still on is set online again by their next `pos` (at most 60 s).

CREATE OR REPLACE FUNCTION aurora.expire_presence()
RETURNS INTEGER
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH swept AS (
    UPDATE aurora.players p
       SET online = FALSE
     WHERE p.online
       AND (p.last_seen IS NULL OR p.last_seen < now() - aurora.presence_window())
    RETURNING 1
  )
  SELECT count(*)::integer FROM swept;
$$;

REVOKE ALL ON FUNCTION aurora.expire_presence() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.expire_presence() TO service_role;

COMMENT ON FUNCTION aurora.expire_presence() IS
  'Sets online = false for every player with no position within aurora.presence_window() (039). Returns the number of rows changed. Run every minute by the aurora-presence pg_cron job; service_role only.';

-- ============================================================================
-- 3. THE SCHEDULE: its own pg_cron job, independent of aurora-ingest
-- ============================================================================
-- Plain SQL in the database, so it keeps running when the Edge Function, the
-- SFTP link or the game server is down: exactly when the flag must fall.
-- Like 015's functions, the bodies below name cron.* only at run time, so they
-- are created on a database without pg_cron (the scratch test server); the DO
-- block at the end schedules only when cron.schedule exists, and otherwise says
-- so in a NOTICE. Re-running removes the job by name first, so one job remains.

CREATE OR REPLACE FUNCTION aurora.disable_presence_cron()
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job j WHERE j.jobname = 'aurora-presence') THEN
    PERFORM cron.unschedule('aurora-presence');
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION aurora.disable_presence_cron() IS
  'Unschedule the aurora-presence job (039). Returns true if a job was removed.';

CREATE OR REPLACE FUNCTION aurora.enable_presence_cron()
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job_id BIGINT;
BEGIN
  PERFORM aurora.disable_presence_cron();
  SELECT cron.schedule('aurora-presence', '* * * * *', 'SELECT aurora.expire_presence();')
    INTO v_job_id;
  RETURN v_job_id;
END;
$$;

COMMENT ON FUNCTION aurora.enable_presence_cron() IS
  'Schedule aurora.expire_presence() every minute as the aurora-presence pg_cron job (039). Re-running leaves one job.';

REVOKE ALL ON FUNCTION aurora.enable_presence_cron()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.disable_presence_cron() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regprocedure('cron.schedule(text,text,text)') IS NOT NULL THEN
    PERFORM aurora.enable_presence_cron();
    RAISE NOTICE 'aurora-presence scheduled every minute';
  ELSE
    RAISE NOTICE 'pg_cron is not installed: aurora-presence NOT scheduled (the read-time guard still applies)';
  END IF;
END
$$;

-- Check it (SQL Editor):
--   SELECT jobid, jobname, schedule, command, active FROM cron.job WHERE jobname = 'aurora-presence';
--   SELECT status, return_message, start_time
--     FROM cron.job_run_details
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'aurora-presence')
--    ORDER BY start_time DESC LIMIT 5;

-- ============================================================================
-- 4. READ-TIME GUARD: players_public
-- ============================================================================
-- Same columns, same order, same types (027); only `online` changes. CREATE OR
-- REPLACE keeps the existing grants (anon, authenticated), so none is repeated.

CREATE OR REPLACE VIEW aurora.players_public
WITH (security_invoker = TRUE) AS
  SELECT p.server_id,
         p.username,
         p.display_name,
         p.last_seen,
         (p.online
          AND p.last_seen IS NOT NULL
          AND p.last_seen > now() - aurora.presence_window()) AS online,
         p.hours_survived,
         p.is_dead
    FROM aurora.players p;

COMMENT ON VIEW aurora.players_public IS
  'Player roster without linked_user_id, last_saved_x/y, access_level or first_seen (027). online = the stored flag AND a position within aurora.presence_window() (039). Security invoker.';

-- ============================================================================
-- 5. READ-TIME GUARD: home_summary_tz online_now
-- ============================================================================
-- 032's definition (the latest), byte for byte, except the online_now expression.

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
  'Public (030, worlds 032, presence 039): the home page''s server totals, "today" from midnight in p_tz. Player, safehouse, death, kill and world-age figures count the current world only; peak_7d and hourly_7d are server activity and stay unfiltered. online_now counts players flagged online with a position within aurora.presence_window() (039). world_seq, world_started_at, world_pending describe the world (world_pending is admin-only: false for everyone else). Aggregates only.';
