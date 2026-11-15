---
id: build-42-rain-snow-fog-and-wind
slug: rain-snow-fog-and-wind
title: 'Rain, snow, fog, wind and storms'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: intermediate
tags:
  - engine
  - weather
  - rain
  - snow
  - fog
  - wind
  - storms
excerpt: >-
  When rain, snow, fog, wind and storms happen in Build 42.22, how strong each gets, how long it lasts, and what thunder and lightning really do.
last_updated: '2026-11-14'
related_articles:
  - how-weather-works
  - seasons-and-day-length
  - temperature-outdoors
  - what-weather-does
  - the-forecast-and-weather-ui
  - modding-weather
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#fog) | [server owners](#the-climate-cycle-options) | [modders](#rain-how-a-rain-event-starts)

:::callout[The 1-minute version]{kind=key}
- Rain comes in "weather periods" built from stages: a drizzle, a lull, a downpour, sometimes a storm. Fog is a separate daily dice roll. Wind is a slow wave with a fast wiggle.
- A period starts when the air mass wave flips sign and the front that just ended has a strength of at least 0.1, and only if no period is already running. The date seeds the generator, so the same world on the same date makes the same period.
- Rain below an intensity of 0.1 wets nobody.
- Snow or rain is one test: is the calm air temperature below 0 C?
- 20 percent of days have morning fog. The Maximum Fog Intensity option only trims the picture; the real fog still blinds zombies' sight and your rifle.
- Lightning does no damage. A thunderstorm is a mood, not a hazard; the danger is the rain, the wind and the dark.
:::

:::facts
- **Periods per year** 69 in Normal Rain (estimate from a model; 38 Very Dry to 83 Very Rainy)
- **Share of the year with a period running** 21 percent in Normal (estimate)
- **Foggy days** 20 percent
- **Snow cover** 7.5 hours of intensity-1 snow for full cover
- **Gameplay wind** calm-weather speeds: half the time below 17 km/h in winter, 10 km/h in summer
:::

Nothing here was played. Counts of "periods per year" come from a model that re-runs the engine's generator rules outside the game (details in the table notes); everything else is read from the code. What each kind of weather does to you is on [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does).

## Rain: how a rain event starts

A rain event starts when the air mass wave flips sign and the front that just ended was strong enough.

1. Once an hour, the climate looks at the sign of the **air mass** wave. If it flipped since last hour, a front has passed :cite[(`zombie/iso/weather/ClimateManager.java:1346-1356`)].
2. The engine measures the strength of the front that just ended, from daily samples of the wave over the last four days, and keeps the largest of the newest sample and the two cached before it (the last three) weighted 75 percent, plus the overall maximum weighted 25 percent :cite[(`AirFront.addDaySample`, `:2450-2480`; `CalculateWeatherFrontStrength`, `:2294-2313`)].
3. If the strength is below **0.1**, nothing happens :cite[(`WeatherPeriod.java:48`, `:397`)]. If a period is already running, nothing happens either :cite[(`:397`)].
4. Otherwise a weather period is built. The date seeds the random generator, so the same world on the same date always makes the same period :cite[(`:313-322`)].

Fronts have a type. Type 1 (the code's "warm to cold front") makes the rainy, stormy periods. Type -1 ("cold to warm front") makes light ones :cite[(`WeatherPeriod.java:647-737`)].

### The stages

A period is a list of stages, and each has a target strength that the weather leans toward.

The weather glides between stages :cite[(`WeatherPeriod.java:801-880`, `:1439-1449`)]. `s` below is the front strength, 0.1 to 1.

| Id | Stage | Target strength | Typical length (hours) | What it does to the rest of the weather |
|---|---|---|---|---|
| 0 | Start | glides toward the next stage | 1 + up to 2s | Clears fog. Sets the rain threshold (below). |
| 1 | Showers | 0.5 s | 2 + up to 4s (3s on a type -1 front) | Light wind (0.1 x noise). |
| 2 | Heavy precipitation | s | 2 + up to 4s | Wind 0.5 x noise, direction swing. |
| 3 | Storm | s | 5 + up to 5s for the first, 4 + up to 4s for extras | Storm clouds. Wind 0.2 + 0.5 x noise. A third of storms get fog of 0.1 to 0.5. |
| 4 | Clearing | 0.25 s | 1 + up to 2s between stages, 2 + up to 3s at the end | Fog fades out. |
| 5 | Moderate | 0.5 s | 1 + up to 3s (type 1) or 2 + up to 3s (type -1) | Fog off. |
| 6 | Drizzle | 0.25 s | 2 + up to 3s | Fog off. |
| 7 | Blizzard | 1.0 | 24 + up to 24s | Wind 0.75 + 0.25 x noise. Fog 0.55 to 0.75 (not on the top fog-quality setting). |
| 8 | Tropical storm | 1.0 | 8 + up to 16s | Wind 0.4 + 0.6 x noise. Fog 0.6 to 1.0, tinted. One large thunder cloud. |
| 9 | Intermezzo | 0 | 1 + up to 3s | A dry pause. |
| 10 | Modded | the mod's | the mod's | The mod's code runs. |
| 11 | Intro storm | s | script | The scripted opening storm. |

Every stage is at least 1 hour, and after the list is built each length is multiplied by the **rain time multiplier** (season factor times the sandbox **Rain** factor, below) :cite[(`:756-758`, `:1408-1414`)]. "Noise" here is the period's own wave, 0 to 1, which wanders over about an hour :cite[(`:1088-1090`)].

### What a type 1 period is made of

A type 1 period picks a total length, fills it with stages, shuffles them and adds lulls.

- First the period decides whether it is special :cite[(`WeatherPeriod.java:647-665`)], but only if `s` is high enough: a **tropical storm** or **blizzard** needs `s` above 0.75; a plain **storm** needs `s` above 0.5. The tropical roll comes first, then the blizzard roll, then the storm roll.
- It sets a total length of `random(24, 48) x s` hours :cite[(`:667`)] and fills it with stages: storm stages first if special, then filler drawn at random. For a type 1 front the filler is 10 percent moderate, 30 percent showers and 60 percent heavy precipitation :cite[(`:705-713`)]. A type -1 front has a total of `random(12, 24) x s` hours and its filler is 10 percent showers, 40 percent drizzle and 50 percent moderate :cite[(`:725-736`)].
- The stages are shuffled. Between two stages there is a 30 to 60 percent chance of a lull: a clearing, then an intermezzo :cite[(`:739-750`)]. The period starts with a Start stage and ends with a Clearing unless it already ended on a lull :cite[(`:741`, `:752-754`)].

### How the season changes the odds

A strong summer front is far more likely to become a tropical storm than a plain one, and winter is the blizzard season.

The chances below are per type 1 period and per roll. The "time" column multiplies every stage length.

| Season | Storm chance | Tropical chance | Blizzard chance | Time | Cloud color |
|---|---|---|---|---|---|
| Spring | 75 | 10 | 0 | x1.25 | mostly green, some blue |
| Early Summer | 60 | 55 | 0 | x1 | red, sometimes green |
| Autumn | 100 | 25 | 0 | x1.35 | red, purple or blue |
| Winter | 10 | 0 | see below | x1 | purple or blue |

The table comes from the generator's season rules :cite[(`WeatherPeriod.java:549-630`)]; the `Late Summer` rule can never run :cite[(`:573-579`)], see [Seasons](/pz/build-42/engine/weather-and-climate/seasons-and-day-length). 

In winter, when the day's mean temperature is below 5.5 C, the blizzard chance is `(5.5 - mean) x 3` capped at 85, plus 25, plus 55 more if the mean is below 2.5, capped at 95 :cite[(`:603-617`)]. A second rule that adds 75 for a mean below 0 can never run, because the check for below 2.5 comes first :cite[(`:606-610`)]. At a mean of 4 C the chance is about 30 percent, and at 1 C about 94 percent.

The mean is the season's average for the day. The challenge "Winter Is Coming" forces the winter table and a 75 or 100 percent blizzard chance :cite[(`:544-547`, `:619-629`)].

### How hard it rains

While a period runs, the rain is a ratio between a noise wave and a threshold, so the intensity wobbles within a stage and never exceeds the stage's strength.

In words: the period has its own slow wave, `weatherNoise`, between 0 and 1, that wanders over about an hour. Rain falls only while the wave is above a threshold, harder the higher it is, and never harder than the stage allows :cite[(`WeatherPeriod.java:1088-1110`)]:

```
weatherNoise      = 0.3 s + noise x (1 - 0.3 s)      (then scaled to 0..1)
rainThreshold     = 0.35 - 0.2 s                      (set by the Start stage)
precipitation     = (weatherNoise - rainThreshold) / (1 - rainThreshold) x stage strength
                    (0 if weatherNoise is below the threshold)
```

So the intensity wobbles within a stage and never exceeds the stage's strength. What you get in a heavy-precipitation stage (target strength s):

| Front strength s | Typical intensity | Peak |
|---|---|---|
| 0.3 (weak) | about 0.11 | 0.30 |
| 0.6 (medium) | about 0.28 | 0.60 |
| 0.9 (strong) | about 0.50 | 0.90 |

"Typical" is the value at the middle of the noise range. Only the tropical storm and the blizzard (strength 1.0) can reach a full 1.0.

**What that means for you.** Wetting is proportional to intensity: the rain value is the wetness increase fed to your clothing each update, and anything under 0.1 is ignored :cite[(`BodyDamage.java:764-770`, `ClothingWetness.java:101-102`)]. So 0.11 is barely a drizzle, 0.28 soaks you about 2.5 times as fast, and 0.50 about 4.5 times as fast. Wetness per hour was not worked out (the constant lives in a class I did not trace; see the [stats reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference)): not verified. Intensities under **0.1** wet nobody: the player wetness code ignores them :cite[(`zombie/characters/BodyDamage/BodyDamage.java:764-768`)].

During the period the temperature leans cooler by up to 7 C, the sky darkens, and the light turns to the period's cloud color. A type 1 front pulls the temperature down by `7 x min(2S, 1)` at stage strength S, blended in by S, so it is -3.5 C at S = 0.5 and -7 C at S = 1. A type -1 front pushes it *up* by the same rule :cite[(`WeatherPeriod.java:1097-1102`, `:62`)].

### How often and how long

A Normal-rain world sees about 69 periods a year, each lasting about 26 hours, with one running about a fifth of the year.

**Estimate.** Here is a model of the generator's own rules, run for 400 simulated years per row: the same noise, front strength and stage rules, with the front's size taken from the same noise function. It shows the shape, not exact counts for your world. Spring/summer/autumn/winter only change the storm odds and the time multiplier; the table shows the effect of the **Rain** option in Early Summer.

| Rain option | Hours per wave unit (smaller means more fronts) | Time x | Periods per year | Average length | Share of the year with a period running |
|---|---|---|---|---|---|
| Very Dry | 300 | 0.5 | 38 | 12 h | 5 percent |
| Dry | 240 | 0.75 | 48 | 19 h | 11 percent |
| Normal | 166 | 1 | 69 | 26 h | 21 percent |
| Rainy | 145 | 1.25 | 76 | 34 h | 29 percent |
| Very Rainy | 120 | 1.5 | 83 | 41 h | 40 percent |

::bar[Very Dry, share of the year with a period running]{value=5 max=100 text="5 percent" accent=blue}
::bar[Dry]{value=11 max=100 text="11 percent" accent=blue}
::bar[Normal]{value=21 max=100 text="21 percent" accent=blue}
::bar[Rainy]{value=29 max=100 text="29 percent" accent=blue}
::bar[Very Rainy]{value=40 max=100 text="40 percent" accent=blue}

The Rain option sets the noise scale :cite[(`ClimateManager.java:1306-1324`)] and the time multiplier :cite[(`:1326-1336`)]. In Normal about half of all periods are type 1 and run 32 hours on average, the other half are light type -1 periods averaging 20 hours; the longest in 400 years was about 84 hours. In autumn a Normal year has about 29 percent storm periods and an average period of 36 hours; in winter 2 to 7 percent of periods are blizzards, more when the mean is below 2.5 C. A period "running" is not the same as it raining: the stages include lulls and the rain wave drops under the threshold.

## Snow

Whether precipitation is rain or snow is one test: is the calm air temperature below 0 C?

The engine decides it from the calm temperature alone :cite[(`ClimateValues.java:273-277`)], so a snowfall is possible in any season when it is cold enough. The weather period adds one more rule: in winter with a final temperature below zero it forces snow on :cite[(`WeatherPeriod.java:1137-1141`)]. In the "Winter Is Coming" mode it is always snow.

Snow on the ground is a pile with its own bookkeeping, updated once per game minute for the pile and settled once an hour :cite[(`ClimateManager.java:1140-1185`)]:

| Step | Rule |
|---|---|
| While it snows | The highest intensity seen this hour is remembered as the hour's snowfall. |
| While above 0 C | The hour's melt is `(T / 10) x (0.2 + 0.8 x daylight)`, using the highest value seen. At 10 C in full daylight that is 1.0 per hour; at night it is 0.2. |
| While it rains | Every game minute adds the rain intensity to the hour's melt, so an hour of rain adds up to 60 times that. |
| End of the hour | Pile = pile + snowfall - melt, kept between 0 and 10. |
| Ground cover | 100 percent at a pile above 7.5, otherwise pile / 7.5. |

So an hour of heavy snow (intensity 1) adds one point and it takes 7.5 hours of it for full cover; a rain shower of even 0.5 for a few minutes removes a good part of it. Winter ground textures switch on when the cover is above 20 percent and the season allows winter sprites :cite[(`:1143`, `:1147`, `:1153`, `:1180`)] (see [Erosion](/pz/build-42/modding/engine/erosion)). The sandbox option **Snow on Ground** can turn the accumulation off, leaving snow on plants and roofs :cite[(`FBORenderCell.java:391`)].

The Lua `getSnowStrength()` returns the pile (0 to 10), `getSnowFracNow()` the cover (0 to 1), and `isSnowing()` whether snow is falling :cite[(`ClimateManager.java:485`, `:1190`, `:602`)].

## Fog

Fog is not a weather period but a daily roll, and 20 percent of days have morning fog.

The roll is made by a random generator seeded from the date :cite[(`ClimateValues.java:193-238`)]:

- **20 percent of days** have morning fog.
- A roll under 25 out of 1,000 (2.5 percent of all days, one foggy day in eight) is extreme: strength 1.0 and 2 extra hours. The other foggy days (rolls 25 to 199) get a random strength from 0 to 1 :cite[(`:204-213`)].
- The length starts at 4 hours and adds more when the air is cold:

| Day's mean (plus air-mass swing) | Extra hours | Typical total |
|---|---|---|
| 20 C and up | strength x 1 + up to 1 | 4 to 6 |
| 10 to 20 | strength x 1.5 + up to 2.5 | 4 to 8 |
| 0 to 10 | strength x 2.5 + up to 5 | 4 to 11.5 |
| below 0 | strength x 5 + up to 8 | 4 to 17 |

It is capped so it ends before the day does :cite[(`:215-237`)]. The fog starts 2 hours before dawn and lasts until dawn plus that length :cite[(`ClimateManager.java:1447-1457`)]. So a typical warm summer fog is thick at 5 a.m. and gone by noon; a deep-winter fog can last until late afternoon.

The displayed strength is rescaled so a foggy day never has less than 0.2 (`0.2 + 0.8 x strength`, or `0.5 + 0.5 x strength` on the highest fog-quality setting) :cite[(`:1370-1375`)]. Fog also clears the clouds :cite[(`:1449-1451`)], drains color :cite[(`:1452-1461`)], and tints and dims the light :cite[(`:1494-1503`)]. During storms, tropical storms and blizzards the stage sets its own fog (table above).

**The sandbox options for fog:**

| Option | Does | Code |
|---|---|---|
| **Fog Cycle** | Normal, No Fog (fog forced to 0), or Endless Fog (a new level from 0.1 to 1 each game hour). | :cite[(`ClimateManager.java:972-996`)] |
| **Maximum Fog Intensity** | Caps the fog that is *drawn* at 0.75, 0.5 or 0. | :cite[(`zombie/iso/weather/fx/IsoWeatherFX.java:325-335`)] |

The second option is cosmetic. It trims the picture only. Zombies, firearms, fishing and foraging read the real fog value, which this option does not touch, because the real value is passed on to the picture code :cite[(`ClimateManager.java:1120-1131`)]. Choosing "None" gives you a clear screen and a real fog that still blinds the zombies' sight and your rifle.

## Wind

The baseline wind is a slow wave plus a few modifiers, calmer in summer and gustier in winter.

The baseline is worked out like this :cite[(`ClimateValues.java:284-290`)]:

```
wind = (noise + 1)/2  x  (1 - (airMassTemperature + 1)/2)  x  (1 - 0.4 x summerness)  x  0.65
```

It is a fraction of 120 km/h :cite[(`ClimateManager.java:64`, `:517`)]. Calmer in summer, gustier in winter, and calmer when the air mass is warm. Over many simulated years the calm-weather speeds come out like this (a separate test of the wave, 150 simulated years each):

| Season | Wind in 10 percent of the time is below | Half the time below | 90 percent of the time below | 99 percent below | Highest |
|---|---|---|---|---|---|
| Winter | 5 km/h | 17 km/h | 39 km/h | 54 km/h | 73 km/h |
| Summer | 3 km/h | 10 km/h | 23 km/h | 33 km/h | 44 km/h |

The weather period then lays its own wind on top, as the stage table shows. A storm or tropical storm pushes it to 0.2 to 0.7 and 0.4 to 1.0, a blizzard to 0.75 to 1.0 :cite[(`WeatherPeriod.java:1024-1027`, `:951`)]. The **Climate Cycle** options "Endless Storm" and "Endless Blizzard" re-roll wind between 0.3 and 1.0 each game hour :cite[(`ClimateManager.java:955-963`)].

**Gusts.** Clients and single player add a fast wiggle to the wind each frame: `wind + noise x (0.04 + 0.1 x wind)` upward, slightly more downward :cite[(`ClimateManager.java:1010-1025`)]. The result (`getWindTickFinal`) drives the swaying of trees and the slant of rain. The wind that **gameplay** reads, `getWindIntensity` and `getWindPower`, is the smooth one without gusts :cite[(`:501`, `:513`, `:884-886`)]. So firearms, fishing and wind chill do not feel the gusts.

**Direction.** The in-game direction comes from a second wave, `WIND_ANGLE_INTENSITY`, mapped to 0 to 360 degrees by a piecewise formula :cite[(`ClimateManager.java:537-556`)]. Storm stages push it too. The sky and rain use it. The radio forecast's wind direction uses a different wave, so the two do not agree (see [The forecast](/pz/build-42/engine/weather-and-climate/the-forecast-and-weather-ui)).

## Clouds

Cloud cover is mostly the wind again, thinned at night, and a weather period overrides it.

The base cover is `min(1, 2 x wind)`, thinned by up to half at night :cite[(`ClimateValues.java:321-322`)]. A period overrides it with at least 0.5 (more in the day) and a blizzard thins it :cite[(`WeatherPeriod.java:1112-1129`)]. Clouds make the sky colors grayer by choosing the "cloudy" palette :cite[(`ClimateValues.java:318-320`)].

## Storms, thunder and lightning

Storm stages launch thunder clouds that fire lightning and thunder, but they do no damage.

A storm stage (3), a tropical storm (8) and the intro storm (11) launch **thunder clouds** when the stage begins :cite[(`WeatherPeriod.java:964-1003`; `ThunderStorm.java:149-213`)]:

| Property | Storm stage | Tropical storm |
|---|---|---|
| Number of clouds | 1 or 2 | 1 |
| Cloud radius | 8,000 x s tiles | 15,000 tiles |
| Chance an event is a real strike | 0.6 x s | 0.8 |
| First cloud aimed at a random player | if s is above 0.7 | always |

The engine allows 3 clouds at once, and a radius of at most 20,000 tiles :cite[(`ThunderStorm.java:44-46`)]. Each cloud moves in a straight line along the front's wind direction, from beyond one edge of the map to beyond the other, over the length of the stage :cite[(`ThunderStorm.java:215-230`, `:597-612`)]. Every so often it makes an event: it waits a random time between `3.5 - 3s` and `24 - 20s` units of 60 timer ticks, so a strong storm fires every 0.5 to 4 units and a weak one every 2.6 to 18 :cite[(`:232-234`)]. The timers use the game speed, so lightning comes faster when you fast-forward.

Each event lands near the cloud: 60 percent of the time within a sixth of the cloud's radius, 30 percent within three-eighths, 10 percent within half :cite[(`:236-242`)]. It is one of two kinds :cite[(`:244-260`)]:

- **A strike** (with probability `thunderRatio`): thunder sound, a lightning flash unless you turned flashes off in your options, and a rumble 60 percent of the time.
- **A rumble:** a rumble sound only.

What players see and hear:

- **The flash.** If you are within 7,500 tiles of the strike, the screen light jumps toward white for 20 to 100 timer ticks (stronger and longer when it is closer), and fades :cite[(`ThunderStorm.java:346-372`, `:439-450`, `:272-291`)].
- **The sound.** Heard if the strike is within 10,000 tiles. The thunder arrives `distance / 300 x 60` timer ticks later, so far strikes rumble after the flash :cite[(`:430-438`)]. The sound is skipped while you are on a faster game speed; the flash is not :cite[(`:293-308`)].
- **The event.** The Lua event `OnThunderEvent(x, y, doStrike, doLightning, doRumble)` fires on every client and in single player, but not on a dedicated server :cite[(`:378-389`, `:399-409`)].

**Lightning does no damage.** No code in `ThunderStorm` starts a fire, hurts a character or makes a sound that zombies hear: it calls only the audio engine and the light settings :cite[(`zombie/iso/weather/ThunderStorm.java`)]. This covers the whole file, and a search of the source for "lightning" finds only the option, the sound manager's marker, the admin commands and this class. A thunderstorm is a mood, not a hazard. The danger in a storm is the rain, the wind and the dark: the wet clothes, the firearm penalty, the radio hiss and the cold.

**Admin commands** make events by hand: `/lightning [user]` fires a flash and a rumble at a player, `/thunder [user]` a rumble only :cite[(`zombie/commands/serverCommands/LightningCommand.java:60`, `ThunderCommand.java:60`)].

## The Climate Cycle options

The sandbox **Climate Cycle** option takes the weather off its natural course.

The climate manager applies it like this :cite[(`ClimateManager.java:918-996`)]:

| Option | Rain and wind | Temperature |
|---|---|---|
| Normal | The generator runs. | natural |
| No Weather | Precipitation and wind forced to 0; generation off. | natural |
| Endless Rain | Precipitation 0.1 to 0.5, wind 0 to 0.3, re-rolled every game hour. | natural |
| Endless Storm | Precipitation 0.5 to 1.0, wind 0.3 to 1.0, re-rolled every game hour. | natural |
| Endless Snow | Snow 0.1 to 0.5, wind 0 to 0.3. Ground snow forced to 70 percent. | -20 to 0, re-rolled hourly |
| Endless Blizzard | Snow 0.5 to 1.0, wind 0.3 to 1.0. Ground snow forced. Fog forced on unless Fog Cycle says none. | -20 to 0 |

## Odd corners

A few oddities are worth remembering.

- Half the periods are type -1 "cold to warm" fronts. Their strength tops out at half the front strength, so they are drizzle, moderate rain and showers, and they warm the air a little instead of cooling it.
- A flip never interrupts a running period: a front that arrives during a storm only changes the front type.
- The forecaster and the radio group showers and heavy precipitation under one flag, "showers and or heavy rain" (see the forecast page).
- The `Maximum Fog Intensity` option does not touch the real fog.
- `OnRainStart` never fires (see [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works)).

:::callout[How we know]{kind=proof}
Everything except the "how often" counts and the wind speeds table is read from the code. Those two come from a model that re-runs the generator's rules outside the game, not from the game. Not verified:
- Real-time lengths of lightning waits (the code uses a tick timer scaled by game speed).
- Whether a client's own "disable lightning" option applies in multiplayer, since the flash flag is decided where the storm runs (`ThunderStorm.java:250`).
- That nothing else reacts to `OnThunderEvent`. The only vanilla listener I found is the debug thunder window (`media/lua/client/DebugUIs/DebugMenu/Climate/ThunderDebug.lua:20`, `:108`).
:::
