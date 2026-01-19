# Project Zomboid Vanilla Documentation Plan

## Mission

Create the most comprehensive Project Zomboid modding wiki by systematically documenting ALL exposed vanilla game code - Lua scripts, .txt definitions, and Java API bridges.

---

## Source Material Location

```
PZ Game Files (Linux):
  /home/edgar_dev/.steam/debian-installation/steamapps/common/ProjectZomboid/projectzomboid/media/
  ├── scripts/     # .txt definitions (items, recipes, etc.)
  ├── lua/         # Lua source code (888 files)
  │   ├── client/  # Client-side scripts
  │   ├── server/  # Server-side scripts
  │   └── shared/  # Shared scripts
  └── luaexamples/ # Official examples

Wiki Repository:
  /home/edgar_dev/CodingProjects/dystopianwiki/
```

---

## Source Material Inventory

### 1. Script Files (`media/scripts/`) - ~32 top-level files + subfolders

| File/Folder | Content Type | Priority | Status |
|-------------|--------------|----------|--------|
| `items.txt` | Base items | HIGH | NOT STARTED |
| `items_weapons.txt` | Weapon definitions | HIGH | NOT STARTED |
| `items_food.txt` | Food items | HIGH | NOT STARTED |
| `items_literature.txt` | Books, magazines | MEDIUM | NOT STARTED |
| `items_radio.txt` | Radio equipment | LOW | NOT STARTED |
| `newitems.txt` | Additional items | HIGH | NOT STARTED |
| `recipes.txt` | Crafting recipes | HIGH | NOT STARTED |
| `uniquerecipes.txt` | Special recipes | HIGH | NOT STARTED |
| `evolvedrecipes.txt` | Evolved recipes (soups, etc.) | MEDIUM | NOT STARTED |
| `recipes_radio.txt` | Radio recipes | LOW | NOT STARTED |
| `fixing.txt` | Repair definitions | HIGH | NOT STARTED |
| `farming.txt` | Farming definitions | MEDIUM | NOT STARTED |
| `camping.txt` | Camping items | MEDIUM | NOT STARTED |
| `vehicles/` | Vehicle definitions | MEDIUM | NOT STARTED |
| `weapons/` | Weapon attachments | HIGH | NOT STARTED |
| `clothing/` | Clothing definitions | MEDIUM | NOT STARTED |
| `animations.txt` | Animation definitions | LOW | NOT STARTED |
| `sounds_*.txt` | Sound definitions | MEDIUM | NOT STARTED |
| `moveables.txt` | Moveable objects | LOW | NOT STARTED |
| `multistagebuild.txt` | Multi-stage building | MEDIUM | NOT STARTED |
| `mannequins.txt` | Mannequin definitions | LOW | NOT STARTED |
| `models_items.txt` | 3D model mappings | LOW | NOT STARTED |

### 2. Lua Scripts (`media/lua/`) - 888 files

#### Client-Side (`lua/client/`) - User Interface & Interactions
| Folder | Description | Est. Files | Status |
|--------|-------------|------------|--------|
| `ISUI/` | UI Framework (panels, buttons, etc.) | 50+ | PARTIAL (4 articles) |
| `Context/` | Right-click context menus | 20+ | PARTIAL (1 article) |
| `TimedActions/` | Timed action implementations | 30+ | PARTIAL (1 article) |
| `DebugUIs/` | Debug menu implementations | 15+ | NOT STARTED |
| `Farming/` | Farming UI and logic | 10+ | NOT STARTED |
| `Foraging/` | Foraging UI and logic | 10+ | PARTIAL (1 article) |
| `Fishing/` | Fishing UI and logic | 10+ | NOT STARTED |
| `BuildingObjects/` | Building UI | 15+ | NOT STARTED |
| `Items/` | Item-specific UI | 20+ | NOT STARTED |
| `Hotbar/` | Hotbar system | 5+ | NOT STARTED |
| `Map/` | Map UI | 10+ | NOT STARTED |
| `Music/` | Music player | 5+ | NOT STARTED |
| `OptionScreens/` | Options/settings | 10+ | NOT STARTED |
| `Blacksmith/` | Vanilla blacksmith (base) | 5+ | NOT STARTED |

#### Server-Side (`lua/server/`) - Game Logic
| Folder | Description | Est. Files | Status |
|--------|-------------|------------|--------|
| `Items/` | Item spawn/distribution | 20+ | NOT STARTED |
| `Farming/` | Server farming logic | 10+ | NOT STARTED |
| `Foraging/` | Server foraging logic | 10+ | NOT STARTED |
| `Vehicles/` | Vehicle spawning | 15+ | NOT STARTED |
| `HealthSystem/` | Health/injury system | 10+ | NOT STARTED |
| `Professions/` | Profession definitions | 10+ | NOT STARTED |
| `NPCs/` | NPC logic | 10+ | NOT STARTED |
| `recipecode.lua` | Recipe execution | 1 | NOT STARTED |

#### Shared (`lua/shared/`) - Common Code
| File/Folder | Description | Est. Files | Status |
|-------------|-------------|------------|--------|
| `ISBaseObject.lua` | Base class for all IS objects | 1 | NOT STARTED |
| `luautils.lua` | Utility functions | 1 | NOT STARTED |
| `defines.lua` | Game constants | 1 | NOT STARTED |
| `Definitions/` | Item/recipe definitions | 10+ | NOT STARTED |
| `Translate/` | Translation system | 5+ | NOT STARTED |
| `Reloading/` | Weapon reloading logic | 10+ | NOT STARTED |
| `NPCs/` | NPC definitions | 10+ | NOT STARTED |
| `Foraging/` | Foraging zone definitions | 5+ | NOT STARTED |
| `TimedActions/` | Base timed action class | 5+ | NOT STARTED |

### 3. Java API (via Lua Bridge)

Accessible through Lua but implemented in Java:

| Class/Namespace | Purpose | Status |
|-----------------|---------|--------|
| `getPlayer()` | Player object access | NOT STARTED |
| `getWorld()` | World state | NOT STARTED |
| `getCell()` | Cell/chunk access | NOT STARTED |
| `InventoryItem` | Item manipulation | NOT STARTED |
| `HandWeapon` | Weapon stats | NOT STARTED |
| `IsoPlayer` | Player state | NOT STARTED |
| `IsoGameCharacter` | Character base | NOT STARTED |
| `IsoZombie` | Zombie entities | NOT STARTED |
| `IsoObject` | World objects | NOT STARTED |
| `Vehicle` | Vehicle manipulation | NOT STARTED |
| `SandboxOptions` | Sandbox settings | NOT STARTED |
| `Events` | Event system | PARTIAL (4 articles) |

---

## Documentation Structure

### Proposed Wiki Sections

```
build-41/
├── modding/
│   ├── fundamentals/          # Existing - mod basics
│   ├── items/                 # Existing - item creation
│   ├── recipes/               # Existing - recipe creation
│   ├── lua-api/               # Existing - Lua reference
│   ├── game-mechanics/        # Existing - systems overview
│   ├── weapon-repair/         # Existing - repair system
│   ├── foraging/              # Existing - foraging system
│   │
│   ├── vanilla-reference/     # NEW - Comprehensive vanilla docs
│   │   ├── items/             # All vanilla items by category
│   │   ├── recipes/           # All vanilla recipes
│   │   ├── weapons/           # Weapon stats & attachments
│   │   ├── vehicles/          # Vehicle definitions
│   │   ├── sounds/            # Sound definitions
│   │   ├── animations/        # Animation reference
│   │   └── distributions/     # Loot tables
│   │
│   ├── lua-source/            # NEW - Vanilla Lua documentation
│   │   ├── client/            # Client-side scripts
│   │   ├── server/            # Server-side scripts
│   │   ├── shared/            # Shared scripts
│   │   └── isui/              # UI framework deep-dive
│   │
│   ├── java-api/              # NEW - Java bridge reference
│   │   ├── classes/           # Major Java classes
│   │   ├── methods/           # Common method reference
│   │   └── patterns/          # Usage patterns
│   │
│   └── reference/             # Existing - Quick references
│
└── mapping/                   # Existing mapping section
```

---

## Phase Plan

### Phase 1: Script File Documentation (Priority: Items & Recipes)

**Goal:** Document all item and recipe definitions from .txt files

#### 1.1 Items Documentation
- Parse `items.txt`, `items_weapons.txt`, `items_food.txt`, `newitems.txt`
- Create structured articles for each item category:
  - Weapons (melee, ranged, throwable)
  - Food (perishables, canned, ingredients)
  - Medical supplies
  - Tools
  - Clothing & armor
  - Literature
  - Containers
  - Electronics

#### 1.2 Recipes Documentation
- Parse `recipes.txt`, `uniquerecipes.txt`, `evolvedrecipes.txt`
- Document recipe categories:
  - Crafting recipes
  - Cooking recipes
  - Construction recipes
  - Disassembly recipes

#### 1.3 Fixing System
- Parse `fixing.txt`
- Document all repair definitions
- Cross-reference with items

**Estimated articles: 50-80**

### Phase 2: Lua Source Documentation

**Goal:** Document the vanilla Lua codebase

#### 2.1 Core Systems
- `ISBaseObject.lua` - inheritance system
- `luautils.lua` - utility functions
- `defines.lua` - game constants

#### 2.2 UI Framework (ISUI/)
- Panel system
- Button/checkbox components
- List/grid components
- Modal dialogs
- Layout patterns

#### 2.3 Timed Actions
- Base action class
- Action execution flow
- Common action patterns

#### 2.4 Context Menus
- Menu construction
- Option handlers
- Submenu patterns

#### 2.5 Major Systems
- Farming
- Foraging
- Fishing
- Vehicle handling
- Health/medical

**Estimated articles: 80-120**

### Phase 3: Java API Documentation

**Goal:** Document Java classes accessible from Lua

#### 3.1 Core Objects
- `IsoPlayer` / `IsoGameCharacter`
- `InventoryItem` / `HandWeapon`
- `IsoObject` / `IsoWorldRegion`
- `Vehicle`

#### 3.2 Game Systems
- `SandboxOptions`
- `ClimateManager`
- `ZombiePopulationManager`
- `LootRespawn`

#### 3.3 Events & Hooks
- Complete event list
- Hook patterns
- Timing considerations

**Estimated articles: 40-60**

### Phase 4: Advanced Topics

#### 4.1 Distributions (Loot Tables)
- ProceduralDistributions
- Room definitions
- Container types

#### 4.2 Vehicles
- Vehicle definitions
- Part system
- Mechanics

#### 4.3 Sounds & Animations
- Sound event system
- Animation state machines
- Model attachments

**Estimated articles: 30-50**

---

## Automation Strategy

### Script Parser

Create a TypeScript tool to parse `.txt` script files:

```typescript
// scripts/parse-vanilla-scripts.ts
interface ParsedItem {
  module: string;
  name: string;
  type: string;
  properties: Record<string, string>;
  rawContent: string;
}

// Parse items_weapons.txt -> structured JSON
// Generate wiki article templates
```

### Lua Analyzer

Create a tool to analyze Lua files:

```typescript
// scripts/analyze-lua.ts
interface LuaFile {
  path: string;
  functions: FunctionDef[];
  requires: string[];
  events: string[];
  classes: ClassDef[];
}

// Extract function signatures
// Map dependencies
// Identify event hooks
```

### Article Generator

Create templates for consistent documentation:

```typescript
// scripts/generate-article.ts
// Templates for:
// - Item reference articles
// - Recipe reference articles
// - Lua function documentation
// - Java class documentation
```

---

## Quality Standards

### Article Requirements

1. **Accuracy**: All values must match current game version
2. **Completeness**: Document ALL parameters, not just common ones
3. **Examples**: Include working code examples
4. **Cross-references**: Link related articles
5. **Versioning**: Note version-specific differences

### Code Block Standards

```lua
-- Always include:
-- 1. Working example
-- 2. Required imports/dependencies
-- 3. Expected output/behavior
-- 4. Common variations

-- Example: Getting weapon damage
local weapon = player:getPrimaryHandItem()
if weapon and instanceof(weapon, "HandWeapon") then
    local minDmg = weapon:getMinDamage()
    local maxDmg = weapon:getMaxDamage()
    print("Damage: " .. minDmg .. " - " .. maxDmg)
end
```

### Property Documentation Format

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `MinDamage` | float | 0.2 | Minimum damage dealt |
| `MaxDamage` | float | 0.5 | Maximum damage dealt |
| `Categories` | string | - | Weapon categories (Blunt, Blade, etc.) |

---

## Current Progress Summary

### Completed
- ISUI Framework: 4 articles
- Events System: 4 articles
- Timed Actions: 1 article
- Context Menus: 1 article
- Foraging: 1 article

### In Progress
- (None currently active)

### Not Started
- All script file documentation (items, recipes, fixing)
- Core Lua systems (ISBaseObject, luautils, defines)
- Java API documentation
- Advanced topics

---

## Success Metrics

- [ ] 100% of vanilla items documented
- [ ] 100% of vanilla recipes documented
- [ ] All major Lua systems explained
- [ ] All common Java API methods documented
- [ ] Search covers all content
- [ ] No broken internal links
- [ ] Community contributions enabled

---

## Total Scope Estimate

| Phase | Scope | Articles | Effort |
|-------|-------|----------|--------|
| Phase 1 | Scripts | 50-80 | Medium |
| Phase 2 | Lua | 80-120 | High |
| Phase 3 | Java API | 40-60 | High |
| Phase 4 | Advanced | 30-50 | Medium |
| **Total** | | **200-310** | |

---

## Next Steps

1. **Immediate**: Start with `items_weapons.txt` - parse and document weapon items
2. **Short-term**: Document high-priority items (weapons, food, tools)
3. **Medium-term**: Build out Lua source documentation
4. **Long-term**: Complete Java API reference

---

## Changelog

| Date | Update |
|------|--------|
| 2026-01-19 | Moved to active docs, updated Linux paths, reset status tracking |
| (original) | Initial plan created in archive |
