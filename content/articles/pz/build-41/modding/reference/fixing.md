---
id: reference-fixing
slug: fixing
title: "Fixing Script Reference"
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: beginner
tags:
  - beginner
  - fixing
  - repair
  - scripts
  - reference
excerpt: "Reference for Project Zomboid fixing scripts that define item repair recipes with materials and skill requirements."
table_of_contents:
  - text: "What Are Fixing Scripts?"
    link: "#what-are-fixing-scripts"
  - text: "Overview"
    link: "#overview"
  - text: "Basic Structure"
    link: "#basic-structure"
  - text: "Properties"
    link: "#properties"
  - text: "Common Repair Materials"
    link: "#common-repair-materials"
  - text: "Skill Requirements"
    link: "#skill-requirements"
  - text: "Examples"
    link: "#examples"
  - text: "Vanilla Fixing Patterns"
    link: "#vanilla-fixing-patterns"
  - text: "Complete Vanilla Examples"
    link: "#complete-vanilla-examples"
  - text: "Creating Custom Fixing Scripts"
    link: "#creating-custom-fixing-scripts"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Best Practices"
    link: "#best-practices"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "Tips"
    link: "#tips"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-10
---

# Fixing Script Reference

## What Are Fixing Scripts?

You know when your baseball bat is almost broken and you right-click it and see "Repair Baseball Bat"? That repair option exists because of a **fixing script** - a simple definition that tells the game "this item can be repaired with these materials."

**Fixing scripts are repair recipes.** They define what items can be fixed, what materials are needed to fix them, and what skills are required. Without fixing scripts, damaged items would just break permanently - no repairs possible.

When I first tried to add repair options to a custom weapon, I was confused by the syntax. "Fixer lines"? "Require statements"? It seemed complicated. But fixing scripts are actually one of the simplest script types in Project Zomboid - they're just a list of alternative repair methods. That's it.

This reference shows you every part of the fixing system: syntax, materials, skills, vanilla patterns, and how to create custom repairs.

---

## Overview

Fixing scripts define repair recipes for items, allowing players to restore durability to damaged weapons, tools, and equipment. Fixing scripts are located in `media/scripts/fixing.txt`.

**What fixing scripts control:**
- **Which items can be repaired** - Axes, bats, firearms, tools, etc.
- **What materials repair them** - Duct tape, glue, wood glue, nails, etc.
- **Alternative repair methods** - Multiple options per item (best to worst)
- **Skill requirements** - Woodwork for wooden items, Aiming for firearms, etc.
- **Repair efficiency** - Higher skills restore more durability

---

## Basic Structure

Every fixing script follows this pattern:

```lua
module Base                                 /* Usually defined in Base module */
{
    fixing Fix Item Name                    /* "fixing" keyword + descriptive name */
    {
        Require : ItemToFix,                /* Which item(s) this applies to */

        Fixer : RepairMaterial=Amount; SkillName=Level,  /* Repair method 1 (best) */
        Fixer : AlternativeMaterial=Amount,              /* Repair method 2 (alternative) */
    }
}
```

**Key structure:**
- `fixing` keyword declares a repair definition
- `Require :` specifies which items can be repaired
- Each `Fixer :` line is an alternative repair method
- First `Fixer` appears first in the game's context menu

---

## Properties

### Require

Specifies which item(s) this fixing definition applies to:

```lua
Require : Axe,                              /* Single item - only Axe can use this */
Require : Axe; HandAxe; WoodAxe,            /* Multiple items - any of these axes */
```

**Semicolons separate multiple items** - All listed items share the same repair options.

### Fixer

Defines repair methods. Each `Fixer` line is an alternative repair option:

```lua
Fixer : RepairItem=Amount,                  /* Basic repair (just material) */
Fixer : RepairItem; SkillName=Level,        /* Requires skill (no amount specified = 1) */
Fixer : RepairItem=Amount; SkillName=Level, /* Amount + skill requirement */
```

**How Fixer works:**
- **First Fixer** = Best repair option (usually requires skill, gives best durability)
- **Last Fixer** = Worst repair option (usually requires more materials, gives less durability)
- Players choose which repair method to use based on what they have

#### Fixer Syntax

| Component | Description | Example |
|-----------|-------------|---------|
| `RepairItem` | Item used for repair | `DuctTape` |
| `=Amount` | Quantity required (optional, defaults to 1) | `=2` |
| `SkillName=Level` | Required skill and level | `Woodwork=2` |

**Combining components:** Use semicolons to separate: `DuctTape=2; Woodwork=3`

---

## Common Repair Materials

These vanilla items are commonly used for repairs:

| Material | Description | Typical Use | Durability Restored |
|----------|-------------|-------------|---------------------|
| `DuctTape` | Universal repair | Most items | Good |
| `Scotchtape` | Basic repair | Light items | Moderate |
| `Glue` | Adhesive repair | General purpose | Moderate |
| `Woodglue` | Wood-specific | Wooden handles/items | Best (with Woodwork skill) |
| `Nails` | Structural repair | Nailed weapons | Good |

**Pattern:** Wood glue + skill = best repair, duct tape = no-skill alternative, scotch tape = worst option (requires more).

---

## Skill Requirements

Skills can be added to any Fixer line:

| Skill | Use Case | Typical Level |
|-------|----------|---------------|
| `Woodwork` | Wood item repairs | 2-3 |
| `Aiming` | Firearm repairs | 2-5 |
| `Metalworking` | Metal repairs | 3-5 |
| `Mechanics` | Vehicle parts | 2-4 |
| `Electrical` | Electronic repairs | 2-3 |

**Why skills matter:**
- **Higher skill = more durability restored** - Same materials, better results
- **Skill requirements = better repair option** - First Fixer usually requires skill, alternatives don't
- **Balance trade-off** - Skilled repair = less materials, unskilled = more materials

---

## Examples

### Basic Melee Weapon

```lua
fixing Fix Axe                              /* Repair definition for axes */
{
    Require : Axe,                          /* Applies to Axe item */

    Fixer : Woodglue=2; Woodwork=2,         /* Best: 2 wood glue + Woodwork 2 skill */
    Fixer : DuctTape=2,                     /* Good: 2 duct tape (no skill needed) */
    Fixer : Glue=2,                         /* Acceptable: 2 glue (no skill) */
    Fixer : Scotchtape=4,                   /* Worst: 4 scotch tape (more material) */
}
```

**Pattern:** Four tiers from best (skill + specialized material) to worst (common material but more of it).

### Firearm

```lua
fixing Fix Pistol                           /* Repair definition for pistols */
{
    Require : Pistol,                       /* Applies to Pistol item */

    Fixer : Pistol; Aiming=3,               /* Requires another pistol + Aiming 3 */
}

fixing Fix Shotgun                          /* Repair definition for shotguns */
{
    Require : Shotgun,                      /* Applies to Shotgun item */

    Fixer : Shotgun; Aiming=2,              /* Use matching shotgun + Aiming 2 */
    Fixer : ShotgunSawnoff; Aiming=2,       /* Alternative: sawed-off variant works too */
}
```

**Firearm pattern:** Requires matching weapon (or variant) as "parts donor" plus Aiming skill. You're cannibalizing one gun to fix another.

### Crafted Weapons

```lua
fixing Fix Nailed Baseball Bat              /* Repair definition for bat with nails */
{
    Require : BaseballBatNails,             /* Applies to nailed bat item */

    Fixer : Woodglue=2; Woodwork=2,         /* Best: wood glue + skill */
    Fixer : DuctTape=2,                     /* Good: duct tape */
    Fixer : Glue=2,                         /* Acceptable: glue */
    Fixer : Scotchtape=4,                   /* Worst: scotch tape */
    Fixer : Nails,                          /* Alternative: just nails (repairs nails, not wood) */
}
```

**Crafted weapon pattern:** Same as base weapon, plus option to repair the crafted component (nails).

### Spear Weapons

```lua
fixing Fix Spear With Kitchen Knife         /* Repair definition for spear */
{
    Require : SpearKnife,                   /* Applies to knife spear item */

    Fixer : Woodglue=2; Woodwork=2,         /* Best: wood glue + skill */
    Fixer : DuctTape=2,                     /* Good: duct tape */
    Fixer : Glue=2,                         /* Acceptable: glue */
    Fixer : Scotchtape=4,                   /* Worst: scotch tape */
}
```

**Spear pattern:** Repairs focus on the wooden handle, not the blade (blade is permanent).

### Multiple Items in One Definition

```lua
fixing Fix Guitars                          /* One definition for all guitars */
{
    Require : GuitarAcoustic; GuitarElectricBlack; GuitarElectricBlue,  /* All guitar types */

    Fixer : DuctTape=2,                     /* Option 1: duct tape */
    Fixer : Scotchtape=3,                   /* Option 2: scotch tape (more needed) */
}
```

**Multi-item pattern:** Related items (guitar variants) share repair options. Saves duplicate definitions.

---

## Vanilla Fixing Patterns

### Wood-Handled Tools

Most wood-handled items (axes, bats, hammers, shovels) use this standard pattern:

```lua
Fixer : Woodglue=2; Woodwork=2,             /* Best: 2 wood glue + Woodwork 2 */
Fixer : DuctTape=2,                         /* Good: 2 duct tape (no skill) */
Fixer : Glue=2,                             /* Acceptable: 2 glue */
Fixer : Scotchtape=4,                       /* Worst: 4 scotch tape (double amount) */
```

**Why this pattern works:**
- Skilled player gets efficient repair (wood glue + Woodwork)
- Unskilled player has options (tape/glue work but less efficient)
- Progression: worst option requires 2x materials

### Metal Tools

Metal tools without wood handles use simpler repair:

```lua
Fixer : DuctTape=2,                         /* Option 1: duct tape */
Fixer : Scotchtape=3,                       /* Option 2: scotch tape (more needed) */
```

**Why simpler:** No skill-based option (would need Metalworking for proper metal repair).

### Firearms

Firearms use matching weapon + Aiming skill:

```lua
Fixer : SameWeapon; Aiming=RequiredLevel,   /* Use matching gun as parts donor */
```

**Aiming skill requirements by weapon type:**

| Weapon Type | Aiming Required | Why |
|-------------|----------------|-----|
| Shotguns | 2 | Simplest firearms |
| Pistols | 3 | Moderate complexity |
| Rifles | 4 | Precision instruments |
| Assault Rifles | 5 | Most complex |

**Why firearms work differently:** You're swapping parts between guns, requires understanding of the weapon system.

---

## Complete Vanilla Examples

### Fix Baseball Bat

```lua
fixing Fix Baseball Bat                     /* Repair wooden bat */
{
    Require : BaseballBat,                  /* Applies to baseball bat */

    Fixer : Woodglue=2; Woodwork=2,         /* Best: 2 wood glue + Woodwork 2 */
    Fixer : DuctTape=2,                     /* Good: 2 duct tape */
    Fixer : Glue=2,                         /* Acceptable: 2 glue */
    Fixer : Scotchtape=4,                   /* Worst: 4 scotch tape */
}
```

### Fix Hunting Rifle

```lua
fixing Fix Hunting Rifle                    /* Repair hunting rifle */
{
    Require : HuntingRifle,                 /* Applies to hunting rifle */

    Fixer : HuntingRifle; Aiming=4,         /* Requires another hunting rifle + Aiming 4 */
}
```

**Why Aiming 4:** Rifles are precision weapons requiring high skill to properly transfer parts.

### Fix Garden Fork

```lua
fixing Fix Garden Fork                      /* Repair garden fork */
{
    Require : GardenFork,                   /* Applies to garden fork */

    Fixer : Woodglue=2; Woodwork=2,         /* Best: 2 wood glue + Woodwork 2 */
    Fixer : DuctTape=2,                     /* Good: 2 duct tape */
    Fixer : Glue=2,                         /* Acceptable: 2 glue */
    Fixer : Scotchtape=4,                   /* Worst: 4 scotch tape */
}
```

**Uses standard wood pattern** - Garden fork has wooden handle.

### Fix Kitchen Knife

```lua
fixing Fix Kitchen Knife                    /* Repair kitchen knife */
{
    Require : KitchenKnife,                 /* Applies to kitchen knife */

    Fixer : DuctTape,                       /* Option 1: 1 duct tape (amount=1 implied) */
    Fixer : Glue,                           /* Option 2: 1 glue */
    Fixer : Scotchtape=2,                   /* Option 3: 2 scotch tape */
}
```

**Small item pattern:** Requires less materials (1 instead of 2), simpler repair.

---

## Creating Custom Fixing Scripts

### For a New Melee Weapon

```lua
module MyMod                                /* Your mod's module */
{
    imports { Base }                        /* Import Base for vanilla items */

    fixing Fix Custom Sword                 /* Your weapon's repair definition */
    {
        Require : CustomSword,              /* Your weapon's item name */

        Fixer : Woodglue=2; Woodwork=3,     /* Best: wood glue + Woodwork 3 */
        Fixer : DuctTape=3,                 /* Good: 3 duct tape (more than standard) */
        Fixer : Glue=3,                     /* Acceptable: 3 glue */
    }
}
```

**Balance tip:** This sword requires Woodwork 3 and 3 materials (vs standard 2) - signaling it's a higher-tier weapon.

### For a New Firearm

```lua
module MyMod                                /* Your mod's module */
{
    imports { Base }                        /* Import Base for vanilla items */

    fixing Fix Custom Rifle                 /* Your firearm's repair definition */
    {
        Require : CustomRifle,              /* Your rifle's item name */

        Fixer : CustomRifle; Aiming=4,      /* Use another custom rifle + Aiming 4 */
        Fixer : HuntingRifle; Aiming=5,     /* Alternative: vanilla rifle (higher skill) */
    }
}
```

**Two-option firearm:** Matching weapon at normal skill, vanilla weapon at higher skill (less familiar parts).

### Multiple Related Items

```lua
module MyMod                                /* Your mod's module */
{
    imports { Base }                        /* Import Base for vanilla items */

    fixing Fix Custom Tool Set              /* One definition for all tools */
    {
        Require : CustomTool1; CustomTool2; CustomTool3,  /* All share these repairs */

        Fixer : DuctTape=2,                 /* Option 1: duct tape */
        Fixer : Glue=2,                     /* Option 2: glue */
    }
}
```

**Efficiency:** Define repair once for related items instead of duplicating definitions.

---

## Common Mistakes

### 1. Wrong Semicolon/Comma Usage

**Problem:** Mixing up semicolons (separators) and commas (terminators).

❌ **Wrong:**
```lua
fixing Fix Custom Weapon
{
    Require : Weapon1, Weapon2,             /* Commas won't work - only first item parsed */
    Fixer : DuctTape=2, Woodwork=2,         /* Comma won't combine these */
}
```

✅ **Right:**
```lua
fixing Fix Custom Weapon
{
    Require : Weapon1; Weapon2,             /* Semicolons separate multiple items */
    Fixer : DuctTape=2; Woodwork=2,         /* Semicolon combines material + skill */
}
```

**Rule:** Semicolons separate within statements, commas terminate statements.

### 2. Forgetting to Import Base

**Problem:** Custom mod can't reference vanilla repair materials.

❌ **Wrong:**
```lua
module MyMod
{
    /* Missing imports! */

    fixing Fix Custom Item
    {
        Require : CustomItem,
        Fixer : DuctTape=2,                 /* Game doesn't know what DuctTape is */
    }
}
```

✅ **Right:**
```lua
module MyMod
{
    imports { Base }                        /* Import Base module for vanilla items */

    fixing Fix Custom Item
    {
        Require : CustomItem,
        Fixer : DuctTape=2,                 /* Now DuctTape is recognized */
    }
}
```

**Why imports matter:** Repair materials (DuctTape, Glue, etc.) are defined in Base module.

### 3. Unrealistic Repair Costs

**Problem:** Repair requires too many or too few materials.

❌ **Wrong:**
```lua
fixing Fix Wooden Spoon
{
    Require : WoodenSpoon,
    Fixer : Woodglue=10; Woodwork=8,        /* 10 glue for a spoon?? */
}
```

✅ **Right:**
```lua
fixing Fix Wooden Spoon
{
    Require : WoodenSpoon,
    Fixer : Woodglue; Woodwork=1,           /* 1 glue (implied), low skill */
    Fixer : DuctTape,                       /* Alternative: 1 tape */
}
```

**Balance guide:**
- **Small items** (knives, spoons): 1 material
- **Standard items** (bats, axes): 2 materials
- **Large items** (sledgehammers): 2-3 materials
- **Scotch tape** should always require 2x other materials

### 4. No Alternative Repair Methods

**Problem:** Only one repair option (too restrictive).

❌ **Wrong:**
```lua
fixing Fix Custom Tool
{
    Require : CustomTool,
    Fixer : Woodglue=2; Woodwork=5,         /* Only option requires rare skill! */
}
```

✅ **Right:**
```lua
fixing Fix Custom Tool
{
    Require : CustomTool,
    Fixer : Woodglue=2; Woodwork=5,         /* Best option (skilled) */
    Fixer : DuctTape=3,                     /* Alternative (unskilled) */
    Fixer : Scotchtape=5,                   /* Last resort */
}
```

**Why alternatives matter:** Players should have options. Not everyone has Woodwork 5 when their tool breaks.

### 5. Firearm Repair Without Skill

**Problem:** Firearms repairable without Aiming skill.

❌ **Wrong:**
```lua
fixing Fix Custom Pistol
{
    Require : CustomPistol,
    Fixer : DuctTape=2,                     /* Duct tape doesn't fix gun mechanisms! */
}
```

✅ **Right:**
```lua
fixing Fix Custom Pistol
{
    Require : CustomPistol,
    Fixer : CustomPistol; Aiming=3,         /* Requires parts donor + Aiming skill */
}
```

**Firearm rule:** Firearms should always require matching weapon + Aiming skill. Tape/glue doesn't fix internal gun mechanisms.

---

## Try It Yourself

### Exercise 1: Create Repair for Crafted Weapon

Create fixing script for a crowbar with nails attached (CrowbarNails):
- Requires Metalworking 2 + 2 duct tape (best option)
- Alternative: 3 duct tape (no skill)
- Another alternative: 5 scotch tape
- Final alternative: 2 nails (repairs just the nails)

<details>
<summary>Solution</summary>

```lua
module MyMod
{
    imports { Base }

    fixing Fix Nailed Crowbar
    {
        Require : CrowbarNails,

        Fixer : DuctTape=2; Metalworking=2,
        Fixer : DuctTape=3,
        Fixer : Scotchtape=5,
        Fixer : Nails=2,
    }
}
```

**Key points:**
- Metal tool uses Metalworking skill (not Woodwork)
- Nails option lets you repair crafted component separately
- Scotch tape requires most materials (worst option)
</details>

### Exercise 2: Create Multi-Item Repair

Create one fixing definition for three knife types: ButterKnife, SteakKnife, PaperKnife:
- All use same repair options
- Option 1: 1 duct tape
- Option 2: 1 glue
- Option 3: 2 scotch tape

<details>
<summary>Solution</summary>

```lua
module MyMod
{
    imports { Base }

    fixing Fix Small Knives
    {
        Require : ButterKnife; SteakKnife; PaperKnife,

        Fixer : DuctTape,
        Fixer : Glue,
        Fixer : Scotchtape=2,
    }
}
```

**Key points:**
- Semicolons separate multiple Require items
- Small items need only 1 material (amount=1 implied when not specified)
- All three knives share these repair options
</details>

### Exercise 3: Create Custom Firearm Repair

Create fixing script for a sniper rifle (SniperRifle):
- Option 1: Another SniperRifle + Aiming 5
- Option 2: HuntingRifle + Aiming 6 (less familiar parts = higher skill)

<details>
<summary>Solution</summary>

```lua
module MyMod
{
    imports { Base }

    fixing Fix Sniper Rifle
    {
        Require : SniperRifle,

        Fixer : SniperRifle; Aiming=5,
        Fixer : HuntingRifle; Aiming=6,
    }
}
```

**Key points:**
- Firearms always require parts donor weapon
- Matching weapon = lower skill requirement
- Cross-compatible weapon = higher skill (adapting parts)
- Aiming 5-6 reflects high-precision weapon
</details>

---

## Best Practices

### 1. Follow Vanilla Patterns

**Match vanilla conventions for similar items:**
- **Wood-handled tools:** Woodglue + Woodwork, duct tape, glue, scotch tape
- **Metal items:** Duct tape, scotch tape (simpler)
- **Firearms:** Matching weapon + Aiming skill
- **Small items:** Half the materials of standard items

### 2. Order Fixer Lines Best to Worst

**First Fixer should be best repair:**
```lua
Fixer : Woodglue=2; Woodwork=2,             /* Best (skill-based) */
Fixer : DuctTape=2,                         /* Good */
Fixer : Glue=2,                             /* Acceptable */
Fixer : Scotchtape=4,                       /* Worst (requires most) */
```

Players see this order in context menu - best option first makes intuitive sense.

### 3. Balance Material Requirements

**Use these guidelines:**
- **Best option:** Specialized material (wood glue, nails) + skill
- **Middle options:** Universal materials (duct tape, glue) at standard amount
- **Worst option:** Common material (scotch tape) at 2x amount

**Material amounts by item size:**
- Small items: 1-2 materials
- Standard items: 2-3 materials
- Large items: 3-4 materials

### 4. Provide Skill-Free Alternatives

**Always include at least one no-skill option:**
```lua
Fixer : Woodglue=2; Woodwork=2,             /* Requires skill */
Fixer : DuctTape=2,                         /* No skill needed */
```

Not everyone has high skills when their favorite weapon breaks.

### 5. Group Related Items

**Use single definition for item variants:**
```lua
Require : Axe; HandAxe; WoodAxe,            /* All axes share repairs */
```

Cleaner than three separate definitions with identical repairs.

### 6. Match Skill Requirements to Item Tier

**Balance skill requirements to item power:**
- **Common items:** Woodwork/Metalworking 1-2
- **Uncommon items:** Woodwork/Metalworking 2-3
- **Rare items:** Woodwork/Metalworking 3-4
- **Firearms:** Aiming 2-5 based on weapon complexity

### 7. Test Repair Durability

**Verify repairs restore appropriate durability:**
- Skilled repair (Woodwork + wood glue) should restore ~40-60% durability
- Unskilled repair (duct tape) should restore ~20-30% durability
- Poor repair (scotch tape) should restore ~10-20% durability

Test in-game to ensure balance feels right.

---

## Key Takeaways

1. **Fixing scripts are repair recipes** - They define how items can be repaired
2. **Semicolons separate, commas terminate** - `Require : Item1; Item2,` and `Fixer : Material; Skill=Level,`
3. **First Fixer is best** - Order matters in context menu display
4. **Always provide alternatives** - Skill-based best option + unskilled fallbacks
5. **Wood pattern is standard** - Woodglue+Woodwork, duct tape, glue, scotch tape (2x)
6. **Firearms need parts donors** - Use matching weapon + Aiming skill
7. **Import Base for vanilla materials** - DuctTape, Glue, etc. come from Base module
8. **Balance matters** - Match material costs and skill requirements to item tier

---

## Tips

1. **Order matters**: First `Fixer` is shown first in-game context menu
2. **Balance repair costs**: More tape = easier but uses more resources
3. **Skill requirements**: Higher skill = better efficiency (restores more durability)
4. **Use vanilla patterns**: Follow existing conventions for consistency
5. **Multiple Require items**: Items share repair options (avoids duplication)
6. **Test repairs**: Verify durability restoration feels balanced
7. **Consider item value**: Rare weapons should require rarer materials/higher skills

---

## Related

- [Script Properties](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Recipe Basics](/build-41/modding/recipes/recipe-basics) - Recipe creation fundamentals
- [Vanilla Recipe Anatomy](/build-41/modding/recipes/vanilla-recipe-anatomy) - Complete recipe parameter reference
