---
id: build-42-the-dismount-trigger-confirmed-clip-pending
slug: the-dismount-trigger-confirmed-clip-pending
title: 'The dismount: trigger confirmed, clip pending'
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: advanced
tags:
  - outcast-ladders
  - animation
  - clips
excerpt: >-
  Confirmed in play 2026-08-03: climbing works, and the dismount at the top
  plays vanilla's fence vault. That is not a bug to fix — it is the hook we
  want, already firing.
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-clip
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# The dismount: trigger confirmed, clip pending

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

<a id="topout"></a>

**Confirmed in play 2026-08-03: climbing works, and the dismount at the top plays
vanilla's fence vault.** That is not a bug to fix — it is the hook we want,
already firing.

### Why it fires by itself

Our top-of-column object carries `HoppableN`/`HoppableW`
([ENGINE.md](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-engine#top-object)). That is exactly what
`getWallHoppableTo` -> `getWallHoppable` looks for, so `calculateClimbOutcome`
returns `Fence`, and `finishClimbing` runs:

```java
case Fence:
   isoGameCharacter.climbOverFence(isoGameCharacter.getForwardIsoDirection());
```

which enters `ClimbOverFenceState` and reports `EventClimbFence`
(`IsoGameCharacter.climbOverFence`). **No trigger code is needed from us.** It
also explains why the top-out was authored against `Bob_ClimbFence_*` as
reference.

### What vanilla does in the `climbfence` state

A two-node sequence driven by state variables, both at `m_Priority 4`:

| node | conditions | clip | events |
|------|-----------|------|--------|
| `climbFenceStart` | `ClimbFenceStarted == false` | `Bob_VaultOver_Start` | at End: `ClimbFenceStarted=true` |
| `climbFenceEnd` | `ClimbFenceStarted == true`, `ClimbFenceOutcome == "success"`, `ClimbFenceFinished == false` | `Bob_VaultOver_End` | at 0.7: `ClimbFenceFinished=true` |

### The plan for our single clip

`Bob_NF_LadderTopOut` is **one continuous 65-frame motion**, not a start/end
pair, so it cannot be split across both nodes without re-authoring.

That has one consequence that took three builds to see: **our node must not be
conditioned on either fence flag.** Vanilla can condition on `ClimbFenceStarted`
because the flag flipping is precisely its handover from one clip to the next.
We have nothing to hand over to, so the same condition just deselects us
mid-motion and lets `Bob_VaultOver_End` finish the job.

So the node carries `OCLClimbSurface == "ladder"` and
`ClimbFenceOutcome == "success"`, with `m_ConditionPriority 1`. Two conditions
and a higher condition priority put it ahead of every vanilla node in
`AnimState.nodes` (`AnimNode.compareSelectionConditions`, `AnimNode.java:365`),
and the selection loop breaks as soon as a lower-ranked node appears
(`AnimState.java:52`) — so vanilla's nodes are never even tested while ours
passes. It keeps playing straight through the `ClimbFenceStarted` flip.

Both flags are driven from Lua instead, at different times.
See [the two flags](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation).

### The top flag goes on the square ABOVE the ladder, not the top rung

<a id="topout-placement"></a>

**This was tried the other way round and it broke climbing entirely.** Recorded
so it is not retried.

A ladder is usually **one z-level tall** — a wall object spanning the height of
its own square, delivering you to the next level up. So the topmost *ladder*
square is the square the player is **already standing on** when they start
climbing.

`calculateClimb` scans from the character's own height:

```java
for (int z = PZMath.fastfloor(isoGameCharacter.getZ()); z <= maxLevel; z++) {
   if (IsoWindow.isTopOfSheetRopeHere(sq)) { climbData.targetClimbHeight = z; break; }
}
```

and `execute` ends the climb the instant that height is passed:

```java
if (currentClimbHeight > climbData.targetClimbHeight) this.finishClimbing(...);
```

Put the flag on the top rung and the scan matches on frame one at the
character's current height, so the climb finishes before it starts — the
animation plays and the character never rises.

**The destination is the level the ladder delivers you to, not the level the
ladder occupies.**

### What that means for the apparent overshoot

Climbing to the square above the ladder is **correct**, and the "climbs past the
top" appearance is the ladder sprite ending at the top of its own square while
the character legitimately arrives at the next level. That is where the roof is,
and where the vault has to start from.

So the overshoot was never the bug. The remaining problem is the dismount, and
`OutcastLadders.column()` tests both gates that decide it.

### What the trace proved

<a id="topout-trace"></a>

A per-tick trace of one climb settled it. The decisive line, at the top:

```
z=2.000 xy=10619.40,9823.70 dir=W - surf=ladder sq.z=2 | fence: started=false finished=false outcome=success
```

| reading | rules out |
|---------|-----------|
| `outcome=success` | **not** `Blocked`, and the guards did **not** refuse. Only `ClimbOverFenceState.setParams` (`:106`) writes that value, so the state was entered. |
| `dir=W` | not a diagonal, so the slide's N/S/W/E switch would have handled it |
| `started=false` for every tick | the AnimSet `SetVariable` event **never fired** |
| `xy` frozen | the direct consequence: no slide |

The character then sat at `z=2.000` indefinitely, the state eventually exited,
`outcome` cleared, and `z` began *decreasing* — the "goes back down" is a
consequence of the top-out never progressing, not a separate fault.

**So `ClimbFenceStarted` is now set from Lua**, in `OCL_Anim.driveTopOut`, after
`TOPOUT_SLIDE_DELAY_TICKS`. The delay stands in for the `m_TimePc` an event would
have provided, letting the early pull-up play before the character drifts
forward.

`ClimbFenceFinished` was set at the same moment. **That was the real bug**, and
it is the subject of the next section.

### The engine runs two clocks and does not synchronise them

<a id="two-clocks"></a>

**This is the general shape of every remaining animation fault, so it is worth
stating once.**

A climb transition has two independent timelines:

| | owner | duration |
|---|---|---|
| **where the character is** | `ClimbOverFenceState.execute` — a linear slide of `0.05 x thirtyFPSMultiplier` per tick toward a fixed target, which self-clamps and stops | however many ticks the distance happens to take |
| **what the character looks like** | the selected `AnimNode` clip | clip length / `m_SpeedScale` |

**Root motion is not applied.** The clip's translation channel does not move the
character; the state does. So the two only agree if someone makes them agree.

The only coupling is two booleans — `ClimbFenceStarted` begins the slide,
`ClimbFenceFinished` ends the state. Vanilla sets both from `m_TimePc` events
authored against each specific clip, which is hand-tuning, per clip, per
outcome. A mod's clip inherits the timings of whatever vanilla clip it displaced,
and those timings are wrong for it.

Measured on the descent hop, before the fix:

| tick | event |
|------|-------|
| 17 | `ClimbOverFenceState` entered, `outcome=rope`, x = 10618.93 |
| 27 | `Bob_VaultOver_Start` reaches its End event, `ClimbFenceStarted=true` |
| 27-30 | slide runs: x 10618.93 -> 10619.01. **Three ticks, 0.08 units.** |
| 31-101 | **nothing.** Position final, `Bob_ClimbWindowGrab` still playing at `m_SpeedScale 0.80` |
| 102 | that clip reaches its End event, `ClimbFenceFinished=true` |
| 103 | `climbdownrope` finally begins, z starts falling |

**72 ticks — 2.4 seconds — of a character standing on a tile with nothing
underneath it.** That is the "floats above the wall, then drops". It is not a
physics or a flag bug: the motion simply finished 72 ticks before the animation
was allowed to.

And the drop looks abrupt for the same reason in reverse: `z` cannot begin
changing until `ClimbFenceFinished` releases the state, so the entire height
change is stacked behind the tail of a clip authored for grabbing a sheet rope
through a window frame.

**The rule this gives us:** never let a vanilla clip's event own the end of one
of our transitions. `OCL_Anim.driveTopOut` owns both flags in both directions and
sizes them against `Bob_NF_LadderTopOut`, so the state lasts as long as the
motion and no longer.

### The height belongs to the engine. Do not steer it.

<a id="height-belongs-to-the-engine"></a>

**This was tried, it looked correct on paper, and it broke the vault outright.
Recorded so it is not retried.**

The idea was to end the climb early and lift the character through the pull-up
ourselves, so the animation would narrate the arrival rather than follow it.
Three engine facts appeared to permit it:

1. `ClimbSheetRopeState.execute` (`:79`) integrates height from `getZ()` every
   tick rather than following a schedule, and finishes the moment that passes
   `targetClimbHeight` (`:81`). So writing `z` steers the climb, and writing the
   target height ends it when we choose.
2. `IsoMovingObject.setZ` (`:498`) is a clamp and a field write. It does not
   touch `current`.
3. `ClimbOverFenceState` never writes `z` — `execute` only clamps and slides `x`
   and `y` (`:186`, `:215`).

All three are true. It still does not work, because of a fourth:

```java
// ClimbOverFenceState.isIgnoreCollide, :386
int z = owner.get(Z);
if (z == fromZ && z == toZ) {
   ...  // the vault's collision exemption, a box from START to END
} else {
   return false;
}
```

`Z` is captured at `setParams` from the square the character was standing on.
**`setZ` does not move the character between squares, but the engine's own grid
bookkeeping does** — drop the height below the top square and the character's
square follows it down a level. `fromZ` is then 1 where `Z` is 2, the exemption
lapses, the wall is solid again, and the forward slide is undone every frame it
runs.

The trace of that build is unmistakable:

```
104  z=2.000  sq=10619,9823,2   [ANIM] top-out begins (lifting 0.35)
105  z=1.913  sq=10619,9823,1        <- square follows the height down
...
193  z=1.653  sq=10619,9823,1  xy=10619.40,9823.70  started=true
703  z=2.000  sq=10619,9823,1  xy=10619.40,9823.70  started=true
     [ANIM] top-out stalled: 600 frames, clip 95%, at 10619.40,9823.70
```

`xy` never moves. The clip runs all the way to 95% against a character the wall
will not let go. Then the backstop fires and they climb back down. It also
explains "we never saw the level above": the camera follows the player's square,
which was a level below where they appeared to be.

#### And it was never needed

| clip | `Bip01` translation z |
|------|----------------------|
| `Bob_NF_LadderClimb` (loop) | **0.42** flat, 0.372–0.428 of bob |
| `Bob_NF_LadderTopOut` | **0.42 → 1.35** |

The two butt together exactly. The top-out **begins in the climb's own pose** and
lifts the body a full level to standing height. The clip is authored to be played
at the *destination* height, drawing the character hanging below the ledge and
pulling up onto it.

So the engine snapping `z` to the top of the column is not a bug to be smoothed
over. **It is the thing that puts the character where the clip expects them.**
All the top-out needs from us is to run to its end, which is what
[the clip clock](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation) is for.

#### The clip is the clock, because a tick is not a unit of animation

<a id="clip-clock"></a>

Every top-out timing above started life as a tick count, and every one of them
was wrong for a reason no amount of tuning would have found:

**`Events.OnTick` fires once per rendered frame. A clip plays in real seconds.**

So a tick count is a frame count, and the same number means a different amount
of animation on every machine. At 60fps the 55 ticks meant to be 85% of a
65-frame clip were **42%** of it. The probe said so directly — `clip=05` on the
line where the state ended, when it should have read `90`:

```
158  z=2.000 xy=10619.00,9823.70  sq=10618,9823,2  started=true  clip=05
     [ANIM] top-out landed after 55 ticks (clip 05%); ending the state
```

The three-point diagnostic became the mechanism. The node now carries nineteen
`SetVariable` events at 5% intervals writing the clip's own progress into
`OCLTopOutClip` (and `OCLMountClip` for the descent), and `driveTopOut` reads
that as its clock: travel across `TOPOUT_MOVE_FROM_PC`..`_TO_PC`, finish at
`TOPOUT_FINISH_PC`. Percentages do not care what the frame rate is.

Only `TOPOUT_MAX_FRAMES` is counted in frames, because its whole job is to catch
the case where the clock never ticks. It also distinguishes the two ways that
happens, which is worth having in one line: `clip 0%` means the clip never
played, while a high `clip%` with the position frozen means the slide is being
blocked — which is exactly how the height experiment was caught.

### What one unit of `Bip01` is, measured against vanilla

<a id="bip01-baseline"></a>

Every claim about "floating" needs a baseline, and vanilla's own clips are it.
`Bip01` is the root bone; its translation z is the character's root height in
model units, and the engine draws the mesh at `world z + Bip01`.

| clip | `Bip01` z start → end | what it is |
|------|----------------------|-----------|
| `Bob_Idle` | 0.505 → 0.505 | **standing = 0.505** |
| `Bob_Walk` | 0.490 → 0.490 | standing |
| `Bob_ClimbRope` | 0.531 → 0.531 | vanilla's rope climb pose |
| `Bob_ClimbFence_Start` | 0.505 → 1.101 | stand, then hang at the top of a tall fence (+0.596) |
| `Bob_ClimbFence_Loop` | 1.103 | hanging there |
| `Bob_ClimbFence_Success` | 1.101 → **0.505** | haul over the top and **stand** (−0.596) |
| `Bob_ClimbWindowGrab` | 0.751 → −0.143 | over a sill and down onto a rope (−0.894) |
| **`Bob_NF_LadderClimb`** | **0.420 → 0.420** | our climb pose |
| **`Bob_NF_LadderTopOut`** | **0.420 → 1.350** | our pull-up |

**Every vanilla clip that ends in a standing pose ends at about 0.505.** Ours
ends at **1.350** — 0.845 above standing, roughly 1.7 m of root height with
nothing under it.

Vanilla's closest analogue is `Bob_ClimbFence_Success`: haul yourself over the
top of a fence and stand on the far side. It runs **1.101 → 0.505**. It *starts*
high, hanging, and *ends* at standing. **Ours runs the other way.**

That is the float, and it is in the asset, not in the timing. The only thing
hiding it was that the state ends at clip 95% and blends to `Idle` over 0.10s.

#### The fix, and who owns the level

<a id="root-rebase"></a>

The ladder is one z-level tall, and both the engine's climb ramp and the clip
were travelling a level. **Decided: the climb owns it, and the top-out is a
dismount** — the step from the top rung onto the deck, not a haul up a storey.
That suits a ladder whose top rung is already at deck height, and it needs no
change to where the climb hands over.

So the clip is **detrended** to land on the idle pose:

```
y   +0.035 -> +0.410      detrended by +0.422   now +0.035 -> -0.012
z   +0.420 -> +1.350      detrended by +0.845   now +0.420 -> +0.505
```

Detrended, not rescaled. `scripts/rebase-root-motion.py` subtracts a linear ramp
so the channel *ends* on the target while keeping the first key and all the
relative motion:

```
v'(t) = v(t) - t * (v_last - target)
```

An endpoint rescale would flatten the motion by the same factor it flattens the
drift, and on `y` — which dips to −0.023 before it rises — the required scale is
*negative*, so the whole curve would mirror. Detrending removes only the net
drift.

The clip now starts exactly where `Bob_NF_LadderClimb` sits (0.035, 0.420) and
ends exactly on idle (−0.012, 0.505). Continuous at both ends, which is the
whole of vanilla's convention.

`y` was rebased for the same reason as `z`: it drifted 0.42 forward, and the
world slide already carries the character a full tile. Vanilla's `VaultOver`
pair nets `y` back to idle for exactly this reason.

**The guard:** `validate-anims.ps1` now checks where every shipped clip's root
lands — transitions against the idle pose, loops against their own first key —
and prints the `rebase-root-motion.py` command that fixes it. The script is
idempotent (it is specified by absolute endpoints), so it is safe to re-run on
every build. There is deliberately no backup file next to the asset: two `.X`
files in `anims_X` declaring the same clip name would collide at load. The
`.blend` in `PZ_3D_Assets` remains the source of truth.

Calibration, for sizing any fix: `ClimbFence_Loop` hangs at the top of a tall
fence at 1.103 against standing 0.505, so **0.6 model units is about the height
of a tall fence**, and a z-level is somewhere near 1.0–1.3. Our clip's 0.93 of
rise is therefore most of a level — which the engine's climb has *already*
travelled by the time the pull-up starts.

### The engine cannot take vertical motion from an animation

<a id="deferred-is-2d"></a>

Worth settling, because it is the obvious thing to reach for. PZ does have
authored root motion — `m_DeferredBoneName`, `m_deferredBoneAxis`,
`m_useDeferredMovement` — and it is what `Translation_Data` exists for.

**It is two-dimensional.**

```java
// IsoGameCharacter.java:1323
public Vector2 getDeferredMovement(Vector2 result) { ... }

// :1648, the only place it is applied
this.moveUnmodded(dMovement.x, dMovement.y);
```

`Vector2`. Only the ragdoll path (`doDeferredMovementFromRagdoll`, `:1657`) ever
adds a `z`. So deferred motion can drive the **forward** travel of a transition
from the clip, and can never drive the **vertical** one.

Which leaves exactly two possible owners of the vertical:

1. the engine's climb ramp, before the top-out begins, or
2. the clip's own `Bip01`, during it.

Today **both** of them travel a level. That is the whole of the problem, and
[the double lift](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation) is the same statement from the other end.

#### The clip already does the lifting

<a id="double-lift"></a>

Measured in `Bob_NF_LadderTopOut.X`, across its 65 keys:

| bone | channel | first | last | range |
|------|---------|-------|------|-------|
| `Bip01` | translation z | +0.42 | +1.35 | **0.93** |
| `Bip01` | translation y | +0.035 | +0.41 | 0.43 |
| `Translation_Data` | translation | 0 | 0 | **0** |

`Bip01` is the root. **The animation carries the entire body up by itself**, and
`Translation_Data` — which is where vanilla puts deferred root motion — is flat.

So the smoothstep that lifted the character's world height *during* the pull-up
was a second lift stacked on the first. That is the "floating up into the level
above": the clip raises the body 0.93 and we raised the world height another
0.35 underneath it at the same time.

The answer turned out to be simpler than holding the height and releasing it
late — it was to stop touching the height at all. See
[the height belongs to the engine](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation).

Worth contrasting with how vanilla authors the same motion:

```
Bob_ClimbFence_Start     Bip01 z +0.596    Translation_Data z -0.295
Bob_ClimbFence_Success   Bip01 z -0.596    Translation_Data z -0.787
```

Vanilla's pair **cancels** on `Bip01` — the body arc returns to where it started
— and puts the actual displacement on `Translation_Data`. Ours does the opposite.
That is not wrong, but it is why our clip cannot be timed like vanilla's.

#### Still not fixed

The forward slide is linear while the clip is not, and the **descent** does none
of this: `ClimbDownSheetRopeState` has its own landing and has not been looked
at the same way.

### The two flags do different jobs, and one of them is a trapdoor

<a id="topout-flags"></a>

This is the finding that cost three builds. Both flags were being treated as
animation bookkeeping. Only one of them is.

#### `ClimbFenceStarted` — the slide switch

`ClimbOverFenceState` (`:192`) only calls `slideX`/`slideY` while it is true, and
the slide is incremental:

```java
float dx = 0.05F * GameTime.getInstance().getThirtyFPSMultiplier();
```

0.05 units per 30fps tick, so crossing one tile needs roughly **20 ticks of the
flag being true**.

#### `ClimbFenceFinished` — the exit, and it does not exit where you expect

The earlier claim recorded here — *"nothing in the engine reads it"* — was true
of the Java and false of the thing that matters. Nothing in `zombie/` reads it;
the **action-state transition XML** does, and that XML is the state machine.

Every single transition out of `climbfence` is gated on it
(`media/actiongroups/player/climbFence/`):

| file | goes to | extra condition |
|------|---------|-----------------|
| `to_climbdownrope.xml` | `climbdownrope` | `CanClimbDownRope` |
| `to_falling.xml` | `falling` | `bFalling` |
| `to_getup.xml` | `getup` | `fallOnFront` |
| `to_movement.xml` | `movement` | `isMoving` |
| `to_idle.xml` | `idle` | **not** `CanClimbDownRope`, not moving |

`CanClimbDownRope` is `canClimbDownSheetRopeInCurrentSquare`
(`IsoGameCharacter.java:893`). **At the top of a ladder it is true by
definition** — that is the whole point of the square we put the character on.
And `to_idle` explicitly requires it to be false.

So setting `ClimbFenceFinished` while the character is still over the ladder
does not merely cut the animation short. It routes the exit into
`climbdownrope`. Setting it in the same tick as `ClimbFenceStarted` produced
exactly one frame of slide and then a descent:

```
170  z=2.000 xy=10619.40,9823.70  - climbing   outcome=success
     [ANIM] top-out: enabling the slide after 13 ticks
171  z=2.000 xy=10619.38,9823.70  climbing     outcome=-
172  z=1.994 xy=10619.39,9823.70  climbing     outcome=-
```

`10619.40 -> 10619.38` is `0.05 x thirtyFPSMultiplier` for **one tick**. `outcome`
clearing on the next line is `exit()` (`:244`) running. Then `z` falls.

#### The rule

**`ClimbFenceStarted` starts the top-out. `ClimbFenceFinished` is the last thing
you ever set, and only once the character is off the ladder tile.**

`driveTopOut` therefore keys the two on different signals:

| flag | when | why that signal |
|------|------|-----------------|
| `ClimbFenceStarted` | **never**, while the clip clock is alive — see [owning the travel](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation) | it is the switch for the engine's own slide, and two writers would race |
| `ClimbFenceFinished` | once the tile index has changed, the position stopped moving, **and** the clip has reached `TOPOUT_FINISH_PC` | the eased travel ends before the clip does, so "unchanged since last frame" still reports completion |

By then `CanClimbDownRope` is false and the state exits to `idle` or `movement`
like any other vault. `TOPOUT_MAX_FRAMES` is a backstop so a slide that never
completes cannot wedge the character in `climbfence` forever.

#### The other bug the same trigger was hiding

The descent from the top played the **rope** clip, because `onLadder` tested only
the character's own square. At the top of a climb the engine puts them on the
square **above** the last rung, so `OCLClimbSurface` cleared exactly when the
top-out and the descent needed it. It now also checks the square below — and
`driveTopOut` additionally holds the variable on for the duration of the
top-out, because the character crosses off the ladder tile part way through the
slide and the clip must not change under them at that moment.

### Blocked on the clip

There is no `.X` export of the top-out. The only file is
`Bob_NF_LadderTopOut.glb`: the **rejected 99-frame version**, in the format that
was retired, exported at 16:02 against a blend last saved at 20:29. It must not
be shipped.

Deploy the `.X` using the recipe under "How the current file was produced", and
remember its net displacement belongs on `Translation_Data`, converted not
copied — see [root motion](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation).

### Owning the travel, and the facing with it

<a id="owning-the-travel"></a>

Two faults with one cause: **the engine moves the character on its own schedule,
and that schedule has nothing to do with the clip.**

#### The travel

`ClimbOverFenceState` slides at a flat `0.05 * thirtyFPSMultiplier` per frame
until it clamps (`:407`). Measured against a 123-frame pull-up:

| | travel | of the clip |
|---|---|---|
| going up | 16 frames, 10619.40 -> 10619.00 | 13% |
| going down | 3 frames, 0.08 units | 2% |

So the character arrived and then **stood at the tile edge for over a second**
while the animation caught up. That is the "not quite right" — the movement was
never wrong, it was just over long before the motion was.

It also compounds: the engine aims at `START_X - 0.1`, the near *edge* of the
destination tile, which is why the top-out left the character straddling the
boundary and the return hop then had only 0.08 units left to travel.

`driveTopOut` now carries the character itself, eased across
`MOVE_FROM_PC..MOVE_TO_PC`, and aims at somewhere worth standing:

| | target |
|---|---|
| top-out | the **middle** of the roof tile |
| mount | `CLIMB_IDEAL` for the ladder's facing — exactly where `ClimbSheetRopeState` nudges a climber (`:233`), so `climbdownrope` picks up with nothing to correct |

`ClimbFenceStarted` is deliberately left **false** while we drive. It is the
switch for the engine's slide, and two writers would race. Leaving it false has
a second benefit: vanilla's `rope` and `climbFenceEnd` nodes both require it
true, so neither can ever steal the transition. The one exception is
[a dead clip clock](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation), where there is no schedule to move against —
then it goes true and the engine's slide takes over, which is the right
fallback.

#### The facing

`execute` points the character along the hop every frame (`:172-180`). So a
descent faces **east** across the parapet while the ladder it is getting onto is
climbed facing **west**, and `climbdownrope` flips them 180 degrees at the state
boundary. In between, the reversed clip plays mirrored — legs swinging out over
the roof instead of down onto the rungs.

Overriding it is safe, because the slide reads `owner.get(DIR)`, the state
param, not `getDir()`. Only the render direction changes. The engine does the
same thing itself for grapple throws: `setDir(dir.Rot180())`
(`IsoGameCharacter.java:8530`).

So a descent now faces the ladder from the first frame — the character turns
around at the parapet, which is what a person does, and the handover to
`climbdownrope` needs no flip at all.
