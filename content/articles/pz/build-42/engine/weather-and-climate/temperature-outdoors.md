---
id: build-42-temperature-outdoors
slug: temperature-outdoors
title: 'Temperature outdoors: season, hour, weather and wind chill'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: intermediate
tags:
  - engine
  - weather
  - temperature
  - wind-chill
  - indoors
excerpt: >-
  How the outdoor air temperature is built from the season, the air mass, the hour and the weather, what wind chill does, and why rooms are 22 C while the power is on.
last_updated: '2026-11-14'
related_articles:
  - how-weather-works
  - seasons-and-day-length
  - rain-snow-fog-and-wind
  - what-weather-does
  - the-forecast-and-weather-ui
  - modding-weather
  - body-temperature-and-the-thermoregulator
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#indoors-upstairs-and-in-a-car) | [modders](#the-sum)

:::callout[The 1-minute version]{kind=key}
- The temperature of the air outdoors, before clothes, is a sum of four things: the day's mean, an air mass swing, the hour of the day and the weather period. The number on the clock, the number your body feels and the number the radio reads out are not the same thing.
- The daily swing is 10 degrees: the afternoon peak is base + 1 and the low is base - 9, no matter the season or the weather.
- A frost is possible in any month from about October to April, and a night below 0 C in April or October is ordinary.
- While the power grid is on, every room is exactly 22 C. With the power off, the room moves part of the way toward 22 from the outdoor temperature, and a car in the heat is hotter than the air.
- Wind chill applies only to a character who is not in a room and not in a vehicle.
:::

:::facts
- **Hottest day** about July 23; **coldest** about January 22
- **Monthly mean** 0.2 C in January, 24.8 C in July (default settings)
- **Air mass swing** about -8 to +8 degrees
- **Daily swing** 10 degrees
- **Weather period** cooler by up to 7 C while it rains
:::

Nothing here was played. Tables of averages come from running a copy of the engine's season math in a separate test program (see [Seasons](/pz/build-42/engine/weather-and-climate/seasons-and-day-length)); the rest is read from the code. How that air turns into a cold, a shiver or a sunstroke is the [Body temperature](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator) page, which this page does not repeat.

## The sum

Outdoor air temperature is the day's mean plus the air mass swing plus the time of day, then pulled by the weather period and any override.

```
outdoor air temperature  =  the day's mean              (season, Temperature option)
                          + air mass swing               (about -8 to +8)
                          + time of day                  (+1 at the warm peak, -9 at the cold low)
                          + weather period               (cooler by up to 7 while it rains)
                          then admin, mod or Climate Cycle overrides, if any
```

The first three are the "calm" temperature :cite[(`zombie/iso/weather/ClimateValues.java:255-272`)]. The weather period leans on top of it. What the game calls the "final" temperature is what everything reads: `getTemperature()` :cite[(`zombie/iso/weather/ClimateManager.java:477`)], also reachable as `getWorld():getGlobalTemperature()` :cite[(`zombie/iso/IsoWorld.java:3165`)].

### 1. The day's mean

`ErosionSeason` gives a mean temperature for every day of the year, shaped like a cosine between the coldest and hottest days.

The season model works out a mean for each day of the year :cite[(`zombie/erosion/season/ErosionSeason.java:332-387`)]:

- The year is a smooth cosine between the **coldest day** and the **hottest day**. The hottest is the June solstice plus 31 days, about **July 23**, and the coldest is the December solstice plus 31, about **January 22** :cite[(`seasonLag = 31`, `:299-304`)]. Temperature trails the sun by a month.
- The hot and cold ends are the **maximum** and **minimum** from the settings (25 and 0 C by default :cite[(`ErosionConfig.java:337-359`)]), each nudged by up to plus or minus 3 degrees a year. The size of the nudge is `tempDiff / 2` with `tempDiff = 7` in whole-number math, which is 3 :cite[(`ErosionSeason.java:365-378`)].
- The **Temperature** sandbox option moves both ends (Very Cold -10, Cold -5, Normal 0, Hot +4 and +7.5, Very Hot +8 and +15 for maximum and minimum) :cite[(`ErosionMain.java:392-413`)].

Average daily mean by month, over 20 years, in the default settings (the low and high are the coldest and warmest day means seen in those years):

| Month | Mean (C) | Lowest | Highest |
|---|---|---|---|
| Jan | 0.2 | -1.0 | 1.7 |
| Feb | 1.1 | -0.8 | 3.4 |
| Mar | 5.0 | 1.6 | 8.7 |
| Apr | 10.8 | 6.8 | 14.7 |
| May | 17.2 | 13.1 | 20.9 |
| Jun | 22.4 | 18.7 | 25.1 |
| Jul | 24.8 | 22.3 | 26.2 |
| Aug | 23.9 | 20.7 | 26.0 |
| Sep | 19.9 | 16.1 | 23.1 |
| Oct | 13.9 | 9.9 | 17.8 |
| Nov | 7.5 | 3.9 | 11.2 |
| Dec | 2.5 | -0.1 | 5.4 |

(That is an average of the average day. It is not what a thermometer reads at 4 a.m.)

Fahrenheit, for the ones who count that way: the January mean is 32 F, the July mean 77 F.

### 2. The air mass swing

On top of the mean sits the air mass temperature, a slow wave that makes a warm spell or a cold snap last several days.

It is the same slow noise wave that decides when fronts pass, read 48 hours earlier, times 8 :cite[(`ClimateValues.java:255`, `:261`)]. It sets the character of the week. It ranges from -8 to +8 degrees, but 98 percent of the time it is within about 7 (a test of the noise function over 150 simulated years: first percentile -6.9, tenth -4.8, median 0, ninetieth +4.7, ninety-ninth +6.9).

The result, before the hour of the day is considered, is `getBaseTemperature()` :cite[(`ClimateManager.java:481`)].

### 3. The hour of the day

The hour is a curve with a fixed shape: the peak is base + 1, the low is base - 9, so the daily swing is always 10 degrees.

The curve has a fixed shape :cite[(`ClimateValues.java:262-272`)]:

- It reaches its **peak 4 hours after solar noon**. Its **low is 4 hours after the middle of the night**: near dawn.
- The peak is **base + 1** and the low is **base - 9**. The daily swing is 10 degrees, no matter the season or the weather.

| Date | Warmest at | Coolest at |
|---|---|---|
| Jan 1 | 16:37 | 04:37 |
| Apr 1 | 17:36 | 05:36 |
| Jul 1 | 18:24 | 06:24 |
| Oct 1 | 17:24 | 05:24 |

(Derived from the dawn and dusk times on the [seasons page](/pz/build-42/engine/weather-and-climate/seasons-and-day-length): the warm half of the curve spans dawn plus 4 hours to dusk plus 4 hours.) So the coldest hour in summer is not midnight; it is a little before sunrise.

What the sum gives for a normal year, as the typical range of the afternoon high and the pre-dawn low (the 1st to 99th percentile of the air mass swing, calm weather):

| Month | Afternoon high | Pre-dawn low |
|---|---|---|
| January | -6 to 8 C | -16 to -2 C |
| April | 5 to 19 C | -5 to 9 C |
| July | 19 to 33 C | 9 to 23 C |
| October | 8 to 22 C | -2 to 12 C |

So **a frost is possible in any month from about October to April**, and a night below 0 C in April or October is ordinary, not a freak. Snow turns on by the same rule: precipitation falls as snow when the air is below 0 C :cite[(`ClimateValues.java:273-277`)] (see [Rain, snow, fog and wind](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind#snow)).

### 4. The weather period

While a weather period runs, the temperature leans cooler for a rainy front and warmer for a light one, by up to 7 degrees.

It leans toward `calm - 7 x min(2S, 1)` for a rainy front (type 1) or `calm + 7 x min(2S, 1)` for a light one (type -1), blended in by the stage strength S :cite[(`zombie/iso/weather/WeatherPeriod.java:62`, `:1097-1102`, `:1134`)]. In plain numbers: -0.9 C at S = 0.25, -3.5 C at S = 0.5, -7 C at S = 1. A storm or blizzard cools the air by up to 7 degrees; a drizzle front warms it a degree or two. The change comes and goes with the stage, with a smooth glide.

### 5. Overrides

The Climate Cycle options, the admin panel and mods can override the temperature.

The sandbox **Climate Cycle** options Endless Snow and Endless Blizzard force the temperature to a random -20 to 0 C, re-rolled each game hour :cite[(`ClimateManager.java:928`, `:945`, `:964-967`; see the rain page)]. The admin panel has a temperature slider and a checkbox, and mods can set a modded value; the rules for which wins are on [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works#how-a-final-value-is-built).

## Wind chill

Wind chill is the standard formula, using the climate's wind power and leaving out the gusts.

The formula, in degrees C and km/h :cite[(`zombie/iso/weather/Temperature.java:88-91`)]:

```
w = 13.12 + 0.6215 t - 11.37 v^0.16 + 0.3965 t v^0.16      (never warmer than t)
```

The wind `v` is the climate's wind power times 120 :cite[(`ClimateManager.java:517-519`)]. The weather's gusts are not part of it. Wind chill only applies to a character who is **not** in a room and not in a vehicle, and only when the caller asks for it :cite[(`ClimateManager.java:751-753`)].

Feels-like temperatures (C) for a range of wind speeds:

| Air | 10 km/h | 20 km/h | 40 km/h | 60 km/h | 90 km/h |
|---|---|---|---|---|---|
| 10 C | 8.6 | 7.4 | 6.0 | 5.1 | 4.1 |
| 5 C | 2.7 | 1.1 | -0.7 | -1.8 | -3.1 |
| 0 C | -3.3 | -5.2 | -7.4 | -8.8 | -10.2 |
| -10 C | -15.3 | -17.9 | -20.8 | -22.6 | -24.6 |

Wind of 17 km/h is about the median for a winter day and 39 km/h is the stormy tenth. So a typical winter day knocks 4 to 5 degrees off the air at freezing. The body model asks for both the plain air and the wind-chilled air each time it runs :cite[(`zombie/characters/BodyDamage/Thermoregulator.java:669-670`)]; the Wind Chill moodle reads the difference :cite[(`Temperature.java:131-144`)]. The temperature shown on the in-game clock is the plain air for your character, no wind chill :cite[(`zombie/ui/Clock.java:315`)].

## Indoors, upstairs and in a car

Anywhere "in a room" or in a vehicle, the game pulls the outdoor temperature toward 22 C instead of using it as is.

A room is a building room or a player-built room :cite[(`IsoGridSquare.isInARoom()`, `IsoGridSquare.java:10014-10016`)]. A porch or a roof over open ground does **not** count: that is still outdoors for air temperature (the rain code uses a different "has a roof" test, see [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does)). The rules are in `getAirTemperatureForSquare` :cite[(`ClimateManager.java:716-770`)]:

1. **While the power grid is on, every room is exactly 22 C.** The code sets the temperature to 22 whenever the square is in a room and `IsoWorld.isHydroPowerOn()` is true :cite[(`:722-724`, `:734-736`)]. That flag is the world power grid, which stays on until the grid shutoff the sandbox options schedule :cite[(`IsoWorld.java:1923`)]. Early in a game, every building is 22 C inside, summer or winter.
2. **When the power is off**, the room partly follows the outside: it moves 40 to 60 percent of the way toward 22 depending on the lagged daylight value `D` (0 at night, up to 1 in the afternoon): `indoor = outdoor + (22 - outdoor) x (0.4 + 0.2 D)` :cite[(`:727-733`)].
3. **Upstairs** (floor 1 and up) in the cold: only 85 percent of the pull :cite[(`:731-732`)]. In the heat the pull is stronger upstairs, not weaker :cite[(`:743-745`)].
4. **A heat source** near the square (a fire, a stove, a heater) can lift it above that: within the source's radius and in line of sight, the temperature is blended toward the source's temperature, which is itself reduced when the outside is cold (up to -7 indoors and -15 outdoors) :cite[(`:755-758`; `zombie/iso/IsoCell.java`, `getHeatSourceHighestTemperature`)]. The highest wins.

With the power **off**, ground floor, `D` at its two extremes:

| Outdoors | Ground, night (D=0) | Ground, afternoon (D=1) | Upstairs, night | Upstairs, afternoon |
|---|---|---|---|---|
| -10 | 2.8 | 9.2 | 0.9 | 6.3 |
| 0 | 8.8 | 13.2 | 7.5 | 11.2 |
| 10 | 14.8 | 17.2 | 14.1 | 16.1 |
| 22 | 22 | 22 | 22 | 22 |
| 30 | 27.3 | 25.9 | 26.8 | 23.6 |
| 38 | 32.6 | 29.8 | 31.6 | 25.2 |

A house with the power off is a refrigerator in winter (above freezing, but cool) and a slow oven in summer. In every row of the table upstairs is cooler than the ground floor, in the cold (only 85 percent of the pull toward 22) and in the heat (a stronger pull) :cite[(`ClimateManager.java:727-745`)], so a bedroom up the stairs is the better summer sleep and the worse winter one.

### A quirk in the hot-weather upstairs rule

The hot-weather upstairs formula uses a second "night" lag, but the manager sets that value to the same number as the daylight lag :cite[(`ClimateManager.java:1378-1379`)]. So upstairs cools by `0.4 + 0.4 D` where the code was probably meant to use two different lags. The table above uses what the code does.

### In a vehicle

A character in a vehicle on open ground follows the same pull for the cold half, and for heat a car is hotter than the air.

For heat there is an extra step: after the reduction, the code adds the pull back plus `D` times it, so a car is **hotter than the air** :cite[(`:747-749`)]. At 30 C outside the formula gives 34 C when `D` is 0 and about 39.5 C when `D` is 1; at 38 C, 46 to 57 C. The vehicle's own `getInsideTemperature()` is then added on top :cite[(`:760-766`)], which the vehicle pages cover. 

Wind chill is not applied inside a vehicle. This is the formula's output; I did not see it in a game.

## Other places the outdoor temperature is used

The outdoor temperature feeds snow melt, the precipitation type, vehicle engines, fishing, humidity and wetness drying.

| Place | Use | Code |
|---|---|---|
| Snow melt | `T / 10` per hour (see the rain page). | |
| Precipitation type | Snow when below 0 C. | |
| Vehicle engines | Cold starts, see [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does). | |
| Fishing | The fish bite less in the cold and the heat (see the same page). | |
| Humidity | Humidity is scaled by temperature: `(1 + noise)/2 x clamp(0.5 + T/90)`, so cold air is drier. | :cite[(`ClimateValues.java:279-283`)] |
| Wetness drying | Clothes dry faster in warm air. | :cite[(`BodyDamage.java:772-783`)] |

## Odd corners

A few things are worth remembering.

- The daily "day temperature" the season model computes (with a random plus or minus 7) is never used. Only the mean is :cite[(`ClimateValues.java:258-261`)]. All the day-to-day variation is the air mass swing.
- The Temperature option also changes the length of the seasons, not only the heat (see the seasons page).
- With the grid on, every room is 22 C, so cold exposure comes from being outside, from a car, or from the time after the grid goes off.

:::callout[How we know]{kind=proof}
The temperatures in the tables come from the formulas and the season model; none were read from a running game, and the vehicle numbers are the formula's output only. Not verified:
- How the vehicle's own inside temperature interacts with the formula above in practice.
- The grid-shutoff day in your world: `isHydroPowerOn` is set by the ambient sound manager and the sandbox power options :cite[(`AmbientStreamManager.java:137`, `:610-614`; `IsoWorld.java:1923`)]; how the schedule works is on the sandbox pages, not here.
:::
