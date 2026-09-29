---
id: build-42-outcast-upright
slug: outcast-upright
title: Outcast Upright
game: pz
version: build-42
section: outcast-mods
category: outcast-upright
difficulty: beginner
tags:
  - outcast-upright
  - vehicles
  - overview
excerpt: >-
  Build 42 only. Requires OutcastLib (require=OutcastLib), which supplies the
  gated logger and the shared Outcast.log sink.
last_updated: '2026-09-29'
---
# Outcast Upright

> Source: OutcastUpright/README.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Build 42 only. Requires **OutcastLib** (`require=OutcastLib`), which supplies the
gated logger and the shared `Outcast.log` sink.

Two things:

1. **Right an overturned vehicle.** Walk up to it, open the radial menu, click
   **Flip Upright**. A jack and a Strength-scaled timed action puts a flipped
   car, truck or trailer back on its wheels. Park a wrecker nearby and it takes a
   fraction as long with no tools at all. No admin rights needed — that is the
   whole point, since vanilla already lets an admin do it.
2. **Stop animal trailers tipping when you hitch them.** That is a vanilla bug,
   not a balance choice, and this fixes it.

Hitching itself is **not** in this mod: vanilla already puts attach and detach
trailer in the same radial menu, for any player, with no permission check.

Everything is sandbox-tunable. The trailer fix can be turned off independently of
the flip.

---

## The vanilla bug, briefly

Hitching a livestock trailer or horsebox to a truck tips it onto its side and
snaps the hitch with a metal-break sound. Three things combine:

- The game validates that the two tow points are close **in 2D only**.
  `canAttachTrailer` computes `DistanceToSquared(v1.x, v1.y, 0, v2.x, v2.y, 0)` —
  the height is literally passed as zero. Hitch *height* mismatch is never
  checked.
- It then joins them with a 6DoF constraint whose roll is limited to **±3°** and
  whose three linear axes are locked to zero.
- Vanilla hitch heights genuinely differ: pickup and van sit at -0.2747, the
  utility trailer at -0.0879, the livestock trailer at -0.3954 and the horsebox
  at -0.5574.

So a 0.28-unit vertical gap gets resolved instantly by a rigid joint against
loaded suspension, with roll locked to the tow vehicle. Then
`checkTrailerVerticalAlignment` sees the tilt pass its own 0.8 threshold and
breaks the hitch.

The guard holds the trailer level while that joint settles. It does not change
any vanilla value or ship any script override.

`docs/ENGINE.md` has the full teardown with decompiled line citations.

---

## Development

```powershell
# Point the game at this working tree. No copy step, so you cannot test a stale build.
.\scripts\install-junctions.ps1

# Check the data before every commit. Catches the silent failures.
.\scripts\validate-data.ps1

# Undo the junctions.
.\scripts\install-junctions.ps1 -Remove

# Regenerate preview/poster/icon. Committed so the art is reproducible rather
# than three binaries nobody can rebuild.
.\scripts\make-art.ps1
```

`validate-data.ps1` exists because five failure modes ship without the game ever
complaining. The worst is a double-slash comment anywhere in
`sandbox-options.txt`: `CustomSandboxOptions.readFile` joins the file's lines with
no separator, so one `//` swallows the rest of the file and the entire option set
silently fails to register — and the built-in defaults then mask it perfectly. The
mod looks like it works while every setting is ignored.

### Layout

```
preview.png                                        Steam Workshop tile, 256x256
workshop.txt                                       uploader manifest
Contents/mods/OutcastUpright/42/
  mod.info
  poster.png                                       in-game mod panel, 256x256
  icon.png                                         in-game mod list row, 32x32
  media/sandbox-options.txt
  media/lua/shared/OutcastUpright/OUP_Config.lua    identity, options, engine constants
  media/lua/shared/OutcastUpright/OUP_Debug.lua     logging, via OutcastLib
  media/lua/shared/OutcastUpright/OUP_Detect.lua    gating -- the single source of truth
  media/lua/client/OutcastUpright/OUP_Flip.lua      the only writer of setAngles
  media/lua/client/OutcastUpright/OUP_FlipAction.lua
  media/lua/client/OutcastUpright/OUP_RadialMenu.lua  the only entry point
  media/lua/client/OutcastUpright/OUP_Net.lua
  media/lua/client/OutcastUpright/OUP_TrailerGuard.lua
  media/lua/server/OutcastUpright/OUP_Server.lua
  media/lua/shared/Translate/EN/*.json
```

### Logging

Off by default. Turn on **Write a diagnostic log** in
Options → Sandbox → Outcast Upright, reproduce the problem, then read
`~/Zomboid/Lua/Outcast.log` — the file every Outcast mod shares.

Two channels. `OUP.debug(...)` is gated and costs nothing when the option is off,
so calls stay in shipped code. `OUP.log(...)` is ungated and reserved for things
a player must see regardless: a sandbox file that failed to parse, a guard that
shut itself off. The boot line is deliberately ungated — a log containing only
the sink's header is indistinguishable from a mod that never loaded.

The most useful lines are the flip's `heading X -> Y` and the guard's
`correction N of 30`. The first tells you whether the heading maths picked the
right branch; the second tells you whether the trailer guard is winning.

Two invariants worth keeping:

- **`OUP.evaluate` is the only gating contract.** The context menu, the timed
  action's `isValid()`, and the server-side re-validation all call it. If they
  ever diverge, a client shows an option the server refuses and the action
  silently does nothing.
- **`OUP.applyUpright` is the only writer of `setAngles`.** The trailer guard's
  bare call is the one deliberate exception, and it is commented as such.

---

## Publishing

This mod declares `require=OutcastLib`. `ZomboidFileSystem` resolves that against
*installed* mods, so the thing that matters is that OutcastLib is **installed**
wherever this runs — on a server, that means present in `WorkshopItems=`. Link it
under **Required Items** on the Workshop page too: `require=` alone does not make
Steam subscribe anyone to it.

OutcastLib is a separate mod with a separate owner. Its publication state is not
this repo's to infer — an earlier version of `validate-data.ps1` read
`../OutcastLib/workshop.txt`, found no `id=`, and failed the build claiming the
dependency was unpublished when it was in fact already on the test server. A
sibling working copy is not the Workshop. That check is gone; the validator now
only reports what this mod's own `mod.info` declares.

`visibility=unlisted` is deliberate for testing. An unlisted item is still
downloadable by id, so a dedicated server can pull it with `WorkshopItems=`;
`private` would not be.

### Dedicated servers

A dedicated server never enters `IngameState`, so it never raises `OnGameStart`
(`IngameState.java:768`). Anything registered only there simply does not run —
which for this mod would have meant no log sink and no boot report on the one
host whose sandbox file an operator hand-edited. Everything that has to run at
startup is registered on **both** `OnGameStart` and `OnServerStarted`
(`GameServer.java:1522`), matching vanilla's own pairing at
`CustomTileProps.lua:341-342`.

The server authorises; it never rotates. `BaseVehicle.setWorldTransform` guards
its `Bullet.teleportVehicle` call behind `!GameServer.server`
(`BaseVehicle.java:4013`), so a dedicated server has no vehicle physics to move.
It re-runs `evaluate`, calls `authorizationChanged(player)` to hand physics
authority to the acting client, and broadcasts. If it refuses, it says so to that
player rather than letting the action finish silently.

---

## Compatibility

Purely additive. Wraps `ISAttachTrailerToVehicle` by saving and chaining the
originals, and never edits or ships a copy of any vanilla or third-party file.

KI5 mods (`damnlib`, `KI5trailers`, the wreckers) are **"On Lockdown"** — no
redistribution, repacking or modification. This mod therefore never patches a KI5
file and never declares `require=` for one. Wrecker detection is a user-editable
name list precisely so it can support them without depending on them.

---

Raxdeg / Dystopian Outcasts.
