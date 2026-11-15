---
id: build-42-how-stash-maps-work
slug: how-stash-maps-work
title: 'How stash maps work'
game: pz
version: build-42
section: engine
category: stash-and-annotated-maps
difficulty: beginner
tags:
  - engine
  - stash
  - maps
  - loot
  - multiplayer
excerpt: >-
  What a map with notes on it is, where it drops, how often it points to a real cache, what the cache holds, and why you sometimes walk into an empty house.
last_updated: '2026-11-14'
related_articles:
  - inside-the-stash-system
  - paper-maps-and-annotations
  - every-vanilla-stash
  - modding-stashes
  - stash-and-maps-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#what-an-annotated-map-is) | [server owners](#what-changes-on-a-server) | [modders](/pz/build-42/engine/stash-and-annotated-maps/modding-stashes)

:::callout[The 1-minute version]{kind=key}
- A map named "Annotated Map" is an ordinary town map that a dead survivor wrote on. The notes point at one building that holds a cache.
- You find these maps as ordinary loot: in containers, on corpses, in bags and on shelves. To use one, read it from your inventory, then go to the house it marks.
- The game decides this the moment a map item spawns as loot. Most maps from ordinary containers stay plain, while maps from bandit bags, survivor bags and safehouse shelves pass the roll 91 to 100 times in 100. A map gets notes only if the sandbox roll passes and a cache building nobody has entered is still free.
- Reading the map sets up the building. The cache is placed when that building loads, and only if nobody has walked into it first.
- The cache is one of a few fixed kinds: guns, shotguns, tools, food, medicine, survivor supplies or booze. Some come with zombies and boarded windows.
- If you reach the house and it is empty, someone or something got there first. Some notes are jokes or messages: those are real stashes with no loot.
- On a server, the server rolls, fills and saves everything. Your game only draws the map.
:::

:::facts
- **Vanilla stashes** 125, in 10 files
- **Default roll** about 91 in 100 for maps from bandit bags, survivor bags and safehouse shelves; about 21 in 100 for any other map
- **Setting** Annotated Map Chance, 6 choices, default 4 "Sometimes"
- **Cache zombies** 29 of 125 stashes spawn them, at least 1 in every room of the building
- **Day limits** only 1 vanilla stash has one: days 0 to 30 of survival (days wrap at 30; see [A bug-shaped detail: the day limit](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#a-bug-shaped-detail-the-day-limit))
:::

## What an annotated map is

An annotated map is a normal paper map whose item has been given extra writing, stamps and a hidden pointer to one building.

The pointer is a stash name saved on the item, and the writing is copied onto the item when the stash is chosen. :cite[(`StashSystem.java:158-200`, `InventoryItem.java:3694-3699`)]

The map still shows the same town it always did. What changes is the title ("Annotated Map"), the zoom, and the marks: an X or a target on the building, arrows, skulls and scribbled lines such as "Stashed guns". :cite[(`media/lua/shared/StashDescriptions/RosewoodStashDesc.lua:4-14`, `media/lua/shared/Translate/EN/Stash.json:2`, `:204`)] How the picture is drawn is on [Paper maps and annotations](/pz/build-42/engine/stash-and-annotated-maps/paper-maps-and-annotations).

## Where one comes from

A map gets its notes at the instant the game rolls it as loot, so there is no recipe, no trader and no place to ask for one.

The check runs for items the loot system puts into containers (shop containers are skipped in the main roll, but not in the bag-contents roll), and only the town map items can ever pass it. :cite[(`ItemPickerJava.java:1053-1055`, `ItemPickerJava.java:1250-1256`, `StashSystem.java:125`)] The second call, for items rolled inside a bag, has no shop test. :cite[(`ItemPickerJava.java:1329`)] That call also runs for a map that the container's map limit has just removed, so a stash can be used up by a map that never reaches the player. :cite[(`ItemPickerJava.java:1314-1327`, `ItemPickerJava.java:1329`)]

Thirteen different map items are used by vanilla stashes: Rosewood, Muldraugh, West Point, Riverside, March Ridge and eight of the nine Louisville maps. Louisville Map 3 and the plain "Map" item are never stash items. :cite[(`media/scripts/generated/items/map.txt:3-175`)]

:::chips
- Rosewood map
- Muldraugh map
- West Point map
- Riverside map
- March Ridge map
- Louisville maps 1, 2, 4 to 9
:::

Some places hand out maps more eagerly. Bandit bags (mid and late), survivor bags (all three), the safehouse bookshelf and the safehouse fireplaces carry a `stashChance` of 10, which makes the roll below much easier to pass. :cite[(`media/lua/server/Items/Distribution_BagsAndContainers.lua:637`, `:651`, `:3250`, `:3265`, `:3280`, `media/lua/server/Items/ProceduralDistributions.lua:42066`, `:42287`, `:42444`)]

## The odds

The sandbox setting Annotated Map Chance decides how often a rolled map gets notes, and "Sometimes" (the default) gives about 91 in 100 for maps from the generous places and about 21 in 100 for the rest.

The setting has six choices: choice 1 never annotates, and the others make the roll harder or easier by a fixed step. :cite[(`StashSystem.java:96-120`, `SandboxOptions.java:155`)]

::bar[Sometimes (default), map from a bandit bag, survivor bag or safehouse shelf]{value=91 max=100 text="91 in 100" accent=orange}
::bar[Sometimes (default), any other map]{value=21 max=100 text="21 in 100" accent=blue}
::bar[Extremely Rare, any other map]{value=6 max=100 text="6 in 100" accent=blue}
::bar[Very Often, any other map]{value=41 max=100 text="41 in 100" accent=blue}

That roll is only the first gate. The game then needs at least one stash for that exact map item whose building nobody has entered, whose day limits fit, and whose building exists on the map. If none qualifies, the map stays plain. We did not measure how often map items spawn at all, so these numbers are the chance per map that spawns, not per hour of play. :cite[(`StashSystem.java:121-153`)]

| Choice | Label | Change | Bag, shelf or fireplace map | Any other map | Code |
|---|---|---|---|---|---|
| 1 | Never | none ever | 0 in 100 | 0 in 100 | :cite[(`StashSystem.java:103-104`)] |
| 2 | Extremely Rare | harder by 15 | 76 in 100 | 6 in 100 | :cite[(`StashSystem.java:105-107`)] |
| 3 | Rare | harder by 10 | 81 in 100 | 11 in 100 | :cite[(`StashSystem.java:108-109`)] |
| 4 | Sometimes (default) | none | 91 in 100 | 21 in 100 | :cite[(`StashSystem.java:110-112`)] |
| 5 | Often | easier by 10 | 100 in 100 | 31 in 100 | :cite[(`StashSystem.java:113-115`)] |
| 6 | Very Often | easier by 20 | 100 in 100 | 41 in 100 | :cite[(`StashSystem.java:116-117`)] |

The labels are the English names. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:650-655`)] The presets set it like this: Apocalypse, Rising and Six Months Later use 4, Outbreak uses 5 and Extinction uses 2. The 28 Minutes Later challenge turns it off (1) and Top of the World uses 4. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:83`, `Extinction.lua:83`, `Outbreak.lua:83`, `Rising.lua:83`, `SixMonthsLater.lua:60`, `media/lua/client/Challenge/28MinutesLater.lua:83`, `TopOfTheWorld.lua:90`)]

Both columns come from one rule. Every item starts with a stash chance of 80, and the generous places override it with 10. The game adjusts that number by the choice, then passes when a random whole number from 0 to 99 is at or below 100 minus the result. :cite[(`InventoryItem.java:273`, `ItemPickerJava.java:1250-1253`, `StashSystem.java:97-120`)]

## What a stash holds

Each stash names a loot table, and the building's chests, counters and crates of the matching types are refilled from it when the building loads.

Vanilla has eleven such tables, and the same few appear again and again. :cite[(`StashSystem.java:247-279`, `media/lua/server/Items/Distributions.lua:20971-22594`)]

::::cards
:::card[Guns]{accent=orange}
Gun Cache 1 and 2: boxes of pistol, rifle and shotgun ammo, handguns, a shotgun, a varmint or hunting rifle, scopes, holsters, money and keys. 21 stashes.
:::
:::card[Shotguns]{accent=orange}
Shotgun Cache 1 and 2: shotguns and shells, choke tubes, a recoil pad. 12 stashes.
:::
:::card[Tools]{accent=blue}
Tools Cache 1: hammers, saws, crowbar, bolt cutters, blowtorch, nails, rope, tarp. 13 stashes.
:::
:::card[Food and water]{accent=blue}
Food Cache 1 is candy, canned food and drinks. Survivor Cache 1 and 2 fill kitchen counters with 1 to 7 canned foods, 1 to 2 dry foods, 1 to 2 melee weapons and one firearm. Big Building fills them with 0 to 7 canned foods, 0 to 1 random kitchen items and a 20 percent chance of one melee weapon. :cite[(`Distributions.lua:22061-22066`, `Distributions.lua:22188-22193`, `Distributions.lua:22315-22320`)] 44 stashes.
:::
:::card[Medicine]{accent=purple}
Medical Cache 1: bandages, antibiotics, pills, disinfectant, a suture kit, first-aid books. 4 stashes.
:::
:::card[Booze]{accent=cream}
Booze Cache 1: spirits, wine and beer, a corkscrew and a bottle opener. 1 stash.
:::
::::

The counts are our tally of the vanilla files, and how we counted is on [Every vanilla stash](/pz/build-42/engine/stash-and-annotated-maps/every-vanilla-stash). Thirty of the 125 stashes name no loot table at all, so they add no loot. They exist for the notes, the zombies or the boarded doors. :cite[(`StashSystem.java:247`, `StashSystem.java:265-266`)]

A stash can also bring guards. When a stash sets `zombies`, every room of the building gets at least one zombie, a higher number gives a higher chance per floor square, and the zombie-count sandbox option moves it up or down. Windows and doors can be boarded up. :cite[(`StashSystem.java:380-415`, `StashSystem.java:286-292`)]

## Why a map can lead to an empty or already-looted house

The cache is only placed in a building that nobody has entered yet, so any visit before you ends the stash.

The check is made when the building is filled, and any player, on a server too, counts as a visit the moment they stand inside. :cite[(`StashSystem.java:241-243`, `IsoPlayer.java:2185-2186`)]

Here are the ways a map goes nowhere:

1. **Somebody walked in first.** Another player, or you, before the building was filled. The stash is dropped without placing anything. :cite[(`StashSystem.java:241-243`)]
2. **The world marked the building visited.** A few random house stories (the burnt house, burnt corpse and burnt fireman stories, the Kate and Baldspot story and the "other" story) mark their building visited. Between the moment a map exists and the moment you read it, the building is not protected from those stories. :cite[(`StashSystem.java:197`, `RBBurnt.java:24`, `RBBurntCorpse.java:27`, `RBBurntFireman.java:28`, `RBKateAndBaldspot.java:34`, `RBOther.java:26`)] We read this in code and have not watched it happen in a game.
3. **The stash has no loot.** Thirty vanilla stashes name no loot table. Nine of those point at placeholder coordinates near 0,0 where no building exists, so the roll most likely cannot hand them out at all (we did not read the map data to confirm there is no building). They are joke and message maps. :cite[(`StashSystem.java:131-133`)]
4. **Someone else already emptied it.** The cache is ordinary loot once it is placed.

While a stash is still waiting for a map, its building is kept free of random stories. That protection ends the moment the map item exists and comes back only when someone reads the map. :cite[(`RandomizedBuildingBase.java:102-104`, `StashSystem.java:197`, `StashSystem.java:202-214`)]

## What changes on a server

On a server, the server rolls the maps, fills the buildings and keeps the saved list, and your game only draws the map.

The roll, the visited checks and the fill all run only when the code is not a multiplayer client, and the lists are written into the server's world save. :cite[(`StashSystem.java:96`, `StashSystem.java:430`, `IsoChunk.java:4179`, `IsoMetaGrid.java:1108-1112`)]

Reading a map on a server runs the read action's `complete` method on the server, and that method sets up the building there. :cite[(`ISReadMapItem.lua:36`, `LuaTimedActionNew.java:176-181`)]

> **Warning:** Server owners should treat a stash as shared loot, not a secret. The stash list is in shared Lua files that every client loads, and the server trusts some stash messages from clients. Keep your logs on.

Two more points matter on a server. A mod that adds stashes must be on the server and on every client, because the server needs the stash data and the client needs the map drawing code. And on a client the "maps I have read" list that feeds the world map icons is never filled by vanilla code, so those icons are most likely absent in multiplayer (not verified in a running game). :cite[(`ISWorldMap.lua:597-600`, `InventoryItem.java:3684-3691`, `IsoMetaGrid.java:1266-1272`)]

## Where to go next

- The step-by-step life of one stash: [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system).
- Every vanilla stash with its building and loot: [Every vanilla stash](/pz/build-42/engine/stash-and-annotated-maps/every-vanilla-stash).
- Add your own: [Modding stashes](/pz/build-42/engine/stash-and-annotated-maps/modding-stashes).

:::callout[How we know]{kind=proof}
Every number and rule above comes from reading the 42.22 Java and Lua. We did not run a game to watch a stash form, so the chance of a map spawning, the empty-house cases and the multiplayer map icons are read, not measured. The test that settles the odds: roll a few thousand of each map item through the loot system on a test world at choice 4 and count how many get names.
:::
