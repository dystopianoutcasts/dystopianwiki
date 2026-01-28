---
id: vehicle-system-research
slug: vehicle-system-research
title: "Vehicle System Research"
game: pz
version: meta
section: research
category: research
subcategory: null
difficulty: advanced
tags:
  - vehicles
  - research
  - cars
  - physics
  - modding
excerpt: "Deep dive into Project Zomboid's vehicle system - how cars work internally, physics, parts, armor, and modding potential."
related_articles:
  - engine-research-roadmap
  - documentation-status
last_updated: 2026-01-28
---

# Vehicle System Research

We're currently researching how Project Zomboid's vehicle system works internally. This page tracks what we're learning and what questions we're trying to answer.

---

## Why Vehicles?

Vehicles are one of the most requested topics for documentation. Modders want to:

- Create entirely **new vehicle types**
- Add **custom armor** and protection
- Modify **physics and handling**
- Add **new parts and modifications**
- Understand **spawning and distribution**
- Optimize **vehicle-heavy mods**

---

## Decompiled Source Files

We have 37+ vehicle-related Java files to analyze:

### Core Classes

| File | Lines | Purpose |
|------|-------|--------|
| `BaseVehicle.java` | TBD | Core vehicle class - main focus |
| `VehicleCache.java` | TBD | Vehicle caching system |
| `VehicleDBHelper.java` | TBD | Database operations |
| `VehicleIDMap.java` | TBD | ID management |

### Parts System

| File | Purpose |
|------|--------|
| `VehiclePart.java` | Individual part handling |
| `VehicleDoor.java` | Door mechanics |

### Engine & Physics

| File | Purpose |
|------|--------|
| `VehicleEngineRPM.java` | Engine simulation |
| `EngineRPMData` | RPM/torque data |
| `VehicleInterpolation.java` | Multiplayer sync |

### Collision System

| File | Purpose |
|------|--------|
| `CircleLineIntersect.java` | Collision math |
| `PolyPolyIntersect.java` | Polygon collision |
| `QuadranglesIntersection.java` | Quadrangle collision |

### Spawning & AI

| File | Purpose |
|------|--------|
| `VehicleStorySpawner.java` | World spawning |
| `PathFindState2.java` | Vehicle pathfinding |
| `PathFindBehavior2.java` | AI driving behavior |

---

## Research Questions

### Architecture

- [ ] How is BaseVehicle structured internally?
- [ ] What's the vehicle lifecycle (spawn → use → destroy)?
- [ ] How do vehicle scripts connect to Java code?
- [ ] What public fields/methods are available to Lua?

### Parts System

- [ ] How do parts attach to vehicles?
- [ ] What determines part compatibility?
- [ ] How does part condition affect performance?
- [ ] How can we add completely new part types?

### Engine & Transmission

- [ ] How does RPM/torque/power work?
- [ ] How is fuel consumption calculated?
- [ ] How does transmission/gearing work?
- [ ] How does engine quality affect stats?

### Physics & Collision

- [ ] How does vehicle movement physics work?
- [ ] How does terrain affect handling?
- [ ] How does collision damage calculate?
- [ ] How does towing work mechanically?

### Armor & Protection

- [ ] How does armor protection calculate?
- [ ] What determines armor weight tradeoffs?
- [ ] How can we add custom armor types?
- [ ] How do windows/doors factor into protection?

### Spawning

- [ ] How do vehicles spawn in the world?
- [ ] What controls vehicle distribution?
- [ ] How does VehicleStorySpawner work?
- [ ] Can we create custom spawn distributions?

### Multiplayer

- [ ] How does vehicle state sync between players?
- [ ] How does interpolation smooth movement?
- [ ] How are passengers synchronized?

---

## Findings So Far

*This section will be updated as we analyze the code.*

### Initial Observations

- Vehicle system is **37+ Java files** - substantial codebase
- Uses **state interpolation** for smooth multiplayer
- Has dedicated **collision math** classes
- AI can **drive vehicles** via PathFindBehavior2
- Parts system appears **modular and extensible**

### Public Fields (TBD)

We're looking for public fields like we found with zombies. These allow direct manipulation without expensive method calls.

*To be documented as we analyze BaseVehicle.java*

---

## End Goals

Once research is complete, we'll publish:

1. **Vehicle Architecture Overview** - How the system works
2. **Vehicle Parts Deep Dive** - Parts, slots, installation
3. **Vehicle Physics Guide** - Movement, collision, terrain
4. **Vehicle Modding Tutorial** - Creating custom vehicles
5. **Vehicle Armor Guide** - Protection system, custom armor

---

## How You Can Help

If you're interested in vehicle modding:

1. **Share your experience** - What have you figured out?
2. **Ask questions** - What do you want to know?
3. **Test findings** - Help verify our analysis in-game
4. **Join Discord** - Discuss vehicle mechanics

---

## Related

- [Engine Research Roadmap](/meta/research/engine-research-roadmap) - Overall research plan
- [Documentation Status](/meta/research/documentation-status) - What's already documented

---

*Last Updated: 2026-01-28*
