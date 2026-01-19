# Phase 2: Lua Source Documentation Plan

## Overview

Document the vanilla Lua codebase (888 files) to help modders understand how PZ works under the hood and how to extend it properly.

**Estimated Articles:** 80-120
**Priority:** HIGH - This is the foundation for all advanced modding

---

## Source Location

```
/home/edgar_dev/.steam/debian-installation/steamapps/common/ProjectZomboid/projectzomboid/media/lua/
├── shared/    # Common code (core systems)
├── client/    # Client-side (UI, interactions)
└── server/    # Server-side (game logic)
```

---

## Phase 2 Breakdown

### 2.1 Core Systems (START HERE)

These 3 files are the foundation everything else builds on. **Document these first.**

| File | Lines | Priority | Description |
|------|-------|----------|-------------|
| `shared/ISBaseObject.lua` | 31 | CRITICAL | Base class inheritance system - ALL IS* classes inherit from this |
| `shared/luautils.lua` | 478 | CRITICAL | Utility functions used everywhere |
| `shared/defines.lua` | 47 | HIGH | Game constants and enums |

**Articles to create:**
1. **ISBaseObject Deep Dive** - How PZ's OOP system works, `derive()`, `new()`, `Type`
2. **luautils Reference** - All utility functions with examples
3. **Game Constants (defines.lua)** - All constants and their uses

---

### 2.2 UI Framework (ISUI/) - 166 files

The UI system is massive. Break into logical groups.

#### 2.2.1 Base Components (Foundation)
| File | Description | Priority |
|------|-------------|----------|
| `ISPanel.lua` | Base panel class | CRITICAL |
| `ISButton.lua` | Button component | HIGH |
| `ISLabel.lua` | Text labels | HIGH |
| `ISImage.lua` | Image display | HIGH |
| `ISTextEntryBox.lua` | Text input | HIGH |
| `ISScrollingListBox.lua` | Scrollable lists | HIGH |
| `ISComboBox.lua` | Dropdown selector | MEDIUM |
| `ISCheckBox.lua` | Checkbox component | MEDIUM |
| `ISSliderPanel.lua` | Slider control | MEDIUM |
| `ISProgressBar.lua` | Progress bars | MEDIUM |

**Articles to create:**
1. **ISPanel - The Foundation** - Creating panels, lifecycle, rendering
2. **ISUI Component Reference** - All base components with examples
3. **Building Custom UI Components** - How to create your own

#### 2.2.2 Window System
| File | Description | Priority |
|------|-------------|----------|
| `ISCollapsableWindow.lua` | Draggable windows | HIGH |
| `ISModalDialog.lua` | Modal popups | HIGH |
| `ISModalRichText.lua` | Rich text dialogs | MEDIUM |
| `ISTabPanel.lua` | Tabbed interfaces | MEDIUM |

**Articles to create:**
1. **Window System Guide** - Creating draggable, collapsable windows
2. **Modal Dialogs** - Confirmations, alerts, custom dialogs

#### 2.2.3 Complex UI Components
| File | Description | Priority |
|------|-------------|----------|
| `ISInventoryPane.lua` | Inventory display | HIGH |
| `ISCraftingUI.lua` | Crafting interface | HIGH |
| `ISHealthPanel.lua` | Health/body status | MEDIUM |
| `ISSkillProgressBar.lua` | Skill display | MEDIUM |
| `ISMiniMap.lua` | Mini map | LOW |

**Articles to create:**
1. **Inventory UI System** - How inventory panels work
2. **Crafting UI System** - Recipe display and interaction

---

### 2.3 Timed Actions - 130+ files

The action system is how players interact with the world.

#### 2.3.1 Core Action System
| File | Description | Priority |
|------|-------------|----------|
| `shared/TimedActions/ISBaseTimedAction.lua` | Base action class | CRITICAL |
| `client/TimedActions/ISTimedActionQueue.lua` | Action queue manager | HIGH |

**Articles to create:**
1. **ISBaseTimedAction Deep Dive** - Action lifecycle, callbacks, validation
2. **Creating Custom Timed Actions** - Step-by-step guide
3. **Action Queue System** - How actions are queued and executed

#### 2.3.2 Action Categories (Reference)
Group existing actions by type for reference:

| Category | Example Files | Count |
|----------|---------------|-------|
| Inventory | `ISInventoryTransferAction`, `ISEquipWeaponAction` | ~15 |
| Medical | `ISApplyBandage`, `ISSplint`, `ISStitch` | ~10 |
| Crafting | `ISCraftAction`, `ISFixAction` | ~8 |
| World Interaction | `ISOpenCloseDoor`, `ISSmashWindow` | ~20 |
| Food/Drink | `ISEatFoodAction`, `ISDrinkFromBottle` | ~8 |
| Vehicles | `ISAddFuel`, `ISFixAction` | ~10 |
| Building | `ISBarricadeAction`, `ISBuildAction` | ~15 |

**Articles to create:**
1. **Timed Action Reference** - Categorized list with signatures
2. **Common Action Patterns** - How vanilla implements common tasks

---

### 2.4 Context Menus - 8 files

Right-click menus that drive player interaction.

| File | Description | Priority |
|------|-------------|----------|
| `ISContextMenu.lua` | Menu component | HIGH |
| `ISContextManager.lua` | Menu management | HIGH |
| `ISMenuContext.lua` | Base context handler | HIGH |
| `ISMenuContextInventory.lua` | Inventory right-click | HIGH |
| `ISMenuContextWorld.lua` | World right-click | HIGH |
| `ISMenuContextBuild.lua` | Building context | MEDIUM |

**Articles to create:**
1. **Context Menu System** - How menus are built and displayed
2. **Adding Custom Context Options** - Hooking into existing menus
3. **Inventory Context Menus** - Item right-click handling
4. **World Context Menus** - Object right-click handling

---

### 2.5 Major Game Systems

#### 2.5.1 Farming System
| Location | Files | Priority |
|----------|-------|----------|
| `client/Farming/` | ~10 | MEDIUM |
| `server/Farming/` | ~10 | MEDIUM |
| `shared/Farming/` | ~5 | MEDIUM |

**Articles to create:**
1. **Farming System Overview** - How farming works
2. **Custom Crops** - Adding new plantable items

#### 2.5.2 Foraging System
| Location | Files | Priority |
|----------|-------|----------|
| `client/Foraging/` | ~10 | MEDIUM |
| `server/Foraging/` | ~10 | MEDIUM |
| `shared/Foraging/` | ~5 | MEDIUM |

**Articles to create:**
1. **Foraging System Overview** - Zone definitions, item discovery
2. **Custom Foraging Items** - Adding items to foraging tables

#### 2.5.3 Fishing System
| Location | Files | Priority |
|----------|-------|----------|
| `client/Fishing/` | ~5 | LOW |
| `server/Fishing/` | ~5 | LOW |
| `shared/Fishing/` | ~3 | LOW |

**Articles to create:**
1. **Fishing System Overview** - How fishing mechanics work

#### 2.5.4 Health System
| Location | Files | Priority |
|----------|-------|----------|
| `server/HealthSystem/` | ~10 | HIGH |

**Articles to create:**
1. **Health System Overview** - Injuries, treatment, body parts
2. **Custom Medical Items** - Creating treatments

#### 2.5.5 Vehicle System
| Location | Files | Priority |
|----------|-------|----------|
| `client/Vehicles/` | ~15 | MEDIUM |
| `server/Vehicles/` | ~15 | MEDIUM |

**Articles to create:**
1. **Vehicle Lua API** - Accessing and modifying vehicles
2. **Vehicle UI Components** - Dashboard, mechanics panel

---

## Recommended Order

### Tier 1: Foundation (Do First)
1. `ISBaseObject.lua` - Everything depends on this
2. `luautils.lua` - Used everywhere
3. `defines.lua` - Constants reference

### Tier 2: UI Basics
4. `ISPanel.lua` - Base of all UI
5. Base components (Button, Label, TextEntry)
6. Window system

### Tier 3: Action System
7. `ISBaseTimedAction.lua` - Core action class
8. Action queue system
9. Common action patterns

### Tier 4: Context Menus
10. Context menu system
11. Adding custom options

### Tier 5: Game Systems
12. Health system (high value for modders)
13. Farming system
14. Foraging system
15. Vehicle system
16. Fishing system

---

## Article Template

Each Lua documentation article should include:

```markdown
# [File/System Name]

## Overview
What this file/system does and why it matters.

## Location
`media/lua/[path]/filename.lua`

## Dependencies
- Requires: [list of required files]
- Required by: [list of files that use this]

## Key Functions/Methods

### functionName(param1, param2)
**Description:** What it does
**Parameters:**
- `param1` (type) - Description
- `param2` (type) - Description
**Returns:** type - Description
**Example:**
```lua
-- Working example
```

## Common Patterns

### Pattern Name
```lua
-- How to use this in practice
```

## Events/Hooks
List any events this system fires or responds to.

## Modding Tips
- How to extend this
- Common pitfalls
- Best practices

## Related
- [Link to related article]
```

---

## Success Metrics for Phase 2

- [ ] Core systems (ISBaseObject, luautils, defines) fully documented
- [ ] ISUI base components documented with examples
- [ ] Timed action system explained with custom action guide
- [ ] Context menu system documented
- [ ] At least 3 major game systems documented (health, farming, foraging)
- [ ] All articles have working code examples
- [ ] Cross-references between related articles

---

## Estimated Article Breakdown

| Section | Articles |
|---------|----------|
| Core Systems | 3 |
| UI Framework | 15-20 |
| Timed Actions | 5-8 |
| Context Menus | 4-5 |
| Game Systems | 10-15 |
| **Total** | **37-51** |

Note: Original estimate of 80-120 was optimistic. A focused 40-50 high-quality articles covering the most important systems is more realistic and valuable.

---

## Next Action

**Start with:** `ISBaseObject.lua` documentation

This 31-line file is deceptively important - it defines how ALL `IS*` classes work. Understanding `derive()` and the inheritance pattern is essential for everything else.
