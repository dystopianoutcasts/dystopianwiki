# Mobile Design: Home Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 1. HOME SCREEN (Bento Layout)

## Screen Layout

```
┌─────────────────────────────────┐
│  DYSTOPIAN WIKI           [👤] │  ← Header with avatar
├─────────────────────────────────┤
│                                 │
│  🔍 Search mods, Lua, items...  │  ← Tier-0 search (tappable)
│  [All Games ▾] [Guides] [API]   │  ← Scope + filter chips
│                                 │
│  GAMES                          │
│  ┌──────────┐ ┌──────────┐     │
│  │    🧟    │ │    ⛏️    │     │  ← Bento grid (2-col)
│  │ Project  │ │ Vintage  │     │
│  │ Zomboid  │ │  Story   │     │
│  │ 124 docs │ │  58 docs │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  ┌─────────────────────────┐   │  ← Featured (full-width)
│  │ ⭐ FEATURED              │   │
│  │ Getting Started Guide    │   │
│  │ New to modding? Start... │   │
│  └─────────────────────────┘   │
│                                 │
│  CONTINUE READING               │  ← Only if user has progress
│  ┌─────────────────────────┐   │
│  │ ████████░░░░ 65%        │   │
│  │ Item Properties Guide   │   │
│  └─────────────────────────┘   │
│                                 │
│  RECENT ARTICLES                │
│  ┌─────────────────────────┐   │
│  │ Creating Custom Items   │   │
│  │ ▪️ Beginner · Items     │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  🏠       🔍       📥       👤  │
│  Home    Search   Saved   Profile│
└─────────────────────────────────┘
```

---

## Bento Layout Features

### Search (Tier-0)
- Most prominent element
- Tappable, navigates to Search screen
- Placeholder: "Search mods, Lua, items..."

### Filter Chips
- Game scope selector: "All Games ▾"
- Quick filters: "Guides", "API", etc.
- Tapping applies filter and navigates to Search

### Game Cards (2-Column Grid)
- Square cards with game icon/emoji
- Game name
- Article count badge
- Tap navigates to Categories for that game

### Featured Card (Full-Width)
- Highlighted content (getting started, new features)
- Star icon indicator
- Title + short description

### Continue Reading Section
- **Only shows if user has in-progress articles**
- Progress bar with percentage
- Article title
- Tap resumes reading

### Recent Articles
- List of recently viewed/added articles
- Difficulty badge + category
- Standard article card format

---

## Conditional Display Logic

| Section | Condition |
|---------|-----------|
| Continue Reading | User has articles with 1-99% progress |
| Recent Articles | Always shown (fallback to featured if empty) |
| Featured | Always shown |
| Games | Always shown |

---

## Interactions

| Element | Tap Action |
|---------|------------|
| Search bar | Navigate to Search screen |
| Filter chip | Navigate to Search with filter applied |
| Game card | Navigate to Categories for game |
| Featured card | Navigate to Article |
| Continue Reading card | Navigate to Article (resume position) |
| Recent article card | Navigate to Article |
| Avatar | Navigate to Profile |

---

*See also: [Components](12-COMPONENTS.md), [Navigation](04-NAVIGATION.md)*
