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
  What the engine requires of a new animal type, measured from the B42 decompile
  and the installed game files (PZ
  42.19...
last_updated: '2026-09-29'
---
# How Build 42 loads and animates an animal

> Source: 09-pz-b42-animal-pipeline.md (compiled 2026-09-11, verified against Project Zomboid 42.19). Imported 2026-09-29. Confidence tags in the text are the original author's.

What the engine requires of a new animal type, measured from the B42 decompile and the installed game files (PZ 42.19, the `media` folder in your Steam library's `ProjectZomboid` folder).

Tags: `[VERIFIED]` read in code or shipped data, with the citation. `[DERIVED]` computed from verified values. `[GAP]` not established. `[INFERENCE]` reasoned but not proven.

> This replaces the Godot pipeline document (07) for everything engine-specific. 07's mesh, skin-weight and gait math still applies.

## Summary

- **There is no bone-count cap.** `MAX_BONES = 64` exists but is never used. Skinning runs through a storage buffer sized at runtime. The real hard limit is **4 influences per vertex**.
- **Every vanilla skinned model, animals included, is a Character Studio biped**: `Dummy01` > `Bip01` > `Bip01_Pelvis`, plus a `Translation_Data` node. Vanilla rigs run 18-46 bones; the raccoon has 35 and the human 36.
- **Vanilla animal meshes are very low-poly**: raccoon 387 vertices, cow 670, human 617-660. CompanionCat ships 6,193.
- **An animal type needs three data trees**, all of which a mod can ship: `AnimSets/<name>/`, `actiongroups/<name>/`, and clips under `anims_X/`. `AnimalDefinitions.animset` selects all three by name.
- **The raccoon runs on 13 clips across 11 states.** States can share a clip, so the clip count is a floor, not a wall.

## 1. Bone limit and vertex influences

| Fact | Evidence |
|---|---|
| `MAX_BONES = 64` is declared and **never read**. A grep for it across `zombie/*` returns only the declaration. | `zombie\core\skinnedmodel\shader\Shader.java:96` `[VERIFIED]` |
| Skinning uses a shader storage buffer with a runtime-length array and a `boneCount`, so bone count is a data value, not a compile-time bound. | `media\shaders\util\skinning.glsl:7-15`, `skinning.h:6` `[VERIFIED]` |
| Exactly **4 influences per vertex**: the weights and indices are `vec4`, and the skin matrix sums four terms. | `media\shaders\util\skinning.glsl:5-6,18-24` `[VERIFIED]` |
| Bone arrays are allocated per model from `skinningData.numBones()`, with no clamp. | `zombie\core\skinnedmodel\animation\AnimationPlayer.java:187-189` `[VERIFIED]` |
| No "too many bones" check exists. A regex sweep for bone-count comparisons across `zombie` found nothing. | `[VERIFIED]` (absence of evidence, not proof) |

**CompanionCat's claim that it "pruned to 56 bones to fit the engine limit" is unsupported by the code.** Either it hit a different limit (an exporter or importer, not the engine), or the constraint was assumed. Do not treat 56 or 64 as a budget, but stay near vanilla until a high-bone-count rig is proven in game `[GAP]`.

## 2. Vanilla rigs: counts and naming

Bone counts are `Frame` blocks in the shipped `.x` files (all of `media\models_X\Skinned\*.x` parsed) `[VERIFIED]`:

| Model | Bones | Vertices |
|---|---|---|
| Female_Skeleton / Male_Skeleton | 46 | 792 / 793 |
| CowBody | 45 | 670 |
| Sheep (ram / ewe) | 43-45 | 495-711 |
| Deer (doe / stag / fawn) | 41 | 521-730 |
| Rabbit | 39 | 397 |
| Turkey | 37 | 787 |
| **MaleBody / FemaleBody** | **36** | 617 / 660 |
| Bull, cow calf, chicken hen, **raccoon** | 35 | 197-813, **raccoon 387** |
| Pig (boar / sow / piglet) | 32 | 359-582 |
| Rat, mouse | 31 | 205-409 |
| Chicken chick | 18 | 197 |

**Every one of them** carries `Dummy01`, `Bip01` and `Translation_Data` (the only exceptions are a few headless or skeleton variants missing `Translation_Data`) `[VERIFIED]`.

Raccoon hierarchy, the closest quadruped to a cat (`media\models_X\Skinned\Raccoon_Body.x`) `[VERIFIED]`:

```
Raccoon > Dummy01 > Bip01 > Bip01_Pelvis > Bip01_Spine
  Bip01_L/R_Thigh > Calf > Foot > Toe0 > Toe0Nub
  Bip01_Neck > Bip01_L/R_Clavicle > UpperArm > Forearm > Hand > Finger0 > Finger0Nub
  Bip01_Neck > Bip01_Head > Bip01_HeadNub
  Bip01_Tail > Tail1 > Tail2 > TailNub
Translation_Data
```

Note what vanilla spends its bones on: **one spine bone, one neck, one toe per foot**. It has no shoulder-blade bone (the clavicle stands in), no lumbar articulation, and three tail bones.

**Are the names required?** CompanionCat runs a rig whose bones are named `Wolf_*SHJnt`, keeping only `Dummy01`, `Bip01_Head`, `Bip01_L/R_Foot` and `Translation_Data`, and it animates in game. So the engine does not demand the full biped naming `[VERIFIED by shipped counter-example]`. Keeping vanilla's convention is still the safer default, since `Translation_Data` and `Dummy01` carry engine meaning (below), and model-script attachments address bones by name.

## 3. Scale

| Fact | Evidence |
|---|---|
| Animals render at `1.5 * getAnimalSize()`. | `IsoAnimal.java:2634` `[VERIFIED]` |
| The 1.5 is a global model-view factor applied to everything, humans included. | `Core.java:2615`, `ModelCamera.java:43` `[VERIFIED]` |
| So relative to a human, an animal is drawn at `animalSize` times its mesh units. | `[DERIVED]` |
| `getAnimalSize()` is `AnimalData.size`, which starts at `minSize` and grows with age toward `getMaxSize()` (gene-modified). | `IsoAnimal.java:1609-1610`, `AnimalData.java:234-241,1754+` `[VERIFIED]` |
| The human mesh is 0.9857 BU for about 1.75 m, so **1 unit is about 1.775-1.8 m** for skinned characters. | `PZ_3D_Assets\README.md` section 1; `pz-animation` skill section 7 `[VERIFIED]` |
| Real cat withers 0.247 m therefore equals **about 0.139 mesh units** at `animalSize = 1.0`. | `[DERIVED]` |
| Vanilla enlarges small animals: the raccoon mesh is 0.622 units nose-to-tail at size 0.9-1.2, which is about 1.0-1.3 m, well above a real raccoon. | `[DERIVED]` from `Raccoon_Body.x` bounds and `RaccoonDefinitions.lua` |

**Decision still open `[GAP]`:** author the cat at true size (and look small, like a real cat beside a 1.75 m survivor) or follow vanilla's readability exaggeration. CompanionCat chose exaggeration, at roughly 1.5-2x life size.

## 4. What binds an animal to its animations

| Step | Evidence |
|---|---|
| `AnimalDefinitions` parses an `animset` field from the Lua definition. | `AnimalDefinitions.java:43,272-273` `[VERIFIED]` |
| The animal's animation set is `AnimationSet.GetAnimationSet(GetAnimSetName())`. | `IsoAnimal.java:1515` `[VERIFIED]` |
| `GetAnimSetName()` returns `adef.animset`, defaulting to `"cow"` when there is no definition. | `IsoAnimal.java:375-376` `[VERIFIED]` |
| The same name selects the action group (the state machine). | `IsoAnimal.java:1669`, `AnimalManagerMain.java:107` `[VERIFIED]` |
| Mods can ship both trees: the loader maps `<mod>/common/media/{actiongroups,AnimSets,anims_X}` and the `<mod>/42/media/...` equivalents. | `ChooseGameInfo.java:512-515` `[VERIFIED]` |

So a new type named `cat` needs `AnimSets/cat/`, `actiongroups/cat/` and its clips, and sets `animset = "cat"` in its definition.

## 5. AnimSet XML

Files live at `media/AnimSets/<animset>/<state>/<node>.xml`. Raccoon example (`walk/defaultWalk.xml`) `[VERIFIED]`:

```xml
<animNode>
  <m_Name>defaultWalk</m_Name>
  <m_AnimName>Rac_Walk</m_AnimName>          <!-- clip name, resolved from anims_X -->
  <m_BlendTime>0.20</m_BlendTime>
  <m_SpeedScale>1.20</m_SpeedScale>
  <m_SyncTrackingEnabled>false</m_SyncTrackingEnabled>
  <m_Events><m_EventName>PlayBreedSound</m_EventName><m_TimePc>0.25</m_TimePc>
            <m_ParameterValue>walkFront</m_ParameterValue></m_Events>
</animNode>
```

Other fields seen: `m_SpeedScaleRandomMultiplierMin` / `Max` (idle1), `m_Transitions` with `m_Target` plus its own `m_AnimName` for the transition clip (idle1 -> idleSit via `Rac_IdleToLieDown`), and `m_Conditions` with `m_Name` / `m_Type` / `m_Value` (eating waits for `idleAction == "eat"`), plus an end event `idleActionEnd` `[VERIFIED]`.

**`m_SpeedScale` is the lever that ties clip tempo to the animation, not to travel speed** `[VERIFIED as a field]`. How clip playback tracks actual movement speed is `[GAP]`; it decides whether our authored gait cadence survives in game, and it is the first thing to test with a real clip.

## 6. Action groups (the state machine)

`media/actiongroups/<animset>/` `[VERIFIED]`:

```
actionGroup.xml            <actiongroup><initial>idle</initial></actiongroup>
defaultTransitions.xml
<state>/<state>.xml        editor bounds only
<state>/to_<other>.xml     <transition><transitionTo>walk</transitionTo>
                             <conditions><isTrue>bMoving</isTrue>
                                         <isFalse>bPathfind</isFalse></conditions></transition>
```

Raccoon states: `idle`, `walk`, `pathfind`, `followwall`, `eating`, `hitreaction`, `death`, `deadbody`, `falldown`, `onground`, `climbfence`. Livestock add `trailer`, `onhook` and `hutch` `[VERIFIED]`.

## 7. The clip list a new animal needs

Raccoon ships 13 clips in `media/anims_X/Raccoon/` `[VERIFIED]`:

`Rac_Idle01`, `Rac_Idle02`, `Rac_Idle03`, `Rac_IdleToLieDown`, `Rac_IdleLyingDown`, `Rac_LyingDownToIdle`, `Rac_Walk`, `Rac_Run`, `Rac_ClimbUp`, `Rac_ClimbDown`, `Rac_HitReaction`, `Rac_Death`, `Rac_Dead`.

19 animset nodes map onto those 13, because states reuse clips: `eating/eating.xml` plays `Rac_Idle01`, and `pathfind` reuses the walk and run clips `[VERIFIED]`.

**Minimum viable clip set for the cat** `[INFERENCE]` from that mapping: idle, walk, run, hit reaction, death, dead. Six clips animate every mandatory state. Lie-down, sit, climb and extra idles are polish.

Vanilla ships **no** attack, eat, drink or sniff clip for the raccoon, yet CompanionCat's mesh contains clips with those names. Those are the mod's own additions `[VERIFIED]`.

## 8. Model script

Vanilla animal and character models declare (`media/scripts/generated/models_characters.txt`) `[VERIFIED]`:

```
model Male_Skeleton { mesh = Skinned/Male_Skeleton, static = false, animationsMesh = Human, }
```

`animationsMesh` names the rig whose clips this mesh uses, and `attachment <name> { offset, rotate, bone }` pins props to a named bone. CompanionCat's `models_cat.txt` adds `shader = animalEffect` and its saddlebag attachments. The full grammar for animal model scripts, and what `animalEffect` needs, is `[GAP]`.

## 9. Silent-failure traps

1. **Wrong media folder.** `<mod>/common/media/` and `<mod>/42/media/` are not interchangeable for every asset class. A misplaced file is a silent no-op, not an error.
2. **Clip changes need a full game restart.** Clip binaries are read once at startup; a Lua reload does nothing. AnimSet XML is refreshable (`pz-animation` skill section 6).
3. **Ship clips as text `.X`, not `.glb`.** All 2,209 vanilla clips are `.X`, and a `.glb` clip dropped a climbing character to the floor. glTF is scanned, so the name resolves and the failure looks like an animation bug (`pz-animation` skill section 6).
4. **Every bone needs a full R/S/T track in every clip**; the exporter drops tracks with no keys.
5. **`Translation_Data` is the deferred movement channel** and is exempt from the importer's axis correction; `Bip01` is the in-skeleton hip. A looping in-place clip keys `Bip01` and zeroes `Translation_Data`.
6. **Four influences per vertex.** A fifth weight is dropped silently by the exporter or the loader, which shows up as a collapsing vertex, not an error.

## 10. Spec for our cat rig (first pass)

| Item | Value | Basis |
|---|---|---|
| Bone budget | **40-50**, versus raccoon 35 and human 36. No engine cap applies. | sections 1-2 |
| Naming | `Dummy01` > `Bip01` > `Bip01_Pelvis` > ... plus `Translation_Data`, vanilla-style | section 2 |
| Extra bones worth having over vanilla | scapula per side, 3-4 spine bones instead of 1, 2 neck bones, 5-7 tail bones, jaw, 2 ear bones per side | research/01 rig table |
| Per-digit toes | **Not recommended for v1.** No engine cap forbids it, but vanilla uses one toe bone per foot and the mesh density cannot show individual toes. Revisit for claws. | sections 1-2; overturns the earlier Godot-era choice |
| Mesh density | 800-2,000 vertices. Vanilla animals sit at 200-800, CompanionCat at 6,193. | section 2 |
| Mesh format | `.X` (all vanilla skinned models) or `.glb` (CompanionCat precedent). Prefer `.X` for the shipped mesh. | section 2, trap 3 |
| Clip format | text `.X`, `pz_compat=True` | trap 3 |
| Scale | 1 unit is about 1.775 m; real-size cat is 0.139 units at the withers. Exaggeration is a separate decision. | section 3 |
| Data to ship | `AnimSets/cat/`, `actiongroups/cat/`, `anims_X/Cat/`, a model script, and `animset = "cat"` in the animal definition | sections 4-8 |
| Minimum clips | idle, walk, run, hit reaction, death, dead | section 7 |

## Confidence and gaps

`[GAP]`, in priority order:
1. How clip playback speed tracks movement speed (`m_SpeedScale` is the only visible lever). This decides whether an anatomically correct gait cadence survives.
2. Whether a mod can add a new action group and animset name at all, end to end. The loader maps the folders; nothing here proves a new name registers.
3. Vertex-count and bone-count budgets in practice: no performance data.
4. Whether the engine looks up any animal bone by name (a head bone for look-at, for example). Not searched yet.
5. The animal model-script grammar and what `shader = animalEffect` requires.
6. What else a new animal needs: corpse and rotten textures, skeleton models, head and skull world items, butchering definitions.
7. Multiplayer: whether animation state names cross the wire.
8. Whether `.glb` is safe for a skinned animal **mesh** (CompanionCat says yes in practice).

None of these block starting the rig and the mesh; they block shipping.

*Compiled 2026-09-11 from the B42 decompile and installed game files (PZ 42.19). An earlier research agent for this document failed on a session rate limit; this is the direct investigation that replaced it.*
