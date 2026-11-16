---
id: build-42-lua-api-and-engine-overview
slug: lua-api-and-engine-overview
title: Lua API and engine reference
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
  Where Build 42.22 Lua comes from and a map of the Lua API pages: folders, events, globals, mod data, commands, timed actions, reloads, debugging and porting.
last_updated: '2026-11-16'
related_articles:
  - lua-load-order-and-the-three-lua-folders
  - the-b42-mod-folder-model
  - the-events-system
  - key-globals-and-classes
  - moddata
  - multiplayer-command-patterns
  - when-lua-reloads-leaving-a-game-and-resets
  - timed-actions
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua for Build 42 and want the map of the Lua API pages. Start with [the folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model) if you have not made a mod, or the [Lua gameplay mod recipe](/pz/build-42/modding/cookbook/lua-gameplay-mod) if you want a working one.

:::callout[The 1-minute version]{kind=key}
- Your Lua runs inside the game's own Lua interpreter, Kahlua, which the engine builds fresh each time Lua loads. The engine adds global functions, Java classes, an `Events` table and a `Hook` table to it.
- Lua lives in three folders: `shared`, `client` and `server`. `server` also loads on a multiplayer client, so server code that must stay on the server checks for itself.
- You react to the game by hooking events with `Events.X.Add(fn)`, and you keep data in mod data. Nothing syncs between a client and the server by itself; commands and mod data calls carry what you send.
- Leaving a game clears every handler and reloads Lua, and no event tells you the game is ending.
:::

:::facts
- **Global function names** 725
- **Events registered in Java** 263
- **Hooks** 8
- **Lua folders** 3
:::

## 1. How the engine gives Lua its world

**The engine builds a new Lua environment, then adds its functions, classes and event tables to it.**

`LuaManager.init` creates a Kahlua thread and environment, exposes the Java classes, and registers the `Events` and `Hook` tables. :cite[(`zombie/Lua/LuaManager.java:1087-1137`)] The global functions are the `@LuaMethod` methods of one class, and Lua calls them bare. :cite[(`zombie/Lua/LuaManager.java:3896-3904`)] The Java registers 263 events and 8 hooks. :cite[(`zombie/Lua/LuaEventManager.java:597-859`, `zombie/Lua/LuaHookManager.java:128-136`)]

Every reload builds the environment again, so nothing from the last one is left. :cite[(`zombie/Lua/LuaManager.java:1087-1119`)] [When your Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets) lists what causes one.

## 2. The pages in this section

**Each page covers one part of the Lua API.**

| Page | What it covers |
|---|---|
| [TL;DR: the 5 things that will break your B41 mod](/pz/build-42/modding/lua-api/tl-dr-the-5-things-that-will-break-your-b41-mod) | The porting breaks to fix first |
| [B42 status and versioning](/pz/build-42/modding/lua-api/b42-status-and-versioning) | Pointer to the status and compatibility page |
| [The B42 mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model) | `common/`, the version folder, `mod.info` and the server's `Mods=` line |
| [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders) | Which folder runs where, file order, `require`, guards |
| [registries.lua: the new B42.13 identifier system](/pz/build-42/modding/lua-api/registries-lua-the-new-b42-13-identifier-system) | Pointer to the registries page |
| [The Events system](/pz/build-42/modding/lua-api/the-events-system) | Hooking events, arguments, custom events |
| [Key globals and classes](/pz/build-42/modding/lua-api/key-globals-and-classes) | The common globals and exposed classes |
| [ModData](/pz/build-42/modding/lua-api/moddata) | Object and global mod data, saving and syncing |
| [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns) | Client and server commands and what the server checks |
| [Timed actions](/pz/build-42/modding/lua-api/timed-actions) | Actions with a duration, in Lua |
| [UI](/pz/build-42/modding/lua-api/ui) | Pointer to the UI pages |
| [Engine internals: calling exposed Java from Lua](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua) | How a Lua call reaches Java |
| [B41 -> B42 BREAKING CHANGES](/pz/build-42/modding/lua-api/b41-b42-breaking-changes) | The full list of breaking changes |
| [Hooks for new B42 systems](/pz/build-42/modding/lua-api/hooks-for-new-b42-systems) | Hooks and events of the newer systems |
| [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42) | Finding and fixing Lua errors |
| [Recommended tooling](/pz/build-42/modding/lua-api/recommended-tooling) | Editors and tools |

## 3. Where to start

**Pick the page that answers the question in front of you.**

- **"Which of my files run on the server?"** [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).
- **"How do I react when something happens?"** [The Events system](/pz/build-42/modding/lua-api/the-events-system).
- **"How do I keep a number across a save?"** [ModData](/pz/build-42/modding/lua-api/moddata).
- **"How do I ask the server to do something?"** [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns).
- **"My mod worked once and then every global was gone."** [When your Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. The 725 is a count of distinct names in the `@LuaMethod(... global = true)` annotations of `LuaManager.java`, and the 263 is a count of the `AddEvent("...")` calls in `AddEvents`. The 42.21 page was a table of contents for a 16-part document compiled from the community wiki; the one-line descriptions of the pointer pages and of pages outside this group are taken from those pages' titles and were not re-checked here.
:::
