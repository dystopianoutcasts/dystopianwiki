# lua/server/ Folder Documentation

**Location:** `media/lua/server/`
**File Count:** 130 Lua files
**Purpose:** Server-side logic: spawning, recipes, NPC AI, game mechanics

---

## Folder Structure

```
lua/server/
├── ClientCommands.lua         # Client command handlers
├── ISBuildingBlueprintManager.lua # Building blueprints
├── ISCoordConversion.lua      # Coordinate utilities
├── ISObjectClickHandler.lua   # Object click handling
├── recipecode.lua             # Recipe callbacks
├── TemplateReplacers.lua      # Template replacement
├── TutorialHelperFunctions.lua # Tutorial utilities
│
├── BuildingObjects/           # Building system
├── Camping/                   # Camping mechanics
├── Climate/                   # Climate system
├── Farming/                   # Farming mechanics
├── FireFighting/              # Fire mechanics
├── Fishing/                   # Fishing mechanics
├── Foraging/                  # Foraging mechanics
├── HealthSystem/              # Health mechanics
├── Items/                     # Item server logic
├── Map/                       # Map generation
├── MetalDrum/                 # Metal drum system
├── metazones/                 # Meta zone system
├── Movers/                    # NPC movement
├── NewSelectionSystem/        # Selection system
├── NPCs/                      # NPC AI and spawning
├── Professions/               # Profession system
├── radio/                     # Radio broadcasts
├── RainBarrel/                # Rain barrel mechanics
├── Seasons/                   # Season system
├── Traps/                     # Trap mechanics
├── TurnBased/                 # Turn-based mode
├── Vehicles/                  # Vehicle mechanics
└── XpSystem/                  # XP calculations
```

---

## Core Files

### recipecode.lua
**Purpose:** Recipe callback system - defines all Recipe.* functions

#### Recipe Tables

```lua
Recipe = {}
Recipe.GetItemTypes = {}   -- Item type lookups
Recipe.OnCanPerform = {}   -- Pre-craft checks
Recipe.OnCreate = {}       -- Post-craft modifications
Recipe.OnGiveXP = {}       -- XP rewards
Recipe.OnTest = {}         -- Availability tests
```

#### Recipe.GetItemTypes
Returns valid items for recipe ingredient wildcards.

```lua
-- Usage in recipe: [Recipe.GetItemTypes.Hammer]
function Recipe.GetItemTypes.Hammer(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("Hammer"))
end

function Recipe.GetItemTypes.SharpKnife(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("SharpKnife"))
    addExistingItemType(scriptItems, "FlintKnife")
    addExistingItemType(scriptItems, "HuntingKnife")
    addExistingItemType(scriptItems, "KitchenKnife")
    addExistingItemType(scriptItems, "Machete")
end

function Recipe.GetItemTypes.Saw(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("Saw"))
end

function Recipe.GetItemTypes.Screwdriver(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("Screwdriver"))
end

function Recipe.GetItemTypes.CanOpener(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("CanOpener"))
end

function Recipe.GetItemTypes.StartFire(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("StartFire"))
    addExistingItemType(scriptItems, "Lighter")
    addExistingItemType(scriptItems, "Matches")
end
```

**Available GetItemTypes:**
- Hammer, Saw, Screwdriver, Scissors
- SharpKnife, DullKnife
- CanOpener, Corkscrew
- StartFire, WeldingMask
- Glue, Fork, Spoon
- Disinfectant, GasMask, HazmatSuit
- Egg, Milk, Rice, FishMeat
- Liquor, Petrol, Razor
- MortarPestle, Sledgehammer

#### Recipe.OnCreate
Modify result item after crafting.

```lua
-- Called after recipe completes
function Recipe.OnCreate.HotCuppa(items, result, player)
    result:setCooked(true);
    result:setHeat(2.5);
end

-- Custom OnCreate example
function Recipe.OnCreate.MyCustomRecipe(items, result, player)
    -- items = ingredients used
    -- result = crafted item
    -- player = crafter
    result:setCondition(result:getConditionMax());
end
```

#### Recipe.OnCanPerform
Check if recipe can be performed.

```lua
function Recipe.OnCanPerform.IsRaining(recipe, player, item)
    return RainManager.isRaining();
end

function Recipe.OnCanPerform.HasWater(recipe, player, item)
    return player:getInventory():containsWater();
end
```

#### Recipe.OnGiveXP
Award XP after crafting.

```lua
function Recipe.OnGiveXP.Cooking5(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Cooking, 5);
end

function Recipe.OnGiveXP.Carpentry10(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Woodwork, 10);
end

function Recipe.OnGiveXP.Blacksmith25(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Blacksmith, 25);
end
```

#### Recipe.OnTest
Test if recipe should appear.

```lua
function Recipe.OnTest.WholeMilk(item)
    return item:getUsedDelta() >= 1;
end

function Recipe.OnTest.NotEmpty(item)
    return item:getCurrentUses() > 0;
end
```

---

## NPCs/ Folder

### Key Files

| File | Purpose |
|------|---------|
| MainCreationMethods.lua | Character creation |
| ZombieSpawn.lua | Zombie spawning |
| SurvivorSpawn.lua | Survivor spawning |
| SadisticAIDirector/ | AI director system |

### Zombie Spawning

```lua
-- Spawn zombie at location
createZombie(x, y, z, cell, outfit)

-- Get zombie spawn rates
getWorld():getZombieSpawningRate()
```

---

## Vehicles/ Folder

Vehicle server-side logic.

| File | Purpose |
|------|---------|
| Vehicles.lua | Core vehicle functions |
| VehicleParts.lua | Part management |
| VehicleZones.lua | Zone definitions |

---

## BuildingObjects/ Folder

Construction and building placement.

```lua
-- ISBuildingObject (server)
function ISBuildingObject:walkTo(...)
function ISBuildingObject:canBePlaced(...)
function ISBuildingObject:create(...)
```

---

## Farming/ Folder

Farming server mechanics.

| File | Purpose |
|------|---------|
| farming_vegetable.lua | Crop definitions |
| farming_harvest.lua | Harvest mechanics |
| farming_planting.lua | Planting mechanics |

---

## Foraging/ Folder

Foraging spawn and zone system.

---

## HealthSystem/ Folder

Health and body damage mechanics.

---

## Map/ Folder

Map-related server functions.

| File | Purpose |
|------|---------|
| SGlobalObject.lua | Server global objects |
| SGlobalObjectSystem.lua | Object system |

---

## Movers/ Folder

NPC movement and pathfinding.

| File | Purpose |
|------|---------|
| ISBaseMover.lua | Base mover class |
| MoverStateMachine.lua | State machine |
| MoverStates/ | Individual states |

---

## XpSystem/ Folder

XP and skill server calculations.

---

## radio/ Folder

Radio broadcast system.

| File | Purpose |
|------|---------|
| RadioData.lua | Broadcast data |
| RadioChannels.lua | Channel definitions |

---

## Adding Custom Recipe Callbacks

### Custom GetItemTypes

```lua
-- In your mod
Recipe.GetItemTypes.MyCustomTool = function(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("MyToolTag"))
    addExistingItemType(scriptItems, "MySpecificTool")
end
```

### Custom OnCreate

```lua
Recipe.OnCreate.MyEnchantedSword = function(items, result, player)
    -- Set custom properties
    result:setName("Enchanted " .. result:getName())
    result:setCondition(result:getConditionMax())

    -- Store custom data
    local modData = result:getModData()
    modData.enchanted = true
    modData.enchantLevel = player:getPerkLevel(Perks.Blacksmith)
end
```

### Custom OnGiveXP

```lua
Recipe.OnGiveXP.MultiSkill = function(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Woodwork, 5)
    player:getXp():AddXP(Perks.Metalworking, 5)
end
```

### Custom OnCanPerform

```lua
Recipe.OnCanPerform.NeedsWorkbench = function(recipe, player, item)
    -- Check if near workbench
    local sq = player:getCurrentSquare()
    for dx = -2, 2 do
        for dy = -2, 2 do
            local checkSq = getCell():getGridSquare(sq:getX() + dx, sq:getY() + dy, sq:getZ())
            if checkSq then
                local objects = checkSq:getObjects()
                for i = 0, objects:size() - 1 do
                    local obj = objects:get(i)
                    if obj:getSprite() and obj:getSprite():getName() == "workbench_sprite" then
                        return true
                    end
                end
            end
        end
    end
    return false
end
```

### Custom OnTest

```lua
Recipe.OnTest.NotBroken = function(item)
    return item:getCondition() > 0
end

Recipe.OnTest.IsFull = function(item)
    return item:getUsedDelta() >= 1.0
end
```

---

## Documentation Status

| Component | Files | Status |
|-----------|-------|--------|
| recipecode.lua | 1 | Complete |
| NPCs/ | ~20 | Not started |
| Vehicles/ | ~10 | Not started |
| Farming/ | ~10 | Not started |
| BuildingObjects/ | ~15 | Not started |
| Map/ | ~10 | Not started |
| Other folders | ~60 | Not started |

---

## Key Patterns

### Server Events
```lua
-- Server-side events
Events.OnClientCommand.Add(function(module, command, player, args)
    if module == "MyMod" and command == "doSomething" then
        -- Handle command from client
    end
end)
```

### Sending to Client
```lua
-- From server to client
sendServerCommand(player, "MyMod", "response", {data = value})

-- From client (in lua/client)
sendClientCommand(player, "MyMod", "request", {data = value})
```

---

## Next Steps

1. Document NPC spawning system
2. Document vehicle server mechanics
3. Document farming mechanics
4. Create Recipe callbacks article
