---
id: build-42-tl-dr-what-a-b41-modder-must-change-first
slug: tl-dr-what-a-b41-modder-must-change-first
title: 'TL;DR: what a B41 modder must change first'
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
excerpt: 'The five highest-impact things for a modder getting B42-stable ready:'
last_updated: '2026-09-29'
related_articles:
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
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# TL;DR: what a B41 modder must change first

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The five highest-impact things for a modder getting B42-stable ready:

1. **The folder layout is versioned now.** A B42 mod requires a `common/` folder (mandatory, even if empty) plus one or more **build-version folders** named after the game version -- `42/`, `42.1/`, `42.1.5/`, etc. -- each holding that version's `mod.info` + `poster.png` and its build-specific `media/`. A flat B41 `media/` + root `mod.info` is the *old* single-build shape. **B41 support is NOT a `41/` version folder** -- it is the old flat `media/` folder living alongside `common/` + `42/` in the same mod (they don't clash because B42 sits one level deeper). **[CONFIRMED]** (pzwiki *Mod structure* rev 1443271) See [Section 3](/pz/build-42/modding/foundations/foundations-and-toolchain) and [Section 4](/pz/build-42/modding/foundations/foundations-and-toolchain).
2. **Steam silently installs B41 mods onto B42, and they fail at world load.** A subscribed B41-only mod appears installed but produces script/Lua load errors; the classic symptom is *"World loading could not proceed, there are script load errors."* This is the single most important failure mode to internalize. **[CONFIRMED]** See [Section 2](/pz/build-42/modding/foundations/foundations-and-toolchain) and [Section 5](/pz/build-42/modding/foundations/foundations-and-toolchain).
3. **`media/registries.lua` is a new file, loaded before ALL other Lua and scripts.** Custom identifiers (traits, professions, item tags, moodle types, etc.) must be registered here or downstream scripts will not find them. Introduced in Build **42.13.0**. **[CONFIRMED]** (pzwiki *Registries* rev 1392729) See [Section 6](/pz/build-42/modding/foundations/foundations-and-toolchain).
4. **The crafting system was replaced.** B41 `recipe` blocks do not carry over unchanged; B42 uses a new `craftRecipe` model. This is a scripting-layer break -- covered in depth in `02_SCRIPTING_ITEMS_AND_CRAFTING.md` -- but it is called out here because it is the most common *silent* porting failure. **[CONFIRMED]** See [Section 12](/pz/build-42/modding/foundations/foundations-and-toolchain).
5. **Server `Mods=` formatting changed.** B42 servers expect a backslash-prefixed format per Mod ID on the `Mods=` line; using B41 format on a B42 server (or vice versa) is a top cause of "mods not loading." **[CONFIRMED via hosting KBs; pzwiki cache is silent on server config -- verify against a generated server .ini]** See [Section 11](/pz/build-42/modding/foundations/foundations-and-toolchain).

---

<a name="2-status"></a>
