-- Migration 025: Mascot vote - entries, the election and ballots
-- Created: 2026-10-01
-- Description: Member accounts and mascot vote, Task 6 (docs/planning/MascotVote/
--              PLAN.md). One ranked-choice election over six entries. Members with a
--              Discord identity cast one ballot each; the Discord id and username on a
--              ballot are copied here from the account's identity, never sent by the
--              browser. Admins see every ballot and can exclude one from the count;
--              the public sees only anonymized rankings, and only after an admin
--              publishes. Depends on 024 (public.site_is_admin(),
--              public.site_discord_identity()).
--
-- There is no count in the database. The site counts with one module
-- (packages/web/src/lib/rankedChoice.ts) from the ballots these functions return.
--
-- Nobody reads or writes mascot_ballots directly: no policies, no table grants. All
-- access is through the SECURITY DEFINER functions below, each of which revokes
-- Supabase's default EXECUTE grants and grants back only what it needs.
--
-- Status moves (admins, from the dashboard):
--   draft -> open, open -> closed, closed -> open, closed -> published, published -> closed
-- Election 1 is created in `draft`. Opening it is the owner's decision.

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mascot_entries (
  id         text PRIMARY KEY CHECK (id ~ '^art_[0-9]{3}$'),
  sort_order integer NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.mascot_elections (
  id           integer PRIMARY KEY,
  status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'published')),
  closes_at    timestamptz,
  -- A random order of every entry, drawn once when the election is created and shown
  -- on the vote page from the start. It settles a tie for last place that no earlier
  -- round separates. It never changes (trigger below).
  draw_order   text[] NOT NULL,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mascot_ballots (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id      integer NOT NULL REFERENCES public.mascot_elections (id),
  -- Deleting an account deletes its ballot.
  user_id          uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  discord_id       text NOT NULL,
  discord_username text,
  rankings         text[] NOT NULL CHECK (cardinality(rankings) BETWEEN 1 AND 6),
  counted          boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mascot_ballots_one_per_account UNIQUE (election_id, user_id),
  CONSTRAINT mascot_ballots_one_per_discord UNIQUE (election_id, discord_id)
);

ALTER TABLE public.mascot_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascot_elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascot_ballots   ENABLE ROW LEVEL SECURITY;

-- Supabase's default privileges grant ALL on new public tables to anon and
-- authenticated. Take them all back, then give read access where it is public.
REVOKE ALL ON public.mascot_entries, public.mascot_elections, public.mascot_ballots FROM anon, authenticated;
GRANT SELECT ON public.mascot_entries, public.mascot_elections TO anon, authenticated;

DROP POLICY IF EXISTS "Mascot entries are public" ON public.mascot_entries;
CREATE POLICY "Mascot entries are public" ON public.mascot_entries
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Mascot elections are public" ON public.mascot_elections;
CREATE POLICY "Mascot elections are public" ON public.mascot_elections
  FOR SELECT TO anon, authenticated USING (true);

-- mascot_ballots: RLS on, no policies, no grants. Functions only.

-- ============================================================================
-- THE DRAW ORDER: a permutation of the entries, fixed at creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mascot_guard_draw_order()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.draw_order IS DISTINCT FROM OLD.draw_order THEN
      RAISE EXCEPTION 'The draw order of an election never changes' USING ERRCODE = '55000';
    END IF;
    RETURN NEW;
  END IF;

  IF cardinality(NEW.draw_order) IS DISTINCT FROM (SELECT count(*) FROM public.mascot_entries)
     OR (SELECT count(DISTINCT d) FROM unnest(NEW.draw_order) d) <> cardinality(NEW.draw_order)
     OR EXISTS (SELECT 1 FROM unnest(NEW.draw_order) d WHERE d NOT IN (SELECT e.id FROM public.mascot_entries e)) THEN
    RAISE EXCEPTION 'The draw order must list every entry exactly once' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.mascot_guard_draw_order() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS mascot_elections_draw_order ON public.mascot_elections;
CREATE TRIGGER mascot_elections_draw_order
  BEFORE INSERT OR UPDATE ON public.mascot_elections
  FOR EACH ROW EXECUTE FUNCTION public.mascot_guard_draw_order();

-- ============================================================================
-- SEED: six entries, election 1 in draft with its draw order
-- ============================================================================

INSERT INTO public.mascot_entries (id, sort_order) VALUES
  ('art_001', 1), ('art_002', 2), ('art_003', 3), ('art_004', 4), ('art_005', 5), ('art_006', 6)
ON CONFLICT (id) DO NOTHING;

-- ON CONFLICT DO NOTHING: running this file again keeps the order already drawn.
INSERT INTO public.mascot_elections (id, status, draw_order)
SELECT 1, 'draft', array_agg(e.id ORDER BY random())
  FROM public.mascot_entries e
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MEMBERS: cast a ballot, read your own
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

  IF v_clean IS NULL
     OR cardinality(v_clean) > (SELECT count(*) FROM public.mascot_entries)
     OR (SELECT count(DISTINCT c) FROM unnest(v_clean) c) <> cardinality(v_clean)
     OR EXISTS (SELECT 1 FROM unnest(v_clean) c WHERE c NOT IN (SELECT e.id FROM public.mascot_entries e)) THEN
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

-- The caller's own ballot in the current election: zero or one row.
CREATE OR REPLACE FUNCTION public.mascot_my_ballot()
RETURNS TABLE (rankings text[], created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT b.rankings, b.created_at
    FROM public.mascot_ballots b
   WHERE b.user_id = auth.uid()
     AND b.election_id = (SELECT max(e.id) FROM public.mascot_elections e);
$$;

REVOKE ALL ON FUNCTION public.mascot_cast_ballot(text[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.mascot_my_ballot() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mascot_cast_ballot(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mascot_my_ballot() TO authenticated;

-- ============================================================================
-- EVERYONE: the anonymized ballots, after publication
-- ============================================================================

-- NULL until the current election is published. Then
--   {"ballots": [["art_002","art_005"], ...], "excluded": <n>}
-- holding the rankings of every counted ballot and nothing else: no name, id or time.
-- Sorted by the rankings themselves, so the order says nothing about who voted when.
CREATE OR REPLACE FUNCTION public.mascot_public_ballots()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH current AS (
    SELECT e.id FROM public.mascot_elections e
     WHERE e.status = 'published'
       AND e.id = (SELECT max(x.id) FROM public.mascot_elections x)
  )
  SELECT jsonb_build_object(
           'ballots',
           coalesce((SELECT jsonb_agg(to_jsonb(b.rankings) ORDER BY b.rankings)
                       FROM public.mascot_ballots b
                      WHERE b.election_id = c.id AND b.counted), '[]'::jsonb),
           'excluded',
           (SELECT count(*) FROM public.mascot_ballots b WHERE b.election_id = c.id AND NOT b.counted)
         )
    FROM current c;
$$;

REVOKE ALL ON FUNCTION public.mascot_public_ballots() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mascot_public_ballots() TO anon, authenticated;

-- ============================================================================
-- ADMINS
-- ============================================================================

-- Every ballot in the current election, newest first.
CREATE OR REPLACE FUNCTION public.mascot_admin_ballots()
RETURNS TABLE (
  ballot_id        uuid,
  discord_username text,
  discord_id       text,
  rankings         text[],
  created_at       timestamptz,
  counted          boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT b.id, b.discord_username, b.discord_id, b.rankings, b.created_at, b.counted
    FROM public.mascot_ballots b
   WHERE b.election_id = (SELECT max(e.id) FROM public.mascot_elections e)
   ORDER BY b.created_at DESC, b.id;
END;
$$;

-- Include or exclude one ballot. Refused while results are published: unpublish first,
-- so the public figures never change under a published page.
CREATE OR REPLACE FUNCTION public.mascot_admin_set_counted(p_ballot uuid, p_counted boolean)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status text;
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;
  IF p_ballot IS NULL OR p_counted IS NULL THEN
    RAISE EXCEPTION 'Both a ballot and a value are required' USING ERRCODE = '22004';
  END IF;

  SELECT e.status INTO v_status
    FROM public.mascot_ballots b
    JOIN public.mascot_elections e ON e.id = b.election_id
   WHERE b.id = p_ballot
     FOR UPDATE OF e;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No such ballot' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'published' THEN
    RAISE EXCEPTION 'Results are published; unpublish before changing a ballot' USING ERRCODE = '55000';
  END IF;

  UPDATE public.mascot_ballots SET counted = p_counted WHERE id = p_ballot;
END;
$$;

-- Move the current election to a new status. Returns the new status.
CREATE OR REPLACE FUNCTION public.mascot_admin_set_status(p_status text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id      integer;
  v_current text;
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;

  SELECT e.id, e.status INTO v_id, v_current
    FROM public.mascot_elections e ORDER BY e.id DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'There is no election' USING ERRCODE = 'P0002';
  END IF;

  IF p_status IS NULL OR NOT ((v_current, p_status) IN (
            ('draft', 'open'), ('open', 'closed'), ('closed', 'open'),
            ('closed', 'published'), ('published', 'closed'))) THEN
    RAISE EXCEPTION 'Cannot move the vote from % to %', v_current, coalesce(p_status, 'nothing')
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.mascot_elections
     SET status = p_status,
         published_at = CASE WHEN p_status = 'published' THEN now() ELSE NULL END
   WHERE id = v_id;
  RETURN p_status;
END;
$$;

-- Set or clear the closing time of the current election. After it, ballots are refused
-- even while the status is still `open`.
CREATE OR REPLACE FUNCTION public.mascot_admin_set_closes_at(p_time timestamptz)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.site_is_admin() THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;
  UPDATE public.mascot_elections
     SET closes_at = p_time
   WHERE id = (SELECT max(e.id) FROM public.mascot_elections e);
END;
$$;

REVOKE ALL ON FUNCTION public.mascot_admin_ballots() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.mascot_admin_set_counted(uuid, boolean) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.mascot_admin_set_status(text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.mascot_admin_set_closes_at(timestamptz) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mascot_admin_ballots() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mascot_admin_set_counted(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mascot_admin_set_status(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mascot_admin_set_closes_at(timestamptz) TO authenticated;

COMMENT ON TABLE public.mascot_ballots IS
  'Mascot vote ballots (migration 025). No client access: read and written only through the mascot_* functions.';
COMMENT ON FUNCTION public.mascot_cast_ballot(text[]) IS
  'Members with a Discord identity: cast one ballot in the open election. Returns ok, already_voted, not_open, no_discord or invalid. The Discord id and username come from the account, not the caller.';
COMMENT ON FUNCTION public.mascot_public_ballots() IS
  'Everyone: NULL until the current election is published, then {"ballots": [[ids...]...], "excluded": n} with rankings only.';
