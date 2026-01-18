# Dystopian Wiki Documentation

> **Living Document** - These docs track our plans, progress, and technical decisions.

This folder contains planning documents and technical specs for the Dystopian Outcasts Wiki project.

## Documents

| Document | Description | Status |
|----------|-------------|--------|
| [API Architecture](./api-architecture.md) | Per-game versioned API structure | **Active** |
| [Tech Stack Overview](./tech-stack-overview.md) | What each technology does and why we chose it | Planned |
| [Mobile App Architecture](./mobile-app-architecture.md) | How the mobile app will be structured | Planned |
| [Rate Limiting Strategy](./rate-limiting-strategy.md) | How we handle traffic and prevent abuse | Planned |
| [Infrastructure & Hosting](./infrastructure-hosting.md) | Where things run and what they cost | Planned |
| [Migration Plan](./migration-plan.md) | Step-by-step plan to go from wiki to app | Planned |

Also see:
- [CLAUDE.md](../CLAUDE.md) - Main project context, progress tracking, PZ documentation status

---

## Current Sprint: API Restructure

**Goal**: Migrate from `/data/` to `/api/{game}/v1/` structure for per-game versioning.

### What We're Doing

1. **Game-Agnostic Landing Page** - ✅ DONE
   - Game selector cards (PZ, Vintage Story)
   - About Dystopian Outcasts section
   - URL routing with game prefix (`/pz/build-41/modding/...`)

2. **Per-Game API Versioning** - 🔄 IN PROGRESS
   - New structure: `/api/pz/v1/build-41/modding/...`
   - Each game can evolve independently
   - See [API Architecture](./api-architecture.md) for full details

### Migration Checklist

```
✅ Created /api/ folder structure
✅ Created games.json manifest
✅ Copied PZ data to /api/pz/v1/
✅ Created PZ versions.json and sections.json
✅ Updated frontend routes for /pz/ prefix
✅ Created useGameContext hook
✅ Updated Sidebar navigation links
✅ Updated Breadcrumbs
✅ Updated SectionPage, CategoryPage, ArticlePage

⬜ Update useWikiData.ts to fetch from /api/ paths
⬜ Update Sidebar data fetching to use /api/
⬜ Update search functionality
⬜ Update Python parser output paths
⬜ Remove old /data/ folder
⬜ Update cache manifest generation
```

### New File Structure

```
public/
├── api/                         # NEW - API with per-game versioning
│   ├── games.json              # List of all games
│   └── pz/
│       └── v1/
│           ├── versions.json   # PZ versions (build-41, build-42)
│           ├── sections.json   # PZ sections
│           └── build-41/       # All PZ content
│               ├── modding/
│               ├── mapping/
│               └── learning-path/
│
├── data/                        # OLD - To be removed after migration
│   └── build-41/
│       └── ...
```

### Key Code Changes

| File | Change |
|------|--------|
| `src/hooks/useGameContext.ts` | NEW - Provides game context and path building |
| `src/components/landing/GameCards.tsx` | NEW - Game selector on landing page |
| `src/components/landing/AboutSection.tsx` | NEW - About Dystopian Outcasts |
| `src/pages/HomePage.tsx` | Updated - Uses new landing components |
| `src/pages/SectionPage.tsx` | Updated - Uses `buildPath()` for links |
| `src/pages/CategoryPage.tsx` | Updated - Uses `buildPath()` for links |
| `src/pages/ArticlePage.tsx` | Updated - Uses `buildPath()` for links |
| `src/components/layout/Sidebar.tsx` | Updated - Game-aware navigation |
| `src/components/layout/Breadcrumbs.tsx` | Updated - Added PZ/VS display names |
| `src/App.tsx` | Updated - Added `/pz/` routes |

---

## Quick Context

We're building a game-agnostic wiki for the Dystopian Outcasts community, starting with Project Zomboid and expanding to Vintage Story and other games.

### Current Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Hosting**: GitHub Pages (static)
- **Data**: JSON files served as static API
- **Caching**: IndexedDB with content manifest invalidation

### Future Plans
- Cross-platform mobile app (React Native + Expo)
- Backend migration to Supabase
- User accounts and community features

## Why Per-Game API Versioning?

We chose `/api/pz/v1/...` over `/api/v1/pz/...` because:

1. **Independent Evolution** - PZ can be on v2 while VS is still on v1
2. **Isolated Deployments** - Changes to PZ don't affect VS
3. **Different Teams** - Contributors can work on different games without blocking each other
4. **Gradual Migration** - Deprecate old versions per-game without disrupting others

---

## Content Status

### Project Zomboid (PZ)

**Phase 1: Script Files (.txt)** - ✅ COMPLETE
- 16 vanilla-reference articles
- Weapons (152), Food (464), Clothing (776), Items (466)
- Recipes (292), Evolved Recipes (38), Fixing (76)
- Vehicle Items (97), Sounds (390), Radio (23)
- Plus explanatory guides for weapons and repair systems

**Phase 2: Lua Source** - 🔄 PARTIAL
- ISUI Framework (4 articles)
- Events System (4 articles)
- Timed Actions, Context Menus, Foraging

**Phase 3: Java API** - ⬜ NOT STARTED

### Vintage Story (VS)
- ⬜ Structure not yet created
- Placeholder in games.json with "coming-soon" status
