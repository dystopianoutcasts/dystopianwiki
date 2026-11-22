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
  In Build 42.22 the route search runs in the native library PZPathFind64 on one thread. What Java decides, tells the search, how squares reach it, and why MapKnowledge is ignored.
last_updated: '2026-11-21'
related_articles:
  - zombies-states-and-the-ai-director
  - lua-classes-world-3
  - lua-classes-characters-2
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

Outcast, if you have ever tried to make a zombie or a player walk somewhere from a mod and watched it stand still, this page is for you. Pathfinding in Build 42 is split in two: Java decides when to look for a route and walks the character along it, and a native library does the search in between. We can read the first half and not the second, so this page is honest about where the code stops being readable.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [modders](#4-what-java-tells-the-native-search) | [server owners](#6-which-side-runs-the-search)

:::callout[The 1-minute version]{kind=key}
- The route search itself runs in a compiled library, `PZPathFind64`, which we cannot read. Java queues requests, feeds it the map and walks the character along the answer.
- Java decides first whether a search is needed at all: a clear straight line within 30 tiles on the same floor means the character just walks.
- One pathfinding thread runs the searches, two per pass, players first, then zombies that have a target, then everything else. It wakes whenever a task is queued.
- A new request for the same walker cancels the old one, so asking again every tick can stop a character from ever moving.
- By the code, telling a character a door is blocked (`MapKnowledge`) does not change its route with the native search on, which is the default. Not tested.
:::

:::facts
- **Request size** 47 bytes per search, with 32 added to each floor number :cite[(`PathfindNative.java:50`, `PathfindNative.java:281-316`)]
- **Searches per pass** 2 :cite[(`PathfindNativeThread.java:98-116`)]
- **Chunk updates per pass** at most 10 :cite[(`PathfindNativeThread.java:70-79`)]
- **Straight-walk limit** 30 tiles Manhattan, same floor :cite[(`IsoGameCharacter.java:6358`)]
- **Search queues** 3: players, zombies with a target, the rest :cite[(`RequestQueue.java:8-27`)]
:::

## 1. What it does for the player

**When you click to walk to a door, something has to find a route around walls, through doorways, over low fences, up stairs and around parked cars.** The same happens when a zombie goes around a fence to reach you, or a cow finds its way back to a trough. That is the pathfinder.

## 2. Where it lives

**Java holds the driver, the bridge and the queues; the search itself is compiled code.**

| Piece | Where | Readable? | Code |
|---|---|---|---|
| The per-character driver | `zombie.pathfind.PathFindBehavior2` | Yes. Holds the goal, asks for a route, follows it | `PathFindBehavior2.java:794-1024` |
| The bridge to the native search | `zombie.pathfind.nativeCode.PathfindNative`, `PathfindNativeThread`, `PathFindRequest` | Yes, up to the `native` method calls | `PathfindNative.java:55-89` |
| The route search | the native library `PZPathFind64` (loaded with `System.loadLibrary`) | **No.** Costs, the graph and the search are compiled code | `PathfindNative.java:55-67` |
| The old Java search | `zombie.pathfind.PolygonalMap2` (visibility graph, `VGAStar`), `zombie.pathfind.highLevel.HLAStar` | Yes, but only used when the debug option `Pathfind.UseNativeCode` is off | `IsoWorld.java:2187-2193` |
| The straight-line test | `PolygonalMap2#lineClearCollide` and `LineClearCollideMain#isNotClearOld` | Yes. Java, reads the world's squares directly | `PolygonalMap2.java:2145-2154`, `LineClearCollideMain.java:643-645` |
| The state that uses it | `zombie.ai.states.PathFindState` (zombies), `WalkToTimedAction.lua` and `ISPathFindAction.lua` (players) | Yes | `PathFindState.java:53-107`, `WalkToTimedAction.lua:18` |

The debug option `Pathfind.UseNativeCode` defaults to true. The world picks the search when it starts, with the native one on by default :cite[(`DebugOptions.java:77`, `PathfindNative.java:47`, `IsoWorld.java:2187-2193`)]. The game also compares the option with the running search on every update, and switches when they differ :cite[(`IngameState.java:635`, `PathfindNative.java:116-157`)].

## 3. The chain, from "go there" to footsteps

**A character's path request goes from a clear-line test, to a queue, to a native search on the pathfinding thread, and back as a list of points.**

:::flow[From "go there" to footsteps]
- A `pathTo...` call tests for a clear straight line
- If not clear, `bPathfind` puts the character in `PathFindState`
- `PathFindBehavior2#update` queues a request
- The pathfinding thread runs the native search
- The route comes back on the main thread and the character follows it
:::

1. Something calls `pathToLocation`, `pathToCharacter` or `pathToSound` on a character. `IsoGameCharacter#pathToAux` first tries a straight line (same floor, within 30 tiles, `lineClearCollide` says clear). If it is clear the character just walks. If not, it sets the animation variable `bPathfind`, and the character's transition files move it into `PathFindState` :cite[(`IsoGameCharacter.java:6356-6400`)]. See [the zombie article](/pz/build-42/modding/engine/zombies-states-and-the-ai-director) for how variables pick states.
2. Each tick, `PathFindState#execute` (or a player's walk timed action) calls `PathFindBehavior2#update` :cite[(`PathFindState.java:53-54`, `WalkToTimedAction.lua:18`)]. On the first call it hands a request to `PathfindNative#addRequest`, which cancels any earlier request from the same walker and queues the new one for the pathfinding thread :cite[(`PathFindBehavior2.java:794-798`, `PathfindNative.java:225-235`)].
3. The thread, `PathfindNativeThread`, first copies pending chunk, square and vehicle changes into the native world, then runs at most **two** searches per pass :cite[(`PathfindNativeThread.java:69-116`)]. It takes players first, then zombies that have a target, then everything else (wandering zombies, animals) :cite[(`PathRequestTask.java:19-30`, `RequestQueue.java:15-21`)].
4. `PathfindNative#findPath` packs the request into a 47-byte buffer and calls the native `findPath`. The route comes back as a list of points, 16 bytes each. A route with fewer than two points counts as no route :cite[(`PathfindNative.java:281-316`, `PathfindNativeThread.java:153-178`)].
5. Back on the main thread, `PathfindNative#updateMain` hands the result to `PathFindBehavior2#Succeeded` or `#Failed` :cite[(`PathfindNative.java:246-279`, `IngameState.java:640`)]. Those two only store the route and set the progress to found or failed. From the next tick `PathFindBehavior2#update` walks the character along the points, opening doors, climbing windows and fences and switching to crawling where the route says so :cite[(`PathFindBehavior2.java:1478-1500`, `PathFindBehavior2.java:940-956`)].

A request that names several targets, as `pathToNearest` does, runs one search per target on the thread and keeps the shortest route :cite[(`PathFindBehavior2.java:269-282`, `PathfindNativeThread.java:106-110`, `PathfindNativeThread.java:182-210`)].

If the character makes no progress for a while, `PathFindBehavior2#update` gives up and returns `Failed` (the `WalkingOnTheSpot` check). A zombie then clears its pathfind variables and returns to its default state :cite[(`PathFindBehavior2.java:830-831`, `PathFindState.java:55-58`)].

## 4. What Java tells the native search

**Everything the native search knows about the walker is in the 47-byte request.** That is the start and goal (with 32 added to each level, so basements below ground still count as positive), what kind of walker it is, and a handful of yes-or-no flags :cite[(`PathfindNative.java:281-316`)]. `PathFindRequest#init` fills the flags :cite[(`PathFindRequest.java:46-97`)]:

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
| Zombie | It may crawl (if it is a crawler or allowed under cars), it may break through obstacles (`canThump` is always true), whether it has a target or a player sound to move to, whether bent fences are on |
| Player | It may climb tall fences if the sandbox has Easy Climbing on or its climbing score is at least 1. The score rises with Fitness, Strength and Nimble levels and helpful traits, and falls with moodles and some traits. |
| Player, first search | It avoids farm plants. If that search fails, one more is made without the avoidance |
| Animal | It may break through obstacles and climb fences if that animal type can |
| NPC player | Marked as an NPC |

The player's tall-fence rule is :cite[(`PathFindRequest.java:76-79`, `IsoGameCharacter.java:16704-16740`)]. The farm-plant retry is new in 42.22: the first request passes the avoidance flag for a player, and a failed search with the flag on is asked again without it :cite[(`PathFindBehavior2.java:794-805`, `PathFindBehavior2.java:1008-1024`)]. The animal flags come from the animal itself :cite[(`PathFindRequest.java:65-67`)].

What the search then does with those flags (which costs it puts on doors, windows, fences, crawling, thumping) is inside `PZPathFind64` and we cannot read it. Anything a page tells you about those costs for 42.22 is a guess unless it was measured in game.

## 5. How the world reaches the pathfinder

**The native search has its own copy of the map, and Java keeps it current by sending chunks, squares and vehicles.**

- **Chunks:** when a chunk finishes loading it is sent with `addChunkToWorld`, unless the chunk ignores pathfinding; when it unloads, `removeChunkFromWorld` :cite[(`IsoChunk.java:3098-3106`, `IsoChunk.java:3194-3200`)].
- **Squares:** `PolygonalMap2#squareChanged` forwards to `PathfindNative#squareChanged` (and also refreshes the cutaway and ambient-wall caches) :cite[(`PolygonalMap2.java:1695-1700`)]. The native call queues the square and its 8 neighbors, and only when the chunk's loaded bit 2 is set :cite[(`PathfindNative.java:174-189`)]. Vanilla calls it when objects are added or removed through `IsoGridSquare#AddTileObject`, `#AddSpecialObject` and `#RemoveTileObject`, when doors, windows and player-built objects open, close or break, when fences are broken or bent, and when a floor is added :cite[(`IsoGridSquare.java:4797`, `IsoGridSquare.java:5776`, `IsoGridSquare.java:5842`, `IsoGridSquare.java:5884`, `IsoDoor.java:1444`, `IsoWindow.java:304`, `IsoThumpable.java:1340`, `BrokenFences.java:141`, `BentFences.java:861`)].
- **Vehicles:** `BaseVehicle` adds itself on entering the world and removes itself on leaving. Every tick, `PathfindNative#updateMain` compares each loaded vehicle's outline (its footprint plus a margin) with the one it last sent, and sends an update when it has moved :cite[(`BaseVehicle.java:8035`, `BaseVehicle.java:8129`, `PathfindNative.java:253-259`, `VehicleState.java:25-27`)].

The rule that falls out: **change the world through the square's own add and remove calls**, and the pathfinder hears about it. A mod that changes what blocks a square in some other way (swapping the sprite of an object already there, for example) gives the pathfinder no notice, and characters keep walking the old map until something else on that square changes. `square:setSquareChanged()` sends that notice yourself: nothing in vanilla Java calls it, but vanilla's own build-recipe Lua does, after it places an object :cite[(`IsoGridSquare.java:4726`, `buildRecipeCode.lua:435`)].

## 6. Which side runs the search

**Each machine searches for the characters it runs, on one pathfinding thread per machine.** The thread starts when the world loads and wakes on each queued task :cite[(`PathfindNativeThread.java:60-125`)]. The main thread only queues requests and collects answers once a tick :cite[(`PathfindNative.java:91-100`, `IngameState.java:640`)]. The dedicated server loads the library and builds its own native world too, told that it is the server :cite[(`GameServer.java:617`, `PathfindNative.java:92`)].

In multiplayer a player's walk-to timed actions call `PathFindBehavior2#update` from the action's `update()`, which runs in that player's own game :cite[(`WalkToTimedAction.lua:18`)]. A zombie that a client owns is pathed by that client (see [who owns a zombie](/pz/build-42/modding/engine/zombies-states-and-the-ai-director)). `PathFindState` has a server branch that looks up the chunk through `ServerMap`, but we have not traced when the server itself runs a search for a zombie, so we do not claim it :cite[(`PathFindState.java:62`)]. Each machine's native world holds only the chunks that machine has loaded.

## 7. What Lua can reach

**Lua can ask for a route and drive the walk, but it cannot touch the search or its costs.**

- [PathFindBehavior2](/pz/build-42/modding/reference/lua-classes-world-3#pathfindbehavior2), from `character:getPathFindBehavior2()`: `pathToLocation`, `pathToLocationF`, `pathToCharacter`, `pathToNearest`, `pathToNearestTable`, `pathToSitOnFurniture`, `pathToVehicleAdjacent`, `pathToVehicleArea`, `pathToVehicleSeat`, `pathToGrabCorpse`, `update`, `cancel`, `getTargetX/Y/Z`, `getPathLength`, and the result enum `BehaviorResult` (`Working`, `Failed`, `Succeeded`) :cite[(`PathFindBehavior2.java:1510-1516`)].
- On the character ([IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter)): `pathToLocation`, `pathToLocationF`, `pathToCharacter`, `pathToSound`, `getPath2`, `setPath2`, `getFinder`.
- Vanilla's own helpers: `ISPathFindAction` (`pathToLocationF`, `pathToNearest`, `pathToVehicleAdjacent`, `pathAdjacentToSquares` and more) and `ISWalkToTimedAction`, both timed actions you can queue :cite[(`ISPathFindAction.lua:122-247`)].
- Not exposed: `PolygonalMap2` and `PathfindNative`. Lua cannot call the straight-line test or the search directly, and cannot add costs or new obstacle kinds.

## 8. What a mod can and cannot change, and the traps

**Record a goal, then keep calling `update()`, ask once, and do not expect to change route costs.**

- **Recording a goal is not walking.** `getPathFindBehavior2():pathToLocation(...)` only stores the goal. Something must then call `update()` every tick until it returns `Succeeded` or `Failed`, which is exactly what `ISWalkToTimedAction:update` does for players :cite[(`PathFindBehavior2.java:248-253`, `WalkToTimedAction.lua:18`)]. For a zombie, call `zombie:pathToLocation(x, y, z)` instead, so `pathToAux` sets the variables that put it into `PathFindState`, which then calls `update()` for you :cite[(`IsoGameCharacter.java:6408-6411`, `PathFindState.java:53-54`)].
- **One request per walker.** A new request cancels the old one for the same character, so calling `pathTo...` every tick restarts the search every tick and the character may never move. Ask once, then let `update()` run :cite[(`PathfindNative.java:225-244`)].
- **Your request waits its turn.** Two searches per pass, players first, then zombies with targets. A crowd of wandering zombies all asking at once queues behind both :cite[(`PathfindNativeThread.java:98-116`, `RequestQueue.java:15-21`)].
- **`MapKnowledge` does nothing with the native search on.** The character's [MapKnowledge](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1#mapknowledge) (`setKnownBlockedDoor`, `setKnownBlockedWindow` and friends) is copied into the old Java request, but the native request has an empty list for it and the 47-byte buffer has no room for it. With the default settings, telling a character that a door is blocked does not change its route :cite[(`PathFindRequest.java:73-77`, `PathFindRequest.java:42`, `PathfindNative.java:281-316`, `MapKnowledge.java:74-110`)]. Vanilla calls it only from the debug and admin context menus :cite[(`AdminContextMenu.lua:165`, `DebugContextMenu.lua:759`)].
- **The costs are not yours.** You cannot make a zombie prefer windows over doors, or a player avoid water, from Lua; those choices are in `PZPathFind64`.

:::callout[How we know]{kind=proof}
The route costs and the search live in the native library `PZPathFind64`, which ships compiled; we found no readable source for them, so what the search does with the flags is not verified.

The `MapKnowledge` line is read from the Java side only: we cannot rule out that the native library learns about blocked doors some other way. The test that would settle it: in single player, mark a closed, unlocked door known-blocked with `getPlayer():getMapKnowledge():setKnownBlockedDoor(door, true)`, then click to walk to the far side. If the player still walks through that door, the native search ignores it. Not tested.

When the dedicated server itself runs a search for a zombie is not traced.
:::

## 9. Where to go next

- [Zombies: the state machine, who runs them, and the "AI director"](/pz/build-42/modding/engine/zombies-states-and-the-ai-director): how `bPathfind` puts a zombie into `PathFindState`.
- [The PathFindBehavior2 reference entry](/pz/build-42/modding/reference/lua-classes-world-3#pathfindbehavior2).
