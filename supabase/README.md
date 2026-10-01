# Supabase Database Setup

This folder contains SQL migrations for the Dystopian Outcasts Wiki backend.

## Prerequisites

- Supabase account (https://supabase.com)
- Project created (already done: `dystopianwiki`)
- Credentials saved in `.env` file in project root

## Running Migrations

You have two options for running these migrations:

### Option 1: Using Supabase SQL Editor (Recommended for first-time setup)

1. Open Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `dystopianwiki`
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste each migration file in ascending numeric order, starting at the
   lowest one not yet applied (see the table below for the full list)
6. Click **Run** for each migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref gwubcipchkwthsorhcky

# Run all migrations
supabase db push
```

## Migration Files

| File | Description |
|------|-------------|
| `001_create_tables.sql` | Core tables: articles, categories, user_profiles, bookmarks, reading_progress, request_log |
| `002_create_indexes.sql` | Performance indexes for common queries |
| `003_row_level_security.sql` | RLS policies for security |
| `004_functions.sql` | Helper functions (rate limiting, search, related articles) |
| `005_initial_data.sql` | Seed categories and example article |
| `006_add_username.sql` | Username column and uniqueness on user_profiles |
| `007_popular_queries.sql` | Search-term logging and the popular-queries view |
| `008_aurora_schema.sql` | OutcastAurora: `aurora` schema, tables, indexes, RLS helper functions, `user_profiles.is_aurora_admin` |
| `009_aurora_rls.sql` | OutcastAurora: RLS on every aurora table plus the only client-facing grants |
| `010_aurora_functions.sql` | OutcastAurora: `players_public`, `player_positions_visible`, `consume_link_code()`, `prune_history()` |
| `011_aurora_realtime.sql` | OutcastAurora: publish three aurora tables to `supabase_realtime` |
| `012_aurora_cron.sql` | OutcastAurora: pg_cron + pg_net and the ingest job enable/disable helpers (job left unscheduled) |
| `013_request_log_rls.sql` | Enable RLS on `public.request_log` and revoke its anon/authenticated grants |
| `014_aurora_tick_ms.sql` | OutcastAurora: rename `health_samples.avg_update_period_ms` to `tick_ms`, add `tick_min_ms`/`tick_max_ms` |
| `015_aurora_cron_bearer.sql` | OutcastAurora: `aurora.ingest_bearer()` raises on a missing or empty Vault secret so the ingest cron fails loudly instead of posting an empty bearer |
| `016_aurora_ingest_lock.sql` | OutcastAurora: `aurora.ingest_lock` row lease so only one ingest run holds the log at a time, and a cron timeout long enough for the whole run |
| `017_versioned_slugs.sql` | Articles unique per `(game, version, slug)` instead of `slug`; `categories.version` added and the primary key moved to `(game, version, section, id)`; category counts per version |
| `018_aurora_positions_online.sql` | OutcastAurora: `positions_delayed()`/`player_positions_visible` stop returning offline characters and stop hard-coding `is_delayed`/`is_rounded` to `TRUE` (T16 P0-2, P2-1) |
| `019_aurora_admin_flag.sql` | OutcastAurora: `aurora.is_aurora_admin()` reads `auth.users.raw_app_meta_data` instead of the client-writable `public.user_profiles.is_aurora_admin`, which is dropped (T16 P0-1) |
| `022_aurora_visibility.sql` | OutcastAurora: `health_samples`/`servers`/`item_catalog` go admin-only; `aurora.vehicles_public()`/`vehicles_visible` add a public vehicle surface (type and position, never the driver) - see `docs/planning/OutcastAurora/VISIBILITY.md` |
| `023_aurora_undrawn_columns.sql` | OutcastAurora: narrows the public column grant on `safehouses` (drops `players`/`last_visited`/`created_at`) and `map_objects` (drops `meta`); adds `aurora.safehouses_admin()`/`aurora.map_objects_admin()` so admins still reach the full row - see `docs/planning/OutcastAurora/VISIBILITY.md` |
| `024_site_roles.sql` | Website roles: `site_is_admin()` / `site_is_superadmin()` (admin = the existing `aurora_admin` flag, superadmin = a new `superadmin` flag, both in `auth.users.raw_app_meta_data`), the superadmin's member list and make/remove admin, and `site_grant_superadmin()` (postgres only) for the owner's account. Tests: `tests/site_roles.sql` |
| `025_mascot_vote.sql` | Mascot vote: `mascot_entries`, `mascot_elections` (election 1 in `draft` with a fixed random `draw_order`) and `mascot_ballots` (no client access). Members with Discord cast through `mascot_cast_ballot()`, which copies the Discord id and username from the account; `mascot_public_ballots()` returns anonymized rankings only after an admin publishes; admins review, exclude, open, close and publish through `mascot_admin_*`. Needs 024. Tests: `tests/mascot_vote.sql` |

Apply 008 through 012 strictly in that order: 009 calls helper functions defined at
the bottom of 008, and 010 depends on the grants in 009. 022 may be applied at any
time, before or after the map is rebuilt to use it (VISIBILITY.md, "order that
cannot be changed"): it only swaps policies and adds a new function/view, so an
older map build simply reads zero rows or does not ask for `vehicles_visible` yet.
020 and 021 are reserved (T27, T28) but not yet written as of 022.

**023 must NOT be applied until the T34 map build is what `/map/` serves.**
Unlike 022, it REVOKEs column privileges rather than swapping a policy: a
client that still names a revoked column (`players`, `meta`) fails outright
with Postgres error `42501` on every request naming it, not just on that
column - PostgREST returns this as HTTP 403,
`{"code":"42501","message":"permission denied for table safehouses"}`. The
live build on 2026-09-29 selected `players` from `safehouses`; the T34 build
does not. Confirm the live JS bundle no longer asks for `players` before
running this file (see the migration's own header comment for how).

### 014 must not be applied on its own

Applying 014 renames a column that `packages/aurora` still selects by its old
name, and PostgREST answers an unknown column in a `select` list with HTTP 400 -
so the Health panel fails outright rather than degrading. Edit and commit the
readers first (`src/data/types.ts`, `src/data/queries.ts`, `src/panels/Health.tsx`
and the fixtures in `src/data/health.test.ts`), then apply, then verify the
dashboard. `packages/shared/aurora/ingest-core.ts` also names the old column, but
it belongs to the T08 revision, which drops that mapping with the RCON half.

Why the column was renamed: it was named after the engine counter
`avg-update-period`, which is neither an average nor a duration - it reports
about 5% of the cycle time. The real tick duration is the performance counter
named `fps`, in milliseconds, despite the name. The `COMMENT ON COLUMN` entries
in 014 carry the full provenance; read them before changing what feeds these
columns.

### 017 apply notes

017 lets Build 41 and Build 42 articles share a slug. It replaces the
`UNIQUE (slug)` constraint on `articles` with `UNIQUE (game, version, slug)`,
adds `categories.version` (existing rows become `build-41`), moves the
`categories` primary key to `(game, version, section, id)`, and rewrites
`update_category_article_count()` to count per version (it also fixes the
delete trigger, which never lowered a count).

- `scripts/sync-articles.ts` must be the updated version before 017 is applied:
  it upserts with `onConflict: 'game,version,slug'`, and the old script's
  `onConflict: 'slug'` fails once the slug-only constraint is gone. Both changes
  are committed together.
- Nothing else depends on the old constraints: no foreign key references
  `categories`, and `bookmarks` / `reading_progress` reference `articles.id`,
  which stays the primary key. The migration aborts rather than cascading if a
  foreign key to `categories` ever appears.
- Do not re-run `005_initial_data.sql` afterwards: its `ON CONFLICT (id)` no
  longer matches a unique constraint. `npx tsx scripts/build-nav.ts --db` writes
  `categories` from now on.
- The file is one transaction and idempotent; running it twice is a no-op.

### CLI migration history

Migrations 001-007 were applied through the dashboard SQL editor, so the project
has no `supabase_migrations.schema_migrations` table. `supabase db push` will
therefore try to re-run 001 and fail on "relation already exists". Before the
first push, mark the already-applied files:

```bash
supabase migration repair --status applied 001 002 003 004 005 006 007
```

## OutcastAurora (`aurora` schema)

### Exposing the schema to the REST API

PostgREST only serves schemas on its exposed list, and `aurora` is not on it by
default. Until it is added, the map application cannot query these tables even
though the grants and policies are correct.

Dashboard: **Settings -> API -> Exposed schemas**, add `aurora`, save.

### Cron secret

`012_aurora_cron.sql` deliberately schedules nothing, because the
`aurora-ingest` Edge Function does not exist until T08 deploys it. The job reads
its bearer token from Supabase Vault at run time, so no key is ever stored in
`cron.job.command` or in this repository. One-time setup, in the SQL editor:

```sql
SELECT vault.create_secret(
  '<secret key, sb_secret_...>',
  'aurora_service_role_key',
  'Bearer token for the aurora-ingest cron job'
);
```

This must be the **secret key** (`sb_secret_...`) from Settings -> API Keys,
not the legacy `service_role` JWT: legacy API keys are disabled on this
project and the old JWT is rejected with "Legacy API keys are disabled".
It is the same value the Edge Function reads as `AURORA_SERVICE_KEY`.

Then, after the function is deployed: `SELECT aurora.enable_ingest_cron();`

### Policy tests

`supabase/tests/aurora_policies.sql` seeds fixtures, asserts the visibility
rules as `anon`, a linked user, an admin, and `service_role`, and rolls back. Run
the whole file as `postgres` in the SQL editor or with psql. It prints a run of
`PASS ...` notices ending in `ALL AURORA POLICY TESTS PASSED`, or it stops at the
first failure.

## After Running Migrations

1. **Verify tables exist**: Go to **Table Editor** in Supabase dashboard
2. **Test RLS policies**: Try querying articles table (should work without auth)
3. **Run import script**: Use `scripts/import_to_supabase.py` to import articles

## Database Schema Overview

```
articles
├── id (TEXT, PK)
├── slug (TEXT, UNIQUE per game + version since 017)
├── title (TEXT)
├── content (TEXT)
├── excerpt (TEXT)
├── game, version, section, category (TEXT)
├── tags (TEXT[])
├── search_vector (tsvector, auto-generated)
└── version (UUID, ETag for caching)

categories
├── game, version, section, id (TEXT, composite PK since 017)
├── name, description (TEXT)
└── article_count (INTEGER, auto-updated)

user_profiles
├── id (UUID, FK to auth.users)
├── display_name, avatar_url (TEXT)
└── preferred_game, theme (TEXT)

bookmarks
├── user_id (UUID, FK to auth.users)
├── article_id (TEXT, FK to articles)
└── UNIQUE(user_id, article_id)

reading_progress
├── user_id (UUID, FK to auth.users)
├── article_id (TEXT, FK to articles)
├── scroll_position (FLOAT)
└── completed (BOOLEAN)
```

## Troubleshooting

### Error: "relation already exists"
- Migrations have already been run
- Safe to ignore or drop tables first: `DROP TABLE articles CASCADE;`

### Error: "permission denied"
- Make sure you're using service_role key for admin operations
- Check RLS policies are configured correctly

### Error: "function does not exist"
- Run migrations in order (001 → 005)
- Don't skip 004_functions.sql

## Security Notes

- **NEVER commit .env file** (already in .gitignore)
- **service_role key** is SECRET - only use server-side
- **anon key** is safe for frontend use
- RLS policies enforce security at database level

## Next Steps

After migrations are complete:

1. Run Python import script: `python scripts/import_to_supabase.py`
2. Configure auth providers in Supabase dashboard
3. Test queries and RLS policies
4. Build frontend integration (Phase 2)
