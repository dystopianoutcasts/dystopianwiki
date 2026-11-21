---
id: build-42-animal-pipeline
slug: animal-pipeline
title: How Build 42 loads and animates an animal
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: advanced
tags:
  - animals
  - rigging
  - animation
  - animsets
excerpt: >-
  What 42.22 needs for a new animal type: a rig of at most 60 bones, an AnimSet, an action group, clips tied to the mesh by an animationsMesh script, and a model script. With the traps found.
last_updated: '2026-11-21'
related_articles:
  - animals-overview-the-b42-living-animal-system
  - modding-the-animaldefinitions-global-table
  - butchering-and-dead-animals
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21. Model, clip and shader files are not in the capture; they were read from the installed game of the same Steam build (26486631).

**Who this page is for:** [riggers and animators building a new animal](#1-the-bone-limit) | [modders wiring one up](#4-what-binds-an-animal-to-its-animations)

This page is for modders who want to add an animal that does not exist in vanilla. It says what the engine reads, what it refuses silently and what a first rig should look like. It does not teach modeling.

:::callout[The 1-minute version]{kind=key}
- Animated models are built around fixed arrays of 60 bones: a clip keeps keyframes for bone numbers 0 to 59 only, and the animal shader holds 60 matrices. Plan for at most 60 bones, though the vanilla maximum is 46. :cite[(`zombie/core/skinnedmodel/animation/AnimationClip.java:36`, `zombie/core/skinnedmodel/animation/AnimationClip.java:133-150`, `zombie/core/skinnedmodel/advancedanimation/AnimatedModel.java:1401-1412`)]
- An animal type needs three things by name: an AnimSet folder, an action group folder and clips that an `animationsMesh` script ties to the mesh. The definition's `animset` field selects the first two. :cite[(`zombie/characters/animals/IsoAnimal.java:372-373`, `zombie/characters/animals/IsoAnimal.java:1509`, `zombie/characters/animals/IsoAnimal.java:1663`)]
- AnimSets are read from the game and from every enabled mod. The action group reader we found looks only in the game's own folder, so a mod's own action group is an open question. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-65`, `zombie/characters/action/ActionGroup.java:39-44`)]
- The vanilla raccoon runs on 13 clips, 19 AnimSet nodes and 11 states, and six clips are enough for the mandatory states (counted from the installed files; see sections 5 and 6).
- 42.22 adds one bone check: a saved ragdoll corpse pose with more than 256 bones fails to load. :cite[(`zombie/iso/objects/IsoDeadBody.java:873-875`)]
:::

:::facts
- **Bone arrays in the animation code** 60 :cite[(`zombie/core/skinnedmodel/animation/AnimationClip.java:36`, `zombie/core/skinnedmodel/animation/AnimationTrack.java:59`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1844`, `zombie/core/skinnedmodel/advancedanimation/AnimatedModel.java:1404`)]
- **Corpse pose limit, new in 42.22** 256 bones :cite[(`zombie/iso/objects/IsoDeadBody.java:154`, `zombie/iso/objects/IsoDeadBody.java:873-875`)]
- **Influences per vertex** 4 (installed `animalEffect.vert`)
- **animationsMesh scripts in vanilla** 23, one per mesh :cite[(`media/scripts/generated/animations_meshes.txt:1-163`)]
- **Animal models using the `animalEffect` shader** 73 :cite[(`media/scripts/generated/models_animals.txt:218-231`)]
:::

## 1. The bone limit

**The engine's animation arrays hold 60 bones, so a rig above 60 bones will not animate fully.**

A clip sorts its keyframes into a table with one slot per bone, and the table has 60 slots. :cite[(`zombie/core/skinnedmodel/animation/AnimationClip.java:36`)] The routine that fills it loops from bone 0 to 59 only, so keyframes for a bone numbered 60 or higher are never indexed. :cite[(`zombie/core/skinnedmodel/animation/AnimationClip.java:133-150`)] A playing track has a 60-slot pose array, the player has a 60-slot index scratch array, and the matrix palette sent to the shader is built with 60 matrices. :cite[(`zombie/core/skinnedmodel/animation/AnimationTrack.java:59`, `zombie/core/skinnedmodel/animation/AnimationPlayer.java:1844`, `zombie/core/skinnedmodel/advancedanimation/AnimatedModel.java:1401-1412`)]

The same arrays are in 42.21, so this is not a new limit. The shader that animal models use declares 60 matrices too (installed `animalEffect.vert`, `uniform mat4 MatrixPalette[60]`), and all 73 model blocks in the vanilla animal model file name it. :cite[(`media/scripts/generated/models_animals.txt:218-224`)]

An older version of this page said there is no bone cap, because the constant `MAX_BONES = 64` in `Shader.java` is never used and one shader reads its `boneCount` from a storage buffer. Both facts are still true, but the 60-slot arrays above are the real limit for these models. :cite[(`zombie/core/skinnedmodel/shader/Shader.java:96`)] We read this in the code and did not test a 61-bone rig in a running game.

Corpses add a second number. A saved dead body stores its pose, and 42.22 refuses to load a saved pose, which is stored only when the body fell as a ragdoll, if it claims more than 256 bones or more bones than its data holds. :cite[(`zombie/iso/objects/IsoDeadBody.java:154`, `zombie/iso/objects/IsoDeadBody.java:873-875`)] The 42.21 build had no such check. A render-time check, `isBoneCountMismatched`, compares the pose with the model's bone count before the corpse is drawn; it tests for a different count, not a maximum. :cite[(`zombie/core/skinnedmodel/animation/AnimationPlayer.java:153-155`, `zombie/core/skinnedmodel/DeadBodyAtlas.java:1406`, `zombie/iso/fboRenderChunk/FBORenderCorpses.java:431`)]

Skinning allows 4 influences per vertex: the vertex stage reads four weights and four indices and sums four terms. (Installed `animalEffect.vert`.) A fifth weight is dropped by the exporter or loader, which shows as a collapsing vertex, not as an error.

## 2. Vanilla rigs: counts and naming

**Every vanilla skinned model has 18 to 46 bones and carries the same top nodes.**

We counted the `Frame` blocks of every `.x` file in the installed `media/models_X/Skinned` folder. Each has `Dummy01` and `Bip01`, and all but three (`Sheep_RamSheared_Headless`, `Turkey_Skeleton`, `Turkey_Skeleton_NoHead`) have `Translation_Data`. The engine's default deferred-movement bone name is `Translation_Data`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:98`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:350`)]

| Model | Bones | Vertices |
|---|---|---|
| Female and male skeleton | 46 | 792 and 793 |
| CowBody | 45 | 670 |
| Sheep (ram, ewe, lamb) | 43 to 45 | 495 to 711 |
| Deer (doe, stag, fawn) | 41 | 521 to 730 |
| Rabbit | 39 | 397 |
| Turkey | 37 | 787 |
| Turkey poult | 30 | 779 |
| MaleBody and FemaleBody | 36 | 617 and 660 |
| Bull, cow calf, chicken hen, raccoon | 35 | 197 to 813; raccoon 387 |
| Chicken cockerel | 29 | 534 |
| Pig (boar, sow, piglet) | 32 | 359 to 582 |
| Rat and mouse | 31 | 205 to 409 |
| Chicken chick | 18 | 197 |

Vanilla animal meshes are small: a raccoon has 387 vertices, a cow 670 and a human body 617 to 660. The vanilla raccoon hierarchy (`Raccoon_Body.x`), closest to a cat among the quadrupeds, is:

```
Raccoon > Dummy01 > Bip01 > Bip01_Pelvis > Bip01_Spine
  Bip01_L/R_Thigh > Calf > Foot > Toe0 > Toe0Nub
  Bip01_Neck > Bip01_L/R_Clavicle > UpperArm > Forearm > Hand > Finger0 > Finger0Nub
  Bip01_Neck > Bip01_Head > Bip01_HeadNub
  Bip01_Tail > Tail1 > Tail2 > TailNub
Translation_Data
```

Vanilla spends its bones on one spine bone, one neck, one toe per foot, three tail bones, and a clavicle in place of a shoulder blade. Whether the names are required is not settled by the engine reading: a rig with other names ("CompanionCat", an outside mod) is reported to run in game, and we did not check it. Keeping the vanilla names is the safe default, because `Translation_Data` and `Dummy01` carry engine meaning, and model-script attachments address bones by name. :cite[(`media/scripts/generated/models_animals.txt:218-231`)]

## 3. Scale

**An animal is drawn at its animal size times the same 1.5 model factor as a human.**

The body of an animal is scaled by its current animal size, `getAnimalSize()`, which is a value that grows from the type's `minSize` toward its `maxSize`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimatedModel.java:322`, `zombie/core/skinnedmodel/advancedanimation/AnimatedModel.java:1200`, `zombie/characters/animals/IsoAnimal.java:1603-1605`, `zombie/characters/animals/datas/AnimalData.java:1734-1768`)] The 1.5 is a model-view factor applied to everything drawn this way, humans included. :cite[(`zombie/core/Core.java:448`, `zombie/core/skinnedmodel/ModelCamera.java:43`)] So next to a human an animal is drawn at its size value times its mesh units. The older page cited `IsoAnimal.java` for the 1.5; that code builds the transform of an attachment point on the animal, not the body scale. :cite[(`zombie/characters/animals/IsoAnimal.java:2626-2632`)]

The team's notes measure the human mesh at 0.9857 units for about 1.75 m, so one unit is about 1.775 to 1.8 m, and a real cat at the withers (0.247 m) is about 0.139 units at size 1.0. We did not re-measure that here. Vanilla enlarges small animals: the raccoon mesh is about 0.622 units long at size 0.9 to 1.2, which is 1.0 to 1.3 m, well above a real raccoon. Whether a new animal should be true size or exaggerated is a design choice the engine does not make for you.

## 4. What binds an animal to its animations

**The `animset` field names the AnimSet and the action group; a separate script ties the clip folder and the clip names to the mesh.**

The definition's `animset` is parsed into the animal's definition, and `GetAnimSetName()` returns it, or `cow` when the animal has no definition. :cite[(`zombie/characters/animals/AnimalDefinitions.java:272-274`, `zombie/characters/animals/IsoAnimal.java:372-373`)] The game builds the AnimSet from that name and sets the action group from the same name. :cite[(`zombie/characters/animals/IsoAnimal.java:1509`, `zombie/characters/animals/IsoAnimal.java:1663`, `zombie/characters/animals/AnimalManagerMain.java:109`)]

| Piece | Where it is read | Mods? | Code |
|---|---|---|---|
| AnimSet states (`media/AnimSets/<animset>/<state>/*.xml`) | Every folder of that name in the game and in each enabled mod, merged. | Yes | `zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-65`, `zombie/ZomboidFileSystem.java:1209-1221` |
| Action group (`media/actiongroups/<animset>/`) | The reader builds its paths from the game's media folder. | Open question | `zombie/characters/action/ActionGroup.java:39-44`, `zombie/ZomboidFileSystem.java:247-251` |
| Clips (`media/anims_X/<folder>/`) | The `animationsMesh` script lists the folder and name prefix; the game loads that folder, and each mod's folder of the same name. | Yes | `zombie/scripting/objects/AnimationsMesh.java:39-45`, `zombie/core/skinnedmodel/ModelManager.java:1665-1700` |
| Model and `animationsMesh` link | The model script names the `animationsMesh` it uses. | Script | `media/scripts/generated/models_animals.txt:218-231` |

The `animationsMesh` script is what the older page missed. It has a `meshFile`, one or more `animationDirectory` lines and optional `animationPrefix` lines that select clips by name. The raccoon's is the simplest: :cite[(`media/scripts/generated/animations_meshes.txt:101-105`)]

```
animationsMesh Raccoon
{
    meshFile = Skinned/Raccoon_Body,
    animationDirectory = Raccoon,
}
```

The chicken is the example with prefixes: one directory serves three meshes, and the prefixes (`Chk_`, `Chk_Chick_`, `Chk_Cock_`, with `!` meaning "not") split the clips between hen, chick and cockerel. :cite[(`media/scripts/generated/animations_meshes.txt:44-67`)]

A new type named `cat` therefore needs `AnimSets/cat/`, an action group for `cat`, an `animationsMesh` and a model script, and sets `animset = "cat"` in its definition. Where the action group comes from for a mod is the open part. The server and client compare a checksum of every AnimSet and action-group XML file of the game and of each enabled mod in multiplayer, so those files must match on both sides. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:742-812`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:852-859`)] The mod's folders are recorded under `<mod>/common/media/` and `<mod>/42/media/`. :cite[(`zombie/gameStates/ChooseGameInfo.java:517-520`)]

## 5. AnimSet XML and action groups

**An AnimSet node names a clip and its timing; an action group says which state follows which.**

A node file lives at `media/AnimSets/<animset>/<state>/<node>.xml`. The raccoon's walk node reads: :cite[(`media/AnimSets/raccoon/walk/defaultWalk.xml:1-4`)]

```xml
<animNode>
  <m_Name>defaultWalk</m_Name>
  <m_AnimName>Rac_Walk</m_AnimName>          <!-- clip name, resolved from anims_X -->
  <m_BlendTime>0.20</m_BlendTime>
  <m_SpeedScale>1.20</m_SpeedScale>
  <m_SyncTrackingEnabled>false</m_SyncTrackingEnabled>
  <m_Events> ... PlayBreedSound at 25 percent, parameter walkFront ... </m_Events>
</animNode>
```

The fields the Java reads include `m_Name`, `m_AnimName`, `m_BlendTime`, `m_SpeedScale`, `m_SpeedScaleVariable`, `m_SpeedScaleRandomMultiplierMin` and `Max`, `m_SyncTrackingEnabled`, `m_Conditions`, `m_Events` and `m_Transitions`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:34`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:48`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:120`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:140-154`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:178`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:190-202`)] The raccoon's `idle1` node plays `Rac_Idle01` at speed 0.48 with a random multiplier of 0.70 to 1.20, and moves to `idleSit` through a transition (`m_Target`) that plays the clip `Rac_IdleToLieDown`. The `eating` node waits for the condition `idleAction == "eat"`, a string variable, and ends with the event `idleActionEnd`. :cite[(`media/AnimSets/raccoon/idle/idle1.xml:1-12`, `media/AnimSets/raccoon/eating/eating.xml:1-12`)]

`m_SpeedScale` is a number or the name of an animation variable: the engine uses the number when it parses, and otherwise reads the variable as a float. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:289-291`)] That is the lever that ties clip tempo to the animation. Vanilla animal nodes we looked at use fixed numbers. How closely the clip speed follows real movement speed is still not established, and it decides whether an authored gait cadence survives in game, so test it first with a real clip.

The action group is a folder of XML files, one folder per state, and the raccoon's files show its shape. :cite[(`media/actiongroups/raccoon/actionGroup.xml:1-4`, `media/actiongroups/raccoon/idle/to_walk.xml:1-8`, `media/actiongroups/raccoon/defaultTransitions.xml:1-14`)]

```
actionGroup.xml            <actiongroup><initial>idle</initial></actiongroup>
defaultTransitions.xml
<state>/<state>.xml        editor bounds only
<state>/to_<other>.xml     <transition><transitionTo>walk</transitionTo>
                             <conditions><isTrue>bMoving</isTrue>
                                         <isFalse>bPathfind</isFalse></conditions></transition>
```

The raccoon's AnimSet has 11 state folders: `climbfence`, `deadbody`, `death`, `eating`, `falldown`, `followwall`, `hitreaction`, `idle`, `onground`, `pathfind` and `walk`. Its action group has the same states except `deadbody`.

The cow has `attack`, `onhook`, `trailer` and `zone` but no `climbfence`, and the hen has `hutch`, `sit` and `trailer`, also without `climbfence`. The cow's `onhook` state is the butcher hook pose. :cite[(`media/AnimSets/cow/onhook/onhook.xml:1-3`, `media/actiongroups/cow/onhook/onhook.xml:1-3`)]

## 6. The clip list a new animal needs

**The vanilla raccoon ships 13 clips, and its 19 nodes reuse them, so the clip count is a floor and not a wall.**

The 13 clips in the installed `media/anims_X/Raccoon` folder are `Rac_Idle01`, `Rac_Idle02`, `Rac_Idle03`, `Rac_IdleToLieDown`, `Rac_IdleLyingDown`, `Rac_LyingDownToIdle`, `Rac_Walk`, `Rac_Run`, `Rac_ClimbUp`, `Rac_ClimbDown`, `Rac_HitReaction`, `Rac_Death` and `Rac_Dead`. There are 19 node files in the raccoon AnimSet, because several nodes share a clip: `eating` plays `Rac_Idle01`, and the pathfind and followwall nodes reuse the walk and run clips. :cite[(`media/AnimSets/raccoon/eating/eating.xml:1-6`)] Vanilla ships no attack, eat, drink or sniff clip for the raccoon.

A minimal clip set for a cat, reasoned from that mapping and not tested: idle, walk, run, hit reaction, death and dead. Six clips animate every mandatory state. Lie-down, sit, climb and extra idles are polish.

## 7. The model script

**A model script names the mesh, the shader, whether it is static and the `animationsMesh`, and pins props to bones with `attachment <name> { offset, rotate, bone }` blocks.**

The raccoon's model block is: :cite[(`media/scripts/generated/models_animals.txt:218-231`)]

```
model Raccoon_Body
{
    mesh = Skinned/Raccoon_Body,
    shader = animalEffect,
    static = false,
    animationsMesh = Raccoon,
    attachment head { offset = -0.0106 0.2881 0.0874, rotate = -179.0 -5.0 95.0, bone = Dummy01, }
}
```

All 73 models in the animal model file name `shader = animalEffect`, which we counted. :cite[(`media/scripts/generated/models_animals.txt:218-224`)] That shader exists as a vertex and a fragment file in the installed `media/shaders` folder, takes a 60-matrix palette and the animal's final scale, and reads one texture. The mod-side grammar of the model script beyond these keys is not covered here.

## 8. Silent-failure traps

**Most failures here are quiet: a missing file is a no-op, not an error.**

1. **Wrong media folder.** `common/media` and `42/media` are not interchangeable for every asset class, and a misplaced file does nothing. AnimSets and clips are read from mods; an action group may not be (section 4).
2. **Clip changes need a full restart.** The clip files are loaded when the game starts. AnimSet and action-group XML can be reloaded, because debug file watchers watch both folders. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:70-77`, `zombie/core/skinnedmodel/ModelManager.java:1665-1700`)] This is also from the team's animation skill; we did not test it.
3. **Ship clips as text `.X`.** All 2,232 files under the installed `anims_X` are `.x` or `.X`; none is `.glb`. The team's notes say a `.glb` clip dropped a climbing character to the floor; not retested.
4. **Every bone needs a full rotation, scale and translation track in every clip,** because the exporter drops tracks with no keys. (Team notes; not retested.)
5. **`Translation_Data` is the deferred movement channel.** The engine's default deferred bone is `Translation_Data`, and a looping in-place clip keys `Bip01` and leaves `Translation_Data` still. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:98`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:350`)]
6. **Four influences per vertex.** A fifth is dropped quietly.
7. **A dead animal needs data from the definitions.** The death code reads the parts list and the `meatRatio` gene with no checks, so a new animal needs both. See [butchering](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals). :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:18-27`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`)]

## 9. Our cat rig, first pass

**These are our design choices for a cat, not engine facts; the one hard number is the 60-bone arrays.**

| Item | Value | Basis |
|---|---|---|
| Bone budget | 40 to 50, and never over 60 | section 1 |
| Naming | `Dummy01`, `Bip01`, `Bip01_Pelvis` and so on, plus `Translation_Data`, vanilla style | section 2 |
| Extra bones over vanilla | scapula per side, 3 or 4 spine bones, 2 neck bones, 5 to 7 tail bones, jaw, 2 ear bones per side | team rig table |
| Per-digit toes | Not for version 1: vanilla uses one toe bone per foot and the mesh cannot show individual toes | sections 1 and 2 |
| Mesh density | 800 to 2,000 vertices; vanilla animals are 200 to 813 | section 2 |
| Mesh format | `.X`, as every vanilla skinned model | section 2 |
| Clip format | text `.X` | trap 3 |
| Scale | one unit is about 1.775 m, so a real cat is 0.139 units at the withers; exaggeration is a separate choice | section 3 |
| Data to ship | `AnimSets/cat/`, an action group `cat`, `anims_X/Cat/`, an `animationsMesh`, a model script, and `animset = "cat"` | sections 4 to 7 |
| Minimum clips | idle, walk, run, hit reaction, death, dead | section 6 |

## 10. What is still open

**Eight questions from the first pass remain, some narrowed.**

1. How closely clip speed follows movement speed. The lever is `m_SpeedScale` (section 5); no number is established.
2. Whether a mod can add its own action group. The loader we found reads only the game's folder, and the multiplayer checksum counts the mod's files (section 4). Not tested.
3. Vertex and bone budgets in practice: no performance data. The 60-bone arrays are the hard number.
4. Whether the engine looks up an animal bone by name. The animal code names `Bip01_Head` as the twist bone and `Bip01` as the counter-rotation bone, and `ropeBone` defaults to `Bip01_Head`. :cite[(`zombie/characters/animals/IsoAnimal.java:546-547`, `zombie/characters/animals/AnimalDefinitions.java:124`)] The attachment names used by the animal code are not all searched.
5. What the animal model script still needs beyond section 7.
6. What else a new animal needs: corpse and rotten textures, skeleton models, head and skull items. The parts list names the head and skull items, and the breed names the rotten texture and the icons. :cite[(`media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:13-15`, `zombie/characters/animals/AnimalDefinitions.java:798-800`)]
7. Whether animation state names cross the wire. The animal packet carries a real state value and the `idleAction` string. :cite[(`zombie/network/packets/character/AnimalPacket.java:40`, `zombie/network/packets/character/AnimalPacket.java:50`)]
8. Whether `.glb` is safe for a skinned animal mesh.

:::callout[How we know]{kind=proof}
The Java and Lua are read from the 42.22 capture. The bone counts, the clip counts and the shader facts come from the installed game, which has the same Steam build id as the capture; those files are binary or are not in the capture, so they carry no line citations. We did not run the game, so the 60-bone limit is a reading of the arrays, not a test with a 61-bone rig.

Not verified: that a 61-bone rig fails; how a mod's action group is found; clip speed against movement speed; the notes about `.glb` clips, missing tracks and the CompanionCat rig, which come from team notes and an outside mod.

Changed since the older page: "there is no bone cap" is replaced by the 60-slot arrays and the new 256-bone corpse check; "a mod can ship both trees" is split into the AnimSet merge and the open action-group question; the `animationsMesh` script is new; the scale citation was moved from a held-item matrix to the model scale; the clip count of 2,209 is now 2,232. The old Godot pipeline note and the CompanionCat vertex count are dropped.
:::
