-- Tests for migration 029: A-Life NPC groups and outposts.
--
-- Run the whole file as `postgres` (SQL editor, or psql -f). It seeds fixtures,
-- asserts, and ROLLS BACK. It prints "PASS ..." notices ending in
-- "ALL NPC TESTS PASSED", or stops at the first failure.
--
-- "Running 029 twice is fine" cannot be asserted from inside this file (the SQL
-- editor has no \i); the run script applies the migration twice, with rows in
-- between, before running this.

BEGIN;

SET LOCAL client_min_messages = NOTICE;

-- ============================================================================
-- FIXTURES (server 'test-npc', and a second server that must never leak in)
-- ============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'npc-member@example.invalid', '', NOW(), NOW(), NOW(),
   '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'npc-admin@example.invalid', '', NOW(), NOW(), NOW(),
   '{"aurora_admin": true}'::jsonb, '{}'::jsonb);

INSERT INTO aurora.servers (id, name, last_seen) VALUES
  ('test-npc',  'NPC Test Server', NOW()),
  ('test-npc2', 'Other Server',    NOW());

-- Groups on 'test-npc'. "now" = just seen.
--   g-pub     fresh, public                                    -> shown
--   g-edge    fresh enough (2 minutes)                         -> shown
--   g-sens    fresh, SENSITIVE (a raid)                        -> HIDDEN from the public, shown to admins
--   g-stale   public but 4 minutes old                         -> HIDDEN, and not in the admin list either
--   g-ssens   sensitive and 4 minutes old                      -> HIDDEN everywhere
INSERT INTO aurora.npc_groups
  (server_id, group_id, faction_id, faction_name, stance, size, x, y, z, source, active, encounter, sensitive, t) VALUES
  ('test-npc', 'squad:1',  'secret-faction-1', 'Road Raiders', 'hostile',  3, 100, 200, 0, 'actor', TRUE,  'secret-patrol', FALSE, NOW()),
  ('test-npc', 'squad:2',  'secret-faction-2', 'Free Traders', 'friendly', 2, 300, 400, 0, 'squad', FALSE, 'secret-roamer', FALSE, NOW() - INTERVAL '2 minutes'),
  ('test-npc', 'group:3',  'secret-faction-1', 'Road Raiders', 'hostile',  4, 500, 600, 0, 'actor', TRUE,  'raid',          TRUE,  NOW()),
  ('test-npc', 'actor:4',  'secret-faction-2', 'Free Traders', 'friendly', 1, 700, 800, 0, 'actor', TRUE,  'secret-patrol', FALSE, NOW() - INTERVAL '4 minutes'),
  ('test-npc', 'actor:5',  'secret-faction-1', 'Road Raiders', 'hostile',  1, 900, 900, 0, 'actor', TRUE,  'assassination', TRUE,  NOW() - INTERVAL '4 minutes'),
  ('test-npc2', 'squad:1', 'secret-faction-9', 'Other Folk',   'neutral',  1,   1,   1, 0, 'actor', TRUE,  'patrol',        FALSE, NOW());

-- Outposts on 'test-npc'.
--   site:1  built, public, fresh                               -> shown
--   site:2  built, HIDDEN by the mod                           -> HIDDEN from the public
--   site:3  EXPIRED                                            -> HIDDEN from the public
--   site:4  built, public, 31 minutes old                      -> HIDDEN (stale)
--   site:5  built, public, 29 minutes old                      -> shown
--   site:6  state 'unknown', public                            -> shown
INSERT INTO aurora.npc_outposts
  (server_id, outpost_id, faction_id, faction_name, stance, hostile, x1, y1, x2, y2, z, state, hidden, t) VALUES
  ('test-npc', 'site:1', 'secret-faction-1', 'Road Raiders', 'hostile',  TRUE,  10,  20,  40,  50, 0, 'built',   FALSE, NOW()),
  ('test-npc', 'site:2', 'secret-faction-1', 'Road Raiders', 'hostile',  TRUE,  11,  21,  41,  51, 0, 'built',   TRUE,  NOW()),
  ('test-npc', 'site:3', 'secret-faction-2', 'Free Traders', 'friendly', FALSE, 12,  22,  42,  52, 0, 'expired', FALSE, NOW()),
  ('test-npc', 'site:4', 'secret-faction-2', 'Free Traders', 'friendly', FALSE, 13,  23,  43,  53, 0, 'built',   FALSE, NOW() - INTERVAL '31 minutes'),
  ('test-npc', 'site:5', 'secret-faction-2', 'Free Traders', 'friendly', FALSE, 14,  24,  44,  54, 0, 'built',   FALSE, NOW() - INTERVAL '29 minutes'),
  ('test-npc', 'site:6', 'secret-faction-2', 'Free Traders', 'neutral',  FALSE, 15,  25,  45,  55, 0, 'unknown', FALSE, NOW()),
  ('test-npc2', 'site:1', 'secret-faction-9', 'Other Folk',  'neutral',  FALSE, 1,   1,   2,   2,  0, 'built',   FALSE, NOW());

-- Freshness is judged on seen_at (the ingest's clock), not t (the game server's).
-- Here the two agree; section 8 pulls them apart.
UPDATE aurora.npc_groups   SET seen_at = t;
UPDATE aurora.npc_outposts SET seen_at = t;

-- ============================================================================
-- 0. SHAPE: the public views carry exactly the agreed columns, in order
-- ============================================================================

DO $$
DECLARE
  cols text;
BEGIN
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols
    FROM pg_attribute
   WHERE attrelid = 'aurora.npc_groups_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,group_id,faction_name,stance,size,x,y,z,active,t' THEN
    RAISE EXCEPTION 'FAIL: npc_groups_visible columns are %', cols;
  END IF;
  SELECT string_agg(attname, ',' ORDER BY attnum) INTO cols
    FROM pg_attribute
   WHERE attrelid = 'aurora.npc_outposts_visible'::regclass AND attnum > 0 AND NOT attisdropped;
  IF cols <> 'server_id,outpost_id,faction_name,stance,hostile,x1,y1,x2,y2,t' THEN
    RAISE EXCEPTION 'FAIL: npc_outposts_visible columns are %', cols;
  END IF;
  RAISE NOTICE 'PASS both public views carry exactly the agreed columns, in order';

  IF (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'aurora' AND table_name = 'npc_groups' AND column_name = 'sensitive') IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'FAIL: npc_groups.sensitive does not default to TRUE';
  END IF;
  IF (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'aurora' AND table_name = 'npc_outposts' AND column_name = 'hidden') IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'FAIL: npc_outposts.hidden does not default to TRUE';
  END IF;
  RAISE NOTICE 'PASS sensitive and hidden default to TRUE (fail closed)';
END $$;

-- ============================================================================
-- 1. ANON: what the public map reads
-- ============================================================================

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.npc_groups_visible WHERE server_id = 'test-npc';
  IF n <> 2 THEN RAISE EXCEPTION 'FAIL: anon sees % groups, expected 2', n; END IF;
  RAISE NOTICE 'PASS anon sees exactly the two fresh public groups';

  IF EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE group_id = 'group:3') THEN
    RAISE EXCEPTION 'FAIL: a sensitive group (a raid) is on the public view';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE group_id = 'actor:5') THEN
    RAISE EXCEPTION 'FAIL: a stale sensitive group (an assassination) is on the public view';
  END IF;
  RAISE NOTICE 'PASS anon never sees a sensitive group';

  IF EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE group_id = 'actor:4') THEN
    RAISE EXCEPTION 'FAIL: a group last seen 4 minutes ago is on the public view';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE group_id = 'squad:2') THEN
    RAISE EXCEPTION 'FAIL: a group last seen 2 minutes ago is missing';
  END IF;
  RAISE NOTICE 'PASS a group not seen for 3 minutes is hidden, one seen 2 minutes ago is shown';

  IF (SELECT count(*) FROM aurora.npc_groups_visible) <> 3 THEN
    RAISE EXCEPTION 'FAIL: the view should hold 2 groups of test-npc and 1 of the other server';
  END IF;
  RAISE NOTICE 'PASS the view spans servers by column, the map filters on server_id';

  -- Columns that are not public.
  BEGIN
    EXECUTE 'SELECT encounter FROM aurora.npc_groups_visible';
    RAISE EXCEPTION 'FAIL: anon selected encounter from the public view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the public view has no encounter column';
  END;
  BEGIN
    EXECUTE 'SELECT faction_id FROM aurora.npc_groups_visible';
    RAISE EXCEPTION 'FAIL: anon selected faction_id from the public view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the public view has no faction_id column';
  END;
  BEGIN
    EXECUTE 'SELECT sensitive FROM aurora.npc_groups_visible';
    RAISE EXCEPTION 'FAIL: anon selected sensitive from the public view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the public view has no sensitive column';
  END;
  BEGIN
    EXECUTE 'SELECT source FROM aurora.npc_groups_visible';
    RAISE EXCEPTION 'FAIL: anon selected source from the public view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the public view has no source column';
  END;
  BEGIN
    EXECUTE 'SELECT encounter FROM aurora.npc_groups_public()';
    RAISE EXCEPTION 'FAIL: anon selected encounter from npc_groups_public()';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS npc_groups_public() has no encounter column';
  END;

  IF EXISTS (SELECT 1 FROM aurora.npc_groups_visible v
              WHERE to_jsonb(v)::text LIKE '%secret-%' OR to_jsonb(v)::text LIKE '%raid%'
                 OR to_jsonb(v)::text LIKE '%assassination%') THEN
    RAISE EXCEPTION 'FAIL: a faction id or an encounter appears in the public rows';
  END IF;
  RAISE NOTICE 'PASS no faction id and no encounter appears anywhere in the public rows';

  -- The columns the map draws.
  PERFORM server_id, group_id, faction_name, stance, size, x, y, z, active, t FROM aurora.npc_groups_visible LIMIT 1;
  IF (SELECT faction_name FROM aurora.npc_groups_visible WHERE group_id = 'squad:1' AND server_id = 'test-npc') <> 'Road Raiders'
     OR (SELECT stance FROM aurora.npc_groups_visible WHERE group_id = 'squad:2' AND server_id = 'test-npc') <> 'friendly'
     OR (SELECT size FROM aurora.npc_groups_visible WHERE group_id = 'squad:1' AND server_id = 'test-npc') <> 3
     OR (SELECT x FROM aurora.npc_groups_visible WHERE group_id = 'squad:1' AND server_id = 'test-npc') <> 100
     OR (SELECT active FROM aurora.npc_groups_visible WHERE group_id = 'squad:1' AND server_id = 'test-npc') IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: the public columns do not carry the stored values';
  END IF;
  RAISE NOTICE 'PASS the public columns carry faction name, stance, size, position and active';

  -- Outposts.
  SELECT count(*) INTO n FROM aurora.npc_outposts_visible WHERE server_id = 'test-npc';
  IF n <> 3 THEN RAISE EXCEPTION 'FAIL: anon sees % outposts, expected 3 (site 1, 5, 6)', n; END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:2') THEN
    RAISE EXCEPTION 'FAIL: a hidden outpost is on the public view';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:3') THEN
    RAISE EXCEPTION 'FAIL: an expired outpost is on the public view';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:4') THEN
    RAISE EXCEPTION 'FAIL: an outpost not seen for 31 minutes is on the public view';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:5') THEN
    RAISE EXCEPTION 'FAIL: an outpost seen 29 minutes ago is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:6') THEN
    RAISE EXCEPTION 'FAIL: an outpost in state unknown is missing';
  END IF;
  RAISE NOTICE 'PASS hidden, expired and stale outposts are not public; fresh ones are';

  IF (SELECT hostile FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:1' AND server_id = 'test-npc') IS NOT TRUE
     OR (SELECT x2 FROM aurora.npc_outposts_visible WHERE outpost_id = 'site:1' AND server_id = 'test-npc') <> 40 THEN
    RAISE EXCEPTION 'FAIL: the outpost columns do not carry the stored values';
  END IF;
  BEGIN
    EXECUTE 'SELECT hidden FROM aurora.npc_outposts_visible';
    RAISE EXCEPTION 'FAIL: anon selected hidden from the outpost view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the outpost view has no hidden column';
  END;
  BEGIN
    EXECUTE 'SELECT faction_id FROM aurora.npc_outposts_visible';
    RAISE EXCEPTION 'FAIL: anon selected faction_id from the outpost view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the outpost view has no faction_id column';
  END;
  BEGIN
    EXECUTE 'SELECT state FROM aurora.npc_outposts_visible';
    RAISE EXCEPTION 'FAIL: anon selected state from the outpost view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the outpost view has no state column';
  END;

  -- The tables themselves.
  BEGIN
    EXECUTE 'SELECT group_id FROM aurora.npc_groups';
    RAISE EXCEPTION 'FAIL: anon read aurora.npc_groups';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read aurora.npc_groups';
  END;
  BEGIN
    EXECUTE 'SELECT outpost_id FROM aurora.npc_outposts';
    RAISE EXCEPTION 'FAIL: anon read aurora.npc_outposts';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot read aurora.npc_outposts';
  END;
  BEGIN
    EXECUTE 'SELECT * FROM aurora.npc_groups';
    RAISE EXCEPTION 'FAIL: anon ran SELECT * on npc_groups';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'INSERT INTO aurora.npc_groups (server_id, group_id) VALUES (''test-npc'', ''evil'')';
    RAISE EXCEPTION 'FAIL: anon wrote to npc_groups';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot write npc_groups';
  END;
  BEGIN
    EXECUTE 'UPDATE aurora.npc_groups SET sensitive = FALSE';
    RAISE EXCEPTION 'FAIL: anon updated npc_groups';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'DELETE FROM aurora.npc_outposts';
    RAISE EXCEPTION 'FAIL: anon deleted from npc_outposts';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot update or delete the tables';
  END;

  -- The functions.
  BEGIN
    PERFORM * FROM aurora.npc_groups_admin('test-npc');
    RAISE EXCEPTION 'FAIL: anon ran npc_groups_admin';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run npc_groups_admin';
  END;
  BEGIN
    PERFORM * FROM aurora.npc_outposts_admin('test-npc');
    RAISE EXCEPTION 'FAIL: anon ran npc_outposts_admin';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run npc_outposts_admin';
  END;
  BEGIN
    PERFORM aurora.prune_npcs();
    RAISE EXCEPTION 'FAIL: anon ran prune_npcs';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS anon cannot run prune_npcs';
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- 2. AUTHENTICATED (not an admin): the same public surface, and zero admin rows
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF (SELECT count(*) FROM aurora.npc_groups_visible WHERE server_id = 'test-npc') <> 2 THEN
    RAISE EXCEPTION 'FAIL: a signed-in user should see the same 2 groups';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_outposts_visible WHERE server_id = 'test-npc') <> 3 THEN
    RAISE EXCEPTION 'FAIL: a signed-in user should see the same 3 outposts';
  END IF;
  RAISE NOTICE 'PASS a signed-in user sees the same public groups and outposts';

  IF (SELECT count(*) FROM aurora.npc_groups_admin('test-npc')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a non-admin got rows from npc_groups_admin';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_outposts_admin('test-npc')) <> 0 THEN
    RAISE EXCEPTION 'FAIL: a non-admin got rows from npc_outposts_admin';
  END IF;
  RAISE NOTICE 'PASS a signed-in non-admin gets 0 rows from both admin functions';

  BEGIN
    EXECUTE 'SELECT group_id FROM aurora.npc_groups';
    RAISE EXCEPTION 'FAIL: authenticated read aurora.npc_groups';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'SELECT outpost_id FROM aurora.npc_outposts';
    RAISE EXCEPTION 'FAIL: authenticated read aurora.npc_outposts';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'SELECT encounter FROM aurora.npc_groups_visible';
    RAISE EXCEPTION 'FAIL: authenticated selected encounter from the public view';
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;
  BEGIN
    PERFORM aurora.prune_npcs();
    RAISE EXCEPTION 'FAIL: authenticated ran prune_npcs';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  RAISE NOTICE 'PASS a signed-in user cannot read the tables, the private columns or prune';
END $$;

RESET ROLE;

-- ============================================================================
-- 3. ADMIN: sees everything
-- ============================================================================

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM aurora.npc_groups_admin('test-npc');
  IF n <> 3 THEN RAISE EXCEPTION 'FAIL: the admin sees % groups, expected 3 (squad:1, squad:2, group:3)', n; END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-npc') WHERE group_id = 'group:3' AND sensitive AND encounter = 'raid') THEN
    RAISE EXCEPTION 'FAIL: the admin does not see the sensitive raid group with its encounter';
  END IF;
  RAISE NOTICE 'PASS the admin sees sensitive groups, with their encounter';

  IF EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-npc') WHERE group_id IN ('actor:4', 'actor:5')) THEN
    RAISE EXCEPTION 'FAIL: the admin list holds a group not seen for 3 minutes';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-npc') a WHERE a.server_id <> 'test-npc') THEN
    RAISE EXCEPTION 'FAIL: the admin list crossed servers';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-npc') WHERE faction_id = 'secret-faction-1' AND source = 'actor') THEN
    RAISE EXCEPTION 'FAIL: the admin list lacks faction_id or source';
  END IF;
  RAISE NOTICE 'PASS the admin list is one server, last 3 minutes, with every column';

  SELECT count(*) INTO n FROM aurora.npc_outposts_admin('test-npc');
  IF n <> 6 THEN RAISE EXCEPTION 'FAIL: the admin sees % outposts, expected all 6', n; END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_outposts_admin('test-npc') WHERE outpost_id = 'site:2' AND hidden) THEN
    RAISE EXCEPTION 'FAIL: the admin does not see the hidden outpost';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_outposts_admin('test-npc') WHERE outpost_id = 'site:3' AND state = 'expired') THEN
    RAISE EXCEPTION 'FAIL: the admin does not see the expired outpost';
  END IF;
  RAISE NOTICE 'PASS the admin sees every outpost, hidden and expired ones included';

  -- An admin reading the PUBLIC view still gets the public rows: admin power is the RPC, not the view.
  IF (SELECT count(*) FROM aurora.npc_groups_visible WHERE server_id = 'test-npc') <> 2 THEN
    RAISE EXCEPTION 'FAIL: the public view shows an admin more than it shows anyone';
  END IF;
  RAISE NOTICE 'PASS the public view is the same for an admin';

  BEGIN
    EXECUTE 'SELECT group_id FROM aurora.npc_groups';
    RAISE EXCEPTION 'FAIL: an admin read the raw table (it is for service_role only)';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS even an admin reads through the function, not the table';
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- 4. SERVICE ROLE: owns every write
-- ============================================================================

SET LOCAL ROLE service_role;

DO $$
BEGIN
  INSERT INTO aurora.npc_groups (server_id, group_id) VALUES ('test-npc', 'svc:1');
  UPDATE aurora.npc_groups SET size = 7 WHERE group_id = 'svc:1';
  IF (SELECT size FROM aurora.npc_groups WHERE group_id = 'svc:1') <> 7 THEN
    RAISE EXCEPTION 'FAIL: service_role could not write npc_groups';
  END IF;
  DELETE FROM aurora.npc_groups WHERE group_id = 'svc:1';
  INSERT INTO aurora.npc_outposts (server_id, outpost_id) VALUES ('test-npc', 'svc:2');
  DELETE FROM aurora.npc_outposts WHERE outpost_id = 'svc:2';
  RAISE NOTICE 'PASS service_role can insert, update and delete both tables';
END $$;

RESET ROLE;

-- ============================================================================
-- 5. FAIL CLOSED: a row that says nothing is not public
-- ============================================================================

INSERT INTO aurora.npc_groups (server_id, group_id, faction_name, stance, x, y, z) VALUES
  ('test-npc', 'bare:1', 'Bare', 'neutral', 1, 1, 0);
INSERT INTO aurora.npc_outposts (server_id, outpost_id, faction_name, stance, x1, y1, x2, y2, z) VALUES
  ('test-npc', 'bare:2', 'Bare', 'neutral', 1, 1, 2, 2, 0);

DO $$
BEGIN
  IF NOT (SELECT sensitive FROM aurora.npc_groups WHERE group_id = 'bare:1') THEN
    RAISE EXCEPTION 'FAIL: a group inserted without a sensitive value is not sensitive';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups_public() WHERE group_id = 'bare:1') THEN
    RAISE EXCEPTION 'FAIL: a group that never said it was safe is public';
  END IF;
  IF NOT (SELECT hidden FROM aurora.npc_outposts WHERE outpost_id = 'bare:2') THEN
    RAISE EXCEPTION 'FAIL: an outpost inserted without a hidden value is not hidden';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts_public() WHERE outpost_id = 'bare:2') THEN
    RAISE EXCEPTION 'FAIL: an outpost that never said it was safe is public';
  END IF;
  RAISE NOTICE 'PASS a row that does not say it is safe is not public';
END $$;

-- ============================================================================
-- 6. PRUNE
-- ============================================================================

INSERT INTO aurora.npc_groups (server_id, group_id, sensitive, t) VALUES
  ('test-npc', 'p:old',    FALSE, NOW() - INTERVAL '11 minutes'),   -- goes
  ('test-npc', 'p:oldsen', TRUE,  NOW() - INTERVAL '30 minutes'),   -- goes
  ('test-npc', 'p:young',  FALSE, NOW() - INTERVAL '9 minutes'),    -- stays
  ('test-npc', 'p:half',   FALSE, NOW() - INTERVAL '30 seconds');   -- stays, even when the limit is zero (NOW() is constant in a transaction, so a fresh row needs an age to tell a floor from none)
INSERT INTO aurora.npc_outposts (server_id, outpost_id, hidden, t) VALUES
  ('test-npc', 'p:old',    FALSE, NOW() - INTERVAL '121 minutes'),  -- goes
  ('test-npc', 'p:young',  FALSE, NOW() - INTERVAL '119 minutes'),  -- stays (a 31-minute rule would take it)
  ('test-npc', 'p:midage', FALSE, NOW() - INTERVAL '60 minutes'),   -- stays
  ('test-npc', 'p:half',   FALSE, NOW() - INTERVAL '30 seconds');   -- stays

UPDATE aurora.npc_groups   SET seen_at = t WHERE group_id LIKE 'p:%';
UPDATE aurora.npc_outposts SET seen_at = t WHERE outpost_id LIKE 'p:%';

DO $$
DECLARE
  n int;
  groups_before int := (SELECT count(*) FROM aurora.npc_groups);
BEGIN
  SELECT aurora.prune_npcs(10, 120) INTO n;
  -- groups: p:old, p:oldsen, actor:4, actor:5 (4 minutes: no, those are under 10) -> p:old, p:oldsen = 2;
  -- outposts: p:old, site:4? (31 minutes: no, under 120) -> p:old = 1.
  IF n <> 3 THEN RAISE EXCEPTION 'FAIL: prune deleted % rows, expected 3', n; END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups WHERE group_id IN ('p:old', 'p:oldsen')) THEN
    RAISE EXCEPTION 'FAIL: a group unseen for over 10 minutes survived the prune';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups WHERE group_id = 'p:young') THEN
    RAISE EXCEPTION 'FAIL: prune deleted a group seen 9 minutes ago';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts WHERE outpost_id = 'p:old') THEN
    RAISE EXCEPTION 'FAIL: an outpost unseen for over 2 hours survived the prune';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_outposts WHERE server_id = 'test-npc' AND outpost_id IN ('p:young', 'p:midage', 'site:4')) <> 3 THEN
    RAISE EXCEPTION 'FAIL: prune deleted an outpost seen within 2 hours';
  END IF;
  RAISE NOTICE 'PASS prune takes groups unseen 10 minutes and outposts unseen 2 hours, nothing fresher';

  IF (SELECT count(*) FROM aurora.npc_groups WHERE server_id = 'test-npc' AND group_id IN ('squad:1', 'squad:2', 'group:3')) <> 3 THEN
    RAISE EXCEPTION 'FAIL: prune deleted a FRESH group';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_outposts WHERE server_id = 'test-npc' AND outpost_id IN ('site:1', 'site:2', 'site:3', 'site:5', 'site:6')) <> 5 THEN
    RAISE EXCEPTION 'FAIL: prune deleted a FRESH outpost';
  END IF;
  RAISE NOTICE 'PASS prune never touches fresh rows';

  -- A limit of zero or less is floored at 1 minute: it cannot empty the tables.
  SELECT aurora.prune_npcs(0, -5) INTO n;
  IF (SELECT count(*) FROM aurora.npc_groups WHERE server_id = 'test-npc' AND group_id = 'p:half') <> 1
     OR (SELECT count(*) FROM aurora.npc_outposts WHERE server_id = 'test-npc' AND outpost_id = 'p:half') <> 1 THEN
    RAISE EXCEPTION 'FAIL: prune_npcs(0, -5) deleted a row seen 30 seconds ago (no floor)';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_groups WHERE server_id = 'test-npc' AND group_id IN ('squad:1', 'group:3')) <> 2 THEN
    RAISE EXCEPTION 'FAIL: prune_npcs(0, -5) deleted fresh rows';
  END IF;
  IF (SELECT count(*) FROM aurora.npc_outposts WHERE server_id = 'test-npc' AND outpost_id = 'site:1') <> 1 THEN
    RAISE EXCEPTION 'FAIL: prune_npcs(0, -5) deleted a fresh outpost';
  END IF;
  RAISE NOTICE 'PASS a zero or negative limit is floored, so it cannot empty the tables';

  SELECT aurora.prune_npcs(NULL, NULL) INTO n;
  IF (SELECT count(*) FROM aurora.npc_groups WHERE server_id = 'test-npc' AND group_id = 'squad:1') <> 1 THEN
    RAISE EXCEPTION 'FAIL: prune_npcs(NULL, NULL) deleted a fresh group';
  END IF;
  RAISE NOTICE 'PASS NULL limits fall back to the defaults';
END $$;

-- ============================================================================
-- 8. CLOCK SKEW: freshness is seen_at (the ingest's clock), never t (the game's)
-- ============================================================================

INSERT INTO aurora.servers (id, name, last_seen) VALUES ('test-skew', 'Skew Server', NOW());

INSERT INTO aurora.npc_groups (server_id, group_id, faction_name, sensitive, t, seen_at) VALUES
  ('test-skew', 'oldt',  'Skewed A', FALSE, NOW() - INTERVAL '1 day',    NOW()),                        -- game clock a day behind: SHOWN
  ('test-skew', 'newt',  'Skewed B', FALSE, NOW(),                       NOW() - INTERVAL '1 hour'),    -- fresh t, stale seen_at: HIDDEN
  ('test-skew', 'oldts', 'Skewed C', TRUE,  NOW() - INTERVAL '1 day',    NOW());                        -- sensitive stays hidden whatever the clocks say
INSERT INTO aurora.npc_outposts (server_id, outpost_id, faction_name, hidden, state, t, seen_at) VALUES
  ('test-skew', 'oldt', 'Skewed A', FALSE, 'built', NOW() - INTERVAL '2 days', NOW()),
  ('test-skew', 'newt', 'Skewed B', FALSE, 'built', NOW(),                     NOW() - INTERVAL '3 hours');

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '', TRUE);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE server_id = 'test-skew' AND group_id = 'oldt') THEN
    RAISE EXCEPTION 'FAIL: a group with an old t but a fresh seen_at is hidden';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE server_id = 'test-skew' AND group_id = 'newt') THEN
    RAISE EXCEPTION 'FAIL: a group with a fresh t but a stale seen_at is visible';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups_visible WHERE server_id = 'test-skew' AND group_id = 'oldts') THEN
    RAISE EXCEPTION 'FAIL: a sensitive group is visible';
  END IF;
  RAISE NOTICE 'PASS a group is visible by seen_at, not t';
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE server_id = 'test-skew' AND outpost_id = 'oldt') THEN
    RAISE EXCEPTION 'FAIL: an outpost with an old t but a fresh seen_at is hidden';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts_visible WHERE server_id = 'test-skew' AND outpost_id = 'newt') THEN
    RAISE EXCEPTION 'FAIL: an outpost with a fresh t but a stale seen_at is visible';
  END IF;
  RAISE NOTICE 'PASS an outpost is visible by seen_at, not t';
  -- The view still carries t (the map contract), and not seen_at.
  PERFORM t FROM aurora.npc_groups_visible LIMIT 1;
  BEGIN
    EXECUTE 'SELECT seen_at FROM aurora.npc_groups_visible';
    RAISE EXCEPTION 'FAIL: seen_at is in the public view';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'PASS the view keeps t and has no seen_at column';
  END;
END $$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}', TRUE);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-skew') WHERE group_id = 'oldt')
     OR NOT EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-skew') WHERE group_id = 'oldts') THEN
    RAISE EXCEPTION 'FAIL: the admin list misses a group with a fresh seen_at';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups_admin('test-skew') WHERE group_id = 'newt') THEN
    RAISE EXCEPTION 'FAIL: the admin list holds a group with a stale seen_at';
  END IF;
  IF (SELECT seen_at FROM aurora.npc_groups_admin('test-skew') WHERE group_id = 'oldt') IS NULL THEN
    RAISE EXCEPTION 'FAIL: the admin list lacks seen_at';
  END IF;
  RAISE NOTICE 'PASS the admin list is judged on seen_at and carries it';
END $$;

RESET ROLE;

DO $$
DECLARE
  n int;
BEGIN
  SELECT aurora.prune_npcs(10, 120) INTO n;
  IF EXISTS (SELECT 1 FROM aurora.npc_groups WHERE server_id = 'test-skew' AND group_id = 'newt') THEN
    RAISE EXCEPTION 'FAIL: prune kept a group whose seen_at is an hour old';
  END IF;
  IF EXISTS (SELECT 1 FROM aurora.npc_outposts WHERE server_id = 'test-skew' AND outpost_id = 'newt') THEN
    RAISE EXCEPTION 'FAIL: prune kept an outpost whose seen_at is 3 hours old';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM aurora.npc_groups WHERE server_id = 'test-skew' AND group_id = 'oldt')
     OR NOT EXISTS (SELECT 1 FROM aurora.npc_outposts WHERE server_id = 'test-skew' AND outpost_id = 'oldt') THEN
    RAISE EXCEPTION 'FAIL: prune deleted a row with an old t but a fresh seen_at';
  END IF;
  RAISE NOTICE 'PASS prune is judged on seen_at, not t';
END $$;

-- ============================================================================
-- 7. THE SERVER ROW GOES, THE NPC ROWS GO WITH IT
-- ============================================================================

DO $$
BEGIN
  DELETE FROM aurora.servers WHERE id = 'test-npc2';
  IF EXISTS (SELECT 1 FROM aurora.npc_groups WHERE server_id = 'test-npc2')
     OR EXISTS (SELECT 1 FROM aurora.npc_outposts WHERE server_id = 'test-npc2') THEN
    RAISE EXCEPTION 'FAIL: NPC rows outlived their server';
  END IF;
  RAISE NOTICE 'PASS NPC rows cascade with their server';
END $$;

DO $$ BEGIN RAISE NOTICE 'ALL NPC TESTS PASSED'; END $$;

ROLLBACK;
