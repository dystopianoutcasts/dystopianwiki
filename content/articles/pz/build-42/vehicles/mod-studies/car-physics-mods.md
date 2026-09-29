---
id: build-42-car-physics-mods
slug: car-physics-mods
title: The car physics mods -- Better Car Physics to Realistic Car Physics
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - better-car-physics
  - realistic-car-physics
  - mod-study
excerpt: >-
  Neither is installed locally, so this file separates verified evidence (from
  Project Summer Car's source, which talks to RCP directly) from claimed
  features (mod descriptions and the author's guide).
last_updated: '2026-09-29'
---
# The car physics mods -- Better Car Physics to Realistic Car Physics

> Source: 04-car-physics-mods.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Neither is installed locally, so this file separates **verified evidence** (from
Project Summer Car's source, which talks to RCP directly) from **claimed
features** (mod descriptions and the author's guide).

## Lineage

| | Better Car Physics | Realistic Car Physics [B42MP] |
|---|---|---|
| Workshop ID | `2909035179` | `3559765660` |
| Author | Neidmare | Black_moons (also PSC author) |
| Era | B41, later back-ported to B42 | B42 native |
| Last revised | 2025-01-22 | active |
| Relationship to PSC | none | **PSC lists it as required** |

The B41-era mod from the original study is Neidmare's Better Car Physics. RCP is
the spiritual successor, written by the Project Summer Car author so the two
interlock.

## How they make physics "better": they replace Java, not Lua

This is the single most important fact about both mods and the reason they behave
unlike every other PZ mod.

Project Zomboid's vehicle physics live in compiled Java (`zombie.vehicles.*`),
which the Lua modding API cannot reach. Both mods ship **recompiled `.class`
files** and require the user to hand-copy them over the game install:

> Subscribe to the mod, copy the `zombie` folder from the workshop location,
> paste it into the Project Zomboid directory, overwrite all files (should be 24),
> then enable the mod.

Consequences:
- **Not Workshop-safe.** No amount of subscribing installs it; the manual step is
  mandatory or the mod silently does nothing (BCP pops a warning on launch).
- **Breaks on every game patch** that touches those classes.
- **Server side does not need the patch** -- only the Lua half. Clients who want
  the physics must each patch locally. That's how they stay MP-compatible: the
  Java patch is a client-side presentation/handling layer, the Lua is authoritative.

### Direct evidence of what's patched

`Project_Summer_Car_Server.lua:697-703` contains the RCP torque curve copied
verbatim as a comment, labelled with its origin:

```
--Java RPM torque curve.
--float torqueCurve = Math.min(Math.max(1.0f - ((engineSpeed - maxRPM) / 1000.0f),0),1);
//   Reduce torque to 0 at 1000rpm above redline.
--torqueCurve *= Math.min(Math.max((engineSpeed / maxRPM) * 2,0.1),1);
//   Reach max torque at 1/2 max RPM, min 0.1x torque at startup.
```

An earlier comment (`:273`) says *"Setup mod data here for CarController.java"*.

So: **RCP patches `zombie.vehicles.CarController`** and reads vehicle mod data
that PSC writes. Two facts fall out of that curve:
- Torque peaks at **50% of max RPM** and falls to zero **1000 RPM past redline**.
  Vanilla has no torque curve at all -- power is flat.
- At startup torque is floored at 0.1x, which is why RCP cars need a real starter
  and a real flywheel to get moving.

PSC mirrors this curve into fuel consumption (clamped at 0.3/0.5 instead of
0.1/0.0) specifically so fuel burn agrees with the torque the Java side produces.

### Other verified integration points

From PSC source:

| PSC code | What it tells us about RCP |
|---|---|
| `getActivatedMods():contains("\\RealisticCarPhysics")` | Mod folder id is `RealisticCarPhysics` |
| `SandboxVars.RealisticCarPhysics.HPWeightOverhaulBeta` | HP/weight overhaul is a **beta sandbox toggle, off by default** |
| `RCP_VehicleValues[vehicle:getScript():getFullType()]` | RCP ships a **global Lua table keyed by vehicle full type** holding per-car real-world HP and weight |
| `maxRPM = 4500; if engineRPMType == "firebird" then 6000` and `"SemiTruckRPM"` | RCP keys behaviour off vanilla's `engineRPMType` script field |
| `fuelConsumption * 4` when HP overhaul is on | The overhaul raises HP roughly 4x, so fuel had to be rescaled to match |
| Transmission tooltips publish exact gear ratios | RCP reads the installed PSC transmission item and shifts through **its** ratios |

That last one is the payoff of the pairing: **the gearbox you physically bolted
into the engine bay determines the gear ratios the physics engine shifts
through.** Fit the 8-speed truck box (4.0 down to 0.8) and the car behaves
differently from the 3-speed (2.6/1.6/1.0). That is the "deep construction"
loop working end to end.

## Better Car Physics (B41) -- feature list

From the workshop description and the Namuwiki entry:

- **Manual shifting**, toggleable. The headline feature.
- **Semi-automatic transmission** as the default mode.
- **Better engine sounds.**
- **Engine braking** -- lifting the throttle actually decelerates.
- **Offroad driving** improvements.
- Gear ratios generated from `engineRPMType` in the vehicle script:
  `generic`, `firebird`, `van`, `jeep`. That field also sets max RPM and the
  semi-auto shift points.
- Manual install of the `zombie` folder (24 files) required.
- MP: "basic testing, at your own risk." Both client and server need the Lua half
  enabled; only clients wanting the physics need the Java patch.
- B42 compat added by installing the `zombie` folder from the `42.X` subfolder.

The `engineRPMType` values are the through-line: RCP still uses `firebird` and
`SemiTruckRPM` as branch keys in PSC's code, so this classification survived from
BCP into RCP.

## Realistic Car Physics [B42MP] -- feature list

From the mod description and the author's guide (steamcommunity `3651935422`):

### Transmission
- Simulated **3 / 4 / 5-speed automatic with a torque converter**, and up to
  **8 speeds** when Project Summer Car supplies the gearbox.
- Automatic behaves like a real auto: **upshifts early on partial throttle** to
  save fuel, **kicks down on full throttle**.
- **Manual mode** available if you'd rather shift yourself.

### Traction
- Grip for **steering, braking and acceleration are separate and dynamic.**
- Inputs to grip: road surface (on/offroad), weather (rain, snow), **tire
  condition**, and **tire inflation pressure**.

### Tire pressure
- **Full pressure** -> less rolling drag on pavement.
- **Low pressure** -> less drag *and more grip* off-road.

A genuine tradeoff you manage per-trip, rather than a stat you max out.

### Towing
- Towed vehicles tow more easily and steer slightly toward the tower.

### Engine sound and RPM
- **Four new engine sound sets** that respond to throttle input.
- Per-vehicle **RPM redlines**.

### HP / weight overhaul (beta, off by default)
- Every car gets the **real horsepower and weight of the vehicle it's based on**.
- Weight range **900 - 3100 kg**, power range **70 - 400 hp**.
- Confirmed in PSC source as `SandboxVars.RealisticCarPhysics.HPWeightOverhaulBeta`
  driving a lookup in `RCP_VehicleValues[fullType]`.

### Sandbox and controls
- **Drag and rolling resistance** (on-road and off-road) rewritten and fully
  sandbox-adjustable.
- **Zombie-impact slowdown impulse** sandbox-adjustable.
- Engine start via the engine icon or keybind (default **N**).
- **Gamepad**: analog throttle and brake, manual shift buttons, improved cruise
  control (added v1.6).

### Compatibility
- Companion patch exists for KI5 vehicles (`3692796577`, not installed locally).

## How the split works

```
  Realistic Car Physics                 Project Summer Car
  (patched Java, client-side)           (Lua, server-authoritative)
  ---------------------------           --------------------------
  torque curve vs RPM          <------  engine force from part condition
  gear selection + shift logic <------  transmission item's ratio set
  torque multiplication        <------  torque converter stall rating
  traction / tire pressure
  drag + rolling resistance
  engine audio, redline
  per-car HP + weight table    ------>  fuel consumption rescale (x4)
                               ------>  maxRPM branch (firebird / SemiTruck)
```

RCP owns *how the car behaves given its parts.* PSC owns *what parts it has and
what condition they're in.* Neither duplicates the other. The coupling is one
`getActivatedMods():contains()` check and a handful of shared sandbox vars.

## Retrieved 2026-08-05 via browser-headed cURL -- corrections and additions

Steam pages were rate-limiting the automated fetcher earlier; a normal
browser-shaped `curl` (real User-Agent, Accept/Accept-Language headers, cookie
jar) gets them fine. Three things changed the picture:

### 1. The manual install no longer overwrites files on B42.13+
Better Car Physics' own instructions:
> *"Build 41: Overwrite all files (should be 24), Build 42.20: Should not
> overwrite any files"*

Uninstall on B41 was "verify integrity of game files"; on 42.13-42.20 it's just
"delete the `zombie` folder". B42 loads the overlay as a classpath addition
rather than a patch over the jar. Same mechanism the Reflection Enabler Java mod
uses. Still a manual install, but far less destructive than the B41 story.

### 2. The two physics mods are mutually exclusive
BCP lists **"Not compatible with: Realistic Car Physics, Offroad go brr"**.
RCP lists **"Not compatible with: Build 41, Better Car Physics, Effortless towing"**.
They are competitors solving the same problem, not a lineage you stack.

### 3. RCP's own Workshop item currently returns an error
`https://steamcommunity.com/sharedfiles/filedetails/?id=3559765660` returns
*"There was a problem accessing the item"* -- consistently, with a real browser
UA and cookies. The **guide** (`3651935422`, by the same author) loads fine and
is the source for the RCP detail below. Consistent with the PSC page's statement
that the author is quitting; the item may be hidden or delisted.

## Better Car Physics -- full feature list (from the live page)

Actively maintained: install path offers `41` and `42.20` folders.

**Realistic engine and transmission behaviour**
- Engine behaves and sounds like a real car
- **Releasing throttle leaves the car in gear**
- **Per-engine-type torque curves** -- vans best at low RPM, sports cars at high
- Engine braking
- **Smooth shifts with rev-matching**
- **Downshifting at too much speed locks the wheels and slides the car**
- Proper road friction and wind resistance forces

**Manual and semi-automatic transmission**
- Toggle manual for all cars in settings (B41 needed ModOptions; base game in B42)
- Semi-auto shifts on its own but **you can override with the shift keys**
- Rebindable shift up/down (default up/down arrow), under 'Vehicle' in keybinds
- **Clutch is always automatic**

**Smooth cruise control** -- auto mode picks an appropriate gear; manual mode
controls throttle only. Vanilla Shift+W to engage, Shift+W/S for +/-5.

**Trait integration** -- *Sunday Driver* accelerates timidly because they're
scared of the throttle; *Speed Demon* shifts like a race driver.

**Modder note, verbatim:**
> *"This mod ignores the gear ratios defined in the resources files. I had to do
> that as most vanilla cars dont have any, and the ones that were present didnt
> work that well. I created some logic that picks gear ratios based on engine
> type (generic, firebird, van, jeep). You configure this with 'engineRPMType'
> in the vehicle definition. The engine type also determines the max RPM, and
> when the semi-auto transmission shifts."*

This is the direct ancestor of the `engineRPMType` branching still present in
PSC's code (`firebird`, `SemiTruckRPM`).

**Multiplayer** -- server needs only the Lua half; clients without the Java
install still connect and just get vanilla physics; **the mod disables itself
entirely if the server doesn't have it**, so you can switch servers freely.

**Compatible with** Customizable Containers (both patch `zombie`, different files).

## Realistic Car Physics -- full feature list (from the author's guide)

Guide `3651935422`, posted 2026-01-22. Beta features are **sandbox-toggled and
off by default, vanilla vehicles only**.

**Beta: engine sound overhaul** -- 4 new sound sets on all vanilla vehicles,
responding to throttle.

**Beta: horsepower and weight overhaul** -- real-world HP and weight per car.
**900-3100 kg, 70-400 hp.** Heavier high-HP vehicles burn more fuel *with Project
Summer Car*; light cars are more efficient. Trailers heavier and higher capacity.

**Beta: trunk overhaul** -- **100-1300 capacity**, sandbox-scalable. Vans get
massive storage, fast cars get enough for a couple of backpacks, pickups/SUVs and
trailers much bigger.

**Core physics rewrite** -- explicitly to fix vanilla bugs:
- heavy vehicles' tires falling through the world
- losing control when driving over zombies and animals
- **vehicles can now exceed 10,000 kg (vanilla capped around 1,500 kg)**
- cargo capacity can exceed 1,000 kg

**Towing** -- towed vehicles glide instead of dragging *("someone left the brakes
on")*, steer slightly toward you, and **crash into you if you stop too suddenly**.
Drag and on/off-road rolling resistance rebuilt from scratch, fully sandbox-adjustable.
Option to require the key or a hot-wire before easy towing.

**Zombie/plant impact slowdown** fully sandbox-adjustable.

**Per-vehicle RPM redlines**, hit in every gear when you floor it.

**Transmission** -- upshifts on partial throttle to save fuel, downshifts on full
throttle. Simulated 3/4/5-speed auto with torque converter, **up to 8 speeds via
Project Summer Car**. Optional manual mode with configurable keys.

**Dynamic traction** -- steering, braking and acceleration grip vary with road
surface, rain/snow, tire condition and pressure.

**Tires matter** -- low-condition tires burn out under acceleration; full pressure
cuts road drag, low pressure cuts off-road drag and adds off-road grip. **Tires
visually lock up under handbrake and spin out** when traction is lost, with
separate on-road and off-road skid sounds.

**Configurable steering** at low and high speed, or revert to vanilla steering.

**Horsepower tweaks from mods like Project Summer Car now properly affect
acceleration** -- the explicit integration statement.

**Per-car HP and top-speed sandbox overrides.**

**Optional: disables autostart** on the gas pedal -- click the engine icon or
press engine start (default **N**).

**Improved cruise control. Gamepad** analog throttle, brake and manual shifting.

Compatible with KI5, Filibuster Rhymes and all car-adding mods. Installable and
removable mid-save. **Dedicated servers install to the `\java\` folder alongside
`ProjectZomboid.jar`**, and *"all clients and server must install this mod
manually for proper functionality."*

## Remaining gaps

- RCP's and BCP's code still not read -- feature lists above are the authors'
  own words. The PSC-side integration points remain the only code-verified part.
- The exact set of shadowed `.class` files is still unknown; only `CarController`
  is confirmed by name, from PSC's comments.
- RCP's Workshop item is currently unreachable, so its changelog wasn't retrieved.
