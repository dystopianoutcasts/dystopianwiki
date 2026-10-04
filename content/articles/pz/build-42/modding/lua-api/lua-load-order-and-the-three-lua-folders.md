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
excerpt: 'Which folders load in which mode (canonical table from the wiki):'
last_updated: '2026-10-04'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - registries-lua-the-new-b42-13-identifier-system
  - the-events-system
  - key-globals-and-classes
  - moddata
  - multiplayer-command-patterns
  - timed-actions
  - ui
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# Lua load order and the three lua folders  [CONFIRMED — pzwiki Lua (API), revid 1390433]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Which folders load in which mode** (canonical table from the wiki):

| Folder | Singleplayer | MP client side | MP server side |
|---|:---:|:---:|:---:|
| `client` | yes | yes | **no** |
| `server` | yes | yes | yes |
| `shared` | yes | yes | yes |

So `client/` is the **only** folder that never executes on a dedicated server. Any authoritative or MP-relevant logic must live in `shared/` or `server/`. This did not change from B41 but remains the most common MP mistake. **[CONFIRMED]**

**Exact load sequence** (corrected — the wiki interleaves vanilla and mod files per stage, and `server/` is deferred until a save loads):

1. Shared — **vanilla** files
2. Shared — **mod** files
3. Client — **vanilla** files
4. Client — **mod** files

The `server/` subfolder is loaded **only when a save is actually launched** (not at the main menu); whenever Lua is loaded/reloaded, server files are unloaded until a save is loaded. When a save loads:

5. Server — **vanilla** files
6. Server — **mod** files

Within each stage the order **is alphabetical**, and we have the crash to prove it. The engine collects vanilla's files and sorts them by path, ignoring case; then, for each mod in turn, it collects that mod's files and sorts them the same way. So inside your mod, `shared/MyMod/A_Thing.lua` runs before `shared/MyMod/B_Thing.lua`, whatever depends on what. A file-scope call into a module whose file sorts later finds `nil`: one of our mods failed to load for every player because `OCP_Contract.lua` called into `OCP_Log` at file scope, and `OCP_Contract` sorts first. Never call into another file at file scope; resolve the dependency inside an event handler, or `require` it explicitly.

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase(String, boolean)` sorts each list with `Collections.sort(..., String.CASE_INSENSITIVE_ORDER)`, vanilla first, then each mod. Build 42.21.0 (revision 4a0e9546ec).

**A mod file with the same path as a vanilla file replaces it, and runs in vanilla's place.** The order above is a list of relative paths (`media/lua/client/ISUI/ISInventoryPane.lua`, for example), and each path runs once. When your mod ships a file at a path vanilla also has, the game runs your file instead of vanilla's, at vanilla's turn: early, among the vanilla files, before every other mod file. When your mod's own turn comes, that path has already run and is skipped. So an override file cannot rely on anything from other mods, or from vanilla files that sort after it, at file scope. The same goes for two mods shipping one path: only the copy from the mod loaded last runs, at the turn of the first one that has it.

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase(String, boolean)` (vanilla's relative paths, then each mod's, in one list; a `HashSet` named `done` runs each path once; each path is resolved with `ZomboidFileSystem#getAbsolutePath`); `zombie.ZomboidFileSystem#getAbsolutePath` (looks the path up in `activeFileMap`) and `#loadMod` (puts each mod file into `activeFileMap` over any earlier entry, logging `mod "<id>" overrides <path>`). Build 42.21.0 (revision 4a0e9546ec).

**Cross-mod load order** is controlled by the order of ids in `Mods=` (and the workshop load-order tools). If mod B depends on mod A's shared tables, A must load first. **[CONFIRMED]**

**Client/server/singleplayer guards.** The wiki documents a canonical way to skip a whole file (or block) based on environment — place at the very top of a file:
```lua
-- load only on server side or in singleplayer (skip on MP client)
if isClient() then return end

-- load only on client side or in singleplayer (skip on MP server)
if isServer() then return end

-- load only on MP client (not singleplayer)
if not isClient() then return end

-- load only on MP server (not singleplayer)
if not isServer() then return end

-- load only in singleplayer
if isClient() or isServer() then return end
```
`isSinglePlayer()` is not a built-in; the wiki's helper is `return not isClient() and not isServer()`. **[CONFIRMED — pzwiki Networking, revid 1436101]**

---

<a name="5-registries"></a>

---

*Corrected 2026-10-04: files load alphabetically within each lua folder (LoadDirBase sorts by path, ignoring case); this is confirmed, not uncertain.*

*Updated 2026-10-04: a mod file with the same path as a vanilla file replaces it and runs at vanilla's turn; the mod's own turn skips it.*
