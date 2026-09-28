-- Migration 013: Lock down public.request_log
-- Created: 2026-09-28
-- Description: Close the Supabase advisor finding "RLS Disabled in Public" on
--              public.request_log, and revoke the client grants behind it.
--
-- What was actually wrong
-- ----------------------
-- 003_row_level_security.sql left this table alone on the reasoning that
-- "request_log is internal, no RLS needed (only server-side access)". That
-- reasoning does not hold on Supabase: `public` is an exposed PostgREST schema
-- and the project's default grants gave anon and authenticated full SELECT,
-- INSERT, UPDATE and DELETE. With RLS off, all four were reachable over the REST
-- API with nothing but the anon key. The consequences, in order of severity:
--
--   DELETE - check_rate_limit() counts rows in a time window, so anyone could
--            delete those rows and the rate limiter simply stopped applying.
--   INSERT - an attacker could flood rows for somebody else's `identifier` and
--            rate-limit that person out of the API.
--   SELECT - every identifier (IP or user id), endpoint and timestamp readable.
--
-- TRUNCATE was granted too but was never reachable: anon is NOLOGIN, so the only
-- path in is PostgREST, which has no TRUNCATE verb. Worth remembering anyway,
-- because RLS does not restrict TRUNCATE - only the revoke below does.
--
-- Why this breaks nothing
-- ----------------------
-- check_rate_limit() and cleanup_old_request_logs() are SECURITY DEFINER and
-- owned by postgres, which owns request_log, so they bypass RLS and need no
-- client grants. service_role carries BYPASSRLS. Nothing else touches the table.
-- Deliberately no policies: deny by default, and every legitimate caller already
-- reaches it through a definer function.

ALTER TABLE public.request_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.request_log FROM anon, authenticated;

COMMENT ON TABLE public.request_log IS
  'Rate limiting request log. RLS enabled with no policies and no client grants: reachable only through the SECURITY DEFINER functions check_rate_limit() and cleanup_old_request_logs(), or by service_role.';

-- Verification (expects rls = true, policies = 0, and no anon/authenticated rows):
--   SELECT c.relrowsecurity AS rls,
--          (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policies
--     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname = 'public' AND c.relname = 'request_log';
--
--   SELECT grantee, privilege_type
--     FROM information_schema.role_table_grants
--    WHERE table_schema = 'public' AND table_name = 'request_log'
--      AND grantee IN ('anon', 'authenticated');
