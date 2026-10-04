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
  Which zombie a bullet can reach is decided by the game's physics library;
  the hit chance on top of it is plain Java: the gun's HitChance plus 4 per
  Aiming level, a range bonus inside the gun's sight range, and penalties for
  moving, darkness, weather, moodles and headgear. A bullet does its damage
  roll x body part x 1.5 x 0.3, with criticals multiplying it again. The
  formulas and worked numbers from the Build 42.21 code.
last_updated: '2026-10-04'
---
# How firearm accuracy and damage work

Outcast, guns in Build 42 feel very different from Build 41, and the arguments about them are louder. We read the 42.21 code. Most of the answer is plain arithmetic we can show you; one part lives in a library we cannot read, and we tell you which.

## The short answer

For the default settings (the Apocalypse preset: Firearms Use Damage Chance "Zombies only", the moodle and weather multipliers at 1, headgear effect on):

- **Which zombies a shot can reach, and which body part sits under your reticle, come from the game's physics library** (a native library, not Java). We cannot read it. Everything below happens after it has picked the targets.
- **Hit chance** = the gun's HitChance (50 for most guns, 45 for the JS-14, 65 to 70 for shotguns) + 4 per Aiming level + a range bonus (up to +15 inside the gun's sight range, falling off quickly past it) - penalties for moving, darkness, weather, arm pain, moodles and headgear. Inside 3.5 tiles it jumps towards 100%. The result is kept between 5% and 100%.
- **Damage** per bullet = the gun's damage roll x body part (head x3, arm or leg x0.05) x 1.5 x 0.3, x1.5 more if the zombie is turned away, and x the gun's critical multiplier on a critical. No Strength, no skill bonus, no hit counter, none of the melee x0.15.
- An M9 Pistol bullet does about 0.36 to the body and 1.08 to the head. A Normal zombie has 1.5 to 1.8 health: about **5 body shots or 2 head shots**, and a critical head shot (x4) kills any zombie.
- **Critical chance** = the gun's CriticalChance + 6 per Aiming level (10 for the JS-2000 and JS-3T) + the same range bonus - the same penalties (+10 with Marksman), kept between 10% and 90%. Whether the zombie is knocked down is rolled again, separately, with the same chance.

| M9 Pistol, Aiming 0, rested, standing still, aim settled, daylight | Hit chance |
|---|---|
| 2 tiles | 100% |
| 3 tiles | 61% |
| 5 tiles | 57% |
| 8 tiles | 41% |
| 10 tiles | 30% |
| 15 tiles | 6% |
| 5 tiles, Aiming 10 | 100% |
| 5 tiles, right after walking | 22% |
| 5 tiles, dark (light 0.2) | 21% |
| 5 tiles, wearing a gas mask | 7% |

These come from the formula below; we have not measured them in game. "Light 0.2" is an example value for a dark street.

## The hit chance

```
start  = min(HitChance, 95) + AimingPerkHitChanceModifier x Aiming level   (4 per level on every real vanilla gun)
range  = the better of two curves, each minus your remaining aim delay (see below):
         no-sights curve: inside 3.5 tiles   + 40 x (3.5 - d) / 3.5   (x2 against a zombie on the ground)
                          past 3.5 tiles     - (d - 3.5) x (15 + 0.7 x (d - 3.5))
         sights curve:    inside the gun's sight range, up to + 15, peaking in its middle
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
         headgear    100 - 100 x your worn vision modifiers (with the Firearm Headgear Effect option on)
bonus:   + 20 with Marksman
point blank (d under 3.5 tiles): penalties x (d / 3.5) / 5, and the chance / (1.1 x d / 3.5)
result:  rounded down, kept between 5 and 100; it hits if a 0 to 99 roll is at most the result
```

`d` is the distance in tiles. Some notes on the parts players ask about:

- **Sight range.** Each gun has a near and a far sight range: 2 to 6 tiles for the handguns, 2 to 10 for the rifles, 3 to 8 or 9 for the full-length shotguns, exactly 3 for the sawed-off ones. Every Aiming level pulls the near end in by 1/30 and pushes the far end out by 1/30; Eagle Eyed adds 20% to the far end; Short Sighted without glasses shrinks the far end to the near end. A scope or other sight replaces the gun's own range.
- **Aim delay.** When you raise a gun, the delay starts at the gun's aiming time (25 for handguns, 30 to 65 for long guns; x0.8 Dextrous, x1.2 All Thumbs, x1.5 in a vehicle) and drains at about 30 per second at Aiming 0 (5% faster per Aiming level, 10% faster with Marksman). Each shot adds a quarter of the gun's recoil delay plus a twentieth of its aiming time. The remaining delay comes off the range bonus, so snap shots are worse.
- **Moving.** "Time spent moving" climbs to its cap of 70 in about 1.2 seconds of walking and drains in about 2.3 seconds of standing still. At 5 tiles that is a 35-point penalty right after you stop.
- **Headgear.** A gas mask, hockey mask, football or full crash helmet, eyepatch or welding goggles have a vision modifier of 0.5: a 50-point penalty. Safety, ski or swimming goggles and monocles (0.75) cost 25. Two such items multiply.

> **Proof:** Code. `zombie.CombatManager#calculateHitChanceData` (start, the better of the two curves, Marksman +20, headgear, point blank, clamp 5 to 100), `#getDistanceModifierSightless`, `#getAimDelayPenaltySightless`, `#getDistanceModifier`, `#getAimDelayPenalty`, `#getMovePenalty`, `#getWeatherPenalty` (wind, rain, fog, low light), `#getPainPenalty`, `#getMoodlesPenalty`, `#attackCollisionCheck` (`Rand.Next(100) <= chance`); `zombie.combat.CombatConfigKey` defaults (point blank 3.5, point-blank bonus 40, optimal-range bonus 15, low light 0.75 and 50, minimum 5, maximum 100); `zombie.inventory.types.HandWeapon#getMinSightRange`, `#getMaxSightRange`; `zombie.characters.IsoGameCharacter#resetAimingDelay`, `#updateAimingDelay`, `#setBeenMovingFor` (0 to 70); `zombie.characters.IsoPlayer` (moving +1.25 and still -0.625 per tick); `zombie.CombatManager#setAimingDelay`. Gun values from `media/scripts/generated/items/weapon.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Rifles and shotguns

| Distance | MSR788 Rifle, Aiming 0 | MSR788 Rifle, Aiming 10 | JS-2000 Shotgun, Aiming 0 |
|---|---|---|---|
| 5 tiles | 63% | 100% | 79% |
| 10 tiles | 51% | 99% | 56% |
| 15 tiles | 23% | 83% | |
| 20 tiles | 6% | 50% | |

Same conditions as the M9 table: rested, standing still, aim settled, daylight, calm.

### What the roll means: Firearms Use Damage Chance

The sandbox option **Firearms Use Damage Chance** decides what a failed roll does:

- **Disabled:** a failed roll is a miss.
- **Zombies only** (the default): against a zombie, a failed roll is meant to be a hit that does no damage (the game counts it as "Bullets Damage Ignored"); against a player it is a miss.
- **All types of target:** a failed roll is a no-damage hit against anything.

Here the code does something you would not guess. In **multiplayer**, the client sends each hit with an ignore-damage flag, and the server's handler passes that flag on, so a failed roll really does no damage. In **single player**, the 42.21 code only applies the flag after the hit has already been dealt: the zombie takes the full damage, the failed roll only costs you the XP for that hit, and any further zombie hit by the same shot takes none. We read this in the decompiled code and confirmed the order in the game's bytecode. We have not watched it happen in a game.

```java
boolean hit = Rand.Next(100) <= hitInfo.chance;
if (!hit) {
   StatisticsManager.getInstance().incrementStatistic(StatisticType.Player, StatisticCategory.Combat, "Bullets Chance Missed", 1.0F);
   if (SandboxOptions.instance.firearmUseDamageChance.getValue() != 3
      && (SandboxOptions.instance.firearmUseDamageChance.getValue() != 2 || hitZombie == null)) {
      continue;
   }

   StatisticsManager.getInstance().incrementStatistic(StatisticType.Player, StatisticCategory.Combat, "Bullets Damage Ignored", 1.0F);
   ignoreHitCountDamage = true;
}
```

> **Proof:** Code. `zombie.CombatManager#attackCollisionCheck`: the lines above; then `hitObject.Hit(weapon, owner, damageSplit, bIgnoreDamage, rangeDel)` is called with `bIgnoreDamage`, and only after it `bIgnoreDamage |= ignoreHitCountDamage`; the XP event `OnWeaponHitXp` is skipped when `ignoreHitCountDamage` is set. In the bytecode of `attackCollisionCheck` the `Hit` call loads local 7 and the flag set by the failed roll is local 17, OR-ed into local 7 only afterwards. `#processClientHit` puts `ignoreHitCountDamage` into the `WeaponHit` a client sends; `zombie.network.fields.hit.WeaponHit` calls `target.Hit(..., this.ignoreDamage, ...)`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. That a failed roll still damages a zombie in single player is read from the code and bytecode, not seen in a running game; a single-player test with the Firearms Use Damage Chance option at its default would settle it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The damage

```
damage = a random number between the gun's MinDamage and MaxDamage
         x body part      head x3, arm or leg x0.05, body x1
         x (1 - zombie armour against bullets / 100)
         x 2              shotgun pellets only (x1 for every other gun)
         x 1.5            unless the zombie is facing you (within about 72 degrees)
         x 1.5            any target that is not a player
         x 0.3
         x max(2, the gun's CritDmgMultiplier)   on a critical
the result comes off the zombie's health
```

That x0.3 is the weapon-level factor from the melee chain. Guns have no weapon category, so the level is always 0 and the factor never grows: **your Aiming skill does not raise gun damage**, only the chance to hit and to score a critical. Zombie armour against bullets is `1.5 x the bullet defence of its clothes on that spot x Zombies Armor Factor` (default 2), capped at Zombie Max Defense (default 85).

**Which body part.** When the zombie is the one under your reticle, the physics library reports the body part your aim is on, and that part is used. Otherwise the game picks from the angle of the shot: a critical from the front or back is a head shot, a critical from the side is a head shot one time in four, and other hits land on the body (front or back) or on the chest, an arm or a leg (side).

| Gun (damage, critical multiplier) | Body shot | Head shot | Critical head shot |
|---|---|---|---|
| M9 Pistol (0.6 to 1.0, x4) | 0.36 | 1.08 | 4.32 |
| Patrol Revolver (0.95 to 1.4, x4) | 0.53 | 1.59 | 6.35 |
| M16 Assault Rifle (1.0 to 1.6, x4) | 0.59 | 1.76 | 7.02 |
| MSR788 Rifle (1.2 to 2.0, x4) | 0.72 | 2.16 | 8.64 |
| JS-2000 Shotgun, one pellet of 9 (1.5 to 2.2, x12) | 1.67 | 5.00 | 59.9 |

Average rolls, zombie facing you, no armour. Against a Normal zombie (1.5 to 1.8 health), a single shotgun pellet to the body nearly does it; nine of them make the shotgun the most forgiving gun in the game at short range.

**Shotguns** fire 9 pellets. The physics library decides how many of them land on which zombie; each one that lands becomes its own hit with its own roll and its own damage. The M16 Assault Rifle and the JS-14 Rifle, the two piercing guns allowed two targets, can carry on into a zombie standing directly behind the first.

> **Proof:** Code. `zombie.CombatManager#attackCollisionCheck` (gun damage is the plain roll: the melee factors, the multi-hit split and the moodle steps are all skipped for ranged weapons; `rangeDel` is 1.0 for a pellet weapon and 0.5 for other guns, then x2), `#applyRangeHitLocationDamage` (head x3, arm or leg x0.05), `#calculateTotalDefense` (bullet defence for ranged), `#processHit`, `#resolveHitReaction` and `#getBodyPart` (camera target part, or the angle rules), `#processBallisticsTargets` (one hit entry per pellet), `#calculateHitInfoList` (a piercing gun keeps targets within 1 degree of the first, up to its `MaxHitcount`, which is 2 only on the M16 and the JS-14); `zombie.characters.IsoGameCharacter#processHitDamage` (x1.5 not facing, x1.5 non-player, weapon level, critical) and `#getWeaponLevel` (0 without a weapon category); `zombie.characters.IsoGameCharacter#Hit` (the hit counter needs `weapon.isMelee()`, false for guns); `zombie.inventory.types.HandWeapon` (`isMelee` is true only with a weapon category). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Code. `zombie.core.physics.BallisticsController#getTargets`, `#getSpreadData` and `#getCameraTargets` call `zombie.core.physics.Bullet.getBallisticsTargets`, `getBallisticsTargetsSpreadData` and `getBallisticsCameraTargets`, which are `native` methods in the PZBullet library. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Critical hits

```
crit = the gun's CriticalChance
       + AimingPerkCritModifier x Aiming level     (6 per level; 10 for the JS-2000 and JS-3T shotguns)
       + the same range curves as the hit chance, minus the aim delay
       - moodles - weather and darkness - moving   (the same penalties as above)
       + 10 with Marksman
       - 6 against Tough zombies, + 6 against Fragile ones
       kept between 10 and 90
a critical if a 0 to 99 roll is below crit (rolled for each zombie hit)
```

| Gun | CriticalChance | At 5 tiles, Aiming 0 | At 5 tiles, Aiming 10 |
|---|---|---|---|
| M9 Pistol | 20 | 26% | 90% |
| MSR788 Rifle | 30 | 42% | 90% |
| JS-2000 Shotgun | 70 | 83% | 90% |

A critical multiplies the damage (above) and, when the game picks the body part itself, turns a shot from the front or back into a head shot. The knockdown is a second roll: after the damage is applied, the game rolls the critical chance again for that zombie, and that second roll decides whether it falls. So a shot can be a critical for damage and leave the zombie standing, or the other way round.

> **Proof:** Code. `zombie.characters.IsoPlayer#calculateCritChance` (the ranged branch, Marksman +10, the toughness adjustment, clamp 10 to 90); `zombie.CombatManager#processHit` (the critical rolled per hit for a shot); `zombie.CombatManager#attackCollisionCheck` calls `processHit` before the damage, and `zombie.characters.IsoZombie#hitConsequences` calls it again after the damage, then sets the knockdown from `isCriticalHit()`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What changes it

| Setting, trait or skill | Effect |
|---|---|
| Firearms Use Damage Chance | what a failed roll means (above) |
| Firearm Moodle Multiplier | scales every moodle penalty (0 turns them off) |
| Firearm Weather Multiplier | scales wind, rain and fog (0 turns them off) |
| Firearm Headgear Effect | the headgear penalty on or off |
| Firearm Noise Multiplier | how far shots are heard (see [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you)) |
| Zombie Toughness, Zombies Armor Factor, Zombie Max Defense | zombie health, crit chance, armour |
| Aiming | +4 hit and +6 crit per level, wider sight range, faster aim, smaller movement penalty, less wind |
| Nimble | smaller movement penalty |
| Marksman | +20 hit, +10 crit, less wind, faster aim |
| Outdoorsy | no x1.5 on wind and rain |
| Eagle Eyed, Short Sighted | longer or shorter sight range |
| Dextrous, All Thumbs | aiming starts x0.8 or x1.2 |

## Multiplayer

From the code: the shooter's game works out the targets, the rolls and the damage, and sends each hit to the server with its ignore-damage flag; the server applies it. The difference in what a failed roll does (above) is the one we can see in the code. How it all plays out on a live server we have not tested.

> **Proof:** Unknown. Firearm hit and damage numbers on a dedicated server need a server test with the evidence in the server log. We have not run it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [How melee damage and critical hits work](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits): the shared part of the damage chain.
- [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you): the noise every shot makes.
- [Combat and Animation](/pz/build-42/modding/foundations/combat-and-animation): what changed about guns in Build 42, for modders.
