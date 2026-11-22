---
id: build-42-body-damage-wounds-and-infection
slug: body-damage-wounds-and-infection
title: 'Body damage, wounds and infection: how the body is simulated'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - health
  - infection
  - multiplayer
  - lua-api
excerpt: >-
  How Build 42.22 simulates the body: 17 parts, health worked out from them, an infection clock, and in multiplayer a server that owns it all. What Lua can change and the call that infects you.
last_updated: '2026-11-21'
related_articles:
  - body-temperature-and-the-thermoregulator
  - what-runs-on-the-server-in-build-42-multiplayer
  - lua-classes-characters-1
  - lua-events
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

Outcast, the health panel looks like a picture of a body with some numbers on it. Underneath it is a small simulation that runs every frame: wounds bleed and heal on their own clocks, the overall health number is worked out from the parts, and an infection counts down to death. In Build 42 multiplayer none of it runs on your own computer.

**Who this page is for:** [players](#1-what-the-body-does) | [modders](#3-one-tick-of-the-body) | [server owners](#5-which-side-runs-the-body)

:::callout[The 1-minute version]{kind=key}
- You have 17 body parts. Each can carry wounds, and overall health is worked out from the parts, not stored.
- Infection is counted twice: once on each part and once on the whole body. Curing the parts but not the body brings the infection back on the next tick.
- In single player the body runs in your game. In multiplayer it runs on the server, and a change a client mod makes to the body is replaced by the next full-body packet (every 2 seconds).
- A bite infects the part unless Transmission is "None", and Infection Mortality "Never" turns that infection into a fake one :cite[(`BodyPart.java:708-716`)]. `SetBitten(false)` infects the part when Transmission is not "None". Vanilla's own debug toggle clears the part's flags straight after it.
- With the default sandbox (Transmission "Blood and Saliva", Infection Mortality "2-3 Days") the infection takes 2 to 3 game days, about 3 to 4.5 real hours at a 1 hour 30 minute day.
:::

:::facts
- **Body parts** 17 per character :cite[(`BodyDamage.java:132-148`)]
- **Health sync (multiplayer)** part health every 0.5 s, stats every 1 s, whole body every 2 s :cite[(`NetworkPlayerManager.java:16-18`)]
- **Infection, sandbox default** 2 to 3 game days, about 3 to 4.5 real hours at the 90-minute day :cite[(`BodyDamage.java:2097`, `SandboxOptions.java:413-420`)]
- **Cut or scratch infects** 25 percent and 7 percent chance, when Transmission is Blood and Saliva or Everyone's Infected :cite[(`BodyPart.java:795`, `BodyPart.java:840`, `BodyPart.java:807-810`)]
:::

## 1. What the body does

**You have 17 body parts, and each one can be wounded in several ways.** A part can be scratched, cut, deeply wounded, bitten, burnt or fractured, have glass or a bullet in it, bleed, and be bandaged, stitched, splinted or disinfected :cite[(`BodyPart.java:149-262`)].

Overall health falls when parts are hurt and when you starve, dehydrate, bleed or are poisoned, and it rises slowly when you are fed and resting :cite[(`BodyDamage.java:2190-2246`, `BodyDamage.java:2254-2316`)]. A zombie bite can carry the infection, which counts down to your death and your return as a zombie.

## 2. Where it lives

**The body is one `BodyDamage` object per character, holding 17 `BodyPart` objects.** The parts are added in the order below, and only players get a thermoregulator :cite[(`BodyDamage.java:132-148`, `BodyDamage.java:156-158`)].

| Piece | Where | What it holds | Code |
|---|---|---|---|
| `BodyDamage` | `zombie.characters.BodyDamage.BodyDamage`, one per character | The 17 parts, overall health, infection clock, cold, panic, food health, pain | `BodyDamage.java:132-158` |
| `BodyPart` | `zombie.characters.BodyDamage.BodyPart` | One part's health, wound flags and healing timers, bandage, stitches, splint, infection flags | `BodyPart.java:149-262` |
| `BodyPartType` | `zombie.characters.BodyDamage.BodyPartType` (enum) | The 17 parts plus `MAX`, with each part's damage and pain modifiers | `BodyPartType.java:20-202` |
| Stats | `zombie.characters.Stats` with `CharacterStat` | Pain, panic, poison, sickness, `ZOMBIE_INFECTION` and `ZOMBIE_FEVER` (each 0 to 100), temperature and the rest | `CharacterStat.java:40-41` |
| Temperature | `zombie.characters.BodyDamage.Thermoregulator` | Its own article: [body temperature and the thermoregulator](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator) | `BodyDamage.java:156-158` |

The parts in index order are: left and right hand, forearm and upper arm; upper torso, lower torso, head, neck, groin; left and right thigh, shin and foot :cite[(`BodyDamage.java:132-148`)].

## 3. One tick of the body

**`BodyDamage#Update` runs once per tick for players, and it is skipped for zombies and animals.** `IsoGameCharacter#updateInternal` calls it :cite[(`IsoGameCharacter.java:9223-9225`)], and the method returns at once for a zombie or an animal :cite[(`BodyDamage.java:2105`)].

On a multiplayer client it also returns at once for any living player, after resetting a non-local player's copy to full health :cite[(`BodyDamage.java:2106-2118`)]. So the list below runs in single player and on the server, not on a client. See [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work). In order, `Update`:

1. updates the thermoregulator, then corpse dragging, wetness, cold, boredom, strength, panic, temperature effects, discomfort and illness :cite[(`BodyDamage.java:2141-2153`)];
2. checks every part for infection and, the first time one is infected, marks the whole body infected and starts the infection clock :cite[(`BodyDamage.java:2155-2173`)];
3. adds health back from food and rest, at a rate that drops with the hunger, sickness and thirst moodles, and stops entirely at the worst hunger or thirst :cite[(`BodyDamage.java:2190-2246`)];
4. takes health away for poison, the worst hunger, the worst sickness, the worst bleeding, the worst thirst and a very heavy load, and fires the Lua event `OnPlayerGetDamage` for each with a type string :cite[(`BodyDamage.java:2254-2339`)];
5. works out pain from the parts :cite[(`BodyDamage.java:2342-2362`)];
6. moves the infection clock on (section 4) :cite[(`BodyDamage.java:2365-2392`)];
7. runs `BodyPart#DamageUpdate` on every part, which hurts unbandaged wounds, bleeds, and runs down each wound's healing timer :cite[(`BodyDamage.java:2396-2398`, `BodyPart.java:149-262`)];
8. recalculates overall health :cite[(`BodyDamage.java:2400`)].

The wound damage and timers are scaled by the tick multiplier, `GameTime#getMultiplier`, which depends on game speed and frame rate :cite[(`BodyPart.java:152-170`, `GameTime.java:970-989`)]. The multiplier sums to about 48 per real second at normal speed on a client at any frame rate, and on a dedicated server running 10 updates per second, per [how long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you). Fast-forward changes it.

So an unbandaged bite timer, which falls 0.000005 per unit, falls 0.00024 per real second, and a bite timer starting between 50 and 80 takes about 58 to 93 real hours to run out. A bandaged one falls 0.0001 per unit, 0.0048 per real second, about 2.9 to 4.6 hours. The other wound timers use the same 48 per second with their own steps :cite[(`BodyPart.java:197-203`, `BodyPart.java:699`)].

We did not trace how `CombatManager#applyDamage` scales the per-update damage, so the damage rates are not converted. The multiplier is not constant on a slow client, which is why the figures are for normal speed.

**Overall health is not stored, it is worked out.** `calculateOverallHealth` starts at 100 and subtracts, for each part, the damage on that part (100 minus its health) times that part's damage modifier, plus any damage from pills, capped at 100 :cite[(`BodyDamage.java:2444-2456`)]. A character counts as dead when that number reaches 0 :cite[(`IsoGameCharacter.java:4955-4957`)].

General damage such as starvation is spread over all 17 parts by `ReduceGeneralHealth`, divided by each part's modifier :cite[(`BodyDamage.java:1062-1072`)]. Healing goes only to the parts that are hurt, through `AddGeneralHealth` :cite[(`BodyDamage.java:1042-1060`)].

## 4. How infection works, structurally

**Infection lives at two levels, and mods trip over the difference.** Each part has its own flags, and the body has a flag, a start time and a duration of its own.

- **On a part:** `BodyPart` has `IsInfected` (the zombie virus) and `IsFakeInfected`, plus a separate wound infection (`isInfectedWound`, `woundInfectionLevel`) for dirty wounds that is not the virus :cite[(`BodyPart.java:51`, `BodyPart.java:1250`, `BodyPart.java:1309-1317`)].
- **A bite** marks the part infected unless the Zombie Lore **Transmission** option is "None" :cite[(`BodyPart.java:691-712`)].
- **A cut or scratch** rolls for it: 25 percent for a cut and 7 percent for a scratch :cite[(`BodyPart.java:795`, `BodyPart.java:840`, `BodyPart.java:800-805`)]. The roll is cleared when Transmission is "Saliva Only" or "None" :cite[(`BodyPart.java:807-810`)].
- **On the body:** each tick, if any part is infected and the body is not yet, the body becomes infected and the start time is set :cite[(`BodyDamage.java:2155-2173`)]. The duration is picked from the **Infection Mortality** option, and the Resilient trait lengthens it by 25 percent (times 1.25) while Prone to Illness shortens it by 25 percent (times 0.75) :cite[(`BodyDamage.java:2083-2099`)].

The start time and the clock are in game hours: for a player, the hours that player has survived, and for any other character, the world age :cite[(`BodyDamage.java:2634-2636`, `IsoPlayer.java:7857-7860`, `IsoGameCharacter.java:9503-9505`)].

From then on, each tick sets the `ZOMBIE_INFECTION` stat to the share of the duration that has passed (0 to 100). It also holds overall health below a ceiling of 100 times (1 minus the fourth power of that share). When the share reaches 1, `ReduceGeneralHealth(110)` kills the player :cite[(`BodyDamage.java:2372-2392`)]. Mortality "Instant" does that on the first tick :cite[(`BodyDamage.java:2366-2371`)].

| Infection Mortality | Game time (code) | Real time at the 90-minute day | Code |
|---|---|---|---|
| Instant | 0 | 0 | `BodyDamage.java:2093` |
| 0-30 Seconds | 0 to 30 seconds | 0 to 1.9 seconds | `BodyDamage.java:2094` |
| 0-1 Minutes | 0.5 to 1 minute | 1.9 to 3.75 seconds | `BodyDamage.java:2095` |
| 0-12 Hours | 3 to 12 hours | 11 to 45 minutes | `BodyDamage.java:2096` |
| 2-3 Days | 48 to 72 hours | 3 to 4.5 hours | `BodyDamage.java:2097` |
| 1-2 Weeks | 168 to 336 hours | 10.5 to 21 hours | `BodyDamage.java:2098` |
| Never | no infection clock | no infection clock | `BodyDamage.java:2099` |

The real-time column is our arithmetic: a day of 90 minutes makes one game hour 3.75 real minutes. The 90-minute day is the Java default and the setting of four of the five presets, while Six Months Later uses a 1-hour day :cite[(`SandboxOptions.java:71`, `SandboxOptions.java:413-420`, `Apocalypse.lua:8`, `SixMonthsLater.lua:5`)].

**The sandbox default is two facts.** The Java default is Transmission "Blood and Saliva" and Mortality "2-3 Days" :cite[(`SandboxOptions.java:2101-2102`)]. Every preset file (Apocalypse, Extinction, Outbreak, Rising, Six Months Later) sets the same two values, and `SandboxVars.lua` sets neither :cite[(`Apocalypse.lua:199-200`, `SixMonthsLater.lua:107-108`)].

With Infection Mortality set to **Never**, an infection is turned into a fake one as it happens. The part gets `IsFakeInfected` instead of `IsInfected` :cite[(`BodyPart.java:713-716`, `BodyPart.java:739-742`, `BodyPart.java:811-813`)]. The `ZOMBIE_FEVER` stat climbs to its maximum and then falls back, and when it reaches zero the parts are cleared :cite[(`BodyDamage.java:2183-2189`, `BodyDamage.java:2412-2433`)].

In the engine, that setting is the only gameplay path that sets a fake infection to true. The public setters and the save loader can also set it, and vanilla Lua only ever clears it, apart from a debug toggle :cite[(`BodyPart.java:572`, `BodyPart.java:1587`, `BodyDamage.java:2652`, `ISHealthPanel.lua:224`, `ISStatsAndBody.lua:106`)].

The chances and the real durations are a gameplay question, answered on [how infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works).

## 5. Which side runs the body

**In single player the body runs in your game. In multiplayer the server runs it and sends the results down.**

On a client, `BodyDamage#Update` returns at once for any living player :cite[(`BodyDamage.java:2106-2118`)]. The server loop sends these packets to each fully connected player :cite[(`GameServer.java:1213`, `NetworkPlayerManager.java:25-47`, `NetworkPlayerAI.java:741-783`)]:

| What | Packet | How often | Code |
|---|---|---|---|
| Each part's health | `PlayerHealth` | every 0.5 seconds | `NetworkPlayerManager.java:18`, `NetworkPlayerAI.java:775-781` |
| Stats (and XP) | `PlayerStats`, `PlayerEffects`, `PlayerXp` | every second | `NetworkPlayerManager.java:17`, `NetworkPlayerAI.java:754-773` |
| The whole body (every wound, timer, infection clock and the thermoregulator) | `PlayerDamage`, `PlayerInjuries` | every 2 seconds | `NetworkPlayerManager.java:16`, `NetworkPlayerAI.java:741-752` |

`PlayerDamage` carries the complete `BodyDamage#save` output, and the client loads it over its own copy :cite[(`PlayerDamagePacket.java:38-65`, `BodyDamage.java:303-307`)]. Whatever a client-side mod writes into the body is replaced within two seconds.

**Zombie bites reach the body through the server in multiplayer.** The hit packet carries a `Bite` field, and the server applies it with `AddRandomDamageFromZombie` :cite[(`Bite.java:96-97`)]. The zombie attack state calls the same method directly, and also runs `Update` right after :cite[(`AttackState.java:244-246`)]. We did not check which side runs that state for a zombie a client owns, so treat that path as not verified.

**One more path in 42.22: a doctor can look at another player's body.** The patient gets a request and answers yes or no, with `acceptMedicalCheck` or `rejectMedicalCheck` :cite[(`ISHealthPanel.lua:1940-1957`, `LuaManager.java:9638-9645`)]. The doctor's client then asks the server for updates, and the server sends that player's body changes until the doctor stops :cite[(`ISMedicalCheckAction.lua:72-74`, `IsoPlayer.java:6666-6677`, `BodyDamageUpdatePacket.java:118-125`, `BodyDamageSync.java:79-113`)]. Otherwise your copy of another player is not kept up to date.

## 6. What Lua can reach

**Lua reaches the body through `player:getBodyDamage()` and the parts it holds.**

- **The body:** [BodyDamage](/pz/build-42/modding/reference/lua-classes-characters-1#bodydamage) gives `getBodyPart(BodyPartType.Hand_L)`, `getBodyParts()`, `getHealth()`, `isInfected()`, `setInfected`, `getInfectionTime`, `setInfectionTime`, `getInfectionMortalityDuration`, `RestoreToFullHealth`, `ReduceGeneralHealth`, `AddGeneralHealth`, and the per-part setters by index.
- **A part:** [BodyPart](/pz/build-42/modding/reference/lua-classes-characters-1#bodypart) gives `getHealth`, `SetHealth`, `AddDamage`, `SetBitten`, `SetInfected`, `SetFakeInfected`, `setCut`, `setScratched`, `setBandaged`, `setStitched`, `setFractureTime`, `bleeding`, `bitten`, and the rest.
- **Sending a change from the server:** the global `syncBodyPart(bodyPart, flags)` sends chosen fields of one part to its player at once, and `syncPlayerStats(player, flags)` does the same for stats. Both do nothing anywhere but on the server :cite[(`LuaManager.java:11883-11901`)]; see [global functions, S](/pz/build-42/modding/reference/lua-global-functions#s). The flags are bit masks from `BodyPartSyncPacket` (`BD_Health` is 1, `BD_bandaged` 2, `BD_bitten` 4, `BD_bleeding` 8 and so on) :cite[(`BodyPartSyncPacket.java:30-47`)]. Vanilla's bandage action sends `0xc001966b8e`, and its debug command sends `0xFFFFFFFFFFF` for everything :cite[(`ISApplyBandage.lua:148`, `ClientCommands.lua:635`)].
- **The event:** `OnPlayerGetDamage(character, type, amount)` :cite[(`LuaEventManager.java:836`)]. The body fires `POISON`, `HUNGRY`, `SICK`, `BLEEDING`, `THIRST`, `HEAVYLOAD` and `INFECTION` :cite[(`BodyDamage.java:2317-2339`, `BodyDamage.java:2369`)]. Each wounded part also fires `BLEEDING` :cite[(`BodyPart.java:175`)]. Other code fires `FALLDOWN`, `FIRE`, `WEAPONHIT`, `CARHITDAMAGE`, `CARCRASHDAMAGE` and `LOWWEIGHT` :cite[(`IsoGameCharacter.java:2521`, `IsoGameCharacter.java:5984`, `IsoGameCharacter.java:6128`, `IsoPlayer.java:2005`, `BaseVehicle.java:9509`, `Nutrition.java:342`)]. See the [events reference](/pz/build-42/modding/reference/lua-events#onplayergetdamage).
- **Sandbox options:** Zombie Lore Transmission and Infection Mortality, Injury Severity (it scales wound healing times), the wound infection factor, and bone fracture :cite[(`BodyPart.java:784`, `BodyDamage.java:2284`, `BodyPart.java:916`)].

## 7. What a mod can and cannot change, and the traps

**A mod can change the body, but the infection flag, the sides and one bite quirk catch people out.**

- **`SetBitten(false)` infects the player.** `BodyPart#SetBitten(boolean)` sets the part infected *after* the `if (bitten)` block, so it runs for `false` too, whenever Transmission is not "None" :cite[(`BodyPart.java:691-712`)]. Vanilla's own debug toggle calls `SetBitten(false)` and then `SetInfected(false)` and `SetFakeInfected(false)` straight after, and so should you :cite[(`ClientCommands.lua:529-531`, `ISHealthPanel.lua:222-224`)].
- **Curing a part does not cure the body.** Once the body is infected, only `setInfected(false)` or `RestoreToFullHealth` clears the body's own flag, and no other Java or vanilla Lua caller does :cite[(`BodyDamage.java:1817`, `BodyDamage.java:2614-2616`)]. To cure: clear `SetInfected(false)` on every part, then `setInfected(false)` and `setInfectionTime(-1)` on the body, then reset the `ZOMBIE_INFECTION` stat. Miss a part and the body re-infects on the next tick :cite[(`BodyDamage.java:2155-2160`)]. Saving does not write the body flag, so it comes back from the parts on load :cite[(`BodyDamage.java:180-340`)].
- **In multiplayer, change the body on the server.** Do it in a timed action's `complete()` (which runs on the server) or a server command handler, then call `syncBodyPart` so the player sees it now rather than in up to two seconds. A change made on the client is overwritten by the next `PlayerDamage` packet :cite[(`PlayerDamagePacket.java:38-65`)].
- **A zombie's bite fires no damage event of its own.** `AddRandomDamageFromZombie` fires none :cite[(`BodyDamage.java:1258-1616`)]. You see the bite later as `BLEEDING` and, if it infected, `INFECTION`. Watch the parts (`bitten()`) if you need the moment itself.

:::callout[How we know]{kind=proof}
All of this is read from the 42.22 code. We have not logged these intervals on a dedicated server.

The test: a server-side Lua `OnPlayerGetDamage` handler writing to the server log while a player stands in the rain starving, and a client-side handler doing the same. By the code, only the server's fires. Not tested.

The real-time column of the mortality table is our arithmetic from the code values and the 90-minute day, not a measurement. Which side runs a zombie's attack state in multiplayer is not verified.
:::

## 8. Where to go next

- [Body temperature and the thermoregulator](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator): the other half of `BodyDamage#Update`.
- [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).
- [The BodyDamage and BodyPart reference entries](/pz/build-42/modding/reference/lua-classes-characters-1#bodydamage).
