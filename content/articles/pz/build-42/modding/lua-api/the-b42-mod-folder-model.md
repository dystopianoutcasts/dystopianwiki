---
id: build-42-the-b42-mod-folder-model
slug: the-b42-mod-folder-model
title: The B42 mod folder model
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua-api
  - events
  - moddata
  - timed-actions
  - multiplayer
excerpt: >-
  How a Build 42.22 mod folder is laid out: common and a version folder, where mod.info and registries.lua are found, which Lua folders exist, and what the server's Mods line needs.
last_updated: '2026-11-16'
related_articles:
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - lua-load-order-and-the-three-lua-folders
  - media-registries-lua-the-new-b42-identifier-file
  - mod-info-fields-and-the-versioning-compatibility-system
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua and want the folder picture in one place. The step-by-step version is [the project structure page](/pz/build-42/modding/foundations/the-b42-mod-project-structure), and the version-folder rules are on [the versioned layout page](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders).

:::callout[The 1-minute version]{kind=key}
- A mod folder holds `common/` and a version folder named `42`. The game loads `common/` plus the highest version folder that is at least 42 and not above the running game.
- The game lists a mod only when `common/mod.info` or the version folder's `mod.info` exists. A mod with `mod.info` and `media/` at its top folder, with no `common/` or `42/`, is not listed.
- Lua goes in `media/lua/client`, `media/lua/server` and `media/lua/shared`. A folder named `41` is never used by 42.22.
- Both `common/` and the version folder may hold `media/`. When a file has the same path in both, the version folder's copy wins.
- `mod.info` needs an `id=` line. The `id` is what the server's `Mods=` line names, and a missing `id=` makes the id `undefined_id`.
:::

:::facts
- **Folders the loader reads** 2 per mod: `common` and the picked version folder
- **Lowest version folder** 42.0 (a folder named `42` counts as 42.0)
- **Lua folders** 3: `client`, `server`, `shared`
- **Default `id`** `undefined_id`, default `name` `Unnamed Mod`
:::

## 1. The layout

**A mod is a folder with `common/` for files that are the same on every build, and a version folder for files that differ.**

```
MyMod/
  common/
    mod.info              (or put mod.info in 42/ instead)
    media/
      lua/
        client/MyMod/...  runs on a client and in single player
        server/MyMod/...  runs when a world starts, on every side
        shared/MyMod/...  runs on every side
      scripts/            item, recipe and other script files
      registries.lua      identifiers, see the registries page
  42/
    mod.info              optional if common/mod.info exists
    media/                optional, files that differ on build 42
```

The loader lists a mod folder when `common/mod.info` exists, or when the picked version folder holds a `mod.info`. :cite[(`zombie/ZomboidFileSystem.java:497-498`)] The picked version folder is the highest folder name that is at least 42.0 and not above the running game, so `42` is picked in 42.22 and `41` never is. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/gameStates/ChooseGameInfo.java:45`, `zombie/core/Core.java:163`)]

A flat mod with `mod.info` at the top and everything under `media/` is not listed, because neither `common/mod.info` nor the version folder's file exists. :cite[(`zombie/ZomboidFileSystem.java:498`)] The 42.21 page said Build 42 accepts that older shape; at 42.22 the code does not.

## 2. How common and the version folder combine

**The game reads `common/` first and the version folder second, and the version folder's file wins when both hold the same path.**

For Lua, one sorted list per Lua folder covers the files of both folders together. :cite[(`zombie/Lua/LuaManager.java:1165-1196`)] For every other file the mod loader enters the `common/` files into its lookup first and the version folder's files second, so a version-folder file replaces the common one at the same path. :cite[(`zombie/ZomboidFileSystem.java:656-695`)]

`mod.info` is read from the version folder first and from `common/` only when the version folder has none. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-207`)] The `registries.lua` file follows the same order: the version folder's file runs, and `common/media/registries.lua` runs only when the version folder has none. :cite[(`zombie/scripting/objects/ModRegistries.java:19-27`)] Put the file in one place.

Where each Lua folder runs, and in what order, is on [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders). Nest your own Lua in a folder named after your mod, such as `media/lua/shared/MyMod/`, so a path never meets vanilla's.

## 3. The smallest `mod.info`

**`mod.info` needs `id=` and should have `name=`; every other key is optional.**

This is the `mod.info` part of a complete mod. The whole mod, with its folders and the steps to turn it on, is the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).

```
name=My Mod
id=MyMod
description=What it does.
```

The reader takes `name=`, `id=`, `description=`, `poster=`, `require=` and other keys line by line. :cite[(`zombie/gameStates/ChooseGameInfo.java:210-262`)] A mod with no `name=` is called `Unnamed Mod`, and one with no `id=` gets the id `undefined_id`. :cite[(`zombie/gameStates/ChooseGameInfo.java:489-491`)] The `id=` line is recognized only when the line starts with `id=`. :cite[(`zombie/gameStates/ChooseGameInfo.java:243-247`)]

A mod folder named `examplemod` (in any letter case) is refused and never listed, so do not name your folder that. :cite[(`zombie/ZomboidFileSystem.java:493-494`)]

The full key list is on [mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system).

## 4. Enabling a mod on a server

**A dedicated server loads the ids in its `Mods=` line, separated by semicolons, in that order.**

The server splits `Mods=` on `;` and keeps the non-empty ids. :cite[(`zombie/network/GameServer.java:667-674`)] In Steam mode it also reads `WorkshopItems=`, split on `;`, to know which Workshop items to download. :cite[(`zombie/network/GameServer.java:678-703`)]

```
Mods=MyMod;OtherMod
WorkshopItems=1234567890;9876543210
```

The `Mods=` value is the mod's `id=`, not its folder name or its `name=`. A local mod's folder goes in the `mods` folder inside the game's cache folder. :cite[(`zombie/ZomboidFileSystem.java:549`)] Each client needs the same mod, because a client loads the mod list the server sends. :cite[(`zombie/ZomboidFileSystem.java:759-763`)]

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. The 42.21 page's claims that a single-build mod may use the flat shape, and that `registries.lua` lives only in `common/media/`, are corrected above. Not verified: what Build 41 does with a mod folder that holds a `41/` folder, and which cache folder a dedicated server uses on each platform.
:::
