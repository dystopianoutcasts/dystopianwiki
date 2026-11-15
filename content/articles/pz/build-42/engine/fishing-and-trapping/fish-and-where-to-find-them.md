---
id: build-42-fish-and-where-to-find-them
slug: fish-and-where-to-find-them
title: 'Fish and where to find them'
game: pz
version: build-42
section: engine
category: fishing-and-trapping
difficulty: intermediate
tags:
  - engine
  - fishing
  - fish
  - zones
excerpt: >-
  Which fish you can catch in Project Zomboid 42.22, which bait suits each, where schools are, why they move daily, how fishing thins them, and how chum helps.
last_updated: '2026-11-14'
related_articles:
  - how-fishing-works
  - fishing-nets-and-other-methods
  - how-trapping-works
  - fishing-and-trapping-reference
  - modding-fishing-and-trapping
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#which-fish-bites-which-bait) | [server owners](#schools-move-every-day) | [modders](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)

:::callout[The 1-minute version]{kind=key}
- No fish bites only at night, none only lives in a river, and none wants rain. Time, weather and temperature change how fast anything bites, and what changes which fish you get is your Fishing level, what is on the hook, and whether the line was taut.
- Pick the bait for the fish you want, then wait for your level to let it through. A level 10 angler with worms still catches mostly small fish, because 21 species share the pool.
- Schools are placed from a seed and move every in-game day, so look for water splashes along the bank. Each fish that bites thins a 40 by 40 tile area for 5 days after the last catch.
- Chum makes a short-lived school at the tile you throw it on, and loud noise silences fish points nearby for 180 game minutes.
- Predators (blue catfish, flathead catfish, muskellunge, alligator gar) are skipped unless the line was taut when the fish took.
- If no lure is attached, no fish is in the pool, and the result is trash (read from code, not tested).
:::

:::facts
- **Fish point** about 1 water tile in 200 if the hash is spread evenly (an assumption, not measured)
- **School radius** 2 to 3 tiles
- **Bobber view** a 13 by 13 tile square
- **Thinned area** 40 by 40 tiles, reset after 7200 game minutes (5 days) with no catch, about 7.5 real hours at the default day length
- **Chum** full power after 100 game minutes, adds 15 fish within 3 tiles
- **Noise** silences points inside one sixth of its radius for 180 game minutes
- **Fish food** hunger -15, 159 calories, fresh 4 days, rotten after 8 days
:::

Outcast, here is the thing that surprises people about fishing in 42.22: there is **no fish that only bites at night, none that only lives in a river, and none that wants rain**. Time, weather and temperature change how fast *anything* bites ([How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works) has those numbers). What changes *which* fish you get is three things only: **your Fishing level, what is on the hook, and whether the line was taut.** Where you stand matters for a different reason: it decides whether there is a school under the bobber at all.

Citations are named from `game_snapshot/media/lua/` for Lua, `src/` for Java and `game_snapshot/media/` for scripts. All 42.22 capture.

## Where fish are: schools

The engine invents schools from a seed, so there is no stored fish, and schools move to new tiles every in-game day.

### A school is a "fish point"

A water tile is a **fish point** (the middle of a school) when a hash of its coordinates and the world's fish seed comes out above 0.995 :cite[(`zombie/iso/FishSchoolManager.java:268-270`, `:295-311`)]. If that hash is spread evenly, that is about 1 water tile in 200. That evenness is an assumption, not something we measured.

Each point then gets two more hashed numbers :cite[(`FishSchoolManager.java:276-278`, `:313-314`)]:

- **Radius:** a value from 0 to 1, plus 2. So between 2 and 3 tiles.
- **Fish count:** `value x 40 x (Fishing Abundance option / 5)`, rounded down. The hash is always below 1, so the count is always below 8 times the option number. The highest whole number it can be is:

| Sandbox "Fishing Abundance" | Label | Most fish in one point |
|-----------------------------|-------|-----------------------:|
| 1 | Very Poor | 7 |
| 2 | Poor | 15 |
| 3 (default) | Normal | 23 |
| 4 | Abundant | 31 |
| 5 | Very Abundant | 39 |

The option range, default and labels are in the option index and the English strings :cite[(`api/sandbox_options.jsonl` `FishAbundance`; `zombie/SandboxOptions.java:229`; `shared/Translate/EN/Sandbox.json`)].

A point is **not** a point if its tile is inside one of the no-fish rectangles :cite[(`FishSchoolManager.java:238-266`; the list is `shared/Fishing/FishingZones.lua:13-29`)]. Fourteen small boxes in vanilla Kentucky are marked no-fish.

### What the bobber "sees": abundance

When a bobber is down, the game adds up every school within a 13 by 13 tile square centered on it, and that sum is the abundance that feeds the bite score.

The sum is made in four steps :cite[(`FishSchoolManager.java:405-443`)]:

1. For each fish point in the square that is not silenced by noise (below), find its distance `d` to the bobber.
2. If `d` is no more than the point's radius (2 to 3), add the point's **full** count.
3. Else if `d` is no more than the radius plus 1.5, add **half** its count.
4. Add chum (below). Never go below 0.

That sum is the **abundance**. It feeds the bite score in four steps: 0, under 10, 10 to 25, over 25 :cite[(`shared/Fishing/Bobber.lua:70-81`; `shared/Fishing/FishingUtils.lua:258-272`)].

How often is there a school? If points are spread evenly, about 1 in 10 water spots sits inside a full-strength school, and about 1 in 5 is within reach of one (a worked estimate, not measured). At Normal abundance one point alone cannot pass 23, so to reach the top bite tier you need two schools close together, or chum.

### Schools move every day

Once per in-game day the world rolls a new seed, and every fish point jumps to a new tile.

The roll hooks `Events.EveryDays` :cite[(`shared/Fishing/FishingUtils.lua:276-279`; `FishSchoolManager.java:73-83`)]. The old school you were working is gone, and a new one is somewhere else. In multiplayer, the server rolls the seed and sends it to every client :cite[(`FishSchoolManager.java:80-82`, `:457-489`)]. (Every day is 90 real minutes at the default day length.) The seed and the chum list are saved in `fishingData.bin` :cite[(`FishSchoolManager.java:517-543`)].

**Reading a school.** On screen, a fish point makes water splashes. The more fish in it, the more often it splashes: the chance per roll is 1 in `max(12 + (30 - fish) x 2, 1)`, so 1 in 70 for a single fish, 1 in 24 for 24 fish, and every roll at 36 or more :cite[(`FishSchoolManager.java:159-210`, `:192`)]. Splashes only play for tiles on screen. Walk the bank and look for them.

### Catching thins a school, for 5 days

Each fish that bites is counted against a 40 by 40 tile square, and the count resets only after 7200 game minutes (5 days) with no catch there.

The count is made when the fish is created at the bite, so a fish that then escapes or snaps your line still thins the school :cite[(`FishSchoolManager.java:366-403`, `shared/Fishing/Fish.lua:238-249`)]:

- The square is a map zone of type `Fishing`, centered on the catch. If none exists, the game makes one, with the zone's *name* set to a number: how many fish have been caught there :cite[(`FishSchoolManager.java:385-403`)].
- Every point's fish count is reduced by that number :cite[(`FishSchoolManager.java:330`)].
- Every catch adds 1 :cite[(`FishSchoolManager.java:367-371`)].
- If nothing is caught in the square for **7200 game minutes (5 days)**, the number is set back to 0 :cite[(`FishSchoolManager.java:145-151`)]. At the default 1 hour 30 minute day :cite[(`zombie/SandboxOptions.java:413-423`)], a game hour is 3.75 real minutes, so 5 game days is about 7.5 real hours.

The counter belongs to the *area*, not to the school. A new seed at midnight moves the schools, but the area still carries yesterday's catches. So a good bank gets worse the more you fish it, and heals 5 days after the last catch.

A thinned point can count below zero, and that cancels out fish from a neighboring point; only the final total is held at 0 :cite[(`FishSchoolManager.java:414`, `:438-440`)]. So a thinned school simply stops showing up.

Trash and net catches do not count: only a real fish created by a rod bite calls `catchFish` :cite[(`Fish.lua:238-249`)].

A mapper can place a `Fishing` zone in a map and give it a number as its name. That reads as "already caught this many" :cite[(`FishSchoolManager.java:313-331`, `:576-585`)]. Whether a map-made zone survives the 5-day reset check, which compares against a zone timestamp, was not verified (see the end of this page).

### Chum: a school you make yourself

Thrown chum adds a short-lived fish source at that exact water tile.

The source is added when the chum lands :cite[(`FishSchoolManager.java:361-364`)]. Numbers:

| Stage | What happens | Code |
|-------|--------------|------|
| 0 to 100 game minutes after throwing | Chum power climbs in a straight line from 0 to full | `FishSchoolManager.java:429-433` |
| Full power | Adds **15 fish** to the abundance for bobbers within 3 tiles of the chum, and **7 fish** for bobbers 3 to 4.5 tiles away | `FishSchoolManager.java:420-434` |
| Until it ends | The chum lasts `100 + force` game minutes from the throw, where force is `400 x` the chum's hunger value (a positive number) | `shared/TimedActions/Fishing/TimedActions/AddChumToWaterAction.lua:41`; `FishSchoolManager.java:361-364` |
| Then | It is removed, and clients are told | `FishSchoolManager.java:126-138` |

In real time at the default day length: the ramp is about 6 real minutes, and a chum with force 200 lasts 300 game minutes, about 19 real minutes. Fifteen fish alone is a bite tier of 1.0 (10 to 25); two chums on the same spot make 30, the top tier of 1.5. Chum also splashes on its own :cite[(`FishSchoolManager.java:197-199`)], but its splash radius is small (0.3).

**Making chum.** Chum starts as a bare "Chum" item with no hunger value :cite[(`scripts/generated/items/food.txt:2039-2050`)]. You get it in two ways: the "Make chum" recipe, which needs a sandbag :cite[(`scripts/generated/recipes/recipes_fishing.txt:85-100`)], or the right-click on a sand tile, which takes 200 and turns that tile into blend ground :cite[(`shared/TimedActions/Fishing/TimedActions/CreateChumFromGroundSandAction.lua:30-55`; menu at `zombie/iso/ISWorldObjectContextMenuLogic.java:920`)]. Both need the Make Chum recipe known; the recipe is learned automatically at Fishing 5 :cite[(`scripts/generated/recipes/recipes_fishing.txt:92`)] and the Fisherman profession starts with it :cite[(`scripts/generated/characters/character_professions.txt:105-112`)].

Then you add bait to the chum with the "Add bait to chum" evolved recipe, up to 10 items :cite[(`scripts/generated/recipes/recipes_fishing_evolvedrecipe.txt:3-12`)]. Each bait carries a value; the ones with `AddBaitToChum` in their script are:

| Bait | Value |
|------|------:|
| Insects, caterpillars, termites, worms, maggots, slugs, snails | 1 |
| Leech, tadpole | 2 |
| Dog food (open tin) | 3 |
| Bait fish | 5 |
| Baguette, bread, dough, bread dough, baguette dough | 10 |
| Meat patty | 30 |

The bait values are read from the food scripts :cite[(`scripts/generated/items/food.txt:2065`, `:2108`, `:2815`, `:2890`, `:3096`, `:4372`, `:6790`, `:7038`, `:7063`, `:8120-8638`, `:9429`)]. How a value becomes the chum's hunger change was not traced; if it is the value divided by 100 (the usual rule for evolved recipes), then ten bait fish make chum with hunger -0.5 and force 200, or **300 game minutes** of fish. Not verified in a running game.

A bare chum with no bait in it (hunger 0) is thrown away with no effect :cite[(`AddChumToWaterAction.lua:41-46`)]. Chum can be thrown at a water tile within 8 tiles :cite[(`ISWorldObjectContextMenuLogic.java:395-397`; action time 200, `AddChumToWaterAction.lua:56`)].

### Noise scares schools away

Any sound registered with the world sound manager silences fish points inside one sixth of its radius for 180 game minutes (about 11 real minutes at the default day length).

The rule is in the sound manager and the school manager :cite[(`zombie/WorldSoundManager.java:613`; `FishSchoolManager.java:351-359`)]. Chum points are silenced the same way.

This rule runs only on the server or in single player, never on a client :cite[(`zombie/WorldSoundManager.java:613`)]. Examples: a snapped fishing line makes a sound of radius 20 (3 tiles), checking a net the same :cite[(`shared/Fishing/FishingRod.lua:317`; `shared/TimedActions/Fishing/TimedActions/ISCheckFishingNetAction.lua:20`)], a noise trap 17 (2 tiles), a firecracker 80 (13 tiles). A gunshot's radius is larger still.

Silenced points count as zero fish. The list of silenced points is not saved (the save writes only the seeds and the chum :cite[(`FishSchoolManager.java:517-543`)]), and a new daily seed clears it :cite[(`FishSchoolManager.java:75`)].

### Trash patches

A second hidden map with its own seed marks trash patches, which raise the trash value a fish roll has to beat.

About 1 tile in 100 starts one (hash above 0.99), with a radius up to 6 :cite[(`FishSchoolManager.java:280-286`, `:445-455`)]. Inside, the trash value is 0.05 plus half a random number, so 0.05 to 0.55; outside it is 0.05. That value is what a fish roll has to beat (see [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works)).

### Rivers and lakes

On vanilla data, river or lake does not change which fish you can get, because every fish is marked as living in both.

The game calls a spot a **river** when its map coordinates fall inside one of six hard-coded rectangles that cover the vanilla Kentucky rivers :cite[(`shared/Fishing/FishingZones.lua:4-11`, `:40-47`)]. Anywhere else is a **lake**. In 42.22 every fish is marked as living in both, because each species block calls `setLocation(true, true)` :cite[(`shared/Fishing/fishing_properties.lua`)].

On a modded map, all water is "lake", and again it changes nothing. A mod that adds river-only or lake-only fish must edit the rectangle list (see [Modding fishing and trapping](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)).

### Near shore

A bobber within 7 tiles of a shore tile is "near shore", which slows bites and shifts catches toward small fish.

That doubles the time between bite rolls and moves half of the Medium and Big size chances to Small :cite[(`shared/Fishing/FishingUtils.lua:148-159`, `:196-200`; `Bobber.lua:139-141`)]. Fish bigger, and sooner, farther out.

## Every fish

The species data is in one file, and a fish can be picked only when your Fishing level allows its top weight.

How to read the tables. Species data is in `shared/Fishing/fishing_properties.lua`. The "Level" column is the lowest Fishing level at which the fish can be picked: its top weight must not exceed that level's limit :cite[(`shared/Fishing/Fish.lua:91`, `:97`; `shared/Fishing/FishingUtils.lua:161-172`)].

Weights are kilograms; the in-game fish item weighs 2.2 times that. "Hunger" is the item's base hunger at the species' top normal weight, as a positive number :cite[(`Fish.lua:194-205`)]: weight divided by a per-species factor (2 for small fish, 4 for mid-size, 6 for big ones), capped at 20.45 kg of weight. A fish never gives less than 0.05 hunger.

### Size, weight and level

The table lists all 21 fish with their sizes, trophy sizes, top weights and unlock levels.

| Fish | Item | Level | Length cm | Trophy cm | Top kg | Trophy kg | Predator | Hunger | Code |
|------|------|------:|-----------|----------:|-------:|----------:|:--------:|-------:|--------|
| Largemouth bass | `Base.LargemouthBass` | 5 | 10 to 51 | 75 | 2.8 | 10 | no | 1.4 | `:218` |
| Smallmouth bass | `Base.SmallmouthBass` | 4 | 10 to 41 | 55 | 2.3 | 5 | no | 1.15 | `:239` |
| White bass | `Base.WhiteBass` | 1 | 10 to 38 | 40 | 1.5 | 3 | no | 0.75 | `:260` |
| Spotted bass | `Base.SpottedBass` | 2 | 10 to 38 | 45 | 1.8 | 5 | no | 0.9 | `:281` |
| Striped bass | `Base.StripedBass` | 7 | 10 to 76 | 90 | 9 | 15 | no | 2.25 | `:303` |
| Bluegill | `Base.Bluegill` | 0 | 10 to 20 | 35 | 1.4 | 1.2 | no | 0.7 | `:324` |
| White crappie | `Base.WhiteCrappie` | 0 | 10 to 30 | 24 | 1 | 2.5 | no | 0.5 | `:345` |
| Black crappie | `Base.BlackCrappie` | 0 | 10 to 25 | 28 | 1 | 2.7 | no | 0.5 | `:366` |
| Redear sunfish | `Base.RedearSunfish` | 0 | 10 to 20 | 24 | 1.4 | 0.9 | no | 0.7 | `:387` |
| Yellow perch | `Base.YellowPerch` | 0 | 10 to 30 | 30 | 1 | 1.9 | no | 0.5 | `:408` |
| Sauger | `Base.Sauger` | 2 | 10 to 45 | 50 | 1.9 | 1.8 | no | 0.95 | `:429` |
| Green sunfish | `Base.GreenSunfish` | 0 | 10 to 20 | 20 | 1.4 | 0.9 | no | 0.7 | `:450` |
| Walleye | `Base.Walleye` | 7 | 10 to 80 | 88 | 9 | 13 | no | 2.25 | `:471` |
| Freshwater drum | `Base.FreshwaterDrum` | 6 | 10 to 76 | 95 | 4.5 | 24.5 | no | 1.12 | `:492` |
| Blue catfish | `Base.BlueCatfish` | 9 | 10 to 117 | 165 | 32 | 68 | yes | 3.41 | `:513` |
| Channel catfish | `Base.ChannelCatfish` | 4 | 10 to 30 | 80 | 2.3 | 26 | no | 0.38 | `:536` |
| Flathead catfish | `Base.FlatheadCatfish` | 8 | 10 to 140 | 147 | 27 | 55 | yes | 3.41 | `:557` |
| Muskellunge | `Base.Muskellunge` | 8 | 10 to 101 | 127 | 18 | 32 | yes | 3.0 | `:580` |
| Alligator gar | `Base.AligatorGar` | 10 | 10 to 180 | 243 | 45 | 150 | yes | 3.41 | `:603` |
| Paddlefish | `Base.Paddlefish` | 8 | 10 to 150 | 220 | 27 | 90 | no | 3.41 | `:626` |
| Bait fish | `Base.BaitFish` | 0 | 5 to 10 | none | 0.05 | none | no | 0.01 | `:646` |

The Code column gives the line in `shared/Fishing/fishing_properties.lua` where the species block starts. The item id spelling `AligatorGar` is the game's own.

A few oddities in the data, as read:

- **Channel catfish** tops out at 30 cm and 2.3 kg in normal catches, but its trophy length is 80 cm and trophy weight 26 kg :cite[(`fishing_properties.lua:536-556`)]. Normal catches are small; a level 8+ Big roll can be huge.
- **Some trophy numbers are not above the normal maximum**: white crappie length 24 against 30, yellow perch length 30 against 30, green sunfish length 20 against 20, and the weights of bluegill (1.2 against 1.4), redear sunfish (0.9 against 1.4), sauger (1.8 against 1.9) and green sunfish (0.9 against 1.4). The trophy code only calls a fish Legendary if the stretched value beats the normal maximum; otherwise it pins the fish to the normal maximum :cite[(`Fish.lua:152-184`)]. A fish is Legendary if either its length or its weight beats the normal maximum, so only the **green sunfish** (length 20 against 20, weight 0.9 against 1.4) can never be Legendary. The others can win on the other dimension: white crappie on weight (2.5 against 1.0), yellow perch on weight (1.9 against 1.0), bluegill on length (35 against 20), redear sunfish on length (24 against 20), sauger on length (50 against 45). The code also asks for a random number up to `trophy minus current`, which can be zero or negative there :cite[(`Fish.lua:161`, `:172`)]; what the random call does with that was not verified.
- **The bait fish** is caught from level 0 and weighs from 0.01 to 0.1 kg. Its smallest size class starts at 0.1 kg and falls to 0.01 at the next length, a quirk of the weight formula :cite[(`fishing_properties.lua:146-158`, with max weight 0.05)]. It is also not exempt from the 0.05 hunger floor, because the code compares the item type to `"BaitFish"` but the type is `"Base.BaitFish"` :cite[(`Fish.lua:196`, `:203`; `fishing_properties.lua:646`, `:737`)]. The net code has the same slip :cite[(`server/Fishing/BuildingObjects/FishingNet.lua:135`)]. So a caught bait fish gets hunger -0.05, not -0.01. Not verified in a running game.

### Size classes by length

Each species splits its lengths into thirds, and weights run in a straight line inside each class.

The classes are set in the species code :cite[(`fishing_properties.lua:146-180`)]. A few examples:

| Fish | Small | Medium | Big | Weight at the top of Small, Medium, Big |
|------|-------|--------|-----|------------------------------------------|
| Largemouth bass | 10 to 23 cm | 24 to 37 | 38 to 51 | 0.56, 1.68, 2.8 kg |
| Bluegill | 10 to 13 | 14 to 16 | 17 to 20 | 0.28, 0.84, 1.4 |
| Walleye | 10 to 33 | 34 to 56 | 57 to 80 | 1.8, 5.4, 9 |
| Blue catfish | 10 to 45 | 46 to 81 | 82 to 117 | 6.4, 19.2, 20.45 (capped; the formula says 32) |
| Alligator gar | 10 to 66 | 67 to 123 | 124 to 180 | 9, 20.45, 20.45 |

The smallest fish of any species weighs 0.1 kg.

### Which level unlocks what

Each Fishing level allows fish up to a weight limit, and the list only widens as you level.

| Level | Weight limit (kg) | New fish allowed |
|------:|------------------:|------------------|
| 0 | 1.4 | Bluegill, white crappie, black crappie, redear sunfish, yellow perch, green sunfish, bait fish |
| 1 | 1.5 | White bass |
| 2 | 1.9 | Spotted bass, sauger |
| 3 | 2.2 | (none) |
| 4 | 2.3 | Smallmouth bass, channel catfish |
| 5 | 2.8 | Largemouth bass |
| 6 | 4.5 | Freshwater drum |
| 7 | 9 | Striped bass, walleye |
| 8 | 27 | Muskellunge, flathead catfish, paddlefish |
| 9 | 32 | Blue catfish |
| 10 | 45 | Alligator gar |

The limits are compared against each species' top weight :cite[(`shared/Fishing/FishingUtils.lua:161-172`; `Fish.lua:97`)]. The list only widens as you level, so at level 10 you can still catch a bluegill.

**Predators.** The four species marked "yes" (blue catfish, flathead catfish, muskellunge, alligator gar) are skipped unless the line was taut (tension at least 0.1) when the fish took :cite[(`Fish.lua:98-102`; `Bobber.lua:132`)].

## Which fish bites which bait

The lure decides how likely each allowed fish is, as a share of a pool.

The weights are shares of a pool, not percentages: the game adds the weights of every allowed fish that lists your lure, then picks one at random in proportion :cite[(`Fish.lua:96-125`)]. A weight of 0 puts a fish in the pool but gives it no share.

### Bait groups

Bait items fall into groups, and each fish has one weight per group.

| Group | Items |
|-------|-------|
| Insects | Cricket, grasshopper, caterpillars (American lady, banded woolly bear, monarch, silk moth, swallowtail), centipede (two kinds), millipede (two kinds), pillbug, sawfly larva, cockroach, termites |
| Minnows | Bait fish, tadpole |
| Leeches | Leech, snail, slug (two kinds) |
| Worms | Worm, maggots |
| Flesh | Crayfish, shrimp, open dog food, fish fillet, small animal meat, small bird meat, meat patty, frog meat, steak |
| Plant | Cheese, open canned corn, dough, bread, bread dough, baguette dough, baguette |
| Plastic lures | Jig lure, minnow lure |

The groups are listed in the species file :cite[(`shared/Fishing/fishing_properties.lua:6-63`)]. Insects, minnows, leeches, worms, crayfish and shrimp, and the plastic lures are used whole; the others lose 0.05 hunger per attachment :cite[(`AIAttachLureAction.lua:70-79`)].

### The weight table

Each cell is the weight for that bait group.

"Plastic" is jig lure / minnow lure. "Best bait" is the one item the species rates 0.9 (see the lines after each species block in `fishing_properties.lua`).

| Fish | Insects | Minnows | Leeches | Worms | Flesh | Plant | Plastic | Best bait (0.9) |
|------|--------:|--------:|--------:|------:|------:|------:|--------:|-----------------|
| Largemouth bass | 0.3 | 0.7 | 0.5 | 0.7 | 0.1 | 0 | 0.5 / 0.5 | Maggots |
| Smallmouth bass | 0.3 | 0.7 | 0.5 | 0.7 | 0.1 | 0 | 0.5 / 0.5 | Worm |
| White bass | 0.3 | 0.3 | 0.7 | 0.7 | 0 | 0 | 0.5 / 0.5 | Tadpole |
| Spotted bass | 0.3 | 0.3 | 0.7 | 0.7 | 0 | 0 | 0.5 / 0.5 | Crayfish |
| Striped bass | 0.1 | 0.7 | 0.5 | 0.7 | 0.5 | 0 | 0.5 / 0.5 | Leech |
| Bluegill | 0.5 | 0.1 | 0.7 | 0.7 | 0 | 0 | 0.5 / 0.5 | Cricket |
| White crappie | 0.1 | 0.7 | 0.7 | 0.5 | 0 | 0 | 0.5 / 0.5 | Tadpole |
| Black crappie | 0.1 | 0.7 | 0.7 | 0.5 | 0 | 0 | 0.5 / 0.5 | Tadpole |
| Redear sunfish | 0.7 | 0.1 | 0.7 | 0.5 | 0 | 0 | 0.5 / 0.5 | Grasshopper |
| Yellow perch | 0.7 | 0.1 | 0.7 | 0.5 | 0 | 0 | 0.5 / 0.5 | Snail |
| Sauger | 0.5 | 0.1 | 0.7 | 0.7 | 0 | 0 | 0.5 / 0.5 | Crayfish |
| Green sunfish | 0.7 | 0.1 | 0.5 | 0.7 | 0 | 0 | 0.5 / 0.5 | Worm |
| Walleye | 0.7 | 0.7 | 0.7 | 0.5 | 0.3 | 0 | 0.5 / 0.5 | Leech |
| Freshwater drum | 0.1 | 0 | 0.5 | 0.7 | 0 | 0.7 | 0.5 / 0.5 | Dough |
| Blue catfish | 0.1 | 0 | 0.1 | 0.5 | 0.7 | 0.5 | 0.5 / 0.5 | Open dog food |
| Channel catfish | 0.1 | 0 | 0.1 | 0.5 | 0.7 | 0.5 | 0.5 / 0.5 | Open dog food |
| Flathead catfish | 0.1 | 0 | 0.1 | 0.5 | 0.7 | 0.5 | 0.5 / 0.5 | Open dog food |
| Muskellunge | 0.1 | 0.7 | 0.5 | 0.5 | 0.5 | 0 | 0.5 / 0.5 | Bait fish |
| Alligator gar | 0.1 | 0.7 | 0.5 | 0.5 | 0.5 | 0 | 0.5 / 0.5 | Bait fish |
| Paddlefish | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 / 0.1 | none |
| Bait fish | 0.7 | 0 | 0 | 0.7 | 0 | 0.7 | 0 / 0 | none |

The game's own help text bands these: 0.8 to 1.0 Great, 0.6 to 0.8 Good, 0.4 to 0.6 Average, 0.2 to 0.4 Below Average, under 0.2 Poor :cite[(`fishing_properties.lua:141-144`)]. A "best bait" overrides its group: for example Cricket is 0.9 for a bluegill, though insects are 0.5 for a bluegill.

### What that means at the bank

The shares are computed from the pool of fish your level allows, so the same bait gives different catches at different levels.

A few worked examples (our arithmetic from the weights above, assuming the line is taut):

| Bait and level | What you mostly get |
|----------------|---------------------|
| Worm, level 0 | Green sunfish 21 percent, bluegill 16, bait fish 16, the three crappie and the perch about 12 each |
| Worm, level 5 | 13 species (channel catfish included); smallmouth and green sunfish 10.6 percent each, the rest 5.9 to 8.2 |
| Worm, level 10 | Twenty-one species, none above 7.2 percent |
| Open dog food, level 10 | Blue, channel and flathead catfish 19 percent each, striped bass, muskie, gar 10 each |
| Jig lure, level 10 | Every allowed fish about 5 percent, paddlefish 1 |
| Bait fish, level 10 | Muskie and gar 12.5 percent each; bass and walleye 10 |
| Cheese, level 0 | Bait fish only (every other level-0 fish has Plant weight 0) |

The practical lesson: **pick the bait for the fish you want, then wait for the level to let it through.** A level 10 angler with worms still catches mostly small fish, because 21 species share the pool.

If **no lure** is attached, no fish is in the pool, and the result is trash (read from code, not tested) :cite[(`Fish.lua:96-135`)].

## Food values

Every fish item starts with the same script values, and the fish you actually catch rewrites them by its weight.

The script values are in the food scripts :cite[(`scripts/generated/items/food.txt:7080-7680`)]:

| Item | Script weight | Hunger | Calories | Carbs | Fats | Protein | Fresh for | Rotten after |
|------|--------------:|-------:|---------:|------:|-----:|--------:|----------:|-------------:|
| Any of the 20 fish | 0.4 | -15 | 159 | 1 | 1 | 35 | 4 days | 8 days |
| Bait fish | 0.1 | -3 | 30 | 0 | 1.5 | 8.52 | 4 days | 8 days |

All 20 are `base:food` with tags `base:fishmeat` and `base:uncutfish`, eaten with two hands, dangerous raw, cookable in 20 minutes and burnt after 60 :cite[(e.g. `food.txt:7080-7108`)]. Bait fish has no tags :cite[(`food.txt:6779`)].

What you actually get depends on the fish you caught, because `createFish` rewrites the numbers :cite[(`Fish.lua:186-207`)]: nutrients scale by `2.2 x kg / script weight`, and hunger is set to `-(kg / factor)`, never above -0.05. A fish found as loot or made another way goes through `Fishing.onCreateFish`, which rolls a size using 60 percent Small, 30 Medium and 10 Big :cite[(`fishing_properties.lua:709-760`)]. The hunger and nutrition units are explained in [Hunger, thirst and nutrition](/pz/build-42/engine/character-stats/hunger-thirst-and-nutrition).

## Where to go next

- [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works) for the bite roll, the minigame and the line.
- [Fishing nets and other methods](/pz/build-42/engine/fishing-and-trapping/fishing-nets-and-other-methods) for fish you can get without a rod.
- [Fishing and trapping reference](/pz/build-42/engine/fishing-and-trapping/fishing-and-trapping-reference) for all numbers together.
- [Modding fishing and trapping](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping) to add a species.
- For map zone types in general: [Zones and spawns overview](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 capture, not measured in a running game. Not verified: the "1 in 200 tiles" and "1 in 10 spots" figures assume an even spread of the coordinate hash, which we did not sample.

Also not verified: how the evolved recipe turns bait values into the chum's hunger number. Whether a map-authored `Fishing` zone keeps a preset number, since the 5-day reset compares against `zone.getLastActionTimestamp()`, whose default for a map zone we did not read :cite[(`FishSchoolManager.java:145`)].

Java reads the no-fish list with a loop from 0 to size minus 1 over a Lua list that starts at 1 :cite[(`FishSchoolManager.java:245-255`)], so whether the last rectangle (the 14th) is skipped by the Java side depends on how `rawget(int)` indexes; the Lua side reads all 14 :cite[(`FishingZones.lua:31-38`)]. Splash timing per second depends on the frame rate and was not measured.
:::
