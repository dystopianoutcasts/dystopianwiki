---
id: build-42-the-b42-mod-project-structure
slug: the-b42-mod-project-structure
title: The B42 mod PROJECT STRUCTURE
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
  A modern B42 mod is a versioned project. Local mods are recognized in two
  cache-folder locations, each with its own rules [CONFIRMED] (pzwiki Mod
  structure rev 1443271): Zomboid/mods/ -- for...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
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
# The B42 mod PROJECT STRUCTURE (basics)

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A modern B42 mod is a **versioned project**. Local mods are recognized in two cache-folder locations, each with its own rules **[CONFIRMED]** (pzwiki *Mod structure* rev 1443271):
- **`Zomboid/mods/`** -- for installing mods manually without the Workshop. **Not recommended for mod development.**
- **`Zomboid/Workshop/`** -- the folder used for mod development and uploading to the Steam Workshop. Develop here.

> **Two-copies gotcha [CONFIRMED]:** a mod with the same **Mod ID** present in more than one recognized folder (e.g. the online Workshop download folder AND your dev copy) will clash and overwrite each other -- often silently swallowing changes you make. Do **not** stay subscribed to your own mod while developing it. Keep one local copy, in the `Workshop` folder.

The B42 Workshop-folder shape as documented by pzwiki:

```
Zomboid/
  Workshop/
    MyExampleMod/                    <- your dev/repo root (NOT uploaded, except Contents/)
      workshop.txt                   <- Workshop packaging manifest, auto-generated on upload (Sec 10)
      preview.png                    <- Steam Workshop preview image, 256x256 (Sec 10)
      Contents/                      <- ONLY this subtree is uploaded to the Workshop
        mods/
          MyMod1/                    <- the mod root the game reads
            common/                  <- MANDATORY, even if empty
              media/                 <- large shared files: models, textures, animations
            42/                      <- build-version folder for game version 42.0+
              media/                 <- build-specific code/assets (lua, scripts, ...)
                lua/
                  shared/
                  client/
                  server/
                scripts/
                textures/
              registries.lua         <- lives at media/registries.lua (see Sec 6)
              mod.info               <- B42 manifest for this version
              poster.png             <- in-menu preview
            42.1/                    <- OPTIONAL: another version folder if you need to diverge
              media/
              mod.info
              poster.png
          MyMod2/                    <- OPTIONAL: multiple mods can ship in one upload
```

**[CONFIRMED]** (pzwiki *Mod structure* rev 1443271: `common/` is "mandatory, mod won't be detected without it"; version folders `42/`, `42.1/`, `42.1.5/` each hold their own `mod.info` + `poster.png` + `media/`.)

> **Correction vs the original snippet research:** there is **no `41/` version folder** for B41 fallback. B41 support is the *old flat* `media/` folder at the mod root (see "Mixing B41 and B42" below), not a numbered version folder. The earlier "common / 42 / 41" mental model was wrong on the `41/` part. **[CONFIRMED]**

Key mental model **[CONFIRMED]** (pzwiki *Mod structure*):
- **`common/media/`** stores large files shared across all versions -- models, textures, animations -- to keep mod size down. It is **mandatory** (even empty) for the mod to be recognized.
- **`<version>/media/`** (e.g. `42/media/`) holds code files and assets that change with the game version. `mod.info` also belongs here (best kept in version folders, not `common`).
- The game loads **`common/` first, then the closest version folder to the running build**, with the version folder overwriting any same-path files from `common`.
- "At least one versioning **or** a common folder is needed for the mod to be recognized in-game."

> **Where `registries.lua` lives:** at `media/registries.lua` -- i.e. inside a version folder's `media/` (or `common/media/`). It must have that exact name and sits at the top of `media/`, beside `lua/` and `scripts/`, not inside them. **[CONFIRMED]** (pzwiki *Registries* rev 1392729) See [Section 6](/pz/build-42/modding/foundations/foundations-and-toolchain).

### B41 (old) shape and mixing B41 + B42

A pure B41 mod is flat: `mod.info` at the mod root and a single `media/` subdirectory (`media/lua/...`, `media/scripts/...`) -- no `common/`, no version folders. **[CONFIRMED]** (pzwiki *Mod structure*, "Build 41" section.) That shape still *loads* on B41 but is not the B42 layout; on B42 a flat mod with no build folder is a prime candidate for the silent-fail in Section 2.

You can serve **both builds from one mod folder** by keeping the B41 flat `media/` alongside the B42 `common/` + `42/`. They don't clash because the B42 structure is one folder deeper **[CONFIRMED]** (pzwiki *Mod structure*, "Mixing build 41 and 42"):

```
Contents/mods/MyMod1/
  media/        <- Build 41 (flat, old style)
  common/       <- Build 42
  42/           <- Build 42
```

---

<a name="4-multiversion"></a>
