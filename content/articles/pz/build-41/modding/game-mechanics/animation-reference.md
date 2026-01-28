---
id: game-mechanics-animation-reference
slug: animation-reference
title: "Animation Reference"
game: pz
version: build-41
section: modding
category: game-mechanics
subcategory: null
difficulty: beginner
tags:
  - recipe
  - item
  - weapon
  - foraging
  - animation
  - sound
  - modding
  - api
excerpt: "Complete reference of all vanilla animations available in Project Zomboid for use in mod recipes. Learn which animations to use for crafting, medical, combat, and resource gathering."
table_of_contents:
  - text: "What Are AnimNodes?"
    link: "#what-are-animnodes"
  - text: "Quick Reference: Top 10 AnimNodes"
    link: "#quick-reference-top-10-animnodes"
  - text: "Using AnimNodes in Recipes"
    link: "#using-animnodes-in-recipes"
  - text: "Complete Animation List by Category"
    link: "#complete-animation-list-by-category"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Complete Alphabetical List"
    link: "#complete-alphabetical-list-all-141-animnodes"
last_updated: 2026-01-28
---

# Animation Reference

## What Are AnimNodes?

When you craft a wooden spear in Project Zomboid and your character starts making sawing motions with their hands, that's an **AnimNode** in action. When you bandage a wound and see your character wrap their arm, that's another AnimNode. These are the pre-made animations that the game uses for all player actions.

An **AnimNode** is simply a reference name for an animation. When you create a recipe, you can tell the game "use the sawing animation" by writing `AnimNode: SawLog,` in your recipe definition. The game looks up that name, finds the animation file, and plays it while the player crafts.

There are **141 different AnimNodes** available in Project Zomboid. If you're looking at that number and feeling overwhelmed, don't worry—you'll probably only use 5-10 of them. The rest are there if you need something specific, but most mods stick to the common ones.

Let me show you the ones you'll actually use, then we'll explore the full list.

---

## Quick Reference: Top 10 AnimNodes

These are the animations you'll use most often when creating recipes:

| AnimNode | When To Use It | Example Recipe |
|----------|----------------|----------------|
| `Craft` | Generic crafting (combining items) | Making a molotov cocktail, crafting simple items |
| `Disassemble` | Taking things apart | Breaking down furniture, disassembling electronics |
| `SawLog` | Sawing/cutting wood | Cutting logs into planks, woodworking |
| `RipSheets` | Tearing fabric | Making bandages from sheets, ripping cloth |
| `Build` | Construction | Building structures, placing barricades |
| `chop_tree` | Chopping wood | Gathering firewood, chopping branches |
| `DigShovel` | Digging with tools | Digging holes, farming, graves |
| `Eat` | Eating food (generic) | Most food consumption |
| `DrinkBottle` | Drinking from bottles | Water bottles, drinks |
| `Bandage` | Medical treatment | Applying bandages, first aid |

**90% of your recipes will use one of these 10 animations.** Start here, and only explore the full list when you need something more specific.

---

## Using AnimNodes in Recipes

Adding an animation to your recipe is simple. Here's the basic pattern:

```
recipe Your Recipe Name  // The recipe name
{
    Ingredient1,  // What you need
    Ingredient2,

    Result:YourItem,  // What you get
    Time:50.0,  // How long it takes (in game ticks)
    AnimNode:Craft,  // The animation to play
    Category:Crafting,  // Category in crafting menu
}
```

The `AnimNode:` line tells the game which animation to play while crafting. It's optional—if you don't specify one, the game uses a default idle animation. But adding one makes your mod feel more polished.

### Version 1: Recipe Without AnimNode

```
recipe Make Wooden Stake
{
    TreeBranch,  // Required ingredient
    keep KitchenKnife,  // Tool (not consumed)

    Result:WoodenStake,  // What you create
    Time:30.0,  // Crafting time
    Category:Weapon,  // Menu category
}
```

**What happens:** Your character stands still with a generic idle animation. It works, but looks bland.

---

### Version 2: Recipe With AnimNode

```
recipe Make Wooden Stake
{
    TreeBranch,
    keep KitchenKnife,

    Result:WoodenStake,
    Time:30.0,
    AnimNode:chop_tree,  // NEW: Adds chopping animation
    Category:Weapon,
}
```

**What happens:** Your character does a chopping motion with their hands. Much better! The animation plays for the duration specified in `Time:`.

---

### Version 3: Recipe With AnimNode and Sound

```
recipe Make Wooden Stake
{
    TreeBranch,
    keep KitchenKnife,

    Result:WoodenStake,
    Time:30.0,
    AnimNode:chop_tree,  // Chopping animation
    Sound:Sawing,  // NEW: Adds sawing sound effect
    Category:Weapon,
}
```

**What happens:** Your character chops AND you hear sawing sounds. Now it feels like a real crafting action.

> **Key Takeaway:** AnimNodes are optional but make your recipes feel professional. Start with common ones like `Craft`, `Disassemble`, or `SawLog`. Add sounds for extra polish.

---

## Complete Animation List by Category

This looks like drinking from a firehose. It's a lot of animations—141 to be exact. **You don't need to memorize them.** Use this section as a lookup reference when you need something specific.

I've organized them by category so you can quickly find what you need. Need a medical animation? Jump to the Medical section. Need something for eating? Check Eating & Drinking.

---

### Crafting & Building (11 animations)

Use these for recipes that involve creating, building, or destroying things.

| AnimNode | Best Used For | Example |
|----------|---------------|---------|
| `Craft` | General crafting | Combining items, making tools |
| `Build` | Construction | Building walls, placing structures |
| `BuildLow` | Low construction | Floor-level building |
| `Destroy` | Destroying structures | Breaking walls, removing builds |
| `DestroyFloor` | Floor destruction | Removing floor tiles |
| `Disassemble` | Taking apart items | Disassembling electronics, furniture |
| `BlowTorch` | Metal working (mid) | Welding, torch work |
| `BlowTorchFloor` | Metal working (floor) | Floor-level welding |
| `BlowTorchMid` | Metal working (mid-height) | Mid-level welding |
| `painting` | Painting surfaces | Painting walls, signs |

**Most common:** `Craft` (generic crafting), `Disassemble` (breaking things down), `Build` (construction)

---

### Resource Gathering (17 animations)

Use these for recipes that gather materials from the world.

| AnimNode | Best Used For | Example |
|----------|---------------|---------|
| `chop_tree` | Chopping trees/wood | Getting firewood, branches |
| `SawLog` | Sawing wood | Cutting logs into planks |
| `RipSheets` | Tearing fabric | Making bandages, cloth strips |
| `Dig` | Generic digging | General excavation |
| `DigShovel` | Digging with shovel | Farming, graves, holes |
| `DigHoe` | Digging with hoe | Farming, gardening |
| `DigPickAxe` | Digging with pickaxe | Mining, hard ground |
| `DigTrowel` | Digging with trowel | Small digging, planting |
| `Forage` | Foraging | Searching for items |
| `Rake` | Raking ground | Gardening, clearing |
| `RemoveBush` | Removing bushes | Clearing vegetation |
| `RemoveBushAxe` | Remove bush with axe | Heavy vegetation removal |
| `RemoveBushKnife` | Remove bush with knife | Light vegetation removal |
| `RemoveBushLongBlade` | Remove bush with blade | Clearing with sword/machete |
| `RemoveGrass` | Removing grass | Lawn maintenance |

**Most common:** `chop_tree` (wood gathering), `SawLog` (woodworking), `RipSheets` (fabric), `DigShovel` (farming/digging)

---

### Eating & Drinking (28 animations)

Use these for food and beverage recipes.

**Eating:**
| AnimNode | Best Used For |
|----------|---------------|
| `Eat` | Generic eating (most food) |
| `Eat1Hand` | One-handed food (sandwiches, fruit) |
| `Eat2Hands` | Two-handed food (watermelon, large items) |
| `EatFromCan` | Canned food |
| `EatFromPlate` | Plated meals |
| `EatFromPot` | Eating from pot/bowl |

**Drinking:**
| AnimNode | Best Used For |
|----------|---------------|
| `DrinkBottle` | Bottled drinks (most beverages) |
| `DrinkBowl` | Soup, drinks in bowls |
| `DrinkFromCan` | Canned beverages |
| `DrinkPopCan` | Soda cans |
| `DrinkFromBourbon` | Alcohol bottles |
| `DrinkTapWater` | Drinking from sink |
| `Smoke` | Smoking cigarettes |

**Filling Containers:**
| AnimNode | Best Used For |
|----------|---------------|
| `FillBottleFromTap` | Filling water bottles |
| `FillBowlFromTap` | Filling bowls |
| `FillBucketFromTap` | Filling buckets |
| `FillPotFromTap` | Filling cooking pots |

**Pouring:**
| AnimNode | Best Used For |
|----------|---------------|
| `Pour` | Generic pouring |
| `PourBowl` | Pouring into bowls |
| `PourMug` | Pouring into mugs/cups |

**Most common:** `Eat` (generic eating), `DrinkBottle` (most drinks), `Pour` (transferring liquids)

---

### Medical (13 animations)

Use these for first aid and medical recipes.

| AnimNode | Best Used For | Example |
|----------|---------------|---------|
| `Bandage` | Generic bandaging | Applying bandages |
| `BandageHead` | Head injuries | Head bandages |
| `BandageLeftArm` | Left arm injuries | Arm bandages |
| `BandageRightArm` | Right arm injuries | Arm bandages |
| `BandageLeftLeg` | Left leg injuries | Leg bandages |
| `BandageRightLeg` | Right leg injuries | Leg bandages |
| `BandageUpperBody` | Torso injuries | Chest bandages |
| `BandageLowerBody` | Lower torso injuries | Abdomen bandages |
| `TakePills` | Medication | Taking pills, medicine |
| `MedicalCheck` | Examination | Checking health |
| `Shave` | Grooming | Shaving face |
| `WashFace` | Hygiene | Washing face |

**Most common:** `Bandage` (generic first aid), `TakePills` (medication)

---

### Weapon Actions (28 animations)

Use these for ammunition and weapon maintenance recipes.

**Loading Weapons:**
- `LoadHandgun` - Loading pistols
- `LoadRevolver` - Loading revolvers
- `LoadRifle` - Loading rifles with magazines
- `LoadShotgun` - Loading pump shotguns
- `LoadDblBarrel` - Loading double-barrel shotguns

**Unloading Weapons:**
- `UnloadHandgun`, `UnloadRevolver`, `UnloadRifle`, `UnloadShotgun`, etc.

**Ammunition:**
- `InsertBullets` - Loading bullets into magazines
- `RemoveBullets` - Unloading magazines

**Racking (Chambering):**
- `RackHandgun`, `RackRifle`, `RackShotgun` - Chambering rounds

**Most common for mods:** `InsertBullets` (ammo crafting), `LoadHandgun` (loading weapons)

---

### Looting (4 animations)

| AnimNode | Best Used For |
|----------|---------------|
| `Loot` | Mid-height containers |
| `LootHigh` | High shelves, cabinets |
| `LootLow` | Ground-level, low containers |
| `LootSitting` | Looting while seated |

---

### Vehicle Actions (8 animations)

| AnimNode | Best Used For |
|----------|---------------|
| `RefuelGasCan` | Refueling vehicles |
| `TakeGasFromPump` | Getting gas from pump |
| `TakeGasFromVehicle` | Siphoning gas |
| `VehicleWorkOnTire` | Tire maintenance |
| `VehicleWash` | Washing vehicle |
| `ExamineVehicle` | Vehicle inspection |

---

### Clothing (10 animations)

| AnimNode | Best Used For |
|----------|---------------|
| `WearClothingDefault` | Generic clothing |
| `WearClothingHat` | Hats, helmets |
| `WearClothingJacket` | Jackets, coats |
| `WearClothingPullover` | Shirts |
| `WearClothingLegs` | Pants |
| `WearClothingFeet` | Shoes, boots |

---

## Common Mistakes

### Mistake 1: Wrong Capitalization

❌ **Doesn't work:**
```
recipe Make Planks
{
    Log,
    keep Saw,

    Result:Plank=4,
    Time:50.0,
    AnimNode:sawlog,  // Wrong! Lowercase 's'
}
```

**What you'll see:** No animation plays. Your character just stands there.

✅ **Works:**
```
recipe Make Planks
{
    Log,
    keep Saw,

    Result:Plank=4,
    Time:50.0,
    AnimNode:SawLog,  // Correct! Capital 'S' and 'L'
}
```

**Why:** AnimNode names are **case-sensitive**. `SawLog` is not the same as `sawlog` or `Sawlog`. The game won't find the animation if the capitalization is wrong.

---

### Mistake 2: Using Non-Existent AnimNode

❌ **Doesn't work:**
```
recipe Hammer Something
{
    Metal,
    keep Hammer,

    Result:MetalSheet,
    Time:40.0,
    AnimNode:Hammering,  // This doesn't exist!
}
```

**What you'll see:** No animation, character stands idle.

✅ **Works:**
```
recipe Hammer Something
{
    Metal,
    keep Hammer,

    Result:MetalSheet,
    Time:40.0,
    AnimNode:Craft,  // Use generic crafting animation
}
```

**Why:** There's no `Hammering` AnimNode. When you use a name that doesn't exist, the game falls back to a default idle animation. Always check the reference list or use a generic option like `Craft`.

---

### Mistake 3: AnimNode Doesn't Match Recipe Context

❌ **Looks weird:**
```
recipe Drink Water
{
    WaterBottle,

    Result:EmptyBottle,
    Time:10.0,
    AnimNode:Eat,  // Eating animation for drinking!
}
```

**What you'll see:** Your character makes chewing motions while drinking. It works, but looks wrong.

✅ **Looks right:**
```
recipe Drink Water
{
    WaterBottle,

    Result:EmptyBottle,
    Time:10.0,
    AnimNode:DrinkBottle,  // Proper drinking animation
}
```

**Why:** The recipe still functions with the wrong animation, but it looks odd. Match your AnimNode to what the recipe actually does—eating animations for food, drinking for beverages, etc.

---

### Mistake 4: Time Too Short for Animation

❌ **Animation cuts off:**
```
recipe Build Wall
{
    Plank=3,
    Nails=6,

    Result:WallFrame,
    Time:5.0,  // Too short!
    AnimNode:Build,
}
```

**What you'll see:** The animation starts but immediately stops. Looks janky.

✅ **Good timing:**
```
recipe Build Wall
{
    Plank=3,
    Nails=6,

    Result:WallFrame,
    Time:100.0,  // Allows animation to complete
    AnimNode:Build,
}
```

**Why:** If `Time:` is too short, the animation doesn't have time to play through. Most animations need at least 30-50 ticks. Complex animations like `Build` or `SawLog` should use 80-150 ticks.

---

### Mistake 5: Forgetting the Comma

❌ **Syntax error:**
```
recipe Craft Item
{
    Material,

    Result:Item,
    Time:30.0
    AnimNode:Craft  // Missing comma after Time!
}
```

**What you'll see:** Recipe won't load. The game's parser fails.

✅ **Correct:**
```
recipe Craft Item
{
    Material,

    Result:Item,
    Time:30.0,  // Comma here
    AnimNode:Craft,  // And here (optional on last property but recommended)
}
```

**Why:** Every property line needs a comma (except the very last one, but it's good practice to always include it).

---

## Try It Yourself

Let's create a recipe with different AnimNodes to see how they work.

### Step 1: Create a Test Mod

Create this folder structure:
```
Zomboid/mods/AnimTest/
├── mod.info
└── media/
    └── scripts/
        └── recipes_test.txt
```

**mod.info:**
```
name=Animation Test
id=AnimTest
description=Testing different AnimNodes
```

---

### Step 2: Create Three Test Recipes

Open `recipes_test.txt` and add:

```
module AnimTest
{
    imports { Base }

    // Test 1: Generic Craft animation
    recipe Test Craft Animation
    {
        Plank,  // Any common item

        Result:Plank,  // Just gives it back
        Time:50.0,  // Long enough to see animation
        AnimNode:Craft,  // Generic crafting
    }

    // Test 2: Sawing animation
    recipe Test Sawing Animation
    {
        Log,

        Result:Log,
        Time:50.0,
        AnimNode:SawLog,  // Sawing motion
    }

    // Test 3: Disassemble animation
    recipe Test Disassemble Animation
    {
        ElectronicsScrap,

        Result:ElectronicsScrap,
        Time:50.0,
        AnimNode:Disassemble,  // Taking apart motion
    }
}
```

---

### Step 3: Enable the Mod

1. Launch Project Zomboid
2. Go to Mods menu
3. Enable "Animation Test"
4. Restart the game

---

### Step 4: Test Each Recipe

1. Start a game
2. Open debug menu (backslash `\`)
3. Spawn a Plank, Log, and ElectronicsScrap
4. Open crafting menu (B key)
5. Find "Test Craft Animation" and craft it
6. **Watch your character** - you should see crafting motions
7. Try the other two recipes and compare the animations

**What to notice:**
- `Craft` shows generic hand movements
- `SawLog` shows back-and-forth sawing motion
- `Disassemble` shows twisting/pulling-apart motions

---

### Step 5: Experiment

Try changing the AnimNode in one recipe to something different:

```
recipe Test Craft Animation
{
    Plank,
    Result:Plank,
    Time:50.0,
    AnimNode:Bandage,  // Change to bandaging animation
}
```

Reload your mod and see how it looks. The animation won't match the recipe (you're "bandaging" a plank), but it shows you how different AnimNodes behave.

---

## Complete Alphabetical List (All 141 AnimNodes)

**Reference only:** Use this list when you need to look up a specific animation. Don't try to memorize it—just search (Ctrl+F) when you need something.

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
| `BlowTorch` | Crafting | Using blowtorch (mid-level) |
| `BlowTorchFloor` | Crafting | Using blowtorch on floor |
| `BlowTorchMid` | Crafting | Using blowtorch at mid-height |
| `book` | Reading | Reading book |
| `Build` | Crafting | General building/construction |
| `BuildLow` | Crafting | Building low structures |
| `chop_tree` | Resource Gathering | Chopping down trees |
| `Craft` | Crafting | Generic crafting |
| `default-fallback` | Miscellaneous | Default fallback animation |
| `Destroy` | Crafting | Destroying structures |
| `DestroyFloor` | Crafting | Destroying floor tiles |
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
| `Disassemble` | Crafting | Disassembling items |
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
| `painting` | Crafting | Painting structures |
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

## Key Takeaways

1. **AnimNodes are animation references** - They tell the game which animation to play during crafting

2. **141 total, but you'll use ~10** - Start with `Craft`, `Disassemble`, `SawLog`, `chop_tree`, `Eat`, `DrinkBottle`, `Bandage`

3. **They're optional** - Recipes work without AnimNodes, but animations make them feel polished

4. **Case-sensitive** - `SawLog` ≠ `sawlog`. Capitalization must be exact.

5. **Match animation to recipe** - Use eating animations for food, drinking for beverages, etc.

6. **Time affects animation** - Make sure `Time:` is long enough for the animation to play (usually 30-150 ticks)

7. **Use as reference** - Don't memorize the list. Search it when you need something specific.

---

**What's next?** Now that you know about animations, learn how to [create recipes](../../recipes/recipe-basics) or add [custom sounds](../sound-reference) to complete the experience.
