---
id: build-42-what-weather-does
slug: what-weather-does
title: 'What weather does: players, zombies, plants, vehicles and the world'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: intermediate
tags:
  - engine
  - weather
  - gameplay
  - zombies
  - farming
  - vehicles
excerpt: >-
  What rain, fog, wind, snow, cold and storms cost you in Build 42.22: wet clothes, worse shooting, blinder and deafer zombies, crops, vehicles and radios, with the numbers.
last_updated: '2026-11-14'
related_articles:
  - how-weather-works
  - seasons-and-day-length
  - rain-snow-fog-and-wind
  - temperature-outdoors
  - the-forecast-and-weather-ui
  - modding-weather
  - how-zombies-see-and-hear-you
  - seasons-curses-and-the-crop-table
  - body-temperature-and-the-thermoregulator
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#you) | [zombie and farming planners](#zombies) | [modders](#things-i-looked-for-and-did-not-find)

:::callout[The 1-minute version]{kind=key}
- Rain wets your clothes (intensity below 0.1 counts as zero), and wet skin loses heat faster and catches colds sooner.
- Fog and wind hurt firearm accuracy a lot; rain only a little. The `FirearmWeatherMultiplier` option scales all of it, and 0 turns the weather off for firing.
- Zombies see less far in rain and fog (vision radius between 10 and 20 tiles) and hear less well. In heavy rain a sound they cannot see sends them up to 5 tiles off.
- In 42.22 the farming Lua reads four values that are fixed, so crops that are not cold-hardy take the cold penalty whatever the real temperature (read from code, not tested in a game).
- Rain cuts vehicle grip by 0.3, and cold makes low-quality engines harder to start unless Easy Use is on.
- Lightning, wind and snow do no damage and nothing slows you in snow or wind; we found no such code in the Java or vanilla Lua.
:::

:::facts
- **Wetness drying** 20 points of wetness per hour for clothes on the ground or in a bag when dry
- **Zombie sight** radius `20 - max(darkness x 5, rain x 2.5 + fog x 7)`, kept between 10 and 20 tiles
- **Zombie hearing** reach times `1 - 0.33 x rain - 0.1 x fog`
- **Rain grip** wheel friction down by 0.3
- **Cold starts** from 2 C or colder, engine quality under 65, unless Easy Use is on
- **Radio scramble** 35 percent times strength in rain, 70 percent in storms
:::

A forecast is only useful if you know what it will cost you, and this page is the bill. It lists everything the engine and the vanilla Lua scripts do with the weather values, so you can plan a run around it, and a mod can find the exact line to change. The values being read (rain, fog, wind and so on) are explained on [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works).

Nothing here was played. Every row comes from reading the 42.22 code. Examples worked out from formulas say so.

## At a glance

Each kind of weather touches players, zombies and the world in different ways.

| Weather | Players | Zombies | Other |
|---|---|---|---|
| Rain | wet clothes and skin, colds; shooting; foraging, fishing | hear less well; look for you less far | water barrels, crops, fire spread, food on the ground, vehicle grip, radios, animals |
| Fog | spotting chance, shooting, foraging, fishing | see less far; hear slightly less | view distance, light |
| Wind | shooting, fishing, wind chill | none found | radio, trees and rain slant (visual) |
| Snow | foraging | none found | winter sprites; no movement effect found |
| Cold and heat | the body model | none found | cold engines, compost worms, corpses, plant health |
| Storm | the weather above, plus radio static | rain and fog effects only | thunder is sound and light |
| Time of day | foraging light, spotting | the day-night speed option | animals, ambience |

## You

Rain wets you, fog and wind spoil your shooting, and the weather changes how well you forage and fish.

### Getting wet

Wetness is the player's stat that the rain raises and the sun lowers.

The stat itself, its moodle levels and the constants are on the character pages ([Sickness, pain and other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats), [reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference)). What the weather feeds into it is worked out in one block of the body update :cite[(`zombie/characters/BodyDamage/BodyDamage.java:722-811`)]:

| Situation | Rule | Code |
|---|---|---|
| **Outside and raining** | Wetness rises by the rain intensity. Intensity below 0.1 counts as zero. | :cite[(`:764-770`)] |
| **"Outside"** means | Not in a room and no roof over the square (`haveRoof`), not in a vehicle with a roof, and not sleeping or resting in a tent. A porch counts as sheltered here. | :cite[(`:725-728`, `:756-762`)] |
| **Dry, or sheltered** | Wetness falls by `0.1`, plus `(air - 5) / 10` when the air is above 5 C. At 15 C that is 1.1, at 25 C 2.1. | :cite[(`:771-784`)] |
| **Vehicle with a broken windshield, raining** | `intensity squared x speed / 50`, kept between 0 and 1, zero below 0.1. | :cite[(`:734-754`)] |
| **Umbrella** | An equipped item with the "protect from rain" flag caps each body part's wetness at a share of 100 that depends on the part. | :cite[(`ClothingWetness.java:66-76`, `:217-221`)] |

The wet moves through the layers of clothing from the outside in. A hole in a layer or a layer already soaked lets it through; a water-resistant layer slows it :cite[(`ClothingWetness.java:139-260`)]. Items with the "break when wet" tag are destroyed at 100 wetness :cite[(`:88-91`)]. Your own sweat wets the inner layers too: a body part that is sweating wets its clothing, and cold outside air slows that, to 0.4 of the rate at -10 C or colder and 1.0 at 10 C and above :cite[(`:112-117`, `:138-143`)].

Clothes lying on the ground or in a bag dry or get wet on their own: **20 points of wetness per hour** when dry, wetter by `rain x hours x 100` when outside in the rain :cite[(`zombie/inventory/types/Clothing.java:488-534`)]. Where an item gets wet or dries is decided separately :cite[(`:544-600`)].

Wetness then feeds the cold. Wet skin loses heat faster and catches colds sooner, and wet clothes insulate up to 75 percent worse :cite[(`BodyDamage.java:812-830`)]. See [Body temperature](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator).

### Cold, heat and wind

The body model reads the air temperature twice (plain and with wind chill), and the humidity.

Above 0.5 humidity, sweating cools less, down to none at 1.0 :cite[(`Thermoregulator.java:783-787`, `:813`, `:830`)]. The numbers are on [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors) and in the body temperature article.

### Sleeping

Sleeping in the rain costs you wetness and cold, not sleep.

Sleeping outdoors records whether it is raining and since when :cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:56-63`, `:331-350`)], but nothing reads that record: the snow, temperature and wetness checks for sleepers are empty methods :cite[(`:352-364`)]. The cost of sleeping in the rain is the wetness above and the cold. An old "rain wakes you up" helper in `RainManager` is never called :cite[(`RainManager.java:368-378`)].

### Seeing and being seen

Fog cuts the chance that another player spots you, and fog and daylight set the engine's view distance.

| Effect | Rule | Code |
|---|---|---|
| **Other players spotting you** | The chance that a player notices a sneaking player is multiplied by `max(0.1, 1 - fog)`. Thick fog cuts it to 10 percent. | :cite[(`IsoPlayer.java:6090-6100`)] |
| **View distance** | The engine's idea of how far things are visible: a function of fog and daylight. | :cite[(`ClimateManager.java:1518-1529`)] |

View distance in tiles, from the formula `min = (19 - 8 fog) x 3`, `max = (min/3 + 4 + 7 x daylight x (1 - fog)) x 3`, then `min + (max - min) x daylight`:

| Fog | Night | Full day |
|---|---|---|
| 0 | 57 | 90 |
| 0.5 | 45 | 67.5 |
| 1.0 | 33 | 45 |

Zombies compare their distance to a target with it before anything else :cite[(`IsoZombie.java:2109-2122`, `IsoGameCharacter.java:2365`)]. For zombies it rarely decides anything, because a zombie's own vision radius is at most 20 tiles (below); it also limits how far away other characters count as seen by the player :cite[(`IsoGameCharacter.java:2362-2366`)]. The [zombie article](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) has the same 90, 57 and 33.

### Shooting

For a firearm outdoors the weather takes points off the hit chance.

The penalty is worked out in the combat manager :cite[(`zombie/CombatManager.java:2616-2650`)]; the constants 6, 0.2, 0.6, 0.5, 10 and 3.5 are set in the combat config :cite[(`zombie/combat/CombatConfigKey.java:23`, `:49-55`)]. `d` is the distance in tiles:

```
wetwind = wind x (6 - 0.2 x Aiming) x d x (0.6 if Marksman else 1)  +  rain x d x 0.5
penalty = ( wetwind x (1.5 unless Outdoorsman)  +  fog x 10 x d )     (no fog term with a thermal sight)
          x min(d / 3.5, 1)                                          (fades inside 3.5 tiles)
          x the Firearm Weather Multiplier option
```

Worked examples, at 10 tiles, not Outdoorsman, with the penalty in points of hit chance (the unit the [firearm article](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage) uses):

| Weather | Aiming 0 | Aiming 5 |
|---|---|---|
| Wind 0.2 (24 km/h) | 18 | 15 |
| Wind 0.5 (60 km/h) | 45 | 37.5 |
| Rain 0.5 | 3.8 | 3.8 |
| Rain 1.0 | 7.5 | 7.5 |
| Fog 0.5 | 50 | 50 |
| Storm: wind 0.5, rain 0.6, fog 0.3 | 79.5 | 72 |

Fog and wind are the shooter's enemies; rain is mild. The `FirearmWeatherMultiplier` sandbox option (0 to 10, default 1) scales all of it, and 0 turns the weather off for firing :cite[(`api/sandbox_options.jsonl`, `CombatManager.java:2648`)]. The indoor target is exempt: the check is on the target's square being outside :cite[(`:2622`)].

### Foraging and fishing

Foraging and fishing are vanilla Lua, so they read the same getters a mod would.

| Activity | Rule | Code |
|---|---|---|
| **Foraging, weather penalty** | `rain + fog + snow/4 + cloud x 0.1` (snow capped at 1), capped at 75 percent, scaled by trait effects. An equipped umbrella cuts the rain part to a tenth. Indoors, none. | :cite[(`media/lua/shared/Foraging/forageSystem.lua:1838-1865`, `:123`)] |
| **Foraging, finds** | Each item type has its own rain, "has rained" (puddles) and snow bonus: chance times `(100 + rainChance x rain + puddleChance x puddles + snowChance x snow) / 100`. | :cite[(`forageSystem.lua:1997-2003`, `:1132-1142`)] |
| **Fishing, temperature** | Air 15 to 30 C: x1. 0 to 15 or 30 to 40: x0.75. -10 to 0 or 40 and up: x0.5. -10 and below: x0.25. | :cite[(`media/lua/shared/Fishing/FishingUtils.lua:208-220`, `Bobber.lua:83-91`)] |
| **Fishing, weather** | Fog 0.4 or more, or wind 0.5 or more: x0.8. Else raining: x1.2. | :cite[(`FishingUtils.lua:222-235`, `Bobber.lua:93-98`)] |

The wind that fishing reads is the smooth wind without gusts (`getWindPower`), not the gust value.

### Things left outside

Rain can taint food and soak towels left outdoors, and it stops fire from spreading.

| Thing | What the rain does | Code |
|---|---|---|
| Food on the ground, outdoors, in the rain | Each update it may turn **tainted**, with probability equal to the rain intensity | :cite[(`zombie/inventory/InventoryItem.java:1376-1404`, `:1525`)] |
| Wet towel, wet dish cloth on the ground | Soaks more water | :cite[(`InventoryItem.java:1385-1390`)] |
| Drainable towels | Slowly use up (get wet) | :cite[(`zombie/inventory/types/DrainableComboItem.java:130-145`)] |
| Fire | Rain stops a fire from **spreading** to a new square. A fire already burning is not stopped by this code | :cite[(`zombie/iso/objects/IsoFire.java:365-367`)] |

The food check is per update, not per hour; how often an item updates was not measured here. In practice, leave food under a roof.

## Zombies

Rain and fog shorten zombie sight and hearing and blur where they go when they hear you.

| Effect | Rule | Code |
|---|---|---|
| **Sight** | Vision radius is `20 - max(darkness x 5, rain x 2.5 + fog x 7)` tiles, then scaled by sight type, and kept between 10 and 20. | :cite[(`IsoZombie.java:5425-5457`)] |
| **Hearing reach** | Multiplied by `1 - 0.33 x rain - 0.1 x fog`. Heavy rain with thick fog gives 0.57. | :cite[(`IsoGameCharacter.java:15480-15484`, `zombie/WorldSoundManager.java:518-522`)] |
| **Hearing precision** | When a zombie hears a sound it cannot see, it walks to a spot up to 2 tiles off. In heavy rain (above 0.5) that is up to **5 tiles** off. The "Poor" hearing setting adds 2, "Pinpoint" takes 2, never below 2 or above 10. | :cite[(`IsoZombie.java:1741-1757`)] |
| **Idle wandering** | An idle zombie picks a new wander time of 400 to 1,000 units, **times 1.5 when it is not raining**. They mill about more in the rain. | :cite[(`zombie/ai/states/ZombieIdleState.java:91-98`)] |
| **Day and night** | The "active only" sandbox option uses dawn and dusk. | [Seasons](/pz/build-42/engine/weather-and-climate/seasons-and-day-length#day-and-night-and-the-zombies) |

The published [zombie article](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) has the same numbers; I found them unchanged in 42.22. Nothing in the code makes zombies faster, slower or more numerous in snow, wind or storms.

## Plants and farming

The farming system in 42.22 is the older Lua one, and the weather enters it in a handful of places.

The code is in `media/lua/server/Farming/`. The weather enters it in these places:

| Rule | Code |
|---|---|
| **Rain waters crops.** Each ten game minutes of rain, an outdoor plant gains `30 x precipitation / waterFactor` water (waterFactor is 2 when weeds are present). The same event updates plants. | :cite[(`SFarmingSystem.lua:127`, `:304-309`)] |
| **Winter kills.** If "Plant Growing Seasons" is on, an outdoor plant that is not cold-hardy becomes cursed while the engine's season is `Winter`. Outdoor houseplants lose 1.5 health in winter. | :cite[(`SFarmingSystem.lua:173-178`, `:225-227`)] |
| **No pests in winter.** Aphids, flies and slugs do not start outdoors in `Winter`. | :cite[(`SPlantGlobalObject.lua:261`, `:295`, `:327`)] |
| **Compost.** Worms are not made by outdoor compost in winter. | :cite[(`zombie/iso/objects/IsoCompost.java:127-128`)] |
| **Digging up worms.** No worms in winter. Each square gives a worm at most once a week, with a base chance of 1 in 40. The first 2 hours after dawn and rain each **double** that chance (halving the number). | :cite[(`media/lua/shared/Farming/TimedActions/ISPlowAction.lua:158-175`)] |
| **Holly.** Trees named holly drop extra in autumn and winter. | :cite[(`zombie/iso/objects/IsoTree.java:793-795`)] |

The winter checks use the engine's `Winter` season, which is the season on the [seasons page](/pz/build-42/engine/weather-and-climate/seasons-and-day-length), about early November to mid February, not "Dec to Feb".

### Four checks that look like weather and are not

Four values the farming Lua reads are fixed in 42.22, because the code that used to update them is switched off.

The functions in `media/lua/server/Seasons/season.lua` are commented out :cite[(for example lines 32-115 and 217-291)]:

| Check | What the code reads | What it is in 42.22 | Code |
|---|---|---|---|
| "Sunny" health bonus | `getWorld():getWeather()` | Always `"sunny"`: the world's weather word starts as `"sunny"` and nothing sets it | :cite[(`SFarmingSystem.lua:190-195`; `zombie/iso/IsoWorld.java:317`, `:3173`)] |
| "Sunny" water loss | `season.weather == "sunny"` | Never true: the table starts as `"normal"` | :cite[(`:311`; `season.lua:16`)] |
| "Cold" health loss | `season.currentTemp <= 10` | Always true: the table starts at -1 and is never updated | :cite[(`:203`; `season.lua:10`)] |
| "Warm enough" for pests | `season.currentTemp > 10` | Never true, so pests never begin on their own | :cite[(`SPlantGlobalObject.lua:261`, `:295`, `:327`)] |

If that is right (it is code reading only), then in 42.22 every crop that is not cold-hardy takes the cold health penalty every health tick, whatever the real temperature, and the sunny bonus is always on, whatever the real weather. The published [crop health page](/pz/build-42/modding/farming-and-animals/crop-health-water-disease) lines about "temp below 10 C" and "no pests at temps of 10 C or less" describe the intent, not what the code does. A mod that sets `season.currentTemp` from `getClimateManager():getTemperature()` would restore the intent. Not tested in a game.

### Water collectors

Rain collectors, rain-catching fluid containers and drying racks all fill or progress from rain.

| Collector | Rule | Code |
|---|---|---|
| **Rain collectors** | In 42.22 rain collectors are entities with a fluid container that fills from rain. The square collector holds 400 L with a rain factor of 0.4; the round one holds 600 L with a rain factor of 0.25. The old Lua rain barrel system still loads but adopts no objects, so its "4 units every ten minutes" rule no longer applies. Fill rates and taint: see [Water and plumbing](/pz/build-42/engine/fire-water-and-power/water-and-plumbing). | :cite[(`media/scripts/generated/entities/outdoors/entity_raincollector.txt:14-15`, `:69-70`; `media/lua/server/RainBarrel/SRainBarrelSystem.lua:28-31` (`isValidIsoObject` returns false))] |
| **Fluid containers with a rain catcher** | Each update, outdoors: `0.005 x precipitation x (0.5 if snow) x catcher size x game seconds since the last update`. | :cite[(`zombie/entity/components/fluids/FluidContainerUpdateSystem.java:76-106`)] |
| **Drying racks and the like** | Rain adds `0.001 x intensity` wetness (half for snow) to a drying craft and holds its progress; dry weather removes it at a rate set by temperature. | :cite[(`zombie/entity/components/crafting/DryingCraftLogic.java:65-100`)] |

## Animals

Animals marked as stressed by rain gain stress under open sky and wander less in rain.

They gain stress while it rains :cite[(`zombie/characters/animals/IsoAnimal.java:710-713`)]. They wander 3 times less often in rain :cite[(`BaseAnimalBehavior.java:312-314`)], stop sitting, and look for roofed parts of their zone :cite[(`:205-210`, `:275-279`)].

## Vehicles

Rain cuts wheel grip, and cold makes weak engines hard to start.

| Effect | Rule | Code |
|---|---|---|
| **Grip in rain** | The wheel friction multiplier drops by 0.3 whenever it is raining (1.0 to 0.7 on the road, 0.7 to 0.4 off road). Any rain intensity, anywhere, including under a roof. Snow does nothing. | :cite[(`zombie/vehicles/BaseVehicle.java:9300-9302`)] |
| **Cold engines** | Unless the vehicle option "Easy Use" is on, an engine with quality under 65 is harder to start when the air is 2 C or colder (below). | :cite[(`zombie/vehicles/VehicleEngine.java:333-347`)] |
| **Rain ambience** | A vehicle plays its rain ambient loop while it is raining and not in a room, within 20 tiles of a listener. | :cite[(`BaseVehicle.java:7828-7839`)] |

Cold starting. Each start attempt fails if `Rand.Next(quality + 50 - cold) <= 30`, where `cold = min((2 - air) x 2, 30)` for quality under 65 (the formula reads the air temperature for the vehicle's square, with no wind chill) :cite[(`zombie/vehicles/VehicleEngine.java:339-345`)]. Assuming `Rand.Next(n)` returns 0 to n-1, the chance of failing to start:

| Engine quality | Warm (above 2 C) | At -13 C or colder |
|---|---|---|
| 20 | 44 percent | 78 percent |
| 40 | 34 percent | 52 percent |
| 60 | 28 percent | 39 percent |
| 65 or more | 27 percent or less, no cold effect | same |
| 100 | never fails this way | never |

(Worked out from the formula. A failed attempt can be retried.)

## Radios and the weather channel

While a weather period runs, radio talk crackles, and a thunderstorm, tropical storm or blizzard scrambles it twice as much.

The radio scrambles each word with a probability of **35 percent times the period's current strength** for ordinary rain and **70 percent times it** in a thunderstorm, tropical storm or blizzard :cite[(`ClimateManager.java:676-684`, `zombie/radio/ZomboidRadio.java:786-792`, `:887`)]. TV lines are not scrambled; that is the radio pages' business ([Radio and television](/pz/build-42/modding/engine/radio-and-television)). The weather channel itself is on the [forecast page](/pz/build-42/engine/weather-and-climate/the-forecast-and-weather-ui).

## Sound

The sound engine is told the weather through eight global parameters.

Each one is a small parameter class :cite[(`zombie/audio/parameters/`)]:

| Parameter | Value | Code |
|---|---|---|
| `RainIntensity` | rain intensity, 0 to 1 | :cite[(`ParameterRainIntensity.java:20`)] |
| `SnowIntensity` | snow intensity, 0 to 1 | :cite[(`ParameterSnowIntensity.java:20`)] |
| `FogIntensity` | fog, 0 to 1 | :cite[(`ParameterFogIntensity.java:20`)] |
| `WindIntensity` | wind, 0 to 1 | :cite[(`ParameterWindIntensity.java:20`)] |
| `Temperature` | degrees C | :cite[(`ParameterTemperature.java:20`)] |
| `Storm` | 0 none, 1 thunderstorm, 2 tropical storm, 3 blizzard | :cite[(`ParameterStorm.java:21-36`)] |
| `Season` | 0 spring, 1 summer, 2 autumn, 3 winter | :cite[(`ParameterSeason.java:20-30`)] |
| `TimeOfDay` | night, dawn, day and dusk bands from the season's dawn and dusk | :cite[(`ParameterTimeOfDay.java:20-35`)] |

The ambient sound manager also switches rain-only loops on when it rains :cite[(`zombie/AmbientStreamManager.java:263`)]. Thunder and rumble are one-shot sounds placed at the strike :cite[(`ThunderStorm.java:308-335`)].

## Light, color and the picture

Much of the weather is only drawn on screen, and those visuals are not gameplay.

Weather is mostly seen: sky and light colors by season and cloudiness, desaturation in winter and fog (0 to 0.4 by season) :cite[(`ClimateValues.java:315-317`)], the cloud tint of the period, the lightning flash, puddles that grow in rain and shrink when it dries, rain streaks and splashes, snow on the ground and on trees and roofs, fog that is drawn as a shader. These are in `zombie/iso/weather/fx/`, `fog/` and `zombie/iso/IsoPuddles.java`, and are not gameplay. Ground snow is controlled by the **Snow on Ground** option, and the drawn fog and rain are capped by two more options that do not touch the real values (see [Rain, snow, fog and wind](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind)).

## Things I looked for and did not find

Several effects you might expect have no weather input in 42.22's Java or vanilla Lua that I could find.

I followed every getter of rain, snow, fog, wind and temperature through the call index. These have **no** weather input in 42.22's Java or vanilla Lua that I could find:

- snow slowing the player, footprints in snow, or any movement penalty from wind;
- wind pushing a character: the player gets "Windspeed" and "WindForce" animation variables :cite[(`IsoPlayer.java:730-731`, `:2741-2743`)] but none of the vanilla animation sets reads them;
- lightning damage, setting fires, or thunder attracting zombies;
- storms or fog changing zombie speed, number or spawn;
- wind affecting vehicles;
- rain interrupting sleep (the helper exists and is never called).

Mods can of course add any of these.

## Odd corners

A few oddities are worth remembering.

- The `Maximum Fog Intensity` option changes only the picture; zombies, guns and fishing still see the real fog.
- "Sunny" crops are sunny always; "cold" crops are cold always (above).
- The grid's "22 C indoors" rule means rain-soaked survivors dry off fast inside a powered building: the dry-off rate at 22 C is `0.1 + (22 - 5)/10 = 1.8` per update, against 0.1 outside in the cold :cite[(`BodyDamage.java:771-784`)].

:::callout[How we know]{kind=proof}
Every number was read from the 42.22 code, none was measured in play. The firearm and cold-start tables are worked out from the formulas. Not verified:
- How often an item or plant update runs, which changes the rate of food tainting in rain. The check is per update.
- Whether `Rand.Next(n)` runs from 0 to n-1, which the vehicle table assumes.
- The farming finding (fixed "sunny" and "cold" values) was read from Lua. It was not tested in a running game.
- Whether TV broadcasts are affected by weather; the radio code scrambles radio only.
:::
