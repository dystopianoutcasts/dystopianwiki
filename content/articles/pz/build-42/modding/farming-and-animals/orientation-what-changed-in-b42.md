---
id: build-42-orientation-what-changed-in-b42
slug: orientation-what-changed-in-b42
title: 'Orientation: what changed in B42'
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
  What Build 42 added to crops, skills, foraging and animals compared with Build 41, checked against both builds' files, with one old claim corrected: the foraging category system is not new.
last_updated: '2026-11-16'
related_articles:
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

Outcast, if you know the Build 41 farm, here is what is different in the Build 42 files. Each change below was checked against both builds. Where the older version of this page was wrong, it says so.

:::callout[The 1-minute version]{kind=key}
- Crops went from 6 in Build 41 to 55 in Build 42, with sowing months, curses, compost and a fourth disease (slugs) added. Farming is still run by the server (or single player).
- Farming became Agriculture on screen, and two new skills joined it in a new group: Animal Care and Butchering.
- The foraging category and Search Focus system is not new in B42. B42 adds 4 categories (27 in all) and builds each multiplayer player's spots on the server.
- Animals are new: 10 species are defined in Lua, with genes, life stages, breeds and ranch zones.
- The disease once called Devil's Water Fungi is called Aphids.
- Between 42.21 and 42.22 no farming Lua number changed.
:::

:::facts
- **Vanilla crops** 6 in Build 41, 55 in Build 42 :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua`)]
- **Farming skills** 1 in Build 41, 3 in Build 42 :cite[(`zombie/characters/skills/PerkFactory.java:145-148`)]
- **Foraging categories** 23 in Build 41, 27 in Build 42 :cite[(`media/lua/shared/Foraging/forageCategories.lua:4-669`)]
- **Animal species files** 10 :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:1`, `media/lua/shared/Definitions/animal/TurkeyDefinitions.lua:1`)]
:::

## 1. Crops and farming

**Build 41 had six crops and no seasons; Build 42 has 55 crops, a month system and a curse.**

Build 42's two crop files define 55 crops: 32 in the vegetable file and 23 in the herb file. :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua`)] Each has sowing, best, risk and bad months, and a plant sown or kept in a wrong month is cursed. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:134-202`, `media/lua/server/Farming/SPlantGlobalObject.lua:715-731`)] Details are on [Seasons, curses and the crop table](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table).

Build 42 adds a fourth disease, slugs, next to mildew, aphids and flies, and a compost flag next to fertilizer. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:12-37`)] Build 41's farming Lua had mildew, aphids and flies, and none of these month, slug or compost fields. The disease once labeled "Devil's Water Fungi" now reads "Aphids". :cite[(`media/lua/shared/Translate/EN/Farming.json:102-104`)]

The system underneath did not change shape: the server (or single player) holds each plant as a global object, ticks it, and the client sends commands. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:1`, `media/lua/server/Farming/SFarmingSystem.lua:27-35`)] How the loop works is on [Agriculture basics](/pz/build-42/modding/farming-and-animals/agriculture-basics-from-seed-to-harvest), and how health, water and disease behave is on [Crop health, water, disease](/pz/build-42/modding/farming-and-animals/crop-health-water-disease).

## 2. Skills

**Farming is now Agriculture, and it shares a new group with two new skills.**

The code name `Farming` is the same, but the screen name is Agriculture and its group is the new Farming group, next to Animal Care (`Husbandry`) and Butchering. :cite[(`zombie/characters/skills/PerkFactory.java:145-148`, `media/lua/shared/Translate/EN/IG_UI.json:202`, `media/lua/shared/Translate/EN/IG_UI.json:222`, `media/lua/shared/Translate/EN/IG_UI.json:228-230`)] In Build 41 the one farming skill sat under Crafting. See [The three farming skills](/pz/build-42/modding/farming-and-animals/the-three-farming-skills).

## 3. Foraging

**B42 did not introduce categories or Search Focus; it added four categories and server-built spots.**

An older version of this page said foraging was "overhauled into a category and search-focus system" in B42. The Build 41 files already had a category list, a Search Focus menu, unlock levels and the Farmer's Crops bonus.

What B42 adds is 4 categories (Tracks, Crafting Materials, Bones and Artifacts, taking the list from 23 to 27) and a server that builds a separate pool of spots for each player. :cite[(`media/lua/shared/Foraging/forageCategories.lua:4-669`, `media/lua/server/Foraging/forageServer.lua:161-227`)] The Crops category unlocks at Foraging 5. :cite[(`media/lua/shared/Foraging/forageCategories.lua:151-176`)] See [Foraging in B42](/pz/build-42/modding/farming-and-animals/foraging-in-b42).

## 4. Animals

**Animals are the big new system: species, genes, stages, breeds and ranch zones, all defined in Lua.**

Build 42 defines 10 species in Lua files (chicken, cow, deer, mouse, pig, rabbit, raccoon, rat, sheep, turkey), each with four tables for life stages, genes, breeds and the animal stat blocks. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:4`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:23`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:42`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:109`)] Build 41's Lua had no animal definitions. A gene has two alleles, and each allele carries a dominant flag and a genetic disorder field. :cite[(`zombie/characters/animals/AnimalGene.java:25-26`, `zombie/characters/animals/AnimalAllele.java:16-22`)]

For modders there are four new tables or files: `AnimalDefinitions`, `RanchZoneDefinitions`, `AnimalAvatarDefinition` and `AnimalPartsDefinitions`. :cite[(`media/lua/shared/Definitions/animal/RanchZoneDefinitions.lua:1`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:1`, `media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:3`, `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:1`)] The pages for them are [animals overview](/pz/build-42/modding/farming-and-animals/animals-overview-the-b42-living-animal-system), [genetics and breeds](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight), [butchering](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals), [AnimalDefinitions](/pz/build-42/modding/farming-and-animals/modding-the-animaldefinitions-global-table) and [ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones).

## 5. What 42.22 itself changed

**Almost nothing in these systems: a nil guard, a reformatted menu file, and one removed key handler.**

Compared with 42.21, the farming Lua changed in three files. `getObjectPhase` gained a guard for a missing crop entry, `CFarming_Interact.lua` lost its rope-climb key handler, and `ISFarmingMenu.lua` was reformatted. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:168-172`)] In foraging the Search Mode toggle now asks `isTutorial()`, and the foraging network packets changed how they carry the player. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:1416-1419`)] No crop number changed.

:::callout[How we know]{kind=proof}
The Build 42 facts are read from the 42.22 files cited. The Build 41 facts come from the Build 41 install: its farming files hold 6 crops and no month, slug or compost fields, its translation file names the disease "Devil's Water Fungi", its perk list puts Farming under Crafting with no Animal Care or Butchering, its foraging file has 23 categories with Search Focus, and its Lua has no animal definitions. The 42.21 to 42.22 comparison is from the engine-record delta files. The checker cannot open Build 41 or delta files, so those lines are not cited above.

Not verified: how the Build 41 plants behaved in play, and whether the farming numbers in Build 41 resemble the 42.22 ones. The older line about the animal AI being "very basic" was dropped because the code does not say it.
:::
