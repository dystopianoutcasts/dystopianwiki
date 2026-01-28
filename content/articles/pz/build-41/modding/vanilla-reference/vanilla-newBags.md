---
id: vanilla-newBags
slug: vanilla-newBags
title: "Vanilla Items: newBags.txt"
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
excerpt: "Reference for 21 items from newBags.txt."
last_updated: 2026-01-18
---

# Vanilla Items Reference (newBags.txt)

## Introduction

You're creating a custom backpack mod and need to know what weight vanilla bags have. Or you're adding specialized containers like a toolbox and want them to feel authentic. Or maybe you're creating a survival kit and need to know what bag/container items exist in the base game.

If you're feeling overwhelmed by the different types of containers in Project Zomboid, you're not alone. The newBags.txt file contains 21 different bag/container items including duffel bags (specialized storage), gun cases (weapon storage), plastic bags (lightweight groceries), sacks (produce storage), and medical bags (trauma kits). Figuring out what's "normal" for a bag's weight or capacity can feel confusing.

Here's the good news: this reference organizes all vanilla bag items by type, so you can quickly see patterns for different container categories. I'll show you exactly how to use this reference to create balanced container mods.

## How to Use This Reference

When creating custom container/bag items, follow this pattern:

### Step 1: Find Similar Vanilla Items

Look through the bag table below and find items similar to what you're creating:

- **Making a duffel bag/backpack?** Look at the duffel bag variants (Military, ToolBag, FoodCanned, FoodSnacks)
- **Making a weapon case?** Look at gun cases (ShotgunCase, RifleCase variants)
- **Making a medical bag?** Look at Doctor Bag and Trauma Bag
- **Making a lightweight container?** Look at plastic bags (GroceryBag variants) and sacks (vegetables/produce)

### Step 2: Compare Properties

Notice the patterns in vanilla container items:

| Type | Weight | Examples |
|------|--------|----------|
| **Heavy Bags/Cases** | 1.0 | Duffel Bags (all variants), Gun Cases (all variants), Doctor Bag, Trauma Bag |
| **Lightweight Bags** | 0.1 | Plastic Bags (GroceryBag 1-5), Sacks (Cabbages, Carrots, Potatoes, Onions) |

**Important Pattern:** There are only TWO weight categories for bags in vanilla:
- **1.0 weight** = Substantial bags/cases (duffel bags, gun cases, medical bags)
- **0.1 weight** = Disposable/temporary bags (plastic grocery bags, produce sacks)

### Step 3: Make Your Decision

Choose values that match the vanilla pattern:

- **Substantial bags/backpacks** → Use weight 1.0 (duffel bags, gun cases, medical bags)
- **Temporary/disposable bags** → Use weight 0.1 (plastic bags, produce sacks)
- **No middle ground** → Vanilla doesn't use weights like 0.5 for bags (only 1.0 or 0.1)

## Items by Type

### Container (21 items)

| Item | Weight | Description |
|------|--------|-------------|
| Doctor Bag | 1 | `Base.Bag_DoctorBag` |
| Duffel Bag | 1 | `Base.Bag_FoodCanned` |
| Duffel Bag | 1 | `Base.Bag_FoodSnacks` |
| Duffel Bag | 1 | `Base.Bag_Military` |
| Duffel Bag | 1 | `Base.Bag_ToolBag` |
| Gun Case | 1 | `Base.ShotgunCase1` |
| Gun Case | 1 | `Base.RifleCase1` |
| Gun Case | 1 | `Base.RifleCase2` |
| Gun Case | 1 | `Base.RifleCase3` |
| Gun Case | 1 | `Base.ShotgunCase1` |
| Gun Case | 1 | `Base.ShotgunCase2` |
| Plastic Bag | 0.1 | `Base.GroceryBag1` |
| Plastic Bag | 0.1 | `Base.GroceryBag2` |
| Plastic Bag | 0.1 | `Base.GroceryBag3` |
| Plastic Bag | 0.1 | `Base.GroceryBag4` |
| Plastic Bag | 0.1 | `Base.GroceryBag5` |
| Sack | 0.1 | `Base.SackCabbages` |
| Sack | 0.1 | `Base.SackCarrots` |
| Sack | 0.1 | `Base.SackPotatoes` |
| Sack | 0.1 | `Base.SackOnions` |
| Trauma Bag | 1 | `Base.Bag_MedicalBag` |

---

## Common Mistakes

### ❌ Wrong: Custom Backpack with Middle-Ground Weight

```
item MyCustomBackpack
{
    Type = Container,
    DisplayName = Custom Backpack,
    Weight = 0.5,                           // WRONG! Vanilla bags don't use 0.5
    Capacity = 20,
}
```

**Why it's wrong:** Looking at vanilla bags, there are only TWO weight categories: 1.0 for substantial bags (duffel bags, gun cases, medical bags) and 0.1 for lightweight disposable bags (plastic bags, sacks). There are NO bags at 0.5 weight.

✅ **Right:**

```
item MyCustomBackpack
{
    Type = Container,
    DisplayName = Custom Backpack,
    Weight = 1.0,                            // Matches vanilla substantial bags
    Capacity = 20,                           // Storage capacity
    WeightReduction = 50,                    // Reduces weight of items inside by 50%
    DisplayCategory = Container,             // Shows in container category
}
```

### ❌ Wrong: Gun Case with Lightweight Weight

```
item MyCustomGunCase
{
    Type = Container,
    DisplayName = Custom Gun Case,
    Weight = 0.1,                           // WRONG! Gun cases should be substantial
    Capacity = 10,
}
```

**Why it's wrong:** Looking at vanilla gun cases (ShotgunCase1, ShotgunCase2, RifleCase1, RifleCase2, RifleCase3), ALL gun cases weigh 1.0. Gun cases are protective hard cases, not flimsy plastic bags. Your custom gun case at 0.1 weight is as light as a plastic grocery bag.

✅ **Right:**

```
item MyCustomGunCase
{
    Type = Container,
    DisplayName = Custom Gun Case,
    Weight = 1.0,                            // Matches all vanilla gun cases
    Capacity = 10,                           // Storage capacity
    CanBeEquipped = Back,                    // Can be worn on back
    DisplayCategory = Container,
}
```

### ❌ Wrong: Plastic Bag with Heavy Weight

```
item MyCustomPlasticBag
{
    Type = Container,
    DisplayName = Custom Plastic Bag,
    Weight = 1.0,                           // WRONG! Plastic bags should be lightweight
    Capacity = 5,
}
```

**Why it's wrong:** Looking at vanilla plastic bags (GroceryBag1-5) and sacks (Cabbages, Carrots, Potatoes, Onions), ALL lightweight/disposable bags weigh 0.1. Your custom plastic bag at 1.0 weight is as heavy as a duffel bag or gun case!

✅ **Right:**

```
item MyCustomPlasticBag
{
    Type = Container,
    DisplayName = Custom Plastic Bag,
    Weight = 0.1,                            // Matches all vanilla plastic bags
    Capacity = 5,                            // Small storage capacity
    DisplayCategory = Container,
}
```

## Try It Yourself

Let's create a custom tool bag using vanilla container patterns.

### Step 1: Research Similar Items

Look at the reference above and find substantial bags:
- Duffel Bag (Military): Weight 1.0
- Duffel Bag (ToolBag): Weight 1.0
- Doctor Bag: Weight 1.0

ALL substantial bags (duffel bags, gun cases, medical bags) weigh 1.0.

### Step 2: Create the Item File

Create `media/scripts/my_bags.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item EngineerToolBag
    {
        Type = Container,                        // Identifies this as a container item
        DisplayName = Engineer Tool Bag,
        Icon = Bag_DuffelBagTINT,                // Using vanilla duffel bag icon
        Weight = 1.0,                            // Matches all vanilla substantial bags
        Capacity = 25,                           // Storage capacity (number of items)
        WeightReduction = 30,                    // Reduces weight of items inside by 30%
        CanBeEquipped = Back,                    // Can be equipped on back slot
        RunSpeedModifier = 0.95,                 // Slightly slows running (5% penalty)
        DisplayCategory = Container,             // Shows in container inventory category
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "Engineer Tool" and spawn it
4. Right-click the tool bag in your inventory

**What You Should See:**
- Tool bag appears with duffel bag icon
- Shows "Equip on Back" in context menu
- After equipping: can right-click to open and store items
- Stored items have 30% weight reduction (wrench weighs 0.7 instead of 1.0)
- Bag itself weighs 1.0 (same as vanilla duffel bags)
- Running speed reduced by 5% when equipped

### Why This Works

This tool bag uses vanilla patterns:
- **Weight (1.0)** matches ALL vanilla substantial bags (duffel bags, gun cases, medical bags)
- **Type = Container** makes it function as storage
- **Capacity (25)** is reasonable for a tool bag (vanilla duffel bags have similar capacity)
- **WeightReduction (30)** helps carry heavy tools (common for container bags)
- **CanBeEquipped = Back** allows wearing it like vanilla bags

---

## Source

Definitions from `media/scripts/newBags.txt`

**Note:** This reference contains specialized bag/container items. General backpacks and basic bags may be defined in other files.
