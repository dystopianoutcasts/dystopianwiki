---
id: build-42-skinned-models-and-clips
slug: skinned-models-and-clips
title: 'Skinned models and clips'
game: pz
version: build-42
section: engine
category: animation-system
difficulty: advanced
tags:
  - engine
  - animation
  - skeleton
  - clips
  - fbx
  - modding
excerpt: >-
  How Build 42.22 loads animation clip files, binds them to the character skeleton by bone name, picks a winner when mods share a clip, attaches models to bones, and what makes a clip fail to load.
last_updated: '2026-11-14'
related_articles:
  - how-character-animation-works
  - inside-the-animation-system
  - action-groups-and-states
  - animsets-nodes-and-transitions
  - animation-variables-and-events
  - modding-animations
  - animation-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders and artists](#the-skeleton-and-its-bones) | [server owners](#a-clip-the-game-cannot-load) | new players should start at [How character animation works](/pz/build-42/engine/animation-system/how-character-animation-works)

:::callout[The 1-minute version]{kind=key}
- A clip is a named set of keyframes for bones. The character skeleton is a list of bones with fixed names, and a clip finds its bones by those exact names.
- A node plays a clip by the clip's own name inside the file, with the same capitalization. The file name does not decide it.
- A mod puts its clip files in `media/anims_X` inside its `common` or version folder. The loader accepts `.fbx`, `.glb`, `.x` and `.txt` files there.
- Every clip file needs a skinned mesh with bones in it. Without one the importer builds no skeleton, and the clips in the file are not read.
- A bone name the skeleton does not have is logged as an error and that channel is skipped.
- When two mods ship a clip under the same file path, the mod later in the load order wins. Two files with different paths that hold a clip of the same name are not settled by that rule.
:::

:::facts
- **Clip file types** `.fbx`, `.glb`, `.x` and `.txt` :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:60-120`, `zombie/core/skinnedmodel/ModelManager.java:1914`)]
- **Human clip folders** `Bob`, `Kate` and `Zombie` under `media/anims_X`, with no file prefix :cite[(`media/scripts/generated/animations_meshes.txt:3-9`)]
- **Mod clip folder** `anims_X` under the mod's `media` folder, in `common` and in the version folder :cite[(`zombie/gameStates/ChooseGameInfo.java:520`)]
- **FBX and glTF scale** key positions are multiplied by 0.01 and the root is turned -90 degrees about the X axis :cite[(`zombie/core/skinnedmodel/model/FileTask_LoadAnimation.java:66-112`, `zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:321-333`)]
- **Reload wait** a changed file is reloaded after 2 seconds without further changes :cite[(`zombie/DebugFileWatcher.java:178-181`)]
:::

## The skeleton and its bones

A character is skinned to one skeleton, and a clip drives that skeleton by bone name.

The skeleton comes from a skinned mesh named in an `animationsMesh` script block. For people it is `Skinned/MaleBody`, and its clip folders are `Bob`, `Kate` and `Zombie`. :cite[(`media/scripts/generated/animations_meshes.txt:3-9`)] The mesh's skinning data keeps two things that matter here: a map from bone name to bone index, and a map from clip name to clip. :cite[(`zombie/core/skinnedmodel/model/SkinningData.java:21-26`)]

The bone list the engine knows by name is an enum that runs from `Dummy01` through `Bip01`, the spine, arms, legs and the two dress bones, to `Bip01_Prop1`, `Bip01_Prop2` and `Translation_Data`. :cite[(`zombie/core/skinnedmodel/model/SkeletonBone.java:13-47`)] The file `Master_Bones.xml` in `media/AnimSets` lists 33 bone names, and no engine or Lua source we searched reads it. :cite[(`media/AnimSets/Master_Bones.xml:1-35`)]

:::chips
- Dummy01
- Bip01
- Bip01_Pelvis
- Bip01_Spine
- Bip01_Spine1
- Bip01_Neck
- Bip01_Head
- Bip01_L_Clavicle
- Bip01_L_UpperArm
- Bip01_L_Forearm
- Bip01_L_Hand
- Bip01_R_Hand
- Bip01_BackPack
- Bip01_L_Thigh
- Bip01_R_Foot
- Bip01_Prop1
- Bip01_Prop2
- Translation_Data
:::

The `Translation_Data` bone carries the movement a clip asks for, and a node can name a different deferred bone. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:98`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:349-351`)] If the named bone does not exist, the player logs "Deferred bone not found". :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:452-455`)]

### Bones that follow another bone

The player model lists six bones that are animated in a separate pass as children of another bone.

For a human player these are both thighs under `Bip01`, both clavicles under `Bip01_Spine1`, `Bip01_Prop1` under the right hand and `Bip01_Prop2` under the left hand. :cite[(`zombie/characters/IsoPlayer.java:1216-1226`)] The normal per-bone loop skips a reparented bone, and a second pass applies those bones. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:1039`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1186-1201`)] The same code does not add them for an animal. :cite[(`zombie/characters/IsoPlayer.java:1218`)]

## Where the game looks for clip files

A clip file has to sit in a folder that the loader scans, and which folder decides which skeleton the clip is bound to.

For the base game, each `animationDirectory` of each `animationsMesh` block is scanned under `media/anims_X`. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1785-1796`)] For a mod, the loader looks for a folder named `anims_X` inside the `media` folder of the mod's `common` folder and of its version folder, and takes both. :cite[(`zombie/gameStates/ChooseGameInfo.java:520`, `zombie/core/skinnedmodel/ModelManager.java:1665-1706`)]

Inside a mod's `anims_X`, two scans run. First, every `animationDirectory` name of every mesh block is scanned for that mesh, with that mesh's file prefixes. Second, every other subfolder, and every loose file directly in `anims_X`, is loaded onto the human mesh with no prefix test. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1665-1706`, `zombie/core/skinnedmodel/ModelManager.java:1811-1856`)]

| Where the file is | Skeleton it is bound to | Prefix test | Code |
|---|---|---|---|
| `anims_X/Bob`, `Kate` or `Zombie` | Human mesh | None, because the block lists no `animationPrefix` | `media/scripts/generated/animations_meshes.txt:3-9`, `zombie/core/skinnedmodel/ModelManager.java:249-253` |
| `anims_X/<folder named in another mesh block>` | That mesh | The block's `animationPrefix` values; a value starting with `!` excludes | `media/scripts/generated/animations_meshes.txt:23-60`, `zombie/core/skinnedmodel/ModelManager.java:249-269` |
| `anims_X/<any other folder>` | Human mesh | None | `zombie/core/skinnedmodel/ModelManager.java:1811-1856` |
| a loose file in `anims_X` | Human mesh | None, and the file type is not tested | `zombie/core/skinnedmodel/ModelManager.java:1811-1856` |

A scan goes into subfolders of the folder it reads. :cite[(`zombie/core/skinnedmodel/ModelManager.java:212-247`)] A scan of a mesh's folder loads every file that passes the prefix test and does not test the file type. :cite[(`zombie/core/skinnedmodel/ModelManager.java:226-236`, `zombie/core/skinnedmodel/ModelManager.java:249-269`)] The prefix `Bob_` and `Kate_` seen in `player.xml` belongs to an `animNodeFilter` element that no engine source reads, so it is not a rule for file names. :cite[(`media/AnimSets/player.xml:3-6`)]

## How a clip file becomes a clip

The loader reads the file with Assimp, finds the skeleton in it, and turns each animation in the scene into one clip.

The file type is chosen from the file name: `.txt` is the old text format, and otherwise the loader tries `.fbx`, `.glb` and `.x` in turn. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:60-120`)] An existing file with any other extension is read as an `.x` file. When the loader finds no file under the name, it returns nothing and the asset is marked as failed with the log line "Failed to load asset". :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:78-92`, `zombie/core/skinnedmodel/model/AnimationAssetManager.java:41-46`)]

For `.fbx` and `.glb` the loader multiplies every key position by 0.01 and applies a quarter turn about the X axis, and for `.x` it applies neither. :cite[(`zombie/core/skinnedmodel/model/FileTask_LoadAnimation.java:66-112`, `zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:321-333`)] An animation that leaves Blender at the wrong scale or axis will therefore look wrong in game even when it loads.

### What the importer needs inside the file

The file must hold a skinned mesh, or the importer cannot find the skeleton.

The importer takes the earliest mesh in the file that has bones. A scene with no mesh at all logs "No such mesh", and a scene whose earliest mesh has no bones is treated as a static mesh, so no skeleton is built. :cite[(`zombie/core/skinnedmodel/model/jassimp/ProcessedAiScene.java:54-72`, `zombie/core/skinnedmodel/model/jassimp/ProcessedAiScene.java:104-114`)] Reading the clips of a file takes the clips from that skeleton, so a file without one gives no clips. :cite[(`zombie/core/skinnedmodel/model/jassimp/ProcessedAiScene.java:248-257`)] In the file's node tree it looks for a node named `Dummy01` as the skeleton root, or `VehicleSkeleton` for a vehicle, and adds `Translation_Data` when it exists. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:62-90`)]

The importer starts from the bone names of the target mesh. It adds any bone that is only in the file, and binds each animation channel to a bone by the channel's node name. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:92-122`, `zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:392-402`)] A channel whose name is not a known bone is logged as "Could not find bone index for node name" and skipped. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:398-400`)] The bone map is a case-sensitive `HashMap`, so `bip01_head` does not match `Bip01_Head`. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:37`, `zombie/core/skinnedmodel/model/SkinningData.java:26`)]

### The clip's name

A clip is named by the animation's name in the file, cut at its `|` separator, and a node plays it by that name.

Every animation in the scene becomes a clip. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:173-184`)] The name is the text after the `|` separator, trimmed, so an exporter that writes `Armature|Bob_MyClip` gives the clip `Bob_MyClip`. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:343-349`)] For a `.txt` file the name is the line read from the file. :cite[(`zombie/core/skinnedmodel/model/ModelLoader.java:271-273`)]

When a node asks for a clip, the player looks the name up in the skeleton's clip map, which does not ignore case. If there is no match it logs "Anim Clip not found" and plays nothing. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:411-433`, `zombie/core/skinnedmodel/model/SkinningData.java:21`)] The file name matters for something else: the loader keys each file by its path under `media`, lowercased, without its extension and without a leading `anims/` or `anims_x/`. :cite[(`zombie/ZomboidFileSystem.java:936-951`, `zombie/core/skinnedmodel/ModelManager.java:1561-1583`)]

## Which clip wins when mods overlap

Files with the same key compete by mod priority, but clips of the same name in files with different keys are not decided that way.

The base game has priority 0, and a mod gets its position in the load order plus one. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1665-1683`)] For files with the same key, the one from the mod with equal or higher priority replaces the other. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1718-1743`, `zombie/core/skinnedmodel/ModelManager.java:1745-1752`)] The winning file's clips are then copied into the skeleton's clip map, which replaces any clip already there with the same name. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1734-1738`)]

The trap is in the second step. The priority test compares file keys, and the copy into the clip map is by clip name, in the order of a `HashMap` of mods. :cite[(`zombie/core/skinnedmodel/ModelManager.java:125`, `zombie/core/skinnedmodel/ModelManager.java:1729-1739`)] If two mods put clips with the same name in files with different paths, which one ends up in the map is not set by priority in this code. We did not run it, so name your clips with a mod-specific prefix.

The `common` and version folders of one mod count as the same place. Two files with the same path under them get one key, and the later scan replaces the earlier one with the log line "Overwriting asset". :cite[(`zombie/core/skinnedmodel/ModelManager.java:1565-1583`)]

## Models that attach to bones

A model script can pin a model to a bone through an `attachment` block, and a held item sits on `Bip01_Prop1` or `Bip01_Prop2`.

An `attachment` block in a model script reads the keys `bone`, `offset`, `rotate` and `scale`. :cite[(`zombie/scripting/objects/ModelScript.java:118-141`)] The scale is held at 0.01 or more. :cite[(`zombie/scripting/objects/ModelAttachment.java:68`)] The engine has a fixed list of attachment ids it uses itself: `world`, `head`, `head_hat`, `bowtie`, `Bip01_Prop2`, `Bip01_Prop1`, `knife_shoulder` and `muzzle`. :cite[(`zombie/scripting/objects/ModelAttachmentId.java:10-24`)]

The item in a character's primary hand is attached to `Bip01_Prop1` and the secondary-hand item to `Bip01_Prop2`. :cite[(`zombie/core/skinnedmodel/ModelManager.java:660-700`)] Because those two bones are reparented to the hands for a player, an animation moves a held item by moving the hand. :cite[(`zombie/characters/IsoPlayer.java:1223-1224`)] The sub layer weights in an AnimSet node also default to full weight on both prop bones, as described on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions). :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:256-262`)]

## A clip the game cannot load

A clip can fail for a handful of reasons, and each one has its own log line.

| Cause | What the engine does | Code |
|---|---|---|
| The file has no mesh with bones | Builds no skeleton, and logs "No such mesh" when the scene has no mesh at all | `zombie/core/skinnedmodel/model/jassimp/ProcessedAiScene.java:54-72` |
| A channel names a bone that the skeleton lacks | Logs "Could not find bone index for node name" and skips that channel | `zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:398-400` |
| The loader finds no file under the name | Logs "Failed to load asset" and marks the asset failed | `zombie/core/skinnedmodel/model/AnimationAssetManager.java:41-46` |
| A node asks for a clip name that is not in the clip map | Logs "Anim Clip not found" and plays nothing | `zombie/core/skinnedmodel/animation/AnimationPlayer.java:423-431` |
| A node's deferred bone is missing | Logs "Deferred bone not found" | `zombie/core/skinnedmodel/animation/AnimationPlayer.java:452-455` |
| A node's bone mask names a bone that does not exist | Logs "Bone not found" | `zombie/core/skinnedmodel/animation/AnimationTrack.java:562-619` |

Because a loose file in `anims_X` is loaded with no file-type test, a note or an image left in that folder is passed to the loader as if it were a clip. We did not check what each file type does there. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1811-1856`, `zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:60-120`)] Keep `anims_X` to clip files.

A server owner should know that a clip is client-side data: the game reads clip files for rendering and for the deferred movement of a character, and the server runs the same animator. :cite[(`zombie/characters/IsoGameCharacter.java:10948`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:519-537`)] Whether the server loads the clip files themselves was not checked.

## Changing a clip while the game runs

A clip file that changes on disk is reloaded by a file watcher, with conditions that we read but did not run.

When a folder of clips is loaded, the engine registers a watcher for it, and that includes mod folders. :cite[(`zombie/core/skinnedmodel/ModelManager.java:238-244`, `zombie/core/skinnedmodel/ModelManager.java:1880-1935`)]

The engine also registers the `media` folders of each mod with the file watcher. :cite[(`zombie/ZomboidFileSystem.java:495-510`)] The watcher is started with the game and server, and it polls in single player and on a server, and on a multiplayer client only in debug mode. It reloads a changed `.fbx`, `.x`, `.txt` or `.glb` file after 2 seconds without more changes. :cite[(`zombie/GameWindow.java:571`, `zombie/DebugFileWatcher.java:141-181`, `zombie/core/skinnedmodel/ModelManager.java:1914-1935`)] This was read in the code and not tested in a game.

A reload of an existing clip asset goes through the asset manager, and a file with a new key loads as a new asset. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1914-1935`)] Whether the running character picks up the new clip without a restart was not tested. [Modding animations](/pz/build-42/engine/animation-system/modding-animations) gives a restart-safe workflow.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and the shipped scripts and XML. Nothing was run in a game, and the capture holds no clip files, so we did not open a vanilla clip to look at its bone names or clip names. Not verified: whether extra bones found only in a clip file have any effect, what happens in game to a file with no mesh beyond the log line and the missing skeleton, how two mods' clips of the same name resolve across different file paths, whether the server loads clip files, and whether a reloaded clip reaches a character that is already animating.
:::
