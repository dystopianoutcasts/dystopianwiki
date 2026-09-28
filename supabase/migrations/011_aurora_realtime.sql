-- Migration 011: OutcastAurora Realtime
-- Created: 2026-09-28
-- Description: add exactly three aurora tables to the supabase_realtime publication.
--
-- Realtime delivers only rows the subscriber may SELECT, so the 009 policies are
-- the authorisation for the stream as well as for REST. In particular an
-- anonymous subscriber to aurora.player_positions receives nothing, because anon
-- has the grant but no policy there.
--
-- Deliberately NOT published: aurora.player_position_history (append-only and
-- would leak exact coordinates through the stream, bypassing positions_delayed())
-- and everything else, which is polled.

DO $$
DECLARE
  v_table TEXT;
  v_tables TEXT[] := ARRAY['player_positions', 'vehicles', 'health_samples'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE EXCEPTION
      'publication supabase_realtime does not exist; enable Realtime for this project before applying 011';
  END IF;

  FOREACH v_table IN ARRAY v_tables LOOP
    IF EXISTS (
      SELECT 1
        FROM pg_publication_rel pr
        JOIN pg_publication  p ON p.oid = pr.prpubid
        JOIN pg_class        c ON c.oid = pr.prrelid
        JOIN pg_namespace    n ON n.oid = c.relnamespace
       WHERE p.pubname = 'supabase_realtime'
         AND n.nspname = 'aurora'
         AND c.relname = v_table
    ) THEN
      RAISE NOTICE 'aurora.% is already published', v_table;
    ELSE
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE aurora.%I', v_table);
      RAISE NOTICE 'published aurora.%', v_table;
    END IF;
  END LOOP;
END;
$$;

-- Replica identity note: all three tables are upserted or inserted, never
-- deleted by the ingest function, so the default (primary key) replica identity
-- is enough. A DELETE would emit only the key columns in the old-record payload.
-- Do not switch these to REPLICA IDENTITY FULL without a reason: on
-- player_positions it would put exact coordinates in the old-record payload of
-- every update.

-- Verification (expects exactly three rows: health_samples, player_positions, vehicles):
--   SELECT c.relname
--     FROM pg_publication_rel pr
--     JOIN pg_publication  p ON p.oid = pr.prpubid
--     JOIN pg_class        c ON c.oid = pr.prrelid
--     JOIN pg_namespace    n ON n.oid = c.relnamespace
--    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'aurora'
--    ORDER BY c.relname;
