# Loot Distribution System Documentation

**Location:** `media/lua/server/Items/Distributions.lua`, `ProceduralDistributions.lua`, `SuburbsDistributions.lua`
**Purpose:** Define what items spawn in containers throughout the game world

---

## Overview

Project Zomboid's loot system uses a two-tier distribution approach:

1. **Room Distributions** (`Distributions.lua`) - Define what containers exist in room types
2. **Procedural Distributions** (`ProceduralDistributions.lua`) - Define named loot lists with actual items

This separation allows room definitions to reference reusable loot lists, making the system modular and maintainable.

---

## Distribution Table Structure

### Basic Container Definition

```lua
SuburbsDistributions.roomname = {
    containername = {
        rolls = 4,           -- Number of loot attempts
        items = {
            "ItemName", 10,  -- Item type, weight (chance)
            "ItemName2", 5,
        },
        junk = {             -- Additional roll for junk items
            rolls = 1,
            items = {
                "Newspaper", 4,
            }
        }
    },
}
```

### Procedural Reference Definition

```lua
SuburbsDistributions.roomname = {
    containername = {
        procedural = true,
        procList = {
            {name = "ProcDistName", min = 0, max = 99},
            {name = "ProcDistName2", min = 0, max = 99, weightChance = 50},
        }
    },
}
```

---

## Key Properties

### Container Properties

| Property | Type | Description |
|----------|------|-------------|
| `rolls` | int | Number of times to attempt spawning items (1-8 typical) |
| `items` | table | Alternating item type strings and weight numbers |
| `junk` | table | Secondary roll table for common/junk items |
| `procedural` | bool | If true, uses `procList` instead of `items` |
| `procList` | table | List of procedural distribution references |
| `forceForZones` | string | Force this distribution for specific zone types |
| `forceForRooms` | string | Force for specific room types |

### procList Entry Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Name of procedural distribution to reference |
| `min` | int | Minimum day for this distribution (0 = start) |
| `max` | int | Maximum day for this distribution (99 = always) |
| `weightChance` | int | Weight chance for this entry (optional) |
| `forceForTiles` | string | Only use for specific tile types |

---

## Room Distribution Categories

### Residential Rooms

| Room Type | Description | Key Containers |
|-----------|-------------|----------------|
| `bathroom` | Home bathrooms | counter, medicine, mirror |
| `bedroom` | Bedrooms | wardrobe, dresser, sidetable |
| `closet` | Storage closets | shelves, crate |
| `garage` | Home garages | shelves, counter, metal_shelves |
| `kitchen` | Kitchens | counter, fridge, overhead |
| `laundryroom` | Laundry rooms | washer, dryer, shelves |
| `livingroom` | Living rooms | shelves, sidetable |

### Commercial Rooms

| Room Type | Description | Key Containers |
|-----------|-------------|----------------|
| `aesthetic` | Salons/beauty | counter, shelves |
| `all` | Generic any-room | all container types |
| `army` | Military | locker, crate, metal_shelves |
| `armyhanger` | Military hangers | crate, metal_shelves |
| `armystorage` | Military storage | crate, locker |
| `bank` | Banks | counter, desk, safe |
| `bar` | Bars | counter, fridge, shelves |
| `batteryfactory` | Battery factories | crate, metal_shelves |
| `butcher` | Butcher shops | counter, fridge |
| `cafe` | Cafes | counter, fridge |
| `church` | Churches | shelves, desk |
| `classroom` | Schools | desk, locker |
| `clothingstorage` | Clothing storage | cardboardbox, shelves |
| `conveniencestore` | Convenience stores | counter, shelves, fridge |
| `cornerstore` | Corner stores | counter, shelves |
| `daycare` | Daycare centers | shelves, desk |
| `dentaloffice` | Dental offices | counter, desk |
| `department` | Department stores | shelves, counter |
| `dining` | Restaurants | counter, fridge |
| `dogfoodstore` | Pet stores | shelves, counter |
| `electronics` | Electronics stores | counter, shelves |
| `factory` | Factories | crate, metal_shelves, locker |
| `farm` | Farms | crate, shelves |
| `firestation` | Fire stations | locker, metal_shelves |
| `firestorage` | Fire storage | locker, crate |
| `fossoil` | Gas stations | counter, shelves |
| `gas2go` | Gas stations | counter, shelves |
| `generalstore` | General stores | counter, shelves |
| `gigamart` | Grocery stores | shelves, fridge, freezer |
| `grocery` | Grocery stores | shelves, fridge |
| `gunstore` | Gun stores | counter, displaycase, shelves |
| `gym` | Gyms | locker, shelves |
| `hair` | Hair salons | counter, shelves |
| `hardware` | Hardware stores | counter, shelves, metal_shelves |
| `hospitalroom` | Hospital rooms | sidetable, counter |
| `hotel` | Hotels | wardrobe, dresser |
| `hunting` | Hunting stores | counter, shelves, displaycase |
| `jewelry` | Jewelry stores | displaycase, counter |
| `junkyard` | Junkyards | crate, metal_shelves |
| `laundromat` | Laundromats | washer, shelves |
| `library` | Libraries | shelves |
| `liquorstore` | Liquor stores | shelves, counter |
| `localbar` | Local bars | counter, fridge |
| `logistics` | Warehouses | crate, metal_shelves |
| `lounge` | Lounges | shelves, counter |
| `mall` | Malls | various by store type |
| `mccoys` | Hardware stores | shelves, metal_shelves |
| `mechanic` | Mechanic shops | counter, metal_shelves, locker |
| `medical` | Medical facilities | counter, metal_shelves |
| `medicalclinic` | Clinics | counter, medicine |
| `medicaloffice` | Medical offices | desk, counter |
| `morgue` | Morgues | metal_shelves, counter |
| `motel` | Motels | wardrobe, dresser |
| `moviecurtains` | Movie theaters | shelves |
| `musicstore` | Music stores | shelves, counter |
| `office` | Offices | desk, filing |
| `optometrist` | Optometrists | counter, shelves |
| `pawn` | Pawn shops | counter, shelves, displaycase |
| `pharmacy` | Pharmacies | counter, shelves |
| `photostore` | Photo stores | shelves, counter |
| `pizzawhirled` | Pizza shops | counter, fridge |
| `police` | Police stations | locker, desk, metal_shelves |
| `policestorage` | Police storage | locker, crate |
| `pool` | Pools | locker |
| `post` | Post offices | shelves, counter |
| `prison` | Prisons | locker, metal_shelves |
| `prisoncells` | Prison cells | shelves |
| `radioshack` | Electronics stores | shelves, counter |
| `restaurant` | Restaurants | counter, fridge |
| `restaurantkitchen` | Restaurant kitchens | counter, fridge, shelves |
| `school` | Schools | desk, locker |
| `seafood` | Seafood stores | counter, fridge |
| `shed` | Sheds | shelves, crate |
| `spiffos` | Fast food | counter, fridge |
| `sports` | Sports stores | shelves, counter |
| `storage` | Storage units | crate, cardboardbox |
| `storageunit` | Storage units | crate, cardboardbox |
| `tailorshop` | Tailor shops | shelves, counter |
| `theatre` | Theaters | shelves, counter |
| `toolstore` | Tool stores | shelves, metal_shelves |
| `toys` | Toy stores | shelves |
| `tvstation` | TV stations | desk, shelves |
| `vacant` | Vacant buildings | crate, cardboardbox |
| `vegitation` | Plant nurseries | crate, shelves |
| `videorental` | Video rentals | shelves, counter |
| `warehouse` | Warehouses | crate, metal_shelves |
| `zippee` | Convenience stores | counter, shelves, fridge |

---

## Container Types

### Common Containers

| Container | Description | Typical Locations |
|-----------|-------------|-------------------|
| `cardboardbox` | Cardboard boxes | storage, moving |
| `counter` | Store/kitchen counters | commercial, kitchen |
| `crate` | Wooden crates | warehouse, storage |
| `desk` | Office desks | office, bedroom |
| `displaycase` | Glass display cases | retail stores |
| `dresser` | Bedroom dressers | bedroom |
| `filing` | Filing cabinets | office |
| `freezer` | Commercial freezers | grocery, restaurant |
| `fridge` | Refrigerators | kitchen, commercial |
| `locker` | Metal lockers | gym, school, military |
| `medicine` | Medicine cabinets | bathroom |
| `metal_shelves` | Metal shelving | warehouse, garage |
| `overhead` | Overhead cabinets | kitchen |
| `safe` | Safes | bank, office |
| `shelves` | General shelves | everywhere |
| `sidetable` | Side tables | bedroom, living room |
| `wardrobe` | Wardrobes | bedroom |

### Special Containers

| Container | Description |
|-----------|-------------|
| `bin` | Trash bins |
| `campfire` | Campfire containers |
| `clothingdryer` | Clothing dryers |
| `clothingwasher` | Washing machines |
| `composter` | Composters |
| `Dumpster` | Large dumpsters |
| `giftbox` | Gift boxes |
| `grocerybag` | Grocery bags |
| `MannequinFemale` | Female mannequins |
| `MannequinMale` | Male mannequins |
| `postbox` | Post boxes |
| `SkeletonCorpse` | Skeleton corpses |
| `vendingpop` | Soda vending machines |
| `vendingsnack` | Snack vending machines |

---

## Procedural Distribution Examples

From `ProceduralDistributions.lua`:

### CrateCarpentry
```lua
ProceduralDistributions.list.CrateCarpentry = {
    rolls = 4,
    items = {
        "Plank", 20,
        "Nails", 20,
        "Screws", 10,
        "Woodglue", 6,
        "Hammer", 4,
        "Saw", 4,
        "Screwdriver", 4,
        "WoodAxe", 2,
    },
    junk = {
        rolls = 1,
        items = {
            "Plank", 10,
            "Nails", 10,
        }
    }
}
```

### MedicalStorageDrugs
```lua
ProceduralDistributions.list.MedicalStorageDrugs = {
    rolls = 4,
    items = {
        "Pills", 20,
        "PillsAntiDep", 10,
        "PillsBeta", 8,
        "PillsSleepingTablets", 8,
        "PillsVitamins", 10,
        "Antibiotics", 4,
    },
}
```

### GunStoreDisplayCase
```lua
ProceduralDistributions.list.GunStoreDisplayCase = {
    rolls = 4,
    items = {
        "Pistol", 10,
        "Pistol2", 8,
        "Pistol3", 6,
        "Revolver", 8,
        "Revolver_Long", 4,
        "Revolver_Short", 6,
    },
}
```

### FarmingSupplies
```lua
ProceduralDistributions.list.FarmingSupplies = {
    rolls = 4,
    items = {
        "Trowel", 10,
        "HandFork", 8,
        "Rake", 6,
        "Shovel", 4,
        "Shovel2", 4,
        "Hoe", 4,
        "GardenHoe", 6,
        "WateringCan", 8,
        "NPKFertilizer", 6,
        "CompostBag", 4,
        "GardenSaw", 4,
        "SeedBag", 10,
    },
}
```

---

## Distribution Categories

### Procedural Distribution Naming Conventions

| Prefix | Category | Examples |
|--------|----------|----------|
| `Army` | Military loot | ArmyStorageGuns, ArmyStorageOutfit |
| `Bag` | Bag contents | BagHiker, BagSurvivor |
| `Bar` | Bar/pub items | BarCounterMisc, BarShelf |
| `Camp` | Camping gear | CampingStoreGear, Campfire |
| `Crate` | Crate contents | CrateCarpentry, CrateTools |
| `Farm` | Farming items | FarmingSupplies, FarmerStorageCrops |
| `Fire` | Fire station | FireStorageOutfit, FireStorageTools |
| `Gun` | Gun store | GunStoreDisplayCase, GunStoreShelf |
| `Kitchen` | Kitchen items | KitchenCounter, KitchenFridge |
| `Medical` | Medical supplies | MedicalStorageDrugs, MedicalClinic |
| `Mechanic` | Mechanic items | MechanicShelf, MechanicTools |
| `Office` | Office supplies | OfficeDesk, OfficeFiling |
| `Police` | Police items | PoliceStorageGuns, PoliceStorageOutfit |
| `Tool` | Tools | ToolStoreShelves, ToolStoreCounter |
| `Warehouse` | Warehouse items | WarehouseFood, WarehouseTools |

---

## Weight/Chance System

### How Weights Work

- Weights are relative, not percentages
- Higher weight = more likely to spawn
- Total weight determines probability: `chance = weight / totalWeight`

### Example Calculation

```lua
items = {
    "Hammer", 10,    -- 10/26 = 38.5% chance
    "Screwdriver", 8, -- 8/26 = 30.8% chance
    "Wrench", 4,     -- 4/26 = 15.4% chance
    "Saw", 4,        -- 4/26 = 15.4% chance
}
-- Total weight: 26
```

### Weight Guidelines

| Weight Range | Description | Example Items |
|--------------|-------------|---------------|
| 1-2 | Very rare | Rare weapons, unique items |
| 3-5 | Uncommon | Tools, medications |
| 6-10 | Common | Food, basic supplies |
| 11-20 | Very common | Junk, newspapers, generic items |
| 50-100 | Extremely common | Filler items |

---

## Distribution Merging

From `SuburbsDistributions.lua`:

### MergeDistributionRecursive

```lua
function MergeDistributionRecursive(_orig, _mod)
    for k,v in pairs(_mod) do
        if _orig[k]~=nil then
            if type(_mod[k])=="table" then
                if type(k)=="string" and k=="items" then
                    -- Merge items arrays
                    for _,v2 in ipairs(_mod[k]) do
                        table.insert(_orig[k], v2)
                    end
                else
                    MergeDistributionRecursive(_orig[k], _mod[k])
                end
            end
        else
            _orig[k] = _mod[k]
        end
    end
end
```

**Usage:**
```lua
-- Merge your mod's distributions into vanilla
MergeDistributionRecursive(SuburbsDistributions.bedroom, MyModDistributions.bedroom)
```

### Utility Functions

| Function | Description |
|----------|-------------|
| `MergeDistributionRecursive(orig, mod)` | Merge mod tables into original |
| `RemoveItemFromDistribution(distName, itemName)` | Remove item from distribution |
| `ReplaceItemInDistribution(distName, oldItem, newItem)` | Replace item in distribution |
| `AddItemToDistribution(distName, container, item, weight)` | Add item to distribution |

---

## Modding Loot Distributions

### Adding Items to Existing Containers

```lua
require "Items/SuburbsDistributions"

-- Method 1: Direct addition
table.insert(SuburbsDistributions.kitchen.counter.items, "MyModItem")
table.insert(SuburbsDistributions.kitchen.counter.items, 10)

-- Method 2: Using merge function
local MyDistribution = {
    kitchen = {
        counter = {
            items = {
                "MyModItem", 10,
                "MyModItem2", 5,
            }
        }
    }
}
MergeDistributionRecursive(SuburbsDistributions, MyDistribution)
```

### Creating New Room Types

```lua
SuburbsDistributions.mymodroom = {
    counter = {
        rolls = 4,
        items = {
            "MyModItem", 10,
        }
    },
    shelves = {
        procedural = true,
        procList = {
            {name = "MyModShelf", min = 0, max = 99},
        }
    },
}
```

### Creating New Procedural Distributions

```lua
ProceduralDistributions.list.MyModShelf = {
    rolls = 3,
    items = {
        "MyModItem1", 10,
        "MyModItem2", 8,
        "MyModItem3", 4,
    },
    junk = {
        rolls = 1,
        items = {
            "Newspaper", 4,
        }
    }
}
```

---

## Time-Based Distributions

### Using min/max Days

```lua
procList = {
    {name = "EarlyGameLoot", min = 0, max = 30},   -- First month only
    {name = "MidGameLoot", min = 30, max = 90},    -- Day 30-90
    {name = "LateGameLoot", min = 90, max = 99},   -- After day 90
}
```

---

## Zone-Specific Distributions

### forceForZones Property

```lua
SuburbsDistributions.warehouse.crate = {
    forceForZones = "Industrial",
    procedural = true,
    procList = {
        {name = "WarehouseTools", min = 0, max = 99},
    }
}
```

### Zone Types

| Zone | Description |
|------|-------------|
| Commercial | Shops and businesses |
| Industrial | Factories and warehouses |
| Residential | Homes and apartments |
| Farm | Rural farming areas |
| Forest | Wilderness areas |
| Town | Town centers |
| TrailerPark | Trailer parks |

---

## Vehicle Distributions

Vehicle containers use similar structure:

```lua
VehicleDistributions = {
    TrunkFront = { ... },
    TrunkBack = { ... },
    GloveBox = { ... },
    SeatFrontLeft = { ... },
    SeatFrontRight = { ... },
    SeatRearLeft = { ... },
    SeatRearRight = { ... },
}
```

### Vehicle-Specific Distributions

| Container | Description |
|-----------|-------------|
| `TrunkFront` | Front trunk (some vehicles) |
| `TrunkBack` | Rear trunk |
| `GloveBox` | Glove compartment |
| `SeatFrontLeft` | Driver seat |
| `SeatFrontRight` | Passenger seat |
| `SeatRearLeft` | Rear left seat |
| `SeatRearRight` | Rear right seat |

---

## Debugging Distributions

### Console Commands

```lua
-- Print all items in a distribution
for i = 1, #SuburbsDistributions.kitchen.counter.items, 2 do
    local item = SuburbsDistributions.kitchen.counter.items[i]
    local weight = SuburbsDistributions.kitchen.counter.items[i+1]
    print(item .. ": " .. weight)
end
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Items not spawning | Check weight is > 0, item name is correct |
| Too many items | Reduce `rolls` or individual weights |
| Wrong container | Verify room type matches building |
| Procedural not working | Ensure `procedural = true` is set |

---

## File Load Order

1. `ProceduralDistributions.lua` - Base procedural lists
2. `Distributions.lua` - Room definitions
3. `SuburbsDistributions.lua` - Merging utilities and aliases
4. Mod distributions - Via `MergeDistributionRecursive`

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Table structure | Complete |
| Room types | Complete |
| Container types | Complete |
| Procedural distributions | Complete |
| Weight system | Complete |
| Merging utilities | Complete |
| Modding examples | Complete |
| Vehicle distributions | Basic |

---

## Related Systems

- **Items System** - Item definitions in scripts/*.txt
- **Container System** - Container definitions in tilesets
- **Zone System** - Zone definitions in maps/
- **Building System** - Building room definitions

