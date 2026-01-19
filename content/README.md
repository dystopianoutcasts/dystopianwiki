# Content Management - Quick Reference

**IMPORTANT:** This is the ONLY correct way to create articles. Do NOT create JSON files or follow old v1 methods.

## Quick Start

```bash
# 1. Copy the template
cp content/ARTICLE_TEMPLATE.md content/articles/pz/build-41/modding/items/my-article.md

# 2. Edit the file (fill in YAML frontmatter at top, write markdown content)

# 3. Preview changes (safe, no database changes)
npm run sync:dry-run

# 4. Publish to database
npm run sync

# 5. Check the website - your article is live!
```

## File Structure

```
content/
├── ARTICLE_TEMPLATE.md          ← Copy this to create new articles
├── README.md                    ← You are here
└── articles/
    └── {game}/                  ← Game (pz, vs)
        └── {version}/           ← Version (build-41, build-42)
            └── {section}/       ← Section (modding, mapping)
                └── {category}/  ← Category (items, recipes, lua-api)
                    └── your-article.md
```

**Example path:**
```
content/articles/pz/build-41/modding/items/weapon-guide.md
```

## Required YAML Frontmatter

Every article needs this metadata at the top:

```yaml
---
id: unique-article-id
slug: unique-article-id
title: Display Title Here
game: pz
version: build-41
section: modding
category: items
difficulty: beginner
tags:
  - tag1
  - tag2
excerpt: Brief description (auto-generated if omitted)
last_updated: 2026-01-19
---
```

Then write your content in markdown below the `---`.

## Commands

| Command | Description |
|---------|-------------|
| `npm run sync:dry-run` | Preview what will be synced (safe, no changes) |
| `npm run sync` | Sync all articles to Supabase database |
| `npm run sync -- --file path/to/article.md` | Sync a single article |

## Common Mistakes to Avoid

❌ **DON'T:**
- Create `.json` files
- Use spaces in filenames
- Edit files in `_archive-v1/`
- Manually insert into Supabase dashboard
- Follow old documentation

✅ **DO:**
- Use `ARTICLE_TEMPLATE.md` as starting point
- Use markdown (`.md`) files
- Follow the file structure above
- Run `npm run sync` to publish
- Read the full guide: `docs/CREATING_ARTICLES.md`

## Need Help?

- **Full documentation:** `docs/CREATING_ARTICLES.md`
- **Article template:** `ARTICLE_TEMPLATE.md` (in this folder)
- **Script source:** `scripts/sync-articles.ts`

## Workflow Diagram

```
1. Copy Template
   ↓
2. Edit File (YAML + Markdown)
   ↓
3. npm run sync:dry-run (preview)
   ↓
4. npm run sync (publish)
   ↓
5. Article appears on website ✅
```

## Environment Setup

Make sure you have `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Without this, the sync script won't work.

## Summary

**Source of Truth:** Markdown files in `content/articles/`
**Database:** Supabase (synced via `npm run sync`)
**Website:** Reads from Supabase

Write markdown → Sync to Supabase → Appears on website
