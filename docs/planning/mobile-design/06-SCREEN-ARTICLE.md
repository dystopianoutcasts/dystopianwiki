# Mobile Design: Article Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 2. ARTICLE SCREEN, Markdown Renderer Rules

## Screen Layout

```
┌─────────────────────────────────┐
│  ◄ Back                   [🔖] │  ← Bookmark in header
├─────────────────────────────────┤
│                                 │
│  ITEMS                          │  ← Category breadcrumb
│                                 │
│  Creating Custom Items          │  ← Title (h1, Russo One)
│                                 │
│  ▪️ Beginner · 8 min read       │  ← Meta row
│                                 │
│  ┌─────────────────────────┐   │
│  │ TABLE OF CONTENTS    ▼  │   │  ← Collapsible TOC
│  │  • Introduction         │   │
│  │  • Prerequisites        │   │
│  │  • Step 1: Setup        │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  This guide will teach you...   │  ← Article content
│                                 │
│  ## Prerequisites               │
│                                 │
│  Before starting, ensure you    │
│  have:                          │
│  • Project Zomboid installed    │
│  • A text editor                │
│                                 │
│  ```lua                         │
│  local item = {                 │  ← Code block (syntax hl)
│    type = "Normal",             │
│    displayName = "My Item"      │
│  }                              │
│  ```                            │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  RELATED ARTICLES               │
│  ┌───────────┐ ┌───────────┐   │  ← Horizontal scroll
│  │ Item Props│ │ Lua Basics│   │
│  └───────────┘ └───────────┘   │
│                                 │
└─────────────────────────────────┘
     ┌─────────────────────┐
     │  ▲ TOP    📖 TOC    │       ← Floating action bar
     └─────────────────────┘         (appears on scroll)
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| Bookmark | Moved to header (always visible) |
| TOC | Collapsible Table of Contents |
| Reading time | Estimate based on word count |
| Floating action bar | Quick navigation (appears on scroll down) |
| Related articles | Horizontal scroll carousel |

---

## Table of Contents Behavior

- Tapping TOC item scrolls to section with offset for header
- Active section highlighted in TOC as user scrolls
- TOC is navigable list for screen readers
- Collapsed by default on small screens
- Sticky when expanded

---

## Markdown Renderer Rules

### Code Blocks

```
┌─────────────────────────────────┐
│ lua                       [📋] │  ← Language label + copy button
├─────────────────────────────────┤
│ local item = {                  │
│   type = "Normal",              │
│   displayName = "My Item"       │
│ }                               │
└─────────────────────────────────┘
  [Wrap] [Scroll]                    ← Optional toggle for long lines
```

**Features:**
- Copy button with haptic + "Copied!" toast
- Syntax highlighting via react-native-syntax-highlighter
- Long lines: default scroll, optional wrap toggle

### Tables

- Render as horizontally scrollable cards
- Never break table layout
- Shadow/fade on edges to indicate scroll

### Links

| Type | Behavior |
|------|----------|
| Internal (same domain) | Open in-app, push new article screen |
| External | Show confirmation "Open in browser?" with URL preview |
| Broken | Show inline error, don't crash |

### Images

| State | Behavior |
|-------|----------|
| Loaded | Tap to open fullscreen lightbox with pinch-zoom |
| Loading | Skeleton placeholder with image dimensions if known |
| Offline missing | Show placeholder icon + "Image not downloaded" |
| Alt text | Always visible below image |

---

## Floating Action Bar

Appears after scrolling down ~200px.

| Button | Action |
|--------|--------|
| ▲ TOP | Scroll to top |
| 📖 TOC | Open/scroll to TOC |

Hides on scroll down, shows on scroll up.

---

## Meta Row Elements

```
▪️ Beginner · 8 min read · Updated Jan 15
```

- Difficulty dot (colored)
- Reading time estimate
- Last updated date (optional)

---

*See also: [Typography](03-TYPOGRAPHY.md), [Animations](13-ANIMATIONS.md)*
