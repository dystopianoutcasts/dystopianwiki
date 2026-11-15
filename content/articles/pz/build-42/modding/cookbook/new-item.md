---
id: build-42-new-item
slug: new-item
title: New item
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
  Build a mod that adds one plain item, the Demo Token, with a name, a weight, an icon and a model, and spawn it with the debug Items List.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-food
  - new-weapon
  - translations
  - items-the-item-block-in-b42
  - script-file-anatomy
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoItem`: one item script, one translation file and the two files every mod has, `mod.info` and `poster.png`.
- The item is a plain inventory item (`ItemType = base:normal`) that borrows the icon and the 3D model of the vanilla cork, so it needs no art.
- Its name comes from `ItemName.json`. Without that entry the item shows its full type as the name, and its weight reads as 0.
- You spawn it from the debug Items List and see a cork icon named Demo Token.
:::

:::facts
- **Mod id** `RecipeDemoItem`
- **Item** `RecipeDemoItem.Token`, shown as Demo Token
- **Files** 4 (`mod.info`, `poster.png`, the script, `ItemName.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A new inventory item that you can spawn, see, carry and drop.**

It is the simplest thing a mod can add, so it is the right place to learn the three parts of any item: the script block that defines it, the translation that names it, and the icon and model it shows. Later recipes ([food](/pz/build-42/modding/cookbook/new-food), [weapon](/pz/build-42/modding/cookbook/new-weapon)) change the block and keep the same three parts.

In the game the item appears in your inventory as **Demo Token**, with the vanilla cork icon, in the **Junk** category.

## The files

**The mod files, one script and one translation file, in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders, the same `poster.png`. This recipe leaves the skeleton's `Boot.lua` out, because an item needs no Lua.

```
Zomboid/mods/RecipeDemoItem/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoItem_items.txt
      lua/
        shared/
          Translate/
            EN/
              ItemName.json
```

The game reads every `.txt` file under a mod's `media/scripts/` folder, however deep, and parses it as scripts. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1606-1650`)] The translation file has to sit at `media/lua/shared/Translate/<language>/<name>.json`. :cite[(`zombie/core/Translator.java:365`)]

## Step by step

**Write the four files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Item
id=RecipeDemoItem
description=Adds one plain item, the Demo Token.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoItem_items.txt`

This is the item itself. It is modeled on the vanilla cork, which is also a plain item that uses its own icon and model. :cite[(`media/scripts/generated/items/normal.txt:8551-8558`)]

**File `42/media/scripts/RecipeDemoItem_items.txt`**

```
module RecipeDemoItem
{
    item Token
    {
        DisplayCategory = Junk,
        ItemType = base:normal,
        Weight = 0.1,
        Icon = Cork,
        WorldStaticModel = Cork,
    }
}
```

The module name is your mod's own, and the item is known by its full type, `RecipeDemoItem.Token`. Ids in the recipes carry the mod name so that two recipes installed together never share a name. Every line inside the block ends with a comma, as in the vanilla block.

| Line | What it does | Code |
|------|--------------|------|
| `ItemType = base:normal` | Chooses the kind of item. A normal item is built as a `ComboItem`, with no food, weapon or clothing behavior. | `zombie/scripting/objects/Item.java:1982-1983`, `zombie/scripting/objects/Item.java:1735-1736` |
| `Weight = 0.1` | Sets the weight. A negative number is raised to 0. | `zombie/scripting/objects/Item.java:2057-2062` |
| `Icon = Cork` | Names the inventory icon. The game loads the texture `Item_Cork`, and shows a question mark if it is missing. | `zombie/scripting/objects/Item.java:2000-2006` |
| `WorldStaticModel = Cork` | Names the model shown on the ground. A name with no module is searched in your module first and then in every other module. | `zombie/scripting/ScriptManager.java:1981-2002`, `zombie/scripting/objects/Item.java:3191-3194` |
| `DisplayCategory = Junk` | Sets the category, a plain text name. The Items List writes it through the text key `IGUI_ItemCat_` plus the name. | `zombie/scripting/objects/Item.java:2560-2561`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:426` |

The vanilla cork model is a script of its own, `model Cork`, with a mesh and a texture, so using its name needs no model file in your mod. :cite[(`media/scripts/generated/models_items.txt:1924-1929`)]

The values for `ItemType` come from a fixed list of vanilla types, and the script loader looks the name up in it. :cite[(`zombie/scripting/objects/ItemType.java:14-29`, `zombie/scripting/objects/Item.java:1982-1983`)]

:::chips
- base:alarmclock
- base:alarmclockclothing
- base:animal
- base:clothing
- base:container
- base:drainable
- base:food
- base:key
- base:keyring
- base:literature
- base:map
- base:moveable
- base:normal
- base:radio
- base:weapon
- base:weaponpart
:::

Use one of these. An `ItemType` you register yourself matches none of the branches that build the item, so the next lines call a method on an item that was never created. Keep to the vanilla types. :cite[(`zombie/scripting/objects/Item.java:1493-1496`, `zombie/scripting/objects/Item.java:1826-1836`)]

### Step 3. `42/media/lua/shared/Translate/EN/ItemName.json`

This file gives the item its name. The key is the full type, `Module.Name`, and the value is the text the player sees. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoItem.Token": "Demo Token"
}
```

Vanilla keeps its item names the same way, one `"Base.Name"` key per item. :cite[(`media/lua/shared/Translate/EN/ItemName.json:2-3`)] When the scripts finish loading, the item's name is replaced by the translation for its full type. :cite[(`zombie/scripting/objects/Item.java:3067`)] The `EN` file is the default language, so it is used for every player whose language has no file of its own. :cite[(`zombie/core/Translator.java:348-362`)] The game reads each enabled mod's file for the language. :cite[(`zombie/core/Translator.java:384-410`)]

An item with no translation does not fail to load. It shows its full type as the name, and a weight of 0 is reported for it. :cite[(`zombie/inventory/InventoryItem.java:2763`)] Always write the name before you test.

## Turn it on and see it work

**Copy the folder, check the mod, start the game in debug mode and spawn the item.**

1. Put the `RecipeDemoItem` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoItem/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Item**, choose **ACCEPT**, and start a new game.
3. Click the debug button in the left side bar and choose **Items List**. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:23`)]
4. Type `Demo` in the box above the **Name** column. :cite[(`media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:87`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`)] Select **Demo Token**, then press **Add 1** or double-click the row. :cite[(`media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:96`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:205-207`, `media/lua/shared/Translate/EN/IG_UI.json:1538`)]

You should see **Demo Token** in your inventory with the cork icon. Drop it and it appears on the ground as the small cork model. The item sits under **Junk** in the Items List. The Items List itself warns that its icons may not match the spawned item's icon. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:1537`)]

On a dedicated server, put `Mods=RecipeDemoItem` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. The scripts then load on the server, and players need the mod too. These server steps have not been run in a game.

## If it does not work

**An item fails in a few predictable ways, and each one leaves a clue.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The item is named `RecipeDemoItem.Token`, and its weight shows 0 | `ItemName.json` is missing, in the wrong folder, or has a different key. The key must be the full type. | `zombie/scripting/objects/Item.java:3067`, `zombie/inventory/InventoryItem.java:2763` |
| `JSON Error in:` and the path of your file in the log | The JSON is not valid, for example a comma after the last entry. Fix the file. | `zombie/core/Translator.java:379` |
| A question mark where the icon should be | The `Icon` value does not match a texture called `Item_<Icon>`. Check the spelling. | `zombie/scripting/objects/Item.java:2000-2006` |
| `adding unknown item param "Wieght" = "0.1"` in the log | A line you misspelled is not an error: the game keeps it as mod data on the item and ignores it. Look for these lines after each edit. | `zombie/scripting/objects/Item.java:2998-3019` |
| `Error: Weight is not a valid parameter in item: Token` | The value cannot be read, for example text where a number belongs. The load stops with that error. | `zombie/scripting/objects/Item.java:3022-3023` |
| The item has no model on the ground, or a model name starting with `???.` | The model name was not found in any module. Use the name of a real `model` script. | `zombie/scripting/ScriptManager.java:1981-2002` |
| The item is not in the Items List | The script file is not a `.txt` file under `media/scripts/`, or the mod is not checked for this game. | `zombie/scripting/ScriptManager.java:1398-1402` |

Script files are parsed when the game loads, so restart the game after every change to the `.txt` file. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Change the block, or learn what the other fields do.**

- [New food](/pz/build-42/modding/cookbook/new-food) changes `ItemType` to `base:food` and adds hunger, freshness and cooking.
- [New weapon](/pz/build-42/modding/cookbook/new-weapon) does the same for a melee weapon.
- [The item block in Build 42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) lists the fields of the item block.
- [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) explains modules, blocks and commas.
- [Tags](/pz/build-42/modding/items-and-scripting/tags) covers the `Tags` line this recipe leaves out.

:::callout[How we know]{kind=proof}
Every line of the script and the translation file is modeled on a vanilla block, and the loader behavior comes from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker. It has not been run in a game: what you see in the Items List and in your inventory is what you check yourself.
:::
