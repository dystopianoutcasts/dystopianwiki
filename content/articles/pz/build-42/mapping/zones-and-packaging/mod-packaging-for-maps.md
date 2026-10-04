---
id: build-42-mod-packaging-for-maps
slug: mod-packaging-for-maps
title: Mod packaging for maps
game: pz
version: build-42
section: mapping
category: zones-and-packaging
difficulty: intermediate
tags:
  - map-info
  - mod-packaging
  - biomemap-placement
excerpt: 'Mods live in %UserProfile%\Zomboid\mods (on Linux and macOS, ~/Zomboid/mods).'
last_updated: '2026-10-04'
---
# Mod packaging for maps

> Source: 06-mod-packaging.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Mods live in `%UserProfile%\Zomboid\mods` (on Linux and macOS, `~/Zomboid/mods`).

B42 changed the required structure. Reference: https://pzwiki.net/wiki/Mod_structure
`[COMMUNITY pointer]`

---

## The structure WorldEd exports

`File > Export Complete Mod (8x8)...` runs the LOT export and builds the whole
mod tree, not just loose lot files. The dialog collects mod name, map name,
output location and poster data. `[VERIFIED -- PZToolsGuide]`

```
MyMapMod/
  42.0/
    mod.info
    poster.png
  common/
    mod.info
    media/
      maps/
        MyMap/
          map.info
          objects.lua
          spawnpoints.lua
          worldmap.xml
          worldmap-forest.xml
          <X>_<Y>.lotheader
          <X>_<Y>.lotpack
          chunkdata_<X>_<Y>.bin
          maps/
            biomemap_<X>_<Y>.png
```

**Back up any existing files in the chosen mod directory before exporting** --
the export replaces them. `[VERIFIED]`

**CORRECTION -- the tool's output is not the whole story.** The authoritative
layout is the PZwiki *Mod structure* page, revised for 42.20.0. Three things the
export shape does not tell you: `common/` is effectively mandatory, the version
folder name is flexible with specific truncation rules, and you should be
developing in `Zomboid/Workshop/`, not `Zomboid/mods/`.

---

## Where to actually develop `[VERIFIED -- PZwiki, revised for 42.20.0]`

Two folders are recognized, both in the cache folder (`%UserProfile%\Zomboid`):

| Folder | Use |
|---|---|
| `Zomboid/mods/` | Manual installs. **Not recommended for development.** |
| `Zomboid/Workshop/` | **Use this.** Mod development and Workshop uploading. |

```
%UserProfile%/Zomboid/Workshop/
  MyModWorkshop/
    workshop.txt        generated when uploading
    preview.png         square PNG, 256x256 or 512x512, at most 1000 KB
    Contents/
      mods/
        MyMod1/
        MyMod2/
```

> **Proof:** Code. `zombie.core.znet.SteamWorkshopItem#validatePreviewImage` (square, width 256 or 512, at most 1,024,000 bytes, readable PNG). Build 42.20 (revision a2947723ca).

Why Workshop over mods:

- The in-game uploader needs it. From `mods/` you end up copying anyway -- and
  copies of the same Mod ID **clash and overwrite each other**, which produces
  changes that mysteriously do not appear in game.
- Anything inside `MyModWorkshop/` but **outside** `Contents/` is ignored by the
  game and not uploaded. Put your `.git`, `README.md`, `.vscode`, source art and
  scripts there. `MyModWorkshop/` makes a clean git repo root.
- **Do not stay subscribed to your own mod on the Workshop while developing.**
  The subscribed copy and your local copy clash.

Careful: this is `%UserProfile%\Zomboid\Workshop`, **not**
`steamapps\common\ProjectZomboid\Workshop` -- the latter cannot be used for
modding.

Subscribed mods from other people live in
`Steam/steamapps/workshop/content/108600/<WorkshopID>/`.

---

## Mod folder structure `[VERIFIED -- PZwiki 42.20.0]`

```
Contents/mods/MyMod1/
  mod.info
  poster.png
  icon.png
  common/                <-- mandatory in practice; mod not detected without
    media/               <-- big shared assets: models_X, anims_X, textures
  42.0.0/                <-- versioning folder
    media/
      lua/{client,server,shared}/
      maps/
      scripts/
      AnimSets/
    mod.info
    poster.png
    icon.png
  42.X.Y/                <-- optional, for newer game versions
  media/                 <-- Build 41 only; ignored by Build 42
```

**Load order:** `common/` first, then the **closest versioning folder** to the
game version, which overwrites any common file it also contains.

**Version folder naming truncates the minor version:**

| Folder name | Treated as |
|---|---|
| `42` | `42.0` |
| `43` | `43.0` |
| `42.1` | `42.1` |
| `42.12` | `42.12` |
| `42.0.5` | `42.0` |
| `42.1.5` | `42.1` |
| `43.5.1` | `43.5` |

So `42.0.5` and `42.0.9` collapse to the same folder -- do not rely on the third
component to distinguish versions.

**At least one versioning folder or a `common/` folder is required** for the mod
to be recognized at all.

**B41 and B42 structures can coexist** in the same mod folder. The B42 structure
sits one level deeper, so `media/` (B41) and `common/` + `42/` (B42) do not
clash. `common/` is not recognized by the B41 structure.

**Case matters.** Linux and macOS are case-sensitive: `common`, not `Common`.

Put `mod.info` in the **versioning folders** rather than `common/` -- requirements
change per game version, and that keeps them separable.

### mod.info

```
name=My amazing mod !
id=myAmazingModID
author=an amazing modder!
description=Hello World !
poster=preview.png
icon=icon.png
require=otherModID,anotherModID
```

- Filename must be all lowercase (Linux/macOS).
- Watch for a hidden `.txt` extension -- enable file extensions in Explorer.
- Technically all parameters are optional; in practice `id` and `name` are
  required.
- Map mods additionally use `pack=` and `tiledef=` -- see
  [04-tiles.md](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs).

Community template to start from: the **Project Zomboid Community Modding
template** repository.

---

## Corrected map-folder file list

`world_X_Y.lotpack` -- **not** `X_Y.lotpack`. Confirmed in the installed game:
`world_0_18.lotpack` alongside `0_18.lotheader` and `chunkdata_0_18.bin`.
`[VERIFIED]`

The wiki also lists `thumb.png` (spawnpoint thumbnail). It is **not** present in
vanilla Muldraugh, so treat it as mod-side only. `[VERIFIED absence]`

---

## The map folder, as vanilla ships it

Verified contents of `media/maps/Muldraugh, KY/` in B42 stable. Use this as the
checklist of what a complete map folder can contain. `[VERIFIED]`

| File | Role | Required for a mod map? |
|---|---|---|
| `map.info` | Map metadata (title, description, minimap zoom/anchor) | Yes |
| `<X>_<Y>.lotheader` | Cell header data | Yes (generated) |
| `<X>_<Y>.lotpack` | Cell tile data | Yes (generated) |
| `chunkdata_<X>_<Y>.bin` | Per-cell chunk data | Yes (generated) |
| `objects.lua` | Exported zones/objects | Yes |
| `spawnpoints.lua` | Player spawn locations | If you offer spawns |
| `regions.lua` | Named `Region` rectangles | Optional |
| `roomtones.lua` | Ambient room tone assignments | Optional |
| `basements.lua` | Procedural basement catalogue (written by TileZed on `.pzby` export) | If you have basements |
| `streets.xml` | Named street polylines (new in 42.20) | Optional |
| `WorldGenOverride.lua` | Static worldgen modules: forced water, prefabs, jumbo overrides | Optional |
| `worldmap.xml` + `worldmap.xml.bin` | In-game map vector data | Yes if you want a map |
| `worldmap-forest.xml` + `.bin` | Forest layer of the in-game map | Optional |
| `worldmap-annotations.lua` | Map annotations | Optional |
| `worldmap.png` | Full-resolution map image (vanilla's is 122 MB) | Optional |
| `pyramid.zip`, `forest.pyramid.zip`, `spawnSelectImagePyramid.zip` | Pre-rendered zoom pyramids for the map UI | Optional |
| `maps/biomemap_<X>_<Y>.png` | Biome (red) + foraging-zone (green) data, one file per 256x256 tile | Yes for foraging/biomes |

Vanilla ships 12 map folders (`Muldraugh, KY`, `Riverside, KY`, `West Point, KY`,
`Rosewood, KY`, `March Ridge, KY`, `Ekron, KY`, `Irvington, KY`, `Brandenburg, KY`,
`Echo Creek, KY`, `Fallas Lake, KY`, `Valley Station, KY`, plus `challengemaps`).

---

## map.info

Vanilla Muldraugh, verbatim `[VERIFIED]`:

```
title=Muldraugh P.O.T
fixed2x=true
description=Chunk size is 8x8, Cell size is 256x256
zoomX=11181
zoomY=9725
zoomS=13.5
demoVideo=Muldraugh.bik
```

| Key | Meaning |
|---|---|
| `title` | Name shown in the map/mod lists |
| `description` | Free text |
| `fixed2x` | Marks the map as authored at fixed 2x tile resolution |
| `zoomX` / `zoomY` | World coordinates the map UI centers on |
| `zoomS` | Initial zoom scale |
| `demoVideo` | Optional `.bik` shown on the map screen |
| `lots=` | Dependency chain -- other map folders loaded underneath this one (see below) |

**`lots=` matters for biomemaps.** The game loads the selected map folder together
with the folders listed in `lots=`, and biomemap files follow that priority. If
your mod supplies `maps/biomemap_X_Y.png` it wins for those coordinates; if it
does not, the game falls back to the matching file from a lower-priority
dependency such as `Muldraugh, KY`. `[VERIFIED]`

Wiki reference for the full key list: https://pzwiki.net/wiki/Map.info

---

## Testing workflow

Point your WorldEd exports directly at the mod folder --
`MyMapMod\common\media\maps\MyMap` -- so that testing is a single folder copy into
`%USERPROFILE%\Zomboid\mods`. The community sample project/mod pair is built
exactly this way. `[COMMUNITY]`

https://github.com/pzmapping/Sample-Mod-and-Project-

---

## Custom spawn-location map UI

To make your town appear on the "Select Spawn Location" screen.
`[COMMUNITY -- Raely, with Pabbiqo]`

### 1. Build the overlay image

Copy the original `ProjectZomboid/media/maps/Muldraugh, KY/worldmap.png`, open it
in an image editor, and delete everything except your town.

Hard requirements:

- Keep the original image **dimensions**.
- Keep the original **file format**.
- Background must stay **transparent**.
- **Do not name it `worldmap.png`.** Use a unique filename so you do not collide
  with other map mods -- e.g. `MyTown_MapUI.png`.

Note `[VERIFIED]`: vanilla `worldmap.png` is 122 MB. Expect a large working file.

### 2. Mod layout

```
media/
  textures/
    MyTown_MapUI.png
  lua/
    client/
      MapUIReplacement.lua
```

### 3. The script

```lua
local original_render = MapSpawnSelect.render
local overlayTexture = getTexture("media/textures/MyTown_MapUI.png")

function MapSpawnSelect:render()
    original_render(self)

    if not overlayTexture then return end

    local mapAPI = self.mapPanel.javaObject:getAPIv1()

    local worldX1, worldY1 = 0, 0
    local worldX2, worldY2 = 19800, 16100   -- Knox Country world extent

    local sx1 = mapAPI:worldToUIX(worldX1, worldY1)
    local sy1 = mapAPI:worldToUIY(worldX1, worldY1)
    local sx2 = mapAPI:worldToUIX(worldX2, worldY2)
    local sy2 = mapAPI:worldToUIY(worldX2, worldY2)

    -- clip drawing to the map panel only
    self.mapPanel:setStencilRect(0, 0, self.mapPanel.width, self.mapPanel.height)

    self.mapPanel:drawTextureScaled(
        overlayTexture,
        sx1, sy1,
        sx2 - sx1, sy2 - sy1,
        1
    )

    self.mapPanel:clearStencilRect()
end
```

Change the `getTexture` path to your filename.

How it works: it wraps `MapSpawnSelect.render`, calls the original first, then
converts the fixed world rectangle `(0,0)-(19800,16100)` -- the Knox Country
extent -- into UI coordinates via `getAPIv1():worldToUIX/Y`, and draws the
overlay scaled into that rectangle. The stencil rect confines drawing to the map
panel so the image cannot bleed over the surrounding UI.

Because the world rectangle is hard-coded, your PNG must keep the original
`worldmap.png` dimensions -- that is what makes the scaling line up.

### Notes and caveats

- It works as an **overlay**; it does not replace the original map UI, so it is
  compatible with other map mods. `[COMMUNITY]`
- The vanilla class it hooks lives at
  `media/lua/client/OptionScreens/MapSpawnSelect.lua`. `[VERIFIED]`
- Because the hook captures `MapSpawnSelect.render` at load time, **load order
  matters** if more than one mod wraps the same function. Two mods that each
  capture and re-wrap will chain correctly only if both call the original;
  a mod that replaces rather than wraps will drop the other's overlay.
  `[Inference from the pattern, not tested]`
- Distributed free to use, modify and redistribute.

---

## Publishing checklist

From Erika's checklist -- the packaging half. `[COMMUNITY]`

- [ ] Mod description and poster image
- [ ] Spawn description and thumbnail
- [ ] Spawnpoints tested in-game
- [ ] In-game world map renders
- [ ] `map.info` `title` / `description` correct
- [ ] Biomemap tiles exported for every overlapping 256x256 tile that needs
      non-vanilla data
- [ ] Lots regenerated **after** the last heatmap or zone edit

---

*Corrected 2026-10-04: the Workshop preview may be 256x256 or 512x512, square, up to 1000 KB; 256x256 is not the only size accepted.*
