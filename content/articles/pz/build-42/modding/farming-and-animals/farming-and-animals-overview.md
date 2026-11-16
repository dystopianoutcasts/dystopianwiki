---
id: build-42-farming-and-animals-overview
slug: farming-and-animals-overview
title: 'Farming, foraging and animals'
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
  The 42.22 map of crops, foraging and animals: what each of the 13 pages covers, which side of a server runs each system, and where the deeper engine and cookbook pages are.
last_updated: '2026-11-16'
related_articles:
  - orientation-what-changed-in-b42
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

**Who this page is for:** [players who farm and forage](#1-the-crop-and-foraging-pages) | [modders](#3-the-modding-pages)

Outcast, this is the front door for everything the game does with crops, wild food and animals. It names the pages in this section, says which are about crops and foraging and which about animals, and tells you which machine runs what.

:::callout[The 1-minute version]{kind=key}
- Crops are run by the server, or by single player: every plant is a saved object that the server ticks, and a client only sends commands and draws.
- Foraging in single player runs in your own game. On a server the server builds each player's spots and checks the pickup.
- Of the 13 numbered pages, five are about crops and skills, one about foraging, five about animals, and two are for modders who add loot or a crop. A sixth animal page, the animal pipeline, sits beside them.
- If you only read one page, read [Agriculture basics](/pz/build-42/modding/farming-and-animals/agriculture-basics-from-seed-to-harvest) for crops or [Foraging in B42](/pz/build-42/modding/farming-and-animals/foraging-in-b42) for wild food.
- To build something, the complete mods are in the cookbook: [a new crop](/pz/build-42/modding/cookbook/new-crop) and [a new animal breed](/pz/build-42/modding/cookbook/new-animal).
:::

:::facts
- **Pages in this section** 15: this one, the 13 numbered parts and the animal pipeline page
- **Vanilla crops** 55 :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua`)]
- **Foraging categories** 27 :cite[(`media/lua/shared/Foraging/forageCategories.lua:4-669`)]
- **Skills in the Farming group** 3 :cite[(`zombie/characters/skills/PerkFactory.java:145-148`)]
- **Animal species files** 10 :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:1`)]
:::

## 1. The crop and foraging pages

**These six pages cover what a player does with seeds, wild food and the skills that go with them, and one engine page that they rely on.**

1. [Orientation: what changed in B42](/pz/build-42/modding/farming-and-animals/orientation-what-changed-in-b42): what is new next to Build 41, checked against both builds.
2. [The three farming skills](/pz/build-42/modding/farming-and-animals/the-three-farming-skills): Agriculture, Animal Care and Butchering, and what each Agriculture level does.
3. [Agriculture basics: from seed to harvest](/pz/build-42/modding/farming-and-animals/agriculture-basics-from-seed-to-harvest): seeds, furrows, sowing, what destroys a plant, and how a harvest is counted.
4. [Crop health, water, disease](/pz/build-42/modding/farming-and-animals/crop-health-water-disease): the health tick, water, fertilizer, and the diseases.
5. [Seasons, curses, and the crop table](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table): the month rules, the curse, and all 55 crops in one table.
6. [Foraging in B42](/pz/build-42/modding/farming-and-animals/foraging-in-b42): Search Mode, categories, Search Focus, the six wild crops and the animal finds.
7. [Seasons and day length](/pz/build-42/engine/weather-and-climate/seasons-and-day-length) (engine page): when winter starts and how long a game day is, which the crop pages rely on. How skill XP becomes levels is on [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level).

## 2. The animal pages

**The animal pages are checked separately from the crop pages.**

1. [Animals overview: the B42 living-animal system](/pz/build-42/modding/farming-and-animals/animals-overview-the-b42-living-animal-system)
2. [Animal genetics, breeds, and weight](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight)
3. [Butchering and dead animals](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals)
4. [MODDING: the AnimalDefinitions global table](/pz/build-42/modding/farming-and-animals/modding-the-animaldefinitions-global-table)
5. [MODDING: ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones)
6. [Animal pipeline](/pz/build-42/modding/farming-and-animals/animal-pipeline): how an animal is defined, built and shown, for modders.

Wild animals that you trap rather than farm are on [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works).

## 3. The modding pages

**Modders who add world loot, a crop or a breed have two pages here.**

- [MODDING: procedural distributions](/pz/build-42/modding/farming-and-animals/modding-procedural-distributions) is about putting seeds, produce and feed into world loot. It leans on [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot) and [How loot is rolled and when it respawns](/pz/build-42/gameplay/the-real-numbers/how-loot-is-rolled-and-respawns).
- [MODDING recipes: adding a crop / editing an animal breed](/pz/build-42/modding/farming-and-animals/modding-recipes-adding-a-crop-editing-an-animal-breed) lists the keys of a crop entry and points to the animal tables.

## 4. Which side runs it

**Crops belong to the server, foraging has a server path in multiplayer, and animals have their own pages.**

The farming system returns at once on a multiplayer client. Its clock, growth and harvest run in single player and on a dedicated server. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:1`, `media/lua/server/Farming/SFarmingSystem.lua:87-119`)] Foraging builds the spots on the server only when the game is a multiplayer one; in single player it builds them in your own game. :cite[(`media/lua/server/Foraging/forageServer.lua:1`, `media/lua/server/Foraging/forageServer.lua:295-321`, `media/lua/client/Foraging/ISForageIcon.lua:37-46`)]

The pages say which side runs each rule. When a page gives a time, it is in game time and then in real time at the default Day Length, where a game hour is 3.75 real minutes. :cite[(`zombie/SandboxOptions.java:413-423`)]

:::callout[How we know]{kind=proof}
This page is a map. The counts are from the files cited, and the side rules from the two guard lines cited. We did not run a game or a server to see the split.

Not verified: how each system runs on a listen server (a host who plays), which we did not test.
:::
