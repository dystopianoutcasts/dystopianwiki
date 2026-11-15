---
id: build-42-physics-shapes-and-objects
slug: physics-shapes-and-objects
title: 'Physics shapes and objects'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: advanced
tags:
  - engine
  - physics
  - modding
  - vehicles
  - models
excerpt: >-
  How Build 42.22 turns a model file into a collision shape for tiles and vehicles, and what the separate Java-only IsoPhysicsObject class is for.
last_updated: '2026-11-14'
related_articles:
  - how-physics-and-ragdolls-work
  - inside-the-physics-engine
  - ragdolls
  - hit-reactions-and-ballistics
  - modding-physics-and-ragdolls
  - physics-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#physicsshape-scripts) | [vehicle script authors](#vehicle-collision-shapes) | new players should start at [How physics and ragdolls work](/pz/build-42/engine/physics-and-ragdolls/how-physics-and-ragdolls-work)

:::callout[The 1-minute version]{kind=key}
- A `physicsShape` script points at a mesh inside a model file and says how to move, turn and scale it. At startup the engine loads every one of those meshes and hands the points to the native physics library.
- Two things can use a shape after that: a tile that has the property `PhysicsMesh` with the script's name, and a vehicle script `physics mesh` block that names it. In the vanilla capture the shapes file holds 90 shapes and no vanilla vehicle script has a `physics mesh` block.
- Vehicle scripts also have two cheaper shapes, `box` and `sphere`. The vanilla vehicle scripts use only those two.
- `IsoPhysicsObject` is a different thing. It is a small Java-only motion class for thrown and falling objects, and it does not use the native physics library.
- Not verified here: the model files themselves (they are not in the capture), and which vanilla tiles use `PhysicsMesh`.
:::

:::facts
- **Shapes in the vanilla file** 90 (80 from `physics/ramp20`, 10 from `physics/ramp10`) :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt`)]
- **Fields the vanilla shapes set** `mesh`, `translate`, `rotate` (every block); none sets `scale`, `postProcess`, `allMeshes` or `undoCoreScale` :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt`)]
- **Vehicle shape blocks kept per vehicle** at most 10 :cite[(`zombie/scripting/objects/VehicleScript.java:345`)]
- **Vanilla vehicle collision blocks** 80 `physics box` and 4 `physics sphere`, in 20 files :cite[(`media/scripts/generated/vehicles`)]
- **Fixed shape ids** 10 (ids 0 to 9); mesh shapes are numbered from 10 :cite[(`zombie/iso/IsoChunk.java:5580-5592`)]
- **`IsoPhysicsObject` terminal velocity** -0.05 :cite[(`zombie/iso/IsoPhysicsObject.java:19`)]
:::

## The parts

Collision shapes come from two scripts and one asset class, and a separate class handles loose objects.

::::cards
:::card[PhysicsShapeScript]{accent=orange}
One script block per shape. It names a mesh and its transform, and it is the thing a tile or a vehicle script refers to by name.
:::
:::card[PhysicsShape asset]{accent=blue}
The loaded mesh: a list of point lists with a transform each. `PhysicsShapeAssetManager` loads it from a model file and reloads it when the file changes.
:::
:::card[VehicleScript.PhysicsShape]{accent=purple}
One `physics` block inside a vehicle script: a box, a sphere or a mesh. Different class, same word.
:::
:::card[IsoPhysicsObject]{accent=cream}
A world object with its own simple motion rules. Balls, falling clothing, thrown bottles and giblets use it.
:::
::::

## PhysicsShape scripts

A `physicsShape` block names a mesh in a model file and the transform to apply to its points before they are sent to the native library.

The block id becomes the script's name, so a shape in `module Base` called `ramp10segment1n` is `Base.ramp10segment1n`. :cite[(`zombie/core/physics/Bullet.java:153`)] The vanilla file is `media/scripts/generated/models_isoobject_physicsShape.txt`, with every block inside `module Base`. :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt`)]

| Key | Value | Meaning | Code |
|---|---|---|---|
| `mesh` | text | Model file and mesh name, joined by `\|` (see below) | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:45-46`, `zombie/core/physics/FileTask_LoadPhysicsShape.java:49-60`)] |
| `translate` | 3 floats | Offset added to every point | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:47-48`)] |
| `rotate` | 3 floats | Rotation, in degrees, applied to every point | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:49-50`)] |
| `scale` | float | Uniform scale; default 1.0 | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:21`, `:51-52`)] |
| `allMeshes` | boolean | Passed to the asset as a load option | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:53-54`, `zombie/core/physics/Bullet.java:125`)] |
| `postProcess` | text | Passed to the asset as a load option | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:55-56`, `zombie/core/physics/Bullet.java:124`)] |
| `undoCoreScale` | boolean | If true, the scale is multiplied by 0.6666667 after reading | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:57-58`, `:62-64`)] |

Key names are matched without regard to case, and a key the reader does not know is ignored. :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:42-59`)] Vector values are split at spaces and need three entries; a value that cannot be parsed as a number becomes 0. :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:67-72`)] 

A `scale` value that is not a valid number is not guarded: `Float.parseFloat` is called directly, so it would throw. :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:51-52`)] That throw was not run in a game.

The text after the last `|` in `mesh` is the mesh name inside the file, and the text before it is the file's path under `media/models` or `media/models_x`. :cite[(`zombie/core/physics/FileTask_LoadPhysicsShape.java:49-60`)] The vanilla shapes read `physics/ramp10|Segment1` and the like: file `physics/ramp10`, mesh `Segment1`. The model files are not in the capture, so whether they exist under those names was not checked. :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt`)]

In vanilla there are 90 shapes: 10 take their mesh from `physics/ramp10` and 80 from `physics/ramp20`, and all of them set only `mesh`, `translate` and `rotate`. :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt`)]

## From file to native shape

At startup the engine loads each shape's model, converts it to point lists and defines it in the native library, once, in script order.

:::flow[Loading a physics shape]
- The script manager parses every `physicsShape` block
- `Bullet.startLoadingPhysicsMeshes` asks the asset manager to load each mesh
- `FileTask_LoadPhysicsShape` imports the model file as a static mesh
- `Bullet.initPhysicsMeshes` transforms the points and calls `definePhysicsMesh`
- The shape's name is stored against its number
:::

`startLoadingPhysicsMeshes` loads one asset per script, passing `postProcess` and `allMeshes`. :cite[(`zombie/core/physics/Bullet.java:118-128`)] The load runs as a file task, reads the file with Assimp (the library the engine uses to read model files), and builds a static mesh. :cite[(`zombie/core/physics/PhysicsShapeAssetManager.java:35-43`, `zombie/core/physics/FileTask_LoadPhysicsShape.java:62-80`)] Each loaded asset holds a list of meshes, and each mesh holds its points and a transform. :cite[(`zombie/core/physics/PhysicsShape.java:21`, `zombie/core/physics/PhysicsShape.java:64-76`)]

`initPhysicsMeshes` runs from the game-loading state after the load calls have been made, and it creates the world simulation itself. For each script whose asset is ready, it calls `definePhysicsMesh` once per mesh, with a flag that marks a compound shape when the asset has more than one mesh. :cite[(`zombie/core/physics/Bullet.java:130-153`, `zombie/gameStates/GameLoadingState.java:354`, `zombie/gameStates/GameLoadingState.java:378-380`)] Shape numbers count up from 0 in script order, and only scripts whose asset is ready get a number. :cite[(`zombie/core/physics/Bullet.java:133-153`)] A script whose model failed to load, or has not finished, is skipped with no message in this method. :cite[(`zombie/core/physics/Bullet.java:139-141`)]

The points are first moved by the script's translate, rotate and scale and by the mesh's own transform. :cite[(`zombie/core/physics/Bullet.java:144-150`, `zombie/core/physics/Bullet.java:191-215`)] What the native library does with the points is not verified.

The dedicated server also creates this asset manager, so a server can load shapes too. :cite[(`zombie/network/GameServer.java:1482`)] Whether a server runs `initPhysicsMeshes` is not verified.

The asset manager watches the model files it loaded.

While a file watcher is active (the engine registers it with its debug file watcher), a changed `.fbx`, `.glb` or `.x` file reloads the shapes that came from it. :cite[(`zombie/core/physics/PhysicsShapeAssetManager.java:31`, `zombie/core/physics/PhysicsShapeAssetManager.java:64-84`)] That reload replaces the asset's point lists. It does not by itself call `definePhysicsMesh` again, so the native shape would not change until `initPhysicsMeshes` runs again. This is read from the code and not run.

## Tile shapes

A tile can ask for one of the engine's fixed shapes by name, or for one of the mesh shapes by script name.

The engine has ten fixed shape ids and a mesh range that starts after them. :cite[(`zombie/iso/IsoChunk.java:5580-5592`)]

:::chips
- 0 Solid
- 1 WallN
- 2 WallW
- 3 WallS
- 4 WallE
- 5 Tree
- 6 Floor
- 7 StairsMiddleNorth
- 8 StairsMiddleWest
- 9 SolidStairs
- 10 and up: mesh shapes
:::

The tile property `PhysicsShape` accepts Solid, WallN, WallW, WallS, WallE, Tree or Floor. The property `PhysicsMesh` accepts a shape script's name, and when the name has no dot the engine adds `Base.` in front of it. :cite[(`zombie/iso/IsoChunk.java:2103-2133`)] The tile's shape number is 10 plus the script's number, and a name that has no number (no such script, or not loaded) adds nothing. :cite[(`zombie/iso/IsoChunk.java:2122-2133`)]

Each chunk square sends at most 4 shape numbers to the native library, and the engine logs an error when a square has more. :cite[(`zombie/iso/IsoChunk.java:1956-1975`, `zombie/iso/IsoChunk.java:1977-1983`)] 

Both tile properties live in the tile definition files, which are binary and not in the capture, so which vanilla tiles use `PhysicsMesh` is not verified. The chunk side of this, including the door and active-ragdoll rule, is on [Inside the physics engine](/pz/build-42/engine/physics-and-ragdolls/inside-the-physics-engine#what-the-world-feeds-the-engine).

## Vehicle collision shapes

A vehicle script describes its collision body with `physics` blocks, and a block can be a box, a sphere or a mesh that points at a `physicsShape` script.

The parser keeps a block only if it is valid, and keeps at most 10 per vehicle. :cite[(`zombie/scripting/objects/VehicleScript.java:343-347`)] The block id picks the type: `box`, `sphere` or `mesh`; any other id drops the block. :cite[(`zombie/scripting/objects/VehicleScript.java:997-1012`)]

| Type | Keys | Kept only if | Code |
|---|---|---|---|
| `box` | `offset`, `extents`, `rotate` | all three extents are above 0 | :cite[(`zombie/scripting/objects/VehicleScript.java:1019-1034`, `zombie/scripting/objects/VehicleScript.java:1037-1041`)] |
| `sphere` | `offset`, `radius` | radius above 0 | :cite[(`zombie/scripting/objects/VehicleScript.java:1019-1034`, `zombie/scripting/objects/VehicleScript.java:1042-1046`)] |
| `mesh` | `offset`, `rotate`, `physicsShapeScript`, `scale` | `physicsShapeScript` is set; an extents value of 0 or less becomes 1 | :cite[(`zombie/scripting/objects/VehicleScript.java:1019-1034`, `zombie/scripting/objects/VehicleScript.java:1047-1054`)] |

For a mesh block, `scale` sets the extents to that one number on all three axes. :cite[(`zombie/scripting/objects/VehicleScript.java:1030-1033`)] The mesh path is a different route from the tile route. In `initPhysicsMeshes`, for every vehicle script and every block of type mesh whose shape script and asset are ready, the engine builds a matrix from the vehicle's model scale, the shape's translate, rotate and scale, and the mesh transform, and calls `defineVehiclePhysicsMesh` with the vehicle's full name and slot `1 + block index`. :cite[(`zombie/core/physics/Bullet.java:158-188`)] The mesh block adds no numbers to the box and sphere array that goes to `defineVehicleScript`. :cite[(`zombie/scripting/objects/VehicleScript.java:629-648`)]

When a vehicle script has no `physics` blocks and no chassis shape, the native body is one box taken from the script's `extents`. :cite[(`zombie/scripting/objects/VehicleScript.java:599-628`)]

In vanilla there are 84 `physics` blocks in 20 vehicle script files: 80 `physics box` and 4 `physics sphere`, and none is a `physics mesh`. Sixteen of the 20 files are car, van, truck and SUV collision templates, and the other four are trailers. :cite[(`media/scripts/generated/vehicles`)] So in the 42.22 capture, the mesh route for vehicles is code that vanilla does not use; a mod that wants it must supply its own `physicsShape` script and model file. That route was not run in a game.

Lua can reach the vehicle side. `VehicleScript` has `getPhysicsShapeCount`, `getPhysicsShape`, `addPhysicsShape`, `removePhysicsShape`, `getPhysicsChassisShape` and `hasPhysicsChassisShape`, and `VehicleScript.PhysicsShape` has `getExtents`, `getOffset`, `getRadius`, `getRotate`, `getTypeString`, `getPhysicsShapeScript`, `setPhysicsShapeScript` and `setRadius`. :cite[(`api/api.jsonl`, `api/lua_exposed.jsonl`)] The vanilla vehicle editor uses `getPhysicsShape` and `getAllPhysicsShapes`. :cite[(`media/lua/client/Vehicles/ISUI/EditVehicleState.lua`)]

## Lua access to shape scripts

Lua can look up a shape script by name or list them all, but it can call only one method on the object it gets back.

`ScriptManager.getPhysicsShape(name)` and `ScriptManager.getAllPhysicsShapes()` are Lua-callable. :cite[(`api/api.jsonl`)] 

The `PhysicsShapeScript` class is exposed to Lua, and its only exposed member is `Load`. Its fields (`meshName`, `translate`, `rotate`, `scale`, `postProcess`, `allMeshes`) are marked as not Lua-callable in the index. :cite[(`api/lua_exposed.jsonl`, `api/api.jsonl`, `zombie/Lua/LuaManager.java:2340`)] A Lua mod therefore cannot read or change a shape's values on a loaded script. It can ship a new `physicsShape` script file, which is described on [Modding physics and ragdolls](/pz/build-42/engine/physics-and-ragdolls/modding-physics-and-ragdolls).

## IsoPhysicsObject

`IsoPhysicsObject` is a small world-object class with its own gravity, bounce and drag, written in Java, and it never calls the native physics library.

It extends `IsoMovingObject`, is not solid and cannot be shot. :cite[(`zombie/iso/IsoPhysicsObject.java:14`, `zombie/iso/IsoPhysicsObject.java:22-25`)] The simulation is a few lines per update. :cite[(`zombie/iso/IsoPhysicsObject.java:50-112`)]

| Part | What it does | Code |
|---|---|---|
| Movement | Splits a move into up to 8 sub steps, by distance, so a fast object does not skip through a wall | :cite[(`zombie/iso/IsoPhysicsObject.java:15`, `zombie/iso/IsoPhysicsObject.java:27-42`)] |
| Wall hit | Reverses the speed on the hit axis, halves it, and calls `collideWall` | :cite[(`zombie/iso/IsoPhysicsObject.java:53-66`)] |
| Drag | Horizontal speed is multiplied by `1 - 0.1` raised to `30 / fps` each update; `fps` is 10 on a server and the locked frame rate otherwise | :cite[(`zombie/iso/IsoPhysicsObject.java:68-75`)] |
| Gravity | `velZ` drops by `0.005 * 30 / fps` each update, and stops at the terminal velocity of -0.05 | :cite[(`zombie/iso/IsoPhysicsObject.java:76-81`, `zombie/iso/IsoPhysicsObject.java:19`)] |
| Floor | Below z of -32, or when it falls through a solid floor, the object bounces at half speed and calls `collideGround` | :cite[(`zombie/iso/IsoPhysicsObject.java:86-98`)] |
| Rest | Speeds under 0.0001 become 0, and the sprite stops animating when both are 0 | :cite[(`zombie/iso/IsoPhysicsObject.java:100-112`)] |

In this class the two hooks `collideWall` and `collideGround` do nothing, and subclasses override them. :cite[(`zombie/iso/IsoPhysicsObject.java:44-49`)]

Five classes extend it, all in `zombie/iso/objects`: `IsoBall`, `IsoBloodDrop`, `IsoFallingClothing`, `IsoMolotovCocktail` and `IsoZombieGiblets`. :cite[(`zombie/iso/objects`)] A thrown weapon whose `PhysicsObject` item field is the ball item makes an `IsoBall`, and any other value makes an `IsoMolotovCocktail`. :cite[(`zombie/characters/IsoGameCharacter.java:8246-8256`)] A zombie helmet that falls off makes an `IsoFallingClothing`, and `ZombieEatBodyState` and `ZombieHitReactionState` make `IsoZombieGiblets`. :cite[(`zombie/characters/IsoGameCharacter.java:17245`, `zombie/ai/states/ZombieEatBodyState.java:75`, `zombie/ai/states/ZombieHitReactionState.java:135`)] A search of the capture found no `new IsoBloodDrop` call. :cite[(`zombie/iso/objects/IsoBloodDrop.java`)]

Other code treats the class as a special case in six places. :cite[(`zombie/iso/IsoMovingObject.java:282`, `zombie/iso/IsoMovingObject.java:362`, `zombie/iso/IsoMovingObject.java:813`, `zombie/iso/IsoObject.java:4057`, `zombie/characters/IsoPlayer.java:5739`, `zombie/characters/animals/IsoAnimal.java:3642`)] What each one does was not read for this page.

### The Lua global that uses native objects

One Lua global, `addPhysicsObject`, creates a native physics object near the player and tracks it in a map the simulation reads back.

`addPhysicsObject` has no arguments, calls `Bullet.addPhysicsObject` with the local player's position, creates an `IsoPushableObject` with the sprite `trashcontainers_01_16`, and stores it in `WorldSimulation.physicsObjectMap` against the native id. It always returns nil. :cite[(`zombie/Lua/LuaManager.java:11008-11019`)] 

The index lists it as a Lua global. :cite[(`api/lua_globals.jsonl`)] No file in the capture's `media/lua` calls it. :cite[(`media/lua`)] Each simulation step reads those native objects back into their Java objects. :cite[(`zombie/core/physics/WorldSimulation.java:256-274`)] That is the only place in the capture that adds to that map. :cite[(`zombie/core/physics/WorldSimulation.java`)]

`IsoPushableObject` is a different class from `IsoPhysicsObject`. It extends `IsoMovingObject` directly. :cite[(`zombie/iso/IsoPushableObject.java:21`)]

## Where vehicle physics sits

Vehicle physics is part of the same native world as ragdolls and tile shapes, and it has its own controller class and its own network packets.

Each vehicle gets a `CarController`, which adds the vehicle to the native world and sends steering and engine input. :cite[(`zombie/core/physics/CarController.java:95`, `zombie/core/physics/CarController.java:335`)] `createPhysics` creates it on every side, and only the call that creates the simulation is skipped on a dedicated server. :cite[(`zombie/vehicles/BaseVehicle.java:807`, `zombie/vehicles/BaseVehicle.java:841-857`)] Each step, `updateVehiclePhysics` applies impulses and checks surrounding chunks, and then the world reads the vehicle states back. :cite[(`zombie/core/physics/WorldSimulation.java:111-117`, `zombie/core/physics/WorldSimulation.java:136-176`)] Who controls a vehicle is an authorization value that moves between the server and the clients. :cite[(`zombie/vehicles/BaseVehicle.java:11863-11869`)]

All of this is in the published vehicle pages, and this unit does not repeat it. Start at [Inside the physics engine](/pz/build-42/engine/physics-and-ragdolls/inside-the-physics-engine#vehicles-in-the-same-world) for how it fits the simulation step, and then the vehicles section of this wiki. The vehicle packet fields are listed on [Physics reference](/pz/build-42/engine/physics-and-ragdolls/physics-reference).

## How we know

:::callout[How we know]{kind=proof}
- Every engine claim is from the 42.22 decompiled source and the game's script and Lua files in capture B42_3d39148846. The counts of shapes and vehicle blocks were made with a script that parses the cited files.
- Not verified: the model files named by the vanilla shapes (the capture has no models), which vanilla tiles set `PhysicsMesh`, what the native library does with the points, whether a dedicated server runs `initPhysicsMeshes`, and whether a changed model file reaches the native shape without a restart.
- A `physics mesh` vehicle block and a `physicsShape` script from a mod were not run in a game.
- Nothing on this page was run in a game.
:::
