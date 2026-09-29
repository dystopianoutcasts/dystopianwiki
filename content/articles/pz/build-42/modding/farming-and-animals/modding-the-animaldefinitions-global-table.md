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
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  AnimalDefinitions is a global Lua table holding all animal definitions and
  properties -- behavior, characteristics, interactions. It has four sub-tables
  you populate, keyed by your chosen...
last_updated: '2026-09-29'
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
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# MODDING: the AnimalDefinitions global table

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`AnimalDefinitions` is a **global Lua table** holding all animal definitions and properties -- behavior, characteristics, interactions. It has four sub-tables you populate, keyed by your chosen animal/stage IDs. [CONFIRMED]

- `AnimalDefinitions.animals[stageID]` -- per-stage stat block (this is where most parameters live).
- `AnimalDefinitions.stages[animalID]` -- the lifecycle stage graph.
- `AnimalDefinitions.breeds[animalID]` -- breed variants (textures, products, forced genes, sounds).
- `AnimalDefinitions.genome[animalID]` -- the gene list for the species.

Workflow [CONFIRMED]: pick a unique animal ID (the wiki calls it `yourAnimalID`); reuse it as the key across `stages`, `breeds`, and `genome`; then define one `animals[stageID]` entry per life stage. Related tables referenced but not in the cached sources: `AnimalAvatarDefinition`, `AnimalPartsDefinitions`, `RanchZoneDefinitions`.

### 10.1 `AnimalDefinitions.animals` -- the stat block
Syntax [CONFIRMED]:
```lua
AnimalDefinitions.animals['stageID'] = {
    parameter1 = value1,
    parameter2 = value2,
    ...
}
```

The cached page lists ~120 parameters. Grouped by purpose (all names [CONFIRMED]; most have no wiki description, so meanings below are [LIKELY] from the name unless noted):

**Model / rendering:** `bodyModel`, `bodyModelSkel`, `bodyModelSkelNoHead`, `bodyModelHeadless`, `bodyModelFleece`, `textureSkeleton`, `textureSkeletonBloody`, `textureSkinned`, `modelscript`, `animset`, `shadoww`/`shadowfm`/`shadowbm`, `collisionSize`, `collidable`, `corpseSize`.

**Size / weight:** `animalSize`, `minSize`, `maxSize`, `minWeight`, `maxWeight`, `trailerBaseSize`, `baseEncumbrance`.

**Lifecycle / reproduction:** `stages`, `breeds`, `genes`, `babyType`, `babyNbr`, `minAge`, `minAgeForBaby`, `maxAgeGeriatric`, `female`, `male`, `mate`, `pregnantPeriod`, `timeBeforeNextPregnancy`, `needMom`, `eatFromMother`, `litterEatTogether`, `matingPeriodStart`, `matingPeriodEnd`.

**Feeding / needs:** `hungerMultiplier`, `thirstMultiplier`, `hungerBoost`, `thirstBoost`, `thirstHungerTrigger`, `eatGrass`, `eatTypeTrough`, `eatingTypeNbr`, `distToEat`, `canBeFeedByHand`, `feedByHandType`, `healthLossMultiplier`.

**Products:** `canBeMilked` (documented: if true the animal produces milk based on genes `maxMilk`/`milkInc`; the milk item is the breed's `milkType`) [CONFIRMED], `minMilk`, `maxMilk`, `milkAnimPreset`, `udder`, `maxWool`, `eggsPerDay`, `eggType`, `minClutchSize`, `maxClutchSize`, `layEggPeriodStart`, `fertilizedTimeMax`, `timeToHatch`, `dung`, `dungChancePerDay`, `carcassItem`, `minBlood`, `maxBlood`, `minBodyPart`.

**Enclosure / housing:** `minEnclosureSize`, `hutches`, `enterHutchTime`, `exitHutchTime`, `wanderMul`, `canClimbStairs`, `stressAboveGround`, `stressUnderRain`.

**Behavior / AI / combat:** `alwaysFleeHumans`, `fleeHumansMod`, `wild`, `canBeDomesticated`, `canBeAlerted`, `spottingDist`, `wildFleeTimeUntilDeadTimer`, `attackDist`, `attackTimer`, `attackBack`, `attackIfStressed`, `dontAttackOtherMale`, `baseDmg`, `knockdownAttack`, `canDoLaceration`, `canThump`, `periodicRun`, `turnDelta`, `sitRandomly`, `idleEmoteChance`, `happyAnim`, `idleTypeNbr`, `sittingTypeNbr`.

**Interaction / handling:** `canBePet`, `canBePicked`, `canBeKilledWithoutWeapon`, `canBeAttached`, `ropeBone`, `luredPossibleItems`, `addTrackingXp`, `group`.

**Sound:** `idleSoundRadius`, `idleSoundVolume`.

Documented parameters (wiki gave explicit text): `canBeMilked` (see above). All others in the list are name-only in the cached page.

**Worked example -- cow family [CONFIRMED, verbatim from wiki]:**
```lua
AnimalDefinitions.animals["cowcalf"] = {
    bodyModel = "CowCalf_Body",
    bodyModelSkel = "CowCalf_Skeleton",
    textureSkeleton = "Bull_Skeleton",
    textureSkeletonBloody = "CowBull_Skeleton_Butchered",
    animset = "cowcalf",
    modelscript = "CowCalf_Body",
    shadoww = 0.5, shadowfm = 1, shadowbm = 1,
    animalSize = 0.1, minSize = 0.9, maxSize = 1.2,
    genes  = AnimalDefinitions.genome["cow"].genes,
    stages = AnimalDefinitions.stages["cow"].stages,
    breeds = copyTable(AnimalDefinitions.breeds["cow"].breeds),
    minWeight = 60, maxWeight = 350,
    minEnclosureSize = 40,
    hungerMultiplier = 0.001, thirstMultiplier = 0.002,
    canBePet = true, canBePicked = true,
    carcassItem = "Base.CorpseCalf",
    dung = "Dung_Cow", corpseSize = 2.5,
    idleSoundRadius = 20, idleSoundVolume = 10,
}

AnimalDefinitions.animals["cow"] = {          -- adult female
    bodyModel = "CowBody", animset = "cow", modelscript = "CowBody",
    genes  = AnimalDefinitions.genome["cow"].genes,
    stages = AnimalDefinitions.stages["cow"].stages,
    breeds = AnimalDefinitions.breeds["cow"].breeds,
    babyType = "cowcalf",
    minAgeForBaby = 12 * 30,          -- 12 months
    maxAgeGeriatric = 12 * 12 * 30,   -- 12 years
    female = true, udder = true,
    minWeight = 360, maxWeight = 950,
    hungerMultiplier = 0.0035, thirstMultiplier = 0.0065,
    eatGrass = true,
    pregnantPeriod = (9 * 30) + 10,   -- ~9 months + 10 days
    canBeMilked = true, minMilk = 10, maxMilk = 50,
    carcassItem = "Base.CorpseCow",
    attackDist = 2, baseDmg = 0.3,
    dung = "Dung_Cow", corpseSize = 7,
}

AnimalDefinitions.animals["bull"] = {         -- adult male
    bodyModel = "Bull_Body", animset = "cow", modelscript = "Bull_Body",
    male = true, mate = "cow",
    babyType = "cowcalf", maxWeight = 1300,
    carcassItem = "Base.CorpseCow",
    attackBack = true, attackIfStressed = true,
    knockdownAttack = true, canDoLaceration = true,
    minBlood = 1000, maxBlood = 3500,
}
```
Note the idioms: time is expressed in **days** via `months * 30` and `years * 12 * 30`; the female is the "base" stage (`female = true`, `udder = true`, milk fields), the male is a separate stage keyed by `mate`, and `babyType` links both adults to the calf stage. `copyTable(...)` is used when a stage needs its own mutable copy of the shared breeds table.

### 10.2 `AnimalDefinitions.stages` -- lifecycle
Syntax [CONFIRMED]:
```lua
AnimalDefinitions.stages['yourAnimalID'] = {
    stages = {
        ["stage1"] = { ageToGrow = ..., nextStage = ..., nextStageMale = ... },
        ["stage2"] = { ... },
    }
}
```
Stage parameters [CONFIRMED]:
- `ageToGrow` (mandatory) -- time for this stage to grow up fully; grows to its `nextStage`. "Unit is unknown" per wiki, impacted by the `ageToGrow` gene. [wiki flags unit as [UNCERTAIN]]
- `nextStage` -- stage a **female** grows into at `ageToGrow`.
- `nextStageMale` -- stage a **male** grows into.
- `minWeight` / `maxWeight` -- "Looks unused since never parsed; the game uses the animal-definition `minWeight`/`maxWeight` instead." [CONFIRMED as likely-unused]

Example [CONFIRMED, a hypothetical horse]:
```lua
AnimalDefinitions.stages["horse"] = {
    stages = {
        ["filly"]    = { ageToGrow = 2 * 30, nextStage = "mare", nextStageMale = "stallion", minWeight = 0.1, maxWeight = 0.25 },
        ["mare"]     = { ageToGrow = 2 * 30, minWeight = 0.25, maxWeight = 0.5 },
        ["stallion"] = { ageToGrow = 2 * 30, minWeight = 0.25, maxWeight = 0.5 },
    }
}
```
The wiki notes: while unconfirmed, you can *likely* make as many stages as you want and evolve them into many different stages. [LIKELY]

### 10.3 `AnimalDefinitions.breeds` -- breeds, products, sounds
Syntax [CONFIRMED]:
```lua
AnimalDefinitions.breeds['yourAnimalID'] = {
    breeds = {
        ["breed1"] = { name = ..., texture = ..., ... },
    }
}
```
Breed parameters [CONFIRMED]:
- `name` -- the breed's ID.
- Textures: `textureBaby`, `texture`, `textureMale`, `rottenTexture`. (Textures must live in `media/textures/Body`, or a subfolder with the path specified, e.g. `YourSubFolder/YourTexture`.) A texture value can be a comma-separated list for random variation (Holstein: `"Cow_BW_01,Cow_BW_02,Cow_BW_03"`).
- Inventory icons: `invIconMale`, `invIconFemale`, `invIconBaby`, `invIconMaleDead`, `invIconFemaleDead`, `invIconBabyDead`, `invIconMaleSkel`, `invIconFemaleSkel`, `invIconBabySkel`.
- Products: `featherItem` + `maxFeather` (plucking, full type required); `milkType` (fluid script, quantity scaled by genes `maxMilk`/`milkInc` and def `minMilk`/`maxMilk`); `woolType` (shear item, full type, scaled by genes `maxWool`/`woolInc` and def `maxWool`).
- `forcedGenes` -- forces min/max gene values for this breed:
  ```lua
  forcedGenes = { maxMilk = { minValue = 0.5, maxValue = 1.0 } }
  ```
- `sounds` -- per-breed sound table (see 10.5).

**Worked example -- cow breeds [CONFIRMED, verbatim]:** Angus is a meat breed (low `maxMilk` 0.05-0.2, high `meatRatio` 0.75-0.95, low `maxWeight` 0.45-0.65); Holstein is a milk breed (`maxMilk` 0.60-0.75, `meatRatio` 0.35-0.55, `maxWeight` 0.6-0.8). This `forcedGenes` block is exactly how you specialize a breed:
```lua
AnimalDefinitions.breeds["cow"] = {
    breeds = {
        ["angus"] = {
            name = "angus",
            texture = "Cow_Black", textureMale = "Bull_Black", rottenTexture = "CowBlack_Rotting",
            milkType = "CowMilk",
            invIconFemale = "Item_CowBlack_Calf", -- (male/baby/dead/skel icons omitted for brevity)
            forcedGenes = {
                maxMilk   = { minValue = 0.05, maxValue = 0.2 },
                meatRatio = { minValue = 0.75, maxValue = 0.95 },
                maxWeight = { minValue = 0.45, maxValue = 0.65 },
            }
        },
        ["holstein"] = {
            name = "holstein",
            texture = "Cow_BW_01,Cow_BW_02,Cow_BW_03", textureMale = "Bull_BW_01", rottenTexture = "CowBW_Rotting",
            milkType = "CowMilk",
            forcedGenes = {
                maxMilk   = { minValue = 0.60, maxValue = 0.75 },
                meatRatio = { minValue = 0.35, maxValue = 0.55 },
                maxWeight = { minValue = 0.6,  maxValue = 0.8 },
            }
        }
    }
}
```

### 10.4 `AnimalDefinitions.genome` -- genes
Syntax [CONFIRMED]:
```lua
AnimalDefinitions.genome['yourAnimalID'] = {
    genes = { gene1 = name1, gene2 = name2, ... }
}
```
The wiki flags [Unverified] that the gene keys are named identically to their values (`ageToGrow = "ageToGrow"`). [UNCERTAIN]

**Available built-in genes [CONFIRMED]:** `ageToGrow` (grow speed), `maxMilk` (max milk), `milkInc` (milk rate), `maxWool` (max wool), `woolInc` (wool rate), `maxSize`, `meatRatio`, `maxWeight`, `lifeExpectancy`, `resistance`, `strength`, `hungerResistance`, `thirstResistance`, `aggressiveness`, `fertility`, `eggSize`, `stress`, `eggClutch`.

**Custom genes are supported** -- the horse example adds `speed`, `stamina`, `carryWeight` as custom genes for use in custom Lua code:
```lua
AnimalDefinitions.genome["horse"] = {
    genes = {
        meatRatio = "meatRatio", maxWeight = "maxWeight", lifeExpectancy = "lifeExpectancy",
        resistance = "resistance", strength = "strength",
        hungerResistance = "hungerResistance", thirstResistance = "thirstResistance",
        aggressiveness = "aggressiveness", ageToGrow = "ageToGrow", fertility = "fertility", stress = "stress",
        speed = "speed",           -- custom gene
        stamina = "stamina",       -- custom gene
        carryWeight = "carryWeight" -- custom gene
    }
}
```

### 10.5 Sounds
Stored at `AnimalDefinitions.breeds[animalID].breeds["breed1"].sounds`. [CONFIRMED] Each sound entry:
- `name` (mandatory) -- the sound-script ID to play.
- `slot` (e.g. `voice`), `priority`, `intervalMin`, `intervalMax` (idle/stressed use the interval fields).

Available sound IDs [CONFIRMED]: `attack`, `death`, `fallover`, `idle`, `pain`, `petting`, `pick_up`, `pick_up_corpse`, `put_down`, `put_down_corpse`, `run`, `stressed`, `walkBack`, `walkFront`.

Example [CONFIRMED, bull]:
```lua
AnimalDefinitions.breeds["bull"] = {
    breeds = {
        ["bull"] = {
            sounds = {
                attack   = { name = "AnimalVoiceBullAttack", slot = "voice", priority = 50 },
                death    = { name = "AnimalVoiceBullDeath",  slot = "voice", priority = 100 },
                idle     = { name = "AnimalVoiceBullIdle",   intervalMin = 15, intervalMax = 30, slot = "voice" },
                stressed = { name = "AnimalVoiceBullStressed", intervalMin = 5, intervalMax = 10, slot = "voice" },
                run      = { name = "AnimalFootstepsBullRun" },
                -- pain, petting, pick_up, put_down, walkFront, walkBack, fallover, corpse variants...
            }
        }
    }
}
```
