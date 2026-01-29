---
id: weapon-repair-repairable-weapons
slug: repairable-weapons
title: "Repairable Weapons List (Vanilla)"
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: beginner
tags:
  - item
  - repair
  - weapon
  - repairable
  - weapons
excerpt: "Complete reference of 73 repairable weapons in Project Zomboid - organized by category with fixer items, skill requirements, and patterns for creating repairable custom weapons."
table_of_contents:
  - text: "Introduction"
    link: "#introduction"
  - text: "How to Use This Reference"
    link: "#how-to-use-this-reference"
  - text: "Axes"
    link: "#axes"
  - text: "Baseball Bats"
    link: "#baseball-bats"
  - text: "Heavy Tools"
    link: "#heavy-tools"
  - text: "Sports Equipment"
    link: "#sports-equipment"
  - text: "Hammers and Mallets"
    link: "#hammers-and-mallets"
  - text: "Kitchen Items"
    link: "#kitchen-items"
  - text: "Garden Tools"
    link: "#garden-tools"
  - text: "Bladed Weapons"
    link: "#bladed-weapons"
  - text: "Paddling Equipment"
    link: "#paddling-equipment"
  - text: "Musical Instruments"
    link: "#musical-instruments"
  - text: "Spears (Crafted)"
    link: "#spears-crafted"
  - text: "Pistols"
    link: "#pistols"
  - text: "Revolvers"
    link: "#revolvers"
  - text: "Shotguns"
    link: "#shotguns"
  - text: "Rifles"
    link: "#rifles"
  - text: "Weapons NOT Repairable (Notable)"
    link: "#weapons-not-repairable-notable"
  - text: "Summary Statistics"
    link: "#summary-statistics"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
last_updated: 2026-01-18
---

# Repairable Weapons List (Vanilla)

## Introduction

You're creating a custom weapon mod and wonder if it should be repairable. Or you're looking at a Crowbar in-game and notice it has no repair option, while a Hammer can be repaired with tape. Or maybe you need to know what repair pattern to use for your weapon based on similar vanilla weapons.

If you're confused about which weapons are repairable in Project Zomboid, you're not alone. The base game has 73 repairable weapons spread across diverse categories (axes, sports equipment, firearms, musical instruments), but some similar weapons aren't repairable at all (Crowbar vs Hammer). Understanding the patterns (wooden-handled weapons use Woodglue, firearms use same-weapon-type, improvised items might not have repairs) helps you make informed modding decisions.

Here's the good news: this reference organizes all 73 vanilla repairable weapons by category, showing exactly what fixers and skills they require. I'll show you the patterns so you can quickly determine the right repair setup for your custom weapons.

---

## How to Use This Reference

This is a lookup guide for vanilla repairable weapons. Use it to:

### Step 1: Find Similar Weapon Category
- **Making an axe/tool with wooden handle?** → Check Axes or Heavy Tools
- **Making a sports item?** → Check Sports Equipment
- **Making a firearm?** → Check Pistols, Revolvers, Shotguns, or Rifles
- **Making an improvised/crafted weapon?** → Check Spears or Weapons NOT Repairable

### Step 2: Identify Repair Pattern

Notice the vanilla patterns:

| Pattern | Fixers | Skill Required | Examples |
|---------|--------|----------------|----------|
| **Wooden-handled weapons** | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Axe, Sledgehammer, Shovel, HandScythe |
| **General melee weapons** | DuctTape, Glue, Scotchtape | None | BaseballBat, Hammer, Pan, Machete |
| **Crafted spears** | DuctTape=1, Scotchtape=2 | None | All SpearX variants (lower uses) |
| **Firearms** | Same weapon type | Aiming 2-5 | All guns (Pistol repairs with Pistol) |

### Step 3: Apply Pattern to Your Weapon

Choose the pattern that matches your weapon's type:
- **Wooden tool/weapon** → Use Woodglue pattern with Woodwork skill
- **Metal/general weapon** → Use DuctTape pattern (no skill)
- **Crafted/improvised** → Either use Spear pattern (low uses) or make it non-repairable
- **Firearm** → Use same-weapon-type pattern with Aiming skill

---

## Axes

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Axe | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Standard pattern for wooden-handled axes |
| HandAxe | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Same as Axe |
| WoodAxe | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Same as Axe |
| PickAxe | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Same as Axe |
| HandScythe | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Bladed tool, uses axe pattern |

**Pattern:** All axes use the same repair definition - Woodglue (skilled) + 3 no-skill options.

**Usage Amounts:**
```
Fixer : Woodglue=2; Woodwork=2,    // 2 uses, requires Woodwork 2
Fixer : DuctTape=2,                // 2 uses, no skill
Fixer : Glue=2,                    // 2 uses, no skill
Fixer : Scotchtape=4,              // 4 uses (less efficient), no skill
```

---

## Baseball Bats

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| BaseballBat | DuctTape, Glue, Scotchtape | None | No Woodglue option (not a tool) |
| BaseballBatNails | DuctTape, Glue, Scotchtape, Nails | None | Nails repair the nails specifically |

**Pattern:** Baseball bats DON'T use Woodglue (even though wooden) - likely because they're sports equipment, not tools.

**Usage Amounts:**
```
// BaseballBat:
Fixer : DuctTape=2,                // 2 uses
Fixer : Glue=2,                    // 2 uses
Fixer : Scotchtape=4,              // 4 uses

// BaseballBatNails (additional option):
Fixer : Nails=10,                  // 10 nails to repair the nailed variant
```

---

## Heavy Tools

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Sledgehammer | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Uses axe pattern |
| Sledgehammer2 | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Variant, same repair |
| Shovel | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Uses axe pattern |
| Shovel2 | Woodglue, DuctTape, Glue, Scotchtape | Woodwork 2 (Woodglue) | Variant, same repair |
| SnowShovel | DuctTape, Glue, Scotchtape | None | NO Woodglue option (different from regular shovel) |

**Pattern:** Heavy tools with wooden handles use Woodglue pattern, except SnowShovel (no Woodglue).

**Design Insight:** SnowShovel might lack Woodglue because it's less durable or made of different materials.

---

## Sports Equipment

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| TennisRacket | DuctTape, Glue, Scotchtape | None | No Woodglue despite wooden frame |
| BadmintonRacket | DuctTape, Glue, Scotchtape | None | Same as tennis racket |
| HockeyStick | DuctTape, Glue, Scotchtape | None | Wooden but no Woodglue |
| IceHockeyStick | DuctTape, Glue, Scotchtape | None | Same as hockey stick |
| LaCrosseStick | DuctTape, Glue, Scotchtape | None | Wooden but no Woodglue |
| GolfClub | DuctTape, Glue, Scotchtape | None | Metal club, no Woodglue |

**Pattern:** ALL sports equipment uses no-skill fixers only (no Woodglue), even wooden items.

**Design Insight:** Sports equipment is treated differently from tools - doesn't require carpentry skill to repair.

---

## Hammers and Mallets

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Hammer | DuctTape, Glue, Scotchtape | None | No Woodglue (surprising!) |
| ClubHammer | DuctTape, Glue, Scotchtape | None | Same as hammer |
| WoodenMallet | DuctTape, Glue, Scotchtape | None | Wooden but no Woodglue |

**Pattern:** Hammers and mallets use no-skill fixers only.

**Design Insight:** Even though hammers have wooden handles, they don't use Woodglue - possibly because they're simpler tools than axes/shovels.

---

## Kitchen Items

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| RollingPin | DuctTape, Glue, Scotchtape | None | Wooden but no Woodglue |
| Pan | DuctTape, Glue, Scotchtape | None | Metal cookware |
| GridlePan | DuctTape, Glue, Scotchtape | None | Metal cookware |
| SaucePan | DuctTape, Glue, Scotchtape | None | Metal cookware |
| KitchenKnife | DuctTape, Glue, Scotchtape | None | Metal blade |
| HuntingKnife | DuctTape, Glue, Scotchtape | None | Metal blade |
| HandFork | DuctTape, Glue, Scotchtape | None | Utensil |

**Pattern:** ALL kitchen items use no-skill fixers (no Woodglue), even wooden items like RollingPin.

---

## Garden Tools

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| GardenFork | DuctTape, Glue, Scotchtape | None | Wooden handle but no Woodglue |
| GardenHoe | DuctTape, Glue, Scotchtape | None | Wooden handle but no Woodglue |
| Broom | DuctTape, Glue, Scotchtape | None | Wooden handle but no Woodglue |
| LeafRake | DuctTape, Glue, Scotchtape | None | Wooden handle but no Woodglue |
| Rake | DuctTape, Glue, Scotchtape | None | Wooden handle but no Woodglue |

**Pattern:** Garden tools DON'T use Woodglue despite wooden handles.

**Design Insight:** The distinction: Heavy-duty tools (axes, shovels, sledgehammers) use Woodglue; lighter garden tools don't.

---

## Bladed Weapons

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Machete | DuctTape, Glue, Scotchtape | None | Large blade, no Woodglue |

**Pattern:** Machete is the only dedicated bladed weapon with repairs (knives are in Kitchen Items).

---

## Paddling Equipment

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| CanoePadel | DuctTape, Glue, Scotchtape | None | Wooden paddle, no Woodglue |
| DoubleCanoePadel | DuctTape, Glue, Scotchtape | None | Wooden paddle, no Woodglue |

**Pattern:** Paddles use no-skill fixers despite being wooden.

---

## Musical Instruments

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Banjo | DuctTape, Glue, Scotchtape | None | Wooden instrument |
| GuitarAcoustic | DuctTape, Glue, Scotchtape | None | Wooden instrument |
| GuitarElectricBlack | DuctTape, Glue, Scotchtape | None | Electric guitar variant |
| GuitarElectricBlue | DuctTape, Glue, Scotchtape | None | Electric guitar variant |
| GuitarElectricRed | DuctTape, Glue, Scotchtape | None | Electric guitar variant |
| GuitarElectricBassBlack | DuctTape, Glue, Scotchtape | None | Bass guitar variant |
| GuitarElectricBassBlue | DuctTape, Glue, Scotchtape | None | Bass guitar variant |
| GuitarElectricBassRed | DuctTape, Glue, Scotchtape | None | Bass guitar variant |
| Saxophone | DuctTape, Glue, Scotchtape | None | Brass instrument |
| Trumpet | DuctTape, Glue, Scotchtape | None | Brass instrument |
| Violin | DuctTape, Glue, Scotchtape | None | Wooden instrument |

**Pattern:** ALL musical instruments use the same no-skill fixer pattern.

**Design Insight:** Musical instruments can be used as weapons and are repairable, maintaining consistency.

---

## Spears (Crafted)

All crafted spears use the SAME pattern with lower uses:

| Weapon | Fixers | Skill Required |
|--------|--------|----------------|
| SpearBreadKnife | DuctTape=1, Scotchtape=2 | None |
| SpearButterKnife | DuctTape=1, Scotchtape=2 | None |
| SpearFork | DuctTape=1, Scotchtape=2 | None |
| SpearHandFork | DuctTape=1, Scotchtape=2 | None |
| SpearHuntingKnife | DuctTape=1, Scotchtape=2 | None |
| SpearIcePick | DuctTape=1, Scotchtape=2 | None |
| SpearKnife | DuctTape=1, Scotchtape=2 | None |
| SpearLetterOpener | DuctTape=1, Scotchtape=2 | None |
| SpearMachete | DuctTape=1, Scotchtape=2 | None |
| SpearPen | DuctTape=1, Scotchtape=2 | None |
| SpearPencil | DuctTape=1, Scotchtape=2 | None |
| SpearScalpel | DuctTape=1, Scotchtape=2 | None |
| SpearScissors | DuctTape=1, Scotchtape=2 | None |

**Pattern:** Spears use **half the normal uses** (DuctTape=1 instead of 2, Scotchtape=2 instead of 4).

**Design Insight:** Crafted spears are easier to repair (lower material cost) because they're improvised weapons.

**Usage Amounts:**
```
Fixer : DuctTape=1,                // 1 use (half normal)
Fixer : Scotchtape=2,              // 2 uses (half normal)
```

---

## Pistols

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Pistol | Pistol | Aiming 3 | Uses same weapon type for parts |
| Pistol2 | Pistol2 | Aiming 3 | Each variant repairs itself only |
| Pistol3 | Pistol3 | Aiming 3 | Each variant repairs itself only |

**Pattern:** Pistols use **same weapon type** for parts. Each pistol variant repairs only itself.

**Usage:**
```
fixing Fix Pistol
{
   Require : Pistol,                  // Item being repaired
   Fixer : Pistol; Aiming=3,          // Use another Pistol, requires Aiming 3
}
```

**Key Point:** The fixer pistol is **completely consumed** (removed from inventory).

---

## Revolvers

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Revolver | Revolver, Revolver_Long, Revolver_Short | Aiming 2 | Cross-compatible with all revolver types |
| Revolver_Long | Revolver, Revolver_Long, Revolver_Short | Aiming 2 | Cross-compatible |
| Revolver_Short | Revolver, Revolver_Long, Revolver_Short | Aiming 2 | Cross-compatible |

**Pattern:** ALL revolver types can repair each other (most flexible firearm repair).

**Usage:**
```
fixing Fix Revolver
{
   Require : Revolver,                // Item being repaired
   Fixer : Revolver; Aiming=2,        // Use any revolver type for parts
   Fixer : Revolver_Long; Aiming=2,   // Long barrel variant works too
   Fixer : Revolver_Short; Aiming=2,  // Short barrel variant works too
}
```

**Design Insight:** Revolvers share compatible parts across variants (same mechanism, different barrel length).

---

## Shotguns

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| Shotgun | Shotgun, ShotgunSawnoff | Aiming 2 | Cross-compatible with sawn-off |
| ShotgunSawnoff | ShotgunSawnoff, Shotgun | Aiming 2 | Cross-compatible with regular shotgun |
| DoubleBarrelShotgun | DoubleBarrelShotgun | Aiming 2 | Repairs only itself (not cross-compatible) |

**Pattern:** Regular shotgun and sawn-off are cross-compatible; double-barrel is separate.

**Usage:**
```
fixing Fix Shotgun
{
   Require : Shotgun,                 // Item being repaired
   Fixer : Shotgun; Aiming=2,         // Use same shotgun type
   Fixer : ShotgunSawnoff; Aiming=2,  // Or use sawn-off variant
}
```

**Design Insight:** Sawn-off shotguns are cut-down regular shotguns, so parts are compatible.

---

## Rifles

| Weapon | Fixers | Skill Required | Notes |
|--------|--------|----------------|-------|
| HuntingRifle | HuntingRifle | Aiming 4 | Repairs only itself |
| VarmintRifle | VarmintRifle | Aiming 4 | Repairs only itself |
| AssaultRifle | AssaultRifle, AssaultRifle2 | Aiming 5 | Cross-compatible with variant |
| AssaultRifle2 | AssaultRifle2, AssaultRifle | Aiming 5 | Cross-compatible with variant |

**Pattern:** Higher skill requirement (Aiming 4-5) for more complex rifles. Assault rifle variants are cross-compatible.

**Usage:**
```
fixing Fix AssaultRifle
{
   Require : AssaultRifle,            // Item being repaired
   Fixer : AssaultRifle; Aiming=5,    // Use same assault rifle type
   Fixer : AssaultRifle2; Aiming=5,   // Or use variant
}
```

**Design Insight:** AssaultRifle requires highest skill (Aiming 5) - military-grade complexity.

---

## Weapons NOT Repairable (Notable)

The following weapon types do NOT have repair definitions in vanilla fixing.txt:

**Metal Improvised Weapons:**
- Crowbar (NOT repairable despite being similar to Hammer)
- Lead Pipe
- Metal Pipe
- Metal Bar
- Plunger

**Why Not Repairable?**
- **Solid metal construction**: No moving parts, no handle to break (can't break a solid metal bar)
- **Design philosophy**: Improvised weapons are disposable
- **Game balance**: Crowbar is very common; if repairable, it would be too powerful

**Other Non-Repairable:**
- Most improvised weapons
- Bare hands (obviously)

**Design Pattern:** Solid metal items without handles or mechanical parts are typically non-repairable.

---

## Summary Statistics

| Category | Count | Typical Pattern |
|----------|-------|-----------------|
| Axes & Scythes | 5 | Woodglue + 3 no-skill (Woodwork 2) |
| Baseball Bats | 2 | No-skill only (no Woodglue) |
| Heavy Tools | 5 | Woodglue + 3 no-skill (Woodwork 2) |
| Sports Equipment | 6 | No-skill only |
| Hammers & Mallets | 3 | No-skill only |
| Kitchen Items | 7 | No-skill only |
| Garden Tools | 5 | No-skill only |
| Bladed | 1 | No-skill only |
| Paddling | 2 | No-skill only |
| Musical | 11 | No-skill only |
| Spears | 13 | DuctTape=1, Scotchtape=2 (half uses) |
| Pistols | 3 | Same weapon type (Aiming 3) |
| Revolvers | 3 | Same weapon type, cross-compatible (Aiming 2) |
| Shotguns | 3 | Same weapon type, partially cross-compatible (Aiming 2) |
| Rifles | 4 | Same weapon type (Aiming 4-5) |
| **Total** | **73** | - |

**Key Patterns:**

1. **Woodglue pattern (Woodwork 2)**: Heavy-duty tools with wooden handles (axes, sledgehammers, shovels)
2. **No-skill pattern**: Everything else (sports equipment, kitchen items, garden tools, etc.)
3. **Half-uses pattern**: Crafted spears (DuctTape=1, Scotchtape=2)
4. **Same-weapon-type pattern**: All firearms (Aiming 2-5)

**Usage Breakdown:**
- **Woodglue weapons**: 10 out of 73 (13.7%)
- **No-skill only weapons**: 46 out of 73 (63%)
- **Crafted spears**: 13 out of 73 (17.8%)
- **Firearms**: 13 out of 73 (17.8%)

---

## Common Mistakes

### ❌ Wrong: Using Woodglue Pattern for All Wooden Weapons

```
fixing Fix MyCustomGolfClub
{
   Require : MyCustomGolfClub,
   Fixer : Woodglue=2; Woodwork=2,    // WRONG! Golf clubs don't use Woodglue in vanilla
   Fixer : DuctTape=2,
}
```

**Why it's wrong:** Looking at vanilla fixing.txt, GolfClub (and ALL sports equipment) uses no-skill fixers only. Just because a weapon is wooden doesn't mean it uses Woodglue - only heavy-duty tools (axes, sledgehammers, shovels) follow this pattern.

✅ **Right:**

```
fixing Fix MyCustomGolfClub
{
   Require : MyCustomGolfClub,        // Custom golf club
   Fixer : DuctTape=2,                // No-skill repair (follows vanilla sports equipment)
   Fixer : Glue=2,                    // Alternative no-skill option
   Fixer : Scotchtape=4,              // Emergency option
}
```

**Rule:** Woodglue is for heavy-duty wooden tools ONLY (axes, sledgehammers, shovels, hand scythes). Sports equipment, kitchen items, and garden tools use no-skill fixers even if wooden.

### ❌ Wrong: Making Metal Pipe Repairable Like Hammer

```
fixing Fix MetalPipe
{
   Require : MetalPipe,
   Fixer : DuctTape=2,                // WRONG! Metal pipes aren't repairable in vanilla
   Fixer : Glue=2,
}
```

**Why it's wrong:** Looking at vanilla fixing.txt, MetalPipe, LeadPipe, and Crowbar are NOT repairable despite being similar to Hammer (which IS repairable). The design philosophy: solid metal items without handles or moving parts are disposable.

✅ **Right:**

```
// DON'T create a fixing definition for solid metal items
// Instead, if you want repairable metal weapons, give them handles:

item MyCustomMetalBatWithHandle
{
    Type = Weapon,
    DisplayName = Metal Bat with Grip,
    // ... properties
}

fixing Fix MyCustomMetalBatWithHandle
{
    Require : MyCustomMetalBatWithHandle,
    Fixer : DuctTape=2,                // Repairs the grip/handle
    Fixer : Glue=2,
}
```

**Rule:** Solid metal items (pipes, bars, crowbars) are typically non-repairable. If you want a repairable metal weapon, give it a handle or grip that can break.

### ❌ Wrong: Cross-Repairing All Firearms

```
fixing Fix MyCustomPistol
{
   Require : MyCustomPistol,
   Fixer : MyCustomPistol; Aiming=3,  // Custom pistol
   Fixer : Pistol; Aiming=3,          // WRONG! Can't use vanilla pistol to repair custom
   Fixer : Revolver; Aiming=2,        // WRONG! Can't mix pistols and revolvers
}
```

**Why it's wrong:** Looking at vanilla fixing.txt, firearms are NOT universally cross-compatible. Pistol repairs only with Pistol, not with other gun types. Only specific groups are cross-compatible:
- Revolvers (all 3 types repair each other)
- Shotgun + ShotgunSawnoff (these 2 repair each other)
- AssaultRifle + AssaultRifle2 (these 2 repair each other)

✅ **Right:**

```
fixing Fix MyCustomPistol
{
   Require : MyCustomPistol,          // Custom pistol
   Fixer : MyCustomPistol; Aiming=3,  // Only repairs with itself
}

// If you want cross-compatibility, create a related variant:
fixing Fix MyCustomPistol
{
   Require : MyCustomPistol,
   Fixer : MyCustomPistol; Aiming=3,  // Standard model
   Fixer : MyCustomPistolCompact; Aiming=3,  // Compact variant (related gun)
}
```

**Rule:** Firearms repair with same type ONLY, unless you establish a variant relationship (like regular shotgun and sawn-off).

### ❌ Wrong: Using Standard Uses for Crafted Spear

```
fixing Fix MyCustomSpear
{
   Require : MyCustomSpear,
   Fixer : DuctTape=2,                // WRONG! Should be 1 for crafted spears
   Fixer : Scotchtape=4,              // WRONG! Should be 2 for crafted spears
}
```

**Why it's wrong:** Looking at vanilla fixing.txt, ALL crafted spears use half the normal uses: DuctTape=1 (not 2), Scotchtape=2 (not 4). This reduced material cost reflects that spears are improvised weapons and easier to repair.

✅ **Right:**

```
fixing Fix MyCustomSpear
{
   Require : MyCustomSpear,           // Custom crafted spear
   Fixer : DuctTape=1,                // Half uses for crafted weapon (follows vanilla spear pattern)
   Fixer : Scotchtape=2,              // Half uses (follows vanilla)
}
```

**Rule:** Crafted/improvised spears use half the normal uses (DuctTape=1, Scotchtape=2) to represent easier repair of improvised weapons.

---

## Try It Yourself

Let's create a custom weapon with appropriate repairs based on vanilla patterns.

### Step 1: Identify Your Weapon Type

Let's say you're creating a **Custom Fire Axe** - a heavy-duty tool with a wooden handle.

**Which vanilla category does this match?**
- Heavy-duty tool: ✅
- Wooden handle: ✅
- Similar to: Axe, Sledgehammer, Shovel

**Pattern to use:** Woodglue + 3 no-skill fixers (Woodwork 2)

### Step 2: Create the Weapon Definition

Create `media/scripts/my_weapon.txt`:

```
module MyMod
{
    imports
    {
        Base                          // Import Base module
    }

    item FireAxe
    {
        Type = Weapon,
        DisplayName = Fire Axe,
        Icon = Axe,                   // Using vanilla axe icon
        MinDamage = 1.5,              // Slightly better than regular axe
        MaxDamage = 3.5,
        CriticalChance = 50,          // High crit for heavy axe
        MaxRange = 1.5,               // Good reach
        SwingAnim = Axe,              // Axe swing animation
        WeaponWeight = 3,             // Heavy weapon
        ConditionMax = 18,            // More durable than regular axe (15)
        ConditionLowerChanceOneIn = 18,  // Degrades slower
        Categories = Axe,             // Trains Axe skill
        TwoHandWeapon = TRUE,         // Requires both hands
        TreeDamage = 25,              // Excellent tree chopping (better than regular axe: 20)
        DoorDamage = 10,              // Great door breaking (better than regular axe: 8)
    }
}
```

### Step 3: Create Repair Definition

Create `media/scripts/my_fixing.txt`:

```
module MyMod
{
    imports
    {
        Base                          // Import Base module for fixers
    }

    fixing Fix FireAxe
    {
        Require : FireAxe,            // Item being repaired

        // Follow vanilla Axe pattern:
        // 1. Skilled option (Woodglue + Woodwork 2)
        Fixer : Base.Woodglue=2; Woodwork=2,  // Skilled repair (best quality)

        // 2. No-skill options
        Fixer : Base.DuctTape=2,      // Quick tape repair
        Fixer : Base.Glue=2,          // Standard glue
        Fixer : Base.Scotchtape=4,    // Emergency scotch tape (less efficient)
    }
}
```

### Step 4: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to spawn items:
   - Type "Fire Axe" to spawn your weapon
   - Type "Woodglue" (for skilled repair)
   - Type "Duct Tape" (for no-skill repair)
3. Use the axe to damage it (chop trees, attack zombies)
4. Right-click damaged axe → "Repair Fire Axe"

**What You Should See:**

**Repair Menu Shows:**
- ✅ "Use Woodglue (Repairs 35%) (95% success)" [if you have Woodwork 2]
- ✅ "Use Duct Tape (Repairs 25%) (90% success)" [always available]
- ✅ "Use Glue (Repairs 25%) (90% success)" [always available]
- ✅ "Use Scotch Tape (Repairs 15%) (85% success)" [less effective, more uses]

**After Repair:**
- Fire Axe condition restored (amount depends on skill and fixer used)
- Woodglue: 2 uses consumed (or DuctTape/Glue/Scotchtape)
- Maintenance skill gains XP

### Why This Works

This Fire Axe repair definition follows the vanilla Axe pattern:

1. **Heavy-duty tool**: Uses Woodglue pattern (not sports equipment or kitchen item pattern)
2. **Wooden handle**: Justifies Woodglue as skilled option
3. **Four fixer options**: Skilled (Woodglue) + 3 no-skill (DuctTape, Glue, Scotchtape)
4. **Usage amounts**: Follow vanilla exactly (2, 2, 2, 4)
5. **Skill requirement**: Woodwork 2 for Woodglue (standard for wooden tools)

**Alternative Examples:**

**A. Custom Baseball Bat (Sports Equipment Pattern)**
```
fixing Fix ReinforcedBaseballBat
{
   Require : ReinforcedBaseballBat,
   Fixer : Base.DuctTape=2,          // No Woodglue (sports equipment don't use it)
   Fixer : Base.Glue=2,
   Fixer : Base.Scotchtape=4,
}
```

**B. Custom Crafted Spear (Half-Uses Pattern)**
```
fixing Fix SpearCustomKnife
{
   Require : SpearCustomKnife,
   Fixer : Base.DuctTape=1,          // Half uses (crafted weapon)
   Fixer : Base.Scotchtape=2,        // Half uses
}
```

**C. Custom Pistol (Same-Weapon-Type Pattern)**
```
fixing Fix CustomPistol
{
   Require : CustomPistol,
   Fixer : CustomPistol; Aiming=3,   // Uses same weapon type for parts
}
```

---

## Next Steps

Now that you understand repairable weapon patterns:

1. See [Fixing.txt Anatomy](fixing-txt-anatomy) for complete repair definition syntax
2. Check [Repair Items Reference](repair-items-reference) for all vanilla fixer items
3. Read [Repair System Overview](repair-system-overview) for how repair mechanics work
4. Study [Weapon Properties Guide](../vanilla-reference/weapon-properties-guide) to understand weapon stats
