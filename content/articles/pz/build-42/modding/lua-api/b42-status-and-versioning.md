---
id: build-42-b42-status-and-versioning
slug: b42-status-and-versioning
title: B42 status and versioning
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
  Stable release: Build 42.20 hit the public branch 2026-07-29. [CONFIRMED] The
  42.x unstable line ran for well over a year (42.0 late 2024 -> 42.19), with
  frequent modding-API churn. 42.20 was...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
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
# B42 status and versioning

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- **Stable release:** Build **42.20** hit the public branch **2026-07-29**. **[CONFIRMED]**
- The 42.x unstable line ran for well over a year (42.0 late 2024 -> 42.19), with frequent modding-API churn. 42.20 was explicitly positioned as the "candidate with fewer modding-breaking changes." **[CONFIRMED]**
- **Map:** roughly 2x the B41 map, reworked regions, and **~400 procedurally generated basements**. **[CONFIRMED]**
- **Save compatibility:** B41 worlds are NOT loadable in B42; B42 generates fresh worlds. B41 saves are not deleted (recoverable if you roll back before overwrite). **[CONFIRMED]**
- **Mod compatibility reality:** a mod downloading successfully != compatibility. B41 mods installed onto B42 fail at runtime. **[CONFIRMED]**
- **Lua runtime:** PZ runs a Java implementation of **Lua 5.1 called Kahlua**, with a few differences from stock Lua 5.1. This is unchanged in B42 and is the basis for the Java<->Lua bridge. **[CONFIRMED — pzwiki Lua (API), revid 1390433; Lua (language), revid 1390437]**

**Practical takeaway for a modder getting "B42-stable ready":** target 42.20, adopt the versioned folder layout with a `42/mod.info`, migrate recipes to `craftRecipe`, add a `media/registries.lua` if you define new identifiers, and move authoritative state changes to the server with explicit sync (point 4 above).

---

<a name="3-folder-model"></a>
