-- Tests for migration 043: zombie heat in 32x32-square bins.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f) after 032 and 043. It seeds
-- fixtures, asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL ZOMBIE BIN TESTS PASSED", or stops at the first failure.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

INSERT INTO aurora.servers (id, name, first_seen, last_seen) VALUES
  ('t81-s', 'Zombie Bin Test Server', TIMESTAMPTZ '2026-01-01 00:00:00+00', NOW());

-- An exporter before 0.7.6: the importer sends no size, so the row is a whole cell.
INSERT INTO aurora.zombie_grid (server_id, cell_x, cell_y, count, t) VALUES ('t81-s', 5, 5, 3, NOW());

DO $$
BEGIN
  IF (SELECT size FROM aurora.zombie_grid WHERE server_id = 't81-s' AND cell_x = 5) <> 256 THEN
    RAISE EXCEPTION 'FAIL: a row without size is not a 256-square cell';
  END IF;
  RAISE NOTICE 'PASS a row without size defaults to 256';
END $$;

-- The batch that spans the upgrade: bin 5,5 at 32 lands beside cell 5,5 at 256.
INSERT INTO aurora.zombie_grid (server_id, size, cell_x, cell_y, count, t) VALUES ('t81-s', 32, 5, 5, 7, NOW());

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.zombie_grid WHERE server_id = 't81-s') <> 2 THEN
    RAISE EXCEPTION 'FAIL: a 32 bin and a 256 cell with the same indices are not two rows';
  END IF;
  RAISE NOTICE 'PASS size is part of the key';
END $$;

-- The importer's upsert: on_conflict=server_id,size,cell_x,cell_y must name a unique key.
INSERT INTO aurora.zombie_grid (server_id, size, cell_x, cell_y, count, t) VALUES ('t81-s', 32, 5, 5, 11, NOW())
ON CONFLICT (server_id, size, cell_x, cell_y) DO UPDATE SET count = EXCLUDED.count, t = EXCLUDED.t;

DO $$
BEGIN
  IF (SELECT count FROM aurora.zombie_grid WHERE server_id = 't81-s' AND size = 32) <> 11
     OR (SELECT count FROM aurora.zombie_grid WHERE server_id = 't81-s' AND size = 256) <> 3 THEN
    RAISE EXCEPTION 'FAIL: the upsert on (server_id, size, cell_x, cell_y) did not update only its own row';
  END IF;
  RAISE NOTICE 'PASS the importer''s on_conflict target is the primary key';
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO aurora.zombie_grid (server_id, size, cell_x, cell_y, count, t) VALUES ('t81-s', 32, 5, 5, 1, NOW());
    RAISE EXCEPTION 'FAIL: a duplicate (server_id, size, cell_x, cell_y) was accepted';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS a duplicate bin is refused';
  END;
END $$;

DO $$
DECLARE
  v_bad INT;
BEGIN
  FOREACH v_bad IN ARRAY ARRAY[0, -32, 257, 512] LOOP
    BEGIN
      INSERT INTO aurora.zombie_grid (server_id, size, cell_x, cell_y, count, t) VALUES ('t81-s', v_bad, 9, 9, 1, NOW());
      RAISE EXCEPTION 'FAIL: size % was accepted', v_bad;
    EXCEPTION WHEN check_violation THEN
      NULL;
    END;
  END LOOP;
  RAISE NOTICE 'PASS a size outside 1..256 is refused';
END $$;

-- The public map reads size anonymously.
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.zombie_grid WHERE server_id = 't81-s' AND size IN (32, 256)) <> 2 THEN
    RAISE EXCEPTION 'FAIL: anon cannot read size';
  END IF;
  RAISE NOTICE 'PASS anon reads size';
END $$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL ZOMBIE BIN TESTS PASSED'; END $$;

ROLLBACK;
