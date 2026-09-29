---
id: build-42-recommended-tooling
slug: recommended-tooling
title: Recommended tooling
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
  Typing / language server (B42 canonical setup). PZ Lua is Lua 5.1; type
  annotations use LuaCATS syntax (---@type, ---@param, ---@return, ---@class,
  ---@field, and EmmyLua-only ---@namespace). Two...
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
---
# Recommended tooling  [CONFIRMED — pzwiki EmmyLua/LuaLs/Typing/JavaDocs]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Typing / language server (B42 canonical setup).** PZ Lua is **Lua 5.1**; type annotations use **LuaCATS** syntax (`---@type`, `---@param`, `---@return`, `---@class`, `---@field`, and EmmyLua-only `---@namespace`). Two extensions provide it:
- **EmmyLua** (by Tangzx) — **now the primary/recommended extension** the Umbrella stubs support. Supports LuaCATS + EmmyLua annotations. **[CONFIRMED — pzwiki EmmyLua, revid 1388079]**
- **LuaLs** (Lua Language Server by sumneko) — *formerly* the common choice; the wiki now steers modders to EmmyLua instead. Uses LuaCATS via addons. **[CONFIRMED correction — pzwiki LuaLs, revid 1390447]**

> **Correction to earlier tooling notes:** the previous doc leaned on demiurgeQuantified/PZEventStubs as the typing source. The pzwiki-canonical stub library is **Umbrella** (a collection of Lua type stubs generated from the game's Java), paired with EmmyLua. PZEventStubs/LuaDocs remain excellent for the *event catalog*, but Umbrella + EmmyLua is the wiki's recommended IDE setup. **[CONFIRMED — pzwiki EmmyLua/LuaLs, revids 1388079 / 1390447]**

**Canonical `.emmyrc.json`** (place at the VSCode workspace root; `$PZ_UMBRELLA` points at your local Umbrella install):
```json
{
    "$schema": "https://raw.githubusercontent.com/EmmyLuaLs/emmylua-analyzer-rust/refs/heads/main/crates/emmylua_code_analysis/resources/schema.json",
    "workspace": {
        "library": ["$PZ_UMBRELLA"],
        "workspaceRoots": ["Contents/mods/YourMod/42/media/lua"]
    },
    "runtime": {
        "requirePattern": ["shared/?.lua", "client/?.lua", "server/?.lua"],
        "version": "Lua5.1"
    },
    "diagnostics": {
        "disable": ["unnecessary-if"]
    }
}
```
Notes the wiki gives: set `version` to `Lua5.1`; the `requirePattern` mirrors how PZ resolves `require`; **disable `unnecessary-if`** because Java methods can return `nil` on the Lua side without the stub declaring it (so nil-checks the analyzer thinks are redundant are actually necessary, e.g. `getPlayer()` returning nil when the player is dead). **[CONFIRMED — pzwiki EmmyLua, revid 1388079]**

**JavaDocs (which version to use).** The **official** projectzomboid.com JavaDocs are still **Build 41.77** only. For B42 use:
- **Unofficial JavaDocs (Build 42)** — the wiki's recommended B42 reference.
- **geromet.github.io/PZJavaDocs** — alternative JavaDocs + source viewer, **Build 42.15**.
**[CONFIRMED — pzwiki JavaDocs, revid 1389757]**

**Event catalog / LuaDocs (community, still primary for signatures):**
- demiurgeQuantified **ProjectZomboidLuaDocs** + **PZEventStubs** / **PZEventDoc** — JavaDocs-style Lua API + 400+ event list (tracks 42.13).
- **Konijima/project-zomboid-studio** — mod scaffolding + Build/Watch.

**Registries migration:** Indie Stone forums **Modding Migration Guide (42.13)** + `testmod_registries.zip` (download via browser).

**Community libraries the pzwiki references** (fill gaps the raw API leaves): **Starlit Library** (cached Java-field access, custom events), **Umbrella** (typings), **Events Plus API** / **Doggy's Library** (custom events), **DOME** (reach file-local Lua objects). **[CONFIRMED referenced — pzwiki Lua (API)/Lua event, revids 1390433 / 1390441]**

---

<a name="17-gaps"></a>
