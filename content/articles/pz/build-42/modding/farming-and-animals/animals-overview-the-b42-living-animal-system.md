---
id: build-42-animals-overview-the-b42-living-animal-system
slug: animals-overview-the-b42-living-animal-system
title: 'Animals overview: the B42 living-animal system'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - husbandry
  - animals
excerpt: >-
  The 42.22 animal system in one page: the 10 species, what an animal tracks each game hour, breeding and pens, zombies, the info panel by Animal Care level, 14 sandbox options, and which side runs it.
last_updated: '2026-11-21'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - animal-pipeline
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players keeping animals](#2-what-an-animal-needs) | [server owners](#6-sandbox-settings-and-which-side-runs-it) | [modders](#1-the-ten-species)

Outcast, the animals in Build 42 are living things that get hungry, breed, grow old and die while you are away. This page is the map: which animals exist, what they track, what the game does about zombies, what the info panel shows at each Animal Care level, and which machine does the work in multiplayer.

:::callout[The 1-minute version]{kind=key}
- There are 10 species in Lua: chicken, cow, deer, mouse, pig, rabbit, raccoon, rat, sheep and turkey. Five are domestic (chicken, cow, pig, sheep, turkey); deer, mouse, rabbit, raccoon and rat are marked wild. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:186`, `media/lua/shared/Definitions/animal/DeerDefinitions.lua:123`)]
- Hunger, thirst and health change once each game hour (3.75 real minutes at the default Day Length), and age, weight and pregnancy advance once each game day (90 real minutes), and only in single player and on the server. A multiplayer client only receives the numbers. :cite[(`zombie/characters/animals/datas/AnimalData.java:143-172`, `zombie/characters/animals/IsoAnimal.java:426-444`)]
- A pen smaller than the animal's minimum slows weight and size gain by a factor of 8. :cite[(`zombie/characters/animals/datas/AnimalData.java:236-239`, `zombie/characters/animals/datas/AnimalData.java:428-431`)]
- Animals flee zombies unless a species turns that off. The sandbox option "Animals Attract Zombies" makes their calls draw zombies; it is off in the Java default and on in three presets. :cite[(`zombie/characters/animals/AnimalDefinitions.java:64`, `zombie/characters/animals/AnimalSoundState.java:87-91`)]
- The Animal Care level decides how much the info panel tells you. Level 5 shows weight and the mating season. :cite[(`media/lua/client/ISUI/Animal/ISAnimalUI.lua:102`, `media/lua/client/ISUI/Animal/ISAnimalUI.lua:161`)]
:::

:::facts
- **Species** 10, with 30 animal types and 21 breeds :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:18-139`)]
- **Domestic types** 15 of the 30; the other 15 are wild :cite[(`media/lua/shared/Definitions/animal/DeerDefinitions.lua:123`)]
- **Sandbox options** 14 under Livestock :cite[(`zombie/SandboxOptions.java:206-220`)]
- **One game hour** 3.75 real minutes at the default Day Length of 90 minutes :cite[(`zombie/SandboxOptions.java:71`, `zombie/SandboxOptions.java:413-423`)]
- **Pen size** counted in squares of all connected animal zones :cite[(`zombie/iso/areas/DesignationZoneAnimal.java:507-517`)]
:::

## 1. The ten species

**Each species is one Lua file that defines three animal types: a young one, a female and a male.**

The files are chicken, cow, deer, mouse, pig, rabbit, raccoon, rat, sheep and turkey. Each fills the `stages`, `genome`, `breeds` and `animals` tables for its species. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:4`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:23`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:42`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:109`)] The dead animals that foraging finds, such as a squirrel or a bird, are items. There is no live squirrel or bird definition, and none for the garter snake, bear or elk the older page listed. :cite[(`media/lua/shared/Foraging/Categories/DeadAnimals.lua:7`, `media/lua/shared/Foraging/Categories/DeadAnimals.lua:34`)]

| Species | Types (young, female, male) | Kind | Breeds | Young stage lasts (days) | Pregnancy (days) | Young per birth | Mating months | Code |
|---|---|---|---|---|---|---|---|---|
| chicken | chick, hen, cockerel | domestic | rhodeisland, leghorn | 126 | lays 1 egg a day | - | all year | `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:8`, `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:135-198` |
| cow | cowcalf, cow, bull | domestic | angus, simmental, holstein | 180 | 280 | 1 | all year | `media/lua/shared/Definitions/animal/CowDefinitions.lua:8`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:178-247` |
| pig | piglet, sow, boar | domestic | landrace, largeblack | 140 | 120 | 5 to 10 | September to January | `media/lua/shared/Definitions/animal/PigDefinitions.lua:8`, `media/lua/shared/Definitions/animal/PigDefinitions.lua:151-221` |
| sheep | lamb, ewe, ram | domestic | suffolk, rambouillet, friesian | 180 | 147 | 1 | September to January | `media/lua/shared/Definitions/animal/SheepDefinitions.lua:8`, `media/lua/shared/Definitions/animal/SheepDefinitions.lua:207-279` |
| turkey | turkeypoult, turkeyhen, gobblers | domestic | meleagris | 126 | lays 1 egg a day | - | all year | `media/lua/shared/Definitions/animal/TurkeyDefinitions.lua:8`, `media/lua/shared/Definitions/animal/TurkeyDefinitions.lua:118-184` |
| rabbit | rabkitten, rabdoe, rabbuck | wild | swamp, appalachian, cottontail | 120 | 43 | 3 to 7 | all year | `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:8`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:158-211` |
| deer | fawn, doe, buck | wild | whitetailed | 60 | 1, raised to 8 by the code | 1 | all year | `media/lua/shared/Definitions/animal/DeerDefinitions.lua:8`, `media/lua/shared/Definitions/animal/DeerDefinitions.lua:95-139` |
| mouse | mousepups, mousefemale, mouse | wild | golden, deer, white | 60 | 20 | 5 to 9 | all year | `media/lua/shared/Definitions/animal/MouseDefinitions.lua:8`, `media/lua/shared/Definitions/animal/MouseDefinitions.lua:137-194` |
| rat | ratbaby, ratfemale, rat | wild | grey, white | 60 | 23 | 2 to 10 | all year | `media/lua/shared/Definitions/animal/RatDefinitions.lua:7`, `media/lua/shared/Definitions/animal/RatDefinitions.lua:124-184` |
| raccoon | raccoonkit, raccoonsow, raccoonboar | wild | grey | 60 | 35 | 1 | all year | `media/lua/shared/Definitions/animal/RaccoonDefinitions.lua:9`, `media/lua/shared/Definitions/animal/RaccoonDefinitions.lua:107-161` |

The young-stage and age numbers are days of age: at the Java default aging option (3) one game day adds 5, so the cow calf's 180 is about 36 game days. The pregnancy number is in game days at the Normal option and is never below 8; the Java default option (2) makes it 0.2 times as long, so a cow's 280 becomes 56 unless a preset sets 4. :cite[(`zombie/SandboxOptions.java:209-210`)] :cite[(`zombie/characters/animals/datas/AnimalData.java:661-678`)] The mating months are the `matingPeriodStart` and `matingPeriodEnd` of the female: pigs and sheep use 9 and 2, which is the months from September through January, and a species without them mates all year. :cite[(`media/lua/shared/Definitions/animal/PigDefinitions.lua:199-200`, `media/lua/shared/Definitions/animal/SheepDefinitions.lua:259-260`, `zombie/characters/animals/IsoAnimal.java:2860-2873`)] The sandbox option Breeding Season can turn the months off. :cite[(`zombie/characters/animals/IsoAnimal.java:2865-2867`)]

## 2. What an animal needs

**A domestic animal needs food, water, room and calm, and it loses health when it goes hungry or thirsty.**

Once per game hour, a non-wild animal gains hunger and thirst. The amount is the species' `hungerMultiplier` or `thirstMultiplier`, times (2 minus the animal's `hungerResistance` or `thirstResistance` gene value), times the sandbox speed setting, and halved while it sits in a hutch or is sitting. :cite[(`zombie/characters/animals/datas/AnimalData.java:348-372`, `zombie/characters/animals/datas/AnimalData.java:680-708`)] The numbers run from 0 to 1. When hunger or thirst reaches the species' `thirstHungerTrigger` (0.1 unless set; the cow sets 0.3) the animal goes to look for food or water. :cite[(`zombie/characters/animals/AnimalDefinitions.java:114`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:851-854`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:1035-1036`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:234`)]

Above 0.8 in either, health falls each hour by `healthLossMultiplier` times (1.5 minus the `resistance` gene value) divided by 3, and a geriatric animal loses health even when fed. :cite[(`zombie/characters/animals/datas/AnimalData.java:378-399`, `zombie/characters/animals/datas/AnimalData.java:473-491`)] The animal dies when its health is 0 or less. :cite[(`zombie/characters/IsoGameCharacter.java:4955-4957`)]

:::callout[A worked example, by arithmetic]{kind=design}
A cow with a `thirstResistance` of 0.4, which is the middle of the default gene range, that is never watered gains 0.0065 x 1.6 = 0.0104 thirst per hour. It looks for water at 0.3, after about 29 game hours (1.2 days, about 1.8 real hours at the default Day Length). It starts losing health at 0.8, after about 77 game hours (3.2 days, about 4.8 real hours). Hunger is slower: with a `hungerResistance` of 0.4 it gains 0.0035 x 1.6 = 0.0056 per hour and passes 0.8 after about 143 game hours (6 days), so thirst comes first. 

With a `resistance` of 0.4 and the cow's `healthLossMultiplier` of 0.01, it then loses 0.01 x 1.1 / 3 = 0.0037 health per hour, so a full-health cow that stays unwatered dies about 270 game hours after that (11 days, about 17 real hours), which is 14.5 game days in all (about 22 real hours). These are the code's formulas with those gene values; real animals vary. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:209-210`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:216`, `zombie/characters/animals/AnimalGenomeDefinitions.java:22-23`)]
:::

Other needs and rules, each from the code:

- **Room.** Each hour the game compares the number of squares in the animal's connected pens with its species' `minEnclosureSize`, and a smaller pen sets `smallEnclosure`, which divides weight and size gain by 8. :cite[(`zombie/characters/animals/datas/AnimalData.java:428-431`, `zombie/characters/animals/datas/AnimalData.java:236-239`)]
- **Food.** `eatTypeTrough` lists the item tags an animal takes from a feeding trough; `eatGrass` lets it graze on grass floors. We found no rule that grazing makes an animal smaller, which the older page claimed. :cite[(`zombie/characters/animals/AnimalDefinitions.java:584-586`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:1121-1126`)]
- **Milk.** An animal with an udder gains milk every hour once it can have milk, and it stops being able to after 21 game days without a pregnancy or young. :cite[(`zombie/characters/animals/datas/AnimalData.java:103`, `zombie/characters/animals/datas/AnimalData.java:448-465`)] Milk above 115 percent of the ceiling hurts its health. :cite[(`zombie/characters/animals/datas/AnimalData.java:374-376`)]
- **Stress.** A pregnant animal with stress above 80 loses the pregnancy with a 1 in 50 chance on every check, and the check runs on every update of the animal. Above 40 it gives less milk and wool. :cite[(`zombie/characters/animals/datas/AnimalData.java:186-193`, `zombie/characters/animals/datas/AnimalData.java:520-560`)]
- **Old age.** An animal is geriatric when its days survived pass 0.8 times its age limit minus its `minAge`. A "geriatric percentage" runs from 0 at 70 percent of the limit to 1 at the limit, and once it reaches 0.95 the animal loses 0.1 health every hour. :cite[(`zombie/characters/animals/IsoAnimal.java:1981-1988`, `zombie/characters/animals/datas/AnimalData.java:467-471`)] The limit is the species' `maxAgeGeriatric` in days times a gene factor, for example 4,320 days for a cow. :cite[(`zombie/characters/animals/datas/AnimalData.java:1714-1732`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:199`)]

## 3. Breeding, young and pens

**A female becomes pregnant when a male in the same connected pen mates with her, and the roll depends on both animals' fertility.**

Each hour a male looks through the animals of the pens connected to his, and any female of his `mate` type that `canBePregnant` is a candidate. :cite[(`zombie/characters/animals/datas/AnimalData.java:1336-1358`)] A female can be pregnant when she is in the mating season, is not geriatric, is old enough, is not already pregnant and has waited out the species' `timeBeforeNextPregnancy`. :cite[(`zombie/characters/animals/datas/AnimalData.java:1297-1322`)] The roll is the product of the two fertility values, each reduced by age. :cite[(`zombie/characters/animals/IsoAnimal.java:2135-2172`)] Egg layers become fertilized instead of pregnant. :cite[(`zombie/characters/animals/IsoAnimal.java:2181-2188`)]

When the pregnancy time is up, the mother gives birth to a number of young between `minBaby` and `maxBaby` (set with `babyNbr`), and none if her health is under 0.5: the code multiplies the number by the whole-number part of her health, which is 0 there. We read this and did not test it. :cite[(`zombie/characters/animals/datas/AnimalData.java:186-212`, `zombie/characters/animals/AnimalDefinitions.java:616-620`)] A young animal grows into its next stage when its days survived reach the stage length, and the game replaces it with a new animal of the new type that keeps its name, genes and stats. :cite[(`zombie/characters/animals/datas/AnimalData.java:125-141`, `zombie/characters/animals/datas/AnimalData.java:1388-1407`)] Genes and weight are on [Animal genetics, breeds, and weight](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight).

Animals leave the loaded area and are kept as "virtual" animals, and when they come back the hours they missed are replayed with the sandbox "Meta Stats Reduction Speed". :cite[(`zombie/iso/IsoMovingObject.java:874-880`, `zombie/characters/animals/datas/AnimalData.java:363-366`, `zombie/characters/animals/datas/AnimalData.java:710-719`)] Where the map first puts animals is on [ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones).

## 4. Animals and zombies

**Animals run from zombies, and their noise can draw zombies when the sandbox option is on.**

A species flees zombies it spots unless its `fleeZombies` is turned off, and the default is true. :cite[(`zombie/characters/animals/AnimalDefinitions.java:64`, `zombie/characters/animals/AnimalDefinitions.java:476-478`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:1452-1457`)] The `craven` disorder makes an animal flee regardless. :cite[(`zombie/characters/animals/behavior/BaseAnimalBehavior.java:1420`)] A zombie whose attack lands on an animal target drops that target. :cite[(`zombie/ai/states/AttackState.java:210-211`)]

When an animal makes a sound and "Animals Attract Zombies" is enabled, and the species has an `idleSoundRadius` and `idleSoundVolume` above 0, the game also makes a world sound of that size. :cite[(`zombie/characters/animals/AnimalSoundState.java:87-91`)] Cows set a radius of 50 and a volume of 30. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:243-244`)] We found no infection code in the animal package, so the older claim that the virus cannot infect animals is read as "nothing in `zombie/characters/animals` mentions it", not as a tested rule.

## 5. The info panel and Animal Care

**The Animal Care level decides which rows the info panel shows and how exact the words are.**

| Animal Care level | What the panel adds | Code |
|---|---|---|
| any | Age, health, appearance (hunger and thirst), stress, with coarse words | `media/lua/client/ISUI/Animal/ISAnimalUI.lua:85-96`, `media/lua/client/ISUI/Animal/ISAnimalUI.lua:186` |
| 3 and up | Whether a female is pregnant or fertilized | `media/lua/client/ISUI/Animal/ISAnimalUI.lua:138-157` |
| 4 and up | Clutch size and whether it is the laying period; exact stress words; the baby or juvenile label | `media/lua/client/ISUI/Animal/ISAnimalUI.lua:118-135`, `zombie/characters/animals/IsoAnimal.java:2015-2017`, `zombie/characters/animals/IsoAnimal.java:2537-2542` |
| 5 and up | Weight, the mating season, and exact health words (healthy, off color, sickly, dying) | `media/lua/client/ISUI/Animal/ISAnimalUI.lua:102-114`, `media/lua/client/ISUI/Animal/ISAnimalUI.lua:161`, `zombie/characters/animals/IsoAnimal.java:2053-2078` |

The panel reads the `Husbandry` perk level of the player. :cite[(`media/lua/client/ISUI/Animal/ISAnimalUI.lua:627`)] The "Animal Info" menu entry is a normal option. For a wild animal it is unavailable, with the tooltip that the animal is wild, unless cheat mode is enabled. :cite[(`media/lua/client/ISUI/Animal/ISAnimalContextMenu.lua:152-158`, `media/lua/client/ISUI/Animal/ISAnimalContextMenu.lua:166-172`)]

The panel does not show genes. The genome panel is under the Debug menu. :cite[(`media/lua/client/ISUI/Animal/ISAnimalContextMenu.lua:327-371`)]

## 6. Sandbox settings and which side runs it

**The server, or single player, runs every animal rule; a multiplayer client only draws what it is sent.**

The animal sandbox options sit under Livestock. The multipliers behind the 1 to 6 scale are: for hunger and thirst, 1 is 4 times faster and 6 is 0.2 times; for pregnancy time, 1 is 0.01 times as long and 6 is 3 times; for aging, 1 adds 90 days of age per game day, 2 adds 10, 3 adds 5 (the Java default) and 4 to 6 add 1; for milk and wool, 1 is 30 times faster. :cite[(`zombie/characters/animals/datas/AnimalData.java:214-223`, `zombie/characters/animals/datas/AnimalData.java:639-678`, `zombie/characters/animals/datas/AnimalData.java:710-730`)]

| Option | Java default | Apocalypse | Extinction | Outbreak | Rising |
|---|---|---|---|---|---|
| `AnimalStatsModifier` | 4 | 4 | 4 | 4 | 4 |
| `AnimalMetaStatsModifier` | 4 | 4 | 4 | 4 | 4 |
| `AnimalPregnancyTime` | 2 | 4 | 4 | 3 | 3 |
| `AnimalAgeModifier` | 3 | 4 | 4 | 3 | 4 |
| `AnimalMilkIncModifier` | 3 | 4 | 4 | 3 | 4 |
| `AnimalWoolIncModifier` | 3 | 4 | 4 | 3 | 4 |
| `AnimalRanchChance` | 7 | 5 | 4 | 6 | 6 |
| `AnimalGrassRegrowTime` (hours) | 240 | 240 | 240 | 240 | 240 |
| `AnimalMetaPredator` | off | off | on | off | off |
| `AnimalMatingSeason` | on | on | on | off | on |
| `AnimalEggHatch` | 3 | 4 | 4 | 3 | 4 |
| `AnimalSoundAttractZombies` | off | on | on | on | off |
| `AnimalTrackChance` | 4 | 4 | 4 | 5 | 4 |
| `AnimalPathChance` | 4 | 4 | 4 | 4 | 4 |

The Java defaults are from the options list and the presets from the four preset files; the SixMonthsLater preset and the base file set none of them, so those games get the Java defaults. :cite[(`zombie/SandboxOptions.java:206-220`, `media/lua/shared/Sandbox/Apocalypse.lua:130-143`, `media/lua/shared/Sandbox/Extinction.lua:130-143`, `media/lua/shared/Sandbox/Outbreak.lua:130-143`, `media/lua/shared/Sandbox/Rising.lua:130-143`)] The meta-predator option is about a fox that may attack chickens if the hutch door is left open at night. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:933-934`)]

Which side runs what, as read:

- **Single player and the dedicated server** run the animal's behavior and data update: hunger, growth, mating, pregnancy, milk, health and death. :cite[(`zombie/characters/animals/IsoAnimal.java:426-444`)]
- **A multiplayer client** runs only the movement and drawing part, and receives age, milk, wool, weight, stress, health, thirst and hunger in the animal packet. :cite[(`zombie/characters/animals/IsoAnimal.java:428-441`, `zombie/network/packets/character/AnimalPacket.java:60-76`)]
- **Ranch spawns and butchering items** are made on the server or in single player. :cite[(`zombie/iso/IsoChunk.java:3726-3729`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:61`)]
- **Player actions on animals** travel as the `AnimalCommand` packet from the server to nearby players. The one client-to-server animal command a normal player uses is the rename in the Animal Info panel, `sendClientCommandV(player, "animal", "rename", "id", ..., "text", ...)`, which the server accepts for text of up to 30 characters with no `AnimalCheats` check. The other 31 of the 32 `animal` client commands check that capability, and the genome edit is a debug tool that the server only relays. So the code offers a mod no client command to change an animal's hunger, health or genes for an ordinary player: such a change has to be made in server-side Lua, as the vanilla timed actions do in their `complete` step. :cite[(`media/lua/client/ISUI/Animal/ISAnimalUI.lua:476`, `media/lua/server/ClientCommands.lua:1102-1122`, `zombie/network/packets/character/AnimalCommandPacket.java:264-275`)] :cite[(`zombie/Lua/LuaManager.java:3601-3633`, `zombie/Lua/LuaManager.java:3195-3203`, `media/lua/server/ClientCommands.lua:803-1102`)] This is the answer to "does husbandry work in multiplayer": it does, with the server doing the work. We read it; we did not run a server. See [who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what) and the [saves](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved) page for where animals are stored.

:::callout[How we know]{kind=proof}
Everything is read from the 42.22 Java and Lua cited. The 3.75-minute game hour assumes the default Day Length of 90 minutes (option value 4); the worked example is arithmetic on the code, not a measurement. We did not run a game or a server.

Not verified: how the hourly update behaves when the game speed is raised (an option exists to blunt it for animals); the exact order of the hook steps in the UI; whether the debug and cheat paths reach players on a server; that animals cannot be infected.

Changed since the older page: "squirrel and bird" are found items only; the planned animals (garter snake, bear, elk) are not in the files; "grazing makes animals smaller" is not in the code; "zombies will not attack animals unless a sandbox option is set" is replaced by what the code does; the info panel is not skill-gated as one thing but row by row; "husbandry animals: cow, sheep, pig, chicken" now includes the turkey, and the rabbit is wild in the files. The 42.21 to 42.22 delta changed `RabbitDefinitions.lua` (a doe's `udder` was `20`, which reads as false, and is now `true`), `AnimalData`, `IsoAnimal` and `DesignationZoneAnimal`.
:::
