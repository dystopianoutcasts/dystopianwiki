---
id: build-42-the-helicopter-event
slug: the-helicopter-event
title: 'The helicopter event: how it picks its day and its target'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - helicopter
  - events
  - zombies
  - sandbox
excerpt: >-
  On the default sandbox the helicopter comes once, on a random day after 6 to
  9 nights, starting between 9 AM and 6 PM in a window 1 to 4 hours long. It
  picks one player at random, flies in from 1,000 tiles away, hovers for
  at most a minute and makes a 500-tile noise about every ten seconds. Read from
  the 42.21 code.
last_updated: '2026-10-04'
---
# The helicopter event: how it picks its day and its target

Every Outcast remembers their first helicopter: the drone in the distance, then half the town on your doorstep. Here is how Build 42.21 decides when it comes, who it follows, and why it drags so many zombies with it.

## The short answer

- **Default setting: Once.** When the world is created the game picks a day **after 6 to 9 nights survived**, a start hour **from 9 AM to 6 PM**, and a window **1 to 4 hours** long.
- **During that window it launches almost at once**, usually within a few in-game minutes of the start hour.
- **It picks one player at random** (in single player, one who is alive). Where you are, what you are doing and how much noise you make do not matter. In multiplayer every connected player has the same chance.
- **It appears 1,000 tiles east and 1,000 tiles south of that player** and flies straight at them, following them as they move: about a real minute to arrive at normal speed.
- **Over you, it stays at most one real minute in total** at normal speed, then leaves. If you are indoors or in a forest for 15 seconds, it stops hovering and searches wider.
- **About every ten real seconds while it flies, it makes a noise that carries 500 tiles.** That noise, not the helicopter itself, is what brings the horde.
- **Sometimes** brings the next one 11 to 16 days after the last, **Often** 7 to 10 days after. **Never** turns it off.

## When it comes

When a new world starts, unless the setting is Never, the game rolls:

| Roll | Range |
|---|---|
| Day | after 6, 7, 8 or 9 nights survived |
| Start hour | 9, 10, ... 18 (9 AM to 6 PM) |
| Window length | 1, 2, 3 or 4 hours |

A "night survived" ticks over at 7 AM, so day 6 runs from 7 AM after your sixth night to 7 AM the next morning.

On that day, while the clock is past the start hour and before the end of the window, the game rolls on every update, with a chance scaled to how much time that update covered. At normal speed that works out to about a 6% chance each real second, so on average about 17 real seconds (four or five in-game minutes on the default 90-minute day) after the start hour.

| Setting | What happens after a helicopter day |
|---|---|
| Never | no helicopter at all |
| Once (default) | nothing: it never comes again |
| Sometimes | the next one is 11 to 16 days after the last, at a new random hour and window |
| Often | the next one is 7 to 10 days after the last, at a new random hour and window |

> **Proof:** Code. `zombie.GameTime#init` (`helicopterDay1 = Rand.Next(6, 10)`, `helicopterTime1Start = Rand.Next(9, 19)`, end = start + `Rand.Next(4) + 1`, skipped when Helicopter is 1); `zombie.GameTime#update` (launch when `nightsSurvived == helicopterDay1`, inside the window, not active, `Rand.Next((int)(800.0F * getInvMultiplier())) == 0`; once `nightsSurvived` passes the day, Sometimes sets it to `nightsSurvived + Rand.Next(10, 16)` and Often to `nightsSurvived + Rand.Next(6, 10)`; nights counted at 7.0); `zombie.SandboxOptions` (`Helicopter` default 2) and the option names in `media/lua/shared/Translate/EN/Sandbox.json` (Never, Once, Sometimes, Often). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### It can come back the same afternoon

After a launch the code tries to push the start of the window back by half an hour, but the start hour is stored as a whole number, so the half hour is lost and the window is unchanged. If the helicopter finishes its visit while the window is still open, the same check can launch it again.

A visit takes roughly three real minutes (about a minute to arrive, up to a minute over you, a minute or so to fly out of range), which is about 50 in-game minutes on the default day. A window of 1 to 4 in-game hours can therefore hold more than one visit, each with a fresh random target.

We read this in the code; we have not timed it in a game. If you see the helicopter come back on its day, this is the reason.

> **Proof:** Code. `zombie.GameTime#update` (`this.helicopterTime1Start = (int)(this.helicopterTime1Start + 0.5F)` on an `int` field, so the value does not change; the bytecode, read with `javap` from the installed jar whose sha256 matches the capture, is `i2f`, `fadd 0.5f`, `f2i`, `putfield`; the launch check only needs `!IsoWorld.instance.helicopter.isActive()`); `zombie.iso.Helicopter#deactivate` (sets `active = false` when it leaves). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Who it picks

- **Single player and split screen:** one of the living local players, at random.
- **Multiplayer:** one of the players connected to the server, at random, wherever they are on the map. It does not check whether that player is alive; if the pick is dead, the helicopter turns around and leaves.
- **If nobody is there** (an empty server), nothing launches, and the check keeps trying for the rest of the window.

> **Proof:** Code. `zombie.iso.Helicopter#pickRandomTarget` (local players with `isAlive()`, or `GameServer.getPlayers()`, then `Rand.Next(players.size())`; no players means `active = false`); `zombie.network.GameServer#getPlayers` (every connected player with an online id); `Helicopter#update` (a dead or missing target sends it to Leaving). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What it does

1. **Arriving.** It starts 1,000 tiles east and 1,000 tiles south of the target (about 1,414 tiles away) and flies at about 22 tiles per real second toward the target's current position, about a minute at normal speed.
2. **Hovering.** Within 2 tiles of you, it starts circling: it picks points up to 50 tiles from you and flies between them.
3. **Searching.** If you are not visible for 15 seconds, it searches instead, picking points up to 100 tiles from you. You are "not visible" when you are indoors (not on an outdoor square) or in a Forest or Deep Forest zone. If it sees you again, it goes back to hovering.
4. **Leaving.** After 60 seconds of hovering and searching in total, it leaves in a straight line, and it switches off once no player is within 1,000 tiles of it.

In single player the timers count real seconds times your game speed, so fast-forwarding shortens them.

**The noise.** While it is active, on each update there is a small chance (tuned to about once every ten real seconds) that it makes a world sound at its position with a radius of 500 tiles. Zombies that hear it head for where the helicopter was. Because it hovers around you, those sounds land on and around you.

> **Proof:** Code. `zombie.iso.Helicopter#setTarget` (start at target + 1000, + 1000), `#update` (Arriving speed 0.75 and Hovering 0.5 per thirty-frame step; hover when within 2 tiles; points within 50 and 100 tiles; 15 seconds unseen; 60 seconds total; leave when no player within 1,000 tiles; `Rand.Next(Rand.AdjustForFramerate(300)) == 0` then `WorldSoundManager.instance.addSound(null, x, y, 0, 500, 500)`), `#isTargetVisible` (exterior square, not Forest or DeepForest); `zombie.core.random.RandInterface#AdjustForFramerate`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## So how do you lose it?

From the code, you cannot: it follows its target wherever they go, and it leaves after a minute over them whatever they do. Being indoors or in a forest only changes its pattern, from points within 50 tiles of you to points within 100. The noise still carries 500 tiles, so the zombies still come your way. What you can choose is where you are on that day: the fewer zombies within 500 tiles, the smaller the crowd.

## Multiplayer

The server runs the whole event: it picks the day, rolls the launch, chooses the target and moves the helicopter, then tells every client where it is so they can hear it. There is one helicopter for the whole server, not one per player.

> **Proof:** Code. `zombie.GameTime#update` (helicopter code runs when `GameServer.server || !GameClient.client`); `zombie.iso.Helicopter#update` (clients only play the sound; the server sends `GameServer.sendHelicopter`); `zombie.iso.IsoWorld` (one `helicopter` field). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [How loot is rolled, and when it respawns](/pz/build-42/gameplay/the-real-numbers/how-loot-is-rolled-and-respawns), for what is left in town after the horde has passed.
- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance), for how long you can keep running from it.
