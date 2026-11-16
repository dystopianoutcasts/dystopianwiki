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
  Your weight limit is 12 at Strength 5, from 6 at Strength 0 to 20 at Strength 10. Worn items count 30%, hotbar items 70%, a bag in your main inventory in full. Heavy Load starts above 100% (42.22).
last_updated: '2026-11-15'
related_articles:
  - fatigue-sleep-and-endurance
  - how-fast-skills-level
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, the number in the top corner of your inventory window decides how fast you move, how fast you tire and whether you trip over that fence. Here is where it comes from, and what every Heavy Load level really does.

:::callout[The 1-minute version]{kind=key}
- Your weight limit comes from your Strength level: 12 at Strength 5, where every character starts unless traits change it, running from 6 at Strength 0 to 20 at Strength 10.
- Bad hunger, thirst, sickness, bleeding and injury lower the limit by 1 to 3 points each.
- Loose items in your main inventory count in full. Worn or held items count 30%, and hotbar items 70%. A bag you wear or hold counts 30%, with its contents reduced by the bag's weight reduction. A bag in your main inventory counts in full, contents included.
- Heavy Load starts above 100% of your limit and worsens at 125%, 150% and 175%.
- Your main inventory holds at most 50 of counted weight, whatever your limit.
:::

:::facts
- **Limit at Strength 0 / 5 / 10** 6 / 12 / 20
- **Heavy Load levels 1 to 4** above 100% / 125% / 150% / 175% of the limit (12, 15, 18, 21 at Strength 5)
- **Counted weight** 100% loose, 30% worn or held, 70% on a hotbar slot
- **Moving with more than half your limit** 1 in 20 chance each real second of 2 Strength XP
- **Strength XP to level 1 / level 5** 1,500 / 37,500 in total
:::

:::flow[From Strength to Heavy Load]
- Strength level sets a base limit
- Moodles take points off
- Each item counts at its carried percentage
- Load divided by limit sets the Heavy Load level
:::

## 1. Your weight limit

The limit is 8 times a Strength factor, rounded down, minus a few points for bad moodles.

The factor is 0.8 at Strength 0, 0.9 at 1, then rises by 0.17 per level (1.07 at level 2, 1.24 at level 3, up to 2.26 at level 9), and is 2.5 at level 10. :cite[(`zombie/characters/IsoGameCharacter.java:600`, `zombie/characters/IsoGameCharacter.java:4724-4745`)]

| Strength | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Weight limit | 6 | 7 | 8 | 9 | 11 | 12 | 14 | 15 | 16 | 18 | 20 |

Then the game takes off points for bad moodles, before anything else, and the limit never goes below 0. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2011-2076`)]

| Moodle | Level 2 | Level 3 | Level 4 |
|---|---|---|---|
| Hungry | -1 | -2 | -2 |
| Thirsty | -1 | -2 | -2 |
| Sick | -1 | -2 | -3 |
| Bleeding | -1 | -1 | -1 |
| Injured | -1 | -2 | -3 |

A Strength 5 survivor who is very hungry (level 3) and injured (level 2) carries 12 - 2 - 1 = 9.

### What about the Strong, Stout, Feeble and Weak traits?

At character creation these traits change your starting Strength, and that is what changes your limit (shown for a profession that adds no Strength). :cite[(`media/scripts/generated/characters/character_traits.txt:333`, `media/scripts/generated/characters/character_traits.txt:919`, `media/scripts/generated/characters/character_traits.txt:931`, `media/scripts/generated/characters/character_traits.txt:1023`, `zombie/characters/IsoGameCharacter.java:11554-11555`)]

| Trait | Strength | Weight limit | With the trait multiplier (see below) |
|---|---|---|---|
| Weak | 5 - 5 = 0 | 6 | would be 4 |
| Feeble | 5 - 2 = 3 | 9 | would be 8 |
| (none) | 5 | 12 | 12 |
| Stout | 5 + 2 = 7 | 15 | would be 18 |
| Strong | 5 + 4 = 9 | 18 | would be 27 |

The "would be" column never applies in play, because the multiplier stays at x1, as explained below.

Later in the game the four traits simply follow your Strength level: 0-1 Weak, 2-4 Feeble, 5 none, 6-8 Stout, 9-10 Strong. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:196-218`)]

In the code they also have their own carry multiplier: Strong x1.5, Stout x1.25, Feeble x0.9, Weak x0.75. :cite[(`zombie/characters/IsoPlayer.java:588-596`, `zombie/characters/BodyDamage/BodyDamage.java:2077-2079`)]

That multiplier is only set when the character object is built, and at that moment the character has no traits yet: they are applied a moment later, and when a save loads they are read in afterwards too. :cite[(`zombie/characters/IsoGameCharacter.java:598`, `zombie/iso/IsoWorld.java:2386-2387`, `zombie/Lua/LuaManager.java:6465-6466`, `zombie/network/packets/character/CreatePlayerPacket.java:293-300`, `zombie/characters/IsoGameCharacter.java:17986`)]

The only writers of the multiplier are the two constructors, and the Last Stand exception that set Strong at construction in 42.21 is gone from 42.22. :cite[(`zombie/characters/IsoPlayer.java:663-671`)] So the multiplier stays at x1 and only the Strength level counts. We read this in the code and have not measured it in game. You can check it yourself: a Strong character at Strength 9 whose inventory window shows a limit of 18, not 27, is this.

## 2. What counts toward your weight

Each item counts for a share of its weight that depends on where it is.

The loop goes over every item in your main inventory and picks one of three ways to count it. :cite[(`zombie/characters/IsoGameCharacter.java:11438-11458`)]

| Where the item is | Counts as |
|---|---|
| Loose in your main inventory | its weight, plus its contents |
| Worn, or in your hands | 30% of weight and contents |
| On a hotbar slot, not in your hands | 70% of weight and contents (30% for items tagged light-when-attached) |
| A bag you wear or hold | the bag at 30%, plus its contents x (1 - weight reduction / 100) |
| A bag loose in your main inventory | the bag and its contents in full, no reduction |
| Inside a bag | counted through that bag, never on its own |

:cite[(`zombie/inventory/InventoryItem.java:3443-3455`, `zombie/inventory/types/InventoryContainer.java:285-302`, `zombie/ZomboidGlobals.java:51`, `media/lua/shared/defines.lua:60`, `zombie/characters/IsoGameCharacter.java:10554-10556`)] A key ring in your main inventory counts as worn, so it takes the 30% rate. :cite[(`zombie/inventory/InventoryItem.java:5145-5157`)]

The light-when-attached tag is on the packed tents and packed sleeping bags, and on the four canteens (military, military full, plain and clay). :cite[(`media/scripts/generated/items/normal.txt:3277`, `media/scripts/generated/items/normal.txt:3291`, `media/scripts/generated/items/normal.txt:10840`, `media/scripts/generated/items/normal.txt:11013`, `media/scripts/generated/items/normal.txt:14001`, `media/scripts/generated/items/normal.txt:14028`, `media/scripts/generated/items/normal.txt:14056`, `media/scripts/generated/items/normal.txt:14085`)] A search of the scripts and Lua found that tag only in that file.

So a backpack with 70% weight reduction holding 20 weight of loot counts 6 for the loot when worn, and 20 if you carry it in your main inventory instead.

The main inventory holds at most 50 counted weight, whatever your limit, so you can be loaded to Heavy Load 4 at any Strength. :cite[(`zombie/inventory/ItemContainer.java:100`, `zombie/inventory/ItemContainer.java:274-277`, `zombie/inventory/ItemContainer.java:2311-2327`)]

## 3. Heavy Load levels

Heavy Load compares what you carry (counted as above) with your limit.

| Heavy Load level | You carry |
|---|---|
| 1 | more than 100% of your limit |
| 2 | 125% or more |
| 3 | 150% or more |
| 4 | 175% or more |

:cite[(`zombie/characters/Moodles/Moodle.java:381-395`, `zombie/characters/Moodles/MoodleStat.java:35`)] At Strength 5 with a limit of 12, that is above 12, then 15, 18 and 21.

## 4. What each Heavy Load level does to you

Most of these grow with every level of Heavy Load.

- **Movement:** your base movement speed starts at 0.8 and loses 0.15 per level before other modifiers. The Endurance moodle takes the same 0.15 per level, so a tired, overloaded survivor crawls. :cite[(`zombie/characters/IsoGameCharacter.java:9706-9712`)]
- **Running drains endurance faster:** x1.5 at level 1, x1.9 at 2, x2.3 at 3, x2.8 at 4. :cite[(`zombie/characters/IsoPlayer.java:3264-3278`)]
- **Standing still stops recovering endurance at level 2 and up.** Sitting down still recovers it at the full sitting rate, whatever you carry. :cite[(`zombie/characters/IsoPlayer.java:3326-3337`, `zombie/characters/IsoPlayer.java:3203-3212`)]
- **Walking drains endurance at level 3 and up.** :cite[(`zombie/characters/IsoPlayer.java:3280-3322`)]
- **Your body pays at level 3 and up:** while you are on your feet and your health is above 75, you take small, repeated health damage and back muscle strain. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2301-2314`)]
- **Combat:** swing speed -0.07 and the chance to defend against a zombie's attack -2, each per level, and your critical hit chance -5 per level. :cite[(`zombie/characters/IsoGameCharacter.java:9809`, `zombie/characters/IsoGameCharacter.java:13652`, `zombie/characters/IsoPlayer.java:3842`)]
- **Climbing a fence:** the chance to trip rises by 13 per level. :cite[(`zombie/ai/states/ClimbOverFenceState.java:526`)]
- **Climbing a wall or a sheet rope:** your climbing score loses 8 points per level, and climbing a tall wall strains your arms more for each level. If that score reaches 0 while you carry any Heavy Load, a tall wall cannot be climbed at all, unless Easy Climbing is enabled. :cite[(`zombie/characters/IsoGameCharacter.java:16711`, `zombie/ai/states/ClimbOverWallState.java:104`, `zombie/ai/states/ClimbOverWallState.java:317-335`, `zombie/SandboxOptions.java:250`)]
- **Climbing a rope up:** your effective strength drops by one per level. :cite[(`zombie/characters/IsoGameCharacter.java:16792-16803`)]
- **Zombie lunge through a window:** the chance to fall rises by 5 per level. :cite[(`zombie/characters/IsoGameCharacter.java:14189`)]
- **In a vehicle:** the discomfort modifier adds 0.25 per level. :cite[(`zombie/characters/IsoGameCharacter.java:15670-15675`, `media/lua/shared/defines.lua:58`)]

## 5. Getting stronger by carrying

Moving while you carry more than half your limit gives a 1 in 20 chance each real second of 2 Strength XP.

The check is made at most once per real second, on the wall clock, so game speed does not change it. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:33-37`, `zombie/characters/IsoPlayer.java:8980-8990`)] Strength needs 1,500 XP for its first level and 18,000 for level 5 (37,500 in total), so this is slow, but it is free. See [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level) for the rest. :cite[(`zombie/characters/skills/PerkFactory.java:136-138`)]

## 6. Multiplayer

The formula is the same. Your weight limit also travels between server and client with the body-damage sync, so both sides know it. :cite[(`zombie/network/packets/character/PlayerDamagePacket.java:46`, `zombie/network/packets/character/PlayerDamagePacket.java:60`)] We have not tested what happens when they disagree.

## Where to go next

- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance): what Heavy Load does to your endurance, and how to get it back.
- [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level): Strength XP and its multipliers.
- [Sickness, pain, drunkenness and the other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats): the moodles that lower your limit.

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java, Lua and item scripts. The limit table, the "would be" column and the worked sums are our own arithmetic on those rules.

Not tested: which side's weight limit wins after a client and server mismatch, which needs a server test with the evidence in the server log. We also did not measure the trait multiplier in a running game; the claim that it stays at x1 rests on reading where it is written.
:::
