-- Migration 042: skill level records, and every per-character record both all-time and alive
-- Created: 2026-10-19 (T80)
-- Description: the owner asked for "Total skill levels" on the Season 1 records, both
--   "All-Time and presently Alive", and made that a standard for every per-character
--   record. Exporter 0.7.5 adds pos.sk: the sum of the character's level in every skill
--   the server knows (PerkFactory.PerkList without the categories, so modded skills
--   count). The importer sends it to observe_lives with hs and zk.
--   Depends on 034 (lives, observe_lives, season_records). Redefines those two functions
--   whole: every line of 034's bodies is kept and the sk lines are added.
--
-- What it adds:
--
--   aurora.lives.skills       the best total this life reached (a running maximum).
--   aurora.lives.skills_now   the newest sample's total, skills_at its time. A total can
--   aurora.lives.skills_at    FALL (Strength and Fitness decay), so the living record
--                             reads skills_now, not the maximum.
--   sk never opens a new life: a falling total is decay, not a new character.
--   season_records gains four keys, each always present (null when nobody holds it):
--     most_skills_one_life  {name, skills, life_no, alive}  best skills of any life
--     most_skills_alive     {name, skills, life_no}         best skills_now among the living
--     most_kills_alive      {name, kills, life_no}          most kills among the living
--     longest_life_alive    {name, hours, started_at}       longest life among the living
--   "Alive" is 034's rule: the life is open and the player is not marked dead. A holder
--   needs a positive value. Ties: the earlier time (skills_at, started_at), then username.
--
-- Skills count only from the day exporter 0.7.5 runs on the server: there is no history.
-- ORDER: after 034 (035-041 do not touch these functions). Safe to run twice.
-- Run it as postgres (the SQL editor), then: NOTIFY pgrst, 'reload schema';

ALTER TABLE aurora.lives ADD COLUMN IF NOT EXISTS skills     INT NULL;
ALTER TABLE aurora.lives ADD COLUMN IF NOT EXISTS skills_now INT NULL;
ALTER TABLE aurora.lives ADD COLUMN IF NOT EXISTS skills_at  TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS lives_server_world_skills_idx ON aurora.lives (server_id, world_id, skills DESC);

COMMENT ON COLUMN aurora.lives.skills IS
  'The best total skill level this life reached (042, pos.sk from exporter 0.7.5): a running maximum. NULL until a sample carries sk.';
COMMENT ON COLUMN aurora.lives.skills_now IS
  'The newest sample''s total skill level (042); skills_at is its time. Skills can fall (Strength, Fitness), so the living record reads this.';
COMMENT ON COLUMN aurora.lives.skills_at IS
  'The time of the sample skills_now came from (042).';

-- observe_lives: 034's body plus sk.
CREATE OR REPLACE FUNCTION aurora.observe_lives(p_server TEXT, p_world TEXT, p_rows JSONB)
RETURNS INT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_world TEXT;
  r       RECORD;
  v_last  aurora.lives%ROWTYPE;
  v_has   BOOLEAN;
  v_death_t  TIMESTAMPTZ;
  v_death_hs REAL;
  v_n     INT := 0;
BEGIN
  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN 0;
  END IF;
  v_world := COALESCE(p_world, (SELECT s.current_world_id FROM aurora.servers s WHERE s.id = p_server));

  FOR r IN
    SELECT NULLIF(btrim(e->>'username'), '') AS username,
           CASE WHEN jsonb_typeof(e->'t') = 'string' THEN (e->>'t')::timestamptz END AS t,
           CASE WHEN jsonb_typeof(e->'hs') = 'number' AND (e->>'hs')::numeric >= 0
                THEN (e->>'hs')::real END AS hs,
           CASE WHEN jsonb_typeof(e->'zk') = 'number' AND (e->>'zk')::numeric >= 0
                     AND (e->>'zk')::numeric = trunc((e->>'zk')::numeric)
                     AND (e->>'zk')::numeric < 2147483647
                THEN (e->>'zk')::numeric::int END AS zk,
           CASE WHEN jsonb_typeof(e->'sk') = 'number' AND (e->>'sk')::numeric >= 0
                     AND (e->>'sk')::numeric = trunc((e->>'sk')::numeric)
                     AND (e->>'sk')::numeric < 2147483647
                THEN (e->>'sk')::numeric::int END AS sk
      FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS a(e, i)
     WHERE jsonb_typeof(e) = 'object'
     ORDER BY a.i
  LOOP
    CONTINUE WHEN r.username IS NULL OR r.t IS NULL OR (r.hs IS NULL AND r.zk IS NULL AND r.sk IS NULL);

    SELECT l.* INTO v_last
      FROM aurora.lives l
     WHERE l.server_id = p_server AND l.username = r.username
     ORDER BY l.life_no DESC
     LIMIT 1
     FOR UPDATE;
    v_has := FOUND;

    -- A death already stored between the open life's start and this sample (a
    -- backfill writes a file's deaths before its samples) ended that life.
    v_death_t := NULL;
    v_death_hs := NULL;
    IF v_has AND v_last.ended_at IS NULL AND r.t > v_last.started_at THEN
      SELECT d.t, d.hours_survived INTO v_death_t, v_death_hs
        FROM aurora.deaths d
       WHERE d.server_id = p_server
         AND d.username = r.username
         AND d.t >= v_last.started_at
         AND d.t < r.t
       ORDER BY d.t
       LIMIT 1;
    END IF;

    IF v_has AND r.t < v_last.started_at THEN
      UPDATE aurora.lives l
         SET skills = GREATEST(l.skills, r.sk),
             skills_now = CASE WHEN r.sk IS NOT NULL AND (l.skills_at IS NULL OR r.t >= l.skills_at)
                               THEN r.sk ELSE l.skills_now END,
             skills_at  = CASE WHEN r.sk IS NOT NULL AND (l.skills_at IS NULL OR r.t >= l.skills_at)
                               THEN r.t ELSE l.skills_at END,
             kills = GREATEST(l.kills, COALESCE(r.zk, l.kills)),
             hours = GREATEST(l.hours, COALESCE(r.hs, l.hours))
       WHERE l.server_id = p_server
         AND l.username = r.username
         AND l.life_no = (SELECT max(m.life_no) FROM aurora.lives m
                           WHERE m.server_id = p_server AND m.username = r.username AND m.started_at <= r.t)
         AND (l.ended_at IS NULL OR l.ended_at >= r.t);
    ELSIF v_has AND v_last.ended_at IS NOT NULL AND v_last.ended_at >= r.t THEN
      UPDATE aurora.lives l
         SET skills = GREATEST(l.skills, r.sk),
             skills_now = CASE WHEN r.sk IS NOT NULL AND (l.skills_at IS NULL OR r.t >= l.skills_at)
                               THEN r.sk ELSE l.skills_now END,
             skills_at  = CASE WHEN r.sk IS NOT NULL AND (l.skills_at IS NULL OR r.t >= l.skills_at)
                               THEN r.t ELSE l.skills_at END,
             kills = GREATEST(l.kills, COALESCE(r.zk, l.kills)),
             hours = GREATEST(l.hours, COALESCE(r.hs, l.hours)),
             first_kill_at = CASE WHEN l.first_kill_at IS NULL AND r.zk > 0 THEN r.t ELSE l.first_kill_at END
       WHERE l.server_id = p_server AND l.username = r.username AND l.life_no = v_last.life_no;
    ELSIF v_has AND v_last.ended_at IS NULL
          AND v_death_t IS NULL
          AND v_last.world_id IS NOT DISTINCT FROM v_world
          AND (r.zk IS NULL OR r.zk >= v_last.kills)
          AND (r.hs IS NULL OR r.hs >= v_last.hours - 0.5) THEN
      UPDATE aurora.lives l
         SET skills = GREATEST(l.skills, r.sk),
             skills_now = CASE WHEN r.sk IS NOT NULL AND (l.skills_at IS NULL OR r.t >= l.skills_at)
                               THEN r.sk ELSE l.skills_now END,
             skills_at  = CASE WHEN r.sk IS NOT NULL AND (l.skills_at IS NULL OR r.t >= l.skills_at)
                               THEN r.t ELSE l.skills_at END,
             kills = GREATEST(l.kills, COALESCE(r.zk, l.kills)),
             hours = GREATEST(l.hours, COALESCE(r.hs, l.hours)),
             first_kill_at = CASE WHEN l.first_kill_at IS NULL AND r.zk > 0 THEN r.t ELSE l.first_kill_at END
       WHERE l.server_id = p_server AND l.username = r.username AND l.life_no = v_last.life_no;
    ELSE
      IF v_has AND v_last.ended_at IS NULL THEN
        UPDATE aurora.lives l
           SET ended_at = COALESCE(v_death_t, r.t),
               hours    = GREATEST(l.hours, COALESCE(v_death_hs, l.hours))
         WHERE l.server_id = p_server AND l.username = r.username AND l.life_no = v_last.life_no;
      END IF;
      INSERT INTO aurora.lives (server_id, world_id, username, life_no, started_at, kills, hours, first_kill_at,
                                skills, skills_now, skills_at)
      VALUES (p_server, v_world, r.username,
              CASE WHEN v_has THEN v_last.life_no + 1 ELSE 1 END,
              r.t, COALESCE(r.zk, 0), COALESCE(r.hs, 0),
              CASE WHEN r.zk > 0 THEN r.t END,
              r.sk, r.sk, CASE WHEN r.sk IS NOT NULL THEN r.t END);
    END IF;
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION aurora.observe_lives(TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aurora.observe_lives(TEXT, TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION aurora.observe_lives(TEXT, TEXT, JSONB) IS
  'Importer (034, 042): applies pos samples {username, t, hs, zk, sk} in array order to aurora.lives (rules in 034; sk folds into skills as a maximum and into skills_now/skills_at as the newest, and never opens a life). p_world NULL means the server''s current world. Returns the number of rows applied. service_role.';

-- season_records: 034's body plus four keys.
CREATE OR REPLACE FUNCTION aurora.season_records(p_server TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cur     TEXT;
  v_seq     INT;
  v_started TIMESTAMPTZ;
  v_kill    JSONB;
BEGIN
  SELECT s.current_world_id INTO v_cur FROM aurora.servers s WHERE s.id = p_server;
  IF v_cur IS NOT NULL THEN
    SELECT w.seq, w.started_at INTO v_seq, v_started
      FROM aurora.worlds w
     WHERE w.server_id = p_server AND w.world_id = v_cur;
  END IF;

  -- The earliest kill event: one index probe per tag (the world, and untagged).
  SELECT jsonb_build_object(
           'name', COALESCE(NULLIF(btrim(p.display_name), ''), e.username),
           't', e.t, 'x', e.x, 'y', e.y)
    INTO v_kill
    FROM (
      (SELECT k.username, k.t, k.x, k.y FROM aurora.kill_events k
        WHERE k.server_id = p_server AND k.world_id = v_cur
        ORDER BY k.t, k.username LIMIT 1)
      UNION ALL
      (SELECT k.username, k.t, k.x, k.y FROM aurora.kill_events k
        WHERE k.server_id = p_server AND k.world_id IS NULL
        ORDER BY k.t, k.username LIMIT 1)
    ) e
    LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = e.username
   ORDER BY e.t, e.username
   LIMIT 1;

  IF v_kill IS NULL THEN
    SELECT jsonb_build_object(
             'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
             't', l.first_kill_at, 'x', NULL, 'y', NULL)
      INTO v_kill
      FROM aurora.lives l
      LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username
     WHERE l.server_id = p_server
       AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
       AND l.first_kill_at IS NOT NULL
     ORDER BY l.first_kill_at, l.username
     LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'world_seq', v_seq,
    'world_started_at', v_started,
    'first_death', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), d.username),
               't', d.t, 'x', d.x, 'y', d.y,
               'hours_survived', round(d.hours_survived::numeric, 1))
        FROM aurora.deaths d
        LEFT JOIN aurora.players p ON p.server_id = d.server_id AND p.username = d.username
       WHERE d.server_id = p_server
         AND COALESCE(d.world_id, v_cur) IS NOT DISTINCT FROM v_cur
       ORDER BY d.t, d.username
       LIMIT 1),
    'first_kill', v_kill,
    'most_kills_season', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), s.username),
               'kills', s.kills)
        FROM (SELECT l.username, sum(l.kills)::BIGINT AS kills
                FROM aurora.lives l
               WHERE l.server_id = p_server
                 AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
               GROUP BY l.username
              HAVING sum(l.kills) > 0
               ORDER BY 2 DESC, 1
               LIMIT 1) s
        LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = s.username),
    -- The top life is picked from the (server_id, world_id, kills|hours DESC) index,
    -- one probe per tag, and only that row is joined to players.
    'most_kills_one_life', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
               'kills', l.kills,
               'life_no', l.life_no,
               'alive', (l.ended_at IS NULL AND p.is_dead IS NOT TRUE))
        FROM (SELECT c.* FROM (
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id = v_cur AND x.kills > 0
                  ORDER BY x.kills DESC, x.started_at, x.username LIMIT 1)
                UNION ALL
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id IS NULL AND x.kills > 0
                  ORDER BY x.kills DESC, x.started_at, x.username LIMIT 1)) c
              ORDER BY c.kills DESC, c.started_at, c.username
              LIMIT 1) l
        LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username),
    'longest_life', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
               'hours', round(l.hours::numeric, 1),
               'alive', (l.ended_at IS NULL AND p.is_dead IS NOT TRUE),
               'started_at', l.started_at)
        FROM (SELECT c.* FROM (
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id = v_cur AND x.hours > 0
                  ORDER BY x.hours DESC, x.started_at, x.username LIMIT 1)
                UNION ALL
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id IS NULL AND x.hours > 0
                  ORDER BY x.hours DESC, x.started_at, x.username LIMIT 1)) c
              ORDER BY c.hours DESC, c.started_at, c.username
              LIMIT 1) l
        LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username),
    -- 042: skills, and every per-character record also among the living (owner standard
    -- 2026-10-19). "Alive" is 034's rule: an open life of a player not marked dead.
    'most_skills_one_life', (
      SELECT jsonb_build_object(
               'name', COALESCE(NULLIF(btrim(p.display_name), ''), l.username),
               'skills', l.skills,
               'life_no', l.life_no,
               'alive', (l.ended_at IS NULL AND p.is_dead IS NOT TRUE))
        FROM (SELECT c.* FROM (
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id = v_cur AND x.skills > 0
                  ORDER BY x.skills DESC, x.started_at, x.username LIMIT 1)
                UNION ALL
                (SELECT x.* FROM aurora.lives x
                  WHERE x.server_id = p_server AND x.world_id IS NULL AND x.skills > 0
                  ORDER BY x.skills DESC, x.started_at, x.username LIMIT 1)) c
              ORDER BY c.skills DESC, c.started_at, c.username
              LIMIT 1) l
        LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username),
    'most_skills_alive', (
      SELECT jsonb_build_object('name', a.name, 'skills', a.skills_now, 'life_no', a.life_no)
        FROM (SELECT COALESCE(NULLIF(btrim(p.display_name), ''), l.username) AS name,
                     l.skills_now, l.life_no, l.skills_at, l.username
                FROM aurora.lives l
                LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username
               WHERE l.server_id = p_server
                 AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
                 AND l.ended_at IS NULL AND p.is_dead IS NOT TRUE
                 AND l.skills_now > 0) a
       ORDER BY a.skills_now DESC, a.skills_at, a.username
       LIMIT 1),
    'most_kills_alive', (
      SELECT jsonb_build_object('name', a.name, 'kills', a.kills, 'life_no', a.life_no)
        FROM (SELECT COALESCE(NULLIF(btrim(p.display_name), ''), l.username) AS name,
                     l.kills, l.life_no, l.started_at, l.username
                FROM aurora.lives l
                LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username
               WHERE l.server_id = p_server
                 AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
                 AND l.ended_at IS NULL AND p.is_dead IS NOT TRUE
                 AND l.kills > 0) a
       ORDER BY a.kills DESC, a.started_at, a.username
       LIMIT 1),
    'longest_life_alive', (
      SELECT jsonb_build_object('name', a.name, 'hours', round(a.hours::numeric, 1), 'started_at', a.started_at)
        FROM (SELECT COALESCE(NULLIF(btrim(p.display_name), ''), l.username) AS name,
                     l.hours, l.started_at, l.username
                FROM aurora.lives l
                LEFT JOIN aurora.players p ON p.server_id = l.server_id AND p.username = l.username
               WHERE l.server_id = p_server
                 AND COALESCE(l.world_id, v_cur) IS NOT DISTINCT FROM v_cur
                 AND l.ended_at IS NULL AND p.is_dead IS NOT TRUE
                 AND l.hours > 0) a
       ORDER BY a.hours DESC, a.started_at, a.username
       LIMIT 1),
    'biggest_faction', (
      SELECT jsonb_build_object(
               'name', f.name,
               'tag', f.tag,
               'owner_name', COALESCE(NULLIF(btrim(p.display_name), ''), f.owner),
               'members', f.n)
        FROM (SELECT x.name, x.tag, x.owner,
                     (SELECT count(DISTINCT m) FROM unnest(x.members || ARRAY[x.owner]) AS u(m)
                       WHERE m IS NOT NULL AND btrim(m) <> '') AS n
                FROM aurora.factions x
               WHERE x.server_id = p_server
                 AND COALESCE(x.world_id, v_cur) IS NOT DISTINCT FROM v_cur) f
        LEFT JOIN aurora.players p ON p.server_id = p_server AND p.username = f.owner
       ORDER BY f.n DESC, f.name
       LIMIT 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION aurora.season_records(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aurora.season_records(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION aurora.season_records(TEXT) IS
  'Public (034, 042): the current world''s records as one JSON object, every key always present (null when nobody holds it): world_seq, world_started_at, first_death {name, t, x, y, hours_survived}, first_kill {name, t, x, y}, most_kills_season {name, kills}, most_kills_one_life {name, kills, life_no, alive}, most_kills_alive {name, kills, life_no}, longest_life {name, hours, alive, started_at}, longest_life_alive {name, hours, started_at}, most_skills_one_life {name, skills, life_no, alive}, most_skills_alive {name, skills, life_no}, biggest_faction {name, tag, owner_name, members}. No member list, no username beyond the display name fallback.';
