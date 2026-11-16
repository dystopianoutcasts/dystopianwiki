---
id: build-42-start-here
slug: start-here
title: 'Start here: what changed in Build 42'
game: pz
version: build-42
section: modding
category: getting-started
difficulty: beginner
tags:
  - getting-started
  - mod-compatibility
  - registries-lua
  - craftrecipe
  - build-42
excerpt: >-
  Your first page for Build 42.22 modding: what to read in what order, where each kind of mod is built, the six-step workflow, and the Build 41 differences that the code confirms.
last_updated: '2026-11-16'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - foundations-and-toolchain
  - project-skeleton
  - cookbook-index
  - b42-status-versioning-and-the-compatibility-model
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [new modders](#the-first-hour) | [Build 41 modders porting a mod](#what-the-code-confirms-about-build-41-differences) | [anyone looking for a mod type](#where-each-kind-of-mod-is-built)

:::callout[The 1-minute version]{kind=key}
- Build your first mod from [the project skeleton](/pz/build-42/modding/cookbook/project-skeleton). It takes three small files and shows you the edit, start and read-the-log loop.
- A mod needs `mod.info` in `common/` or in a `42/` folder. A mod with `mod.info` at its top folder and nothing else is not listed.
- Vanilla 42.22 writes recipes as `craftRecipe` blocks, and the other cookbook pages show how to write each kind of content.
- If you are porting from Build 41, read [the TL;DR](/pz/build-42/modding/foundations/tl-dr-what-a-b41-modder-must-change-first) first.
- Claims this page could not verify in 42.22 are listed in its last section.
:::

:::facts
- **Game version** 42.22
- **Lowest version folder** `42` (42.0)
- **Registry types Lua can `register`** 14
- **Vanilla `craftRecipe` blocks** 965, and no `recipe` blocks
:::

## The first hour

**Build the skeleton mod, then read the folder pages, then pick the cookbook page for what you want to make.**

:::flow[A good first hour]
- Build the skeleton mod and read its log lines
- Read the TL;DR if you are porting
- Read the folder pages
- Pick a cookbook recipe
- Test it in a new world
:::

The skeleton is [the project skeleton](/pz/build-42/modding/cookbook/project-skeleton), and the recipe list is [the cookbook index](/pz/build-42/modding/cookbook/cookbook-index). The folder pages are [the foundations index](/pz/build-42/modding/foundations/foundations-and-toolchain). The cookbook pages are the checked how-to; the older notes on this page were a map to a knowledge base that is not part of this wiki.

## Where each kind of mod is built

**Each kind of mod has a cookbook page that gives its files and fields.**

| You want to make | Start with |
|------------------|-----------|
| A mod that loads and logs | [Project skeleton](/pz/build-42/modding/cookbook/project-skeleton) |
| An item, food or weapon | [New item](/pz/build-42/modding/cookbook/new-item), [new food](/pz/build-42/modding/cookbook/new-food), [new weapon](/pz/build-42/modding/cookbook/new-weapon) |
| Clothing | [New clothing](/pz/build-42/modding/cookbook/new-clothing) |
| A recipe, a bench or a repair | [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe), [new workstation](/pz/build-42/modding/cookbook/new-workstation), [item repair](/pz/build-42/modding/cookbook/item-repair), [evolved recipe](/pz/build-42/modding/cookbook/evolved-recipe) |
| A fluid | [New fluid](/pz/build-42/modding/cookbook/new-fluid) |
| A trait, a profession or a skill | [New trait](/pz/build-42/modding/cookbook/new-trait), [new profession](/pz/build-42/modding/cookbook/new-profession), [new skill](/pz/build-42/modding/cookbook/new-skill) |
| An animal or a crop | [New animal](/pz/build-42/modding/cookbook/new-animal), [new crop](/pz/build-42/modding/cookbook/new-crop) |
| Lua behavior, a window or a moodle | [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod), [custom UI](/pz/build-42/modding/cookbook/custom-ui), [custom moodle](/pz/build-42/modding/cookbook/custom-moodle) |
| Sound, radio or translations | [Sound mod](/pz/build-42/modding/cookbook/sound-mod), [radio channel](/pz/build-42/modding/cookbook/radio-channel), [translations](/pz/build-42/modding/cookbook/translations) |
| A map or a vehicle | [Map, building, basement](/pz/build-42/modding/cookbook/map-building-basement), [vehicle mod](/pz/build-42/modding/cookbook/vehicle-mod) |

To change something vanilla already has, start with [Changing vanilla](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here).

## The workflow for any mod

**Make the folders, get the mod to load, register your ids, write the content, wire the behavior, translate the names, and test.**

1. **Scaffold the folders.** Put `mod.info` and `media/` in `42/`, with an optional `common/`. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:493-498`)]
2. **Make it load.** Put the mod in `Zomboid/mods/<ModId>/`, a folder the game always scans. :cite[(`zombie/ZomboidFileSystem.java:548-552`)] The smallest `42/mod.info` is two lines, and the `id=` line must start the line. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-221`, `zombie/gameStates/ChooseGameInfo.java:243-247`)]

```
name=My First Mod
id=MyFirstMod
```

   Enable the mod on the game's Mods screen and start a game. On a dedicated server, list the `id=` value in `Mods=` and the Workshop id in `WorkshopItems=`, each list split on `;`. :cite[(`zombie/network/GameServer.java:667-675`, `zombie/network/GameServer.java:693-701`)] The full walk, with a Lua file that proves the load, is [the project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
3. **Register custom ids.** Put them in `media/registries.lua`, which runs before the scripts load. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/GameWindow.java:208-210`)]
4. **Write the content** as scripts, starting from the cookbook page for that kind of content.
5. **Add the Lua** for behavior. `shared` and `client` load at start-up and `server` when a world starts. :cite[(`zombie/Lua/LuaManager.java:1253-1257`, `zombie/gameStates/GameLoadingState.java:155-156`)]
6. **Translate the names** in the translation files. :cite[(`zombie/core/Languages.java:43-50`)]
7. **Test** in a new world. The game writes its log to `console.txt` in the `Zomboid` cache folder. :cite[(`zombie/gameStates/MainScreenState.java:183-186`, `zombie/ZomboidFileSystem.java:205-213`)]

## What the code confirms about Build 41 differences

**The checked differences are the folder shape, the lowercase `mod.info` keys, the registry file, the recipe block and a few Lua and Workshop details.**

| Area | What 42.22 does | Code |
|------|-----------------|------|
| Folder shape | The mod is listed when `mod.info` is in `common/` or in the version folder. The lowest version folder is 42.0, so `41/` is skipped. | `zombie/ZomboidFileSystem.java:493-498`, `zombie/gameStates/ChooseGameInfo.java:45` |
| `mod.info` keys | Each key is matched in lowercase: `name=`, `poster=`, `description=`, `require=`, `author=`, `icon=`, `id=` (singular `author`). | `zombie/gameStates/ChooseGameInfo.java:211-259` |
| Version range | `versionMin` and `versionMax` switch a mod off when the game is outside them. | `zombie/gameStates/ChooseGameInfo.java:654-659` |
| Registries | `media/registries.lua` runs before scripts. 14 types can be registered from Lua, and a mod may not use the `base` namespace. | `zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/scripting/objects/RegistryReset.java:22-29` |
| Recipes | `craftRecipe` is the script type vanilla uses. The older `recipe` type still exists. | `zombie/scripting/ScriptType.java:23`, `zombie/scripting/ScriptType.java:45` |
| Traits and professions | They have script types of their own: `character_trait_definition` and `character_profession_definition`. | `zombie/scripting/ScriptType.java:55-56` |
| Client commands | Lua has `sendClientCommand(module, command, args)` and a form with the player first. `OnClientCommand` receives the player. | `zombie/Lua/LuaManager.java:8866`, `zombie/Lua/LuaManager.java:8882`, `zombie/network/GameServer.java:2343` |
| `tiledef=` | The file number must be from 100 to 8189, or the game rejects the `mod.info`. | `zombie/gameStates/ChooseGameInfo.java:305-326` |
| Workshop preview | A readable square PNG, 256 or 512 pixels, at most 1,024,000 bytes. | `zombie/core/znet/SteamWorkshopItem.java:494-519` |
| Visibility | In `workshop.txt` only `public`, `friendsOnly`, `private` and `unlisted` are known, and anything else, a number too, means public. | `zombie/core/znet/SteamWorkshopItem.java:128-138` |

The older text said 11 registry types, and the code exposes 14 with a `register` call. :cite[(`zombie/scripting/objects/AmmoType.java:13`, `zombie/scripting/objects/Brochure.java:13`)] The full list is on [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file).

For the full port list see [the porting checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist) and [the readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. Counted across vanilla `media/scripts`: 965 lines that open a `craftRecipe` block and none that open a `recipe` block. Not verified in 42.22, and dropped from this page as facts: that Build 41 saves do not load, that Steam installs a Build 41 mod without a warning, that the crafting-bench tag is mandatory on every recipe, that vanilla recipes cannot be edited at run time, that the server runs all inventory and timed actions, that timed actions must be stored in `_G`, that `ModData` does not sync by itself, the skill renames and new skills, the 256 by 256 cell size, the tiledef 0 to 99 reserve, the state of the mapping tools, the electricity, vehicle and weapon-field notes, the ready/not-ready ratings of each mod type, and the knowledge-base file names and local caches the old page described.
:::
