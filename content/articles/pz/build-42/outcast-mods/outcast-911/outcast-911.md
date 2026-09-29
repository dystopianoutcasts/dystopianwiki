---
id: build-42-outcast-911
slug: outcast-911
title: Outcast 911
game: pz
version: build-42
section: outcast-mods
category: outcast-911
difficulty: beginner
tags:
  - outcast-911
  - vehicles
  - overview
excerpt: A 992.2-generation 911 for Project Zomboid Build 42.20.
last_updated: '2026-09-29'
---
# Outcast 911

> Source: Outcast911/README.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A 992.2-generation 911 for Project Zomboid Build 42.20.

**Status: V0 — first in-game test. Never been launched.** The goal of V0 is
narrow: *does it load and spawn.* Everything else is additive.

## Install

```powershell
.\scripts\install-junctions.ps1
```

Then enable **Outcast 911** in the mod list.

## Spawn it

No spawn distribution is wired yet (deliberate — V0 is about loading). In
singleplayer, spawn by hand from the debug menu or the Lua console:

```lua
getWorld():getCell():addVehicle("Base.Outcast911", getPlayer():getSquare())
```

On a server there is no Lua console — use the admin menu instead, see
[Testing on a dedicated server](#testing-on-a-dedicated-server).

## What is in the box

```
media/models_X/vehicles/Vehicles_Outcast911_Body.fbx      9 meshes, 2048 verts
media/models_X/vehicles/Vehicles_Outcast911_Objects.fbx   4 world-item meshes
media/scripts/vehicles/Outcast911_model.txt               model declarations
media/scripts/vehicles/Outcast911.txt                     the vehicle
media/lua/shared/Translate/EN/IG_UI.json                  the vehicle's name
media/textures/Vehicles/vehicle_outcast911shell.png       512^2  PLACEHOLDER
media/textures/Vehicles/vehicle_outcast911_mask.png       512^2  PLACEHOLDER
media/textures/Vehicles/vehicle_outcast911_lights.png     512^2  PLACEHOLDER
```

`preview.png` (Steam) and `42/poster.png` + `42/icon.png` (the in-game mod list)
are renders of the shipped mesh, not hand-made art, so they cannot drift from
what the car actually looks like. Regenerate them in two steps — Blender's
bundled Python has no Pillow:

```powershell
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --python `
  R:\ZOMBOID\PZ_3D_Assets\models_X\vehicles\porsche_911_992\scripts\render_workshop_art.py
python R:\ZOMBOID\PZ_3D_Assets\models_X\vehicles\porsche_911_992\scripts\render_workshop_art.py --downsample
```

Source of truth for the model:
`R:\ZOMBOID\PZ_3D_Assets\models_X\vehicles\porsche_911_992\` — regenerate the
whole thing with `blender -b --python scripts/build_911_parts.py`, then export
with `export_911_fbx.py`.

Reference and research: `R:\ZOMBOID\_dev\Porsche911_992_2_Ref\` and
`R:\ZOMBOID\PZ_3D_Assets\_study\vehicle_architecture\`.

## Publishing to the Workshop

`workshop.txt` carries no `id=` yet, so the first submit creates a new item and
the uploader writes the id back into the file. **Commit that change** — it is
how every later upload finds the same item instead of making a second one.

It goes up as `visibility=unlisted` on purpose. The car has never been launched;
an unlisted item is still installable by direct link and still downloadable by a
dedicated server, which is all a test needs.

Before every upload:

```powershell
python .\scripts\validate-package.py
```

It checks the things that fail quietly rather than loudly — a poster the mod
list cannot find, a texture the vehicle script names but the package does not
carry, a mesh name that no longer exists in the FBX, a tag Steam will drop, a
`visibility` value the engine does not recognise.

Then in game: Main Menu -> Workshop -> Submit, pick `Outcast911`.

## Testing on a dedicated server

Add the mod to the server's `<servername>.ini`. Both lines are required — `Mods`
loads it, `WorkshopItems` makes the server fetch it and makes clients download
it on join:

```ini
Mods=Outcast911
WorkshopItems=<the id the uploader wrote into workshop.txt>
```

There is **no spawn distribution**, so the car will not appear in the world. An
admin or moderator right-clicks the ground and takes *Admin* -> *Spawn Vehicle*,
then picks `Base.Outcast911` from the list. That menu is multiplayer-only —
`AdminContextMenu.lua:23` gates it behind `isClient() and (isAdmin() or
getAccessLevel() == "moderator")` — and the list is built from
`getScriptManager():getAllVehicleScripts()`, so a modded vehicle shows up in it
with no extra work.

What multiplayer specifically can expose that singleplayer cannot:

- Vehicle physics is server-authoritative. If `extents`, `physicsChassisShape`
  or the wheel offsets are wrong, it shows up as bouncing, sinking or rubber-
  banding rather than as a static misplacement.
- Every client needs the same mod version or it will not join. After any
  re-upload, restart the server so it pulls the new revision.
- Nothing in this mod sends anything over the network — no custom Lua at all —
  so the only MP surface is the vehicle script and the meshes.

## Verified before shipping

- Every `|meshName` in the model script exists in the FBX (9/9), no orphans.
- Every `file =` in the vehicle script resolves to a declared model, and every
  declared model is used.
- All 57 script keys are accepted by the shipped parsers — checked against
  `VehicleScript.java` and `ModelScript.java` in the decompiled B42 engine, not
  from memory. (Both use `equalsIgnoreCase`.)
- FBX round-trips at 1.852 × 4.542 × 1.155, matching vanilla's raw axis layout
  (X = width, Y = length, Z = height).
- Both UV channels present and named `UVChannel_1` / `UVChannel_2` on all 16
  meshes — required by `vehicle_norandom_multiuv`.

## Known-unresolved — expect these on first launch

1. **Scale and vertical placement are uncalibrated.** The mesh is authored in
   real metres with its origin **on the ground**; vanilla meshes straddle Z=0
   vertically, so vanilla wheel offsets are negative in Y and ours are positive.
   If the car floats, sinks, or is the wrong size, adjust `model { offset }` and
   the wheel `offset` Y term **together** — do not rescale the mesh.
2. **Textures are flat placeholders.** The shell is flat red; the mask is
   `808080`, a colour that deliberately matches **no** mask zone, so there are no
   damage decals, no light emission, no uninstall darkening and **no glass
   reflections** yet. That is expected, not a bug.
3. **No animation clips.** Panels are split and rigged but static in game until
   the `_opening` / `_closing` clips are authored in Blender.
4. **No spawn distribution, no armour, no mirrors.**

## Why `vehicle_norandom_multiuv`

Vanilla's own shader. The `norandom` variant omits the HSV hue-randomisation
block, so authored paint survives — 22 vanilla models already use it, including
`Vehicles_VanRadio` and every SMASH/CRASH wreck. A 911 in Guards Red should stay
Guards Red. No custom shader, and therefore no library dependency.

## Trademark

Flagged once and left to the maintainer: the model is a recognisable Porsche.
Community practice in this space uses real model names (Filibuster Rhymes ships
`fr_po_gto_65`, `fr_fo_mustang_64`), so this follows convention — but the crest
and wordmarks are deliberately absent from the texture and should stay that way.
