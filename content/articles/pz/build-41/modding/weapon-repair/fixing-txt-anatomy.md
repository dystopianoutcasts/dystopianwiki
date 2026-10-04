---
id: weapon-repair-fixing-txt-anatomy
slug: fixing-txt-anatomy
title: "Fixing.txt Anatomy - Repair Definition Structure"
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
excerpt: "Complete guide to fixing.txt syntax - learn how Require, Fixer, GlobalItem, and ConditionModifier work to create repair definitions for weapons, tools, and vehicle parts."
table_of_contents:
  - text: "File Location"
    link: "#file-location"
  - text: "Basic Structure"
    link: "#basic-structure"
  - text: "Property Reference"
    link: "#property-reference"
  - text: "Require (Required)"
    link: "#require-required"
  - text: "Fixer (Required, at least one)"
    link: "#fixer-required-at-least-one"
  - text: "GlobalItem (Optional)"
    link: "#globalitem-optional"
  - text: "ConditionModifier (Optional)"
    link: "#conditionmodifier-optional"
  - text: "Complete Examples"
    link: "#complete-examples"
  - text: "Simple Melee Weapon"
    link: "#simple-melee-weapon"
  - text: "Wooden Weapon with Skill Options"
    link: "#wooden-weapon-with-skill-options"
  - text: "Firearm (Self-Repair)"
    link: "#firearm-self-repair"
  - text: "Firearm with Cross-Repair"
    link: "#firearm-with-cross-repair"
  - text: "Vehicle Part (Complex)"
    link: "#vehicle-part-complex"
  - text: "Musical Instrument"
    link: "#musical-instrument"
  - text: "Spear (Crafted Weapon)"
    link: "#spear-crafted-weapon"
  - text: "Skill Names Reference"
    link: "#skill-names-reference"
  - text: "Usage Amounts Guide"
    link: "#usage-amounts-guide"
  - text: "Notes on Fixer Priority"
    link: "#notes-on-fixer-priority"
  - text: "Creating Custom Repairs"
    link: "#creating-custom-repairs"
last_updated: 2026-01-18
---

# Fixing.txt Anatomy - Repair Definition Structure

## Introduction

You're trying to make your custom weapon repairable and you've found the `fixing.txt` file. You stare at the syntax `Fixer : DuctTape=2; Woodwork=2` and wonder what the numbers mean, or why some items use semicolons and others use commas. Or maybe you created a fixing definition but your weapon still shows "Can't Be Repaired" in game.

If you're feeling confused by fixing.txt syntax, you're not alone. Repair definitions have their own unique format that's different from item definitions, with properties like `Require`, `Fixer`, `GlobalItem`, and `ConditionModifier` that aren't always intuitive. The semicolon/comma distinction matters (and it's easy to get backwards), and figuring out the right "uses" number for materials can feel like guesswork.

Here's the good news: once you understand fixing.txt anatomy, creating repair definitions becomes straightforward. The syntax is actually quite simple - there are only 4 properties to learn. I'll show you exactly how each property works, what the numbers mean, and walk you through creating your own repair definitions.

## File Location

```
media/scripts/fixing.txt
media/scripts/vehiclesfixing.txt
```

## Basic Structure

```
fixing Fix [ItemType]
{
   Require : [ItemType],              // Item this definition applies to
   [Optional Properties]

   Fixer : [FixerItem]=[Uses],        // Simple repair (no skill required)
   Fixer : [FixerItem]=[Uses]; [SkillName]=[Level],  // Skilled repair
   ...
}
```

## Property Reference

### Require (Required)

Specifies the item type that this fixing definition applies to.

```
Require : Axe,                        // This fixing definition repairs Axe items
```

### Fixer (Required, at least one)

Defines an item that can perform the repair.

**Simple Fixer (no skill):**
```
Fixer : DuctTape=2,                   // Uses 2 duct tape, no skill required
```

**Fixer with Skill Requirement:**
```
Fixer : Woodglue=2; Woodwork=2,       // Uses 2 woodglue, requires Woodwork level 2
```

**Multiple Skills:**
```
Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,  // Requires both skills
```

### GlobalItem (Optional)

A tool that is consumed during repair (like fuel):

```
GlobalItem : BlowTorch=2,             // Blowtorch loses 2 uses during repair
```

The tool must be available and will lose 2 uses during repair.

### ConditionModifier (Optional)

Multiplier affecting repair effectiveness:

```
ConditionModifier : 1.2,              // 20% more effective
ConditionModifier : 0.8,              // 20% less effective
ConditionModifier : 0.5,              // 50% less effective
```

## Complete Examples

### Simple Melee Weapon

```
fixing Fix BaseballBat
{
   Require : BaseballBat,             // Repairs baseball bats
   Fixer : DuctTape=2,                // Quick tape repair (2 uses)
   Fixer : Glue=2,                    // Glue repair (2 uses)
   Fixer : Scotchtape=4,              // Scotch tape (less effective, 4 uses)
}
```

### Wooden Weapon with Skill Options

```
fixing Fix Axe
{
   Require : Axe,                     // Repairs axes
   Fixer : Woodglue=2; Woodwork=2,    // Skilled repair (better results)
   Fixer : DuctTape=2,                // Quick tape repair
   Fixer : Glue=2,                    // Standard glue
   Fixer : Scotchtape=4,              // Emergency scotch tape
}
```

### Firearm (Self-Repair)

```
fixing Fix Pistol
{
   Require : Pistol,                  // Repairs pistols
   Fixer : Pistol; Aiming=3,          // Use another pistol for parts (requires Aiming 3)
}
```

### Firearm with Cross-Repair

```
fixing Fix ShotgunSawnoff
{
   Require : ShotgunSawnoff,          // Repairs sawn-off shotguns
   Fixer : ShotgunSawnoff; Aiming=2,  // Use same gun type for parts
   Fixer : Shotgun; Aiming=2,         // Or use regular shotgun for parts
}
```

### Vehicle Part (Complex)

```
fixing Fix CarGasTank
{
   Require : CarGasTank,              // Repairs gas tanks
   GlobalItem : BlowTorch=2,          // Requires blowtorch (2 uses consumed)
   ConditionModifier : 1.2,           // 20% more effective repair

   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,      // Full sheet metal
   Fixer : SmallSheetMetal=2; Mechanics=2; MetalWelding=1, // Small pieces (2x)
}
```

### Musical Instrument

```
fixing Fix Banjo
{
   Require : Banjo,                   // Repairs banjos
   Fixer : DuctTape=2,                // Tape repair
   Fixer : Glue=2,                    // Glue repair
   Fixer : Scotchtape=4,              // Scotch tape (less effective)
}
```

### Spear (Crafted Weapon)

```
fixing Fix SpearBreadKnife
{
   Require : SpearBreadKnife,         // Repairs bread knife spears
   Fixer : DuctTape=1,                // Quick tape fix (1 use)
   Fixer : Scotchtape=2,              // Scotch tape (2 uses)
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

---

## Common Mistakes

### Wrong: Confusing Semicolon and Comma

```
fixing Fix MyCustomKnife
{
   Require : MyCustomKnife,
   Fixer : DuctTape=2, Woodwork=2,    // WRONG! Comma instead of semicolon
}
```

**Why it's wrong:** The syntax `Fixer : DuctTape=2, Woodwork=2` is incorrect. Commas end the Fixer line - they don't separate skills. The game will interpret this as "Fixer uses DuctTape with 2 uses" and ignore the `Woodwork=2` part entirely, resulting in a no-skill repair option.

**Right:**

```
fixing Fix MyCustomKnife
{
   Require : MyCustomKnife,           // Item being repaired
   Fixer : DuctTape=2; Woodwork=2,    // Semicolon separates item from skill
   Fixer : DuctTape=2,                // Or comma ends the line (no skill)
}
```

**Syntax rule:** Use **semicolon** to separate fixer item from skill requirements. Use **comma** to end the fixer line.

### Wrong: Wrong Require Syntax

```
fixing Fix MyCustomAxe
{
   Require = MyCustomAxe,             // WRONG! Uses = instead of :
   Fixer : DuctTape=2,
}
```

**Why it's wrong:** Fixing.txt uses different syntax than item scripts. The `Require` property must use colon `:` not equals `=`. This is unique to fixing.txt - item properties use `=`, but fixing properties use `:`.

**Right:**

```
fixing Fix MyCustomAxe
{
   Require : MyCustomAxe,             // Colon syntax for Require
   Fixer : DuctTape=2,                // Fixer uses item=uses format
   Fixer : Woodglue=2; Woodwork=2,    // Then semicolon for skills
}
```

**Syntax rule:** `Require` and `Fixer` both use colons `:` after the property name, but fixer items use `=` for the uses count.

### Wrong: Missing Module Reference

```
// In MyMod/media/scripts/my_fixing.txt
fixing Fix CustomWeapon                // WRONG! No module reference
{
   Require : CustomWeapon,
   Fixer : DuctTape=2,
}

// Item defined in different module:
module MyMod {
   item CustomWeapon { ... }
}
```

**Why it's wrong:** If your weapon is defined in a custom module (like `MyMod.CustomWeapon`), the fixing definition needs to reference the full module path. Without it, the game won't find your item.

**Right:**

```
// Option 1: Reference full module path
fixing Fix MyMod.CustomWeapon
{
   Require : MyMod.CustomWeapon,      // Full module path
   Fixer : DuctTape=2,                // Base module items don't need prefix
   Fixer : Woodglue=2; Woodwork=2,
}

// Option 2: Put fixing definition in same module
module MyMod
{
   item CustomWeapon { ... }

   fixing Fix CustomWeapon
   {
      Require : CustomWeapon,         // Same module, no prefix needed
      Fixer : Base.DuctTape=2,        // Reference Base module items
   }
}
```

**Module rule:** Reference items from other modules with `ModuleName.ItemName` format.

### Wrong: GlobalItem as Fixer

```
fixing Fix CarGasTank
{
   Require : CarGasTank,
   Fixer : BlowTorch=2; MetalWelding=1,  // WRONG! Blowtorch should be GlobalItem
}
```

**Why it's wrong:** Looking at vanilla vehicle part repairs, tools like blowtorches are `GlobalItem` not `Fixer`. The difference: Fixers are consumed (removed from inventory), while GlobalItems just lose durability. A blowtorch as a Fixer would be completely consumed, which doesn't make sense.

**Right:**

```
fixing Fix CarGasTank
{
   Require : CarGasTank,              // Item being repaired
   GlobalItem : BlowTorch=2,          // Tool (loses 2 uses, not consumed)
   ConditionModifier : 1.2,           // Makes repair 20% more effective

   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,  // Material consumed
}
```

**Rule:** Use `GlobalItem` for tools that should keep existing (just lose durability). Use `Fixer` for materials that get consumed.

---

## Try It Yourself

Let's create a repair definition for a custom machete using fixing.txt syntax.

### Step 1: Plan Your Repair Options

For a machete (bladed weapon), we want:
- Quick repair: Duct tape (no skill)
- Standard repair: Glue (no skill)
- Quality repair: Metal polish + maintenance skill

### Step 2: Create the Fixing Definition

Create `media/scripts/my_fixing.txt`:

```
module MyMod
{
   imports
   {
      Base                            // Import Base module for duct tape/glue
   }

   item CustomMachete
   {
      Type = Weapon,
      DisplayName = Custom Machete,
      MinDamage = 2,
      MaxDamage = 3,
      Categories = LongBlade,
      ConditionMax = 15,
   }

   fixing Fix CustomMachete
   {
      Require : CustomMachete,        // Item this definition repairs

      // Quality repair (best results)
      Fixer : Base.MetalFile=1; Maintenance=2,  // Metal file + skill

      // Standard repairs (good)
      Fixer : Base.Glue=2,            // Glue (2 uses)
      Fixer : Base.DuctTape=2,        // Duct tape (2 uses)

      // Emergency repair (less effective)
      Fixer : Base.Scotchtape=4,      // Scotch tape (4 uses, less effective)
   }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Spawn your Custom Machete (F key, type "Custom Machete")
3. Damage it by hitting zombies until condition drops
4. Right-click the damaged machete → "Repair Custom Machete"

**What You Should See:**
- Repair menu shows all available fixer options:
  - "Use Metal File" (if you have Maintenance 2)
  - "Use Glue" (if you have glue)
  - "Use Duct Tape" (if you have duct tape)
  - "Use Scotch Tape" (if you have scotch tape)
- Choosing a fixer consumes that item and repairs the machete
- Skilled repairs (Metal File) restore more condition than basic repairs

### Step 4: Understanding the Syntax

Let's break down the key syntax elements:

```
fixing Fix CustomMachete              // "Fix" + ItemName = fixing definition name
{
   Require : CustomMachete,           // COLON after Require

   // Syntax: Fixer : Item=Uses; Skill=Level,
   //                     ^     ^           ^
   //                  equals  semi      comma ends line

   Fixer : Base.MetalFile=1; Maintenance=2,
   //      └─ Module.Item ─┘  └─ Skill=Level ─┘

   Fixer : Base.DuctTape=2,           // No skill = anyone can use
   //                     ^
   //                  comma ends (no semicolon)
}
```

**Key syntax points:**
- `Require :` uses colon
- `Fixer :` uses colon
- Fixer item uses `=` for uses count
- Skills use `=` for level requirement
- Semicolon `;` separates item from skills
- Comma `,` ends the fixer line

### Why This Works

This fixing definition follows vanilla patterns:
- **Multiple repair options** give players flexibility (skilled vs quick)
- **Standard uses values** (1-2 for quality materials, 4 for weak materials)
- **Maintenance skill** makes sense for blade maintenance
- **Module.Item format** properly references Base module items
- **Correct syntax** uses colons for properties, semicolons for skill separation

---

## Creating Custom Repairs

For mods, create your own fixing definitions:

```
fixing Fix MyCustomWeapon
{
   Require : MyCustomWeapon,          // Your weapon

   // Skilled repair option (better results)
   Fixer : Woodglue=2; Woodwork=2,

   // Quick repair options (accessible to all)
   Fixer : DuctTape=2,
   Fixer : Glue=2,
}
```

Place in your mod's `media/scripts/` folder in a `.txt` file.

---

## Next Steps

Now that you understand fixing.txt anatomy:

1. See [Repair System Overview](repair-system-overview) to understand how repairs work in gameplay
2. Check [Repair Items Reference](repair-items-reference) for all vanilla fixer items
3. Read [Repair Formulas](repair-formulas) to understand repair effectiveness calculations
