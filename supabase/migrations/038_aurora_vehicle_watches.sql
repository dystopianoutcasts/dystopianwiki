-- Migration 038: "Watch for a car" - an account's watch list and the server's script list
-- Created: 2026-10-03
-- Description: the map lets a signed-in account pick car types from every vehicle
--              script the game server has loaded and keeps that pick as the
--              account's own watch list; when a watched type is on the map, the map
--              pings it. Depends on 008 (the aurora schema, aurora.servers, its
--              USAGE grant) and 031 (the public-catalogue pattern this copies).
--              Needs exporter 0.7.3 for the script list (its `vscr` record); until
--              that runs aurora.vehicle_scripts_visible is empty and the map falls
--              back to its own catalogue. Applying this before the new aurora-ingest
--              is deployed is harmless: the ingest's write is optional and skips a
--              missing table.
--
-- What is stored and who reads it:
--
--   aurora.vehicle_watches          one row per (account, server, vehicle SCRIPT) the
--                                   account watches for. Keyed by script name
--                                   ("Base.CarTaxi"), not by a single car and not by
--                                   world: a watch survives a wipe. No foreign key to
--                                   vehicle_names (mod cars come and go, many have no
--                                   name row). It is the account's OWN list: the
--                                   account reads, adds and removes its own rows and
--                                   nobody else's; anon has nothing; an Aurora admin
--                                   has no extra right (this is not server data).
--                                   At most 100 rows per (account, server), enforced
--                                   here (SQLSTATE 23514, message vehicle_watches_limit).
--   aurora.vehicle_scripts          one row per (server, vehicle script) the game server
--                                   has listed: seen_at is the `t` of the exporter pass
--                                   that last listed it. Written by the ingest only.
--   aurora.vehicle_scripts_visible  the public view the watch dropdown reads: the
--                                   scripts of each server's NEWEST pass (seen_at within
--                                   10 minutes of the server's max seen_at), so a script
--                                   from a removed mod drops out on the next pass.
--
-- Matching cars to watches happens in the browser: a car's type and position are
-- already public (aurora.vehicles_visible), so nothing here matches or sends anything.
--
-- How the map calls it through PostgREST (schema aurora, the user's JWT):
--   read:   GET    vehicle_watches?select=script_name&server_id=eq.<server>
--   add:    POST   vehicle_watches?on_conflict=user_id,server_id,script_name
--                  Prefer: resolution=ignore-duplicates
--                  body [{"server_id": "...", "script_name": "..."}, ...]
--   remove: DELETE vehicle_watches?server_id=eq.<server>&script_name=in.(...)
-- INSERT is granted on (server_id, script_name) only, so a client cannot name a
-- user_id at all: the column DEFAULT auth.uid() fills it.
--
-- aurora.servers' key column is `id` (008); both tables reference it.
--
-- Safe to run twice. Run it as postgres (the SQL editor).

-- ============================================================================
-- A. aurora.vehicle_watches - which car types an account watches for
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.vehicle_watches (
  user_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  server_id   TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  script_name TEXT NOT NULL CHECK (script_name <> '' AND char_length(script_name) <= 120),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, server_id, script_name)
);

COMMENT ON TABLE aurora.vehicle_watches IS
  'Car types (vehicle scripts) an account watches for on a server (038). The account''s own list: RLS gives each account its own rows only, admins included; anon has nothing. At most 100 rows per (user_id, server_id) (trigger, SQLSTATE 23514 vehicle_watches_limit). Not world-tagged: a watch survives a wipe.';
COMMENT ON COLUMN aurora.vehicle_watches.script_name IS
  'The full script name, "Base.CarTaxi", as aurora.vehicles.script_name holds it. No foreign key: mod cars come and go.';
COMMENT ON COLUMN aurora.vehicle_watches.user_id IS
  'Always auth.uid() for a client: INSERT is granted on (server_id, script_name) only, so the DEFAULT fills it.';

ALTER TABLE aurora.vehicle_watches ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.vehicle_watches FROM PUBLIC, anon, authenticated;
GRANT SELECT                       ON aurora.vehicle_watches TO authenticated;
GRANT INSERT (server_id, script_name) ON aurora.vehicle_watches TO authenticated;
GRANT DELETE                       ON aurora.vehicle_watches TO authenticated;
GRANT ALL                          ON aurora.vehicle_watches TO service_role;

DROP POLICY IF EXISTS "aurora users read own vehicle watches" ON aurora.vehicle_watches;
CREATE POLICY "aurora users read own vehicle watches"
  ON aurora.vehicle_watches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "aurora users add own vehicle watches" ON aurora.vehicle_watches;
CREATE POLICY "aurora users add own vehicle watches"
  ON aurora.vehicle_watches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "aurora users remove own vehicle watches" ON aurora.vehicle_watches;
CREATE POLICY "aurora users remove own vehicle watches"
  ON aurora.vehicle_watches FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- The 100-row limit. A BEFORE INSERT row trigger fires before ON CONFLICT sees the
-- duplicate, so a script the account already watches returns NEW without counting:
-- the client's "ignore duplicates" re-add never raises, even at exactly 100. Rows
-- inserted earlier in the same statement are visible to the count (VOLATILE
-- function, row-level BEFORE trigger), so a multi-row insert that would cross 100
-- raises on the 101st row and the whole statement inserts none. SECURITY DEFINER so
-- the count is the true count whatever the caller's row policies hide; the advisory
-- lock serialises concurrent inserts for the same (account, server).
CREATE OR REPLACE FUNCTION aurora.vehicle_watches_limit()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n int;
BEGIN
  IF NEW.user_id IS NULL OR NEW.server_id IS NULL OR NEW.script_name IS NULL THEN
    RETURN NEW; -- NOT NULL refuses it after the trigger
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('aurora.vehicle_watches:' || NEW.user_id::text || ':' || NEW.server_id, 0));

  IF EXISTS (SELECT 1 FROM aurora.vehicle_watches w
              WHERE w.user_id = NEW.user_id
                AND w.server_id = NEW.server_id
                AND w.script_name = NEW.script_name) THEN
    RETURN NEW; -- a re-add: ON CONFLICT DO NOTHING (or the primary key) decides
  END IF;

  SELECT count(*) INTO n
    FROM aurora.vehicle_watches w
   WHERE w.user_id = NEW.user_id
     AND w.server_id = NEW.server_id;

  IF n >= 100 THEN
    RAISE EXCEPTION 'vehicle_watches_limit'
      USING ERRCODE = '23514',
            DETAIL = 'An account may watch at most 100 car types per server.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION aurora.vehicle_watches_limit() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION aurora.vehicle_watches_limit() IS
  'BEFORE INSERT row trigger on aurora.vehicle_watches (038): at most 100 rows per (user_id, server_id); SQLSTATE 23514, message vehicle_watches_limit. A re-add of a watched script never raises.';

DROP TRIGGER IF EXISTS vehicle_watches_limit ON aurora.vehicle_watches;
CREATE TRIGGER vehicle_watches_limit
  BEFORE INSERT ON aurora.vehicle_watches
  FOR EACH ROW EXECUTE FUNCTION aurora.vehicle_watches_limit();

-- ============================================================================
-- B. aurora.vehicle_scripts - every vehicle script the game server has loaded
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.vehicle_scripts (
  server_id   TEXT NOT NULL REFERENCES aurora.servers(id) ON DELETE CASCADE,
  script_name TEXT NOT NULL CHECK (script_name <> '' AND char_length(script_name) <= 120),
  seen_at     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (server_id, script_name)
);

CREATE INDEX IF NOT EXISTS vehicle_scripts_server_seen_idx
  ON aurora.vehicle_scripts (server_id, seen_at DESC);

COMMENT ON TABLE aurora.vehicle_scripts IS
  'Every vehicle script the game server has listed (038), from exporter 0.7.3''s vscr records. seen_at = the t of the pass that last listed it; a script from a removed mod keeps its old seen_at. Global catalogue per server, not world-tagged. Written by the ingest (service_role) only; public through aurora.vehicle_scripts_visible.';
COMMENT ON COLUMN aurora.vehicle_scripts.seen_at IS
  'The exporter pass time (its records'' t) that last listed this script. The time the server last listed its scripts; no player data.';

ALTER TABLE aurora.vehicle_scripts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.vehicle_scripts FROM PUBLIC, anon, authenticated;
GRANT SELECT (server_id, script_name, seen_at) ON aurora.vehicle_scripts TO anon, authenticated;
GRANT ALL ON aurora.vehicle_scripts TO service_role;

DROP POLICY IF EXISTS "aurora vehicle scripts are publicly readable" ON aurora.vehicle_scripts;
CREATE POLICY "aurora vehicle scripts are publicly readable"
  ON aurora.vehicle_scripts FOR SELECT USING (TRUE);

DROP VIEW IF EXISTS aurora.vehicle_scripts_visible;
CREATE VIEW aurora.vehicle_scripts_visible
WITH (security_invoker = TRUE) AS
  SELECT s.server_id, s.script_name
    FROM aurora.vehicle_scripts s
   WHERE s.seen_at >= (SELECT max(m.seen_at)
                         FROM aurora.vehicle_scripts m
                        WHERE m.server_id = s.server_id) - INTERVAL '10 minutes';

REVOKE ALL ON aurora.vehicle_scripts_visible FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.vehicle_scripts_visible TO anon, authenticated, service_role;

COMMENT ON VIEW aurora.vehicle_scripts_visible IS
  'The cars available on each server (038): the scripts of the newest exporter pass (seen_at within 10 minutes of the server''s max seen_at). The map''s watch dropdown reads it; empty until exporter 0.7.3 runs.';
