---
id: build-42-outcast-saw-all-engine
slug: outcast-saw-all-engine
title: Outcast Saw All -- engine notes
game: pz
version: build-42
section: outcast-mods
category: outcast-saw-all
difficulty: advanced
tags:
  - outcast-saw-all
  - engine
  - context-menu
excerpt: >-
  Every claim here was read out of our B42 engine records (revision
  a2947723ca). Line numbers are precise -- the jar retains
  its LineNumberTable.
last_updated: '2026-10-04'
---
# Outcast Saw All -- engine notes

> Source: OutcastSawAll/docs/ENGINE.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Every claim here was read out of our B42 engine records (revision
`a2947723ca`). Line numbers are precise -- the jar retains
its `LineNumberTable`. Re-checked on **42.21.0** (revision `4a0e9546ec`): the
line numbers now point into 42.21, and the one engine change that touches this
page is marked below.

## Sawing is a craftRecipe, and it is one exact item type

`media/scripts/generated/recipes/recipes_carpentry.txt:3`:

```
craftRecipe SawLogs
{
    timedAction = SawLogs,
    time = 230,
    Tags = InHandCraft;CanBeDoneFromFloor,
    category = Carpentry,
    xpAward = Woodwork:5,
    inputs
    {
        item 1 [Base.Log] flags[Prop2],
        item 1 tags[base:saw] mode:keep flags[MayDegradeLight;Prop1],
    }
    outputs
    {
        item 3 Base.Plank,
    }
}
```

Two things follow, and both are load-bearing for this mod.

**The log input is a type list, not a tag filter.** `ItemTag.LOG` exists and is
exposed to Lua (`zombie/scripting/objects/ItemTag.java:258`), but the recipe does
not use it. A modded log carrying that tag would be counted by a tag-based scan
and then refused by the recipe, so `OSA_Config.LOG` matches on full type instead.
If The Indie Stone ever widens that input, widen `OSA.LOG` with it.

**No dullness requirement.** Unlike `RipDenimClothing`, the tool input carries
only `MayDegradeLight`, not `IsNotDull`. Three vanilla items carry `base:saw` and
all three work: `Saw`, `GardenSaw`, `CrudeSaw`. (The `base:crudesaw` tag that
`SawLongStick` also accepts is not on any vanilla item.)

`time = 230` becomes `craftRecipe:getTime(character) * 5` ticks in
`ISHandcraftAction:getDuration()`. Against `RipClothing`'s 40 that is nearly six
times as long per item, which is why this mod's default max-per-click is 20 and
Outcast Rip All's is 40.

## Log bundles

`recipes_carpentry.txt:189,206,223` define `UnstackTwoLogs`, `UnstackThreeLogs`
and `UnstackFourLogs`: `item 1 [Base.LogStacks{2,3,4}]` in, 2/3/4 `Base.Log` out,
`time = 60`, no tool input, `Tags = InHandCraft;CanBeDoneFromFloor;CanBeDoneInDark`.

`OnCreate = RecipeCodeOnCreate.splitLogStack` only re-creates the ropes that were
consumed when the bundle was tied; it does not place the logs. The logs are
ordinary recipe outputs, delivered by `ISHandcraftAction:performRecipe` through
`Actions.addOrDropItem` -- so they land in the character's inventory, or on the
floor at their feet if they do not fit. This mod does not care which, because
the saw wave re-derives what is in reach after the unties complete rather than
holding references to items that did not exist yet.

## The 2.5-tile container ceiling

`BaseCraftingLogic.isContainersAccessible` (`BaseCraftingLogic.java:774`) is
called at the top of `HandcraftLogic.performCurrentRecipe`
(`HandcraftLogic.java:147`):

```java
if (outer.getVehiclePart() == null && outer.getSquare() != null
    && outer.getSquare().DistToProper(this.player) > 2.5F) {
   DebugType.CraftLogic.debugln("Can't craft: container too far");
   return false;
}
```

`DistToProper(IsoMovingObject)` is plain 2D Euclidean from the square's centre to
the player's position, ignoring z (`IsoGridSquare.java:1162`).

This fails the **whole craft** if **any one** container in the list is too far,
not just the craft that would have used it. It is the single most important fact
about this mod:

* a container list cannot be built once and reused across a sweep;
* it cannot be reused across a walk either, because
  `performCurrentRecipe` appends a floor container bound to the square the player
  was standing on at the time (`BaseCraftingLogic.java:822`) and that container
  is re-tested on the next craft;
* so the run rebuilds `OSA.reachContainers` from scratch at every stop, and walks
  to each stop before building anything.

Note that `canPerformCurrentRecipe` does **not** apply this test --
`CraftRecipeManager.isValidRecipeForCharacter` only checks skill and whether the
recipe is known. So the context-menu probe in `OSA_Plan.canSaw` is valid at any
distance, which is exactly what a count wants.

## Logs are sawn where they lie

`updateFloorContainer` (`BaseCraftingLogic.java:799`) builds a synthetic
container of type `"floor"` from every world item on the 3x3 around the
*player's* square, and clears and rebuilds any container of that type it already
finds in the list.

A world item is a first-class craft input without any of that, though:

* `CraftRecipeData.setManualInputsFor` accepts an item whose `getContainer()` is
  null as long as it has a live world object (`CraftRecipeData.java:2100`);
* `CraftRecipeData.offerAndReplaceInputItem` (`:345`) pins by script match and
  does not require list membership;
* `ItemUser.RemoveItem` consumes it through
  `worldObj.getSquare().transmitRemoveItemFromSquare(worldObj)`, so the sprite
  goes with it. That holds where the craft runs: in single player, and on the
  server in multiplayer. Since 42.21 the same call made on a multiplayer client
  no longer sends anything to the server; it only removes the client's copy.

  > **Proof:** Code. `zombie.iso.IsoGridSquare#transmitRemoveItemFromSquare(IsoObject, boolean)` (the `GameClient.client` branch that sent `RemoveItemFromSquarePacket` is gone; off the server it calls `RemoveTileObject`, on the server `GameServer.RemoveItemFromMap`); `zombie.inventory.ItemUser`. Build 42.21.0 (revision 4a0e9546ec).

And vanilla's own single-item path proves the intent. `OnNewCraft`
(`ISInventoryPaneContextMenu.lua:3451`) only hauls inputs into the player's
inventory when the recipe is **not** `CanBeDoneFromFloor`:

```lua
if not recipe:isCanBeDoneFromFloor() then
    ...
    ISInventoryPaneContextMenu.transferIfNeeded(playerObj, item)
```

`SawLogs` is `CanBeDoneFromFloor`, so vanilla saws a floor log in place. This mod
does the same and never transfers anything. That matters more here than it would
elsewhere: `Base.Log` is `Weight = 9.0` (`generated/items/normal.txt:9301`), and
a queue of twenty of them hauled into the player's bag would leave them unable to
move.

`OSA_Scan.groundItems` still restricts itself to the same 3x3 the engine's floor
container covers. Nothing above forbids a wider reach, but the 3x3 is the set
vanilla exercises, and anything further out gets its own stop in the sweep.

## Callbacks survive multiplayer

`ISHandcraftAction:perform` runs `performRecipe()` only when `not isClient()`;
on an MP client the server does the work and the client still fires
`onCompleteFunc` at the same point (`ISHandcraftAction.lua` `perform`). So the
callback chain that drives this run works the same in single player and on a
client. `stop()` calls `onCancelFunc` and then `onCompleteFunc`, which is why
`OSA.onCraftCancelled` marks the run dead and every completion callback checks
that flag first.

`o.stopOnWalk = not craftRecipe:isCanWalk()` in `ISHandcraftAction:new` --
`SawLogs` is not `canWalk`, so moving cancels the running saw, and the mod does
not need its own cancellation hook.

## What is not verified

The strip-then-rip handoff that Outcast Rip All worries about has no equivalent
here -- this mod queues no transfers at all. What is untested is the same thing
that is untested in every mod in this family: **a dedicated server**. The
specific case to try first is the untie-then-saw handoff, where the saw wave is
built inside the completion callback of an unstack whose outputs were created
server-side.

## A note on Outcast Rip All

`OutcastRipAll` hands one container list, built from a radius sweep of up to 10
tiles, to every `HandcraftLogic` it creates. Given
`isContainersAccessible` above, any swept container past 2.5 tiles should fail
every rip in that run rather than just its own. Worth checking there separately;
it is not a problem in this mod because of the per-stop rebuild.

*Updated 2026-10-04 for Build 42.21: line numbers re-pointed; transmitRemoveItemFromSquare no longer reaches the server when called on a multiplayer client.*
