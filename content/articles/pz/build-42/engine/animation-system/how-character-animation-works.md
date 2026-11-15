---
id: build-42-how-character-animation-works
slug: how-character-animation-works
title: 'How character animation works'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: beginner
tags:
  - engine
  - animation
  - timed-actions
  - combat
  - multiplayer
excerpt: >-
  Why actions, swings and getting up take the time they do, when the animation and not a timer decides it, and what you see when the animation and the game disagree.
last_updated: '2026-11-14'
related_articles:
  - inside-the-animation-system
  - action-groups-and-states
  - animsets-nodes-and-transitions
  - animation-variables-and-events
  - skinned-models-and-clips
  - modding-animations
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#how-long-an-action-takes) | [server owners](#what-changes-on-a-server) | [modders](/pz/build-42/engine/animation-system/inside-the-animation-system)

:::callout[The 1-minute version]{kind=key}
- A timed action, such as bandaging or reloading, lasts as long as its own timer says. The clip it plays does not set that length. A longer action can come from a moodle, hand pain or body temperature.
- In the player's attack state and the one melee node we read, a swing connects at a named moment in its attack clip, and the check runs in the attacker's own game. A faster or slower clip therefore moves when that swing lands.
- Some things last as long as their clip does. Getting up from the ground is one: its state leaves when the clip is about to finish.
- If a character has a state but the animation data has no matching state, nothing plays for it. The game logs a trace line and does not stop. What you see on screen in that case was not checked.
- Other players see your action's animation because your game sends the variables of the action with it. A variable a mod sets some other way does not reach them, unless it is on a sync list.
- On a server, files that change animation are checked against the server's copy, and a client with different animation XML is flagged, and when the `AntiCheatChecksum` server option is not off, it times out after 60 seconds. A server ignores a request to set an animation variable on a zombie.
:::

:::facts
- **What ends a timed action** its own timer, `maxTime`, and not the clip :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:181-183`)]
- **Longer actions** each level of the unhappy moodle, and of the drunk moodle, adds one quarter to a multiplier on the length; hand pain and body temperature also change it :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-122`)]
- **Default for a clip** it repeats, unless its node says `false` :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:115-118`)]
- **Server checksum wait** 60 seconds before a mismatched client is timed out, when the `AntiCheatChecksum` server option is not off (4) :cite[(`zombie/iso/IsoWorld.java:316`, `zombie/network/anticheats/AntiCheatChecksumUpdate.java:12-24`, `zombie/network/anticheats/AntiCheat.java:78-80`, `zombie/network/ServerOptions.java:212`)]
:::

## How long an action takes

An action ends when its own timer runs out, and the animation that plays during it is a separate thing.

The timer is the action's `maxTime`, which counts up by the game's time multiplier on every update. The action is finished when the count reaches `maxTime`, and the clip's length plays no part in that. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:113-114`, `zombie/characters/CharacterTimedActions/BaseAction.java:181-183`)] A clip that is shorter than the action repeats if its node is looped, and the engine's default for a node is looped. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:115-118`)]

The base action code lengthens a timed action when your character is in a poor state. Each level of the unhappy moodle and of the drunk moodle adds one quarter to a multiplier on the length, wounded hands add to it by the amount of pain in the arms and hands, and body temperature scales it. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-122`)] The base action applies this when the action is created, and only to a length above 1. Whether every vanilla action goes through it was not checked. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:78-81`)]

In multiplayer, the length on your screen can come from the server. For an action that the server handles, a length left at -1 is replaced by the duration the server accepts, and the action stops if the server rejects it. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:102-118`)]

### What starts the animation

An action plays its animation by naming a node, and the animation system finds that node by a variable.

The action sets the variable `PerformingAction` to the node's name and sets `IsPerformingAnAction` to true. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:276-286`)] The AnimSet files for the character then pick the node whose condition matches that name, and the node plays its clip. :cite[(`media/AnimSets/player/actions/ApplyAlcohol.xml:1-29`)] When the action ends, the variables it set are cleared, unless the action is set to loop. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:189-193`, `zombie/characters/CharacterTimedActions/BaseAction.java:223-238`)]

A running player cannot hold the action state as a sub state, because the running state does not list it among the states it can contain. :cite[(`media/actiongroups/player/run/childTags.xml:1-8`)] The base action sets `stopOnWalk` and `stopOnRun` to true, so an action that keeps those defaults is meant to stop when you walk or run. We did not trace the code that stops it, or which actions change the defaults. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:38-40`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:173-184`)]

## When the animation decides

Some things in the game wait for an animation event, and they last as long as the clip lasts.

The action state machine moves a character from state to state by transitions, and a transition can wait for an event that the animation raises. :cite[(`zombie/characters/action/conditions/EventOccurred.java:23-26`)] The event `ActiveAnimFinishing` is raised as a clip is about to finish, and it is the one the shipped transitions wait for most, with 146 uses. :cite[(`zombie/core/skinnedmodel/advancedanimation/events/LocalAnimEvent.java:12-17`, `media/actiongroups/player/getup/to_idle.xml:1-7`)] Getting up from the ground is one: its state goes to the idle state when that event occurs. :cite[(`media/actiongroups/player/getup/to_idle.xml:1-7`)]

### Why a swing lands when it does

The clip for a melee attack carries a named moment at which the hit is checked, and the attack state reacts to it.

The attack state for a player listens for the event `AttackCollisionCheck`, and when it arrives and the player is the local player of that game, it runs the hit check. :cite[(`zombie/ai/states/SwipeStatePlayer.java:89`, `zombie/ai/states/SwipeStatePlayer.java:284-301`)] The one-handed default melee node puts that event at 0.25 of its clip, and the name appears 39 times in the event lists of the shipped nodes. :cite[(`media/AnimSets/player/melee/1handed/1HDefault.xml:52-56`)] A clip that is faster or slower therefore moves the moment of the hit. 

The attack state also reacts to a `BlockMovement` event by setting the variable `SlowingMovement`, but only when the sandbox option `AttackBlockMovements` is enabled, which is its default. We did not trace what reads that variable. :cite[(`zombie/ai/states/SwipeStatePlayer.java:312-316`, `zombie/SandboxOptions.java:175`)]

### What else an event can do

Other events have a name that a Java state or a timed action receives, and what happens at that moment is the receiver's choice.

An event reaches the character, the action context and the Java AI state, and a player's event also reaches the action at the front of the queue. :cite[(`zombie/characters/IsoGameCharacter.java:4183-4196`, `zombie/characters/IsoPlayer.java:8080-8086`)] A footstep and a voice line are done that way. The event list and the receivers are on [Animation variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events).

## When the animation and the game disagree

The game state and the animation are two systems that are linked by names, and a name that does not match gives a gap with a few known shapes.

- **A state with no animation.** A state name that has no folder in the AnimSet gets an empty animation state, and the engine logs a trace line only. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:41-49`)] In the shipped data the player action group has three such states and the zombie group has seven, and the list is on [Animation reference](/pz/build-42/engine/animation-system/animation-reference#action-groups-and-animsets-by-name). We did not check what a character looks like in those states.
- **A clip that is not in the game.** When a node asks for a clip name that is not in the skeleton's clip map, the engine logs "Anim Clip not found" and plays nothing. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:423-431`)] A mod whose clip file is missing, or whose clip name does not match its node, can cause this. The checksum covers only XML files, so a missing clip file is not reported as a mismatch. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:745-770`)]
- **A character that is not drawn.** A character with no active model still runs the action state machine and the animator, and its animation player updates the movement and angles that the clips carry, with the bone poses switched off. :cite[(`zombie/characters/IsoGameCharacter.java:10958-10984`, `zombie/characters/IsoGameCharacter.java:11033-11048`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:519-537`)]
- **A variable that others do not get.** A variable that a mod sets on its own player in a plain way stays on that player's game, so another player's game does not see it. :cite[(`zombie/characters/IsoGameCharacter.java:12505-12560`)]

## What other players see

Another player sees your action because your game sends a state message that carries the action's variables.

When your player enters the action state, your game packs every variable the action set through its own `setAnimVariable`, including `PerformingAction`, into the state packet. The server relays it to nearby players, and each of their games builds a plain copy of the action with those variables and starts it. :cite[(`zombie/ai/states/PlayerActionsState.java:98-159`, `zombie/network/packets/actions/StatePacket.java:140-212`)] That copy is why an animation can play for them without your timed action's own code running there. A function that a mod writes to react to an animation event runs only in the game that runs the real timed action, and not for the copy. :cite[(`zombie/ai/states/PlayerActionsState.java:133-146`, `zombie/characters/CharacterTimedActions/BaseAction.java:325-326`)]

The packet is built at the moment the action starts, so a variable set later may not be in it. We did not check whether a later packet carries it. :cite[(`zombie/network/packets/actions/StatePacket.java:68-85`, `zombie/characters/CharacterTimedActions/BaseAction.java:276-286`)]

## What changes on a server

A server runs the same animation system, and it adds two checks and one rule that matter to an owner.

The server runs the animator for characters, because the animation update in a character's post update runs when the game is a server. :cite[(`zombie/characters/IsoGameCharacter.java:10948`)] It ignores a request to set an animation variable on a zombie. :cite[(`zombie/characters/IsoGameCharacter.java:12505-12508`)] A Lua script on a server that sets such a variable therefore has no effect.

The server checks the animation XML. A client sends a checksum of every `.xml` file under `AnimSets` and `actiongroups` of the base game and of every mod, and the server compares it with its own. On a mismatch the server logs that the user will be kicked.

The timeout applies only when the `AntiCheatChecksum` server option is not set to 4 (off), and the default is 2. When it applies, the connection times out after 60 seconds. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:745-860`, `zombie/network/packets/service/ChecksumPacket.java:233-270`, `zombie/network/anticheats/AntiCheatChecksumUpdate.java:12-24`, `zombie/network/anticheats/AntiCheat.java:78-80`, `zombie/network/ServerOptions.java:212`)] The check is skipped when the server's `DoLuaChecksum` option is off, or for a role that has the bypass capability. :cite[(`zombie/network/ServerOptions.java:75`, `zombie/network/packets/connection/LoginPacket.java:173-175`)]

> **Warning:** The server code we read applies an animation variable that a client sends, and relays it, without checking the name or the value against a list. We did not check how strictly the packet's player is tied to the sending connection. Do not base a rule, such as who may do an action, on an animation variable. :cite[(`zombie/network/packets/VariableSyncPacket.java:108-122`)]

A local link to a mod folder that is also a Steam subscription can stop a client from joining, because the checksum code fails to find a file it listed. The join then fails after the handshake, and it shows only in multiplayer. The fix our project notes record is to remove the local link so one copy of the mod loads. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:792-806`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:831-841`)]

## Where to read more

The other pages go from this overview to the files themselves.

- [Inside the animation system](/pz/build-42/engine/animation-system/inside-the-animation-system) is the whole chain in one page.
- [Action groups and states](/pz/build-42/engine/animation-system/action-groups-and-states) covers the `actiongroups` files.
- [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions) covers the `AnimSets` files.
- [Animation variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events) covers the variables and events.
- [Skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips) covers skeletons and clip files.
- [Modding animations](/pz/build-42/engine/animation-system/modding-animations) is a step-by-step how-to.
- [Animation reference](/pz/build-42/engine/animation-system/animation-reference) holds the tables.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java, the vanilla Lua and the shipped XML, and nothing was run in a game. Not verified: what a character looks like in a state that has no animation folder, whether every vanilla action uses the shared length rules, what reads the `SlowingMovement` variable, whether a later state packet carries a variable set after an action starts, how strictly a synced variable's player is tied to the connection, and the local-link fix beyond a project note that records a join working on 2026-08-15. The attack-event claim was read in the player's attack state and one melee node, and was not checked for every weapon type.
:::
