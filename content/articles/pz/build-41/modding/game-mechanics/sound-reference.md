---
id: game-mechanics-sound-reference
slug: sound-reference
title: "Sound Reference"
game: pz
version: build-41
section: modding
category: game-mechanics
subcategory: null
difficulty: beginner
tags:
  - recipe
  - item
  - sound
  - modding
  - api
excerpt: "Complete reference guide for adding sounds to your Project Zomboid recipes. Learn which sounds to use for crafting, cooking, woodworking, and more."
table_of_contents:
  - text: "What Are Recipe Sounds?"
    link: "#what-are-recipe-sounds"
  - text: "Top 15 Most Used Sounds"
    link: "#top-15-most-used-sounds"
  - text: "Adding Sounds to Recipes"
    link: "#adding-sounds-to-recipes"
  - text: "Sound Categories Overview"
    link: "#sound-categories-overview"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Complete Sound Reference"
    link: "#complete-sound-reference"
  - text: "Item Sounds"
    link: "#item-sounds"
  - text: "Object Sounds"
    link: "#object-sounds"
  - text: "Player Sounds"
    link: "#player-sounds"
  - text: "World Sounds"
    link: "#world-sounds"
  - text: "Zombie Sounds"
    link: "#zombie-sounds"
  - text: "UI Sounds"
    link: "#ui-sounds"
  - text: "Meta Sounds"
    link: "#meta-sounds"
  - text: "Music Sounds"
    link: "#music-sounds"
  - text: "Usage Examples"
    link: "#usage-examples"
  - text: "Sound System Notes"
    link: "#sound-system-notes"
  - text: "Sound File Locations"
    link: "#sound-file-locations"
  - text: "Summary Statistics"
    link: "#summary-statistics"
last_updated: 2026-01-28
---

# Sound Reference

## What Are Recipe Sounds?

When you craft a wooden spear in Project Zomboid and hear sawing sounds, or when you hammer boards onto a window and hear *thunk thunk thunk*, those are **recipe sounds**—audio effects that play while crafting.

A **recipe sound** is simply a reference name you add to your recipe that tells the game "play this audio while crafting." It makes your recipes feel alive instead of silent.

Without sounds, crafting feels flat. With sounds, it feels like you're actually doing the work. And adding them is incredibly simple—just one line in your recipe.

There are **400+ sounds** available in Project Zomboid, organized into 8 categories. But you'll probably only use 10-15 of them regularly. Let me show you the ones you'll actually use, then we'll explore the complete reference.

---

## Top 15 Most Used Sounds

These are the sounds modders use most often in recipes:

| Sound | When To Use It | Example Recipe | Frequency |
|-------|----------------|----------------|-----------|
| `PutItemInBag` | Storing items, general handling | Packing items, organizing | Very High (30+ uses) |
| `OpenCannedFood` | Opening cans, containers | Opening tuna can, etc. | Very High (25+ uses) |
| `Hammering` | Nailing, building, carpentry | Crafting wooden structures | Very High (20+ uses) |
| `Sawing` | Cutting wood, sawing materials | Sawing logs into planks | Very High (15+ uses) |
| `SliceMeat` | Cutting meat or tough materials | Butchering animals | High (10+ uses) |
| `ClothesRipping` | Tearing fabric/sheets | Making bandages from sheets | High (7 uses) |
| `AddItemInBeverage` | Adding to drinks | Making beverages | Medium (9 uses) |
| `OpenSeedPacket` | Opening packets | Opening seeds, small packages | Medium (7 uses) |
| `BlowTorch` | Welding, metalworking | Metal crafting | Medium (6 uses) |
| `EmptyPan` | Emptying containers | Pouring liquids | Medium (5 uses) |
| `SliceBread` | Cutting soft foods | Slicing bread or soft items | Medium (4 uses) |
| `Dismantle` | Taking apart electronics | Disassembling radios | Medium (4 uses) |
| `Screwdriver` | Screwing/unscrewing | Electronics work | Low |
| `AddItemInRecipe` | Adding ingredients | Cooking, mixing | Low |
| `Shoveling` | Digging, earth moving | Digging holes | Low |

**90% of recipes use one of these sounds.** Start here before exploring the full list.

---

## Adding Sounds to Recipes

Adding a sound to your recipe is simple—just one line:

```
recipe Your Recipe Name
{
    Ingredient,  // What you need

    Result:YourItem,  // What you create
    Time:50.0,  // How long it takes
    Sound:Sawing,  // This line adds the sound!
}
```

That's it. The `Sound:` property tells the game which audio to play while crafting.

### Version 1: Recipe Without Sound

```
recipe Make Wooden Stake
{
    TreeBranch,  // Required ingredient
    keep Knife,  // Tool (not consumed)

    Result:WoodenStake,  // What you create
    Time:30.0,  // Crafting time (30 seconds)
}
```

**What happens:** Silent crafting. Works, but feels empty.

---

### Version 2: Recipe With Sound

```
recipe Make Wooden Stake
{
    TreeBranch,  // Required ingredient
    keep Knife,  // Tool (not consumed)

    Result:WoodenStake,  // What you create
    Time:30.0,  // Crafting time
    Sound:Sawing,  // NEW: Adds sawing sound while crafting
}
```

**What happens:** You hear sawing sounds while crafting. Much better!

---

### Version 3: Recipe With Sound and Animation

```
recipe Make Wooden Stake
{
    TreeBranch,  // Required ingredient
    keep Knife,  // Tool (not consumed)

    Result:WoodenStake,  // What you create
    Time:30.0,  // Crafting time
    AnimNode:chop_tree,  // Chopping animation
    Sound:Sawing,  // Sawing sound
}
```

**What happens:** Your character chops AND you hear sawing. Perfect!

> **Key Takeaway:** Sounds are optional but make recipes feel real. Just add `Sound:SoundName,` to your recipe. Start with common sounds like `Sawing`, `Hammering`, or `ClothesRipping`.

---

## Sound Categories Overview

Sounds are organized into 8 main categories. Here's a quick overview of what each category contains:

### Item Sounds (~30 sounds)
Sounds for items you interact with: bags, tools, crafting, food, repairs, farming equipment.

**Most Used:** `PutItemInBag`, `Sawing`, `Hammering`, `ClothesRipping`, `SliceMeat`, `SliceBread`

---

### Object Sounds (~150 sounds)
Sounds for world objects: doors (all types), windows, curtains, appliances, campfires, generators, water, trees.

**Most Used:** Rarely used in recipes (these are mostly for objects, not crafting)

---

### Player Sounds (~90 sounds)
Sounds the player makes: eating, drinking, movement, combat, building, cooking, farming.

**Most Used:** `OpenCannedFood`, `EmptyPan`, `OpenSeedPacket`, various eating/drinking sounds

---

### World Sounds (~30 sounds)
Environmental sounds: ambiance, fishing, weather, alarms.

**Most Used:** Rarely used in recipes (these are environmental/ambient)

---

### Zombie Sounds (~20 sounds)
Zombie-related sounds: movement, vocals, combat, interactions.

**Most Used:** `ZombieThumpMetal` (for MultiStageBuild constructions only)

---

### UI Sounds (~10 sounds)
User interface sounds: button clicks, menu navigation.

**Most Used:** Never used in recipes (UI only)

---

### Meta Sounds (~15 sounds)
Distant/meta events: helicopter, distant gunshots, animal sounds, game events.

**Most Used:** Never used in recipes (story events only)

---

### Music Sounds (~100+ sounds)
Background music tracks and ambient music.

**Most Used:** Never used in recipes (background music only)

---

## Common Mistakes

### Mistake 1: Sound Name Doesn't Exist

❌ **Doesn't work:**
```
recipe Craft Something
{
    Material,  // Ingredient

    Result:Item,  // Result
    Sound:HammeringNails,  // This sound doesn't exist!
}
```

**What happens:** Silent crafting. The game can't find `HammeringNails`, so it plays nothing.

✅ **Works:**
```
recipe Craft Something
{
    Material,  // Ingredient

    Result:Item,  // Result
    Sound:Hammering,  // Correct name!
}
```

**Why:** Sound names must match exactly. Use `Hammering`, not `HammeringNails`, `Hammer`, or `HammerSound`. Check the [Complete Sound Reference](#complete-sound-reference) below for exact names.

---

### Mistake 2: Wrong Sound for Action

❌ **Sounds weird:**
```
recipe Saw Plank
{
    Log,  // Wood log
    keep Saw,  // Sawing tool

    Result:Plank,  // Result
    Sound:SliceMeat,  // Meat slicing sound for woodworking?!
}
```

**What happens:** It works, but sounds wrong. Players hear meat slicing while sawing wood.

✅ **Sounds right:**
```
recipe Saw Plank
{
    Log,  // Wood log
    keep Saw,  // Sawing tool

    Result:Plank,  // Result
    Sound:Sawing,  // Correct sound for sawing wood
}
```

**Why:** Match the sound to the action. Use `Sawing` for wood, `SliceMeat` for meat, `Hammering` for nailing, etc. The sound should match what the player imagines happening.

---

### Mistake 3: Case Sensitivity Errors

❌ **Doesn't work:**
```
recipe Make Something
{
    Material,  // Ingredient

    Result:Item,  // Result
    Sound:sawing,  // Lowercase 's' - WRONG!
}
```

**What happens:** Silent crafting. The game looks for `sawing` but the actual sound is `Sawing` (capital S).

✅ **Works:**
```
recipe Make Something
{
    Material,  // Ingredient

    Result:Item,  // Result
    Sound:Sawing,  // Correct capitalization!
}
```

**Why:** Sound names are **case-sensitive**. `Sawing` ≠ `sawing` ≠ `SAWING`. Always match the exact capitalization from the reference.

---

### Mistake 4: Using Multiple Sounds

❌ **Doesn't work:**
```
recipe Craft Complex Item
{
    Material,  // Ingredient

    Result:Item,  // Result
    Sound:Sawing,  // First sound
    Sound:Hammering,  // Can't have two Sound: lines!
}
```

**What happens:** Only the last `Sound:` property is used. In this case, only `Hammering` plays.

✅ **Pick one sound:**
```
recipe Craft Complex Item
{
    Material,  // Ingredient

    Result:Item,  // Result
    Sound:Hammering,  // Choose the most representative sound
}
```

**Why:** You can only have ONE sound per recipe. Pick the most representative sound for that recipe. If your recipe involves sawing AND hammering, decide which is more prominent and use that sound.

---

### Mistake 5: Forgetting the Comma

❌ **Syntax error:**
```
recipe Craft Item
{
    Material,  // Ingredient

    Result:Item,  // Result
    Time:30.0  // Missing comma after Time!
    Sound:Sawing  // Recipe won't load
}
```

**What happens:** Recipe doesn't load. Parser error.

✅ **Works:**
```
recipe Craft Item
{
    Material,  // Ingredient

    Result:Item,  // Result
    Time:30.0,  // Comma here
    Sound:Sawing,  // And here (optional but safe)
}
```

**Why:** Every property line needs a comma (except the last one, but it's safe to always include it). Missing commas cause parsing errors.

---

## Try It Yourself

Let's create test recipes with different sounds to hear how they work.

### Step 1: Create Test Mod

```
Zomboid/mods/SoundTest/
├── mod.info
└── media/
    └── scripts/
        └── recipes_test.txt
```

**mod.info:**
```
name=Sound Test
id=SoundTest
description=Testing different recipe sounds
```

---

### Step 2: Create Test Recipes

**recipes_test.txt:**
```
module SoundTest
{
    imports { Base }  // Import vanilla items

    // Test 1: Sawing sound (wood cutting)
    recipe Test Sawing Sound
    {
        Plank,  // Common item (easy to find/spawn)

        Result:Plank,  // Just gives it back (test only)
        Time:50.0,  // Long enough to hear the sound clearly
        Sound:Sawing,  // Wood sawing sound
    }

    // Test 2: Hammering sound (nailing/building)
    recipe Test Hammering Sound
    {
        Nails,  // Common item

        Result:Nails,  // Returns the nails
        Time:50.0,  // Long craft time for testing
        Sound:Hammering,  // Hammering/nailing sound
    }

    // Test 3: Cloth ripping sound (fabric tearing)
    recipe Test Ripping Sound
    {
        Sheet,  // Bed sheet

        Result:Sheet,  // Returns the sheet
        Time:50.0,  // Long craft time
        Sound:ClothesRipping,  // Fabric tearing sound
    }

    // Test 4: Meat slicing sound (cutting)
    recipe Test Slicing Sound
    {
        Steak,  // Any meat item

        Result:Steak,  // Returns the steak
        Time:50.0,  // Long craft time
        Sound:SliceMeat,  // Meat cutting sound
    }

    // Test 5: Generic item handling sound
    recipe Test Item Handling Sound
    {
        Book,  // Any generic item

        Result:Book,  // Returns the book
        Time:50.0,  // Long craft time
        Sound:PutItemInBag,  // Generic item handling sound
    }
}
```

---

### Step 3: Test Them

1. Enable the mod in Mods menu
2. Start a game
3. Spawn the required items using debug mode:
   - Press `Ctrl + Z` (toggle debug mode)
   - Press `I` (item spawner)
   - Spawn: Plank, Nails, Sheet, Steak, Book
4. Open crafting menu (B key)
5. Craft each test recipe
6. **Listen carefully to the different sounds**

**What to notice:**
- `Sawing` - back-and-forth sawing sound (rhythmic)
- `Hammering` - rhythmic hammering/pounding
- `ClothesRipping` - fabric tearing/ripping
- `SliceMeat` - slicing/cutting sound
- `PutItemInBag` - generic rustling/handling sound

---

### Step 4: Experiment

Try changing sounds to see how they match (or don't match) actions:

```
recipe Test Sawing Sound
{
    Plank,  // Wood plank

    Result:Plank,  // Returns plank
    Time:50.0,  // Long craft time
    Sound:SliceMeat,  // Wrong sound - try this!
}
```

Reload the game and craft it. Notice how weird it sounds to hear meat slicing while working with wood! This demonstrates the importance of matching sounds to actions.

---

## Complete Sound Reference

**For reference:** Below is a comprehensive list of all 400+ available sounds organized by category. You don't need to memorize these—just search (Ctrl+F) when you need something specific.

> **Note:** The sounds marked with "Recipe Usage" columns indicate how frequently they're used in vanilla recipes. Focus on "High" and "Very High" usage sounds first.

---

## Item Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_item.txt`
**Category:** Item
**Total Sounds:** ~30

### Bag & Container Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `OpenBag` | Opening bag/container | Low |
| `CloseBag` | Closing bag/container | Low |
| `PutItemInBag` | Storing item in bag/container | **Very High (30+ uses)** |

**When to use:** `PutItemInBag` is the most versatile sound for general item handling and combining items. Use it when no other sound fits.

---

### Crafting & Tool Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `Sawing` | Sawing wood/materials | **Very High (15+ uses)** |
| `Hammering` | Hammering/nailing | **Very High (20+ uses)** |
| `Screwdriver` | Using screwdriver | Low |
| `BlowTorch` | Welding/metalworking | Medium (6 uses) |
| `Dismantle` | Dismantling electronics | Medium (4 uses) |

**When to use:**
- `Sawing` - Any woodworking or sawing action
- `Hammering` - Building, nailing, carpentry
- `Screwdriver` - Electronics, mechanical work
- `BlowTorch` - Welding, metalworking, metal repairs
- `Dismantle` - Taking apart electronics or complex items

---

### Breaking & Destroying Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `BreakMetalItem` | Breaking metal objects | Low |
| `BreakWoodItem` | Breaking wood objects | Low |
| `BreakGlassItem` | Breaking glass | Low |
| `ClothesRipping` | Ripping cloth/clothing | **High (7 uses)** |

**When to use:**
- `BreakMetalItem` - Demolishing metal objects
- `BreakWoodItem` - Demolishing wood objects
- `BreakGlassItem` - Breaking glass items
- `ClothesRipping` - Tearing fabric, sheets, clothing (very common for bandage-making)

---

### Cooking & Food Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `SliceBread` | Slicing bread | Medium (4 uses) |
| `SliceMeat` | Slicing meat | **High (10+ uses)** |
| `AddItemInRecipe` | Adding ingredient to recipe | Low |
| `AddItemInBeverage` | Adding ingredient to beverage | Medium (9 uses) |

**When to use:**
- `SliceBread` - Slicing bread or soft food items
- `SliceMeat` - Butchering, cutting meat, food prep
- `AddItemInRecipe` - Adding ingredients to cooking recipes
- `AddItemInBeverage` - Making drinks, adding to beverages

---

### Repair & Maintenance

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `FixWithTape` | Repairing with tape | Low |
| `FixingItemFailed` | Failed repair attempt | None |

**When to use:**
- `FixWithTape` - Repairing items with duct tape
- `FixingItemFailed` - Generally not used in recipes (system sound)

---

### Farming Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `Shoveling` | Using shovel | Low |

**When to use:** Digging, shoveling, earth-moving actions

---

### Fishing Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `CastFishingLine` | Casting fishing line | None |
| `BreakFishingLine` | Breaking fishing line | None |

**When to use:** Generally not used in recipes (fishing system sounds)

---

### Map Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `MapOpen` | Opening map | None |
| `MapClose` | Closing map | None |
| `MapAddNote` | Adding note to map | None |
| `MapAddSymbol` | Adding symbol to map | None |
| `MapRemoveMarking` | Removing map marking | None |

**When to use:** Generally not used in recipes (map system sounds)

---

### Combat Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `BloodSplatter` | Blood splatter effect | None |
| `BulletHitBody` | Bullet impact on body | None |

**When to use:** Generally not used in recipes (combat system sounds)

---

### Alarm Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `AlarmClockRingingLoop` | Alarm clock ringing | None |
| `WatchAlarmLoop` | Watch alarm ringing | None |

**When to use:** Generally not used in recipes (alarm system sounds)

---

### Misc Item Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `LightbulbBurnedOut` | Lightbulb burning out | None |

**When to use:** Rarely used in recipes

---

## Object Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_object.txt`
**Category:** Object
**Total Sounds:** ~150

> **Note:** Most Object sounds are for world interactions (doors, windows, appliances) rather than recipe crafting. They're included here for completeness, but you'll rarely use them in recipes.

### Door Sounds (All Types)

#### Sliding Glass Door
- `SlidingGlassDoorBlocked` - Door blocked
- `SlidingGlassDoorBreak` - Door breaking
- `SlidingGlassDoorClose` - Door closing
- `SlidingGlassDoorLock` - Door locking
- `SlidingGlassDoorLocked` - Door locked (attempt to open)
- `SlidingGlassDoorOpen` - Door opening
- `SlidingGlassDoorUnlock` - Door unlocking

---

#### Prison Metal Door
- `PrisonMetalDoorBlocked` - Door blocked
- `PrisonMetalDoorBreak` - Door breaking
- `PrisonMetalDoorClose` - Door closing
- `PrisonMetalDoorLock` - Door locking
- `PrisonMetalDoorLocked` - Door locked (attempt to open)
- `PrisonMetalDoorOpen` - Door opening
- `PrisonMetalDoorUnlock` - Door unlocking

---

#### Garage Door
- `GarageDoorBlocked` - Door blocked
- `GarageDoorBreak` - Door breaking
- `GarageDoorClose` - Door closing
- `GarageDoorLock` - Door locking
- `GarageDoorLocked` - Door locked (attempt to open)
- `GarageDoorOpen` - Door opening
- `GarageDoorUnlock` - Door unlocking

---

#### Metal Door
- `MetalDoorBlocked` - Door blocked
- `MetalDoorBreak` - Door breaking
- `MetalDoorClose` - Door closing
- `MetalDoorLock` - Door locking
- `MetalDoorLocked` - Door locked (attempt to open)
- `MetalDoorOpen` - Door opening
- `MetalDoorUnlock` - Door unlocking

---

#### Metal Gate
- `MetalGateBlocked` - Gate blocked
- `MetalGateBreak` - Gate breaking
- `MetalGateClose` - Gate closing
- `MetalGateLock` - Gate locking
- `MetalGateLocked` - Gate locked (attempt to open)
- `MetalGateOpen` - Gate opening
- `MetalGateUnlock` - Gate unlocking

---

#### Wood Door
- `WoodDoorBlocked` - Door blocked
- `WoodDoorBreak` - Door breaking
- `WoodDoorClose` - Door closing
- `WoodDoorCreak` - Door creaking
- `WoodDoorLock` - Door locking
- `WoodDoorLocked` - Door locked (attempt to open)
- `WoodDoorOpen` - Door opening
- `WoodDoorUnlock` - Door unlocking

---

#### Wood Shack Door
- `WoodShackDoorBlocked` - Door blocked
- `WoodShackDoorBreak` - Door breaking
- `WoodShackDoorClose` - Door closing
- `WoodShackDoorCreak` - Door creaking
- `WoodShackDoorLock` - Door locking
- `WoodShackDoorLocked` - Door locked (attempt to open)
- `WoodShackDoorOpen` - Door opening
- `WoodShackDoorUnlock` - Door unlocking

---

#### Wood Gate
- `WoodGateBlocked` - Gate blocked
- `WoodGateBreak` - Gate breaking
- `WoodGateClose` - Gate closing
- `WoodGateLock` - Gate locking
- `WoodGateLocked` - Gate locked (attempt to open)
- `WoodGateOpen` - Gate opening
- `WoodGateUnlock` - Gate unlocking

---

#### General Door Sounds
- `LockDoor` - Generic door locking
- `UnlockDoor` - Generic door unlocking
- `BreakDoor` - Generic door breaking
- `DoorIsBlocked` - Door blocked message sound
- `DoorIsLocked` - Door locked message sound
- `DoorAmbiance` - Door ambient sounds

**When to use:** Generally not used in recipes (world interaction sounds)

---

### Window Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `OpenWindow` | Opening window | None |
| `CloseWindow` | Closing window | None |
| `SmashWindow` | Breaking window | None |
| `WindowIsLocked` | Window is locked | None |
| `BreakLockOnWindow` | Breaking window lock | None |
| `WindowRattle` | Window rattling | None |
| `WindowWind` | Wind through window | None |
| `WindowAmbiance` | Window ambient sounds | None |

**When to use:** Generally not used in recipes (world interaction sounds)

---

### Curtain Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `CurtainLongClose` | Closing long curtain | None |
| `CurtainLongOpen` | Opening long curtain | None |
| `CurtainShortClose` | Closing short curtain | None |
| `CurtainShortOpen` | Opening short curtain | None |
| `CurtainShadeClose` | Closing shade | None |
| `CurtainShadeOpen` | Opening shade | None |
| `CurtainSheetClose` | Closing sheet curtain | None |
| `CurtainSheetOpen` | Opening sheet curtain | None |
| `CurtainSheetAdd` | Adding curtain | None |
| `CurtainSheetRemove` | Removing curtain | None |

**When to use:** Generally not used in recipes (world interaction sounds)

---

### Appliance Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `ToggleStove` | Turning stove on/off | None |
| `StoveRunning` | Stove operating | None |
| `StoveTimer` | Stove timer ticking | None |
| `StoveTimerExpired` | Stove timer finished | None |
| `OpenStoveDoor` | Opening stove door | Low |
| `CloseStoveDoor` | Closing stove door | Low |
| `MicrowaveRunning` | Microwave operating | None |
| `MicrowaveCookingMetal` | Metal in microwave | None |
| `MicrowaveTimerExpired` | Microwave finished | None |
| `FridgeHum` | Refrigerator running | None |
| `ClothingDryerRunning` | Dryer running | None |
| `ClothingWasherRunning` | Washer running | None |
| `ClothingDryerFinished` | Dryer finished | None |
| `ClothingWasherFinished` | Washer finished | None |
| `LightSwitch` | Flipping light switch | None |

**When to use:** Generally not used in recipes (appliance system sounds)

---

### BBQ & Cooking

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `CharcoalBarbecueRunning` | Charcoal BBQ running | None |
| `PropaneBarbecueRunning` | Propane BBQ running | None |
| `BBQPropaneTankInsert` | Inserting propane tank | None |
| `BBQPropaneTankRemove` | Removing propane tank | None |
| `BBQPropaneRunning` | Propane BBQ operating | None |
| `BBQRegularAddFuel` | Adding fuel to BBQ | None |
| `BBQRegularLight` | Lighting BBQ | None |
| `BBQRegularRunning` | Regular BBQ operating | None |

**When to use:** Generally not used in recipes (BBQ system sounds)

---

### Campfire & Fireplace

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `CampfireAddFuel` | Adding fuel to campfire | None |
| `CampfireRunning` | Campfire burning | None |
| `CampfireLight` | Lighting campfire | None |
| `CampfireBuild` | Building campfire | None |
| `FireplaceAddFuel` | Adding fuel to fireplace | None |
| `FireplaceRunning` | Fireplace burning | None |
| `FireplaceLight` | Lighting fireplace | None |
| `Fire` | General fire sound | None |

**When to use:** Generally not used in recipes (fire system sounds)

---

### Electronics

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `TelevisionTestBeep` | TV test signal | None |
| `TelevisionZap` | TV channel change | None |
| `TelevisionOn` | Turning TV on | None |
| `TelevisionOff` | Turning TV off | None |
| `TelevisionMute` | Muting TV | None |
| `TelevisionUnMute` | Unmuting TV | None |
| `RadioButton` | Radio button press | None |
| `RadioStatic` | Radio static | None |
| `RadioTalk` | Radio program | None |
| `RadioZap` | Radio tuning | None |

**When to use:** Generally not used in recipes (electronics system sounds)

---

### Generator

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `GeneratorFailedToStart` | Generator start failed | None |
| `GeneratorStarting` | Generator starting up | None |
| `GeneratorStopping` | Generator shutting down | None |
| `GeneratorLoop` | Generator running | None |
| `GeneratorAddFuel` | Adding fuel to generator | None |
| `GeneratorRepair` | Repairing generator | None |
| `GeneratorConnect` | Connecting generator | None |
| `CarBatteryChargerRunning` | Battery charger running | None |

**When to use:** Generally not used in recipes (generator system sounds)

---

### Water Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `PourWaterIntoObject` | Pouring water into container | None |
| `PourLiquidOnGround` | Pouring liquid on ground | None |
| `GetWaterFromLake` | Getting water from lake | None |
| `GetWaterFromTap` | Getting water from tap | None |
| `GetWaterFromTapGlass` | Filling glass from tap | None |
| `GetWaterFromTapCeramic` | Filling ceramic from tap | None |
| `GetWaterFromTapPlasticMedium` | Filling medium plastic from tap | None |
| `GetWaterFromTapPlasticBig` | Filling large plastic from tap | None |
| `GetWaterFromTapMetalMedium` | Filling medium metal from tap | None |
| `GetWaterFromTapMetalBig` | Filling large metal from tap | None |
| `GetWaterFromDispenser` | Getting water from dispenser | None |
| `GetWaterFromDispenserGlass` | Filling glass from dispenser | None |
| `GetWaterFromDispenserCeramic` | Filling ceramic from dispenser | None |
| `GetWaterFromDispenserPlasticMedium` | Filling medium plastic from dispenser | None |
| `GetWaterFromDispenserPlasticBig` | Filling large plastic from dispenser | None |
| `GetWaterFromDispenserMetalMedium` | Filling medium metal from dispenser | None |
| `GetWaterFromDispenserMetalBig` | Filling large metal from dispenser | None |
| `WaterDrip` | Water dripping ambient | None |

**When to use:** Generally not used in recipes (water system sounds)

---

### Trees & Nature

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `ChopTree` | Chopping tree | None |
| `FallingTree` | Tree falling | None |
| `Bushes` | Bushes rustling | None |
| `RemovePlant` | Removing plant | None |
| `BirdInTree` | Bird sounds in tree | None |

**When to use:** Generally not used in recipes (nature system sounds)

---

### Traps

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `BirdInMetalTrap` | Bird caught in metal trap | None |
| `BirdInWoodTrap` | Bird caught in wood trap | None |
| `AnimalInMetalTrap` | Animal caught in metal trap | None |
| `AnimalInWoodTrap` | Animal caught in wood trap | None |

**When to use:** Generally not used in recipes (trap system sounds)

---

### Barricades

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `AddBarricadeMetal` | Placing metal barricade | None |
| `BeginRemoveBarricadeMetal` | Starting to remove metal barricade | None |
| `RemoveBarricadeMetal` | Removing metal barricade | None |
| `BreakBarricadeMetal` | Breaking metal barricade | None |
| `HitBarricadeMetal` | Hitting metal barricade | None |
| `BreakBarricadePlank` | Breaking wood barricade | None |
| `BeginRemoveBarricadePlank` | Starting to remove wood barricade | None |
| `HitBarricadePlank` | Hitting wood barricade | None |
| `RemoveBarricadePlank` | Removing wood barricade | None |
| `RemoveBrokenGlass` | Removing broken glass | None |

**When to use:** Generally not used in recipes (barricade system sounds)

---

### Fuel & Canister

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `CanisterAddFuelFromGasPump` | Filling from gas pump | None |
| `CanisterAddFuelSiphon` | Siphoning fuel | None |

**When to use:** Generally not used in recipes (fuel system sounds)

---

### Misc Object Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `RotateObject` | Rotating moveable object | None |
| `BreakObject` | Breaking generic object | None |
| `BurnedObjectExploded` | Burned object exploding | None |
| `LightFlicker` | Light flickering | None |

**When to use:** Generally not used in recipes (object system sounds)

---

## Player Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_player.txt`
**Category:** Player
**Total Sounds:** ~90

### Level & Game Events

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `GainExperienceLevel` | Leveling up | None |
| `PlayerDied` | Game over/death | None |

**When to use:** Never used in recipes (game system sounds)

---

### Eating Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `Eating` | Default eating sound | Low |
| `EatingCrispy` | Eating crispy food | Low |
| `EatingDeadAnimal` | Eating dead animal | None |
| `EatingFruit` | Eating fruit | Low |
| `EatingMushy` | Eating mushy food | Low |
| `EatingSoup` | Eating soup | Low |
| `Swallowing` | Swallowing | Low |

**When to use:** Rarely used in recipes (mostly for consumable items in item definitions, not recipes)

---

### Drinking Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `DrinkingFromGeneric` | Generic drinking | Low |
| `DrinkingFromBottle` | Drinking from bottle | Low |
| `DrinkingFromBottleGlass` | Drinking from glass bottle | Low |
| `DrinkingFromBottlePlastic` | Drinking from plastic bottle | Low |
| `DrinkingFromCan` | Drinking from can | Low |
| `DrinkingFromMug` | Drinking from mug | Low |
| `DrinkingFromCarton` | Drinking from carton | Low |
| `DrinkingFromPool` | Drinking from pool | None |
| `DrinkingFromRiver` | Drinking from river | None |
| `DrinkingFromTap` | Drinking from tap | Low |

**When to use:** Rarely used in recipes (mostly for consumable items in item definitions)

---

### Movement & Foley

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `HumanFootstepsCombined` | Footstep sounds | None |
| `ClimbThroughWindow` | Climbing through window | None |
| `ClimbOverFenceLow` | Climbing low fence | None |
| `ClimbOverFenceHighStart` | Starting to climb high fence | None |
| `ClimbOverFenceHighStruggle` | Struggling on high fence | None |
| `ClimbOverFenceHighSuccess` | Successfully climbing high fence | None |
| `ClimbOverFenceHighFail` | Failing to climb high fence | None |
| `TripOverObstacle` | Tripping over obstacle | None |
| `FallHeavy` | Heavy fall | None |
| `FallLight` | Light fall | None |
| `LandHeavy` | Heavy landing | None |
| `LandLight` | Light landing | None |

**When to use:** Never used in recipes (movement system sounds)

---

### Combat

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `AttackShove` | Shoving attack | None |
| `AttackStomp` | Stomp attack | None |
| `ZombieRipClothing` | Clothing being ripped by zombie | None |
| `BareHandsHit` | Bare hands hit | None |

**When to use:** Never used in recipes (combat system sounds)

---

### Health & Status

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `HeartBeat` | Heartbeat sound | None |
| `FemaleBeingEatenDeath` | Female death by zombie | None |
| `MaleBeingEatenDeath` | Male death by zombie | None |
| `Smoke` | Smoking | None |

**When to use:** Never used in recipes (health system sounds)

---

### Hygiene

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `WashClothing` | Washing clothing | None |
| `WashYourself` | Washing yourself | None |

**When to use:** Never used in recipes (hygiene system sounds)

---

### Literature

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `OpenBook` | Opening book | None |
| `CloseBook` | Closing book | None |
| `PageFlipBook` | Flipping book page | None |
| `OpenMagazine` | Opening magazine | None |
| `CloseMagazine` | Closing magazine | None |
| `PageFlipMagazine` | Flipping magazine page | None |

**When to use:** Never used in recipes (literature system sounds)

---

### Building & Construction

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `Painting` | Painting | Low |
| `Plastering` | Plastering walls | Low |
| `MakePlaster` | Making plaster | Low |
| `BuildWoodenStructureSmall` | Building small wooden structure | Low |
| `BuildWoodenStructureMedium` | Building medium wooden structure | Low |
| `BuildWoodenStructureLarge` | Building large wooden structure | Low |
| `BuildMetalStructureSmall` | Building small metal structure | Low |
| `BuildMetalStructureMedium` | Building medium metal structure | Low |
| `BuildMetalStructureSmallScrap` | Building scrap metal structure | Low |
| `BuildMetalStructureLargePoleFence` | Building large pole fence | Low |
| `BuildMetalStructureSmallPoleFence` | Building small pole fence | Low |
| `BuildMetalStructureLargeWiredFence` | Building large wired fence | Low |
| `BuildMetalStructureSmallWiredFence` | Building small wired fence | Low |
| `BuildMetalStructureWallFrame` | Building metal wall frame | Low |
| `BuildFenceCairn` | Building cairn fence | Low |
| `BuildFenceSandbag` | Building sandbag fence | Low |
| `BuildFenceSandbagFoley` | Sandbag placement foley | Low |
| `BuildFenceGravelbag` | Building gravel bag fence | Low |
| `BuildFenceGravelbagFoley` | Gravel bag placement foley | Low |
| `BuildingGeneric` | Generic building sound | Low |

**When to use:** Rarely used in recipes (mostly for MultiStageBuild constructions)

---

### Cleaning

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `CleanBloodVehicle` | Cleaning blood from vehicle | None |
| `CleanBloodBleach` | Cleaning blood with bleach | None |
| `CleanBloodScrub` | Scrubbing blood | None |

**When to use:** Never used in recipes (cleaning system sounds)

---

### Repair

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `RepairWithWrench` | Repairing with wrench | None |

**When to use:** Rarely used in recipes (vehicle system sound)

---

### Farming (Player Category)

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `DigFurrowWithHands` | Digging with hands | Low |
| `DigFurrowWithShovel` | Digging with shovel | Low |
| `DigFurrowWithTrowel` | Digging with trowel | Low |
| `OpenSeedPacket` | Opening seed packet | **Medium (7 uses)** |
| `SowSeeds` | Planting seeds | Low |
| `HarvestCrops` | Harvesting crops | None |
| `WaterCrops` | Watering plants | None |
| `DropSoilFromShovel` | Dropping soil from shovel | Low |
| `DropSoilFromTrowel` | Dropping soil from trowel | Low |
| `DropSoilFromDirtBag` | Dropping soil from dirt bag | Low |
| `DropSoilFromGravelBag` | Dropping soil from gravel bag | Low |
| `DropSoilFromSandBag` | Dropping soil from sand bag | Low |

**When to use:**
- `OpenSeedPacket` - Opening seed packets or small packages (common)
- Other farming sounds - Rarely used in recipes (farming system sounds)

---

### Cooking (Player Category)

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `BoilingFood` | Boiling food on stove | Low |
| `FryingFood` | Frying food in pan | Low |
| `OpenCannedFood` | Opening canned food | **Very High (25+ uses)** |
| `EmptyPan` | Emptying pan/container | **Medium (5 uses)** |

**When to use:**
- `OpenCannedFood` - Opening cans, containers, packages (very common)
- `EmptyPan` - Emptying containers, pouring liquids
- `BoilingFood`, `FryingFood` - Rarely used in recipes (cooking system sounds)

---

### Logs (Player Category)

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `LogAddToStack` | Adding log to stack | Low |
| `LogRemoveFromStack` | Removing log from stack | Low |

**When to use:** Rarely used in recipes (log stacking system sounds)

---

### Fire Starting (Player Category)

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `UseMatch` | Using match | None |
| `UseLighter` | Using lighter | None |

**When to use:** Never used in recipes (fire starting system sounds)

---

### Map (Player Category)

Listed in Item Sounds section for organization.

---

### Door Opening (Player Category)

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `OpenStoveDoor` | Opening stove door | Low |
| `CloseStoveDoor` | Closing stove door | Low |

**When to use:** Rarely used in recipes

---

## World Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_world.txt`
**Category:** World
**Total Sounds:** ~30

### Ambiance

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `WorldAmbiance` | General world ambiance | None |
| `TentAmbiance` | Tent ambient sounds | None |
| `TreeAmbiance` | Tree ambient sounds | None |
| `VehicleAmbiance` | Vehicle ambient sounds | None |
| `FactoryMachineAmbiance` | Factory machine sounds | None |
| `HotdogMachineAmbiance` | Hot dog machine sounds | None |
| `PayPhoneAmbiance` | Pay phone sounds | None |
| `StreetLightAmbiance` | Street light sounds | None |
| `NeonLightAmbiance` | Neon light sounds | None |
| `NeonSignAmbiance` | Neon sign sounds | None |
| `JukeboxAmbiance` | Jukebox sounds | None |
| `ControlStationAmbiance` | Control station sounds | None |
| `ClockAmbiance` | Clock ticking sounds | None |
| `GasPumpAmbiance` | Gas pump sounds | None |
| `LightBulbAmbiance` | Light bulb sounds | None |
| `ArcadeMachineAmbiance` | Arcade machine sounds | None |
| `FountainSmallAmbiance` | Small fountain sounds | None |
| `FountainBigAmbiance` | Large fountain sounds | None |
| `RadiatorAmbiance` | Radiator sounds | None |

**When to use:** Never used in recipes (environmental ambient sounds)

---

### Fishing

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `StrikeWithFishingSpear` | Spear fishing strike | None |
| `LureHitWater` | Fishing lure hitting water | None |
| `CatchFish` | Catching fish | None |
| `CatchTrashWithRod` | Catching trash while fishing | None |
| `CheckFishingNet` | Checking fishing net | None |
| `PlaceFishingNet` | Placing fishing net | None |
| `RemoveFishingNet` | Removing fishing net | None |

**When to use:** Never used in recipes (fishing system sounds)

---

### Weather & Events

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `Thunder` | Thunder sound | None |
| `RumbleThunder` | Rumbling thunder | None |
| `HouseAlarm` | House alarm | None |
| `CorpseFlies` | Flies around corpse | None |
| `WorldEventElectricityShutdown` | Electricity shutdown event | None |

**When to use:** Never used in recipes (weather/event system sounds)

---

## Zombie Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_zombie.txt`
**Category:** Zombie
**Total Sounds:** ~20

### Zombie Movement

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `ZombieFootstepsCombined` | Zombie footsteps | None |

**When to use:** Never used in recipes (zombie system sound)

---

### Zombie Vocals

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `FemaleZombieCombined` | Female zombie sounds | None |
| `MaleZombieCombined` | Male zombie sounds | None |

**When to use:** Never used in recipes (zombie system sounds)

---

### Zombie Combat

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `HeadSmash` | Head smashed | None |
| `HeadStab` | Head stabbed | None |
| `BurningFlesh` | Burning flesh | None |
| `ZombieScratch` | Zombie scratching | None |
| `ZombieBite` | Zombie biting | None |
| `ZombieCrawlLungeSwing` | Crawler lunge swing | None |
| `ZombieCrawlLungeHit` | Crawler lunge hit | None |

**When to use:** Never used in recipes (zombie combat sounds)

---

### Zombie Interactions

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `ZombieThumpGeneric` | Generic thumping | None |
| `ZombieThumpMetal` | Thumping metal | **Low (MultiStageBuild only)** |
| `ZombieThumpVehicle` | Thumping vehicle | None |
| `ZombieThumpVehicleWindow` | Thumping vehicle window | None |
| `ZombieThumpWindow` | Thumping window | None |
| `ZombieThumpBarbedFence` | Thumping barbed fence | None |
| `ZombieThumpGarageDoor` | Thumping garage door | None |

**When to use:**
- `ZombieThumpMetal` - ONLY for MultiStageBuild constructions (ThumpSound property)
- Never used in regular recipes

---

### Zombie Events

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `ZombieSurprisedPlayer` | Zombie surprised player | None |
| `BodyHitGround` | Body hitting ground | None |
| `ZombieTrip` | Zombie tripping | None |
| `TutorialZombie` | Tutorial zombie sound | None |

**When to use:** Never used in recipes (zombie event sounds)

---

## UI Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_ui.txt`
**Category:** UI
**Total Sounds:** ~10

### UI Interaction

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `UIActivateButton` | Button click | None |
| `UIActivateTab` | Tab activation | None |
| `UIActivateMainMenuItem` | Main menu item click | None |
| `UIActivatePlayButton` | Play button click | None |
| `UIClickToStart` | Click to start | None |
| `UIHighlightMainMenuItem` | Menu item highlight | None |
| `UISelectListItem` | List item selection | None |
| `UIToggleComboBox` | Combo box toggle | None |
| `UIToggleTickBox` | Checkbox toggle | None |

**When to use:** Never used in recipes (UI system sounds only)

---

## Meta Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_meta.txt`
**Category:** Meta
**Total Sounds:** ~15

### Meta Events

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `Helicopter` | Helicopter event | None |

**When to use:** Never used in recipes (story event sound)

---

### Meta Weapons

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `MetaAssaultRifle1` | Distant assault rifle | None |
| `MetaPistol1` | Distant pistol shot | None |
| `MetaPistol2` | Distant pistol shot variant 2 | None |
| `MetaPistol3` | Distant pistol shot variant 3 | None |
| `MetaShotgun1` | Distant shotgun | None |

**When to use:** Never used in recipes (distant gunfire sounds for meta events)

---

### Meta Animals & Sounds

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `MetaDogBark` | Distant dog barking | None |
| `MetaScream` | Distant scream | None |
| `MetaOwl` | Owl hooting | None |
| `MetaWolfHowl` | Wolf howling | None |

**When to use:** Never used in recipes (distant ambient sounds)

---

### Meta Game Events

| Sound Name | Description | Recipe Usage |
|------------|-------------|--------------|
| `ChatDrawCard` | Drawing card sound | None |
| `ChatRollDice` | Rolling dice sound | None |

**When to use:** Never used in recipes (multiplayer chat game sounds)

---

## Music Sounds

**Source File:** `ProjectZomboid/media/scripts/sounds_music.txt`
**Category:** Music
**Total Sounds:** ~100+

### Music Tracks

| Sound Name | Theme |
|------------|-------|
| `MusicCombined` | Combined music |
| `NewMusic_WWL_Solo` | What Was Lost Solo |
| `NewMusic_Travelling` | Travelling theme |
| `NewMusic_TakeStock` | Take Stock theme |
| `NewMusic_PassingTime` | Passing Time theme |
| `NewMusic_NoTime` | No Time theme |
| `NewMusic_MoreAreComing` | More Are Coming theme |
| `NewMusic_OnlyOneWay` | Only One Way theme |
| `NewMusic_KeepMoving` | Keep Moving theme |
| `NewMusic_GoItAlone` | Go It Alone theme |
| `NewMusic_Sunrise` | Sunrise theme |
| `NewMusic_HoldingOutHope` | Holding Out Hope theme |
| `NewMusic_Working` | Working theme |
| `NewMusic_Sunset` | Sunset theme |
| `NewMusic_Mourning` | Mourning theme |
| `NewMusic_LookingAround` | Looking Around theme |
| `NewMusic_Waiting` | Waiting theme |
| `NewMusic_Overrun` | Overrun theme |
| `NewMusic_Rest` | Rest theme |
| `NewMusic_PressOn` | Press On theme |
| `NewMusic_CalmBeforeTheStorm` | Calm Before The Storm theme |
| `NewMusic_GetReady` | Get Ready theme |
| `NewMusic_EchoesFromBefore` | Echoes From Before theme |
| `NewMusic_Surrounded` | Surrounded theme |
| `NewMusic_ThePlan` | The Plan theme |
| `NewMusic_GearUp` | Gear Up theme |
| `NewMusic_FinallyCalm` | Finally Calm theme |
| `NewMusic_PatchUp` | Patch Up theme |
| `NewMusic_TheyreClose` | They're Close theme |
| `NewMusic_ThinkingOfThePast` | Thinking Of The Past theme |
| `NewMusic_TouchAndGo` | Touch And Go theme |
| `NewMusic_Tread_Carefully` | Tread Carefully theme |
| `NewMusic_Everythings_Gone` | Everything's Gone theme |
| `NewMusic_Alone` | Alone theme |
| `NewMusic_Barricading` | Barricading theme |
| `NewMusic_Chase` | Chase theme |
| `NewMusic_DesperateEscape` | Desperate Escape theme |
| `NewMusic_FightOrFlight` | Fight or Flight theme |
| `NewMusic_Introduction` | Introduction theme |
| `NewMusic_MainTheme` | Main Theme |
| `NewMusic_MaybeNot` | Maybe Not theme |
| `NewMusic_MaybeWeCanWinThis` | Maybe We Can Win This theme |
| `NewMusic_Run` | Run theme |
| `NewMusic_SlowSad` | Slow Sad theme |
| `NewMusic_TheyWereOnceHere` | They Were Once Here theme |
| `NewMusic_SayingGoodbye` | Saying Goodbye theme |
| `NewMusic_TheHorde` | The Horde theme |
| `NewMusic_Death` | Death theme |
| `NewMusic_TheInevitable` | The Inevitable theme |
| `NewMusic_TheZombieThreat` | The Zombie Threat theme |
| `NewMusic_WhatWasLost` | What Was Lost theme |
| `NewMusic_WhatWasLostActive` | What Was Lost Active theme |
| `NewMusic_WhatWasLostActive2` | What Was Lost Active 2 theme |
| `NewMusic_WhereIsEveryone` | Where is Everyone theme |
| `NewMusic_WorkFast` | Work Fast theme |

---

### Ambient Music

| Sound Name | Type |
|------------|------|
| `NewMusic_Ambient` | Ambient track |
| `NewMusic_AmbientGuitar` | Ambient Guitar track |
| `NewMusic_AmbientLow` | Ambient Low track |
| `NewMusic_AmbientPiano` | Ambient Piano track |
| `NewMusic_AmbientRaider` | Ambient Raider track |
| `AmbientMusic_BrassAmbient` | Brass ambient |
| `AmbientMusic_CreepyAmbient` | Creepy ambient |
| `AmbientMusic_IntenseAmbient` | Intense ambient |
| `AmbientMusic_PercussiveAmbient` | Percussive ambient |
| `AmbientMusic_RhythmicAmbient` | Rhythmic ambient |
| `AmbientMusic_VoiceAmbient` | Voice ambient |
| `AmbientMusic_ZombieAmbient` | Zombie ambient |

**When to use:** Never used in recipes (background music tracks only)

**Note:** Music sounds are for the game's soundtrack system and are never used in recipe crafting. They're included for completeness.

---

## Usage Examples

### Basic Recipe with Sound

```
recipe Make Plank
{
    WoodLog,  // Required material (wood log)
    keep Saw,  // Tool needed (not consumed)

    Result:Plank=4,  // Creates 4 planks
    Time:50.0,  // Takes 50 seconds to craft
    Sound:Sawing,  // Sawing sound plays during crafting
    Category:Carpentry,  // Appears in Carpentry category
}
```

---

### Multiple Item Recipe

```
recipe Rip Sheets
{
    Sheet,  // Bed sheet (consumed)

    Result:RippedSheets=2,  // Creates 2 ripped sheets
    Time:20.0,  // Takes 20 seconds
    Sound:ClothesRipping,  // Cloth tearing sound
    Category:Survivalist,  // Survivalist category
}
```

---

### Food Recipe with Sound

```
recipe Slice Bread
{
    Bread,  // Whole bread loaf (consumed)
    keep KitchenKnife,  // Kitchen knife (not consumed)

    Result:BreadSlice=6,  // Creates 6 bread slices
    Time:10.0,  // Takes 10 seconds
    Sound:SliceBread,  // Bread slicing sound
    Category:Cooking,  // Cooking category
}
```

---

### Butchering Recipe

```
recipe Butcher Rabbit
{
    DeadRabbit,  // Dead rabbit (consumed)
    keep KitchenKnife,  // Knife for butchering (not consumed)

    Result:Rabbit=1,  // Creates 1 rabbit meat
    Time:50.0,  // Takes 50 seconds
    Sound:SliceMeat,  // Meat slicing sound
    Category:Cooking,  // Cooking category
}
```

---

### Disassembly Recipe

```
recipe Dismantle Radio
{
    Radio,  // Radio (consumed)
    keep Screwdriver,  // Screwdriver (not consumed)

    Result:ElectronicsScrap=3,  // Creates 3 electronics scrap
    Result:ScrapMetal=2,  // Creates 2 scrap metal
    Time:100.0,  // Takes 100 seconds
    Sound:Dismantle,  // Dismantling sound
    Category:Electrical,  // Electrical category
}
```

---

### Crafting Recipe with Generic Sound

```
recipe Craft Molotov Cocktail
{
    WhiskeyFull,  // Full whiskey bottle (consumed)
    RippedSheets,  // Ripped sheets for wick (consumed)

    Result:MolotovCocktail,  // Creates 1 molotov cocktail
    Time:30.0,  // Takes 30 seconds
    Sound:PutItemInBag,  // Generic item handling sound
    Category:Survivalist,  // Survivalist category
}
```

---

### Hammering Recipe

```
recipe Build Wooden Box
{
    Plank=4,  // Requires 4 planks (consumed)
    Nails=8,  // Requires 8 nails (consumed)
    keep Hammer,  // Hammer (not consumed)

    Result:CratePlank,  // Creates 1 wooden crate
    Time:80.0,  // Takes 80 seconds
    Sound:Hammering,  // Hammering sound
    Category:Carpentry,  // Carpentry category
}
```

---

### Opening Container Recipe

```
recipe Open Can of Soup
{
    TinnedSoup,  // Canned soup (consumed)
    keep CanOpener,  // Can opener (not consumed)

    Result:OpenTinnedSoup,  // Creates opened soup can
    Time:10.0,  // Takes 10 seconds
    Sound:OpenCannedFood,  // Can opening sound
    Category:Cooking,  // Cooking category
}
```

---

## Sound System Notes

### Important Considerations

1. **Case Sensitivity**
   Sound names are case-sensitive. Use exact capitalization as shown in this reference.
   - ✅ `Sawing` (correct)
   - ❌ `sawing` (wrong)
   - ❌ `SAWING` (wrong)

2. **Sound Parameter**
   Use `Sound:SoundName,` in recipe definitions.

3. **Evolved Recipe Sounds**
   Evolved recipes (food recipes) can use `AddIngredientSound:SoundName,` for the sound when adding ingredients.

4. **MultiStageBuild Sounds**
   Construction (MultiStageBuild) can use:
   - `CraftingSound:SoundName,` - Sound while building
   - `CompletionSound:SoundName,` - Sound when completed
   - `ThumpSound:SoundName,` - Sound when zombies attack (typically `ZombieThumpMetal`)

5. **Most Versatile Sounds for Recipes**
   These sounds work for most situations:
   - **PutItemInBag** - Generic item handling, combining items
   - **Sawing** - Wood cutting, sawing actions
   - **Hammering** - Building, nailing, construction
   - **ClothesRipping** - Fabric work, tearing materials
   - **SliceMeat** - Butchering, cutting meat/tough materials
   - **SliceBread** - Slicing soft materials/food
   - **OpenCannedFood** - Opening containers, cans, packages
   - **Screwdriver** - Electronics, mechanical work
   - **Dismantle** - Taking apart items

6. **Sound Events**
   Sounds are tied to FMOD events in the format:
   - `Character/Foley/Bag/Open`
   - `Character/Survival/Carpentry/Sawing`
   - `Character/Survival/Cooking/SliceBread`

7. **Sound Categories**
   Sounds belong to categories (Item, Player, Object, World, Zombie, UI, Meta, Music) which affect how they're processed by the engine.

---

### Testing Sounds

To test sounds in your recipes:

1. **Create a simple test recipe** with the sound
2. **Set a short Time value** (e.g., `Time:10.0,`) for quick testing
3. **Test in Debug Mode** (press `Ctrl + Z` to enable debug, then `I` to spawn items)
4. **Verify the sound plays** when the recipe executes
5. **Try the recipe multiple times** to ensure the sound loops correctly for long crafting times

**Tip:** Use `Time:50.0` or higher in test recipes so you have enough time to clearly hear the sound loop.

---

### Common Issues

#### Issue: Sound doesn't play
- ✅ Check sound name spelling and capitalization
- ✅ Verify sound exists in vanilla sound files
- ✅ Ensure sound category is appropriate for recipe context
- ✅ Check for typos in the `Sound:` property

#### Issue: Wrong sound plays
- ✅ Double-check sound name matches intended sound
- ✅ Review sound descriptions in this document
- ✅ Test with vanilla recipes that use the same sound
- ✅ Make sure you're not confusing similar sound names

#### Issue: Sound cuts off early
- ✅ Increase the `Time:` value in your recipe
- ✅ Some sounds are designed to loop for long actions
- ✅ Very short Time values may not play the full sound

---

## Sound File Locations

### Script Files (Definitions)

These files define which sounds exist in the game:

- `ProjectZomboid/media/scripts/sounds_item.txt` - Item sounds
- `ProjectZomboid/media/scripts/sounds_object.txt` - Object sounds
- `ProjectZomboid/media/scripts/sounds_player.txt` - Player sounds
- `ProjectZomboid/media/scripts/sounds_world.txt` - World sounds
- `ProjectZomboid/media/scripts/sounds_zombie.txt` - Zombie sounds
- `ProjectZomboid/media/scripts/sounds_ui.txt` - UI sounds
- `ProjectZomboid/media/scripts/sounds_meta.txt` - Meta sounds
- `ProjectZomboid/media/scripts/sounds_music.txt` - Music sounds

**To browse sound definitions:**
```bash
# View item sounds
type "ProjectZomboid/media/scripts/sounds_item.txt"

# Search for specific sound
findstr /i "sawing" "ProjectZomboid/media/scripts/sounds_*.txt"
```

---

### Audio Files (Actual Sound Data)

The actual audio files are stored here:

- `ProjectZomboid/media/sound/` - Contains .ogg and .wav files

---

### FMOD Banks (Sound Engine)

The sound engine data:

- `ProjectZomboid/media/sound/banks/` - FMOD sound banks

**Note:** The script files (.txt) tell you which sounds you can reference in recipes. The audio files (.ogg/.wav) and FMOD banks contain the actual audio data and are managed by the game's sound engine.

---

## Summary Statistics

**Sound Categories:**
- **Item Sounds:** ~30
- **Object Sounds:** ~150
- **Player Sounds:** ~90
- **World Sounds:** ~30
- **Zombie Sounds:** ~20
- **UI Sounds:** ~10
- **Meta Sounds:** ~15
- **Music Sounds:** ~100+

**Total Unique Sounds:** 400+ sound definitions

**Most Common Sounds in Recipes:**
1. **PutItemInBag** - Very High (30+ uses)
2. **OpenCannedFood** - Very High (25+ uses)
3. **Hammering** - Very High (20+ uses)
4. **Sawing** - Very High (15+ uses)
5. **SliceMeat** - High (10+ uses)
6. **AddItemInBeverage** - Medium (9 uses)
7. **ClothesRipping** - High (7 uses)
8. **OpenSeedPacket** - Medium (7 uses)
9. **BlowTorch** - Medium (6 uses)
10. **EmptyPan** - Medium (5 uses)

**Sound Distribution:**
- **Recipe-useful sounds:** ~40 (10% of total)
- **System sounds:** ~360 (90% of total - environmental, UI, etc.)

---

## Key Takeaways

1. **Sounds are simple to add** - Just add `Sound:SoundName,` to your recipe

2. **Use common sounds first** - 90% of recipes use the Top 15 sounds listed at the start

3. **Match sound to action** - Use `Sawing` for woodwork, `Hammering` for nailing, `ClothesRipping` for fabric, etc.

4. **Case-sensitive** - `Sawing` ≠ `sawing`. Capitalization must be exact.

5. **One sound per recipe** - You can only have one `Sound:` property per recipe

6. **Sounds are optional** - Recipes work without them, but sounds add immersion and polish

7. **Test your sounds** - Make sure they match the action semantically and sound appropriate

8. **Most sounds are system sounds** - Only ~40 sounds (10%) are useful for recipes. Focus on Item and Player categories.

9. **PutItemInBag is your friend** - When in doubt, use `PutItemInBag` for generic item handling

10. **Reference this document** - Use Ctrl+F to search for specific sounds when needed

---

**What's next?** Now that you know about sounds, check out [Animation Reference](../animation-reference) to add visual animations to your recipes, completing the full sensory experience.

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
