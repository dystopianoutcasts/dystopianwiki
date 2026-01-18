# Project Zomboid Vanilla Documentation Plan

## Mission

Create the most comprehensive Project Zomboid modding wiki by systematically documenting ALL exposed vanilla game code - Lua scripts, .txt definitions, and Java API bridges.

---

## Source Material Inventory

### 1. Script Files (`media/scripts/`) - 153 files

| File/Folder | Content Type | Priority |
|-------------|--------------|----------|
| `items.txt` | Base items | HIGH |
| `items_weapons.txt` | Weapon definitions | HIGH |
| `items_food.txt` | Food items | HIGH |
| `items_literature.txt` | Books, magazines | MEDIUM |
| `items_radio.txt` | Radio equipment | LOW |
| `newitems.txt` | Additional items | HIGH |
| `recipes.txt` | Crafting recipes | HIGH |
| `uniquerecipes.txt` | Special recipes | HIGH |
| `evolvedrecipes.txt` | Evolved recipes (soups, etc.) | MEDIUM |
| `recipes_radio.txt` | Radio recipes | LOW |
| `fixing.txt` | Repair definitions | HIGH |
| `farming.txt` | Farming definitions | MEDIUM |
| `camping.txt` | Camping items | MEDIUM |
| `vehicles/` | Vehicle definitions | MEDIUM |
| `weapons/` | Weapon attachments | HIGH |
| `clothing/` | Clothing definitions | MEDIUM |
| `animations.txt` | Animation definitions | LOW |
| `sounds_*.txt` | Sound definitions (8 files) | MEDIUM |
| `moveables.txt` | Moveable objects | LOW |
| `multistagebuild.txt` | Multi-stage building | MEDIUM |
| `mannequins.txt` | Mannequin definitions | LOW |
| `models_items.txt` | 3D model mappings | LOW |

### 2. Lua Scripts (`media/lua/`) - 888 files

#### Client-Side (`lua/client/`) - User Interface & Interactions
| Folder | Description | Est. Files |
|--------|-------------|------------|
| `ISUI/` | UI Framework (panels, buttons, etc.) | 50+ |
| `Context/` | Right-click context menus | 20+ |
| `TimedActions/` | Timed action implementations | 30+ |
| `DebugUIs/` | Debug menu implementations | 15+ |
| `Farming/` | Farming UI and logic | 10+ |
| `Foraging/` | Foraging UI and logic | 10+ |
| `Fishing/` | Fishing UI and logic | 10+ |
| `BuildingObjects/` | Building UI | 15+ |
| `Items/` | Item-specific UI | 20+ |
| `Hotbar/` | Hotbar system | 5+ |
| `Map/` | Map UI | 10+ |
| `Music/` | Music player | 5+ |
| `OptionScreens/` | Options/settings | 10+ |
| `Blacksmith/` | Vanilla blacksmith (base) | 5+ |

#### Server-Side (`lua/server/`) - Game Logic
| Folder | Description | Est. Files |
|--------|-------------|------------|
| `Items/` | Item spawn/distribution | 20+ |
| `Farming/` | Server farming logic | 10+ |
| `Foraging/` | Server foraging logic | 10+ |
| `Vehicles/` | Vehicle spawning | 15+ |
| `HealthSystem/` | Health/injury system | 10+ |
| `Professions/` | Profession definitions | 10+ |
| `NPCs/` | NPC logic | 10+ |
| `recipecode.lua` | Recipe execution | 1 |

#### Shared (`lua/shared/`) - Common Code
| File/Folder | Description | Est. Files |
|-------------|-------------|------------|
| `ISBaseObject.lua` | Base class for all IS objects | 1 |
| `luautils.lua` | Utility functions | 1 |
| `defines.lua` | Game constants | 1 |
| `Definitions/` | Item/recipe definitions | 10+ |
| `Translate/` | Translation system | 5+ |
| `Reloading/` | Weapon reloading logic | 10+ |
| `NPCs/` | NPC definitions | 10+ |
| `Foraging/` | Foraging zone definitions | 5+ |
| `TimedActions/` | Base timed action class | 5+ |

### 3. Java API (via Lua Bridge)

Accessible through Lua but implemented in Java:

| Class/Namespace | Purpose | Documentation Status |
|-----------------|---------|---------------------|
| `getPlayer()` | Player object access | Partial |
| `getWorld()` | World state | Partial |
| `getCell()` | Cell/chunk access | Minimal |
| `InventoryItem` | Item manipulation | Good (in API_Research) |
| `HandWeapon` | Weapon stats | Good (in API_Research) |
| `IsoPlayer` | Player state | Partial |
| `IsoGameCharacter` | Character base | Partial |
| `IsoZombie` | Zombie entities | Minimal |
| `IsoObject` | World objects | Minimal |
| `Vehicle` | Vehicle manipulation | Minimal |
| `SandboxOptions` | Sandbox settings | Minimal |
| `Events` | Event system | Good (in wiki) |

### 4. Existing Documentation (OutcastTESTING_DOCS)

**Ready to migrate (vanilla-focused):**
- `API_Research/` - Java-Lua bridge documentation
- `Weapon_Repair_Research/` - Complete repair system
- `FORAGING_RESEARCH/` - Foraging system breakdown
- `vanilla_xp_system/` - XP mechanics
- `PZ_Injury_System_Reference.md` - Health system
- `PZ_Literature_System_Complete_Guide.md` - Books/skillbooks
- `SOUND_REFERENCE.md` - Sound system
- `ANIMATION_REFERENCE.md` - Animation system
- `vanilla_distribution_tables.txt` - Loot tables

**Exclude (proprietary):**
- `outcast_smithing_master/`, `techblade/`, `Prestige/`, etc.

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

## Success Metrics

- [ ] 100% of vanilla items documented
- [ ] 100% of vanilla recipes documented
- [ ] All major Lua systems explained
- [ ] All common Java API methods documented
- [ ] Search covers all content
- [ ] No broken internal links
- [ ] Community contributions enabled

---

## Timeline Estimates

| Phase | Scope | Articles | Effort |
|-------|-------|----------|--------|
| Phase 1 | Scripts | 50-80 | Medium |
| Phase 2 | Lua | 80-120 | High |
| Phase 3 | Java API | 40-60 | High |
| Phase 4 | Advanced | 30-50 | Medium |
| **Total** | | **200-310** | |

---

## Next Steps

1. **Immediate**: Create script parser for `.txt` files
2. **Short-term**: Document high-priority items (weapons, food, tools)
3. **Medium-term**: Build out Lua source documentation
4. **Long-term**: Complete Java API reference

---

## File Locations Reference

```
Game Files:
  R:\Games\Steam\steamapps\common\ProjectZomboid\media\
  ├── scripts/     # .txt definitions (items, recipes, etc.)
  ├── lua/         # Lua source code
  │   ├── client/  # Client-side scripts
  │   ├── server/  # Server-side scripts
  │   └── shared/  # Shared scripts
  └── luaexamples/ # Official examples

Existing Research:
  C:\Users\ediaz\Desktop\DystopeanOutcasts\OutcastTESTING_DOCS\
  ├── API_Research/           # Java-Lua bridge docs
  ├── Weapon_Repair_Research/ # Repair system
  ├── FORAGING_RESEARCH/      # Foraging system
  └── vanilla_xp_system/      # XP mechanics

Wiki:
  C:\Users\ediaz\Desktop\DystopeanOutcasts\Dystopian_Wiki\
  └── public/data/build-41/modding/  # Current articles
```
