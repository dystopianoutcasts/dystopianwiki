-- Tests for migration 051: BattleMetrics rank.
--
-- Run the whole file as `postgres` (SQL editor, or supabase db query) after 051. It
-- seeds fixtures under server ids 'bm-t' and 'bm-none', asserts, and ROLLS BACK.
-- It prints "PASS ..." notices ending in "ALL BATTLEMETRICS TESTS PASSED", or stops
-- at the first failure. Nothing is sent to BattleMetrics: pg_net requests queued
-- inside the transaction are rolled back with it, and the collect test uses
-- fabricated net._http_response rows with negative ids.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

INSERT INTO aurora.battlemetrics_links (server_id, bm_server_id) VALUES ('bm-t', '111');

DO $$
DECLARE
  j JSONB;
  n INT;
  ok BOOLEAN;
BEGIN
  -- 1. store_server: a full answer
  PERFORM aurora.battlemetrics_store_server('bm-t', '{"data": {"type": "server", "id": "111", "attributes":
    {"name": "Dystopian Outcasts Season 1", "rank": 1903, "players": 3, "maxPlayers": 16,
     "status": "online", "updatedAt": "2026-11-18T07:00:00.000Z"}}}'::JSONB);
  SELECT to_jsonb(s) INTO j FROM aurora.battlemetrics_status s WHERE server_id = 'bm-t';
  ASSERT (j->>'rank')::INT = 1903 AND (j->>'players')::INT = 3 AND (j->>'max_players')::INT = 16
     AND j->>'status' = 'online' AND j->>'bm_server_id' = '111' AND j->>'fetched_at' IS NOT NULL,
     'store_server full answer: ' || j::TEXT;
  RAISE NOTICE 'PASS store_server stores rank, players, max, status';

  -- 2. store_server: odd fields become NULL, the row is still updated
  PERFORM aurora.battlemetrics_store_server('bm-t', '{"data": {"attributes":
    {"rank": null, "players": "x", "maxPlayers": 16, "updatedAt": "yesterday"}}}'::JSONB);
  SELECT to_jsonb(s) INTO j FROM aurora.battlemetrics_status s WHERE server_id = 'bm-t';
  ASSERT j->>'rank' IS NULL AND j->>'players' IS NULL AND (j->>'max_players')::INT = 16
     AND j->>'bm_updated_at' IS NULL, 'store_server odd fields: ' || j::TEXT;
  RAISE NOTICE 'PASS store_server stores odd fields as NULL';

  -- 3. store_server: an answer without data.attributes raises
  ok := FALSE;
  BEGIN
    PERFORM aurora.battlemetrics_store_server('bm-t', '{"errors": [{"status": "403"}]}'::JSONB);
  EXCEPTION WHEN OTHERS THEN ok := TRUE;
  END;
  ASSERT ok, 'store_server must raise on an error body';
  RAISE NOTICE 'PASS store_server raises on an error body';

  -- 4. store_rank_history: null and zero values skipped, a repeated time stored once,
  --    a point older than 30 days pruned
  INSERT INTO aurora.battlemetrics_rank_history (server_id, t, rank) VALUES ('bm-t', now() - INTERVAL '40 days', 5000);
  SELECT aurora.battlemetrics_store_rank_history('bm-t', jsonb_build_object('data', jsonb_build_array(
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '6 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:00:00"Z"'), 'value', 2100)),
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '3 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:00:00"Z"'), 'value', 1800)),
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '3 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:00:00"Z"'), 'value', 1800)),
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '2 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:00:00"Z"'), 'value', NULL)),
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '2 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:05:00"Z"'), 'value', 0)),
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '1 hour') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:00:00"Z"'), 'value', 1903)),
    jsonb_build_object('type', 'dataPoint', 'attributes', jsonb_build_object('timestamp', to_char((now() - INTERVAL '1 hour') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:30:00"Z"'), 'value', 1901))
  ))) INTO n;
  ASSERT n = 4, 'store_rank_history stored ' || n || ' points, expected 4';
  ASSERT NOT EXISTS (SELECT 1 FROM aurora.battlemetrics_rank_history WHERE server_id = 'bm-t' AND rank = 5000),
    'store_rank_history must prune points older than 30 days';
  RAISE NOTICE 'PASS store_rank_history skips empty values, dedupes, prunes';

  ok := FALSE;
  BEGIN
    PERFORM aurora.battlemetrics_store_rank_history('bm-t', '{"errors": []}'::JSONB);
  EXCEPTION WHEN OTHERS THEN ok := TRUE;
  END;
  ASSERT ok, 'store_rank_history must raise without a data array';
  RAISE NOTICE 'PASS store_rank_history raises on an error body';

  -- 5. summary: fresh rank, one point per hour (the newer of the two in the last hour),
  --    oldest first, rank_7d_ago and best_rank_7d
  PERFORM aurora.battlemetrics_store_server('bm-t', '{"data": {"attributes": {"rank": 1901, "players": 0, "maxPlayers": 16, "status": "online"}}}'::JSONB);
  j := aurora.battlemetrics_summary('bm-t');
  ASSERT (j->>'rank')::INT = 1901 AND (j->>'players')::INT = 0 AND (j->>'max_players')::INT = 16, 'summary head: ' || j::TEXT;
  ASSERT jsonb_array_length(j->'history') = 3, 'summary history length: ' || (j->'history')::TEXT;
  ASSERT (j->'history'->0->>'rank')::INT = 2100 AND (j->'history'->2->>'rank')::INT = 1901, 'summary history order: ' || (j->'history')::TEXT;
  ASSERT (j->>'rank_7d_ago')::INT = 2100 AND (j->>'best_rank_7d')::INT = 1800, 'summary 7d figures: ' || j::TEXT;
  RAISE NOTICE 'PASS summary rank, hourly history, 7-day figures';

  -- 6. summary: a status older than 3 hours gives no rank
  UPDATE aurora.battlemetrics_status SET fetched_at = now() - INTERVAL '4 hours' WHERE server_id = 'bm-t';
  j := aurora.battlemetrics_summary('bm-t');
  ASSERT j ? 'rank' AND j->>'rank' IS NULL, 'stale summary must have rank null: ' || j::TEXT;
  RAISE NOTICE 'PASS summary hides a stale rank';

  -- 7. summary: unknown server, every key present
  j := aurora.battlemetrics_summary('bm-none');
  ASSERT j ?& ARRAY['rank', 'players', 'max_players', 'status', 'fetched_at', 'rank_7d_ago', 'best_rank_7d', 'history']
     AND j->>'rank' IS NULL AND j->'history' = '[]'::JSONB, 'empty summary: ' || j::TEXT;
  RAISE NOTICE 'PASS summary for an unknown server';

  -- 8. collect: a 200 server answer clears the error, a 403 records it, a timeout
  --    records it, bad JSON records it; every collected request is removed; a request
  --    with no answer yet stays
  PERFORM aurora.battlemetrics_note_error('bm-t', 'old error');
  INSERT INTO net._http_response (id, status_code, content_type, headers, content, timed_out, error_msg, created) VALUES
    (-901, 403, 'application/json', '{}', '{"errors":[{"detail":"A subscription is required"}]}', FALSE, NULL, now());
  INSERT INTO aurora.battlemetrics_requests (request_id, server_id, kind) VALUES (-901, 'bm-t', 'server'), (-904, 'bm-t', 'server');
  n := aurora.battlemetrics_collect();
  SELECT to_jsonb(s) INTO j FROM aurora.battlemetrics_status s WHERE server_id = 'bm-t';
  ASSERT n = 1 AND j->>'last_error' LIKE 'server: HTTP 403%subscription%', 'collect 403: ' || n || ' ' || j::TEXT;
  ASSERT EXISTS (SELECT 1 FROM aurora.battlemetrics_requests WHERE request_id = -904)
     AND NOT EXISTS (SELECT 1 FROM aurora.battlemetrics_requests WHERE request_id = -901), 'collect request bookkeeping';
  RAISE NOTICE 'PASS collect records an HTTP error and keeps unanswered requests';

  INSERT INTO net._http_response (id, status_code, content_type, headers, content, timed_out, error_msg, created) VALUES
    (-902, NULL, NULL, NULL, NULL, TRUE, NULL, now()),
    (-903, 200, 'application/json', '{}', 'not json', FALSE, NULL, now());
  INSERT INTO aurora.battlemetrics_requests (request_id, server_id, kind) VALUES (-902, 'bm-t', 'rank_history'), (-903, 'bm-t', 'rank_history');
  n := aurora.battlemetrics_collect();
  SELECT to_jsonb(s) INTO j FROM aurora.battlemetrics_status s WHERE server_id = 'bm-t';
  ASSERT n = 2 AND j->>'last_error' LIKE 'rank_history:%', 'collect timeout and bad JSON: ' || n || ' ' || j::TEXT;
  RAISE NOTICE 'PASS collect records a timeout and bad JSON';

  INSERT INTO net._http_response (id, status_code, content_type, headers, content, timed_out, error_msg, created) VALUES
    (-904, 200, 'application/json', '{}', '{"data": {"attributes": {"rank": 1777, "players": 2, "maxPlayers": 16, "status": "online"}}}', FALSE, NULL, now());
  n := aurora.battlemetrics_collect();
  SELECT to_jsonb(s) INTO j FROM aurora.battlemetrics_status s WHERE server_id = 'bm-t';
  ASSERT n = 1 AND (j->>'rank')::INT = 1777 AND j->>'last_error' IS NULL, 'collect 200: ' || j::TEXT;
  RAISE NOTICE 'PASS collect stores a good answer and clears the error';

  -- 9. who may call what
  ASSERT has_function_privilege('anon', 'aurora.battlemetrics_summary(text)', 'EXECUTE'), 'anon must read the summary';
  ASSERT NOT has_function_privilege('anon', 'aurora.battlemetrics_request()', 'EXECUTE')
     AND NOT has_function_privilege('anon', 'aurora.battlemetrics_collect()', 'EXECUTE')
     AND NOT has_function_privilege('anon', 'aurora.battlemetrics_token()', 'EXECUTE')
     AND NOT has_function_privilege('authenticated', 'aurora.battlemetrics_store_server(text,jsonb)', 'EXECUTE')
     AND NOT has_function_privilege('authenticated', 'aurora.enable_battlemetrics_cron()', 'EXECUTE'),
     'only the summary is public';
  ASSERT NOT has_table_privilege('anon', 'aurora.battlemetrics_status', 'SELECT')
     AND NOT has_table_privilege('authenticated', 'aurora.battlemetrics_rank_history', 'SELECT'),
     'the tables are not readable by clients';
  RAISE NOTICE 'PASS only the summary is public';

  RAISE NOTICE 'ALL BATTLEMETRICS TESTS PASSED';
END
$$;

ROLLBACK;
