---
id: build-42-outcast-rip-all
slug: outcast-rip-all
title: Outcast Rip All
game: pz
version: build-42
section: outcast-mods
category: outcast-rip-all
difficulty: beginner
tags:
  - outcast-rip-all
  - crafting
  - overview
excerpt: >-
  A single context-menu button that rips every rippable garment in your
  inventory and in the containers around you.
last_updated: '2026-09-29'
---
# Outcast Rip All

> Source: OutcastRipAll/README.md (compiled 2026-08-07, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A single context-menu button that rips every rippable garment in your inventory
and in the containers around you.

Build 42 only. Requires **OutcastLib**, declared as `require=OutcastLib` in
`mod.info` so the game loads it first and marks this mod unavailable -- with a
log line -- if it is missing.

## What you get

Right-click anything in your inventory, or empty space in a container, and you
get `Rip All (n)` where `n` is exactly how many garments will be ripped. The
tooltip breaks down anything that was left out and why.

Your character then works through the list one place at a time -- containers get
ripped where they stand, and for each body they walk over, take its clothes off,
and rip those. Only one body's worth of clothing is ever on your back, so a pile
of twenty corpses will not leave you immobile.

Each rip is the ordinary vanilla craft, and each strip is the ordinary vanilla
transfer. Dirty-strip rolls, tool wear and multiplayer syncing are untouched,
because the mod queues the game's own actions rather than reimplementing them.

Note that **ripping awards no Tailoring XP in B42**. It did in B41; the B42
recipes carry no `xpAward` at all. Tailoring level still raises the number of
strips you get, but ripping is not a way to train it. This mod does not change
that either way -- see `docs/DESIGN.md`.

Walk away and it stops. It stays stopped -- click again to resume.

## Socks, underwear, gloves, hats and masks are rippable again

Vanilla gates ripping on an item tag rather than on what the item is made of, and
the tag list has holes in it: socks and underwear are cotton, gloves and hats and
masks are cotton or leather, and none of them can be ripped by anything in the
base game. It reads as an oversight rather than a decision -- a boob tube is
rippable, so it was never a rule about underwear.

This mod adds the tag each item's fabric implies, to **298 items**. 231 of those
had no `FabricType` at all -- caps and hats, boots and dress shoes, shellsuit and
ghillie trousers, padded jackets, bras and corsets, burlap underwear, hi-viz and
hunting vests, balaclavas -- so they are given a fabric as well as the tag,
without which ripping would consume them and produce nothing.

Boots and leather hats yield **leather strips** and need scissors or a sharp
knife. Caps and cloth hats yield **rags**, bare-handed.

They become rippable **everywhere**, including vanilla's own right-click "Rip
Clothing" -- not just through this button.

Rigid gear is deliberately left alone: every helmet, hard hats, gas masks and
respirators, trainers, flip-flops, wellies, tyre sandals, metal and bone
gauntlets, the athletic cup, and garbage-bag and tarp clothing. The generator
prints every exclusion by name, with the rule that caught it, on each run.

Helmets are found two ways. Most say "helmet"; six do not -- `Hat_Army`,
`Hat_ArmyDesert`, `Hat_ArmyDesertNew`, `Hat_ArmyWWII`, `Hat_Fireman` and
`Hat_SWAT` -- and those are caught by `BiteDefense >= 20`, which every piece of
cloth headwear in the game sits at 0 for. That test is **headwear only**: leather
boots are armour too, at `BiteDefense` 100, and they are exactly what this pass
exists to collect.

Regenerate after a game update:

```powershell
python .\scripts\generate-fabric-tags.py --media <path-to-B42-media>
```

## What it will not do

- **Clothing worn by anything still alive** -- you, another survivor. It is
  counted in the tooltip and left alone. That is the shirt someone is standing in.
- **Favourited items.** Never, and not configurable.
- **Loose garments lying on the ground.** Bags on the ground are swept; loose
  clothing is not. Right-click it directly, as usual. `docs/ENGINE.md` explains
  why picking it up automatically would risk duplicating it.
- **Bodies it cannot stand next to.** If there is no free tile beside a corpse, it
  is skipped and the run moves on.

## Options

In-game **Options -> Mods -> Outcast Rip All**:

- **Search radius** (0-10, default 4) -- how far around you it looks for
  containers and bodies. Your character walks to each in turn, so this is how far
  a run will travel rather than how far it can reach. Only squares you can see
  are searched.
- **Max items per click** (5-1000, default 100) -- ceiling on the action queue.
- **Rip cotton** (default on) -- rips bare-handed, and is most of what you find.
- **Rip denim** (default on) -- needs scissors or a sharp knife that is not dull,
  and takes twice as long per garment.
- **Rip leather** (default on) -- same tool requirement. Separate from denim so
  leather jackets can be spared while denim is shredded.

Turning all three fabrics off turns the mod off. The option still appears on a
rippable item, greyed out, rather than silently vanishing -- so it reads as "this
is switched off" rather than "this is broken".

## Developing

```powershell
.\scripts\install-junctions.ps1              # link the working tree into Zomboid\mods
.\scripts\validate-data.ps1 -GameMedia <path-to-B42-media>
.\scripts\install-junctions.ps1 -Remove
```

`validate-data.ps1` catches the three failures the game swallows silently: an
undefined translation key, a renamed craftRecipe, and malformed translation JSON.
Run it with `-GameMedia` before publishing.

## Status

- Written against B42 revision `a2947723ca` (steam buildid `24449119`).
- Single player logic is vanilla end to end; nothing custom is sent over the
  network.
- **Not yet tested on a dedicated server.** One assumption is specifically
  unverified there: undressing a body and then ripping what came off relies on
  the transfer having landed before its completion callback fires. Single player
  is verified; the client path depends on `setWaitForFinished`. If it is wrong,
  bodies get undressed and not ripped, and the mod says so on screen rather than
  failing silently. `docs/ENGINE.md` has the call sites.
- Artwork is generated, not hand-drawn: `scripts/generate-artwork.py` writes
  `preview.png`, `poster.png` and `icon.png`. It is deterministic, so re-running
  produces identical files. Replace them with real art whenever you like -- the
  script is a starting point, not a commitment.

## Docs

- `docs/DESIGN.md` -- what was decided and what each decision costs.
- `docs/ENGINE.md` -- the B42 engine facts this mod depends on, with citations.

## Credits

Raxdeg / Dystopian Outcasts.
