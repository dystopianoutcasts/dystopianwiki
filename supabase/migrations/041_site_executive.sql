-- Migration 041: Site executive role and the EYES ONLY document area
-- Created: 2026-10-11
-- Description: A fourth account tier for the website, between a standard member and an
--              admin. An executive can open the hidden EYES ONLY area of the site and
--              nothing else. Depends on 024 (site_is_admin, site_is_superadmin,
--              site_discord_identity; flags live in auth.users.raw_app_meta_data, which
--              a member cannot write).
--
-- Owner decisions, 2026-10-11:
--   * Admins and the superadmin inherit executive automatically; they need no flag.
--   * Admins and the superadmin can make or remove executives from the dashboard. Only
--     the `executive` key is ever written, never aurora_admin or superadmin.
--   * Admins can see member emails (the superadmin already can) so they can find the
--     right account.
--   * Only the owner (superadmin) uploads or deletes EYES ONLY documents.
--   * Documents live ONLY in the database (public.eyes_only_documents). The repo and the
--     GitHub Pages site are public and never hold document content.
--
-- Every access path is a function that checks the caller's role from auth.users at call
-- time. The tables have RLS enabled, no policies, and no grants to client roles, so a
-- direct SELECT or INSERT is refused (deny by default).
--
-- Grants: Supabase's default privileges give anon, authenticated and service_role
-- EXECUTE on every new function in `public`. Every function here revokes from all four
-- and then grants back only what it needs (see 024).
--
-- To apply (the owner, never `supabase db push`):
--   psql "<session pooler connection string>" -X -v ON_ERROR_STOP=1 -1 -f supabase/migrations/041_site_executive.sql
-- then the tests, WITHOUT -1 (they ROLLBACK on their own):
--   psql "<session pooler connection string>" -X -v ON_ERROR_STOP=1 -f supabase/tests/site_executive.sql

-- ----------------------------------------------------------------------------
-- Role check for the calling account. Admins and the superadmin inherit.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_is_executive()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    (SELECT (u.raw_app_meta_data -> 'executive') = 'true'::jsonb
         OR (u.raw_app_meta_data -> 'aurora_admin') = 'true'::jsonb
         OR (u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb
       FROM auth.users u
      WHERE u.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.site_is_executive() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_is_executive() TO authenticated;

COMMENT ON FUNCTION public.site_is_executive() IS
  'True when the calling account has the executive, aurora_admin or superadmin flag in auth.users.raw_app_meta_data (migration 041).';

-- ----------------------------------------------------------------------------
-- Audit trail of executive grants and removals. Written only by
-- site_admin_set_executive(); no client role can read or write it.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_role_events (
  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  at      timestamptz NOT NULL DEFAULT now(),
  actor   uuid NOT NULL,
  target  uuid NOT NULL,
  role    text NOT NULL CHECK (role IN ('executive')),
  granted boolean NOT NULL
);

ALTER TABLE public.site_role_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_role_events FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.site_role_events IS
  'Audit trail of executive grants and removals (migration 041). RLS on, no policies: only the SECURITY DEFINER functions write it.';

-- ----------------------------------------------------------------------------
-- The member list for admins (same columns as site_superadmin_members() plus
-- is_executive).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_admin_members()
RETURNS TABLE (
  user_id uuid,
  email text,
  providers text[],
  discord_username text,
  discord_id text,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  is_superadmin boolean,
  is_executive boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Only an admin can list members' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT u.id,
         u.email::text,
         coalesce(
           (SELECT array_agg(DISTINCT i.provider ORDER BY i.provider) FROM auth.identities i WHERE i.user_id = u.id),
           ARRAY[]::text[]
         ),
         d.discord_username,
         d.discord_id,
         u.created_at,
         u.last_sign_in_at,
         coalesce((u.raw_app_meta_data -> 'aurora_admin') = 'true'::jsonb, false),
         coalesce((u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb, false),
         coalesce((u.raw_app_meta_data -> 'executive') = 'true'::jsonb, false)
    FROM auth.users u
    LEFT JOIN LATERAL public.site_discord_identity(u.id) d ON true
   ORDER BY u.created_at, u.id;
END;
$$;

REVOKE ALL ON FUNCTION public.site_admin_members() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_admin_members() TO authenticated;

COMMENT ON FUNCTION public.site_admin_members() IS
  'Admin or superadmin only (migration 041): one row per account with sign-in methods, Discord identity, email and role flags. Raises 42501 for anyone else.';

-- ----------------------------------------------------------------------------
-- Make or remove an executive (admin or superadmin).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_admin_set_executive(p_user uuid, p_executive boolean)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target_privileged boolean;
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Only an admin can change executives' USING ERRCODE = '42501';
  END IF;
  IF p_user IS NULL OR p_executive IS NULL THEN
    RAISE EXCEPTION 'Both an account and a value are required' USING ERRCODE = '22004';
  END IF;
  IF p_user = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own account' USING ERRCODE = '42501';
  END IF;

  SELECT coalesce((u.raw_app_meta_data -> 'aurora_admin') = 'true'::jsonb, false)
      OR coalesce((u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb, false)
    INTO v_target_privileged
    FROM auth.users u
   WHERE u.id = p_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No such account' USING ERRCODE = 'P0002';
  END IF;
  IF v_target_privileged THEN
    RAISE EXCEPTION 'Admins and the superadmin are executives already' USING ERRCODE = '42501';
  END IF;

  -- Only the executive key is ever touched; aurora_admin and superadmin are not
  -- reachable from here.
  IF p_executive THEN
    UPDATE auth.users
       SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"executive": true}'::jsonb
     WHERE id = p_user;
  ELSE
    UPDATE auth.users
       SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'executive'
     WHERE id = p_user;
  END IF;

  INSERT INTO public.site_role_events (actor, target, role, granted)
  VALUES (auth.uid(), p_user, 'executive', p_executive);
END;
$$;

REVOKE ALL ON FUNCTION public.site_admin_set_executive(uuid, boolean) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_admin_set_executive(uuid, boolean) TO authenticated;

COMMENT ON FUNCTION public.site_admin_set_executive(uuid, boolean) IS
  'Admin or superadmin only (migration 041): sets or clears the executive flag on another account and writes an audit row. Refuses the caller''s own account and any admin or superadmin account; never touches aurora_admin or superadmin.';

-- ----------------------------------------------------------------------------
-- EYES ONLY documents. One self-contained HTML file per slug.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eyes_only_documents (
  slug       text PRIMARY KEY
               CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 80),
  title      text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  summary    text NOT NULL DEFAULT '' CHECK (length(summary) <= 500),
  html       text NOT NULL CHECK (octet_length(html) <= 8388608),
  sha256     text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NOT NULL
);

ALTER TABLE public.eyes_only_documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.eyes_only_documents FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.eyes_only_documents IS
  'EYES ONLY documents (migration 041). RLS on, no policies: all access goes through eyes_only_list/get and the superadmin put/delete functions.';

-- The list, without the document bodies (executive, admin or superadmin).
CREATE OR REPLACE FUNCTION public.eyes_only_list()
RETURNS TABLE (
  slug text,
  title text,
  summary text,
  updated_at timestamptz,
  size_bytes integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_executive() THEN
    RAISE EXCEPTION 'Not permitted' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT d.slug, d.title, d.summary, d.updated_at, octet_length(d.html)
    FROM public.eyes_only_documents d
   ORDER BY d.updated_at DESC, d.slug;
END;
$$;

-- One document, body included (executive, admin or superadmin).
CREATE OR REPLACE FUNCTION public.eyes_only_get(p_slug text)
RETURNS TABLE (
  slug text,
  title text,
  summary text,
  html text,
  sha256 text,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_executive() THEN
    RAISE EXCEPTION 'Not permitted' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT d.slug, d.title, d.summary, d.html, d.sha256, d.updated_at
    FROM public.eyes_only_documents d
   WHERE d.slug = p_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No such document' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.eyes_only_list() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.eyes_only_get(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.eyes_only_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.eyes_only_get(text) TO authenticated;

COMMENT ON FUNCTION public.eyes_only_list() IS
  'Executive, admin or superadmin only (migration 041): slug, title, summary, updated_at and size of each EYES ONLY document, never the body. Raises 42501 for anyone else.';
COMMENT ON FUNCTION public.eyes_only_get(text) IS
  'Executive, admin or superadmin only (migration 041): one EYES ONLY document with its HTML and sha256. 42501 for anyone else, P0002 when the slug does not exist.';

-- Upload or replace a document (superadmin only). Returns the sha256 of the HTML.
CREATE OR REPLACE FUNCTION public.site_superadmin_put_eyes_only(
  p_slug text,
  p_title text,
  p_summary text,
  p_html text
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash text;
BEGIN
  IF NOT public.site_is_superadmin() THEN
    RAISE EXCEPTION 'Only the superadmin can upload documents' USING ERRCODE = '42501';
  END IF;
  IF p_slug IS NULL OR p_title IS NULL OR p_summary IS NULL OR p_html IS NULL THEN
    RAISE EXCEPTION 'A slug, title, summary and document are required' USING ERRCODE = '22004';
  END IF;

  v_hash := encode(sha256(convert_to(p_html, 'UTF8')), 'hex');

  -- The table's CHECK constraints enforce the slug, title, summary and size limits.
  INSERT INTO public.eyes_only_documents AS d (slug, title, summary, html, sha256, updated_at, updated_by)
  VALUES (p_slug, p_title, p_summary, p_html, v_hash, now(), auth.uid())
  ON CONFLICT ON CONSTRAINT eyes_only_documents_pkey DO UPDATE
     SET title = excluded.title,
         summary = excluded.summary,
         html = excluded.html,
         sha256 = excluded.sha256,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by;

  RETURN v_hash;
END;
$$;

-- Delete a document (superadmin only).
CREATE OR REPLACE FUNCTION public.site_superadmin_delete_eyes_only(p_slug text)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_superadmin() THEN
    RAISE EXCEPTION 'Only the superadmin can delete documents' USING ERRCODE = '42501';
  END IF;
  IF p_slug IS NULL THEN
    RAISE EXCEPTION 'A slug is required' USING ERRCODE = '22004';
  END IF;

  DELETE FROM public.eyes_only_documents WHERE slug = p_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No such document' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.site_superadmin_put_eyes_only(text, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.site_superadmin_delete_eyes_only(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_superadmin_put_eyes_only(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.site_superadmin_delete_eyes_only(text) TO authenticated;

COMMENT ON FUNCTION public.site_superadmin_put_eyes_only(text, text, text, text) IS
  'Superadmin only (migration 041): inserts or replaces an EYES ONLY document and returns the sha256 of its HTML. Slug, title, summary and size limits are table CHECK constraints (23514).';
COMMENT ON FUNCTION public.site_superadmin_delete_eyes_only(text) IS
  'Superadmin only (migration 041): deletes an EYES ONLY document. P0002 when the slug does not exist.';
