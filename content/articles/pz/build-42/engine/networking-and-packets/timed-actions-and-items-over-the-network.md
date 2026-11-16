---
id: build-42-timed-actions-and-items-over-the-network
slug: timed-actions-and-items-over-the-network
title: 'Timed actions and items over the network'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: advanced
tags:
  - engine
  - multiplayer
  - networking
  - timed-actions
  - items
  - modding
excerpt: >-
  How a Build 42.22 multiplayer server runs a timed action and moves items between containers: the request, the accept, the wait, the result, and what your own action class must do for it to work.
last_updated: '2026-11-15'
related_articles:
  - client-and-server-commands
  - the-packet-system
  - who-owns-what
  - networking-reference
  - timed-actions
  - what-runs-on-the-server-in-build-42-multiplayer
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#the-life-of-one-timed-action) | [server owners](#what-the-server-does-not-check) | the Lua side of a timed action is on [Timed actions](/pz/build-42/modding/lua-api/timed-actions), and this page does not repeat it

:::callout[The 1-minute version]{kind=key}
- In multiplayer a timed action whose class defines `complete` is run by the server: the client sends a request, the server rebuilds the action from the class name and the constructor arguments, accepts it, waits for the duration, calls `complete`, and tells the client the result.
- A class without `complete` is not sent to the server and runs on the client only.
- The server rebuilds the action by calling `<ClassName>.new` with the values the client sent, so the class must be a global that the server also loads, and each constructor parameter must be saved on the action under the same name.
- In the code read, nothing on the server calls the action's Lua `isValid`, so `complete` has to check its own conditions.
- A Lua duration unit is 20 ms on the server, so a `getDuration` of 100 is 2 seconds. The server tests for completion once per update, which is 10 times a second on a dedicated server.
- Moving items between containers is a separate request, an item transaction. If the server rejects it when its time is up, nothing is sent back, and the client gives up only when its own timer runs out.
- Nothing here was run in a game. Each claim that rests on reading the code only says so.
:::

:::facts
- **Action packets** `NetTimedAction` 122, `BuildAction` 123, `FishingAction` 124, `GeneralAction` 121
- **Transaction packet** `ItemTransaction` 120
- **Settings** priority 1 (high), reliable and ordered, channel 1
- **Capability** `LoginOnServer` for all five
- **Duration unit** 1 = 20 ms on the server; a looped action waits at most 1,800,000 ms (30 minutes)
- **Client timeout for a transaction** its duration plus 10,000 ms, or 20,000 ms when the duration is 0
- **Vanilla** 281 classes derive directly from `ISBaseTimedAction`, and 239 of them define `complete`
:::

## What the server runs itself

The server runs the world change of a timed action when the action's class has a `complete` function, and it runs build actions, fishing actions and item moves through packets of their own.

Five packets carry this work, and all five use priority 1 and the reliable, ordered channel 1. :cite[(`PacketTypes.java:441-445`)]

| Packet | Id | Direction | Used for | Code |
|---|---|---|---|---|
| `NetTimedAction` | 122 | Both | Any timed action whose class has `complete` | :cite[(`network/packets/NetTimedActionPacket.java:25-33`)] |
| `BuildAction` | 123 | Both | The build cursor's placements | :cite[(`network/packets/BuildActionPacket.java:45-67`)] |
| `FishingAction` | 124 | Both | The fishing action | :cite[(`core/ActionManager.java:228-232`)] |
| `GeneralAction` | 121 | Client to server | Cancelling an action that was accepted | :cite[(`network/packets/GeneralActionPacket.java:20-40`)] |
| `ItemTransaction` | 120 | Both | Moving items between containers | :cite[(`network/packets/ItemTransactionPacket.java:151-189`)] |

The class decides which path an action takes.

The constructor of `LuaTimedActionNew` sets a flag when the Lua class has no `complete`, and that flag turns off every network call for the action. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`, `characters/CharacterTimedActions/LuaTimedActionNew.java:102`)] In vanilla, 239 of the 281 classes that derive directly from `ISBaseTimedAction` define `complete`. Of the 42 that do not, 38 are in `client/` and 4 are in `shared/`. The Lua side of this choice is covered in [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

The `actions/` folder of the packet classes is a different thing. It holds eleven one-shot packets, such as `EatFood` and `SmashWindow`, not the timed-action machinery. :cite[(`PacketTypes.java:321-623`)]

## The life of one timed action

An action is requested by the client, accepted or rejected by the server, run for its duration, completed on the server, and reported back.

:::flow[One NetTimedAction, from start to result]
- The client starts the action and sends a Request
- The server rebuilds the action and stops the player's other actions
- The server answers Accept with the duration, or Reject
- The server waits until the end time
- The server calls the action's `complete`
- The server sends Done, or Reject if `complete` returned false
- The client finishes or stops its own copy
:::

The states are `Reject`, `Request`, `Accept` and `Done`. :cite[(`core/Transaction.java:465-470`)]

The client starts the request from `LuaTimedActionNew.start`. After it has called the Lua `start`, it creates the network action, remembers the returned id and waits for the server to finish. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:134-143`)] The request carries the player, the class name (`Type`), the action's `name`, and a table of constructor arguments. :cite[(`core/NetTimedAction.java:43-65`, `core/NetTimedAction.java:185-192`)]

On the server, `processServer` accepts the request only when the player resolves and the action table's `character` is that same player. :cite[(`network/packets/NetTimedActionPacket.java:73-77`)] It then stops every other action of that player, starts the new one, and writes an `Accept` that carries the duration. :cite[(`network/packets/NetTimedActionPacket.java:77-87`, `core/ActionManager.java:47-52`, `core/ActionManager.java:68-74`)] A request that fails these tests gets a `Reject`. :cite[(`network/packets/NetTimedActionPacket.java:88-96`)]

The player comes from the connection's own player slot, not from a name the client types. :cite[(`network/fields/character/ConnectionPlayer.java:39-58`)]

When the end time has passed, the manager calls `perform`, which calls the Lua `complete`. A `true` answer marks the action Done and sends it to the sender. A `false` answer, or an error, marks it Rejected and sends that. :cite[(`core/ActionManager.java:76-112`, `core/NetTimedAction.java:139-147`)] The client's copy checks every update: Done makes it complete, and Reject makes it stop. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:98-110`)]

If the player cancels, the client removes its copy and sends a `GeneralAction` with state `Reject`, and the server stops the matching action, which calls the Lua `serverStop` if the class has one. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:152-163`, `network/packets/GeneralActionPacket.java:34-39`, `core/NetTimedAction.java:114-123`)] When a player disconnects, the server rejects the transactions of that player. :cite[(`GameServer.java:3069`)]

## What the constructor must look like

The server builds the action again by calling the class's `new`, so the class has to be reachable by name and its constructor arguments have to be saved on the action table.

Both of these follow from what the sender writes. The request holds the name from the table's metatable `Type`, and the server finds the class with `LuaManager.get(type)` and the function `<type>.new`. :cite[(`core/NetTimedAction.java:43-48`, `core/NetTimedAction.java:149-168`)] A class that is only a local variable in its file cannot be found, which is why vanilla's timed actions are global tables.

The arguments are chosen by parameter name.

The sender looks at the names of `new`'s parameters, skipping `self`, reads a field of the same name from the action table, and writes it. A field that is missing is written as a null marker. :cite[(`core/NetTimedAction.java:48-58`)] So a constructor `new(character, lightSource)` works only if it stores `o.character` and `o.lightSource`, as vanilla's actions do. :cite[(`media/lua/shared/BuildingObjects/TimedActions/ISToggleLightSourceAction.lua:36-43`)] How the server's `new` sees a null marker is not verified.

The values travel in a richer table than a command's table. It is `PZNetKahluaTableImpl`, whose writer tests for 40 kinds of value, among them strings, numbers, booleans, items, players, zombies, animals, vehicles, vehicle parts, containers, squares and recipes, and it writes the ones that name a game object by its id so that the other side can find the object. :cite[(`PZNetKahluaTableImpl.java:793-837`, `PZNetKahluaTableImpl.java:357-400`)] The plain command table is described in [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands).

## Duration and the clock

The server decides when an action ends, from the action's own `getDuration`, and it converts the Lua unit to milliseconds by multiplying by 20.

For a `NetTimedAction` the server calls the Lua `getDuration`, then `adjustMaxTime` (a server-only step), then multiplies by 20. :cite[(`core/NetTimedAction.java:78-100`)] So a `getDuration` of 100 becomes 2,000 ms. The client divides by 20 when it reads the duration back, so the unit is the same on both sides. :cite[(`Lua/LuaManager.java:12202-12206`)]

A duration of -1 means a looped action. Its end time is the start plus `AnimEventEmulator.getDurationMax()`, which is 1,800,000 ms (30 minutes). :cite[(`core/Action.java:33-40`, `network/server/AnimEventEmulator.java:26-28`)] A class can ask the server to fire animation events on a schedule with `emulateAnimEvent` and `emulateAnimEventOnce`, which the server runs and the client ignores. :cite[(`Lua/LuaManager.java:12222-12240`, `network/server/AnimEventEmulator.java:30-55`)]

The server's check for completion runs from the game state's update, once per update. :cite[(`gameStates/IngameState.java:1665-1669`)] A dedicated server updates 10 times a second, so by this reading an action can finish up to one update, about 100 ms, after its end time. :cite[(`GameServer.java:858-859`, `GameServer.java:1068`)] That figure is derived from the loop rate and was not measured.

## What the server does not check

The server accepts a request that names a valid player and a class it can build, and it does not call the action's Lua `isValid`, so `complete` has to do the checking.

The Java class `NetTimedAction` has an `isValid` that returns false, and the manager does not call it. :cite[(`core/NetTimedAction.java:125-128`)] A search of the whole source for the string "isValid" finds it read from Lua only in the client's `LuaTimedActionNew.valid` and from the build action. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:120-126`, `core/BuildAction.java:78-83`)] A mod's `complete` therefore starts by testing what `isValid` tests on the client: that the item is still where it should be, that the target still exists, that the player is close enough, and anything else the action needs. When it fails a test, it returns false.

A rejected action tells the client only that it was rejected. There is no reason in the packet, so a mod that wants the player to see a reason sends it as a command. :cite[(`core/NetTimedAction.java:185-192`)] The pattern is in [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands).

> **Warning:** The server trusts each mod's server code to check its own actions, so install only mods whose server code you trust.

## Item transactions

An item transaction is a request to move items from one container to another, and the server checks it twice, once when it is requested and again when its time is up.

The Lua call is `createItemTransaction(player, items, source, destination)`. It returns an id, or 0 when it is not called on a client or when the client's own check fails. :cite[(`Lua/LuaManager.java:12100-12110`, `core/TransactionManager.java:401-433`)] The client checks all the items first with the same function the server uses, then sends the packet and keeps a copy of the transaction. :cite[(`core/TransactionManager.java:401-424`)] Vanilla's transfer action calls it, and then waits on `isItemTransactionDone` and `isItemTransactionRejected`. :cite[(`media/lua/client/TimedActions/ISInventoryTransferAction.lua:162-166`, `media/lua/client/TimedActions/ISInventoryTransferAction.lua:313`)]

On the server, `processServer` runs the consistency test for every entry. If all pass, it computes the time, adds the transaction, and sends `Accept`. If any fails, it sends `Reject`. :cite[(`network/packets/ItemTransactionPacket.java:151-179`)] The test refuses a move when:

- the item is not in the source container, or the destination does not allow it;
- the destination is inside the item that is being moved;
- the container is in a safehouse that does not allow the player to loot it;
- a vehicle container is more than 5 tiles from the character;
- the destination does not have room, with the weight of the other open transactions added;
- another open transaction already involves the same item or container.

:cite[(`core/TransactionManager.java:100-200`, `core/TransactionManager.java:229-262`)]

The delay comes from the server and not from the client. It starts at 120 for a move inside the character's inventory and 50 when one side is outside it, then scales with the item's weight and how full the destination is. It is shorter for a drop on the floor, halved for a dextrous character and doubled for all thumbs or awkward gloves. The largest value among the entries is multiplied by 20 to get milliseconds. :cite[(`core/Transaction.java:343-442`, `core/Transaction.java:432-435`)]

When the time is up, `TransactionManager.update` calls `transaction.update`, which does the moves.

A `true` answer sends the transaction to the player as Done. A `false` answer, or an error, only marks it Rejected, and nothing is sent. :cite[(`core/TransactionManager.java:59-78`, `core/Transaction.java:129-137`)] The client then waits for its own timeout, which is the transaction's duration plus 10,000 ms, or 20,000 ms when the duration is 0. :cite[(`core/TransactionManager.java:79-90`, `core/TransactionManager.java:41-42`)] After that the client's list no longer holds the transaction.

By this reading both `isItemTransactionDone` and `isItemTransactionRejected` then answer true, because each asks whether every matching entry has the state and none match. :cite[(`core/TransactionManager.java:369-376`, `Lua/LuaManager.java:12162-12175`)] That is a reading of the code and was not run.

Some moves reach Lua. Taking, scrapping or rotating a moveable fires the event `OnProcessTransaction` on the server with an action name such as `scrapMoveable`, `pickUpMoveable` or `rotateMoveable`, and vanilla's `TransactionProcessor` handles them. :cite[(`core/Transaction.java:139-155`, `media/lua/server/TransactionProcessor.lua:57-74`)] The build action fires `OnProcessAction` in the same way. :cite[(`core/BuildAction.java:116-125`, `media/lua/shared/ActionManager.lua:34-51`)]

## Container changes your server code makes

When server code changes a container, it must also tell the clients, and the Lua calls for that work only on a server.

| Call | Works on | What it sends | Code |
|---|---|---|---|
| `sendAddItemToContainer(container, item)` and `sendAddItemsToContainer` | Server | `AddInventoryItemToContainer` to the owning player, or to relevant clients | :cite[(`Lua/LuaManager.java:12366-12391`, `GameServer.java:2435-2470`)] |
| `sendRemoveItemFromContainer(container, item)` and `sendRemoveItemsFromContainer` | Server (the single-item form also works on a client) | `RemoveInventoryItemFromContainer`. From a client it sends `SyncItemDelete` instead, which needs the capability `EditItem` | :cite[(`Lua/LuaManager.java:12414-12435`, `GameServer.java:2495-2515`, `GameClient.java:2053-2055`)] |
| `sendReplaceItemInContainer(container, old, new)` | Server | `ReplaceInventoryItemInContainer` | :cite[(`Lua/LuaManager.java:12404-12412`, `GameServer.java:2471-2493`)] |
| `syncItemFields(player, item)` | A client for its own player, or a server | `SyncItemFields` | :cite[(`Lua/LuaManager.java:12336-12343`)] |
| `syncItemModData(player, item)` | Server | `SyncItemModData` to relevant clients | :cite[(`Lua/LuaManager.java:12326-12333`)] |

A change made in `complete` and not sent stays on the server. Whether clients see the change only after they reload the container was not verified.

## What this means for your own timed action

A timed action that works in multiplayer is a global class with `complete`, a constructor whose parameters are stored by name, and a `complete` that checks everything and reports its own refusals.

1. Define the class as a global table, derived from `ISBaseTimedAction`, in a file in `shared`, so the server loads it. :cite[(`Lua/LuaManager.java:1253-1257`, `network/GameServer.java:1517-1519`)]
2. Give it a `complete` that returns true when the change was made and false when it was not. Without `complete` the action is not sent to the server. The Java class also has a setter named `setCustomRemoteTimedActionSync` that turns the sync off, which no vanilla Lua file calls; whether Lua can reach it is not verified. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`, `characters/CharacterTimedActions/LuaTimedActionNew.java:219-221`)]
3. Store each `new` parameter on the action under the same name.
4. In `complete`, test every condition again and tell the player about a refusal with a command.
5. After `complete` changes a container, call the matching `send...` function from the table above.
6. Test with a second player or a dedicated server. Single player runs `complete` locally and shows none of the delays above. :cite[(`characters/CharacterTimedActions/LuaTimedActionNew.java:176-182`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and vanilla Lua: `NetTimedActionPacket`, `NetTimedAction`, `ActionManager`, `LuaTimedActionNew`, `ItemTransactionPacket`, `TransactionManager`, `Transaction`, `GameServer` and `GameClient`, and a script count over the vanilla timed-action files. No game or server was run. Not verified: how the server's `new` treats a null marker for a missing field, whether the client's progress bar uses the same 20 ms unit, what a client sees in the moment between a silent transaction rejection and its timeout, and which of the moveable and build functions of `TransactionProcessor` a given mod will reach.
:::
