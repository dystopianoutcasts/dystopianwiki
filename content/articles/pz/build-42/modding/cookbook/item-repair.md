---
id: build-42-item-repair
slug: item-repair
title: Item repair
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
  Build a mod with a fixing block that lets the player repair a vanilla baseball bat with nails, and see the Repair menu, its percentages and its cost.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-weapon
  - new-item
  - script-file-anatomy
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoRepair`: one script file with one `fixing` block, plus the two files every mod has. It adds no item and no Lua.
- The block says which item it repairs (`Require`) and what it costs (`Fixer`). The order of the `Fixer` lines sets how much each one repairs.
- The player sees a **Repair** option when one item is selected, is not broken and has lost some condition.
- Vanilla uses `fixing` blocks for guns and for vehicle parts. Most other items are repaired by tags and craft recipes, which this page explains but does not build.
:::

:::facts
- **Mod id** `RecipeDemoRepair`
- **Repairs** `Base.BaseballBat`, with 2 nails and Carpentry 1, or with 4 nails
- **Files** 3 (`mod.info`, `poster.png`, the script)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A new way to repair the vanilla baseball bat, added by a script and nothing else.**

The mod adds one `fixing` block that names the bat and two ways to fix it. You spawn a bat, wear it down in debug mode, and the **Repair** option appears with a list of what the repair costs and how well it will work.

Because it adds no item, this is also the smallest complete mod in the cookbook after the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).

## The files

**The usual mod files and one script.**

```
Zomboid/mods/RecipeDemoRepair/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoRepair_fixing.txt
```

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) for the folders and the poster. The game reads every `.txt` file under `media/scripts/`, so the file name is yours to choose. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`)]

## Step by step

**Write `mod.info`, copy the poster, then write the script.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton and write `mod.info` with the new id.

**File `42/mod.info`**

```
name=Recipe Demo Repair
id=RecipeDemoRepair
description=Adds a nail repair for the baseball bat.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoRepair_fixing.txt`

This is the repair. It is modeled on the vanilla `fixing` blocks, which sit in a `Base` module and have the same three kinds of line. :cite[(`media/scripts/generated/fixing.txt:39-46`)]

**File `42/media/scripts/RecipeDemoRepair_fixing.txt`**

```
module RecipeDemoRepair
{
    fixing Fix Bat With Nails
    {
        Require = Base.BaseballBat,
        Fixer = Base.Nails=2; Woodwork=1,
        Fixer = Base.Nails=4,
    }
}
```

The block is named `Fix Bat With Nails`, and a `fixing` name may contain spaces, as the vanilla names do. :cite[(`media/scripts/generated/fixing.txt:3-7`, `media/scripts/generated/fixing.txt:61-66`)] The loader splits the body at commas and then each piece at its `=` sign, so every line is `Key = value,` with an equals sign. :cite[(`zombie/scripting/objects/Fixing.java:37-50`)]

| Line | What it does | Code |
|------|--------------|------|
| `Require = Base.BaseballBat` | Lists the items this block repairs, separated by `;`. The game offers the repair for an item whose full type is in the list. | `zombie/scripting/objects/Fixing.java:51-56`, `zombie/inventory/FixingManager.java:28-36` |
| `Fixer = Base.Nails=2; Woodwork=1` | One way to repair. It names the material by its full type, a count after `=`, and then skills as `Name=level` after a `;`. | `zombie/scripting/objects/Fixing.java:67-90` |
| `Fixer = Base.Nails=4` | A second way, with no skill. A fixer with no `;` is a material and a count only. | `zombie/scripting/objects/Fixing.java:67-74` |

The order of the `Fixer` lines decides how much each one repairs. The `Fixer` line written first repairs 50 percent of the missing condition, the line after it repairs 20 percent, and any later line repairs 10 percent. Each percent is divided by the number of repairs the item has already had plus one. :cite[(`zombie/inventory/FixingManager.java:210-214`)] For each skill the player has, every level above the one required adds 5 percent, up to 25, and every level below takes away 15. :cite[(`zombie/inventory/FixingManager.java:215-227`)]

The chance that a repair fails starts at 3 percent. Every missing skill level adds 30, every extra level takes away 5, and the item's number of repairs so far plus one adds 2 each. :cite[(`zombie/inventory/FixingManager.java:178-208`)] A failed repair takes one point of condition off the item. :cite[(`zombie/inventory/FixingManager.java:64-69`)] Either way the materials are used up. :cite[(`zombie/inventory/FixingManager.java:71-76`)]

The skill name is the name of a perk. `Woodwork` is the perk the game shows as Carpentry. :cite[(`zombie/characters/skills/PerkFactory.java:117`, `media/lua/shared/Translate/EN/IG_UI.json:200`)]

A `fixing` block can also carry two lines that this recipe leaves out: `GlobalItem`, one more item that every `Fixer` of the block also uses up, and `ConditionModifier`, a number that multiplies the percent repaired. :cite[(`zombie/scripting/objects/Fixing.java:58-66`, `zombie/inventory/FixingManager.java:228`)]

## Turn it on and see it work

**Spawn a bat and nails, wear the bat down, and open the Repair menu.**

1. Put the `RecipeDemoRepair` folder in `Zomboid/mods/`, start the game with `-debug`, check **Recipe Demo Repair** on the **MODS** screen, choose **ACCEPT** and start a new game, as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Open the debug menu, choose **Items List**, and add a **Baseball Bat** and five **Nails** with **Add 5**. Pick the row named exactly `Nails`, because other rows have similar names. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`, `media/lua/shared/Translate/EN/IG_UI.json:1540`)]
3. Right-click the bat, open the **Debug** submenu and choose **Edit Item**. Set its **Condition** to 5. The bat has a condition of 15 at most. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:4652-4658`, `media/lua/client/ISUI/AdminPanel/ISItemEditPanel.lua:20`, `media/scripts/generated/items/weapon.txt:6994`)]
4. Right-click the bat again, with only the bat selected. Choose **Repair Baseball Bat**. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:903-911`, `media/lua/shared/Translate/EN/ContextMenu.json:225`)]

The menu lists two entries, named by the raw full type: `2 Base.Nails` and `4 Base.Nails`. The label is the material's full type because the menu looks for an item called by the block's module plus that name, and there is none. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2446-2457`)] Vanilla guns show the same raw label. :cite[(`media/scripts/generated/fixing.txt:3-7`)]

Hover an entry. The tooltip reads **Potentially repairs** with a percent, **Chance of success** with a percent, and the nails and skills you have against the ones you need. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2470-2471`, `media/lua/shared/Translate/EN/Tooltip.json:206`, `media/lua/shared/Translate/EN/Tooltip.json:208`)] An entry is grayed out when you lack the items or a required skill level. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2486-2509`)]

With Carpentry at 0, the `2 Base.Nails` entry should be grayed out and the `4 Base.Nails` entry should read 20 percent and 95 percent. Choose the `4 Base.Nails` entry. The bat should go from condition 5 to 7, and four nails should be gone. The entry that costs more repairs less because the percent depends on the order of the `Fixer` lines, not on the cost: the line written first gets 50 percent and the next line 20 percent. :cite[(`zombie/inventory/FixingManager.java:178-228`)]

To try the `2 Base.Nails` entry, raise Carpentry to 1 with the debug menu's **Player** screen. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:22`)] The first entry should then read 50 percent, at a cost of two nails.

On a dedicated server, add `Mods=RecipeDemoRepair` to the settings file and copy the mod into the server's `mods` folder, as described in the skeleton page. These server steps have not been run in a game.

## If it does not work

**Repair blocks fail silently more often than they raise an error.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| No **Repair** option at all | The option shows only when one item is selected, it is not broken and its condition is below its maximum. A bat at full condition gets none. A bat at condition 0 gets none if the game counts it as broken, which a debug edit to 0 may or may not do. | `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:202-205`, `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:340-348` |
| Still no **Repair** option on a damaged bat | `Require` does not hold the item's full type. Write `Base.BaseballBat`, not `BaseballBat`. | `zombie/inventory/FixingManager.java:28-36` |
| A line of the block does nothing | The loader only reads pieces that contain an `=`. Lines written with a colon, such as `Require : WoodAxe,`, are skipped without a message. | `zombie/scripting/objects/Fixing.java:46-50` |
| A line after a `--` comment does nothing | Only `/* */` comments are removed before parsing. A `--` note is joined to the next line's key, so that key no longer matches. | `zombie/scripting/ScriptParser.java:59-91`, `zombie/scripting/objects/Fixing.java:46-57` |
| The entry is grayed out although you have nails | The material is named without its module, so it never matches the items you hold. The match uses the full type, such as `Base.Nails`. | `zombie/scripting/objects/Fixing.java:260-263` |
| A skill name is not found | An unknown skill name is read as the placeholder `MAX` perk and is not reported. Copy the name from the perk list. | `zombie/characters/skills/PerkFactory.java:392-394` |

## The other repair route: tags and craft recipes

**Most vanilla items are repaired by a tag on the item and a craft recipe that names the tag, not by a `fixing` block.**

The vanilla baseball bat carries the tags `base:repairwithglue` and `base:repairwithtape`. :cite[(`media/scripts/generated/items/weapon.txt:7029`)] The vanilla repair recipes take an input with that tag and the `IsDamaged` flag, plus a material such as duct tape, so any item with the tag can be repaired by them. :cite[(`media/scripts/generated/recipes/recipes_fixing.txt:4-17`, `media/scripts/generated/recipes/recipes_fixing.txt:76`)]

Vanilla has two files of `fixing` blocks. `fixing.txt` holds the firearms, and `vehiclesfixing.txt` holds vehicle parts, with `GlobalItem`, `ConditionModifier` and skill lines. :cite[(`media/scripts/generated/fixing.txt:3-124`, `media/scripts/generated/vehicles/vehiclesfixing.txt:3-83`)] A mod that adds an ordinary item usually needs only the tag: the [new weapon](/pz/build-42/modding/cookbook/new-weapon) recipe's Demo Plank carries the same two tags. Writing a new repair recipe is a craft recipe job, which the crafting recipes cover.

The comment in the menu code gives the reason the `fixing` route stops at broken items: a broken object is meant to be reclaimed or reforged through crafting, not repaired. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:202-205`)]

## Going further

**Pair it with an item, or read about script files.**

- [New weapon](/pz/build-42/modding/cookbook/new-weapon) builds an item that already carries the repair tags.
- [New item](/pz/build-42/modding/cookbook/new-item) covers the item script and its name.
- [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) explains modules, blocks and commas.
- [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists load errors for scripts.

:::callout[How we know]{kind=proof}
The block syntax, the repair math and the menu behavior come from the 42.22 engine code and the vanilla Lua and scripts cited above, and the block follows the vanilla gun blocks.

The mod in this page was built file for file in a test folder and passed the script checker, which does not check `fixing` blocks beyond their syntax.

It has not been run in a game: the percentages in the tooltip, the condition change and the grayed entries are what you check yourself. The old page wrote the lines with a colon and without module-qualified item names. Both forms are wrong for 42.22. The notes about colon lines and about `--` comments follow from reading the loader and were not run.
:::
