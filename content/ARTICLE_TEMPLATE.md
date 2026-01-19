---
# Article Metadata (YAML Frontmatter)
# Copy this template when creating new articles

id: unique-article-id              # URL-safe identifier (e.g., "weapons-guide")
slug: weapons-guide                # URL slug (usually same as id)
title: Article Title Here          # Display title
game: pz                           # Game identifier (pz, vs, etc.)
version: build-41                  # Version (build-41, build-42, etc.)
section: modding                   # Section (modding, mapping, etc.)
category: items                    # Category (items, recipes, lua-api, etc.)
subcategory: null                  # Optional subcategory
difficulty: intermediate           # beginner | intermediate | advanced
tags:                              # Array of searchable tags
  - weapons
  - items
  - vanilla-reference
excerpt: Brief description of the article (200 chars max, used in previews and search)
related_articles:                  # Array of related article slugs
  - item-properties
  - recipe-basics
table_of_contents:                 # Auto-generated or manual TOC
  - text: Section 1
    link: "#section-1"
  - text: Section 2
    link: "#section-2"
next_steps:                        # Suggested next articles
  - title: Next Article Title
    path: /build-41/modding/category/next-article
last_updated: 2026-01-18           # ISO date format (YYYY-MM-DD)
---

# Article Title Here

Your markdown content goes here.

## Section 1

Write naturally in markdown format:
- **Bold text**
- *Italic text*
- `code inline`

```lua
-- Code blocks with syntax highlighting
function MyFunction()
    print("Hello World")
end
```

## Section 2

### Subsection 2.1

Tables work too:

| Property | Type | Description |
|----------|------|-------------|
| MinDamage | float | Minimum damage dealt |
| MaxDamage | float | Maximum damage dealt |

### Subsection 2.2

> **Note:** Use blockquotes for important callouts

Images can be referenced:

![Alt text](/assets/images/example.png)

## Best Practices

1. Write clearly for beginners
2. Use code examples from actual game files
3. Cross-reference related articles
4. Keep excerpts under 200 characters
5. Use proper heading hierarchy (H1 → H2 → H3)

---

## Writing Tips

- **H1 (`#`)**: Article title only (one per file)
- **H2 (`##`)**: Major sections
- **H3 (`###`)**: Subsections
- **Code blocks**: Always specify language for syntax highlighting
- **Links**: Use relative paths for internal links
- **Tags**: Use lowercase, hyphenated tags for consistency
