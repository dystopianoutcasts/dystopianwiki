---
id: context-library
slug: context-library
title: Building a Context Library
excerpt: AI tools perform better when given relevant examples and context. A context library is a collection of reference files you can paste into AI conversations to get more accurate, PZ-specific results....
game: pz
version: build-41
section: modding
category: ai-assisted
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - ai
  - context
  - reference
  - workflow
  - organization
last_updated: 2026-01-09
---
# Building a Context Library

## Overview

AI tools perform better when given relevant examples and context. A context library is a collection of reference files you can paste into AI conversations to get more accurate, PZ-specific results. This guide shows you how to build one.

## Why Context Libraries Work

Without context, AI might:
- Use generic Lua patterns instead of PZ conventions
- Guess at item property names
- Miss PZ-specific syntax requirements

With context, AI can:
- Match your existing code style
- Use correct PZ property names
- Follow established patterns exactly

## What to Include

### Essential References

| Reference | Purpose | Example Use |
|-----------|---------|------------|
| **Vanilla item examples** | Correct property names | "Make an item like this one" |
| **Vanilla recipe examples** | Correct recipe syntax | "Follow this recipe format" |
| **Your mod's existing code** | Consistency | "Match my existing style" |
| **PZ function signatures** | Correct API usage | "Use this function correctly" |

### Recommended Files

1. **5-10 vanilla item definitions** covering different types
2. **5-10 vanilla recipe definitions** covering different patterns
3. **Common Lua event handlers** from vanilla
4. **Your mod's conventions** (naming, structure)

## Creating Your Library

### Step 1: Create a Folder

```
MyMod/
├── mod.info
├── media/
└── _ai_context/           <- Your context library
    ├── vanilla_items.txt
    ├── vanilla_recipes.txt
    ├── lua_events.txt
    └── my_conventions.md
```

The `_ai_context` folder won't affect your mod - it's just for reference.

### Step 2: Extract Vanilla Examples

Open PZ's vanilla scripts and copy relevant examples:

**vanilla_items.txt:**
```
-- WEAPON EXAMPLE
item BaseballBat {
    MaxRange = 1.3,
    WeaponSprite = BaseballBat,
    MinAngle = 0.2,
    Type = Weapon,
    MinimumSwingTime = 3,
    KnockBackOnNoDeath = TRUE,
    SwingAmountBeforeImpact = 0.02,
    Categories = Blunt,
    ConditionLowerChanceOneIn = 30,
    Weight = 2,
    SplatNumber = 1,
    PushBackMod = 0.5,
    MaxDamage = 1.2,
    SubCategory = Swinging,
    ConditionMax = 15,
    MaxHitCount = 2,
    DoorDamage = 7,
    SwingAnim = Bat,
    DisplayName = Baseball Bat,
    MinDamage = 0.8,
    IdleAnim = Idle_Weapon2,
    SwingTime = 3,
    KnockdownMod = 2,
    SplatBloodOnNoDeath = TRUE,
    Icon = BaseballBat,
    RunAnim = Run_Weapon2,
    TwoHandWeapon = TRUE,
    TreeDamage = 3,
    CriticalChance = 25,
    CritDmgMultiplier = 3,
    AttachmentType = BigBlade,
}

-- FOOD EXAMPLE
item Apple {
    HungerChange = -10,
    Type = Food,
    ThirstChange = 5,
    DisplayName = Apple,
    Icon = Apple,
    Weight = 0.2,
    Calories = 52,
    Carbohydrates = 14,
    Proteins = 0,
    Lipids = 0,
    DaysFresh = 6,
    DaysTotallyRotten = 12,
}

-- TOOL EXAMPLE
item Hammer {
    MaxRange = 0.9,
    WeaponSprite = Hammer,
    MinAngle = 0.2,
    Type = Weapon,
    MinimumSwingTime = 2.5,
    Categories = Blunt,
    ConditionLowerChanceOneIn = 20,
    Weight = 1,
    SplatNumber = 0,
    MaxDamage = 0.5,
    SubCategory = Swinging,
    ConditionMax = 10,
    MaxHitCount = 1,
    DoorDamage = 1,
    SwingAnim = Bat,
    DisplayName = Hammer,
    MinDamage = 0.3,
    SwingTime = 2.5,
    Icon = Hammer,
    TreeDamage = 0,
}
```

**vanilla_recipes.txt:**
```
-- SIMPLE RECIPE
recipe Open Beans {
    CannedBeans,
    TinOpener,

    Result:CannedBeansOpen,
    Time:30,
}

-- KEEP TOOL RECIPE
recipe Saw Logs {
    Log,
    keep [Recipe.GetItemTypes.Saw],

    Result:Plank=3,
    Time:230.0,
    Category:Carpentry,
    OnGiveXP:Recipe.OnGiveXP.SawLogs,
}

-- MULTI-INGREDIENT RECIPE
recipe Make Wooden Crate {
    Plank=4,
    Nails=8,
    keep Hammer,

    Result:Crate,
    Time:150.0,
    Category:Carpentry,
    NeedToBeLearn:true,
}

-- SKILL REQUIREMENT RECIPE
recipe Make Spear {
    TreeBranch,
    KitchenKnife/HuntingKnife,

    Result:SpearCrafted,
    Time:80.0,
    SkillRequired:Maintenance=2,
}
```

### Step 3: Document Your Conventions

**my_conventions.md:**
```markdown
# MyMod Conventions

## Naming
- Item IDs: PascalCase (CustomSword, AdvancedHelmet)
- File names: snake_case (items_weapons.txt, recipes_food.txt)
- Lua functions: PascalCase (OnPlayerDeath, HandleItemUse)

## Module
- Always use module Base unless creating unique items
- Custom items that shouldn't conflict: use module MyMod

## Code Style
- 4-space indentation
- Comments before complex logic
- Group related items in same file

## Recipe Categories
- Weapons → Metalworking
- Tools → Carpentry
- Food → Cooking
- Survival → Survivalist
```

## Using Your Context Library

### Full Context Prompt

```
I'm creating a mod for Project Zomboid Build 41.

Here are my reference examples for correct syntax:

[paste vanilla_items.txt section]

Here are my mod's conventions:

[paste my_conventions.md]

Now, create a new weapon item for a machete that:
- High damage, moderate speed
- Can cut trees
- Follows the format of my BaseballBat example
```

### Partial Context Prompt

When you only need specific context:

```
Using this vanilla recipe as a template:

[paste one recipe example]

Create a recipe that makes a torch from a stick and ripped sheets.
```

## Maintaining Your Library

### Update When

- You discover new vanilla patterns
- PZ updates change syntax
- You establish new conventions
- You find better examples

### Organize by Topic

As your library grows:

```
_ai_context/
├── items/
│   ├── weapons.txt
│   ├── food.txt
│   ├── tools.txt
│   └── clothing.txt
├── recipes/
│   ├── cooking.txt
│   ├── carpentry.txt
│   └── metalworking.txt
├── lua/
│   ├── events.txt
│   ├── inventory.txt
│   └── player.txt
└── conventions.md
```

## Advanced: Project-Specific Context

For complex mods, create a project summary:

**project_context.md:**
```markdown
# Survival+ Mod Context

## What This Mod Does
Adds realistic survival mechanics: advanced hunger, temperature, disease.

## Key Custom Items
- Thermometer (checks player temperature)
- Medicine Kit (cures diseases)
- Water Purifier (makes water safe)

## Key Systems
- Temperature tracked via hidden moodle
- Disease uses custom "Infected" effect
- All items use module SurvivalPlus

## Integration
- Requires: Hydrocraft (for additional containers)
- Compatible with: Brita's Weapons

## Current Files
- items_medical.txt (12 items)
- items_tools.txt (5 items)
- recipes_medical.txt (8 recipes)
```

Paste this at the start of AI sessions about your mod.

## Key Takeaways

1. **Context improves accuracy** - AI matches patterns it sees
2. **Vanilla examples are gold** - Use real PZ code as templates
3. **Document your conventions** - Consistency across AI sessions
4. **Organize by topic** - Find the right context quickly
5. **Keep it updated** - Outdated context causes outdated output 