---
id: build-42-how-fishing-works
slug: how-fishing-works
title: 'How fishing works'
game: pz
version: build-42
section: engine
category: fishing-and-trapping
difficulty: intermediate
tags:
  - engine
  - fishing
  - survival
  - multiplayer
excerpt: >-
  How fishing works in Project Zomboid 42.22: the cast, what makes a bite, the tension minigame, what snaps a line, fish size, skill and XP, and who runs each part in multiplayer.
last_updated: '2026-11-14'
related_articles:
  - fish-and-where-to-find-them
  - fishing-nets-and-other-methods
  - how-trapping-works
  - fishing-and-trapping-reference
  - modding-fishing-and-trapping
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#step-4-the-fight) | [server owners](#multiplayer-who-runs-what) | [modders](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)

:::callout[The 1-minute version]{kind=key}
- Aim at water with the right mouse button, click the left to cast, and wait for a bite. A fair-weather, mid-day cast on a busy spot rolls for the first time after about 10 seconds (computed from the code at game speed 1x, not measured).
- You need a rod in your primary hand, a hook (no hook means no bites at all) and a lure or bait. With no lure on the rod, every fish roll falls through to trash (read from code, not verified in a running game).
- Cast 3 or more tiles out: after the first roll, a bobber within 3 tiles of you triples the later waits, and one within 7 tiles of a shore tile doubles them.
- When a fish bites you have about 7.5 seconds to start reeling, or it leaves and you lose your bait unless it was trash.
- Left mouse reels in and right mouse lets line out. Reel while the fish rests, let line out while it pulls, and watch the dial more than the fish. Too tight (above 0.8) wears the line fast, and too slack (below -0.8) loses the fish.
- On a server, the server runs the bite timer, the bite roll, the fish and its size, and the XP, while your client runs the aiming, the dial and the line wear.
:::

:::facts
- **Timer units** 48 per real second at game speed 1x
- **Cast** 85 units, about 1.8 seconds
- **First wait** 500 to 2000 units, 10.4 to 41.7 seconds
- **Time to reel** 360 units, about 7.5 seconds after a bite
- **Line hits** fishing line 75, twine 50, premium line 150 before it snaps, at 1 in 10 per frame while tension is above 0.8
- **Trophy** 1 in 20 for a Big fish at Fishing level 8 or higher
- **Fish XP** 2 x its length in centimeters
:::

Outcast, picture the dock at dawn. You have a rod, a hook, a worm in the dirt-stained fingers of your glove and a long afternoon. Fishing in Project Zomboid looks like a calm little minigame, but under it sits a chain of dice rolls: a timer that decides when something might notice your bait, a weather and temperature check, a count of how many fish are swimming near the bobber, a roll for what the fish is, and then a tug of war that you can lose in two different ways. This page walks that chain in the order you meet it.

**How to read the citations.** Lua files are named from `game_snapshot/media/lua/` (for example `shared/Fishing/Bobber.lua:66`). Java files are named from `src/` (for example `zombie/iso/FishSchoolManager.java:192`). Scripts are named from `game_snapshot/media/` (for example `scripts/generated/items/food.txt:7080`). All of it is the 42.22 capture. "Not verified" means we read it in code and did not test it in a running game.

**How to read the times.** The fishing timers do not count seconds. They count down by the game's per-frame "multiplier" :cite[(`shared/Fishing/Bobber.lua:129`)]. One frame is worth `0.8 x (60 / frames per second)` of that multiplier at game speed 1x :cite[(`zombie/GameTime.java:982`, `:986`; `zombie/FPSTracking.java:46-49`)]. Frames per second cancel out, so **at game speed 1x one real second is 48 timer units**, as long as the game runs faster than about 12 frames per second (the engine caps the frame factor at 5). When this page says "10 seconds", it means real seconds at game speed 1x. Faster game speed shortens them in proportion. The one exception: when a fish is first decided, the game forces speed back to 1x :cite[(`shared/Fishing/Fish.lua:73-74`)].

## The gear, and where it comes from

Fishing needs a rod in your primary hand, a hook, a line and a lure or bait, and a new rod picks a random line and hook.

| Piece | What it does | Numbers | Code |
|-------|--------------|---------|------|
| Rod (tag `fishingrod`) | Must be in your primary hand. Two exist: the crafted rod and the proper rod. | Crafted rod strength factor 0.8, proper rod 1.0 | `client/Fishing/FishingHandler.lua:15-38`; `shared/Fishing/fishing_properties.lua:685-688`; `scripts/generated/items/weapon.txt:7869`, `:8108` |
| Hook | Multiplies the bite chance. No hook means no bites at all. | Paperclip 0.8, Nails 1.0, Fishing hook (plain, forged or bone) 1.2, none 0 | `shared/Fishing/fishing_properties.lua:678-684`; `shared/Fishing/FishingUtils.lua:247-256` |
| Line | Wears out when you fight a fish too hard. | Twine wears 0.02 per hit, fishing line 0.0133, premium line 0.0067; condition starts at 1.0 | `shared/Fishing/fishing_properties.lua:673-677`; `shared/Fishing/FishingRod.lua:303-313` |
| Lure or bait | Decides which fish can bite. Every real catch needs one. | See the fish article | `shared/Fishing/Fish.lua:96-125` |
| Chum | Thrown in the water to pull fish to a spot. | Covered below | `zombie/iso/FishSchoolManager.java:361-364` |

A new rod found in the world, or made, picks a random line and a random hook from the lists above :cite[(`shared/Fishing/fishing_properties.lua:767-783`)]. Changing the hook or the line takes a timed action of 160 :cite[(`shared/TimedActions/Fishing/TimedActions/ISChangeFishingRodEquip.lua:79`)], and a new line resets its condition to 1.0 :cite[(`ISChangeFishingRodEquip.lua:62`)].

Attaching a lure also takes 160 :cite[(`shared/TimedActions/Fishing/TimedActions/AIAttachLureAction.lua:100`)]. Insects, minnows, leeches, worms, shellfish and the two plastic lures are used up whole. Real food (bread, cheese, meat, dog food, corn) is only nibbled: attaching it removes 0.05 hunger from the food item, and the food is used up only when nothing is left :cite[(`AIAttachLureAction.lua:70-79`; amounts in `shared/Fishing/fishing_properties.lua:6-63`)].

## Step 1: starting to fish

You equip the rod, aim at water, and the game turns your character to face the aim point.

1. **Equip the rod.** When a rod lands in your primary hand, the game builds a fishing manager for you :cite[(`client/Fishing/FishingHandler.lua:15-38`)].
2. **Aim at water.** Aim (right mouse) at a water tile within 16 tiles of your feet, outside the no-fish rectangles :cite[(`shared/Fishing/FishingUtils.lua:68-90`)]. The rectangles are 14 small boxes in vanilla Kentucky :cite[(`shared/Fishing/FishingZones.lua:13-29`)]. The manager moves from "None" to "Idle" and turns your character to face the aim point :cite[(`client/Fishing/FishingStates.lua:18-27`, `:58-68`)].
3. **The right-click menu shortcut.** The "Fishing" option on a water tile opens the fishing window :cite[(`client/ISUI/ISWorldObjectContextMenu.lua:337-347`)]. It appears on a water tile within 20 tiles of you, unless that tile is a shore tile :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:385-392`)], and also when you carry a rod and a lure and stand within 5 tiles of water :cite[(`ISWorldObjectContextMenuLogic.java:1613-1634`)]. The window grades four conditions as Good, Normal or Bad: time, temperature, weather and wind :cite[(`client/PZAPI/ui/organisms/FishWindow.lua:156-231`)]. Those four are the same numbers that feed the bite chance, so it is a free read on whether now is a good time.

Pressing any of Forward, Left, Backward, Right, Melee or Cancel stops fishing :cite[(`shared/Fishing/FishingUtils.lua:34-52`)]. If you stop while a line is out, the line takes one hit of wear, the same as a hard tug :cite[(`client/Fishing/FishingManager.lua:65-70`)]. So do not mash cancel.

## Step 2: the cast

A left click while the cast is aimed starts a cast that takes 85 units, about 1.8 seconds, and then the bobber appears.

The game reads the click while a cast is aimed :cite[(`shared/Fishing/FishingUtils.lua:102-108`; `client/Fishing/FishingStates.lua:62-64`)]. The bobber appears after the cast delay :cite[(`shared/Fishing/FishingRod.lua:63-66`, `:83-90`)].

The bobber lands where you aimed, plus a small random miss. The miss is one of -1.5, -0.5 or +0.5 tiles in each direction, divided by your Fishing level plus one :cite[(`shared/Fishing/FishingRod.lua:68-78`)]. At level 0 it can drift up to 1.5 tiles; at level 10 it is under 0.14. The line starts exactly as long as the distance from the rod tip to the bobber :cite[(`FishingRod.lua:88`)].

A bobber that lands on a non-water tile is just picked up again: the rod treats "bobber on ground" as "line fully reeled in" :cite[(`FishingRod.lua:190-196`)]. The result is the "No catch" line :cite[(`client/Fishing/FishingStates.lua:296-309`)].

## Step 3: what makes a bite

Once the bobber is down, a timer runs out and the game rolls once for "does a fish take the bait?", and both lean on the same list of conditions.

Each time the timer runs out it rolls again, so the loop repeats until a fish bites.

### The timer

The first roll comes after a nibble time that depends on a rough bite score, which is the product of four things times 100.

The score is built in the bobber code :cite[(`shared/Fishing/Bobber.lua:66-118`)]:

| Condition | Value | Code |
|-----------|-------|--------|
| Fish near the bobber (the "abundance", see the fish article) | 0 fish: 0; under 10: 0.5; 10 to 25: 1.0; over 25: 1.5 | `Bobber.lua:70-81` |
| Air temperature at your character | 15 to under 30 degrees C: 1.0. 0 to under 15, or 30 to under 40: 0.75. 40 and up, or -10 to under 0: 0.5. -10 and under: 0.25 | `Bobber.lua:83-91`; same table in `shared/Fishing/FishingUtils.lua:208-220` |
| Weather | Fog (intensity 0.4 or more) or wind (power 0.5 or more): 0.8. Otherwise rain: 1.2. Otherwise clear: 1.0 | `Bobber.lua:93-98`; `FishingUtils.lua:222-235` |
| Time of day | Hours 4 to 6 and 18 to 20 (04:00 to 06:59 and 18:00 to 20:59): 1.2. Any other hour: 1.0 | `Bobber.lua:100-104`; `FishingUtils.lua:237-245` |

Then the score picks the wait:

| Bite score | Wait before the first roll | Real seconds at 1x |
|------------|----------------------------|--------------------|
| 0 | 2000 units | 41.7 |
| under 40 | 1500 | 31.3 |
| 40 to under 65 | 1000 | 20.8 |
| 65 to under 80 | 650 | 13.5 |
| 80 and up | 500 | 10.4 |

The waits are set in the bobber code :cite[(`Bobber.lua:106-117`)]. A fair-weather, mid-day cast on a busy spot (score 100) rolls for the first time after about 10 seconds. Fog on a cold day with few fish (score 0.5 x 0.75 x 0.8 x 1 x 100 = 30) waits about 31.

After the first roll, the timer is set again to **0.8 times the nibble time**. It is then **doubled if the bobber is within 7 tiles of a shore tile** (nearly every bank cast) and **tripled if the bobber is within 3 tiles of you** :cite[(`Bobber.lua:135-144`)]. The shore test is in the fishing utilities :cite[(`shared/Fishing/FishingUtils.lua:148-159`)].

Worked example, score 100: 500 x 0.8 = 400, doubled to 800 (16.7 seconds), tripled to 2400 (50 seconds) if you cast at your own feet. **Cast 3 or more tiles out** (the code tests for under 3 tiles).

### The roll

When the timer runs out, a bite happens if a random whole number from 0 to 99 is below `chance x 100`, and the chance multiplies the temperature, weather, time, hook and fish-count factors.

The formula is written in the bobber code :cite[(`Bobber.lua:222-235`)]:

`chance = 0.8 x temperature x weather x time of day x hook x fish-count factor`

The temperature, weather and time factors are the same as above. The fish-count factor here is **0.1** with no fish nearby (not 0), 0.5 under 10, 1.0 for 10 to 25 and 1.5 above 25 :cite[(`shared/Fishing/FishingUtils.lua:258-272`)]. The hook is the multiplier from the gear table; no hook gives 0.

| Situation | Chance per roll |
|-----------|-----------------|
| Plain fishing hook (1.2), fair weather, 15 to 30 degrees, mid-day, 10 to 25 fish | 0.8 x 1.2 = 96 percent |
| Same, with nails (1.0) | 80 percent |
| Same, with a paperclip (0.8) | 64 percent |
| Plain hook, dawn (1.2), rain (1.2), over 25 fish (1.5) | 0.8 x 1.2 x 1.2 x 1.2 x 1.5 = 207 percent, so always |
| Plain hook, cold (0.75), fog (0.8), under 10 fish (0.5), mid-day | 0.8 x 1.2 x 0.75 x 0.8 x 0.5 = 29 percent |
| Plain hook, fair weather, **no fish near the bobber** | 0.8 x 1.2 x 0.1 = 9.6 percent |

If the roll fails, the timer restarts and the loop goes on.

**How long until a bite?** This is an estimate, not a measurement. The first roll comes after the first wait. Each failed roll adds one later wait (0.8 times the first, doubled near shore). With `p` the chance per roll, the expected time is the first wait plus `(1 - p) / p` later waits. These are real seconds at game speed 1x (the fishing timers are already real time; see the unit note at the top):

| Setup | First wait | Later wait (near shore) | Chance per roll | Expected time to a bite |
|-------|-----------:|------------------------:|----------------:|------------------------:|
| Plain hook, clear mid-day, 15 to 30 degrees, a school of 10 to 25 | 10.4 s | 16.7 s | 96 percent | about 11 s |
| Same with nails | 10.4 s | 16.7 s | 80 percent | about 15 s |
| Paperclip, fog, under 10 fish | 20.8 s | 33.3 s | 26 percent | about 2 minutes |
| Plain hook, clear, **no school** (score 0) | 41.7 s | 66.7 s | 9.6 percent | about 11 minutes, and the catch is mostly trash |

Add up to 7.5 seconds to start reeling after the bite. If the bobber is within 3 tiles of you, every later wait triples. A bite builds a fish right away and gives you **360 units, about 7.5 seconds**, to start reeling :cite[(`Bobber.lua:131-133`, `:148-159`)]. If you do not reel in that time, the fish leaves, and you lose your bait, unless the "fish" was trash :cite[(`Bobber.lua:150-155`)].

Notes on that loop:

- A bobber that hovers near the player's own feet bites slowly (the 3x rule above), and a bobber with no fish near it still bites sometimes, but see the next section: the thing it brings up is almost always trash.
- The roll above does not look at the lure. The lure only matters after the roll succeeds, when the game picks what is on the hook :cite[(`shared/Fishing/Fish.lua:68-136`)].
- There is no water depth and no season in the formulas. Season only matters through the temperature. Water type matters only as river or lake, and in 42.22 every fish is allowed in both (see the fish article).

### What is on the hook

When a fish is first needed, the game decides fish or trash from a trash factor, your level and the abundance.

The decision is made in the fish code :cite[(`shared/Fishing/Fish.lua:68-136`)]:

- **Trash chance.** A rough "trash factor" comes from a hidden map of trash patches: 0.05 in most water, up to 0.55 inside a patch :cite[(`zombie/iso/FishSchoolManager.java:445-455`)]. At Fishing level 5 it is multiplied by 0.8, at 7 by 0.6, at 9 by 0.2 :cite[(`Fish.lua:77-88`)].
- **Fish present (abundance above 0).** A random number between `level / 30` and `0.5 + level / 20` must beat the trash factor :cite[(`Fish.lua:93`)]. In ordinary water that is a 90 percent fish chance at level 0, 97 percent at level 1 and 100 percent from level 2 up. Inside a trash patch the numbers drop. At level 0 a patch with an average trash value (0.30) leaves a 40 percent fish chance, and the worst value (0.55) leaves none. These are worked examples from the formula, not a table the game prints.
- **No fish nearby (abundance 0).** A random number from 0 to 4 must be below `0.1 + level / 20`. That is **2.5 percent at level 0, 8.75 percent at level 5 (0.1 + 5/20 = 0.35, divided by 4) and 15 percent at level 10** :cite[(`Fish.lua:93`)]. Otherwise you reel in trash.
- **Trash list.** Seaweed, dirty ripped sheets, a broken fishing net, an empty tin can or an empty water bottle, picked evenly :cite[(`shared/Fishing/fishing_properties.lua:666-672`)]. A trash catch gives 1 XP :cite[(`shared/TimedActions/Fishing/TimedActions/ISPickupFishAction.lua:80-86`)]. It does not wear down your bait :cite[(`shared/Fishing/FishingRod.lua:359-375`)]. Trash does not struggle: it only drifts a hair :cite[(`Fish.lua:37-39`, `:243-244`)].
- **Which fish.** The fish list is cut by your Fishing level (a fish must weigh no more than your level's limit), by whether the line is taut (predators only), and by the lure. The rest of that is on [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them).
- **No lure on the rod.** The code looks the lure up in each fish's table; with no lure there is nothing to match, so every fish roll falls through to trash :cite[(`Fish.lua:96-135`, with `Bobber.lua:48`)]. Not verified in a running game. The menu route needs a lure in your pack anyway :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:3208-3217`)].

Predator fish (the big catfish, the muskie and the gar) are in the pool only if the line was taut when the fish took: the game passes `tension >= 0.1` into the fish at creation :cite[(`Bobber.lua:132`; `Fish.lua:98-102`)]. Keep a little pull on the line while you wait.

## Step 4: the fight

The tension dial under your character is the whole minigame: left mouse reels in, right mouse lets line out.

The controls are read in the rod code :cite[(`shared/Fishing/FishingRod.lua:211-231`)].

### What the dial means

Tension is how far the bobber is from your rod tip compared to how much line is out.

The rod code computes the tension from the bobber and the line :cite[(`FishingRod.lua:198-209`)]:

- Slack (bobber closer than the line length): a negative number, never below -1.
- Taut (bobber farther than the line): a positive number, growing with the gap.
- The dial shows 0 to 1 on the right side and a slack zone on the left :cite[(`client/Fishing/TensionUI.lua:24-31`)].

Two things move the bobber: the fish, and your reeling.

**The fish.** Every 400 units (8.3 seconds) the fish picks a new random direction. It pulls for the first 200 units (4.2 seconds) and rests for the last 200 :cite[(`shared/Fishing/Fish.lua:41-52`)]. The strongest sideways pull it can manage is about **0.05 tiles per second for every centimeter of length**: a 40 cm fish drags the bobber up to about 2 tiles per second, a 117 cm blue catfish about 6 :cite[(`Fish.lua:42-43`; the factor of 2.5 is `shared/Fishing/Bobber.lua:194`)]. It never pulls you onto dry land: if the water ends, it turns back :cite[(`Bobber.lua:189-191`)].

**Your reel.** Reeling pulls the line shorter by `0.04 x timer units x ramp squared` per frame, about **1.9 tiles per second at full ramp** :cite[(`FishingRod.lua:219-223`)]. The ramp starts at 0.2 each time you begin to reel and grows by `0.01 x ((Strength + 2.5) / 5)` per unit :cite[(`FishingRod.lua:164-188`)]. In seconds: Strength 0 gets to full ramp in about 3.3 seconds, Strength 5 in about 1.1, Strength 10 in about 0.7. Reeling stops working while tension is already 1 or higher :cite[(`FishingRod.lua:220`)]. Letting line out mirrors it and stops at -1 :cite[(`FishingRod.lua:233-237`)].

Reeling while a fish is on starts the catch (`catchFishStarted`), which cancels the bait-loss timer :cite[(`FishingRod.lua:170-172`; `Bobber.lua:156-158`)].

### What breaks the line, and what loses the fish

A line is lost when the tension stays too tight, and a fish is lost when it stays too slack, and both are checked every frame.

`FishingRod:updateLine` runs every frame :cite[(`FishingRod.lua:113-162`)]. It has two traps.

**Too tight (tension above 0.8).**

- Every frame has a **1 in 10 chance** to hit the line with one hit of wear :cite[(`FishingRod.lua:126-127`)]. That is per frame, not per second, so at 60 frames per second it averages 6 hits a second. A fishing line has 75 hits before it snaps (1.0 divided by 0.0133), twine 50, premium line 150 :cite[(`FishingRod.lua:303-313`, `:128-135`)]. The wear values are in the gear table. So at 60 frames per second a fishing line lasts about 12 seconds of constant high tension.
- A timer also counts the time spent above 0.8 :cite[(`FishingRod.lua:124`)]. Its limit is **(120 + 10 x Fishing level) x rod factor** units :cite[(`FishingRod.lua:118`)]:

| Fishing level | Proper rod | Crafted rod (x0.8) |
|---------------|-----------:|-------------------:|
| 0 | 120 units, 2.5 s | 96, 2.0 s |
| 5 | 170, 3.5 s | 136, 2.8 s |
| 10 | 220, 4.6 s | 176, 3.7 s |

  The limit is **tripled until you land your first fish ever** :cite[(`FishingRod.lua:16`, `:119-121`)]. The flag is set when a fish is picked up or dropped :cite[(`ISPickupFishAction.lua:45`, `:119`)]. Past the limit, each frame has a 1 in 4 chance to snap the line; the other three times the fish escapes. The timer is not reset, so the roll repeats each frame until you ease off :cite[(`FishingRod.lua:137-147`)].
- When the line snaps, it makes a noise of radius 20 that zombies can hear :cite[(`FishingRod.lua:315-317`)], you lose the rod and get a stub back: a wooden stick for the crafted rod, a "broken fishing rod" for the proper one :cite[(`fishing_properties.lua:689-692`; `FishingRod.lua:326-336`)]. The broken rod can be fixed with a hook and line :cite[(`scripts/generated/recipes/recipes_fishing.txt:26-45`)].

**Too slack (tension below -0.8) with a fish on.** A second timer counts, with the same limit. When it runs out the fish is gone, with no snap :cite[(`FishingRod.lua:152-160`)]. Do not let line out for long while something is pulling.

A lost fish (either way) removes the lure from the rod :cite[(`FishingRod.lua:341-357`)].

**The practical rule.** Reel while the fish rests, let line out while it pulls, and watch the dial more than the fish. Fighting at the edge of 0.8 wears the line fast.

### The animation, for what it tells you

The strike animation changes with the fish's length.

It is 15 cm or less "Strike", 30 cm or less "StrikeMedium", longer "StrikeHard" :cite[(`client/Fishing/FishingManager.lua:119-135`)]. The rod bends while a fish is on :cite[(`FishingManager.lua:144`)].

## Step 5: landing it

When the bobber gets within 0.6 tiles of your rod tip, or lands on dry ground, the game hands over to the pick-up state, which takes 267 for a fish and 187 for trash.

The fishing states make the hand-over :cite[(`client/Fishing/FishingStates.lua:152-155`; `FishingRod.lua:190-196`)]. The durations are set in the pick-up action :cite[(`ISPickupFishAction.lua:133-142`)]. The fish appears in your hands about 12 percent of the way through and goes into your pack at 80 percent, and trash at 17 and 70 percent :cite[(`ISPickupFishAction.lua:153-158`)]. If you cancel before then, the fish drops at your feet :cite[(`ISPickupFishAction.lua:95-120`)].

The lure may be used up now, but only for a real fish :cite[(`client/Fishing/FishingStates.lua:301`; `shared/Fishing/FishingRod.lua:359-375`)]:

| Lure type | Chance it is used up per fish | Meaning |
|-----------|------------------------------|---------|
| Plastic lure (jig or minnow lure) | 1 in `30 x (level + 1)` | 3.3 percent at level 0, 0.3 percent at level 10 |
| Natural bait | A random number from 0 to 19 above your level | 95 percent at level 0, 70 percent at level 5, 45 percent at level 10 |

The lures that are plastic are listed in the species file :cite[(`shared/Fishing/fishing_properties.lua:59-61`)].

## Fish size and weight

When a real fish is chosen, its size is a second roll, in the order of the numbered steps below.

The fish code makes this second roll :cite[(`shared/Fishing/Fish.lua:138-236`)].

1. **Small, Medium or Big.** The chance comes from your level :cite[(`shared/Fishing/FishingUtils.lua:175-203`)]:

| Fishing level | Small | Medium | Big |
|--------------:|------:|-------:|----:|
| 0 | 95 | 5 | 0 |
| 1 | 85 | 15 | 0 |
| 2 | 75 | 24 | 1 |
| 3 | 70 | 25 | 5 |
| 4 | 60 | 30 | 10 |
| 5 | 48 | 40 | 12 |
| 6 | 35 | 45 | 20 |
| 7 | 25 | 45 | 30 |
| 8 | 20 | 40 | 40 |
| 9 | 15 | 40 | 45 |
| 10 | 10 | 40 | 50 |

   Near shore (the same 7-tile test as above), half of the Medium and Big share moves to Small :cite[(`FishingUtils.lua:196-200`)]. With no fish in the area, it is always Small :cite[(`FishingUtils.lua:189-191`)]. The percentages are per length, so they only match the classes exactly when the classes hold the same number of whole centimeters; each class is within one centimeter of a third of the fish's range :cite[(`shared/Fishing/fishing_properties.lua:146-213`)].
2. **Length and weight.** Each species has a range of lengths split into thirds. A fish of length `L` in a class weighs a straight line between the class's ends: Small runs from 0.1 kg up to 0.2 of the species' top weight, Medium from 0.2 up to 0.6, Big from 0.6 up to 1.0, all capped at **20.45 kg** (45 pounds) :cite[(`fishing_properties.lua:146-180`)]. Species tables are in the fish article.
3. **The trophy roll.** At level 8 or higher, a Big fish has a **1 in 20** chance to be a trophy. It is stretched toward the species' trophy length and weight. If the new length or weight beats the normal maximum, it is named **Legendary** :cite[(`Fish.lua:152-184`; names `IGUI_Fish_Small`, `Medium`, `Big`, `Legendary` in `shared/Translate/EN/IG_UI.json`)]. Trophy weights ignore the 20.45 kg cap.
4. **What it is worth.** The fish item's weight is set to `2.2 x kg`, its calories, fats, carbohydrates and protein are scaled by `2.2 x kg / 0.4` from the item script values, and its hunger change is `-(kg / species weight factor)`, never less than 0.05 :cite[(`Fish.lua:186-207`; base item `scripts/generated/items/food.txt:7080-7108`)]. Example: a 1.4 kg bass (weight factor 2) gives hunger -0.7, and 1.4 x 5.5 = 7.7 times the script's 159 calories, about 1,224. The nutrition unit conversions are covered in [Hunger, thirst and nutrition](/pz/build-42/engine/character-stats/hunger-thirst-and-nutrition).
5. **The name.** Fish with sizes get a name like "Big Largemouth Bass - 45cm" :cite[(`Fish.lua:229-233`)]. Fish whose weight is 45 or more in item weight are renamed "Big" whatever the roll said :cite[(`Fish.lua:209-213`)].
6. **Too small to cut.** A fish too small to fillet gets a tooltip saying so :cite[(`Fish.lua:215-221`)].

## Skill and experience

A fish gives 2 XP per centimeter of length, trash gives 1 XP, and your Fishing level improves accuracy, line life, fish size and bait use.

| What | Numbers | Code |
|------|---------|--------|
| XP for a fish | **2 x its length in centimeters.** A 30 cm fish is 60 XP; a 100 cm catfish is 200. Granted when the pick-up starts. | `ISPickupFishAction.lua:57-66`, `:80-86` |
| XP for trash | 1 | same |
| XP for the first fish | The first catch also raises the `Fishing_IsFirstFishing` flag. | `ISPickupFishAction.lua:45` |
| The skill's place | Fishing is a Survivalist skill. XP needed per level as given to the perk list: 50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000. Whether those are per-level or running totals was not checked. | `zombie/characters/skills/PerkFactory.java:131` |
| XP multiplier | The sandbox "Multiplier Config: Fishing" option scales XP. Where it is read was not traced. | `zombie/SandboxOptions.java:1866` |

What your Fishing level does, in one table:

| Level effect | How | Code |
|--------------|-----|------|
| Cast accuracy | Miss divided by `level + 1` | `FishingRod.lua:69-70` |
| Line holds longer under tension | +10 units of limit per level | `FishingRod.lua:118` |
| Bigger fish allowed | Weight limit per level, in the fish article | `FishingUtils.lua:161-172` |
| Better size odds | Table above | |
| Less trash | x0.8, x0.6, x0.2 at levels 5, 7, 9 | `Fish.lua:77-88` |
| Fish when the water is empty | 2.5 percent up to 15 percent | `Fish.lua:93` |
| Less bait wasted | Natural bait table above | |
| Trophy fish | Level 8 and up | `Fish.lua:153` |

Strength helps too: it speeds up the reel ramp :cite[(`FishingRod.lua:186`)].

## Fish schools and chum in one paragraph

Fish are not spread evenly: the world is seeded with fish points, the seed changes every in-game day, and chum adds a temporary school.

The world is seeded with **fish points**: water tiles that happen to hold a school. The seed changes every in-game day, so schools move; a fish that bites also thins the schools in a 40 by 40 tile square for 5 days. Chum adds a temporary school wherever you throw it. All of that is on the [fish article](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them), with the numbers.

## Multiplayer: who runs what

In a multiplayer game the server runs the bite and the fish, and your client runs the aiming, the dial and the line wear.

The work is split between your machine and the server :cite[(`zombie/core/FishingAction.java`, `shared/Fishing/FishingRod.lua`, `shared/Fishing/Bobber.lua`)]:

| Job | Runs on | Code |
|-----|---------|--------|
| Aiming, casting, the dial, tension, wear, breaking the line | Your client | `FishingRod.lua:113-114` (the server returns early), `:126-146` |
| Moving the bobber | The owning player's machine | `Bobber.lua:193-195` |
| Bite timer, bite roll, creating the fish, nibble timeout | The server (everything inside `if not isClient()`) | `Bobber.lua:127-160` |
| Picking the fish and its size, trophy roll, `catchFish` bookkeeping (done at the bite, so an escaped fish still counts) | The server builds the fish; the client receives it | `Fish.lua:238-249`; `zombie/core/FishingAction.java:136-140` |
| Lure removal and use-up | The server, then a command tells your client | `FishingRod.lua:350-357`; `client/ServerCommands.lua:46-56` |
| Line snapped, fish missed | Your client tells the server, which removes the rod or the lure | `FishingRod.lua:321-324`, `:343-346`; `server/ClientCommands.lua:1297-1326` |
| Fish XP | The server | `ISPickupFishAction.lua:57-66` |
| Fish school seed, chum list, noise list | The server sends them when you join and when they change | `zombie/iso/FishSchoolManager.java:81`, `:136-138`, `:457-489` |

How it hangs together: when your client creates its bobber it asks the server to start a fishing action :cite[(`Bobber.lua:29`)]. The server builds its own rod, aims at the square you sent, casts, and creates its own bobber :cite[(`zombie/core/FishingAction.java:70-82`; `FishingRod.lua:71-75`)]. The server's bobber stays where it landed, because only the local player's machine moves bobbers; the server uses that fixed spot for its fish counts.

When the server makes a fish, it saves the fish and the fish item into a packet and sends it to you :cite[(`zombie/core/FishingAction.java:136-149`, `:192-218`)]. You tell the server when you start reeling (flag `catchFishStarted`) :cite[(`FishingAction.java:109-114`)]. A packet from a client that does not match the player is rejected :cite[(`zombie/network/packets/FishingActionPacket.java:53-69`)].

One event covers the whole link, `OnFishingActionMPUpdate`, on both sides :cite[(`zombie/network/packets/FishingActionPacket.java:45`, `:79`; listeners at `client/Fishing/FishingManager.lua:117` and `shared/Fishing/Bobber.lua:301`)].

## Where to go next

- [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them): every fish, and the schools.
- [Fishing nets and other methods](/pz/build-42/engine/fishing-and-trapping/fishing-nets-and-other-methods)
- [Fishing and trapping reference](/pz/build-42/engine/fishing-and-trapping/fishing-and-trapping-reference): every number in one place.
- [Modding fishing and trapping](/pz/build-42/engine/fishing-and-trapping/modding-fishing-and-trapping)
- Weather that feeds the bite score: [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors) and [Rain, snow, fog and wind](/pz/build-42/engine/weather-and-climate/rain-snow-fog-and-wind).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 capture. Not verified: every timing is computed from the code at game speed 1x, and none was measured with a stopwatch. The share of trash in a bad trash patch is a worked example, not read from a table.

The no-lure behavior ("only trash") is read from code only. How other clients learn about chum thrown by someone else is also unverified: the server's command goes to the throwing player :cite[(`shared/TimedActions/Fishing/TimedActions/AddChumToWaterAction.lua:41-44`)], and the full list is re-sent only when an entry expires :cite[(`FishSchoolManager.java:136-138`)], and we did not verify whether other players see it sooner.
:::
