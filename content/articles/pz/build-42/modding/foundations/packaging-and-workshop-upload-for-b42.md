---
id: build-42-packaging-and-workshop-upload-for-b42
slug: packaging-and-workshop-upload-for-b42
title: Packaging and Workshop upload for B42
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
  [CONFIRMED] Workflow (in-game uploader path), corroborated by pzwiki Mod
  structure, Uploading mods, and Workshop.txt:
last_updated: '2026-10-04'
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
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# Packaging and Workshop upload for B42

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** Workflow (in-game uploader path), corroborated by pzwiki *Mod structure*, *Uploading mods*, and *Workshop.txt*:

1. **Develop under `Zomboid/Workshop/`.** Your mod lives at `Zomboid/Workshop/<ItemName>/Contents/mods/YourMod/...` in the versioned layout (Section 3). Only the `Contents/` subtree is uploaded; anything at the `<ItemName>/` level beside `Contents/` (a `.git` folder, `.vscode`/`.idea`, `README.md`, raw assets) is **ignored by the game and not uploaded** -- so that folder can double as your git repo. **[CONFIRMED]** (pzwiki *Mod structure* rev 1443271)
2. **`workshop.txt`** sits at the Workshop-item root (beside `Contents/`). **You do not create it by hand -- the in-game uploader generates it.** **[CONFIRMED]** (pzwiki *Workshop.txt* rev 1395233)
3. **`preview.png`** at the item root is the Steam Workshop preview image. The game's uploader checks it: it must be a **square PNG, 256x256 or 512x512, and at most 1000 KB**. (The game's own error text says "exactly 256x256", but the check accepts 512 too.) This is distinct from each mod's `poster.png` (the in-menu preview inside the version folder).

> **Proof:** Code. `zombie.core.znet.SteamWorkshopItem#validatePreviewImage` (square, width 256 or 512, at most 1,024,000 bytes, readable PNG). Build 42.20 (revision a2947723ca).

4. **Upload via the in-game uploader:** main menu -> **Workshop** menu -> **"Create and update items."** It lists every valid mod in your Workshop folder; you set title, description, tags, visibility, and a patch note, then "Upload to Steam Workshop now!" If no Workshop ID is set it offers to create a new item or reuse an existing one. **[CONFIRMED]** (pzwiki *Uploading mods* rev 1442321)
5. **Alternative uploaders [CONFIRMED]:** **SteamCMD** (official CLI, uses a build-config file, most control), **SteamChangePreview** (non-square / higher-res / animated preview images), and the **Steam Uploader** project (update description/preview/content independently). (pzwiki *Uploading mods*, *SteamCMD* rev in cache.)

### `workshop.txt` keys **[CONFIRMED]** (upgraded from LIKELY -- pzwiki *Workshop.txt* rev 1395233)

| Key | Meaning |
|-----|---------|
| `version` | File-reader version. **Keep at `1`.** |
| `id` | The **Workshop ID** of the mod. Set it to update an existing item you own/contribute to; remove the field to create a brand-new Workshop item. |
| `title` | Steam Workshop page title. |
| `description` | Steam Workshop page description. Each new line needs the parameter again (awkward -- the in-game description editor is easier). |
| `tags` | Workshop tags (predefined by the PZ Workshop). |
| `visibility` | `0` public (default), `1` friends-only, `2` private/hidden, `3` unlisted. |

> **Description overwrite warning [CONFIRMED]:** the in-game uploader **overwrites the entire Workshop description** with whatever is in `workshop.txt` / the uploader field. Copy your Steam description before uploading, and when re-copying it back, strip the trailing `Workshop ID:` / `Mod ID:` lines or you will duplicate them. (pzwiki *Workshop.txt*, *Uploading mods*.)

**B42-specific packaging notes:**
- Ship the **versioned layout** (`common/` + `42/`) so B42 clients find the `42/` build folder + `mod.info`. Uploading a flat B41-shaped mod is what causes the silent-install/world-load failure for B42 subscribers (Section 2). **[CONFIRMED]**
- To support both builds from one item, keep the flat B41 `media/` alongside `common/` + `42/` (Section 3/4). **[CONFIRMED]**
- The **Mod ID** (`id` in `mod.info`) is what consumers put in server configs; the **Workshop ID** is assigned by Steam. Document both. **[CONFIRMED]**

---

<a name="11-multiplayer"></a>

---

*Corrected 2026-10-04: the Workshop preview may be 256x256 or 512x512, square, up to 1000 KB; 256x256 is not the only size accepted.*
