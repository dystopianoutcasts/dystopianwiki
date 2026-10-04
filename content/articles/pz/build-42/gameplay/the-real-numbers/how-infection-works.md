---
id: build-42-how-infection-works
slug: how-infection-works
title: 'How infection works: bites, scratches, armour and the clock'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - infection
  - zombies
  - health
  - clothing
  - sandbox
excerpt: >-
  A bite always infects, a laceration 25% of the time, a scratch 7%. From the
  front one zombie attack infects an unarmoured new character about 22% of the
  time; from behind about half. Clothing blocks by its bite or scratch
  defence. With default settings the infection kills in 2 to 3 in-game days.
  The full chain, read from the Build 42.21 code.
last_updated: '2026-10-04'
---
# How infection works: bites, scratches, armour and the clock

Outcast, this is the one every survivor wants to understand and nobody wants to test. We read the whole chain in the Build 42.21 code: what decides whether a zombie's attack wounds you, which wound it is, what your clothes do about it, how likely each wound is to carry the virus, and how long you have.

## The short answer

For the default settings (the Apocalypse preset: Transmission "Blood and Saliva", Infection Mortality "2-3 Days", Reanimate Time "0-1 Minutes", Rear Vulnerability "High", zombie Strength "Normal", drag-down on):

- Every zombie attack that connects ends in one of four ways: **nothing but a shove and some pain, a scratch, a laceration, or a bite.**
- **A bite always infects. A laceration infects 25% of the time. A scratch infects 7% of the time.**
- One zombie, from the front, against a new character with no armour on that spot: 11% nothing, 50% scratch, 26% laceration, 12.5% bite. That is **about a 22% chance that one attack infects you.**
- From **behind** there is no "nothing" outcome, and a bite becomes 39% likely: **about 51% per attack.**
- **Two zombies** on you at once: bites jump to 44%, **about 52% per attack.** Three zombies attacking you at the same moment drag you down and kill you outright.
- **Clothing** gives each worn piece covering the spot a chance to block, equal to its Scratch Defence (against scratches and lacerations) or Bite Defence (against bites), added up to at most 100%. A blocked attack often tears a hole, and a holed piece protects nothing on that spot afterwards.
- **The clock:** an infection kills you **2 to 3 in-game days** after it starts (48 to 72 game hours). With the default day length of 1 hour 30 minutes, that is 3 to 4.5 hours of real play at normal speed. You then rise as a zombie within about a game minute.
- **There is no cure** in normal play. The only code that clears an infection is the full heal used by god mode and the admin and debug health tools.

## Step 1: does the attack wound you?

```
avoid = 15 + your weapon skill bonus - 10 for each extra zombie attacking you right now
        then x 1.3 Thick-skinned, or / 1.3 Thin-skinned (rounded down)
        then - 15 if it attacks from behind, - 30 if from the side
        then + 20 if the zombie is in its inactive phase
the attack wounds you if a roll of 0 to 99 is above avoid
```

Your **weapon skill bonus** comes from the skill of the weapon in your hands:

| Weapon level | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bonus | -5 | -2 | 0 | +1 | +2 | +3 | +4 | +5 | +5 | +6 | +7 |

Empty hands count as level 0. One oddity in the code: for an axe the weapon level is your Axe skill, but for every other weapon type the count starts at minus one, so a Long Blunt 3 character holding a bat is treated as level 2. That is what the code does in 42.21; whether it is intended, we cannot tell.

The **Rear Vulnerability** sandbox setting decides how much the back and side penalties bite. "High" (the default) applies them in full; "Medium" gives part of them back; "Low" gives all of it back.

## Step 2: which wound?

If you are wounded, two more rolls pick the wound:

```
laceration if a roll is above 65 - 15 per extra zombie - 35 behind - 27 side (+ 20 inactive)
bite       if a roll is above 85 - 30 per extra zombie - 25 behind - 7 side (+ 20 inactive)
           (a further - 15 on both lines from behind when three or more attack)
a bite replaces a laceration, which replaces a scratch
a zombie wearing a mask, a full helmet or a suit hood cannot bite
```

Where it lands: a standing zombie goes for your hands, forearms, upper arms, torso, head or neck; one attack in ten can also land on the groin. A head or neck roll from the front is moved to another part 29% of the time (9% from behind, 19% from the side), and an attack from behind has an extra chance of the neck of 5% plus 10% per zombie attacking. Crawlers miss half their attacks outright and go for your legs and feet with the rest.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (avoid 15 + `getMeleeCombatMod`, bite 85, laceration 65, the per-attacker, behind, side and inactive changes, Thick-skinned and Thin-skinned 1.3, the `rearVulnerability` give-backs, drag-down, the body part rolls, `cantBite`); `zombie.characters.IsoGameCharacter#getMeleeCombatMod` and `#getWeaponLevel`; `zombie.characters.IsoGameCharacter#getSurroundingAttackingZombies` (zombies targeting you within 0.9 tiles in an attack or lunge state). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Worked out

For a new character (weapon level 0, bonus -5), no armour on the spot hit, default settings:

| Situation | Nothing | Scratch | Laceration | Bite | Infected by this attack |
|---|---|---|---|---|---|
| One zombie, front | 11% | 50% | 26% | 12.5% | 22.5% |
| One zombie, side | 0% | 31% | 48% | 21% | 35% |
| One zombie, behind | 0% | 19% | 42% | 39% | 51% |
| Two zombies, front | 1% | 28% | 27% | 44% | 52% |
| Weapon level 10, one zombie, front | 23% | 44% | 22.5% | 11% | 19.5% |

**Three at once:** with zombie Strength "Normal" and the drag-down option on, three standing zombies attacking you at the same moment end it. Superhuman zombies need two, Weak zombies need six; sitting on the ground prevents it; crawlers count only if the crawler drag-down option is on.

## Step 3: what your clothes do

```
block chance = the sum, over every worn piece covering that spot,
               of its Scratch Defence (scratch, laceration) or Bite Defence (bite)
               a piece with a hole there, or at 0 condition, counts 0
               capped at 100%
if blocked:    one covering piece tears with chance max(30, 100 - its defence / 1.5) %
```

An attack that ends in "nothing" can tear a piece the same way.

A few vanilla values (Scratch / Bite Defence): denim shirt 15 / 7, denim trousers 20 / 10, padded jacket 20 / 10, leather jacket 40 / 20, leather gloves 30 / 15, army helmet 80 / 70, leather vambraces 100 against bites.

So a leather jacket over a denim shirt blocks 55% of scratches and lacerations on the arms and 27% of bites. In the front-facing example above that cuts the chance of being infected by one attack from 22.5% to about 14%. Layers add up, holes take a layer out, and a patch sewn over a spot adds the patch's own defence.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#getBodyPartClothingDefense` (sum over covering items without a hole, capped at 100); `zombie.inventory.types.Clothing#getDefForPart` (scratch or bite defence, 0 with a hole, neck modifier, patch defence) and `#getBiteDefense` / `#getScratchDefense` (0 at condition 0); `zombie.characters.IsoGameCharacter#addHoleFromZombieAttacks` (`max(30, 100 - defence / 1.5)`); the values are in `media/scripts/generated/items/clothing.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Step 4: which wounds carry the virus

| Wound | Chance it infects you |
|---|---|
| Bite | 100% |
| Laceration | 25% |
| Scratch | 7% |

Only wounds from a zombie roll for infection. A scratch from breaking glass or from a weapon never carries the virus.

- **Transmission "Saliva Only":** lacerations and scratches never infect; bites still do.
- **Transmission "None":** nothing infects.
- **Infection Mortality "Never":** wounds that would infect give you a false infection instead: the fever builds up, then fades.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyPart#SetBitten` (infected unless Transmission is None), `#setCut` (`generateZombieInfection(25)`), `#setScratched` (`generateZombieInfection(7)`), `#generateZombieInfection` (none for Saliva Only or None; Mortality Never turns it into a false infection), and `#SetScratchedWeapon` / `#SetScratchedWindow`, which never roll. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Code. The infected flag is cleared only by the full-heal methods `zombie.characters.BodyDamage.BodyDamage#RestoreToFullHealth` and `BodyPart#RestoreToFullHealth` (used by god mode, the tutorial, debug menus and the health panel's cheat actions, `ISHealthPanel.onCheat` in `media/lua/client/XpSystem/ISUI/ISHealthPanel.lua` with its server side in `media/lua/server/ClientCommands.lua`) and by that panel's cheat "bite" toggle. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Step 5: the clock

When you are infected the game picks how long you have, in game hours:

| Infection Mortality | What the code picks | Notes |
|---|---|---|
| Instant | 0 | you die at once |
| 0-30 Seconds | 0 to 30 seconds | |
| 0-1 Minutes | 30 to 60 seconds | the code starts at half a minute, not zero |
| 0-12 Hours | 3 to 12 hours | the code starts at 3 hours, not zero |
| 2-3 Days (default) | 48 to 72 hours | |
| 1-2 Weeks | 168 to 336 hours | |
| Never | no clock | false infection only |

Then x 1.25 with **Resilient**, x 0.75 with **Prone to Illness**.

```
progress = game hours survived since infection / that duration
your health can be at most 100 x (1 - progress^4)
at progress 1: 110 damage, which kills you
```

The fourth power means the infection is quiet for most of its course and then fast. The cap only starts to apply once it drops below 99, about a third of the way through:

| Share of the clock gone | Most health you can have |
|---|---|
| 25% | no limit yet |
| 50% | 93.8 |
| 75% | 68.4 |
| 90% | 34.4 |
| 100% | dead |

The clock counts your hours survived, so sleeping and fast-forwarding spend it like any other time.

```java
hungryDamage = Math.min((worldAgeHours - this.infectionTime) / this.infectionMortalityDuration, 1.0F);
this.stats.set(CharacterStat.ZOMBIE_INFECTION, hungryDamage * 100.0F);
if (hungryDamage == 1.0F) {
   this.ReduceGeneralHealth(110.0F);
   LuaEventManager.triggerEvent("OnPlayerGetDamage", this.parentChar, "INFECTION", 110);
} else {
   hungryDamage *= hungryDamage;
   hungryDamage *= hungryDamage;
   sickDamage = (1.0F - hungryDamage) * 100.0F;
   bleedingDamage = this.getOverallBodyHealth() - sickDamage;
   if (bleedingDamage > 0.0F && sickDamage <= 99.0F) {
      this.ReduceGeneralHealth(bleedingDamage);
```

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#pickMortalityDuration` (the durations, Resilient 1.25, Prone to Illness 0.75), `#Update` (the lines above), `#getCurrentTimeForInfection` (hours survived for a player). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Rising

With Transmission "Blood and Saliva" or "Saliva Only" you rise after death if you carried a real infection, whatever actually killed you. With "Everyone's Infected" everyone rises; with "None", no one. The default Reanimate Time of "0-1 Minutes" means 0 to 1 game minute.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#shouldBecomeZombieAfterDeath` (by Transmission, and infection level above 0.001 for the first two); `zombie.characters.IsoPlayer` calls `IsoDeadBody#reanimateLater` when it is true; `zombie.iso.objects.IsoDeadBody#getReanimateDelay` (0 to 0.0167 game hours for the default). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What changes it

| Setting or trait | Effect |
|---|---|
| Transmission | Blood and Saliva (all three wounds), Saliva Only (bites only), Everyone's Infected (everyone rises), None |
| Infection Mortality | the clock table above |
| Reanimate Time | how soon you rise |
| Rear Vulnerability | how much worse attacks from behind and the side are |
| Zombie Strength | how many attackers drag you down (2, 3 or 6) |
| Zombies Drag Down, Crawlers Drag Down | turn the drag-down on or off |
| Thick-skinned, Thin-skinned | avoid chance x1.3 or / 1.3 |
| Resilient, Prone to Illness | the clock x1.25 or x0.75 |
| Weapon skill | the avoid bonus, -5 to +7 |
| Fast Healer, Slow Healer | how long the wound itself takes to heal, not the infection |

## Multiplayer

From the code: on a multiplayer client the attack is rolled on the client first. If that roll lands a wound, the client sends the body part to the server, and the server runs the same wound roll again for that body part before anything is applied. If both rolls must succeed, wounds would be rarer in multiplayer than in single player. That is our reading; we have not measured it.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (on a client, `GameClient.sendZombieHit` and return before the wound is applied); `zombie.network.fields.hit.Bite#process` (on the server, `AddRandomDamageFromZombie(wielder, hitReaction, bodyPart)` again). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. Whether the second roll on the server really lowers the wound rate in a live game needs a server test with the evidence in the server log. We have not run it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [How long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you): how long it keeps coming.
- [How melee damage and critical hits work](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits): ending the fight before it ends you.
