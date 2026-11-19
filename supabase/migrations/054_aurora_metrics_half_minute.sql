-- Migration 054: Outcast Metrics, a session covers a minute only when it covers 30 seconds of it
-- Created: 2026-11-18
-- Description: 053 counted every clock minute a session touched, so each session was rounded UP
--   (about one extra minute a session; One read 221.6 h against 218.2 h from the logs). Now a
--   session counts a minute only when its overlap with that minute is at least 30 seconds, which
--   rounds to nearest and averages the error to about zero. The shared minute grid stays, so
--   position and session minutes still union cleanly. Replaces aurora.metrics_minutes only.
--   After applying, aurora.metrics_rollup is re-run over the season (this file does).
-- Safe to run twice.

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
       -- a session covers a clock minute only when it covers at least 30 s of it (round to nearest)
       AND least(s.ended_at, m.minute + INTERVAL '1 minute') - greatest(s.started_at, m.minute) >= INTERVAL '30 seconds'
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


REVOKE ALL ON FUNCTION aurora.metrics_minutes(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;

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
