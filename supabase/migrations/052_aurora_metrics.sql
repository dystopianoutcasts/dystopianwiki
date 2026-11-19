-- Migration 052: Outcast Metrics -- an hourly rollup that outlives the raw rows
-- Created: 2026-11-18
-- Description: the /metrics page ("Outcast Metrics") needs players online, time played,
--              first-time players, deaths and kills over a week, a month and the whole
--              season. The raw rows are deleted after 7-8 days (044), so an hourly rollup,
--              kept forever, is built here, plus the three race feeds and the table that
--              holds each player's play sessions read from the server's own logs.
--
-- What it adds:
--
--   aurora.metrics_hourly         one row per server and UTC hour: avg/peak players,
--                                 player minutes, distinct players, first-time players,
--                                 deaths, kills. Kept forever. RLS on, no client grant.
--   aurora.metrics_player_hourly  one row per server, hour and player: minutes played.
--                                 Feeds "most time played", the unique-player counts and
--                                 the time race. RLS on, no client grant.
--   aurora.play_sessions          one row per join-to-leave session read from the server's
--                                 join/leave logs (user.txt): username and times, source.
--                                 NEVER a Steam id, an IP or a raw log line. RLS on, no
--                                 client grant. Written by scripts/metrics/import-play-sessions.py.
--   aurora.metrics_rollup(from, to)   recompute whole UTC hours and upsert them; returns the
--                                 number of hours written. Safe to run twice (same numbers).
--   aurora.metrics_summary(server, range)  PUBLIC. Range '7', '30' or 'season'.
--   aurora.metrics_races(server)           PUBLIC. The three race feeds, as one jsonb.
--   aurora.enable_metrics_cron() / disable_metrics_cron()   the hourly job, like 051.
--
-- Where each number comes from (decided here, so the page and the tests agree):
--   minutes     A player has a minute played for every distinct (username, minute) in
--               aurora.player_position_history (a row arrives at least every 60 s while the
--               player is online, 039). For an hour with NO position rows at all, the minutes
--               come from aurora.play_sessions instead (the season before the positions began
--               on 2026-11-11). Position data wins whenever it exists.
--   avg / peak  health_samples.players (average and maximum in the hour). With no health
--               sample in the hour: minutes / 60 for the average, and the most distinct
--               players in one minute for the peak.
--   unique      distinct usernames with a minute in the hour.
--   new players usernames whose earliest first_seen (aurora.players together with
--               aurora.player_history, so both worlds) falls in the hour.
--   deaths      aurora.deaths.t.
--   kills       aurora.kill_events.t. Chosen over the raw.game.zombies-killed deltas in
--               health_samples because it is the only source that reaches 2026-10-03 (those
--               samples begin 2026-11-10) and it is what the kill race counts, so the totals
--               agree. kill_events is capped at 20 per second at the source, so it can
--               undercount a very big burst; the page says "recorded kills".
--
-- The rollup never downgrades: each row remembers where its minutes (minutes_source:
-- positions or server_log) and its player counts (players_source: health, positions or server_log) came
-- from, and a later run only replaces them with data of equal or better quality. So a re-run
-- after the raw rows were pruned cannot overwrite good hours with empty ones. An hour with no
-- source at all is not written.
--
-- Days are UTC on the server; the page labels them in the viewer's time zone.
--
-- Check it (SQL editor):
--   SELECT aurora.metrics_summary('outcasts-main', 'season');
--   SELECT jsonb_object_keys(aurora.metrics_races('outcasts-main'));
--   SELECT jobname, schedule FROM cron.job WHERE jobname = 'metrics-rollup';
--
-- Safe to run twice.

-- ============================================================================
-- 1. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.metrics_hourly (
  server_id      TEXT        NOT NULL,
  hour           TIMESTAMPTZ NOT NULL,
  avg_players    REAL,
  peak_players   INT,
  player_minutes INT         NOT NULL DEFAULT 0,
  unique_players INT         NOT NULL DEFAULT 0,
  new_players    INT         NOT NULL DEFAULT 0,
  deaths         INT         NOT NULL DEFAULT 0,
  kills          INT         NOT NULL DEFAULT 0,
  minutes_source TEXT        CHECK (minutes_source IN ('positions', 'server_log')),
  players_source TEXT,
  PRIMARY KEY (server_id, hour)
);

CREATE TABLE IF NOT EXISTS aurora.metrics_player_hourly (
  server_id TEXT        NOT NULL,
  hour      TIMESTAMPTZ NOT NULL,
  username  TEXT        NOT NULL,
  minutes   INT         NOT NULL CHECK (minutes BETWEEN 1 AND 60),
  PRIMARY KEY (server_id, hour, username)
);

CREATE INDEX IF NOT EXISTS metrics_player_hourly_user_idx
  ON aurora.metrics_player_hourly (server_id, username, hour);

CREATE TABLE IF NOT EXISTS aurora.play_sessions (
  server_id  TEXT        NOT NULL,
  username   TEXT        NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at   TIMESTAMPTZ NOT NULL CHECK (ended_at >= started_at),
  source     TEXT        NOT NULL DEFAULT 'server_log',
  PRIMARY KEY (server_id, username, started_at)
);

-- players_source says where the player counts came from: the health samples, or the minutes
-- (positions or server_log). An earlier draft of this migration used 'minutes' for both; this
-- block normalizes any such row and sets the final check. Safe to run twice.
ALTER TABLE aurora.metrics_hourly DROP CONSTRAINT IF EXISTS metrics_hourly_players_source_check;
UPDATE aurora.metrics_hourly
   SET players_source = CASE WHEN minutes_source = 'server_log' THEN 'server_log' ELSE 'positions' END
 WHERE players_source = 'minutes';
ALTER TABLE aurora.metrics_hourly
  ADD CONSTRAINT metrics_hourly_players_source_check CHECK (players_source IN ('health', 'positions', 'server_log'));

ALTER TABLE aurora.metrics_hourly        ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.metrics_player_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.play_sessions         ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.metrics_hourly        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON aurora.metrics_player_hourly FROM PUBLIC, anon, authenticated;
REVOKE ALL ON aurora.play_sessions         FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.metrics_hourly, aurora.metrics_player_hourly, aurora.play_sessions TO service_role;

COMMENT ON TABLE aurora.metrics_hourly IS
  'Hourly rollup per server and UTC hour, kept forever (052). Public only through metrics_summary().';
COMMENT ON TABLE aurora.metrics_player_hourly IS
  'Minutes played per player and UTC hour, kept forever (052). Public only through metrics_summary() and metrics_races().';
COMMENT ON TABLE aurora.play_sessions IS
  'Join-to-leave sessions read from the server logs (052): username and times only, never a Steam id, an IP or a raw log line. Fills the rollup for hours with no position data.';

-- ============================================================================
-- 2. HELPERS (not public)
-- ============================================================================

-- How good a minutes/players source is: 0 none, 1 estimate (server log), 2 measured.
CREATE OR REPLACE FUNCTION aurora.metrics_source_rank(p_source TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE p_source WHEN 'positions' THEN 2 WHEN 'health' THEN 2
                       WHEN 'server_log' THEN 1 ELSE 0 END;
$$;

-- One row per (server, UTC hour, username, minute) a player was online, in [p_from, p_to).
-- Position rows are used for every hour that has any; play_sessions only for hours that have none.
CREATE OR REPLACE FUNCTION aurora.metrics_minutes(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (server_id TEXT, hour TIMESTAMPTZ, username TEXT, minute TIMESTAMPTZ, source TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH pos AS (
    SELECT p.server_id, date_trunc('hour', p.t, 'UTC') AS hour, p.username,
           date_trunc('minute', p.t, 'UTC') AS minute
      FROM aurora.player_position_history p
     WHERE p.t >= p_from AND p.t < p_to
     GROUP BY 1, 2, 3, 4
  ), pos_hours AS (
    SELECT DISTINCT pos.server_id, pos.hour FROM pos
  ), sess AS (
    SELECT s.server_id, h.hour, s.username, m.minute
      FROM aurora.play_sessions s
      CROSS JOIN LATERAL generate_series(
             date_trunc('hour', greatest(s.started_at, p_from), 'UTC'),
             date_trunc('hour', least(s.ended_at, p_to) - INTERVAL '1 microsecond', 'UTC'),
             INTERVAL '1 hour') AS h(hour)
      CROSS JOIN LATERAL generate_series(
             date_trunc('minute', greatest(s.started_at, h.hour), 'UTC'),
             date_trunc('minute', least(s.ended_at, h.hour + INTERVAL '1 hour', p_to) - INTERVAL '1 microsecond', 'UTC'),
             INTERVAL '1 minute') AS m(minute)
     WHERE s.ended_at > s.started_at AND s.started_at < p_to AND s.ended_at > p_from
     GROUP BY 1, 2, 3, 4
  )
  SELECT pos.server_id, pos.hour, pos.username, pos.minute, 'positions'::TEXT FROM pos
  UNION ALL
  SELECT sess.server_id, sess.hour, sess.username, sess.minute, 'server_log'::TEXT
    FROM sess
   WHERE NOT EXISTS (SELECT 1 FROM pos_hours ph WHERE ph.server_id = sess.server_id AND ph.hour = sess.hour);
$$;

REVOKE ALL ON FUNCTION aurora.metrics_source_rank(TEXT)                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.metrics_minutes(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 3. ROLLUP
-- ============================================================================

-- Recomputes every UTC hour from the hour containing p_from through the hour containing
-- p_to (never past the current hour) and upserts it. Returns the number of hours written.
CREATE OR REPLACE FUNCTION aurora.metrics_rollup(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_from  TIMESTAMPTZ := date_trunc('hour', p_from, 'UTC');
  v_to    TIMESTAMPTZ := least(date_trunc('hour', p_to, 'UTC'), date_trunc('hour', now(), 'UTC')) + INTERVAL '1 hour';
  v_count INT;
BEGIN
  IF v_to <= v_from THEN
    RETURN 0;
  END IF;

  DROP TABLE IF EXISTS pg_temp.metrics_minutes_tmp;
  DROP TABLE IF EXISTS pg_temp.metrics_hours_tmp;

  CREATE TEMP TABLE metrics_minutes_tmp ON COMMIT DROP AS
    SELECT * FROM aurora.metrics_minutes(v_from, v_to);

  CREATE TEMP TABLE metrics_hours_tmp ON COMMIT DROP AS
  WITH firsts AS (
    SELECT x.server_id, x.username, min(x.first_seen) AS first_seen
      FROM (SELECT pl.server_id, pl.username, pl.first_seen FROM aurora.players pl
            UNION ALL
            SELECT ph.server_id, ph.username, ph.first_seen FROM aurora.player_history ph) x
     WHERE x.first_seen IS NOT NULL
     GROUP BY 1, 2
  ), minute_agg AS (
    SELECT m.server_id, m.hour, count(*)::INT AS minutes, count(DISTINCT m.username)::INT AS uniq,
           max(m.source) AS source
      FROM pg_temp.metrics_minutes_tmp m GROUP BY 1, 2
  ), peak_agg AS (
    SELECT c.server_id, c.hour, max(c.n)::INT AS peak
      FROM (SELECT m.server_id, m.hour, m.minute, count(*) AS n
              FROM pg_temp.metrics_minutes_tmp m GROUP BY 1, 2, 3) c
     GROUP BY 1, 2
  ), health_agg AS (
    SELECT h.server_id, date_trunc('hour', h.t, 'UTC') AS hour,
           avg(h.players)::REAL AS avg_players, max(h.players)::INT AS peak
      FROM aurora.health_samples h
     WHERE h.players IS NOT NULL AND h.t >= v_from AND h.t < v_to
     GROUP BY 1, 2
  ), death_agg AS (
    SELECT d.server_id, date_trunc('hour', d.t, 'UTC') AS hour, count(*)::INT AS n
      FROM aurora.deaths d WHERE d.t >= v_from AND d.t < v_to GROUP BY 1, 2
  ), kill_agg AS (
    SELECT k.server_id, date_trunc('hour', k.t, 'UTC') AS hour, count(*)::INT AS n
      FROM aurora.kill_events k WHERE k.t >= v_from AND k.t < v_to GROUP BY 1, 2
  ), new_agg AS (
    SELECT f.server_id, date_trunc('hour', f.first_seen, 'UTC') AS hour, count(*)::INT AS n
      FROM firsts f WHERE f.first_seen >= v_from AND f.first_seen < v_to GROUP BY 1, 2
  ), keys AS (
    SELECT server_id, hour FROM minute_agg
    UNION SELECT server_id, hour FROM health_agg
    UNION SELECT server_id, hour FROM death_agg
    UNION SELECT server_id, hour FROM kill_agg
    UNION SELECT server_id, hour FROM new_agg
  )
  SELECT k.server_id, k.hour,
         CASE WHEN ha.server_id IS NOT NULL THEN ha.avg_players
              WHEN ma.server_id IS NOT NULL THEN (ma.minutes / 60.0)::REAL END AS avg_players,
         CASE WHEN ha.server_id IS NOT NULL THEN ha.peak
              WHEN pa.server_id IS NOT NULL THEN pa.peak END                   AS peak_players,
         CASE WHEN ha.server_id IS NOT NULL THEN 'health'
              WHEN ma.server_id IS NOT NULL THEN ma.source END                      AS players_source,
         coalesce(ma.minutes, 0) AS player_minutes,
         coalesce(ma.uniq, 0)    AS unique_players,
         ma.source               AS minutes_source,
         coalesce(na.n, 0)       AS new_players,
         coalesce(da.n, 0)       AS deaths,
         coalesce(ka.n, 0)       AS kills,
         (aurora.metrics_source_rank(ma.source) > 0
          AND aurora.metrics_source_rank(ma.source) >= aurora.metrics_source_rank(old.minutes_source)) AS apply_minutes
    FROM keys k
    LEFT JOIN minute_agg ma ON ma.server_id = k.server_id AND ma.hour = k.hour
    LEFT JOIN peak_agg   pa ON pa.server_id = k.server_id AND pa.hour = k.hour
    LEFT JOIN health_agg ha ON ha.server_id = k.server_id AND ha.hour = k.hour
    LEFT JOIN death_agg  da ON da.server_id = k.server_id AND da.hour = k.hour
    LEFT JOIN kill_agg   ka ON ka.server_id = k.server_id AND ka.hour = k.hour
    LEFT JOIN new_agg    na ON na.server_id = k.server_id AND na.hour = k.hour
    LEFT JOIN aurora.metrics_hourly old ON old.server_id = k.server_id AND old.hour = k.hour;

  INSERT INTO aurora.metrics_hourly AS m
    (server_id, hour, avg_players, peak_players, player_minutes, unique_players, new_players,
     deaths, kills, minutes_source, players_source)
  SELECT t.server_id, t.hour, t.avg_players, t.peak_players, t.player_minutes, t.unique_players,
         t.new_players, t.deaths, t.kills, t.minutes_source, t.players_source
    FROM pg_temp.metrics_hours_tmp t
  ON CONFLICT (server_id, hour) DO UPDATE SET
    avg_players    = CASE WHEN aurora.metrics_source_rank(EXCLUDED.players_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.players_source) >= aurora.metrics_source_rank(m.players_source)
                          THEN EXCLUDED.avg_players ELSE m.avg_players END,
    peak_players   = CASE WHEN aurora.metrics_source_rank(EXCLUDED.players_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.players_source) >= aurora.metrics_source_rank(m.players_source)
                          THEN EXCLUDED.peak_players ELSE m.peak_players END,
    players_source = CASE WHEN aurora.metrics_source_rank(EXCLUDED.players_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.players_source) >= aurora.metrics_source_rank(m.players_source)
                          THEN EXCLUDED.players_source ELSE m.players_source END,
    player_minutes = CASE WHEN aurora.metrics_source_rank(EXCLUDED.minutes_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.minutes_source) >= aurora.metrics_source_rank(m.minutes_source)
                          THEN EXCLUDED.player_minutes ELSE m.player_minutes END,
    unique_players = CASE WHEN aurora.metrics_source_rank(EXCLUDED.minutes_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.minutes_source) >= aurora.metrics_source_rank(m.minutes_source)
                          THEN EXCLUDED.unique_players ELSE m.unique_players END,
    minutes_source = CASE WHEN aurora.metrics_source_rank(EXCLUDED.minutes_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.minutes_source) >= aurora.metrics_source_rank(m.minutes_source)
                          THEN EXCLUDED.minutes_source ELSE m.minutes_source END,
    -- events: a recompute that finds nothing (rows pruned since) keeps what was stored
    new_players    = CASE WHEN EXCLUDED.new_players = 0 THEN m.new_players ELSE EXCLUDED.new_players END,
    deaths         = CASE WHEN EXCLUDED.deaths      = 0 THEN m.deaths      ELSE EXCLUDED.deaths      END,
    kills          = CASE WHEN EXCLUDED.kills       = 0 THEN m.kills       ELSE EXCLUDED.kills       END;

  DELETE FROM aurora.metrics_player_hourly p
   USING pg_temp.metrics_hours_tmp t
   WHERE t.apply_minutes AND p.server_id = t.server_id AND p.hour = t.hour;

  INSERT INTO aurora.metrics_player_hourly (server_id, hour, username, minutes)
  SELECT m.server_id, m.hour, m.username, count(*)::INT
    FROM pg_temp.metrics_minutes_tmp m
    JOIN pg_temp.metrics_hours_tmp t ON t.server_id = m.server_id AND t.hour = m.hour AND t.apply_minutes
   GROUP BY m.server_id, m.hour, m.username;

  SELECT count(*) INTO v_count FROM pg_temp.metrics_hours_tmp;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_rollup(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.metrics_rollup(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

COMMENT ON FUNCTION aurora.metrics_rollup(TIMESTAMPTZ, TIMESTAMPTZ) IS
  'Recompute and upsert whole UTC hours (052), idempotent, never downgrades a measured hour to an estimated one. Returns the hours written.';

-- ============================================================================
-- 4. PUBLIC READ: metrics_summary
-- ============================================================================
-- p_range: '7', '30' (any whole number of days 1..3650) or 'season' (anything else too).
-- Every key is always present:
--   range, since (first day shown), season_start, tracking_since (first hour with minutes),
--   players_since (first hour with a player count),
--   hourly   [{t, avg, peak}]   only when the range is 7 days or less, else [],
--   daily    [{day, hours_played, unique_players, new_players, peak, deaths, kills}]  one per
--            UTC day from since to today; hours_played / unique_players / peak are null for a
--            day nothing measured them (the page says where tracking starts),
--   heatmap  7 x 24 average players by UTC weekday (0 = Sunday) and hour; null = no sample,
--   top_time [{rank, username, display_name, minutes}] top 10,
--   totals   {hours_played, unique_players, new_players, peak, deaths, kills}.
-- An unknown server gets the same keys, empty.
CREATE OR REPLACE FUNCTION aurora.metrics_summary(p_server TEXT, p_range TEXT DEFAULT 'season')
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_range      TEXT := lower(btrim(coalesce(p_range, '')));
  v_days       INT;
  v_today      DATE := (now() AT TIME ZONE 'UTC')::DATE;
  v_season     TIMESTAMPTZ;
  v_since_day  DATE;
  v_since      TIMESTAMPTZ;
  v_known      BOOLEAN;
  v_hourly     JSONB := '[]'::JSONB;
  v_daily      JSONB := '[]'::JSONB;
  v_heatmap    JSONB := '[]'::JSONB;
  v_top        JSONB := '[]'::JSONB;
  v_totals     JSONB;
  v_tracking   TIMESTAMPTZ;
  v_players_since TIMESTAMPTZ;
BEGIN
  SELECT EXISTS (SELECT 1 FROM aurora.servers s WHERE s.id = p_server) INTO v_known;
  SELECT w.started_at INTO v_season FROM aurora.worlds w WHERE w.server_id = p_server AND w.status = 'current';

  IF v_range ~ '^[0-9]{1,9}$' THEN
    v_days := least(greatest(v_range::INT, 1), 3650);
    v_range := v_days::TEXT;
    v_since_day := v_today - (v_days - 1);
  ELSE
    v_range := 'season';
    v_since_day := coalesce((v_season AT TIME ZONE 'UTC')::DATE,
                            (SELECT (min(h.hour) AT TIME ZONE 'UTC')::DATE FROM aurora.metrics_hourly h WHERE h.server_id = p_server),
                            v_today);
  END IF;
  v_since := v_since_day::TIMESTAMP AT TIME ZONE 'UTC';

  SELECT min(h.hour) FILTER (WHERE h.minutes_source IS NOT NULL),
         min(h.hour) FILTER (WHERE h.players_source IS NOT NULL)
    INTO v_tracking, v_players_since
    FROM aurora.metrics_hourly h WHERE h.server_id = p_server;

  IF v_known THEN
    IF v_days IS NOT NULL AND v_days <= 7 THEN
      SELECT coalesce(jsonb_agg(jsonb_build_object('t', h.hour, 'avg', round(h.avg_players::NUMERIC, 2), 'peak', h.peak_players)
                                ORDER BY h.hour), '[]'::JSONB)
        INTO v_hourly
        FROM aurora.metrics_hourly h
       WHERE h.server_id = p_server AND h.hour >= v_since AND h.players_source IS NOT NULL;
    END IF;

    WITH hours AS (
      SELECT (h.hour AT TIME ZONE 'UTC')::DATE AS day, h.* FROM aurora.metrics_hourly h
       WHERE h.server_id = p_server AND h.hour >= v_since
    ), uniq AS (
      SELECT (p.hour AT TIME ZONE 'UTC')::DATE AS day, count(DISTINCT p.username)::INT AS n
        FROM aurora.metrics_player_hourly p WHERE p.server_id = p_server AND p.hour >= v_since GROUP BY 1
    ), per_day AS (
      SELECT g.day::DATE AS day,
             bool_or(h.minutes_source IS NOT NULL) AS has_minutes,
             bool_or(h.players_source IS NOT NULL) AS has_players,
             sum(h.player_minutes) AS minutes,
             sum(h.new_players) AS new_players,
             max(h.peak_players) AS peak,
             sum(h.deaths) AS deaths,
             sum(h.kills) AS kills,
             max(u.n) AS uniq
        FROM generate_series(v_since_day::TIMESTAMP, v_today::TIMESTAMP, INTERVAL '1 day') g(day)
        LEFT JOIN hours h ON h.day = g.day::DATE
        LEFT JOIN uniq  u ON u.day = g.day::DATE
       GROUP BY g.day
    )
    SELECT coalesce(jsonb_agg(jsonb_build_object(
             'day', to_char(d.day, 'YYYY-MM-DD'),
             'hours_played',   CASE WHEN d.has_minutes THEN round(d.minutes / 60.0, 1) END,
             'unique_players', CASE WHEN d.has_minutes THEN coalesce(d.uniq, 0) END,
             'new_players',    coalesce(d.new_players, 0),
             'peak',           CASE WHEN d.has_players THEN d.peak END,
             'deaths',         coalesce(d.deaths, 0),
             'kills',          coalesce(d.kills, 0)) ORDER BY d.day), '[]'::JSONB)
      INTO v_daily FROM per_day d;

    SELECT coalesce(jsonb_agg(r.cells ORDER BY r.dow), '[]'::JSONB)
      INTO v_heatmap
      FROM (SELECT w.dow, jsonb_agg(round(a.avg_players::NUMERIC, 2) ORDER BY hr.hr) AS cells
              FROM generate_series(0, 6) w(dow)
              CROSS JOIN generate_series(0, 23) hr(hr)
              LEFT JOIN (SELECT extract(dow  FROM h.hour AT TIME ZONE 'UTC')::INT AS dow,
                                extract(hour FROM h.hour AT TIME ZONE 'UTC')::INT AS hr,
                                avg(h.avg_players) AS avg_players
                           FROM aurora.metrics_hourly h
                          WHERE h.server_id = p_server AND h.hour >= v_since AND h.players_source IS NOT NULL
                          GROUP BY 1, 2) a ON a.dow = w.dow AND a.hr = hr.hr
             GROUP BY w.dow) r;

    WITH t AS (
      SELECT p.username, sum(p.minutes)::INT AS minutes
        FROM aurora.metrics_player_hourly p
       WHERE p.server_id = p_server AND p.hour >= v_since GROUP BY 1
       ORDER BY 2 DESC, 1 LIMIT 10
    ), ranked AS (
      SELECT row_number() OVER (ORDER BY t.minutes DESC, t.username) AS rank, t.username, t.minutes,
             coalesce(nullif(btrim(pl.display_name), ''), t.username) AS display_name
        FROM t LEFT JOIN aurora.players pl ON pl.server_id = p_server AND pl.username = t.username
    )
    SELECT coalesce(jsonb_agg(jsonb_build_object('rank', r.rank, 'username', r.username,
                                                 'display_name', r.display_name, 'minutes', r.minutes) ORDER BY r.rank), '[]'::JSONB)
      INTO v_top FROM ranked r;
  END IF;

  SELECT jsonb_build_object(
           'hours_played',   CASE WHEN bool_or(h.minutes_source IS NOT NULL) THEN round(sum(h.player_minutes) / 60.0, 1) END,
           'unique_players', CASE WHEN bool_or(h.minutes_source IS NOT NULL)
                                  THEN (SELECT count(DISTINCT p.username) FROM aurora.metrics_player_hourly p
                                         WHERE p.server_id = p_server AND p.hour >= v_since) END,
           'new_players',    coalesce(sum(h.new_players), 0),
           'peak',           max(h.peak_players),
           'deaths',         coalesce(sum(h.deaths), 0),
           'kills',          coalesce(sum(h.kills), 0))
    INTO v_totals
    FROM aurora.metrics_hourly h WHERE h.server_id = p_server AND h.hour >= v_since;

  RETURN jsonb_build_object(
    'range',          v_range,
    'since',          to_char(v_since_day, 'YYYY-MM-DD'),
    'season_start',   v_season,
    'tracking_since', v_tracking,
    'players_since',  v_players_since,
    'hourly',         v_hourly,
    'daily',          v_daily,
    'heatmap',        v_heatmap,
    'top_time',       v_top,
    'totals',         v_totals);
END;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_summary(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.metrics_summary(TEXT, TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.metrics_summary(TEXT, TEXT) IS
  'Public (052): the Outcast Metrics page''s numbers for range 7, 30 or season, every key always present: range, since, season_start, tracking_since, players_since, hourly (7 days or less), daily, heatmap (UTC weekday x hour), top_time (top 10), totals. Usernames and display names only.';

-- ============================================================================
-- 5. PUBLIC READ: metrics_races
-- ============================================================================
-- One jsonb for the three races, from the current world's start (season_start):
--   season_start, now,
--   kills: {players: [{username, display_name, total, series}], hourly_totals}
--          top 10 by season kills from kill_events; series and hourly_totals are sparse
--          [hour, n, hour, n, ...] with hour counted from season_start (whole hours);
--          hourly_totals is every player's kills together.
--   lives: {players: [{username, display_name, best_hours, hours_survived, is_dead,
--           first_seen, deaths: [[iso time, hours at death], ...]}]}
--          top 10 by longest life (the most hours at a death or now), deaths from
--          aurora.deaths since season_start, never merged from aurora.lives.
--   time:  {players: [{username, display_name, minutes, series}]} top 10 by season minutes
--          from metrics_player_hourly, series sparse [hour, minutes, ...].
-- Same visibility as aurora.leaderboard: usernames and display names, nothing else.
CREATE OR REPLACE FUNCTION aurora.metrics_races(p_server TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_start  TIMESTAMPTZ;
  v_kills  JSONB := '[]'::JSONB;
  v_totals JSONB := '[]'::JSONB;
  v_lives  JSONB := '[]'::JSONB;
  v_time   JSONB := '[]'::JSONB;
BEGIN
  SELECT w.started_at INTO v_start FROM aurora.worlds w WHERE w.server_id = p_server AND w.status = 'current';
  IF v_start IS NULL THEN
    SELECT min(k.t) INTO v_start FROM aurora.kill_events k WHERE k.server_id = p_server;
  END IF;
  v_start := coalesce(v_start, date_trunc('day', now(), 'UTC'));

  -- kills
  WITH k AS (
    SELECT e.username, floor(extract(epoch FROM (e.t - v_start)) / 3600)::INT AS hr
      FROM aurora.kill_events e WHERE e.server_id = p_server AND e.t >= v_start AND e.t <= now()
  ), top AS (
    SELECT k.username, count(*)::INT AS total FROM k GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10
  ), per AS (
    SELECT k.username, k.hr, count(*)::INT AS n FROM k JOIN top USING (username) GROUP BY 1, 2
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'username', t.username,
           'display_name', coalesce(nullif(btrim(pl.display_name), ''), t.username),
           'total', t.total,
           'series', coalesce((SELECT jsonb_agg(c.v ORDER BY p.hr, c.o)
                                 FROM per p CROSS JOIN LATERAL (VALUES (1, p.hr), (2, p.n)) AS c(o, v)
                                WHERE p.username = t.username), '[]'::JSONB)
         ) ORDER BY t.total DESC, t.username), '[]'::JSONB)
    INTO v_kills
    FROM top t LEFT JOIN aurora.players pl ON pl.server_id = p_server AND pl.username = t.username;

  WITH k AS (
    SELECT floor(extract(epoch FROM (e.t - v_start)) / 3600)::INT AS hr
      FROM aurora.kill_events e WHERE e.server_id = p_server AND e.t >= v_start AND e.t <= now()
  ), per AS (
    SELECT k.hr, count(*)::INT AS n FROM k GROUP BY 1
  )
  SELECT coalesce(jsonb_agg(c.v ORDER BY p.hr, c.o), '[]'::JSONB)
    INTO v_totals
    FROM per p CROSS JOIN LATERAL (VALUES (1, p.hr), (2, p.n)) AS c(o, v);

  -- lives
  WITH cand AS (
    SELECT pl.username, pl.display_name, pl.hours_survived, pl.is_dead, pl.first_seen,
           greatest(coalesce((SELECT max(d.hours_survived) FROM aurora.deaths d
                               WHERE d.server_id = p_server AND d.username = pl.username AND d.t >= v_start), 0),
                    coalesce(pl.hours_survived, 0)) AS best
      FROM aurora.players pl WHERE pl.server_id = p_server
  ), top AS (
    SELECT * FROM cand WHERE best > 0 ORDER BY best DESC, username LIMIT 10
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'username', t.username,
           'display_name', coalesce(nullif(btrim(t.display_name), ''), t.username),
           'best_hours', round(t.best::NUMERIC, 2),
           'hours_survived', round(coalesce(t.hours_survived, 0)::NUMERIC, 2),
           'is_dead', coalesce(t.is_dead, FALSE),
           'first_seen', t.first_seen,
           'deaths', coalesce((SELECT jsonb_agg(jsonb_build_array(to_char(d.t AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                                                                  round(coalesce(d.hours_survived, 0)::NUMERIC, 2)) ORDER BY d.t)
                                 FROM aurora.deaths d
                                WHERE d.server_id = p_server AND d.username = t.username AND d.t >= v_start), '[]'::JSONB)
         ) ORDER BY t.best DESC, t.username), '[]'::JSONB)
    INTO v_lives FROM top t;

  -- time played
  WITH m AS (
    SELECT p.username, sum(p.minutes)::INT AS minutes
      FROM aurora.metrics_player_hourly p
     WHERE p.server_id = p_server AND p.hour >= date_trunc('hour', v_start, 'UTC') GROUP BY 1
  ), top AS (
    SELECT * FROM m ORDER BY minutes DESC, username LIMIT 10
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'username', t.username,
           'display_name', coalesce(nullif(btrim(pl.display_name), ''), t.username),
           'minutes', t.minutes,
           'series', coalesce((SELECT jsonb_agg(c.v ORDER BY ph.hr, c.o)
                                 FROM (SELECT floor(extract(epoch FROM (p.hour - v_start)) / 3600)::INT AS hr, p.minutes
                                         FROM aurora.metrics_player_hourly p
                                        WHERE p.server_id = p_server AND p.username = t.username
                                          AND p.hour >= date_trunc('hour', v_start, 'UTC')) ph
                                 CROSS JOIN LATERAL (VALUES (1, ph.hr), (2, ph.minutes)) AS c(o, v)), '[]'::JSONB)
         ) ORDER BY t.minutes DESC, t.username), '[]'::JSONB)
    INTO v_time
    FROM top t LEFT JOIN aurora.players pl ON pl.server_id = p_server AND pl.username = t.username;

  RETURN jsonb_build_object(
    'season_start', v_start,
    'now',          now(),
    'kills',        jsonb_build_object('players', v_kills, 'hourly_totals', v_totals),
    'lives',        jsonb_build_object('players', v_lives),
    'time',         jsonb_build_object('players', v_time));
END;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_races(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.metrics_races(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.metrics_races(TEXT) IS
  'Public (052): the three race feeds for the current world, as one jsonb: season_start, now, kills {players, hourly_totals}, lives {players}, time {players}. Sparse series are [hour, n, ...] counted in whole hours from season_start. Usernames and display names only.';

-- ============================================================================
-- 6. SCHEDULE
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.disable_metrics_cron()
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job BIGINT;
BEGIN
  FOR v_job IN SELECT jobid FROM cron.job WHERE jobname = 'metrics-rollup' LOOP
    PERFORM cron.unschedule(v_job);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION aurora.enable_metrics_cron()
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM aurora.disable_metrics_cron();
  -- Every hour at :10: the last 3 hours, to catch late ingest.
  PERFORM cron.schedule('metrics-rollup', '10 * * * *',
                        'SELECT aurora.metrics_rollup(now() - INTERVAL ''3 hours'', now());');
END;
$$;

REVOKE ALL ON FUNCTION aurora.enable_metrics_cron()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.disable_metrics_cron() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regprocedure('cron.schedule(text,text,text)') IS NOT NULL THEN
    PERFORM aurora.enable_metrics_cron();
    RAISE NOTICE 'metrics-rollup scheduled (hourly at :10)';
  ELSE
    RAISE NOTICE 'pg_cron is not installed: the metrics-rollup job is NOT scheduled';
  END IF;
END
$$;

-- ============================================================================
-- 7. BACKFILL: from the earliest raw row to now, two weeks at a time
-- ============================================================================
-- Events (new players, deaths, kills) go back to the season start; minutes and player
-- counts start where the position and health rows still begin; play_sessions (when
-- imported later) fill the rest through another aurora.metrics_rollup call.
DO $$
DECLARE
  v_first  TIMESTAMPTZ;
  v_cursor TIMESTAMPTZ;
  v_hours  INT := 0;
BEGIN
  SELECT least(
           (SELECT min(t) FROM aurora.player_position_history),
           (SELECT min(t) FROM aurora.health_samples),
           (SELECT min(t) FROM aurora.deaths),
           (SELECT min(t) FROM aurora.kill_events),
           (SELECT min(first_seen) FROM aurora.players),
           (SELECT min(first_seen) FROM aurora.player_history),
           (SELECT min(started_at) FROM aurora.play_sessions))
    INTO v_first;
  IF v_first IS NULL THEN
    RAISE NOTICE 'metrics backfill: no raw rows yet';
    RETURN;
  END IF;
  v_cursor := date_trunc('hour', v_first, 'UTC');
  WHILE v_cursor <= now() LOOP
    v_hours := v_hours + aurora.metrics_rollup(v_cursor, v_cursor + INTERVAL '14 days');
    v_cursor := v_cursor + INTERVAL '14 days';
  END LOOP;
  RAISE NOTICE 'metrics backfill: % hour rows written from %', v_hours, v_first;
END
$$;
