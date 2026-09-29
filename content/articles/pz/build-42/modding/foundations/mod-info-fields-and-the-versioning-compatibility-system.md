---
id: build-42-mod-info-fields-and-the-versioning-compatibility-system
slug: mod-info-fields-and-the-versioning-compatibility-system
title: mod.info fields and the versioning/compatibility system
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
  mod.info is a plain-text key=value file with a .info extension. It is the root
  descriptor of your mod and can be edited in any text editor. It is best kept
  in the version folder(s) (it works in...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# mod.info fields and the versioning/compatibility system

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`mod.info` is a plain-text `key=value` file with a `.info` extension. It is the root descriptor of your mod and can be edited in any text editor. **It is best kept in the version folder(s)** (it works in `common` too, but versioning-folder placement is recommended because it changes with game versions). **[CONFIRMED]** (pzwiki *Mod.info* rev 1363935, page version 42.17.0)

Two casing/naming cautions from the wiki **[CONFIRMED]**:
- **Name the file fully lowercase** (`mod.info`) for Linux/macOS compatibility.
- Make sure there is no hidden `.txt` extension (`mod.info.txt` will not be recognized).

### Core fields **[CONFIRMED]** (canonical example, pzwiki *Mod.info*)

The wiki's canonical example -- all keys are **lowercase**:

```
name=My amazing mod !
id=myAmazingModID
author=an amazing modder!
description=Hello World !
poster=preview.png
icon=icon.png
require=otherModID,anotherModID
```

| Field | Purpose |
|-------|---------|
| `id` | Unique mod identifier. This is the value that goes in a server's `Mods=` line. **It is NOT the Steam Workshop ID.** (`id` and `name` are the minimum recommended fields.) |
| `name` | Display name shown in the in-game mods list. |
| `description` | Short text shown in the mods menu. |
| `poster` | Preview image filename (a PNG beside `mod.info`, e.g. `poster.png`). Shown as the mod preview in the manager. |
| `icon` | Icon image filename (PNG) for the mod. |
| `author` | Your name/handle. (Singular `author` is what the canonical example uses; a plural `authors` was in earlier snippet research and is **not** attested on the wiki -- prefer `author`.) |
| `require` | Comma-separated id(s) of other mods yours depends on. Load order must place the dependency first. |

> **Note:** the pzwiki `mod.info` page states all parameters are technically optional but that omitting some can break your mod, and it defers the *full* parameter list to the external ScriptsDocs (`pz-wiki-modding.github.io/PZ-API-Docs/scripts/root-modinfo.html`). The core set above is what the wiki example ships. **[CONFIRMED for the listed fields]**

### Version / compatibility fields **[CONFIRMED existence; exact keys via ScriptsDocs]**

The in-game **mod manager** displays, per mod: status, version, author, homepage, mod link, mod ID, Workshop ID, **minimum and maximum game version**, dependencies, and incompatibilities. **[CONFIRMED]** (pzwiki *Mods* rev 1391047, "Mod manager".) That confirms min/max game-version and mod-version fields **exist and drive the manager UI**; the precise key spellings (commonly `versionMin` / `versionMax` / `modversion`) are documented in ScriptsDocs rather than the wiki page and should be confirmed there or against a real B42 `mod.info`.

| Field (likely spelling) | Purpose |
|-------|---------|
| `versionMin` | Minimum game version; shown as the "minimum game version" in the manager. **[CONFIRMED it exists; spelling via ScriptsDocs]** |
| `versionMax` | Maximum compatible game version; shown as "maximum game version." **[CONFIRMED it exists; spelling via ScriptsDocs]** |
| `modversion` / `modVersion` | Your mod's own version string (shown as "version"). **[LIKELY]** |
| `pack` / `tiledef` | Tile/asset-pack grouping and custom tiledef declarations for map mods. **[LIKELY -- not on the pzwiki mod.info page; see Section 9 and Gaps]** |
| `url` / `tags` | Optional metadata (homepage link, filter tags). **[LIKELY]** |

> **The two IDs that trip everyone up [CONFIRMED]:**
> - **Mod ID** = the `id` field in `mod.info`. Goes in the server `Mods=` line.
> - **Workshop ID** = the numeric ID Steam assigns on upload (in the Workshop URL). Goes in the server `WorkshopItems=` line, and is the `id` field in `workshop.txt`.
> They are different values. On upload, the game appends both to the Workshop description as `Workshop ID: <n>` and `Mod ID: <id>`. **[CONFIRMED]** (pzwiki *Uploading mods* rev 1442321)

### How versioning drives compatibility

- The **build-version folder** (`42/`, `42.1/`, ...) is the *primary* compatibility switch -- it decides which `mod.info` and which build-specific `media/` the game reads, and it loads on top of `common/`. **[CONFIRMED]**
- `versionMin`/`versionMax` are a *secondary*, softer signal shown to the player in the manager. A B41-only mod with no B42 build folder is what produces the silent world-load failure in Section 2 -- the game has no B42 build folder to read and still tries to parse B41-shaped scripts. **[LIKELY]**

### Tiledefs and tile-pack numbering (map/tile mods) **[CONFIRMED -- from prior research; not in this pzwiki cache]**

Tiledefs are uniquely numbered packs of sprites (walls, furniture, models). Numbering:
- **0-99** reserved for the developers (as of ~41.74).
- **100-16382** available to modders. Values **above ~8190 allegedly produce negative sprite IDs** -- stay below that ceiling.
Declare custom tiledefs and load tile packs *before* the maps that use them (Section 9). The dedicated pzwiki *Tiledefs used by mods* / *Adding new tiles* pages are not in this cache -- verify numbering there.

---

<a name="6-registries"></a>
