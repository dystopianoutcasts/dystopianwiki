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
  How much damage a melee swing does in 42.22, how many hits a zombie takes (it gets harder from the fourth hit), and how critical hits work, with worked examples for the bat, axe, machete and knife.
last_updated: '2026-11-15'
related_articles:
  - firearm-accuracy-and-damage
  - how-infection-works
  - how-zombies-see-and-hear-you
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, the bat versus axe argument has gone on long enough. Here is what the 42.22 code does with every swing, from the weapon's numbers to the zombie hitting the floor, so you can settle it with arithmetic.

:::callout[The 1-minute version]{kind=key}
- For the default settings (Weapon Multi Hit off, so one zombie per swing): on foot, melee never misses a target it reaches. There is no hit roll to lose; reach and angle decide whether a swing connects. :cite[(`zombie/CombatManager.java:2761-2763`)] From a vehicle the hit chance can be 0 for a target outside the allowed angle. :cite[(`zombie/CombatManager.java:2711-2713`)]
- A Normal zombie has 1.5 to 1.8 health, a Tough one 3.5 to 3.8, a Fragile one 0.5 to 0.8. The default Apocalypse preset uses Random, so each zombie gets anything from 0.5 to 3.8.
- Damage per hit is the weapon's damage roll times a stack of factors (your Strength, your weapon skill, reach, angle, fatigue), ending in a fixed x0.15.
- Hits on the same zombie get harder: from the fourth hit on, each blow is multiplied by 3, then 4.5, then 6, and so on. A new character with a bat needs 6 hits on a Normal zombie facing them and 8 on a Tough one, before any critical.
- A critical happens when a 0 to 99 roll is below your crit chance: the weapon's crit chance plus 3 per level of its skill, kept between 10% and 90%, plus 5% if you hit from behind. A critical multiplies the damage by the weapon's critical multiplier (at least x2) and knocks the zombie down.
- Hitting a zombie on the ground with a weapon is worth x5 (or the critical multiplier, if higher), and x3 more if you strike its head.
- On a multiplayer server, your game works out a hit on a zombie and the server applies it.
:::

:::facts
- **Zombie health** Normal 1.5 to 1.8, Tough 3.5 to 3.8, Fragile 0.5 to 0.8, Random (default preset) 0.5 to 3.8
- **Final factor** every melee hit ends in x0.15
- **Hit counter** from the 4th hit on one zombie: x3, x4.5, x6, x7.5 and so on
- **Crit chance** weapon crit chance + 3 per skill level, kept between 10% and 90%, +5% from behind
- **Crit damage** x the weapon's multiplier, at least x2
- **Ground hit** x5 (or the crit multiplier, if higher); head x3
- **Reach** the weapon's MaxRange, x1.2 at skill level 7 (Long Blunt, Axe, Spear)
- **Real time** nothing here is per second: it all counts swings and hits
:::

## 1. How many hits does it take?

A new character (Strength 5, weapon skill 0) needs 4 to 9 average hits on a zombie that is not armored, depending on the weapon, the zombie and where it stands.

| A new character (Strength 5, weapon skill 0), average roll, no criticals | Normal zombie (1.8) | Tough zombie (3.8) |
|---|---|---|
| Baseball Bat, zombie facing you | 6 hits | 8 hits |
| Baseball Bat, at the tip of its reach, zombie turned away | 4 hits | 5 hits |
| Firefighter Axe, zombie facing you | 5 hits | 7 hits |
| Machete, zombie facing you | 4 hits | 6 hits |
| Kitchen Knife, zombie facing you | 7 hits | 9 hits |

"Facing you" rows put the zombie at the weapon's minimum reach (MinRange 0.61 tiles for these weapons), the closest a weapon hit lands. :cite[(`zombie/CombatManager.java:776-802`, `zombie/CombatManager.java:1444-1461`)] There the reach factor is about 1 (for the knife it is about 1.36). The reach factor below explains why the tip of the weapon hits about twice as hard.

The bat and the axe are two-handed weapons and are held in both hands in these rows; the machete and the knife are not two-handed. :cite[(`media/scripts/generated/items/weapon.txt`)] We assumed no zombie wears armor. Criticals and ground hits shorten every row.

We worked every row from the formula below and the weapons' script values; we have not counted hits in a running game.

## 2. The formula

Each hit runs through 14 steps, and the last one multiplies everything by 0.15.

```
1. base   = a random number between the weapon's MinDamage and MaxDamage
            x skill bonus     Long Blunt, Axe or Spear: 1.1 at levels 3-6, 1.2 at 7+; others 1
            x Strength        0.75 at level 0, +0.05 per level, 1.0 at 5, 1.25 at 10
            - MinDamage       if a two-handed weapon is held in one hand
            / (arm pain / 10) when your arms' pain adds up to more than 10 (at most / 30)
            x 0.8 Low Weight, 0.6 Very Low Weight, 0.4 Emaciated
2.        / (0.5 x (which hit of the swing this is))   so x2 for the first zombie of the swing (the only one with multi-hit off)
          / 5 more for a second zombie standing in the exact line of the first (multi-hit on)
3.        - 0.1 per Panic level and - 0.1 per Stress level, from level 2 up (a result below 0 is reset to 0.1)
4.        x Endurance and x Tired: 1, 0.5, 0.2, 0.1, 0.05 for moodle levels 0 to 4
5.        x (1 - zombie armor / 100)
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

:cite[(`zombie/CombatManager.java:804-856`, `zombie/CombatManager.java:858-935`, `zombie/characters/IsoGameCharacter.java:6112-6150`, `zombie/characters/IsoGameCharacter.java:6187-6249`, `zombie/CombatManager.java:3872-3902`)]

A few of those need words:

- **Skill bonus and Strength (step 1).** The bonus is 1.1 at skill levels 3 to 6 and 1.2 at 7 and up, for weapons in the Long Blunt, Axe or Spear categories; the Strength factor is 0.75 at level 0 and 1.25 at level 10. :cite[(`zombie/inventory/types/HandWeapon.java:478-512`, `zombie/characters/IsoGameCharacter.java:4594-4617`)] The Low Weight, Very Low Weight and Emaciated factors are 0.8, 0.6 and 0.4. :cite[(`zombie/characters/traits/CharacterTraits.java:142-157`)]
- **Reach factor (step 6).** The farther along the weapon's reach the zombie stands, the harder the hit: at the very tip it is about x2, at half the reach x1. Below 0.3 the code counts it as x1 again. :cite[(`zombie/CombatManager.java:776-794`)] A zombie closer than the weapon's MinRange gets shoved instead (or, with a knife and at most one zombie chasing you, stabbed at close range), and MinRange is between 0.4 and 0.6 of MaxRange on 199 of the 353 non-firearm weapon scripts that set both (the Katana is 0.61 of 1.4, the Baseball Bat 0.61 of 1.25), so weapon hits land between about x1 and x2. :cite[(`zombie/CombatManager.java:1444-1461`, `media/scripts/generated/items/weapon.txt`)]
- **How far a weapon reaches.** The game finds targets out to the weapon's MaxRange x its range factor (x1.2 at level 7 for Long Blunt, Axe and Spear) plus 1 tile, then keeps only those whose nearest body point is inside the MaxRange x range factor. :cite[(`zombie/CombatManager.java:1496-1498`, `zombie/characters/IsoGameCharacter.java:6313-6324`, `zombie/inventory/types/HandWeapon.java:515-526`)] A zombie that is lunging at you from inside 2 tiles gets 0.2 tiles of extra reach. :cite[(`zombie/characters/IsoGameCharacter.java:6316-6322`)]
- **Zombie armor (step 5).** The zombie's armor is `(the scratch defense of the zombie's clothes on the spot hit x 0.5 + their bite defense) x Zombie Armor Factor`, capped at Maximum Zombie Armor Defense. With the defaults (factor 2, cap 85) a zombie in a leather jacket takes 80% less on the arms and torso, and heavier gear reaches the 85% cap. :cite[(`zombie/CombatManager.java:3943-3957`, `zombie/CombatManager.java:4002-4004`, `zombie/SandboxOptions.java:2119-2120`)] A normal melee hit lands on a random spot from hand to neck. :cite[(`zombie/CombatManager.java:940-950`)]
- **Weapon level (step 9).** For an axe it is your Axe skill. For every other weapon type the count starts at minus one, so a Long Blunt 3 character with a bat is treated as level 2, and level 0 or 1 both give x0.3. :cite[(`zombie/characters/IsoGameCharacter.java:11304-11346`, `zombie/CombatManager.java:3880-3888`)] That is what the 42.22 code does; whether it is intended, we cannot tell.
- **Head and legs.** Only attacks on a zombie lying on the floor pick a hit location: a head strike is x3, a leg or foot strike x0.05, a spine strike x1. A floor swing that finds none of those misses. :cite[(`zombie/CombatManager.java:726-771`, `zombie/CombatManager.java:3959-3973`, `zombie/CombatManager.java:1109`)]
- **Stomping** replaces steps 1 to 3 with 0.7 to 1.0 plus 0.2 per Strength level, halved without shoes or multiplied by your shoes' stomp power, and skips steps 7 and 10. :cite[(`zombie/CombatManager.java:883-891`, `zombie/characters/IsoGameCharacter.java:6226-6243`)]
- **Dull blades.** On a weapon with sharpness, the top of the damage range shrinks to `MaxDamage = MinDamage + (MaxDamage - MinDamage) x (sharpness + 1) / 2`, and the critical multiplier shrinks by the same factor. :cite[(`zombie/inventory/types/HandWeapon.java:878-886`, `zombie/inventory/types/HandWeapon.java:1974-1976`, `zombie/inventory/InventoryItem.java:4662-4664`)]
- **Shoves** do no damage in the swing chain. :cite[(`zombie/characters/IsoGameCharacter.java:6122-6125`)]

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

:cite[(`zombie/characters/IsoGameCharacter.java:6239-6249`)]

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

The counter is never lowered. It only resets when the zombie object is reused. :cite[(`zombie/characters/IsoGameCharacter.java:6114-6120`, `zombie/characters/IsoZombie.java:4385`, `zombie/VirtualZombieManager.java:290`)] The x1.5 for a zombie that is not facing you applies when the dot product of your direction to the zombie and its facing is above -0.3, never for a shove. :cite[(`zombie/characters/IsoGameCharacter.java:6226-6237`)] The final x0.15 is the global melee reduction, and the zombie's health goes down by what is left. :cite[(`zombie/characters/IsoGameCharacter.java:6253-6257`, `zombie/CombatManager.java:3872-3878`)]

## 3. Zombie health

The Zombie Toughness sandbox option sets a zombie's health when the world creates it, and a few special zombies differ.

| Zombie Toughness | Health of a zombie the world spawns | Code |
|---|---|---|
| Tough | 3.5 to 3.8 | `zombie/VirtualZombieManager.java:343-345` |
| Normal | 1.5 to 1.8 | `zombie/VirtualZombieManager.java:347-349` |
| Fragile | 0.5 to 0.8 | `zombie/VirtualZombieManager.java:351-353` |
| Random (default preset) | 0.5 to 3.8 | `zombie/VirtualZombieManager.java:355-357`, `media/lua/shared/Sandbox/Apocalypse.lua:198` |

A corpse that rises gets 1.8 to 2.1 under Normal, and a zombie that was playing dead gets 0.5 to 0.8. :cite[(`zombie/iso/objects/IsoDeadBody.java:2021-2023`, `zombie/VirtualZombieManager.java:358-360`)]

## 4. Critical hits

A critical needs a 0 to 99 roll below the crit chance, and it multiplies the damage and knocks the zombie down.

The roll is made once per swing, on the closest target, and a critical lasts for that whole swing. :cite[(`zombie/CombatManager.java:3224-3225`, `zombie/CombatManager.java:3380-3381`)]

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

:cite[(`zombie/characters/IsoPlayer.java:3849-3926`, `zombie/CombatManager.java:3208-3214`, `zombie/inventory/types/HandWeapon.java:1225-1227`)]

The skill counted is the weapon's own: Axe, Long Blade, Spear, Short Blade or Short Blunt, and Long Blunt for anything else. :cite[(`zombie/characters/IsoPlayer.java:3880-3899`)]

What a critical does:

- damage x the weapon's critical multiplier, at least x2 (step 11). :cite[(`zombie/characters/IsoGameCharacter.java:6245-6247`)]
- the zombie is **knocked down**. :cite[(`zombie/characters/IsoZombie.java:4224`)]
- your swing speeds up by 10%. :cite[(`zombie/CombatManager.java:3382-3384`, `zombie/CombatManager.java:174`)]
- a hit on a zombie has a one-in-three extra chance to count as a head hit when it is a critical. :cite[(`zombie/characters/IsoZombie.java:1360-1362`)]

Special cases:

- **Knives** can only critical with the close-range stab: when the zombie is inside the knife's minimum reach and no more than one zombie is chasing you. That stab from behind on a zombie that has not noticed you is always a critical, and a knife-kill hit (the KNIFE_DEATH reaction, "KnifeDeath") is multiplied by 1000. :cite[(`zombie/CombatManager.java:3189-3193`, `zombie/CombatManager.java:3226-3240`, `zombie/CombatManager.java:797-799`, `zombie/combat/HitReaction.java:33`)]
- An item tagged "no criticals" never scores one; a weapon set to always knock down counts as 100%. :cite[(`zombie/CombatManager.java:3220-3222`, `zombie/CombatManager.java:3243-3245`, `zombie/characters/IsoPlayer.java:3850-3852`)]
- Two +30 bonuses exist in the code (an attack from behind on an unaware zombie, and a spear lunge from more than 1.25 tiles), but they only apply with empty hands or an item tagged as a fake spear. :cite[(`zombie/CombatManager.java:3199-3213`)]

| Weapon (CriticalChance, multiplier) | Crit at skill 0 | Crit at skill 5 | Crit at skill 10 |
|---|---|---|---|
| Baseball Bat (40, x2) | 40% | 55% | 70% |
| Crowbar (20, x2.5) | 20% | 35% | 50% |
| Firefighter Axe (20, x5) | 20% | 35% | 50% |
| Machete (20, x5, at full sharpness) | 20% | 35% | 50% |
| Katana (35, x6, at full sharpness) | 35% | 50% | 65% |

Rested, calm, two hands on a two-handed weapon, aim held, zombie facing you; add 5 points from behind. Sharpness scales the chance itself, so a half-dull machete starts at 10. :cite[(`media/scripts/generated/items/weapon.txt`, `zombie/inventory/types/HandWeapon.java:1225-1227`)]

## 5. What changes it

Each setting, trait and skill below changes one or two steps of the damage chain or of the crit chance, and none of them adds a hit roll.

| Setting, trait or skill | Effect | Code |
|---|---|---|
| Toughness | zombie health (table above), and crit chance -6 / +6 | `zombie/characters/IsoPlayer.java:3916-3924` |
| Weapon Multi Hit | lets some weapons hit several zombies; each extra one takes less (the x2 for the first becomes x1, x0.67, x0.5 ...), and a second zombie in the exact line of the first takes a fifth of its damage roll | `zombie/CombatManager.java:2352-2354`, `zombie/CombatManager.java:865-866`, `zombie/CombatManager.java:707-721`, `zombie/CombatManager.java:807-810` |
| Zombie Armor Factor, Maximum Zombie Armor Defense | how much zombie clothing absorbs | `zombie/CombatManager.java:3943-3957` |
| Strength | x0.75 to x1.25 damage, and stomp power | `zombie/characters/IsoGameCharacter.java:4594-4617`, `zombie/CombatManager.java:884` |
| Weapon skill | weapon level (step 9), the skill bonus (step 1), +3 crit per level | `zombie/characters/IsoGameCharacter.java:11304-11346`, `zombie/inventory/types/HandWeapon.java:478-512` |
| Low Weight, Very Low Weight, Emaciated | x0.8, x0.6, x0.4 damage | `zombie/characters/traits/CharacterTraits.java:142-157` |
| Endurance and Tired moodles | down to x0.05 damage each, and crit -5 per Endurance level | `zombie/CombatManager.java:893-935`, `zombie/characters/IsoPlayer.java:3911` |
| Panic, Stress | -0.1 damage per level from 2 up, crit -1.3 per Panic level | `zombie/CombatManager.java:868-876`, `zombie/characters/IsoPlayer.java:3913` |
| Heavy Load | crit -5 per level | `zombie/characters/IsoPlayer.java:3912` |

## 6. Multiplayer

On a multiplayer server, the attacking player's game works out a hit on a zombie up to step 13, and the server applies the final x0.15.

For a zombie target, the attacker's game rolls the hit and the critical, works out the damage (hit counter included) and sends that number to the server, which takes it off the zombie's health without working the hit out again. :cite[(`zombie/CombatManager.java:1077-1080`, `zombie/CombatManager.java:1199`, `zombie/network/fields/hit/Hit.java:124-126`, `zombie/network/fields/hit/Hit.java:149-151`, `zombie/network/packets/hit/PlayerHitPacket.java:214-216`)] The server applies the x0.15 on its own side. :cite[(`zombie/characters/IsoGameCharacter.java:6148-6149`, `zombie/characters/IsoGameCharacter.java:6253-6257`)] When the target is another player, the server rolls the hit and works out the damage itself. :cite[(`zombie/network/fields/hit/Hit.java:124-127`, `zombie/CombatManager.java:656-658`)]

> **Warning for server owners:** for a hit on a zombie, the server accepts the damage figure the client sends as long as it is between 0 and 200. :cite[(`zombie/network/fields/hit/Hit.java:32-33`, `zombie/network/fields/hit/Hit.java:101-103`, `zombie/network/fields/hit/Hit.java:150`)] Keep logging enabled.

We have not measured how this plays out on a dedicated server, and whether multiplayer kills take the same number of hits as single player needs a server test with the evidence in the server log.

## Where to go next

- [How firearm accuracy and damage work](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage): the same chain for guns, and where it differs.
- [Outcast Punch: engine notes](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine): why bare-handed punches deal no damage in vanilla, and the same multiplier chain from a modder's side.
- [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works): what the zombie is trying to do to you meanwhile.

:::callout[How we know]{kind=proof}
Every number and rule above is read from the 42.22 Java and the weapon scripts, and the worked rows are calculated from them. We did not count hits in a running game, so the hit counts in the first table and the worked crit chances are read, not measured.

The multiplayer behavior is read from the packet code only. Whether the Long Blunt level-minus-one rule for the weapon level is intended we cannot tell. The second-zombie rule reads dotList, which keeps only the first target's direction, so it is read from the code and not seen in a game. The test that settles the hit counts: swing a bat at a Normal zombie in a test world with Toughness set to Normal and criticals out of play (a weapon tagged for no criticals), and count the hits.
:::
