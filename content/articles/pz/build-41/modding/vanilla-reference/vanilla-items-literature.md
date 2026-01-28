---
id: vanilla-items-literature
slug: vanilla-items-literature
title: "Vanilla Items: items_literature.txt"
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
excerpt: "Reference for 103 items from items_literature.txt."
last_updated: 2026-01-18
---

# Vanilla Items Reference (items_literature.txt)

## Introduction

You're creating a skill book mod and need to know what weight vanilla books have. Or you're adding custom magazines and want them to feel authentic. Or maybe you're creating a library loot table and need to know what books actually exist in the game.

If you're feeling overwhelmed by all the skill books, magazines, and literature items in Project Zomboid, you're not alone. There are 103 different literature items spread across skill books (5 volumes each for major skills), magazines (single-issue skill boosts), and misc reading materials. Figuring out what's "normal" for a book's weight or what naming patterns vanilla uses can feel confusing.

Here's the good news: this reference organizes all vanilla literature items by type, so you can quickly see patterns for books, magazines, and other reading materials. I'll show you exactly how to use this reference to create balanced literature mods.

## How to Use This Reference

When creating custom literature items, follow this pattern:

### Step 1: Find Similar Vanilla Items

Look through the literature table below and find items similar to what you're creating:

- **Making a skill book?** Look at the 5-volume book series (Carpentry, Cooking, Farming, etc.)
- **Making a magazine?** Look at single-issue magazines (Electronics, Fishing, Engineer)
- **Making reading material?** Look at comic books, crossword magazines, doodles

### Step 2: Compare Properties

Notice the patterns in vanilla literature:

| Type | Weight | Examples |
|------|--------|----------|
| **Skill Books (5-volume series)** | 0.8 | Carpentry Vol. 1-5, Cooking Vol. 1-5, Farming Vol. 1-5 |
| **Magazines** | 0.1 | Angler USA Magazine, Electronics Magazine, Engineer Magazine |
| **Crossword/Comics** | 0.1-0.2 | Comic Book (0.1), Crossword Magazine (0.2) |
| **Generic Books** | 0.5 | Book, Notebook |
| **Doodles/Journals** | 0.3 | Doodle |

### Step 3: Make Your Decision

Choose values that match the vanilla pattern:

- **Skill books teaching a skill** → Use weight 0.8 (all vanilla skill books are 0.8)
- **Single-issue magazines** → Use weight 0.1 (quick reads are lighter)
- **Entertainment reading** → Use weight 0.1-0.2 (comics, crosswords)
- **Generic books/notebooks** → Use weight 0.5 (medium weight for writing materials)

## Items by Type

### Literature (103 items)

| Item | Weight | Description |
|------|--------|-------------|
| Angler USA Magazine Vol. 1 | 0.1 | `Base.FishingMag1` |
| Angler USA Magazine Vol. 2 | 0.1 | `Base.FishingMag2` |
| Blacksmith Vol. 1 | 0.8 | `Base.BookBlacksmith1` |
| Blacksmith Vol. 2 | 0.8 | `Base.BookBlacksmith2` |
| Blacksmith Vol. 3 | 0.8 | `Base.BookBlacksmith3` |
| Blacksmith Vol. 4 | 0.8 | `Base.BookBlacksmith4` |
| Blacksmith Vol. 5 | 0.8 | `Base.BookBlacksmith5` |
| Book | 0.5 | `Base.Book` |
| Carpentry Vol. 1 | 0.8 | `Base.BookCarpentry1` |
| Carpentry Vol. 2 | 0.8 | `Base.BookCarpentry2` |
| Carpentry Vol. 3 | 0.8 | `Base.BookCarpentry3` |
| Carpentry Vol. 4 | 0.8 | `Base.BookCarpentry4` |
| Carpentry Vol. 5 | 0.8 | `Base.BookCarpentry5` |
| Comic Book | 0.1 | `Base.ComicBook` |
| Cooking Vol. 1 | 0.8 | `Base.BookCooking1` |
| Cooking Vol. 2 | 0.8 | `Base.BookCooking2` |
| Cooking Vol. 3 | 0.8 | `Base.BookCooking3` |
| Cooking Vol. 4 | 0.8 | `Base.BookCooking4` |
| Cooking Vol. 5 | 0.8 | `Base.BookCooking5` |
| Crossword Magazine | 0.2 | `Base.MagazineCrossword1` |
| Crossword Magazine | 0.2 | `Base.MagazineCrossword2` |
| Crossword Magazine | 0.2 | `Base.MagazineCrossword3` |
| Doodle | 0.3 | `Base.Doodle` |
| Electrician Vol. 1 | 0.8 | `Base.BookElectrician1` |
| Electrician Vol. 2 | 0.8 | `Base.BookElectrician2` |
| Electrician Vol. 3 | 0.8 | `Base.BookElectrician3` |
| Electrician Vol. 4 | 0.8 | `Base.BookElectrician4` |
| Electrician Vol. 5 | 0.8 | `Base.BookElectrician5` |
| Electronics Magazine Vol. 1 | 0.1 | `Base.ElectronicsMag1` |
| Electronics Magazine Vol. 2 | 0.1 | `Base.ElectronicsMag2` |
| Electronics Magazine Vol. 3 | 0.1 | `Base.ElectronicsMag3` |
| Electronics Magazine Vol. 4 | 0.1 | `Base.ElectronicsMag5` |
| Empty Notebook | 0.5 | `Base.Notebook` |
| Engineer Magazine Vol. 1 | 0.1 | `Base.EngineerMagazine1` |
| Engineer Magazine Vol. 2 | 0.1 | `Base.EngineerMagazine2` |
| Farming Vol. 1 | 0.8 | `Base.BookFarming1` |
| Farming Vol. 2 | 0.8 | `Base.BookFarming2` |
| Farming Vol. 3 | 0.8 | `Base.BookFarming3` |
| Farming Vol. 4 | 0.8 | `Base.BookFarming4` |
| Farming Vol. 5 | 0.8 | `Base.BookFarming5` |
| First Aid Vol. 1 | 0.8 | `Base.BookFirstAid1` |
| First Aid Vol. 2 | 0.8 | `Base.BookFirstAid2` |
| First Aid Vol. 3 | 0.8 | `Base.BookFirstAid3` |
| First Aid Vol. 4 | 0.8 | `Base.BookFirstAid4` |
| First Aid Vol. 5 | 0.8 | `Base.BookFirstAid5` |
| Fishing Vol. 1 | 0.8 | `Base.BookFishing1` |
| Fishing Vol. 2 | 0.8 | `Base.BookFishing2` |
| Fishing Vol. 3 | 0.8 | `Base.BookFishing3` |
| Fishing Vol. 4 | 0.8 | `Base.BookFishing4` |
| Fishing Vol. 5 | 0.8 | `Base.BookFishing5` |
| *... and 53 more* | | |

---

## Common Mistakes

### ❌ Wrong: Wrong Weight for Skill Books

```
item MyCustomWoodworkBook
{
    Type = Literature,
    DisplayName = Advanced Woodworking,
    Weight = 0.1,                           // WRONG! Way too light for a skill book
    TeachedRecipes = SomeRecipe,
}
```

**Why it's wrong:** Looking at vanilla skill books (Carpentry, Cooking, Farming, etc.), ALL skill book volumes weigh 0.8. Your custom skill book at 0.1 weight would be lighter than a magazine, which doesn't match the pattern.

✅ **Right:**

```
item MyCustomWoodworkBook
{
    Type = Literature,
    DisplayName = Advanced Woodworking,
    Weight = 0.8,                           // Matches all vanilla skill books
    TeachedRecipes = SomeRecipe,
    SkillTrained = Woodwork,                // Skill this book trains
    LvlSkillTrained = 2,                    // Skill level provided
}
```

### ❌ Wrong: Magazine with Book Weight

```
item MyCustomGardenMagazine
{
    Type = Literature,
    DisplayName = Garden Monthly Issue 1,
    Weight = 0.8,                           // WRONG! Way too heavy for a magazine
    SkillTrained = Farming,
}
```

**Why it's wrong:** Looking at vanilla magazines (Angler USA, Electronics Magazine, Engineer Magazine), ALL magazines weigh 0.1. Your custom magazine at 0.8 weight would weigh as much as a full skill book, which is unrealistic.

✅ **Right:**

```
item MyCustomGardenMagazine
{
    Type = Literature,
    DisplayName = Garden Monthly Issue 1,
    Weight = 0.1,                           // Matches all vanilla magazines
    SkillTrained = Farming,                 // Skill this magazine trains
    NumLevelsTrained = 1,                   // Magazines typically give 1 level
}
```

### ❌ Wrong: Inconsistent Series Weights

```
item MyMechanicsVol1
{
    Type = Literature,
    DisplayName = Mechanics Vol. 1,
    Weight = 0.5,                           // First volume weight
}

item MyMechanicsVol2
{
    Type = Literature,
    DisplayName = Mechanics Vol. 2,
    Weight = 0.8,                           // WRONG! Different weight for same series
}
```

**Why it's wrong:** Looking at vanilla skill book series, ALL volumes in a series have the same weight. Carpentry Vol. 1-5 all weigh 0.8. Cooking Vol. 1-5 all weigh 0.8. Your series with varying weights (0.5, 0.8) breaks this pattern.

✅ **Right:**

```
item MyMechanicsVol1
{
    Type = Literature,
    DisplayName = Mechanics Vol. 1,
    Weight = 0.8,                           // Consistent weight
    SkillTrained = Mechanics,
    LvlSkillTrained = 1,
}

item MyMechanicsVol2
{
    Type = Literature,
    DisplayName = Mechanics Vol. 2,
    Weight = 0.8,                           // Same weight as Vol. 1
    SkillTrained = Mechanics,
    LvlSkillTrained = 2,
}
```

## Try It Yourself

Let's create a custom skill magazine using vanilla literature patterns.

### Step 1: Research Similar Items

Look at the reference above and find magazines:
- Angler USA Magazine Vol. 1: Weight 0.1
- Electronics Magazine Vol. 1: Weight 0.1
- Engineer Magazine Vol. 1: Weight 0.1

All vanilla magazines weigh 0.1 and provide temporary skill boosts for reading.

### Step 2: Create the Item File

Create `media/scripts/my_literature.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item SurvivalMagazine1
    {
        Type = Literature,                      // Identifies this as readable literature
        DisplayName = Survival Monthly Issue 1,
        Icon = Magazine,                        // Using vanilla magazine icon
        Weight = 0.1,                            // Matches all vanilla magazines
        SkillTrained = Trapping,                // Skill this magazine trains
        NumLevelsTrained = 1,                   // Magazines give 1 level boost temporarily
        LevelMin = 0,                            // Can read at skill level 0
        LevelMax = 3,                            // Useful up to skill level 3
        NumberOfPages = 12,                     // How many pages (affects reading time)
        CanBeWrite = false,                     // Can't write in this magazine
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "Survival Monthly" and spawn it
4. Right-click the magazine in your inventory

**What You Should See:**
- Magazine appears with magazine icon
- Shows "Read Survival Monthly Issue 1" in context menu
- Reading it provides +1 temporary boost to Trapping skill (if you're under level 3)
- Item weighs 0.1 (same as vanilla magazines)
- Takes time to read based on NumberOfPages (12 pages)

### Why This Works

This magazine uses vanilla patterns:
- **Weight (0.1)** matches ALL vanilla magazines
- **SkillTrained (Trapping)** specifies which skill it teaches
- **NumLevelsTrained (1)** matches vanilla magazine pattern (temporary boost)
- **LevelMax (3)** means it's useful for beginners (vanilla magazines typically cap at level 3-5)
- **NumberOfPages (12)** is reasonable for a magazine (vanilla magazines range from 10-20 pages)

---

## Source

Definitions from `media/scripts/items_literature.txt`

**Note:** This reference currently shows a subset of the 103 literature items. The patterns described above apply to all vanilla literature items.
