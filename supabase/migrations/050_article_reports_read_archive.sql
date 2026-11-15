-- Migration 050: article reports can be marked read, and archived (put away, never deleted)
-- Created: 2026-11-15
-- Description: The admin Reports section gets a read state and an archive. Spec:
--              docs/2026-11-15-brief-reports-read-and-archive.md. Depends on 048 and 049.
--
-- Same security model as 048: RLS stays on with no policies and no table grants; every function
-- is SECURITY DEFINER with search_path = '' and an admin check (public.site_is_admin()), revokes
-- Supabase's default EXECUTE grants, and grants back only to `authenticated`. Anyone who is not
-- an admin gets 'denied', 0 or zero rows.
--
-- Choices:
-- * Old reports: a report whose status is not 'new' was already triaged, so it starts READ
--   (read_at = reviewed_at). Every report still 'new' starts UNREAD. Archived: none.
-- * article_reports_admin changes signature (a third argument, p_box). It is DROPPED and created
--   again, not overloaded: two functions with the same name would make PostgREST's call
--   ambiguous, and the old one would show archived reports in the inbox. p_box defaults to
--   'inbox', so a caller that passes two arguments still works.
-- * article_reports_new_count keeps its name and signature so the dashboard tab keeps working.
--   It now counts UNREAD INBOX reports (not read, not archived), whatever their status.
-- * article_reports_box_counts() gives the three numbers the Inbox / Archive switch shows.
-- * article_reports_mark_all_read(uuid[]) marks the reports on screen in one statement.
-- * Archiving never deletes. article_report_delete is unchanged.
--
-- Run it whole in the SQL editor, then NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COLUMNS, INDEX, BACKFILL
-- ============================================================================

ALTER TABLE public.article_reports
  ADD COLUMN IF NOT EXISTS read_at     timestamptz,
  ADD COLUMN IF NOT EXISTS read_by     uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- The inbox list: not archived, newest first.
CREATE INDEX IF NOT EXISTS article_reports_inbox_idx
  ON public.article_reports (created_at DESC) WHERE archived_at IS NULL;

-- Reports already triaged count as read.
UPDATE public.article_reports
   SET read_at = coalesce(reviewed_at, created_at),
       read_by = reviewed_by
 WHERE status <> 'new' AND read_at IS NULL;

-- ============================================================================
-- ADMINS: list (inbox or archive), counts, mark read, archive
-- ============================================================================

DROP FUNCTION IF EXISTS public.article_reports_admin(text, integer);

-- Reports newest first. p_status is one of new, confirmed, fixed, not_a_problem or all; p_box is
-- 'inbox' (not archived) or 'archived'; anything else returns nothing. p_limit is clamped to 1..500.
CREATE OR REPLACE FUNCTION public.article_reports_admin(p_status text DEFAULT 'new', p_limit integer DEFAULT 200, p_box text DEFAULT 'inbox')
RETURNS TABLE (
  id               uuid,
  created_at       timestamptz,
  article_id       text,
  article_slug     text,
  article_version  text,
  article_title    text,
  article_url      text,
  section          text,
  kind             text,
  message          text,
  evidence         text,
  reporter_name    text,
  status           text,
  admin_note       text,
  reviewed_by_name text,
  reviewed_at      timestamptz,
  note_updated_by_name text,
  note_updated_at  timestamptz,
  read_at          timestamptz,
  archived_at      timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN;
  END IF;
  IF p_status IS NULL OR p_status NOT IN ('new', 'confirmed', 'fixed', 'not_a_problem', 'all') THEN
    RETURN;
  END IF;
  IF p_box IS NULL OR p_box NOT IN ('inbox', 'archived') THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT r.id, r.created_at, r.article_id, r.article_slug, r.article_version, r.article_title, r.article_url,
         r.section, r.kind, r.message, r.evidence,
         CASE WHEN r.reporter_id IS NULL THEN NULL
              ELSE coalesce(nullif(btrim(u.raw_user_meta_data ->> 'username'), ''), 'a member') END,
         r.status, r.admin_note,
         CASE WHEN r.reviewed_by IS NULL THEN NULL
              ELSE coalesce(nullif(btrim(a.raw_user_meta_data ->> 'username'), ''), 'an admin') END,
         r.reviewed_at,
         CASE WHEN r.note_updated_by IS NULL THEN NULL
              ELSE coalesce(nullif(btrim(n.raw_user_meta_data ->> 'username'), ''), 'an admin') END,
         r.note_updated_at,
         r.read_at, r.archived_at
    FROM public.article_reports r
    LEFT JOIN auth.users u ON u.id = r.reporter_id
    LEFT JOIN auth.users a ON a.id = r.reviewed_by
    LEFT JOIN auth.users n ON n.id = r.note_updated_by
   WHERE (p_status = 'all' OR r.status = p_status)
     AND ((p_box = 'inbox' AND r.archived_at IS NULL) OR (p_box = 'archived' AND r.archived_at IS NOT NULL))
   ORDER BY r.created_at DESC, r.id
   LIMIT greatest(1, least(coalesce(p_limit, 200), 500));
END;
$$;

-- Unread reports in the inbox (not read, not archived). 0 for anyone who is not an admin.
CREATE OR REPLACE FUNCTION public.article_reports_new_count()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN 0;
  END IF;
  RETURN (SELECT count(*)::integer FROM public.article_reports r WHERE r.read_at IS NULL AND r.archived_at IS NULL);
END;
$$;

-- The numbers on the Inbox / Archive switch: unread in the inbox, all in the inbox, all archived.
-- Zero rows for anyone who is not an admin.
CREATE OR REPLACE FUNCTION public.article_reports_box_counts()
RETURNS TABLE (unread integer, inbox integer, archived integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT (count(*) FILTER (WHERE r.archived_at IS NULL AND r.read_at IS NULL))::integer,
         (count(*) FILTER (WHERE r.archived_at IS NULL))::integer,
         (count(*) FILTER (WHERE r.archived_at IS NOT NULL))::integer
    FROM public.article_reports r;
END;
$$;

-- Returns 'ok', 'denied', 'invalid' or 'not_found'. p_read true sets read_at and read_by (the
-- first time only); false clears both.
CREATE OR REPLACE FUNCTION public.article_report_mark_read(p_id uuid, p_read boolean)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN 'denied';
  END IF;
  IF p_id IS NULL OR p_read IS NULL THEN
    RETURN 'invalid';
  END IF;
  UPDATE public.article_reports r
     SET read_at = CASE WHEN p_read THEN coalesce(r.read_at, now()) ELSE NULL END,
         read_by = CASE WHEN p_read THEN coalesce(r.read_by, auth.uid()) ELSE NULL END
   WHERE r.id = p_id;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN CASE WHEN v_updated = 1 THEN 'ok' ELSE 'not_found' END;
END;
$$;

-- Returns 'ok', 'denied' or 'invalid'. Marks every listed report that is still unread as read, in
-- one statement. Ids that no longer exist are skipped. At most 500 ids.
CREATE OR REPLACE FUNCTION public.article_reports_mark_all_read(p_ids uuid[])
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN 'denied';
  END IF;
  IF p_ids IS NULL OR cardinality(p_ids) > 500 OR array_position(p_ids, NULL) IS NOT NULL THEN
    RETURN 'invalid';
  END IF;
  UPDATE public.article_reports r
     SET read_at = now(), read_by = auth.uid()
   WHERE r.id = ANY (p_ids) AND r.read_at IS NULL;
  RETURN 'ok';
END;
$$;

-- Returns 'ok', 'denied', 'invalid' or 'not_found'. p_archived true puts the report away (the
-- first time only); false puts it back in the inbox. The row is never deleted.
CREATE OR REPLACE FUNCTION public.article_report_archive(p_id uuid, p_archived boolean)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN 'denied';
  END IF;
  IF p_id IS NULL OR p_archived IS NULL THEN
    RETURN 'invalid';
  END IF;
  UPDATE public.article_reports r
     SET archived_at = CASE WHEN p_archived THEN coalesce(r.archived_at, now()) ELSE NULL END,
         archived_by = CASE WHEN p_archived THEN coalesce(r.archived_by, auth.uid()) ELSE NULL END
   WHERE r.id = p_id;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN CASE WHEN v_updated = 1 THEN 'ok' ELSE 'not_found' END;
END;
$$;

REVOKE ALL ON FUNCTION public.article_reports_admin(text, integer, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_reports_new_count() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_reports_box_counts() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_report_mark_read(uuid, boolean) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_reports_mark_all_read(uuid[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_report_archive(uuid, boolean) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.article_reports_admin(text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_reports_new_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_reports_box_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_report_mark_read(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_reports_mark_all_read(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_report_archive(uuid, boolean) TO authenticated;

COMMENT ON FUNCTION public.article_reports_admin(text, integer, text) IS
  'Admins: reports newest first, filtered by status (or all), from the inbox (not archived) or the archive. Zero rows for anyone else.';
COMMENT ON FUNCTION public.article_reports_new_count() IS
  'Admins: the number of unread inbox reports (not read, not archived). 0 for anyone else.';
COMMENT ON FUNCTION public.article_reports_box_counts() IS
  'Admins: unread in the inbox, all in the inbox, all archived. Zero rows for anyone else.';
COMMENT ON FUNCTION public.article_report_mark_read(uuid, boolean) IS
  'Admins: mark a report read or unread. Returns ok, denied, invalid or not_found.';
COMMENT ON FUNCTION public.article_reports_mark_all_read(uuid[]) IS
  'Admins: mark the listed reports read (up to 500). Returns ok, denied or invalid.';
COMMENT ON FUNCTION public.article_report_archive(uuid, boolean) IS
  'Admins: put a report in the archive, or back in the inbox. Never deletes. Returns ok, denied, invalid or not_found.';
