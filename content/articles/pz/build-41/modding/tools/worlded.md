---
id: tools-worlded
slug: worlded
title: "WorldEd Reference"
game: pz
version: build-41
section: modding
category: tools
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - worlded
  - mapping
  - world
  - cells
  - external
excerpt: "Reference guide for WorldEd, the world map editor for Project Zomboid, with links to official resources and documentation."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Official Resources"
    link: "#official-resources"
  - text: "What WorldEd Does"
    link: "#what-worlded-does"
  - text: "Basic Workflow"
    link: "#basic-workflow"
  - text: "File Types"
    link: "#file-types"
  - text: "Cell Coordinates"
    link: "#cell-coordinates"
  - text: "Integration with TileZed"
    link: "#integration-with-tilezed"
  - text: "Keyboard Shortcuts"
    link: "#keyboard-shortcuts"
  - text: "Tips for Beginners"
    link: "#tips-for-beginners"
  - text: "Common Issues"
    link: "#common-issues"
  - text: "Map Mod Structure"
    link: "#map-mod-structure"
  - text: "External Links"
    link: "#external-links"
  - text: "Related Wiki Articles"
    link: "#related-wiki-articles"
last_updated: 2026-01-09
---

# WorldEd Reference

## Overview

WorldEd is the world map editor for Project Zomboid. It's used to assemble TileZed buildings into complete map cells and manage world-level data like vegetation, roads, and spawn zones.

## Official Resources

### Download

**Build 41 Version (Unjammer Fork):**
- GitHub: [https://github.com/Unjammer/WorldEd](https://github.com/Unjammer/WorldEd)

This is the community-maintained fork updated for Build 41 compatibility.

### Primary Documentation

**The One-Stop TileZed Mapping Shop:**
- Forum Thread: [https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/](https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/)

This comprehensive forum thread covers both TileZed and WorldEd with community guides.

## What WorldEd Does

### Cell Management
- Create new map cells
- Define cell boundaries
- Set cell metadata
- Manage lot placement

### Building Placement
- Import TileZed .tbx buildings
- Position buildings in cells
- Configure building properties
- Set spawn weights

### World Features
- Define roads and paths
- Configure vegetation zones
- Set water areas
- Manage forest boundaries

### Zone Definition
- Zombie spawn zones
- Loot distribution zones
- Profession spawn points
- Vehicle spawn areas

## Basic Workflow

1. **Create world project** in WorldEd
2. **Define cell grid** for your map area
3. **Import buildings** from TileZed (.tbx files)
4. **Place buildings** in appropriate cells
5. **Configure zones** for spawning
6. **Generate map files** for game use

## File Types

| Extension | Purpose |
|-----------|----------|
| `.pzw` | WorldEd project file |
| `.lotheader` | Lot header data |
| `.lotpack` | Packed lot data |
| `.bin` | Binary map data |
| `.tmx` | Cell data from TileZed |

## Cell Coordinates

Project Zomboid uses a cell-based coordinate system:

```
Cell size: 300x300 tiles
World origin: (0, 0)
Muldraugh: Around cells (35-42, 23-32)
West Point: Around cells (26-35, 16-22)
```

## Integration with TileZed

TileZed and WorldEd work together:

1. **TileZed** creates individual buildings
2. Buildings exported as .tbx or .tmx
3. **WorldEd** places buildings in world
4. World data exported as game files
5. Game loads combined map

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Pan view |
| `Scroll` | Zoom |
| `G` | Toggle grid |
| `B` | Building mode |
| `Z` | Zone mode |
| `Ctrl+S` | Save project |

## Tips for Beginners

1. **Study vanilla maps** - Load existing cells for reference
2. **Plan cell layout** - Map out your additions first
3. **Test incrementally** - Check in-game after major changes
4. **Use lot mode** - Easier building placement
5. **Back up projects** - WorldEd can corrupt files

## Common Issues

### Buildings Not Loading
- Verify .tbx path is correct
- Check file isn't corrupted
- Ensure TileZed version compatibility

### Cell Generation Fails
- Check for overlapping buildings
- Verify cell boundaries
- Ensure adequate memory

### Map Doesn't Show In-Game
- Verify export completed
- Check mod folder structure
- Clear cache (Zomboid/Lua folder)

## Map Mod Structure

Custom maps need this folder structure:

```
MyMapMod/
├── mod.info
└── media/
    └── maps/
        └── MyMap/
            ├── map.info
            ├── objects.lua
            ├── spawnpoints.lua
            ├── worldX-Y.lotpack
            └── worldX-Y.lotheader
```

## External Links

- **GitHub (B41):** [https://github.com/Unjammer/WorldEd](https://github.com/Unjammer/WorldEd)
- **Forum Guide:** [https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/](https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/)
- **TileZed (companion tool):** [TileZed Reference](/build-41/modding/tools/tilezed)

## Related Wiki Articles

- [TileZed Reference](/build-41/modding/tools/tilezed) - Building and tile editor
- [TileZed Setup Guide](/build-41/modding/tools/tilezed-setup) - Setup walkthrough
