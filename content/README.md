# Content Management - Quick Reference

**IMPORTANT:** Articles are markdown files in this folder, synced to Supabase. Do NOT create JSON files or follow the old v1 methods.

## Quick Start

```bash
# 1. Copy the template
cp content/ARTICLE_TEMPLATE.md content/articles/pz/build-42/modding/items-and-scripting/my-article.md

# 2. Edit the file (fill in the YAML frontmatter at the top, write markdown below it)

# 3. Regenerate navigation (sidebar, section pages, search index, sitemap)
npm run nav
npm run sitemap

# 4. Preview the sync (safe, no database changes)
npm run sync:dry-run

# 5. Publish to the database
npm run sync

# 6. If you added a category, write its row to the database too
npm run nav:db
```

## File Structure

```
content/
  ARTICLE_TEMPLATE.md            Copy this to create a new article
  README.md                      You are here
  versions.config.json           Version list and the default version
  articles/
    pz/                          Game (always pz)
      {version}/                 build-42 (current) or build-41 (legacy)
        {section}/               modding, mapping, vehicles, outcast-mods
          _section.json          Section name, description, icon, order
          {category}/            cookbook, fundamentals, reference, ...
            _category.json       Category name, description, icon, order
            your-article.md
  drafts/                        Not synced and never committed (gitignored)
    pz/{version}/{section}/{category}/draft.md
```

**Example paths:**
```
content/articles/pz/build-42/modding/cookbook/project-skeleton.md
content/articles/pz/build-42/mapping/fundamentals/mapping-overview.md
content/articles/pz/build-41/modding/items/item-anatomy.md
```

The URL of an article is its path without `content/articles` and `.md`:
`/pz/build-42/modding/cookbook/project-skeleton`.

## Section and category metadata

Every section folder may hold `_section.json` and every category folder `_category.json`,
both with the same four keys:

```json
{
  "name": "Cookbook",
  "description": "Copy-ready skeletons for every common Build 42 mod type.",
  "icon": "wrench",
  "displayOrder": 11
}
```

`icon` is one short word (`plug`, `map`, `car`, `book`, `wrench`), never an emoji. A missing
file falls back to a title-cased folder name, an empty description, icon `book` and
displayOrder 999. The sync ignores these files; `npm run nav` reads them.

## Required YAML Frontmatter

```yaml
---
id: build-42-my-article
slug: my-article
title: Display Title Here
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: beginner
tags:
  - tag1
  - tag2
excerpt: Brief description (auto-generated if omitted)
last_updated: 2026-09-29
---
```

- A slug must be unique within its version; the same slug may exist in build-41 and build-42.
- Build 42 ids are `build-42-{slug}`; the sync derives the id when `id` is omitted.
- `version`, `section` and `category` must match the folders the file is in.

## Drafts

`content/drafts/` holds articles that are not ready to publish. It is gitignored: drafts are
never committed and never synced. To publish a draft, edit it, move it to the matching
path under `content/articles/`, then run the commands in Quick Start. A published article
must not link to a draft; the import tool writes such links as plain text marked
"(not yet published)", and `npm run import:check-links` fails on any that remain.

## Commands

| Command | Description |
|---------|-------------|
| `npm run nav` | Regenerate navigation data from the content tree (versions.json, categories, search index, versions.generated.ts) |
| `npm run nav:db` | Same, and upsert `public.categories`, deleting category rows the content tree no longer has |
| `npm run sitemap` | Regenerate `packages/web/public/sitemap.xml` from the navigation data |
| `npm run sync:dry-run` | Preview what will be synced (safe, no changes) |
| `npm run sync` | Sync all articles to the Supabase database |
| `npm run sync -- --file path/to/article.md` | Sync a single article |
| `npm run import:b42` | Re-import the Build 42 reference documents from `scripts/import/manifests/` |
| `npm run import:check-links` | Check internal links and slug uniqueness in build-42 articles and drafts |

The import tool and its manifests are documented in `scripts/import/README.md`.

## Common Mistakes to Avoid

**Do not:**
- Create `.json` article files
- Use spaces in filenames
- Edit files in `_archive-v1/`
- Insert rows by hand in the Supabase dashboard
- Commit anything under `content/drafts/`

**Do:**
- Start from `ARTICLE_TEMPLATE.md`
- Follow the file structure above
- Run `npm run nav` after adding, moving or removing an article
- Run `npm run sync` to publish
- Read the full guide: `docs/CREATING_ARTICLES.md`

## Environment Setup

The sync and `npm run nav:db` read the Supabase URL and a key from the root `.env` file
(`SUPABASE_URL` or `VITE_SUPABASE_URL`, and `SUPABASE_SERVICE_KEY`). Writing articles and
categories needs the service key; ask the project owner. Never commit `.env`.

## Summary

**Source of truth:** markdown files in `content/articles/`
**Database:** Supabase (synced via `npm run sync`)
**Website:** reads articles from Supabase and navigation from the generated data

Write markdown -> `npm run nav` -> `npm run sync` -> appears on the website
