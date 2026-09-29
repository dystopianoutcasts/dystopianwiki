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
  Lua API and engine reference, in 16 parts: TL;DR: the 5 things that will break
  your B41 mod, B42 status and versioning, The B42 mod folder model, Lua load
  order and the three lua folders...
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
  - debugging-lua-in-b42
  - recommended-tooling
---
# Lua API and engine reference

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

1. [TL;DR: the 5 things that will break your B41 mod](/pz/build-42/modding/lua-api/tl-dr-the-5-things-that-will-break-your-b41-mod)
2. [B42 status and versioning](/pz/build-42/modding/lua-api/b42-status-and-versioning)
3. [The B42 mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model)
4. [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders)
5. [registries.lua: the new B42.13 identifier system](/pz/build-42/modding/lua-api/registries-lua-the-new-b42-13-identifier-system)
6. [The Events system](/pz/build-42/modding/lua-api/the-events-system)
7. [Key globals and classes](/pz/build-42/modding/lua-api/key-globals-and-classes)
8. [ModData](/pz/build-42/modding/lua-api/moddata)
9. [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns)
10. [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
11. [UI](/pz/build-42/modding/lua-api/ui)
12. [Engine internals: calling exposed Java from Lua](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua)
13. [B41 -> B42 BREAKING CHANGES](/pz/build-42/modding/lua-api/b41-b42-breaking-changes)
14. [Hooks for new B42 systems](/pz/build-42/modding/lua-api/hooks-for-new-b42-systems)
15. [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42)
16. [Recommended tooling](/pz/build-42/modding/lua-api/recommended-tooling)
