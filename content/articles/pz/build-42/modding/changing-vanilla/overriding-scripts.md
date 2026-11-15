---
id: build-42-overriding-scripts
slug: overriding-scripts
title: 'Overriding scripts: what happens when you redefine a vanilla item or recipe'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: intermediate
tags:
  - scripts
  - items
  - recipes
  - modules
  - merge
  - load-order
excerpt: >-
  What happens when your script defines an item or recipe that vanilla already defines: which types merge, which replace, which file wins, and the one typo that deletes a vanilla item.
last_updated: '2026-11-14'
related_articles:
  - changing-vanilla-start-here
  - patching-vanilla-lua
  - editing-items-at-load
  - changing-loot
  - changing-recipes-and-crafting
  - what-needs-java-and-what-is-impossible
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders redefining an item](#merge-or-replace-it-depends-on-the-type) | [modders with two mods fighting](#which-file-wins-path-order-not-mod-order) | [anyone whose item vanished](#the-typo-that-deletes-the-vanilla-item)

Items, recipes, sounds, models and many other things in the game are described in plain text files called scripts. A script is a set of blocks like `item Plank { Weight = 3.0, ... }`. The question this page answers is the one every modder asks: *"If my mod has a block with the same name as one in the base game, what happens?"*

Short answer: for items, craft recipes and most other types, the two blocks **merge**. The game keeps vanilla's block and applies your keys on top. For a short list of types, yours **replaces** vanilla's. And the order the files are read in is not the order you might expect.

An older note in the wiki says "redefining an existing ID in a mod loaded after vanilla overrides it, and the mod list order decides who wins". That is close for loading but wrong in two ways for 42.22: it merges rather than overrides, and between mods the file path decides, not the mod list. Both are shown below with their source lines.

:::callout[The 1-minute version]{kind=key}
- Scripts are read once at start-up. A second block with the same name adds a second body to the same entry, and the bodies load one after another into one object.
- `item`, `craftRecipe` and most types merge: write only the keys you change. `model`, `sound`, `mannequin`, `soundTimeline`, `animationsMesh`, `stringList` and `xuiConfig` replace: write the whole block.
- Between mods the file path decides parse order; for the same relative path, the later mod in the mod list wins. Vanilla always parses before any mod.
- To change a vanilla item, write `module Base`. Never use a vanilla file's path.
- If any body of an item fails to load, the engine deletes the whole script, vanilla's body included. Search `console.txt` for `removing script due to load error`.
:::

:::facts
- **Steps to read scripts** 3: read and sort, parse, build objects
- **Replace types** 7 script tags listed below
- **Item `Tags` key** only adds; it never removes a tag
:::

## The big picture: how scripts get read

Scripts are read once at start-up, before any Lua runs, in three steps.

:::flow[How scripts get read]
- Read and sort the files from vanilla and each active mod
- Parse each file in order; a same-name block adds a body to the same entry
- Build the objects by loading each entry's bodies one after another
:::

1. **Read and sort the files.** The engine gathers every `.txt` file under `media/scripts/` from vanilla and from each active mod.
2. **Parse each file in order.** Every block becomes a "script body" filed under a name. A second block with the same name does not create a second item. It adds a second body to the same entry.
3. **Build the objects.** After all files are read, each entry's bodies are loaded one after another into one object.

The game calls `ScriptManager.instance.Load()` at start-up :cite[(`zombie/GameWindow.java:210`)] and Lua loads after it. :cite[(`zombie/GameWindow.java:987-989`)] `Load` does the reading. :cite[(`zombie/scripting/ScriptManager.java:1600-1710`)] In `CreateFromTokenPP`, if the name is already known, the body is added to the existing entry :cite[(`zombie/scripting/ScriptBucket.java:98-163`, `:109-116`)], and `LoadScripts` loads the bodies in order. :cite[(`:173-205`)]

## Which file wins: path order, not mod order

The file path decides who is parsed last, and vanilla is always parsed before any mod.

The engine builds two lists of files, sorts each, and joins them with vanilla first:

- File names starting with `template_` sort before everything else.
- Everything else sorts by its relative path, as lower-case text (for example `media/scripts/aaa.txt`).
- **All mods share one sorted list.** It is not "mod 1's files, then mod 2's files".
- A relative path is loaded once. If two mods ship a file with the same relative path, only the copy from the later mod in the mod list is read. The other file is never opened.

The engine sorts the two lists with one comparator, then joins vanilla followed by mods. :cite[(`zombie/scripting/ScriptManager.java:1658-1676`)] Each relative path is read once, using the file the file map holds :cite[(`:1682-1691`)], and a later mod's file with the same relative path replaces the earlier map entry. :cite[(`zombie/ZomboidFileSystem.java:672-677`)]

So, for two mods that both change the plank's weight:

| Mod | Script file | Weight |
|---|---|---|
| Mod A | `media/scripts/zzz_planks.txt` | 1.0 |
| Mod B | `media/scripts/aaa_planks.txt` | 2.0 |

`aaa_planks.txt` is parsed before `zzz_planks.txt`, so the plank ends at 1.0 whichever mod is higher in the mod list. Vanilla is always parsed before any mod, so a mod's value always lands on top of vanilla's.

What to do about it:

- **Do not rely on winning.** Two mods changing the same value is a real conflict. Say so on your page.
- **Name your file with your mod's name** (`LightPlanks_items.txt`). It prevents two mods from landing on the same path, and it makes your place in the order predictable.
- **Never use a vanilla file's path.** A mod file at, for example, `media/scripts/generated/items/weapon.txt` replaces the whole vanilla file, because of the same file map. Every weapon vanilla defines in that file is gone. This is the script version of the problem in [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua).

## Merge or replace? It depends on the type

Most script types merge, and a short list replace, depending on whether the script class clears its fields before the next body.

When an entry has more than one body, the engine loads them in order into the same object. Between bodies it may call `reset()` on the object, to wipe it before the next body. Whether that wipes anything depends on the script class:

- The setting that turns on this reset is on for almost every type (items, entities and craft recipes included). It is off for vehicles.
- But the default `reset()` does nothing. It is empty.
- Only a few classes replace it with a real method that clears their fields.

The default flags include `ResetExisting` and vehicles remove it. :cite[(`zombie/scripting/ScriptType.java:112-129`)] `reset()` is called before every body after the first, in an initial load, :cite[(`zombie/scripting/ScriptBucket.java:188-196`)] and the default `reset()` is empty. :cite[(`zombie/scripting/objects/BaseScriptObject.java:197`)]

So the result is:

::::cards
:::card[Merge: write only what changes]{accent=blue}
`item`, `craftRecipe`, `entity`, `vehicle`, `fixing`, `recipe`, `evolvedrecipe` and most others. Your keys land on top of vanilla's.
:::
:::card[Replace: write the whole block]{accent=orange}
`model`, `sound`, `mannequin`, `soundTimeline`, `animationsMesh`, `stringList`, `xuiConfig`. A partial `model` block leaves a model with no mesh.
:::
::::

| Type (script tag) | Second block does | Why |
|---|---|---|
| `item` | merges | no `reset()` override in `Item` |
| `craftRecipe` | merges, and its input and output lines pile up | see below |
| `entity`, `vehicle`, `fixing`, `recipe`, `evolvedrecipe` and most others | merges | default empty `reset()` |
| `model` | **replaces** | `ModelScript.reset()` clears its fields |
| `sound` | **replaces** | `GameSoundScript.reset()` |
| `mannequin`, `soundTimeline`, `animationsMesh`, `stringList`, `xuiConfig` | **replace** | each class overrides `reset()` |

The classes that override `reset()` are :cite[(`zombie/scripting/objects/ModelScript.java:251`, `GameSoundScript.java:91`, `MannequinScript.java:119`, `SoundTimelineScript.java:48`, `AnimationsMesh.java:54`, `StringListScript.java:51`, `XuiConfigScript.java:39`, `XuiSkinScript.java:57`)]. `XuiSkinScript`'s `reset()` clears the imports list; that type does not carry the `ResetExisting` flag :cite[(`ScriptType.java:130-137`)], so it matters only on a reload. Neither `Item` nor `GameEntityScript` has one (a search of `zombie/scripting/objects/` for `void reset()` finds only the classes above and a few nested helpers), and `CraftRecipe.java` has none either (only `PreReload`). This agrees with [Item block merge behaviour](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour), which reached the same result for items on 42.21.

For a **replace** type, write the complete block. A partial `model` block will leave you with a model that has no mesh.

For a **merge** type, write only what changes.

## What "merge" means inside one block

A merge sets the keys you write and leaves the rest alone, but some keys add to a list and some replace a whole list.

A merge is not "copy my block over theirs". Each body is loaded with the same code that loaded vanilla's, and that code reads only the keys it finds:

- A key you write is set, replacing the old value. A key you leave out is untouched.
- **Some keys add instead of set.** For an item, `Tags` adds each tag to the item's set; it never removes one. So you cannot take a tag off an item with a script.
- **Input and output lines in a craft recipe are appended.** Writing the same `inputs` block twice gives the recipe each input twice. See [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting).
- **Some keys replace a whole list.** For a craft recipe, `SkillRequired` starts a new list each time it appears.

`Load` calls `DoParam` once per key present :cite[(`zombie/scripting/objects/Item.java:1420-1442`)]; `Tags` calls `itemTags.add` :cite[(`:2353-2359`)]; inputs and outputs are `add`ed :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:585`, `:605`)]; and `SkillRequired` makes a new list. :cite[(`:399-400`)]

Example. This block changes two things about the plank (its weight and the category it is listed under) and leaves everything else alone:

```
module Base
{
    item Plank
    {
        Weight = 1.5,
        DisplayCategory = Material,
    }
}
```

> **Try it:** put this in `42\media\scripts\LightPlanks_items.txt`, start a game, and check the plank's weight in its tooltip.

## Modules and imports

Every script block lives inside a `module` block, and the module name is part of an item's full name.

```
module Base
{
    item Plank { ... }
}
```

defines `Base.Plank`. A block named `Plank` inside `module MyMod` defines `MyMod.Plank`, a **different** item. The engine keeps one list of items per module, and the merge looks in that list only.

A `module` block finds or creates the module by name, then hands its content to it. :cite[(`zombie/scripting/ScriptManager.java:1358-1386`)] Each module owns its own buckets, including one for items :cite[(`zombie/scripting/objects/ScriptModule.java:82`)], and the lookup is by name inside one bucket. :cite[(`zombie/scripting/ScriptBucket.java:109-116`)]

Two rules follow:

1. **To change a vanilla item, write `module Base`.** Vanilla's items live in `Base`. A block in any other module never touches them.
2. **A module with the same name as another mod's module shares its list.** If two mods both open `module Fishing`, their `item Rod` blocks merge. Pick a module name that is yours.

### What `imports` does, and does not do

An import is only for looking things up by short name; it merges nothing and changes no block's identity.

Inside a module you can write:

```
module MyMod
{
    imports
    {
        Base
    }
}
```

An import is only for **looking things up by short name**. When a script in `MyMod` refers to `Plank` with no module in front, the engine looks in `MyMod`, then in each imported module. It does not merge anything and it does not change which item a block defines.

`imports` adds module names to a list, and a module may not import itself. :cite[(`zombie/scripting/objects/ScriptModule.java:1000-1011`)] `get` tries this module, then each import when the type has the `SeekImports` flag. :cite[(`zombie/scripting/ScriptBucket.java:259-275`)]

When in doubt, write the full name: `Base.Plank`.

## Turning something off

Two keys switch an object off, `enabled = false` and `OBSOLETE = true`, and both should be used with care.

- `enabled = false` on a block. After loading, the engine skips an object whose `enabled` is false: it is never put in the lookup list, so the rest of the game does not know it exists. This key is read by the common block loader, which runs for items and recipes.
- `OBSOLETE = true` on an item. Skipped the same way, and loot tables ignore it.

The loader reads `enabled` :cite[(`zombie/scripting/objects/BaseScriptObject.java:177-178`)] and skips obsolete objects :cite[(`zombie/scripting/ScriptBucket.java:213`)] and disabled ones. :cite[(`:218-221`)] The item loader reads `OBSOLETE` :cite[(`zombie/scripting/objects/Item.java:2926`)], and loot ignores obsolete items. :cite[(`zombie/inventory/ItemPickerJava.java:408`)]

A word of warning for craft recipes: `CraftRecipe` does not list `enabled` among the keys it knows, so using it there logs an "Unknown key" error each time. See [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting). Items are different: `Item.Load` treats an unknown key as a warning plus mod data, not a failure. :cite[(`zombie/scripting/objects/Item.java:2998-3015`)]

Items that are removed this way can still be inside players' saved games. How the game treats such an item on load: not verified. Do not remove an item that players may already own.

## The typo that deletes the vanilla item

If any body of an item fails to load, the engine deletes the **whole** script, not just your block.

This is the one to remember. After a failed body the engine prints "removing script due to load error" and sets the script to nothing. The vanilla body that loaded perfectly a moment earlier goes with it.

A body that throws, in a type with the `RemoveLoadError` flag, drops the script; items, entities and craft recipes all have the flag by default. :cite[(`zombie/scripting/ScriptBucket.java:198-205`, `zombie/scripting/ScriptType.java:112-129`)]

What causes a failed body? A key whose value does not parse, such as `Weight = heavy,`; an `ItemType` the game does not know; a missing brace.

A value with a second `=` in it does **not** fail. An item key line is split on every `=` and only the part before the second one is kept, so `Foo = a=b` quietly becomes `Foo = a`. This is in `Item.Load` and in the one-argument `DoParam`. :cite[(`zombie/scripting/objects/Item.java:1431-1433`, `:1940-1942`)]

A key the item does not know does not fail either: it logs a warning and is stored as mod data on the item :cite[(`Item.java:2998-3015`)], so a misspelled key is silent. Craft recipes are stricter, as the note on `enabled` above shows.

How to check:

1. Start the game and open `console.txt` (in your `Zomboid` folder).
2. Search for `removing script due to load error`. The line names the script, for example `Base.Plank`.
3. If you launch with the `-debug` option, any script load error stops the start-up with "Script load errors", so you will not miss it.

The engine prints that message when a body fails :cite[(`zombie/scripting/ScriptBucket.java:201-203`)], and in debug mode a load error throws. :cite[(`zombie/scripting/ScriptManager.java:1711-1712`)]

## Checklist before you ship

Tick these five before you publish.

- [ ] The module is `Base` when I mean to change vanilla.
- [ ] My block holds only the keys I want to change (merge types), or everything (replace types).
- [ ] My file name has my mod's name in it and is not a vanilla path.
- [ ] I searched `console.txt` for `removing script due to load error` and `Unknown key`.
- [ ] I did not use `enabled = false` on an item players already own.

## Where to go next

- [Editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load) when the change depends on something you can only know at run time.
- [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting).
- [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source. Not verified: how the game treats a removed (`enabled = false` or `OBSOLETE`) item that players already own when a save loads.
:::
