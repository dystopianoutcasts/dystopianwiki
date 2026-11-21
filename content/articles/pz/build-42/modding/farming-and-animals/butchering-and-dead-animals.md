---
id: build-42-butchering-and-dead-animals
slug: butchering-and-dead-animals
title: Butchering and dead animals
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - husbandry
  - butchering
excerpt: >-
  What a dead animal becomes in 42.22: a corpse with butchering data, how Butchering level, size, meat ratio and rot set the meat you get, the hook, leather recipes, and who runs it.
last_updated: '2026-11-21'
related_articles:
  - the-three-farming-skills
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - modding-the-animaldefinitions-global-table
  - foraging-in-b42
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players who butcher](#2-two-ways-to-butcher) | [modders adding an animal that can die](#5-what-a-mod-animal-needs)

Outcast, a dead cow is a corpse on the ground, not an item in your bag. This page follows what the game does from the moment an animal dies, how much meat comes off and why the Butchering skill matters, and what a mod must give an animal so it can be cut up.

:::callout[The 1-minute version]{kind=key}
- A dead animal becomes a corpse object with data attached, not a "carcass item". The `carcassItem` field in the animal definitions is read, then never used. :cite[(`zombie/iso/objects/IsoDeadBody.java:2364-2368`, `zombie/characters/animals/AnimalDefinitions.java:236-238`)]
- For the 10 animal types that can hang on a butcher hook, the hook gives about 4.7 times as many items as the ground; any other animal gets the hook rate on the ground. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:267-271`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:16`)]
- Every 2 Butchering levels raise the top end of the meat count by 10 percent, and the level also raises the chance of the better cuts. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:275-276`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:416-421`)]
- Meat shrinks once the animal has been dead more than 12 game hours, and a rotten corpse gives rotten meat. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:301-311`)]
- The items are made on the server, or in single player. A multiplayer client does not make them. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:61`)]
:::

:::facts
- **Part lists** 63, one for each of the 21 breeds in 3 life stages :cite[(`media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:17-688`)]
- **Hook animals** 10 types :cite[(`media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:16`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:282`)]
- **Items from a hook against the ground, for hook animals** 2.8 against 0.6 of the listed count :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:267-271`)]
- **Skill bonus on the meat count** +10 percent per 2 levels, +50 percent at level 10 :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:275-276`)]
- **Meat starts shrinking after** 12 game hours, which is 45 real minutes at the default Day Length :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:302`, `zombie/SandboxOptions.java:413-423`)]
- **Leather and hide recipes** 9, all in the Farming crafting category :cite[(`media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:3-241`)]
:::

## 1. What happens when an animal dies

**An animal that dies becomes a corpse, and a Lua function fills in what can be cut off it.**

When the corpse is made, the engine calls the global Lua function `setAnimalBodyData` and passes the animal and the corpse's mod data. :cite[(`zombie/iso/objects/IsoDeadBody.java:2364-2368`)] That function stores the animal's type and breed, its blood amount, its `meatRatio` gene value, its size, whether it was a baby, whether it was road kill, and its wool if it had any. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:12-58`)] If the mother was more than 30 percent through a pregnancy, it also stores the number of unborn young. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:44-50`)]

The part list is looked up by joining the animal type and the breed name, so the dead `cow` of breed `angus` uses the entry `cowangus`. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:14-19`, `media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:102`)] The table has 63 entries, which is 21 breeds times 3 life stages. :cite[(`media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:17-688`)]

An entry can hold these keys, all seen in the vanilla file:

:::chips
- `parts`
- `bones`
- `noSkeleton`
- `feather`
- `head`
- `skull`
- `leather`
- `xpPerItem`
:::

The vanilla `xpPerItem` values range from 3 to 25. :cite[(`media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:16`)] Chickens and turkeys set `noSkeleton`, so a butchered bird leaves no skeleton. :cite[(`media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:12`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:153-165`)]

Some products come from the breed and the animal rather than the parts list. The feather count is the breed's `maxFeather` times the animal's size, for an adult whose breed has a `featherItem`. :cite[(`zombie/characters/animals/IsoAnimal.java:3448-3452`)] The breed's `woolType` is the item that shearing gives, and its `milkType` is the fluid put into a milk bucket. :cite[(`zombie/characters/animals/IsoAnimal.java:1813`, `zombie/characters/animals/IsoAnimal.java:1865`)]

The blood an animal holds is its `minBlood`, plus the range up to `maxBlood` scaled by its weight, divided by 100. As read, the weight share divides by the maximum weight minus the current weight instead of the maximum minus the minimum, which looks like a slip and gives very large numbers near full weight. :cite[(`zombie/characters/animals/IsoAnimal.java:3443-3446`)] We did not test it.

## 2. Two ways to butcher

**On the ground you take everything at once; on a hook you take it in steps, and a hook animal gives more.**

Ground butchering is the timed action `ISButcherAnimal`. Its server side calls `ButcheringUtil.butcherAnimalFromGround`, which hands out every part, the head and the feathers, and the leather for an animal that cannot hang on a hook. :cite[(`media/lua/shared/TimedActions/Animals/ISButcherAnimal.lua:49-59`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:60-135`)] Afterward the corpse becomes a bloody skeleton unless the parts entry says `noSkeleton`. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:153-165`)] The action takes 900 minus 20 for each Butchering level; we did not check what unit that is. :cite[(`media/lua/shared/TimedActions/Animals/ISButcherAnimal.lua:62-67`)]

The hook is a butcher hook object. An animal can hang only if its `AnimalAvatarDefinition` has `hook = true`, which is true for `cow`, `bull`, `cowcalf`, `ewe`, `ram`, `sow`, `boar`, `doe`, `buck` and `fawn`. :cite[(`media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:16`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:36`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:56`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:75`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:149`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:169`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:189`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:242`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:262`, `media/lua/shared/Definitions/animal/AnimalAvatarDefinition.lua:282`)] Other animals are butchered on the ground, and for them the ground rate is not applied. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:229-233`)]

The hook has its own timed actions, which are the steps a player takes:

:::chips
- Put the animal on the hook
- Gather or spill the blood
- Remove the head
- Remove the leather
- Remove the meat
- Get the bones
- Take the animal off the hook
:::

These are the vanilla actions `ISPutAnimalOnHook`, `ISGatherBloodFromAnimal`, `ISRemoveHeadFromAnimal`, `ISRemoveLeatherFromAnimal`, `ISRemoveMeatFromAnimal`, `ISGetAnimalBones` and `ISRemoveAnimalFromHook`. :cite[(`media/lua/shared/TimedActions/Animals/ISRemoveMeatFromAnimal.lua:92-100`, `media/lua/shared/TimedActions/Animals/ISRemoveLeatherFromAnimal.lua:105`, `media/lua/shared/TimedActions/Animals/ISRemoveHeadFromAnimal.lua:142`)] Meat removal runs the same part code with the ground flag off, and it takes 450 minus 15 for each level. :cite[(`media/lua/shared/TimedActions/Animals/ISRemoveMeatFromAnimal.lua:92-100`, `media/lua/shared/TimedActions/Animals/ISRemoveMeatFromAnimal.lua:140-145`)] In 42.22 the hook window checks for a bucket with a new helper, `ButcheringUtil.hasBucket`, and offers to bleed the animal when you carry none. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:687-689`, `media/lua/client/ISUI/Animal/ISButcherHookUI.lua:174`)]

## 3. How much comes off, and how good it is

**The count is the listed number times size, hook or ground, skill and meat ratio, then cut down by time since death.**

For each part the code starts from the listed `minNb` and `maxNb`, multiplies by the animal's size, then by 0.6 on the ground or 2.8 on a hook, and then multiplies only the top end by 1 plus a tenth for every 2 whole Butchering levels. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:226-276`)] For food parts, both ends are also multiplied by the corpse's `meatRatio` gene value. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:280-291`)] Road kill halves both ends. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:293-297`)] The result is a random whole number between the ends, never below 1. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:313-318`)]

Time matters. After the animal has been dead more than 12 game hours, both ends and the meat ratio are divided by `deathAge / 13`, and a corpse that has reached a rot stage gives rotten meat. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:301-311`)] The corpse stores `deathAge` as the game hours since death. :cite[(`zombie/iso/objects/IsoDeadBody.java:1662-1666`)] At the default Day Length one game hour is 3.75 real minutes, so 12 hours is 45 real minutes. :cite[(`zombie/SandboxOptions.java:71`, `zombie/SandboxOptions.java:413-423`)]

Meat that is listed in `AnimalPartsDefinitions.meat` comes in several cuts. The list is walked from the best cut down. For each cut the chance is its `baseChance` times size times meat ratio times (Butchering level / 7), and the number given is that share of the total, rounded.

The last cut has no chance and takes whatever is left. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:363-380`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:416-421`)] At level 0 the factor is 0, so every item is the last, plainest cut. Each item's hunger, calories and nutrients are the base value times size times meat ratio times a random 0.9 to 1.1; on the ground the cut's hunger boost is also times 0.6. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:387-393`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:426-447`)]

Butchering XP is the part's `xpPerItem` for each plain item, and for cuts it is that number times 0.8 times the cut's place from the bottom of the list, so the best cut pays the most. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:339`, `media/lua/shared/Definitions/animal/ButcheringUtil.lua:363-407`)] The game's own text for the skill is "Increases the quality of meat harvested from animals." :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5609`)] Blood on you after ground butchering is a random number below 22 minus twice your level, plus twice the blood left in the animal. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:168-177`)]

:::callout[A worked example, by arithmetic]{kind=design}
Take a cow whose part line lists `minNb` 2 and `maxNb` 4, at size 1.0 and meat ratio 0.9, butchered on a hook by a level 6 player an hour after death. The ends are 2 x 2.8 x 0.9 = 5.04 and 4 x 2.8 x 1.3 x 0.9 = 13.1, so the player gets between 5 and 13 of that item. On the ground at level 0 the ends are 2 x 0.6 x 0.9 = 1.1 and 4 x 0.6 x 0.9 = 2.2. The numbers 2 and 4 are made up for the example; the formula is the code's.
:::

## 4. Leather, hides and dead animals in the world

**Hides are worked up with nine recipes, and a few small dead animals can be found by foraging.**

A corpse with a `leather` entry gives a leather item. The hook gives it in its own step, and on the ground only an animal that cannot hang on a hook gives leather (the calf and the fawn can hang, so they give none from the ground). :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:104-115`, `media/lua/shared/Definitions/animal/AnimalPartsDefinitions.lua:98`)] The nine recipes that work a hide (the three `CutUpLeather_*` recipes among them) are `CutUpLeather_Large`, `CutUpLeather_Medium`, `CutUpLeather_Small`, `DryLargeLeather`, `DryMediumLeather`, `DrySmallLeather`, `TanLeather`, `RemoveFlesh` and `RemoveFur`.

All nine are in the Farming crafting category. :cite[(`media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:3`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:20`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:37`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:54`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:86`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:117`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:161`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:202`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:237`)] A drying recipe lists 604,800 as its time, which is a week if the unit is seconds; we did not check the unit. :cite[(`media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:54-58`)]

Foraging has a hidden category called `DeadAnimals`. It holds five items: a dead bird, squirrel, rabbit, rat and mouse. :cite[(`media/lua/shared/Foraging/forageCategories.lua:55-60`, `media/lua/shared/Foraging/Categories/DeadAnimals.lua:7`, `media/lua/shared/Foraging/Categories/DeadAnimals.lua:34`, `media/lua/shared/Foraging/Categories/DeadAnimals.lua:59`, `media/lua/shared/Foraging/Categories/DeadAnimals.lua:82`, `media/lua/shared/Foraging/Categories/DeadAnimals.lua:109`)] They are found items, not corpses of living animals, so they are not butchered by this code.

That list explains the older "squirrel and bird" lines: the game has items for them, but no live squirrel or bird definition. See [Foraging in B42](/pz/build-42/modding/farming-and-animals/foraging-in-b42).

## 5. What a mod animal needs

**An animal that can die needs a parts entry and a `meatRatio` gene, or its death writes a Lua error.**

`setAnimalBodyData` looks up `AnimalPartsDefinitions.animals[type + breed]` and then reads `def.feather` without checking that `def` exists. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:18-27`)] It also reads the `meatRatio` gene with no check. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:40`)] So a new breed or species needs one parts entry per life stage and the `meatRatio` gene in its gene list, as read; we did not run a mod without them. The `carcassItem` field is not needed, because nothing reads it: vanilla sets it only for the cow family, to `Base.CorpseCow` and `Base.CorpseCalf`, and no item script defines those names. :cite[(`media/lua/shared/Definitions/animal/CowDefinitions.lua:155`, `media/lua/shared/Definitions/animal/CowDefinitions.lua:223`)] :cite[(`zombie/characters/animals/AnimalDefinitions.java:236-238`)]

## 6. Which side runs it

**Butchering makes its items on the server in multiplayer, and the game checks the corpse is still on the map first.**

`butcherAnimalFromGround` returns at once on a multiplayer client. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:60-62`)] The action's `complete` step is where it runs, and 42.22 added a check there that the corpse is still a dead body on the map; if it is gone, for example because another player picked it up, the action fails. :cite[(`media/lua/shared/TimedActions/Animals/ISButcherAnimal.lua:49-57`)] The amounts are worked out in that server-side code from the corpse's own data and the butcher's Butchering level, not from anything the client sends. :cite[(`media/lua/shared/Definitions/animal/ButcheringUtil.lua:226-227`)] For the packet side, see [timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network).

:::callout[How we know]{kind=proof}
All rules are read from the 42.22 Lua and Java cited. We did not butcher an animal in a running game, so the worked example and the real-time conversions are arithmetic. The units of the timed-action durations (900, 450) and of the recipe times (604,800) were not checked.

Not verified: how the hook UI orders its steps for a player, what the hook does when two players use it, and the nutrition numbers of each cut.

Changed since the older page: "a carcass item is made on death" was wrong, since `carcassItem` is never read; the quality rule is now the formulas above; "squirrel and bird" are found items only; the claim that commensal rodents spawn in containers was dropped because we did not verify it. The 42.21 to 42.22 delta changed `ButcheringUtil.lua` (the `hasBucket` helper), `ISButcherAnimal.lua` (the body check), `ISKillAnimalInInventory.lua` (the corpse goes into your hands) and `ISButcherHookUI.lua`.
:::
