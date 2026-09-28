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

Apply 008 through 012 strictly in that order: 009 calls helper functions defined at
the bottom of 008, and 010 depends on the grants in 009.

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
  '<service role JWT>',
  'aurora_service_role_key',
  'Bearer token for the aurora-ingest cron job'
);
```

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
├── slug (TEXT, UNIQUE)
├── title (TEXT)
├── content (TEXT)
├── excerpt (TEXT)
├── game, version, section, category (TEXT)
├── tags (TEXT[])
├── search_vector (tsvector, auto-generated)
└── version (UUID, ETag for caching)

categories
├── id (TEXT, PK)
├── game, section (TEXT)
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
