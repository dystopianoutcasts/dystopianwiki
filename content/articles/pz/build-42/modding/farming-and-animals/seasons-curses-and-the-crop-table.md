---
id: build-42-seasons-curses-and-the-crop-table
slug: seasons-curses-and-the-crop-table
title: 'Seasons, curses, and the crop table'
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
  Each crop has a planting season (with poor and best months), a growing season,
  and bad months.
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# Seasons, curses, and the crop table (advanced)

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 5.1 Growing seasons [CONFIRMED]
Each crop has a planting season (with poor and best months), a growing season, and bad months.

| Term | Meaning |
|---|---|
| Planting Season | Crops planted here won't become cursed |
| Poor Months | 50-5% curse chance (by Agriculture level) |
| Best Months | Chance to increase yield |
| Bad Months | On day 1 of a crop's first bad month, ALL crops of that kind globally become cursed; crops planted in bad months suffer the same. Not shown in the info menu. Bad-month-hardy crops are spared if they've reached their hardy growth phase. |
| Growing Season | Non-overlapping months: existing crops are fine, but newly planted crops become cursed |
| Winter (Dec-Feb) | On day 1 of winter, ALL crops globally become cursed. Cold-hardy crops are spared. |

Planting season is viewable in-game: Character Info -> Info -> Discovered Recipes and Media -> Agriculture (after learning it). Growing seasons can be turned off entirely in sandbox. [CONFIRMED]

### 5.2 Cursed crops [CONFIRMED]
A curse accelerates all negatives and stunts recovery: halved health gain from sun/ideal water; doubled health loss from darkness/cold/thirst/bad month/winter; loss of bonus yield (and thus reduced yield); doubled disease chance; reduced initial health (37-44). **Crops cannot be uncursed.** A crop becomes cursed if planted in a poor month (chance) or outside planting season; planted/growing in bad months or winter (unless hardy); or fertilized 3+ times with fertilizer.

### 5.3 Growth phases [CONFIRMED]
1. Seedling (phases 1-2)
2. Young (phases 3-4)
3. Almost ready to harvest (phase 5)
4. Ready to harvest (phase 6)
5. Blooming (phase 7)

Harvestable at phase 6 or 7; seeds only at phase 7 (blooming). Some crops skip the "Ready to harvest" phase (extra Young phase, then jump straight to Blooming). If not harvested at phase 7, the crop rots when it would have advanced.

### 5.4 Crop table (all [CONFIRMED] from the Agriculture page)
Format: Crop | Category | Min water | Growth (days) | Planting | Bad months | Best | Poor | Cold-hardy | Bad-month-hardy level | Aphid-proof | Slug-proof | Fly-proof. "Growth time" = average days to reach phase 6, with a random +up-to-12h offset per phase.

| Crop | Cat | MinW | Days | Plant | Bad | Best | Poor | Cold | BMHardy | Aphid | Slug | Fly |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Barley | Veg | 30 | 108 | Aug-Oct | Jun,Jul | Sep | Oct | Y | | | | |
| Basil | Herb | 80 | 60 | Mar-May | Aug-Jan | Mar | Apr | | | | | Y |
| Bell Pepper | Veg | 70 | 60 | Apr-Jun | Oct-Mar | May | Jun | | | | | |
| Black Sage | Herb | 60 | 60 | Mar-Aug | Oct-Feb | Apr,May | Jul,Aug | | | | | |
| Broadleaf Plantain | Herb | 60 | 60 | Mar-Aug | Oct-Feb | Apr | Jun,Jul | | | | | |
| Broccoli | Veg | 70 | 60 | Feb-Jul | Sep-Jan | Mar,Jun | Jul | | | | | |
| Cabbage | Veg | 80 | 60 | Feb-Jul | Oct-Jan | Mar,May | Jul | Y | | | | |
| Carrots | Veg | 30 | 90 | Feb-Jul | Oct-Jan | Feb,Jun | Jul | | 4 | | | |
| Cauliflower | Veg | 70 | 60 | Feb-Apr | Sep-Jan | Mar | Apr | | | | | |
| Chamomile | Herb | 80 | 60 | Mar-May | Aug-Jan | Apr | | | | | | |
| Chives | Herb | 60 | 60 | Mar-Aug | Oct-Feb | Apr | Jun,Jul | | | | Y | Y |
| Cilantro | Herb | 70 | 60 | Mar-May | Jul-Jan | Apr | May | | | | | Y |
| Comfrey | Herb | 60 | 60 | Mar-Aug | Oct-Feb | Mar,Apr | Jun,Jul | | | | | |
| Common Mallow | Herb | 70 | 60 | Mar-Aug | Oct-Feb | Mar,Apr | Jun,Jul | | | | | |
| Corn | Veg | 30 | 90 | Mar-May | Jul-Feb | Apr | May | | | | | |
| Cucumber | Veg | 70 | 90 | Mar-May | Aug-Feb | Apr | May | | | | | |
| Flax | Veg | 30 | 108 | Aug-Oct | Jun,Jul | Sep | Oct | Y | | | | |
| Garlic | Veg | 30 | 240 | Jul-Sep | Jun | Aug | Sep | Y | | | Y | Y |
| Green Peas | Veg | 70 | 60 | Feb-Apr | Oct-Jan | Mar | Apr | | | | | Y |
| Habanero | Herb | 70 | 60 | Apr-Jun | Oct-Mar | May | Jun | | | | | |
| Hemp | Veg | 30 | 240 | Aug-Oct | Jun,Jul | Sep | Oct | | | | | |
| Hops | Veg | 30 | 240 | Aug-Oct | Jun,Jul | Sep | Oct | | | | | |
| Jalapeno | Herb | 70 | 60 | Apr-Jun | Oct-Mar | May | Jun | | | | | |
| Kale | Veg | 70 | 60 | Feb-Aug | Nov-Jan | Mar,Jul | Aug | Y | 3 | | | |
| Lavender | Herb | 80 | 60 | Mar-May | Aug-Jan | Apr | May | | | | | |
| Leek | Herb | 70 | 150 | Mar-Sep | Oct-Feb | | | Y | | | Y | Y |
| Lemongrass | Herb | 70 | 60 | Mar-Sep | Oct-Feb | | | | | | Y | Y |
| Lettuce | Veg | 70 | 60 | Feb-Sep | Oct-Jan | Mar,Jul | Sep | | | | | |
| Marigold | Herb | 80 | 60 | Mar-May | Aug-Jan | Apr | May | | | | Y | Y |
| Mint | Herb | 70 | 60 | Feb-Apr | Jun-Jan | Mar | | | | | | |
| Onion | Veg | 30 | 90 | Feb-Mar | Jul-Jan | Feb | Mar | | | Y | Y | Y |
| Oregano | Herb | 60 | 60 | Feb-Apr | Jul-Jan | Mar | Apr | | | | | Y |
| Parsley | Herb | 70 | 60 | Feb-Apr | Jun-Jan | Mar | Apr | | | | | Y |
| Poppy | Herb | 80 | 60 | Mar-May | Aug-Jan | Apr | May | | | | | |
| Potato | Veg | 60 | 90 | Feb-Apr | Aug-Jan | Mar | Apr | | | | | Y |
| Pumpkin | Veg | 70 | 90 | Mar-May | Aug-Feb | Apr | May | | | | | |
| Radish | Veg | 40 | 30 | Feb-Aug | Sep-Jan | Mar,Jul | Aug | | | | | Y |
| Rosemary | Herb | 30 | 180 | Mar-Sep | Oct-Feb | | | | | Y | Y | Y |
| Rose | Herb | 80 | 60 | Mar-May | Aug-Jan | Apr | May | | | | | |
| Rye | Veg | 30 | 108 | Aug-Oct | Jun,Jul | Sep | Oct | Y | | | | |
| Sage | Herb | 30 | 90 | Feb-Apr | Jul-Dec | Mar | Apr | | | | | Y |
| Soybeans | Veg | 60 | 90 | Mar-May | Aug-Feb | Apr | May | | | | | |
| Spinach | Veg | 70 | 60 | Feb-Jul | Sep-Jan | Mar,Jun | Jul | | | | | |
| Strawberry | Veg | 80 | 90 | Feb-Apr | Jul-Jan | Mar | Apr | | | | | |
| Sugar Beet | Veg | 40 | 60 | Feb-Jul | Sep-Jan | Mar,Jun | Jul | | | | | |
| Sunflower | Veg | 30 | 90 | Mar-May | Aug-Feb | Apr | May | | | | | |
| Sweet Potato | Veg | 60 | 90 | May-Jul | Oct-Feb | Jun | Jul | | | | | |
| Thyme | Herb | 30 | 60 | Feb-Apr | Aug-Jan | Mar | Apr | | | | Y | |
| Tobacco | Veg | 70 | 180 | Mar-Jul | Sep-Feb | Mar | Jul | | | | | |
| Tomato | Veg | 70 | 90 | Apr-Jun | Oct-Mar | May | Jun | | | | | Y |
| Turnip | Veg | 60 | 60 | May-Oct | Nov-Feb | Jun,Sep | Jul,Oct | | | | | |
| Watermelon | Veg | 70 | 90 | Mar-May | Oct-Feb | Apr | May | | | | | |
| Wild Garlic | Herb | 30 | 240 | Jul-Sep | Jun | Aug | Sep | Y | | | Y | Y |
| Winter Wheat | Veg | 30 | 108 | Aug-Oct | Jun,Jul | Sep | Oct | Y | | | | |
| Zucchini | Veg | 70 | 90 | Mar-May | Aug-Feb | Apr | May | | | | | |

(Blank cells = no value / not hardy for that column. "Y" = hardy/proof; numbers in the BMHardy column = the growth stage needed to escape bad-month cursing.)
