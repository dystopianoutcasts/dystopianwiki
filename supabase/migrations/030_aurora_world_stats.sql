-- Migration 030: world stats on the home page, and death markers on the map
-- Created: 2026-10-02
-- Description: owner decisions, 2026-10-02.
--   * Death markers are PUBLIC IMMEDIATELY, but only each player's MOST RECENT death
--     is shown (dying again moves the marker, as on the in-game map). No age limit.
--   * "Today" is since midnight in the VIEWER's time zone. The server and the host
--     run on UTC; the home page passes the browser's zone, and the one-argument
--     home_summary() keeps answering for America/New_York.
--   Depends on 008 (servers), 019 (aurora.is_aurora_admin()) and 027/028 (the
--   home_summary this replaces). Needs exporter 0.5.0 for anything to count; applying
--   it first is harmless (counters are NULL / 0 until then).
--
-- What is stored and what is public (VISIBILITY.md):
--
--   aurora.deaths           one row per death: who, where, when, which exporter source
--                           saw it (`src`), hours survived. NO client role can read it.
--   aurora.deaths_visible   the public view: ONE ROW PER (server, username), their
--                           latest death. No `src`, no `id`.
--   aurora.deaths_admin(server)   every death with `src`; zero rows for non-admins.
--
-- HOME SUMMARY
--   aurora.home_summary_tz(p_server, p_tz)   the whole summary, "today" in p_tz.
--   aurora.home_summary(p_server)            unchanged signature, security and
--                                            search_path; calls the above with
--                                            'America/New_York', so the live site keeps
--                                            working until the front end sends a zone.
--   Why a differently named function and not an overload of home_summary: PostgREST
--   resolves an overloaded function from the argument NAMES in the request, which
--   works, but it is a known source of "could not choose the best candidate" errors
--   when a client library or a later default argument blurs the difference. A distinct
--   name cannot be ambiguous.
--
--   New keys: zombies_killed_today (number or null), players_killed_today (number, 0
--   when none), world_age_hours (number or null), game_version (text or null),
--   day_tz (text, the zone actually used). Every earlier key is kept.
--
--   zombies_killed_today. The exporter reports a cumulative count since boot in every
--   health sample (raw game "zombies-killed"). Today's kills are the sum of the
--   positive deltas between consecutive samples since local midnight; a sample whose
--   value is LOWER than the one before it is a restart (the counter began again at 0),
--   so that sample adds its own value. The newest sample BEFORE midnight is the
--   baseline for the first one after it, so kills between that sample and midnight do
--   not leak into today. A first sample with no earlier one counts its own value (the
--   normal case is a freshly booted server whose counter started at 0; the one wrong
--   case is the very first deploy of exporter 0.5.0 into a long-running session, which
--   over-counts that session's earlier kills once). NULL when no sample since midnight
--   carries the key (before the exporter ships, or the server is down).
--
--   Retention: aurora.health_samples is NEVER pruned (010's prune_history is scoped to
--   position history, and nothing else deletes from it), so every sample since
--   midnight is there. At a 10 s heartbeat that is about 8,640 rows a day.
--
--   p_tz is untrusted. aurora.safe_tz() checks its length and shape (a regex), then
--   asks PostgreSQL to accept it with `now() AT TIME ZONE p_tz` inside an exception
--   block, so nothing is interpolated or run as SQL and an unknown, malformed, empty
--   or NULL value falls back to America/New_York and never raises. (Scanning
--   pg_timezone_names instead cost about 700 ms a call.)
--
-- Safe to run twice. Run it as postgres (the SQL editor). ORDER: apply this BEFORE
-- deploying the new aurora-ingest (it would still run without it, see
-- supabase/README.md, but no death would be stored).

-- ============================================================================
-- 1. DEATHS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.deaths (
  id             BIGSERIAL PRIMARY KEY,
  server_id      TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  username       TEXT NOT NULL,
  x              REAL NOT NULL,
  y              REAL NOT NULL,
  z              REAL NOT NULL DEFAULT 0,
  t              TIMESTAMPTZ NOT NULL,
  src            TEXT,
  hours_survived REAL,
  CONSTRAINT deaths_server_username_t_key UNIQUE (server_id, username, t)
);

CREATE INDEX IF NOT EXISTS deaths_server_t_idx ON aurora.deaths (server_id, t DESC);

COMMENT ON TABLE aurora.deaths IS
  'One row per player death as the exporter reported it (030). No client role can read it: the public map uses deaths_visible (latest death per player), admins use deaths_admin().';
COMMENT ON COLUMN aurora.deaths.t IS
  'The death''s own time from the game server''s clock. With (server_id, username) it is the unique key, so replaying a log never doubles a death.';
COMMENT ON COLUMN aurora.deaths.src IS
  'Which exporter source saw it: isdead, chardeath, dodeathlog or cosmicmap. Admin only.';

ALTER TABLE aurora.deaths ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.deaths FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.deaths TO service_role;
GRANT ALL ON SEQUENCE aurora.deaths_id_seq TO service_role;

-- ============================================================================
-- 2. THE PUBLIC SURFACE: the latest death per player
-- ============================================================================
-- Same pattern as 022, 028 and 029: a SECURITY DEFINER function answers the public
-- columns and a security_invoker view sits on it, because the table has no client
-- grant. The view is dropped before the function it reads so a re-run never meets
-- "cannot change return type".

DROP VIEW IF EXISTS aurora.deaths_visible;
DROP FUNCTION IF EXISTS aurora.deaths_public();
DROP FUNCTION IF EXISTS aurora.deaths_admin(TEXT);

CREATE FUNCTION aurora.deaths_public()
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
   ORDER BY d.server_id, d.username, d.t DESC;
$$;

REVOKE ALL ON FUNCTION aurora.deaths_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.deaths_public() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.deaths_public() IS
  'The public deaths (030): each player''s most recent death only, without src or id. SECURITY DEFINER so anon can read it although aurora.deaths has no client grant.';

CREATE VIEW aurora.deaths_visible
WITH (security_invoker = TRUE) AS
  SELECT server_id, username, x, y, z, t, hours_survived
    FROM aurora.deaths_public();

REVOKE ALL ON aurora.deaths_visible FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.deaths_visible TO anon, authenticated, service_role;

COMMENT ON VIEW aurora.deaths_visible IS
  'The map reads this for death markers (030): one row per (server, username), their latest death, no age limit. security_invoker so the caller''s own EXECUTE grant on deaths_public() is what is checked.';

-- ============================================================================
-- 3. THE ADMIN PATH
-- ============================================================================
-- The WHERE clause is the gate, as in 023 / 028 / 029: a non-admin gets zero rows
-- rather than an error. EXECUTE for authenticated only.

CREATE FUNCTION aurora.deaths_admin(p_server TEXT)
RETURNS TABLE (
  id             BIGINT,
  server_id      TEXT,
  username       TEXT,
  x              REAL,
  y              REAL,
  z              REAL,
  t              TIMESTAMPTZ,
  src            TEXT,
  hours_survived REAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT d.id, d.server_id, d.username, d.x, d.y, d.z, d.t, d.src, d.hours_survived
    FROM aurora.deaths d
   WHERE aurora.is_aurora_admin()
     AND d.server_id = p_server
   ORDER BY d.t DESC;
$$;

REVOKE ALL ON FUNCTION aurora.deaths_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.deaths_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.deaths_admin(TEXT) IS
  'Every death of one server, newest first, with src (030). Empty for anyone who is not an aurora admin. SECURITY DEFINER; the WHERE clause is the gate.';

-- ============================================================================
-- 4. HOME SUMMARY
-- ============================================================================

-- The zone check. NOT a scan of pg_timezone_names: that view rebuilds ~1,200 rows
-- from the zoneinfo files on every call (about 700 ms). A length and shape check, then
-- one cheap `now() AT TIME ZONE p_tz` inside an exception block: the argument is only
-- ever used as a zone VALUE, never interpolated, and any failure is the fallback.
CREATE OR REPLACE FUNCTION aurora.safe_tz(p_tz TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $f$
BEGIN
  IF p_tz IS NULL
     OR length(p_tz) NOT BETWEEN 1 AND 64
     OR p_tz !~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$' THEN
    RETURN 'America/New_York';
  END IF;
  PERFORM pg_catalog.now() AT TIME ZONE p_tz;
  RETURN p_tz;
EXCEPTION WHEN OTHERS THEN
  RETURN 'America/New_York';
END;
$f$;

REVOKE ALL ON FUNCTION aurora.safe_tz(TEXT) FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.safe_tz(TEXT) IS
  'Internal (030): p_tz if PostgreSQL accepts it as a time zone, else America/New_York. Never raises; the argument is never interpolated. Callable only through the SECURITY DEFINER summaries.';

CREATE OR REPLACE FUNCTION aurora.home_summary_tz(p_server TEXT, p_tz TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH tz AS (
    -- aurora.safe_tz validates; an unknown, malformed, empty or NULL p_tz is the fallback.
    SELECT aurora.safe_tz(p_tz) AS name
  ),
  dy AS (
    -- Local midnight of "today" in that zone, as an instant.
    SELECT (date_trunc('day', now() AT TIME ZONE tz.name) AT TIME ZONE tz.name) AS start_t,
           tz.name AS name
      FROM tz
  ),
  srv AS (
    SELECT s.name, s.last_seen, s.last_launch_stamp, s.game_version
      FROM aurora.servers s
     WHERE s.id = p_server
  ),
  -- One pass over the week, aggregated straight to hours, and without the raw column
  -- (the old CTE copied every sample's whole jsonb just to read two columns).
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
     ORDER BY h.t DESC
     LIMIT 1
  ),
  -- Both halves are (server_id, t) primary-key range scans: today's samples, and the
  -- newest sample carrying the key in the 2 days before midnight (the baseline). The
  -- midnight is read with a scalar subselect, NOT joined: a join against the dy CTE made
  -- the planner scan the whole server's history and filter it (600 ms at 1M rows).
  kill_series AS (
    (SELECT h.t, (h.raw #>> '{game,zombies-killed}')::numeric AS v
       FROM aurora.health_samples h
      WHERE h.server_id = p_server
        AND h.t < (SELECT start_t FROM dy)
        AND h.t >= (SELECT start_t FROM dy) - INTERVAL '2 days'
        AND jsonb_typeof(h.raw #> '{game,zombies-killed}') = 'number'
      ORDER BY h.t DESC
      LIMIT 1)
    UNION ALL
    (SELECT h.t, (h.raw #>> '{game,zombies-killed}')::numeric AS v
       FROM aurora.health_samples h
      WHERE h.server_id = p_server
        AND h.t >= (SELECT start_t FROM dy)
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
      SELECT count(*) FROM aurora.players p WHERE p.server_id = p_server AND p.online
    ),
    'survivors_total', (
      SELECT count(*) FROM aurora.players p WHERE p.server_id = p_server
    ),
    'survivors_7d', (
      SELECT count(*) FROM aurora.players p
       WHERE p.server_id = p_server AND p.last_seen > NOW() - INTERVAL '7 days'
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
    ),
    'world_age_hours', (
      SELECT CASE WHEN jsonb_typeof(raw #> '{game,world-age-hours}') = 'number'
                  THEN (raw #>> '{game,world-age-hours}')::numeric END
        FROM latest
    ),
    'game_version', (SELECT game_version FROM srv),
    'day_tz', (SELECT name FROM dy),
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
  'Public (030): the home page''s server totals with "today" counted from midnight in p_tz (an unknown, empty or NULL zone falls back to America/New_York; the zone used is returned as day_tz). Aggregates only.';

-- The one-argument form: signature, security and search_path as in 027/028, so the
-- live site keeps working. It answers for America/New_York.
CREATE OR REPLACE FUNCTION aurora.home_summary(p_server TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT aurora.home_summary_tz(p_server, 'America/New_York');
$$;

REVOKE ALL ON FUNCTION aurora.home_summary(TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.home_summary(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.home_summary(TEXT) IS
  'Public (027, vehicles 028, world stats 030): home_summary_tz(p_server, ''America/New_York''). Kept so existing callers keep working.';
