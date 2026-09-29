---
id: build-42-registries-lua-the-new-b42-13-identifier-system
slug: registries-lua-the-new-b42-13-identifier-system
title: 'registries.lua: the new B42.13 identifier system'
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
  What changed: In 42.13.0, The Indie Stone introduced a formal identifier +
  registry system for script elements. This is significant enough that an
  official Modding Migration Guide (42.13) exists...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
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
# registries.lua: the new B42.13 identifier system  [CONFIRMED it exists / API UNCERTAIN]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What changed:** In **42.13.0**, The Indie Stone introduced a formal **identifier + registry system** for script elements. This is significant enough that an official **Modding Migration Guide (42.13)** exists on the Indie Stone forums (with a `testmod_registries.zip` example and a Migration Guide PDF).

**How it works (from accessible snippets):**
- Identifiers are declared in a file that **must** be named exactly **`media/registries.lua`** (directly under `media/`, NOT under `media/lua/`). **[LIKELY — name + location from community snippets; the pzwiki cache used here does not include the Registries page]**
- This file is **loaded before all other Lua files and scripts**, making it the correct place for identifier registration and early init. **[LIKELY]**
- The recommended pattern: a module in `media/lua/shared/` (uniquely named to your mod) that **returns a global table populated by `media/registries.lua`**. So `registries.lua` fills a registry, and your shared module exposes it. **[LIKELY]**

**Why it matters:** if your mod defines new script identifiers (items, recipes, fluids, animal defs, etc.), B42.13+ expects them registered here so the engine's registry can resolve them consistently across client/server and across the multi-build layout.

> **[UNCERTAIN]** The exact registration function signatures (what you call inside `registries.lua`) were not recoverable from the pzwiki cache used for this enrichment (the cache covers Lua (API), events, ModData, networking, timed actions, derive, and typing — not the Registries page). The authoritative example is the `testmod_registries.zip` attached to the 42.13 migration guide on the Indie Stone forums (download in a browser). Confirm the API there, and/or fetch the pzwiki `Registries` page into the cache, before relying on it.

---

<a name="6-events"></a>
