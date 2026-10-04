---
id: vanilla-fixing-reference
slug: vanilla-fixing-reference
title: "Vanilla Fixing (Repair) System Reference"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - fixing
  - repair
  - vanilla
  - maintenance
excerpt: "Complete reference for the fixing (repair) system with all 76 vanilla repair entries."
related_articles:
  - weapon-properties-guide
  - vanilla-weapons-reference
last_updated: 2026-01-18
---

# Vanilla Fixing (Repair) System Reference

## Introduction

Your baseball bat is at 20% condition. You right-click it and see "Repair Baseball Bat" with four options: repair with woodglue, duct tape, glue, or scotch tape. You want to know which materials other weapons use for repair, or what pattern to follow for your custom weapon.

If you're overwhelmed by the 76 different fixing entries in vanilla PZ, you're not alone. Figuring out what repair materials to use for your custom weapon, or how many materials are "normal", can be confusing when you're trying to match vanilla patterns.

Here's the good news: this reference organizes all 76 vanilla fixing entries by weapon type, so you can quickly see what materials similar items use. I'll show you exactly how to use this reference to create balanced repair options for your mods.

## What You're Actually Seeing In-Game

When you repair items as a player:

1. **Right-click damaged item** - Baseball bat, kitchen knife, hunting rifle
2. **See "Repair [Item]" menu** - Submenu with multiple repair options
3. **Choose repair method** - "Repair with Duct Tape", "Repair with Woodglue", etc.
4. **Materials consumed** - 2 duct tape disappears from inventory
5. **Condition restored** - Item's durability bar increases

Each repair option comes from a `Fixer` line in the fixing entry. Multiple `Fixer` lines = multiple repair choices.

## How the Fixing System Works

The `fixing` system allows players to repair items using consumable materials. Unlike `recipe`, fixing entries:

- **Don't create new items** - they restore condition to existing items
- **Support multiple repair options** - each `Fixer` line is an alternative way to repair
- **Can require skills** - some repair methods need skill levels

## Fixing Syntax

```
fixing Fix Baseball Bat                     // Entry name (descriptive, for your reference)
{
    Require : BaseballBat,                  // Item type this repairs (WITHOUT module prefix!)

    Fixer : Woodglue=2; Woodwork=2,         // Option 1: need 2 woodglue + Woodwork skill level 2
    Fixer : DuctTape=2,                     // Option 2: need 2 duct tape (no skill required)
    Fixer : Glue=2,                         // Option 3: need 2 glue (cheaper alternative)
    Fixer : Scotchtape=4,                   // Option 4: need 4 scotch tape (emergency option)
}
```

> **Each `Fixer` line is ONE repair option** - the player chooses which method to use. This is NOT a list of required materials, it's a list of alternatives.

## Fixer Properties

| Property | Description | What It Means |
|----------|-------------|---------------|
| `Require` | The item type ID this fixing entry applies to | Must match your item's name exactly (without module prefix like `Base.`) |
| `Fixer` | A repair option: `Item=count` or `Item=count; Skill=level` | One way to repair. Can have multiple `Fixer` lines for different options |

## How to Use This Reference

1. **Find similar items** - Look up weapons similar to yours (baseball bat → other wooden weapons)
2. **Check repair patterns** - See what materials they use (wooden items use woodglue + duct tape)
3. **Count typical amounts** - Most repairs use 1-2 of primary material, 3-4 of emergency material
4. **Note skill requirements** - Woodwork/Metalworking often paired with primary materials

## Common Repair Materials

| Material | Common Uses |
|----------|-------------|
| **Duct Tape** | Universal repair, works on most items |
| **Woodglue** | Wooden items (often needs Woodwork skill) |
| **Glue** | General purpose, weaker than Woodglue |
| **Scotchtape** | Emergency repairs, needs more units |
| **Nails** | Nailed weapons specifically |

## Quick Navigation

- [Other](#other) (21 items)
- [Blunt Weapons](#blunt-weapons) (13 items)
- [Firearms](#firearms) (12 items)
- [Tools](#tools) (9 items)
- [Bladed Weapons](#bladed-weapons) (8 items)
- [Instruments](#instruments) (8 items)
- [Axes](#axes) (5 items)

## Other

| Item | Repair Options |
|------|----------------|
| Fix Black Electric Bass | DuctTape×2 **OR** Scotchtape×3 |
| Fix Blue Electric Bass | DuctTape×2 **OR** Scotchtape×3 |
| Fix Canoe Padel | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Double Canoe Padel | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Garden Fork | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Golf club | DuctTape×2 **OR** Scotchtape×3 |
| Fix Griddle Pan | DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Hand Fork | DuctTape **OR** Glue **OR** Scotchtape×2 |
| Fix Hand Scythe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Pan | DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Red Electric Bass | DuctTape×2 **OR** Scotchtape×3 |
| Fix Rolling Pin | Woodglue + Woodwork 1 **OR** DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Sauce Pan | DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Spear | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Hand Fork | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Ice Pick | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Letter Opener | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Scalpel | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Scissors | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Spoon | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Wooden Mallet | Woodglue + Woodwork 1 **OR** DuctTape **OR** Glue×2 **OR** Scotchtape×3 |

## Blunt Weapons

| Item | Repair Options |
|------|----------------|
| Fix Badminton Racket | DuctTape×2 **OR** Scotchtape×3 |
| Fix Ball Peen Hammer | DuctTape×2 **OR** Scotchtape×3 |
| Fix Baseball Bat | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Club Hammer | Woodglue + Woodwork 1 **OR** DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Hammer | Woodglue + Woodwork 1 **OR** DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Hockey Stick | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Hockey Stick | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Ice Hockey Stick | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix LaCrosse Stick | DuctTape×2 **OR** Glue×3 |
| Fix Nailed Baseball Bat | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 **OR** Nails |
| Fix Sledgehammer | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Sledgehammer2 | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Tennis Racket | DuctTape×2 **OR** Scotchtape×3 |

## Firearms

| Item | Repair Options |
|------|----------------|
| Fix Assault Rifle | AssaultRifle + Aiming×5 |
| Fix AssaultRifle2 | AssaultRifle2 + Aiming×5 |
| Fix DoubleBarrelShotgun | DoubleBarrelShotgun + Aiming×2 |
| Fix Hunting Rifle | HuntingRifle + Aiming×4 |
| Fix Pistol | Pistol + Aiming×3 |
| Fix Pistol2 | Pistol2 + Aiming×3 |
| Fix Pistol3 | Pistol3 + Aiming×3 |
| Fix Revolver | Revolver + Aiming×3 |
| Fix Revolver_Long | Revolver_Long + Aiming×3 |
| Fix Revolver_Short | Revolver_Short + Aiming×3 |
| Fix Shotgun | Shotgun + Aiming×2 **OR** ShotgunSawnoff + Aiming×2 |
| Fix Varmint Rifle | VarmintRifle + Aiming×4 |

## Tools

| Item | Repair Options |
|------|----------------|
| Fix Broom | Woodglue + Woodwork 1 **OR** DuctTape **OR** Glue×2 **OR** Scotchtape×3 |
| Fix Garden Hoe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Leaf Rake | DuctTape **OR** Glue×2 |
| Fix Rake | DuctTape **OR** Glue×2 |
| Fix ShotgunSawnoff | ShotgunSawnoff + Aiming×2 **OR** Shotgun + Aiming×2 |
| Fix Shovel | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Shovel2 | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Snow Shovel | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Spear With Screwdriver | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |

## Bladed Weapons

| Item | Repair Options |
|------|----------------|
| Fix Hunting Knife | DuctTape **OR** Glue **OR** Scotchtape×2 |
| Fix Kitchen Knife | DuctTape **OR** Glue **OR** Scotchtape×2 |
| Fix Machete | DuctTape×2 **OR** Scotchtape×3 |
| Fix Spear With Bread Knife | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Butter Knife | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Hunting Knife | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Kitchen Knife | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Spear With Machete | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |

## Instruments

| Item | Repair Options |
|------|----------------|
| Fix Acoustic Guitar | DuctTape×2 **OR** Scotchtape×3 |
| Fix Banjo | DuctTape×2 **OR** Scotchtape×3 |
| Fix Black Electric Guitar | DuctTape×2 **OR** Scotchtape×3 |
| Fix Blue Electric Guitar | DuctTape×2 **OR** Scotchtape×3 |
| Fix Red Electric Guitar | DuctTape×2 **OR** Scotchtape×3 |
| Fix Saxophone | DuctTape×2 **OR** Scotchtape×3 |
| Fix Trumpet | DuctTape×2 **OR** Scotchtape×3 |
| Fix Violin | DuctTape×2 **OR** Scotchtape×3 |

## Axes

| Item | Repair Options |
|------|----------------|
| Fix Axe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix Hand Axe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix PickAxe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |
| Fix PickAxe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×3 **OR** Scotchtape×4 |
| Fix Wood Axe | Woodglue×2 + Woodwork 2 **OR** DuctTape×2 **OR** Glue×2 **OR** Scotchtape×4 |

---

## Fixing vs Recipe vs Evolved Recipe

| System | Purpose | Creates New Item? |
|--------|---------|-------------------|
| `fixing` | Repair existing items | No |
| `recipe` | Craft new items | Yes |
| `evolvedrecipe` | Combine ingredients dynamically | Yes |

## Adding Custom Repair Options

To make your custom weapon repairable, create a `fixing` entry:

```
module MyMod
{
    fixing Fix My Custom Sword                  // Entry name (descriptive)
    {
        Require : MyCustomSword,                // Item name (no module prefix!)

        Fixer : DuctTape=3,                     // Option 1: 3 duct tape
        Fixer : WeldingRods=1; Metalworking=2,  // Option 2: 1 welding rod + skill level 2
    }
}
```

---

## Common Mistakes

### Wrong: Not Matching Material Counts to Vanilla Patterns

```
fixing Fix Custom Bat
{
    Require : CustomBat,
    Fixer : DuctTape=15,                        // WRONG! Way too many
}
```

**Why it's wrong:** Looking at vanilla, wooden weapons use **DuctTape=2**, not 15. Using 15 makes repair too expensive and breaks game balance.

**Right:**

```
fixing Fix Custom Bat
{
    Require : CustomBat,
    Fixer : Woodglue=2; Woodwork=2,             // Matches vanilla wooden weapons
    Fixer : DuctTape=2,                         // Standard duct tape amount
    Fixer : Glue=2,
    Fixer : Scotchtape=4,                       // Emergency option (more needed)
}
```

**Vanilla material count patterns:**
- Primary materials (Woodglue, WeldingRods): 1-2
- Duct Tape: 1-2 (universal)
- Glue: 2-3 (weaker than specialized glues)
- Scotch Tape: 3-4 (emergency, needs more)

---

### Wrong: Firearms Using Regular Repair Materials

```
fixing Fix Custom Rifle
{
    Require : CustomRifle,
    Fixer : DuctTape=2,                         // WRONG! Firearms don't use duct tape
    Fixer : WeldingRods=2; Metalworking=3,
}
```

**Why it's wrong:** Looking at vanilla firearms, they use **the same weapon type + Aiming skill** to repair (cannibalize parts from another gun), NOT duct tape or welding.

**Right:**

```
fixing Fix Custom Rifle
{
    Require : CustomRifle,
    Fixer : CustomRifle; Aiming=4,              // Need another CustomRifle + Aiming level 4
}
```

**Vanilla firearm pattern:** All firearms use `SameWeaponType; Aiming=X` where X ranges from 2 (shotguns) to 5 (assault rifles).

---

### Wrong: Using Wrong Skill Names

```
fixing Fix Custom Bat
{
    Require : CustomBat,
    Fixer : Woodglue=2; Carpentry=2,            // WRONG! It's "Woodwork" not "Carpentry"
}
```

**Why it's wrong:** The skill name must be spelled exactly as the game expects. `Carpentry` doesn't exist as a skill in the fixing system - it's called `Woodwork`.

**Right:**

```
fixing Fix Custom Bat
{
    Require : CustomBat,
    Fixer : Woodglue=2; Woodwork=2,             // Correct skill name
}
```

**Correct skill names in fixing system:**
- `Woodwork` (not Carpentry or Woodworking)
- `Metalworking` (correct)
- `Aiming` (for firearms, not Shooting)

---

## Try It Yourself

Let's create a custom metal pipe weapon and add appropriate repair options using this reference.

### Step 1: Find Similar Vanilla Items

1. Scroll up to the **Blunt Weapons** section
2. Look for metal weapons like "Ball Peen Hammer" or "Sledgehammer"
3. Note their repair patterns:
   - Ball Peen Hammer: `DuctTape=2` OR `Scotchtape=3`
   - Sledgehammer: `Woodglue=2 + Woodwork 2` OR `DuctTape=2` OR `Glue=3` OR `Scotchtape=4`

### Step 2: Analyze the Pattern

4. Metal items typically have:
   - Duct Tape as primary option (2 units)
   - Scotch Tape as emergency (3 units)
   - Optional: Glue (3 units)
   - Rarely: Woodglue for wooden handles

### Step 3: Create Your Weapon and Fixing Entry

5. Create `media/scripts/items.txt`:

```
module MyMod
{
    item MetalPipe
    {
        Type = Weapon,
        DisplayName = Metal Pipe,
        Icon = Pipe,
        Weight = 2.5,

        ConditionMax = 12,                      // Can be damaged/repaired
        ConditionLowerChanceOneIn = 25,

        MinDamage = 0.8,
        MaxDamage = 1.3,
        Categories = Blunt,
    }
}
```

6. Create `media/scripts/fixing.txt`:

```
module MyMod
{
    fixing Fix Metal Pipe
    {
        Require : MetalPipe,                    // Matches your item name

        Fixer : DuctTape=2,                     // Primary repair (no skill)
        Fixer : Glue=3,                         // Alternative
        Fixer : Scotchtape=3,                   // Emergency option
    }
}
```

### Step 4: Test In-Game

7. Load your mod
8. Spawn a Metal Pipe using Debug Mode
9. Damage it by hitting zombies
10. Right-click the damaged pipe
11. You should see "Repair Metal Pipe" with 3 options

### Step 5: Verify Repair Works

12. Spawn Duct Tape
13. Select "Repair with Duct Tape"
14. Check that:
    - 2 duct tape disappears from inventory
    - Metal Pipe condition increases
    - Can repair again if still damaged

### What You Should See

- **Context menu appears** - "Repair Metal Pipe" shows when damaged
- **3 repair options** - One for each `Fixer` line
- **Materials consumed correctly** - 2 duct tape, 3 glue, or 3 scotch tape
- **Balanced with vanilla** - Repair amounts similar to other metal weapons

### If It Doesn't Work

- **No repair option:** Check `ConditionMax` is set on weapon
- **Option appears but nothing happens:** Check `Require : MetalPipe` matches item name exactly (no module prefix)
- **Wrong material count:** Verify you wrote `DuctTape=2` not just `DuctTape`

---

## Repair Material Patterns Summary

From analyzing all 76 vanilla fixing entries:

**Wooden Items** (bats, axes, spears):
- Woodglue + Woodwork skill (best option)
- Duct Tape (no skill needed)
- Glue (cheaper alternative)
- Scotch Tape (emergency, needs more)

**Metal Items** (hammers, pipes, metal tools):
- Duct Tape (primary)
- Scotch Tape (emergency)
- Rarely: Glue

**Firearms** (all guns):
- Same weapon type + Aiming skill (cannibalize parts)
- Skill level 2-5 depending on weapon complexity

**Instruments** (guitars, trumpets, violins):
- Duct Tape
- Scotch Tape
- No skill requirements

**Composite Items** (nailed bat, canoe paddle):
- Multiple options including both wood and metal repairs
- Can add specific materials (nails for nailed bat)

---

## Source

Definitions from `media/scripts/fixing.txt`
