---
id: build-42-fire-water-and-power-reference
slug: fire-water-and-power-reference
title: 'Fire, water and power: the numbers'
game: pz
version: build-42
section: engine
category: fire-water-and-power
difficulty: intermediate
tags:
  - engine
  - reference
  - fire
  - water
  - electricity
  - sandbox
excerpt: >-
  Every number from the fire, water and power pages in one place: options, fire life and spread, extinguishing, shutoff rolls, rain rates, generator draws and wear, bulbs, events and packets.
last_updated: '2026-11-14'
related_articles:
  - how-fire-works
  - fighting-fire
  - water-and-plumbing
  - electricity-and-generators
  - modding-fire-water-and-power
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#fire) | [server owners](#server-options-multiplayer-settings-file) | [modders](#events-and-packets)

:::callout[The 1-minute version]{kind=key}
- This is the lookup page: each row says what a number means in play and where it was read, and the reasoning behind a row is on the page named at the top of its section.
- Fire: a wild fire lives 800 to 2,999 ticks, which is about 27 to 100 real seconds at normal speed (derived, not timed in a running game), and at most 75 wild fires are active at once.
- Water and power: the water shutoff and the power shutoff are day numbers rolled in the client menus, and a server never rolls them.
- Generators: a 10 liter tank, a fuel use of the raw draw sum times the Generator Fuel Consumption option (default 0.1), and a circle of 20 squares and 3 floors by default.
- Server options `NoFire` (off) and `SafehouseAllowFire` (on) control fire on a multiplayer server.
:::

:::facts
- **Fire life** 800 to 2,999 ticks, 30 fire ticks a second at 1x (derived)
- **Fire limit** 75 wild fires
- **Extinguish** 2 by 2 squares, 50 ticks, 1 liter of water per square
- **Shutoff defaults** water "0 - 30 Days", power "14 - 30 Days", both modifiers 14
- **Generator** 10 liter tank, idle draw 0.02 raw, wear 1 in 24 to 1 in 36 per hour
- **Rain** 10 ticks a second at 1x (derived), fill `0.005 x intensity x snow factor x rain factor x 2.4` liters per tick
:::

Outcast, this is the lookup page. It has no stories; each row says what a number means in play and where it was read.

The reasoning behind a row is on the page named at the top of its section. "Derived" means worked out from the code and not timed in a running game. Citations are paths inside the engine source (`zombie/...`) or the game's media folder (`media/...`).

## Sandbox options in this unit

These are the sandbox options the fire, water and power pages use, each with the line where it is declared.

All are in `zombie/SandboxOptions.java` at the line shown. Options marked "hidden" appear on the sandbox screen only in debug mode.

| Option | Page | Type | Default | Range | What it does | Code |
|---|---|---|---|---|---|---|
| `WaterShut` | World | choice | 2 ("0 - 30 Days") | 1 to 9 | Picks how the water-off day is rolled | `SandboxOptions.java:79` |
| `WaterShutModifier` (hidden) | World | whole number | 14 | -1 to 2,147,483,647 | The day number the engine tests; the roll writes it | `SandboxOptions.java:82` |
| `ElecShut` | World | choice | 2 ("14 - 30 Days") | 1 to 9 | Picks how the power-off day is rolled | `SandboxOptions.java:80` |
| `ElecShutModifier` (hidden) | World | whole number | 14 | -1 to 2,147,483,647 | The day number the engine tests | `SandboxOptions.java:84` |
| `AlarmDecay` | World | choice | 2 ("0 - 30 Days") | 1 to 6 | Rolls an alarm battery decay per building | `SandboxOptions.java:81` |
| `AlarmDecayModifier` | World | whole number | 14 | -1 to 2,147,483,647 | Companion number; its use was not read | `SandboxOptions.java:86` |
| `FireSpread` | World | checkbox | on | on or off | Turns off all fire spreading, and a burning person lighting the ground | `SandboxOptions.java:169` |
| `AllowExteriorGenerator` | World | checkbox | on | on or off | Generators power outdoor squares and gas pumps | `SandboxOptions.java:171` |
| `GeneratorTileRange` | World | whole number | 20 | 1 to 100 | Radius in squares of a generator's power circle | `SandboxOptions.java:260` |
| `GeneratorVerticalPowerRange` | World | whole number | 3 | 1 to 15 | Floors above and below a generator that get power | `SandboxOptions.java:261` |
| `GeneratorFuelConsumption` | Meta | decimal | 0.1 | 0 to 100 | Multiplier on every generator draw | `SandboxOptions.java:153` |
| `GeneratorSpawning` | Loot | choice | 5 | 1 to 7 | How often generators spawn on the map | `SandboxOptions.java:154` |
| `MaximumFireFuelHours` | World | whole number | 8 (12 in the Outbreak preset) | 1 to 168 | Most fuel a campfire, wood stove or barbecue holds | `SandboxOptions.java:251` |
| `LightBulbLifespan` | World | decimal | 1.0 (presets: 2.0, 1.0, 2.0, 3.0) | 0 to 1,000 | Longer-lasting bulbs; 0 means bulbs never break | `SandboxOptions.java:228` |
| `FridgeFactor` | World | choice | 3 | 1 to 6 | How well a powered fridge keeps food | `SandboxOptions.java:134` |
| `FuelStationGasInfinite` | World | checkbox | off | on or off | Gas pumps never run out | `SandboxOptions.java:186` |
| `FuelStationGasMin`, `FuelStationGasMax` | World | decimal | 0.0 and 0.7 | 0 to 1 | Starting fill range of pumps | `SandboxOptions.java:187`, `:188` |
| `FuelStationGasEmptyChance` | World | whole number | 20 | 0 to 100 | Percent of pumps that start empty | `SandboxOptions.java:189` |
| `Rain` | Nature | choice | 3 | 1 to 5 | How often it rains (not read in detail) | `SandboxOptions.java:122` |
| `EnableTaintedWaterText` | Nature | checkbox | on | on or off | Tainted water is labeled as such | `SandboxOptions.java:180` |
| `TimeSinceApo` | Time | choice | 1 ("0") | 1 to 13 | Adds 30 world-age days per step above 1 | `SandboxOptions.java:146` |
| `DayLength` | Time | choice | 4 (90 minutes) | 1 to 27 | Real minutes per game day | `SandboxOptions.java:71` |

The index of options is `api/sandbox_options.jsonl`. The Outbreak preset sets the fuel hours to 12, and the other four presets read here use 8 :cite[(`media/lua/shared/Sandbox/Outbreak.lua:174`, `Apocalypse.lua:174`, `Extinction.lua:174`, `Rising.lua:174`)]. All five set `GeneratorFuelConsumption = 0.1` :cite[(`Apocalypse.lua:81`)]. The real minutes for each day-length choice are listed in the sandbox code :cite[(`SandboxOptions.java:413-423`)].

### Server options (multiplayer settings file)

Two server options control fire on a multiplayer server.

| Option | Default | Effect | Code |
|---|---|---|---|
| `NoFire` | off | All fire starts are refused (smoke and campfires excepted) | `zombie/network/ServerOptions.java:84`, `zombie/iso/objects/IsoFire.java:274` |
| `SafehouseAllowFire` | on | Fire may burn safehouse squares | `ServerOptions.java:93`, `IsoFire.java:289-290` |

## Shutoff rolls

The water, power and alarm days are rolled from the same kind of choice table, and the top of each range is never picked.

The roll code picks each day number from its choice :cite[(`SandboxOptions.java:330-367`)]. The top of each range is never picked :cite[(`zombie/core/random/RandAbstract.java:54-55`)]. Only the client menus roll; the server never does :cite[(`media/lua/client/OptionScreens/SandboxOptions.lua:947-953`, `MainScreen.lua:1570-1580`)].

| Choice | Water: day number | Power: day number | Alarm decay: days |
|---|---|---|---|
| 1 Instant | -1 | -1 | 0 |
| 2 | 0 to 29 | 14 to 29 | 0 to 29 |
| 3 | 0 to 59 | 14 to 59 | 0 to 59 |
| 4 | 0 to 179 | 14 to 179 | 0 to 179 |
| 5 | 0 to 359 | 14 to 359 | 0 to 359 |
| 6 | 0 to 1,799 | 14 to 1,799 | 0 to 1,799 |
| 7 | 60 to 179 | 60 to 179 | (no such choice) |
| 8 | 180 to 359 | 180 to 359 | (no such choice) |
| 9 Disabled | never | never | (no such choice) |

| Rule | Value | Code |
|---|---|---|
| Grid exists while | world age in days is at most the power number (the water test is "at or above", one day apart) | `SandboxOptions.java:1289-1295` |
| Water infinite while | world age in days is below the water number (and the other tests on the water page) | `zombie/iso/IsoObject.java:2701` |
| World age in days | (24 hours per night survived + hours since 7 AM) / 24 + 30 x (`TimeSinceApo` - 1) | `zombie/GameTime.java:897-911` |
| Delay to flip the grid on a server | 2,650 ms | `zombie/AmbientSoundManager.java:255` |

## Fire

This section holds the numbers from [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works) and [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire): lifetimes, spreading, starters, and what burns people and things.

### Lifetimes and stages

The fire life, its stages and the unloaded catch-up are all in the fire class `zombie/iso/objects/IsoFire.java`.

| Item | Value | Real time at 1x (derived, 30 fire ticks a second) | Code |
|---|---|---|---|
| Wild fire life | 800 to 2,999 ticks (the floor requirement can cut it to 300 to 599) | 27 to 100 s; 10 to 20 s when cut | `:228`, `:233-238` |
| Life lowered by floor | 100 ticks per point of floor requirement; under 600 re-rolled to 300 to 599 | 10 to 20 s | `:233-238` |
| Spread delay | 0 to about half the life | | `:240` |
| Stage length | stages 0 to 3: life / 5 each; stage 4 and 5: life / 10 each | 5 to 20 s; 3 to 10 s | `:241-242`, `:471-519` |
| First burn of the square | end of stage 0 (life / 5) | 5 to 20 s after ignition | `:471-479` |
| Light radius by stage | 0: 5; 1: 5; 2: 8; 3: 12; 4: 8; 5: 1 | | `:424`, `:477-517` |
| Flag burning / smoke | burning in stages 0 to 3; smoke in stages 4 and 5 | | `:395-401` |
| Fire ticks per update | 0.5 at normal speed | | `:444`, `zombie/GameTime.java:986`, `:1032-1034` |
| Unloaded fire catch-up | 1 tick per 30 game milliseconds (2,000 ticks per game minute) | 1.5 game minutes kills the longest fire | `:449-460` |
| Active wild fire limit | 75; the oldest is cleared for the 76th | | `IsoFireManager.java:55`, `:71-99` |
| Tutorial changes | life doubled, spread delay quartered, spread energy cost quartered | tutorial only | `:243-250`, `:618` |

### Spreading

A fire spreads only in stages 1 to 3, and each attempt pays energy from its own tank.

One spread attempt follows the rules in the table :cite[(`IsoFire.java:298-379`)].

| Item | Value | Code |
|---|---|---|
| Spots tried per attempt | 1 to 3; 1 time in 50, 15 more | |
| Candidate squares | 8 neighbors, 4 below (straight down and three toward north/west), 1 above: 13 | |
| Spread only in stages | 1 to 3 | |
| Cost to spread | The target square's floor `FireRequirement`; no floor: 30, vegetation 15, indoors 40 | `IsoFire.java:604-619` |
| Energy given to the new fire | Outdoors: the parent's remaining energy. Indoors: twice the cost | |
| Starting energy | Passed in, minus the floor requirement (minimum 5); vegetation adds 50 | `IsoFireManager.java:195-201`, `IsoFire.java:254-256` |
| Rain | Stops the attempt after the energy is paid | `IsoFire.java:365-367` |
| Square cannot burn if | water, no objects, burnt out (unless forced), already burning or smoking, unflammable floor, server `NoFire`, or a safehouse with `SafehouseAllowFire` off | `:273-291` |
| Fire-immune objects | Fire requirement 800,000 or more | `zombie/iso/IsoGridSquare.java:304`, `:6294` |

### Starters

Each starter gives a fixed energy and has its own chance or radius.

| Starter | Energy | Chance or radius | Code |
|---|---|---|---|
| Molotov | 30 | 30 percent, FireRange 4 | `media/scripts/generated/items/weapon.txt:19784-19786` |
| Flame trap | 40 | 50 percent | `weapon.txt:440-441` |
| Aerosol bomb | 20 | 10 percent, explosion power 70, range 6 | `weapon.txt:238-242` |
| Oven or microwave with metal | 10,000 | about 1 update in 200, about 3 s of running at 1x (derived) | `zombie/iso/objects/IsoStove.java:90-101` |
| Food burnt far past | 500,000 | about 1 update in 200 (about 3 s), only if the oven has grid power | `Food.java:517-519`, `zombie/inventory/types/Food.java:520-536` |
| Heated petrol in an item | 500,000 | when the item heat is over 1.6 | `zombie/inventory/InventoryItem.java:1486-1499` |
| Generator at condition 20 or lower | 1,000 | 1 in 10 per hour | `zombie/iso/objects/IsoGenerator.java:254-257` |
| Burning a corpse | 100 | life 700 in single player | `zombie/characters/IsoGameCharacter.java:15178-15184` |
| A body dying on fire | 100 | life 500 | `zombie/iso/objects/IsoDeadBody.java:410-413` |
| A burning character | 80 | 6 in 3,000 per update, about 1 chance in 9 per second (derived) | `IsoGameCharacter.java:8200-8217`, `:558` |
| Indoor campfire | 100 | life 500; 1 in 5 per ten game minutes | `media/lua/server/Camping/SCampfireSystem.lua:97-124` |
| Burning container explosion | 100 to 250 + power | chance = power percent, 5 by 5 by 2 block | `zombie/iso/objects/IsoFireManager.java:159-175` |
| Explosion power per alcohol drink, petrol can, bleach, or generator with fuel | 20 each, cap 100 | | `zombie/iso/IsoGridSquare.java:6310-6322`, `:6393-6404` |

### People and things on fire

A player catches fire in flames about 1 update in 70, and a zombie or animal catches fire at once.

| Item | Value | Code |
|---|---|---|
| `fireKillRate` | 0.0038 | `IsoGameCharacter.java:557` |
| Catch fire while standing in flames (player) | about 1 update in 70, about 1 s (derived) | `:5976` |
| Zombie or animal on a burning square | catches fire at once | `:5976-6000` |
| Damage while standing in flames (player) | `fireKillRate x thirty-fps x 60 / 2` per update | `:5982` |
| Damage while burning | player: `fireKillRate x thirty-fps x 60`; zombie: `fireKillRate / 20 x multiplier`; other survivor: `fireKillRate x multiplier`; animal: 0.9 x that | `:6484-6496` |
| A burning player stops | about 1 in 400 per update, about 7 s on average (1 in 150 running, about 2.5 s) | `:6512-6516` |
| Characters in a vehicle | not affected by flames | `:5974` |
| Corpse removed after | burn timer of 10 (about 10 s at 1x, derived) | `zombie/iso/objects/IsoDeadBody.java:1446` |
| Fire noise | 1 in 5 starts: radius 20 | `IsoFireManager.java:225-227` |
| Fire sounds at once | 20 | `IsoFireManager.java:69` |

## Extinguishing

One use of an extinguisher, a bag or a liter of water puts out one square of a 2 by 2 block, and the action takes 50 ticks.

| Item | Value | Code |
|---|---|---|
| Area | 4 squares (2 by 2) | `media/lua/server/FireFighting/ISExtinguishCursor.lua:160-194` |
| Action time | 50 ticks | `media/lua/shared/TimedActions/ISPutOutFire.lua:82-87` |
| Extinguisher | 1 use per square; 10 uses in the item (`UseDelta 0.1`) | `FireFighting.lua:8-10`, `media/scripts/generated/items/drainable.txt:1616` |
| Sandbag, gravel bag, dirt bag | 1 use per square; 4 uses in the item (`UseDelta 0.25`) | `FireFighting.lua:11-13`, `drainable.txt:343`, `:359`, `:374` |
| Water | 10 uses per square; one use is 100 mL; so 1 L per square | `FireFighting.lua:14-16`, `media/lua/shared/defines.lua:53` |
| Item pick order | extinguisher, bag, water | `FireFighting.lua:100` |
| Works on | squares flagged burning (stages 0 to 3) and burning characters | `ISPutOutFire.lua:53-80` |
| Campfire put out | fuel x 0.9 | `SCampfireGlobalObject.lua:343-348` |
| Fireplace smolder | 10 game minutes after putting out | `zombie/iso/objects/IsoFireplace.java:48`, `:388-398` |

## Controlled fires

A campfire burns 1 fuel minute per game minute, and the fuel cap is the Maximum Fire Fuel Hours option times 60 minutes.

| Item | Value | Code |
|---|---|---|
| Campfire fuel use | 1 minute per game minute | `SCampfireSystem.lua:135-145` |
| Campfire radius | `max(2, maxRadius x min(fuel, 360) / 360)`; 10 outdoors, 18 indoors | `SCampfireGlobalObject.lua:320-327` |
| Campfire zombie noise | radius and volume = fire radius, every 10 game minutes | `SCampfireSystem.lua:153-163` |
| Fuel cap | `MaximumFireFuelHours` x 60 minutes | `media/lua/server/Camping/camping_fuel.lua:176-179` |
| Fuel from an item | `min(table value, weight x ratio)` hours; ratio 2/3, or 0.25 for clothes, bags, books and maps, or the item's `FireFuelRatio` | `media/lua/shared/Camping/ISCampingMenu.lua:4`, `:65-80` |
| Fireplace light radius | 1 to 8, rising to full at 60 fuel minutes | `IsoFireplace.java:297-299` |
| Heat source temperature | 35 (permanent fire, fireplace) | `IsoFire.java:437`, `IsoFireplace.java:49` |
| Fireplace container temperature | 1.8 lit, 1.0 unlit | `IsoFireplace.java:173-175` |

## Water

The water rows cover the infinite source test, plumbing, and the clean or tainted rules.

| Item | Value | Code |
|---|---|---|
| Infinite source | `WaterAmount` 9999 or more, or an unmoved piped fixture in a room before the shutoff | `zombie/iso/IsoObject.java:2687-2710` |
| Infinite amount shown | 10,000 | `IsoObject.java:2752`, `:2802` |
| Plumbing action | 100 ticks, pipe wrench | `media/lua/shared/TimedActions/ISPlumbItem.lua:45-50` |
| Source search | the square one floor up, then its 8 neighbors; the first with water, else the first container | `IsoObject.java:2526-2557` |
| Valid source | built object, not a floor, not itself plumbed, capacity above 0 | `IsoObject.java:2559-2577` |
| Water from a plumbed fixture | cleaned | `IsoObject.java:2923-2938` |
| Puddle source threshold | more than 0.09 | `IsoObject.java:2975` |
| Clean infinite sprites | `camping_01_16`, `camping_01_64` to `_67` | `IsoObject.java:2718-2723` |
| Fire use of water | 100 mL per use | `media/lua/shared/defines.lua:53` |

### Rain

Rain fills a container each tick by a formula that uses the intensity, the snow factor and the container's rain factor.

The fluid update system applies this formula :cite[(`zombie/entity/components/fluids/FluidContainerUpdateSystem.java:76-106`)].

| Item | Value | Code |
|---|---|---|
| Fill per tick | `0.005 x intensity x snow factor x rain factor x 2.4` liters | |
| Snow factor | 0.5 for snow, 1 for rain | |
| Seconds per tick (game) | 2.4 | `zombie/entity/EntitySimulation.java:35-37` |
| Ticks | one per 100 ms of simulation clock; 10 a second at 1x (derived) | |
| Ticks per game hour | 25 x day length in minutes (derived) | |
| Runs on | single player and server only | `FluidContainerUpdateSystem.java:43`, `zombie/entity/GameEntityManager.java:106` |

| Container | Rain factor | Capacity | Time to fill at full rain (derived) | Code |
|---|---|---|---|---|
| Pot | 0.8 | 1.5 L | 15.6 s | `normal.txt:4029-4030` |
| Bucket (10 L) | 1.0 | 10 L | 83 s | `normal.txt:13269-13270` |
| Rain collector crate | 0.4 | 400 L | 2.3 h | `entity_raincollector.txt:14-15` |
| Rain collector barrel | 0.25 | 600 L | 5.6 h | `entity_raincollector.txt:69-70` |
| Well | 0.1 | 10,000 L | 9.6 days | `entity_well.txt:14-16` |
| Closed-lid barrel | none | 600 L | never | `entity_raincollector.txt:103-120` |

Arithmetic: per tick = 0.012 x rain factor liters; per minute = 600 ticks; barrel 0.25 x 0.012 x 600 = 1.8 L a minute; 600 / 1.8 = 333 minutes = 5.6 hours. Crate 0.4 x 0.012 x 600 = 2.88 L a minute; 400 / 2.88 = 139 minutes = 2.3 hours.

## Electricity

The electricity rows cover the generator models, the generator numbers and the light bulbs.

### Generator models

The four models come from the item scripts in `media/scripts/generated/items/normal.txt`.

| Item | Weight | Wear (1 in N per hour) | Noise radius | Code |
|---|---|---|---|---|
| `Generator` Lectromax | 40 | 30 | 20 | `normal.txt:4800-4815` |
| `Generator_Yellow` Premium Technologies | 40 | 36 | 20 | `normal.txt:4817-4832` |
| `Generator_Blue` ValuTech | 30 | 24 | 23 | `normal.txt:4834-4849` |
| `Generator_Old` Old | 40 | 25 | 25 | `normal.txt:4851-4866` |

### Generator numbers

The tank, the draws, the wear and the fumes are in `zombie/iso/objects/IsoGenerator.java` unless a row names another file.

| Item | Value | Code |
|---|---|---|
| Tank | 10 liters | `IsoGenerator.java:514-516`, `:445` |
| Idle draw (raw) | 0.02 | `IsoGenerator.java:285` |
| Draws (raw): light 0.002; fridge or freezer 0.08; fridge with freezer 0.13; radio 0.01; washer, dryer or combination 0.09; stacked pair 0.9 per half (1.8 both); charger 0.05; pump 0.03 | | `IsoGenerator.java:73-82`, `IsoObject.java:5195-5207` |
| Television on 0.03, stove on 0.09 | counted (both override `couldBePoweredByGenerator`) | `IsoTelevision.java:227-234`, `IsoStove.java:522-529` |
| Fuel per hour | raw sum x `GeneratorFuelConsumption` | `IsoGenerator.java:211-213` |
| Condition loss | 1 in N per hour, 1 or 2 points | `IsoGenerator.java:208-216` |
| Backfire | condition 40 or less: 1 in 15; 30 or less: 1 in 10; 20 or less: 1 in 5; sound radius 40, volume 60 | `IsoGenerator.java:235-252` |
| Fire / explosion at 20 or lower | 1 in 10 / then 1 in 20 | `IsoGenerator.java:254-263` |
| Failure to start | 50 percent at condition 50 or lower | `ISActivateGenerator.lua:42` |
| Repair | `4 + Electrical / 2` per scrap; time `150 - 3 x Electrical` | `ISFixGenerator.lua:70`, `:84` |
| Fuel add time | `70 + 50 x liters` | `ISAddFuel.lua:67` |
| Connect time | 300 ticks | `ISPlugGenerator.lua:43-48` |
| Turn on time | 30 ticks | `ISActivateGenerator.lua:52-57` |
| Skill gate | Electrical 3 or knowledge of "Generator" (connect and fix only) | `ISWorldObjectContextMenuLogic.java:2156` |
| Noise indoors | radius halved | `IsoGenerator.java:192-194` |
| Range | circle radius `GeneratorTileRange`; floors `GeneratorVerticalPowerRange`; floors -32 to 31 | `IsoGenerator.java:119-131`, `:724-730` |
| Chunk range | radius / 8 + 1 | `IsoGenerator.java:122` |
| Fumes | whole building toxic; torso health -0.1 x multiplier per update, about 3 a second at 1x (estimate, not timed); the part clamps at 0 | `IsoGameCharacter.java:9034-9046`, `BodyPart.java:523-525` |

Arithmetic: tank life = 10 / (raw sum x multiplier). Default 0.1 with raw 0.15 is 10 / 0.015 = 667 hours; condition 100 to 20 at 1.5 points per hit: 80 / (1.5 / 30) = 1,600 hours for 1 in 30; 80 / (1.5 / 25) = 1,333; 80 / (1.5 / 24) = 1,280; 80 / (1.5 / 36) = 1,920.

### Light bulbs and lamps

A lamp checks every 60 game minutes whether its bulb breaks, and lifespan 0 means no breaking.

The rows are in `zombie/iso/objects/IsoLightSwitch.java`.

| Item | Value | Code |
|---|---|---|
| Check interval | 60 game minutes | `IsoLightSwitch.java:70`, `:728-751` |
| Break test | random 0 to `1000 x lifespan` below burn minutes / 10,000 | `IsoLightSwitch.java:731-738` |
| Lifespan 0 | no breaking | `IsoLightSwitch.java:719-722` |
| Battery drain | `delta` 0.00025 per minute | `IsoLightSwitch.java:62`, `:755` |
| Default light radius | 8 | `IsoLightSwitch.java:133` |
| Light draw on a generator | 0.002 raw | `IsoLightSwitch.java:842-844` |

## Events and packets

These are the Lua events and network packets that the fire, water and power code raises.

| Name | Fires or means | Side | Code |
|---|---|---|---|
| `OnNewFire(fire)` | A wild fire object was made | where the object is made (server, single player, and each client for the copy) | `IsoFire.java:258`, `api/events.jsonl` |
| `OnGridBurnt(square)` | A square burned | server, single player | `zombie/iso/IsoGridSquare.java:6209` |
| `OnElectricityChanged()` | Grid cut, or a generator switched | every side that runs the code | `AmbientSoundManager.java:250`, `AmbientStreamManager.java:646`, `IsoGenerator.java:555`, `:644` |
| `OnWaterAmountChange(object, old)` | A fixture or container's water changed | server, single player | `IsoObject.java:2791`, `:2852`, `:2886`, `:2965`, `:3001`, `:3048` |
| `EveryOneMinute`, `EveryTenMinutes` | Campfire fuel; indoor fire spread, campfire noise | server, single player | `SCampfireSystem.lua:183-184` |
| Packet 197 `SyncIsoObject` | Generators and light switches | both | `zombie/network/PacketTypes.java:518` |
| Packet 203 `StartFire` | A new fire (and smoke requests from clients) | both | `PacketTypes.java:524` |
| Packet 204 `StopFire` | A square or character stopped burning | both | `PacketTypes.java:525` |

OnNewFire and OnGridBurnt have no listeners in the vanilla Lua :cite[(`api/events.jsonl`)].

## Where to go next

- [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works), [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire), [Water and plumbing](/pz/build-42/engine/fire-water-and-power/water-and-plumbing), [Electricity and generators](/pz/build-42/engine/fire-water-and-power/electricity-and-generators).
- [Modding fire, water and power](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power).

:::callout[How we know]{kind=proof}
Everything above is read from the files named in every row, as code and data. The option list is the generated index `api/sandbox_options.jsonl`. Build 42.22, engine revision 3d39148846 (Steam build 26486631). Rows marked "derived" were worked out from the code and not timed in a running game.
:::
