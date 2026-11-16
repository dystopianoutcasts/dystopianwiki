---
id: build-42-item-block-merge-behaviour
slug: item-block-merge-behaviour
title: 'Item block merging, and the weight audit that proved it'
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - items
  - merge
  - weights
excerpt: >-
  In 42.22 a mod item block with only a Weight line changes the weight and leaves the rest of the vanilla item alone. The page shows why, how to try it, and the weight audit behind Outcast Light Load.
last_updated: '2026-11-16'
related_articles:
  - overriding-patching-vanilla
  - items-the-item-block-in-b42
  - script-file-anatomy
  - overriding-scripts
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders changing one value on a vanilla item](#1-a-partial-item-block-merges-onto-vanilla) | [modders planning a weight or balance mod](#3-the-weight-audit-behind-outcast-light-load)

:::callout[The 1-minute version]{kind=key}
- A mod block `item Plank { Weight = 1.5, }` inside `module Base` changes the plank's weight and leaves its model, icon, tags and combat numbers as vanilla set them.
- The engine loads only the keys a block contains, and the empty default `reset()` clears nothing between two blocks of the same item.
- The merge applies to items. A short list of other script types replace instead; [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts) lists them.
- If one body of the item fails to load, for example `Weight = heavy,`, the engine removes the whole item, vanilla's body included.
- A weight sweep that only reads `DisplayCategory = Material` misses the plank, the bars and the pipe: they sit in `weapon.txt` as `MaterialWeapon`.
:::

:::facts
- **Item blocks in vanilla** 5,105, under 5,092 distinct names
- **Item files in vanilla** 15, split by `ItemType`
- **Items Outcast Light Load changes** 110: 21 wood at x0.5, 82 bulk at x0.35, 7 fasteners at x0.1
- **Vanilla `Weight` changes from 42.21 to 42.22** 1 (`WalkieTalkieMakeShift`, 1.0 to 5.0)
:::

## 1. A partial item block merges onto vanilla

**A second `item` block for a vanilla name sets only the keys it contains, so a block with `Weight` alone is safe.**

The engine files every block under the item's name. A block whose name is already known is added as another body to the same entry, not as a new item. :cite[(`zombie/scripting/ScriptBucket.java:98-125`)] The bodies are loaded one after another into one object, vanilla's first. :cite[(`zombie/scripting/ScriptBucket.java:173-198`)]

Between two bodies the engine calls `reset()` on the object, because items carry the reset flag. :cite[(`zombie/scripting/ScriptBucket.java:194-195`, `zombie/scripting/ScriptType.java:112-124`)] That call does nothing for an item: the base `reset()` is empty, and neither `Item` nor its parent `GameEntityScript` replaces it. :cite[(`zombie/scripting/objects/BaseScriptObject.java:197-198`, `zombie/scripting/objects/Item.java:75`, `zombie/scripting/entity/GameEntityScript.java:33`)] Then the item loader calls its key reader once for each key line in the body, and for no other key. :cite[(`zombie/scripting/objects/Item.java:1427-1436`)] A key you leave out keeps the value vanilla's body set.

Two things hold the merge apart from "copy my block over theirs". `Tags` adds each tag to the item's set and never removes one. :cite[(`zombie/scripting/objects/Item.java:2353-2359`)] And a failed body removes the whole item: the loader drops the script when a body throws, and items carry the flag that allows it. :cite[(`zombie/scripting/ScriptBucket.java:198-203`, `zombie/scripting/ScriptType.java:112-124`)] [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts) covers both, and which file wins when two mods change the same item.

Vanilla itself defines 13 item names twice, for example `Mov_Lamp1` and `WatermelonSeed`. Those names go through the same path. :cite[(`media/scripts/generated/items/moveable.txt:2118`, `media/scripts/generated/items/moveable.txt:3575`, `media/scripts/generated/items/normal.txt:5414`, `media/scripts/generated/items/normal.txt:5434`)]

## 2. Try it: a lighter plank

**One script file with one line changes the plank's weight, and you can read the new weight in game.**

1. Make the folder `Zomboid/mods/LightPlank/`, with `42/mod.info` and a `poster.png` copied from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton). Give `mod.info` both lines `name=Light Plank` and `id=LightPlank`, so the mod list shows the name Light Plank.
2. Make the file `Zomboid/mods/LightPlank/42/media/scripts/LightPlank_items.txt` with this content. The file name is your own, so it never takes a vanilla file's path.

```
module Base
{
    item Plank
    {
        Weight = 1.5,
    }
}
```

3. Start the game with `-debug`, as the skeleton page shows. Check **Light Plank** in the mod list, accept, and start a new game.
4. Open the debug **Items List**, as [New item](/pz/build-42/modding/cookbook/new-item) shows, search for `Plank`, and add one. Hover the plank in your inventory. Its weight should read 1.5 where vanilla reads 3.0. :cite[(`media/scripts/generated/items/weapon.txt:9255-9259`)]
5. Check that the plank still has its vanilla icon, and that it still works as a weapon. Those keys were not in your block, so they stay.

This test has not been run in a game. If the weight does not change, search `console.txt` for `removing script due to load error` and for the name of your file.

## 3. The weight audit behind Outcast Light Load

**The audit that found the merge rule also tells you where vanilla keeps weights, and why a flat cut can break the balance.**

The audit was written for the Outcast Light Load mod, which cuts the weight of raw crafting materials. It parsed the item scripts, grouped the raw materials (wood and metal core, plus fasteners, cordage, fiber, earth, glass, leather and fuel), and listed 218 candidate items. The original audit ran on build 42.20; the vanilla weights quoted below were checked again on 42.22.

### Where vanilla keeps the data

Vanilla item blocks sit in 15 files under `media/scripts/generated/items/`, one per `ItemType`. :cite[(`media/scripts/generated/items/normal.txt:891`, `media/scripts/generated/items/weapon.txt:9255`)] The trap is that several of the most carried materials are in `weapon.txt`, not in `normal.txt`, because they are also weapons. These eight are `DisplayCategory = MaterialWeapon` in `weapon.txt`. :cite[(`media/scripts/generated/items/weapon.txt:9255-9259`)]

:::chips
- Plank 3.0
- IronBar 2.0
- SteelBar 2.0
- MetalBar 1.5
- MetalPipe 1.5
- Firewood 1.5
- LongStick 2.0
- LargeBranch 6.0
:::

A sweep that keeps only `DisplayCategory = Material` misses all eight. `Log`, `Nails`, `IronOre` and `SheetMetal` are `Material` items in `normal.txt`.

### What the numbers say about balance

Five vanilla patterns decide what "reduce the weight" should mean.

1. **Stacked logs are already a 3x discount.** `Log` is 9.0, and `LogStacks2`, `LogStacks3` and `LogStacks4` weigh 6.0, 9.0 and 12.0, which is 3.0 per log each. Four loose logs weigh 36.0 and four stacked logs 12.0. Cutting `Log` alone would make stacking pointless, so the whole family has to move together.
2. **Ore is the heaviest haul.** `IronOre` and `CopperOre` weigh 40.0, level with `LargeStone`, `StoneAnvil` and `LargeBellows`.
3. **Fasteners form a ladder.** `NailsCarton` is 20.0, `NailsBox` 2.0 and `Nails` 0.05. A percentage cut keeps the ratios; a flat subtraction would not.
4. **Bar stock is linear.** `SteelBarQuarter` is 0.5, `SteelBarHalf` 1.0 and `SteelBar` 2.0.
5. **Leather has many near-duplicates** (species, fur or full, tanned, wet, size). The audit counted about 120 and recommended sweeping them by pattern, not by hand. That count was not re-made on 42.22.

Vanilla `Weight` values for the items named above are unchanged from 42.21 to 42.22. Across all item scripts, one item's weight differs between the two builds: `WalkieTalkieMakeShift` went from 1.0 to 5.0. :cite[(`media/scripts/generated/items/radio.txt:143-147`)]

### What shipped

The audit proposed four tiers. The shipped mod, Outcast Light Load, uses three named tiers instead, each a flat multiplier so vanilla ratios inside the tier stay. Packed forms (stacks, bundles, boxes, cartons) take a further x0.8. Its generated script file is a set of `Weight`-only blocks, which is the merge rule from section 1 at work.

| Tier | Multiplier | Items | Covers |
|---|---|---|---|
| WOOD | x0.5 | 21 | The logging and lumber chain |
| BULK | x0.35 | 82 | Charcoal, ore, ingots, bars, blocks, sheet, scrap, wire, fittings |
| FAST | x0.1 | 7 | Nails, screws and bolts |

All 110 vanilla weights in the mod file match the 42.22 scripts. Ammunition is left alone on purpose, so guns get relatively more expensive to feed.

### The 218-item candidate list

The list below is the audit's group index. The counts come from the 2026-08 audit and were not re-counted on 42.22; the "Heaviest" values for groups A to L, N, O, P, S and T were checked against the 42.22 scripts. The values for M, Q and R (fired clay, plant fiber, leather) were not.

| Group | Items | Heaviest | Notes |
|---|---|---|---|
| A. Wood, logging and lumber chain | 21 | `LargePlank` 10.0 | The headline group. `Log` 9.0, `Plank` 3.0. |
| B. Wood-derived fuel | 5 | `Charcoal` 0.8 | Low weight already. |
| C. Metal, ore and smelting feedstock | 9 | `IronOre` / `CopperOre` 40.0 | Biggest single pain point. |
| D. Metal, ingots and precious bars | 10 | `GoldBar` 16.0 | Ingots all 5.0 to 6.0. |
| E. Metal, bars, rods, pipes | 13 | `IronBar` / `SteelBar` 2.0 | Lives in `weapon.txt`. |
| F. Metal, blocks, chunks, pieces | 11 | `IronBlock` 2.0 | Blacksmithing intermediates. |
| G. Metal, sheet stock | 6 | `SheetMetal` 2.0 | |
| H. Metal, scrap | 12 | `ScrapMetal` 1.0 | Already light. |
| I. Metal, wire, band, chain | 11 | `WireStack` / `BarbedWireStack` 10.0 | `HeavyChain_Hook` 12.5. |
| J. Stone and masonry | 7 | `LargeStone` 40.0 | |
| K. Bulk powders and wet mixes | 11 | Buckets 10.0 each | Drainables: check that weight scales with uses. |
| L. Earth and clay bags | 6 | `CompostBag` 5.0 | |
| M. Fired clay goods | 8 | all 0.3 | Not re-checked. |
| N. Fasteners | 13 | `NailsCarton` / `ScrewsCarton` 20.0 | Keep the carton, box and loose ratio. |
| O. Adhesives and tape | 8 | `DuctTapeBox` 5.0 | |
| P. Cordage and cloth bulk | 25 | `FabricRoll_*` 10.0 | |
| Q. Plant fiber chain | 11 | all 0.2 | Not re-checked. |
| R. Leather and hides (large only) | 12 | hides 5.0 | Not re-checked. About 120 more variants exist. |
| S. Glass and ceramics | 11 | `CeramicCrucible_Iron` / `_Steel` 15.0 | |
| T. Heavy workstation stock | 8 | anvils and bellows 40.0 | Friction may be intended. |

The tier plan in the audit put groups A, D, E, F, G, H first, then B, C, I, N, left J, K, L, M, O, P, Q, S as judgment calls, and told the author to flag R and T before touching them: the leather is a tailoring-balance question, and the propane tank and gunpowder weights may be intended friction.

:::callout[How we know]{kind=proof}
The merge rule and the load-error rule are read from the 42.22 engine code cited above, and the weights from the 42.22 scripts. No game was run for this page, and the plank try-it in section 2 has not been run. The 218-item list itself is not stored with this page, so the group counts are the audit's and were not re-counted; the audit's open questions (how to cut, whether to add a sandbox option, whether leather is in) were answered by the shipped mod only in part: it cuts by tier multiplier, and this page did not re-check which candidate groups it includes.
:::
