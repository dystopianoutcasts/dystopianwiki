---
id: build-42-modding-weather
slug: modding-weather
title: 'Modding weather: read it, hook it, change it'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: advanced
tags:
  - engine
  - modding
  - weather
  - lua
  - multiplayer
  - sandbox
excerpt: >-
  Read the climate from Lua, hook the weather events, start and stop weather and build your own stage, with worked examples (not run in a game) and which side must do each in multiplayer.
last_updated: '2026-11-15'
related_articles:
  - how-weather-works
  - seasons-and-day-length
  - rain-snow-fog-and-wind
  - temperature-outdoors
  - what-weather-does
  - the-forecast-and-weather-ui
  - erosion
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders reading the weather](#read-the-weather-a-complete-small-example) | [modders changing it](#change-the-weather) | [server owners](#what-a-server-admin-can-do)

:::callout[The 1-minute version]{kind=key}
- Reading the weather is easy and works on every side: get the climate with `getClimateManager()` and call its getters.
- The server decides the weather. A change made on a client is replaced by the server's values within about 5 seconds, so start and stop weather on the server or in single player.
- Hook `OnWeatherPeriodStart` and `OnClimateTick`, not `OnRainStart` or `OnChangeWeather`: the engine and vanilla Lua never trigger those two.
- A mod can pin a value with the modded layer or the admin layer, or build a period with its own stage, but the formulas are fixed in Java.
- None of the examples was run in a game; they are checked against the exposed API and the engine code they call.
:::

:::facts
- **Client glide** up to 5 seconds; server sends values every 10 game minutes
- **Climate tick event** `OnClimateTick` every game minute (once per 3.75 real seconds at the default day length)
- **Modded stage id** 10
- **Start stage** 1 hour (about 3.75 real minutes at the default day length)
- **Sandbox `DayLength`** 1 to 27, default 4 (1 h 30)
:::

If you want a mod that warns you before the fog rolls in, a server event that calls a storm on the first of the month, or a winter that never melts, the weather is a good place to start. Reading it is easy. Changing it is allowed, but there is one rule that catches everyone: **the server decides the weather.** This page shows the working example first, then the full list of what you can touch.

Nothing here was run in a game. The examples are checked against the exposed API (`api/lua_exposed.jsonl`) and against the code they call, not played. The Not verified list at the end says what that means.

## Read the weather: a complete small example

This example shows a one-line weather report over your character's head when you press F9, and it works in single player and on a multiplayer client.

Goal: press **F9** and see a one-line weather report floating over your character's head, and in `console.txt`. It works on a client because reading the climate is allowed on every side.

**Set up the mod first.** Follow the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): a mod folder with a mandatory (even if empty) `common/` folder and a `42/` folder holding `mod.info`. For this mod, while developing:

```
Zomboid/Workshop/WeatherReport/
  Contents/
    mods/
      WeatherReport/
        common/                       <- must exist; empty is fine
        42/
          mod.info
          media/
            lua/
              client/
                WeatherReport.lua     <- the example below
```

`mod.info` (plain text, every key lowercase, no hidden `.txt` ending):

```
name=Weather Report
id=WeatherReport
description=Press F9 for a one-line weather report.
```

**Why the `client` folder?** The report is for one player's screen, and the climate values are readable on a client (a client holds the server's latest values). A file in `client/` runs on the machine that shows it.

Now the script:

```lua
-- 42/media/lua/client/WeatherReport.lua
-- Press F9 to see the weather. F10 is the screenshot key, so we use F9.
-- (If you rebound your keys, pick another constant from the Keyboard table.)

local REPORT_KEY = Keyboard.KEY_F9

-- One word for the sky. Each getter returns a number from 0 to 1, or a boolean.
local function skyWord(cm)
    if cm:isSnowing() then return "snowing" end
    if cm:isRaining() then return "raining" end
    if cm:getFogIntensity() > 0.2 then return "foggy" end
    if cm:getCloudIntensity() > 0.5 then return "overcast" end
    return "clear"
end

local function weatherReport()
    local player = getPlayer()          -- the first local player
    if not player then return end

    local cm = getClimateManager()      -- the climate; same object on every side

    -- Numbers are joined with .. instead of string.format to keep it simple.
    local wind = math.floor(cm:getWindspeedKph() + 0.5)      -- km/h, rounded
    local text = cm:getSeasonNameTranslated()
        .. ", " .. Temperature.getTemperatureString(cm:getTemperature())
        .. ", " .. skyWord(cm)
        .. ", wind " .. wind .. " km/h"
        .. ", moon: " .. getClimateMoon():getPhaseName()

    player:setHaloNote(text)            -- floating text over the head, local only
    print("[WeatherReport] " .. text)   -- also goes to console.txt
end

local function onKeyPressed(key)
    if key == REPORT_KEY then
        weatherReport()
    end
end

Events.OnKeyPressed.Add(onKeyPressed)
```

Line by line:

- `Keyboard.KEY_F9` is a number the game exposes for every key :cite[(`zombie/Lua/LuaManager.java:1518-1531`)]. F10 is the vanilla screenshot key and F11 the Lua debugger :cite[(`media/lua/shared/keyBinding.lua:191`, `:357`)], so F9 is free in vanilla.
- `getClimateManager()` is a global function that returns the one `ClimateManager`, and `getClimateMoon` is exposed the same way :cite[(`zombie/Lua/LuaManager.java:11512`; `getClimateMoon` is at `:11520`)].
- `isSnowing`, `isRaining`, `getFogIntensity`, `getCloudIntensity`, `getWindspeedKph`, `getTemperature` and `getSeasonNameTranslated` are exposed :cite[(`ClimateManager.java:594-606`, `:497`, `:521`, `:517`, `:477`, `:776`)]. `getTemperature()` is the outdoor air temperature in degrees C.
- `Temperature.getTemperatureString(celsius)` writes it in the unit the player chose, with the unit sign :cite[(`zombie/iso/weather/Temperature.java:65-74`)]. The emergency radio script uses it the same way :cite[(`media/lua/server/radio/ISWeatherChannel.lua:209`)].
- `getClimateMoon():getPhaseName()` is "New", "Full" and the others :cite[(`ClimateMoon.java:48-50`)].
- `setHaloNote(text)` shows green floating text over the character on this machine only :cite[(`zombie/characters/IsoGameCharacter.java:6998-7016`)].
- `Events.OnKeyPressed.Add(fn)` calls `fn(keyNumber)` when a key is released, despite its name; `OnKeyStartPressed` is the key-down event :cite[(`zombie/input/GameKeyboard.java:43-58`)]. Vanilla listens the same way :cite[(`media/lua/client/Chat/ISChat.lua:1178`)].

**What you should see:** load a save, press F9, and a green line appears above your head, for example `Early Summer, 24.6 C, clear, wind 11 km/h, moon: Waxing gibbous`. It also appears in `console.txt` with the `[WeatherReport]` tag. If nothing happens, search the console log for errors; a likely cause is a wrong folder layout (for example a missing `common/` folder), so the mod never loads.

**Make it your own:** change the key, or call `weatherReport()` from `Events.EveryHours.Add(weatherReport)` to get a report every game hour.

### A second hook: warn about thunder

The engine tells every client when lightning or thunder happens, with where and what kind, and you can hook it.

In the same file, or a new one:

```lua
-- 42/media/lua/client/ThunderWarn.lua
-- Tell the player how far away a thunder strike was.

local function onThunder(x, y, doStrike, doLightning, doRumble)
    local player = getPlayer()
    if not player or not doStrike then return end   -- only real strikes, not rumbles

    local dx = player:getX() - x
    local dy = player:getY() - y
    local distance = math.floor(math.sqrt(dx * dx + dy * dy))   -- in tiles

    if distance < 2000 then
        player:setHaloNote("Thunder, " .. distance .. " tiles away")
    end
end

Events.OnThunderEvent.Add(onThunder)
```

`OnThunderEvent(x, y, doStrike, doLightning, doRumble)` fires on every client and in single player, not on a dedicated server :cite[(`zombie/iso/weather/ThunderStorm.java:378-389`, `:399-409`)]. The flash and sound are handled by the engine; your handler only adds a message. To test it, wait for a storm, or open the Trigger Thunder debug window (see the [tools page](/pz/build-42/engine/weather-and-climate/the-forecast-and-weather-ui)), which fires a strike.

The `/lightning` command will not do: it sends `doStrike = false` :cite[(`zombie/commands/serverCommands/LightningCommand.java:60`)], so the handler returns early. During a storm you will see it every so often (the event rate is on the [rain page](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind#storms-thunder-and-lightning)).

## What you can read

Everything public on `ClimateManager` is callable from Lua.

That includes every getter in the table below :cite[(`api/lua_exposed.jsonl`; source lines in `api/api.jsonl`)].

| You want | Call |
|---|---|
| Air temperature (C), and the version without time of day | `getTemperature()`, `getBaseTemperature()` |
| Air temperature at a character or square (indoors, vehicle, wind chill) | `getAirTemperatureForCharacter(char, doWindChill)`, `getAirTemperatureForSquare(square, vehicle, doWindChill)` |
| Rain or snow | `isRaining()`, `isSnowing()`, `getRainIntensity()`, `getSnowIntensity()`, `getPrecipitationIntensity()`, `getPrecipitationIsSnow()` |
| Snow on the ground | `getSnowStrength()` (0 to 10), `getSnowFracNow()` (0 to 1) |
| Fog, clouds, humidity | `getFogIntensity()`, `getCloudIntensity()`, `getHumidity()` |
| Wind | `getWindIntensity()` and `getWindPower()` (0 to 1), `getWindspeedKph()`, `getWindAngleDegrees()`, `ClimateManager.getWindAngleString(deg)`, `ToKph(x)`, `ToMph(x)` |
| Light | `getDayLightStrength()`, `getNightStrength()`, `getAmbient()`, `getViewDistance()`, `getGlobalLight()` |
| Season | `getSeasonName()`, `getSeasonNameTranslated()`, `getSeasonId()`, `getSeasonProgression()`, `getSeasonStrength()`, `getSeason()` (the `ErosionSeason` with `getDawn()`, `getDusk()`, `getDayMeanTemperature()`, `isSeason(n)`) |
| Day info | `getCurrentDay()`, `getPreviousDay()`, `getNextDay()` (each has `getDay()`, `getMonth()`, `getSeason()`) |
| The weather period | `getWeatherPeriod()` then `isRunning()`, `getCurrentStageID()`, `getCurrentStrength()`, `getTotalProgress()`, `isThunderStorm()`, `isTropicalStorm()`, `isBlizzard()`, `getFrontType()`, `getWindAngleDegrees()` |
| Storms | `getThunderStorm()` then `getClouds()`, `HasActiveThunderClouds()`; `getIsThunderStorming()` |
| The forecast | `getClimateForecaster()` then `getForecast(offset)` (see the [forecast page](/pz/build-42/engine/weather-and-climate/the-forecast-and-weather-ui)) |
| The moon | `getClimateMoon()` then `getPhaseName()`, `getCurrentMoonPhase()`, `getMoonFloat()` |
| Saved notes | `getModData()` |
| The raw layers of one value | `getClimateFloat(ClimateManager.FLOAT_TEMPERATURE)` then `getInternalValue()`, `getFinalValue()`, `getOverride()`, `getAdminValue()`, `getModdedValue()` |

Two more global shortcuts: `getWorld():getGlobalTemperature()` is the same as `getTemperature()` :cite[(`zombie/iso/IsoWorld.java:3165`)], and `getPuddlesManager()` gives the puddle map :cite[(`api/lua_globals.jsonl`)].

**Traps when reading:**

- `getSeasonName()` returns `Early Summer`, never `Summer`. Test `getSeasonId() == 2` or `getSeason():isSeason(2)` ([Seasons](/pz/build-42/engine/weather-and-climate/seasons-and-day-length)).
- On a client, values glide toward the server's numbers over up to 5 seconds, and the server sends them every 10 game minutes, so a client's reading can be up to about 10 game minutes old (see [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works)).
- `getDaysTillFirstWeather()` returns an index that is 10 too high.
- `getEnabledSimulation()` and friends tell you whether somebody has frozen the climate.

## Events

Hook `OnClimateTick` for per-minute checks and the `OnWeatherPeriod...` events; `OnRainStart` and `OnChangeWeather` never fire.

Event names are in `api/events.md`; where they fire is in the source.

| Event | Fires | Side | Use |
|---|---|---|---|
| `OnClimateManagerInit(climate)` | When the climate object is created, before the world is ready | all | Set sky and fog colors (below). Vanilla does this in `media/lua/server/Climate/ClimateMain.lua:14-159`. |
| `OnClimateTick(climate)` | Every game minute | all, including a dedicated server | Cheap per-minute checks. (At the default day length, once per 3.75 real seconds.) |
| `OnInitSeasons(season)` | When the season model is built | all | Reshape latitude, temperatures, rain per month; see [Erosion](/pz/build-42/modding/engine/erosion). |
| `OnWeatherPeriodStart(period)` | A period begins | server, single player | Announce it, log it, count it. |
| `OnWeatherPeriodStage(period)` | A stage ends and the next begins | server, single player | |
| `OnWeatherPeriodComplete(period)` | The last stage ended | server, single player | |
| `OnWeatherPeriodStop(period)` | The period was stopped by something | server, single player | |
| `OnInitModdedWeatherStage(period, stage, strength)` | A modded stage (id 10) is created | server, single player | Set the stage's strength. |
| `OnUpdateModdedWeatherStage(period, stage, strength)` | Every game minute while a modded stage runs | server, single player | Push fog, wind. |
| `OnThunderEvent(x, y, strike, flash, rumble)` | A thunder or lightning event | clients, single player | Messages, effects. |
| `EveryOneMinute`, `EveryTenMinutes`, `EveryHours`, `EveryDays` | The clock | all | Anything on a time schedule. |

The engine fires these from the climate, erosion, weather period, thunder and clock classes :cite[(`ClimateManager.java:251`, `:870`; `ErosionMain.java:413`; `WeatherPeriod.java:308`, `:1066`, `:1147`, `:438`, `:874`, `:1048`; `ThunderStorm.java:409`; `GameTime.java:611`, `:637`, `:643`, `:665`)].

**Dead events.** `OnRainStart` and `OnChangeWeather` are in the event list, but nothing in the engine or vanilla Lua triggers them :cite[(`api/events.md`)]. `OnRainStop` fires from the old `RainManager` :cite[(`RainManager.java:267`)] and its relation to real rain is thin. Use `OnWeatherPeriod...` and `OnClimateTick`.

**Weather colors.** To restyle the sky, listen to `OnClimateManagerInit` and call `setSeasonColorDawn`, `setSeasonColorDay` and `setSeasonColorDusk` with `(temperatureClass, season, r, g, b, a, exterior)` as the vanilla file does, or edit `getColNight()`, `getColFog()`, `getFogTintStorm()` and the period's `getCloudColor...()` colors :cite[(`ClimateManager.java:1531-1566`; `ClimateMain.lua:14-157`)]. Temperature classes are 0 warm, 1 normal, 2 cloudy; seasons are 0 summer, 1 fall, 2 winter, 3 spring :cite[(`ClimateManager.java:3004-3010`)]. Whether a mod's `OnClimateManagerInit` handler is registered before the object is created, and so whether it runs, was not checked. Vanilla's handler is in `media/lua/server/Climate/`; test yours with a `print` before relying on it.

## Change the weather

Changing the weather has to happen on the server or in single player, and a client has to ask the server.

### Who may do it

**The server (or single player).** The climate is simulated only where `GameClient.client` is false (see [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works)). So:

| You want | Run it on | Notes | Code |
|---|---|---|---|
| Start or stop weather, build a period, set the generation flag, set admin or modded values | server, or single player | In a file under `media/lua/server/`. The calls refuse on a client. | :cite[(`ClimateManager.java:654`, `:1247`, `:1260`; `WeatherPeriod.java:397`)] |
| Do it from a client | ask the server | `getClimateManager():transmitTriggerStorm(hours)`, `transmitTriggerTropical`, `transmitTriggerBlizzard`, `transmitStopWeather()`, `transmitGenerateWeather(strength, front)`, `transmitClientChangeAdminVars()`. The admin tools use them; the packet is registered with the `ClimateManager` capability, but where the server enforces it was not traced. | :cite[(`ClimateManager.java:2082-2130`)] |
| Show a client-only visual | client | Values you set on a client are replaced by the server's within about 5 seconds. `setEnabledFxUpdate(false)` stops the climate feeding the weather effects on that machine. | |

### Start a storm from the server

This script starts a storm of a given length from the server, and calls one on the first of every month.

```lua
-- 42/media/lua/server/WeatherStorm.lua
-- Start a storm of the given length (plus 1 hour in and out). Run on the server or
-- in single player. Do nothing on a multiplayer client.

WeatherStorm = {}

function WeatherStorm.start(hours)
    if isClient() then return false end         -- clients cannot simulate weather
    local cm = getClimateManager()

    if isServer() then
        -- Dedicated server: these two also send the new state to every player at once.
        cm:transmitServerStopWeather()
        cm:transmitServerTriggerStorm(hours)
    else
        -- Single player: the admin panel does exactly this.
        cm:stopWeatherAndThunder()
        cm:triggerCustomWeatherStage(WeatherPeriod.STAGE_STORM, hours)
    end

    print("[WeatherStorm] storm started, " .. hours .. " hours")
    return true
end

-- On the first of every month, at midnight, a 6-hour storm.
local function everyDay()
    if getGameTime():getDay() == 0 then          -- day numbers start at 0
        WeatherStorm.start(6)
    end
end

Events.EveryDays.Add(everyDay)
```

It copies what the `/startstorm` command does :cite[(`StartStormCommand.java:40-55`)] and the single-player admin button :cite[(`ISAdmPanelWeather.lua:169-175`)]. `transmitServerTriggerStorm` calls `triggerCustomWeatherStage(3, hours)` and then broadcasts :cite[(`ClimateManager.java:2050-2057`)]. The stage is a storm of the given strength 0.95, with a start stage and a clearing stage of an hour each :cite[(`:1260-1271`, `WeatherPeriod.java:506-529`)].

**To test it:** put the `WeatherReport` folder where the game finds mods, open **Mods** on the main menu and enable it, then start or load a save (a mod enabled after loading does nothing until you reload). In single player, turn on debug mode ([In-game debug mode](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools)) and run `WeatherStorm.start(1)` in the Lua console. The period opens with a 1-hour Start stage (about 3.75 real minutes at the default day length) while the storm builds, so the sky darkens and the rain and thunder come over the next few game hours, not at once. The radio forecast will not have mentioned it (it is made 29 game days ahead and rebuilt on every load).

### Other levers

Six more calls start, stop, freeze or override the weather, and one gives a mod a table saved with the world.

| Call | Effect | Side |
|---|---|---|
| `getClimateManager():triggerCustomWeather(strength, warmFront)` | Builds a full random period of that strength. `warmFront = true` is the rainy kind. Returns false if a period is running. | server, SP |
| `getClimateManager():stopWeatherAndThunder()` | Ends the period and the storm clouds. | server, SP |
| `getClimateManager():setEnabledWeatherGeneration(false)` | No new natural periods. (The Climate Cycle option sets this only when its own value changes.) | server, SP |
| `getClimateManager():setEnabledSimulation(false)` | Freezes the climate completely. | all (careful) |
| `getClimateManager():getThunderStorm():triggerThunderEvent(x, y, strike, flash, rumble)` | One thunder event at a spot. On a dedicated server it is sent to all clients. | server, SP |
| `getClimateManager():transmitServerStartRain(intensity)` | An admin precipitation override of 0 to 1. Stays until `transmitServerStopRain()`. | server |
| `getClimateManager():getModData()` | A table saved with the world. | server, SP |

### The layers of one value

Every weather value is a `ClimateFloat` with layers, and a mod can use the modded layer or the admin layer to change it.

See [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works#how-a-final-value-is-built) for the order:

```lua
-- Server or single player: pin the outdoor temperature at -12 C.
local cm = getClimateManager()
local temp = cm:getClimateFloat(ClimateManager.FLOAT_TEMPERATURE)
temp:setEnableModded(true)
temp:setModdedValue(-12)          -- clamped to the value's min and max
temp:setModdedInterpolate(1.0)    -- 0 to 1: how far each frame pulls it there
```

- **Modded layer** (`setEnableModded`, `setModdedValue`, `setModdedInterpolate`): pulls the value toward yours every frame. The climate recomputes its own number every game minute, so a small interpolate gives a sawtooth. 1.0 pins it. A weather period's own override is applied after it, so a storm still leans on top. Turn it off with `cm:resetModded()`, a `ClimateManager` method that resets the modded layer of **every** value, not just yours :cite[(`ClimateManager.java:1208-1220`)]. The layers are applied in order in the same class :cite[(`:2881-2896`)].
- **Admin layer** (`setEnableAdmin`, `setAdminValue`): the top layer, which beats everything on the server. It is what the admin panel uses, it is saved, and it must be turned off by hand with `cm:resetAdmin()`, which clears the admin layer of every value :cite[(`:1222-1234`)]. The server sends the result to clients with the regular 10-minute packet :cite[(`:903-906`)].
- **Override layer** (`setOverride`, `setEnableOverride`): what the weather period uses. It is cleared by `resetOverrides()` when a period ends, so it is the wrong place for a lasting change.

These calls were checked against the exposed API but not run.

### Your own weather stage

You can build a period out of normal stages and your own.

The recipe, on the server :cite[(`WeatherPeriod.java:358-393`, `:779-795`)]:

```lua
local wp = getClimateManager():getWeatherPeriod()
-- (warmFront, strength 0..1, wind angle in degrees). False if one is running,
-- if this is a client, or if strength is under 0.1.
if wp:startCreateModdedPeriod(true, 0.7, 90) then
    wp:createAndAddStage(WeatherPeriod.STAGE_SHOWERS, 3)           -- id, hours
    wp:createAndAddModdedStage("mymod:coldsnap", 4)                -- your own stage
    wp:createAndAddStage(WeatherPeriod.STAGE_CLEARING, 1)
    wp:endCreateModdedPeriod()                                     -- starts it
end
```

For a stage with your id, the engine fires `OnInitModdedWeatherStage(period, stage, strength)` when it is created and `OnUpdateModdedWeatherStage(period, stage, strength)` every game minute while it runs :cite[(`WeatherPeriod.java:872-875`, `:1047-1049`)]. Use the first to set the stage's target strength with `stage:setTargetStrength(0.6)` and `stage:lerpEntryTo(2, 2)` (2 means "go to my target"; 1 is the entry strength, 3 the next stage's target, 0 zero) :cite[(`:1337-1339`, `:1422-1437`)]. Use the second for fog, wind and wind angle.

One catch: after your handler runs, the period sets precipitation, clouds, light, desaturation, temperature, ambient and daylight itself, from the stage strength :cite[(`WeatherPeriod.java:1104-1136`)]. A handler that overrides those is overruled in the same minute. Shape them through the strength, or use the modded layer (which sits underneath).

Not run; the stage and period calls are exposed :cite[(`api/lua_exposed.jsonl`, `WeatherPeriod`)].

## What a server admin can do

A server admin has commands, a Climate Control window and two sandbox options.

| Tool | Does |
|---|---|
| `/startrain`, `/stoprain`, `/startstorm`, `/stopweather`, `/thunder`, `/lightning` | Commands for the `StartStopRain` capability |
| The Climate Control window | Admin layer overrides and period triggers, for the `ClimateManager` capability |
| The `ClimateCycle` and `FogCycle` options | Endless or no weather |

Details and sources are on the [forecast and tools page](/pz/build-42/engine/weather-and-climate/the-forecast-and-weather-ui). The default role table is in [Server roles](/pz/build-42/server/roles-and-access/server-roles-and-capabilities).

## Sandbox options that matter

Several sandbox options affect weather, and only some are read live.

All of these are on the settings screen and read from `SandboxVars` :cite[(`api/sandbox_options.jsonl`)]. The sandbox pages have the full text: [meta options](/pz/build-42/server/sandbox-options/sandbox-options-meta-events), [nature](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock), [time and world](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world).

| Option | Values (default) | When the engine reads it | Code |
|---|---|---|---|
| `DayLength` | 1 to 27 (4 = 1 h 30) | Once, when settings are applied | :cite[(`SandboxOptions.java:451-466`)] |
| `StartYear`, `StartMonth`, `StartDay`, `StartTime` | | Once, at world creation | |
| `DayNightCycle` | 1 normal, 2 endless day, 3 endless night | Live | :cite[(`ErosionSeason.java:479-485`)] |
| `NightDarkness` | 1 to 4 (3) | Live, every frame | :cite[(`RenderSettings.java:163`)] |
| `NightLength` | 1 to 5 (3) | **Never** | |
| `Temperature` | 1 to 5 (3) | **Once per load**, when the season model is built; changing it in a running game does nothing until the world is reloaded | :cite[(`ErosionMain.java:396-408`)] |
| `Rain` | 1 to 5 (3) | Live, every climate tick | :cite[(`ClimateManager.java:1306-1336`)] |
| `ClimateCycle` | 1 to 6 (1) | Live, every climate tick | :cite[(`:918-996`)] |
| `FogCycle` | 1 to 3 (1) | Live | :cite[(`:972-996`)] |
| `MaxFogIntensity`, `MaxRainFxIntensity` | picture only | Live | :cite[(`IsoWeatherFX.java:325-361`)] |
| `EnableSnowOnGround` | true | Live | :cite[(`FBORenderCell.java:391`)] |
| `FirearmWeatherMultiplier` | 0 to 10 (1) | Live | :cite[(`CombatManager.java:2648`)] |
| `PlantGrowingSeasons` | true | Live, in the farming Lua | |
| `ZombieLore.ActiveOnly` | 1 to 3 (1) | Live; uses dawn and dusk | |

## What needs Java

You can read everything and steer much of it from Lua, but the formulas, the single map-wide climate and the effects are fixed in the engine.

- **The formulas.** The season table, the temperature sum, wind chill, the "22 C indoors with power" rule, the vision and hearing penalties for zombies, the firearm weather penalties, wetness (`ClimateValues`, `ErosionSeason`, `ClimateManager.getAirTemperatureForSquare`, `IsoZombie`, `CombatManager`, `BodyDamage`). You change their inputs, not them.
- **Weather by place.** There is one climate for the whole map. A "storm over the north only" needs a different design: thunder clouds have a position, but rain does not.
- **New kinds of precipitation or new particle effects.** The weather effects are fixed code in `zombie/iso/weather/fx/`.
- **Lightning that does something.** Lightning is a flash and a sound. Damage or fire would be your own code. The thunder event does not fire on a dedicated server, so a server-side script would have to roll its own strikes and call `triggerThunderEvent`.
- **A different calendar.** The year length and the season table are fixed.
- **Stopping the Java-side farming lookups.** The farming Lua reads a fixed `season` table that is switched off in 42.22 (see [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does#four-checks-that-look-like-weather-and-are-not)); a mod can set `season.currentTemp` and `season.weather` from the real climate, because those are Lua tables.

A loose `.class` file ahead of the game jar can replace any of the Java above, at the usual cost of breaking on each update.

:::callout[How we know]{kind=proof}
None of the example scripts has been run in a game. They are checked against the exposed API list and against the engine code they call. Not verified:
- Whether a client-side `OnClimateManagerInit` listener from a mod is registered in time to run. Vanilla's listener is a server-folder file.
- The `Keyboard.KEY_F9` binding being free on a player's machine if they rebound keys.
- That a modded stage's `lerpEntryTo(2, 2)` produces the strength curve I describe. I read the code (`WeatherPeriod.java:1422-1449`) but did not run it.
- How the `ClimateManager` capability is enforced on the server for client-sent weather packets.
- Whether `setHaloNote` text shows for a second local player in split screen.
:::
