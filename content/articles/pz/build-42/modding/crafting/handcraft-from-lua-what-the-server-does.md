---
id: build-42-handcraft-from-lua-what-the-server-does
slug: handcraft-from-lua-what-the-server-does
title: 'Crafting and timed actions from Lua: what the server really does'
game: pz
version: build-42
section: modding
category: crafting
difficulty: advanced
tags:
  - crafting
  - timed-actions
  - multiplayer
  - lua
  - silent-failure
excerpt: >-
  Starting a vanilla craft from your own Lua: where its inputs may come from,
  how to pin the exact item, what happens on the client and on the server, why
  a failure on the server is silent, and the one field name that destroys
  every timed action you queue. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# Crafting and timed actions from Lua: what the server really does

Outcast, sooner or later a mod wants to press the craft button for the player: "wash all", "saw all", "boil and sterilise". Build 42 lets you drive the same `ISHandcraftAction` vanilla uses, and in single player it feels easy. In multiplayer the craft is rebuilt and re-checked on the server, and the server does not tell the client much when it says no. This page is what we learned building three "do it for everything" mods.

For the recipe script side, see [the new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block). For timed actions in general, see [timed actions](/pz/build-42/modding/lua-api/timed-actions).

## Where a craft's inputs may come from

The crafting logic takes its candidates from **every item in every container you hand it**. There is no check in the engine that an input is in the player's inventory. So a craft can use a pot that is still inside a stove, or a log on the floor, as long as that container is in the list.

Two limits:

- **The 2.5-tile rule.** When the craft performs, every world container in the list must be within 2.5 tiles of the player, or the craft is refused. Containers that belong to a vehicle part are exempt. Hand each craft a short, nearby list.
- **`CanBeDoneFromFloor` is a Lua flag.** Only vanilla's Lua reads it, to decide whether to move items to the player first. The engine does not care.

An input marked `mode:keep` stays where it is: it is used, not moved. Only the outputs are handed to the player, and they drop on the floor if the player cannot carry them.

> **Proof:** Code. `zombie.entity.components.crafting.BaseCraftingLogic` (candidates from the container list; distance check `outer.getVehiclePart() == null && outer.getSquare() != null && outer.getSquare().DistToProper(this.player) > 2.5F`); `zombie.entity.components.crafting.recipe.CraftRecipeData` and `recipe.ItemDataList` (kept inputs are existing items and are not moved); `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua`, `performRecipe` (`Actions.addOrDropItem` for each output). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Pin the exact item, or the logic picks one for you

Left to itself, the logic fills each input with whatever matches first, which might be the canteen you did not mean. To choose:

- `logic:setRecipeFromContextClick(recipe, item)` switches the logic to manual selection and offers that item to the recipe's inputs, the way a right-click on the item does.
- `logic:setManualInputsFor(inputScript, list)` works only in manual mode. It clears that input, adds the items that pass the input's test (including the recipe's `OnTest`), and returns whether the input is now satisfied. **False means your item was rejected.** Check it.

> **Proof:** Code. `zombie.entity.components.crafting.recipe.HandcraftLogic#setRecipeFromContextClick` (`setManualSelectInputs(true)`, `offerAndReplaceInputItem`); `BaseCraftingLogic#setManualInputsFor` (`return this.isManualSelectInputs() ? this.recipeData.setManualInputsFor(inputScript, list) : false;`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What runs where

`ISHandcraftAction` is a timed action with a `complete()`, so in multiplayer it runs on both sides:

| Step | Client | Server |
|---|---|---|
| `start` / `serverStart` | Rebuilds the logic from your pinned inputs; if the recipe cannot be performed, calls `forceStop` | Rebuilds the logic again and re-pins the inputs; a failure is only written to the debug log |
| Duration | `recipe time x 5` ticks | - |
| `perform` | Fires your "on complete" callback | (single player only: performs the recipe here) |
| `complete` | - | Performs the recipe, fires the callback, and returns true whether or not anything was made |
| `OnCreate` | - | Runs after the outputs were added and sent |

> **Proof:** Code. `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua`: `serverStart`, `start` (`self:forceStop()` when `canPerformCurrentRecipe` fails), `perform` (`performRecipe` only `if not isClient()`, callback `if isClient()`), `complete` (`performRecipe` `if isServer()`, then callback, `return true`), `performRecipe`, `getDuration` (`getTime(self.character) * 5`). Build 42.21, Steam build 25485521.

## A server-side failure is silent

Put the table together and you get the trap. If the server cannot pin an input (a pot that is cold on the server, a vessel holding less than the recipe needs, a container now out of reach), it logs one debug line and carries on. The action still plays its full animation, `complete()` still returns true, your callback still fires, and nothing is consumed or made. [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer) walks through the most common case.

So in a mod that queues many crafts, do not count success by callbacks. Count it by what is actually in the inventory afterwards, and expect the outputs to arrive in a separate update from the callback, with no promised order between them.

> **Proof:** Code. `ISHandcraftAction:serverStart` (`log(DebugType.CraftLogic, ...)` on a failed `setManualInputsFor`) and `ISHandcraftAction:complete`. Build 42.21, Steam build 25485521.

## A client-side failure wipes the whole queue

When a timed action stops early on the client (`forceStop`, a failed walk, an action whose `isValid` turns false), the base class resets the player's whole action queue. Every craft you queued behind it is gone too, and only `ISHandcraftAction` tells you through its cancel callback. If you queue a long chain, check after each step that the queue is still yours.

> **Proof:** Code. `media/lua/shared/TimedActions/ISBaseTimedAction.lua`, `ISBaseTimedAction:stop` (`ISTimedActionQueue.getTimedActionQueue(self.character):resetQueue()`). Build 42.21, Steam build 25485521.

## Never name your own field `action`

`ISBaseTimedAction` keeps its engine handle in `self.action`, and `create()` overwrites it one step before the action starts:

```lua
function ISBaseTimedAction:create()
	self.maxTime = self:adjustMaxTime(self.maxTime);
	self.action = LuaTimedActionNew.new(self, self.character);
end
```

We once stored our own data in `self.action` in a subclass. Every action we queued lost it before its first tick, `isValid` failed, and all ten actions in the queue were dropped mid-way with no error. `character` and `maxTime` are the base class's too. Name your fields something only your mod would use.

> **Proof:** Code. `media/lua/shared/TimedActions/ISBaseTimedAction.lua`, `ISBaseTimedAction:create`. Build 42.21, Steam build 25485521.

> **Proof:** Game test. The queue of ten actions dropped on its first tick, seen in the game log and fixed by renaming the field. Build 42.20, engine revision a2947723ca.

## A purely client-side action

Sometimes you want an action that only waits on the client, for example "stand here until the walk finishes". A Lua timed action with **no** `complete()` is never sent to the server; it runs only on the client. Give it `maxTime = -1`, make `isValid` return exactly `true` while it should continue, and finish it with `forceComplete()` or `forceStop()`. Vanilla's `ISStopVehicle` is an example.

> **Proof:** Code. `zombie.characters.CharacterTimedActions.LuaTimedActionNew`: an action whose table has no `complete` gets `useCustomRemoteTimedActionSync = true`, and the net timed action is only created when that flag is false; `media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer)
- [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
