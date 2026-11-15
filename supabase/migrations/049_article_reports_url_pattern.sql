-- 049: fix the article URL pattern from 048
-- Created: 2026-11-15. ORDER: apply after 048.
--
-- 048 checked the article URL with the regex repeat count {0,299}. PostgreSQL allows at most 255
-- (RE_DUP_MAX), so every call to submit_article_report failed with "invalid regular expression:
-- invalid repetition count(s)", and the same pattern sat in a table check. This replaces both
-- with an open repeat and a separate length check of 300 characters. 048 itself is corrected
-- too, so a fresh database that runs 048 and then 049 ends the same way.
--
-- Run it whole in the SQL editor, then NOTIFY pgrst, 'reload schema';
-- CREATE OR REPLACE keeps the function's grants and comment.

ALTER TABLE public.article_reports DROP CONSTRAINT IF EXISTS article_reports_article_url_check;
ALTER TABLE public.article_reports ADD CONSTRAINT article_reports_article_url_check
  CHECK (char_length(article_url) <= 300 AND article_url ~ '^/[A-Za-z0-9][A-Za-z0-9/_.-]*$');

CREATE OR REPLACE FUNCTION public.submit_article_report(
  p_article_id  text,
  p_article_url text,
  p_section     text,
  p_kind        text,
  p_message     text,
  p_evidence    text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_id       text := btrim(p_article_id, E' \t\r\n');
  v_url      text := btrim(p_article_url, E' \t\r\n');
  v_section  text := nullif(btrim(p_section, E' \t\r\n'), '');
  v_message  text := btrim(p_message, E' \t\r\n');
  v_evidence text := btrim(coalesce(p_evidence, ''), E' \t\r\n');
  v_art      record;
  v_headers  jsonb;
  v_xff      text[];
  v_ip       text;
  v_hash     text;
  v_recent   integer;
BEGIN
  -- Validate every field. A control character other than a line break or tab is refused, and
  -- so are Unicode format and bidi characters (zero-width, direction marks and overrides).
  IF v_id IS NULL OR v_id !~ '^[A-Za-z0-9_:.-]{1,100}$'
     OR v_url IS NULL OR char_length(v_url) > 300 OR v_url !~ '^/[A-Za-z0-9][A-Za-z0-9/_.-]*$'
     OR (v_section IS NOT NULL AND (char_length(v_section) > 200 OR v_section ~ '[[:cntrl:]]'
                                    OR v_section ~ '[\u200B-\u200F\u202A-\u202E\u2066-\u2069]'))
     OR p_kind IS NULL OR p_kind NOT IN ('wrong_fact', 'out_of_date', 'unclear', 'broken_link', 'other')
     OR v_message IS NULL OR char_length(v_message) NOT BETWEEN 10 AND 2000
     OR translate(v_message, E'\n\r\t', '') ~ '[[:cntrl:]]'
     OR v_message ~ '[\u200B-\u200F\u202A-\u202E\u2066-\u2069]'
     OR char_length(v_evidence) > 1000
     OR translate(v_evidence, E'\n\r\t', '') ~ '[[:cntrl:]]'
     OR v_evidence ~ '[\u200B-\u200F\u202A-\u202E\u2066-\u2069]' THEN
    RETURN 'invalid';
  END IF;

  -- The page: its slug, title and version come from the table, not from the caller. The path
  -- must end in the article's own slug.
  SELECT a.slug, a.title, a.last_updated INTO v_art FROM public.articles a WHERE a.id = v_id;
  IF NOT FOUND
     OR v_art.slug !~ '^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}$'
     OR right(v_url, char_length(v_art.slug) + 1) <> '/' || v_art.slug THEN
    RETURN 'invalid';
  END IF;

  -- The sender key: an address the caller cannot set. Cloudflare's cf-connecting-ip, else the
  -- rightmost x-forwarded-for entry (added by the platform). Missing means one shared bucket
  -- ('unknown'), never an unlimited one.
  BEGIN
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  EXCEPTION WHEN others THEN
    v_headers := NULL;
  END;
  v_ip := nullif(btrim(coalesce(v_headers ->> 'cf-connecting-ip', '')), '');
  IF v_ip IS NULL THEN
    v_xff := string_to_array(coalesce(v_headers ->> 'x-forwarded-for', ''), ',');
    v_ip := nullif(btrim(v_xff[array_upper(v_xff, 1)]), '');
  END IF;
  v_ip := coalesce(v_ip, 'unknown');
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

  -- The global cap on signed-out reports, across every sender.
  IF v_uid IS NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('article_reports_anonymous', 48));
    IF (SELECT count(*) FROM public.article_reports r
         WHERE r.reporter_id IS NULL AND r.created_at > now() - interval '1 hour') >= 60 THEN
      RETURN 'busy';
    END IF;
  END IF;

  BEGIN
    INSERT INTO public.article_reports
      (article_id, article_slug, article_version, article_title, article_url, section, kind, message, evidence, reporter_id, reporter_hash)
    VALUES
      (v_id, v_art.slug, to_char(v_art.last_updated AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
       left(v_art.title, 300), v_url, v_section, p_kind, v_message, v_evidence, v_uid, v_hash);
  EXCEPTION WHEN foreign_key_violation THEN
    -- A still-valid session for an account deleted a moment ago.
    RETURN 'invalid';
  END;

  RETURN 'ok';
END;
$$;
