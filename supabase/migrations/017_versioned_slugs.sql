-- Migration 017: versioned slugs - article slugs and category ids become unique
-- per game version instead of across the whole wiki
-- Created: 2026-09-29
-- Description: Build 42 articles are imported into content/articles/pz/build-42/
--              with the same slugs their Build 41 counterparts already use
--              ("item-anatomy", "context-menus", "world-and-cells", ...). The
--              schema from 001 cannot hold both: articles.slug is UNIQUE across
--              every version, and categories.id is the whole primary key with
--              no version column, so a build-42 "fundamentals" category would
--              overwrite the build-41 one.
--
-- What changes
-- ----------------------------------------------------------------------------
-- 1. articles: the UNIQUE (slug) constraint is replaced by
--    UNIQUE (game, version, slug). The URL is /pz/{version}/{section}/{category}/{slug},
--    so the version is already part of an article's address; the database now
--    agrees. articles.id stays the primary key because bookmarks.article_id and
--    reading_progress.article_id reference it. New build-42 ids are
--    "build-42-<slug>" (scripts/sync-articles.ts derives that when frontmatter
--    omits an id), so ids stay globally unique while slugs repeat per version.
--    A plain index on slug is added because the old UNIQUE index served the
--    slug-only lookups that the web and mobile apps still make, and the new
--    composite index leads with game, not slug.
--
-- 2. categories: gains version TEXT NOT NULL DEFAULT 'build-41'. Every existing
--    row is a Build 41 category (005 seeded them, nothing else writes this
--    table yet), so the default IS the backfill. The primary key moves from
--    (id) to (game, version, section, id). No foreign key or view references
--    categories; the DO block below checks that and aborts rather than
--    cascading if one ever appears.
--
-- 3. update_category_article_count() counts per (game, version, section,
--    category). The 004 version counted across versions, and it read NEW in
--    the DELETE trigger, where NEW is NULL, so deletes never lowered a count.
--    It now recounts the OLD row's category on UPDATE and DELETE and the NEW
--    row's on INSERT and UPDATE. The three trigger names are kept;
--    update_category_count_on_update now also fires when an article moves
--    between versions or sections, not only between categories.
--
-- 4. article_count is recomputed once for every category row, so counts are
--    correct immediately after this migration rather than after the next
--    article write.
--
-- Apply order: scripts/sync-articles.ts upserts with
-- onConflict: 'game,version,slug', which PostgREST rejects unless a unique
-- constraint on exactly those columns exists. Commit the updated script (done in
-- the same change as this file), then apply this migration, then sync. The old
-- script's onConflict: 'slug' stops working the moment this is applied.
--
-- 005_initial_data.sql inserts categories with ON CONFLICT (id); after this
-- migration that clause no longer matches a unique constraint, so 005 must not
-- be re-run as-is. scripts/build-nav.ts --db is the categories writer from now on.
--
-- Idempotent: every step checks the current state first, so running the file a
-- second time is a no-op. The whole file runs in one transaction.

BEGIN;

-- ============================================================================
-- 1. ARTICLES: UNIQUE (slug) -> UNIQUE (game, version, slug)
-- ============================================================================

DO $$
DECLARE
  v_slug_attnum SMALLINT;
  v_con RECORD;
BEGIN
  SELECT attnum INTO v_slug_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.articles'::regclass
    AND attname = 'slug'
    AND NOT attisdropped;

  -- Drop every unique constraint whose only column is slug. 001 created it
  -- unnamed, so Postgres called it articles_slug_key; look it up rather than
  -- trusting the name.
  FOR v_con IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.articles'::regclass
      AND contype = 'u'
      AND conkey = ARRAY[v_slug_attnum]
  LOOP
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT %I', v_con.conname);
    RAISE NOTICE '017: dropped articles constraint %', v_con.conname;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.articles'::regclass
      AND conname = 'articles_game_version_slug_key'
  ) THEN
    ALTER TABLE public.articles
      ADD CONSTRAINT articles_game_version_slug_key UNIQUE (game, version, slug);
    RAISE NOTICE '017: added articles_game_version_slug_key UNIQUE (game, version, slug)';
  END IF;
END
$$;

-- Slug-only lookups (ApiService.getArticle before it becomes version-aware)
-- lost their index with the old constraint.
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);

-- ============================================================================
-- 2. CATEGORIES: add version, PK (id) -> PK (game, version, section, id)
-- ============================================================================

-- ADD COLUMN with a constant default fills every existing row with it.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT 'build-41';

-- Explicit backfill, a no-op after the ADD COLUMN above; kept so the intent is
-- on the page.
UPDATE public.categories SET version = 'build-41' WHERE version IS NULL;

DO $$
DECLARE
  v_pk_name TEXT;
  v_pk_cols TEXT[];
BEGIN
  -- Refuse to continue if anything references categories. Dropping the PK
  -- would need CASCADE, and cascading away someone's foreign key silently is
  -- exactly the kind of change this migration must not make.
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype = 'f'
      AND confrelid = 'public.categories'::regclass
  ) THEN
    RAISE EXCEPTION '017: a foreign key references public.categories; review it before changing the primary key';
  END IF;

  SELECT c.conname,
         ARRAY(
           SELECT a.attname::TEXT
           FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
           JOIN pg_attribute a
             ON a.attrelid = c.conrelid AND a.attnum = k.attnum
           ORDER BY k.ord
         )
    INTO v_pk_name, v_pk_cols
  FROM pg_constraint c
  WHERE c.conrelid = 'public.categories'::regclass
    AND c.contype = 'p';

  IF v_pk_cols IS NOT DISTINCT FROM ARRAY['game', 'version', 'section', 'id'] THEN
    RAISE NOTICE '017: categories primary key already (game, version, section, id)';
    RETURN;
  END IF;

  IF v_pk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.categories DROP CONSTRAINT %I', v_pk_name);
    RAISE NOTICE '017: dropped categories primary key % (%)', v_pk_name, v_pk_cols;
  END IF;

  ALTER TABLE public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (game, version, section, id);
  RAISE NOTICE '017: added categories_pkey PRIMARY KEY (game, version, section, id)';
END
$$;

-- ============================================================================
-- 3. CATEGORY ARTICLE COUNT: per (game, version, section, category)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_category_article_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- The row's new home: INSERT and UPDATE.
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    UPDATE categories c
    SET article_count = (
      SELECT COUNT(*)
      FROM articles a
      WHERE a.game = NEW.game
        AND a.version = NEW.version
        AND a.section = NEW.section
        AND a.category = NEW.category
    )
    WHERE c.game = NEW.game
      AND c.version = NEW.version
      AND c.section = NEW.section
      AND c.id = NEW.category;
  END IF;

  -- The row's old home: UPDATE (it may have moved) and DELETE (NEW is NULL).
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    UPDATE categories c
    SET article_count = (
      SELECT COUNT(*)
      FROM articles a
      WHERE a.game = OLD.game
        AND a.version = OLD.version
        AND a.section = OLD.section
        AND a.category = OLD.category
    )
    WHERE c.game = OLD.game
      AND c.version = OLD.version
      AND c.section = OLD.section
      AND c.id = OLD.category;
  END IF;

  -- AFTER ROW trigger: the return value is ignored.
  RETURN NULL;
END;
$$;

-- Same three trigger names as 004. INSERT and DELETE are recreated only so the
-- file stands alone; the UPDATE trigger's WHEN clause widens to cover a move
-- between versions or sections.
DROP TRIGGER IF EXISTS update_category_count_on_insert ON public.articles;
CREATE TRIGGER update_category_count_on_insert
  AFTER INSERT ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_category_article_count();

DROP TRIGGER IF EXISTS update_category_count_on_update ON public.articles;
CREATE TRIGGER update_category_count_on_update
  AFTER UPDATE ON public.articles
  FOR EACH ROW
  WHEN (
    (OLD.game, OLD.version, OLD.section, OLD.category)
    IS DISTINCT FROM
    (NEW.game, NEW.version, NEW.section, NEW.category)
  )
  EXECUTE FUNCTION public.update_category_article_count();

DROP TRIGGER IF EXISTS update_category_count_on_delete ON public.articles;
CREATE TRIGGER update_category_count_on_delete
  AFTER DELETE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_category_article_count();

-- ============================================================================
-- 4. RECOUNT every category once
-- ============================================================================

UPDATE public.categories c
SET article_count = (
  SELECT COUNT(*)
  FROM public.articles a
  WHERE a.game = c.game
    AND a.version = c.version
    AND a.section = c.section
    AND a.category = c.id
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON CONSTRAINT articles_game_version_slug_key ON public.articles IS
  'Slugs repeat across game versions (build-41 and build-42 share many); unique per (game, version). Added in 017.';
COMMENT ON COLUMN public.categories.version IS
  'Game version the category belongs to, e.g. build-41, build-42. Part of the primary key since 017.';
COMMENT ON FUNCTION public.update_category_article_count() IS
  'Keeps categories.article_count per (game, version, section, category); recounts both the old and new category on update and delete. Rewritten in 017.';

COMMIT;
