---
id: build-42-outcast-upright-engine
slug: outcast-upright-engine
title: Outcast Upright -- engine notes
game: pz
version: build-42
section: outcast-mods
category: outcast-upright
difficulty: advanced
tags:
  - outcast-upright
  - engine
  - vehicles
excerpt: 'Everything this mod depends on, with the line it was read from. Sources:'
last_updated: '2026-10-04'
---
# Outcast Upright -- engine notes

> Source: OutcastUpright/docs/ENGINE.md (compiled 2026-08-15, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Everything this mod depends on, with the line it was read from. Sources:

- Decompile: our decompile of the Build 42 engine (revision `a2947723ca`)
- Vanilla Lua: `media/lua` in the installed game
- Vanilla scripts: `...\media\scripts\generated\vehicles`
- Game version at time of writing: **42.20.0**; re-checked on **42.21.0**
  (revision `4a0e9546ec`), where nothing below changed meaning and the line
  numbers now point into 42.21

This file exists so a future build can be diffed against it rather than
re-derived. Several "obvious" APIs do not exist.

---

## Orientation

| Fact | Where |
|---|---|
| `getUpVectorDot()` — 1.0 upright, 0 on its side, -1 on its roof | `BaseVehicle.java:4303` |
| `getUpVector` is basis column 1; `getForwardVector` is column 2 | `:4298`, `:4293` |
| `setAngles(degX, degY, degZ)` | `:4087` |
| `getAngleX/Y/Z` read `Quaternionf.getEulerAnglesXYZ` | `:4104`, `:4114`, `:4124` |
| `getWorldTransform` / `setWorldTransform` | `:4051`, `:4056` |
| `Transform` is `@UsedFromLua`, public no-arg ctor, public `basis`/`origin` | `Transform.java:17-22` |

**There is no `isOverturned()`.** `getUpVectorDot() < 0.8` is the test, and 0.8 is
the engine's own number — `checkTrailerVerticalAlignment` uses it at `:10254`, as
do `Bullet.java:351` and `VehicleAddTask.java:33`. The comparison is strictly
`<`, so a vehicle at exactly 0.8 is *not* overturned.

**There is no `getRightVector()`.** Only forward and up are exposed. Derive right
as `up × forward` (column 0 of a right-handed orthonormal basis).

**`flipUpright()` exists at `:4076` and nothing anywhere calls it.** Public, so
Lua-callable, and genuinely dead vanilla API. We do **not** use it: it applies
`rotation.setAngleAxis(0, UNIT_Y)`, which is the identity quaternion, so it wipes
**heading** along with pitch and roll. A car righted with it faces a fixed
compass direction rather than the way it was pointing.

**`getAngleY()` is not a safe heading source for this mod.** It comes from an XYZ
Euler decomposition, which is degenerate at roughly 180° of roll — precisely a car
on its roof, the case the mod exists for. `OUP.headingOf` uses the forward vector
instead, and falls back to `up × forward` when forward is near-vertical.

**`setAngles` silently no-ops on sub-degree changes.** `:4088` gates the whole
body on `(int)degreesX != (int)getAngleX() || ...`. Not a problem for a one-shot
flip, but it is why a per-tick lerp toward zero stalls near the end instead of
settling. Anything that lerps must stop at a ≥1° epsilon.

**`setWorldTransform` does nothing for physics on a dedicated server.** `:4060`
guards `Bullet.teleportVehicle` behind `!GameServer.server`; `createPhysics`
(`:846`) is guarded the same way. Only `jniTransform` is updated server-side.

---

## The animal-trailer flip

Three facts combine. All three are needed to explain it.

**1. Attachment validation ignores height entirely.**
`canAttachTrailer` (`:10288`) checks forward-dot ≥ 0.6, up-dot ≥ 0.8, and a
distance computed in **two dimensions only**:

```java
float distSq = IsoUtils.DistanceToSquared(v1.x, v1.y, 0.0F, v2.x, v2.y, 0.0F);   // :10298
```

The Z is literally passed as zero. The vertical gap between the two tow points is
never looked at.

**2. The joint that follows is rigid and near roll-locked.**
`addPointConstraint` (`:10055`) picks `addRopeConstraint` for car-tows-car, but the
moment either script name contains `"Trailer"` it builds a 6DoF constraint
(`:10080-10101`) with all three linear axes locked to `0.0` and angular limits:

| Axis | Limit |
|---|---|
| pitch | ±π/4 (45°) |
| yaw | ±π/2 (90°) |
| **roll** | **±0.05235988 rad (3°)** |

**3. Vanilla hitch heights genuinely differ.**

| Script | `attachment trailer` offset Y |
|---|---|
| `Base.PickUpTruck` | -0.2747 |
| `Base.Van` | -0.2747 |
| `Base.Trailer` | -0.0879 |
| `Base.Trailer_Livestock` | -0.3954 |
| `Base.Trailer_Horsebox` | -0.5574 |

Hitching a horsebox to a pickup asks a rigid joint to close a 0.28-unit vertical
gap nobody validated, against loaded suspension, with roll locked to the tow
vehicle. Both roll. Then `checkTrailerVerticalAlignment` (`:10253`, called each
update from `:3574`) sees up-dot drop below 0.8 and breaks the hitch with
`BREAK_METAL_ITEM`.

`Base.Trailer` avoids the worst of it partly by sitting closest to the tow
vehicles' height and partly by shipping a custom `physics box` set with
`useChassisPhysicsCollision = false`. The two animal trailers ship neither.

### Vanilla's own mitigations, and their exact windows

- `getFudgedMass()` (`:3676`) returns `mass * 0.2` for a `"Trailer"`-named vehicle
  while `vehicleTowedBy.isAttachingTrailer()`. Pushed to Bullet every update via
  `Bullet.setVehicleMass` (`:3567`).
- Constraint ERP is `0.02` for the first 2000 ms (`:10104-10108`), then raised to
  `0.2` by `checkTrailerAttachTime` (`:10264-10276`).

Both windows are opened by `beginAttachingTrailer()` (`:10245`), called from
`ISAttachTrailerToVehicle.lua:24` — in **`start()`**, not `perform()`. The
constraint request is also sent from `start()`, via `attachTrailer()`.
`perform()` calls `stopAttachingTrailer()`, which closes both windows.

---

## Rejected approaches

Recorded so nobody retries them.

**Calling `stopAttachingTrailer()` early to restore full mass.** It zeroes
`beginAttachTrailerMS`, and `checkTrailerAttachTime` (`:10264`) only runs its ERP
ramp when that field is non-zero. Zeroing it early therefore means the ramp
**never fires** and the joint stays at ERP 0.02 permanently. Strictly worse than
doing nothing.

**Re-stamping `beginAttachingTrailer()` to hold the soft window open longer.**
Not rejected, but not adopted either — it is untested. It would keep ERP at 0.02
and the trailer at 20% mass for as long as we like, which plausibly reduces the
snap impulse. Two costs: it also extends the MP correction-packet suppression at
`WorldSimulation.java:197`, and a trailer at 20% mass handles strangely if the
player drives off immediately. If adopted, cap at 4-6 s and clear on first
throttle input. This is layer 2b if the corrective clamp underperforms.

**Overriding `getFudgedMass()`.** Java, not exposed to Lua.

**Shipping a script override of `Trailer_Livestock` / `Trailer_Horsebox`** to add
`useChassisPhysicsCollision = false` and a custom physics box set, the way
`Base.Trailer` has. This would very likely work, and it is the honest plan B. It
is not plan A because it hard-conflicts with any other mod touching those two
scripts, and because it must be re-authored every time TIS regenerates the
vanilla vehicle scripts.

---

## Items, perks, menus

| Need | Reality |
|---|---|
| the jack | **`Base.Jack`**, `normal.txt:11787`. No `Base.CarJack`. **No tag** — vanilla's own tyre template requires it by full type (`template_tire.txt:55-77`), so `getFirstTypeRecurse` is the only option |
| animal trailer test | no `isAnimalTrailer()`; `getAnimalTrailerSize() > 0` (`:10609`) is vanilla's own idiom at `ISVehicleMenu.lua:299` |
| trailer test | the engine uses a substring match on the script name (`:3677`, `:10324`) |
| strength | `Perks.Strength`, `getPerkLevel(Perks.Strength)` → 0-10 |
| sandbox types | only `boolean`, `double`, `enum`, `integer`, `string` — `CustomSandboxOptions.java:120-135` |
| MP command shape | `server/Vehicles/VehicleCommands.lua`, guarded `if isClient() then return end` at line 1, `Events.OnClientCommand.Add` at `:482` |
| authority handoff | `authorizationChanged(character)` (`:10137`) is Lua-callable |
| walk to a vehicle | `ISPathFindAction:pathToVehicleAdjacent(character, vehicle)` — `ISPathFindAction.lua:162`. `pathToLocationF` exists too but targets the vehicle's own coordinates, which are inside it |
| context menu pick | `IsoObjectPicker.Instance:PickVehicle(...)` — `ISVehicleMenu.lua:49`; the joypad branch at `:41-46` falls back to squares, which is what we do for overturned vehicles |
| gated-option UI | tooltip + `option.notAvailable` + `<RGB:1,0,0>` counts — `ISVehicleMenu.lua:617-650` |
| `math.atan2` | exists in PZ's Kahlua runtime; vanilla uses it at `ISBaseIcon.lua:210`, `ISKnob.lua:137`, `testUI.lua:79`. An editor set to Lua 5.4 will flag it as removed |

---

## MP XP

Experience is **server-authoritative in one direction**. Any mod awarding XP from
`client/` or `shared/` Lua loses it on a dedicated server. Single player is
unaffected, which is exactly why this survives testing.

The chain, all four links verified against the B42 decompile:

| Link | Where | What it does |
|---|---|---|
| the sync fires | `NetworkPlayerManager.java:43` | calls `syncXp()` on the server's stats timer, every connected player |
| it is one-way | `NetworkPlayerAI.syncXp():710` | whole body wrapped in `if (GameServer.server)` — it only ever sends **server -> client** |
| the client is overwritten | `IsoGameCharacter.java:17662` | `PlayerXpPacket.parse` -> `getXp():load()`, which calls `this.xpMap.clear()` **before** repopulating from the server's bytes. Client-local XP is erased wholesale, not merged |
| the save agrees with the server | `PlayerDB` | persists the server's copy, so a client-local award never reaches the save either |

**The two engine calls fail in opposite directions, which is why this is easy to
get wrong twice.**

`getXp():AddXP(perk, amount)` — `IsoGameCharacter.java:17415` — is gated on
`this.chr instanceof IsoPlayer player && player.isLocalPlayer()`. From a client it
writes locally and is then wiped by the next sync. From the *server* it does
nothing at all, because a remote player is not local.

The global `addXp(player, perk, amount)` — `LuaManager.java:11859` — branches:

```java
if (player.isExistInTheWorld()) {
   if (GameServer.server)      GameServer.addXp(player, perk, amount);   // authoritative
   else if (!GameClient.client) player.getXp().AddXP(perk, amount);      // single player
}                                                                        // MP client: silent no-op
```

So `addXp()` is correct in `server/` and **only** there: it covers the dedicated
server and single player with one call, and `GameServer.addXp` also calls
`updateXpChecker()` so the engine's own anti-cheat does not read the award as
suspicious.

**What this mod does.** `OUP_Server.awardFlipXp` grants `OUP.FLIP_XP` when it
authorises the flip, reading `verdict.wrecker` from the server's own evaluation
rather than the client's `usedWrecker` flag — a client is not a source of truth,
and the server's answer is also more current, since the wrecker could have been
driven off while the action ran. `tests/test_xp.lua` asserts on *which* call was
used, and `stub.player` deliberately exposes no `AddXP`, so a regression to the
client-side award cannot pass green.

---

## The sandbox parse trap

`CustomSandboxOptions.readFile` joins the file's lines **with no separator**. One
`//` anywhere in `sandbox-options.txt` therefore swallows the rest of the file and
the entire option set silently fails to register. `OUP.DEFAULTS` then masks the
failure perfectly: the mod behaves correctly while every operator setting is
ignored.

Two defences: `scripts/validate-data.ps1` fails hard on any `//`, and
`OUP.reportBoot()` logs loudly if any known option is missing at boot.

---

## Third-party notes

**`flipNode`.** KI5 vehicle scripts declare `attachment flipNode`. It is **not an
engine concept** — zero hits in the decompile, zero in any Lua in the game or in
any subscribed mod. Its geometry is consistent everywhere it appears: `x=0, z=0`
with a negative Y, i.e. horizontally centred at about ground/axle level, while the
same scripts put `centerOfMassOffset` at +0.8 to +1.1.

| Script | `flipNode` | `centerOfMassOffset` |
|---|---|---|
| `78amgeneralM62` (wrecker) | `0, -0.3000, 0` | `0, +0.8000, -0.6111` |
| `76chevyK30SCwrecker` | `0, -0.4445, 0` | `0, +0.8889, +0.0556` |
| `TrailerKI5cargoLarge` | `0, -0.2778, 0` | `0, +0.9444, 0` |
| `TrailerKI5livestock` | `0, -0.2778, 0` | `0, +1.1000, 0` |

Read as a ground-contact pivot. Unused in v1. If playtest shows righted vehicles
ejected from geometry, rotating about `flipNode` via a `Transform` is the fix —
**not** `setDebugZ`, which is a persistent offset (`:4134`, `getDebugZ` at `:4180`)
with no evidence anything ever clears it.

**KI5 licensing.** `damnlib`, `KI5trailers` and the KI5 wreckers are "On
Lockdown": the header in every damnlib file forbids redistribution, repacking *or
modification*. This mod stays purely additive and never declares `require=` for
any of them. damnlib does expose a sanctioned extension point,
`DAMN.VehicleMenu:registerConditionalSlice(handler, id)`, if a radial-menu entry
is ever wanted.

**Real wrecker script names** (verified in
the Steam library's `steamapps/workshop/content/108600` folder):
`76chevyC30CCwrecker`, `76chevyC30SCwrecker`, `76chevyK30CCwrecker`,
`76chevyK30SCwrecker`, `Chevalier_Rhino_TowTruck`, and **`78amgeneralM62`** —
which contains neither "wrecker" nor "tow", and is why the token list is
user-editable and ships an explicit entry for it.
