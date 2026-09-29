-- Migration 015: aurora.ingest_bearer() - the cron job must fail loudly on a
-- missing or empty bearer
-- Created: 2026-09-29
-- Description: On 2026-09-28 the ingest cron ran green (cron.job_run_details
--              reporting succeeded) three times in a row while every HTTP
--              call was rejected 401 at the gateway, because the Vault secret
--              held an empty string and 'Bearer ' || '' went out as a header
--              with no token (STATUS "T15 FAIL at step 5" and the follow-ups
--              at 23:55 and 00:05 UTC). A green cron must never again be able
--              to mask a dead ingest.
--
-- Why the fix is a RAISE, not a silent skip
-- ----------------------------------------------------------------------------
-- pg_cron does not care whether the SQL it ran succeeded in any meaningful
-- sense; it only records whether the command it executed returned normally or
-- raised. 012's job body built the header inline as
--   'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets ...)
-- and that expression evaluates to NULL or 'Bearer ' without ever raising, so
-- net.http_post still ran, cron recorded success, and the 401 was visible only
-- in net._http_response - never in cron.job_run_details, which is what a
-- watcher actually reads. Moving the resolve into aurora.ingest_bearer() and
-- RAISING there means the same failure now makes
-- cron.job_run_details.status = 'failed' with a grep-able message, and
-- net.http_post is never called at all for that run - no HTTP call goes out
-- with no token in it.
--
-- aurora.ingest_bearer()
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER so the decrypt happens as this function's OWNER regardless
-- of which role pg_cron executes the scheduled command as. T15 raised, and
-- never confirmed, whether the job's execution role can read
-- vault.decrypted_secrets at all; wrapping the read in a definer function
-- owned by a role that certainly can makes that question moot rather than
-- answering it. search_path is pinned empty, so every name below is
-- schema-qualified on purpose - that matters more than usual in a function
-- whose whole job is to read and return a secret.
--
-- Both failure shapes seen on 2026-09-28 are covered by one check each:
--   - MISSING or NULL: no row, or a NULL value (the earlier "vault secret ...
--     is missing" case from 012's own EXISTS check, which only ever ran at
--     schedule time, not at each job run).
--   - EMPTY STRING: what actually happened - a mistyped shell variable name
--     expanded to "" and was stored as the secret's value. A length floor of
--     20 catches this without hardcoding the exact key length.
--   - WRONG KIND: a legacy service_role JWT or a publishable key pasted in by
--     mistake would each authenticate to nothing useful; the sb_secret_
--     prefix check catches both, since neither starts with it.

CREATE OR REPLACE FUNCTION aurora.ingest_bearer()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_secret TEXT;
BEGIN
  SELECT s.decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets s
   WHERE s.name = 'aurora_service_role_key';

  IF v_secret IS NULL OR length(v_secret) < 20 THEN
    RAISE EXCEPTION 'aurora ingest bearer is missing or empty';
  END IF;

  IF left(v_secret, 10) <> 'sb_secret_' THEN
    RAISE EXCEPTION 'aurora ingest bearer is not a secret key';
  END IF;

  RETURN v_secret;
END;
$$;

COMMENT ON FUNCTION aurora.ingest_bearer() IS
  'Resolves the aurora-ingest bearer token from Vault and RAISEs rather than returning NULL or an empty value, so a broken bearer fails the cron run (cron.job_run_details.status = failed) instead of sending a dead Authorization header. See migration 015 header.';

REVOKE ALL ON FUNCTION aurora.ingest_bearer() FROM PUBLIC;
-- No further GRANT. The only caller is the SQL text aurora.enable_ingest_cron
-- schedules below, which pg_cron executes as the role that called
-- cron.schedule() - the SECURITY DEFINER owner of enable_ingest_cron, which is
-- also this function's owner. An owner always has EXECUTE on its own
-- functions, so no explicit grant is needed and none is given.

-- ============================================================================
-- enable_ingest_cron() - identical to 012 except the Authorization header,
-- which now calls aurora.ingest_bearer() instead of inlining the subquery.
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
        timeout_milliseconds := 50000
      );
    $job$, p_functions_url)
  ) INTO v_job_id;

  RETURN v_job_id;
END;
$$;

COMMENT ON FUNCTION aurora.enable_ingest_cron(TEXT) IS
  'Schedule aurora-ingest every minute. The bearer comes from aurora.ingest_bearer(), which RAISEs on a missing or malformed secret so a broken bearer fails the cron run instead of sending a dead header (migration 015).';

-- ============================================================================
-- Re-enabling after this migration
-- ============================================================================
-- The scheduled command text changed, so the job must be rescheduled even
-- though its name and interval did not. Re-enabling starts unattended writes
-- against the production database, so the owner runs this, not a migration:
--
--   SELECT aurora.enable_ingest_cron();
--
-- A run with a missing or empty bearer now shows up as:
--
--   SELECT status, return_message, start_time
--     FROM cron.job_run_details
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'aurora-ingest')
--    ORDER BY start_time DESC LIMIT 5;
--
-- status = 'failed', return_message containing either
-- 'aurora ingest bearer is missing or empty' or
-- 'aurora ingest bearer is not a secret key', and no new row for that run in
-- net._http_response - the point of this migration is that the bad case never
-- reaches net.http_post at all.
