---
id: build-42-b41-b42-porting-what-breaks-a-concrete-checklist
slug: b41-b42-porting-what-breaks-a-concrete-checklist
title: 'B41 -> B42 porting: what breaks + a concrete checklist'
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
  What a Build 41 mod runs into in 42.22, area by area, with what the code does, then ten steps to port it. The folder, mod.info, registries, craftRecipe and server-list steps are checked.
last_updated: '2026-11-16'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - practical-b42-readiness-checklist
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - b42-status-versioning-and-the-compatibility-model
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a Build 41 modder who is porting a mod and wants every step in order. The short version is [the TL;DR](/pz/build-42/modding/foundations/tl-dr-what-a-b41-modder-must-change-first), and the list of things to test is [the readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist).

:::callout[The 1-minute version]{kind=key}
- Do the folder step first: a mod without `mod.info` in `common/` or in a `42/` folder is not listed at all.
- `mod.info` keys are matched in lowercase, so `Name=` is not read as `name=`. A `tiledef=` line outside 100 to 8189 makes the game reject the whole file.
- Add `media/registries.lua` only if the mod adds identifiers of its own.
- Rewrite crafting as `craftRecipe`. Vanilla 42.22 has no old-style `recipe` block, and whether the old block still works was not tested.
- On a server the `Mods=` line takes ids split on `;`, and a backslash in front of an id is removed, not required.
- Test with a fresh world and read `console.txt` for the named error.
:::

:::facts
- **Lowest version folder** `42` (42.0)
- **`tiledef=` file number** 100 to 8189
- **Preview image** square, 256 or 512 pixels, at most 1,024,000 bytes
- **Vanilla `craftRecipe` blocks** 965, no `recipe` blocks
:::

## 1. What breaks

**The folder layout, `mod.info`, identifiers and crafting are the four areas where the 42.22 code differs from what a Build 41 mod expects.**

:::chips[Areas in the table]
Folder layout
Identifiers
Crafting
Multiplayer authority
Server config
Tiles and maps
Saves
:::

| Area | B41 | B42 (42.22) | Checked | Code |
|------|-----|-------------|---------|------|
| Folder layout | flat `mod.info` and `media/` | `mod.info` in `common/` or in a `42/` folder, and `media/` in either | Yes. A flat mod is not listed. | `zombie/ZomboidFileSystem.java:493-498`, `zombie/gameStates/ChooseGameInfo.java:45` |
| Identifiers | none | `media/registries.lua`, run before the scripts load | Yes | `zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/GameWindow.java:208-210` |
| Crafting | `recipe` blocks | `craftRecipe` blocks | The script types exist, the old block's runtime result is not tested | `zombie/scripting/ScriptType.java:23`, `zombie/scripting/ScriptType.java:45` |
| Multiplayer authority | client ran inventory and timed actions | see the pages on timed actions and anti-cheat | Not re-checked on this page | none |
| Server config | `Mods=` plain ids | ids split on `;`, backslashes removed | Yes. Backslashes are allowed, not required. | `zombie/network/GameServer.java:667-675` |
| Tiles and maps | old tiledefs | `tiledef=` file number must be 100 to 8189 | Yes for the range | `zombie/gameStates/ChooseGameInfo.java:305-326` |
| Saves | B41 saves | B41 saves are incompatible | Not verified here | none |

The multiplayer row is covered by [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network) and [Anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods).

## 2. The ten steps

**Work down the steps in order, and test after the folder step, the `mod.info` step and the crafting step.**

:::flow[The port, in order]
- Choose B42-only or dual-build
- Make the folders
- Fix `mod.info`
- Add `registries.lua`
- Rewrite crafting
- Check events
- Make it server-safe
- Fix the server list
- Test with `-debug`
- Package and upload
:::

### Step 1. Decide the scope

A Build 42-only mod is the simplest. A dual-build upload keeps a flat `media/` and a `mod.info` at the mod's top folder for Build 41, beside `common/` and `42/`, and the 42.22 loader does not read the flat part. :cite[(`zombie/ZomboidFileSystem.java:470-498`)] What Build 41 does with that layout was not checked.

### Step 2. Make the folders

Create `42/` with `mod.info`, `poster.png` and `media/`. Add `common/media` for large assets that do not change with the game. The version folder is the highest name that is at least 42.0 and not above the game. :cite[(`zombie/ZomboidFileSystem.java:470-486`)] See [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders).

### Step 3. Fix `mod.info`

The loader reads the file line by line and matches each key with its lowercase spelling: `name=`, `poster=`, `description=`, `require=`, `author=`, `icon=`, `id=`. :cite[(`zombie/gameStates/ChooseGameInfo.java:211-259`)] The `id=` line must start the line, and `versionMin=` and `versionMax=` must too. :cite[(`zombie/gameStates/ChooseGameInfo.java:243-247`, `zombie/gameStates/ChooseGameInfo.java:329-340`)] A `tiledef=` line takes a file name and a number from 100 to 8189, and a number outside that range makes the game reject the whole `mod.info`. :cite[(`zombie/gameStates/ChooseGameInfo.java:305-326`)] The full field list is in [mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system).

### Step 4. Add `registries.lua`

Do this only when the mod adds identifiers such as traits, tags, moodles or ammo. Register each id as `yourmod:name` and use the string in scripts. :cite[(`zombie/scripting/objects/RegistryReset.java:22-29`)] See [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file).

### Step 5. Rewrite crafting

Write each recipe as a `craftRecipe` block, which is the only kind vanilla 42.22 uses. :cite[(`zombie/scripting/ScriptType.java:45`)] The block is on [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block). The older page called this where most silent failures hide, which was not tested.

### Step 6. Check event bindings

Pass the function itself to `Add`, as in `Events.OnGameStart.Add(TopOfTheWorld.OnGameStart)`. :cite[(`media/lua/client/Challenge/TopOfTheWorld.lua:279`)] The older advice to remove `pcall` wrappers and `if object.method then` guards is not an engine rule. See [The events system](/pz/build-42/modding/lua-api/the-events-system) for which events exist.

### Step 7. Make it server-safe

Read [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network) and [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns). The `media/lua/server/` folder also loads on a multiplayer client. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)]

### Step 8. Fix the server list

Write `Mods=` as ids split on `;`. A backslash is removed before the split, so the Build 41 form also reads. `WorkshopItems=` is split on `;` and keeps only valid Steam ids. :cite[(`zombie/network/GameServer.java:667-675`, `zombie/network/GameServer.java:693-701`)] Put a required mod's id in `require=`, because a mod is placed after the mods it requires. :cite[(`zombie/ZomboidFileSystem.java:826-852`)]

### Step 9. Test with `-debug`

Start the game with `-debug` and a new world. :cite[(`zombie/gameStates/MainScreenState.java:242-243`)] The game sends its output to `console.txt` in the `Zomboid` cache folder. :cite[(`zombie/gameStates/MainScreenState.java:183-186`)] The screen for an unexpected load error also draws that path. :cite[(`zombie/gameStates/GameLoadingState.java:613`)] A script error that stops the world prints "World loading could not proceed, there are script load errors." and the cause is in earlier log lines. :cite[(`zombie/iso/IsoWorld.java:2461-2465`)] See [debug mode](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools).

### Step 10. Package and upload

Stage the mod as `Zomboid/Workshop/<Item>/Contents/mods/<ModId>/`, with `workshop.txt` and `preview.png` in the item folder. :cite[(`zombie/core/znet/SteamWorkshopItem.java:57-59`, `zombie/core/znet/SteamWorkshopItem.java:194-196`)] The preview must be a readable square PNG of 256 or 512 pixels, at most 1,024,000 bytes. :cite[(`zombie/core/znet/SteamWorkshopItem.java:494-519`)] In `workshop.txt`, `visibility` takes `public`, `friendsOnly`, `private` or `unlisted`, and anything else publishes the item public. :cite[(`zombie/core/znet/SteamWorkshopItem.java:128-138`)] The rest is on [Packaging and Workshop upload](/pz/build-42/modding/foundations/packaging-and-workshop-upload-for-b42).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla Lua; no game was run. The block counts are across vanilla `media/scripts`. Not verified: that B41 saves cannot load, that the multiplayer authority change breaks a mod (see the linked pages), that F11 hot reloading and a green bug icon work as the older page said, whether the in-game uploader writes `workshop.txt` for you, and whether a legacy `recipe` block still works.
:::
