---
id: items-ammunition-items
slug: ammunition-items
title: "Vanilla Ammunition Items - Complete Reference"
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - recipe
  - item
  - weapon
  - sound
  - crafting
  - vanilla
  - ammunition
  - items
excerpt: "Complete reference guide for all vanilla Project Zomboid ammunition items, including rounds, boxes, magazines, molds, and crafting materials. Learn how to create ammunition crafting recipes for your mods."
table_of_contents:
  - text: "What is Ammunition in Project Zomboid?"
    link: "#what-is-ammunition-in-project-zomboid"
  - text: "Quick Start: Most Used Ammunition"
    link: "#quick-start-most-used-ammunition"
  - text: "Creating Ammunition Recipes"
    link: "#creating-ammunition-recipes"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Complete Reference"
    link: "#complete-reference"
  - text: "Ammunition Rounds"
    link: "#ammunition-rounds"
  - text: "Ammunition Boxes"
    link: "#ammunition-boxes"
  - text: "Magazines (Clips)"
    link: "#magazines-clips"
  - text: "Bullet Molds"
    link: "#bullet-molds"
  - text: "Crafting Materials"
    link: "#crafting-materials"
  - text: "Complete Ammunition Categories"
    link: "#complete-ammunition-categories"
  - text: "Vanilla Crafting Recipes"
    link: "#vanilla-crafting-recipes"
  - text: "Ammunition by Weapon Type"
    link: "#ammunition-by-weapon-type"
  - text: "Item Spawning (Debug)"
    link: "#item-spawning-debug"
  - text: "Ammunition Scarcity & Balance"
    link: "#ammunition-scarcity-balance"
  - text: "Source Files"
    link: "#source-files"
next_steps:
  - title: "Enhanced Crafting Tables"
    path: /build-41/modding/recipes/enhanced-crafting-tables
  - title: "Workshop Mod Items"
    path: /build-41/modding/items/workshop-mod-items
  - title: "9mm Recipe Implementation"
    path: /build-41/modding/recipes/9mm-recipe-implementation
last_updated: 2026-01-28
---

# Vanilla Ammunition Items - Complete Reference

## What is Ammunition in Project Zomboid?

When you find a pistol in a house, press `R` to reload it, and see "9mm: 0/15" on screen, you're interacting with **ammunition items**—the bullets, shells, boxes, and magazines that make firearms work.

**Ammunition** in Project Zomboid consists of several item types:
- **Individual rounds** (like `Base.Bullets9mm`) - the actual bullets you load into guns
- **Ammunition boxes** (like `Base.Bullets9mmBox`) - containers holding 30-50 rounds
- **Magazines/Clips** (like `Base.9mmClip`) - detachable magazines that fit specific weapons
- **Bullet molds** (like `Base.9mmBulletsMold`) - tools for crafting ammunition
- **Gunpowder** (like `Base.GunPowder`) - crafting material for making bullets

Why does this matter for modding? Because if you want to create ammunition crafting recipes, add new calibers, or modify ammo availability, you need to know the exact item IDs, properties, and how vanilla ammo works.

This guide catalogs ALL vanilla ammunition items with their exact properties, so you can reference them in your recipes and understand how the ammunition system works.

---

## Quick Start: Most Used Ammunition

These are the ammunition types you'll use most often in modding:

| Ammo Type | Item ID | Box ID | Common Use | Weapon Examples |
|-----------|---------|--------|------------|-----------------|
| **9mm** | `Base.Bullets9mm` | `Base.Bullets9mmBox` | Most common pistol ammo | M9 Pistol |
| **Shotgun Shells** | `Base.ShotgunShells` | `Base.ShotgunShellsBox` | Common shotgun ammo | JS-2000, Shotgun |
| **.45 Auto** | `Base.Bullets45` | `Base.Bullets45Box` | Pistol ammo | M1911 Pistol |
| **.308** | `Base.308Bullets` | `Base.308Box` | Powerful rifle ammo | MSR788 Rifle |
| **5.56mm** | `Base.556Bullets` | `Base.556Box` | Military rifle ammo | M16 Assault Rifle |
| **.223** | `Base.223Bullets` | `Base.223Box` | Hunting rifle ammo | MSR700 Rifle |
| **.38 Special** | `Base.Bullets38` | `Base.Bullets38Box` | Revolver ammo | M36 Revolver |
| **.44 Magnum** | `Base.Bullets44` | `Base.Bullets44Box` | Powerful revolver ammo | D-E Pistol |

**Key Crafting Material:**
- **Gunpowder:** `Base.GunPowder` (drainable item, 10 uses per container)

**90% of ammo crafting mods use 9mm, Shotgun Shells, or .308** as examples. Start with these before exploring rarer calibers.

---

## Creating Ammunition Recipes

Creating an ammunition crafting recipe is straightforward. You need:
1. A **mold** for the bullet type (reusable tool)
2. **Metal** (usually ScrapMetal)
3. **Gunpowder** (drainable resource)
4. A **result** (the bullets you create)

### Version 1: Basic Ammunition Crafting

```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Reusable mold (not consumed)
    Base.ScrapMetal=1,  // 1 scrap metal (consumed)
    Base.GunPowder=5,  // 5 units of gunpowder (consumed)

    Result:Base.Bullets9mm=10,  // Creates 10 bullets
    Time:200.0,  // Takes 200 seconds (3m 20s)
}
```

**What happens:** You craft 10 bullets using basic materials. Works, but no sound or skill requirements.

---

### Version 2: With Sound and Category

```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Reusable mold
    Base.ScrapMetal=1,  // Metal for bullet casings
    Base.GunPowder=5,  // Gunpowder for propellant

    Result:Base.Bullets9mm=10,  // Creates 10 bullets
    Time:200.0,  // Crafting time
    Sound:Hammering,  // Hammering sound during crafting
    Category:Metalwork,  // Appears in Metalwork category
}
```

**What happens:** Same crafting, but now with hammering sounds and organized in the Metalwork category.

---

### Version 3: With Sound, Category, and Skill Requirements

```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Reusable mold
    keep Base.Hammer,  // Hammer tool (not consumed)
    Base.ScrapMetal=1,  // Metal for casings
    Base.GunPowder=5,  // Gunpowder for propellant

    Result:Base.Bullets9mm=10,  // Creates 10 bullets
    Time:200.0,  // Crafting time
    Sound:Hammering,  // Hammering sound
    Category:Metalwork,  // Metalwork category
    SkillRequired:MetalWelding=2,  // Requires Metalworking level 2
}
```

**What happens:** Full ammunition crafting with sound, category, skill requirement, and tools. Professional!

> **Key Takeaway:** Ammunition crafting uses `keep` for reusable molds/tools, consumes materials (metal + gunpowder), and produces multiple bullets per craft. Always use realistic ratios (1 metal + 5 gunpowder = 10 bullets is balanced).

---

## Common Mistakes

### Mistake 1: Wrong Item ID for Ammunition

❌ **Doesn't work:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Correct mold
    Base.ScrapMetal=1,  // Correct metal
    Base.GunPowder=5,  // Correct gunpowder

    Result:Base.9mmBullet=10,  // WRONG! It's Bullets9mm, not 9mmBullet
}
```

**What happens:** Recipe loads but creates nothing. The item ID doesn't exist.

✅ **Works:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Correct mold
    Base.ScrapMetal=1,  // Correct metal
    Base.GunPowder=5,  // Correct gunpowder

    Result:Base.Bullets9mm=10,  // CORRECT item ID
}
```

**Why:** Ammunition item IDs follow the pattern `Base.Bullets[caliber]` (e.g., `Bullets9mm`, `Bullets45`, `Bullets38`). Always check the [Complete Reference](#complete-reference) for exact IDs.

---

### Mistake 2: Not Using `keep` for Molds

❌ **Doesn't work well:**
```
recipe Craft 9mm Bullets
{
    Base.9mmBulletsMold,  // Mold is consumed (one-time use!)
    Base.ScrapMetal=1,  // Metal
    Base.GunPowder=5,  // Gunpowder

    Result:Base.Bullets9mm=10,  // Creates bullets
}
```

**What happens:** Works, but the mold is consumed after one use. Player needs a new mold every time they craft bullets (unrealistic and annoying).

✅ **Works properly:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // keep = mold is NOT consumed
    Base.ScrapMetal=1,  // Metal (consumed)
    Base.GunPowder=5,  // Gunpowder (consumed)

    Result:Base.Bullets9mm=10,  // Creates bullets
}
```

**Why:** Bullet molds are reusable tools in real life. Use `keep` to prevent them from being consumed, allowing players to craft bullets repeatedly with the same mold.

---

### Mistake 3: Wrong Gunpowder Amount

❌ **Unbalanced:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold
    Base.ScrapMetal=1,  // Metal
    Base.GunPowder=1,  // ONLY 1 unit of gunpowder?!

    Result:Base.Bullets9mm=50,  // Creates 50 bullets
}
```

**What happens:** Works, but wildly unbalanced. 1 gunpowder unit for 50 bullets is way too cheap. Players will have unlimited ammo.

✅ **Balanced:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold
    Base.ScrapMetal=1,  // Metal for casings
    Base.GunPowder=5,  // 5 units (half a container)

    Result:Base.Bullets9mm=10,  // Creates 10 bullets
}
```

**Why:** Gunpowder is a drainable item with 10 uses per container (`UseDelta = 0.1`). Using 5 units (half a container) for 10 bullets is balanced. Follow vanilla balance: 1 container = ~20 bullets.

---

### Mistake 4: Missing Bullet Mold Item

❌ **Doesn't work:**
```
recipe Craft 9mm Bullets
{
    // No mold specified!
    Base.ScrapMetal=1,  // Metal
    Base.GunPowder=5,  // Gunpowder

    Result:Base.Bullets9mm=10,  // Creates bullets
}
```

**What happens:** Recipe works but is unrealistic. Players can craft bullets without any tools, which breaks immersion.

✅ **Works properly:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold required
    keep Base.Hammer,  // Hammer for shaping
    Base.ScrapMetal=1,  // Metal
    Base.GunPowder=5,  // Gunpowder

    Result:Base.Bullets9mm=10,  // Creates bullets
}
```

**Why:** Bullet molds exist in the game specifically for this purpose. Always require the appropriate mold for the caliber you're crafting. It adds realism and forces players to find/craft molds first.

---

### Mistake 5: Using Boxes Instead of Individual Rounds

❌ **Confusing:**
```
recipe Craft 9mm Ammo Box
{
    keep Base.9mmBulletsMold,  // Mold
    Base.ScrapMetal=1,  // Metal
    Base.GunPowder=5,  // Gunpowder

    Result:Base.Bullets9mmBox=1,  // Creates a box containing 30 bullets
}
```

**What happens:** Works, but confusing. You used enough materials for 10 bullets but got a box with 30 bullets inside. Unbalanced.

✅ **Works properly:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold
    Base.ScrapMetal=1,  // Metal
    Base.GunPowder=5,  // Gunpowder

    Result:Base.Bullets9mm=10,  // Creates 10 individual bullets
}

// Separate recipe for packing bullets into boxes
recipe Place 9mm Bullets in Box
{
    Base.Bullets9mm=30,  // 30 individual bullets

    Result:Base.Bullets9mmBox=1,  // Creates 1 box
    Time:15.0,  // Quick packing
}
```

**Why:** Craft individual bullets (`Base.Bullets9mm`), not boxes (`Base.Bullets9mmBox`). Boxes are containers for organizing bullets, not the bullets themselves. Players can pack loose bullets into boxes using a separate recipe (vanilla provides these).

---

## Try It Yourself

Let's create a working ammunition crafting mod to see how it all works together.

### Step 1: Create Test Mod

```
Zomboid/mods/AmmoTest/
├── mod.info
└── media/
    └── scripts/
        └── recipes_ammo.txt
```

**mod.info:**
```
name=Ammo Crafting Test
id=AmmoTest
description=Testing ammunition crafting recipes
```

---

### Step 2: Create Ammunition Recipes

**recipes_ammo.txt:**
```
module AmmoTest
{
    imports { Base }  // Import vanilla items

    // Recipe 1: Craft 9mm bullets (common, easy)
    recipe Craft 9mm Bullets
    {
        keep Base.9mmBulletsMold,  // Reusable 9mm mold (find or craft this)
        keep Base.Hammer,  // Hammer for shaping casings
        Base.ScrapMetal=1,  // 1 scrap metal for bullet casings
        Base.GunPowder=5,  // 5 units of gunpowder (half a jar)

        Result:Base.Bullets9mm=10,  // Creates 10 bullets
        Time:200.0,  // Takes 3 minutes 20 seconds
        Sound:Hammering,  // Hammering sound during crafting
        Category:Metalwork,  // Appears in Metalwork category
        SkillRequired:MetalWelding=2,  // Requires Metalworking level 2
    }

    // Recipe 2: Craft shotgun shells (common)
    recipe Craft Shotgun Shells
    {
        keep Base.ShotgunShellsMold,  // Reusable shotgun shell mold
        keep Base.Hammer,  // Hammer
        Base.ScrapMetal=2,  // 2 scrap metal (shells are bigger)
        Base.GunPowder=8,  // 8 units of gunpowder

        Result:Base.ShotgunShells=5,  // Creates 5 shells
        Time:250.0,  // Takes 4 minutes 10 seconds
        Sound:Hammering,  // Hammering sound
        Category:Metalwork,  // Metalwork category
        SkillRequired:MetalWelding=3,  // Requires Metalworking level 3
    }

    // Recipe 3: Craft .308 bullets (powerful, harder)
    recipe Craft .308 Bullets
    {
        keep Base.308BulletsMold,  // Reusable .308 mold
        keep Base.Hammer,  // Hammer
        Base.ScrapMetal=3,  // 3 scrap metal (larger bullets)
        Base.GunPowder=10,  // Full jar of gunpowder

        Result:Base.308Bullets=5,  // Creates only 5 bullets
        Time:400.0,  // Takes 6 minutes 40 seconds
        Sound:Hammering,  // Hammering sound
        Category:Metalwork,  // Metalwork category
        SkillRequired:MetalWelding=5,  // Requires Metalworking level 5 (advanced)
    }

    // Recipe 4: Extract gunpowder from bullets (deconstruction)
    recipe Extract Gunpowder from 9mm
    {
        Base.Bullets9mm=10,  // Consume 10 bullets
        keep Base.Hammer,  // Hammer to break them apart

        Result:Base.GunPowder=3,  // Get 3 units of gunpowder back
        Result:Base.ScrapMetal=1,  // Get 1 scrap metal back
        Time:100.0,  // Takes 1 minute 40 seconds
        Sound:BreakMetalItem,  // Metal breaking sound
        Category:Metalwork,  // Metalwork category
    }
}
```

---

### Step 3: Test the Recipes

1. **Enable the mod** in Mods menu
2. **Start a game**
3. **Spawn required items** using debug mode:
   - Press `Ctrl + Z` (toggle debug mode)
   - Press `I` (item spawner)
   - Spawn:
     - `Base.9mmBulletsMold`
     - `Base.Hammer`
     - `Base.ScrapMetal` (quantity: 10)
     - `Base.GunPowder` (quantity: 5)
4. **Open crafting menu** (B key)
5. **Craft 9mm bullets** using the recipe
6. **Check your inventory** - you should have 10 new 9mm bullets

**What to notice:**
- The mold and hammer are NOT consumed (because of `keep`)
- ScrapMetal and GunPowder ARE consumed
- Crafting takes 200 seconds with hammering sounds
- You can craft again with the same mold

---

### Step 4: Test Different Calibers

Try crafting different ammunition types:
- **9mm:** Easy, fast, low materials
- **Shotgun Shells:** Medium difficulty, more materials
- **.308:** Hard, high materials, slow crafting

Notice how more powerful ammunition requires:
- More metal
- More gunpowder
- Higher skill levels
- Longer crafting times
- Produces fewer bullets

This creates **balance** - common ammo is easy to craft, rare/powerful ammo is expensive and time-consuming.

---

### Step 5: Test Gunpowder Extraction

Spawn 50 9mm bullets, then use the extraction recipe to break them down:
- 10 bullets → 3 gunpowder + 1 scrap metal

This gives players a way to recycle ammunition they don't need, but at a loss (you get less back than you put in, encouraging efficient ammo use).

---

## Complete Reference

Below is the comprehensive catalog of ALL vanilla ammunition items. Use this as a reference when creating ammunition-related recipes.

---

## Ammunition Rounds

**Source File:** `ProjectZomboid/media/scripts/items.txt`, `newitems.txt`

### Individual Rounds

| Name              | Item ID              | Weight | Count | Metal Value | Usage |
|-------------------|----------------------|--------|-------|-------------|-------|
| **9mm Round**     | `Base.Bullets9mm`    |  0.01  |   1   |      1      | Most common pistol ammo |
| **Shotgun Shells**| `Base.ShotgunShells` |  0.05  |   1   |      1      | Common shotgun ammo |
| **.45 Auto Round**| `Base.Bullets45`     |  0.04  |   1   |      1      | Pistol ammo (M1911) |
| **.38 Special**   | `Base.Bullets38`     |  0.02  |   1   |      1      | Revolver ammo |
| **.44 Magnum**    | `Base.Bullets44`     |  0.04  |   1   |      1      | Powerful revolver ammo |
| **.223 Round**    | `Base.223Bullets`    |  0.02  |   1   |      1      | Hunting rifle ammo |
| **.308 Round**    | `Base.308Bullets`    |  0.02  |   1   |      1      | Powerful rifle ammo |
| **5.56mm Round**  | `Base.556Bullets`    |  0.03  |   1   |      1      | Military rifle ammo |

**Key Properties:**
- **Weight:** Individual bullets are very light (0.01-0.05)
- **MetalValue:** All bullets have MetalValue=1 (can be smelted for 1 metal)
- **Count:** Always 1 (individual rounds, not stacked automatically)

---

### Usage in Recipes

**Consuming ammunition in recipes:**
```
recipe Extract Gunpowder from 9mm
{
    Base.Bullets9mm=10,  // Consume 10 bullets

    Result:Base.GunPowder=3,  // Get gunpowder back
    Result:Base.ScrapMetal=1,  // Get metal back
    Time:100.0,  // Crafting time
}
```

**Creating ammunition in recipes:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Reusable mold
    Base.ScrapMetal=1,  // Metal consumed
    Base.GunPowder=5,  // Gunpowder consumed

    Result:Base.Bullets9mm=10,  // Creates 10 bullets
    Time:200.0,  // Crafting time
}
```

---

## Ammunition Boxes

**Source File:** `ProjectZomboid/media/scripts/items.txt`

### Box Containers

Ammunition boxes are containers that hold multiple rounds. Opening a box gives you loose rounds.

| Name | Item ID | Weight | Contents | Count per Box |
|------|---------|--------|----------|---------------|
| **Box of 9mm Rounds** | `Base.Bullets9mmBox` | 0.2 | 9mm bullets | 30 |
| **Box of Shotgun Shells** | `Base.ShotgunShellsBox` | 0.9 | Shotgun shells | 20 |
| **Box of .45 Auto Rounds** | `Base.Bullets45Box` | 1.0 | .45 Auto bullets | 30 |
| **Box of .38 Special Rounds** | `Base.Bullets38Box` | 0.35 | .38 Special bullets | 50 |
| **Box of .44 Magnum Rounds** | `Base.Bullets44Box` | 0.38 | .44 Magnum bullets | 30 |
| **Box of .223 Rounds** | `Base.223Box` | 0.6 | .223 bullets | 40 |
| **Box of .308 Rounds** | `Base.308Box` | 0.6 | .308 bullets | 40 |
| **Box of 5.56mm Rounds** | `Base.556Box` | 1.2 | 5.56mm bullets | 30 |

**When to use:**
- **Boxes** are for inventory organization (lighter than carrying 30 loose bullets)
- **Individual rounds** are what actually load into guns
- Vanilla provides recipes to open/pack boxes

---

### Box Recipes (Vanilla)

**Opening a box (unpack):**
```
recipe Open Box of 9mm Bullets
{
    Bullets9mmBox,  // Consume the box

    Result:Bullets9mm=30,  // Get 30 loose rounds
    Sound:BoxOfRoundsOpenOne,  // Box opening sound
    Time:15.0,  // Quick action (15 seconds)
}
```

**Packing a box (pack):**
```
recipe Place 9mm Bullets in Box
{
    Bullets9mm=30,  // Consume 30 loose rounds

    Result:Bullets9mmBox,  // Get 1 box
    Sound:BoxOfRoundsOpenOne,  // Packing sound
    Time:15.0,  // Quick action
}
```

**Note:** Vanilla provides these recipes for all ammunition types. You don't need to create them in mods unless you're adding new calibers.

---

## Magazines (Clips)

**Source File:** `ProjectZomboid/media/scripts/items_weapons.txt`

### Magazine Items

Magazines (clips) are weapon-specific items that hold ammunition and attach to firearms.

| Name | Item ID | Weight | Weapon | Ammo Type | Capacity |
|------|---------|--------|--------|-----------|----------|
| **M9 Magazine** | `Base.9mmClip` | 0.2 | M9 Pistol | 9mm | 15 |
| **M1911 Magazine** | `Base.45Clip` | 0.2 | M1911 Pistol | .45 Auto | 7 |
| **D-E Magazine** | `Base.44Clip` | 0.2 | D-E Pistol | .44 Magnum | 8 |
| **MSR700 Magazine** | `Base.223Clip` | 0.2 | MSR700 Rifle | .223 | 3 |
| **MSR788 Magazine** | `Base.308Clip` | 0.2 | MSR788 Rifle | .308 | 3 |
| **M16 Magazine** | `Base.556Clip` | 0.2 | M16 Assault Rifle | 5.56mm | 30 |
| **M14 Magazine** | `Base.M14Clip` | 0.2 | M14 Rifle | .308 | 20 |

---

### Usage Notes

**How magazines work:**
1. Player finds empty magazine
2. Player loads magazine with appropriate ammunition (e.g., 9mm into 9mmClip)
3. Player inserts loaded magazine into weapon
4. Player can carry multiple magazines (faster reloading than loading individual rounds)

**For modders:**
- Magazines are weapon-specific (can't use 9mmClip in M1911)
- Each magazine has a `MaxCapacity` property defining how many rounds it holds
- Players can reload empty magazines with individual rounds
- Magazines are NOT consumed when loaded/unloaded

**Example recipe (hypothetical - crafting magazines):**
```
recipe Craft 9mm Magazine
{
    Base.SheetMetal=1,  // Metal for magazine body
    Base.Spring=1,  // Spring for feeding mechanism
    keep Base.Hammer,  // Hammer tool

    Result:Base.9mmClip=1,  // Creates 1 empty magazine
    Time:300.0,  // Takes 5 minutes
    SkillRequired:MetalWelding=4,  // Requires skill
}
```

---

## Bullet Molds

**Source File:** `ProjectZomboid/media/scripts/newitems.txt`

### Mold Items (Future Feature)

Bullet molds are tools for crafting ammunition. They are marked as "Future" in vanilla but exist in game files and can be used in mods.

| Icon | Name | Item ID | Weight | Metal Value | Status |
|------|------|---------|--------|-------------|--------|
| | **9mm Bullet Mold** | `Base.9mmBulletsMold` | 0.5 | 15 | Future |
| | **.223 Bullet Mold** | `Base.223BulletsMold` | 0.5 | 15 | Future |
| | **.308 Bullet Mold** | `Base.308BulletsMold` | 0.5 | 15 | Future |
| | **Shotgun Shells Mold** | `Base.ShotgunShellsMold` | 0.5 | 15 | Future |

**Note:** "Future" means TIS plans to implement ammo crafting later. The items exist now and can be spawned/used in mods. They just don't spawn naturally in vanilla loot tables yet.

---

### Mold Properties

**Example mold definition (9mm):**
```
item 9mmBulletsMold
{
    DisplayCategory = Ammo,  // Category: Ammo
    Weight = 0.5,  // Weighs 0.5 units
    Type = Normal,  // Normal item (not drainable/repairable)
    DisplayName = 9mm Bullets Mold,  // Display name
    Icon = BulletMold,  // Icon texture
    MetalValue = 15,  // Worth 15 metal when smelted
    WorldStaticModel = ShotGunShellsMold_Ground,  // 3D model on ground
}
```

**Key properties:**
- **MetalValue = 15:** Can be smelted for 15 metal (high value tool)
- **Weight = 0.5:** Heavier than bullets (0.01-0.05) but lighter than boxes
- **Type = Normal:** Regular item (not stackable, not drainable)

---

### Using Molds in Recipes

**Always use `keep` with molds** (they're reusable tools):
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // NOT consumed (keep)
    keep Base.Hammer,  // Tool (keep)
    Base.ScrapMetal=2,  // Consumed material
    Base.GunPowder=10,  // Consumed material

    Result:Base.Bullets9mm=10,  // Creates bullets
    Time:300.0,  // Crafting time
    Sound:Hammering,  // Hammering sound
    Category:Metalwork,  // Category
    SkillRequired:MetalWelding=3,  // Skill requirement
}
```

**Why `keep`?**
- Molds are expensive to craft/find (MetalValue=15)
- Real-life bullet molds are reusable indefinitely
- If molds were consumed, ammo crafting would be unsustainable

---

## Crafting Materials

### GunPowder (CRITICAL)

**Item ID:** `Base.GunPowder`

**Full Definition:**
```
item GunPowder
{
    DisplayCategory = Material,  // Category: Material
    Weight = 0.1,  // Full weight: 0.1
    Type = Drainable,  // DRAINABLE (has uses, not single-use)
    UseDelta = 0.1,  // 10% per use (10 uses total)
    UseWhileEquipped = FALSE,  // Can't use while equipped
    DisplayName = Gunpowder,  // Display name
    Icon = GunpowderJar,  // Icon texture
    WeightEmpty = 0.01,  // Empty weight: 0.01
    WorldStaticModel = GunpowderJar,  // 3D model
}
```

**Key Properties:**
- **Type = Drainable:** Not a single-use item. Has multiple uses.
- **UseDelta = 0.1:** Each use consumes 10% of the container
- **Uses per container:** 10 (100% ÷ 10% = 10 uses)
- **Weight Full:** 0.1
- **Weight Empty:** 0.01 (empty containers weigh less)

**How UseDelta works:**
- If a recipe requires `Base.GunPowder=5`, it consumes 50% of one container (5 × 10% = 50%)
- If a recipe requires `Base.GunPowder=10`, it consumes one full container (10 × 10% = 100%)
- If a recipe requires `Base.GunPowder=3`, it consumes 30% of one container

---

### Usage in Recipes

**Consuming gunpowder (drainable):**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold (not consumed)
    Base.ScrapMetal=1,  // Metal (consumed completely)
    Base.GunPowder=5,  // Gunpowder (consumes 50% of 1 jar)

    Result:Base.Bullets9mm=10,  // Creates 10 bullets
    Time:200.0,  // Crafting time
}
```

**Why 5 units?**
- 5 units = 50% of one jar (UseDelta = 0.1, so 5 × 0.1 = 0.5 = 50%)
- One full jar (10 units) can make ~20 bullets
- This creates realistic scarcity (gunpowder is valuable)

**Balance suggestion:**
- **Common ammo (9mm):** 5 gunpowder = 10 bullets
- **Powerful ammo (.308):** 10 gunpowder = 5 bullets
- **Military ammo (5.56mm):** 8 gunpowder = 10 bullets

---

### Other Related Materials

| Name | Item ID | Weight | Use | Metal Value |
|------|---------|--------|-----|-------------|
| **Scrap Metal** | `Base.ScrapMetal` | 0.1 | Common metal source | 1 |
| **Sheet Metal** | `Base.SheetMetal` | 0.3 | Crafted metal sheets | 3 |
| **Metal Bar** | `Base.MetalBar` | 1.0 | Refined metal | 10 |
| **Iron Ingot** | `Base.IronIngot` | 1.0 | Smelted metal | 10 |
| **Spring** | `Base.Spring` | 0.05 | Magazine springs | 1 |

**Usage in ammunition recipes:**
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold
    Base.ScrapMetal=1,  // Cheapest metal option
    Base.GunPowder=5,  // Gunpowder

    Result:Base.Bullets9mm=10,  // Bullets
}

// OR use Sheet Metal for better quality (hypothetical)
recipe Craft .308 Bullets (High Quality)
{
    keep Base.308BulletsMold,  // Mold
    Base.SheetMetal=1,  // Better metal (more expensive)
    Base.GunPowder=10,  // More gunpowder

    Result:Base.308Bullets=8,  // More bullets
}
```

---

## Complete Ammunition Categories

### Handgun Ammunition

| Caliber | Item ID | Weight | Weapon Examples | Rarity | Power |
|---------|---------|--------|-----------------|--------|-------|
| **9mm** | `Base.Bullets9mm` | 0.01 | M9 Pistol | Very Common | Low |
| **.45 Auto** | `Base.Bullets45` | 0.04 | M1911 Pistol, M625 Revolver | Common | Medium |
| **.38 Special** | `Base.Bullets38` | 0.02 | M36 Revolver | Common | Low |
| **.44 Magnum** | `Base.Bullets44` | 0.04 | D-E Pistol | Rare | High |

**Usage notes:**
- **9mm:** Most common pistol ammo. Found everywhere (police, civilians). Low damage.
- **.45 Auto:** Common military/police ammo. Medium damage, heavier than 9mm.
- **.38 Special:** Police revolver ammo. Similar to 9mm in power.
- **.44 Magnum:** Rare, powerful revolver ammo. High damage, loud.

---

### Rifle Ammunition

| Caliber | Item ID | Weight | Weapon Examples | Rarity | Power |
|---------|---------|--------|-----------------|--------|-------|
| **5.56mm** | `Base.556Bullets` | 0.03 | M16 Assault Rifle | Uncommon | High |
| **.223** | `Base.223Bullets` | 0.02 | MSR700 Rifle | Uncommon | Medium |
| **.308** | `Base.308Bullets` | 0.02 | MSR788 Rifle, M14 Rifle | Uncommon | Very High |

**Usage notes:**
- **5.56mm:** Military rifle ammo. Used in M16. High damage, accurate.
- **.223:** Hunting rifle ammo. Similar to 5.56mm but civilian version.
- **.308:** Most powerful rifle ammo. High damage, high accuracy, rare.

---

### Shotgun Ammunition

| Caliber | Item ID | Weight | Weapon Examples | Rarity | Power |
|---------|---------|--------|-----------------|--------|-------|
| **Shotgun Shells** | `Base.ShotgunShells` | 0.05 | All shotguns (JS-2000, Shotgun, Sawed-off) | Common | High (close range) |

**Usage notes:**
- **Shotgun Shells:** Very common (hunting/home defense). High damage at close range, terrible at long range. Loud.

---

## Vanilla Crafting Recipes

### Disassemble Ammo Box

**Purpose:** Open a box to get individual rounds.

```
recipe Open Box of 9mm Bullets
{
    Bullets9mmBox,  // Consume the box (lose the container)

    Result:Bullets9mm=30,  // Get 30 individual bullets
    Sound:BoxOfRoundsOpenOne,  // Box opening sound
    Time:15.0,  // Takes 15 seconds
}
```

**Exists for all ammunition types:**
- `Open Box of 9mm Bullets`
- `Open Box of Shotgun Shells`
- `Open Box of .223 Bullets`
- `Open Box of .308 Bullets`
- `Open Box of .45 Auto Bullets`
- `Open Box of .38 Special Bullets`
- `Open Box of .44 Magnum Bullets`
- `Open Box of 5.56mm Bullets`

---

### Assemble Ammo Box

**Purpose:** Pack individual rounds into a box for easier storage.

```
recipe Place 9mm Bullets in Box
{
    Bullets9mm=30,  // Consume 30 individual bullets

    Result:Bullets9mmBox,  // Get 1 box (container created)
    Sound:BoxOfRoundsOpenOne,  // Packing sound
    Time:15.0,  // Takes 15 seconds
}
```

**Exists for all ammunition types** (same list as disassemble).

**Why vanilla provides these:**
- Boxes are lighter than carrying 30 loose bullets (inventory weight optimization)
- Boxes take less inventory space
- Organizing ammo is part of survival gameplay

---

### Extract Gunpowder (Hypothetical)

**Purpose:** Break down bullets to recover gunpowder and metal.

```
recipe Extract GunPowder from 9mm Bullets
{
    Base.Bullets9mm=10,  // Consume 10 bullets
    keep Base.Hammer,  // Hammer to break them apart

    Result:Base.GunPowder=3,  // Get 3 units of gunpowder (30%)
    Result:Base.ScrapMetal=1,  // Get 1 scrap metal
    Time:100.0,  // Takes 1 minute 40 seconds
    Sound:BreakMetalItem,  // Metal breaking sound
    Category:Metalwork,  // Metalwork category
}
```

**Note:** This recipe is NOT in vanilla. It's an example of a mod recipe for recycling ammunition. You get back less than you put in (loss) to balance hoarding.

---

## Ammunition by Weapon Type

### Pistols

| Weapon | Display Name | Ammo Type | Item ID | Magazine | Magazine ID | Capacity | Reload Type |
|--------|--------------|-----------|---------|----------|-------------|----------|-------------|
| **M9 Pistol** | M9 Pistol | 9mm | `Base.Bullets9mm` | M9 Magazine | `Base.9mmClip` | 15 | Magazine |
| **M1911 Pistol** | M1911 Pistol | .45 Auto | `Base.Bullets45` | M1911 Magazine | `Base.45Clip` | 7 | Magazine |
| **D-E Pistol** | Desert Eagle | .44 Magnum | `Base.Bullets44` | D-E Magazine | `Base.44Clip` | 8 | Magazine |
| **M36 Revolver** | M36 Revolver | .38 Special | `Base.Bullets38` | N/A (revolver) | N/A | 6 | Manual |
| **M625 Revolver** | M625 Revolver | .45 Auto | `Base.Bullets45` | N/A (revolver) | N/A | 6 | Manual |

**Reload types:**
- **Magazine:** Weapon uses detachable magazines (fast reload)
- **Manual:** Revolver loads individual rounds (slow reload)

---

### Rifles

| Weapon | Display Name | Ammo Type | Item ID | Magazine | Magazine ID | Capacity | Reload Type |
|--------|--------------|-----------|---------|----------|-------------|----------|-------------|
| **MSR700 Rifle** | MSR700 Rifle | .223 | `Base.223Bullets` | MSR700 Magazine | `Base.223Clip` | 3 | Magazine |
| **MSR788 Rifle** | MSR788 Rifle | .308 | `Base.308Bullets` | MSR788 Magazine | `Base.308Clip` | 3 | Magazine |
| **M16 Assault Rifle** | M16 Assault Rifle | 5.56mm | `Base.556Bullets` | M16 Magazine | `Base.556Clip` | 30 | Magazine |
| **M14 Rifle** | M14 Rifle | .308 | `Base.308Bullets` | M14 Magazine | `Base.M14Clip` | 20 | Magazine |

**Note:** Hunting rifles (MSR700/MSR788) have small 3-round magazines (bolt-action). Assault rifles (M16/M14) have larger 20-30 round magazines.

---

### Shotguns

| Weapon | Display Name | Ammo Type | Item ID | Magazine | Capacity | Reload Type |
|--------|--------------|-----------|---------|----------|----------|-------------|
| **Shotgun** | Shotgun | Shotgun Shells | `Base.ShotgunShells` | N/A | 2-6 | Manual |
| **Sawed-off Shotgun** | Sawed-off Shotgun | Shotgun Shells | `Base.ShotgunShells` | N/A | 2 | Manual |
| **Double Barrel Shotgun** | Double Barrel Shotgun | Shotgun Shells | `Base.ShotgunShells` | N/A | 2 | Manual |
| **JS-2000 Shotgun** | JS-2000 Shotgun | Shotgun Shells | `Base.ShotgunShells` | N/A | 6 | Manual |

**Note:** Shotguns don't use magazines in vanilla. All shotguns load individual shells manually.

---

## Item Spawning (Debug)

### Spawn Individual Rounds

Use these item IDs in debug mode (`Ctrl + Z`, then `I` for item spawner):

```
Base.Bullets9mm          // 9mm bullets
Base.ShotgunShells       // Shotgun shells
Base.Bullets45           // .45 Auto bullets
Base.Bullets38           // .38 Special bullets
Base.Bullets44           // .44 Magnum bullets
Base.223Bullets          // .223 bullets
Base.308Bullets          // .308 bullets
Base.556Bullets          // 5.56mm bullets
```

---

### Spawn Boxes

```
Base.Bullets9mmBox       // Box of 9mm (30 rounds)
Base.ShotgunShellsBox    // Box of shotgun shells (20 shells)
Base.Bullets45Box        // Box of .45 Auto (30 rounds)
Base.Bullets38Box        // Box of .38 Special (50 rounds)
Base.Bullets44Box        // Box of .44 Magnum (30 rounds)
Base.223Box              // Box of .223 (40 rounds)
Base.308Box              // Box of .308 (40 rounds)
Base.556Box              // Box of 5.56mm (30 rounds)
```

---

### Spawn Molds

```
Base.9mmBulletsMold      // 9mm bullet mold
Base.ShotgunShellsMold   // Shotgun shell mold
Base.223BulletsMold      // .223 bullet mold
Base.308BulletsMold      // .308 bullet mold
```

**Note:** Molds don't spawn naturally in vanilla loot. Use debug mode or add them to loot tables in your mod.

---

### Spawn Crafting Materials

```
Base.GunPowder           // Gunpowder (10 uses)
Base.ScrapMetal          // Scrap metal
Base.SheetMetal          // Sheet metal
Base.MetalBar            // Metal bar
Base.IronIngot           // Iron ingot
Base.Spring              // Spring
```

---

## Ammunition Scarcity & Balance

### Rarity (Most to Least Common)

**In vanilla loot spawns:**

1. **9mm** - Very Common (police, civilians, gun stores)
2. **Shotgun Shells** - Common (hunting stores, homes, farms)
3. **.38 Special** - Common (police stations, gun stores)
4. **5.56mm** - Uncommon (military, police, rare gun stores)
5. **.45 Auto** - Uncommon (police, gun stores)
6. **.308** - Uncommon (hunting stores, gun stores)
7. **.223** - Uncommon (hunting stores)
8. **.44 Magnum** - Rare (gun stores, rare finds)

**Why this matters for modding:**
- If you add ammo crafting, common ammo (9mm, shotgun) should be easy to craft
- Rare/powerful ammo (.44, .308) should require more materials/time/skill

---

### Crafting Balance Suggestions

When creating bullet crafting recipes, follow these guidelines:

#### Common Ammo (9mm, Shotgun Shells)
```
recipe Craft 9mm Bullets
{
    keep Base.9mmBulletsMold,  // Mold
    Base.ScrapMetal=1,  // 1 metal
    Base.GunPowder=5,  // Half a jar (50%)

    Result:Base.Bullets9mm=10,  // 10 bullets
    Time:200.0,  // 3 minutes 20 seconds
    SkillRequired:MetalWelding=2,  // Low skill
}
```

**Balance:**
- Low materials (1 metal, 5 gunpowder)
- Produces more bullets (10)
- Low skill requirement (level 2)
- Faster crafting (200 seconds)

---

#### Powerful Ammo (.44 Magnum, .308)
```
recipe Craft .308 Bullets
{
    keep Base.308BulletsMold,  // Mold
    keep Base.Hammer,  // Hammer required
    Base.ScrapMetal=3,  // 3 metal (3x more)
    Base.GunPowder=10,  // Full jar (2x more)

    Result:Base.308Bullets=5,  // Only 5 bullets (half as many)
    Time:400.0,  // 6 minutes 40 seconds (2x slower)
    SkillRequired:MetalWelding=5,  // High skill (level 5)
}
```

**Balance:**
- High materials (3 metal, 10 gunpowder)
- Produces fewer bullets (5)
- High skill requirement (level 5)
- Slower crafting (400 seconds)

---

#### Military Ammo (5.56mm)
```
recipe Craft 5.56mm Bullets
{
    keep Base.556BulletsMold,  // Mold
    keep Base.Hammer,  // Hammer
    Base.ScrapMetal=2,  // Medium metal
    Base.GunPowder=8,  // 80% of a jar

    Result:Base.556Bullets=10,  // 10 bullets
    Time:300.0,  // 5 minutes
    SkillRequired:MetalWelding=4,  // High skill
}
```

**Balance:**
- Medium materials (2 metal, 8 gunpowder)
- Produces standard amount (10)
- High skill requirement (level 4)
- Medium crafting time (300 seconds)

---

### Material Ratios (Summary)

| Ammo Type | Metal | Gunpowder | Result | Skill | Time | Notes |
|-----------|-------|-----------|--------|-------|------|-------|
| **9mm** | 1 | 5 | 10 | 2 | 200s | Easy, cheap, fast |
| **Shotgun** | 2 | 8 | 5 | 3 | 250s | Medium difficulty |
| **5.56mm** | 2 | 8 | 10 | 4 | 300s | Military grade |
| **.308** | 3 | 10 | 5 | 5 | 400s | Hard, expensive, slow |
| **.44 Magnum** | 3 | 10 | 5 | 5 | 400s | Rare, powerful |

**Crafting philosophy:**
- Common/weak ammo = Easy to craft, plentiful
- Rare/powerful ammo = Hard to craft, scarce
- This maintains vanilla balance where powerful weapons are limited by ammunition availability

---

## Source Files

**Vanilla game files:**
- **Items:** `ProjectZomboid/media/scripts/items.txt`
- **Weapons:** `ProjectZomboid/media/scripts/items_weapons.txt`
- **New Items:** `ProjectZomboid/media/scripts/newitems.txt`
- **Recipes:** `ProjectZomboid/media/scripts/recipes.txt`

**External resources:**
- **PZ Wiki:** https://pzwiki.net/w/index.php?oldid=384163
- **TIS Official Docs:** https://theindiestone.com/forums/index.php?/topic/1428-modding-guide/

**Research Date:** 2025-11-06 (updated 2026-01-28)

---

## Key Takeaways

1. **Ammunition has multiple item types** - Individual rounds, boxes, magazines, molds, and gunpowder

2. **Use exact item IDs** - `Base.Bullets9mm` NOT `Base.9mmBullet` or `Base.9mmBullets`

3. **Always use `keep` for molds** - Molds are reusable tools, not consumed materials

4. **Gunpowder is drainable** - UseDelta=0.1 means 10 uses per container. Plan recipes accordingly.

5. **Follow vanilla balance** - Common ammo (9mm) = easy to craft. Powerful ammo (.308) = hard to craft.

6. **Boxes vs. Individual Rounds** - Craft individual rounds, then pack them into boxes using vanilla recipes

7. **Magazines are weapon-specific** - Can't use 9mmClip in M1911 (requires 45Clip)

8. **Scarcity creates balance** - Ammo crafting should be costly (materials + time + skill) to maintain vanilla balance

9. **Test your ratios** - 1 metal + 5 gunpowder = 10 bullets is a good baseline for common ammo

10. **Reference this document** - Use Ctrl+F to search for specific ammunition types when creating recipes

---

**What's next?** Now that you know how ammunition works, check out [First Item File](../first-item-file) to learn how to create custom items, or [Item Recipe Connection](../item-recipe-connection) to understand how items and recipes interact.

---

**Credits:**

This documentation compiled from:
- Project Zomboid Build 41+ game files
- TIS official modding documentation
- Community modding resources
- Direct file analysis of vanilla game data

**License:**

This documentation is for educational and modding reference purposes.
Project Zomboid is © The Indie Stone. All rights reserved.
