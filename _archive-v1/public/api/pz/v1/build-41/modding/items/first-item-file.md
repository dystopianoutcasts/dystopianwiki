---
id: first-item-file
slug: first-item-file
title: Your First Custom Item
excerpt: Time to create a custom item from scratch. We'll make a food item - a homemade energy bar - that you can find, eat, and eventually craft with a recipe. An **Energy Bar** with: In your mod folder,...
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - beginner
  - item
  - tutorial
  - hands-on
  - learning-path
  - food
last_updated: 2026-01-09
---
# Your First Custom Item

## Overview

Time to create a custom item from scratch. We'll make a food item - a homemade energy bar - that you can find, eat, and eventually craft with a recipe.

## What We're Making

An **Energy Bar** with:
- Restores hunger and gives calories
- Takes time to spoil
- Uses a vanilla icon (for now)
- Can be found in the world

## Prerequisites

- A mod folder set up ([Mod Folder Structure](/build-41/modding/setup/mod-folder-structure))
- A `mod.info` file ([The mod.info File](/build-41/modding/setup/mod-info-file))
- Debug mode enabled for testing ([Debug Mode](/build-41/modding/setup/debug-mode))

## Step 1: Create the Items File

In your mod folder, create:

```
MyFirstMod/
├── mod.info
└── media/
    └── scripts/
        └── my_items.txt    <- Create this
```

Create `my_items.txt` inside `media/scripts/`.

## Step 2: Write the Item Definition

Paste this into `my_items.txt`:

```
module Base {
    item EnergyBar {
        Type = Food,
        DisplayName = Energy Bar,
        Icon = Chocolate,
        Weight = 0.1,
        HungerChange = -15,
        ThirstChange = -5,
        Calories = 250,
        Carbohydrates = 35,
        Proteins = 5,
        Lipids = 10,
        DaysFresh = 60,
        DaysTotallyRotten = 90,
        DisplayCategory = Food,
    }
}
```

Save the file.

## Step 3: Understanding Each Property

```
module Base {
```
Adds our item to the Base namespace. Full ID: `Base.EnergyBar`

```
    item EnergyBar {
```
Item ID. Used in recipes, spawning, and references.

```
        Type = Food,
```
Makes this edible with hunger/nutrition properties.

```
        DisplayName = Energy Bar,
```
What players see in inventory.

```
        Icon = Chocolate,
```
Borrows vanilla's chocolate bar icon. We'll make our own later.

```
        Weight = 0.1,
```
Very light - 0.1 weight units.

```
        HungerChange = -15,
```
Negative values REDUCE hunger. -15 is a decent snack.

```
        ThirstChange = -5,
```
Negative values REDUCE thirst. Slightly hydrating.

```
        Calories = 250,
```
Energy content. Compare: Apple = 52, Steak = 271.

```
        Carbohydrates = 35,
        Proteins = 5,
        Lipids = 10,
```
Nutritional breakdown (for the nutrition system).

```
        DaysFresh = 60,
        DaysTotallyRotten = 90,
```
Spoilage timing. 60 days fresh, rotten by day 90.

```
        DisplayCategory = Food,
```
UI category in inventory screens.

## Step 4: Test the Item

### Enable and Load

1. Launch PZ
2. Enable your mod in the Mods menu
3. Start/continue a game

### Spawn the Item

Open console (`~`) and type:

```lua
getPlayer():getInventory():AddItem("Base.EnergyBar")
```

You should see your Energy Bar in inventory!

### Test Eating

1. Right-click the Energy Bar
2. Select "Eat"
3. Watch hunger decrease

## Step 5: Add More Properties

Let's enhance our item. Update `my_items.txt`:

```
module Base {
    item EnergyBar {
        Type = Food,
        DisplayName = Energy Bar,
        Icon = Chocolate,
        Weight = 0.1,
        
        /* Nutrition */
        HungerChange = -15,
        ThirstChange = -5,
        Calories = 250,
        Carbohydrates = 35,
        Proteins = 5,
        Lipids = 10,
        
        /* Spoilage */
        DaysFresh = 60,
        DaysTotallyRotten = 90,
        
        /* UI */
        DisplayCategory = Food,
        Tooltip = Tooltip_food,
        
        /* Happiness bonus */
        UnhappyChange = -5,
        StressChange = -5,
    }
}
```

New properties:
- `UnhappyChange = -5` - Reduces unhappiness (comfort food!)
- `StressChange = -5` - Reduces stress
- `Tooltip = Tooltip_food` - Shows food-related hover info

## Creating Multiple Items

Add more items in the same file:

```
module Base {
    /* Original energy bar */
    item EnergyBar {
        Type = Food,
        DisplayName = Energy Bar,
        Icon = Chocolate,
        Weight = 0.1,
        HungerChange = -15,
        ThirstChange = -5,
        Calories = 250,
        Carbohydrates = 35,
        Proteins = 5,
        Lipids = 10,
        DaysFresh = 60,
        DaysTotallyRotten = 90,
        DisplayCategory = Food,
    }

    /* Premium version */
    item EnergyBarDeluxe {
        Type = Food,
        DisplayName = Deluxe Energy Bar,
        Icon = Chocolate,
        Weight = 0.15,
        HungerChange = -25,
        ThirstChange = -5,
        Calories = 400,
        Carbohydrates = 45,
        Proteins = 10,
        Lipids = 15,
        DaysFresh = 45,
        DaysTotallyRotten = 70,
        DisplayCategory = Food,
        UnhappyChange = -10,
    }

    /* Empty wrapper (for crafting) */
    item EnergyBarWrapper {
        Type = Normal,
        DisplayName = Energy Bar Wrapper,
        Icon = PlasticBag,
        Weight = 0.01,
        DisplayCategory = Material,
    }
}
```

## Testing Multiple Items

Spawn all three:

```lua
local inv = getPlayer():getInventory()
inv:AddItem("Base.EnergyBar")
inv:AddItem("Base.EnergyBarDeluxe")
inv:AddItem("Base.EnergyBarWrapper")
```

## Common Mistakes

### Using Colon Instead of Equals

```
❌ Type: Food,
✓ Type = Food,
```

### Missing Comma

```
❌ Weight = 0.1
✓ Weight = 0.1,
```

### Spaces in Item ID

```
❌ item Energy Bar {
✓ item EnergyBar {
```

### Wrong Module Reference

```lua
// In console:
❌ AddItem("EnergyBar")           // Missing module
✓ AddItem("Base.EnergyBar")      // Correct
```

## Troubleshooting

### Item Doesn't Appear

1. Check mod is enabled
2. Verify file is in `media/scripts/`
3. Check console.txt for parse errors
4. Verify file extension is `.txt`

### Can't Eat the Item

1. Verify `Type = Food`
2. Check `HungerChange` has a value
3. Ensure item isn't rotten

### Item Has No Icon

1. Check `Icon` property exists
2. Verify icon name matches a vanilla icon
3. For custom icons, check texture path

## Key Takeaways

1. **Items go in `media/scripts/`** as `.txt` files
2. **Use equals, not colons** - `Type = Food,`
3. **Type determines behavior** - Food makes it edible
4. **Borrow vanilla icons** to start - customize later
5. **Test with debug console** 
