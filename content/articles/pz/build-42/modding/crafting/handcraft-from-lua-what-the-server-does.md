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
  Starting a vanilla craft from your own Lua in Build 42.22: where its inputs may come from, how to pin an exact item, what runs on the client and the server, and why a refused craft is silent.
last_updated: '2026-11-16'
related_articles:
  - timed-actions
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - hot-items-in-multiplayer
  - fluids-in-multiplayer
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

Outcast, sooner or later a mod wants to press the craft button for the player: "wash all", "saw all", "boil and sterilize". Build 42 lets you drive the same `ISHandcraftAction` that vanilla uses, and in single player it feels easy. In multiplayer the server builds its own copy of the craft and re-checks it, and it tells the client very little when it says no. For the recipe script itself, see [the new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block), and for timed actions in general, see [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

**Who this page is for:** modders who start crafts from Lua, and anyone who runs those mods on a dedicated server (section 3 shows what runs where).

:::callout[The 1-minute version]{kind=key}
- A craft takes its candidate items from every container you pass in. Nothing in the engine checks that an input is in the player's inventory.
- When the craft performs, every world container in the list must be within 2.5 tiles of the player, or the craft is refused with no message to the player.
- Pin the exact item with `setRecipeFromContextClick` and `setManualInputsFor`, and check what the second one returns.
- A craft the server refuses still plays its whole animation, and the action's `complete` still returns true. Count success by what is in the inventory, never by a callback.
- A client-side stop wipes the player's whole action queue, and `ISHandcraftAction:stop` runs both the cancel and the complete callback.
- Never keep your own data in a field called `action`.
:::

:::facts
- **World container reach** 2.5 tiles, checked when the craft performs
- **Hand craft length** `time` x 5, which is about `time` / 9.6 seconds at normal speed
- **What `complete` returns** `true`, whether or not anything was made
- **Reason the server gives the client for a refusal** none
:::

## 1. Where a craft's inputs may come from

**A craft takes its candidate items from every item in every container you hand it, and it never asks whether they are in the player's inventory.**

The logic copies the items of each listed container into one list. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:281-289`, `zombie/entity/components/crafting/BaseCraftingLogic.java:594-600`)] So a craft can use a pot that is still inside a stove, or a log on the floor, as long as that container is in the list.

There are two limits. The first is a reach check that runs when the craft performs: the craft is refused when a container that is not part of a vehicle is more than 2.5 tiles from the player, when a vehicle container cannot be reached, or when a locked container is locked to the character. :cite[(`zombie/entity/components/crafting/BaseCraftingLogic.java:774-797`, `zombie/entity/components/crafting/recipe/HandcraftLogic.java:146-151`)] The refusal is written to the craft-logic log channel, and the player sees nothing. Hand each craft a short list of nearby containers.

The second limit is `CanBeDoneFromFloor`, which is a recipe tag that only vanilla's Lua reads. The crafting window moves the items to the player's inventory first unless the recipe has the tag. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISWidgetHandCraftControl.lua:342-350`)] No Java in the capture calls `isCanBeDoneFromFloor`, so an action you start yourself moves nothing. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1046-1048`)]

An input marked `mode:keep` is used and not moved: the craft does not reduce its uses. :cite[(`zombie/inventory/ItemUser.java:33-40`)] Only the outputs are handed to the player, and an output the player cannot carry is dropped on the floor at the player's feet. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:229-235`, `media/lua/shared/ActionManager.lua:4-22`)]

:::callout{kind=warn}
The container list and the pinned items are part of the request the client sends. Beyond the three reach checks above, this page did not verify what the server confirms about a container before it uses it. A server mod that needs to know who may craft from what has to check that itself.
:::

## 2. Pin the exact item, or the logic picks one for you

**Left to itself the logic fills each input with whatever matches first, which might be the canteen you did not mean.**

Two calls choose the item. `logic:setRecipeFromContextClick(recipe, item)` switches the logic to manual selection and offers that item to the recipe's inputs, the way a right-click on the item does. :cite[(`zombie/entity/components/crafting/recipe/HandcraftLogic.java:163-169`)]

`logic:setManualInputsFor(inputScript, list)` works only in manual mode. It clears that input, adds each listed item that is in a container or on the ground, is not already used and that the input accepts, and returns whether the input is now satisfied. :cite[(`zombie/entity/components/crafting/BaseCraftingLogic.java:978-980`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:2088-2108`)] False means your item was rejected, so check it.

## 3. What runs where

**The craft runs on the client and again on the server, and the steps are not the same on each side.**

`ISHandcraftAction` has a `complete` function, so in multiplayer the server builds its own copy by calling `ISHandcraftAction.new` with the arguments the client sent, and then calls `serverStart` on it. :cite[(`zombie/core/NetTimedAction.java:43-60`, `zombie/core/NetTimedAction.java:101-111`, `zombie/core/NetTimedAction.java:149-175`)]

| Step | Single player | Multiplayer client | Dedicated server | Code |
|---|---|---|---|---|
| Start | `start` rebuilds the logic from your pinned inputs, and when the recipe cannot be performed it calls `forceStop` | the same | `serverStart` rebuilds the logic and re-pins the inputs, and a failure is only written to the log | `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:71-120` |
| Length | `getTime(character)` x 5 | the same | the same function, then `adjustMaxTime` | `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:257-265`, `zombie/core/NetTimedAction.java:77-99` |
| The recipe is performed in | `perform` | not run | `complete` | `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:177-223` |
| Your complete callback fires in | `complete` | `perform`, after the base class | `complete` | `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:195-205`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:219-222` |
| `OnCreate` runs | after the outputs were added | not run | after the outputs were added | `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:229-238` |

The Lua `complete` runs where the game is not a multiplayer client. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:175-181`)] The recipe's length comes from `time`, which is not seconds. See [the block page](/pz/build-42/modding/crafting/the-new-craftrecipe-block) for the conversion.

The server rebuilds the action from the parameters of its `new` function. :cite[(`zombie/core/NetTimedAction.java:43-60`)] Only a field named like a parameter of `ISHandcraftAction:new` reaches the server, so a field you add to the table is not sent. The page on [timed actions over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network) covers the request, the answer and the timeout.

## 4. A server-side failure is silent

**If the server cannot pin an input or perform the recipe, nothing is consumed or made, but the action still ends as done.**

When the server cannot pin an input (a pot that is cold on the server, a vessel holding less than the recipe needs), `serverStart` writes one line to the craft-logic channel and continues. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:71-87`)] When the craft then performs, `performCurrentRecipe` returns false for an unreachable container or a recipe that no longer fits, and `performRecipe` then does nothing. :cite[(`zombie/entity/components/crafting/recipe/HandcraftLogic.java:146-151`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:225-253`)]

The action still plays its full animation, and `complete` still returns true, so your callback fires. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:207-223`)] The server runs `complete` and sends the client a Done state when it returns true, and a Reject state with no reason when it returns false. :cite[(`zombie/core/NetTimedAction.java:138-146`, `zombie/core/ActionManager.java:79-108`)] [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer) walks through the most common case.

So in a mod that queues many crafts, do not count success by callbacks. Count it by what is in the inventory afterward, and expect the outputs to arrive in a separate update from the callback, with no promised order between them. Whether the craft-logic line reaches a server log by default is not verified.

## 5. A client-side stop wipes the whole queue

**When a craft stops early on the client, the base class resets the player's whole action queue, and every craft you queued behind it is gone too.**

`forceStop`, a failed walk, an `isValid` that turns false, a character who is too dark to read, and a walking character all end the action early. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:5-21`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:408-415`)] The base class `stop` then resets the queue. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:63-66`)]

`ISHandcraftAction:stop` also calls both the cancel callback and the complete callback. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:158-175`)] A callback that you wrote to start the next craft therefore fires after a cancel too, so do not use the complete callback as proof that a craft finished. If you queue a long chain, check after each step that the queue is still yours.

Two stops are new in 42.22. A craft stops on its own when the character is too dark to read, unless the recipe has the tag `CanBeDoneInDark`. A walking character stops the craft, unless the recipe has the tag `CanBeDoneWhileWalking` (and the character has no awkward hands). :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:19-21`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:407-414`)]

## 6. Never name your own field `action`

**`ISBaseTimedAction` keeps its engine handle in `self.action`, and `create()` overwrites it one step before the action starts.**

```lua
function ISBaseTimedAction:create()
	self.maxTime = self:adjustMaxTime(self.maxTime);
	self.action = LuaTimedActionNew.new(self, self.character);
end
```

If your subclass stores its own data in `self.action`, the data is gone before the first tick and the queue drops the action. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:78-81`, `media/lua/client/TimedActions/ISTimedActionQueue.lua:121-126`)] `character` and `maxTime` are the base class's too. Name your fields something only your mod would use. The explanation is on [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

## 7. A purely client-side action

**An action with no `complete` is never sent to the server; it waits on the client only.**

A Lua timed action whose class has no `complete` skips the network sync. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:138-142`)] Give it `maxTime = -1`, make `isValid` return exactly `true` while it should continue, and finish it with `forceComplete()` or `forceStop()`. Vanilla's `ISStopVehicle` is an example. :cite[(`media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:5-41`)]

## 8. Where to go next

**These pages cover the timed-action and multiplayer sides of a craft in more depth.**

- [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
- [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer)
- [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)

:::callout[How we know]{kind=proof}
Every code line above was opened in the 42.22 capture, and nothing here was run in a game.

Not verified: what the server confirms about the containers and items a client sends beyond the three reach checks, whether the craft-logic log line reaches a server log by default, how the client behaves when the server rejects a craft, and the exact 42.22 effect of dropping a field named `action` (see [Timed actions](/pz/build-42/modding/lua-api/timed-actions)). 

A 42.20 test, not repeated at 42.22, saw a queue of ten crafts drop on its first tick after a mod stored its own data in `self.action`.

Corrected from the old page: the stop conditions changed in 42.22 (the `CanWalk` key no longer decides, the tag `CanBeDoneWhileWalking` does, and the dark check is new), `stop` now fires the complete callback as well as the cancel callback, and the reach check now also covers vehicle access and locked containers instead of exempting vehicle parts. The old page's "the server does not tell the client much when it says no" is now stated exactly: the server sends a Reject state with no reason, and a craft it refused inside `complete` is not rejected at all but reported as done. Dropped: the claim that `setManualInputsFor` runs the recipe's `OnTest` (the code read does not show that).
:::
