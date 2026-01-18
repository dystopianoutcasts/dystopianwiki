# CLAUDE.md - Dystopian Outcasts Wiki

> **Living Document** - This file tracks the ongoing effort to build the Dystopian Outcasts wiki - a comprehensive documentation hub for survival game modding and community resources.

## Project Overview

A **game-agnostic** React + TypeScript wiki for the Dystopian Outcasts community, hosted on GitHub Pages. The wiki covers:
- **Project Zomboid** - Modding guides, Lua API, vanilla documentation
- **Vintage Story** - Coming soon
- **Future games** - Expandable architecture

### URL Structure

The wiki uses a game-prefixed URL structure:
- `/` - Main landing page (game selector)
- `/pz/build-41/modding/...` - Project Zomboid content
- `/vs/...` - Vintage Story content (future)

## Quick Start for LLMs

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build (runs manifest generation first)

# Python parser for extracting vanilla data (bulk data extraction)
python scripts/pz_parser.py stats              # See all script file item counts
python scripts/pz_parser.py generate           # Generate all reference articles
python scripts/pz_parser.py parse <file.txt>   # Parse specific file to JSON

# Content is in public/data/build-41/modding/
# Articles are JSON files with markdown content
```

## Division of Labor

**Python (`scripts/pz_parser.py`)** handles mechanical extraction:
- Parsing all items/weapons/food from .txt files
- Generating tables with stats
- Bulk data organization

**LLM/Human** handles understanding and explanation:
- What each property does and why
- How systems connect (skills, repair, recipes)
- Practical modding guidance
- Beginner-friendly explanations

## Key File Locations

| Purpose | Location |
|---------|----------|
| Wiki source | `c:\Users\ediaz\Desktop\DystopeanOutcasts\Dystopian_Wiki\` |
| Existing research docs | `C:\Users\ediaz\Desktop\DystopeanOutcasts\OutcastTESTING_DOCS\` |
| PZ game files | `R:\Games\Steam\steamapps\common\ProjectZomboid\media\` |
| PZ Lua source | `R:\Games\Steam\steamapps\common\ProjectZomboid\media\lua\` |
| PZ Script files | `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\` |

## Architecture

- **React 18 + TypeScript** - UI framework
- **Vite** - Build tool, configured for GitHub Pages
- **JSON files** - Content storage (no backend)
- **IndexedDB** - Client-side caching via `idb` library
- **Content Manifest** - Cache invalidation system (`content-manifest.json`)

## Content Structure

```
public/data/
├── versions.json           # Version list
├── sections.json           # Section definitions
├── search-index.json       # Global search index
├── content-manifest.json   # Generated file hashes for cache invalidation
└── build-41/
    └── modding/
        ├── fundamentals/   # Mod basics, file types
        ├── items/          # Item creation guides
        ├── recipes/        # Recipe creation guides
        ├── lua-api/        # Lua reference
        ├── game-mechanics/ # System overviews
        ├── weapon-repair/  # Repair system (complete)
        ├── foraging/       # Foraging system
        ├── reference/      # Quick references
        └── [more to come]
```

## Article JSON Format

```json
{
  "id": "unique-article-id",
  "title": "Article Title",
  "slug": "url-slug",
  "version": "build-41",
  "section": "modding",
  "category": "items",
  "tags": ["tag1", "tag2"],
  "difficulty": "beginner|intermediate|advanced",
  "content": "Markdown content here...",
  "excerpt": "First 200 chars for preview",
  "lastUpdated": "2026-01-11",
  "relatedArticles": ["other-slug"],
  "nextSteps": [
    { "title": "Next Article", "path": "/build-41/modding/category/slug" }
  ]
}
```

---

# Vanilla Documentation Initiative

## Goal

Systematically document ALL exposed Project Zomboid source code:
- **153** script .txt files (items, recipes, vehicles, sounds)
- **888** Lua files (client, server, shared)
- **Java API** accessible through Lua bridge

## Current Progress

### Phase 1: Script Files (.txt)
| Category | Status | Articles | Items |
|----------|--------|----------|-------|
| Weapons | COMPLETE | 2 (reference + guide) | 152 weapons |
| Weapon Properties | COMPLETE | 1 (explanatory guide) | - |
| Food | COMPLETE | 1 | 464 items |
| Clothing | COMPLETE | 1 | 776 items |
| Items (general) | COMPLETE | 2 | 466 items |
| Literature | COMPLETE | 1 | 103 items |
| Bags | COMPLETE | 1 | 21 items |
| Farming | COMPLETE | 1 | 39 items |
| Recipes | COMPLETE | 1 | 292 recipes |
| Evolved Recipes | COMPLETE | 1 | 38 recipes |
| Fixing/Repair | COMPLETE | 2 (reference + guide) | 76 entries |
| Vehicle Items | COMPLETE | 1 | 97 items |
| Sounds | COMPLETE | 1 | 390 sounds |
| Radio | COMPLETE | 1 | 23 items |

### Phase 2: Lua Source
| Category | Status | Articles |
|----------|--------|----------|
| ISBaseObject | NOT STARTED | 0 |
| ISUI Framework | PARTIAL (4 articles) | 4 |
| Timed Actions | PARTIAL | 1 |
| Context Menus | PARTIAL | 1 |
| Events System | PARTIAL | 4 |
| Farming | NOT STARTED | 0 |
| Foraging | PARTIAL | 1 |
| Fishing | NOT STARTED | 0 |

### Phase 3: Java API
| Category | Status | Articles |
|----------|--------|----------|
| Player/Character | NOT STARTED | 0 |
| InventoryItem | PARTIAL (in API_Research) | - |
| HandWeapon | PARTIAL (in API_Research) | - |
| World/Cell | NOT STARTED | 0 |
| Vehicles | NOT STARTED | 0 |

## Methodology

### For Script Files (.txt)

1. **Read the source file** from `R:\...\media\scripts\`
2. **Understand the module structure** - items are wrapped in `module Base { ... }`
3. **Document each definition** with all properties
4. **Explain property purposes** - what does `MaxDamage` actually affect?
5. **Provide modding context** - how to override/extend

### For Lua Files

1. **Identify the file's purpose** from folder structure
2. **Document public functions** with signatures and examples
3. **Map dependencies** - what does it `require`?
4. **Note event hooks** - what events does it use?
5. **Explain patterns** - how is this meant to be used?

### For Java API

1. **Start from Lua usage** - how do modders access it?
2. **Document available methods** with return types
3. **Show working examples** tested in-game
4. **Note limitations** - what CAN'T you do?

## Writing Style

- **Beginner-friendly first** - assume the reader is new to modding
- **Show real examples** - use actual vanilla values, not made-up ones
- **Explain the "why"** - not just what properties exist, but what they do
- **Cross-reference** - link to related articles

## Important Context

### PZ Script Format (.txt files)

```
module Base {
    item Katana {
        Type = Weapon,
        DisplayName = Katana,
        MinDamage = 0.8,
        MaxDamage = 1.3,
        Categories = Blade,
        ...
    }
}
```

- `module` is a namespace (prevents naming conflicts)
- Full item reference is `Module.ItemName` (e.g., `Base.Katana`)
- Properties are `Key = Value` pairs
- The game parses these at startup

### PZ Lua Structure

- `client/` - UI, rendering, local player actions
- `server/` - Game logic, spawning, world state
- `shared/` - Code used by both (utilities, definitions)
- Everything inherits from `ISBaseObject` pattern

---

## Files to Reference

### Already Migrated to Wiki
- Weapon repair system (complete)
- Events overview
- ISUI basics
- Recipe/item creation guides

### Ready to Migrate (in OutcastTESTING_DOCS)
- `API_Research/` - Java-Lua bridge docs
- `Weapon_Repair_Research/` - Already in wiki
- `FORAGING_RESEARCH/` - Foraging breakdown
- `vanilla_xp_system/` - XP mechanics
- `PZ_Injury_System_Reference.md` - Health system
- `PZ_Literature_System_Complete_Guide.md` - Books
- `SOUND_REFERENCE.md` - Sound system
- `ANIMATION_REFERENCE.md` - Animations

### Proprietary (DO NOT migrate)
- `outcast_smithing_master/`
- `techblade/`, `Techblade_System/`
- `Prestige/`
- `bullet-factory-system/`
- Any "Outcast" named files

---

## Technical Notes

### Caching System

The wiki uses IndexedDB caching with content manifest invalidation:
- `CacheManager.ts` handles all caching
- `content-manifest.json` is generated at build time with file hashes
- On app load, manifest is fetched (cache-busted) and compared
- Stale entries are invalidated automatically

### Adding New Articles

1. Create JSON file in appropriate `public/data/build-41/modding/{category}/` folder
2. Add to `index.json` in that category
3. Run `npm run build` to regenerate manifest
4. Article will appear in wiki navigation

---

## Current Session Context

*Last updated: 2026-01-18*

### Recent Major Changes

**Wiki Restructure to Game-Agnostic:**
- New unified landing page with game selector cards
- Added About Dystopian Outcasts section
- URL structure now includes game prefix (`/pz/build-41/modding/...`)
- Updated all internal navigation to use game-aware paths
- Created `useGameContext` hook for consistent URL building
- Legacy routes still work for backwards compatibility

**New Components:**
- `GameCards.tsx` - Game selector cards (PZ, Vintage Story)
- `AboutSection.tsx` - About Dystopian Outcasts section
- `useGameContext.ts` - Hook for game-aware URL generation

### PZ Documentation Progress

**Phase 1 Script Files - COMPLETE:**
- All items (weapons, food, clothing, farming, bags, literature)
- All recipes (regular and evolved)
- Fixing/repair system (reference + guide)
- Vehicle items (97 parts)
- Sounds (390 definitions)
- Radio items (23)
- **16 vanilla-reference articles** total

### Next Priorities

1. Add Vintage Story content structure
2. Continue Phase 2: Lua source documentation for PZ
3. Document remaining PZ script files (moveables, animations)
4. Add server configuration guides
