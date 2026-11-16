---
id: build-42-how-infection-works
slug: how-infection-works
title: 'How infection works: bites, scratches, armor and the clock'
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
  A bite infects, a laceration 25% of the time, a scratch 7%. One zombie from the front infects an unarmored new character about 22% of the time. By default you die 2 to 3 game days later (42.22).
last_updated: '2026-11-15'
related_articles:
  - how-long-zombies-remember-you
  - melee-damage-and-critical-hits
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, this is the one every survivor wants to understand and nobody wants to test. A zombie's attack goes through five checks in a row, and you can read each one: does it wound you, which wound is it, do your clothes block it, does the wound carry the virus, and how long do you have.

:::callout[The 1-minute version]{kind=key}
- With the default settings, one zombie attacking a new character with no armor from the front infects about 22% of the time. From behind it is about half, and with two zombies on you from the front it is also about half.
- A bite infects under every Transmission setting except None. A laceration infects 25% of the time and a scratch 7%, and neither can infect under Saliva Only.
- Each worn piece that covers the spot and has no hole adds its Scratch Defense or Bite Defense to your chance to block, up to 100%. A holed piece adds nothing there.
- With the default Infection Mortality ("2-3 Days") you die 48 to 72 game hours after infection. At the default day length of 1 hour 30 minutes, that is 3 to 4.5 real hours at normal speed.
- We found no cure in the vanilla engine or Lua. The only code that clears an infection is the full heal behind god mode and the tutorial.
- Three zombies attacking you at the same moment, with the default Normal strength and drag-down on, kill you outright.
:::

:::facts
- **Bite** infects under Transmission Blood and Saliva, Saliva Only and Everyone's Infected (not under None)
- **Laceration / scratch** 25% / 7% (not under Saliva Only or None)
- **One zombie, front, new character, no armor** 22.5% infected per attack
- **Default clock** 48 to 72 game hours, 3 to 4.5 real hours at 1 hour 30 minutes per day
- **Rise after death** 0 to 1 game minute (default), up to about 4 real seconds
- **Conversion** one game day is 1.5 real hours at the default day length, so one game hour is 3.75 real minutes
:::

:::flow[What happens to you when a zombie attack connects]
- Avoid roll: does it wound you?
- Which wound: scratch, laceration or bite
- Clothing block roll
- Infection roll for that wound
- The clock runs
:::

## 1. Does the attack wound you?

The game rolls 0 to 99 against an avoid chance, and the attack wounds you only if the roll is above it.

The avoid chance starts at 15 plus a bonus from the skill of the weapon in your hands, minus 10 for each extra zombie attacking you. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1265`, `zombie/characters/BodyDamage/BodyDamage.java:1273`, `zombie/characters/BodyDamage/BodyDamage.java:1430`)] Thick-skinned multiplies it by 1.3 and Thin-skinned divides it by 1.3, both rounded down. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1285-1292`)] An attack from behind then takes 15 off and one from the side 30, and a zombie in its inactive phase adds 20. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1309-1311`, `zombie/characters/BodyDamage/BodyDamage.java:1331-1333`, `zombie/characters/BodyDamage/BodyDamage.java:1406-1410`)]

The weapon bonus comes from the level of the weapon you hold, and empty hands give -5. :cite[(`zombie/characters/IsoGameCharacter.java:11273-11295`)]

| Weapon level | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bonus | -5 | -2 | 0 | +1 | +2 | +3 | +4 | +5 | +5 | +6 | +7 |

The level counts in an odd way. For an axe it is your Axe level, but for every other weapon category the count starts at -1 and adds your skill, so a Blunt 3 character holding a bat is treated as level 2. :cite[(`zombie/characters/IsoGameCharacter.java:11304-11340`)] If a weapon belongs to several categories, the levels add up, and the total is capped at 10. :cite[(`zombie/characters/IsoGameCharacter.java:11340-11344`)] We cannot tell whether the -1 is intended.

The Rear Vulnerability setting (Low, Medium or High, default High) decides how much of the behind and side penalties applies. High applies them in full, Medium gives part back, and Low gives all of the avoid penalty and the bite and laceration penalties back. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1313-1328`, `zombie/characters/BodyDamage/BodyDamage.java:1335-1346`, `media/lua/shared/Sandbox/Apocalypse.lua:128`, `media/lua/shared/Translate/EN/Sandbox.json:845-849`)]

## 2. Which wound?

If the attack wounds you, two more rolls pick a scratch, a laceration or a bite.

```
laceration if a roll is above 65 - 15 per extra zombie - 35 behind - 27 side (+ 20 inactive)
bite       if a roll is above 85 - 30 per extra zombie - 25 behind - 7 side (+ 20 inactive)
           (a further - 15 on both lines from behind when three or more attack)
a bite replaces a laceration, which replaces a scratch
a zombie that cannot bite turns a would-be bite into a laceration or a scratch
```

These numbers are the code's. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1266-1275`, `zombie/characters/BodyDamage/BodyDamage.java:1309-1330`, `zombie/characters/BodyDamage/BodyDamage.java:1331-1346`, `zombie/characters/BodyDamage/BodyDamage.java:1440-1449`)] A zombie cannot bite while it wears a mask, an eye mask, a full mask, a full-face hat or a suit hood that is not marked as one you can eat through, or when it has no teeth. :cite[(`zombie/characters/IsoZombie.java:5280-5320`)]

Where it lands: a standing zombie picks hands, forearms, upper arms, torso, head or neck, and one attack in ten can also land on the groin. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1350-1354`)] A head or neck roll is moved to another part 29% of the time from the front, 9% from behind and 19% from the side. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1370-1385`)] An attack from behind has an extra chance of 5% plus 10% per attacking zombie to go for the neck instead. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1356-1368`)] Crawlers do nothing on half their attacks, and use the rest on the legs and feet, with an occasional groin hit. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1394-1403`)]

### Worked out

For a new character (weapon level 0, bonus -5) with no armor on the spot hit and the default settings, we ran the rolls above. The infection column adds the three infection chances from section 4.

| Situation | Nothing | Scratch | Laceration | Bite | Infected by this attack |
|---|---|---|---|---|---|
| One zombie, front | 11% | 50.5% | 26% | 12.5% | 22.5% |
| One zombie, side | 0% | 31% | 48% | 21% | 35% |
| One zombie, behind | 0% | 19% | 42% | 39% | 51% |
| Two zombies, front | 1% | 28% | 27% | 44% | 52% |
| Weapon level 10, one zombie, front | 23% | 44% | 22.5% | 11% | 19.5% |

**Three at once:** with Zombie Strength Normal and Drag Down on, three zombies attacking you at the same moment end it. Superhuman needs two and Weak needs six, and sitting on the ground prevents it. Crawlers count only if the Crawlers Drag Down option is enabled. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1276-1283`, `zombie/characters/BodyDamage/BodyDamage.java:1293-1304`, `media/lua/shared/Sandbox/Apocalypse.lua:197`, `media/lua/shared/Sandbox/Apocalypse.lua:213-214`)] An attacking zombie counts only if it targets you, is within 0.9 tiles and is in an attack or lunge state. :cite[(`zombie/characters/IsoGameCharacter.java:13679-13713`)]

## 3. What your clothes do

Each worn piece that covers the spot and has no hole adds its own defense to the chance that the attack is blocked.

The block chance is the sum over those pieces, capped at 100%, and it uses Scratch Defense for scratches and lacerations and Bite Defense for bites. :cite[(`zombie/characters/IsoGameCharacter.java:13344-13376`, `zombie/characters/BodyDamage/BodyDamage.java:1468`, `zombie/characters/BodyDamage/BodyDamage.java:1509`, `zombie/characters/BodyDamage/BodyDamage.java:1545`)] A piece with a hole there adds 0, a piece at condition 0 adds 0, and a patch sewn over the spot adds its own defense (or replaces it if the patch has a hole). :cite[(`zombie/inventory/types/Clothing.java:951-985`, `zombie/inventory/types/Clothing.java:895-906`)]

A blocked attack often tears the clothing. One covering piece tears with chance max(30, 100 - its defense / 1.5) percent, and an attack that ends in "nothing" can tear a piece the same way. :cite[(`zombie/characters/IsoGameCharacter.java:14095-14135`, `zombie/characters/BodyDamage/BodyDamage.java:1595-1597`)] An unblocked wound also adds a hole. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1473-1476`)]

A few vanilla values (Scratch / Bite Defense): denim shirt 15 / 7, denim trousers 20 / 10, padded jacket 20 / 10, leather jacket 40 / 20, leather gloves 30 / 15, army helmet 80 / 70. :cite[(`media/scripts/generated/items/clothing.txt:16744-16755`, `media/scripts/generated/items/clothing.txt:10835-10847`, `media/scripts/generated/items/clothing.txt:5601-5617`, `media/scripts/generated/items/clothing.txt:6195-6210`, `media/scripts/generated/items/clothing.txt:1475-1487`, `media/scripts/generated/items/clothing.txt:4372-4384`)]

So a leather jacket over a denim shirt, if both cover the arm, blocks 55% of scratches and lacerations and 27% of bites there. In the front-facing example above, that cuts the chance of being infected by one attack from 22.5% to about 14%. Layers add up, holes take a layer out, and a mended patch adds its own defense.

## 4. Which wounds carry the virus

Only a wound from a zombie rolls for the virus, and the roll depends on the wound and the Transmission setting.

| Wound | Chance it infects you | Code |
|---|---|---|
| Bite | infects under every Transmission setting except None | `zombie/characters/BodyDamage/BodyPart.java:691-717` |
| Laceration | 25% | `zombie/characters/BodyDamage/BodyPart.java:770-798` |
| Scratch | 7% | `zombie/characters/BodyDamage/BodyPart.java:816-843` |

A scratch from broken glass or from a weapon does not roll for infection, because those routes do not call the infection roll. :cite[(`zombie/characters/BodyDamage/BodyPart.java:800-814`, `zombie/characters/BodyDamage/BodyPart.java:845-860`, `zombie/characters/BodyDamage/BodyPart.java:943-960`)]

- **Transmission "Saliva Only":** lacerations and scratches cannot infect, and bites still do. :cite[(`zombie/characters/BodyDamage/BodyPart.java:800-808`, `media/lua/shared/Translate/EN/Sandbox.json:471-474`)]
- **Transmission "None":** nothing infects. :cite[(`zombie/characters/BodyDamage/BodyPart.java:707`, `zombie/characters/BodyDamage/BodyPart.java:805-808`)]
- **Infection Mortality "Never":** a wound that would infect gives you a false infection instead: the fever builds up and then fades. :cite[(`zombie/characters/BodyDamage/BodyPart.java:712-715`, `zombie/characters/BodyDamage/BodyPart.java:810-813`)]

The player's infection starts when the body update finds an infected part, and from then on the clock runs. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2155-2172`)]

## 5. The clock

The game rolls how many game hours you have once, when the infection starts, and the clock counts the hours you survive.

The table is what the code picks for each Infection Mortality setting. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2083-2100`, `zombie/characters/BodyDamage/BodyDamage.java:2169-2171`)]

| Infection Mortality | What the code picks | About, in real time at 1 hour 30 minutes per day | Notes |
|---|---|---|---|
| Instant | 0 | at once | the check kills you the moment you are infected :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2367-2370`)] |
| 0-30 Seconds | 0 to 30 game seconds | up to about 2 seconds | |
| 0-1 Minutes | 30 to 60 game seconds | about 2 to 4 seconds | the code starts at half a minute, not zero |
| 0-12 Hours | 3 to 12 game hours | 11 to 45 minutes | the code starts at 3 hours, not zero |
| 2-3 Days (default) | 48 to 72 game hours | 3 to 4.5 hours | |
| 1-2 Weeks | 168 to 336 game hours | 10.5 to 21 hours | |
| Never | no clock | | false infection only |

The settings' names are the game's own labels, and the default is 2-3 Days. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:475-483`, `media/lua/shared/Sandbox/Apocalypse.lua:200`)] The real-time column is our arithmetic: a game day lasts 1 hour 30 minutes of real time at the default DayLength 4. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:8`, `media/lua/shared/Translate/EN/Sandbox.json:30`)] Resilient multiplies the duration by 1.25 and Prone to Illness by 0.75. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2083-2093`)]

```
progress = game hours survived since infection / that duration
your health can be at most 100 x (1 - progress^4)
at progress 1: 110 damage, which kills you
```

The fourth power means the infection is quiet for most of its course and then fast. The cap only applies once it drops below 99, which is about a third of the way through. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2378-2392`)]

| Share of the clock gone | Most health you can have |
|---|---|
| 25% | no limit yet |
| 50% | 93.8 |
| 75% | 68.4 |
| 90% | 34.4 |
| 100% | dead |

The clock counts game hours you survived, so sleeping and fast-forwarding spend it like any other time. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2634-2636`, `zombie/characters/IsoGameCharacter.java:9503-9505`)]

## 6. Rising, and no cure

With Transmission "Blood and Saliva" or "Saliva Only" you rise after death if you carried a real infection, whatever killed you.

The check reads the infection stat and ignores a false infection. :cite[(`zombie/characters/IsoGameCharacter.java:11517-11525`)] With "Everyone's Infected" everyone rises, and with "None" no one does. The server starts the delay when you die, and the default Reanimate Time of "0-1 Minutes" means 0 to 1 game minute, which is up to about 4 real seconds. :cite[(`zombie/characters/IsoPlayer.java:8416-8419`, `zombie/iso/objects/IsoDeadBody.java:1863-1888`, `media/lua/shared/Sandbox/Apocalypse.lua:201`)]

We found no cure in vanilla. The body's infection flag is cleared in one place, the full heal that god mode and the tutorial use, and a search of the engine and the Lua found no other call that clears it. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1804-1820`, `zombie/characters/BodyDamage/BodyDamage.java:2117-2118`, `media/lua/client/Tutorial/Steps.lua:1571`)] The debug health panel and its server command heal each body part, and the part-level bite cheat clears only that part's own flags, so none of them clear the body's infection flag. :cite[(`zombie/characters/BodyDamage/BodyPart.java:596-630`, `media/lua/client/XpSystem/ISUI/ISHealthPanel.lua:223`, `media/lua/client/XpSystem/ISUI/ISHealthPanel.lua:273-285`, `media/lua/server/ClientCommands.lua:530`, `media/lua/server/ClientCommands.lua:580-596`)]

## 7. What changes it

Mostly sandbox settings and a few traits.

| Setting or trait | Effect |
|---|---|
| Transmission | Blood and Saliva (all three wounds), Saliva Only (bites only), Everyone's Infected (everyone rises), None |
| Infection Mortality | the clock table above |
| Reanimate Time | how soon you rise |
| Rear Vulnerability | how much worse attacks from behind and the side are |
| Zombie Strength | how many attackers drag you down (2, 3 or 6) |
| Drag Down, Crawlers Drag Down | turn the drag-down on or off, and say whether crawlers count |
| Thick-skinned, Thin-skinned | avoid chance x1.3 or / 1.3 |
| Resilient, Prone to Illness | the clock x1.25 or x0.75 |
| Weapon skill | the avoid bonus, -5 to +7 |
| Fast Healer, Slow Healer | how long the wound itself takes to heal, not the infection :cite[(`zombie/characters/BodyDamage/BodyPart.java:698-704`, `zombie/characters/BodyDamage/BodyPart.java:874-878`)] |

## 8. Multiplayer

On a multiplayer client the attack is rolled on the client first, and the server then runs the same wound roll again for the body part the client sent.

The client sends the wound to the server and returns before applying anything. :cite[(`zombie/characters/BodyDamage/BodyDamage.java:1481-1486`)] The server calls the same method again with that body part, and it rerolls the avoid, wound and clothing rolls. :cite[(`zombie/network/fields/hit/Bite.java:94-97`, `zombie/characters/BodyDamage/BodyDamage.java:1430-1449`)] If both rolls must succeed, wounds would be rarer in multiplayer than in single player. That is our reading of the code; we have not measured it.

## Where to go next

- [How long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you): how long it keeps coming.
- [How melee damage and critical hits work](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits): ending the fight before it ends you.
- [Body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection): the same system for modders.
- [Sickness, pain, drunkenness and the other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats): how the infection value feeds the Sick moodle.

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java and Lua. The percentage tables are our own arithmetic on those rules; we recomputed each row, but did not run a game to count real bites.

Not tested: whether the second roll on the server really lowers the wound rate in a live game. That needs a server test with the evidence in the server log. We also did not search for cures that other mods add, and the claim that nothing else clears the infection rests on a search of the vanilla engine and Lua only.
:::
