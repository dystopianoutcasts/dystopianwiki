# Zombie Spawning & Outfit System Documentation

**Location:** `media/lua/shared/NPCs/ZombiesZoneDefinition.lua`, `media/lua/shared/Definitions/HairOutfitDefinitions.lua`
**Purpose:** Define zombie outfits by zone type and hair/beard restrictions

---

## Overview

Project Zomboid uses a zone-based system to spawn zombies with appropriate outfits for their location. A zombie in a hospital wears doctor/nurse outfits, while one at a gas station wears Fossoil uniforms. This creates environmental storytelling and visual variety.

---

## Zone Definition Structure

```lua
ZombiesZoneDefinition.ZoneName = {
    -- Optional global settings
    chanceToSpawn = 50,      -- % chance this zone spawns at all
    toSpawn = 1,             -- Max instances of this zone type
    maleChance = 80,         -- Force male zombies (default 50)

    -- Outfit definitions
    OutfitName = {
        name = "OutfitID",       -- Outfit from clothing.xml
        chance = 15,             -- % of non-mandatory zombies
        toSpawn = 1,             -- Exact number to spawn
        mandatory = "true",      -- Must spawn this outfit
        gender = "male",         -- Force gender ("male"/"female")
        room = "kitchen",        -- Only in specific room type
        beardStyles = "Long:15;Goatee:10",  -- Beard probabilities
        maleHairStyles = "Mullet:30",       -- Male hair probabilities
        femaleHairStyles = "Bob:20",        -- Female hair probabilities
    },
}
```

---

## Key Properties

### Zone-Level Properties

| Property | Type | Description |
|----------|------|-------------|
| `chanceToSpawn` | int | Percentage chance zone spawns (0-100) |
| `toSpawn` | int | Maximum instances per map |
| `maleChance` | int | Override male zombie percentage |

### Outfit-Level Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Outfit ID from clothing.xml |
| `chance` | int | % of zombies with this outfit |
| `toSpawn` | int | Exact number to spawn |
| `mandatory` | string | "true" = must spawn at least one |
| `gender` | string | "male" or "female" |
| `room` | string | Room type restriction (semicolon-separated) |
| `beardStyles` | string | Beard style:chance pairs |
| `maleHairStyles` | string | Male haircut:chance pairs |
| `femaleHairStyles` | string | Female haircut:chance pairs |

---

## Zone Types

### Special Event Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Wedding` | Church weddings | WeddingDress, Groom, Priest, Classy |
| `Boxing` | Boxing matches | BoxingRed, BoxingBlue, Classy |

### Restaurant/Food Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Spiffo` | Spiffo's restaurant | Spiffo (1%), Waiter_Spiffo, Cook_Spiffos |
| `PizzaWhirled` | Pizza restaurant | Waiter_PizzaWhirled, Cook_Generic |
| `Dinner` | Diners | Waiter_Diner, Cook_Generic |
| `PileOCrepe` | Crepe restaurant | Waiter_PileOCrepe, Chef |
| `Coffeeshop` | Coffee shops | Waiter_Restaurant, Chef |
| `SeaHorse` | Seafood restaurant | Waiter_Restaurant, Chef |
| `Restaurant` | Generic restaurant | Waiter_Restaurant, Chef |
| `Gigamart` | Grocery store | GigaMart_Employee, Cook_Generic |
| `VariousFoodMarket` | Food markets | Waiter_Market |
| `Bakery` | Bakeries | (Not defined - uses default) |

### Retail/Commercial Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Pharmacist` | Pharmacies | Pharmacist (30%) |
| `FarmingStore` | Farming supply | Waiter_Market, Farmer |
| `McCoys` | Hardware store | McCoys (50%), Foreman, OfficeWorker |
| `Bowling` | Bowling alleys | Bowling (90%) |

### Gas Station Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Fossoil` | Fossoil stations | Fossoil (15%) |
| `Gas2Go` | Gas2Go stations | Gas2Go (15%) |
| `ThunderGas` | ThunderGas stations | ThunderGas (15%) |

### Industrial Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Factory` | Factories | ConstructionWorker, Foreman, Mechanic, MetalWorker |
| `ConstructionSite` | Construction | ConstructionWorker (60%), Foreman (20%) |
| `CarRepair` | Mechanic shops | Mechanic (15%), MetalWorker (15%) |

### Office Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Offices` | Office buildings | OfficeWorker, OfficeWorkerSkirt, Trader |
| `Bank` | Banks | OfficeWorker, OfficeWorkerSkirt, Trader |

### Emergency Services

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Police` | Police stations | Police (40%), OfficeWorker |
| `PoliceState` | State police | PoliceState (40%), OfficeWorker |
| `FireDept` | Fire stations | Fireman (80%) |
| `Doctor` | Medical facilities | Doctor, Nurse (15%) |

### Military Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Army` | Military bases | ArmyInstructor, Ghillie (2%), ArmyCamoDesert, ArmyCamoGreen |
| `SecretBase` | Secret facilities | ArmyInstructor, ArmyCamoGreen, Doctor, OfficeWorker |

### Prison System

| Zone | Description | Special Rules |
|------|-------------|---------------|
| `Prison` | Prisons | 80% male, Inmate in cells, Guards in security |

**Prison Room-Specific:**
- `prisoncells;hall;cafeteria;classroom;laundry;janitor` → Inmate (76%)
- `bathroom;kitchen;medicalstorage;library` → Inmate (30%)
- `bathroom` → Naked (50%)
- `kitchen` → Cook_Generic (30%)
- `security` → PrisonGuard (100%)
- `office` → OfficeWorker (30%)
- `medicalstorage` → Doctor (20%), Nurse (30%)

### Education Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `School` | Schools | Student (50%), Teacher (15%), Young, ShellSuit variants |

### Sports/Recreation

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `Athletic` | Gyms | FitnessInstructor (70%) |
| `StreetSports` | Street sports | StreetSports (80%) |
| `Baseball` | Baseball fields | BaseballPlayer_KY/Z/Rangers |
| `BaseballFan` | Stadiums | BaseballFan variants |
| `Golf` | Golf courses | Golfer (40%), Tourist, Waiter_Restaurant |
| `SwimmingPool` | Pools | Swimmer (100%) |
| `Pony` | Race tracks | Jockey01-06 |

### Hospitality Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `FancyHotel` | Luxury hotels | Tourist (40%), Bathrobe, Swimmer, Waiter_Restaurant |
| `HotelRich` | Rich hotels | Tourist, Golfer, Classy |
| `CountryClub` | Country clubs | Golfer, Classy, FitnessInstructor (gym room) |
| `Spa` | Spas | Bathrobe (30%), Swimmer, Tourist |

### Residential Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `TrailerPark` | Trailer parks | Redneck (65%), Veteran (10%), Thug (15%) |
| `Rich` | Wealthy areas | Classy (40%), Tourist, Golfer |
| `Farm` | Farms | Farmer (80%) |
| `Survivalist` | Survivalist camps | Survivalist (10%), Hunter (10%) |

### Street Zones

| Zone | Description | Key Outfits |
|------|-------------|-------------|
| `StreetPoor` | Poor areas | Hobbo (15%), Punk (15%), Biker (15%), Bandit (5%) |
| `Shelter` | Homeless shelters | Hobbo (50%), Punk (20%) |
| `Beach` | Beaches | Swimmer (70%), Tourist (30%) |
| `Bar` | Bars | Biker (30%), Veteran (10%), Redneck (50%) |
| `Rocker` | Music venues | Punk (40%), Student (10%) |

---

## Default Zone

The `Default` zone provides fallback outfits for areas without specific definitions:

```lua
ZombiesZoneDefinition.Default = {
    {name = "Generic01", chance=20},
    {name = "Generic02", chance=20},
    {name = "Generic03", chance=20},
    {name = "Generic_Skirt", gender="female", chance=20},
    {name = "Generic04", chance=20},
    {name = "Generic05", chance=20},
    {name = "Biker", chance=0.3},
    {name = "Cyclist", chance=0.5},
    {name = "DressLong", chance=3, gender="female"},
    {name = "Police", chance=0.5},
    {name = "PoliceState", chance=0.5},
    {name = "Ranger", chance=1},
    {name = "ConstructionWorker", chance=0.5, gender="male"},
    -- Room-specific defaults
    {name = "Bathrobe", chance=10, room="bathroom"},
    {name = "Naked", chance=10, room="bathroom"},
    {name = "Priest", chance=10, room="church", gender="male"},
    {name = "Bedroom", chance=10, room="bedroom"},
}
```

---

## Hair/Beard System

### Hair Restriction Properties

```lua
HairOutfitDefinitions.haircutDefinition = {
    {
        name = "MohawkShort",
        onlyFor = "Punk,Bandit,Redneck,Biker,PrivateMilitia",
    },
    {
        name = "LibertySpikes",
        minWorldAge = 180,  -- Only after day 180
        onlyFor = "Punk,Bandit",
    },
}
```

### Outfit-Specific Hair

```lua
HairOutfitDefinitions.haircutOutfitDefinition = {
    {
        outfit = "Punk",
        haircut = "LibertySpikes:5;MohawkFan:7;MohawkShort:7",
        haircutColor = "0.98,0.87,0:10;0.82,0.15,0.07:10",  -- Crazy colors
    },
    {
        outfit = "PrivateMilitia",
        beard = "Long:30;Goatee:10;Full:10;LongScruffy:20",
        haircut = "MohawkShort:5",
    },
}
```

### Hair/Beard Format

Style probabilities use `StyleName:Chance;StyleName:Chance` format:

```lua
beardStyles = "Long:15;Chops:13;Goatee:13;Moustache:13"
-- Long beard: 15% chance
-- Chops: 13% chance
-- Remaining: random or clean-shaven
```

Special values:
- `null:80` = 80% chance of no beard/specific hair

---

## Spawn Regions System

### SpawnRegions.lua

Handles player spawn point loading:

```lua
SpawnRegionMgr.loadSpawnRegionsFile(filename, server)
SpawnRegionMgr.loadSpawnPointsFile(filename, server)
SpawnRegionMgr.getSpawnRegions()
```

Files loaded from:
- `media/maps/[MAPNAME]/spawnregions.lua`
- `media/maps/[MAPNAME]/spawnpoints.lua`
- Server-specific: `[ServerName]_spawnregions.lua`

### Events

```lua
triggerEvent("OnSpawnRegionsLoaded", regions)
```

---

## Modding Zombie Zones

### Adding New Zone

```lua
ZombiesZoneDefinition.MyModZone = {
    chanceToSpawn = 100,

    -- Mandatory outfit
    MyModWorkerM = {
        name = "MyModWorker",
        toSpawn = 1,
        mandatory = "true",
    },

    -- Random chance outfit
    MyModWorker = {
        name = "MyModWorker",
        chance = 40,
    },

    -- Room-specific
    MyModManager = {
        name = "MyModManager",
        chance = 50,
        room = "office",
    },
}
```

### Modifying Existing Zone

```lua
-- Add outfit to existing zone
ZombiesZoneDefinition.Factory.MyModWorker = {
    name = "MyModWorker",
    chance = 10,
    gender = "male",
}
```

### Creating Custom Outfit

1. Define outfit in `clothing.xml`:
```xml
<m_MaleOutfits>
    <m_Name>MyModWorker</m_Name>
    <m_Top>Shirt_Work</m_Top>
    <m_Bottom>Trousers_Work</m_Bottom>
    <m_Shoes>Shoes_Work</m_Shoes>
</m_MaleOutfits>
```

2. Reference in zone definition:
```lua
ZombiesZoneDefinition.MyZone = {
    MyModWorker = {
        name = "MyModWorker",
        chance = 50,
    },
}
```

---

## Room Type Reference

Common room types for zone restrictions:

| Room Type | Description |
|-----------|-------------|
| `bathroom` | Bathrooms |
| `bedroom` | Bedrooms |
| `kitchen` | Kitchens |
| `office` | Offices |
| `church` | Churches |
| `gym` | Gyms |
| `ballroom` | Ballrooms |
| `prisoncells` | Prison cells |
| `security` | Security rooms |
| `medicalstorage` | Medical storage |
| `cafeteria` | Cafeterias |
| `laundry` | Laundry rooms |
| `library` | Libraries |
| `restaurantkitchen` | Restaurant kitchens |
| `spiffoskitchen` | Spiffo's kitchens |
| `gigamartkitchen` | Gigamart kitchens |

Multiple rooms: `room = "kitchen;cafeteria;dining"`

---

## Zombie Population Events

### Lua Events

```lua
Events.OnSpawnRegionsLoaded.Add(function(regions)
    -- Modify spawn regions
end)
```

### Related Java Methods

```lua
-- Get zones at position
local zones = getWorld():getMetaGrid():getZonesAt(x, y, z)

-- Zone properties
zone:getType()  -- Zone type string
zone:getName()  -- Zone name
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Zone definitions | Complete |
| Outfit properties | Complete |
| Hair/beard system | Complete |
| Room restrictions | Complete |
| Default fallbacks | Complete |
| Spawn regions | Basic |
| Modding examples | Complete |

---

## Related Systems

- **clothing.xml** - Outfit definitions (see clothing-system.md)
- **maps-system.md** - Zone placement in WorldEd
- **SpawnPoints** - Player spawn locations by profession

