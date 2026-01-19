# Recipe System Deep Dive - Complete Reference

**Locations:**
- `media/scripts/recipes.txt` - Standard recipes
- `media/scripts/evolvedrecipes.txt` - Evolved (cooking) recipes
- `media/scripts/fixing.txt` - Item repair definitions
- `media/lua/server/recipecode.lua` - Recipe callback hooks

**Purpose:** Complete documentation of crafting, cooking, and repair systems

---

## Overview

Project Zomboid has three distinct crafting systems:

1. **Standard Recipes** - Traditional crafting (combine items → get result)
2. **Evolved Recipes** - Cooking system (add ingredients to base item)
3. **Fixing Recipes** - Item repair system

All systems use script definitions (`.txt`) combined with Lua callbacks for custom behavior.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Script Definitions                           │
│  media/scripts/recipes.txt, evolvedrecipes.txt, fixing.txt       │
│  - Define inputs, outputs, requirements                          │
│  - Reference Lua callbacks by name                               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RecipeManager (Java)                         │
│  - Parses script definitions                                     │
│  - Validates recipe availability                                 │
│  - Manages crafting UI                                           │
│  - Calls Lua hooks at appropriate times                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Recipe Lua Callbacks                          │
│  media/lua/server/recipecode.lua                                 │
│  - Recipe.GetItemTypes.XXX() - Dynamic item lists                │
│  - Recipe.OnTest.XXX() - Item validation                         │
│  - Recipe.OnCanPerform.XXX() - Recipe availability               │
│  - Recipe.OnCreate.XXX() - Post-craft effects                    │
│  - Recipe.OnGiveXP.XXX() - XP rewards                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Standard Recipes

### Script Syntax

```
module Base
{
    recipe Recipe Name
    {
        // Input items
        ItemType,                    // Consume 1 item
        ItemType=3,                  // Consume 3 items
        keep ItemType,               // Use but don't consume
        destroy ItemType,            // Source item becomes result
        [Recipe.GetItemTypes.XXX],   // Dynamic item type list

        // Output
        Result:ItemType,             // Creates 1 item
        Result:ItemType=3,           // Creates 3 items

        // Properties
        Time:100.0,                  // Duration in ticks
        Sound:SoundName,             // Crafting sound
        AnimNode:AnimationName,      // Character animation
        Prop1:ItemOrModel,           // Primary hand model
        Prop2:ItemOrModel,           // Secondary hand model

        // Requirements
        SkillRequired:Perk=Level,    // Skill requirement
        NeedToBeLearn:true,          // Requires magazine/book

        // Conditions
        NearItem:ItemType,           // Must be near object
        InSameInventory:true,        // Items in same container
        CanBeDoneFromFloor:true,     // Can use floor items
        AllowRottenItem:true,        // Allows rotten food
        AllowFrozenItem:true,        // Allows frozen food
        RemoveResultItem:true,       // Don't give result to player

        // Callbacks
        OnTest:Function,             // Item validation
        OnCanPerform:Function,       // Recipe availability check
        OnCreate:Function,           // Post-craft callback
        OnGiveXP:Function,           // XP award function

        // UI
        Category:CategoryName,       // Crafting menu category
        Tooltip:TooltipKey,          // Custom tooltip
    }
}
```

### Recipe Properties Reference

| Property | Type | Description |
|----------|------|-------------|
| `Result` | string | Output item type (Module.Type or just Type) |
| `Time` | float | Crafting time in ticks |
| `Sound` | string | Sound event to play |
| `AnimNode` | string | Animation to use |
| `Prop1`, `Prop2` | string | Hand models during animation |
| `SkillRequired` | string | Perk=Level requirement |
| `NeedToBeLearn` | boolean | Requires recipe knowledge |
| `NearItem` | string | Required nearby object |
| `InSameInventory` | boolean | Items must be in same container |
| `CanBeDoneFromFloor` | boolean | Can use items on ground |
| `AllowRottenItem` | boolean | Accept rotten food |
| `AllowFrozenItem` | boolean | Accept frozen food |
| `AllowDestroyedItem` | boolean | Accept destroyed items |
| `RemoveResultItem` | boolean | Don't add result to inventory |
| `IsHidden` | boolean | Hide from crafting menu |
| `Category` | string | Menu category name |
| `Tooltip` | string | Translation key for tooltip |
| `StopOnWalk` | boolean | Cancel if player walks |
| `StopOnRun` | boolean | Cancel if player runs |

### Input Modifiers

| Modifier | Syntax | Description |
|----------|--------|-------------|
| Amount | `Item=5` | Require/consume 5 of item |
| Keep | `keep Item` | Use but don't consume |
| Destroy | `destroy Item` | Transform item into result |
| Dynamic | `[Recipe.GetItemTypes.XXX]` | Use Lua function for valid items |
| Alternative | `Item1/Item2/Item3` | Any of these items works |

### Categories

Standard crafting categories:
- `Survivalist` - Survival tools
- `Carpentry` - Woodworking
- `Cooking` - Food preparation
- `Farming` - Agriculture
- `Tailoring` - Clothing
- `Metalworking` - Metal crafting
- `Electrical` - Electronics

---

## Evolved Recipes

Evolved recipes allow adding multiple ingredients to a base item, commonly used for cooking.

### Script Syntax

```
module Base
{
    evolvedrecipe Recipe Name
    {
        BaseItem:ItemType,           // Container/base item
        MaxItems:6,                  // Max ingredients
        ResultItem:ItemType,         // Final product type
        Name:Display Name,           // Menu display name

        // Properties
        Cookable:true,               // Can be cooked
        AddIngredientIfCooked:true,  // Can add cooked ingredients
        CanAddSpicesEmpty:true,      // Can add spices to empty
    }
}
```

### Evolved Recipe Properties

| Property | Type | Description |
|----------|------|-------------|
| `BaseItem` | string | Starting container/item |
| `MaxItems` | int | Maximum ingredients allowed |
| `ResultItem` | string | Output item type |
| `Name` | string | Display name in menus |
| `Cookable` | boolean | Can be cooked after preparing |
| `AddIngredientIfCooked` | boolean | Accept cooked ingredients |
| `CanAddSpicesEmpty` | boolean | Add spices without base items |
| `AllowFrozenItem` | boolean | Accept frozen ingredients |

### How Evolved Recipes Work

1. Player starts with base item (e.g., `WaterPot`)
2. Right-click allows adding valid ingredients
3. Each ingredient adds to nutritional values
4. When done, item transforms to `ResultItem`
5. If `Cookable`, can be cooked for bonus

---

## Fixing Recipes

The fixing system allows repairing damaged items.

### Script Syntax

```
module Base
{
    fixing Fix Item Name
    {
        Require : ItemType,                    // Item to repair

        // Repair options (any one works)
        Fixer : Material=Uses,                 // Simple fixer
        Fixer : Material=Uses; Skill=Level,    // Fixer with skill

        // Global modifiers (optional)
        GlobalItem : ItemType,                 // Required for all fixers
    }
}
```

### Fixer Syntax

```
Fixer : DuctTape=2                    -- 2 uses of duct tape
Fixer : Woodglue=2; Woodwork=2        -- 2 glue + Woodwork skill 2
Fixer : Glue=1; Metalworking=3        -- 1 glue + Metalworking 3
```

### Condition Restoration

The condition restored depends on:
- Fixer material type
- Skill level vs requirement
- Original item condition

---

## Recipe Callbacks (recipecode.lua)

All callbacks are defined in the `Recipe` table with sub-tables:

```lua
Recipe = {}
Recipe.GetItemTypes = {}  -- Dynamic item lists
Recipe.OnCanPerform = {}  -- Availability checks
Recipe.OnCreate = {}      -- Post-craft effects
Recipe.OnGiveXP = {}      -- XP rewards
Recipe.OnTest = {}        -- Item validation
```

### Recipe.GetItemTypes

Returns list of valid items for a recipe ingredient.

```lua
-- Signature
function Recipe.GetItemTypes.FunctionName(scriptItems)
    -- scriptItems is a Java ArrayList<ScriptItem>
    -- Add valid items to this list
end

-- Example: Allow any item with "Hammer" tag
function Recipe.GetItemTypes.Hammer(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("Hammer"))
end

-- Example: Allow specific items plus tagged items
function Recipe.GetItemTypes.SharpKnife(scriptItems)
    scriptItems:addAll(getScriptManager():getItemsTag("SharpKnife"))
    addExistingItemType(scriptItems, "FlintKnife")
    addExistingItemType(scriptItems, "HuntingKnife")
    addExistingItemType(scriptItems, "KitchenKnife")
    addExistingItemType(scriptItems, "Machete")
end

-- Usage in recipe script
recipe Make Thing
{
    [Recipe.GetItemTypes.Hammer],
    [Recipe.GetItemTypes.SharpKnife],
    Result:Thing,
}
```

### Recipe.OnTest

Validates individual items for recipe use. Return `false` to reject item.

```lua
-- Signature
function Recipe.OnTest.FunctionName(item)
    return true/false
end

-- Example: Require unworn clothing
function Recipe.OnTest.IsNotWorn(item)
    if instanceof(item, "Clothing") then
        return not item:isWorn()
    end
    return true
end

-- Example: Require cooked food
function Recipe.OnTest.IsCooked(item)
    if instanceof(item, "Food") then
        return item:isCooked()
    end
    return true
end

-- Example: Require full container
function Recipe.OnTest.FullPetrolBottle(item)
    if not item:hasTag("Petrol") then return true end
    return item:getUsedDelta() == 1
end

-- Example: Require untainted water
function Recipe.OnTest.NotTaintedWater(item)
    if item:isWaterSource() then
        return not item:isTaintedWater()
    end
    return true
end
```

### Recipe.OnCanPerform

Checks if recipe can be performed (beyond item requirements).

```lua
-- Signature
function Recipe.OnCanPerform.FunctionName(recipe, playerObj, item)
    return true/false
end

-- Example: Require specific worn item
function Recipe.OnCanPerform.HockeyMaskSmashBottle(recipe, playerObj)
    local wornItem = playerObj:getWornItem("MaskEyes")
    return (wornItem ~= nil) and (wornItem:getType() == "Hat_HockeyMask")
end

-- Example: Item must not be cooked
function Recipe.OnCanPerform.Uncooked(recipe, playerObj, item)
    if item and not instanceof(item, "Food") then return true end
    return item and not (item:isCooked() or item:isBurnt())
end

-- Example: Item must be cooked
function Recipe.OnCanPerform.SliceCooked(recipe, playerObj, item)
    if item and not instanceof(item, "Food") then return true end
    return item and (item:isCooked() or item:isBurnt())
end
```

### Recipe.OnCreate

Called after crafting completes. Modify result, add extra items, etc.

```lua
-- Signature
function Recipe.OnCreate.FunctionName(items, result, player, selectedItem)
    -- items: ArrayList of consumed items
    -- result: The created item
    -- player: IsoPlayer who crafted
    -- selectedItem: The "main" ingredient (optional)
end

-- Example: Set result condition based on ingredient
function Recipe.OnCreate.SpikedBat(items, result, player)
    for i = 1, items:size() do
        local item = items:get(i - 1)
        if item:getType() == "BaseballBat" then
            result:setCondition(item:getCondition())
            break
        end
    end
end

-- Example: Give back container item
function Recipe.OnCreate.PutCakeBatterInBakingPan(items, result, player)
    player:getInventory():AddItem("Base.Bowl")
end

-- Example: Transfer properties from ingredient
function Recipe.OnCreate.SliceBread(items, result, player)
    for i = 0, items:size() - 1 do
        local item = items:get(i)
        if item:getType() == "Bread" then
            result:setBaseHunger(item:getBaseHunger() / 3)
            result:setHungChange(item:getHungChange() / 3)
            result:setCalories(item:getCalories() / 3)
            result:setCarbohydrates(item:getCarbohydrates() / 3)
            result:setLipids(item:getLipids() / 3)
            result:setProteins(item:getProteins() / 3)
        end
    end
end

-- Example: Random bonus items based on skill
function Recipe.OnCreate.DismantleRadio(items, result, player, selectedItem)
    local success = 50 + (player:getPerkLevel(Perks.Electricity) * 5)
    for i = 1, ZombRand(1, 4) do
        local r = ZombRand(1, 4)
        if r == 1 then
            player:getInventory():AddItem("Base.ElectronicsScrap")
        elseif r == 2 then
            player:getInventory():AddItem("Radio.ElectricWire")
        elseif r == 3 then
            player:getInventory():AddItem("Base.Aluminum")
        end
    end
    if ZombRand(0, 100) < success then
        player:getInventory():AddItem("Base.Amplifier")
    end
end

-- Example: Save data for later retrieval
function Recipe.OnCreate.CreateLogStack(items, result, player)
    local ropeItems = {}
    for i = 0, items:size() - 1 do
        local item = items:get(i)
        if item:getFullType() ~= "Base.Log" then
            table.insert(ropeItems, item:getFullType())
        end
    end
    result:getModData().ropeItems = ropeItems
end
```

### Recipe.OnGiveXP

Awards XP after crafting. Default function exists if not specified.

```lua
-- Signature
function Recipe.OnGiveXP.FunctionName(recipe, ingredients, result, player)
    -- recipe: Recipe object
    -- ingredients: ArrayList of used items
    -- result: Created item
    -- player: IsoPlayer
end

-- Default XP function
function Recipe.OnGiveXP.Default(recipe, ingredients, result, player)
    for i = 1, ingredients:size() do
        if ingredients:get(i-1):getType() == "Plank" then
            player:getXp():AddXP(Perks.Woodwork, 1)
        end
    end
    if instanceof(result, "Food") then
        player:getXp():AddXP(Perks.Cooking, 3)
    elseif result:getType() == "Plank" then
        player:getXp():AddXP(Perks.Woodwork, 3)
    end
end

-- No XP
function Recipe.OnGiveXP.None(recipe, ingredients, result, player)
end

-- Fixed XP amounts
function Recipe.OnGiveXP.Cooking10(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Cooking, 10)
end

function Recipe.OnGiveXP.MetalWelding25(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.MetalWelding, 25)
end

-- Skill-based XP
function Recipe.OnGiveXP.SawLogs(recipe, ingredients, result, player)
    if player:getPerkLevel(Perks.Woodwork) <= 3 then
        player:getXp():AddXP(Perks.Woodwork, 3)
    else
        player:getXp():AddXP(Perks.Woodwork, 1)
    end
end
```

---

## Java API Reference

### RecipeManager

```lua
-- Check if recipe can be performed
RecipeManager.IsRecipeValid(recipe, character, item, containers)

-- Perform the recipe
RecipeManager.PerformMakeItem(recipe, item, character, containers)

-- Get all recipes
getScriptManager():getAllRecipes()

-- Find specific recipe
getScriptManager():FindRecipe(recipeName)
```

### Recipe Object Properties

```lua
local recipe = getScriptManager():FindRecipe("Make Stake")

recipe:getName()                -- "Make Stake"
recipe:getOriginalname()        -- Original untranslated name
recipe:getResult()              -- ScriptItem result
recipe:getSource()              -- ArrayList of ingredients
recipe:getTime()                -- Crafting time
recipe:getSound()               -- Sound event name
recipe:getAnimNode()            -- Animation name
recipe:getProp1()               -- Primary hand model
recipe:getProp2()               -- Secondary hand model
recipe:getCategory()            -- Category name
recipe:isCanBeDoneFromFloor()   -- Floor crafting allowed
recipe:isNeedToBeLearn()        -- Requires learning
recipe:getSkillRequired()       -- HashMap of skill requirements
recipe:getNearItem()            -- Required nearby item
recipe:isStopOnWalk()           -- Cancel on walk
recipe:isStopOnRun()            -- Cancel on run
```

---

## Complete Recipe Example

### Script Definition (recipes.txt)

```
module MyMod
{
    recipe Craft Advanced Tool
    {
        Plank=2,
        Nails=4,
        keep [Recipe.GetItemTypes.Hammer],
        [Recipe.GetItemTypes.SharpKnife],

        Result:AdvancedTool,
        Time:200.0,
        Sound:Hammering,
        AnimNode:Craft,

        SkillRequired:Woodwork=3,
        NeedToBeLearn:true,
        CanBeDoneFromFloor:true,

        Category:Carpentry,

        OnTest:Recipe.OnTest.MyToolValidation,
        OnCanPerform:Recipe.OnCanPerform.MyToolCheck,
        OnCreate:Recipe.OnCreate.MyToolCrafted,
        OnGiveXP:Recipe.OnGiveXP.MyToolXP,
    }
}
```

### Lua Callbacks (recipecode.lua or mod file)

```lua
-- Validate items
function Recipe.OnTest.MyToolValidation(item)
    -- Reject broken items
    if instanceof(item, "HandWeapon") then
        return item:getCondition() > 0
    end
    return true
end

-- Check recipe availability
function Recipe.OnCanPerform.MyToolCheck(recipe, playerObj, item)
    -- Require workbench nearby
    local sq = playerObj:getCurrentSquare()
    for i = sq:getX() - 2, sq:getX() + 2 do
        for j = sq:getY() - 2, sq:getY() + 2 do
            local checkSq = getCell():getGridSquare(i, j, sq:getZ())
            if checkSq then
                for k = 0, checkSq:getObjects():size() - 1 do
                    local obj = checkSq:getObjects():get(k)
                    if obj:getSprite() and obj:getSprite():getName() then
                        if string.contains(obj:getSprite():getName(), "workbench") then
                            return true
                        end
                    end
                end
            end
        end
    end
    return false
end

-- Post-craft effects
function Recipe.OnCreate.MyToolCrafted(items, result, player, selectedItem)
    -- Quality based on skill
    local skill = player:getPerkLevel(Perks.Woodwork)
    local quality = ZombRand(skill * 5, skill * 10 + 10)
    if quality > result:getConditionMax() then
        quality = result:getConditionMax()
    end
    result:setCondition(quality)

    -- Bonus item chance
    if ZombRand(100) < skill * 5 then
        player:getInventory():AddItem("Base.Sawdust")
    end
end

-- XP rewards
function Recipe.OnGiveXP.MyToolXP(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Woodwork, 10)
    player:getXp():AddXP(Perks.Crafting, 5)
end
```

---

## Common Vanilla Callback Functions

### GetItemTypes (39 functions)
- `Hammer`, `Saw`, `Screwdriver` - Tool categories
- `SharpKnife`, `DullKnife` - Blade categories
- `CanOpener`, `Scissors`, `Sledgehammer` - Specific tools
- `StartFire`, `WeldingMask`, `GasMask` - Equipment
- `Glue`, `Tape`, `Write` - Supplies
- `Flour`, `Sugar`, `Milk`, `Egg`, `Cheese` - Cooking
- `BakingFat`, `Oil`, `Chocolate` - Ingredients
- `Petrol`, `Liquor`, `Disinfectant` - Liquids

### OnTest (15 functions)
- `IsNotWorn`, `IsWorn` - Clothing state
- `WholeMilk`, `WholeEgg`, `WholeBreadSlices` - Food completeness
- `FullLiquor`, `FullPetrolBottle` - Container fullness
- `NotTaintedWater` - Water safety
- `RefillBlowTorch` - Tool state
- `SliceBreadDough` - Cooking state
- `CutFish`, `CutFillet` - Size requirements
- `WashClothing` - Cleanliness
- `DismantleElectronics` - Not favorited

### OnCanPerform (7 functions)
- `Uncooked`, `SliceCooked` - Food state checks
- `HockeyMaskSmashBottle` - Worn item check
- `CleanMuffin`, `GetMuffin`, `GetBiscuit` - Cooking checks

### OnCreate (50+ functions)
- Food processing: `SliceBread`, `SlicePie`, `CutFish`, `CutAnimal`
- Container returns: `PutCakeBatterInBakingPan`, `OpenCannedFood`
- State transfer: `TorchBatteryInsert`, `SpikedBat`
- Dismantle: `DismantleRadio`, `DismantleFlashlight`
- Cooking: `HotCuppa`, `MakeBowlOfSoup4`, `CannedFood`
- Crafting: `CreateSpear`, `RadioCraft`, `RipClothing`

### OnGiveXP (20 functions)
- `None`, `Default` - Standard XP
- `Cooking3`, `Cooking10` - Cooking skill
- `WoodWork5`, `SawLogs` - Carpentry
- `MetalWelding10-25`, `Blacksmith10-25` - Metalwork
- `DismantleElectronics`, `DismantleRadio` - Electrical

---

## Events Related to Recipes

```lua
-- Recipe item created
Events.OnMakeItem.Add(function(item, player, items)
    print("Crafted: " .. item:getFullType())
end)

-- Distribution merging (affects recipe availability)
Events.OnPreDistributionMerge.Add(function()
    -- Modify before merge
end)

Events.OnDistributionMerge.Add(function()
    -- Modify during merge
end)

Events.OnPostDistributionMerge.Add(function()
    -- Modify after merge
end)
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Standard recipe syntax | Complete |
| Evolved recipe syntax | Complete |
| Fixing recipe syntax | Complete |
| Recipe.GetItemTypes | Complete |
| Recipe.OnTest | Complete |
| Recipe.OnCanPerform | Complete |
| Recipe.OnCreate | Complete |
| Recipe.OnGiveXP | Complete |
| Java API reference | Complete |
| Complete examples | Complete |

---

## Related Systems

- **ISCraftAction** - Timed action for crafting
- **Context Menus** - Recipe menu integration
- **Inventory System** - Item management
- **Skills/XP** - Progression integration
