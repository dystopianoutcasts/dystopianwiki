# Creating Articles - Complete Guide

**Last Updated:** 2026-01-19

## Quick Start (TL;DR)

1. Copy `content/ARTICLE_TEMPLATE.md`
2. Fill in YAML frontmatter (metadata at the top)
3. Write content in markdown
4. Save as `content/articles/pz/build-41/modding/category/your-slug.md`
5. Run `npm run sync:dry-run` to preview
6. Run `npm run sync` to publish to Supabase
7. Changes appear on the website immediately

---

## Table of Contents

- [File Structure](#file-structure)
- [Step-by-Step Tutorial](#step-by-step-tutorial)
- [YAML Frontmatter Reference](#yaml-frontmatter-reference)
- [Markdown Writing Tips](#markdown-writing-tips)
- [Syncing to Supabase](#syncing-to-supabase)
- [Common Issues](#common-issues)
- [Examples](#examples)

---

## File Structure

```
dystopianwiki/
├── content/
│   ├── ARTICLE_TEMPLATE.md          # Copy this to create new articles
│   ├── README.md                    # Quick reference
│   └── articles/
│       └── pz/                      # Game: Project Zomboid
│           └── build-41/            # Version: Build 41
│               └── modding/         # Section: Modding
│                   ├── items/       # Category: Items
│                   │   └── your-article.md
│                   ├── recipes/     # Category: Recipes
│                   ├── lua-api/     # Category: Lua API
│                   └── ...
└── scripts/
    └── sync-articles.ts             # Sync script (don't edit)
```

### Path Structure

Articles must follow this path pattern:
```
content/articles/{game}/{version}/{section}/{category}/{slug}.md
```

**Valid values:**
- **game**: `pz` (Project Zomboid), `vs` (Vintage Story)
- **version**: `build-41`, `build-42`, etc.
- **section**: `modding`, `mapping`, `scripting`, etc.
- **category**: `items`, `recipes`, `lua-api`, `weapons`, etc.

---

## Step-by-Step Tutorial

### 1. Copy the Template

```bash
# Copy the template
cp content/ARTICLE_TEMPLATE.md content/articles/pz/build-41/modding/items/my-first-weapon.md
```

### 2. Edit the YAML Frontmatter

Open the file and edit the metadata section at the top:

```yaml
---
id: my-first-weapon                    # Unique ID (URL-safe)
slug: my-first-weapon                  # URL slug (usually same as id)
title: Creating Your First Weapon      # Display title
game: pz                               # Game identifier
version: build-41                      # Game version
section: modding                       # Section
category: items                        # Category
subcategory: null                      # Optional subcategory
difficulty: beginner                   # beginner | intermediate | advanced
tags:                                  # Searchable tags (lowercase, hyphenated)
  - weapons
  - items
  - tutorial
excerpt: Learn how to create your first weapon mod in Project Zomboid by defining item properties and stats.
related_articles:                      # Related article slugs
  - item-properties
  - weapon-stats
last_updated: 2026-01-19               # Today's date (YYYY-MM-DD)
---
```

### 3. Write Your Content

Write after the closing `---` in markdown format:

```markdown
# Creating Your First Weapon

## Overview
In this guide, you'll learn how to create a custom weapon for Project Zomboid.

## Prerequisites
- Basic understanding of item scripts
- Text editor installed
- Project Zomboid modding folder set up

## Step 1: Create the Item File

Navigate to your mod's scripts folder and create `weapons.txt`:

\`\`\`lua
module MyMod {
    imports {
        Base
    }

    item CustomBat {
        DisplayName = Custom Baseball Bat,
        Type = Weapon,
        MinDamage = 0.6,
        MaxDamage = 1.2,
        Weight = 2.5,
    }
}
\`\`\`

## Step 2: Test Your Weapon

Load the game and test your weapon...
```

### 4. Preview Before Publishing

```bash
# Check what will be synced (safe, no changes made)
npm run sync:dry-run
```

Output:
```
🚀 Markdown → Supabase Sync

🔍 DRY RUN MODE - No changes will be made

📂 Found 1 markdown files

   [DRY RUN] Would upsert: my-first-weapon

📊 Summary:
   ✅ Synced: 1
   ❌ Failed: 0
   ⏭️  Skipped: 0
   📝 Total: 1

💡 Run without --dry-run to actually sync to Supabase
```

### 5. Publish to Supabase

```bash
# Actually sync to database
npm run sync
```

Your article is now live on the website!

---

## YAML Frontmatter Reference

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier (URL-safe) | `weapon-basics` |
| `slug` | string | URL slug (usually same as id) | `weapon-basics` |
| `title` | string | Display title | `Weapon Basics Guide` |
| `game` | string | Game identifier | `pz` or `vs` |
| `version` | string | Game version | `build-41` |
| `section` | string | Section category | `modding` |
| `category` | string | Article category | `items` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `subcategory` | string/null | Optional subcategory | `weapons` or `null` |
| `difficulty` | enum | Difficulty level | `beginner`, `intermediate`, `advanced` |
| `tags` | array | Searchable tags | `[weapons, items, vanilla]` |
| `excerpt` | string | Short description (200 chars max) | Auto-generated if missing |
| `related_articles` | array | Related article slugs | `[item-properties, recipe-basics]` |
| `table_of_contents` | array | Manual TOC (usually auto-generated) | See template |
| `next_steps` | array | Suggested next articles | See template |
| `last_updated` | date | Last update date (YYYY-MM-DD) | `2026-01-19` |

### Field Rules

**id/slug:**
- Must be unique across all articles
- Use lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Example: `lua-basics`, `item-properties-guide`

**tags:**
- Lowercase only
- Use hyphens for multi-word tags
- Max 10 tags per article
- Examples: `lua-api`, `advanced-scripting`, `vanilla-reference`

**difficulty:**
- `beginner` - No prior knowledge required
- `intermediate` - Basic understanding assumed
- `advanced` - Expert-level content

**excerpt:**
- Max 200 characters
- Brief summary for search results and previews
- Auto-generated from first paragraph if omitted

---

## Markdown Writing Tips

### Headings

```markdown
# Article Title (H1 - use once at the top)

## Major Section (H2)

### Subsection (H3)

#### Minor Heading (H4)
```

**Rules:**
- Only one H1 per article (the title)
- Use H2 for major sections
- Use H3 for subsections
- Don't skip levels (H2 → H4)

### Code Blocks

Always specify the language for syntax highlighting:

````markdown
```lua
function MyFunction()
    print("Hello World")
end
```

```json
{
  "name": "example"
}
```

```bash
npm install
```
````

**Supported languages:** `lua`, `json`, `javascript`, `typescript`, `bash`, `python`, `java`, `c`, `cpp`, `csharp`, `xml`, `html`, `css`

### Tables

```markdown
| Property | Type | Description |
|----------|------|-------------|
| MinDamage | float | Minimum damage dealt |
| MaxDamage | float | Maximum damage dealt |
| Weight | float | Item weight in kg |
```

### Lists

```markdown
**Unordered:**
- Item one
- Item two
  - Nested item
  - Another nested item

**Ordered:**
1. First step
2. Second step
3. Third step
```

### Emphasis

```markdown
**Bold text** for important terms
*Italic text* for emphasis
`code inline` for code snippets
```

### Links

```markdown
**Internal links** (to other articles):
[Item Properties Guide](/build-41/modding/items/item-properties)

**External links:**
[Official Wiki](https://pzwiki.net)
```

### Blockquotes

```markdown
> **Note:** This is an important callout
>
> You can use multiple lines

> **Warning:** Be careful with this feature
```

### Images

```markdown
![Alt text describing the image](/assets/images/example.png)
```

---

## Syncing to Supabase

### Prerequisites

1. **Environment variables set up** (`.env` file in project root):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Dependencies installed:**
   ```bash
   npm install
   ```

### Commands

```bash
# Preview changes (safe, no modifications)
npm run sync:dry-run

# Sync all articles to Supabase
npm run sync

# Sync a single article
npm run sync -- --file content/articles/pz/build-41/modding/items/my-article.md
```

### What Happens During Sync

1. Script scans `content/articles/` for `.md` files
2. Parses YAML frontmatter and markdown content
3. Validates required fields (id, slug, title, game, version, section, category)
4. Auto-generates excerpt if missing
5. Upserts to Supabase `articles` table (updates existing or creates new)
6. Shows summary of synced/failed/skipped articles

### Sync Output

```
🚀 Markdown → Supabase Sync

📂 Found 5 markdown files

   ✅ Synced: weapon-basics
   ✅ Synced: item-properties
   ⚠️  Skipping recipe-guide.md: Missing required fields: excerpt
   ✅ Synced: lua-introduction
   ✅ Synced: modding-setup

📊 Summary:
   ✅ Synced: 4
   ❌ Failed: 0
   ⏭️  Skipped: 1
   📝 Total: 5
```

---

## Common Issues

### Issue: "Missing required fields"

**Problem:** Article is missing required frontmatter fields.

**Solution:** Ensure these fields are present:
```yaml
---
id: unique-id
slug: unique-slug
title: Article Title
game: pz
version: build-41
section: modding
category: items
---
```

### Issue: "Duplicate slug"

**Problem:** Another article already uses this slug.

**Solution:**
1. Make the slug more specific: `weapon-guide` → `pz-weapon-guide`
2. Or update the existing article instead of creating a new one

### Issue: Sync script doesn't find my article

**Problem:** Article not in correct directory structure.

**Solution:** Ensure path matches pattern:
```
content/articles/{game}/{version}/{section}/{category}/your-article.md
```

Example: `content/articles/pz/build-41/modding/items/weapon-guide.md`

### Issue: Changes not appearing on website

**Problem:** Article synced but not visible.

**Solutions:**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check article is published (no draft status)
3. Verify Supabase connection in web app
4. Check browser console for errors

---

## Examples

### Example 1: Beginner Tutorial

**File:** `content/articles/pz/build-41/modding/items/first-item.md`

```yaml
---
id: first-item
slug: first-item
title: Creating Your First Item
game: pz
version: build-41
section: modding
category: items
difficulty: beginner
tags:
  - tutorial
  - items
  - beginner
excerpt: A step-by-step guide to creating your first custom item in Project Zomboid modding.
related_articles:
  - item-properties
  - mod-structure
last_updated: 2026-01-19
---

# Creating Your First Item

Welcome to Project Zomboid modding! In this tutorial, you'll create a simple custom item.

## Prerequisites

Before starting, make sure you have:
- Project Zomboid installed
- A text editor (VS Code recommended)
- Basic understanding of file structures

## Step 1: Set Up Your Mod Folder

Navigate to your mods directory...
```

### Example 2: Advanced Reference

**File:** `content/articles/pz/build-41/modding/lua-api/inventory-api.md`

```yaml
---
id: inventory-api-reference
slug: inventory-api-reference
title: Inventory API Reference
game: pz
version: build-41
section: modding
category: lua-api
difficulty: advanced
tags:
  - lua
  - api
  - inventory
  - reference
excerpt: Complete reference guide for Project Zomboid's Inventory Lua API, including methods, properties, and usage examples.
related_articles:
  - lua-basics
  - item-manipulation
  - player-api
last_updated: 2026-01-19
---

# Inventory API Reference

## Overview

The Inventory API provides methods for manipulating items in containers, player inventories, and the game world.

## Methods

### `inventory:AddItem(item)`

Adds an item to the inventory.

**Parameters:**
- `item` (InventoryItem) - The item to add

**Returns:** boolean - Success status

**Example:**
\`\`\`lua
local inventory = player:getInventory()
local success = inventory:AddItem("Base.Axe")
\`\`\`
```

---

## Quick Reference Card

### File Naming

✅ **Good:**
- `weapon-basics.md`
- `lua-api-intro.md`
- `recipe-creation-guide.md`

❌ **Bad:**
- `Weapon Basics.md` (spaces)
- `weaponBasics.md` (camelCase)
- `weapon_basics.md` (underscores)

### Frontmatter Checklist

```yaml
---
✅ id: unique-slug
✅ slug: same-as-id
✅ title: Human Readable Title
✅ game: pz
✅ version: build-41
✅ section: modding
✅ category: items
✅ difficulty: beginner
✅ tags: [tag1, tag2]
✅ excerpt: Short description
✅ last_updated: 2026-01-19
---
```

### Workflow

1. **Create** → Copy template
2. **Edit** → Fill frontmatter + write content
3. **Preview** → `npm run sync:dry-run`
4. **Publish** → `npm run sync`
5. **Verify** → Check website

---

## Writing Standards: V3 Template

**IMPORTANT:** All articles should follow the **V3 Article Standards** for beginner-friendly, emotionally scaffolded content.

See: [docs/article-standards.md](article-standards.md)

### Key V3 Principles

1. **Write AS IF you ARE a beginner** - Not writing FOR beginners, but experiencing it with them
2. **Emotional scaffolding** - Acknowledge overwhelm, promise manageability, prove it, summarize
3. **Game experience opening** - Start with something the reader has seen in-game
4. **Simplest example first** - 5-line minimum viable code before complexity
5. **Progressive building** - Show Version 1, 2, 3 of the same feature
6. **Common Mistakes** - Show wrong code vs right code with explanations
7. **Try It Yourself** - Step-by-step verification instructions
8. **Term definitions** - Define technical terms inline when first used
9. **Mid-article Key Takeaways** - Summarize complex sections immediately
10. **Pattern teaching** - Use 4-step templates for complex sections (show pattern, explain parts, demonstrate variations, when to use)

### Quick V3 Checklist

✅ Opens with game experience reader has seen
✅ Has "Prerequisites" section with links
✅ Shows simplest example first (5-10 lines max)
✅ Includes "Try It Yourself" section
✅ Has "Common Mistakes" with wrong/right code
✅ Defines technical terms inline
✅ Uses emotional scaffolding phrases
✅ Progressive building (Version 1 → 2 → 3)
✅ "What's Next?" section with related articles

For complete details, examples, and phrase libraries, see [article-standards.md](article-standards.md).

---

## Need Help?

- **Template:** `content/ARTICLE_TEMPLATE.md`
- **Quick Guide:** `content/README.md`
- **Script Issues:** Check `.env` file has Supabase credentials
- **Markdown Help:** [GitHub Markdown Guide](https://guides.github.com/features/mastering-markdown/)

---

## Don'ts

❌ **Don't** create JSON files - Use markdown with YAML frontmatter
❌ **Don't** follow old v1 documentation - Use this guide
❌ **Don't** edit files in `_archive-v1/` - Create new files in `content/articles/`
❌ **Don't** manually insert into Supabase - Use `npm run sync`
❌ **Don't** forget to run `npm run sync` after creating articles

✅ **Do** use the template
✅ **Do** preview with `--dry-run` first
✅ **Do** follow the file structure
✅ **Do** write in markdown
✅ **Do** ask if you're unsure!
