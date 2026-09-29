---
id: build-42-outcast-husbandry
slug: outcast-husbandry
title: Outcast Husbandry
game: pz
version: build-42
section: outcast-mods
category: outcast-husbandry
difficulty: beginner
tags:
  - outcast-husbandry
  - animals
  - overview
excerpt: >-
  Livestock in a designated animal zone get hungry and thirsty far more slowly,
  so a few days away does not come back to a dead herd.
last_updated: '2026-09-29'
---
# Outcast Husbandry

> Source: OutcastHusbandry/README.md (compiled 2026-09-24, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Livestock in a designated animal zone get hungry and thirsty far more slowly, so
a few days away does not come back to a dead herd.

Build 42 (`42.20.0`+). Server-side. Safe to add to an existing save.

On a dedicated server only the server needs the mod. Clients never load any of
it, and no vanilla file is replaced. See [docs/MULTIPLAYER.md](/pz/build-42/outcast-mods/outcast-husbandry/outcast-husbandry-multiplayer).

## The problem

On a server the world clock never stops. Your farm's chunks unload when nobody is
nearby, but time keeps running, and the moment someone walks back the engine
replays the *entire* absence in one burst. At the default 90 minute day, a cow
with a dry trough dies in about 26 real hours.

## What it does

**Slows the rate neglect builds.** At boot the mod scales `hungerMultiplier` and
`thirstMultiplier` in the animal definitions by a sandbox-configurable factor.
At the default `0.15`, with a dry trough and nobody home:

| | vanilla | at 0.15 |
|---|---|---|
| cow | 1.1 real days | **2.9** |
| pig, sheep | 1.3 | **4.3** |
| chicken | 2.2 | **14.0** |
| turkey | 1.5 | **9.3** |

Cows are the limiting animal because they drink fastest. All figures assume a 90
minute day and scale with yours.

**Holds a neglected animal at a health floor** while somebody is near the zone.

## The trade

This is **one rate and it applies both times**. Slowing offline neglect slows it
while you are playing too, and there is no way to separate them: the engine
replays an absence using the same numbers it uses live. At `0.15` a cow gets
thirsty after about 51 in-game days instead of 5.

If you want vanilla husbandry speed, set the rate to `1.00` and the mod leaves
the definitions alone.

`healthLossMultiplier` is deliberately **not** touched. The engine shares that
one number between starvation, health regeneration, old age, vehicle impacts and
all combat damage, so reducing it would make animals proportionally harder to
kill and butcher.

## Scope

Only animals inside a designated **animal zone** are protected. Wild animals and
loose animals are untouched, and hunting is unchanged.

Worth knowing regardless of this mod: the engine's offline feeding only searches
an animal's *connected animal zone*. A trough one tile outside the zone is never
used while you are away, however full. If your pens are not zoned, zone them.

## Options

Sandbox tab **Outcast Husbandry**:

| Option | Default | Effect |
|---|---|---|
| Protect livestock from neglect death | on | Master switch. Off is exact vanilla. |
| Neglect rate | 0.15 | Fraction of vanilla. `1.00` disables the protection. |
| Health floor | 0.15 | Lowest health neglect may reach while you are present. |

The rate is written into the definitions at startup, so **changing it needs a
restart**.

## Verifying it is live

The mod reports what it actually applied, in the server log:

```
[OutcastHusbandry] ready -- neglect rate 0.15x on 24 definitions, health floor 0.15
[OutcastHusbandry] weakest protected animal is cow: about 1120 in-game hours (46 in-game days)
                   unattended with a dry trough before it would die
```

A `SELF TEST FAILED`, `NOT PROTECTED` or `PARTIAL` line names exactly which step
did not happen. These lines print through `print()`, which on a dedicated server
reaches `DebugLog-server.txt` in the bundle an admin can download.

## History, because it matters for trust

The first design tried to bound the catch-up burst by writing
`DesignationZone.hourLastSeen`. **That was never possible** -- PZ's Lua exposes
Java methods, not public instance fields, and a field read returns `nil`
silently. The mod shipped and ran inert for seven weeks and 253 boots, reporting
a cap and a debt system that did nothing, while its Workshop page claimed a
capability it did not have.

It was found by another modder reading a server log, not by us. The boot self
test is the only reason it was visible at all, which is why this version still
has one and why its lines now state only what was measured.

docs/DESIGN.md (not yet published) records the dead end in full, including the two
other levers that also fail, so nobody rebuilds on it.

## Development

```
pwsh -File scripts/validate-data.ps1   # engine-parsed file formats
lua  tests/test_rates.lua              # scaling and survival arithmetic
```

## Credits

By Raxdeg, for the Dystopian Outcasts server.
