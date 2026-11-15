---
id: build-42-animation-variables-and-events
slug: animation-variables-and-events
title: 'Animation variables and events'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - variables
  - events
  - lua
  - multiplayer
  - modding
excerpt: >-
  Build 42.22 animation variables (slot types, callback variables, setting and reading from Lua) and animation events (XML tags, when they fire, and how the character, a timed action and Lua receive them).
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - inside-the-animation-system
  - action-groups-and-states
  - animsets-nodes-and-transitions
  - modding-animations
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#animation-variables) | [server owners](#variables-events-and-multiplayer) | new players should start at [How character animation works](/pz/build-42/engine/animation-system/how-character-animation-works)

:::callout[The 1-minute version]{kind=key}
- A variable is a named value on a character. Action transitions and AnimSet node conditions read variables, and that is how the game state reaches the animation.
- Names ignore case. A variable made in Lua is a plain text, number or boolean slot, and a variable the engine registers can instead call Java code to read or write its value.
- From Lua, `setVariable` and `getVariableString`, `getVariableBoolean` and `getVariableFloat` work on a character. In a timed action, `setAnimVariable` also clears the variable when the action ends.
- An event is a tagged moment in a node: at a percentage of the clip, at its start, or at its end. It reaches the character's Java listeners, the action context, the Java AI state and, for a player, the running timed action's `animEvent` function.
- Two event names are special: `SetVariable` and `FlagWhileAlive` change a variable for you.
- On a server, setting a variable on a zombie is ignored. A player's variable reaches other players only when it is on a sync list, or when a timed action sets it with `setAnimVariable`.
:::

:::facts
- **Slot kinds** string, float, boolean and enum, plus callback forms of each, and an integer callback form :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableType.java:10-15`, `zombie/core/skinnedmodel/advancedanimation/IAnimationVariableCallbackMap.java:14-60`)]
- **Event times** percentage (the default), start and end :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:68-75`)]
- **Text read as true** `true` in any case, `1` and `1.0`; anything else reads as false :cite[(`zombie/util/StringUtils.java:89-96`)]
- **Built-in local events** `ActiveAnimLooped`, `NonLoopedAnimFadeOut`, `ActiveAnimFinishing`, `ActiveAnimFinished`, `NoAnimConditionsPass` :cite[(`zombie/core/skinnedmodel/advancedanimation/events/LocalAnimEvent.java:12-17`)]
:::

## Animation variables

A variable is a named slot on a character that animation conditions and Lua can both read.

The slot kinds differ in how they store a value and how they convert it. A string slot keeps text and reads it as a number or boolean when asked. A float slot keeps a number, and a boolean slot keeps true or false. An enum slot keeps an enum value. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotString.java:21-67`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotFloat.java:20-66`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotBool.java:20-66`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotEnum.java:14-29`)]

| Conversion | Text slot | Float slot | Boolean slot | Code |
|---|---|---|---|---|
| Read as a number | Parsed, 0 if it is not a number. | The value. | 1 or 0. | `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotString.java:26-34`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotFloat.java:25-33`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotBool.java:25-32` |
| Read as a boolean | `true`, `1` or `1.0` is true. | Any value other than 0 is true. | The value. | `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotString.java:36-39`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotFloat.java:35-38` |
| Set from text | Stored as given. | Parsed, 0 if it is not a number. | `true`, `1` or `1.0` is true. | `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotString.java:41-46`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotFloat.java:40-45`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotBool.java:41-45` |

Because a boolean set from text accepts only those three spellings, the word `yes` sets a boolean slot to false. The action-group conditions are looser: `isTrue` compares against a parsed value in which `yes` counts as true. :cite[(`zombie/util/StringUtils.java:89-96`, `zombie/characters/action/conditions/CharacterVariableCondition.java:72-76`)]

### Names and where they are looked up

Variable names ignore case and are trimmed, and a blank name is not a variable.

Every name gets one shared handle, found without regard to case, and each source keeps its slots in an array indexed by that handle. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableHandlePool.java:23-59`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSource.java:18-32`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSource.java:95-115`)]

A character looks a variable up in two places. It checks the variables of its active action states first, from the last sub state back to the root, and then its own variables. :cite[(`zombie/characters/IsoGameCharacter.java:12485-12494`, `zombie/characters/action/ActionStateContainer.java:401-412`)] A name written as `$GrappledTarget.name` or `$GrappledBy.name` reads the variable from the character being grappled, or from the grappler. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableReference.java:38-58`, `zombie/characters/IsoGameCharacter.java:12613-12620`)]

If a variable does not exist, a read returns an empty text, false, or the default you pass. :cite[(`zombie/core/skinnedmodel/advancedanimation/IAnimationVariableSource.java:18-36`)] A condition on a missing variable follows its own rules, which are on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions) and [Action groups and states](/pz/build-42/engine/animation-system/action-groups-and-states).

### Callback variables

A callback variable has no stored value: it runs Java code each time it is read, and can run more code when it is written.

The engine registers many of these for a character, with a name, a getter, an optional setter and a description. :cite[(`zombie/core/skinnedmodel/advancedanimation/IAnimationVariableCallbackMap.java:14-60`, `zombie/characters/IsoGameCharacter.java:863-870`)] The slot is read-only when it has no setter. Writing to a read-only variable logs "Trying to set read-only variable" and changes nothing. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableSlotCallback.java:36-49`)]

For example, `isRendered` has both a getter and a setter, while `isMoving` for a player has only a getter. :cite[(`zombie/characters/IsoGameCharacter.java:863-870`, `zombie/characters/IsoPlayer.java:718`)] A later `setVariable` call on a name that already has a callback slot goes to that slot's setter, so Lua can write `isRunning` and the engine's own state changes with it. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableSource.java:117-122`, `zombie/characters/IsoPlayer.java:719-720`)]

The classes that register callback variables are `IsoGameCharacter`, `IsoPlayer`, `IsoZombie`, `IsoAnimal`, `IsoLivingCharacter` and `FallDamage`. :cite[(`zombie/characters/IsoGameCharacter.java:863`, `zombie/characters/IsoPlayer.java:702`, `zombie/characters/IsoZombie.java:786`, `zombie/characters/animals/IsoAnimal.java:344`, `zombie/characters/IsoLivingCharacter.java:34`, `zombie/characters/FallDamage.java:15`)] There is no list of variable names that the engine reads from a file. `Master_Variables.xml` in `media/AnimSets` is not read by any engine or Lua source we searched. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:166-176`)]

### Setting and reading from Lua

The calls below work on a character object, and the index of the Lua API lists each as callable from Lua.

| Call | What it does | Code |
|---|---|---|
| `setVariable(name, value)` | Sets a text, boolean or number variable. A new name creates a plain slot of that kind. | `zombie/characters/IsoGameCharacter.java:12505-12560` |
| `getVariableString(name)` | Reads as text, or an empty text when missing. | `zombie/core/skinnedmodel/advancedanimation/IAnimationVariableSource.java:18-21` |
| `getVariableBoolean(name)` | Reads as a boolean, false when missing. A second argument gives the default. | `zombie/core/skinnedmodel/advancedanimation/IAnimationVariableSource.java:28-36` |
| `getVariableFloat(name, default)` | Reads as a number, or the default when missing. | `zombie/core/skinnedmodel/advancedanimation/IAnimationVariableSource.java:23-26` |
| `clearVariable(name)` | Resets the slot to its empty value: empty text, 0 or false. | `zombie/characters/IsoGameCharacter.java:12567-12570`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableSource.java:152-158` |
| `GetVariable`, `SetVariable`, `ClearVariable` | Capitalized forms of the text versions, kept for older code. | `zombie/characters/IsoGameCharacter.java:12675-12687` |
| `getGameVariables()` | Lists every variable slot the character has, which is the way to find variable names in a running game. | `zombie/characters/IsoGameCharacter.java:12437-12480` |

In vanilla, the reload action calls `character:setVariable("ReloadSpeed", baseReloadSpeed)` with a number. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:113`)] A timed action sets its own variables with `self:setAnimVariable(key, value)`, which remembers the name so the action can clear it at the end. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:149-151`, `zombie/characters/CharacterTimedActions/BaseAction.java:240-254`, `zombie/characters/CharacterTimedActions/BaseAction.java:223-238`)] A boolean given to `setAnimVariable` is stored as the text `true` or `false`. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:248-254`)]

### Variables you meet first

A few variables carry most of what an action animation needs, and each has a clear owner.

| Variable | Set by | Used for | Code |
|---|---|---|---|
| `PerformingAction` | `setActionAnim` | The node name a timed action wants, tested in the `actions` state's nodes. | `zombie/characters/CharacterTimedActions/BaseAction.java:276-278` |
| `IsPerformingAnAction` | `setActionAnim`, and cleared when the action stops | The `idle` to `actions` transition and its `transitionOut`. | `zombie/characters/CharacterTimedActions/BaseAction.java:277-286`, `zombie/characters/IsoPlayer.java:749` |
| `TimedActionType` | `StartTimedActionAnim` | A sub type for a timed action. | `zombie/characters/IsoGameCharacter.java:12973-12981` |
| `isMoving`, `isRunning` | The engine | Movement state changes for a player. | `zombie/characters/IsoPlayer.java:718-720` |
| `Weapon` | The engine, or a timed action | The weapon type that nodes test. | `zombie/characters/CharacterTimedActions/BaseAction.java:315-323` |
| `AnimLocked` | Any code | While true, a layer stops choosing nodes. | `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:648-672`, `zombie/core/skinnedmodel/advancedanimation/AnimationVariableHandles.java:12` |

## Animation events

An event is a named moment in a node, and it is delivered to the character, the action context, the AI state and the timed action.

Each node lists its events in `m_Events` elements. An event has a name, a time and an optional parameter. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:19-47`)]

| Element | Meaning | Code |
|---|---|---|
| `m_EventName` | The event's name. An event with a blank name is ignored by the character. | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:20-23`, `zombie/characters/IsoGameCharacter.java:4183-4185` |
| `m_Time` | `Percentage` (the default), `Start` or `End`. | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:24-27`, `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:68-75` |
| `m_TimePc` | For a `Percentage` event, a fraction of the clip from 0 to 1. | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:28-31` |
| `m_ParameterValue` | A text value passed to whoever receives the event. | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:32-35` |

Events are sorted by `m_TimePc` when the node loads. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:244`)]

### When an event fires

The time kind decides what fires the event.

- A `Percentage` event fires when the node's clip time passes that fraction, including across a loop. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:356-390`)]
- A `Start` event fires when a clip track of the node starts. :cite[(`zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:516-519`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:563-580`)]
- An `End` event fires when a looped clip wraps and the node is not leaving, when a non-looped clip finishes, and when an early transition out begins. :cite[(`zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:521-543`)]

We did not check how a node with several tracks, such as a 2D blend, counts these start and end moments. Check the log of a test run before you rely on a `Start` or `End` event in such a node.

Besides the events a node lists, the layer raises five of its own: `ActiveAnimLooped`, `NonLoopedAnimFadeOut`, `ActiveAnimFinishing`, `ActiveAnimFinished` and `NoAnimConditionsPass`. The character can also raise two global events, `Turn180Started` and `Turn180TargetChanged`. :cite[(`zombie/core/skinnedmodel/advancedanimation/events/LocalAnimEvent.java:12-17`, `zombie/core/skinnedmodel/advancedanimation/events/GlobalAnimEvent.java:12-21`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:146-176`, `zombie/characters/IsoGameCharacter.java:11169-11185`)] Action transitions wait for events like these with `eventOccurred`, for example `ActiveAnimFinishing` in the `getup` state. :cite[(`media/actiongroups/player/getup/to_idle.xml:1-7`)]

### Events that change a variable

Two event names are handled by the engine itself and take their parameter as a variable name.

`SetVariable` takes `name=value` and sets that variable to the text value, or to empty text when the parameter has no `=`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimEventSetVariable.java:18-28`, `zombie/characters/IsoGameCharacter.java:4204-4207`)] `ClearVariable` takes a variable name and clears it. :cite[(`zombie/characters/IsoGameCharacter.java:4209-4212`)]

`FlagWhileAlive` takes `name=true` or `name=false`, or just a name, which means true. The variable is set to that value when the event fires, and set back to the opposite when the node finishes, starts to leave early or is released. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimEventFlagWhileAlive.java:18-28`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:198-222`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:528-543`)] The animator counts how many live nodes hold the flag, so the variable stays at the flag value until the last of them is done. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:727-737`)]

### Who receives an event

A fired event goes through the animator to the character, and the character passes it on to four kinds of listener.

The path is the same for every event. The layer hands it to the animator, the animator to each registered callback, and the character's `OnAnimEvent` does the rest. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:198-212`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:271-280`, `zombie/characters/IsoGameCharacter.java:4183-4196`)]

| Listener | How it hears the event | Code |
|---|---|---|
| Java listeners on the character | Registered by event name, matched without regard to case. | `zombie/core/skinnedmodel/advancedanimation/events/AnimEventBroadcaster.java:14-15`, `zombie/core/skinnedmodel/advancedanimation/events/AnimEventBroadcaster.java:76-90`, `zombie/characters/IsoGameCharacter.java:1163-1179` |
| The action context | The name is stored with the layer's state name, for `eventOccurred` conditions. | `zombie/characters/IsoGameCharacter.java:4190-4193`, `zombie/characters/action/ActionContext.java:238-243` |
| The Java AI state | A state listens by name, in the same way as the character does. The root layer's events go to the current state and a sub layer's events go to every sub state. | `zombie/ai/StateMachine.java:241-257`, `zombie/ai/State.java:62-63` |
| The timed action (players) | The first queued action's Lua `animEvent(event, parameter)` is called. | `zombie/characters/IsoPlayer.java:8080-8086`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:226-232` |

A Java listener can ask for the parameter as text, a boolean, a number or an enum. The engine converts the `m_ParameterValue` text for it, with 0 for a number it cannot parse. :cite[(`zombie/core/skinnedmodel/advancedanimation/events/AnimEventListenerWrapperBoolean.java:22-25`, `zombie/core/skinnedmodel/advancedanimation/events/AnimEventListenerWrapperFloat.java:22-25`, `zombie/core/skinnedmodel/advancedanimation/events/AnimEventListenerWrapperEnum.java:26-29`, `zombie/core/skinnedmodel/advancedanimation/events/AnimEventListenerWrapperString.java:22-24`)]

The character itself listens for `SetVariable`, `ClearVariable`, `PlaySound`, `PlaySoundNoBlend`, `Footstep`, `DamageWhileInTrees`, `TurnAround`, `TurnAround_FlipSkeleton`, `SetSharedGrappleType`, `GrapplerLetGo`, `FallOnFront`, `SetOnFloor`, `SetKnockedDown`, `IsAlmostUp` and `KilledByAttacker`. :cite[(`zombie/characters/IsoGameCharacter.java:1163-1179`)] Many more names are handled in the Java states for combat, climbing, dragging and emotes. An event that nothing listens for is still stored in the action context and is otherwise ignored. :cite[(`zombie/characters/IsoGameCharacter.java:4183-4196`)]

### Receiving an event in a timed action

A timed action receives events by defining an `animEvent` function, with the event name and its parameter as arguments.

```lua
function ISMyAction:animEvent(event, parameter)
    if event == 'myEventName' then
        -- do the work that belongs at this moment of the clip
    end
end
```

Vanilla `ISDetachItemHotbar` does exactly this for the event `detachConnect`. :cite[(`media/lua/client/TimedActions/ISDetachItemHotbar.lua:46-54`)] The node of the action lists that event in its `m_Events`, with a time, and the function runs when the event fires and the action is at the front of the character's queue. :cite[(`zombie/characters/IsoPlayer.java:8080-8086`)]

Many vanilla timed actions define `animEvent`, for example the one that attaches an item to the hotbar and the one that pets an animal. :cite[(`media/lua/shared/TimedActions/ISAttachItemHotbar.lua:82-98`, `media/lua/shared/TimedActions/Animals/ISPetAnimal.lua:86`)]

## Variables, events and multiplayer

On a server, animation variables and events follow different rules from single player, and a few of them are not checked.

A server ignores `setVariable` for a zombie. :cite[(`zombie/characters/IsoGameCharacter.java:12505-12508`)] For a player, a variable set on the player's own client is sent to the server only when its name is on a sync list. The list is filled by the Lua call `addVariableToSyncList(name)`, and the server also adds a name to its own list when a client sends it. :cite[(`zombie/characters/IsoGameCharacter.java:12505-12515`, `zombie/Lua/LuaManager.java:8939-8944`, `zombie/network/packets/VariableSyncPacket.java:108-112`)] The server relays the change to other clients near the player, and when it introduces a player to a client it sends that player's listed variables. :cite[(`zombie/network/packets/VariableSyncPacket.java:113-121`, `zombie/network/GameServer.java:2799-2804`)]

A timed action's variables travel another way. The action's own `setAnimVariable` names and values are packed into the state packet of the `actions` state, and the other player's client sets them again on a plain action object. :cite[(`zombie/ai/states/PlayerActionsState.java:98-125`, `zombie/ai/states/PlayerActionsState.java:133-152`)] That action object is a base action, and its `OnAnimEvent` does nothing, so a Lua `animEvent` function runs only where the real timed action runs. :cite[(`zombie/ai/states/PlayerActionsState.java:133-146`, `zombie/characters/CharacterTimedActions/BaseAction.java:325-326`)]

For a remote player's own events, the action state's Java listener still runs on each client for the few names it handles, such as `changeWeaponSprite` and `attachConnect`. :cite[(`zombie/ai/states/PlayerActionsState.java:65-95`)]

> **Warning:** The server code we read applies a variable sent by a client to the player named in the packet and relays it. It adds the name to the sync list without checking the name or value against a list of allowed ones, and we did not check how strictly the packet's player is tied to the sending connection. Server owners should treat a synced variable as client-controlled input and never base a rule on it. :cite[(`zombie/network/packets/VariableSyncPacket.java:108-122`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java, the vanilla Lua and the shipped XML. Nothing was run in a game. Not verified: how often `Start` and `End` events fire for a node with several tracks, whether Lua can register its own listener through the character's event broadcaster (the API index lists the call as callable, and we did not test it), what an enum variable does inside a state packet, and whether the server runs `animEvent` for a player's timed action (the vanilla attach action has a server branch, which suggests it can). The list of event names the character listens for comes from its registration calls only, so a name missing from it can still be handled by code that compares names directly.
:::
