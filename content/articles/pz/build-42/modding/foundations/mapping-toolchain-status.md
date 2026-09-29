---
id: build-42-mapping-toolchain-status
slug: mapping-toolchain-status
title: Mapping toolchain status
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
excerpt: 'Status as of 2026-07-29: WIP for official release; compilable now. [CONFIRMED]'
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
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# Mapping toolchain status (TileZed / WorldEd / WorldZed)

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Status as of 2026-07-29: WIP for official release; compilable now. [CONFIRMED]**

- **No official B42 release of the mapping tools yet.** The Indie Stone's stated plan: once 42.20 hot-fixing settles, the **latest mapping tools (WorldZed, TileZed, etc.) will be released** as part of the post-stable rollout / the "Build 42 Support Update" running through the rest of 2026. **[CONFIRMED]**
- **They are usable today by compiling from source.** The tools are a public GitHub project; anyone can compile them and they are "fully usable to make maps" for B42 right now, ahead of the official binary release. **[CONFIRMED]**
- **You need the B42 tilesheets + tiledefs to render correctly.** Some tilesheets are packed inside the game's `texturepacks` and must be **unpacked** (via the Project Zomboid Modding Tools) before a project will render properly in WorldEd/TileZed. **[CONFIRMED]** (pzwiki *Mod structure* rev 1443271 documents the `texturepacks` media subfolder that "holds the tile sprites that you will need to unpack.")
- **Reference project:** `Unjammer/PZ_Vanilla_map_b42` on GitHub exports the B42 vanilla map back into a WorldEd/TileZed-editable project -- useful as a working B42 map project to learn the pipeline. **[CONFIRMED]**
- **Map-mod media folders [CONFIRMED]** (pzwiki *Mod structure*): map assets go under `media/maps`; the map itself is defined by a `map.info` file. See the pzwiki *Mapping*, *Tiledefs used by mods*, *Adding new tiles*, *Room definitions and item spawns*, and *Vehicle zones* pages (not in this cache) for depth.

**Tile load order (map/tile mods) [LIKELY -- from prior research; not in this pzwiki cache]:** recommended dependency order is **Maps -> Tile Packs -> Framework/Character mods -> Vehicle mods -> Everything else.** Tile packs must load *before* the maps that depend on them.

**Takeaway for a B42-stable modder:** if your work is *code/item/crafting* modding, the toolchain is ready. If your work is *map* modding, budget for compiling the tools from source (or wait for the official binaries) and for unpacking B42 tilesheets. Track the official release announcement.

---

<a name="10-packaging"></a>
