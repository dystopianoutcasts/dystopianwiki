---
id: build-42-items-the-item-block-in-b42
slug: items-the-item-block-in-b42
title: 'Items: the item block in B42'
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - items
  - itemtype
  - tags
excerpt: >-
  What a Build 42.22 item block looks like, why it says ItemType = base:normal instead of Type = Normal, the 16 item types, and which keys the item loader reads.
last_updated: '2026-11-16'
related_articles:
  - script-file-anatomy
  - tags
  - item-tags-from-lua
  - item-block-merge-behaviour
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - new-item
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders writing or reading an item script, and anyone porting a Build 41 item. To make an item from nothing and see it in game, follow [New item](/pz/build-42/modding/cookbook/new-item).

:::callout[The 1-minute version]{kind=key}
- Write `ItemType = base:normal`, or another of the 16 vanilla types listed below. A Build 41 line `Type = Normal` is not read in 42.22.
- An item with no usable `ItemType` loads without an error. The failure comes later, when the game tries to create one.
- A key the item loader does not know is kept as mod data, with a warning only if a log channel that is off by default is on. A misspelled key therefore does nothing and says nothing.
- `Tags` is the key recipes match on: a recipe input that names a tag accepts every item that carries it.
- The Build 41 line `Recipes =` and the spelling `TeachedRecipes` are not read in 42.22; the key that teaches recipes is `LearnedRecipes`.
:::

:::facts
- **Item blocks in vanilla** 5,105, under 5,092 distinct names
- **Vanilla item files** 15, one per `ItemType` except `base:keyring`, which no item uses
- **Item types the engine registers** 16
- **Lines `Type = Normal` in vanilla scripts** 0
:::

## 1. What an item block looks like

**An item is a block of `Key = value,` lines, and vanilla keeps every item in `media/scripts/generated/items/`.**

This is a real vanilla item, a pair of crude wooden tongs. :cite[(`media/scripts/generated/items/normal.txt:891-905`)]

```
item CrudeWoodenTongs
{
    DisplayCategory = Tool,
    ItemType = base:normal,
    Weight = 1.0,
    Icon = TwigTongs,
    StaticModel = Tongs_Twine,
    WorldStaticModel = Tongs_Twine,
    Tags = base:crudetongs;base:breakonsmithing;base:crude;base:isfirefuel;base:isfiretinder,
    BreakSound = PlankBreak,
    ConditionMax = 1,
    ConditionLowerChanceOneIn = 1,
    Tooltip = Tooltip_item_BreakOnSmithing,
    Researchablerecipes = Forge_Tongs;Forge_Heading_Tool,
}
```

The loader reads the block one `Key = value,` line at a time and hands each pair to one method. :cite[(`zombie/scripting/objects/Item.java:1427-1436`)] Key names are compared without regard to case, which is why `Researchablerecipes` above works. :cite[(`zombie/scripting/objects/Item.java:2788`)]

A plain material is shorter: iron ore has a weight, an icon, two models, tags and one flag. :cite[(`media/scripts/generated/items/normal.txt:919-928`)]

```
item IronOre
{
    DisplayCategory = Material,
    ItemType = base:normal,
    Weight = 40.0,
    Icon = IronOre,
    StaticModel = IronOre,
    WorldStaticModel = IronOre,
    Tags = base:hasmetal;base:heavyitem;base:ironore;base:ironsource,
    RequiresEquippedBothHands = true,
}
```

## 2. ItemType: Build 42 reads `ItemType`, not `Type`

**The kind of item comes from `ItemType`, whose value must be one of 16 ids the engine registers; a Build 41 `Type = Normal` line gives the item no kind.**

The item loader has a branch for the key `ItemType` and looks the value up in the item-type registry. :cite[(`zombie/scripting/objects/Item.java:1982-1983`)] The engine registers these 16 ids in the `base` namespace. :cite[(`zombie/scripting/objects/ItemType.java:14-29`)]

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

Vanilla spreads its 5,105 item blocks over 15 files, one per type, and each file name matches its type. Counting the `ItemType =` lines in `media/scripts` gives the table below. No vanilla item uses `base:keyring`, so that type has no file.

| `ItemType` | Item blocks |
|---|---|
| `base:clothing` | 1,395 |
| `base:normal` | 1,099 |
| `base:food` | 722 |
| `base:literature` | 561 |
| `base:weapon` | 409 |
| `base:moveable` | 393 |
| `base:container` | 308 |
| `base:drainable` | 150 |
| `base:radio` | 17 |
| `base:alarmclockclothing` | 16 |
| `base:map` | 15 |
| `base:weaponpart` | 11 |
| `base:key` | 6 |
| `base:alarmclock` | 2 |
| `base:animal` | 1 |

The line `Type = Normal` is not a key the loader knows, and it is not an error. The loader keeps an unknown key as mod data on the item. The warning starts `adding unknown item param "Type" = "Normal"`, and it appears only when the detailed-info log channel is enabled. :cite[(`zombie/scripting/objects/Item.java:2998-3015`)] 

That channel starts off, and the game turns it on only in debug mode, so do not expect to see the warning otherwise. :cite[(`zombie/debug/DebugType.java:95`, `zombie/debug/DebugLog.java:83-91`)]

The trouble comes later, when the game builds the item. The builder checks the item type against one branch per vanilla type, and no branch matches an item with no type or with a type you registered yourself. :cite[(`zombie/scripting/objects/Item.java:1494`, `zombie/scripting/objects/Item.java:1735-1736`)] The variable that should hold the new item stays empty, and the next lines call methods on it. :cite[(`zombie/scripting/objects/Item.java:1831-1835`)]

So an item written with `Type = Normal` is found when you look it up by name, and then cannot be created. In a 42.20 test, nineteen items written this way were found by `getScriptManager():getItem()`, and `InventoryItemFactory.CreateItem` returned nil for each. The 42.22 code reads the same way, and the test was not run again. A custom `ItemType` fails at the same place; [the registries page](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file) lists which identifiers a mod may register.

## 3. The keys that matter in Build 42

**The item loader reads each of these keys by name, and the table says what each one is for.**

Where the table says "not verified", the loader reads the key, but this page did not check what the game does with the value.

| Key | What it is for | Code |
|---|---|---|
| `ItemType` | Chooses the kind of item, such as `base:normal` or `base:food`. | `zombie/scripting/objects/Item.java:1982-1983` |
| `DisplayCategory` | A plain text name that groups the item in lists, such as `Tool` or `Material`. | `zombie/scripting/objects/Item.java:2560-2561` |
| `Tags` | A `;`-separated list of tag ids. Recipes match on tags; see section 4. | `zombie/scripting/objects/Item.java:2353-2359` |
| `Icon` | The inventory icon. The game looks for the texture `Item_` plus this name. | `zombie/scripting/objects/Item.java:2000-2006` |
| `StaticModel`, `WorldStaticModel` | Two separate model names. Which one the game uses where is not verified. | `zombie/scripting/objects/Item.java:2866-2871` |
| `WorldObjectSprite` | A sprite name. The loader still reads it, and 421 lines in vanilla scripts still set it. | `zombie/scripting/objects/Item.java:2712-2713` |
| `LearnedRecipes` | A `;`-separated list of recipe ids the item teaches. 199 lines in vanilla scripts use it. | `zombie/scripting/objects/Item.java:2777-2784` |
| `ResearchableRecipes` | A `;`-separated list of recipe ids tied to researching the item. 955 lines in vanilla scripts use it. | `zombie/scripting/objects/Item.java:2788-2795` |
| `SkillTrained`, `LvlSkillTrained`, `NumLevelsTrained`, `NumberOfPages` | The fields of a skill book. | `zombie/scripting/objects/Item.java:2497-2504` |
| `ConditionMax`, `ConditionLowerChanceOneIn` | Durability numbers. What `ConditionMax = 1` does in play is not verified. | `zombie/scripting/objects/Item.java:2290-2299` |
| `RequiresEquippedBothHands` | A flag that the equipped-item panel checks together with the two-hand weapon flag. | `zombie/scripting/objects/Item.java:2570-2571`, `media/lua/client/ISUI/ISEquippedItem.lua:319` |
| `Wet`, `WetCooldown`, `ItemWhenDry` | Wet and dry state keys. Their effect is not verified. | `zombie/scripting/objects/Item.java:2578-2583` |
| `EatType`, `PourType`, `IconFluidMask` | Variant keys for food and fluids. Their effect is not verified. | `zombie/scripting/objects/Item.java:2886-2889`, `zombie/scripting/objects/Item.java:2938` |
| `component FluidContainer { ... }` | A nested block, not a key line. The item loader passes every `component` block on to a component loader. | `zombie/scripting/objects/Item.java:1443-1445` |

Of the 15 vanilla item files, `normal.txt` holds 125 `component FluidContainer` blocks, `clothing.txt` four, and `container.txt` and `weapon.txt` two each; the other files hold none. For a worked fluid, see [New fluid](/pz/build-42/modding/cookbook/new-fluid).

## 4. Tags are how items join recipes

**A recipe input that names a tag accepts any item that carries it, so an item gets into vanilla recipes by carrying the right tag.**

When the scripts finish loading, the engine builds a map from each tag to the items that carry it. :cite[(`zombie/inventory/ItemTags.java:22-30`, `zombie/scripting/ScriptManager.java:162`)] A recipe input line such as `item 1 tags[base:hammer]` then adds every item in that tag's list to the input. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:891-900`)] [Tags](/pz/build-42/modding/items-and-scripting/tags) covers the ids, and [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua) covers asking an item for its tags in code.

A tag id with no colon is read in the `base` namespace. :cite[(`zombie/scripting/objects/ResourceLocation.java:33-36`)]

## 5. What changed from Build 41

**The `Recipes =` line on an item and the spelling `TeachedRecipes` from Build 41 do nothing in 42.22.**

The 42.22 item loader has no branch for `Recipes` or `TeachedRecipes`. Both would be kept as unknown keys, and no vanilla script uses either. The key that teaches recipes is `LearnedRecipes`. :cite[(`zombie/scripting/objects/Item.java:2777-2784`)] Craft recipes, not items, carry the keys `AutoLearnAll` and `AutoLearnAny`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:416`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:431`)]

## 6. Try it

**Build the smallest item mod and spawn the item, then break the `ItemType` line and see what happens.**

1. Follow [New item](/pz/build-42/modding/cookbook/new-item). It gives the folder, `mod.info`, the script file, the translation file, how to load the mod and how to spawn the item from the debug Items List.
2. Once you can spawn **Demo Token**, change `ItemType = base:normal,` to `Type = Normal,` in `RecipeDemoItem_items.txt` and restart the game.
3. Open the Items List again and check whether the item still appears and whether adding it to your inventory works. This check has not been run on 42.22; the 42.20 result was that creation failed.
4. Put the line back and restart.

:::callout[How we know]{kind=proof}
The code claims come from the 42.22 engine source and scripts, and the counts (5,105 blocks, 5,092 distinct names, the per-type numbers, 15 files) were recounted from `media/scripts`. The nineteen-item test with `Type = Normal` is a 42.20 game test and was not repeated on 42.22. Not verified: what the keys marked "not verified" do in play, how `StaticModel` and `WorldStaticModel` are chosen between, and whether the failure to create an item with no type shows to Lua as nil or as an error.
:::
