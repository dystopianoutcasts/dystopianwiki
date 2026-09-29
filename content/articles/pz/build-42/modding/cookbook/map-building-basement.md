---
id: build-42-map-building-basement
slug: map-building-basement
title: 'Map, building, or basement'
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  What you build: custom map cells, buildings, and semi-procedural basements.
  This recipe is pointer-oriented: map creation is a tool-driven pipeline, not a
  copy-paste script.
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - vehicle-mod
  - workshop-verified-corrections
---
# Map, building, or basement

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** custom map cells, buildings, and semi-procedural basements. This recipe is **pointer-oriented**: map creation is a tool-driven pipeline, not a copy-paste script.

**Files + placement:** map assets under `42/media/maps/<YourMap>/` with a `map.info` file; tile sprites under `media/texturepacks` (must be unpacked); custom tiledefs declared in `mod.info`. [CONFIRMED -- doc 01 sec 9; doc 06]

**Workflow** [doc 06]:
1. Compile the mapping tools from source (WorldZed/TileZed/WorldEd) -- no official B42 binary release yet as of 42.20 (planned for the post-stable "Build 42 Support Update"). They are fully usable when compiled. [CONFIRMED]
2. Unpack B42 tilesheets from the game's `texturepacks` via the Project Zomboid Modding Tools so projects render. [CONFIRMED]
3. Author cells on a **300x300 authoring grid**; tools export to the shipped **256x256** cell size (empty border tiles). Spawnpoint math still uses `worldX*300+posX`. [CONFIRMED -- doc 06]
4. **Tiledef numbering:** 0-99 reserved for devs, 100-16382 for modders, but keep numbers **<=8190** (above yields negative sprite IDs). Numbers must be per-mod unique and declared in mod.info; duplicates throw a load error. [CONFIRMED -- doc 01/06]
5. **Basements** are semi-procedural: author a basement pool that the engine injects under eligible buildings at stream-in (multi-Z). [CONFIRMED -- doc 06]
6. **Load order:** Maps -> Tile Packs -> Framework -> Vehicles -> Everything else; tile packs must load before the maps that use them. [LIKELY]

**Gotchas.** Reference project: `Unjammer/PZ_Vanilla_map_b42` exports the vanilla map as a WorldEd/TileZed project. Windowless interiors are truly dark in B42's new lighting. Colored-light / advanced tile-property field names are a gap (wiki defers to external PZ-API-Docs).

**Deep reference:** doc 06 (`06_WORLD_MAP_BASEMENTS_TILES.md`) whole; doc 01 sec 9; `_raw_scriptsdocs/tile.txt`, `tileset.txt`, `tilegeometry.txt`.

---

<a name="23-vehicle"></a>
