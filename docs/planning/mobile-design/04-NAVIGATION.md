# Mobile Design: Navigation Structure

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Navigation Structure, Game Context Rules, Deep Linking

## Bottom Tab Navigation

```
┌─────────────────────────────────┐
│                                 │
│         (Screen Content)        │
│                                 │
├─────────────────────────────────┤
│  🏠       🔍       📥       👤  │  ← Bottom Tab Bar
│  Home    Search   Saved   Profile│
└─────────────────────────────────┘
```

### Why Bottom Tabs

- Thumb-friendly (primary actions within reach)
- Standard pattern users expect
- Replaces quick action buttons (now redundant)
- 4 tabs is optimal (5 max)

---

## Tab Structure

| Tab | Icon | Screen | Nested Stacks |
|-----|------|--------|---------------|
| Home | 🏠 | HomeScreen | Categories, Article |
| Search | 🔍 | SearchScreen | Article |
| Saved | 📥 | BookmarksScreen | Article |
| Profile | 👤 | ProfileScreen | Auth, Settings |

Each tab has its own stack navigator for drill-down navigation.

---

## Game Context Rules

The app is game-agnostic. Users must always know "where they are."

### Global Scope Default
All Games

### When User Selects a Game

Show persistent context in:
- Search results summary: "12 results in Project Zomboid"
- Categories header: "PROJECT ZOMBOID · BUILD 41"
- Article breadcrumb: "PZ > Modding > Lua API"

### Context Persistence

| Behavior | Rule |
|----------|------|
| Game selection | Persists across sessions |
| Changing game | Clears search but keeps bookmarks visible |
| "All Games" | Shows combined results |

---

## Deep Linking

Support deep links for community sharing and Discord integration.

### Link Formats

| Link Type | Format |
|-----------|--------|
| Article | `dystopianwiki://article/{slug}` |
| Category | `dystopianwiki://category/{game}/{category}` |
| Game hub | `dystopianwiki://game/{game-id}` |
| Search | `dystopianwiki://search?q={query}&game={game}` |
| Discord invite | `dystopianwiki://discord` |

### Implementation

1. Configure in `app.json` scheme + intentFilters
2. Handle in root navigator with linking config
3. Fallback: show "Article not found" if invalid

---

## Navigation Patterns

### Push (Drill-down)
- Card tap → Article
- Category tap → Category list
- Search result tap → Article

### Modal (Overlay)
- Auth screen
- Image lightbox
- Confirmation dialogs

### Tab Switch
- Bottom tab tap
- Cross-fade transition (120ms)

---

## Header Behavior

| Context | Left | Center | Right |
|---------|------|--------|-------|
| Home | - | "DYSTOPIAN WIKI" | Avatar |
| Article | Back arrow | - | Bookmark |
| Search | Back arrow | "Search" | - |
| Categories | Back arrow | "Browse" | - |

---

*See also: [Animations](13-ANIMATIONS.md), [Implementation](16-IMPLEMENTATION.md)*
