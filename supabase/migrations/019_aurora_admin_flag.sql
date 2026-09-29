-- Migration 019: Admin flag leaves the client-writable profile table
-- Created: 2026-09-29
-- Description: T26 / T16 P0-1. Any signed-in account could make itself an
--              Aurora admin, because aurora.is_aurora_admin() read
--              public.user_profiles.is_aurora_admin, a column `authenticated`
--              holds UPDATE on via the policy "Users can update own profile"
--              (003_row_level_security.sql:51-55), which has no column limit
--              and no WITH CHECK beyond ownership. The admin fact moves to
--              auth.users.raw_app_meta_data, writable only by the service role
--              (and postgres). Depends on 008 (the function and column this
--              replaces).
--
-- Before this migration: authenticated could UPDATE user_profiles.is_aurora_admin
-- on their own row and aurora.is_aurora_admin() trusted that value. 0 admins
-- existed at review time (T16), so nothing was exploited, but the hole was real
-- and independent of who holds an account - T24's invite-only signups narrow
-- who could try it, they do not close it.
--
-- To make someone an admin (owner, SQL editor or run_sql.py), after this
-- migration is applied:
--   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"aurora_admin": true}'
--    WHERE id = '<user uuid>';
-- The user must sign in again (or have their session refreshed) before the
-- change is seen: the flag is read per request from the JWT-backed auth.users
-- row, not cached anywhere client-side, but a session issued before the update
-- still carries the old app_metadata until it is reissued.
--
-- CREATE OR REPLACE keeps the function's existing grants (008: EXECUTE to anon,
-- authenticated, service_role) because the signature is unchanged; the REVOKE/
-- GRANT pair below is issued anyway so this migration is self-contained and
-- safe to run twice, or on a schema where 008's grants were somehow lost.

CREATE OR REPLACE FUNCTION aurora.is_aurora_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT (u.raw_app_meta_data ->> 'aurora_admin')::BOOLEAN
       FROM auth.users u
      WHERE u.id = auth.uid()),
    FALSE
  );
$$;

REVOKE ALL ON FUNCTION aurora.is_aurora_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.is_aurora_admin() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.is_aurora_admin() IS
  'True when auth.users.raw_app_meta_data->>''aurora_admin'' is true for the calling user. False for anonymous. Only the service role (and postgres) may write raw_app_meta_data, so a signed-in user cannot grant this to themselves (T16 P0-1, migration 019). To make someone an admin: UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || ''{"aurora_admin": true}'' WHERE id = ''<user uuid>''; the user must sign in again for the change to be seen.';

-- The column this function used to read. Repo-wide grep at the time of writing
-- found no reader outside supabase/ (this migration, 008, and the policy
-- suite) and scripts/aurora-realtime-seed.ts, updated in the same commit to
-- set the app-metadata key through the admin API instead of this column.
-- Dropping it removes the client-writable path outright, rather than leaving a
-- dead column someone could be tempted to trust again later.
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS is_aurora_admin;
