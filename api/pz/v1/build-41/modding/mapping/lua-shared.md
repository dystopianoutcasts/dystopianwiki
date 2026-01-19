# lua/shared/ Folder Documentation

**Location:** `media/lua/shared/`
**File Count:** 66 Lua files
**Purpose:** Utilities, definitions, and code shared between client and server

---

## Folder Structure

```
lua/shared/
├── a_requires.lua           # Load order requirements
├── defines.lua              # ZomboidGlobals constants
├── ISBaseObject.lua         # Base OOP class
├── luautils.lua             # Utility functions
├── keyBinding.lua           # Key binding system
├── iwbumstempmodelcompat.lua # Model compatibility
├── SpawnRegions.lua         # Spawn region definitions
├── VehicleZoneDefinition.lua # Vehicle zone definitions
│
├── Definitions/             # Game definitions (14 files)
├── Fishing/                 # Fishing system (1 file)
├── Foraging/                # Foraging system (2 files)
├── JoyPad/                  # Controller support (1 file)
├── Logs/                    # Logging system (2 files)
├── NPCs/                    # NPC definitions (4 files)
├── RecordedMedia/           # TV/Radio content (2 files)
├── Reloading/               # Weapon reload system (11 files)
├── Sandbox/                 # Sandbox presets (8 files)
├── SoundBanks/              # Sound definitions (1 file)
├── StashDescriptions/       # Stash definitions (1 file)
├── TimedActions/            # Base timed action (1 file)
├── Translate/               # Translation utilities (1 file)
└── Util/                    # Utility classes (2 files)
```

---

## Core Files

### ISBaseObject.lua
**Purpose:** Base class for OOP in PZ

```lua
ISBaseObject = {};
ISBaseObject.Type = "ISBaseObject";

function ISBaseObject:derive(type)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.Type = type;
    return o
end

function ISBaseObject:new()
    local o = {}
    setmetatable(o, self)
    self.__index = self
    return o
end
```

**Usage:**
```lua
require "ISBaseObject"
MyClass = ISBaseObject:derive("MyClass");
```

**Wiki Article:** `lua-api/isbaseobject.json`

---

### defines.lua
**Purpose:** Global game constants (ZomboidGlobals)

```lua
ZomboidGlobals = {
    -- Loot modifiers
    FoodLootModifier = 0.6,
    WeaponLootModifier = 0.6,
    OtherLootModifier = 0.6,

    -- Endurance
    RunningEnduranceReduce = 0.0000520,
    SprintingEnduranceReduce = 0.0004550,
    ImobileEnduranceIncrease = 0.0000930/3,

    -- Thirst
    ThirstIncrease = 0.0000040 * 2,
    ThirstSleepingIncrease = 0.0000010,
    ThirstLevelToAutoDrink = 0.1,
    ThirstLevelReductionOnAutoDrink = 0.1,

    -- Hunger
    HungerIncrease = 0.0000032 * 3,
    HungerIncreaseWhenWellFed = 0,
    HungerIncreaseWhenExercise = 0.0000032 * 6,
    HungerIncreaseWhileAsleep = 0.0000010,

    -- Fatigue
    FatigueIncrease = 0.0000345,

    -- Stress/Mood
    StressDecrease = 0.00003,
    BoredomIncrease = 0.0010,
    BoredomDecrease = 0.0385,
    UnhappinessIncrease = 0.0005,

    -- Stress sources
    StressFromSoundsMultiplier = 0.00002,
    StressFromBiteOrScratch = 0.00005,
    StressFromHemophobic = 0.0000003333,

    -- Anger
    AngerDecrease = 0.0001,
    BroodingAngerDecreaseMultiplier = 0.3,

    -- Sleep
    SleepFatigueReduction = 0.000003,

    -- Interaction
    DistanceFromContainersToPickup = 1.3,

    -- Weather effects
    WetnessIncrease = 0.015,
    WetnessDecrease = 0.01,
    CatchAColdIncreaseRate = 0.003,
    CatchAColdDecreaseRate = 0.175,

    -- Health
    PoisonLevelDecrease = 0.0010,
    PoisonHealthReduction = 0.0465,
    FoodSicknessDecrease = 0.0015,
}
```

**Modding Use:** These can be modified to adjust game balance.

---

### luautils.lua
**Purpose:** General utility functions

#### String Functions
```lua
luautils.stringStarts(String, Start)  -- Check if string starts with
luautils.stringEnds(String, End)      -- Check if string ends with
luautils.trim(s)                       -- Trim whitespace
luautils.split(str, sep)               -- Split string by separator
```

#### Array Functions
```lua
luautils.indexOf(table, value)         -- Find index of value (-1 if not found)
```

#### World Functions
```lua
luautils.getNextTiles(cell, startingGrid, range)  -- Get tiles in range
luautils.walkAdj(player, square, keepActions)      -- Walk to adjacent tile
luautils.walkAdjWall(player, square, north, keep)  -- Walk to wall
luautils.walkAdjWindowOrDoor(player, square, item) -- Walk to window/door
luautils.walkToContainer(container, playerNum)     -- Walk to container
luautils.getCorrectSquareForWall(player, square)   -- Get correct side of wall
```

#### Equipment Functions
```lua
luautils.equipItems(player, primary, secondary)    -- Equip items
luautils.isEquipped(item, player)                  -- Check equip slot (0,1,2,3)
luautils.weaponLowerCondition(weapon, char, replace, chance) -- Damage weapon
```

#### Inventory Functions
```lua
luautils.haveToBeTransfered(player, item, dontWalk) -- Check if item needs transfer
luautils.walkToContainer(container, playerNum)       -- Walk to container
```

#### UI Functions
```lua
luautils.okModal(text, centered, width, height, posX, posY) -- Show modal dialog
```

#### Math Functions
```lua
luautils.round(num, idp)                -- Round to decimal places
luautils.getConditionRGB(condition)     -- Get color for condition (0-100)
```

#### Spatial Functions
```lua
luautils.isSquareAdjacentToSquare(sq1, sq2) -- Check if squares adjacent
```

---

## Definitions/ Folder (14 files)

### AttachedWeaponDefinitions.lua
Defines where weapons attach to character models.

### ClothingRecipesDefinitions.lua
Clothing crafting recipe definitions.

### ClothingSelectionDefinitions.lua
Character creation clothing options.

### ContainerButtonIcons.lua
Icons for container UI buttons.

### DamageModelDefinitions.lua
Character damage model visual definitions.

### DefaultClothing.lua
Default clothing for new characters.

### FitnessExercises.lua
Exercise definitions for fitness system.

### HairOutfitDefinitions.lua
Hair style definitions.

### MakeUpDefinitions.lua
Make-up/face paint definitions.

### MapSymbolDefinitions.lua
Map annotation symbols.

### SmashedCarDefinitions.lua
Destroyed vehicle visual states.

### UnderwearDefinition.lua
Underwear clothing definitions.

**Wiki Article:** Could create `reference/definitions.json`

---

## Reloading/ Folder (11 files)

**Purpose:** Weapon reload system

### Class Hierarchy
```
ISBaseObject
└── ISReloadable (base reload class)
    ├── ISReloadableWeapon (base weapon)
    │   ├── ISRevolverWeapon
    │   ├── ISSemiAutoWeapon
    │   └── ISShotgunWeapon
    └── ISReloadableMagazine
```

### ISReloadable.lua
Base class for reloadable items.

```lua
ISReloadable = ISBaseObject:derive("ISReloadable");

-- Core methods
function ISReloadable:isLoaded()           -- Can weapon fire?
function ISReloadable:fireShot()           -- Called when firing
function ISReloadable:canReload(chr)       -- Can start reload?
function ISReloadable:isReloadValid(...)   -- Is reload still valid?
function ISReloadable:reloadStart(...)     -- Called at reload start
function ISReloadable:reloadPerform(...)   -- Called when reload completes
```

### ISReloadManager.lua
Manages weapon reload state.

### ISReloadUtil.lua
Reload utility functions.

### ISReloadAction.lua
Timed action for reloading.

### ISRackAction.lua
Timed action for racking weapons.

### Weapon Type Files
- `ISRevolverWeapon.lua` - Revolvers (cylinder loading)
- `ISSemiAutoWeapon.lua` - Semi-auto pistols (magazine)
- `ISShotgunWeapon.lua` - Shotguns (tube loading)

### stormysReload.lua
Additional reload utilities.

---

## Foraging/ Folder (2 files)

### forageDefinitions.lua
Defines forageable items by zone type.

### forageSystem.lua
Core foraging mechanics.

**Wiki Article:** `foraging/` category exists

---

## Fishing/ Folder (1 file)

### fishing_properties.lua
Fish types, bait, and fishing mechanics.

---

## NPCs/ Folder (4 files)

### AttachedLocations.lua
Body locations for attachments.

### BodyLocations.lua
Body part definitions.

### MainCreationMethods.lua
Character creation system.

### ZombiesZoneDefinition.lua
Zombie spawn zone definitions.

---

## Sandbox/ Folder (8 files)

Sandbox preset definitions:

| File | Preset |
|------|--------|
| Apocalypse.lua | Default difficulty |
| Beginner.lua | Easy mode |
| Builder.lua | Building-focused |
| FirstWeek.lua | Time-limited |
| SixMonthsLater.lua | Long-term survival |
| Survival.lua | Standard survival |
| Survivor.lua | Experienced mode |
| SandboxVars.lua | Variable definitions |

---

## TimedActions/ Folder (1 file)

### ISBaseTimedAction.lua
Base class for all timed actions.

**Wiki Article:** `lua-api/timed-actions.json`

---

## Other Folders

### Logs/ (2 files)
- `ISLogSystem.lua` - Action logging
- `ISPerkLog.lua` - Skill/perk logging

### Util/ (2 files)
- `LuaList.lua` - List data structure

### JoyPad/ (1 file)
- `JoyPadSetup.lua` - Controller configuration

### RecordedMedia/ (2 files)
- `ISRecordeMedia.lua` - Recorded media system
- `recorded_media.lua` - TV/Radio content

### SoundBanks/ (1 file)
- `SoundBanks.lua` - Sound bank definitions

### StashDescriptions/ (1 file)
- Annotated stash location descriptions

### Translate/ (1 file)
- Translation helper utilities

---

## Documentation Status

| Component | Status | Wiki Article |
|-----------|--------|--------------|
| ISBaseObject | Complete | lua-api/isbaseobject.json |
| defines.lua | Documented | (this file) |
| luautils.lua | Documented | (this file) |
| Definitions/ | Partial | Needs article |
| Reloading/ | Documented | Needs article |
| Foraging/ | Partial | foraging/ category |
| Fishing/ | Not started | Needs article |
| NPCs/ | Not started | Needs article |
| Sandbox/ | Documented | (this file) |
| TimedActions/ | Complete | lua-api/timed-actions.json |
| Logs/ | Not started | Low priority |
| Util/ | Not started | Low priority |

---

## Modding Patterns

### Creating a Custom Reloadable
```lua
require "Reloading/ISReloadable"

MyCustomWeapon = ISReloadable:derive("MyCustomWeapon");

function MyCustomWeapon:isLoaded()
    return self.currentAmmo > 0;
end

function MyCustomWeapon:fireShot()
    self.currentAmmo = self.currentAmmo - 1;
end

function MyCustomWeapon:canReload(chr)
    return chr:getInventory():contains("MyAmmoType");
end
```

### Modifying ZomboidGlobals
```lua
-- In your mod's main.lua
Events.OnGameBoot.Add(function()
    ZomboidGlobals.HungerIncrease = ZomboidGlobals.HungerIncrease * 0.5;
end);
```

### Using luautils
```lua
-- Walk player to a container
luautils.walkToContainer(container, player:getPlayerNum());

-- Check if item is equipped
local slot = luautils.isEquipped(item, player);
if slot == 1 then print("Primary hand"); end

-- Split a string
local parts = luautils.split("a,b,c", ",");
```
