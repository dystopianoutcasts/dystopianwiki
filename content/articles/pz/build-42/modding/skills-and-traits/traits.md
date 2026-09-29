---
id: build-42-traits
slug: traits
title: Traits
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
  What a trait is: a character-creator modifier with a point cost (negative
  number = costs points to take; positive number = refunds points) and optional
  effects -- starting-skill XP boosts, free...
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
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
# Traits (B42 changes + new traits)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What a trait is:** a character-creator modifier with a point cost (negative
number = costs points to take; positive number = refunds points) and optional
effects -- starting-skill XP boosts, free recipes, granted traits, buffs, mutual
exclusions. "Points to Spend" must be >= 0 to start; positive traits beyond the
occupation-adjusted budget must be offset by negative traits. **[CONFIRMED via
pzwiki Trait, revid 1442751]**

> **Sign convention (important):** on the pzwiki Trait table, *positive/beneficial*
> traits show a **negative** points number (they cost you points, e.g. Athletic
> -10), and *negative/detrimental* traits show a **positive** number (they refund
> points, e.g. Unfit +10). The tables below preserve the wiki's signs.

### 6a. Full positive-trait roster (selectable at creation) [CONFIRMED via pzwiki Trait]

Internal trait IDs are the `id=` values from the wiki table (these are the vanilla
`base:` identifiers minus namespace; e.g. `traitTinkerer`). Points use the wiki
sign convention.

| Trait (display) | Internal id | Points | Skill / effect highlights |
|-----------------|-------------|--------|---------------------------|
| Adrenaline Junkie | traitAdrenalineJunkie | -4 | +speed when highly panicked |
| Angler | traitAngler | -4 | +1 Fishing; knows fishing rod; improves foraging |
| Artisan | traitArtisan | -2 | +1 Glassmaking, +1 Pottery |
| Athletic | traitAthletic | -10 | +4 Fitness; +20% run/sprint speed |
| Baseball Player | traitBaseballPlayer | -4 | +1 Long Blunt |
| Blacksmith Knowledge | traitBlacksmith | -6 | +1 Maintenance, +2 Blacksmithing |
| Brave | traitBrave | -4 | 30% panic (except night terrors/phobias) |
| Brawler | traitBrawler | -6 | +1 Axe, +1 Long Blunt |
| Cat's Eyes | traitCatsEyes | -3 | +20% night vision; improves foraging |
| Crafty | traitCrafty | -3 | 130% XP for all crafting skills |
| Dextrous | traitDextrous | -2 | 50% inventory transfer time |
| Eagle Eyed | traitEagleEyed | -4 | wider FoV; improves foraging |
| Fast Healer | traitFastHealer | -6 | injuries less severe |
| Fast Learner | traitFastLearner | -6 | 130% XP (except Strength/Fitness) |
| Fast Reader | traitFastReader | -2 | 130% reading speed |
| First Aider | traitFirstAider | -2 | +1 First Aid |
| Fit | traitFit | -6 | +2 Fitness |
| Former Scout | traitFormerScout | -6 | +1 First Aid, +1 Fishing, +1 Foraging; faster fire-start |
| Gardener | traitGardener | -2 | +1 Agriculture; improves foraging |
| Graceful | traitGraceful | -4 | 60% footstep sound radius |
| Gymnast | traitGymnast | -5 | +1 Lightfooted, +1 Nimble |
| Handy | traitHandy | -8 | +1 Carpentry, +1 Carving, +1 Maintenance, +1 Masonry; +100HP constructions |
| Herbalist | traitHerbalist | -4 | +1 Foraging; herbal meds/poultices |
| Hiker | traitHiker | -5 | +1 Foraging, +1 Trapping |
| Hunter | traitHunter | -8 | +1 Aiming, +1 Short Blade, +1 Sneaking, +1 Tracking, +1 Butchering |
| Inconspicuous | traitInconspicuous | -4 | 50% chance zombies spot you |
| Inventive | traitInventive | -2 | lower skill req to research/auto-learn recipes |
| Iron Gut | traitIronGut | -2 | 50% food-illness chance |
| Keen Cook | traitCook | -3 | +2 Cooking, +1 Butchering; improves foraging |
| Keen Hearing | traitKeenHearing | -6 | 200% perception radius |
| Light Eater | traitLightEater | -2 | 75% hunger |
| Low Thirst | traitLowThirst | -2 | 50% thirst |
| Mason | traitMason | -2 | +2 Masonry |
| Night Owl | traitNightOwl | (blank in wiki) | +sleep efficiency, no duration loss |
| Nutritionist | traitNutritionist | -2 | see nutritional values; improves foraging |
| Organized | traitOrganized | -4 | 130% container capacity |
| Outdoorsy | traitOutdoorsman | -2 | resists harsh weather; improves foraging |
| Resilient | traitResillient | -4 | 75% zombification rate (note wiki typo `Resillient`) |
| Runner | traitRunner | -4 | +1 Sprinting (Running) |
| Sewer | traitSewer | -4 | +1 Tailoring |
| Speed Demon | traitSpeedDemon | -1 | faster gear/top speed |
| Stout | traitStout | -6 | +2 Strength |
| Strong | traitStrong | -10 | +4 Strength, +40% knockback |
| Target Shooter | traitTargetShooter | -5 | +1 Aiming |
| Thick Skinned | traitThickSkinned | -8 | 1.3x chance to avoid injury |
| Tinkerer | traitTinkerer | -4 | +1 Maintenance |
| Vehicle Knowledge | traitAmateurMechanic2 | -3 | +1 Mechanics; repair standard/heavy vehicles |
| Wakeful | traitWakeful | -3 | -30% fatigue rate, +10% sleep efficiency |
| Whittler | traitWhittler | -2 | +2 Carving; bone items |
| Bushcrafter (Wilderness Knowledge) | traitWildernessKnowledge | -8 | +1 Carving, +1 Foraging, +1 Knapping, +1 Maintenance |

### 6b. Notable negative traits (point refund) [CONFIRMED via pzwiki Trait]

| Trait | Internal id | Points | Effect highlight |
|-------|-------------|--------|------------------|
| Agoraphobic | traitAgoraphobic | +4 | panic outdoors; smaller forage radius |
| All Thumbs | traitAllThumbs | +2 | 400% inventory transfer time |
| Asthmatic | traitAsthmatic | +5 | 140% endurance loss |
| Claustrophobic | traitClaustrophobic | +4 | panic indoors |
| Clumsy | traitClumsy | +2 | 120% footstep sound radius |
| Conspicuous | traitConspicuous | +4 | 200% chance to be spotted |
| Cowardly | traitCowardly | +2 | 200% panic |
| Deaf | traitDeaf | +12 | cannot hear |
| Disorganized | traitDisorganized | +6 | 70% container capacity |
| Feeble | traitFeeble | +6 | -2 Strength |
| Hard of Hearing | traitHardofHearing | +4 | smaller perception/hearing |
| Hearty Appetite | traitHeartyAppetite | +4 | 150% hunger |
| High Thirst | traitHighThirst | +2 | 100% more thirst |
| Illiterate | traitIlliterate | +10 | cannot read books/magazines |
| Out of Shape | traitOutofShape | +6 | -2 Fitness |
| Pacifist | traitPacifist | +5 | 75% weapon-skill XP |
| Prone to Illness | traitPronetoIllness | +4 | faster zombification |
| Puny | traitPuny | +10 | -5 Strength |
| Restless Sleeper | traitRestlessSleeper | +6 | poorer sleep |
| Short Sighted | traitShortSighted | +2 | blurred past 4 tiles; -2 forage radius |
| Sleepyhead | traitSleepyhead | +4 | +30% fatigue rate |
| Slow Healer | traitSlowHealer | +3 | injuries more severe |
| Slow Learner | traitSlowLearner | +6 | 70% XP (except Str/Fit) |
| Slow Reader | traitSlowReader | +2 | 70% reading speed |
| Smoker | traitSmoker | +3 | stress rises without tobacco |
| Sunday Driver | traitSundayDriver | +1 | slow acceleration, 30 km/h cap |
| Thin-skinned | traitThinskinned | +8 | 0.7x chance to avoid injury |
| Unfit | traitUnfit | +10 | -4 Fitness |
| Weak Stomach | traitWeakStomach | +2 | 200% food-illness chance |

Weight/strength/fitness traits (Emaciated, Underweight, Overweight, Obese, etc.)
are **adaptive** -- gained/lost during play from weight/strength/fitness changes,
not freely chosen; losing a negative one does not refund skill points (section 6d).

### 6c. Occupation-exclusive traits [CONFIRMED via pzwiki Trait]

Granted only by the matching occupation, not selectable directly:

| Trait | Occupation | Effect |
|-------|-----------|--------|
| Desensitized | Veteran | 0% panic (except nightmares); 200% nightmare chance |
| Ax-pert | Lumberjack | Swing axes 25% faster |
| Burglar | Burglar | Hotwire vehicles; less lock-break chance |
| Blacksmith Knowledge (occ.) | Blacksmith | +1 Maintenance, +2 Blacksmithing |
| Keen Cook (occ.) | Chef | Improves foraging |
| Vehicle Knowledge (occ.) | Mechanic | +3 Mechanics; repair all vehicle types |
| Night Owl | Security Guard | Faster tiredness recovery when sleeping |

> **Resolves the old trait-vs-occupation ambiguity:** **Target Shooter**
> (traitTargetShooter, -5, +1 Aiming) and **Tinkerer** (traitTinkerer, -4, +1
> Maintenance) are confirmed **selectable positive traits**, not occupations.
> **Night Owl** appears both as a freely-selectable trait AND as the Security
> Guard occupation trait. The prior "Nurse gets free Night Owl" claim is not in
> the wiki cache (the occupation grants are on the Occupation page, not cached) --
> Night Owl's confirmed occupation grant is the **Security Guard**, not the Nurse.

### 6d. Adaptive traits (gained/lost in play) [CONFIRMED via pzwiki Trait]

- **Strength band:** Puny (0-1), Weak/Feeble (2-4), none (5), Stout (6-8), Strong (9-10).
- **Fitness band:** Unfit (0-1), Out of Shape (2-4), none (5), Fit (6-8), Athletic (9-10).
- **Weight band (kg):** Emaciated (35-50), Very Low Weight (51-65), Low Weight
  (66-75), none (76-85), High Weight (86-100), Very High Weight (101-130).
- Losing a negative trait this way does **not** refund the original skill points.

### 6e. B42 trait changes vs the prior draft

- **Tinkerer** and **Target Shooter** upgraded LIKELY -> **[CONFIRMED]** (both are
  traits with the stated Maintenance/Aiming bumps).
- **New crafting/animal-flavored traits confirmed:** Artisan, Blacksmith
  Knowledge, Crafty (130% crafting XP), Mason, Whittler, Bushcrafter (Wilderness
  Knowledge), plus expanded Handy (now +Carving/+Masonry) and Hunter (now
  +Butchering/+Tracking) to feed the crafting/animal systems.
- **Inventive** and **Illiterate** interact directly with the recipe-knowledge
  system (section 5).
- For a modder, the mechanically important trait fields are: XP boosts per skill,
  granted-recipe list, granted-trait list, and mutual exclusions -- all now set
  through the `character_trait_definition` **script** (section 9), not the old
  `TraitFactory` Lua calls.
