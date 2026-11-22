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
  In 42.22 multiplayer only the server simulates the heat of a pot, about every 5 seconds. A client can keep showing it hot, and a hot-water craft can then play its whole animation and make nothing.
last_updated: '2026-11-21'
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders](#1-who-simulates-heat) | [mod builders who need a hot item](#6-how-to-build-around-it)

Outcast, if your mod boils, cooks, sterilizes or does anything that needs a hot item, this page will save you a confusing evening. We found it while designing a mod that boils water to disinfect bandages. In single player everything works. In multiplayer, the same steps can play out perfectly on screen and produce nothing.

:::callout[The 1-minute version]{kind=key}
- In multiplayer the server's copy of a pot is the real one. The loop that updates an item's heat runs every frame in single player, about every 5 seconds on a server, and not at all on a multiplayer client for items in containers.
- A fluid container rises toward a hotter container only if it is tagged `base:cookable` (or `base:cookablemicrowave` in a microwave), and never above 3.0. An untagged one still warms back up to 1.0. It cools back toward the container's temperature, never below 0.2.
- "Hot" for vanilla's hot-water recipe means heat above 1.6. A stove on a low knob does not get there.
- The server sends a pot's heat to clients from the heat code only while it is above 1.6. By the code, a client that last got a hot value is not sent the cooling. We have not watched this, and did not trace whether other events refresh it.
- A hot-water craft whose pot is cold on the server can still play its whole animation, make nothing, and report success. We have not yet watched this on a dedicated server.
- Keep the item inside the lit heat source while it is used, and decide on the server with the server's copy.
:::

:::facts
- **Item loop, server** one pass when more than 5000 ms have passed since the last, so about every 5 seconds
- **Item loop, single player** every frame; **multiplayer client** none for items in containers
- **Step size on the server** about 48 times the seconds since the item's last update, so about 240 for a 5-second gap
- **Hot** heat above 1.6; lowest 0.2; highest 3.0
- **Craft reach** world containers within 2.5 tiles of the player
:::

## 1. Who simulates heat

The item loop updates the heat of a pot, and it runs every frame in single player, about every 5 seconds on a multiplayer server, and not for container items on a multiplayer client.

The world update runs the loop when the game is neither client nor server, or on a server once more than 5000 ms have passed since the last pass. :cite[(`IsoCell.java:4024-4029`, `IsoCell.java:2179-2187`)] The call that adds an item to the loop does nothing on a client. :cite[(`IsoCell.java:2301-2308`)]

```java
// IsoCell.java:2301-2308
public void addToProcessItems(InventoryItem item) {
   if (item != null && !GameClient.client) {
      this.processItemsRemove.remove(item);
      if (!this.processItems.contains(item)) {
         this.processItems.add(item);
```

So in multiplayer the server's copy of a pot is the real one. A client's copy of the pot's heat changes only when the server sends it.

Items a character carries that update themselves, such as weapons, are a separate path. A weapon implements the update interface, and the character's update calls those items' `update()` itself. :cite[(`HandWeapon.java:54`, `IsoGameCharacter.java:9288`, `IsoGameCharacter.java:9384-9395`)] A saucepan is a weapon item, so it updates on a client too. A cooking pot is a plain `base:normal` item, which the engine builds as a `ComboItem`, and that class does not implement the interface. :cite[(`media/scripts/generated/items/normal.txt:4008-4011`, `media/scripts/generated/items/weapon.txt:4687-4691`, `Item.java:1735-1736`, `ComboItem.java:15`)]

## 2. How an item heats and cools

A fluid container's heat moves toward the temperature of the outermost container it sits in, and the steps are large on a server.

Only items with a fluid container component run this heat code. :cite[(`InventoryItem.java:1450-1452`)] The outermost container is found by walking up through the bags, so a pot in a bag in a stove counts as in the stove, up to 16 levels. :cite[(`InventoryItem.java:2263-2281`)]

- It **rises** only if the item is tagged `base:cookable` (or `base:cookablemicrowave` in a microwave), and never above 3.0. :cite[(`InventoryItem.java:1470-1475`, `ItemTag.java:89-90`)] An item colder than a container at 1.0 also warms back toward 1.0 without the tag. :cite[(`InventoryItem.java:1455-1461`)]
- It **falls** back toward the container's temperature when the container is colder, but never below 0.2. :cite[(`InventoryItem.java:1463-1468`)]
- On the server the rates are far larger than in single player: the fall step is 0.06 against 0.001, and the rise step is the container temperature divided by 16 against 1000. :cite[(`InventoryItem.java:1455`, `InventoryItem.java:1472`)]

The server scales each step by the real time since that item's last update, at most 6 seconds, at about 48 per second. :cite[(`InventoryItem.java:1407-1412`, `GameTime.java:1002-1004`)] For a 5-second gap that is about 240. The heat therefore reaches the container's temperature at the next update after the pot is placed, and falls to its floor within an update after it comes out. That is arithmetic on the cited numbers, not something we watched.

Heat above 1.6 also changes what is inside: tainted water turns into clean water, and petrol is removed, which can start a fire when the item is not in a campfire. :cite[(`InventoryItem.java:1478-1499`)] The boiling side is on [drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling).

## 3. How hot each heat source gets

The container's temperature is 1.0 almost everywhere, including a player's inventory, and a few heat sources change it.

| Where the item is | Container temperature | Code |
|---|---|---|
| A powered stove or microwave that is on | `(stove temperature + 100) / 100`. The oven knob goes 0, 50, 100 ... 300, so a knob at 0 or 50 never passes 1.5, and 100 or more reaches 2.0 and up as the oven warms | `ItemContainer.java:2449-2454`, `IsoStove.java:436-438`, `media/lua/client/ISUI/Fireplace/ISOvenUI.lua:122-129` |
| A lit fireplace or a lit barbecue | 1.8 (1.0 when not lit) | `IsoFireplace.java:173-175`, `IsoBarbecue.java:283-285` |
| A built campfire | 1.9, or 1.7 when its fuel amount is 180 or less (set by the campfire code, as a custom temperature) | `media/lua/server/Camping/SCampfireGlobalObject.lua:216-228`, `ItemContainer.java:2449-2451` |
| A fridge or freezer that is powered | 0.2 | `ItemContainer.java:2452`, `ItemContainer.java:2465-2467` |
| A fridge or freezer on the day the power shuts off, before 13:00 | slides from 0.2 to 1.0 as the time of day runs from 7:00 to 13:00 | `ItemContainer.java:2459-2462`, `ItemContainer.java:2480-2487` |

An item on the floor or outside any container drifts toward 1.0 by 0.001 per step, on either side, because that branch does not check for a server. :cite[(`InventoryItem.java:1508-1522`, `InventoryItem.java:1366`)] World items whose heat is not 1.0 also keep being updated on a client.

The "is it hot" test the vanilla recipe uses is **heat above 1.6**. :cite[(`RecipeCodeOnTest.java:39-41`)] So a stove on a low knob boils nothing, and one on a higher knob needs to warm past 60 before its container reaches 1.6. The stove warms gradually toward the knob's temperature. :cite[(`IsoStove.java:123-132`)]

The stove's own current temperature is not part of its network sync: the sync writes the knob's maximum temperature, so the dial on a client is not proof of anything either. :cite[(`IsoStove.java:297-306`)]

## 4. The client can see a pot as hot after the server has cooled it

The server sends a hot item's state to clients only while the item's heat is above 1.6 and its fluid container is not empty, so a client can keep a stale hot value.

The `ItemStats` packet is sent from the heat block only inside the condition that the heat is above 1.6 and the container is not empty. :cite[(`InventoryItem.java:1478`, `InventoryItem.java:1500-1502`)] It carries the heat, and the client writes it onto its copy. :cite[(`ItemStatsPacket.java:179-184`, `ItemStatsPacket.java:551-571`, `ItemStatsPacket.java:582`)] Once the pot cools below 1.6 on the server, this send stops, and the client keeps the last value it got, which was hot. Other events, such as a wet item, send the stats again for their own reasons, and we did not trace whether those would also refresh the heat. :cite[(`InventoryItem.java:1421-1447`)]

So a client can show a pot at 2.9 while the server already has it at 1.0. A mod that checks `getItemHeat()` on the client and then asks the server to do something hot will be told "yes" by the client and "no" by the server.

## 5. A hot-water craft on a cold pot does nothing, and reports success

Vanilla's "Disinfect Bandage" needs hot water, and in multiplayer the server tests its own copy of the pot when it rebuilds the action.

The recipe's `OnTest` is `RecipeCodeOnTest.hotFluidContainer`. :cite[(`media/scripts/generated/recipes/recipes_medical.txt:82-89`)] The function returns true for any item that has no fluid container, and for a fluid container only when its heat is above 1.6, so what it rejects is a fluid container that is not hot. :cite[(`RecipeCodeOnTest.java:39-41`)] Each candidate input item goes through it before it is accepted. :cite[(`CraftRecipeData.java:2423-2444`, `CraftRecipeManager.java:781-789`, `CraftRecipe.java:1017-1035`)]

In multiplayer the craft action is rebuilt on the server, which pins the input items again and runs that test against **its** copy of the pot. If the server's pot is cold:

1. the server fails to pin the pot and only writes a debug log line; :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:71-88`, `NetTimedAction.java:100-111`, `BaseCraftingLogic.java:978-979`, `CraftRecipeData.java:2088-2108`)]
2. the action still runs its full time and animation on the client, which waits for the server's answer; :cite[(`LuaTimedActionNew.java:98-110`, `ActionManager.java:76-84`)]
3. on the server, `complete()` calls `performRecipe`, which does nothing when the recipe's perform step returns false, and `complete()` still returns true; :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:207-248`, `HandcraftLogic.java:146-152`, `CraftRecipeData.java:497-518`)]
4. on the client, the "on complete" callback fires as if it worked: `perform()` calls it on a client when the server's Done arrives, and a Reject reaches `stop()`, which calls it too. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:202-203`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:172-173`, `LuaTimedActionNew.java:98-110`)]

Nothing is consumed, nothing is made, and nothing tells the player why.

## 6. How to build around it

Keep the heat decision on the server, with the server's copy of the item, and keep the item in the heat source.

- **Keep the item inside the lit heat source while it is used.** A craft can use a pot that is still in an adjacent stove: the crafting logic is given a list of containers and takes inputs from them, and a `mode:keep` input is not consumed. Inside the stove, the server keeps it hot. :cite[(`BaseCraftingLogic.java:594`, `CraftRecipeData.java:1268-1272`)]
- **Ask the server, not the client.** If your logic depends on heat, decide on the server, with the server's copy of the item.
- **Never trust a timer.** "Wait 30 seconds and it will be hot" is wrong on a server that updates every 5 seconds and on a stove whose knob might be at 50.
- **Remember the 2.5-tile rule.** Every world container handed to a craft must be within 2.5 tiles of the player when the craft performs (a vehicle part's container is checked for access instead), or the recipe is not performed; hand the craft a short list. The same check also refuses a container that is a thumpable locked to the character. :cite[(`BaseCraftingLogic.java:791`)] :cite[(`BaseCraftingLogic.java:774-796`, `HandcraftLogic.java:146-148`)]

## 7. Two things vanilla already does, so you do not have to

Vanilla already washes dirty bandages and purifies tainted water for you.

- **"Wash > All Bandages"** appears when you right-click a water source that has water, from the same building as you. It washes every item in your main inventory that carries the `base:canbewashed` tag (vanilla gives it to the four dirty items: dirty bandage, dirty denim strips, dirty leather strips and dirty ripped sheets), and not the ones inside bags. :cite[(`ISWorldObjectContextMenuLogic.java:4386`, `ISWorldObjectContextMenuLogic.java:4690-4692`, `ISWorldObjectContextMenuLogic.java:4712-4724`, `ISWorldObjectContextMenuLogic.java:4897-4910`, `ItemContainer.java:1357-1369`, `ItemContainer.java:1783-1788`, `media/scripts/generated/items/normal.txt:8115`, `:10589`, `:10641`, `:10693`)] The menu label is "All Bandages". :cite[(`media/lua/shared/Translate/EN/ContextMenu.json:603-608`)]
- **Boiling purifies tainted water** on its own, in the item loop above. A pot of tainted water in a hot oven becomes clean water, a little at a time. :cite[(`InventoryItem.java:1478-1485`)]

:::callout[How we know]{kind=proof}
- **Code, 42.22.** Every claim above was read from the decompiled 42.22 engine and the vanilla scripts and Lua on 2026-11-21.
- **Not tested.** We have not reproduced the silent failure in section 5 on a dedicated server; it is the code path above, read end to end. We also have not watched a client keep a stale hot value (section 4), and the "jumps at the next update" timing in section 2 is arithmetic on the cited numbers.
- **Not traced.** Whether anything other than the heat send refreshes a client's heat for a pot, and which containers the client puts in a craft's list on a real server.
:::

## Where to go next

- [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)
- [Crafting from Lua: what the server does](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does)
