---
id: build-42-ragdolls
slug: ragdolls
title: 'Ragdolls'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: advanced
tags:
  - engine
  - physics
  - ragdolls
  - animation
  - zombies
  - modding
excerpt: >-
  How a Build 42.22 ragdoll starts, runs and ends: the animation node that asks for it, the controller that simulates it, how it hands back to the animation system, and every field in the four ragdoll script files.
last_updated: '2026-11-14'
related_articles:
  - how-physics-and-ragdolls-work
  - inside-the-physics-engine
  - hit-reactions-and-ballistics
  - physics-shapes-and-objects
  - modding-physics-and-ragdolls
  - physics-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#how-a-ragdoll-starts) | [script authors](#the-four-script-files) | new players should start at [How physics and ragdolls work](/pz/build-42/engine/physics-and-ragdolls/how-physics-and-ragdolls-work)

:::callout[The 1-minute version]{kind=key}
- A ragdoll is an animation track. An animation node with `m_isRagdoll` true plays a track named `Ragdoll_<node name>`, and that track is driven by a physics body instead of a clip.
- A node marked as a ragdoll only passes when `canRagdoll` is true, and `canRagdoll` is false on a multiplayer client and on a dedicated server. The vanilla ragdoll nodes are all in the zombie AnimSets.
- `RagdollController` owns one ragdoll. It adds the body to the native world, copies the simulated bone transforms into the animation every frame, and stops when the body has slept and stopped moving.
- Four script files in `media/scripts/ragdolls/` define the body: anchors, body dynamics, body part info and constraints. Their values are uploaded to the native library once, when scripts load.
- Not verified here: what the native code does with each value. The Java side only parses and uploads them.
:::

:::facts
- **Body parts** 11 (pelvis, spine, head, two legs of two parts, two arms of two parts) :cite[(`zombie/core/physics/RagdollBodyPart.java:12-23`)]
- **Joints** 10 :cite[(`zombie/core/physics/RagdollJoint.java:12-21`)]
- **Skeleton bones** 35, 7 floats each (position and rotation), so a 245-float buffer :cite[(`zombie/core/skinnedmodel/model/SkeletonBone.java:14-48`, `zombie/core/physics/RagdollController.java:48`)]
- **Script blocks** 34 anchors, 11 body dynamics, 11 body part infos, 10 constraints :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt`, `media/scripts/ragdolls/ragdoll_bodydynamics.txt`, `media/scripts/ragdolls/ragdoll_bodypartinfo.txt`, `media/scripts/ragdolls/ragdoll_constraints.txt`)]
- **Ragdoll nodes in vanilla** 56 AnimSet files, all under `AnimSets/zombie` :cite[(`media/AnimSets/zombie`)]
- **Movement test** 0.01 over 1.5 s before the body may stop :cite[(`zombie/core/physics/RagdollController.java:44-45`, `zombie/core/physics/RagdollController.java:795-805`)]
- **Default body mass setting** 70 :cite[(`zombie/characters/RagdollBuilder.java:35`)]
:::

## The parts

A ragdoll is made of one shared builder, one controller per ragdolling character, and four tables of script data.

::::cards
:::card[RagdollBuilder]{accent=orange}
One static instance. It loads the T-pose clip, tells the native side the skeleton shape and the rest pose, and keeps the head, pelvis and shoulder bones that the controller measures.
:::
:::card[RagdollController]{accent=blue}
One per ragdolling character, taken from a pool. It adds and removes the body, steps it, reads the result and decides when it is over.
:::
:::card[RagdollStateData]{accent=purple}
The controller's notes: whether it is simulating, a timeout, the last movement test, the direction the body fell and the last vehicle it touched.
:::
:::card[Ragdoll scripts]{accent=cream}
`RagdollScript` parses four kinds of block and uploads them. `RagdollSettingsManager` holds the debug and hit reaction settings.
:::
::::

Every chunk that finishes loading calls `addRagdollControllers`, which runs `RagdollBuilder.Initialize` only while the builder is not yet initialized. :cite[(`zombie/iso/IsoChunk.java:3749`, `zombie/iso/IsoChunk.java:5463-5467`, `zombie/characters/RagdollBuilder.java:44-84`)] It needs the animation asset `bob/bob_tpose` and the clip `Bob_TPose`, and it returns false if either is missing. :cite[(`zombie/characters/RagdollBuilder.java:46-58`)]

## How a ragdoll starts

A ragdoll starts when the animation system picks a node marked as a ragdoll and the character is allowed to ragdoll.

:::flow[From a hit to a running ragdoll]
- A hit sets the character's hit reaction and a flag `usePhysicHitReaction`
- An action-group transition tests `canRagdoll` and `usePhysicHitReaction`
- The matching AnimSet node (`m_isRagdoll` true) starts a `Ragdoll_` track
- The animation player makes a `RagdollController`
- The controller adds the body to the native world
:::

The flag comes from the combat code. `CombatManager.setUsePhysicHitReaction` sets it false when `canRagdoll()` is false, and otherwise to the settings manager's answer and whether the weapon is ranged. :cite[(`zombie/CombatManager.java:3845-3851`)] The settings manager's answer is covered on [Hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics). An explosion sets it by a different path. :cite[(`zombie/CombatManager.java:3853-3857`)]

The zombie action group then moves the zombie into a ragdoll state. For example, `falldown` goes to `falldown-ragdoll` when `canRagdoll` and `usePhysicHitReaction` are both true. :cite[(`media/actiongroups/zombie/falldown/to_falldown-ragdoll.xml`)] The action group has 23 state folders with "ragdoll" in the name. :cite[(`media/actiongroups/zombie`)] How action groups and transitions work is on [Action groups and states](/pz/build-42/engine/animation-system/action-groups-and-states).

### The animation node

The node is an ordinary AnimSet node with `m_isRagdoll` set. At parse time the engine adds a required condition `canRagdoll` equal to true. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:225-231`)]

The node fields that the ragdoll code reads are these. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:75-91`)]

| Node field | Default | Meaning | Code |
|---|---|---|---|
| `m_isRagdoll` | false | The node plays a ragdoll track | :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:75-78`)] |
| `m_ragdollStartTimeMin` | 0 | Earliest start of the ragdoll, in seconds into the node | :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:83-85`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:921-923`)] |
| `m_ragdollStartTimeMax` | 0 | Latest start; a random time between min and max is chosen | :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:86-88`, `zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:922-923`)] |
| `m_ragdollMaxTime` | 5.0 | The ragdoll track's duration value | :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:89-91`, `zombie/core/skinnedmodel/animation/AnimationTrack.java:468-474`)] |
| `m_chanceToRagdoll` | 1.0 | Parsed, but no code reads it | :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:79-82`)] |

Of the 56 vanilla nodes with `m_isRagdoll` true, 44 set both `m_ragdollStartTimeMin` and `m_ragdollStartTimeMax`, 2 set only the Max, and 10 set neither. None sets `m_ragdollMaxTime` or `m_chanceToRagdoll`. :cite[(`media/AnimSets/zombie`)]

The start time decides what the player sees first. The layer picks a random start between min and max, and then forces the start to 0 whenever the debug option `physicsHitReaction` is true. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:921-926`)]

That option is debug-only and defaults to true, and a debug-only option returns its default value when the game is not in debug mode. So in a normal game every ragdoll node starts as a ragdoll at once, and the min and max times matter only when someone in debug mode turns the option off. :cite[(`zombie/debug/options/Character.java:54`, `zombie/debug/BooleanDebugOption.java:35-37`)]

If the start time is about 0 (within 0.01), the node begins as a ragdoll with no clip underneath. Otherwise the clip plays and the ragdoll track fades up over it. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimLayer.java:928-947`)]

The blend weight rises from 0 to 1 over the node's `m_BlendTime` once the clip time passes the start time. :cite[(`zombie/core/skinnedmodel/advancedanimation/LiveAnimNode.java:263-307`)] A canned fall can therefore start playing, then hand over to the physics body part way through.

### The controller wakes up

The animation player creates the controller the first time it updates ragdoll tracks, and only if `canRagdoll()` is true. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:663-667`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1337-1349`)] At that moment the character's `onRagdollSimulationStarted` slides it away from walls by 0.5. :cite[(`zombie/characters/IsoGameCharacter.java:4268-4271`)]

`initialize` runs on the controller's first update. It waits until the animation player is ready, then resets the state data, marks the body as simulating, adds it to the native world, uploads the skeleton pose and sets the body active. :cite[(`zombie/core/physics/RagdollController.java:172-189`)] If the animation player is not ready it logs a warning and tries again next frame. :cite[(`zombie/core/physics/RagdollController.java:184-186`)]

Adding to the world converts the character's position with the coordinate rule from [Inside the physics engine](/pz/build-42/engine/physics-and-ragdolls/inside-the-physics-engine#the-coordinate-rule), builds a yaw-only rotation from the character's facing angle, and calls `Bullet.addRagdoll`. :cite[(`zombie/core/physics/RagdollController.java:224-233`, `zombie/core/physics/RagdollController.java:524-537`)] A static counter tracks how many bodies are in the world, and `canRagdoll()` compares it with the player's maximum. :cite[(`zombie/core/physics/RagdollController.java:226-227`, `zombie/characters/IsoGameCharacter.java:16414`)]

## While it runs

Each frame the controller steps its body and copies the result into the character's pose, then measures where the body went.

`update` calls `simulateRagdoll`, reads the simulation state, applies any pending hit impulse, and returns the body's world position and rotation. :cite[(`zombie/core/physics/RagdollController.java:267-285`)] `simulateRagdoll` pushes the character's position and facing into the native body, then calls `Bullet.simulateRagdollWithRigidBodyOutput`, which fills a 245-float bone buffer and a 77-float rigid body buffer. :cite[(`zombie/core/physics/RagdollController.java:48-49`, `zombie/core/physics/RagdollController.java:495-511`)]

The bone buffer is written into a clip the animation player keeps for this purpose. Each bone has two keyframes, the previous and the current, and positions are divided by 1.5 and negated as they are copied into the clip. The very first frame after adding the body is skipped. :cite[(`zombie/core/physics/RagdollController.java:551-592`, `zombie/core/physics/RagdollController.java:714-723`)] The clip is created by the animation player, as the [animation unit](/pz/build-42/engine/animation-system/skinned-models-and-clips) describes.

The startup upload does the reverse. It copies the animation's current bone transforms into the body so the ragdoll starts in the character's current pose. When the debug option `enableInitialVelocities` is true, the upload also carries bone velocities. That option is debug-only and defaults to true, so it is true in a normal game. :cite[(`zombie/core/physics/RagdollController.java:243-265`, `zombie/core/physics/RagdollController.java:594-624`, `zombie/debug/options/Character.java:45`)]

### After the step

`postUpdate` measures the body with two methods, `calculateSimulationData` and `updateSimulationTimeout`. :cite[(`zombie/core/physics/RagdollController.java:287-291`)] The measurements are the head and pelvis world positions, taken from the animated bones. :cite[(`zombie/core/physics/RagdollController.java:775-776`)]

From those the controller works out four things.
- **Where the character should stand.** The desired position moves by how far the pelvis moved since the last frame, with its height rounded to one decimal. :cite[(`zombie/core/physics/RagdollController.java:783-788`)]
- **Whether the body is moving.** A head or pelvis move of more than 0.01 marks movement and lifts the timeout back to at least 1.5. :cite[(`zombie/core/physics/RagdollController.java:789-805`)]
- **Whether it is upright.** It is upright when the head is higher than bone 0 plus 0.4 (0.6 minus 0.2). The character's `onFloor` is set to the opposite. :cite[(`zombie/core/physics/RagdollController.java:807-810`)]
- **Which way it lies.** The controller uses the shoulder and pelvis positions to decide front or back, and writes the direction into the state data. It also sets `fallOnFront` and `ragdollFall`. :cite[(`zombie/core/physics/RagdollController.java:811-850`)]

## How it ends

A ragdoll ends when the native body is asleep and no movement has been seen for the whole timeout.

`updateSimulationTimeout` counts the timeout down by the game time delta. When there is no movement and the timeout has reached 0, and the native state is `ISLAND_SLEEPING`, it sets `isSimulating` false and deactivates the body. :cite[(`zombie/core/physics/RagdollController.java:293-307`, `zombie/core/physics/RagdollController.java:931-939`)] While the body is asleep and the head and pelvis are not moving, the timeout also drains 10 times faster. :cite[(`zombie/core/physics/RagdollController.java:795-798`)]

A ragdoll track reports itself finished when its simulation is no longer active. :cite[(`zombie/core/skinnedmodel/animation/AnimationTrack.java:665-667`)] When the character has no ragdoll tracks left, the animation player releases the controller, which removes the body from the world and clears the flags it set. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:647-660`, `zombie/core/physics/RagdollController.java:191-201`, `zombie/core/physics/RagdollController.java:235-241`)]

Touching a vehicle keeps the ragdoll alive: contact resets the timeout to 1.5. :cite[(`zombie/core/physics/RagdollController.java:792-794`)]

## Handing back to animation

The ragdoll moves the character, not just the skin, and the hand-back to normal animation happens through the zombie states.

While the body moves, the animation player turns the pelvis motion into deferred movement. It only does this when the direction has been calculated and the character is fully ragdolling, and the character moves by that amount. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:672-684`, `zombie/characters/IsoGameCharacter.java:1704-1718`)] The total ragdoll weight comes from the blend weights of all live ragdoll tracks, clamped to 0..1. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:692-702`)]

The zombie state `ZombieRagdollOnGroundState` is the resting state. It starts the reanimate timer on entry, unless the zombie is dead, fake dead or becoming a crawler, and while it runs it counts the timer down and restarts it if another character is standing on the zombie. :cite[(`zombie/ai/states/ZombieRagdollOnGroundState.java:30-61`)] The standing zombie's state map registers it for `onground-ragdoll`, and the crawling zombie's map registers it for `falldown-ragdoll`. :cite[(`zombie/characters/IsoZombie.java:695`, `zombie/characters/IsoZombie.java:757`)]

Getting back up is not covered here. The one transition that leaves `onground-ragdoll` for `hitreaction` needs the hit reaction to be `Floor`, the zombie to be alive and `isRagdoll` to be false. :cite[(`media/actiongroups/zombie/onground-ragdoll/to_hitreaction.xml`)]

If the zombie dies while ragdolling, the dead body can keep the pose. It needs `ragdollFall` set and a character that may use its current pose, which the game refuses when the zombie is scene-culled, has no active model or has no animation player. When both hold, the corpse copies the bone transforms, and the save writes them with the flag. The pose is not kept on a multiplayer client or server. :cite[(`zombie/iso/objects/IsoDeadBody.java:353-360`, `zombie/iso/objects/IsoDeadBody.java:998-1010`, `zombie/characters/IsoGameCharacter.java:1235-1248`)]

## Vehicle contact

A zombie ragdoll in contact with a vehicle gets different body dynamics while it touches.

`IsoZombie` calls the controller's `vehicleCollision` when it is ragdolling and has a vehicle to test. :cite[(`zombie/characters/IsoZombie.java:3320-3322`)] On first contact the controller sends a body-dynamics set to the native side; when contact ends it resets them. :cite[(`zombie/core/physics/RagdollController.java:870-889`)] The set is built from the body-dynamics block at list position 0, with its friction replaced by `vehicleCollisionFriction`, which starts at 0.4. :cite[(`zombie/core/physics/RagdollController.java:47`, `zombie/core/physics/RagdollController.java:891-908`)]

## The four script files

The ragdoll scripts are four plain script files, each a list of `ragdoll` blocks, and the block's name decides which kind it is.

`RagdollScript.Load` reads the top block of a file and picks the kind by checking whether the block id contains `_constraint`, `_anchor`, `_bodypartinfo` or `_bodydynamics`. :cite[(`zombie/scripting/objects/RagdollScript.java:117-131`)] The files in the capture are named `ragdoll_constraints.txt`, `ragdoll_anchors.txt`, `ragdoll_bodypartinfo.txt` and `ragdoll_bodydynamics.txt`, all in `media/scripts/ragdolls/`, each inside `module Base`. :cite[(`media/scripts/ragdolls`)]

Each line is `key = value,`. The reader splits the line at `=`, trims both sides, and parses the value as an integer, float, boolean or three floats separated by spaces. :cite[(`zombie/scripting/objects/RagdollScript.java:184-318`, `zombie/scripting/objects/BaseScriptObject.java:266-269`)] A key that is not one the reader knows is ignored without a message. A value that contains a second `=` is cut at it. :cite[(`zombie/scripting/objects/RagdollScript.java:189-191`)]

After all scripts load, `RagdollScript.toBullet(false)` uploads the four lists to the native side as flat float arrays. It does nothing on a dedicated server. :cite[(`zombie/scripting/ScriptManager.java:641-657`, `zombie/scripting/objects/RagdollScript.java:108-115`)]

The numbers a script holds are indexes. A body part number is a position in `RagdollBodyPart`, a joint number is a position in `RagdollJoint`, and a bone number is a position in the 35 skeleton bones.

:::chips
- 0 pelvis
- 1 spine
- 2 head
- 3 left upper leg
- 4 left lower leg
- 5 right upper leg
- 6 right lower leg
- 7 left upper arm
- 8 left lower arm
- 9 right upper arm
- 10 right lower arm
:::

:cite[(`zombie/core/physics/RagdollBodyPart.java:12-23`)]

The joints are, in order, pelvis-spine (0), spine-head (1), left hip (2), left knee (3), right hip (4), right knee (5), left shoulder (6), left elbow (7), right shoulder (8) and right elbow (9). :cite[(`zombie/core/physics/RagdollJoint.java:12-21`)]

### Anchors

An anchor ties one skeleton bone to one ragdoll body part. There is one block per bone, 34 in all; the skeleton has 35 bones, and the 35th, `Translation_Data`, has no anchor.

| Field | Type | Meaning | Code |
|---|---|---|---|
| `bone` | int | Skeleton bone number | :cite[(`zombie/scripting/objects/RagdollScript.java:233-234`)] |
| `bodyPart` | int | Body part the bone follows | :cite[(`zombie/scripting/objects/RagdollScript.java:235-236`)] |
| `enabled` | boolean | Whether the anchor is used | :cite[(`zombie/scripting/objects/RagdollScript.java:237-238`)] |
| `reverse` | boolean | Reverse flag | :cite[(`zombie/scripting/objects/RagdollScript.java:239-240`)] |
| `original` | boolean | Original flag | :cite[(`zombie/scripting/objects/RagdollScript.java:241-242`)] |

All five values are sent to the native side in that order: bone, body part, reverse, original, enabled. :cite[(`zombie/scripting/objects/RagdollScript.java:372-385`)] The debug window shows `reverse` and `original` only under an advanced option. :cite[(`zombie/debug/debugWindows/RagdollDebugWindow.java:221-234`)] What the native code does with them is not verified.

In vanilla, 10 of the 34 anchors are enabled: the pelvis, spine 1, both thighs, both calves, both upper arms and both forearms. The other 24 are disabled, among them the head, neck, hands, feet and the dress and backpack bones. Four anchors set `reverse` true (both thighs and both calves), and none sets `original` true. :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt`)]

### Body dynamics

A body-dynamics block sets how one body part loses speed and goes to sleep. There is one per body part, 11 in all.

| Field | Type | Vanilla value | Code |
|---|---|---|---|
| `part` | int | 0 to 10 | :cite[(`zombie/scripting/objects/RagdollScript.java:290-291`)] |
| `linearDamping` | float | 0.05 for every part | :cite[(`zombie/scripting/objects/RagdollScript.java:292-294`)] |
| `angularDamping` | float | 0.989 for both upper arms, 0.85 for the others | :cite[(`zombie/scripting/objects/RagdollScript.java:295-297`)] |
| `deactivationTime` | float | 0.8 for every part | :cite[(`zombie/scripting/objects/RagdollScript.java:298-300`)] |
| `linearSleepingThreshold` | float | 1.6 for every part | :cite[(`zombie/scripting/objects/RagdollScript.java:301-303`)] |
| `angularSleepingThreshold` | float | 2.5 for every part | :cite[(`zombie/scripting/objects/RagdollScript.java:304-306`)] |
| `friction` | float | 1.5 for every part | :cite[(`zombie/scripting/objects/RagdollScript.java:307-309`)] |
| `rollingFriction` | float | 0.5 for every part | :cite[(`zombie/scripting/objects/RagdollScript.java:310-312`)] |

The values are those in the capture's file. :cite[(`media/scripts/ragdolls/ragdoll_bodydynamics.txt`)] The upload sends 8 floats per block. :cite[(`zombie/scripting/objects/RagdollScript.java:387-403`)] The block at list position 0 is used for the vehicle contact set described above, and in the vanilla file that block is the left upper arm. :cite[(`zombie/characters/RagdollBuilder.java:81`, `media/scripts/ragdolls/ragdoll_bodydynamics.txt:3-13`)]

### Body part info

A body-part block sets the size, shape and weight of one body part. There is one per part, 11 in all.

| Field | Type | Meaning | Code |
|---|---|---|---|
| `part` | int | Body part number | :cite[(`zombie/scripting/objects/RagdollScript.java:258-259`)] |
| `calculateLength` | boolean | Whether the length is worked out rather than taken from `height` | :cite[(`zombie/scripting/objects/RagdollScript.java:260-261`)] |
| `radius` | float | Shape radius | :cite[(`zombie/scripting/objects/RagdollScript.java:262-263`)] |
| `height` | float | Shape height | :cite[(`zombie/scripting/objects/RagdollScript.java:264-265`)] |
| `gap` | float | Gap | :cite[(`zombie/scripting/objects/RagdollScript.java:266-267`)] |
| `shape` | int | 0 capsule, 1 box, 2 sphere (the debug window's labels) | :cite[(`zombie/scripting/objects/RagdollScript.java:268-269`, `zombie/debug/debugWindows/RagdollDebugWindow.java:33`)] |
| `mass` | float | Mass of the part | :cite[(`zombie/scripting/objects/RagdollScript.java:270-271`)] |
| `offset` | 3 floats | Offset of the body from its bone | :cite[(`zombie/scripting/objects/RagdollScript.java:272-274`)] |

The comments on `calculateLength` and `gap` are from the field names and the debug window, not from the native code, which is not verified. :cite[(`zombie/scripting/objects/RagdollScript.java:352-370`, `zombie/debug/debugWindows/RagdollDebugWindow.java:329-340`)]

In vanilla the pelvis, spine and head are shape 1 (box) and every limb is shape 0 (capsule). The 11 masses add up to 1.0, and the body mass setting defaults to 70, which suggests the masses are fractions of it. That reading is not verified against the native code. :cite[(`media/scripts/ragdolls/ragdoll_bodypartinfo.txt`, `zombie/characters/RagdollBuilder.java:35`)]

### Constraints

A constraint block joins two body parts with a hinge or a cone twist. There is one per joint, 10 in all.

| Field | Type | Meaning | Code |
|---|---|---|---|
| `joint` | int | Joint number | :cite[(`zombie/scripting/objects/RagdollScript.java:192-193`)] |
| `constraintType` | int | 4 hinge, 5 cone twist (the debug window's labels) | :cite[(`zombie/scripting/objects/RagdollScript.java:194-195`, `zombie/debug/debugWindows/RagdollDebugWindow.java:31-34`)] |
| `constraintPartA`, `constraintPartB` | int | The two body parts joined | :cite[(`zombie/scripting/objects/RagdollScript.java:196-199`)] |
| `constraintAxisA`, `constraintAxisB` | 3 floats | Axis on each part | :cite[(`zombie/scripting/objects/RagdollScript.java:200-205`)] |
| `constraintPositionOffsetA`, `constraintPositionOffsetB` | 3 floats | Attachment point on each part | :cite[(`zombie/scripting/objects/RagdollScript.java:206-211`)] |
| `constraintLimit` | 3 floats | Limit angles | :cite[(`zombie/scripting/objects/RagdollScript.java:212-214`)] |
| `constraintLimitExtended` | 3 floats | Extended limit angles; no vanilla block sets it | :cite[(`zombie/scripting/objects/RagdollScript.java:215-217`)] |

All 22 values per block are uploaded, in the order of the fields above. :cite[(`zombie/scripting/objects/RagdollScript.java:320-350`)] In vanilla, 5 joints are hinges (type 4): both knees, both elbows and pelvis-spine. The other 5 are cone twists (type 5): both hips, both shoulders and spine-head. :cite[(`media/scripts/ragdolls/ragdoll_constraints.txt`)]

### Editing and live updates

The same four lists can be changed while the game runs, through the debug window, and written back out.

Each list has a `liveUpdate` upload, and a reset-to-default method that copies the stored default back and uploads again. :cite[(`zombie/scripting/objects/RagdollScript.java:133-182`)] The debug window's "Update toBullet()" buttons call these. :cite[(`zombie/debug/debugWindows/RagdollDebugWindow.java:181`, `zombie/debug/debugWindows/RagdollDebugWindow.java:246`)] The write-back methods write to the file that holds the script's original definition. :cite[(`zombie/scripting/objects/RagdollScript.java:405-420`)] A mod gets the same effect by overriding the script files, which is shown step by step on [Modding physics and ragdolls](/pz/build-42/engine/physics-and-ragdolls/modding-physics-and-ragdolls).

## Which characters can ragdoll

Whether a character may ragdoll is one method with six tests, run in this order.

`canRagdoll` returns false when any of these hold, checked in order. :cite[(`zombie/characters/IsoGameCharacter.java:16405-16419`)]
1. The game is a multiplayer client or a dedicated server.
2. The debug option `animation.disableRagdolls` is on.
3. The player's option `usePhysicsHitReaction` is off.
4. The character has no controller yet and the number of active ragdoll bodies has reached the player's maximum.
5. The character wears an item tagged `NoRagdoll`.
6. The character's current AI state says no.

A server option test sits between 3 and 4 in the code, `usePhysicsHitReaction` in `ServerOptions`, but test 1 has already returned for a server, so it is never reached. :cite[(`zombie/characters/IsoGameCharacter.java:16412-16413`, `zombie/network/ServerOptions.java:219`)] The option screens and the maximum are covered on [How physics and ragdolls work](/pz/build-42/engine/physics-and-ragdolls/how-physics-and-ragdolls-work).

Animals never ragdoll, because `IsoAnimal.canRagdoll` returns false. :cite[(`zombie/characters/animals/IsoAnimal.java:3485-3487`)] The state test defaults to true, and the climbing-fence state turns it off for a zombie on the floor or a character climbing a fence. :cite[(`zombie/ai/IStateFlagsSource.java:38-40`, `zombie/ai/states/ClimbOverFenceState.java:672-675`)]

The worn-item test is refreshed whenever worn items change, and the tag it looks for is `NoRagdoll`. :cite[(`zombie/scripting/objects/ItemTag.java:304`)] :cite[(`zombie/characters/IsoGameCharacter.java:3544-3553`)]

## How we know

:::callout[How we know]{kind=proof}
- Every engine claim is from the 42.22 decompiled source and the game's script and AnimSet files in capture B42_3d39148846.
- Not verified: the native meaning of every script value (anchor `reverse` and `original`, `gap`, `calculateLength`, the limit triples, whether the masses are fractions). The labels for `shape` and `constraintType` come from the debug window's own combo lists.
- Not verified: how the native body maps a pelvis position onto the character beyond the Java code shown, and whether any shipped path turns `physicsHitReaction` off outside debug mode.
- `RagdollController.simulateHitReaction0` has no caller in the capture, so it is not described here. A branch inside the live hit method that would detach a joint is written as `false & ...` and never runs. :cite[(`zombie/core/physics/RagdollController.java:351-355`, `zombie/core/physics/RagdollController.java:361-447`)]
- Nothing on this page was run in a game.
:::
