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
  - text: "Tips"
    link: "#tips"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-10
---

# Fixing Script Reference

## Overview

Fixing scripts define repair recipes for items, allowing players to restore durability to damaged weapons, tools, and equipment. Fixing scripts are located in `media/scripts/fixing.txt`.

## Basic Structure

```
module Base
{
    fixing Fix Item Name
    {
        Require : ItemToFix,
        
        Fixer : RepairMaterial=Amount; SkillName=Level,
        Fixer : AlternativeMaterial=Amount,
    }
}
```

---

## Properties

### Require

Specifies which item(s) this fixing definition applies to:

```
Require : Axe,                    -- Single item
Require : Axe; HandAxe; WoodAxe,  -- Multiple items (any of these)
```

### Fixer

Defines repair methods. Each `Fixer` line is an alternative repair option:

```
Fixer : RepairItem=Amount,           -- Basic repair
Fixer : RepairItem; SkillName=Level, -- Requires skill
Fixer : RepairItem=Amount; SkillName=Level, -- Amount + skill
```

#### Fixer Syntax

| Component | Description | Example |
|-----------|-------------|----------|
| `RepairItem` | Item used for repair | `DuctTape` |
| `=Amount` | Quantity required | `=2` |
| `SkillName=Level` | Required skill | `Woodwork=2` |

---

## Common Repair Materials

| Material | Description | Typical Use |
|----------|-------------|-------------|
| `DuctTape` | Universal repair | Most items |
| `Scotchtape` | Basic repair | Light items |
| `Glue` | Adhesive repair | General purpose |
| `Woodglue` | Wood repair | Wooden handles |
| `Nails` | Structural repair | Nailed weapons |

---

## Skill Requirements

Skills can be added to any Fixer line:

| Skill | Use Case |
|-------|----------|
| `Woodwork` | Wood item repairs |
| `Aiming` | Firearm repairs |
| `Metalworking` | Metal repairs |
| `Mechanics` | Vehicle parts |
| `Electrical` | Electronic repairs |

---

## Examples

### Basic Melee Weapon

```
fixing Fix Axe
{
    Require : Axe,
    
    Fixer : Woodglue=2; Woodwork=2,  -- Best option (requires skill)
    Fixer : DuctTape=2,               -- Alternative (no skill)
    Fixer : Glue=2,                   -- Another alternative
    Fixer : Scotchtape=4,             -- Worst option (more material)
}
```

### Firearm

```
fixing Fix Pistol
{
    Require : Pistol,
    
    Fixer : Pistol; Aiming=3,  -- Requires another pistol + Aiming 3
}

fixing Fix Shotgun
{
    Require : Shotgun,
    
    Fixer : Shotgun; Aiming=2,
    Fixer : ShotgunSawnoff; Aiming=2,  -- Can use sawed-off variant
}
```

### Crafted Weapons

```
fixing Fix Nailed Baseball Bat
{
    Require : BaseballBatNails,
    
    Fixer : Woodglue=2; Woodwork=2,
    Fixer : DuctTape=2,
    Fixer : Glue=2,
    Fixer : Scotchtape=4,
    Fixer : Nails,  -- Can also use nails
}
```

### Spear Weapons

```
fixing Fix Spear With Kitchen Knife
{
    Require : SpearKnife,
    
    Fixer : Woodglue=2; Woodwork=2,
    Fixer : DuctTape=2,
    Fixer : Glue=2,
    Fixer : Scotchtape=4,
}
```

### Multiple Items in One Definition

```
fixing Fix Guitars
{
    Require : GuitarAcoustic; GuitarElectricBlack; GuitarElectricBlue,
    
    Fixer : DuctTape=2,
    Fixer : Scotchtape=3,
}
```

---

## Vanilla Fixing Patterns

### Wood-Handled Tools

Most wood-handled items use this pattern:

```
Fixer : Woodglue=2; Woodwork=2,  -- Best (skill)
Fixer : DuctTape=2,               -- Good
Fixer : Glue=2,                   -- Acceptable  
Fixer : Scotchtape=4,             -- Worst (more tape)
```

### Metal Tools

Simpler repair options:

```
Fixer : DuctTape=2,
Fixer : Scotchtape=3,
```

### Firearms

Use matching weapon + Aiming skill:

```
Fixer : SameWeapon; Aiming=RequiredLevel,
```

| Weapon Type | Aiming Required |
|-------------|----------------|
| Shotguns | 2 |
| Pistols | 3 |
| Rifles | 4 |
| Assault Rifles | 5 |

---

## Complete Vanilla Examples

### Fix Baseball Bat

```
fixing Fix Baseball Bat
{
    Require : BaseballBat,
    
    Fixer : Woodglue=2; Woodwork=2,
    Fixer : DuctTape=2,
    Fixer : Glue=2,
    Fixer : Scotchtape=4,
}
```

### Fix Hunting Rifle

```
fixing Fix Hunting Rifle
{
    Require : HuntingRifle,
    
    Fixer : HuntingRifle; Aiming=4,
}
```

### Fix Garden Fork

```
fixing Fix Garden Fork
{
    Require : GardenFork,
    
    Fixer : Woodglue=2; Woodwork=2,
    Fixer : DuctTape=2,
    Fixer : Glue=2,
    Fixer : Scotchtape=4,
}
```

### Fix Kitchen Knife

```
fixing Fix Kitchen Knife
{
    Require : KitchenKnife,
    
    Fixer : DuctTape,
    Fixer : Glue,
    Fixer : Scotchtape=2,
}
```

---

## Creating Custom Fixing Scripts

### For a New Melee Weapon

```
module MyMod
{
    imports { Base }
    
    fixing Fix Custom Sword
    {
        Require : CustomSword,
        
        Fixer : Woodglue=2; Woodwork=3,
        Fixer : DuctTape=3,
        Fixer : Glue=3,
    }
}
```

### For a New Firearm

```
module MyMod
{
    imports { Base }
    
    fixing Fix Custom Rifle
    {
        Require : CustomRifle,
        
        Fixer : CustomRifle; Aiming=4,
        Fixer : HuntingRifle; Aiming=5,  -- Can use vanilla rifle
    }
}
```

### Multiple Related Items

```
module MyMod
{
    imports { Base }
    
    fixing Fix Custom Tool Set
    {
        Require : CustomTool1; CustomTool2; CustomTool3,
        
        Fixer : DuctTape=2,
        Fixer : Glue=2,
    }
}
```

---

## Tips

1. **Order matters**: First `Fixer` is shown first in-game context menu
2. **Balance repair costs**: More tapes = easier but uses more resources
3. **Skill requirements**: Higher skill = better efficiency (restores more durability)
4. **Use vanilla patterns**: Follow existing conventions for consistency
5. **Multiple Require items**: Items share repair options

---

## Related

- [Weapon Repair Documentation](/build-41/modding/weapon-repair) - In-depth repair system
- [Script Properties](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Vehicle Script Reference](/build-41/modding/reference/vehicles) - Vehicle definitions
