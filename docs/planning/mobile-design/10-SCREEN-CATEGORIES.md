# Mobile Design: Categories Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 6. CATEGORIES SCREEN

## Screen Layout

```
┌─────────────────────────────────┐
│  ◄ Browse                       │
├─────────────────────────────────┤
│                                 │
│  PROJECT ZOMBOID · BUILD 41     │  ← Game/version context
│                                 │
│  MODDING                        │
│  ┌─────────────────────────┐   │
│  │ 🔧 Lua API              │   │
│  │ Core functions and      │   │
│  │ event hooks             │   │
│  │ 32 articles        ───► │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📦 Items                │   │
│  │ Create weapons, food,   │   │
│  │ tools and more          │   │
│  │ 18 articles        ───► │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🗺️ Mapping              │   │
│  │ World building and      │   │
│  │ level design            │   │
│  │ 12 articles        ───► │   │
│  └─────────────────────────┘   │
│                                 │
│  MAPPING                        │  ← Future section
│  Coming soon...                 │
│                                 │
└─────────────────────────────────┘
```

---

## Header Context

Always show game and version at the top:
```
PROJECT ZOMBOID · BUILD 41
```

This provides persistent context for the user.

---

## Category Card Elements

```
┌─────────────────────────────┐
│ 🔧 Lua API                  │  ← Icon + Category name
│ Core functions and          │  ← Description (2 lines max)
│ event hooks                 │
│ 32 articles            ───► │  ← Article count + chevron
└─────────────────────────────┘
```

### Card Specifications

| Element | Style |
|---------|-------|
| Icon | Category-specific emoji/icon |
| Name | text.primary, 18sp, bold |
| Description | text.secondary, 14sp, max 2 lines |
| Article count | text.muted, right-aligned |
| Chevron | text.muted, indicates navigation |

---

## Section Headers

Categories grouped by section (Modding, Mapping, etc.)

```
MODDING
├── Lua API
├── Items
├── Recipes
└── ...

MAPPING
├── Coming soon...
```

---

## Interactions

| Element | Action |
|---------|--------|
| Category card | Navigate to article list for that category |
| Back button | Return to Home or Game selection |

---

## Article List (Drill-Down)

When tapping a category, show article list:

```
┌─────────────────────────────────┐
│  ◄ Lua API                      │
├─────────────────────────────────┤
│                                 │
│  32 articles                    │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Getting Started with    │   │
│  │ Lua Events              │   │
│  │ ▪️ Beginner             │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Event Reference         │   │
│  │ Complete list of game   │   │
│  │ events...               │   │
│  │ ▪️ Intermediate         │   │
│  └─────────────────────────┘   │
│                                 │
│  ... more articles ...          │
│                                 │
└─────────────────────────────────┘
```

---

## Empty Category State

If a category has no articles yet:

```
┌─────────────────────────────┐
│                             │
│     📝                      │
│                             │
│  No articles yet            │
│                             │
│  Articles for this category │
│  are coming soon.           │
│                             │
└─────────────────────────────┘
```

---

*See also: [Screen: Home](05-SCREEN-HOME.md), [Navigation](04-NAVIGATION.md)*
