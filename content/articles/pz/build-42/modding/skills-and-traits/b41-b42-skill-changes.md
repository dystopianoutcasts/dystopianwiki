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
  The crafting explosion (the big one). In B41 there was essentially one
  "Metalworking" plus Carpentry/Cooking/etc. B42 splits and adds a full trade
  tree [CONFIRMED via source + pzwiki Skill]:
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
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
# B41 -> B42 skill changes (added / renamed / split / removed)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**The crafting explosion (the big one).** In B41 there was essentially one
"Metalworking" plus Carpentry/Cooking/etc. B42 splits and adds a full trade tree
**[CONFIRMED via source + pzwiki Skill]**:

- **Metalworking -> split into two skills:**
  - **Welding** (`MetalWelding`) -- crafts metal structures and items and repairs
    some metal objects such as vehicle parts; crafted metal structures are
    generally stronger than wooden equivalents. **[CONFIRMED via pzwiki Skill]**
  - **Blacksmithing** (`Blacksmith`) -- forge/furnace/anvil work: forged tool
    heads and blades equal their lootable counterparts; at high level you can forge
    plate armor, tools (axes, sledgehammers), and weapons (swords, maces).
    **[CONFIRMED via pzwiki Skill]**
- **New crafting skills [CONFIRMED via pzwiki Skill]:** **Carving** (`Carving`,
  wood/bone items via a knife -- handles, `Flint Saw`, `Bone Fishing Hook`, bats),
  **Masonry** (`Masonry`, brick/stone constructions), **Pottery** (`Pottery`, clay
  objects on a Pottery Bench / Pottery Wheel -- bricks, ceramic jars), **Knapping**
  (`FlintKnapping`, small stone tools), **Glassmaking** (`Glassmaking`, melt broken
  glass or sand into glass for recipes).
- **New Farming/animal skills [CONFIRMED via pzwiki Skill]:** **Agriculture**
  (`Farming`, check crop status/health), **Animal Care** (`Husbandry`, check animal
  info + resources harvested such as milk/wool), **Butchering** (`Butchering`, meat
  quality from animals), plus **Tracking** (`Tracking`, identify/locate wild game)
  in the Survivalist group -- all supporting the new livestock/animals system.

**Renames / relabels [CONFIRMED via pzwiki Skill]:** `Blacksmith`->"Blacksmithing",
`FlintKnapping`->"Knapping", `MetalWelding`->"Welding", `Electricity`->"Electrical",
`Farming`->"Agriculture", `Husbandry`->"Animal Care", `Sprinting`->"Running"
(display). Carpentry, Cooking, Fishing, Foraging, Trapping, Tailoring, Mechanics,
First Aid, Aiming, Reloading persist.

**Rebalanced / redistributed (not new skills, but relevant):** Occupations now
distribute Blunt across **Long Blunt** and **Short Blunt** (e.g. Construction
Worker) to reflect tool use -- this split existed in B41 but B42 leans on it in
occupation design. **[LIKELY]**

**Removed:** No B41 skill was outright deleted in the CONFIRMED sources; the change
is additive + the Metalworking split. Anything you recall as "Metalworking" in a
B41 mod must be re-pointed to Welding (`MetalWelding`) or Blacksmithing
(`Blacksmith`). **[CONFIRMED]**

**Modder impact:** any B41 mod referencing `Perks.MetalWelding` alone, or a single
crafting gate, will likely miss the new skills; recipes that used to be one
"Metalworking" gate must choose Welding vs. Blacksmithing. Mods that referenced
the display strings "Farming"/"Husbandry" in UI must account for the new
"Agriculture"/"Animal Care" labels (the internal names are unchanged).
