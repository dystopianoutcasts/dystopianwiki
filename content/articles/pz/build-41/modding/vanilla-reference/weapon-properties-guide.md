---
id: weapon-properties-guide
slug: weapon-properties-guide
title: "Understanding Weapon Properties"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: intermediate
tags:
  - weapons
  - properties
  - guide
  - combat
  - skills
excerpt: "Deep dive into what each weapon property actually does in gameplay - from how Categories connect to skills, to how ConditionLowerChanceOneIn really works."
related_articles:
  - vanilla-weapons-reference
  - weapon-repair-system-overview
  - item-anatomy
last_updated: 2026-01-18
---

# Understanding Weapon Properties

## Introduction

You've copied a weapon definition from the vanilla files and you're staring at properties like `ConditionLowerChanceOneIn = 30`. What does that number mean? Or you set `Categories = Blunt` and wonder why your weapon isn't training the Blunt skill. Or maybe you're confused why `MinDamage = 1.0` feels different from what you expected in combat.

If you're feeling lost trying to understand what weapon properties actually **do**, you're not alone. Weapon definitions have 30+ possible properties spanning damage, durability, skills, animations, sounds, and more. The names don't always explain the behavior (looking at you, `ConditionLowerChanceOneIn`), and the numbers can be confusing (is 1.0 damage a lot or a little?).

Here's the good news: once you understand what these properties actually do in gameplay, creating balanced weapons becomes straightforward. I'll explain each property category, show you what the numbers mean in practice, and walk you through how everything works together.

## Overview

This guide explains what each weapon property actually **does** in gameplay - not just what it's called, but how it affects combat, skills, and durability.

## Categories and Skills

The `Categories` property is the **most important** property for weapons because it determines which skill the weapon trains.

### How Categories Work

When you hit a zombie with a weapon, the game checks the weapon's categories and awards XP to the matching skill:

```lua
-- From XpUpdate.lua (vanilla code)
if weapon:getScriptItem():getCategories():contains("Axe") then
    owner:getXp():AddXP(Perks.Axe, exp);
end
if weapon:getScriptItem():getCategories():contains("Blunt") then
    owner:getXp():AddXP(Perks.Blunt, exp);
end
```

### Category to Skill Mapping

| Category | Skill Trained | Typical Weapons |
|----------|--------------|------------------|
| `Axe` | Axe | Axes, hatchets |
| `LongBlade` | Long Blade | Katana, machete |
| `SmallBlade` | Short Blade | Knives, scissors |
| `Blunt` | Long Blunt | Baseball bat, crowbar |
| `SmallBlunt` | Short Blunt | Hammer, pipe |
| `Spear` | Spear | Spears, javelins |

### Multi-Category Weapons

A weapon can have multiple categories:

```
Categories = Improvised;SmallBlunt,
```

This weapon:
- Is tagged as `Improvised` (for identifying non-purpose-built weapons)
- Trains the `Short Blunt` skill on hit

**Note:** `Improvised` doesn't map to a skill - it's just a tag.

### Special Actions

Categories also determine what actions a weapon can perform:

- **Axe** - Can chop trees, remove bushes faster
- **SmallBlade/LongBlade/Axe** - Can be used in butchering recipes

```lua
-- From ISRemoveBush.lua
if self.weapon:getScriptItem():getCategories():contains("Axe") then
    -- Faster bush removal
```

---

## Damage Properties

### MinDamage and MaxDamage

Every swing deals random damage between `MinDamage` and `MaxDamage`.

```
MinDamage = 0.8,
MaxDamage = 1.2,
```

**What the numbers mean:**
- These are **multipliers**, not absolute values
- 1.0 damage roughly equals one zombie's worth of damage
- A hit dealing 1.0+ damage will typically one-shot a zombie

**Practical ranges:**

| Damage Range | Weapon Type |
|-------------|-------------|
| 0.2 - 0.5 | Weak improvised (saucepan) |
| 0.5 - 1.0 | Light weapons (knife, hammer) |
| 0.8 - 1.3 | Standard weapons (bat, machete) |
| 1.0 - 2.0 | Heavy weapons (axe, sledgehammer) |
| 1.5 - 2.5+ | Two-handed powerhouses (katana) |

### Critical Hits

```
CriticalChance = 30,
CritDmgMultiplier = 2,
```

- `CriticalChance` - Percentage chance per hit (30 = 30%)
- `CritDmgMultiplier` - Damage is multiplied by this on crit

**Critical hits are important** - they often mean instant kills. A weapon with 30% crit and 2x multiplier will kill more efficiently than raw damage suggests.

### MaxHitCount

```
MaxHitCount = 2,
```

Maximum zombies hit per swing. This is **huge** for crowd control:

| MaxHitCount | Best For |
|-------------|----------|
| 1 | Precise single-target |
| 2 | Standard combat |
| 3 | Crowd control |
| 4+ | Exceptional (rare) |

Two-handed weapons and long weapons typically have higher MaxHitCount.

---

## Range and Speed

### MinRange and MaxRange

```
MinRange = 0.61,
MaxRange = 1.3,
```

- `MinRange` - Minimum distance to hit (can't hit closer than this)
- `MaxRange` - Maximum reach

**Practical values:**

| MaxRange | Reach |
|----------|-------|
| 0.9 - 1.0 | Very short (knife) |
| 1.0 - 1.3 | Short (bat, machete) |
| 1.3 - 1.5 | Medium (crowbar) |
| 1.5 - 2.0 | Long (spear) |
| 2.0+ | Very long (crafted spears) |

**Why MinRange matters:** Spears have high MinRange (~0.9), meaning zombies that get too close are inside your attack range. This is the spear tradeoff - great reach, vulnerable up close.

### BaseSpeed

```
BaseSpeed = 1,
```

- 1.0 is standard speed
- Higher = faster attacks
- Lower = slower attacks

| BaseSpeed | Feel |
|-----------|------|
| 0.8 | Sluggish (heavy weapons) |
| 1.0 | Normal |
| 1.1 | Quick |
| 1.2+ | Fast (knives) |

### SwingTime

```
SwingTime = 3,
```

Base time to complete a swing animation. Lower = faster overall attack cycle.

---

## Durability System

### ConditionMax

```
ConditionMax = 15,
```

The weapon's maximum durability. When condition hits 0, the weapon breaks.

**Typical values:**

| ConditionMax | Durability |
|--------------|------------|
| 5-10 | Fragile (improvised) |
| 10-15 | Standard |
| 15-25 | Durable |
| 25+ | Very durable |

### ConditionLowerChanceOneIn

This is the most misunderstood property:

```
ConditionLowerChanceOneIn = 30,
```

**How it works:** On each hit, there's a 1-in-30 chance to lose 1 durability point.

- Higher number = more durable (less chance to lose condition)
- Lower number = less durable (more chance to lose condition)

| Value | Meaning |
|-------|--------|
| 10 | 10% chance per hit to lose durability (fragile) |
| 20 | 5% chance per hit |
| 30 | 3.3% chance per hit (standard) |
| 50 | 2% chance per hit (durable) |

**Example calculation:**
A weapon with `ConditionMax = 15` and `ConditionLowerChanceOneIn = 30`:
- Average hits before durability loss: 30
- Average total hits before breaking: 30 × 15 = **450 hits**

---

## Knockback and Knockdown

### PushBackMod

```
PushBackMod = 0.3,
```

How much the hit pushes zombies back. Higher = more distance.

### KnockdownMod

```
KnockdownMod = 2,
```

Modifier for chance to knock zombies to the ground. Higher = more knockdowns.

**Knockdowns are powerful** - a knocked zombie is vulnerable to a ground kill.

### KnockBackOnNoDeath

```
KnockBackOnNoDeath = FALSE,
```

If TRUE, the weapon still pushes back even when it doesn't kill. Heavy weapons often have this TRUE.

---

## SubCategory

```
SubCategory = Swinging,
```

Determines the attack style:

| SubCategory | Attack Style |
|-------------|-------------|
| `Swinging` | Wide horizontal swings |
| `Stabbing` | Forward thrust (spears) |
| `OneHandSwing` | One-handed swing |

This affects animations and the arc of the attack.

---

## Two-Handed Weapons

```
TwoHandWeapon = TRUE,
```

- Requires both hands free
- Cannot use with offhand items
- Usually higher damage and reach

---

## Door and Tree Damage

```
DoorDamage = 5,
TreeDamage = 3,
```

How effective the weapon is against:
- `DoorDamage` - Breaking down doors
- `TreeDamage` - Chopping trees

Axes have high TreeDamage. Sledgehammers have high DoorDamage.

---

## Sound Properties

```
SwingSound = BatSwing,
HitSound = BatHit,
BreakSound = BatBreak,
DoorHitSound = BatHitDoor,
HitFloorSound = BatHitFloor,
```

These reference sound events in the game's sound system. Important for immersion and can attract zombies.

---

## Animation Properties

```
SwingAnim = Bat,
RunAnim = Run_Weapon2,
IdleAnim = Idle_Weapon2,
```

References to animation states. The `SwingAnim` determines the combat animation used.

---

## Visual Properties

```
WeaponSprite = Crowbar,
Icon = Crowbar,
StaticModel = Crowbar,
AttachmentType = BigWeapon,
```

- `WeaponSprite` - Equipped weapon sprite
- `Icon` - Inventory icon
- `StaticModel` - 3D model reference
- `AttachmentType` - How it attaches to the character (holster location)

---

## Putting It Together

Here's how to read a full weapon definition:

```
item Crowbar {
    Type = Weapon,               // It's a weapon
    DisplayName = Crowbar,       // Shows as "Crowbar"
    Categories = Blunt,          // Trains Long Blunt skill
    SubCategory = Swinging,      // Wide swing attack
    MinDamage = 0.6,            // Damage range 0.6-1.1
    MaxDamage = 1.1,
    CriticalChance = 25,        // 25% crit chance
    CritDmgMultiplier = 2,      // 2x crit damage
    MaxRange = 1.35,            // Medium reach
    BaseSpeed = 0.95,           // Slightly slow
    MaxHitCount = 2,            // Hits 2 zombies max
    ConditionMax = 15,          // 15 durability
    ConditionLowerChanceOneIn = 25,  // ~4% chance to lose durability per hit
    DoorDamage = 7,             // Good door breaker
    TwoHandWeapon = TRUE,       // Requires both hands
}
```

**This crowbar:**
- Trains Long Blunt when you hit zombies
- Deals moderate damage with decent crits
- Has good reach for a blunt weapon
- Is durable (estimated 375 hits before breaking)
- Good for breaking down doors
- Requires both hands

---

## Common Mistakes

### Wrong: Misunderstanding ConditionLowerChanceOneIn

```
item MyCustomKnife
{
    Type = Weapon,
    DisplayName = Durable Combat Knife,
    MinDamage = 0.6,
    MaxDamage = 1.2,
    ConditionMax = 10,
    ConditionLowerChanceOneIn = 5,          // WRONG! Trying to make it durable
}
```

**Why it's wrong:** The `ConditionLowerChanceOneIn` property is confusing because **lower numbers = LESS durable**, not more. A value of 5 means the weapon has a 1-in-5 (20%) chance to lose durability per hit, which is very fragile. With ConditionMax = 10, this knife will break after roughly 50 hits (5 hits/durability × 10 max = 50 total hits).

Looking at vanilla weapons, durable tools use values of 20-50, not low numbers like 5.

**Right:**

```
item MyCustomKnife
{
    Type = Weapon,
    DisplayName = Durable Combat Knife,
    MinDamage = 0.6,                        // Moderate knife damage
    MaxDamage = 1.2,
    CriticalChance = 40,                    // Good crit for quality knife
    MaxRange = 0.9,                         // Knife reach
    MinRange = 0.61,                        // Minimum effective range
    WeaponWeight = 0.5,                     // Standard knife weight
    ConditionMax = 15,                      // More durability points
    ConditionLowerChanceOneIn = 40,         // Higher number = more durable (2.5% chance)
    Categories = SmallBlade,                // Trains Short Blade skill
}
```

**Why this works:** `ConditionLowerChanceOneIn = 40` means only 2.5% chance to lose durability per hit. With `ConditionMax = 15`, this knife will last approximately 600 hits (40 hits/durability × 15 max), making it genuinely durable.

### Wrong: Categories Doesn't Train Skill

```
item MyCustomAxe
{
    Type = Weapon,
    DisplayName = Custom Axe,
    MinDamage = 1.3,
    MaxDamage = 3,
    Categories = Axe,                       // Set to Axe
}

// Player uses weapon but Axe skill doesn't increase!
```

**Why it's wrong:** This actually looks correct! But if the skill isn't training, the issue is likely in your mod's module name or script syntax. The game is **case-sensitive** and picky about module imports.

**Right:**

```
module MyMod                                 // Your mod's module name
{
    imports
    {
        Base                                // MUST import Base to use Categories
    }

    item CustomAxe
    {
        Type = Weapon,
        DisplayName = Custom Axe,
        MinDamage = 1.3,                    // Wood Axe-level damage
        MaxDamage = 3,
        CriticalChance = 50,                // High crit for axes
        MaxRange = 1.35,                    // Axe reach
        MinRange = 0.61,                    // Minimum effective range
        SwingAnim = Axe,                    // Axe swing animation
        WeaponWeight = 3,                   // Heavy axe weight
        ConditionMax = 15,                  // Durable tool
        ConditionLowerChanceOneIn = 15,     // Standard axe durability
        Categories = Axe,                   // Trains Axe skill (case-sensitive!)
        TreeDamage = 20,                    // Excellent tree chopping
        TwoHandWeapon = TRUE,               // Requires both hands
    }
}
```

**Key points:**
- Must have `imports { Base }` in your module
- `Categories` is case-sensitive: `Axe` not `axe`, `SmallBlade` not `smallblade`
- Module name should match your mod's name

### Wrong: Thinking 1.0 Damage Is Weak

```
item MyCustomSuperKnife
{
    Type = Weapon,
    DisplayName = Super Combat Knife,
    MinDamage = 5,                          // WRONG! Way too high
    MaxDamage = 10,                         // Trying to make it "powerful"
    Categories = SmallBlade,
}
```

**Why it's wrong:** Damage values are **multipliers**, not absolute HP values. Looking at vanilla weapons, even the legendary Katana only has 8-8 damage. Your knife at 5-10 damage would be nearly as powerful as a katana, which doesn't make sense for a small blade.

In practice, 1.0+ damage typically one-shots zombies. Knives should be in the 0.6-1.2 range.

**Right:**

```
item MyCustomSuperKnife
{
    Type = Weapon,
    DisplayName = Super Combat Knife,
    MinDamage = 0.8,                        // Slightly better than Hunting Knife (0.6)
    MaxDamage = 1.3,                        // Can one-shot zombies
    CriticalChance = 50,                    // Excellent crit makes up for moderate damage
    CritDmgMultiplier = 2,                  // 2x damage on crits
    MaxRange = 0.95,                        // Slightly longer knife reach
    MinRange = 0.61,                        // Standard minimum range
    SwingTime = 2,                          // Fast knife attacks
    WeaponWeight = 0.6,                     // Quality knife weight
    ConditionMax = 12,                      // Durable combat knife
    ConditionLowerChanceOneIn = 35,         // Very durable
    Categories = SmallBlade,                // Trains Short Blade skill
}
```

**Why this works:** Moderate damage (0.8-1.3) with 50% crit chance and 2x multiplier makes this knife deadly without being unrealistic. The high crit rate gives it the "super" feel while maintaining balance.

### Wrong: MaxHitCount Doesn't Match Weapon Type

```
item MyCustomSpear
{
    Type = Weapon,
    DisplayName = Custom Spear,
    MinDamage = 0.8,
    MaxDamage = 1.4,
    MaxRange = 2.0,                         // Long spear reach
    MaxHitCount = 1,                        // WRONG! Spears should hit multiple targets
    Categories = Spear,
}
```

**Why it's wrong:** Looking at vanilla weapons, long-reaching weapons like spears typically have `MaxHitCount = 2` or higher because their reach allows them to hit multiple zombies in a line. A spear with `MaxHitCount = 1` wastes its range advantage and feels wrong for the weapon type.

**Right:**

```
item MyCustomSpear
{
    Type = Weapon,
    DisplayName = Custom Spear,
    MinDamage = 0.8,                        // Moderate spear damage
    MaxDamage = 1.4,
    CriticalChance = 20,                    // Standard spear crit
    MaxRange = 2.0,                         // Long spear reach
    MinRange = 0.9,                         // High MinRange (vulnerable up close!)
    MaxHitCount = 2,                        // Hits 2 zombies in a line
    SubCategory = Stabbing,                 // Thrust attack (not swinging)
    WeaponWeight = 1.8,                     // Light spear weight
    ConditionMax = 10,                      // Standard durability
    ConditionLowerChanceOneIn = 20,         // Moderate durability
    Categories = Spear,                     // Trains Spear skill
    TwoHandWeapon = TRUE,                   // Requires both hands
}
```

**Why this works:** `MaxHitCount = 2` allows the spear to hit multiple targets with its long reach. The `MinRange = 0.9` creates the spear's classic tradeoff: excellent reach, vulnerable when zombies get close.

---

## Try It Yourself

Let's create a custom baseball bat with a full understanding of weapon properties.

### Step 1: Research Similar Weapons

From the vanilla weapons reference, baseball bats have:
- Damage: 0.6-1.2 (moderate)
- Crit: 30% (good)
- Weight: 1.8
- ConditionMax: 10
- ConditionLowerChanceOneIn: 30
- Categories: Blunt (trains Long Blunt skill)

We'll create a reinforced baseball bat that's slightly better than vanilla.

### Step 2: Create the Weapon File

Create `media/scripts/my_weapons.txt`:

```
module MyMod
{
    imports
    {
        Base                                // Must import Base for Categories
    }

    item ReinforcedBaseballBat
    {
        Type = Weapon,                      // Identifies this as a weapon
        DisplayName = Reinforced Baseball Bat,
        Icon = BaseballBat,                 // Using vanilla bat icon

        /* Damage Properties */
        MinDamage = 0.7,                    // Slightly better than vanilla (0.6)
        MaxDamage = 1.3,                    // Better max damage (vanilla: 1.2)
        CriticalChance = 35,                // Better crit than vanilla (30%)
        CritDmgMultiplier = 2,              // Standard 2x crit damage

        /* Range and Speed */
        MaxRange = 1.5,                     // Good reach for blunt weapon
        MinRange = 0.61,                    // Standard minimum range
        BaseSpeed = 1.0,                    // Normal attack speed
        SwingTime = 3,                      // Standard swing time
        MinimumSwingTime = 3,               // Minimum swing time (same as SwingTime)

        /* Combat Properties */
        MaxHitCount = 2,                    // Can hit 2 zombies per swing
        PushBackMod = 0.5,                  // Moderate pushback
        KnockdownMod = 1,                   // Standard knockdown chance
        KnockBackOnNoDeath = TRUE,          // Pushes back even when not killing

        /* Durability - Understanding the numbers */
        ConditionMax = 15,                  // 15 durability points (better than vanilla 10)
        ConditionLowerChanceOneIn = 35,     // 1-in-35 chance per hit = 2.85% chance
                                           // Expected hits: 35 × 15 = 525 total hits

        /* Weight and Handling */
        WeaponWeight = 1.8,                 // Matches vanilla bat weight
        TwoHandWeapon = TRUE,               // Requires both hands

        /* Skill and Category */
        Categories = Blunt,                 // Trains Long Blunt skill

        /* Utility */
        DoorDamage = 6,                     // Decent door breaking (vanilla: 5)

        /* Animations and Sounds */
        SwingAnim = Bat,                    // Baseball bat swing animation
        SubCategory = Swinging,             // Wide horizontal swing

        /* Visual */
        AttachmentType = BigWeapon,         // How it attaches to character
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "Reinforced Baseball" and spawn it
4. Find zombies and test combat
5. Check skill panel to verify Long Blunt skill increases

**What You Should See:**
- Bat appears with baseball bat icon
- Damage 0.7-1.3 per hit (slightly better than vanilla)
- 35% critical hit chance (you'll see damage spikes)
- Can hit 2 zombies per swing
- Weighs 1.8 (feels substantial)
- Long Blunt skill increases when you hit zombies
- Very durable (lasts ~525 hits before breaking)
- Good for breaking down doors

### Step 4: Understanding What You Created

Let's break down the durability calculation:

```
ConditionMax = 15                    // 15 durability points total
ConditionLowerChanceOneIn = 35       // 2.85% chance to lose 1 point per hit

Average hits per durability point: 35
Total expected hits: 35 × 15 = 525 hits before breaking
```

This is significantly more durable than vanilla bat (10 × 30 = 300 hits).

The damage range (0.7-1.3) with 35% crit chance means:
- Regular hits: Usually one-shot or two-shot zombies
- Critical hits (35% chance): 1.4-2.6 damage (guaranteed kills)
- MaxHitCount = 2: Can kill two zombies per swing

### Why This Works

This reinforced bat uses vanilla patterns:
- **Damage (0.7-1.3)** is slightly better than vanilla (0.6-1.2) but not overpowered
- **CriticalChance (35)** is better than vanilla (30) without being unrealistic
- **ConditionMax (15) + ConditionLowerChanceOneIn (35)** creates meaningful durability improvement
- **Weight (1.8)** matches vanilla bat exactly (feels right)
- **Categories = Blunt** properly trains Long Blunt skill
- **MaxHitCount (2)** matches vanilla bat crowd control
- **TwoHandWeapon = TRUE** balances the improved stats

---

## Next Steps

Now that you understand weapon properties:

1. Check out [Vanilla Weapons Reference](vanilla-weapons-reference) to compare full weapon stats
2. See [Weapon Repair System Overview](weapon-repair-system-overview) to understand how durability affects gameplay
3. Read [Item Anatomy](item-anatomy) for general item properties beyond weapons
