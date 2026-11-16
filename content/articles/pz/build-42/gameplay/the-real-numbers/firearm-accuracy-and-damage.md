---
id: build-42-firearm-accuracy-and-damage
slug: firearm-accuracy-and-damage
title: How firearm accuracy and damage work
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: intermediate
tags:
  - combat
  - firearms
  - aiming
  - weapons
  - sandbox
excerpt: >-
  How a 42.22 gun shot works: the hit chance and what a failed roll does, aim time and recoil in seconds, damage by body part, critical hits once per shot, shotguns and piercing rounds. Worked numbers.
last_updated: '2026-11-15'
related_articles:
  - melee-damage-and-critical-hits
  - how-zombies-see-and-hear-you
  - hit-reactions-and-ballistics
  - what-makes-noise-and-how-far
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, guns in Build 42 feel very different from Build 41, and the arguments about them are louder. We read the 42.22 code. Most of the answer is plain arithmetic we can show you; one part lives in a library we cannot read, and we tell you which.

:::callout[The 1-minute version]{kind=key}
- For the default settings (the Apocalypse preset: Firearms Use Damage Chance "Zombies only", the moodle and weather multipliers at 1, headgear effect on), every bullet at a zombie rolls a hit chance first. It is a percent: the gun's HitChance, plus 4 per Aiming level, plus a range bonus, minus penalties, kept between 5 and 100.
- Which zombies a shot can reach, and which body part sits under your reticle, come from the game's physics library, which is native code we cannot read. Everything below happens after it has picked the targets.
- In 42.22 a failed roll against a zombie, on the default setting, is a hit that does no damage. The 42.21 single-player quirk where the zombie still took the damage is gone: the no-damage flag now goes into the hit before the damage is worked out.
- Damage per bullet is the gun's damage roll, times the body part (head x3, arm or leg x0.05), times 1.5 for a target that is not a player, times 0.3, and x1.5 more if the zombie is turned away. No Strength, no skill, no hit counter and no melee x0.15.
- An M9 Pistol bullet does about 0.36 to the body and 1.08 to the head, against a Normal zombie's 1.5 to 1.8 health: about 5 body shots or 2 head shots. A critical M9 head shot (x4) does 4.32, more than the 3.8 a Tough zombie can have.
- The critical roll happens once per shot, on the closest target, not once per bullet. The same roll gives the critical damage and knocks the zombie down; there is no second roll.
- A raised gun is not ready at once: your aim delay starts at the gun's aiming time and drains at 30 per second at Aiming 0. An M9 (25) settles in about 0.8 seconds, the slowest long gun in the scripts, the MSR7T Tactical Rifle (65), in about 2.2.
:::

:::facts
- **Hit chance** gun's HitChance + 4 per Aiming level + range bonus - penalties, kept 5 to 100; a bullet hits when a 0 to 99 roll is at most the result
- **Aim delay** starts at the gun's aiming time (25 for handguns, 30 to 65 for long guns); drains 30 per real second at Aiming 0, so 25 takes 0.8 s and 65 takes 2.2 s
- **Recoil** the lock after a shot, 12 for the M9 and 30 for the JS-2000; at Strength 5 and Aiming 0 that is 0.4 s and 1.0 s
- **Moving penalty** up to 70 points: full after about 1.2 s of walking, gone after about 2.3 s standing still
- **Damage** roll x body part x armor x 1.5 x 0.3, x1.5 turned away, x max(2, gun's critical multiplier) on a critical
- **Crit chance** gun's CriticalChance + 6 per Aiming level (10 for the JS-2000 and JS-3T) + range bonus - penalties, kept 10 to 90, +5 from behind; rolled once per shot
- **Failed roll** a hit with no damage against a zombie on the default setting
- **Noise** gun's SoundRadius x Firearm Noise Multiplier, halved indoors
- **Real time** the per-second numbers use 48 game-time units per second at normal speed (60 x 0.8), on a client and on a dedicated server
:::

## 1. Does the bullet hit?

Every bullet at a zombie rolls the gun's hit chance, a percent worked out from the gun, your skill, the distance and what is slowing you down.

The roll is `Rand.Next(100) <= chance`, so a chance of 100 always hits and the code keeps the result between 5 and 100. :cite[(`zombie/CombatManager.java:680-696`, `zombie/CombatManager.java:2825-2830`, `zombie/combat/CombatConfigKey.java:33-35`)] For a zombie, your own game rolls it, using the chance it works out when the shot starts. :cite[(`zombie/CombatManager.java:1077-1080`, `zombie/CombatManager.java:2431-2438`, `zombie/network/fields/hit/Hit.java:124-127`)]

```
start  = min(HitChance, 95) + AimingPerkHitChanceModifier x Aiming level   (4 per level on every real vanilla gun)
range  = the better of two curves, each minus your remaining aim delay (section 2):
         no-sights curve: inside 3.5 tiles   + 40 x (3.5 - d) / 3.5   (x2 against a zombie on the ground)
                          past 3.5 tiles     - (d - 3.5) x (15 + 0.7 x (d - 3.5))
         sights curve:    inside the gun's sight range, up to + 15, peaking in its middle
                          before its near end, past 3.5 tiles:  - (min - d) x (4 + 0.3 x (min - d))
                          past its far end   - (d - far) x (4 + 0.3 x (d - far))
penalties:
         moving      time spent moving (0 to 70) x (1 - (Aiming + Nimble) / 40), x d / 10 (more past 10 tiles)
         darkness    50 x (1 - light / 0.75) when the target's square is darker than 0.75, minus a sight's low-light bonus
         weather     outdoors only: wind x (6 - 0.2 x Aiming) x d (x0.6 with Marksman) + rain x d x 0.5,
                     both x1.5 unless you are Outdoorsy; fog x 10 x d (not with a thermal sight);
                     all of it scaled down inside 3.5 tiles and x the Firearm Weather Multiplier
         arm pain    0.1 per point of pain in your arms and hands
         moodles     Panic and Stress: level x (4 + 0.5 x d); Tired and Endurance: level x 2.5;
                     Drunk: level x (4 + 0.5 x d); all x the Firearm Moodle Multiplier
         headgear    100 - 100 / (the product of 1 / each worn item's vision modifier), with the Firearm Headgear Effect option on
bonus:   + 20 with Marksman
point blank (d under 3.5 tiles): penalties x (d / 3.5) / 5, and the chance / (1.1 x d / 3.5)
result:  rounded down, kept between 5 and 100
```

`d` is the distance in tiles. :cite[(`zombie/CombatManager.java:2685-2830`, `zombie/CombatManager.java:2514-2591`, `zombie/CombatManager.java:2593-2677`, `zombie/CombatManager.java:2616-2667`, `zombie/combat/CombatConfigKey.java:22-59`)]

Some notes on the parts players ask about:

- **Sight range.** Each gun has a near and a far sight range. The near end is 2 tiles on the handguns and rifles and 3 on the shotguns; the far end runs from 5 to 6.5 on the handguns, 10 on the rifles, 8 or 9 on the full-length shotguns and 3 on the sawed-off ones. :cite[(`media/scripts/generated/items/weapon.txt:11464-11540`)] Every Aiming level pulls the near end in by 1/30 and pushes the far end out by 1/30, Eagle Eyed adds 20% to the far end, and Short Sighted without glasses shrinks the far end to the near end. A scope or other sight replaces the gun's own range. :cite[(`zombie/inventory/types/HandWeapon.java:1607-1630`)]
- **Moving.** The time spent moving climbs while you walk and falls while you stand still, and it is capped at 70. :cite[(`zombie/characters/IsoPlayer.java:2094-2099`, `zombie/characters/IsoGameCharacter.java:11261-11263`, `zombie/CombatManager.java:2569-2579`)] At 5 tiles, a full 70 is a 35-point penalty.
- **Headgear.** Your worn items multiply: each one with a vision modifier divides your vision by it, and the penalty is 100 minus 100 over that result. :cite[(`zombie/characters/IsoGameCharacter.java:15404-15429`, `zombie/CombatManager.java:2813-2817`)] A gas mask, a hockey mask, a football or full crash helmet, eyepatch or welding goggles have a vision modifier of 0.5, a 50-point penalty. Safety, ski or swimming goggles and monocles have 0.75, a 25-point penalty. Two items multiply. :cite[(`media/scripts/generated/items/clothing.txt`)]
- **Other targets.** A zombie has no movement term in this formula. If the target is another player, a sprinting target costs 25, a running one 15 and a walking one 5. :cite[(`zombie/CombatManager.java:2781-2796`)]

Worked numbers for an M9 Pistol, Strength 5, Aiming 0, rested, standing still, in daylight and calm weather:

| M9 Pistol, aim delay 0 | Hit chance |
|---|---|
| 2 tiles | 100% |
| 3 tiles | 60% |
| 5 tiles | 56% |
| 8 tiles | 40% |
| 10 tiles | 29% |
| 15 tiles | 5% |
| 5 tiles, Aiming 10 | 100% |
| 5 tiles, right after walking (70 moving) | 21% |
| 5 tiles, dark (light 0.2) | 20% |
| 5 tiles, wearing a gas mask | 6% |

Rifles and shotguns, same conditions, aim delay 0:

| Distance | MSR788 Rifle, Aiming 0 | MSR788 Rifle, Aiming 10 | JS-2000 Shotgun, Aiming 0 |
|---|---|---|---|
| 5 tiles | 62% | 99% | 78% |
| 10 tiles | 50% | 98% | 55% |
| 15 tiles | 22% | 82% | |
| 20 tiles | 5% | 50% | |

We calculated these from the formula above; we have not measured them in game. "Light 0.2" is an example value for a dark street. The 42.21 page showed one point more in most cells; we recomputed every cell here with the code's own rounding down, so the figures moved.

## 2. How long a gun takes to settle

A raised gun starts with an aim delay equal to its aiming time, and every point of delay left comes off the range bonus, so snap shots are worse.

The delay starts at the gun's aiming time (x0.8 Dextrous, x1.2 All Thumbs, x1.5 in a vehicle) when you are not aiming. :cite[(`zombie/characters/IsoGameCharacter.java:11227-11236`)] While you aim and the recoil lock has run out, it drains by 0.625 per game-time unit, faster by 5% per Aiming level and 10% for Marksman. :cite[(`zombie/characters/IsoGameCharacter.java:11238-11255`)] At normal speed the game runs 48 of those units per real second on a client, and a dedicated server comes out at the same 48 because it locks to 10 frames per second and scales each cycle. :cite[(`zombie/GameTime.java:981-986`, `zombie/FPSTracking.java:46`, `zombie/network/GameServer.java:859`, `zombie/network/GameServer.java:1166`)] That makes the drain 30 per second at Aiming 0, 45 at Aiming 10, so the M9's 25 is gone in 0.8 seconds and the MSR7T Tactical Rifle's 65, the slowest long gun in the scripts, in 2.2.

Each shot then adds a quarter of the gun's recoil delay plus a twentieth of its aiming time, and the total is kept between 0 and the gun's aiming time. :cite[(`zombie/CombatManager.java:4098-4106`, `zombie/combat/CombatConfigKey.java:28-29`)] The swing state applies that when the shot starts, so by the code's order your next shot already carries one shot's worth of delay when the bullet rolls. :cite[(`zombie/ai/states/SwipeStatePlayer.java:161-175`, `zombie/ai/states/SwipeStatePlayer.java:155-156`)]

For the M9 that is 12 / 4 + 25 / 20, or 4.25 points:

| M9 Pistol at 5 tiles, Aiming 0 | Aim delay | Hit chance |
|---|---|---|
| Settled | 0 | 56% |
| One shot's worth | 4.25 | 53% |
| Half a raised gun | 12.5 | 46% |
| Just raised | 25 | 35% |

How much of that delay is still there when the bullet leaves is not verified: it depends on how long the shot animation takes against the recoil lock, which we did not time.

**Recoil.** The recoil delay is a lock after each shot. You cannot start another attack until it has run down, and your aim delay does not drain while it is above your Aiming level's small allowance. :cite[(`zombie/characters/IsoPlayer.java:2569`, `zombie/characters/IsoGameCharacter.java:9056-9058`, `zombie/characters/IsoGameCharacter.java:11244`)] 

The lock is the gun's RecoilDelay times (1 - Aiming / 40), times (1 - (Strength x 2 - 10) / 40), times 1.3 if you hold something in the other hand. :cite[(`zombie/inventory/types/HandWeapon.java:1297-1307`)] 

At Strength 5 and Aiming 0 it drains at 30 per second, so the M9's 12 is 0.4 seconds and the JS-2000's 30 is 1.0. In Auto fire mode the swing state sets the lock to 0. :cite[(`zombie/CombatManager.java:1400`, `zombie/CombatManager.java:1476-1478`)] The animation may take longer than the lock; we did not time it.

**Moving.** The moving penalty grows by 1.25 per unit while you move and shrinks by 0.625 while you stand, so at 48 units per second it fills its cap of 70 in about 1.2 seconds of walking and empties in about 2.3 seconds standing still. :cite[(`zombie/characters/IsoPlayer.java:2094-2099`, `zombie/characters/IsoGameCharacter.java:11261-11263`)]

## 3. What a failed roll does

The sandbox option **Firearms Use Damage Chance** decides what a failed hit roll means, and in 42.22 it means the same thing in single player and multiplayer.

- **Disabled:** a failed roll is a miss.
- **Zombies only** (the default): against a zombie, a failed roll is a hit that does no damage (the game counts it as "Bullets Damage Ignored"); against a player it is a miss.
- **All types of target:** a failed roll is a no-damage hit against anything.

:cite[(`zombie/SandboxOptions.java:252`, `media/lua/shared/Translate/EN/Sandbox.json:1012-1016`, `media/lua/shared/Sandbox/Apocalypse.lua:175`)]

```java
boolean hit = Rand.Next(100) <= hitChance;
if (!hit) {
   this.incrementStatistic(owner, weapon, hitObject, "Bullets Chance Missed");
   if (SandboxOptions.instance.firearmUseDamageChance.getValue() != 3
      && (SandboxOptions.instance.firearmUseDamageChance.getValue() != 2 || !(hitObject instanceof IsoZombie))) {
      return null;
   }

   this.incrementStatistic(owner, weapon, hitObject, "Bullets Damage Ignored");
   ignoreHitCountDamage = true;
}
```

:cite[(`zombie/CombatManager.java:680-696`)]

The flag goes into the hit itself, `hitObject.Hit(weapon, owner, damage, hitData.isIgnoreDamage(), ...)`, and the zombie's damage step is skipped when it is set. :cite[(`zombie/CombatManager.java:1199`, `zombie/characters/IsoGameCharacter.java:6253-6257`)] The no-damage hit still counts as a hit for the reaction: the zombie still gets its hit reaction, and it is knocked down if the shot's critical flag is set. :cite[(`zombie/characters/IsoZombie.java:4211-4224`)] A hit with ignored damage also earns no weapon XP in single player. :cite[(`zombie/CombatManager.java:1207-1212`)]

In 42.21 the single-player code applied the flag only after the damage had been dealt, so a failed roll still hurt the zombie. 42.22 passes the flag first, and we found no remaining difference between single player and multiplayer here. In multiplayer the shooter's game rolls a zombie hit and sends the flag to the server, which applies it. :cite[(`zombie/network/fields/hit/Hit.java:124-127`, `zombie/network/fields/hit/Hit.java:150-151`)]

## 4. The damage

A bullet that hits does its damage roll times a short chain of factors, and your skills are not in it.

```
damage = a random number between the gun's MinDamage and MaxDamage
         / 5              a second zombie standing in the exact line of the first (not shotgun pellets)
         x body part      head x3, arm or leg x0.05, body x1
         x (1 - zombie armor against bullets / 100)
         x 2              shotgun pellets only (x1 for every other gun)
         x 1.5            unless the zombie is facing you (within about 72 degrees)
         x 1.5            any target that is not a player
         x 0.3
         x 0.5            a two-handed gun that is not held in both hands
         x max(2, the gun's CritDmgMultiplier)   on a critical
the result comes off the zombie's health
```

:cite[(`zombie/CombatManager.java:804-813`, `zombie/CombatManager.java:861-866`, `zombie/CombatManager.java:954-957`, `zombie/CombatManager.java:3980-4004`, `zombie/CombatManager.java:776-802`, `zombie/characters/IsoGameCharacter.java:6191`, `zombie/characters/IsoGameCharacter.java:6226-6249`, `zombie/CombatManager.java:3890-3901`, `zombie/characters/IsoGameCharacter.java:16398-16403`)]

That x0.3 is the base of the weapon-level factor from the melee chain. A gun has no weapon category, so its level is 0 and the factor stays 0.3: your Aiming skill does not raise gun damage, only the chance to hit and to score a critical. :cite[(`zombie/CombatManager.java:3880-3888`, `zombie/characters/IsoGameCharacter.java:11304-11346`, `zombie/combat/CombatConfigKey.java:14`)] The melee x0.15 reduction is for melee weapons only, and a gun skips the hit counter, Strength, arm pain and moodle steps. :cite[(`zombie/CombatManager.java:3872-3878`, `zombie/CombatManager.java:822-853`, `zombie/CombatManager.java:864-935`)] The [melee page](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits) has the shared part of the chain.

Zombie armor against bullets is `1.5 x the bullet defense of its clothes on that spot x Zombies Armor Factor` (default 2), capped at Zombie Max Defense (default 85). :cite[(`zombie/CombatManager.java:3943-3957`, `zombie/inventory/types/Clothing.java:951-963`, `zombie/SandboxOptions.java:2119-2120`)]

**Which body part.** When the zombie is the one under your reticle, the physics library reports the body part under your aim, and that part is used. :cite[(`zombie/CombatManager.java:2966-2978`)] Otherwise the game rolls a shot direction from the angle between your facing and the zombie's, and picks a hit reaction from it. A critical from the north or south direction is a head shot, a critical from the left or right is a head shot one time in four, and other hits land on the spine, belly, an arm or a leg. :cite[(`zombie/CombatManager.java:2922-2960`, `zombie/CombatManager.java:3007-3044`, `zombie/CombatManager.java:3046-3085`)] [Hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics) has the angle odds.

| Gun (damage, critical multiplier) | Body shot | Head shot | Critical head shot | Code |
|---|---|---|---|---|
| M9 Pistol (0.6 to 1.0, x4) | 0.36 | 1.08 | 4.32 | `media/scripts/generated/items/weapon.txt:11464-11540` |
| Patrol Revolver (0.95 to 1.4, x4) | 0.53 | 1.59 | 6.35 | `media/scripts/generated/items/weapon.txt:11716-11797` |
| M16 Assault Rifle (1.0 to 1.6, x4) | 0.59 | 1.76 | 7.02 | `media/scripts/generated/items/weapon.txt:11017-11110` |
| MSR788 Rifle (1.2 to 2.0, x4) | 0.72 | 2.16 | 8.64 | `media/scripts/generated/items/weapon.txt:11374-11450` |
| JS-2000 Shotgun, one pellet of 9 (1.5 to 2.2, x12) | 1.67 | 5.00 | 59.9 | `media/scripts/generated/items/weapon.txt:11962-12046` |

Average rolls, zombie facing you, no armor, two hands on the gun. A Normal zombie has 1.5 to 1.8 health, a Tough one 3.5 to 3.8, a Fragile one 0.5 to 0.8, and the default Apocalypse Toughness, Random, gives anything from 0.5 to 3.8. :cite[(`zombie/VirtualZombieManager.java:343-357`, `media/lua/shared/Sandbox/Apocalypse.lua:198`)] Against a Normal zombie, one shotgun pellet to the body nearly does it, and nine of them make the shotgun the most forgiving gun in the game at short range.

## 5. Critical hits

A critical is one roll per shot, made on the first target in the game's list when you press the attack, and it covers every bullet of that shot.

```
crit = the gun's CriticalChance
       + AimingPerkCritModifier x Aiming level     (6 per level; 10 for the JS-2000 and JS-3T shotguns)
       + the same range curves as the hit chance, minus the aim delay
       - moodles - weather and darkness - moving   (the same penalties as above; not arm pain or headgear)
       + 10 with Marksman
       - 6 against Tough zombies, + 6 against Fragile ones
       kept between 10 and 90
       + 5 if you shoot from behind
a critical if a 0 to 99 roll is below crit
```

The first target is normally the closest one. :cite[(`zombie/combat/RangeTargetComparator.java:17-49`, `zombie/CombatManager.java:3335-3337`)]

:cite[(`zombie/characters/IsoPlayer.java:3849-3870`, `zombie/characters/IsoPlayer.java:3916-3926`, `zombie/CombatManager.java:3195-3225`, `zombie/CombatManager.java:3208-3214`, `zombie/CombatManager.java:3380-3381`)]

| Gun | CriticalChance | At 5 tiles, Aiming 0 | At 5 tiles, Aiming 10 |
|---|---|---|---|
| M9 Pistol | 20 | 26% | 90% |
| MSR788 Rifle | 30 | 42% | 90% |
| JS-2000 Shotgun | 70 | 83% | 90% |

Aim delay 0, in front of the zombie; add 5 points from behind. The roll is made when you press the attack, before the shot's own delay is added.

A critical multiplies the damage by the gun's critical multiplier, at least x2. :cite[(`zombie/characters/IsoGameCharacter.java:6245-6247`)] It knocks the zombie down, from the same flag. :cite[(`zombie/characters/IsoZombie.java:4222-4224`)] It also speeds up your next swing by 10%. :cite[(`zombie/CombatManager.java:3382-3384`, `zombie/CombatManager.java:174`)]

When the game picks the body part itself, a critical turns a shot from the north or south direction into a head shot. The 42.21 page said the knockdown was a second roll after the damage; in 42.22 the knockdown reads the one critical flag, and the roll is made once per shot. :cite[(`zombie/CombatManager.java:3380-3384`, `zombie/CombatManager.java:2922-2960`)]

A failed hit roll does not cancel the critical: the damage multiplier is skipped for an ignored hit, but the knockdown still reads the flag. :cite[(`zombie/characters/IsoGameCharacter.java:6245-6247`, `zombie/characters/IsoZombie.java:4224`)]

## 6. Shotguns and piercing rounds

A shotgun fires 9 pellets and each one that lands is its own hit; a rifle bullet can carry on into a second zombie in the same line, but the second one takes a fifth.

All five shotguns have `Projectilecount = 9` and `RangeFalloff = true`; the physics library decides how many pellets land on which zombie. :cite[(`media/scripts/generated/items/weapon.txt:11204-11373`, `media/scripts/generated/items/weapon.txt:11962-12130`, `media/scripts/generated/items/weapon.txt:20060-20146`, `zombie/CombatManager.java:2207-2216`, `zombie/CombatManager.java:2259-2278`)] Each pellet entry gets its own hit chance and its own roll, up to the gun's MaxHitcount of 9. :cite[(`zombie/CombatManager.java:2347`, `zombie/CombatManager.java:2397-2438`)] Weapon XP is awarded once per shotgun shot, not once per pellet. :cite[(`zombie/CombatManager.java:1207-1212`)]

Seven rifles carry `PiercingBullets = true`, but only the M16 Assault Rifle and the JS-14 Rifle have a MaxHitcount of 2, so only those two can hit a second zombie. :cite[(`media/scripts/generated/items/weapon.txt:11017-11110`, `media/scripts/generated/items/weapon.txt:19970-20059`, `media/scripts/generated/items/weapon.txt:11080`, `media/scripts/generated/items/weapon.txt:11173`, `media/scripts/generated/items/weapon.txt:11432`, `media/scripts/generated/items/weapon.txt:12190`, `media/scripts/generated/items/weapon.txt:20029`, `media/scripts/generated/items/weapon.txt:20287`, `media/scripts/generated/items/weapon.txt:20378`)] The game keeps only targets within 1 degree of the leading target's direction. :cite[(`zombie/CombatManager.java:2408-2414`)] A second zombie that stands exactly in line with the leading target takes the damage roll divided by 5. :cite[(`zombie/CombatManager.java:707-721`, `zombie/CombatManager.java:807-810`, `zombie/combat/CombatConfigKey.java:59`)]

## 7. Shooting from a vehicle

In a vehicle the hit chance gets its own penalties, as the code reads, and none of them apply on foot.

Your aim delay starts x1.5 higher. :cite[(`zombie/characters/IsoGameCharacter.java:11234`)] The hit chance loses 3 per km/h of the vehicle's speed for the driver and 2 for a passenger, and a driver gets a hit chance of 0 with a two-handed gun. :cite[(`zombie/CombatManager.java:2689-2758`)] The code compares the target's direction with a side direction of the vehicle: past a set angle the hit chance is 0, and inside it an angle penalty of up to 40 applies before extra factors for two-handed guns and for shooting backwards. :cite[(`zombie/CombatManager.java:2715-2754`, `zombie/combat/CombatConfigKey.java:52-55`)] We did not test any of this in a running game.

## 8. Noise, range and what changes it

A shot's noise comes from the shot itself, and the settings, traits and skills in the table each change one or two steps of the hit chance, the damage or the critical.

A shot makes a noise of the gun's `SoundRadius` times the **Firearm Noise Multiplier**, halved indoors. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443-450`, `media/scripts/generated/items/weapon.txt:11464-11540`)] [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) and [What makes noise and how far](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far) have the radii and who hears them. The gun's `MaxRange` is handed to the physics library as the range to search and to draw the tracer, and what the library does at the edge of that range we cannot read. :cite[(`zombie/CombatManager.java:2205-2216`, `zombie/CombatManager.java:3600`, `zombie/inventory/types/HandWeapon.java:905-907`)]

| Setting, trait or skill | Effect | Code |
|---|---|---|
| Firearms Use Damage Chance | what a failed roll means (section 3) | `zombie/CombatManager.java:680-696` |
| Firearm Moodle Multiplier | scales every moodle penalty (0 turns them off) | `zombie/CombatManager.java:2613` |
| Firearm Weather Multiplier | scales wind, rain and fog (0 turns them off) | `zombie/CombatManager.java:2648` |
| Firearm Headgear Effect | the headgear penalty on or off | `zombie/CombatManager.java:2813` |
| Firearm Noise Multiplier | how far shots are heard | `media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443-450` |
| Zombie Toughness, Zombies Armor Factor, Zombie Max Defense | zombie health, crit chance, armor | `zombie/VirtualZombieManager.java:343-357`, `zombie/CombatManager.java:3943-3957`, `zombie/characters/IsoPlayer.java:3916-3924` |
| Aiming | +4 hit and +6 crit per level, wider sight range, faster aim, smaller movement penalty, less wind, shorter recoil | `zombie/CombatManager.java:2688`, `zombie/inventory/types/HandWeapon.java:1297-1307`, `zombie/inventory/types/HandWeapon.java:1607-1630` |
| Nimble | smaller movement penalty | `zombie/CombatManager.java:2569-2571` |
| Marksman | +20 hit, +10 crit, less wind, faster aim | `zombie/CombatManager.java:2798-2800`, `zombie/characters/IsoPlayer.java:3868-3870` |
| Outdoorsy | no x1.5 on wind and rain | `zombie/characters/traits/CharacterTraits.java:163-165` |
| Eagle Eyed, Short Sighted | longer or shorter sight range | `zombie/inventory/types/HandWeapon.java:1624-1629` |
| Dextrous, All Thumbs | aiming starts x0.8 or x1.2 | `zombie/characters/IsoGameCharacter.java:11232-11233` |
| Strength | shorter recoil lock (a stronger character recovers faster) | `zombie/inventory/types/HandWeapon.java:1303` |

## 9. Multiplayer

On a multiplayer server the shooter's game works out a zombie hit and the server applies it; for a player target the server does the rolling itself.

For a zombie target, the shooter's game rolls the hit, works out the damage and sends that number, and the server takes it off the zombie's health. :cite[(`zombie/CombatManager.java:1077-1080`, `zombie/CombatManager.java:656-658`, `zombie/network/fields/hit/Hit.java:124-127`, `zombie/network/fields/hit/Hit.java:150-151`)] When the target is another player, the server rolls the hit chance and works out the damage itself. :cite[(`zombie/network/fields/hit/Hit.java:78-85`, `zombie/network/fields/hit/Hit.java:124-127`)]

> **Warning for server owners:** for a hit on a zombie, the server accepts the damage figure the client sends as long as it is between 0 and 200. :cite[(`zombie/network/fields/hit/Hit.java:32-33`, `zombie/network/fields/hit/Hit.java:101-103`, `zombie/network/fields/hit/Hit.java:150`)] Keep logging enabled.

## Where to go next

- [How melee damage and critical hits work](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits): the shared part of the damage chain.
- [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you): the noise every shot makes.
- [Hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics): how a shot picks its body part, for the curious.
- [Combat and Animation](/pz/build-42/modding/foundations/combat-and-animation): what changed about guns in Build 42, for modders.

:::callout[How we know]{kind=proof}
Every number and rule above is read from the 42.22 Java, the weapon and clothing scripts and the sandbox files, and the worked tables are calculated from them with the code's own rounding down. We did not measure any of it in a running game. Not tested: the damage a failed roll leaves in single player (read from the code's order, not seen), the timing of the shot against the recoil lock (so how much aim delay is left when the bullet rolls), vehicle shooting, and how multiplayer plays out on a live server, which needs a server test with the evidence in the server log. The physics library that picks the targets and the body part is native code we cannot read.
:::
