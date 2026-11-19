-- Tests for migration 052: Outcast Metrics.
--
-- Run the whole file as `postgres` (SQL editor, or supabase db query) after 052. It seeds
-- fixtures under server id 'mt-t' (and 'mt-none', which has no rows), asserts, and ROLLS
-- BACK. It prints "PASS ..." notices ending in "ALL METRICS TESTS PASSED", or stops at the
-- first failure. Every fixture is in March 2026 (in the past, so the rollup reaches it), and
-- one row is recent for the 7-day range.
--
-- Fixture, in short (season = world w1, started 2026-03-01 00:00 UTC; day 2026-03-05 is a Thursday):
--   10:00  ann 10:01:05, 10:01:35 (two rows, one minute), 10:02:10; bob 10:01:20, 10:02:30, 10:03:00
--          -> ann 2 minutes, bob 3, 5 player minutes, 2 distinct, peak 2 (no health rows)
--   11:00  ann 11:00:10 and health samples 2 and 4 -> avg 3, peak 4
--   03-04 19:50 - 20:40 cat, 20:10 - 20:20 dan, no position rows (play_sessions fallback)
--   03-07 08:00: eve has 3 position minutes (08:05-08:07) and a 08:00-09:00 session -> 60 (union, overlap once);
--          fay has a position row at 08:10 and a 08:10-08:20 session -> 10; hour = 70 minutes, 2 players, source both
--   first seen: ann 03-05 10:05 (but 03-02 08:00 in an old world), bob 03-05 10:30, dan (old world only) 03-05 10:40, cat 03-06 09:00
--   deaths: bob 03-05 10:15 (30.5 h), ann 03-03 15:00 (40 h) and 03-05 12:00 (55 h)
--   kills: ann 2 and bob 1 at 03-05 10:xx; u01..u12 with 1..12 kills at 03-06 12:xx

BEGIN;

SET LOCAL client_min_messages = NOTICE;

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('mt-t',    'Metrics Test',  TIMESTAMPTZ '2026-03-01 00:00:00+00', now()),
  ('mt-none', 'Metrics Empty', TIMESTAMPTZ '2026-03-01 00:00:00+00', now());

INSERT INTO aurora.worlds (server_id, world_id, seq, status, detected_by, started_at) VALUES
  ('mt-t', 'w1', 1, 'current', 'exporter', TIMESTAMPTZ '2026-03-01 00:00:00+00');
UPDATE aurora.servers SET current_world_id = 'w1' WHERE id = 'mt-t';

INSERT INTO aurora.players (server_id, username, display_name, first_seen, hours_survived, is_dead, world_id) VALUES
  ('mt-t', 'ann', 'Ann', TIMESTAMPTZ '2026-03-05 10:05:00+00', 100, FALSE, 'w1'),
  ('mt-t', 'bob', NULL,  TIMESTAMPTZ '2026-03-05 10:30:00+00', 20,  FALSE, 'w1'),
  ('mt-t', 'cat', 'Cat', TIMESTAMPTZ '2026-03-06 09:00:00+00', 5,   FALSE, 'w1');

INSERT INTO aurora.player_history (server_id, world_id, username, first_seen) VALUES
  ('mt-t', 'w0', 'ann', TIMESTAMPTZ '2026-03-02 08:00:00+00'),
  ('mt-t', 'w0', 'dan', TIMESTAMPTZ '2026-03-05 10:40:00+00');

INSERT INTO aurora.player_position_history (server_id, username, x, y, z, t) VALUES
  ('mt-t', 'ann', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:01:05+00'),
  ('mt-t', 'ann', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:01:35+00'),
  ('mt-t', 'ann', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:02:10+00'),
  ('mt-t', 'bob', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:01:20+00'),
  ('mt-t', 'bob', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:02:30+00'),
  ('mt-t', 'bob', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:03:00+00'),
  ('mt-t', 'ann', 1, 1, 0, TIMESTAMPTZ '2026-03-05 11:00:10+00'),
  ('mt-t', 'eve', 1, 1, 0, TIMESTAMPTZ '2026-03-07 08:05:10+00'),
  ('mt-t', 'eve', 1, 1, 0, TIMESTAMPTZ '2026-03-07 08:05:40+00'),
  ('mt-t', 'eve', 1, 1, 0, TIMESTAMPTZ '2026-03-07 08:06:10+00'),
  ('mt-t', 'eve', 1, 1, 0, TIMESTAMPTZ '2026-03-07 08:07:10+00'),
  ('mt-t', 'fay', 1, 1, 0, TIMESTAMPTZ '2026-03-07 08:10:30+00'),
  -- recent, for the 7-day range
  ('mt-t', 'ann', 1, 1, 0, date_trunc('hour', now(), 'UTC') - INTERVAL '2 hours' + INTERVAL '5 minutes');

INSERT INTO aurora.health_samples (server_id, t, players) VALUES
  ('mt-t', TIMESTAMPTZ '2026-03-05 11:10:00+00', 2),
  ('mt-t', TIMESTAMPTZ '2026-03-05 11:20:00+00', 4);

INSERT INTO aurora.play_sessions (server_id, username, started_at, ended_at, source) VALUES
  ('mt-t', 'cat', TIMESTAMPTZ '2026-03-04 19:50:00+00', TIMESTAMPTZ '2026-03-04 20:40:00+00', 'server_log'),
  ('mt-t', 'dan', TIMESTAMPTZ '2026-03-04 20:10:00+00', TIMESTAMPTZ '2026-03-04 20:20:00+00', 'server_log'),
  ('mt-t', 'eve', TIMESTAMPTZ '2026-03-07 08:00:00+00', TIMESTAMPTZ '2026-03-07 09:00:00+00', 'server_log'),
  ('mt-t', 'fay', TIMESTAMPTZ '2026-03-07 08:10:00+00', TIMESTAMPTZ '2026-03-07 08:20:00+00', 'server_log'),
  ('mt-t', 'gus', TIMESTAMPTZ '2026-03-09 10:00:30+00', TIMESTAMPTZ '2026-03-09 10:05:10+00', 'server_log'),
  ('mt-t', 'hal', TIMESTAMPTZ '2026-03-09 11:00:10+00', TIMESTAMPTZ '2026-03-09 11:00:30+00', 'server_log'),
  ('mt-t', 'ivy', TIMESTAMPTZ '2026-03-09 11:10:10+00', TIMESTAMPTZ '2026-03-09 11:10:50+00', 'server_log');

INSERT INTO aurora.deaths (server_id, username, x, y, z, t, hours_survived) VALUES
  ('mt-t', 'bob', 1, 1, 0, TIMESTAMPTZ '2026-03-05 10:15:00+00', 30.5),
  ('mt-t', 'ann', 1, 1, 0, TIMESTAMPTZ '2026-03-03 15:00:00+00', 40),
  ('mt-t', 'ann', 1, 1, 0, TIMESTAMPTZ '2026-03-05 12:00:00+00', 55);

INSERT INTO aurora.kill_events (server_id, world_id, username, x, y, z, t)
SELECT 'mt-t', 'w1', 'ann', g, 0, 0, TIMESTAMPTZ '2026-03-05 10:20:00+00' + g * INTERVAL '1 second' FROM generate_series(1, 2) g
UNION ALL
SELECT 'mt-t', 'w1', 'bob', 1, 0, 0, TIMESTAMPTZ '2026-03-05 10:40:00+00'
UNION ALL
SELECT 'mt-t', 'w1', 'u' || lpad(i::TEXT, 2, '0'), k, 0, 0, TIMESTAMPTZ '2026-03-06 12:00:00+00' + k * INTERVAL '1 second'
  FROM generate_series(1, 12) i, LATERAL generate_series(1, i) k;

-- Minutes written straight into the player table (an hour the rollup test never touches):
-- twelve players for the top-10 and the time race.
INSERT INTO aurora.metrics_player_hourly (server_id, hour, username, minutes)
SELECT 'mt-t', TIMESTAMPTZ '2026-03-10 00:00:00+00', 'p' || lpad(i::TEXT, 2, '0'), 48 + i FROM generate_series(1, 12) i;

CREATE TEMP TABLE mt_results (n SERIAL, result TEXT) ON COMMIT DROP;

DO $$
DECLARE
  n INT;
  j JSONB;
  h RECORD;
  d JSONB;
  v_digest_one TEXT;
  v_digest_two TEXT;
BEGIN
  -- 1. rollup: two rows in one minute count once; minutes and distinct players
  n := aurora.metrics_rollup(TIMESTAMPTZ '2026-03-01 00:00:00+00', TIMESTAMPTZ '2026-03-12 00:00:00+00');
  ASSERT n > 0, 'rollup wrote no hours';
  SELECT * INTO h FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00';
  ASSERT h.player_minutes = 5 AND h.unique_players = 2 AND h.minutes_source = 'positions',
    'hour 10 minutes: ' || to_jsonb(h)::TEXT;
  ASSERT (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'ann'
            AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00') = 2
     AND (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'bob'
            AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00') = 3,
    'per-player minutes (two rows in one minute count once)';
  RAISE NOTICE 'PASS minutes: distinct (player, minute), a double row counts once'; INSERT INTO mt_results (result) VALUES ('PASS minutes: distinct (player, minute), a double row counts once');

  -- 2. no health sample: average is minutes / 60 and peak is the most players in one minute
  ASSERT h.players_source = 'positions' AND h.peak_players = 2 AND abs(h.avg_players - 5 / 60.0) < 0.001,
    'fallback average and peak: ' || to_jsonb(h)::TEXT;
  RAISE NOTICE 'PASS no health samples: average = minutes / 60, peak = most players in one minute'; INSERT INTO mt_results (result) VALUES ('PASS no health samples: average = minutes / 60, peak = most players in one minute');

  -- 3. health samples win
  SELECT * INTO h FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 11:00:00+00';
  ASSERT h.players_source = 'health' AND h.avg_players = 3 AND h.peak_players = 4 AND h.player_minutes = 1,
    'health hour: ' || to_jsonb(h)::TEXT;
  RAISE NOTICE 'PASS health samples give the average and peak'; INSERT INTO mt_results (result) VALUES ('PASS health samples give the average and peak');

  -- 4. the play_sessions fallback: an hour with no position rows is counted from the session
  --    log; an hour that has position rows ignores the session that overlaps it
  SELECT * INTO h FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-04 19:00:00+00';
  ASSERT h.player_minutes = 10 AND h.unique_players = 1 AND h.minutes_source = 'server_log', 'session hour 19: ' || to_jsonb(h)::TEXT;
  SELECT * INTO h FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-04 20:00:00+00';
  ASSERT h.player_minutes = 50 AND h.unique_players = 2 AND h.peak_players = 2 AND h.minutes_source = 'server_log',
    'session hour 20: ' || to_jsonb(h)::TEXT;
  ASSERT (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'cat'
            AND hour = TIMESTAMPTZ '2026-03-04 20:00:00+00') = 40,
    'cat 40 minutes in hour 20';
  -- the union: 3 position minutes plus a 60-minute session count 60; a position minute inside a session counts once
  SELECT * INTO h FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-07 08:00:00+00';
  ASSERT h.player_minutes = 70 AND h.unique_players = 2 AND h.minutes_source = 'both' AND h.players_source = 'both',
    'union hour: ' || to_jsonb(h)::TEXT;
  ASSERT (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'eve'
            AND hour = TIMESTAMPTZ '2026-03-07 08:00:00+00') = 60
     AND (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'fay'
            AND hour = TIMESTAMPTZ '2026-03-07 08:00:00+00') = 10,
    'eve 60 (3 stray position minutes do not block the session), fay 10 (overlap counts once)';
  RAISE NOTICE 'PASS minutes are the union of positions and sessions: sparse positions do not block a session, overlap counts once'; INSERT INTO mt_results (result) VALUES ('PASS minutes are the union of positions and sessions: sparse positions do not block a session, overlap counts once');

  -- 4c. a session covers a minute only with at least 30 s of it: 10:00:30-10:05:10 is 5 minutes,
  --     a 20 s session counts 0, a 40 s session counts 1
  ASSERT (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'gus' AND hour = TIMESTAMPTZ '2026-03-09 10:00:00+00') = 5
     AND NOT EXISTS (SELECT 1 FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'hal')
     AND (SELECT minutes FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND username = 'ivy') = 1,
    'half-minute rule: gus 5, hal 0, ivy 1';
  RAISE NOTICE 'PASS a session covers a minute only with 30 seconds of it'; INSERT INTO mt_results (result) VALUES ('PASS a session covers a minute only with 30 seconds of it');

  -- 5. new players across both worlds, deaths, kills
  ASSERT (SELECT new_players FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00') = 2,
    'new players in hour 10 (bob and dan; ann was first seen in the old world on 03-02)';
  ASSERT (SELECT new_players FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-02 08:00:00+00') = 1,
    'ann is new on 03-02 08:00 (player_history)';
  ASSERT (SELECT deaths FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00') = 1
     AND (SELECT kills FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00') = 3
     AND (SELECT kills FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-06 12:00:00+00') = 78,
    'deaths and kills per hour';
  RAISE NOTICE 'PASS new players (both worlds), deaths and kills per hour'; INSERT INTO mt_results (result) VALUES ('PASS new players (both worlds), deaths and kills per hour');

  -- 6. idempotent: a second run changes nothing
  SELECT md5(string_agg(to_jsonb(x)::TEXT, '|' ORDER BY x.hour)) INTO v_digest_one FROM aurora.metrics_hourly x WHERE x.server_id = 'mt-t';
  v_digest_one := v_digest_one || (SELECT md5(string_agg(to_jsonb(x)::TEXT, '|' ORDER BY x.hour, x.username)) FROM aurora.metrics_player_hourly x WHERE x.server_id = 'mt-t');
  PERFORM aurora.metrics_rollup(TIMESTAMPTZ '2026-03-01 00:00:00+00', TIMESTAMPTZ '2026-03-12 00:00:00+00');
  PERFORM aurora.metrics_rollup(TIMESTAMPTZ '2026-03-04 00:00:00+00', TIMESTAMPTZ '2026-03-06 00:00:00+00');
  SELECT md5(string_agg(to_jsonb(x)::TEXT, '|' ORDER BY x.hour)) INTO v_digest_two FROM aurora.metrics_hourly x WHERE x.server_id = 'mt-t';
  v_digest_two := v_digest_two || (SELECT md5(string_agg(to_jsonb(x)::TEXT, '|' ORDER BY x.hour, x.username)) FROM aurora.metrics_player_hourly x WHERE x.server_id = 'mt-t');
  ASSERT v_digest_one = v_digest_two, 'the rollup is not idempotent';
  RAISE NOTICE 'PASS running the rollup twice gives the same rows'; INSERT INTO mt_results (result) VALUES ('PASS running the rollup twice gives the same rows');

  -- 7. raw rows pruned and no session for the hour: the hour keeps what it had
  DELETE FROM aurora.player_position_history WHERE server_id = 'mt-t' AND t < TIMESTAMPTZ '2026-03-05 10:30:00+00' AND t >= TIMESTAMPTZ '2026-03-05 10:00:00+00';
  PERFORM aurora.metrics_rollup(TIMESTAMPTZ '2026-03-05 10:00:00+00', TIMESTAMPTZ '2026-03-05 10:00:00+00');
  SELECT * INTO h FROM aurora.metrics_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00';
  ASSERT h.player_minutes = 5 AND h.minutes_source = 'positions' AND h.kills = 3 AND h.deaths = 1,
    'pruned raw rows must not overwrite a measured hour: ' || to_jsonb(h)::TEXT;
  ASSERT (SELECT sum(minutes) FROM aurora.metrics_player_hourly WHERE server_id = 'mt-t' AND hour = TIMESTAMPTZ '2026-03-05 10:00:00+00') = 5,
    'per-player minutes kept after the raw rows were pruned';
  RAISE NOTICE 'PASS a re-run after the raw rows were pruned keeps the measured hour'; INSERT INTO mt_results (result) VALUES ('PASS a re-run after the raw rows were pruned keeps the measured hour');

  -- 8. summary: every key, the daily rows, the totals
  j := aurora.metrics_summary('mt-t', 'season');
  ASSERT j ?& ARRAY['range', 'since', 'season_start', 'tracking_since', 'players_since', 'hourly', 'daily', 'heatmap', 'top_time', 'totals'],
    'summary keys: ' || (SELECT string_agg(k, ',') FROM jsonb_object_keys(j) k);
  ASSERT j->>'range' = 'season' AND j->>'since' = '2026-03-01' AND jsonb_array_length(j->'hourly') = 0,
    'season range head: ' || left(j::TEXT, 300);
  SELECT x INTO d FROM jsonb_array_elements(j->'daily') x WHERE x->>'day' = '2026-03-05';
  ASSERT (d->>'hours_played')::NUMERIC = 0.1 AND (d->>'unique_players')::INT = 2 AND (d->>'new_players')::INT = 2
     AND (d->>'deaths')::INT = 2 AND (d->>'kills')::INT = 3, 'daily 03-05: ' || d::TEXT;
  SELECT x INTO d FROM jsonb_array_elements(j->'daily') x WHERE x->>'day' = '2026-03-04';
  ASSERT (d->>'hours_played')::NUMERIC = 1.0 AND (d->>'unique_players')::INT = 2 AND (d->>'peak')::INT = 2 AND (d->>'avg')::NUMERIC > 0, 'daily 03-04 (from the session log): ' || d::TEXT;
  SELECT x INTO d FROM jsonb_array_elements(j->'daily') x WHERE x->>'day' = '2026-03-08';
  ASSERT d->'hours_played' = 'null'::JSONB AND (d->>'kills')::INT = 0 AND (d->>'deaths')::INT = 0, 'a day nothing measured: ' || d::TEXT;
  ASSERT (j->'totals'->>'hours_played')::NUMERIC = 2.4 AND (j->'totals'->>'new_players')::INT = 4
     AND (j->'totals'->>'deaths')::INT = 3 AND (j->'totals'->>'kills')::INT = 81 AND (j->'totals'->>'peak')::INT = 4,
    'totals: ' || (j->'totals')::TEXT;
  ASSERT j->>'tracking_since' IS NOT NULL, 'tracking_since';
  RAISE NOTICE 'PASS summary keys, daily rows, unmeasured days are null, totals'; INSERT INTO mt_results (result) VALUES ('PASS summary keys, daily rows, unmeasured days are null, totals');

  -- 9. heatmap: 7 weekdays x 24 hours, Thursday (4) 10:00 = 0.08, 11:00 = 3.00, empty cell null
  ASSERT jsonb_array_length(j->'heatmap') = 7 AND jsonb_array_length(j->'heatmap'->0) = 24, 'heatmap shape';
  ASSERT (j->'heatmap'->4->>11)::NUMERIC = 3.00 AND (j->'heatmap'->4->>10)::NUMERIC = 0.08 AND j->'heatmap'->0->0 = 'null'::JSONB,
    'heatmap values: ' || (j->'heatmap'->4)::TEXT;
  RAISE NOTICE 'PASS heatmap is 7 x 24 by UTC weekday and hour'; INSERT INTO mt_results (result) VALUES ('PASS heatmap is 7 x 24 by UTC weekday and hour');

  -- 10. top time: top 10, ranked, display names fall back to the username
  ASSERT jsonb_array_length(j->'top_time') = 10, 'top_time length ' || jsonb_array_length(j->'top_time');
  ASSERT j->'top_time'->0->>'username' = 'eve' AND (j->'top_time'->0->>'rank')::INT = 1 AND (j->'top_time'->0->>'minutes')::INT = 60
     AND j->'top_time'->0->>'display_name' = 'eve' AND j->'top_time'->9->>'username' = 'p04' AND (j->'top_time'->9->>'rank')::INT = 10,
    'top_time order: ' || (j->'top_time')::TEXT;
  RAISE NOTICE 'PASS top_time is the top 10 by minutes'; INSERT INTO mt_results (result) VALUES ('PASS top_time is the top 10 by minutes');

  -- 11. ranges: 7 gives hourly, the rest clamp or fall back to the season
  PERFORM aurora.metrics_rollup(now() - INTERVAL '3 hours', now());
  j := aurora.metrics_summary('mt-t', '7');
  ASSERT j->>'range' = '7' AND j->>'since' = to_char(((now() AT TIME ZONE 'UTC')::DATE - 6), 'YYYY-MM-DD')
     AND jsonb_array_length(j->'daily') = 7 AND jsonb_array_length(j->'hourly') = 1,
    '7-day range: ' || left(j::TEXT, 400);
  ASSERT aurora.metrics_summary('mt-t', '30')->>'range' = '30'
     AND jsonb_array_length(aurora.metrics_summary('mt-t', '30')->'hourly') = 0
     AND aurora.metrics_summary('mt-t', '0')->>'range' = '1'
     AND aurora.metrics_summary('mt-t', '99999')->>'range' = '3650'
     AND aurora.metrics_summary('mt-t', 'garbage')->>'range' = 'season'
     AND aurora.metrics_summary('mt-t', NULL)->>'range' = 'season',
    'range clamping';
  RAISE NOTICE 'PASS ranges: 7 has hourly, 30 does not, clamping and fallback to the season'; INSERT INTO mt_results (result) VALUES ('PASS ranges: 7 has hourly, 30 does not, clamping and fallback to the season');

  -- 12. an unknown server: every key, nothing in it
  j := aurora.metrics_summary('mt-none', 'season');
  ASSERT j ?& ARRAY['range', 'since', 'season_start', 'tracking_since', 'players_since', 'hourly', 'daily', 'heatmap', 'top_time', 'totals']
     AND jsonb_array_length(j->'daily') = 1 AND (j->'daily'->0->>'kills')::INT = 0 AND j->'daily'->0->'hours_played' = 'null'::JSONB
     AND j->'top_time' = '[]'::JSONB, 'empty summary: ' || left(j::TEXT, 300);
  j := aurora.metrics_summary('does-not-exist', '7');
  ASSERT j->'daily' = '[]'::JSONB, 'unknown server daily';
  RAISE NOTICE 'PASS a known server with no rows gets one empty day, an unknown one none'; INSERT INTO mt_results (result) VALUES ('PASS a known server with no rows gets one empty day, an unknown one none');

  -- 13. races: shape, season start, top 10 kills with sparse series
  j := aurora.metrics_races('mt-t');
  ASSERT j ?& ARRAY['season_start', 'now', 'kills', 'lives', 'time']
     AND (j->'kills') ?& ARRAY['players', 'hourly_totals'] AND (j->'lives') ? 'players' AND (j->'time') ? 'players',
    'races keys';
  ASSERT (j->>'season_start')::TIMESTAMPTZ = TIMESTAMPTZ '2026-03-01 00:00:00+00', 'season_start ' || (j->>'season_start');
  ASSERT jsonb_array_length(j->'kills'->'players') = 10
     AND j->'kills'->'players'->0->>'username' = 'u12' AND (j->'kills'->'players'->0->>'total')::INT = 12
     AND j->'kills'->'players'->0->'series' = '[132, 12]'::JSONB
     AND j->'kills'->'players'->9->>'username' = 'u03',
    'kill race top 10: ' || left((j->'kills')::TEXT, 400);
  ASSERT j->'kills'->'hourly_totals' = '[106, 3, 132, 78]'::JSONB, 'kill hourly totals: ' || (j->'kills'->'hourly_totals')::TEXT;
  RAISE NOTICE 'PASS kill race: top 10, sparse [hour, n] series, all-player hourly totals'; INSERT INTO mt_results (result) VALUES ('PASS kill race: top 10, sparse [hour, n] series, all-player hourly totals');

  -- 14. races: lives from deaths, the best life, public keys only
  ASSERT jsonb_array_length(j->'lives'->'players') = 3
     AND j->'lives'->'players'->0->>'username' = 'ann' AND (j->'lives'->'players'->0->>'best_hours')::NUMERIC = 100
     AND j->'lives'->'players'->0->>'display_name' = 'Ann' AND j->'lives'->'players'->1->>'username' = 'bob'
     AND j->'lives'->'players'->1->>'display_name' = 'bob',
    'lives order: ' || left((j->'lives')::TEXT, 500);
  ASSERT jsonb_array_length(j->'lives'->'players'->0->'deaths') = 2
     AND (j->'lives'->'players'->0->'deaths'->1->>1)::NUMERIC = 55
     AND j->'lives'->'players'->0->'deaths'->0->>0 = '2026-03-03T15:00:00Z',
    'ann deaths: ' || (j->'lives'->'players'->0->'deaths')::TEXT;
  ASSERT (SELECT array_agg(k ORDER BY k) FROM jsonb_object_keys(j->'lives'->'players'->0) k)
       = ARRAY['best_hours', 'deaths', 'display_name', 'first_seen', 'hours_survived', 'is_dead', 'username'],
    'lives player keys are public ones only';
  RAISE NOTICE 'PASS longest alive: deaths with hours, best life, public keys only'; INSERT INTO mt_results (result) VALUES ('PASS longest alive: deaths with hours, best life, public keys only');

  -- 15. races: time race top 10 with the hour series
  ASSERT jsonb_array_length(j->'time'->'players') = 10
     AND j->'time'->'players'->0->>'username' = 'eve' AND (j->'time'->'players'->0->>'minutes')::INT = 60
     AND j->'time'->'players'->0->'series' = '[152, 60]'::JSONB,
    'time race: ' || left((j->'time')::TEXT, 400);
  j := aurora.metrics_races('mt-none');
  ASSERT j ?& ARRAY['season_start', 'now', 'kills', 'lives', 'time']
     AND j->'kills'->'players' = '[]'::JSONB AND j->'kills'->'hourly_totals' = '[]'::JSONB
     AND j->'lives'->'players' = '[]'::JSONB AND j->'time'->'players' = '[]'::JSONB,
    'empty races';
  RAISE NOTICE 'PASS time race top 10, and an empty server gives empty races'; INSERT INTO mt_results (result) VALUES ('PASS time race top 10, and an empty server gives empty races');

  -- 15b. the races are cached: the public call returns the cached row, and computes once when there is none
  ASSERT EXISTS (SELECT 1 FROM aurora.metrics_races_cache WHERE server_id = 'mt-t'), 'the rollup refreshes the races cache';
  ASSERT aurora.metrics_races('mt-t') = (SELECT body FROM aurora.metrics_races_cache WHERE server_id = 'mt-t'), 'races read the cache';
  UPDATE aurora.metrics_races_cache SET body = jsonb_set(body, '{marker}', 'true'::JSONB) WHERE server_id = 'mt-t';
  ASSERT (aurora.metrics_races('mt-t')->>'marker') = 'true', 'the public call must return the cached row, not recompute';
  DELETE FROM aurora.metrics_races_cache WHERE server_id = 'mt-t';
  j := aurora.metrics_races('mt-t');
  ASSERT j ? 'season_start' AND NOT (j ? 'marker') AND (j->>'sessions_imported')::BOOLEAN = TRUE
     AND (aurora.metrics_races('mt-none')->>'sessions_imported')::BOOLEAN = FALSE,
    'no cache row: computed on the spot; sessions_imported says whether play_sessions has rows';
  RAISE NOTICE 'PASS races are served from the cache and computed once when it is empty'; INSERT INTO mt_results (result) VALUES ('PASS races are served from the cache and computed once when it is empty');

  -- 16. who may call what
  ASSERT has_function_privilege('anon', 'aurora.metrics_summary(text,text)', 'EXECUTE')
     AND has_function_privilege('anon', 'aurora.metrics_races(text)', 'EXECUTE'), 'anon must read the two public functions';
  ASSERT NOT has_function_privilege('anon', 'aurora.metrics_rollup(timestamptz,timestamptz)', 'EXECUTE')
     AND NOT has_function_privilege('anon', 'aurora.metrics_minutes(timestamptz,timestamptz)', 'EXECUTE')
     AND NOT has_function_privilege('anon', 'aurora.metrics_source_rank(text)', 'EXECUTE')
     AND NOT has_function_privilege('authenticated', 'aurora.enable_metrics_cron()', 'EXECUTE')
     AND NOT has_function_privilege('authenticated', 'aurora.disable_metrics_cron()', 'EXECUTE'),
     'only the summary and the races are public';
  ASSERT NOT has_function_privilege('anon', 'aurora.metrics_races_compute(text)', 'EXECUTE')
     AND NOT has_function_privilege('anon', 'aurora.metrics_races_refresh()', 'EXECUTE')
     AND NOT has_table_privilege('anon', 'aurora.metrics_races_cache', 'SELECT'),
     'the races cache and its refresh are not public';
  ASSERT NOT has_table_privilege('anon', 'aurora.metrics_hourly', 'SELECT')
     AND NOT has_table_privilege('anon', 'aurora.metrics_player_hourly', 'SELECT')
     AND NOT has_table_privilege('anon', 'aurora.play_sessions', 'SELECT')
     AND NOT has_table_privilege('authenticated', 'aurora.play_sessions', 'INSERT')
     AND NOT has_table_privilege('authenticated', 'aurora.metrics_hourly', 'SELECT'),
     'the tables are not readable by clients';
  RAISE NOTICE 'PASS anon may call only the two public functions'; INSERT INTO mt_results (result) VALUES ('PASS anon may call only the two public functions');

  RAISE NOTICE 'ALL METRICS TESTS PASSED'; INSERT INTO mt_results (result) VALUES ('ALL METRICS TESTS PASSED');
END
$$;

SELECT result FROM mt_results ORDER BY n;

ROLLBACK;
