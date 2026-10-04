---
id: build-42-fluids-in-multiplayer
slug: fluids-in-multiplayer
title: 'Fluids in multiplayer: what syncs, and the call for each place'
game: pz
version: build-42
section: modding
category: fluids
difficulty: advanced
tags:
  - fluids
  - multiplayer
  - server
  - sync
excerpt: >-
  The vanilla pour and transfer actions DO work in multiplayer: their
  complete() runs on the server. What decides whether a fluid change reaches
  the players is where the container sits. The sync call for each place, and
  the mistake we published for six weeks.
last_updated: '2026-10-04'
---
# Fluids in multiplayer: what syncs, and the call for each place

Outcast, we owe you a correction first. For six weeks our own fluid research said "do not reuse the vanilla fluid transfer action, it does not work in multiplayer". That was wrong. We read the action's `update()` and `perform()`, saw a `--todo sync mp` comment and a block wrapped in `if not isClient()`, and stopped reading. The function that does the work, `complete()`, was a few lines further down. The old research page has been corrected; this page is the full story.

The rule to take away: **when an action "does nothing in multiplayer", look for `complete()` before you believe it.**

## The vanilla transfer and pour actions work in multiplayer

`ISFluidTransferAction` (pour from one container into another) and `ISFluidEmptyAction` (pour on the ground) both define `complete()`. In Build 42, a Lua timed action that has a `complete()` is rebuilt on the server, and the server runs `complete()`. That is where the transfer happens, followed by a sync of both containers.

```lua
function ISFluidTransferAction:complete()
	local sourceAmountTarget = self.sourceStartAmount - self.amount;
	local amountToTransfer = math.max(0, self.source:getFluidContainer():getAmount() - sourceAmountTarget);
	FluidContainer.Transfer(self.source:getFluidContainer(), self.target:getFluidContainer(), amountToTransfer);
	self.source:sync()
	self.target:sync()
	return true
end
```

The `if not isClient()` block in `update()` is only the live progress you see while the bar fills.

> **Proof:** Code. `media/lua/shared/Fluids/ISFluidTransferAction.lua` and `ISFluidEmptyAction.lua`, `complete`; `zombie.characters.CharacterTimedActions.LuaTimedActionNew`: the constructor marks an action with no `complete` for client-side sync only, `#start` creates the net timed action on a client, and `#complete` calls the Lua `complete` only where `!GameClient.client`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What reaches the players depends on where the container is

The vanilla action syncs through `ISFluidContainer:sync()`, and that only covers some places. Pick your call by where the container sits:

| Where the container is | Call (on the server) | Who receives it |
|---|---|---|
| In a player's inventory | `item:syncItemFields()` | Only when the item's outermost container belongs to a player; sent to that player |
| Lying on the ground | `item:syncItemFields()` or `sendItemStats(item)` | Players near the square |
| In a crate, a stove, or a vehicle part's container | `sendItemStats(item)` | Players near the container's square, or its parent object |
| Fitted to a vehicle part (the part's own item) | `vehicle:transmitPartItem(part)` | Sends the whole fitted item, components included |
| A world object such as a barrel | the object's `sync()` | What `ISFluidContainer:sync()` does for world objects |
| An item whose fluid you changed in a recipe `OnCreate` | `item:sendSyncEntity(nil)` | Sends every component of the item |

So the vanilla actions are fine for two items in a player's inventory and for world fluid objects. They do **not** replicate a change to a container inside a crate or a vehicle part, because `syncItemFields` sends nothing when the item's outermost container belongs to something other than a player. For those, run your own server command and finish with `sendItemStats`.

Two calls that look useful and are not: `transmitPartUsedDelta` only acts when the fitted item is an old-style drainable (`DrainableComboItem`), so it does nothing for a fluid container; and every one of these calls does nothing when run on a client.

> **Proof:** Code. `media/lua/shared/Fluids/ISFluidContainer.lua`, `ISFluidContainer:sync`; `zombie.inventory.InventoryItem#syncItemFields`; `zombie.network.GameServer#sendItemStats` (owner, world item, source grid, then parent object); `zombie.vehicles.BaseVehicle#transmitPartItem` and `#transmitPartUsedDelta` (`instanceof DrainableComboItem`), both guarded by `GameServer.server`; `zombie.network.fields.vehicle.VehiclePartItem` writes the fitted item with `saveWithSize`; `zombie.entity.GameEntity#sendSyncEntity` (guarded by `GameServer.server`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Everything in this table is read from the code. The one route we have not yet watched on a dedicated server is `sendItemStats` for an item inside a vehicle part's container, so treat that row as the best reading, not a promise.

> **Proof:** Unknown. The `sendItemStats` route for an item in a vehicle part's container is read from `GameServer#sendItemStats` only; no dedicated-server log yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Moving a container carries its fluid with it

When the server adds an item to a container and tells the clients (`sendAddItemToContainer`), the packet carries the item's saved form, and that includes its components. So a filled container moved by the server arrives filled on every client with no extra call. Saving works the same way: a vehicle part saves its container, so fluids survive a save and reload.

> **Proof:** Code. `zombie.inventory.InventoryItem#save` calls `saveEntity` when the item `requiresEntitySave()`, which writes every component; read along the path `sendAddItemToContainer` to `AddInventoryItemToContainerPacket` in revision a2947723ca and spot-checked in 42.21. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Recipe OnCreate runs after the outputs were sent

A craft recipe's `OnCreate` function runs on the server in multiplayer, and only **after** the created items were added to the player and sent to the client. If your `OnCreate` changes the fluid in a created item (for example emptying a pre-filled container, see [the FluidContainer traps](/pz/build-42/modding/fluids/fluid-container-calls-that-lie)), the client still has the old fluid until you send it: call `item:sendSyncEntity(nil)` after the change.

> **Proof:** Code. `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua`, `ISHandcraftAction:performRecipe`: `Actions.addOrDropItem` for each created item, then `luaCallOnCreate`; `ISHandcraftAction:complete` runs `performRecipe` only when `isServer()`. Build 42.21, Steam build 25485521.

## A full inventory blocks a pour

`FluidContainer.CanTransfer` refuses when the **target** item sits in the inventory of a player whose inventory is full, even though the fluid is going into a container that is already there. It also refuses when the target cannot accept every fluid in the source (a blend list says no), or when the result would hold more than eight fluids. If your pour silently refuses, check those three.

> **Proof:** Code. `zombie.entity.components.fluids.FluidContainer#CanTransfer` (`player.hasFullInventory()`, `canAddFluid` for each source fluid, the eight-fluid total). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer): heat is the other half of fluids in multiplayer.
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)
