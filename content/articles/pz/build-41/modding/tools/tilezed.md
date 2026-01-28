---
id: tools-tilezed
slug: tilezed
title: "TileZed Reference"
game: pz
version: build-41
section: modding
category: tools
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - tilezed
  - mapping
  - tiles
  - buildings
  - external
excerpt: "Reference guide for TileZed, the tile and building editor for Project Zomboid, with links to official resources and documentation."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Official Resources"
    link: "#official-resources"
  - text: "What TileZed Does"
    link: "#what-tilezed-does"
  - text: "Basic Workflow"
    link: "#basic-workflow"
  - text: "File Types"
    link: "#file-types"
  - text: "Integration with WorldEd"
    link: "#integration-with-worlded"
  - text: "Keyboard Shortcuts"
    link: "#keyboard-shortcuts"
  - text: "Tips for Beginners"
    link: "#tips-for-beginners"
  - text: "Common Issues"
    link: "#common-issues"
  - text: "External Links"
    link: "#external-links"
  - text: "Related Wiki Articles"
    link: "#related-wiki-articles"
last_updated: 2026-01-09
---

# TileZed Reference

## Overview

TileZed is the official tile and building editor for Project Zomboid. It's used to create custom tiles, buildings, and interior designs that can be added to the game world.

## Official Resources

### Download

**Build 41 Version (Unjammer Fork):**
- GitHub: [https://github.com/Unjammer/TileZed](https://github.com/Unjammer/TileZed)

This is the community-maintained fork updated for Build 41 compatibility.

### Primary Documentation

**The One-Stop TileZed Mapping Shop:**
- Forum Thread: [https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/](https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/)

This comprehensive forum thread is the definitive guide for TileZed, maintained by the community with tutorials, tips, and troubleshooting.

## What TileZed Does

### Building Editor
- Create custom buildings
- Design interior layouts
- Place furniture and objects
- Set room definitions
- Configure spawns and loot

### Tileset Editor
- Create custom tilesets
- Define tile properties
- Set container properties
- Configure tile behaviors

### TMX Export
- Export buildings as TMX files
- Compatible with WorldEd map editor
- Include spawn data
- Set room metadata

## Basic Workflow

1. **Open TileZed**
2. **Load or create a tileset**
3. **Design your building** using the tile palette
4. **Define rooms** for loot spawning
5. **Export as .tmx** for WorldEd

## File Types

| Extension | Purpose |
|-----------|----------|
| `.tileset` | Tileset definition |
| `.tbx` | Building file |
| `.tmx` | Exported map cell |
| `.tiles` | Tile definitions |

## Integration with WorldEd

TileZed buildings are placed into the game world using WorldEd:

1. Create building in TileZed
2. Export as .tmx
3. Open WorldEd
4. Place .tmx in world cells
5. Generate final map files

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Pan view |
| `Scroll` | Zoom in/out |
| `F` | Flip tile |
| `R` | Rotate tile |
| `Delete` | Remove tile |
| `Ctrl+Z` | Undo |
| `Ctrl+S` | Save |

## Tips for Beginners

1. **Start with existing buildings** - Study vanilla .tbx files
2. **Use room definitions** - Essential for loot spawning
3. **Layer properly** - Ground, walls, furniture, roof
4. **Test frequently** - Check in-game appearance
5. **Read the forum thread** - Most questions already answered

## Common Issues

### Tiles Not Showing
- Check tileset is loaded
- Verify tile IDs match
- Ensure .tiles file is valid

### Building Not Spawning
- Check room definitions
- Verify spawn points
- Test with debug mode

### Compatibility Issues
- Use Unjammer fork for B41
- Check Java version requirements

## External Links

- **GitHub (B41):** [https://github.com/Unjammer/TileZed](https://github.com/Unjammer/TileZed)
- **Forum Guide:** [https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/](https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/)
- **WorldEd (companion tool):** [WorldEd Reference](/build-41/modding/tools/worlded)

## Related Wiki Articles

- [TileZed Setup Guide](/build-41/modding/tools/tilezed-setup) - Detailed setup walkthrough
- [WorldEd Reference](/build-41/modding/tools/worlded) - World map editor
