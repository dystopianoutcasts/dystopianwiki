---
id: build-42-the-build-42-skill-list
slug: the-build-42-skill-list
title: The Build 42 skill list
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
  The 35 skills Build 42.22 registers, in the six groups the Skills tab shows, and the three names a skill can have: engine id, display name and skill-book name.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - the-xp-grant-skill-query-lua-api
  - trait-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- Build 42.22 registers 35 skills. Six groups hold them on the Skills tab. A seventh group id, Agility, has no skill under it, so the tab never draws it.
- The vanilla list is written in Java, not in a script file. A mod adds its own skills in a `media/perks.txt` file.
- A skill can have three names. The engine id is what recipes, `XPBoosts` and Lua use, for example `Woodwork` for Carpentry. A skill book names the skill a third way, for example `Carpentry`. The character screen shows a display name.
- A recipe that writes a name the engine does not know gets an unknown-skill warning, and that skill is skipped.
- 24 of the 35 skills have skill books in vanilla. The other 11 do not.
:::

:::facts
- **Registered skills** 35
- **Groups the Skills tab draws** 6
- **Group ids with no skill under them** 1 (Agility)
- **Skills with skill books** 24
- **Skills without skill books** 11
- **Perk constants declared in Java** 47, of which 42 are registered (35 skills and 7 group ids)
- **Perk slots in the engine's table** 256
:::

## 1. Where the list comes from

**Vanilla's skills are registered in Java at start-up, and a mod adds its own through a separate file.**

`PerkFactory.init()` registers 42 perks: 35 skills and 7 group ids (Combat, Firearm, Crafting, Survivalist, PhysicalCategory, Agility and FarmingCategory). :cite[(`zombie/characters/skills/PerkFactory.java:105-148`)] The `Perks` class declares 47 constants. Five are never registered: `None` and `MAX` are placeholders, and `Melee`, `Passiv` and `Melting` have no registration. :cite[(`zombie/characters/skills/PerkFactory.java:335-382`)] The table that holds perks has 256 slots. :cite[(`zombie/characters/skills/PerkFactory.java:21`)]

Each registration carries ten XP costs, and the registration multiplies each by 1.5. The numbers are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers). :cite[(`zombie/characters/skills/PerkFactory.java:87-96`)]

A mod skill comes from `media/perks.txt` in the mod's version folder, or its common folder if the version folder has none.

A block in it reads `parent`, `translation`, `passive` and `xp1` to `xp10`. A file with a missing or wrong `VERSION`, or with a block that is not a `perk` block, is rejected and the error is logged. :cite[(`zombie/characters/skills/CustomPerks.java:32-69`, `zombie/characters/skills/CustomPerks.java:84-108`, `zombie/characters/skills/CustomPerks.java:110-135`, `zombie/characters/skills/CustomPerks.java:137-173`)] The engine then adds each custom perk to the Lua `Perks` table. :cite[(`zombie/characters/skills/CustomPerks.java:71-77`)] The how-to is [Modding: add a skill](/pz/build-42/modding/skills-and-traits/modding-add-a-skill).

## 2. The skills by group

**The Skills tab draws one section for each group id that has at least one skill under it, and lists those skills inside it.**

The tab collects every perk whose parent is not `None` and files it under its parent. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-283`)] Nothing is registered with Agility as its parent, so Agility never gets a section. Fitness, Strength, Lightfooted, Nimble, Running and Sneaking all sit under `PhysicalCategory`. :cite[(`zombie/characters/skills/PerkFactory.java:135-144`)] First Aid sits under Survival, not under Crafting. :cite[(`zombie/characters/skills/PerkFactory.java:121`)]

Each skill below shows its display name, and its engine id where the two differ by more than spacing. The display names are the English translation strings. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:189-232`, `media/lua/shared/Translate/EN/IG_UI.json:749-751`, `media/lua/shared/Translate/EN/IG_UI.json:1675`, `media/lua/shared/Translate/EN/IG_UI.json:4765`)]

::::cards
:::card[Combat - Melee, 7 skills]{accent=orange}
Axe, Long Blunt (`Blunt`), Short Blunt (`SmallBlunt`), Long Blade (`LongBlade`), Short Blade (`SmallBlade`), Spear, Maintenance.
:::
:::card[Combat - Firearms, 2 skills]{accent=purple}
Aiming, Reloading.
:::
:::card[Crafting, 12 skills]{accent=blue}
Carpentry (`Woodwork`), Carving, Cooking, Electrical (`Electricity`), Glassmaking, Knapping (`FlintKnapping`), Masonry, Blacksmithing (`Blacksmith`), Mechanics, Pottery, Tailoring, Welding (`MetalWelding`).
:::
:::card[Survival, 5 skills]{accent=cream}
First Aid (`Doctor`), Fishing, Foraging (`PlantScavenging`), Tracking, Trapping.
:::
:::card[Physical, 6 skills]{accent=orange}
Fitness, Strength, Lightfooted (`Lightfoot`), Nimble, Running (`Sprinting`), Sneaking (`Sneak`).
:::
:::card[Farming, 3 skills]{accent=purple}
Agriculture (`Farming`), Animal Care (`Husbandry`), Butchering.
:::
::::

The group ids behind the cards are `Combat`, `Firearm`, `Crafting`, `Survivalist`, `PhysicalCategory` and `FarmingCategory`. Their display names are "Combat - Melee", "Combat - Firearms", "Crafting", "Survival", "Physical" and "Farming". :cite[(`zombie/characters/skills/PerkFactory.java:105`, `zombie/characters/skills/PerkFactory.java:113`, `zombie/characters/skills/PerkFactory.java:116`, `zombie/characters/skills/PerkFactory.java:130`, `zombie/characters/skills/PerkFactory.java:135`, `zombie/characters/skills/PerkFactory.java:145`, `media/lua/shared/Translate/EN/IG_UI.json:198`, `media/lua/shared/Translate/EN/IG_UI.json:209`, `media/lua/shared/Translate/EN/IG_UI.json:229-232`)]

## 3. Three names for one skill

**Scripts, skill books and the screen name the same skill differently, and only the engine id works in a recipe or a profession.**

Recipe keys such as `SkillRequired`, `AutoLearnAll`, `AutoLearnAny` and `xpAward`, and the `XPBoosts` of a profession, are looked up by engine id. A name the engine does not know is skipped: a recipe logs an unknown-skill warning, and the profession loader skips it without a message. :cite[(`zombie/characters/skills/PerkFactory.java:392-394`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:66-76`)] Vanilla writes `SkillRequired = Woodwork:3` and `XPBoosts = Doctor=6;SmallBlade=1`. The same rule gives `SkillRequired = Blacksmith:4` for Blacksmithing and `Perks.Blacksmith` in Lua, and a skill book for it says `SkillTrained = Blacksmith`. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_heckle_comb.txt:40`, `media/scripts/generated/characters/character_professions.txt:60`)]

A skill book names its skill in `SkillTrained`, and the Lua table `SkillBook` turns that name into the skill. For most skills the two names match, and three differ. :cite[(`media/scripts/generated/items/literature.txt:6319`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:19-20`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:59-60`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:83-84`)]

| Display name | Engine id | Book name (`SkillTrained`) |
|---|---|---|
| Carpentry | `Woodwork` | `Carpentry` |
| First Aid | `Doctor` | `FirstAid` |
| Foraging | `PlantScavenging` | `Foraging` |

Six more skills show a display name that differs from the engine id, and for them the book name equals the engine id. Running differs too, and it has no book.

| Display name | Engine id | Skill book |
|---|---|---|
| Blacksmithing | `Blacksmith` | yes |
| Welding | `MetalWelding` | yes |
| Knapping | `FlintKnapping` | yes |
| Electrical | `Electricity` | yes |
| Agriculture | `Farming` | yes |
| Animal Care | `Husbandry` | yes |
| Running | `Sprinting` | no |

:cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-4`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:43-44`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:51-52`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:75-76`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:99-100`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:123-124`)] The ids of Lightfooted, Sneaking, Long Blunt, Short Blunt and Short Blade also differ from their display names, and none of those five has a book.

## 4. Which skills have books

**Twenty-four skills have skill books: all 12 crafting skills, all 5 survival skills, all 3 farming skills, and Maintenance, Long Blade, Aiming and Reloading.**

The `SkillBook` table has 24 entries, one for each skill with a book. :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-196`)] The vanilla script holds 120 book items, which is 24 skills with 5 volumes each, and each item sets `NumLevelsTrained = 2`. The first Carpentry volume shows the shape. :cite[(`media/scripts/generated/items/literature.txt:6311-6322`)]

The 11 skills without a book are Axe, Long Blunt, Short Blunt, Short Blade, Spear, Fitness, Strength, Lightfooted, Nimble, Running and Sneaking. The way a book changes XP is in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers), and the reading rules are in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths).

:::callout[How we know]{kind=proof}
Every count comes from a script run over `PerkFactory.java`, the `SkillBook` table and the vanilla scripts: 42 registrations, 35 skills, 7 group ids, 24 `SkillBook` entries, and 120 book items that set `NumLevelsTrained = 2`. We read the Skills tab from `ISCharacterInfo.lua`. We did not open it in a game, so the order of the sections on screen is not checked.

What the older page said and 42.22 does not support: Passive and Agility as groups with skills in them, and the claim that all 24 skill-book names are engine ids. Three book names (`Carpentry`, `FirstAid`, `Foraging`) are not engine ids. The groups here are read from the code, not from the community wiki, and the wiki's "outdated categorization" worry no longer applies. The Welding and Blacksmithing split is in [B41 to B42 skill changes](/pz/build-42/modding/skills-and-traits/b41-b42-skill-changes).
:::
