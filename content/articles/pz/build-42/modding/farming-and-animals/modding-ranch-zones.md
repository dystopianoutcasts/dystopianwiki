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
  - husbandry
excerpt: >-
  How 42.22 puts animals on a map: the 21 ranch definitions, what each key does, the dice a ranch zone rolls once, and the dead animals a late-game ranch can spawn.
last_updated: '2026-11-21'
related_articles:
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - modding-the-animaldefinitions-global-table
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players who wonder why a farm has no animals](#1-when-a-ranch-spawns-animals) | [modders editing the definitions](#2-the-definitions) | [modders adding a ranch](#3-making-a-ranch-zone)

Outcast, a farm that shows animals did not keep them from before the outbreak. The game rolls dice for it the first time a ranch zone on the map is loaded, and this page shows how those dice work, which side runs them and what a mod can change.

:::callout[The 1-minute version]{kind=key}
- A ranch is a map zone of type `Ranch`. The first time its area is fully loaded, single player or the server rolls once whether animals appear, and that roll is saved with the zone. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:38-61`, `zombie/iso/IsoChunk.java:3726-3729`, `zombie/iso/zones/Zone.java:165`)]
- The zone's name picks the definition, so it must match a ranch definition name such as `cow` or `chickenbig`. A non-empty name that matches nothing spawns nothing and writes a debug line, while an empty name picks a random definition. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:133-135`, `media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:30-31`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:98-148`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:150-155`)]
- The chance comes from the sandbox option Animal Spawn Chance. The Java default is Always, which is a roll of 120 against 100. The presets set it lower. :cite[(`zombie/SandboxOptions.java:213`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:63-91`)]
- Late in a save the animals can spawn dead: females from world day 189 on, males from day 249 on, as the code reads. Not tested in a running game.
- As far as we could find, a multiplayer client never rolls. It only receives what the server made. :cite[(`zombie/iso/IsoChunk.java:3726-3729`)]
:::

:::facts
- **Ranch definitions** 21: 17 that name an animal and 4 lists that pick one of them :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:4-236`)]
- **Spawn chance, Java default** Always (value 7), a roll below 120 :cite[(`zombie/SandboxOptions.java:213`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:83-84`)]
- **Presets** Extinction 4 (roll 20), Apocalypse 5 (55), Outbreak and Rising 6 (85) :cite[(`media/lua/shared/Sandbox/Extinction.lua:136`, `media/lua/shared/Sandbox/Apocalypse.lua:136`, `media/lua/shared/Sandbox/Outbreak.lua:136`, `media/lua/shared/Sandbox/Rising.lua:136`)]
- **Dead on arrival** from world day 189 (female) and 249 (male) :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:218-225`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:255-259`)]
- **Biggest zone the engine accepts** 1,202 squares on a side :cite[(`zombie/iso/IsoMetaGrid.java:523-545`)]
:::

## 1. When a ranch spawns animals

**A ranch rolls once, when its area is first fully loaded, and never again.**

The check runs for every zone of a chunk that is loading, but only when the game is not a multiplayer client. It needs the zone's type to be `Ranch`, every square of the zone to exist, and the zone's saved `hourLastSeen` to be 0. :cite[(`zombie/iso/IsoChunk.java:4231-4238`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:38-39`)] If a connected animal zone already has a nonzero `hourLastSeen`, the new one copies it and no roll happens. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:40-49`)] After the check the counter goes up by one, so the zone is never rolled again. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:51-57`)]

The roll is a number from 0 to 99 that must be below the chance. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:91-93`)] The chance follows the sandbox option:

| Option value | Label players see | Chance (below 100) |
|---|---|---|
| 1 | Never | no roll |
| 2 | Extremely Rare | 7 |
| 3 | Rare | 6 |
| 4 | Sometimes | 20 |
| 5 | Often | 55 |
| 6 | Very Often | 85 |
| 7 | Always | 120, so every time |

The labels are from the translation file and the chances from the code. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:916-924`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:63-90`)] Rare is lower than Extremely Rare in the code (6 against 7), which looks like a typo in the source; we did not test it. The debug "force" path uses 100. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:87-89`)]

Females and their babies are set to not wild, but males are not set, so they keep the species default; a rabbit buck is wild. All get a random age, and a female brings a baby when she can have young and a 0 to 99 roll passes `chanceForBaby`. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:196`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:204-206`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:241-264`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:236`)] On a dedicated server each one is also registered with the animal instance manager. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:228-232`)]

### Late-game ranches spawn dead animals

After world day 60, each female may spawn dead. The chance is 1 in (190 minus the world age in days). When that number reaches 0 or 1 the animal always spawns dead, which is from day 189 onward. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:218-226`)]

Males use 250, so they always spawn dead from day 249 onward. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:255-260`)] That follows from `NextBool(n)` being true when `Next(n)` is 0, and `Next` returning 0 for any `n` of 0 or less. :cite[(`zombie/core/random/RandInterface.java:28-30`, `zombie/core/random/RandAbstract.java:22-24`)] The code sets the animal's health to 0, and an animal with health 0 or less counts as dead. :cite[(`zombie/characters/IsoGameCharacter.java:4955-4957`)]

## 2. The definitions

**Each ranch definition says which animal types to spawn, how many of each sex and how likely a baby is.**

There are 21 entries in `RanchZoneDefinitions.type`, each written as `RanchZoneDefinitions.type["id"]`. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:4-236`)] The Java side reads them from the global table by key name, matching each key without regard to letter case. :cite[(`zombie/randomizedWorld/randomizedRanch/RanchZoneDefinitions.java:41-120`)]

| Key | What it does | Example (`cow`) |
|---|---|---|
| `type` | The name a zone must have to pick this entry. | `cow` |
| `globalName` | The animal name used in the pen's display name. | `cow` |
| `chance` | A weight, used only to pick among entries that share one `type`. | 3 |
| `femaleType` / `maleType` | Animal types in `AnimalDefinitions.animals`. | `cow` / `bull` |
| `minFemaleNb` / `maxFemaleNb` | How many females, both ends included. | 1 / 3 |
| `minMaleNb` / `maxMaleNb` | How many males, both ends included. | 1 / 1 |
| `forcedBreed` | One breed for the whole ranch. Left out, each animal gets a random breed. | none |
| `chanceForBaby` | Per female, a baby is added when a 0 to 99 roll is at or below this number. | 5 |
| `maleChance` | The males appear when a 0 to 99 roll is not above this number, so `50` would mean about half the time. | 100 |
| `possibleDef` | A list of other entry names. The entry then picks one of them by weight. | none |

Rows are from the definition file and the Java reader. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:4-16`, `media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:133-143`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:160-182`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:267`)]

The 17 entries that name an animal are `chicken`, `chickensmall`, `chickenbig`, `pig`, `pigsmall`, `piglarge`, `pigonlyone`, `sheep`, `sheepsmall`, `sheeplarge`, `cow`, `cowlarge`, `turkey`, `turkeysmall`, `turkeylarge`, `rabbit` and `rabbitsmall`. The four lists are `notchicken` (sheep, cow, pig), `notchickenlarge` (their large versions), `poultry` (chicken, turkey) and `poultrylarge` (`chickenbig`, `turkeylarge`). :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:4-236`)]

:::chips
- `chicken`
- `chickensmall`
- `chickenbig`
- `pig`
- `pigsmall`
- `piglarge`
- `pigonlyone`
- `sheep`
- `sheepsmall`
- `sheeplarge`
- `cow`
- `cowlarge`
- `turkey`
- `turkeysmall`
- `turkeylarge`
- `rabbit`
- `rabbitsmall`
- `notchicken`
- `notchickenlarge`
- `poultry`
- `poultrylarge`
:::

The related tables are `AnimalDefinitions` (the animal types the entries name), and `AnimalPartsDefinitions` and `AnimalAvatarDefinition`, which the [butchering page](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals) covers. `RanchZoneDefinitions` itself is the table this page describes.

### What `chance` really does

**`chance` is a weight among entries that share one `type` value, and each vanilla `type` is unique, so vanilla never needs it.**

The loader stores entries in a map keyed by their `type`. When a zone picks its entry it looks up the zone's name there and adds the `chance` of every entry in that list. :cite[(`zombie/randomizedWorld/randomizedRanch/RanchZoneDefinitions.java:111-117`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:98-126`)] With one entry per name the pick is that entry.

A mod that adds a second entry with the same `type` makes the two compete by weight. The same weighting picks one member of a `possibleDef` list. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:156-158`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:272-291`)]

A list entry finds its members while the table is being read, so a member must already be loaded when the list is reached; otherwise the game writes "Couldn't find ranch definition" to the animal debug log. :cite[(`zombie/randomizedWorld/randomizedRanch/RanchZoneDefinitions.java:122-136`)] The vanilla comment says such lists belong after the entries they point to. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:222`)] We did not test whether a Lua table's order is kept when the engine reads it.

### Two quirks in the numbers

**The small pig and sheep ranches spawn one male even though their maximum is 0.**

`pigsmall` and `sheepsmall` set `minMaleNb = 1` and `maxMaleNb = 0`. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:64-65`, `media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:115-116`)] The code asks for a count from `min` to `max + 1` (the top end is not included), and when both ends are equal the random function returns that number. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:179`, `zombie/core/random/RandAbstract.java:39-41`)] So both ranches get one male. That looks unintended, and we did not test it in game.

A `chanceForBaby` of 0 is still not zero. The test is "roll at or below", and the roll can be 0, so it passes 1 time in 100. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:204`, `zombie/core/random/RandAbstract.java:22-30`)] The `rabbit` entry sets 100, so every doe gets a baby. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:207`)]

The entries without a `maleChance` line (`chickensmall`, `turkeysmall`, `rabbitsmall` and `pigonlyone`) have 0 for it; `pigsmall` and `sheepsmall` set 100. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:67`, `media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:118`)] The males are dropped when a 0 to 99 roll is above `maleChance`, so with 0 almost every roll drops them (99 in 100). :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:180-182`)]

## 3. Making a ranch zone

**There are two ways to add a ranch: draw it in a map tool, or register it from Lua while the world loads.**

For the Lua way, the `OnLoadMapZones` event runs when the world is built. Right after it, single player and the server load `map_zone.bin` from the save. 

If that file exists, `loadZone` disposes every zone and replaces them with the saved ones, so a zone a mod registered in the event is dropped. If the file does not exist yet, which is a new save, the missing-file error is swallowed, `loadZone` does not run and the mod's zone stays; the next save then writes the zone list to `map_zone.bin`. :cite[(`zombie/iso/IsoWorld.java:2070-2076`, `zombie/iso/IsoMetaGrid.java:1749-1766`, `zombie/iso/IsoMetaGrid.java:1815-1825`, `zombie/iso/IsoMetaGrid.java:1665`, `zombie/iso/IsoMetaGrid.java:1926-1935`)] 

So, as read, a zone added this way holds for a new save and not for an existing one.

We did not run it in game. The event `OnLoadedMapZones` fires after the load, but we did not verify whether a zone registered there survives. :cite[(`zombie/iso/IsoWorld.java:2083-2084`)] Vanilla itself registers its zones this way, with `getWorld():registerZone(name, type, x, y, z, width, height)`. :cite[(`media/lua/server/metazones/metazoneHandler.lua:110`, `zombie/iso/IsoWorld.java:449-451`)] Put the code in a file the server loads, because only single player and the server roll the spawn. :cite[(`zombie/iso/IsoChunk.java:3726-3729`)]

```lua
local zones = {
    { x = 1350, y = 8563, z = 0, width = 10, height = 10, name = "cow" },
    { x = 3247, y = 4315, z = 0, width = 10, height = 10, name = "chicken" },
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

This example uses only what vanilla uses: the event, `getWorld()` and `registerZone` with those seven arguments. :cite[(`media/lua/server/metazones/metazoneHandler.lua:110`, `media/lua/server/metazones/metazoneHandler.lua:182`)] The coordinates are an example; use your own map's. The example has not been run in a game.

The engine refuses a zone that is outside the map (with a 100-square margin), has a floor outside -32 to 31, or is wider or taller than 1,202 squares. It writes an error line and does not add it. :cite[(`zombie/iso/IsoMetaGrid.java:523-548`)] That is the real limit behind the old advice that a zone that is too big will not be created. The names `cow` and `chicken` match definitions, so they spawn animals; a non-empty name that matches nothing does not.

For the map-tool way, the `Ranch` zone is drawn in the zone editor and given a vanilla or custom definition name. The tool steps are not in the game files, so they are not verified here. The in-game rules above apply the same way to a drawn zone.

:::callout[Three different "animal zones"]{kind=warn}
A `Ranch` map zone only decides the initial spawn. The pens a player designates are a different object, the `AnimalZone` designation zone. :cite[(`zombie/iso/areas/DesignationZoneAnimal.java:37`)] Its size is the sum of the squares of every connected pen, and it is compared with each animal type's `minEnclosureSize` once per game hour. :cite[(`zombie/iso/areas/DesignationZoneAnimal.java:507-517`, `zombie/characters/animals/datas/AnimalData.java:428-431`)] A third kind, `AnimalZone` in the animal package, holds the wild animal paths. :cite[(`zombie/characters/animals/AnimalZone.java:22`)]
:::

:::callout[How we know]{kind=proof}
Every number is from the 42.22 files cited. We read the code; we did not run a game, so the dead-animal rule, the one-male quirk and the Rare-below-Extremely-Rare chance are readings of the decompiled source, which the decompiler says to verify against bytecode for subtle control flow.

Not verified: whether a zone registered in `OnLoadMapZones` survives in an existing save (the code reads as dropped); how the map tool draws a Ranch zone; whether the table order of the definitions is kept when the engine reads it; what a modded second entry with the same `type` does in play; the role of the animal-package `AnimalZone` beyond its class line.

Dropped from the older page: the Unofficial Mapping Tools steps, the caveat that zones near each other may not spawn, and the claim that the purpose of `chance` is unclear (it is the weight above). The 42.21 to 42.22 delta changed `DesignationZoneAnimal` (its animal list became a set), not the ranch files.
:::
