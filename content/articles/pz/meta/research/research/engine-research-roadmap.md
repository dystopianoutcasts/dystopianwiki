---
id: engine-research-roadmap
slug: engine-research-roadmap
title: "Engine Research Roadmap"
game: pz
version: meta
section: research
category: research
subcategory: null
difficulty: beginner
tags:
  - research
  - roadmap
  - community
  - meta
excerpt: "Public tracking of our ongoing engine research - what we've documented, what we're working on, and what's planned."
related_articles:
  - vehicle-system-research
  - documentation-status
last_updated: 2026-01-28
---

# Engine Research Roadmap

This page tracks our ongoing effort to document game engine internals. We decompile game code, analyze it, and publish guides to help modders understand how things work under the hood.

---

## How We Do Research

1. **Decompile** the game files using tools like Vineflower
2. **Analyze** the source code for public fields and methods
3. **Test** our findings in-game
4. **Document** practical guides for modders

---

## Current Focus: Project Zomboid

### Completed Research

| System | Status | Articles | Key Findings |
|--------|--------|----------|-------------|
| **Zombie System** | Complete | 2 articles | Public fields for attributes, 10x performance improvement |
| **Core Architecture** | Complete | 1 article | Game loop, Lua integration, character hierarchy |
| **Lua Bridge** | Complete | 1 article | How Lua connects to Java, mod loading |
| **Weapons (Script)** | Complete | 2 articles | All 152 vanilla weapons documented |
| **Items (Script)** | Complete | 10+ articles | Food, clothing, farming, vehicles, etc. |
| **Recipes** | Complete | 2 articles | Regular and evolved recipes |
| **Repair System** | Complete | 2 articles | All 76 fixing definitions |

### In Progress

| System | Status | Lead |
|--------|--------|------|
| **Vehicle System** | Researching | Ediaz |
| **Recipe Performance** | Analysis done, needs implementation | - |

### Planned Research

| System | Priority | Why It Matters |
|--------|----------|----------------|
| **Player Stats (Java)** | High | Deep IsoPlayer internals |
| **Loot System** | Medium | How loot tables work |
| **Spawning/Population** | Medium | Zombie/item/vehicle spawning |
| **Map Loading** | Medium | World chunks, grid squares |
| **AI System** | Medium | 50+ AI states, pathfinding |
| **Physics** | Low | Collision, movement |
| **Networking** | Low | Multiplayer sync |

---

## Research Repositories

We maintain research in two locations:

| Repository | Contents |
|------------|----------|
| **PZ_Engine_Analysis** | 1,599 decompiled Java files + analysis docs |
| **ENGINE_RESEARCH** | Structured optimization research, benchmarks |

---

## Key Discoveries So Far

### Performance Findings

| Discovery | Impact |
|-----------|--------|
| Zombie attributes are **public fields** | 10x faster than makeInactive() hack |
| Recipe system scans **all recipes** on right-click | 100-500x improvement possible with indexing |
| Zombies are **pooled and recycled** | Must reapply attributes after recycle |

### Code Scale

| File | Lines | Notes |
|------|-------|-------|
| LuaManager.java | 8,893 | Heart of modding |
| IsoPlayer.java | 7,585 | Main player class |
| IsoGridSquare.java | 8,814 | Tile system |
| IsoZombie.java | 4,591 | Zombie class |
| IsoWorld.java | 2,646 | World management |

---

## How to Contribute

1. **Pick a topic** from "Planned Research"
2. **Decompile** the relevant game files
3. **Analyze** for public APIs and performance patterns
4. **Test** in-game to verify findings
5. **Share** via Discord or wiki submission

---

## Related Pages

- [Vehicle System Research](/meta/research/vehicle-system-research) - Current deep-dive
- [Documentation Status](/meta/research/documentation-status) - What's documented

---

*Updated: 2026-01-28*
