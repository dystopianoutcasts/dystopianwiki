---
id: build-42-inside-the-physics-engine
slug: inside-the-physics-engine
title: 'Inside the physics engine'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: advanced
tags:
  - engine
  - physics
  - bullet
  - ragdolls
  - multiplayer
  - modding
excerpt: >-
  How Build 42.22 runs physics: the native Bullet library, the Java bridge around it, the 10 ms step, what the world feeds it, and which side (client, server, single player) simulates what.
last_updated: '2026-11-14'
related_articles:
  - how-physics-and-ragdolls-work
  - ragdolls
  - hit-reactions-and-ballistics
  - physics-shapes-and-objects
  - modding-physics-and-ragdolls
  - physics-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#the-parts) | [server owners](#which-side-runs-what) | new players should start at [How physics and ragdolls work](/pz/build-42/engine/physics-and-ragdolls/how-physics-and-ragdolls-work)

:::callout[The 1-minute version]{kind=key}
- The physics itself runs in a native library, `PZBullet`, that Java loads once at startup. Java reaches it through the `Bullet` class, which is a list of native method declarations plus a few helpers.
- `WorldSimulation` is the Java side of the step. Each frame it advances the native world in fixed 10 ms steps, then copies vehicle and physics-object results back into the game.
- The static world is sent to the native side as lists of shapes per square, built chunk by chunk. A closed door's wall shape is held back while a ragdoll is near it.
- Vehicles use the same native world on every side, with network authority deciding who trusts the result.
- Ragdoll bodies are only added when `canRagdoll()` says yes, and that method returns false on a multiplayer client and on a dedicated server.
:::

:::facts
- **Native methods in `Bullet`** 93, all bound to `PZBullet64.dll` in the capture :cite[(`zombie/core/physics/Bullet.java:89-561`, `api/native_boundary.md`)]
- **Fixed step** 0.01 s (10 ms), so 100 steps per simulated second :cite[(`zombie/core/physics/WorldSimulation.java:88-98`)]
- **Frame time fed in** 0.016666668 s times the frame-rate multiplier, times the slow-motion multiplier :cite[(`zombie/GameTime.java:202-216`)]
- **Shapes per square** at most 4 in a chunk update; 10 built-in shape kinds (ids 0 to 9; the enum's last entry, `FIRST_MESH`, is a marker for where mesh shapes start) :cite[(`zombie/iso/IsoChunk.java:1956-1975`, `zombie/iso/IsoChunk.java:5580-5592`)]
- **Height scale** 1 floor is about 2.44949 physics units (the square root of 6) :cite[(`zombie/core/physics/RagdollController.java:209-217`)]
:::

## The parts

The engine is a native library, a thin Java bridge, one stepping class and a handful of controllers that live on characters and vehicles.

::::cards
:::card[PZBullet (native)]{accent=orange}
The Bullet physics library built for the game. Java declares 93 native methods in `Bullet`, and the capture ships one build, `PZBullet64.dll`. Ragdolls, vehicles, constraints, ballistics and the static world all live inside it.
:::
:::card[Bullet (Java bridge)]{accent=blue}
The `Bullet` class loads the library, owns a small command buffer, and declares every native method. It holds no physics state of its own beyond the shape-name table.
:::
:::card[WorldSimulation]{accent=purple}
One static instance. It creates the native world, steps it, and copies the results back into vehicles and physics objects.
:::
:::card[Controllers]{accent=cream}
`RagdollController`, `BallisticsController` and `CarController` each wrap one kind of native object and talk to it through `Bullet`.
:::
::::

The bridge counts are measurable. Of the 93 native methods, 22 have "ragdoll" in the name, 20 have "allistic" (ballistics), 17 have "ehicle" (vehicle) and 8 have "onstraint". :cite[(`zombie/core/physics/Bullet.java:89-561`)] A second class, `PhysicsDebugRenderer`, adds 5 native drawing methods, which is why the native index lists 98 methods in 2 classes. :cite[(`zombie/core/physics/PhysicsDebugRenderer.java:285-293`, `api/native_boundary.md`)]

## Loading the library

Java loads the native library once, from the main screen's startup code, before any world exists.

`MainScreenState` calls `Bullet.init()` right after it prints the system properties. :cite[(`zombie/gameStates/MainScreenState.java:221`)] The method sets a flag so a second call only logs a warning, then picks a library name: `PZBullet` on macOS, otherwise `PZBullet` plus `NoOpenGL` on a Unix dedicated server, plus `64`, plus `d` when the system property `zomboid.debuglibs.bullet` is `1`. :cite[(`zombie/core/physics/Bullet.java:55-82`)]

Next it allocates a 4096-byte little-endian buffer and calls `initPZBullet`. :cite[(`zombie/core/physics/Bullet.java:77-80`)] The capture's native folder holds only `PZBullet64.dll`, so the `NoOpenGL` and debug variants are not in the capture. :cite[(`api/native_boundary.md`)]

## The command buffer

A few updates do not call a native method per value. They write a command byte and a payload into the shared buffer and send it with one call.

The command constants are 4 (add vehicle), 5 (scroll chunk map), 6 (activate chunk map), 7 (init world), 8 (update chunk), 9 (debug draw), 10 (step), 12 (update player list) and -1 (end). :cite[(`zombie/core/physics/Bullet.java:39-47`)] Only two are written by Java in the capture: update chunk and update player list. :cite[(`zombie/core/physics/Bullet.java:248-290`)]

`CatchToBullet` hands the buffer to the native `ToBullet` and logs any `RuntimeException` instead of letting it escape. :cite[(`zombie/core/physics/Bullet.java:89-97`)] The player-list sender exists, but its only wrapper, `IsoChunk.updatePlayerInBullet`, has no caller in the capture's Java. :cite[(`zombie/core/physics/Bullet.java:248-262`, `zombie/iso/IsoChunk.java:3015-3018`)]

## One physics step

A physics step is two phases: Java advances the native world in 10 ms pieces, then reads back what moved.

:::flow[One call to WorldSimulation.update]
- Add this frame's seconds to a running total
- Take one 10 ms step for each whole 10 ms in the total
- Before each step, apply vehicle impulses from hit objects and prone characters
- Read every vehicle back into its Java object
- Read every free physics object back into its Java object
:::

`updatePhysic` adds `getPhysicsSecondsSinceLastUpdate()` to a running total, and while the total is at least 0.01 it runs `updateVehiclePhysics` and then `Bullet.stepSimulation(0.01F, 0, 0.0F)`. :cite[(`zombie/core/physics/WorldSimulation.java:87-102`)] The seconds fed in are one 60th of a second times the frame-rate multiplier, times the debug slow-motion multiplier. :cite[(`zombie/GameTime.java:202-216`)]

Before each native step the loop visits every vehicle in the current cell, applying accumulated impulses from objects that hit it, impulses from prone characters, and a check of the surrounding chunks. :cite[(`zombie/core/physics/WorldSimulation.java:111-117`)] A frame counter, `bulletFrameNo`, goes up only when at least one step ran; ragdolls use it to tell a first frame from a later one. :cite[(`zombie/core/physics/WorldSimulation.java:100-101`, `zombie/core/physics/RagdollController.java:124-126`)]

The class also keeps its own millisecond clock. It is pushed forward 10 ms per step, and snaps back to the server time whenever the two differ by more than 100 ms. :cite[(`zombie/core/physics/WorldSimulation.java:104-108`)]

`WorldSimulation.update` is called from the world's per-frame update, right after the server-only `VehicleManager.serverUpdate`. :cite[(`zombie/iso/IsoWorld.java:3003-3012`)] Nothing steps until `create()` has run once. :cite[(`zombie/core/physics/WorldSimulation.java:125-127`)]

## Reading results back

After the steps, Java pulls vehicles out in batches and then free physics objects.

`getVehiclePhysics` fills a 8192-float array; each vehicle record carries an id, position, rotation, velocity, speed, a collide flag and per-wheel steering, rotation, skid and suspension values. :cite[(`zombie/core/physics/WorldSimulation.java:44`, `zombie/core/physics/WorldSimulation.java:136-176`)] For each record, the loop finds the Java vehicle by id. When that vehicle may take the result, the loop copies the transform, velocity, collide flag and wheel values onto it. :cite[(`zombie/core/physics/WorldSimulation.java:177-236`)]

Free physics objects come next. Each record's x and z are shifted by the world offset, and the Java object is moved to that square with its height divided by 3 and by 0.8164967. :cite[(`zombie/core/physics/WorldSimulation.java:256-274`)] The only way to put an object in that table is the Lua global `addPhysicsObject`, which spawns a trash-can sprite at the player's position. :cite[(`zombie/Lua/LuaManager.java:11009-11019`)]

Ragdolls do not use this path. A ragdoll's result is read by the ragdoll's own controller during the character's animation update. See [Ragdolls](/pz/build-42/engine/physics-and-ragdolls/ragdolls).

## What the world feeds the engine

The static world reaches the native side as shape lists, one per square, built by the chunk code.

`WorldSimulation.create` reads the map bounds, then calls `Bullet.initWorld`, which calls the native `initWorld` with a server flag and then `activateChunkMap` for player 0. :cite[(`zombie/core/physics/WorldSimulation.java:53-81`, `zombie/core/physics/Bullet.java:113-116`)] A chunk is sent one level at a time. For each of its 8 by 8 squares, `updatePhysicsForLevel` writes up to 4 shape bytes, each the shape number plus one. :cite[(`zombie/iso/IsoChunk.java:1956-1975`)]

The shape kinds are an enum in `IsoChunk`, listed below. :cite[(`zombie/iso/IsoChunk.java:5580-5592`)]

:::chips
- Solid
- WallN
- WallW
- WallS
- WallE
- Tree
- Floor
- StairsMiddleNorth
- StairsMiddleWest
- SolidStairs
- FIRST_MESH
:::

A tile property `PhysicsShape` can name `Solid`, `WallN`, `WallW`, `WallS`, `WallE`, `Tree` or `Floor` directly. A tile property `PhysicsMesh` names a physics shape script (the module `Base.` is added when the name has no dot), and its shape is numbered `FIRST_MESH` plus the script's index. :cite[(`zombie/iso/IsoChunk.java:2096-2128`)] Both are read only for squares without a `CarSlowFactor` property. :cite[(`zombie/iso/IsoChunk.java:2076-2077`)] The model-shape side is on [Physics shapes and objects](/pz/build-42/engine/physics-and-ragdolls/physics-shapes-and-objects).

Doors get special handling. While a closed door's square is within 1.0 of a live ragdoll's character, the engine skips the wall shape and puts the square on a delayed list instead, so a ragdoll is not pinned inside a door frame. :cite[(`zombie/iso/IsoChunk.java:2072-2095`, `zombie/core/physics/RagdollController.java:857-868`)] The delayed squares are rechecked later. :cite[(`zombie/iso/IsoChunk.java:5473-5482`)]

At startup, `GameLoadingState` loads every physics shape script's mesh, then `Bullet.initPhysicsMeshes` defines each ready mesh in the native world and records its index by script name. :cite[(`zombie/gameStates/GameLoadingState.java:354`, `zombie/gameStates/GameLoadingState.java:378-380`, `zombie/core/physics/Bullet.java:118-188`)]

## The coordinate rule

Native coordinates swap the vertical and depth axes and stretch height.

`pzSpaceToBulletSpace` keeps x, puts the game's y into z, and sets the native y to the game's z times 2.44949. :cite[(`zombie/core/physics/RagdollController.java:209-217`)] Read back, `WorldSimulation` divides native height by 3 and by 0.8164967 for objects, and 3 times 0.8164967 is 2.44949. :cite[(`zombie/core/physics/WorldSimulation.java:271`)]

## Which side runs what

Single player runs everything. On a client or a dedicated server several pieces are switched off, and the ragdoll gate is the largest.

| Piece | Single player | Multiplayer client | Dedicated server | Code |
|---|---|---|---|---|
| Native library loaded | Yes | Yes | Yes, `NoOpenGL` build on Unix | :cite[(`zombie/core/physics/Bullet.java:66-75`)] |
| `WorldSimulation.update` called | Yes | Yes, plus `VehicleManager.clientUpdate` | Yes, after `VehicleManager.serverUpdate` | :cite[(`zombie/core/physics/WorldSimulation.java:125-134`, `zombie/iso/IsoWorld.java:3003-3012`)] |
| Extra per-player chunk maps activated | Yes | Yes | No | :cite[(`zombie/core/physics/WorldSimulation.java:293-299`)] |
| Vehicle result trusted | Yes | Only when authority allows | Yes | :cite[(`zombie/core/physics/WorldSimulation.java:177-236`)] |
| Ragdoll script data uploaded | Yes | Yes | No | :cite[(`zombie/scripting/objects/RagdollScript.java:108-115`)] |
| Ragdoll skeleton and pose set up | Yes | Yes | No | :cite[(`zombie/characters/RagdollBuilder.java:71-74`, `zombie/characters/RagdollBuilder.java:105-109`)] |
| A character may ragdoll | Yes, if options allow | No | No | :cite[(`zombie/characters/IsoGameCharacter.java:16405-16408`)] |
| Ballistics controller updated | Yes | Yes | No | :cite[(`zombie/characters/IsoGameCharacter.java:16437-16445`)] |

The last two rows matter most. `canRagdoll()` begins with `if (GameClient.client || GameServer.server) return false`, so in this capture no character becomes a ragdoll in multiplayer, on either side. :cite[(`zombie/characters/IsoGameCharacter.java:16405-16407`)] The game's own option tooltip says the same thing: ragdolls are not (yet) available in multiplayer. :cite[(`media/lua/shared/Translate/EN/UI.json:224`)]

## Vehicles in the same world

Vehicles are not a separate engine. Each one is a native vehicle body in the same world, driven by `CarController` and read back each frame.

`CarController` adds the vehicle with `Bullet.addVehicle`, sets its static and active flags, and later sends engine, brake and steering values through `Bullet.controlVehicle`. :cite[(`zombie/core/physics/CarController.java:95-107`, `zombie/core/physics/CarController.java:335`)] Who trusts the native result depends on the vehicle's authorization, one of `Server`, `LocalCollide`, `RemoteCollide`, `Local` or `Remote`. :cite[(`zombie/vehicles/BaseVehicle.java:11863-11869`)]

On a client, a vehicle whose authorization is `Server` has its speed set to 0, and the speed is otherwise taken from the native result. A vehicle with local-collide authority on a client is reported to the server with a `VehicleCollide` packet once its simulated state has not changed for more than a second. :cite[(`zombie/core/physics/WorldSimulation.java:191-214`)] A towing constraint breaks when its impulse reaches 1500 (both vehicles with an up-vector dot above 0.8) or 500 (otherwise), unless the constraint changed in the last 2 seconds; the check is skipped on a dedicated server. :cite[(`zombie/core/physics/Bullet.java:50-52`, `zombie/core/physics/Bullet.java:345-362`)]

The packet classes are `VehiclePhysicsPacket` and its reliable and unreliable variants. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java`, `zombie/network/packets/vehicle/VehiclePhysicsReliablePacket.java`, `zombie/network/packets/vehicle/VehiclePhysicsUnreliablePacket.java`)] Their fields are not covered here. The published vehicle pages, such as [the car physics mods](/pz/build-42/vehicles/mod-studies/car-physics-mods), cover how vehicles are tuned and modded.

## What Lua can reach

Lua cannot call `Bullet` or `WorldSimulation` directly. It sees physics only through the character and vehicle classes.

Of the physics package, only `Transform` is on the engine's Lua-exposed class list, and `PhysicsShapeScript` is exposed with a single `Load` method. :cite[(`api/lua_exposed.jsonl`)] `IsoGameCharacter` is exposed with all members, and 22 of its ragdoll, physics-hit-reaction and ballistics methods are marked Lua-callable, among them `canRagdoll`, `isRagdoll`, `isRagdollSimulationActive`, `getRagdollController`, `setUsePhysicHitReaction` and `releaseRagdollController`. :cite[(`api/api.jsonl`)]

The class a method returns is a separate question. `RagdollController` and `BallisticsController` are not in the exposed list, so whether Lua can call methods on the object that `getRagdollController()` returns is not verified here. :cite[(`api/lua_exposed.jsonl`)]

## How we know

:::callout[How we know]{kind=proof}
- Every line number is from the 42.22 decompiled source in capture B42_3d39148846. The decompiler's header says to verify subtle control flow against bytecode; nothing here depends on that.
- The index citation for the library load (`native_boundary.md`) gives lines 68 and 70 of `Bullet.java`; the decompiled file has the same calls at lines 72 and 74, and this page cites the file.
- Not verified: that a dedicated server runs `GameLoadingState` and so `Bullet.initPhysicsMeshes` (it is the only caller). Not verified: what the native step does with the `0` and `0.0F` arguments, since the library is not decompiled.
- The 22 count of Lua-callable methods was made by matching "agdoll", "PhysicHit" and "allistic" in the method names of `IsoGameCharacter` in `api.jsonl`; it is a name match, not a hand-read list.
- Nothing on this page was run in a game.
:::
