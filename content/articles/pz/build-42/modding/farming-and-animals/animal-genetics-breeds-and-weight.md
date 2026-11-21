---
id: build-42-animal-genetics-breeds-and-weight
slug: animal-genetics-breeds-and-weight
title: 'Animal genetics, breeds, and weight'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - husbandry
  - genetics
excerpt: >-
  How 42.22 gives each animal two alleles per gene, passes them on, applies 28 disorders, and turns genes into size, weight and growth time. Includes every species' weight range.
last_updated: '2026-11-21'
related_articles:
  - animals-overview-the-b42-living-animal-system
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players breeding animals](#1-what-a-gene-is) | [modders editing genes and weights](#5-weight-and-size)

Outcast, every farm animal carries a hidden set of numbers that decide how big it grows, how much milk it gives and how long it lives. You cannot read them in play without the debug panel, but they decide what a calf of your best cow and your best bull will be.

:::callout[The 1-minute version]{kind=key}
- Each gene has two alleles. One allele is "used"; the other is carried. A dominant allele is used over a recessive one. :cite[(`zombie/characters/animals/AnimalGene.java:121-144`)]
- A calf gets one random allele from its mother and one from its father, then each allele may mutate. :cite[(`zombie/characters/animals/AnimalGene.java:201-241`, `zombie/characters/animals/AnimalGene.java:268-292`)]
- A genetic disorder is active only when both alleles of that gene carry the same disorder. :cite[(`zombie/characters/animals/AnimalGene.java:257-266`)]
- We found no inbreeding rule in the code. Related animals share alleles, so they are more likely to pass the same disorder twice, but nothing checks how related two animals are. :cite[(`zombie/characters/animals/AnimalGene.java:201-266`)]
- Weight and size are the stage's base numbers multiplied by a gene value. Growth is slower by a factor of 8 in a pen below the animal's minimum size. :cite[(`zombie/characters/animals/datas/AnimalData.java:234-242`, `zombie/characters/animals/datas/AnimalData.java:428-431`, `zombie/characters/animals/datas/AnimalData.java:1770-1796`)]
- Genes run on single player and on the server. A multiplayer client only receives the results. :cite[(`zombie/characters/animals/IsoAnimal.java:426-444`)]
:::

:::facts
- **Genes defined** 18 :cite[(`media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:9-53`)]
- **Genetic disorders defined** 28: 26 harmful and 2 helpful :cite[(`media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:60-88`)]
- **Default gene range** 0.2 to 0.6 :cite[(`zombie/characters/animals/AnimalGenomeDefinitions.java:22-23`)]
- **Mutation per allele** 11 in 100 for +/-0.05, 6 in 100 for +0.2, 6 in 100 to flip dominance, 3 in 100 for a new disorder :cite[(`zombie/characters/animals/AnimalGene.java:268-287`)]
- **Pen too small** weight and size gain divided by 8 :cite[(`zombie/characters/animals/datas/AnimalData.java:236-239`)]
:::

## 1. What a gene is

**A gene is a named number with two copies, called alleles, and only one copy is used at a time.**

The 18 genes are `maxSize`, `maxWeight`, `meatRatio`, `ageToGrow`, `lifeExpectancy`, `maxMilk`, `milkInc`, `maxWool`, `woolInc`, `resistance`, `strength`, `hungerResistance`, `thirstResistance`, `aggressiveness`, `fertility`, `eggSize`, `eggClutch` and `stress`. :cite[(`media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:9-53`)] A species gets only the genes its own definition lists, and the engine writes a debug line when code asks an animal for a gene it does not have. :cite[(`zombie/characters/animals/AnimalGene.java:54-106`, `zombie/characters/animals/IsoAnimal.java:2323-2332`)]

An allele holds a name, a value, a dominant flag, a used flag and an optional disorder name. :cite[(`zombie/characters/animals/AnimalAllele.java:16-22`)] The value of a new allele comes from the gene's range, which is 0.2 to 0.6 unless the genome file sets another. :cite[(`zombie/characters/animals/AnimalGenomeDefinitions.java:22-23`, `zombie/characters/animals/AnimalGene.java:93-100`)]

### What each gene changes

**Seventeen of the 18 genes feed a rule in the code, and `aggressiveness` feeds none we could find.**

| Gene | What the code does with the used allele's value `v` | Range in the genome file | Code |
|---|---|---|---|
| `maxSize` | Multiplies the minimum and maximum body size. | 0.85 to 0.95, never re-rolled | `zombie/characters/animals/datas/AnimalData.java:1734-1768` |
| `maxWeight` | Multiplies the minimum and maximum weight. | 0.5 to 0.8 | `zombie/characters/animals/datas/AnimalData.java:1770-1796` |
| `meatRatio` | Scales the number and nutrition of meat items at butchering. | 0.8 to 1 | `media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:244-254` |
| `ageToGrow` | A stage lasts its listed days times (1.25 - v/4). The same factor scales the age needed to have young. | 0.5 to 0.8, never re-rolled | `zombie/characters/animals/datas/AnimalGrowStage.java:14-24`, `zombie/characters/animals/IsoAnimal.java:2876-2886` |
| `lifeExpectancy` | The old-age limit is its listed days times (1.25 - v/4). | 0.5 to 0.8 | `zombie/characters/animals/datas/AnimalData.java:1714-1732` |
| `maxMilk` | Multiplies the species' `maxMilk` and `minMilk`. | default 0.2 to 0.6, breeds force their own | `zombie/characters/animals/datas/AnimalData.java:493-518` |
| `milkInc` | Milk gained per hour is one twentieth of the milk ceiling times `v`, slowed by stress and the sandbox option. | default | `zombie/characters/animals/datas/AnimalData.java:520-539` |
| `maxWool` | Multiplies the species' `maxWool`. | 0.5 to 0.8, never re-rolled | `zombie/characters/animals/datas/AnimalData.java:506-513` |
| `woolInc` | Wool gained per hour is the wool ceiling divided by 2,400, times `v`, stress and the sandbox option. | default | `zombie/characters/animals/datas/AnimalData.java:541-560` |
| `resistance` | Health lost to hunger, thirst, age and wounds is multiplied by (1.5 - v). | default | `zombie/characters/animals/datas/AnimalData.java:473-491` |
| `strength` | Multiplies the damage the animal does. | default | `zombie/characters/animals/IsoAnimal.java:826-838` |
| `hungerResistance` | Hunger gained per hour is multiplied by (2 - v). | default | `zombie/characters/animals/datas/AnimalData.java:695-708` |
| `thirstResistance` | Thirst gained per hour is multiplied by (2 - v). | default | `zombie/characters/animals/datas/AnimalData.java:680-693` |
| `fertility` | Mating success is the male's value times the female's value times 100 percent, each reduced by age. | 0.75 to 0.95 | `zombie/characters/animals/IsoAnimal.java:2135-2170` |
| `eggSize` | Scales the egg an animal lays. | default | `zombie/characters/animals/IsoAnimal.java:2402-2412` |
| `eggClutch` | Clutch size is the species' `maxClutchSize` times `v`. | 0.65 to 0.95 | `zombie/characters/animals/datas/AnimalData.java:562-570` |
| `stress` | Sets the starting stress, which rises with world age for adults. | default | `zombie/characters/animals/IsoAnimal.java:1529-1548` |
| `aggressiveness` | No reader found in the Java or Lua code. | default | `media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:44` |

The ranges are from the genome file. :cite[(`media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:9-53`)] The seventeen readers are the `getUsedGene` calls we counted across `zombie/characters`, `zombie/ai`, `zombie/iso/objects` and the vanilla Lua. The one call in Lua is for `meatRatio`. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`)]

## 2. How a new animal gets its genes

**A newly created animal rolls two alleles per gene, and a breed can force a gene into a range.**

Each new allele also runs the mutation roll below once. :cite[(`zombie/characters/animals/AnimalGene.java:180`)] For each gene in the species' list the engine creates two alleles with a random value in the range. Unless the gene is marked as forced, 15 in 100 alleles instead take any value from 0 to 1. :cite[(`zombie/characters/animals/AnimalGene.java:84-100`, `zombie/characters/animals/AnimalGene.java:146-157`)] Then it decides whether each allele is dominant. The farther the value is from 0.5, the more likely the allele is recessive:

| Distance from 0.5 | Chance recessive (in 100) | Chance dominant (in 100) |
|---|---|---|
| 0.1 or less | 31 | 69 |
| over 0.1 | 41 | 59 |
| over 0.15 | 51 | 49 |
| over 0.2 | 61 | 39 |
| over 0.3 | 76 | 24 |
| over 0.4 | 81 | 19 |
| over 0.45 | 91 | 9 |

The code tests a 0 to 99 roll against a limit of 30, 40, 50, 60, 75, 80 or 90, and the allele is dominant when the roll is above the limit, so the dominant chance is 99 minus the limit and the recessive chance is the limit plus 1. :cite[(`zombie/characters/animals/AnimalGene.java:159-175`)]

A breed's `forcedGenes` run first. Each forced gene gets two dominant alleles with a value inside the breed's `minValue` and `maxValue`. :cite[(`zombie/characters/animals/AnimalGene.java:57-82`)] This is how the Angus cow gets a low `maxMilk` and a high `meatRatio` while the Holstein gets the opposite. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:29-38`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:79-88`)]

Which allele is used: a dominant one beats a recessive one, and when both are dominant or both recessive the game picks one at random. :cite[(`zombie/characters/animals/AnimalGene.java:121-144`)]

## 3. How a calf inherits

**A calf takes one random allele from each parent, then each allele may mutate.**

For every gene, the mother's random allele becomes the calf's first allele and the father's random allele becomes its second. If a parent's genome is missing, the other parent's is used in its place. :cite[(`zombie/characters/animals/AnimalGene.java:201-234`)] Then each of the calf's alleles is mutated and the used allele is chosen again. :cite[(`zombie/characters/animals/AnimalGene.java:236-241`)] A fertilized female remembers the male's genome until she gives birth. :cite[(`zombie/characters/animals/IsoAnimal.java:2175-2179`, `zombie/characters/animals/IsoAnimal.java:1621-1629`)]

Each roll below is a number from 0 to 99 tested with "at or below", so a limit of 10 means 11 in 100. :cite[(`zombie/characters/animals/AnimalGene.java:268-292`)]

| Mutation | Chance per allele | Effect |
|---|---|---|
| Small step | 11 in 100 | Value changes by 0.05 up or down. |
| Jump | 6 in 100 | Value rises by 0.2. |
| Flip | 6 in 100 | Dominant becomes recessive, or the reverse. |
| New disorder | 3 in 100, only if none | A random disorder from the list is added. |
| Cure | 3 in 100 | The disorder is removed. |
| Floor | always | A value never drops below 0.05. |

A gene's recessive disorder can come back by chance, but the game never looks at how related two animals are. A search of `src` and the Lua found no inbreeding counter, penalty or check. This settles the older "inbreeding risk" claim: the risk is real only in the sense that relatives share alleles. :cite[(`zombie/characters/animals/AnimalGene.java:257-266`)]

## 4. Genetic disorders

**A disorder named on both alleles of a gene turns on for the animal; 18 of the 28 have a check we could find and 10 do not.**

The animal's disorder list is rebuilt from its genes: a disorder counts when both alleles of one gene carry the same name. :cite[(`zombie/characters/animals/AnimalGene.java:257-266`)] There are 28 disorder names, 26 harmful and 2 helpful (`fertile` and `strong`). :cite[(`media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:60-88`)]

The 18 we found a check for, with what the code does:

| Disorder | What the code does | Code |
|---|---|---|
| `gluttonous` | Hunger gained per hour times 10. | `zombie/characters/animals/datas/AnimalData.java:702-704` |
| `highThirst` | Thirst gained per hour times 10. | `zombie/characters/animals/datas/AnimalData.java:687-689` |
| `fidget` | The time between wander moves is divided by 10. | `zombie/characters/animals/behavior/BaseAnimalBehavior.java:308` |
| `craven` | The animal flees what it spots, skipping the checks that let a calm animal stay. | `zombie/characters/animals/behavior/BaseAnimalBehavior.java:1420-1424`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:1452-1457` |
| `highStress` | A fall in stress is multiplied by 10 and a rise is divided by 10, which is the opposite of the genome file's description. | `zombie/characters/animals/IsoAnimal.java:2388-2394` |
| `sterile` | Fertility counts as 0. | `zombie/characters/animals/IsoAnimal.java:2146-2147` |
| `fertile` | Fertility counts as 100. | `zombie/characters/animals/IsoAnimal.java:2142-2144` |
| `poorFertility` | Fertility counts as 1, see the note below. | `zombie/characters/animals/IsoAnimal.java:2138-2140` |
| `dwarf` | Size divided by 1.5 (young) or 2.2 (adult), and old-age limit halved. | `zombie/characters/animals/datas/AnimalData.java:1726-1728`, `zombie/characters/animals/datas/AnimalData.java:1740-1746` |
| `skinny` | Base weight divided by 3. | `zombie/characters/animals/datas/AnimalData.java:1776-1778`, `zombie/characters/animals/datas/AnimalData.java:1790-1792` |
| `poorLife` | Old-age limit divided by 3. | `zombie/characters/animals/datas/AnimalData.java:1722-1724` |
| `dieAtBirth` | The baby is born with health 0. | `zombie/characters/animals/IsoAnimal.java:1634-1637` |
| `noMilk` | The animal cannot have milk. | `zombie/characters/animals/datas/AnimalData.java:1607-1609` |
| `poorMilk` | Milk rate times 0.2. | `zombie/characters/animals/datas/AnimalData.java:533-535` |
| `noWool` | The animal cannot grow wool. | `zombie/characters/animals/datas/AnimalData.java:1664` |
| `poorWool` | Wool rate times 0.2. | `zombie/characters/animals/datas/AnimalData.java:554-556` |
| `noEggs` | The animal lays no eggs. | `zombie/characters/animals/IsoAnimal.java:1897` |
| `smallEggs` | The egg factor is 0.1. | `zombie/characters/animals/IsoAnimal.java:2405-2407` |

The 10 with no check we could find are `bully`, `weak`, `bony`, `growSlow`, `slowWalking`, `brave`, `idiot`, `feeble`, `blind` and `strong`. We searched `zombie/characters/animals`, `zombie/ai/states/animals`, the hutch class and the animal Lua; the only Lua that lists them is the debug genome panel. :cite[(`media/lua/client/ISUI/Animal/ISAnimalGenomeUI.lua:82-93`)] The genome file describes what each should do, but as read the game does not do it. Not tested in play.

A note on `poorFertility`: the code sets the animal's fertility to 1 for it, while the fertility gene normally sits between 0.75 and 0.95. As read, that makes the "poor" disorder raise the factor, which looks like a bug; we did not test it. :cite[(`zombie/characters/animals/IsoAnimal.java:2138-2140`, `media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:41-43`)]

One more thing the genome file promises and the code does not deliver, as read: it says `maxMilk` dampens `meatRatio`, so a heavy milker gives less meat. The engine does compute a damped value for the other gene, but the only place that reads it is the debug genome panel; butchering reads the plain value. :cite[(`zombie/characters/animals/AnimalGene.java:184-199`, `media/lua/client/ISUI/Animal/ISAnimalGenomeUI.lua:154-155`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`)] A search of all Java and Lua found no other reader of that damped value.

## 5. Weight and size

**An animal's weight stays between its stage's minimum and maximum, each multiplied by the `maxWeight` gene, and it gains a slice of that range each game day.**

Each stage lists a `minWeight` and `maxWeight` in kilograms. The animal's own limits are those numbers times the used `maxWeight` allele, and for `skinny` animals the base is divided by 3 first. :cite[(`zombie/characters/animals/datas/AnimalData.java:1770-1796`)] With the default range of 0.5 to 0.8, an adult cow listed at 360 to 950 kg ends up between 180 and 760 kg. Breeds narrow it: Angus is 0.45 to 0.65, Simmental 0.5 to 0.7, Holstein 0.6 to 0.8, and the Suffolk sheep 0.55 to 0.75. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:37-38`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:56-57`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:87-88`, `media/lua/shared/Definitions/animal/SheepDefinitions.lua:52-53`)]

Once a game day the animal gains (max - min) divided by the stage length in days (after the `ageToGrow` gene), times its health from 0 to 1. A pen smaller than the type's `minEnclosureSize` sets the animal's `smallEnclosure` flag, which divides the gain by 8. :cite[(`zombie/characters/animals/datas/AnimalData.java:225-242`)] A hungry animal (hunger above 0.8) loses one eight-hundredth of its weight each game hour. :cite[(`zombie/characters/animals/datas/AnimalData.java:442-446`)] The pen size is counted every game hour: it is the number of squares in all connected animal zones. :cite[(`zombie/characters/animals/datas/AnimalData.java:428-431`, `zombie/iso/areas/DesignationZoneAnimal.java:507-517`)]

When a baby grows into the next stage, the game creates a new animal of the new type and sets its weight from the new stage's range and the animal's age, so the range does not "reset" to the minimum. :cite[(`zombie/characters/animals/datas/AnimalData.java:1388-1407`, `zombie/characters/animals/datas/AnimalData.java:1367-1371`)] The new animal keeps the old genome. :cite[(`zombie/characters/animals/datas/AnimalData.java:1405`)]

The listed values for all 30 animal types are below. A male of a farm species has no enclosure limit, so it is never slowed by a small pen. The stage entries in the `stages` table also carry weights in some species files (for example the rabbit's), but the game never reads them. :cite[(`zombie/characters/animals/AnimalDefinitions.java:807-835`)]

| Species | Stage | Sex | Min enclosure | Min weight kg | Max weight kg | Code |
|---|---|---|---|---|---|---|
| chicken | chick | baby | 20 | 0.05 | 0.2 | `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:101-123` |
| chicken | hen | female | 40 | 2 | 5 | `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:168-186` |
| chicken | cockerel | male | - | 2.5 | 6 | `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:250-251` |
| pig | piglet | baby | 20 | 15 | 110 | `media/lua/shared/Definitions/animal/PigDefinitions.lua:111-129` |
| pig | sow | female | 40 | 115 | 350 | `media/lua/shared/Definitions/animal/PigDefinitions.lua:186-205` |
| pig | boar | male | - | 115 | 350 | `media/lua/shared/Definitions/animal/PigDefinitions.lua:268-269` |
| cow | cowcalf | baby | 40 | 60 | 350 | `media/lua/shared/Definitions/animal/CowDefinitions.lua:142-152` |
| cow | cow | female | 80 | 360 | 950 | `media/lua/shared/Definitions/animal/CowDefinitions.lua:208-222` |
| cow | bull | male | - | 360 | 1300 | `media/lua/shared/Definitions/animal/CowDefinitions.lua:286-287` |
| sheep | lamb | baby | 20 | 20 | 70 | `media/lua/shared/Definitions/animal/SheepDefinitions.lua:166-188` |
| sheep | ewe | female | 40 | 60 | 120 | `media/lua/shared/Definitions/animal/SheepDefinitions.lua:239-264` |
| sheep | ram | male | - | 80 | 200 | `media/lua/shared/Definitions/animal/SheepDefinitions.lua:331-332` |
| turkey | turkeypoult | baby | 20 | 0.05 | 0.3 | `media/lua/shared/Definitions/animal/TurkeyDefinitions.lua:82-102` |
| turkey | turkeyhen | female | 40 | 4 | 9 | `media/lua/shared/Definitions/animal/TurkeyDefinitions.lua:156-171` |
| turkey | gobblers | male | - | 8 | 12 | `media/lua/shared/Definitions/animal/TurkeyDefinitions.lua:232-233` |
| rabbit | rabkitten | baby | - | 1 | 2 | `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:146-147` |
| rabbit | rabdoe | female | - | 2 | 7 | `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:199-200` |
| rabbit | rabbuck | male | - | 2 | 7 | `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:248-249` |
| deer | fawn | baby | - | 15 | 100 | `media/lua/shared/Definitions/animal/DeerDefinitions.lua:89-90` |
| deer | doe | female | - | 110 | 200 | `media/lua/shared/Definitions/animal/DeerDefinitions.lua:134-135` |
| deer | buck | male | - | 110 | 200 | `media/lua/shared/Definitions/animal/DeerDefinitions.lua:178-179` |
| mouse | mousepups | baby | 20 | 0.02 | 0.08 | `media/lua/shared/Definitions/animal/MouseDefinitions.lua:115-122` |
| mouse | mousefemale | female | 20 | 0.05 | 0.1 | `media/lua/shared/Definitions/animal/MouseDefinitions.lua:172-179` |
| mouse | mouse | male | 20 | 0.08 | 0.12 | `media/lua/shared/Definitions/animal/MouseDefinitions.lua:228-235` |
| rat | ratbaby | baby | 20 | 0.1 | 0.3 | `media/lua/shared/Definitions/animal/RatDefinitions.lua:100-107` |
| rat | ratfemale | female | 20 | 0.3 | 0.5 | `media/lua/shared/Definitions/animal/RatDefinitions.lua:161-168` |
| rat | rat | male | 20 | 0.4 | 0.7 | `media/lua/shared/Definitions/animal/RatDefinitions.lua:220-227` |
| raccoon | raccoonkit | baby | 40 | 1 | 8 | `media/lua/shared/Definitions/animal/RaccoonDefinitions.lua:95-97` |
| raccoon | raccoonsow | female | 40 | 9 | 14 | `media/lua/shared/Definitions/animal/RaccoonDefinitions.lua:152-154` |
| raccoon | raccoonboar | male | 40 | 10 | 15 | `media/lua/shared/Definitions/animal/RaccoonDefinitions.lua:206-208` |

The bull's minimum comes from the cow's line, and the rabbit's buck and the raccoon's sow and boar also take their values from sister entries. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:286`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:248-249`, `media/lua/shared/Definitions/animal/RaccoonDefinitions.lua:154`)]

### Time to grow, in real time

**A stage lasts its listed days times a gene factor, counted in game days, and the sandbox age setting speeds the count.**

The listed lengths are in days: the cow calf takes 180 days (6 x 30), the chick 126 days (18 x 7), the piglet 140 days (20 x 7). :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:8`, `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:8`, `media/lua/shared/Definitions/animal/PigDefinitions.lua:8`)] The stage changes when the animal's days survived reach that length times (1.25 - v/4), so a gene value of 0.65 gives 1.0875 times the listed days. :cite[(`zombie/characters/animals/datas/AnimalData.java:125-141`, `zombie/characters/animals/datas/AnimalGrowStage.java:14-24`)]

The sandbox option Aging Modifier Speed changes how many days of age one game day adds: value 4 adds 1, value 3 adds 5, value 2 adds 10 and value 1 adds 90. :cite[(`zombie/characters/animals/datas/AnimalData.java:151-157`, `zombie/characters/animals/datas/AnimalData.java:214-223`)] The Java default is 3, the Apocalypse, Extinction and Rising presets set 4 and Outbreak sets 3. :cite[(`zombie/SandboxOptions.java:210`, `media/lua/shared/Sandbox/Apocalypse.lua:133`, `media/lua/shared/Sandbox/Outbreak.lua:133`)] At the default Day Length of 90 real minutes, a game day is 90 minutes and a game hour 3.75 minutes. :cite[(`zombie/SandboxOptions.java:71`, `zombie/SandboxOptions.java:413-423`)]

So at modifier 4 a cow calf with a gene value of 0.65 grows up after about 196 game days, which is about 294 real hours; at modifier 3 it is about 39 game days, which is about 59 real hours. Weight and size gain once per game day, not per day of age, so a fast age setting gets the animal to adulthood before its weight catches up. :cite[(`zombie/characters/animals/datas/AnimalData.java:151-166`, `zombie/characters/animals/datas/AnimalData.java:225-242`)]

## 6. Which side runs it

**Genes, growth, hunger and mating run in single player and on the server; a multiplayer client receives the results.**

An animal's `updateInternal` runs the behavior and data update only when the game is not a multiplayer client. :cite[(`zombie/characters/animals/IsoAnimal.java:426-444`)] The client gets the animal's age, milk, wool, weight, stress, health, thirst and hunger in the animal packet. :cite[(`zombie/network/packets/character/AnimalPacket.java:60-76`)] 

The only client-to-server genome message is the debug genome editor's, and the server only relays it to nearby players. The one animal command a normal player sends is the rename in the info panel, which has no `AnimalCheats` check. Other animal client commands need that capability, so a mod that must change an animal on a server does it in server-side Lua. :cite[(`media/lua/server/ClientCommands.lua:804`, `media/lua/server/ClientCommands.lua:1102-1122`)] :cite[(`zombie/Lua/LuaManager.java:3195-3203`, `zombie/network/packets/character/AnimalCommandPacket.java:264-275`)]

So husbandry does work in multiplayer, with the server as the one that rolls genes. This settles the older "husbandry works in multiplayer" question; we did not run a server. See [who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what).

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java and Lua cited. We did not run a game, so the mutation chances, the dominance table, the disorder effects and the growth times are arithmetic on the code, not measurements. The decompiler warns that subtle control flow should be checked against bytecode.

Not verified: what the 10 disorders without a check were meant to do; whether `poorFertility` is a bug; the damped meat ratio's role beyond the debug panel; how a player sees genes in play (the genome panel is under the Debug menu).

Changed since the older page: the "inbreeding risk" claim is now settled as "no rule in the code"; the table of weights now lists all 30 types from the files instead of 20 rows (the old Min enclosure column gave 40 and 80 to males, which have none); the old per-breed weight rows (Angus, Simmental, Holstein, Suffolk) are the gene ranges above, not different base weights; and the idea that weight "resets" at a new stage was replaced by the age-based start.
:::
