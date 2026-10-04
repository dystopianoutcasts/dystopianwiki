---
id: vanilla-weapons-reference
slug: vanilla-weapons-reference
title: "Vanilla Weapons Reference"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - weapons
  - vanilla
  - items
excerpt: "Complete reference for all 152 vanilla weapons, organized by category with full stats."
related_articles:
  - item-anatomy
  - weapon-repair-system-overview
last_updated: 2026-01-18
---

# Vanilla Weapons Reference

## Introduction

You're creating a custom melee weapon and need to know what damage values vanilla weapons use. Or you're balancing a mod and want your axe to feel authentic. Or maybe you just need to compare weapon stats to understand what makes the katana so powerful.

If you're feeling overwhelmed by the weapon system in Project Zomboid, you're not alone. There are 152 different vanilla weapons spanning 8 categories, each with unique damage, critical chance, speed, range, and durability values. Figuring out what's "normal" for a knife's damage or what makes an axe balanced can feel impossible.

Here's the good news: this reference organizes all 152 vanilla weapons by category with complete stats, so you can quickly find similar weapons and see what values they use. I'll show you exactly how to use this reference to create balanced weapon mods.

## How to Use This Reference

When creating custom weapons, follow this pattern:

### Step 1: Find Similar Vanilla Weapons

Use the Quick Navigation below to jump to the weapon category closest to yours:

- **Making an axe/hatchet?** Look at Axe category (5 weapons - high crit, tree chopping)
- **Making a sword/machete?** Look at LongBlade category (2 weapons - katana, machete)
- **Making a knife?** Look at SmallBlade category (16 weapons - knives, scissors, forks)
- **Making a bat/club?** Look at Blunt category (22 weapons - baseball bats, pipes, crowbars)
- **Making a hammer/wrench?** Look at SmallBlunt category (12 weapons - tools, hammers, wrenches)
- **Making an improvised weapon?** Look at Improvised category (56 weapons - found objects)

### Step 2: Compare Weapon Stats

Notice the patterns in vanilla weapons by category:

| Category | Damage Range | Crit % | Weight | Durability | Examples |
|----------|--------------|--------|--------|------------|----------|
| **Axe** | 0.5-3.0 | 15-50% | 1.2-3.0 | 5-15 | Wood Axe (1.3-3), Hand Axe (0.7-1.5) |
| **LongBlade** | 2-8 | 20-30% | 2.0 | 10-13 | Katana (8-8 flat), Machete (2-3) |
| **SmallBlade** | 0.1-1.2 | 5-50% | 0.3-1.0 | 3-10 | Hunting Knife (0.6-1.2), Kitchen Knife (0.3-0.7) |
| **Blunt** | 0.3-3.5 | 5-35% | 0.5-7.0 | 5-100 | Baseball Bat (0.6-1.2), Crowbar (0.8-2) |
| **SmallBlunt** | 0.2-2.0 | 5-30% | 0.3-2.5 | 5-20 | Hammer (0.5-1), Wrench (0.5-1) |

### Step 3: Make Your Decision

Choose values that match vanilla patterns for your weapon category:

- **Damage** → Match similar category weapons (axes high, knives low-medium)
- **Crit** → Axes high (15-50%), blunt low (5-35%), blades medium (15-30%)
- **Weight** → Realistic for weapon size (knife 0.3-1.0, bat 1-2, axe 2-3)
- **Durability** → Tools/quality weapons high (10-15), improvised low (3-6)
- **Speed** → Most weapons 1.0, fast weapons 1.1-1.4, slow weapons 0.8-0.9

## Understanding Weapon Stats

| Stat | Description |
|------|-------------|
| **Damage** | Min-Max damage per hit |
| **Crit** | Critical hit chance (%) |
| **Speed** | Attack speed (1.0 = normal) |
| **Range** | Maximum attack distance |
| **Durability** | Hits before breaking |
| **Weight** | Inventory weight |

## Quick Navigation

- [Axe](#axe) (5 weapons)
- [LongBlade](#longblade) (2 weapons)
- [SmallBlade](#smallblade) (16 weapons)
- [Blunt](#blunt) (22 weapons)
- [SmallBlunt](#smallblunt) (12 weapons)
- [Improvised](#improvised) (56 weapons)
- [Unarmed](#unarmed) (1 weapons)
- [Uncategorized](#uncategorized) (38 weapons)

## Axe

Axes excel at chopping trees and can deal devastating critical hits.
 Affected by **Axe** skill.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Wood Axe** | 1.3-3 | 50% | 1 | 1.35 | 15 | 3 |
| **PickAxe** | 1-2.2 | 25% | 0.8 | 1.6 | 13 | 3 |
| **Axe** | 0.8-2 | 20% | 1 | 1.2 | 13 | 3 |
| **Hand Axe** | 0.7-1.5 | 15% | 1 | 1.1 | 10 | 2 |
| **Raw Axe** | 0.5-1.5 | 15% | 1 | 1.2 | 5 | 1.2 |

## LongBlade

Long bladed weapons like katanas and machetes. High damage.
 Affected by **Long Blade** skill.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Katana** | 8-8 | 30% | 1 | 1.4 | 10 | 2 |
| **Machete** | 2-3 | 20% | 1 | 1.23 | 13 | 2 |

## SmallBlade

Knives, cleavers, and other small cutting weapons. Fast attacks.
 Affected by **Short Blade** skill.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Hand Scythe** | 0.6-1.2 | 15% | 1.1 | 1.1 | 5 | 0.5 |
| **Hunting Knife** | 0.6-1.2 | 50% | 1 | 0.9 | 10 | 0.5 |
| **Ice Pick** | 0.6-0.9 | 10% | 1 | 0.8 | 10 | 0.3 |
| **Meat Cleaver** | 0.4-0.8 | 15% | 1.2 | 1 | 10 | 1 |
| **Kitchen Knife** | 0.3-0.7 | 25% | 1 | 0.9 | 10 | 0.3 |
| **Stone Knife** | 0.4-0.6 | 20% | 1 | 0.85 | 6 | 0.75 |
| **Stake** | 0.25-0.53 | 10% | 1 | 0.85 | 5 | 0.3 |
| **Smashed Bottle** | 0.2-0.5 | 5% | 1.4 | 0.8 | 3 | 1 |
| **Hand Fork** | 0.2-0.4 | 10% | 1 | 0.9 | 6 | 0.5 |
| **Scalpel** | 0.1-0.4 | 10% | 1 | 0.8 | 5 | 0.3 |
| **Butter Knife** | 0.1-0.4 | 7% | 1 | 0.8 | 3 | 0.3 |
| **Bread Knife** | 0.1-0.4 | 15% | 1 | 1 | 5 | 0.3 |
| **Letter Opener** | 0.1-0.1 | 5% | 1 | 0.8 | 5 | 0.3 |
| **Fork** | 0.1-0.1 | 5% | 1 | 0.8 | 3 | 0.3 |
| **Scissors** | 0.1-0.1 | 5% | 1 | 0.9 | 10 | 0.4 |
| **Spoon** | 0.1-0.1 | 0% | 1 | 0.8 | 3 | 0.3 |

## Blunt

Large blunt weapons like baseball bats. Good knockback.
 Affected by **Long Blunt** skill.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Sledgehammer** | 2-3 | 0% | 0.9 | 1.35 | 10 | 6 |
| **Sledgehammer** | 2-3 | 0% | 0.9 | 1.35 | 10 | 6 |
| **Barbell** | 1.8-2.8 | 0% | 0.7 | 1.35 | 15 | 6 |
| **Snow Shovel** | 0.8-1.9 | 40% | 0.8 | 1.6 | 10 | 1.5 |
| **Shovel** | 0.8-1.9 | 40% | 0.8 | 1.6 | 10 | 1.5 |
| **Shovel** | 0.8-1.9 | 40% | 0.8 | 1.6 | 10 | 1.5 |
| **Garden Hoe** | 0.6-1.7 | 35% | 0.85 | 1.6 | 10 | 1.5 |
| **Spiked Baseball Bat** | 1-1.5 | 30% | 0.95 | 1.28 | 15 | 2 |
| **Black Electric Bass** | 0.9-1.4 | 70% | 1 | 1.35 | 12 | 3.5 |
| **Blue Electric Bass** | 0.9-1.4 | 70% | 1 | 1.35 | 12 | 3.5 |
| **Red Electric Bass** | 0.9-1.4 | 70% | 1 | 1.35 | 12 | 3.5 |
| **Black Electric Guitar** | 0.8-1.2 | 55% | 1.1 | 1.35 | 10 | 2.8 |
| **Blue Electric Guitar** | 0.8-1.2 | 55% | 1.1 | 1.35 | 10 | 2.8 |
| **Red Electric Guitar** | 0.8-1.2 | 55% | 1.1 | 1.35 | 10 | 2.8 |
| **Crowbar** | 0.6-1.15 | 20% | 1 | 1.25 | 15 | 2 |
| **Chainsaw** | 0.6-1.1 | 25% | 1 | 1.2 | 15 | 3 |
| **Baseball Bat** | 0.8-1.1 | 40% | 1 | 1.25 | 15 | 2 |
| **Golfclub** | 0.5-1 | 25% | 1 | 1.42 | 5 | 2 |
| **Saxophone** | 0.4-0.8 | 70% | 0.9 | 1.2 | 5 | 3 |
| **Trumpet** | 0.4-0.8 | 20% | 1 | 1.15 | 5 | 1 |
| **Acoustic Guitar** | 0.3-0.8 | 20% | 0.9 | 1.3 | 2 | 2.3 |
| **Keytar** | 0.2-0.7 | 20% | 1.2 | 1.25 | 2 | 2 |

## SmallBlunt

Hammers, pipes, and other small blunt weapons.
 Affected by **Short Blunt** skill.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Nightstick** | 0.6-1.1 | 25% | 1 | 1.2 | 15 | 1.5 |
| **Pipe Wrench** | 0.5-1 | 25% | 1 | 1.1 | 10 | 1.5 |
| **Club Hammer** | 0.5-1 | 20% | 1 | 1 | 10 | 1 |
| **Ball Peen Hammer** | 0.5-1 | 20% | 1 | 1 | 10 | 1 |
| **Wrench** | 0.5-1 | 20% | 1 | 1.1 | 9 | 1 |
| **Hammer** | 0.5-1 | 20% | 1 | 1.1 | 10 | 1 |
| **DumbBell** | 0.5-1 | 25% | 0.90 | 1 | 10 | 5 |
| **Wooden Mallet** | 0.4-0.9 | 17% | 1.1 | 1 | 8 | 1 |
| **Stone Hammer** | 0.3-0.7 | 15% | 1 | 1.05 | 5 | 1.2 |
| **Banjo** | 0.3-0.6 | 5% | 1.1 | 1.25 | 3 | 3 |
| **Rolling Pin** | 0.2-0.5 | 15% | 1.2 | 1.1 | 8 | 1.5 |
| **Violin** | 0.2-0.4 | 5% | 1.2 | 1 | 1 | 0.7 |

## Improvised

Improvised weapons not designed for combat.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Spear With Machete** | 1.3-2 | 30% | 0.9 | 1.55 | 12 | 3.7 |
| **Canoe Paddle Double** | 0.8-1.9 | 50% | 0.8 | 1.6 | 10 | 2.2 |
| **Spear With Hunting Knife** | 1.2-1.7 | 30% | 1 | 1.48 | 9 | 2.2 |
| **Spear With Bread Knife** | 1-1.6 | 30% | 1 | 1.55 | 6 | 2.0 |
| **Spear With Butter Knife** | 1-1.6 | 30% | 1 | 1.42 | 6 | 2.0 |
| **Spear With Fork** | 1-1.6 | 30% | 0.95 | 1.42 | 6 | 2.0 |
| **Spear With Letter Opener** | 1-1.6 | 30% | 1 | 1.42 | 6 | 2.0 |
| **Spear With Scalpel** | 1-1.6 | 30% | 1 | 1.42 | 6 | 2.0 |
| **Spear With Spoon** | 1-1.6 | 30% | 1 | 1.4 | 6 | 2.0 |
| **Spear With Scissors** | 1-1.6 | 30% | 1 | 1.42 | 6 | 2.1 |
| **Spear With Hand Fork** | 1.1-1.6 | 30% | 0.95 | 1.45 | 7 | 2.2 |
| **Spear With Screwdriver** | 1.2-1.6 | 30% | 1 | 1.45 | 7 | 2.1 |
| **Spear With Ice Pick** | 1-1.6 | 30% | 1 | 1.42 | 6 | 2.0 |
| **Spear With Knife** | 1-1.6 | 30% | 1 | 1.45 | 7 | 2.0 |
| **Garden Fork** | 1-1.5 | 30% | 0.9 | 1.37 | 10 | 1.5 |
| **Crafted Spear** | 1-1.5 | 30% | 1 | 1.4 | 5 | 1.7 |
| **Wooden Spear** | 1-1.4 | 30% | 1 | 1.4 | 7 | 1.7 |
| **Canoe Paddle** | 0.5-1.3 | 40% | 0.85 | 1.6 | 10 | 2 |
| **Lead Pipe** | 0.7-1.2 | 30% | 0.93 | 1.15 | 15 | 1.5 |
| **Metal Bar** | 0.7-1.1 | 30% | 0.95 | 1.2 | 8 | 1.5 |
| **Metal Pipe** | 0.6-1 | 30% | 0.95 | 1.2 | 8 | 1.5 |
| **Spiked PickAxe Handle** | 0.7-1 | 10% | 1 | 1.1 | 4 | 3 |
| **Table Leg** | 0.5-0.9 | 10% | 1 | 1 | 4 | 1.5 |
| **Chair Leg** | 0.4-0.8 | 5% | 1.1 | 1 | 3 | 1 |
| **PickAxe Handle** | 0.4-0.8 | 10% | 1.1 | 1.05 | 4 | 3 |
| **Spiked Plank** | 0.5-0.8 | 25% | 0.85 | 1.32 | 10 | 3.1 |
| **Saucepan** | 0.2-0.7 | 30% | 1 | 1 | 5 | 0.7 |
| **Hockey Stick** | 0.3-0.7 | 30% | 0.9 | 1.6 | 7 | 1.5 |
| **Ice Hockey Stick** | 0.3-0.7 | 30% | 0.9 | 1.6 | 7 | 1.5 |
| **LaCrosse Stick** | 0.3-0.7 | 30% | 0.9 | 1.6 | 10 | 0.4 |
| **Screwdriver** | 0.3-0.7 | 10% | 1 | 0.85 | 10 | 0.4 |
| **Closed Umbrella** | 0.5-0.7 | 10% | 0.9 | 1.1 | 7 | 1 |
| **Closed Umbrella** | 0.5-0.7 | 10% | 0.9 | 1.1 | 7 | 1 |
| **Closed Umbrella** | 0.5-0.7 | 10% | 0.9 | 1.1 | 7 | 1 |
| **Closed Umbrella** | 0.5-0.7 | 10% | 0.9 | 1.1 | 7 | 1 |
| **Plank** | 0.4-0.6 | 30% | 0.9 | 1.3 | 10 | 3 |
| **Plunger** | 0.3-0.5 | 5% | 1.2 | 1.1 | 3 | 0.5 |
| **Tennis Racket** | 0.3-0.5 | 5% | 1.1 | 1.25 | 4 | 1 |
| **Frying Pan** | 0.3-0.5 | 30% | 1 | 1.1 | 10 | 1 |
| **Broom** | 0.2-0.5 | 5% | 1.2 | 1.6 | 3 | 1 |
| **Griddle Pan** | 0.25-0.45 | 30% | 1 | 1.1 | 10 | 1.2 |
| **Poolcue** | 0.2-0.4 | 0% | 1.2 | 1.6 | 10 | 1 |
| **Leaf Rake** | 0.2-0.4 | 5% | 1.2 | 1.6 | 4 | 1.5 |
| **Rake** | 0.2-0.4 | 5% | 1.2 | 1.6 | 4 | 1.5 |
| **Fishing Rod** | 0.2-0.3 | 5% | 1.3 | 1.55 | 3 | 0.4 |
| **Fishing Rod** | 0.2-0.3 | 5% | 1.3 | 1.55 | 3 | 0.4 |
| **Fishing Rod** | 0.2-0.3 | 5% | 1.3 | 1.55 | 3 | 0.4 |
| **Fishing Rod Without line** | 0.2-0.3 | 5% | 1.3 | 1.55 | 3 | 0.4 |
| **Fishing Rod** | 0.2-0.3 | 5% | 1.3 | 1.55 | 3 | 0.4 |
| **Drumstick** | 0.1-0.2 | 0% | 1.3 | 0.9 | 1 | 3 |
| **Flute** | 0.1-0.2 | 0% | 1.3 | 0.9 | 1 | 3 |
| **Badminton Racket** | 0.1-0.2 | 0% | 1.2 | 1.25 | 4 | 1 |
| **Red Pen** | 0.1-0.1 | 0% | 1 | 0.8 | 2 | 0.1 |
| **Blue Pen** | 0.1-0.1 | 0% | 1 | 0.8 | 2 | 0.1 |
| **Pen** | 0.1-0.1 | 0% | 1 | 0.8 | 2 | 0.1 |
| **Pencil** | 0.1-0.1 | 0% | 1 | 0.8 | 1 | 0.1 |

## Unarmed

Items that enhance unarmed combat.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Bare Hands** | 0.2-0.4 | 0% | 1 | 1.1 | ? | 1 |

## Uncategorized

Uncategorized weapons.

| Weapon | Damage | Crit | Speed | Range | Durability | Weight |
|--------|--------|------|-------|-------|------------|--------|
| **Double Barrel Shotgun** | 2-2.7 | 80% | 1 | 9 | 10 | 4 |
| **Sawn Off Double Barrel Shotgun** | 2-2.7 | 80% | 1 | 8 | 10 | 3.5 |
| **JS-2000 Shotgun** | 1.5-2.2 | 60% | 1 | 7 | 10 | 4 |
| **Sawn Off JS-2000 Shotgun** | 1.5-2.2 | 60% | 1 | 6 | 10 | 3.5 |
| **MSR788 Rifle** | 1.2-2 | 30% | 1 | 10 | 10 | 4 |
| **M14 Single Shot Assault Rifle** | 1.2-2 | 30% | 1 | 10 | 10 | 4 |
| **D-E Pistol** | 1-1.9 | 20% | 1 | 10 | 10 | 1.5 |
| **Magnum** | 1.2-1.9 | 20% | 1 | 11 | 10 | 2 |
| **M625 Revolver** | 1-1.6 | 20% | 1 | 9 | 10 | 1.75 |
| **M1911 Pistol** | 1-1.4 | 20% | 1 | 8 | 10 | 1.5 |
| **M16 Assault Rifle** | 0.8-1.4 | 25% | 1 | 11 | 10 | 4 |
| **MSR700 Rifle** | 0.6-1.3 | 25% | 1 | 10 | 10 | 4 |
| **M36 Revolver** | 0.7-1.2 | 20% | 1 | 6 | 10 | 1.5 |
| **M9 Pistol** | 0.6-1 | 20% | 1 | 7 | 10 | 1.5 |
| **Molotov Cocktail** | 0-0 | 0% | 1 | 8 | ? | 1.5 |
| **9mm Rounds** | 0-0 | 0% | 1 | 1 | ? | 0.01 |
| **Box of 9mm Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **9mm Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **.45 Auto** | 0-0 | 0% | 1 | 1 | ? | 0.04 |
| **Box of .45 Auto Bullets** | 0-0 | 0% | 1 | 1 | ? | 1 |
| **.45 Auto Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **.44 Magnum Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.04 |
| **Box of .44 Magnum Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.38 |
| **.44 Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **.38 Special Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.015 |
| **Box of .38 Special Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.35 |
| **Shotgun Shells** | 0-0 | 0% | 1 | 1 | ? | 0.05 |
| **Box of Shotgun Shells** | 0-0 | 0% | 1 | 1 | ? | 0.9 |
| **.223 Ammo** | 0-0 | 0% | 1 | 1 | ? | 0.02 |
| **Box of .223 Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.6 |
| **.223 Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **.308 Ammo** | 0-0 | 0% | 1 | 1 | ? | 0.02 |
| **Box of .308 Bullets** | 0-0 | 0% | 1 | 1 | ? | 0.6 |
| **.308 Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **.556 Ammo** | 0-0 | 0% | 1 | 1 | ? | 0.025 |
| **Box of .556 Bullets** | 0-0 | 0% | 1 | 1 | ? | 1.2 |
| **.556 Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |
| **.308 Magazine** | 0-0 | 0% | 1 | 1 | ? | 0.2 |

---

## Common Mistakes

### Wrong: Knife with Axe-Level Damage

```
item MyCustomKnife
{
    Type = Weapon,
    DisplayName = Custom Combat Knife,
    MinDamage = 1.3,                        // WRONG! This is Wood Axe damage
    MaxDamage = 3.0,                        // Way too high for a knife
    Categories = SmallBlade,
}
```

**Why it's wrong:** Looking at vanilla SmallBlade weapons, knives have damage ranges of 0.1-1.2 (Hunting Knife is 0.6-1.2, Kitchen Knife is 0.3-0.7). Your custom knife at 1.3-3.0 damage would hit as hard as a wood axe, which is unrealistic for a small blade.

**Right:**

```
item MyCustomKnife
{
    Type = Weapon,
    DisplayName = Custom Combat Knife,
    MinDamage = 0.6,                        // Matches Hunting Knife
    MaxDamage = 1.2,                        // Realistic for combat knife
    CriticalChance = 40,                    // Good crit for quality knife
    MaxRange = 0.9,                         // Short range (knife reach)
    MinRange = 0.61,                        // Minimum effective range
    MinimumSwingTime = 2,                   // Attack speed
    SwingTime = 2,                          // Fast knife attacks
    WeaponWeight = 0.5,                     // Standard knife weight
    MaxHitCount = 1,                        // Hits one target
    DoorDamage = 5,                         // Damage against doors
    Categories = SmallBlade,                // Uses Short Blade skill
}
```

### Wrong: Missing Critical Hit Chance

```
item MyCustomBaseballBat
{
    Type = Weapon,
    DisplayName = Custom Baseball Bat,
    MinDamage = 0.6,
    MaxDamage = 1.2,
    Categories = Blunt,
    // Missing CriticalChance!                // WRONG! All weapons should have crit chance
}
```

**Why it's wrong:** Looking at vanilla Blunt weapons, ALL weapons have a critical hit chance defined. Baseball Bat has 30%, Crowbar has 10%, even sledgehammers have 0%. Your weapon without CriticalChance will have unpredictable critical hit behavior.

**Right:**

```
item MyCustomBaseballBat
{
    Type = Weapon,
    DisplayName = Custom Baseball Bat,
    MinDamage = 0.6,                        // Matches vanilla Baseball Bat
    MaxDamage = 1.2,
    CriticalChance = 30,                    // Standard for baseball bats
    MaxRange = 1.5,                         // Long reach for blunt weapon
    MinRange = 0.61,                        // Minimum effective range
    SwingAnim = Bat,                        // Baseball bat swing animation
    WeaponWeight = 1.8,                     // Realistic bat weight
    ConditionLowerChanceOneIn = 30,         // Durability (1 in 30 hits damages)
    ConditionMax = 10,                      // 10 condition points total
    Categories = Blunt,                     // Uses Long Blunt skill
}
```

### Wrong: Unrealistic Durability

```
item MyCustomMachete
{
    Type = Weapon,
    DisplayName = Custom Machete,
    MinDamage = 2,
    MaxDamage = 3,
    Categories = LongBlade,
    ConditionMax = 100,                     // WRONG! Way too durable
    ConditionLowerChanceOneIn = 5,          // WRONG! Breaks too fast
}
```

**Why it's wrong:** Looking at vanilla LongBlade weapons, machete has ConditionMax = 13 and ConditionLowerChanceOneIn = 5. Your custom machete with ConditionMax = 100 would last 7x longer than vanilla, breaking game balance. Also, ConditionLowerChanceOneIn = 5 means it takes damage every 5 hits, which is correct for machetes but your comments suggest confusion.

**Right:**

```
item MyCustomMachete
{
    Type = Weapon,
    DisplayName = Custom Machete,
    MinDamage = 2,                          // Matches vanilla Machete
    MaxDamage = 3,
    CriticalChance = 20,                    // Standard machete crit
    MaxRange = 1.23,                        // Machete reach
    MinRange = 0.61,                        // Minimum effective range
    SwingAnim = Bat,                        // Machete swing animation
    WeaponWeight = 2,                       // Realistic machete weight
    ConditionLowerChanceOneIn = 5,          // Durability: damages 1 in 5 hits
    ConditionMax = 13,                      // Matches vanilla Machete durability
    Categories = LongBlade,                 // Uses Long Blade skill
    TreeDamage = 15,                        // Good at chopping vegetation
}
```

### Wrong: Wrong Weight for Weapon Type

```
item MyCustomSledgehammer
{
    Type = Weapon,
    DisplayName = Custom Sledgehammer,
    MinDamage = 2,
    MaxDamage = 3,
    Categories = Blunt,
    WeaponWeight = 0.5,                     // WRONG! Way too light for sledgehammer
}
```

**Why it's wrong:** Looking at vanilla Blunt weapons, sledgehammers weigh 6.0 (heavy two-handed weapon). Your custom sledgehammer at 0.5 weight would be lighter than a knife (0.5-1.0), which is unrealistic for a heavy demolition tool.

**Right:**

```
item MyCustomSledgehammer
{
    Type = Weapon,
    DisplayName = Custom Sledgehammer,
    MinDamage = 2,                          // Matches vanilla Sledgehammer
    MaxDamage = 3,
    CriticalChance = 0,                     // Sledgehammers have 0% crit (too slow/heavy)
    MaxRange = 1.35,                        // Good reach for two-handed weapon
    MinRange = 0.61,                        // Minimum effective range
    SwingAnim = Sledgehammer,               // Special sledgehammer animation
    WeaponWeight = 6,                       // Heavy weight (matches vanilla)
    SwingTime = 4.5,                        // Slow swing (0.9 speed modifier)
    ConditionMax = 10,                      // Standard tool durability
    Categories = Blunt,                     // Uses Long Blunt skill
    KnockdownMod = 2,                       // Excellent knockdown (heavy weapon)
    TreeDamage = 10,                        // Can damage trees/structures
}
```

---

## Try It Yourself

Let's create a custom survival machete using vanilla weapon patterns.

### Step 1: Research Similar Weapons

Look at the reference above and find LongBlade weapons:
- Machete: Damage 2-3, Crit 20%, Weight 2, Durability 13
- Katana: Damage 8-8, Crit 30%, Weight 2, Durability 10

Machete is the best match for our survival machete (similar function and balance).

### Step 2: Create the Weapon File

Create `media/scripts/my_weapons.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item SurvivalMachete
    {
        Type = Weapon,                          // Identifies this as a weapon
        DisplayName = Survival Machete,
        Icon = Machete,                         // Using vanilla machete icon

        /* Damage Stats */
        MinDamage = 2.2,                        // Slightly higher than vanilla machete (2-3)
        MaxDamage = 3.2,                        // Better max damage for survival tool
        CriticalChance = 25,                    // Better crit than vanilla (20%)

        /* Combat Properties */
        MaxRange = 1.25,                        // Slightly longer reach than vanilla (1.23)
        MinRange = 0.61,                        // Standard minimum range
        SwingAnim = Bat,                        // Machete-style swing
        WeaponWeight = 2,                       // Matches vanilla Machete weight

        /* Speed and Handling */
        MinimumSwingTime = 3,                   // Attack speed (lower = faster)
        SwingTime = 3,                          // Same as min for consistent speed

        /* Durability */
        ConditionLowerChanceOneIn = 6,          // More durable than vanilla (5)
        ConditionMax = 15,                      // Better durability than vanilla (13)

        /* Utility Properties */
        TreeDamage = 18,                        // Excellent at chopping vegetation
        Categories = LongBlade,                 // Uses Long Blade skill

        /* Other Properties */
        MaxHitCount = 2,                        // Can hit 2 zombies per swing
        DoorDamage = 8,                         // Good door breaking
        KnockBackOnNoDeath = true,              // Knocks back zombies
        PushBackMod = 0.5,                      // Moderate pushback force
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "Survival Machete" and spawn it
4. Equip the machete and test combat

**What You Should See:**
- Machete appears with machete icon
- Damage 2.2-3.2 per hit (visible in info panel)
- 25% critical hit chance (occasional big damage spikes)
- Can hit 2 zombies per swing (cleave effect)
- Weighs 2.0 (same as vanilla machete)
- Excellent at chopping trees and vegetation (TreeDamage 18)
- Lasts longer than vanilla machete (ConditionMax 15 vs 13)

### Why This Works

This survival machete uses vanilla patterns:
- **Damage (2.2-3.2)** is slightly better than vanilla Machete (2-3) but not overpowered
- **CriticalChance (25)** is between vanilla Machete (20) and Katana (30)
- **Weight (2)** matches all vanilla LongBlade weapons
- **ConditionMax (15)** is higher than vanilla Machete (13) but realistic for "survival" quality
- **TreeDamage (18)** makes it useful for clearing vegetation (survival tool)
- **MaxHitCount (2)** allows hitting multiple zombies like other machetes
- **Categories = LongBlade** ensures it scales with Long Blade skill

---

## Source

Weapon definitions extracted from game files (`media/scripts/*.txt`).

**Note:** This reference includes melee weapons, firearms, and ammunition. Stats are based on Build 41 vanilla values.

---

## Property Reference

### Combat Properties

| Property | Description |
|----------|-------------|
| `MinDamage` / `MaxDamage` | Damage range per hit |
| `CriticalChance` | % chance for critical hit |
| `CritDmgMultiplier` | Damage multiplier on crit |
| `MaxHitCount` | Max zombies hit per swing |
| `KnockdownMod` | Knockdown chance modifier |
| `PushBackMod` | Push back force |

### Range & Speed

| Property | Description |
|----------|-------------|
| `MinRange` / `MaxRange` | Attack range |
| `BaseSpeed` | Attack speed multiplier |
| `SwingTime` | Swing duration |

### Durability

| Property | Description |
|----------|-------------|
| `ConditionMax` | Maximum durability |
| `ConditionLowerChanceOneIn` | 1-in-X chance to lose condition |

---

## Source

Definitions from `media/scripts/items_weapons.txt`
