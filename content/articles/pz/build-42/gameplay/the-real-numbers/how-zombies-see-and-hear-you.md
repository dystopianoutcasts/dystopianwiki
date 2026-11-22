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
  How far a zombie sees you (up to 20 tiles by day, never under 10), how its sight chance changes with light, facing and sneaking, and how far walking, fights and gunshots carry. 42.22 code.
last_updated: '2026-11-22'
related_articles:
  - how-long-zombies-remember-you
  - the-helicopter-event
  - firearm-accuracy-and-damage
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Every Outcast has argued about how far a zombie can hear a gunshot, and whether crouching in the dark really works. We read the code. Here are the numbers, and where they come from.

**Who this page is for:** [seeing](#1-seeing-how-far-and-how-likely) | [hearing](#2-hearing-who-hears-what) | [multiplayer](#4-multiplayer)

:::callout[The 1-minute version]{kind=key}
- A zombie can only spot you inside its vision radius: 20 tiles in clear daylight with Normal sight, shrinking with darkness, rain and fog, but never below 10 tiles. A Poor-sighted zombie always has 10.
- Inside the radius it rolls a chance every frame. Where it is looking matters most: one looking straight at you in daylight spots you at once, and one with you more than about 114 degrees off its facing cannot see you at all.
- Darkness, sneaking, the Inconspicuous trait, low cover and a car between you cut the chance. Very close (about 4.5 tiles) you are three times easier to spot, unless you are sneaking or aiming without running.
- Every noise has a radius. A zombie hears it if it stands within the radius times its hearing: Normal x1, Poor x0.45, Pinpoint x3, a little less in rain and fog. Each floor of height counts as 3 tiles.
- Walking is radius 7, running 11, sprinting 14, sneaking 4 at Sneaking skill 0 (halved indoors). A shotgun is 200, a M9 Pistol 100.
- For 5 seconds after a zombie last saw someone, or was hit, it ignores noise.
- These numbers are for the default Apocalypse preset, where each zombie rolls its own sight and hearing, Normal or Poor.
:::

:::facts
- **Vision radius** 20 tiles at best, 10.5 tiles in heavy fog and rain, 10 for Poor sight
- **Spot chance** 100 x light x facing x 0.8, capped at 400 per update, then divided by 400
- **Updates** 48 per real second at normal speed, so the chance compounds 48 times a second
- **Close-range spotting** about 4.5 tiles, 3 times easier
- **Hearing** radius x 1 (Normal), x0.45 (Poor), x3 (Pinpoint)
- **Footsteps** walk 7, run 11, sprint 14, sneak 4 at Sneaking skill 0; half that indoors
- **Gunshots** 30 to 200 by gun, times the Firearm Noise Multiplier (default 1.0), half indoors
- **Deaf spell** 5 seconds after it last saw someone or was hit
:::

## 1. Seeing: how far and how likely

A zombie spots you in two steps: you must be inside its vision radius, and then it rolls a chance every frame that you are in sight.

It also needs a line of sight: it only tests you when its square, or the square its head is in, is one you could see yourself, so walls block both ways. :cite[(`zombie/characters/IsoPlayer.java:5771-5778`, `zombie/characters/IsoPlayer.java:5792-5799`, `zombie/characters/IsoPlayer.java:1032-1043`)] A zombie already chasing someone who is closer to it than you are does not switch to you. :cite[(`zombie/characters/IsoZombie.java:2186-2192`)]

### Step 1: the vision radius

The radius starts at 20 tiles and loses up to 5 tiles to darkness, or up to 9.5 to rain and fog, whichever is larger.

```
radius = 20 - the larger of (darkness, rain + fog)
         darkness = (1 - light) x 5      up to 5 tiles
         rain     = rain intensity x 2.5 up to 2.5 tiles
         fog      = fog intensity x 7    up to 7 tiles
Eagle sight:  radius x 1.75
Poor sight:   radius x 0.35
divided by the zombie's own worn-item vision modifier, x0.5 while it eats
then the result is kept between 10 and 20 tiles
```

Normal sight ranges from 10.5 tiles (heavy fog and rain) to 20, Eagle from about 18 to 20, and Poor is always 10 (20 x 0.35 is 7, which is raised to 10). :cite[(`zombie/characters/IsoZombie.java:5425-5457`)] The light used is the light on the square where the zombie's current target stands; a zombie with no target uses the lower of daylight and ambient light. A zombie eating a corpse has half the radius, and so does one wearing a mask or helmet that blocks vision (a gas mask, a hockey mask, a full crash helmet), before the 10-tile floor applies. :cite[(`zombie/characters/IsoGameCharacter.java:15404-15429`)]

### Step 2: the chance to spot you

Inside the radius, the game works out a chance every frame from your light, the zombie's facing and a handful of modifiers.

```
chance = 100 x light x facing x 0.8
         x 3          if you are within about 4.5 tiles and running, or not sneaking and not aiming
         x sneaking   only while you sneak (see the table)
         x sight      Eagle 2.5, Normal 1, Poor 0.45
         x trait      Inconspicuous 0.8, Conspicuous 1.2
         x cover      only while you sneak behind low cover (0 behind full cover)
         x vehicle    0 if a car is between you (0.5 if it is closer than 1.5 tiles)
         / (5 x floors apart + 1)
         / the zombie's own vision modifier (a mask or helmet it wears)
         x 0.5 if the zombie is eating, x 0.25 in its inactive phase,
         x 5 for 15 seconds after it has spotted someone
then: round down, cap at 400, divide by 400
```

The result is the chance per game update. The game adds up 48 of those per real second at normal speed on a client at any frame rate and on a dedicated server, and it compounds the chance per update, so the frame rate does not matter. :cite[(`zombie/characters/IsoZombie.java:2089-2265`, `zombie/GameTime.java:986`, `zombie/FPSTracking.java:46`, `zombie/network/GameServer.java:1166`)] A result of 1 (anything that reaches the 400 cap) means you are seen in the same frame.

`light` is how lit your square is, from 0 (black) to 1 (full daylight), as the game lights it for you: the average of the red, green and blue light levels. :cite[(`zombie/characters/IsoZombie.java:2090-2098`)] The angle test (`cosAngle`) gives the `facing` multiplier, which depends on the angle between the way the zombie faces and the direction to you. :cite[(`zombie/characters/IsoZombie.java:2124-2150`)]

| Angle from where the zombie faces | Facing multiplier | Code |
|---|---|---|
| Up to about 37 degrees | x32 | `zombie/characters/IsoZombie.java:2147-2149` |
| 37 to 53 degrees | x16 | `zombie/characters/IsoZombie.java:2145-2146` |
| 53 to 66 degrees | x8 | `zombie/characters/IsoZombie.java:2143-2144` |
| 66 to 78 degrees | x2 | `zombie/characters/IsoZombie.java:2141-2142` |
| 78 to 90 degrees | x0.5 | `zombie/characters/IsoZombie.java:2139-2140` |
| 90 to 102 degrees | x0.25 | `zombie/characters/IsoZombie.java:2137-2138` |
| 102 to 114 degrees | x0.125 | `zombie/characters/IsoZombie.java:2135-2136` |
| More than 114 degrees | x0: it cannot see you | `zombie/characters/IsoZombie.java:2133-2134` |

The `x 0.8` is a movement factor. The code has larger values for moving exactly 0.5, 1 or 1.5 tiles in a single frame, but a walking or running character moves a small fraction of a tile per frame, so in practice the factor is 0.8. :cite[(`zombie/characters/IsoZombie.java:2161-2171`)] That last part is our reading of the numbers, not something the code states.

`sneaking` comes from your Sneaking skill, and it only counts while you are actually sneaking. :cite[(`zombie/characters/IsoZombie.java:2177-2182`, `zombie/characters/IsoGameCharacter.java:4438-4482`)]

| Sneaking level | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | 1.14 | 1.08 | 0.96 | 0.90 | 0.84 | 0.78 | 0.72 | 0.66 | 0.60 | 0.54 | 0.48 |

Yes, at level 0 and 1, sneaking makes the sight roll slightly worse than walking. It still pays: it removes the x3 close-range factor, it makes your footsteps much quieter, and it is the only way to use cover. Running while sneaking keeps the x3, though. :cite[(`zombie/characters/IsoZombie.java:2172-2175`)]

**Cover** counts only while you sneak, on your own square or the next one toward the zombie. The game has a fixed list of 95 tiles for it, some of them only from certain sides: dumpsters, bushes, hedges and some fences give full cover (x0), and a few fence pieces give 60% (x0.4). :cite[(`zombie/characters/IsoZombie.java:356-549`, `zombie/characters/IsoZombie.java:2034-2044`)]

### What that means in seconds

Worked from the formula above, for a Normal-sighted zombie inside its radius but more than 4.5 tiles away, at normal game speed. The light values are examples: we have not measured what the game reports for a dark street at night, so read "light 0.1" as "quite dark".

| Situation | Chance to be spotted within one second |
|---|---|
| Daylight, it looks at you (any angle under 66 degrees) | 100%, the same frame |
| Daylight, you are 85 degrees off its facing, walking | 99% |
| Daylight, 95 degrees off, walking | 91% |
| Daylight, 110 degrees off, walking | 70% |
| Light 0.1, it looks at you | 100% |
| Light 0.1, 85 degrees off, walking | 38% |
| Light 0.1, 95 degrees off, sneaking at level 5 | 11% |
| Light 0.1, 95 degrees off, sneaking at level 10 | 0%: the chance rounds down to nothing |
| Any light, more than 114 degrees off | 0% |

Two things fall out of the formula. First, a zombie looking roughly your way sees you in anything short of near-total darkness: the facing multiplier is so large that most other factors still hit the 400 cap. Second, the rounding down is real stealth: once the chance drops below 1 out of 400, it is zero, not small. :cite[(`zombie/characters/IsoZombie.java:2256-2265`)]

## 2. Hearing: who hears what

Every noise has a radius, and a zombie hears it if it stands within that radius times its own hearing.

```
reach = radius x hearing x weather x the zombie's own headgear
        hearing: Pinpoint 3, Normal 1, Poor 0.45
        weather: 1 - 0.33 x rain intensity - 0.1 x fog intensity
distance counts each floor of height as 3 tiles
```

:cite[(`zombie/WorldSoundManager.java:518-530`, `zombie/characters/IsoGameCharacter.java:15463-15484`, `zombie/WorldSoundManager.java:351-362`)]

If several noises reach a zombie, it goes for the loudest.

```
pull = volume x (1 - distance^2 / reach^2)
       the fraction distance^2 / reach^2 is x1.2 if you are in different rooms,
       and x1.4 more if one of you is outdoors and the other indoors
```

:cite[(`zombie/WorldSoundManager.java:351-381`, `zombie/WorldSoundManager.java:295-345`)]

It reacts after a short random delay (up to about half a second) and walks to the noise's square plus or minus `distance / 2.5` tiles in each direction, counted along the grid. :cite[(`zombie/characters/IsoZombie.java:1694`, `zombie/characters/IsoZombie.java:1708-1710`)] 

If it cannot draw a clear line to that spot, it misses by up to 2 more tiles (5 in heavy rain; the Poor sandbox setting adds 2, Pinpoint takes 2 away, never below 2). :cite[(`zombie/characters/IsoZombie.java:1736-1758`)] While a noise it follows keeps going, and for about 2 seconds after, a new noise only wins if it pulls more than twice as hard. :cite[(`zombie/characters/IsoZombie.java:1649-1667`)] 

And for 5 seconds after it last saw someone, or was hit, a zombie ignores noise altogether. :cite[(`zombie/characters/IsoZombie.java:3441-3443`, `zombie/characters/IsoZombie.java:1372`)] The delay and the 2-second timeout count 30 steps per real second. :cite[(`zombie/characters/IsoZombie.java:1630-1631`, `zombie/GameTime.java:1032-1034`)]

The numbers for what makes a noise, and what the world does with it, are on [What makes noise, and how far it carries](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far) and [World sounds, and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them).

| Noise you make (default settings) | Radius in tiles | Indoors | Code |
|---|---|---|---|
| Walking | 7 | 3 | `zombie/characters/IsoPlayer.java:7190-7193` |
| Running | 11 | 5 | `zombie/characters/IsoPlayer.java:7194-7197` |
| Sprinting | 14 | 7 | `zombie/characters/IsoPlayer.java:7198-7200` |
| Sneaking (walk or run), Sneaking skill 0 | 4 | 2 | `zombie/characters/IsoPlayer.java:7178-7185` |
| Each melee hit that lands | 8, sometimes 10 or 16 | same | `zombie/CombatManager.java:1176-1182` |
| Shouting (sneaking: whisper) | 30 (6) | same | `zombie/characters/IsoGameCharacter.java:5145-5153` |
| Shouting into a megaphone (sneaking) | 90 (18) | same | `zombie/characters/IsoGameCharacter.java:5144-5153` |
| Coughing | 35 | same | `zombie/characters/IsoGameCharacter.java:15516` |
| Toy cap guns | 30 | 15 | `media/scripts/generated/items/weapon.txt` |
| SN38 Revolver | 60 | 30 | `media/scripts/generated/items/weapon.txt` |
| M1911 Pistol, Trapper Carbine | 70 | 35 | `media/scripts/generated/items/weapon.txt` |
| M9 Pistol, Patrol Revolver | 100 | 50 | `media/scripts/generated/items/weapon.txt` |
| B-F Pistol, Magnum, L92 Carbine | 120 | 60 | `media/scripts/generated/items/weapon.txt` |
| M16 Assault Rifle, MSR700 Rifle, JS-14 Rifle | 150 | 75 | `media/scripts/generated/items/weapon.txt` |
| L94 Rifle | 160 | 80 | `media/scripts/generated/items/weapon.txt` |
| MSR788 Rifle, M1A Rifle, MSR7T Tactical Rifle | 170 | 85 | `media/scripts/generated/items/weapon.txt` |
| Every shotgun (JS-2000, JS-3T, double barrel, sawed-off) | 200 | 100 | `media/scripts/generated/items/weapon.txt` |

The footstep numbers are for a character with shoes, no movement traits and level 0 in Sneaking, Lightfooted and Nimble. A shout that you make while holding or wearing a whistle, a harmonica or a plastic cowboy hat with a whistle is louder: the radius is multiplied by 1.5 to 2, unless you are sneaking. :cite[(`zombie/characters/IsoGameCharacter.java:5173-5190`, `media/scripts/generated/items/normal.txt:5120`, `media/scripts/generated/items/normal.txt:5135`, `media/scripts/generated/items/normal.txt:5151`, `media/scripts/generated/items/clothing.txt:3185`)] On average only one footstep in two makes a noise at all (fewer when sneaking); the next sections have the details. Vanilla Build 42 has no suppressors; we checked that in the How we know note below.

### Your footsteps

A footstep's radius is its volume times 10, rounded up, and your skills, traits and shoes change the volume.

```
volume = step x 1.4
         step: sneak-walk 0.25, sneak-run 0.25, walk 0.5, strafe 0.5, run 0.75, sprint 1.0
         x 0.6 Graceful, x 1.2 Clumsy, x 0.5 barefoot
         x Lightfooted factor (0.99 at level 0 down to 0.2 at level 10)
         x (2 - Nimble factor) (1 at level 0 down to 0.5 at level 10)
         x your sneaking multiplier, while sneaking
radius = volume x 10, rounded up; halved (rounded down) inside a building
```

The steps above are the player's. :cite[(`zombie/characters/IsoPlayer.java:7174-7205`, `zombie/characters/IsoGameCharacter.java:5658-5700`, `zombie/characters/IsoGameCharacter.java:4484-4506`, `zombie/characters/IsoGameCharacter.java:4535-4556`)] Other characters, such as animals, use their own base steps from a separate method (walk 0.5, run 1.3, sprint 1.8, sneak-walk 0.2). :cite[(`zombie/characters/IsoGameCharacter.java:5646-5656`)]

Not every footstep counts: a step makes a noise one time in two, or while sneaking one time in (4 + your Lightfooted level), at most one in 12. :cite[(`zombie/characters/IsoGameCharacter.java:5688-5702`)] A level 10 Lightfooted and Nimble character sneaking leaves a radius of 1.

### Gunshots and fights

A shot makes a noise of the gun's `SoundRadius` times the **Firearm Noise Multiplier** sandbox setting (default 1.0, range 0.2 to 2.0), halved if you are indoors, and the pull uses the gun's own volume. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443-450`, `zombie/SandboxOptions.java:253`)] Melee is quieter: the swing itself makes no noise, but every hit that lands makes one of radius 8, plus either a radius 10 noise (one time in three, or always for a shove at the floor) or, otherwise, a radius 16 noise one time in seven. :cite[(`zombie/CombatManager.java:1176-1182`)] The close-range knife kill skips those and makes a radius 4 noise. :cite[(`zombie/CombatManager.java:1170`)] Every hit that lands on a character also adds a radius 5 noise at volume 1. :cite[(`zombie/characters/IsoGameCharacter.java:6145`)]

```lua
local radius = weapon:getSoundRadius() * getSandboxOptions():getOptionByName("FirearmNoiseMultiplier"):getValue();
if not character:isOutside() then
    radius = radius * 0.5
end
```

## 3. What changes it

Your traits and skills, and a few sandbox options, change how far you are seen, how likely you are to be spotted and how far your noise travels.

**Sandbox options** (Zombie Lore page):

- **Sight:** Eagle, Normal, Poor, Random (each zombie rolls Eagle, Normal or Poor), Random between Normal and Poor. Changes both the radius and the chance (Eagle x2.5, Poor x0.45). :cite[(`zombie/characters/IsoZombie.java:3887-3893`, `media/lua/shared/Translate/EN/Sandbox.json:516-522`)]
- **Hearing:** Pinpoint, Normal, Poor, and the same two random choices. Changes how far a noise reaches (x3, x1, x0.45) and how precisely a zombie walks to it. :cite[(`zombie/characters/IsoZombie.java:3895-3901`, `media/lua/shared/Translate/EN/Sandbox.json:529-535`)]
- **New Stealth System** (on by default): the system on this page. Turned off, the game uses an older version of the sight check, with a 2.5-second lock-on instead of 15. :cite[(`zombie/characters/IsoZombie.java:2858-2863`)]
- **Firearm Noise Multiplier:** scales every gunshot radius. The Extinction preset sets it to 1.25. :cite[(`media/lua/shared/Sandbox/Extinction.lua:176`)]
- **Day/Night Zombie Speed Effect:** a zombie in its inactive phase spots you at a quarter of the usual chance. :cite[(`zombie/characters/IsoZombie.java:2210-2212`, `zombie/GameTime.java:1334-1336`, `media/lua/shared/Translate/EN/Sandbox.json:672-676`)]

**Traits and skills:**

| What | Effect | Code |
|---|---|---|
| Inconspicuous | sight chance x0.8 | `zombie/characters/IsoZombie.java:2214-2217` |
| Conspicuous | sight chance x1.2 | `zombie/characters/IsoZombie.java:2219-2221` |
| Graceful | footsteps x0.6 | `zombie/characters/IsoGameCharacter.java:5664-5666` |
| Clumsy | footsteps x1.2 | `zombie/characters/IsoGameCharacter.java:5668-5670` |
| No shoes | footsteps x0.5 | `zombie/characters/IsoGameCharacter.java:5672-5674` |
| Sneaking skill | sight chance and footsteps, while sneaking (table above) | `zombie/characters/IsoGameCharacter.java:5678-5680` |
| Lightfooted skill | footsteps, and how often a sneaking step makes noise | `zombie/characters/IsoGameCharacter.java:5676`, `zombie/characters/IsoGameCharacter.java:5698-5700` |
| Nimble skill | footsteps | `zombie/characters/IsoGameCharacter.java:5677` |

Your own hearing traits (Keen Hearing, Hard of Hearing, Deaf) change what you hear, not what zombies hear. :cite[(`zombie/characters/IsoGameCharacter.java:15471-15478`)]

## 4. Multiplayer

On a dedicated server the numbers change in three ways, from the code, with one honest caveat: we have not watched any of this on a dedicated server.

- On a dedicated server every square reads as fully lit, because the server has no real light data. Any spotting check the server itself makes therefore ignores darkness. :cite[(`zombie/network/ServerLOS.java:356-361`, `zombie/characters/IsoZombie.java:2090-2098`)]
- A zombie's reaction to noise is never worked out on the dedicated server itself: it returns at once there. It runs on the machine that is moving that zombie. :cite[(`zombie/characters/IsoZombie.java:1604-1605`)]
- Footstep noises are added with the network send turned off, so they exist only on the machine of the player who made them. Gunshots, shouts and fight noises are sent to the server. :cite[(`zombie/characters/IsoGameCharacter.java:5703-5717`, `zombie/WorldSoundManager.java:176-181`, `zombie/network/GameClient.java:1299-1301`)]

## Where this lives in the code

The per-zombie roll for the default "Random between Normal and Poor" is made when the zombie is created: :cite[(`zombie/characters/IsoZombie.java:3887-3893`)]

```java
if (SandboxOptions.instance.lore.sight.getValue() == 4) {
   this.sight = Rand.Next(3) + 1;
} else if (SandboxOptions.instance.lore.sight.getValue() == 5) {
   this.sight = Rand.Next(2) + 2;
} else {
   this.sight = SandboxOptions.instance.lore.sight.getValue();
}
```

The engine defaults are Sight 2 and Hearing 2 (Normal), and the Apocalypse preset sets both to 5. :cite[(`zombie/SandboxOptions.java:2109-2110`, `media/lua/shared/Sandbox/Apocalypse.lua:206-207`)]

## Where to go next

- [How long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you): what happens after it spots you.
- [How firearm accuracy and damage work](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage): what the gun does once it makes the noise.
- [Traits](/pz/build-42/modding/skills-and-traits/traits): the full trait list.
- [Outcast Hearing](/pz/build-42/outcast-mods/outcast-hearing/outcast-hearing): our mod about your own hearing and gunfire.

:::callout[How we know]{kind=proof}
Everything on this page is read from the 42.22 code, and the seconds table is worked out from the formula. We did not run a game to time a spot or measure a noise. We have not measured what the game reports for the light on a dark street at night, so the light 0.1 rows are examples. Which machine runs the sight check for a given zombie in a live multiplayer game, and how darkness plays out there, needs a server test with the evidence in the server log: we have not run it.

The claim that vanilla has no suppressors comes from a case-insensitive grep for "suppress" and "silencer" over media/scripts and media/lua: it found hits only in translation files for other languages, none in the English text, scripts or code.
:::
