---
id: build-42-weight-encumbrance-and-strength
slug: weight-encumbrance-and-strength
title: 'Weight, encumbrance and strength: what you can really carry'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - weight
  - encumbrance
  - strength
  - bags
  - endurance
excerpt: >-
  At Strength 5 your weight limit is 12, from 6 at Strength 0 to 20 at
  Strength 10. Worn and held items count at 30%, hotbar items at 70%, and a bag
  in your main inventory counts in full. Heavy Load starts above 100% of the
  limit and gets worse at 125%, 150% and 175%. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# Weight, encumbrance and strength: what you can really carry

Outcast, the number in the top corner of your inventory window decides how fast you move, how fast you tire and whether you trip over that fence. Here is where it comes from in Build 42.21, and what every Heavy Load level really does.

## The short answer

- **Your weight limit comes from your Strength level.** At Strength 5 (where every character starts unless traits change it) the limit is **12**. It runs from **6** at Strength 0 to **20** at Strength 10.
- **Hunger, thirst, sickness, bleeding and injury lower it** by 1 to 3 points each.
- **What counts:**
  - loose items in your main inventory: full weight;
  - items you wear or hold in your hands: **30%**;
  - items attached to a hotbar slot (belt, holster, back) but not in your hands: **70%** (packed tents, packed sleeping bags and the military canteen count 30%);
  - a bag you wear or hold: the bag itself at 30%, its contents reduced by the bag's weight reduction;
  - a bag sitting in your main inventory: **the bag and everything in it at full weight**.
- **Heavy Load starts the moment you pass 100% of your limit**, and gets worse at 125%, 150% and 175%.
- **Hard cap:** your main inventory holds at most 50, whatever your limit.

## Weight limit by Strength

| Strength | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Weight limit | 6 | 7 | 8 | 9 | 11 | 12 | 14 | 15 | 16 | 18 | 20 |

The formula is **8 x a Strength factor**, rounded down. The factor is 0.8 at Strength 0, 0.9 at 1, then rises by 0.17 per level (1.07, 1.24 and so on) to 2.26 at 9, and 2.5 at 10.

Then the game takes off points for bad moodles, before anything else:

| Moodle | Level 2 | Level 3 | Level 4 |
|---|---|---|---|
| Hungry | -1 | -2 | -2 |
| Thirsty | -1 | -2 | -2 |
| Sick | -1 | -2 | -3 |
| Bleeding | -1 | -1 | -1 |
| Injured | -1 | -2 | -3 |

A Strength 5 survivor who is very hungry (level 3) and injured (level 2) carries 12 - 2 - 1 = **9**. The limit never goes below 0.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#UpdateStrength` (`setMaxWeight((int)(getMaxWeightBase() * getWeightMod()) - numStrengthReducers)`, clamped at 0, and the moodle reducers); `zombie.characters.IsoGameCharacter` (`maxWeightBase = 8`, `#getWeightMod` table 0.8 to 2.5); `zombie.characters.IsoGameCharacter#applyTraits` (Strength starts at 5). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### What about the Strong, Stout, Feeble and Weak traits?

At character creation these traits change your starting Strength, and that is what changes your limit (shown for a profession that adds no Strength):

| Trait | Strength | Weight limit | With the trait multiplier (see below) |
|---|---|---|---|
| Weak | 5 - 5 = 0 | 6 | would be 4 |
| Feeble | 5 - 2 = 3 | 9 | would be 8 |
| (none) | 5 | 12 | 12 |
| Stout | 5 + 2 = 7 | 15 | would be 18 |
| Strong | 5 + 4 = 9 | 18 | would be 27 |

Later in the game the four traits simply follow your Strength level: 0-1 Weak, 2-4 Feeble, 5 none, 6-8 Stout, 9-10 Strong.

In the code they also have their own carry multiplier: Strong x1.5, Stout x1.25, Feeble x0.9, Weak x0.75.

But in 42.21 that multiplier is only set at the instant the character object is built, and at that instant the character has no traits yet: they are applied a moment later, and when a save loads they are read in afterwards too. So outside the Last Stand mode the multiplier stays at x1 and only the Strength level counts. We read this in the code and have not measured it in game. You can check it yourself: a Strong character at Strength 9 whose inventory window shows a limit of 18, not 27, is this.

> **Proof:** Code. `zombie.characters.IsoPlayer` constructors (`maxWeightDelta` set from `characterTraits` STRONG 1.5, STOUT 1.25, FEEBLE 0.9, WEAK 0.75; `characterTraits` is a fresh empty `CharacterTraits` from `IsoGameCharacter` at that point); traits applied after construction by `zombie.iso.IsoWorld` (new character, then `applyTraits`) and `zombie.network.packets.character.CreatePlayerPacket`; no other writer of `maxWeightDelta` in the Java or vanilla Lua; `BodyDamage#UpdateStrength` multiplies by `getMaxWeightDelta()`; trait Strength values from `media/scripts/generated/characters/character_traits.txt` (`XPBoosts = Strength=4`, `2`, `-2`, `-5`); `media/lua/server/XpSystem/XpUpdate.lua`, `xpUpdate.levelPerk` (traits swapped by Strength level). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What counts toward your weight

| Where the item is | Counts as |
|---|---|
| Loose in your main inventory | its weight, plus its contents |
| Worn, or in your hands | 30% of weight and contents |
| On a hotbar slot, not in your hands | 70% of weight and contents (30% for items tagged light-when-attached: packed tents, packed sleeping bags, the military canteen) |
| A bag you wear or hold | the bag at 30%, plus its contents x (1 - weight reduction / 100) |
| A bag loose in your main inventory | the bag and its contents in full, no reduction |
| Inside a bag | counted through that bag, never on its own |

So a backpack with 70% weight reduction holding 20 weight of loot counts 6 for the loot when worn, and 20 if you carry it in your main inventory instead.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#getInventoryWeight` (hotbar-attached and not equipped: `getHotbarEquippedWeight`; equipped or worn: `getEquippedWeight`; else `getUnequippedWeight`), `#isEquipped` (worn or in hand); `zombie.inventory.InventoryItem#getEquippedWeight` and `#getHotbarEquippedWeight` (0.7F, or `EquippedOrWornEncumbranceMultiplier` for `base:lightwhenattached`); `zombie.inventory.types.InventoryContainer#getEquippedWeight` (weight reduction applied to contents only when equipped); `EquippedOrWornEncumbranceMultiplier = 0.3` in `media/lua/shared/defines.lua`; tag list read in `media/scripts/generated/items/normal.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Heavy Load levels

Heavy Load compares what you carry (counted as above) with your limit:

| Heavy Load level | You carry |
|---|---|
| 1 | more than 100% of your limit |
| 2 | 125% or more |
| 3 | 150% or more |
| 4 | 175% or more |

At Strength 5 with a limit of 12, that is above 12, then 15, 18 and 21.

> **Proof:** Code. `zombie.characters.Moodles.Moodle` (HEAVY_LOAD: `getInventory().getCapacityWeight() / getMaxWeight()`); `zombie.characters.Moodles.MoodleStat` (`HEAVY_LOAD` thresholds 1.0, 1.25, 1.5, 1.75). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What each Heavy Load level does to you

Most of these grow with every level of Heavy Load:

- **Movement:** your base movement speed value starts at 0.8 and loses **0.15 per level** before other modifiers. The Endurance moodle takes the same 0.15 per level, so a tired, overloaded survivor crawls.
- **Running drains endurance faster:** x1.5 at level 1, x1.9 at 2, x2.3 at 3, x2.8 at 4.
- **Standing still stops recovering endurance at level 2 and up.** Sitting down still recovers it at the full sitting rate, whatever you carry.
- **Walking drains endurance at level 3 and up.**
- **Your body pays at level 3 and up:** while you are on your feet and your health is above 75, you take small, repeated health damage and back muscle strain.
- **Combat:** swing speed -0.07, critical hit chance -5, and the chance to defend against a zombie's attack -2, each per level.
- **Climbing:** the chance to trip vaulting a low fence rises by 13 per level. Your climbing score, which decides how often you fail a tall wall or a sheet rope, loses 8 points per level, and climbing a tall wall strains your arms more for each level. If that score reaches 0 while you carry any Heavy Load, a tall wall cannot be climbed at all. The chance to fall when a zombie lunges at you through a window rises by 5 per level.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#calculateBaseSpeed` (0.8, minus 0.15 per ENDURANCE and HEAVY_LOAD level), `#calculateCombatSpeed` (-0.07), `#testDefense` (-2), `#getClimbingFailChanceFloat` (-8 per level; the score, square-rooted, is the 1-in-N wall failure in `zombie.ai.states.ClimbOverWallState` and feeds the sheet rope states; at 0 the wall only succeeds with no Heavy Load), `#attackFromWindowsLunge` (+5); `ClimbOverWallState#execute` (arm strain times HEAVY_LOAD + 1); `zombie.characters.IsoPlayer#updateEndurance` (running weight factor 1.5, 1.9, 2.3, 2.8; standing and walking recovery only at HEAVY_LOAD 1 or less; walking drain above 2; sitting goes to `updateEnduranceWhileSitting` with no load check), `#calculateCritChance` (-5); `zombie.characters.BodyDamage.BodyDamage` (HEAVY_LOAD above 2, health above 75, not sitting, asleep or in a vehicle: health damage and `addBackMuscleStrain`); `zombie.ai.states.ClimbOverFenceState` (+13 trip chance). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Getting stronger by carrying

Moving while you carry more than half your limit gives a 1 in 20 chance each real-time second of 2 Strength XP. Strength needs 1,500 XP for its first level and 18,000 for level 5, so this is slow, but it is free. See [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level) for the rest.

> **Proof:** Code. `media/lua/server/XpSystem/XpUpdate.lua`, `xpUpdate.onPlayerMove` (`getInventoryWeight() > getMaxWeight() * 0.5`, `isRandXp(1000, 0.05, Perks.Strength)`, 2 XP). Build 42.21, Steam build 25485521.

## Multiplayer

The formula is the same. Your weight limit also travels between server and client with the body-damage sync, so both sides know it. We have not tested what happens when they disagree.

> **Proof:** Unknown. `zombie.network.packets.character.PlayerDamagePacket` writes and reads `getMaxWeight()`; which side's value wins after a mismatch was not determined from the code and needs a server test. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance): what Heavy Load does to your endurance, and how to get it back.
- [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level): Strength XP and its multipliers.
