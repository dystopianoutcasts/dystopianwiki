---
id: build-42-the-forecast-and-weather-ui
slug: the-forecast-and-weather-ui
title: 'The forecast, the emergency radio and the weather tools'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: intermediate
tags:
  - engine
  - weather
  - forecast
  - radio
  - admin
  - debug
excerpt: >-
  How far ahead the emergency radio can see the weather, how accurate it is, and what the admin and debug weather windows and commands can do.
last_updated: '2026-11-14'
related_articles:
  - how-weather-works
  - seasons-and-day-length
  - rain-snow-fog-and-wind
  - temperature-outdoors
  - what-weather-does
  - modding-weather
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#the-automated-emergency-broadcast-system) | [server owners](#weather-commands-for-admins) | [modders](#the-forecaster)

:::callout[The 1-minute version]{kind=key}
- The voice on the emergency band is not guessing. The game has a forecaster that replays the same weather rules ahead of time, and a Lua script that reads the result out.
- The forecaster keeps 40 days: 10 days ago to 29 days from now. The radio only reads today, tomorrow and a warning for days 2 to 5.
- By reading the code, the timing, type and stage list of a front are exact when nothing changes; the temperature, rain amounts and wind direction are only approximate. We did not test this in a game.
- A day is sampled once, when it is 29 days away, so the forecast you hear can miss a season change or an admin action during the same run. A restart rebuilds it.
- Admins need a capability to run weather commands, and `/startrain` stays until you `/stoprain` or `/stopweather`.
:::

:::facts
- **Forecast span** 40 days (index 10 is today)
- **Radio** a new broadcast every game hour; frequency picked at random between 88,000 and 108,000
- **Forecast lead time** 29 game days
- **Weather static** 35 percent of words times strength in rain; 70 percent in a storm
- **Admin Weather tab slider** 4 to 240 hours, real length 2 hours longer
:::

Nothing here was run in a game. The accuracy claims come from reading how the forecaster is built; they are marked as such. This page covers the forecaster, the radio script that reads it out, and the windows and commands that let an admin override them.

## The forecaster

`ClimateForecaster` keeps 40 days of forecast by replaying the live weather rules for future dates.

It keeps **40 days**, from 10 days ago to 29 days from now :cite[(`zombie/iso/weather/ClimateForecaster.java:20`, `:31-33`)]. Day index 10 is today. It is built when the world loads :cite[(`:44-59`)], and each new game day the list slides by one: the oldest day falls off and a new day, 29 days ahead, is added at the end :cite[(`:61-76`)]. That slide, and the day sampling behind it, run on the **server and in single player** only :cite[(`ClimateManager.java:839-842`)].

How a day is made :cite[(`sampleDay`, `:78-202`)]:

1. It walks the day hour by hour, asking the climate's own formulas (`ClimateValues.pollDate`) for the temperature, humidity, wind and clouds at each hour. These are the same functions the live climate uses, for a date in the future.
2. Whenever the air mass flips sign it asks for the front strength, using the same function the live climate uses :cite[(`CalculateWeatherFrontStrength`, `:104-109`)]. If the strength is at least 0.1 and no earlier forecast period still covers that hour, it builds a *dummy* weather period for the day :cite[(`:110-118`)].
3. A dummy period is a real `WeatherPeriod` that never touches the sky. It uses the same date-seeded random generator :cite[(`WeatherPeriod.java:313-322`)], so it makes the same stage list the live one will.
4. For each hour inside a period, the forecast adjusts temperature, wind and clouds by stage :cite[(`:132-176`)] and notes which stages occur.
5. It records the day's fog flag, strength and duration from the same daily roll :cite[(`:199-201`)].

### What a day's forecast holds

A day's forecast holds weather numbers, flags for which stages occur, and the fog and daylight values.

| Field | Meaning | Code |
|---|---|---|
| `getTemperature`, `getHumidity`, `getWindPower`, `getCloudiness`, `getWindDirection` | For each, the day, night and total minimum, maximum and mean. "Day" is the hours between dawn and dusk. | :cite[(`ForecastValue`, `:400-529`)] |
| `getAirFrontString` | `WARM` or `COLD`, the air mass at midnight. | :cite[(`:96-98`)] |
| `isWeatherStarts`, `getWeatherStartTime` | A period begins today, and at which hour. | |
| `getWeatherOverlap`, `getWeatherEndTime` | An earlier period is still running, and when it ends today. | |
| `isHasHeavyRain` | A showers or heavy-precipitation stage occurs (both set this flag; the radio text says "showers and or heavy rain"). | |
| `isHasStorm`, `isHasTropicalStorm`, `isHasBlizzard` | Those stages occur. | |
| `isChanceOnSnow` | A blizzard stage occurs, or the temperature drops below 0. | :cite[(`:164-165`, `:182-184`)] |
| `isHasFog`, `getFogStrength`, `getFogDuration` | The day's fog roll. | |
| `getDawn`, `getDusk`, `getDayLightHours` | From the season model. | |
| `getWeatherStages` | The list of stage ids seen. | |

Lua can reach all of this: `getClimateManager():getClimateForecaster()` gives `getForecast()` (today), `getForecast(offset)` (0 is today, negative is past, up to 29) and `getForecasts()` (all 40) :cite[(`ClimateForecaster.java:23-33`)].

`getDaysTillFirstWeather()` does not return days. It returns the **index** of the first day that has a period, and today is index 10, so "tomorrow" comes back as 11 :cite[(`:225-233`)]. Subtract 10. When no day has a period it returns -1, and subtracting 10 then gives -11, so test for -1 first.

`ClimateHistory`, the class next to it, is an empty stub :cite[(`zombie/iso/weather/ClimateHistory.java:12-18`)].

### How far ahead, and how accurate

The forecast reaches 29 days ahead, and by reading the code it is exact about when and what, but only approximate about how warm, how hard and which way.

**Reach:** 29 days of forecast exist. The radio only reads today, tomorrow and a warning for the next five (below). The debug window shows all 40.

**Accuracy, by reading the code.** The forecast replays the real thing, so these are exact when nothing changes:

- When a front arrives (the hour), its type and strength, the list of stages, and which are storms, tropical storms and blizzards.
- The day's fog: whether there is one, how strong, how long.
- Dawn, dusk and day length.

And these are only approximate:

| What | Why | Code |
|---|---|---|
| **Temperature** | It is the calm temperature minus a fixed shift for every stage, including the type -1 fronts that warm the real air; the shift is also smaller than the real one: for example a heavy-precipitation stage shifts the forecast by `-3.5 x s` degrees, while the real weather shifts by up to `-7 x s`. Expect the real air to be colder than forecast in a strong front. | :cite[(`ClimateForecaster.java:152-157`; `ClimateForecaster.java:152-157`, `WeatherPeriod.java:1097-1102`)] |
| **Rain amounts** | The forecast has no rain intensity at all. It says which stages happen, not how hard it rains inside them (the live value comes from a noise wave). | |
| **Wind direction** | The forecast takes the wind direction from the front (or the climate's direction noise), but the live sky uses a different wave. The two do not agree. Treat the direction as flavor. | :cite[(`ClimateForecaster.java:129`, `:135`; `ClimateManager.java:537-556`)] |
| **Anything that changes after it was made** | See the next paragraph. | |

**The lead time matters, within one run.** A day is sampled once, when it is 29 days away, and not again while the game keeps running. So when you hear "today" on the radio, that forecast was computed 29 game days ago, and "tomorrow" 28. If something changed in between, the forecast does not know. But the forecaster is never saved: `ClimateManager.init` builds all 40 days again on every world or server load :cite[(`ClimateManager.java:792-802`, `ClimateForecaster.java:44-59`)]. After a restart the list is fresh, made with the season and options of that moment. The caveats below hold only for one uninterrupted run:

- **A season change.** A period is built with the *current* season's storm, tropical and blizzard odds and time multiplier :cite[(`WeatherPeriod.java:534-543`)]. A forecast for a day just after a season boundary was computed under the old season's table. After autumn turns to winter, for up to a month of uninterrupted play the radio may promise thunderstorms that winter's table will not make, and may miss early blizzards (autumn has no blizzard chance).
- **A sandbox change.** If an admin changes the **Rain** option, **Climate Cycle** or **Temperature** during the run, the forecast for the next 29 days stays as it was until the next load.
- **Admin and mod actions.** A forced storm, "stop weather" or a modded stage is invisible to it.
- **The period that is already running when you load a save.** It is not part of the forecast list.

I did not test any of this in a game; it follows from the code's design.

**On a multiplayer client** the forecaster is built when the client connects and never slides, because the daily update is skipped on clients :cite[(`ClimateManager.java:839`)]. The radio script is in the server Lua folder :cite[(`media/lua/server/radio/ISWeatherChannel.lua`)], so players most likely hear the server's forecast; I did not trace how the broadcast reaches clients (not verified). That a client's own forecaster only feeds its debug window is also not verified: I found no other reader in vanilla Lua.

## The Automated Emergency Broadcast System

The weather on the radio is one dynamic channel that reads the forecast out every game hour.

It is made by two vanilla Lua files, `media/lua/server/radio/ISDynamicRadio.lua` and `ISWeatherChannel.lua`. See [Radio and television](/pz/build-42/modding/engine/radio-and-television) for how channels work.

- **Name and band.** "Automated Emergency Broadcast System", category Emergency, id `EMRG-711984`. Its frequency is picked at random between 88,000 and 108,000 when the world is created, and saved in the clock's `modData` so it stays the same :cite[(`ISDynamicRadio.lua:15-24`, `:63-83`)].
- **Schedule.** The channel gets a new broadcast on every game hour, from `OnEveryHour` :cite[(`ISWeatherChannel.lua:88-96`)].
- **Where it runs.** On the server and in single player (it is in the server Lua folder).
- **Which devices tune it.** Not checked: that depends on the radio device and frequency data, which is outside the Lua files.

Each broadcast is built in this order :cite[(`ISWeatherChannel.lua:112-138`)]:

1. The intro line, then possible static ("bzzt", "fzzt" or "wzzt", each with a 2 in 11 chance; the static roll is repeated between the parts below).
2. A **power notice**, in the two days before the grid shuts off and after it :cite[(`:152-164`)].
3. A **random chatter line** about sectors and activity: this roll happens twice per broadcast (here and after the forecast), each time about a 20 percent chance, with a small extra chance of nine rare lines :cite[(`:122`, `:130`, `:350-395`)].
4. **Today's forecast** :cite[(`:166-177`)].
5. **Tomorrow's forecast**.
6. **A severe weather warning** if a storm, tropical storm or blizzard is coming on days 2 to 5, naming the first one and "ETA n days" :cite[(`:327-348`)].
7. A helicopter line on the day of the helicopter event :cite[(`:132-135`)].

A day's forecast is up to five lines :cite[(`:179-201`, `:203-310`)]:

| Line | Contents |
|---|---|
| Temperature | Average, minimum, maximum, and humidity percent, in the unit chosen in your options. |
| Wind and sky | A word for the mean wind (up to 0.25 "Mild", to 0.5 "Moderate", to 0.75 "Strong", above that "Storm-strength"), the direction as a zone, the maximum speed, and a cloud phrase (mean above 0.7 heavy cloud, above 0.4 "some clouds", otherwise clear, with "periodical cloudy spells" or "periods of heavy cloud" if the maximum is high). |
| Fog | Only if the day has fog, and for today only before noon. Strength 1.0 "Very thick fog", above 0.75 "Thick fog", otherwise "Light fog". |
| Weather start | If a period starts that day: "WARNING: Period of weather predicted to start in the (night, early morning, morning, afternoon, evening)", with a list of "showers and or heavy rain", "thunderstorm", "tropical storm", "blizzard", or "light to moderate rain", and "with a chance of snowfall" if it applies. |
| Weather overlap | If a period carries over: "Weather continues throughout the day" or "predicted to end in the ...". |

Spoken wind speeds use kilometers per hour or miles per hour by your temperature-display option. The wind direction label on the radio is the forecaster's, so, as above, it may not match the wind you see.

**Weather static.** While a weather period runs, a radio (not a television) scrambles words in what it plays, so the emergency channel itself crackles in the rain (see [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does#radios-and-the-weather-channel)).

## Weather commands for admins

Admins can start and stop rain, storms and thunder with chat or server-console commands, if their role has the right capability.

These are chat or server-console commands, one class each :cite[(`zombie/commands/serverCommands/`)]. They need the `StartStopRain` capability, which the default `gm`, `moderator` and `admin` roles have :cite[(`zombie/characters/Roles.java:440`, `:455-457`, `:474-476`)].

| Command | What it does | Code |
|---|---|---|
| `/startrain [percent]` | Sets precipitation to the given percent (default 100) as an admin override and sends it to all clients. | :cite[(`StartRainCommand.java:40-54`)] |
| `/stoprain` | Removes that precipitation override. | :cite[(`StopRainCommand.java:34-39`)] |
| `/startstorm [hours]` | Stops current weather, then starts a storm stage of the given length (default 24). | :cite[(`StartStormCommand.java:40-55`)] |
| `/stopweather` | Removes the precipitation override and stops the weather period and thunder clouds. | :cite[(`StopWeatherCommand.java:34-40`)] |
| `/thunder [user]` | A rumble at that player (yourself by default). No flash. | :cite[(`ThunderCommand.java:41-64`)] |
| `/lightning [user]` | A flash and a rumble at that player. | :cite[(`LightningCommand.java:60`)] |

The `/startrain` override is an admin value, so it **stays** until you `/stoprain` or `/stopweather`; ordinary weather periods do not remove it :cite[(`ClimateManager.java:2065-2080`, `:2881-2884`)].

## The admin window: Climate Control

The admin panel's Climate Control window lets a role with the `ClimateManager` capability override each weather value or start a single stage.

The button is enabled for roles with the `ClimateManager` capability (default `moderator` and `admin`) :cite[(`media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua:125-131`, `:228`, `:353-356`)]. It opens a window with two tabs :cite[(`ISAdminWeather.lua:21-22`)].

**Climate tab** (`ISAdmPanelClimate.lua`): one row per value with a checkbox and a slider. A checked row is an **admin override** (the top layer in [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works#how-a-final-value-is-built)), and **Apply** sends them all to the server :cite[(`:470-486`)].

| Row | Range | Code |
|---|---|---|
| Windspeed | 0 to 120 km/h | :cite[(`:32-40`)] |
| Clouds | 0 to 0.35 | :cite[(`:43-52`)] |
| Fog | 0 to 1 | :cite[(`:54-62`)] |
| Precipitation | 0 to 1 | :cite[(`:65-73`)] |
| Precipitation is snow | checkbox | :cite[(`:76`)] |
| Temperature | -40 to +40 C (the slider is 0 to 80, shown minus 40) | :cite[(`:80-90`, `:319`)] |
| Darkness | 0 to 1 (sets daylight to the opposite) | :cite[(`:94-102`)] |
| Sky light color | red, green, blue and alpha, 0 to 255, for outside and for inside | :cite[(`:105-205`)] |
| Desaturation | 0 to 1 | :cite[(`:212-220`)] |

Overrides stay until unchecked and applied. They are saved with the world :cite[(`ClimateManager.java:1597-1612`)].

**Weather tab** (`ISAdmPanelWeather.lua`):

| Control | What it does | Code |
|---|---|---|
| Stop Weather | Ends the current period and thunder. | :cite[(`:163-168`)] |
| Duration slider, then Storm / Tropical / Blizzard | Starts that single stage. The slider runs from 4 to 240 hours; the real length is 2 hours longer, because a start stage and a clearing stage of 1 hour each are added. | :cite[(`:64-73`, `:144-146`, `:169-189`; `WeatherPeriod.java:506-529`)] |
| Strength slider (0.1 to 1), Warm or Cold front, Generate | Builds a full random period of that strength. "Warm front" is the rainy type 1; "cold front" the light type -1. | :cite[(`:77-96`, `:190-197`)] |
| Total and stage progress bars | Show how far the running period is. | |

In multiplayer these go to the server as packet type 7, and the server stops the current weather before it triggers the new one :cite[(`ClimateManager.java:2019-2040`, `:2090-2130`)]. In single player they call the trigger directly, which refuses to start while a period is running, so press Stop Weather first :cite[(`ClimateManager.java:1247-1271`)].

## The debug weather tools

In debug mode the debug menu has a Climate button that opens a window with six tabs and a set of viewers.

The **Climate** button is in the debug menu :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:20`)]. It opens `ClimateControlDebug` with six tabs :cite[(`DebugUIs/DebugMenu/Climate/ClimateControlDebug.lua:22-30`)]: Climate, New Fog, Colors, Weather (the same panel as above), Puddles and Other. Other holds the viewers :cite[(`ClimDebuggersPanel.lua:9-24`)]:

| Viewer | Shows | Code |
|---|---|---|
| Forecaster | The 40-day forecast list. | |
| Weather FX | The live weather effects. | |
| Player temperature | The values the thermoregulator is reading. | |
| Thermoregulator | The body model. See [Body temperature](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator). | |
| Daily values | Today's season values: dawn, dusk, mean temperature, season progress. | |
| Climate plot | Charts of the climate values over time. | |
| Weather plot | Charts of the running period. | |
| Thunder | The storm clouds and their strike events. | |
| Wind tick | The gust wave. | |
| Simulation tests | Runs the generator for a full year 5,000 times at the current or a forced Rain option and logs the result (debug mode only). | :cite[(`ClimateManager.java:2209-2226`)] |

**The Trigger Thunder window.** Admins also have a right-click admin menu entry that opens a small window: pick a player (or All) and press the button, and the server fires a strike, a flash and a rumble at that square :cite[(`media/lua/client/DebugUIs/AdminContextMenu.lua:17`, `ISTriggerThunderUI.lua:31-39`, `media/lua/server/ClientCommands.lua:677-688`)]. That server function has no role check inside it; whether the client-command path checks the role elsewhere was not traced.

The `Daily values` and `Forecaster` windows are the quickest way to check a number from these pages against a real game: open them and compare with the tables.

## Odd corners

A few things are worth remembering.

- **The forecast is made 29 days before you hear it.** A change during the same run does not show; a restart rebuilds it.
- **`getDaysTillFirstWeather` is off by 10.**
- **`/startrain` outlasts the weather period.**
- **The weather icon is gone.** The old Lua that drew a weather icon and moon icon is commented out :cite[(`media/lua/server/Seasons/season.lua:358-375`)].

:::callout[How we know]{kind=proof}
Nothing here was run in a game; the accuracy claims come from reading how the forecaster is built. Not verified:
- Whether the forecast really misses a season change in practice, within one run. I read the code path but did not run a game across a boundary.
- Which radios and televisions can tune the emergency band, and whether television shows carry a weather segment.
- Whether the `ClimateManager` capability is checked on the server for packet types 5 to 7, or only the client hides the button.
:::
