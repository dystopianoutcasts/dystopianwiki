---
id: build-42-foraging-in-b42
slug: foraging-in-b42
title: Foraging in B42
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
  B42 foraging is a category + search-focus system. Items belong to categories;
  categories belong to broader groups; each category has per-biome spawn
  weights, weather and time-of-day modifiers...
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# Foraging in B42

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 foraging is a **category + search-focus** system. Items belong to categories; categories belong to broader groups; each category has per-biome spawn weights, weather and time-of-day modifiers, month availability, and skill gates. The player picks a **search focus** to bias results toward one category. [CONFIRMED]

### 6.1 Categories relevant to this track
Three cached categories touch food/animals:

- **Crops** (`category_id=Crops`) [CONFIRMED]: identify/focus at Foraging 5 (grouped as "Food" below that). Focus chance 10-20%. Highest weights on farmland (25) and general vegetation (10). Contains Broccoli, Cabbage, Carrots, Potato, Radish, Tomato -- each skill level 2, amount 1, with per-biome weights (e.g. Broccoli Forest 7 / Vegetation 7 / Farmland 10) and month windows (broccoli May-Nov, others Mar-Nov). Occupation bonus: Crop Farmer (+50% detection). Traits: Herbalist, Gardener.
- **Animals (foraging)** (`category_id=Animals`) [CONFIRMED]: the *living* small-animal / edible-critter category, focus at Foraging 5, focus chance 5-15%. Weights favor vegetation (25) and farmland (20). Contains Egg (1-3, skill 8), Frog (skill 7), Slug/Snail (skill 3), Wild Eggs (1-3, skill 8). Frog/slug/snail have strong weather swings (-100% snow, +100% rain, -50% day/+50% night). Occupations: Park Ranger, Burger Flipper, Crop Farmer, Chef, Veteran. Traits: Keen Cook, Hunter, Outdoorsy, Wilderness Knowledge, Hearty Appetite. Important nuance: selecting "Animals" focus only boosts *this* category, not other members of the shared "Animals" group such as Insects or Dead animals.
- **Dead animals** (`category_id=DeadAnimals`) [CONFIRMED]: a **hidden** category (cannot be chosen as a focus; shown in-game as "Animals"). No occupation/trait bonuses. Contains Dead Bird (skill 7), Dead Mouse (5), Dead Rabbit (10), Dead Rat (5), Dead Squirrel (8), each amount 1, with urban/trailer-park weight spikes for the commensal rodents (Mouse/Rat: Urban 10, Trailer Park 10).

### 6.2 How foraging tiers/gates work [CONFIRMED / LIKELY]
- **Skill-gated identification:** each item has a skill level at which it can be found/identified; categories unlock as a selectable focus at a threshold (Crops and Animals both at Foraging 5). Items may still appear below that level (lumped under a generic group). [CONFIRMED]
- **Biome weights:** every category has per-zone weight numbers (trailer_park, birch_forest, forest, vegetation, organic_forest, deep_forest, primary/acidic forest, town_zone, farm_land, etc.). Higher = more likely there. [CONFIRMED]
- **Modifiers:** each item lists Snow / Rain / Day / Night percentage modifiers and Available / Bonus / Malus months. Occupations and traits give a detection bonus, a vision-range bonus (tiles), and darkness/weather effect modifiers. [CONFIRMED]
- **`focus_chance`, `chance_to_create_icon`, `chance_to_move_icon`, `valid_floors`, `sprite_affinity`** are category-level fields shown in the infoboxes; their exact runtime formula is not spelled out in the cached text. [UNCERTAIN on precise math]

### 6.3 Trapping and other animal sources (context) [CONFIRMED]
Wild vertebrates are mainly obtained by **trapping**, not foraging (dead rats/mice also appear in kitchen counters/containers). The Animal page documents trap+bait pairings: Mouse/Rat -> Mouse Trap (cheese, peanut butter, chocolate, etc.); Rabbit/Squirrel -> Trap Box/Crate/Snare/Cage (carrots, lettuce, etc.); Bird -> Stick Trap (bread, worms, corn). Fish come from fishing; insects from foraging/containers/digging grass. This matters for husbandry mods because trapping is the "wild input" side of the animal economy.
