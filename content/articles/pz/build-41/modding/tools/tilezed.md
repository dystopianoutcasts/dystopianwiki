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

## What Is TileZed and Why Would You Use It?

You know when you play Project Zomboid and think "I wish there was a custom safehouse here" or "this town needs a gun shop"? Or when you want to create a completely custom map with unique buildings that don't exist in vanilla? You could try to describe your vision to someone else, or you could build it yourself.

**TileZed is the official building editor for Project Zomboid.** It lets you design custom buildings tile-by-tile, room-by-room, floor-by-floor - everything from tiny sheds to massive apartment complexes. You place walls, floors, furniture, define where loot spawns, and export it to be placed in the game world. Without TileZed, creating custom buildings would be impossible.

When I first looked at TileZed, I was intimidated. The interface had dozens of buttons, hundreds of tiles, multiple layers (ground, walls, furniture, roof), and I had no idea where to start. I spent 30 minutes clicking random things before closing it in frustration. Then I found the forum guide, followed a simple "build a 3x3 room" tutorial, and suddenly it clicked. The complexity wasn't arbitrary - each tool had a specific purpose. Once I understood the workflow (load tileset → place tiles → define rooms → export), building became intuitive.

**This guide will introduce you to TileZed, show you where to find documentation, explain the basic workflow, and point you to the resources you need to start building.** By the end, you'll understand what TileZed does, how it fits into the modding pipeline, and where to learn the details.

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

## Common Mistakes

### 1. Not Defining Room Boundaries

**Wrong:**
```
Create building with furniture
No room definitions
Export and place in WorldEd
→ No loot spawns in building
```

**Right:**
```
Create building with furniture
Define rooms (bedroom, kitchen, bathroom)
Set room type for each room
Export and place in WorldEd
→ Appropriate loot spawns in each room
```

**Why:** Room definitions tell the game what type of loot to spawn. Without them, your building is just decorative - no items spawn. A bedroom needs a "bedroom" room definition to spawn clothes, beds, etc. A kitchen needs a "kitchen" definition to spawn food and cooking items.

**How to fix:** In TileZed, use the room tool to draw boundaries around each functional area and assign appropriate room types.

---

### 2. Forgetting to Load Required Tilesets

**Wrong:**
```
Open TileZed
Try to place vanilla furniture tiles
"Tile not found" errors everywhere
```

**Right:**
```
Open TileZed
File → Project → Open Project
Select your mod folder (loads tilesets automatically)
Or: Load tilesets manually from tileset menu
Now vanilla tiles appear in palette
```

**Why:** TileZed needs to know which tilesets to load. Without loading them, you can't see or place tiles. Vanilla tilesets contain thousands of tiles (walls, floors, furniture). Custom mods need their tileset loaded too.

**How to avoid:** Always use "Open Project" and point to your mod folder. This loads all required tilesets automatically.

---

### 3. Wrong Layer Order (Roof Before Walls)

**Wrong:**
```
Layer 0: Ground (floor tiles)
Layer 1: Roof tiles
Layer 2: Walls
Layer 3: Furniture
→ Walls appear on top of roof in-game (looks broken)
```

**Right:**
```
Layer 0: Ground (floor tiles)
Layer 1: Walls
Layer 2: Furniture
Layer 3: Roof tiles
→ Proper rendering order in-game
```

**Why:** The game renders layers bottom-to-top. If you put the roof before walls, walls will render on top of the roof, creating visual glitches. The standard order is: ground → walls → furniture → roof.

**Layer purposes:**
- **Layer 0:** Ground/floor tiles (always visible)
- **Layer 1-2:** Walls and furniture (main building)
- **Layer 3+:** Roof (hidden when inside, visible from outside)

---

### 4. Not Testing in Debug Mode Before Publishing

**Wrong:**
```
Build complex building in TileZed
Export as TMX
Place in WorldEd
Generate map
Upload to Workshop
→ Users report bugs: walls missing, loot not spawning, can't enter doors
```

**Right:**
```
Build complex building in TileZed
Export as TMX
Place in WorldEd
Generate map
Load game in debug mode
Teleport to building location
Test: walking through, opening doors, checking loot
Fix issues, regenerate, test again
→ Building works perfectly before uploading
```

**Why:** Many issues only become apparent in-game: missing collision, inaccessible areas, wrong door placement, rooms not spawning loot. Testing in debug mode lets you catch these before users encounter them.

**Debug test checklist:**
- Can you walk through all areas?
- Do doors open correctly?
- Does loot spawn in containers?
- Are there invisible walls?
- Can you place objects on surfaces?

---

### 5. Using Wrong Build (Old TileZed for Build 41)

**Wrong:**
```
Download TileZed from old official source
Open Build 41 tileset
Crashes or compatibility errors
```

**Right:**
```
Download TileZed from Unjammer fork
https://github.com/Unjammer/TileZed
Build 41 compatible version
Works with current game version
```

**Why:** The original TileZed was designed for older PZ builds. Build 41 changed many systems. The Unjammer fork is community-maintained and updated for Build 41 compatibility. Using the old version causes crashes and incompatibility issues.

**Where to get it:** Always use the Unjammer fork: https://github.com/Unjammer/TileZed

---

## Try It Yourself

### Exercise 1: Explore Vanilla Buildings

**Goal:** Learn TileZed by examining how vanilla buildings are structured.

**Steps:**
1. Download and install TileZed (Unjammer fork)
2. Navigate to your PZ installation: `ProjectZomboid/media/maps/`
3. Find a `.tbx` file (vanilla building)
4. Open it in TileZed
5. Examine layers, room definitions, tile placement

<details>
<summary><strong>Solution</strong></summary>

**Installation path:**
```
<your Steam library>\steamapps\common\ProjectZomboid\media\maps\
```

**Example vanilla building to examine:**
- Look for `.tbx` files in map directories
- Open with TileZed: File → Open → Select `.tbx` file

**What to examine:**
1. **Layers panel** (right side):
   - See how many layers the building uses
   - Notice layer 0 = ground, layer 1 = walls, etc.

2. **Room definitions** (if enabled):
   - Click room tool
   - See defined rooms (bedroom, kitchen, bathroom)
   - Notice each room has a type

3. **Tile properties:**
   - Click individual tiles
   - See properties panel (collision, container type, surface)

**Key lessons:**
- Vanilla buildings follow strict layer order
- Every functional room has a room definition
- Walls have collision, floors don't
- Containers (fridges, ovens) have specific properties
</details>

---

### Exercise 2: Create a Simple 3x3 Room

**Goal:** Build your first building from scratch.

**Requirements:**
- 3x3 interior space (floor tiles)
- Walls on all sides
- One door
- One window
- At least one piece of furniture

<details>
<summary><strong>Solution</strong></summary>

**Step-by-step:**

1. **Open TileZed:**
   - Launch TileZed
   - File → New Building
   - Name: "SimpleRoom"

2. **Create floor (Layer 0):**
   - Select layer 0 (ground)
   - Choose a floor tile from palette
   - Draw a 3x3 square

3. **Add walls (Layer 1):**
   - Select layer 1
   - Choose wall tiles
   - Place walls around the perimeter
   - Leave one gap for door

4. **Place door:**
   - Find door tiles in palette
   - Place in the gap you left

5. **Add window:**
   - Find window tiles
   - Replace one wall section with window

6. **Add furniture (Layer 1-2):**
   - Find furniture in palette (bed, table, chair)
   - Place inside room

7. **Define room:**
   - Click room definition tool
   - Draw boundary around interior
   - Set room type: "bedroom" or "living"

8. **Save:**
   - File → Save As → `SimpleRoom.tbx`

**Test:** Export as TMX and place in WorldEd to see it in-game.
</details>

---

### Exercise 3: Find and Fix a Structure Error

**Goal:** Practice identifying common building errors.

**Scenario:** You built a house but when you test in-game, you can't enter through the door. What's wrong?

**Debugging steps to try:**

<details>
<summary><strong>Solution</strong></summary>

**Common door placement errors:**

1. **Door on wrong layer:**
   - Doors should be on layer 1 (same as walls)
   - If on layer 0, they won't function

2. **Door tile missing door properties:**
   - Click the door tile in TileZed
   - Check properties panel
   - Should have `IsDoor=true` or similar property

3. **Wall blocking door:**
   - Check if wall tile overlaps door
   - Walls and doors can't occupy same space

4. **No floor under door:**
   - Door needs floor tile on layer 0 beneath it
   - Missing floor = can't walk there

**How to fix:**
1. Open building in TileZed
2. Select layer 1
3. Find the door tile
4. Verify it's a proper door tile (not decoration)
5. Verify floor exists on layer 0 below door
6. Re-export and test

**Prevention:** Always use door tiles from the "doors" section of tileset palette, not wall tiles that look like doors.
</details>

---

## Best Practices

1. **Read "The One-Stop TileZed Mapping Shop" forum thread first** - This 100+ page thread contains years of community knowledge. Before asking questions, search the thread - your question is likely already answered with detailed solutions.

2. **Use standard layer conventions** - Layer 0 = ground, Layer 1 = walls, Layer 2-3 = furniture/details, Layer 4+ = roof. Following this convention makes your buildings compatible with WorldEd and easier for others to edit.

3. **Define all functional rooms** - Every space where loot should spawn needs a room definition. Bedroom, kitchen, bathroom, living room, etc. Without room definitions, containers are empty and the building feels lifeless.

4. **Test in-game before finalizing** - Export → place in WorldEd → generate map → test in debug mode. Check collision, door function, loot spawning, and visual appearance. Fix issues before uploading to Workshop.

5. **Save frequently and use version numbers** - Save as `MyBuilding_v1.tbx`, `MyBuilding_v2.tbx` etc. TileZed can crash or corrupt files. Having multiple versions lets you roll back if something breaks.

6. **Study vanilla buildings for tile usage** - Don't guess which tiles to use for specific features. Open vanilla buildings and see how the developers did it. Copy their patterns for doors, windows, stairs, roofs.

7. **Start small, expand later** - Don't try to build a shopping mall as your first project. Build a single room, test it, then add another room. Incremental building catches errors early and prevents huge amounts of rework.

---

## Key Takeaways

1. **TileZed is the official building editor for Project Zomboid** - Used to create custom buildings tile-by-tile. Without it, creating custom structures is impossible.

2. **Download from Unjammer fork for Build 41** - The official version is outdated. Use https://github.com/Unjammer/TileZed for Build 41 compatibility.

3. **Read "The One-Stop TileZed Mapping Shop" forum thread** - This is THE resource for TileZed. Contains tutorials, examples, troubleshooting, and years of community knowledge: https://theindiestone.com/forums/index.php?/topic/21951

4. **Standard layer order: ground → walls → furniture → roof** - Layer 0 = floor, Layer 1 = walls, Layer 2-3 = furniture/details, Layer 4+ = roof. Follow this convention for compatibility.

5. **Room definitions are mandatory for loot spawning** - Without room definitions, your building is decorative only. Define rooms (bedroom, kitchen, etc.) to enable appropriate loot spawning.

6. **TileZed creates buildings, WorldEd places them** - TileZed makes individual buildings (exported as .tmx), WorldEd places them into the game world. They're companion tools.

7. **Always test in debug mode before publishing** - Export → place in WorldEd → generate map → test in-game. Check doors work, loot spawns, collision is correct, no visual glitches.

8. **Study vanilla .tbx files to learn tile usage** - Open vanilla buildings in TileZed to see professional examples. Copy their patterns for doors, windows, room definitions, and layer structure.

## External Links

- **GitHub (B41):** [https://github.com/Unjammer/TileZed](https://github.com/Unjammer/TileZed)
- **Forum Guide:** [https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/](https://theindiestone.com/forums/index.php?/topic/21951-the-one-stop-tilezed-mapping-shop/)
- **WorldEd (companion tool):** [WorldEd Reference](/build-41/modding/tools/worlded)

## Related Wiki Articles

- [TileZed Setup Guide](/build-41/modding/tools/tilezed-setup) - Detailed setup walkthrough
- [WorldEd Reference](/build-41/modding/tools/worlded) - World map editor
