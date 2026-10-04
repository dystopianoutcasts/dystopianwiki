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
  Within media/lua/ the three subfolders load in a defined order. The three
  folders (shared, client, server) are confirmed present in the B42 structure by
  pzwiki Mod structure (rev 1443271); the...
last_updated: '2026-10-04'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - in-game-debug-mode-and-dev-tools
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# Lua folder load order (shared -> client -> server)

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Within `media/lua/` the three subfolders load in a defined order. The three folders (`shared`, `client`, `server`) are confirmed present in the B42 structure by pzwiki *Mod structure* (rev 1443271); the ordering below is the long-established engine behavior (pzwiki defers the full ordering detail to *Lua (API)#Load order*, which is outside this cache).

1. **`lua/shared/`** -- loaded **first**. Logic used by both client and server (data tables, utility functions, constants). Translation files live under `lua/shared/Translate`. **[CONFIRMED folder; ordering per general knowledge]**
2. **`lua/client/`** -- loaded after shared. UI, context menus, timed actions, anything client-side/visual. **[CONFIRMED folder]**
3. **`lua/server/`** -- loaded **only when a game/world actually starts** (not at main menu). In multiplayer it loads on the server **and on every connected client**: the folder name sets *when* the code loads, not which side runs it. Code that must run only on the server says so itself, typically with `if isClient() then return end` at the top of the file. See [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

> **Proof:** Code. `zombie.gameStates.GameLoadingState` calls `LuaManager.LoadDirBase("server")` with no `GameClient.client` guard; `zombie.network.GameServer` calls it on a dedicated server. Build 42.21.0 (revision 4a0e9546ec).

Consequences for structure:
- Put shared helpers in `shared/` so both sides see them.
- Do not rely on `server/` code existing at the main menu -- it is not loaded until a world starts.
- **`registries.lua` loads before all three of these and before scripts.** **[CONFIRMED]** (pzwiki *Registries* rev 1392729.)

**Event binding basics [CONFIRMED]:** hook callbacks with `Events.EventName.Add(functionReference)`. Pass the *bare reference* -- `Events.OnGameStart.Add(onGameStart)`, **not** `Events.OnGameStart.Add(onGameStart())` (the parentheses call it immediately and register `nil`). Deeper event coverage is in `03_LUA_API_AND_ENGINE.md`.

> **AI-code caution from the wiki [CONFIRMED]** (pzwiki *Getting started with modding* rev 1442457): guarding a call with `if object.someMethod then ...` to "make sure it exists" is an anti-pattern -- a valid Java-object instance always has its real methods, so the guard just silently masks a hallucinated method name that will never run. Likewise `pcall` is abnormal in the PZ Lua environment (red errors still throw); its presence is a tell of AI-generated code. Verify method names against the JavaDocs/decompiled code instead.

---

<a name="8-debug"></a>

---

*Corrected 2026-10-04: media/lua/server/ loads on a multiplayer client too, at world load; the folder sets when code loads, not which side runs it.*
