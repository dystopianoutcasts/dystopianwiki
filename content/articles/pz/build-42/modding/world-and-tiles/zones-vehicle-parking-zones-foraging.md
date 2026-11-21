---
id: build-42-zones-vehicle-parking-zones-foraging
slug: zones-vehicle-parking-zones-foraging
title: 'Zones: vehicle/parking zones + foraging'
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  How 42.22 turns a zone named on the map into parked cars: Vehicle and ParkingStall zones park cars, the name picks the table, cars sit on a grid, and only unseen chunks get them. Plus foraging zones.
last_updated: '2026-11-15'
related_articles:
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
  - basics-what-changed-and-why-it-matters-to-modders
  - vehicle-spawn-zones
  - zones-and-spawns-overview
  - foraging-in-b42
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A zone makes parked cars only when its type is `Vehicle` or `ParkingStall`. (Crash-story cars come from `Nav` zones instead.) Its name then picks a table in `VehicleZoneDistribution`; with no name the type is used, so an empty `ParkingStall` zone uses `parkingstall`.
- The name must match a table, in lower case. The game ships 44 tables and 11 alias names, 55 in all. The old page listed about two dozen and missed the north traffic jam.
- For a rectangle, the game walks through the zone in steps of 3 by 5 squares (cars facing north or south) or 5 by 3 (west or east) and rolls once per step. The old page's "multiples of 4 by 3" is not in the code.
- The base roll is 16 for a table that does not set its own. Cars are only made where the game is not a multiplayer client, and not at all when the vehicle spawn rate is None or vehicles are off.
- Foraging zones are separate. The game's foraging code has 17 zone names, and the zone's type must be `ForageZone`; the old page said it could not confirm any.
:::

:::facts
- **Zone types that spawn cars** 2: `Vehicle` and `ParkingStall`
- **Tables / names** 44 tables, 55 names counting 11 business aliases
- **Base chance per stall** 16 (a roll of 0 to 99 at or below 16, so 17 in 100)
- **Stall grid** 3 by 5 or 5 by 3 squares
- **Foraging zone names** 17 (zone type `ForageZone`)
:::

Outcast, a parking lot full of cars is two things on the map: a zone, and a name that tells the game which cars belong there. This page says what the 42.22 code does with them, and where the old page's rules fall short.

## 1. Two zone types make parked cars

A zone is a rectangle, a line or a shape with a name and a type, and the game spawns parked cars for it only if the type is `Vehicle` or `ParkingStall`.

A zone has a name, a type, a position and a size, and its shape is a point, a polyline or a polygon. :cite[(`zombie/iso/zones/Zone.java:58`, `zombie/iso/zones/ZoneGeometryType.java:9-13`)] A vehicle zone also reads an optional `Direction` and a `FaceDirection` flag from the zone's properties. :cite[(`zombie/iso/zones/VehicleZone.java:16-33`)] When the map is read, the two vehicle types go into a separate list for the cell that holds them. :cite[(`zombie/iso/IsoMetaGrid.java:636`, `zombie/iso/IsoMetaGrid.java:837-860`)] Animal and world-generation zones have their own handling, and any other type goes to the general zone list. :cite[(`zombie/iso/IsoMetaGrid.java:627-660`)]

The name decides the cars.

The code uses the zone's name, or its type if the name is empty, and only goes on if a table of that name exists. :cite[(`zombie/iso/IsoChunk.java:1754-1758`, `zombie/iso/IsoChunk.java:1808`)] The match is made in lower case. :cite[(`zombie/vehicles/VehicleType.java:166-169`)] That makes `ParkingStall` with no name the same as the table `parkingstall`. The file's own comment says the same. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:6`)]

Parked cars are made when a chunk loads for the first time, not every time. The call is made only for a chunk that the vehicle database has never seen, and only when zombies are being added to it. :cite[(`zombie/iso/IsoChunk.java:3718-3724`, `zombie/vehicles/VehiclesDB2.java:96-97`)] Inside, the work is skipped on a multiplayer client, and when vehicles are off or the spawn rate is None. :cite[(`zombie/iso/IsoChunk.java:1736-1743`)] So single player and a dedicated server make the cars, and a multiplayer client does not.

Crash-story cars are a different path. After the zone loop, a chunk with no vehicles that lies in a zone of type `Nav` can get a random car-crash story. :cite[(`zombie/iso/IsoChunk.java:1819-1824`, `zombie/iso/IsoChunk.java:1930-1936`)] A polyline vehicle zone is not walked with the grid below. A zone with a line shape goes to its own routine. :cite[(`zombie/iso/IsoChunk.java:1126`, `zombie/iso/IsoChunk.java:1809-1812`)]

## 2. The name picks one of 55 tables

The shipped tables cover parking lots, neighborhoods, businesses, emergency services and wrecks, and a mod can add its own by writing to the same table.

:::chips
- parkingstall
- trailerpark
- bad
- medium
- good
- luxuryDealership
- sport
- junkyard
- farm
- racecar
- evacuee
- trades
- delivery
- professional
- middleClass
- struggling
:::

:::chips
- police
- prison
- fire
- ranger
- ambulance
- radio
- postal
- mccoy
- carpenter
- spiffo
- fossoil
- scarlet
- massgenfac
- transit
- network3
- kyheralds
- lectromax
- knoxdisti
- advertising
- airportshuttle
- airportservice
- business
- business2 to business12
:::

:::chips
- trafficjamw
- trafficjame
- trafficjamn
- trafficjams
- normalburnt
- specialburnt
:::

The 44 tables are `parkingstall` to `racecar`, and the 11 aliases `business2` to `business12` point at `business`. Each alias is registered as its own entry, so `business` counts 12 times among the special cars. :cite[(`zombie/vehicles/VehicleType.java:62`, `zombie/vehicles/VehicleType.java:142-145`)] :cite[(`media/lua/shared/VehicleZoneDefinition.lua:29`, `media/lua/shared/VehicleZoneDefinition.lua:454-464`, `media/lua/shared/VehicleZoneDefinition.lua:571`)] 

The four traffic-jam tables are `trafficjamw`, `trafficjame`, `trafficjamn` and `trafficjams`. The grouping above is ours.

The old page listed `parkingstall`, `trailerpark`, `bad`, `medium`, `good`, `sport`, `junkyard`, three traffic jams, `police`, `fire`, `ranger`, `mccoy`, `postal`, `spiffo`, `ambulance`, `radio`, `fossoil`, `normalburnt` and `specialburnt`. The ones it left out include the north traffic jam, `trafficjamn`. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:192`)]

A table is a list of vehicles with spawn weights, plus optional settings.

The file's header lists them, with these defaults: damaged part chance 0, vehicle quality 1.0, special-car chance 5, burnt chance 0, normal-car chance 80, spawn rate 16, over-car chance 0, key chance 70, and no random angle. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:10-22`, `zombie/vehicles/VehicleType.java:27-39`)]

A table marked `specialCar` (`police`, `fire`, `ranger`, `ambulance`, `business`) uses `parkingstall` instead with the chance in its own `chanceToSpawnNormal`. The default is 80, and `police` sets 70. :cite[(`zombie/vehicles/VehicleType.java:194-196`, `media/lua/shared/VehicleZoneDefinition.lua:216`)] 

Other tables set that number too (`prison` 70, `scarlet` 40, `massgenfac`, `transit` and `network3` 60, and 0 for `luxuryDealership`, `farm` and several more), but the code reads it only for a special table, so for those it has no effect. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:122`, `media/lua/shared/VehicleZoneDefinition.lua:225`, `media/lua/shared/VehicleZoneDefinition.lua:291`, `media/lua/shared/VehicleZoneDefinition.lua:297`, `media/lua/shared/VehicleZoneDefinition.lua:372`)] 

A `forceSpawn` setting makes a table roll 100 per stall. :cite[(`zombie/vehicles/VehicleType.java:40`, `zombie/iso/IsoChunk.java:998-1000`)] No table in the shipped file sets it. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:217`, `media/lua/shared/VehicleZoneDefinition.lua:232`, `media/lua/shared/VehicleZoneDefinition.lua:240`, `media/lua/shared/VehicleZoneDefinition.lua:272`, `media/lua/shared/VehicleZoneDefinition.lua:452`, `zombie/vehicles/VehicleType.java:194-196`)] Burnt cars come from the table's burnt chance (20 for `trailerpark`, 40 for `junkyard`, 80 for the traffic jams), and 80 percent of those are from `normalburnt` and 20 percent from `specialburnt`. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:59`, `media/lua/shared/VehicleZoneDefinition.lua:154`, `media/lua/shared/VehicleZoneDefinition.lua:180`, `zombie/vehicles/VehicleType.java:185-188`)]

Two table names contain capital letters, `luxuryDealership` and `middleClass`. The tables are stored under their names as written and a zone's name is lowered before it is looked up, so a zone named for either looks unreachable. :cite[(`zombie/vehicles/VehicleType.java:62`, `zombie/vehicles/VehicleType.java:142`, `zombie/vehicles/VehicleType.java:180-182`, `media/lua/shared/VehicleZoneDefinition.lua:113`, `media/lua/shared/VehicleZoneDefinition.lua:538`)] This is a reading of the code and was not tested.

## 3. Cars sit on a grid of stalls

The game steps through the zone in a grid and rolls once for each stall, so a zone's size sets how many cars it can hold and not whether it is valid.

The grid depends on the way the cars face.

For north or south, a step is 3 squares across and 5 down. For west or east it is 5 across and 3 down. :cite[(`zombie/iso/IsoChunk.java:947-966`)] The direction is the zone's `Direction` property, or west when the zone is 4 to 6 wide and 3 or less or 6 or more tall, and north otherwise. :cite[(`zombie/iso/IsoChunk.java:949-958`)] A table's own random angle setting turns the car at will. :cite[(`zombie/iso/IsoChunk.java:1044-1055`)]

For each stall the game picks a vehicle from the table and rolls the spawn rate. The roll passes when a random number from 0 to 99 is at or below the rate, so the default 16 gives 17 in 100. :cite[(`zombie/iso/IsoChunk.java:984-1002`)] The result of the roll depends on the sandbox option Vehicle Spawn Rate:

| Setting | Label | What the code does | Code |
|---|---|---|---|
| 1 | None | No cars at all | :cite[(`zombie/iso/IsoChunk.java:1737`)] |
| 2 | Very Low | Divides the rate by 10 and rounds up (16 becomes 2) | :cite[(`zombie/iso/IsoChunk.java:993-994`)] |
| 3 | Low | Divides the rate by 1.5 and rounds up (16 becomes 11) | :cite[(`zombie/iso/IsoChunk.java:995`)] |
| 4 | Normal (default) | The rate as written | :cite[(`zombie/SandboxOptions.java:182`)] |
| 5 | High | The decompile shows the value 2; not verified | :cite[(`zombie/iso/IsoChunk.java:996`)] |

The labels are the English names. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:734-738`)] The Java default is 4. The presets set 3 for Apocalypse, Extinction and Six Months Later, and 4 for Outbreak and Rising. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:108`, `media/lua/shared/Sandbox/Extinction.lua:108`, `media/lua/shared/Sandbox/SixMonthsLater.lua:81`, `media/lua/shared/Sandbox/Outbreak.lua:108`, `media/lua/shared/Sandbox/Rising.lua:108`)] A table can set its own rate: `luxuryDealership` sets 50. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:124`)]

Traffic jams use their own names and code. The zone names `TrafficJamW`, `TrafficJamE`, `TrafficJamS` and `TrafficJamN`, and a polyline named `TrafficJam`, fill a road when the Car Wreck Congestion option is enabled, with an 80 percent chance per slot. :cite[(`zombie/iso/IsoChunk.java:1759-1787`, `zombie/iso/IsoChunk.java:1391`)] An `RTrafficJam` name does the same with a 10 percent chance of the whole zone. :cite[(`zombie/iso/IsoChunk.java:1766-1768`, `zombie/iso/IsoChunk.java:1788-1790`)] Any name containing `TrafficJam` does not go through the normal stall code. :cite[(`zombie/iso/IsoChunk.java:1802-1816`)]

## 4. Foraging zones are a different system

The foraging code has 17 zone names, and each has a density range and a refill rate.

The names are in `forageZones.lua` and include `DeepForest`, `Forest`, `Farm`, `FarmLand`, `Nav`, `TownZone`, `TrailerPark` and `Vegitation` (spelled that way). :cite[(`media/lua/shared/Foraging/forageZones.lua:1-146`)] `Ranch` is not one of them. The foraging system only uses a zone whose type is `ForageZone`. :cite[(`media/lua/shared/Foraging/forageSystem.lua:1079-1081`)] The game also makes foraging zones itself from the biome map, for chunks that have none. :cite[(`zombie/iso/worldgen/zones/ZoneGenerator.java:62-70`, `zombie/iso/worldgen/maps/BiomeMap.java:30-36`)] How the two meet is on the [foraging page](/pz/build-42/modding/farming-and-animals/foraging-in-b42), which covers the numbers.

:::callout[How we know]{kind=proof}
- Every citation above was read in the 42.22 decompile and its Lua. Nothing was tested by placing a zone.
- Changed: the size rule. The old page said a zone must be a multiple of 4 by 3. The code uses a 3 by 5 or 5 by 3 step and no size test (`zombie/iso/IsoChunk.java:947-966`).
- Changed: the list of names. The old page listed about two dozen. The file has 44 tables and 11 aliases, and a north traffic jam.
- Changed: "`ParkingStall` is the one map-zone type confirmed". `Vehicle` works too (`zombie/iso/IsoMetaGrid.java:636`), and the name chooses the table.
- Changed: foraging. The old page said the taxonomy and format were unconfirmed. The 17 names are in `forageZones.lua`, and the zone's type must be `ForageZone`. The old list's "Ranch" is not among them.
- Not verified: the High setting of Vehicle Spawn Rate; whether `luxuryDealership` and `middleClass` can be reached by a zone name; the 80 percent and 20 percent split of burnt cars is kept because the code and the file's comment agree.
- Dropped, not verified: the old descriptions such as "bad (poor areas)" or "mccoy (McCoy Lumber)". They come from the community wiki. The code does show that `junkyard` and the four traffic jams set the key chance to 20 and `racecar` to 100, against a default of 70. :cite[(`media/lua/shared/VehicleZoneDefinition.lua:158`, `media/lua/shared/VehicleZoneDefinition.lua:183`, `media/lua/shared/VehicleZoneDefinition.lua:577`)]
:::

## Where to go next

- [Vehicle spawn zones (editor side)](/pz/build-42/mapping/zones-and-packaging/vehicle-spawn-zones)
- [Zones and spawns overview](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview)
- [Foraging in Build 42](/pz/build-42/modding/farming-and-animals/foraging-in-b42)
