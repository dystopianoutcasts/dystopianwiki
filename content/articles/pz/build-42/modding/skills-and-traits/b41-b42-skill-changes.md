---
id: build-42-b41-b42-skill-changes
slug: b41-b42-skill-changes
title: B41 -> B42 skill changes
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - skills
  - traits
  - professions
  - xp
  - craftrecipe-gating
excerpt: >-
  What changed for skills between Build 41 and 42.22: nine new skills, a regrouped Skills tab, XP that the server now computes, new sandbox multipliers, and what a Build 41 skill mod must fix.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - trait-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15. The Build 41 side is the Java in the owner's B41 capture (`GAME/PZ_Engine_Records/B41/src/`), which has no Lua and no translation files.

:::callout[The 1-minute version]{kind=key}
- Build 41 registered 26 skills. Build 42.22 registers 35. No Build 41 skill was removed, and nine were added.
- The Build 41 perk id `MetalWelding` is still there, and `Blacksmith` is a new second metal skill.
- In 42.22, Fitness, Strength and the four agility skills share one parent, Physical. In Build 41 they sat under `Passiv` and `Agility`. Farming and First Aid moved out of Crafting.
- The cost of each level did not change.
- XP is computed on the server in 42.22. In Build 41 a client sent its raw amount as a whole number, applied the gain itself, and the server added the amount without the boost step.
- The single XP multiplier and its passive-skills switch are gone. 42.22 has a global value, a switch and 35 per-skill values.
- Recipe magazines read `LearnedRecipes` in 42.22. Build 41 read `TeachedRecipes`.
:::

:::facts
- **Registered perks, Build 41** 32 (26 skills and 6 group ids)
- **Registered perks, Build 42.22** 42 (35 skills and 7 group ids)
- **Skills added** 9
- **Skills removed** 0
- **Per-skill sandbox multipliers, Build 42.22** 35
:::

## 1. Nine skills were added

**Build 42.22 keeps all 26 Build 41 skills and adds nine more.**

Build 41's `PerkFactory.init` registers 32 perks: 26 skills and the six group ids Combat, Firearm, Crafting, Survivalist, Passiv and Agility (Build 41 `PerkFactory` lines 96 to 127). Build 42.22 registers 42: 35 skills and seven group ids. :cite[(`zombie/characters/skills/PerkFactory.java:105-148`)] Every Build 41 skill id is still registered. The nine new skills are all in the 42.22 list:

| Skill (engine id) | Group | Has a skill book |
|---|---|---|
| Carving (`Carving`) | Crafting | yes |
| Glassmaking (`Glassmaking`) | Crafting | yes |
| Knapping (`FlintKnapping`) | Crafting | yes |
| Masonry (`Masonry`) | Crafting | yes |
| Blacksmithing (`Blacksmith`) | Crafting | yes |
| Pottery (`Pottery`) | Crafting | yes |
| Animal Care (`Husbandry`) | Farming | yes |
| Butchering (`Butchering`) | Farming | yes |
| Tracking (`Tracking`) | Survival | yes |

:cite[(`zombie/characters/skills/PerkFactory.java:118`, `zombie/characters/skills/PerkFactory.java:122-125`, `zombie/characters/skills/PerkFactory.java:127`, `zombie/characters/skills/PerkFactory.java:133`, `zombie/characters/skills/PerkFactory.java:147-148`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-196`)] The full list, with display names, is in [The Build 42 skill list](/pz/build-42/modding/skills-and-traits/the-build-42-skill-list).

## 2. Metalworking: one id kept, one id added

**Build 41 had one metal perk, `MetalWelding`, and Build 42.22 keeps it and adds `Blacksmith` beside it.**

The Build 41 list has `MetalWelding` and no `Blacksmith` (Build 41 `PerkFactory` line 113). Both ids are registered in 42.22. :cite[(`zombie/characters/skills/PerkFactory.java:125`, `zombie/characters/skills/PerkFactory.java:129`)] The game's own descriptions are short: Welding "allows the building of crude metal barricades and objects", and Blacksmithing "allows the creation of metal items and objects". :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5602`, `media/lua/shared/Translate/EN/IG_UI.json:5606`)]

The older page said Build 41 had one skill called "Metalworking" that Build 42 split in two. The Build 41 capture has no translation files, so we cannot read what Build 41 called `MetalWelding`.

A Build 41 mod that names `Perks.MetalWelding` still loads. It only misses the new `Blacksmith` skill, and a recipe that used to be gated by one metal skill has to pick which of the two it needs. The older page's descriptions of what each skill builds came from a community wiki, and we dropped them.

## 3. The groups moved

**The Skills tab groups skills by parent, and the parents changed for 8 of the Build 41 skills.**

| Build 41 parent | Skills | Build 42.22 parent |
|---|---|---|
| `Passiv` | `Fitness`, `Strength` | `PhysicalCategory` |
| `Agility` | `Sprinting`, `Lightfoot`, `Nimble`, `Sneak` | `PhysicalCategory` |
| `Crafting` | `Farming` | `FarmingCategory` |
| `Crafting` | `Doctor` | `Survivalist` |
| `Crafting` | `Woodwork`, `Cooking`, `Electricity`, `MetalWelding`, `Mechanics`, `Tailoring` | `Crafting` (unchanged) |

:cite[(`zombie/characters/skills/PerkFactory.java:117-121`, `zombie/characters/skills/PerkFactory.java:126`, `zombie/characters/skills/PerkFactory.java:128-129`, `zombie/characters/skills/PerkFactory.java:135-148`)] The Build 41 parents are in Build 41 `PerkFactory` lines 108 to 127. The `Agility` group id is still registered in 42.22, but nothing is registered under it, so the tab never draws it. `Passiv` is declared and never registered. :cite[(`zombie/characters/skills/PerkFactory.java:140`, `zombie/characters/skills/PerkFactory.java:335-382`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-283`)]

Two things in a Build 41 mod break because of this. Code that tests a skill's parent against `Perks.Passiv` or `Perks.Agility` no longer matches Fitness, Strength or the agility skills. And a call that grants XP to `Perks.Passiv`, which is declared but not registered, finds no perk in the registered list, and the next line of the function then uses that missing perk. We read that from the code, and we did not run it. :cite[(`zombie/characters/IsoGameCharacter.java:17785-17795`)]

## 4. XP rules that changed

**The multiplier chain is almost the same, but the server now owns it, and a few rules moved.**

The base costs and the 1.5 multiplier are the same, so every level needs the same XP as in Build 41 (Build 41 `PerkFactory` line 14 and lines 96 to 127). The starting-level factors, Fast Learner, Slow Learner and the protein factor are the same too (Build 41 `IsoGameCharacter` lines 12554 to 12600). These are the changes.

| Rule | Build 41 | Build 42.22 | Code (42.22) |
|---|---|---|---|
| Who computes XP in multiplayer | A client's `AddXP` sent its raw amount, cut to a whole number, to the server in an `AddXp` packet, and also applied the gain on the client with the boost step. The server's own `addXp` sent an `AddXp` packet to the player's connection, and the server-side add was boost-off. | The Lua `addXp` does nothing on a client. The server computes the XP and sends the XP record to the client. | `zombie/Lua/LuaManager.java:11855-11867`, `zombie/network/GameServer.java:1892-1902`, `zombie/network/NetworkPlayerManager.java:25-43` |
| Asleep | No check. | A sleeping character gains nothing. | `zombie/characters/IsoGameCharacter.java:17784` |
| Pacifist | Also x0.75 on Maintenance. | x0.75 on the melee skills and Aiming, not Maintenance. | `zombie/characters/IsoGameCharacter.java:17842-17853` |
| Crafty trait | None. | x1.3 on every skill under Crafting. | `zombie/characters/IsoGameCharacter.java:17855-17859` |
| Losing a level | The `AddXP` function only raises levels. | A second loop in `AddXP` calls `LoseLevel` when the total falls below the current level's total. | `zombie/characters/IsoGameCharacter.java:17916-17924` |
| Sandbox | `XpMultiplier` (0.001 to 1000, default 1.0) for every skill but the passive ones, and `XpMultiplierAffectsPassive` (default false) for them. | `MultiplierConfig.Global` (0 to 1000), a switch (default true) and 35 per-skill values. The global value covers every skill, Strength and Fitness included. | `zombie/SandboxOptions.java:1799-1842`, `zombie/characters/IsoGameCharacter.java:17867-17873` |
| `AddXP` event | Fired when the `callLua` argument is true. | Fired whenever the call is not running on a multiplayer client; the `callLua` argument is not read. | `zombie/characters/IsoGameCharacter.java:17943-17945` |



The Build 41 side of that table is Build 41 `IsoGameCharacter` lines 12539 to 12542 (the client send), Build 41 `AddXp` line 43 (the server adding it), Build 41 `GameServer` lines 2624 to 2638 (the server's own `addXp`), Build 41 `IsoGameCharacter` lines 12601 to 12612 (Pacifist), Build 41 `IsoGameCharacter` lines 12621 to 12625 (the sandbox multiplier) and Build 41 `IsoGameCharacter` lines 12641 to 12669 (the level loop and the event). Build 41 `SandboxOptions` lines 193 to 194 has the two Build 41 sandbox options.

The Build 42.22 Java has no `XpMultiplier` option. The Sandbox translation file still holds the old labels. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:358-361`)] One preset file, the one for "Six Months Later", still sets `XpMultiplier = 1.0`, and the 42.22 Java does not read it. :cite[(`media/lua/shared/Sandbox/SixMonthsLater.lua:29`)]

In 42.22 the Strength and Fitness traits that depend on those levels are swapped by `XpUpdate.lua` on each level change. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:196-238`)] The Build 41 Lua is not in the capture, so we cannot say whether that is new.

## 5. Recipe magazines changed their key

**Build 41 read `TeachedRecipes` on an item, and Build 42.22 reads `LearnedRecipes`.**

The Build 41 item loader has a `TeachedRecipes` branch (Build 41 `Item` lines 2465 to 2471). The 42.22 loader has a `LearnedRecipes` branch and no `TeachedRecipes` branch. :cite[(`zombie/scripting/objects/Item.java:2777-2784`)] A ported magazine that still says `TeachedRecipes` teaches nothing. The reading rules are in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths).

The Build 41 `Recipe` loader already reads `SkillRequired` and `NeedToBeLearn` (Build 41 `Recipe` lines 170 to 171 and 190 to 202). The Build 41 Java has no `AutoLearnAll` or `AutoLearnAny`, and the 42.22 `craftRecipe` loader reads both. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:397-445`)] The trait side of the move from Lua calls to scripts is in [Vanilla trait reference](/pz/build-42/modding/skills-and-traits/trait-reference).

## 6. What to change in a Build 41 skill mod

**Four changes are needed in a port.**

- **Perk lookups:** keep ids such as `Perks.MetalWelding`, and add `Blacksmith` where a recipe or a profession needs it.
- **Group checks:** replace any parent test against `Passiv` or `Agility` with `PhysicalCategory`, and move Farming and Doctor tests off `Crafting`.
- **XP grants:** call the Lua `addXp` on the server. A client call changes nothing. See [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).
- **Magazines:** rename `TeachedRecipes` to `LearnedRecipes`.

:::callout[How we know]{kind=proof}
The 42.22 side is read from the lines cited. The Build 41 side is the Build 41 Java in the owner's capture (label 41.78.16, reconstructed, not recorded at capture time), counted with a script: 32 registrations, 26 skills, 6 group ids. We confirmed by search that 42.22 `GameClient` has no `sendAddXp` and that no `AddXp` packet class exists, and that the Build 41 Java has no `AutoLearn` key.

Not checked: what the Build 41 Skills tab drew, since the Build 41 Lua is not in the capture, so we say only that the parents changed. Also not checked: what Build 41 displayed for each skill (there are no translation files in the Build 41 capture), so the older page's "relabeled" list is not confirmed for Build 41, and the display names above are only the 42.22 ones. Also not checked: the Build 41 Lua XP rules. Dropped from the older page: the community-wiki descriptions of Welding and Blacksmithing, the "Occupations now distribute Blunt across Long Blunt and Short Blunt" note (tagged likely and not shown by the code), and the "no skill removed" claim's wiki source, which is now confirmed by comparing the two registration lists.
:::
