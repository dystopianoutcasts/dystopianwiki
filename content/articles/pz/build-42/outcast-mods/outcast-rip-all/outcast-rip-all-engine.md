---
id: build-42-outcast-rip-all-engine
slug: outcast-rip-all-engine
title: Outcast Rip All -- engine notes
game: pz
version: build-42
section: outcast-mods
category: outcast-rip-all
difficulty: advanced
tags:
  - outcast-rip-all
  - engine
  - context-menu
excerpt: >-
  Every claim here was read out of our B42 engine records (revision
  a2947723ca, steam buildid
  24449119). The api/ index layer of that base is not built yet, so...
last_updated: '2026-10-04'
---
# Outcast Rip All -- engine notes

> Source: OutcastRipAll/docs/ENGINE.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Every claim here was read out of our B42 engine records (revision
`a2947723ca`, steam buildid
`24449119`). The `api/` index layer of that base is not built yet, so these came
from reading `src/` and `game_snapshot/media` directly rather than from a
generated index. Line numbers are precise -- the jar retains its
`LineNumberTable`. Re-checked on **42.21.0** (revision `4a0e9546ec`): the line
numbers now point into 42.21, and the one behaviour change is marked below.

## Ripping is a craftRecipe in B42, not a timed action

B41 had `ISRipClothing`, a bespoke timed action, driven off the
`ClothingRecipesDefinitions` Lua table. B42 replaced that with two script-defined
craft recipes in
`media/scripts/generated/recipes/recipes.txt`:

| Recipe | Line | Input tags | Tool | Time |
|--------|------|------------|------|------|
| `RipClothing` | 217 | `base:ripclothingcotton` | none | 40 |
| `RipDenimClothing` | 233 | `base:ripclothingdenim`, `base:ripclothingleather` | `base:scissors` or `base:sharpknife`, `IsNotDull` | 80 |

Both carry `OnCreate = RecipeCodeOnCreate.ripClothing`, which is now Java
(`zombie/scripting/logic/RecipeCodeOnCreate.java:601`) and still reads
`ClothingRecipesDefinitions` out of the Lua env to decide the output material.
Output always lands on the crafting character via
`addItemToCharacterInventory`.

`ISRipClothing.lua` still exists inside `media/lua/client.zip` but nothing
reaches it. Do not reimplement against it.

## The item-side tags

`ItemTag` (`zombie/scripting/objects/ItemTag.java:356-359`) exposes four
constants to Lua:

```
RIP_CLOTHING_COTON     -- "RipClothingCoton",  a live misspelling
RIP_CLOTHING_COTTON    -- "RipClothingCotton"
RIP_CLOTHING_DENIM     -- "RipClothingDenim"
RIP_CLOTHING_LEATHER   -- "RipClothingLeather"
```

Both cotton spellings are checked in `ORA_Scan.ripKindFor`. Dropping the
misspelled one would silently skip whatever items still carry it.

## Worn clothing is out of reach of both recipes

`RipClothing` inputs carry `flags[...;IsNotWorn;...]`, and
`InputScript.java:1027` resolves that to `!item.isWorn() && !item.isEquipped()`.

`Clothing.isWorn()` (`zombie/inventory/types/Clothing.java:1154`) is:

```java
return this.container != null
    && this.container.parent instanceof IsoGameCharacter c
    && c.getWornItems().contains(this);
```

A zombie corpse is an `IsoGameCharacter`, so **everything a corpse is still
wearing reports `isWorn() == true`** and no recipe will accept it directly.

## Taking clothing off a corpse is an ordinary transfer

Nothing bespoke is needed to undress a body.
`ItemContainer.DoRemoveItem` (line 2081) ends with:

```java
this.items.remove(item);
item.container = null;
if (this.parent instanceof IsoDeadBody isoDeadBody) {
   isoDeadBody.checkClothing(item);
}
```

and `IsoDeadBody.checkClothing` (`zombie/iso/objects/IsoDeadBody.java:1479`)
drops from `wornItems` anything that is no longer in the container, nulls
`atlasTex` and invalidates the render chunk. So a plain
`ISInventoryTransferAction` off the corpse both clears the worn flag and updates
what the corpse looks like. `ISInventoryTransferUtil.newInventoryTransferAction`
only diverts to `ISGrabCorpseItem` when the *item itself* is a corpse
(`isHumanCorpse()`), which clothing never is.

This is why the run has two waves per body: strip, then rip.

## Where a craft's inputs actually come from

`CraftLogicUILogic.setContainers` (line 379) does:

```java
this.containers.clear();
this.containers.addAll(containersToUse);
this.allItems.clear();
CraftRecipeManager.getAllItemsFromContainers(this.containers, this.allItems);
```

That list *is* the craftable pool. The engine applies no "must be in the player's
inventory" rule anywhere. `CraftRecipe.isCanBeDoneFromFloor()` (line 1046) is read
only by Lua, to decide whether to transfer items in first -- it is never consulted
by Java. So handing `HandcraftLogic` a wider container list is the supported way
to widen a craft's reach, and is what this mod does.

One exception to be careful of: `BaseCraftingLogic.updateFloorContainer`
(line 799) runs at perform time, finds the first container in the list whose type
is `"floor"`, **clears it**, and repopulates it from the eight squares adjacent to
the player. A synthetic wide-radius floor container would be wiped. Worse, removing
an item from a fake container would not remove the `IsoWorldInventoryObject` from
the ground. This mod therefore collects no loose ground items -- only real
containers, including bags lying on the floor.

## Queued craft actions re-resolve at start

`ISHandcraftAction:start()` builds a **fresh** `HandcraftLogic` from the action's
own `craftRecipe`, `containers`, `isoObject` and `manualInputs`. The logic object
that existed when the action was queued is discarded. If the recipe can no longer
be performed, `start()` calls `forceStop()` rather than crafting something wrong.

That is why forty rips can be queued in one frame: each action re-checks itself
when its turn comes, and a garment that vanished in the meantime cancels only its
own action.

`getAllInputItems()` (`CraftRecipeData.java:1896`) returns a fresh `ArrayList`, so
snapshots taken by `ISHandcraftAction.FromLogic` do not alias.

What is *not* deferred is input resolution at creation time.
`ISEntityUI.HandcraftStart` calls `canPerformCurrentRecipe()` before it will
build an action at all, and `HandcraftLogic.setRecipeFromContextClick` pins the
garment through `offerAndReplaceInputItem`, which runs the `IsNotWorn` check
immediately. **A rip action for a garment still on a corpse cannot be created.**
That is the whole reason ORA_Run works one source at a time instead of queueing
the plan in one pass.

## Callback timing, and the one unverified multiplayer assumption

The run chains on action callbacks, so it matters exactly when they fire and
whether the work is done by then.

`ISInventoryTransferAction:perform()` fires `onCompleteFunc` at line 543, only on
success -- `stop()` does not. In single player the move itself happens earlier in
the same function, at line 502 (`if not isClient() then self:transferItem(item)`),
so by callback time the garment is in the player's inventory and unworn. Verified
by inspection.

**On a multiplayer client that branch is skipped**: the server performs the move
and syncs it back, and the action holds itself open through
`self.action:setWaitForFinished(false)` at line 540.
`removeItemTransaction(id, false)` (`TransactionManager.java:458`) only drops the
local transaction record; it does not apply anything. So the strip-then-rip
handoff on a client depends on the server's sync having landed before `perform()`
runs. That is what `setWaitForFinished` is for and it is very likely correct, but
it has not been tested. If it is wrong, the symptom is a body whose clothes come
off and are then not ripped -- which `ORA.ripSource` reports rather than swallows.

`ISHandcraftAction`'s callback fires exactly once in both modes, which is why the
vanilla guards look redundant but are not. `LuaTimedActionNew.complete()` calls
the Lua `complete` only when `!GameClient.client`, and `ISHandcraftAction:perform`
calls `onCompleteFunc` only when `isClient()`. Single player takes the first path,
a client the second.

`ISHandcraftAction:stop()` calls `onCancelFunc` **and then** `onCompleteFunc`, so
a cancel handler that sets a flag is guaranteed to run before the completion
handler that reads it.

## getInventory() is not on InventoryItem

`getInventory()` is declared on `InventoryContainer`
(`zombie/inventory/types/InventoryContainer.java:56`), not on `InventoryItem`.
Calling it on an ordinary garment is a hard Lua error, not a nil return.

This matters when sweeping `IsoGridSquare:getWorldObjects()` for bags lying on
the floor, because most things on the ground are not bags. Vanilla puts the type
test first (`ISInventoryPage.lua:1698`, gated on `getCategory() == "Container"`);
this mod uses `instanceof(item, "InventoryContainer")`, which is the exact
condition under which the method exists. That spelling is what vanilla passes to
`instanceof` elsewhere -- `ISHotbar.lua:599`, `ISInventoryPane.lua:971`.

Everything else this mod calls on an item -- `getContainer`, `hasTag`,
`isEquipped`, `isFavorite`, `isWorn` -- is declared on `InventoryItem` itself and
is safe on any item. Likewise `getContainer` (`IsoObject.java:1946`),
`getContainerCount` and `getContainerByIndex` (`IsoObject.java:5242`, `5186`) are
on `IsoObject`, so they are safe on every object and static mover a square
returns.

Worth stating plainly because it is invisible to the tooling: `luac -p` cannot
catch this. Whether a method exists on a receiver is a runtime question in Lua, so
a clean parse says nothing about it. The only defence is checking the declaring
class before calling.

## Prefer the shape vanilla Lua actually uses, not the one Java declares

"It exists in the decompiled Java" is weaker evidence than "vanilla Lua calls it".
The binding does not expose every public member the same way, and a member vanilla
never touches from Lua is a member nobody has proven reachable.

`HaloTextHelper` is the worked example. It declares both
`public static final ColorRGB COLOR_RED` (line 21) and
`public static ColorRGB getColorRed()` (line 34). Vanilla Lua calls the accessors
and never reads the fields -- `ISRadioInteractions.lua:313-332`,
`XpSystem/XpUpdate.lua:191`. This mod calls the accessors for the same reason.

Two more details from those same live call sites, both easy to get wrong from the
Java alone:

- The four-argument form is `addText(player, text, separator, ColorRGB)`. A
  three-argument call with a colour third is *not* a colour overload -- the third
  parameter is the separator. The commented-out lines in `ISVehicleMenu.lua:1198`
  are stale for exactly that reason; do not copy them.
- The separator vanilla passes with a colour is `"[br/]"`, and the two-argument
  form defaults to `"[col=175,175,175], [/]"` (line 154). It is what separates
  halo lines that queue together, so a mod emitting two at once wants `"[br/]"`
  rather than `""`.

By contrast, static *field* access on `ItemTag` is fine and is what this mod uses
for the rip tags -- because vanilla does it too, at
`ISInventoryPaneContextMenu.lua:138`.

## A craft fails entirely if any container in its list is over 2.5 tiles away

`BaseCraftingLogic.isContainersAccessible` (line 774) walks the whole list and
returns false the moment one entry's outermost container sits further than 2.5
tiles from the player:

```java
if (outer.getVehiclePart() == null && outer.getSquare() != null
    && outer.getSquare().DistToProper(this.player) > 2.5F) {
   return false;
}
```

`DistToProper` is Euclidean, square centre to the player's exact position
(`IsoGridSquare.java:1162`), so 2.5 is a true radius.

Two things make this vicious:

- It is **all or nothing**. One distant container in the list fails every craft
  built from that list, including ones drawing on the player's own pockets.
- It is checked in `performCurrentRecipe` (`HandcraftLogic.java:146`), **not** in
  `canPerformCurrentRecipe`. So the recipe passes every gate, `HandcraftStart`
  builds the action, the queue runs it, the character plays the full animation --
  and then `performRecipe` gets `false` and does nothing. No item consumed, no
  output, no error. A silent no-op that looks exactly like success.

The consequence for this mod is structural: a wide container list can be used to
*find* what is rippable, but never to craft. Every craft is handed
`ORA.craftContainers` -- what the player carries, plus the one container being
worked -- and the run walks to each source before touching it. The radius setting
therefore governs how far the run will travel, not how far it can reach from
where it stands.

## Two queue-clearing traps in luautils

`luautils.walkToContainer` is the obvious way to walk to a container and is wrong
here twice over. It returns early for any `IsoDeadBody` without walking at all
(`luautils.lua:345`), and its general branch opens with
`ISTimedActionQueue.clear(playerObj)` (line 356), which would destroy a queue this
mod had already filled.

`luautils.walkAdj(playerObj, square, keepActions, excludeList)` clears the queue
too (line 121) *unless* `keepActions` is true. With that flag it is safe: it
returns true immediately when already within reach, otherwise queues one
`ISWalkToTimedAction` and returns true, and returns false when no adjacent
standable tile exists. Since 42.21 the walk is queued only when the call is not
running on the server (`if not isServer()`); called from server Lua it still
returns true but queues nothing.

> **Proof:** Code. `media/lua/shared/luautils.lua`, `luautils.walkAdj` (`if not isServer() then ISTimedActionQueue.add(ISWalkToTimedAction:new(...)) end`). Build 42.21.0 (revision 4a0e9546ec).

## Reachability past one tile

`IsoGridSquare.canReachTo` (line 946) hard-returns `false` when
`|dx| > 1 || |dy| > 1`, so it cannot express a radius sweep. Inside one tile it is
the right answer -- it understands walls, windows, doors and stair tops -- and the
loot window uses it. Past one tile this mod substitutes `isCanSee(playerNum)`
(line 9137).

## The no-items context menu event is unregistered

`ISInventoryPaneContextMenu.lua:959` fires
`OnFillInventoryContextMenuNoItems`, but `LuaEventManager.AddEvents()` never
registers it (contrast `AddEvent("OnFillInventoryObjectContextMenu")` at
`LuaEventManager.java:624`). `Events.OnFillInventoryContextMenuNoItems` is
therefore nil until something calls `LuaEventManager.AddEvent` for it.
`AddEvent` returns the existing event if one is already registered
(`LuaEventManager.java:579`), so doing this is safe alongside other mods.

## Mod load order

`LuaManager.LoadDirBase` (line 1142) sorts all base-game files, then appends all
mod files (lines 1199-1200). Every vanilla Lua file -- including
`client/PZAPI/ModOptions.lua` -- is guaranteed loaded before any mod's client
Lua, so `PZAPI.ModOptions:create` may be called at mod file scope.

Within one mod, files are sorted case-insensitively, which is why
`ORA_ContextMenu.lua` registers its handlers as closures: it runs before
`ORA_Rip.lua` has defined `ORA.ripAll`.

*Updated 2026-10-04 for Build 42.21: line numbers re-pointed; luautils.walkAdj no longer queues the walk when called on the server.*
