---
id: build-42-vehicle-spawn-zones
slug: vehicle-spawn-zones
title: Vehicle spawn zones
game: pz
version: build-42
section: mapping
category: zones-and-packaging
difficulty: intermediate
tags:
  - zones
  - objects-lua
  - spawn-points
  - loot-distribution
excerpt: 'For a map to spawn vehicles properly, the object zone must be:'
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - objects-lua-the-zone-export
  - zombie-type-outfit-zones
  - farm-and-wildlife-animals
  - loot-room-definitions-and-custom-distributions
  - spawn-points
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# Vehicle spawn zones `[COMMUNITY -- BlackshotGER, B42.15, plus VERIFIED file facts]`

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### Zone geometry requirement `[VERIFIED -- PZwiki]`

For a map to spawn vehicles properly, the object zone must be:

- of type **`ParkingStall`**, and
- a **multiple of 4x3** -- 8x6, 4x6, 12x3, and so on.

An off-size zone is the usual reason a parking lot stays empty.

### The vanilla zone names

| Name | Purpose |
|---|---|
| `parkingstall` | Common random cars -- the default and most used |
| `trailerpark` | Burnt cars, some stacked; a pile of junk cars |
| `bad` | Poor areas, around pubs |
| `medium` | Nicer areas, suburbs |
| `good` | Good-looking areas -- only good cars |
| `sport` | Sports vehicles, occasional in good areas |
| `junkyard` | Damaged and burnt, fewer keys but more cars; also random car crashes |
| `trafficjamw` / `trafficjame` / `trafficjams` | Traffic jams by cardinal direction; mostly burnt and damaged |
| `police` | Police department |
| `fire` | Fire department |
| `ranger` | Ranger police |
| `mccoy` | McCoy Lumber |
| `postal` | Mail |
| `spiffo` | Spiffo branded |
| `ambulance` | Ambulance |
| `radio` | Local radio station |
| `fossoil` | Fossoil branded |
| `normalburnt` / `specialburnt` | Burnt-car source pools -- 80% normal, 20% special |

### Vanilla reference

`media/lua/shared/VehicleZoneDefinition.lua` -- confirmed present in B42 stable.
Zone types are keys on `VehicleZoneDistribution`:

```lua
VehicleZoneDistribution.parkingstall = {};
VehicleZoneDistribution.parkingstall.vehicles = {};
VehicleZoneDistribution.parkingstall.vehicles["Base.CarNormal"] = {index = -1, spawnChance = 20};
VehicleZoneDistribution.parkingstall.vehicles["Base.SmallCar"]  = {index = -1, spawnChance = 15};
VehicleZoneDistribution.parkingstall.chanceToPartDamage = 20;
VehicleZoneDistribution.parkingstall.baseVehicleQuality = 0.7;
```

### Custom file

Create `.../media/lua/shared/MyModVehicleZoneDefinition.lua` in your mod and
define new zones or adjust vanilla ones there.

### The tunables (verbatim from the vanilla file header) `[VERIFIED]`

| Key | Meaning | Default |
|---|---|---|
| `index` | Skin index from the vehicle template; `-1` = random from the skin list | -- |
| `spawnChance` | Odds of this car vs others; a zone's total should be 100 | -- |
| `chanceToPartDamage` | Chance of a damaged part, added to the part item's own damaged-spawn chance | 0 |
| `baseVehicleQuality` | Max condition of a part that spawns damaged (0.7 = 70%) | 1.0 |
| `chanceToSpawnSpecial` | Chance of a special car (any type with `specialCar = true`) | 5 |
| `chanceToSpawnBurnt` | Chance of a burnt car (80% normalburnt / 20% specialburnt) | 0 |
| `chanceToSpawnNormal` | Chance of a normal car (picked from `parkingstall`), so themed lots aren't all themed | 80 |
| `spawnRate` | Base chance of adding a vehicle in a zone | 16 |
| `chanceOfOverCar` | Chance to spawn another car on top (used in trailerpark) | 0 |
| `randomAngle` | Random angle instead of grid-aligned | false |
| `chanceToSpawnKey` | Chance to spawn a key (ground, car, nearby zombie, container) | 70 |
| `specialCar` | Marks the vehicle as special; its key is not colored | false |

### In WorldEd

Create the zone in the **`ParkingStall`** object group as usual, set `Direction`
and/or `FaceDirection` as needed, and **name the zone after your custom zone
type**. If no type is defined on the zone, `parkingstall` is used.

Per the vanilla header: the *type* you set on the WorldEd zone is the key --
`VehicleZoneDistribution.trailerpark` is used for a `trailerpark` zone type.

Confirmed from the editor screenshot: `ParkingStall` sits in the object-group
tree alongside `ZombiesType`, `RoomTone`, `Mannequin`, `WaterZone`, `WaterFlow`,
`FarmLand`, `Farm`, `TrailerPark`, `Vegitation`, `DeepForest`, `Nav`, `Forest`,
`TownZone`. Zones show their name and properties inline
(`myzone / Direction=N / FaceDirection=true`), and multiple zones can share one
name. Zones exist per level (`Level -1` through `Level -9` and up).

### Writing a custom zone, step by step `[COMMUNITY -- BlackshotGER]`

```lua
-- 1. create the zone and clear all settings
VehicleZoneDistribution.myzone = {};

-- 2. clear the vehicle list
VehicleZoneDistribution.myzone.vehicles = {};

-- 3. optionally seed it from an existing vanilla zone
VehicleZoneDistribution.myzone = VehicleZoneDistribution.parkingstall;

-- 4. or skip 3 and add / modify vehicles individually.
--    original vanilla line, for reference:
VehicleZoneDistribution.parkingstall.vehicles["Base.CarNormal"] = {index = -1, spawnChance = 20};
--    same zone, but CarNormal never spawns:
VehicleZoneDistribution.parkingstall.vehicles["Base.CarNormal"] = {index = -1, spawnChance = 0};

-- 5. add a new vehicle to a list
VehicleZoneDistribution.parkingstall.vehicles["Base.CarLightsPolice"] = {index = 0, spawnChance = 20};
```

Setting `spawnChance = 0` is how you remove a vehicle without rebuilding the list.

### Worked example: how the vanilla `police` zone actually behaves

```lua
VehicleZoneDistribution.police = {};
VehicleZoneDistribution.police.vehicles = {};
VehicleZoneDistribution.police.vehicles["Base.PickUpVanLightsPolice"] = {index = 0, spawnChance = 35};
VehicleZoneDistribution.police.vehicles["Base.CarLightsPolice"]       = {index = 0, spawnChance = 60};
VehicleZoneDistribution.police.vehicles["Base.VanSeats_Prison"]       = {index = 0, spawnChance = 5};
VehicleZoneDistribution.police.chanceToSpawnNormal = 70;
VehicleZoneDistribution.police.specialCar = true;
```

Reading it, with the two defaults that are not written out
(`spawnRate = 16`, `chanceToSpawnSpecial = 5`):

- A vehicle spawns at 16% x the player's sandbox settings.
- When one spawns, **70%** of the time it is a civilian car from `parkingstall`.
- The remaining **30%** is a police vehicle, split 60 / 35 / 5 between sedan,
  pickup van and prison van.
- All three are flagged `specialCar = true`, so they also spawn in other zones
  that use `chanceToSpawnSpecial`.
- A further 5% chance pulls in a random special car from any zone.

Per 100 cars spawned in the zone: ~70 civilian, ~18 sedans, ~10-11 vans,
~1-2 prison vans.

### Worked example: police only

```lua
VehicleZoneDistribution.onlypolice = {};
VehicleZoneDistribution.onlypolice.vehicles = {};
VehicleZoneDistribution.onlypolice.vehicles = VehicleZoneDistribution.police;
VehicleZoneDistribution.onlypolice.vehicles["Base.PickUpVanLightsPolice"] = {index = 0, spawnChance = 0};
VehicleZoneDistribution.onlypolice.vehicles["Base.CarLightsPolice"]       = {index = 0, spawnChance = 20};
VehicleZoneDistribution.onlypolice.vehicles["Base.VanSeats_Prison"]       = {index = 0, spawnChance = 80};
VehicleZoneDistribution.onlypolice.chanceToSpawnNormal = 0;
VehicleZoneDistribution.onlypolice.chanceToSpawnSpecial = 0;
```

`chanceToSpawnNormal = 0` plus `chanceToSpawnSpecial = 0` means every spawned
vehicle comes from this list -- no civilian cars, no special-car bleed. Re-listing
the three vehicles is optional; here it retunes them so the van never spawns, the
sedan is 1-in-5 and the prison van 4-in-5. Good for a gated prison lot.

### Naming and the three useful archetypes

Prefix custom zone names to avoid collisions -- BlackshotGER uses `bm` for
Blackshots Manhattan:

| Zone | Settings | Effect |
|---|---|---|
| `bmmorepolice` | `chanceToSpawnNormal = 30` (default 80), `chanceToSpawnSpecial = 0`, `specialCar = true` | Far fewer civilian cars than vanilla `police` |
| `bmonlypolice` | `chanceToSpawnNormal = 0`, `chanceToSpawnSpecial = 0`, `specialCar = true` | Police only, but still at the player's sandbox spawn rate |
| `bmforcedpolice` | `spawnRate = 100`, `chanceToSpawnNormal = 0`, `chanceToSpawnSpecial = 0` | Overrides sandbox and forces spawns |

Each copies its list from vanilla:
`VehicleZoneDistribution.bmmorepolice.vehicles = VehicleZoneDistribution.police.vehicles;`

**Use `spawnRate = 100` sparingly**, only where it genuinely fits the story. If
the player disables vehicles in sandbox, no cars spawn regardless.

### Caution: inheriting a vanilla list inherits other mods' vehicles

Most vehicle modders append their vehicles to the vanilla lists (`parkingstall`,
`police`). If you seed your zone from a vanilla list, **their vehicles land in
your zone too**. And because `police` is flagged `specialCar = true`, a modded
prison van added there will also surface in parking stalls, traffic jams and
junkyards. List vehicles individually if you need a closed set. `[COMMUNITY]`

### Advanced: sandbox-selectable vehicle skins

The pattern for letting players choose a reskin: build a function that rewrites
the vanilla list, then register it on `OnInitGlobalModData`.

```lua
local function VanillaReskinPolice()
    if SandboxVars.BlackshotsManhattan.VanillaReskinPolice == 2 then
        VehicleZoneDistribution.police.vehicles = {};   -- empty the vanilla table
        VehicleZoneDistribution.police.vehicles["Base.CarNYPD"]           = {index = -1, spawnChance = 60};
        VehicleZoneDistribution.police.vehicles["Base.PickUpVanNYPD"]     = {index = -1, spawnChance = 21};
        VehicleZoneDistribution.police.vehicles["Base.PickUpTruckNYPD"]   = {index = -1, spawnChance = 15};
        VehicleZoneDistribution.police.vehicles["Base.StepVan_SWATNYPD"]  = {index = -1, spawnChance = 2};
        VehicleZoneDistribution.police.vehicles["Base.VanSeats_PrisonNYPD"] = {index = 0, spawnChance = 2};
        -- then re-point the custom zones at the rewritten vanilla list
        VehicleZoneDistribution.bmmorepolice.vehicles = VehicleZoneDistribution.police.vehicles;
        VehicleZoneDistribution.bmonlypolice.vehicles = VehicleZoneDistribution.police.vehicles;
        VehicleZoneDistribution.bmforcedpolice.vehicles = VehicleZoneDistribution.police.vehicles;
    elseif SandboxVars.BlackshotsManhattan.VanillaReskin == 3 then
    end
end

-- MUST be at the very end of the file
Events.OnInitGlobalModData.Add(VanillaReskinPolice)
Events.OnInitGlobalModData.Add(VanillaReskinTaxi)
Events.OnInitGlobalModData.Add(VanillaReskinRanger)
```

`OnInitGlobalModData` is a real vanilla event -- used by `forageClient.lua` and
`ProfessionVehicles.lua`. `[VERIFIED]`

Because this rewrites the **vanilla** `police` list (which is `specialCar = true`),
the reskins propagate to parking stalls, traffic jams and every other zone using
`chanceToSpawnSpecial`.

#### The two supporting files

**`media/sandbox-options.txt`** -- in your mod's `media` folder, at the top level.

```
VERSION = 1,

option BlackshotsManhattan.VanillaReskinPolice
{
    type = enum,
    default = 2,
    numValues = 3,
    page = BlackshotsManhattan,
    translation = BlackshotsManhattan_VanillaReskinPolice,
}
```

`[VERIFIED nuance]` There is **no vanilla `media/sandbox-options.txt`** to copy
from -- vanilla sandbox options are defined Java-side. This is a mod-only file.

**`media/lua/shared/Translate/EN/Sandbox.json`** -- B42 translations are JSON.

```json
{
    "Sandbox_BlackshotsManhattan": "Blackshots Manhattan",

    "Sandbox_BlackshotsManhattan_VanillaReskinPolice": "Police cars",
    "Sandbox_BlackshotsManhattan_VanillaReskinPolice_tooltip": "Changes the police cars (Sedan, Pickup, Van, Prison Van, SWAT Van)",
    "Sandbox_BlackshotsManhattan_VanillaReskinPolice_option1": "Vanilla Skins",
    "Sandbox_BlackshotsManhattan_VanillaReskinPolice_option2": "Modern (white with blue stripe)",
    "Sandbox_BlackshotsManhattan_VanillaReskinPolice_option3": "(WIP) 1993 (blue with white stripe)"
}
```

The `Sandbox_<key>` / `_tooltip` / `_option<N>` key pattern matches vanilla
exactly -- e.g. `Sandbox_ZombieCount`, `Sandbox_ZombieCount_tooltip`,
`Sandbox_ZombieCount_option1`. `[VERIFIED against the installed game]`

### Do not guard global tables with an existence check

`[VERIFIED reasoning -- SimKDT correction, March 2026; consistent with the wiki]`

You will see this in many published vehicle-zone files. **It is wrong:**

```lua
if VehicleZoneDistribution then   -- pointless
    ...
end
```

`VehicleZoneDistribution` is a global table created by the vanilla file. Shared
vanilla files load before shared mod files, so by the time your file runs the
table always exists. If the check somehow failed, your mod would not work
anyway -- the guard converts a loud failure into a silent one.

Note the distinction: vanilla's own `VehicleZoneDefinition.lua` opens with
`VehicleZoneDistribution = VehicleZoneDistribution or {};`. That is the
*defining* file establishing the table idempotently, which is fine. A *consumer*
wrapping access in `if table then` is not.

The general rule, from the wiki's modding guide: **do not check for things you
should not need to check.** A failed assumption should error loudly. Both the
wiki and SimKDT flag this pattern -- along with `pcall` wrapping -- as a common
AI-generated smell that masks the real bug. See
[10-lua-and-modding-practices.md](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices).
