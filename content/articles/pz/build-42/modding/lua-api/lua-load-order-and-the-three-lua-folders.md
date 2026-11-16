---
id: build-42-lua-load-order-and-the-three-lua-folders
slug: lua-load-order-and-the-three-lua-folders
title: Lua load order and the three lua folders
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
  In Build 42.22, which of the client, server and shared Lua folders run in single player, on a multiplayer client and on a dedicated server, and the order the files run in.
last_updated: '2026-11-16'
related_articles:
  - lua-folder-load-order
  - the-b42-mod-folder-model
  - the-events-system
  - key-globals-and-classes
  - multiplayer-command-patterns
  - when-lua-reloads-leaving-a-game-and-resets
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua for Build 42. The short beginner version is [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order). This page adds the table per mode, the guards, `require`, and what happens when a mod file has the same path as a vanilla file.

:::callout[The 1-minute version]{kind=key}
- `shared` and `client` load when the game starts. `server` loads when a world starts, and it loads in single player and on a multiplayer client as well as on a dedicated server.
- A dedicated server adds the `client` files to the network checksum and does not run them, so `client/` is the one folder a dedicated server never executes.
- Because `server/` also runs on a multiplayer client, a server file that must run only on the server starts with `if isClient() then return end`.
- Inside one folder, vanilla's files run first, then each mod's files in mod-list order, and each list is sorted by lower-case path. So `A_Thing.lua` runs before `B_Thing.lua`, whatever depends on what.
- A mod file at the same path as a vanilla file runs once, in vanilla's slot, and the mod's copy is the one that runs.
- Do not call into another file at file scope. Wait for an event, or load the file with `require` first.
:::

:::facts
- **Lua folders** 3: `client`, `server`, `shared`
- **Dedicated server** `shared` runs, `client` is checksummed only, `server` runs
- **Sort** each folder's list by lower-case path, with a case-insensitive compare
- **Guards** `isClient()` is true only on a multiplayer client, `isServer()` only on a dedicated server
:::

## 1. Which folders run in which mode

**Single player and a multiplayer client run all three folders, and a dedicated server runs `shared` and `server` only.**

| Folder | Single player | Multiplayer client | Dedicated server | Code |
|---|:---:|:---:|:---:|---|
| `client` | runs | runs | checksum only | :cite[(`zombie/Lua/LuaManager.java:1253-1257`, `zombie/network/GameServer.java:1518`, `zombie/Lua/LuaManager.java:1214-1216`)] |
| `server` | runs | runs | runs | :cite[(`zombie/gameStates/GameLoadingState.java:155-156`, `zombie/network/GameServer.java:1519`)] |
| `shared` | runs | runs | runs | :cite[(`zombie/Lua/LuaManager.java:1253-1256`, `zombie/network/GameServer.java:1517`)] |

The game start loads `shared` and then `client`. :cite[(`zombie/Lua/LuaManager.java:1253-1257`)] The `server` folder is loaded later, by the loading screen of a world, and that call does not test whether the game is a multiplayer client. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)]

A dedicated server has no start-up screen, so it loads all three in one go, with the `client` call flagged as checksum-only. :cite[(`zombie/network/GameServer.java:1517-1519`)] With that flag the file is added to the checksum and the call that runs it is skipped. :cite[(`zombie/Lua/LuaManager.java:1214-1223`)] Anything that must hold in multiplayer therefore lives in `shared` or `server`.

## 2. The load sequence

**Lua loads in two steps: `shared` then `client` at game start, and `server` when a world starts.**

:::flow[Single player and a multiplayer client]
- Registries file, then scripts
- `shared`: vanilla files, then mod files
- `client`: vanilla files, then mod files
- Main menu
- A world starts: `server`, vanilla files then mod files
:::

The registries file and the scripts load before any Lua. :cite[(`zombie/GameWindow.java:208-210`, `zombie/GameWindow.java:986-989`)]

When Lua is reloaded (a mod list change, leaving a game), the server files go with the rest of the Lua environment and come back only when a world loads again. :cite[(`zombie/Lua/LuaManager.java:1087-1119`, `zombie/core/Core.java:3508`, `zombie/core/Core.java:3547`)] What causes a reload is on [When your Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets).

## 3. The order inside a folder

**Within one folder the game runs vanilla's files first, then each mod's files, and each list is sorted by lower-case path.**

The loader collects vanilla's files for the folder and sorts them with a case-insensitive compare. :cite[(`zombie/Lua/LuaManager.java:1200`)] It then walks the mods in the order of the game's mod list, collects each mod's files (its `common` folder and its version folder together) and sorts that list the same way. :cite[(`zombie/Lua/LuaManager.java:1159-1196`)] The mod lists are appended after vanilla's. :cite[(`zombie/Lua/LuaManager.java:1200-1202`)]

Every path is made lower case before it is stored, so the sort compares lower-case paths. :cite[(`zombie/Lua/LuaManager.java:1266-1269`)] Inside your mod, `shared/MyMod/A_Thing.lua` runs before `shared/MyMod/B_Thing.lua`.

On a dedicated server the mod list is the server's `Mods=` line, and a client uses the list the server sends. :cite[(`zombie/network/GameServer.java:667-674`, `zombie/network/GameServer.java:1463`, `zombie/ZomboidFileSystem.java:759-763`)] A mod that names another in `require=` is placed after it. :cite[(`zombie/ZomboidFileSystem.java:826-852`)] If mod B needs mod A's shared tables, give B a `require=` for A. The fields are in [mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system).

## 4. A mod file at a vanilla path replaces it

**A mod file with the same relative path as a vanilla file runs once, at vanilla's turn, and it is the mod's copy that runs.**

Each relative path, such as `media/lua/client/ISUI/ISInventoryPane.lua`, runs once, because a set of paths already run skips the repeat. :cite[(`zombie/Lua/LuaManager.java:1204-1217`)] The path is then turned into a file by a lookup that holds the last mod's copy for that path. :cite[(`zombie/ZomboidFileSystem.java:382-385`, `zombie/ZomboidFileSystem.java:656-695`)] The mod loader logs `mod "<id>" overrides <path>` when it replaces an entry. :cite[(`zombie/ZomboidFileSystem.java:673`, `zombie/ZomboidFileSystem.java:690`)]

So an override file runs early, among vanilla's files, before every other mod file. At file scope it cannot rely on other mods, or on vanilla files that sort after it. When two mods ship the same path, the copy from the mod loaded last is the one that runs, at the turn of the first one that has the path.

Nest your own Lua in a folder named after your mod (`media/lua/shared/MyMod/foo.lua`, where `shared/` is the Lua folder), so your paths never meet vanilla's.

## 5. File scope and `require`

**A file runs from top to bottom as it loads, so a call into another file works only if that file has already run.**

The call `require("Name")` runs the file it finds in the Lua folders registered so far, searched in the order they were registered, and a file runs once however often it is required. :cite[(`zombie/Lua/LuaManager.java:5711-5727`, `zombie/Lua/LuaManager.java:1357-1359`)] Each folder is registered when its load starts, so a `shared` file cannot `require` a `client` file while Lua first loads. :cite[(`zombie/Lua/LuaManager.java:1145-1148`)] A failed `require` logs a warning and returns nothing. :cite[(`zombie/Lua/LuaManager.java:5725-5726`)]

Two patterns are safe. Require a file you depend on from a folder that loads earlier or at the same time, or resolve the dependency inside an event handler such as `OnGameStart`, when every file has run.

## 6. Guards for client, server and single player

**Put one line at the top of a file to skip it in the modes it is not for.**

`isClient()` is true on a multiplayer client, `isServer()` is true on a dedicated server, and both are false in single player. :cite[(`zombie/Lua/LuaManager.java:4415-4437`)] `isMultiplayer()` is true when either is. :cite[(`zombie/Lua/LuaManager.java:4439-4445`)]

```lua
-- run on the server and in single player (skip on a multiplayer client)
if isClient() then return end

-- run on a client and in single player (skip on a dedicated server)
if isServer() then return end

-- run only on a multiplayer client
if not isClient() then return end

-- run only on a dedicated server
if not isServer() then return end

-- run only in single player
if isMultiplayer() then return end
```

There is no global `isSinglePlayer()`; use `not isMultiplayer()`. :cite[(`api/lua_globals.jsonl`)] Vanilla's own server files start with `if isClient() then return end`. :cite[(`media/lua/server/ClientCommands.lua:1`)] Do not use `isServer()` to mean "not a client": it is false in single player.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run. Not verified: how a hosted game (a server process that the host also joins as a client) loads its folders; that is in [Who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what). The 42.21 page told of a mod that failed for every player because a file called into a later-sorting file at file scope; that story could not be checked and is dropped, and the sort rule above is read from the code.
:::
