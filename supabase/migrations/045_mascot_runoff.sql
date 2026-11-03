-- Migration 045: Mascot vote - runoff elections
-- Created: 2026-11-03
-- Description: the first mascot vote ended 5 to 5 between two entries. The published
--   rules would settle that with the draw order; the owner chose a runoff instead, open
--   to everyone in the community on the same terms as the first vote (a Discord account,
--   one ballot each, admins exclude accounts that are not on the server).
--
--   A runoff is simply the next election, holding only some of the entries. Every
--   function in 025 already acts on the newest election, so casting, a member's own
--   ballot, the admin ballot list and the status moves follow the runoff once it exists.
--   The election it settles stays published for good: the status moves only reach the
--   newest election, and its ballots can no longer be changed.
--
-- What it adds:
--
--   mascot_elections.entries     the entries in this election; NULL means every entry
--                                (election 1, and any later full election).
--   mascot_elections.runoff_of   the election this one settles, or NULL.
--   mascot_election_entries(id)  an election's entries in gallery order.
--   mascot_cast_ballot           now refuses an entry that is not in the open election.
--   mascot_public_ballots_of(id) the anonymized ballots of ANY published election, so the
--                                first vote's count stays checkable while the runoff runs.
--   mascot_admin_start_runoff    admins: from a PUBLISHED newest election, create the next
--                                one in draft with the given entries and a fresh random
--                                draw order (shown on the page before anyone votes; it
--                                settles a tie in the runoff too).
--
-- There is still no count in the database: the dashboard counts with rankedChoice.ts and
-- passes the tied entries. Only admins can call it, and it checks every entry was in the
-- vote it settles.
--
-- ORDER: after 024 and 025. Before the site that reads entries and runoff_of. Safe to run twice.
-- Run it as postgres (the SQL editor), then: NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COLUMNS
-- ============================================================================

ALTER TABLE public.mascot_elections ADD COLUMN IF NOT EXISTS entries   text[]  NULL;
ALTER TABLE public.mascot_elections ADD COLUMN IF NOT EXISTS runoff_of integer NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.mascot_elections'::regclass AND conname = 'mascot_elections_runoff_of_fkey'
  ) THEN
    ALTER TABLE public.mascot_elections
      ADD CONSTRAINT mascot_elections_runoff_of_fkey FOREIGN KEY (runoff_of) REFERENCES public.mascot_elections (id);
  END IF;
END $$;

COMMENT ON COLUMN public.mascot_elections.entries IS
  'The entries in this election (045). NULL means every entry. Never changes.';
COMMENT ON COLUMN public.mascot_elections.runoff_of IS
  'The election this one settles (045), or NULL. Never changes.';

-- ============================================================================
-- AN ELECTION'S ENTRIES
-- ============================================================================

-- In gallery order (mascot_entries.sort_order). NULL for an election that does not exist.
CREATE OR REPLACE FUNCTION public.mascot_election_entries(p_election integer)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT array_agg(m.id ORDER BY m.sort_order)
    FROM public.mascot_elections e
    JOIN public.mascot_entries m ON e.entries IS NULL OR m.id = ANY (e.entries)
   WHERE e.id = p_election;
$$;

REVOKE ALL ON FUNCTION public.mascot_election_entries(integer) FROM PUBLIC, anon, authenticated, service_role;

-- ============================================================================
-- THE GUARD: entries, draw order and runoff_of are fixed at creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mascot_guard_draw_order()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_entries text[];
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.draw_order IS DISTINCT FROM OLD.draw_order THEN
      RAISE EXCEPTION 'The draw order of an election never changes' USING ERRCODE = '55000';
    END IF;
    IF NEW.entries IS DISTINCT FROM OLD.entries OR NEW.runoff_of IS DISTINCT FROM OLD.runoff_of THEN
      RAISE EXCEPTION 'The entries of an election never change' USING ERRCODE = '55000';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.entries IS NOT NULL AND (
       cardinality(NEW.entries) < 2
       OR (SELECT count(DISTINCT x) FROM unnest(NEW.entries) x) <> cardinality(NEW.entries)
       OR EXISTS (SELECT 1 FROM unnest(NEW.entries) x WHERE x IS NULL OR x NOT IN (SELECT e.id FROM public.mascot_entries e))) THEN
    RAISE EXCEPTION 'An election holds two or more different entries' USING ERRCODE = '23514';
  END IF;
  IF NEW.runoff_of IS NOT NULL AND NEW.entries IS NULL THEN
    RAISE EXCEPTION 'A runoff names its entries' USING ERRCODE = '23514';
  END IF;

  v_entries := coalesce(NEW.entries, (SELECT array_agg(e.id) FROM public.mascot_entries e));
  IF cardinality(NEW.draw_order) IS DISTINCT FROM cardinality(v_entries)
     OR (SELECT count(DISTINCT d) FROM unnest(NEW.draw_order) d) <> cardinality(NEW.draw_order)
     OR EXISTS (SELECT 1 FROM unnest(NEW.draw_order) d WHERE d IS NULL OR d <> ALL (v_entries)) THEN
    RAISE EXCEPTION 'The draw order must list every entry exactly once' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.mascot_guard_draw_order() FROM PUBLIC, anon, authenticated, service_role;

-- ============================================================================
-- MEMBERS: cast a ballot (025's function, entries now per election)
-- ============================================================================

-- Returns 'ok', 'already_voted', 'not_open', 'no_discord' or 'invalid'. Never raises
-- to the caller for an ordinary refusal.
CREATE OR REPLACE FUNCTION public.mascot_cast_ballot(p_rankings text[])
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid       uuid := auth.uid();
  v_election  public.mascot_elections%ROWTYPE;
  v_entries   text[];
  v_discord   record;
  v_clean     text[];
  v_inserted  integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Log in to vote' USING ERRCODE = '42501';
  END IF;

  -- FOR SHARE: a status change waits for this ballot, and this ballot sees the
  -- status that holds when it is stored.
  SELECT * INTO v_election FROM public.mascot_elections ORDER BY id DESC LIMIT 1 FOR SHARE;
  IF NOT FOUND
     OR v_election.status <> 'open'
     OR (v_election.closes_at IS NOT NULL AND now() >= v_election.closes_at) THEN
    RETURN 'not_open';
  END IF;

  SELECT d.discord_id, d.discord_username INTO v_discord FROM public.site_discord_identity(v_uid) d;
  IF NOT FOUND OR v_discord.discord_id IS NULL THEN
    RETURN 'no_discord';
  END IF;

  IF EXISTS (SELECT 1 FROM public.mascot_ballots b
              WHERE b.election_id = v_election.id
                AND (b.user_id = v_uid OR b.discord_id = v_discord.discord_id)) THEN
    RETURN 'already_voted';
  END IF;

  -- Close gaps, keep order: ranks 1 and 3 with no 2 become ranks 1 and 2.
  SELECT array_agg(btrim(t.x) ORDER BY t.ord) INTO v_clean
    FROM unnest(p_rankings) WITH ORDINALITY AS t(x, ord)
   WHERE t.x IS NOT NULL AND btrim(t.x) <> '';

  -- 045: only this election's entries; a runoff ballot naming any other entry is refused.
  v_entries := public.mascot_election_entries(v_election.id);
  IF v_clean IS NULL
     OR cardinality(v_clean) > cardinality(v_entries)
     OR (SELECT count(DISTINCT c) FROM unnest(v_clean) c) <> cardinality(v_clean)
     OR EXISTS (SELECT 1 FROM unnest(v_clean) c WHERE c <> ALL (v_entries)) THEN
    RETURN 'invalid';
  END IF;

  BEGIN
    INSERT INTO public.mascot_ballots (election_id, user_id, discord_id, discord_username, rankings)
    VALUES (v_election.id, v_uid, v_discord.discord_id, v_discord.discord_username, v_clean)
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_inserted = ROW_COUNT;
  EXCEPTION WHEN foreign_key_violation THEN
    -- A still-valid session for an account deleted a moment ago.
    RETURN 'invalid';
  END;

  -- A second ballot that raced past the check above lands here.
  RETURN CASE WHEN v_inserted = 1 THEN 'ok' ELSE 'already_voted' END;
END;
$$;

REVOKE ALL ON FUNCTION public.mascot_cast_ballot(text[]) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mascot_cast_ballot(text[]) TO authenticated;

-- ============================================================================
-- EVERYONE: the anonymized ballots of any published election
-- ============================================================================

-- NULL unless that election exists and is published. Then the same shape as 025's
-- mascot_public_ballots: {"ballots": [[ids...], ...], "excluded": n}, rankings only,
-- sorted by the rankings so the order says nothing about who voted when.
CREATE OR REPLACE FUNCTION public.mascot_public_ballots_of(p_election integer)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
           'ballots',
           coalesce((SELECT jsonb_agg(to_jsonb(b.rankings) ORDER BY b.rankings)
                       FROM public.mascot_ballots b
                      WHERE b.election_id = e.id AND b.counted), '[]'::jsonb),
           'excluded',
           (SELECT count(*) FROM public.mascot_ballots b WHERE b.election_id = e.id AND NOT b.counted)
         )
    FROM public.mascot_elections e
   WHERE e.id = p_election AND e.status = 'published';
$$;

REVOKE ALL ON FUNCTION public.mascot_public_ballots_of(integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mascot_public_ballots_of(integer) TO anon, authenticated;

-- ============================================================================
-- ADMINS: start a runoff
-- ============================================================================

-- Creates the next election in draft, holding p_entries (two or more, each in the vote it
-- settles), with a fresh random draw order. The newest election must be published: its
-- result is public and final before anything replaces it. Returns the new election's id.
CREATE OR REPLACE FUNCTION public.mascot_admin_start_runoff(p_entries text[])
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id      integer;
  v_status  text;
  v_clean   text[];
  v_new     integer;
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;

  -- FOR UPDATE: a second press waits, then finds the runoff (in draft) as the newest
  -- election and is refused below, so one press makes one runoff.
  SELECT e.id, e.status INTO v_id, v_status
    FROM public.mascot_elections e ORDER BY e.id DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'There is no election' USING ERRCODE = 'P0002';
  END IF;
  IF v_status <> 'published' THEN
    RAISE EXCEPTION 'Publish the results before starting a runoff' USING ERRCODE = '55000';
  END IF;

  SELECT array_agg(DISTINCT btrim(x)) INTO v_clean
    FROM unnest(p_entries) x
   WHERE x IS NOT NULL AND btrim(x) <> '';
  IF v_clean IS NULL OR cardinality(v_clean) < 2 THEN
    RAISE EXCEPTION 'A runoff needs two or more entries' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM unnest(v_clean) x WHERE x <> ALL (public.mascot_election_entries(v_id))) THEN
    RAISE EXCEPTION 'Every runoff entry must be in the vote it settles' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.mascot_elections (id, status, entries, runoff_of, draw_order)
  SELECT v_id + 1, 'draft',
         (SELECT array_agg(m.id ORDER BY m.sort_order) FROM public.mascot_entries m WHERE m.id = ANY (v_clean)),
         v_id,
         (SELECT array_agg(x ORDER BY random()) FROM unnest(v_clean) x)
  RETURNING id INTO v_new;
  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION public.mascot_admin_start_runoff(text[]) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mascot_admin_start_runoff(text[]) TO authenticated;

COMMENT ON FUNCTION public.mascot_public_ballots_of(integer) IS
  'Everyone: NULL unless the election is published, then {"ballots": [[ids...]...], "excluded": n} with rankings only (045).';
COMMENT ON FUNCTION public.mascot_admin_start_runoff(text[]) IS
  'Admins: from a published newest election, create the next one in draft holding the given entries, with a fresh random draw order (045).';
