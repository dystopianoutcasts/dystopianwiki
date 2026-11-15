---
id: build-42-inside-the-animation-system
slug: inside-the-animation-system
title: 'Inside the animation system'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - animsets
  - actiongroups
  - multiplayer
  - modding
excerpt: >-
  The whole Build 42.22 animation pipeline in one page: action states, the animator, AnimSet nodes picked by variables, the animation player, and how events and timed actions fit in.
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - action-groups-and-states
  - animsets-nodes-and-transitions
  - animation-variables-and-events
  - skinned-models-and-clips
  - modding-animations
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#the-parts) | [server owners](#which-side-runs-what) | new players should start at [How character animation works](/pz/build-42/engine/animation-system/how-character-animation-works)

:::callout[The 1-minute version]{kind=key}
- Two sets of XML files drive a character's animation. The `actiongroups` files choose a state name, and the `AnimSets` files turn that state name into clips.
- A character's action state and its AnimSet state meet by name: the engine looks the action state's name up in the AnimSet. A name with no folder in the AnimSet gives an empty state that plays nothing.
- Each time a character's animation updates, the engine evaluates the action state machine first, then the animator, then the animation player.
- Inside an AnimSet state, nodes are picked by conditions on animation variables. The nodes that pass start clip tracks, and the animation player samples those tracks on the skeleton.
- A timed action plays its animation by setting the variables `PerformingAction` and `IsPerformingAnAction`. The action's own length comes from its `maxTime`, not from the clip.
- On a multiplayer server, the animation XML files are checksummed, and a client whose animation checksum differs is warned about in the server log as one that will be kicked.
:::

:::facts
- **Motion scale** 1.6 in `Defaults.xml`, applied to the movement a clip carries :cite[(`media/AnimSets/Defaults.xml:3`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1104-1105`)]
- **Rotation scale** 1.1 in `Defaults.xml`, applied to the turning a clip carries :cite[(`media/AnimSets/Defaults.xml:4`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1106`)]
- **Node defaults** looped, priority 5, speed scale 1.00, blend time 0 :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:40-42`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:116-122`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:139-142`)]
- **Update order** action context, animator, animation player
- **Characters** player, zombie and animal each name an AnimSet and an action group
:::

## The parts

A character's animation passes through a short chain of parts, and each part does one job.

::::cards
:::card[Action group]{accent=orange}
A folder under `media/actiongroups`. Its state folders hold transition files and tags, and one group exists per kind of character.
:::
:::card[Action context]{accent=blue}
The state machine that evaluates those transitions each update. It holds the current state, its sub states and the events that fired this frame.
:::
:::card[Animator]{accent=purple}
`AdvancedAnimator`: one per character. It keeps a root layer, plus a sub layer for each sub state, and passes the state name to each layer.
:::
:::card[AnimSet state]{accent=cream}
A folder under `media/AnimSets/<set>/<state>`. Each XML file in it is a node: a clip, its conditions, its blend and speed, and its events.
:::
:::card[Animation player]{accent=orange}
Owns the clip tracks, samples them into bone transforms and works out the movement a clip carries.
:::
:::card[Skeleton and clips]{accent=blue}
The skinning data of the model. It holds the bone list and the map of clip names that `m_AnimName` looks up.
:::
::::

The Java classes behind the action group, action context and animator cards are `ActionGroup`, `ActionContext` and `AdvancedAnimator`. :cite[(`zombie/characters/action/ActionGroup.java:28-34`, `zombie/characters/action/ActionContext.java:33-45`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:54-61`)]

Each character kind names its own set. A player uses `player`, or `player-vehicle` while in a vehicle. A zombie uses `zombie`, or `zombie-crawler` while crawling, and an animal uses the animation set named in its definition, or `cow` when it has none. :cite[(`zombie/characters/IsoPlayer.java:1229-1231`, `zombie/characters/IsoZombie.java:1147-1149`, `zombie/characters/animals/IsoAnimal.java:372-374`)] The action group is picked by the same names. :cite[(`zombie/characters/IsoPlayer.java:4197-4222`, `zombie/characters/IsoZombie.java:3248-3256`, `zombie/characters/animals/IsoAnimal.java:1663`)]

## One frame, in order

On each animation update the engine runs the action context, then the animator, then the animation player.

:::flow[One animation update for one character]
- The action context checks the current state's transitions
- If the state changed, the animator and the Java AI state are told
- The animator picks nodes by their conditions and starts or fades clip tracks
- Events fire and are sent back to the character
- The animation player samples the tracks into bone transforms
- The skinned model is posed from those transforms
:::

The order is set in the character's post update. It calls `ActionContext.update`, then `AdvancedAnimator.update` (only when the character stands on a square), and later either the model slot update or, for a character with no active model, the animation player update. :cite[(`zombie/characters/IsoGameCharacter.java:10947-10985`)] A character with no active model runs its animation player with bone updates switched off, so only the movement and angle a clip carries are worked out. :cite[(`zombie/characters/IsoGameCharacter.java:11033-11048`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:519-537`)]

The action context copies its current state, evaluates the transitions on the copy, and keeps the copy if it differs. :cite[(`zombie/characters/action/ActionContext.java:65-122`)] A changed root state or sub state is reported to the state-changed callbacks after the update. :cite[(`zombie/characters/action/ActionContext.java:150-154`, `zombie/characters/action/ActionContext.java:199-211`)]

## From an action state to a clip

The action state's name reaches the animator, which finds the AnimSet state with the same name and lets that state's conditions pick the nodes.

The callback is registered when the character is set up. It calls `AdvancedAnimator.setState` with the root state name and the list of sub state names, and it also switches the Java AI state of the same name when one is registered. :cite[(`zombie/characters/component/StateMachineComponent.java:64-85`, `zombie/characters/component/StateMachineComponent.java:134-146`)]

`setState` looks the name up in the AnimSet in lower case. A name that has no folder gives a new empty state, so no node can pass and nothing plays. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:335-343`, `zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:41-49`)] The root state goes to the root layer, and each sub state goes to a sub layer of its own. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:345-405`)]

In every layer the state keeps a sorted list of nodes. A node with a higher `m_ConditionPriority`, or with more conditions, sorts first, and the engine walks the list and keeps every node whose conditions all pass, stopping when the next node ranks lower than the best one found. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:27-73`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:361-377`)] The layer starts a live node and its clip tracks for each node that newly passes, and fades the ones that stop passing. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:648-672`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:878-889`)]

For example, a player standing still is in the `idle` action state. The transition file `to_movement.xml` in that state's folder moves the character to `movement` once the variable `isMoving` is true. :cite[(`media/actiongroups/player/idle/to_movement.xml:1-7`)] The AnimSet folder `movement` then holds nodes such as `defaultWalk`, which names the clip `Bob_Walk` and has no conditions of its own. :cite[(`media/AnimSets/player/movement/defaultWalk.xml:3-4`)]

## How the animation player plays a node

A node's clip is found by name in the skeleton's clip map, started as a track, and then weighted and sampled every update.

`startPrimaryAnimationTrack` picks the clip name (the node's `m_AnimName`, or a random one when the node lists alternates) and calls the player. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:962-966`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:395-408`)] The player looks the name up in the skinning data's clip map. If the name is missing it logs a warning that the clip was not found, and the node plays nothing. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:411-433`, `zombie/core/skinnedmodel/model/SkinningData.java:21`)]

The track then takes its settings from the node: speed, looping, sync, priority and the bone used for carried movement. In a sub layer it also takes the node's bone weights, so the sub state moves only some bones. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:435-468`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:968-1000`)]

Each update the layer sets track weights from the node's blend, the node's `m_Scalar` variable and its 2D blend field. The animation player then updates its tracks. When bones are being updated it produces the bone transforms that skin the model. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:312-425`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1562-1587`)]

## How a timed action plays an animation

A timed action does not name a clip: it sets two variables, and the AnimSets match on them.

`setActionAnim(name)` stores the name in the variable `PerformingAction` and sets `IsPerformingAnAction` to true. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:125-131`, `zombie/characters/CharacterTimedActions/BaseAction.java:276-286`)] In the player group, the `idle` state has a transition to `actions` that is marked as a sub state and passes when `IsPerformingAnAction` is true and `isTurning` is false. :cite[(`media/actiongroups/player/idle/to_actions.xml:1-9`, `media/actiongroups/player/idle/childTags.xml:1-12`)] The matching AnimSet folder `actions` holds one node per action, and the node `Bandage` tests `PerformingAction` against the text `Bandage`. :cite[(`media/AnimSets/player/actions/Bandage.xml:1-12`)]

The `actions` state leaves again through a transition marked `transitionOut` that tests `IsPerformingAnAction` is false. :cite[(`media/actiongroups/player/actions/transitionOut.xml:1-7`)] When the action stops, or finishes and is not set to loop, `stopTimedActionAnim` clears the variables the action set and sets `IsPerformingAnAction` to false. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:189-193`, `zombie/characters/CharacterTimedActions/BaseAction.java:223-238`)]

The action's length is separate from the clip. A timed action is finished when its running time reaches its `maxTime`, unless it was told to wait for the server. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:181-183`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:138-141`)] What the player sees when the two differ depends on the node: a looped node repeats until the action clears its variables, and a node with `m_Looped` false is not repeated. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:116-118`)] The clip never extends the action.

## Events come back

Events that a node fires travel back up the same chain, and three kinds of listener receive them.

The animator hands an event to the character. The character reports it to the action context under the name of the layer's current state, so a transition can test it with `eventOccurred`. It also passes it to the Java AI state, and a player additionally passes it to the timed action at the front of its queue, whose Lua function `animEvent` receives the event name and its parameter. :cite[(`zombie/characters/IsoGameCharacter.java:4183-4196`, `zombie/characters/IsoPlayer.java:8080-8086`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:226-232`)]

An event from the root layer goes to the current Java AI state, and an event from a sub layer goes to every sub state of that character. :cite[(`zombie/ai/StateMachine.java:241-257`)] The full list of event tags and how to listen to them is on [Animation variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events).

## Which side runs what

A dedicated server runs the same action context, animator and animation player as a client, and checks that every client's animation files match its own.

The animation update does not depend on a model being drawn: a character with no active model still updates its animator and its player. :cite[(`zombie/characters/IsoGameCharacter.java:10947-10985`)] On a server, setting an animation variable on a zombie is ignored, so zombie animation variables are not written there. :cite[(`zombie/characters/IsoGameCharacter.java:12505-12508`)]

The server builds one checksum over every `.xml` file in `media/AnimSets` and `media/actiongroups` of the game and of each mod. A client sends its own checksum at login, and the server compares them. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:776-860`, `zombie/network/packets/service/ChecksumPacket.java:233-246`)] On a mismatch the server writes a warning that the user will be kicked after a timeout, and the checksum step is skipped when the `doLuaChecksum` server option is off or the connection's role can bypass it. :cite[(`zombie/network/packets/service/ChecksumPacket.java:247-270`, `zombie/network/packets/connection/LoginPacket.java:173-175`)]

A local player's state changes are sent to the server as state packets when the matching Java state is flagged to sync, and the player's `actions` state is. :cite[(`zombie/ai/states/StateManager.java:28-78`, `zombie/ai/states/PlayerActionsState.java:42-44`)] For a timed action the packet carries each variable the action set through `setAnimVariable`, and the receiving client builds a timed action that sets them again. :cite[(`zombie/ai/states/PlayerActionsState.java:98-125`, `zombie/ai/states/PlayerActionsState.java:133-152`)] That is how `PerformingAction` reaches other players, and a variable set with a plain `setVariable` call does not join that list. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:240-246`)]

> **Warning:** A mod that ships `AnimSets` or `actiongroups` files must be installed the same way on the server and on every client. Server owners should expect a client with a different set of those files to be flagged.

The checksum code is only run for a server or a client, never single player, so a bad animation file can stay hidden until a multiplayer test is run. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:852-860`)] The checksum build also throws when a listed file cannot be found in the engine's file map, which stops the client from finishing its join. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:831-845`)]

## Which files the engine reads

The engine reads the node files, the state folders, the transition and tag files and `Defaults.xml`, and in the sources we searched, nothing reads some editor files that sit beside them.

| File | What it does | Code |
|---|---|---|
| `media/AnimSets/<set>/<state>/<node>.xml` | One animation node. | `zombie/core/skinnedmodel/advancedanimation/AnimState.java:75-95` |
| `media/AnimSets/Defaults.xml` | Holds the motion and rotation scale. | `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:166-176` |
| `media/actiongroups/<group>/actionGroup.xml` | Names the first state of the group. | `zombie/characters/action/ActionGroup.java:57-80` |
| `media/actiongroups/<group>/<state>/*.xml` | Transitions, tags, child tags and state variables of one state. | `zombie/characters/action/ActionState.java:125-178` |
| `defaultTransitions.xml` beside the state folders | Not found in any engine or Lua source. | `zombie/characters/action/ActionGroup.java:36-55` |
| `Master_Variables.xml`, `Master_Bones.xml` and the `<set>.xml` files in `media/AnimSets` | Not found in any engine or Lua source. | `zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68` |

The group loader walks only the folders inside a group, so a transition file left beside the state folders is never loaded by that code. :cite[(`zombie/characters/action/ActionGroup.java:44-54`)] Each state folder in the shipped data holds its own `to_*.xml` copies of the transitions that the shared files describe.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java, the vanilla Lua and the shipped XML. Nothing here was run in a game. Not verified: what the receiving client does with every part of a state packet beyond the action variables, and what reads the `deferred` state variable that 14 state files in the shipped data set. The claim that `defaultTransitions.xml`, `Master_Variables.xml`, `Master_Bones.xml` and the set files are unread comes from searching the engine source and the vanilla Lua for their names, which found no use; code outside the decompiled source was not checked.
:::
