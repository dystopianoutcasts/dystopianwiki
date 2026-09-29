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
  Internal (script) names are what you use in scripts and Lua (Perks.Blacksmith,
  SkillTrained = Blacksmith, SkillRequired = Blacksmith:4). Display names are
  what the player sees.
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - traits
  - professions-occupations
  - modding-add-a-skill
  - modding-add-a-trait
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# The Build 42 skill list (internal name -> display name)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Internal (script) names are what you use in scripts and Lua (`Perks.Blacksmith`,
`SkillTrained = Blacksmith`, `SkillRequired = Blacksmith:4`). Display names are
what the player sees.

The pzwiki Skill page (revid 1436755) organizes skills into **six named
categories** -- *Passive, Agility, Combat, Crafting, Firearm, Survivalist* -- but
its own "List of skills" table also carries a separate **Farming** subsection
(Agriculture, Animal Care, Butchering). The page carries an `{{Outdated}}` banner
noting "Skill categorization is still based on Build 41," so treat the *grouping*
of the animal/farming skills as the wiki's current best rather than a guaranteed
in-engine category. Category membership below is **[CONFIRMED]** from the wiki;
the exact engine perk-category enum is a remaining gap. **[CONFIRMED via pzwiki
Skill, revid 1436755]**

Internal names remain **[CONFIRMED]** from the 42.20 vanilla
`items_literature_skill.txt` (each appears as a `SkillTrained` value on a skill
book): Aiming, Blacksmith, Butchering, Carpentry, Carving, Cooking, Electricity,
Farming, FirstAid, Fishing, FlintKnapping, Foraging, Glassmaking, Husbandry,
LongBlade, Maintenance, Masonry, Mechanics, MetalWelding, Pottery, Reloading,
Tailoring, Tracking, Trapping.

### Internal-vs-display gotchas [CONFIRMED via pzwiki Skill]

| Internal (script) name | Display name (character screen) |
|------------------------|---------------------------------|
| `Blacksmith`           | Blacksmithing                   |
| `FlintKnapping`        | Knapping                        |
| `MetalWelding`         | Welding                         |
| `Electricity`          | Electrical                      |
| `Farming`              | **Agriculture** (new relabel)   |
| `Husbandry`            | **Animal Care** (new relabel)   |
| `Sprinting`            | **Running** (display; internal name `Sprinting` **[LIKELY]**) |

> The `Farming->Agriculture` and `Husbandry->Animal Care` relabels are **new
> discoveries** from the wiki cache -- the previous draft assumed the display
> matched the internal name for these two. The internal names are still
> `Farming`/`Husbandry` (confirmed by the skill books), but the UI shows
> "Agriculture" and "Animal Care."

### Grouped view (as the character/health-panel Skills tab organizes them)

Membership **[CONFIRMED via pzwiki Skill, revid 1436755]**; the running order and
whether "Farming" is a true engine category vs. a wiki grouping are the only soft
spots.

- **Passive:** Strength, Fitness. (Unique XP curve -- see section 4.)
- **Agility:** Running (internal `Sprinting`), Lightfooted, Nimble, Sneaking.
- **Combat (melee):** Axe, Long Blunt, Short Blunt, Long Blade (`LongBlade`),
  Short Blade, Spear, Maintenance.
- **Crafting (the reworked heart of B42 -- exactly 12 skills):** Carpentry,
  Blacksmithing (`Blacksmith`), Carving, Cooking, Electrical (`Electricity`),
  Glassmaking, Knapping (`FlintKnapping`), Masonry, Mechanics, Pottery, Tailoring,
  Welding (`MetalWelding`). The wiki's Crafting table lists precisely these 12,
  confirming the community "12 crafting skills" count.
- **Firearm:** Aiming, Reloading.
- **Farming (animal/agriculture group):** Agriculture (`Farming`), Animal Care
  (`Husbandry`), Butchering.
- **Survivalist:** First Aid, Fishing, Foraging, Tracking, Trapping.

> **Correction to the prior draft:** the old grouping lumped Fishing, Foraging,
> Trapping, and Tracking into a "farming/animal (husbandry) group." The wiki
> places all four in **Survivalist**, and puts only Agriculture, Animal Care, and
> Butchering in the Farming group. First Aid is Survivalist, not a standalone
> "Survival" bucket.

> There is still no single machine-readable "Perks.txt" in the vanilla mirror
> enumerating every perk with its engine category. The 24 internal names above
> come from the skill books (strongest source-level evidence); the category
> assignments come from the canonical wiki. Both agree on the roster.
