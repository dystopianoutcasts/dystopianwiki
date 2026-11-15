---
id: build-42-action-groups-and-states
slug: action-groups-and-states
title: 'Action groups and states'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - actiongroups
  - xml
  - multiplayer
  - modding
excerpt: >-
  The Build 42.22 actiongroups XML: groups, states, transitions, conditions and tags, how a character moves between states, and how timed actions enter and leave one.
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - inside-the-animation-system
  - animsets-nodes-and-transitions
  - animation-variables-and-events
  - modding-animations
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#the-files-in-a-group) | [server owners](#mods-and-multiplayer) | new players should start at [How character animation works](/pz/build-42/engine/animation-system/how-character-animation-works)

:::callout[The 1-minute version]{kind=key}
- An action group is a folder under `media/actiongroups`, and each folder inside it is one state. The group's `actionGroup.xml` names the first state in an `initial` element.
- Every XML file in a state folder is read by its root element, not by its name: `ActionState`, `transition` or `transitions`, `tags`, or `childTags`.
- Each update the engine takes the first non-sub-state transition whose conditions all pass. Transitions are ordered by `conditionPriority`, then by number of conditions.
- A transition marked `asSubstate` adds a sub state instead, and only when the current state's `childTags` overlap the target state's `tags`. Timed actions use this route.
- A mistyped condition tag is dropped without a message, which makes the transition easier to pass.
- By the code we read, the group loader reads only the game's own `media` folder, so a mod's `actiongroups` files are checksummed on a server but not loaded. This was not tested in a game.
:::

:::facts
- **Group names** match the character kind: `player`, `player-vehicle`, `zombie`, `zombie-crawler` and one per animal :cite[(`zombie/characters/IsoPlayer.java:4197-4222`, `zombie/characters/IsoZombie.java:3248-3256`, `zombie/characters/animals/IsoAnimal.java:1663`)]
- **Previous states kept** up to 5, for `transitionOut` :cite[(`zombie/characters/action/ActionContext.java:293-301`)]
- **Condition tags** 12, including one that never passes :cite[(`zombie/characters/action/ActionContext.java:335-349`)]
- **Starting state** the `initial` element, or the folder the loader lists earliest :cite[(`zombie/characters/action/ActionGroup.java:109-120`)]
:::

## The files in a group

A group is a folder tree, and the engine tells the files apart by what is inside them.

::::cards
:::card[actionGroup.xml]{accent=orange}
One file in the group folder. Its `initial` element names the state a character starts in.
:::
:::card[State folder]{accent=blue}
A folder named for the state, in lower case once loaded. Every `.xml` file inside it belongs to that state.
:::
:::card[Transition file]{accent=purple}
A `transition` or `transitions` root. Each transition names a target state and a list of conditions.
:::
:::card[Tag files]{accent=cream}
A `tags` file says what this state can be a sub state of. A `childTags` file says what can be a sub state of it.
:::
::::

The group loader reads `actionGroup.xml` first, then walks the group folder and loads each folder inside it as a state. :cite[(`zombie/characters/action/ActionGroup.java:36-55`)] A state is created the first time its folder name is seen, with the name in lower case. :cite[(`zombie/characters/action/ActionGroup.java:99-107`)]

The player group's `idle` folder shows the usual shape. It holds `idle.xml` (the state file), `childTags.xml`, and one `to_<state>.xml` transition file for each place the character can go. :cite[(`media/actiongroups/player/idle/idle.xml:1-4`, `media/actiongroups/player/idle/childTags.xml:1-12`, `media/actiongroups/player/idle/to_movement.xml:1-7`)] The `to_` prefix is a habit of the editor. The engine ignores file names and reads every `.xml` file in the folder, sorted by name. :cite[(`zombie/characters/action/ActionState.java:125-138`)]

## What each file kind sets

The root element of a file decides what the engine does with it, and a file with another root is logged and skipped.

| Root element | What it sets | Code |
|---|---|---|
| `ActionState` | The `isGrapplerState` flag and the state's own variables. | `zombie/characters/action/ActionState.java:180-195` |
| `transition` or `transitions` | One transition, or several, added to the state. | `zombie/characters/action/ActionTransition.java:28-38` |
| `tags` | The tags this state carries, so it can be a sub state. | `zombie/characters/action/ActionState.java:236-256` |
| `childTags` | The tags of states this state accepts as sub states. | `zombie/characters/action/ActionState.java:236-256` |
| Anything else | A warning, "Unrecognized xml file". | `zombie/characters/action/ActionState.java:174` |

A state's `tags` or `childTags` files are added together, so two files of the same kind give the union. :cite[(`zombie/characters/action/ActionState.java:167-172`)] The `ActionState` file may also hold a `variables` block with `var` elements, which the next section covers. The `bounds`, `commentBlock` and `isSubState` elements in the shipped files are editor data, and the parser does not read them. :cite[(`zombie/characters/action/ActionState.java:180-195`, `zombie/characters/action/ActionGroup.java:57-80`)]

A transition that targets its own state is dropped at load with a warning. :cite[(`zombie/characters/action/ActionState.java:153-163`)] After all files are read, the state sorts its transitions by `conditionPriority`, higher first. A tie is broken by the number of conditions, with more conditions first. :cite[(`zombie/characters/action/ActionState.java:37-39`, `zombie/characters/action/ActionState.java:258-260`)]

## Transition fields

A transition is a small set of child elements, and every one is optional.

| Element | Meaning | Code |
|---|---|---|
| `transitionTo` | The target state's name, matched without regard to case. | `zombie/characters/action/ActionTransition.java:67-68`, `zombie/characters/action/ActionGroup.java:95-97` |
| `asSubstate` | The target is added as a sub state, not as the new root state. | `zombie/characters/action/ActionTransition.java:73-74` |
| `transitionOut` | The target is the previous state from the history, and `transitionTo` is not used. In a sub state it removes the sub state. | `zombie/characters/action/ActionTransition.java:69-70`, `zombie/characters/action/ActionStateContainer.java:93-95` |
| `forceParent` | A sub state's transition may replace the root state when the root cannot hold the target as a sub state. | `zombie/characters/action/ActionTransition.java:71-72`, `zombie/characters/action/ActionStateContainer.java:166-169` |
| `conditionPriority` | An integer, 0 when absent or not a number. Higher sorts first. | `zombie/characters/action/ActionTransition.java:75-76` |
| `conditions` | A list of condition elements, all of which must pass. | `zombie/characters/action/ActionTransition.java:77-83`, `zombie/characters/action/ActionTransition.java:100-109` |

The element names of a transition are matched without regard to case, but a transition with no `transitionTo` and no `transitionOut` logs "Transition's target state not specified" each time it is evaluated. :cite[(`zombie/characters/action/ActionStateContainer.java:100-103`)] A target name that no state has logs "Transition's target state not found" instead. :cite[(`zombie/characters/action/ActionStateContainer.java:105-111`)]

## Conditions

A condition reads one variable or one event, and a transition passes only when all of its conditions pass.

| Tag | What it tests | Code |
|---|---|---|
| `isTrue`, `isFalse` | The named variable equals true, or false. | `zombie/characters/action/conditions/CharacterVariableCondition.java:111-120` |
| `compare` | Compares `a` and `b` with the `op` attribute: `=`, `==`, `!=`, `<>`, `<`, `>`, `<=`, `>=`. | `zombie/characters/action/conditions/CharacterVariableCondition.java:121-149` |
| `equals`, `notEquals`, `less`, `gtr`, `lessEqual`, `gtrEqual` | The same comparisons as `compare`, with one tag per operator and the same `a` and `b` attributes. | `zombie/characters/action/conditions/CharacterVariableCondition.java:150-173` |
| `eventOccurred`, `eventNotOccurred` | An animation event of that name fired since the last evaluation. | `zombie/characters/action/conditions/EventOccurred.java:23-31`, `zombie/characters/action/conditions/EventNotOccurred.java:23-30` |
| `lua` | Parsed, but it never passes. | `zombie/characters/action/conditions/LuaCall.java:22-24` |

The condition tags are registered by exact name, so `isTrue` works and `istrue` does not. :cite[(`zombie/characters/action/ActionContext.java:335-349`)] A tag with no registered name, or a `compare` whose `op` is not in the list, produces no condition at all, and the loader adds nothing in its place. :cite[(`zombie/characters/action/IActionCondition.java:24-27`, `zombie/characters/action/ActionTransition.java:78-83`)] The transition then has one condition fewer and passes more easily, without any log line.

In `compare`, `a` is the name of a variable unless it is a number, `true`, `false`, `yes`, `no`, or text in quotes. The value `b` is read as a number, a boolean or plain text. :cite[(`zombie/characters/action/conditions/CharacterVariableCondition.java:25-106`, `zombie/characters/action/conditions/CharacterVariableCondition.java:179-184`)] A comparison of a number with a number, or text with text, uses the natural order, and a number against text is false. :cite[(`zombie/characters/action/conditions/CharacterVariableCondition.java:214-286`)]

> **Warning:** Reading the code, `isFalse` fails when the named variable does not exist at all. A missing variable resolves to nothing, and only an empty-text comparison treats nothing as a match, so a variable that no code has set yet blocks the transition. Set a new variable to false first, or use a variable the engine already registers. :cite[(`zombie/characters/action/conditions/CharacterVariableCondition.java:214-231`, `zombie/characters/action/conditions/CharacterVariableCondition.java:283-285`)]

A `compare` with `op="!="` and no `b`, as in `<compare op="!=" a="LeftHandMask" />`, reads as "the variable is set to something other than empty text". :cite[(`media/actiongroups/player/aim/to_maskingleft.xml:6`, `zombie/characters/action/conditions/CharacterVariableCondition.java:219-226`)]

## How the engine picks the next state

Each update the engine evaluates the root state's transitions in sorted order and takes the first one that passes.

The container copies the current state, evaluates the copy, and passes the result on only when it differs. :cite[(`zombie/characters/action/ActionContext.java:65-122`)] The first loop looks only at transitions that are not sub-state transitions, in sorted order, and the first one that passes and whose target exists ends the loop. :cite[(`zombie/characters/action/ActionStateContainer.java:97-114`)] A second loop then walks the `asSubstate` transitions and tries to add each passing one as a sub state. :cite[(`zombie/characters/action/ActionStateContainer.java:116-131`)]

Sub states are evaluated after that, each with its own transitions. A passing `transitionOut` removes the sub state. A passing transition to a state the root can hold replaces the sub state, and a passing one with `forceParent` that the root cannot hold becomes the new root state. :cite[(`zombie/characters/action/ActionStateContainer.java:134-179`)]

The state of a character is evaluated again from scratch on each update, so a state with no passing transition simply stays. The history is the one thing that carries over: when the root changes, the old state is pushed onto a list kept to at most 5 entries, and a `transitionOut` that returns to the previous state pops it. :cite[(`zombie/characters/action/ActionContext.java:124-148`, `zombie/characters/action/ActionContext.java:293-301`)] When the history is empty, `transitionOut` aims at the group's first state. :cite[(`zombie/characters/action/ActionContext.java:281-283`, `zombie/characters/action/ActionContext.java:303-305`)]

## Sub states and tags

A sub state runs on top of the root state, and tags decide which pairs are allowed.

A state can hold another as a sub state when the two are different states and the parent's `childTags` share a tag with the child's `tags`, compared without regard to case. :cite[(`zombie/characters/action/ActionState.java:87-119`)] In the player group, `idle` lists `actions` and `turning` among its child tags, and the `actions` state carries the tag `actions`. :cite[(`media/actiongroups/player/idle/childTags.xml:1-12`, `media/actiongroups/player/actions/tags.xml:1-4`)]

Several sub states can stack, and each must be able to hold the next one. A new sub state goes in front of any existing one it can hold, and the engine refuses it if an existing sub state cannot hold it. :cite[(`zombie/characters/action/ActionStateContainer.java:303-346`)] When the root state changes, every sub state the new root cannot hold is removed. :cite[(`zombie/characters/action/ActionStateContainer.java:275-292`)]

A state can also carry its own variables. A `variables` block holds `var` elements with a `key`, a `type` of string (the default), bool, float or Enum, and the value as text. Every slot it creates is read-only. :cite[(`zombie/characters/action/ActionState.java:197-234`)] While the state is active, the character's variable lookup checks these first, from the last sub state back to the root, before its own variables. :cite[(`zombie/characters/action/ActionStateContainer.java:401-412`, `zombie/characters/IsoGameCharacter.java:12485-12494`)]

## Entering and leaving a state

A new state reaches the animator, the Java state of the same name and, on a client, the network layer, in that order.

When the root or a sub state changes, the context calls its state-changed callbacks after the update. The callback sends the new names to the animator, then switches the Java AI state. :cite[(`zombie/characters/action/ActionContext.java:150-154`, `zombie/characters/component/StateMachineComponent.java:70-85`)] The AI state machine exits the old Java state, enters the new one, and raises the Lua event `OnAIStateChange` with the character, the new state and the old one. :cite[(`zombie/ai/StateMachine.java:38-75`, `zombie/Lua/LuaEventManager.java:700`)]

A Java state is found by the lower-case name of the action state. The player's names are registered in one list, for example `idle` to `IdleState` and `actions` to `PlayerActionsState`. :cite[(`zombie/characters/IsoPlayer.java:1112-1213`, `zombie/characters/component/StateMachineComponent.java:134-146`)] A state with no Java class falls back to the character's default state. :cite[(`zombie/characters/component/StateMachineComponent.java:70-77`)]

A timed action enters and leaves through the sub-state route. Its `setActionAnim` call sets `IsPerformingAnAction`, which passes the `idle` to `actions` transition, and clearing that variable at the end passes the `transitionOut` in the `actions` folder. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:223-238`, `zombie/characters/CharacterTimedActions/BaseAction.java:276-286`, `media/actiongroups/player/idle/to_actions.xml:1-9`, `media/actiongroups/player/actions/transitionOut.xml:1-7`)] The same sub-state transition exists in the `aim`, `movement`, `strafe`, `onbed`, `sitonfurniture` and sitting folders, and a state with no such file, such as `run`, has no route to `actions`. :cite[(`media/actiongroups/player/aim/to_actions.xml:1-8`, `media/actiongroups/player/movement/to_actions.xml:1-9`, `media/actiongroups/player/run/childTags.xml:1-7`)] The `actions` folder also holds a `to_idle.xml` that passes when `IsPerformingAnAction` is false, which is the way out when `actions` is the root state. :cite[(`media/actiongroups/player/actions/to_idle.xml:1-6`)]

A new timed action animation therefore needs no new action state: it adds an AnimSet node under `actions`, described on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions).

## Events and transitions

A transition can wait for an animation event, and the event lives only until the next evaluation.

When a clip fires an event, the character reports its name to the action context together with the name of the layer's state. :cite[(`zombie/characters/IsoGameCharacter.java:4183-4196`)] An `eventOccurred` condition passes when an event of that name was reported for the same state, or was reported with no state. :cite[(`zombie/characters/action/ActionContextEvents.java:31-49`)] For example, the `getup` state leaves for `idle` on `ActiveAnimFinishing`, and for `movement` on the same event together with the variable `pressedMovement`. :cite[(`media/actiongroups/player/getup/to_idle.xml:1-7`, `media/actiongroups/player/getup/to_movement.xml:1-8`)]

The context clears its events after each update, and the character also clears `ActiveAnimFinished`, `ActiveAnimFinishing` and `ActiveAnimLooped` right after its animator update. :cite[(`zombie/characters/action/ActionContext.java:150-154`, `zombie/characters/action/ActionContext.java:213-215`, `zombie/characters/IsoGameCharacter.java:10958-10970`)] The names of the events a node can fire and the three built-in ones are on [Animation variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events).

## Shared transition files

Some group folders hold transition files beside the state folders, and the loader does not read them: it only loads the folders, and no source we searched names these files.

The player group has `defaultTransitions.xml`, `defaultHostileTransitions.xml` and `defaultTimedActionsTransitions.xml`. The loader only loads the folders inside a group, and no engine or Lua source mentions these file names. :cite[(`zombie/characters/action/ActionGroup.java:44-54`)] The shipped state folders contain their own `to_*.xml` files with the same transitions, and those are what run. :cite[(`media/actiongroups/player/defaultTimedActionsTransitions.xml:1-9`, `media/actiongroups/player/idle/to_actions.xml:1-9`)]

Treat the shared files as an editor aid. To change a transition for a state, edit that state's own `to_*.xml` file.

## Mods and multiplayer

Mod files in `actiongroups` take part in the server's checksum, but the loader code we read does not look for them.

The group loader builds its paths from the game's own `media` folder, with no search of mod folders. :cite[(`zombie/characters/action/ActionGroup.java:36-45`, `zombie/ZomboidFileSystem.java:247-250`)] The checksum step, by contrast, lists the `actiongroups` and `AnimSets` files of every mod. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:792-829`)] Some third-party mods in our reference copies ship `actiongroups` files, and we did not test whether those take effect. Until someone does, use the `actions` state and AnimSet nodes, which do load from mods, rather than a new action state.

A server compares the checksum of every client's animation files with its own, so a mod that adds or changes an `actiongroups` file must be installed the same way on both sides. :cite[(`zombie/network/packets/service/ChecksumPacket.java:233-246`)] The wider multiplayer picture, including how a local player's state changes reach other players, is on [Inside the animation system](/pz/build-42/engine/animation-system/inside-the-animation-system#which-side-runs-what).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and the shipped XML. Nothing was run in a game. Decompiled output can differ from the original in subtle control flow, and the three claims that matter most should be checked in a game before you rely on them: that `isFalse` fails on a variable that does not exist, that a mod's `actiongroups` folder is not read, and that an unknown condition tag is dropped silently. Not verified: what the shipped `deferred` state variable (set in 14 state files) is read by, since no engine source or AnimSet condition names it.
:::
