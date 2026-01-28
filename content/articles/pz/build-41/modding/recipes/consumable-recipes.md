---
id: recipes-consumable-recipes
slug: consumable-recipes
title: "Consumable vs Reusable Items in Recipes"
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
  - consumable
  - items
excerpt: "In Project Zomboid recipes, input items can either be consumed (destroyed) or kept (reusable). Understanding this distinction is critical for creating balanced and functional recipes.     By d..."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "The Basic Rule"
    link: "#the-basic-rule"
  - text: "Default Behavior: Items Are Consumed"
    link: "#default-behavior-items-are-consumed"
  - text: "Reusable Items: Use `keep`"
    link: "#reusable-items-use-keep"
  - text: "Keyword Reference"
    link: "#keyword-reference"
  - text: "`keep`"
    link: "#keep"
  - text: "`destroy` (Optional)"
    link: "#destroy-optional"
  - text: "Common Usage Patterns"
    link: "#common-usage-patterns"
  - text: "Tools (Always `keep`)"
    link: "#tools-always-keep"
  - text: "Materials (Never `keep`)"
    link: "#materials-never-keep"
  - text: "Mixed Example"
    link: "#mixed-example"
  - text: "Item Type Matching with `keep`"
    link: "#item-type-matching-with-keep"
  - text: "Real-World Examples"
    link: "#real-world-examples"
  - text: "Vanilla Example: Opening Ammo Box"
    link: "#vanilla-example-opening-ammo-box"
  - text: "Vanilla Example: Packing Ammo Box"
    link: "#vanilla-example-packing-ammo-box"
  - text: "Mod Example: Dystopian Currency"
    link: "#mod-example-dystopian-currency"
  - text: "Scrap Guns Example: Weapon Assembly"
    link: "#scrap-guns-example-weapon-assembly"
  - text: "Drainable Items"
    link: "#drainable-items"
  - text: "Special Case: Partial Consumption"
    link: "#special-case-partial-consumption"
  - text: "Balance Considerations"
    link: "#balance-considerations"
  - text: "Tools Should Be Reusable"
    link: "#tools-should-be-reusable"
  - text: "Materials Should Be Consumed"
    link: "#materials-should-be-consumed"
  - text: "Exceptions"
    link: "#exceptions"
  - text: "Common Errors"
    link: "#common-errors"
  - text: "Error: Consuming Tools"
    link: "#error-consuming-tools"
  - text: "Error: Keeping Materials"
    link: "#error-keeping-materials"
  - text: "Testing Checklist"
    link: "#testing-checklist"
  - text: "Source Files"
    link: "#source-files"
next_steps:
  - title: "Recipe Creation Basics"
    path: /build-41/modding/recipes/recipe-basics
last_updated: 2026-01-09
---

# Consumable vs Reusable Items in Recipes

## Overview
In Project Zomboid recipes, input items can either be consumed (destroyed) or kept (reusable). Understanding this distinction is critical for creating balanced and functional recipes.

## The Basic Rule

### Default Behavior: Items Are Consumed
**By default, ALL input items in a recipe are CONSUMED unless prefixed with `keep`.**

```
recipe Example {
    Item1,           // CONSUMED (destroyed after crafting)
    Item2,           // CONSUMED
    Item3=5,         // CONSUMED (all 5 units destroyed)

    Result:OutputItem,
}
```

### Reusable Items: Use `keep`
To make an item reusable (typically tools), prefix it with `keep`:

```
recipe Example {
    Material,        // CONSUMED
    keep Tool,       // KEPT (not consumed, reusable)

    Result:OutputItem,
}
```

## Keyword Reference

### `keep`
Items marked with `keep` are **NOT consumed**:
- Remain in player's inventory after crafting
- Used for tools, equipment, reusable items
- Can be used repeatedly for multiple crafts

```
recipe Saw Logs {
    Log,                             // Consumed
    keep [Recipe.GetItemTypes.Saw],  // NOT consumed (tool)

    Result:Plank=3,
    Time:230.0,
}
```

### `destroy` (Optional)
Explicitly marks items as consumed (optional, for clarity):

```
recipe Example {
    destroy Material1,   // Explicitly consumed
    destroy Material2,   // Explicitly consumed
    keep Tool,           // Reusable

    Result:OutputItem,
}
```

**Note:** `destroy` is optional since items are consumed by default. It's mainly for code readability.

## Common Usage Patterns

### Tools (Always `keep`)
```
recipe Craft Item {
    Material=5,
    keep Hammer,
    keep Saw,
    keep Screwdriver,

    Result:CraftedItem,
}
```

### Materials (Never `keep`)
```
recipe Make Bullets {
    ScrapMetal,          // Consumed
    GunPowder=10,        // Consumed
    keep BulletMold,     // Reusable

    Result:Bullets9mm=10,
}
```

### Mixed Example
```
recipe Build Spiked Bat {
    BaseballBat,                         // Consumed (base weapon)
    Nails=5,                             // Consumed (materials)
    keep [Recipe.GetItemTypes.Hammer],   // Reusable (tool)

    Result:BaseballBatNails,
    Time:150.0,
}
```

## Item Type Matching with `keep`

When using item type matching, `keep` still applies:

```
recipe Example {
    Material,
    keep [Recipe.GetItemTypes.Hammer],     // Any hammer, not consumed
    keep [Recipe.GetItemTypes.Saw],        // Any saw, not consumed

    Result:OutputItem,
}
```

## Real-World Examples

### Vanilla Example: Opening Ammo Box
```
recipe Open Box of 9mm Bullets {
    Bullets9mmBox,       // Consumed (box is destroyed)

    Result:Bullets9mm=6,
    Sound:BoxOfRoundsOpenOne,
    Time:15.0,
}
```
**Effect:** Box disappears, 6 bullets appear in inventory.

### Vanilla Example: Packing Ammo Box
```
recipe Place 9mm Bullets in Box {
    Bullets9mm=30,       // Consumed (30 bullets used)

    Result:Bullets9mmBox,
    Sound:BoxOfRoundsOpenOne,
    Time:15.0,
}
```
**Effect:** 30 loose bullets disappear, 1 box appears.

### Mod Example: Dystopian Currency
```
recipe Pack 10 Copper Dystopians {
    destroy copperDystopian=10,  // Explicitly consumed

    Result:silverDystopian,
    Time:25,
    Sound:Hammering,
}
```
**Effect:** 10 copper coins destroyed, 1 silver coin created.

### Scrap Guns Example: Weapon Assembly
```
recipe Assemble Double Barrel Shotgun {
    AirTank,                     // Consumed
    SheetMetal,                  // Consumed
    MetalPipe,                   // Consumed
    LeadPipe,                    // Consumed
    Plank,                       // Consumed
    LeatherStrips=5,             // Consumed
    BlowTorch=1,                 // Consumed (uses 1 unit)
    Wire=2,                      // Consumed
    keep [Recipe.GetItemTypes.Pliers],      // Reusable
    keep [Recipe.GetItemTypes.WeldingMask], // Reusable
    keep [Recipe.GetItemTypes.Hammer],      // Reusable
    keep [Recipe.GetItemTypes.Saw],         // Reusable

    Result:HDBS,
    Time:1900,
}
```
**Effect:** All materials consumed, all tools remain.

## Drainable Items

### Special Case: Partial Consumption
Some items are `Type = Drainable` (like gas cans, paint, etc.). When used in recipes:

```
recipe Example {
    GasolineCan=5,       // Consumes 5 units (not 5 cans)
    keep Tool,

    Result:OutputItem,
}
```

**GunPowder Example:**
```
item GunPowder {
    Type = Drainable,
    UseDelta = 0.1,      // 10% per use
}

recipe Make Bullets {
    GunPowder=10,        // Uses 10 units from drainable container
    keep BulletMold,

    Result:Bullets9mm=10,
}
```

## Balance Considerations

### Tools Should Be Reusable
```
keep Hammer,         // Correct - tools are expensive/rare
keep Saw,            // Correct
keep Screwdriver,    // Correct
```

### Materials Should Be Consumed
```
Wood,                // Correct - consumed in crafting
Metal,               // Correct
Screws=5,            // Correct
```

### Exceptions
Some "materials" might be reusable for gameplay reasons:

```
recipe Cast Bullets {
    ScrapMetal,          // Consumed (becomes bullets)
    GunPowder=10,        // Consumed
    keep BulletMold,     // Reusable (expensive, core mechanic)
    keep Hammer,         // Reusable (tool)

    Result:Bullets9mm=10,
}
```

## Common Errors

### Error: Consuming Tools
```
recipe Example {
    Material,
    Hammer,              // ERROR - Hammer is consumed!

    Result:OutputItem,
}
```
**Problem:** Player loses hammer after one use. Very frustrating!

**Fix:**
```
recipe Example {
    Material,
    keep Hammer,         // CORRECT - Hammer is reusable

    Result:OutputItem,
}
```

### Error: Keeping Materials
```
recipe Example {
    keep Wood,           // ERROR - Wood not consumed!
    keep Nails,          // ERROR - Nails not consumed!

    Result:Chair,
}
```
**Problem:** Player can craft infinite chairs from 1 wood + 1 nail!

**Fix:**
```
recipe Example {
    Wood=5,              // CORRECT - Wood consumed
    Nails=10,            // CORRECT - Nails consumed
    keep Hammer,         // CORRECT - Tool reusable

    Result:Chair,
}
```

## Testing Checklist

When creating recipes, verify:
- [ ] All tools have `keep` prefix
- [ ] All materials are consumed (no `keep`)
- [ ] Drainable items use appropriate quantities
- [ ] Recipe doesn't create duplication exploits
- [ ] Players lose expected items after crafting
- [ ] Players keep expected tools after crafting

## Source Files
- **Vanilla Recipes:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\recipes.txt`
- **Scrap Guns Recipes:** `R:\Games\Steam\steamapps\workshop\content\108600\2125659488\mods\Scrap Guns (New Version)\media\scripts\module_SGuns_recipes.txt`
- **Research Date:** 2025-11-06
