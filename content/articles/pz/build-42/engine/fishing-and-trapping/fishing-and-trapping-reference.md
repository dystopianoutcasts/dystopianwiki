---
id: build-42-fishing-and-trapping-reference
slug: fishing-and-trapping-reference
title: 'Fishing and trapping reference'
game: pz
version: build-42
section: engine
category: fishing-and-trapping
difficulty: advanced
tags:
  - engine
  - fishing
  - trapping
  - reference
excerpt: >-
  Every number from the fishing and trapping pages in one place, with its source line: timers, chances, sizes, schools, chum, nets, traps, animals, explosives and options.
last_updated: '2026-11-14'
related_articles:
  - how-fishing-works
  - fish-and-where-to-find-them
  - fishing-nets-and-other-methods
  - how-trapping-works
  - modding-fishing-and-trapping
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#r3-cast-and-bite) | [server owners](#r13-events-commands-packets) | [modders](#r12-sandbox-options-for-this-unit)

:::callout[The 1-minute version]{kind=key}
- This is the look-it-up page; for what the numbers mean, read the four topic pages first.
- Fishing timers run at 48 units per real second at game speed 1x (if fps is above 12), and trap countdowns run at 1 per real second at 1x.
- Animal traps roll once per game hour, and only if the trap square is not loaded. Nets break with a 1 in 5 chance if left over 15 hours, and hours over 20 are ignored.
- Chum, noise and school reset times are in game minutes, so they follow the Day Length option, while the explosive trap timers do not.
- Not verified: timed-action durations in seconds, the unit of the hunger and nutrition numbers, the load area of a dedicated server for the trap roll, and where the XP multipliers are applied.
:::

:::facts
- **Fishing timer** 48 units per real second at 1x
- **Cast** 85 units, 1.8 s
- **Net** 1 in 8 per game hour, break 1 in 5 over 15 hours, cap 20 hours
- **School reset** 7200 game minutes (5 days) after the last catch
- **Trap health** 50
- **Explosion radius cap** 15
:::

Outcast, this page is the look-it-up version. For what the numbers mean, read the four topic pages first: [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works), [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them), [Fishing nets and other methods](/pz/build-42/engine/fishing-and-trapping/fishing-nets-and-other-methods) and [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works).

**Citations.** Lua files are named from `game_snapshot/media/lua/`, Java from `src/`, scripts from `game_snapshot/media/`. All 42.22 capture. Short names: `FP` is `shared/Fishing/fishing_properties.lua`, `FU` is `shared/Fishing/FishingUtils.lua`, `FR` is `shared/Fishing/FishingRod.lua`, `FSM` is `zombie/iso/FishSchoolManager.java`, `TD` is `server/Traps/TrapDefinition.lua`, `STG` is `server/Traps/STrapGlobalObject.lua`, `IT` is `zombie/iso/objects/IsoTrap.java`.

## R1. Units and clocks

The fishing timers count frame units, the trap timers count real seconds, and the school and trap rolls follow the game calendar.

| Quantity | Value | Meaning | Code |
|----------|-------|---------|------|
| Fishing timer unit | 1 frame = `0.8 x (60 / fps)` units | **48 units per real second at game speed 1x**, if fps is above 12 | `zombie/GameTime.java:982`, `:986`; `zombie/FPSTracking.java:46-49` |
| Frame factor cap | 5 | Below 12 fps the timers run slower than real time | `FPSTracking.java:47-48` |
| Fish creation speed | Forced to 1x | Speed set back to normal when a fish is first decided | `shared/Fishing/Fish.lua:73-74` |
| Trap countdown | 1 per real second at 1x | `GameTimer(1)` equals 1 second whatever the day length | `IT:94`; `zombie/core/utils/GameTimer.java:17-26` |
| Explosion and noise "minutes" | 2.5 real seconds per unit at 1x | Noise 30 is about 75 s; smoke 10 is about 25 s | `IT:201-203`, `:316-318` |
| Repeating noise from a noise trap | Every 2.5 real seconds | World sound re-sent | `IT:331-335` |
| Sensor check | Once per real second | `OnceEvery(1.0)` | `IT:74`, `:264-300`; `zombie/core/utils/OnceEvery.java` |
| Chum, noise, school reset times | Game minutes | Uses the game calendar | `FSM:155-157` |
| Trap roll | Once per game hour | `Events.EveryHours` | `server/Traps/STrapSystem.lua:133` |
| Trap noise roll | Once per 10 game minutes | `Events.EveryTenMinutes` | `STrapSystem.lua:134` |
| Bait aging | Once per game day | `Events.EveryDays` | `STrapSystem.lua:132` |
| School reshuffle | Once per game day | `Events.EveryDays` | `FU:276-279` |

## R2. Fishing gear

The gear rows give the rod, hook and line factors, the lure rules and the related recipes.

| Item | Number | Code |
|------|-------:|--------|
| Rod strength factor, crafted rod | 0.8 | `FP:685-688` |
| Rod strength factor, proper rod | 1.0 | `FP:685-688` |
| Hook factor: Paperclip / Nails / Fishing hook (plain, forged, bone) | 0.8 / 1.0 / 1.2 | `FP:678-684` |
| No hook | 0 (no bites) | `FU:247-256` |
| Line wear per hit: Twine / Fishing line / Premium line | 0.02 / 0.01333 / 0.00667 | `FP:673-677` |
| Hits to snap a line from 1.0: Twine / Fishing line / Premium line | 50 / 75 / 150 | derived from `FP:673-677`, `FR:303-313` |
| Rod broken, crafted | Becomes `Base.WoodenStick` | `FP:689-692` |
| Rod broken, proper | Becomes `Base.FishingRodBreak` | `FP:689-692` |
| Snap noise | Radius 20, volume 1 | `FR:317` |
| Attach lure, change hook, change line, remove lure | Timed action 160 | `shared/TimedActions/Fishing/TimedActions/AIAttachLureAction.lua:100`; `ISChangeFishingRodEquip.lua:79`; `AIRemoveLureAction.lua:79` |
| Food lure hunger removed per attachment | 0.05 | `FP:42-57`; `AIAttachLureAction.lua:74` |
| Whole-use lures | Insects, minnows, leeches, worms, crayfish, shrimp, plastic lures | `FP:8-41`, `:59-61` |
| Plastic lures | `Base.JigLure`, `Base.MinnowLure` | `FP:59-61` |
| Random line and hook on a new rod | Chosen evenly from the line and hook tables | `FP:767-783` |
| Rod recipe `MakeFishingRod` | 1 knife, 1 stick, 2 line, 1 hook; time 80; learned at Fishing 4 or Carving 4 | `scripts/generated/recipes/recipes_fishing.txt:3-24` |
| Fix a broken rod `FixFishingRod` | Learned at Fishing 4 | `recipes_fishing.txt:26-45` |

## R3. Cast and bite

The cast, the waits and the bite factors decide how soon a fish takes the bait.

| Quantity | Value | Seconds at 1x | Code |
|----------|-------|--------------:|--------|
| Cast delay before the bobber appears | 85 units | 1.8 | `FR:63-66`, `:83-90` |
| Aim range | under 16 tiles | n/a | `FU:87-90` |
| Cast scatter | one of -1.5, -0.5, 0.5 tiles per axis, divided by (level + 1) | n/a | `FR:68-78` |
| First wait, score 0 | 2000 units | 41.7 | `shared/Fishing/Bobber.lua:106-117` |
| First wait, score under 40 | 1500 | 31.3 | same |
| First wait, score 40 to under 65 | 1000 | 20.8 | same |
| First wait, score 65 to under 80 | 650 | 13.5 | same |
| First wait, score 80 and up | 500 | 10.4 | same |
| Later waits | 0.8 x first wait | | `Bobber.lua:135` |
| Near-shore multiplier on later waits | x2 (shore tile within a 15 by 15 box) | | `Bobber.lua:139-141`; `FU:148-159` |
| Bobber within 3 tiles of you | x3 on later waits | | `Bobber.lua:142-144` |
| Time to start reeling after a bite | 360 units | 7.5 | `Bobber.lua:133`, `:148-159` |
| Fish direction change | Every 400 units | 8.3 | `shared/Fishing/Fish.lua:41-45` |
| Fish rests | Last 200 units of each cycle | 4.2 | `Fish.lua:47-50` |
| Fish pull, per axis | `(random -10 to 9) x length / 20 / 1200`, times 2.5 per unit | about 0.05 tiles per second per cm | `Fish.lua:42-43`; `Bobber.lua:194` |
| Pick up bobber when within | 0.6 tiles of rod tip | | `FR:190-196` |
| Pick up action | 267 (fish), 187 (trash) | | `shared/TimedActions/Fishing/TimedActions/ISPickupFishAction.lua:133-142` |

### Bite score factors

The bite score and the bite roll multiply the same four conditions, but they use different fish-count values at zero.

| Factor | Value | Code |
|--------|-------|--------|
| Fish count 0 / under 10 / 10 to 25 / over 25 (score) | 0 / 0.5 / 1.0 / 1.5 | `Bobber.lua:70-81` |
| Fish count 0 / under 10 / 10 to 25 / over 25 (bite roll) | 0.1 / 0.5 / 1.0 / 1.5 | `FU:258-272` |
| Air temperature 15 to under 30 C | 1.0 | `Bobber.lua:83-91`; `FU:208-220` |
| 0 to under 15 C, or 30 to under 40 C | 0.75 | same |
| 40 C and up, or -10 to under 0 C | 0.5 | same |
| -10 C and under | 0.25 | same |
| Fog 0.4 or more, or wind 0.5 or more | 0.8 | `Bobber.lua:93-98`; `FU:222-235` |
| Rain (without fog or wind) | 1.2 | same |
| Hours 4 to 6 and 18 to 20 | 1.2 | `Bobber.lua:100-104`; `FU:237-245` |
| Bite roll | 0.8 x temp x weather x time x hook x fish count; passes if a 0 to 99 number is below 100 times that | `Bobber.lua:229-231` |

### What is on the hook

The fish-or-trash roll compares a random number with the trash factor, and your level improves the odds.

| Quantity | Value | Code |
|----------|-------|--------|
| Fish roll, fish present | Random in `[level/30, 0.5 + level/20]` must exceed the trash factor | `Fish.lua:93` |
| Fish roll, no fish nearby | Random 0 to 4 below `0.1 + level/20`: 2.5 percent (level 0) to 15 percent (level 10) | `Fish.lua:93` |
| Trash factor, normal | 0.05 | `FSM:445-455` |
| Trash factor, inside a patch | 0.05 plus half a random 0 to 1 | `FSM:445-455` |
| Trash factor multiplier | x0.8 at level 5, x0.6 at 7, x0.2 at 9 | `Fish.lua:77-88` |
| Trash items | Seaweed, dirty ripped sheets, broken fishing net, empty tin can, empty water bottle | `FP:666-672` |
| Predators allowed only if | Tension at least 0.1 at creation | `Bobber.lua:132`; `Fish.lua:98-102` |
| Water type | River inside 6 fixed rectangles, else lake; every fish allows both | `shared/Fishing/FishingZones.lua:4-11`, `:40-47` |

### Lure used up

A plastic lure is rarely used up, and natural bait is used up often at low levels.

| Lure | Chance per real fish | Code |
|------|----------------------|--------|
| Plastic lure | 1 in `30 x (level + 1)` | `FR:364-367` |
| Natural bait | `(19 - level) / 20` | `FR:367-370` |
| Fish lost (miss or timeout) | Bait lost, except a trash "fish" timing out | `FR:341-348`; `Bobber.lua:150-155` |

## R4. The fight

The fight is a tension dial: above 0.8 the line wears and can snap, and below -0.8 with a fish on the fish escapes.

| Quantity | Value | Code |
|----------|-------|--------|
| Tension, slack | Negative, floor -1 | `FR:198-209` |
| Tension, taut | Positive, unbounded; dial shows up to 1 | `FR:198-209`; `client/Fishing/TensionUI.lua:24-31` |
| High tension | Above 0.8 | `FR:123` |
| Wear roll at high tension | 1 in 10 per frame | `FR:126-127` |
| High-tension limit | `(120 + 10 x level) x rod factor` units; x3 until the first fish | `FR:116-121` |
| Past the limit | 1 in 4 per frame: line snaps; else fish escapes | `FR:137-147` |
| Low tension | Below -0.8 with a fish on | `FR:152` |
| Past the limit (low) | Fish escapes | `FR:155-157` |
| Reel speed | `0.04 x units x ramp^2` per frame, up to about 1.9 tiles per second | `FR:219-223` |
| Reel ramp | Starts 0.2; grows `0.01 x (Strength + 2.5) / 5` per unit; cap 1 | `FR:164-188` |
| Reel and release controls | Left mouse reels, right mouse lets out | `FR:211-231` |
| Cancel key while fishing | One hit of wear if not idle | `client/Fishing/FishingManager.lua:65-70` |

Limits by level:

| Level | Proper rod (units / s) | Crafted rod (units / s) |
|------:|-----------------------:|------------------------:|
| 0 | 120 / 2.5 | 96 / 2.0 |
| 1 | 130 / 2.7 | 104 / 2.2 |
| 2 | 140 / 2.9 | 112 / 2.3 |
| 3 | 150 / 3.1 | 120 / 2.5 |
| 4 | 160 / 3.3 | 128 / 2.7 |
| 5 | 170 / 3.5 | 136 / 2.8 |
| 6 | 180 / 3.8 | 144 / 3.0 |
| 7 | 190 / 4.0 | 152 / 3.2 |
| 8 | 200 / 4.2 | 160 / 3.3 |
| 9 | 210 / 4.4 | 168 / 3.5 |
| 10 | 220 / 4.6 | 176 / 3.7 |

## R5. Size, weight and level

Your level sets the weight limit of the fish you can get and the odds of Small, Medium and Big.

| Level | Weight limit (kg) | Small | Medium | Big |
|------:|------------------:|------:|-------:|----:|
| 0 | 1.4 | 95 | 5 | 0 |
| 1 | 1.5 | 85 | 15 | 0 |
| 2 | 1.9 | 75 | 24 | 1 |
| 3 | 2.2 | 70 | 25 | 5 |
| 4 | 2.3 | 60 | 30 | 10 |
| 5 | 2.8 | 48 | 40 | 12 |
| 6 | 4.5 | 35 | 45 | 20 |
| 7 | 9 | 25 | 45 | 30 |
| 8 | 27 | 20 | 40 | 40 |
| 9 | 32 | 15 | 40 | 45 |
| 10 | 45 | 10 | 40 | 50 |

These come from the level tables :cite[(`FU:161-186`)]. Near shore: Small gets half of Medium and Big, which halve :cite[(`FU:196-200`)]. No fish nearby: 100 percent Small :cite[(`FU:189-191`)].

| Quantity | Value | Code |
|----------|-------|--------|
| Class split | Lengths in thirds: first 0.3333, next 0.6666, last to the maximum | `FP:146-180` |
| Weight in Small | 0.1 kg rising to 0.2 x top weight | `FP:146-158` |
| Weight in Medium | 0.2 x top weight rising to 0.6 x | `FP:161-169` |
| Weight in Big | 0.6 x top weight rising to 1.0 x | `FP:171-179` |
| Weight cap, normal catches | 45 pounds, 20.45 kg | `FP:156`, `:167`, `:177` |
| Trophy roll | 1 in 20, Big only, level 8 and up | `Fish.lua:152-157` |
| Item weight | `2.2 x kg` | `Fish.lua:206` |
| Nutrition scale | `2.2 x kg / 0.4` on calories, fats, carbs, protein | `Fish.lua:186-192` |
| Hunger | `-(kg / weight factor)`, at least -0.05 | `Fish.lua:194-205` |
| Weight factor | 2 small fish; 4 for striped bass, walleye, drum; 6 for catfish, muskie, gar, paddlefish, bait fish | `FP`, each species block |
| Item renamed Big | When item weight is 45 or more | `Fish.lua:209-213` |
| Loot fish | 60 / 30 / 10 percent Small / Medium / Big | `FP:709-760` |
| Net fish | 70 / 30 / 0 percent | `server/Fishing/BuildingObjects/FishingNet.lua:123` |

## R6. Species

The species table gives each fish's level, lengths, weights, hunger factor and predator flag.

The Code column gives the line in `FP`. `Pred` marks predators. Weight factor is the divisor for hunger.

| Species | Code | Level | Cm (min-max) | Trophy cm | kg | Trophy kg | Factor | Pred |
|---------|-----:|------:|--------------|----------:|---:|----------:|-------:|:----:|
| Largemouth bass | `FP:218` | 5 | 10-51 | 75 | 2.8 | 10 | 2 | no |
| Smallmouth bass | `FP:239` | 4 | 10-41 | 55 | 2.3 | 5 | 2 | no |
| White bass | `FP:260` | 1 | 10-38 | 40 | 1.5 | 3 | 2 | no |
| Spotted bass | `FP:281` | 2 | 10-38 | 45 | 1.8 | 5 | 2 | no |
| Striped bass | `FP:303` | 7 | 10-76 | 90 | 9 | 15 | 4 | no |
| Bluegill | `FP:324` | 0 | 10-20 | 35 | 1.4 | 1.2 | 2 | no |
| White crappie | `FP:345` | 0 | 10-30 | 24 | 1 | 2.5 | 2 | no |
| Black crappie | `FP:366` | 0 | 10-25 | 28 | 1 | 2.7 | 2 | no |
| Redear sunfish | `FP:387` | 0 | 10-20 | 24 | 1.4 | 0.9 | 2 | no |
| Yellow perch | `FP:408` | 0 | 10-30 | 30 | 1 | 1.9 | 2 | no |
| Sauger | `FP:429` | 2 | 10-45 | 50 | 1.9 | 1.8 | 2 | no |
| Green sunfish | `FP:450` | 0 | 10-20 | 20 | 1.4 | 0.9 | 2 | no |
| Walleye | `FP:471` | 7 | 10-80 | 88 | 9 | 13 | 4 | no |
| Freshwater drum | `FP:492` | 6 | 10-76 | 95 | 4.5 | 24.5 | 4 | no |
| Blue catfish | `FP:513` | 9 | 10-117 | 165 | 32 | 68 | 6 | yes |
| Channel catfish | `FP:536` | 4 | 10-30 | 80 | 2.3 | 26 | 6 | no |
| Flathead catfish | `FP:557` | 8 | 10-140 | 147 | 27 | 55 | 6 | yes |
| Muskellunge | `FP:580` | 8 | 10-101 | 127 | 18 | 32 | 6 | yes |
| Alligator gar | `FP:603` | 10 | 10-180 | 243 | 45 | 150 | 6 | yes |
| Paddlefish | `FP:626` | 8 | 10-150 | 220 | 27 | 90 | 6 | no |
| Bait fish | `FP:646` | 0 | 5-10 | none | 0.05 | none | 6 | no |

Lure weights per group are in [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them).

Script values for every fish: weight 0.4 (bait fish 0.1), hunger -15 (bait fish -3), calories 159 (30), carbs 1 (0), fats 1 (1.5), protein 35 (8.52), fresh 4 days, rotten after 8 days :cite[(`scripts/generated/items/food.txt:7080-7680`; bait fish `:6779`)].

## R7. Schools, chum, noise

A fish point is a hashed water tile, and chum and noise change how many fish a bobber counts.

| Quantity | Value | Code |
|----------|-------|--------|
| Fish point | Hash above 0.995 on a water tile outside no-fish boxes | `FSM:268-270` |
| Point radius | Hash plus 2, so 2 to 3 tiles; half count out to +1.5 | `FSM:276-278`, `:412-418` |
| Fish in a point | `hash x 40 x (option / 5)` minus fish that have bitten in the zone (counted at the bite) | `FSM:313-331` |
| Abundance window | 13 by 13 tiles around the bobber | `FSM:408-409` |
| New seed | Each game day (server rolls, sends to clients) | `FU:276-279`; `FSM:73-83` |
| Fishing zone | Map zone type `Fishing`, 40 by 40, name holds the caught count | `FSM:385-403` |
| Zone reset | 7200 game minutes (5 days) after the last catch | `FSM:145-151` |
| Splash chance | 1 in `max(12 + (30 - fish) x 2, 1)` per roll | `FSM:192` |
| Chum ramp | 0 to full over 100 game minutes | `FSM:361-364`, `:429-433` |
| Chum full power | +15 fish within 3 tiles; +7 within 4.5 | `FSM:420-434` |
| Chum lifetime | `100 + force` game minutes; force is `400 x chum hunger` | `AddChumToWaterAction.lua:41`; `FSM:361-364` |
| Chum throw range | Water within 8 tiles | `zombie/iso/ISWorldObjectContextMenuLogic.java:395-397` |
| Chum action times | Throw 200; make from sand 200; make from sandbag 120 | `AddChumToWaterAction.lua:56`; `CreateChumFromGroundSandAction.lua:55`; `recipes_fishing.txt:85-100` |
| Chum bait items per chum | Up to 10 | `scripts/generated/recipes/recipes_fishing_evolvedrecipe.txt:3-12` |
| Noise silence radius | Sound radius divided by 6 (whole number) | `zombie/WorldSoundManager.java:613`; `FSM:351-359` |
| Noise silence time | 180 game minutes | `FSM:355` |
| Trash patch | Hash above 0.99; radius `4 x hash + 2`, so 2 to 6 | `FSM:280-286`, `:445-455` |
| No-fish boxes | 14 in vanilla | `FishingZones.lua:13-29` |
| Saved | Seeds and chum only | `FSM:517-543` |

## R8. Nets

A net takes 150 to place, breaks with a 1 in 5 chance after 15 hours, and gives a plain catch of 1 in 8 per hour.

| Quantity | Value | Code |
|----------|-------|--------|
| Craft | 10 twine, 5 wire; time 150; learned at Fishing 6 | `recipes_fishing.txt:47-64` |
| Place | Water within 5 tiles; action 150 | `FishingNet.lua:29-33`; `ISPlaceFishingNetAction.lua:44` |
| Check | `hours x 13`, 150 above 11 hours; shows after 1 full hour | `ISCheckFishingNetAction.lua:45-48`; `ISWorldObjectContextMenuLogic.java:4092-4099` |
| Remove | Action 150 | `ISRemoveFishingNetAction.lua:43` |
| Add bait | Action 200 | `ISAddBaitToFishNetAction.lua:62` |
| Break | Over 15 hours: 1 in 5 | `FishingNet.lua:84-92` |
| Hour cap | 20 | `FishingNet.lua:93-95` |
| Plain catch | 1 in 8 per hour | `FishingNet.lua:105-110` |
| Plain catch list | Bait fish, frog, mussels, seaweed, crayfish, tadpole | `FP:693-700` |
| Bait strength | `chum hunger x -100`, cap 200; minus 10 per hour after a check | `FishingNet.lua:44-66`, `ISAddBaitToFishNetAction.lua:50` |
| Bait catch | 1 in `4 + (200 - strength) / 25` per hour | `FishingNet.lua:99-103`, `:111` |
| Bait catch list | Bait fish, tadpole, crayfish, blue, channel and flathead catfish | `FP:701-707` |
| XP | 1 per check action, plus 1 if anything was caught | `ISCheckFishingNetAction.lua:36`; `FishingNet.lua:162-165` |

## R9. Animal traps

Animal traps have 50 health and roll hourly, only when the trap square is not loaded, with two rolls that each add 1.5 per Trapping level.

| Quantity | Value | Code |
|----------|-------|--------|
| Trap health | 50 | `server/Traps/BuildingObjects/TrapBO.lua:12-13` |
| Hardness: crate 15, box 15, cage 20, snare 10, stick 15, mouse 50 | | `TD:6`, `:15`, `:24`, `:31`, `:38`, `:45` |
| Bait theft per hour | 1 in (hardness + 10) | `STG:160-163` |
| Destroy per hour, empty and unloaded | 1 in 40, then 1 in hardness | `STG:164-168` |
| Animal roll | Hourly, only if the trap square is not loaded | `STG:391-424` |
| Roll 1 | 0 to 99 below `trap + bait + 1.5 x level` | `STG:375` |
| Roll 2 (per zone type) | 0 to 99 below `zone + 1.5 x level` | `STG:378` |
| Active window, rabbit, squirrel, raccoon | 19:00 to 05:59 | `TD:58-59`, `:110-111`, `:286-287`; `STG:533-541` |
| Bait | Add 20; discard 20; takes 0.05 hunger | `ISAddBaitAction.lua:36-61`; `ISRemoveBaitAction.lua:51` |
| Check trap action | 40 | `ISCheckTrapAction.lua:50` |
| Remove trap action | 40 | `ISRemoveTrapAction.lua:54` |
| Trapped animal noise | Per 10 game minutes, 1 in 4: radius 40, volume 10 | `STG:126-131`; `STrapSystem.lua:98-104` |
| Live animal wait simulation | `hours held` plus 0 to 14 hours | `STG:225-243` |
| Live animal XP | 10 to 19 | `STG:216` |
| Dead animal XP | `size / 3`, at least 3 | `STG:299-303`, `:333-337` |
| Dead animal size | Random from min up to but not including max | `TD` and `STG:299`, `:333` |
| Trapping XP list | 50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000 | `zombie/characters/skills/PerkFactory.java:134` |
| Level snapshot | Taken at placement | `shared/Traps/TrapSystem.lua:46` |
| Zones snapshot | Taken at placement | `TrapSystem.lua:42` |
| No zone match | No catch ever | `STG:408-415` |

Animals, chances in percent (`TD`):

| Animal | Size | Hours | Traps | Zones | Baits |
|--------|-----:|-------|-------|-------|-------|
| Rabbit (`:51-104`) | 30-99 | 19-05 | Cage 40; snare, box, crate 30 | Forests 12; Deep and Organic 15; Vegitation 10; Town, TrailerPark 2 | Carrots 45; lettuce, bell pepper, cabbage 40; apple, corn, banana, potato, tomato, peach 35 |
| Squirrel (`:106-143`) | 10-59 | 19-05 | Cage 40; crate, snare 30; box 25 | As rabbit | Peanut butter, cereal 45; orange, peanuts, apple, corn, popcorn, lettuce 40; peach 35; bell pepper 30 |
| Bird (`:145-190`) | 2-31 | any | Stick 40 | Farm, FarmLand 35; Town, Vegitation 30; other 20 | Insects, worm, bread, bread slices 50; cereal, corn 45 |
| Mouse (`:192-234`) | 1-9 | any | Mouse trap 30 | Farm, FarmLand, TrailerPark 60; Town 50; Vegitation 20; forests 10 | Cheese 60; processed cheese 55; peanut butter, bacon bits 40; chocolate 30; orange, apple, tomato 35 |
| Rat (`:236-277`) | 5-24 | any | Mouse trap 25 | Farm, FarmLand 50; TrailerPark 40; Town 30; Vegitation 20; forests 10 | As mouse |
| Raccoon (`:279-330`) | 30-99 | 19-05 | As rabbit | As rabbit | As rabbit |

Zone types that count: TownZone, TrailerPark, Vegitation, Forest, DeepForest, BirchForest, BirchMixForest, FarmForest, FarmMixForest, PRForest, PHForest, PHMixForest, OrganicForest, Farm, FarmLand :cite[(`TD`)]. The filter that keeps only listed types is in the trap system :cite[(`shared/Traps/TrapSystem.lua:9-27`)].

Per-hour results for common setups (our arithmetic) are in [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works).

The recipes are in `scripts/generated/recipes/recipes_trapping.txt`. The crate recipe is learned at Trapping 4 :cite[(`scripts/generated/recipes/recipes_trapping.txt:3-23`)].

The stick trap is learned at Trapping 2 :cite[(`:25-42`)]. The snare needs Trapping 1 and is learned at 6 :cite[(`:44-64`)]. The box needs Woodwork 1 and Trapping 2 and is learned at 8 :cite[(`:66-87`)]. The cage needs Trapping 3 and is learned at 5 :cite[(`:89-105`)].

## R10. Explosive, flame, smoke and noise traps

The explosive traps cap their radius at 15 and their power at 100, and each item has its own values.

| Quantity | Value | Code |
|----------|-------|--------|
| Radius cap | 15 | `IT:69`, `:773` |
| Power cap | 100 | `IT:71`, `:842` |
| Damage per character per hit | Random from `power/20` to `2 x power/20`, plus extra damage | `IT:846` |
| Instant item | No timer, no sensor, not remote | `zombie/inventory/types/HandWeapon.java:2346-2348` |
| Timer ticks | One per real second | `IT:94`, `:168-169` |
| Sensor test | Once per second; same floor; within range; line clear; not invisible; timer at 0 | `IT:264-300` |
| Default noise if a sound but no noise range | Radius 50 | `IT:430-434` |
| Place action | 50 | `shared/TimedActions/ISPlaceTrap.lua:58` |
| Smoke effect | Zombies in range lose target, go idle | `IT:873-880` |
| Burn chance per body part | The item's fire chance; zombies skipped | `IT:855-865` |
| Non-PVP zone | Squares skipped | `IT:784` |
| Event | `OnThrowableExplode(trap, square)` | `IT:424`; `api/events.jsonl` |

Items are from `scripts/generated/items/weapon.txt`; Sensor V1/V2/V3 variants add sensor range.

| Item | Code | Explosion power / radius | Fire radius / energy / chance | Smoke radius / duration | Noise radius / duration | Sensor V1 / V2 / V3 | Sensor timer | Triggered timer |
|------|-----:|--------------------------|-------------------------------|-------------------------|-------------------------|--------------------|-------------:|----------------:|
| Pipe bomb | `:803` | 90 / 7 | none / 0 / 0 | none | 50 default | 3 / 4 / 6 | 5 | 10 |
| Aerosol bomb | `:231` | 70 / 6 | none / 20 / 10 | none | 50 default | 3 / 4 / 6 | 5 | 10 |
| Flame trap | `:432` | none | 6 / 40 / 50 | none | 50 default | 3 / 4 / 5 | 5 | 10 |
| Smoke bomb | `:997` | none | none / 40 / 50 | 5 / 10 | 10 / 10 | 3 / 4 / 5 | 5 | 10 |
| Noise trap | `:619` | none | none | none | 17 / 30 (reusable) | 3 / 4 / 6 | 10 | 10 |
| Firecracker | `:19718` | none | none | none | 80 | no | no | no |
| Crafted firecracker | `:19747` | none | none | none | 60 | no | no | no |
| Molotov | `:19776` | none | 4 / 30 / 30 | none | none | no | no | no |

## R11. Timed action durations

The durations are the values the actions return, and the table lists them for fishing, chum, nets and traps.

| Action | Duration | Code |
|--------|---------:|--------|
| Cast (bobber delay) | 85 units | `FR:64` |
| Pick up fish | 267 | `ISPickupFishAction.lua:138` |
| Pick up trash | 187 | `ISPickupFishAction.lua:140` |
| Attach, remove lure; change hook or line | 160 | see R2 |
| Chum: throw, make from sand | 200 | see R7 |
| Net: place, remove | 150 | see R8 |
| Net: add bait | 200 | `ISAddBaitToFishNetAction.lua:62` |
| Net: check | `hours x 13`, max 150 | `ISCheckFishingNetAction.lua:45-48` |
| Trap: add bait, discard bait | 20 | `ISAddBaitAction.lua:61`; `ISRemoveBaitAction.lua:51` |
| Trap: check, remove | 40 | `ISCheckTrapAction.lua:50`; `ISRemoveTrapAction.lua:54` |
| Place explosive or noise trap; pick up trap item | 50 | `ISPlaceTrap.lua:58`; `ISTakeTrap.lua:46` |

Their conversion to seconds depends on the timed-action speed and was not traced.

## R12. Sandbox options for this unit

Fishing Abundance scales the fish per point, the two multiplier options scale XP, and Day Length sets how long net and trap hours take.

| Option | Type | Default | Range | What it does here | Code |
|--------|------|--------:|-------|-------------------|--------|
| `FishAbundance` (label "Fishing Abundance") | Enum | 3 (Normal) | 1 Very Poor to 5 Very Abundant | Scales fish per point: `hash x 40 x (value / 5)`, so the highest whole number is 7, 15, 23, 31, 39 (always under 8 times the value) | `api/sandbox_options.jsonl`; `zombie/SandboxOptions.java:229`; `FSM:314` |
| `MultiplierConfig.Fishing` | Double | 1.0 | 0 to 1000 | XP multiplier for Fishing (use site not traced) | `SandboxOptions.java:1866` |
| `MultiplierConfig.Trapping` | Double | 1.0 | 0 to 1000 | XP multiplier for Trapping (use site not traced) | `SandboxOptions.java:1867` |
| `SurvivalGearsLootNew` ("Survival Essentials") | Double | 0.6 | 0 to 4 | Loot rate for fishing rods, tents and camping gear | `api/sandbox_options.jsonl`; `SandboxOptions.java:93` |
| `DayLength` | Enum | 4 | 1 to 27 | Sets the length of a game hour in real time, so net hours and trap hours take this long in real life. It does not change the real-second explosive timers. | `SandboxOptions.java:71`; `IT:201-203` |

Related server setting: PVP and the safety toggle decide whether explosions hurt players :cite[(`IT:815-833`)].

## R13. Events, commands, packets

These are the Lua events, client and server commands and network packets for fishing and traps.

| Name | Kind | Notes | Code |
|------|------|-------|--------|
| `OnFishingActionMPUpdate` | Event, both sides | Arg: one table with `player`, `Reject`, `UpdateFish`, `UpdateBobberParameters`, `CreateBobber`, `DestroyBobber`, `CatchFishStarted`, `fish`, `fishItem` | `api/events.jsonl`; `zombie/core/FishingAction.java:220-239` |
| `OnThrowableExplode` | Event | Args: trap, square | `IT:424` |
| `OnObjectAdded` | Event | Triggered by `TrapBO:create` to register a trap | `TrapBO.lua:49` |
| `FishingAction` packet | Network | Flags: start 1, stop 2, update fish 4, update bobber 8, create bobber 16, destroy bobber 32 | `FishingAction.java:31-36`; `zombie/network/packets/FishingActionPacket.java` |
| `AddExplosiveTrap` packet | Network | x, y, z, optional item and player | `zombie/network/packets/AddExplosiveTrapPacket.java` |
| Client command `fishing.brokeRodLine` | Command to server | Removes rod, gives replacement | `server/ClientCommands.lua:1298-1317` |
| Client command `fishing.missFish` | Command to server | Removes lure | `ClientCommands.lua:1319-1326` |
| Server command `fishing.attachLure`, `removeLure`, `consumeLure`, `addChumToWater` | Commands to client | Update rod name and mod data; add chum | `client/ServerCommands.lua:9-60` |
| Client commands `trap.*` | Commands to server | `add`, `remove`, `removeAnimal`, `addBait`, `checkTrap`, `removeBait`, `destroy`, `addAnimalDebug` | `server/Traps/trappingCommands.lua:13-103` |
| Client command `object.triggerRemote` | Command to server | Remote bombs | `ClientCommands.lua:269-272` |
| Lua globals | `startFishingAction`, `getPickedUpFish`, `sendPickupAnimalFromTrap` | | `api/lua_globals.jsonl` |
| Lua class | `FishSchoolManager` (`getInstance`, `addChum`, `addSoundNoise`, `getFishAbundance`, `getTrashAbundance`, `catchFish`) | Exposed to Lua | `zombie/Lua/LuaManager.java:2232`; `FSM:46`, `:351-453` |

## Where to go next

- [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works) and [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them).
- [Fishing nets and other methods](/pz/build-42/engine/fishing-and-trapping/fishing-nets-and-other-methods) and [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works).
- [Modding fishing and trapping](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 capture, with the source line in each row. Not verified: timed-action durations in seconds, the unit of the hunger and nutrition numbers, the load area of a dedicated server for the trap roll, and where the Fishing and Trapping XP multipliers are applied.
:::
