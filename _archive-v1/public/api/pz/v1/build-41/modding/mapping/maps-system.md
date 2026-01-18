# maps/ Folder Documentation

**Location:** `media/maps/`
**Purpose:** World map data, spawn points, zone definitions, cell data

---

## Folder Structure

```
maps/
├── challengemaps/           # Challenge mode maps
├── Muldraugh, KY/          # Main map area
├── Riverside, KY/          # Riverside area
├── Rosewood, KY/           # Rosewood area
└── West Point, KY/         # West Point area
```

---

## Map Folder Contents

Each map folder contains:

| File Type | Purpose |
|-----------|---------|
| `*.lotheader` | Cell lot header data |
| `*.bin` | Binary cell data |
| `map.info` | Map metadata |
| `objects.lua` | Zone definitions |
| `spawnpoints.lua` | Player spawn locations |
| `worldmap.xml` | World map features |
| `worldmap-forest.xml` | Forest overlay features |

---

## map.info

Map metadata file:

```
title=See media/lua/shared/Translate/EN/Muldraugh, KY/title.txt
fixed2x=true
description=See media/lua/shared/Translate/EN/Muldraugh, KY/description.txt
```

### Properties

| Property | Description |
|----------|-------------|
| title | Path to localized title text |
| fixed2x | Whether map uses 2x resolution |
| description | Path to localized description |

---

## spawnpoints.lua

Defines player spawn locations by profession.

```lua
function SpawnPoints()
return {
    chef = {
        { worldX = 35, worldY = 31, posX = 106, posY = 174, posZ = 0 },
        { worldX = 35, worldY = 35, posX = 124, posY = 33, posZ = 0 },
    },
    doctor = {
        { worldX = 36, worldY = 33, posX = 76, posY = 128, posZ = 0 },
    },
    unemployed = {
        { worldX = 36, worldY = 33, posX = 116, posY = 233, posZ = 0 },
    }
}
end
```

### Spawn Point Properties

| Property | Description |
|----------|-------------|
| worldX | Cell X coordinate |
| worldY | Cell Y coordinate |
| posX | Position X within cell (0-299) |
| posY | Position Y within cell (0-299) |
| posZ | Floor level (0 = ground) |

### Profession Keys

| Key | Profession |
|-----|------------|
| chef | Chef/Cook |
| constructionworker | Construction Worker |
| doctor | Doctor |
| fireofficer | Fire Officer |
| parkranger | Park Ranger |
| policeofficer | Police Officer |
| repairman | Repairman |
| securityguard | Security Guard |
| unemployed | Unemployed |

---

## objects.lua

Defines map zones and regions.

```lua
objects = {
    { name = "", type = "Nav", x = 12592, y = 966, z = 0, width = 8, height = 234 },
    { name = "", type = "TownZone", x = 12541, y = 1090, z = 0, width = 32, height = 58 },
    { name = "StreetSports", type = "ZombiesType", x = 12617, y = 1130, z = 0, width = 26, height = 34 },
    { name = "trafficjamn", type = "ParkingStall", x = 12593, y = 966, z = 0, width = 3, height = 25 },
}
```

### Zone Object Properties

| Property | Description |
|----------|-------------|
| name | Zone name/identifier |
| type | Zone type |
| x, y | World position |
| z | Floor level |
| width, height | Zone dimensions |

### Zone Types

| Type | Purpose |
|------|---------|
| Nav | Navigation/road zones |
| TownZone | Urban area markers |
| Vegitation | Vegetation/foliage areas |
| ZombiesType | Zombie spawn type zones |
| ParkingStall | Vehicle spawn locations |

### ZombiesType Names

| Name | Zombie Appearance |
|------|-------------------|
| StreetSports | Athletic/sports clothing |
| Restaurant | Restaurant worker clothing |
| Factory | Factory worker clothing |
| Dinner | Diner worker clothing |
| Rich | Wealthy clothing |
| Tennis | Tennis player clothing |

---

## worldmap.xml

Defines world map features for the in-game map view.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<world version="1.0">
    <cell x="39" y="3">
        <feature>
            <geometry type="Polygon">
                <coordinates>
                    <point x="300" y="0"/>
                    <point x="300" y="300"/>
                    <point x="0" y="300"/>
                    <point x="0" y="0"/>
                </coordinates>
            </geometry>
            <properties>
                <property name="water" value="river"/>
            </properties>
        </feature>
    </cell>
</world>
```

### Feature Types

| Property | Values | Description |
|----------|--------|-------------|
| water | river, lake, pond | Water bodies |
| highway | primary, secondary, tertiary | Roads |
| railway | track | Rail lines |
| building | residential, commercial, industrial | Structures |
| landuse | forest, farmland, residential | Land types |

### Geometry Types

| Type | Description |
|------|-------------|
| Polygon | Closed area shape |
| LineString | Path/road line |
| Point | Single location |

---

## .lotheader Files

Cell lot header files contain tile references.

Filename format: `X_Y.lotheader`
- X = Cell X coordinate
- Y = Cell Y coordinate

Content: Binary header + list of tile sprite names used in the cell.

Example tiles:
```
blends_grassoverlays_01_0
blends_grassoverlays_01_1
floors_exterior_tilesandstone_01_0
walls_exterior_wooden_01_24
```

---

## .bin Files

Binary cell data files containing:
- Tile placements
- Object positions
- Room definitions
- Container contents
- Vehicle placements

These are compiled from TileZed/WorldEd and not human-readable.

---

## Cell Coordinate System

### World Coordinates
- Each cell is 300x300 tiles
- Cell (0,0) is at top-left of the world
- World X increases eastward
- World Y increases southward

### Position within Cell
- posX: 0-299 (west to east)
- posY: 0-299 (north to south)
- posZ: 0-7 (ground to 8th floor)

### Converting World to Cell

```lua
-- World position to cell
local cellX = math.floor(worldPos / 300)
local cellY = math.floor(worldPos / 300)

-- Position within cell
local posX = worldPos % 300
local posY = worldPos % 300
```

---

## Adding Custom Maps

### Step 1: Create Map Folder

```
media/maps/MyCustomMap/
├── map.info
├── objects.lua
├── spawnpoints.lua
├── worldmap.xml
├── [cell files]
```

### Step 2: Create map.info

```
title=My Custom Map
fixed2x=true
description=A custom map for Project Zomboid
```

### Step 3: Create spawnpoints.lua

```lua
function SpawnPoints()
return {
    unemployed = {
        { worldX = 0, worldY = 0, posX = 150, posY = 150, posZ = 0 },
    }
}
end
```

### Step 4: Create objects.lua

```lua
objects = {
    { name = "", type = "TownZone", x = 0, y = 0, z = 0, width = 300, height = 300 },
}
```

### Step 5: Create Cell Data

Use TileZed and WorldEd to create:
- Building lots (.tbx files)
- World cells (.pzw files)
- Export to .bin and .lotheader files

---

## Challenge Maps

Located in `challengemaps/` folder.

Used for special challenge modes with custom:
- Starting conditions
- Modified spawns
- Special objectives

---

## Lua Integration

### Getting Cell Data

```lua
-- Get current cell
local cell = getWorld():getCell()

-- Get cell at coordinates
local cellData = getWorld():getCell():getGridSquare(x, y, z)

-- Check cell loaded
local isLoaded = getWorld():isLoaded(x, y, z)
```

### Getting Zone Information

```lua
-- Get zombie type for location
local zombieType = getWorld():getZombiesType(x, y)

-- Get town zone
local townZone = getWorld():getTownZone(x, y)
```

### Working with Spawn Points

```lua
-- Get spawn points for profession
local spawns = getWorld():getSpawnPoints(profession)

-- Get random spawn
local spawn = spawns[ZombRand(#spawns)]
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Folder structure | Complete |
| map.info format | Complete |
| spawnpoints.lua | Complete |
| objects.lua | Complete |
| worldmap.xml | Complete |
| Cell coordinates | Complete |
| Zone types | Complete |
| Custom map guide | Complete |
| TileZed integration | Partial |
| Binary formats | Not detailed |

---

## Key Patterns

### Spawn Point Distribution
- Each profession has multiple spawn points
- Spawns are placed in appropriate locations (doctors near hospitals, etc.)
- `unemployed` is the fallback for all professions

### Zone Layering
- Nav zones define roads
- TownZone defines urban areas
- ZombiesType controls zombie appearance
- Vegetation zones enable foliage spawning

### Cell Grid
- 300x300 tiles per cell
- 8 height levels (0-7)
- Binary files contain actual tile data

---

## Next Steps

1. Document TileZed lot creation workflow
2. Document WorldEd cell editing
3. Create zone type reference
4. Document binary file formats
