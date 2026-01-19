---
id: fixing-txt-anatomy
slug: fixing-txt-anatomy
title: Fixing.txt Anatomy - Repair Definition Structure
excerpt: "Complete breakdown of fixing.txt syntax - how repair definitions work, with examples from vanilla game files."
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: intermediate
tags:
  - item
  - repair
  - weapon
  - fixing
  - txt
  - anatomy
last_updated: 2026-01-09
---
# Fixing.txt Anatomy - Repair Definition Structure

## File Location

```
R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\fixing.txt
R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\vehiclesfixing.txt
```

## Basic Structure

```
fixing Fix [ItemType]
{
   Require : [ItemType],
   [Optional Properties]

   Fixer : [FixerItem]=[Uses],
   Fixer : [FixerItem]=[Uses]; [SkillName]=[Level],
   ...
}
```

## Property Reference

### Require (Required)

Specifies the item type that this fixing definition applies to.

```
Require : Axe,
```

### Fixer (Required, at least one)

Defines an item that can perform the repair.

**Simple Fixer (no skill):**
```
Fixer : DuctTape=2,
```

**Fixer with Skill Requirement:**
```
Fixer : Woodglue=2; Woodwork=2,
```

**Multiple Skills:**
```
Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,
```

### GlobalItem (Optional)

A tool that is consumed during repair (like fuel):

```
GlobalItem : BlowTorch=2,
```

The tool must be available and will lose 2 uses during repair.

### ConditionModifier (Optional)

Multiplier affecting repair effectiveness:

```
ConditionModifier : 1.2,    // 20% more effective
ConditionModifier : 0.8,    // 20% less effective
ConditionModifier : 0.5,    // 50% less effective
```

## Complete Examples

### Simple Melee Weapon

```
fixing Fix BaseballBat
{
   Require : BaseballBat,
   Fixer : DuctTape=2,
   Fixer : Glue=2,
   Fixer : Scotchtape=4,
}
```

### Wooden Weapon with Skill Options

```
fixing Fix Axe
{
   Require : Axe,
   Fixer : Woodglue=2; Woodwork=2,
   Fixer : DuctTape=2,
   Fixer : Glue=2,
   Fixer : Scotchtape=4,
}
```

### Firearm (Self-Repair)

```
fixing Fix Pistol
{
   Require : Pistol,
   Fixer : Pistol; Aiming=3,
}
```

### Firearm with Cross-Repair

```
fixing Fix ShotgunSawnoff
{
   Require : ShotgunSawnoff,
   Fixer : ShotgunSawnoff; Aiming=2,
   Fixer : Shotgun; Aiming=2,
}
```

### Vehicle Part (Complex)

```
fixing Fix CarGasTank
{
   Require : CarGasTank,
   GlobalItem : BlowTorch=2,
   ConditionModifier : 1.2,

   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,
   Fixer : SmallSheetMetal=2; Mechanics=2; MetalWelding=1,
}
```

### Musical Instrument

```
fixing Fix Banjo
{
   Require : Banjo,
   Fixer : DuctTape=2,
   Fixer : Glue=2,
   Fixer : Scotchtape=4,
}
```

### Spear (Crafted Weapon)

```
fixing Fix SpearBreadKnife
{
   Require : SpearBreadKnife,
   Fixer : DuctTape=1,
   Fixer : Scotchtape=2,
}
```

## Skill Names Reference

Valid skill names for Fixer requirements:

| Skill Name | Description |
|------------|-------------|
| `Woodwork` | Carpentry skill |
| `Aiming` | Firearm accuracy skill |
| `Mechanics` | Vehicle repair skill |
| `MetalWelding` | Welding skill |

## Usage Amounts Guide

| Uses | Meaning |
|------|---------|
| 1 | Minimal repair, quick |
| 2 | Standard repair |
| 3-4 | Complex repair or less efficient material |

## Notes on Fixer Priority

When multiple fixers are available:
1. All valid options are shown to player
2. Player chooses based on availability and skill
3. Skill-based repairs often provide better results
4. Non-skill repairs are quick but may be less effective

## Creating Custom Repairs

For mods, create your own fixing definitions:

```
fixing Fix MyCustomWeapon
{
   Require : MyCustomWeapon,

   // Skilled repair option
   Fixer : Woodglue=2; Woodwork=2,

   // Quick repair options
   Fixer : DuctTape=2,
   Fixer : Glue=2,
}
```

Place in your mod's `media/scripts/` folder in a `.txt` file.

