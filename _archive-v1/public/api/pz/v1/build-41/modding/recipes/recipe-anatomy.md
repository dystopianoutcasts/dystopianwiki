---
id: recipe-anatomy
slug: recipe-anatomy
title: Anatomy of a Recipe
excerpt: Recipes define how players craft items. Understanding recipe structure is essential for creating your own. This guide breaks down a vanilla recipe line by line. Let's start with the most basic recipe...
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: beginner
tags:
  - beginner
  - recipe
  - anatomy
  - syntax
  - learning-path
  - fundamentals
last_updated: 2026-01-09
---
# Anatomy of a Recipe

## Overview

Recipes define how players craft items. Understanding recipe structure is essential for creating your own. This guide breaks down a vanilla recipe line by line.

## The Simplest Recipe

Let's start with the most basic recipe possible:

```
module Base {
    recipe Open Canned Beans {
        CannedBeans,
        TinOpener,

        Result:CannedBeansOpen,
        Time:30,
    }
}
```

This recipe:
- Combines `CannedBeans` + `TinOpener`
- Produces `CannedBeansOpen`
- Takes 30 time units

## Breaking It Down

### Line 1: Module Declaration

```
module Base {
```

The `module` tells PZ which namespace to use. `Base` is the vanilla namespace. Your recipe can:
- Use `Base` to reference vanilla items
- Use a custom module for mod-specific items

### Line 2: Recipe Name

```
    recipe Open Canned Beans {
```

- `recipe` - Keyword that starts a recipe definition
- `Open Canned Beans` - Display name shown to players
- `{` - Opens the recipe block

### Lines 3-4: Ingredients

```
        CannedBeans,
        TinOpener,
```

Each ingredient is listed on its own line:
- Item IDs, not display names
- Comma after each item (including the last)
- By default, items are **consumed** (destroyed)

### Line 5: Empty Line

The blank line separates ingredients from results. It's optional but improves readability.

### Line 6: Result

```
        Result:CannedBeansOpen,
```

- `Result:` - Keyword followed by colon
- `CannedBeansOpen` - Item ID to create
- Multiple results: `Result:Plank=3,` (creates 3 planks)

### Line 7: Time

```
        Time:30,
```

- `Time:` - How long the crafting takes
- `30` - Time units (roughly relates to in-game time)
- Higher = longer crafting animation

### Lines 8-9: Closing

```
    }
}
```

Close the recipe block and module block.

## Recipe Syntax Rules

### Key Rule: Colons for Properties

Recipes use `:` (colon), not `=` (equals):

```
✓ Result:Plank,
✗ Result=Plank,

✓ Time:50,
✗ Time=50,
```

### Key Rule: Commas After Everything

```
✓ Plank,
✓ Nails=5,
✓ Result:Crate,
✗ Result:Crate
```

(Missing comma causes errors)

## A More Complex Example

Here's a vanilla recipe with more features:

```
module Base {
    recipe Saw Logs {
        Log,
        keep [Recipe.GetItemTypes.Saw],

        Result:Plank=3,
        Time:230.0,
        Category:Carpentry,
        OnGiveXP:Recipe.OnGiveXP.SawLogs,
        Sound:Sawing,
        AnimNode:SawLog,
    }
}
```

### New Elements Explained

| Element | Purpose |
|---------|--------|
| `keep` | Tool not consumed |
| `[Recipe.GetItemTypes.Saw]` | Accepts any saw type |
| `Result:Plank=3` | Creates 3 planks |
| `Category:Carpentry` | Recipe menu category |
| `OnGiveXP:...` | Awards XP on completion |
| `Sound:Sawing` | Plays sound effect |
| `AnimNode:SawLog` | Character animation |

## Common Recipe Properties

### Essential Properties

| Property | Example | Purpose |
|----------|---------|--------|
| `Result:` | `Result:Plank,` | What gets created |
| `Time:` | `Time:50.0,` | Crafting duration |

### Tool Handling

| Property | Example | Purpose |
|----------|---------|--------|
| `keep` | `keep Hammer,` | Don't consume this item |
| `destroy` | `destroy Hammer,` | Explicitly consume |

### Requirements

| Property | Example | Purpose |
|----------|---------|--------|
| `SkillRequired:` | `SkillRequired:Carpentry=2,` | Minimum skill level |
| `NeedToBeLearn:` | `NeedToBeLearn:true,` | Must read recipe magazine |

### Feedback

| Property | Example | Purpose |
|----------|---------|--------|
| `Sound:` | `Sound:Sawing,` | Sound effect |
| `AnimNode:` | `AnimNode:SawLog,` | Character animation |
| `Category:` | `Category:Cooking,` | UI category |

### XP & Leveling

| Property | Example | Purpose |
|----------|---------|--------|
| `OnGiveXP:` | `OnGiveXP:Recipe.OnGiveXP.SawLogs,` | Lua function for XP |

## Reading Vanilla Recipes

Vanilla recipes are in:
```
Steam\steamapps\common\ProjectZomboid\media\scripts\recipes.txt
```

Open this file to see hundreds of examples. Key files:
- `recipes.txt` - Main crafting recipes
- `recipes_food.txt` - Cooking recipes
- `recipes_furniture.txt` - Building recipes

## Recipe Categories

Common categories for the `Category:` property:

| Category | For |
|----------|-----|
| `Cooking` | Food preparation |
| `Carpentry` | Wood crafting |
| `Metalworking` | Metal crafting |
| `Tailoring` | Clothing repair/creation |
| `Mechanics` | Vehicle parts |
| `Electrical` | Electronic items |
| `Survivalist` | General survival crafting |

## Key Takeaways

1. **Module wraps everything** - Usually `Base`
2. **Ingredients before properties** - Listed first, then results
3. **Use colons, not equals** - `Result:Item,` not `Result=Item`
4. **Commas everywhere** - After every line inside the recipe
5. **`keep` preserves tools** - Otherwise items are consumed 