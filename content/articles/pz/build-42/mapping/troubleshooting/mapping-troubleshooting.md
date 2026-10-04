---
id: build-42-mapping-troubleshooting
slug: mapping-troubleshooting
title: Mapping troubleshooting
game: pz
version: build-42
section: mapping
category: troubleshooting
difficulty: intermediate
tags:
  - troubleshooting
  - known-failures
  - fixes
excerpt: >-
  Logs are in settings/logs inside the portable tools install -- not in your
  user profile. They record tileset loading, missing images, Building catalog
  loading, invalid PNG profiles, biomemap...
last_updated: '2026-09-29'
---
# Mapping troubleshooting

> Source: 07-troubleshooting.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Logs are in `settings/logs` inside the portable tools install -- **not** in your
user profile. They record tileset loading, missing images, Building catalog
loading, invalid PNG profiles, biomemap warnings and InGameMap geometry repairs.
`[VERIFIED]`

---

## Official symptom table `[VERIFIED -- PZToolsGuide]`

| Symptom | Likely cause | Check |
|---|---|---|
| Red question-mark tiles only in WorldEd | Different tileset path/catalog, or WorldEd did not finish loading | Tiles directory, `Tilesets.txt`, missing-image log entries |
| Blank minimap thumbnail | No cached thumbnail, unresolved tiles, or old geometry cache | Recreate selected thumbnails, inspect logs |
| Thumbnail does not fill the cell | Wrong project grid flag, or stale pre-fix thumbnail | Project badge, then recreate the thumbnail |
| Dock sizes reset | Wrong INI, app terminated before a save, or invalid legacy state | Portable settings path and layout keys |
| *Open in TileZed* asks for a default application | Old executable, or separated installation | Use the current build and keep both EXEs together in `bin` |
| Terrain image editor menu greyed out | No WorldEd project loaded | Open or create the destination PZW first |
| Terrain image reports an unknown color | Pixel is not declared in the project's `Rules.txt` | Use the reported coordinate + RGB to fix the image or the rule |
| Biomemap rejects size | Image dimensions do not match the project's 300/256 grid | Project badge, exact input pixel size |
| Heatmap looks too bright | The x40 B42 preview multiplier is on | Inspect raw intensity; disable preview to see 0-255 literally |
| BuildingEd appears frozen at first launch | Large tileset/Building catalog load | Progress window and portable log |
| BuildingEd asks for a Tiles directory | No valid extracted Tiles path configured | Restart an editor to open initial setup, or select Tiles in preferences, then restart BuildingEd |
| Catalog changes seem ignored | Wrong directory selected as *Configuration catalogs* | Use the packaged `config`, **not** `settings` |
| InGameMap export drops a polygon | Degenerate or unrepresentable geometry | Search logs for cell, feature index, rejection reason |

When reporting a problem, include: application name, project grid format, the
exact menu action, the affected cell/TMX path, and the matching log lines. That is
usually enough to tell bad source data from an editor regression.

For a Windows **Bad Image** error after extracting a release, compare the reported
DLL with the archive, or extract the archive again, before touching editor
settings. A damaged or partially copied runtime file fails before the app can
create its normal log. `[VERIFIED]`

---

## "Unknown element `tile_entry`" -- Tiled crashes on opening a cell

`[COMMUNITY -- Mr. Mapper / Pabbiqo, November 2025]`

Symptom: Tiled crashes when opening a cell. The log in the Tiled folder shows:

```
[DEBUG] "Unknown element "tile_entry"
Line 3, column 32 <prefab folder>/02_prefabs/.../pq_barn_25_north.tbx"
```

Fix:

1. Open the named building in **BuildingEd**.
2. Go to **Used Furniture / Used Tiles**.
3. **Right-click an empty spot** in that panel (where the used tiles are shown).
4. Choose **Remove Unused Entries**.

Notes from the reporter: the cause is unclear and it may be a one-time problem.
You may see hundreds of TBX files reporting it; fixing the first few entries was
enough in their case. If it does not resolve, repeat on a few more entries.

**Back up your work regularly.**

---

## Red question marks everywhere after setup

Two different eras, two different causes:

- `[STALE]` 2025 tools: the Tiles path was set to `.../Tiles/2x` instead of
  `.../Tiles`. Current builds normalize `1x`/`2x`/`custom` up to the parent, so
  this specific cause is gone.
- Current builds: a red question mark means **the tile reference could not be
  resolved** -- not that the TMX geometry failed to open. WorldEd and TileZed
  resolve tilesets through the same catalogs and wait for the tilesets a TMX
  requires. Check the Tiles directory, `Tilesets.txt`, and the missing-image log
  lines. `[VERIFIED]`

A related regression was fixed in build 20260730: WorldEd and TileZed now
re-register every embedded TMX tileset declaration with the shared image cache,
so artwork loaded for one map is reused by current and adjacent cells even when
their embedded catalogue sizes differ -- restoring the cross-cell fallback
instead of showing red unknown tiles. `[VERIFIED]`

---

## BMP-to-TMX produces red placeholders

Should no longer happen: as of build 20260802, BMP-to-TMX loads and waits for
every sheet required by `Rules.txt`, aliases and `Blends.txt` before generating.
An unavailable sheet is **named** and generation **stops**. `[VERIFIED]`

If you are on an older build, update. Also available:
`--validate-bmp-generation=<project.pzw>`.

---

## Removing a BMP from a cell

`[COMMUNITY]`

1. Use the WorldEd action to remove the BMP from the cell.
2. Add a new BMP and re-run BMP-to-TMX.
3. Recreate thumbnails: right-click the cell -> *Recreate Thumbnail*.
4. Restarting the tools helps in most cases.

---

## My map is in the wrong place on the vanilla world

You used B42 online-map coordinates. **B42 map creation still uses B41
coordinates.** Get them from https://map.projectzomboid.com/ instead, or layer
the B41 and B42 map PNGs with a 300x300 grid and count. `[COMMUNITY]`

See [02-world-and-cells.md](/pz/build-42/mapping/fundamentals/world-and-cells-overview).

---

## Exported file count and numbering does not match my cells

Expected. You authored in 300x300; export splits into 256x256 game files, so you
get more files with different numbering. `[VERIFIED + COMMUNITY]`

---

## Heatmap / zone edits do not show up in game

Editing the PNG or the zones alone does not update already-generated binaries.
**Re-run the 8x8 lot generation.** `[VERIFIED]`

---

## Foraging or biome data is wrong at my map's edge

A legacy 300 project's bounds cross the 256-pixel biomemap boundaries. Uncovered
pixels in boundary files get neutral ForagingNav data (and are reported after
generation) unless you select the **vanilla `maps` directory as the base biomemap
directory**. Do that, and export every overlapping tile. `[VERIFIED]`

Also remember: supplying `biomemap_X_Y.png` replaces biome **and** foraging data
for the entire 256x256 tile, not just your buildings.

---

## Wildlife polylines crash the game

Every intermediate point of an `Action = follow` polyline needs another polyline
attached. Missing ones crash the game. `[COMMUNITY -- BlackshotGER]`

See [05-zones-and-spawns.md](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview).

---

## Farm animals do not spawn

Ranch zones appear not to spawn animals when placed too close to another Ranch
zone. Spread them out. `[COMMUNITY]`

---

## Unclean shutdown causes a restore crash loop

Fixed. An unclean shutdown no longer creates an automatic project-restore crash
loop; the next start skips restoration and explains how to recover. `[VERIFIED]`

---

## General hygiene

- Back up regularly. Multiple community guides say this after being bitten.
- Install each tools update into a **new folder**; never overwrite.
- Test new Automapper rule sets on a copy, with Undo history visible.
- Save a PZW backup before `Remove All Empty Border Cells...` -- it can move the
  world origin, and external scripts may hard-code the old one.
