---
id: build-42-tools-setup
slug: tools-setup
title: Mapping tools setup
game: pz
version: build-42
section: mapping
category: fundamentals
difficulty: beginner
tags:
  - mapping-tools
  - worlded-setup
  - tiles-folder
  - pz-mapping-tools
excerpt: There are three things people call "the B42 tools". Use the first one.
last_updated: '2026-09-29'
---
# Mapping tools setup

> Source: 01-tools-setup.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## Which toolchain

There are three things people call "the B42 tools". Use the first one.

| Toolchain | Status |
|---|---|
| `Unjammer/PZ_Mapping_Tools` (PZTools Unofficial) | **Current, and what this guide documents.** Qt5 fork of Tim Baker's WorldEd/TileZed/BuildingEd `basements` branch, with B42 official changes merged in, tracking B42.20 game data. `[VERIFIED]` |
| **Mapping tools (Community Edition)** by Crater | A *direct* fork of the B42 official tools, merging some of Alree's work plus its own improvements. Viable alternative; **its `Map.png` color table differs** from Alree's. `[VERIFIED -- PZwiki]` |
| `B42.Mapping.Tools` with `config.exe` and a `TileD` folder | `[STALE]` -- the April 2025 layout. No `config.exe` exists in current builds. |

### Official tools status -- correction `[VERIFIED -- PZwiki, revised for 42.20.0]`

**The official Indie Stone B42 mapping tools have NOT been released.** They are a
public GitHub project that anyone can compile, and they are fully usable, but
there is no release build. The Indie Stone stated in the *NEXT STEPS 2* blog post
that WorldZed, TileZed and the AnimZed animation tool will be released after
42.20.0 stable has finished receiving hotfixes.

The wiki's guidance: use a community toolchain. Nothing about moving to the
official tools later is expected to cause serious problems.

An earlier note in this compilation implied the official tools were already
released because a color table labelled "Official Tools - B42 Colors" circulated
in the mapping channel on 2026-04-03. That table is for the compile-it-yourself
official tools, not a shipped release.

Latest release at time of writing: **`42.20STABLE_02c`, build `20260802`**
(published 2026-08-02), asset `PZ_Mapping_Tools_build20260802.zip`. `[VERIFIED]`

- Releases: https://github.com/Unjammer/PZ_Mapping_Tools/releases
- Repo + README: https://github.com/Unjammer/PZ_Mapping_Tools
- Tilesheets: `tilesheets_42.20.zip` (403 MB), attached to release `42.20STABLE_00`,
  also mirrored on Google Drive (link is repeated in each release body).

Tiles are **not** redistributed inside the tools archive. They are a separate
download. `[VERIFIED]`

---

## Install

1. Download the tools archive and the matching tilesheets archive.
2. Extract the tools **to a writable directory that is not inside any Steam
   folder**. `[COMMUNITY, and repeated by the official README]`
3. Extract the tilesheets, then move the resulting `Tiles` folder (with all its
   contents) into the tools root so `bin` and `Tiles` are siblings.
4. Run `bin\PZWorldEd.exe` (or `TileZed.exe` / `BuildingEd.exe`).
5. If it finds everything, it configures itself and starts. If not, the
   **PZTools Initial Setup** dialog appears -- point it at the release `config`
   directory and at your `Tiles` directory, and confirm once. All three
   applications immediately share those paths. `[VERIFIED -- README + PZToolsGuide]`

### Expected layout

```
PZTools/
  bin/            PZWorldEd.exe, TileZed.exe, BuildingEd.exe, Qt5*.dll, plugins
  config/         Rules.txt, Tilesets.txt, TileProperties.txt, TMXConfig.txt,
                  Building*.txt, LuaTools.txt
  docs/           packaged offline documentation
  lua/            TileZed / BuildingEd automation scripts
  plugins/        Tiled format plugins
  themes/         external QSS themes
  translations/
  settings/       created at runtime: PZTools.ini, per-app INIs, logs
  Tiles/          extracted game tiles (NOT shipped)
    1x/           optional
    2x/           optional
    custom/       optional
```

Rules that actually bite:

- **Do not move a single executable out of `bin`.** WorldEd's *Open in TileZed*
  looks for the sibling `TileZed.exe` by path, and Qt needs the DLL/plugin
  layout intact. `[VERIFIED]`
- **`config` is the catalog directory. `settings` is not.** Selecting `settings`
  as the configuration-catalog directory is the documented cause of "catalog
  changes seem to be ignored". `[VERIFIED]`
- Selecting `Tiles/1x`, `Tiles/2x` or `Tiles/custom` is normalized up to the
  parent `Tiles` automatically. A `1x` directory is not required -- a 2x-only
  install works. `[VERIFIED]`
- Logs are in `settings/logs`, not in your user profile. `[VERIFIED]`

### Updating

Install every new version into a **new, separate folder**. Do not extract over an
existing install and do not overwrite an older version. `[COMMUNITY -- explicit
in the July 2026 install guide]`

If the `Tiles` directory moves later, use **Change Shared Paths** from WorldEd or
TileZed; BuildingEd reads the same shared setting. Restart open editors after
changing a shared path so catalogs reload. `[VERIFIED]`

---

## What the April 2025 guide told you to do -- and what replaces it

| 2025 step | Now |
|---|---|
| Run `config.exe` in the `TileD` folder | `[STALE]` No `config.exe`. First-run setup dialog handles it. |
| Set TileZed *Edit > Preferences > Unofficial Settings* tiles path | `[STALE]` Paths are shared via `settings/PZTools.ini`. |
| Point WorldEd preferences at the `TileD` folder | `[STALE]` Same -- shared paths. |
| Manually add `vegetation_foliage_01.png` and `vegetation_groundcover_01.png` as tilesets | `[STALE]` Current builds preload the whole catalog at startup and watch the Tiles directories for new PNGs. |
| "Tiles path must NOT end with `/Tiles/2x`" (caused red question marks) | Superseded -- `2x` is normalized to the parent now. Red question marks now mean an unresolvable tile reference; see [07-troubleshooting.md](/pz/build-42/mapping/troubleshooting/mapping-troubleshooting). |

Still true from 2025: **do not add B41 (2022-era) vanilla tiles to a B42 Tiles
folder, and do not modify the shipped ones.** `[COMMUNITY]`

---

## Startup cost is intentional

Current builds decode **every** catalog tileset image at startup and keep it
resident for the session, so palettes, building categories, Automapper and Lua
all see one complete stable catalog regardless of which map opened first.

The documented trade-off: startup can take tens of seconds and several GB of RAM
on a full 2x Tiles install. The progress dialog and `settings/logs` report
loaded / missing / unresolved counts. A missing or corrupt image gets an explicit
placeholder rather than a silently empty palette. `[VERIFIED]`

BuildingEd "appearing frozen" on first launch is this, not a hang. `[VERIFIED]`

---

## Optional quality-of-life settings

**World thumbnails in WorldEd**
`Edit > Preferences > General` -> check *Display map thumbnail images in world view*.
Skip it if low on disk or RAM. `[COMMUNITY]`
Thumbnail generation is now modeless and event-driven -- the GUI no longer
appears frozen while it runs. `[VERIFIED -- 20260730 changelog]`

**See surrounding cells in TileZed**
`Edit > Preferences > Zomboid` -> `+` -> add your world `.pzw` -> enable
*Show adjacent maps*. Close and reopen TileZed, then reopen the cell.
`[COMMUNITY]`

**Themes**
Drop a `.qss` into `themes/` and restart. QSS changes widget styling only -- never
tile images, map colors, or project data. Each app remembers its own selection.
`[VERIFIED]`

**Reset a broken panel layout**
Close the app -> back up its INI in `settings/` -> remove only the layout/window
groups (or rename the INI) -> restart and re-arrange. Shared paths live in
`PZTools.ini` and survive. `[VERIFIED]`

---

## Sample project and mod skeleton

A ready-made example project + mod pair (map placed where the Rosewood fire
station is) is published at:
https://github.com/pzmapping/Sample-Mod-and-Project- `[COMMUNITY]`

Copy `MyMapMod` straight into `%USERPROFILE%\Zomboid\mods` to test. The value of
the sample is that you can export lots and `objects.lua` **directly into**
`MyMapMod\common\media\maps\MyMap`, so testing is a single folder copy.

WorldEd can also do this for you now: `File > Export Complete Mod (8x8)...`
builds the whole mod tree in one action. See [06-mod-packaging.md](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps).
`[VERIFIED]`
