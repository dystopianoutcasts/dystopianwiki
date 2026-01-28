---
id: documentation-status
slug: documentation-status
title: "Documentation Status"
game: pz
version: meta
section: research
category: research
subcategory: null
difficulty: beginner
tags:
  - status
  - progress
  - documentation
  - meta
excerpt: "Current status of wiki documentation across all games and systems."
related_articles:
  - engine-research-roadmap
  - vehicle-system-research
last_updated: 2026-01-28
---

# Documentation Status

This page tracks what's documented in the wiki and what still needs work.

---

## Project Zomboid

### Script Documentation (Build 41)

| Category | Status | Articles | Items Documented |
|----------|--------|----------|------------------|
| Weapons | Complete | 2 | 152 weapons |
| Weapon Properties | Complete | 1 | All properties explained |
| Food | Complete | 1 | 464 items |
| Clothing | Complete | 1 | 776 items |
| Items (General) | Complete | 2 | 466 items |
| Literature | Complete | 1 | 103 items |
| Bags | Complete | 1 | 21 items |
| Farming | Complete | 1 | 39 items |
| Recipes | Complete | 1 | 292 recipes |
| Evolved Recipes | Complete | 1 | 38 recipes |
| Fixing/Repair | Complete | 2 | 76 definitions |
| Vehicle Items | Complete | 1 | 97 parts |
| Sounds | Complete | 1 | 390 sounds |
| Radio | Complete | 1 | 23 items |

**Total Script Documentation: 16 articles, 2,900+ items**

### Lua API Documentation

| Category | Status | Articles |
|----------|--------|----------|
| Events System | Partial | 4 |
| ISUI Framework | Partial | 4 |
| Timed Actions | Partial | 1 |
| Context Menus | Partial | 1 |
| Foraging | Partial | 1 |
| ISBaseObject | Not Started | 0 |
| Farming Lua | Not Started | 0 |
| Fishing Lua | Not Started | 0 |

### Java Engine Documentation

| Category | Status | Articles |
|----------|--------|----------|
| Decompilation Setup | Complete | 1 |
| Core Systems | Complete | 1 |
| Lua Modding API | Complete | 1 |
| IsoZombie Reference | Complete | 1 |
| Zombie Optimization | Complete | 1 |
| Vehicle System | In Progress | 0 |
| Player System | Not Started | 0 |
| Loot System | Not Started | 0 |
| AI System | Not Started | 0 |

---

## Vintage Story

| Category | Status |
|----------|--------|
| All | Not Started |

*Vintage Story documentation is planned but not yet started.*

---

## Overall Progress

```
Project Zomboid Script Files:     ████████████████████ 100%
Project Zomboid Lua API:          ████████░░░░░░░░░░░░  40%
Project Zomboid Java Engine:      ██████░░░░░░░░░░░░░░  30%
Vintage Story:                    ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## What's Next

### High Priority

1. **Vehicle System** - Currently being researched
2. **Player Stats (Java)** - IsoPlayer internals
3. **Recipe Performance** - Implementation of 100-500x optimization

### Medium Priority

4. Loot system documentation
5. Spawning/population system
6. More Lua API coverage
7. AI system documentation

### Future

8. Vintage Story documentation
9. Map loading system
10. Networking/multiplayer internals

---

## How Documentation Gets Created

### For Script Files (.txt)

1. Python parser extracts all items/recipes
2. Parser generates reference tables
3. Human/AI writes explanatory guides
4. Review and publish to wiki

### For Lua/Java Code

1. Decompile or read source code
2. Analyze public APIs and patterns
3. Test findings in-game
4. Write practical documentation
5. Review and publish

---

## Related

- [Engine Research Roadmap](/meta/research/engine-research-roadmap)
- [Vehicle System Research](/meta/research/vehicle-system-research)

---

*Updated: 2026-01-28*
