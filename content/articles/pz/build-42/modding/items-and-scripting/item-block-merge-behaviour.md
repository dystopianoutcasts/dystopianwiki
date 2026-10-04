---
id: build-42-item-block-merge-behaviour
slug: item-block-merge-behaviour
title: B42 resource weight reduction -- candidate item audit
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - items
  - scripting
  - resource-weights
  - item-blocks
excerpt: >-
  Build: B42 stable, Steam buildid 24449119 Source of truth:
  media/scripts/generated/items/*.txt in the installed game
  Scope agreed: all raw crafting materials (wood + metal...
last_updated: '2026-09-29'
---
# B42 resource weight reduction -- candidate item audit

> Source: CANDIDATE_ITEMS.md (compiled 2026-08-03, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Build:** B42 stable, Steam buildid `24449119`
**Source of truth:** `media/scripts/generated/items/*.txt` in the installed game
**Scope agreed:** all raw crafting materials (wood + metal core, plus fasteners, cordage, fiber, earth, glass, leather, fuel)
**Method:** all 5,105 vanilla item blocks parsed to CSV, then filtered by `DisplayCategory` and ID keyword sweep. Every ID below was resolved against the live scripts -- 218/218 matched, zero invented IDs.
**Status:** Audit complete. Tier 1 + Tier 2 shipped as the mod `OutcastLightLoad`
at a flat x0.5 multiplier -- 110 items. Tiers 3 and 4
remain unshipped and are still open decisions.

**Engine fact established while building v1:** partial item blocks **merge** onto vanilla
rather than replacing them. `ScriptType.Item` does carry `ResetExisting`
(`ScriptType.java:117,124`), but neither `Item` nor `GameEntityScript` overrides
`BaseScriptObject.reset()`, which is an empty no-op (`BaseScriptObject.java:197`), and
`Item.Load` only calls `DoParam` for keys present in the block (`Item.java:1415-1442`).
So shipping `Weight` alone is safe -- model, icon, combat stats and tags all survive.
Full citation trail in the mod's README.

---

## Where B42 keeps this data (read this before editing anything)

B42 no longer uses B41's `media/scripts/items.txt` / `newitems.txt` layout. Item definitions
are split by `ItemType` into 15 generated files:

| File | Holds | Relevance here |
|---|---|---|
| `normal.txt` | most raw materials | **primary target** |
| `weapon.txt` | anything swingable | **Plank, Log-adjacent sticks, IronBar, MetalPipe live HERE** |
| `drainable.txt` | uses-based items | buckets, tapes, glues, sandbags, wire |
| `moveable.txt` | placeable pickups | hides, ore lumps, bellows |
| `container.txt` / `food.txt` / `literature.txt` / `clothing.txt` | rest | mostly out of scope |

**Trap:** `Plank` (3.0), `IronBar` (2.0), `SteelBar` (2.0), `MetalBar` (1.5), `MetalPipe` (1.5),
`Firewood` (1.5), `LongStick` (2.0), `LargeBranch` (6.0) are **`DisplayCategory = MaterialWeapon`
in `weapon.txt`**, not in `normal.txt`. A mod that only sweeps the Material category will silently
miss the single most-carried item in the game. This is the #1 thing that would have broken the mod.

---

## Balance observations found during the audit

These change what "reduce the weight" should even mean -- worth deciding before picking numbers.

1. **Log stacking is already a 3x discount.** `Log` = 9.0 each, but `LogStacks2` = 6.0 (3.0/log),
   `LogStacks3` = 9.0 (3.0/log), `LogStacks4` = 12.0 (3.0/log). So four stacked logs weigh 12.0
   while four loose logs weigh 36.0. If you flat-cut `Log` without touching the stacks, you invert
   the incentive and make stacking pointless. Recommend scaling the whole family together.

2. **`IronOre` and `CopperOre` are 40.0** -- tied for the heaviest items in the audit alongside
   `LargeStone`, `StoneAnvil`, `LargeBellows`. This is the real mining/smithing pain point, arguably
   more than logging.

3. **Carton > Box > loose is a clean existing ladder** for fasteners: `NailsCarton` 20.0 /
   `NailsBox` 2.0 / `Nails` 0.05. Same for screws. Preserve the ratio rather than flattening it.

4. **Quarter/Half/Full bar stock is already linear** (`SteelBarQuarter` 0.5, `SteelBarHalf` 1.0,
   `SteelBar` 2.0). A percentage multiplier keeps this coherent; flat subtraction destroys it.

5. **Leather has ~120 near-duplicate entries** (species x fur/full x tan x wet x size). Group R
   below lists only the large representatives. If leather is in scope, the mod should sweep them
   by pattern, not by hand-listing, or the file becomes unmaintainable.

---

## Recommended tiering (for the next decision, not yet applied)

| Tier | Contents | Rationale |
|---|---|---|
| **Tier 1 -- core ask** | Groups A, D, E, F, G, H | Wood + refined metal. The stuff you haul while logging and scrapping. Highest impact, lowest balance risk. |
| **Tier 2 -- strong fit** | Groups B, C, I, N | Ore, fuel, wire, fasteners. Fixes the mining/smithing haul. Ore at 40.0 is the biggest single win. |
| **Tier 3 -- judgment call** | Groups J, K, L, M, O, P, Q, S | Masonry, earth, cordage, glass. Reasonable, but touches carpentry/farming balance. |
| **Tier 4 -- flag before touching** | Groups R, T | Leather (120+ dupes, tailoring balance) and anvils/bellows/propane. `PropaneTank` and `GunPowder` weight is arguably intentional friction. |

---

## Full candidate list -- 218 items

All weights below are **current vanilla values**, read directly from the B42 scripts.

<!-- GENERATED: see _groups_generated.md, produced by the parse+join scripts. -->

See _groups_generated.md (local reference: _groups_generated.md) for the complete grouped tables (A through T).

### Group index and counts

| Group | Items | Heaviest | Notes |
|---|---|---|---|
| A. Wood -- logging + lumber chain | 21 | `LargePlank` 10.0 | The headline group. `Log` 9.0, `Plank` 3.0. |
| B. Wood-derived fuel | 5 | `Charcoal` 0.8 | Low weight already; include for consistency. |
| C. Metal -- ore + smelting feedstock | 9 | `IronOre` / `CopperOre` 40.0 | Biggest single pain point in B42. |
| D. Metal -- ingots + precious bars | 10 | `GoldBar` 16.0 | Ingots all 5.0-6.0. |
| E. Metal -- bars, rods, pipes | 13 | `IronBar` / `SteelBar` 2.0 | Lives in `weapon.txt`. |
| F. Metal -- blocks, chunks, pieces | 11 | `IronBlock` 2.0 | Blacksmithing intermediates. |
| G. Metal -- sheet stock | 6 | `SheetMetal` 2.0 | |
| H. Metal -- scrap | 12 | `ScrapMetal` 1.0 | Already light; low priority. |
| I. Metal -- wire, band, chain | 11 | `WireStack` / `BarbedWireStack` 10.0 | `HeavyChain_Hook` 12.5. |
| J. Stone + masonry | 7 | `LargeStone` 40.0 | |
| K. Bulk powders + wet mixes | 11 | Buckets 10.0 each | Drainables -- verify weight scales with uses. |
| L. Earth + clay bags | 6 | `CompostBag` 5.0 | |
| M. Fired clay goods | 8 | all 0.3 | Already trivial; probably skip. |
| N. Fasteners | 13 | `NailsCarton` / `ScrewsCarton` 20.0 | Preserve carton/box/loose ratio. |
| O. Adhesives + tape | 8 | `DuctTapeBox` 5.0 | |
| P. Cordage + cloth bulk | 25 | `FabricRoll_*` 10.0 | |
| Q. Plant fiber chain | 11 | all 0.2 | Already trivial; probably skip. |
| R. Leather + hides (large only) | 12 | hides 5.0 | ~120 more variants exist -- pattern-sweep required. |
| S. Glass + ceramics | 11 | `CeramicCrucible_Iron/Steel` 15.0 | |
| T. Heavy workstation stock | 8 | anvils / bellows 40.0 | Flag: friction may be intentional. |

---

## Open questions for the next session

1. **Reduction method** -- flat percentage multiplier (keeps all existing ratios intact,
   recommended) vs. per-item hand-tuned values vs. sandbox-configurable multiplier?
2. **Which tiers ship in v1?** Recommend Tier 1 + Tier 2 as the initial release.
   Tier 1 = 73 items, Tier 2 = 38 items, so 111 candidates; `Paperclip` drops out
   as a no-op at the chosen multiplier, giving **110 shipped**.
3. **Sandbox option or fixed?** A sandbox multiplier makes the mod survive balance arguments,
   but B42 sandbox options are a separate file format and add scope.
4. **Leather** -- in or out? If in, it needs a pattern sweep, not a hand list.
5. **Compatibility** -- overriding vanilla item blocks conflicts with any other mod that
   touches the same items. Need to decide override strategy before writing scripts.

---

## Reproducing this audit

Scripts used are in the session scratchpad and can be re-run against any build:

- `parse_items.ps1` -- parses `generated/items/*.txt` into `b42_items.csv` (5,105 rows:
  ItemID, DisplayCategory, Weight, Tags, ItemType, File)
- `build_list.ps1` -- joins the curated ID list against the CSV, emits `_groups_generated.md`,
  and hard-fails loudly on any ID that does not exist in the game files
