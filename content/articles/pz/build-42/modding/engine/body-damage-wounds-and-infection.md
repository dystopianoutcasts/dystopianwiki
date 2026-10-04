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
  Seventeen body parts, one overall health number worked out from them, and an
  infection clock. In Build 42 multiplayer the whole body runs on the server and
  reaches your client in packets every half second to two seconds. How it fits
  together, what Lua can change, and the call that infects the player when you
  meant to heal a bite.
last_updated: '2026-10-04'
related_articles:
  - body-temperature-and-the-thermoregulator
  - what-runs-on-the-server-in-build-42-multiplayer
  - lua-classes-characters-1
  - lua-events
---
# Body damage, wounds and infection: how the body is simulated

Outcast, the health panel looks like a picture of a body with some numbers on it. Underneath it is a small simulation that ticks every frame: wounds bleed and heal on their own clocks, the overall health number is worked out from the parts, an infection counts down to death. And in Build 42 multiplayer, none of it runs on your own computer. This page is the map of that simulation for modders, read from the 42.21 code.

## What it does for the player

You have seventeen body parts. Each one can be scratched, cut (a laceration), deeply wounded, bitten, burnt, fractured, have glass or a bullet in it, bleed, and be bandaged, stitched, splinted or disinfected. Your overall health falls when parts are hurt and when you starve, dehydrate, bleed or are poisoned, and rises slowly when you are fed and resting. A zombie bite can carry the infection, which counts down to your death and your return as one of them.

## Where it lives

| Piece | Where | What it holds |
|---|---|---|
| `BodyDamage` | `zombie.characters.BodyDamage.BodyDamage`, one per character | The 17 parts, overall health, infection clock, cold, panic, food health, pain bookkeeping |
| `BodyPart` | `zombie.characters.BodyDamage.BodyPart` | One part's health, every wound flag and its healing timer, bandage, stitches, splint, infection flags |
| `BodyPartType` | `zombie.characters.BodyDamage.BodyPartType` (enum) | `Hand_L` ... `Foot_R`, with the per-part modifiers for damage, pain and bleeding |
| Stats | `zombie.characters.Stats` with `CharacterStat` | Pain, panic, poison, sickness, `ZOMBIE_INFECTION`, `ZOMBIE_FEVER`, temperature and the rest, each clamped to its own range |
| Moodles | `zombie.characters.Moodles.Moodles` | What the player sees: levels worked out from the stats |
| Temperature | `zombie.characters.BodyDamage.Thermoregulator` | Its own article: [body temperature and the thermoregulator](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator) |

The parts, in their index order: left and right hand, forearm, upper arm; upper torso, lower torso, head, neck, groin; left and right thigh, shin, foot.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage` constructor (adds the 17 parts in that order, then a `Thermoregulator` for players only), `zombie.characters.BodyDamage.BodyPartType` (17 values plus `MAX`), `zombie.characters.CharacterStat` (each stat registered with a minimum, maximum and default; `Stats#set` clamps). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## One tick of the body

`IsoGameCharacter#updateInternal` calls `BodyDamage#Update` once per tick for players (zombies and animals return straight away). In order, it:

1. updates the thermoregulator, then wetness, cold, boredom, strength, panic, temperature effects, discomfort and illness;
2. checks every part for infection and, the first time one is infected, marks the whole body infected and starts the infection clock;
3. adds health back from food and rest, at a rate that drops with the hunger, sickness and thirst moodles, and stops entirely at the worst hunger or thirst;
4. takes health away for poison, the worst hunger, the worst sickness, the worst bleeding, the worst thirst and a very heavy load, firing the Lua event `OnPlayerGetDamage` for each with a type string;
5. works out pain from the parts;
6. moves the infection clock on (below);
7. runs `BodyPart#DamageUpdate` on every part, which hurts unbandaged wounds, bleeds, and runs down each wound's healing timer;
8. recalculates overall health.

**Overall health is not stored, it is worked out.** `BodyDamage#calculateOverallHealth` starts at 100 and subtracts, for each part, the damage on that part (100 minus its health) times that part's damage modifier, plus any damage from pills, capped at 100. `IsoGameCharacter#isDead` is true when that number reaches 0. So "general" damage like starvation is spread over the parts by `ReduceGeneralHealth`, and healing goes only to the parts that are hurt (`AddGeneralHealth`).

> **Proof:** Code. `zombie.characters.IsoGameCharacter#updateInternal` (`getBodyDamage().Update()` under `SystemDisabler.doCharacterStats`); `zombie.characters.BodyDamage.BodyDamage#Update` (the order above; `OnPlayerGetDamage` with `POISON`, `HUNGRY`, `SICK`, `BLEEDING`, `THIRST`, `HEAVYLOAD`, `INFECTION`), `#calculateOverallHealth`, `#ReduceGeneralHealth` (split over all parts, divided by each part's damage modifier), `#AddGeneralHealth` (split over hurt parts only); `zombie.characters.BodyDamage.BodyPart#DamageUpdate`; `zombie.characters.IsoGameCharacter#isDead` (`getBodyDamage().getHealth() <= 0.0F`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How infection works, structurally

Infection lives at two levels, and mods trip over the difference:

- **On a part:** `BodyPart` has `IsInfected` (the zombie virus) and `IsFakeInfected`, plus a separate *wound* infection (`isInfectedWound`, `woundInfectionLevel`) for dirty wounds that is not the virus. A bite marks the part infected unless the sandbox Zombie Lore **Transmission** is set to none; lacerations and scratches roll for it.
- **On the body:** `BodyDamage` has its own `isInfected` flag, an infection start time and a mortality duration. Each tick, if any part is infected and the body is not yet, the body becomes infected, the start time is set (for a player, in hours survived), and the duration is picked from the sandbox **Infection Mortality** setting and the Resilient and Prone to Illness traits.

From then on, each tick sets the `ZOMBIE_INFECTION` stat to the share of the duration that has passed (0 to 100), and holds overall health below a ceiling that falls slowly at first and fast at the end (100 times one minus the fourth power of that share). When the share reaches 1, `ReduceGeneralHealth(110)` kills the player. Mortality "Instant" does that on the first tick.

With Infection Mortality set to **Never**, an infection is turned into a fake one as it happens: the part gets `IsFakeInfected` instead of `IsInfected`, the `ZOMBIE_FEVER` stat climbs to its maximum and then falls back, and when it reaches zero the parts are cleared. That sandbox setting is the only place in the 42.21 code that makes a fake infection.

The chances (how likely a bite, laceration or scratch is to infect, what clothing does) and the actual durations are a gameplay question, answered on [how infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works).

> **Proof:** Code. `zombie.characters.BodyDamage.BodyPart#SetBitten(boolean)` (`transmission != 4` sets `isInfected`; mortality 7 turns it into `isFakeInfected`), `#generateZombieInfection`, `#setCut`, `#setScratched`; `zombie.characters.BodyDamage.BodyDamage#Update` (body-level `setInfected(true)`, `setInfectionTime(getCurrentTimeForInfection())`, `pickMortalityDuration()`; `ZOMBIE_INFECTION` set to `share * 100`; ceiling `(1 - share^4) * 100`; `ReduceGeneralHealth(110.0F)` at share 1 or when mortality is 1; the `ZOMBIE_FEVER` rise and fall), `#getCurrentTimeForInfection` (`getHoursSurvived` for a player), `#pickMortalityDuration` (Resilient 1.25, Prone to Illness 0.75). The only writes of `isFakeInfected = true` are in `BodyPart`, each under `mortality == 7`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs, and on which side

**Single player:** all of the above runs in your game.

**Multiplayer: the body runs on the server.** `BodyDamage#Update` begins with a guard: on a client, for any living player, it returns at once (for a player who is not local, it first resets that local copy to full health). The server runs the real simulation for every connected player and sends the results down to that player:

| What | Packet | How often |
|---|---|---|
| Each part's health | `PlayerHealth` | every 0.5 seconds |
| Stats (and XP) | `PlayerStats`, `PlayerEffects`, `PlayerXp` | every second |
| The whole body (every wound, timer, infection clock and the thermoregulator) | `PlayerDamage`, `PlayerInjuries` | every 2 seconds |

`PlayerDamage` carries the complete `BodyDamage#save` output, and the client loads it over its own copy. Whatever a client-side mod writes into the body is replaced within two seconds.

Zombie bites follow the same rule: the zombie's owner sends the hit (a `Bite` field in the hit packet, with the body part and the scratch and laceration flags), and the server applies it with `BodyDamage#AddRandomDamageFromZombie`.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#Update` (first block: `if (GameClient.client)`, living player, `RestoreToFullHealth()` when not local, then `return`); `zombie.network.NetworkPlayerManager#update` (`damageUpdateLimit` 2000 ms, `statsUpdateLimit` 1000 ms, `healthUpdateLimit` 500 ms); `zombie.characters.NetworkPlayerAI#syncDamage` (`PlayerInjuries`, `PlayerDamage`), `#syncStats` (`PlayerStats`, `PlayerEffects`), `#syncXp`, `#syncHealth` (`PlayerHealth`), each guarded by `GameServer.server`; `zombie.network.packets.character.PlayerDamagePacket#write` (`getBodyDamage().save`) and `#parse` (`getBodyDamage().load`); `zombie.characters.BodyDamage.BodyDamage#save` (writes the thermoregulator too); `zombie.network.fields.hit.Bite` (`GameServer.server` calls `AddRandomDamageFromZombie`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Read from the code; we have not yet logged these intervals on a dedicated server. The test: a server-side Lua `OnPlayerGetDamage` handler writing to the server log while a player stands in the rain starving, and a client-side handler doing the same; by the code, only the server's fires.

> **Proof:** Unknown. "Only the server fires the body's `OnPlayerGetDamage`" is read from the guard in `BodyDamage#Update`; no server log yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- **The body:** `player:getBodyDamage()` gives [BodyDamage](/pz/build-42/modding/reference/lua-classes-characters-1#bodydamage): `getBodyPart(BodyPartType.Hand_L)`, `getBodyParts()`, `getHealth()`, `isInfected()`, `setInfected`, `getInfectionTime`, `setInfectionTime`, `getInfectionMortalityDuration`, `RestoreToFullHealth`, `ReduceGeneralHealth`, `AddGeneralHealth`, and the per-part setters by index.
- **A part:** [BodyPart](/pz/build-42/modding/reference/lua-classes-characters-1#bodypart): `getHealth`, `SetHealth`, `AddDamage`, `SetBitten`, `SetInfected`, `SetFakeInfected`, `setCut`, `setScratched`, `setBandaged`, `setStitched`, `setFractureTime`, `bleeding`, `bitten`, and the rest.
- **Sending a change from the server:** the global `syncBodyPart(bodyPart, flags)` sends chosen fields of one part to its player at once, and `syncPlayerStats(player, flags)` does the same for stats; both do nothing anywhere but on the server ([global functions, S](/pz/build-42/modding/reference/lua-global-functions#s)). The flags are bit masks from `BodyPartSyncPacket` (`BD_Health` is 1, `BD_bandaged` 2, `BD_bitten` 4, `BD_bleeding` 8 and so on); vanilla's bandage action sends `0xc001966b8e`, and its debug command sends `0xFFFFFFFFFFF` for everything.
- **The event:** `OnPlayerGetDamage(character, type, amount)`. The body fires `POISON`, `HUNGRY`, `SICK`, `BLEEDING`, `THIRST`, `HEAVYLOAD` and `INFECTION`; other code fires `FALLDOWN`, `FIRE`, `WEAPONHIT`, `CARHITDAMAGE`, `CARCRASHDAMAGE` and `LOWWEIGHT` ([events reference](/pz/build-42/modding/reference/lua-events#onplayergetdamage)).
- **Sandbox options:** Zombie Lore Transmission and Infection Mortality, plus the injury, bone fracture and wound infection options.

## What a mod can and cannot change, and the traps

- **`SetBitten(false)` infects the player.** `BodyPart#SetBitten(boolean)` sets the part infected *after* the `if (bitten)` block, so it runs for `false` too, whenever Transmission is not "none". Vanilla's own debug toggle calls `SetBitten(false)` and then `SetInfected(false)` and `SetFakeInfected(false)` straight after, and so should you.
- **Curing a part does not cure the body.** Once the body is infected, nothing clears `BodyDamage`'s own flag except `setInfected(false)` or `RestoreToFullHealth`. To cure: clear `SetInfected(false)` on every part, then `setInfected(false)` and `setInfectionTime(-1)` on the body, then reset the `ZOMBIE_INFECTION` stat. Miss a part and the body re-infects on the next tick.
- **In multiplayer, change the body on the server.** Do it in a timed action's `complete()` (which runs on the server) or a server command handler, then call `syncBodyPart` so the player sees it now rather than in up to two seconds. A change made on the client is overwritten by the next `PlayerDamage` packet.
- **A zombie's bite fires no damage event of its own.** `AddRandomDamageFromZombie` fires nothing; you see the bite later as `BLEEDING` and, if it infected, `INFECTION`. Watch the parts (`bitten()`) if you need the moment itself.
- **Another player's body on your client is not theirs.** Only the doctor's health panel asks the server for another player's body (`startReceivingBodyDamageUpdates`); otherwise your copy of them is not kept up to date.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyPart#SetBitten(boolean)` (bytecode: `ifeq` jumps past the bitten block to the `transmission != 4` check that sets `isInfected`); `media/lua/server/ClientCommands.lua` and `media/lua/client/XpSystem/ISUI/ISHealthPanel.lua` (`SetBitten(false)`, `SetInfected(false)`, `SetFakeInfected(false)`); `zombie.characters.BodyDamage.BodyDamage#Update` (the body flag is only ever set there), `#RestoreToFullHealth`, `#save` (does not write the body flag; it comes back from the parts); `zombie.Lua.LuaManager` `syncBodyPart` and `syncPlayerStats` (both `if (GameServer.server ...)`); `zombie.network.packets.BodyPartSyncPacket` (the `BD_*` masks); `media/lua/shared/TimedActions/ISApplyBandage.lua` (`syncBodyPart(self.bodyPart, 0xc001966b8e)`); `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (no `triggerEvent`); `zombie.characters.IsoPlayer#startReceivingBodyDamageUpdates`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Body temperature and the thermoregulator](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator): the other half of `BodyDamage#Update`.
- [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).
- [The BodyDamage and BodyPart reference entries](/pz/build-42/modding/reference/lua-classes-characters-1#bodydamage).
