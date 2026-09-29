---
id: build-42-the-versioned-layout-common-build-folders
slug: the-versioned-layout-common-build-folders
title: 'The versioned layout: common + build folders'
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
  The point of the versioned layout is one upload, multiple game versions, plus
  keeping bulky assets out of every version copy. [CONFIRMED] (pzwiki Mod
  structure rev 1443271)
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# The versioned layout: common + build folders (intermediate)

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The point of the versioned layout is **one upload, multiple game versions**, plus keeping bulky assets out of every version copy. **[CONFIRMED]** (pzwiki *Mod structure* rev 1443271)

### Version-folder naming rules **[CONFIRMED]**

Version folders are named after the game version. The naming resolves like this (pzwiki *Mod structure*, "Common and versioning folders"):

```
buildVersion.majorVersion.minorVersion  ==> treated as buildVersion.majorVersion
buildVersion.majorVersion               ==> buildVersion.majorVersion
buildVersion                            ==> buildVersion.0
```

**The minor version is ignored in folder naming** -- a folder named `42.1.5` is treated as `42.1`. Examples:

```
42     ==> 42.0
42.12  ==> 42.12
42.1   ==> 42.1
42.0.5 ==> 42.0
43.5.1 ==> 43.5
```

So a bare `42/` folder covers "game version 42.0 and up until a closer folder exists." Add `42.12/` (etc.) only when you need code that differs for that later version.

### How it resolves at load time **[CONFIRMED]** (pzwiki *Mod structure*)
- The game loads the **common folder first**.
- Then it loads the **closest version folder to the running game version**, which **overwrites** any same-path files present in `common`.
- The `mod.info` and code files (which "often change with the game version") belong in the version folder; large static assets belong in `common`.

Practical patterns:

| Goal | Layout | Notes |
|------|--------|-------|
| B42-only mod | `common/` (mandatory) + `42/media/...` + `42/mod.info` + `42/poster.png` | Simplest modern mod. **[CONFIRMED]** |
| B42 with a later-version override | add `42.12/` with only the files that differ | Closest folder to the running build wins and overwrites `common`. **[CONFIRMED]** |
| Dual-build (B41 + B42) from one upload | flat `media/` (B41) **plus** `common/` + `42/` (B42) | The B41 flat folder and B42 folders coexist without clashing. **[CONFIRMED]** |

**Gotcha:** because the crafting schema changed, a mod with crafting recipes usually cannot truly share recipe scripts between B41 and B42. For most B42-forward mods, the cleanest choice is a **B42-only** project (drop B41 support and skip the flat `media/`). **[LIKELY]**

---

<a name="5-modinfo"></a>
