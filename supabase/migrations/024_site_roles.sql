-- Migration 024: Site roles - admin and superadmin for the website
-- Created: 2026-10-01
-- Description: Member accounts and mascot vote, Task 3 (docs/planning/MascotVote/
--              PLAN.md). Everyone who logs in is a standard member. An admin is an
--              account with the existing `aurora_admin` flag (019) - one flag for the
--              site and the live map, no second admin concept. The superadmin is the
--              owner's account and is the only one who can make or remove admins, from
--              the site's admin dashboard. Depends on 019 (the flag lives in
--              auth.users.raw_app_meta_data, which only postgres and the service role
--              can write; a member cannot grant it to themselves).
--
-- Both flags are read from auth.users at call time, not from the session token, so a
-- demotion takes effect on the next request.
--
-- Roles are never granted automatically at sign-up. The superadmin flag is set only by
-- public.site_grant_superadmin() below, which only postgres can run; admin is set only
-- by public.site_superadmin_set_admin().
--
-- After the owner has registered on the site with Google as dystopianoutcasts@gmail.com,
-- run this once in the SQL editor (it is safe to run again; it returns how many
-- accounts it changed):
--   SELECT public.site_grant_superadmin();
--
-- Grants: Supabase's default privileges give anon, authenticated and service_role
-- EXECUTE on every new function in `public`. REVOKE ... FROM PUBLIC alone leaves those
-- grants in place, so every function here revokes from all four and then grants back
-- only what it needs.

-- ----------------------------------------------------------------------------
-- The Discord identity of an account (internal; called by the functions below
-- and by 025, never by a client).
--
-- auth.identities.provider_id is the Discord user id. For the username, Supabase's
-- Discord provider stores the Discord username as identity_data.full_name, the
-- username with its discriminator as identity_data.name ("name#0" for accounts on the
-- new username system) and the display name as identity_data.custom_claims.global_name.
-- The username is what admins compare against the server, so full_name comes first.
-- To be confirmed against a real Discord row when the first one exists (PLAN.md,
-- Task 10); if the field turns out different, change it here only.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_discord_identity(p_user uuid)
RETURNS TABLE (discord_id text, discord_username text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT i.provider_id,
         coalesce(
           nullif(btrim(i.identity_data ->> 'full_name'), ''),
           nullif(regexp_replace(btrim(i.identity_data ->> 'name'), '#0$', ''), ''),
           nullif(btrim(i.identity_data ->> 'user_name'), ''),
           nullif(btrim(i.identity_data ->> 'preferred_username'), '')
         )
    FROM auth.identities i
   WHERE i.user_id = p_user
     AND i.provider = 'discord'
   ORDER BY i.created_at
   LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.site_discord_identity(uuid) FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION public.site_discord_identity(uuid) IS
  'Internal (migration 024). The Discord user id and username of an account, or no row. Not callable by any client role.';

-- ----------------------------------------------------------------------------
-- Role checks for the calling account.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    (SELECT (u.raw_app_meta_data -> 'aurora_admin') = 'true'::jsonb
         OR (u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb
       FROM auth.users u
      WHERE u.id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.site_is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    (SELECT (u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb
       FROM auth.users u
      WHERE u.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.site_is_admin() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.site_is_superadmin() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.site_is_superadmin() TO authenticated;

COMMENT ON FUNCTION public.site_is_admin() IS
  'True when the calling account has the aurora_admin or superadmin flag in auth.users.raw_app_meta_data (migration 024).';
COMMENT ON FUNCTION public.site_is_superadmin() IS
  'True when the calling account has the superadmin flag in auth.users.raw_app_meta_data (migration 024).';

-- ----------------------------------------------------------------------------
-- The member list (superadmin only).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_superadmin_members()
RETURNS TABLE (
  user_id uuid,
  email text,
  providers text[],
  discord_username text,
  discord_id text,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  is_superadmin boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_superadmin() THEN
    RAISE EXCEPTION 'Only the superadmin can list members' USING ERRCODE = '42501';
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
         coalesce((u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb, false)
    FROM auth.users u
    LEFT JOIN LATERAL public.site_discord_identity(u.id) d ON true
   ORDER BY u.created_at, u.id;
END;
$$;

REVOKE ALL ON FUNCTION public.site_superadmin_members() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_superadmin_members() TO authenticated;

COMMENT ON FUNCTION public.site_superadmin_members() IS
  'Superadmin only (migration 024): one row per account with sign-in methods, Discord identity and role flags. Raises 42501 for anyone else.';

-- ----------------------------------------------------------------------------
-- Make or remove an admin (superadmin only).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_superadmin_set_admin(p_user uuid, p_admin boolean)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target_superadmin boolean;
BEGIN
  IF NOT public.site_is_superadmin() THEN
    RAISE EXCEPTION 'Only the superadmin can change admins' USING ERRCODE = '42501';
  END IF;
  IF p_user IS NULL OR p_admin IS NULL THEN
    RAISE EXCEPTION 'Both an account and a value are required' USING ERRCODE = '22004';
  END IF;
  IF p_user = auth.uid() THEN
    RAISE EXCEPTION 'The superadmin cannot change their own account' USING ERRCODE = '42501';
  END IF;

  SELECT coalesce((u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb, false)
    INTO v_target_superadmin
    FROM auth.users u
   WHERE u.id = p_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No such account' USING ERRCODE = 'P0002';
  END IF;
  IF v_target_superadmin THEN
    RAISE EXCEPTION 'A superadmin account cannot be changed here' USING ERRCODE = '42501';
  END IF;

  -- Only aurora_admin is ever touched; the superadmin flag is not reachable from here.
  IF p_admin THEN
    UPDATE auth.users
       SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"aurora_admin": true}'::jsonb
     WHERE id = p_user;
  ELSE
    UPDATE auth.users
       SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'aurora_admin'
     WHERE id = p_user;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.site_superadmin_set_admin(uuid, boolean) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.site_superadmin_set_admin(uuid, boolean) TO authenticated;

COMMENT ON FUNCTION public.site_superadmin_set_admin(uuid, boolean) IS
  'Superadmin only (migration 024): sets or clears aurora_admin on another account. Refuses the caller''s own account and any superadmin account; never touches the superadmin flag.';

-- ----------------------------------------------------------------------------
-- The one way the superadmin flag is set. Postgres only (the SQL editor).
--
-- Matches the account whose email is dystopianoutcasts@gmail.com AND which has a
-- Google identity for that same address: Google has verified the address, so an
-- account that merely claims it (through another provider) does not qualify.
-- An account with an email/password identity or a password set never qualifies: if
-- email sign-up is on, someone could pre-register the address with a password, and a
-- later Google login linked into that row would otherwise hand the flag to an account
-- whose password a stranger knows.
-- Returns the number of accounts changed: 1 the first time it finds the account,
-- 0 before the owner has registered or once it is already set.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.site_grant_superadmin()
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_changed integer;
BEGIN
  UPDATE auth.users u
     SET raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
                             || '{"superadmin": true, "aurora_admin": true}'::jsonb
   WHERE lower(u.email) = 'dystopianoutcasts@gmail.com'
     AND EXISTS (
           SELECT 1
             FROM auth.identities i
            WHERE i.user_id = u.id
              AND i.provider = 'google'
              AND lower(i.identity_data ->> 'email') = 'dystopianoutcasts@gmail.com'
         )
     AND NOT EXISTS (
           SELECT 1 FROM auth.identities e WHERE e.user_id = u.id AND e.provider = 'email'
         )
     AND coalesce(u.encrypted_password, '') = ''
     AND NOT (
           coalesce((u.raw_app_meta_data -> 'superadmin') = 'true'::jsonb, false)
       AND coalesce((u.raw_app_meta_data -> 'aurora_admin') = 'true'::jsonb, false)
         );
  GET DIAGNOSTICS v_changed = ROW_COUNT;
  RETURN v_changed;
END;
$$;

REVOKE ALL ON FUNCTION public.site_grant_superadmin() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION public.site_grant_superadmin() IS
  'Postgres only (migration 024): gives the owner''s Google-verified account (dystopianoutcasts@gmail.com) the superadmin and aurora_admin flags. Returns how many accounts changed. Run SELECT public.site_grant_superadmin(); after the owner registers.';

-- Run once now. Before the owner has registered this changes nothing (returns 0).
SELECT public.site_grant_superadmin();
