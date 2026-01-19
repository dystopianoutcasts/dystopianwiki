# Sandbox Options System Documentation

**Location:** `media/lua/shared/Sandbox/*.lua`, `media/lua/client/OptionScreens/ServerSettingsScreen.lua`
**Purpose:** Define game world settings, difficulty, zombie behavior, and loot configuration

---

## Overview

Sandbox options control virtually every aspect of gameplay in Project Zomboid. They're organized into preset files that define complete game experiences, from the default "Survival" mode to easier "Beginner" or harder "Apocalypse" modes.

---

## Preset Files

Located in `media/lua/shared/Sandbox/`:

| Preset | File | Difficulty | Key Differences |
|--------|------|------------|-----------------|
| Survival | `Survival.lua` | Medium | Default balanced experience |
| Apocalypse | `Apocalypse.lua` | Hard | More zombies (4 vs 3), same loot |
| Survivor | `Survivor.lua` | Hard+ | Challenging but fair |
| Builder | `Builder.lua` | Easy | 0.2x zombies, no drag-down, easier combat |
| Beginner | `Beginner.lua` | Very Easy | Slow zombies, abundant loot, long utilities |
| Six Months Later | `SixMonthsLater.lua` | Medium | Post-apocalypse start |
| First Week | `FirstWeek.lua` | Variable | Early outbreak scenario |

---

## Option Categories

### Population Options

| Option | Type | Values | Default (Survival) |
|--------|------|--------|-------------------|
| `Zombies` | enum | 1=Insane, 2=Very High, 3=High, 4=Normal, 5=Low, 6=None | 3 (High) |
| `Distribution` | enum | 1=Urban Focused, 2=Uniform | 1 |

### Time Options

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `DayLength` | enum | 1=15min, 2=30min, 3=1hr, 4=2hr, 5=3hr, 6=4hr... | 3 (1hr) |
| `StartYear` | enum | 1-based from 1993 | 1 (1993) |
| `StartMonth` | enum | 1-12 | 7 (July) |
| `StartDay` | enum | 1-28/30/31 | 9 |
| `StartTime` | enum | 1=7am, 2=9am, 3=12pm, 4=2pm, 5=5pm, 6=9pm, 7=12am, 8=2am, 9=5am | 2 (9am) |

### World Options

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `WaterShut` | enum | 1=Instant, 2=0-30 days, 3=0-2 months... 8=Never | 2 |
| `ElecShut` | enum | Same as WaterShut | 2 |
| `WaterShutModifier` | int | Days until shutoff | 14 |
| `ElecShutModifier` | int | Days until shutoff | 14 |
| `Alarm` | enum | 1=Never, 2=Rare, 3=Uncommon, 4=Normal, 5=Common, 6=Always | 4 |
| `LockedHouses` | enum | 1=Never, 2=Rare... 6=Normal | 6 |
| `FoodRotSpeed` | enum | 1=Very Fast... 4=Slow, 5=Very Slow | 3 (Normal) |
| `FridgeFactor` | enum | 1=Very Low... 5=Very High | 3 |
| `LootRespawn` | enum | 1=None, 2=Every Day... 5=Every Month | 1 |
| `TimeSinceApo` | enum | 1=0 days, 2=1-7 days, 3=8-14 days... | 1 |
| `NightDarkness` | enum | 1=Pitch Black, 2=Very Dark, 3=Dark, 4=Normal | 3 |
| `FireSpread` | bool | | true |
| `AllowExteriorGenerator` | bool | | true |
| `FuelStationGas` | enum | 1=Empty, 2=Super Low... 8=Infinite | 5 |

### Nature Options

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `Temperature` | enum | 1=Very Cold... 5=Very Hot | 3 |
| `Rain` | enum | 1=Very Dry... 5=Very Rainy | 3 |
| `ErosionSpeed` | enum | 1=Very Fast... 5=Very Slow | 3 |
| `ErosionDays` | int | Days before erosion (0=instant) | 0 |
| `Farming` | enum | 1=Very Fast... 5=Very Slow | 3 |
| `PlantResilience` | enum | 1=Very Low... 5=Very High | 3 |
| `PlantAbundance` | enum | 1=Very Poor... 5=Very Abundant | 3 |
| `NatureAbundance` | enum | 1=Very Poor... 5=Very Abundant | 3 |
| `CompostTime` | enum | 1=1 Week... 4=8 Weeks | 2 (2 Weeks) |
| `MaxFogIntensity` | enum | 1=Normal, 2=Moderate | 1 |
| `MaxRainFxIntensity` | enum | 1=Normal, 2=Moderate | 1 |
| `EnableSnowOnGround` | bool | | true |

### Sadistic AI Director

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `Helicopter` | enum | 1=Never, 2=Once, 3=Sometimes | 2 (Once) |
| `MetaEvent` | enum | 1=Never, 2=Sometimes, 3=Often | 2 |
| `SleepingEvent` | enum | 1=Never, 2=Sometimes, 3=Often | 1 (Never) |

### Meta/Story Options

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `GeneratorSpawning` | enum | 1=None... 5=Very Common | 3 |
| `GeneratorFuelConsumption` | float | Multiplier | 1.0 |
| `SurvivorHouseChance` | enum | 1=Never... 5=Common | 3 |
| `VehicleStoryChance` | enum | 1=Never... 5=Common | 3 |
| `ZoneStoryChance` | enum | 1=Never... 5=Common | 3 |
| `AnnotatedMapChance` | enum | 1=Never... 5=Common | 4 |
| `HoursForCorpseRemoval` | float | Hours (0=never) | 216.0 |
| `DecayingCorpseHealthImpact` | enum | 1=None... 4=High | 3 |
| `BloodLevel` | enum | 1=None... 5=Extreme | 3 |
| `MaggotSpawn` | enum | | 1 |

### Loot Rarity

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `FoodLoot` | enum | 1=None, 2=Insanely Rare... 7=Abundant | 4 (Rare) |
| `CannedFoodLoot` | enum | Same | 4 |
| `WeaponLoot` | enum | Same | 4 |
| `RangedWeaponLoot` | enum | Same | 4 |
| `AmmoLoot` | enum | Same | 4 |
| `MedicalLoot` | enum | Same | 4 |
| `SurvivalGearsLoot` | enum | Same | 4 |
| `MechanicsLoot` | enum | Same | 4 |
| `LiteratureLoot` | enum | Same | 4 |
| `OtherLoot` | enum | Same | 4 |

### Character Options

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `XpMultiplier` | float | 0.001-1000.0 | 1.0 |
| `StatsDecrease` | enum | 1=Very Fast... 5=Very Slow | 3 |
| `EndRegen` | enum | 1=Very Fast... 5=Very Slow | 3 |
| `Nutrition` | bool | Enable nutrition system | true |
| `StarterKit` | bool | Start with basic supplies | false |
| `CharacterFreePoints` | int | Extra trait points | 0 |
| `ConstructionBonusPoints` | enum | 1-5 | 3 |
| `InjurySeverity` | enum | 1=Low, 2=Normal, 3=High | 2 |
| `BoneFracture` | bool | | true |
| `ClothingDegradation` | enum | 1=Disabled... 5=Fastest | 3 |
| `RearVulnerability` | enum | 1=Low, 2=Medium, 3=High | 3 |
| `MultiHitZombies` | bool | Attack multiple zombies | false |
| `AttackBlockMovements` | bool | | true |
| `AllClothesUnlocked` | bool | | false |
| `EnablePoisoning` | enum | | 1 |

### Map Options

| Option | Type | Default |
|--------|------|---------|
| `Map.AllowMiniMap` | bool | false |
| `Map.AllowWorldMap` | bool | true |
| `Map.MapAllKnown` | bool | false |

### Vehicle Options

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `EnableVehicles` | bool | | true |
| `VehicleEasyUse` | bool | No keys required | false |
| `ZombieAttractionMultiplier` | float | Sound attraction | 1.0 |
| `CarSpawnRate` | enum | 1=Very Low... 5=Very High | 3 |
| `ChanceHasGas` | enum | 1=Very Low... 5=Very High | 1 |
| `InitialGas` | enum | 1=Very Low... 5=Full | 2 |
| `CarGasConsumption` | float | Fuel usage multiplier | 1.0 |
| `LockedCar` | enum | 1=Never... 5=Very Often | 3 |
| `CarGeneralCondition` | enum | 1=Very Bad... 5=Like New | 2 |
| `TrafficJam` | bool | Spawn traffic jams | true |
| `CarAlarm` | enum | 1=Never... 5=Very Often | 2 |
| `PlayerDamageFromCrash` | bool | | true |
| `CarDamageOnImpact` | enum | | 3 |
| `SirenShutoffHours` | float | 0=never | 0.0 |
| `RecentlySurvivorVehicles` | enum | 1=Never... 5=Common | 2 |
| `DamageToPlayerFromHitByACar` | enum | | 1 |

---

## Zombie Lore Options

### ZombieLore Table

| Option | Type | Values | Default |
|--------|------|--------|---------|
| `Speed` | enum | 1=Sprinters, 2=Fast Shamblers, 3=Shamblers, 4=Random | 2 |
| `Strength` | enum | 1=Superhuman, 2=Normal, 3=Weak, 4=Random | 2 |
| `Toughness` | enum | 1=Tough, 2=Normal, 3=Fragile, 4=Random | 2 |
| `Transmission` | enum | 1=Blood+Saliva, 2=Saliva Only, 3=Everyone Infected, 4=None | 1 |
| `Mortality` | enum | 1=Instant, 2=0-30s, 3=0-1min, 4=0-12hrs, 5=2-3days, 6=1-2weeks, 7=Never | 5 |
| `Reanimate` | enum | 1=Instant, 2=0-30s, 3=0-1min, 4=0-12hrs, 5=2-3days, 6=1-2weeks | 3 |
| `Cognition` | enum | 1=Navigate+Use Doors, 2=Navigate, 3=Basic Navigation, 4=Random | 3 |
| `CrawlUnderVehicle` | enum | 1=Crawlers Only, 2=Extremely Rare... 5=Often | 5 |
| `Memory` | enum | 1=Long, 2=Normal, 3=Short, 4=None, 5=Random | 2 |
| `Sight` | enum | 1=Eagle, 2=Normal, 3=Poor, 4=Random | 2 |
| `Hearing` | enum | 1=Pinpoint, 2=Normal, 3=Poor, 4=Random | 2 |
| `ThumpNoChasing` | bool | Only thump when not chasing | false |
| `ThumpOnConstruction` | bool | Thump player constructions | true |
| `ActiveOnly` | enum | 1=Day, 2=Both, 3=Night, 4=Night/Day Slow | 1 |
| `TriggerHouseAlarm` | bool | | false |
| `ZombiesDragDown` | bool | Drag players to ground | true |
| `ZombiesFenceLunge` | bool | Lunge over fences | true |
| `DisableFakeDead` | enum | 1=Some, 2=Rare, 3=None | 1 |

---

## Advanced Zombie Population

### ZombieConfig Table

| Option | Type | Range | Default |
|--------|------|-------|---------|
| `PopulationMultiplier` | float | 0.0-4.0 | 1.0 |
| `PopulationStartMultiplier` | float | 0.0-4.0 | 1.0 |
| `PopulationPeakMultiplier` | float | 0.0-4.0 | 1.5 |
| `PopulationPeakDay` | int | 1-365 | 28 |
| `RespawnHours` | float | 0.0-8760.0 | 72.0 |
| `RespawnUnseenHours` | float | 0.0-8760.0 | 16.0 |
| `RespawnMultiplier` | float | 0.0-1.0 | 0.1 |
| `RedistributeHours` | float | 0.0-8760.0 | 12.0 |
| `FollowSoundDistance` | int | 10-1000 | 100 |
| `RallyGroupSize` | int | 5-1000 | 20 |
| `RallyTravelDistance` | int | 5-50 | 20 |
| `RallyGroupSeparation` | int | 5-25 | 15 |
| `RallyGroupRadius` | int | 1-10 | 3 |

---

## Preset Comparison

| Setting | Beginner | Builder | Survival | Apocalypse |
|---------|----------|---------|----------|------------|
| **Zombies** | Low (5) | Low (5) | High (3) | Normal (4) |
| **ZombiePopMult** | 0.5 | 0.2 | 1.0 | 1.0 |
| **ZombieSpeed** | Shamblers (3) | Shamblers (2) | Fast (2) | Fast (2) |
| **ZombieDragDown** | Yes | No | Yes | Yes |
| **FoodLoot** | Abundant (7) | Rare (4) | Rare (4) | Rare (4) |
| **XpMultiplier** | 2.0 | 1.0 | 1.0 | 1.0 |
| **WaterShut** | Never (8) | Normal (2) | Normal (2) | Normal (2) |
| **StarterKit** | Yes | Yes | No | No |
| **MultiHitZombies** | No | Yes | No | No |

---

## Accessing Options in Lua

### Reading Sandbox Options

```lua
-- Get sandbox options object
local options = getSandboxOptions()

-- Get specific option value
local zombieSpeed = SandboxVars.ZombieLore.Speed
local xpMult = SandboxVars.XpMultiplier
local waterShut = SandboxVars.WaterShut

-- Check map options
local miniMapAllowed = SandboxVars.Map.AllowMiniMap

-- Check zombie population
local popMult = SandboxVars.ZombieConfig.PopulationMultiplier
```

### Option API Methods

```lua
-- Get option by name
local option = getSandboxOptions():getOptionByName("Zombies")

-- Get option properties
option:getName()           -- Option ID
option:getTranslatedName() -- Display name
option:getTooltip()        -- Description
option:getType()           -- "boolean", "double", "enum", "integer", "string"
option:getValue()          -- Current value
option:getDefaultValue()   -- Default value
option:isValidString(str)  -- Validate string input

-- Enum options
option:getNumValues()                    -- Number of enum values
option:getValueTranslationByIndex(i)     -- Get translated enum label
```

### Iterating All Options

```lua
local options = getSandboxOptions()
for i = 0, options:getNumOptions() - 1 do
    local option = options:getOptionByIndex(i)
    print(option:getName(), option:getValue())
end
```

---

## Modding Sandbox Options

### Adding Custom Options

Custom sandbox options are defined in Java and registered via mod initialization. Options can specify:
- Page name (category tab)
- Translated name and tooltip
- Type (boolean, integer, float, enum, string)
- Default value
- Valid range

```lua
-- Check if custom option exists
local option = getSandboxOptions():getOptionByName("MyMod.MyOption")
if option and option:isCustom() then
    local value = option:getValue()
end
```

### Creating a Custom Preset

Create a new Lua file in `media/lua/shared/Sandbox/`:

```lua
-- MyPreset.lua
return {
    VERSION = 5,
    Zombies = 2,           -- Very High
    Distribution = 1,
    DayLength = 4,         -- 2 hours
    -- ... all other options
    ZombieLore = {
        Speed = 1,         -- Sprinters!
        Strength = 1,      -- Superhuman
        -- ...
    },
    ZombieConfig = {
        PopulationMultiplier = 2.0,
        -- ...
    },
}
```

---

## Server vs Sandbox Settings

**Server Settings (`servertest.ini`):**
- Network configuration (ports, passwords)
- Player limits and permissions
- PVP rules
- Safehouse settings
- Chat/voice settings

**Sandbox Settings:**
- World generation rules
- Zombie behavior
- Loot availability
- Player progression
- Vehicle spawning

Server admins can modify sandbox settings through:
1. Admin panel in-game
2. `servertest_SandboxVars.lua` file
3. Server settings UI

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Preset files | Complete |
| Population options | Complete |
| Time/world options | Complete |
| Zombie lore | Complete |
| Advanced zombie config | Complete |
| Loot options | Complete |
| Vehicle options | Complete |
| Lua API access | Complete |
| Modding examples | Complete |

---

## Related Systems

- **loot-distribution.md** - How loot rarity affects spawns
- **zombie-spawning.md** - Zone-based zombie outfits
- **professions-traits.md** - Character free points option
- **maps-system.md** - Map options
