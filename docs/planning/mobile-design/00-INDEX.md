# Mobile UI/UX Design System - Index

> **Source Document:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` (master copy - do not edit)
>
> **Purpose:** These sub-documents break the master spec into LLM-processable chunks.

## Document Map

| # | Document | Description | Lines |
|---|----------|-------------|-------|
| 01 | [Design Philosophy](01-DESIGN-PHILOSOPHY.md) | Core principles, reading modes, guiding philosophy | ~30 |
| 02 | [Color System](02-COLOR-SYSTEM.md) | Navy/accent ramps, semantic tokens, contrast verification | ~110 |
| 03 | [Typography](03-TYPOGRAPHY.md) | Font usage, reading specs, dynamic type support | ~50 |
| 04 | [Navigation Structure](04-NAVIGATION.md) | Bottom tabs, game context rules, deep linking | ~60 |
| 05 | [Screen: Home](05-SCREEN-HOME.md) | Bento layout, search, game cards, continue reading | ~50 |
| 06 | [Screen: Article](06-SCREEN-ARTICLE.md) | Article layout, TOC, markdown renderer rules | ~100 |
| 07 | [Screen: Search](07-SCREEN-SEARCH.md) | Filters, ranking, results, empty states | ~120 |
| 08 | [Screen: Bookmarks](08-SCREEN-BOOKMARKS.md) | Saved articles, tabs, progress, empty state | ~50 |
| 09 | [Screen: Profile](09-SCREEN-PROFILE.md) | User info, stats, settings, account actions | ~50 |
| 10 | [Screen: Categories](10-SCREEN-CATEGORIES.md) | Category browsing, game/version context | ~40 |
| 11 | [Screen: Auth](11-SCREEN-AUTH.md) | Sign in/up, OAuth, legal links | ~40 |
| 12 | [Components](12-COMPONENTS.md) | Cards, buttons, badges, inputs specifications | ~70 |
| 13 | [Animations](13-ANIMATIONS.md) | Transitions, touch feedback, haptics, loading states | ~80 |
| 14 | [Offline UX](14-OFFLINE-UX.md) | Download states, storage management, sync, caching | ~200 |
| 15 | [Accessibility](15-ACCESSIBILITY.md) | Touch targets, contrast, screen reader, reduced motion | ~30 |
| 16 | [Implementation](16-IMPLEMENTATION.md) | Phases 0-5, file structure, verification checklist | ~80 |

## Quick Reference

### Design Intent
"AAA game-studio codex + encyclopedia utility" - a tool modders trust daily.

### Key Principles
1. Dark-First, Eye-Friendly
2. Bottom Tab Navigation
3. Content-First
4. Bento Discovery
5. Micro-Interactions + Haptics
6. Offline-First
7. Accessibility-First

### Primary Colors
- **Background:** Navy 900 (`#0a1628`)
- **Surface:** Navy 800 (`#0f1f35`)
- **Accent:** Orange 500 (`#d4782c`)
- **Text Primary:** Off-white (`#f1f5f9`)

### Navigation Structure
```
Bottom Tabs: Home | Search | Saved | Profile
```

## How to Use These Documents

**For implementation:** Start with `16-IMPLEMENTATION.md` for the phase breakdown, then reference individual specs as needed.

**For design review:** Read `01-DESIGN-PHILOSOPHY.md` first, then screens in order (05-11).

**For component work:** Reference `12-COMPONENTS.md` and `02-COLOR-SYSTEM.md` together.

**For offline features:** `14-OFFLINE-UX.md` is comprehensive and self-contained.

---

*Last updated: January 2026*
*Generated from: MOBILE_UI_DESIGN_SYSTEM_V3.md*
