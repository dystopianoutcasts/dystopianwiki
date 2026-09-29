---
id: build-42-verified-api-reference
slug: verified-api-reference
title: Verified vehicle API reference
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - vehicle-api
  - vehicles-lua
  - decompile
  - verified
excerpt: 'Everything here was read out of the shipped game on 2026-08-05, not from docs.'
last_updated: '2026-09-29'
---
# Verified vehicle API reference

> Source: 09-verified-api-reference.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Everything here was read out of the shipped game on 2026-08-05, not from docs.

- Bytecode: `R:\Games\Steam\steamapps\common\ProjectZomboid\projectzomboid.jar`
  (dated 2026-07-29, Steam buildid 24449119)
- Lua: `media/lua/server/Vehicles/Vehicles.lua` in the same install
- Comparison snapshot: `R:\ZOMBOID\ProjectZomboid_B41_01312026\`

## 1. Method: how to check "does this API exist"

**Use exact constant-pool UTF8 entry matching. Not substring search, not a naive
method-table walk.** Both of the obvious approaches burned me in one session.

```python
def utf8_entries(data):
    """Walk ONLY the constant pool; return the set of exact UTF8 strings."""
    p = 10
    n = struct.unpack_from('>H', data, 8)[0]
    out, i = set(), 1
    while i < n:
        t = data[p]; p += 1
        if t == 1:
            l = struct.unpack_from('>H', data, p)[0]; p += 2
            out.add(data[p:p+l].decode('utf-8', 'replace')); p += l
        elif t in (7, 8, 16, 19, 20): p += 2
        elif t == 15: p += 3
        elif t in (3, 4, 9, 10, 11, 12, 17, 18): p += 4
        elif t in (5, 6): p += 8; i += 1      # long/double take two slots
        i += 1
    return out
```

### Trap 1 -- substring search gives false positives
Raw `b'getRegulator' in classdata` returns **True** for `BaseVehicle`, because
`getRegulatorSpeed` contains it. There is no `getRegulator` method. Method names
are separate UTF8 constant-pool entries, so exact set membership is the only
honest test.

### Trap 2 -- a hand-rolled method-table walk can desync
My first parser walked past the constant pool into fields/methods/attributes and
silently dropped entries -- it reported `getPartById`, `getPartCount` and
`getPartByIndex` as absent from `BaseVehicle` when all three are present. A
"MISS" from a structural parser means *"my parser lost sync"* at least as often
as it means *"the method doesn't exist"*. Constant-pool-only walking never gets
past the one section whose layout is trivially self-describing.

### Trap 3 -- the online javadoc lags
`projectzomboid.com/modding/zombie/Lua/LuaManager.GlobalObject.html` still lists
all seven reflection functions with no mention of the `-debug` gate. Read the jar.

### Also check for the Lua wall
```python
b'HiddenFromLua' in classdata
```
`BaseVehicle` -> **False**, so every public method on it is Lua-callable.
`LuaManager` -> True (that's how `validateReflectionAccess` is hidden).

Applied across all 23,735 classes, exact matching confirms `getRegulator`,
`setSteering` and `controlBrakeForce` exist in **zero** of them -- the True
Vehicle Physics finding in `08-working-with-vanilla.md`, now properly verified
rather than inferred.

## 2. The dispatch mechanism -- why overriding works at all

This is the single most important thing in this file. From vanilla
`Vehicles.lua:1329`:

```lua
function VehicleUtils.callLua(functionName, arg1, arg2, arg3, arg4)
	if functionName:find(".") then
		local t = _G
		local ss = functionName:split("\\.")
		for i=1,#ss-1 do
			t = t[ss[i]]
		end
		local func = t[ss[#ss]]
		return func(arg1, arg2, arg3, arg4)
	else
		return _G[functionName](arg1, arg2, arg3, arg4)
	end
end
```

Vehicle scripts store the handler as a **string** (`part:getLuaFunction("update")`
returns `"Vehicles.Update.Brakes"`), and `callLua` **re-walks `_G` on every single
call**. Binding is by name, at call time, late.

Consequences:

- Assigning `Vehicles.Update.Engine = myFunc` anywhere in your mod takes effect
  immediately, for every vehicle, with **no script edit and no template override**.
- It also means **you can chain**. Capture the previous value and call through:
  ```lua
  local prev = Vehicles.Update.Engine
  function Vehicles.Update.Engine(vehicle, part, elapsedMinutes)
      -- our work
      if prev then return prev(vehicle, part, elapsedMinutes) end
  end
  ```
- And it means the last mod to load wins if nobody chains. PSC replaces outright.
  Ours should chain -- it is three lines and it is the difference between
  "compatible" as a claim and as a fact.

Handler signature, confirmed across `Update.Brakes`, `.Suspension`, `.Muffler`,
`.Tire`, `.Engine`:

```lua
function Vehicles.Update.<Part>(vehicle, part, elapsedMinutes)
```

## 3. The hook table

Families in `Vehicles.lua`, with the handlers vanilla defines:

| Family | Vanilla handlers |
|---|---|
| `Vehicles.Create.*` | Battery, Door, TrunkDoor, TrunkDoorOpen, GasTank, Engine, Headlight, Radio, Tire, Brake, Window, Seat, Default |
| `Vehicles.Init.*` | Door, Headlight, Tire, Window |
| `Vehicles.Update.*` | Engine, Battery, GasTank, **Brakes**, **Suspension**, **Tire**, **Muffler**, Headlight, Heater, Lightbar, PassengerCompartment, Radio, TrunkDoor, EngineDoor, TrailerAnimalFood |
| `Vehicles.Use.*` | Door, EngineDoor, TrunkDoor, TrunkDoorOpen |
| `Vehicles.CheckEngine.*` | Engine, GasTank |
| `Vehicles.CheckOperate.*` | Tire |
| `Vehicles.InstallTest.*` / `UninstallTest.*` | Default, Battery |
| `Vehicles.InstallComplete.*` / `UninstallComplete.*` | Door, Tire, Window, Radio, Default |
| `Vehicles.ContainerAccess.*` | TruckBed, TruckBedOpen, TruckBedOpenInside, Seat, GloveBox, GasTank |
| `Vehicles.LowerCondition` | single global wear function |

### Suspension and Muffler are empty extension points

Verbatim from vanilla:

```lua
function Vehicles.Update.Suspension(vehicle, part, elapsedMinutes)
	Vehicles.LowerCondition(vehicle, part, elapsedMinutes);
end

function Vehicles.Update.Muffler(vehicle, part, elapsedMinutes)
	Vehicles.LowerCondition(vehicle, part, elapsedMinutes);
end
```

They do nothing but wear down. `Vehicles.Update.Brakes` is barely more -- it
decays brake condition proportional to `getBrakeSpeedBetweenUpdate()`. These are
the "gap in the ecosystem" from `05-takeaways.md`, and they are one-line stubs
waiting for a mod.

`Vehicles.LowerCondition` is worth reading as the vanilla wear model -- it already
factors `isDoingOffroad()`, `getOffroadEfficiency()`, speed and steering angle,
and returns the computed chance so callers can reuse it (`Update.Tire` does).

## 4. `BaseVehicle` -- verified signatures

`zombie.vehicles.BaseVehicle extends zombie.iso.IsoMovingObject`. No
`HiddenFromLua`. 701 methods, 584 public.

### Input
| Method | Signature |
|---|---|
| `getThrottle` | `()F` -- **added in B42; absent from the Jan 2026 B41 snapshot** |
| `isGasPedalPressed` | `()Z` |
| `isBrakePedalPressed` | `()Z` -- also new in B42 |

### Engine
| Method | Signature | Note |
|---|---|---|
| `setEngineFeature` | `(III)V` | **takes ints** -- quality, loudness, force. Lua floats are coerced |
| `getEnginePower` | `()I` | int, not float |
| `getEngineQuality` | `()I` | int |
| `getEngineSpeed` / `setEngineSpeed` / `addEngineSpeed` | `()D` / `(D)V` / `(D)V` | RPM is **readable and writable** |
| `getVehicleEngineRPM` | `()Lzombie/vehicles/VehicleEngineRPM;` | the RPM-type object |
| `isEngineRunning` | `()Z` | |

### Mass and speed
| Method | Signature |
|---|---|
| `getMass` / `setMass` | `()F` / `(F)V` |
| `getInitialMass` / `setInitialMass` | `()F` / `(F)V` |
| `getFudgedMass` | `()F` |
| `updateTotalMass` | `()V` |
| `getMaxSpeed` / `setMaxSpeed` | `()F` / `(F)V` |
| `getCurrentSpeedKmHour` | `()F` |
| `getFakeSpeedModifier` | `()F` (static-ish helper used by PSC to normalise fuel burn) |

### Transmission
| Method | Signature |
|---|---|
| `getTransmissionNumber` | `()I` |
| `getTransmissionNumberLetter` | `()Ljava/lang/String;` |
| `getTransmissionNumberEnum` | `()Lzombie/vehicles/TransmissionNumber;` |
| `changeTransmission` | `(Lzombie/vehicles/TransmissionNumber;)V` |

`TransmissionNumber` enum constants: **`R`, `N`, `Speed1` .. `Speed8`.**
So the engine already models up to 8 gears -- matching PSC's 8-speed gearbox item.

### Brakes, steering, tires
| Method | Signature | Note |
|---|---|---|
| `setBrakingForce` / `getBrakingForce` | `(F)V` / `()F` | |
| `getBrakeSpeedBetweenUpdate` | `()F` | used by vanilla brake wear |
| `setCurrentSteering` / `getCurrentSteering` | `(F)V` / `()F` | |
| `getMaxWheelSteering` | `()F` | |
| `setTireInflation` | `(IF)V` | **write-only -- there is no `getTireInflation`** |
| `setTireRemoved` | `(IZ)V` | |
| `isAnyTireMissing` | `()Z` | |
| `getMinWheelSkid` | `()F` | |

### Surface and cruise
| Method | Signature |
|---|---|
| `isDoingOffroad` | `()Z` |
| `getOffroadEfficiency` | `()F` |
| `isRegulator` / `setRegulator` | `()Z` / `(Z)V` |
| `getRegulatorSpeed` / `setRegulatorSpeed` | `()F` / `(F)V` |
| `getCurrentSpeedForRegulator` | `()F` |

### Parts and identity
`getPartById(String)`, `getPartCount()`, `getPartByIndex(int)`, `getScript()`,
`getId()S`, `getDriver()`, `getSquare()`, `isDriver(IsoGameCharacter)`.

Note `getId()` returns a **short**, not an int.

### Confirmed NOT to exist (anywhere in the jar)
`getRegulator`, `setSteering`, `controlBrakeForce`, `getTireInflation`,
`getTireRemoved`.

## 5. Gotchas to carry into implementation

1. **`setEngineFeature` takes three ints.** Fractional force must be pre-multiplied
   into a large integer scale, not passed as 0.85.
2. **Tire inflation is write-only.** Track intended pressure in mod data; you
   cannot read back what the engine currently has.
3. **`getEnginePower` and `getEngineQuality` are ints**, so PSC's
   `(100 - vehicle:getEngineQuality()) / 100` is integer-derived -- fine, but
   don't assume sub-1 resolution.
4. **`getId()` is a short.** Fine as a table key; don't assume int range.
5. **Late binding cuts both ways.** Anything you assign to `Vehicles.Update.X` is
   global and unconditional. Chain, don't clobber.
6. **`Vehicles.lua` lives in `server/`.** On an MP client those globals may not
   exist -- guard with `if not Vehicles then return end` in shared code.
7. **Vehicle scripts live in `media/scripts/generated/vehicles/`.** Generated;
   never hand-edit. Override the Lua function or use a `template vehicle`.
