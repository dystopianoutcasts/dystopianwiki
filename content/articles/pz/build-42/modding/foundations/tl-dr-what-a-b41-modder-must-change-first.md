---
id: build-42-tl-dr-what-a-b41-modder-must-change-first
slug: tl-dr-what-a-b41-modder-must-change-first
title: 'TL;DR: what a B41 modder must change first'
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - mod-info
  - registries-lua
  - project-structure
  - workshop-upload
  - debug-mode
excerpt: >-
  The five first moves for a Build 41 modder in 42.22: the folder layout, how a Build 41 mod fails, registries.lua, craftRecipe, and the server Mods= line. Each says what the code does.
last_updated: '2026-11-16'
related_articles:
  - b41-b42-porting-what-breaks-a-concrete-checklist
  - practical-b42-readiness-checklist
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - b42-status-versioning-and-the-compatibility-model
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - packaging-and-workshop-upload-for-b42
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a Build 41 modder who has ten minutes. It is the shortest of three pages on porting. The full table is [the porting checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist), and the ready-to-test list is [the readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist).

:::callout[The 1-minute version]{kind=key}
- Move the mod into a versioned folder: `mod.info` and `media/` go in `42/`, not at the mod's top folder. A mod left in the old flat shape is not listed.
- A mod the game does not list is skipped without a message. It only logs "required mod not found" when its id is named in `Mods=` or in a `require=`. A mod that is listed but carries old scripts is where the script-load error comes from.
- If the mod adds custom identifiers such as traits, tags or moodles, add `media/registries.lua`. It runs before the scripts.
- Write crafting as `craftRecipe`. Vanilla 42.22 has no old-style `recipe` block, and whether the old block still works was not tested.
- On a server, a backslash in front of each mod id in `Mods=` is allowed but not needed.
:::

:::facts
- **Lowest version folder** `42` (42.0)
- **Vanilla `craftRecipe` blocks** 965, and no `recipe` blocks
- **Registry types Lua can `register`** 14
- **`Mods=` separator** `;`
:::

## 1. Put the mod in a versioned folder

**A Build 42 mod keeps `mod.info` and `media/` in a version folder such as `42/`, and the game lists it when that `mod.info` exists.**

The game picks the highest folder that is at least 42.0 and not above the running game, adds `common/` under it, and lists the mod when `mod.info` is in either. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:493-498`)] A flat Build 41 mod, with `mod.info` at the top and no `common/` or version folder, fails that test. A `41/` folder is skipped too, because the lowest accepted version is 42.0. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`)]

The details are on [the project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure) and [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders). Build 41 support is not a `41/` folder. If you keep a flat `media/`, it sits beside `common/` and `42/`, and the 42.22 code does not read it.

## 2. Know how a Build 41 mod fails

**An unlisted mod is skipped, and it is logged only when its id is named, while script errors in a listed mod are what stop a world from loading.**

When a mod list names an id that no listed mod has, the game logs `required mod "<id>" not found`, and on a dedicated server it drops that id from its mod list. :cite[(`zombie/ZomboidFileSystem.java:826-842`)] A mod that is listed but holds Build 41 scripts can instead raise the message "World loading could not proceed, there are script load errors." :cite[(`zombie/iso/IsoWorld.java:2461-2465`)]

The message does not name the mod, so read the log lines printed before it. When that error is raised, and how to find the mod, are on [Build 42 status and versioning](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model).

## 3. Add `media/registries.lua` for custom identifiers

**A mod that adds its own trait, item tag or moodle registers the id in `media/registries.lua`, which the game runs before it loads the scripts.**

The loader runs the file for each available mod, from the version folder or else from `common`. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`)] Start-up calls it before the script manager loads. :cite[(`zombie/GameWindow.java:208-210`)]

Fourteen types are exposed to Lua with a `register` call. The list, the namespace rule and an example are in [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file).

## 4. Write crafting as `craftRecipe`

**Build 42 vanilla scripts define crafting with `craftRecipe` blocks.**

The engine has a `craftRecipe` script type and still has an older `recipe` type. :cite[(`zombie/scripting/ScriptType.java:23`, `zombie/scripting/ScriptType.java:45`)] Vanilla 42.22 has 965 `craftRecipe` blocks and no `recipe` block, so new recipes belong in the new block. The block itself is on [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block) and the comparison is on [craftRecipe vs legacy recipe](/pz/build-42/modding/crafting/craftrecipe-vs-legacy-recipe).

## 5. Check the server `Mods=` line

**The server reads `Mods=` after removing every backslash and splitting on `;`, so the Build 41 plain form and a backslash form both parse.**

The server strips each `\`, splits on `;` and keeps the non-empty ids. :cite[(`zombie/network/GameServer.java:667-675`)] The `WorkshopItems=` line is split on `;` too, and only valid Steam ids are kept. :cite[(`zombie/network/GameServer.java:693-701`)]

So a backslash does not stop a mod id from being read. When a mod is missing on a server, check that its id is one the game lists (section 2) and that every mod it needs is present.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. The counts of `craftRecipe` and `recipe` blocks are across vanilla `media/scripts`. Not verified: that Steam installs a Build 41 mod onto a Build 42 game without a warning, the version in which `registries.lua` first appeared, and whether a legacy `recipe` block still works in 42.22.
:::
