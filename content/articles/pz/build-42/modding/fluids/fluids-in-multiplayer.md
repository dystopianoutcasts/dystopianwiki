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
  In 42.22 the vanilla pour and transfer actions work in multiplayer because the server runs their complete(). What reaches players depends on where the container sits.
last_updated: '2026-11-16'
related_articles:
  - the-fluid-system
  - fluids-for-modders-start-here
  - fluid-container-calls-that-lie
  - hot-items-in-multiplayer
  - timed-actions
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders who pour or transfer fluid](#1-the-vanilla-transfer-and-pour-actions-work-in-multiplayer) | [modders who change a fluid in code](#2-what-reaches-the-players-depends-on-where-the-container-is) | [server owners](#6-warnings-for-server-owners)

Outcast, we owe you a correction first. Our own early fluid research said "do not reuse the vanilla fluid transfer action, it does not work in multiplayer". That was wrong.

We read the action's `update()` and `perform()`, saw a `--todo sync mp` comment and a block wrapped in `if not isClient()`, and stopped reading. The function that does the work, `complete()`, was a few lines further down. This page is the full story, read from the 42.22 code.

The rule to take away: **when an action "does nothing in multiplayer", look for `complete()` before you believe it.**

:::callout[The 1-minute version]{kind=key}
- The vanilla transfer and pour actions define `complete()`, and the server runs it. Single player runs it too; a multiplayer client does not.
- What reaches the players depends on where the container sits. The vanilla action syncs items in a player's inventory and world fluid objects; it does not send a change to a container inside a crate or a vehicle part.
- For those, finish your server code with `sendItemStats(item)`. Every one of the server-side sync calls on this page does nothing unless it runs on the server, except `syncItemFields`, which also acts on a client.
- A filled container that the server moves arrives filled on every client. A recipe `OnCreate` that changes a fluid runs after the outputs were sent, so send the change yourself.
- A full inventory blocks a pour into a container that sits in that inventory.
- Nothing on this page has been watched on a dedicated server; it is read from the code.
:::

:::facts
- **Places in the sync table** 6 :cite[(`GameServer.java:3180-3209`, `InventoryItem.java:4428-4447`)]
- **Fluids in one container** at most 8 :cite[(`FluidContainer.java:907`)]
- **Who runs `complete()`** single player and the server, not a multiplayer client :cite[(`IsoGameCharacter.java:9192-9195`)]
:::

## 1. The vanilla transfer and pour actions work in multiplayer

**`ISFluidTransferAction` and `ISFluidEmptyAction` both define `complete()`, and a Lua timed action with a `complete()` is run on the server.**

The action loop calls `perform()` and then `complete()`, and the second call is skipped only on a multiplayer client :cite[(`IsoGameCharacter.java:9192-9195`)]. A Lua action with no `complete` in its table is marked for client-side sync only :cite[(`LuaTimedActionNew.java:85-87`)]. A client with a `complete` creates a net timed action when it starts :cite[(`LuaTimedActionNew.java:138-141`)]. The Lua `complete` is called only where the game is not a client :cite[(`LuaTimedActionNew.java:176-181`)]. The transfer happens there, followed by a sync of both containers:

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

The code above is `media/lua/shared/Fluids/ISFluidTransferAction.lua:70-78`. The `if not isClient()` block in `update()` is the live progress while the bar fills, and it runs in single player and on the server, not on a client :cite[(`media/lua/shared/Fluids/ISFluidTransferAction.lua:24-31`)]. `ISFluidEmptyAction:complete` empties the container and syncs it the same way :cite[(`media/lua/shared/Fluids/ISFluidEmptyAction.lua:99-107`)].

| Part of the action | Single player | Multiplayer client | Dedicated server | Code |
|---|---|---|---|---|
| The `update()` progress block (`if not isClient()`) | Runs | Skipped | Runs | `ISFluidTransferAction.lua:24-31` |
| `complete()` and the sync calls | Runs | Skipped | Runs | `IsoGameCharacter.java:9192-9195`, `LuaTimedActionNew.java:176-181` |

The server column is read from the guards only: the server's own action loop was not traced.

## 2. What reaches the players depends on where the container is

**The vanilla action syncs through `ISFluidContainer:sync()`, which covers only some places, so pick your call by where the container sits.**

`ISFluidContainer:sync()` returns at once on a client. On the server it calls the object's `sync()` for a world object, `syncItemFields()` for an inventory item, and prints "not implemented" for a fluid resource :cite[(`media/lua/shared/Fluids/ISFluidContainer.lua:96-108`)]. The calls below are for code that runs on the server:

| Where the container is | Call (on the server) | Who receives it | Code |
|---|---|---|---|
| In a player's inventory | `item:syncItemFields()` | The player whose inventory holds it | `InventoryItem.java:4428-4436` |
| Lying on the ground | `item:syncItemFields()` or `sendItemStats(item)` | Players near the square | `InventoryItem.java:4443-4446`, `GameServer.java:3183-3185` |
| In a crate, a stove, or a vehicle part's container | `sendItemStats(item)` | Players near the container's square, or its parent object | `GameServer.java:3187-3203` |
| Fitted to a vehicle part (the part's own item) | `vehicle:transmitPartItem(part)` | Sends the whole fitted item, components included | `BaseVehicle.java:8262-8269`, `VehiclePartItem.java:56-67` |
| A world object such as a barrel | the object's `sync()` | What `ISFluidContainer:sync()` does for world objects | `ISFluidContainer.lua:101-102` |
| An item whose fluid you changed in a recipe `OnCreate` | `item:sendSyncEntity(nil)` | Sends every component of the item | `GameEntity.java:666-693` |

So the vanilla actions are fine for two items in a player's inventory and for world fluid objects. They do **not** replicate a change to a container inside a crate or a vehicle part, because `syncItemFields` sends nothing when the item's outermost container belongs to something other than a player and the item is not a world item :cite[(`InventoryItem.java:4428-4447`)]. For those, run your own server command and finish with `sendItemStats`.

Two calls look useful and are not. `transmitPartUsedDelta` only acts when the fitted item is an old-style drainable (`DrainableComboItem`), so it does nothing for a fluid container :cite[(`BaseVehicle.java:8291-8300`)]. And the Lua global `sendItemStats` does nothing unless the game is the server, as do `transmitPartItem` and `sendSyncEntity` :cite[(`LuaManager.java:4365-4373`, `BaseVehicle.java:8262-8269`, `GameEntity.java:666-667`)]. `syncItemFields` is different: on a client it sends the item's fields, fluid state included, to the server when the item sits in the local player's inventory, and also for an item that is an inventory container (a bag) anywhere except a remote player's inventory :cite[(`InventoryItem.java:4430-4432`, `:4437-4439`)]. See the warning in section 6.

The one route not yet watched on a dedicated server is `sendItemStats` for an item inside a vehicle part's container. Treat that row as the best reading, not a promise.

## 3. Moving a container carries its fluid with it

**When the server adds an item to a container and tells the clients, the packet carries the item's saved form, which includes its fluid.**

`sendAddItemToContainer` sends the item to the container's owning player, or to players near the container's parent object or the world item that holds it :cite[(`GameServer.java:2435-2450`)].

The packet writes the item with the shared item save and reads it back with the matching load :cite[(`AddInventoryItemToContainerPacket.java:65`, `:77`)]. An item with components saves them too, and a fluid container is one of those components :cite[(`InventoryItem.java:1833-1835`, `GameEntity.java:516-522`)]. So a filled container moved by the server arrives filled on every client with no extra call. A vehicle part saves its container the same way, so fluids survive a save and reload.

## 4. Recipe OnCreate runs after the outputs were sent

**A craft recipe's `OnCreate` function runs on the server in multiplayer, and only after the created items were added to the player and sent to the client.**

The hand-craft action adds or drops each created item, then calls `OnCreate`, then handles the destroyed and used items :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:225-238`)]. Adding an item to the player's inventory sends it at once :cite[(`media/lua/shared/ActionManager.lua:4-24`)]. In multiplayer `complete()` calls this on the server, and in single player `perform()` does :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:196`, `:207-217`)].

If your `OnCreate` changes the fluid in a created item (for example emptying a pre-filled container, see [the FluidContainer traps](/pz/build-42/modding/fluids/fluid-container-calls-that-lie)), the client still has the old fluid until you send it: call `item:sendSyncEntity(nil)` after the change :cite[(`GameEntity.java:666-693`)].

## 5. A full inventory blocks a pour

**`FluidContainer.CanTransfer` refuses when the target item sits in the inventory of a player whose inventory is full.**

That holds even though the fluid is going into a container that is already there :cite[(`FluidContainer.java:1124-1133`)]. It also refuses when the source is empty, the target is full or locked, the target cannot accept every fluid in the source (a blend list says no), or the result would hold more than eight fluids :cite[(`FluidContainer.java:1134-1153`)]. If your pour silently refuses, check those cases. The vanilla action's `isValid` calls `CanTransfer`, so the action itself will not start :cite[(`media/lua/shared/Fluids/ISFluidTransferAction.lua:5-10`)].

## 6. Warnings for server owners

**These are gaps in what the server checks, read from the code and not tested on a server.**

:::callout[Warning: fluid state is accepted from clients]{kind=warn}
A client can send the server a `SyncItemFields` packet for an item in its own inventory, and the packet carries the item's fluid container state :cite[(`InventoryItem.java:4430-4432`, `SyncItemFieldsPacket.java:236`)]. When the server reads it, the packet loads that state into the item named in the packet; the only check read is that the container and item exist :cite[(`SyncItemFieldsPacket.java:365-375`, `:631-633`)]. Do not treat the amount or kind of a fluid in a client-owned item as proof that the client got it honestly. A reward that depends on a fluid amount should be decided from server-side facts.
:::

The vanilla transfer, pour and `OnCreate` paths all run on the server, so a fluid change made through them is the server's own decision. A change a mod makes in a client command handler needs the same care: the handler should read the container on the server before it trusts the request.

## Where to go next

- [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer): heat is the other half of fluids in multiplayer.
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. Nothing here was watched on a dedicated server.

**Checked again for 42.22, and different from 42.21:**
- `syncItemFields` does not do nothing on a client: for an item in the local player's inventory, or an inventory-container item not in a remote player's inventory, it sends a packet to the server. The other server-side calls do nothing off the server.
- The table of which host runs which part of a timed action is new: the action loop runs `complete()` in single player and on the server, and skips it on a multiplayer client.

**Not verified:** the `sendItemStats` row for an item inside a vehicle part's container (read from `GameServer.sendItemStats` only); what the dedicated server's own action loop does with a net timed action beyond the guards cited; whether the `SyncItemFields` path is limited by anything outside the packet class, such as a role check, beyond what was read there.
:::
