---
id: build-42-combat-and-animation
slug: combat-and-animation
title: Combat and Animation
game: pz
version: build-42
section: modding
category: foundations
difficulty: intermediate
tags:
  - electricity
  - combat
  - animation
  - power
  - misc-systems
excerpt: >-
  CONFIRMED (42.20) -- Firearms were completely overhauled: new 3D models, new
  animations, muzzle effects, new/expanded ammunition types, and new SFX. New
  guns added to the library include the L92...
last_updated: '2026-09-29'
related_articles:
  - orientation
  - electricity-and-power
  - misc-catch-all-systems
  - practical-b42-readiness-checklist
  - addendum-electricity-generator-power-model
---
# Combat and Animation

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 4.1 Firearm overhaul

**CONFIRMED (42.20)** -- Firearms were completely overhauled: new 3D models, new
animations, muzzle effects, new/expanded ammunition types, and new SFX. New guns added
to the library include the **L92 Lever Action Rifle** and **JS-3T Tactical Shotgun**.
For weapon modders this means the weapon-model + animation + muzzle-FX + ammo pipeline
all changed shape from B41; port and re-test rather than reuse.

### 4.2 New aiming system

**CONFIRMED (42.20)** -- A new firearm aiming system allows precise location targeting
on zombies (aim at specific spots), rewarding careful aim while still reflecting the
character's panic/stress/aiming-skill state. This is a feel-level combat change and a
new axis of weapon balance.

### 4.3 Melee weapon part / condition system

**CONFIRMED (42.20)** -- Some melee weapons now track **Handle Condition** and **Head
Condition** separately, plus the **Sharpness** of any attached blade. Consequences:
- On some weapons the **head can fall off** as it degrades.
- Some broken weapons remain usable as crude wooden clubs; a **Broken Spear** still
  works as a weaker weapon.
This implies new weapon-script fields governing multi-part condition and sharpness.
Weapon modders must expect (and populate) these new fields where applicable -- confirm
exact field names against vanilla weapon scripts.

### 4.4 Combat balance (jamming, moodles, point-blank)

**CONFIRMED** -- A stability-era hotfix "significantly" reduced firearm jam rates.
Specifics:
- Weapons with a zero base jam rate no longer jam when manually racked.
- Hit-chance penalties from negative moodles (e.g. panicked) were cut in half.
- Point-blank threshold set to **3.5 movement tiles**; within that range previously
  non-functional hit-chance modifiers (moodles, weather, lighting, headgear) now apply
  correctly. A 42.20 fix also stopped point-blank shots missing because the muzzle
  position was inside the target.
- **Sandbox multipliers** were added to customize jamming rate, weather effect, and
  moodle impact on hit chance -- relevant if your mod ships a sandbox preset.

### 4.5 Animation system and modding

**CONFIRMED (foundation)** -- B41 rebuilt the animation system (player models, per-item
models, updated combat). B42 continues on that foundation and adds new content
animations rather than replacing the pipeline wholesale.

**CONFIRMED (B42 modding specifics)** -- Animation modding structure:
- Animation files go in the mod's `anims_X` folder.
- **B42 change:** only subfolders set by the model's `animationsMesh` are scanned. For
  the human models only `Bob/` and `Kate/` are scanned, and filenames must be prefixed
  `Bob_` / `Kate_`. (This is stricter than B41's broader scan -- a common porting
  break for animation mods.)
- Animation nodes are defined via XML in the `AnimSets/` folder and control triggering,
  playback speed, etc.; the same node can map to different animations per model.
- `AnimSets` are collections of `AnimStates`, usually associated with an entity (player,
  zombie, animal).

**CONFIRMED (42.20 vocals)** -- Characters now audibly react to states (carrying heavy
loads, sadness, being wounded) and can make vocal calls to communicate -- a new
audio/animation-adjacent layer.
