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
excerpt: 'B42 supports one upload serving multiple game builds. The versioned layout:'
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
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
# The B42 mod folder model (basics)  [CONFIRMED]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 supports **one upload serving multiple game builds**. The versioned layout:

```
MyMod/
├── common/                     # content identical across builds
│   └── media/
│       ├── lua/
│       │   ├── shared/         # loaded first (client + server)
│       │   ├── client/         # loaded after shared (UI, context menus, timed actions)
│       │   └── server/         # loaded only when a game/world actually starts
│       ├── scripts/            # item/recipe/etc .txt scripts
│       ├── textures/
│       └── registries.lua      # B42.13+ identifier registration (loads before all lua)
├── 42/
│   ├── mod.info                # build-42 manifest
│   ├── poster.png
│   └── media/                  # OPTIONAL build-42-specific overrides
└── 41/                         # OPTIONAL, only if still supporting B41
    ├── mod.info
    ├── poster.png
    └── media/
```

- The game loads **`common/` plus the folder matching the running build** (`42/`). So identical Lua/scripts/textures live once in `common/media/`, and only build-specific content forks into `41/media/` or `42/media/`. **[CONFIRMED]**
- A **single-build** mod can still use the older flat shape: `mod.info` at root, everything under `media/`. B42 accepts it but the multi-version shape is the forward-looking convention. **[CONFIRMED]**
- **Lua lives under `media/lua/` in exactly three subfolders** — `client/`, `server/`, `shared/`. Files with the **same relative path (to `lua/`) as a vanilla file overwrite it**; the same is true across mods, resolved by load order. The recommended safety trick is to nest your Lua inside a subfolder named after your mod (e.g. `media/lua/shared/MyMod/foo.lua`) so paths never clash. **[CONFIRMED — pzwiki Lua (API), revid 1390433]**

**Minimum `mod.info`:**
```
name=My Mod
id=MyMod
description=What it does.
poster=poster.png
author=You
```
The `id` is load-bearing: it must exactly match the server `Mods=` entry. **[CONFIRMED]**

**Server config note:** Both `WorkshopItems=` (which to download) and `Mods=` (which to actually load, in order) must be filled; the order in `Mods=` is the load order. **[CONFIRMED]**

---

<a name="4-load-order"></a>
