---
id: build-42-the-three-farming-skills
slug: the-three-farming-skills
title: The three farming skills
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
  Agriculture, Animal Care and Butchering sit in one skill group in 42.22. What Agriculture changes, level by level, how its XP is earned, and what each level shows you.
last_updated: '2026-11-16'
related_articles:
  - orientation-what-changed-in-b42
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - butchering-and-dead-animals
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

Outcast, three skills share one group on the character sheet: Agriculture, Animal Care and Butchering. This page is about Agriculture, the one that grows crops. It is where most of the numbers are, and the code gives it more than a line each per level. The two animal skills have a short section here and their own pages.

:::callout[The 1-minute version]{kind=key}
- Agriculture's only XP source in play is harvesting a plant you sowed yourself. Digging, sowing, watering and fertilizing give none.
- A harvest gives the plant's health divided by 2, plus 25 for a plant kept watered or minus 15 for one that was left too dry, held between 1 and 100.
- Each level lowers the chance that a sowing in a risk month is cursed (55% at level 0, 5% at level 10), raises your best-month bonus chance (45% to 95%), and adds 1 starting health.
- Levels also unlock what the plant window shows: current phase at 2, disease and the hover tooltip at 3, a water bar at 4, the next growth stage at 6.
- The Farmer occupation starts at Agriculture 4 and the Gardener trait adds 1.
- Animal Care and Butchering belong to the same group; their XP and effects are on the animal pages.
:::

:::facts
- **Skill group** Farming, holding 3 skills: Agriculture, Animal Care, Butchering :cite[(`zombie/characters/skills/PerkFactory.java:145-148`)]
- **Harvest XP** health / 2, plus 25 or minus 15, held to 1 to 100 :cite[(`media/lua/server/Farming/SFarmingSystem.lua:538-552`)]
- **XP to reach each level** 75, 150, 300, 750, 1,500, 3,000, 4,500, 6,000, 7,500, 9,000, level by level :cite[(`zombie/characters/skills/PerkFactory.java:80-96`)]
- **Farmer occupation** Agriculture 4, Animal Care 1, Strength 1 :cite[(`media/scripts/generated/characters/character_professions.txt:91`)]
- **Skill book multipliers** x3, x5, x8, x12, x16 for volumes 1 to 5 :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:51-58`)]
:::

## 1. What the three skills are

**Agriculture grows crops, Animal Care looks after animals, and Butchering works the carcass.**

In the code the three are the perks `Farming`, `Husbandry` and `Butchering`, and the game shows them as Agriculture, Animal Care and Butchering under the group Farming. :cite[(`zombie/characters/skills/PerkFactory.java:145-148`, `media/lua/shared/Translate/EN/IG_UI.json:202`, `media/lua/shared/Translate/EN/IG_UI.json:222-230`)] The game's own description of Agriculture is "Increases the available information for crops. Trained by harvesting crops planted yourself." :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5607`)]

What is new in B42: in Build 41 Farming was a skill under Crafting, shown as "Farming", and Animal Care and Butchering did not exist. B42 gives the same perk the name Agriculture and puts all three in their own group. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:202`, `zombie/characters/skills/PerkFactory.java:145-148`)]

| Skill | Code name | What the game says it does | Where it is covered | Code |
|---|---|---|---|---|
| Agriculture | `Farming` | More information about crops | this page | `media/lua/shared/Translate/EN/IG_UI.json:5607` |
| Animal Care | `Husbandry` | More information about animals, and more resources from them | [Animals overview](/pz/build-42/modding/farming-and-animals/animals-overview-the-b42-living-animal-system) | `media/lua/shared/Translate/EN/IG_UI.json:5608` |
| Butchering | `Butchering` | Better quality of meat from animals | [Butchering and dead animals](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals) | `media/lua/shared/Translate/EN/IG_UI.json:5609` |

## 2. How Agriculture XP is earned

**The only XP source in play is harvesting a plant you sowed, and the amount depends on how well you tended it.**

The harvest gives your own plant's health divided by 2, plus 25, or minus 15 if the plant was ever marked as badly cared for. The result is held between 1 and 100. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:538-552`)] A plant gets the bad-care mark the first time a growth check finds it too dry for its step (below its minimum by more than 10%), and it keeps the mark. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:340-347`)]

Nothing else in the Lua adds Farming XP: digging, sowing, watering, fertilizing and weeding call no XP function, and the harvest XP only fires when the harvester is the owner saved on the plant. :cite[(`media/lua/shared/Farming/TimedActions/ISHarvestPlantAction.lua:61-72`)] Starting levels, skill books and recorded media are the other sources. The books multiply the XP you earn at volumes 1 to 5 :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:51-58`)], and a broadcast with the farming code gives 50 times its amount until your level reaches the media cutoff. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:4-16`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:119`)] How XP turns into levels, with the starting-level multipliers, is on [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level).

The Farmer occupation gives Agriculture 4, Animal Care 1 and Strength 1, and the Gardener trait gives Agriculture 1. :cite[(`media/scripts/generated/characters/character_professions.txt:91`, `media/scripts/generated/characters/character_traits.txt:369-377`)] The owner is saved when you sow: your online ID in multiplayer, your player number in single player. :cite[(`media/lua/shared/Farming/TimedActions/ISSeedActionNew.lua:62-68`)]

## 3. What each level does

**Agriculture is mostly a set of dice that tilt in your favor, plus information.**

All the numbers below read your level in the Lua at the moment of the action.

::::cards
:::card[Sowing]{accent=orange}
In a risk month a seed is cursed when a die of 20 comes up below 11 minus your level: 55% at level 0 down to 5% at level 10. In a best month it gets the bonus-yield flag when the die comes up below 9 plus your level: 45% to 95%. Starting health is your level higher. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:715-746`)]
:::
:::card[Fertilizing]{accent=purple}
A first fertilizer or compost use in the early phases (up to phase 3) can give the bonus-yield flag, with the same 9 plus your level in 20 chance. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:596-621`)]
:::
:::card[Treating disease]{accent=blue}
Each use of a cure removes 10 plus your level points of that disease. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:436-497`)]
:::
:::card[Harvesting]{accent=cream}
With a chance of your level in 10, your level is added to the number of items. Digging and harvesting low add less back strain: 5% less per level. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:67`, `media/lua/shared/Farming/TimedActions/ISPlowAction.lua:90-110`)]
:::
::::

These are different from the older "minus 5% curse per level, plus 1 to yield, plus 1 to disease reduction" summary: the code changes the odds by the numbers above and does not add 1 to yield per level.

### What each level shows you

The plant window and menus gate their information on your level, counting 2 extra levels while a magnifier is in your hand for the plant window.

| Level | What opens up | Code |
|---|---|---|
| 2 | The current phase as text in the plant window | `media/lua/client/Farming/ISUI/ISFarmingInfo.lua:511-521` |
| 3 | Disease lines in the plant window (level 1 with a magnifier); the hover tooltip over a plant with its water and disease | `media/lua/client/Farming/ISUI/ISFarmingInfo.lua:126-130`, `media/lua/client/Farming/CFarmingSystem.lua:48`, `media/lua/client/Farming/CFarmingSystem.lua:115` |
| 4 | A water bar in the plant window | `media/lua/client/Farming/ISUI/ISFarmingInfo.lua:177` |
| 6 | The next growth stage, the Sow tooltip with the crop's numbers, and the cure recipes | `media/lua/client/Farming/ISUI/ISFarmingInfo.lua:87`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:543`, `media/scripts/generated/recipes/recipes_farming.txt:3-9` |
| 10 (9 with the Inventive trait) | All crops' season recipes at once | `media/lua/server/XpSystem/XpUpdate.lua:240-250`, `media/lua/server/XpSystem/XpUpdate.lua:350-358` |

The hover tooltip and the plant window both read the player's real level; only the plant window adds the magnifier's 2 levels. The cure recipes are learned on their own at level 6 (`AutoLearnAny = Farming:6`), and also come from the Farmer occupation, the Gardener trait and the magazines `FarmingMag1` (mildew cure) and `FarmingMag2` (flies and aphid cures). :cite[(`media/scripts/generated/characters/character_professions.txt:92`, `media/scripts/generated/characters/character_traits.txt:377`, `media/scripts/generated/items/literature.txt:5428-5453`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:865-871`)]

The plant's health row is not in the normal plant window at all in 42.22. It shows only in the Agriculture cheat mode of the admin and debug panel. :cite[(`media/lua/client/Farming/ISUI/ISFarmingInfo.lua:116-122`, `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua:113-120`)]

## 4. Animal Care and Butchering

**Both skills are earned and used on animals, and each has its own page.**

Animal Care XP comes from actions such as giving water to an animal (2) and collecting eggs from a hutch (1), and from animal code in the engine. :cite[(`media/lua/shared/TimedActions/Animals/ISGiveWaterToAnimal.lua:36`, `media/lua/shared/TimedActions/Animals/ISHutchGrabEgg.lua:22`, `zombie/characters/animals/IsoAnimal.java:1824-1826`, `zombie/characters/animals/IsoAnimal.java:2486`)] The Rancher occupation starts with Animal Care 4 and Butchering 3, the Farmer with Animal Care 1. :cite[(`media/scripts/generated/characters/character_professions.txt:195`, `media/scripts/generated/characters/character_professions.txt:91`)] Both skills have skill books with the same multipliers as Agriculture. :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:99-105`)]

The exact XP and effects per animal action are not repeated here. See the [animals overview](/pz/build-42/modding/farming-and-animals/animals-overview-the-b42-living-animal-system), [animal genetics](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight) and [butchering](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals).

:::callout[How we know]{kind=proof}
Every effect above is read from the 42.22 Lua cited beside it. The percentages are our own arithmetic on the dice (a die of 20 below 11 minus level, and so on). We did not run a game to count real harvests.

The Build 41 facts come from the Build 41 engine record (`PerkFactory.java` line 110) and the Build 41 text file, which the citation checker cannot open.

Not verified: the exact Animal Care XP of every animal action (the Java calls were only located), whether the Rancher and Farmer occupations are offered in every game mode, and which magazine volume the loot tables place where. The older line "level 3 shows the water tooltip in color" refers to the same hover tooltip and was confirmed only for the tooltip existing.
:::
