---
id: build-42-modding-ranch-zones
slug: modding-ranch-zones
title: 'MODDING: ranch zones'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  RanchZoneDefinitions controls where and which animals spawn on the map. Ranch
  zones are a specific zone type for spawning animals -- used for mapping and
  animal modding. [CONFIRMED]
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# MODDING: ranch zones (spawning animals on the map)

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`RanchZoneDefinitions` controls **where and which** animals spawn on the map. Ranch zones are a specific zone type for spawning animals -- used for mapping and animal modding. [CONFIRMED]

### 11.1 Vanilla ranch zone names [CONFIRMED]
Per-animal zones (size variants):
- Chicken: `chicken`, `chickensmall`, `chickenbig`
- Pig: `pig`, `pigsmall`, `piglarge`, `pigonlyone` (source comment: "only one pig, intended for one pig in a backyard")
- Sheep: `sheep`, `sheepsmall`, `sheeplarge`
- Cow: `cow`, `cowlarge`
- Turkey: `turkey`, `turkeysmall`, `turkeylarge`
- Rabbit: `rabbit`, `rabbitsmall`

Multi-animal zones (use `possibleDef`): `notchicken` (sheep/cow/pig), `notchickenlarge` (a large amount of the same), `poultry` (chicken/turkey), `poultrylarge`.

### 11.2 Two ways to create a ranch zone
**A. Mapping [CONFIRMED, but flagged Unverified on the wiki]:** In the Unofficial Mapping Tools, open the cell, select the `Ranch` object group, add a zone (rectangle or polygon), and name it after a vanilla or custom ranch-zone definition. No properties needed. Caveats: if a zone is too big it won't create and animals won't spawn; animals may not spawn if the zone is too close to another ranch zone; zones work on non-ground floors too.

**B. Lua on world creation [CONFIRMED]:** register zones on the `OnLoadMapZones` event:
```lua
local zones = {
    {x=1350, y=8563, z=0, width=10, height=10, name="cow"},
    {x=3247, y=4315, z=0, width=10, height=10, name="chicken"},
}
local function addRanchZones()
    local world = getWorld()
    for i = 1, #zones do
        local zone = zones[i]
        world:registerZone(zone.name, "Ranch", zone.x, zone.y, zone.z, zone.width, zone.height)
    end
end
Events.OnLoadMapZones.Add(addRanchZones)
```
(Use the B42 Map tool to find coordinates and gauge zone size.)

### 11.3 `RanchZoneDefinitions` parameters [CONFIRMED]
`RanchZoneDefinitions.type["id"]` holds a definition. Parameters:
- `type` -- the definition ID.
- `globalName` -- the animal ID (the `yourAnimalID` from AnimalDefinitions).
- `chance` -- a weight value; the wiki notes it's unclear what it rolls for since a ranch zone holds one animal. [UNCERTAIN]
- `femaleType` / `maleType` -- the growth stage for the female/male variant to spawn.
- `minFemaleNb` / `maxFemaleNb` / `minMaleNb` / `maxMaleNb` -- min/max counts by sex.
- `chanceForBaby` -- chance to spawn as baby instead of adult.
- `maleChance` -- chance to spawn male (`50` = 50%).
- `possibleDef` -- list of possible ranch zones for multi-animal zones (other params probably ignored):
  ```lua
  RanchZoneDefinitions.type["notchickenlarge"] = {}
  RanchZoneDefinitions.type["notchickenlarge"].type = "notchickenlarge"
  RanchZoneDefinitions.type["notchickenlarge"].possibleDef = {"sheeplarge","cowlarge","piglarge"}
  ```

Related tables: `AnimalAvatarDefinition`, `AnimalPartsDefinitions`, `AnimalDefinitions`. [CONFIRMED as referenced]
