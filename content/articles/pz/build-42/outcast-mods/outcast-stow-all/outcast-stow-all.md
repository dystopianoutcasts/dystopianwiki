---
id: build-42-outcast-stow-all
slug: outcast-stow-all
title: Outcast Stow All
game: pz
version: build-42
section: outcast-mods
category: outcast-stow-all
difficulty: beginner
tags:
  - outcast-stow-all
  - inventory
  - overview
excerpt: >-
  One button files your mixed loot into the containers around you that already
  hold that item. Anything with no home stays on you.
last_updated: '2026-09-29'
---
# Outcast Stow All

> Source: OutcastStowAll/README.md (compiled 2026-08-06, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

One button files your mixed loot into the containers around you that **already
hold that item**. Anything with no home stays on you.

Project Zomboid **B42 only** (`versionMin=42.20.0`).
**Mod id:** `OutcastStowAll` | **Author:** Raxdeg / Dystopian Outcasts
**Requires:** `OutcastLib` (local reference: ../OutcastLib) -- `require=OutcastLib` in `mod.info`.

> # ABANDONED -- 2026-08-05
>
> **Superseded by vanilla.** B42 42.13.0 shipped
> `ISUI/InventoryWindow/Handlers/TransferSameTypeMultiContainer.lua`, registered
> by default, tooltip *"Transfer items of matching types to nearby containers."*
> It matches on `getFullType()`, skips favourites and equipped items, and is
> room-aware. That is this mod's entire Tier A.
>
> Not abandoned for a technical reason. It was never run in game and never
> published; there is no Workshop item.
>
> **It no longer loads.** `OL_Filter`, `OL_Index`, `OL_Classify` and
> `OL_Transfer` were removed from `OutcastLib` once this mod stopped being their
> consumer; `OST_Scan`, `OST_Run` and `OST_Compat` still call all four. They are
> parked in `abandoned-lib-modules/` -- restore those first if reviving.
> `test_routing.lua` still passes (43 checks), but it covers only the pure
> router, not the mod.
>
> **What was actually left, if this is ever revived:** Tier B tag matching (no
> vanilla equivalent), reporting what stayed behind (vanilla is silent), and
> `isWorn` filtering. Vanilla has two things this does not, one of them a live
> defect here: a mouse-over preview, and `getClothingItemExtra()` alternate-type
> handling `OST_Plan` would get wrong.
>
> Revive it as a small tag-matching mod that **composes with** the vanilla
> button, not as a replacement for it. The full record is in our planning
> notes for the mod (not published).
>
> `OutcastLib` is unaffected -- separate mod, separate life, already used by
> `OutcastSawAll`.

---

## What it does

Walk up to your storage, press **Stow All**. Every stack in your bags goes to
the container that already holds it -- sticks to the stick crate, stones to the
stone crate. Anything nothing nearby claims is left in your inventory.

Two behaviours are worth stating because they are choices, not limitations:

**It never invents a home.** On a fresh base it files nothing and tells you so.
Seed a container by hand once and it is a home forever. Every bucket-based
sorter has to guess, because it has a fixed list of destinations and no way to
say "none of these" -- this one can.

**It never lies about what it did.** A full crate, a container that refuses an
item, the per-click limit -- each is counted and reported. A run that quietly
moves 8 of 10 and says 10 is the failure this whole mod family keeps hitting.

## Why exact-item matching

`DisplayCategory` is far too coarse to sort by. On 42.20.0, 5105 items collapse
into ~80 categories and **`Material` alone holds 383** -- `Twigs`, `LargeStone`,
`Limestone`, `Log`, `Nails`, `Rope` and `Sheet` are all `Material`. `Plank` is
not even in it; it lives in `weapon.txt` as `MaterialWeapon`.

So a mod matching on category empties your whole pack into whichever container
you are standing at. Matching on `getFullType()` is the entire point.

Reproduce:

```bash
grep -h "DisplayCategory" -r media/scripts/generated/items/ \
  | sed 's/.*DisplayCategory *= *//; s/,.*//' | sort | uniq -c | sort -rn
```

## Layout

```
Contents/mods/OutcastStowAll/42/
  mod.info                        require=OutcastLib
  media/lua/client/OutcastStowAll/
    OST_Scan.lua      builds the plan's inputs from OutcastLib
    OST_Plan.lua      routing -- PURE, no engine calls, unit-tested
    OST_Run.lua       queues transfers, reconciles the two reports
    OST_UI.lua        button + context menu
    OST_Options.lua   Mod Options panel
    OST_Compat.lua    proximity-aggregate guard
  media/lua/shared/OutcastStowAll/OST_Config.lua
  media/lua/shared/Translate/EN/{UI,IG_UI,ContextMenu}.json
tests/test_routing.lua            43 checks, no game and no OutcastLib needed
scripts/install-junctions.ps1     dev junctions
scripts/validate-data.ps1         translation, BOM, mod.info and test gate
```

`OST_Plan.lua` makes **zero engine calls** by design. Tie-breaks, room
accounting and the tier fall-through are where this mod will actually break, and
none of them need the game to test.

## Develop

```powershell
.\scripts\install-junctions.ps1     # ~/Zomboid/mods + ~/Zomboid/Workshop
.\scripts\validate-data.ps1         # runs the tests too
```

```bash
cd tests && lua test_routing.lua
```

## Before uploading

- [ ] **`poster.png` and `icon.png` do not exist.** Both are named in `mod.info`
      and must be supplied, or the mod shows blank in the list.
- [ ] **`preview.png`** for the Workshop page.
- [ ] **`workshop.txt` has an empty `id=`.** The in-game uploader fills it on
      first publish; leave it blank until then, then commit the value it writes.
- [ ] **`OutcastLib` must be in the server's `Mods=` line.** `require=` fixes the
      load *order* but cannot add a mod the server was never told about. Without
      it this mod is silently unavailable, with only a log line to say why.
- [ ] Nothing here has run in game. Work the test matrix below first.

## Test matrix

Nothing below is covered by the unit tests -- they all need the engine.

- **Headline:** stick crate and stone crate side by side. One press files both
  correctly. This is the case Easy Drop'n'Loot fails.
- **Empty base:** no seeded containers. One press does nothing and says so.
- **Room exhaustion:** destination with room for 3 of 10. Three move, seven
  stay, and the note says seven.
- **Refusal:** a container that rejects an item type. It stays, and the note
  says the container would not take it.
- **Exclusions:** favourited, equipped, worn bag, marked unwanted -- none move.
- **Nested bags:** items inside a duffel inside the main inventory are filed.
- **Proximity active:** with `OutcastProximity` or upstream Proximity Inventory
  running, items are not double-counted and the aggregate is never a
  destination. The `OST_Compat` guard should stay silent; if it fires, the
  library's exclusion has regressed.
- **Easy Drop'n'Loot active:** both buttons visible, neither drawn on the other.
- **Tag mode:** on, with no exact home present -- files by shared tag. With a
  full exact home present -- does **not** fall through to the tag match.
- **Dedicated server:** two clients stowing into the same container at once.
- **Split screen:** player 2's button files player 2's items.

## Known gaps

`OST_Scan` uses `it:getUnequippedWeight()` for item weight. `OutcastLib`'s
`Containers.roomFor` measures against `getCapacityWeight()`, which for the
player's own inventory returns `chr.getInventoryWeight()`. The two should agree
for ordinary items in ordinary containers, but this pairing has not been checked
against a real over-encumbered character.
