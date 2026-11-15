---
id: build-42-fishing-nets-and-other-methods
slug: fishing-nets-and-other-methods
title: 'Fishing nets and other methods'
game: pz
version: build-42
section: engine
category: fishing-and-trapping
difficulty: intermediate
tags:
  - engine
  - fishing
  - nets
  - multiplayer
excerpt: >-
  How a fishing net works in Project Zomboid 42.22: what it catches while you are away, how long to leave it, when it breaks, what bait does, and the other ways fish reach your pack.
last_updated: '2026-11-14'
related_articles:
  - how-fishing-works
  - fish-and-where-to-find-them
  - how-trapping-works
  - fishing-and-trapping-reference
  - modding-fishing-and-trapping
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#the-net-step-by-step) | [server owners](#multiplayer) | [modders](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)

:::callout[The 1-minute version]{kind=key}
- Craft a net from 10 twine and 5 wire (the recipe is learned at Fishing 6), place it on a water tile within 5 tiles of you, walk away, and press Check later. Nothing grows in the net while you are away: Check plays the hours you were gone, all at once.
- Each game hour gives a 1 in 8 chance of one item. Hours over 20 are ignored, and a net left more than 15 hours has a 1 in 5 chance of falling apart.
- So check at 15 hours, not later. At the default day length that is about 56 real minutes (a conversion, not a measurement).
- Bait is chum with food in it. It raises the odds and can bring a catfish, and it is best spent on one long check, not many short ones.
- Removing a net throws away anything it held that you had not checked.
- On a server, the placing, checking, bait and removing actions finish on the server.
:::

:::facts
- **Plain catch** 1 in 8 per game hour, about 3 items per game day if you check every 15 hours or less
- **Hour cap** 20 hours
- **Break risk** 1 in 5 if the net sat more than 15 hours
- **Placing** 150, within 5 tiles of water
- **Bait strength** chum hunger x -100, capped at 200
- **Real time at the default day length** 15 game hours is about 56 real minutes (a conversion, not a measurement)
:::

Outcast, a rod needs you standing at the bank with your eyes on a bobber. A net does the opposite: you drop it in the water, walk away and let the hours work. The price is that you do not choose what you get, the fish are small, and a net left too long can fall apart. This page covers how that works and the other, smaller ways fish and fish parts reach your pack.

Citations are named from `game_snapshot/media/lua/` for Lua, `src/` for Java and `game_snapshot/media/` for scripts. All 42.22 capture.

## The net, step by step

You craft a net, place it on a water tile, and use its menu to check, bait or remove it.

### Getting a net

A net is crafted by hand from twine and wire, and a broken net can be taken apart for wire.

| Step | Numbers | Code |
|------|---------|------|
| Craft: 10 twine and 5 wire, by hand | Time 150. Needs the recipe, learned automatically at Fishing 6. The Fisherman profession starts with it. | `scripts/generated/recipes/recipes_fishing.txt:47-64`; `scripts/generated/characters/character_professions.txt:111` |
| Item | `Base.FishingNet`, weight 1, tag `base:fishingnet`, counts as survival gear | `scripts/generated/items/normal.txt:5653-5662` |
| Broken net | `Base.BrokenFishingNet` turns up as loot and as a rod trash catch. It can be taken apart for wire (recipe `GetWireBack`, learned at Fishing 7) | `normal.txt:5644-5651`; `shared/Fishing/fishing_properties.lua:666-672`; `recipes_fishing.txt:66-83` |

### Placing it

You place a net on a water tile within 5 tiles of you, and placing takes 150.

- The right-click menu shows "Place Fishing Net" when you carry a net and there is water within 5 tiles, or when you click a water tile while carrying one :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:433-435`, `:1613-1634`, `:4066-4084`)].
- The spot must be a water tile within 5 tiles of you :cite[(`server/Fishing/BuildingObjects/FishingNet.lua:29-33`)]. The net shows as a ghost you drop with a click :cite[(`ISWorldObjectContextMenu.lua:679-681`)].
- Placing takes **150** :cite[(`shared/TimedActions/Fishing/TimedActions/ISPlaceFishingNetAction.lua:44`)]. The game then adds an object named "FishingNet" to the tile, using the sprite `constructedobjects_01_15` (or `_14` rotated), and stamps the tile with the current game time in milliseconds :cite[(`ISPlaceFishingNetAction.lua:26-33`; `FishingNet.lua:19-20`, `:39-42`)].
- The clock is the **game** clock. How long a game hour lasts in real minutes depends on the day length option; see [Seasons and day length](/pz/build-42/engine/weather-and-climate/seasons-and-day-length).

Placing a net is allowed even inside a no-fish rectangle, but the menu to check or remove an already-placed net is hidden there :cite[(`ISWorldObjectContextMenuLogic.java:1670-1685`)]. Not verified in a running game. A net does not use the fish schools: nothing in the net code reads the school or noise lists :cite[(`FishingNet.lua:78-168`)].

### The menu on a placed net

Clicking a placed net opens a "Fishing Net" submenu with Check Trap, Remove Trap and Add Bait.

The submenu is built in the context menu code :cite[(`ISWorldObjectContextMenuLogic.java:4086-4132`)]:

| Option | When it shows | Action time | Code |
|--------|---------------|-------------|------|
| Check Trap | At least one full game hour since placing or last checking | `hours x 13`, but 150 if more than 11 hours | `ISCheckFishingNetAction.lua:45-48` |
| Remove Trap | Always | 150 | `ISRemoveFishingNetAction.lua:43` |
| Add Bait | Only when the net has no bait. Needs chum in your pack; grayed out with a tooltip if not | 200 | `ISAddBaitToFishNetAction.lua:62` |

Checking adds a small noise (radius 20) and 1 XP :cite[(`ISCheckFishingNetAction.lua:20`, `:36`)]. Removing gives back the net and **throws away anything the net held that you had not checked**, because catches are rolled only at check time :cite[(`FishingNet.lua:68-76`)].

## What is in the net: the hourly dice

Nothing grows in the net while you are away: when you press Check, the game plays the hours you were gone, all at once.

The routine runs in the net code :cite[(`server/Fishing/BuildingObjects/FishingNet.lua:78-168`)]. Here is the whole routine.

1. **Count the hours.** The menu works out whole game hours since the stamp :cite[(`ISWorldObjectContextMenuLogic.java:4092-4099`)]. It passes that number to the action. The action refuses to start if the clock moved more than 2 hours from that number :cite[(`ISCheckFishingNetAction.lua:5`; the rule is `math.abs(floor(...) - hours) < 2`)].
2. **The break roll.** If the net sat **more than 15 hours**, there is a **1 in 5** chance it falls apart. You get a broken net, the net on the tile is gone, and no fish are rolled :cite[(`FishingNet.lua:84-92`)].
3. **The 20-hour cap.** Hours over 20 are ignored :cite[(`FishingNet.lua:93-95`)]. The stamp then resets to now :cite[(`FishingNet.lua:167`)], so the extra hours are lost, not saved for next time.
4. **Per hour, the plain roll.** Each hour has a **1 in 8** chance of one item. The item is picked evenly (1 in 6 each) from:

   Bait fish, frog, mussels, seaweed, crayfish, tadpole :cite[(`shared/Fishing/fishing_properties.lua:693-700`; roll `FishingNet.lua:105-110`)].
5. **Per hour, the bait roll.** If the net has bait, each hour has a second roll, described next.
6. **XP.** If anything was caught, +1 Fishing XP, on top of the 1 for the action :cite[(`FishingNet.lua:162-165`; `ISCheckFishingNetAction.lua:36`)].
7. **Bait wears down, stamp resets** :cite[(`FishingNet.lua:55-66`, `:166-167`)].

### Expected catch, no bait

Without bait, a net gives about 3 items per game day if you check it every 15 hours or less.

| Hours since last check | Average items | Chance of nothing | Chance the net breaks |
|-----------------------:|--------------:|------------------:|----------------------:|
| 4 | 0.5 | 59 percent | 0 |
| 8 | 1.0 | 34 percent | 0 |
| 12 | 1.5 | 20 percent | 0 |
| 15 | 1.9 | 14 percent | 0 |
| 16 | 2.0 | 12 percent (if it survives) | 20 percent |
| 20 | 2.5 | 7 percent (if it survives) | 20 percent |

("Chance of nothing" is `(7/8)` to the power of the hours. The rest is our arithmetic from the rules above.) Leaving it longer gains nothing past 20 hours and risks the net. **Check at 15 hours, not later.**

**In real time.** At the default 1 hour 30 minute day :cite[(`zombie/SandboxOptions.java:413-423`)], a game hour is 3.75 real minutes. So 15 game hours is about **56 real minutes**, 20 hours is 75 minutes, one game day (about 3 items) is 90 minutes, and the first Check shows up after about 4 real minutes. A bait of strength 50 is gone after 5 game hours, about 19 real minutes. These are conversions, not measurements.

### Bait

Bait is chum with food in it, added from the net menu, and it raises the hourly odds and can bring a catfish.

See [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them) for how chum is made.

- The net's bait strength is `chum hunger x -100`, capped at 200 :cite[(`server/Fishing/BuildingObjects/FishingNet.lua:44-53`; `ISAddBaitToFishNetAction.lua:50`)]. A chum with hunger -0.5 gives 50.
- At each check, the bait chance per hour is **1 in `4 + (200 - strength) / 25`** :cite[(`FishingNet.lua:99-103`, `:111`)]. Strength 200 gives 1 in 4. Strength 100 gives 1 in 8. Strength 50 gives 1 in 10. The game gives `ZombRand` a decimal for the odd values; how that is rounded was not verified.
- The strength used is the one the net has *when you check*, applied to **every** hour since the last check. Then the game takes off 10 strength per hour that passed, and the bait is gone when it reaches 0 :cite[(`FishingNet.lua:55-66`)]. A strength-50 bait lasts 5 hours, yet it boosts the odds for the whole stretch of the first check. So **a bait is best spent on one long check, not many short ones.**
- A bait catch is picked evenly (1 in 6 each) from: bait fish, tadpole, crayfish, blue catfish, channel catfish, flathead catfish :cite[(`fishing_properties.lua:701-707`; `FishingNet.lua:112`)].
- A catfish from a net is a real sized fish: the size roll uses **70 small, 30 medium, 0 big** :cite[(`FishingNet.lua:123`)], with the same weight and food formulas as a rod fish :cite[(`FishingNet.lua:125-152`)]. So a net can bring a blue catfish up to the top of its Medium class, 81 cm and 19.2 kg, with no skill requirement. The net code does not check your Fishing level.
- A bait pays off about like this, per hour: strength 200 adds 25 percent, strength 100 adds 12.5 percent, strength 50 adds 10 percent, on top of the plain 12.5 percent.

### Remove the net, or keep it going?

Checking does not remove the net unless it breaks, and it resets the clock, so you can check every 15 hours indefinitely.

Both leave the net a net. A broken net (`Base.BrokenFishingNet`) is the only loss :cite[(`FishingNet.lua:84-92`)].

### Multiplayer

On a server, the placing, checking, bait and removing actions run their `complete()` on the server.

The actions finish on the server :cite[(`ISPlaceFishingNetAction.lua:26-27`; `ISCheckFishingNetAction.lua:33-37`)]. `checkTrap` exits at once on a client :cite[(`FishingNet.lua:78-81`)]. The stamp and the bait strength live in the tile's mod data and are sent to clients with `transmitModdata` :cite[(`FishingNet.lua:40-42`, `:50-52`)].

## Other ways to get fish

Fish also reach your pack as loot and as fish roe, and a spear is tagged for fishing but no catch logic was found.

### Loot

Some fish are placed as loot, and a looted fish rolls its size differently from a fished one.

For example largemouth bass, bluegill and blue catfish appear in several room and container tables :cite[(`server/Items/Distributions.lua:16967-16969`, `:19120-19128`; `server/Items/ProceduralDistributions.lua:7717-7723`, `:9804`)]. A looted fish goes through `Fishing.onCreateFish`, which rolls its size with 60 percent Small, 30 Medium and 10 Big :cite[(`shared/Fishing/fishing_properties.lua:709-760`)]. Unlike a fished one, it shows its size word only, not a length in its name.

### Fish roe

A fish roe sac, a bowl and 0.3 of water make fish roe through the `HarvestRoe` recipe.

The recipe uses a fish roe sac (`Base.FishRoeSac`), takes **120**, gives 10 Fishing XP and has no skill-required line :cite[(`scripts/generated/recipes/recipes_fishing.txt:103-120`)].

### The spear

Spears are tagged `base:fishingspear` and the engine recognizes them, but we found no code that turns a spear strike into a fish.

About two dozen spears carry the tag (for example :cite[(`scripts/generated/items/weapon.txt:15240`, `:15289`, `:15338`)]). The engine knows about them in three places:

- `ItemTag` has `FISHING_SPEAR` :cite[(`zombie/scripting/objects/ItemTag.java`)].
- The right-click code treats a spear (a hand weapon of type spear) as if it were a rod with a lure, so "Fishing" can appear with a spear :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:3193-3217`)].
- A sound key `StrikeWithFishingSpear` exists :cite[(`zombie/scripting/objects/SoundKey.java:3049`)].

What we did **not** find is any code that turns a spear strike into a fish. The fishing manager only starts for the rod tag :cite[(`client/Fishing/FishingHandler.lua:37-38`)], the fishing window only grades time, temperature, weather and wind and lists species, and no Lua or Java file we searched uses the spear tag to produce a catch. So in this capture spear fishing is tagged and recognized but **no catch logic was found. Not verified in a running game.**

### What looks like fishing but is not

The fishing window and the cheat fishing tool look like fishing but are a guide and an admin tool.

- The **fishing window** (right-click "Fishing") is a read-only guide: it grades the time, temperature, weather and wind, and shows a species list :cite[(`client/PZAPI/ui/organisms/FishWindow.lua:156-271`)]. The game records each species you land in your mod data :cite[(`shared/TimedActions/Fishing/TimedActions/ISPickupFishAction.lua:88-91`)]; whether the window grays out the rest was not checked.
- **Cheat fishing** exists: a player with the right capability can toggle a fishing cheat that forces bites :cite[(`shared/Fishing/Bobber.lua:43-45`, `:136-138`, `:231`; capability `UseFishingCheat`, `zombie/characters/Capability.java:78`)]. It is an admin tool.

## Where to go next

- [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works) for rod fishing.
- [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them) for chum.
- [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works) for the land version of "set it and walk away".
- [Fishing and trapping reference](/pz/build-42/engine/fishing-and-trapping/fishing-and-trapping-reference)
- [Modding fishing and trapping](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 capture, not measured in a running game. Not verified: placing or checking a net inside a no-fish rectangle (read from the menu code only); how `ZombRand` treats the decimal bait odds; that spear fishing has no catch logic anywhere in the game (we found none); and the real-time length of a game hour in your world, which follows the day length option.
:::
