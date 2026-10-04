---
id: build-42-outcast-light-load
slug: outcast-light-load
title: Outcast Light Load
game: pz
version: build-42
section: outcast-mods
category: outcast-light-load
difficulty: beginner
tags:
  - outcast-light-load
  - resource-weights
  - overview
excerpt: >-
  Halves the weight of raw crafting resources in Project Zomboid B42, so hauling
  timber, ore and metal stock is not the whole afternoon.
last_updated: '2026-10-04'
---
# Outcast Light Load

> Source: OutcastLightLoad/README.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Halves the weight of raw crafting resources in Project Zomboid **B42**, so hauling
timber, ore and metal stock is not the whole afternoon.

**Author:** Raxdeg
**Target:** B42 stable, Steam buildid `24449119` (`versionMin=42.13.0`)
**Scope:** 110 vanilla items. Nothing else is modified.
**Status:** v1 (flat x0.5) confirmed working in-game 2026-08-04. v2 -- tiered
x0.35 / x0.10 plus a packing bonus -- is deployed but **not yet re-verified
in-game**.

---

## What it changes

Two tiers, flat within each:

Tiers are **named, not numbered** -- `WOOD` is the shallowest cut, so any
numbering would read backwards.

| Tier | Multiplier | Items | Covers |
|---|---|---|---|
| **WOOD** | **x0.50** (50% lighter) | 21 | Logging + lumber chain -- logs, stacks, planks, branches, sticks, firewood, twigs |
| **BULK** | **x0.35** (65% lighter) | 82 | Everything else hauled by the dozen -- charcoal, ore, ingots, bars, blocks, sheet, scrap, wire, fittings |
| **FAST** | **x0.10** (90% lighter) | 7 | Fasteners consumed in the hundreds -- nails, screws, bolts |

| Example | Vanilla | Now |
|---|---|---|
| `Log` | 9.0 | 4.5 |
| `LogStacks4` | 12.0 | 4.8 |
| `Plank` | 3.0 | 1.5 |
| `IronOre` | 40.0 | 14.0 |
| `IronIngot` | 6.0 | 2.1 |
| `SheetMetal` | 2.0 | 0.7 |
| `Nails` | 0.05 | **0.005** |
| `NailsCarton` | 20.0 | **1.6** |

**`WOOD` is set from playtesting, not theory.** It shipped at x0.35 and was judged
too light on a 2026-08-09 test; x0.50 puts a `Log` back at 4.5. Where playtest and
model disagree, playtest wins.

### The design principle: hoard-intent, not realism

Realism sounds like the right basis and is not. A real 1 m hardwood log is ~40 kg
against vanilla's 9.0, so a realism pass would make logs **four times heavier**.
A real 9mm cartridge is ~12 g against vanilla's 0.02, so realism would make
bullets **lighter** and easier to hoard. On both headline cases realism points the
wrong way.

What the tiers actually encode is **how much the game should let you stockpile a
thing.** Realism is used only as a tiebreaker where it agrees -- which is why
fasteners get the deep cut: a nail at 0.05 is roughly 14x its real 3.5 g, so
convenience and realism both say "much lighter."

### Ammunition is deliberately untouched

No ammo item is modified. Since everything else drops to 35%, ammo becomes about
**3x more expensive in relative terms** with no invented numbers. Vanilla ammo is
already roughly proportionate to reality -- `Bullets9mmCarton` is 8.0 for 600
rounds (`OpenCarton12` -> 12 boxes of 50), and 600 real 9mm rounds is ~7.2 kg --
so there was nothing to correct, only a relative balance to shift.

### Packing is rewarded harder than vanilla

Packed forms -- log stacks, bundles, boxes, cartons -- take an extra **x0.8** on
top of their tier, so consolidating beats carrying loose by more than it does in
vanilla. Counts below are the real recipe outputs from
`generated/recipes/recipes_packing.txt` (`OpenBox100`, `OpenCarton12`,
`UnbundleFirewood`, `UnstackFourLogs`), not inferred from the weights:

| Packed form | Contains | Vanilla reward | Ours |
|---|---|---|---|
| `LogStacks4` | 4 x `Log` | 3.0x | **3.75x** |
| `LogStacks2` | 2 x `Log` | 3.0x | **3.75x** |
| `NailsCarton` | 1200 x `Nails` | 3.0x | **3.75x** |
| `NailsBox` | 100 x `Nails` | 2.5x | **3.12x** |
| `FirewoodBundle` | 6 x `Firewood` | 1.8x | **2.25x** |

Worth being clear that vanilla already rewards packing and a flat-within-tier
multiplier preserves that untouched -- the x0.8 is a deliberate amplification on
top, uniformly +25%.

**Why only x0.8 and not something dramatic:** packing is a cheap two-way craft
(`recipes_packing.txt` ships both `Nails -> NailsBox` and `NailsBox -> Nails`).
A large bonus on a free, reversible action stops being a reward and becomes a tax
on anyone who forgets to press the button.

### Why flat *within* a tier

Vanilla encodes real balance in the *ratios*, and hand-tuning breaks them:

- **Log stacking is already a 3x discount.** `Log` is 9.0 each, but `LogStacks4`
  is 12.0 for four. Cutting `Log` alone would make stacking pointless.
- **Fasteners use a carton/box/loose ladder** -- 20.0 / 2.0 / 0.05.
- **Bar stock is linear** -- quarter 0.5, half 1.0, full 2.0.

A flat multiplier inside each tier preserves all three exactly. Retuning is the
`$TierMultiplier` table in `tools/generate_weights.ps1`.

### Judgement calls worth knowing

- **Ore sits in T1, not a shallower tier.** The heaviest items should get the most
  relief, so `IronOre` lands at 14.0. A "moderate" 50% tier would have left it at
  20.0 -- heavier than the bulk materials it feeds.
- **Fittings are T1, not T2.** `Doorknob`, `Hinge`, `Latch` are single substantial
  metal objects, not bulk consumables. At x0.35 a doorknob is 0.35 (~350 g), about
  right; at x0.10 it would read as tinfoil.
- **`Paperclip` excluded.** Vanilla 0.01 is already realistic. The generator
  refuses no-op overrides rather than pad the item count.

---

## What it deliberately does not touch

- **Leather and hides** -- ~120 near-duplicate variants (species x fur/full x tan
  x wet x size). Would need a pattern sweep, and it moves tailoring balance.
- **Anvils, bellows, propane, gunpowder** -- the weight there is plausibly
  intentional friction, not an oversight.
- **Masonry, earth, cordage, fiber, glass, clay** -- reasonable candidates, but
  they touch carpentry and farming balance. Audited and listed, not shipped.

The full 218-item audit including these is at
`_dev/B42_ResourceWeights/CANDIDATE_ITEMS.md`.

---

## How the override works (and why it is safe)

The mod ships **partial item blocks** -- `Weight` and nothing else:

```
module Base
{
    item Log
    {
        Weight = 4.5,   /* vanilla 9 */
    }
}
```

This merges onto the vanilla definition instead of replacing it. Verified in the
decompiled B42 engine, not assumed:

- `ScriptBucket.CreateFromTokenPP` (`ScriptBucket.java:109-116`) -- a second block
  with an existing name **appends** to the same script object's body list rather
  than creating a new item.
- `ScriptType.Item` carries the `ResetExisting` flag (`ScriptType.java:117,124`),
  so `script.reset()` does fire before the mod's body loads
  (`ScriptBucket.java:194`)...
- ...but neither `Item` nor its parent `GameEntityScript` overrides
  `BaseScriptObject.reset()`, which is an **empty no-op**
  (`BaseScriptObject.java:197`). Nothing is cleared.
- `Item.Load` (`Item.java:1415-1442`) then calls `DoParam` only for keys present
  in the block. `Weight` maps to `actualWeight`, clamped at >= 0
  (`Item.java:2052-2056`).

Net result: model, icon, combat stats, tags, sounds and recipes all survive.

### The bug that broke v1: UTF-8 BOM

v1 shipped with a UTF-8 BOM on both generated files and **did nothing at all**,
with no error anywhere. Recorded here because the failure is invisible:

`CreateFromToken` requires `token.indexOf("module") == 0`
(`ScriptManager.java:1360`), and Java's `String.trim()` only strips chars
`<= U+0020` -- it does **not** strip `U+FEFF`. A BOM shifts `module` to index 1,
so the block never matches and all 110 overrides are skipped silently. The mod
still loads and still appears in the in-game mod list, so it looks fine.

Cause: PowerShell 5.1's `Set-Content -Encoding utf8` writes a BOM. The generator
now uses `[System.IO.File]::WriteAllText` with `UTF8Encoding($false)`, and the
validator byte-checks every shipped file for `EF BB BF`.

A leading `/* */` comment is safe -- `stripComments` runs at
`ScriptManager.java:1335`, before the `module` check.

### The trap this avoids

B42 splits items by `ItemType` across `media/scripts/generated/items/*.txt`.
**`Plank`, `IronBar`, `SteelBar`, `MetalBar`, `MetalPipe`, `Firewood`,
`LongStick` and `LargeBranch` live in `weapon.txt`** with
`DisplayCategory = MaterialWeapon`, because they double as weapons. A mod that
sweeps only the `Material` category silently misses `Plank` -- the most-carried
item in the game.

---

## Compatibility

Any other mod that redefines these same items and **loads after** this one wins,
silently. That is a PZ-wide behaviour, not something this mod can prevent.

So the mod ships a boot-time contract: `media/lua/shared/OutcastLightLoad_Verify.lua`
checks one sentinel item per group on `OnGameBoot` and prints to console:

```
[OutcastLightLoad] OK -- 10 sentinel weights verified.
```

or, if something overrode it:

```
[OutcastLightLoad] *** VERIFICATION FAILED *** 1 sentinel(s) wrong:
[OutcastLightLoad]   Base.Log -- expected 4.500, got 9.000
```

Check the console once after adding the mod to a load order.

---

## Regenerating

Both shipped files are generated. Do not hand-edit them.

```powershell
# 1. re-parse vanilla items (after a game update); parse_items.ps1 lives in our
#    resource-weight research notes, not in the mod
& <research folder>\parse_items.ps1

# 2. regenerate the mod
& .\tools\generate_weights.ps1
```

The generator **aborts without writing** if any item ID is missing from the
vanilla table, has a blank weight, or fails to parse -- so a game update that
renames an item produces a loud failure rather than a quietly shorter mod.

To change the strength of the effect, edit `$Multiplier` in
`tools/generate_weights.ps1` and re-run.

---

## Testing locally

```powershell
& .\tools\deploy_local.ps1           # deploy
& .\tools\deploy_local.ps1 -WhatIf   # dry run
& .\tools\deploy_local.ps1 -Remove   # uninstall
```

Deploys `Contents/mods/OutcastLightLoad/` to `%USERPROFILE%\Zomboid\mods\OutcastLightLoad\`.
It runs the validator first and **refuses to deploy a build that fails**, lists every
file it is about to replace, and flags stale files present locally but absent from
the current build (an old version's leftovers would otherwise keep loading).

Then: launch PZ -> enable **Outcast Light Load** in Mods -> start or load a save ->
check the console for

```
[OutcastLightLoad] OK -- 10 sentinel weights verified.
```

Console log lands in `%USERPROFILE%\Zomboid\Logs\`.

### Debugging when it does nothing

Three files tell you what actually happened, in this order:

| File | Answers |
|---|---|
| `Zomboid\Saves\<mode>\<save>\mods.txt` | Was the mod actually **enabled** for that save? (the in-game list is not proof) |
| `Zomboid\Logs\*DebugLog.txt` | Did it load? Grep for the mod id and for `[OutcastLightLoad]` |
| `Zomboid\Saves\<mode>\<save>\WorldDictionaryReadable.lua` | Per-item `modID` / `isModded` -- whether a mod touched a given item |

If the mod loads but nothing changes, **check the file's first bytes before
theorising** -- see the BOM section below.

Quick in-game confirmation beyond the sentinel line: a `Log` should read **4.5**
and a `Plank` **1.5**. `Plank` is the one worth eyeballing -- it is the item that
lives in `weapon.txt`, so it proves the cross-file overrides bound correctly.

---

## Multiplayer / dedicated server

**Workshop ID: `3777386409`**

The mod is item script data with no client-only logic, so it works in MP -- but it
**must be installed on the server as well as on clients.**

Project Zomboid checksums script files (`ScriptManager.Load` feeds every script
into `NetChecksum`). A client whose scripts differ from the server's is dropped:
`AntiCheat.REASON_INCORRECT_CHECKSUM`, and `AntiCheatChecksumUpdate` times the
connection out after about 60 seconds (it was about 8 seconds before Build 42.21).
So server and clients must run **byte-identical** files -- which is exactly why
everyone should get it from the same Workshop item rather than side-loading. The
one difference the checksum forgives is line endings: since 42.21 it drops every
carriage return before hashing, in every checksummed file (42.20 converted CRLF
pairs, and only for script files), so a file saved with Windows line endings
matches the same file saved with Unix ones.

> **Proof:** Code. `zombie.network.anticheats.AntiCheatChecksumUpdate#isDifferentChecksumTimeoutExpired` (`DIFFERENT_CHECKSUM_STATE_TIMEOUT = IsoWorld.LUA_CHECKSUM_TIMEOUT_MS`, 60 seconds); `zombie.network.NetChecksum$Checksummer#addFile` (skips byte 13). Build 42.21.0 (revision 4a0e9546ec).

Server `.ini`:

```ini
Mods=OutcastLightLoad
WorkshopItems=3777386409
```

**Update the server and the clients together.** Any regeneration changes the
checksum, so a server on the old build will refuse clients on the new one.

### Confirming the server picked it up

The self-check runs on the dedicated server too -- `OnGameBoot` is triggered at
`GameServer.java:1504`, and `media/lua/shared` loads on both sides. Output is
tagged by context:

```
[OutcastLightLoad][SERVER] OK -- 11 sentinel weights verified.
[OutcastLightLoad][CLIENT] OK -- 11 sentinel weights verified.
```

If the two sides disagree, the failing side names the item and both values, and
adds an explicit MP cause (mismatched builds) to the diagnosis list.

`validate_mod.ps1` enforces the MP requirements offline: every Lua file must live
under `media/lua/shared` or `/server` (anything in `client/` would never run on a
dedicated server, so a self-check placed there would report nothing exactly when
you need it), and the self-check must branch on `isServer()`.

---

## Publishing to the Workshop

```powershell
& .\tools\install_workshop_junction.ps1
```

Junctions `%USERPROFILE%\Zomboid\Workshop\OutcastLightLoad` to the repo root --
the same wiring OutcastPunch and OutcastLadders use. The repo is laid out in
`Contents\mods\` shape with `workshop.txt` and `preview.png` at the root
precisely so the junction can point at the root unchanged.

Then: **PZ -> Main Menu -> Workshop -> Create/Update Item -> OutcastLightLoad**.

The script refuses to create the junction unless all five upload artefacts exist,
and `validate_mod.ps1` reports a `Workshop-ready` line that checks image
dimensions and validates every tag in `workshop.txt` against the game's own
`media/WorkshopTags.txt`.

`workshop.txt` ships `visibility=unlisted`. Change it once you have tested the
published copy. After the first upload Steam writes an `id=` line into
`workshop.txt` -- keep it, that is what makes later uploads *update* the same
item instead of creating a duplicate.

---

## Layout

```
workshop.txt                 -- Workshop listing (title, description, tags)
preview.png                  -- 256x256 Workshop tile
Contents/mods/OutcastLightLoad/42/
    mod.info
    icon.png                                             (32x32)
    poster.png                                           (256x256)
    media/scripts/OutcastLightLoad_ResourceWeights.txt   (generated, 110 items)
    media/lua/shared/OutcastLightLoad_Verify.lua         (generated, 11 sentinels)
tools/generate_weights.ps1           -- emits both generated files
tools/make_art.ps1                   -- emits icon / poster / preview
tools/validate_mod.ps1               -- repo guard, offline
tools/deploy_local.ps1               -- deploy/uninstall for local testing
tools/install_workshop_junction.ps1  -- wire up the Workshop uploader
```

---

## Not yet done

- **v2 not yet verified in-game.** v1 (flat x0.5) was confirmed working; the
  tiered v2 with the packing bonus is deployed but unlaunched. Expect `Log` 3.15,
  `Plank` 1.05, `IronOre` 14.0, `LogStacks4` 3.36, `Nails` 0.005, and **11**
  sentinels rather than 10.
- **Art is programmer-art.** `tools/make_art.ps1` generates a serviceable
  icon/poster/preview. Replace with real art any time; nothing depends on them
  beyond existing at the right dimensions.
- **Multiplayer not yet exercised.** The MP requirements are verified against the
  engine and enforced by the validator, but no dedicated-server session has run.
  That is what the test server is for -- watch for the `[SERVER]` line.
- No `icon.png` / `poster.png` yet -- both needed before a Workshop upload.
- Multiplayer untested (script-only mods normally need no server-side logic, as
  item scripts load on both sides, but this is unconfirmed).

*Updated 2026-10-04 for Build 42.21: the checksum-mismatch timeout is now about 60 seconds, and the checksum ignores carriage returns; line numbers re-pointed.*
