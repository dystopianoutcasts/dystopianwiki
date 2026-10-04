---
id: build-42-outcast-husbandry-multiplayer
slug: outcast-husbandry-multiplayer
title: Outcast Husbandry -- multiplayer
game: pz
version: build-42
section: outcast-mods
category: outcast-husbandry
difficulty: intermediate
tags:
  - outcast-husbandry
  - multiplayer
  - animals
excerpt: >-
  Engine citations refer to our decompile of the Build 42 engine, revision
  a2947723ca.
last_updated: '2026-10-04'
---
# Outcast Husbandry -- multiplayer

> Source: OutcastHusbandry/docs/MULTIPLAYER.md (compiled 2026-09-24, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Engine citations refer to our decompile of the Build 42 engine, revision
`a2947723ca`.

## Where the code runs

Everything lives under `media/lua/server/`. That folder name does **not** keep the
code off clients: Build 42 loads `server/` on a connected client too, at world
load. The folder sets *when* code loads, not which side runs it (see
[Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders)).
The server owns the animal simulation and is the only party that writes anything.

> **Proof:** Code. `zombie.gameStates.GameLoadingState` calls `LuaManager.LoadDirBase("server")` with no `GameClient.client` guard. Build 42.20 (revision a2947723ca).

What keeps the simulation off a client is `OH_Main.ownsSimulation()`, which
refuses to run when `isClient()` is true. That is false in singleplayer and false
on a dedicated server, and true only on a connected client -- exactly the set to
exclude. It is the guard that matters, both on a connected client and on a
**co-op host**, which runs both halves in one process and is the one
configuration where an unguarded pass could act on slave copies.

## The event trap

This mod needs two boot events, and registering only the obvious one is a silent
failure on the exact deployment it was written for.

| Event | Triggered from | Fires on |
|---|---|---|
| `OnGameStart` | `IngameState.java:768` | singleplayer, co-op host |
| `OnServerStarted` | `GameServer.java:1522` | dedicated server only |

A dedicated server never enters `IngameState`, so **`OnGameStart` never fires
there**. A mod registering only `OnGameStart` boots clean, logs nothing, and does
nothing. Both are registered, behind a `booted` latch for the host that raises
both.

`EveryTenMinutes` is driven by `GameTime.java:656`, which ticks on a dedicated
server as well as a client, so the recurring pass needs no special handling.

## What replicates, and what does not

**Health does.** `AnimalPacket` carries `health` as a byte (`:72`, written `:175`,
read `:251`), and `IsoAnimal.setHealth` pushes an extra update to relevant
connections when an animal hits zero (`:1190`). The floor is therefore
authoritative and visible to clients.

**Hunger and thirst do not.** There is no `CharacterStat.HUNGER` or `THIRST` field
in any animal packet. A client's `IsoAnimal` is a slave copy whose hunger the
server never sends.

This is **vanilla behaviour, not something this mod introduces**, and it matters
only for display: the animal info tooltip is rendered Java-side from
`getHungerTxt` / `getThirstTxt` (`IsoAnimal.java:2095-2117`), which have no Lua
callers at all. A client may therefore show a stale hunger word.

Nothing about the mod's correctness depends on it. Death, health, production and
every decision this mod makes are evaluated on the server against the server's
own stats, which are the ones we write.

## Save data

**None.** The mod writes no `ModData` and no save state of its own. The neglect
rate lives in the animal definitions, which the engine rebuilds from the Lua
table at every boot, so there is nothing to migrate and nothing to corrupt.

Removing the mod restores vanilla rates on the next start.

## Testing checklist for a dedicated server

1. **Boot.** The server console must print, in this order:
   ```
   [OutcastHusbandry] ready -- neglect rate 0.15x on N definitions, health floor 0.15
   [OutcastHusbandry] weakest protected animal is cow: about 1120 in-game hours ...
   ```
   Absence of the first line means neither boot event fired and the mod is inert.
   `SELF TEST FAILED`, `NOT PROTECTED` or `PARTIAL` each name the step that did
   not happen; `PARTIAL` specifically means the definitions were written but the
   engine refused to rebuild from them.

2. **The rate actually landed.** The boot line reports what was written to the
   Lua table, which is not proof the engine adopted it -- Lua cannot read the
   Java side back. The observable check is in game: a freshly spawned animal
   should take visibly longer to reach Thirsty than a vanilla server.

   Note that animals already instantiated when the rebuild ran keep vanilla
   rates until their chunk streams again, so test with a newly loaded pen rather
   than one you were standing in at boot.

3. **The real test.** Zone a pen with a hen and a cow, leave the trough empty,
   let the server run unattended past the vanilla death window, then return.
   Expected: both alive, both reading Starving and Dying of thirst, health at or
   near 0.15, no eggs and no milk. Refill the trough and health should climb
   back on its own without further intervention.

   **Window on `servertest`, at the 0.15 default.** `DayLength = 4` is
   "1 Hour, 30 Minutes", so an in-game day costs 1.5 real hours. A cow should now
   survive about **2.9 real days** unattended rather than 1.1, and a hen about
   14 days. Cows are the limiting animal, so test with a cow.

   `AnimalMetaStatsModifier = 4` is the 1.0x setting, so there is no vanilla
   buffer softening the result. `AnimalMetaPredator` is `false` -- leave it, it
   kills during the burst by a path this mod does not cover and would confound
   the result.

   To see a result sooner, set the neglect rate to 1.00 (vanilla) and confirm
   the old ~26 hour window returns. That is a faster proof the option is wired
   than waiting out the protected case.

4. **Nothing else changed.** Confirm an animal can still be killed by a weapon
   and butchered normally while starving -- the floor must not make a neglected
   animal unkillable.

---

*Corrected 2026-10-04: media/lua/server/ loads on a multiplayer client too, at world load; the folder sets when code loads, not which side runs it.*
