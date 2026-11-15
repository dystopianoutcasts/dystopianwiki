---
id: build-42-animation-reference
slug: animation-reference
title: 'Animation reference'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - reference
  - animsets
  - action-groups
excerpt: >-
  Lookup tables for Build 42.22 animation data: every action group and AnimSet with its state count, the XML elements of nodes, transitions, events and conditions with defaults, and the variables in the shipped data.
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - inside-the-animation-system
  - action-groups-and-states
  - animsets-nodes-and-transitions
  - animation-variables-and-events
  - skinned-models-and-clips
  - modding-animations
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders looking up a name](#action-groups-and-animsets-by-name) | [modders looking up an XML element](#node-elements) | [modders looking up a variable](#variables-in-the-shipped-data)

:::callout[The 1-minute version]{kind=key}
- Every count on this page was made by a script over the shipped `media/actiongroups` and `media/AnimSets` folders of the 42.22 capture, and not estimated.
- Action groups and AnimSets are matched by name, and a state matches by its folder name ignoring case. Some names exist on one side only, and the table lists them.
- A node, a transition, an event, a condition and a bone weight are each an XML element with fixed child element names. An element that matches no field is skipped, which we read from the binder and did not run.
- `Master_Variables.xml` and `Master_Bones.xml` are lists for tools. No engine or Lua source we searched reads them.
- The explanations behind the tables are on the pages for [action groups](/pz/build-42/engine/animation-system/action-groups-and-states), [AnimSets](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions) and [variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events).
:::

:::facts
- **Action groups** 28 folders under `media/actiongroups`, holding 485 state folders and 3258 XML files
- **AnimSets** 28 folders under `media/AnimSets`, holding 493 state folders and 2973 XML files
- **Node files** 2961 XML files with the root element `animNode`
- **Event names** 116 different names in node files, and 27 events with a blank name
- **Variables in `Master_Variables.xml`** 10
:::

## Action groups and AnimSets by name

A group and a set that share a name are two halves of one character kind, and a state links them by its folder name.

The engine reads each folder under `media/actiongroups` as a group and each folder inside it as a state. :cite[(`zombie/characters/action/ActionGroup.java:36-80`)] It reads each folder under `media/AnimSets` as a set and each folder inside it as a state, and lowercases the state names. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68`)] A state counts here when it is a folder, whatever it holds.

| Name | Action group state folders | AnimSet state folders | Only in the action group | Only in the AnimSet |
|---|---|---|---|---|
| `animal-editor` | 2 | 2 | - | - |
| `buck` | 12 | 13 | - | `deadbody` |
| `chick` | 11 | 12 | - | `deadbody` |
| `cockerel` | 12 | 13 | - | `deadbody` |
| `cow` | 13 | 14 | - | `deadbody` |
| `cowcalf` | 11 | 12 | - | `deadbody` |
| `deerdead` | 9 | no AnimSet | all | - |
| `doe` | 12 | 13 | - | `deadbody` |
| `ewe` | 11 | 12 | - | `deadbody` |
| `fawn` | 12 | 13 | - | `deadbody` |
| `hen` | 11 | 13 | - | `deadbody`, `sit` |
| `lamb` | 10 | 11 | - | `deadbody` |
| `mannequin` | no group | 4 | - | all |
| `mouse` | 9 | 10 | - | `deadbody` |
| `pig` | 12 | 13 | - | `deadbody` |
| `piglet` | 10 | 11 | - | `deadbody` |
| `player` | 98 | 97 | `grabcorpsefromcontainer`, `pickupbody`, `turning180` | `animal`, `deadbody` |
| `player-avatar` | 4 | 4 | - | - |
| `player-editor` | 2 | 2 | - | - |
| `player-vehicle` | 9 | 9 | - | - |
| `rabbit` | 10 | 11 | - | `deadbody` |
| `rabkitten` | 10 | 11 | - | `deadbody` |
| `raccoon` | 10 | 11 | - | `deadbody` |
| `ram` | 12 | 13 | - | `deadbody` |
| `rat` | 9 | 10 | - | `deadbody` |
| `turkey` | 11 | 12 | - | `deadbody` |
| `turkeypoult` | 11 | 11 | `hutch` | `deadbody` |
| `zombie` | 125 | 119 | `corpsethrown-onground`, `hitreaction-knifedeath`, `hitreaction-knifedeath-ragdoll`, `hitreaction-speardeath`, `hitreaction-speardeath-ragdoll`, `hitwhilestaggered`, `vehiclecollision` | `hitreaction-fencewindow-ragdoll` |
| `zombie-crawler` | 17 | 17 | - | - |
| **Total** | **485** | **493** | | |

Two names have one side only: `deerdead` is an action group with no AnimSet, and `mannequin` is an AnimSet with no group. The `player` group has three states with no AnimSet folder and the AnimSet has two states with no action state. The `zombie` group has seven states with no AnimSet folder and the set has one with no action state.

An action state with no AnimSet folder gets an empty animation state, so nothing plays, and the engine only logs a trace line. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:41-49`)] Which character uses which set is on [Inside the animation system](/pz/build-42/engine/animation-system/inside-the-animation-system).

## Files in an action group

The files in a state folder are told apart by their root element, and the folder's name is the state's name.

| Root element | Files | What the file is | Code |
|---|---|---|---|
| `transition` | 2511 | One transition out of the state. | `zombie/characters/action/ActionState.java:125-178`, `zombie/characters/action/ActionTransition.java:28-55` |
| `transitions` | 162 | Several transitions in one file. | `zombie/characters/action/ActionTransition.java:28-55` |
| `ActionState` | 476 | State settings: `isGrapplerState` and `variables`. | `zombie/characters/action/ActionState.java:180-195` |
| `childTags` | 49 | Tags of the states that may be this state's sub states. | `zombie/characters/action/ActionState.java:236-256` |
| `tags` | 32 | Tags of this state. | `zombie/characters/action/ActionState.java:236-256` |
| `actiongroup` | 28 | The group file `actionGroup.xml`, one per group, beside the state folders. | `zombie/characters/action/ActionGroup.java:36-80`, `media/actiongroups/player/actionGroup.xml:1-4` |

A file with any other root element is logged as unrecognized. :cite[(`zombie/characters/action/ActionState.java:174`)] The files in a folder are read in English collator order of their names. :cite[(`zombie/characters/action/ActionState.java:125-135`)] The group's root-level files, such as `defaultTransitions.xml`, are not loaded by the loader, because it reads only the subfolders. :cite[(`zombie/characters/action/ActionGroup.java:36-55`)]

## Action group elements

Each kind of file has a small, fixed set of elements, and the table lists the defaults the loader uses.

| File and element | Type | Default | What it does | Code |
|---|---|---|---|---|
| `actiongroup` / `initial` | text | the first state folder in the listing | The state a character starts in. Only this element is read from the file. | `zombie/characters/action/ActionGroup.java:57-80`, `zombie/characters/action/ActionGroup.java:109-120` |
| `ActionState` / `isGrapplerState` | boolean | false | Marks a state for grappling. | `zombie/characters/action/ActionState.java:184-186` |
| `ActionState` / `variables` / `var` | `key`, `type`, `enumType` | `type` is `string` | A read-only variable the state adds while it is active. Types are `string`, `bool`, `float` and `Enum`. | `zombie/characters/action/ActionState.java:197-234` |
| `tags` / `tag` | text | none | One tag the state has. | `zombie/characters/action/ActionState.java:239-245` |
| `childTags` / `tag` | text | none | One tag a sub state of this state may have. | `zombie/characters/action/ActionState.java:246-252` |
| `transition` / `transitionTo` | text | none | The state to go to. A transition that names its own state is dropped with a warning. | `zombie/characters/action/ActionTransition.java:67-68`, `zombie/characters/action/ActionState.java:153-163` |
| `transition` / `transitionOut` | boolean | false | Leave this sub state. | `zombie/characters/action/ActionTransition.java:69-70` |
| `transition` / `forceParent` | boolean | false | Make the target the root state. | `zombie/characters/action/ActionTransition.java:71-72` |
| `transition` / `asSubstate` | boolean | false | Enter the target as a sub state. | `zombie/characters/action/ActionTransition.java:73-74` |
| `transition` / `conditionPriority` | integer | 0 | Higher is tried first. | `zombie/characters/action/ActionTransition.java:75-76` |
| `transition` / `conditions` | list | none | The conditions that must all pass. | `zombie/characters/action/ActionTransition.java:77-86` |

In the shipped data, `transitionTo` appears 2928 times, `asSubstate` 145, `conditionPriority` 57 and `transitionOut` 44, and `forceParent` does not appear. A state's `variables` element appears in 14 `ActionState` files, and all 14 set the variable `deferred` to the Bool value True. No engine source we searched reads that variable.

### Action conditions

An action condition element is chosen by its tag name, and the tag names are case-sensitive.

| Tag | Uses in the shipped data | Form | Code |
|---|---|---|---|
| `isTrue` | 2738 | `<isTrue>variable</isTrue>` | `zombie/characters/action/conditions/CharacterVariableCondition.java:111-115` |
| `isFalse` | 1429 | `<isFalse>variable</isFalse>` | `zombie/characters/action/conditions/CharacterVariableCondition.java:116-120` |
| `compare` | 419 | `a`, `b` and `op` attributes | `zombie/characters/action/conditions/CharacterVariableCondition.java:121-149` |
| `eventOccurred` | 330 | the event name as text | `zombie/characters/action/conditions/EventOccurred.java:23-26` |
| `lessEqual` | 19 | `a` and `b` attributes | `zombie/characters/action/ActionContext.java:335-349` |
| `eventNotOccurred` | 4 | the event name as text | `zombie/characters/action/ActionContext.java:335-349` |
| `gtr` | 2 | `a` and `b` attributes | `zombie/characters/action/ActionContext.java:335-349` |
| `gtrEqual` | 2 | `a` and `b` attributes | `zombie/characters/action/ActionContext.java:335-349` |
| `less` | 2 | `a` and `b` attributes | `zombie/characters/action/ActionContext.java:335-349` |
| `notEquals` | 1 | `a` and `b` attributes | `zombie/characters/action/ActionContext.java:335-349` |
| `equals` | 0 | `a` and `b` attributes | `zombie/characters/action/ActionContext.java:335-349` |
| `lua` | 0 | a Lua function name | `zombie/characters/action/conditions/LuaCall.java:22-24` |

The operators of `compare` are `=`, `==`, `!=`, `<>`, `<`, `>`, `<=` and `>=`, and a condition with another operator is dropped. :cite[(`zombie/characters/action/conditions/CharacterVariableCondition.java:121-149`)] The `lua` condition never passes in the code we read. :cite[(`zombie/characters/action/conditions/LuaCall.java:22-24`)] The events that `eventOccurred` waits for most often in the shipped data are `ActiveAnimFinishing` (146 uses), `washitpvp` (65), `EventClimbFence` (19), `EventClimbWindow` (12) and `NoAnimConditionsPass` (11).

## AnimSet files

The files under `media/AnimSets` are node files, set files and a few lists, and the loader reads the node files only.

| File | Files | What it is | Code |
|---|---|---|---|
| Node files in a set folder (root `animNode`) | 2961 | One node each, at any depth inside a state folder. | `zombie/core/skinnedmodel/advancedanimation/AnimState.java:75-95` |
| `<set>.xml` beside the set folders (root `animSet`) | 8 | An `animNodeFilter` with folder and name prefixes such as `Bob` and `Bob_`. No engine source we searched reads it. | `media/AnimSets/player.xml:1-8` |
| `Master_Bones.xml`, `Master_Variables.xml` (root `KeyPairs`) | 2 | Lists for tools; see below. | `media/AnimSets/Master_Bones.xml:1-35`, `media/AnimSets/Master_Variables.xml:1-12` |
| `Defaults.xml` (root `Defaults`) | 1 | `MotionScale` 1.6 and `RotationScale` 1.1, read at startup. | `media/AnimSets/Defaults.xml:1-5`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:166-176` |
| `base.xml` | 1 | An empty file. | `media/AnimSets/base.xml` |

## Node elements

A node file's root is `animNode`, and each child element below is matched to a field by its exact name.

The Type column gives the field's type in the engine class, and a blank text default is shown as empty. The explanations are on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions).

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `m_Name` | String | empty | Name that transitions refer to | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:33-36` |
| `m_Priority` | int | 5 | Priority handed to the clip track | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:39-42` |
| `m_ConditionPriority` | int | 0 | Sort key before the condition count | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:43-46` |
| `m_AnimName` | String | empty | Clip to play, by clip name | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:47-50` |
| `m_AlternateAnims` | list of String | none | More clip names; one is chosen at random | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:51-54` |
| `m_MatchingGrappledAnimNode` | String | empty | Node the grappled character plays | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:55-58` |
| `m_GrappleOffsetForward` | float | 0 | Grapple placement, forward | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:59-62` |
| `m_GrappleOffsetYaw` | float | 0 | Grapple placement, turn | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:63-66` |
| `m_GrappleTweenInTime` | float | 0.25 | Grapple blend-in | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:67-70` |
| `m_GrapplerOffsetBehaviour` | GrappleOffsetBehaviour | Grappled | Grapple placement rule | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:71-74` |
| `m_isRagdoll` | boolean | false | Marks a ragdoll node | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:75-78` |
| `m_chanceToRagdoll` | float | 1.0 | Declared; no other engine source reads it | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:79-82` |
| `m_ragdollStartTimeMin` | float | 0 | Ragdoll start delay, low end | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:83-86` |
| `m_ragdollStartTimeMax` | float | 0 | Ragdoll start delay, high end | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:87-90` |
| `m_ragdollMaxTime` | float | 5.0 | Longest ragdoll run | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:91-94` |
| `m_DeferredBoneName` | String | Translation_Data | Bone whose motion moves the character | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:95-98` |
| `m_deferredBoneAxis` | BoneAxis | Y | Forward axis of that bone | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:99-102` |
| `m_useDeferedRotation` | boolean | false | Apply carried turning | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:103-106` |
| `m_useDeferredMovement` | boolean | true | Apply carried movement | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:107-110` |
| `m_deferredRotationScale` | float | 1.0 | Scale of carried turning | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:111-114` |
| `m_Looped` | boolean | true | Clip repeats | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:115-118` |
| `m_BlendTime` | float | 0 | Blend-in seconds | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:119-122` |
| `m_BlendOutTime` | float | -1.0 | Blend-out seconds | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:123-126` |
| `m_BlendCurve` | InterpolatorSlot | none | Blend curve name | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:127-130` |
| `m_StopAnimOnExit` | boolean | false | Clip stops while blending out | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:131-134` |
| `m_EarlyTransitionOut` | boolean | false | Start leaving one blend-out time early | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:135-138` |
| `m_SpeedScale` | String | 1.00 | Number, or a variable name | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:139-142` |
| `m_SpeedScaleVariable` | String | none | Read only by an updater that has no caller | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:143-146` |
| `m_SpeedScaleRandomMultiplierMin` | float | 1.0 | Random speed factor, low end | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:147-150` |
| `m_SpeedScaleRandomMultiplierMax` | float | 1.0 | Random speed factor, high end | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:151-154` |
| `m_randomAdvanceFraction` | float | 0 | Random start offset into a looped clip | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:157-160` |
| `m_maxTorsoTwist` | float | 15.0 | Torso twist limit | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:161-164` |
| `m_Scalar` | String | empty | Weight variable, or x of a 2D blend | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:165-168` |
| `m_Scalar2` | String | empty | y of a 2D blend | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:169-172` |
| `m_AnimReverse` | boolean | false | Clip plays backward | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:173-176` |
| `m_SyncTrackingEnabled` | boolean | true | Sync looped tracks of a layer | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:177-180` |
| `m_TrackTimeToVariable` | String | none | Clip time follows a variable | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:181-184` |
| `m_2DBlends` | list of Anim2DBlend | none | Clips of a 2D blend | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:185-188` |
| `m_Conditions` | list of AnimCondition | none | Conditions for the node | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:189-192` |
| `m_Events` | list of AnimEvent | none | Events fired by the node | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:193-196` |
| `m_2DBlendTri` | list of Anim2DBlendTriangle | none | Triangles of a 2D blend | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:197-200` |
| `m_Transitions` | list of AnimTransition | none | Transitions out of the node | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:201-204` |
| `m_SubStateBoneWeights` | list of AnimBoneWeight | none | Bone mask for a sub layer | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:205-208` |

Child elements of a node that match no field in 42.22 appear in the shipped data: `m_EarlyBlendOut`, `m_Finished` and `m_UpperOnly` (3 files each), `m_Left` and `m_Right` (3 each), and `m_IntValue` (6). A `m_Value`, `m_FloatValue`, `m_BoolValue` and `m_StringValue` of a condition are fields, and `m_Value` overwrites the other three when the node is parsed. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:35-46`, `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:77-98`)]

How often the shipped node files use the more common elements, counted as element occurrences that include nested ones:

| Element | Occurrences | Files that use it |
|---|---|---|
| `m_SubStateBoneWeights` | 9537 | 635 |
| `m_Conditions` | 4677 | 2655 |
| `m_AnimName` | 3731 | 2436 |
| `m_Events` | 2018 | 967 |
| `m_BlendTime` | 1213 | 1213 |
| `m_2DBlends` | 1110 | 206 |
| `m_Transitions` | 1108 | 307 |
| `m_SpeedScale` | 1065 | 744 |
| `m_Looped` | 542 | 542 |
| `m_2DBlendTri` | 261 | 65 |

## Transition elements

A transition sits inside a node's `m_Transitions` and names the node being entered.

An unset blend time or speed is infinity in the class, which the engine reads as "use the node's own value". :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:55-66`)]

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `m_Source` | String | none | Read, and not used by the code we followed | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:19-22` |
| `m_Target` | String | none | Name of the node being entered | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:23-26` |
| `m_AnimName` | String | none | Clip played during the change | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:27-30` |
| `m_DeferredBoneName` | String | none | Carried-movement bone during the change | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:31-34` |
| `m_deferredBoneAxis` | BoneAxis | Y | Forward axis | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:35-38` |
| `m_useDeferedRotation` | boolean | false | Apply carried turning | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:39-42` |
| `m_useDeferredMovement` | boolean | true | Apply carried movement | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:43-46` |
| `m_deferredRotationScale` | float | 1.0 | Scale of carried turning | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:47-50` |
| `m_SyncAdjustTime` | float | 0 | Shift of the new clip start | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:51-54` |
| `m_blendInTime` | float | infinity (unset) | Blend-in seconds | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:55-58` |
| `m_blendOutTime` | float | infinity (unset) | Blend-out seconds | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:59-62` |
| `m_speedScale` | float | infinity (unset) | Speed of the transition clip | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:63-66` |
| `m_Conditions` | list of AnimCondition | none | Conditions for the transition | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:69-72` |

## Events, conditions, bone weights and blends

Four small elements sit inside a node, and each has its own fixed child elements.

### Event elements

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `m_EventName` | String | none | Event name | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:20-23` |
| `m_Time` | AnimEvent.AnimEventTime | Percentage | Percentage, Start or End | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:24-27` |
| `m_TimePc` | float | 0 | Fraction of the clip for a Percentage event | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:28-31` |
| `m_ParameterValue` | String | none | Text passed to the receiver | `zombie/core/skinnedmodel/advancedanimation/AnimEvent.java:32-35` |

The times used by the shipped events are the default Percentage for 1099 events that write no `m_Time`, Start for 555 and End for 363, and one event writes Percentage out in full. Events named `SetVariable` and `FlagWhileAlive` are turned into special event classes by name when the node is parsed. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:237-243`)]

### Condition elements

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `m_Name` | String | empty | Variable name | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:23-26` |
| `m_Type` | AnimCondition.Type | STRING | Test type | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:27-30` |
| `m_Value` | String | empty | Value as text | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:31-34` |
| `m_FloatValue` | float | 0 | Overwritten from m_Value when it is parsed | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:35-38` |
| `m_BoolValue` | boolean | false | Overwritten from m_Value when it is parsed | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:39-42` |
| `m_StringValue` | String | empty | Overwritten from m_Value when it is parsed | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:43-46` |

The types the loader knows are `STRING`, `STRNEQ`, `BOOL`, `EQU`, `NEQ`, `LESS`, `GTR`, `ABSLESS`, `ABSGTR` and `OR`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:211-232`)] The shipped data uses them this way, and `ABSLESS` and `ABSGTR` do not appear:

| Type written in `m_Type` | Conditions |
|---|---|
| `STRING` | 2303 |
| `BOOL` | 1263 |
| no `m_Type` (the default, `STRING`) | 619 |
| `OR` | 383 |
| `LESS` | 43 |
| `GTR` | 37 |
| `EQU` | 15 |
| `NEQ` | 6 |
| `STRNEQ` | 2 |
| `2` or `3` as text | 6 |

What the `2` and `3` values do is not verified, because the parser has no type with those names.

### Bone weight elements

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `boneName` | String | none | Bone to weight | `zombie/core/skinnedmodel/advancedanimation/AnimBoneWeight.java:17-20` |
| `weight` | float | 1.0 | Weight | `zombie/core/skinnedmodel/advancedanimation/AnimBoneWeight.java:21-24` |
| `includeDescendants` | boolean | true | Weight the bones below it too | `zombie/core/skinnedmodel/advancedanimation/AnimBoneWeight.java:25-28` |

### 2D blend elements

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `m_AnimName` | String | empty | Clip name | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlend.java:19-22` |
| `m_XPos` | float | 0 | x position | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlend.java:23-26` |
| `m_YPos` | float | 0 | y position | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlend.java:27-30` |
| `m_SpeedScale` | float | 1.0 | Speed of this clip | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlend.java:31-34` |
| `referenceID` | String | none | Attribute that triangles refer to | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlend.java:35-39` |

| Element | Type | Default | What it is | Code |
|---|---|---|---|---|
| `node1` | Anim2DBlend | none | Reference to a blend clip | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlendTriangle.java:19-22` |
| `node2` | Anim2DBlend | none | Reference to a blend clip | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlendTriangle.java:24-27` |
| `node3` | Anim2DBlend | none | Reference to a blend clip | `zombie/core/skinnedmodel/advancedanimation/Anim2DBlendTriangle.java:29-32` |

## Variables in the shipped data

`Master_Variables.xml` lists ten names for tools, and the node and action files use many more.

| Variable | Tooltip in the file | Code |
|---|---|---|
| `Aim` | Is aiming. | `media/AnimSets/Master_Variables.xml:2` |
| `Weapon` | Equipped weapon. | `media/AnimSets/Master_Variables.xml:3` |
| `ipx` | X-Input while aiming. | `media/AnimSets/Master_Variables.xml:4` |
| `turndelta` | Rotation multiplier. | `media/AnimSets/Master_Variables.xml:5` |
| `ipy` | Y-Input while aiming. | `media/AnimSets/Master_Variables.xml:6` |
| `ismoving` | Is moving while aiming. | `media/AnimSets/Master_Variables.xml:7` |
| `deltax` | The X-movement while aiming. | `media/AnimSets/Master_Variables.xml:8` |
| `deltay` | The Y-movement while aiming. | `media/AnimSets/Master_Variables.xml:9` |
| `movedelta` | Movement multiplier. | `media/AnimSets/Master_Variables.xml:10` |
| `ang` | The angle you're aiming, while aiming. | `media/AnimSets/Master_Variables.xml:11` |

The list is not used by the engine: we found no reader of it in the Java or the vanilla Lua. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:166-176`)] The variables that node conditions test are found in the node files themselves. The most used names, lowercased as the loader folds them, are below, out of 176 different names in all.

| Variable | Conditions that test it |
|---|---|
| `weapon` | 1124 |
| `ext` | 333 |
| `sitonground` | 204 |
| `performingaction` | 173 |
| `sneaking` | 129 |
| `idleaction` | 105 |
| `frombehind` | 81 |
| `bmoving` | 67 |
| `animalrunning` | 60 |
| `bfalling` | 55 |
| `zombiewalktype` | 53 |
| `targettwist` | 47 |
| `traileranimation` | 43 |
| `fallspeedseverity` | 41 |
| `sittingonfurniture` | 36 |

A node's `m_SpeedScale` names a variable in these cases, with the number of nodes that name it:

:::chips
- ReloadSpeed 18
- CombatSpeed 14
- animalSpeed 7
- FitnessSpeed 7
- singleShootSpeed 5
- IdleSpeed 4
- WalkSpeedGrapple 4
- StrafeSpeed 4
- WalkSpeedTrees 2
- sneakLimpSpeedScale 2
- autoShootSpeed 2
- AttachItemSpeed 1
- ChopTreeSpeed 1
- EatSpeed 1
:::

The event names used most in the shipped nodes are `PlayBreedSound` (211), `SetVariable` (197), `Footstep` (153), `FlagWhileAlive` (142), `PlaySound` (113), `FallOnFront` (89), `idleActionEnd` (78), `PlayerVoiceSound` (63), `SetState` (54) and `AttackCollisionCheck` (39). The variables the engine registers itself, and how Lua reads and writes them, are on [Animation variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events).

:::callout[How we know]{kind=proof}
The counts come from a script that read every XML file in the capture's `media/actiongroups` and `media/AnimSets` folders and matched element names in the text, so an element in a nested position is counted too. The field tables come from the annotations and initial values in the decompiled classes, and nothing was run in a game.

Two counts need a note. Eight set files contain the text `<animNodeFilter`, so a search for `<animNode` finds 2969 files, while 2961 files have the root element `animNode`. The count of 116 event names leaves out events whose name is blank. Not verified: how the loader treats an element that matches no field, what the `2` and `3` condition types are, and which code reads the state variable `deferred`.
:::
