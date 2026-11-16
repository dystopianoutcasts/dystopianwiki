---
id: build-42-script-file-anatomy
slug: script-file-anatomy
title: Script file anatomy
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - scripts
  - modules
  - syntax
excerpt: >-
  How a Build 42.22 script file is read: which folders and files the game loads, the module and block layout, the comma rule, comments, imports, and the trap of a missing comma on the last line.
last_updated: '2026-11-16'
related_articles:
  - items-the-item-block-in-b42
  - item-block-merge-behaviour
  - tags
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - new-item
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders writing their first script file, and anyone whose script "does nothing". To build a working item from scratch, follow [New item](/pz/build-42/modding/cookbook/new-item).

:::callout[The 1-minute version]{kind=key}
- The game reads every `.txt` file under `media/scripts/`, at any depth. For a mod it reads both `common/media/scripts/` and `<version>/media/scripts/`. File names are yours to choose, but a mod file with the same relative path as a vanilla file replaces it, so give your files unique names.
- A file holds `module Name { ... }` blocks, and a module holds blocks such as `item Foo { ... }`. Text outside a `module` block is ignored.
- Each `Key = value` line ends with a comma. The last line before a closing brace is dropped if it has no comma, and no error says so.
- Use only `/* ... */` comments. A `//` line is not removed: before a key it silently loses that key, before a block it skips the block, and above a `module` it ignores the whole module.
- A block word the module does not know, such as `itme`, is skipped with a warning that is off on a client outside `-debug`.
:::

:::facts
- **Script files in vanilla** 1,004 `.txt` files under `media/scripts/`
- **Block words the engine knows** 36 distinct words, from 38 script types
- **Folders a mod may use** 2: `common/media/scripts/` and `<version>/media/scripts/`
- **Vanilla item files** 15 in `generated/items/`
:::

## 1. Which files the game reads

**The game reads every `.txt` file under `media/scripts/`, in vanilla and in each enabled mod, and the folder layout is only for your own order.**

The search walks the folder tree and keeps every file whose name ends in `.txt`. :cite[(`zombie/scripting/ScriptManager.java:1387-1399`)] It skips any folder whose path contains `tempNotWorking`. :cite[(`zombie/scripting/ScriptManager.java:1389-1391`)] For each enabled mod it searches the mod's `common` folder and its version folder, each under `media/scripts`. :cite[(`zombie/scripting/ScriptManager.java:1618-1650`)] 

A file name has no meaning of its own, but the relative path does. Two files with the same relative path are one file to the game: the later one replaces the earlier, and the other is never read. That includes a vanilla path, so a mod file at `media/scripts/generated/items/weapon.txt` removes every weapon vanilla defines there. Name your files after your mod. :cite[(`zombie/ZomboidFileSystem.java:672-677`)] [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts) explains how the path also decides which of two mods is parsed last.

Vanilla keeps its scripts under `media/scripts/generated/`, in folders by subject. Counting `.txt` files gives these numbers.

::::cards
:::card[generated/items]{accent=blue}
15 files, one per item type. Every item block is here.
:::
:::card[generated/recipes]{accent=orange}
43 files of crafting recipes.
:::
:::card[generated/entities]{accent=purple}
226 files, in folders by subject. Workstation blocks sit in `workstations/` folders, and some subjects add a `craftRecipes/` folder.
:::
:::card[generated/vehicles and sounds]{accent=cream}
292 vehicle files and 150 sound files.
:::
::::

The folder `media/scripts/entities/` is separate. It has 183 files, and the one checked for this page holds an `xuiSkin` block for a workstation window. :cite[(`media/scripts/entities/blacksmith/workstations/entity_charcoal_burner_xuiSkin.txt:3-5`)] A workstation itself is an `entity` block in `generated/entities/`. :cite[(`media/scripts/generated/entities/blacksmith/workstations/entity_forge_i.txt:3`)] No item blocks are kept beside the entities: counting the `ItemType =` lines in `media/scripts` gives 5,105, the same as the item blocks in `generated/items/`.

## 2. Modules and blocks

**A file is a list of `module` blocks, each holding blocks such as `item` or `craftRecipe`.**

```
module Base
{
    item Foo { ... }
    craftRecipe Bar { ... }
    entity Baz { ... }
    fluid Qux { ... }
}
```

The engine splits the file into top-level blocks and acts only on those that start with `module`. :cite[(`zombie/scripting/ScriptManager.java:1358-1362`)] The module name is the word after `module`, and a module that already exists is reused, which is why two mods that both write `module Fishing` share it. :cite[(`zombie/scripting/ScriptManager.java:1358-1380`)] Inside the module, the opening word of each block picks its type, and the next word is its name. :cite[(`zombie/scripting/objects/ScriptModule.java:978-994`, `zombie/scripting/ScriptBucket.java:98-103`)]

The engine knows 38 script types that use 36 distinct block words, among them `item`, `craftRecipe`, `entity`, `fluid`, `recipe`, `evolvedrecipe`, `fixing`, `model`, `sound`, `vehicle` and `timedAction`. :cite[(`zombie/scripting/ScriptType.java:19-56`)] A block word that no type uses is skipped, with a warning in the script log channel. :cite[(`zombie/scripting/objects/ScriptModule.java:1018-1026`)] That channel is off on a client outside `-debug`, so a typo in a block word fails silently there. A dedicated server defaults to Warning level, and `-debug` enables them. :cite[(`zombie/debug/DebugType.java:95`, `zombie/debug/DebugLog.java:93-98`)]

A nested block can sit inside another: `itemMapper` inside a `craftRecipe`, next to its `inputs` and `outputs`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:515-519`, `media/scripts/generated/entities/agricultural/craftRecipes/recipes_fiber.txt:15-26`)]

## 3. Lines, commas and comments

**Every line ends with a comma, and the comma is what the parser splits on, so a missing comma changes what the engine reads.**

Two kinds of line share the syntax.

- **Key lines.** Item blocks and the top level of craft recipes use `Key = value,`. The parser cuts the block at each comma. :cite[(`zombie/scripting/ScriptParser.java:40-45`)] The item loader splits the piece at `=` into a key and a value. :cite[(`zombie/scripting/objects/Item.java:1431-1435`)]
- **Other lines.** Inside `inputs` and `outputs` the lines are ingredient statements like `item 1 tags[...]`, and inside `itemMapper` they are `Source = Target,` pairs. :cite[(`media/scripts/generated/entities/agricultural/craftRecipes/recipes_fiber.txt:19-24`)]

The comma rule has two traps. Text after the last comma, before the closing brace, is never turned into a line, so a block whose last key has no comma loses that key without any message. :cite[(`zombie/scripting/ScriptParser.java:30-46`)] A comma missing between two lines glues them into one: `Weight = 1.5` and `Icon = X` become one value, and `Weight` then cannot be read as a number. :cite[(`zombie/scripting/objects/Item.java:2057-2058`)] That is a load error, and the engine then removes the whole item. :cite[(`zombie/scripting/ScriptBucket.java:198-203`)]

Comments are `/* ... */` only, and the loader strips them before parsing, including nested ones. :cite[(`zombie/scripting/ScriptParser.java:59-90`, `zombie/scripting/ScriptManager.java:1335`)] No other comment form is removed, and no vanilla script file has a line that starts with `//`. A `//` line is not skipped; it joins the text around it:

- Before a key, it merges into that key's text, so the key becomes `// note Weight`, is not recognized and is dropped. :cite[(`zombie/scripting/ScriptParser.java:40-45`, `zombie/scripting/objects/Item.java:1431-1435`)]
- Before `item X {`, it becomes the block's type, so the block is skipped. :cite[(`zombie/scripting/objects/ScriptModule.java:978-994`)]
- Above `module`, the top-level block no longer starts with `module`, so the whole module is ignored. :cite[(`zombie/scripting/ScriptManager.java:1358-1362`)]

Use `/* ... */` only.

## 4. Module names and imports

**An item's full name is its module plus its block name, and `imports` only lets a script use short names from another module.**

`module Base { item Foo }` defines `Base.Foo`, and the same block in `module MyMod` defines `MyMod.Foo`, which is a different item. The item loader builds the full name from the module name and the block name. :cite[(`zombie/scripting/objects/Item.java:1421-1422`)] To change a vanilla item, write `module Base`.

An `imports` block lists module names separated by commas. The module reads them into its import list, and a module that imports itself is logged as an error. :cite[(`zombie/scripting/objects/ScriptModule.java:1000-1011`)] What imports do is explained on [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts). Vanilla recipes write item ids with the module in front, such as `Base.Stake`. :cite[(`media/scripts/generated/recipes/recipes_carving.txt:14`, `media/scripts/generated/recipes/recipes_carving.txt:18`)]

## 5. Try it: the missing comma

**Take the lighter-plank mod and remove one comma, and the weight change disappears without any message.**

1. Build the mod from the [lighter plank steps](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour#2-try-it-a-lighter-plank), and confirm the plank's weight reads 1.5.
2. Open `Zomboid/mods/LightPlank/42/media/scripts/LightPlank_items.txt` and delete the comma after `Weight = 1.5`, so the line reads `Weight = 1.5`.
3. Restart the game, load a game with the mod, and add a plank from the Items List. Its weight should read the vanilla 3.0, and `console.txt` should show no error for it. :cite[(`media/scripts/generated/items/weapon.txt:9255-9259`)]
4. Put the comma back and restart.

This has not been run in a game; it is what the parser code predicts.

:::callout[How we know]{kind=proof}
Read from the 42.22 engine source, with the file counts recounted from `media/scripts`. The missing-comma try-it follows from the parser code and was not run. Not verified: the `//` results were read from the parser code, not run in a game, and what the `entityComponent` script type is used for.
:::
