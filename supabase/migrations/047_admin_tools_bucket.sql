-- Migration 047: Private storage bucket for admin tools (ServerBuddy)
-- Created: 2026-11-13
-- Description: ServerBuddy is a Windows program for managing our game servers from
--              outside (DystopianOutcasts _DEV/ServerBuddy/2026-11-13-plan-serverbuddy.md).
--              It is for website admins only and is downloaded from the admin
--              dashboard, never from a public link. The file sits in a private
--              bucket, `admin-tools`; the dashboard asks Storage for a short-lived
--              signed link, which Storage gives only to a caller who may SELECT the
--              object. Depends on 024 (public.site_is_admin()).
--
-- Who may read: every website admin (owner decision 2026-11-13, plan "DECIDED" 4).
-- site_is_admin() is the aurora_admin or superadmin flag in auth.users app metadata
-- (019, 024), read at call time, so a demotion takes effect on the next request.
-- The program holds no logins and does nothing without a server login the admin
-- already has, so the download itself grants nothing.
--
-- Who may write: nobody through the API. There is no INSERT, UPDATE or DELETE
-- policy, so only the service role (the Supabase dashboard's Storage page) can
-- upload or replace a file. The owner uploads each release there.
--
-- After applying, upload the release from the Supabase dashboard:
--   Storage -> admin-tools -> create folder `serverbuddy` -> upload
--   ServerBuddy-<version>.exe (exactly the file name the site's data file names,
--   packages/web/src/data/serverBuddy.ts).
--
-- Safe to run twice. Tests: tests/admin_tools_bucket.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('admin-tools', 'admin-tools', false, 104857600)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "Admins read admin tools" ON storage.objects;

CREATE POLICY "Admins read admin tools"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'admin-tools' AND (SELECT public.site_is_admin()));

-- No COMMENT ON POLICY: it needs ownership of storage.objects, which the SQL editor's
-- postgres role does not have on Supabase (CREATE POLICY there is documented to work).
