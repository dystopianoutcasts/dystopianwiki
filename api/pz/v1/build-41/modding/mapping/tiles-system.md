# Tile Definitions Documentation

**Location:** `media/*.tiles`
**Purpose:** Define tile properties, behaviors, and object types for world objects

---

## Tile Definition Files

| File | Size | Description |
|------|------|-------------|
| newtiledefinitions.tiles | ~1.2 MB | Main tile definitions (appliances, furniture) |
| tiledefinitions.tiles | ~118 KB | Base tile definitions (floors, walls) |
| tiledefinitions_4.tiles | ~119 KB | Version 4 tile definitions |
| tiledefinitions_apcom.tiles | ~1 KB | AP Communications tiles |
| tiledefinitions_erosion.tiles | ~46 KB | Erosion/nature overlay tiles |
| tiledefinitions_noiseworks.patch.tiles | ~49 KB | Noiseworks patch tiles |
| tiledefinitions_overlays.tiles | ~47 KB | Overlay tiles |

---

## File Format

Tile definition files use a binary format with embedded property data.

### Header
```
tdef   [size]   [tileset_name]
[tileset_name].png
```

### Tile Entry Structure

Each tile in a tileset has properties defined:
```
[tile_index]   [property1]
[value1]
[property2]
[value2]
...
```

---

## Common Tile Properties

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| solidfloor | bool | Tile is a solid floor |
| solidtrans | bool | Solid but transparent |
| exterior | bool | Exterior environment tile |
| interior | bool | Interior environment tile |
| unflamable | bool | Cannot catch fire |
| noStart | bool | Cannot spawn players here |

### Container Properties

| Property | Type | Description |
|----------|------|-------------|
| container | string | Container type (fridge, stove, etc.) |
| ContainerCapacity | int | Maximum item capacity |
| ContainerPosition | string | Position (Low, High) |
| Freezer | bool | Has freezer compartment |
| FreezerCapacity | int | Freezer item capacity |
| NoFreezer | bool | Has no freezer |

### Object Properties

| Property | Type | Description |
|----------|------|-------------|
| CustomName | string | Display name (Oven, Fridge, etc.) |
| Facing | char | Direction (N, S, E, W) |
| GroupName | string | Group/variant (Green, Grey, White) |
| IsoType | string | ISO object type class |
| Surface | int | Surface height/level |

### Collision Properties

| Property | Type | Description |
|----------|------|-------------|
| BlocksPlacement | bool | Blocks item placement |
| CollisionShape | string | Collision shape name |
| IsLow | bool | Low-height object |

### Movement/Pickup Properties

| Property | Type | Description |
|----------|------|-------------|
| IsMoveAble | bool | Can be moved by player |
| PickUpLevel | int | Required skill level to pick up |
| PickUpTool | string | Required tool (Electrician, etc.) |
| PickUpWeight | int | Weight when picked up |
| PlaceTool | string | Required tool to place |
| ItemHeight | int | Item height in pixels |

### Scrap Properties

| Property | Type | Description |
|----------|------|-------------|
| CanScrap | bool | Can be scrapped for parts |
| ScrapSize | string | Scrap size (Small, Large) |
| Material | string | Primary material |
| Material2 | string | Secondary material |
| Material3 | string | Tertiary material |

### Visual Properties

| Property | Type | Description |
|----------|------|-------------|
| SpriteGridPos | string | Position in sprite grid (x,y) |
| attachedSurface | bool | Attached to surface |
| IsTableTop | bool | Table top item |
| IsSurfaceOffset | bool | Has surface offset |

### Wind Properties (Erosion)

| Property | Type | Description |
|----------|------|-------------|
| FloorOverlay | bool | Floor overlay tile |
| MoveWithWind | bool | Moves with wind |
| WindType | int | Wind movement intensity (1-3) |

---

## IsoType Values

The IsoType property defines the Java class behavior:

| IsoType | Description |
|---------|-------------|
| IsoStove | Stove/cooking appliance |
| IsoFridge | Refrigerator |
| IsoTV | Television |
| IsoRadio | Radio |
| IsoBed | Bed |
| IsoChair | Chair |
| IsoTable | Table |
| IsoDoor | Door |
| IsoWindow | Window |
| IsoThumpable | Destructible object |
| IsoWall | Wall section |
| IsoFloor | Floor tile |
| IsoTree | Tree |
| IsoBarricade | Barricade |
| IsoGenerator | Generator |
| IsoCompost | Compost bin |
| IsoRainCollector | Rain collector |

---

## Container Types

| Container | Used For |
|-----------|----------|
| stove | Ovens, stovetops |
| fridge | Refrigerators |
| microwave | Microwaves |
| counter | Countertops |
| shelves | Shelving units |
| wardrobe | Wardrobes, closets |
| dresser | Dressers |
| crate | Crates |
| bin | Garbage bins |
| locker | Lockers |
| desk | Desks |
| medicine | Medicine cabinets |
| displaycase | Display cases |
| vendingpop | Vending machines (drinks) |
| vendingsnack | Vending machines (snacks) |

---

## Collision Shapes

| Shape | Description |
|-------|-------------|
| NorthCounter | North-facing counter collision |
| SouthCounter | South-facing counter collision |
| EastCounter | East-facing counter collision |
| WestCounter | West-facing counter collision |
| FullTile | Full tile collision |
| HalfTile | Half tile collision |

---

## Material Types

### Primary Materials

| Material | Scrap Result |
|----------|--------------|
| Fridge | Refrigerator parts |
| Wood | Wooden planks |
| Metal | Metal parts |
| Glass | Glass shards |
| Fabric | Cloth/fabric |

### Secondary Materials

| Material | Description |
|----------|-------------|
| Electric | Has electrical components |
| MetalScrap | Produces metal scrap |
| Plaster | Plaster/drywall |

---

## Tileset Organization

### appliances_cooking_01

Cooking appliances with 4 facing variants each:
- Ovens (Green, Grey variants)
- Microwaves (White variant)
- Stovetops

### appliances_refrigeration_01

Refrigeration appliances:
- Fridges (various sizes)
- Freezers
- Mini-fridges

### TileFloorExt

Exterior floor tiles:
- Concrete
- Asphalt
- Brick
- Stone

### d_floorleaves_1 (Erosion)

Nature/erosion overlays:
- Leaf piles
- Dirt patches
- Grass growth

### d_generic_1 (Erosion)

Generic erosion elements:
- Wind-affected plants
- Debris

---

## Facing Directions

| Value | Direction | Description |
|-------|-----------|-------------|
| N | North | Facing north |
| S | South | Facing south |
| E | East | Facing east |
| W | West | Facing west |

Objects typically have 4 variants, one for each direction.

---

## Example: Oven Definition

```
BlocksPlacement
(true)
CanScrap
(true)
CollisionShape
WestCounter
ContainerCapacity
15
ContainerPosition
Low
CustomName
Oven
Facing
E
GroupName
Green
IsLow
(true)
IsMoveAble
(true)
IsoType
IsoStove
Material
Fridge
Material2
Electric
Material3
MetalScrap
PickUpLevel
3
PickUpTool
Electrician
PickUpWeight
200
PlaceTool
Electrician
Surface
34
container
stove
solidtrans
(true)
```

---

## Example: Fridge Definition

```
BlocksPlacement
(true)
CanScrap
(true)
CollisionShape
SouthCounter
CustomName
Fridge
Facing
N
Freezer
(true)
FreezerCapacity
20
GroupName
Large
IsMoveAble
(true)
Material
Fridge
Material2
Electric
Material3
MetalScrap
NoFreezer
(false)
PickUpLevel
3
PickUpWeight
400
ScrapSize
Large
SpriteGridPos
0,0
Surface
77
container
fridge
solidtrans
(true)
```

---

## Erosion Tile Properties

Erosion tiles use simpler properties:

```
FloorOverlay
(true)
exterior
(true)
```

For wind-affected vegetation:
```
MoveWithWind
(true)
WindType
3
```

WindType values:
- 1 = Slight movement
- 2 = Moderate movement
- 3 = Strong movement

---

## Lua Access

### Getting Tile Properties

```lua
-- Get sprite properties
local sprite = getSprite(spriteName)
local props = sprite:getProperties()

-- Check specific property
local isContainer = props:Is("container")
local containerType = props:Val("container")

-- Get custom name
local customName = props:Val("CustomName")
```

### Common Property Checks

```lua
-- Check if exterior
local isExterior = props:Is("exterior")

-- Check if solid floor
local isSolidFloor = props:Is("solidfloor")

-- Check if can be moved
local canMove = props:Is("IsMoveAble")

-- Get container capacity
local capacity = props:Val("ContainerCapacity")
```

---

## Modding Tile Definitions

### Adding Custom Tiles

Custom tiles can be defined in mod tilesets using TileZed.

1. Create tileset PNG in proper grid format
2. Define tile properties in TileZed
3. Export .tiles file
4. Place in mod's media folder

### Property Inheritance

Tiles in the same tileset can share properties from base definitions.

---

## Documentation Status

| Component | Status |
|-----------|--------|
| File format | Complete |
| Common properties | Complete |
| IsoTypes | Partial |
| Container types | Complete |
| Collision shapes | Partial |
| Materials | Complete |
| Erosion tiles | Complete |
| Lua access | Basic |

---

## Key Patterns

### Four-Direction Variants
- Most furniture has N/S/E/W variants
- Same properties, different Facing value
- CollisionShape changes per direction

### Container Hierarchy
- ContainerCapacity for main storage
- FreezerCapacity for freezer section
- Container type determines loot tables

### Material Scrapping
- Material defines primary scrap
- Material2/Material3 for additional components
- ScrapSize affects quantity

---

## Next Steps

1. Document complete IsoType list
2. Document all container types
3. Create TileZed integration guide
4. Document custom tileset creation
