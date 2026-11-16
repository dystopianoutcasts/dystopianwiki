---
id: build-42-lua-folder-load-order
slug: lua-folder-load-order
title: Lua folder load order
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
  In Build 42 (42.22) the Lua in shared and client loads when the game starts, server loads when a world starts, and each folder runs vanilla first, then each mod, in alphabetical order.
last_updated: '2026-11-16'
related_articles:
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - b42-status-versioning-and-the-compatibility-model
  - media-registries-lua-the-new-b42-identifier-file
  - mod-info-fields-and-the-versioning-compatibility-system
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders new to Build 42 who need to know which of their Lua files exist yet when another one runs. The longer treatment is [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

:::callout[The 1-minute version]{kind=key}
- `media/lua/shared/` and `media/lua/client/` load when the game starts. `media/lua/server/` loads when a world starts, not at the main menu.
- The folder name says when the code loads, not who runs it. In multiplayer, `server/` also loads on a client that joins, so code that must run only on the server has to check for itself.
- Inside one folder, vanilla files run first, then each mod in its load order, and a mod's own files run in alphabetical order by path, ignoring case.
- A mod that `require=`s another mod loads after it.
- Hook an event with the bare function: `Events.OnGameStart.Add(onGameStart)`, never `Add(onGameStart())`.
:::

:::facts
- **At game start** `shared`, then `client`
- **At world start** `server`
- **Dedicated server** `shared`, `client` (checked, not run), `server`
- **Order inside a folder** vanilla, then each mod, each sorted by path ignoring case
:::

## 1. Which folder loads when

**The Lua in `shared` and `client` loads once when the game starts, and `server` loads when a world starts.**

At start-up the game runs the registries and the scripts, then calls the loader that reads `shared` and then `client`. :cite[(`zombie/GameWindow.java:208-210`, `zombie/GameWindow.java:987-989`, `zombie/Lua/LuaManager.java:1253-1257`)] The `server` folder is loaded later, when the game loading screen for a world runs, and nothing there checks whether the game is a multiplayer client. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)]

:::flow[Single player, and a multiplayer client]
- Registries file, then scripts
- Lua in `shared`
- Lua in `client`
- A world starts: Lua in `server`
:::

A dedicated server has no start-up screen. It loads `shared`, then `client` with the checksum-only flag, then `server`. :cite[(`zombie/network/GameServer.java:1517-1519`)] With that flag the client files are added to the network checksum and not run. :cite[(`zombie/Lua/LuaManager.java:1214-1218`)]

## 2. The server folder also loads on a client

**In multiplayer a joining client loads `media/lua/server/` too, so the folder sets when code loads and not which side runs it.**

The call that loads `server` on the client has no guard for the client case, which is why a client runs those files. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)] Vanilla's own server files that must stay on the server start with a line that returns when the game is a client. :cite[(`media/lua/server/Camping/SCampfireSystem.lua:1`, `media/lua/server/Camping/camping_tent.lua:179`)]

Put code both sides need in `shared`, and make a `server` file stop itself with `if isClient() then return end` when it must not run on a client.

## 3. The order inside a folder

**Within one folder the game runs vanilla first, then each mod, and each list is alphabetical by path with case ignored.**

The loader collects the vanilla files of the folder, then the files of each mod. It sorts each list with a case-insensitive comparison and appends the mod lists after the vanilla one. :cite[(`zombie/Lua/LuaManager.java:1143-1201`)] A path that appears twice is run once, and each path is resolved to the file the game currently has for it, so a version-folder file hides a `common` file with the same path. :cite[(`zombie/Lua/LuaManager.java:1202-1217`, `zombie/ZomboidFileSystem.java:382-385`)]

A mod file that has the same relative path as a vanilla file runs once, in the vanilla slot, and it is the mod's file that runs. The vanilla file is added to the list first, the later duplicate is skipped, and the path resolves to the mod's copy. :cite[(`zombie/Lua/LuaManager.java:1200-1209`, `zombie/ZomboidFileSystem.java:382-385`, `zombie/ZomboidFileSystem.java:656-695`)]

Each mod's list covers both its `common` and its version folder, so one sort orders the files of the two together. :cite[(`zombie/Lua/LuaManager.java:1160-1196`)]

The mods themselves load in the order the game's mod list gives, and a mod that names another in `require=` is placed after it. :cite[(`zombie/ZomboidFileSystem.java:826-852`)] A `require=` that names a mod the game does not list leaves the requiring mod out too. :cite[(`zombie/ZomboidFileSystem.java:837-842`, `zombie/gameStates/ChooseGameInfo.java:661-686`)]

Name files so the order you need follows from the paths. A file in a folder called `A_Base/` runs before one in `B_Feature/`, and a file named `Main.lua` runs after `Base.lua`.

## 4. What else sits in these folders

**Translation files live under `media/lua/shared/Translate`, and the registries file is not in any of the three folders.**

The language loader reads `media/lua/shared/Translate` from a mod's `common` and from its version folder. :cite[(`zombie/core/Languages.java:43-50`)] The registries file is `media/registries.lua`, beside `lua/` and `scripts/`, and it runs before the script manager loads. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/GameWindow.java:208-210`)] See [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file).

## 5. Hooking an event

**Pass the function itself to `Add`, not the result of calling it.**

Vanilla does it this way: `Events.OnGameStart.Add(TopOfTheWorld.OnGameStart)`. :cite[(`media/lua/client/Challenge/TopOfTheWorld.lua:279`)] With parentheses the function runs at once and `Add` receives whatever it returned. The event list is in [The events system](/pz/build-42/modding/lua-api/the-events-system), and what Kahlua's `pcall` does is in [What Project Zomboid Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run. Not verified: the order the in-game mod list gives mods when none `require=` another (this page read only the `require=` rule), and the older page's claim that a guard such as `if object.method then` hides a wrong method name (it is advice, not engine behavior).
:::
