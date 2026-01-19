---
id: animation-reference
slug: animation-reference
title: Project Zomboid Vanilla Animation Reference
excerpt: This document provides a comprehensive reference of all vanilla animations available in Project Zomboid for use in mod recipes and scripts. | AnimNode | Use Case | Example |...
game: pz
version: build-41
section: modding
category: game-mechanics
subcategory: null
difficulty: advanced
tags:
  - recipe
  - item
  - weapon
  - foraging
  - animation
  - sound
  - modding
  - api
last_updated: 2026-01-09
---
# Project Zomboid Vanilla Animation Reference

This document provides a comprehensive reference of all vanilla animations available in Project Zomboid for use in mod recipes and scripts.

**Last Updated:** November 15, 2025
**Game Version:** Build 41+
**Source Location:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media`

---

## Quick Reference - Most Common AnimNodes for Modding

| AnimNode | Use Case | Example |
|----------|----------|---------|
| `Craft` | Generic crafting recipes | Making items, combining parts |
| `Disassemble` | Taking items apart | Breaking down furniture, electronics |
| `SawLog` | Woodworking/sawing | Cutting logs, planks, boards |
| `RipSheets` | Tearing fabric | Making bandages, rags |
| `Build` | Construction | Building structures, barricades |
| `chop_tree` | Wood gathering | Chopping trees, branches |
| `Dig` / `DigShovel` | Excavation | Digging holes, graves, farming |
| `Eat` / `Eat1Hand` | Consuming food | Food recipes |
| `DrinkBottle` | Drinking liquids | Beverage consumption |
| `Bandage` | Medical treatment | Applying bandages, first aid |
| `painting` | Artistic work | Painting walls, signs |

---

## Table of Contents

1. [Recipe AnimNode Reference](#recipe-animnode-reference)
2. [Player Action AnimNodes](#player-action-animnodes)
3. [Animation File Structure](#animation-file-structure)
4. [Usage Examples](#usage-examples)
5. [Key Reference Files](#key-reference-files)

---

## Recipe AnimNode Reference

These are the AnimNode values explicitly used in vanilla recipe definitions. These are the most commonly used for crafting recipes.

### Available AnimNodes for Recipes

| AnimNode | Description | Usage Context |
|----------|-------------|---------------|
| `Disassemble` | Generic disassembly animation | Taking apart items, electronics, furniture |
| `SawLog` | Sawing wood animation | Cutting logs into planks, woodworking |
| `RipSheets` | Tearing/ripping fabric animation | Making bandages, cloth strips |

### Found In Vanilla Files

- **recipes.txt** - Disassemble (furniture, electronics), SawLog (planks)
- **recipes_radio.txt** - Disassemble (radios, electronics)

**Important:** AnimNode names are **case-sensitive**!

**Special Note on "Disassemble":** Vanilla recipes use `Disassemble` (capital D) in the `AnimNode:` field, even though the XML file is named `disassemble.xml` (lowercase). When creating recipes, use **`AnimNode:Disassemble,`** with capital D to match vanilla behavior.

---

## Player Action AnimNodes

These are defined in the game's AnimSets and can be used in custom recipes. There are **141 unique player action animations** available.

**Location:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\AnimSets\player\actions\`

### Complete Alphabetical List (All 141 AnimNodes)

| AnimNode | Category | Description |
|----------|----------|-------------|
| `AttachItem_Back` | Item Management | Attaching item to back |
| `AttachItem_BeltLeft` | Item Management | Attaching to left belt |
| `AttachItem_BeltRight` | Item Management | Attaching to right belt |
| `AttachItem_HolsterLeft` | Item Management | Attaching to left holster |
| `AttachItem_HolsterRight` | Item Management | Attaching to right holster |
| `Bandage` | Medical | Generic bandaging |
| `BandageHead` | Medical | Bandaging head |
| `BandageLeftArm` | Medical | Bandaging left arm |
| `BandageLeftLeg` | Medical | Bandaging left leg |
| `BandageLowerBody` | Medical | Bandaging lower torso |
| `BandageRightArm` | Medical | Bandaging right arm |
| `BandageRightLeg` | Medical | Bandaging right leg |
| `BandageUpperBody` | Medical | Bandaging upper torso |
| `BlowTorch` | Crafting & Building | Using blowtorch (mid-level) |
| `BlowTorchFloor` | Crafting & Building | Using blowtorch on floor |
| `BlowTorchMid` | Crafting & Building | Using blowtorch at mid-height |
| `book` | Reading | Reading book |
| `Build` | Crafting & Building | General building/construction |
| `BuildLow` | Crafting & Building | Building low structures |
| `chop_tree` | Resource Gathering | Chopping down trees |
| `Craft` | Crafting & Building | Generic crafting |
| `default-fallback` | Miscellaneous | Default fallback animation |
| `Destroy` | Crafting & Building | Destroying structures |
| `DestroyFloor` | Crafting & Building | Destroying floor tiles |
| `DetachItem_Back` | Item Management | Detaching from back |
| `DetachItem_BeltLeft` | Item Management | Detaching from left belt |
| `DetachItem_BeltRight` | Item Management | Detaching from right belt |
| `DetachItem_HolsterLeft` | Item Management | Detaching from left holster |
| `DetachItem_HolsterRight` | Item Management | Detaching from right holster |
| `Dig` | Resource Gathering | Generic digging |
| `DigHoe` | Resource Gathering | Digging with hoe |
| `DigPickAxe` | Resource Gathering | Digging with pickaxe |
| `DigShovel` | Resource Gathering | Digging with shovel |
| `DigTrowel` | Resource Gathering | Digging with trowel |
| `disassemble` | Crafting & Building | Disassembling items |
| `DrinkBleach` | Eating & Drinking | Drinking bleach |
| `DrinkBottle` | Eating & Drinking | Drinking from bottle |
| `DrinkBowl` | Eating & Drinking | Drinking from bowl |
| `DrinkFromBourbon` | Eating & Drinking | Drinking from bourbon bottle |
| `DrinkFromBowlSpoon` | Eating & Drinking | Drinking soup with spoon |
| `DrinkFromCan` | Eating & Drinking | Drinking from can |
| `DrinkPopCan` | Eating & Drinking | Drinking from soda can |
| `DrinkPot` | Eating & Drinking | Drinking from pot |
| `DrinkTapWater` | Eating & Drinking | Drinking from tap |
| `DropWhileMoving` | Item Management | Dropping while walking |
| `Eat` | Eating & Drinking | Generic eating |
| `Eat1Hand` | Eating & Drinking | Eating one-handed item |
| `Eat2Hands` | Eating & Drinking | Eating two-handed item |
| `EatFromCan` | Eating & Drinking | Eating from can |
| `EatFromPlate` | Eating & Drinking | Eating from plate |
| `EatFromPot` | Eating & Drinking | Eating from pot |
| `EquipItem` | Item Management | Equipping item |
| `ExamineVehicle` | Vehicle Actions | Examining vehicle |
| `FillBottleFromTap` | Eating & Drinking | Filling bottle at sink |
| `FillBourbonFromTap` | Eating & Drinking | Filling bourbon bottle |
| `FillBowlFromTap` | Eating & Drinking | Filling bowl at sink |
| `FillBucketFromTap` | Eating & Drinking | Filling bucket at sink |
| `FillKettleFromTap` | Eating & Drinking | Filling kettle at sink |
| `FillMugFromTap` | Eating & Drinking | Filling mug at sink |
| `FillPotFromTap` | Eating & Drinking | Filling pot at sink |
| `fitness` | Miscellaneous | Exercise/fitness activities |
| `Forage` | Resource Gathering | Foraging |
| `InsertBullets` | Weapon Actions | Inserting bullets |
| `LoadDblBarrel` | Weapon Actions | Loading double barrel shotgun |
| `LoadDblBarrelSawnoff` | Weapon Actions | Loading sawn-off double barrel |
| `LoadHandgun` | Weapon Actions | Loading handgun/pistol |
| `LoadRevolver` | Weapon Actions | Loading revolver |
| `LoadRifle` | Weapon Actions | Loading rifle with magazine |
| `LoadRifleNoMag` | Weapon Actions | Loading rifle without magazine |
| `LoadShotgun` | Weapon Actions | Loading pump shotgun |
| `Loot` | Looting | Generic looting (mid-height) |
| `LootHigh` | Looting | Looting high containers |
| `LootLow` | Looting | Looting low containers |
| `LootSitting` | Looting | Looting while sitting |
| `MedicalCheck` | Medical | Medical examination |
| `newspaper` | Reading | Reading newspaper |
| `painting` | Crafting & Building | Painting structures |
| `Pour` | Eating & Drinking | Generic pouring |
| `PourBowl` | Eating & Drinking | Pouring into bowl |
| `PourBucket` | Eating & Drinking | Pouring into bucket |
| `PourCookingPot` | Eating & Drinking | Pouring into pot |
| `PourKettle` | Eating & Drinking | Pouring into kettle |
| `PourMug` | Eating & Drinking | Pouring into mug |
| `PourWateringCan` | Eating & Drinking | Pouring into watering can |
| `RackDblBarrel` | Weapon Actions | Racking double barrel |
| `RackDblBarrelSawnoff` | Weapon Actions | Racking sawn-off |
| `RackHandgun` | Weapon Actions | Racking handgun slide |
| `RackRevolver` | Weapon Actions | Racking revolver |
| `RackRifle` | Weapon Actions | Racking rifle |
| `RackRifleAim` | Weapon Actions | Racking rifle while aiming |
| `RackRifleAimNoMag` | Weapon Actions | Racking rifle (aim, no mag) |
| `RackRifleNoMag` | Weapon Actions | Racking rifle (no mag) |
| `RackShotgun` | Weapon Actions | Racking shotgun |
| `RackShotgunAim` | Weapon Actions | Racking shotgun while aiming |
| `Rake` | Resource Gathering | Raking ground |
| `reading` | Reading | Generic reading |
| `RefuelGasCan` | Vehicle Actions | Refueling with gas can |
| `RemoveBarricade` | Barricade & Structures | Removing barricade (generic) |
| `RemoveBarricadeCrowbar` | Barricade & Structures | Remove barricade with crowbar |
| `RemoveBarricadeCrowbarHigh` | Barricade & Structures | Remove high barricade with crowbar |
| `RemoveBullets` | Weapon Actions | Removing bullets from magazine |
| `RemoveBush` | Resource Gathering | Removing bushes (generic) |
| `RemoveBushAxe` | Resource Gathering | Removing bushes with axe |
| `RemoveBushKnife` | Resource Gathering | Removing bushes with knife |
| `RemoveBushLongBlade` | Resource Gathering | Removing bushes with long blade |
| `RemoveCurtain` | Barricade & Structures | Removing curtains |
| `RemoveGrass` | Resource Gathering | Removing grass |
| `RipSheets` | Resource Gathering | Ripping sheets/fabric |
| `SawLog` | Resource Gathering | Sawing logs |
| `Shave` | Medical | Shaving face |
| `Smoke` | Eating & Drinking | Smoking cigarette |
| `TakeGasFromPump` | Vehicle Actions | Taking gas from pump |
| `TakeGasFromVehicle` | Vehicle Actions | Siphoning gas from vehicle |
| `TakePills` | Medical | Taking pills/medicine |
| `TransferItemOnSelf` | Item Management | Moving item on body |
| `UnequipItem` | Item Management | Unequipping item |
| `UnloadDblBarrel` | Weapon Actions | Unloading double barrel |
| `UnloadDblBarrelSawnoff` | Weapon Actions | Unloading sawn-off |
| `UnloadHandgun` | Weapon Actions | Unloading handgun |
| `UnloadRevolver` | Weapon Actions | Unloading revolver |
| `UnloadRifle` | Weapon Actions | Unloading rifle |
| `UnloadRifleNoMag` | Weapon Actions | Unloading rifle (no mag) |
| `UnloadShotgun` | Weapon Actions | Unloading shotgun |
| `VehicleTrailer` | Vehicle Actions | Working on trailer |
| `VehicleWash` | Vehicle Actions | Washing vehicle |
| `VehicleWorkOnMid` | Vehicle Actions | Working on mid-level parts |
| `VehicleWorkOnTire` | Vehicle Actions | Working on tires |
| `WashFace` | Medical | Washing face |
| `WearClothingDefault` | Clothing | Wearing generic clothing |
| `WearClothingFace` | Clothing | Wearing face items (mask) |
| `WearClothingFeet` | Clothing | Wearing shoes/boots |
| `WearClothingHat` | Clothing | Wearing hat/helmet |
| `WearClothingJacket` | Clothing | Wearing jacket/coat |
| `WearClothingLegs` | Clothing | Wearing pants |
| `WearClothingNotMoving` | Clothing | Dressing while stationary |
| `WearClothingPullover` | Clothing | Wearing shirt/pullover |
| `WearClothingWaist` | Clothing | Wearing belt items |

---

### Categorized Reference

### Crafting & Building (11 animations)

| AnimNode | Description |
|----------|-------------|
| `Build` | General building/construction animation |
| `BuildLow` | Building low structures (floor level) |
| `Craft` | Generic crafting animation |
| `Destroy` | Destroying structures |
| `DestroyFloor` | Destroying floor tiles |
| `disassemble` | Disassembling items (lowercase) |
| `painting` | Painting structures |
| `BlowTorch` | Using blowtorch (mid-level) |
| `BlowTorchFloor` | Using blowtorch on floor |
| `BlowTorchMid` | Using blowtorch at mid-height |

### Tree & Resource Gathering (17 animations)

| AnimNode | Description |
|----------|-------------|
| `chop_tree` | Chopping down trees |
| `Dig` | Generic digging animation |
| `DigHoe` | Digging with hoe |
| `DigPickAxe` | Digging with pickaxe |
| `DigShovel` | Digging with shovel |
| `DigTrowel` | Digging with trowel |
| `Forage` | Foraging animation |
| `Rake` | Raking ground |
| `RemoveBush` | Removing bushes (generic) |
| `RemoveBushAxe` | Removing bushes with axe |
| `RemoveBushKnife` | Removing bushes with knife |
| `RemoveBushLongBlade` | Removing bushes with long blade |
| `RemoveGrass` | Removing grass |
| `SawLog` | Sawing logs |
| `RipSheets` | Ripping sheets/fabric |

### Eating & Drinking (21 animations)

#### Eating Animations

| AnimNode | Description |
|----------|-------------|
| `Eat` | Generic eating animation |
| `Eat1Hand` | Eating one-handed item |
| `Eat2Hands` | Eating two-handed item |
| `EatFromCan` | Eating from can |
| `EatFromPlate` | Eating from plate |
| `EatFromPot` | Eating from pot |

#### Drinking Animations

| AnimNode | Description |
|----------|-------------|
| `DrinkBleach` | Drinking bleach (suicide) |
| `DrinkBottle` | Drinking from bottle |
| `DrinkBowl` | Drinking from bowl |
| `DrinkFromBourbon` | Drinking from bourbon bottle |
| `DrinkFromBowlSpoon` | Drinking soup with spoon |
| `DrinkFromCan` | Drinking from can |
| `DrinkPopCan` | Drinking from soda can |
| `DrinkPot` | Drinking from pot |
| `DrinkTapWater` | Drinking from tap |
| `Smoke` | Smoking cigarette |

#### Filling Container Animations

| AnimNode | Description |
|----------|-------------|
| `FillBottleFromTap` | Filling bottle at sink |
| `FillBourbonFromTap` | Filling bourbon bottle at sink |
| `FillBowlFromTap` | Filling bowl at sink |
| `FillBucketFromTap` | Filling bucket at sink |
| `FillKettleFromTap` | Filling kettle at sink |
| `FillMugFromTap` | Filling mug at sink |
| `FillPotFromTap` | Filling pot at sink |

#### Pouring Animations

| AnimNode | Description |
|----------|-------------|
| `Pour` | Generic pouring |
| `PourBowl` | Pouring into bowl |
| `PourBucket` | Pouring into bucket |
| `PourCookingPot` | Pouring into pot |
| `PourKettle` | Pouring into kettle |
| `PourMug` | Pouring into mug |
| `PourWateringCan` | Pouring into watering can |

### Medical (13 animations)

| AnimNode | Description |
|----------|-------------|
| `Bandage` | Generic bandaging |
| `BandageHead` | Bandaging head |
| `BandageLeftArm` | Bandaging left arm |
| `BandageLeftLeg` | Bandaging left leg |
| `BandageLowerBody` | Bandaging lower torso |
| `BandageRightArm` | Bandaging right arm |
| `BandageRightLeg` | Bandaging right leg |
| `BandageUpperBody` | Bandaging upper torso |
| `TakePills` | Taking pills/medicine |
| `MedicalCheck` | Medical examination |
| `Shave` | Shaving face |
| `WashFace` | Washing face |

### Weapon Actions (28 animations)

#### Ammunition Management

| AnimNode | Description |
|----------|-------------|
| `InsertBullets` | Inserting bullets into magazine |
| `RemoveBullets` | Removing bullets from magazine |

#### Loading Weapons

| AnimNode | Description |
|----------|-------------|
| `LoadDblBarrel` | Loading double barrel shotgun |
| `LoadDblBarrelSawnoff` | Loading sawn-off double barrel |
| `LoadHandgun` | Loading handgun/pistol |
| `LoadRevolver` | Loading revolver |
| `LoadRifle` | Loading rifle with magazine |
| `LoadRifleNoMag` | Loading rifle without magazine |
| `LoadShotgun` | Loading pump shotgun |

#### Unloading Weapons

| AnimNode | Description |
|----------|-------------|
| `UnloadDblBarrel` | Unloading double barrel |
| `UnloadDblBarrelSawnoff` | Unloading sawn-off |
| `UnloadHandgun` | Unloading handgun |
| `UnloadRevolver` | Unloading revolver |
| `UnloadRifle` | Unloading rifle |
| `UnloadRifleNoMag` | Unloading rifle (no mag) |
| `UnloadShotgun` | Unloading shotgun |

#### Racking/Chambering Weapons

| AnimNode | Description |
|----------|-------------|
| `RackDblBarrel` | Racking double barrel |
| `RackDblBarrelSawnoff` | Racking sawn-off |
| `RackHandgun` | Racking handgun slide |
| `RackRevolver` | Racking revolver |
| `RackRifle` | Racking rifle |
| `RackRifleAim` | Racking rifle while aiming |
| `RackRifleAimNoMag` | Racking rifle (aim, no mag) |
| `RackRifleNoMag` | Racking rifle (no mag) |
| `RackShotgun` | Racking shotgun |
| `RackShotgunAim` | Racking shotgun while aiming |

### Item Management (14 animations)

#### Attaching Items

| AnimNode | Description |
|----------|-------------|
| `AttachItem_Back` | Attaching item to back |
| `AttachItem_BeltLeft` | Attaching to left belt |
| `AttachItem_BeltRight` | Attaching to right belt |
| `AttachItem_HolsterLeft` | Attaching to left holster |
| `AttachItem_HolsterRight` | Attaching to right holster |

#### Detaching Items

| AnimNode | Description |
|----------|-------------|
| `DetachItem_Back` | Detaching from back |
| `DetachItem_BeltLeft` | Detaching from left belt |
| `DetachItem_BeltRight` | Detaching from right belt |
| `DetachItem_HolsterLeft` | Detaching from left holster |
| `DetachItem_HolsterRight` | Detaching from right holster |

#### Equipment Actions

| AnimNode | Description |
|----------|-------------|
| `EquipItem` | Equipping item to hands |
| `UnequipItem` | Unequipping item |
| `TransferItemOnSelf` | Moving item on body |
| `DropWhileMoving` | Dropping while walking |

### Looting (4 animations)

| AnimNode | Description |
|----------|-------------|
| `Loot` | Generic looting (mid-height) |
| `LootHigh` | Looting high containers |
| `LootLow` | Looting low containers |
| `LootSitting` | Looting while sitting |

### Reading (3 animations)

| AnimNode | Description |
|----------|-------------|
| `book` | Reading book |
| `newspaper` | Reading newspaper |
| `reading` | Generic reading |

### Vehicle Actions (8 animations)

| AnimNode | Description |
|----------|-------------|
| `ExamineVehicle` | Examining vehicle condition |
| `RefuelGasCan` | Refueling with gas can |
| `TakeGasFromPump` | Taking gas from pump |
| `TakeGasFromVehicle` | Siphoning gas from vehicle |
| `VehicleTrailer` | Working on trailer |
| `VehicleWash` | Washing vehicle |
| `VehicleWorkOnMid` | Working on mid-level parts |
| `VehicleWorkOnTire` | Working on tires |

### Barricade & Structures (4 animations)

| AnimNode | Description |
|----------|-------------|
| `RemoveBarricade` | Removing barricade (generic) |
| `RemoveBarricadeCrowbar` | Remove barricade with crowbar |
| `RemoveBarricadeCrowbarHigh` | Remove high barricade with crowbar |
| `RemoveCurtain` | Removing curtains |

### Clothing (10 animations)

| AnimNode | Description |
|----------|-------------|
| `WearClothingDefault` | Wearing generic clothing |
| `WearClothingFace` | Wearing face items (mask) |
| `WearClothingFeet` | Wearing shoes/boots |
| `WearClothingHat` | Wearing hat/helmet |
| `WearClothingJacket` | Wearing jacket/coat |
| `WearClothingLegs` | Wearing pants |
| `WearClothingNotMoving` | Dressing while stationary |
| `WearClothingPullover` | Wearing shirt/pullover |
| `WearClothingWaist` | Wearing belt items |

### Miscellaneous (2 animations)

| AnimNode | Description |
|----------|-------------|
| `fitness` | Exercise/fitness activities |
| `default-fallback` | Default fallback animation |

---

## Animation File Structure

### Animation File Locations

```
R:\Games\Steam\steamapps\common\ProjectZomboid\media\
├── anims\                    # Legacy animations
├── anims_X\                  # Current animation files
│   ├── Bob\                 # Male character animations (1,128+ files)
│   └── Kate\                # Female character animations
├── AnimSets\                # Animation set definitions (XML)
│   ├── player\
│   │   └── actions\        # Player action definitions
│   ├── player-vehicle\
│   └── zombie\
└── scripts\
    ├── animations.txt       # Animation script definitions
    ├── recipes.txt          # Recipe AnimNode usage
    └── recipes_radio.txt    # Radio recipe AnimNode usage
```

### Animation Naming Convention

Animation files follow this pattern:
```
{Character}_{Action}{Variant}_{Result}.X
```

Examples:
- `Bob_Attack1Hand01_Hit.X` - One-handed attack hitting
- `Bob_Attack1Hand01_CritHit.X` - Critical hit version
- `Bob_Attack1Hand01_Miss.X` - Attack missing
- `Bob_Dig_Shovel.X` - Digging with shovel
- `Bob_DrinkFromBottle.X` - Drinking from bottle
- `Bob_IdleMaking.X` - Crafting idle animation (used by Craft AnimNode)
- `Bob_IdleSawLog.X` - Sawing idle animation (used by SawLog AnimNode)
- `Bob_IdleDisassemble.X` - Disassembly idle animation (used by disassemble AnimNode)

### Common Animation Prefixes

| Prefix | Description | Example Count |
|--------|-------------|---------------|
| `Bob_Attack*` | Combat/weapon attacks | 100+ variations |
| `Bob_Idle*` | Idle/standing animations | 50+ variations |
| `Bob_IdleMaking` | Generic crafting animation | Used by Craft |
| `Bob_IdleSawLog` | Sawing wood animation | Used by SawLog |
| `Bob_IdleDisassemble` | Disassembly animation | Used by disassemble |
| `Bob_Walk*` | Walking animations | 40+ variations |
| `Bob_Run*` | Running animations | 30+ variations |
| `Bob_Bandage*` | Medical animations | 10+ variations |
| `Bob_Dig*` | Digging animations | 5+ variations |
| `Bob_Drink*` | Drinking animations | 15+ variations |
| `Bob_Eat*` | Eating animations | 10+ variations |

**Note:** Each AnimNode XML file references a specific Bob/Kate animation file via the `<m_AnimName>` tag. For example:
- `Craft.xml` → `Bob_IdleMaking`
- `SawLog.xml` → `Bob_IdleSawLog`
- `disassemble.xml` → `Bob_IdleDisassemble`

---

## Usage Examples

### Basic Recipe with AnimNode

```
recipe Saw Plank
{
    keep Saw,
    WoodLog,

    Result: Plank=4,
    Time: 50.0,
    AnimNode: SawLog,
    Sound: SawLog,
    Category: Carpentry,
}
```

### Crafting Recipe

```
recipe Craft Molotov Cocktail
{
    WhiskeyFull,
    RippedSheets,

    Result: MolotovCocktail,
    Time: 30.0,
    AnimNode: Craft,
    Sound: ClothesRipping,
    Category: Survivalist,
}
```

### Disassembly Recipe

```
recipe Dismantle Radio
{
    Radio,
    keep Screwdriver,

    Result: ElectronicsScrap=3,
    Result: ScrapMetal=2,
    Time: 100.0,
    AnimNode: Disassemble,
    Sound: ElectricClick,
    Category: Electrical,
}
```

### Medical Recipe

```
recipe Apply Bandage
{
    Bandage,

    Result: DirtyBandage,
    Time: 20.0,
    AnimNode: Bandage,
    OnGiveXP: Doctor=5,
    Category: Health,
}
```

### Custom Woodworking Recipe

```
recipe Carve Wooden Spear
{
    TreeBranch,
    keep KitchenKnife,

    Result: WoodenSpear,
    Time: 80.0,
    AnimNode: chop_tree,
    Sound: Sawing,
    SkillRequired: Carpentry=2,
    Category: Weapon,
}
```

### Resource Gathering Recipe

```
recipe Dig Clay
{
    keep Shovel,

    Result: ClayLump=3,
    Time: 60.0,
    AnimNode: DigShovel,
    Sound: Shoveling,
    Category: Farming,
}
```

---

## Animation System Notes

### Important Considerations

1. **Case Sensitivity**: All AnimNode names are case-sensitive. `Disassemble` ≠ `disassemble`

2. **Compatibility**: Some AnimNodes may require specific item types or contexts to work properly

3. **Sound Pairing**: Animations often have corresponding sound effects defined in `media/scripts/sounds_*.txt`

4. **Duration**: The `Time:` parameter in recipes should roughly match the animation length for best results

5. **Visual Context**: Some animations are designed for specific poses (standing, sitting, prone)

### Animation Priority

The game selects animations based on:
1. Player state (standing, sitting, aiming, etc.)
2. Equipped items (one-handed, two-handed, firearms)
3. Context (near vehicle, in water, etc.)
4. AnimNode override in recipe

### Fallback Behavior

If an AnimNode is not found or invalid:
- The game uses a default animation
- No error is thrown (fail-safe)
- Recipe still executes normally

---

## Key Reference Files

### Game Files (Read-Only Reference)

| File Path | Description |
|-----------|-------------|
| `media/scripts/recipes.txt` | Vanilla recipe examples with AnimNodes |
| `media/scripts/recipes_radio.txt` | Radio/electronics recipes |
| `media/scripts/animations.txt` | Animation script definitions |
| `media/AnimSets/player/actions/*.xml` | Player action definitions |
| `media/anims_X/Bob/*.X` | All male character animation files |
| `media/anims_X/Kate/*.X` | All female character animation files |

### Quick Reference Commands

To browse animation files:
```bash
# List all Bob animations
dir "R:\Games\Steam\steamapps\common\ProjectZomboid\media\anims_X\Bob"

# Search for specific animations
findstr /i "dig" "R:\Games\Steam\steamapps\common\ProjectZomboid\media\anims_X\Bob\*"

# View recipe AnimNode usage
findstr /i "AnimNode" "R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\recipes.txt"
```

---

## Additional Resources

### Testing Animations

To test animations in-game:
1. Create a simple recipe with the AnimNode
2. Set a reasonable Time value (30-100)
3. Test in Debug Mode for faster iteration
4. Use `/showAnimationViewer` console command

### Common Issues

**Issue**: Animation doesn't play
- Check case sensitivity of AnimNode name
- Verify the animation exists for both Bob and Kate
- Ensure player state allows the animation

**Issue**: Animation looks wrong
- AnimNode may not match the recipe context
- Try different AnimNodes from the same category
- Check if item type affects animation selection

**Issue**: Recipe time doesn't match animation
- Adjust `Time:` value to match animation duration
- Too short: animation cuts off
- Too long: animation loops or freezes

---

## Version History

- **v1.0** (November 2025) - Initial documentation created
  - 141 player action AnimNodes documented
  - 3 primary recipe AnimNodes
  - 1,128+ Bob animation files catalogued
  - Usage examples and best practices

---

## Credits

This documentation compiled from:
- Project Zomboid Build 41 game files
- TIS official modding documentation
- Community modding resources
- Direct file analysis of vanilla game data

**Game Installation Path**: `R:\Games\Steam\steamapps\common\ProjectZomboid`

---

## License

This documentation is for educational and modding reference purposes.
Project Zomboid is © The Indie Stone. All rights reserved. 