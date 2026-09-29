---
id: build-42-debugging-lua-in-b42
slug: debugging-lua-in-b42
title: Debugging Lua in B42
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
  Enable debug mode: launch with the -debug flag (Steam launch options). Adds
  the debug menus, item spawner, and the Lua debugger. In debug mode you can
  also manually trigger a Lua reload from the...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
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
  - recommended-tooling
---
# Debugging Lua in B42  [CONFIRMED direction]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- **Enable debug mode:** launch with the `-debug` flag (Steam launch options). Adds the debug menus, item spawner, and the Lua debugger. In debug mode you can also **manually trigger a Lua reload from the main menu** (the same path that re-runs shared+client load). **[CONFIRMED reload path — pzwiki Lua (API), revid 1390433]**
- **`print(...)`** output goes to the in-game console (debug mode) and to the **`console.txt`** file. Errors show a stack trace — read the top frame for the offending `nil` call. Keep prints out of hot loops (perf + huge log files). **[CONFIRMED — pzwiki Lua (language), revid 1390437]**
- **Porting workflow:** run the old mod in `-debug`, collect every `attempt to call nil` / `attempt to index nil`, and remap each against current LuaDocs/JavaDocs (this is how you discover the ~42.17 renames in practice — there is no published master list).
- **MP debugging:** remember `client/` code never runs on a dedicated server ([Section 4](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)); a handler that "does nothing" on a server may simply be in the wrong folder. Use `isClient()`/`isServer()` guards to reason about where code runs.

---

<a name="16-tooling"></a>
