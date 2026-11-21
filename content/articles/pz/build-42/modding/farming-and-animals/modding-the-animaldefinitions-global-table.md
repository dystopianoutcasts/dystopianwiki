---
id: build-42-modding-the-animaldefinitions-global-table
slug: modding-the-animaldefinitions-global-table
title: 'MODDING: the AnimalDefinitions global table'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - husbandry
  - modding
excerpt: >-
  What 42.22 reads from the AnimalDefinitions Lua table: the 116 keys of an animal entry, the stage, breed, gene and sound keys, their defaults, and the traps in vanilla's own files.
last_updated: '2026-11-21'
related_articles:
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-ranch-zones
  - animal-pipeline
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders editing a vanilla animal or breed](#2-an-animal-entry) | [modders writing a new species](#7-traps-in-vanillas-own-files)

`AnimalDefinitions` is the Lua table the game turns into its animal types, and the Java reads a smaller part of it than the file layout suggests. This page lists what is actually read, with the defaults and what each key does in the code, and points to the complete working mod for a new breed.

:::callout[The 1-minute version]{kind=key}
- The Java reads one table: `AnimalDefinitions.animals`, keyed by animal type. The other three tables (`stages`, `breeds`, `genome`) are helpers that vanilla files fill and then hand to each type. :cite[(`zombie/characters/animals/AnimalDefinitions.java:183-195`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:202-204`)]
- An animal entry has 116 keys the Java recognizes, and 3 of them (`stages`, `breeds`, `genes`) are tables. A key the list does not hold, such as `modelscript`, is ignored. :cite[(`zombie/characters/animals/AnimalDefinitions.java:196-663`)]
- A breed's name is its key in the `breeds` table; a `name` field inside it is not read. A grown animal finds its new breed by that name, so every stage of a species must use the same breed names. :cite[(`zombie/characters/animals/AnimalDefinitions.java:705-712`, `zombie/characters/animals/datas/AnimalData.java:1393-1394`)]
- The gene list holds the gene names as values, so the keys do not matter. A gene with no entry in `AnimalGenomeDefinitions.genes` is skipped with a debug line. :cite[(`zombie/characters/animals/AnimalDefinitions.java:693-703`, `zombie/characters/animals/AnimalGene.java:84-92`)]
- `carcassItem` is read and then never used. :cite[(`zombie/characters/animals/AnimalDefinitions.java:236-238`)]
:::

:::facts
- **Keys in an animal entry** 116: 113 values and 3 tables :cite[(`zombie/characters/animals/AnimalDefinitions.java:196-663`)]
- **Keys in a breed** 21 :cite[(`zombie/characters/animals/AnimalDefinitions.java:718-800`)]
- **Keys in a stage** 3: `ageToGrow`, `nextStage`, `nextStageMale` :cite[(`zombie/characters/animals/AnimalDefinitions.java:820-831`)]
- **Keys in a sound entry** 5: `name`, `slot`, `priority`, `intervalMin`, `intervalMax` :cite[(`zombie/characters/animals/datas/AnimalBreed.java:79-92`)]
- **Vanilla animal entries** 30 in 10 species files :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:109-125`)]
- **Vanilla sound ids** 26 in 21 sound tables :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:315-366`)]
:::

## 1. What the engine reads

**The game builds its definitions from `AnimalDefinitions.animals` the first time it needs one, after every Lua file has run.**

The Java asks for the definitions on first use, builds a Java object for every key of `AnimalDefinitions.animals`, and stores it under that key, so the key is the animal type name. :cite[(`zombie/characters/animals/AnimalDefinitions.java:154-160`, `zombie/characters/animals/AnimalDefinitions.java:176-195`, `zombie/characters/animals/AnimalDefinitions.java:667`)] Inside an entry, the keys `stages`, `breeds` and `genes` are themselves tables, and the Java reads them there. :cite[(`zombie/characters/animals/AnimalDefinitions.java:646-656`)] That is why a vanilla file builds `AnimalDefinitions.stages["cow"]`, `AnimalDefinitions.breeds["cow"]` and `AnimalDefinitions.genome["cow"]` first, then assigns each type its `stages`, `breeds` and `genes` from them. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:5-16`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:202-204`)] The three helper tables are a vanilla habit; the Java never looks at `AnimalDefinitions.stages`, `AnimalDefinitions.breeds` or `AnimalDefinitions.genome` by those names. 

The shapes are `AnimalDefinitions.animals[stageID]` for an entry and `AnimalDefinitions.stages[animalID]`, `AnimalDefinitions.breeds[animalID]` and `AnimalDefinitions.genome[animalID]` for the helpers, with `cowcalf` as an example of a type and `cow` as an example of a species.

A separate global, `AnimalGenomeDefinitions`, defines the genes themselves and the disorders, and it is read by its own loader. :cite[(`zombie/characters/animals/AnimalGenomeDefinitions.java:25-60`)] `RanchZoneDefinitions` is another, covered on [ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones), and `AnimalPartsDefinitions` and `AnimalAvatarDefinition` are two more, covered on [butchering](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals).

## 2. An animal entry

**An entry is a flat table of 113 value keys and 3 table keys, and every key the Java does not list is ignored.**

The 116 keys, grouped by purpose, are below. All are parsed in one loop that compares each key name without regard to letter case. :cite[(`zombie/characters/animals/AnimalDefinitions.java:196-663`)] The older page said about 120 and listed three that the Java never reads (`modelscript`, `fleeHumansMod`, `luredPossibleItems`), which vanilla files set but nothing reads, and it missed six that the Java does read (`canBeTransported`, `canClimbFences`, `corpseLength`, `feedByHandAnim`, `fleeZombies`, `textureRotten`). :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:186`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:231`, `media/lua/shared/Definitions/animal/ChickenDefinitions.lua:240`)]

**Model and drawing (17)**

:::chips
- `bodyModel`
- `bodyModelSkel`
- `bodyModelSkelNoHead`
- `bodyModelHeadless`
- `bodyModelFleece`
- `textureSkeleton`
- `textureSkeletonBloody`
- `textureSkinned`
- `textureRotten`
- `animset`
- `shadoww`
- `shadowfm`
- `shadowbm`
- `collisionSize`
- `collidable`
- `corpseSize`
- `corpseLength`
:::

**Size and weight (8)**

:::chips
- `animalSize`
- `minSize`
- `maxSize`
- `minWeight`
- `maxWeight`
- `trailerBaseSize`
- `baseEncumbrance`
- `canBeTransported`
:::

**Life and breeding (18)**

:::chips
- `stages`
- `breeds`
- `genes`
- `babyType`
- `babyNbr`
- `minAge`
- `minAgeForBaby`
- `maxAgeGeriatric`
- `female`
- `male`
- `mate`
- `pregnantPeriod`
- `timeBeforeNextPregnancy`
- `needMom`
- `eatFromMother`
- `litterEatTogether`
- `matingPeriodStart`
- `matingPeriodEnd`
:::

**Food and health (13)**

:::chips
- `hungerMultiplier`
- `thirstMultiplier`
- `hungerBoost`
- `thirstBoost`
- `thirstHungerTrigger`
- `eatGrass`
- `eatTypeTrough`
- `eatingTypeNbr`
- `distToEat`
- `canBeFeedByHand`
- `feedByHandType`
- `feedByHandAnim`
- `healthLossMultiplier`
:::

**Products (19)**

:::chips
- `canBeMilked`
- `minMilk`
- `maxMilk`
- `milkAnimPreset`
- `udder`
- `maxWool`
- `eggsPerDay`
- `eggType`
- `minClutchSize`
- `maxClutchSize`
- `layEggPeriodStart`
- `fertilizedTimeMax`
- `timeToHatch`
- `dung`
- `dungChancePerDay`
- `carcassItem`
- `minBlood`
- `maxBlood`
- `minBodyPart`
:::

**Housing and movement (9)**

:::chips
- `minEnclosureSize`
- `hutches`
- `enterHutchTime`
- `exitHutchTime`
- `wanderMul`
- `canClimbStairs`
- `canClimbFences`
- `stressAboveGround`
- `stressUnderRain`
:::

**Behavior and combat (23)**

:::chips
- `alwaysFleeHumans`
- `fleeZombies`
- `wild`
- `canBeDomesticated`
- `canBeAlerted`
- `spottingDist`
- `wildFleeTimeUntilDeadTimer`
- `attackDist`
- `attackTimer`
- `attackBack`
- `attackIfStressed`
- `dontAttackOtherMale`
- `baseDmg`
- `knockdownAttack`
- `canDoLaceration`
- `canThump`
- `periodicRun`
- `turnDelta`
- `sitRandomly`
- `idleEmoteChance`
- `happyAnim`
- `idleTypeNbr`
- `sittingTypeNbr`
:::

**Handling and sound (9)**

:::chips
- `canBePet`
- `canBePicked`
- `canBeKilledWithoutWeapon`
- `canBeAttached`
- `ropeBone`
- `addTrackingXp`
- `group`
- `idleSoundRadius`
- `idleSoundVolume`
:::

The keys that matter most, with the default the Java uses when the key is absent and what the code does with it:

| Key | Default | What the code does | Code |
|---|---|---|---|
| `hungerMultiplier`, `thirstMultiplier` | 0 | Hunger and thirst gained per game hour, times a gene factor. A wild animal gains none. | `zombie/characters/animals/AnimalDefinitions.java:67-68`, `zombie/characters/animals/datas/AnimalData.java:348-372` |
| `healthLossMultiplier` | 0.05 | Base health lost per hour when starving, old or sick. | `zombie/characters/animals/AnimalDefinitions.java:69`, `zombie/characters/animals/datas/AnimalData.java:473-491` |
| `thirstHungerTrigger` | 0.1 | The hunger or thirst level at which the animal goes to eat or drink. | `zombie/characters/animals/AnimalDefinitions.java:114`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:851-854` |
| `minWeight`, `maxWeight` | 10, 100 | The weight range in kilograms before the gene factor. | `zombie/characters/animals/AnimalDefinitions.java:96-97`, `zombie/characters/animals/datas/AnimalData.java:1770-1796` |
| `minEnclosureSize` | 0 | Squares of connected pens below which weight and size gain is divided by 8. | `zombie/characters/animals/datas/AnimalData.java:428-431`, `zombie/characters/animals/datas/AnimalData.java:236-239` |
| `minSize`, `maxSize` | 0 | Body size range; the drawn size grows from `minSize` to `maxSize`, times the `maxSize` gene. | `zombie/characters/animals/datas/AnimalData.java:1734-1768` |
| `pregnantPeriod` | 0 | Pregnancy length in game days, never below 8, scaled by the sandbox option. | `zombie/characters/animals/datas/AnimalData.java:661-678` |
| `minAgeForBaby`, `maxAgeGeriatric` | 0 | Days of age before a female can have young; days of life before old age. | `zombie/characters/animals/datas/AnimalData.java:1297-1322`, `zombie/characters/animals/datas/AnimalData.java:1714-1732` |
| `babyNbr` | 1 and 1 | A string `"min,max"` for the young born. | `zombie/characters/animals/AnimalDefinitions.java:81-82`, `zombie/characters/animals/AnimalDefinitions.java:616-620` |
| `alwaysFleeHumans` | true | Vanilla sets it false for domestic animals. | `zombie/characters/animals/AnimalDefinitions.java:63` |
| `fleeZombies` | true | The animal flees zombies it spots. | `zombie/characters/animals/AnimalDefinitions.java:64`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:1452-1457` |
| `wild` | false | A wild animal skips hunger and thirst. | `zombie/characters/animals/AnimalDefinitions.java:117`, `zombie/characters/animals/datas/AnimalData.java:349` |
| `wanderMul` | 400 | The smaller it is, the more often the animal wanders; a `fidget` disorder divides the interval by 10. | `zombie/characters/animals/AnimalDefinitions.java:70`, `zombie/characters/animals/behavior/BaseAnimalBehavior.java:301-309` |
| `dungChancePerDay` | 50 | Once a day two rolls must pass for an animal in a pen to drop dung: one at or below 60, then one at or below this number. | `zombie/characters/animals/AnimalDefinitions.java:134`, `zombie/characters/animals/datas/AnimalData.java:247-306` |
| `collisionSize` | 0 | Its width is `collisionSize` times the animal's current size. | `zombie/characters/animals/IsoAnimal.java:443` |
| `trailerBaseSize` | 0 | The room the animal takes in a trailer is this times its size. | `zombie/characters/animals/IsoAnimal.java:2823` |
| `ropeBone` | `Bip01_Head` | The bone a rope attaches to. | `zombie/characters/animals/AnimalDefinitions.java:124` |
| `baseDmg` | 0.5 | Damage to a player or animal, times the `strength` gene. | `zombie/characters/animals/AnimalDefinitions.java:103`, `zombie/characters/animals/IsoAnimal.java:826-838` |
| `carcassItem` | none | Read, never used. | `zombie/characters/animals/AnimalDefinitions.java:236-238` |

Time keys are in days (written as `months * 30` and `years * 12 * 30`, as in `4 * 30` and `12 * 12 * 30`) and `hungerMultiplier` is per hour, per vanilla's own comment. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:8`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:209`)] List keys (`eatTypeTrough`, `hutches`, `feedByHandType`) are one string split at commas. :cite[(`zombie/characters/animals/AnimalDefinitions.java:584-594`)] In 42.22 the rabbit doe sets `udder = true`; in 42.21 it was `20`, which the Java reads as false. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:187`, `zombie/characters/animals/AnimalDefinitions.java:460-462`)]

From vanilla, the adult cow's entry, with the comments removed. It is the stage entry the calf and the bull copy and change: :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:177-222`)]

```lua
AnimalDefinitions.animals["cow"] = {};
AnimalDefinitions.animals["cow"].bodyModel = "CowBody";
AnimalDefinitions.animals["cow"].animset = "cow";
AnimalDefinitions.animals["cow"].babyType = "cowcalf";
AnimalDefinitions.animals["cow"].udder = true;
AnimalDefinitions.animals["cow"].female = true;
AnimalDefinitions.animals["cow"].genes = AnimalDefinitions.genome["cow"].genes;
AnimalDefinitions.animals["cow"].stages = AnimalDefinitions.stages["cow"].stages;
AnimalDefinitions.animals["cow"].breeds = AnimalDefinitions.breeds["cow"].breeds;
AnimalDefinitions.animals["cow"].pregnantPeriod = (9 * 30) + 10;
AnimalDefinitions.animals["cow"].canBeMilked = true;
AnimalDefinitions.animals["cow"].minMilk = 10;
AnimalDefinitions.animals["cow"].maxMilk = 50;
AnimalDefinitions.animals["cow"].minWeight = 360;
AnimalDefinitions.animals["cow"].maxWeight = 950;
```

The lines are vanilla's; a real entry has about 60 more. The cow sets `female = true`; the calf has no `babyType`, and the bull sets `male = true` and `mate = "cow"`, which is how a male finds the females it can mate with. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:268`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:272`, `zombie/characters/animals/datas/AnimalData.java:1336-1358`)]

## 3. Stages

**A stage entry has three keys: how long it lasts, what a female becomes and what a male becomes.**

The `stages` table of a species is keyed by animal type. Each entry may set `ageToGrow` (days), `nextStage` (the type a female becomes) and `nextStageMale` (the type a male becomes); a final stage sets no next stage. :cite[(`zombie/characters/animals/AnimalDefinitions.java:807-835`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:5-16`)] The `minWeight` and `maxWeight` that some species files also put in a stage entry (the rabbit's, for one) are never read; weights come from the animal entry. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:4-20`, `zombie/characters/animals/AnimalDefinitions.java:820-831`)] An animal counts as a baby when its type has a stage with a `nextStage`. :cite[(`zombie/characters/animals/AnimalDefinitions.java:914-932`)]

The stage length is changed by the `ageToGrow` gene and the sandbox aging option; real-time examples are on [Animal genetics, breeds, and weight](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight). You can chain more stages than vanilla's three, since the stage list is read as a list and a grown animal asks for its next type by name, but we did not build one in game. :cite[(`zombie/characters/animals/datas/AnimalData.java:125-141`, `zombie/characters/animals/datas/AnimalData.java:1388-1395`)]

## 4. Breeds

**A breed holds textures, icons, products, forced gene ranges and sounds, and its name is its key.**

The 21 breed keys are `texture`, `textureMale`, `textureBaby`, `rottenTexture`, `milkType`, `woolType`, `forcedGenes`, nine icon keys (`invIconMale`, `invIconFemale`, `invIconBaby`, `invIconMaleDead`, `invIconFemaleDead`, `invIconBabyDead`, `invIconMaleSkel`, `invIconFemaleSkel`, `invIconBabySkel`), `leather`, `headItem`, `featherItem`, `maxFeather` and `sounds`. :cite[(`zombie/characters/animals/AnimalDefinitions.java:718-800`)] Only `texture` is split at commas, so only the female texture can list several variants; vanilla does this for the Holstein (`"Cow_BW_01,Cow_BW_02,Cow_BW_03"`). :cite[(`zombie/characters/animals/AnimalDefinitions.java:718-720`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:76`)]

`forcedGenes` maps a gene name to `minValue` and `maxValue`; the gene's alleles are then dominant and inside that range. :cite[(`zombie/characters/animals/datas/AnimalBreed.java:54-77`, `zombie/characters/animals/AnimalGene.java:57-82`)] Angus is a meat breed with a low `maxMilk` (0.05 to 0.2) and a high `meatRatio` (0.75 to 0.95); Holstein is a milk breed with `maxMilk` 0.60 to 0.75 and `meatRatio` 0.35 to 0.55. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:29-38`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:79-88`)]

```lua
-- from CowDefinitions.lua, the Angus breed: the name is the key "angus"
AnimalDefinitions.breeds["cow"].breeds["angus"] = {};
AnimalDefinitions.breeds["cow"].breeds["angus"].texture = "Cow_Black";
AnimalDefinitions.breeds["cow"].breeds["angus"].textureMale = "Bull_Black";
AnimalDefinitions.breeds["cow"].breeds["angus"].rottenTexture = "CowBlack_Rotting";
AnimalDefinitions.breeds["cow"].breeds["angus"].milkType = "CowMilk";
AnimalDefinitions.breeds["cow"].breeds["angus"].forcedGenes = {};
AnimalDefinitions.breeds["cow"].breeds["angus"].forcedGenes["maxMilk"] = {};
AnimalDefinitions.breeds["cow"].breeds["angus"].forcedGenes["maxMilk"].minValue = 0.05;
AnimalDefinitions.breeds["cow"].breeds["angus"].forcedGenes["maxMilk"].maxValue = 0.2;
```

This excerpt is lines 23 to 32 of the vanilla file, without the `name` and icon lines. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:23-32`)] The `name = "angus"` line in the vanilla file is a leftover: the Java takes the breed's name from the table key. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:24`, `zombie/characters/animals/AnimalDefinitions.java:705-712`)] The complete working mod for a new breed, with all three stages, is the [new animal recipe](/pz/build-42/modding/cookbook/new-animal).

## 5. Genes

**An animal's `genes` is a list of gene names, and a gene exists only if `AnimalGenomeDefinitions.genes` defines it.**

The Java collects the values of the `genes` table into a list of unique names and ignores the keys. :cite[(`zombie/characters/animals/AnimalDefinitions.java:693-703`)] This settles the older question whether the keys must equal the values, as in `ageToGrow = "ageToGrow"`: they need not.

When an animal is created, each listed name is looked up in the genome definitions, and a name that is not defined there is skipped with a debug line. :cite[(`zombie/characters/animals/AnimalGene.java:84-92`)] The 18 vanilla genes are `maxSize`, `maxWeight`, `meatRatio`, `ageToGrow`, `lifeExpectancy`, `maxMilk`, `milkInc`, `maxWool`, `woolInc`, `resistance`, `strength`, `hungerResistance`, `thirstResistance`, `aggressiveness`, `fertility`, `eggSize`, `eggClutch` and `stress`. Their ranges and what the code does with each are on [Animal genetics, breeds, and weight](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight). :cite[(`media/lua/shared/Definitions/animal/AnimalGenomeDefinitions.lua:9-53`)]

The older page called a gene such as `speed`, `stamina` or `carryWeight` a custom gene "for use in custom Lua code". As read, such a gene works only if a mod also adds it to `AnimalGenomeDefinitions.genes` (with an optional `minValue`, `maxValue`, `forcedValues` and `ratio`), because otherwise the animal never gets it. Lua code can then read its value with `animal:getUsedGene("speed")`, which is how the Lua butchering code reads `meatRatio`. We did not build such a gene in game. :cite[(`zombie/characters/animals/AnimalGenomeDefinitions.java:25-60`, `zombie/characters/animals/IsoAnimal.java:2323-2332`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`)]

## 6. Sounds

**A breed's `sounds` table maps a sound id to a sound script name, with optional timing and a priority.**

Each key of `sounds` is an id (compared in lower case), and each value is a table with `name` (the sound script to play), `slot` (vanilla uses `voice`), `priority`, and `intervalMin` and `intervalMax` for idle and stressed calls. :cite[(`zombie/characters/animals/datas/AnimalBreed.java:79-92`)] The sounds belong to the breed inside each animal type, which is why vanilla assigns them to `AnimalDefinitions.animals["bull"].breeds["angus"].sounds` and so on for every breed of every type. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:315-333`)]

The vanilla files use 26 ids across 21 sound tables: `attack`, `death`, `fallover`, `fight`, `grooming`, `idle`, `idle_fly`, `idle_peck`, `idle_walk`, `pain`, `petting`, `pick_up`, `pick_up_corpse`, `put_down`, `put_down_corpse`, `run`, `runloop`, `scratching`, `scuttle_ceiling`, `scuttle_cupboard`, `scuttle_wall`, `stressed`, `walk`, `walkBack`, `walkFront` and `walkloop`. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:315-366`)] The code asks for some ids by name: `death` when an animal dies, `stressed` and `idle`, `idle_walk` while walking, and `runloop` and `walkloop`. :cite[(`zombie/characters/animals/IsoAnimal.java:2930`, `zombie/characters/animals/IsoAnimal.java:3004`, `zombie/characters/animals/IsoAnimal.java:3011`, `zombie/characters/animals/IsoAnimal.java:3078`, `zombie/characters/animals/IsoAnimal.java:3115`)] Animation events can name any id: the event `PlayBreedSound` passes its parameter, such as `walkFront`, to the animal, which plays that breed sound. :cite[(`zombie/characters/animals/IsoAnimal.java:2960-2975`, `media/AnimSets/raccoon/walk/defaultWalk.xml:6-10`)] The older list of 14 ids was the cow family's.

```lua
-- from CowDefinitions.lua, the bull's sound table
local bull_sounds = {
	attack = { name = "AnimalVoiceBullAttack", slot = "voice", priority = 50 },
	idle = { name = "AnimalVoiceBullIdle", intervalMin = 15, intervalMax = 30, slot = "voice" },
	run = { name = "AnimalFootstepsBullRun" },
	-- fallover, pain, petting, pick_up, walkFront, walkBack and more follow
}
AnimalDefinitions.animals["bull"].breeds["angus"].sounds = bull_sounds
```

This excerpt is from lines 315 to 331 of the vanilla file. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:315-331`)]

## 7. Traps in vanilla's own files

**The vanilla files contain the rules a new species has to follow, written as comments and as code.**

- **Each type needs its own `breeds` table when the tables differ.** The vanilla comment says it: "bull.breeds must not be the same table as cow.breeds." The calf and the bull use `copyTable(...)`; the cow shares the original. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:139`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:204`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:275`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:314`)]
- **Breed names must match across stages.** A grown animal asks the new type's definition for a breed of the same name; if there is none, the new animal gets a null breed, which the data constructor then replaces with a random one. :cite[(`zombie/characters/animals/datas/AnimalData.java:1393-1395`, `zombie/characters/animals/datas/AnimalData.java:111-113`)]
- **A new animal needs a parts entry and a `meatRatio` gene** or its death writes a Lua error. See [butchering](/pz/build-42/modding/farming-and-animals/butchering-and-dead-animals). :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:18-27`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`)]
- **Pass a breed object when creating an animal.** When the breed is nil, the data constructor picks a random index that can be one past the end of the list, as read; we did not test it. :cite[(`zombie/characters/animals/datas/AnimalData.java:111-113`)] The `AnimalDefinitions` method `getRandomBreed` picks within the list. :cite[(`zombie/characters/animals/AnimalDefinitions.java:847-849`)]
- **Animation names must exist.** The `animset` is also the name of an AnimSet folder and an action group; see [the animal pipeline](/pz/build-42/modding/farming-and-animals/animal-pipeline). :cite[(`zombie/characters/animals/IsoAnimal.java:372-373`)]

:::callout[How we know]{kind=proof}
All rules are read from the 42.22 Java and Lua cited. The key counts come from the parse loop of `AnimalDefinitions.java`. The cow excerpts are copied from `CowDefinitions.lua` with comments removed. We did not run a mod through the game, so the custom-gene and chained-stage notes are readings, not tests.

Not verified: what each of the 116 keys does beyond the ones in the table (we read the parse of all of them, and traced the readers of about twenty); how a second mod's change to a vanilla entry interacts when two mods edit the same key; the nil-breed index.

Changed since the older page: the "four tables" framing, because the Java reads only `animals`; the claim that sounds are stored under `breeds[animalID]` (they live inside each type's breeds); the parameter list (three names the Java never reads, six it does, and defaults added); the sound ids (26, not 14); the worked cow family, which now quotes lines of the vanilla file instead of a paraphrase of a wiki page. The 42.21 to 42.22 delta changed `RabbitDefinitions.lua` and the `AnimalData` and `IsoAnimal` classes.
:::
