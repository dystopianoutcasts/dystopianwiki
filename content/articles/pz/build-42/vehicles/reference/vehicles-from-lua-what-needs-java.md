---
id: build-42-vehicles-from-lua-what-needs-java
slug: vehicles-from-lua-what-needs-java
title: 'Car physics from Lua: what works, what does nothing, what needs Java'
game: pz
version: build-42
section: vehicles
category: reference
difficulty: advanced
tags:
  - vehicles
  - physics
  - lua
  - java
excerpt: >-
  We drove a probe car and measured which BaseVehicle calls really change a
  car from Lua. Engine force writes are smooth, weight works through
  setInitialMass, tyre pressure changes nothing in a straight line, and gears
  and RPM cannot be controlled. The results table, and the list that still
  needs Java.
last_updated: '2026-10-04'
---
# Car physics from Lua: what works, what does nothing, what needs Java

Outcast, before we planned a car mod we asked a simple question: how much of a car's behaviour can a Lua mod really change, with no Java? Reading method signatures was not enough, because a public method is not always a usable one. So we wrote a probe mod, drove a vanilla car with it, and logged every answer. This page is the result. For the Java side of the story, and why reflection is no way round it, see [reflection and Java modding](/pz/build-42/vehicles/mod-studies/reflection-and-java-modding).

## The results

| Question | Answer | What we saw |
|---|---|---|
| Can Lua read the driver's throttle? | **Yes** | `getThrottle()` reads 0.0 to 1.0 live |
| Can Lua write engine force every tick without a fight? | **Yes** | `setEngineFeature` written each tick from an RPM curve; acceleration stayed smooth, no judder or snap-back |
| Can Lua change a car's weight? | **Yes, through `setInitialMass`** | `setMass` is overwritten on the next recompute; `setInitialMass` holds |
| Does tyre pressure change straight-line physics? | **No measurable effect** | All four tyres at 0.3: coast-down from 100 to 5 km/h took 10.21 s against 10.27 s at full pressure |
| Can Lua choose a gear? | **No** | `changeTransmission` is public but no Lua value fits its argument |
| Can Lua hold the engine RPM? | **No** | A written RPM was back at idle within a tick |
| Do the wear hooks for brakes, suspension, tyres and muffler fire? | **Yes** | Once per game minute per part; four times per car for the per-wheel parts |
| Do the getters work? | **Yes, all 18 we tried** | Throttle, pedals, speed, RPM, power, quality, mass, top speed, gear, braking force, steering, off-road |

> **Proof:** Game test. A probe mod logged each read and write while driving a vanilla car (the log lines and coast-down timings are in our research notes); single player. Build 42.20, engine revision a2947723ca.

The methods themselves are all still public on `BaseVehicle` in 42.21.

> **Proof:** Code. `zombie.vehicles.BaseVehicle`: `getThrottle`, `setEngineFeature`, `setInitialMass`, `updateTotalMass`, `setTireInflation`, `setBrakingForce`, `setCurrentSteering`, `setEngineSpeed`, `changeTransmission`, `getTransmissionNumberEnum` are present and public. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Weight: write the base, not the total

A car's mass is recomputed as its base mass plus the weight of everything in its parts and containers:

```java
this.setMass(Math.round(this.getInitialMass() + plusMass));
```

So `setMass` is an output: anything you write there is replaced the next time the game recomputes (fuel burning is enough to trigger it). Write `setInitialMass`, then call `updateTotalMass()`. And remember `getMass()` already includes the cargo: a vanilla car read 1038 with a base of 800. Setting both to the same number throws the load away.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#updateTotalMass` (the line above). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Game test. `setMass(2066)` plus `setInitialMass(1600)` settled at 1833, which is 1600 plus the car's 233 of load, and drifted down as fuel burned. Build 42.20, engine revision a2947723ca.

## Tyre pressure: not in a straight line

`setTireInflation` does reach the native physics (it is used in the vehicle class and the physics bridge), but a careful coast-down could not see it. Three of five speed segments were identical at our timing resolution. It may affect grip in corners, which a straight-line test cannot measure; we did not test cornering. If your mod's pressure should change fuel use or top speed, you will have to model that yourself.

> **Proof:** Game test. Paired coast-downs on the same road, pressure 0.3 against full, timed per 20 km/h segment. Build 42.20, engine revision a2947723ca.

## Gears and RPM belong to the car controller

`changeTransmission(TransmissionNumber)` is public, but `getTransmissionNumberEnum()` arrives in Lua as the gear's name, a plain string such as `"N"`, and there is no route from Lua to a real `TransmissionNumber` value. And an RPM written with `setEngineSpeed` was overwritten by the car controller within a tick. Real gear ratios and RPM control need Java.

> **Proof:** Game test. Three routes to a `TransmissionNumber` constant failed in the probe log (`valueOf of non-table: N`); a written RPM of 3000 read back at 733.7 idle. Build 42.20, engine revision a2947723ca.

## What still needs Java

We looked for a Lua route to each of these and found none:

- the tyre grip and friction solver itself;
- rolling resistance and aerodynamic drag;
- the impulse when a car hits a zombie;
- engine sound parameters;
- towing and trailer behaviour;
- tyre lock-up and spin-out visuals;
- the car controller's integration loop (gears, RPM).

Some can be approximated (scale engine force by surface, weather and tyre condition to fake traction). Sound and visuals cannot.

> **Proof:** Unknown. Searched the public, Lua-visible methods of `BaseVehicle` and the classes they return for each item above and found no setter; not proven impossible. Build 42.20, engine revision a2947723ca.

## Where to go next

- [The vanilla mechanics code: what it really checks](/pz/build-42/vehicles/reference/vanilla-mechanics-code-what-it-really-checks)
- [Car physics mods](/pz/build-42/vehicles/mod-studies/car-physics-mods)
