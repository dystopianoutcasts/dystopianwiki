---
id: test-sync-article
slug: test-sync-article
title: Test Sync Article - Example
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - test
  - example
  - sync
excerpt: This is a test article to verify the markdown-to-Supabase sync script works correctly.
related_articles:
  - item-properties
  - recipe-basics
last_updated: 2026-01-19
---

# Test Sync Article - Example

## Overview

This article was created to test the new sync script (`npm run sync`).

## Purpose

The sync script should:
- ✅ Parse this YAML frontmatter
- ✅ Extract the markdown content
- ✅ Upload to Supabase database
- ✅ Make it appear on the website

## Code Example

```lua
-- Example Lua code
function TestFunction()
    print("Sync script working!")
end
```

## Table Example

| Property | Value | Description |
|----------|-------|-------------|
| id | test-sync-article | Unique identifier |
| difficulty | beginner | Article difficulty level |
| status | testing | Current status |

## Important Note

> **Note:** If you can see this article on the website, the sync script is working correctly!

## Next Steps

1. Delete this test article (if desired)
2. Create real articles using the same process
3. Run `npm run sync` after creating new articles

---

**Created:** 2026-01-19
**Purpose:** Testing sync functionality
