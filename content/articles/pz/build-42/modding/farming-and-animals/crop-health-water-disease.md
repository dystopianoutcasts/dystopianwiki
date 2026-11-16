---
id: build-42-crop-health-water-disease
slug: crop-health-water-disease
title: 'Crop health, water, disease'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  What a 42.22 crop's health, water and disease numbers really do: the 2-hour health tick, water loss and rain, fertilizer limits, and why only mildew can start. Real time given.
last_updated: '2026-11-16'
related_articles:
  - agriculture-basics-from-seed-to-harvest
  - the-three-farming-skills
  - seasons-curses-and-the-crop-table
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [players tending crops](#1-health) | [modders and server owners](#5-disease)

Outcast, every plant you sow carries a health number, a water number and four disease numbers, and a clock on the server moves them. This page gives the clock, the rules and the real-time cost. Where 42.22 differs from the older wiki notes, the page says so.

:::callout[The 1-minute version]{kind=key}
- Health changes every 2 game hours (7.5 real minutes at the default Day Length). A well-watered, non-cursed outdoor crop gains health; thirst, weeds, a curse, a bad month and lack of a roof take it away.
- Real temperature and sun are ignored: the sunny bonus is always on and the cold penalty always applies to crops that are not cold-hardy. Rain is real weather and it does water outdoor plants. A plain sown plant starts at 47 to 53 health; a best-month plant starts at 57 to 63 and a cursed one at 37 to 43, and your Agriculture level is added in every case.
- Water drops 1 point every 5 game hours at the default Plant Resilience (18.75 real minutes). The first growth step needs 70 or 80 water, and later steps need the crop's own, lower minimum.
- A plant slightly short of its minimum water (down to the minimum divided by 1.1) only grows slower. Below that it stops growing and takes damage, and past the minimum divided by 1.3 the damage is larger. At 0 water it dies.
- Fertilizer helps once per growth step, hurts the second time, and curses on the third. Compost never hurts.
- In 42.22 only mildew can start. Aphids, pest flies and slugs never start on their own, because their temperature check reads a value that is never updated.
:::

:::facts
- **Health tick** every 2 game hours: 7.5 real minutes at the default Day Length :cite[(`media/lua/server/Farming/SFarmingSystem.lua:112-117`)]
- **Water and disease tick** every 5 game hours at Normal resilience, 18.75 real minutes; 12, 8, 3 or 2 hours for the other four settings :cite[(`media/lua/server/Farming/SFarmingSystem.lua:98-111`)]
- **Start health** 47 to 53, or 57 to 63 in a best month, or 37 to 43 for a cursed crop, plus your Agriculture level :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:736-746`, `media/lua/server/Farming/SFarmingSystem.lua:487-496`)]
- **Mildew chance** 1 in 200 per growth step with a watered plant, plus 0.5 points for each water point below the minimum :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:330-361`)]
- **Rain** adds 30 times the rain intensity to an outdoor plant every 10 game minutes (37.5 real seconds) :cite[(`media/lua/server/Farming/SFarmingSystem.lua:304-309`)]
- **Fertilizer** removes 40 hours from the current growth timer and adds 10 health, once :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:596-621`)]
:::

## 1. Health

**Health runs from 0 to 100, starts near 50, and a plant dies when it hits 0.**

A sown plant gets its starting health in `initHealth`: 57 to 63 in a best month, 37 to 43 when it is cursed, and 47 to 53 otherwise, each plus your Agriculture level. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:736-746`)] The 47 to 53 band comes from a moon check that never changes: the old season script that tracked the moon is switched off, so its moon day stays 10 and the "ascending moon" branch always runs. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:487-496`, `media/lua/server/Seasons/season.lua:17`, `media/lua/server/Seasons/season.lua:454-457`)] The full-moon band (57 to 63) and the descending-moon band (37 to 43) never apply by moon in 42.22; the same two bands are reached only through the best-month and cursed rules. The upper number of each band is one less than the older wiki said, because the random call excludes its upper end. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:58-59`)]

The plant window names the health: above 80 Flourishing, above 60 Verdant, 50 or more Healthy, 25 or more Sickly, below that Dying. :cite[(`media/lua/client/Farming/ISUI/ISFarmingInfo.lua:273-300`, `media/lua/shared/Translate/EN/Farming.json:80`, `media/lua/shared/Translate/EN/Farming.json:109-113`)] The Health row is only drawn in the Agriculture cheat mode, so a normal player does not see it. :cite[(`media/lua/client/Farming/ISUI/ISFarmingInfo.lua:116-122`)] The sprite shows trouble before any number. It uses the lower of the plant's health and water: below 50, or with 10 or more points of mildew, aphids or slugs, or with a fertilizer count over 1, the plant looks sickly, and below 25 or with 30 or more points of disease it looks dying. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:245-268`)]

Health matters at harvest: every 10 points above 50 adds one vegetable, and the plant's health sets the XP. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:17-62`, `media/lua/server/Farming/SFarmingSystem.lua:538-552`)]

### The health tick

Every 2 game hours the server runs one health step for every living plant.

The bad-care multiplier starts at 1, is doubled when the plant is cursed and doubled again when the square has weeds. Gains are divided by it and losses are multiplied by it. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:171-183`)] In a bad month the plant is also cursed on the spot, and in winter an outdoor crop that is not cold-hardy is cursed too, while Plant Growing Seasons is enabled. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:172-178`)]

| Term | Change per tick | Applies when | Code |
|---|---|---|---|
| Sun | +1 / multiplier | outdoors and not a bad month | `media/lua/server/Farming/SFarmingSystem.lua:190-195` |
| Sun, indoors | +0.25 / multiplier | houseplant, greenhouse, or Kill Crops Grown Inside is off | `media/lua/server/Farming/SFarmingSystem.lua:196-200` |
| Cold | -0.5 x multiplier | the crop is not cold-hardy (always, see below) | `media/lua/server/Farming/SFarmingSystem.lua:202-205` |
| Water at or above the minimum | +0.4 / multiplier | water is high enough | `media/lua/server/Farming/SFarmingSystem.lua:206-210` |
| Water about 9 to 23% short (below minimum / 1.1, down to minimum / 1.3) | -0.2 x multiplier | water level result -1 | `media/lua/server/Farming/SFarmingSystem.lua:211-212` |
| Water more than about 23% short (below minimum / 1.3) | -0.5 x multiplier | water level result -2 | `media/lua/server/Farming/SFarmingSystem.lua:213-214` |
| Outdoor houseplant in winter | -1.5 x multiplier | Plant Growing Seasons on, the plant is a houseplant (no vanilla crop is one) | `media/lua/server/Farming/SFarmingSystem.lua:224-227` |
| No roof | -1 x multiplier | indoors, not a houseplant or greenhouse, Kill Crops Grown Inside on | `media/lua/server/Farming/SFarmingSystem.lua:220-223` |
| Bad month | -3 x multiplier | outdoors, the crop is not bad-month-hardy, Plant Growing Seasons on | `media/lua/server/Farming/SFarmingSystem.lua:228-231` |

A plain outdoor crop of a non-hardy type, watered, in a normal month, gains 1 + 0.4 - 0.5 = 0.9 per tick, about 0.12 health per real minute at the default Day Length. A cold-hardy one gains 1.4.

**Real weather does not reach a plant.** The sun check reads the world's weather text, which starts as "sunny" and is only changed by a network packet that a client receives. On a server and in single player it stays "sunny". The cold check reads `season.currentTemp`, which starts at -1 and is never updated because the old season script is switched off, so it is always at or below 10 (see [What weather does](/pz/build-42/engine/weather-and-climate/what-weather-does) for the real temperature, which crops never read). :cite[(`media/lua/server/Farming/SFarmingSystem.lua:190-205`, `zombie/iso/IsoWorld.java:317`, `zombie/iso/IsoWorld.java:3169-3175`, `zombie/network/packets/WeatherPacket.java:38`, `season.lua:10`, `SFarmingSystem.lua:203`)] The older note "crops never react to the real temperature" was right, and its cold figure of 0.25 was wrong: the code takes 0.5. The nine cold-hardy crops are barley, cabbages, flax, garlic, kale, leek, rye, winter wheat and wild garlic (the table on the [seasons page](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table) marks each). :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua:5-32`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua:563-590`)]

## 2. Water

**A plant needs its crop's minimum water level to grow, and each step's result depends on how far below it is.**

Water runs from 0 to 100. A new plant starts at 0. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:12-37`)] The plant window names it: above 80 Well watered, above 60 Fine, above 50 Thirsty, above 25 Dry, otherwise Parched. :cite[(`media/lua/client/Farming/ISUI/ISFarmingInfo.lua:304-330`)] The older wiki gave other bands (Fine from 70, Parched below 30); those are not in the 42.22 code.

Two minimums apply to one crop. The first growth step is checked against the crop's `waterNeeded` (70 for 49 crops, 80 for 6). After that step succeeds, the minimum becomes the crop's `waterLvl` (the number the Sow tooltip shows). :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:305-327`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:567-570`)] So a carrot, whose tooltip says 30, still wants 70 for its first step. At growth time the game compares the level with the minimum like this :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:130-148`)]:

| Water level | Result at the growth check | Effect |
|---|---|---|
| At or above the minimum | 0 | the step goes on normally |
| Below it, but at least the minimum divided by 1.1 (rounded down), about 9% short at most | the shortfall | the step takes that many more hours, and the health tick still gives the +0.4 water bonus, because the result is not negative |
| Below that, but at least the minimum divided by 1.3 (rounded down), about 23% short at most | -1 | the step does not happen, the plant is marked badly cared for, and the check repeats in 30 hours |
| Lower still | -2 | the same, repeated in 50 hours, and the plant loses 4 times the multiplier in health |

For a minimum of 70 the three lines are 70, 63 (10% short) and 53 (24% short), which is why the bands are about 9% and 23%, not 10% and 30%. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:340-373`)] The same -1 and -2 results are what the health tick uses in the table above, and a plant past phase 1 dies at the next ten-minute check that finds its water at 0. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:625-640`, `media/lua/server/Farming/SFarmingSystem.lua:277-283`)] No vanilla crop sets a maximum water level, so too much water never hurts a plant; the overwatering code is unused. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:207-219`, `media/lua/server/Farming/farming_vegetableconf.lua:145-147`)]

### How water goes down and up

- **Down.** Every `hourForWater` game hours each living plant loses 1 point, doubled on a weedy square, plus 1 more for each full 10 points of pest flies. The interval is 5 hours at Normal Plant Resilience, 12 at Very High, 8 at High, 3 at Low and 2 at Very Low. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:98-111`, `media/lua/server/Farming/SPlantGlobalObject.lua:422-433`)] At Normal that is 1 point every 18.75 real minutes at the default Day Length, so a plant watered to 100 holds the 70 first-step minimum for about 150 game hours. That is our own arithmetic.
- **Sun.** The code that dries a plant in sunny weather checks a weather value that is never "sunny" in 42.22, so it never runs. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:310-312`)]
- **Rain.** While it rains (not snow) an outdoor plant gains 30 times the rain intensity every 10 game minutes, halved on a weedy square. At full intensity that is 30 points per 37.5 real seconds. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:304-309`, `zombie/iso/weather/ClimateManager.java:595`)]
- **Watering.** Each use adds 10, up to 100, and an action can pour up to 10 uses. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:501-518`)]

Plant Resilience defaults to 3 (Normal) in Java, and in the Apocalypse, Rising and SixMonthsLater presets. Extinction sets 4 (Low) and Outbreak sets 2 (High). :cite[(`zombie/SandboxOptions.java:147`, `media/lua/shared/Sandbox/Apocalypse.lua:75`, `media/lua/shared/Sandbox/Rising.lua:75`, `media/lua/shared/Sandbox/SixMonthsLater.lua:49`, `media/lua/shared/Sandbox/Extinction.lua:75`, `media/lua/shared/Sandbox/Outbreak.lua:75`)]

## 3. Weeds

**Weeds are anything growing on the square, and they make everything worse.**

The check runs every health tick and every ten game minutes. A square has weeds when it holds a tree, a removable bush or grass, a vegetation sprite that is not a tree, a "cuttable" tile, or wall vines. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:588-632`)] On a weedy square the bad-care multiplier doubles, water loss doubles, rain gain halves, a disease roll gets twice as likely, and the fertilizer time bonus halves. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:171-183`, `media/lua/server/Farming/SFarmingSystem.lua:304-309`, `media/lua/server/Farming/SPlantGlobalObject.lua:353-356`, `media/lua/server/Farming/SPlantGlobalObject.lua:596-603`)]

## 4. Fertilizer and compost

**Each growth step takes one fertilizer, or one compost, or both, and the extras cost health.**

The first fertilizer use removes 40 hours from the plant's timer (20 on a weedy square), adds 10 health while the plant is below its harvest level, and may set the bonus-yield flag in phases up to 3. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:596-621`)] A second use in the same step costs 25 health, and a third or later use costs 25 more and curses the plant. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:521-564`)] The count drops by 1 at each growth step, so one fertilizer per step is safe. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:278-281`)]

Compost does the same first-use job and sets a flag that clears at the next growth step; a second compost in the same step does nothing and never harms. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:568-574`)] The fertilizer count and the compost flag are separate, so one of each in a step both apply.

While Plant Growing Seasons is enabled and it is winter, a first use does nothing; later uses still cost health. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:596-600`, `media/lua/server/Farming/SPlantGlobalObject.lua:552-557`)] The plant window shows whether it has compost, and the fertilizer count only in the cheat mode. :cite[(`media/lua/client/Farming/ISUI/ISFarmingInfo.lua:100-114`)]

## 5. Disease

**A plant can carry mildew, aphids, pest flies and slugs, but in 42.22 only mildew can start.**

At each growth phase after phase 1, the server rolls for every disease it does not have. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:322-331`, `media/lua/server/Farming/SFarmingSystem.lua:385-430`)] The roll is 1 in 200, which doubles in chance when the plant is cursed and doubles again on a weedy square, and halves in chance when it carries the bonus-yield flag. Each point of water below the minimum adds 0.5 percentage points to the 0.5% base, and Plant Resilience Low adds 4 and Very Low adds 8 to that count, while High and Very High take it off (not below 0). :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:330-361`)] Each of the 8 squares around the plant that holds a plant already carrying that disease gives it one more roll, and two more when that neighbor has weeds. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:433-461`, `zombie/globalObjects/GlobalObjectLookup.java:132-143`)]

The older note said the base chance was 2%, and that aphids, flies and slugs pause in cold. That is not what the code does.

Aphids, flies and slugs each need the "outside of winter" test and `season.currentTemp > 10`, and that value is stuck at -1. So those three never start by roll or by spreading in 42.22, and only mildew does. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:225-227`, `media/lua/server/Farming/SPlantGlobalObject.lua:258-261`, `media/lua/server/Farming/SPlantGlobalObject.lua:292-295`, `media/lua/server/Farming/SPlantGlobalObject.lua:324-327`, `SPlantGlobalObject.lua:261`, `season.lua:10`)] A disease can still appear if a mod or the debug cheat sets it. :cite[(`media/lua/server/Farming/farmingCommands.lua:127-139`)]

### What a disease does

Every `hourForWater` game hours the disease number climbs, and each level has its own effect.

- **Mildew** adds 0.5 per tick at or above the water minimum and 1 per tick below it, up to 100. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:364-374`)]
- **Aphids, flies and slugs** (if a mod sets them) add 0.5 or 1 for flies and slugs, and always 1 for aphids, but flies, slugs and aphids fall by 2 each tick outdoors in winter, and aphids also fall by 2 while the plant is more than 10% short of water. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:375-418`)]
- **Growth.** Only mildew's number gates growth: below 10 nothing, 10 to 29 delays the step by that many hours, 30 to 59 stops the step and retries in 30 hours, 60 or more kills the plant at the next growth check. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:151-166`, `media/lua/server/Farming/farming_vegetableconf.lua:340-362`)]
- **Yield.** Each full 10 points of aphids or slugs removes one vegetable at harvest. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:23-27`, `media/lua/server/Farming/farming_vegetableconf.lua:63-65`)]
- **Flies** also dry the plant faster, and above 30 they show on the square. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:130-132`, `media/lua/server/Farming/SPlantGlobalObject.lua:422-433`)]
- **Window.** With Agriculture 3 (or 1 with a magnifier) the plant window lists each disease as Light (under 10), Moderate (under 30) or Heavy. :cite[(`media/lua/client/Farming/ISUI/ISFarmingInfo.lua:126-130`, `media/lua/client/Farming/ISUI/ISFarmingInfo.lua:206-220`)]

### Curing, and what each crop resists

Four sprays cure the four diseases, and each use removes 10 plus your Agriculture level.

The menu offers Treat Problem when you hold a mildew spray, a flies spray, slug repellent or an aphid spray. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:374-449`, `media/lua/server/Farming/SPlantGlobalObject.lua:436-497`)] The five spray recipes (`MakeMildewCure`, `MakeAphidsCure`, `MakeFliesCureFromCigarettes`, `MakeFliesCureFromLooseTobacco` and `MakeFliesCureFromChewingTobacco`) are learned at Agriculture 6, or from the Farmer occupation, the Gardener trait or a farming magazine. Slug repellent has no recipe in these files and is a looted item. :cite[(`media/scripts/generated/recipes/recipes_farming.txt:3-110`, `media/scripts/generated/items/drainable.txt:688-696`)]

Some crops resist a disease and cannot catch it: 9 for aphids, 5 for flies and 14 for slugs.

Of the slug crops, 12 only protect themselves. The other resisting crops (9 aphid, 5 fly and 2 slug) also protect the plants around them once they reach phase 3. The resistance column is in the table on the [seasons page](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table). :cite[(`media/lua/server/Farming/SFarmingSystem.lua:385-411`, `media/lua/server/Farming/SPlantGlobalObject.lua:258-261`)] Keys for moths, rabbits and deer (`mothFood`, `mothBane`, `rabbitBane`, `deerBane`) are set on some crops, but nothing in the Lua or Java reads them except a debug tooltip, so those threats are not in the game. :cite[(`media/lua/client/Farming/CFarmingSystem.lua:139-157`, `media/lua/server/Farming/farming_vegetableconf_vegetables.lua:60-84`, `media/lua/server/Farming/farming_vegetableconf_vegetables.lua:252-282`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua:299-325`)]

:::callout[Warning for server owners]{kind=warn}
The `cheat` command takes any field name and a count chosen by the client, and clamps the result to 0 to 100, with no admin check in the Lua. The water command adds what the client says. :cite[(`media/lua/server/Farming/farmingCommands.lua:127-139`)] See [Agriculture basics](/pz/build-42/modding/farming-and-animals/agriculture-basics-from-seed-to-harvest#6-who-runs-it).
:::

:::callout[How we know]{kind=proof}
Every rule and number above is read from the 42.22 Lua and Java cited beside it. The real-time figures are our own arithmetic on the clock lines. We did not run a game, so the sun and cold behavior, the disease roll, and the "only mildew starts" result are read from the code and not observed.

Not verified: how each of these runs on a dedicated server beyond the `isClient()` guard, the exact effect of Plant Resilience on the first-step water check, and the natural-light field that the multiplier reads (it is empty on normal plants).
:::
