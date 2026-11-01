-- Migration 044: housekeeping (usage, 2026-11-01)
-- Description: the database had reached 643 MB on the 500 MB plan. Four tables only ever
--   grew: health_samples (334 MB), net._http_response (111 MB), player_position_history
--   (104 MB) and cron.job_run_details (34 MB). This adds one daily cleanup, runs it once
--   now, and takes the three aurora tables out of the Realtime publication (nothing
--   subscribes since T19: the map polls).
--
-- What is kept, and why that is enough:
--   * health_samples: 8 days. The oldest reader looks back 7 days (home summary and world
--     stats, the hourly player peak). The full `raw` statistics are read only from the
--     newest sample, and `raw.game.zombies-killed` from the last 2 days before today, so
--     samples older than 3 days keep only that one number. The newest sample of each
--     server is never deleted or slimmed (the "last seen" line reads it at any age).
--   * player_position_history: 7 days. Its only reader is positions_public's delayed
--     position, which looks back settings.visibility.delayMinutes. Each player's newest
--     row is never deleted.
--   * cron.job_run_details: 2 days (two jobs log a row every minute).
--   * net._http_response is already emptied by pg_net after 6 hours; its 111 MB is space
--     left behind, which only VACUUM FULL returns (see ORDER).
--
-- ORDER: apply after 043 (any order after 040 works). Then run each VACUUM FULL from the
--   README row on its own: deleting rows does not shrink the size the plan counts.
-- Safe to run twice. Tests: tests/aurora_housekeeping.sql.

-- ============================================================================
-- 1. aurora.housekeeping()
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.housekeeping(
  p_health_days  INT DEFAULT 8,
  p_slim_days    INT DEFAULT 3,
  p_history_days INT DEFAULT 7,
  p_cron_days    INT DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_health  BIGINT;
  v_slim    BIGINT;
  v_history BIGINT;
  v_cron    BIGINT := NULL;
BEGIN
  IF p_health_days IS NULL OR p_slim_days IS NULL OR p_history_days IS NULL OR p_cron_days IS NULL
     OR p_health_days < 8 OR p_slim_days < 3 OR p_slim_days > p_health_days
     OR p_history_days < 1 OR p_cron_days < 1 THEN
    RAISE EXCEPTION 'housekeeping: need health_days >= 8, 3 <= slim_days <= health_days, history_days >= 1, cron_days >= 1; got %, %, %, %',
      p_health_days, p_slim_days, p_history_days, p_cron_days;
  END IF;

  -- Health samples older than p_health_days, except each server's newest.
  DELETE FROM aurora.health_samples h
   WHERE h.t < now() - make_interval(days => p_health_days)
     AND h.t < (SELECT max(m.t) FROM aurora.health_samples m WHERE m.server_id = h.server_id);
  GET DIAGNOSTICS v_health = ROW_COUNT;

  -- Older than p_slim_days: keep only raw.game.zombies-killed (the kills-today reader).
  UPDATE aurora.health_samples h
     SET raw = s.slim
    FROM (SELECT x.server_id, x.t,
                 CASE WHEN jsonb_typeof(x.raw #> '{game,zombies-killed}') = 'number'
                      THEN jsonb_build_object('game', jsonb_build_object('zombies-killed', x.raw #> '{game,zombies-killed}'))
                 END AS slim
            FROM aurora.health_samples x
           WHERE x.t < now() - make_interval(days => p_slim_days)
             AND x.raw IS NOT NULL
             AND x.t < (SELECT max(m.t) FROM aurora.health_samples m WHERE m.server_id = x.server_id)) s
   WHERE h.server_id = s.server_id
     AND h.t = s.t
     AND h.raw IS DISTINCT FROM s.slim;
  GET DIAGNOSTICS v_slim = ROW_COUNT;

  -- Position history older than p_history_days, except each player's newest row.
  DELETE FROM aurora.player_position_history h
   WHERE h.t < now() - make_interval(days => p_history_days)
     AND h.t < (SELECT max(m.t) FROM aurora.player_position_history m
                 WHERE m.server_id = h.server_id AND m.username = h.username);
  GET DIAGNOSTICS v_history = ROW_COUNT;

  -- pg_cron's run log, where pg_cron exists.
  IF to_regclass('cron.job_run_details') IS NOT NULL THEN
    EXECUTE 'DELETE FROM cron.job_run_details WHERE end_time < now() - make_interval(days => $1)' USING p_cron_days;
    GET DIAGNOSTICS v_cron = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'health_deleted',  v_health,
    'health_slimmed',  v_slim,
    'history_deleted', v_history,
    'cron_deleted',    v_cron
  );
END;
$$;

REVOKE ALL ON FUNCTION aurora.housekeeping(INT, INT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.housekeeping(INT, INT, INT, INT) TO service_role;

COMMENT ON FUNCTION aurora.housekeeping(INT, INT, INT, INT) IS
  'Daily cleanup (044): health_samples older than 8 days deleted and older than 3 days slimmed to raw.game.zombies-killed (each server''s newest kept whole), player_position_history older than 7 days deleted (each player''s newest kept), cron.job_run_details older than 2 days deleted. Returns the counts. Run by the aurora-housekeeping pg_cron job; service_role only.';

-- ============================================================================
-- 2. The daily job (09:23 UTC, the quiet hours), where pg_cron exists
-- ============================================================================

DO $$
BEGIN
  IF to_regprocedure('cron.schedule(text,text,text)') IS NULL THEN
    RAISE NOTICE 'pg_cron is not installed: aurora-housekeeping NOT scheduled';
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job j WHERE j.jobname = 'aurora-housekeeping') THEN
    PERFORM cron.unschedule('aurora-housekeeping');
  END IF;
  PERFORM cron.schedule('aurora-housekeeping', '23 9 * * *', 'SELECT aurora.housekeeping();');
  RAISE NOTICE 'aurora-housekeeping scheduled daily at 09:23 UTC';
END;
$$;

-- ============================================================================
-- 3. Realtime: nothing subscribes (T19), so stop publishing the three tables
-- ============================================================================

DO $$
DECLARE
  v_table TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RETURN;
  END IF;
  FOREACH v_table IN ARRAY ARRAY['player_positions', 'vehicles', 'health_samples'] LOOP
    IF EXISTS (SELECT 1 FROM pg_publication_tables
                WHERE pubname = 'supabase_realtime' AND schemaname = 'aurora' AND tablename = v_table) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE aurora.%I', v_table);
      RAISE NOTICE 'aurora.% removed from supabase_realtime', v_table;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================================
-- 4. The first run
-- ============================================================================

SELECT aurora.housekeeping();
