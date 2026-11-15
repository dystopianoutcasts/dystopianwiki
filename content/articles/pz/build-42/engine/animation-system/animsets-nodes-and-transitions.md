---
id: build-42-animsets-nodes-and-transitions
slug: animsets-nodes-and-transitions
title: 'AnimSets, nodes and transitions'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - animsets
  - xml
  - multiplayer
  - modding
excerpt: >-
  The Build 42.22 AnimSets XML: how a state folder of node files is built, every field a node reads, conditions, blending, transitions, 2D blends, bone masks and how mods add or replace nodes.
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - inside-the-animation-system
  - action-groups-and-states
  - animation-variables-and-events
  - skinned-models-and-clips
  - modding-animations
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#the-folder-layout) | [server owners](#how-files-from-several-mods-combine) | new players should start at [How character animation works](/pz/build-42/engine/animation-system/how-character-animation-works)

:::callout[The 1-minute version]{kind=key}
- An AnimSet is a folder under `media/AnimSets`. Each folder inside it is a state, and each `.xml` file inside a state folder is a node: one animation with its conditions.
- A state's name must match the name of an action state for it to play, and the match is made in lower case.
- A node is chosen when all of its conditions pass. Nodes with a higher `m_ConditionPriority`, or with more conditions, are tried first.
- A node with no `m_AnimName`, no alternates and no 2D blends, and that is not a ragdoll node, is abstract. It is never played, and it exists so other nodes can extend it.
- A transition is written in the node being left, names the node being entered, and can play a clip of its own in between.
- A file with the same path in a mod replaces the vanilla file. A file with a new name adds a node.
:::

:::facts
- **Defaults** looped, priority 5, speed scale 1.00, blend time 0, torso twist 15 :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:39-42`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:115-122`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:139-142`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:161-164`)]
- **Condition types** 10, with `OR` splitting a list into groups :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:211-232`)]
- **Default bone mask** spine at 0.5, then neck, backpack and both prop bones at 1.0 :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:256-262`)]
- **Motion scale** 1.6 and **rotation scale** 1.1 in `Defaults.xml` :cite[(`media/AnimSets/Defaults.xml:3-4`)]
:::

## The folder layout

An AnimSet is a three-level folder tree, and the engine reads the third level as nodes.

```
media/AnimSets/
  Defaults.xml
  player/                 the set, named after the character's AnimSet
    idle/                 a state, named after an action state
      Idle.xml            a node
      IdleRifle.xml       another node in the same state
    actions/
      Bandage.xml
```

The set name comes from the character: `player`, `player-vehicle`, `zombie`, `zombie-crawler`, or the animal's set. :cite[(`zombie/characters/IsoPlayer.java:1229-1231`, `zombie/characters/IsoZombie.java:1147-1149`, `zombie/characters/animals/IsoAnimal.java:372-374`)] The set is loaded once, by listing every folder under `media/AnimSets/<set>` and parsing each as a state. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68`)]

A state is parsed by listing every `.xml` file under its folder, including files in folders inside it, and loading each as a node. A file that fails to parse is logged and left out, and the rest of the state still loads. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:75-95`, `zombie/core/skinnedmodel/advancedanimation/AnimNodeAssetManager.java:17-26`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:278-282`)]

The top-level `player.xml`, `zombie.xml` and similar files in `media/AnimSets`, `Master_Variables.xml` and `Master_Bones.xml` are not read by any engine or Lua source we searched. Treat them as editor files. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68`)]

## How a state becomes a node choice

Each update the state offers its nodes in rank order, and every node whose conditions pass is kept until a lower-ranked one is reached.

When a node is added to a state, abstract nodes go to a separate list that is never offered. The others are placed by rank: a higher `m_ConditionPriority` first, then more conditions first. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:97-113`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:361-377`)]

When the state chooses, it walks that list in order and keeps each node whose conditions pass. It stops when it reaches a node that ranks lower than the best one already kept, so equal-ranked passing nodes all play together. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:27-73`)] This is why a narrow node, such as one for a rifle, sits above the general one with fewer conditions.

A node with no conditions always passes. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:188-204`)] A state in which no node passes plays nothing and raises the event `NoAnimConditionsPass` once, until some node passes again. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:171-176`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:648-672`)]

## Every node field

A node file has the root element `animNode`, and each child element is matched to a field by its exact name. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:27-31`)]

The loader hands the file to an XML binder, so a child element that matches no field is skipped without a message. The shipped data contains a few such elements, for example `m_EarlyBlendOut`, `m_Finished` and `m_UpperOnly`. We did not run the loader to confirm that behavior.

### Identity and choice

| Field | Default | What it does | Code |
|---|---|---|---|
| `m_Name` | empty | The node's name. Transitions and conditions refer to it. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:33-36` |
| `m_Conditions` | none | The conditions that decide whether the node plays. Repeat the element for each one. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:189-192` |
| `m_ConditionPriority` | 0 | Higher is tried first, before the number of conditions is compared. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:43-46` |
| `m_Priority` | 5 | Passed to the clip track as its priority. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:39-42`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:968-1000` |
| `m_AnimName` | empty | The clip to play, looked up by name in the skeleton's clip map. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:47-50` |
| `m_AlternateAnims` | none | More clip names. When the node starts, one of the clips is chosen at random. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:51-54`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:395-408` |
| `m_Events` | none | Events fired at a time in the clip. See [Animation variables and events](/pz/build-42/engine/animation-system/animation-variables-and-events). | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:193-196` |

When both `m_AnimName` and alternates are present, the engine picks one of them at random each time the node starts, and each has the same chance. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:395-408`)] A node is abstract when it has no clip name, no alternates, no 2D blends and is not a ragdoll node. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:331-339`)]

### Timing and blending

| Field | Default | What it does | Code |
|---|---|---|---|
| `m_Looped` | true | A looped clip repeats. A clip with this set to false plays once. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:115-118` |
| `m_BlendTime` | 0 | Seconds to blend the node in. Also the blend-out time when `m_BlendOutTime` is below 0. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:119-126`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:341-347` |
| `m_BlendOutTime` | -1 | Seconds to blend the node out. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:123-126` |
| `m_BlendCurve` | none | A named curve: `EaseInQuad`, `EaseOutInQuad`, `EaseOutQuad`, `Linear`, `One`, `Polyline`, `Sequence` or `Zero`. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:127-130`, `zombie/core/math/interpolators/xml/InterpolatorSlot.java:26-53` |
| `m_StopAnimOnExit` | false | While the node blends out, its clip stops advancing. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:131-134`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:225-229` |
| `m_EarlyTransitionOut` | false | For a non-looped node that does not stop on exit, the node starts leaving, and its end events fire, one blend-out time before the clip ends. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:135-138`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:352-358`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:528-535` |
| `m_SpeedScale` | 1.00 | A number, or the name of a variable that holds the speed. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:139-142`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:250-254`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:289-291` |
| `m_SpeedScaleRandomMultiplierMin`, `m_SpeedScaleRandomMultiplierMax` | 1.0, 1.0 | Each time the node starts, the speed is multiplied by a random value between the two. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:147-154`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:912-927` |
| `m_randomAdvanceFraction` | 0 | A looped node starts up to this fraction of the clip length into it. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:157-160`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:434-445` |
| `m_SyncTrackingEnabled` | true | Looped tracks of a layer are moved to the same fraction of their clip as the layer's lead track. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:177-180`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:332-346`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:1032-1050` |
| `m_TrackTimeToVariable` | none | The clip's time is read from the named variable, as a fraction of its length, instead of advancing by itself. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:181-184`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:190-203` |
| `m_AnimReverse` | false | The clip plays backward. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:173-176`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:968-1000` |

A `m_SpeedScale` that is not a number is used as a variable name, and the variable is read when the node starts. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:250-254`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:912-927`)] The shipped nodes use this for names such as `CombatSpeed` and `ReloadSpeed`. The field `m_SpeedScaleVariable` exists, but no code that calls its updater was found.

### Movement the clip carries

| Field | Default | What it does | Code |
|---|---|---|---|
| `m_DeferredBoneName` | `Translation_Data` | The bone whose motion moves the character. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:95-98`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:349-351` |
| `m_deferredBoneAxis` | `Y` | The axis of that bone that counts as forward: `Y` or `Z`. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:99-102`, `zombie/core/skinnedmodel/animation/BoneAxis.java:18-23` |
| `m_useDeferredMovement` | true | Apply the clip's carried movement to the character. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:107-110` |
| `m_useDeferedRotation` | false | Apply the clip's carried turning. The spelling "Defered" is the engine's. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:103-106` |
| `m_deferredRotationScale` | 1.0 | Scales that turning. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:111-114` |
| `m_maxTorsoTwist` | 15 | The most the torso may twist while the node plays, capped at 70. The layer blends the values of its live nodes and writes the result to the variable `maxTwist`. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:161-164`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:614-646` |

The deferred bone name is passed to the track when it starts. If the skeleton has no bone of that name, the engine logs "Deferred bone not found" and the track has no carried movement. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:435-455`)] The motion and rotation scale in `Defaults.xml` multiply the carried movement for every node. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:1104-1106`)]

### Blending between clips and layers

| Field | Default | What it does | Code |
|---|---|---|---|
| `m_Scalar` | empty | The variable that scales the node's weight from 0 to 1, or the x position in a 2D blend. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:165-168`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:387-413` |
| `m_Scalar2` | empty | The variable for the y position in a 2D blend. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:169-172`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:387-390` |
| `m_2DBlends` | none | The clips of a 2D blend, each with a position. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:185-188` |
| `m_2DBlendTri` | none | The triangles that connect those clips. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:197-200` |
| `m_SubStateBoneWeights` | see below | Which bones the node moves when it plays in a sub layer. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:205-208` |

### Ragdoll and grappling

| Field | Default | What it does | Code |
|---|---|---|---|
| `m_isRagdoll` | false | Makes the node a ragdoll node. The loader adds the condition `canRagdoll` equals true. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:75-78`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:225-231` |
| `m_chanceToRagdoll` | 1.0 | Declared, and no other engine source reads it. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:79-82` |
| `m_ragdollStartTimeMin`, `m_ragdollStartTimeMax` | 0, 0 | A random delay, in seconds, before the ragdoll starts. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:83-90`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:912-935` |
| `m_ragdollMaxTime` | 5.0 | The longest the ragdoll may run. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:91-94` |
| `m_MatchingGrappledAnimNode` | empty | Marks the node as a grappler and names the node that the grappled character plays. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:55-58`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:379-385` |
| `m_GrappleOffsetForward`, `m_GrappleOffsetYaw`, `m_GrappleTweenInTime`, `m_GrapplerOffsetBehaviour` | 0, 0, 0.25, `Grappled` | How the grappled character is placed and moved. The behaviors are `None`, `Grappled`, `Grappled_TweenOutToNone`, `Grappler` and `None_TweenInGrappler`. | `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:59-74`, `zombie/core/skinnedmodel/advancedanimation/GrappleOffsetBehaviour.java:18-29` |

## Conditions

A condition names a variable, a type and a value, and a node passes when its conditions pass in order.

Each condition is an `m_Conditions` element with `m_Name` (the variable), `m_Type` and `m_Value`. The value is read as text for the string types, as a boolean for `BOOL`, and as a number for the numeric types. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:23-46`, `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:77-98`)]

| `m_Type` | Passes when | Code |
|---|---|---|
| `STRING` | The variable's text equals the value, ignoring case. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:162-163` |
| `STRNEQ` | The variable's text differs from the value. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:164-165` |
| `BOOL` | The variable's boolean equals the value. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:166-167` |
| `EQU`, `NEQ` | The variable's number equals, or differs from, the value. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:168-171` |
| `LESS`, `GTR` | The variable's number is below, or above, the value. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:172-175` |
| `ABSLESS`, `ABSGTR` | The same, on the absolute value. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:176-179` |
| `OR` | Not a test: it splits the list into groups. | `zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:188-204` |

`OR` works left to right. Conditions before an `OR` must all pass, and if they do the node passes at once. If they do not, the engine starts a new group after the `OR` and tests those conditions in the same way. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:188-204`)] One transition in the node `Idle` uses this to say "the character has a walking injury or is over-encumbered". :cite[(`media/AnimSets/player/idle/Idle.xml:118-140`)]

When the variable does not exist, the result depends on the type. A `STRING` test passes only if the expected text is empty, a `STRNEQ` test passes if the expected text is not empty, and a `BOOL` test passes if the expected value is false. The numeric types fail and log one warning. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:139-158`)] This differs from the action-group conditions, where a missing variable makes `isFalse` fail. :cite[(`zombie/characters/action/conditions/CharacterVariableCondition.java:283-285`)]

In a string condition, `$this` and `$source` are replaced by the name of the node that holds the condition, and `$target` by the name of the node being entered. `$target` is allowed only in a transition. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:50-75`)] A variable name that starts with `$` and holds a dot, such as `$GrappledTarget.bonfloor`, reads a variable from another character. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationVariableReference.java:38-58`, `zombie/characters/IsoGameCharacter.java:12613-12620`)]

## Transitions between nodes

A transition is written in the node being left, and it names the node being entered.

When a node becomes active and another becomes inactive in the same update, the engine looks in the old node's `m_Transitions` for the first one whose `m_Target` matches the new node's name, ignoring case, and whose conditions pass. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:301-320`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:537-565`)] If one is found, the layer starts the transition's clip, if it has one, and the new node's own clip waits for it. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:567-574`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:718-760`)]

| Field | Default | What it does | Code |
|---|---|---|---|
| `m_Target` | none | The `m_Name` of the node being entered. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:23-26` |
| `m_AnimName` | none | A clip played during the change. Left out, the nodes blend with no clip between them. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:27-30`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:718-723` |
| `m_blendInTime` | infinity, meaning unset | Seconds to blend in. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:55-58` |
| `m_blendOutTime` | infinity, meaning unset | Seconds to blend the transition clip out. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:59-62` |
| `m_speedScale` | infinity, meaning unset | Speed of the transition clip. Unset, it uses the new node's speed. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:63-66`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:724-727` |
| `m_SyncAdjustTime` | 0 | Shifts where the new node's clip starts. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:51-54`, `zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:434-445` |
| `m_DeferredBoneName`, `m_deferredBoneAxis`, `m_useDeferedRotation`, `m_useDeferredMovement`, `m_deferredRotationScale` | as in a node | The carried-movement settings used while the transition clip plays. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:31-50` |
| `m_Conditions` | none | Conditions that must pass for this transition to be chosen. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:69-72` |
| `m_Source` | none | Read into a field and not used by the code we followed. | `zombie/core/skinnedmodel/advancedanimation/AnimTransition.java:19-22` |

Blend times follow one rule set, and an unset transition value falls back to the node's own time.

- With no matching transition, a node blends in over its `m_BlendTime` and out over its `m_BlendOutTime`, or `m_BlendTime` when that is below 0. :cite[(`zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:475-481`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:341-347`)]
- With a matching transition that has a clip, the node being entered blends in over the transition's `m_blendOutTime`, and the node being left blends out over its `m_blendInTime`. :cite[(`zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:475-514`)]
- With a matching transition that has no clip, the node being entered uses `m_blendInTime`, or `m_blendOutTime` when that is unset. The node being left uses `m_blendOutTime`, or `m_blendInTime` when that is unset. :cite[(`zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:475-514`)]

A transition whose `m_Target` is empty is remembered by the node, and the node's blend-out time then comes from that transition's `m_blendOutTime`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:269-275`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:341-347`)] The node `Idle` shows the usual shape: one transition for each node that may come after it. :cite[(`media/AnimSets/player/idle/Idle.xml:42-163`)]

## 2D blends

A 2D blend mixes several clips by two variable values, and the node's triangles decide which clips mix.

Each `m_2DBlends` element holds a clip name, a position (`m_XPos`, `m_YPos`), a speed (`m_SpeedScale`) and a `referenceID` attribute. Each `m_2DBlendTri` has three children `node1`, `node2` and `node3` that hold reference IDs. :cite[(`zombie/core/skinnedmodel/advancedanimation/Anim2DBlend.java:19-39`, `zombie/core/skinnedmodel/advancedanimation/Anim2DBlendTriangle.java:17-32`)]

The node's `m_Scalar` and `m_Scalar2` variables give the x and y point. The engine finds the triangle that contains the point and weights its three clips by the point's position in it. A point outside every triangle is projected onto the outer edge, so it blends the two nearest edge clips, or takes a single corner clip. :cite[(`zombie/core/skinnedmodel/advancedanimation/Anim2DBlendPicker.java:103-162`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:825-877`)] The node `Idle` is a small example, with three clips and one triangle, and `defaultWalk` has more. :cite[(`media/AnimSets/player/idle/Idle.xml:9-41`)]

## Layers and bone masks

A state that is a sub state plays in a sub layer, and the node's bone weights decide which bones it moves.

A node in the root layer moves every bone. A node in a sub layer gets a weight for each bone from `m_SubStateBoneWeights`: all bones start at 0, and each listed bone, and by default each bone below it, gets the weight. Where two entries overlap the larger weight wins. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:442-447`, `zombie/core/skinnedmodel/animation/AnimationTrack.java:567-610`)]

Each entry has a `boneName`, a `weight` (default 1.0) and `includeDescendants` (default true). A name that is not a bone of the skeleton logs "Bone not found". :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimBoneWeight.java:17-28`, `zombie/core/skinnedmodel/animation/AnimationTrack.java:581-598`)] A node that lists none gets the default mask of the spine at 0.5 and the neck, backpack and two prop bones at 1.0. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:256-262`)] The shipped action nodes list `Dummy01`, `Translation_Data` and the two prop bones, which with descendants covers the whole body. :cite[(`media/AnimSets/player/actions/ApplyAlcohol.xml:17-28`)]

## A minimal node

A node for a new timed action can copy the shape of a shipped one, such as `ApplyAlcohol`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<animNode>
	<m_Name>MyAction</m_Name>
	<m_AnimName>Bob_MyAction</m_AnimName>
	<m_Looped>false</m_Looped>
	<m_BlendTime>0.20</m_BlendTime>
	<m_SyncTrackingEnabled>false</m_SyncTrackingEnabled>
	<m_Conditions>
		<m_Name>PerformingAction</m_Name>
		<m_Type>STRING</m_Type>
		<m_Value>MyAction</m_Value>
	</m_Conditions>
	<m_SubStateBoneWeights><boneName>Dummy01</boneName></m_SubStateBoneWeights>
	<m_SubStateBoneWeights><boneName>Translation_Data</boneName></m_SubStateBoneWeights>
	<m_SubStateBoneWeights><boneName>Bip01_Prop1</boneName></m_SubStateBoneWeights>
	<m_SubStateBoneWeights><boneName>Bip01_Prop2</boneName></m_SubStateBoneWeights>
</animNode>
```

It goes in `media/AnimSets/player/actions/MyAction.xml` of the mod. The timed action then calls `setActionAnim("MyAction")`, and a clip named `Bob_MyAction` must exist in the skeleton's clips. :cite[(`media/AnimSets/player/actions/ApplyAlcohol.xml:1-29`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:125-131`)] We modeled this on the shipped node and did not run it in a game.

## How files from several mods combine

Files are matched by their path under `media`, in lower case, and a later source replaces an earlier one at the same path.

The engine lists a state's folders and files across the base game and then each mod's `common` and version folders in mod order, and de-duplicates them by relative path. :cite[(`zombie/ZomboidFileSystem.java:1209-1236`, `zombie/ZomboidFileSystem.java:1238-1262`)] A node file is then loaded from the winning source of that path, and the game logs "mod overrides" when a mod replaces a file. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:81-92`, `zombie/ZomboidFileSystem.java:668-695`)]

Three cases follow from this. A mod file at the same path replaces the vanilla file completely. A mod file in the same state folder under a new name adds a node, which is ranked with the others. A new state folder in a mod, under an existing set, adds a state, which plays only if an action state of that name exists in the group. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68`, `zombie/core/skinnedmodel/advancedanimation/AnimState.java:97-113`)]

A node can also extend another file. The loader reads three attributes on the root element:

- `x_extends="File.xml"` starts from another file and applies this file's changes on top. The path is relative to the file, or a file GUID. :cite[(`zombie/util/PZXmlUtil.java:58-80`)]
- `x_include="File.xml"` copies the other file's child elements in front of this file's. :cite[(`zombie/util/PZXmlUtil.java:82-107`)]
- `x_name="id"` on a child element names it, so an extending file can replace that one element and keep the rest. An element with a new name is added, and an unnamed element is matched by its position among elements of the same tag. :cite[(`zombie/util/PZXmlUtil.java:374-461`)]

The shipped `ApplyAlcohol_Sat` extends `ApplyAlcohol` and adds its own conditions. :cite[(`media/AnimSets/player/actions/ApplyAlcohol_Sat.xml:1-12`)] Many abstract nodes in the shipped data serve as the base of such files.

## Defaults and reloading

`Defaults.xml` holds the two scales, and edited node files can be reloaded.

`Defaults.xml` sets `MotionScale` and `RotationScale`. The engine reads them at startup, and its own starting values of 0.76 apply until they are read. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:62-63`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:166-176`)]

The engine reloads the sets when a watched file changes, through `checkModifiedFiles`.

The watcher polls in single player and on a server, and on a multiplayer client only in debug mode, and mod `media` folders are registered with it; we read this and did not test it in a game. :cite[(`zombie/DebugFileWatcher.java:141-181`, `zombie/ZomboidFileSystem.java:495-510`)] :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:71-77`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:151-164`)] The reload resets every set, reloads every node asset, rebuilds the `player`, `player-vehicle`, `zombie` and `zombie-crawler` sets, and tells each player, zombie and animal that its animation data changed. :cite[(`zombie/Lua/LuaManager.java:6053-6089`)] The method that does this, `refreshAnimSets`, has no Lua marker above it, and the engine's Lua index lists it as not callable from Lua. We did not try a call. :cite[(`zombie/Lua/LuaManager.java:6049-6053`)]

> **Warning:** Animation files take part in the server's checksum, so a node file that differs between a client and the server is reported by the server. Install a mod's `AnimSets` the same way everywhere. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:776-860`, `zombie/network/packets/service/ChecksumPacket.java:233-246`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and the shipped XML. Nothing was run in a game. Not verified: that an unknown element in a node file is skipped silently, that `refreshAnimSets` cannot be called from Lua in practice, what `m_Source` is for (no use was found), and the two shipped condition types written as `2` and `3` in three data files, which the parser cannot map to a named type. The cap of 70 on torso twist is a constant in the layer code, and the early transition out is switched by a debug option that defaults to on.
:::
