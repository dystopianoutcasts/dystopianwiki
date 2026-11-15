---
id: build-42-how-physics-and-ragdolls-work
slug: how-physics-and-ragdolls-work
title: 'How physics and ragdolls work'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: beginner
tags:
  - engine
  - physics
  - ragdolls
  - multiplayer
  - options
excerpt: >-
  When a zombie falls as a physics ragdoll in Build 42.22 and when it plays a canned fall, the two options that switch it, what a server owner can and cannot set, and what we do not know about cost.
last_updated: '2026-11-14'
related_articles:
  - inside-the-physics-engine
  - ragdolls
  - hit-reactions-and-ballistics
  - physics-shapes-and-objects
  - modding-physics-and-ragdolls
  - physics-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#the-two-player-options) | [server owners](#what-a-server-owner-can-and-cannot-set) | [modders](/pz/build-42/engine/physics-and-ragdolls/modding-physics-and-ragdolls)

:::callout[The 1-minute version]{kind=key}
- Ragdolls run only in single player. In 42.22, a multiplayer client and a dedicated server both refuse to start one, so in multiplayer every fall is the normal animation.
- There are two player options, both on the options screen under "Display & Performance". "Use Physics Hit Reactions" is on by default, and "Maximum Active Ragdolls" is a whole number from 5 to 60 that defaults to 20.
- A server owner cannot turn ragdolls on. The server has a `UsePhysicsHitReaction` option, default off, but it has no effect in 42.22, and no sandbox option mentions ragdolls or physics.
- In the vanilla files, only zombies have ragdoll states. A hit that sets the physics reaction flag, or a vehicle hit through the vehicle-attack transitions, can send a zombie into one, and the body then falls under physics for a short time.
- Performance was not measured for this page. The game's own tooltip says lower ragdoll limits may improve performance, and that is the only thing we can quote.
- Mods can add physics shapes and hit reaction scripts. They cannot make ragdolls work in multiplayer.
:::

:::facts
- **Where ragdolls run** single player only :cite[(`zombie/characters/IsoGameCharacter.java:16405-16407`)]
- **Ragdoll limit option** 5 to 60, default 20 :cite[(`zombie/core/Core.java:329`)]
- **Options screen choices for the limit** 5, 10, 15, 20, 25, 30, 45, 60 :cite[(`media/lua/client/OptionScreens/MainOptions.lua:732-771`)]
- **When a ragdoll ends** the body is asleep in the simulation and has not moved for 1.5 seconds :cite[(`zombie/core/physics/RagdollController.java:45`, `zombie/core/physics/RagdollController.java:293-307`)]
- **Fallback push when a gun's ammo has no script block** 80 forward, 40 upward, in the game's own units :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:112-168`)]
:::

## The two player options

Two options on the options screen decide whether ragdolls can happen and how many can be in the world at once.

Open the options screen and go to the "DISPLAY & PERFORMANCE" page. The section "Rendering and Performance" holds both. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:441`, `media/lua/client/OptionScreens/MainOptions.lua:730-771`, `media/lua/shared/Translate/EN/UI.json:44`, `media/lua/shared/Translate/EN/UI.json:1809`)]

| Option on the screen | Values | Default | What it does |
|---|---|---|---|
| Use Physics Hit Reactions | On or off | On | Off means no character ragdolls. In multiplayer the game reads it as off whatever it is set to. |
| Maximum Active Ragdolls | 5, 10, 15, 20, 25, 30, 45 or 60 | 20 | The most ragdoll bodies at one time. A character that has no ragdoll yet cannot start one when the limit is reached. |

:cite[(`zombie/core/Core.java:328-329`, `zombie/core/Core.java:4485-4487`, `zombie/characters/IsoGameCharacter.java:16410-16414`)]

The game's tooltip for the on or off option reads: "Automatically unchecked in multiplayer, as ragdolls are not (yet) available in MP. Don't forget to toggle them when returning to single player!" The tooltip for the limit option reads: "Sets the maximum number of concurrent active ragdoll simulations. Lower values may improve performance." :cite[(`media/lua/shared/Translate/EN/UI.json:224`, `media/lua/shared/Translate/EN/UI.json:226`)]

The options are saved in the game's `options.ini`, under the names `usePhysicsHitReaction` and `maxActiveRagdolls`. :cite[(`zombie/core/Core.java:328-329`, `zombie/core/Core.java:1431`)]

## When a body falls as a ragdoll

A body falls as a ragdoll when the game starts a ragdoll animation for it and every test in the ragdoll gate passes. Otherwise it plays a prerecorded fall.

The gate is one method, `canRagdoll()`, and it checks these in order. :cite[(`zombie/characters/IsoGameCharacter.java:16405-16419`)]
1. The game is not a multiplayer client and not a dedicated server.
2. A debug-only switch that disables ragdolls is off. It has no effect outside debug mode. :cite[(`zombie/debug/BooleanDebugOption.java:35-37`)]
3. The "Use Physics Hit Reactions" option is on.
4. The character already has a ragdoll, or the limit has not been reached.
5. The character does not wear an item tagged `NoRagdoll`. Vanilla clothing uses it: 66 tags in one item script file. :cite[(`media/scripts/generated/items/clothing.txt:45`)] :cite[(`zombie/scripting/objects/ItemTag.java:304`)]
6. The character's current state allows it. Climbing a fence turns it off, and animals never ragdoll. :cite[(`zombie/ai/states/ClimbOverFenceState.java:672-675`, `zombie/characters/animals/IsoAnimal.java:3485-3487`)]

In the vanilla files, all the ragdoll states are in the zombie action group, so only zombies ragdoll. :cite[(`media/actiongroups/zombie`)] A survivor who falls plays the usual animation.

Which events start a ragdoll is read from the combat code and not run in a game. A shot can set the flag, and an explosion can set it too. :cite[(`zombie/CombatManager.java:3845-3858`)] The same code for a melee weapon does not set the flag, so a melee hit most likely plays the canned reaction.

A zombie hit by a vehicle can be sent to a ragdoll state by the `useRagdollVehicleCollision` conditions in the zombie's vehicle-attack transitions. :cite[(`media/actiongroups/zombie/attackvehicle/to_falldown.xml`, `media/actiongroups/zombie/attackvehicle/to_hitreaction.xml`)] Once it is ragdolling, the controller handles contact with the vehicle. :cite[(`zombie/characters/IsoZombie.java:3320-3322`)]

When a ragdoll starts, the body is moved by a physics simulation for a short time. It ends when the body has gone to sleep in the simulation and has not moved for 1.5 seconds. :cite[(`zombie/core/physics/RagdollController.java:293-307`)]

Touching a vehicle keeps a ragdoll alive. :cite[(`zombie/core/physics/RagdollController.java:792-805`)] While a zombie lies there, its ragdoll on-the-ground state runs the usual timer that brings a zombie back up, unless the zombie is dead. How it gets up is not covered here. :cite[(`zombie/ai/states/ZombieRagdollOnGroundState.java:30-61`)]

A zombie that dies while ragdolling can keep the ragdoll pose in single player. That needs the `ragdollFall` flag to be set, and the game refuses the pose when the zombie is scene-culled, has no active model or has no animation player. :cite[(`zombie/iso/objects/IsoDeadBody.java:353-360`, `zombie/characters/IsoGameCharacter.java:1235-1248`)]

The full story, with every code path, is on [Ragdolls](/pz/build-42/engine/physics-and-ragdolls/ragdolls) and [Hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics).

## What a server owner can and cannot set

A server owner cannot turn ragdolls on, and nothing in the server settings or the sandbox options changes how a body falls.

The server has a setting named `UsePhysicsHitReaction`, off by default. In 42.22 the one place that reads it is behind a test that has already ended for a server, so the setting has no effect. :cite[(`zombie/network/ServerOptions.java:219`, `zombie/characters/IsoGameCharacter.java:16405-16413`)] No sandbox option in the capture mentions ragdolls or physics. :cite[(`api/sandbox_options.jsonl`)]

Players' options do not help either. The player option reads off on a multiplayer client, whatever the player set. :cite[(`zombie/core/Core.java:4485-4487`)]

What a server owner can do is run mods. Physics shapes and vehicle collision shapes come from script files, and the game checks script files with a checksum on clients and servers, so keep every client on the same mod versions as the server. That check was read in the code and not run. :cite[(`zombie/scripting/ScriptManager.java:1677-1680`, `zombie/scripting/ScriptManager.java:1693`)]

> **Warning:** a vehicle's position, rotation and speed are sent by the client that drives it, and the server applies them within a time window. Keep the anti-cheat settings on and read the server log. This page gives no steps. The packet fields are in [Physics reference](/pz/build-42/engine/physics-and-ragdolls/physics-reference#vehicle-physics-packets).

## Do other players see the same fall?

In multiplayer nobody sees a ragdoll, so everyone sees the same canned fall; in single player there is no one else to ask.

The ragdoll gate refuses on a client and on a server, and the network code has no ragdoll packet: a search of `zombie/network` finds the word only in the code that builds the settings manager on the server. :cite[(`zombie/characters/IsoGameCharacter.java:16405-16407`, `zombie/network/GameServer.java:805`)] A zombie body in multiplayer also keeps no ragdoll pose when it dies. :cite[(`zombie/characters/IsoGameCharacter.java:1235-1240`)]

If a future build adds multiplayer ragdolls, this page will need rewriting. For 42.22 the rule is simple: the fall you see in multiplayer is the same animation on every machine as far as the ragdoll code goes. Whether the two machines show the same canned animation was not studied here.

## What it costs

We did not measure the cost of ragdolls, so there are no performance numbers on this page.

What the code and the game say is limited. Each ragdoll is a body of 11 parts in the native physics world, and the number of them at one time is capped by the "Maximum Active Ragdolls" option. :cite[(`zombie/core/physics/RagdollBodyPart.java:12-23`, `zombie/core/physics/RagdollController.java:224-233`, `zombie/characters/IsoGameCharacter.java:16414`)] The game's tooltip says lower values may improve performance. :cite[(`media/lua/shared/Translate/EN/UI.json:226`)]

The physics world also advances on every world update, for vehicles and chunk shapes, whether or not a ragdoll exists. That cost was not measured either. :cite[(`zombie/core/physics/WorldSimulation.java:87-102`)] If you play with a big horde and your frame rate drops, lowering the limit is the one thing the game itself suggests. Whether it helps on your machine is a thing only a test on your machine can answer.

## What mods can do

Mods can add physics shapes and hit reaction scripts, and they cannot change multiplayer.

A mod can add a push for an ammo type or thrown item that has no vanilla block, add collision shapes for vehicles and tiles, and read ragdoll state from Lua. No Lua call is known to start a ragdoll (whether `setUsePhysicHitReaction` or `setRagdollFall` can is not verified), and a mod cannot make ragdolls run in multiplayer. The step-by-step guide is [Modding physics and ragdolls](/pz/build-42/engine/physics-and-ragdolls/modding-physics-and-ragdolls). Every table, counted from the game files, is [Physics reference](/pz/build-42/engine/physics-and-ragdolls/physics-reference).

## Where to go next

- How the native physics world and its step work: [Inside the physics engine](/pz/build-42/engine/physics-and-ragdolls/inside-the-physics-engine).
- A ragdoll from start to finish, and its script files: [Ragdolls](/pz/build-42/engine/physics-and-ragdolls/ragdolls).
- How a shot picks a body part and a push: [Hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics).
- Collision shapes and thrown objects: [Physics shapes and objects](/pz/build-42/engine/physics-and-ragdolls/physics-shapes-and-objects).

:::callout[How we know]{kind=proof}
- Every rule on this page comes from reading the 42.22 Java and Lua in capture B42_3d39148846. We did not run a game, so every statement about what a player sees is read from code, not watched.
- Not measured: the cost of a ragdoll or of the physics world, in frame time or memory. The only performance statement is the game's own tooltip.
- Not verified: which events start a ragdoll in a normal fight, beyond the code paths named above. A melee hit "most likely" plays the canned reaction because the code that sets the flag skips melee weapons; that was not seen in a game.
- Not verified: whether a dedicated server runs the shape loading step, and whether the canned animations match across machines.
:::
