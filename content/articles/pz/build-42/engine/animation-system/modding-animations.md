---
id: build-42-modding-animations
slug: modding-animations
title: 'Modding animations'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - modding
  - timed-actions
  - multiplayer
  - how-to
excerpt: >-
  A step-by-step how-to for Build 42.22: add a clip to a mod, play it from a timed action, change an AnimSet node, see what other players get in multiplayer, and avoid the reload, junction and load-order traps.
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - inside-the-animation-system
  - action-groups-and-states
  - animsets-nodes-and-transitions
  - animation-variables-and-events
  - skinned-models-and-clips
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders starting from nothing](#part-1-play-a-clip-from-a-timed-action) | [modders changing a node](#part-2-add-or-change-a-node) | [multiplayer authors and server owners](#part-3-what-other-players-get) | [everyone who hit a trap](#part-4-the-traps)

:::callout[The 1-minute version]{kind=key}
- A new animation needs three files: a clip in the mod's `anims_X` folder, an AnimSet node that names the clip and a condition, and a timed action that sets the condition.
- The link between them is the text of `PerformingAction`. The timed action sets it with `setActionAnim("Name")`, and the node tests that same text.
- The node's `m_AnimName` is the clip's name inside the file, with the same capitalization. The file name does not matter for that.
- In multiplayer, set every variable another player must see through the action's `setAnimVariable`, before `setActionAnim`. Those variables travel with the action's state packet.
- A Lua `animEvent` function runs only on the machine that runs the real timed action, and not for other players' copies of it.
- Single-player and server edits to node XML can reload while the game runs. A restart is the safe check, and the reload and local-link traps below are the ways a test goes wrong.
:::

:::facts
- **Mod folders** `Contents/mods/<ModId>/42/` holds `mod.info` and `media`; a `common` folder is also read :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/gameStates/ChooseGameInfo.java:520`)]
- **Clip folder** `media/anims_X/Bob/` in the version folder or `common` :cite[(`zombie/gameStates/ChooseGameInfo.java:520`)]
- **Node folder** `media/AnimSets/player/actions/` for an action that a player performs :cite[(`media/AnimSets/player/actions/ApplyAlcohol.xml:1-29`)]
- **Default length of a new Lua action** `maxTime = -1`, which never ends by itself :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:173-184`, `zombie/characters/CharacterTimedActions/BaseAction.java:181-183`)]
- **Server wait before it acts on a checksum mismatch** 60 seconds, when the `AntiCheatChecksum` server option is not off (4) :cite[(`zombie/iso/IsoWorld.java:316`, `zombie/network/anticheats/AntiCheatChecksumUpdate.java:12-24`, `zombie/network/anticheats/AntiCheat.java:78-80`, `zombie/network/ServerOptions.java:212`)]
:::

## Before you start

The steps below build a small mod from nothing, and they assume you have a clip, a test world and the game's log.

You need a clip exported from a rig that uses the human skeleton, with a skinned mesh in the same file. The rules for that file, such as bone names, the clip's name and the scale, are on [Skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips). For a mod's basic folder and `mod.info`, see [Project skeleton](/pz/build-42/modding/cookbook/project-skeleton).

Run a single-player world with the mod enabled, and keep the game's console log open. The lines to look for are named in each step. The code in this page was read from the 42.22 sources and modeled on shipped files, and nothing here was run in a game. Steps 3 to 6 and the node variant in Part 2 rest on claims that are not verified in a game, and each is marked.

## Part 1: play a clip from a timed action

This part adds a clip called `MyAnimMod_Wave` and plays it from a timed action when you press a key.

:::flow[The chain you will build]
- A key press queues the timed action
- The action's `start` calls `setActionAnim`
- `PerformingAction` is set to the node's name
- The AnimSet node whose condition matches is chosen
- The node plays the clip with that name
:::

### Step 1: make the folders

Create these folders and files, with `MyAnimMod` as the mod's id.

```
Contents/mods/MyAnimMod/42/mod.info
Contents/mods/MyAnimMod/42/media/anims_X/Bob/MyAnimMod_Wave.fbx
Contents/mods/MyAnimMod/42/media/AnimSets/player/actions/MyAnimMod_Wave.xml
Contents/mods/MyAnimMod/42/media/lua/client/TimedActions/ISMyAnimModWave.lua
Contents/mods/MyAnimMod/42/media/lua/client/MyAnimMod_Test.lua
```

**Where the folder goes.** Put the `MyAnimMod` folder in the `mods` folder of the game's user folder (the `Zomboid` folder in your user folder), or in a Workshop item's `Contents/mods` folder. :cite[(`zombie/ZomboidFileSystem.java:456-464`, `zombie/ZomboidFileSystem.java:547-552`)] Then switch the mod on in the game's Mods screen before you load the world. The screen's name comes from playing the game and was not checked in code.

The engine picks the version folder with the highest number that is not above the game's version, and it also reads a `common` folder next to it. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/gameStates/ChooseGameInfo.java:520`)] The `mod.info` file needs at least these lines, and a Workshop upload adds its own files around it.

```
name=My Animation Mod
id=MyAnimMod
description=Adds a wave animation.
versionMin=42.0
```

The `versionMin` line makes the mod unavailable on a game older than that version. :cite[(`zombie/gameStates/ChooseGameInfo.java:339-345`, `zombie/gameStates/ChooseGameInfo.java:654-659`)]

### Step 2: bring your own clip

This page does not teach you to make a clip, so you need a file before the next steps. The file must hold the Bob skeleton with its bone names, a skinned mesh with bones, and an animation whose name will be the name your node uses. Export it as `.fbx`, `.glb` or `.x`, which the loader accepts. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:60-120`, `zombie/core/skinnedmodel/model/jassimp/ProcessedAiScene.java:54-72`)] The wiki page on [the export being the format](/pz/build-42/outcast-mods/outcast-ladders/the-export-was-the-format-and-only-the-format) covers one export problem, and [Skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips) lists the rest.

Save your clip file as `MyAnimMod_Wave.fbx` in `media/anims_X/Bob/`, and make the clip inside it be called `MyAnimMod_Wave`.

The folder `Bob` is one of the three folders (`Bob`, `Kate` and `Zombie`) that the human mesh scans, and a file there is bound to the human skeleton with no prefix test. :cite[(`media/scripts/generated/animations_meshes.txt:3-9`, `zombie/core/skinnedmodel/ModelManager.java:249-253`)] Any other folder name under `anims_X` also loads onto the human skeleton. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1811-1856`)] Start the clip's own name with your mod's name, as here, because two clips with the same name from two mods are not settled by mod order in every case. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1718-1743`)]

The name the node must use is the animation's name in the file, cut at its `|` separator, with its capitalization. A Blender action called `MyAnimMod_Wave` exported with an armature named `Armature` can arrive as `Armature|MyAnimMod_Wave`, and the engine keeps `MyAnimMod_Wave`. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:343-349`)]

### Step 3: write the AnimSet node (not run in a game)

Create `media/AnimSets/player/actions/MyAnimMod_Wave.xml` with this content, which is modeled on the shipped `ApplyAlcohol` node.

```xml
<?xml version="1.0" encoding="utf-8"?>
<animNode>
	<m_Name>MyAnimMod_Wave</m_Name>
	<m_AnimName>MyAnimMod_Wave</m_AnimName>
	<m_BlendTime>0.20</m_BlendTime>
	<m_SyncTrackingEnabled>false</m_SyncTrackingEnabled>
	<m_Conditions>
		<m_Name>PerformingAction</m_Name>
		<m_Type>STRING</m_Type>
		<m_Value>MyAnimMod_Wave</m_Value>
	</m_Conditions>
	<m_Events>
		<m_EventName>MyAnimModWaveHand</m_EventName>
		<m_TimePc>0.50</m_TimePc>
		<m_ParameterValue>left</m_ParameterValue>
	</m_Events>
	<m_SubStateBoneWeights><boneName>Dummy01</boneName></m_SubStateBoneWeights>
	<m_SubStateBoneWeights><boneName>Translation_Data</boneName></m_SubStateBoneWeights>
	<m_SubStateBoneWeights><boneName>Bip01_Prop1</boneName></m_SubStateBoneWeights>
	<m_SubStateBoneWeights><boneName>Bip01_Prop2</boneName></m_SubStateBoneWeights>
</animNode>
```

The `m_AnimName` line is the clip's name, and `m_Value` is the text the timed action will pass to `setActionAnim`. The comparison of a text condition ignores case. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimCondition.java:160-162`)] The four bone entries give the clip full weight on the whole body, because a listed bone and its descendants get weight 1 by default, and `Dummy01` is the skeleton's root. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimBoneWeight.java:21-28`, `zombie/core/skinnedmodel/animation/AnimationTrack.java:567-610`)]

The node loops its clip, because `m_Looped` is true unless you write `false`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:118`)] That suits a clip that plays for as long as the action lasts. Every other field of the node is described on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions).

### Step 4: write the timed action (not run in a game)

Create `media/lua/client/TimedActions/ISMyAnimModWave.lua`.

```lua
require "TimedActions/ISBaseTimedAction"

ISMyAnimModWave = ISBaseTimedAction:derive("ISMyAnimModWave")

function ISMyAnimModWave:isValid()
    return true
end

function ISMyAnimModWave:start()
    self:setActionAnim("MyAnimMod_Wave")
end

function ISMyAnimModWave:update()
end

function ISMyAnimModWave:stop()
    ISBaseTimedAction.stop(self)
end

function ISMyAnimModWave:perform()
    ISBaseTimedAction.perform(self)
end

function ISMyAnimModWave:animEvent(event, parameter)
    if event == "MyAnimModWaveHand" then
        print("MyAnimMod: wave event, parameter " .. tostring(parameter))
    end
end

function ISMyAnimModWave:new(character)
    local o = ISBaseTimedAction.new(self, character)
    o.maxTime = 100
    return o
end
```

This follows the shape of the shipped `ISDetachItemHotbar`, which calls `setActionAnim` from `start`, defines `animEvent`, and builds its table in `new`. :cite[(`media/lua/client/TimedActions/ISDetachItemHotbar.lua:1-84`)] The base `new` sets the character, the three stop flags and `maxTime = -1`, so the `maxTime = 100` line is what gives the action an end. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:173-184`)]

`setActionAnim` does two things: it sets the animation variable `PerformingAction` to your text, and it sets the character variable `IsPerformingAnAction` to true. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:125-131`, `zombie/characters/CharacterTimedActions/BaseAction.java:276-286`)] When the action stops, or finishes and is not set to loop, `stopTimedActionAnim` clears every variable the action set through `setAnimVariable` and sets `IsPerformingAnAction` back to false. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:189-193`, `zombie/characters/CharacterTimedActions/BaseAction.java:223-238`)]

The action's length is its `maxTime`, counted in game-time ticks. The clip's own length does not end the action. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:113-114`, `zombie/characters/CharacterTimedActions/BaseAction.java:181-183`)] The base class also scales the length for the moodles and the character's pain, as the base `adjustMaxTime` shows. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-122`)]

### Step 5: add a way to start it (not run in a game)

Create `media/lua/client/MyAnimMod_Test.lua`, which queues the action on a key press.

```lua
local function onKeyPressed(key)
    if key ~= Keyboard.KEY_F8 then return end
    local player = getPlayer()
    if player == nil then return end
    ISTimedActionQueue.add(ISMyAnimModWave:new(player))
end

Events.OnKeyPressed.Add(onKeyPressed)
```

`ISTimedActionQueue.add` is the call the shipped hotbar code uses to queue its actions, and `OnKeyPressed` is an engine event that passes the key code. :cite[(`media/lua/client/TimedActions/ISTimedActionQueue.lua:157`, `media/lua/client/Hotbar/ISHotbar.lua:329`, `api/events.jsonl:110`)] The key `F8` is also read by the shipped world map editor, so change the key if it collides with a tool you use. :cite[(`media/lua/client/ISUI/Maps/Editor/WorldMapEditor.lua:209`)]

### Step 6: test it (not run in a game)

Load a single-player world with the mod, stand still, and press the key.

- If the character plays the clip for about as long as `maxTime` allows, the chain works. Your `animEvent` line prints half way through the clip.
- In debug mode, `setActionAnim` checks the node list and logs "did not find node with condition 'PerformingAction = ...'" when no node matches. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:588-630`, `zombie/characters/CharacterTimedActions/BaseAction.java:279-281`)]
- If the node matches but nothing plays, look for "Anim Clip not found" with your clip's name. It means the name in `m_AnimName` is not a clip in the skeleton's clip map. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:423-431`)]
- If the log says "Could not find bone index for node name", a channel in your file names a bone that the skeleton lacks, and that channel was skipped. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:398-400`)]
- If you stood still and the character does not enter the action at all, check the state. Eight states have a `to_actions.xml` that enters it as a sub state: aim, idle, movement, onbed, sitonfurniture, sitonground-sitting, sitonground-sitting-warmhands and strafe. The `run` state does not list `actions` among its child tags. :cite[(`media/actiongroups/player/idle/to_actions.xml`, `media/actiongroups/player/aim/to_actions.xml`, `media/actiongroups/player/run/childTags.xml:1-8`)]

## Part 2: add or change a node

This part covers adding a second node for the same action and replacing a shipped node.

Two nodes can pass at the same time, and the engine chooses by a fixed order: abstract nodes are not offered, and among the others a higher `m_ConditionPriority` wins first, then the node with more conditions. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:365-377`, `zombie/core/skinnedmodel/advancedanimation/AnimState.java:97-113`)] To make a variant, copy your node under a new file name, keep the `PerformingAction` condition, add one more condition on a variable that your code sets, and give it another clip. It then outranks the original node whenever its extra condition holds.

To change a shipped node, use the same relative path under `media` in your mod. A file with the same path replaces the shipped one entirely, and the game logs `mod "<id>" overrides <path>`. :cite[(`zombie/ZomboidFileSystem.java:668-695`)]

A file under a new name adds a node instead. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68`)] To change only a few fields, extend the shipped file with `x_extends`, as the shipped `ApplyAlcohol_Sat` does, so your file holds only the changes. :cite[(`zombie/util/PZXmlUtil.java:58-80`, `media/AnimSets/player/actions/ApplyAlcohol_Sat.xml:1-12`)] The rules for combining files are on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions).

Action group files (`media/actiongroups`) are a different case. The code we read loads them only from the base game's folder, so a mod that ships its own group files should not count on them working until it is tested. :cite[(`zombie/characters/action/ActionGroup.java:36-80`, `zombie/ZomboidFileSystem.java:247-250`)] The mods in our samples that ship real group files were not tested either. Use AnimSet nodes and variables to change behavior.

## Part 3: what other players get

In multiplayer, the other players see your animation because your client sends the action's variables in a state packet, and your files must match the server's.

On a multiplayer client, the packet is built when the local player enters the `actions` state, and `setActionAnim` does that for the local player. :cite[(`zombie/ai/states/StateManager.java:28-78`, `zombie/network/packets/actions/StatePacket.java:68-85`)] It carries a map from each variable name the action set with `setAnimVariable` to its current value, so `PerformingAction` is in it. :cite[(`zombie/ai/states/PlayerActionsState.java:98-125`)] On the other client, the game builds a plain action object, sets each variable again, sets `IsPerformingAnAction`, and starts it, which makes that client's animator pick the same node. :cite[(`zombie/ai/states/PlayerActionsState.java:133-152`)]

Three rules follow, and each is read from the code above.

- Variables other players must see go through `self:setAnimVariable(name, value)` in the action. A variable set with `character:setVariable` is not in the action's packet. A name on the sync list that `addVariableToSyncList` fills goes out through a separate variable-sync packet instead. :cite[(`zombie/ai/states/PlayerActionsState.java:98-125`, `zombie/characters/IsoGameCharacter.java:12505-12560`, `zombie/Lua/LuaManager.java:8939-8944`, `zombie/characters/IsoGameCharacter.java:12509-12510`)]
- Set them before `setActionAnim`. For the local player, `setActionAnim` builds the packet that announces the action at that moment, so a variable set after it may be missing from that packet. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:276-286`, `zombie/network/packets/actions/StatePacket.java:68-85`)] We did not check whether a later packet carries it.
- A value that is a boolean is sent as the text `true` or `false`, and the other client turns it back into a boolean. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:248-254`, `zombie/ai/states/PlayerActionsState.java:136-143`)]

The clip file itself is not sent. The other client plays the clip from its own copy of your mod, so every player needs the same mod files. The checksum that the server checks covers only `.xml` files under `AnimSets` and `actiongroups`, so a missing or different clip file is not caught by it. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:745-770`)]

### Lua `animEvent` runs where the real action runs

A timed action's `animEvent` function is called for the action at the front of the local player's queue, and not for the copy that another client builds.

The event reaches the player and the player passes it to the action at the front of its queue, which calls the Lua function. :cite[(`zombie/characters/IsoPlayer.java:8080-8086`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:226-232`)] On another client, the player is represented by a plain base action that was never queued, and its event handler does nothing. :cite[(`zombie/ai/states/PlayerActionsState.java:133-146`, `zombie/characters/CharacterTimedActions/BaseAction.java:325-326`)] If an event must change something that all players can observe, such as an item or a sound, do it in code that runs on the owning machine and sends its result in the usual way. A few events are handled in Java for remote players too, such as `changeWeaponSprite` and `attachConnect`. :cite[(`zombie/ai/states/PlayerActionsState.java:65-95`)]

### Which kind of action you have

An action that defines its own `complete` function takes a different route from one that does not.

When the Lua class table has no `complete` function of its own, the engine marks the action as using custom remote sync, and the steps above are the whole story for other players. When it has one, a client creates a net timed action, waits for the server to accept it, and the server runs `complete`. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:138-141`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:176-182`)] An animation-only action does not need that route. Actions that change items or the world do, and how the server rebuilds such an action from its table was not read in full.

### Your files must match the server's

A client whose `AnimSets` or `actiongroups` XML differs from the server's is flagged, and it is dropped after a wait if the server checks them.

The checksum is built over every `.xml` file under `media/AnimSets` and `media/actiongroups` of the base game and of every mod, and the client sends it in its opening checksum packet. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:745-860`, `zombie/network/packets/service/ChecksumPacket.java:111-118`)]

The server compares it with its own. On a mismatch it logs a "will be kicked" line. The timeout applies only when the `AntiCheatChecksum` server option is not set to 4 (off), and its default is 2. 

When it applies, the connection times out after 60 seconds. :cite[(`zombie/network/packets/service/ChecksumPacket.java:233-270`, `zombie/network/anticheats/AntiCheatChecksumUpdate.java:12-24`, `zombie/network/anticheats/AntiCheat.java:78-80`, `zombie/network/ServerOptions.java:212`, `zombie/iso/IsoWorld.java:316`)] The server skips the check when its `DoLuaChecksum` option is off, or for a role that has the bypass capability. :cite[(`zombie/network/ServerOptions.java:75`, `zombie/network/packets/connection/LoginPacket.java:173-175`)]

> **Warning:** A player's own client chooses which animation variables it sets, and the server code we read applies a synced variable without checking its name or value. A server owner should not base a rule, such as who may do an action, on an animation variable. :cite[(`zombie/network/packets/VariableSyncPacket.java:108-122`)]

## Part 4: the traps

Four traps to check first: a reload that did not apply, a second copy of the mod, a missed load-order rule, and a variable set too late.

### The reload trap

What reloads while the game runs depends on the kind of file, and a reload that did not happen looks like a bug in your file.

| File | What the engine does | Code |
|---|---|---|
| Clip file (`.fbx`, `.glb`, `.x`, `.txt`) | A watcher reloads a changed file, or loads a new one, after 2 seconds without more changes. The watcher polls in single player and on a server, and on a multiplayer client only in debug mode. We read this and did not test it in a game. Whether a character that is already animating takes the new clip was not tested. | `zombie/core/skinnedmodel/ModelManager.java:1880-1935`, `zombie/DebugFileWatcher.java:141-181`, `zombie/ZomboidFileSystem.java:495-510` |
| AnimSet node XML | A watcher notes the change and, 1 second later, the next frame resets and reloads every set and tells every player, zombie and animal. | `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:71-103`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:146-164`, `zombie/Lua/LuaManager.java:6053-6089` |
| Action group XML | A watcher calls a reload that re-reads the base game's group folder. | `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:158-163`, `zombie/Lua/LuaManager.java:6091-6097`, `zombie/characters/action/ActionGroup.java:150-160` |
| `refreshAnimSets` from Lua | The engine's API index lists `refreshAnimSets` and `reloadActionGroups` as not callable from Lua, and neither has a Lua marker above it. A call may fail, and we did not try one. | `api/api.jsonl:5506-5508`, `zombie/Lua/LuaManager.java:6049-6053` |

The node reload rebuilds only the `player`, `player-vehicle`, `zombie` and `zombie-crawler` sets by name. :cite[(`zombie/Lua/LuaManager.java:6053-6066`)] After a clip or node change, a restart of the game is the check that does not depend on any of this.

### The junction trap

A local link to your mod folder that also exists as a Steam subscription can stop a client from joining a server.

On a client or a server, the engine builds the AnimSet checksum, and it throws "couldn't find" when a listed file is not in its file map. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:831-841`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:852-860`)] The cause is two ways of writing the same path. The checksum code resolves a Windows junction to its real path to build the base of each relative name. The file walker does not resolve it, and a relative name that does not start with that base is kept as an absolute path, which the file map does not hold. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:792-806`, `zombie/ZomboidFileSystem.java:133-140`, `zombie/ZomboidFileSystem.java:917-926`, `zombie/ZomboidFileSystem.java:382-385`)]

Single-player never builds the checksum, so the problem shows only in a multiplayer test. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:852-860`)] 

The symptom in the log is an `IllegalStateException` that says `couldn't find` followed by an absolute path, at `buildChecksum`. A mod that ships `media/AnimSets` or `media/actiongroups` files is the one that triggers it. Remove the local link and let the one real copy of the mod load. The reported fix from our project notes is to delete the link, and a join then reached the world in a test on 2026-08-15, which is a project note and not something we ran for this page.

### The load-order trap

Two mods that ship a clip with the same name are not settled by mod order in every case.

Files with the same path under `anims_X` compete by priority, where the base game is 0 and a mod's priority is its position in the load order plus one. Clips with the same name in differently named files are copied into one map in the order of a hash map of mods, so the winner is not set by priority in this code. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1665-1683`, `zombie/core/skinnedmodel/ModelManager.java:1718-1743`)] Give every clip a name that starts with your mod's id. For XML, a file at the same path loads from the last source in the mod order. :cite[(`zombie/ZomboidFileSystem.java:1128-1136`)]

### The variable-timing trap

A variable set after `setActionAnim` may not reach other players, and a variable set outside the action is never cleared by it.

The timing half is in Part 3. For the clearing half, only names added with `setAnimVariable` are cleared when the action stops, so a variable set with `character:setVariable` stays set, and a later node that tests it can keep passing. :cite[(`zombie/characters/CharacterTimedActions/BaseAction.java:223-238`, `zombie/characters/CharacterTimedActions/BaseAction.java:240-254`)] Clear such a variable yourself in `stop` and `perform`.

:::callout[How we know]{kind=proof}
Every engine claim is read from the 42.22 decompiled Java and the shipped Lua and XML, with the line numbers shown. The mod in Part 1 was modeled on shipped files and was not run in a game, and the exact key name, the folder spelling and the log lines should be checked in a first test. Not verified: whether the server runs a player's Lua `animEvent` for a queued action, whether a later state packet carries a variable set after `setActionAnim`, how the server rebuilds a net timed action from a Lua table, whether a changed clip reaches a character that is already animating, whether mod action group files load, and the junction fix beyond the project note quoted above. The page does not cover the Blender side of making a clip.
:::
