---
id: recipes-crafting-tables
slug: crafting-tables
title: "Recipes with Crafting Tables - Enhanced Crafting Core"
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: intermediate
tags:
  - recipe
  - item
  - repair
  - weapon
  - sound
  - crafting
  - with
  - tables
excerpt: "The Enhanced Crafting Core mod (More Builds) adds craftable workstations that can be used as proximity requirements for recipes. This guide explains how to require players to be near specific craft..."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "The NearItem Parameter"
    link: "#the-nearitem-parameter"
  - text: "Syntax"
    link: "#syntax"
  - text: "Important Notes"
    link: "#important-notes"
  - text: "Enhanced Crafting Core Tables"
    link: "#enhanced-crafting-core-tables"
  - text: "Available Tables"
    link: "#available-tables"
  - text: "Syntax Format"
    link: "#syntax-format"
  - text: "Complete Example: Armory Table Recipe"
    link: "#complete-example-armory-table-recipe"
  - text: "Bullet Crafting Recipe"
    link: "#bullet-crafting-recipe"
  - text: "Laboratory Table Example"
    link: "#laboratory-table-example"
  - text: "Forge Table Example"
    link: "#forge-table-example"
  - text: "How Tables Work In-Game"
    link: "#how-tables-work-in-game"
  - text: "Table Placement"
    link: "#table-placement"
  - text: "Proximity Detection"
    link: "#proximity-detection"
  - text: "No Module Import Required"
    link: "#no-module-import-required"
  - text: "Combining with Other Requirements"
    link: "#combining-with-other-requirements"
  - text: "With Skill Requirements"
    link: "#with-skill-requirements"
  - text: "With Multiple Tools"
    link: "#with-multiple-tools"
  - text: "Multiple NearItem Options"
    link: "#multiple-nearitem-options"
  - text: "Common Errors"
    link: "#common-errors"
  - text: "Wrong Syntax"
    link: "#wrong-syntax"
  - text: "Correct Syntax"
    link: "#correct-syntax"
  - text: "Table Not Built"
    link: "#table-not-built"
  - text: "Building the Tables"
    link: "#building-the-tables"
  - text: "Enhanced Crafting Core Requirement"
    link: "#enhanced-crafting-core-requirement"
  - text: "Table Crafting"
    link: "#table-crafting"
  - text: "Mod Dependency"
    link: "#mod-dependency"
  - text: "Your mod.info File"
    link: "#your-modinfo-file"
  - text: "Source Files"
    link: "#source-files"
next_steps:
  - title: "Recipe Creation Basics"
    path: /build-41/modding/recipes/recipe-basics
last_updated: 2026-01-09
---

# Recipes with Crafting Tables - Enhanced Crafting Core

## Overview
The Enhanced Crafting Core mod (More Builds) adds craftable workstations that can be used as proximity requirements for recipes. This guide explains how to require players to be near specific crafting tables.

## The NearItem Parameter

### Syntax
```
recipe Example {
    InputItem,
    keep Tool,

    Result:OutputItem,
    Time:100.0,
    NearItem:Table Name,     // Player must be close to this table
}
```

### Important Notes
- `NearItem` is a **proximity requirement**, not an item consumption
- Players must be physically near the specified object to craft
- The table is **NOT consumed** or modified
- No `keep` keyword needed (it's not an input item)

## Enhanced Crafting Core Tables

### Available Tables
From the Enhanced Crafting Core (More Builds) mod:

| Table Name         | Use Case |
|------------        |----------|
| `Armory Table`     | Weapons, ammunition, military equipment |
| `Laboratory Table` | Chemistry, medicine, scientific recipes |
| `Forge Table`      | Metalworking, smelting, blacksmithing |
| `Mechanic Table`   | Vehicle parts, mechanical work |
| `Tailoring Table`  | Clothing, fabric work, repairs |

**Source:** `C:\Users\ediaz\Desktop\DystopeanOutcasts\Crafting-Enhanced-Core\README.md`

### Syntax Format
Use the exact string name in quotes or without quotes:

```
NearItem:Armory Table,       // Correct
NearItem:"Armory Table",     // Also works
NearItem:Forge Table,        // Correct
```

## Complete Example: Armory Table Recipe

### Bullet Crafting Recipe
```
module OutcastAdvCrft {
    imports {
        Base
    }

    recipe Make 9mm Bullets {
        keep 9mmBulletsMold,
        keep Hammer,
        ScrapMetal,
        GunPowder=10,

        Result:Bullets9mm=10,
        Time:300.0,
        Category:Weapons,
        Sound:Hammering,
        NearItem:Armory Table,       // Must be near Armory Table
        AnimNode:BuildHigh,
        Prop1:Hammer,
    }
}
```

### Laboratory Table Example
```
module Example_Recipes {
    imports {
        Base
    }

    recipe Convert Nails to Screws {
        Nails=1,
        keep Hammer,

        Result:Screws,
        Time:100.0,
        Category:Chemistry,
        Sound:Anvil,
        NearItem:Laboratory Table,   // Chemistry workstation
        AnimNode:BuildHigh,
        Prop1:Hammer,
        Prop2:Source=1,
    }
}
```

### Forge Table Example
```
recipe Smelt Iron Ingot {
    IronOre=5,
    keep Tongs,

    Result:IronIngot,
    Time:400.0,
    Category:Metalwork,
    Sound:Forge,
    NearItem:Forge Table,            // Metalworking station
}
```

## How Tables Work In-Game

### Table Placement
1. Tables must be **crafted** by the player first
2. Tables are **placed in the world** like furniture
3. Tables remain in place and are reusable
4. Multiple recipes can use the same table

### Proximity Detection
- Player must be within a few tiles of the table
- The game automatically detects if the requirement is met
- If not near the table, the recipe won't appear in the crafting menu

### No Module Import Required
Unlike mod items, you **DO NOT** need to import a module for tables:

```
module OutcastAdvCrft {
    imports {
        Base           // No Enhanced Crafting import needed!
    }

    recipe Example {
        InputItem,
        Result:OutputItem,
        NearItem:Armory Table,   // Works without import
    }
}
```

The tables are **world objects**, not **items**, so they're referenced by string name.

## Combining with Other Requirements

### With Skill Requirements
```
recipe Advanced Bullet Crafting {
    keep 9mmBulletsMold,
    GunPowder=20,

    Result:Bullets9mm=20,
    Time:250.0,
    NearItem:Armory Table,
    SkillRequired:MetalWelding=5,    // Need skill AND table
}
```

### With Multiple Tools
```
recipe Complex Weapon Mod {
    WeaponPart1,
    WeaponPart2,
    keep [Recipe.GetItemTypes.Screwdriver],
    keep [Recipe.GetItemTypes.Hammer],

    Result:ModifiedWeapon,
    Time:500.0,
    NearItem:Armory Table,
    Category:Weapons,
    SkillRequired:Aiming=3,
}
```

## Multiple NearItem Options
You can specify alternative tables using `/` (OR logic):

```
recipe Example {
    InputItem,

    Result:OutputItem,
    NearItem:Armory Table/Forge Table,   // Either table works
}
```

## Common Errors

### Wrong Syntax
```
NearItem:Base.ArmoryTable,        // WRONG - Not an item ID
NearItem:MoreBuilds.ArmoryTable,  // WRONG - Not a module item
```

### Correct Syntax
```
NearItem:Armory Table,            // CORRECT - String name
```

### Table Not Built
If the player hasn't crafted and placed the table yet:
- Recipe won't appear in crafting menu
- Player needs to build the table first
- Tables require their own crafting materials

## Building the Tables

### Enhanced Crafting Core Requirement
Players must have the Enhanced Crafting Core mod installed to:
1. Craft the tables
2. Place them in the world
3. Use them for recipes

### Table Crafting
Tables are craftable items in the "Build" menu (part of the More Builds mod functionality). Players need materials like:
- Wood planks
- Nails/screws
- Metal sheets (for some tables)
- Tools (hammer, saw, etc.)

## Mod Dependency

### Your mod.info File
If your mod requires tables, add Enhanced Crafting Core as a dependency:

```
name=Your Mod Name
id=YourModID
description=Your mod description
require=MoreBuilds
```

**Mod ID:** `MoreBuilds` (Steam Workshop ID: 515555911)

## Source Files
- **Enhanced Crafting README:** `C:\Users\ediaz\Desktop\DystopeanOutcasts\Crafting-Enhanced-Core\README.md`
- **Mod Steam Workshop:** Workshop ID 515555911
- **Research Date:** 2025-11-06
