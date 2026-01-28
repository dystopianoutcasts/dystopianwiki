# Mobile Design: Search Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 3. SEARCH SCREEN, Search Ranking & Behavior

## Screen Layout

```
┌─────────────────────────────────┐
│  ◄ Search                       │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍 lua events...     ✕  │   │  ← Search with clear button
│  └─────────────────────────┘   │
│                                 │
│  SCOPE                          │
│  ┌─────────┐ ┌─────────┐       │
│  │All Games│ │PZ       │ │VS   │ ← Game filter (single select)
│  └─────────┘ └─────────┘       │
│                                 │
│  CONTENT TYPE                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │All    │ │Guides │ │API    │ │ ← Type filter (multi-select)
│  └───────┘ └───────┘ └───────┘ │
│  ┌───────┐ ┌───────┐           │
│  │Scripts│ │Config │           │
│  └───────┘ └───────┘           │
│                                 │
│  DIFFICULTY                     │
│  ┌────────┐ ┌────────┐ ┌─────┐ │
│  │All     │ │Beginner│ │Inter│ │ ← Difficulty (single select)
│  └────────┘ └────────┘ └─────┘ │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔄 Clear filters        │   │ ← Reset all filters
│  └─────────────────────────┘   │
│                                 │
│  12 results for "lua events"    │
│  in Project Zomboid · Guides    │  ← Shows active filters
│                                 │
│  ┌─────────────────────────┐   │
│  │ Lua Event Hooks         │   │
│  │ Learn how to hook into  │   │
│  │ game events using Lua...│   │
│  │ ▪️ Intermediate · Lua API│   │
│  │ 📥 Downloaded           │   │  ← Offline availability
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Custom Events           │   │
│  │ Create your own event   │   │
│  │ system for mod...       │   │
│  │ ▪️ Advanced · Lua API   │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## Filter System

### Game Scope (Single-Select)

| Options | Behavior |
|---------|----------|
| All Games | Shows results from all games |
| Project Zomboid | Filters to PZ only |
| Vintage Story | Filters to VS only |

**Note:** Persists across sessions

### Content Type (Multi-Select)

- All
- Guides
- API Reference
- Scripts
- Config

**Can combine multiple types**

### Difficulty (Single-Select)

- All
- Beginner
- Intermediate
- Advanced

### Version Filter

- Only shows if a specific game is selected
- Options depend on game (Build 41, Build 42 Beta, etc.)

---

## Filter Chip States

| State | Style |
|-------|-------|
| Default | Navy 800 bg, text.secondary |
| Selected | Accent 500 bg, text.primary |
| Multi-selected | Accent outline, accent.muted bg |

---

## Search Behavior

### Instant Search

- Show suggestions after 2-3 characters typed
- Debounce: 300ms after last keystroke
- Submit (Enter/Search button) for full results with filters

### Result Ranking Priority

1. **Title match** (exact > partial > fuzzy)
2. **Heading/TOC match** (H2, H3 within article)
3. **Body text match** (full content search)
4. **Tag match** (content type, version, difficulty)

### Match Highlighting

- Highlight matched terms in title (bold)
- Highlight matched terms in excerpt snippet
- Show which field matched: "Found in: Headings"

---

## No Results State

```
┌─────────────────────────────────┐
│                                 │
│         🔍                      │
│                                 │
│  No results for "xyz"           │
│                                 │
│  Try:                           │
│  • Different keywords           │
│  • Removing filters             │
│  • Checking spelling            │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Clear all filters         │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

---

## Result Card Elements

```
┌─────────────────────────────┐
│ Lua Event Hooks             │  ← Title (matched terms bold)
│ Learn how to hook into      │  ← Excerpt snippet
│ game events using Lua...    │
│ ▪️ Intermediate · Lua API   │  ← Difficulty + Category
│ 📥 Downloaded               │  ← Offline status (if relevant)
└─────────────────────────────┘
```

---

*See also: [Offline UX](14-OFFLINE-UX.md), [Components](12-COMPONENTS.md)*
