---
id: build-42-ui3dscene-a-car-in-a-mod-window
slug: ui3dscene-a-car-in-a-mod-window
title: 'UI3DScene: a 3D car in your mod window'
game: pz
version: build-42
section: modding
category: ui
difficulty: advanced
tags:
  - ui
  - 3d
  - vehicles
  - ui3dscene
excerpt: >-
  Build 42 can draw a 3D car inside an ordinary mod window, outside debug mode,
  with the camera and placement under your control. But the car is always the
  stock model: first skin, one fixed paint, no damage, every part fitted. What
  Lua controls and what the Java hard-codes, read from the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - ui-coordinate-traps
  - ui-engine-reference
  - vehicle-ui-reference
---
# UI3DScene: a 3D car in your mod window

Outcast, if you have wanted a turning 3D car in your own panel (a garage screen, a shop preview, a mechanics window), Build 42 can do it, and outside debug mode. We went through the code to find out exactly how far it goes before we promised anything in our own mod. Short version: it is a **stock model viewer** with free staging. It cannot show the real car's state.

## It works, and other mods already use it

The old `UIVehicleModel` class is gone from the Build 42 engine (a leftover Lua wrapper for it still ships and is used by nothing). Its replacement is `UI3DScene`, which is exposed to Lua and wrapped by vanilla's `ISUI3DScene`. Vanilla only uses it in its debug editors, but it is not tied to debug mode, and published mods use it in ordinary windows, for example Another Vehicle Claim System (Workshop 2957935793) and Shops (Workshop 3104957625).

The minimum, the way those mods call it:

```lua
local scene = ISUI3DScene:new(x, y, w, h)
scene:initialise()
panel:addChild(scene)
scene.javaObject:fromLua1("createVehicle", "car")
scene.javaObject:fromLua2("setVehicleScript", "car", "Base.CarNormal")
scene:setView("Right")
scene.javaObject:fromLua1("setZoom", 4)
scene.javaObject:fromLua1("setDrawGrid", false)
```

> **Proof:** Code. `zombie.vehicles.UI3DScene` (exposed in `zombie.Lua.LuaManager`; `fromLua1` `createVehicle`, `setZoom`, `setDrawGrid`, `setView`; `fromLua2` `setVehicleScript`); `media/lua/client/Vehicles/ISUI/ISUI3DScene.lua` (`UI3DScene.new(self)`, `setView`); no `UIVehicleModel` class in the engine source. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Reported. The calls above as used by Another Vehicle Claim System (`AVCS2UserManagerMain.lua`) and Shops (`nshopsexpanded_PreviewUI.lua`), read in their published files. Build 42.20.

## What Lua controls

- **Camera:** `setView` (named views, or `"UserDefined"`), `fromLua3("setViewRotation", x, y, z)`, `setZoom`, the maximum zoom, and dragging the view.
- **Objects:** `fromLua4("setObjectPosition", id, x, y, z)`; rotation through the vector `fromLua1("getObjectRotation", id)` returns (set its components); visibility, auto-rotate, and parenting an object to another or to a vehicle part.
- **Other things to draw:** any loaded model script (`createModel`), a character, boxes, cylinders and polygons.
- **Pinning 2D on 3D:** `sceneToUIX(x, y, z)` and `sceneToUIY(x, y, z)` are public, so you can draw your own labels or markers at points on the car.
- **Ground and grid:** `setDrawGridPlane` (a grey ground slab) and `setDrawGrid` / `setDrawGridAxes` are separate switches. Turn the grid off: it also prints mouse coordinate text over your scene.

**One ordering trap:** `setViewRotation` only stores the angles. It does not rebuild the view, and the angles are only used in the `"UserDefined"` view. `setView` and `setZoom` do rebuild it. So call `setViewRotation` first, then `setView("UserDefined")`. The scene also rebuilds every frame, so the picture catches up next frame, but `sceneToUIX` / `sceneToUIY` called straight after `setViewRotation` use the old view.

> **Proof:** Code. `zombie.vehicles.UI3DScene`: `fromLua3` `setViewRotation` (sets `viewRotation` and returns), `fromLua1` `setView` and `setZoom` (call `calcMatrices`), `#calcMatrices` (reads `viewRotation` only for `UserDefined`), `fromLua4` `setObjectPosition`, `fromLua1` `getObjectRotation`, `setDrawGridPlane`, `#sceneToUIX`, `#sceneToUIY`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What the Java hard-codes

This is the part that decides your design. The scene's car is built from a **vehicle script name only**. Nothing in it takes a `BaseVehicle`, so the real car in the world cannot be passed in. And when it draws:

- **Skin:** always the script's first skin (and that skin's mask).
- **Paint:** a fixed colour vector, `(0, 0.5, 0.5)`.
- **Damage, rust, blood, removed parts and lights:** all switched off. A car with its doors, hood and windows removed still draws them fitted.
- **Parts:** every part model in the script is drawn, and every wheel. There is no per-part visibility.
- **Ground slab:** fixed 50% grey, 10 by 10.

So treat it as a showroom model. Show condition with your own 2D markers on top (that is what `sceneToUIX`/`sceneToUIY` are for), and never promise real paint or real damage.

> **Proof:** Code. `zombie.vehicles.UI3DScene`: `SceneVehicle#setScriptName` (`ScriptManager.instance.getVehicle(scriptName)`), skin and mask from `getSkin(0)` only, `VehicleDrawer` (`paintColor = new Vector3f(0.0F, 0.5F, 0.5F)`; uninstall, damage, blood and light enables zero-filled; rust 0), `initPartModels` and `initWheelModel` (every part model, every wheel), the grid plane drawer (grey `0.5F`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Things we have not tested

- A car body added with `createModel` instead of `createVehicle` goes through the plain model drawer, which does not set the vehicle shader's textures and settings. What it looks like is unknown to us.
- Making a preview from a script that does not exist in the game (a "fake" car built at runtime) is not a simple call: the script parser needs a load-mode argument. We did not try it.
- The scene's placement of part models does not flip axes the way the world renderer does (see [Vehicle model and texture traps](/pz/build-42/vehicles/animation/vehicle-model-and-texture-traps)). Matching the in-world view of a car exactly takes care; we have worked out the transforms on paper and not yet confirmed the result on screen.

> **Proof:** Unknown. Read `UI3DScene` (`createModel` path) and `zombie.scripting.ScriptManager#ParseScript` (takes a `ScriptLoadMode`); none of the three tried in game. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).
