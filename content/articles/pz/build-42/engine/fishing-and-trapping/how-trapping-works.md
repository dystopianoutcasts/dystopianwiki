---
id: build-42-how-trapping-works
slug: how-trapping-works
title: 'How trapping works'
game: pz
version: build-42
section: engine
category: fishing-and-trapping
difficulty: intermediate
tags:
  - engine
  - trapping
  - animals
  - explosives
  - multiplayer
excerpt: >-
  How animal traps catch animals in Project Zomboid 42.22, why they only roll while nobody is near, what bait and skill do, and how explosive, flame, smoke and noise traps work.
last_updated: '2026-11-14'
related_articles:
  - how-fishing-works
  - fish-and-where-to-find-them
  - fishing-nets-and-other-methods
  - fishing-and-trapping-reference
  - modding-fishing-and-trapping
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#part-1-animal-traps) | [server owners](#multiplayer) | [modders](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)

:::callout[The 1-minute version]{kind=key}
- The dice only roll while you are far away: an animal trap is rolled once per game hour, and only if its square is not loaded in memory. Stand next to your trap all night and nothing will walk in.
- Put fresh, uncooked food in the trap that your animal likes, in a zone it lives in. Rabbit, raccoon and squirrel are active only from 19:00 to 05:59, while mice, rats and birds are active at any hour.
- Your Trapping level when you placed the trap is what counts: leveling up later does not improve a trap you already placed.
- A trap with an animal in it, on a loaded square, can make noise that zombies hear (a 1 in 4 chance every 10 game minutes), so set traps away from where you sleep. Collect trapped animals within a day.
- Explosive, flame, smoke and noise traps are a separate Java system with real-second timers. After its arming delay, a sensor trap goes off when a living thing that is not invisible comes into range with a clear line to the trap, including you and other players.
- On a server, the server owns the animal-trap system and the explosive timers and sensors.
:::

:::facts
- **Hourly roll** once per game hour, about every 3.75 real minutes at the default day length (a conversion, not a measurement)
- **Rabbit-type window** 19:00 to 05:59, 11 checks a night, about 41 real minutes
- **Skill bonus** +1.5 percentage points on each of two rolls per Trapping level
- **Trap health** 50
- **Trapped-animal noise** 1 in 4 every 10 game minutes for a trap with an animal in it on a loaded square, radius 40, volume 10
- **Sensor and timed traps** timers count real seconds at game speed 1x
- **Explosion circle** capped at radius 15
:::

Outcast, a trap is patience turned into dinner. You set a cage in the woods, hang a carrot in it and walk away. The next morning, if the dice were kind, something is inside.

The important thing to know up front is that **the dice only roll while you are far away**. Stand next to your trap all night and nothing will ever walk in.

This page covers two different systems that share the word "trap":

1. **Animal traps** (crate, box, cage, snare, stick trap, mouse trap). A Lua system that rolls once per game hour.
2. **Explosive, flame, smoke and noise traps.** A Java object, `IsoTrap`, with timers, sensors and explosions.

Citations are named from `game_snapshot/media/lua/` for Lua, `src/` for Java and `game_snapshot/media/` for scripts. All 42.22 capture. "Not verified" means read in code, not tested in a running game.

## Part 1: animal traps

Animal traps roll once per game hour for a catch, and only while the trap's square is not loaded because nobody is near.

### The six traps

The six animal traps differ in weight, hardness, materials and the Trapping level at which the recipe is learned.

| Trap | Item | Weight | Hardness | Open sprite | Made from | Recipe learned at |
|------|------|-------:|---------:|-------------|-----------|-------------------|
| Crate trap | `Base.TrapCrate` | 5 | 15 | `constructedobjects_01_3` | 3 planks, 5 nails; saw and hammer | Trapping 4 (recipe `MakeWoodenBoxTrap`) |
| Box trap | `Base.TrapBox` | 5 | 15 | `_4` (north `_7`) | 4 planks, 7 nails; saw and hammer. Needs Woodwork 1 and Trapping 2 | Trapping 8 |
| Cage trap | `Base.TrapCage` | 5 | 20 | `_8` (north `_11`) | 5 wire; pliers. Needs Trapping 3 | Trapping 5 |
| Snare | `Base.TrapSnare` | 0.5 | 10 | `_16` | 1 plank, 2 twine; saw. Needs Trapping 1 | Trapping 6 |
| Stick trap | `Base.TrapStick` | 1 | 15 | `_13` | 4 sticks, 1 twine | Trapping 2 |
| Mouse trap | `Base.TrapMouse` | 0.3 | 50 | `_18` | Found as loot; no recipe in the capture | none |

The items are in the item scripts, the hardness and sprites in the trap definition, and the recipes in the trapping recipes :cite[(`scripts/generated/items/normal.txt:11682-11737`; `server/Traps/TrapDefinition.lua:1-47`; `scripts/generated/recipes/recipes_trapping.txt:3-105`)]. The learn level is the `AutoLearnAny = Trapping:N` line: at that skill the recipe is known without a book. "Hardness" is the game's name `trapStrength`.

The closed sprite is shown when something is inside :cite[(`TrapDefinition.lua:3-47`; `server/Traps/STrapGlobalObject.lua:46-50`)].

**Snare and mouse trap are not obstacles, when you place them.** Their object is set to let you walk through and cannot be thumped. Every other trap fills its square and can be hit :cite[(`server/Traps/BuildingObjects/TrapBO.lua:15-24`)]. **Map-placed traps differ:** the map-object code tests a variable named `sprite` that does not exist in that function (the parameter is `spriteName`), and tests only sprite `_16`, so a map-placed mouse trap blocks its square and can be thumped, and the snare test probably never matches (not verified in game) :cite[(`server/Map/MapObjects/MOTrap.lua:40-56`)]. Every trap has **50 health** :cite[(`TrapBO.lua:12-13`; `MOTrap.lua:69-70`)].

### Placing a trap

You right-click a trap in your pack, choose "Place Trap" and drag a ghost onto a valid square.

The menu route is in the inventory and trap menus :cite[(`client/ISUI/ISInventoryPaneContextMenu.lua:826-832`; `server/Traps/ISUI/ISTrapMenu.lua:129-131`)]. The square is valid only if :cite[(`server/Traps/BuildingObjects/TrapBO.lua:108-117`)]:

- No creature is standing on it.
- It does not already hold a trap.
- It is not a tree square.
- It has a solid floor and nothing solid on it.
- **It is not next to something an animal could use to climb in**: any neighbor to the north, south, east or west that you could hop over, or a window or window frame on the square or the south or east neighbor :cite[(`client/Traps/CTrapGlobalObject.lua:30-45`)].

That last rule matters later: the server runs it again every hour, and if you build a window next to the trap afterwards, **it removes the bait and any animal** :cite[(`server/Traps/STrapGlobalObject.lua:391-403`, `:562-577`)].

At the moment you place it, the game records the **zones** at the square (the map zones, such as Forest or Farm), the **placer's name** and the placer's **Trapping level**, and stores them in the trap's mod data :cite[(`shared/Traps/TrapSystem.lua:29-52`)]. The level is a snapshot: **leveling up later does not improve a trap you already placed.**

### Baiting

You add bait from the trap's menu, and the bait must be fresh, uncooked food.

Open the trap's menu and choose "Add Bait". What the list shows :cite[(`server/Traps/ISUI/ISTrapMenu.lua:9-15`, `:40-66`)]:

- Food you carry that is **not cooked**, has no extra ingredients added, and is not a drink.
- It must either remove at least 0.05 hunger, or be on some animal's bait list.

Adding bait takes **20** :cite[(`shared/Traps/TimedActions/ISAddBaitAction.lua:61`)]. It does not use up the food.

It takes **0.05 hunger** off the food item, and the food is used up only when under 0.01 is left :cite[(`ISAddBaitAction.lua:36-52`)]. Only one bait sits in a trap at a time. "Discard Bait" takes 20 :cite[(`shared/Traps/TimedActions/ISRemoveBaitAction.lua:51`)].

**The menu lists more than works.** Any food passes the filter, but an animal is only attracted by the exact items in its own list (below). A cabbage leaf in a mouse trap attracts nothing, though the bait can still be stolen.

**Bait must be fresh.** The game remembers the bait's age in days when you set it and adds a day every midnight :cite[(`server/Traps/STrapSystem.lua:72-83`)]. Each hour it checks that the age is below the item's "days fresh" :cite[(`STrapGlobalObject.lua:529-531`; `zombie/Lua/LuaManager.java:8599-8601`)]. Stale bait draws nothing.

### The hourly roll

Once per game hour the server walks every trap, and the roll for animals runs only for traps whose square is not loaded.

The pass is registered on `Events.EveryHours` and covers every trap in the world :cite[(`server/Traps/STrapSystem.lua:85-92`, `:133`)]. For each trap it calls `calculTrap` :cite[(`STrapGlobalObject.lua:100-116`)].

**Only traps with nobody near are rolled for animals.** The game asks for the trap's square. If that square is loaded in memory (a player is close enough to have it streamed in), the roll for animals is skipped and the only thing checked is the window and fence rule above :cite[(`STrapGlobalObject.lua:391-403`)]. If the square is not loaded, the roll runs :cite[(`STrapGlobalObject.lua:404-424`)]. The comment in the code says it plainly: "you won't find an animal if a player is near the trap".

How near is "near"? Whatever the game keeps loaded around each player: a square of chunks of 8 tiles on the client: 13 chunks (104 tiles across) on a 720p screen and up to 19 (152 tiles) on 1080p. Smaller screens give fewer, so 13 is a lower bound only from 720p up :cite[(`zombie/iso/IsoChunkMap.java:54`, `:113-126`)]. The server's own loaded area was not traced. In practice: **leave the area, and the roll can run.**

If the trap has bait, the game tests every animal against it :cite[(`STrapGlobalObject.lua:368-388`)]. An animal "passes" when **all** of these hold:

1. The animal can use this trap type.
2. The bait is on the animal's list.
3. A random number from 0 to 99 is below `trap chance + bait chance + 1.5 x trapping level`.
4. The current game hour is inside the animal's active window (for rabbit, squirrel and raccoon: 19:00 to 05:59 inclusive, 11 checks a night; the others are always active) :cite[(`STrapGlobalObject.lua:533-541`)].
5. The animal lives in one of the trap's recorded zone types.
6. A second random number from 0 to 99 is below `zone chance + 1.5 x trapping level`.
7. The bait is fresh.

The roll runs once for **each zone type** the trap square lies in. All animals that pass are put in a list, and **one is picked evenly** :cite[(`STrapGlobalObject.lua:407-424`)]. It becomes the occupant: the bait is removed, the sprite switches to the closed one and the trap's data is sent to clients :cite[(`STrapGlobalObject.lua:427-443`)].

Both rolls add 1.5 per Trapping level. At level 10 that is +15 on each. A value of 100 or more always passes.

### The animals

Rabbit, raccoon and squirrel are caught in cages, snares, boxes and crates at night, mouse and rat in a mouse trap, and a bird in a stick trap.

All numbers are from `server/Traps/TrapDefinition.lua`. "Size" is the random range used when you collect a dead animal, as a hunger value in hundredths (the upper end is not included).

| Animal | If it comes out dead | Size | Active | Traps (base chance) | Code |
|--------|-------------|-----:|--------|---------------------|-------|
| Rabbit | An animal corpse | 30 to 99 | 19:00 to 05:59 | Cage 40; snare, box, crate 30 | `:51-104` |
| Squirrel | `Base.DeadSquirrel` item | 10 to 59 | 19:00 to 05:59 | Cage 40; crate, snare 30; box 25 | `:106-143` |
| Bird | `Base.DeadBird` item | 2 to 31 | any hour | Stick trap 40 | `:145-190` |
| Mouse | An animal corpse | 1 to 9 | any hour | Mouse trap 30 | `:192-234` |
| Rat | An animal corpse | 5 to 24 | any hour | Mouse trap 25 | `:236-277` |
| Raccoon | An animal corpse | 30 to 99 | 19:00 to 05:59 | Cage 40; snare, box, crate 30 | `:279-330` |

The raccoon is a copy of the rabbit with the same chances, the same traps and the same baits. Its `item` field says `Base.DeadRabbit`, with the comment "TODO RJ: ask for model" :cite[(`TrapDefinition.lua:284`)], but that field is not used for it: rabbit, raccoon, mouse and rat all have `aliveAnimals` lists, so they come out as a living animal or an animal corpse and only squirrel and bird use `item` :cite[(`STrapGlobalObject.lua:269-287`)]. So whatever bait draws a rabbit also draws a raccoon, and the two share the pick from the list.

Rabbit, raccoon, mouse and rat can come out alive. Squirrel and bird only ever come out as the dead item. See "Collecting" below.

**Zones** (map zone types, with the chance in percent):

| Zone type | Rabbit, raccoon, squirrel | Bird | Mouse | Rat |
|-----------|--------------------------:|-----:|------:|----:|
| Farm, FarmLand | none | 35 | 60 | 50 |
| TownZone | 2 | 30 | 50 | 30 |
| TrailerPark | 2 | 20 | 60 | 40 |
| Vegitation (the game's spelling) | 10 | 30 | 20 | 20 |
| Forest, BirchForest, BirchMixForest, FarmForest, FarmMixForest, PRForest, PHForest, PHMixForest | 12 | 20 | 10 | 10 |
| DeepForest, OrganicForest | 15 | 20 | 10 | 10 |

The zone chances are in `TrapDefinition.lua` for the rabbit, squirrel, bird, mouse and rat :cite[(`TrapDefinition.lua:73-86`, `:114-127`, `:152-167`, `:208-223`, `:251-266`)]. A trap square in a zone not in this list has no zone to roll in, so nothing is ever caught there. The zone types come from map data: see [Zones and spawns overview](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview).

**Baits** (chance in percent, added to the trap chance):

| Animal | Baits |
|--------|-------|
| Rabbit, raccoon | Carrots 45; lettuce, bell pepper, cabbage 40; apple, corn, banana, potato, tomato, peach 35 |
| Squirrel | Peanut butter, cereal 45; orange, peanuts, apple, corn, popcorn, lettuce 40; peach 35; bell pepper 30 |
| Bird | Insects (caterpillars, centipedes, millipedes, cricket, grasshopper, cockroach, pillbug, sawfly larva, termites), worm, bread, bread slices 50; cereal, corn 45 |
| Mouse | Cheese 60; processed cheese 55; peanut butter, bacon bits 40; chocolate 30; orange, apple, tomato 35 |
| Rat | The same list as the mouse |

The bait lists are in the trap definition :cite[(`TrapDefinition.lua:94-104`, `:133-143`, `:170-190`, `:226-234`, `:269-277`)].

### What that means per hour

The chance per hour is the trap-and-bait roll times the zone roll, each capped at 100, and it rises a lot with Trapping level.

This is our arithmetic from the rules above: `(trap + bait + 1.5 x skill)` capped at 100, times `(zone + 1.5 x skill)` capped at 100. The "any animal" column combines the animals that share the bait.

| Setup | Level 0 | Level 5 | Level 10 |
|-------|--------:|--------:|---------:|
| Cage, carrots, DeepForest: rabbit alone | 12.8 percent | 20.8 | 30.0 |
| Same trap: rabbit **and** raccoon, any of the two | 23.9 | 37.3 | 51.0 |
| Cage, apple, Forest: rabbit, squirrel and raccoon together | 25.1 | 41.6 | 57.4 |
| Snare, carrots, Forest: rabbit and raccoon | 17.2 | 29.6 | 42.7 |
| Cage, carrots, TownZone: rabbit and raccoon | 3.4 | 16.8 | 31.1 |
| Stick trap, worm, Forest: bird | 18.0 | 26.8 | 35.0 |
| Mouse trap, cheese, Farm: mouse and rat | 73.6 | 84.0 | 91.3 |
| Mouse trap, cheese, TownZone: mouse and rat | 59.0 | 71.3 | 80.8 |

For rabbit-type traps, only **11 of the 24 hours** count. With the first row (23.9 percent per hour), the chance that a night of 11 checks ends with something inside is `1 - 0.761^11`, about **95 percent**. For a stick trap, all 24 hours count. A mouse trap on a farm is full by the next hour about three times in four.

**The pattern.** Wild zone and cage beat everything for rabbit-type animals. Farms and towns are for mice and rats. A level 0 trapper in a town with a cage is nearly wasting the bait; a level 10 one is not.

### What else happens every hour

On the same hourly pass, bait can be stolen, an empty unloaded trap can be destroyed, and a held animal ages.

These run on the same hourly pass :cite[(`STrapGlobalObject.lua:100-116`)]:

- **Bait theft.** If a trap holds bait and nothing was caught that hour, there is a **1 in (hardness + 10)** chance the bait is gone :cite[(`:160-163`)]. Per hour: crate, box and stick trap 4 percent; cage 3.3; snare 5; mouse trap 1.7. This roll still runs while the trap is loaded, even if you are standing next to it (it does not depend on the square being unloaded :cite[(`:160-163`)]).
- **Trap destroyed.** If the trap is empty and **unloaded**, there is a 1 in 40 chance, and then a 1 in `hardness` chance, to destroy it: 1 in 600 per hour for crate, box and stick trap, 1 in 800 for a cage, 1 in 400 for a snare, 1 in 2000 for a mouse trap :cite[(`:160-168`)]. It marks the trap destroyed, and the parts are placed when the trap's square is next loaded (the call chain was not traced further) :cite[(`STrapGlobalObject.lua:61-74`)].
- **A held animal ages.** A counter of hours spent inside grows by one each hour :cite[(`:107-114`)]. The animal table also has a `strength` for rabbit (24), squirrel (20) and raccoon (24), with the comment "after how many hour the animal will start to destroy the cage/escape" :cite[(`TrapDefinition.lua:53-54`, `:108`, `:281-282`)]. No file in `server/Traps`, `shared/Traps` or `client/Traps` reads that field. So in 42.22 nothing escapes on its own; the hour counter only affects how healthy a live animal is when you collect it.

### In real time

At the default day length a game hour is 3.75 real minutes, so the roll runs about every 3.75 real minutes.

The default is a 1 hour 30 minute day :cite[(`zombie/SandboxOptions.java:413-423`)]. A rabbit-type night window of 11 game hours is about 41 real minutes (the 95 percent figure above is for that window); bait ages a day every 90 real minutes; a trapped animal's noise roll (every 10 game minutes) comes up every 2.5 real minutes, one alert about every 10 real minutes on average. These are conversions, not measurements.

### Noise

Every 10 game minutes, a trapped animal in a loaded square has a 1 in 4 chance to make a sound that zombies hear.

The sound has radius 40 and volume 10. It also plays a squeal, with a different sound for birds and for wooden versus metal traps :cite[(`server/Traps/STrapSystem.lua:98-104`, `:134`; `STrapGlobalObject.lua:126-157`)].

On average that is one alert every 40 game minutes. A trapped animal close to your base is a zombie magnet. Set traps away from where you sleep.

### Collecting

You check a trap with an animal in it, and you collect a living animal for rabbit, raccoon, mouse and rat, or a dead item for squirrel and bird.

- "Check Trap" shows only when an animal is inside :cite[(`server/Traps/ISUI/ISTrapMenu.lua:71-73`)]. It sends you to a tile next to the trap, then runs a **40** timed action :cite[(`shared/Traps/TimedActions/ISCheckTrapAction.lua:50`)]. Anything heavy in your hands is dropped first :cite[(`ISTrapMenu.lua:109-111`)]. In multiplayer the server runs the same function when it gets your `checkTrap` command :cite[(`server/Traps/trappingCommands.lua:72-79`)].
- "Remove Trap" shows only when the trap is **empty**. It takes 40, gives back the trap item and throws away the bait :cite[(`ISTrapMenu.lua:75-77`; `shared/Traps/TimedActions/ISRemoveTrapAction.lua:35-54`)].
- **Alive or dead.** Rabbit, raccoon, mouse and rat are marked `canBeAlive`, so you collect a **living** animal (if it died while waiting, an animal corpse): it appears as an animal item in both your hands :cite[(`STrapGlobalObject.lua:269-287`, `:204-267`)]. Squirrel and bird are never alive: you get the `item` named in the table, scaled to size. Living animals are explained in [Animals overview](/pz/build-42/modding/farming-and-animals/animals-overview-the-b42-living-animal-system) and the dead ones in [Butchering and dead animals](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals).
- **The alive animal has been waiting.** The game simulates hunger, thirst and health for `hours held + 0 to 14` hours :cite[(`STrapGlobalObject.lua:225-243`)]. If it died in the meantime you get a corpse instead. So collect trapped animals within a day.
- **Dead animals scale to a random size.** The size range from the table above becomes the corpse's hunger value :cite[(`STrapGlobalObject.lua:299-318`, `:333-358`)]. A rabbit comes out at 0.30 to 0.99 hunger, a mouse at 0.01 to 0.09.

**A catch in the code worth knowing.** When an animal comes out dead, the code sets `canBeAlive = false` on `self.animal`. That table is the **shared definition** from `TrapAnimals`, not a copy :cite[(`STrapGlobalObject.lua:238-242`, `:494-499`)]. Read as written, one dead rabbit would turn off live rabbits for every later trap in the same session, until the game restarts. Not verified in a running game.

### Skill and XP

Only the player who placed the trap gets XP, and the Trapping level when it was placed adds 1.5 percentage points to both rolls.

| What | Numbers | Code |
|------|---------|------|
| Who gets XP | Only the player who **placed** the trap | `STrapGlobalObject.lua:218-221`, `:304-307`, `:338-341` |
| Live animal | 10 to 19 XP | `STrapGlobalObject.lua:216-221` |
| Dead animal | `size / 3`, at least 3. Rabbit and raccoon 10 to 33; squirrel 3 to 19; bird 3 to 10; rat 3 to 8; mouse 3 | `STrapGlobalObject.lua:299-307`, `:333-341` |
| Level effect | +1.5 percentage points on both rolls per level, taken from the level when the trap was placed | `STrapGlobalObject.lua:375-378`; `shared/Traps/TrapSystem.lua:46` |
| Level list | Trapping is a Survivalist skill; XP thresholds are given with the Fishing ones in the fishing article | `zombie/characters/skills/PerkFactory.java:134` |
| Sandbox | "Multiplier Config: Trapping" scales XP, where it is applied was not traced | `zombie/SandboxOptions.java:1867` |

### When a trap is destroyed

A trap that is thumped or destroyed by the hourly roll drops parts, and a snare or mouse trap cannot be thumped.

Zombies and other creatures can thump a trap that is not a snare or mouse trap, and a hit that destroys it drops parts :cite[(`TrapBO.lua:12-24`; `server/Traps/STrapSystem.lua:106-128`)]. A trap that the hourly roll destroys does the same :cite[(`STrapGlobalObject.lua:69-74`, `:579-625`)]:

| Trap | What drops |
|------|-----------|
| Crate trap | Unusable wood, nails |
| Box trap | Unusable wood, 2 nails |
| Cage trap | Wire (with 0.1 to 0.5 of its length left) |
| Snare | Unusable wood, 2 twine (each at its full amount) |
| Stick trap | Unusable wood, twine |
| Mouse trap | Unusable wood |

The drops are listed in the trap definition :cite[(`TrapDefinition.lua:7`, `:16`, `:25`, `:32`, `:39`, `:46`)].

### Multiplayer

The server owns the animal-trap system: the hourly pass, the animal pick, bait, theft and destruction all run on the server.

The animal-trap system is a "global object" system :cite[(`server/Traps/STrapSystem.lua:1`, `:85-92`)]. The trap's data lives in the object's mod data and is sent to every client :cite[(`STrapGlobalObject.lua:93-97`)]. Clients ask the server to do things with commands in the module `trap` :cite[(`STrapSystem.lua:9`)]: `add`, `remove`, `removeAnimal`, `addBait`, `checkTrap`, `removeBait`, `destroy` and `addAnimalDebug` :cite[(`server/Traps/trappingCommands.lua:13-103`; the handler is `STrapSystem.lua:68-70`)].

:::callout[Warning for server owners]{kind=warn}
The debug command `addAnimalDebug` has no permission check on the server, so a server should restrict it. The handler runs for any logged-in player :cite[(`trappingCommands.lua:63-70`; `STrapSystem.lua:68-70`)], and the only gate is the client menu's `getDebug()` test :cite[(`server/Traps/ISUI/ISTrapMenu.lua:79`)], which is not a server control.
:::

## Part 2: explosive, flame, smoke and noise traps

These traps are one Java class, `IsoTrap`, that sits on the floor and goes off by a timer, a sensor or a remote.

The class is `zombie/iso/objects/IsoTrap.java`. An item that can be thrown or placed (a "hand weapon" with trap fields) becomes an `IsoTrap` object on the floor when thrown or placed :cite[(`IsoTrap.java:110-135`)]. A throw is an attack; a placement is the timed action `ISPlaceTrap`, which takes **50** :cite[(`shared/TimedActions/ISPlaceTrap.lua:42-58`)], removes the item from your hands and calls `place()` :cite[(`ISPlaceTrap.lua:42-51`; `IsoTrap.java:401-415`)].

### Four ways to set one off

How the item is built decides whether it goes off at once, by a timer, by a sensor or by a remote.

The item's script fields decide this :cite[(`zombie/inventory/types/HandWeapon.java:2346-2348`; `IsoTrap.java:167-175`, `:264-300`)]:

| Kind | Script signs | What happens |
|------|--------------|--------------|
| **Instant** | No timer, no sensor, not remote | Goes off the moment it is placed or lands :cite[(`IsoTrap.java:409-411`)] |
| **Timed** ("Triggered") | `ExplosionTimer = 10` | Counts down once per second, then goes off |
| **Sensor** (V1 to V3) | `SensorRange` 3 to 6, `ExplosionTimer` 5 or 10 | The timer is an **arming delay**. After it reaches 0 the trap waits; it goes off when any living thing comes into range |
| **Remote** | Remote controller | Goes off when its paired controller is used within range |

**The timer is in real seconds.** The countdown is a `GameTimer(1)` whose period works out to exactly one real second at game speed 1x, whatever the day length :cite[(`IsoTrap.java:94`, `:168-169`; `zombie/core/utils/GameTimer.java:17-26`)]. A timed trap with 10 goes off after about 10 seconds. A sensor with 5 is live after about 5 seconds. A "Triggered" item beeps each second with the sound `TrapTimerLoop`, and a different one on the last beep :cite[(`IsoTrap.java:172-182`)].

**How a sensor works.** Once a second, the trap looks at every character on its floor. If one is within the sensor range of the trap's center, is not invisible, and has a clear line to the trap (walls and closed doors block it), the trap goes off :cite[(`IsoTrap.java:264-300`)]. That includes **you, other players, zombies and animals**. It runs on the server (or in single player), and the server tells clients to show the explosion :cite[(`IsoTrap.java:285-290`; `zombie/network/packets/AddExplosiveTrapPacket.java`)].

**Remote.** The controller sends a command; the server finds every trap with the same id within `range` squares and blows it :cite[(`IsoTrap.java:727-750`; `server/ClientCommands.lua:269-272`)]. The search covers a box of `range` squares each way around the player who used the controller. The `range` value comes from the client's message; whether the server checks it was not verified.

### Numbers by item

Each item has its own explosion, fire, smoke or noise values, sensor range and timer.

Every value is from the item scripts in `scripts/generated/items/weapon.txt`. Radius is in tiles. Fire "chance" is the per-square chance, in percent.

| Item (and variants) | Explosion | Fire | Smoke or noise | Sensor range | Timer |
|---------------------|-----------|------|----------------|--------------|-------|
| Pipe bomb (`:803`) | Power 90, radius 7 | none | explosion sound, noise radius 50 | V1 3, V2 4, V3 6 | Sensors 5, Triggered 10 |
| Aerosol bomb (`:231`) | Power 70, radius 6 | Energy 20, chance 10 | noise radius 50 | V1 3, V2 4, V3 6 | Sensors 5, Triggered 10 |
| Flame trap (`:432`) | none | Radius 6, energy 40, chance 50 | noise radius 50 | V1 3, V2 4, V3 5 | Sensors 5, Triggered 10 |
| Smoke bomb (`:997`) | none | Energy 40, chance 50 | Smoke radius 5 for 10 units; noise radius 10 for 10 units | V1 3, V2 4, V3 5 | Sensors 5, Triggered 10 |
| Noise trap (`:619`) | none | none | Noise radius 17 for 30 units; reusable | V1 3, V2 4, V3 6 | Sensors 10, Triggered 10 |
| Firecracker (`:19718`) | none | none | Noise radius 80 (crafted one 60) | no | thrown |
| Molotov (`:19776`) | none | Radius 4, energy 30, chance 30 | no | no | thrown |

Sensor variants are the same items with `SensorV1`, `SensorV2`, `SensorV3` in the name, for example `AerosolbombSensorV1` at `:297`. The recipes that add a sensor to a bomb need Electricity 2, 4 and 6 for V1, V2 and V3 :cite[(`scripts/generated/recipes/recipes_traps.txt:153-215`)]. The noise trap recipe needs Electricity 3 :cite[(`:354-370`)].

**The duration unit.** "Noise duration 30" and "explosion duration 10" count the day-length-scaled "minutes" in the code, which in practice work out to **2.5 real seconds per unit at game speed 1x**, whatever the day length :cite[(`IsoTrap.java:201-203`, `:316-318`)]. So a noise trap runs for about 75 seconds, a smoke bomb's smoke lasts about 25 seconds, and its noise about 25 seconds. During a noise, the trap re-announces itself with a world sound **every 2.5 seconds** :cite[(`IsoTrap.java:331-335`)].

### What an explosion does

When a trap goes off it fires an event, plays a sound that calls zombies, runs up to three effects over a circle of squares, and then stays or is removed.

A trap going off runs these steps in order :cite[(`IsoTrap.java:423-475`)]:

1. The event `OnThrowableExplode(trap, square)` fires :cite[(`:424`)].
2. The explosion sound plays. A world noise goes out with the item's noise radius, or **radius 50** if it has a sound but no noise radius :cite[(`:430-434`)]. That is how a pipe bomb calls zombies from 50 tiles.
3. Three optional effects run, in this order, each over a circle of squares around the trap, **capped at radius 15**, each square requiring a clear line from the trap :cite[(`:436-447`, `:772-833`)]:
   - **Explosion.** Every character on each square is hit once.
   - **Fire.** Each square has the item's chance to start a fire.
   - **Smoke.** Every zombie in range loses its target and goes idle :cite[(`:873-880`)].
4. If the item has a duration, the trap stays for the duration (smoke, noise). Otherwise it is removed, unless the item is reusable :cite[(`:449-458`)].

**Damage.** Each character on each affected square takes **one** hit of `random between power/20 and 2 x power/20` plus the item's extra damage; power is capped at 100 :cite[(`IsoTrap.java:834-850`, `:71`)]. The pipe bomb (90) hits for 4.5 to 9.0, the aerosol bomb (70) for 3.5 to 7.0. Whether that kills depends on the target; the hit goes through the normal damage code, not a fixed kill.

**Fire and burns.** A square gets "burned" or set alight by the item's fire chance :cite[(`:785-806`)]. A character hit by something with a fire chance above 0 gets a roll per body part to be burned. Zombies are skipped :cite[(`:855-865`)]. The aerosol bomb has a 10 percent chance per body part.

**Who gets hurt in multiplayer.** In a server game, zombies and animals are always affected. A **player** is affected if it is the one who threw it, or if PVP is on and the target's safety is off (or the thrower's) :cite[(`:815-833`)]. Squares inside a **non-PVP zone** are skipped entirely :cite[(`:784`)].

**Reuse.** The noise trap script is marked reusable, so it is not removed after it goes off :cite[(`IsoTrap.java:453`; `weapon.txt:619`)]. What a player can then do with it was not verified.

### Multiplayer: explosive traps

The server rolls the timer and the sensors, and sends the `AddExplosiveTrap` packet to every client.

The guards are `!GameClient.client` :cite[(`IsoTrap.java:168`, `:265`)]. When a trap is placed or a sensor trips, the server sends the packet `AddExplosiveTrap` to every client, which builds a local `IsoTrap`, and (for instant ones) triggers its visuals :cite[(`IsoTrap.java:403-407`; `zombie/network/packets/AddExplosiveTrapPacket.java:104-113`)]. On the server, damage applies to zombies, animals and the players allowed by the rule above. On a client, it applies only to zombies that client owns :cite[(`IsoTrap.java:815-833`, `:850-868`)].

## Where to go next

- [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works)
- [Fishing nets and other methods](/pz/build-42/engine/fishing-and-trapping/fishing-nets-and-other-methods) for the water version of "set it and walk away".
- [Fishing and trapping reference](/pz/build-42/engine/fishing-and-trapping/fishing-and-trapping-reference) for every number in one table.
- [Modding fishing and trapping](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping) to add a trap animal or a bait.
- [Foraging in Build 42](/pz/build-42/modding/farming-and-animals/foraging-in-b42) names the trap and bait pairings too. One gap there: it leaves out the raccoon.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 capture, not measured in a running game. Not verified: every per-hour percentage above is our arithmetic, and none was measured over many nights.

Also not verified: the loaded-area size on a dedicated server. Whether one dead animal turns off live ones for the session (the shared-table behavior). Whether the server checks the remote `range` value before the Lua sees it.

What you can do with a reusable noise trap after it has gone off. The mouse trap's crafting: no recipe exists in the capture, and it appears as loot.
:::
