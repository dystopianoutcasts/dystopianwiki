---
id: build-42-how-weather-works
slug: how-weather-works
title: 'How weather works'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: intermediate
tags:
  - engine
  - weather
  - climate
  - multiplayer
  - lua
excerpt: >-
  Where rain, fog, wind and temperature come from, how often the game updates them, why the server decides the weather in multiplayer, and what is saved.
last_updated: '2026-11-14'
related_articles:
  - seasons-and-day-length
  - rain-snow-fog-and-wind
  - temperature-outdoors
  - what-weather-does
  - the-forecast-and-weather-ui
  - modding-weather
  - erosion
  - body-temperature-and-the-thermoregulator
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#the-pipeline-in-one-picture) | [server owners](#which-side-runs-it-in-multiplayer) | [modders](#what-a-mod-can-do-here)

:::callout[The 1-minute version]{kind=key}
- The weather is deterministic: given the same world and the same date, the same stages come out. That is why the forecast can be right.
- The climate runs off the game clock, not the frame rate, so it speeds up when you fast-forward.
- In multiplayer the server does the math and clients display what they are told; the server sends the whole climate state every 10 game minutes.
- The climate is saved inside `map_t.bin`, the same file as the clock.
- The climate outputs 16 values: 13 floats, 2 colors and 1 boolean. Everything else in the game asks for these through getters.
- The rain that soaks your jacket, the fog that hides a horde and the frost that starts a cold all come out of one Java class, `ClimateManager`. It is a small simulator: a few slow random waves, a calendar, and a "weather period" on top that turns a wave into an afternoon of rain.
:::

:::facts
- **Outputs** 16 values (13 floats, 2 colors, 1 boolean)
- **Climate tick** every game minute: about every 4 seconds at the default 1 hour 30 minute day (3.75 real seconds)
- **Full state packet** every 10 game minutes: about every 37 seconds at that day length
- **Client glide** 5 seconds, down to 0.5 seconds if packets arrive faster
- **Air mass wave** one unit of noise per 166 world hours by default (about 6.9 days)
:::

Nothing here was run in a game. The claims come from the 42.22 code. Where a table of numbers comes from running the engine's own math in a separate test program, the page says so. The other pages in this section zoom in on each part and on what the numbers do to you.

## The pipeline in one picture

Five parts feed one another: the calendar, the season model, the noise baseline, the manager that holds the final values, and the weather period on top.

```
 the calendar --> ErosionSeason --> ClimateValues --> ClimateManager --> final values --> the game
 (date, year)     season, dawn,     smooth noise      "internal"        (what everything
                  dusk, mean temp   + daily dice      values            else reads)
                                         |                ^
                                         v                |
                                  air mass flips --> WeatherPeriod --> overrides on top
                                  (a front)          (stages: showers,
                                                      heavy rain, storm...)
                                                          |
                                                          v
                                                    ThunderStorm (lightning, thunder)
```

::::cards
:::card[ErosionSeason]{accent=orange}
Knows the date. It gives the day's average temperature, dawn, dusk and which season it is. See [Seasons and day length](/pz/build-42/engine/weather-and-climate/seasons-and-day-length).
:::
:::card[ClimateValues]{accent=blue}
Turns the date plus a few simplex-noise waves into a "calm weather" baseline: temperature, wind, humidity, clouds, daylight, and a daily roll for fog. :cite[(`zombie/iso/weather/ClimateValues.java:190-322`)]
:::
:::card[ClimateManager]{accent=purple}
Copies those into its own values and runs the clock that updates them. :cite[(`zombie/iso/weather/ClimateManager.java:1338-1516`)]
:::
:::card[WeatherPeriod]{accent=orange}
Makes the rain. When the large-scale air mass flips sign, a period is built out of stages, and while it runs it pushes the values toward rainy ones. :cite[(`zombie/iso/weather/WeatherPeriod.java:1061-1154`)] See [Rain, snow, fog and wind](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind).
:::
:::card[ThunderStorm]{accent=cream}
Adds moving storm clouds that fire lightning and thunder during storm stages. :cite[(`zombie/iso/weather/ThunderStorm.java:149-213`)]
:::
::::

## What drives it

Ten drivers feed the climate: the date, four saved random offsets, three noise waves, a daily dice roll, the weather period, gusts, sandbox options and admin or mod overrides.

| Driver | What it is | Code |
|---|---|---|
| The date | The real calendar (months, leap years) from year 1993 on. It sets season, day length and the day's mean temperature. | :cite[(`zombie/erosion/season/ErosionSeason.java:277-448`)] |
| Four random offsets | Picked once when the world is created (`Rand.Next(0, 8000)` and friends) and saved. Every noise wave is read at a different spot of one big noise field, so two worlds get different weather. | :cite[(`ClimateManager.java:238-241`, saved at `:1584-1587`)] |
| Air mass noise | One slow wave, one unit of noise per 166 world hours by default (about 6.9 days). Its sign is the "front type". Its size is the front strength. | :cite[(`ClimateValues.java:252-259`, `ClimateManager.java:1306-1324`)] |
| Air mass temperature noise | The same wave, read 48 hours earlier. Adds up to plus or minus 8 degrees C to the season's mean. | :cite[(`ClimateValues.java:255`, `:261`)] |
| Wind noise | Two waves, one per 40 hours and one per 80 hours, for speed and direction. | :cite[(`ClimateValues.java:286-294`)] |
| Daily dice | A random generator seeded from the date and two of the offsets decides whether the day has morning fog and how strong. | :cite[(`ClimateValues.java:193-238`)] |
| Weather period | A list of stages built when the air mass flips. It overrides rain, clouds, wind, fog and temperature while it runs. | :cite[(`WeatherPeriod.java:531-777`)] |
| Gusts | A fast wiggle added on every client and in single player each frame, on top of the wind. | :cite[(`ClimateManager.java:1010-1025`)] |
| Sandbox options | `Rain`, `Temperature`, `ClimateCycle`, `FogCycle`, `DayLength`, `DayNightCycle` and more. See [Modding weather](/pz/build-42/engine/weather-and-climate/modding-weather). | |
| Admin and mods | Admin overrides and "modded" overrides on any value. | :cite[(`ClimateManager.java:2881-2896`)] |

Because the offsets and the date are the only inputs, the weather is deterministic: given the same world and the same date, the same stages come out. That is why the [forecast](/pz/build-42/engine/weather-and-climate/the-forecast-and-weather-ui) can be right.

## The sixteen outputs

The climate produces sixteen values, and everything else in the game asks for them through getters.

`ClimateManager` holds 13 floats, 2 colors and 1 boolean :cite[(`ClimateManager.java:131-153`; created in `setup`, `:289-325`)].

| Value | Range | Meaning |
|---|---|---|
| `TEMPERATURE` (4) | -80 to 80 (degrees C) | Outdoor air temperature. See [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors). |
| `PRECIPITATION_INTENSITY` (3) | 0 to 1 | How hard it is raining or snowing. 0 means nothing falls. |
| `IS_SNOW` (bool 0) | on or off | Whether the precipitation is snow. |
| `FOG_INTENSITY` (5) | 0 to 1 | How thick the fog is. |
| `WIND_INTENSITY` (6) | 0 to 1 | Wind speed as a fraction of 120 km/h (`MAX_WINDSPEED_KPH`, `:64`). |
| `WIND_ANGLE_INTENSITY` (7) | -1 to 1 | Wind direction, encoded. Degrees come from `getWindAngleDegrees` (`:537-556`). |
| `CLOUD_INTENSITY` (8) | 0 to 1 | Cloud cover. |
| `HUMIDITY` (12) | 0 to 1 | Muggy air. Fog adds 0.6 of its strength (`:1465`). |
| `NIGHT_STRENGTH` (2) | 0 to 1 | How dark it is, from the dusk-to-dawn ramp. |
| `DAYLIGHT_STRENGTH` (11) | 0 to 1 | How much daylight there is, lowered by clouds and rain. |
| `AMBIENT` (9) | 0 to 1 | The light level the lighting engine starts from. |
| `GLOBAL_LIGHT_INTENSITY` (1) | 0 to 1 | How strongly the global tint is applied. |
| `DESATURATION` (0) | 0 to 1 | How washed-out the picture looks. |
| `VIEW_DISTANCE` (10) | 0 to 100 | How far the engine considers things "visible", in tiles. Worked out on the server and in single player from fog and daylight (`:1518-1529`). |
| `GLOBAL_LIGHT` (color 0) | color | The sky tint, from season, time of day, clouds and fog. |
| `COLOR_NEW_FOG` (color 1) | color | The fog tint. Storms and tropical storms tint it. |

The lighting values (night, ambient, desaturation, global light, view distance) are the "look" half. Temperature, precipitation, fog, wind and humidity are the "gameplay" half. [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does) lists who reads each.

## When each part updates

The climate runs off the game clock, not the frame rate, so it speeds up when you fast-forward.

| How often | What happens | Code |
|---|---|---|
| Every frame | The final value of each float, color and boolean is recalculated from its layers. Gusts are added on clients and in single player. Thunder events tick. | :cite[(`ClimateManager.java:872-892`)] |
| Every game minute | The big "climate tick": `ClimateValues` is recomputed, the weather period advances, snow is updated, the Lua event `OnClimateTick` fires. Server and single player only for the math. | :cite[(`:815-826`, `:863-870`)] |
| Every game hour | A new air mass is checked. If its sign flipped, a weather period starts. The snow pile is settled for the hour. | :cite[(`:1346-1355`, `:1174-1183`)] |
| Every 10 game minutes | The server sends the whole climate state to every client. | :cite[(`:903-906`, `GameTime.java:635-637`)] |
| Every day | The 40-day forecast list shifts by one day. | :cite[(`:839-842`)] |

How long that is in real time depends on the **Day Length** option. At the default 1 hour 30 minutes, a game minute lasts 3.75 real seconds at normal speed, so the climate tick runs about every 4 seconds and the 10-minute packet goes out about every 37 seconds. The table of lengths is on the [seasons page](/pz/build-42/engine/weather-and-climate/seasons-and-day-length#how-long-a-game-day-lasts).

## How a final value is built

Each float has several layers, and the last step picks which layer wins: admin, then mod, then weather override, then the calm internal value.

Each float is a `ClimateFloat` with several layers. The last step, `calculate`, picks the winner :cite[(`ClimateManager.java:2881-2896`)]:

1. **Admin value.** If the admin override is on and this is not a client, the final value is the admin's number and nothing else matters.
2. **Modded value.** If a mod switched it on, the internal value is pulled toward the modded value by the modded interpolation each step.
3. **Weather override.** If the weather period (or a sandbox option) set an override, the final value is a blend between the internal value and the override. The blend amount is the "interpolate" number the stage sets, usually the stage's current strength.
4. **Otherwise** the final value is the internal value.

So a storm does not replace the calm weather; it leans on it. At strength 0.5 the temperature is halfway between the calm number and the storm's number. When the period ends, `resetOverrides` clears every override at once :cite[(`:1194-1206`)].

## Fronts and weather periods, briefly

Every game hour the manager checks the air mass, and when its sign flips it may build a weather period.

When it flips, the engine measures how strong the front that just ended was, taking the biggest of the last few daily samples :cite[(`CalculateWeatherFrontStrength`, `:2294-2313`; `AirFront.addDaySample`, `:2450-2480`)]. If the strength is at least 0.1 and no period is running, it builds a period from stages :cite[(`:1346-1356`, `WeatherPeriod.java:48`, `:396-411`)]. The rules for which stages come out, how long they last and how often are on the [rain page](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind). Two facts matter here:

- The pattern is seeded from the date, so it is repeatable :cite[(`WeatherPeriod.java:313-322`)].
- A period is not stopped by the next flip. A flip while one runs only updates the front type :cite[(`:1346-1356`)].

The sandbox **Rain** option changes the noise scale, so it changes how often the air mass flips (300, 240, 166, 145, 120 hours per noise unit for Very Dry to Very Rainy) :cite[(`ClimateManager.java:1306-1324`)], and how long the stages last (x0.5, x0.75, x1, x1.25, x1.5) :cite[(`:1326-1336`)].

## Which side runs it in multiplayer

**The server does the weather math and clients show what it sends.**

- `ClimateManager.update()` runs every tick on every side :cite[(`IsoWorld.java:3065`)], but the simulation steps are guarded by `!GameClient.client`: the climate tick, the weather period, the day-change forecast and the view distance run on the server and in single player only :cite[(`ClimateManager.java:839`, `:863-868`, `:889-897`)].
- A client keeps the last values the server sent and glides toward new ones (see below).
- Gusts (`updateWindTick`) run everywhere except a dedicated server :cite[(`:1010-1012`)], so each client has its own little wiggle on top of the shared wind.
- Weather periods are created and run only where `GameClient.client` is false :cite[(`WeatherPeriod.java:397`, `:1062`)]. Events such as `OnWeatherPeriodStart` therefore fire on the server and in single player, not on clients.

### The climate packet

All weather traffic is one packet type, `ClimateManagerPacket`, with a first byte that says which kind it is :cite[(`ClimateManager.java:174-181`, `PacketTypes.java:512`)].

| Type | Name | Direction | Carries | Code |
|---|---|---|---|---|
| 0 | UpdateClimateVars | server to clients | The final value of all 13 floats, 2 colors and the boolean, plus air mass, snow, wind power, today's fog, and the weather period summary. Sent every 10 game minutes and after most admin actions. | |
| 1 | WeatherUpdate | server to clients | The weather period summary only: running, storm kind, strength, duration, progress. Sent when a period starts, ends or is stopped. | |
| 2 | ThunderEvent | server to clients | One lightning or thunder event: x, y, and three flags. | |
| 3 | Flare | none found | Only the type byte. Nothing in the code sends it; `launchFlare` works locally. | :cite[(`:1291-1304`)] |
| 4 | AdminVarsUpdate | server to clients | The admin override flags and values. | |
| 5 | RequestAdminVars | client to server | A request for type 4. | |
| 6 | ClientChangedAdminVars | client to server | New admin override flags and values. | |
| 7 | ClientChangedWeather | client to server | Stop weather, trigger a storm, tropical storm or blizzard with a duration, or generate a front with a strength and type. | |

The packet is written and read by the manager :cite[(`ClimateManager.java:1767-1868` for writing, `:1879-2008` for reading)]. The packet is registered with the `ClimateManager` capability :cite[(`PacketTypes.java:512`)]; where that is enforced was not traced. The admin tools only offer the button to roles that have it :cite[(`media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua:228`)]. Types 5 to 7 are ignored unless the receiver is a server :cite[(`:1960-2005`)].

### How a client follows the server

A client slides toward each new server value over about 5 seconds instead of jumping.

When type 0 arrives the client sets each value's internal number to what it was showing, stores the new server number as an override with zero blend, and then raises the blend from 0 to 1 over the next 5 seconds :cite[(`ClimateManager.java:1886-1931`, `:844-861`)]. If packets arrive faster than the glide takes, the glide shortens (down to 0.5 seconds) :cite[(`:1913-1929`)]. The result is that fog, wind and light slide smoothly instead of jumping every 10 game minutes. The server also sends the full state to a player who joins :cite[(`sendInitialState`, `:2325-2333`; `GameServer.java:2949-2954`)] and the puddle map every 10 real seconds :cite[(`ClimateManager.java:912-914`, `PUDDLES_BROADCAST_INTERVAL_MS`, `:60`)].

An older trio of packets, `StartRain`, `StopRain` and `Weather`, still exists. `Weather` carries dawn, dusk, moon, ambient limits, a weather word and the erosion state :cite[(`WeatherPacket.java:28-55`)]. The `StartRain` and `StopRain` packets drive the old `RainManager`, which now just mirrors the climate :cite[(`RainManager.java:255-257`, `:299-302`)].

## What is saved

The climate rides inside `map_t.bin`, the same file as the clock, and a client does not save it.

`GameTime.save` ends by calling `ClimateManager.save` :cite[(`GameTime.java:1122`; file name `:1058`, `:1067`)]. A client does not save climate state :cite[(`ClimateManager.java:1581-1583`)]. A server or single-player save keeps:

- the four noise offsets, so the weather continues the same after a reload :cite[(`:1584-1587`)];
- the current front, snow pile, today's fog flag and strength :cite[(`:1588-1592`)];
- the weather period in full: stage list, current stage, strength and cloud color :cite[(`WeatherPeriod.java:1162-1188`)];
- the storm clouds :cite[(`ThunderStorm.java:461-486`)];
- on a server, the admin overrides :cite[(`ClimateManager.java:1597-1612`)];
- the climate's own `modData` table, if a mod used it :cite[(`:1616-1620`)].

`getClimateManager():getModData()` is therefore a free place to keep your own climate-related numbers across saves :cite[(`:686-692`)].

## Odd corners

Five parts of the code look finished but are not used the way the names suggest.

- **`OnRainStart` and `OnChangeWeather` never fire.** `OnRainStop` is the only one of the three that has a trigger in the code, and it comes from the old `RainManager` :cite[(`RainManager.java:267`)]. Use the `OnWeatherPeriod...` events instead :cite[(`api/events.md`)].
- **The "day temperature" is not used.** `ClimateValues` reads `getDayTemperature()` and compares it with the mean, then does nothing with the result :cite[(`ClimateValues.java:258-260`)]. The temperature comes from the mean plus the air mass wave only.
- **Two lag values are the same.** The manager stores `nightLagged` as a copy of `dayLightLagged` :cite[(`ClimateManager.java:1378-1379`)]. That changes the temperature on upper floors (see the temperature page).
- **`updateOLD` is dead code.** The file keeps a second copy of the update loop that nothing calls :cite[(`:1027-1118`)].
- **Season 3 never happens.** The season table has six slots, but the model only ever picks four of them (see the seasons page).

## What a mod can do here

Read everything through `getClimateManager()`, change weather on the server, and hook the events.

The full list, a working example and the multiplayer rules are on [Modding weather](/pz/build-42/engine/weather-and-climate/modding-weather).

:::callout[How we know]{kind=proof}
All of this is read from the 42.22 code; nothing was run in a game. The tables of real-time lengths are derived from the code's formulas. Not verified:
- Where the server checks the `ClimateManager` capability for packet types 5 to 7. The registration is cited above; the check was not followed.
- How the `QueuePacket` that carries the base temperature on login uses it (`zombie/network/packets/connection/QueuePacket.java:110`).
:::
