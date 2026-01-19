---
id: repair-items-reference
slug: repair-items-reference
title: Repair Items Reference (Fixers)
excerpt: Fixer items are consumable materials used to repair damaged equipment. Each fixer has specific properties that determine its effectiveness and requirements. Firearms use a unique self-repair system...
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: intermediate
tags:
  - lua
  - recipe
  - item
  - repair
  - weapon
  - items
  - reference
last_updated: 2026-01-09
---
# Repair Items Reference (Fixers)

## Overview

Fixer items are consumable materials used to repair damaged equipment. Each fixer has specific properties that determine its effectiveness and requirements.

## Common Repair Materials

### Woodglue

**Properties:**
- Requires: Woodwork skill (Level 1-2 depending on item)
- Usage: 2 uses per repair (typical)
- Best for: Wooden-handled weapons

**Used to Repair:**
- Axes (Axe, HandAxe, WoodAxe, PickAxe)
- Sledgehammers
- Baseball Bats
- Spears
- Other wooden tools

**Advantages:**
- Most effective for wooden weapons
- Better repair quality with Woodwork skill

### DuctTape

**Properties:**
- Requires: No skill
- Usage: 2 uses per repair (typical)
- Best for: Quick repairs on any item

**Used to Repair:**
- Most melee weapons
- Sports equipment
- Garden tools
- Musical instruments

**Advantages:**
- No skill requirement
- Universally available
- Quick and easy

### Glue

**Properties:**
- Requires: No skill
- Usage: 2 uses per repair (typical)
- Best for: General repairs

**Used to Repair:**
- Same as DuctTape
- Most non-firearm weapons

**Notes:**
- WoodGlue and Glue are interchangeable in some recipes
- Defined in recipecode.lua as same type

### Scotchtape

**Properties:**
- Requires: No skill
- Usage: 4 uses per repair (typical)
- Best for: Emergency repairs when nothing else available

**Used to Repair:**
- Same as DuctTape
- Most melee weapons

**Disadvantages:**
- Requires more uses (less efficient)
- Last resort material

### Nails

**Properties:**
- Requires: No skill
- Usage: Varies
- Best for: Nailed weapons

**Used to Repair:**
- BaseballBatNails
- Other nailed weapon variants

## Firearm Repair Items

Firearms use a unique self-repair system where the same weapon type is consumed.

### Same Weapon Type

**Pistols:**
```
Fixer : Pistol; Aiming=3,
```
- Consume one pistol to repair another
- Requires Aiming skill level 3

**Shotguns:**
```
Fixer : Shotgun; Aiming=2,
Fixer : ShotgunSawnoff; Aiming=2,
```
- Shotgun and ShotgunSawnoff can repair each other
- Requires Aiming skill level 2

**Rifles:**
```
Fixer : HuntingRifle; Aiming=4,
Fixer : VarmintRifle; Aiming=4,
```
- Requires Aiming skill level 4

**Assault Rifles:**
```
Fixer : AssaultRifle; Aiming=5,
Fixer : AssaultRifle2; Aiming=5,
```
- Requires Aiming skill level 5

**Revolvers:**
```
Fixer : Revolver; Aiming=2,
Fixer : Revolver_Long; Aiming=2,
Fixer : Revolver_Short; Aiming=2,
```
- All revolver types can repair each other
- Requires Aiming skill level 2

## Vehicle Repair Items

### BlowTorch

**Properties:**
- Type: GlobalItem (fuel consumed)
- Usage: 2 uses per welded repair
- Requires: MetalWelding + Mechanics skills

**Used to Repair:**
- Gas tanks
- Engine hoods
- Trunk lids
- Doors (welded variants)

### SheetMetal / SmallSheetMetal

**Properties:**
- Standard material for welded repairs
- SheetMetal: 1 use, SmallSheetMetal: 2 uses
- Requires: Mechanics 2 + MetalWelding 1-3

**Used to Repair:**
- Most vehicle body parts
- Welded components

## Clothing Repair Items

### Fabric (Various Types)

**Used with:** Thread + Needle

**Properties:**
- Consumed during patching
- Different fabrics for different results

### Thread

**Properties:**
- Uses degraded per patch
- Required for all clothing repairs

### Needle

**Properties:**
- Required tool (not consumed)
- Enables clothing repair actions

## Item Distribution

Repair items can be found in various locations:

| Item | Common Locations |
|------|------------------|
| DuctTape | Warehouses, garages, hardware stores |
| Glue | Schools, offices, craft stores |
| WoodGlue | Warehouses, carpentry shops |
| Scotchtape | Offices, homes, stores |
| Nails | Hardware stores, construction sites |
| BlowTorch | Mechanic shops, warehouses |
| SheetMetal | Junkyards, warehouses, factories |

## Repair Material Efficiency

| Material | Uses Required | Skill Required | Efficiency |
|----------|---------------|----------------|------------|
| Woodglue | 2 | Woodwork 2 | High |
| DuctTape | 2 | None | Medium |
| Glue | 2 | None | Medium |
| Scotchtape | 4 | None | Low |

## Tips for Modders

### Defining Custom Fixers

You can use any item as a fixer in your mod:

```
fixing Fix MyWeapon
{
   Require : MyWeapon,
   Fixer : MyCustomRepairKit=1; MyCustomSkill=3,
   Fixer : DuctTape=2,
}
```

### Creating Repair Kits

Define a custom item that serves as a dedicated repair material:

```lua
-- In items script
item WeaponRepairKit
{
    Type = Normal,
    DisplayName = Weapon Repair Kit,
    Icon = RepairKit,
    Weight = 0.5,
}
```

Then reference it in fixing.txt:
```
Fixer : WeaponRepairKit=1; Maintenance=2,
 
