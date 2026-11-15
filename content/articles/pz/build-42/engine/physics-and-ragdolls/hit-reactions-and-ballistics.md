---
id: build-42-hit-reactions-and-ballistics
slug: hit-reactions-and-ballistics
title: 'Hit reactions and ballistics'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: advanced
tags:
  - engine
  - physics
  - ballistics
  - combat
  - ragdolls
  - modding
excerpt: >-
  How a Build 42.22 shot picks a body part and a reaction, how the physics hit reaction script turns that into a push on a ragdoll, and what the ballistics controller asks the native library.
last_updated: '2026-11-14'
related_articles:
  - how-physics-and-ragdolls-work
  - inside-the-physics-engine
  - ragdolls
  - physics-shapes-and-objects
  - modding-physics-and-ragdolls
  - physics-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#picking-a-body-part-and-a-reaction) | [script authors](#the-physics-hit-reaction-script) | new players should start at [How physics and ragdolls work](/pz/build-42/engine/physics-and-ragdolls/how-physics-and-ragdolls-work)

:::callout[The 1-minute version]{kind=key}
- Two systems meet in a shot. The ballistics controller asks the native library what a shot touches and which body part is under the reticle. The combat code then picks a hit reaction, and the physics hit reaction script says how hard to push the ragdoll.
- The push only happens for a character that may ragdoll, and `canRagdoll()` is false on a multiplayer client and on a dedicated server. In that case the normal animated hit reaction plays instead.
- The physics hit reaction script holds one block per ammo type or thrown item, each with 11 forward values and 11 upward values, one per ragdoll body part. A type with no block gets 80 forward and 40 upward.
- The ballistics controller is not created on a dedicated server, and every query method returns nothing there. The native library itself is not readable, so what the trace does inside it is not verified.
:::

:::facts
- **Physics hit reaction blocks** 10 in the vanilla file: 8 named like ammo types (7 of them match an engine ammo type) and 2 named like thrown items :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt`)]
- **Values per block** 22 (11 forward, 11 upward) :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt`, `zombie/scripting/objects/PhysicsHitReaction.java:18-19`)]
- **Fallback when no block matches** 80 forward, 40 upward :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:114-168`)]
- **Chance of a physics reaction** 100 percent when the player option is on and no hit location is forced, a fixed number in the code :cite[(`zombie/core/physics/RagdollSettingsManager.java:269-271`)]
- **Ballistics limits** 20 trace targets, 10 camera targets, 9 spread locations :cite[(`zombie/core/physics/BallisticsController.java:38-43`)]
- **Hit reactions in the enum** 29 named values plus `NONE` :cite[(`zombie/combat/HitReaction.java:10-39`)]
:::

## The parts

A shot touches four pieces of code: the combat manager, the ballistics controller and target, the ragdoll controller and the hit reaction script.

::::cards
:::card[CombatManager]{accent=orange}
Decides who was hit, which body part, and which named hit reaction the target plays. It also stores a record of the hit for the ragdoll.
:::
:::card[BallisticsController]{accent=blue}
One per shooter. It sends the muzzle and reticle to the native library and reads back the targets and body parts.
:::
:::card[BallisticsTarget]{accent=purple}
One per character that can be hit. It registers the character's skeleton with the native library and carries the record of the last hit.
:::
:::card[PhysicsHitReactionScript]{accent=cream}
The table of push strengths per ammo type or thrown item and body part. The ragdoll controller reads it when it applies the push.
:::
::::

## Picking a body part and a reaction

For a shot, the combat manager first asks whether the physics library reported a body part under the reticle, and only if it did not does it pick one at random from the angle.

:::flow[From a hit to a push]
- `processHit` is called for the target
- It sets whether this hit may use a physics reaction
- It takes the body part from the physics library, or picks a reaction from the shot angle
- It stores a hit record on the target's ballistics target
- The ragdoll controller reads the record and applies a push
:::

`processHit` begins by reading the wielder's `ZombieHitReaction` variable and computing a shot direction. :cite[(`zombie/CombatManager.java:2962-2965`)] If the reaction is `Shot` and the target is one of the shooter's camera targets, the body part comes from the cached native result and `processTargetedHit` picks the reaction. :cite[(`zombie/CombatManager.java:2966-2977`)] Otherwise `resolveHitReaction` picks it from the shot direction and whether the hit was critical. :cite[(`zombie/CombatManager.java:2975-2981`, `zombie/CombatManager.java:2922-2960`)]

### The shot direction

The direction is a roll weighted by the angle between the shooter's and the target's facing. For an angle under 45 degrees, a nine-way roll gives left (2 in 9), right (2 in 9) or south (5 in 9); the other angle bands mix left, right, north and south with fixed odds. :cite[(`zombie/CombatManager.java:3046-3085`)] Because the roll is random, the same shot from the same spot can land as a different reaction.

### From the angle to a reaction

When the physics library reports no body part, the angle picks the reaction. A critical hit from north gives `ShotHeadBwd`, and from south gives one of the two forward head reactions at even odds. From the left or right, a critical hit gives `ShotHeadBwd` one time in four. All other cases roll a belly, chest, leg or shoulder reaction. :cite[(`zombie/CombatManager.java:2922-2960`)]

This matches the head-shot rule on [Firearm accuracy and damage](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage), which was written for build 42.21.

### From a body part to a reaction

When the library does report a body part, the reaction follows it, with a random choice in some cases. :cite[(`zombie/CombatManager.java:3395-3440`)]

| Body part from the library | Reaction chosen | Code |
|---|---|---|
| Pelvis | `ShotBellyStep` (branches written after it look unreachable) | :cite[(`zombie/CombatManager.java:3401-3410`)] |
| Spine | `ShotChest` (same note) | :cite[(`zombie/CombatManager.java:3411-3418`)] |
| Head | `ShotHeadFwd` or `ShotHeadFwd02` (same note) | :cite[(`zombie/CombatManager.java:3419-3424`)] |
| Left upper or lower leg | `ShotLegL` | :cite[(`zombie/CombatManager.java:3425`)] |
| Right upper or lower leg | `ShotLegR` | :cite[(`zombie/CombatManager.java:3426`)] |
| Left upper or lower arm | `ShotShoulderStepL` if hit from behind, else `ShotShoulderL` | :cite[(`zombie/CombatManager.java:3427`)] |
| Right upper or lower arm | `ShotShoulderStepR` if hit from behind, else `ShotShoulderR` | :cite[(`zombie/CombatManager.java:3428`)] |

The "same note" cases come from the decompiled code, where a `yield` appears to end each of the pelvis, spine and head cases, so the direction-based variants written after it look unreachable. The decompiler's own header says to verify subtle control flow against bytecode, and that was not done here. :cite[(`zombie/CombatManager.java:3401-3424`)]

After the reaction is chosen, a zombie that is eating a body gets `OnKnees` or `Eating` instead, and the reaction string is stored on the target. :cite[(`zombie/CombatManager.java:3432-3436`)]

### The hit record

The hit record is what the ragdoll later reads. `createCombatData` fills it only when the target both uses a physics hit reaction and can ragdoll, and only if the target already has a ballistics target. :cite[(`zombie/CombatManager.java:3442-3456`)] It stores the reaction name, the target, the attacker, the weapon, an optional trap and the ragdoll body part, and marks the record as not yet processed. :cite[(`zombie/core/physics/BallisticsTarget.java:250-258`, `zombie/CombatManager.java:3446-3454`)]

For a hit that did not come from a camera target, the body part is picked from the reaction: head reactions give the head, chest reactions the spine, belly reactions the pelvis, leg reactions a random upper or lower leg on the shot side, and shoulder reactions a random upper or lower arm. :cite[(`zombie/CombatManager.java:3008-3040`)]

## Whether a hit may use a physics reaction

Each hit decides, once, whether the target gets a physics reaction or the normal animated one.

`CombatManager.setUsePhysicHitReaction` runs at the start of `processHit`. It sets the flag false when `canRagdoll()` is false. Otherwise it sets the flag to the settings manager's answer, and only for a ranged weapon. :cite[(`zombie/CombatManager.java:2964`, `zombie/CombatManager.java:3845-3851`)]

A melee weapon therefore never sets the flag here. An explosion sets the flag through a separate method that does not test for a ranged weapon. :cite[(`zombie/CombatManager.java:3854-3858`)]

The settings manager's answer is simple in a normal game. With no forced hit location, it returns false when the player's `usePhysicsHitReaction` option is off, and otherwise rolls against `getSandboxHitReactionFrequency`, which returns the constant 100. :cite[(`zombie/core/physics/RagdollSettingsManager.java:106-112`, `zombie/core/physics/RagdollSettingsManager.java:269-271`)] Despite its name, that method reads no sandbox option, and the capture's sandbox option list has none for physics or ragdolls. :cite[(`api/sandbox_options.jsonl`)]

The manager also has a forced-location mode, set from the debug window only. With a location forced, the answer comes from per-body-part debug settings instead. :cite[(`zombie/core/physics/RagdollSettingsManager.java:59-105`, `zombie/debug/debugWindows/RagdollDebugWindow.java:282-300`)]

In multiplayer the flag always ends up false, because `canRagdoll()` returns false first. :cite[(`zombie/characters/IsoGameCharacter.java:16405-16407`)] The hit reaction string is still set, so the canned animation plays.

## The physics hit reaction script

The physics hit reaction script is a table of push strengths, one block per ammo type or thrown item.

`PhysicsHitReactionScript.Load` reads the top block of a file. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:36-42`)] The block id decides what the block is for. The engine first tries it as an ammo type, and if that fails it resolves it as an item type, so a thrown item gets its block by item name. The code does not check that the name is a real item. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:47-51`)]

The ammo types the engine registers are `bullets_3030`, `bullets_308`, `bullets_357`, `bullets_38`, `bullets_44`, `bullets_45`, `bullets_556`, `bullets_9mm`, `cap_gun_cap` and `shotgun_shells`. :cite[(`zombie/scripting/objects/AmmoType.java:15-24`)]

### What a block holds

Each line is `key = value,`. A key that contains `impulse_` adds a forward value, and a key that contains `upwardImpulse_` adds an upward value. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:53-64`)]

The values are stored by order, not by name. Line 1 of the forward values is the pelvis, line 2 is the spine, and so on through the 11 body parts, in the order of the `RagdollBodyPart` list on [Ragdolls](/pz/build-42/engine/physics-and-ragdolls/ragdolls#the-four-script-files). The words after `impulse_` (such as `left_upper_leg`) are labels only. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:58-62`, `zombie/scripting/objects/PhysicsHitReaction.java:18-19`)]

Each array holds 11 values, so a block with a twelfth `impulse_` line would run past the array. A block with fewer lines leaves the rest at 0. :cite[(`zombie/scripting/objects/PhysicsHitReaction.java:18-19`)] The behavior with too many lines is read from the code, and was not run.

A value that cannot be read as a float throws, and the line is cut at a second `=` as in the other script readers. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:55-59`)]

Two more fields exist on the in-memory object, `useImpulseOverride` and the two override numbers, but the script reader never sets them. Only the debug panel does. :cite[(`zombie/scripting/objects/PhysicsHitReaction.java:13-17`, `zombie/debug/debugWindows/PhysicsHitReactionsPanel.java:90-116`)]

### The lookup

A lookup scans the blocks in file order and returns the value from the earliest block that matches, or a default. There are four lookups, forward and upward, each by ammo type or by item name. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:114-168`)]

If no block matches, a forward lookup returns 80 and an upward lookup returns 40. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:125`, `zombie/scripting/objects/PhysicsHitReactionScript.java:153`)] In vanilla, `bullets_3030`, `bullets_357` and `cap_gun_cap` have no block and use these defaults. :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt`, `zombie/scripting/objects/AmmoType.java:15-24`)]

### What vanilla ships

The vanilla file is `media/scripts/generated/physics/physics_hit_reactions.txt`, a single `module Base` with 10 blocks. :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt`)] The table lists the forward value for a few body parts and the upward value for the same parts. The full 22 values for every block are on [Physics reference](/pz/build-42/engine/physics-and-ragdolls/physics-reference).

| Block | Forward: pelvis, head, left upper leg, left upper arm | Upward: pelvis, head, left upper leg, left upper arm | Code |
|---|---|---|---|
| `bullets_44` | 40, 30, 30, 20 | 40, 10, 20, 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:3-27`)] |
| `bullets_45` | 20, 20, 20, 10 | 20, 5, 10, 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:29-53`)] |
| `bullets_223` | 40, 40, 30, 20 | 40, 10, 20, 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:55-79`)] |
| `bullets_38` | 20, 20, 20, 10 | 20, 5, 10, 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:81-105`)] |
| `bullets_308` | 60, 60, 60, 60 | 40, 15, 40, 40 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:107-131`)] |
| `shotgun_shells` | 80, 80, 50, 10 | 40, 20, 40, 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:133-157`)] |
| `bullets_556` | 50, 50, 45, 40 | 40, 10, 20, 20 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:159-183`)] |
| `bullets_9mm` | 20, 10, 20, 10 | 20, 5, 10, 10 | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:185-209`)] |
| `PipeBomb` | 700 for every part | 70 for every part | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:211-235`)] |
| `Aerosolbomb` | 200 for every part | 40 for every part | :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:237-261`)] |

One block name does not match an engine ammo type: `bullets_223`. The ammo type list has no `bullets_223`, so that block takes the item-type branch, and a bullet lookup by ammo type never reaches it. :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt:55`, `zombie/scripting/objects/AmmoType.java:15-24`, `zombie/scripting/objects/PhysicsHitReactionScript.java:47-51`)] None of the 7 weapon physics object names listed below is `bullets_223` either. Whether that block was meant for the 5.56 ammo is not verified.

The two thrown items are matched by the weapon's `PhysicsObject` value. In the generated weapon file, 7 distinct values appear: `Base.Aerosolbomb`, `Base.Firecracker`, `Base.FlameTrap`, `Base.Molotov`, `Base.NoiseTrap`, `Base.PipeBomb` and `Base.SmokeBomb`, so 5 of them have no block and use the default. :cite[(`media/scripts/generated/items/weapon.txt`)] The explosive lookup is used only when the weapon has no ammo type and is flagged explosive, which is its display category being `Explosives`. :cite[(`zombie/core/physics/RagdollController.java:329-340`, `zombie/inventory/types/HandWeapon.java:1478`)]

## Applying the push

The push is applied by the ragdoll controller, once, on its next update after the hit record exists.

`RagdollController.update` calls `simulateHitReaction` every frame. It returns at once unless the target's ballistics target has a hit record that is not processed and has a body part. :cite[(`zombie/core/physics/RagdollController.java:277`, `zombie/core/physics/RagdollController.java:309-313`)] It then marks the record processed and clears the character's hit reaction string. :cite[(`zombie/core/physics/RagdollController.java:314-319`)]

The push itself runs only when the debug option `physicsHitReaction` is true. That option is debug-only and defaults to true, so it is true outside debug mode. :cite[(`zombie/core/physics/RagdollController.java:320`, `zombie/debug/options/Character.java:54`, `zombie/debug/BooleanDebugOption.java:35-37`)]

For an ammo-type hit, the forward and upward values come from the script for the weapon's ammo type and the body part. For a hit with no ammo type, the push is skipped unless the weapon is explosive, in which case it uses the weapon's physics object. :cite[(`zombie/core/physics/RagdollController.java:329-340`)] The direction is the vector from the attacker to the target, normalized, and only its two ground components are used. :cite[(`zombie/core/physics/RagdollController.java:342-343`)]

The six-float buffer holds the forward push along the two ground axes, the upward value between them, and three zeros. The controller then calls `Bullet.applyImpulse` with the character's id and the body part number. :cite[(`zombie/core/physics/RagdollController.java:344-350`)] The unit of the values and how the native code scales them are not verified.

A second path, `simulateHitReaction0`, would pick the part from the reaction name and take the numbers from the settings manager, but nothing calls it. A joint-detach step in both methods is guarded by `false & ...` and never runs. :cite[(`zombie/core/physics/RagdollController.java:351-355`, `zombie/core/physics/RagdollController.java:361-447`)]

## The ballistics controller

The ballistics controller turns the weapon in a shooter's hand into a question for the native library: what is on this line?

`updateBallistics` creates the controller on first use and calls its `update`, and it does nothing at all on a dedicated server. :cite[(`zombie/characters/IsoGameCharacter.java:16437-16445`)] The controller needs the character's primary hand model to have a script with a `MUZZLE` attachment, and it logs a debug line and stops if any piece is missing. :cite[(`zombie/core/physics/BallisticsController.java:86-96`)]

When all pieces are there, it works out the muzzle's world position and direction, converts them to physics axes with the same height stretch as everywhere else, and sends three things to the native side: the muzzle position, the aim reticle's ground position and the muzzle's aim direction. :cite[(`zombie/core/physics/BallisticsController.java:97-110`)] The reticle position comes from `AimingReticle` for the character's player index. :cite[(`zombie/core/physics/BallisticsController.java:101-104`)]

It also sets the reticle's camera rotation once, as a yaw of 45 degrees and a pitch of minus 30 degrees. :cite[(`zombie/core/physics/BallisticsController.java:138-142`, `zombie/core/physics/BallisticsController.java:237-252`)] The weapon's range is the maximum range times its range modifier. :cite[(`zombie/core/physics/BallisticsController.java:115-116`)]

### The three queries

The controller asks the native library one of three questions, and reads the answer into a float array.

| Query | Native method | Floats per result | Most results | Code |
|---|---|---|---|---|
| Trace targets | `getBallisticsTargets` | 4: id, x, height, y | 20 | :cite[(`zombie/core/physics/BallisticsController.java:262-272`, `zombie/core/physics/BallisticsController.java:38-39`)] |
| Spread data (several pellets) | `getBallisticsTargetsSpreadData` | 4: id, x, height, y | 9 | :cite[(`zombie/core/physics/BallisticsController.java:290-302`, `zombie/core/physics/BallisticsController.java:42-43`)] |
| Camera targets (under the reticle) | `getBallisticsCameraTargets` | 5: id, x, height, y, body part | 10 | :cite[(`zombie/core/physics/BallisticsController.java:304-314`, `zombie/core/physics/BallisticsController.java:40-41`)] |

The camera-target query is the only one that returns a body part, stored as the fifth float. :cite[(`zombie/core/physics/BallisticsController.java:372-381`)] A result's height is divided by 2.44949 on the way back, the inverse of the coordinate rule. :cite[(`zombie/core/physics/BallisticsController.java:524-540`)] If no target is under the reticle, `getTargetedBodyPart` returns `BODYPART_COUNT`, which the combat code reads as "none". :cite[(`zombie/core/physics/BallisticsController.java:380`, `zombie/CombatManager.java:2975`)]

Every query method does nothing on a server except print a stack trace, and sets its count to 0. :cite[(`zombie/core/physics/BallisticsController.java:262-314`)]

### What the combat code does with them

For a ranged weapon the combat manager calls the controller each time it builds the hit list. :cite[(`zombie/CombatManager.java:2159`, `zombie/CombatManager.java:2187-2216`)]

- It registers every character in the hit list as a ballistics target, so the native side has a skeleton to trace against. :cite[(`zombie/CombatManager.java:2190-2196`)]
- For a weapon with range falloff, which is the pellet case, it asks for camera targets at range plus 0.5 and for spread data using the weapon's pellet count, spread and weight center. Otherwise it asks for camera targets and plain trace targets. :cite[(`zombie/CombatManager.java:2203-2216`)]
- It then drops any character from the hit list that the library did not report, as a trace target, camera target or spread target, and also drops a vehicle that was not hit. :cite[(`zombie/CombatManager.java:2219-2258`)]
- For a pellet weapon, it adds one extra copy of a hit for each additional pellet that landed on the same character. :cite[(`zombie/CombatManager.java:2260-2280`)]

When the shot is fired, the pellet case scales the spread angle by one over one plus the distance from the muzzle to the character's plane. :cite[(`zombie/CombatManager.java:3596-3604`, `zombie/core/physics/BallisticsController.java:216-235`)] The firing code reuses the cached spread data when it has it. :cite[(`zombie/CombatManager.java:3609-3617`)]

### Counts reset each frame

The controller's counts are cleared at the end of every character update, and a cached copy is kept for the combat code. `postUpdate` sets the three counts to 0, and `clearCacheTargets` clears the cached copies when the character's hand item changes to a weapon. :cite[(`zombie/core/physics/BallisticsController.java:442-446`, `zombie/core/physics/BallisticsController.java:485-489`, `zombie/characters/IsoGameCharacter.java:3405-3408`, `zombie/characters/IsoGameCharacter.java:10943-10944`)] That is why `processHit` reads the cached body part rather than the live one. :cite[(`zombie/CombatManager.java:2969`)]

## The ballistics target

A ballistics target is a character's presence in the native trace world.

`BallisticsTarget.add` is how a character is registered for tracing. It sets a release counter to 2, adds the character to the native world unless it was added before, sets the target's axes and position, and uploads the skeleton. If the character is ragdolling, the position is the ragdoll's pelvis. :cite[(`zombie/core/physics/BallisticsTarget.java:120-142`)] The skeleton upload packs the 35 skeleton bones as 7 floats each, with positions scaled by 1.5 and negated as the ragdoll does, and passes the animation player's own bone count alongside. :cite[(`zombie/core/physics/BallisticsTarget.java:144-181`)]

Each frame `update` refreshes the target. It does nothing on a server. The target is released when its hit record has been processed and the release counter has run down to 0. :cite[(`zombie/core/physics/BallisticsTarget.java:85-118`)] The character calls it from its update, except for animals. :cite[(`zombie/characters/IsoGameCharacter.java:9017-9021`, `zombie/characters/IsoGameCharacter.java:16472-16478`)]

`BallisticsTarget.add` has no server check of its own, so whether a dedicated server ever calls it is not verified here. :cite[(`zombie/core/physics/BallisticsTarget.java:120-142`)]

## What Lua can reach

Lua can read and set the two player options, and can read the scripts, but it cannot call the ballistics or the hit reaction table directly.

Through `Core`, Lua can call `getOptionUsePhysicsHitReaction`, `setOptionUsePhysicsHitReaction`, `getMaxActiveRagdolls` and `setMaxActiveRagdolls`. The vanilla options screen does so. :cite[(`api/api.jsonl`, `media/lua/client/OptionScreens/MainOptions.lua:732-771`)] Through `ScriptManager`, Lua can call `getPhysicsHitReactionScript`, `getRagdollScript`, `getPhysicsShape` and `getAllPhysicsShapes`. :cite[(`api/api.jsonl`)] Through `HandWeapon`, Lua can call `getPhysicsObject`, `setPhysicsObject` and `isExplosive`. :cite[(`api/api.jsonl`)]

`IsoGameCharacter` also exposes `setUsePhysicHitReaction`, `getBallisticsController` and `getBallisticsTarget`. :cite[(`api/api.jsonl`)] The classes `PhysicsHitReactionScript`, `BallisticsController`, `BallisticsTarget` and `RagdollSettingsManager` are not on the Lua-exposed class list, so a mod cannot be shown here to read or change the impulse table from Lua. :cite[(`api/lua_exposed.jsonl`)] The way a mod changes the table is by overriding the script file, as shown on [Modding physics and ragdolls](/pz/build-42/engine/physics-and-ragdolls/modding-physics-and-ragdolls).

## How we know

:::callout[How we know]{kind=proof}
- Every engine claim is from the 42.22 decompiled source and the game's own script files in capture B42_3d39148846. The firearm page's rule that a critical from the front or back is a head shot, and a critical from the side is a head shot one time in four, matches `resolveHitReaction` in 42.22 (the page's evidence is build 42.21).
- Not verified: what the native trace does with the muzzle, the reticle and each target's skeleton, how it chooses the body part under the reticle, and how it scales an impulse. Only the Java side of each call is read.
- Not verified: the `yield` that ends the pelvis, spine and head cases in `processTargetedHit` is read from decompiled code, and the decompiler header asks for a bytecode check of subtle control flow.
- Not verified: that a dedicated server never reaches `BallisticsTarget.add`, and what a client does in multiplayer after `canRagdoll()` returns false beyond the animated hit reaction.
- Not verified: that the `bullets_223` block is never used; it is read from the ammo type list and the 7 weapon physics object names, and no item script outside `weapon.txt` was checked.
- Nothing on this page was run in a game.
:::
