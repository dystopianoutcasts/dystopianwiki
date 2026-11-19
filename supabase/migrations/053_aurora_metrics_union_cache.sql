-- Migration 053: Outcast Metrics, minutes from positions AND server logs; races cached
-- Created: 2026-11-18
-- Description: two fixes to 052 found in review.
--
--   1. A few stray position rows before 2026-11-11 (a player seen once in an hour) made 052
--      treat the whole hour as "measured" and refuse the server-log sessions for it, so the
--      season before the positions began stayed nearly empty. Now a player's minutes in an
--      hour are the de-duplicated UNION, per username and per minute, of the minutes with a
--      position row and the minutes covered by a play_sessions row. A minute in both counts
--      once. The "never downgrade" rank rule is gone for minutes: every run recomputes the
--      minutes of an hour from whatever sources have rows for it, and an hour with no source
--      row at all keeps what it had (so pruned position rows cannot blank an hour).
--      minutes_source / players_source say what the hour was made of: positions, server_log,
--      or both. Player COUNTS (average and peak) still prefer the health samples over a
--      minutes-based estimate and never downgrade to the estimate.
--   2. aurora.metrics_races is anon-callable and costs about 0.25 s a call. Its work moves to
--      aurora.metrics_races_compute (not public); the public aurora.metrics_races returns a
--      cached row from aurora.metrics_races_cache (RLS on, no client grant), refreshed at the
--      end of every aurora.metrics_rollup (so by the hourly cron, the backfill and the
--      play-session importer), and computes once without storing when the cache has no row.
--      The races feed also carries sessions_imported: whether play_sessions has any rows for
--      the server, so the page can say when time played is counted from positions only.
--
-- Safe to run twice.

ALTER TABLE aurora.metrics_hourly DROP CONSTRAINT IF EXISTS metrics_hourly_minutes_source_check;
ALTER TABLE aurora.metrics_hourly DROP CONSTRAINT IF EXISTS metrics_hourly_players_source_check;
ALTER TABLE aurora.metrics_hourly
  ADD CONSTRAINT metrics_hourly_minutes_source_check CHECK (minutes_source IN ('positions', 'server_log', 'both'));
ALTER TABLE aurora.metrics_hourly
  ADD CONSTRAINT metrics_hourly_players_source_check CHECK (players_source IN ('health', 'positions', 'server_log', 'both'));

-- Quality of a player-count source: 2 measured by the server (health), 1 an estimate from minutes.
CREATE OR REPLACE FUNCTION aurora.metrics_source_rank(p_source TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE p_source WHEN 'health' THEN 2 WHEN 'positions' THEN 1 WHEN 'server_log' THEN 1 WHEN 'both' THEN 1 ELSE 0 END;
$$;

-- One row per (server, UTC hour, username, minute) a player was online, in [p_from, p_to):
-- the union of position minutes and session minutes. source: positions, server_log, or both
-- (the minute is in both).
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
  ), joined AS (
    SELECT pos.server_id, pos.hour, pos.username, pos.minute, 'positions'::TEXT AS src FROM pos
    UNION ALL
    SELECT sess.server_id, sess.hour, sess.username, sess.minute, 'server_log'::TEXT FROM sess
  )
  SELECT j.server_id, j.hour, j.username, j.minute,
         CASE WHEN count(DISTINCT j.src) = 2 THEN 'both' ELSE min(j.src) END
    FROM joined j
   GROUP BY j.server_id, j.hour, j.username, j.minute;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_source_rank(TEXT)                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.metrics_minutes(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- The races: cache
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.metrics_races_cache (
  server_id   TEXT PRIMARY KEY,
  body        JSONB       NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE aurora.metrics_races_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.metrics_races_cache FROM PUBLIC, anon, authenticated;
GRANT ALL ON aurora.metrics_races_cache TO service_role;
COMMENT ON TABLE aurora.metrics_races_cache IS
  'One row per server: the computed aurora.metrics_races() answer, refreshed at the end of every metrics_rollup (053). Public only through metrics_races().';

-- ============================================================================
-- The rollup: minutes from the union of positions and sessions
-- ============================================================================

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
           CASE WHEN bool_or(m.source IN ('positions', 'both')) AND bool_or(m.source IN ('server_log', 'both')) THEN 'both'
                WHEN bool_or(m.source IN ('positions', 'both')) THEN 'positions'
                ELSE 'server_log' END AS source
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
              WHEN ma.server_id IS NOT NULL THEN ma.source END                 AS players_source,
         coalesce(ma.minutes, 0) AS player_minutes,
         coalesce(ma.uniq, 0)    AS unique_players,
         ma.source               AS minutes_source,
         coalesce(na.n, 0)       AS new_players,
         coalesce(da.n, 0)       AS deaths,
         coalesce(ka.n, 0)       AS kills
    FROM keys k
    LEFT JOIN minute_agg ma ON ma.server_id = k.server_id AND ma.hour = k.hour
    LEFT JOIN peak_agg   pa ON pa.server_id = k.server_id AND pa.hour = k.hour
    LEFT JOIN health_agg ha ON ha.server_id = k.server_id AND ha.hour = k.hour
    LEFT JOIN death_agg  da ON da.server_id = k.server_id AND da.hour = k.hour
    LEFT JOIN kill_agg   ka ON ka.server_id = k.server_id AND ka.hour = k.hour
    LEFT JOIN new_agg    na ON na.server_id = k.server_id AND na.hour = k.hour;

  INSERT INTO aurora.metrics_hourly AS m
    (server_id, hour, avg_players, peak_players, player_minutes, unique_players, new_players,
     deaths, kills, minutes_source, players_source)
  SELECT t.server_id, t.hour, t.avg_players, t.peak_players, t.player_minutes, t.unique_players,
         t.new_players, t.deaths, t.kills, t.minutes_source, t.players_source
    FROM pg_temp.metrics_hours_tmp t
  ON CONFLICT (server_id, hour) DO UPDATE SET
    -- player counts: a measured (health) count is never replaced by a minutes-based estimate
    avg_players    = CASE WHEN aurora.metrics_source_rank(EXCLUDED.players_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.players_source) >= aurora.metrics_source_rank(m.players_source)
                          THEN EXCLUDED.avg_players ELSE m.avg_players END,
    peak_players   = CASE WHEN aurora.metrics_source_rank(EXCLUDED.players_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.players_source) >= aurora.metrics_source_rank(m.players_source)
                          THEN EXCLUDED.peak_players ELSE m.peak_players END,
    players_source = CASE WHEN aurora.metrics_source_rank(EXCLUDED.players_source) > 0
                           AND aurora.metrics_source_rank(EXCLUDED.players_source) >= aurora.metrics_source_rank(m.players_source)
                          THEN EXCLUDED.players_source ELSE m.players_source END,
    -- minutes: recomputed from whatever sources have rows; an hour with none keeps what it had
    player_minutes = CASE WHEN EXCLUDED.minutes_source IS NOT NULL THEN EXCLUDED.player_minutes ELSE m.player_minutes END,
    unique_players = CASE WHEN EXCLUDED.minutes_source IS NOT NULL THEN EXCLUDED.unique_players ELSE m.unique_players END,
    minutes_source = CASE WHEN EXCLUDED.minutes_source IS NOT NULL THEN EXCLUDED.minutes_source ELSE m.minutes_source END,
    -- events: a recompute that finds nothing (rows pruned since) keeps what was stored
    new_players    = CASE WHEN EXCLUDED.new_players = 0 THEN m.new_players ELSE EXCLUDED.new_players END,
    deaths         = CASE WHEN EXCLUDED.deaths      = 0 THEN m.deaths      ELSE EXCLUDED.deaths      END,
    kills          = CASE WHEN EXCLUDED.kills       = 0 THEN m.kills       ELSE EXCLUDED.kills       END;

  DELETE FROM aurora.metrics_player_hourly p
   USING pg_temp.metrics_hours_tmp t
   WHERE t.minutes_source IS NOT NULL AND p.server_id = t.server_id AND p.hour = t.hour;

  INSERT INTO aurora.metrics_player_hourly (server_id, hour, username, minutes)
  SELECT m.server_id, m.hour, m.username, count(*)::INT
    FROM pg_temp.metrics_minutes_tmp m
    JOIN pg_temp.metrics_hours_tmp t ON t.server_id = m.server_id AND t.hour = m.hour AND t.minutes_source IS NOT NULL
   GROUP BY m.server_id, m.hour, m.username;

  SELECT count(*) INTO v_count FROM pg_temp.metrics_hours_tmp;

  -- The races read a cached answer; refresh it now that the numbers moved.
  PERFORM aurora.metrics_races_refresh();
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_rollup(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.metrics_rollup(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

-- ============================================================================
-- The races: compute (private), refresh, and the public cached read
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.metrics_races_compute(p_server TEXT)
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
    'time',         jsonb_build_object('players', v_time),
    'sessions_imported', EXISTS (SELECT 1 FROM aurora.play_sessions s WHERE s.server_id = p_server));
END;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_races_compute(TEXT) FROM PUBLIC, anon, authenticated;

-- Recomputes the cache row of every known server.
CREATE OR REPLACE FUNCTION aurora.metrics_races_refresh()
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_server TEXT;
  v_count  INT := 0;
BEGIN
  FOR v_server IN SELECT s.id FROM aurora.servers s LOOP
    INSERT INTO aurora.metrics_races_cache AS c (server_id, body, computed_at)
    VALUES (v_server, aurora.metrics_races_compute(v_server), now())
    ON CONFLICT (server_id) DO UPDATE SET body = EXCLUDED.body, computed_at = EXCLUDED.computed_at;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION aurora.metrics_races_refresh() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.metrics_races_refresh() TO service_role;

-- Public: the cached answer; computed once, not stored, when the cache has no row yet.
CREATE OR REPLACE FUNCTION aurora.metrics_races(p_server TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce((SELECT c.body FROM aurora.metrics_races_cache c WHERE c.server_id = p_server),
                  aurora.metrics_races_compute(p_server));
$$;

REVOKE ALL ON FUNCTION aurora.metrics_races(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.metrics_races(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.metrics_races(TEXT) IS
  'Public (052, cached by 053): the three race feeds for the current world, as one jsonb: season_start, now, kills {players, hourly_totals}, lives {players}, time {players}, sessions_imported. Refreshed hourly by the metrics-rollup job; computed on the spot when no cached row exists.';

-- Fill the cache and recompute the whole season now that minutes are the union.
DO $$
DECLARE
  v_first TIMESTAMPTZ;
BEGIN
  SELECT min(hour) INTO v_first FROM aurora.metrics_hourly;
  IF v_first IS NOT NULL THEN
    PERFORM aurora.metrics_rollup(v_first, now());
  END IF;
END
$$;
