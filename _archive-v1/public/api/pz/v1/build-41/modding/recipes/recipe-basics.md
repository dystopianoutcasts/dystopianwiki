---
id: recipe-basics
slug: recipe-basics
title: Recipe Creation Basics - Project Zomboid
excerpt: Recipes in Project Zomboid define how players can craft items by combining inputs to produce outputs. This guide covers the fundamental structure and syntax for creating recipes. Recipes must be...
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: beginner
tags:
  - recipe
  - item
  - weapon
  - sound
  - crafting
  - creation
  - basics
last_updated: 2026-01-09
---
# Recipe Creation Basics - Project Zomboid

## Overview
Recipes in Project Zomboid define how players can craft items by combining inputs to produce outputs. This guide covers the fundamental structure and syntax for creating recipes.

## File Location
Recipes must be placed in `.txt` files within your mod's `media/scripts/` directory.

**Example Path:**
```
YourMod/
└── Contents/
    └── mods/
        └── YourModName/
            └── media/
                └── scripts/
                    └── recipes.txt
```

## Basic Recipe Structure

### Module Declaration
All recipes must be wrapped in a module block with imports:

```
module ModuleName {
    imports {
        Base
    }

    recipe Recipe Name {
        // Recipe definition here
    }
}
```

### Minimal Recipe Example
```
module OutcastAdvCrft {
    imports {
        Base
    }

    recipe Open Box of 9mm Bullets {
        Bullets9mmBox,

        Result:Bullets9mm=6,
        Sound:BoxOfRoundsOpenOne,
        Time:15.0,
    }
}
```

## Recipe Syntax Rules

### Critical Syntax Differences

**RECIPES use colons (`:`):**
```
recipe Example {
    Result:OutputItem,
    Time:100.0,
    Category:Weapons,
}
```

**ITEMS use equals (`=`):**
```
item Example {
    Weight = 1.0,
    Type = Normal,
}
```

**DO NOT MIX THESE UP!** This is the #1 cause of recipe errors.

## Recipe Components

### 1. Input Items
Input items are listed at the top of the recipe (before parameters):

```
recipe Example {
    InputItem1,              // Single item, consumed
    InputItem2=5,            // 5 units required, consumed
    keep ToolItem,           // Reusable tool (not consumed)

    Result:OutputItem,
    Time:100.0,
}
```

**Key Rules:**
- Items WITHOUT `keep` are consumed
- Items WITH `keep` are reusable (tools)
- Use `=number` to specify quantity needed
- Order matters - inputs first, then parameters

### 2. Output (Result)
```
Result:OutputItem,           // Single output
Result:OutputItem=10,        // Output 10 items
```

### 3. Essential Parameters

**Time** (Required) - Crafting time in game ticks:
```
Time:100.0,                  // 100 game ticks
```

**Category** (Recommended) - Where recipe appears in UI:
```
Category:Weapons,
Category:Cooking,
Category:Carpentry,
```

**Sound** (Recommended) - Audio during crafting:
```
Sound:Hammering,
Sound:Sawing,
Sound:Cooking,
```

## Common Recipe Patterns

### Simple Conversion
```
recipe Disassemble Ammo Box {
    Bullets9mmBox,

    Result:Bullets9mm=30,
    Time:15.0,
}
```

### Tool-Based Crafting
```
recipe Saw Logs {
    Log,
    keep [Recipe.GetItemTypes.Saw],

    Result:Plank=3,
    Sound:Sawing,
    Time:230.0,
    Category:Carpentry,
}
```

### Multiple Inputs
```
recipe Craft Item {
    Component1,
    Component2=2,
    Material=5,
    keep Hammer,

    Result:FinalProduct,
    Time:200.0,
    Category:Weapons,
    Sound:Hammering,
}
```

## Alternative Items (OR Logic)
Use `/` to allow multiple valid items:

```
recipe Example {
    Screwdriver/Knife,       // Either Screwdriver OR Knife

    Result:OutputItem,
    Time:50.0,
}
```

## Item Type Matching
Use brackets to match item types (any item with that tag):

```
recipe Example {
    keep [Recipe.GetItemTypes.Hammer],   // Any hammer
    keep [Recipe.GetItemTypes.Saw],      // Any saw

    Result:OutputItem,
}
```

## Source Files
- **Vanilla Recipes:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\recipes.txt`
- **Research Date:** 2025-11-06

## Complete Example Recipe
```
module OutcastAdvCrft {
    imports {
        Base
    }

    recipe Craft Nails from Screws {
        Screws=1,
        keep Hammer,

        Result:Nails,
        Time:100.0,
        Category:Metalwork,
        Sound:Hammering,
    }
}
```
 
