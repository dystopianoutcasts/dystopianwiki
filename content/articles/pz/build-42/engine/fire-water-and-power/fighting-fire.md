---
id: build-42-fighting-fire
slug: fighting-fire
title: 'Fighting fire, and fires you control'
game: pz
version: build-42
section: engine
category: fire-water-and-power
difficulty: beginner
tags:
  - engine
  - fire
  - campfire
  - multiplayer
excerpt: >-
  How to put out a fire in Project Zomboid and what it costs, why some fires cannot be put out by hand, and how a campfire, fireplace or barbecue differs from a wild fire.
last_updated: '2026-11-14'
related_articles:
  - how-fire-works
  - water-and-plumbing
  - electricity-and-generators
  - fire-water-and-power-reference
  - modding-fire-water-and-power
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#putting-out-a-wild-fire-by-hand) | [server owners](#who-does-it-in-multiplayer) | [modders](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power)

:::callout[The 1-minute version]{kind=key}
- To put out a wild fire by hand, right-click near it and pick the put-out entry. It works when a burning square or character is within one square of your click and you carry a fire extinguisher, a sandbag, gravel bag or dirt bag, or a water container with at least one full liter.
- One use of the item puts out one square of a 2 by 2 block, and water costs 1 liter per square.
- You can only put out a fire in stages 0 to 3. The last fifth of its life is harmless smoke, and you cannot hit a campfire's flame this way.
- Rain stops a fire from spreading to new squares but does nothing to a fire already burning, and no other player action puts a wild fire out.
- A campfire, fireplace, wood stove or barbecue burns in place for as long as it has fuel, and rain does not put a campfire out in 42.22.
- An indoor campfire is the one controlled fire that can start a wild one, and a bad electric oven or microwave with metal inside can start a big one.
:::

:::facts
- **Extinguisher** 10 uses, 1 use per square
- **Sandbag, gravel bag, dirt bag** 4 uses, 1 use per square
- **Water** 1 liter per square (ten uses of 100 milliliters)
- **Put-out action** 50 ticks
- **Campfire fuel burn** 1 fuel minute per game minute while lit
- **Fuel cap** *Maximum Fire Fuel Hours* times 60 minutes (default 8 hours, 480 minutes)
- **Fireplace smolder** up to 10 game minutes
:::

Outcast, a wild fire has two ways to end: it runs out on its own, or you end it. This page is about the second one, and about the fires that were never wild to begin with: the campfire, the fireplace and the barbecue. If you have not read how a fire lives and spreads, start with [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works); the stage numbers used below come from there.

## Every way a fire ends

A wild fire ends by itself, by the limit on fires, or by your hand, and a controlled fire ends when it runs out of fuel or you put it out.

| Way | What it does | Works on | Code |
|---|---|---|---|
| **Fire extinguisher** | Puts out a 2 by 2 block of squares; costs 1 use per square that was burning | Wild fires, burning people | `media/lua/server/FireFighting/FireFighting.lua:3-18`, `ISExtinguishCursor.lua:160-194` |
| **Sandbag, gravel bag, dirt bag** | The same, 1 use per square | Wild fires, burning people | `FireFighting.lua:11-13` |
| **Water** | The same, but 1 liter (ten uses of 100 milliliters) per square | Wild fires, burning people | `FireFighting.lua:14-16`, `media/lua/shared/defines.lua:53` |
| **Rain** | Stops a fire from spreading to new squares. Does nothing to a fire already burning | Wild fires | `zombie/iso/objects/IsoFire.java:365-367` |
| **Running out of life** | The fire finishes its five stages and disappears | Wild fires | `IsoFire.java:523-546` |
| **Running out of energy** | Energy is spent only by spreading; at zero or below, the fire is removed on the next tick | Wild fires | `IsoFire.java:536-541` |
| **The 75-fire limit** | The 76th fire to start removes the oldest one | Wild fires | `zombie/iso/objects/IsoFireManager.java:71-99` |
| **Player stops burning by chance** | About 1 update in 400 (1 in 150 while running) | A burning player | `zombie/characters/IsoGameCharacter.java:6512-6516` |
| **The "Put out fire" menu entry on a campfire** | Lights out; 10 percent of the fuel is lost | Campfires | `media/lua/shared/Camping/TimedActions/ISPutOutCampfireAction.lua:32-39`, `media/lua/server/Camping/SCampfireGlobalObject.lua:343-348` |
| **Extinguishing a fireplace or barbecue** | Lights out; the fuel smolders for up to 10 game minutes | Fireplaces, wood stoves, barbecues | `zombie/iso/objects/IsoFireplace.java:164-171`, `:388-398` |

No other player action puts a wild fire out. A vehicle cannot burn, so nothing about vehicles matters here (see [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works)).

## Putting out a wild fire by hand

You right-click near the fire, pick the put-out entry, aim a 2 by 2 block with a cursor, walk next to it, and the action runs for 50 ticks.

The game offers the entry only when a burning square or a burning character is within one square of where you clicked, and when you carry something that can do the job :cite[(`zombie/fireFighting/FireFighting.java:20-64`, `zombie/iso/ISWorldObjectContextMenuLogic.java:463-464`)]. The action runs for 50 ticks :cite[(`media/lua/shared/TimedActions/ISPutOutFire.lua:82-87`)].

### Which item the game picks

If you hold something that works, the game uses that, and if not it searches your main inventory for a fire extinguisher, then a sandbag, gravel bag or dirt bag, then any water container.

The search order is fixed :cite[(`FireFighting.java:71-107`, `FireFighting.lua:68-101`)]. It will not pick a water container with less than one full liter in it. Tainted water counts as water :cite[(`FireFighting.java:134-153`)].

| Item | What it holds | Squares it can serve |
|---|---|---|
| Fire extinguisher | 10 uses (use step 0.1) | Up to 10 burning squares (1 use each) |
| Sandbag, gravel bag, dirt bag | 4 uses (use step 0.25) | Up to 4 burning squares |
| A 10 liter bucket of water | 10 liters | Up to 10 burning squares |
| A pot with 1.5 liters | 1.5 liters | 1 square (it needs 1 liter per square) |

The use steps and container sizes come from the item scripts :cite[(`media/scripts/generated/items/drainable.txt:1616`, `:343`, `:359`, `:374`; `media/scripts/generated/items/normal.txt:13269-13270`, `:4029-4030`)].

### What the action does to each square

The action takes the four squares in order, stops fires on characters, removes burning fires, and charges the item for each square it helped.

For each of the four squares, in order :cite[(`ISPutOutFire.lua:53-80`)]:

1. Every character on the square who is on fire stops burning.
2. If the square is flagged **burning**, the fire on it is removed, and the square is marked **burnt out**.
3. If either of those happened, the item pays its uses for that square. When the item cannot pay for another square, the action stops.

Three things to know:

- **You can only put out a fire in stages 0 to 3.** The burning flag is replaced by the smoke flag at stage 4, the last fifth of the fire's life, and the action ignores a square with only the smoke flag :cite[(`IsoFire.java:395-401`, `ISPutOutFire.lua:67`)]. That fifth is harmless smoke.
- **A put-out square is burnt out.** `stopFire` flags the square as burnt, so most things cannot light it again :cite[(`zombie/iso/IsoGridSquare.java:9690-9695`)]. But the objects on the square are only changed by the fire's burn at the start of stage 1 :cite[(`IsoFire.java:475`)]. If you put a fire out during stage 0, which is the first fifth of its life, **nothing on the square has burnt yet**, and it never will.
- **You cannot hit a campfire's flame this way.** The check skips permanent fires :cite[(`FireFighting.java:31`)].

### Who does it in multiplayer

The put-out action finishes on the server, and only the server's version is real.

It calls the server-side `stopFire`, which removes the fire, flags the square and sends a **StopFire** packet to nearby clients; a player who is on fire is told to stop burning by a separate object change :cite[(`ISPutOutFire.lua:53-80`, `zombie/Lua/LuaManager.java:9014-9029`, `zombie/network/packets/StopFirePacket.java:71-85`)]. A client that stops a square on its own machine (single player does exactly that) tells nobody.

## Fires you control

A campfire, a fireplace, a wood stove and a barbecue are all built to burn **in place** and for **as long as they have fuel**.

They are not the same object as a wild fire, and the differences matter.

| | Wild fire | Campfire | Fireplace, wood stove | Barbecue |
|---|---|---|---|---|
| **Object** | An `IsoFire` that counts down its own life | A campfire object plus a **permanent** `IsoFire` that only draws the flame and lights the square | One object (`IsoFireplace`) that tracks its own fuel | One object (`IsoBarbecue`), same fuel rule as the fireplace; some use a propane tank |
| **Fuel unit** | Energy (spent only when it spreads) | Minutes of burning | Minutes of burning | Minutes of burning |
| **Burn rate** | 30 fire ticks per second, no fuel | 1 fuel minute per game minute while lit | 1 fuel minute per game minute while lit | 1 fuel minute per game minute while lit |
| **Spreads to neighbors** | Yes (see page 1) | No. Indoors only, a lit campfire may start a fire on a carpet or wooden floor next door (1 in 5 every ten game minutes) | No | No |
| **Ends by** | Life or energy | No fuel, or you put it out | No fuel, or you put it out | No fuel, or you put it out |
| **Rain** | Stops new spread | Nothing | Nothing | Nothing |
| **Heat** | None | A heat source of temperature 35 | A heat source of temperature 35 | Heat source as well |
| **Fuel cap** | None | The *Maximum Fire Fuel Hours* option times 60 minutes (default 8 hours, 480 minutes) | Same | Same |
| **Code** | `IsoFire.java:241-242`, `:536-541` | `media/lua/server/Camping/SCampfireSystem.lua:97-124`, `:135-145`; `SCampfireGlobalObject.lua:114-123`; `IsoFire.java:89-93`, `:435-441`; `media/lua/server/Camping/camping_fuel.lua:176-179`; `zombie/SandboxOptions.java:251` | `zombie/iso/objects/IsoFireplace.java:48-62`, `:366-402`, `:322-335` | `zombie/iso/objects/IsoBarbecue.java:338-371`; `media/lua/shared/TimedActions/ISBBQAddFuel.lua:6` |

### The campfire in detail

A campfire is a small Lua object that holds whether it is lit, how many fuel minutes it has, and whether it is outdoors.

The object is `SCampfireGlobalObject`, and the engine fire under it is permanent and never spreads :cite[(`media/lua/server/Camping/SCampfireGlobalObject.lua:114-123`)].

| What | Number | Code |
|---|---|---|
| Fuel used while lit | 1 minute per game minute | `SCampfireSystem.lua:135-145` |
| Fuel table (fallback values, hours) | Log 6; plank 2; twigs and sticks 0.25; a sheet 15 minutes | `media/lua/server/Camping/camping_fuel.lua:14-29` |
| How the table is used | The file says most values are now worked out from the item's weight (about two thirds of its weight in hours) or its `FireFuelRatio`, and the lower of the two numbers wins, so read the table as an upper limit | `camping_fuel.lua:1-12` |
| Light and heat radius | `max(2, maxRadius x fuel / 360)`, where fuel is capped at 360 minutes (6 hours); `maxRadius` is 10 outdoors and 18 indoors | `SCampfireGlobalObject.lua:320-327` |
| Container temperature | 1.9 with more than 3 hours of fuel, 1.7 with 3 hours or less | `SCampfireGlobalObject.lua:218-224` |
| Noise to zombies | Every ten game minutes, a sound with radius and volume equal to the fire radius | `SCampfireSystem.lua:153-163` |
| Putting it out | The fuel left is multiplied by 0.9 | `SCampfireGlobalObject.lua:343-348` |
| Lighting it | A lighter or matches plus petrol or tinder, or perced wood plus a stick (kindling) | `media/lua/shared/Camping/ISCampingMenu.lua:250-300` |

Rain does not put a campfire out in 42.22. The only line that would have doubled the fuel use in the rain is commented out :cite[(`SCampfireSystem.lua:140`)].

A lit campfire (or any permanent fire) still sets its square to burning every update and still calls `BurnTick` on it, so a corpse left on the campfire square burns away like any other :cite[(`IsoFire.java:397-405`, `zombie/iso/IsoGridSquare.java:6566-6578`)].

### The fireplace and the wood stove

A fireplace or wood stove keeps a whole number of fuel minutes, puts itself out when the fuel is gone, and smolders for up to 10 game minutes if you put it out with fuel left.

While lit, an `IsoFireplace` spends the **fuel minutes** that have passed since its last update. Put out with fuel left, it **smolders** for up to 10 game minutes, still using fuel, and then goes cold :cite[(`zombie/iso/objects/IsoFireplace.java:366-402`)].

| What | Number | Code |
|---|---|---|
| Light radius | 1 to 8 squares, growing in a straight line with the fuel from 0 to 60 minutes; 60 or more is full | `IsoFireplace.java:297-299` |
| Heat | A heat source of temperature 35 at the same radius | `IsoFireplace.java:49`, `:322-335` |
| Container temperature | 1.8 when lit, 1.0 when not | `IsoFireplace.java:173-175` |
| Smolder time | 10 game minutes | `IsoFireplace.java:48`, `:388-398` |

The fireplace has no engine fire object at all, so it cannot spread and cannot burn a neighbor. The only danger is what you put inside it.

### What can still go wrong

Petrol and burnt food in a campfire or fireplace do not start a fire, but a bad stove or an indoor campfire can.

- **Petrol inside** a heated fireplace or campfire does not light the square. The check that turns heated petrol into a fire explicitly skips campfires and fireplaces :cite[(`zombie/inventory/InventoryItem.java:1486-1499`)]. Food burning past black does the same :cite[(`zombie/inventory/types/Food.java:524-535`)].
- **A bad stove.** An electric oven or microwave with metal inside it can break and start a fire of energy 10,000 about 1 update in 200 while it runs :cite[(`zombie/iso/objects/IsoStove.java:90-101`)]. That is a wild fire, and a big one.
- **An indoor campfire** is the one controlled fire that can start a wild one (table above).

## Where to go next

- [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works): starting, spreading, what it destroys.
- [Water and plumbing](/pz/build-42/engine/fire-water-and-power/water-and-plumbing): where the water for the bucket comes from.
- [Fire, water and power: the numbers](/pz/build-42/engine/fire-water-and-power/fire-water-and-power-reference).
- [Modding fire, water and power](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 code (`zombie/fireFighting/FireFighting.java`, `media/lua/server/FireFighting/*.lua`, `media/lua/shared/TimedActions/ISPutOutFire.lua`, `zombie/iso/objects/IsoFire.java`, `IsoFireplace.java`, `IsoBarbecue.java`, `media/lua/server/Camping/SCampfire*.lua`; Build 42.22, engine revision 3d39148846, Steam build 26486631). Not confirmed: whether the extinguisher cursor reaches a square you cannot walk to was not tested. Barbecue heat radius and propane use were not read in detail; the barbecue is shown here only for the fuel rule. The time a 50-tick action takes in real seconds depends on the action speed setting and was not measured.
:::
