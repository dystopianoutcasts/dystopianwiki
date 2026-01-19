---
id: recipe-ingredients
slug: recipe-ingredients
title: Recipe Ingredients Deep Dive
excerpt: Basic recipes use simple ingredients. Real mods need more: alternative items, tool types, quantities, and special behaviors. This guide covers all ingredient patterns. TreeBranch, Requires exactly...
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - recipe
  - ingredients
  - tools
  - learning-path
  - advanced
last_updated: 2026-01-09
---
# Recipe Ingredients Deep Dive

## Overview

Basic recipes use simple ingredients. Real mods need more: alternative items, tool types, quantities, and special behaviors. This guide covers all ingredient patterns.

## Basic Ingredient Patterns

### Single Item

```
TreeBranch,
```

Requires exactly one tree branch. Consumed on use.

### Multiple of Same Item

```
Plank=4,
```

Requires 4 planks. All consumed.

### Kept Item (Tool)

```
keep Hammer,
```

Requires hammer but doesn't consume it.

## Alternative Items (OR)

### Two Alternatives

```
KitchenKnife/HuntingKnife,
```

Accepts either kitchen knife OR hunting knife.

### Multiple Alternatives

```
Axe/WoodAxe/HandAxe/StoneAxe,
```

Accepts any of the four axe types.

### Alternative with Quantity

```
Plank/Pallet=2,
```

Accepts 2 planks OR 2 pallets.

## Item Type Functions

### Built-in Type Functions

PZ provides functions that return groups of items:

```
[Recipe.GetItemTypes.Saw],
```

This matches ANY saw-type item.

### Common Type Functions

| Function | Matches |
|----------|--------|
| `[Recipe.GetItemTypes.Saw]` | All saws |
| `[Recipe.GetItemTypes.Hammer]` | All hammers |
| `[Recipe.GetItemTypes.Screwdriver]` | All screwdrivers |
| `[Recipe.GetItemTypes.Wrench]` | All wrenches |
| `[Recipe.GetItemTypes.Welding]` | Welding equipment |

### Using Type Functions as Tools

```
keep [Recipe.GetItemTypes.Saw],
```

Any saw works as a kept tool.

## Quantity Patterns

### Fixed Quantity

```
Nails=5,
```

Exactly 5 nails required.

### Result Quantity

```
Result:Plank=3,
```

Produces 3 planks.

### Multiple Results

You can only have one Result line, but with quantity:

```
Result:Plank=4,
```

## Tool Behavior

### keep vs destroy

```
keep Hammer,      <- Not consumed
destroy Hammer,   <- Consumed (same as no keyword)
Hammer,           <- Consumed (default)
```

### Tool Degradation

Tools with `keep` still lose durability based on item's `ConditionLowerChanceOneIn` property. They break eventually.

### Multiple Tools

```
keep Hammer,
keep Saw,
```

Both required, neither consumed.

## Special Ingredients

### Water

Water can come from bottles, sinks, or rain collectors:

```
Water=5,
```

Any water source with 5+ units works.

### Drainables

Items like glue, thread, duct tape drain rather than consume:

```
DuctTape=2,
```

Uses 2 units from the duct tape roll.

### Empty Containers

Some recipes need empty containers:

```
EmptyPetrolCan,
```

Requires an empty (not full) petrol can.

## Advanced Patterns

### Combining Patterns

```
module Base {
    recipe Complex Craft {
        Plank=2,                           <- Quantity
        Nails=4,                           <- Quantity
        keep [Recipe.GetItemTypes.Hammer], <- Type function as tool
        RippedSheets/DenimStrips,          <- Alternatives
        Water=1,                           <- Drainable

        Result:ComplexItem,
        Time:200.0,
    }
}
```

### Conditional Ingredients

Some vanilla recipes use Lua callbacks for complex conditions. For beginners, stick to the patterns above.

## Real Vanilla Examples

### Simple Tool Recipe

```
recipe Make Metal Sheet {
    ScrapMetal=5,
    keep BlowTorch,
    keep WeldingMask,

    Result:SheetMetal,
    Time:120.0,
    Category:Metalworking,
}
```

### Alternative Items Recipe

```
recipe Rip Clothing {
    Shirt/Blouse/TShirt,

    Result:RippedSheets=2,
    Time:60.0,
    Category:Survivalist,
}
```

### Complex Vanilla Recipe

```
recipe Craft Spear {
    TreeBranch/Plank,
    KitchenKnife/HuntingKnife/Screwdriver,
    keep [Recipe.GetItemTypes.Saw],

    Result:SpearCrafted,
    Time:80.0,
    SkillRequired:Maintenance=2,
    Category:Survivalist,
}
```

## Common Mistakes

### Wrong: Quantity on Keep

```
❌ keep Hammer=2,     <- Can't require multiple kept tools
✓ keep Hammer,       <- Just one
```

### Wrong: Mixing Keep and Alternatives

```
❌ keep Knife/Axe,    <- Won't parse correctly
✓ keep Knife,        <- Separate lines
✓ keep Axe,
```

For alternatives as tools, use type functions:
```
✓ keep [Recipe.GetItemTypes.Saw],
```

### Wrong: Result with Alternatives

```
❌ Result:Plank/ShortPlank,  <- Can't do this
✓ Result:Plank,             <- One result type
```

## Designing Good Recipes

### Balance Considerations

| Factor | Guideline |
|--------|----------|
| **Rarity** | Rare inputs = valuable output |
| **Tool requirement** | Adds realism without grinding |
| **Time** | More valuable items = longer craft |
| **Skill** | Advanced items need skill gates |

### Example Balanced Progression

**Beginner recipe (no tools):**
```
recipe Bundle Rags {
    RippedSheets=3,

    Result:RagBundle,
    Time:30.0,
}
```

**Intermediate recipe (common tool):**
```
recipe Craft Splint {
    TreeBranch,
    RippedSheets=2,
    keep KitchenKnife,

    Result:Splint,
    Time:60.0,
}
```

**Advanced recipe (skill + rare tool):**
```
recipe Forge Blade {
    ScrapMetal=3,
    keep BlowTorch,
    keep WeldingMask,
    keep Hammer,

    Result:ForgedBlade,
    Time:300.0,
    SkillRequired:Metalworking=4,
    Category:Metalworking,
}
```

## Key Takeaways

1. **`/` means OR** - `Knife/Axe` accepts either
2. **`=N` sets quantity** - `Nails=5` requires 5
3. **`keep` preserves tools** - They still degrade
4. **Type functions are powerful** - `[Recipe.GetItemTypes.Saw]`
5. **Water and drainables** - Work differently from normal items
6. **Balance matters** - Match complexity to reward 