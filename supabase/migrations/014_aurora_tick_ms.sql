-- Migration 014: health_samples.avg_update_period_ms -> tick_ms, plus min/max
-- Created: 2026-09-28
-- Description: Store the real server tick duration. Implements the schema half
--              of Fable's RCON decision
--              (docs/planning/OutcastAurora/OPEN-QUESTION-rcon-plaintext.md,
--              "What changes", T07 line).
--
-- Why the old column was wrong
-- ---------------------------
-- 008 named this column after the RCON/Lua performance counter
-- `avg-update-period`, on the assumption that it was the mean tick duration in
-- milliseconds. It is neither a mean nor a duration. PerformanceStatistic.java:53
-- computes it as
--
--     avgUpdatePeriod.set((long)((period - avg) * 0.05F))
--
-- and every Counter is perishable by default (Counter.java:33-34), so
-- Statistic.update() resets it to 0 after each read (Statistic.java:58-60). The
-- reported number is therefore roughly 5% of the current cycle time, not an
-- average of anything. Confirmed live: the T01 sample read `avg-update-period: 5`
-- beside `fps: 104`, and 0.05 * 104 = 5.2.
--
-- The real tick duration is the performance counter named `fps` - "Current
-- update cycle duration", in milliseconds (PerformanceStatistic.java:30, 54).
-- 104 ms is the 10 Hz server main loop (GameServer.java:831). The name is the
-- engine's, not ours, and it is a trap: the counter called `fps` is a duration,
-- while getServerFPS() is a hardcoded 10 (LuaManager.java:12127) and stays
-- banned from display. The column comments below exist so nobody "corrects" the
-- mapping back.
--
-- `min-update-period` and `max-update-period` ARE real, each over a one-second
-- window, so they are worth keeping beside the instantaneous figure: a tick
-- spike between two samples is invisible in `fps` alone.
--
-- Existing rows
-- -------------
-- The table is empty on this project (verified 2026-09-28: 0 rows), so in
-- practice the NULL-out below is a no-op. It is here for any environment where
-- it is not: a rename preserves the old values, and those values would then sit
-- under a name that means something else. They cannot be converted back either -
-- the (long) cast truncates, so a stored 5 could have come from any cycle
-- between 100 and 119 ms. Meaningless is better discarded than relabelled.

DO $$
DECLARE
  v_rows BIGINT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'aurora.health_samples'::REGCLASS
       AND attname  = 'avg_update_period_ms'
       AND NOT attisdropped
  ) THEN
    EXECUTE 'ALTER TABLE aurora.health_samples RENAME COLUMN avg_update_period_ms TO tick_ms';

    EXECUTE 'UPDATE aurora.health_samples SET tick_ms = NULL WHERE tick_ms IS NOT NULL';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows > 0 THEN
      RAISE NOTICE
        'discarded % avg_update_period_ms value(s): the old counter was ~5%% of cycle time, not a tick duration',
        v_rows;
    END IF;
  END IF;
END;
$$;

ALTER TABLE aurora.health_samples
  ADD COLUMN IF NOT EXISTS tick_min_ms REAL,
  ADD COLUMN IF NOT EXISTS tick_max_ms REAL;

COMMENT ON COLUMN aurora.health_samples.tick_ms IS
  'Server main-loop cycle duration in ms, from the performance counter named `fps` (PerformanceStatistic.java:30,54). Despite the engine name it is a DURATION, not a frame rate - about 104 ms on the 10 Hz server loop. Do not source this from `avg-update-period` (~5% of cycle time, perishable) or from getServerFPS() (hardcoded 10).';

COMMENT ON COLUMN aurora.health_samples.tick_min_ms IS
  'Shortest main-loop cycle in ms over the last one-second window, from the performance counter `min-update-period`. A real minimum, unlike avg-update-period.';

COMMENT ON COLUMN aurora.health_samples.tick_max_ms IS
  'Longest main-loop cycle in ms over the last one-second window, from the performance counter `max-update-period`. This is where a stall between two samples shows up; tick_ms alone would miss it.';

-- Client grants need no change. 009 grants SELECT on the whole table
-- (`GRANT SELECT ON aurora.health_samples TO anon, authenticated`), not per
-- column, so the renamed and added columns are readable automatically. The
-- policy suite asserts this rather than assuming it, because switching this
-- table to column-level grants later would silently hide new columns.

-- Verification (expects tick_ms, tick_min_ms, tick_max_ms and no
-- avg_update_period_ms):
--   SELECT attname
--     FROM pg_attribute
--    WHERE attrelid = 'aurora.health_samples'::REGCLASS
--      AND attnum > 0 AND NOT attisdropped
--    ORDER BY attnum;
