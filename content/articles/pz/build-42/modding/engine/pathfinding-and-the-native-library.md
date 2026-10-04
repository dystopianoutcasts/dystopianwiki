---
id: build-42-pathfinding-and-the-native-library
slug: pathfinding-and-the-native-library
title: 'Pathfinding: what Java decides and what the native library hides'
game: pz
version: build-42
section: modding
category: engine
difficulty: advanced
tags:
  - engine
  - pathfinding
  - zombies
  - multiplayer
  - native
excerpt: >-
  In Build 42.21 the route search itself runs in a native library, PZPathFind64,
  on its own thread. Java still decides when to search, what it tells the search
  about the walker, and how the walker follows the route. What each side does,
  the queue order, how squares reach the pathfinder, and why MapKnowledge does
  nothing with the native search on.
last_updated: '2026-10-04'
related_articles:
  - zombies-states-and-the-ai-director
  - lua-classes-world-3
  - lua-classes-characters-2
---
# Pathfinding: what Java decides and what the native library hides

Outcast, if you have ever tried to make a zombie or a player walk somewhere from a mod and watched it stand still, this page is for you. Pathfinding in Build 42 is split in two: Java decides when to look for a route and walks the character along it, and a native library does the search in between. We can read the first half and not the second, so this page is honest about where the code stops being readable.

## What it does for the player

When you click to walk to a door, when a zombie goes around a fence to reach you, when a cow finds its way back to a trough, something has to find a route around walls, through doorways, over low fences, up stairs and around parked cars. That is the pathfinder.

## Where it lives

| Piece | Where | Readable? |
|---|---|---|
| The per-character driver | `zombie.pathfind.PathFindBehavior2` | Yes. Holds the goal, asks for a route, follows it |
| The bridge to the native search | `zombie.pathfind.nativeCode.PathfindNative`, `PathfindNativeThread`, `PathFindRequest` | Yes, up to the `native` method calls |
| The route search | the native library `PZPathFind64` (loaded with `System.loadLibrary`) | **No.** Costs, the graph and the search are compiled code |
| The old Java search | `zombie.pathfind.PolygonalMap2` (visibility graph, `VGAStar`), `zombie.pathfind.highLevel.HLAStar` | Yes, but in 42.21 only used when the debug option `Pathfind.UseNativeCode` is off |
| The straight-line test | `PolygonalMap2#lineClearCollide` and `LineClearCollideMain#isNotClearOld` | Yes. Java, reads the world's squares directly |
| The state that uses it | `zombie.ai.states.PathFindState` (zombies), `media/lua/client/TimedActions/WalkToTimedAction.lua` and `media/lua/client/Vehicles/TimedActions/ISPathFindAction.lua` (players) | Yes |

The debug option `Pathfind.UseNativeCode` defaults to true, and the world reads it when it starts: with it on (the normal case) the Java search is never even initialised.

> **Proof:** Code. `zombie.pathfind.nativeCode.PathfindNative#init` (static: `System.loadLibrary("PZPathFind64" + libSuffix)`; called from `zombie.GameWindow` and from `zombie.network.GameServer`) and its `native` methods `initWorld`, `updateChunk`, `removeChunk`, `updateSquare`, `addVehicle`, `removeVehicle`, `findPath`; `zombie.debug.DebugOptions` `Pathfind.UseNativeCode` default `true`; `zombie.iso.IsoWorld#init` (initialises `PathfindNative` or `PolygonalMap2`, not both). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The chain, from "go there" to footsteps

1. Something calls `pathToLocation`, `pathToCharacter` or `pathToSound` on a character. `IsoGameCharacter#pathToAux` first tries a straight line (same floor, within 30 tiles, `lineClearCollide` says clear). If it is clear the character just walks; if not, it sets the animation variable `bPathfind`, and the character's transition files move it into `PathFindState` (see [the zombie article](/pz/build-42/modding/engine/zombies-states-and-the-ai-director) for how variables pick states).
2. Each tick, `PathFindState#execute` (or a player's walk timed action) calls `PathFindBehavior2#update`. On the first call it hands a request to `PathfindNative#addRequest`, which cancels any earlier request from the same walker and queues the new one for the pathfinding thread.
3. The thread, `PathfindNativeThread`, first copies pending chunk, square and vehicle changes into the native world, then runs at most **two** searches per pass. It takes players first, then zombies that have a target, then everything else (wandering zombies, animals).
4. `PathfindNative#findPath` packs the request into a 47-byte buffer and calls the native `findPath`. The route comes back as a list of points.
5. Back on the main thread, `PathfindNative#updateMain` hands the result to `PathFindBehavior2#Succeeded` or `#Failed`, and from the next tick `PathFindBehavior2#update` walks the character along the points, opening doors, climbing windows and fences and switching to crawling where the route says so.

If the character makes no progress for a while, `PathFindBehavior2#update` gives up and returns `Failed` (the `WalkingOnTheSpot` check); a zombie then drops back to idle.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#pathToAux`; `zombie.ai.states.PathFindState#execute`; `zombie.pathfind.PathFindBehavior2#update` (`addRequest` when progress is `notrunning`; `walkingOnTheSpot.check` returns `Failed`), `#Succeeded`, `#Failed`, `#checkDoorHoppableWindow`, `#checkCrawlingTransition`; `zombie.pathfind.nativeCode.PathfindNative#addRequest` (`cancelRequest(mover)` first), `#findPath`, `#updateMain`; `zombie.pathfind.nativeCode.PathfindNativeThread#updateThread` (chunk, square and vehicle tasks, then `requestsPerUpdate = 2`); `zombie.pathfind.nativeCode.PathRequestTask#init` and `RequestQueue#removeFirst` (players, then zombies with a target, then the rest); `zombie.ai.WalkingOnTheSpot#check`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Java tells the native search

Everything the native search knows about the walker is in that 47-byte request: start and goal (with 32 added to each level, so basements below ground still count as positive), what kind of walker it is, and a handful of yes-or-no flags. `PathFindRequest#init` fills the flags:

```java
if (mover instanceof IsoZombie zombie) {
   this.canCrawl = zombie.isCrawling() || zombie.isCanCrawlUnderVehicle();
   this.crawling = zombie.isCrawling();
   this.ignoreCrawlCost = zombie.isCrawling() && !zombie.isCanWalk();
   this.canThump = true;
   this.hasTarget = zombie.getTarget() != null || zombie.isMovingToPlayerSound();
   this.canBend = BentFences.getInstance().isEnabled();
}
```

So, in plain words:

| Walker | What the search is told |
|---|---|
| Zombie | It may crawl (if it is a crawler or allowed under cars), it may break through obstacles (`canThump` is always true), whether it has a target, whether bent fences are on |
| Player | It avoids farm plants; it may climb tall fences if the sandbox has Easy Climbing on or its climbing score is at least 1 (`getClimbingFailChanceFloat`, which despite its name rises with Fitness, Strength, Nimble and helpful traits) |
| Animal | It may break through obstacles and climb fences if that animal type can |
| NPC player | Marked as an NPC |

What the search then does with those flags (which costs it puts on doors, windows, fences, crawling, thumping) is inside `PZPathFind64` and we cannot read it. Anything a page tells you about those costs for 42.21 is a guess unless it was measured in game.

> **Proof:** Code. `zombie.pathfind.nativeCode.PathFindRequest#init` (quoted; the player block sets `canClimbTallFences` from `SandboxOptions.instance.easyClimbing` or `getClimbingFailChanceFloat() >= 1.0F` and `avoidFarmingPlants = true`; `zombie.characters.IsoGameCharacter#getClimbingFailChanceFloat` adds Fitness, Strength and Nimble levels and helpful traits, subtracts moodles, and returns the square root; the animal block uses `shouldBreakObstaclesDuringPathfinding` and `canClimbFences`); `zombie.pathfind.nativeCode.PathfindNative#findPath` (`requestBb` of 47 bytes; `startZ + 32.0F`, `targetZ + 32.0F`; mover type 1 player, 2 zombie, 0 otherwise). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. The route costs and the search live in the native library `PZPathFind64`, which ships compiled; we found no readable source for them. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How the world reaches the pathfinder

The native search has its own copy of the map. Java keeps it current:

- **Chunks:** when a chunk finishes loading (`IsoChunk#doLoadGridsquare`) it is sent with `addChunkToWorld`; when it unloads, `removeChunkFromWorld`.
- **Squares:** `PolygonalMap2#squareChanged` forwards to `PathfindNative#squareChanged` (and also refreshes the cutaway and ambient-wall caches). Vanilla calls it when objects are added or removed through `IsoGridSquare#AddTileObject`, `#AddSpecialObject` and `#RemoveTileObject`, when doors, windows and player-built objects open, close or break, when fences are broken or bent, and when a floor is added.
- **Vehicles:** `BaseVehicle` adds itself on entering the world and removes itself on leaving. Every tick, `PathfindNative#updateMain` compares each loaded vehicle's outline (its footprint plus a margin) with the one it last sent, and sends an update when it has moved.

The rule that falls out: **change the world through the square's own add and remove calls**, and the pathfinder hears about it. A mod that changes what blocks a square in some other way (swapping the sprite of an object already there, for example) gives the pathfinder no notice, and characters keep walking the old map until something else on that square changes. `square:setSquareChanged()` sends that notice yourself: nothing in vanilla Java calls it, but vanilla's own build-recipe Lua does, after it places an object.

> **Proof:** Code. `zombie.iso.IsoChunk#doLoadGridsquare` and `#setSquare` (`addChunkToWorld`), the chunk removal path (`removeChunkFromWorld`); `zombie.pathfind.PolygonalMap2#squareChanged` (with native on: `invalidateVispolyChunkLevel`, `FBORenderCutaways`, `FMODAmbientWalls`, `PathfindNative.instance.squareChanged`); callers in `zombie.iso.IsoGridSquare` (`setSquareChanged`, `addFloor`, `addUndergroundBlock`, `RemoveTileObject`, `AddSpecialObject`, `AddTileObject`), `zombie.iso.objects.IsoDoor`, `IsoWindow`, `IsoThumpable`, `zombie.iso.BrokenFences`, `zombie.iso.BentFences`; `zombie.vehicles.BaseVehicle#addToWorld` (`addVehicle`) and `#removeFromWorld` (`removeVehicle`); `zombie.pathfind.nativeCode.PathfindNative#updateMain` with `VehicleState#check` (`getPolyPlusRadius` compared, then `updateVehicle`). `setSquareChanged` has no caller in the 42.21 Java source; `media/lua/server/BuildRecipeCode/buildRecipeCode.lua` calls `square:setSquareChanged()`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs, and on which side

The search runs on its own thread, `PathfindNativeThread`, started when the world loads; the main thread only queues requests and collects answers once a tick (`IngameState` calls `PathfindNative#updateMain`). The dedicated server loads the library and builds its own native world too (`initWorld` is told whether it is the server).

In multiplayer each machine paths for the characters it runs. A player's walk-to timed actions call `PathFindBehavior2#update` from the action's `update()`, which runs in that player's own game. A zombie that a client owns is pathed by that client (see [who owns a zombie](/pz/build-42/modding/engine/zombies-states-and-the-ai-director)). The server builds its own native world as well, and `PathFindState` has a server branch, but we have not traced when the server itself runs a search for a zombie, so we do not claim it. Each machine's native world holds only the chunks that machine has loaded.

> **Proof:** Code. `zombie.pathfind.nativeCode.PathfindNative#init(IsoMetaGrid)` (`initWorld(..., GameServer.server)`, starts `PathfindNativeThread` as a daemon thread); `zombie.gameStates.IngameState` (`PathfindNative.instance.updateMain()` in the update); `media/lua/client/TimedActions/WalkToTimedAction.lua`, `ISWalkToTimedAction:update` (`getPathFindBehavior2():update()`); `zombie.ai.states.PathFindState#execute` (uses `ServerMap` when `GameServer.server`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- [PathFindBehavior2](/pz/build-42/modding/reference/lua-classes-world-3#pathfindbehavior2), from `character:getPathFindBehavior2()`: `pathToLocation`, `pathToLocationF`, `pathToCharacter`, `pathToNearest`, `pathToNearestTable`, `pathToSitOnFurniture`, `pathToVehicleAdjacent`, `pathToVehicleArea`, `pathToVehicleSeat`, `pathToGrabCorpse`, `update`, `cancel`, `getTargetX/Y/Z`, `getPathLength`, and the result enum `BehaviorResult` (`Working`, `Failed`, `Succeeded`).
- On the character ([IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter)): `pathToLocation`, `pathToLocationF`, `pathToCharacter`, `pathToSound`, `getPath2`, `setPath2`, `getFinder`.
- Vanilla's own helpers: `ISPathFindAction` (`pathToLocationF`, `pathToNearest`, `pathToVehicleAdjacent`, `pathAdjacentToSquares` and more) and `ISWalkToTimedAction`, both timed actions you can queue.
- Not exposed: `PolygonalMap2` and `PathfindNative`. Lua cannot call the straight-line test or the search directly, and cannot add costs or new obstacle kinds.

## What a mod can and cannot change, and the traps

- **Recording a goal is not walking.** `getPathFindBehavior2():pathToLocation(...)` only stores the goal. Something must then call `update()` every tick until it returns `Succeeded` or `Failed`, which is exactly what `ISWalkToTimedAction:update` does for players. For a zombie, call `zombie:pathToLocation(x, y, z)` instead, so `pathToAux` sets the variables that put it into `PathFindState`, which then calls `update()` for you.
- **One request per walker.** A new request cancels the old one for the same character, so calling `pathTo...` every tick restarts the search every tick and the character may never move. Ask once, then let `update()` run.
- **Your request waits its turn.** Two searches per pass, players first, then zombies with targets. A crowd of wandering zombies all asking at once queues behind both.
- **`MapKnowledge` does nothing with the native search on.** The character's [MapKnowledge](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1#mapknowledge) (`setKnownBlockedDoor`, `setKnownBlockedWindow` and friends) is copied into the old Java request, but the native request has an empty list for it and the 47-byte buffer has no room for it. With the default settings, telling a character that a door is blocked does not change its route.
- **The costs are not yours.** You cannot make a zombie prefer windows over doors, or a player avoid water, from Lua; those choices are in `PZPathFind64`.

> **Proof:** Code. `zombie.pathfind.PathFindBehavior2#pathToLocation` (sets the goal), `#update`; `zombie.pathfind.nativeCode.PathfindNative#addRequest` (`cancelRequest(mover)`); `zombie.pathfind.PathFindRequest#init` (copies `chr.getMapKnowledge().getKnownBlockedEdges()`), against `zombie.pathfind.nativeCode.PathFindRequest` (declares `knownBlockedEdges` and never fills it) and `PathfindNative#findPath` (writes no blocked edges); `MapKnowledge` is otherwise used only by the debug and admin context menus. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

The `MapKnowledge` line is read from the Java side only: we cannot rule out that the native library learns about blocked doors some other way. The test that would settle it: in single player, mark a closed, unlocked door known-blocked with `getPlayer():getMapKnowledge():setKnownBlockedDoor(door, true)`, then click to walk to the far side; if the player still walks through that door, the native search ignores it.

> **Proof:** Unknown. Whether the native search sees `MapKnowledge` is inferred from the request buffer only; no game test yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Zombies: the state machine, who runs them, and the "AI director"](/pz/build-42/modding/engine/zombies-states-and-the-ai-director): how `bPathfind` puts a zombie into `PathFindState`.
- [The PathFindBehavior2 reference entry](/pz/build-42/modding/reference/lua-classes-world-3#pathfindbehavior2).
