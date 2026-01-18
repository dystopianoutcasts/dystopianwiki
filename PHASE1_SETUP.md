# Phase 1 Setup Guide - Backend Migration

This guide walks through setting up the Supabase backend for Dystopian Outcasts Wiki.

## Prerequisites

- [x] Supabase account created
- [x] Project `dystopianwiki` created
- [x] Credentials saved in `.env` file
- [x] SQL migrations created
- [x] Python import script ready

## Step-by-Step Instructions

### 1. Run Database Migrations

You need to create the database tables, indexes, and functions.

**Option A: Using Supabase SQL Editor (Recommended)**

1. Open Supabase dashboard: https://supabase.com/dashboard/project/gwubcipchkwthsorhcky
2. Click **SQL Editor** in left sidebar
3. Click **New query**
4. Copy and paste each migration file **in order**:

```bash
# Navigate to project
cd /home/edgar_dev/CodingProjects/dystopianwiki/supabase/migrations

# Copy contents of each file into SQL Editor:
# 1. 001_create_tables.sql
# 2. 002_create_indexes.sql
# 3. 003_row_level_security.sql
# 4. 004_functions.sql
# 5. 005_initial_data.sql
```

5. Click **Run** for each migration
6. Verify no errors in output

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref gwubcipchkwthsorhcky

# Push migrations
supabase db push
```

### 2. Verify Tables Were Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ articles
   - ✅ categories
   - ✅ user_profiles
   - ✅ bookmarks
   - ✅ reading_progress
   - ✅ request_log

### 3. Install Python Dependencies

```bash
cd /home/edgar_dev/CodingProjects/dystopianwiki

# Install dependencies
pip install -r requirements.txt

# Or install individually:
pip install supabase==2.3.0 python-dotenv==1.0.0
```

### 4. Run Import Script

```bash
# Make sure you're in project root
cd /home/edgar_dev/CodingProjects/dystopianwiki

# Run import
python scripts/import_to_supabase.py
```

**Expected output:**

```
🚀 Dystopian Outcasts Wiki - Supabase Import
📍 Supabase URL: https://gwubcipchkwthsorhcky.supabase.co
📂 Source: /home/edgar_dev/CodingProjects/dystopianwiki/_archive-v1/public/data

======================================================================
Importing Categories
======================================================================

✓ Category: Fundamentals
✓ Category: Items
✓ Category: Recipes
...

✅ Imported 8 categories

📁 Processing category: items
  ✓ Item Creation Guide - Project Zomboid
  ✓ Item Anatomy Guide
  ✓ First Item File
  ...

📁 Processing category: recipes
  ✓ Recipe Creation Guide
  ...

======================================================================
Import Summary
======================================================================
✅ Successfully imported: 100+ articles

======================================================================
Verification
======================================================================
✓ Total articles in database: 105
✓ Search function test: Found 5 results for 'weapon'

✅ Import completed successfully!
```

### 5. Verify Articles in Database

**Using Supabase Dashboard:**

1. Go to **Table Editor**
2. Click on `articles` table
3. You should see all imported articles
4. Check a few article rows to verify data looks correct

**Using SQL Editor:**

```sql
-- Count articles
SELECT COUNT(*) FROM articles;

-- View recent articles
SELECT id, title, category, last_updated
FROM articles
ORDER BY last_updated DESC
LIMIT 10;

-- Test full-text search
SELECT id, title, ts_rank(search_vector, websearch_to_tsquery('english', 'weapon')) as rank
FROM articles
WHERE search_vector @@ websearch_to_tsquery('english', 'weapon')
ORDER BY rank DESC
LIMIT 5;
```

### 6. Configure Authentication Providers

**Email/Password** (Already enabled by default)

**Google OAuth:**
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com)
4. Add Authorized redirect URI: `https://gwubcipchkwthsorhcky.supabase.co/auth/v1/callback`

**Discord OAuth:**
1. Go to **Authentication** → **Providers** → **Discord**
2. Enable Discord provider
3. Create Discord app at https://discord.com/developers/applications
4. Add redirect URL: `https://gwubcipchkwthsorhcky.supabase.co/auth/v1/callback`

**GitHub OAuth:**
1. Go to **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Create OAuth app at https://github.com/settings/developers
4. Add redirect URL: `https://gwubcipchkwthsorhcky.supabase.co/auth/v1/callback`

**Site URL Configuration:**
- Production: `https://dystopianoutcasts.wiki`
- Development: `http://localhost:5173` (for local testing)

### 7. Test RLS Policies

**Test 1: Public article access (no auth required)**

```sql
-- This should work without authentication
SELECT * FROM articles LIMIT 5;
```

**Test 2: Try to insert article (should fail without admin)**

```sql
-- This should fail due to RLS
INSERT INTO articles (id, slug, title, content, game, version, section, category)
VALUES ('test-article', 'test', 'Test Article', 'Test content', 'pz', 'build-41', 'modding', 'items');
```

**Test 3: Create test user and bookmark**

1. Go to **Authentication** → **Users** → **Add user**
2. Create test user with email/password
3. In SQL Editor, run:

```sql
-- Set user context (replace with actual user UUID)
SET LOCAL request.jwt.claims = '{"sub": "USER_UUID_HERE"}';

-- Try to create bookmark (should work)
INSERT INTO bookmarks (user_id, article_id)
VALUES ('USER_UUID_HERE', 'welcome-to-wiki');

-- View own bookmarks (should work)
SELECT * FROM bookmarks WHERE user_id = 'USER_UUID_HERE';

-- Try to view other user's bookmarks (should return empty)
SELECT * FROM bookmarks WHERE user_id = 'DIFFERENT_USER_UUID';
```

### 8. Test Rate Limiting

```sql
-- Test rate limit function
SELECT check_rate_limit('test-ip-192.168.1.1', 10, 60);
-- Should return true (under limit)

-- Call it 11 times
SELECT check_rate_limit('test-ip-192.168.1.1', 10, 60);
-- 11th call should return false (over limit)
```

### 9. Test Search Function

```sql
-- Search for articles
SELECT * FROM search_articles('weapon', 'pz', 'build-41', 10);

-- Should return articles with 'weapon' in title/content
```

## Success Criteria

Phase 1 is complete when:

- [x] Supabase project created and accessible
- [ ] All 5 SQL migrations executed successfully
- [ ] All tables exist in database
- [ ] 100+ articles imported from JSON files
- [ ] Categories populated
- [ ] Full-text search works
- [ ] RLS policies enforce security
- [ ] Rate limiting function works
- [ ] Authentication providers configured
- [ ] Test user can create bookmarks
- [ ] `.env` file created with credentials
- [ ] `.env.example` template created

## Troubleshooting

### Import Script Fails

**Error: "No module named 'supabase'"**
```bash
pip install supabase python-dotenv
```

**Error: "SUPABASE_URL not set"**
- Check `.env` file exists in project root
- Verify `.env` contains correct credentials

### Migration Errors

**Error: "relation already exists"**
- Tables already created, safe to continue
- Or drop and recreate: `DROP TABLE articles CASCADE;`

**Error: "function does not exist"**
- Run migrations in order (001 → 005)
- Don't skip 004_functions.sql

### RLS Policy Issues

**Articles not visible:**
- Check RLS is enabled: `ALTER TABLE articles ENABLE ROW LEVEL SECURITY;`
- Verify policy exists: `SELECT * FROM pg_policies WHERE tablename = 'articles';`

## Next Steps (Phase 2)

After Phase 1 is complete:

1. Create Supabase client wrapper for web frontend
2. Update `useWikiData.ts` to query Supabase instead of JSON
3. Add authentication UI (login/signup)
4. Implement caching with ETag validation
5. Deploy updated frontend

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.gg/KgNBWyfcvZ
- GitHub Issues: https://github.com/dystopian-outcasts/wiki/issues
