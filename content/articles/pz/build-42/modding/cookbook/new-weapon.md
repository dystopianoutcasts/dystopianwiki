---
id: build-42-new-weapon
slug: new-weapon
title: New weapon
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod that adds a melee weapon, the Demo Plank, modeled on the vanilla baseball bat, and spawn it with the debug Items List.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - item-repair
  - items-the-item-block-in-b42
  - tags
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoWeapon`: one weapon script, one translation file and the two files every mod has, `mod.info` and `poster.png`.
- The weapon is a copy of the vanilla baseball bat's block under a new name, so it reuses the bat's model, icon, sounds and swing animation and needs no art.
- `ItemType = base:weapon` makes the game build the item as a hand weapon, and the damage, range, speed and condition lines are what make it a bat and not a stick.
- A firearm uses the same kind of block with more lines. This page shows which lines but does not build one.
:::

:::facts
- **Mod id** `RecipeDemoWeapon`
- **Weapon** `RecipeDemoWeapon.Plank`, shown as Demo Plank
- **Damage** 0.8 to 1.1, range 0.61 to 1.25, up to 2 targets per swing
- **Condition** 15 at most; `ConditionLowerChanceOneIn = 20` sets the wear chance, which the engine multiplies and adjusts by the wielder's Maintenance skill
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) and [new item](/pz/build-42/modding/cookbook/new-item)
:::

## What you will build

**A two-handed blunt weapon you can spawn, equip and swing.**

The Demo Plank is the vanilla baseball bat with another name. It is the safest way to learn the weapon block, because every line is one the game already accepts for a bat, and you can change the numbers one at a time.

In the game it appears in the Items List as **Demo Plank** under **Sports / Weapon**. When you equip it, you hold the bat model and swing with the bat animation.

## The files

**The mod files, one script and one translation file, laid out as in the project skeleton.**

```
Zomboid/mods/RecipeDemoWeapon/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoWeapon_items.txt
      lua/
        shared/
          Translate/
            EN/
              ItemName.json
```

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) for the folders and the poster, and from [new item](/pz/build-42/modding/cookbook/new-item) for how the script and the translation are read.

## Step by step

**Write the three text files and copy the poster.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton and write `mod.info` with the new id.

**File `42/mod.info`**

```
name=Recipe Demo Weapon
id=RecipeDemoWeapon
description=Adds one melee weapon, the Demo Plank.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoWeapon_items.txt`

This is the weapon. It is the vanilla baseball bat, with the `OnBreak` line and the `Researchablerecipes` line left out because they point at vanilla Lua and vanilla recipes, and with the icon named directly. :cite[(`media/scripts/generated/items/weapon.txt:6983-7031`)]

**File `42/media/scripts/RecipeDemoWeapon_items.txt`**

```
module RecipeDemoWeapon
{
    item Plank
    {
        DisplayCategory = SportsWeapon,
        ItemType = base:weapon,
        Weight = 2.0,
        Icon = BaseballBat,
        AttachmentType = Shovel,
        BaseSpeed = 1.0,
        BreakSound = BaseballBatBreak,
        Categories = base:blunt,
        ConditionLowerChanceOneIn = 20,
        ConditionMax = 15,
        CriticalChance = 40.0,
        CritDmgMultiplier = 2.0,
        DoorDamage = 5,
        DoorHitSound = BaseballBatHit,
        DropSound = BaseballBatDrop,
        EquipSound = BaseballBatEquip,
        HitAngleMod = -30.0,
        HitFloorSound = BaseballBatHit,
        HitSound = BaseballBatHit,
        IdleAnim = Idle_Weapon2,
        KnockBackOnNoDeath = true,
        KnockdownMod = 2.0,
        MaxDamage = 1.1,
        MaxHitcount = 2,
        MaxRange = 1.25,
        MinAngle = 0.75,
        MinDamage = 0.8,
        MinRange = 0.61,
        MinimumSwingtime = 3.0,
        PushBackMod = 0.5,
        RunAnim = Run_Weapon2,
        SplatBloodOnNoDeath = false,
        SplatNumber = 1,
        SubCategory = Swinging,
        SwingAmountBeforeImpact = 0.02,
        SwingAnim = Bat,
        SwingSound = BaseballBatSwing,
        Swingtime = 3.0,
        TreeDamage = 1,
        TwoHandWeapon = true,
        UnequipSound = BaseballBatUnEquip,
        WeaponLength = 0.5,
        WeaponSprite = BaseballBat,
        Tags = base:isfirefuel;base:repairwithglue;base:repairwithtape,
    }
}
```

The item is `RecipeDemoWeapon.Plank`. Every name on the right of a sound, animation or model line is a vanilla name, so the weapon needs no sound or model file of its own. The bat's sound names are real sound scripts, for example `BaseballBatHit`. :cite[(`media/scripts/generated/sounds/weapons/sounds_melee_bluntlong.txt:219`)]

The lines that set how the weapon plays are these.

| Line | What it does | Code |
|------|--------------|------|
| `ItemType = base:weapon` | Builds the item as a `HandWeapon`. | `zombie/scripting/objects/Item.java:1623-1625` |
| `MinDamage`, `MaxDamage` | Set the damage range of a hit. | `zombie/scripting/objects/Item.java:2302`, `zombie/scripting/objects/Item.java:2156`, `zombie/scripting/objects/Item.java:1630-1631` |
| `MinRange`, `MaxRange` | Set how close and how far the weapon can reach. | `zombie/scripting/objects/Item.java:2152`, `zombie/scripting/objects/Item.java:2150`, `zombie/scripting/objects/Item.java:1636-1637` |
| `Swingtime`, `MinimumSwingtime` | Set how long a swing takes. | `zombie/scripting/objects/Item.java:2367`, `zombie/scripting/objects/Item.java:2304` |
| `Categories = base:blunt` | Names the weapon skill category by its registry id. A name with no namespace is read as `base`. | `zombie/scripting/objects/Item.java:2347-2351`, `zombie/scripting/objects/ResourceLocation.java:29-37` |
| `ConditionMax`, `ConditionLowerChanceOneIn` | Set the most condition the weapon has, and the one-in chance that a hit wears it down. | `zombie/scripting/objects/Item.java:2298`, `zombie/scripting/objects/Item.java:2290-2291` |
| `TwoHandWeapon`, `MaxHitcount` | Make it two-handed and limit the targets one swing can hit. | `zombie/scripting/objects/Item.java:2556`, `zombie/scripting/objects/Item.java:2402` |
| `SwingAnim`, `IdleAnim`, `RunAnim` | Name the animations used while swinging, standing and running with it. | `zombie/scripting/objects/Item.java:1998`, `zombie/scripting/objects/Item.java:2412`, `zombie/scripting/objects/Item.java:2414` |
| `WeaponSprite` | Names the model script drawn in your hands and on the ground. The vanilla bat model is `BaseballBat`. | `zombie/scripting/objects/Item.java:2310-2311`, `media/scripts/generated/models_weapons.txt:1695` |
| `Tags` | Marks the weapon as firewood and as repairable with glue and with tape. | `media/scripts/generated/recipes/recipes_fixing.txt:4-8`, `media/scripts/generated/recipes/recipes_fixing.txt:76` |

After scripts load, the game checks the model names of every item and writes a warning for a name it cannot find. :cite[(`zombie/scripting/objects/ModelScript.java:309-316`, `zombie/scripting/objects/ModelScript.java:296-299`)]

### Step 3. `42/media/lua/shared/Translate/EN/ItemName.json`

The name works as it does in [new item](/pz/build-42/modding/cookbook/new-item): the key is the full type. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoWeapon.Plank": "Demo Plank"
}
```

## Turn it on and see it work

**Spawn the weapon, equip it, and swing it.**

1. Put the `RecipeDemoWeapon` folder in `Zomboid/mods/`, start the game with `-debug`, check **Recipe Demo Weapon** on the **MODS** screen, choose **ACCEPT** and start a new game, as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Open the debug menu from the side bar, choose **Items List**, type `Demo Plank` in the **Name** filter and press **Add 1**. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`, `media/lua/shared/Translate/EN/IG_UI.json:1538`)]
3. Equip the **Demo Plank** from your inventory and swing it at a zombie or a tree.

You should see **Demo Plank** under the category **Sports / Weapon** with the baseball bat icon. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:304`)] In your hands it should look and swing like the vanilla bat, and its condition starts at 15. A hit has a chance to take a point off it. The line `ConditionLowerChanceOneIn = 20` sets the base of that chance, and the engine multiplies it for some weapons and adds the wielder's Maintenance modifier, so the real chance is not exactly one in twenty. :cite[(`zombie/CombatManager.java:532`)]

On a dedicated server, add `Mods=RecipeDemoWeapon` to the settings file and copy the mod into the server's `mods` folder, as described in the skeleton page. These server steps have not been run in a game.

## If it does not work

**A weapon usually fails on a name the game cannot find.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `no such model "BaseBallBat" for RecipeDemoWeapon.Plank` in the log | The `WeaponSprite` name does not match a `model` script. Copy the name exactly, including capitals. | `zombie/scripting/objects/ModelScript.java:296-299` |
| The weapon is named `RecipeDemoWeapon.Plank` | `ItemName.json` is missing or its key is not the full type. | `zombie/scripting/objects/Item.java:3067` |
| `adding unknown item param "MaxDamge"` in the log | A misspelled line is kept as mod data on the item and does nothing, so the weapon keeps the default for that value. | `zombie/scripting/objects/Item.java:2998-3019` |
| `Error: MinDamage is not a valid parameter in item: Plank` | The number cannot be read, and the load stops with that error. | `zombie/scripting/objects/Item.java:3022-3023` |
| The weapon cannot be equipped, or the swing looks wrong | The block is not built as a hand weapon: check `ItemType = base:weapon`. A wrong `SwingAnim` name is not checked at load, so test it by swinging. | `zombie/scripting/objects/Item.java:1623-1625`, `zombie/scripting/objects/Item.java:1998` |

## A firearm is the same block with more lines

**This recipe builds a melee weapon only, and a firearm follows the same pattern with ammo lines added.**

The vanilla pistol is the block to copy, and it is far longer than the bat because it adds aiming, ammo, magazine, reload and sound lines. :cite[(`media/scripts/generated/items/weapon.txt:11464-11546`)] The lines that make it a firearm are below. This page did not build a firearm mod, so treat the list as the map for copying `Base.Pistol` under a new name, not as a tested recipe.

| Line in `Base.Pistol` | What it is for | Code |
|-----------------------|----------------|------|
| `IsAimedFirearm = true` | Marks the weapon as one that is aimed. | `media/scripts/generated/items/weapon.txt:11499`, `zombie/scripting/objects/Item.java:2440` |
| `Ranged = true` | Marks the weapon as ranged. | `media/scripts/generated/items/weapon.txt:11523`, `zombie/scripting/objects/Item.java:2142` |
| `AmmoType = base:bullets_9mm` | Names the ammo by its registry id. The vanilla list has ten ammo types. | `media/scripts/generated/items/weapon.txt:11477`, `zombie/scripting/objects/Item.java:2377`, `zombie/scripting/objects/AmmoType.java:15-24` |
| `MagazineType`, `MaxAmmo`, `ClipSize`, `AmmoBox` | Name the magazine item, and set the capacity and the box that holds the ammo. | `media/scripts/generated/items/weapon.txt:11503`, `media/scripts/generated/items/weapon.txt:11504`, `media/scripts/generated/items/weapon.txt:11482`, `media/scripts/generated/items/weapon.txt:11476` |
| `WeaponReloadType = handgun` | Chooses the reload routine. | `media/scripts/generated/items/weapon.txt:11543` |

The `AmmoType` line looks the id up in the ammo registry when the script loads. :cite[(`zombie/scripting/objects/Item.java:2377-2378`)] A custom ammo type therefore has to be registered first, with `AmmoType.register(id, itemKey)` in a `registries.lua` file. :cite[(`zombie/scripting/objects/AmmoType.java:60`)] The [registries page](/pz/build-42/modding/lua-api/registries-lua-the-new-b42-13-identifier-system) explains that file; this recipe does not use it.

## Going further

**Repair it, or read the full field list.**

- [Item repair](/pz/build-42/modding/cookbook/item-repair) shows how the repair tags and the repair block make a damaged weapon fixable.
- [New item](/pz/build-42/modding/cookbook/new-item) covers the script, the name and the icon in detail.
- [The item block in Build 42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) lists the fields of the item block.
- [Tags](/pz/build-42/modding/items-and-scripting/tags) explains the `Tags` line.

:::callout[How we know]{kind=proof}
The block is a copy of the vanilla baseball bat block with a new name, and the parse and model checks come from the 42.22 engine code cited above.

The mod in this page was built file for file in a test folder and passed the script checker. It has not been run in a game: the swing, the damage and the condition loss are what you check yourself. The firearm table is read from the vanilla pistol block and was not built. The custom ammo note is read from the code and was not built.
:::
