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
  A zombie that spots you locks on for 15 seconds, then forgets you about 17 seconds after it last really saw you or you hit it (Normal memory). The timers and each Memory setting, from 42.22.
last_updated: '2026-11-15'
related_articles:
  - how-zombies-see-and-hear-you
  - the-helicopter-event
  - how-infection-works
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, you broke line of sight, ducked into a house and held your breath, and the zombie still came through the door. That is not bad luck. There is a timer, and it is longer than the moment it takes to turn a corner.

:::callout[The 1-minute version]{kind=key}
- The moment a zombie spots you, it locks on for 15 seconds. During the lock it knows where you are every frame, through walls and darkness.
- With the default Memory setting (Normal), it drops you about 17 seconds after it last really saw you, or after you last hit it. The lock does not count as seeing you.
- Short and None memory do not shorten the 15-second lock. We read this from the order of the code and have not timed it in a running game.
- A zombie does not react to noise until 5 seconds after it last saw someone. A fresh sighting restarts the lock and the memory clock; a hit you land restarts only the memory clock, not the lock.
- A car between you, hiding behind full cover while you sneak, and smoke each make the lock fail.
- All times are real seconds at normal game speed, in single player, on a multiplayer client and on a dedicated server alike. Fast-forward shortens them.
:::

:::facts
- **Lock** 720 units, 15 seconds
- **Memory, Normal (default)** 800 units, about 17 seconds
- **Memory, Long / Short / None** 1,250 (about 26 s) / 500 (about 10 s) / 25 (about 0.5 s)
- **Deaf spell** 240 units, 5 seconds after it last saw someone
- **Rejoins wandering groups** about 42 seconds (2,000 units) without seeing anyone and about 67 seconds (2,000 noise units) without answering a noise
- **Conversion** one unit is 1/48 of a real second at normal speed (the noise clock uses 30 per second)
:::

## 1. The lock and the memory

When a zombie spots you, it locks on for 15 seconds, and it keeps you as its target until about 17 seconds after it last really saw you.

A real sighting sets the lock to 720 units and the time since it last saw you to 0. :cite[(`zombie/characters/IsoZombie.java:2305-2307`, `zombie/characters/IsoZombie.java:2326-2327`)] Every update, the lock counts down and the time since it saw you counts up by the game's step for that update. :cite[(`zombie/characters/IsoZombie.java:3314-3315`)] That step adds up to 48 per real second at normal speed, on a client at any frame rate and on a dedicated server running 10 updates per second. :cite[(`zombie/GameTime.java:986`, `zombie/FPSTracking.java:46`, `zombie/network/GameServer.java:859`, `zombie/network/GameServer.java:1166`)] So 720 units is 15 seconds.

While the lock runs, the zombie re-spots you by force every update and walks to where you really are, whatever stands between you. :cite[(`zombie/characters/IsoZombie.java:3336-3338`, `zombie/ai/states/WalkTowardState.java:77-79`)] Between the end of the lock and the end of the memory it heads for the last place the lock tracked you to. :cite[(`zombie/ai/states/WalkTowardState.java:95-97`, `zombie/characters/IsoZombie.java:5177-5182`)]

After the memory runs out the zombie drops you as its target. :cite[(`zombie/characters/IsoZombie.java:3403-3405`)] It walks on to the point it was heading for and stops. From 5 seconds after it last saw you it listens for noise again. :cite[(`zombie/characters/IsoZombie.java:3441-3443`)] Once it has gone about 42 seconds (2,000 units at 48 per second) without seeing anyone and about 67 seconds (2,000 units at 30 per second) without answering a noise, it rejoins the wandering groups. :cite[(`zombie/characters/IsoZombie.java:3445`, `zombie/characters/IsoZombie.java:3450-3452`)]

| Memory setting | Remembers you for | What actually happens | Code |
|---|---|---|---|
| Long | 1,250 units, about 26 seconds | 15 s lock, then 11 s walking to your last tracked spot | `zombie/characters/IsoZombie.java:3871-3873` |
| Normal (default) | 800 units, about 17 seconds | 15 s lock, then about 2 s more | `zombie/characters/IsoZombie.java:3875-3877` |
| Short | 500 units, about 10 seconds | still the full 15 s lock, then it forgets at once | `zombie/characters/IsoZombie.java:3879-3881` |
| None | 25 units, about half a second | still the full 15 s lock, then it forgets at once | `zombie/characters/IsoZombie.java:3883-3885` |
| Random | each zombie rolls Long, Normal, Short or None | | `zombie/characters/IsoZombie.java:3865-3866` |
| Random between Normal and None | each zombie rolls Normal, Short or None | | `zombie/characters/IsoZombie.java:3867-3868` |

The surprise is in the Short and None rows: **they do not shorten the 15-second lock.** The lock re-spots you every update before the memory check runs, so even a zombie with no memory follows you for 15 seconds. :cite[(`zombie/characters/IsoZombie.java:3336-3338`, `zombie/characters/IsoZombie.java:3403-3405`)] We read this from the order of the code and have not timed it in a running game.

## 2. What breaks the lock

The forced re-spot skips the light, distance, facing, height and sneaking-skill parts of the sight check, but not all of it.

The forced check sets the chance to a huge number after the light, facing and radius steps, and the later steps still apply. :cite[(`zombie/characters/IsoZombie.java:2194-2196`)] It still fails, and the lock does nothing, when:

- **a car is between you** and you are not in a car yourself. From closer than 1.5 tiles it only halves the chance, which still succeeds. :cite[(`zombie/characters/IsoZombie.java:2242-2250`)]
- **you are sneaking directly behind full cover** on your own square or the next one toward the zombie. The game has a fixed list of 95 tiles for it: dumpsters, bushes, hedges and some fences. 92 of them give full cover, and 3 give 60% (x0.4). :cite[(`zombie/characters/IsoZombie.java:356-549`, `zombie/characters/IsoZombie.java:2224-2241`, `zombie/characters/IsoZombie.java:2034-2044`)]
- **the zombie stands in smoke** from a dying fire or a smoke bomb: it drops you on the spot and the lock ends. :cite[(`zombie/characters/IsoZombie.java:2072-2074`)]
- **you are farther away than the game's view distance**, which depends on daylight and fog: about 90 tiles on a clear day, 57 on a clear night, and as low as 33 in thick fog at night. :cite[(`zombie/characters/IsoZombie.java:2109-2110`, `zombie/iso/weather/ClimateManager.java:1518-1527`, `zombie/GameTime.java:853-855`)]
- **it already chases someone closer to it** than you are. :cite[(`zombie/characters/IsoZombie.java:2186-2192`)]
- you are dead, or in ghost mode. :cite[(`zombie/characters/IsoZombie.java:2077-2079`)]

Being hit restarts the memory clock, and so does seeing you for real. :cite[(`zombie/characters/IsoZombie.java:1372`, `zombie/characters/IsoZombie.java:2326-2327`)] A zombie that is eating a body, or attacking a vehicle, also keeps its clock at zero while it does. :cite[(`zombie/ai/states/ZombieEatBodyState.java:65`, `zombie/vehicles/AttackVehicleState.java:69`)] A zombie that thumps a barricade and then sees a player through it resets the clock too. :cite[(`zombie/ai/states/ThumpState.java:362-371`)] The lock itself never restarts either clock: when 15 seconds run out it needs a fresh sighting to lock on again. :cite[(`zombie/characters/IsoZombie.java:2305-2307`)]

The memory check is skipped while the zombie is staggering, reacting to a hit, falling, on the ground, getting up, burning, playing dead, or climbing through a window or over a fence, so a zombie in one of those states keeps you until it is back on its feet. :cite[(`zombie/characters/IsoZombie.java:3347-3358`, `zombie/characters/IsoZombie.java:3403-3405`)]

## 3. The 5-second deaf spell

A zombie does not react to noise until 240 units (5 seconds) after it last saw someone.

A noise maker thrown the instant you are seen does nothing for the first 5 seconds, and a hit you land restarts that count. :cite[(`zombie/characters/IsoZombie.java:3441-3443`, `zombie/characters/IsoZombie.java:1372`)] What a zombie does when a loud noise arrives while it is still locked on, we have not traced to the end; treat that part as unknown.

## 4. What changes it

Only the Memory setting and the New Stealth System option change the timers.

- **Memory** (Zombie Lore page): the table above. Each zombie gets its own memory value when the game creates it. :cite[(`zombie/characters/IsoZombie.java:3863-3885`, `media/lua/shared/Translate/EN/Sandbox.json:508-515`)] The default preset uses Normal. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:205`)]
- **New Stealth System** (on by default): with it off, the game uses an older sight check whose lock lasts 120 units (2.5 seconds) instead of 720. :cite[(`zombie/characters/IsoZombie.java:2858-2863`, `zombie/characters/IsoZombie.java:2759-2760`, `media/lua/shared/Sandbox/Apocalypse.lua:208`)]
- **Sight** and the stealth tools on [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) decide whether you get spotted in the first place, which is the only thing that starts the clocks.

We found no trait or skill that changes the memory or the lock: a grep of media/ for the lock and clock field names found nothing, and we did not search every Java class for other writers, so this is not verified beyond that. Traits only change how easily you are spotted again.

## 5. Multiplayer

The same clocks run inside the zombie's update, on whichever machine is moving that zombie.

A client does not run the sighting for a zombie that another machine owns. :cite[(`zombie/characters/IsoZombie.java:2047-2060`)] A new sighting of someone who is not already its target only takes effect when the network code allows that zombie to spot, which needs it to be idle, eating, sitting or turning toward a sound, and not within 4 tiles of its current target. :cite[(`zombie/characters/IsoZombie.java:2269`, `zombie/popman/NetworkZombieManager.java:50-62`)] The time since it saw someone travels with the zombie's network update. :cite[(`zombie/network/packets/character/ZombiePacket.java:70-74`)] We have not compared the timings on a dedicated server.

## Where this lives in the code

The zombie's update runs the clocks in this order: count down the lock and count up the time since it saw you, re-spot you if the lock is running, run the zombie's state (walking, chasing), then drop the target if the memory has run out. :cite[(`zombie/characters/IsoZombie.java:3314-3315`, `zombie/characters/IsoZombie.java:3336-3338`, `zombie/characters/IsoZombie.java:3344`, `zombie/characters/IsoZombie.java:3403-3405`)]

```java
this.bonusSpotTime = PZMath.clamp(this.bonusSpotTime - GameTime.instance.getMultiplier(), 0.0F, Float.MAX_VALUE);
this.timeSinceSeenFlesh = PZMath.clamp(this.timeSinceSeenFlesh + GameTime.instance.getMultiplier(), 0.0F, Float.MAX_VALUE);
// (lines in between left out)
if (this.bonusSpotTime > 0.0F && this.spottedLast != null && !((IsoGameCharacter)this.spottedLast).isDead()) {
   this.spotted(this.spottedLast, true);
}
super.update();   // the state machine runs here
if (this.timeSinceSeenFlesh > this.memory && this.target != null) {
   this.setTarget(null);
}
```

A note for the curious: `IsoZombie` also has a method `getSandboxMemoryDuration` with the same four values (and 25 for an inactive zombie). Nothing in the 42.22 Java or Lua calls it. :cite[(`zombie/characters/IsoZombie.java:5185-5198`)]

## Where to go next

- [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you): how you get spotted in the first place.
- [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works): what happens if the memory outlasts your running.
- [The helicopter event](/pz/build-42/gameplay/the-real-numbers/the-helicopter-event): a 500-tile noise that pulls zombies in without any of this.

:::callout[How we know]{kind=proof}
Every number and rule above is read from the 42.22 Java and Lua, with the real-time conversion worked out from the game's step size. We did not run a game to time a lock, so the claim that Short and None memory still follow you for the full lock, the checks that break the lock and the 42 and 67 second figures are read, not measured. We have not tested any of it on a dedicated server.

The unit is the zombie's update step, which adds up to 48 per real second at normal speed. The noise clock counts 30 per second. :cite[(`zombie/characters/IsoZombie.java:3445`, `zombie/GameTime.java:1032-1034`)] 

The test that settles it: in a test world with the Memory setting on Short, time how long a zombie that spotted you keeps walking at you after you break line of sight, and read the zombie's timers in the debug panel.
:::
