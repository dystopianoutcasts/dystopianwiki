---
id: lua-source-learning-path
slug: lua-source-learning-path
title: Lua Source Learning Path
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: beginner
tags:
  - guide
  - learning
  - roadmap
  - lua
excerpt: A guided path through PZ's 888 Lua files. Learn the optimal order to study the codebase - ISBaseObject to Timed Actions to Context Menus to Game Systems.
related_articles:
  - isbaseobject
  - timed-actions
  - context-menus
  - events-overview
last_updated: 2026-01-19
---

# Lua Source Learning Path

## The Goal

Project Zomboid has **888 Lua files** that control everything from UI panels to player actions to game systems. This guide shows you **the order to learn them** so each piece builds on the last.

---

## The Learning Sequence

```
┌─────────────────────────────────────────────────────────────┐
│  1. ISBaseObject                                            │
│     The foundation - how ALL PZ objects work                │
│     (You should read this first)                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
│ 2A. TimedActions│ │2B. UI     │ │ 2C. Events      │
│ Player actions  │ │ ISPanel   │ │ Game hooks      │
│ (recommended)   │ │ Windows   │ │                 │
└────────┬────────┘ └─────┬─────┘ └────────┬────────┘
         │                │                │
         ▼                │                │
┌─────────────────┐       │                │
│ 3. Context Menus│◄──────┴────────────────┘
│ Right-click opts│
│ Connects it all │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Game Systems                                            │
│     Farming, Foraging, Vehicles, Health, etc.               │
│     (Pick based on what you want to mod)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: ISBaseObject (Foundation)

**What you learn:** How PZ's object-oriented programming works

**Why it matters:** Every single UI component, timed action, and game system inherits from ISBaseObject. You can't understand anything else without this.

**Key concepts:**
- `derive()` - Creating new classes
- `new()` - Creating instances
- Metatable inheritance
- The `Type` property

**Read:** [ISBaseObject: The Foundation of Everything](/build-41/modding/lua-api/isbaseobject)

---

## Step 2: Choose Your Path

After ISBaseObject, your next step depends on **what you want to build**:

### Path A: Timed Actions (Recommended First)

**Best for:** Adding new player interactions, custom crafting, special abilities

**What you learn:**
- The action lifecycle (start → update → perform → stop)
- How to validate actions
- How actions connect to the game

**Why recommended first:**
- More immediately practical than UI
- Simpler than building windows
- Every mod that adds "do something" needs this

**Read:** [ISBaseTimedAction: The Action Lifecycle](/build-41/modding/lua-api/timed-actions)

### Path B: UI Framework

**Best for:** Custom windows, HUD elements, menus

**What you learn:**
- ISUIElement and ISPanel
- Creating windows and buttons
- The render/update cycle

**When to choose this:**
- You specifically need a custom UI
- You're building a complex mod with configuration screens

**Read:** [ISUI Framework Overview](/build-41/modding/ui-framework/overview)

### Path C: Events System

**Best for:** Reacting to game events, passive mods

**What you learn:**
- Available game events
- How to hook into them
- Event timing and order

**When to choose this:**
- Your mod reacts to things (player dies, item picked up)
- You don't need new actions or UI yet

**Read:** [Events Overview](/build-41/modding/lua-api/events-overview)

---

## Step 3: Context Menus

**What you learn:** How right-click menus work and how to add options

**Why it's step 3:** Context menus **connect everything**:
- They trigger **timed actions** (Step 2A)
- They can open **UI windows** (Step 2B)
- They respond to **events** (Step 2C)

You need to understand at least one of those systems first.

**Key concepts:**
- Building menu structures
- Adding options conditionally
- Connecting to actions

**Read:** [Context Menu System](/build-41/modding/lua-api/context-menus)

---

## Step 4: Game Systems

Once you understand the core patterns, dive into specific systems based on your mod:

| If you're modding... | Study these systems |
|---------------------|---------------------|
| Food/Cooking | Nutrition, Evolved Recipes, ISEatFoodAction |
| Weapons | HandWeapon API, Reloading system |
| Medical | BodyDamage, Health system, Medical actions |
| Building | ISBuildingObject, Construction actions |
| Farming | Farming system (client + server) |
| Vehicles | Vehicle API, Part system |
| Loot/Spawning | Distributions, ProceduralDistributions |

---

## The 888 Files: Where Things Live

```
media/lua/
├── shared/              # Used by both client and server
│   ├── ISBaseObject.lua      # THE foundation
│   ├── luautils.lua          # Utility functions
│   ├── defines.lua           # Game constants
│   └── TimedActions/         # Base action class
│
├── client/              # Client-side (UI, player interaction)
│   ├── ISUI/                 # UI framework (166 files!)
│   ├── TimedActions/         # All player actions (130+ files)
│   ├── Context/              # Right-click menus
│   ├── Farming/              # Farming UI
│   ├── Foraging/             # Foraging UI
│   └── ...
│
└── server/              # Server-side (game logic)
    ├── Items/                # Item spawning
    ├── Farming/              # Farming logic
    ├── Vehicles/             # Vehicle spawning
    └── ...
```

---

## Tips for Learning

### 1. Read Vanilla Code

The best teacher is PZ itself. When you want to know how something works:

```lua
-- Want to know how eating works?
-- Read: media/lua/client/TimedActions/ISEatFoodAction.lua

-- Want to know how crafting UI works?
-- Read: media/lua/client/ISUI/ISCraftingUI.lua

-- Want to know how context menus are built?
-- Read: media/lua/client/Context/ISContextMenu.lua
```

### 2. Trace the Inheritance

When you open a file, first look at what it derives from:

```lua
ISEatFoodAction = ISBaseTimedAction:derive("ISEatFoodAction");
-- ^ This tells you to also read ISBaseTimedAction.lua
```

### 3. Search for Usage

Find where something is used:

```bash
# Find everywhere ISEatFoodAction is created
grep -r "ISEatFoodAction:new" media/lua/
```

### 4. Start Small

Your first mod should be simple:
- Add one context menu option
- That triggers one timed action
- That does one thing

Then expand from there.

---

## Quick Reference: What Inherits From What

```
ISBaseObject
├── ISUIElement → ISPanel → ISButton, ISCollapsableWindow, etc.
├── ISBaseTimedAction → ISEatFoodAction, ISCraftAction, etc.
├── ISBuildingObject → ISWoodenWall, ISWoodenDoor, etc.
└── ISReloadable → ISReloadableMagazine, ISReloadableWeapon
```

Everything traces back to ISBaseObject.

---

## Recommended Reading Order

For a complete understanding, read in this order:

1. **[ISBaseObject](/build-41/modding/lua-api/isbaseobject)** - The foundation
2. **[ISBaseTimedAction](/build-41/modding/lua-api/timed-actions)** - Player actions
3. **[Context Menus](/build-41/modding/lua-api/context-menus)** - Right-click system
4. **[Events Overview](/build-41/modding/lua-api/events-overview)** - Game hooks
5. **[luautils Reference](/build-41/modding/lua-api/luautils)** - Utility functions
6. **[ISUI Framework](/build-41/modding/ui-framework/overview)** - UI components

This order ensures each article builds on knowledge from the previous ones.
