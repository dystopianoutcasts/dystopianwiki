---
id: build-42-vehicle-model-and-texture-traps
slug: vehicle-model-and-texture-traps
title: Vehicle model and texture traps
game: pz
version: build-42
section: vehicles
category: animation
difficulty: advanced
tags:
  - vehicles
  - models
  - textures
  - shaders
  - fbx
excerpt: >-
  A vehicle part model ignores its own texture under the car shaders; the wheel
  shader is the way out. Where to put parts that have no art, why a texture
  authored too dark can never be lit back up, what the FBX unit field really
  says in vanilla, and two animation keys the game reads and never uses.
last_updated: '2026-10-04'
related_articles:
  - how-to-animate-a-vehicle-part
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - vehicle-script-traps
---
# Vehicle model and texture traps

Outcast, if you are putting your own models on a car (engine bay parts, a battery, a panel that moves), these are the traps that cost us the most render-and-squint sessions. The animation guide, starting with [How to animate a vehicle part](/pz/build-42/vehicles/animation/how-to-animate-a-vehicle-part), covers the rig and the export; this page is about textures, shaders and a few numbers the engine ignores.

## A vehicle model's own texture is ignored under the car shaders

A `model` block in a vehicle script can say `texture = ...`. Under the car body shaders (`vehicle`, `vehicle_multiuv`, `vehicle_norandom_multiuv`) that key parses and is then ignored: the part is drawn with **the car's** texture sheet. We gave a battery `texture = WorldItems/CarBattery` with `shader = vehicle_norandom_multiuv`, and it rendered with the taxi's checkerboard and yellow paint smeared across it: its own 0-to-1 unwrap was sampling the car's sheet.

The one vanilla vehicle model that honours its own texture is the wheel, and it does so because of its **shader**:

```
model Vehicles_Wheel
{
    mesh = Vehicles_Wheel,
    texture = Vehicles/vehicle_wheel,
    shader = vehiclewheel,
}
```

The shader is what decides it. The same battery, with the same mesh and unwrap, declared as `texture = WorldItems/CarBattery, shader = vehiclewheel, static = TRUE`, rendered fully painted with no art authored. A static model can use the wheel shader because the game ships `vehiclewheel_static.vert`.

The price: the wheel shader has one texture and a tint, and nothing else. No paint mask, no damage, no rust, no blood, no headlight glow, no reflection. A part drawn with it never looks damaged or dirty. And it multiplies by the car's tint desaturated by 30%, which does nothing on a car with fixed livery and has not been measured by us on a randomly painted one.

Change the unwrap and the shader together. Keeping a part's own unwrap under a car shader is exactly what produced the checkerboard battery.

> **Proof:** Game test. Battery with `vehicle_norandom_multiuv` and its own texture: drawn with the taxi sheet; same battery with `vehiclewheel`: drawn with its own texture. Build 42.20.

> **Proof:** Code. `media/scripts/generated/vehicles/models_vehicles.txt` (`Vehicles_Wheel`); of 138 `shader =` lines under `media/scripts/generated/vehicles`, exactly one is `vehiclewheel` (77 `vehicle_multiuv`, 38 `vehicle`, 22 `vehicle_norandom_multiuv`); `media/shaders/vehiclewheel.frag` (one `Texture` sampler, `TintColour`, ambient and five lights, no mask or damage inputs; `desaturate(TintColour, 0.3)`) and `vehiclewheel_static.vert` exist in the install. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Item models are the opposite

This is a vehicle-path rule only. A model reached through an item (its icon or world model) is drawn on the item path, which never binds a car's sheet, so `texture =` simply works and there is no shader to name. Vanilla's item model files have 3,114 model blocks, 2,375 of them with `texture =` and not one with `shader =`. Adding `shader = vehiclewheel` to an item model is cargo cult; do not cite the wheel for it.

> **Proof:** Code. Counted `model` blocks, `texture =` and `shader =` lines in `models_items.txt`, `models_food.txt`, `models_weapons.txt` and `models_items_animals.txt` under `media/scripts/generated`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Parts with no art: put them in the roof zone

The other way, and the one our bay parts mostly use: keep the car shader, and squeeze each part's UVs into a small dark, neutral area of **the car's own sheet** that sits in the paint mask's roof zone. In the car shaders, colour zone 17 is the roof, and its mask colour is black. That zone takes paint, reflection, rust and the normal lighting, and the game never switches on damage shells, the removed-part grey, headlight glow or blood for it. A part mapped there reads as plain cast metal and never lights up like a headlight.

The trap on the other side: a full 0-to-1 unwrap under a car shader samples the whole sheet, including the light zones, so the part can glow when the headlights are on. It looks like a texture bug; it is a UV bug.

> **Proof:** Code. `media/shaders/vehicle_common.frag.h` (`const vec3 colZone17 = vec3(0.00, 0.00, 0.00); // m00 Roof`) and `vehicle.frag` (zone test); in `zombie.vehicles.BaseVehicle` nothing writes index 0 of the lights, damage, uninstall or blood enable arrays. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A texture authored too dark stays too dark

The wheel shader ends with:

```glsl
col = vec3(col.x * lighting.x * TintColourNew.x, col.y * lighting.y * TintColourNew.y, col.z * lighting.z * TintColourNew.z);
```

`lighting` is ambient plus five directional lights, clamped to between 0 and 1, and each light is cut into three hard bands. There is no position term, no shadow and no ambient occlusion, so a part deep in an engine bay is lit exactly like a roof panel facing the same way. Since lighting only multiplies, **what you see is never brighter than what you painted.** A part painted at a "physically correct" dark value is a black hole on screen, and no lighting in the game will rescue it.

The car body shaders light the same way. They also blend in paint, reflection, rust and damage before lighting, and blend the headlight glow in after it, so a body can brighten where a light is on. For a part, plan on multiply only.

The tint is not a recolour route either: model tint starts at 1.0, nothing in the vehicle code sets a part's tint, and being a multiply it can only darken.

Use vanilla's own values as the guide. Measured on the shipped textures (luminance of non-transparent pixels):

| Texture | Median | 10th to 90th percentile |
|---|---|---|
| `Vehicles/vehicle_wheel.png` (tyre rubber, vanilla's "black") | 0.145 | 0.145 to 0.145 |
| `WorldItems/CarBattery.png` | 0.247 | 0.212 to 0.493 |
| `WorldItems/EngineParts.png` | 0.602 | 0.298 to 0.769 |

So 0.145 is the floor, and engine art is a light neutral grey. Cite a distribution like this, never a minimum and maximum: we once justified a dark palette by saying `EngineParts.png` "spans 0.08 to 0.85", which was true and useless, since its median is 0.6. And space your shades geometrically (each a fixed ratio brighter), because a multiply keeps ratios, not differences.

> **Proof:** Code. `media/shaders/vehiclewheel.frag` (final colour line above, lighting clamped per channel), `media/shaders/util/math.glsl` (`quantise`: `ceil(x*3)/3`), `media/shaders/vehicle.frag` (`col *= lighting * TintColourNew;`, then the lights mix); `zombie.core.skinnedmodel.model.ModelInstance#reset` (tint 1.0); luminance measured from the installed PNG files. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The FBX unit field: read it, per file

The engine reads an FBX file's raw vertices and applies the nodes' own scaling; it ignores the file's `UnitScaleFactor` (see [the FBX export layer](/pz/build-42/vehicles/animation/the-fbx-export-layer-where-two-of-the-four-failures-lived)). Blender's importer, on the other hand, converts using `UnitScaleFactor`. So a tool that imports vanilla car meshes through Blender and one that reads the raw file disagree by that factor, and the factor is not the same in every vanilla file:

| `UnitScaleFactor` in the 146 vanilla vehicle FBX files | Files |
|---|---|
| 2.54 | 140 |
| 100 | 5 (`KeyChain_Racer`, `ModernCarWithDoors_ez`, `SportsCarWithDoors`, `vehicle_horsebox`, `vehicle_livestocktrailer`) |
| 1.0 | 1 (`Trailer`) |

Our notes had this the other way round (most at 100, a few at 2.54). The lesson stands and is stronger for it: **never assume a unit; read `UnitScaleFactor` from each file, and normalise every import path to the raw file units the model scripts are written against.** The symptom of getting it wrong is a model that is simply absent (drawn 39 times too small, or 100 times too big with the camera inside it), while the car's shadow still draws and nothing is logged.

> **Proof:** Code. Read `UnitScaleFactor` from all 146 FBX files in the install's `media/models_X/vehicles` (text files by their property line, binary files by the property record). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Two things the engine reads and never uses

**Part model `rotate`.** A part model's `offset` is applied with the same expression as the car body's (which every vanilla car uses), so it is safe. A part model's `rotate` is applied with its Y and Z negated (wheels excepted), where the body's is not, and no vanilla part uses a non-zero one. Author parts already rotated and place them with `offset` only, and you avoid the one untested path. (The 3D preview scene used by some UIs does not negate either, so the two can disagree.)

> **Proof:** Code. `zombie.vehicles.BaseVehicle#updateTransform` (body: `modelOffset.x * -1.0F`; parts: `rotateYZ = -1` when `wheelIndex == -1`, same offset expression). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

**A bone's scale keys.** The animation importer reads scale keys, but the animation player blends only position and rotation into the bone. You cannot shrink or hide a part by keying its bone's scale; the key is read and dropped.

> **Proof:** Code. `zombie.core.skinnedmodel.model.jassimp.ImportedSkeleton` (reads `GetKeyFrameScale`); `zombie.core.skinnedmodel.animation.AnimationPlayer#updateBoneAnimationTransform_Internal` (writes only `key.position` and `key.rotation`; `key.scale` stays at identity). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How the game looks at your car

If you build a tool that asks "can the player see this part?", use the game's camera: orthographic, 30 degrees above the horizon, at every heading, because the car turns under the camera. "Looking down at 60 degrees" is the same camera measured from straight down; using 60 as the elevation tests a view the game never has.

> **Proof:** Code. `zombie.vehicles.VehicleModelCamera#Begin` and `zombie.core.Core#DoPushIsoStuff` (orthographic projection, `rotate(PI / 6, 1, 0, 0)` then the yaw). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).
