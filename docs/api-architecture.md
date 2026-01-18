# API Architecture

> **Living Document** - Last updated: 2026-01-18

This document describes the data/API architecture for the Dystopian Outcasts Wiki, including the per-game versioning system.

## Overview

The wiki serves content through a static JSON API. Each game has its own API namespace with independent versioning, allowing games to evolve at different rates without affecting each other.

## URL Structure

### Frontend Routes (User-facing URLs)
```
/                                    # Landing page (game selector)
/pz/build-41/modding/items/katana   # PZ article
/vs/1.19/modding/blocks/custom      # VS article (future)
```

### API Routes (Data fetching)
```
/api/games.json                      # List of all games
/api/pz/v1/versions.json            # PZ versions list
/api/pz/v1/sections.json            # PZ sections
/api/pz/v1/build-41/modding/...     # PZ content
/api/vs/v1/versions.json            # VS versions (future)
```

## Directory Structure

```
public/
├── api/
│   ├── games.json                   # Global games manifest
│   ├── manifest.json                # Cache invalidation manifest
│   │
│   ├── pz/                          # Project Zomboid
│   │   └── v1/                      # API version 1
│   │       ├── versions.json        # Game versions (build-41, build-42)
│   │       ├── sections.json        # Available sections
│   │       ├── search-index.json    # Search index
│   │       └── build-41/            # Game version
│   │           ├── modding/
│   │           │   ├── categories.json
│   │           │   ├── section-info.json
│   │           │   ├── items/
│   │           │   │   ├── index.json
│   │           │   │   ├── katana.json
│   │           │   │   └── ...
│   │           │   └── [other-categories]/
│   │           ├── mapping/
│   │           └── learning-path/
│   │
│   └── vs/                          # Vintage Story (future)
│       └── v1/
│           ├── versions.json
│           └── 1.19/
│               └── ...
│
└── assets/                          # Static assets (images, etc.)
    └── games/
        ├── pz-icon.png
        └── vs-icon.png
```

## API Versioning Strategy

### Why Per-Game Versioning?

We chose per-game API versioning (`/api/pz/v1/...`) over global versioning (`/api/v1/pz/...`) because:

1. **Independent Evolution**: PZ can be on API v2 while VS is still on v1
2. **Isolated Deployments**: Changes to PZ don't affect VS
3. **Different Teams**: Contributors can work on different games without blocking each other
4. **Gradual Migration**: Deprecate old versions per-game without disrupting others

### When to Bump API Version

Create a new API version (v2) when making **breaking changes**:
- Removing or renaming JSON fields
- Changing the structure of responses
- Removing endpoints

**Non-breaking changes** (don't require version bump):
- Adding new fields to responses
- Adding new endpoints
- Bug fixes

## Key Files

### /api/games.json
Lists all supported games with metadata:
```json
{
  "games": [
    {
      "id": "pz",
      "name": "Project Zomboid",
      "shortName": "PZ",
      "description": "The ultimate zombie survival sandbox",
      "icon": "/assets/games/pz-icon.png",
      "color": "#4a7c59",
      "apiVersion": "v1",
      "status": "active"
    },
    {
      "id": "vs",
      "name": "Vintage Story",
      "shortName": "VS",
      "apiVersion": "v1",
      "status": "coming-soon"
    }
  ]
}
```

### /api/{game}/v1/versions.json
Lists game versions:
```json
{
  "game": "pz",
  "apiVersion": "v1",
  "defaultVersion": "build-41",
  "versions": [
    {
      "id": "build-41",
      "name": "Build 41",
      "status": "current",
      "sections": ["modding", "mapping"]
    }
  ]
}
```

### /api/{game}/v1/sections.json
Lists available sections:
```json
{
  "game": "pz",
  "apiVersion": "v1",
  "sections": [
    { "id": "modding", "name": "Modding", "icon": "🔌" },
    { "id": "mapping", "name": "Mapping", "icon": "🗺️" }
  ]
}
```

## Code Integration

### useGameContext Hook
Provides game context and path building:
```typescript
const { gameId, gameName, basePath, buildPath } = useGameContext();

// Build frontend URLs
buildPath('build-41', 'modding', 'items', 'katana')
// Returns: '/pz/build-41/modding/items/katana'
```

### useWikiData Hooks
Fetch data from API (needs update to use new paths):
```typescript
// OLD (to be deprecated)
fetch('/data/build-41/modding/categories.json')

// NEW
fetch('/api/pz/v1/build-41/modding/categories.json')
```

## Migration Status

### Completed
- [x] Created `/api/` folder structure
- [x] Created `games.json` manifest
- [x] Copied PZ data to `/api/pz/v1/`
- [x] Created PZ `versions.json` and `sections.json`
- [x] Updated frontend routes for `/pz/` prefix
- [x] Created `useGameContext` hook
- [x] Updated navigation components (Sidebar, Breadcrumbs)
- [x] Updated page components (SectionPage, CategoryPage, ArticlePage)

### In Progress
- [ ] Update `useWikiData.ts` to fetch from `/api/` paths
- [ ] Update `Sidebar.tsx` data fetching
- [ ] Update search functionality

### TODO
- [ ] Update Python parser to output to new paths
- [ ] Remove old `/data/` folder
- [ ] Update cache manifest generation
- [ ] Add VS placeholder structure

## Adding a New Game

1. Create folder: `/api/{game-id}/v1/`
2. Add to `games.json`
3. Create `versions.json` and `sections.json`
4. Add game version folder with content
5. Add game icon to `/assets/games/`
6. Update `GameCards.tsx` to show the game

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Main project context and progress tracking
- [Tech Stack Overview](./tech-stack-overview.md) - Technology choices
- [Migration Plan](./migration-plan.md) - Full app migration plan
