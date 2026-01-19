---
id: file-types-explained
slug: file-types-explained
title: File Types Explained
excerpt: Project Zomboid modding uses several file types, each with specific syntax rules. This guide covers the most important ones: script files (`.txt`) for items and recipes, and Lua files (`.lua`) for...
game: pz
version: build-41
section: modding
category: fundamentals
subcategory: null
difficulty: beginner
tags:
  - beginner
  - syntax
  - txt
  - lua
  - items
  - recipes
  - scripts
  - format
last_updated: 2026-01-09
---
# File Types Explained

## Overview

Project Zomboid modding uses several file types, each with specific syntax rules. This guide covers the most important ones: script files (`.txt`) for items and recipes, and Lua files (`.lua`) for game logic.

## Script Files (.txt)

Script files define game content using a custom syntax. They live in `media/scripts/`.

### The Golden Rule

> **Items use equals (`=`). Recipes use colons (`:`).**

This is the #1 cause of beginner errors. Memorize it.

```
// ITEM - uses equals
item Example {
    Weight = 1.0,
    Type = Normal,
}

// RECIPE - uses colons  
recipe Example {
    Result:OutputItem,
    Time:100.0,
}
```

## Item Definition Syntax

### Basic Structure

```
module ModuleName {
    imports {
        Base
    }

    item ItemName {
        Property = Value,
        Property = Value,
    }
}
```

### Anatomy of an Item

```
item 9mmBulletsMold {                    <- Item identifier (no spaces)
    DisplayCategory = Ammo,              <- UI category
    Weight = 0.5,                        <- Encumbrance weight
    Type = Normal,                       <- Behavior type
    DisplayName = 9mm Bullets Mold,      <- Player-visible name
    Icon = BulletMold,                   <- Texture file reference
    MetalValue = 15,                     <- Smelting value
    WorldStaticModel = Mold_Ground,      <- 3D model when dropped
}
```

### Required Properties

Every item needs at minimum:

| Property | Purpose | Example |
|----------|---------|--------|
| `DisplayName` | Name shown to players | `DisplayName = Hammer,` |
| `Type` | Fundamental behavior | `Type = Normal,` |
| `Weight` | Encumbrance value | `Weight = 1.0,` |
| `Icon` | Inventory texture | `Icon = Hammer,` |

### Item Types

| Type | Use For | Example Items |
|------|---------|---------------|
| `Normal` | Standard items | Tools, materials, ammo |
| `Drainable` | Items with uses/charges | Gunpowder, gas cans, paint |
| `Food` | Edible items | Food, drinks |
| `Weapon` | Combat items | Melee, firearms |
| `Container` | Storage items | Bags, boxes |
| `Clothing` | Wearable items | Shirts, armor |
| `Literature` | Readable items | Books, magazines |
| `Key` | Access items | Keys, keycards |

### Type-Specific Properties

**Normal Items:**
```
item Bullets9mm {
    Type = Normal,
    Count = 5,              <- Stack size
    MetalValue = 1,         <- Smelting return
}
```

**Drainable Items:**
```
item GunPowder {
    Type = Drainable,
    UseDelta = 0.1,         <- 10% consumed per use
    WeightEmpty = 0.01,     <- Weight when empty
    UseWhileEquipped = FALSE,
}
```

**Food Items:**
```
item Apple {
    Type = Food,
    HungerChange = -20,     <- Reduces hunger
    ThirstChange = -5,      <- Reduces thirst
    DaysFresh = 4,          <- Days until rotting
    DaysTotallyRotten = 8,  <- Days until inedible
}
```

### Complete Item Examples

**Simple Material:**
```
module Base {
    imports {
        Base
    }

    item ScrapMetal {
        DisplayCategory = Material,
        DisplayName = Scrap Metal,
        Type = Normal,
        Weight = 0.3,
        Icon = ScrapMetal,
        MetalValue = 5,
    }
}
```

**Tool with Tags:**
```
module Base {
    imports {
        Base
    }

    item Hammer {
        DisplayCategory = Tool,
        DisplayName = Hammer,
        Type = Normal,
        Weight = 1.0,
        Icon = Hammer,
        Tags = Hammer,       <- For recipe matching
    }
}
```

## Recipe Definition Syntax

### Basic Structure

```
module ModuleName {
    imports {
        Base
    }

    recipe Recipe Name {
        InputItem,
        InputItem=quantity,
        keep ToolItem,

        Result:OutputItem,
        Time:100.0,
        Category:CategoryName,
    }
}
```

### Anatomy of a Recipe

```
recipe Saw Logs {                              <- Recipe name (spaces OK)
    Log,                                       <- Input: 1 log, consumed
    keep [Recipe.GetItemTypes.Saw],            <- Input: any saw, kept

    CanBeDoneFromFloor:true,                   <- Allow items on ground
    Result:Plank=3,                            <- Output: 3 planks
    Sound:Sawing,                              <- Crafting sound
    Time:230.0,                                <- Duration in ticks
    Category:Carpentry,                        <- UI category
    OnGiveXP:Recipe.OnGiveXP.SawLogs,          <- XP callback
    AnimNode:SawLog,                           <- Animation to play
    Prop1:Source=2,                            <- Item in hand
    Prop2:Log,                                 <- Second prop
}
```

### Input Syntax

**Basic input (consumed):**
```
Material,                    <- 1 item, destroyed after crafting
```

**Quantity input:**
```
Material=5,                  <- 5 items required, all consumed
```

**Reusable tool:**
```
keep Hammer,                 <- Tool is NOT consumed
```

**Alternative items (OR logic):**
```
Screwdriver/Knife,           <- Either one works
```

**Item type matching:**
```
keep [Recipe.GetItemTypes.Saw],    <- Any item with "Saw" tag
keep [Recipe.GetItemTypes.Hammer], <- Any item with "Hammer" tag
```

### Core Parameters

| Parameter | Purpose | Example |
|-----------|---------|--------|
| `Result` | Output item(s) | `Result:Plank=3,` |
| `Time` | Crafting duration | `Time:100.0,` |
| `Category` | UI menu placement | `Category:Carpentry,` |
| `Sound` | Audio during craft | `Sound:Hammering,` |

### Optional Parameters

| Parameter | Purpose | Example |
|-----------|---------|--------|
| `NearItem` | Require nearby object | `NearItem:Workbench,` |
| `SkillRequired` | Minimum skill level | `SkillRequired:Carpentry=3,` |
| `NeedToBeLearn` | Requires recipe book | `NeedToBeLearn:true,` |
| `CanBeDoneFromFloor` | Allow ground items | `CanBeDoneFromFloor:true,` |
| `AllowFrozenItem` | Accept frozen inputs | `AllowFrozenItem:true,` |
| `AllowRottenItem` | Accept rotten inputs | `AllowRottenItem:true,` |

### Callback Parameters

| Parameter | Purpose | When It Runs |
|-----------|---------|-------------|
| `OnGiveXP` | Award skill XP | After completion |
| `OnCreate` | Modify result item | When item created |
| `OnTest` | Check if available | When menu builds |
| `OnCanPerform` | Check if allowed | Before crafting |

**Using callbacks:**
```
recipe Advanced Craft {
    Material,
    keep Tool,

    Result:AdvancedItem,
    OnGiveXP:Recipe.OnGiveXP.SawLogs,       <- Existing vanilla function
    OnCreate:Recipe.OnCreate.SpikedBat,     <- Existing vanilla function
}
```

### Complete Recipe Examples

**Simple Conversion:**
```
module Base {
    imports {
        Base
    }

    recipe Open Box of 9mm Bullets {
        Bullets9mmBox,

        Result:Bullets9mm=30,
        Sound:BoxOfRoundsOpenOne,
        Time:15.0,
    }
}
```

**Tool-Based Crafting:**
```
module Base {
    imports {
        Base
    }

    recipe Craft Nails from Screws {
        Screws=5,
        keep [Recipe.GetItemTypes.Hammer],

        Result:Nails=5,
        Time:100.0,
        Category:Metalwork,
        Sound:Hammering,
    }
}
```

**Complex Multi-Input:**
```
module Base {
    imports {
        Base
    }

    recipe Build Spiked Bat {
        BaseballBat,
        Nails=5,
        keep [Recipe.GetItemTypes.Hammer],

        Result:SpikedBaseballBat,
        Time:150.0,
        Category:Weapons,
        Sound:Hammering,
        OnCreate:Recipe.OnCreate.SpikedBat,
    }
}
```

## Lua File Syntax

### Basic Structure

Lua files live in `media/lua/` and use standard Lua 5.1 syntax.

```lua
-- This is a comment

-- Variable declaration
local myVariable = "value"

-- Function declaration
function MyFunction(parameter1, parameter2)
    -- Function body
    return result
end

-- Table (like an object/dictionary)
local myTable = {
    key1 = "value1",
    key2 = "value2",
}
```

### PZ-Specific Patterns

**Namespace creation:**
```lua
MyMod = MyMod or {}
```

**Recipe callback:**
```lua
function Recipe.OnGiveXP.MyCustomXP(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Carpentry, 5)
end
```

**Event registration:**
```lua
Events.OnGameStart.Add(function()
    print("Game started!")
end)
```

**Class inheritance:**
```lua
ISMyPanel = ISPanel:derive("ISMyPanel")

function ISMyPanel:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    return o
end
```

### Calling Java from Lua

Lua interacts with the Java engine through exposed functions:

```lua
-- Get game objects
local player = getSpecificPlayer(0)      -- Player object
local inventory = player:getInventory()  -- Inventory object
local cell = getCell()                   -- World cell
local world = getWorld()                 -- World object

-- Common methods
player:getXp():AddXP(Perks.Carpentry, 5) -- Add XP
player:getPerkLevel(Perks.Carpentry)     -- Get skill level
inventory:AddItem("Base.Hammer")         -- Add item

-- UI text
local text = getText("UI_KeyName")       -- Localized string
```

### Example: Recipe Callback

**Script definition:**
```
recipe My Recipe {
    Material,
    Result:Output,
    OnGiveXP:MyMod.GiveXP,
    OnCreate:MyMod.CreateItem,
}
```

**Lua implementation:**
```lua
-- File: media/lua/server/mymod_recipes.lua

MyMod = MyMod or {}

function MyMod.GiveXP(recipe, ingredients, result, player)
    local skillLevel = player:getPerkLevel(Perks.Carpentry)
    if skillLevel < 5 then
        player:getXp():AddXP(Perks.Carpentry, 10)
    else
        player:getXp():AddXP(Perks.Carpentry, 3)
    end
end

function MyMod.CreateItem(items, result, player)
    -- Set item properties
    result:setCondition(100)
    result:setName("Custom Named Item")
end
```

## Module System

### What Are Modules?

Modules are namespaces that contain items and recipes. Every item belongs to a module.

**Format:** `ModuleName.ItemName`

**Examples:**
- `Base.Hammer` - Vanilla hammer
- `MyMod.CustomItem` - Your custom item

### Declaring a Module

```
module MyModName {
    imports {
        Base              <- Import vanilla items
    }

    item MyItem {
        // Properties
    }

    recipe MyRecipe {
        // Inputs and parameters
    }
}
```

### Using Items from Modules

**Explicit reference:**
```
recipe Example {
    Base.Hammer,           <- Vanilla item (explicit)
    MyMod.CustomMaterial,  <- Your item (explicit)
    
    Result:MyMod.Output,
}
```

**Implicit reference (after import):**
```
module MyMod {
    imports {
        Base
    }

    recipe Example {
        Hammer,            <- Base.Hammer (implicit, Base imported)
        
        Result:Output,     <- MyMod.Output (implicit, current module)
    }
}
```

### Common Module Names

| Mod | Module Name |
|-----|-------------|
| Vanilla PZ | `Base` |
| The Workshop | `TW` |
| Scrap Guns | `SGuns` |

## Formatting Rules

### Script Files

- **Block delimiters:** `{ }` for modules, items, recipes
- **Property separator:** `,` (comma) at end of each line
- **Comments:** `/* multi-line */` or `// single line`
- **Whitespace:** Flexible (tabs or spaces)
- **Case sensitivity:** Item/recipe names are case-sensitive

### Lua Files

- **Comments:** `-- single line` or `--[[ multi-line ]]`
- **Strings:** `"double"` or `'single'` quotes
- **Tables:** `{ key = value, key2 = value2 }`
- **Functions:** `function Name(args) ... end`
- **Case sensitivity:** All identifiers are case-sensitive

## Common Errors and Fixes

### Error: Using Wrong Separator

```
item Example {
    Weight: 1.0,        <- WRONG: colon in item
}

recipe Example {
    Result = Item,      <- WRONG: equals in recipe
}
```

**Fix:**
```
item Example {
    Weight = 1.0,       <- CORRECT: equals in item
}

recipe Example {
    Result:Item,        <- CORRECT: colon in recipe
}
```

### Error: Forgetting `keep` on Tools

```
recipe Example {
    Material,
    Hammer,             <- WRONG: Hammer will be consumed!
    
    Result:Output,
}
```

**Fix:**
```
recipe Example {
    Material,
    keep Hammer,        <- CORRECT: Hammer is reusable
    
    Result:Output,
}
```

### Error: Callback Name Mismatch

```
recipe Example {
    OnGiveXP:MyMod.GiveXp,   <- Case matters!
}
```

```lua
function MyMod.GiveXP(...)   -- Different case!
end
```

**Fix:** Ensure exact case match between script and Lua.

## Key Takeaways

1. **Items use `=`**, recipes use `:`
2. **Every item needs:** DisplayName, Type, Weight, Icon
3. **Use `keep`** for tools that shouldn't be consumed
4. **Callback names must match exactly** between script and Lua
5. **Modules are namespaces** - use `ModuleName.ItemName` format
6. **Case sensitivity matters** everywhere

## Quick Reference

```
// ITEM TEMPLATE
item ItemName {
    DisplayName = Name,
    Type = Normal,
    Weight = 1.0,
    Icon = IconName,
}

// RECIPE TEMPLATE
recipe Recipe Name {
    InputItem,
    keep ToolItem,

    Result:OutputItem,
    Time:100.0,
    Category:CategoryName,
}
```
 
