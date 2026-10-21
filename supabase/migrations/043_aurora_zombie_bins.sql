-- Migration 043: zombie heat in 32x32-square bins
-- Created: 2026-10-20 (T81)
-- Description: the owner asked for finer zombie heat ("32x32 is fun", 2026-10-20). Exporter
--   0.7.6 counts loaded zombies per 32x32 squares instead of per 256-square cell, and every
--   zgrid record carries its bin side `s`. A row's cell_x/cell_y are bin indices in units of
--   that side: the bin covers squares [cell_x * size, (cell_x + 1) * size).
--   Exporters before 0.7.6 send no `s`; the importer writes size 256 for them.
--
-- What it changes:
--
--   aurora.zombie_grid.size   bin side in squares, 1..256, default 256 (every existing row
--                             is a whole cell, so the default is also their true size).
--   primary key               (server_id, size, cell_x, cell_y). Bin 5,5 at 32 and cell 5,5
--                             at 256 are different places; in the ingest batch that spans the
--                             exporter upgrade both arrive, and without size in the key one
--                             would overwrite the other.
--
-- Visibility is unchanged: zombie_grid is granted at table level (009) and its policy (032)
-- reads server_id and world_id only, so size is public like the rest of the row.
-- ORDER: after 032. Before the aurora-ingest redeploy that sends `size`, and before the site
-- that selects it. Safe to run twice.
-- Run it as postgres (the SQL editor), then: NOTIFY pgrst, 'reload schema';

ALTER TABLE aurora.zombie_grid ADD COLUMN IF NOT EXISTS size INT NOT NULL DEFAULT 256;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'aurora.zombie_grid'::regclass AND conname = 'zombie_grid_size_range'
  ) THEN
    ALTER TABLE aurora.zombie_grid
      ADD CONSTRAINT zombie_grid_size_range CHECK (size BETWEEN 1 AND 256);
  END IF;
END $$;

-- Swap the primary key only when it does not hold size yet (the second run is a no-op).
DO $$
DECLARE
  v_pk   TEXT;
  v_cols TEXT[];
BEGIN
  SELECT c.conname, array_agg(a.attname::TEXT ORDER BY k.ord)
    INTO v_pk, v_cols
    FROM pg_constraint c
    CROSS JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
   WHERE c.conrelid = 'aurora.zombie_grid'::regclass AND c.contype = 'p'
   GROUP BY c.conname;

  IF v_cols IS DISTINCT FROM ARRAY['server_id', 'size', 'cell_x', 'cell_y'] THEN
    IF v_pk IS NOT NULL THEN
      EXECUTE format('ALTER TABLE aurora.zombie_grid DROP CONSTRAINT %I', v_pk);
    END IF;
    ALTER TABLE aurora.zombie_grid
      ADD CONSTRAINT zombie_grid_pkey PRIMARY KEY (server_id, size, cell_x, cell_y);
  END IF;
END $$;

COMMENT ON COLUMN aurora.zombie_grid.size IS
  'Bin side in squares (043, zgrid `s` from exporter 0.7.6; 256 for older exporters). cell_x/cell_y are bin indices in units of size.';
