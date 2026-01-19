# models/ Folder Documentation

**Location:** `media/models/`
**Purpose:** 3D model definitions for characters and vehicles

---

## Folder Contents

```
models/
├── kate.txt                    # Female character model (185KB)
├── Vehicle_StepVan.txt         # Step van model
├── Vehicle_Wheel.txt           # Standard wheel model
├── Vehicle_Wheel_SUV.txt       # SUV wheel model
└── Vehicles_*.txt              # Vehicle models (~40 files)
```

---

## Model File Format (.txt)

PZ uses a custom text-based animated mesh format.

### File Header

```
# Project Zomboid Animated Mesh
# File Version:
1.00000000
# Model Name:
modelname
# Vertex Stride Element Count:
6
# Vertex Stride Size (in bytes):
76
```

### Vertex Stride Data

```
# Vertex Stride Data:
# (Int)    Offset
# (String) Type
0
VertexArray
12
NormalArray
24
TangentArray
36
TextureCoordArray
44
BlendWeightArray
60
BlendIndexArray
```

### Vertex Data Elements

| Element | Offset | Purpose |
|---------|--------|---------|
| VertexArray | 0 | Vertex positions (XYZ) |
| NormalArray | 12 | Surface normals |
| TangentArray | 24 | Tangent vectors |
| TextureCoordArray | 36 | UV coordinates |
| BlendWeightArray | 44 | Bone weights |
| BlendIndexArray | 60 | Bone indices |

### Vertex Buffer Format

Each vertex contains:
```
X, Y, Z                     # Position (3 floats)
NX, NY, NZ                  # Normal (3 floats)
TX, TY, TZ                  # Tangent (3 floats)
U, V                        # UV coords (2 floats)
W1, W2, W3, W4              # Blend weights (4 floats)
B1, B2, B3, B4              # Bone indices (4 ints)
```

---

## Character Models

### kate.txt
- Female player character base mesh
- 536+ vertices
- Used for female player and NPCs
- Supports skeletal animation

### Related Files (in other folders)
- `media/anims/` - Animation data
- `media/AnimSets/` - Animation set definitions
- `media/animstates/` - State machine definitions

---

## Vehicle Models

### Model Types

| File Pattern | Vehicle Type |
|--------------|--------------|
| `Vehicles_CarNormal*.txt` | Standard sedan |
| `Vehicles_CarLights.txt` | Car with lights |
| `Vehicles_CarTaxi.txt` | Taxi variant |
| `Vehicles_CarStationWagon.txt` | Station wagon |
| `Vehicles_SmallCar*.txt` | Compact car |
| `Vehicles_SportsCar*.txt` | Sports car |
| `Vehicles_ModernCar*.txt` | Modern sedan |
| `Vehicles_LuxuryCar*.txt` | Luxury car |
| `Vehicles_PickUp*.txt` | Pickup truck |
| `Vehicles_Van*.txt` | Van |
| `Vehicles_SUV*.txt` | SUV |
| `Vehicles_OffRoad*.txt` | Off-road vehicle |
| `Vehicles_Ambulance*.txt` | Ambulance |
| `Vehicle_StepVan.txt` | Step van/delivery |

### Burnt Variants

Most vehicles have `*_Burnt.txt` variants:
- Damaged/destroyed appearance
- Different mesh geometry
- Burnt texture mapping

### Wheel Models

| File | Purpose |
|------|---------|
| `Vehicle_Wheel.txt` | Standard wheel |
| `Vehicle_Wheel_SUV.txt` | SUV wheel |
| `Vehicles_Wheel.txt` | Alternative wheel |
| `Vehicles_Wheel02.txt` | Wheel variant 2 |
| `Vehicles_Wheel03.txt` | Wheel variant 3 |
| `Vehicles_Wheel04.txt` | Wheel variant 4 |

---

## Model Size Reference

| Model | Approximate Size |
|-------|-----------------|
| kate.txt | 185 KB |
| Vehicle (standard) | 80-120 KB |
| Vehicle (burnt) | 100-160 KB |
| Wheel | 5-6 KB |

---

## Model Referencing

### In Vehicle Scripts

```
vehicle CarNormal
{
    model
    {
        file = Vehicles_CarNormal,
    }
}
```

### In Clothing/Item Scripts

```
item MyItem
{
    WorldStaticModel = ModelName,
}
```

---

## Static Models Location

Item and world object static models are in:
- `media/models_X/` folders (where X is a number)
- Referenced via `models_items.txt` script

### models_items.txt Reference

```
model ModelName
{
    mesh = path/to/mesh,
    texture = path/to/texture,
    scale = 1.0,
}
```

---

## Skinned vs Static Models

### Skinned Models (models/)
- Character models (kate.txt)
- Animated meshes
- Bone-weighted vertices
- Used with animation system

### Static Models (models_X/)
- World items
- Dropped items
- Building objects
- No skeletal animation

---

## Animation System Integration

Character models work with:

1. **AnimSets/** - Define animation groups
2. **anims/** - Animation clip data
3. **animstates/** - State machine logic
4. **animscript/** - Animation scripting

### Animation Flow

```
Model (kate.txt)
    ↓
AnimSet (defines available animations)
    ↓
AnimState (state machine)
    ↓
Animation Clips (actual movement data)
```

---

## Vehicle Model Components

Each vehicle model contains:

1. **Body mesh** - Main vehicle body
2. **Interior** - Dashboard, seats
3. **Glass** - Windows, windshield
4. **Lights** - Headlights, taillights
5. **Doors** - Separate door meshes
6. **Hood/Trunk** - Opening parts

### Part Separation

Parts are separated for:
- Individual damage states
- Opening animations
- Detachment when destroyed

---

## Custom Model Requirements

### For Items
1. Create model in 3D software
2. Export to PZ format (using tools)
3. Place in appropriate models folder
4. Reference in scripts/models_items.txt

### For Vehicles
1. Create vehicle model with parts
2. Export each part separately
3. Define in vehicle script
4. Configure part positions

### For Characters
1. Follow kate.txt bone structure
2. Match vertex format
3. Ensure animation compatibility

---

## Documentation Status

| Component | Status |
|-----------|--------|
| File format | Complete |
| Character models | Complete |
| Vehicle models | Complete |
| Model referencing | Complete |
| Animation integration | Partial |
| Custom model guide | Basic |

---

## Key Patterns

### Burnt Variants
- Every vehicle has normal + burnt version
- Burnt models have different geometry
- Used when vehicle is destroyed

### Wheel Separation
- Wheels are separate models
- Allows individual wheel damage
- Different wheel types per vehicle

### Vertex Format
- Standard stride: 76 bytes
- 6 elements per vertex
- Bone-weighted for animation

---

## Next Steps

1. Document animation system
2. Document models_X folders
3. Create model export guide
4. Document bone structure
