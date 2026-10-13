---
id: build-42-building-our-county
slug: building-our-county
title: Building Our County
game: pz
version: build-42
section: mapping
category: buildings-and-tiles
difficulty: advanced
tags:
  - buildinged
  - loot
  - room-definitions
  - shops
  - roads
  - generator
excerpt: >-
  What vanilla Kentucky, the community building pools and Sagewood North taught
  us about rooms, loot, shops, roads and towns, and what our building generator
  does with it.
last_updated: '2026-10-13'
---
::field-notes

# Building Our County

Outcast, these are the findings of four studies made after the first walk of our generated test town. We counted 9,546 vanilla buildings, about 2,900 community pool buildings, 99 of our own buildings and 115 Sagewood North map cells. Every number below comes from reading those files and the game's own distribution tables.

::::cards
:::card[Why was loot thin?]{accent=orange}
**Too few containers, not broken rooms.** Room names were right. Our houses held about half the containers vanilla puts in the same rooms, and closets had the wrong shelf.
:::
:::card[What is fixed?]{accent=blue}
**21 of 25 walk notes fully**, 4 partly, 2 still open. Every room now draws vanilla's containers. 979 tests pass, and 11 deliberate breaks were each caught.
:::
:::card[How do we build?]{accent=purple}
**Dense blocks.** Our own work is mostly mixed-use blocks, shops, offices and civic buildings, 2 to 3 times vanilla's size, with more loot per square than vanilla.
:::
:::card[And the roads?]{accent=cream}
**Sagewood's original roads use only vanilla tiles.** Deep crosswalks, real lane widths and double yellows. 23 rules are written down for the generator.
:::
::::

## What the walk found

The first walk of the sketch-01 test town produced 28 notes. Each became a rule the generator follows or a check that refuses a bad building.

| Note | What changed | Status |
|---|---|---|
| Loot and containers | Every room of every building draws vanilla's container counts. Closets get metal shelves, garages are stocked, shop stockrooms get shelves and crates, every bedroom has a bed. | Fixed |
| Kitchens | One stove, sink, fridge, coffee machine and microwave each. No carpet. No fridge, stove or sink in a living room. | Fixed |
| Doors and windows | Single doors use single frames. Two-tile windows always come in pairs. Arched windows only in walls with arched holes. | Fixed |
| Roof details | No zig-zag fascia. Gable caps match the wall colour. Antennas only on flat roofs. No loose ducts. | Fixed |
| Garages, sheds, driveways | Real garage doors in an open gap. Sheds sized as sheds, door toward the house. No gate across a driveway. | Fixed |
| Table items | Items sit at their table's height, and a table carrying items stands clear of walls. | Fixed |
| Shops | Register near the door with a worker pocket, aisles, commercial fridges, a stockroom and a bathroom, vanilla sizes. | Fixed, no glass storefront yet |
| Glass walls | No glass partitions, no glass houses, bathrooms solid. | Partly: street-front glass comes later |
| Sidewalk cut at yards | Moves to an AboveLot map layer, with fences, corner posts and tall fences. | Planned |
| Roof with no lower tiles | Not found in any of the 290 buildings. | Open: needs a location |
| Floating parapet tile | Not reproduced. | Open: needs a location |
| Zoning, lots, parks, parking | Towns get zoned and every block fully divided into lots before buildings are chosen. | Planned |

:::callout[Key fact]{kind=key}
Loot was never broken. The game fills any tile that carries a container property, once, when that area of the world is first created. The room name only picks which loot list it rolls. What our houses lacked was places for loot to spawn.
:::

## Loot: which containers go in which room

Read from the 42.21 distribution files and counted across 9,546 vanilla buildings. The number is how many of that container an average vanilla room holds. Our generator now aims for these counts in every room it builds.

| Room (loot key) | Containers per room | Where the loot comes from |
|---|---|---|
| `kitchen` | counter 6.95, fridge 1.55, stove 1.53, microwave 0.46, bin 0.30, shelves 0.24, overhead cabinet 0.23 | Kitchen lists: canned food, dry food, dishes, baking, breakfast |
| `bedroom` | dresser 2.16, wardrobe 1.70, sidetable 1.11, shelves 0.62 | Bedroom dresser and wardrobe lists, with child, classy and redneck variants |
| `livingroom` | shelves 2.80, sidetable 1.02, wardrobe 0.40, dresser 0.34, dishes cabinet 0.31 | Living room shelf and side table lists |
| `bathroom` | counter 2.19, medicine cabinet 0.40, bin 0.30 | Bathroom counter and cabinet lists |
| `closet` | **metal shelves 1.65**, cardboard box 0.33 | ClosetShelfGeneric, plus instruments and sports gear |
| `garagestorage` | **metal shelves 1.84**, cardboard box 0.74, crate 0.25, small box 0.19, tool cabinet 0.11 | Garage carpentry, mechanics, metalwork and tools |
| `toolstorestorage` | metal shelves about 6.2, crates about 4.1 | Tool store stock |

:::callout[Read this first]{kind=warn}
Use `garagestorage` for a home garage, never `garage`. `garage` has no loot list of its own, so its containers fall back to the generic table. The same is true of `diningroom` and `clothesstore`, though vanilla uses those names too.
:::

## Kit rules

Several pieces only look right next to their partner, or only fit one kind of wall. These rules come from counting how vanilla places them.

:::facts
- **Door frames** `fixtures_doors_frames_01` 0 to 9 are single frames. 24 to 39 are halves of a double-door frame and always come as a left and right pair.
- **Two-tile windows** `fixtures_windows_01` 40 to 55 are halves of one wide window and are always placed in pairs.
- **Arched windows** Fit only walls with a matching arched hole (`walls_exterior_house_05` and up). House walls 01 to 04 have plain rectangular holes.
- **Garage doors** `walls_garage_01` and `_02`, 3 or 4 tiles wide, set into an empty gap in the wall. In 9,620 of 9,626 vanilla garage door squares nothing else sits on that wall edge.
- **Corner posts** Every fence and wall kit has a single post tile that closes a corner where two runs meet.
- **Tall fences** Tall wooden and concrete fences block like walls but are not placed with the wall tool.
:::

![Vanilla garage door tiles and double-door frame halves, with their tile numbers](/assets/articles/building-our-county/garage-doors-and-door-frames.jpg)

![Vanilla window families. A shaped window needs the wall with the same hole](/assets/articles/building-our-county/window-families.jpg)

![Vanilla fence kits and their corner posts](/assets/articles/building-our-county/fence-kits.jpg)

## Shops that work

We read all 321 registers in vanilla shop rooms, and every vanilla tool store, grocery, liquor store and gun store.

:::facts
- **The register** Never against a wall. In 317 of 321 the square behind it is open floor, where the worker stands; in all 321 the square in front is open. 203 have counters on both sides. The median distance to the front door is 7 squares.
- **The floor** One open sales room, shelves in parallel runs with a free aisle around each (93 percent of shelves have a free front square).
- **Fridges** Commercial only: `location_shop_generic_01` 64 to 69 and the industrial `appliances_refrigeration_01` tiles, in a row along one wall. Never the home fridge.
- **Back of house** A stockroom of 8 to 30 squares behind its own door, usually a bathroom, sometimes an office or a janitor room.
:::

| Shop | Smallest believable footprint | Rooms |
|---|---|---|
| Tool store | 13 x 9 | 54-square shop, 8-square stockroom, 4-square bathroom |
| Grocery | 14 x 12 | 90-square shop, 10-square stockroom; 10 x 6 for a market stall |
| Liquor store | 12 x 14 | 104-square shop and a bathroom |
| Gun store | 15 x 15 | 105-square shop, 30-square stockroom, bathroom |

:::callout[Map design idea]{kind=design}
Real shops are bigger than they look from the street. Each building type gets its own file: the rooms it needs, how big they run, how staff and deliveries get in at the back, and its parking. The generator builds from those files.
:::

## How we build

Of 2,182 building files in our old map projects, 99 are our own work once vanilla copies, duplicates and community catalogue files are removed: 90 from Sagewood North, 5 from an older Sagewood copy and 4 Leonia buildings.

| Type | Ours | Our typical size | Pools typical | Vanilla typical |
|---|---|---|---|---|
| House | 33 | 18 x 12, 2 floors | 17 x 17 | 12 x 12 |
| Shops under flats | 17 | 58 x 20, 5 floors | 23 x 25 | 16 x 17 |
| Shop | 9 | 57 x 20, 3 floors | 20 x 18 | 14 x 14 |
| Restaurant | 6 | 32 x 19 | 22 x 22 | 17 x 17 |
| Office | 6 | 64 x 24, 5 floors | 26 x 24 | 19 x 20 |
| Gas station | 6 | 21 x 13 | 20 x 20 | 14 x 14 |
| School, police, hotel, fire station | 8 | 44 to 78 wide | 20 to 40 wide | 24 to 32 wide |

:::facts
- **More loot** Containers per 10 squares, ours against vanilla: kitchen 5.1 to 3.6, bathroom 1.8 to 1.5, living room 1.1 to 0.7, storage units 4.3 to 1.5. Bedrooms are level at 1.5 to 1.6.
- **Practical detail** Light switches, mirrors, rugs, clocks, signs, office cubicles and school props. Vanilla and the pools add more curtains (4.2 per 100 room squares in vanilla), paintings, indoor plants and trash.
- **Outside** Our houses carry hedges against the wall and lamps by the door (two thirds within 2 squares of a door). Vanilla puts lamps on 93 percent of houses; the pools add trees, bushes and fences.
- **Shopfronts** Our big blocks announce their shops with sign tiles, 24 to 76 per block. Vanilla adds canopies from `walls_decoration_01`.
:::

The generator takes the best of each: our loot density, vanilla's curtains, paintings and plants, and our dense-block layouts.

## Sagewood's dense blocks

Sagewood North packs 194 apartments into 53 building files, with shops on the ground floor and offices above.

:::facts
- **Unit sizes** Studio about 24 squares, 1 bedroom 41, 2 bedrooms 76, 3 bedrooms 165. Each unit is laid out like a small house: kitchen, living room, bedrooms, bathroom.
- **Stacking** 60 to 83 percent of apartment squares have another flat directly above. In the busiest blocks, 78 to 81 percent of shop floor has flats over it.
- **Cores** Stairs sit in shared halls; one hall serves up to 8 units. The elevator is a one-square room.
- **Offices** Open floors of about 149 squares, with cubicles, desks and noteboards, a break room, a bathroom and a security room.
:::

:::callout[The one thing to avoid]{kind=warn}
22 files are larger than any vanilla building. The biggest is 7 floors, 302 rooms, 16 apartments and 7 shops, and the game treats it as one building: one player claiming it claims the whole street. 90 percent of vanilla buildings are under 370 room squares.
:::

:::callout[Map design idea]{kind=design}
Split dense blocks into separate game buildings. Where the ground floor already breaks into separate blocks, each becomes its own building. Otherwise each entrance with its own stairs becomes its own building, so a stairwell and its flats make one safehouse.
:::

## Sagewood's roads

The hand-painted roads are in five original cells, and they use only vanilla tiles. We compared them with nine vanilla town cells in Muldraugh, West Point, Riverside and Rosewood.

![Sagewood boulevard four-way with three-square crosswalks on every arm, lane dashes, lamps and name signs](/assets/articles/building-our-county/sagewood-boulevard-four-way.jpg)

![Sagewood four-way with crosswalks on all four arms](/assets/articles/building-our-county/sagewood-four-way.jpg)

![Vanilla West Point four-way, for comparison](/assets/articles/building-our-county/vanilla-westpoint-four-way.jpg)

| Feature | Sagewood | Vanilla |
|---|---|---|
| Asphalt | One clean tile on 80 percent of road squares | Four dark blend tiles mixed at random |
| Crosswalks | About 1,050 squares per cell, 3 deep, plus ladder bars | About 30 per cell, 1 to 2 deep |
| Road widths | 6 with dashed yellow; 10 with shoulders, 3-square lanes and double yellow; 11 with 3-square lanes; 16 for boulevards | Mostly 8 with a single faded yellow |
| Line dashes | White 1 on 2 off; yellow 1 on 1 off; faded white edge 2 on 2 off | White 1 on 2 off only |
| Wear | Under 1 grime tile per 1,000 road squares, no cracks | 66 grime and 389 crack tiles per 1,000 |
| Street furniture | Lamps, drains and signs every 31 squares (one block); 61 manholes, 112 drains | No manholes, 2 drains; many mailboxes and hydrants |
| Parking | Stalls 3 squares wide with stripes and wheel stops | Rare |

:::callout[Key fact]{kind=key}
The later relocated Sagewood is a repaint, not a copy: it shares under 8 percent of its road squares with the originals. It uses a custom pack for crosswalks, parking stripes and STOP and SCHOOL text, which have no vanilla Build 42 match. The originals need no pack at all.
:::

## The test town today

The generator rebuilt all 290 sketch-01 lots with the fixes, and every lot exported to the game with all its rooms.

![Generated houses with their yards, garages and sheds](/assets/articles/building-our-county/generated-houses.jpg)

:::facts
- **Rooms** 408 of 408 bedrooms have a bed, 316 a wardrobe. 0 of 57 stockrooms and garages are empty.
- **Checks** 979 tests. A reviewer broke the code on purpose 11 times; every break turned the tests red.
- **Still to come** Glass storefronts on the street side only, the AboveLot sidewalks and fences, and real building types.
:::

## What comes next

1. **Zone the town.** Main Street, homes, the highway strip, industry, farms and civic buildings, from real American small towns and measurements of Muldraugh, West Point, Riverside, Rosewood and Ekron.
2. **Divide every block.** Even lots with no leftover ground, parks and parking included.
3. **Give every lot a use.** One file per building type: convenience store, department store, gas station, town hall, police, fire station, clinic, hospital and more, from real floor plans and the vanilla example.
4. **Generate.** Buildings in the lots; roads, sidewalks and shared fences drawn once on an AboveLot map layer.

:::callout[Two open questions]{kind=warn}
Which Sagewood roads are the look to copy: the five original cells (vanilla tiles only) or the later relocated version (needs a custom marking pack)? And where are the roof with no lower tiles and the floating parapet tile? A screenshot with coordinates settles each.
:::
