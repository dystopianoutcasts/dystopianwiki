-- Migration 046: the home page summary answers in time again
-- Created: 2026-11-03
-- Description: aurora.home_summary_tz took 6.0 s live (EXPLAIN ANALYZE, 2026-11-03) against
--   the 3 s statement limit for anonymous callers, so every visitor's home page showed TBD.
--   5.6 s of it was the `week` CTE (busiest hour per hour, 7 days): 46,886 samples found by
--   the primary key, then 14,772 heap pages read (115 MB) to fetch one small column,
--   `players`, from rows that each carry the whole heartbeat JSON. Every other part of the
--   function together took about 0.4 s.
--
-- What it does:
--
--   health_samples_server_t_players_idx   (server_id, t) INCLUDE (players). The `week`
--       CTE needs exactly these three columns, so it becomes an index-only scan: a few
--       hundred small index pages instead of the fat heap. No function changes.
--   autovacuum on health_samples           an index-only scan skips the heap only on pages
--       VACUUM has marked all-visible. The table only grows by inserts (one sample about
--       every 10 s) plus the daily slimming UPDATE (044), and the default insert trigger
--       waits for 20% of the table (about 12,000 samples, a day and a half), leaving the
--       newest pages unmarked. Vacuum it after every 500 inserts instead (about 80 minutes).
--
-- ORDER: after 044. Safe to run twice. The index build locks inserts into health_samples
-- for a few seconds; the importer simply waits.
-- Run it as postgres (the SQL editor). Then, as a SEPARATE run on its own (VACUUM cannot
-- run inside the editor's transaction):
--   VACUUM (ANALYZE) aurora.health_samples;

CREATE INDEX IF NOT EXISTS health_samples_server_t_players_idx
  ON aurora.health_samples (server_id, t) INCLUDE (players);

ALTER TABLE aurora.health_samples SET (
  autovacuum_vacuum_insert_threshold = 500,
  autovacuum_vacuum_insert_scale_factor = 0,
  autovacuum_vacuum_scale_factor = 0.05
);

ANALYZE aurora.health_samples;

COMMENT ON INDEX aurora.health_samples_server_t_players_idx IS
  'Index-only scan for home_summary_tz''s 7-day busiest-hours CTE (046): it reads players per sample without the heap rows and their raw JSON.';
