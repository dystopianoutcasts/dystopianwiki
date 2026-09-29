---
id: build-42-tl-dr-the-5-things-that-will-break-your-b41-mod
slug: tl-dr-the-5-things-that-will-break-your-b41-mod
title: 'TL;DR: the 5 things that will break your B41 mod'
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
excerpt: These are the highest-impact B41 -> B42 breakages. Details in Section 13.
last_updated: '2026-09-29'
related_articles:
  - b42-status-and-versioning
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
# TL;DR: the 5 things that will break your B41 mod

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

These are the highest-impact B41 -> B42 breakages. Details in [Section 13](/pz/build-42/modding/lua-api/lua-api-and-engine-overview).

1. **The mod folder layout changed.** B42 uses a **versioned** structure (`common/media/...` plus `42/mod.info`, optionally `41/mod.info`). A flat B41 `media/` + root `mod.info` still loads in many cases but is the old single-build shape. See [Section 3](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). **[CONFIRMED]**
2. **The crafting system was replaced.** The B41 `recipe` block does **not** carry over unchanged. B42 introduces `craftRecipe` with a different schema (inputs/outputs, fluids, workstation "tags"). Old recipe scripts frequently silently fail or error. See [Section 14](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). **[CONFIRMED]**
3. **A new identifier + registry system (`media/registries.lua`) landed in 42.13.** Scripts and identifiers are now registered through this file, loaded before all other Lua. There is an official migration guide specifically because "the identifier and registry system changed underneath" mod authors. See [Section 5](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). **[CONFIRMED that it exists; exact API UNCERTAIN — pzwiki cache does not cover registries.lua internals]**
4. **Server now owns the authoritative logic; you must sync deliberately.** Since **Build 42.13.1**, the server side handles most of the logic for player damage, item stats, etc. You must SET these server-side and then call **sync functions** to push specifically what you changed. Code that mutated stats client-side in B41 will not stick. See [Section 9](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). **[CONFIRMED — pzwiki Networking, revid 1436101]**
5. **B41 worlds/saves are incompatible with B42**, and SteamCMD/Workshop will happily install B41-tagged mods onto a B42 server with no warning; failures only surface at world load or player connect. Strip mods, confirm vanilla, re-add in small batches. **[CONFIRMED]**

---

<a name="2-status"></a>
