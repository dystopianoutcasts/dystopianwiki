---
id: build-42-physics-reference
slug: physics-reference
title: 'Physics reference'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: advanced
tags:
  - engine
  - physics
  - ragdolls
  - reference
  - modding
excerpt: >-
  Every table for Build 42.22 physics and ragdolls, counted by script from the game files: ragdoll script blocks, hit reaction values, physics shapes, options, Lua-callable methods and vehicle physics packets.
last_updated: '2026-11-14'
related_articles:
  - how-physics-and-ragdolls-work
  - inside-the-physics-engine
  - ragdolls
  - hit-reactions-and-ballistics
  - physics-shapes-and-objects
  - modding-physics-and-ragdolls
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders looking up a value](#ragdoll-script-values) | [Lua authors](#lua-callable-methods) | [server owners](#options-that-touch-physics) | new players should start at [How physics and ragdolls work](/pz/build-42/engine/physics-and-ragdolls/how-physics-and-ragdolls-work)

:::callout[The 1-minute version]{kind=key}
- This page is lookup tables only. Each count in a table comes from a script that parsed the file or index named in the table's Code column, and the "How we know" box says how.
- Ragdolls run only in single player, and the options that switch them are two player options. No sandbox option mentions ragdolls or physics in the capture's sandbox index.
- The ragdoll files hold 34 anchors, 11 body dynamics, 11 body part infos and 10 constraints. The hit reaction file holds 10 blocks and the shapes file holds 90 shapes.
- The tables list what the files say. What the native library does with a value is not verified, and neither is any in-game effect.
:::

:::facts
- **Native methods on `Bullet`** 93, counted by script :cite[(`zombie/core/physics/Bullet.java:89-561`)]
- **Ragdoll body parts and joints** 11 and 10 :cite[(`zombie/core/physics/RagdollBodyPart.java:12-23`, `zombie/core/physics/RagdollJoint.java:12-21`)]
- **Hit reaction enum** 29 named values plus `NONE` :cite[(`zombie/combat/HitReaction.java:10-39`)]
- **Player options** 2: one on or off, one count from 5 to 60 :cite[(`zombie/core/Core.java:328-329`)]
- **Vehicle physics packets** 3 classes, one set of fields :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java`)]
:::

## Indexes the tables use

The ragdoll scripts refer to body parts, joints and bones by number, and these are the numbers.

| Index | Body part | Index | Joint | Joins parts | Constraint type |
|---|---|---|---|---|---|
| 0 | pelvis | 0 | pelvis-spine | pelvis and spine | 4 |
| 1 | spine | 1 | spine-head | spine and head | 5 |
| 2 | head | 2 | left hip | pelvis and left upper leg | 5 |
| 3 | left upper leg | 3 | left knee | left upper leg and left lower leg | 4 |
| 4 | left lower leg | 4 | right hip | pelvis and right upper leg | 5 |
| 5 | right upper leg | 5 | right knee | right upper leg and right lower leg | 4 |
| 6 | right lower leg | 6 | left shoulder | spine and left upper arm | 5 |
| 7 | left upper arm | 7 | left elbow | left upper arm and left lower arm | 4 |
| 8 | left lower arm | 8 | right shoulder | spine and right upper arm | 5 |
| 9 | right upper arm | 9 | right elbow | right upper arm and right lower arm | 4 |
| 10 | right lower arm | - | - | - | - |

The body parts come from `RagdollBodyPart` and the joints from `RagdollJoint`; the joined parts and types in the last two columns are what the constraints file says for each joint. :cite[(`zombie/core/physics/RagdollBodyPart.java:12-23`, `zombie/core/physics/RagdollJoint.java:12-21`, `media/scripts/ragdolls/ragdoll_constraints.txt`)] The names for the constraint type numbers are the labels in the debug window: 4 is hinge and 5 is cone twist. :cite[(`zombie/debug/debugWindows/RagdollDebugWindow.java:31-34`)] Shape numbers in the body part table are 0 capsule, 1 box, 2 sphere, by the same window. :cite[(`zombie/debug/debugWindows/RagdollDebugWindow.java:33`)]

The skeleton has 35 bones and a `None` entry, and `RagdollScript` carries the same 35 names. :cite[(`zombie/core/skinnedmodel/model/SkeletonBone.java:14-48`, `zombie/scripting/objects/RagdollScript.java:23-59`)]

The native simulation state that the controller reads has six values, in this order: `UNKNOWN`, `ACTIVE_TAG`, `ISLAND_SLEEPING`, `WANTS_DEACTIVATION`, `DISABLE_DEACTIVATION` and `DISABLE_SIMULATION`. :cite[(`zombie/core/physics/RagdollController.java:931-939`)]

## Ragdoll script values

The four ragdoll files are in `media/scripts/ragdolls/`, and every row below is one block of one file.

How the fields are read is on [Ragdolls](/pz/build-42/engine/physics-and-ragdolls/ragdolls#the-four-script-files). The Code column gives the block's line range in the file.

### Anchors

The anchors file has 34 blocks, one per skeleton bone it names. Each anchor ties a bone to a body part.

| Block name | `bone` | `bodyPart` | `enabled` | `reverse` | `original` | Code |
|---|---|---|---|---|---|---|
| Bip01_R_Finger0_anchor | 17 | 10 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:3-10`)] |
| Bip01_R_Finger1_anchor | 18 | 10 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:12-19`)] |
| Bip01_L_Clavicle_anchor | 7 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:21-28`)] |
| Bip01_BackPack_anchor | 19 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:30-37`)] |
| Dummy01_anchor | 0 | 0 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:39-46`)] |
| Bip01_R_Calf_anchor | 25 | 6 | true | true | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:48-55`)] |
| Bip01_L_Calf_anchor | 21 | 4 | true | true | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:57-64`)] |
| Bip01_Pelvis_anchor | 2 | 0 | true | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:66-73`)] |
| Bip01_Spine_anchor | 3 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:75-82`)] |
| Bip01_R_Foot_anchor | 26 | 6 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:84-91`)] |
| Bip01_Head_anchor | 6 | 2 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:93-100`)] |
| Bip01_R_Clavicle_anchor | 13 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:102-109`)] |
| Bip01_L_Finger0_anchor | 11 | 8 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:111-118`)] |
| Bip01_anchor | 1 | 0 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:120-127`)] |
| Bip01_Prop1_anchor | 32 | 10 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:129-136`)] |
| Bip01_Neck_anchor | 5 | 2 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:138-145`)] |
| Bip01_DressFront_anchor | 28 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:147-154`)] |
| Bip01_L_Forearm_anchor | 9 | 8 | true | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:156-163`)] |
| Bip01_L_UpperArm_anchor | 8 | 7 | true | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:165-172`)] |
| Bip01_L_Toe0_anchor | 23 | 4 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:174-181`)] |
| Bip01_R_UpperArm_anchor | 14 | 9 | true | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:183-190`)] |
| Bip01_L_Hand_anchor | 10 | 8 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:192-199`)] |
| Bip01_R_Toe0_anchor | 27 | 6 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:201-208`)] |
| Bip01_Spine1_anchor | 4 | 1 | true | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:210-217`)] |
| Bip01_DressBack02_anchor | 31 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:219-226`)] |
| Bip01_R_Forearm_anchor | 15 | 10 | true | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:228-235`)] |
| Bip01_L_Foot_anchor | 22 | 4 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:237-244`)] |
| Bip01_DressBack_anchor | 30 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:246-253`)] |
| Bip01_R_Thigh_anchor | 24 | 5 | true | true | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:255-262`)] |
| Bip01_DressFront02_anchor | 29 | 1 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:264-271`)] |
| Bip01_L_Finger1_anchor | 12 | 8 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:273-280`)] |
| Bip01_R_Hand_anchor | 16 | 0 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:282-289`)] |
| Bip01_L_Thigh_anchor | 20 | 3 | true | true | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:291-298`)] |
| Bip01_Prop2_anchor | 33 | 8 | false | false | false | :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:300-307`)] |

Of the 34 anchors, 10 are enabled (Bip01_R_Calf, Bip01_L_Calf, Bip01_Pelvis, Bip01_L_Forearm, Bip01_L_UpperArm, Bip01_R_UpperArm, Bip01_Spine1, Bip01_R_Forearm, Bip01_R_Thigh, Bip01_L_Thigh). 4 set `reverse` true (Bip01_R_Calf, Bip01_L_Calf, Bip01_R_Thigh, Bip01_L_Thigh), and 0 set `original` true. :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt`)]

### Body dynamics

The body dynamics file has 11 blocks, one per body part.

| Block name | `part` | `linearDamping` | `angularDamping` | `deactivationTime` | `linearSleepingThreshold` | `angularSleepingThreshold` | `friction` | `rollingFriction` | Code |
|---|---|---|---|---|---|---|---|---|---|
| BODYPART_LEFT_UPPER_ARM_bodydynamics | 7 | 0.05 | 0.989 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:3-13`)] |
| BODYPART_PELVIS_bodydynamics | 0 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:15-25`)] |
| BODYPART_SPINE_bodydynamics | 1 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:27-37`)] |
| BODYPART_RIGHT_UPPER_LEG_bodydynamics | 5 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:39-49`)] |
| BODYPART_LEFT_LOWER_LEG_bodydynamics | 4 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:51-61`)] |
| BODYPART_RIGHT_UPPER_ARM_bodydynamics | 9 | 0.05 | 0.989 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:63-73`)] |
| BODYPART_HEAD_bodydynamics | 2 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:75-85`)] |
| BODYPART_LEFT_LOWER_ARM_bodydynamics | 8 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:87-97`)] |
| BODYPART_RIGHT_LOWER_ARM_bodydynamics | 10 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:99-109`)] |
| BODYPART_RIGHT_LOWER_LEG_bodydynamics | 6 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:111-121`)] |
| BODYPART_LEFT_UPPER_LEG_bodydynamics | 3 | 0.05 | 0.85 | 0.8 | 1.6 | 2.5 | 1.5 | 0.5 | :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt:123-133`)] |

### Body part info

The body part info file has 11 blocks, one per body part.

| Block name | `part` | `calculateLength` | `radius` | `height` | `gap` | `shape` | `mass` | `offset` | Code |
|---|---|---|---|---|---|---|---|---|---|
| BODYPART_RIGHT_LOWER_ARM_bodypartinfo | 10 | false | 0.055 | 0.3 | 0.1 | 0 | 0.02295 | 0.0 0.1 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:3-13`)] |
| BODYPART_RIGHT_LOWER_LEG_bodypartinfo | 6 | false | 0.055 | 0.35 | 0.1 | 0 | 0.0643 | 0.0 -0.1 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:15-25`)] |
| BODYPART_SPINE_bodypartinfo | 1 | true | 0.11 | 0.1 | 0.1 | 1 | 0.3111 | 0.0 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:27-37`)] |
| BODYPART_LEFT_LOWER_LEG_bodypartinfo | 4 | false | 0.055 | 0.35 | 0.1 | 0 | 0.0643 | 0.0 -0.1 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:39-49`)] |
| BODYPART_LEFT_UPPER_ARM_bodypartinfo | 7 | true | 0.055 | 0.1 | 0.1 | 0 | 0.03075 | 0.0 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:51-61`)] |
| BODYPART_PELVIS_bodypartinfo | 0 | true | 0.075 | 0.1 | 0.1 | 1 | 0.1481 | 0.0 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:63-73`)] |
| BODYPART_LEFT_UPPER_LEG_bodypartinfo | 3 | true | 0.055 | 0.1 | 0.1 | 0 | 0.11125 | 0.0 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:75-85`)] |
| BODYPART_RIGHT_UPPER_ARM_bodypartinfo | 9 | true | 0.055 | 0.1 | 0.1 | 0 | 0.03075 | 0.0 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:87-97`)] |
| BODYPART_HEAD_bodypartinfo | 2 | false | 0.1 | 0.1 | 0.1 | 1 | 0.0823 | -0.125 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:99-109`)] |
| BODYPART_LEFT_LOWER_ARM_bodypartinfo | 8 | false | 0.055 | 0.3 | 0.1 | 0 | 0.02295 | 0.0 0.1 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:111-121`)] |
| BODYPART_RIGHT_UPPER_LEG_bodypartinfo | 5 | true | 0.055 | 0.1 | 0.1 | 0 | 0.11125 | 0.0 0.0 0.0 | :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt:123-133`)] |

### Constraints

The constraints file has 10 blocks, one per joint. A constraint block that does not set `constraintLimitExtended` shows "(not set)".

| Block name | `joint` | `constraintType` | `PartA` | `PartB` | `AxisA` | `AxisB` | `PositionOffsetA` | `PositionOffsetB` | `constraintLimit` | `constraintLimitExtended` | Code |
|---|---|---|---|---|---|---|---|---|---|---|---|
| JOINT_RIGHT_KNEE_constraint | 5 | 4 | 5 | 6 | 0.0 1.5707964 0.0 | 0.0 1.5707964 0.0 | 0.0 -0.225 0.0 | 0.0 0.185 0.0 | 0.0 1.5707964 0.0 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:3-14`)] |
| JOINT_RIGHT_HIP_constraint | 4 | 5 | 0 | 5 | 0.0 0.0 0.7853982 | 0.0 0.0 0.7853982 | 0.1 -0.1 0.0 | 0.0 0.175 0.0 | 0.212 0.724 0.318 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:16-27`)] |
| JOINT_SPINE_HEAD_constraint | 1 | 5 | 1 | 2 | 0.0 0.0 1.5707964 | 0.0 0.0 1.5707964 | 0.0 0.15 0.0 | 0.0 -0.1 0.0 | 0.7853982 0.7853982 1.077 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:29-40`)] |
| JOINT_LEFT_ELBOW_constraint | 7 | 4 | 7 | 8 | 0.0 1.5707964 0.0 | 0.0 1.5707964 0.0 | 0.0 0.1 0.0 | 0.0 -0.1 0.0 | 0.0 1.5707964 0.0 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:42-53`)] |
| JOINT_RIGHT_SHOULDER_constraint | 8 | 5 | 1 | 9 | 0.0 0.0 0.0 | 0.0 0.0 1.5707964 | 0.1 0.1 0.0 | 0.0 -0.075 0.0 | 1.0 1.0 2.402 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:55-66`)] |
| JOINT_PELVIS_SPINE_constraint | 0 | 4 | 0 | 1 | 0.0 1.5707964 0.0 | 0.0 1.5707964 0.0 | 0.0 0.1 0.0 | 0.0 -0.1 0.0 | -0.565 0.935 1.571 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:68-79`)] |
| JOINT_LEFT_HIP_constraint | 2 | 5 | 0 | 3 | 0.0 0.0 2.3561945 | 0.0 0.0 2.3561945 | -0.1 -0.1 0.0 | 0.0 0.175 0.0 | 0.212 0.741 0.282 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:81-92`)] |
| JOINT_LEFT_KNEE_constraint | 3 | 4 | 3 | 4 | 0.0 1.5707964 0.0 | 0.0 1.5707964 0.0 | 0.0 -0.225 0.0 | 0.0 0.185 0.0 | 0.0 1.5707964 0.0 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:94-105`)] |
| JOINT_LEFT_SHOULDER_constraint | 6 | 5 | 1 | 7 | 0.0 0.0 3.1415927 | 0.0 0.0 1.5707964 | -0.1 0.1 0.0 | 0.0 -0.075 0.0 | 1.0 1.0 2.402 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:107-118`)] |
| JOINT_RIGHT_ELBOW_constraint | 9 | 4 | 9 | 10 | 0.0 1.5707964 0.0 | 0.0 1.5707964 0.0 | 0.0 0.1 0.0 | 0.0 -0.1 0.0 | 0.0 1.5707964 0.0 | (not set) | :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt:120-131`)] |

## Engine constants

These are the fixed numbers in the Java code that the other pages refer to.

| Constant | Value | Where it is used | Code |
|---|---|---|---|
| Physics step | 0.01 s | Fixed step passed to the native step | :cite[(`zombie/core/physics/WorldSimulation.java:88-92`)] |
| Command buffer | 4096 bytes | Java to native command buffer | :cite[(`zombie/core/physics/Bullet.java:77`)] |
| Active ragdoll distance | 1.0 | A closed door is delayed when a ragdoll is this close | :cite[(`zombie/core/physics/RagdollController.java:43`)] |
| Movement threshold | 0.01 | Head or pelvis move that counts as movement | :cite[(`zombie/core/physics/RagdollController.java:44`)] |
| Movement threshold time | 1.5 s | Timeout the controller resets to on movement | :cite[(`zombie/core/physics/RagdollController.java:45`)] |
| Timeout decay factor | 10 | The timeout drains this many times faster while asleep | :cite[(`zombie/core/physics/RagdollController.java:46`)] |
| Vehicle collision friction | 0.4 | Replaces friction in the vehicle contact set | :cite[(`zombie/core/physics/RagdollController.java:47`)] |
| Skeleton buffer | 245 floats | 35 bones x 7 floats | :cite[(`zombie/core/physics/RagdollController.java:48`)] |
| Rigid body buffer | 77 floats | 11 parts x 7 floats | :cite[(`zombie/core/physics/RagdollController.java:49`)] |
| Impulse buffer | 6 floats | One hit push | :cite[(`zombie/core/physics/RagdollController.java:50`)] |
| Default ragdoll mass | 70 | Builder default and the `Mass` setting default | :cite[(`zombie/characters/RagdollBuilder.java:35`)] |
| Ballistics target shape scale | 0.35, 0.4, 0.35 | Set on non-server | :cite[(`zombie/characters/RagdollBuilder.java:73`)] |
| Ballistics buffers | 80, 50, 36 floats | Targets, camera targets, spread data | :cite[(`zombie/core/physics/BallisticsController.java:47-49`)] |
| Mesh shape first id | 10 | Tile shape numbers for mesh shapes start here | :cite[(`zombie/iso/IsoChunk.java:5580-5592`)] |
| Vehicle shape blocks | 10 per vehicle | Extra blocks are dropped | :cite[(`zombie/scripting/objects/VehicleScript.java:345`)] |
| Fallback hit push | 80 forward, 40 upward | No matching hit reaction block | :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:112-168`)] |

The settings manager holds 37 values for the debug editor: one ragdoll setting (`Mass`, 1 to 100, default 70), 12 chance settings (0 to 100, default 100), 12 impulse settings (0 to 200, default 80) and 12 upward impulse settings (0 to 200, default 40). It also holds 11 forced hit locations. :cite[(`zombie/core/physics/RagdollSettingsManager.java:197-267`)] Of the chance settings, one is the global value and 11 are per body part; the other groups are laid out the same way. :cite[(`zombie/core/physics/RagdollSettingsManager.java:217-221`)]

## Hit reaction values

The physics hit reaction file has 10 blocks, and each has 11 forward and 11 upward values, one per body part.

The columns are the body parts in index order. A block named like an ammo type applies to that ammo, and a block named like a thrown item applies to that item. Ammo types with no block get 80 forward and 40 upward. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:47-51`, `zombie/scripting/objects/PhysicsHitReactionScript.java:112-168`)] How a hit picks a block and a body part is on [Hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics).

### Forward values

| Block | pelvis | spine | head | left upper leg | left lower leg | right upper leg | right lower leg | left upper arm | left lower arm | right upper arm | right lower arm | Code |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bullets_44 | 40 | 40 | 30 | 30 | 30 | 30 | 30 | 20 | 20 | 20 | 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:3-27`)] |
| bullets_45 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:29-53`)] |
| bullets_223 | 40 | 40 | 40 | 30 | 30 | 30 | 30 | 20 | 20 | 20 | 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:55-79`)] |
| bullets_38 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:81-105`)] |
| bullets_308 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:107-131`)] |
| shotgun_shells | 80 | 80 | 80 | 50 | 50 | 50 | 50 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:133-157`)] |
| bullets_556 | 50 | 50 | 50 | 45 | 45 | 45 | 45 | 40 | 40 | 40 | 40 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:159-183`)] |
| bullets_9mm | 20 | 20 | 10 | 20 | 20 | 20 | 20 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:185-209`)] |
| PipeBomb | 700 | 700 | 700 | 700 | 700 | 700 | 700 | 700 | 700 | 700 | 700 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:211-235`)] |
| Aerosolbomb | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:237-261`)] |

### Upward values

| Block | pelvis | spine | head | left upper leg | left lower leg | right upper leg | right lower leg | left upper arm | left lower arm | right upper arm | right lower arm | Code |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bullets_44 | 40 | 40 | 10 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:3-27`)] |
| bullets_45 | 20 | 20 | 5 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:29-53`)] |
| bullets_223 | 40 | 40 | 10 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:55-79`)] |
| bullets_38 | 20 | 20 | 5 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:81-105`)] |
| bullets_308 | 40 | 40 | 15 | 40 | 40 | 40 | 40 | 40 | 40 | 40 | 40 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:107-131`)] |
| shotgun_shells | 40 | 40 | 20 | 40 | 40 | 40 | 40 | 20 | 20 | 20 | 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:133-157`)] |
| bullets_556 | 40 | 40 | 10 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:159-183`)] |
| bullets_9mm | 20 | 20 | 5 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:185-209`)] |
| PipeBomb | 70 | 70 | 70 | 70 | 70 | 70 | 70 | 70 | 70 | 70 | 70 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:211-235`)] |
| Aerosolbomb | 40 | 40 | 40 | 40 | 40 | 40 | 40 | 40 | 40 | 40 | 40 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:237-261`)] |

The block `bullets_223` matches no engine ammo type, so it is read as an item name; the engine registers ten ammo types, which are `bullets_3030`, `bullets_308`, `bullets_357`, `bullets_38`, `bullets_44`, `bullets_45`, `bullets_556`, `bullets_9mm`, `cap_gun_cap` and `shotgun_shells`. :cite[(`zombie/scripting/objects/AmmoType.java:15-24`)] Three of them have no block in the vanilla file: `bullets_3030`, `bullets_357` and `cap_gun_cap`. :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt`)]

### Hit reaction names

The combat code names its hit reactions with the `HitReaction` enum: 29 values plus `NONE`.

:::chips
- Shot
- ShotHeadFwd
- ShotHeadFwd02
- ShotHeadBwd
- ShotBelly
- ShotBellyStep
- ShotBellyStepBehind
- ShotChest
- ShotChestL
- ShotChestR
- ShotChestStepL
- ShotChestStepR
- ShotShoulderL
- ShotShoulderR
- ShotShoulderStepL
- ShotShoulderStepR
- ShotLegL
- ShotLegR
- HeadLeft
- HeadTop
- Uppercut
- KnifeDeath
- HeadRight
- HitSpearDeath1
- HitSpearDeath2
- OnKnees
- Eating
- GettingUpFront
- Floor
:::

:cite[(`zombie/combat/HitReaction.java:10-39`)]

## Physics shape values

The shapes file has 90 shapes, all in `module Base`, and they come from 80 from `physics/ramp20` and 10 from `physics/ramp10`.

Every block sets `mesh`, `translate` and `rotate` and nothing else. How a shape is loaded and used is on [Physics shapes and objects](/pz/build-42/engine/physics-and-ragdolls/physics-shapes-and-objects).

| Shape (in `module Base`) | `mesh` | `translate` | `rotate` | Code |
|---|---|---|---|---|
| ramp10segment1n | physics/ramp10\|Segment1 | 0.0 0.0 0.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:3-8`)] |
| ramp10segment2n | physics/ramp10\|Segment2 | 0.0 0.0 1.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:10-15`)] |
| ramp10segment3n | physics/ramp10\|Segment3 | 0.0 0.0 2.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:17-22`)] |
| ramp10segment4n | physics/ramp10\|Segment4 | 0.0 0.0 3.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:24-29`)] |
| ramp10segment5n | physics/ramp10\|Segment5 | 0.0 0.0 4.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:31-36`)] |
| ramp10segment6n | physics/ramp10\|Segment6 | 0.0 0.0 5.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:38-43`)] |
| ramp10segment7n | physics/ramp10\|Segment7 | 0.0 0.0 6.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:45-50`)] |
| ramp10segment8n | physics/ramp10\|Segment8 | 0.0 0.0 7.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:52-57`)] |
| ramp10segment9n | physics/ramp10\|Segment9 | 0.0 0.0 8.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:59-64`)] |
| ramp10segment10n | physics/ramp10\|Segment10 | 0.0 0.0 9.5 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:66-71`)] |
| ramp20segment1n | physics/ramp20\|Segment1 | 0.0 0.0 0.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:73-78`)] |
| ramp20segment2n | physics/ramp20\|Segment2 | 0.0 0.0 1.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:80-85`)] |
| ramp20segment3n | physics/ramp20\|Segment3 | 0.0 0.0 2.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:87-92`)] |
| ramp20segment4n | physics/ramp20\|Segment4 | 0.0 0.0 3.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:94-99`)] |
| ramp20segment5n | physics/ramp20\|Segment5 | 0.0 0.0 4.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:101-106`)] |
| ramp20segment6n | physics/ramp20\|Segment6 | 0.0 0.0 5.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:108-113`)] |
| ramp20segment7n | physics/ramp20\|Segment7 | 0.0 0.0 6.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:115-120`)] |
| ramp20segment8n | physics/ramp20\|Segment8 | 0.0 0.0 7.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:122-127`)] |
| ramp20segment9n | physics/ramp20\|Segment9 | 0.0 0.0 8.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:129-134`)] |
| ramp20segment10n | physics/ramp20\|Segment10 | 0.0 0.0 9.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:136-141`)] |
| ramp20segment11n | physics/ramp20\|Segment11 | 0.0 0.0 10.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:143-148`)] |
| ramp20segment12n | physics/ramp20\|Segment12 | 0.0 0.0 11.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:150-155`)] |
| ramp20segment13n | physics/ramp20\|Segment13 | 0.0 0.0 12.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:157-162`)] |
| ramp20segment14n | physics/ramp20\|Segment14 | 0.0 0.0 13.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:164-169`)] |
| ramp20segment15n | physics/ramp20\|Segment15 | 0.0 0.0 14.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:171-176`)] |
| ramp20segment16n | physics/ramp20\|Segment16 | 0.0 0.0 15.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:178-183`)] |
| ramp20segment17n | physics/ramp20\|Segment17 | 0.0 0.0 16.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:185-190`)] |
| ramp20segment18n | physics/ramp20\|Segment18 | 0.0 0.0 17.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:192-197`)] |
| ramp20segment19n | physics/ramp20\|Segment19 | 0.0 0.0 18.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:199-204`)] |
| ramp20segment20n | physics/ramp20\|Segment20 | 0.0 0.0 19.0 | 0.0 180.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:206-211`)] |
| ramp20segment1s | physics/ramp20\|Segment1 | 0.0 0.0 0.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:213-218`)] |
| ramp20segment2s | physics/ramp20\|Segment2 | 0.0 0.0 -1.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:220-225`)] |
| ramp20segment3s | physics/ramp20\|Segment3 | 0.0 0.0 -2.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:227-232`)] |
| ramp20segment4s | physics/ramp20\|Segment4 | 0.0 0.0 -3.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:234-239`)] |
| ramp20segment5s | physics/ramp20\|Segment5 | 0.0 0.0 -4.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:241-246`)] |
| ramp20segment6s | physics/ramp20\|Segment6 | 0.0 0.0 -5.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:248-253`)] |
| ramp20segment7s | physics/ramp20\|Segment7 | 0.0 0.0 -6.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:255-260`)] |
| ramp20segment8s | physics/ramp20\|Segment8 | 0.0 0.0 -7.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:262-267`)] |
| ramp20segment9s | physics/ramp20\|Segment9 | 0.0 0.0 -8.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:269-274`)] |
| ramp20segment10s | physics/ramp20\|Segment10 | 0.0 0.0 -9.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:276-281`)] |
| ramp20segment11s | physics/ramp20\|Segment11 | 0.0 0.0 -10.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:283-288`)] |
| ramp20segment12s | physics/ramp20\|Segment12 | 0.0 0.0 -11.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:290-295`)] |
| ramp20segment13s | physics/ramp20\|Segment13 | 0.0 0.0 -12.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:297-302`)] |
| ramp20segment14s | physics/ramp20\|Segment14 | 0.0 0.0 -13.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:304-309`)] |
| ramp20segment15s | physics/ramp20\|Segment15 | 0.0 0.0 -14.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:311-316`)] |
| ramp20segment16s | physics/ramp20\|Segment16 | 0.0 0.0 -15.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:318-323`)] |
| ramp20segment17s | physics/ramp20\|Segment17 | 0.0 0.0 -16.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:325-330`)] |
| ramp20segment18s | physics/ramp20\|Segment18 | 0.0 0.0 -17.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:332-337`)] |
| ramp20segment19s | physics/ramp20\|Segment19 | 0.0 0.0 -18.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:339-344`)] |
| ramp20segment20s | physics/ramp20\|Segment20 | 0.0 0.0 -19.0 | 0.0 0.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:346-351`)] |
| ramp20segment1w | physics/ramp20\|Segment1 | 0.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:353-358`)] |
| ramp20segment2w | physics/ramp20\|Segment2 | 1.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:360-365`)] |
| ramp20segment3w | physics/ramp20\|Segment3 | 2.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:367-372`)] |
| ramp20segment4w | physics/ramp20\|Segment4 | 3.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:374-379`)] |
| ramp20segment5w | physics/ramp20\|Segment5 | 4.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:381-386`)] |
| ramp20segment6w | physics/ramp20\|Segment6 | 5.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:388-393`)] |
| ramp20segment7w | physics/ramp20\|Segment7 | 6.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:395-400`)] |
| ramp20segment8w | physics/ramp20\|Segment8 | 7.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:402-407`)] |
| ramp20segment9w | physics/ramp20\|Segment9 | 8.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:409-414`)] |
| ramp20segment10w | physics/ramp20\|Segment10 | 9.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:416-421`)] |
| ramp20segment11w | physics/ramp20\|Segment11 | 10.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:423-428`)] |
| ramp20segment12w | physics/ramp20\|Segment12 | 11.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:430-435`)] |
| ramp20segment13w | physics/ramp20\|Segment13 | 12.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:437-442`)] |
| ramp20segment14w | physics/ramp20\|Segment14 | 13.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:444-449`)] |
| ramp20segment15w | physics/ramp20\|Segment15 | 14.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:451-456`)] |
| ramp20segment16w | physics/ramp20\|Segment16 | 15.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:458-463`)] |
| ramp20segment17w | physics/ramp20\|Segment17 | 16.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:465-470`)] |
| ramp20segment18w | physics/ramp20\|Segment18 | 17.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:472-477`)] |
| ramp20segment19w | physics/ramp20\|Segment19 | 18.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:479-484`)] |
| ramp20segment20w | physics/ramp20\|Segment20 | 19.0 0.0 0.0 | 0.0 270.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:486-491`)] |
| ramp20segment1e | physics/ramp20\|Segment1 | 0.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:493-498`)] |
| ramp20segment2e | physics/ramp20\|Segment2 | -1.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:500-505`)] |
| ramp20segment3e | physics/ramp20\|Segment3 | -2.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:507-512`)] |
| ramp20segment4e | physics/ramp20\|Segment4 | -3.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:514-519`)] |
| ramp20segment5e | physics/ramp20\|Segment5 | -4.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:521-526`)] |
| ramp20segment6e | physics/ramp20\|Segment6 | -5.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:528-533`)] |
| ramp20segment7e | physics/ramp20\|Segment7 | -6.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:535-540`)] |
| ramp20segment8e | physics/ramp20\|Segment8 | -7.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:542-547`)] |
| ramp20segment9e | physics/ramp20\|Segment9 | -8.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:549-554`)] |
| ramp20segment10e | physics/ramp20\|Segment10 | -9.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:556-561`)] |
| ramp20segment11e | physics/ramp20\|Segment11 | -10.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:563-568`)] |
| ramp20segment12e | physics/ramp20\|Segment12 | -11.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:570-575`)] |
| ramp20segment13e | physics/ramp20\|Segment13 | -12.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:577-582`)] |
| ramp20segment14e | physics/ramp20\|Segment14 | -13.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:584-589`)] |
| ramp20segment15e | physics/ramp20\|Segment15 | -14.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:591-596`)] |
| ramp20segment16e | physics/ramp20\|Segment16 | -15.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:598-603`)] |
| ramp20segment17e | physics/ramp20\|Segment17 | -16.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:605-610`)] |
| ramp20segment18e | physics/ramp20\|Segment18 | -17.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:612-617`)] |
| ramp20segment19e | physics/ramp20\|Segment19 | -18.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:619-624`)] |
| ramp20segment20e | physics/ramp20\|Segment20 | -19.0 0.0 0.0 | 0.0 90.0 0.0 | :cite[(`media/scripts/generated/models_isoobject_physicsShape.txt:626-631`)] |

### Vehicle collision blocks

Vehicle scripts add their own `physics` blocks, and vanilla uses only boxes and spheres.

A script counted every line that starts a `physics box`, `physics sphere` or `physics mesh` block in the vanilla vehicle scripts. :cite[(`media/scripts/generated/vehicles`, `zombie/scripting/objects/VehicleScript.java:343-347`)]

| File | `physics box` | `physics sphere` | `physics mesh` |
|---|---|---|---|
| template_car_lights_collision.txt | 4 | 0 | 0 |
| template_car_luxury_collision.txt | 4 | 0 | 0 |
| template_car_modern02_collision.txt | 4 | 0 | 0 |
| template_car_modern_collision.txt | 4 | 0 | 0 |
| template_car_normal_collision.txt | 4 | 0 | 0 |
| template_car_small02_collision.txt | 4 | 0 | 0 |
| template_car_small_collision.txt | 4 | 0 | 0 |
| template_car_sports_collision.txt | 4 | 0 | 0 |
| template_car_stationwagon_collision.txt | 4 | 0 | 0 |
| template_car_taxi_collision.txt | 4 | 0 | 0 |
| template_offroad_collision.txt | 4 | 0 | 0 |
| template_pickuptruck_collision.txt | 4 | 0 | 0 |
| template_pickupvan_collision.txt | 4 | 0 | 0 |
| template_stepvan_collision.txt | 3 | 0 | 0 |
| template_suv_collision.txt | 4 | 0 | 0 |
| template_van_collision.txt | 3 | 0 | 0 |
| vehicle_trailer.txt | 3 | 1 | 0 |
| vehicle_trailer_cover.txt | 3 | 1 | 0 |
| vehicle_trailer_horsebox.txt | 7 | 1 | 0 |
| vehicle_trailer_livestock.txt | 5 | 1 | 0 |
| Total, 20 files | 80 | 4 | 0 |

## Options that touch physics

The player options switch ragdolls, a server option exists but has no effect, and no sandbox option mentions physics.

| Option | Kind | Range and default | What it does | Code |
|---|---|---|---|---|
| `usePhysicsHitReaction` | Player option (game options) | On or off, default on; reads off on a multiplayer client or server | Turns physics hit reactions and ragdolls off for all characters | :cite[(`zombie/core/Core.java:328`, `zombie/core/Core.java:4485-4487`, `zombie/characters/IsoGameCharacter.java:16410-16411`)] |
| `maxActiveRagdolls` | Player option (game options) | Whole number 5 to 60, default 20; the options screen offers 5, 10, 15, 20, 25, 30, 45 and 60 | Limit on ragdoll bodies in the world; a character with no controller cannot start one at the limit | :cite[(`zombie/core/Core.java:329`, `media/lua/client/OptionScreens/MainOptions.lua:732-771`, `zombie/characters/IsoGameCharacter.java:16414`)] |
| `UsePhysicsHitReaction` | Server option | On or off, default off | Read only after a test that already returned false on a server, so it has no effect | :cite[(`zombie/network/ServerOptions.java:219`, `zombie/characters/IsoGameCharacter.java:16412-16413`)] |
| Sandbox options | Sandbox | none | The sandbox option index has no entry that mentions ragdolls or physics | :cite[(`api/sandbox_options.jsonl`)] |

The player options are saved in `options.ini` and are set on the options screen in the "Use Physics Hit Reactions" and "Maximum Active Ragdolls" entries. :cite[(`zombie/core/Core.java:1431`, `media/lua/client/OptionScreens/MainOptions.lua:732-771`, `media/lua/shared/Translate/EN/UI.json:223-226`)]

### Debug options

Debug-only options return their default value when the game is not in debug mode, so these change nothing in a normal game. :cite[(`zombie/debug/BooleanDebugOption.java:35-37`)]

| Option path | Default | Code |
|---|---|---|
| `animation.DisableRagdolls` | false | :cite[(`zombie/debug/options/Animation.java:17`)] |
| `character.debug.ragdoll.Debug` | false | :cite[(`zombie/debug/options/Character.java:43`)] |
| `character.debug.ragdoll.SimulationActive` | true | :cite[(`zombie/debug/options/Character.java:44`)] |
| `character.debug.ragdoll.EnableInitialVelocities` | true | :cite[(`zombie/debug/options/Character.java:45`)] |
| `character.debug.ragdoll.OnBackOutlines` | false | :cite[(`zombie/debug/options/Character.java:46`)] |
| `character.debug.ragdoll.physics.PhysicsHitReaction` | true | :cite[(`zombie/debug/options/Character.java:54`)] |
| `character.debug.ragdoll.physics.AllowJointConstraintDetach` | false | :cite[(`zombie/debug/options/Character.java:55`)] |
| `character.debug.ragdoll.render.Enable`, `Body`, `PelvisLocation`, `BodySinglePart`, `Skeleton`, `SkeletonSinglePart` | all false | :cite[(`zombie/debug/options/Character.java:60-65`)] |

The native library file name can also change with the system property `zomboid.debuglibs.bullet`; when it is `1` the loader appends `d`. :cite[(`zombie/core/physics/Bullet.java:55-82`)]

## Lua-callable methods

These are the methods of the physics classes that the API index marks as Lua-callable, counted by script.

Each row lists the methods whose index entry has `lua` true. Global functions are listed separately in the Lua global index. :cite[(`api/api.jsonl`, `api/lua_globals.jsonl`)]

| Class | Count | Methods |
|---|---|---|
| IsoGameCharacter (ragdoll, hit reaction and ballistics names) | 22 | `canRagdoll`, `doDeferredMovementFromRagdoll`, `ensureExistsBallisticsTarget`, `getBallisticsController`, `getBallisticsTarget`, `getDeferredMovementFromRagdoll`, `getRagdollController`, `isEditingRagdoll`, `isFullyRagdolling`, `isRagdoll`, `isRagdollFall`, `isRagdollSimulationActive`, `onRagdollSimulationStarted`, `releaseBallisticsController`, `releaseBallisticsTarget`, `releaseRagdollController`, `setEditingRagdoll`, `setRagdollFall`, `setUsePhysicHitReaction`, `updateBallistics`, `usePhysicHitReaction`, `useRagdollVehicleCollision` |
| Core (options) | 4 | `getMaxActiveRagdolls`, `getOptionUsePhysicsHitReaction`, `setMaxActiveRagdolls`, `setOptionUsePhysicsHitReaction` |
| ScriptManager | 4 | `getAllPhysicsShapes`, `getPhysicsHitReactionScript`, `getPhysicsShape`, `getRagdollScript` |
| ScriptModule | 3 | `getPhysicsHitReactionScript`, `getPhysicsShape`, `getRagdollScript` |
| HandWeapon (physics names) | 3 | `getPhysicsObject`, `isExplosive`, `setPhysicsObject` |
| VehicleScript (physics names) | 8 | `addPhysicsShape`, `copyPhysicsFrom`, `getPhysicsChassisShape`, `getPhysicsShape`, `getPhysicsShapeCount`, `hasPhysicsChassisShape`, `removePhysicsShape`, `useChassisPhysicsCollision` |
| VehicleScript.PhysicsShape | 8 | `getExtents`, `getOffset`, `getPhysicsShapeScript`, `getRadius`, `getRotate`, `getTypeString`, `setPhysicsShapeScript`, `setRadius` |
| PhysicsShapeScript | 1 | `Load` |
| IsoPhysicsObject | 5 | `collideGround`, `collideWall`, `getGlobalMovementMod`, `postupdate`, `update` |
| AmmoType | 6 | `get`, `getByItemKey`, `getItemKey`, `getTranslationName`, `register`, `toString` |

`IsoGameCharacter` has more Lua-callable methods than these. The row lists only those whose name contains "Ragdoll", "ragdoll", "PhysicHit", "Ballistic" or "ballistic". :cite[(`api/api.jsonl`)]

The method named `updateBallisticsTarget` is not Lua-callable. :cite[(`zombie/characters/IsoGameCharacter.java:16472`)]

Classes with no Lua-callable methods in the index are `Bullet` (93 native methods), `WorldSimulation`, `RagdollController`, `BallisticsController`, `BallisticsTarget`, `RagdollSettingsManager`, `PhysicsHitReactionScript` and `RagdollScript`. :cite[(`api/lua_exposed.jsonl`)]

`Transform` is exposed in full, with 17 members: 4 constructors and 13 methods. :cite[(`api/lua_exposed.jsonl`, `zombie/Lua/LuaManager.java:2463`)]

The Lua global `addPhysicsObject()` takes no arguments, adds one native physics object at the player's position and returns nil. :cite[(`zombie/Lua/LuaManager.java:11008-11019`, `api/lua_globals.jsonl`)]

## Native methods on Bullet

`Bullet` has 93 native methods, and none of them is Lua-callable.

Each name goes into one group, chosen by testing for "ragdoll", then "ballistic", then "vehicle", then "constraint", and using the group for the earliest of those words that it contains. Names with none of those words are in the last group. :cite[(`zombie/core/physics/Bullet.java:89-561`, `api/native_boundary.md`)]

### Ragdoll (22)

:::chips
- initializeRagdollPose
- initializeRagdollSkeleton
- addRagdoll
- removeRagdoll
- simulateRagdoll
- simulateRagdollWithRigidBodyOutput
- setRagdollLocalTransformRotation
- updateRagdoll
- updateRagdollSkeletonTransforms
- updateRagdollSkeletonPreviousTransforms
- getRagdollSimulationState
- setRagdollActive
- drawDebugRagdollSkeleton
- drawDebugRagdollBodyParts
- highlightRagdollBodyPart
- setRagdollMass
- defineRagdollConstraints
- defineRagdollAnchors
- defineRagdollBodyPartInfo
- defineRagdollBodyDynamics
- setRagdollBodyDynamics
- resetRagdollBodyDynamics
:::

### Ballistics (20)

:::chips
- updateBallistics
- updateBallisticsMuzzleAimDirection
- setBallisticsSize
- setBallisticsColor
- getBallisticsTargets
- getBallisticsTargetsSpreadData
- getBallisticsCameraTargets
- setBallisticsRange
- removeBallistics
- updateBallisticsAimReticlePosition
- updateBallisticsAimReticleRotation
- updateBallisticsAimReticleQuaternion
- updateBallisticsAimReticleRotate
- updateBallisticsTargetSkeleton
- updateBallisticsTarget
- setBallisticsTargetAxis
- addBallisticsTarget
- removeBallisticsTarget
- setBallisticsTargetAdjustingShapeScale
- setBallisticsTargetAllPartsColor
:::

### Vehicle (17)

:::chips
- addVehicle
- removeVehicle
- controlVehicle
- setVehicleActive
- applyCentralForceToVehicle
- applyTorqueToVehicle
- teleportVehicle
- getVehicleCount
- getVehiclePhysics
- getOwnVehiclePhysics
- setOwnVehiclePhysics
- setVehicleParams
- setVehicleMass
- defineVehicleScript
- defineVehiclePhysicsMesh
- setVehicleVelocityMultiplier
- setVehicleStatic
:::

### Constraint (7)

:::chips
- addHingeConstraint
- addPointConstraint
- add6DofConstraint
- addRopeConstraint
- setConstraintERP
- removeConstraint
- detachConstraint
:::

### World and objects (27)

:::chips
- ToBullet
- getPZBulletVersion
- initPZBullet
- isWorldInit
- initWorld
- destroyWorld
- activateChunkMap
- deactivateChunkMap
- scrollChunkMap
- setChunkMinMaxLevel
- setTireInflation
- setTireRemoved
- stepSimulation
- getObjectPhysics
- createServerCell
- removeServerCell
- addPhysicsObject
- clearPhysicsMeshes
- definePhysicsMesh
- updateSkeletonFromNetworkPhysics
- getCorrectedWorldSpace
- resetSkeletonPose
- drawDebugSingleBone
- applyForce
- applyImpulse
- checkWheelCollision
- getTargetedBodyPart
:::

## Vehicle physics packets

A vehicle's physics state travels between a client and the server in one packet type that has a reliable and an unreliable form, and both forms use the same fields.

`VehiclePhysicsPacket` is the base class. `VehiclePhysicsReliablePacket` and `VehiclePhysicsUnreliablePacket` add only their send settings. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java:31`, `zombie/network/packets/vehicle/VehiclePhysicsReliablePacket.java:14-21`, `zombie/network/packets/vehicle/VehiclePhysicsUnreliablePacket.java:14-21`)]

| Class | `ordering` | `priority` | `reliability` | Other settings | Code |
|---|---|---|---|---|---|
| `VehiclePhysicsReliablePacket` | 8 | 1 | 2 | capability `LoginOnServer`, handling type 3, anti-cheat `Speed` | :cite[(`zombie/network/packets/vehicle/VehiclePhysicsReliablePacket.java:14-21`)] |
| `VehiclePhysicsUnreliablePacket` | 8 | 2 | 0 | capability `LoginOnServer`, handling type 3, anti-cheat `Speed` | :cite[(`zombie/network/packets/vehicle/VehiclePhysicsUnreliablePacket.java:14-21`)] |

The fields are written in this order. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java:108-141`, `zombie/network/packets/vehicle/VehiclePhysicsPacket.java:76-106`)]

| Field | Type | Meaning |
|---|---|---|
| `vehicleId` | vehicle id | Which vehicle |
| `time` | long | Simulation time stamp |
| `force` | float | The vehicle's force value |
| `x`, `y`, `z` | 3 floats | Position |
| `qx`, `qy`, `qz`, `qw` | 4 floats | Rotation as a quaternion |
| `vx`, `vy`, `vz` | 3 floats | Linear velocity |
| `engineSpeed` | float | Engine speed |
| `throttle` | float | Throttle |
| `transmissionNumber` | enum | Gear |
| wheel count | short | Number of wheels that follow |
| per wheel: `wheelSteering`, `wheelRotation`, `wheelSkidInfo`, `wheelSuspensionLength` | 4 floats each wheel | Steering, rotation, skid and suspension length |
| speed | float | Current speed in kilometers per hour, written last |

The meanings in the third column are read from the field names and from how the sender fills them. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java:40-73`)]

On the server, the packet is applied only when the sender has authorization over the vehicle, the packet's time stamp is newer than the last one, and the stamp is within 1000 ms of the server's time. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java:32`, `zombie/network/packets/vehicle/VehiclePhysicsPacket.java:154-163`)] The server then copies the position, rotation, velocity and wheel values into the vehicle and forwards the packet to nearby clients. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java:164-190`)] The reliable and unreliable classes list the `Speed` anti-cheat, and the base class implements the speed check's interface. :cite[(`zombie/network/packets/vehicle/VehiclePhysicsPacket.java:31`)] This page does not say how strict that check is, because the check was not read.

> **Warning for server owners:** the server takes a vehicle's position, rotation and velocity from the client that has authorization over it, within the stated time window. Keep the anti-cheat settings on and watch the server log. This page gives no steps.

## How we know

:::callout[How we know]{kind=proof}
- Every table was built by a script that parsed the file in its Code column: the four ragdoll files, the hit reaction file and the shapes file in `game_snapshot/media/scripts`, the `Bullet.java` native declarations, and the `api` indexes. The script's counts are the ones in the sentences above each table.
- A row's Code cell gives the block's line range in its file. A line range in `.java` is from the 42.22 decompiled source.
- Not verified: what the native library does with any value in the ragdoll or shape tables, the units of the impulses, and any in-game effect. Nothing on this page was run in a game.
- The `Bullet` groups are my own grouping by name, so a count by group is a count of names, not a statement about what a method does.
:::
