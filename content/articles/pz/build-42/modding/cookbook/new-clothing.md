---
id: build-42-new-clothing
slug: new-clothing
title: New clothing
game: pz
version: build-42
section: modding
category: cookbook
difficulty: intermediate
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod with two custom body locations: a second cap and a side bag that you can wear next to a vanilla hat and a vanilla backpack.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - item-repair
  - media-registries-lua-the-new-b42-identifier-file
  - registries-lua-the-new-b42-13-identifier-system
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoClothing`: two new body locations, one wearable cap in the first and one wearable bag in the second.
- A body location is registered in `media/registries.lua`, declared in a shared Lua file, and then named by an item script.
- A clothing item names its location with `BodyLocation`. A bag names its location with `CanBeEquipped` instead, and the vanilla bag block has no `BodyLocation` line.
- Both items borrow a vanilla clothing definition (`ClothingItem`), so the mod needs no model. A garment with its own model needs files this page does not build.
:::

:::facts
- **Mod id** `RecipeDemoClothing`
- **Items** `RecipeDemoClothing.SecondCap`, `RecipeDemoClothing.SideBag`
- **Body locations** `recipedemoclothing:extrahat`, `recipedemoclothing:sidebag`
- **Files** 6 (`mod.info`, `poster.png`, `registries.lua`, one Lua file, the script, `ItemName.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) and [new item](/pz/build-42/modding/cookbook/new-item)
:::

## What you will build

**Wearable items that each use a body location of their own.**

A body location is a slot on the character: wearing a second item in the same slot takes the first one off. Because your two items use their own slots, you can wear the Demo Second Cap on top of a vanilla hat, and the Demo Side Bag at the same time as a vanilla backpack.

In the game both items appear in the Items List, and the right-click menu offers **Wear** for each.

## The files

**The usual mod files, a registry file, one Lua file and the item script.**

```
Zomboid/mods/RecipeDemoClothing/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      registries.lua
      scripts/
        RecipeDemoClothing_items.txt
      lua/
        shared/
          RecipeDemoClothing/
            BodyLocations.lua
          Translate/
            EN/
              ItemName.json
```

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) for the folders and the poster. The game runs `registries.lua` from `media/` in the version folder, and falls back to the same path in `common`. :cite[(`zombie/scripting/objects/ModRegistries.java:16-28`)] It runs it before the scripts are read. :cite[(`zombie/GameWindow.java:208-210`)]

## Step by step

**Write the files in the order the game reads them: registry, Lua, script, name.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton and write `mod.info` with the new id.

**File `42/mod.info`**

```
name=Recipe Demo Clothing
id=RecipeDemoClothing
description=Adds a second cap slot and a side bag slot.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/registries.lua`

This file creates the two body locations. `ItemBodyLocation.register` takes an id with your own namespace. The loader refuses an id in the `base` namespace, and the id is stored in lower case. :cite[(`zombie/scripting/objects/ItemBodyLocation.java:147-149`, `zombie/scripting/objects/RegistryReset.java:22-29`, `zombie/scripting/objects/ResourceLocation.java:15-37`)]

**File `42/media/registries.lua`**

```lua
ItemBodyLocation.register("recipedemoclothing:extrahat")
ItemBodyLocation.register("recipedemoclothing:sidebag")
```

Each id can be registered once. A second registration of the same id stops with `Tried to register duplicate object`. :cite[(`zombie/scripting/objects/Registry.java:39-47`)]

### Step 3. `42/media/lua/shared/RecipeDemoClothing/BodyLocations.lua`

This file adds the two locations to the character's list of body locations and says which vanilla slot the new cap cannot share. It is modeled on the vanilla file, which starts from the `Human` group and creates each location in render order. :cite[(`media/lua/shared/NPCs/BodyLocations.lua:1-8`)]

**File `42/media/lua/shared/RecipeDemoClothing/BodyLocations.lua`**

```lua
local group = BodyLocations.getGroup("Human")

local extraHat = ItemBodyLocation.get(ResourceLocation.of("recipedemoclothing:extrahat"))
local sideBag = ItemBodyLocation.get(ResourceLocation.of("recipedemoclothing:sidebag"))

group:getOrCreateLocation(extraHat)
group:getOrCreateLocation(sideBag)

group:setExclusive(extraHat, ItemBodyLocation.FULL_HAT)

print("[RecipeDemoClothing] body locations declared: " .. tostring(extraHat) .. ", " .. tostring(sideBag))
```

Each line does one job.

- `getOrCreateLocation` adds a location to the group, after the ones already there, and returns the one that exists if it was added before. :cite[(`zombie/characters/WornItems/BodyLocationGroup.java:46-54`)] A new location sits last in the order, so an item in it is drawn after the vanilla ones. :cite[(`zombie/characters/WornItems/WornItems.java:77-88`)]
- `setExclusive` makes two locations unable to be worn together. The vanilla file does the same for a full hat and a normal hat, and the call needs both locations to exist in the group already, because it looks them up first. :cite[(`media/lua/shared/NPCs/BodyLocations.lua:128-130`, `zombie/characters/WornItems/BodyLocationGroup.java:75-80`)]
- Wearing an item takes off the item in the same location, unless that location is marked multi-item, and every item in an exclusive location. The new locations here are not multi-item. :cite[(`zombie/characters/WornItems/WornItems.java:61-74`)]
- `tostring` of a location gives its id, so the last line writes both ids to `console.txt`. :cite[(`zombie/scripting/objects/ItemBodyLocation.java:138-141`, `zombie/scripting/objects/ResourceLocation.java:51-53`)]

The game loads every vanilla Lua file first and then each mod's, so the vanilla locations exist when this file runs. :cite[(`zombie/Lua/LuaManager.java:1200-1202`)]

The group has no `setHidden` call in 42.22. The calls that exist for hiding are `setHideModel` and `setAltModel`, which take two locations. :cite[(`zombie/characters/WornItems/BodyLocationGroup.java:87-100`)]

### Step 4. `42/media/scripts/RecipeDemoClothing_items.txt`

These are the two items. The cap is modeled on the vanilla baseball cap and the bag on the vanilla school bag. :cite[(`media/scripts/generated/items/clothing.txt:1926-1941`, `media/scripts/generated/items/container.txt:49-73`)] The recipe changed these things from the vanilla blocks: `IconsForTexture` became a single `Icon`, the `ClothingItemExtra` lines, the `ReplaceInPrimaryHand` and `ReplaceInSecondHand` lines and `AttachmentReplacement` were dropped, and `Weight` and `Capacity` have other values.

**File `42/media/scripts/RecipeDemoClothing_items.txt`**

```
module RecipeDemoClothing
{
    item SecondCap
    {
        DisplayCategory = Accessory,
        ItemType = base:clothing,
        Weight = 0.5,
        Icon = BaseballCapRed,
        BodyLocation = recipedemoclothing:extrahat,
        CanHaveHoles = false,
        ChanceToFall = 60,
        ClothingItem = Hat_BaseballCap,
        Insulation = 0.1,
    }

    item SideBag
    {
        DisplayCategory = Bag,
        ItemType = base:container,
        Weight = 0.5,
        Icon = Backpack_Black,
        BloodLocation = Bag,
        CanBeEquipped = recipedemoclothing:sidebag,
        CanHaveHoles = false,
        Capacity = 8,
        CloseSound = CloseBag,
        ClothingItem = Bag_SchoolBag,
        EquipSound = EquipBackpackSmall,
        OpenSound = OpenBag,
        PutInSound = PutItemInBag,
        RunSpeedModifier = 0.99,
        WeightReduction = 50,
        WorldStaticModel = SchoolBag_Ground,
    }
}
```

The items are `RecipeDemoClothing.SecondCap` and `RecipeDemoClothing.SideBag`. The lines that matter for clothing are these.

| Line | What it does | Code |
|------|--------------|------|
| `ItemType = base:clothing` | Builds the cap as a clothing item. | `zombie/scripting/objects/Item.java:1737-1750` |
| `BodyLocation = recipedemoclothing:extrahat` | Names the slot by its registry id. An id nobody registered is read as nothing, with no error. | `zombie/scripting/objects/Item.java:1958-1960`, `zombie/scripting/objects/Registry.java:50-52` |
| `ItemType = base:container`, `Capacity`, `WeightReduction` | Make the bag a container with room for 8 and a weight reduction for what it holds. | `zombie/scripting/objects/Item.java:1523-1529`, `media/scripts/generated/items/container.txt:59`, `media/scripts/generated/items/container.txt:69` |
| `CanBeEquipped = recipedemoclothing:sidebag` | Makes the container wearable, and names its slot. The vanilla school bag has this line and no `BodyLocation` line. | `zombie/scripting/objects/Item.java:2542-2543`, `media/scripts/generated/items/container.txt:57` |
| `ClothingItem = Hat_BaseballCap` | Names the clothing definition that supplies the model and texture. It is the name of a file in the game's `media/clothing/clothingItems/` folder. | `zombie/scripting/objects/Item.java:2815-2816`, `zombie/core/skinnedmodel/population/OutfitManager.java:435-440` |
| `RunSpeedModifier = 0.99` | Slows the wearer a little. | `media/scripts/generated/items/container.txt:67` |

The vanilla file that lists locations says in its first comment that the location ids must match the `BodyLocation=` and `CanBeEquipped=` values in the item scripts. :cite[(`media/lua/shared/NPCs/BodyLocations.lua:1-2`)]

A clothing definition name is turned into a file path and looked up in the game's table of file ids. When there is no match the item is left without a definition and the game raises no error. :cite[(`zombie/core/skinnedmodel/population/OutfitManager.java:435-440`, `zombie/ZomboidFileSystem.java:1123-1126`)] This recipe uses two names that vanilla items use, so they resolve. :cite[(`media/scripts/generated/items/clothing.txt:1936`, `media/scripts/generated/items/container.txt:61`)]

### Step 5. `42/media/lua/shared/Translate/EN/ItemName.json`

The names work as in [new item](/pz/build-42/modding/cookbook/new-item): one key per full type. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoClothing.SecondCap": "Demo Second Cap",
    "RecipeDemoClothing.SideBag": "Demo Side Bag"
}
```

## Turn it on and see it work

**Spawn both items next to a vanilla hat and a vanilla bag and wear them together.**

1. Put the `RecipeDemoClothing` folder in `Zomboid/mods/`, start the game with `-debug`, check **Recipe Demo Clothing** on the **MODS** screen, choose **ACCEPT** and start a new game, as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Look in `Zomboid/console.txt` for `[RecipeDemoClothing] body locations declared: recipedemoclothing:extrahat, recipedemoclothing:sidebag`.
3. Open the debug menu, choose **Items List**, type `Demo` in the **Name** filter, and add **Demo Second Cap** and **Demo Side Bag**. Add a vanilla **Baseball Cap** and a **School Bag** as well. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`)]
4. Right-click each item and choose **Wear**. The menu offers it for clothing and for a container that can be equipped. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:267-269`, `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:399-400`, `media/lua/shared/Translate/EN/ContextMenu.json:82`)]

You should be able to wear the vanilla cap and the Demo Second Cap together, and the school bag and the Demo Side Bag together. If you wear a second Demo Second Cap, the first comes off, because they share a location. The look of the items is the vanilla cap and the vanilla school bag, which is the point of borrowing their definitions.

On a dedicated server, add `Mods=RecipeDemoClothing` to the settings file and copy the mod into the server's `mods` folder, as described in the skeleton page. Every player needs the mod too, because the body locations have to exist on both sides. These server steps have not been run in a game.

## If it does not work

**Most clothing failures are a name that does not match, and several leave no error.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `Tried to register duplicate object` in the log | The same id is registered twice, in this mod or in another. Register each id once. | `zombie/scripting/objects/Registry.java:39-47` |
| `Default namespace 'base:...' is not allowed!` | A registered id has no namespace or uses `base`. Give it your own, as in `recipedemoclothing:extrahat`. | `zombie/scripting/objects/RegistryReset.java:22-28` |
| The item cannot be worn, or is worn in the wrong slot | `BodyLocation` or `CanBeEquipped` names an id nobody registered, so it reads as nothing. Match the string in `registries.lua` exactly. | `zombie/scripting/objects/Registry.java:50-52`, `zombie/scripting/objects/Item.java:1958-1960` |
| The bag has no **Wear** option | `CanBeEquipped` is missing, so the container is not equippable. | `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:267-269` |
| The item is worn but invisible, with no error | `ClothingItem` does not match a clothing definition, so the item has none. | `zombie/core/skinnedmodel/population/OutfitManager.java:435-440` |
| An error that names `BodyLocations.lua` in the log | `setExclusive` was called with a location that is not in the group yet, or `registries.lua` did not run. Create the locations before you link them. | `zombie/characters/WornItems/BodyLocationGroup.java:75-80`, `zombie/scripting/objects/ModRegistries.java:16-28` |
| No `[RecipeDemoClothing]` line in `console.txt` | `BodyLocations.lua` is not under `media/lua/shared/`, or the mod is not checked for this game. | `zombie/Lua/LuaManager.java:1255-1256` |

## What this recipe does not build

**A garment with its own model needs a model, a texture and a clothing definition file, and none of that is built here.**

The game finds a clothing definition by the file `media/clothing/clothingItems/<name>.xml`. A mod can add its own table of file ids as `media/fileGuidTable.xml` in its version or common folder, and the game merges it with the others. :cite[(`zombie/core/skinnedmodel/population/OutfitManager.java:435-440`, `zombie/ZomboidFileSystem.java:1077-1096`)] Making the model and the definition is done in an art tool, and the cookbook has no page for it yet. Until you have them, borrow a vanilla definition as this recipe does.

The old note that clothing must be marked `static = false` is not repeated here. The vanilla cap definition is a static model, and the clothing definition files are not part of the capture, so that rule could not be checked.

## Going further

**Registries, items and repair.**

- [New item](/pz/build-42/modding/cookbook/new-item) covers the item script and the name file.
- [The registries file](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file) explains `media/registries.lua`.
- [Registries in 42.13 and later](/pz/build-42/modding/lua-api/registries-lua-the-new-b42-13-identifier-system) lists what can be registered.
- [Item repair](/pz/build-42/modding/cookbook/item-repair) shows how to make a damaged item fixable.

:::callout[How we know]{kind=proof}
The registration, the group calls, the wear rules and the item parsing come from the 42.22 engine code and the vanilla Lua and scripts cited above.

The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker. It has not been run in a game: that both items can be worn together with their vanilla twins, and what they look like, are what you check yourself. The clothing definition files are not part of the capture, so what a definition holds is not described. The clothing facts from the old corrections page were each re-read: the `setHidden` call it mentions does not exist in 42.22, and the claim that a bag carries both `BodyLocation` and `CanBeEquipped` does not match the vanilla bag block.
:::
