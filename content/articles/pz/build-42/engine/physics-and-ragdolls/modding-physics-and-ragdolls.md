---
id: build-42-modding-physics-and-ragdolls
slug: modding-physics-and-ragdolls
title: 'Modding physics and ragdolls'
game: pz
version: build-42
section: engine
category: physics-and-ragdolls
difficulty: advanced
tags:
  - engine
  - physics
  - ragdolls
  - modding
  - scripts
  - lua
excerpt: >-
  Step by step from an empty folder: what a Build 42.22 mod can change in physics and ragdolls through scripts and Lua, how to test it, and what it cannot reach. Ragdolls run only in single player.
last_updated: '2026-11-14'
related_articles:
  - how-physics-and-ragdolls-work
  - inside-the-physics-engine
  - ragdolls
  - hit-reactions-and-ballistics
  - physics-shapes-and-objects
  - physics-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [mod authors who want a push or a shape](#recipe-1-give-a-weapon-its-own-push) | [Lua authors](#reading-and-setting-things-from-lua) | [people deciding what is possible](#what-a-mod-can-and-cannot-reach) | server owners should read [multiplayer and servers](#multiplayer-and-servers)

:::callout[The 1-minute version]{kind=key}
- Ragdolls run only in single player. In 42.22 `canRagdoll()` returns false first on a multiplayer client and on a dedicated server, so a ragdoll change in a mod does nothing in multiplayer.
- A mod can add script files: a physics hit reaction for a weapon, a physics shape, a vehicle `physics` block, and ragdoll body values. It cannot edit the native physics library, and it cannot call the ragdoll and ballistics controller classes from Lua, because they are not Lua-exposed.
- A hit reaction block for an item or ammo type that vanilla already covers is ignored, because the lookup returns the first match and vanilla loads first. A block for a type with no vanilla block works. This is read from the code, not run in a game.
- Ragdoll script blocks cannot replace vanilla ones. A new block is added to the end of a list, and what the native side does with two entries for one part is not verified.
- Lua can read whether a character is ragdolling and can read and set the two player options. It has no call that is known to start a ragdoll; `setUsePhysicHitReaction` and `setRagdollFall` are Lua-callable, but whether either one starts a ragdoll is not verified.
:::

:::facts
- **Where ragdolls run** single player only :cite[(`zombie/characters/IsoGameCharacter.java:16405-16407`)]
- **Player option `usePhysicsHitReaction`** default true :cite[(`zombie/core/Core.java:328`)]
- **Player option `maxActiveRagdolls`** 5 to 60, default 20 :cite[(`zombie/core/Core.java:329`)]
- **Fallback hit push when no block matches** 80 forward, 40 upward :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:112-168`)]
- **Values in one hit reaction block** 11 forward, 11 upward :cite[(`zombie/scripting/objects/PhysicsHitReaction.java:18-19`)]
- **Vanilla vehicle shape blocks kept per vehicle** at most 10 :cite[(`zombie/scripting/objects/VehicleScript.java:345`)]
:::

## Start here: multiplayer

Ragdolls do not run in multiplayer, so any ragdoll change you make is a single-player change.

`canRagdoll()` is the gate for every ragdoll. Its first test returns false when the game is a multiplayer client or a dedicated server, before it looks at any option, item or state. :cite[(`zombie/characters/IsoGameCharacter.java:16405-16407`)] The player option also reads false on a client or server, whatever it is set to. :cite[(`zombie/core/Core.java:4485-4487`)]

The game's own option tooltip says the same: "Automatically unchecked in multiplayer, as ragdolls are not (yet) available in MP." :cite[(`media/lua/shared/Translate/EN/UI.json:224`)] Nothing in the network code carries ragdoll data: a search of `zombie/network` finds the word only in `GameServer`, which builds the settings manager. :cite[(`zombie/network/GameServer.java:805`)]

So in multiplayer the zombie plays the ordinary animated hit reaction, and a mod that depends on `isRagdoll()` or `canRagdoll()` being true will see false. Test your mod in single player, and make any code that touches ragdolls skip itself when the game is a multiplayer client.

## What a mod can and cannot reach

A mod reaches the physics code through five doors: script files, item tags, animation files, Lua, and the player options.

| Door | What it changes | Works in | Code |
|---|---|---|---|
| `physicsHitReaction` script | How hard a hit pushes a ragdoll, for an ammo type or thrown item that has no vanilla block | Single player | :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:46-66`, `zombie/scripting/objects/PhysicsHitReactionScript.java:112-168`)] |
| `physicsShape` script | The collision mesh a tile or a vehicle `physics mesh` block uses; a same-named block overrides vanilla keys | Any side that loads it (not verified for servers) | :cite[(`zombie/scripting/objects/PhysicsShapeScript.java:30-65`, `zombie/scripting/ScriptBucket.java:195-198`)] |
| Vehicle `physics` blocks | A vehicle's collision body: boxes, spheres, meshes | Where vehicle scripts load | :cite[(`zombie/scripting/objects/VehicleScript.java:343-347`)] |
| `ragdoll` scripts | Ragdoll body values, added to the end of the lists | Single player (uploaded only when not a server) | :cite[(`zombie/scripting/objects/RagdollScript.java:108-115`, `zombie/scripting/objects/RagdollScript.java:222`)] |
| Item tag `NoRagdoll` | Stops the wearer from ragdolling | Single player | :cite[(`zombie/scripting/objects/ItemTag.java:304`, `zombie/characters/IsoGameCharacter.java:3544-3553`)] |
| AnimSet and action group files | When a zombie moves into a ragdoll state; see the [animation unit](/pz/build-42/engine/animation-system/action-groups-and-states) | Single player | :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:225-231`)] |
| Lua | Read ragdoll state, set two options, set two flags | Single player for ragdoll state | :cite[(`api/api.jsonl`)] |

Here is what a mod cannot do.
- **Call the controller classes.** `RagdollController`, `BallisticsController`, `BallisticsTarget`, `RagdollSettingsManager`, `PhysicsHitReactionScript` and `RagdollScript` are not on the engine's list of Lua-exposed classes. Lua can hold the object that `getRagdollController()` returns, but the index shows no callable members on it. :cite[(`api/lua_exposed.jsonl`)]
- **Call `Bullet` or `WorldSimulation`.** Neither class is exposed to Lua, and `Bullet` is the native bridge. :cite[(`api/lua_exposed.jsonl`)]
- **Change the native code.** The Java side only parses and uploads the numbers; what the library does with them is not verified. :cite[(`zombie/scripting/objects/RagdollScript.java:320-403`)]
- **Change how a hit picks its reaction.** That logic is in `CombatManager`, which is Java. :cite[(`zombie/CombatManager.java:2922-2960`)]
- **Enable the debug options.** Debug-only options return their default when the game is not in debug mode. :cite[(`zombie/debug/BooleanDebugOption.java:35-37`)]

## Before you start

You need a mod folder with a `mod.info`, scripts in the right place, and the mod enabled in a single-player save.

Put the mod in the `mods` folder of the game's user data folder, which is `Zomboid\mods` in your user folder on Windows (the engine builds the path from its cache folder), or in a Workshop item's `Contents/mods` folder. :cite[(`zombie/ZomboidFileSystem.java:549`, `zombie/ZomboidFileSystem.java:462`)] The engine lists a folder as a mod only if it finds a `mod.info` inside `common` or inside the version folder. :cite[(`zombie/ZomboidFileSystem.java:498`)] The version folder is the highest folder name that the game accepts for its own version, for example `42`. :cite[(`zombie/ZomboidFileSystem.java:470-484`)]

Scripts load from `media/scripts` under both `common` and the version folder, vanilla files first and then mod files. :cite[(`zombie/scripting/ScriptManager.java:1606`, `zombie/scripting/ScriptManager.java:1613-1650`, `zombie/scripting/ScriptManager.java:1674-1676`)] The folder tree for every recipe below is this one.

```
<user data>/mods/MyPhysicsMod/
    42/
        mod.info
        media/
            scripts/
                MyPhysicsMod_hit_reactions.txt
            lua/
                client/
                    MyPhysicsMod_RagdollWatch.lua
```

`mod.info` needs at least these two lines. :cite[(`zombie/gameStates/ChooseGameInfo.java:243`)]

```
name=My Physics Mod
id=MyPhysicsMod
```

Then start the game, open the Mods screen, enable `MyPhysicsMod`, and start or load a single-player save. If the mod is not enabled, none of its files load. The whole mod folder layout was not run in a game for this page.

Each recipe ends with a check. Some checks read `console.txt` and some use the game's debug mode, which a recipe names when it needs it. The engine reads a `-debug` launch argument; add `-debug` to the game's launch options in Steam. :cite[(`zombie/gameStates/MainScreenState.java:242`)] That the Steam launch options box passes it through was not tested.

## Recipe 1: give a weapon its own push

Add a `physicsHitReaction` block for an ammo type or a thrown item that has no vanilla block, and a hit from it pushes a ragdoll by your numbers.

The block's name picks what it applies to. If the name is one of the 10 engine ammo types, it applies to that ammo. Otherwise the engine treats the name as an item and resolves it to a full item type, using the block's module when the name has no dot. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:47-51`, `zombie/scripting/objects/AmmoType.java:15-24`, `zombie/scripting/ScriptManager.java:1956-1961`)]

Three ammo types have no vanilla block: `bullets_3030`, `bullets_357` and `cap_gun_cap`. :cite[(`media/scripts/generated/physics/physics_hit_reactions.txt`)] A shot from a gun that uses one of them gets the fallback of 80 forward and 40 upward. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:112-168`)]

1. Create `MyPhysicsMod/42/media/scripts/MyPhysicsMod_hit_reactions.txt` with this text. It gives `bullets_357` a stronger push to the legs and a gentler one to the head.

```
module Base
{
    physicsHitReaction bullets_357
    {
        impulse_pelvis = 60.0,
        impulse_spine = 60.0,
        impulse_head = 20.0,
        impulse_left_upper_leg = 70.0,
        impulse_left_lower_leg = 70.0,
        impulse_right_upper_leg = 70.0,
        impulse_right_lower_leg = 70.0,
        impulse_left_upper_arm = 30.0,
        impulse_left_lower_arm = 30.0,
        impulse_right_upper_arm = 30.0,
        impulse_right_lower_arm = 30.0,
        upwardImpulse_pelvis = 40.0,
        upwardImpulse_spine = 40.0,
        upwardImpulse_head = 10.0,
        upwardImpulse_left_upper_leg = 20.0,
        upwardImpulse_left_lower_leg = 20.0,
        upwardImpulse_right_upper_leg = 20.0,
        upwardImpulse_right_lower_leg = 20.0,
        upwardImpulse_left_upper_arm = 20.0,
        upwardImpulse_left_lower_arm = 20.0,
        upwardImpulse_right_upper_arm = 20.0,
        upwardImpulse_right_lower_arm = 20.0,
    }
}
```

2. Enable the mod and load a single-player save with a gun that fires `.357` ammo. A recipe-by-recipe check follows below.

The parser matters here, because it does not read the key names after the underscore.
- **Order is everything.** A key that contains `impulse_` goes to the next forward slot, and a key that contains `upwardImpulse_` goes to the next upward slot, in the order they appear in the file. The words after the underscore are ignored. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:53-64`)]
- **The order is the body-part order.** Pelvis, spine, head, left upper leg, left lower leg, right upper leg, right lower leg, left upper arm, left lower arm, right upper arm, right lower arm. :cite[(`zombie/core/physics/RagdollBodyPart.java:12-23`)]
- **Count to 11.** The arrays hold 11 values. A block with fewer leaves the remaining slots at 0, which is a push of nothing for those parts. A block with more than 11 reads like an array overflow; that was not run. :cite[(`zombie/scripting/objects/PhysicsHitReaction.java:18-19`)]
- **One value per line, with `=`.** Each line is split at `=`, and a value that contains a second `=` is cut. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:53-56`)]

For a thrown explosive, name the block after the item and give the item the same `PhysicsObject`. The push is used only when the weapon has no ammo type and its display category is `Explosives`. :cite[(`zombie/core/physics/RagdollController.java:329-340`, `zombie/inventory/types/HandWeapon.java:1478`)] Vanilla does it with `PhysicsObject = Base.PipeBomb` on the item and a `PipeBomb` block in `module Base`. :cite[(`media/scripts/generated/items/weapon.txt`, `media/scripts/generated/physics/physics_hit_reactions.txt`)] A block name with a dot is used as the full item type without a lookup, so `MyMod.MyBomb` works from any module; that form was not run. :cite[(`zombie/scripting/ScriptManager.java:1959`)]

### Why an override of a vanilla ammo type does nothing

A second block for `bullets_9mm` is loaded but never used, because the lookup stops at the first match and vanilla's entry is first.

Every body of a block with the same name is loaded in turn, and each load appends a new entry to one shared list. :cite[(`zombie/scripting/ScriptBucket.java:195-198`, `zombie/scripting/objects/PhysicsHitReactionScript.java:66`)] The lookup walks that list from the start and returns the first entry for the ammo type. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:129-140`)] Game files are loaded before mod files, so vanilla's entry comes first. :cite[(`zombie/scripting/ScriptManager.java:1674-1676`)]

A mod that wants a different push for a vanilla ammo type therefore cannot do it with a script alone. This is read from the code; it was not run in a game.

### Check it

In single player, shoot a zombie with the new ammo and watch it fall with a ragdoll. Before the mod, that ammo got the 80-forward fallback, so a push that looks different from before is the sign that your block loaded. The game's debug mode has a "Physics Hit Reactions" panel that lists every loaded block and lets you edit values live without a restart. :cite[(`zombie/debug/DebugContext.java:74`, `zombie/debug/debugWindows/PhysicsHitReactionsPanel.java:26-27`)]

That panel can write the values back to a script file, but the file it writes to is the one recorded each time a block is set up, so it is the file of the last block set up, which may be yours. Use the panel for tuning and copy the numbers into your own file. :cite[(`zombie/scripting/objects/PhysicsHitReactionScript.java:28-33`, `zombie/scripting/objects/PhysicsHitReactionScript.java:69-112`)]

## Recipe 2: add or override a physics shape

A `physicsShape` script points at a mesh in a model file, and a vehicle `physics mesh` block or a tile property can then use it by name.

The full key list, the loading steps and the numbers for vanilla are on [Physics shapes and objects](/pz/build-42/engine/physics-and-ragdolls/physics-shapes-and-objects). The steps here are the minimum.

1. Make a model file with a mesh in it, and put it in your mod's `media/models_x` folder, for example `media/models_x/physics/mycar_shape.fbx`. The code names the folders `media/models` and `media/models_x`, in lowercase. Whether the case matters on your system was not tested. :cite[(`zombie/core/physics/FileTask_LoadPhysicsShape.java:29`)] The capture holds no models, so this folder was not checked against vanilla.
2. Create `MyPhysicsMod/42/media/scripts/MyPhysicsMod_shapes.txt`.

```
module MyPhysicsMod
{
    physicsShape mycarshape
    {
        mesh = physics/mycar_shape|Body,
        translate = 0.0 0.0 0.0,
        rotate = 0.0 0.0 0.0,
        scale = 1.0,
    }
}
```

3. In your vehicle script, add a `physics mesh` block that names the shape with its module. The vehicle section of this wiki covers the rest of a vehicle script. :cite[(`zombie/scripting/objects/VehicleScript.java:1019-1054`, `zombie/core/physics/Bullet.java:166`)]

```
physics mesh
{
    physicsShapeScript = MyPhysicsMod.mycarshape,
    offset = 0.0 0.0 0.0,
}
```

A `physics box` or `physics sphere` block needs no model and no shape script, and it is the form that all vanilla vehicles use. A box is `offset`, `extents` and `rotate`; a sphere is `offset` and `radius`. :cite[(`zombie/scripting/objects/VehicleScript.java:1019-1046`)]

To override a vanilla shape, write a block with the same name in a mod file, inside `module Base`, because the vanilla shapes are in `module Base` and a block in another module is a different script. Every body of a script with the same name is loaded in turn, so keys you set replace vanilla's, and keys you leave out keep vanilla's. :cite[(`zombie/scripting/ScriptBucket.java:195-198`, `zombie/scripting/objects/PhysicsShapeScript.java:42-59`)] Whether the model loads is only logged as a warning, "Failed to load asset", so read `console.txt` after starting. :cite[(`zombie/core/physics/PhysicsShapeAssetManager.java:45-51`)]

None of this recipe was run in a game. A tile can use the shape through its `PhysicsMesh` property, which is set in the tile pack and not in a script. :cite[(`zombie/iso/IsoChunk.java:2122-2133`)]

## Recipe 3: change ragdoll body values (experimental)

A mod can add `ragdoll` blocks, but it cannot replace the vanilla ones, so the result of changing a value is not verified.

The four kinds of block (anchors, body dynamics, body part info, constraints) are loaded into four shared lists, and each load adds a new entry at the end. Nothing removes or replaces an earlier entry. :cite[(`zombie/scripting/objects/RagdollScript.java:222`, `zombie/scripting/objects/RagdollScript.java:247`, `zombie/scripting/objects/RagdollScript.java:279`, `zombie/scripting/objects/RagdollScript.java:317`)] After all scripts load, the whole of each list is sent to the native library. :cite[(`zombie/scripting/ScriptManager.java:641-657`)] If your block repeats a vanilla part, the list holds two entries for that part, and which one the native code uses is not verified.

If you want to try it, this block repeats the left upper arm's body dynamics with a higher angular damping. It is an experiment, not a recipe that is known to work.

```
module Base
{
    ragdoll MyPhysicsMod_left_upper_arm_bodydynamics
    {
        part = 7,
        linearDamping = 0.05,
        angularDamping = 0.95,
        deactivationTime = 0.8,
        linearSleepingThreshold = 1.6,
        angularSleepingThreshold = 2.5,
        friction = 1.5,
        rollingFriction = 0.5,
    }
}
```

The rules for the file are these.
- **The block name decides the kind.** The name must contain `_constraint`, `_anchor`, `_bodypartinfo` or `_bodydynamics`; a block whose name contains none of them loads nothing, with no message. :cite[(`zombie/scripting/objects/RagdollScript.java:118-131`)]
- **Keys are case sensitive.** Unlike the shape script, the ragdoll reader compares key names exactly. :cite[(`zombie/scripting/objects/RagdollScript.java:292-312`)]
- **Name the file carefully.** A script file whose name contains `_anchors`, `_bodydynamics` and the like is remembered as the file the debug editor writes back to. Use a file name without those words. :cite[(`zombie/scripting/objects/RagdollScript.java:94-103`)]
- **Part and joint numbers are indexes.** The tables are on [Ragdolls](/pz/build-42/engine/physics-and-ragdolls/ragdolls#the-four-script-files).

To see what the lists hold, open the "Ragdoll Editor" window in the game's debug mode. :cite[(`zombie/debug/DebugContext.java:73`, `zombie/debug/debugWindows/RagdollDebugWindow.java:52`)] Run your mod, watch one fall, and compare it with and without your block. If a second entry for one part changes the fall, tell the wiki; if it does not, that answers the question for 42.22.

## Recipe 4: keep a character from ragdolling

An item tagged `NoRagdoll` stops its wearer from ragdolling, and a mod can add that tag to a clothing item.

Add the tag to the item script's `Tags` line. Vanilla writes it with the base namespace and a semicolon between tags, for example `Tags = base:canbedyed;base:ripclothingcotton;base:noragdoll,`. The engine checks the worn items whenever they change, and `canRagdoll()` returns false for a character wearing one. :cite[(`zombie/scripting/objects/ItemTag.java:304`, `zombie/characters/IsoGameCharacter.java:3544-3553`, `zombie/characters/IsoGameCharacter.java:5106-5115`)] 

Vanilla clothing already uses the tag, 66 times in the clothing item script. The first use, at line 45, is `Tags = base:canbedyed;base:ripclothingcotton;base:noragdoll,`. :cite[(`media/scripts/generated/items/clothing.txt:45`)] To check your own item, wear it in single player and call `getPlayer():canRagdoll()` from the Lua console or a script: it should return false while the item is worn. This recipe was not run in a game.

## Reading and setting things from Lua

Lua can read a character's ragdoll state and the player options, and no Lua call is known to start one; whether `setUsePhysicHitReaction` or `setRagdollFall` can is not verified.

Each call below is marked as Lua-callable in the API index. :cite[(`api/api.jsonl`)]

| Call | On | What it does | Code |
|---|---|---|---|
| `canRagdoll()` | any character | Runs the gate from the first section; false in multiplayer | :cite[(`zombie/characters/IsoGameCharacter.java:16405-16419`)] |
| `isRagdoll()` | any character | True when the animation player has a ragdoll controller | :cite[(`zombie/characters/IsoGameCharacter.java:4971-4973`)] |
| `isFullyRagdolling()` | any character | True when the animation player says the ragdoll has taken over | :cite[(`zombie/characters/IsoGameCharacter.java:4975-4977`)] |
| `isRagdollSimulationActive()` | any character | True while the track's simulation runs and `canRagdoll()` holds | :cite[(`zombie/characters/IsoGameCharacter.java:5019-5021`)] |
| `isRagdollFall()` / `setRagdollFall(bool)` | any character | Reads or sets the flag that a corpse uses to keep its ragdoll pose | :cite[(`zombie/characters/IsoGameCharacter.java:4979-4985`, `zombie/iso/objects/IsoDeadBody.java:353-360`)] |
| `usePhysicHitReaction()` / `setUsePhysicHitReaction(bool)` | any character | Reads or sets the flag the action-group transitions test; the combat code sets it again on the next hit | :cite[(`zombie/characters/IsoGameCharacter.java:5011-5017`, `zombie/CombatManager.java:3845-3852`)] |
| `useRagdollVehicleCollision()` | any character | True when `canRagdoll()` holds and a vehicle collision is flagged | :cite[(`zombie/characters/IsoGameCharacter.java:4995-4997`)] |
| `getRagdollController()` | any character | Returns the controller, or nil; its methods are not Lua-callable | :cite[(`zombie/characters/IsoGameCharacter.java:16421-16424`)] |
| `releaseRagdollController()` | any character | Releases the character's controller through its animation player | :cite[(`zombie/characters/IsoGameCharacter.java:16426-16431`)] |
| `getCore():getOptionUsePhysicsHitReaction()` | game | The player option; false in multiplayer | :cite[(`zombie/core/Core.java:4485-4487`)] |
| `getCore():setOptionUsePhysicsHitReaction(bool)` | game | Sets the player option | :cite[(`zombie/core/Core.java:4489-4491`)] |
| `getCore():getMaxActiveRagdolls()` / `setMaxActiveRagdolls(int)` | game | Reads or sets the maximum, 5 to 60 | :cite[(`zombie/core/Core.java:4493-4499`)] |
| `getScriptManager():getPhysicsHitReactionScript(name)` / `getRagdollScript(name)` | game | Returns a script object; its methods are not Lua-callable | :cite[(`api/api.jsonl`, `api/lua_exposed.jsonl`)] |

A value outside 5 to 60 passed to `setMaxActiveRagdolls` is refused with an error line in the log, not clamped. :cite[(`zombie/config/IntegerConfigOption.java:99-108`)] The Lua call for `getCore()` and `getScriptManager()` are globals listed in the Lua global index. :cite[(`api/lua_globals.jsonl`)] Whether a value set from Lua is written to `options.ini` without the options screen was not checked; the engine writes its options to that file. :cite[(`zombie/core/Core.java:1431`)]

This short script prints a line each time a zombie starts and stops ragdolling. Put it in `MyPhysicsMod/42/media/lua/client/MyPhysicsMod_RagdollWatch.lua`. It was not run in a game.

```lua
local wasRagdolling = {}

local function onZombieUpdate(zombie)
    local id = zombie:getID()
    local now = zombie:isRagdoll()
    if now ~= (wasRagdolling[id] or false) then
        print("MyPhysicsMod: zombie " .. tostring(id) .. " ragdoll = " .. tostring(now)
            .. ", simulation active = " .. tostring(zombie:isRagdollSimulationActive()))
        wasRagdolling[id] = now
    end
end

Events.OnZombieUpdate.Add(onZombieUpdate)
```

`OnZombieUpdate` is an engine event that passes the zombie, and `getID()` is Lua-callable on a moving object. :cite[(`api/events.jsonl`, `api/api.jsonl`)] In multiplayer the script prints nothing about ragdolls, because `isRagdoll()` is false there.

## Multiplayer and servers

A server owner can run a mod with these scripts, but none of it changes how zombies fall for anyone.

The server has a `UsePhysicsHitReaction` server option, default false, but the one place that reads it is behind a test that has already returned for a server, so the option has no effect. :cite[(`zombie/network/ServerOptions.java:219`, `zombie/characters/IsoGameCharacter.java:16412-16413`)] The ragdoll script upload and the ballistics trace are skipped on a server. :cite[(`zombie/scripting/objects/RagdollScript.java:108-115`, `zombie/characters/IsoGameCharacter.java:16437-16445`)]

Script files still load on a server, and the game checks script files against the server's with a checksum, so a mod with scripts belongs on the server and on every client. :cite[(`zombie/scripting/ScriptManager.java:1677-1680`, `zombie/scripting/ScriptManager.java:1693`)] That check was read, not run.

> **Warning for server owners:** a physics shape or a vehicle shape changes where solid things are on a server too. A client whose local shapes differ from the server's could disagree about collisions. The server's files decide; keep every client on the same mod version.

## Checking your work

Every recipe has the same loop: change one file, load a single-player save, and read the log.

- Look in `console.txt` for script load errors. When a block throws while loading, the engine logs the exception and removes that script. :cite[(`zombie/scripting/ScriptBucket.java:200-207`)]
- For a shape, look for "Failed to load asset". :cite[(`zombie/core/physics/PhysicsShapeAssetManager.java:45-51`)]
- For a hit reaction, use the debug "Physics Hit Reactions" panel to see whether your block is in the list.
- For a fall, use the debug "Ragdoll Editor" window. :cite[(`zombie/debug/DebugContext.java:73-74`)]
- For Lua, `print` lines land in the same log.

Report what you find to the wiki, because the not-verified items below are all things a short test settles.

## How we know

:::callout[How we know]{kind=proof}
- Every engine claim is from the 42.22 decompiled source and the game's script and Lua files in capture B42_3d39148846. Lua-callable flags are from `api/api.jsonl`, `api/lua_exposed.jsonl` and `api/lua_globals.jsonl`.
- Not run in a game: every recipe, the folder layout, the Lua script, and the claim that a repeated vanilla hit reaction block is ignored. That last claim follows from the lookup returning the first match and from game files loading before mod files.
- Not verified: what the native library does with two ragdoll entries for one part, whether a value set from Lua reaches `options.ini`, whether a dedicated server loads shape meshes, and whether setting `usePhysicHitReaction` on a character starts a ragdoll without a hit.
- The `AmmoType.register` method is listed as Lua-callable. How a mod could use it to add an ammo type for a hit reaction block, and whether it would run early enough, was not studied.
:::
