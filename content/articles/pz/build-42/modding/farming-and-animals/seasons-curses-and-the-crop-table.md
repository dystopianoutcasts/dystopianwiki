---
id: build-42-seasons-curses-and-the-crop-table
slug: seasons-curses-and-the-crop-table
title: 'Seasons, curses, and the crop table'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: advanced
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  When a 42.22 crop gets cursed and what a curse does, how sow, best, risk and bad months work, and a table of all 55 vanilla crops with water, days to harvest and months, checked against the code.
last_updated: '2026-11-16'
related_articles:
  - agriculture-basics-from-seed-to-harvest
  - the-three-farming-skills
  - crop-health-water-disease
  - modding-recipes-adding-a-crop-editing-an-animal-breed
  - orientation-what-changed-in-b42
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [players choosing when to sow](#1-the-four-month-lists) | [modders and server owners](#4-the-crop-table)

Outcast, a crop remembers the month it was sown and the season it lives through, and a bad answer is a permanent curse. This page says which months matter, what a curse is, and lists all 55 vanilla crops with their numbers so you can plan a field before you dig.

:::callout[The 1-minute version]{kind=key}
- With Plant Growing Seasons on (the default, off only in the Outbreak preset), every crop has a list of sowing months. Sowing in any other month curses the plant at once.
- In a "risk" month the curse is a dice roll that your Agriculture level shrinks: 55% at level 0 down to 5% at level 10. In a "best" month you can get a bonus-yield flag, 45% at level 0 up to 95% at level 10.
- A bad month curses the plant on its next health tick, not just on day 1. So does winter, except for the 9 cold-hardy crops. Two crops (carrots, kale) escape bad months once they have grown a few steps.
- A cursed plant has all losses doubled and all gains halved, twice-as-likely disease, no bonus yield, and a lower starting health. A curse is never lifted while the plant lives.
- Winter here is the engine's season, not December to February: about early November to mid-February at the default settings.
- Sow months, best months, risk months and bad months below are the code's own numbers. Plants have no growing season separate from them.
:::

:::facts
- **Vanilla crops** 55: 32 vegetables, grains and the like, and 23 herbs and flowers :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua`)]
- **Shortest and longest** 30 game days (radishes) to 240 game days (garlic, wild garlic, hemp, hops), which is 45 to 360 real hours at the default Day Length :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua:504-531`, `media/lua/server/Farming/farming_vegetableconf_vegetables.lua:252-282`)]
- **Risk-month curse chance** (11 minus your Agriculture level) in 20 :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:726-727`)]
- **Best-month bonus-yield chance** (9 plus your Agriculture level) in 20 :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:728`)]
- **Winter** centered on 22 December, starting floor(40 + 40 x winterMod + 20 x noise) days before and ending as many after; about 100 days at the default Temperature option, early November to mid-February :cite[(`zombie/erosion/season/ErosionSeason.java:307-310`)]
- **Cold-hardy crops** 9; **bad-month-hardy crops** 2 :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:148-160`)]
:::

## 1. The four month lists

**Each crop has a list of sowing months, best months, risk months and bad months, counted by the calendar month of the game date.**

The game compares the current calendar month (1 for January) with each list, and every test returns false when Plant Growing Seasons is off. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:134-202`)]

- **Sow months** (`sowMonth`) are the months you may plant. Outside them a plant is cursed the moment it is sown.
- **Best months** (`bestMonth`) are some of those, with a chance of a bonus-yield flag. Three crops (leek, lemongrass, rosemary) have none.
- **Risk months** (`riskMonth`) are some of the sow months where the curse can still happen by dice. Five crops have none (chamomile, leek, lemongrass, mint, rosemary).
- **Bad months** (`badMonth`) are the months when the crop does badly. A plant outdoors in one is cursed and takes extra damage each health tick. The two bad-month-hardy crops escape this once they have grown enough steps: carrots from step 4, kale from step 3. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:172-175`, `media/lua/server/Farming/SFarmingSystem.lua:228-231`, `media/lua/server/Farming/SPlantGlobalObject.lua:148-154`)]

A month that is in no list for a crop is neither sow nor bad. A crop sown then is cursed, but plants already in the ground are fine. Not every non-sow month is a bad month, and the code has no separate "growing season" list. Months only exist as numbers 1 to 12, so a crop's list can wrap around the year (basil's bad months run from August to January).

The Sow tooltip prints the sow, best and risk months for a crop (not the bad months), once you know the crop's season recipe or have Agriculture 6, and only while the option is enabled. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:540-565`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:567-611`)] Every crop's season recipe is learned at Agriculture 10 (9 with the Inventive trait). The Farmer occupation starts with all 55 of them and the Gardener trait with 49. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:240-250`, `media/scripts/generated/characters/character_professions.txt:92`, `media/scripts/generated/characters/character_traits.txt:377`)]

## 2. When a plant is cursed

**A plant is cursed when it is sown in the wrong month, when a risk-month roll fails, while it sits in a bad month or in winter, and when it takes its third fertilizer.**

:::flow[The ways to a curse]
- Sown outside the sow months: always
- Sown in a risk month: a dice roll
- In a bad month, outdoors: next health tick
- Outdoors in winter, not cold-hardy: next health tick
- Third fertilizer use in one step
:::

At sowing, the game tests three rules in this order and stops when one applies: not a sow month, so cursed; a risk month, so cursed when a die of 20 comes up below 11 minus your level; a best month, so the bonus-yield flag when it comes up below 9 plus your level. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:715-731`)] Level 0 gives 55% and 45%, level 5 gives 30% and 70%, and level 10 gives 5% and 95%. Those are our arithmetic on the die.

Afterwards, every health tick (each 2 game hours) cursed-marks an outdoor plant that is in one of its bad months and is not bad-month-hardy, or is outdoors in winter and is not cold-hardy, while the option is enabled. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:172-178`)] A curse is not about the date the season starts: it lands within 2 game hours (7.5 real minutes at the default Day Length) of the season changing. The older note called this "day 1 of a crop's earliest bad month, all crops globally"; the code checks each plant on its own tick. The third fertilizer use in one step also curses. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:552-557`)]

"Winter" is the engine season name, not the calendar month list: it is the season from `ClimateManager`, which with the default Temperature option runs from early November to mid-February, about 100 days, and moves each year. See [Seasons and day length](/pz/build-42/engine/weather-and-climate/seasons-and-day-length). :cite[(`media/lua/server/Farming/SFarmingSystem.lua:176`, `zombie/iso/weather/ClimateManager.java:772-774`)] Planting in February is therefore not safe for a crop without cold hardiness in a year when winter runs into February.

### What a curse does

A cursed plant has a bad-care multiplier of at least 2, which doubles every loss and halves every gain on the [health tick](/pz/build-42/modding/farming-and-animals/crop-health-water-disease). It also makes a disease roll twice as likely, blocks the bonus-yield flag and removes its effect at harvest, and sets the starting health to 37 to 43 when the cause was a non-sow or risk month. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:171-183`, `media/lua/server/Farming/SPlantGlobalObject.lua:353-356`, `media/lua/server/Farming/farming_vegetableconf.lua:35-38`, `media/lua/server/Farming/SPlantGlobalObject.lua:741-743`)] Nothing in the Lua clears the flag on a living plant. It resets only when the plant dies. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:748-766`)]

## 3. Seasons and plant growing

**Growth time, water and the month lists are all in the crop's entry; the season itself changes only the curse and the damage.**

Each growth step takes the crop's `timeToGrow` hours, so the days column below is that value times the harvest level over 24, which is also what the Sow tooltip prints (rounded down). :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:567-570`)] The step length is divided by the Farming Speed option (1.0 by default, 1.5 in the Outbreak preset). :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:104-122`, `media/lua/shared/Sandbox/Outbreak.lua:162`)] A plant that is not harvested while "blooming" rots after half a step, or its `rotTime` for six crops (broccoli, cauliflower, spinach and tobacco 248 hours, radishes and sugar beets 224). :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:283-296`)]

Plant Growing Seasons off turns the whole month system into a no-op: no curses, no risk or best rolls, no bad-month damage. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:134-202`, `media/lua/server/Farming/SPlantGlobalObject.lua:725-730`)] The Outbreak preset turns it off. :cite[(`media/lua/shared/Sandbox/Outbreak.lua:160`)]

## 4. The crop table

**All 55 vanilla crops, with the numbers the code holds for each.**

Columns: Min water is the level a plant needs for every step after the first (the number the Sow tooltip prints), and First-step water is what the very first step needs. Days is days to harvest at Farming Speed 1.0, and multiplying by 1.5 gives real hours at the default Day Length.

Sow, Best, Risk and Bad are calendar months, and a range can run across the new year.

Notes uses "cold" for cold-hardy and "regrows" for the 17 crops that return to phase 2 after a harvest. "aphids", "flies" and "slugs" mean the crop cannot catch that disease and protects the plants around it from phase 3 onward, and "slugs (self only)" means it is only immune itself. "flower" marks the five crops whose harvest calms the harvester. Names are the game's names. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:130-148`, `media/lua/server/Farming/SFarmingSystem.lua:385-461`, `media/lua/shared/Translate/EN/Farming.json:2-58`)]

| Crop | Type | Min water | First-step water | Days | Sow | Best | Risk | Bad | Notes | Code |
|---|---|---|---|---|---|---|---|---|---|---|
| Barley | Veg | 30 | 70 | 108 | Aug-Oct | Sep | Oct | Jun, Jul | cold | `farming_vegetableconf_vegetables.lua:5-32` |
| Basil | Herb | 80 | 70 | 60 | Mar-May | Mar | Apr | Aug-Jan | flies, regrows | `farming_vegetableconf_herbs.lua:3-27` |
| Bell Pepper | Veg | 70 | 70 | 60 | Apr-Jun | May | Jun | Oct-Mar | - | `farming_vegetableconf_vegetables.lua:34-58` |
| Black Sage | Herb | 60 | 70 | 60 | Mar-Aug | Apr, May | Jul, Aug | Oct-Feb | - | `farming_vegetableconf_herbs.lua:29-49` |
| Broadleaf Plantain | Herb | 60 | 70 | 60 | Mar-Aug | Apr | Jun, Jul | Oct-Feb | - | `farming_vegetableconf_herbs.lua:51-71` |
| Broccoli | Veg | 70 | 70 | 60 | Feb-Jul | Mar, Jun | Jul | Sep-Jan | - | `farming_vegetableconf_vegetables.lua:60-84` |
| Cabbages | Veg | 80 | 80 | 60 | Feb-Jul | Mar, May | Jul | Oct-Jan | cold | `farming_vegetableconf_vegetables.lua:86-115` |
| Carrots | Veg | 30 | 70 | 90 | Feb-Jul | Feb, Jun | Jul | Oct-Jan | bad months from step 4 | `farming_vegetableconf_vegetables.lua:117-142` |
| Cauliflower | Veg | 70 | 70 | 60 | Feb-Apr | Mar | Apr | Sep-Jan | - | `farming_vegetableconf_vegetables.lua:144-168` |
| Chamomile | Herb | 80 | 70 | 60 | Mar-May | Apr | - | Aug-Jan | regrows, flower | `farming_vegetableconf_herbs.lua:73-96` |
| Chives | Herb | 60 | 70 | 60 | Mar-Aug | Apr | Jun, Jul | Oct-Feb | aphids, slugs (self only), regrows | `farming_vegetableconf_herbs.lua:98-122` |
| Cilantro | Herb | 70 | 70 | 60 | Mar-May | Apr | May | Jul-Jan | slugs (self only), regrows | `farming_vegetableconf_herbs.lua:124-147` |
| Comfrey | Herb | 60 | 70 | 60 | Mar-Aug | Mar, Apr | Jun, Jul | Oct-Feb | - | `farming_vegetableconf_herbs.lua:149-169` |
| Common Mallow | Herb | 60 | 70 | 60 | Mar-Aug | Mar, Apr | Jun, Jul | Oct-Feb | - | `farming_vegetableconf_herbs.lua:171-191` |
| Corn | Veg | 30 | 70 | 90 | Mar-May | Apr | May | Aug-Feb | - | `farming_vegetableconf_vegetables.lua:171-195` |
| Cucumber | Veg | 70 | 70 | 90 | Mar-May | Apr | May | Aug-Feb | - | `farming_vegetableconf_vegetables.lua:197-221` |
| Flax | Veg | 30 | 70 | 108 | Aug-Oct | Sep | Oct | Jun, Jul | cold | `farming_vegetableconf_vegetables.lua:223-250` |
| Garlic | Veg | 30 | 70 | 240 | Jul-Sep | Aug | Sep | Jun | cold, aphids, slugs (self only) | `farming_vegetableconf_vegetables.lua:252-282` |
| Green Peas | Veg | 70 | 80 | 60 | Feb-Apr | Mar | Apr | Oct-Jan | slugs (self only) | `farming_vegetableconf_vegetables.lua:284-312` |
| Habanero | Herb | 70 | 70 | 60 | Apr-Jun | May | Jun | Oct-Mar | - | `farming_vegetableconf_herbs.lua:193-218` |
| Hemp | Veg | 30 | 70 | 240 | Aug-Oct | Sep | Oct | Jun, Jul | - | `farming_vegetableconf_vegetables.lua:314-339` |
| Hops | Veg | 30 | 70 | 240 | Aug-Oct | Sep | Oct | Jun, Jul | - | `farming_vegetableconf_vegetables.lua:341-365` |
| Jalapeno | Herb | 70 | 70 | 60 | Apr-Jun | May | Jun | Oct-Mar | - | `farming_vegetableconf_herbs.lua:220-245` |
| Kale | Veg | 70 | 70 | 60 | Feb-Aug | Mar, Jul | Aug | Nov-Jan | cold, bad months from step 3, regrows | `farming_vegetableconf_vegetables.lua:367-394` |
| Lavender | Herb | 80 | 70 | 60 | Mar-May | Apr | May | Aug-Jan | regrows, flower | `farming_vegetableconf_herbs.lua:247-270` |
| Leek | Herb | 70 | 70 | 150 | Mar-Sep | - | - | Oct-Jan | cold, aphids, slugs (self only) | `farming_vegetableconf_herbs.lua:272-297` |
| Lemongrass | Herb | 70 | 70 | 60 | Mar-Sep | - | - | Oct-Jan | aphids, slugs, regrows | `farming_vegetableconf_herbs.lua:299-325` |
| Lettuce | Veg | 70 | 80 | 60 | Feb-Apr, Jul-Sep | Mar, Jul | Sep | Oct-Jan | - | `farming_vegetableconf_vegetables.lua:396-420` |
| Marigold | Herb | 80 | 70 | 60 | Mar-May | Apr | May | Aug-Jan | aphids, flies, regrows, flower | `farming_vegetableconf_herbs.lua:327-353` |
| Mint | Herb | 70 | 70 | 60 | Feb-Apr | Mar | - | Jun-Jan | regrows | `farming_vegetableconf_herbs.lua:355-377` |
| Onions | Veg | 30 | 70 | 90 | Feb, Mar | Feb | Mar | Jul-Jan | aphids, flies, slugs (self only) | `farming_vegetableconf_vegetables.lua:422-450` |
| Oregano | Herb | 60 | 70 | 60 | Feb-Apr | Mar | Apr | Jul-Jan | slugs (self only), regrows | `farming_vegetableconf_herbs.lua:379-404` |
| Parsley | Herb | 70 | 70 | 60 | Feb-Apr | Mar | Apr | Jun-Jan | slugs (self only), regrows | `farming_vegetableconf_herbs.lua:406-429` |
| Poppies | Herb | 80 | 70 | 60 | Mar-May | Apr | May | Aug-Jan | regrows | `farming_vegetableconf_herbs.lua:431-453` |
| Potatoes | Veg | 60 | 70 | 90 | Feb-Apr | Mar | Apr | Aug-Jan | slugs (self only) | `farming_vegetableconf_vegetables.lua:452-477` |
| Pumpkin | Veg | 70 | 70 | 90 | Mar-May | Apr | May | Aug-Feb | - | `farming_vegetableconf_vegetables.lua:479-502` |
| Radishes | Veg | 40 | 70 | 30 | Feb-Aug | Mar, Jul | Aug | Sep-Jan | slugs (self only) | `farming_vegetableconf_vegetables.lua:504-531` |
| Rosemary | Herb | 30 | 70 | 180 | Mar-Sep | - | - | Oct-Jan | aphids, flies, slugs, regrows, flower | `farming_vegetableconf_herbs.lua:455-482` |
| Roses | Herb | 80 | 70 | 60 | Mar-May | Apr | May | Aug-Jan | regrows, flower | `farming_vegetableconf_herbs.lua:484-507` |
| Rye | Veg | 30 | 70 | 108 | Aug-Oct | Sep | Oct | Jun, Jul | cold | `farming_vegetableconf_vegetables.lua:533-560` |
| Sage | Herb | 30 | 70 | 90 | Feb-Apr | Mar | Apr | Jul-Dec | flies, regrows | `farming_vegetableconf_herbs.lua:509-534` |
| Soybeans | Veg | 60 | 70 | 90 | Mar-May | Apr | May | Aug-Feb | - | `farming_vegetableconf_vegetables.lua:562-584` |
| Spinach | Veg | 70 | 70 | 60 | Feb-Jul | Mar, Jun | Jul | Sep-Jan | - | `farming_vegetableconf_vegetables.lua:586-609` |
| Strawberry Plant | Veg | 80 | 80 | 90 | Feb-Apr | Mar | Apr | Jul-Jan | regrows | `farming_vegetableconf_vegetables.lua:611-639` |
| Sugar Beet | Veg | 40 | 70 | 60 | Feb-Jul | Mar, Jun | Jul | Sep-Jan | - | `farming_vegetableconf_vegetables.lua:641-667` |
| Sunflower | Veg | 30 | 70 | 90 | Mar-May | Apr | May | Aug-Feb | - | `farming_vegetableconf_vegetables.lua:669-693` |
| Sweet Potatoes | Veg | 60 | 70 | 90 | May-Jul | Jun | Jul | Oct-Feb | - | `farming_vegetableconf_vegetables.lua:695-718` |
| Thyme | Herb | 30 | 70 | 60 | Feb-Apr | Mar | Apr | Aug-Jan | aphids, regrows | `farming_vegetableconf_herbs.lua:536-561` |
| Tobacco | Veg | 70 | 70 | 180 | Mar-Jul | Mar | Jul | Sep-Feb | - | `farming_vegetableconf_vegetables.lua:720-743` |
| Tomato Vine | Veg | 70 | 80 | 90 | Apr-Jun | May | Jun | Oct-Mar | slugs (self only) | `farming_vegetableconf_vegetables.lua:745-774` |
| Turnip | Veg | 60 | 70 | 60 | May-Oct | Jun, Sep | Jul, Oct | Nov-Feb | - | `farming_vegetableconf_vegetables.lua:776-799` |
| Watermelon | Veg | 70 | 80 | 90 | Mar-May | Apr | May | Oct-Feb | - | `farming_vegetableconf_vegetables.lua:801-824` |
| Wild Garlic | Herb | 30 | 70 | 240 | Jul-Sep | Aug | Sep | Jun | cold, aphids, slugs (self only) | `farming_vegetableconf_herbs.lua:563-593` |
| Winter Wheat | Veg | 30 | 70 | 108 | Aug-Oct | Sep | Oct | Jun, Jul | cold | `farming_vegetableconf_vegetables.lua:826-853` |
| Zucchini | Veg | 70 | 70 | 90 | Mar-May | Apr | May | Aug-Feb | - | `farming_vegetableconf_vegetables.lua:855-878` |

Four crops (barley, flax, rye and winter wheat) can be harvested with a scythe. The 17 "regrows" crops are kale, the strawberry plant and 15 herbs. :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua:5-32`, `media/lua/shared/TimedActions/ISScything.lua:80-86`, `media/lua/server/Farming/SFarmingSystem.lua:366-375`)]

Compared with the older table on this page, these entries changed: Common Mallow's minimum water is 60, not 70; corn's bad months start in August, not July; leek, lemongrass and rosemary stop their bad months at January, not February; lettuce's sow months are February to April and July to September; and 14 crops had their aphid, fly or slug column wrong (the code columns are above). The disease columns matter only to a mod or a debug cheat in 42.22, because new aphids, flies and slugs never start (see the [health page](/pz/build-42/modding/farming-and-animals/crop-health-water-disease#5-disease)).

:::callout[How we know]{kind=proof}
The table is read from the 42.22 crop files by a script that copies each key, so a value is as the file has it. The days column and the real-time conversions are our own arithmetic on `timeToGrow` times the harvest level over 24. We did not run a game and have not timed a crop.

Not verified: the exact calendar date winter starts in a given game (it varies by year), how Farming Speed values other than 1.0 round, and a few crops' `seedTypes` and `produceExtra` items. The older "planting season in Character Info" line was not found in the code and is replaced by the Sow tooltip above.
:::
