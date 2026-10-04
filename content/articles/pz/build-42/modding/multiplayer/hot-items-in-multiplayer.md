---
id: build-42-hot-items-in-multiplayer
slug: hot-items-in-multiplayer
title: 'Hot items in multiplayer: the server owns the heat'
game: pz
version: build-42
section: modding
category: multiplayer
difficulty: advanced
tags:
  - multiplayer
  - cooking
  - fluids
  - crafting
  - silent-failure
excerpt: >-
  In Build 42 multiplayer only the server simulates item heat, every five
  seconds. A pot cools on the server the moment it leaves the stove while the
  client still shows it hot, and a craft that needs hot water then plays its
  whole animation and makes nothing. How heat works, how hot each heat source
  gets, and how to build around it.
last_updated: '2026-10-04'
---
# Hot items in multiplayer: the server owns the heat

Outcast, if your mod boils, cooks, sterilises or does anything that needs a hot item, this page will save you a confusing evening. We found it while designing a mod that boils water to disinfect bandages. In single player everything works. In multiplayer, the same steps can play out perfectly on screen and produce nothing.

Everything below is read from the 42.21 code. We have not yet watched the failure happen on a dedicated server, and we say so where it matters.

## Who simulates heat

Items that change over time (heat, wetness, cooking) are updated by an item loop. That loop runs in single player every frame, and on a multiplayer **server** once every five seconds. On a multiplayer **client** it does not run: the call that would add an item to it does nothing on a client.

```java
public void addToProcessItems(InventoryItem item) {
   if (item != null && !GameClient.client) {
      this.processItemsRemove.remove(item);
      if (!this.processItems.contains(item)) {
         this.processItems.add(item);
```

So in multiplayer the server's copy of a pot is the real one. A client's copy of the pot's heat changes only when the server sends it.

> **Proof:** Code. `zombie.iso.IsoCell#addToProcessItems` (no-op on a client) and the item update in `IsoCell`'s update (`!GameClient.client && !GameServer.server`, or on the server only when more than 5000 ms have passed since the last item update). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Items a character carries that update themselves, such as weapons, are a separate path; a saucepan is a weapon and updates on the client too. A cooking pot does not.

> **Proof:** Code. `zombie.inventory.types.HandWeapon` implements `IUpdater`; `zombie.inventory.types.ComboItem` (the cooking pot's type) does not; `zombie.characters.IsoGameCharacter` updates carried items only through `IUpdater`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How an item heats and cools

An item's heat moves toward the temperature of the container it sits in (the outermost one, so a pot in a bag in a stove counts as in the stove).

- It **rises** only if the item is tagged `base:cookable` (or `base:cookablemicrowave` in a microwave), and never above 3.0.
- It **falls** back toward the container's temperature when the container is colder, but never below 0.2.
- On the server the steps are large, because each update covers five seconds of game time: heat effectively jumps to the container's temperature at the next update after the pot goes in, and falls back within an update or two after it comes out.

> **Proof:** Code. `zombie.inventory.InventoryItem#update`, the fluid-container heat block (rise rate `temp / (GameServer.server ? 16 : 1000)` times the time multiplier, cap `Math.min(3.0F, temp)`, fall rate `0.06F` on the server against `0.001F` in single player, floor 0.2). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How hot each heat source gets

The container's temperature is 1.0 almost everywhere, including a player's inventory. The exceptions:

| Where the item is | Container temperature |
|---|---|
| A powered stove or microwave that is on | `(stove temperature + 100) / 100`. The oven knob goes 0, 50, 100 ... 300, so a knob at 0 or 50 never passes 1.5, and 100 or more reaches 2.0 and up as the oven warms |
| A lit fireplace or a lit barbecue | 1.8 |
| A built campfire | 1.9, or 1.7 when its fuel is low (set by the server's campfire code) |
| A powered fridge or freezer | 0.2 |

The "is it hot" test the recipes use is **heat above 1.6**. So a stove on a low knob boils nothing, ever.

The stove's own temperature is simulated separately on each side and is not sent between them, so the stove's dial on a client is not proof of anything either.

> **Proof:** Code. `zombie.inventory.ItemContainer#getTemperature`; `zombie.iso.objects.IsoStove#getCurrentTemperature` (`(this.currentTemperature + 100.0F) / 100.0F`); `IsoFireplace#getTemperature` and `IsoBarbecue#getTemperature` (1.8 when lit); `media/lua/server/Camping/SCampfireGlobalObject.lua` (1.9 or 1.7); `media/lua/client/ISUI/Fireplace/ISOvenUI.lua`, `addKnobValues`; `zombie.scripting.logic.RecipeCodeOnTest#hotFluidContainer` (`item.getItemHeat() > 1.6F`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The client can see a pot as hot after the server has cooled it

The server sends a hot item's state to clients (an `ItemStats` packet) only while the item's heat is **above 1.6** and its container is not empty. Once the pot cools below 1.6 on the server, the server stops sending. The client keeps the last value it got, which was hot.

So a client can show a pot at 2.9 while the server already has it at 1.0. A mod that checks `getItemHeat()` on the client and then asks the server to do something hot will be told "yes" by the client and "no" by the server.

> **Proof:** Code. `InventoryItem#update`: `GameServer.sendItemStats(this)` sits inside `if (this.itemHeat > 1.6F && !cont.isEmpty())`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A hot-water craft on a cold pot does nothing, and reports success

Vanilla's "Disinfect Bandage" needs hot water: its `OnTest` is `RecipeCodeOnTest.hotFluidContainer`. In multiplayer the craft action is rebuilt on the server, which pins the input items again and runs that test against **its** copy of the pot. If the server's pot is cold:

1. the server fails to pin the pot and only writes a debug log line;
2. the action still runs its full time and animation on the client;
3. `complete()` on the server performs nothing and still returns true;
4. the client's "on complete" callback fires as if it worked.

Nothing is consumed, nothing is made, and nothing tells the player why.

> **Proof:** Code. `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua`: `serverStart` calls `setManualInputsFor` and on failure only `log(DebugType.CraftLogic, ...)`; `complete` runs `performRecipe` when `isServer()`, then `onCompleteFunc`, then `return true`. `zombie.entity.components.crafting.BaseCraftingLogic#setManualInputsFor` runs the input's test. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. We have not reproduced the silent failure on a dedicated server; it is the code path above, read end to end. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How to build around it

- **Keep the item inside the lit heat source while it is used.** A craft can use a pot that is still in an adjacent stove: the crafting logic takes inputs from every container in the list it is given, and a `mode:keep` input is never moved to the player. Inside the stove, the server keeps it hot.
- **Ask the server, not the client.** If your logic depends on heat, decide on the server, with the server's copy of the item.
- **Never trust a timer.** "Wait 30 seconds and it will be hot" is wrong on a server that updates every five seconds and on a stove whose knob might be at 50.
- **Remember the 2.5-tile rule.** Every world container handed to a craft must be within 2.5 tiles of the player when the craft performs (a vehicle part's container is exempt), or the craft is refused; hand the craft a short list.

> **Proof:** Code. `zombie.entity.components.crafting.BaseCraftingLogic` (inputs drawn from every container in the list); `CraftRecipeData` adds a kept input as an existing item and `ItemDataList` leaves it where it is; `zombie.entity.components.crafting.recipe.CraftRecipeData` marks a kept input as an existing item, and `recipe.ItemDataList` skips existing items when moving; `BaseCraftingLogic` refuses a container whose square is more than 2.5 tiles away (`DistToProper(this.player) > 2.5F`) unless it belongs to a vehicle part. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Two things vanilla already does, so you do not have to

- **"Wash > All Bandages"** already exists on any water source: right-click the sink or barrel. It washes every dirty bandage and rag in the main inventory (not the ones inside bags).
- **Boiling purifies tainted water** on its own (see [drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling)). A pot of tainted water in a hot oven becomes clean water.

> **Proof:** Code. `zombie.iso.ISWorldObjectContextMenuLogic` (`ContextMenu_WashAllBandage`, built from the main inventory with `getAllTag(ItemTag.CAN_BE_WASHED)`, handled by `ISWorldObjectContextMenu.onWashClothing`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)
- [Crafting from Lua: what the server does](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does)
