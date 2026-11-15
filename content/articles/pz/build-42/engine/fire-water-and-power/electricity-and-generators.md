---
id: build-42-electricity-and-generators
slug: electricity-and-generators
title: 'Electricity: the grid, generators and lights'
game: pz
version: build-42
section: engine
category: fire-water-and-power
difficulty: intermediate
tags:
  - engine
  - electricity
  - generators
  - lights
  - sandbox
  - multiplayer
excerpt: >-
  When the power grid dies, how a generator decides what to power, what it costs in fuel and condition, how loud and dangerous it is, and how light switches and bulbs work.
last_updated: '2026-11-14'
related_articles:
  - how-fire-works
  - fighting-fire
  - water-and-plumbing
  - fire-water-and-power-reference
  - modding-fire-water-and-power
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#generators) | [server owners](#who-runs-electricity-in-multiplayer) | [modders](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power)

:::callout[Warning: generator fumes]{kind=warn}
A generator running on an indoor square makes the **whole building** toxic, so everyone inside it is hurt, not just people near the generator :cite[(`zombie/iso/objects/IsoGenerator.java:200-203`, `zombie/iso/areas/IsoBuilding.java:569-578`)]. Run it outside.

A gas mask, respirator or improvised gas mask with a filter, or an active SCBA, protects you :cite[(`zombie/characters/IsoGameCharacter.java:15360-15370`)].

Estimate, not timed in play: at normal speed the upper torso loses about 3 health points a second, so a body part can empty in about half a minute (0.1 x 0.5 per update, 60 updates a second) :cite[(`IsoGameCharacter.java:9034-9046`)]. A body part cannot go below 0 :cite[(`zombie/characters/BodyDamage/BodyPart.java:523-525`)].
:::

:::callout[The 1-minute version]{kind=key}
- The world grid exists while the world age in days is at or below the Electricity Shutoff day. The day is rolled once, in the sandbox menus when the world is made (default "14 - 30 Days"), and a server uses the number in its sandbox file as written.
- After the grid is gone, a running generator powers every electrical object in a circle around it: 20 squares and 3 floors above and below at the defaults.
- To use a generator you place it, connect it (Electrical skill 3, or the Electrician or Engineer job, or the knowledge), add petrol while it is off, and turn it on. At condition 50 or lower, half of all tries to start fail.
- Run it outside: indoors it makes the whole building toxic. It is loud (radius 20, 23 or 25 squares by model, halved in a map-made room).
- At condition 20 or lower, each hour carries about a 14.5 percent chance of a fire or an explosion.
- A lamp's bulb can break over time, but room lights never burn out. At Light Bulb Lifespan 0, bulbs never break.
- On a server, the server runs generator fuel, condition, breakdowns and noise, and every machine works out the grid state on its own from the world age.
:::

:::facts
- **Grid test** world age in days at or below `ElecShutModifier` (default 14)
- **Generator range** 20 squares, 3 floors above and below (the defaults)
- **Fuel tank** 10 liters, filled only while the generator is off
- **Fuel multiplier** 0.1 by default in every shipped preset
- **Idle draw** 0.002 L an hour at the default
- **Wear to condition 20** about 1,600 running hours for a Lectromax
- **Fire or explosion** about 14.5 percent each hour at condition 20 or lower
- **Light Bulb Lifespan** default 1.0, range 0 to 1,000
:::

Outcast, there are no wires in Project Zomboid. Nobody lays a cable, and no circuit is ever drawn.

Electricity has exactly two sources: the **world grid**, which exists until a set day and then goes away for good, and **generators**, each of which powers everything electrical inside a circle around it. This page covers both, plus the light switches and bulbs that sit on top of them. It replaces three older pages that mixed 42.19 and 42.20 numbers; where those pages were wrong, a note says so near the end.

## The grid and its shutoff

The grid is a yes-or-no switch for the whole world, with no cables to cut and no substations to hold.

The test is one line :cite[(`zombie/SandboxOptions.java:1289-1295`)]:

> The grid exists while the **world age in days** is less than or equal to `ElecShutModifier`.

| Option | What it is | Default |
|---|---|---|
| **Electricity Shutoff** (`ElecShut`) | A pick of nine choices on the sandbox screen | "14 - 30 Days" (choice 2) |
| **Electricity Shutoff** (`ElecShutModifier`) | The day number the engine tests; hidden unless you run in debug mode | 14 |
| **Alarm Battery Decay** (`AlarmDecay`, `AlarmDecayModifier`) | How long house-alarm batteries last after the power dies | "0 - 30 Days" (choice 2); the modifier is 14 |

The options are declared in the sandbox code and shown by the option screen :cite[(`zombie/SandboxOptions.java:80`, `:84-86`; `media/lua/client/OptionScreens/SandboxOptions.lua:584-590`)].

The game turns the nine choices into a day number with `randomElectricityShut` :cite[(`SandboxOptions.java:344-356`)]. The difference from water is that the shortest range starts at day 14, not 0:

| Choice | Label | Day number picked |
|---|---|---|
| 1 | Instant | -1 (no grid from the start) |
| 2 | 14 - 30 days | Random, 14 to 29 |
| 3 | 14 days - 2 months | Random, 14 to 59 |
| 4 | 14 days - 6 months | Random, 14 to 179 |
| 5 | 14 days - 1 year | Random, 14 to 359 |
| 6 | 14 days - 5 years | Random, 14 to 1,799 |
| 7 | 2 - 6 months | Random, 60 to 179 |
| 8 | 6 - 12 months | Random, 180 to 359 |
| 9 | Disabled | The largest whole number the game has: never |

The labels are the English names :cite[(`media/lua/shared/Translate/EN/Sandbox.json:96-104`)]. The top value is never picked :cite[(`zombie/core/random/RandAbstract.java:54-55`)].

How and when the number is rolled, what "world age" means, and the way "Months since the Apocalypse" shifts it, are written out for water, which works almost the same way (the grid test is "at or below" the day, the water test is "at or above", so the two differ by one day). See [Water, plumbing and rain collection](/pz/build-42/engine/fire-water-and-power/water-and-plumbing). In short: the roll happens once, in the sandbox menus, when the world is made; a dedicated server uses the number in its sandbox file as written (the server loads its sandbox file without rolling; the roll is only in the client menus :cite[(`media/lua/client/OptionScreens/SandboxOptions.lua:947-953`, `MainScreen.lua:1570-1580`)]); and the clock counts from about 7 AM of your first day, not from a calendar date :cite[(`zombie/GameTime.java:897-911`)].

### What the grid powers, and where

The grid reaches a square only if the grid exists and the square is not in a No Power zone or a derelict building, and then the object's place decides the rest.

The check is `hasGridPower`: the grid must exist **and** the square must not be in a **No Power** (or No Power or Water) zone or inside a derelict building :cite[(`zombie/iso/IsoGridSquare.java:11581-11598`, `:11763-11765`)]. On top of that, an object counts as grid-powered when :cite[(`zombie/inventory/ItemContainer.java:2362-2385`, `:2391-2442`)]:

| Where the object is | Powered by the grid? | Code |
|---|---|---|
| In a room of a building | Yes | |
| Outside, but next to (north, south, east or west) a room square | Yes | |
| Outside, with no room beside it | No | |
| A gas pump | Yes, on grid power; or on generator power if the sandbox option **Generator Working in Exterior** is on | `zombie/iso/IsoObject.java:2597` |
| A street light | Only at night (night factor 0.5 or more), and only if the light's own switch, if it has one, is on | |

### The moment the grid goes

Nobody is told by a packet; each machine works out the grid state itself from the world age and the sandbox setting.

The state is kept in a single world flag, `hydroPowerOn` :cite[(`zombie/iso/IsoWorld.java:3333-3339`)]. The flag is set by the ambient sound managers and once at world load :cite[(`zombie/AmbientStreamManager.java:137`, `:610-614`, `zombie/AmbientSoundManager.java:238-248`, `IsoWorld.java:1923`)]. The sequence on a machine that plays sound:

1. The world age passes the shutoff day.
2. The game plays the sound `WorldEventElectricityShutdown` near the closest building, and fires the Lua event **`OnElectricityChanged`** :cite[(`AmbientStreamManager.java:618-647`)].
3. At a marker inside that sound named `ElectricityOff`, the flag turns false and lights and appliances see no power :cite[(`AmbientStreamManager.java:133-139`)].

A dedicated server has no sound, so it waits 2.65 seconds and flips the flag, then fires the event :cite[(`AmbientSoundManager.java:241-256`)]. When you load a save that is already past the shutoff day, the flag is set straight to false with no sound :cite[(`AmbientStreamManager.java:609-611`)].

### Fridges, food and alarms after the cut

After the shutoff, only a generator in range keeps a fridge cold, and an oven or microwave turns itself off when its container loses power.

- **A fridge on the grid** keeps food fresh until the shutoff day. After it, only a **generator** in range keeps it cold. A fridge with no power at all makes food age at the normal rate again :cite[(`zombie/inventory/types/Food.java:764-776`)]. On the cut day itself, between 7 AM and 1 PM, an unpowered fridge's temperature climbs from cold to room temperature rather than jumping :cite[(`zombie/inventory/ItemContainer.java:2459-2462`, `:2480-2487`)].
- **A powered oven or microwave** turns itself off as soon as the container stops being powered :cite[(`zombie/iso/objects/IsoStove.java:82-84`)].
- **House alarms** each roll a decay value (0 to 30, 60, 180, 360 or 1,800 by the **Alarm Battery Decay** choice, 0 for choice 1) when the building is defined :cite[(`zombie/iso/IsoMetaGrid.java:1568`, `SandboxOptions.java:358-367`)]. What an alarm does with that number was not read here.
- **The temperature indoors** also reads the grid flag :cite[(`zombie/iso/weather/ClimateManager.java:721`)]; see [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors).

## Generators

A generator is a heavy object you carry in both hands, place on the ground, connect, fuel and switch on, and while it runs, **every electrical object in a circle around it counts as powered**.

### The four models

The game has four generator models, and they differ in weight, wear and noise.

| Item name | Weight | Wears: condition loss chance each running hour | Noise radius (squares) | Code |
|---|---|---|---|---|
| **Lectromax** (`Base.Generator`) | 40 | 1 in 30 | 20 | `media/scripts/generated/items/normal.txt:4800-4815` |
| **Premium Technologies** (`Generator_Yellow`) | 40 | 1 in 36 | 20 | `normal.txt:4817-4832` |
| **ValuTech** (`Generator_Blue`) | 30 | 1 in 24 | 23 | `normal.txt:4834-4849` |
| **Old** (`Generator_Old`) | 40 | 1 in 25 | 25 | `normal.txt:4851-4866` |

The names are in the translation file :cite[(`media/lua/shared/Translate/EN/ItemName.json:1638-1641`)]. A new generator is any item with the tag `base:generator` and a `WorldObjectSprite`, which is how the game finds the right item type for a placed generator :cite[(`zombie/iso/objects/IsoGenerator.java:142-165`)]. All four have 100 condition at most.

### Setting one up

You place, connect, fuel and switch on a generator, and only connecting and repairing need a skill.

| Step | What you do | The rules | Code |
|---|---|---|---|
| Place | Put it down on the ground | It becomes an `IsoGenerator` object on that square | `IsoGenerator.java:105-117` |
| **Connect** ("Connect Generator") | Needs Electrical skill 3, or the Electrician or Engineer job, or the knowledge ("How to Use Generators" magazine) | Takes 300 ticks. An unconnected generator cannot be started | `zombie/iso/ISWorldObjectContextMenuLogic.java:2155-2156`, `:2217-2231`, `media/lua/shared/TimedActions/ISPlugGenerator.lua:43-48`, `media/lua/shared/TimedActions/ISActivateGenerator.lua:7` |
| **Add fuel** | Petrol in a container with at least 0.1 liter | Only while the generator is **off** and below full. The tank takes **10 liters** at most. The action takes `70 + 50 x liters` ticks | `ISWorldObjectContextMenuLogic.java:2234-2250`, `IsoGenerator.java:514-516`, `media/lua/shared/TimedActions/ISAddFuel.lua:54-67` |
| **Turn on** | Needs fuel above 0 and condition above 0 | Takes 30 ticks. At **condition 50 or lower, half of all tries fail** with a "failed to start" sound | `ISActivateGenerator.lua:5-12`, `:40-45` |
| **Fix** | Needs Electrical 3 (or the knowledge), an Electronics Scrap, and the generator **off** and under 100 | Each scrap adds `4 + Electrical level / 2` condition (the result is cut to a whole number) and 5 Electrical XP; takes `150 - 3 x Electrical level` ticks | `ISWorldObjectContextMenuLogic.java:2252-2273`, `media/lua/shared/TimedActions/ISFixGenerator.lua:6-11`, `:70-71`, `:80-85` |
| **Take** | Only if it is not connected | Picks it up as an item with its condition and fuel | `ISWorldObjectContextMenuLogic.java:2275-2283`, `IsoGenerator.java:133-140` |

Only the connect step and the repair step have the skill gate; adding fuel, switching on and off, and taking are open to everyone.

### The range

A generator powers a **circle**, not a square, and a number of floors above and below.

| Setting | Default | Range | What it does | Code |
|---|---|---|---|---|
| **Generator tile range** (`GeneratorTileRange`) | 20 | 1 to 100 | Radius in squares, measured between square centers | `zombie/SandboxOptions.java:260`, `IsoGenerator.java:119-123`, `:724-730` |
| **Generator vertical range** (`GeneratorVerticalPowerRange`) | 3 | 1 to 15 | Floors above and below the generator | `SandboxOptions.java:261`, `IsoGenerator.java:125-131` |
| **Generator Working in Exterior** (`AllowExteriorGenerator`) | On | on or off | If off, the generator powers only squares that are inside, not outside | `SandboxOptions.java:171`, `zombie/iso/IsoGridSquare.java:9661-9665`, `IsoGenerator.java:324` |

At the defaults the circle holds about 1,250 squares per floor (pi x 20 x 20 = 1,257) on up to 7 floors (the generator's own floor, 3 above and 3 below), about 8,800 squares in all. The vertical reach is limited to floors -32 to 31 :cite[(`IsoGenerator.java:71-72`)]. The game groups the work by 8 by 8 chunks; the number of chunks around the generator it checks is `radius / 8 + 1`, which is 3 at the default :cite[(`:122`)]. Chunks that are not loaded are skipped, and they are re-checked when they load :cite[(`:670-692`)].

### What counts as "powered", and what it costs

A running generator adds up what each powerable object in range draws, and the fuel use is that sum times the Generator Fuel Consumption option (default 0.1).

It looks, once, at every object in range that **could be powered by a generator** :cite[(`IsoGenerator.java:283-340`)]. The draws are in "raw" units, and the table lists them :cite[(`SandboxOptions.java:153`, `IsoGenerator.java:211-213`)].

| Object | Raw draw | At the default 0.1, per hour | When | Code |
|---|---|---|---|---|
| The generator itself (always) | 0.02 | 0.002 L | Always | `IsoGenerator.java:285`, `:498-500` |
| Light (each switched-on, non-street light) | 0.002 | 0.0002 L | While on | `zombie/iso/objects/IsoLightSwitch.java:837-844` |
| A fridge or a freezer alone | 0.08 | 0.008 L | Always | `zombie/iso/IsoObject.java:5195-5207` |
| A fridge with a freezer | 0.13 | 0.013 L | Always | `IsoObject.java:5201-5203` |
| Radio on mains power | 0.01 | 0.001 L | While on | `zombie/iso/objects/IsoRadio.java:31-38` |
| Clothes washer, dryer or combination | 0.09 | 0.009 L | While running | `IsoClothingWasher.java:85-92`, `IsoClothingDryer.java:85-92`, `IsoCombinationWasherDryer.java:109-116` |
| Television | 0.03 | 0.003 L | While on | `IsoTelevision.java:227-234` |
| Stove | 0.09 | 0.009 L | While on | `IsoStove.java:522-529` |
| Stacked washer-dryer | 0.9 for each half running (1.8 with both) | 0.09 L per half | While running | `IsoStackedWasherDryer.java:128-144` |
| Car battery charger | 0.05 | 0.005 L | While on | `IsoCarBatteryCharger.java:388-395` |
| Gas pump (piped fuel) | 0.03 | 0.003 L | Always | `IsoObject.java:5195-5197` |

**One surprise from the code.** The stacked washer-dryer draws **ten times** the single machines: 0.9 for each half, 1.8 with both running. That looks like a slip, but it is what the code says. Televisions and stoves **are** counted: both override `couldBePoweredByGenerator` to return true, a television that is on draws 0.03 and a stove that is on draws 0.09 :cite[(`IsoTelevision.java:227-234`, `IsoStove.java:522-529`)], which is 0.003 and 0.009 L/h at the default multiplier :cite[(`IsoGenerator.java:77`, `:80`)].

An object is also left out of the count if it is already powered by the grid, or if it is outside and the **Generator Working in Exterior** option is off :cite[(`IsoGenerator.java:324`)].

**Worked examples**, with the 10-liter tank, using hours = 10 / (raw sum x multiplier):

| Load | Raw sum | Hours at 0.1 (default) | Hours at 1.0 |
|---|---|---|---|
| Nothing connected | 0.02 | 5,000 | 500 |
| One fridge and freezer | 0.15 | 667 | 66.7 |
| One single fridge | 0.10 | 1,000 | 100 |
| Fridge-freezer, 6 lights, a radio and one washer running | 0.262 | 382 | 38.2 |
| Stacked washer-dryer (both running) and a fridge-freezer | 1.95 | 51 | 5.1 |

The default multiplier is 0.1 in every preset that ships :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:81`)], so a full tank lasts for days or weeks, not hours. Set it to 1.0 and the same tank runs ten times faster.

Do not read "5,000 hours" as safe: wear still counts. A Lectromax reaches condition 20 after about 1,600 running hours :cite[(`IsoGenerator.java:208-216`)], and from then on each hour carries a 14.5 percent chance of a fire or an explosion :cite[(`:254-263`)]. The **Generator Info** window (right-click the generator) shows the fuel percent, the condition, the list of powered objects and the totals in liters per hour :cite[(`IsoGenerator.java:97-98`, `:382`, `:732-749`)].

### Condition and breakdowns

Every in-game hour that a generator runs, its condition can fall, it can backfire, and at low condition it can catch fire or explode.

The checks run once per running hour :cite[(`IsoGenerator.java:200-270`)]:

| Event | Chance each hour | Code |
|---|---|---|
| **Condition falls** | 1 in N (N is the model's wear number above). A hit takes 1 or 2 points | `:208-216` |
| **Backfire** (a loud bang) | Condition 40 or lower: 1 in 15. 30 or lower: 1 in 10. 20 or lower: 1 in 5 | `:235-252` |
| **Fire**, with energy 1,000 | At condition 20 or lower: 1 in 10. The generator is switched off at 0 condition | `:254-258` |
| **Explosion**, when no fire happened | At condition 20 or lower: 1 in 20 of the remaining 9 in 10. Starts fires over 2 floors in a 5 by 5 block with huge energy | `:259-263`, `:787-789`, `zombie/iso/objects/IsoFireManager.java:159-175` |

So at condition 20 or lower, each hour carries about a **14.5 percent** chance of fire or explosion (10 + 0.9 x 5 = 14.5). At an average of 1.5 points per hit, a Lectromax (1 in 30) loses about 0.05 condition an hour, so it takes about **1,600 running hours** to go from 100 to 20; Premium (1 in 36) takes 1,920; Old (1 in 25) takes 1,333; ValuTech (1 in 24) takes 1,280. The generator also turns itself off at 0 fuel or 0 condition :cite[(`:224-233`)]. When it is off nothing wears.

A condition-50-or-lower generator fails to start half the time (table above); repair it before then.

### Noise and fumes

A running generator is loud, and one on an indoor square poisons the whole building.

| Effect | Number | Code |
|---|---|---|
| **Noise while running** | A repeating sound with the model's radius (20, 23 or 25 squares). The model's sound volume is 1 | `IsoGenerator.java:179-198`, `normal.txt:4813-4814`, `:4830-4831`, `:4847-4848`, `:4864-4865` |
| **Indoors** | The radius is **halved** when the generator's square is in a map-made room (20 becomes 10) | `IsoGenerator.java:192-194` |
| **Backfire** | A sound of radius 40, volume 60 | `:251` |
| **Fumes** | A generator on an **indoor** square of a building makes the **whole building** toxic while it runs (see the warning at the top) | `IsoGenerator.java:200-203`, `:535-537` |
| **What toxic does** | Without a gas mask (with a filter) or SCBA, each update: Torso health drops by 0.1 times the update multiplier; fatigue rises slowly; at fatigue above 0.8 the head is hurt too | `zombie/characters/IsoGameCharacter.java:9034-9046`, `:15360-15376` |

How a generator's noise attracts zombies is the same as for any repeating world sound; how far a volume of 1 reaches was not measured. Player-built walls do not count as a room, so they do not halve the radius (a "room" is a map-defined room; this reading was not tried in play).

### Fire and generators

A generator that stands in a burning square is destroyed.

It is switched off, removed from the map, and the burn adds 20 explosion power if it still had fuel :cite[(`zombie/iso/IsoGridSquare.java:6310-6322`)]. See [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works).

## Light switches and bulbs

A light switch works only if it has a bulb and finds power, and only lamps wear their bulbs out.

| Kind | What it is | How it is powered |
|---|---|---|
| **Room light** | A switch on a wall that lights the whole room | Grid, or a generator in range |
| **Lamp or placed light** | A moveable object that has a bulb and can be changed | Grid, a generator, or a battery |
| **Street light** | A tile with the street-light flag | Grid only, at night only |

The kinds are defined in the light switch class :cite[(`zombie/iso/objects/IsoLightSwitch.java:81-108`)]. A switch can be turned on only if it has a bulb and finds power around it :cite[(`IsoLightSwitch.java:422-431`)]. It finds power like this :cite[(`:433-465`)]:

- **While the grid exists:** it counts if the switch itself is in a building (or on a fascia board next to one), or is a street light.
- **After the grid is gone:** it needs a generator that covers its own square.
- Failing both, it also checks the 8 squares around it on its own floor and the 9 on the floor below, with the same two tests.

So a wall switch in a room with a generator in range works, and a lamp outside the circle does not, unless the lamp has a battery.

**Bulbs wear out, but only in lamps.** Room lights never burn out. A lamp (a switch that is not a room light and can be modified) counts the minutes it burns while powered and, every 60 game minutes, rolls to break. A random number from 0 up to `1000 x Light Bulb Lifespan` is compared with the burn minutes divided by 10,000; if it is smaller, the bulb breaks :cite[(`IsoLightSwitch.java:684-751`)]. Under 10,000 burn minutes the divided number is 0, so a bulb with that little wear cannot break. A lamp's bulb does not start at zero: its burn count starts pre-aged from the world's age and the shutoff day :cite[(`IsoLightSwitch.java:700-709`)], so only a bulb you have just replaced is safe at first. At the default of 1.0 and 10,000 burn minutes (about 167 hours) that is a 1 in 1,000 chance per hour; at 100,000 minutes (about 69 days) it is 1 in 100. At **Light Bulb Lifespan 0**, bulbs never break :cite[(`:719-722`)]; the option is in World options, default 1.0, range 0 to 1,000 :cite[(`zombie/SandboxOptions.java:228`)]. The shipped presets set it to 2.0 (Apocalypse, Outbreak), 1.0 (Extinction) and 3.0 (Rising) :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:151`, `Extinction.lua:151`, `Outbreak.lua:151`, `Rising.lua:151`)]. Lamps on battery drain `delta` per minute (default 0.00025 per minute, so a full battery lasts about 4,000 minutes, 67 hours) and switch off at 0 :cite[(`:753-771`, `:60-62`)].

Radios and televisions need grid or generator power too, or batteries for the portable kind. They are covered in the radio pages.

## Who runs electricity in multiplayer

On a server, every machine works out the grid state itself, and the server runs the generators and light bulbs.

| Job | Who | Code |
|---|---|---|
| The grid state | Every machine, from the world age. No packet | `IsoWorld.java:3333-3339` |
| Generator fuel, condition, breakdowns, noise | The **server** (or single player). A client's generator only ticks its sound | `IsoGenerator.java:174-177` |
| Telling clients | Object sync: fuel, condition, switched-on and connected flags, as a **SyncIsoObject** packet (packet 197) | `IsoGenerator.java:603-646`, `zombie/network/PacketTypes.java:518` |
| Switching or connecting a generator | `setActivated` and `setConnected` sync to the other side from either the client or the server | `IsoGenerator.java:556-562`, `:591-600` |
| Which squares have power | Each machine recomputes for its own loaded chunks; a client does it just before the lights are drawn | `IsoGenerator.java:694-702`, `zombie/iso/LightingJNI.java:259-261` |
| Light switches | Server updates bulbs and batteries; every toggle goes through a SyncIsoObject packet | `IsoLightSwitch.java:624-681`, `:684-686` |

## What the older pages got wrong

The older electricity pages say several things that the 42.22 code does not support.

- **The idle draw.** One page says the base draw is about 20 milliliters an hour. It is 0.02 raw, which at the default multiplier is **0.002 L, or 2 milliliters, an hour**. Another figure on the same page, 0.002 L/h, was right.
- **The multiplier is not a baseline.** "An Apocalypse baseline near 0.1 fuel/hr" is the **Generator Fuel Consumption** multiplier (0.1), the same in every shipped preset, not a draw.
- **Noise indoors.** "20 to 15 tiles" is wrong; the radius is **halved**, so 20 becomes 10 :cite[(`IsoGenerator.java:192-194`)].
- **"Down to 1" health.** Indoor fumes drain health by a fixed rate each update; the code has no floor of 1.
- **A model "as vehicle/item-style scripts".** A new generator is an **item** script with the generator tag and a world sprite, not a vehicle script.
- **"Reaching Electrical 3 auto-learns it."** The gate is "skill 3 **or** the knowledge" :cite[(`ISWorldObjectContextMenuLogic.java:2156`)]; there is no learning step in the code that was read.
- **"Exact class and API names are a gap."** They are not: they are on the [modding page](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power).

What the older pages got right, and this page keeps: the television and stove draws (0.003 and 0.009 L per hour), the 20-tile and 3-floor circle, the 10-liter tank that is filled only when the generator is off, the gate for connecting and repairing, the four models and their weights, wear and noise ranges, the repair formula, and the fire and explosion risk under condition 20.

## Where to go next

- [Water, plumbing and rain collection](/pz/build-42/engine/fire-water-and-power/water-and-plumbing): the water shutoff uses the same rule.
- [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works): what a failing generator can start.
- [Fire, water and power: the numbers](/pz/build-42/engine/fire-water-and-power/fire-water-and-power-reference): every table in one place.
- [Modding fire, water and power](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 code (`zombie/iso/objects/IsoGenerator.java` whole file, `IsoLightSwitch.java`, `zombie/inventory/ItemContainer.java:2362-2442`, `zombie/SandboxOptions.java:80-86`, `:344-356`, `:1289-1295`, `zombie/AmbientStreamManager.java:607-652`, `zombie/AmbientSoundManager.java:235-259`, `media/lua/shared/TimedActions/ISAddFuel.lua`, `ISActivateGenerator.lua`, `ISFixGenerator.lua`, `ISPlugGenerator.lua`, and the item scripts named in the tables; Build 42.22, engine revision 3d39148846, Steam build 26486631). Not confirmed: whether the television and stove draws behave in play as the code reads (not run in a game); how far a noise of volume 1 reaches (the engine's sound weighting was not read); whether a player-built enclosure halves the noise; and exactly when the top of each random range for the shutoff day is included.
:::
