---
id: build-42-vehicle-systems-masks-and-damage
slug: vehicle-systems-masks-and-damage
title: 'PZ B42 vehicle systems -- masks, part removal, damage, animation, armour'
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - textures
  - damage
  - animation
  - masks
excerpt: >-
  Companion to PZ_VEHICLE_ARCHITECTURE.md (which covers file layout and the
  vanilla-vs-KI5 comparison). This one covers the runtime systems: how the
  engine decides what to draw, what to darken, and...
last_updated: '2026-09-29'
---
# PZ B42 vehicle systems -- masks, part removal, damage, animation, armour

> Source: PZ_VEHICLE_SYSTEMS.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Companion to `PZ_VEHICLE_ARCHITECTURE.md` (which covers file layout and the vanilla-vs-KI5
comparison). This one covers the *runtime* systems: how the engine decides what to draw,
what to darken, and what to hide.

Everything below is read from the shipped shaders and the decompiled engine
(`PZ_Engine_Records/B42`, rev `a2947723ca`). Source lines are cited.

---

## 1. The 32-zone mask system — how the engine knows which part a pixel belongs to

**This is the single most important thing to understand before authoring a vehicle texture.**

I initially assumed part identity came from `UVChannel_2`. **That is wrong.** Part identity
comes from the **colour of the mask texture**.

`media/shaders/vehicle_multiuv.frag:98-128`:

```glsl
mat4 texen1 = mat4(0.0);
texen1[0][0] = (1.0 - step(0.01, length(texColorMask.xyz - colZone1)));
texen1[0][1] = (1.0 - step(0.01, length(texColorMask.xyz - colZone2)));
...
mat4 texen2 = mat4(0.0);
texen2[0][0] = (1.0 - step(0.01, length(texColorMask.xyz - colZone17)));
```

The mask texture is sampled, and its RGB is compared against 32 hard-coded zone colours.
If it matches within **0.01 Euclidean distance**, that pixel belongs to that zone. The result
is packed into two `mat4`s (16 floats each = 32 slots), which are then dotted against the
engine's per-part state matrices via `dommat4` (`shaders/util/dommat4`):

```glsl
float dommat4(mat4 a, mat4 b) {
    return dot(a[0],b[0]) + dot(a[1],b[1]) + dot(a[2],b[2]) + dot(a[3],b[3]);
}
```

### The zone colour table (`shaders/vehicle_common.frag.h:13-39`)

Authoritative. These are the exact RGB values the mask must use.

| # | RGB (0-1) | Hex | Zone |
|---|---|---|---|
| 1 | 1.00, 0.00, 0.00 | `FF0000` | Head |
| 2 | 0.00, 1.00, 0.00 | `00FF00` | Tail |
| 3 | 0.00, 1.00, 1.00 | `00FFFF` | Door RH |
| 4 | 1.00, 1.00, 0.00 | `FFFF00` | Door RT |
| 5 | 1.00, 0.00, 1.00 | `FF00FF` | Door LH |
| 6 | 0.00, 0.00, 1.00 | `0000FF` | Door LT |
| 7 | 0.00, 0.50, 0.50 | `008080` | Window RH |
| 8 | 0.50, 0.50, 0.00 | `808000` | Window RT |
| 9 | 0.50, 0.00, 0.50 | `800080` | Window LH |
| 10 | 0.00, 0.00, 0.50 | `000080` | Window LT |
| 11 | 0.50, 0.00, 0.00 | `800000` | Window T |
| 12 | 0.00, 0.50, 0.00 | `008000` | Window H |
| 13 | 0.00, 0.75, 0.75 | `00BFBF` | Guard RH |
| 14 | 0.75, 0.75, 0.00 | `BFBF00` | Guard RT |
| 15 | 0.75, 0.00, 0.75 | `BF00BF` | Guard LH |
| 16 | 0.00, 0.00, 0.75 | `0000BF` | Guard LT |
| 17 | 0.00, 0.00, 0.00 | `000000` | Roof |
| 18 | 0.25, 0.00, 0.00 | `400000` | Lights R H |
| 19 | 0.75, 0.00, 0.00 | `BF0000` | Lights L H |
| 20 | 0.00, 0.75, 0.00 | `00BF00` | Lights R T |
| 21 | 0.00, 0.25, 0.00 | `004000` | Lights L T |
| 22 | 0.50, 0.25, 0.00 | `804000` | StopLights R |
| 23 | 0.50, 0.75, 0.00 | `80BF00` | StopLights L |
| 24 | 0.75, 0.75, 0.75 | `BFBFBF` | LightBar R |
| 25 | 0.25, 0.25, 0.25 | `404040` | LightBar L |
| 26 | 1.00, 0.00, 0.50 | `FF007F` | Hood |
| 27 | 0.00, 1.00, 0.50 | `00FF7F` | Boot |

Slots 28–32 exist in the matrices but have no defined colour — spare capacity.

Naming note: **H = Head end (front), T = Tail end (rear)**, R/L = right/left. So "Door RH" is
the right *front* door, "Door RT" the right *rear* door. "Guard" is the fender/wing.

### Authoring consequences — these will bite

1. **The tolerance is 0.01 in normalised space ≈ 2.5/255.** The mask must be painted in exact
   flat colours. **Any JPEG compression destroys it.** PNG only.
2. **No antialiasing at zone boundaries.** A blended edge pixel matches *no* zone and falls
   through un-masked. Paint zones hard-edged, index-colour style.
3. **Bilinear texture filtering still blends at zone edges at runtime.** Vanilla lives with a
   thin un-zoned seam. Keep zone boundaries in texture space away from anything important.
4. Zones are the *only* granularity available for damage, lights, tint-exclusion and uninstall
   on the shared body mesh. If two things must behave independently, they need different zones.

### Derived zone flags the shader computes

```glsl
windowAlpha  = zones 7,8,9,10,11,12          // all glass
frontAlpha   = zones 1, 18, 19               // head + head lights
tailAlpha    = zones 2, 20, 21, 22, 23       // tail + tail/stop lights
noTintAlpha  = windowAlpha + frontAlpha + tailAlpha
```

`noTintAlpha` excludes glass and lights from paint recolouring — which is why headlights don't
turn purple when the car is randomly coloured. Reflections (`ref_en`) are driven by the same
window zone set, so **glass is reflective purely because it is masked as a window zone.**

---

## 2. Part removal — there are TWO mechanisms, and they do different things

This directly answers "can broken parts be made to disappear?"

### Mechanism A — mask-zone darkening (shared body mesh)

`vehicle_multiuv.frag:132, 175`:

```glsl
float t4en = step(0.5, dommat4(texen1, TextureUninstall1) + dommat4(texen2, TextureUninstall2));
...
col = mix(col, vec3(0.2), t4en);
```

**Uninstalled zones are NOT hidden — they are tinted to flat dark grey (0.2).** That reads as
a shadowed hole where the panel used to be. No geometry changes. This is how vanilla makes a
removed door "disappear" on a single-mesh car with no separate door object.

Cheap, needs no extra geometry, but it is a *painted illusion* — the silhouette is unchanged.

### Mechanism B — real per-model visibility (separate part meshes)

`VehiclePart.java:155-163`:

```java
public void setInventoryItem(InventoryItem item, int mechanicSkill) {
    this.item = item;
    ...
    if (this.isSetAllModelsVisible()) {
        this.setAllModelsVisible(item != null);   // <-- install/uninstall drives visibility
    }
```

`VehiclePart.java:182-190` then calls `vehicle.setModelVisible(...)` for every model the part
declares. And `VehicleScript.java:2287`:

```java
public boolean setAllModelsVisible = true;   // DEFAULT
```

**So it is automatic and free.** A part that declares its own `model` block has that mesh
shown when the part has an inventory item installed, and **genuinely hidden when it does not**.
Vanilla never writes `setAllModelsVisible` in any script (0 occurrences across all 143 vehicle
scripts) because the default already does the right thing.

There is also `VehiclePart.setModelVisible(String id, boolean)` (`:474`) for per-model control
by id, callable from Lua — useful for OLV.

### Which to use for the 911

**Both, together.** They are complementary, not alternatives:

| Need | Mechanism |
|---|---|
| Door removed → the door genuinely vanishes, silhouette changes | **B** (separate `DoorFrontLeft_obj`) |
| Door removed → the door *aperture* in the body reads as a dark hole | **A** (mask zone `Door LH`) |
| Windows smashed | **A** (window zones) — glass is thin, no silhouette to lose |
| Headlight smashed | **A** (light zones) |

Since the 911 is already cut into real part meshes, mechanism B works with no extra effort.
Mechanism A additionally requires the body's door aperture interior to be masked in the door's
zone colour, so it darkens when the door is gone.

**Answer to "would we need more parts?"** — no extra *parts*, but the body **does** need
interior surfaces facing the apertures, or a removed door will reveal the inside of the far
body shell. That is the same inner-face work already queued for the door/frunk/decklid.

---

## 3. Damage

Same zone mechanism, two levels:

```glsl
t2en = dommat4(texen1, TextureDamage1Enables1) + dommat4(texen2, TextureDamage1Enables2)
t3en = dommat4(texen1, TextureDamage2Enables1) + dommat4(texen2, TextureDamage2Enables2)
col = mix(col, texColorDamage1Shell.xyz, texColorDamage1Shell.a * t2en * noTintAlpha);
col = mix(col, texColorDamage2Shell.xyz, texColorDamage2Shell.a * t3en * noTintAlpha);
```

Two damage textures (`Veh_Damage1`, `Veh_Damage2`, both 512²) blended per-zone by the engine's
damage state, multiplied by `noTintAlpha` so glass and lights don't receive body damage decals.
Blood (`MatBlood1/2Enables`) is applied in two passes — **below** damage on windows, **above**
damage on bodywork — so blood on glass reads as behind the cracks.

Rust is global, not zoned: `TextureRustA` is a single float.

**Vanilla's shared damage/rust/blood textures can be reused as-is.** No need to author them.

---

## 4. Animation — and yes, it should work in Blender first

Confirmed: part animations are **named clips referenced from the script**
(`VehicleScript.java:2096 class Anim`, field `anim`):

```
part DoorFrontLeft
{
    model Default { file = SportsCar_door_left, }
    anim Close { anim = DoorFrontLeft_closing, rate = 2.5, }
    anim Open  { anim = DoorFrontLeft_opening, rate = 2.5, }
}
```

`anim = <clipName>` names an animation clip that must exist **inside the FBX**. This is why
vanilla ships `SportsCar-anims.blend` as the authoring source and why the parts are parented to
a `VehicleSkeleton` armature.

**So the workflow is necessarily Blender-first**: the clips are authored, previewed and
validated in Blender, then baked into the FBX export. There is no way to author them in the
game. Getting them right in Blender is not optional polish — it is the only place they exist.

Practical notes:
- Each panel needs **two** clips (`_opening`, `_closing`), not one played backwards.
- `rate` scales playback speed in-game, so absolute clip length is not critical.
- The hinge directions and angles are settled — see
  `_dev/Porsche911_992_2_Ref/HINGE_REFERENCE.md`.

---

## 5. Armour — nobody has it except damnlib

### Checked: vanilla — none

```
armour|armor  ->  0 matches in media/scripts/generated/vehicles
armour|armor  ->  0 matches in zombie/vehicles/*.java
```

### Checked: Filibuster Rhymes' Certified Used Cars — **also none**

FR (workshop `3683878228`, 61 vehicles) is the other big car mod. It *appears* to have armour
because `armor` greps hit — but that is a **false positive on the word "Armory"**:

```lua
-- FR_Vehicles.lua:118
function Vehicles.ContainerAccess.FR_VehicleArmory(vehicle, part, chr)
```

```
-- ch_stepvan_80_police.txt:512
template = FR_ArmoryMilDouble,
part FR_VehicleArmoryMil1 { model Default { offset = -0.4 0.178 0.31, rotate = 0 -270 0, } }
```

That is a **weapons-rack storage container** in the police step van, with `ContainerAccess`
reach rules (front-seat occupants can't reach it; from outside you must be beside the rear
seats). It is a container, not armour plating.

**Conclusion: vehicle armour is unique to damnlib / KI5.** Neither the engine nor the
second-largest car mod implements it.

### How KI5's armour is actually built — it IS real geometry

The armour models ship inside damnlib, in the per-vehicle Objects FBX. Measured from
`common/media/models_X/WorldItems/Vehicles_85gmBbody_Objects.fbx` (34 objects, 2,798 verts):

| Mesh | Verts | Protects | Tier |
|---|---|---|---|
| `85b-platform_windshield_awWI` | 120 | windshield | **wood** |
| `85b-platform_windshield_amWI` | 126 | windshield | **metal** |
| `85b-platform_windshield_rear_awWI` | 72 | rear screen | wood |
| `85b-platform_windshield_rear_amWI` | 60 | rear screen | metal |
| `85b-platform_window_fl_awWI` / `_amWI` | 40 / 40 | front-left window | wood / metal |
| `85b-platform_window_rl_awWI` / `_amWI` | 48 / 40 | rear-left window | wood / metal |
| `85b-platform_window_bl_aw_wWI` / `_am_wWI` | 64 / 40 | wagon back-left window | wood / metal |

**Naming convention decoded:** `<vehicle>_<opening>_a<w|m>WI`
— `aw` = armour **w**ood, `am` = armour **m**etal, `WI` = world item.

Declared exactly like any other part model (`85gmBbody_models.txt:73`):

```
model 85gmBbodyWindshieldArmorWWI
{
    mesh    = WorldItems/Vehicles_85gmBbody_Objects|85b-platform_windshield_awWI,
    texture = Vehicles/Objects_85gmBbody_Shell,
    scale   = 0.6,
}
```

Key observations:

1. **Armour protects glass openings, not sheet metal** — windshield, rear screen, and side
   windows. That is the design choice, and it makes sense: glass is the vulnerable surface.
2. **Two material tiers** (wood / metal) per opening, each its own mesh.
3. **Cheap: 40–126 verts per piece.** Armour is not a poly-budget problem.
4. These are the `WI` (carried item) meshes. The *installed* meshes live in the individual
   car mod's Body FBX, which damnlib does not ship — only the world-item versions and the
   model declarations are here.
5. The Lua side (`DAMN_Armor_Shared.lua`) is only a **registration API** —
   `DAMN.Armor:add(fullVehicleScriptName, handler)` registers a per-vehicle handler run on
   player update, plus automatic save/restore of part conditions. The armour *behaviour* is
   written per vehicle, not centrally.

So there **is** prior art for the shape of the feature, and it is simpler than expected:
armour is just ordinary installable parts with meshes, plus a Lua handler that manipulates
part conditions. Mechanism B (§2) gives the show/hide for free.

### Cost estimate for the 911

Four glass openings (windshield, rear screen, two side windows) × 2 tiers × 2 meshes
(installed + WI) = **16 meshes, roughly 1,000 verts total.** Entirely affordable, and it can
be added after the base car ships — the parts are additive.

### What building it in OLV would actually require

Searched the entire vanilla vehicle script set and `zombie/vehicles/` in the decompiled engine:

```
armour|armor  ->  0 matches in media/scripts/generated/vehicles
armour|armor  ->  0 matches in zombie/vehicles/*.java
```

**Vehicle armour is not an engine feature.** It is entirely damnlib's own invention
(`DAMN_Armor_Client.lua`, `DAMN_Armor_Server.lua`, `DAMN_Armor_Shared.lua`).

### What building it in OLV would actually require

Since there is no engine support, armour has to be assembled from existing primitives:

1. **Armour as installable parts.** Define extra `part` entries (e.g. `ArmorDoorFrontLeft`)
   with their own `model` blocks. Mechanism B then shows/hides the armour mesh automatically
   when the armour item is installed — no Lua needed for the visual.
2. **Extra geometry per armour piece**, plus a `*WI` world-item mesh — this is real modelling
   work, roughly one panel per protected zone.
3. **Damage mitigation in Lua.** The engine will not route damage through armour, so OLV must
   hook vehicle damage events and reduce/redirect damage while armour is installed and has
   condition remaining.
4. **Mask zones.** Only 27 of 32 zones are defined; **5 spare slots** exist. Armour that needs
   independent damage/uninstall behaviour would consume them. That is a hard ceiling worth
   knowing before designing an armour system with many independent pieces.

**Assessment:** armour is genuinely achievable and mostly *modelling* work rather than engine
fighting — points 1 and 2 come nearly free from mechanism B. Point 3 is the real engineering.
It is correctly scoped as **out of OLV v1** (see `_dev/OutcastLib_Vehicles/PLAN.md` §1); the
part/visibility groundwork it needs is the same groundwork V1 lays anyway.

---

## 6. Consequences for the 911, in priority order

1. **Author the mask as flat, hard-edged, exact-hex PNG.** Non-negotiable. Use the table above.
2. **Inner faces are required, not cosmetic.** Mechanism B genuinely removes a door mesh, so
   the aperture must show a finished interior surface rather than the inside of the far shell.
3. **Zone budget is fine.** The 911 needs: Head, Tail, Door LH/RH, Window LH/RH, Window T
   (windshield), Window H (rear screen), Guard ×4, Roof, Lights ×4, StopLights ×2, Hood, Boot
   — comfortably inside 27, with 5 spare for later armour.
4. **Animations must be authored and validated in Blender** before any in-game test.
5. Reuse vanilla `Veh_Damage1/2`, `Veh_Rust`, `Veh_Blood_*`. Only shell / mask / lights are
   bespoke.
