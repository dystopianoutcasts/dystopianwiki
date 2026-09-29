-- Migration 016: aurora.ingest_lock - one ingest run at a time, and a cron
-- timeout that waits for the whole near-live run
-- Created: 2026-09-29
-- Description: T23 holds each ingest run's SFTP session open for most of the
--              minute and re-reads the log every 5 s (AURORA_RUN_BUDGET_MS,
--              default 55 s, measured from the function's first instruction).
--              Two runs overlapping would read the same bytes twice: the keyed
--              tables absorb that (upserts are idempotent), but
--              player_position_history is append-only and WOULD duplicate.
--              This migration adds the guard and lengthens the cron's pg_net
--              timeout to cover the run.
--
-- Why a lock row and not pg_try_advisory_lock
-- ----------------------------------------------------------------------------
-- The function talks to the database only through PostgREST, and every
-- PostgREST request is its own transaction on a pooled connection. A session
-- advisory lock taken in one request is held by whichever backend served it,
-- not by the run, and is either released when that request ends or leaks onto
-- a pooled connection some other request then inherits. Neither is a lock on
-- the run. A single row with an expiry is: it survives between requests, it
-- names its holder, and a crashed run's claim simply times out.
--
-- aurora.ingest_lock(run_id, ttl_s) -> boolean
-- ----------------------------------------------------------------------------
-- True only to the holder. The INSERT ... ON CONFLICT DO UPDATE ... WHERE takes
-- the row lock, so two callers arriving together serialize: the second sees the
-- first's fresh expiry, the WHERE is false, no row comes back, it gets false.
-- The same run_id calling again renews its own claim (true). Expiry is
-- checked against now(), the caller's transaction start - each PostgREST call
-- is its own transaction, so that is the moment of the call.
--
-- TTL 90 s (tail.ts LOCK_TTL_S) is longer than any allowed run: tail.ts refuses
-- an AURORA_RUN_BUDGET_MS within 10 s of it, so a live run can never have its
-- lock expire under it. A run that crashes without releasing costs at most one
-- skipped minute (the next cron run at +60 s is refused, the one at +120 s is
-- not).
--
-- enable_ingest_cron() - timeout 58000
-- ----------------------------------------------------------------------------
-- Identical to 015 except timeout_milliseconds, 50000 -> 58000. pg_net cuts the
-- HTTP wait at the timeout, NOT the function: a 55 s run under a 50 s timeout
-- keeps running and writing, but its response (and so its status in
-- net._http_response) is lost. 58 s leaves 3 s past the 55 s budget for a slow
-- final write and the close, and still ends before the next minute's run.

CREATE TABLE IF NOT EXISTS aurora.ingest_lock (
  -- Single-row table: the key can only ever be TRUE.
  id          BOOLEAN     PRIMARY KEY DEFAULT TRUE CHECK (id),
  run_id      TEXT        NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);

COMMENT ON TABLE aurora.ingest_lock IS
  'At most one row: the ingest run currently allowed to tail the log, and when its claim expires. Written only through aurora.ingest_lock()/ingest_unlock() (migration 016).';

-- No policies: nobody reads or writes it directly. The functions below are
-- SECURITY DEFINER, and RLS on is what policy test 5 requires of every table.
ALTER TABLE aurora.ingest_lock ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aurora.ingest_lock FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.ingest_lock TO service_role;

CREATE OR REPLACE FUNCTION aurora.ingest_lock(p_run_id TEXT, p_ttl_s INT DEFAULT 90)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_holder TEXT;
BEGIN
  IF p_run_id IS NULL OR length(p_run_id) = 0 OR length(p_run_id) > 100 THEN
    RAISE EXCEPTION 'aurora.ingest_lock: run_id must be 1 to 100 characters';
  END IF;
  IF p_ttl_s IS NULL OR p_ttl_s < 1 OR p_ttl_s > 600 THEN
    RAISE EXCEPTION 'aurora.ingest_lock: ttl_s must be between 1 and 600';
  END IF;

  INSERT INTO aurora.ingest_lock AS l (id, run_id, acquired_at, expires_at)
  VALUES (TRUE, p_run_id, now(), now() + make_interval(secs => p_ttl_s))
  ON CONFLICT (id) DO UPDATE
     SET run_id      = EXCLUDED.run_id,
         acquired_at = EXCLUDED.acquired_at,
         expires_at  = EXCLUDED.expires_at
   WHERE l.expires_at <= now() OR l.run_id = EXCLUDED.run_id
  RETURNING l.run_id INTO v_holder;

  RETURN v_holder IS NOT NULL;
END;
$$;

COMMENT ON FUNCTION aurora.ingest_lock(TEXT, INT) IS
  'Claim the single ingest lock for p_ttl_s seconds. True to the holder (a fresh claim, an expired one taken over, or the same run renewing); false while another run holds an unexpired claim. Migration 016.';

CREATE OR REPLACE FUNCTION aurora.ingest_unlock(p_run_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_n INT;
BEGIN
  -- Only the holder can release. A run whose claim expired and was taken over
  -- must not delete its successor's lock on the way out.
  DELETE FROM aurora.ingest_lock WHERE run_id = p_run_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n > 0;
END;
$$;

COMMENT ON FUNCTION aurora.ingest_unlock(TEXT) IS
  'Release the ingest lock if p_run_id holds it. True if released; false if the run did not hold it (expired and taken over, or never held). Migration 016.';

REVOKE ALL ON FUNCTION aurora.ingest_lock(TEXT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.ingest_unlock(TEXT)    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.ingest_lock(TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION aurora.ingest_unlock(TEXT)    TO service_role;

-- ============================================================================
-- enable_ingest_cron() - identical to 015 except timeout_milliseconds := 58000
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.enable_ingest_cron(
  p_functions_url TEXT DEFAULT 'https://gwubcipchkwthsorhcky.supabase.co/functions/v1/aurora-ingest'
)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = aurora, cron, extensions, public, pg_temp
AS $$
DECLARE
  v_job_id BIGINT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets s WHERE s.name = 'aurora_service_role_key'
  ) THEN
    RAISE EXCEPTION
      'vault secret aurora_service_role_key is missing; create it first (see the header of 012_aurora_cron.sql)';
  END IF;

  PERFORM aurora.disable_ingest_cron();

  SELECT cron.schedule(
    'aurora-ingest',
    '* * * * *',
    format($job$
      SELECT net.http_post(
        url     := %L,
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || aurora.ingest_bearer()
        ),
        body    := jsonb_build_object('source', 'pg_cron'),
        timeout_milliseconds := 58000
      );
    $job$, p_functions_url)
  ) INTO v_job_id;

  RETURN v_job_id;
END;
$$;

COMMENT ON FUNCTION aurora.enable_ingest_cron(TEXT) IS
  'Schedule aurora-ingest every minute with a 58 s pg_net timeout, covering the 55 s near-live run (migration 016). The bearer comes from aurora.ingest_bearer(), which RAISEs on a missing or malformed secret (migration 015).';

-- ============================================================================
-- Re-enabling after this migration
-- ============================================================================
-- The scheduled command text changed (the timeout), so the job must be
-- rescheduled. The owner runs this, not the migration:
--
--   SELECT aurora.enable_ingest_cron();
--
-- ORDER MATTERS on deploy. Apply this migration BEFORE deploying the T23
-- function: the new function takes the lock first and fails CLOSED (503, no
-- SSH connect) when aurora.ingest_lock does not exist. The old function never
-- calls it, so applying 016 first is harmless to the running ingest.
--
-- Check the timeout in force:
--   SELECT jobid, (command LIKE '%timeout_milliseconds := 58000%') AS timeout_58s
--     FROM cron.job WHERE jobname = 'aurora-ingest';
