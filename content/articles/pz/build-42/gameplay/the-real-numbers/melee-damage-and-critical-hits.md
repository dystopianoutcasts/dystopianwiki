---
id: build-42-melee-damage-and-critical-hits
slug: melee-damage-and-critical-hits
title: How melee damage and critical hits work
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: intermediate
tags:
  - combat
  - melee
  - weapons
  - zombies
  - sandbox
excerpt: >-
  A melee hit is the weapon's damage roll times about a dozen factors, ending
  in a fixed x0.15. Normal zombies have 1.5 to 1.8 health, and from the fourth
  hit on every blow is multiplied again (x3, x4.5, x6). A critical needs a roll
  against the weapon's crit chance plus 3 per skill level, multiplies damage by
  at least 2 and knocks the zombie down. The full chain from the Build 42.21
  code, with worked examples.
last_updated: '2026-10-04'
---
# How melee damage and critical hits work

Outcast, the bat versus axe argument has gone on long enough. Here is what the Build 42.21 code does with every swing, from the weapon's numbers to the zombie hitting the floor, so you can settle it with arithmetic.

## The short answer

For the default settings (Weapon Multi Hit off, so one zombie per swing):

- **Melee never misses a target it reaches.** There is no hit roll; whether a swing connects is decided by reach and angle.
- **Zombie health is small.** A Normal zombie has 1.5 to 1.8 health, a Tough one 3.5 to 3.8, a Fragile one 0.5 to 0.8. The default Apocalypse preset uses **Random**: every zombie gets anything from 0.5 to 3.8.
- **Damage per hit** is the weapon's damage roll times a stack of factors (your Strength, your weapon skill, reach, angle, fatigue), ending in a fixed x0.15.
- **Hits on the same zombie get harder:** from the fourth hit on, each blow is multiplied by 3, then 4.5, then 6, and so on. No zombie takes more than a handful of hits.
- **A critical** happens when a 0 to 99 roll is below your crit chance: the weapon's crit chance plus 3 per level of its skill, kept between 10% and 90%, plus 5% if you hit from behind. A critical multiplies the damage by the weapon's critical multiplier (at least x2) and **knocks the zombie down**.
- **Hitting a zombie on the ground** with a weapon is worth x5 (or the critical multiplier, if higher), and x3 more if you strike its head.

| A new character (Strength 5, weapon skill 0), average roll, no criticals | Normal zombie (1.8) | Tough zombie (3.8) |
|---|---|---|
| Baseball Bat, zombie facing you | 6 hits | 8 hits |
| Baseball Bat, at the tip of its reach, zombie turned away | 4 hits | 5 hits |
| Axe, zombie facing you | 5 hits | 7 hits |
| Machete, zombie facing you | 4 hits | 6 hits |
| Kitchen Knife, zombie facing you | 7 hits | 9 hits |

"Facing you" rows put the zombie at the weapon's minimum reach, the closest a weapon hit lands (about half the reach for most weapons, where the reach factor is about 1; for the knife it is about x1.36). The reach factor below explains why the tip of the weapon hits about twice as hard. Criticals and ground hits shorten every row.

## The formula

```
1. base   = a random number between the weapon's MinDamage and MaxDamage
            x skill bonus     Long Blunt, Axe or Spear: 1.1 at levels 3-6, 1.2 at 7+; others 1
            x Strength        0.75 at level 0, +0.05 per level, 1.0 at 5, 1.25 at 10
            - MinDamage       if a two-handed weapon is held in one hand
            / (arm pain / 10) when your arms' pain adds up to more than 10 (at most / 30)
            x 0.8 Low Weight, 0.6 Very Low Weight, 0.4 Emaciated
2.        x 2                 the first zombie of the swing (the only one with multi-hit off)
3.        - 0.1 per Panic level and - 0.1 per Stress level, from level 2 up
4.        x Endurance and x Tired: 1, 0.5, 0.2, 0.1, 0.05 for moodle levels 0 to 4
5.        x (1 - zombie armour / 100)
6.        x reach factor      2 x distance / the weapon's MaxRange (counted as 1 if under 0.3)
7.        x 1.5               unless the zombie is facing you (within about 72 degrees)
8.        x 1.5               any target that is not a player
9.        x (0.3 + 0.1 x weapon level)
10.       x max(5, crit multiplier)   if the attack is aimed at a zombie on the floor
11.       x max(2, crit multiplier)   if the hit is a critical
12.       x 0.5               if a two-handed weapon is held in one hand (again)
13.       x (hits so far - 2) x 1.5   from the 4th hit on this zombie: x3, x4.5, x6 ...
14.       x 0.15
the result comes off the zombie's health; at 0 it dies
```

A few of those need words:

- **Reach factor (step 6).** The farther along the weapon's reach the zombie stands, the harder the hit: at the very tip it is about x2, at half the reach x1. Below 15% of the reach the code treats it as x1 again. A zombie closer than the weapon's MinRange gets shoved instead (or, with a knife, stabbed at close range), and MinRange is about half of MaxRange for most weapons, so weapon hits land between about x1 and x2.
- **Zombie armour (step 5).** `(the scratch defence of the zombie's clothes on the spot hit x 0.5 + their bite defence) x Zombies Armor Factor`, capped at Zombie Max Defense. With the defaults (factor 2, cap 85) a zombie in a leather jacket takes 80% less on the arms and torso, and heavier gear reaches the 85% cap.
- **Weapon level (step 9).** For an axe it is your Axe skill. For every other weapon type the count starts at minus one, so a Long Blunt 3 character with a bat is treated as level 2, and level 0 or 1 both give x0.3. That is what the 42.21 code does; whether it is intended, we cannot tell.
- **Head and legs.** Only attacks on a zombie lying on the floor pick a hit location: a head strike is x3, a leg or foot strike x0.05, a spine strike x1. A floor swing that finds none of those misses.
- **Stomping** replaces steps 1 to 3 with 0.7 to 1.0 plus 0.2 per Strength level, halved without shoes or multiplied by your shoes' stomp power, and skips steps 7 and 10.
- **Dull blades.** On a weapon with sharpness, the top of the damage range shrinks: `MaxDamage = MinDamage + (MaxDamage - MinDamage) x (sharpness + 1) / 2`.

> **Proof:** Code. `zombie.CombatManager#attackCollisionCheck` (steps 1 to 4 and 6; `split` starts at 1 and the first target gets `damage / 0.5`; the floor bone checks, head `hitHead`, legs `hitLegs`, no bone `continue`; the stomp value), `#calculateAttackVars` (a target closer than MinRange: knife close kill or shove), `#calculateHitChanceData` (melee returns the maximum, 100), `#applyMeleeHitLocationDamage`, `#calculateTotalDefense` and `#applyTotalDefense` (step 5, head x3, legs x0.05), `#applyWeaponLevelDamageModifier`, `#applyPlayerReceivedDamageModifier`, `#applyOneHandedDamagePenalty`, `#applyGlobalDamageReductionMultipliers`; `zombie.combat.CombatConfigKey` defaults (base 0.3, increment 0.1, non-player 1.5, head 3.0, leg 0.05, one-handed 0.5, global melee 0.15); `zombie.inventory.types.HandWeapon#getDamageMod`, `#getMaxDamage`; `zombie.characters.IsoGameCharacter#getHittingMod`, `#getWeaponLevel`; `zombie.characters.traits.CharacterTraits#getTraitDamageDealtReductionModifier`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

The tail of the chain, as the game runs it:

```java
damage = CombatManager.getInstance().applyPlayerReceivedDamageModifier(this, damage);
damage = CombatManager.getInstance().applyWeaponLevelDamageModifier(wielder, damage);
if (wielder instanceof IsoPlayer player && wielder.isAimAtFloor() && !bIgnoreDamage && !player.isDoShove() && !weapon.isRanged()) {
   damage *= Math.max(5.0F, weapon.getCriticalDamageMultiplier());
}

if (wielder.isCriticalHit() && !bIgnoreDamage) {
   damage *= Math.max(2.0F, weapon.getCriticalDamageMultiplier());
}

return CombatManager.getInstance().applyOneHandedDamagePenalty(wielder, weapon, damage);
```

And the hit counter that makes every zombie fold in the end:

```java
if (weapon.isMelee() && !bIgnoreDamage && this.isZombie()) {
   IsoZombie zed = (IsoZombie)this;
   zed.setHitTime(zed.getHitTime() + 1);
   if (zed.getHitTime() >= 4 && !bRemote) {
      damageSplit *= (zed.getHitTime() - 2.0F) * 1.5F;
   }
}
```

> **Proof:** Code. `zombie.characters.IsoGameCharacter#processHitDamage` (the first excerpt; x1.5 when the dot product of your direction to the zombie and its facing is above -0.3, never for a shove or stomp), `#Hit` (the second excerpt; the counter is never lowered, only reset when the zombie object is reused), `#hitConsequences` (x0.15, then `applyDamage`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Zombie health

| Zombie Toughness | Health of a zombie the world spawns |
|---|---|
| Tough | 3.5 to 3.8 |
| Normal | 1.5 to 1.8 |
| Fragile | 0.5 to 0.8 |
| Random (default preset) | 0.5 to 3.8 |

A corpse that rises gets 1.8 to 2.1 under Normal, and a zombie that was playing dead gets 0.5 to 0.8.

> **Proof:** Code. `zombie.VirtualZombieManager` (the toughness block where real zombies are created, 0.5 to 0.8 for fake-dead zombies); `zombie.iso.objects.IsoDeadBody` (1.8 to 2.1 under Normal when a corpse reanimates); `zombie.characters.IsoZombie#resetForReuse`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Critical hits

```
crit = the weapon's CriticalChance   (x sharpness, 0 to 1, on weapons that have it)
       - a third of it    two-handed weapon held in one hand
       - a fifth of it    if you swing without having held aim for a split second
       + 3 x your level in the weapon's skill
       - 5 x Endurance moodle level - 5 x Heavy Load level - 1.3 x Panic level
       - 6 against Tough zombies, + 6 against Fragile ones
       kept between 10 and 90
       + 5 if you attack from behind
a critical if a 0 to 99 roll is below crit
```

The skill counted is the weapon's own: Axe, Long Blade, Spear, Short Blade or Short Blunt, and Long Blunt for anything else.

What a critical does:

- damage x the weapon's critical multiplier, at least x2 (step 11);
- the zombie is **knocked down**;
- your swing speeds up by 10%.

Special cases:

- **Knives** can only critical with the close-range stab: when the zombie is inside the knife's minimum reach and no more than one zombie is chasing you. That stab from behind on a zombie that has not noticed you is always a critical, and a knife-kill hit (the game's KnifeDeath reaction) is multiplied by 1000.
- An item tagged "no criticals" never scores one; a weapon set to always knock down counts as 100%.
- Two +30 bonuses exist in the code (an attack from behind on an unaware zombie, and a spear lunge from more than 1.25 tiles), but they only apply with empty hands or an item tagged as a fake spear.

| Weapon (CriticalChance, multiplier) | Crit at skill 0 | Crit at skill 5 | Crit at skill 10 |
|---|---|---|---|
| Baseball Bat (40, x2) | 40% | 55% | 70% |
| Crowbar (20, x2.5) | 20% | 35% | 50% |
| Axe (20, x5) | 20% | 35% | 50% |
| Machete (20, x5, at full sharpness) | 20% | 35% | 50% |
| Katana (35, x6, at full sharpness) | 35% | 50% | 65% |

Rested, calm, two hands on a two-handed weapon, aim held, zombie facing you; add 5 points from behind. Sharpness scales the chance itself, so a half-dull machete starts at 10.

> **Proof:** Code. `zombie.characters.IsoPlayer#calculateCritChance` (the melee branch: two-handed a third, `chargeTime < 2` a fifth, skill x3, moodles, toughness 6, clamp 10 to 90); `zombie.CombatManager#pressedAttack` (+5 from behind, the two +30 cases, the guaranteed stab from behind, knife rules, no-criticals tag, swing speed x1.1); `zombie.characters.IsoZombie#hitConsequences` (knocked down on a critical); `zombie.inventory.types.HandWeapon#getCriticalChance` and `#getCriticalDamageMultiplier` (sharpness); `zombie.CombatManager#attackCollisionCheck` (knife kill `rangeDel *= 1000`); weapon values in `media/scripts/generated/items/weapon.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What changes it

| Setting, trait or skill | Effect |
|---|---|
| Zombie Toughness | zombie health (table above), and crit chance -6 / +6 |
| Weapon Multi Hit | lets some weapons hit several zombies; each extra one takes less (the x2 for the first becomes x1, x0.67, x0.5 ...) |
| Zombies Armor Factor, Zombie Max Defense | how much zombie clothing absorbs |
| Strength | x0.75 to x1.25 damage, and stomp power |
| Weapon skill | weapon level (step 9), the skill bonus (step 1), +3 crit per level |
| Low Weight, Very Low Weight, Emaciated | x0.8, x0.6, x0.4 damage |
| Endurance and Tired moodles | down to x0.05 damage each, and crit -5 per Endurance level |
| Panic, Stress | -0.1 damage per level from 2 up, crit -1.3 per Panic level |
| Heavy Load | crit -5 per level |

## Multiplayer

From the code: the attacking player's game works out each hit up to step 13 (hit counter and critical included) and sends that number to the server, which applies the final x0.15 and takes it off the zombie's health without working the hit out again. We have not measured how this plays out on a dedicated server.

> **Proof:** Code. `zombie.CombatManager#attackCollisionCheck` and `#processClientHit` (`GameClient.sendPlayerHit`); `zombie.network.fields.hit.WeaponHit` (`target.Hit(..., true)` with `bRemote` set); `zombie.characters.IsoGameCharacter#Hit` (a remote hit uses the sent damage instead of `processHitDamage`, and the counter's multiplier needs `!bRemote`) and `#hitConsequences` (x0.15 on the receiving side). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. Whether multiplayer kills take the same number of hits as single player needs a server test with the evidence in the server log. We have not run it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [How firearm accuracy and damage work](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage): the same chain for guns, and where it differs.
- [Outcast Punch: engine notes](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine): why bare-handed punches deal no damage in vanilla, and the same multiplier chain from a modder's side.
- [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works): what the zombie is trying to do to you meanwhile.
