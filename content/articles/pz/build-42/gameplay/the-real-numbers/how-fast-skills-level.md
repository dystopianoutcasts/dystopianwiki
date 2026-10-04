---
id: build-42-how-fast-skills-level
slug: how-fast-skills-level
title: 'How fast skills level: XP, multipliers and how they stack'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - skills
  - xp
  - skill-books
  - traits
  - sandbox
excerpt: >-
  A normal skill needs 32,775 XP to reach level 10, Strength and Fitness need
  487,500. Every XP gain is multiplied by your starting level in that skill
  (a quarter speed if you started at 0), your learner trait, any skill book you
  have read and the sandbox multiplier, and they all multiply together. Read
  from the 42.21 code.
last_updated: '2026-10-04'
---
# How fast skills level: XP, multipliers and how they stack

Every Outcast has stared at a skill bar that will not move and wondered what the game is doing. We read the code. Here are the real numbers for Build 42.21 on the default sandbox, and every multiplier that touches them.

## The short answer

- **A normal skill needs 32,775 XP to go from level 0 to level 10.** Level 1 costs 75 XP; level 10 alone costs 9,000.
- **Strength and Fitness need 487,500 XP**, about 15 times as much in total.
- **Almost every XP gain is multiplied, and the multipliers stack by multiplying together:**
  - your starting level in that skill: **x0.25** if you started at 0, x1 at 1, x1.33 at 2, x1.66 at 3 or more;
  - Fast Learner **x1.3** or Slow Learner **x0.7**;
  - a skill book you have read, up to **x3, x5, x8, x12 or x16** for volumes 1 to 5 (half that for Aiming, Reloading and Long Blade);
  - the sandbox XP multiplier, **x1.0** by default.
- **The surprise most of us miss:** a skill you did not start with learns at a quarter of the speed for the whole game, not just until level 1. The starting-level factor is set when your character is created and only changes if a trait that grants skill levels is added or removed later.
- **No XP while you sleep**, and XP cannot go below 0 or above the level 10 total.

## XP needed for each level

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Normal skill, this level | 75 | 150 | 300 | 750 | 1,500 | 3,000 | 4,500 | 6,000 | 7,500 | 9,000 |
| Normal skill, total | 75 | 225 | 525 | 1,275 | 2,775 | 5,775 | 10,275 | 16,275 | 23,775 | 32,775 |
| Strength or Fitness, this level | 1,500 | 3,000 | 6,000 | 9,000 | 18,000 | 30,000 | 60,000 | 90,000 | 120,000 | 150,000 |
| Strength or Fitness, total | 1,500 | 4,500 | 10,500 | 19,500 | 37,500 | 67,500 | 127,500 | 217,500 | 337,500 | 487,500 |

The game stores a base table and multiplies every entry by 1.5 when it loads, so these are the numbers it really uses.

> **Proof:** Code. `zombie.characters.skills.PerkFactory#init` (base table 50 to 6,000, Fitness and Strength 1,000 to 100,000), `PerkFactory#AddPerk` (`perk.xp1 = (int)(xp1 * 1.5F)` for every level), `PerkFactory.Perk#getTotalXpForLevel`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The formula

When almost anything gives you XP, the game does this:

**XP you get = base XP x starting-level factor x learner trait x other traits x book multiplier x sandbox multiplier**

Then it clamps the result so your total never drops below 0 or passes the level 10 total. If you are asleep, nothing happens at all.

### Starting-level factor

Your "starting level" is the number of levels your profession and traits gave you in that skill when the character was made, counted up to 3. It never changes as you level up, so it is a permanent rate for that skill.

| Levels you started with | Factor |
|---|---|
| 0 | x0.25 |
| 1 | x1.0 |
| 2 | x1.33 |
| 3 or more | x1.66 |

Exceptions:
- **Running** (the game calls it Sprinting) never gets the x0.25 penalty, and one starting level gives x1.25 instead of x1.0.
- **Strength and Fitness** ignore this table completely: always x1.0. Every character starts both at 5, plus or minus what its traits and profession give.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#applyTraits` (Fitness and Strength start at 5, then `getXPBoostMap().put(perkType, Math.min(3, level))` for every skill with starting levels); `zombie.characters.IsoGameCharacter$XP#AddXP`, `isSkillExcludedFromSpeedReduction` (Sprinting, Fitness, Strength) and `isSkillExcludedFromSpeedIncrease` (Fitness, Strength). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

This is the part of `AddXP` that sets it, quoted from the decompiled 42.21 engine:

```java
if (entry.getValue() == 0 && !this.isSkillExcludedFromSpeedReduction(entry.getKey())) {
   mod *= 0.25F;
} else if (entry.getValue() == 1 && entry.getKey() == PerkFactory.Perks.Sprinting) {
   mod *= 1.25F;
} else if (entry.getValue() == 1) {
   mod *= 1.0F;
} else if (entry.getValue() == 2 && !this.isSkillExcludedFromSpeedIncrease(entry.getKey())) {
   mod *= 1.33F;
} else if (entry.getValue() >= 3 && !this.isSkillExcludedFromSpeedIncrease(entry.getKey())) {
   mod *= 1.66F;
}
// ...and a skill with no entry at all:
if (!bDoneIt && !this.isSkillExcludedFromSpeedReduction(perk.getType())) {
   mod = 0.25F;
}
```

### Traits

| Trait | Effect | Does not apply to |
|---|---|---|
| Fast Learner | x1.3 | Strength, Fitness |
| Slow Learner | x0.7 | Strength, Fitness, Running |
| Pacifist | x0.75 on Axe, Long Blade, Short Blade, Short Blunt, Long Blunt, Spear and Aiming | every other skill |
| Crafty | x1.3 on every skill under Crafting (Carpentry, Carving, Cooking, Electrical, Glassmaking, Knapping, Masonry, Blacksmithing, Mechanics, Pottery, Tailoring, Welding) | every other skill |

> **Proof:** Code. `zombie.characters.IsoGameCharacter$XP#AddXP` (`FAST_LEARNER` 1.3F, `SLOW_LEARNER` 0.7F, `PACIFIST` 0.75F on the six melee skills and Aiming, `CRAFTY` 1.3F when `perk.getParent() == PerkFactory.Perks.Crafting`); parents from `PerkFactory#init`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Skill books

Reading a skill book sets a multiplier for that one skill. It grows in 10% steps as you read (each tenth of the book gives a tenth of the maximum) and counts only once it is above x1.

| Volume | Levels it covers | Boost lasts while you are | Maximum | Aiming, Reloading, Long Blade |
|---|---|---|---|---|
| 1 | 1-2 | level 0 and 1 | x3 | x1.5 |
| 2 | 3-4 | level 2 and 3 | x5 | x2.5 |
| 3 | 5-6 | level 4 and 5 | x8 | x4 |
| 4 | 7-8 | level 6 and 7 | x12 | x6 |
| 5 | 9-10 | level 8 and 9 | x16 | x8 |

The boost ends the moment you reach the book's top level. You get nothing from a book whose first level is more than one above yours, and a book whose top level you already reached is too easy. Illiterate characters cannot use skill books. One skill holds one book multiplier at a time.

> **Proof:** Code. `media/lua/server/XpSystem/XPSystem_SkillBook.lua` (`maxMultiplier1` to `5`: 3, 5, 8, 12, 16; 1.5, 2.5, 4, 6, 8 for Aiming, Reloading, LongBlade); `media/lua/shared/TimedActions/ISReadABook.lua`, `ISReadABook.checkMultiplier` (`math.floor(readPercent/10) * (self.maxMultiplier/10)`) and the level and Illiterate checks in `ISReadABook:update` (reading stops, no multiplier); `zombie.inventory.types.Literature#getMaxLevelTrained` (first level + levels trained - 1); `zombie.characters.IsoGameCharacter$XP#AddXP` (book multiplier used only when above 1.0, removed when XP leaves the book's range). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### The sandbox multiplier

The sandbox page "XP Multipliers" has a **Global Multiplier** (default 1.0, range 0 to 1000) and **Use Global Multiplier** (default on). While it is on, every skill uses the global number. Turn it off and each skill uses its own multiplier (all 1.0 by default).

The global multiplier also applies to Strength and Fitness. You may still see an old "XP Multiplier Affects Passive Skills" text in the translation files; there is no such option in 42.21.

> **Proof:** Code. `zombie.SandboxOptions$MultiplierConfig` (`MultiplierConfig.Global` 0.0 to 1000.0, default 1.0; `MultiplierConfig.GlobalToggle` default true; one option per skill); `zombie.characters.IsoGameCharacter$XP#AddXP` (global value when the toggle is on, else `MultiplierConfig.<skill>`); the `SandboxOptions` constructor loads `media/lua/shared/Sandbox/Apocalypse.lua` as the defaults; no `XpMultiplierAffectsPassive` option in `SandboxOptions`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A worked example

Sawing logs gives 5 Carpentry XP.

| Who saws | Sum | XP per saw | Saws to the next level |
|---|---|---|---|
| Started at Carpentry 0 | 5 x 0.25 | 1.25 | 60 to reach level 1 |
| Same, Volume 1 read to the end | 5 x 0.25 x 3 | 3.75 | 20 to reach level 1 |
| Same, plus Fast Learner | 5 x 0.25 x 1.3 x 3 | 4.875 | 16 to reach level 1 |
| Started with 3 levels of Carpentry | 5 x 1.66 | 8.3 | 91 to reach level 4 |

> **Proof:** Code. `media/scripts/generated/recipes/recipes_carpentry.txt`, `craftRecipe SawLogs` (`xpAward = Woodwork:5`); crafting XP is paid by `zombie.scripting.entity.components.crafting.CraftRecipe` through the same `AddXP` with multipliers on. Build 42.21, Steam build 25485521.

## What a few common actions pay (before multipliers)

Each action sets its own base XP, so there is no single table. These are some of the ones players ask about most:

- **Melee hit:** for each target you hit, `damage x 0.9` (capped at 3) to the weapon's skill, 1 Fitness if your endurance is above half, and Strength XP equal to how many targets that swing hit.
- **Firearm hit:** 1 Aiming per target hit, times 2.7 while Aiming is below level 5.
- **Running or sprinting** above half endurance: once per real-time second, a 1 in 20 chance of 1 Fitness XP and, separately, 1 Running XP. This runs on the wall clock, so speeding up the game does not speed it up.
- **Carrying more than half your weight limit while moving:** once per real second, a 1 in 20 chance of 2 Strength XP.
- **Aiming while moving:** once per real second, a 1 in 20 chance of 1 Nimble XP.
- **Chopping a tree** with anything but bare hands: 2 Strength XP per hit.
- **TV, radio and tapes:** 50 XP for each skill point a broadcast line carries (the vanilla lines we counted all carry 1), but only while the skill is below level 3 (the sandbox "Maximum Media XP Level", default 3).
- **Crafting:** whatever the recipe's `xpAward` says.
- **Barricading** pays flat XP that skips every multiplier above: 3 Carpentry per plank, 6 Welding per metal sheet or set of metal bars. Taking a plank off a barricade pays a flat 2 Carpentry (and 2 Strength, which is multiplied as usual).

Strength XP is multiplied by 1.5 while your protein is between 50 and 300, and by 0.7 when it is below -300. Fitness XP stops at Fitness 6 and up while you are Emaciated, Very Underweight or Obese, and at Fitness 9 and up while Overweight too.

If you stop training Strength or Fitness for a long time, they slowly lose XP. Each XP gain in the skill banks about 50 in-game hours of grace, up to about 49 days in all. Once the bank is empty you lose 1 XP roughly every 20 in-game hours, about 10 XP in a week, and then you get about 14 days of grace before it starts again. Against 1,500 XP or more per level, you will rarely notice.

> **Proof:** Code. `media/lua/server/XpSystem/XpUpdate.lua`: `xpUpdate.onWeaponHitXp`, `xpUpdate.onPlayerMove`, `xpUpdate.OnWeaponHitTree`, `xpUpdate.addXp` (each gain takes 3000 off the timer, floor -50000) and `xpUpdate.everyTenMinutes` (timer starts at -50000, +10 per ten minutes, 1 XP lost each time `floor(timer / 1200)` changes above 20000, reset to 0 above 31000); `zombie.characters.IsoPlayer#isRandXp` (`System.currentTimeMillis`, 1000 ms interval, `ZombRand(1/0.05) == 0`); `media/lua/shared/RadioCom/ISRadioInteractions.lua`, `doSkill` (`50*_amount`, `LevelForMediaXPCutoff`), and the skill codes in the installed `media/radio/RadioData.xml` (`CRP+1`, `COO+1`, `FIS+1`); `media/lua/shared/TimedActions/ISBarricadeAction.lua` and `ISUnbarricadeAction.lua` (`addXpNoMultiplier`, which calls `AddXP` with the multipliers off); `zombie.characters.IsoGameCharacter$XP#AddXP` (protein factor, `canAddFitnessXp`, `isAsleep`); `zombie.characters.BodyDamage.Nutrition#canAddFitnessXp`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Multiplayer

The sums are the same, but the server does them. When vanilla Lua awards XP on a multiplayer client, the call does nothing; on the server it applies the full formula with the server's sandbox settings and sends you the result. A mod that hands out XP has to do it on the server.

> **Proof:** Code. `zombie.Lua.LuaManager$GlobalObject#addXp` (server: `GameServer.addXp`; client: nothing; single player: `AddXP`); `zombie.network.GameServer#addXp` (calls `AddXP` with the multipliers on). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers) for the modder's view of the same system.
- [The XP-grant and skill-query Lua API](/pz/build-42/modding/skills-and-traits/the-xp-grant-skill-query-lua-api) if you want to award XP from a mod.
- [Weight, encumbrance and strength](/pz/build-42/gameplay/the-real-numbers/weight-encumbrance-and-strength) for what Strength levels buy you.
