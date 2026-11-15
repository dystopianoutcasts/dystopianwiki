---
id: build-42-how-fire-works
slug: how-fire-works
title: 'How fire works'
game: pz
version: build-42
section: engine
category: fire-water-and-power
difficulty: beginner
tags:
  - engine
  - fire
  - sandbox
  - multiplayer
excerpt: >-
  What starts a fire in Project Zomboid, how it spreads, how long a square burns, what the flames destroy and hurt, and which machine decides it all in multiplayer.
last_updated: '2026-11-14'
related_articles:
  - fighting-fire
  - water-and-plumbing
  - electricity-and-generators
  - fire-water-and-power-reference
  - modding-fire-water-and-power
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#what-can-start-a-fire) | [server owners](#who-runs-the-fire-in-multiplayer) | [modders](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power)

:::callout[The 1-minute version]{kind=key}
- A fire is one small object on one square, and a burning house is many of them, each rolling dice to start the next. A wild fire lives about 27 to 100 real seconds at normal speed (read from the code, not timed in a running game).
- A fire spreads only while it is young, and only if it can pay the energy a neighbor square asks for. A small spark makes a short chain, while a burning generator (1,000 energy) or a petrol can (500,000) does not stop.
- When a square starts to burn, doors, windows, walls, floors and furniture contents are destroyed or swapped for burnt versions, and a container's items are lost.
- A player on a burning square takes damage and may catch fire, and a zombie or an animal catches fire at once. Vehicles are not damaged by fire in 42.22.
- The game keeps at most 75 wild fires alive at once, and the oldest is cleared when a 76th starts.
- On a server, the server starts fires, spreads them and burns things down, while every machine ticks its own copy of each fire's timers. The `NoFire` and `SafehouseAllowFire` options apply.
:::

:::facts
- **Fire life** 800 to 2,999 fire ticks, about 27 to 100 real seconds at normal speed (about 30 fire ticks per second)
- **Stages** stages 0 to 5; the life is split in five parts, the last two half length; the square burns at the start of stage 1
- **Fire limit** 75 wild fires at once
- **Spread attempt** 1 to 3 spots, 1 time in 50 it picks 15 more
- **Corpse burn** about 10 seconds of standing flames (a reading of the code, not timed)
- **Server options** `NoFire` (default false), `SafehouseAllowFire` (default true)
:::

Outcast, a fire in Project Zomboid is not a cloud and it is not a spreading texture. It is one small object, an `IsoFire`, sitting on one square. It has a life (a count-down), an energy (a fuel tank that only shrinks when it spreads), and a stage.

When you watch a house burn, you are watching dozens of these objects, each one rolling dice to start the next. This page explains the dice.

There are three kinds of fire object, and the rest of the page keeps them apart:

| Kind | What it is | Spreads? | Ends by itself? |
|---|---|---|---|
| **Wild fire** | The fire from a Molotov, a stove accident, a generator or a burning body | Yes, while it is young | Yes, when its life or energy runs out |
| **Permanent fire** | The flame under a lit campfire (a fire with `perm` set) | Never | No, a script removes it when the campfire goes out |
| **Smoke** | A fire object that starts at the smoke stage (smoke grenades, the end of a burn) | Never | Yes |

The class builds the permanent, smoke and wild kinds in three separate places :cite[(`zombie/iso/objects/IsoFire.java:89-93`, `:203-217`, `:219-259`)]. How a controlled fire differs from a wild one, and every way to put one out, is on [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire).

## What can start a fire

Every fire comes from one engine call, and the table lists the few things that make it.

The call is `IsoFireManager.StartFire(cell, square, igniteOnAny, energy, life)` :cite[(`zombie/iso/objects/IsoFireManager.java:193-235`)]. The things that call it are few.

| Starter | Energy it gives | Notes | Code |
|---|---|---|---|
| **Molotov cocktail** | 30, with a 30 percent chance per square, burst radius 4 | The trap code caps any burst at 15 squares and needs a clear line from the blast | `media/scripts/generated/items/weapon.txt:19784-19786`, `zombie/iso/objects/IsoTrap.java:773-808` |
| **Flame trap** | 40, 50 percent per square | | `weapon.txt:440-441` |
| **Aerosol bomb** | 20, 10 percent per square, with an explosion | | `weapon.txt:241-242` |
| **Electric oven or microwave with metal inside** | 10,000 | Each update a roll of about 1 in 200, roughly 3 seconds of running at normal speed (derived); the appliance breaks | `zombie/iso/objects/IsoStove.java:90-101` |
| **Food left cooking far past burnt** | 500,000 | In an oven, microwave or any container that is not a campfire or fireplace, and the container must have grid power (a generator-powered oven does not start it); about 1 update in 200 (roughly 3 seconds) once the food is badly burnt | `Food.java:517-519`, `zombie/inventory/types/Food.java:520-536` |
| **Petrol in an item that heats up** | 500,000 | A container heated above 1.6 loses its petrol and lights the square; not in a campfire or fireplace | `zombie/inventory/InventoryItem.java:1486-1499` |
| **A generator in poor shape** | 1,000 | At condition 20 or lower, each hour: 1 in 10 for a fire | `zombie/iso/objects/IsoGenerator.java:254-257` |
| **Burning a corpse** | 100 (life 700 in single player, the default life on a server) | The "burn corpse" action; the server runs it | `zombie/characters/IsoGameCharacter.java:15178-15184` |
| **A body that dies while on fire** | 100 (life 500) | Only if the Fire Spread sandbox option is on | `zombie/iso/objects/IsoDeadBody.java:410-413` |
| **A burning person or zombie** | 80 | About 6 chances in 3,000 per update to light the square they stand on | `IsoGameCharacter.java:8200-8217`, `:558` |
| **Indoor campfire or fireplace** | 100 (life 500) | 1 chance in 5 every ten game minutes while lit indoors, onto a carpet or wood-planked floor next door | `media/lua/server/Camping/SCampfireSystem.lua:97-124` |
| **Explosion of a burning container** | 100 to 250 plus the power | See "What a fire destroys" | `IsoFireManager.java:159-175` |
| **Admin brush tool** | 100 (life 500) | Needs the brush-tool capability | `media/lua/server/ClientCommands.lua:9-17` |

Lightning does not start a fire; the weather code only makes a flash and a sound (see [Rain, snow, fog and wind](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind)).

### Can this square burn at all?

A square refuses a fire when any one of seven tests is true, and the check runs before a fire object is made :cite[(`IsoFire.java:273-291`)].

| Test | Meaning in play |
|---|---|
| A multiplayer server has the **No Fire** server option on (and the fire is not smoke) | No fire of any kind, except campfires, which use the permanent kind |
| The square has no objects | Empty space cannot burn |
| The square is water | Rivers and lakes do not burn |
| The square is already **burnt out** (unless the starter says "ignite on any") | A burnt square stays burnt; only the blast starters above can relight it |
| The square already has a fire or smoke on it | One fire per square |
| The floor tile is marked unflammable | Some tiles never burn |
| On a server, the square is inside a safehouse and **Safehouse Allow Fire** is off | The option defaults to on, so safehouses do burn |

The server options are `NoFire` (default false) and `SafehouseAllowFire` (default true) :cite[(`zombie/network/ServerOptions.java:84`, `:93`)].

## The life of one fire

A wild fire rolls a life of 800 to 2,999 fire ticks when it is made, which is about 27 to 100 real seconds at normal speed (read from the code, not timed in a running game).

The life counts in **fire ticks**, and the roll is between 800 and 2,999 :cite[(`IsoFire.java:228`)]. The class constants say 800 and 3000 :cite[(`:60-61`)].

A starter can force a life instead (the corpse fires above). If the fire was started without a forced life, and the square is not vegetation, the floor tile's fire requirement takes 100 ticks off per point, and a result under 600 is re-rolled between 300 and 599 :cite[(`:233-238`)]. Tougher floors mean shorter fires.

A fire tick is not a second. The fire advances by half a tick on every game update at normal speed :cite[(`:444`, `zombie/GameTime.java:986`, `:1032-1034`)]. The Speed sandbox option nudges this by up to 20 percent :cite[(`zombie/SandboxOptions.java:300-306`)]. The game assumes 60 updates a second :cite[(`GameTime.java:202-208`)].

That makes **about 30 fire ticks per real second at normal speed**, so a fire lives about **27 to 100 real seconds** at 1x, and five times shorter at 5x speed. On a floor with a high fire requirement, the life can be cut to 300 to 599 ticks, about **10 to 20 seconds** :cite[(`:233-238`)]. That conversion is read from the code, not timed in a running game.

A fire's life is split into five equal parts, called stages. Let `d` be one fifth of the life.

| Stage | Lasts | What it is | What happens |
|---|---|---|---|
| 0 | `d` | Flames start | The square is flagged **burning**. Light radius 5 |
| 1 | `d` | Flames grow | At the start, the square **burns** (objects change, see below). Light radius 5. Spreading begins |
| 2 | `d` | Big flames | Light radius 8 |
| 3 | `d` | Tallest flames | Light radius 12 |
| 4 | `d / 2` | Dying | The square is flagged **smoke** instead of burning. Light radius 8 |
| 5 | `d / 2` | Smoke only | Light radius 1, fading out |

The code splits the life, changes the stage effects and sets the flags in separate places :cite[(`IsoFire.java:241-242`, `:471-519`, `:395-401`)]. The stages add up to exactly the life, so the fire object is removed in the same tick its smoke ends :cite[(`:523-546`)]. It also ends early if its energy ever reaches zero. Energy only goes down by spreading, so a fire that never spreads burns its whole life.

The square does its damage once, at the start of stage 1, which is the end of the first fifth of the life :cite[(`IsoFire.java:475`)]. Stage 1 and 2 both call it, but the second call finds the square already burnt out and does little more than strip sheet ropes and barricades :cite[(`zombie/iso/IsoGridSquare.java:6234-6271`, `:6274`)].

### Fires in squares you cannot see

A fire that is left alone for about a game minute and a half is out by the time you walk back, but loading the chunk burns it at once.

A fire object is only updated while its square is loaded. When the chunk loads again, the fire is aged by the game-clock time that passed, one tick per 30 game milliseconds :cite[(`IsoFire.java:449-460`)]. One game minute is 2,000 ticks, and the longest possible life is 3,000 ticks.

That is not a free pass: on load the game replays every missed tick, so the burn at stages 1 and 2 and the spreading all run :cite[(`:449-460`, `:476-488`)].

## How a fire spreads

A fire spreads only while it is in stages 1 to 3, and each attempt costs it energy from its own tank :cite[(`IsoFire.java:303`, `:525-534`)].

The fire rolls a **spread delay** when it is made, a number of ticks between 0 and about half its life :cite[(`IsoFire.java:240`)]. Every time that many ticks pass, it tries once. (A delay of 0 never counts down, so such a fire never spreads.)

One attempt works like this :cite[(`IsoFire.java:298-379`)]:

1. It picks **1 to 3 spots**, and 1 time in 50 it picks 15 more :cite[(`:305-308`)].
2. Each spot is one of 13 squares picked at random: the 8 neighbors on the same floor, 4 squares on the floor below (the one straight down, and the three that are one step north and/or west of it), and the one straight up :cite[(`:315-355`)].
3. The spot is skipped if it cannot burn (the table above) :cite[(`:357`)].
4. The fire pays the spot's **energy requirement** from its own energy. If it cannot pay, it skips :cite[(`:358-360`)].
5. If it is raining, the whole attempt stops there. **The energy is already paid.** The rain does not stop a fire that is already burning :cite[(`:365-367`)].
6. Otherwise a new fire starts. Outdoors it gets all the energy the parent has left. Indoors it gets only twice the requirement :cite[(`:369-370`)].

The energy requirement of a square is the floor tile's own `FireRequirement` number whenever the square has a floor tile. If there is no floor tile, it is 30, or 15 for vegetation, or 40 indoors :cite[(`IsoFire.java:604-619`)]. When a starter makes a fire, the floor's requirement is taken off the starting energy again, with a minimum of 5 :cite[(`IsoFireManager.java:195-201`)], and vegetation adds 50 :cite[(`IsoFire.java:254-256`)]. The requirement numbers for each floor are in the tile packs, which are not part of the engine capture, so this page cannot list them (not verified).

A worked example, assuming every square asks for 30 and every floor takes 30 off: fire A starts with 100 energy. Its first success costs 30 and leaves 70; the new fire B starts with 70 minus 30, so 40.

A can pay again (70 to 40, then 40 to 10). B can pay once (40 to 10), and its child C starts at 10 minus 30, which is under the minimum, so 5. C can pay nothing more.

One match-sized spark makes a chain about three squares long and a fan of about three at the start, then stops. A big starter such as a burning generator (1,000) or a petrol can (500,000) does not stop.

### The 75-fire limit

The game keeps at most **75 wild fires** alive at once, and a 76th clears the oldest.

The limit is a constant in the fire manager :cite[(`IsoFireManager.java:55`)]. The cleared fire's square loses the burning and smoke flags and the fire object is removed on the spot :cite[(`:71-99`)]. A huge blaze therefore cannot grow past 75 burning squares; it eats its own tail. Permanent fires are not counted :cite[(`IsoFire.java:688-695`)].

### Fire Spread sandbox option

The **Fire Spread** option (World options, default on) turns off all spreading when it is off :cite[(`IsoFire.java:300`, `zombie/SandboxOptions.java:169`)].

Starting a fire still works. A burning person lighting the ground under them is controlled by the same option :cite[(`IsoGameCharacter.java:8201`, `:8210`)].

## What a fire destroys

When a square starts to burn, its doors, windows, walls, floors, roofs and the contents of its furniture are removed or swapped for burnt versions.

### Squares and objects

When a fire reaches the start of stage 1, it calls `Burn()` on the square :cite[(`IsoFire.java:475`, `IsoGridSquare.java:6205-6212`)], which runs `BurnWalls`. In order, that does the following to everything on the square :cite[(`IsoGridSquare.java:6222-6556`)]:

| Thing | What happens | Code |
|---|---|---|
| Sheet ropes, window sheets, barricades | Removed first | `:6234-6271` |
| Doors, windows, curtains | Removed | `:6353-6365` |
| Walls | Swapped for a burnt wall tile of the same shape | `:6333-6351` |
| Interior floors | Swapped for a burnt floor | `:6375-6377` |
| Radios and televisions (wave-signal devices) | Removed | `:6379-6391` |
| Furniture with a container | The container is emptied of every item, and the object becomes a burnt-floor tile | `:6393-6420` |
| Roofs | Swapped for a burnt roof | `:6428-6438` |
| Things hung on walls | Removed | `:6443-6458` |
| Fences and railings | Swapped for burnt versions | `:6439-6474` |
| Trees | Get a burnt sprite; they are not removed | `:6307`, `:6512-6523` |
| Objects with a burnt tile of their own | Swapped for it | `:6297-6306` |
| Anything with a fire requirement of 800,000 or more | Cannot burn | `:304`, `:6294` |
| A dead body on the square | Burns for a while, then the body is removed and a burnt-floor tile is left (see below) | `IsoGridSquare.java:6566-6578`, `zombie/iso/objects/IsoDeadBody.java:1442-1472` |

At the end the square is flagged **burnt out**, which stops most fires from starting there again :cite[(`:6550-6551`)].

### Chain explosions

A burning square with alcohol, petrol, bleach or a fueled generator on it can explode and light the squares around it.

While burning a square, the code adds **20 power** for every alcohol drink, petrol can or bleach bottle in a container there (capped at 100), and 20 for a generator that still has fuel; the generator itself is deleted and switched off first :cite[(`IsoGridSquare.java:6310-6322`, `:6393-6404`)]. If the total is above zero, the square makes a "burned object exploded" sound and calls `IsoFireManager.explode`. That visits every square within 2 tiles in each direction on this floor and the floor above; each one catches fire with a chance equal to the power in percent, and is burnt at once :cite[(`IsoFireManager.java:159-175`)]. So a kitchen with three bottles of whiskey on the shelf (60 power) lights about 60 percent of a 5 by 5 block on two floors.

### People, zombies, animals and cars

A player on a burning square takes damage and may catch fire, while a zombie or an animal catches fire at once.

| Who | When they are on a burning square | Code |
|---|---|---|
| **A player** | Takes damage every update, and each update has about 1 chance in 70 (about 1 second at normal speed) to **catch fire** | `IsoGameCharacter.java:5968-6005` |
| **A zombie** | **Catches fire at once** | `:5976-6000` |
| **An animal** | Catches fire at once | `:5976-6000` |
| **Another survivor (not a player)** | Takes damage; does not catch fire | `:5977-5980` |
| **Someone sitting in a vehicle** | Nothing: the check is skipped when the character is in a vehicle | `:5974` |
| **A burning player** | Takes twice the damage of standing in flames, and each update stops burning with about 1 chance in 400 (1 in 150 while running) | `:6483-6487`, `:6512-6516` |
| **A burning zombie** | Takes damage at one twentieth of the rate a burning non-player survivor does | `:6488-6491` |
| **A burning animal** | Takes nine tenths of the non-player survivor rate | `:6492-6496` |

The base rate is `fireKillRate`, 0.0038 :cite[(`IsoGameCharacter.java:557`)]. A burning body part on a player is also marked as burnt when they first catch fire :cite[(`:8176-8179`)]. A burning character lights the square under them only if Fire Spread is on (see the table of starters).

**Vehicles are not damaged by fire in 42.22.** No code in the vehicle package starts, reads or reacts to a fire; the only "burnt" cars are pre-made script variants placed on the map. A fire object does not block a car either :cite[(`zombie/vehicles/BaseVehicle.java:1079-1085`, `:1616-1618`)]. The whole vehicle package was searched for the fire manager and the burning flag, with no hits. Fuel in a car is not a fire starter in this code.

### Dead bodies

A body on a burning square is removed after about 10 seconds of standing flames, and a burnt-floor tile is left (a reading of the code, not timed).

The burn time builds at a rate that depends on game speed. When the timer reaches 10, the body is removed and a "burnt corpse" floor tile is placed :cite[(`zombie/iso/objects/IsoDeadBody.java:1442-1472`)]. At normal speed the timer gains about one unit per real second :cite[(`GameTime.java:206-208`)].

## Smoke, light and noise

Smoke blinds zombies that stand in it, and fires add light, heat and sometimes noise.

- **Smoke blinds zombies.** Only a zombie standing on a square with the smoke flag drops its target and cannot pick a new one; zombies elsewhere are not blinded :cite[(`zombie/characters/IsoZombie.java:2072`, `:2351`)]. The smoke flag is set for stage 4 and 5 of every fire and for smoke grenades. Animals on a smoke square do not react to people either :cite[(`zombie/characters/animals/behavior/BaseAnimalBehavior.java:1537`)].
- **Fires are noisy sometimes.** One time in five, a wild fire makes a sound at its square with radius 20 :cite[(`IsoFireManager.java:225-227`)].
- **Light.** The light radius is 1, 5, 8 or 12 squares depending on the stage :cite[(`IsoFire.java:49-52`, `:477-517`)]; the color is a fixed orange. A permanent fire also acts as a **heat source** with temperature 35 :cite[(`IsoFire.java:435-441`)], which is how a campfire warms you.
- **Fire sound.** At most 20 fires play sound at once, the ones closest to the listener :cite[(`IsoFireManager.java:69`, `:373-410`)].

## Who runs the fire in multiplayer

On a server, the server starts, spreads and burns everything, and each machine only ticks its own copy of the fire timers.

| Job | Who does it | Code |
|---|---|---|
| Starting a wild fire | The **server** (or single player). A client that calls `StartFire` only gets a warning; the four-argument version does nothing on a client | `IsoFireManager.java:204-205`, `:265-269` |
| Telling clients | The server sends a **StartFire** packet (packet 203) to clients near the square, with the energy, life, spread delay and flame count | `IsoFireManager.java:208-222`, `zombie/network/packets/StartFirePacket.java:84-95` |
| Smoke | A client that wants smoke sends the same packet to the server | `IsoFireManager.java:239-249` |
| Spreading | Never on a client (`if (!GameClient.client)`); the new energy is sent as an object change | `IsoFire.java:299`, `:361-363` |
| Burning things down | Server only; clients just receive the replaced and removed objects | `IsoGridSquare.java:6223`, `:6301-6305` |
| Putting a fire out | The server stops it and tells clients (packet 204, **StopFire**) | `zombie/Lua/LuaManager.java:9014-9029`, `zombie/network/packets/StopFirePacket.java:71-85` |
| Fire timers (stage, life) | Every machine ticks its own copy of each fire, so the flames and light match without more packets | `IsoFireManager.java:283-305` |
| People on fire | The server keeps a list and runs the spreading for them | `IsoFireManager.java:283-286`, `IsoGameCharacter.java:3705-3714` |

The server options `NoFire` and `SafehouseAllowFire` are checked on the server and by the client's own copy of `CanAddFire` :cite[(`IsoFire.java:274`, `:289-290`)]. The ready-made option tooltip text for a server option called "No Fire Spread" is still in the translation files, but the engine has no such option; spreading is now the sandbox option "Fire Spread" :cite[(`media/lua/shared/Translate/EN/UI.json:1212`; `ServerOptions.java` has only `noFire` and `safehouseAllowFire`)].

## Where to go next

- [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire): every way to put a fire out, and campfires and stoves.
- [Fire, water and power: the numbers](/pz/build-42/engine/fire-water-and-power/fire-water-and-power-reference): every number from this page in one place.
- [Modding fire, water and power](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power): starting and stopping fires from Lua.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled code (`zombie/iso/objects/IsoFire.java` whole file, `zombie/iso/objects/IsoFireManager.java`, `zombie/iso/IsoGridSquare.java:6205-6578`, `zombie/characters/IsoGameCharacter.java:5968-6005`, `:6476-6520`, `:8158-8217`, `zombie/network/packets/StartFirePacket.java`, `StopFirePacket.java`; Build 42.22, engine revision 3d39148846, Steam build 26486631). Not confirmed: the floor tile fire requirements and which tiles are unflammable are tile data in the game's tile packs, which are not in the capture. The real-time length of a fire (27 to 100 seconds at normal speed, 10 to 20 on tough floors) and a corpse's burn time (10 seconds) are worked out from the code and were not timed in a running game. How much health `ReduceGeneralHealth` removes per update in play was not measured; only the formula is given.
:::
