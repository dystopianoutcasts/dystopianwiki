---
id: build-42-outcast-punch
slug: outcast-punch
title: Outcast Punch
game: pz
version: build-42
section: outcast-mods
category: outcast-punch
difficulty: beginner
tags:
  - outcast-punch
  - combat
  - overview
excerpt: A Project Zomboid Build 42 mod that lets you punch zombies.
last_updated: '2026-09-29'
---
# Outcast Punch

> Source: OutcastPunch/README.md (compiled 2026-08-06, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A Project Zomboid **Build 42** mod that lets you punch zombies.

**Aim and press attack.** No new keys, no new inputs:

| you do | you get |
|--------|---------|
| **aim, then press attack** | **punch** |
| press the push key — spacebar — aiming or not | vanilla push, completely untouched |
| aim at a downed zombie | vanilla stomp, completely untouched |

**The push key always pushes.** Spacebar is bound to `Melee` and it keeps its
vanilla behaviour whether or not you are aiming; only the attack button turns an
aimed swing into a punch. The shove is not replaced, it is given a deliberate
alternative. Want distance, press space. Want to hurt something, aim and attack.

Punching levels the **Fists** skill, which sits under Combat - Melee beside Axe
and Long Blunt. At level 10 a punch kills a Normal zombie in three hits, and
starts putting them on the floor.

---

## Why it has to exist

Bare-handed attacks in vanilla cannot damage a standing zombie. Not "barely" —
literally zero. Three gates force it, and the third is why stomping a downed
zombie kills it but punching a standing one never will.

We do not work around that. We let vanilla run the entire shove and change
exactly two things: **the animation node** and **the damage**, through an event
the engine already fires mid-swing. Everything else — input, target selection,
arc, range, multi-hit, melee delay, swing sound, multiplayer sync — is vanilla.

Full chain with citations: [docs/ENGINE.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#damage-suppression).

---

## Documentation

| doc | what is in it |
|-----|---------------|
| [docs/DESIGN.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-design) | the interaction, balance numbers, the Fist skill, cadence tuning history, planned work |
| [docs/ENGINE.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine) | every engine fact this mod depends on, with `file:line` citations |
| docs/ARCHITECTURE.md (local reference: ARCHITECTURE.md) | module layout, logging, the boot contract, diagnostics, house rules, dev deploy |
| [docs/MULTIPLAYER.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-multiplayer) | what is proven in MP, why a dedicated server may differ, the test, and the fix |
| HANDOFF_ANIMATION.md (local reference: HANDOFF_ANIMATION.md) | how the clips were authored in Blender, the rig traps, verified vs assumed |

Rationale lives in those files, **not in source comments**. Code comments say
what is not obvious from the line and point at the doc section for the rest.

---

## Layout

```
Contents/mods/OutcastPunch/
  42/media/
    perks.txt                          the Fist skill
    scripts/OutcastPunch_Weapons.txt   the fist stat container
    AnimSets/player/shoveAim/          the two punch nodes
    lua/shared/OutcastPunch/           config, log, contract, fist, skill
    lua/client/OutcastPunch/           anim, damage, diagnostics
    lua/shared/Translate/EN/           perk display name
  common/media/anims_X/Bob/            the two clips
```

Animations sit under `common/` because they are build-agnostic art; everything
else is B42-only and stays under `42/`.

---

## Development

```powershell
scripts/install-junctions.ps1     # point the game at this working tree
scripts/validate-data.ps1         # translations and perks are in a format B42 reads
scripts/validate-anims.ps1        # clip names, XML, anim variables, the design itself
```

`validate-anims.ps1` encodes the design: it **fails** if `shoveAim` is not
overridden, and **fails** if `shove` or `stomp` is. All three failures are silent
in game.

In the in-game Lua console, `OutcastPunch.dump()` prints contract status, fist
stats, clip load state, the Fist level and what each curve is currently driving.

---

## Resuming

**Shelved 2026-08-02 in a shippable state.** Published to the Workshop as
`Raxdeg`, id `3775742087`, unlisted. Repo clean on `master`.

**Blocked on one thing: a dedicated-server test.** Hosted multiplayer works;
hosted cannot prove dedicated, because there the host *is* the server. Read
[docs/MULTIPLAYER.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-multiplayer) first — it has the risk, the
two-player test, and the fix if it fails.

The junctions are currently **removed**, so the game loads the subscribed
Workshop copy. To develop again:

```powershell
scripts\install-junctions.ps1
```

## Status

**P0 complete and verified in game.** Confirmed working:

- a plain attack still produces the vanilla push, untouched
- aiming and attacking produces a punch, alternating rear and lead hands
- damage lands and the engine performs the kill (`3.543 -> 2.240 -> 1.015 -> 0.000`)
- aiming at the floor leaves vanilla's stomp alone
- the push key pushes whether or not you are aiming

**Dedicated server verified 2026-08-03**, after three fixes that a hosted game
could not have caught — XP silently not awarding, the stomp being replaced by a
punch, and the push key being swallowed while aiming. See
[docs/MULTIPLAYER.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-multiplayer#status).

**Fist skill complete and verified in game**, 2026-08-01:

| | evidence |
|---|---|
| perk registers and displays | skills panel reads **Fists**, with per-level tooltips 1-10 |
| speed curve | 1.15/1.30 at level 0 through exactly 1.50/1.60 at 10 |
| damage at Fist 0 | 0.299-0.433, x1.00 |
| damage at Fist 10 | 0.498-0.822, x1.86, inside the predicted [0.465, 0.837] |
| XP | exactly `damage x 2.5`, 3.0 cap holding |
| no crowd control below the unlocks | zero pushback or knockdown in six hits at Fist 0 |
| both effects at Fist 10 | knockdown and pushback fired |
| blocked hand skips to the working one | unbroken runs of one hand, both directions |
| both hands blocked | falls back to the vanilla shove |
| hand damage penalty | scratched hand logged `x0.97`, healthy hand `x1.00` |

### Known gaps

- **Damage is applied directly, bypassing vanilla's multiplier chain. This is
  deliberate.** Investigated and closed 2026-07-31 — read
  [docs/ENGINE.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#damage-chain) before re-opening it.
- **A punch still displaces the target slightly, and that is correct.** Every
  melee hit does. The shove path divides hit force by 2.7 and skips the x2 player
  multiplier, so a punch displaces roughly an order of magnitude less than a bat.
  Not tunable by us and deliberately left alone —
  [docs/ENGINE.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#displacement).
- **Hosted multiplayer works** — verified 2026-08-02, damage, XP and kills all
  landed. **A dedicated server is still unproven**, and a hosted game cannot
  prove it, because there the host *is* the server. See
  [docs/MULTIPLAYER.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-multiplayer) for the risk, the two-player test
  that settles it, and the fix if it fails.
- **A blocked hand costs about 5% of your punch rate and nothing else**, since
  the surviving hand is usually healthy. That follows from choosing "skip" over
  "fail" and may be fine — flagged in
  [docs/DESIGN.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-design#injured-hands-rules) rather than silently
  changed.

Not yet done: skill books, traits, endurance and strain costs, sounds, sandbox
options. See [docs/DESIGN.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-design#planned).

Multi-hit is **not available** — the engine clamps a bare-handed shove to one
target in two separate places. An earlier note here claiming otherwise was wrong.
