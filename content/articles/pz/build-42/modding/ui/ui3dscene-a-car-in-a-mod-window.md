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
  Build 42.22 can draw a 3D car in an ordinary mod window, outside debug mode. The car is always the stock model: first skin, fixed paint, no damage, every part fitted.
last_updated: '2026-11-21'
related_articles:
  - ui-overview
  - ui-coordinate-traps
  - ui-engine-reference
  - vehicle-ui-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders who want a car preview in a window](#1-it-works-and-other-mods-already-use-it) | [modders deciding what the preview can show](#3-what-the-java-hard-codes)

Outcast, if you have wanted a turning 3D car in your own panel (a garage screen, a shop preview, a mechanics window), Build 42 can do it, and outside debug mode. We went through the code to find out how far it goes before we promised anything in our own mod. All of this is client UI code.

:::callout[The 1-minute version]{kind=key}
- `UI3DScene` is exposed to Lua and wrapped by vanilla's `ISUI3DScene`; it is not tied to debug mode.
- Lua steers the scene through string-named calls on `fromLua0` to `fromLua9`: camera, object placement and other models; screen positions of scene points come from direct method calls.
- The car is built from a vehicle script name only: nothing takes the real car in the world, so its real paint, damage, removed parts and lights cannot be shown.
- The gray ground slab appears only when `setDrawGridPlane` is on and the grid plane is set to XZ; the default plane is YZ.
- Not tested in a game: a car body added with `createModel`, a script made at runtime, and an exact match with the in-world view.
:::

:::facts
- **Default script of a new vehicle object** `Base.ModernCar`
- **Paint** fixed vector (0, 0.5, 0.5)
- **Zoom** 1 to a maximum of 10 by default (the maximum can be set from 1 to 20)
- **Ground slab** 10 by 10 units, 50% gray, XZ plane only
:::

## 1. It works, and other mods already use it

**The old `UIVehicleModel` class is gone, and its replacement `UI3DScene` is exposed to Lua without any debug-mode switch.**

The decompiled 42.22 engine source has no `UIVehicleModel` class, and the Lua wrapper `ISUIVehicleModel` that still ships calls `UIVehicleModel.new`, which nothing else references. :cite[(`media/lua/client/Vehicles/ISUI/ISUIVehicleModel.lua:5-6`)] `UI3DScene` is registered as an exposed class, and `ISUI3DScene` instantiates it. :cite[(`zombie/Lua/LuaManager.java:2456`, `media/lua/client/Vehicles/ISUI/ISUI3DScene.lua:5-14`)] In vanilla Lua only five files use it: four under `media/lua/client/DebugUIs/` and `Vehicles/ISUI/EditVehicleState.lua`. Published mods are reported to use it in ordinary windows (see How we know).

A minimal call sequence:

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

`createVehicle` adds a vehicle object with the id you give, and fails if the id exists. :cite[(`zombie/vehicles/UI3DScene.java:598-605`)] `setVehicleScript` sets the script by name. :cite[(`zombie/vehicles/UI3DScene.java:1430-1433`)] `setView` takes one of Left, Right, Top, Bottom, Front, Back or UserDefined. :cite[(`zombie/vehicles/UI3DScene.java:7685-7693`)] `setZoom` keeps the whole number part and clamps it between 1 and the maximum zoom. :cite[(`zombie/vehicles/UI3DScene.java:892-895`)] Vanilla's editor makes the same two calls for its vehicle. :cite[(`media/lua/client/DebugUIs/AttachmentEditorUI.lua:560`, `media/lua/client/DebugUIs/AttachmentEditorUI.lua:1413`)]

## 2. What Lua controls

**Lua reaches the scene through nine entry points, `fromLua0` to `fromLua7` and `fromLua9`, each taking a function name and a fixed number of arguments.**

Each is a method on the scene that switches on the function name. :cite[(`zombie/vehicles/UI3DScene.java:446`, `zombie/vehicles/UI3DScene.java:540`, `zombie/vehicles/UI3DScene.java:929`, `zombie/vehicles/UI3DScene.java:1489`, `zombie/vehicles/UI3DScene.java:1715`, `zombie/vehicles/UI3DScene.java:1914`, `zombie/vehicles/UI3DScene.java:1950`, `zombie/vehicles/UI3DScene.java:2137`, `zombie/vehicles/UI3DScene.java:2190`)] These are the controls a car preview needs:

- **Camera:** `setView`, `setZoom`, `setMaxZoom` (clamped to 1 through 20), `dragView` (moves the view by the given pixels), and `fromLua3("setViewRotation", x, y, z)`. :cite[(`zombie/vehicles/UI3DScene.java:877-879`, `zombie/vehicles/UI3DScene.java:1060-1066`)] Vanilla's wrapper sends mouse drags to `dragView` and the wheel to `zoom`. :cite[(`media/lua/client/Vehicles/ISUI/ISUI3DScene.lua:28-46`)]
- **Objects:** `fromLua4("setObjectPosition", id, x, y, z)` sets the position. :cite[(`zombie/vehicles/UI3DScene.java:1841-1844`)] `fromLua1("getObjectRotation", id)` returns the object's own rotation vector, so you set its components to rotate. :cite[(`zombie/vehicles/UI3DScene.java:719-722`)] `setObjectVisible` and `setObjectAutoRotate` switch visibility and spinning. :cite[(`zombie/vehicles/UI3DScene.java:1416-1428`)] `setObjectParent` and `setObjectParentToVehiclePart` attach an object to another or to a vehicle part. :cite[(`zombie/vehicles/UI3DScene.java:1828-1840`, `zombie/vehicles/UI3DScene.java:1932-1942`)]
- **Other things to draw:** any loaded model script (`createModel`), a character, boxes, cylinders and polygons. :cite[(`zombie/vehicles/UI3DScene.java:547-583`, `zombie/vehicles/UI3DScene.java:1031-1047`)]
- **Pinning 2D on 3D:** `sceneToUIX(x, y, z)` and `sceneToUIY(x, y, z)` are public methods, called directly on `scene.javaObject` and not through `fromLua`, so you can draw your own labels or markers at points on the car. :cite[(`zombie/vehicles/UI3DScene.java:2314-2334`)]
- **Grid and ground:** `setDrawGrid` (on by default) and `setDrawGridAxes` are separate switches. :cite[(`zombie/vehicles/UI3DScene.java:131`, `zombie/vehicles/UI3DScene.java:804-809`)] Turn the grid off: while the grid is drawn, the scene also prints the mouse's scene coordinates, X, Y and Z, along its top edge. :cite[(`zombie/vehicles/UI3DScene.java:272-285`)] The gray ground slab is a separate switch, `setDrawGridPlane`, and it is only drawn when the grid plane is XZ, while the default plane is YZ. :cite[(`zombie/vehicles/UI3DScene.java:124`, `zombie/vehicles/UI3DScene.java:239-241`, `zombie/vehicles/UI3DScene.java:813-815`, `zombie/vehicles/UI3DScene.java:874-876`, `zombie/vehicles/UI3DScene.java:3165-3169`)]

**One ordering trap:** `setViewRotation` only stores the angles. It does not rebuild the view, and the angles are only used in the `"UserDefined"` view. `setView` and `setZoom` do rebuild it. :cite[(`zombie/vehicles/UI3DScene.java:1700-1708`, `zombie/vehicles/UI3DScene.java:894`, `zombie/vehicles/UI3DScene.java:908`, `zombie/vehicles/UI3DScene.java:2629-2633`)] So call `setViewRotation` first, then `setView("UserDefined")`. The scene also rebuilds its matrices every time it renders, so the picture catches up on the next frame, but `sceneToUIX` and `sceneToUIY` called straight after `setViewRotation` use the old view. :cite[(`zombie/vehicles/UI3DScene.java:329-333`, `zombie/vehicles/UI3DScene.java:2314-2334`)]

## 3. What the Java hard-codes

**The scene builds its car from a vehicle script name only, so the real car in the world cannot be passed in, and the drawing code switches the real car's state off.**

This is the part that decides your design. A new vehicle object starts as `Base.ModernCar`, and `setScriptName` looks the script up by name in `ScriptManager`. :cite[(`zombie/vehicles/UI3DScene.java:6131-6141`, `zombie/vehicles/UI3DScene.java:6432-6438`)] Nothing in that path takes a `BaseVehicle`. And when it draws:

- **Skin:** always the script's first skin, and that skin's mask. :cite[(`zombie/vehicles/UI3DScene.java:6166-6168`, `zombie/vehicles/UI3DScene.java:7193-7197`)]
- **Paint:** a fixed color vector, `(0, 0.5, 0.5)`. :cite[(`zombie/vehicles/UI3DScene.java:7115`, `zombie/vehicles/UI3DScene.java:7222`)]
- **Damage, rust, blood, removed parts and lights:** all switched off in the shader settings. No real car goes into the scene, so there is no real car state to show. :cite[(`zombie/vehicles/UI3DScene.java:7212-7221`)]
- **Parts:** every part model in the script is drawn, and every wheel. There is no per-part visibility. :cite[(`zombie/vehicles/UI3DScene.java:7366-7380`, `zombie/vehicles/UI3DScene.java:7432-7440`)]
- **Parts with several `model` blocks:** each block is placed at its own offset and rotation, but every one of them draws the mesh of the part's first model block, because the lookup by part id returns the model registered earliest for that part. A part built from two different meshes draws the same mesh twice. :cite[(`zombie/vehicles/UI3DScene.java:6440-6449`, `zombie/vehicles/UI3DScene.java:7499-7503`, `zombie/vehicles/UI3DScene.java:7574-7577`)]
- **Ground slab:** fixed 50% gray, 10 by 10, on the XZ plane. :cite[(`zombie/vehicles/UI3DScene.java:3165-3169`)]

So treat it as a showroom model. Show condition with your own 2D markers on top, which is what `sceneToUIX` and `sceneToUIY` are for, and never promise real paint or real damage.

## 4. Things we have not tested

**Three questions remain open: the plain-model path, a car made from a script that does not exist in the game, and an exact match with the in-world view.**

- A car body added with `createModel` instead of `createVehicle` is a `SceneModel`, which renders through a `ModelDrawer`, while the vehicle shader settings above sit in `VehicleDrawer`. :cite[(`zombie/vehicles/UI3DScene.java:1031-1047`, `zombie/vehicles/UI3DScene.java:3181`, `zombie/vehicles/UI3DScene.java:3387-3388`, `zombie/vehicles/UI3DScene.java:5331`)] What it looks like is unknown to us.
- Making a preview from a script that does not exist in the game, a "fake" car built at runtime, is not a simple call: the script parser needs a load-mode argument. :cite[(`zombie/scripting/ScriptManager.java:1349`)] We did not try it.
- The scene's placement of part models may not flip axes the way the world renderer does (not verified; see [Vehicle model and texture traps](/pz/build-42/vehicles/animation/vehicle-model-and-texture-traps)). Matching the in-world view of a car exactly takes care; we worked out the transforms on paper and have not yet confirmed the result on screen.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla Lua, with no game run for this page. Another Vehicle Claim System (Workshop 2957935793, `AVCS2UserManagerMain.lua`) and Shops (Workshop 3104957625, `nshopsexpanded_PreviewUI.lua`) were read in their published files on 42.20 and not rechecked; the call sequence above follows how they call the scene. Not tested: the `createModel` car body, a runtime script, and the axis handling of part models. `UI3DScene.fromLua2` and `fromLua4` changed between 42.21 and 42.22 in the engine delta; the cases named on this page were reread at 42.22, and the changed lines were not diffed against 42.21.
:::
