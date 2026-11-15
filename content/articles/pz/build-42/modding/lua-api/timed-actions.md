---
id: build-42-timed-actions
slug: timed-actions
title: Timed actions
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua-api
  - events
  - moddata
  - timed-actions
  - multiplayer
excerpt: >-
  How to write a "hold to do X" timed action in 42.22: the class, its fields and callbacks, the queue, where complete() runs in multiplayer, and the timedAction script block recipes point at.
last_updated: '2026-11-15'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-versioning-and-the-compatibility-model
  - lua-load-order-and-the-three-lua-folders
  - media-registries-lua-the-new-b42-identifier-file
  - the-events-system
  - key-globals-and-classes
  - moddata
  - multiplayer-command-patterns
  - ui-overview
  - b41-b42-breaking-changes
  - handcraft-from-lua-what-the-server-does
  - what-runs-on-the-server-in-build-42-multiplayer
  - the-new-craftrecipe-block
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders writing an action](#the-class-and-its-callbacks) | [modders who need it to work in multiplayer](#where-complete-runs-in-multiplayer) | [recipe authors](#the-timedaction-script-block)

:::callout[The 1-minute version]{kind=key}
- A timed action is a Lua class derived from `ISBaseTimedAction`, added to the player's `ISTimedActionQueue`, and the game runs its callbacks from Java.
- `isValid` must return the Boolean `true` to keep the action alive, and the base class's own `isValid` returns nothing, so an action that does not define it stops at once.
- When the class defines `complete`, the game syncs the action with the server, and `complete` runs only where the game is not a multiplayer client.
- A class without `complete` is never sent to the server and runs on the client only.
- The server rebuilds the action by the class's global name, so the class must be a global table.
- Do not keep your own data in a field named `action`: the base class overwrites it.
- Recipes point at a `timedAction` script block that sets the animation, hand items, sound and strain.
:::

:::facts
- **Default `maxTime`** -1 (never ends by time)
- **Default stop flags** `stopOnWalk`, `stopOnRun`, `stopOnAim` all true
- **Vanilla `timedAction` blocks** 119 in `timedactions.txt`
- **Sound start times** 3 values: `action_start`, `animation_event`, `animation_start`
:::

## The class and its callbacks

A timed action is a table derived from `ISBaseTimedAction`, and the game calls its functions by name while the action runs.

`derive` makes the new table and stores your type name in its `Type` field. :cite[(`media/lua/shared/ISBaseObject.lua:10-16`)] The base constructor `new(character)` sets the stop flags to true, `caloriesModifier` to 1 and `maxTime` to -1. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:173-184`)]

When the action begins, `create` makes a `LuaTimedActionNew` Java object and stores it in `self.action`. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:78-89`)] That object reads its settings from your table when it is built: `maxTime`, `stopOnWalk`, `stopOnRun`, `stopOnAim`, `caloriesModifier`, `useProgressBar`, `forceProgressBar`, `loopedAction` and `allowedWhileDraggingCorpses`. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:40-83`)]

The action's file goes in `media/lua/shared`, because the server finds the class by its global name and so must load the file. :cite[(`zombie/core/NetTimedAction.java:156-157`)] Vanilla's `ISHandcraftAction` is a global defined in a `shared` file for that reason. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:1-3`)]

A mod you can try has this layout, in a folder `MyTimedAction` inside the `mods` folder of your game's cache directory. :cite[(`zombie/ZomboidFileSystem.java:1403-1405`)]

```
MyTimedAction/
  common/
  42/
    mod.info
    media/lua/shared/TimedActions/MyMod_MyCustomTimedAction.lua
    media/lua/client/MyMod_Test.lua
```

`42/mod.info`:

```
name=My timed action
id=MyTimedAction
description=Press J to run a timed action.
```

`media/lua/shared/TimedActions/MyMod_MyCustomTimedAction.lua`:

```lua
require "TimedActions/ISBaseTimedAction"

MyMod_MyCustomTimedAction = ISBaseTimedAction:derive("MyMod_MyCustomTimedAction")

function MyMod_MyCustomTimedAction:isValid()
    return self.character:getInventory():contains(self.item)
end

function MyMod_MyCustomTimedAction:start()
    self:setActionAnim("Loot")
end

function MyMod_MyCustomTimedAction:update() end

function MyMod_MyCustomTimedAction:perform()
    self.character:Say("Timed action finished")
    ISBaseTimedAction.perform(self)
end

function MyMod_MyCustomTimedAction:complete()
    -- the world change goes here; return true when it was made
    return true
end

function MyMod_MyCustomTimedAction:new(character, item)
    local o = ISBaseTimedAction.new(self, character)
    o.item = item
    o.maxTime = 100
    return o
end
```

`media/lua/client/MyMod_Test.lua` queues the action for the item in the player's primary hand when you press J:

```lua
local function onKey(key)
    if key ~= Keyboard.KEY_J then return end
    local player = getPlayer()
    local item = player:getPrimaryHandItem()
    if item then
        ISTimedActionQueue.add(MyMod_MyCustomTimedAction:new(player, item))
    end
end
Events.OnKeyPressed.Add(onKey)
```

To run it, enable "My timed action" in the Mods screen when you start a game, hold an item in your primary hand and press J. You should see the loot animation, and the character says "Timed action finished" when it ends. On a dedicated server, add `MyTimedAction` to `Mods=` and the Workshop item's number to `WorkshopItems=`, separated by `;`.

Neither file was run in a game. Vanilla actions follow the same shape, for example `ISStopVehicle`, which defines `isValid`, `update`, `start`, `stop`, `perform` and `new`. :cite[(`media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:1-42`)]

The Java side calls these functions, each wrapped so an error is caught:

| Function | When the game calls it | Code |
|---|---|---|
| `isValid` | Every update of the current action, and the action stops when it does not return `true` | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:120-124`, `zombie/characters/IsoGameCharacter.java:9183-9190`)] |
| `waitToStart` | Before the action starts; returning false lets the game's own wait run | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:90-96`)] |
| `start` | When the action starts, after the time counter is set to 0 | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:132-137`)] |
| `update` | Each update while the action runs | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:98-101`)] |
| `perform` | When the time is up or `forceComplete` was called | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:165-169`, `zombie/characters/IsoGameCharacter.java:9192-9193`)] |
| `stop` | When the action ends by `forceStop` or an invalid state after it started | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:149-153`, `zombie/characters/IsoGameCharacter.java:9200-9202`)] |
| `complete` | After `perform`, only where the game is not a multiplayer client | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:175-181`, `zombie/characters/IsoGameCharacter.java:9192-9196`)] |
| `animEvent`, `getDeltaModifiers` | On animation events and when movement modifiers are computed | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:226-240`)] |
| `failedPathfind`, `succeededPathfind` | When a path request made for the action finishes | :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:184-199`)] |

The `isValid` row is the one that catches new authors. The Java side counts an action as valid only when the Lua function returns a Boolean `true`, and the empty `isValid` in `ISBaseTimedAction` returns nothing. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:120-124`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:12-14`)]

## The queue and how an action ends

Actions go into one queue for each character, the first one runs, and the next one starts when it finishes.

`ISTimedActionQueue.add` skips an action marked `ignoreAction`, skips a sleeping character, and refuses an action while the player drags a corpse unless the action sets `allowedWhileDraggingCorpses`. It starts the action at once when the queue was empty. :cite[(`media/lua/client/TimedActions/ISTimedActionQueue.lua:157-175`, `media/lua/client/TimedActions/ISTimedActionQueue.lua:9-19`)] An action added while another one is adding actions in its own `perform` is placed right behind it. :cite[(`media/lua/client/TimedActions/ISTimedActionQueue.lua:192-201`)]

The queue has more entry points: `addAfter`, `queueActions`, `clear`, `hasAction` and `hasActionType`. :cite[(`media/lua/client/TimedActions/ISTimedActionQueue.lua:203`, `media/lua/client/TimedActions/ISTimedActionQueue.lua:224`, `media/lua/client/TimedActions/ISTimedActionQueue.lua:236`, `media/lua/client/TimedActions/ISTimedActionQueue.lua:245`, `media/lua/client/TimedActions/ISTimedActionQueue.lua:252`)]

An action ends in one of three ways. The time counter reaches `maxTime`, and the game calls `perform`. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:181-183`)] Your code calls `forceComplete`, which also leads to `perform`. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:24-26`, `zombie/characters/IsoGameCharacter.java:9190-9193`)] Or your code calls `forceStop`, or `isValid` stops returning `true`, and the game calls `stop`. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:28-30`, `zombie/characters/IsoGameCharacter.java:9190-9202`)]

With `maxTime = -1` the time counter never finishes the action, so it runs until `forceComplete`, `forceStop` or an invalid state ends it. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:181-183`)] Vanilla's `ISStopVehicle` works this way. :cite[(`media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:10-17`, `media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:34-41`)]

For a `maxTime` above 1, `create` first scales it: the time grows with the Unhappy and Drunk moodle levels, with pain in the hands and arms unless `ignoreHandsWounds` is set, and with the character's timed-action time modifier. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:78-80`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-123`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:100`)]

Two traps decide whether the queue keeps your action. The first is that `perform` must call `ISBaseTimedAction.perform(self)`, because that call tells the queue the action is done and starts the next one. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:68-72`)] The second is that the queue clears itself with a warning "bugged action" when its first action is no longer in the character's action list. :cite[(`media/lua/client/TimedActions/ISTimedActionQueue.lua:115-126`)]

### Never name your own field `action`

`create` writes the Java object into `self.action`, so your own value in that field is lost when the action starts. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:78-81`)]

The queue then does not find your action in the character's action list, and it drops the action with the "bugged action" warning. :cite[(`media/lua/client/TimedActions/ISTimedActionQueue.lua:121-126`)] Give your own fields names that only your mod would use. `character` and `maxTime` belong to the base class too.

## Where complete runs in multiplayer

If your class defines `complete`, the game syncs the action with the server, and the code that changes the world belongs in `complete`.

The Java object checks for `complete` on the class when it is built. When the class has none, it turns the network sync off for that action. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`)] On a multiplayer client, the sync starts when the action starts, and the client then waits for the server's answer. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:138-142`)] The Lua `complete` runs only when the game is not a multiplayer client, so on the server or in single player. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:175-181`)] `perform` still runs on the client. :cite[(`zombie/characters/IsoGameCharacter.java:9192-9196`)]

An action with no `complete` is never sent to the server, so it runs on the client only. That is the right choice for a wait such as "stand here until the walk finishes", and vanilla's `ISStopVehicle` does it with `maxTime = -1`, an `isValid` that stays true while the wait should continue, and no `complete`. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`, `media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:5-8`, `media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:34-41`)]

The server builds its own copy of the action by calling `<Type>.new`, found by the global name of the class. :cite[(`zombie/core/NetTimedAction.java:149-168`)] So the class must be reachable as a global, and a class held only in a local variable cannot be found. Vanilla defines its classes as globals, for example `ISStopVehicle = ISBaseTimedAction:derive("ISStopVehicle")`. :cite[(`media/lua/client/Vehicles/TimedActions/ISStopVehicle.lua:3`)] For a name that cannot collide with another mod, prefix it, and put the class in a global under its type name:

```lua
local MyAction = ISBaseTimedAction:derive("MyMod_MyAction")
-- ... define isValid, start, update, perform, complete, new ...
_G[MyAction.Type] = MyAction
return MyAction
```

The server also fills the constructor's arguments by parameter name, so each parameter of `new` has to be saved on the action under the same name, as `item` is in the skeleton above. :cite[(`zombie/core/NetTimedAction.java:43-60`)] The full picture, including that the server does not call your `isValid`, is in [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network). More on what the server does with a crafting action is in [Crafting and timed actions from Lua: what the server really does](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does) and [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).

## The timedAction script block

A `timedAction` script block describes the animation, hand items, sound and strain of a crafting action, and a recipe selects one by name.

Vanilla keeps 119 of these blocks in `timedactions.txt`, inside `module Base`. :cite[(`media/scripts/generated/timedactions.txt:1-14`)] A recipe refers to one with `timedAction = <name>`, and the recipe fails to load with "TimedActionScript '<name>' could not be found" when no block has that name. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:487-488`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775`)] Vanilla's handcraft action then reads the block: it takes the animation, sets the metabolic target, applies muscle strain and plays the sounds. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:141-147`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:38-39`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:23-24`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:189-190`)]

The loader reads these keys from a block, and any other key is ignored. :cite[(`zombie/scripting/objects/TimedActionScript.java:111-149`)]

| Key | What it sets | Code |
|---|---|---|
| `metabolics` | The character's metabolic target while the action runs, one of the `Metabolics` names such as `SedentaryActivity` or `HeavyDomestic` | :cite[(`zombie/scripting/objects/TimedActionScript.java:111-112`, `zombie/characters/BodyDamage/Metabolics.java:13-31`)] |
| `time` | A duration number, -1 when not given | :cite[(`zombie/scripting/objects/TimedActionScript.java:113-114`)] |
| `faceObject`, `cantSit` | Booleans; the handcraft action turns to the object, and refuses a character who sits on the ground | :cite[(`zombie/scripting/objects/TimedActionScript.java:115-118`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:41-47`)] |
| `prop1`, `prop2` | The items shown in the primary and secondary hand | :cite[(`zombie/scripting/objects/TimedActionScript.java:119-122`)] |
| `actionAnim`, `animVarKey`, `animVarVal` | The animation and one animation variable to set | :cite[(`zombie/scripting/objects/TimedActionScript.java:123-128`)] |
| `sound`, `soundTime`, `completionSound` | A sound, when it starts, and a sound when the action completes | :cite[(`zombie/scripting/objects/TimedActionScript.java:129-134`)] |
| `muscleStrainFactor`, `muscleStrainSkill`, `muscleStrainParts` | Stiffness added to the listed body parts, reduced by the skill level | :cite[(`zombie/scripting/objects/TimedActionScript.java:135-149`, `zombie/scripting/objects/TimedActionScript.java:172-186`)] |

The three start times for a sound are `action_start`, `animation_event` and `animation_start`, and any other value makes `fromValue` throw an error. :cite[(`zombie/scripting/objects/ActionSoundTime.java:13-35`)]

A block looks like this one from vanilla. :cite[(`media/scripts/generated/timedactions.txt:486-495`)]

```
timedAction MakingHammer_Surface
{
    metabolics = HeavyDomestic,
    actionAnim = MakingHammer_Surface,
    prop1 = Base.Hammer,
    prop2 = Base.BaseballBat,
    muscleStrainFactor = 0.0133,
    muscleStrainSkill = Strength,
    muscleStrainParts = Hand_R;ForeArm_R;UpperArm_R,
}
```

For most mod recipes, reuse an existing block rather than write a new one.

Block names that recipes already use include `Making`, `MakingHammer_Surface`, `UseStoneQuern`, `TanLeatherBarrel`, `OpenBeerBottle`, `OpenChampagne`, `OpenPopCan`, `UncorkBottle` and `SawLogs`. :cite[(`media/scripts/generated/timedactions.txt:148`, `media/scripts/generated/timedactions.txt:486`, `media/scripts/generated/timedactions.txt:694`, `media/scripts/generated/timedactions.txt:560`, `media/scripts/generated/timedactions.txt:660`, `media/scripts/generated/timedactions.txt:183`, `media/scripts/generated/timedactions.txt:416`, `media/scripts/generated/timedactions.txt:385`, `media/scripts/generated/timedactions.txt:227`)] The block for sharpening a stake is `SharpenStakeBone` or `SharpenStakeWood`. :cite[(`media/scripts/generated/timedactions.txt:332`, `media/scripts/generated/timedactions.txt:345`)] To write a new block, add a `timedAction <name>` block in a script file of your mod and name it in the recipe. The recipe format is in [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla Lua and scripts. No game was run, and the skeleton and the new block were not loaded. The field-name collision (a queue of ten actions that stored data in `self.action` dropped on its first update, and renaming the field fixed it) is from an earlier game test on Build 42.20 that was not repeated for 42.22; the code reading above agrees with it. Not verified: how the `time` key of a block is used, whether `getTimedActionTimeModifier` is the body temperature step it appears to be, and what happens on a multiplayer client for a class whose `complete` is added after it is built.
:::
