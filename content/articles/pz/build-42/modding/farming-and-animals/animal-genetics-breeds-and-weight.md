---
id: build-42-animal-genetics-breeds-and-weight
slug: animal-genetics-breeds-and-weight
title: 'Animal genetics, breeds, and weight'
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
  Every animal type has a set of abstracted genes, each carrying two alleles,
  one inherited randomly from each parent. Named genes include milk quantity,
  life expectancy, strength, appearance, and...
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# Animal genetics, breeds, and weight

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 8.1 Genetics system [CONFIRMED]
Every animal type has a set of abstracted **genes**, each carrying **two alleles**, one inherited randomly from each parent. Named genes include milk quantity, life expectancy, strength, appearance, and more. There are **dominant and recessive alleles**, so inbreeding can surface recessive genetic illnesses. A skilled character can inspect an animal to read its health-related genes. This system is the whole point of B42 selective breeding: pair a high-`maxMilk` Holstein cow with a strong bull, cull for the alleles you want, and avoid inbreeding depression.

The full moddable gene list is in Section 10.4.

### 8.2 Weight and enclosure math [CONFIRMED, but numbers are [LIKELY] to have been tuned]
- Every animal has a **`maxWeight` gene** giving its actual weight as a percentage of its species base. Typical range 0.5-0.8 (animals reach 50-80% of base). Breed-specific ranges: Angus 0.45-0.65, Simmental 0.5-0.7, Holstein 0.6-0.8, Suffolk sheep 0.55-0.75.
- The genetic disorder **`skinny`** divides base weight by three before the gene multiplier is applied.
- Animals grow daily from min to max weight for their current life stage. Daily gain = (maxWeight - minWeight) / stageDuration, multiplied by current health (healthier = faster). On transitioning to the next life stage (chick -> hen), the weight range resets to the new stage's min/max.
- **Undersized enclosure (`smallEnclosure`) cuts daily weight gain by a factor of 8.** Poor health, hunger, and thirst also slow growth.

Selected base weight ranges (base min / base max, in kg) by stage [CONFIRMED]:

| Animal | Stage | Min enclosure | Base min | Base max |
|---|---|---|---|---|
| Chicken | chick | 20 | 0.05 | 0.2 |
| Chicken | hen | 40 | 2 | 5 |
| Chicken | cockerel | 40 | 2.5 | 6 |
| Pig | piglet | 20 | 15 | 110 |
| Pig | sow | 40 | 115 | 350 |
| Pig | boar | 40 | 115 | 350 |
| Cow | cowcalf | 40 | 60 | 350 |
| Cow | bull | 80 | 360 | 1300 |
| Cow (Angus) | cow | 80 | 360 | 950 |
| Cow (Simmental) | cow | 80 | 360 | 950 |
| Cow (Holstein) | cow | 80 | 360 | 950 |
| Sheep | lamb | 20 | 20 | 70 |
| Sheep | ewe | 40 | 60 | 120 |
| Sheep | ram | 40 | 80 | 200 |
| Sheep (Suffolk) | ewe/ram | 40 | 60/80 | 120/200 |
| Turkey | poult/hen/gobbler | 20/40/40 | 0.05/4/8 | 0.3/9/12 |
| Rabbit | kitten/doe/buck | ? | 1/2/2 | 2/7/7 |
| Deer | fawn/doe/buck | ? | 15/110/110 | 100/200/200 |
| Mouse/Rat/Raccoon/Squirrel | (various) | 20-40 | small | small |

(The wiki carries the full per-stage table with gene multipliers and resulting actual weights; the "?" enclosure entries are unspecified there. Note the decimal comma in the source -- e.g. "0,05" = 0.05.)
