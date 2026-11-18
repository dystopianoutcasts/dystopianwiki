-- Migration 051: BattleMetrics rank on the home page
-- Created: 2026-11-18
-- Description: the server's BattleMetrics rank and its last 7 days, read from the
--              BattleMetrics API every hour by the database itself (pg_cron +
--              pg_net), so the home page can show the rank tile and its own rank
--              card instead of BattleMetrics' embedded banner (owner 2026-11-18:
--              the banner's graphs overlap and it scrolls inside its box).
--
-- How it runs:
--   battlemetrics-request (pg_cron, hourly at :05)  aurora.battlemetrics_request()
--     For each linked server, asks GET /servers/{id} and GET /servers/{id}/rank-history
--     (the last 7 days) through net.http_get and notes the request ids. pg_net is
--     asynchronous: the answers land in net._http_response a few seconds later.
--   battlemetrics-collect (pg_cron, every 5 minutes)  aurora.battlemetrics_collect()
--     Reads the answers that have arrived, stores them through the two store
--     functions, and records any failure (HTTP status, timeout, bad JSON) on the
--     server's status row, so a broken token shows up in one SELECT.
--
-- The token: Vault secret 'battlemetrics_api_token', read inside
-- aurora.battlemetrics_token() at run time. It never appears in cron.job.command,
-- cron.job_run_details, this file or the repository. One-time setup, run by the
-- owner in the SQL editor (not committed):
--
--   SELECT vault.create_secret('<BattleMetrics API token>', 'battlemetrics_api_token',
--                              'BattleMetrics API token for the home page rank (051)');
--
-- Until the secret exists, the request job does nothing (a NOTICE, not a failure).
-- To rotate: SELECT vault.update_secret(id, '<new token>') for that secret.
--
-- Public: aurora.battlemetrics_summary(p_server) (anon). Everything else is
-- service_role or owner only; the tables have RLS on and no client grant.
--
-- Check it (SQL editor):
--   SELECT * FROM aurora.battlemetrics_status;           -- last_error is NULL when healthy
--   SELECT aurora.battlemetrics_summary('outcasts-main');
--   SELECT jobname, schedule FROM cron.job WHERE jobname LIKE 'battlemetrics-%';
--
-- Safe to run twice.

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- Which BattleMetrics server each of our servers is. A new season's server gets a
-- new row (or an UPDATE of bm_server_id).
CREATE TABLE IF NOT EXISTS aurora.battlemetrics_links (
  server_id    TEXT PRIMARY KEY,
  bm_server_id TEXT NOT NULL CHECK (bm_server_id ~ '^[0-9]{1,12}$')
);

INSERT INTO aurora.battlemetrics_links (server_id, bm_server_id)
VALUES ('outcasts-main', '41858330')
ON CONFLICT (server_id) DO NOTHING;

-- The newest answer for each server, and the newest failure.
CREATE TABLE IF NOT EXISTS aurora.battlemetrics_status (
  server_id     TEXT PRIMARY KEY,
  bm_server_id  TEXT NOT NULL,
  name          TEXT,
  rank          INT,
  players       INT,
  max_players   INT,
  status        TEXT,
  bm_updated_at TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ,
  last_error    TEXT,
  last_error_at TIMESTAMPTZ
);

-- One row per BattleMetrics rank data point.
CREATE TABLE IF NOT EXISTS aurora.battlemetrics_rank_history (
  server_id TEXT        NOT NULL,
  t         TIMESTAMPTZ NOT NULL,
  rank      INT         NOT NULL CHECK (rank > 0),
  PRIMARY KEY (server_id, t)
);

-- Requests sent and not yet collected.
CREATE TABLE IF NOT EXISTS aurora.battlemetrics_requests (
  request_id   BIGINT PRIMARY KEY,
  server_id    TEXT        NOT NULL,
  kind         TEXT        NOT NULL CHECK (kind IN ('server', 'rank_history')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE aurora.battlemetrics_links        ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.battlemetrics_status       ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.battlemetrics_rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora.battlemetrics_requests     ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.battlemetrics_links        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON aurora.battlemetrics_status       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON aurora.battlemetrics_rank_history FROM PUBLIC, anon, authenticated;
REVOKE ALL ON aurora.battlemetrics_requests     FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE aurora.battlemetrics_links IS
  'Our server id -> BattleMetrics server id (051). Owner only.';
COMMENT ON TABLE aurora.battlemetrics_status IS
  'Newest BattleMetrics answer per server and the newest failure (051). Public only through battlemetrics_summary().';
COMMENT ON TABLE aurora.battlemetrics_rank_history IS
  'BattleMetrics rank data points, kept 30 days (051). Public only through battlemetrics_summary().';
COMMENT ON TABLE aurora.battlemetrics_requests IS
  'pg_net requests sent by battlemetrics_request() and not yet collected (051).';

-- ============================================================================
-- 2. STORE (pure: JSON in, rows out; what the tests call)
-- ============================================================================

-- Body of GET /servers/{id}: {"data": {"id": ..., "attributes": {name, rank,
-- players, maxPlayers, status, updatedAt, ...}}}. A missing or odd field is
-- stored as NULL rather than failing the whole answer.
CREATE OR REPLACE FUNCTION aurora.battlemetrics_store_server(p_server TEXT, p_body JSONB)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  a JSONB := p_body -> 'data' -> 'attributes';
  v_bm TEXT;
BEGIN
  IF a IS NULL OR jsonb_typeof(a) <> 'object' THEN
    RAISE EXCEPTION 'battlemetrics server answer has no data.attributes';
  END IF;
  SELECT l.bm_server_id INTO v_bm FROM aurora.battlemetrics_links l WHERE l.server_id = p_server;
  v_bm := coalesce(v_bm, p_body -> 'data' ->> 'id', '');

  INSERT INTO aurora.battlemetrics_status AS s
    (server_id, bm_server_id, name, rank, players, max_players, status, bm_updated_at, fetched_at)
  VALUES (
    p_server,
    v_bm,
    left(a ->> 'name', 200),
    CASE WHEN jsonb_typeof(a -> 'rank') = 'number' AND (a ->> 'rank')::NUMERIC > 0
         THEN (a ->> 'rank')::NUMERIC::INT END,
    CASE WHEN jsonb_typeof(a -> 'players') = 'number' THEN (a ->> 'players')::NUMERIC::INT END,
    CASE WHEN jsonb_typeof(a -> 'maxPlayers') = 'number' THEN (a ->> 'maxPlayers')::NUMERIC::INT END,
    left(a ->> 'status', 40),
    CASE WHEN (a ->> 'updatedAt') ~ '^\d{4}-\d{2}-\d{2}T' THEN (a ->> 'updatedAt')::TIMESTAMPTZ END,
    now()
  )
  ON CONFLICT (server_id) DO UPDATE SET
    bm_server_id  = EXCLUDED.bm_server_id,
    name          = EXCLUDED.name,
    rank          = EXCLUDED.rank,
    players       = EXCLUDED.players,
    max_players   = EXCLUDED.max_players,
    status        = EXCLUDED.status,
    bm_updated_at = EXCLUDED.bm_updated_at,
    fetched_at    = EXCLUDED.fetched_at;
END;
$$;

-- Body of GET /servers/{id}/rank-history: {"data": [{"type": "dataPoint",
-- "attributes": {"timestamp": "...Z", "value": 1903}}, ...]}. Points without a
-- positive value are skipped. Returns the number of points stored. Points older
-- than 30 days are pruned.
CREATE OR REPLACE FUNCTION aurora.battlemetrics_store_rank_history(p_server TEXT, p_body JSONB)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INT;
BEGIN
  IF jsonb_typeof(p_body -> 'data') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'battlemetrics rank-history answer has no data array';
  END IF;

  WITH pts AS (
    SELECT (p -> 'attributes' ->> 'timestamp')::TIMESTAMPTZ AS t,
           (p -> 'attributes' ->> 'value')::NUMERIC::INT     AS rank
      FROM jsonb_array_elements(p_body -> 'data') AS p
     WHERE (p -> 'attributes' ->> 'timestamp') ~ '^\d{4}-\d{2}-\d{2}T'
       AND jsonb_typeof(p -> 'attributes' -> 'value') = 'number'
       AND (p -> 'attributes' ->> 'value')::NUMERIC >= 1
  ), ins AS (
    INSERT INTO aurora.battlemetrics_rank_history AS h (server_id, t, rank)
    SELECT DISTINCT ON (t) p_server, t, rank FROM pts ORDER BY t
    ON CONFLICT (server_id, t) DO UPDATE SET rank = EXCLUDED.rank
    RETURNING 1
  )
  SELECT count(*) INTO v_count FROM ins;

  DELETE FROM aurora.battlemetrics_rank_history h
   WHERE h.server_id = p_server AND h.t < now() - INTERVAL '30 days';

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION aurora.battlemetrics_store_server(TEXT, JSONB)       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.battlemetrics_store_rank_history(TEXT, JSONB) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 3. REQUEST AND COLLECT (pg_net)
-- ============================================================================

-- The token, or NULL when the Vault secret is missing or too short.
CREATE OR REPLACE FUNCTION aurora.battlemetrics_token()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v TEXT;
BEGIN
  SELECT s.decrypted_secret INTO v FROM vault.decrypted_secrets s WHERE s.name = 'battlemetrics_api_token';
  v := btrim(coalesce(v, ''));
  RETURN CASE WHEN length(v) >= 20 THEN v END;
END;
$$;

REVOKE ALL ON FUNCTION aurora.battlemetrics_token() FROM PUBLIC, anon, authenticated;

-- Sends both requests for every linked server; returns how many were sent.
CREATE OR REPLACE FUNCTION aurora.battlemetrics_request()
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_token   TEXT := aurora.battlemetrics_token();
  v_headers JSONB;
  v_link    RECORD;
  v_id      BIGINT;
  v_sent    INT := 0;
  v_base    TEXT;
BEGIN
  -- Requests nobody collected (pg_net keeps answers 6 hours) are dropped.
  DELETE FROM aurora.battlemetrics_requests r WHERE r.requested_at < now() - INTERVAL '6 hours';

  IF v_token IS NULL THEN
    RAISE NOTICE 'battlemetrics: Vault secret battlemetrics_api_token is missing; nothing requested (see 051 header)';
    RETURN 0;
  END IF;
  v_headers := jsonb_build_object('Authorization', 'Bearer ' || v_token, 'Accept', 'application/json');

  FOR v_link IN SELECT l.server_id, l.bm_server_id FROM aurora.battlemetrics_links l LOOP
    v_base := 'https://api.battlemetrics.com/servers/' || v_link.bm_server_id;

    SELECT net.http_get(url := v_base, headers := v_headers, timeout_milliseconds := 20000) INTO v_id;
    INSERT INTO aurora.battlemetrics_requests (request_id, server_id, kind) VALUES (v_id, v_link.server_id, 'server');

    SELECT net.http_get(
      url     := v_base || '/rank-history',
      params  := jsonb_build_object(
                   'start', to_char((now() - INTERVAL '7 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                   'stop',  to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
      headers := v_headers,
      timeout_milliseconds := 20000
    ) INTO v_id;
    INSERT INTO aurora.battlemetrics_requests (request_id, server_id, kind) VALUES (v_id, v_link.server_id, 'rank_history');

    v_sent := v_sent + 2;
  END LOOP;
  RETURN v_sent;
END;
$$;

REVOKE ALL ON FUNCTION aurora.battlemetrics_request() FROM PUBLIC, anon, authenticated;

-- Records a failure on the server's status row (creating it if needed).
CREATE OR REPLACE FUNCTION aurora.battlemetrics_note_error(p_server TEXT, p_error TEXT)
RETURNS VOID
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO aurora.battlemetrics_status AS s (server_id, bm_server_id, last_error, last_error_at)
  VALUES (p_server,
          coalesce((SELECT l.bm_server_id FROM aurora.battlemetrics_links l WHERE l.server_id = p_server), ''),
          left(p_error, 500), now())
  ON CONFLICT (server_id) DO UPDATE SET last_error = EXCLUDED.last_error, last_error_at = EXCLUDED.last_error_at;
$$;

REVOKE ALL ON FUNCTION aurora.battlemetrics_note_error(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Stores every answer that has arrived; returns how many were handled. A
-- successful server answer clears last_error.
CREATE OR REPLACE FUNCTION aurora.battlemetrics_collect()
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req  RECORD;
  v_done INT := 0;
  v_body JSONB;
BEGIN
  FOR v_req IN
    SELECT r.request_id, r.server_id, r.kind, x.status_code, x.content, x.timed_out, x.error_msg
      FROM aurora.battlemetrics_requests r
      JOIN net._http_response x ON x.id = r.request_id
     ORDER BY r.request_id
  LOOP
    BEGIN
      IF v_req.timed_out OR v_req.error_msg IS NOT NULL THEN
        PERFORM aurora.battlemetrics_note_error(v_req.server_id,
          v_req.kind || ': ' || coalesce(v_req.error_msg, 'timed out'));
      ELSIF v_req.status_code <> 200 THEN
        PERFORM aurora.battlemetrics_note_error(v_req.server_id,
          v_req.kind || ': HTTP ' || v_req.status_code || ' ' || left(coalesce(v_req.content, ''), 300));
      ELSE
        v_body := v_req.content::JSONB;
        IF v_req.kind = 'server' THEN
          PERFORM aurora.battlemetrics_store_server(v_req.server_id, v_body);
          UPDATE aurora.battlemetrics_status s SET last_error = NULL, last_error_at = NULL
           WHERE s.server_id = v_req.server_id;
        ELSE
          PERFORM aurora.battlemetrics_store_rank_history(v_req.server_id, v_body);
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      PERFORM aurora.battlemetrics_note_error(v_req.server_id, v_req.kind || ': ' || SQLERRM);
    END;
    DELETE FROM aurora.battlemetrics_requests r WHERE r.request_id = v_req.request_id;
    v_done := v_done + 1;
  END LOOP;
  RETURN v_done;
END;
$$;

REVOKE ALL ON FUNCTION aurora.battlemetrics_collect() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 4. PUBLIC READ
-- ============================================================================
-- {rank, players, max_players, status, fetched_at, rank_7d_ago, best_rank_7d,
--  history: [{t, rank}] (last 7 days, oldest first, at most one point per hour)}.
-- Every key is always present; all null and an empty history before the first
-- answer. A status older than 3 hours reads as no rank (stale), so the site never
-- shows a frozen number as live.
CREATE OR REPLACE FUNCTION aurora.battlemetrics_summary(p_server TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH s AS (
    SELECT * FROM aurora.battlemetrics_status WHERE server_id = p_server
  ), h AS (
    SELECT DISTINCT ON (date_trunc('hour', t)) t, rank
      FROM aurora.battlemetrics_rank_history
     WHERE server_id = p_server AND t >= now() - INTERVAL '7 days'
     ORDER BY date_trunc('hour', t), t DESC
  )
  SELECT jsonb_build_object(
    'rank',         (SELECT CASE WHEN s.fetched_at > now() - INTERVAL '3 hours' THEN s.rank END FROM s),
    'players',      (SELECT s.players FROM s),
    'max_players',  (SELECT s.max_players FROM s),
    'status',       (SELECT s.status FROM s),
    'fetched_at',   (SELECT s.fetched_at FROM s),
    'rank_7d_ago',  (SELECT h.rank FROM h ORDER BY h.t LIMIT 1),
    'best_rank_7d', (SELECT min(h.rank) FROM h),
    'history',      coalesce((SELECT jsonb_agg(jsonb_build_object('t', h.t, 'rank', h.rank) ORDER BY h.t) FROM h), '[]'::JSONB)
  );
$$;

COMMENT ON FUNCTION aurora.battlemetrics_summary(TEXT) IS
  'The home page''s BattleMetrics rank (051): newest rank (null when older than 3 hours), players, status, and the last 7 days of rank, one point per hour.';

REVOKE ALL ON FUNCTION aurora.battlemetrics_summary(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.battlemetrics_summary(TEXT) TO anon, authenticated, service_role;

-- ============================================================================
-- 5. SCHEDULE
-- ============================================================================

CREATE OR REPLACE FUNCTION aurora.disable_battlemetrics_cron()
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job BIGINT;
BEGIN
  FOR v_job IN SELECT jobid FROM cron.job WHERE jobname IN ('battlemetrics-request', 'battlemetrics-collect') LOOP
    PERFORM cron.unschedule(v_job);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION aurora.enable_battlemetrics_cron()
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM aurora.disable_battlemetrics_cron();
  PERFORM cron.schedule('battlemetrics-request', '5 * * * *',   'SELECT aurora.battlemetrics_request();');
  PERFORM cron.schedule('battlemetrics-collect', '*/5 * * * *', 'SELECT aurora.battlemetrics_collect();');
END;
$$;

REVOKE ALL ON FUNCTION aurora.enable_battlemetrics_cron()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION aurora.disable_battlemetrics_cron() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regprocedure('cron.schedule(text,text,text)') IS NOT NULL THEN
    PERFORM aurora.enable_battlemetrics_cron();
    RAISE NOTICE 'battlemetrics-request (hourly at :05) and battlemetrics-collect (every 5 minutes) scheduled';
  ELSE
    RAISE NOTICE 'pg_cron is not installed: the BattleMetrics jobs are NOT scheduled';
  END IF;
END
$$;
