---
id: build-42-outcast-lib
slug: outcast-lib
title: Outcast Lib
game: pz
version: build-42
section: outcast-mods
category: outcast-lib
difficulty: beginner
tags:
  - outcast-lib
  - shared-runtime
  - overview
excerpt: Shared runtime for the Outcast mod family. Project Zomboid B42 only.
last_updated: '2026-10-04'
---
# Outcast Lib

> Source: OutcastLib/README.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Shared runtime for the Outcast mod family. Project Zomboid **B42 only**.

**Mod id:** `OutcastLib` | **Author:** Raxdeg / Dystopian Outcasts
**Distribution:** published on the Steam Workshop as item `3778987608`, with
`visibility=unlisted` in its `workshop.txt`: it does not show in Workshop search,
but it is a real Workshop item.

> **Status: M0-M4 implemented and unit-tested. SawAll retrofitted and verified
> in game.**
>
> Eight modules ship -- `OL_Init`, `OL_Containers`, `OL_Reach`, `OL_Squares`,
> `OL_Compat`, `OL_Debug`, `OL_Options`, `OL_VehicleParts` -- with **247 checks
> green** under `lua test_all.lua`. Every one has at least one real consumer.
>
> **Four modules were removed on 2026-08-05:** `OL_Filter`, `OL_Index`,
> `OL_Classify`, `OL_Transfer`. All were written for OutcastStowAll, which was
> abandoned once vanilla B42 turned out to already ship its feature
> (`TransferSameTypeMultiContainer`, Build 42.13.0). With StowAll gone they had
> zero callers, so rule 3 removed them. They are parked complete and tested in
> `OutcastStowAll/abandoned-lib-modules/`, and `tests/test_init.lua` asserts they
> stay absent.
>
> Spikes S1 and S2 are **resolved from the sealed decompile**; S3 is partly
> resolved. See the status table in [`docs/API.md`](/pz/build-42/outcast-mods/outcast-lib/outcast-lib-api). The reasoning
> behind every decision is in `R:\ZOMBOID\_dev\OutcastLib\PLAN.md`.
>
> **Verified in game 2026-08-04** via `OutcastLibProbe` (a throwaway consumer,
> sibling repo, delete when done): `require=` delivers the library ahead of the
> consumer; the version floor raises a named sentence; and against real engine
> objects `Containers.destinations`, `Containers.roomFor`, `Reach.squares`,
> `Squares.containersOn` and `Filter.isMovable` all behave. 12 static + 11 live
> checks, 0 failures.
>
> **Still unverified:** the dedicated-server path (`isServer=true`, hand-written
> `Mods=` line) and the missing-dependency failure mode. Both are quick; see
> `OutcastLibProbe/README.md` tests B and C.
>
> **Published to the Workshop as `id=3778987608`** (unlisted). Further uploads
> UPDATE that item -- the id in `workshop.txt` is what makes that happen, so it
> must stay committed.
>
> `scripts/validate-data.ps1` gates every upload at **56 checks**, enforcing the
> uploader's own rules read from `SteamWorkshopItem` rather than inferred:
> preview present and square 256/512 and under 1000KB, only `buildings`,
> `creative` or `mods` inside `Contents/`, no blocked file types, the version
> folder parseable as a game version, and assets named in `mod.info` actually
> existing. Run it before every publish.
>
> `icon.png`, `poster.png` and `preview.png` are **placeholders** -- plain "OL"
> plates. Replace them when there is real art.
>
> Deploy steps for the dedicated server, including the `WorkshopItems=` vs
> `Mods=` distinction, are in `docs/DEPLOY.md` (local reference: DEPLOY.md).

---

## What this is

Five Outcast mods independently reimplemented the same container-scanning and
item-filtering code. This library holds the parts that are provably identical so
they exist once.

Consumers declare a dependency and call into a global:

```ini
# mod.info
require=OutcastLib
```

```lua
OutcastLib.require(3, "OutcastStowAll")          -- named failure, not a nil-index
local dests = OutcastLib.Containers.destinations(playerNum)
```

## Consumers

| Mod | Uses | Status |
|---|---|---|
| `OutcastRipAll` | Reach, Squares, Containers | shipped -- retrofit pending |
| `OutcastSawAll` | Reach, Squares, Containers | **retrofitted** -- `OSA_Scan.lua` 459 -> 380 lines, its own suite green |
| `OutcastProximity` | Debug, Compat, Containers, Options | written but does **not** use the library yet -- retrofit is the next job |
| `OutcastStowAll` | -- | **abandoned 2026-08-05.** Vanilla B42 ships its feature; holds the four removed modules |
| `OutcastMotors` | VehicleParts (producer) | registers its parts provider; works with **no UI mod** installed |
| `OutcastMotorsUI` | VehicleParts (consumer) | enumerates providers; works with **no producers** installed |
| `OutcastPunch`, `OutcastLightLoad` | nothing | neither calls `getActivatedMods` nor logs |

Every module in the table above has a real consumer. That is the invariant the
2026-08-05 removal restored, and it is worth checking against this table before
adding anything.

## The duplication this removes

Measured, not estimated:

- `OSA_Scan.lua:138-170` and `ORA_Scan.lua:104-136` are **byte-identical, 33
  lines**, comments included. That is `reachableSquares`.
- `OSA.squareContainers` and `addSquareContainers` are structurally identical --
  the same three passes over `getStaticMovingObjects`, `getObjects` /
  `getContainerByIndex`, and `getWorldObjects`, carrying the same comment about
  `getInventory()` being declared on `InventoryContainer`, not `InventoryItem`.
  They differ only in the corpse predicate and the dedupe style.
- Upstream Proximity Inventory's `proxInvTakeSameType` and OutcastStowAll's
  Tier A router are the same four steps run in opposite directions.

---

## Four rules that must not be broken

These are the difference between a library and a config nightmare. Each exists
because of a specific defect.

### 1. Survey vanilla before designing anything.

**Read `media/lua/client/ISUI/{InventoryWindow,LootWindow}/Handlers/` at the
front of every feature**, before the Workshop survey -- not after the code is
written and tested.

This rule replaced an older one about `Classify`, and it was bought at the cost
of four finished modules. Cluster B was designed, built and tested against a
competitive review covering five Workshop mods and **zero vanilla handlers**.
B42 had already shipped the feature in 42.13.0. The old rule's own worked
example -- "coarse `DisplayCategory` buckets are catastrophic for routing;
`Material` alone covers 383 items" -- is still true and still worth knowing, but
it was reasoning about a problem vanilla had already solved.

B42 absorbed a great deal of what B41-era mods existed to do, and that directory
is where most of it landed.

### 2. Primitives, not policy.

The library owns what is provably identical. A divergence that exists for a
stated reason stays in the consumer.

Concretely: `Containers.isUnlocked()` is shared because the `IsoThumpable` lock
check is identical in both scan files. SawAll's 2.5-tile `CRAFT_REACH` clamp is
**not** shared -- it exists because `BaseCraftingLogic.isContainersAccessible`
fails a whole recipe when any container is out of range, which is a crafting
constraint RipAll does not have. Pulling it into the library would silently
apply a craft rule to a mod that does no crafting.

### 3. Nothing enters the library until it has two real consumers.

One caller means it belongs to that mod. This is what keeps the library from
becoming a dumping ground that every mod depends on and nothing fully uses.

### 4. Fail loudly.

The family's standing hazard is silent failure -- see the B42 gotchas notes. No
function here may return a plausible-looking empty result where it meant "I
could not do that." Every cap or truncation reports what it dropped.

---

## Engine facts this depends on

Verified against the installed build **42.20.0**, revision `a2947723ca`, and the
sealed decompile at `R:\ZOMBOID\PZ_Engine_Records\B42\src`.

**`require=` drives load order.** `ZomboidFileSystem.loadModAndRequired`
(`:815-843`) recurses into `info.getRequire()` and appends dependencies to
`ordered` *before* the mod itself; `loadMods` (`:855`) loads in that order.
`ordered.contains(modId)` makes it cycle-safe. The library is guaranteed to load
first.

**A missing dependency fails visibly.** `DebugType.Mod.warn("required mod ... not
found")` (`:829`), removal from `GameServer.ServerMods` on a server, and
`ChooseGameInfo.Mod.isAvailableRequired` (`:656-680`) marking the consumer
unavailable in the mod list.

**`InventoryItem` exclusion pair:** `isFavorite()` (`:3629`) and
`isUnwanted(IsoPlayer)` (`:5318`). Both are needed; Easy Drop'n'Loot checks only
the first.

**Item tags are not strings.** `InventoryItem:getTags()` returns `Set<ItemTag>`
(`:2935`) -- **no `:get(i)`**. The `:get(i)`/`:size()` idiom throughout vanilla
Lua is `recipe:getTags()`, a different type. Use `hasTag(ItemTag)` (`:2943`).
`ItemTag` is a registry class, not an enum, with a public `register(String)`.

**`getInventory()` is declared on `InventoryContainer` (`:56`), not
`InventoryItem`.** Calling it on a plain garment lying on the ground is a hard
error. The `instanceof` test must come first -- the same order vanilla uses at
`ISInventoryPage.lua:1698`.

**Never write a UTF-8 BOM.** PowerShell 5.1's `Set-Content -Encoding utf8`,
`Out-File` and `Export-Csv -Encoding utf8` all emit one, and a BOM silently voids
an entire PZ script file. Use
`[System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding $false))`.

---

## Layout

Everything listed exists. Modules removed on 2026-08-05 are in
`OutcastStowAll/abandoned-lib-modules/`.

```
OutcastLib/
  Contents/mods/OutcastLib/42/
    mod.info                  id=OutcastLib  author=Raxdeg  versionMin=42.20.0
    media/lua/shared/OutcastLib/
      OL_Init.lua             OutcastLib global + VERSION + require()
      OL_Containers.lua       predicates, room math, destination list
      OL_Options.lua          canonical Mod Options getter
      OL_Compat.lua           getActivatedMods probes
      OL_Debug.lua            gated logging
      OL_Reach.lua            reachableSquares
      OL_Squares.lua          per-square container sweep
      OL_VehicleParts.lua     vehicle-part provider registry



  docs/API.md                 the contract. Build against this.
  scripts/install-junctions.ps1   vendored byte-identical from _shared/
  tests/pz_stub.lua           canonical; consumers reference by relative path
  tests/harness.lua           stub load, require shim, assertions
  tests/test_all.lua          runs every suite; exits non-zero on failure
  tests/test_*.lua            one per module
  workshop.txt                no id= yet -- assigned on first upload
```

Every `OL_*.lua` opens with `require "OutcastLib/OL_Init"`. That is load-bearing:
PZ loads a directory alphabetically and `OL_Init` sorts *after* three of the other
files, so nothing may assume the global already exists. See `docs/API.md`.

Everything ships under `shared/` so headless tests can require it and both the
client and server Lua states see it.

## Build and test

No build step -- PZ loads Lua directly.

```powershell
.\scripts\install-junctions.ps1     # junction into ~/Zomboid/mods + /Workshop

cd tests                            # paths in the suite are relative to here
lua test_all.lua                    # headless, no game needed
lua test_squares.lua                # or any single suite, standalone
```

`test_all.lua` exits non-zero on any failure, so it can gate a commit.

`tests/pz_stub.lua` is a minimal stand-in for `ArrayList`, items, containers,
squares and the inventory pages. It is the **canonical** copy -- it began in
OutcastSawAll and moved here when OutcastLib became the second consumer, per the
family rule that nothing is shared until two mods actually need it.

It models shapes and return types, not behaviour, and it is never evidence about
what the engine really does -- that comes from the decompile. When extending it,
add the narrowest thing that lets a test express its case: a stub that grows its
own logic starts passing tests the game would fail.

## Deploying

Add `OutcastLib` to the server's `Mods=` line. Order does not matter -- `require=`
sorts it.

**It must be *installed*, which is not the same as *listed*.** An earlier draft
of this section said "present" and meant the `Mods=` line; that is wrong.
`ZomboidFileSystem.loadModsAux` (`:815-843`) resolves a `require=` entry with
`ChooseGameInfo.getAvailableModDetails(modId)` -- `getModDetails` filtered by
`isAvailable()` -- which is a lookup over **installed** mods and never consults
the `Mods=` line. An installed-but-unlisted library is therefore appended to
`ordered` and loads anyway.

The `required mod "OutcastLib" not found` warn (`:829`) and
`isAvailableRequired` (`:656-680`) marking consumers unavailable fire only when
the library is genuinely not installed, or not available for this game version.

So the real deployment risk is not a forgotten ini line -- it is the mod folder
not being on the server at all, or a `versionMin` above the running build.

## Out of scope

`install-junctions.ps1` duplication is **not** this library's problem -- a PZ mod
ships Lua, not PowerShell. It already has its own answer:
`Mods\OutcastMods\_shared\` holds the canonical copy, and each mod vendors it at
dev time under a checksum gate. This repo's `scripts/install-junctions.ps1` is a
byte-identical vendored copy of that canonical file.

That canonical copy is genuinely mod-agnostic -- it discovers the mod id from
`Contents\mods\` rather than assuming the folder name -- so no OutcastLib-specific
variant was needed or written.

> Noticed while vendoring, and **not fixed here**: `OutcastSawAll`'s vendored
> copy has drifted from `_shared\`. It is an older revision with the mod name
> hardcoded into the help text, predating the mod-agnostic rewrite. Someone
> should re-vendor it; it is out of scope for this repo.

`validate-data.ps1` stays per-mod -- 184/130/275 lines across three mods, all
correctly divergent.

---

*Corrected 2026-10-04: OutcastLib is a published, unlisted Workshop item (3778987608), not private-server only.*
