---
id: build-42-water-and-plumbing
slug: water-and-plumbing
title: 'Water, plumbing and rain collection'
game: pz
version: build-42
section: engine
category: fire-water-and-power
difficulty: beginner
tags:
  - engine
  - water
  - plumbing
  - rain
  - sandbox
  - multiplayer
excerpt: >-
  When the taps run dry and how that day is rolled, what still gives water afterward, how to plumb a sink to a barrel upstairs, how fast rain fills a container, and which water is tainted.
last_updated: '2026-11-14'
related_articles:
  - how-fire-works
  - fighting-fire
  - electricity-and-generators
  - fire-water-and-power-reference
  - modding-fire-water-and-power
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#what-still-gives-water-after-the-shutoff) | [server owners](#who-runs-it-in-multiplayer) | [modders](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power)

:::callout[The 1-minute version]{kind=key}
- The taps stop being an infinite source on the water shutoff day. The day is rolled once, when the world is made, from the Water Shutoff sandbox option (default "0 - 30 days"), and counted from 7 in the morning of your first day.
- After the shutoff, a sink or toilet plumbed to a barrel on the floor above still gives clean water while the barrel has some. A well fills with clean water if its tile has the infinite flag (tile data, not verified).
- Rain fills open containers outdoors, and the water is tainted unless it is the Well or it comes through a plumbed fixture, which cleans it. At full rain a pot fills in about 15.6 seconds and a 10 liter bucket in about 83 seconds, while a rain collector barrel takes about 5.6 hours (derived from the code, not timed in play).
- Rain, rivers, lakes and puddles give tainted water, unless it comes through a plumbed fixture, which cleans it, or it is the Well. A closed-lid barrel catches nothing.
- Nothing in 42.22 flushes a toilet (not verified in a running game).
- On a server, the day number is used as written in the sandbox file, and the server runs the water use, plumbing and rain filling.
:::

:::facts
- **Water Shutoff option** 9 choices, default "0 - 30 days" (choice 2), the hidden day number defaults to 14
- **Plumbing action** 100 ticks, needs a pipe wrench that is not broken
- **Rain fill formula** `0.005 x rain intensity x snow factor x rain factor x 2.4` liters per tick, 10 ticks a second (read from the code, not timed)
- **Pot** 1.5 L, about 15.6 s at full rain
- **10 liter bucket** 10 L, about 83 s at full rain
- **Rain collector barrel** 600 L, about 5.6 h at full rain
:::

Outcast, the taps work for a while, and then they do not. After that, the water you drink is water you carried, caught or cleaned.

This page covers what the engine does on that day: how the date is chosen, what keeps giving water afterward, how to plumb a sink to your own barrel, how fast rain fills your containers, and which water will make you sick. The inside of a water container (mixing, pouring, boiling, poison) is not repeated here; it is in [The fluid system](/pz/build-42/modding/fluids/the-fluid-system) and [Drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling). How hard it rains is on the [weather pages](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind).

## The water shutoff

A tap is not a real pipe: each time you use it, the game tests whether that tile still counts as an infinite source, and after the shutoff day it does not.

The tap on a sink is a tile with a "piped water" flag. The rule, for a fixture inside a building, is tested in this order :cite[(`zombie/iso/IsoObject.java:2687-2710`)]:

| Test, in order | Result |
|---|---|
| The tile has a `WaterAmount` property of 9999 or more | Always infinite (wells and the like), no matter the date |
| The tile is not in a room | Not infinite |
| The tile has no piped-water flag | Not infinite |
| It has been plumbed to a barrel (see below) | Not infinite; it draws from the barrel |
| The square is in a **No Water** zone or a derelict building | Not infinite, and no reserve either |
| The world age in days is at or past the **water shutoff day** | Not infinite |
| It was picked up and put down again (a moved fixture) | Not infinite |
| Otherwise | **Infinite**, and the water is clean |

Fixtures outside a building are never infinite by this code (the room test comes before the date test). That is a reading of the code and was not tried in a running game.

### How the date is chosen

There are two sandbox options for the water, and only one of them is a date.

| Option | Where you see it | What it is | Default |
|---|---|---|---|
| **Water Shutoff** (`WaterShut`) | The sandbox screen, in World options | A pick from nine choices | "0 - 30 Days" (choice 2) |
| **Water Shutoff** (`WaterShutModifier`) | Hidden unless you run in debug mode | The actual day number the engine tests | 14 |

The options are declared in the sandbox code and shown by the option screen :cite[(`zombie/SandboxOptions.java:79`, `:82-83`; `media/lua/client/OptionScreens/SandboxOptions.lua:584-590`)].

The game turns the nine choices into a day number with `randomWaterShut` :cite[(`SandboxOptions.java:330-342`)]:

| Choice | Label | Day number the game picks |
|---|---|---|
| 1 | Instant | -1 (already off when the world starts) |
| 2 | 0 - 30 days | Random, 0 to 29 |
| 3 | 0 - 2 months | Random, 0 to 59 |
| 4 | 0 - 6 months | Random, 0 to 179 |
| 5 | 0 - 1 year | Random, 0 to 359 |
| 6 | 0 - 5 years | Random, 0 to 1,799 |
| 7 | 2 - 6 months | Random, 60 to 179 |
| 8 | 6 - 12 months | Random, 180 to 359 |
| 9 | Disabled | The largest whole number the game has, so never |

The labels are the English names :cite[(`media/lua/shared/Translate/EN/Sandbox.json:85-93`)]. The top value is never picked, so "0 to 30" means 0 to 29 :cite[(`zombie/core/random/RandAbstract.java:54-55`)].

**When it is rolled.** The roll happens in two places only, both in the client's menus: when the sandbox screen applies its settings :cite[(`media/lua/client/OptionScreens/SandboxOptions.lua:947-953`)], and when you pick a whole preset on the main screen, where the roll is skipped if the day number was already changed from 14 :cite[(`media/lua/client/OptionScreens/MainScreen.lua:1570-1580`)]. The number is then stored with the other sandbox settings of the save. **It is rolled once, when the world is made, not each time you load.** The engine itself never rolls it again from the nine choices.

The server never rolls: the roll is only in those two client menus, and a server's sandbox file carries a finished `WaterShutModifier` number that is used as written. If you edit the file, edit the day number, not the choice. That is read from the code; no server run was made.

**What day it is.** The engine compares the shutoff number against the **world age in days**, which counts from the moment the world began, not from a calendar date :cite[(`zombie/GameTime.java:897-911`)]. The count is measured from 7 in the morning (the age is 24 hours per night survived plus the hours since 7 AM), so on a shutoff of 14 the tap stops being infinite at about 7 AM, 14 days after your first 7 AM. The "Months since the Apocalypse" option adds 30 days for every step above the first, so a start of "2 months" with the default 14 begins after the shutoff has already happened :cite[(`GameTime.java:897-899`)]. The option text mentions July 9, 1993; the code does not read the date.

## What still gives water after the shutoff

A sink plumbed to a barrel, rain containers, a well, water tiles and puddles still give water, and a plumbed sink is the only one of them that gives clean water from rain.

| Source | After the shutoff | Tainted? | Code |
|---|---|---|---|
| **A sink or toilet plumbed to a barrel** | Gives water as long as the barrel has some | **No**: the water is cleaned on the way through | `zombie/iso/IsoObject.java:2923-2938`, `:2948-2967` |
| **A rain barrel, crate or any open container outdoors** | Fills when it rains | **Yes** (tainted) | `zombie/entity/components/fluids/FluidContainerUpdateSystem.java:76-106` |
| **A well** | Infinite (if the tile has the infinite flag, which is tile data, not verified); fills with clean water | No | `media/scripts/generated/entities/appliances/workstations/entity_well.txt:14-21`, `IsoObject.java:2690-2691`, `:2718-2723` |
| **A river, lake or the sea** (a water tile) | Always; takes any amount | **Yes** | `IsoObject.java:2836-2838`, `:2984-2987` |
| **A puddle** on a solid floor with more than 0.09 of puddle on it | You can fill from it; this code does not reduce the puddle | **Yes** | `IsoObject.java:2975-2981` |
| **An untouched piped fixture with a stored reserve** | Gives its reserve and then stops. Which tiles carry a `WaterAmount` reserve is tile data (not verified) | No | `IsoObject.java:2730-2733`, `:3204-3232` |
| **A fixture that was never plumbed and was moved** | Nothing | n/a | `IsoObject.java:2701-2705` |
| **Squares in a No Water zone, and derelict buildings** | Nothing, ever | n/a | `zombie/iso/IsoGridSquare.java:11600-11617`, `IsoObject.java:3209-3210` |

An infinite source that is not an untouched piped fixture gives clean water only if its tile is `camping_01_16` (the Well) or `camping_01_64` to `camping_01_67`; any other gives tainted water :cite[(`IsoObject.java:2712-2728`)]. What the four tiles `camping_01_64` to `_67` look like is tile data that is not in the capture.

Nothing in 42.22 flushes a toilet. A toilet is only a fixture that can have the piped-water flag, and the items have a "fill from toilet" sound; I found no flush action and no waste system (not verified in a running game; the search covered the Lua files and the engine's `zombie` package).

## Plumbing a sink to a barrel

You can bring a sink or toilet back to life after the shutoff by connecting it to a container on the floor above, using a pipe wrench that is not broken.

The tool can be a **pipe wrench** (or any item with the pipe-wrench tag) :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:1578-1593`)].

The game offers "Plumb *name*" when the fixture is in a room, is not already plumbed, and one of these is true :cite[(`ISWorldObjectContextMenuLogic.java:575-588`)]:

1. There is a **source above it** (see below). This holds for a fixture that was moved and put down again (placing a moved piped fixture sets its "can be water piped" mark :cite[(`media/lua/shared/Moveables/ISMoveableSpriteProps.lua:2490-2494`)]), and for any fixture with the piped-water flag.
2. The fixture was **moved**, and the world is **still before** the shutoff day. Here the entry shows even when there is no barrel overhead. With no source found, the fixture then gives nothing; that is read from the code, not tried in play.

The action takes 100 ticks. It marks the fixture "uses an external source" and clears its "can be piped" mark, and tells everyone about it :cite[(`media/lua/shared/TimedActions/ISPlumbItem.lua:31-50`)].

### Where the barrel has to be

The fixture looks for its source on the floor **above**, not on its own floor, and a rain barrel on the roof of your bathroom is the usual answer.

It checks the square directly overhead first, then the eight squares around that one, and takes the first container it finds that has water in it; if none has water, it takes the first container it saw, even an empty one :cite[(`zombie/iso/IsoObject.java:2526-2557`)]. A container counts if it is a "thumpable" (a built object), it is not a floor, it does not itself draw from another source, and its fluid capacity is above 0 :cite[(`:2559-2577`)]. Whether the new rain-barrel objects of 42.22 are accepted by this test was not tried in play.

Once plumbed:

- **Use:** each fill or drink from the fixture takes the water out of the barrel :cite[(`IsoObject.java:2824-2832`, `:2954-2967`)].
- **Clean water:** the water is cleaned as it comes out, so tainted rain water becomes clean :cite[(`:2923-2938`, `:3065-3080`)].
- **Empty barrel:** the fixture has nothing, and shows the barrel's own amount :cite[(`:2747-2756`)].
- **Before the shutoff:** a plumbed fixture is not infinite either; the infinite test returns false as soon as the fixture uses an external source :cite[(`:2696-2697`)].

## Rain collection

Rain fills any container that has a rain factor, sits outdoors, and is open, and the engine does it once per simulation tick on a single-player or server machine.

Clients get the result through the object's sync :cite[(`zombie/entity/components/fluids/FluidContainerUpdateSystem.java:41-58`, `zombie/entity/GameEntityManager.java:99-111`)].

For each such container, each tick:

```
liters added = 0.005 x rain intensity x snow factor x rain factor x 2.4
```

The snow factor is 0.5 when it is snowing and 1 otherwise; the 2.4 is the number of game seconds the engine assigns to a tick :cite[(`FluidContainerUpdateSystem.java:76-101`, `zombie/entity/EntitySimulation.java:35-37`)]. Rain intensity runs from 0 to 1 (see the [weather article](/pz/build-42/engine/weather-and-climate/what-weather-does)). The container must be outdoors, not a multi-tile moveable, and something a player can empty. The closed-lid barrel has no rain factor at all, so it catches nothing.

A simulation tick comes every 100 milliseconds of the simulation clock :cite[(`EntitySimulation.java:39-50`)]. The clock runs at one second per real second at normal speed :cite[(`zombie/GameTime.java:994-1000`)], which makes **10 ticks a second**. That conversion comes from the code and was not timed in play. At full rain:

| Container | Rain factor | Holds | Per tick | Per real minute | Time to fill, full rain | Per game hour, 90-minute day |
|---|---|---|---|---|---|---|
| Pot | 0.8 | 1.5 L | 0.0096 L | 5.76 L | 15.6 s | 21.6 L |
| 10 liter bucket | 1.0 | 10 L | 0.012 L | 7.2 L | 83 s | 27 L |
| Rain collector crate | 0.4 | 400 L | 0.0048 L | 2.88 L | 2.3 h | 10.8 L |
| Rain collector barrel (round) | 0.25 | 600 L | 0.003 L | 1.8 L | 5.6 h | 6.75 L |
| Well | 0.1 | 10,000 L | 0.0012 L | 0.72 L | about 9.6 days | 2.7 L |

The rain factors and sizes come from the item and entity scripts :cite[(`media/scripts/generated/items/normal.txt:4029-4030`, `:13269-13270`; `media/scripts/generated/entities/outdoors/entity_raincollector.txt:14-15`, `:69-70`; `entity_well.txt:14-16`)]. Check: 600 / 1.8 = 333 minutes = 5.6 hours; 400 / 2.88 = 139 minutes = 2.3 hours; 10,000 / 0.72 = 13,889 minutes = 9.6 days.

The rain in a "per game hour" column depends on your Day Length. The tick clock follows the game-speed clock (it runs faster at 5x), not a strict wall clock, and the formula is `ticks per game hour = 25 x day length in minutes`, which is 2,250 at the default 90 minutes and 1,500 at 60. A tick is also **not** a 10-game-minute step: the Lua barrel rule of "4 units every ten game minutes" (see "The old Lua barrel" below) is not what these containers do.

Four more rules:

- **Light rain is slower.** Everything scales linearly with intensity. A shower at 0.3 fills a barrel in a bit over 18 hours (5.6 / 0.3).
- **Snow halves it** (the 0.5 snow factor).
- **The water is tainted.** A rain container makes tainted water unless its script says it fills with clean water, which only the Well does :cite[(`FluidContainerUpdateSystem.java:81-85`, `entity_well.txt:16`)].
- **Roofs and lids block it.** The container must be on an outdoor square :cite[(`FluidContainerUpdateSystem.java:77`)].

### Building a rain collector

A rain collector is a crate or a round barrel built with woodwork, a hammer, planks, nails and garbage bags.

| Collector | Needs | Sprite | Code |
|---|---|---|---|
| Rain collector (crate) | Woodwork 3, a hammer, 4 planks, 4 nails, 4 garbage bags; 50 ticks | `carpentry_02_54` | `entity_raincollector.txt:25-43` |
| Rain collector barrel (round) | Woodwork 5, a hammer, 6 planks, 5 nails, 4 garbage bags; 50 ticks | `carpentry_02_122` | `entity_raincollector.txt:80-98` |

Opening or closing the lid of the barrel swaps it for the closed version and keeps the water; closing takes 10 ticks and opening 15 :cite[(`entity_raincollector.txt:60-63`, `:109-112`; `media/lua/shared/TimedActions/ISOpenCloseLid.lua:33-61`)]. A closed barrel does not catch rain.

### The old Lua barrel

The old Lua rain barrel is still shipped, but it adopts no new barrels, and rain collectors in 42.22 are built entities that use the fluid system above.

The Lua file adds 4 units to a barrel every ten game minutes :cite[(`media/lua/server/RainBarrel/SRainBarrelSystem.lua:42-64`)]. It is still shipped, but its check for "is this object a rain barrel" always answers no :cite[(`SRainBarrelSystem.lua:28-31`)]. A save that already holds the old kind may still run it; I did not test one. The [weather draft](/pz/build-42/engine/weather-and-climate/what-weather-does) describes only the old rule.

### Petrol in a rain container

If a rain-catching container that can be emptied holds **petrol**, a little of it disappears every tick, too little to notice.

The loss is `0.0001 x rain factor / (day length in minutes x 24 / 60)` per tick :cite[(`FluidContainerUpdateSystem.java:61-74`)]. At a 90-minute day that is about 0.7 millionths of a liter per tick for a barrel. It reads as an evaporation rule.

## Which water is tainted

Rain, water tiles, puddles and most infinite sources that are not fixtures give tainted water, while a plumbed fixture, a piped fixture before the shutoff and the Well give clean water.

| Water | Tainted? | Why | Code |
|---|---|---|---|
| Rain collected in a container | Yes | Collector rule above | |
| Water-tile, river, lake | Yes | | `IsoObject.java:2984-2987` |
| Puddles | Yes | | `IsoObject.java:2975-2981` |
| Infinite non-fixture source (except the Well tiles) | Yes | | `IsoObject.java:2712-2728` |
| Anything from a tile carrying the "tainted water" flag | Yes. Which tiles carry it is tile data (not verified) | | `IsoObject.java:3160-3161`, `:3198-3199` |
| A piped fixture before the shutoff | No | | `IsoObject.java:2713-2715` |
| A plumbed fixture | No (cleaned) | | `IsoObject.java:2923-2938` |
| The Well | No | | `entity_well.txt:16` |
| Tainted water in a container that is heated | Becomes clean, a little at a time | See [Drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling) | `zombie/inventory/InventoryItem.java:1475-1484` |

On screen, tainted water is called plain "Water" unless the **Enable Tainted Water text** option (Nature options, default on) is on; the option only changes the label :cite[(`zombie/SandboxOptions.java:180`)]. What drinking it does is on the drinking page linked above.

## Who runs it in multiplayer

On a server, every machine tests the shutoff on its own, and the server (or single player) does the water use, plumbing and rain filling.

| Job | Who does it | Code |
|---|---|---|
| The shutoff test | Every machine, on its own, from the world age and the sandbox setting. No packet carries it | `IsoObject.java:2701` |
| Using water from a fixture or barrel | The server (or single player). A client only asks | `IsoObject.java:2847`, `:2947` |
| Telling others the amount changed | The object's `sync()` and the `OnWaterAmountChange` event, on the server | `IsoObject.java:2790-2791`, `:2851-2852` |
| Plumbing | The timed action finishes on the server, which sends an object change (`USES_EXTERNAL_WATER_SOURCE`) | `ISPlumbItem.lua:31-43` |
| Rain filling | The server or single player only; none on clients | `FluidContainerUpdateSystem.java:43`, `GameEntityManager.java:106` |

The fluid side of syncing is in [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer).

## Where to go next

- [Electricity and generators](/pz/build-42/engine/fire-water-and-power/electricity-and-generators): the power shutoff is similar; the grid test is "at or below" the day and the water test is "at or above", one day apart.
- [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire): a liter of water puts out one burning square.
- [Fire, water and power: the numbers](/pz/build-42/engine/fire-water-and-power/fire-water-and-power-reference): every table in one place.
- [Modding fire, water and power](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 code (`zombie/iso/IsoObject.java:2480-3232` for all the water logic, `zombie/SandboxOptions.java:79-86`, `:330-342`, `zombie/GameTime.java:897-911`, `zombie/entity/components/fluids/FluidContainerUpdateSystem.java`, `zombie/iso/ISWorldObjectContextMenuLogic.java:575-588`, `:1567-1597`, `media/lua/shared/TimedActions/ISPlumbItem.lua`, `media/lua/server/RainBarrel/SRainBarrelSystem.lua`, and the entity scripts named above; Build 42.22, engine revision 3d39148846, Steam build 26486631). Not confirmed: which tiles carry the `WaterAmount` reserve, the infinite flag (9999) or the tainted flag, because they are tile properties in the game's tile packs. Whether the new barrel entities are valid sources for plumbing, and whether a moved fixture before the shutoff with no barrel gives any water, were not tried. The real-time rates in the rain table depend on the 10-ticks-a-second reading above.
:::
