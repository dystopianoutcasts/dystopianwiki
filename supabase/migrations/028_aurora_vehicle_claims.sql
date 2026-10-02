-- Migration 028: claimed cars, one row per car, and stale-car cleanup
-- Created: 2026-10-02
-- Description: owner decisions, 2026-10-02: a claimed car is drawn on the public
--              map with its owner's name, the same as a safehouse owner, and an
--              unclaimed car not heard from for 24 hours is hidden. Claimed cars
--              always show. Depends on 008, 009, 022 and 027.
--
-- Three problems in one file, because each needs the other two:
--
--   1. ONE ROW PER CAR. aurora.vehicles was keyed on the engine's net id
--      (getId), which is reassigned on every restart, so every restart left a
--      second row for the same car and nothing ever deleted either. The exporter
--      (0.3.0) now also sends the persistent save id (getSqlId) as `q`. sql_id
--      is stored, unique per server, and the ingest upserts on it through
--      aurora.upsert_vehicles(). The old (server_id, vehicle_id) key stays for
--      records without `q`.
--   2. CLAIMS. aurora.vehicle_claims is the DystopianVehicleClaim ledger file as
--      the ingest last read it: the only place a claimed car's position is known
--      while the car is not loaded. vehicles.claimed_by is the owner as the
--      exporter last saw it on a loaded car.
--   3. WHAT THE MAP SHOWS. vehicles_public() / vehicles_visible now return loaded
--      cars seen in the last 24 hours plus every claimed car, one row per car,
--      with claimed_by. Driver usernames stay out of it, exactly as in 022.
--
-- ORDER (VISIBILITY.md): the live map names columns on vehicles_visible. Only
-- columns are ADDED here (claimed_by, sql_id, from_ledger) and the first seven
-- keep their names, types and order. Rows are filtered, which is harmless to a
-- client. The view is dropped and recreated because a function's result type
-- cannot change in place; both happen in this one transaction.
--
-- Safe to run twice. Run it as postgres (the SQL editor).

-- ============================================================================
-- 1. VEHICLES: the persistent id and the claim owner
-- ============================================================================
-- A plain unique index, not a partial one: PostgREST's on_conflict names columns
-- only and cannot supply an index predicate. Postgres treats NULLs as distinct in
-- a unique index, so rows from before the exporter sent `q` (sql_id NULL) do not
-- collide with each other.
--
-- 009 granted SELECT on the whole table to `authenticated` behind the two row
-- policies, so the new columns follow the same rule: admins, and viewers of a
-- driven car. Anonymous readers use vehicles_visible.

ALTER TABLE aurora.vehicles ADD COLUMN IF NOT EXISTS sql_id     BIGINT;
ALTER TABLE aurora.vehicles ADD COLUMN IF NOT EXISTS claimed_by TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS vehicles_sql_id_key
  ON aurora.vehicles (server_id, sql_id);

COMMENT ON COLUMN aurora.vehicles.sql_id IS
  'The engine''s persistent id for the car (getSqlId), stable across restarts and the upsert key for exporter 0.3.0 and later. NULL on rows written before that.';
COMMENT ON COLUMN aurora.vehicles.claimed_by IS
  'DystopianVehicleClaim owner as the exporter last saw it on the loaded car. NULL when unclaimed. The ledger (vehicle_claims) is the authority for a car that is not loaded.';

-- ----------------------------------------------------------------------------
-- WRITING VEHICLES: aurora.upsert_vehicles()
-- ----------------------------------------------------------------------------
-- A plain PostgREST upsert cannot do this. After a restart the engine hands the
-- net ids out again, so a car can take over the id another row still holds, and
-- two cars can swap ids inside one batch. The primary key is (server_id,
-- vehicle_id), so the row in the way has to move first, and a single
-- INSERT ... ON CONFLICT that moves rows as it goes fails ("cannot affect row a
-- second time") or trips the key. So the ingest sends the batch here and this
-- does it in four ordered statements:
--
--   1. PARK every row that is in the way: a row that knows its sql_id and either
--      holds an id an incoming car now owns, or is an incoming car about to
--      change id. It goes to a negative id derived from its sql_id and keeps its
--      position, so no key is ever held twice.
--   2. DELETE a row from before sql_id existed (sql_id NULL) that holds an id an
--      incoming q-record now owns: it is the pre-restart duplicate of some car.
--   3. UPSERT the records that carry sql_id on (server_id, sql_id): the car keeps
--      ONE row, whatever net id it has this boot.
--   4. UPSERT the records without sql_id on (server_id, vehicle_id), the old path.
--
-- p_rows is a JSON array of {vehicle_id, sql_id, script_name, x, y, z, t,
-- driver_username, claimed_by}. sql_id null marks an old-style record, and its
-- claimed_by is not written. The caller dedupes so a vehicle_id and a sql_id
-- each appear at most once. service_role only; p_server comes from the caller's
-- configuration, never from a record.

CREATE OR REPLACE FUNCTION aurora.vehicle_park_id(p_sql_id BIGINT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT -1 - (abs(p_sql_id) % 1000000000)::int;
$$;

COMMENT ON FUNCTION aurora.vehicle_park_id(BIGINT) IS
  'A negative stand-in vehicle_id for a car that has no live net id: parked rows in aurora.vehicles and ledger-only rows from vehicles_public(). Engine ids are positive, so it never clashes with one.';

CREATE OR REPLACE FUNCTION aurora.upsert_vehicles(p_server TEXT, p_rows JSONB)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n_keyed  INT;
  n_legacy INT;
BEGIN
  UPDATE aurora.vehicles v
     SET vehicle_id = aurora.vehicle_park_id(v.sql_id)
    FROM jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT)
   WHERE v.server_id = p_server
     AND v.sql_id IS NOT NULL
     AND v.vehicle_id <> aurora.vehicle_park_id(v.sql_id)
     AND ((i.sql_id = v.sql_id AND i.vehicle_id <> v.vehicle_id)
          OR (i.vehicle_id = v.vehicle_id AND i.sql_id IS DISTINCT FROM v.sql_id));

  DELETE FROM aurora.vehicles v
   USING jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT)
   WHERE v.server_id = p_server
     AND v.sql_id IS NULL
     AND i.sql_id IS NOT NULL
     AND v.vehicle_id = i.vehicle_id;

  INSERT INTO aurora.vehicles AS v
         (server_id, vehicle_id, sql_id, script_name, x, y, z, t, driver_username, claimed_by)
  SELECT p_server, i.vehicle_id, i.sql_id, i.script_name, i.x, i.y, i.z, i.t, i.driver_username, i.claimed_by
    FROM jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT, script_name TEXT, x REAL, y REAL,
                                         z REAL, t TIMESTAMPTZ, driver_username TEXT, claimed_by TEXT)
   WHERE i.sql_id IS NOT NULL
  ON CONFLICT (server_id, sql_id) DO UPDATE
     SET vehicle_id      = EXCLUDED.vehicle_id,
         script_name     = EXCLUDED.script_name,
         x               = EXCLUDED.x,
         y               = EXCLUDED.y,
         z               = EXCLUDED.z,
         t               = EXCLUDED.t,
         driver_username = EXCLUDED.driver_username,
         claimed_by      = EXCLUDED.claimed_by;
  GET DIAGNOSTICS n_keyed = ROW_COUNT;

  INSERT INTO aurora.vehicles AS v
         (server_id, vehicle_id, script_name, x, y, z, t, driver_username)
  SELECT p_server, i.vehicle_id, i.script_name, i.x, i.y, i.z, i.t, i.driver_username
    FROM jsonb_to_recordset(p_rows) AS i(vehicle_id INT, sql_id BIGINT, script_name TEXT, x REAL, y REAL,
                                         z REAL, t TIMESTAMPTZ, driver_username TEXT, claimed_by TEXT)
   WHERE i.sql_id IS NULL
  ON CONFLICT (server_id, vehicle_id) DO UPDATE
     SET script_name     = EXCLUDED.script_name,
         x               = EXCLUDED.x,
         y               = EXCLUDED.y,
         z               = EXCLUDED.z,
         t               = EXCLUDED.t,
         driver_username = EXCLUDED.driver_username;
  GET DIAGNOSTICS n_legacy = ROW_COUNT;

  RETURN n_keyed + n_legacy;
END;
$$;

REVOKE ALL ON FUNCTION aurora.upsert_vehicles(TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.upsert_vehicles(TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION aurora.upsert_vehicles(TEXT, JSONB) IS
  'aurora-ingest''s vehicle writer (028): one row per car across restarts, ids that moved are parked or replaced instead of colliding. service_role only.';

-- ============================================================================
-- 2. VEHICLE CLAIMS (the DystopianVehicleClaim ledger)
-- ============================================================================
-- Written by aurora-ingest from <server data>/Lua/DVC/Claims/vehicles.txt, once
-- per run. Keyed on the car's persistent id.
--
-- owner       the claiming account (DVC refuses control characters, pipes and
--             commas in it)
-- script      the vehicle script's full name, "Base.CarNormal"; DVC compares it
--             because the engine reuses a sql id after a car is deleted
-- name        DVC's short label for the car
-- x, y        where DVC last saw it
-- claimed_at  when the claim was made (the ledger's own epoch seconds)
-- last_seen   when DVC last saw the car loaded
-- synced_at   when the ingest last found the claim in the ledger (bookkeeping)
-- miss_count  consecutive complete ledger reads (an empty file included) that did not contain
--             the claim. Reset to 0 when the claim is seen, and the claim is
--             deleted at 3 (aurora.release_missing_claims). Counting reads, not
--             minutes, means an outage followed by one bad read of a half-written
--             file releases nothing (see packages/shared/aurora/claims.ts)
--
-- Public columns: the ones the map draws (owner, label, position). claimed_at,
-- last_seen, synced_at and miss_count are not drawn, so by VISIBILITY.md's rule
-- they are admin only.

CREATE TABLE IF NOT EXISTS aurora.vehicle_claims (
  server_id  TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  sql_id     BIGINT NOT NULL,
  owner      TEXT NOT NULL,
  script     TEXT,
  name       TEXT,
  x          INT,
  y          INT,
  claimed_at TIMESTAMPTZ,
  last_seen  TIMESTAMPTZ,
  synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  miss_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (server_id, sql_id)
);

ALTER TABLE aurora.vehicle_claims ADD COLUMN IF NOT EXISTS miss_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS vehicle_claims_synced_idx
  ON aurora.vehicle_claims (server_id, synced_at);

ALTER TABLE aurora.vehicle_claims ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.vehicle_claims FROM PUBLIC, anon, authenticated;
GRANT SELECT (server_id, sql_id, owner, script, name, x, y)
  ON aurora.vehicle_claims TO anon, authenticated;
GRANT ALL ON aurora.vehicle_claims TO service_role;

DROP POLICY IF EXISTS "aurora vehicle claims are publicly readable" ON aurora.vehicle_claims;
CREATE POLICY "aurora vehicle claims are publicly readable"
  ON aurora.vehicle_claims FOR SELECT
  USING (TRUE);

COMMENT ON TABLE aurora.vehicle_claims IS
  'The DystopianVehicleClaim ledger as aurora-ingest last read it (028). Public: owner, label and position. Admin only: claimed_at, last_seen, synced_at, miss_count.';

-- A claim that leaves the ledger no longer marks the car as claimed.
CREATE OR REPLACE FUNCTION aurora.vehicle_claim_released()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE aurora.vehicles v
     SET claimed_by = NULL
   WHERE v.server_id = OLD.server_id
     AND v.sql_id = OLD.sql_id
     AND v.claimed_by IS NOT NULL;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS vehicle_claim_released ON aurora.vehicle_claims;
CREATE TRIGGER vehicle_claim_released
  AFTER DELETE ON aurora.vehicle_claims
  FOR EACH ROW EXECUTE FUNCTION aurora.vehicle_claim_released();

-- A claim is released only after it has been missing from THREE consecutive
-- complete reads of the ledger. The ingest calls this once per trusted read with
-- the sql ids that read contained: they go back to 0, every other claim of the
-- server moves up one, and a claim at p_misses is deleted (the trigger above then
-- clears claimed_by). An empty list means "none present": every claim moves up
-- one, so three empty reads in a row release them all, and one empty read (a
-- truncate caught mid-write) is only one miss. NULL means "no read" and changes
-- nothing. Returns the claims deleted.
CREATE OR REPLACE FUNCTION aurora.release_missing_claims(p_server TEXT, p_present BIGINT[], p_misses INT DEFAULT 3)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n INT;
BEGIN
  IF p_present IS NULL THEN
    RETURN 0;
  END IF;
  -- A limit below 1 would release every claim on its first read; floor it.
  p_misses := GREATEST(COALESCE(p_misses, 3), 1);

  UPDATE aurora.vehicle_claims c
     SET miss_count = CASE WHEN c.sql_id = ANY (p_present) THEN 0 ELSE c.miss_count + 1 END
   WHERE c.server_id = p_server;

  DELETE FROM aurora.vehicle_claims c
   WHERE c.server_id = p_server
     AND c.miss_count >= p_misses;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.release_missing_claims(TEXT, BIGINT[], INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.release_missing_claims(TEXT, BIGINT[], INT) TO service_role;

COMMENT ON FUNCTION aurora.release_missing_claims(TEXT, BIGINT[], INT) IS
  'Counts consecutive complete ledger reads that missed each claim and deletes a claim at p_misses (028). An empty p_present means none present; NULL changes nothing; p_misses is floored at 1. service_role only.';

-- ============================================================================
-- 3. THE PUBLIC VEHICLE SURFACE
-- ============================================================================
-- One row per car:
--   * a vehicles row, shown when it was seen in the last 24 hours OR the car is
--     claimed (a ledger claim for the same sql_id, or claimed_by on the row);
--   * a claim with no vehicles row, shown at the ledger position.
-- The ledger position replaces the vehicles position when it is newer
-- (from_ledger = TRUE); otherwise the vehicles row wins.
--
-- A ledger claim and a vehicles row are the same car when sql_id matches and the
-- script names agree (module prefix and case ignored, either side blank counts as
-- agreeing): DVC drops a claim whose sql id was recycled onto another script, and
-- so does this.
--
-- vehicle_id of a ledger-only row is aurora.vehicle_park_id(sql_id), negative, so
-- every row still has a unique id. from_ledger tells the map the car is not
-- currently loaded.
--
-- `t` must never lead the log. The public client delta-polls `t > newest t it
-- holds`, so a row stamped "now" by the ledger would push that cursor ahead of
-- vehicle rows still to arrive from the log and hide them until the next full
-- refetch. So a ledger-sourced row never carries a fresh time:
--   * where the ledger wins the position, t is the vehicles row's own (old) t;
--   * a ledger-only car has t = the epoch (to_timestamp(0)).
-- Such rows never come through a delta poll; the client's periodic full refetch
-- picks up ledger changes. t is never the ledger's claimed_at or last_seen, which
-- say when a player made a claim and when they were last near the car and are
-- admin only.
--
-- One internal function, aurora.vehicles_rows(), builds the rows with every
-- column. vehicles_public() (anon, authenticated) returns the public ten;
-- vehicles_admin() (admins only) returns the same rows plus driver_username,
-- claimed_at and last_seen. Neither the internal function nor its extra columns
-- are reachable by anon.
--
-- t is a timestamptz; the 24 hours is wall clock against NOW().

DROP VIEW IF EXISTS aurora.vehicles_visible;
DROP FUNCTION IF EXISTS aurora.vehicles_public();
DROP FUNCTION IF EXISTS aurora.vehicles_admin(TEXT);
DROP FUNCTION IF EXISTS aurora.vehicles_rows();

CREATE FUNCTION aurora.vehicles_rows()
RETURNS TABLE (
  server_id       TEXT,
  vehicle_id      INT,
  script_name     TEXT,
  x               REAL,
  y               REAL,
  z               REAL,
  t               TIMESTAMPTZ,
  claimed_by      TEXT,
  sql_id          BIGINT,
  from_ledger     BOOLEAN,
  driver_username TEXT,
  claimed_at      TIMESTAMPTZ,
  last_seen       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  WITH matched AS (
    SELECT v.server_id    AS v_server,
           v.vehicle_id   AS v_id,
           v.script_name  AS v_script,
           v.x            AS v_x,
           v.y            AS v_y,
           v.z            AS v_z,
           v.t            AS v_t,
           v.sql_id       AS v_sql,
           v.claimed_by   AS v_owner,
           v.driver_username AS v_driver,
           c.sql_id       AS c_sql,
           c.owner        AS c_owner,
           c.x            AS c_x,
           c.y            AS c_y,
           c.last_seen    AS c_seen,
           c.claimed_at   AS c_claimed
      FROM aurora.vehicles v
      LEFT JOIN aurora.vehicle_claims c
        ON c.server_id = v.server_id
       AND c.sql_id = v.sql_id
       AND (COALESCE(c.script, '') = ''
            OR COALESCE(v.script_name, '') = ''
            OR lower(regexp_replace(c.script, '^.*\.', '')) = lower(regexp_replace(v.script_name, '^.*\.', '')))
  )
  SELECT m.v_server,
         m.v_id,
         m.v_script,
         CASE WHEN m.c_seen IS NOT NULL AND (m.v_t IS NULL OR m.c_seen > m.v_t) THEN m.c_x::real ELSE m.v_x END,
         CASE WHEN m.c_seen IS NOT NULL AND (m.v_t IS NULL OR m.c_seen > m.v_t) THEN m.c_y::real ELSE m.v_y END,
         m.v_z,
         m.v_t,
         COALESCE(m.c_owner, m.v_owner),
         m.v_sql,
         (m.c_seen IS NOT NULL AND (m.v_t IS NULL OR m.c_seen > m.v_t)),
         m.v_driver,
         m.c_claimed,
         m.c_seen
    FROM matched m
   WHERE m.v_t > NOW() - INTERVAL '24 hours'
      OR m.c_sql IS NOT NULL
      OR m.v_owner IS NOT NULL
  UNION ALL
  SELECT c.server_id,
         aurora.vehicle_park_id(c.sql_id),
         c.script,
         c.x::real,
         c.y::real,
         0::real,
         to_timestamp(0),
         c.owner,
         c.sql_id,
         TRUE,
         NULL::text,
         c.claimed_at,
         c.last_seen
    FROM aurora.vehicle_claims c
   WHERE NOT EXISTS (
           SELECT 1
             FROM aurora.vehicles v
            WHERE v.server_id = c.server_id
              AND v.sql_id = c.sql_id
              AND (COALESCE(c.script, '') = ''
                   OR COALESCE(v.script_name, '') = ''
                   OR lower(regexp_replace(c.script, '^.*\.', '')) = lower(regexp_replace(v.script_name, '^.*\.', ''))));
$$;

REVOKE ALL ON FUNCTION aurora.vehicles_rows() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.vehicles_rows() TO service_role;

COMMENT ON FUNCTION aurora.vehicles_rows() IS
  'Internal (028): every car the map may show, with every column including the private ones. Called only by vehicles_public() and vehicles_admin(), both SECURITY DEFINER; no client role can execute it.';

CREATE FUNCTION aurora.vehicles_public()
RETURNS TABLE (
  server_id   TEXT,
  vehicle_id  INT,
  script_name TEXT,
  x           REAL,
  y           REAL,
  z           REAL,
  t           TIMESTAMPTZ,
  claimed_by  TEXT,
  sql_id      BIGINT,
  from_ledger BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = aurora, public, pg_temp
AS $$
  SELECT r.server_id, r.vehicle_id, r.script_name, r.x, r.y, r.z, r.t, r.claimed_by, r.sql_id, r.from_ledger
    FROM aurora.vehicles_rows() r;
$$;

REVOKE ALL ON FUNCTION aurora.vehicles_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.vehicles_public() TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.vehicles_public() IS
  'The public car list (028): loaded cars seen in the last 24 hours plus every claimed car, one row per car, with claimed_by (the owner is public, as a safehouse owner is) and from_ledger (position from the claim ledger, car not loaded). t never comes from the ledger''s claimed_at or last_seen. No driver_username and no way to filter by it. SECURITY DEFINER so anon can read it despite aurora.vehicles having no anon grant.';

-- The admin path, modelled on 023's safehouses_admin(): the WHERE clause is the
-- gate, so a non-admin gets zero rows rather than an error. authenticated only;
-- anon cannot execute it at all.
CREATE FUNCTION aurora.vehicles_admin(p_server TEXT)
RETURNS TABLE (
  server_id       TEXT,
  vehicle_id      INT,
  script_name     TEXT,
  x               REAL,
  y               REAL,
  z               REAL,
  t               TIMESTAMPTZ,
  claimed_by      TEXT,
  sql_id          BIGINT,
  from_ledger     BOOLEAN,
  driver_username TEXT,
  claimed_at      TIMESTAMPTZ,
  last_seen       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.server_id, r.vehicle_id, r.script_name, r.x, r.y, r.z, r.t, r.claimed_by, r.sql_id, r.from_ledger,
         r.driver_username, r.claimed_at, r.last_seen
    FROM aurora.vehicles_rows() r
   WHERE aurora.is_aurora_admin()
     AND r.server_id = p_server;
$$;

REVOKE ALL ON FUNCTION aurora.vehicles_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION aurora.vehicles_admin(TEXT) TO authenticated;

COMMENT ON FUNCTION aurora.vehicles_admin(TEXT) IS
  'The same cars as vehicles_public() for one server (028), plus driver_username and the ledger''s claimed_at and last_seen. Empty for anyone who is not an aurora admin. SECURITY DEFINER; the WHERE clause is the gate.';

CREATE VIEW aurora.vehicles_visible
WITH (security_invoker = TRUE) AS
  SELECT * FROM aurora.vehicles_public();

GRANT SELECT ON aurora.vehicles_visible TO anon, authenticated;

COMMENT ON VIEW aurora.vehicles_visible IS
  'The map reads this, not aurora.vehicles directly (028): one row per car, never the driver. security_invoker so the caller''s own EXECUTE grant on vehicles_public() is what is checked, same as 018''s player_positions_visible.';

-- ============================================================================
-- 4. PRUNE
-- ============================================================================
-- Old restart duplicates (sql_id NULL, one per car per restart) and cars that
-- were scrapped: a vehicles row with no claim that has not been heard from for
-- p_days days goes. At most p_limit rows per call, oldest first, so a first run
-- cannot hold a lock for long; the ingest calls it every run and a backlog drains
-- over a few runs. A claimed car is never pruned, whether the claim is in the
-- ledger or only on the row.

CREATE OR REPLACE FUNCTION aurora.prune_vehicles(p_days INT DEFAULT 14, p_limit INT DEFAULT 5000)
RETURNS INT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH doomed AS (
    SELECT v.ctid AS row_id
      FROM aurora.vehicles v
     WHERE COALESCE(v.t, '-infinity'::timestamptz) < NOW() - make_interval(days => p_days)
       AND v.claimed_by IS NULL
       AND NOT EXISTS (
             SELECT 1
               FROM aurora.vehicle_claims c
              WHERE c.server_id = v.server_id
                AND c.sql_id = v.sql_id)
     ORDER BY v.t NULLS FIRST
     LIMIT p_limit
  ),
  gone AS (
    DELETE FROM aurora.vehicles v
     USING doomed d
     WHERE v.ctid = d.row_id
    RETURNING 1
  )
  SELECT count(*)::int FROM gone;
$$;

REVOKE ALL ON FUNCTION aurora.prune_vehicles(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.prune_vehicles(INT, INT) TO service_role;

COMMENT ON FUNCTION aurora.prune_vehicles(INT, INT) IS
  'Deletes unclaimed vehicle rows not seen for p_days days, at most p_limit per call (028). Called by aurora-ingest once per run.';

-- The one-off for the rows that exist today.
SELECT aurora.prune_vehicles(14, 100000);

-- ============================================================================
-- 5. HOME SUMMARY: count what the map shows
-- ============================================================================
-- Same function as 027, signature, SECURITY DEFINER and search_path unchanged.
-- Only the vehicles figure moves: it now counts the cars the public map draws
-- (loaded in the last 24 hours plus every claimed car), not every row ever kept.

CREATE OR REPLACE FUNCTION aurora.home_summary(p_server TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH srv AS (
    SELECT s.name, s.last_seen, s.last_launch_stamp
      FROM aurora.servers s
     WHERE s.id = p_server
  ),
  week AS (
    SELECT h.t, h.players, h.raw
      FROM aurora.health_samples h
     WHERE h.server_id = p_server
       AND h.t > NOW() - INTERVAL '7 days'
  ),
  latest AS (
    SELECT h.raw
      FROM aurora.health_samples h
     WHERE h.server_id = p_server
     ORDER BY h.t DESC
     LIMIT 1
  ),
  cfg AS (
    SELECT c.settings, c.sandbox, c.updated_at
      FROM aurora.server_config c
     WHERE c.server_id = p_server
  )
  SELECT jsonb_build_object(
    'server_name', (SELECT name FROM srv),
    'last_seen', (SELECT last_seen FROM srv),
    'up_since', (
      SELECT (to_timestamp(last_launch_stamp, 'YYYY-MM-DD_HH24-MI')::timestamp AT TIME ZONE 'UTC')
        FROM srv
       WHERE last_launch_stamp ~ '^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$'
    ),
    'online_now', (
      SELECT count(*) FROM aurora.players p WHERE p.server_id = p_server AND p.online
    ),
    'survivors_total', (
      SELECT count(*) FROM aurora.players p WHERE p.server_id = p_server
    ),
    'survivors_7d', (
      SELECT count(*) FROM aurora.players p
       WHERE p.server_id = p_server AND p.last_seen > NOW() - INTERVAL '7 days'
    ),
    'peak_7d', (SELECT max(players) FROM week),
    'hourly_7d', COALESCE((
      SELECT jsonb_agg(jsonb_build_array(extract(epoch FROM hr)::bigint, peak) ORDER BY hr)
        FROM (SELECT date_trunc('hour', t) AS hr, max(players) AS peak
                FROM week
               GROUP BY 1) b
    ), '[]'::jsonb),
    'zombies_killed_today', (
      SELECT CASE WHEN jsonb_typeof(raw #> '{game,zombies-killed-today}') = 'number'
                  THEN (raw #>> '{game,zombies-killed-today}')::numeric END
        FROM latest
    ),
    'players_killed_today', (
      SELECT CASE WHEN jsonb_typeof(raw #> '{game,players-killed-by-zombie-today}') = 'number'
                  THEN (raw #>> '{game,players-killed-by-zombie-today}')::numeric END
        FROM latest
    ),
    'longest_survivors', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'hours', hours, 'online', online) ORDER BY hours DESC, name)
        FROM (SELECT COALESCE(NULLIF(btrim(p.display_name), ''), p.username) AS name,
                     round(p.hours_survived::numeric, 1) AS hours,
                     p.online
                FROM aurora.players p
               WHERE p.server_id = p_server
                 AND p.hours_survived IS NOT NULL
                 AND p.hours_survived > 0
                 AND p.is_dead IS NOT TRUE
               ORDER BY p.hours_survived DESC, p.username
               LIMIT 5) top
    ), '[]'::jsonb),
    'safehouses', (SELECT count(*) FROM aurora.safehouses s WHERE s.server_id = p_server),
    'vehicles', (SELECT count(*) FROM aurora.vehicles_public() vp WHERE vp.server_id = p_server),
    'settings', COALESCE((
      SELECT jsonb_object_agg(e.key, e.value)
        FROM cfg, jsonb_each(cfg.settings) e
       WHERE e.key = ANY (ARRAY[
         'PublicName', 'PublicDescription', 'ServerWelcomeMessage', 'MaxPlayers', 'PVP',
         'Open', 'Public', 'HasPassword', 'PauseEmpty', 'Mods', 'WorkshopItems', 'Map',
         'SafetySystem', 'PlayerSafehouse', 'SafehouseDaySurvivedToClaim', 'Faction',
         'SleepAllowed', 'SleepNeeded', 'AnnounceDeath', 'DropOffWhiteListAfterDeath',
         'VoiceEnable', 'War'
       ])
    ), '{}'::jsonb),
    'sandbox', COALESCE((
      SELECT jsonb_object_agg(e.key, e.value)
        FROM cfg, jsonb_each(cfg.sandbox) e
       WHERE e.key = ANY (ARRAY[
         'Zombies', 'Distribution', 'ZombieRespawn', 'DayLength', 'StartMonth', 'TimeSinceApo',
         'WaterShut', 'ElecShut', 'Helicopter', 'EnableVehicles', 'CarSpawnRate',
         'HoursForLootRespawn', 'ZombieLore.Speed', 'ZombieLore.SprinterPercentage',
         'ZombieLore.Strength', 'ZombieLore.Toughness', 'ZombieLore.Transmission',
         'ZombieLore.Mortality', 'ZombieLore.Reanimate', 'ZombieLore.Cognition',
         'ZombieLore.Sight', 'ZombieLore.Hearing', 'MultiplierConfig.Global',
         'MultiplierConfig.GlobalToggle'
       ])
    ), '{}'::jsonb),
    'config_updated_at', (SELECT updated_at FROM cfg)
  );
$$;

REVOKE ALL ON FUNCTION aurora.home_summary(TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aurora.home_summary(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.home_summary(TEXT) IS
  'Public (027, vehicles count 028): the home page''s server totals and a fixed list of server settings. Aggregates only; the rows behind them stay admin only.';
