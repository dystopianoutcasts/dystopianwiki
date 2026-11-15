-- Migration 048: "Report a problem" on every article
-- Created: 2026-11-15
-- Description: Readers (signed in or not) tell the wiki team that an article is wrong,
--              out of date, hard to understand or has a broken link; admins review the
--              reports on the dashboard. Spec: docs/planning/REPORT-FORM-SPEC.md.
--              Depends on 024 (public.site_is_admin()).
--
-- Nobody reads or writes article_reports directly: RLS is on, there are no policies and no
-- table grants. All access is through the SECURITY DEFINER functions below, each of which
-- revokes Supabase's default EXECUTE grants (anon, authenticated, service_role) and grants
-- back only what it needs, as 024 and 025 do.
--
-- The reporter is taken from auth.uid(), never from the caller. For rate limiting the
-- function stores a SHA-256 of the client address and a server salt (reporter_hash); the raw
-- address is never stored. The limit is 5 reports an hour per account, or per address hash
-- when signed out.
--
-- ORDER: apply after 024. Until it is applied the site's dialog answers "Reports are not
-- switched on yet." (the RPC is missing).

-- ============================================================================
-- TABLES
-- ============================================================================

-- A one-row table holding the salt for reporter_hash. Created once; never client-readable.
CREATE TABLE IF NOT EXISTS public.article_report_config (
  id   boolean PRIMARY KEY DEFAULT true CHECK (id),
  salt text NOT NULL
);
INSERT INTO public.article_report_config (id, salt)
VALUES (true, encode(sha256(convert_to(gen_random_uuid()::text || clock_timestamp()::text, 'UTF8')), 'hex'))
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.article_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  article_id      text NOT NULL CHECK (char_length(article_id) BETWEEN 1 AND 100),
  article_slug    text NOT NULL CHECK (article_slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  -- The article's last_updated as the reader saw it (an ISO date or timestamp, as text).
  article_version text CHECK (article_version IS NULL OR char_length(article_version) BETWEEN 1 AND 40),
  article_title   text NOT NULL CHECK (char_length(article_title) BETWEEN 1 AND 300),
  article_url     text NOT NULL CHECK (article_url ~ '^/[A-Za-z0-9][A-Za-z0-9/_.-]{0,299}$'),
  section         text CHECK (section IS NULL OR char_length(section) BETWEEN 1 AND 200),
  kind            text NOT NULL CHECK (kind IN ('wrong_fact', 'out_of_date', 'unclear', 'broken_link', 'other')),
  message         text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  evidence        text NOT NULL DEFAULT '' CHECK (char_length(evidence) <= 1000),
  -- Deleting an account keeps its reports, anonymized.
  reporter_id     uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  reporter_hash   text NOT NULL,
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'fixed', 'not_a_problem')),
  admin_note      text NOT NULL DEFAULT '' CHECK (char_length(admin_note) <= 2000),
  reviewed_by     uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS article_reports_status_created_idx ON public.article_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS article_reports_reporter_idx ON public.article_reports (reporter_id, created_at DESC) WHERE reporter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS article_reports_hash_idx ON public.article_reports (reporter_hash, created_at DESC);

ALTER TABLE public.article_report_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reports       ENABLE ROW LEVEL SECURITY;

-- Supabase's default privileges grant ALL on new public tables to anon and authenticated.
-- Take them all back. No policies: functions only.
REVOKE ALL ON public.article_report_config, public.article_reports FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- EVERYONE: send a report
-- ============================================================================

-- Returns 'ok', 'rate_limited' or 'invalid'. Never raises to the caller for an ordinary
-- refusal. Only the reader's text and the page they were on come from the caller.
CREATE OR REPLACE FUNCTION public.submit_article_report(
  p_article_id      text,
  p_article_slug    text,
  p_article_version text,
  p_article_title   text,
  p_article_url     text,
  p_section         text,
  p_kind            text,
  p_message         text,
  p_evidence        text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_id       text := btrim(p_article_id);
  v_slug     text := btrim(p_article_slug);
  v_version  text := nullif(btrim(p_article_version), '');
  v_title    text := btrim(p_article_title);
  v_url      text := btrim(p_article_url);
  v_section  text := nullif(btrim(p_section), '');
  v_message  text := btrim(p_message);
  v_evidence text := btrim(coalesce(p_evidence, ''));
  v_headers  jsonb;
  v_ip       text;
  v_hash     text;
  v_recent   integer;
BEGIN
  -- Validate every field. A control character other than a line break or tab is refused.
  IF v_id IS NULL OR v_id !~ '^[A-Za-z0-9_:.-]{1,100}$'
     OR v_slug IS NULL OR v_slug !~ '^[a-z0-9][a-z0-9-]{0,119}$'
     OR v_url IS NULL OR v_url !~ '^/[A-Za-z0-9][A-Za-z0-9/_.-]{0,299}$'
     OR v_title IS NULL OR char_length(v_title) NOT BETWEEN 1 AND 300 OR v_title ~ '[[:cntrl:]]'
     OR (v_version IS NOT NULL AND (char_length(v_version) > 40 OR v_version !~ '^[0-9A-Za-z:.+ -]+$'))
     OR (v_section IS NOT NULL AND (char_length(v_section) > 200 OR v_section ~ '[[:cntrl:]]'))
     OR p_kind IS NULL OR p_kind NOT IN ('wrong_fact', 'out_of_date', 'unclear', 'broken_link', 'other')
     OR v_message IS NULL OR char_length(v_message) NOT BETWEEN 10 AND 2000
     OR translate(v_message, E'\n\r\t', '') ~ '[[:cntrl:]]'
     OR char_length(v_evidence) > 1000
     OR translate(v_evidence, E'\n\r\t', '') ~ '[[:cntrl:]]' THEN
    RETURN 'invalid';
  END IF;

  -- The client address, hashed with the server salt. PostgREST puts the request headers in
  -- a setting; the first x-forwarded-for entry is the client. Missing means one shared
  -- bucket ('unknown'), never an unlimited one.
  BEGIN
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  EXCEPTION WHEN others THEN
    v_headers := NULL;
  END;
  v_ip := coalesce(nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), ''), 'unknown');
  v_hash := encode(sha256(convert_to(v_ip || (SELECT c.salt FROM public.article_report_config c), 'UTF8')), 'hex');

  -- One report at a time per account (or address), so two requests cannot both pass the count.
  PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(v_uid::text, v_hash), 48));

  IF v_uid IS NOT NULL THEN
    SELECT count(*) INTO v_recent FROM public.article_reports r
     WHERE r.reporter_id = v_uid AND r.created_at > now() - interval '1 hour';
  ELSE
    SELECT count(*) INTO v_recent FROM public.article_reports r
     WHERE r.reporter_id IS NULL AND r.reporter_hash = v_hash AND r.created_at > now() - interval '1 hour';
  END IF;
  IF v_recent >= 5 THEN
    RETURN 'rate_limited';
  END IF;

  BEGIN
    INSERT INTO public.article_reports
      (article_id, article_slug, article_version, article_title, article_url, section, kind, message, evidence, reporter_id, reporter_hash)
    VALUES
      (v_id, v_slug, v_version, v_title, v_url, v_section, p_kind, v_message, v_evidence, v_uid, v_hash);
  EXCEPTION WHEN foreign_key_violation THEN
    -- A still-valid session for an account deleted a moment ago.
    RETURN 'invalid';
  END;

  RETURN 'ok';
END;
$$;

-- ============================================================================
-- ADMINS: read, update, delete, count. Anyone else gets zero rows, 0 or 'denied'.
-- ============================================================================

-- Reports newest first. p_status is one of new, confirmed, fixed, not_a_problem or all;
-- anything else returns nothing. p_limit is clamped to 1..500.
CREATE OR REPLACE FUNCTION public.article_reports_admin(p_status text DEFAULT 'new', p_limit integer DEFAULT 200)
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
  reviewed_at      timestamptz
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
  RETURN QUERY
  SELECT r.id, r.created_at, r.article_id, r.article_slug, r.article_version, r.article_title, r.article_url,
         r.section, r.kind, r.message, r.evidence,
         CASE WHEN r.reporter_id IS NULL THEN NULL
              ELSE coalesce(nullif(btrim(u.raw_user_meta_data ->> 'username'), ''), 'a member') END,
         r.status, r.admin_note,
         CASE WHEN r.reviewed_by IS NULL THEN NULL
              ELSE coalesce(nullif(btrim(a.raw_user_meta_data ->> 'username'), ''), 'an admin') END,
         r.reviewed_at
    FROM public.article_reports r
    LEFT JOIN auth.users u ON u.id = r.reporter_id
    LEFT JOIN auth.users a ON a.id = r.reviewed_by
   WHERE p_status = 'all' OR r.status = p_status
   ORDER BY r.created_at DESC, r.id
   LIMIT greatest(1, least(coalesce(p_limit, 200), 500));
END;
$$;

-- Returns 'ok', 'denied', 'invalid' or 'not_found'. A changed status records who and when.
CREATE OR REPLACE FUNCTION public.article_report_update(p_id uuid, p_status text, p_note text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_note text := btrim(coalesce(p_note, ''));
  v_old  text;
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN 'denied';
  END IF;
  IF p_id IS NULL OR p_status IS NULL OR p_status NOT IN ('new', 'confirmed', 'fixed', 'not_a_problem')
     OR char_length(v_note) > 2000 THEN
    RETURN 'invalid';
  END IF;

  SELECT r.status INTO v_old FROM public.article_reports r WHERE r.id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  UPDATE public.article_reports
     SET status      = p_status,
         admin_note  = v_note,
         reviewed_by = CASE WHEN p_status IS DISTINCT FROM v_old THEN auth.uid() ELSE reviewed_by END,
         reviewed_at = CASE WHEN p_status IS DISTINCT FROM v_old THEN now() ELSE reviewed_at END
   WHERE id = p_id;
  RETURN 'ok';
END;
$$;

-- Returns 'ok', 'denied' or 'not_found'.
CREATE OR REPLACE FUNCTION public.article_report_delete(p_id uuid)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF NOT public.site_is_admin() THEN
    RETURN 'denied';
  END IF;
  DELETE FROM public.article_reports WHERE id = p_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN CASE WHEN v_deleted = 1 THEN 'ok' ELSE 'not_found' END;
END;
$$;

-- How many reports are new. 0 for anyone who is not an admin.
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
  RETURN (SELECT count(*)::integer FROM public.article_reports r WHERE r.status = 'new');
END;
$$;

REVOKE ALL ON FUNCTION public.submit_article_report(text, text, text, text, text, text, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_reports_admin(text, integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_report_update(uuid, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_report_delete(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.article_reports_new_count() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_article_report(text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.article_reports_admin(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_report_update(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_report_delete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.article_reports_new_count() TO authenticated;

COMMENT ON TABLE public.article_reports IS
  'Reader reports about an article (migration 048). No client access: read and written only through the article_report* functions.';
COMMENT ON TABLE public.article_report_config IS
  'Internal (migration 048). The salt for article_reports.reporter_hash. No client access.';
COMMENT ON FUNCTION public.submit_article_report(text, text, text, text, text, text, text, text, text) IS
  'Everyone: report a problem with an article. Returns ok, rate_limited (5 an hour per account, or per hashed address when signed out) or invalid. The reporter comes from auth.uid(), not the caller.';
COMMENT ON FUNCTION public.article_reports_admin(text, integer) IS
  'Admins: reports newest first, filtered by status (or all). Zero rows for anyone else.';
COMMENT ON FUNCTION public.article_report_update(uuid, text, text) IS
  'Admins: set a report status and admin note. Returns ok, denied, invalid or not_found.';
COMMENT ON FUNCTION public.article_report_delete(uuid) IS
  'Admins: delete a report. Returns ok, denied or not_found.';
COMMENT ON FUNCTION public.article_reports_new_count() IS
  'Admins: the number of new reports. 0 for anyone else.';
