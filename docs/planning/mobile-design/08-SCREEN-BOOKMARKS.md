# Mobile Design: Bookmarks (Saved) Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 4. BOOKMARKS SCREEN

## Screen Layout

```
┌─────────────────────────────────┐
│  ◄ Saved Articles               │
├─────────────────────────────────┤
│                                 │
│  ┌────────┐ ┌────────┐         │
│  │All (12)│ │Unread 8│ │Read 4 │ ← Tab filters
│  └────────┘ └────────┘         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Item Properties Guide   │   │
│  │ ████████░░░░ 65%        │   │  ← Progress bar if started
│  │ ▪️ Beginner · Items     │   │
│  │                    [⋮]  │   │  ← Overflow menu (remove)
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Lua Event Hooks         │   │
│  │ Not started             │   │
│  │ ▪️ Intermediate · API   │   │
│  │                    [⋮]  │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## Tab Filters

| Tab | Shows |
|-----|-------|
| All (count) | All bookmarked articles |
| Unread (count) | Articles with 0% progress |
| Read (count) | Articles with 100% progress |

**Note:** Articles with 1-99% progress appear in both "All" and as "In Progress" when applicable.

---

## Bookmark Card Elements

```
┌─────────────────────────────┐
│ Item Properties Guide       │  ← Title
│ ████████░░░░ 65%            │  ← Progress bar (if started)
│ ▪️ Beginner · Items         │  ← Difficulty + Category
│                        [⋮]  │  ← Overflow menu
└─────────────────────────────┘
```

### Progress States

| State | Display |
|-------|---------|
| Not started | "Not started" text |
| In progress | Progress bar + percentage |
| Completed | Checkmark or "Completed" |

### Overflow Menu Options

- Remove from saved
- Download for offline (if not downloaded)
- Share article

---

## Empty State

```
┌─────────────────────────────┐
│                             │
│     📚                      │  ← Empty state
│                             │
│  No saved articles yet      │
│                             │
│  Tap the bookmark icon      │
│  to save articles for       │
│  offline reading.           │
│                             │
│  [Browse Articles]          │
│                             │
└─────────────────────────────┘
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Tab filters (All/Unread/Read) | Quick filtering without full search UI |
| Progress bar on cards | Shows reading status at a glance |
| Overflow menu instead of X | Less accidental taps (X is too easy to hit) |
| Better empty state with illustration | Guides new users to understand the feature |

---

## Interactions

| Element | Action |
|---------|--------|
| Tab | Filter list |
| Card | Navigate to article (resume position if in progress) |
| Overflow menu | Show options (remove, download, share) |
| "Browse Articles" button | Navigate to Home/Categories |

---

*See also: [Offline UX](14-OFFLINE-UX.md), [Screen: Article](06-SCREEN-ARTICLE.md)*
