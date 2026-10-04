---
id: build-42-how-zombies-see-and-hear-you
slug: how-zombies-see-and-hear-you
title: How far zombies see and hear you
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - zombies
  - stealth
  - sneaking
  - noise
  - sandbox
excerpt: >-
  A zombie can only spot you inside its vision radius (20 tiles in clear
  daylight, never less than 10) and only while you are in its field of view;
  inside that, it rolls a chance every frame that light, facing, sneaking,
  traits and cover change. It hears any noise whose radius reaches it. The
  formulas, the default numbers and the noise table, read from the Build 42.21
  code.
last_updated: '2026-10-04'
---
# How far zombies see and hear you

Every Outcast has argued about how far a zombie can hear a gunshot, and whether crouching in the dark really works. We read the code. Here are the numbers, and where they come from.

Everything on this page is read from the Build 42.21 code. Where we have not watched something happen in a running game, we say so.

## The short answer

These are the numbers for the default settings: the Apocalypse preset, which is the one the game's own sandbox file loads. In that preset every zombie rolls its own sight and its own hearing, each a coin flip between **Normal** and **Poor** ("Random between Normal and Poor").

**Seeing**

- A zombie can only spot you inside its **vision radius**. With Normal sight that is **20 tiles** in clear daylight, shrinking with darkness, rain and fog, but never below **10 tiles**. A Poor-sighted zombie always has **10 tiles**. Beyond the radius it cannot spot you at all.
- It also needs a **line of sight**: it can only spot you from a square you could see yourself. Walls block both ways.
- Inside the radius it does not see you automatically. It rolls a chance, over and over. **Where it is looking matters most.** A zombie looking straight at you in daylight spots you on the spot. One that has you more than about 114 degrees away from where it faces cannot see you at all.
- Darkness, sneaking, the Inconspicuous trait, low cover and a car between you all cut the chance. Distance inside the radius does not, except that very close (about 4.5 tiles) you are three times easier to spot unless you are sneaking or aiming.

**Hearing**

- Every noise has a radius. A zombie hears it if it stands within **radius x hearing**: Normal x1, Poor x0.45, Pinpoint x3, a little less in rain and fog. Each floor of height counts as 3 tiles.
- It walks to where it heard the noise, give or take: the farther away it was, the bigger the miss.

| Noise you make (default settings) | Radius in tiles | Indoors |
|---|---|---|
| Walking | 7 | 3 |
| Running | 11 | 5 |
| Sprinting | 14 | 7 |
| Sneaking (walk or run) | 4 | 2 |
| Each melee hit that lands | 8, sometimes 10 or 16 | same |
| Shouting (sneaking: whisper) | 30 (6) | same |
| Shouting into a megaphone (sneaking) | 90 (18) | same |
| Coughing | 35 | same |
| Toy cap guns | 30 | 15 |
| SN38 Revolver | 60 | 30 |
| M1911 Pistol, Trapper Carbine | 70 | 35 |
| M9 Pistol, Patrol Revolver | 100 | 50 |
| B-F Pistol, Magnum, L92 Carbine | 120 | 60 |
| M16 Assault Rifle, MSR700 Rifle, JS-14 Rifle | 150 | 75 |
| L94 Rifle | 160 | 80 |
| MSR788 Rifle, M1A Rifle, MSR7T Tactical Rifle | 170 | 85 |
| Every shotgun (JS-2000, JS-3T, double barrel, sawed-off) | 200 | 100 |

The footstep numbers are for a character with shoes, no movement traits and level 0 in Sneaking, Lightfooted and Nimble. On average only one footstep in two makes a noise at all (fewer when sneaking); the next sections have the details. Vanilla Build 42 has no suppressors.

## Seeing: the formula

### Step 1: the vision radius

```
radius = 20 - the larger of (darkness, rain + fog)
         darkness = (1 - light) x 5      up to 5 tiles
         rain     = rain intensity x 2.5 up to 2.5 tiles
         fog      = fog intensity x 7    up to 7 tiles
Eagle sight:  radius x 1.75
Poor sight:   radius x 0.35
then the result is kept between 10 and 20 tiles
```

So Normal sight ranges from 10.5 tiles (heavy fog and rain) to 20, Eagle from about 18 to 20, and Poor is always 10 (20 x 0.35 is 7, which is raised to 10). The light used is the light on the square where the zombie's current target stands; a zombie with no target uses the general daylight. A zombie eating a corpse has half the radius, and so does one wearing a mask or helmet that blocks vision (a gas mask, a hockey mask, a full crash helmet), before the 10-tile floor applies.

> **Proof:** Code. `zombie.characters.IsoZombie#updateVisionRadius` and `#getVisionRadiusAdjusted` (rain x2.5, fog x7, darkness x5, Eagle x1.75, Poor x0.35, divided by the zombie's worn-item vision modifier, x0.5 while eating, clamped to 10-20); `zombie.characters.IsoGameCharacter#updateWornItemsVisionModifier`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Step 2: the chance to spot you

Inside the radius, and only if the zombie stands on a square you could see, the game works out a chance every frame:

```
chance = 100 x light x facing x 0.8
         x 3          if you are within about 4.5 tiles and not sneaking or aiming
         x sneaking   only while you sneak (see the table)
         x sight      Eagle 2.5, Normal 1, Poor 0.45
         x trait      Inconspicuous 0.8, Conspicuous 1.2
         x cover      only while you sneak behind low cover (0 behind full cover)
         x vehicle    0 if a car is between you (0.5 if it is closer than 1.5 tiles)
         / (5 x floors apart + 1)
         x 0.5 if the zombie is eating, x 0.25 in its inactive phase,
         x 5 for 15 seconds after it has spotted someone
then: round down, cap at 400, divide by 400
```

The result is the chance per game tick. The game counts 48 ticks per real second at normal speed, and it compounds the chance per frame so the frame rate does not matter. A result of 1 (anything that reaches the 400 cap) means you are seen in the same frame.

`light` is how lit your square is, from 0 (black) to 1 (full daylight), as the game lights it for you. `facing` depends on the angle between the way the zombie faces and the direction to you:

| Angle from where the zombie faces | Facing multiplier |
|---|---|
| Up to about 37 degrees | x32 |
| 37 to 53 degrees | x16 |
| 53 to 66 degrees | x8 |
| 66 to 78 degrees | x2 |
| 78 to 90 degrees | x0.5 |
| 90 to 102 degrees | x0.25 |
| 102 to 114 degrees | x0.125 |
| More than 114 degrees | x0: it cannot see you |

The `x 0.8` is a movement factor. The code has larger values for moving exactly 0.5, 1 or 1.5 tiles in a single frame, but a walking or running character moves a small fraction of a tile per frame, so in practice the factor is 0.8. That last part is our reading of the numbers, not something the code states.

`sneaking` comes from your Sneaking skill, and it only counts while you are actually sneaking:

| Sneaking level | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | 1.14 | 1.08 | 0.96 | 0.90 | 0.84 | 0.78 | 0.72 | 0.66 | 0.60 | 0.54 | 0.48 |

Yes, at level 0 and 1, sneaking makes the sight roll slightly worse than walking. It still pays: it removes the x3 close-range factor, it makes your footsteps much quieter, and it is the only way to use cover.

**Cover** counts only while you sneak, on your own square or the next one towards the zombie. The game has a fixed list of 95 tiles for it, some of them only from certain sides: dumpsters, bushes, hedges and some fences give full cover (x0), a few fence pieces give 60% (x0.4).

One more rule: a zombie already chasing someone who is closer to it than you are does not switch to you.

> **Proof:** Code. `zombie.characters.IsoZombie#spottedNew` (light from the square's lighting, the facing ladder, movement 0.8, x3 within viewDist < 5, sneak, sight 2.5 and 0.45, inactive 0.25, Inconspicuous 0.8, Conspicuous 1.2, `getObstacleMod`, `isVehicleBetween`, floor divisor, cap 400, `1 - (1 - chance)^multiplier`); `#closeSneakBonusCoeff` and the two `temporaryMapCloseSneakBonus` tables; the early return when the zombie's current target is closer (Manhattan distance); `zombie.characters.IsoGameCharacter#getSneakSpotMod`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Code. `zombie.characters.IsoPlayer#updateLOS` calls `TestZombieSpotPlayer` only for zombies on squares the player could see (`isCouldSee`); `zombie.GameTime#getMultiplier` (48 ticks per real second at normal speed: 0.8 per frame at 60 frames per second). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### What that means in seconds

Worked from the formula above, for a Normal-sighted zombie inside its radius but more than 4.5 tiles away, at normal game speed. The light values are examples: we have not measured what the game reports for a dark street at night, so read "light 0.1" as "quite dark".

| Situation | Chance to be spotted within one second |
|---|---|
| Daylight, it looks at you (any angle under 66 degrees) | 100%, the same frame |
| Daylight, you are 85 degrees off its facing, walking | 99% |
| Daylight, 95 degrees off, walking | 92% |
| Daylight, 110 degrees off, walking | 70% |
| Light 0.1, it looks at you | 100% |
| Light 0.1, 85 degrees off, walking | 38% |
| Light 0.1, 95 degrees off, sneaking at level 5 | 11% |
| Light 0.1, 95 degrees off, sneaking at level 10 | 0%: the chance rounds down to nothing |
| Any light, more than 114 degrees off | 0% |

Two things fall out of the formula. First, a zombie looking roughly your way sees you in anything short of near-total darkness: the facing multiplier is so large that most other factors still hit the 400 cap. Second, the rounding down is real stealth: once the chance drops below 1 out of 400, it is zero, not small.

## Hearing: the formula

### Who hears a noise

```
reach = radius x hearing x weather x the zombie's own headgear
        hearing: Pinpoint 3, Normal 1, Poor 0.45
        weather: 1 - 0.33 x rain intensity - 0.1 x fog intensity
distance counts each floor of height as 3 tiles
```

A zombie inside `reach` hears the noise. If several noises reach it, it goes for the loudest:

```
pull = volume x (1 - distance^2 / reach^2)
       the fraction distance^2 / reach^2 is x1.2 if you are in different rooms,
       and x1.4 more if one of you is outdoors and the other indoors
```

It then reacts after a short random delay (up to about half a second) and walks to the noise's square plus or minus `distance / 2.5` tiles in each direction (distance counted along the grid). If it cannot draw a clear line to that spot, it misses by up to 2 more tiles (5 in heavy rain; the Poor sandbox setting adds 2, Pinpoint takes 2 away, never below 2). While a noise it follows keeps going, and for about 2 seconds after, a new noise only wins if it pulls more than twice as hard. And **for 5 seconds after it last saw someone, or was hit, a zombie ignores noise altogether**.

> **Proof:** Code. `zombie.WorldSoundManager#getHearingMultiplier` (3, 1, 0.45, times the zombie's worn-item hearing multiplier and `getWeatherHearingMultiplier`), `#getSoundAttract` and `#getBiggestSoundZomb` (floors x3, rooms x1.2 and x1.4); `zombie.characters.IsoGameCharacter#getWeatherHearingMultiplier` (rain 0.33, fog 0.1); `zombie.characters.IsoZombie#RespondToSound` (delay `Rand.Next(0, 16)` thirty-frame ticks, scatter `distance / 2.5`, the blocked-line offset, a new noise needing `soundAttract * 2` while `soundAttractTimeout` runs) and `IsoZombie#update` (`RespondToSound` only after `timeSinceSeenFlesh > 240`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Your footsteps

```
volume = step x 1.4
         step: sneak-walk 0.25, sneak-run 0.25, walk 0.5, strafe 0.5, run 0.75, sprint 1.0
         x 0.6 Graceful, x 1.2 Clumsy, x 0.5 barefoot
         x Lightfooted factor (0.99 at level 0 down to 0.2 at level 10)
         x (2 - Nimble factor) (1 at level 0 down to 0.5 at level 10)
         x your sneaking multiplier, while sneaking
radius = volume x 10, rounded up; halved (rounded down) inside a building
```

Not every footstep counts: a step makes a noise one time in two, or while sneaking one time in (4 + your Lightfooted level), at most one in 12. A level 10 Lightfooted and Nimble character sneaking leaves a radius of 1.

> **Proof:** Code. `zombie.characters.IsoPlayer#DoFootstepSound(String)` (the step values) and `zombie.characters.IsoGameCharacter#DoFootstepSound(float)` (x1.4, Graceful 0.6, Clumsy 1.2, no shoes 0.5, `getLightfootMod`, `2 - getNimbleMod`, sneak multiplier, radius `ceil(volume x 10)`, x0.5 in a room, one in 2 or one in `min(12, 4 + Lightfooted)`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Gunshots and fights

A shot makes a noise of the gun's `SoundRadius` times the **Firearm Noise Multiplier** sandbox setting (default 1.0, range 0.2 to 2.0), halved if you are indoors. The pull uses the gun's own volume. Melee is quieter: the swing itself makes no noise, but every hit that lands makes one of radius 8, plus either a radius 10 noise (one time in three) or, otherwise, a radius 16 noise one time in seven. The close-range knife kill skips those and makes only small noises (radius 4 and 5).

```lua
local radius = weapon:getSoundRadius() * getSandboxOptions():getOptionByName("FirearmNoiseMultiplier"):getValue();
if not character:isOutside() then
    radius = radius * 0.5
end
```

> **Proof:** Code. `media/lua/shared/TimedActions/ISReloadWeaponAction.lua`, function `ISReloadWeaponAction.attackHook` (the lines above); the radii are the `SoundRadius` values in `media/scripts/generated/items/weapon.txt`; `zombie.CombatManager#attackCollisionCheck` (hit noises 8, 10, 16 and 4); `zombie.characters.IsoGameCharacter#Hit` (radius 5 on every hit); `#Callout` (30, 6, 90, 18) and `#triggerCough` (35). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What changes it

**Sandbox options** (Zombie Lore page):

- **Sight:** Eagle, Normal, Poor, Random (each zombie rolls Eagle, Normal or Poor), Random between Normal and Poor. Changes both the radius and the chance (Eagle x2.5, Poor x0.45).
- **Hearing:** Pinpoint, Normal, Poor, and the same two random choices. Changes how far a noise reaches (x3, x1, x0.45) and how precisely a zombie walks to it.
- **New Stealth System** (on by default): the system on this page. Turned off, the game uses an older version of the sight check, with a 2.5-second lock-on instead of 15.
- **Firearm Noise Multiplier:** scales every gunshot radius.
- **Active Only:** a zombie in its inactive phase spots you at a quarter of the usual chance.

**Traits and skills:**

| What | Effect |
|---|---|
| Inconspicuous | sight chance x0.8 |
| Conspicuous | sight chance x1.2 |
| Graceful | footsteps x0.6 |
| Clumsy | footsteps x1.2 |
| No shoes | footsteps x0.5 |
| Sneaking skill | sight chance and footsteps, while sneaking (table above) |
| Lightfooted skill | footsteps, and how often a sneaking step makes noise |
| Nimble skill | footsteps |

Your own hearing traits (Keen Hearing, Hard of Hearing, Deaf) change what you hear, not what zombies hear.

## Multiplayer

From the code, with one honest caveat: we have not watched any of this on a dedicated server.

- On a dedicated server every square reads as **fully lit** (the server has no real light data). Any spotting check the server itself makes therefore ignores darkness.
- A zombie's reaction to noise is never worked out on the dedicated server itself: `RespondToSound` returns at once there. It runs on the machine that is moving that zombie.
- Footstep noises are added with the network send turned off, so they exist only on the machine of the player who made them.

> **Proof:** Code. `zombie.network.ServerLOS.ServerLighting#lightInfo` returns 1, 1, 1; `zombie.characters.IsoZombie#RespondToSound` is wrapped in `if (!GameServer.server)`; `zombie.characters.IsoGameCharacter#DoFootstepSound(float)` calls `addSound` with `doSend` false. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. Which machine runs the sight check for a given zombie in a live multiplayer game, and how darkness plays out there, needs a server test with the evidence in the server log. We have not run it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where this lives in the code

- `zombie.characters.IsoZombie`: `spotted` (picks the new or old system), `spottedNew`, `updateVisionRadius`, `getVisionRadiusAdjusted`, `getObstacleMod`, `RespondToSound`, `DoZombieStats` (the per-zombie sight and hearing roll).
- `zombie.characters.IsoPlayer#updateLOS` and `#TestZombieSpotPlayer`: the loop that asks each zombie in your line of sight to try to spot you.
- `zombie.WorldSoundManager`: `addSound`, `getHearingMultiplier`, `getSoundAttract`, `getBiggestSoundZomb`.
- `zombie.characters.IsoGameCharacter`: `getSneakSpotMod`, `getLightfootMod`, `getNimbleMod`, `DoFootstepSound`, `Callout`, `getWeatherHearingMultiplier`.
- `media/lua/shared/TimedActions/ISReloadWeaponAction.lua`: the gunshot noise.

The per-zombie roll for the default "Random between Normal and Poor":

```java
if (SandboxOptions.instance.lore.sight.getValue() == 4) {
   this.sight = Rand.Next(3) + 1;
} else if (SandboxOptions.instance.lore.sight.getValue() == 5) {
   this.sight = Rand.Next(2) + 2;
} else {
   this.sight = SandboxOptions.instance.lore.sight.getValue();
}
```

> **Proof:** Code. `zombie.characters.IsoZombie#DoZombieStats` (the lines above, and the same for hearing); `zombie.SandboxOptions.ZombieLore` (engine defaults Sight 2, Hearing 2, SpottedLogic true); `media/lua/shared/Sandbox/SandboxVars.lua` loads `Sandbox/Apocalypse`, which sets Sight 5 and Hearing 5. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [How long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you): what happens after it spots you.
- [Traits](/pz/build-42/modding/skills-and-traits/traits): the full trait list.
- [Outcast Hearing](/pz/build-42/outcast-mods/outcast-hearing/outcast-hearing): our mod about your own hearing and gunfire.
