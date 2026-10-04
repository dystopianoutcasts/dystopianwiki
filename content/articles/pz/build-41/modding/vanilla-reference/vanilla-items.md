---
id: vanilla-items
slug: vanilla-items
title: "Vanilla Items: items.txt"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - vanilla
  - items
excerpt: "Reference for 92 items from items.txt."
last_updated: 2026-01-18
---

# Vanilla Items Reference (items.txt)

## Introduction

You're creating a custom paint color mod and need to know what weight vanilla paint cans have. Or you're adding drainable items like battery packs and want them to feel authentic. Or maybe you're creating household items and need to know what miscellaneous items exist in the base game.

If you're feeling overwhelmed by the variety of miscellaneous items in Project Zomboid, you're not alone. The items.txt file contains 92 different items spanning drainable items (batteries, paint, fertilizer), food items (cigarettes), and normal items (buckets, tools, household objects). Figuring out what's "normal" for a paint can's weight or what makes an item drainable can feel confusing.

Here's the good news: this reference organizes all vanilla miscellaneous items by type, so you can quickly see patterns for drainable items, household objects, and tools. I'll show you exactly how to use this reference to create balanced miscellaneous item mods.

## How to Use This Reference

When creating custom miscellaneous items, follow this pattern:

### Step 1: Find Similar Vanilla Items

Look through the item tables below and find items similar to what you're creating:

- **Making a drainable item?** Look at batteries, paint cans, matches, lighters, candles (items that deplete with use)
- **Making a household item?** Look at bowls, mugs, buckets, kettles (everyday objects)
- **Making construction materials?** Look at concrete, plaster, sandbags, gravel bags, nails
- **Making a tool?** Look at saws, garden saws, can openers, paint brushes

### Step 2: Compare Properties

Notice the patterns in vanilla miscellaneous items:

| Type | Weight | Examples |
|------|--------|----------|
| **Small Drainables (batteries, lighters)** | 0.1-0.2 | Battery (0.1), Lighter (0.1), Matches (0.1), Candle (0.2) |
| **Paint Cans** | 5.0 | ALL paint colors weigh 5.0 (standard paint can weight) |
| **Buckets (full)** | 4.0-10.0 | Water bucket (4.0), Concrete bucket (10.0), Plaster bucket (10.0) |
| **Buckets (empty)** | 1.0 | Empty Bucket (1.0) |
| **Construction Materials** | 2.0-10.0 | Sand/Dirt/Gravel bags (2.0), Concrete/Plaster powder (5.0), Propane tank (10.0) |
| **Household Items** | 0.2-1.0 | Mugs (0.2), Bowl (0.5), Cooking pot (1.0), Kettle (1.0) |
| **Tools** | 0.6-0.7 | Can opener (0.6), Saw (0.7), Garden saw (0.7) |
| **Tiny Items** | 0.001-0.05 | Nails (0.01), Tissue (0.1), Ripped sheets (0.05), Thread (0.1) |

### Step 3: Make Your Decision

Choose values that match the vanilla pattern:

- **Paint cans** → Always use weight 5.0 (all vanilla paint is 5.0)
- **Full buckets** → Use weight 4.0-10.0 (water = lighter, concrete = heavier)
- **Empty containers** → Much lighter than full (empty bucket = 1.0 vs full bucket = 4.0+)
- **Small drainable items** → Use weight 0.1-0.2 (batteries, lighters, matches)
- **Construction materials** → Use weight 2.0-10.0 based on real-world expectations

## Items by Type

### Drainable (42 items)

| Item | Weight | Description |
|------|--------|-------------|
| Antidepressants | 0.2 | `Base.PillsAntiDep` |
| Battery | 0.1 | `Base.Battery` |
| Beta Blockers | 0.2 | `Base.PillsBeta` |
| Black Paint | 5 | `Base.PaintBlack` |
| Blue Paint | 5 | `Base.PaintBlue` |
| Brown Paint | 5 | `Base.PaintBrown` |
| Bucket of Concrete | 10 | `Base.BucketConcreteFull` |
| Bucket of Plaster | 10 | `Base.BucketPlasterFull` |
| Bucket of Water | 4 | `Base.BucketWaterFull` |
| Candle | 0.2 | `Base.Candle` |
| Charcoal | 8 | `Base.Charcoal` |
| Coal | 8 | `Base.Coal` |
| Cornmeal | 1 | `Base.Cornmeal` |
| Cyan Paint | 5 | `Base.PaintCyan` |
| Dirt Bag | 2 | `Base.Dirtbag` |
| Dish Towel | 0.3 | `Base.DishCloth` |
| Flashlight | 1 | `Base.Torch` |
| Flour | 1 | `Base.Flour` |
| Gas Can | 5 | `Base.PetrolCan` |
| Gravel Bag | 2 | `Base.Gravelbag` |
| Green Paint | 5 | `Base.PaintGreen` |
| Grey Paint | 5 | `Base.PaintGrey` |
| Kettle of Water | 2 | `Base.FullKettle` |
| Light Blue Paint | 5 | `Base.PaintLightBlue` |
| Light Brown Paint | 5 | `Base.PaintLightBrown` |
| Lighter | 0.1 | `Base.Lighter` |
| Lit Candle | 0.2 | `Base.CandleLit` |
| Matches | 0.1 | `Base.Matches` |
| NPK Fertilizer | 2.0 | `Base.Fertilizer` |
| Orange Paint | 5 | `Base.PaintOrange` |
| Painkillers | 0.2 | `Base.Pills` |
| Pink Paint | 5 | `Base.PaintPink` |
| Propane Tank | 10.0 | `Base.PropaneTank` |
| Purple Paint | 5 | `Base.PaintPurple` |
| Red Paint | 5 | `Base.PaintRed` |
| Sand Bag | 2 | `Base.Sandbag` |
| Sleeping Tablets | 0.2 | `Base.PillsSleepingTablets` |
| Thread | 0.1 | `Base.Thread` |
| Tissue | 0.1 | `Base.Tissue` |
| Turquoise Paint | 5 | `Base.PaintTurquoise` |
| White Paint | 5 | `Base.PaintWhite` |
| Yellow Paint | 5 | `Base.PaintYellow` |

### Food (1 items)

| Item | Weight | Description |
|------|--------|-------------|
| Cigarettes | 0.005 | `Base.Cigarettes` |

### Normal (49 items)

| Item | Weight | Description |
|------|--------|-------------|
| Bag of Concrete Powder | 5 | `Base.ConcretePowder` |
| Bag of Plaster Powder | 5 | `Base.PlasterPowder` |
| Baking Tray | 0.5 | `Base.BakingTray` |
| Barbed Wire | 1 | `Base.BarbedWire` |
| Belt | 0.3 | `Base.Belt` |
| Bowl | 0.5 | `Base.Bowl` |
| Bucket | 1 | `Base.BucketEmpty` |
| Can Opener | 0.6 | `Base.TinOpener` |
| Cooking Pot | 1 | `Base.Pot` |
| Dirty Rag | 0.05 | `Base.RippedSheetsDirty` |
| Door Hinge | 0.3 | `Base.Hinge` |
| Doorknob | 0.5 | `Base.Doorknob` |
| Drawer | 3 | `Base.Drawer` |
| Empty Bottle | 0.1 | `Base.WaterBottleEmpty` |
| Empty Bottle | 0.3 | `Base.WhiskeyEmpty` |
| Empty Bottle | 0.3 | `Base.WineEmpty` |
| Empty Bottle | 0.3 | `Base.WineEmpty2` |
| Empty Bottle | 0.1 | `Base.BeerEmpty` |
| Empty Cyan Mug | 0.2 | `Base.Mugl` |
| Empty Fertilizer | 0.001 | `Base.FertilizerEmpty` |
| Empty Pop Bottle | 0.1 | `Base.PopBottleEmpty` |
| Empty Red Mug | 0.2 | `Base.MugRed` |
| Empty Spiffo Mug | 0.2 | `Base.MugSpiffo` |
| Empty White Mug | 0.2 | `Base.MugWhite` |
| Garden Saw | 0.7 | `Base.GardenSaw` |
| Kettle | 1 | `Base.Kettle` |
| Log | 9 | `Base.Log` |
| Nails | 0.01 | `Base.Nails` |
| Needle | 0.1 | `Base.Needle` |
| Paint Brush | 0.2 | `Base.Paintbrush` |
| Picture of Bob | 0.2 | `Base.BobPic` |
| Picture of Casey-Jo | 0.2 | `Base.CaseyPic` |
| Picture of Chris Bailey | 0.2 | `Base.ChrisPic` |
| Picture of Dr Cortman | 0.2 | `Base.CortmanPic` |
| Picture of Hank | 0.2 | `Base.HankPic` |
| Picture of James Garcia | 0.2 | `Base.JamesPic` |
| Picture of Kate | 0.2 | `Base.KatePic` |
| Picture of Marianne Brown | 0.2 | `Base.MariannePic` |
| Pillow | 0.8 | `Base.Pillow` |
| Pool Ball | 0.2 | `Base.PoolBall` |
| Ripped Sheets | 0.05 | `Base.RippedSheets` |
| Roasting Pan | 1.3 | `Base.RoastingPan` |
| Saw | 0.7 | `Base.Saw` |
| Sheet | 0.8 | `Base.Sheet` |
| Sheet Rope | 0.8 | `Base.SheetRope` |
| Stairs Piece | 35 | `Base.Stairs` |
| Sterilized Rag | 0.05 | `Base.AlcoholRippedSheets` |
| Tea Bag | 0.1 | `Base.Teabag` |
| Wet Dish Towel | 0.3 | `Base.DishClothWet` |

---

## Common Mistakes

### Wrong: Custom Paint Color with Wrong Weight

```
item MyCustomGoldPaint
{
    Type = Drainable,
    DisplayName = Gold Paint,
    Weight = 1.0,                           // WRONG! Way too light for paint can
    UseDelta = 0.01,
}
```

**Why it's wrong:** Looking at vanilla paint colors (Black, Blue, Brown, Cyan, Green, etc.), ALL paint cans weigh 5.0. Your custom gold paint at 1.0 weight would be 5x lighter than every other paint can in the game.

**Right:**

```
item MyCustomGoldPaint
{
    Type = Drainable,
    DisplayName = Gold Paint,
    Weight = 5.0,                            // Matches ALL vanilla paint cans
    UseDelta = 0.01,                         // Drains 1% per use
    Icon = PaintCan,                         // Using vanilla paint can icon
    DisplayCategory = Material,              // Shows in materials category
}
```

### Wrong: Full Bucket Lighter Than Empty Bucket

```
item MyCustomWaterBucket
{
    Type = Drainable,
    DisplayName = Bucket of Custom Liquid,
    Weight = 0.5,                           // WRONG! Lighter than empty bucket
    UseDelta = 0.001,
}
```

**Why it's wrong:** Looking at vanilla buckets, an Empty Bucket weighs 1.0, Bucket of Water weighs 4.0, and Bucket of Concrete weighs 10.0. Your full bucket at 0.5 weight is lighter than an empty bucket, which violates physics!

**Right:**

```
item MyCustomWaterBucket
{
    Type = Drainable,
    DisplayName = Bucket of Custom Liquid,
    Weight = 4.0,                            // Matches vanilla water bucket (heavier than empty)
    UseDelta = 0.001,                        // Drains slowly
    ReplaceOnDeplete = BucketEmpty,          // Becomes empty bucket when depleted
    Icon = BucketWaterFull,                  // Using vanilla water bucket icon
}
```

### Wrong: Drainable Item Without UseDelta

```
item MyCustomBattery
{
    Type = Drainable,
    DisplayName = Custom Battery,
    Weight = 0.1,
    // Missing UseDelta!                    // WRONG! Drainable items need UseDelta
}
```

**Why it's wrong:** Looking at vanilla drainable items (Battery, Lighter, Matches, Candle, Paint), ALL drainable items have a `UseDelta` property that controls how fast they drain. Without it, your item won't actually drain when used.

**Right:**

```
item MyCustomBattery
{
    Type = Drainable,
    DisplayName = Custom Battery,
    Weight = 0.1,                            // Matches vanilla Battery weight
    UseDelta = 0.0003,                       // Drains slowly (matches vanilla battery)
    DisplayCategory = Lighting,              // Shows in lighting category
}
```

### Wrong: Inconsistent Empty Container Weight

```
item MyCustomFullContainer
{
    Type = Drainable,
    DisplayName = Custom Container Full,
    Weight = 3.0,
    UseDelta = 0.01,
    ReplaceOnDeplete = MyCustomEmptyContainer,
}

item MyCustomEmptyContainer
{
    Type = Normal,
    DisplayName = Custom Container Empty,
    Weight = 3.5,                           // WRONG! Heavier when empty than when full!
}
```

**Why it's wrong:** Looking at vanilla containers, empty versions are ALWAYS lighter than full versions. Empty Bucket (1.0) vs Water Bucket (4.0). Your empty container at 3.5 is heavier than the full container at 3.0!

**Right:**

```
item MyCustomFullContainer
{
    Type = Drainable,
    DisplayName = Custom Container Full,
    Weight = 3.0,                            // Full container weight
    UseDelta = 0.01,
    ReplaceOnDeplete = MyCustomEmptyContainer,
}

item MyCustomEmptyContainer
{
    Type = Normal,
    DisplayName = Custom Container Empty,
    Weight = 0.5,                            // Much lighter when empty
}
```

## Try It Yourself

Let's create a custom spray paint can using vanilla drainable item patterns.

### Step 1: Research Similar Items

Look at the reference above and find paint cans:
- Black Paint: Weight 5.0
- Blue Paint: Weight 5.0
- Red Paint: Weight 5.0

ALL vanilla paint cans weigh 5.0 (standard paint can size).

### Step 2: Create the Item File

Create `media/scripts/my_items.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item SprayPaintSilver
    {
        Type = Drainable,                        // Drainable items deplete with use
        DisplayName = Silver Spray Paint,
        Icon = PaintCan,                         // Using vanilla paint can icon
        Weight = 5.0,                            // Matches all vanilla paint cans
        UseDelta = 0.01,                         // Each use drains 1% (100 uses total)
        UseWhileEquipped = false,                // Must be in inventory to use
        DisplayCategory = Material,              // Shows in materials inventory category
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "Silver Spray" and spawn it
4. Right-click the spray paint in your inventory

**What You Should See:**
- Spray paint appears with paint can icon
- Item weighs 5.0 (same as all vanilla paint)
- As you use it: the condition bar drains by 1% per use
- After 100 uses: item is completely depleted
- Shows "Silver Spray Paint" in tooltip

### Why This Works

This spray paint uses vanilla patterns:
- **Weight (5.0)** matches ALL vanilla paint cans (consistent weight)
- **Type = Drainable** makes it deplete with use
- **UseDelta (0.01)** gives it 100 uses (1% per use) - reasonable for a spray can
- **DisplayCategory = Material** groups it with other materials like vanilla paint

---

## Source

Definitions from `media/scripts/items.txt`

**Note:** This reference contains miscellaneous items from the base items.txt file. Specialized items (food, clothing, weapons, vehicles) are defined in other files.
