---
id: build-42-seasons-and-day-length
slug: seasons-and-day-length
title: 'Seasons, day length, dawn and dusk'
game: pz
version: build-42
section: engine
category: weather-and-climate
difficulty: intermediate
tags:
  - engine
  - seasons
  - daylight
  - moon
  - sandbox
excerpt: >-
  When each season starts, how many real minutes a game day takes, when dawn and dusk fall through the year, how dark nights get, and the traps in the season names.
last_updated: '2026-11-14'
related_articles:
  - how-weather-works
  - rain-snow-fog-and-wind
  - temperature-outdoors
  - what-weather-does
  - the-forecast-and-weather-ui
  - modding-weather
  - erosion
  - seasons-curses-and-the-crop-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#when-the-seasons-change) | [server owners](#how-long-a-game-day-lasts) | [modders](#the-naming-trap)

:::callout[The 1-minute version]{kind=key}
- The game does not read dates from a table. It works the seasons out from the date with a little astronomy and some noise, so a winter can start two weeks earlier next year.
- Winter is not "December to February". With the default settings it runs from early November to the second week of February, about 100 days.
- The engine has only four used season slots, and its only summer is named `Early Summer`, so any check for `"Summer"` is never true.
- At the default Day Length (option 4) a game day is 1 hour 30 minutes of real time, and a game hour is 3.75 real minutes.
- Dawn only moves between 7:00 and 8:00 all year; dusk swings by about 4.5 hours, from 17:16 in mid-December to 21:44 in mid-June.
:::

:::facts
- **Default start** July 9, 1993 at 9 a.m. in the standard presets
- **Default day** 1 hour 30 minutes real time; game hour 3.75 min; game minute 3.75 s
- **Daylight at latitude 38** 14.64 hours in June, 9.36 hours in December
- **Winter length** about 100 days at the default Temperature option (88 to 109 over 20 years)
- **Full darkness** a quarter of the night after dusk
:::

Nothing here was played. The tables of dates and times come from running a copy of the engine's own season math (`ErosionSeason` and `Noise2D`, source files copied unchanged apart from removing log and translation calls) in a separate test program, for the default settings, and from reading the code. Treat the numbers as exact for the formulas and unproven for the game.

## The calendar

The game uses the real calendar, and a new game starts on the date set by the Start options.

- The game uses the real calendar, leap years included :cite[(`GameTime.java:223-230`, `ErosionSeason.java:282`)]. The first year available is 1993 :cite[(`SandboxOptions.java:514-516`)].
- A new game starts on the date set by the **Start Year / Month / Day / Hour** options :cite[(`SandboxOptions.java:451-466`)]. The standard presets (Apocalypse, Outbreak, Extinction) start **July 9, 1993 at 9 a.m.** :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:9-12`)]. The bare default of the Start Day option is the 23rd :cite[(`SandboxOptions.java:74`)], which only matters if you build your own settings.
- Start hours are 7, 9, 12, 14, 17, 21, 0, 2 and 5 :cite[(`SandboxOptions.java:457-468`)].
- "Nights survived" goes up when the clock passes 7 a.m. :cite[(`GameTime.java:572-576`)].

## The season table

`ErosionSeason` has six season slots, but the model only ever uses four.

The model declares six slots but picks from four :cite[(`ErosionSeason.java:19-25`)].

| Id | Name the engine returns | Used? | Notes |
|---|---|---|---|
| 0 | `Default` | no | Never selected. |
| 1 | `Spring` | yes | Between the end of winter and the start of summer. |
| 2 | `Early Summer` | yes | **The only summer.** It runs from spring to early autumn. |
| 3 | `Late Summer` | **never** | No code picks it. `setCurSeason` has no caller in the engine or in vanilla Lua. |
| 4 | `Autumn` | yes | |
| 5 | `Winter` | yes | |

The names are set in the season class :cite[(`ErosionSeason.java:66`)]; the choice of season is made in `setSeasonData`, which assigns only 5, 1, 2, 4 and 5 :cite[(`:335-355`)]. The sound system treats slots 2 and 3 as the same value :cite[(`zombie/audio/parameters/ParameterSeason.java:26`, `case 2, 3 -> 1.0F`)], and the weather generator has a "slot 3" rule that can never run :cite[(`WeatherPeriod.java:573-579`)].

### The naming trap

`getSeasonName()` returns the English name above, so in summer it returns **`Early Summer`**, not `Summer`.

That is how the engine reads it :cite[(`ClimateManager.java:772-774`, `ErosionSeason.java:219`)]. Any check for `"Summer"` is never true. Vanilla has one: dead bodies use a higher maggot chance "in `Summer`" :cite[(`zombie/iso/objects/IsoDeadBody.java:1724`)], and that branch can never run, so the maggot chance in summer is the same 1 in 5 as in spring and autumn. 

Checks for `"Winter"`, `"Spring"` and `"Autumn"` work. Mods should compare `getSeasonId()` or `getSeason():isSeason(2)`, or use `string.find(name, "Summer")`.

The translated name (`getSeasonNameTranslated`) is for display only.

## When the seasons change

Seasons are built from the two solstices, June 22 and December 22, with a random stretch each year, so the start dates move.

The engine builds each year's seasons around the two solstices :cite[(`ErosionSeason.java:295-320`)], and the random stretch works like this:

- **Winter** is centered on December 22. It starts `floor(40 + 40 x winterMod + 20 x noiseS)` days before and ends `floor(40 + 40 x winterMod + 20 x noiseE)` days after it.
- **Summer** is the same around June 22, with its own modifier.
- **Spring** is the gap from the end of winter to the start of summer. **Autumn** is the gap from the end of summer to the start of winter.
- `noiseS` and `noiseE` are 0 to 1 values from a layered noise function seeded by the year :cite[(`:305-320`)], so every year differs and every world gets the same years.
- `winterMod` and `summerMod` come from the temperature range: a colder minimum makes a longer winter, a warmer maximum a longer summer :cite[(`:88-89`)].

The start dates of the next season in the first eleven years, with the default settings (latitude 38, maximum 25, minimum 0), are listed below :cite[(`ErosionConfig.java:337-359`)].

| Year | Spring starts | Early Summer starts | Autumn starts | Winter starts |
|---|---|---|---|---|
| 1993 | Feb 15 | Apr 13 | Sep 2 | Nov 5 |
| 1994 | Feb 8 | Apr 15 | Aug 28 | Nov 8 |
| 1995 | Feb 12 | Apr 13 | Aug 30 | Oct 27 |
| 1996 | Feb 9 | Apr 14 | Sep 4 | Nov 7 |
| 1997 | Feb 15 | Apr 19 | Aug 24 | Oct 29 |
| 1998 | Feb 9 | Apr 16 | Aug 30 | Nov 7 |
| 1999 | Feb 11 | Apr 13 | Aug 31 | Nov 3 |
| 2000 | Feb 9 | Apr 12 | Sep 2 | Nov 5 |
| 2001 | Feb 10 | Apr 17 | Sep 5 | Nov 1 |
| 2002 | Feb 13 | Apr 16 | Sep 3 | Nov 5 |
| 2003 | Feb 8 | Apr 17 | Aug 31 | Nov 4 |

Over 100 years the start dates range from Feb 1 to Feb 18 (spring), Apr 6 to Apr 22 (summer), Aug 23 to Sep 7 (autumn) and Oct 25 to Nov 11 (winter), give or take a day for leap years. Over 20 years a calendar year had 88 to 109 days of winter, 51 to 80 of spring, 127 to 147 of summer and 56 to 72 of autumn.

So: **winter is not "December to February".** On average it runs from early November to the second week of February, about 100 days. A guide that says "winter, Dec to Feb" is off by a month at the start (see the [crop-table page](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table), which uses calendar months for planting but the engine's winter for the cold curse).

### The Temperature option moves the seasons

The sandbox **Temperature** option shifts the minimum and maximum before the season table is built, which changes the season lengths as well as the heat.

The erosion setup applies the shift before it builds the table :cite[(`zombie/erosion/ErosionMain.java:392-413`)]. Average days per calendar year, 1993 to 2012:

| Temperature option | Max / min (C) | Winter | Spring | Summer | Autumn | Jan mean | Jul mean |
|---|---|---|---|---|---|---|---|
| Very Cold | 15 / -10 | 139 | 51 | 123 | 52 | -9.8 | 14.8 |
| Cold | 20 / -5 | 119 | 57 | 131 | 58 | -4.8 | 19.8 |
| Normal | 25 / 0 | 99 | 63 | 139 | 64 | 0.2 | 24.8 |
| Hot | 29 / 7 | 88 | 65 | 146 | 66 | 7.1 | 28.8 |
| Very Hot | 33 / 15 | 75 | 69 | 152 | 70 | 15.1 | 32.9 |

Hot adds 7.5 to the minimum, truncated to 7, and 4 to the maximum; Very Hot adds 15 and 8 :cite[(`ErosionMain.java:402-407`)]. The January and July means are the average of the daily means before air-mass swings; see [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors).

### Progress through a season

`getSeasonProgression()` is 0 at the start of the season and 1 at the end, and `getSeasonDays()` is the length of this season :cite[(`ErosionSeason.java:357-360`)].

`getSeasonStrength()` is `days / 90 - 1`, so a 100-day winter has strength 0.11 and a 140-day summer 0.56 :cite[(`zombie/erosion/season/ErosionSeason.java:359`)]. The sky colors do not use it: they blend between the previous and next season's palette by `getSeasonProgression()` :cite[(`ClimateManager.java:1393-1441`)]. We found nothing in vanilla Java or Lua that reads the strength apart from a pass-through getter and two debug panels :cite[(`ClimateManager.java:788-789`, `media/lua/client/DebugUIs/DebugMenu/Climate/DailyValuesDebug.lua`, `media/lua/client/erosion/debug/DebugDemoTime.lua`)].

## How long a game day lasts

The **Day Length** option is a number from 1 to 27 that maps to real minutes per game day, and the default is option 4, which is 1 hour 30 minutes.

The options map to real minutes like this :cite[(`SandboxOptions.java:413-423`)]:

| Option | Real time per game day | Per game hour | Per game minute | Per 10 game minutes |
|---|---|---|---|---|
| 1 | 15 minutes | 37.5 s | 0.63 s | 6.3 s |
| 2 | 30 minutes | 75 s | 1.25 s | 12.5 s |
| 3 | 1 hour | 2.5 min | 2.5 s | 25 s |
| **4 (default)** | **1 hour 30** | **3.75 min** | **3.75 s** | **37.5 s** |
| 5 | 2 hours | 5 min | 5 s | 50 s |
| 6 | 3 hours | 7.5 min | 7.5 s | 75 s |
| 27 ("Real-time") | 24 hours | 60 min | 60 s | 10 min |

From option 5 on, the length is `(option - 3) x 60` minutes. These assume normal game speed; the engine's own formula for the pace is `1440 / minutesPerDay` game seconds per real second :cite[(`GameTime.java:218-221`)]. Fast-forward and sleeping multiply the pace :cite[(`GameTime.java:970-988`)]. In multiplayer the server runs the clock and syncs it to clients about every 10 real seconds :cite[(`GameTime.java:571`, `:647-650`)].

Everything weather is tied to game time: a storm of "6 hours" lasts 6 game hours, which is 22.5 real minutes at the default.

## Daylight: the astronomy

`ErosionSeason` computes day length for latitude 38 degrees, so June gets 14.64 hours of daylight and December 9.36.

The latitude is fixed in the season class :cite[(`ErosionSeason.java:90-91`)].

- June solstice: **14.64 hours** of daylight.
- December solstice: **9.36 hours**.
- Between the two it eases with a cosine curve (`clerp`), so the day length changes slowly near the solstices and fastest at the equinoxes :cite[(`:455-458`, `:424-431`)].
- The middle of the day ("high noon") is not fixed at 12:30. It slides from 12.5 in winter to 14.5 in summer, a built-in daylight-saving shift (`summerTilt = 2`) :cite[(`:87`, `:444`)].
- Dawn is noon minus half the daylight; dusk is noon plus half :cite[(`:445-446`)].

For the default year 1993 (first and fifteenth of each month; clock times from the game clock):

| Date | Dawn | Dusk | Daylight | Darkness | Daily mean (C) |
|---|---|---|---|---|---|
| Jan 1 | 7:55 | 17:19 | 9.4 h | 14.6 h | 1.3 |
| Jan 15 | 7:58 | 17:34 | 9.6 h | 14.4 h | 0.6 |
| Feb 1 | 7:57 | 17:57 | 10.0 h | 14.0 h | 0.7 |
| Feb 15 | 7:52 | 18:20 | 10.5 h | 13.5 h | 1.6 |
| Mar 1 | 7:44 | 18:47 | 11.0 h | 13.0 h | 3.1 |
| Mar 15 | 7:35 | 19:15 | 11.7 h | 12.3 h | 5.2 |
| Apr 1 | 7:23 | 19:49 | 12.4 h | 11.6 h | 8.4 |
| Apr 15 | 7:15 | 20:15 | 13.0 h | 11.0 h | 11.1 |
| May 1 | 7:07 | 20:44 | 13.6 h | 10.4 h | 14.5 |
| May 15 | 7:02 | 21:07 | 14.1 h | 9.9 h | 17.4 |
| Jun 1 | 7:02 | 21:30 | 14.5 h | 9.5 h | 20.6 |
| Jun 15 | 7:07 | 21:44 | 14.6 h | 9.4 h | 22.7 |
| Jul 1 | 7:06 | 21:43 | 14.6 h | 9.4 h | 24.4 |
| Jul 15 | 7:02 | 21:28 | 14.4 h | 9.6 h | 25.2 |
| Aug 1 | 7:02 | 21:05 | 14.0 h | 10.0 h | 25.2 |
| Aug 15 | 7:07 | 20:42 | 13.6 h | 10.4 h | 24.3 |
| Sep 1 | 7:16 | 20:11 | 12.9 h | 11.1 h | 22.4 |
| Sep 15 | 7:25 | 19:43 | 12.3 h | 11.7 h | 20.1 |
| Oct 1 | 7:37 | 19:11 | 11.6 h | 12.4 h | 17.0 |
| Oct 15 | 7:46 | 18:43 | 11.0 h | 13.0 h | 14.0 |
| Nov 1 | 7:54 | 18:13 | 10.3 h | 13.7 h | 10.3 |
| Nov 15 | 7:58 | 17:50 | 9.9 h | 14.1 h | 7.3 |
| Dec 1 | 7:58 | 17:29 | 9.5 h | 14.5 h | 4.2 |
| Dec 15 | 7:53 | 17:16 | 9.4 h | 14.6 h | 2.1 |

What it means in play: dawn only moves between 7:00 and 8:00 all year; the year is mostly a story of when dusk comes. Dusk is at 17:16 in mid-December and 21:44 in mid-June, a 4.5-hour swing. Because the daily mean column includes the year's random warm and cold spells, another year differs by a degree or two; the dawn and dusk columns repeat each year.

The `Daily mean` column is the season model's average for the day, not the air temperature you feel. See [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors).

## Night: how darkness ramps

Dawn and dusk are not sharp: full darkness is reached a quarter of the night after dusk.

The "night strength" starts at 0 at dusk, climbs on a cosine curve to a peak at the middle of the night, and falls back to 0 at dawn. The engine doubles it and clamps at 1, so full darkness is reached **a quarter of the night after dusk** and holds until a quarter of the night before dawn :cite[(`ClimateValues.java:299-301`, `ClimateManager.java:2132-2172`)].

| Date | Night length | Full dark after dusk |
|---|---|---|
| Jan 1 | 14.6 h | 3.65 h |
| Apr 1 | 11.6 h | 2.9 h |
| Jul 1 | 9.4 h | 2.35 h |
| Oct 1 | 12.4 h | 3.1 h |

Daylight itself is not full strength all day. The strength is `(1 - night) x (1 - 0.15 x summerness - 0.2 x wind)` :cite[(`ClimateValues.java:305-311`)], so a windy winter day is darker than a calm summer one, and storms push it down further.

### Darkness setting and the minimum ambient light

The sandbox **Darkness during night** option sets the floor of ambient light :cite[(`RenderSettings.java:163-172`)].

| Option | Floor |
|---|---|
| Pitch Black | 0.0 |
| Dark | 0.07 |
| **Normal (default)** | **0.15** |
| Bright | 0.25 |

A moon adds to the floor (next section). **Day / Night Cycle** can pin the game to endless day or endless night :cite[(`GameTime.java:1311-1317`)]: in endless night the dawn, dusk and daylight come out as zero, in endless day the daylight is 24 hours :cite[(`ErosionSeason.java:434-442`)]. The option **Length of nights** is listed in the sandbox but nothing in the code or in vanilla Lua reads it :cite[(`SandboxOptions.java:159`)] (see the [sandbox page](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightlength)).

## The moon

The moon phase is worked out from the date, and it has eight phases of about 3.7 days each.

The date formula is a small calendar calculation :cite[(`ClimateMoon.java:60-82`)]. The formula steps once per 22/6 days, a cycle of about 29.5 days.

| Phase | Light value |
|---|---|
| New | 0 |
| Waxing crescent | 0.25 |
| First quarter | 0.5 |
| Waxing gibbous | 0.75 |
| Full | 1.0 |
| Waning gibbous | 0.75 |
| Third quarter | 0.5 |
| Waning crescent | 0.25 |

The light value does two things :cite[(`ClimateManager.java:1506`, `RenderSettings.java:172`)]:

- It blends the night sky tint between a darker and a lighter color.
- It adds `0.075 x light x night` to the ambient floor. At the default floor of 0.15 a full moon raises it to 0.225, one and a half times as bright as a new moon.

Lua can read the phase with `getClimateMoon():getPhaseName()`, `getCurrentMoonPhase()` and `getMoonFloat()` :cite[(`ClimateMoon.java:48-58`)].

**An odd corner:** the moon code looks up `day_year[month]` with a month number that starts at 0, but its table is written for months that start at 1 :cite[(`ClimateMoon.java:14`, `:65`)]. It is called with the zero-based month :cite[(`ClimateManager.java:826`)]. After January each date is treated as roughly a month earlier. The effect is a phase that is off by a day or two from the real moon, which nobody can tell in a game; the point is only that you should not use it to check a real-world calendar. Not verified in game.

## Day and night and the zombies

The zombies' day and night are the same dawn and dusk this page lists.

The sandbox option **Day/Night Zombie Speed Effect** ("active only") asks the clock whether it is day. `isDay` is true between the season's dawn and dusk :cite[(`GameTime.java:1319-1322`)], and `isZombieActivityPhase` uses it :cite[(`:1328-1332`)]. See the zombie pages in [The Real Numbers](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you).

## Which side knows the season

Every side builds its own season model, but only the server and single player run the climate simulation.

Every side builds its own `ErosionSeason`: single player, the server and each client :cite[(`ErosionMain.java:392-413`)]. The event `OnInitSeasons` fires on each; see [Erosion](/pz/build-42/modding/engine/erosion). 

The climate **simulation** is only run by the server and single player (see [How weather works](/pz/build-42/engine/weather-and-climate/how-weather-works)), so the weather you feel is the server's. A client's own season object most likely drives the season name and progress it shows, the winter sprites and the audio season parameter (not verified: inferred from every side building its own `ErosionSeason`, `ErosionMain.java:392-413`). 

The farming Lua that asks `getSeasonName()` runs on the server :cite[(`media/lua/server/Farming/SFarmingSystem.lua:176`)]. That answers the question the erosion page leaves open: reshaping the season only on the server changes the weather and the server's farming, not what a client displays.

## Odd corners

A few oddities are worth remembering.

- **No "Summer".** The engine's only summer is `Early Summer`.
- **Season 3 is unreachable**, as are its weather rules.
- **The `Length of nights` option does nothing.**
- **Dusk is not 6 p.m. in summer.** It is nearly 10.
- **Default start day.** The option default (23) and the presets (9) disagree.

:::callout[How we know]{kind=proof}
The tables were produced by running copies of the season classes outside the game and by reading the code. The game loads the same code, but this was not compared with a running game. Not verified:
- Dates for non-default settings other than the Temperature option.
- The real-time lengths of the tables; they follow from the formulas, not from a stopwatch.
:::
