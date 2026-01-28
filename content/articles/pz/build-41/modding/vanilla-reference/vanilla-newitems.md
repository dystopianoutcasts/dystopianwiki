---
id: vanilla-newitems
slug: vanilla-newitems
title: "Vanilla Items: newitems.txt"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - vanilla
  - items
excerpt: "Reference for 374 items from newitems.txt."
last_updated: 2026-01-18
---

# Vanilla Items Reference (newitems.txt)

## Introduction

You're creating a custom trap mod and need to know what weight vanilla bombs have. Or you're adding weapon attachments and want them to feel authentic. Or maybe you're creating miscellaneous items and need to know what diverse items exist in the base game.

If you're feeling overwhelmed by the sheer variety of items in Project Zomboid's newitems.txt, you're not alone. This file contains 374 different items spanning 10 categories: alarm clocks, containers, drainable items, food, keys, maps, moveable objects, normal items, weapons (traps/bombs), and weapon parts. It's a catch-all file for items that don't fit into specialized categories like clothing or vehicles. Figuring out what's "normal" for any given item category can feel impossible.

Here's the good news: this reference organizes all 374 vanilla items by type, so you can quickly find similar items and see what properties they use. I'll show you exactly how to use this reference to create balanced miscellaneous item mods.

## How to Use This Reference

When creating custom miscellaneous items, follow this pattern:

### Step 1: Find Similar Vanilla Items

Look through the item tables below and find items similar to what you're creating:

- **Making a trap/bomb?** Look at Weapon category (aerosol bombs, pipe bombs, smoke bombs, flame traps)
- **Making a weapon attachment?** Look at WeaponPart category (scopes, slings, gun lights, choke tubes)
- **Making a drainable item?** Look at Drainable category (duct tape, glue, hair dye, welding rods)
- **Making a key/lock?** Look at Key category (padlocks, keys, key ring)
- **Making a map?** Look at Map category (all maps weigh 0.1)
- **Making a general item?** Look at Normal category (231 items - tools, toys, electronics, crafting materials)

### Step 2: Compare Properties

Notice the patterns in vanilla miscellaneous items:

| Type | Weight Range | Examples |
|------|--------------|----------|
| **Maps** | 0.1 (ALL) | ALL maps weigh exactly 0.1 (Louisville, Muldraugh, Riverside, etc.) |
| **Keys** | 0.0-0.2 | Keys weigh 0.0 (weightless), Padlocks weigh 0.2 |
| **Traps/Bombs** | 1.5 (ALL) | ALL traps and bombs weigh 1.5 (consistent weight) |
| **Weapon Parts** | 0.1-1.0 | Scopes/sights (0.1-0.4), Slings/straps (0.5), Stocks (1.0) |
| **Hair Dyes** | 1.0 (ALL) | ALL hair dyes weigh 1.0 (bottle size) |
| **Drainable Household** | 0.1-0.3 | Soap (0.1), Duct tape (0.3), Bath towel (0.3) |
| **Moveable Objects** | 0.5-8.0 | Lamps/toasters (0.5), Mattress (8.0) |
| **Crafting Materials** | 0.1-5.0 | Aluminum (0.1), Bullets molds (0.5), Workable iron (5.0) |

### Step 3: Make Your Decision

Choose values that match the vanilla pattern:

- **Maps** → Always use weight 0.1 (every single vanilla map weighs 0.1)
- **Traps/bombs** → Always use weight 1.5 (all vanilla traps/bombs are 1.5)
- **Hair dyes** → Always use weight 1.0 (all vanilla hair dyes are 1.0)
- **Keys** → Use weight 0.0 (keys are weightless in vanilla)
- **Weapon attachments** → Use weight 0.1-1.0 based on size (scopes = light, stocks = heavy)
- **General items** → Look at similar items in Normal category for guidance

## Items by Type

### AlarmClock (2 items)

| Item | Weight | Description |
|------|--------|-------------|
| Alarm Clock | 0.5 | `Base.AlarmClock2` |
| Digital Watch | 0.0 | `Base.DigitalWatch2` |

### Container (6 items)

| Item | Weight | Description |
|------|--------|-------------|
| Key Ring | 0 | `Base.KeyRing` |
| Paper Bag | 0.1 | `Base.Paperbag_Spiffos` |
| Paper Bag | 0.1 | `Base.Paperbag_Jays` |
| Paper Bag | 0.1 | `Base.PaperBag` |
| Seed Bag | 0.1 | `Base.SeedBag` |
| Sewing Kit | 0.1 | `Base.SewingKit` |

### Drainable (45 items)

| Item | Weight | Description |
|------|--------|-------------|
| Alcohol Wipes | 0.3 | `Base.AlcoholWipes` |
| Baking Soda | 0.3 | `Base.BakingSoda` |
| Bath Towel | 0.3 | `Base.BathTowel` |
| Black Hair Dye | 1 | `Base.HairDyeBlack` |
| Bleach Bottle of Gasoline | 1.6 | `Base.PetrolBleachBottle` |
| Blonde Hair Dye | 1 | `Base.HairDyeBlonde` |
| Blue Hair Dye | 1 | `Base.HairDyeBlue` |
| Bottle of Disinfectant | 0.3 | `Base.Disinfectant` |
| Bottle of Gasoline | 0.8 | `Base.PetrolPopBottle` |
| Bottle of Gasoline | 0.8 | `Base.WaterBottlePetrol` |
| Bottle of Gasoline | 0.7 | `Base.WhiskeyPetrol` |
| Bottle of Gasoline | 1 | `Base.WinePetrol` |
| Cleaning Liquid | 1.0 | `Base.CleaningLiquid2` |
| Compost Bag | 2.0 | `Base.CompostBag` |
| Corn Flour | 1 | `Base.Cornflour` |
| Cotton Balls Doused in Alcohol | 0.1 | `Base.AlcoholedCottonBalls` |
| Duct Tape | 0.3 | `Base.DuctTape` |
| Extinguisher | 2 | `Base.Extinguisher` |
| Fishing Line | 0.1 | `Base.FishingLine` |
| Glue | 0.1 | `Base.Glue` |
| Gravy Mix | 0.1 | `Base.GravyMix` |
| Green Hair Dye | 1 | `Base.HairDyeGreen` |
| Gunpowder | 0.1 | `Base.GunPowder` |
| Hair gel | 0.1 | `Base.Hairgel` |
| Hand Torch | 0.5 | `Base.HandTorch` |
| Light Brown Hair Dye | 1 | `Base.HairDyeLightBrown` |
| Paint Bucket With Water | 4.0 | `Base.WaterPaintbucket` |
| Pancake Mix | 0.1 | `Base.PancakeMix` |
| Pink Hair Dye | 1 | `Base.HairDyePink` |
| Propane Torch | 1.0 | `Base.BlowTorch` |
| Red Hair Dye | 1 | `Base.HairDyeRed` |
| Rubber Duck | 0.1 | `Base.Rubberducky2` |
| Soap | 0.1 | `Base.Soap2` |
| Strawberry Blonde Hair Dye | 1 | `Base.HairDyeGinger` |
| Toilet Paper | 0.2 | `Base.ToiletPaper` |
| Twine | 0.1 | `Base.Twine` |
| Vinegar | 0.3 | `Base.Vinegar` |
| Vitamins | 0.2 | `Base.PillsVitamins` |
| Welding Rods | 1.5 | `Base.WeldingRods` |
| White Hair Dye | 1 | `Base.HairDyeWhite` |
| Wire | 0.2 | `Base.Wire` |
| Wood Glue | 0.1 | `Base.Woodglue` |
| Workable Iron | 5 | `Base.IronIngot` |
| Yeast | 0.1 | `Base.Yeast` |
| Yellow Hair Dye | 1 | `Base.HairDyeYellow` |

### Food (10 items)

| Item | Weight | Description |
|------|--------|-------------|
| Antibiotics | 0.1 | `Base.Antibiotics` |
| Jar of Bell Peppers | 0.5 | `Base.CannedBellPepper` |
| Jar of Broccoli | 0.5 | `Base.CannedBroccoli` |
| Jar of Cabbage | 0.5 | `Base.CannedCabbage` |
| Jar of Carrots | 0.5 | `Base.CannedCarrots` |
| Jar of Eggplants | 0.5 | `Base.CannedEggplant` |
| Jar of Leeks | 0.5 | `Base.CannedLeek` |
| Jar of Potatoes | 0.5 | `Base.CannedPotato` |
| Jar of Red Radishes | 0.5 | `Base.CannedRedRadish` |
| Jar of Tomatoes | 0.5 | `Base.CannedTomato` |

### Key (8 items)

| Item | Weight | Description |
|------|--------|-------------|
| Combination Padlock | 0.2 | `Base.CombinationPadlock` |
| Key | 0 | `Base.Key1` |
| Key | 0 | `Base.Key2` |
| Key | 0 | `Base.Key3` |
| Key | 0 | `Base.Key4` |
| Key | 0 | `Base.Key5` |
| Key | 0 | `Base.KeyPadlock` |
| Padlock | 0.2 | `Base.Padlock` |

### Map (15 items)

| Item | Weight | Description |
|------|--------|-------------|
| Louisville Map | 0.1 | `Base.LouisvilleMap1` |
| Louisville Map | 0.1 | `Base.LouisvilleMap2` |
| Louisville Map | 0.1 | `Base.LouisvilleMap3` |
| Louisville Map | 0.1 | `Base.LouisvilleMap4` |
| Louisville Map | 0.1 | `Base.LouisvilleMap5` |
| Louisville Map | 0.1 | `Base.LouisvilleMap6` |
| Louisville Map | 0.1 | `Base.LouisvilleMap7` |
| Louisville Map | 0.1 | `Base.LouisvilleMap8` |
| Louisville Map | 0.1 | `Base.LouisvilleMap9` |
| Map | 0.1 | `Base.Map` |
| March Ridge Map | 0.1 | `Base.MarchRidgeMap` |
| Muldraugh Map | 0.1 | `Base.MuldraughMap` |
| Riverside Map | 0.1 | `Base.RiversideMap` |
| Rosewood Map | 0.1 | `Base.RosewoodMap` |
| Westpoint Map | 0.1 | `Base.WestpointMap` |

### Moveable (11 items)

| Item | Weight | Description |
|------|--------|-------------|
| Mattress | 8 | `Base.Mattress` |
| Moveable | 0.5 | `Base.Mov_AntiqueStove` |
| Moveable | 0.5 | `Base.Mov_Lamp1` |
| Moveable | 0.5 | `Base.Mov_Lamp2` |
| Moveable | 0.5 | `Base.Mov_Lamp3` |
| Moveable | 0.5 | `Base.Mov_Lamp4` |
| Moveable | 0.5 | `Base.Mov_Lamp5` |
| Moveable | 0.5 | `Base.Mov_Lamp6` |
| Moveable | 0.5 | `Base.Mov_Microwave` |
| Moveable | 0.5 | `Base.Mov_Microwave2` |
| Moveable | 0.5 | `Base.Mov_Toaster` |

### Normal (231 items)

| Item | Weight | Description |
|------|--------|-------------|
| 223 Bullets Mold | 0.5 | `Base.223BulletsMold` |
| 308 Bullets Mold | 0.5 | `Base.308BulletsMold` |
| 9mm Bullets Mold | 0.5 | `Base.9mmBulletsMold` |
| Adhesive Bandages | 0.05 | `Base.Bandaid` |
| Adhesive Tape | 0.1 | `Base.Scotchtape` |
| Aluminum | 0.1 | `Base.Aluminum` |
| Amplifier | 0.3 | `Base.Amplifier` |
| Backgammon Board | 0.3 | `Base.BackgammonBoard` |
| Baking Pan | 0.1 | `Base.BakingPan` |
| Bandage | 0.1 | `Base.Bandage` |
| Baseball | 0.1 | `Base.Baseball` |
| Basketball | 0.2 | `Base.Basketball` |
| Bell | 0.1 | `Base.Bell` |
| Bellows | 0.1 | `Base.Bellows` |
| Big Spiffo | 5 | `Base.SpiffoBig` |
| Black Chess Pieces | 0.1 | `Base.ChessBlack` |
| Black Game Pieces | 0.1 | `Base.GamePieceBlack` |
| Blue Light Bulb | 0.1 | `Base.LightBulbBlue` |
| Blue Plate | 0.2 | `Base.PlateBlue` |
| Boris The Badger | 0.2 | `Base.BorisBadger` |
| Box of Jars | 1.8 | `Base.BoxOfJars` |
| Box of Nails | 0.3 | `Base.NailsBox` |
| Box of Paperclips | 0.3 | `Base.PaperclipBox` |
| Box of Screws | 0.3 | `Base.ScrewsBox` |
| Box of Sparklers | 0.2 | `Base.Sparklers` |
| Bricktoys | 0.1 | `Base.Bricktoys` |
| Broken Fishing Net Trap | 0.4 | `Base.BrokenFishingNet` |
| Button | 0.1 | `Base.Button` |
| CD | 0.1 | `Base.Disc` |
| CD | 0.1 | `Base.Disc_Retail` |
| Cage Trap | 1 | `Base.TrapCage` |
| Cake Batter | 0.3 | `Base.CakeBatter` |
| Camera | 0.2 | `Base.Camera` |
| Camera Film | 0.1 | `Base.CameraFilm` |
| Carving Fork | 0.1 | `Base.CarvingFork` |
| Cat Toy | 0.1 | `Base.CatToy` |
| Checkerboard | 0.3 | `Base.CheckerBoard` |
| Chipped Stone | 0.3 | `Base.SharpedStone` |
| Chopsticks | 0.1 | `Base.Chopsticks` |
| Cleaning Liquid | 0.3 | `Base.CleaningLiquid` |
| Cold Pack | 0.1 | `Base.Coldpack` |
| Cologne | 0.2 | `Base.Cologne` |
| Comb | 0.2 | `Base.Comb` |
| Comfrey | 0.1 | `Base.Comfrey` |
| Comfrey Poultice | 0.2 | `Base.ComfreyCataplasm` |
| Cordless Phone | 0.3 | `Base.CordlessPhone` |
| Cork | 0.1 | `Base.Cork` |
| Corkscrew | 0.1 | `Base.Corkscrew` |
| Corpse | 20.0 | `Base.CorpseMale` |
| Corpse | 20.0 | `Base.CorpseFemale` |
| *... and 181 more* | | |

### Weapon (32 items)

| Item | Weight | Description |
|------|--------|-------------|
| Aerosol Bomb | 1.5 | `Base.Aerosolbomb` |
| Aerosol Bomb with Sensor | 1.5 | `Base.AerosolbombSensorV1` |
| Aerosol Bomb with Sensor | 1.5 | `Base.AerosolbombSensorV2` |
| Aerosol Bomb with Sensor | 1.5 | `Base.AerosolbombSensorV3` |
| Aerosol Bomb with Timer | 1.5 | `Base.AerosolbombTriggered` |
| Alarm Clock | 0.5 | `Base.AlarmClock` |
| Flame Trap | 1.5 | `Base.FlameTrap` |
| Flame Trap with Sensor | 1.5 | `Base.FlameTrapSensorV1` |
| Flame Trap with Sensor | 1.5 | `Base.FlameTrapSensorV2` |
| Flame Trap with Sensor | 1.5 | `Base.FlameTrapSensorV3` |
| Flame Trap with Timer | 1.5 | `Base.FlameTrapTriggered` |
| Football | 0.425 | `Base.Football2` |
| Noise Generator with Sensor | 1.5 | `Base.NoiseTrapSensorV1` |
| Noise Generator with Sensor | 1.5 | `Base.NoiseTrapSensorV2` |
| Noise Generator with Sensor | 1.5 | `Base.NoiseTrapSensorV3` |
| Noise Generator with Timer | 1.5 | `Base.NoiseTrapTriggered` |
| Noise Maker | 1.5 | `Base.NoiseTrap` |
| Pipe Bomb | 1.5 | `Base.PipeBomb` |
| Pipe Bomb with Sensor | 1.5 | `Base.PipeBombSensorV1` |
| Pipe Bomb with Sensor | 1.5 | `Base.PipeBombSensorV2` |
| Pipe Bomb with Sensor | 1.5 | `Base.PipeBombSensorV3` |
| Pipe Bomb with Timer | 1.5 | `Base.PipeBombTriggered` |
| Remote Aerosol Bomb | 1.5 | `Base.AerosolbombRemote` |
| Remote Flame Trap | 1.5 | `Base.FlameTrapRemote` |
| Remote Noise Generator | 1.5 | `Base.NoiseTrapRemote` |
| Remote Pipe Bomb | 1.5 | `Base.PipeBombRemote` |
| Remote Smoke Bomb | 1.5 | `Base.SmokeBombRemote` |
| Smoke Bomb | 1.5 | `Base.SmokeBomb` |
| Smoke Bomb with Sensor | 1.5 | `Base.SmokeBombSensorV1` |
| Smoke Bomb with Sensor | 1.5 | `Base.SmokeBombSensorV2` |
| Smoke Bomb with Sensor | 1.5 | `Base.SmokeBombSensorV3` |
| Smoke Bomb with Timer | 1.5 | `Base.SmokeBombTriggered` |

### WeaponPart (14 items)

| Item | Weight | Description |
|------|--------|-------------|
| Ammo Straps | 0.5 | `Base.AmmoStraps` |
| Bayonnet | 0.2 | `Base.Bayonnet` |
| Choke Tube Full | 0.1 | `Base.ChokeTubeFull` |
| Choke Tube Improved | 0.1 | `Base.ChokeTubeImproved` |
| Fiberglass Stock | 1 | `Base.FiberglassStock` |
| Gun Light | 0.2 | `Base.GunLight` |
| Iron Sight | 0.1 | `Base.IronSight` |
| Laser | 0.2 | `Base.Laser` |
| Recoil Pad | 0.1 | `Base.RecoilPad` |
| Red Dot | 0.2 | `Base.RedDot` |
| Sling | 0.5 | `Base.Sling` |
| x2 Scope | 0.3 | `Base.x2Scope` |
| x4 Scope | 0.4 | `Base.x4Scope` |
| x8 Scope | 0.8 | `Base.x8Scope` |

---

## Common Mistakes

### ❌ Wrong: Custom Map with Wrong Weight

```
item MyCustomCityMap
{
    Type = Map,
    DisplayName = Custom City Map,
    Weight = 0.5,                           // WRONG! All maps weigh 0.1
}
```

**Why it's wrong:** Looking at vanilla maps (Louisville, Muldraugh, Riverside, Rosewood, Westpoint, March Ridge), EVERY SINGLE MAP weighs 0.1. Maps are folded paper - they're very light. Your custom map at 0.5 weight is 5x heavier than any vanilla map.

✅ **Right:**

```
item MyCustomCityMap
{
    Type = Map,
    DisplayName = Custom City Map,
    Weight = 0.1,                            // Matches ALL vanilla maps
    Map = CustomCity,                        // Map ID for the area
    DisplayCategory = Literature,            // Shows in literature category
}
```

### ❌ Wrong: Custom Trap with Inconsistent Weight

```
item MyCustomTrap
{
    Type = Weapon,
    DisplayName = Custom Noise Trap,
    Weight = 3.0,                           // WRONG! Traps don't weigh 3.0
}
```

**Why it's wrong:** Looking at vanilla traps and bombs (Aerosol Bomb, Pipe Bomb, Smoke Bomb, Flame Trap, Noise Maker), ALL traps and bombs weigh 1.5. Your custom trap at 3.0 weight is 2x heavier than any vanilla trap.

✅ **Right:**

```
item MyCustomNoiseTrap
{
    Type = Weapon,
    DisplayName = Custom Noise Trap,
    Weight = 1.5,                            // Matches ALL vanilla traps/bombs
    ExplosionSound = TrapExplosion,          // Sound when triggered
    ExplosionPower = 0,                      // No damage (noise only)
    ExplosionRange = 50,                     // Noise range
}
```

### ❌ Wrong: Hair Dye with Wrong Weight

```
item MyCustomPurpleHairDye
{
    Type = Drainable,
    DisplayName = Purple Hair Dye,
    Weight = 0.3,                           // WRONG! Hair dyes don't weigh 0.3
    UseDelta = 0.25,
}
```

**Why it's wrong:** Looking at vanilla hair dyes (Black, Blonde, Blue, Green, Light Brown, Pink, Red, White, Yellow, Ginger), ALL hair dyes weigh 1.0. Hair dye comes in bottles - they're heavier than small items. Your custom hair dye at 0.3 weight is 3x lighter than vanilla hair dyes.

✅ **Right:**

```
item MyCustomPurpleHairDye
{
    Type = Drainable,
    DisplayName = Purple Hair Dye,
    Weight = 1.0,                            // Matches ALL vanilla hair dyes
    UseDelta = 0.25,                         // 4 uses per bottle (same as vanilla)
    DisplayCategory = FirstAid,              // Shows in first aid category
}
```

## Try It Yourself

Let's create a custom weapon scope using vanilla weapon part patterns.

### Step 1: Research Similar Items

Look at the reference above and find weapon scopes:
- Iron Sight: Weight 0.1
- Red Dot: Weight 0.2
- x2 Scope: Weight 0.3
- x4 Scope: Weight 0.4
- x8 Scope: Weight 0.8

Pattern: Higher magnification = heavier scope (0.3 for x2, 0.4 for x4, 0.8 for x8)

### Step 2: Create the Item File

Create `media/scripts/my_weaponparts.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item x6Scope
    {
        Type = WeaponPart,                       // Identifies this as a weapon attachment
        DisplayName = x6 Scope,
        Icon = x4Scope,                          // Using vanilla x4 scope icon
        Weight = 0.6,                            // Between x4 (0.4) and x8 (0.8)
        MountOn = Rifle;AssaultRifle,            // Can mount on rifles and assault rifles
        AimingPerkRangeIncrease = 2,             // Increases aiming range by 2
        AimingTime = 30,                         // Time to aim (30 frames)
        DisplayCategory = WeaponPart,            // Shows in weapon part category
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "x6 Scope" and spawn it
4. Also spawn a rifle (e.g., "Hunting Rifle")
5. Right-click the rifle and look for attachment options

**What You Should See:**
- x6 Scope appears with scope icon
- Shows "Attach x6 Scope" when right-clicking compatible rifles
- After attaching: increases aiming range by 2
- Item weighs 0.6 (between x4 and x8 scopes)
- Can be removed and reattached

### Why This Works

This x6 scope uses vanilla patterns:
- **Weight (0.6)** follows the progression pattern (x2=0.3, x4=0.4, x6=0.6, x8=0.8)
- **Type = WeaponPart** makes it function as an attachment
- **MountOn** specifies compatible weapon types
- **AimingPerkRangeIncrease** provides meaningful benefit (better range)
- **Weight scales with magnification** just like vanilla scopes

---

## Source

Definitions from `media/scripts/newitems.txt`

**Note:** This reference contains miscellaneous items that don't fit into specialized categories (food, clothing, weapons, vehicles). It's a catch-all file covering diverse item types.
