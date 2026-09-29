---
id: build-42-b41-b42-porting-what-breaks-a-concrete-checklist
slug: b41-b42-porting-what-breaks-a-concrete-checklist
title: 'B41 -> B42 porting: what breaks + a concrete checklist'
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
  Decide scope: B42-only (recommended for crafting-heavy mods) or dual-build
  (keep flat media/ beside common/ + 42/). [CONFIRMED layout] Restructure
  folders: create common/ (mandatory, even if...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
---
# B41 -> B42 porting: what breaks + a concrete checklist

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### What breaks (foundation/toolchain layer)

| Area | B41 | B42 | Severity |
|------|-----|-----|----------|
| Folder layout | flat `mod.info` + `media/` | `common/` (mandatory) + `42/` build folder with `mod.info` + build `media/` | **Breaking** -- no B42 build folder -> silent world-load fail. **[CONFIRMED]** |
| Identifiers | none | `media/registries.lua`, loaded before all Lua + scripts; `.register("mod:id")` per type | **Breaking** for custom traits/professions/tags/moodles/ammo/etc. **[CONFIRMED]** |
| Crafting | `recipe` blocks | new `craftRecipe` model (see `02_SCRIPTING_ITEMS_AND_CRAFTING.md`) | **Breaking** -- old recipes silently fail or error. **[CONFIRMED]** |
| MP authority | client ran inventory/timed actions | server runs inventory + all timed actions; anti-cheat | **Breaking** for client-trusted mods. **[CONFIRMED]** |
| Server config | `Mods=` plain IDs | `Mods=` backslash-prefixed IDs | **Breaking** for server lists. **[CONFIRMED via hosting KBs]** |
| Tiles/maps | old tiledefs | tiledefs valid but tools/tilesheets differ; unpack B42 `texturepacks` | **Partial** -- re-verify tiledef numbers (<8190). **[LIKELY]** |
| Saves | B41 saves | incompatible; also 42.19 -> 42.20 incompatible | **Breaking** for anything reading save data. **[CONFIRMED]** |

### Concrete porting checklist

1. **Decide scope:** B42-only (recommended for crafting-heavy mods) or dual-build (keep flat `media/` beside `common/` + `42/`). **[CONFIRMED layout]**
2. **Restructure folders:** create `common/` (mandatory, even if empty) for large static assets; create a `42/` build folder holding `media/` (lua, scripts, ...), `mod.info`, and `poster.png`. For dual-build, keep the old flat `media/` at the mod root. **[CONFIRMED]**
3. **Update `mod.info`:** confirm lowercase `id`, `name`, `description`, `poster`, `icon`, `author`, `require`; add game-version min/max fields; place `mod.info` in the version folder. **[CONFIRMED]**
4. **Create `media/registries.lua`** if the mod adds any custom identifiers, and port B41 registration logic to `.register("mod:id")` calls for the matching type (CharacterTrait, CharacterProfession, ItemTag, MoodleType, AmmoType, etc.). Reference the string ID in scripts, the returned object in Lua. **[CONFIRMED]**
5. **Rewrite crafting:** convert every B41 `recipe` block to the B42 `craftRecipe` schema (per `02_SCRIPTING_ITEMS_AND_CRAFTING.md`). This is where most silent failures hide. **[CONFIRMED]**
6. **Audit event bindings:** ensure `Events.X.Add(func)` uses bare references; remove any `if object.method then` guards or `pcall` wrappers that mask missing methods; confirm renamed/removed events (see `03_LUA_API_AND_ENGINE.md`). **[CONFIRMED]**
7. **Make MP-safe:** move inventory mutations and timed actions to be server-authoritative; route item grants / teleports / combat effects through server commands so anti-cheat does not reject them. **[CONFIRMED]**
8. **Fix server config:** rewrite `Mods=` to the B42 backslash format; verify `WorkshopItems=` uses Workshop IDs; order dependencies first. **[CONFIRMED via hosting KBs]**
9. **Test with `-debug`:** launch with `-debug`, load a **fresh** world, watch the bug icon (green = active), and read `console.txt` for named script/Lua load errors; fix until clean. Use F11 hot reloading to iterate. **[CONFIRMED]**
10. **Repackage + upload:** stage the versioned layout under `Zomboid/Workshop/<Item>/Contents/mods/...`, let the in-game uploader generate `workshop.txt`, add a 256x256 `preview.png`, and push via **Workshop -> "Create and update items."** **[CONFIRMED]**

---

<a name="13-gaps"></a>
