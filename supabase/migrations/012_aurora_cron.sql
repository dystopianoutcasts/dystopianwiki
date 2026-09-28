-- Migration 012: OutcastAurora Ingest Cron
-- Created: 2026-09-28
-- Description: pg_cron + pg_net, and the enable/disable helpers for the
--              once-a-minute aurora-ingest job.
--
-- THE JOB IS NOT SCHEDULED BY THIS MIGRATION. The Edge Function does not exist
-- until T08 deploys it, and a minutely job posting to a 404 would fill
-- cron.job_run_details with failures. T08 turns it on with one call - see
-- "Enabling the job" below.
--
-- ---------------------------------------------------------------------------
-- Where the Authorization header comes from
-- ---------------------------------------------------------------------------
-- Supabase Vault, read at job run time, never at schedule time. The scheduled
-- command text stored in cron.job contains the SUBQUERY, not the key, so the
-- secret key never lands in cron.job.command, in cron.job_run_details, in
-- this migration, or in the repository. Nothing here hardcodes it.
--
-- One-time setup, run by the owner in the SQL editor (not committed):
--
--   SELECT vault.create_secret(
--     '<secret key, sb_secret_...>',
--     'aurora_service_role_key',
--     'Bearer token for the aurora-ingest cron job'
--   );
--
-- NOT a legacy service_role JWT. Legacy API keys are DISABLED on this project:
-- the old JWT is rejected with "Legacy API keys are disabled". Use the secret
-- key from Settings -> API Keys, the same value the function reads as
-- AURORA_SERVICE_KEY.
--
-- To rotate: SELECT vault.update_secret(id, '<new JWT>') for that secret, or
-- delete and recreate it. The cron job needs no change, because it reads the
-- secret by name every minute.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================================
-- disable_ingest_cron()
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.disable_ingest_cron()
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = aurora, cron, public, pg_temp
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job j WHERE j.jobname = 'aurora-ingest') THEN
    PERFORM cron.unschedule('aurora-ingest');
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION aurora.disable_ingest_cron() IS
  'Unschedule the aurora-ingest job. Returns true if a job was removed.';

-- ============================================================================
-- enable_ingest_cron()
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
          'Authorization', 'Bearer ' || (
            SELECT s.decrypted_secret
              FROM vault.decrypted_secrets s
             WHERE s.name = 'aurora_service_role_key'
          )
        ),
        body    := jsonb_build_object('source', 'pg_cron'),
        timeout_milliseconds := 50000
      );
    $job$, p_functions_url)
  ) INTO v_job_id;

  RETURN v_job_id;
END;
$$;

COMMENT ON FUNCTION aurora.enable_ingest_cron(TEXT) IS
  'Schedule aurora-ingest every minute. Reads the bearer token from Vault at run time, so no key is stored in cron.job.';

REVOKE ALL ON FUNCTION aurora.enable_ingest_cron(TEXT)  FROM PUBLIC;
REVOKE ALL ON FUNCTION aurora.disable_ingest_cron()     FROM PUBLIC;

-- Neither anon nor authenticated gets EXECUTE. service_role does, so the ingest
-- function can pause and resume its own schedule during a backfill.
GRANT EXECUTE ON FUNCTION aurora.enable_ingest_cron(TEXT)  TO service_role;
GRANT EXECUTE ON FUNCTION aurora.disable_ingest_cron()     TO service_role;

-- ============================================================================
-- Enabling the job (T08, after the Edge Function is deployed)
-- ============================================================================
--   SELECT aurora.enable_ingest_cron();
--
-- Check it:
--   SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'aurora-ingest';
--   SELECT status, return_message, start_time
--     FROM cron.job_run_details
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'aurora-ingest')
--    ORDER BY start_time DESC LIMIT 5;
--
-- Turn it off again:
--   SELECT aurora.disable_ingest_cron();
--
-- History pruning is not scheduled here either; add it alongside the ingest job
-- once T08 has settled on a retention window:
--   SELECT cron.schedule('aurora-prune-history', '17 4 * * *',
--                        $$ SELECT aurora.prune_history(30); $$);
