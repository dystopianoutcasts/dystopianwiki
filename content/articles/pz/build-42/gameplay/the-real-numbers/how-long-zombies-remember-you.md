---
id: build-42-how-long-zombies-remember-you
slug: how-long-zombies-remember-you
title: How long a zombie remembers you
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - zombies
  - stealth
  - memory
  - sandbox
excerpt: >-
  When a zombie spots you it locks on for 15 seconds and knows where you are
  through walls and darkness. With Normal memory it forgets you about 17
  seconds after it last really saw you or you last hit it. The timers, what
  breaks the lock, and what each Memory setting does, read from the Build
  42.21 code.
last_updated: '2026-10-04'
---
# How long a zombie remembers you

Outcast, you broke line of sight, ducked into a house and held your breath, and the zombie still came through the door. That is not bad luck. There is a timer, and it is longer than the moment it takes to turn a corner. Here is how it works in Build 42.21.

## The short answer

For the default settings (Memory: Normal, New Stealth System: on), counted in real seconds at normal game speed:

1. **The lock.** The moment a zombie spots you, it locks on for **15 seconds**. During the lock it knows exactly where you are, every frame, whatever is between you: walls, darkness, the direction it faces. It keeps walking towards where you really are.
2. **The memory.** It keeps you as its target until **about 17 seconds** after it last *really* saw you (the lock does not count as seeing) or after you last hit it. Between the end of the lock and the end of the memory it heads for the last place the lock tracked you to.
3. **Forgetting.** After that it drops you. It walks on to the point it was heading for and stops. From 5 seconds after it last saw you it is listening for noise again, and once it has gone about 42 seconds without seeing anyone and about 67 seconds without answering a noise, it rejoins the wandering groups.

Every fresh sighting, and every hit you land on it, starts both clocks again.

| Memory setting | Remembers you for | What actually happens |
|---|---|---|
| Long | 1,250 ticks, about 26 seconds | 15 s lock, then 11 s walking to your last tracked spot |
| Normal (default) | 800 ticks, about 17 seconds | 15 s lock, then about 2 s more |
| Short | 500 ticks, about 10 seconds | still the full 15 s lock, then it forgets at once |
| None | 25 ticks, about half a second | still the full 15 s lock, then it forgets at once |
| Random | each zombie rolls Long, Normal, Short or None | |
| Random between Normal and None | each zombie rolls Normal, Short or None | |

The game counts 48 ticks per real second at normal speed. Fast-forward runs the ticks faster, so the same memory passes in less real time.

The surprise is in the Short and None rows: **they do not shorten the 15-second lock.** The lock re-spots you every frame before the memory check runs, so even a zombie with no memory follows you for 15 seconds. We read this from the order of the code below; we have not timed it in a running game.

## The formula

```
on a real sighting:   lock = 720 ticks      (15 s)
                      seen = 0
every tick:           lock = lock - 1 tick  (stops at 0)
                      seen = seen + 1 tick
while lock > 0:       the zombie re-spots you, forced, and walks to where you are now
if seen > memory:     the zombie drops you as its target
memory: Long 1250, Normal 800, Short 500, None 25
when you hit it:      seen = 0
```

The forced re-spot skips the light, distance, facing, height and sneaking-skill parts of the sight check, but not all of it. It still fails, and the lock does nothing, when:

- **a car is between you** and you are not in a car yourself (from closer than 1.5 tiles it only halves the chance, which still succeeds);
- **you are sneaking directly behind full cover**, one of the 95 tiles the game treats as cover (dumpsters, bushes, hedges, some fences), on your own square or the next one towards the zombie;
- **the zombie stands in smoke** from a dying fire or a smoke bomb: it drops you on the spot and the lock ends;
- **you are farther away than the game's view distance**, which depends on daylight and fog: about 90 tiles on a clear day, 57 on a clear night, and as low as 33 in thick fog at night;
- **it already chases someone closer to it** than you are;
- you are dead, or in ghost mode.

Being hit refreshes its memory, and so does seeing you for real. The lock itself never refreshes either clock: when 15 seconds run out it needs a fresh sighting to lock on again.

### The 5-second deaf spell

A zombie does not react to noise until 240 ticks (5 seconds) after it last saw someone. A noise maker thrown the instant you are seen does nothing for the first 5 seconds. What a zombie does when a loud noise arrives while it is still locked on, we have not traced to the end; treat that part as unknown.

## What changes it

- **Memory** (Zombie Lore page): the table above. Each zombie gets its own memory value when the game creates it.
- **New Stealth System** (on by default): with it off, the game uses an older sight check whose lock lasts 120 ticks (2.5 seconds) instead of 720.
- **Sight** and the stealth tools on [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) decide whether you get spotted in the first place, which is the only thing that starts the clocks.

No trait or skill changes the memory or the lock. Traits only change how easily you are spotted again.

## Multiplayer

The same timers run inside the zombie's update, on whichever machine is moving that zombie. In multiplayer a successful sighting only takes effect if the network code allows that zombie to spot (`NetworkZombieManager.canSpotted`) or you are already its target. We have not compared the timings on a dedicated server.

> **Proof:** Unknown. The lock and memory timings in a live multiplayer game need a server test with the evidence in the server log. We have not run it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where this lives in the code

`zombie.characters.IsoZombie#update` runs the clocks in this order: count down the lock and count up the time since it saw you, re-spot you if the lock is running, run the zombie's state (walking, chasing), then drop the target if the memory has run out.

```java
this.bonusSpotTime = PZMath.clamp(this.bonusSpotTime - GameTime.instance.getMultiplier(), 0.0F, Float.MAX_VALUE);
this.timeSinceSeenFlesh = PZMath.clamp(this.timeSinceSeenFlesh + GameTime.instance.getMultiplier(), 0.0F, Float.MAX_VALUE);
// (lines in between left out)
if (this.bonusSpotTime > 0.0F && this.spottedLast != null && !((IsoGameCharacter)this.spottedLast).isDead()) {
   this.spotted(this.spottedLast, true);
}
// (the state machine runs here; lines left out)
if (this.timeSinceSeenFlesh > this.memory && this.target != null) {
   this.setTarget(null);
}
```

> **Proof:** Code. `zombie.characters.IsoZombie#update` (the lines above; `RespondToSound` only when `timeSinceSeenFlesh > 240`; `ZombieGroupManager.instance.update` when both `timeSinceSeenFlesh` and `timeSinceRespondToSound` pass 2000; the second counts thirty-frame ticks, 30 per second); `zombie.characters.IsoZombie#spottedNew` (a non-forced success sets `bonusSpotTime = 720` and `timeSinceSeenFlesh = 0`; `bForced` sets the chance to 1,000,000 after the light, facing and radius factors and before the cover, car and other factors; a smoke flag on the zombie's square clears the target and `spottedLast`; a closer existing target returns early). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Code. `zombie.characters.IsoZombie#DoZombieStats` (Long 1250, Normal 800, Short 500, None 25; Random picks one of the four, Random between Normal and None one of Normal, Short, None); `zombie.characters.IsoZombie#Hit` (`timeSinceSeenFlesh = 0`); `zombie.ai.states.WalkTowardState#execute` (paths to the character while `isTargetLocationKnown`, which is true while `bonusSpotTime > 0`, otherwise to `lastTargetSeenX/Y/Z`); `zombie.characters.IsoZombie#spottedOld` (lock of 120). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Code. `zombie.iso.weather.ClimateManager#updateViewDistance` (minimum `(19 - 8 x fog) x 3`, maximum `(minimum / 3 + 4 + 7 x daylight x (1 - fog)) x 3`, view distance between them by daylight); `zombie.GameTime#getMultiplier` (48 ticks per real second at normal speed); `zombie.iso.objects.IsoFire` sets the smoke flag in a fire's last stages and for smoke-only fires, which `zombie.iso.objects.IsoTrap` starts. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

A note for the curious: `IsoZombie` also has a method `getSandboxMemoryDuration` with the same four values (and 25 for an inactive zombie). Nothing in the 42.21 code calls it.

## Where to go next

- [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you): how you get spotted in the first place.
- [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works): what happens if the memory outlasts your running.
