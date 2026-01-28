---
id: vanilla-farming
slug: vanilla-farming
title: "Vanilla Items: farming.txt"
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
excerpt: "Reference for 39 items from farming.txt."
last_updated: 2026-01-18
---

# Vanilla Items Reference (farming.txt)

## Introduction

You're creating a farming mod and need to know what vanilla seeds weigh, or you want to add a custom vegetable that fits alongside vanilla crops. Maybe you're wondering why there's a separate `farming.txt` file instead of everything being in the main items file.

If you're confused about the farming.txt items, you're not alone. The game splits farming-related items into a separate file, and figuring out what's in there versus the main items file can be frustrating when you're trying to create balanced crops or farming tools.

Here's the good news: this reference shows all 39 items from `farming.txt`, organized by type. I'll show you exactly how to use this reference to create farming items that match vanilla patterns.

## What You're Actually Seeing In-Game

When you interact with farming items as a player:

- **Plant seeds** - Broccoli seeds (0.009 weight), Tomato seeds (0.009 weight)
- **Harvest crops** - Cabbage (0.2 weight), Potato (0.2 weight), Strawberries (0.1 weight)
- **Use farming tools** - Watering Can (4.0 weight when full), Gardening Spray (1.0 weight)
- **Store in inventory** - Seeds packets are heavier than loose seeds (0.1 vs 0.009)

All these items are defined in `media/scripts/farming.txt` rather than the main items files.

## How to Use This Reference

1. **Find similar vanilla items** - Look up existing crops/seeds to see their weights
2. **Check item types** - See whether items are Food, Drainable, Normal, or Weapon
3. **Match patterns** - Most seeds are 0.009 weight, most vegetables are 0.1-0.2 weight
4. **Use correct module** - All items here use the `farming` module prefix (e.g., `farming.Tomato`)

---

## Items by Type

### Drainable (6 items)

| Item | Weight | Description |
|------|--------|-------------|
| Gardening Spray Can (Full) | 1.0 | `farming.GardeningSprayFull` |
| Insecticide Spray | 1.0 | `farming.GardeningSprayCigarettes` |
| Mildew Spray | 1.0 | `farming.GardeningSprayMilk` |
| Water Bottle | 0.5 | `farming.MayonnaiseWaterFull` |
| Water Bottle | 0.5 | `farming.RemouladeWaterFull` |
| Watering Can (Full) | 4.0 | `farming.WateredCanFull` |

### Food (14 items)

| Item | Weight | Description |
|------|--------|-------------|
| Bacon | 0.3 | `farming.Bacon` |
| Bacon Bits | 0.1 | `farming.BaconBits` |
| Bacon Rashers | 0.1 | `farming.BaconRashers` |
| Bottle with Mayonnaise (Full) | 0.2 | `farming.MayonnaiseHalf` |
| Bottle with Remoulade (Half) | 0.2 | `farming.RemouladeHalf` |
| Cabbage | 0.2 | `farming.Cabbage` |
| Mayonnaise | 0.5 | `farming.MayonnaiseFull` |
| Potato | 0.2 | `farming.Potato` |
| Radish | 0.1 | `farming.RedRadish` |
| Remoulade | 0.5 | `farming.RemouladeFull` |
| Salad | 0.5 | `farming.Salad` |
| Seeding Broccoli | 0.1 | `farming.BloomingBroccoli` |
| Strawberries | 0.1 | `farming.Strewberrie` |
| Tomato | 0.2 | `farming.Tomato` |

### Normal (18 items)

| Item | Weight | Description |
|------|--------|-------------|
| Broccoli Seeds | 0.009 | `farming.BroccoliSeed` |
| Broccoli Seeds Packet | 0.1 | `farming.BroccoliBagSeed` |
| Cabbage Seeds | 0.009 | `farming.CabbageSeed` |
| Cabbage Seeds Packet | 0.1 | `farming.CabbageBagSeed` |
| Carrot Seeds | 0.009 | `farming.CarrotSeed` |
| Carrot Seeds Packet | 0.1 | `farming.CarrotBagSeed` |
| Empty Bottle | 0.1 | `farming.MayonnaiseEmpty` |
| Empty Bottle | 0.1 | `farming.RemouladeEmpty` |
| Gardening Spray Can (Empty) | 0.3 | `farming.GardeningSprayEmpty` |
| Potato Seeds | 0.009 | `farming.PotatoSeed` |
| Potato Seeds Packet | 0.1 | `farming.PotatoBagSeed` |
| Radish Seeds | 0.009 | `farming.RedRadishSeed` |
| Radish Seeds Packet | 0.1 | `farming.RedRadishBagSeed` |
| Strawberries Seeds | 0.009 | `farming.StrewberrieSeed` |
| Strawberries Seeds Packet | 0.1 | `farming.StrewberrieBagSeed` |
| Tomato Seeds | 0.009 | `farming.TomatoSeed` |
| Tomato Seeds Packet | 0.1 | `farming.TomatoBagSeed` |
| Watering Can | 2.0 | `farming.WateredCan` |

### Weapon (1 items)

| Item | Weight | Description |
|------|--------|-------------|
| Trowel | 0.5 | `farming.HandShovel` |

---

## Common Mistakes

### ❌ Wrong: Not Using farming Module for Farming Items

```
module MyMod
{
    item CustomCabbage
    {
        Type = Food,
        DisplayName = Custom Cabbage,
        Weight = 0.2,
        // Using MyMod module - won't integrate with farming system!
    }
}
```

**Why it's wrong:** If you want your vegetable to work with the farming system (plant, grow, harvest), you should extend the `farming` module, not create items in your own module.

✅ **Right:**

```
module farming                              // Use the farming module
{
    item CustomCabbage                      // Now it integrates with farming system
    {
        Type = Food,
        DisplayName = Custom Cabbage,
        Weight = 0.2,                       // Matches vanilla cabbage weight
    }
}
```

---

### ❌ Wrong: Wrong Weight for Seeds

```
module farming
{
    item CustomTomatoSeed
    {
        Type = Normal,
        DisplayName = Custom Tomato Seeds,
        Weight = 0.5,                       // WRONG! Way too heavy for seeds
    }
}
```

**Why it's wrong:** Looking at vanilla seeds, they ALL weigh exactly **0.009** (very light - they're tiny seeds!). A weight of 0.5 is 55 times heavier than vanilla seeds.

✅ **Right:**

```
module farming
{
    item CustomTomatoSeed
    {
        Type = Normal,
        DisplayName = Custom Tomato Seeds,
        Weight = 0.009,                     // Matches all vanilla seeds
    }
}
```

**Vanilla weight patterns:**
- Loose seeds: 0.009
- Seed packets: 0.1
- Small vegetables (strawberries, broccoli): 0.1
- Medium vegetables (potato, tomato, cabbage): 0.2
- Condiments (mayonnaise, remoulade): 0.5

---

### ❌ Wrong: Not Creating Both Seed and Crop

```
module farming
{
    item PumpkinSeed
    {
        Type = Normal,
        Weight = 0.009,
        // Created the seed but forgot to create the Pumpkin crop!
    }
}
```

**Why it's wrong:** The farming system needs both the seed item (to plant) AND the crop item (to harvest). If you only create one, the farming cycle won't work.

✅ **Right:**

```
module farming
{
    item PumpkinSeed                        // The seed (plantable)
    {
        Type = Normal,
        DisplayName = Pumpkin Seeds,
        Weight = 0.009,
    }

    item Pumpkin                            // The crop (harvestable)
    {
        Type = Food,
        DisplayName = Pumpkin,
        Weight = 0.3,                       // Heavier than most vegetables (it's a pumpkin!)
        HungerChange = -20,
    }
}
```

---

## Try It Yourself

Let's create a custom carrot using this reference to match vanilla patterns.

### Step 1: Analyze Vanilla Carrots

1. Look at the tables above
2. Note there's no "Carrot" food item (carrots exist in the base game's items.txt, not farming.txt)
3. But we can see the pattern: Carrot Seeds are 0.009 weight, Carrot Seeds Packet is 0.1 weight

### Step 2: Create Custom Beet (Similar to Carrot)

4. Create `media/scripts/farming_custom.txt` in your mod folder
5. Add this code:

```
module farming
{
    item BeetSeed                           // The seed
    {
        Type = Normal,
        DisplayName = Beet Seeds,
        Icon = CarrotSeed,                  // Use similar icon temporarily
        Weight = 0.009,                     // Standard seed weight
    }

    item BeetSeedPacket                     // The seed packet (optional but nice)
    {
        Type = Normal,
        DisplayName = Beet Seeds Packet,
        Icon = CarrotBagSeed,
        Weight = 0.1,                       // Standard packet weight
    }

    item Beet                               // The harvestable crop
    {
        Type = Food,
        DisplayName = Beet,
        Icon = Radish,                      // Use radish icon temporarily
        Weight = 0.2,                       // Same as potato/tomato/cabbage

        HungerChange = -15,                 // How much hunger it reduces
        Calories = 50,
        Carbohydrates = 10,
        Proteins = 2,

        DaysFresh = 4,                      // Stays fresh 4 days
        DaysTotallyRotten = 8,              // Rots after 8 days
    }
}
```

### Step 3: Test In-Game

6. Load your mod
7. Use Debug Mode to spawn "Beet Seeds"
8. You should be able to hold the seeds in inventory
9. Check the weight matches (0.009 for seeds, 0.2 for beet)

### Step 4: Integrate with Farming System (Advanced)

10. To make beets actually plantable/growable, you need to add farming definitions (beyond this article's scope)
11. But your items now follow vanilla patterns and will integrate correctly when you add the farming logic

### What You Should See

- **Beet Seeds weigh 0.009** - Matches vanilla seed pattern
- **Beet weighs 0.2** - Matches vanilla vegetables like potato/tomato
- **Items appear in debug menu** - Can spawn and interact with them
- **Follows farming module convention** - Uses `farming.BeetSeed` format

### If Something Feels Wrong

- **Too heavy/light:** Compare to similar vegetables in the tables above
- **Doesn't work with farming:** Make sure you used `module farming` not your own module
- **Wrong type:** Seeds should be `Type = Normal`, crops should be `Type = Food`

---

## Key Patterns

From analyzing all 39 farming items:

**Seeds:**
- Always `Type = Normal`
- Always weight = 0.009 (loose seeds)
- Packets are weight = 0.1

**Vegetables:**
- Always `Type = Food`
- Small (strawberries, broccoli) = 0.1
- Medium (potato, tomato, cabbage, radish) = 0.1-0.2
- Must be perishable (DaysFresh, DaysTotallyRotten)

**Tools:**
- Watering can = 2.0 empty, 4.0 full
- Spray cans = 0.3 empty, 1.0 full
- Trowel = 0.5 (weapon type for digging)

---

## Source

Definitions from `media/scripts/farming.txt`
